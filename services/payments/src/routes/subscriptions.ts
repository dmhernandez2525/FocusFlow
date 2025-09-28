import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  CreateSubscriptionBodySchema,
  UpdateSubscriptionBodySchema,
  CancelSubscriptionBodySchema,
  SubscriptionParamsSchema,
  SubscriptionQuerySchema,
  CreateSubscriptionResponseSchema,
  GetSubscriptionResponseSchema,
  UpdateSubscriptionResponseSchema,
  CancelSubscriptionResponseSchema,
  ListSubscriptionsResponseSchema,
  CreateSubscriptionBody,
  UpdateSubscriptionBody,
  CancelSubscriptionBody,
  SubscriptionParams,
  SubscriptionQuery
} from '@/schemas/subscription';
import { ErrorResponseSchema, ValidationErrorResponseSchema } from '@/schemas/common';
import { getStripeService } from '@/utils/stripe';

export default async function subscriptionsRoutes(fastify: FastifyInstance): Promise<void> {
  // Create Subscription
  fastify.post<{
    Body: CreateSubscriptionBody;
  }>('/subscriptions', {
    schema: {
      body: CreateSubscriptionBodySchema,
      response: {
        201: CreateSubscriptionResponseSchema,
        400: ValidationErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Subscriptions'],
      summary: 'Create a new subscription',
      description: 'Creates a new subscription for a customer'
    }
  }, async (request: FastifyRequest<{ Body: CreateSubscriptionBody }>, reply: FastifyReply) => {
    try {
      const stripeService = getStripeService();

      // Get customer's Stripe ID from our database
      const customerResult = await fastify.pg.query(
        'SELECT stripe_customer_id FROM customers WHERE id = $1',
        [request.body.customer_id]
      );

      if (customerResult.rows.length === 0) {
        reply.status(400).send({
          error: {
            type: 'validation_error',
            message: 'Customer not found',
            validation: []
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      const stripeCustomerId = customerResult.rows[0].stripe_customer_id;

      // Create subscription in Stripe
      const stripeSubscription = await stripeService.createSubscription({
        customer: stripeCustomerId,
        items: [{ price: request.body.price_id }],
        trial_period_days: request.body.trial_period_days,
        proration_behavior: request.body.proration_behavior,
        metadata: request.body.metadata || {}
      });

      // Store in database
      const result = await fastify.pg.query(
        `INSERT INTO subscriptions
         (stripe_subscription_id, customer_id, status, current_period_start,
          current_period_end, plan_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          stripeSubscription.id,
          request.body.customer_id,
          stripeSubscription.status,
          new Date(stripeSubscription.current_period_start * 1000),
          new Date(stripeSubscription.current_period_end * 1000),
          request.body.price_id,
          JSON.stringify(request.body.metadata || {})
        ]
      );

      const subscription = result.rows[0];

      const response = {
        data: {
          id: subscription.id,
          stripe_subscription_id: subscription.stripe_subscription_id,
          customer_id: subscription.customer_id,
          status: subscription.status,
          current_period_start: subscription.current_period_start.toISOString(),
          current_period_end: subscription.current_period_end.toISOString(),
          plan_id: subscription.plan_id,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
          canceled_at: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : null,
          trial_start: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : null,
          trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
          metadata: subscription.metadata,
          created_at: subscription.created_at.toISOString(),
          updated_at: subscription.updated_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      };

      reply.status(201).send(response);
    } catch (error) {
      request.log.error('Error creating subscription:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to create subscription'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // Get Subscription
  fastify.get<{
    Params: SubscriptionParams;
  }>('/subscriptions/:id', {
    schema: {
      params: SubscriptionParamsSchema,
      response: {
        200: GetSubscriptionResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Subscriptions'],
      summary: 'Get subscription by ID',
      description: 'Retrieves a subscription by its ID'
    }
  }, async (request: FastifyRequest<{ Params: SubscriptionParams }>, reply: FastifyReply) => {
    try {
      const result = await fastify.pg.query(
        'SELECT * FROM subscriptions WHERE id = $1',
        [request.params.id]
      );

      if (result.rows.length === 0) {
        reply.status(404).send({
          error: {
            type: 'not_found',
            message: 'Subscription not found'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      const subscription = result.rows[0];

      // Get additional data from Stripe
      const stripeService = getStripeService();
      const stripeSubscription = await stripeService.retrieveSubscription(
        subscription.stripe_subscription_id
      );

      reply.send({
        data: {
          id: subscription.id,
          stripe_subscription_id: subscription.stripe_subscription_id,
          customer_id: subscription.customer_id,
          status: subscription.status,
          current_period_start: subscription.current_period_start.toISOString(),
          current_period_end: subscription.current_period_end.toISOString(),
          plan_id: subscription.plan_id,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
          canceled_at: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : null,
          trial_start: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : null,
          trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
          metadata: subscription.metadata,
          created_at: subscription.created_at.toISOString(),
          updated_at: subscription.updated_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      });
    } catch (error) {
      request.log.error('Error getting subscription:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to get subscription'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // List Subscriptions
  fastify.get<{
    Querystring: SubscriptionQuery;
  }>('/subscriptions', {
    schema: {
      querystring: SubscriptionQuerySchema,
      response: {
        200: ListSubscriptionsResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Subscriptions'],
      summary: 'List subscriptions',
      description: 'Retrieves a paginated list of subscriptions with optional filters'
    }
  }, async (request: FastifyRequest<{ Querystring: SubscriptionQuery }>, reply: FastifyReply) => {
    try {
      const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = request.query;
      const offset = (page - 1) * limit;

      let whereClause = '1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Apply filters
      if (request.query.status) {
        whereClause += ` AND status = $${paramIndex}`;
        queryParams.push(request.query.status);
        paramIndex++;
      }

      if (request.query.customer_id) {
        whereClause += ` AND customer_id = $${paramIndex}`;
        queryParams.push(request.query.customer_id);
        paramIndex++;
      }

      if (request.query.plan_id) {
        whereClause += ` AND plan_id = $${paramIndex}`;
        queryParams.push(request.query.plan_id);
        paramIndex++;
      }

      if (request.query.created_after) {
        whereClause += ` AND created_at > $${paramIndex}`;
        queryParams.push(request.query.created_after);
        paramIndex++;
      }

      if (request.query.created_before) {
        whereClause += ` AND created_at < $${paramIndex}`;
        queryParams.push(request.query.created_before);
        paramIndex++;
      }

      // Get total count
      const countResult = await fastify.pg.query(
        `SELECT COUNT(*) FROM subscriptions WHERE ${whereClause}`,
        queryParams
      );
      const total = parseInt(countResult.rows[0].count);

      // Get paginated results
      const result = await fastify.pg.query(
        `SELECT * FROM subscriptions
         WHERE ${whereClause}
         ORDER BY ${sort} ${order}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...queryParams, limit, offset]
      );

      const totalPages = Math.ceil(total / limit);

      reply.send({
        data: {
          subscriptions: result.rows.map(row => ({
            id: row.id,
            stripe_subscription_id: row.stripe_subscription_id,
            customer_id: row.customer_id,
            status: row.status,
            current_period_start: row.current_period_start.toISOString(),
            current_period_end: row.current_period_end.toISOString(),
            plan_id: row.plan_id,
            cancel_at_period_end: false, // Would need to fetch from Stripe for accurate data
            canceled_at: null,
            trial_start: null,
            trial_end: null,
            metadata: row.metadata,
            created_at: row.created_at.toISOString(),
            updated_at: row.updated_at.toISOString()
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      });
    } catch (error) {
      request.log.error('Error listing subscriptions:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to list subscriptions'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // Update Subscription
  fastify.patch<{
    Params: SubscriptionParams;
    Body: UpdateSubscriptionBody;
  }>('/subscriptions/:id', {
    schema: {
      params: SubscriptionParamsSchema,
      body: UpdateSubscriptionBodySchema,
      response: {
        200: UpdateSubscriptionResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Subscriptions'],
      summary: 'Update subscription',
      description: 'Updates a subscription with new price or metadata'
    }
  }, async (request: FastifyRequest<{ Params: SubscriptionParams; Body: UpdateSubscriptionBody }>, reply: FastifyReply) => {
    try {
      // Get existing subscription
      const existingResult = await fastify.pg.query(
        'SELECT * FROM subscriptions WHERE id = $1',
        [request.params.id]
      );

      if (existingResult.rows.length === 0) {
        reply.status(404).send({
          error: {
            type: 'not_found',
            message: 'Subscription not found'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      const existingSubscription = existingResult.rows[0];
      const stripeService = getStripeService();

      // Update in Stripe
      const updateParams: any = {};
      if (request.body.price_id) {
        // Get current subscription from Stripe to get item ID
        const stripeSubscription = await stripeService.retrieveSubscription(
          existingSubscription.stripe_subscription_id
        );
        updateParams.items = [
          {
            id: stripeSubscription.items.data[0]?.id,
            price: request.body.price_id
          }
        ];
      }
      if (request.body.proration_behavior) updateParams.proration_behavior = request.body.proration_behavior;
      if (request.body.metadata) updateParams.metadata = request.body.metadata;

      const stripeSubscription = await stripeService.updateSubscription(
        existingSubscription.stripe_subscription_id,
        updateParams
      );

      // Update in database
      const setParts: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (request.body.price_id) {
        setParts.push(`plan_id = $${paramIndex}`);
        queryParams.push(request.body.price_id);
        paramIndex++;
      }

      if (request.body.metadata) {
        setParts.push(`metadata = $${paramIndex}`);
        queryParams.push(JSON.stringify(request.body.metadata));
        paramIndex++;
      }

      setParts.push(`updated_at = NOW()`);
      queryParams.push(request.params.id);

      const result = await fastify.pg.query(
        `UPDATE subscriptions SET ${setParts.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        queryParams
      );

      const subscription = result.rows[0];

      reply.send({
        data: {
          id: subscription.id,
          stripe_subscription_id: subscription.stripe_subscription_id,
          customer_id: subscription.customer_id,
          status: subscription.status,
          current_period_start: subscription.current_period_start.toISOString(),
          current_period_end: subscription.current_period_end.toISOString(),
          plan_id: subscription.plan_id,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
          canceled_at: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : null,
          trial_start: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : null,
          trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
          metadata: subscription.metadata,
          created_at: subscription.created_at.toISOString(),
          updated_at: subscription.updated_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      });
    } catch (error) {
      request.log.error('Error updating subscription:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to update subscription'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // Cancel Subscription
  fastify.post<{
    Params: SubscriptionParams;
    Body: CancelSubscriptionBody;
  }>('/subscriptions/:id/cancel', {
    schema: {
      params: SubscriptionParamsSchema,
      body: CancelSubscriptionBodySchema,
      response: {
        200: CancelSubscriptionResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Subscriptions'],
      summary: 'Cancel subscription',
      description: 'Cancels a subscription immediately or at period end'
    }
  }, async (request: FastifyRequest<{ Params: SubscriptionParams; Body: CancelSubscriptionBody }>, reply: FastifyReply) => {
    try {
      const existingResult = await fastify.pg.query(
        'SELECT * FROM subscriptions WHERE id = $1',
        [request.params.id]
      );

      if (existingResult.rows.length === 0) {
        reply.status(404).send({
          error: {
            type: 'not_found',
            message: 'Subscription not found'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      const existingSubscription = existingResult.rows[0];
      const stripeService = getStripeService();

      // Cancel in Stripe
      const stripeSubscription = await stripeService.cancelSubscription(
        existingSubscription.stripe_subscription_id,
        {
          cancel_at_period_end: request.body.cancel_at_period_end,
          cancellation_details: request.body.cancellation_details
        }
      );

      // Update status in database if canceled immediately
      if (!request.body.cancel_at_period_end) {
        await fastify.pg.query(
          'UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2',
          ['canceled', request.params.id]
        );
      }

      // Get updated record
      const result = await fastify.pg.query(
        'SELECT * FROM subscriptions WHERE id = $1',
        [request.params.id]
      );

      const subscription = result.rows[0];

      reply.send({
        data: {
          id: subscription.id,
          stripe_subscription_id: subscription.stripe_subscription_id,
          customer_id: subscription.customer_id,
          status: subscription.status,
          current_period_start: subscription.current_period_start.toISOString(),
          current_period_end: subscription.current_period_end.toISOString(),
          plan_id: subscription.plan_id,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
          canceled_at: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : null,
          trial_start: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : null,
          trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
          metadata: subscription.metadata,
          created_at: subscription.created_at.toISOString(),
          updated_at: subscription.updated_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      });
    } catch (error) {
      request.log.error('Error canceling subscription:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to cancel subscription'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });
}