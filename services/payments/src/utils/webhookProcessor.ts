import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import { getStripeService } from './stripe';

export class WebhookProcessor {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async processWebhookEvent(event: Stripe.Event): Promise<void> {
    // Check if event was already processed
    const existingEvent = await this.getWebhookEvent(event.id);
    if (existingEvent && existingEvent.processed) {
      this.fastify.log.info(`Event ${event.id} already processed, skipping`);
      return;
    }

    // Store the event
    await this.storeWebhookEvent(event);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentIntentCanceled(event);
          break;

        case 'payment_intent.requires_action':
          await this.handlePaymentIntentRequiresAction(event);
          break;

        case 'customer.created':
          await this.handleCustomerCreated(event);
          break;

        case 'customer.updated':
          await this.handleCustomerUpdated(event);
          break;

        case 'customer.deleted':
          await this.handleCustomerDeleted(event);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event);
          break;

        case 'customer.subscription.trial_will_end':
          await this.handleSubscriptionTrialWillEnd(event);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event);
          break;

        default:
          this.fastify.log.warn(`Unhandled webhook event type: ${event.type}`);
      }

      // Mark event as processed
      await this.markEventAsProcessed(event.id);
    } catch (error) {
      this.fastify.log.error(`Error processing webhook event ${event.id}:`, error);
      throw error;
    }
  }

  private async handlePaymentIntentSucceeded(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    await this.fastify.pg.query(
      `UPDATE payment_intents
       SET status = $1, updated_at = NOW()
       WHERE stripe_payment_intent_id = $2`,
      ['succeeded', paymentIntent.id]
    );

    this.fastify.log.info(`Payment intent ${paymentIntent.id} succeeded`);
  }

  private async handlePaymentIntentFailed(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    await this.fastify.pg.query(
      `UPDATE payment_intents
       SET status = $1, updated_at = NOW()
       WHERE stripe_payment_intent_id = $2`,
      ['payment_failed', paymentIntent.id]
    );

    this.fastify.log.info(`Payment intent ${paymentIntent.id} failed`);
  }

  private async handlePaymentIntentCanceled(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    await this.fastify.pg.query(
      `UPDATE payment_intents
       SET status = $1, updated_at = NOW()
       WHERE stripe_payment_intent_id = $2`,
      ['canceled', paymentIntent.id]
    );

    this.fastify.log.info(`Payment intent ${paymentIntent.id} canceled`);
  }

  private async handlePaymentIntentRequiresAction(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    await this.fastify.pg.query(
      `UPDATE payment_intents
       SET status = $1, updated_at = NOW()
       WHERE stripe_payment_intent_id = $2`,
      ['requires_action', paymentIntent.id]
    );

    this.fastify.log.info(`Payment intent ${paymentIntent.id} requires action`);
  }

  private async handleCustomerCreated(event: Stripe.Event): Promise<void> {
    const customer = event.data.object as Stripe.Customer;

    // Check if customer already exists in our database
    const existingCustomer = await this.fastify.pg.query(
      'SELECT id FROM customers WHERE stripe_customer_id = $1',
      [customer.id]
    );

    if (existingCustomer.rows.length === 0) {
      await this.fastify.pg.query(
        `INSERT INTO customers (stripe_customer_id, email, name, metadata)
         VALUES ($1, $2, $3, $4)`,
        [customer.id, customer.email, customer.name, customer.metadata || {}]
      );
    }

    this.fastify.log.info(`Customer ${customer.id} created`);
  }

  private async handleCustomerUpdated(event: Stripe.Event): Promise<void> {
    const customer = event.data.object as Stripe.Customer;

    await this.fastify.pg.query(
      `UPDATE customers
       SET email = $1, name = $2, metadata = $3, updated_at = NOW()
       WHERE stripe_customer_id = $4`,
      [customer.email, customer.name, customer.metadata || {}, customer.id]
    );

    this.fastify.log.info(`Customer ${customer.id} updated`);
  }

  private async handleCustomerDeleted(event: Stripe.Event): Promise<void> {
    const customer = event.data.object as Stripe.DeletedCustomer;

    // Soft delete - mark as deleted but keep the record
    await this.fastify.pg.query(
      `UPDATE customers
       SET metadata = jsonb_set(metadata, '{deleted}', 'true'), updated_at = NOW()
       WHERE stripe_customer_id = $1`,
      [customer.id]
    );

    this.fastify.log.info(`Customer ${customer.id} deleted`);
  }

  private async handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;

    // Get customer from our database
    const customerResult = await this.fastify.pg.query(
      'SELECT id FROM customers WHERE stripe_customer_id = $1',
      [subscription.customer as string]
    );

    if (customerResult.rows.length > 0) {
      const customerId = customerResult.rows[0].id;

      await this.fastify.pg.query(
        `INSERT INTO subscriptions
         (stripe_subscription_id, customer_id, status, current_period_start,
          current_period_end, plan_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (stripe_subscription_id) DO UPDATE SET
           status = EXCLUDED.status,
           current_period_start = EXCLUDED.current_period_start,
           current_period_end = EXCLUDED.current_period_end,
           plan_id = EXCLUDED.plan_id,
           metadata = EXCLUDED.metadata,
           updated_at = NOW()`,
        [
          subscription.id,
          customerId,
          subscription.status,
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000),
          subscription.items.data[0]?.price?.id || '',
          subscription.metadata || {}
        ]
      );
    }

    this.fastify.log.info(`Subscription ${subscription.id} created`);
  }

  private async handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;

    await this.fastify.pg.query(
      `UPDATE subscriptions
       SET status = $1, current_period_start = $2, current_period_end = $3,
           plan_id = $4, metadata = $5, updated_at = NOW()
       WHERE stripe_subscription_id = $6`,
      [
        subscription.status,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.items.data[0]?.price?.id || '',
        subscription.metadata || {},
        subscription.id
      ]
    );

    this.fastify.log.info(`Subscription ${subscription.id} updated`);
  }

  private async handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;

    await this.fastify.pg.query(
      `UPDATE subscriptions
       SET status = 'canceled', updated_at = NOW()
       WHERE stripe_subscription_id = $1`,
      [subscription.id]
    );

    this.fastify.log.info(`Subscription ${subscription.id} deleted`);
  }

  private async handleSubscriptionTrialWillEnd(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;

    this.fastify.log.info(`Subscription ${subscription.id} trial will end`);
    // Here you could send notifications to the customer
  }

  private async handleInvoicePaymentSucceeded(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;

    this.fastify.log.info(`Invoice ${invoice.id} payment succeeded`);
    // Update subscription payment status if needed
  }

  private async handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;

    this.fastify.log.info(`Invoice ${invoice.id} payment failed`);
    // Handle failed payment - notify customer, update subscription status, etc.
  }

  private async storeWebhookEvent(event: Stripe.Event): Promise<void> {
    await this.fastify.pg.query(
      `INSERT INTO webhook_events (stripe_event_id, event_type, data)
       VALUES ($1, $2, $3)
       ON CONFLICT (stripe_event_id) DO NOTHING`,
      [event.id, event.type, JSON.stringify(event.data)]
    );
  }

  private async getWebhookEvent(eventId: string): Promise<{ processed: boolean } | null> {
    const result = await this.fastify.pg.query(
      'SELECT processed FROM webhook_events WHERE stripe_event_id = $1',
      [eventId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  private async markEventAsProcessed(eventId: string): Promise<void> {
    await this.fastify.pg.query(
      'UPDATE webhook_events SET processed = true, processed_at = NOW() WHERE stripe_event_id = $1',
      [eventId]
    );
  }
}