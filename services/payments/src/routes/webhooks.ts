import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WebhookHeaderSchema, WebhookProcessResponseSchema } from '@/schemas/webhook';
import { ErrorResponseSchema } from '@/schemas/common';
import { getStripeService } from '@/utils/stripe';
import { WebhookProcessor } from '@/utils/webhookProcessor';

export default async function webhookRoutes(fastify: FastifyInstance): Promise<void> {
  // Stripe Webhook Endpoint
  fastify.post('/webhooks/stripe', {
    schema: {
      headers: WebhookHeaderSchema,
      response: {
        200: WebhookProcessResponseSchema,
        400: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Webhooks'],
      summary: 'Process Stripe webhook events',
      description: 'Receives and processes webhook events from Stripe'
    },
    config: {
      rawBody: true // This will preserve the raw body for webhook signature verification
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const signature = request.headers['stripe-signature'] as string;

      if (!signature) {
        reply.status(400).send({
          error: {
            type: 'missing_signature',
            message: 'Missing Stripe signature header'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      // Get raw body as string
      const rawBody = (request as any).rawBody || JSON.stringify(request.body);

      const stripeService = getStripeService();

      // Verify webhook signature and construct event
      let event;
      try {
        event = stripeService.verifyWebhookSignature(rawBody, signature);
      } catch (error) {
        request.log.error('Webhook signature verification failed:', error);
        reply.status(400).send({
          error: {
            type: 'invalid_signature',
            message: 'Invalid webhook signature'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      // Process the webhook event
      const webhookProcessor = new WebhookProcessor(fastify);

      try {
        await webhookProcessor.processWebhookEvent(event);

        reply.send({
          data: {
            event_id: event.id,
            processed: true,
            message: `Successfully processed ${event.type} event`
          },
          timestamp: new Date().toISOString(),
          requestId: request.id
        });
      } catch (processingError) {
        request.log.error(`Error processing webhook event ${event.id}:`, processingError);

        // Still return 200 to acknowledge receipt, but log the error
        reply.send({
          data: {
            event_id: event.id,
            processed: false,
            message: `Error processing ${event.type} event: ${processingError instanceof Error ? processingError.message : 'Unknown error'}`
          },
          timestamp: new Date().toISOString(),
          requestId: request.id
        });
      }
    } catch (error) {
      request.log.error('Webhook processing error:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to process webhook'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // Webhook Event Status Endpoint (for debugging/monitoring)
  fastify.get('/webhooks/events/:eventId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          eventId: { type: 'string' }
        },
        required: ['eventId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                stripe_event_id: { type: 'string' },
                event_type: { type: 'string' },
                processed: { type: 'boolean' },
                processed_at: { type: ['string', 'null'] },
                created_at: { type: 'string' }
              },
              required: ['id', 'stripe_event_id', 'event_type', 'processed', 'created_at']
            },
            timestamp: { type: 'string' },
            requestId: { type: 'string' }
          },
          required: ['data', 'timestamp', 'requestId']
        },
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Webhooks'],
      summary: 'Get webhook event status',
      description: 'Retrieves the processing status of a webhook event'
    }
  }, async (request: FastifyRequest<{ Params: { eventId: string } }>, reply: FastifyReply) => {
    try {
      const result = await fastify.pg.query(
        'SELECT * FROM webhook_events WHERE stripe_event_id = $1',
        [request.params.eventId]
      );

      if (result.rows.length === 0) {
        reply.status(404).send({
          error: {
            type: 'not_found',
            message: 'Webhook event not found'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      const event = result.rows[0];

      reply.send({
        data: {
          id: event.id,
          stripe_event_id: event.stripe_event_id,
          event_type: event.event_type,
          processed: event.processed,
          processed_at: event.processed_at ? event.processed_at.toISOString() : null,
          created_at: event.created_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      });
    } catch (error) {
      request.log.error('Error getting webhook event:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to get webhook event'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // List Webhook Events (for monitoring)
  fastify.get('/webhooks/events', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          event_type: { type: 'string' },
          processed: { type: 'boolean' },
          created_after: { type: 'string', format: 'date-time' },
          created_before: { type: 'string', format: 'date-time' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                events: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      stripe_event_id: { type: 'string' },
                      event_type: { type: 'string' },
                      processed: { type: 'boolean' },
                      processed_at: { type: ['string', 'null'] },
                      created_at: { type: 'string' }
                    },
                    required: ['id', 'stripe_event_id', 'event_type', 'processed', 'created_at']
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' },
                    hasNext: { type: 'boolean' },
                    hasPrev: { type: 'boolean' }
                  },
                  required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev']
                }
              },
              required: ['events', 'pagination']
            },
            timestamp: { type: 'string' },
            requestId: { type: 'string' }
          },
          required: ['data', 'timestamp', 'requestId']
        },
        500: ErrorResponseSchema
      },
      tags: ['Webhooks'],
      summary: 'List webhook events',
      description: 'Retrieves a paginated list of webhook events with optional filters'
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      page?: number;
      limit?: number;
      event_type?: string;
      processed?: boolean;
      created_after?: string;
      created_before?: string;
    }
  }>, reply: FastifyReply) => {
    try {
      const { page = 1, limit = 20 } = request.query;
      const offset = (page - 1) * limit;

      let whereClause = '1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Apply filters
      if (request.query.event_type) {
        whereClause += ` AND event_type = $${paramIndex}`;
        queryParams.push(request.query.event_type);
        paramIndex++;
      }

      if (request.query.processed !== undefined) {
        whereClause += ` AND processed = $${paramIndex}`;
        queryParams.push(request.query.processed);
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
        `SELECT COUNT(*) FROM webhook_events WHERE ${whereClause}`,
        queryParams
      );
      const total = parseInt(countResult.rows[0].count);

      // Get paginated results
      const result = await fastify.pg.query(
        `SELECT * FROM webhook_events
         WHERE ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...queryParams, limit, offset]
      );

      const totalPages = Math.ceil(total / limit);

      reply.send({
        data: {
          events: result.rows.map(row => ({
            id: row.id,
            stripe_event_id: row.stripe_event_id,
            event_type: row.event_type,
            processed: row.processed,
            processed_at: row.processed_at ? row.processed_at.toISOString() : null,
            created_at: row.created_at.toISOString()
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
      request.log.error('Error listing webhook events:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to list webhook events'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });
}