import Stripe from 'stripe';
import { FastifyInstance } from 'fastify';
import { createHash, timingSafeEqual } from 'crypto';

export class StripeService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(secretKey: string, webhookSecret: string) {
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
      timeout: 30000
    });
    this.webhookSecret = webhookSecret;
  }

  getStripeInstance(): Stripe {
    return this.stripe;
  }

  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customer?: string;
    payment_method?: string;
    confirm?: boolean;
    capture_method?: 'automatic' | 'manual';
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      customer: params.customer,
      payment_method: params.payment_method,
      confirm: params.confirm,
      capture_method: params.capture_method || 'automatic',
      metadata: params.metadata || {},
      automatic_payment_methods: {
        enabled: true
      }
    });
  }

  async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(id);
  }

  async updatePaymentIntent(
    id: string,
    params: {
      amount?: number;
      metadata?: Record<string, string>;
    }
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.update(id, params);
  }

  async confirmPaymentIntent(
    id: string,
    params: {
      payment_method?: string;
      return_url?: string;
    }
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.confirm(id, params);
  }

  async cancelPaymentIntent(
    id: string,
    params?: {
      cancellation_reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'abandoned';
    }
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.cancel(id, params);
  }

  async capturePaymentIntent(
    id: string,
    params?: {
      amount_to_capture?: number;
    }
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.capture(id, params);
  }

  async createCustomer(params: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email: params.email,
      name: params.name,
      phone: params.phone,
      metadata: params.metadata || {}
    });
  }

  async retrieveCustomer(id: string): Promise<Stripe.Customer> {
    return this.stripe.customers.retrieve(id) as Promise<Stripe.Customer>;
  }

  async updateCustomer(
    id: string,
    params: {
      email?: string;
      name?: string;
      phone?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<Stripe.Customer> {
    return this.stripe.customers.update(id, params);
  }

  async deleteCustomer(id: string): Promise<Stripe.DeletedCustomer> {
    return this.stripe.customers.del(id);
  }

  async createSubscription(params: {
    customer: string;
    items: Array<{ price: string }>;
    trial_period_days?: number;
    payment_behavior?: 'default_incomplete' | 'allow_incomplete' | 'error_if_incomplete';
    proration_behavior?: 'create_prorations' | 'none' | 'always_invoice';
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.create({
      customer: params.customer,
      items: params.items,
      trial_period_days: params.trial_period_days,
      payment_behavior: params.payment_behavior || 'default_incomplete',
      proration_behavior: params.proration_behavior,
      metadata: params.metadata || {},
      expand: ['latest_invoice.payment_intent']
    });
  }

  async retrieveSubscription(id: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(id, {
      expand: ['latest_invoice.payment_intent']
    });
  }

  async updateSubscription(
    id: string,
    params: {
      items?: Array<{ id?: string; price?: string; deleted?: boolean }>;
      proration_behavior?: 'create_prorations' | 'none' | 'always_invoice';
      metadata?: Record<string, string>;
    }
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.update(id, {
      items: params.items,
      proration_behavior: params.proration_behavior,
      metadata: params.metadata
    });
  }

  async cancelSubscription(
    id: string,
    params?: {
      cancel_at_period_end?: boolean;
      cancellation_details?: {
        comment?: string;
        feedback?: 'too_expensive' | 'missing_features' | 'switched_service' | 'unused' | 'customer_service' | 'too_complex' | 'low_quality' | 'other';
      };
    }
  ): Promise<Stripe.Subscription> {
    if (params?.cancel_at_period_end) {
      return this.stripe.subscriptions.update(id, {
        cancel_at_period_end: true,
        cancellation_details: params.cancellation_details
      });
    } else {
      return this.stripe.subscriptions.cancel(id, {
        cancellation_details: params?.cancellation_details
      });
    }
  }
}

let stripeServiceInstance: StripeService | null = null;

export function initializeStripeService(fastify: FastifyInstance): StripeService {
  if (!stripeServiceInstance) {
    stripeServiceInstance = new StripeService(
      fastify.config.STRIPE_SECRET_KEY,
      fastify.config.STRIPE_WEBHOOK_SECRET
    );
  }
  return stripeServiceInstance;
}

export function getStripeService(): StripeService {
  if (!stripeServiceInstance) {
    throw new Error('Stripe service not initialized. Call initializeStripeService first.');
  }
  return stripeServiceInstance;
}