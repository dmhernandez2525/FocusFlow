import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  CreatePaymentIntentBodySchema,
  UpdatePaymentIntentBodySchema,
  ConfirmPaymentIntentBodySchema,
  CancelPaymentIntentBodySchema,
  CapturePaymentIntentBodySchema,
  PaymentIntentParamsSchema,
  PaymentIntentQuerySchema,
  IdempotencyHeaderSchema,
  CreatePaymentIntentResponseSchema,
  GetPaymentIntentResponseSchema,
  UpdatePaymentIntentResponseSchema,
  ListPaymentIntentsResponseSchema,
  CreatePaymentIntentBody,
  UpdatePaymentIntentBody,
  ConfirmPaymentIntentBody,
  CancelPaymentIntentBody,
  CapturePaymentIntentBody,
  PaymentIntentParams,
  PaymentIntentQuery,
  IdempotencyHeader
} from '@/schemas/payment';
import { ErrorResponseSchema, ValidationErrorResponseSchema } from '@/schemas/common';
import { getStripeService } from '@/utils/stripe';
import { idempotencyMiddleware, storeIdempotentResponse } from '@/utils/idempotency';
import { v4 as uuidv4 } from 'crypto';

export default async function paymentIntentsRoutes(fastify: FastifyInstance): Promise<void> {
  // Create Payment Intent
  fastify.post<{
    Body: CreatePaymentIntentBody;
    Headers: IdempotencyHeader;
  }>('/payment-intents', {
    schema: {
      body: CreatePaymentIntentBodySchema,
      headers: IdempotencyHeaderSchema,
      response: {
        201: CreatePaymentIntentResponseSchema,
        400: ValidationErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Payment Intents'],
      summary: 'Create a new payment intent',
      description: 'Creates a new payment intent for processing a payment'
    },
    preHandler: idempotencyMiddleware
  }, async (request: FastifyRequest<{ Body: CreatePaymentIntentBody; Headers: IdempotencyHeader }>, reply: FastifyReply) => {
    try {
      const stripeService = getStripeService();
      const idempotencyKey = request.headers['idempotency-key'];

      // Create payment intent in Stripe
      const stripePaymentIntent = await stripeService.createPaymentIntent({
        amount: request.body.amount,
        currency: request.body.currency,
        customer: request.body.customer_id ? undefined : undefined, // We'll need to map this to Stripe customer ID
        payment_method: request.body.payment_method_id,
        confirm: request.body.confirm,
        capture_method: request.body.capture_method,
        metadata: request.body.metadata || {}
      });

      // Store in database
      const result = await fastify.pg.query(
        `INSERT INTO payment_intents
         (stripe_payment_intent_id, amount, currency, status, customer_id, metadata, idempotency_key)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          stripePaymentIntent.id,
          request.body.amount,
          request.body.currency,
          stripePaymentIntent.status,
          request.body.customer_id || null,
          JSON.stringify(request.body.metadata || {}),
          idempotencyKey
        ]
      );

      const paymentIntent = result.rows[0];

      const response = {
        data: {
          id: paymentIntent.id,
          stripe_payment_intent_id: paymentIntent.stripe_payment_intent_id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          customer_id: paymentIntent.customer_id,
          client_secret: stripePaymentIntent.client_secret,
          metadata: paymentIntent.metadata,
          created_at: paymentIntent.created_at.toISOString(),
          updated_at: paymentIntent.updated_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      };

      await storeIdempotentResponse(request, reply, response);

      reply.status(201).send(response);
    } catch (error) {
      request.log.error('Error creating payment intent:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to create payment intent'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // Get Payment Intent
  fastify.get<{
    Params: PaymentIntentParams;
  }>('/payment-intents/:id', {
    schema: {
      params: PaymentIntentParamsSchema,
      response: {
        200: GetPaymentIntentResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Payment Intents'],
      summary: 'Get payment intent by ID',
      description: 'Retrieves a payment intent by its ID'
    }
  }, async (request: FastifyRequest<{ Params: PaymentIntentParams }>, reply: FastifyReply) => {
    try {
      const result = await fastify.pg.query(
        'SELECT * FROM payment_intents WHERE id = $1',
        [request.params.id]
      );

      if (result.rows.length === 0) {
        reply.status(404).send({
          error: {
            type: 'not_found',
            message: 'Payment intent not found'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      const paymentIntent = result.rows[0];

      reply.send({
        data: {
          id: paymentIntent.id,
          stripe_payment_intent_id: paymentIntent.stripe_payment_intent_id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          customer_id: paymentIntent.customer_id,
          metadata: paymentIntent.metadata,
          created_at: paymentIntent.created_at.toISOString(),
          updated_at: paymentIntent.updated_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      });
    } catch (error) {
      request.log.error('Error getting payment intent:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to get payment intent'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // List Payment Intents
  fastify.get<{
    Querystring: PaymentIntentQuery;
  }>('/payment-intents', {
    schema: {
      querystring: PaymentIntentQuerySchema,
      response: {
        200: ListPaymentIntentsResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Payment Intents'],
      summary: 'List payment intents',
      description: 'Retrieves a paginated list of payment intents with optional filters'
    }
  }, async (request: FastifyRequest<{ Querystring: PaymentIntentQuery }>, reply: FastifyReply) => {
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

      if (request.query.currency) {
        whereClause += ` AND currency = $${paramIndex}`;
        queryParams.push(request.query.currency);
        paramIndex++;
      }

      if (request.query.amount_gte) {
        whereClause += ` AND amount >= $${paramIndex}`;
        queryParams.push(request.query.amount_gte);
        paramIndex++;
      }

      if (request.query.amount_lte) {
        whereClause += ` AND amount <= $${paramIndex}`;
        queryParams.push(request.query.amount_lte);
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
        `SELECT COUNT(*) FROM payment_intents WHERE ${whereClause}`,
        queryParams
      );
      const total = parseInt(countResult.rows[0].count);

      // Get paginated results
      const result = await fastify.pg.query(
        `SELECT * FROM payment_intents
         WHERE ${whereClause}
         ORDER BY ${sort} ${order}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...queryParams, limit, offset]
      );

      const totalPages = Math.ceil(total / limit);

      reply.send({
        data: {
          payment_intents: result.rows.map(row => ({
            id: row.id,
            stripe_payment_intent_id: row.stripe_payment_intent_id,
            amount: row.amount,
            currency: row.currency,
            status: row.status,
            customer_id: row.customer_id,
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
      request.log.error('Error listing payment intents:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to list payment intents'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // Update Payment Intent
  fastify.patch<{
    Params: PaymentIntentParams;
    Body: UpdatePaymentIntentBody;
  }>('/payment-intents/:id', {
    schema: {
      params: PaymentIntentParamsSchema,
      body: UpdatePaymentIntentBodySchema,
      response: {
        200: UpdatePaymentIntentResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Payment Intents'],
      summary: 'Update payment intent',
      description: 'Updates a payment intent with new amount or metadata'
    }
  }, async (request: FastifyRequest<{ Params: PaymentIntentParams; Body: UpdatePaymentIntentBody }>, reply: FastifyReply) => {
    try {
      // Get existing payment intent
      const existingResult = await fastify.pg.query(
        'SELECT * FROM payment_intents WHERE id = $1',
        [request.params.id]
      );

      if (existingResult.rows.length === 0) {
        reply.status(404).send({
          error: {
            type: 'not_found',
            message: 'Payment intent not found'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      const existingPaymentIntent = existingResult.rows[0];
      const stripeService = getStripeService();

      // Update in Stripe
      const updateParams: any = {};
      if (request.body.amount) updateParams.amount = request.body.amount;
      if (request.body.metadata) updateParams.metadata = request.body.metadata;

      await stripeService.updatePaymentIntent(
        existingPaymentIntent.stripe_payment_intent_id,
        updateParams
      );

      // Update in database
      const setParts: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (request.body.amount) {
        setParts.push(`amount = $${paramIndex}`);
        queryParams.push(request.body.amount);
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
        `UPDATE payment_intents SET ${setParts.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        queryParams
      );

      const paymentIntent = result.rows[0];

      reply.send({
        data: {
          id: paymentIntent.id,
          stripe_payment_intent_id: paymentIntent.stripe_payment_intent_id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          customer_id: paymentIntent.customer_id,
          metadata: paymentIntent.metadata,
          created_at: paymentIntent.created_at.toISOString(),
          updated_at: paymentIntent.updated_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      });
    } catch (error) {
      request.log.error('Error updating payment intent:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to update payment intent'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // Confirm Payment Intent
  fastify.post<{
    Params: PaymentIntentParams;
    Body: ConfirmPaymentIntentBody;
  }>('/payment-intents/:id/confirm', {
    schema: {
      params: PaymentIntentParamsSchema,
      body: ConfirmPaymentIntentBodySchema,
      response: {
        200: UpdatePaymentIntentResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Payment Intents'],
      summary: 'Confirm payment intent',
      description: 'Confirms a payment intent'
    }
  }, async (request: FastifyRequest<{ Params: PaymentIntentParams; Body: ConfirmPaymentIntentBody }>, reply: FastifyReply) => {
    try {
      const existingResult = await fastify.pg.query(
        'SELECT * FROM payment_intents WHERE id = $1',
        [request.params.id]
      );

      if (existingResult.rows.length === 0) {
        reply.status(404).send({
          error: {
            type: 'not_found',
            message: 'Payment intent not found'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      const existingPaymentIntent = existingResult.rows[0];
      const stripeService = getStripeService();

      // Confirm in Stripe
      const stripePaymentIntent = await stripeService.confirmPaymentIntent(
        existingPaymentIntent.stripe_payment_intent_id,
        {
          payment_method: request.body.payment_method_id,
          return_url: request.body.return_url
        }
      );

      // Update status in database
      await fastify.pg.query(
        'UPDATE payment_intents SET status = $1, updated_at = NOW() WHERE id = $2',
        [stripePaymentIntent.status, request.params.id]
      );

      // Get updated record
      const result = await fastify.pg.query(
        'SELECT * FROM payment_intents WHERE id = $1',
        [request.params.id]
      );

      const paymentIntent = result.rows[0];

      reply.send({
        data: {
          id: paymentIntent.id,
          stripe_payment_intent_id: paymentIntent.stripe_payment_intent_id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          customer_id: paymentIntent.customer_id,
          metadata: paymentIntent.metadata,
          created_at: paymentIntent.created_at.toISOString(),
          updated_at: paymentIntent.updated_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      });
    } catch (error) {
      request.log.error('Error confirming payment intent:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to confirm payment intent'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // Cancel Payment Intent
  fastify.post<{
    Params: PaymentIntentParams;
    Body: CancelPaymentIntentBody;
  }>('/payment-intents/:id/cancel', {
    schema: {
      params: PaymentIntentParamsSchema,
      body: CancelPaymentIntentBodySchema,
      response: {
        200: UpdatePaymentIntentResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Payment Intents'],
      summary: 'Cancel payment intent',
      description: 'Cancels a payment intent'
    }
  }, async (request: FastifyRequest<{ Params: PaymentIntentParams; Body: CancelPaymentIntentBody }>, reply: FastifyReply) => {
    try {
      const existingResult = await fastify.pg.query(
        'SELECT * FROM payment_intents WHERE id = $1',
        [request.params.id]
      );

      if (existingResult.rows.length === 0) {
        reply.status(404).send({
          error: {
            type: 'not_found',
            message: 'Payment intent not found'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      const existingPaymentIntent = existingResult.rows[0];
      const stripeService = getStripeService();

      // Cancel in Stripe
      await stripeService.cancelPaymentIntent(
        existingPaymentIntent.stripe_payment_intent_id,
        {
          cancellation_reason: request.body.cancellation_reason
        }
      );

      // Update status in database
      await fastify.pg.query(
        'UPDATE payment_intents SET status = $1, updated_at = NOW() WHERE id = $2',
        ['canceled', request.params.id]
      );

      // Get updated record
      const result = await fastify.pg.query(
        'SELECT * FROM payment_intents WHERE id = $1',
        [request.params.id]
      );

      const paymentIntent = result.rows[0];

      reply.send({
        data: {
          id: paymentIntent.id,
          stripe_payment_intent_id: paymentIntent.stripe_payment_intent_id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          customer_id: paymentIntent.customer_id,
          metadata: paymentIntent.metadata,
          created_at: paymentIntent.created_at.toISOString(),
          updated_at: paymentIntent.updated_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      });
    } catch (error) {
      request.log.error('Error canceling payment intent:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to cancel payment intent'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // Capture Payment Intent
  fastify.post<{
    Params: PaymentIntentParams;
    Body: CapturePaymentIntentBody;
  }>('/payment-intents/:id/capture', {
    schema: {
      params: PaymentIntentParamsSchema,
      body: CapturePaymentIntentBodySchema,
      response: {
        200: UpdatePaymentIntentResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Payment Intents'],
      summary: 'Capture payment intent',
      description: 'Captures a payment intent'
    }
  }, async (request: FastifyRequest<{ Params: PaymentIntentParams; Body: CapturePaymentIntentBody }>, reply: FastifyReply) => {
    try {
      const existingResult = await fastify.pg.query(
        'SELECT * FROM payment_intents WHERE id = $1',
        [request.params.id]
      );

      if (existingResult.rows.length === 0) {
        reply.status(404).send({
          error: {
            type: 'not_found',
            message: 'Payment intent not found'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      const existingPaymentIntent = existingResult.rows[0];
      const stripeService = getStripeService();

      // Capture in Stripe
      const stripePaymentIntent = await stripeService.capturePaymentIntent(
        existingPaymentIntent.stripe_payment_intent_id,
        {
          amount_to_capture: request.body.amount_to_capture
        }
      );

      // Update status in database
      await fastify.pg.query(
        'UPDATE payment_intents SET status = $1, updated_at = NOW() WHERE id = $2',
        [stripePaymentIntent.status, request.params.id]
      );

      // Get updated record
      const result = await fastify.pg.query(
        'SELECT * FROM payment_intents WHERE id = $1',
        [request.params.id]
      );

      const paymentIntent = result.rows[0];

      reply.send({
        data: {
          id: paymentIntent.id,
          stripe_payment_intent_id: paymentIntent.stripe_payment_intent_id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          customer_id: paymentIntent.customer_id,
          metadata: paymentIntent.metadata,
          created_at: paymentIntent.created_at.toISOString(),
          updated_at: paymentIntent.updated_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      });
    } catch (error) {
      request.log.error('Error capturing payment intent:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to capture payment intent'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });
}