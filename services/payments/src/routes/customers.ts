import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  CreateCustomerBodySchema,
  UpdateCustomerBodySchema,
  CustomerParamsSchema,
  CustomerQuerySchema,
  CreateCustomerResponseSchema,
  GetCustomerResponseSchema,
  UpdateCustomerResponseSchema,
  ListCustomersResponseSchema,
  CreateCustomerBody,
  UpdateCustomerBody,
  CustomerParams,
  CustomerQuery
} from '@/schemas/customer';
import { ErrorResponseSchema, ValidationErrorResponseSchema } from '@/schemas/common';
import { getStripeService } from '@/utils/stripe';

export default async function customersRoutes(fastify: FastifyInstance): Promise<void> {
  // Create Customer
  fastify.post<{
    Body: CreateCustomerBody;
  }>('/customers', {
    schema: {
      body: CreateCustomerBodySchema,
      response: {
        201: CreateCustomerResponseSchema,
        400: ValidationErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Customers'],
      summary: 'Create a new customer',
      description: 'Creates a new customer in both Stripe and local database'
    }
  }, async (request: FastifyRequest<{ Body: CreateCustomerBody }>, reply: FastifyReply) => {
    try {
      const stripeService = getStripeService();

      // Create customer in Stripe
      const stripeCustomer = await stripeService.createCustomer({
        email: request.body.email,
        name: request.body.name,
        phone: request.body.phone,
        metadata: request.body.metadata || {}
      });

      // Store in database
      const result = await fastify.pg.query(
        `INSERT INTO customers (stripe_customer_id, email, name, metadata)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          stripeCustomer.id,
          request.body.email,
          request.body.name || null,
          JSON.stringify(request.body.metadata || {})
        ]
      );

      const customer = result.rows[0];

      const response = {
        data: {
          id: customer.id,
          stripe_customer_id: customer.stripe_customer_id,
          email: customer.email,
          name: customer.name,
          phone: stripeCustomer.phone || null,
          metadata: customer.metadata,
          created_at: customer.created_at.toISOString(),
          updated_at: customer.updated_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      };

      reply.status(201).send(response);
    } catch (error) {
      request.log.error('Error creating customer:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to create customer'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // Get Customer
  fastify.get<{
    Params: CustomerParams;
  }>('/customers/:id', {
    schema: {
      params: CustomerParamsSchema,
      response: {
        200: GetCustomerResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Customers'],
      summary: 'Get customer by ID',
      description: 'Retrieves a customer by its ID'
    }
  }, async (request: FastifyRequest<{ Params: CustomerParams }>, reply: FastifyReply) => {
    try {
      const result = await fastify.pg.query(
        'SELECT * FROM customers WHERE id = $1',
        [request.params.id]
      );

      if (result.rows.length === 0) {
        reply.status(404).send({
          error: {
            type: 'not_found',
            message: 'Customer not found'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      const customer = result.rows[0];

      // Get additional data from Stripe
      const stripeService = getStripeService();
      const stripeCustomer = await stripeService.retrieveCustomer(
        customer.stripe_customer_id
      );

      reply.send({
        data: {
          id: customer.id,
          stripe_customer_id: customer.stripe_customer_id,
          email: customer.email,
          name: customer.name,
          phone: stripeCustomer.phone || null,
          metadata: customer.metadata,
          created_at: customer.created_at.toISOString(),
          updated_at: customer.updated_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      });
    } catch (error) {
      request.log.error('Error getting customer:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to get customer'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // List Customers
  fastify.get<{
    Querystring: CustomerQuery;
  }>('/customers', {
    schema: {
      querystring: CustomerQuerySchema,
      response: {
        200: ListCustomersResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Customers'],
      summary: 'List customers',
      description: 'Retrieves a paginated list of customers with optional filters'
    }
  }, async (request: FastifyRequest<{ Querystring: CustomerQuery }>, reply: FastifyReply) => {
    try {
      const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = request.query;
      const offset = (page - 1) * limit;

      let whereClause = '1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Apply filters
      if (request.query.email) {
        whereClause += ` AND email ILIKE $${paramIndex}`;
        queryParams.push(`%${request.query.email}%`);
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
        `SELECT COUNT(*) FROM customers WHERE ${whereClause}`,
        queryParams
      );
      const total = parseInt(countResult.rows[0].count);

      // Get paginated results
      const result = await fastify.pg.query(
        `SELECT * FROM customers
         WHERE ${whereClause}
         ORDER BY ${sort} ${order}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...queryParams, limit, offset]
      );

      const totalPages = Math.ceil(total / limit);

      reply.send({
        data: {
          customers: result.rows.map(row => ({
            id: row.id,
            stripe_customer_id: row.stripe_customer_id,
            email: row.email,
            name: row.name,
            phone: null, // Would need to fetch from Stripe for accurate data
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
      request.log.error('Error listing customers:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to list customers'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // Update Customer
  fastify.patch<{
    Params: CustomerParams;
    Body: UpdateCustomerBody;
  }>('/customers/:id', {
    schema: {
      params: CustomerParamsSchema,
      body: UpdateCustomerBodySchema,
      response: {
        200: UpdateCustomerResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Customers'],
      summary: 'Update customer',
      description: 'Updates a customer with new information'
    }
  }, async (request: FastifyRequest<{ Params: CustomerParams; Body: UpdateCustomerBody }>, reply: FastifyReply) => {
    try {
      // Get existing customer
      const existingResult = await fastify.pg.query(
        'SELECT * FROM customers WHERE id = $1',
        [request.params.id]
      );

      if (existingResult.rows.length === 0) {
        reply.status(404).send({
          error: {
            type: 'not_found',
            message: 'Customer not found'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      const existingCustomer = existingResult.rows[0];
      const stripeService = getStripeService();

      // Update in Stripe
      const updateParams: any = {};
      if (request.body.email) updateParams.email = request.body.email;
      if (request.body.name !== undefined) updateParams.name = request.body.name;
      if (request.body.phone !== undefined) updateParams.phone = request.body.phone;
      if (request.body.metadata) updateParams.metadata = request.body.metadata;

      const stripeCustomer = await stripeService.updateCustomer(
        existingCustomer.stripe_customer_id,
        updateParams
      );

      // Update in database
      const setParts: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (request.body.email) {
        setParts.push(`email = $${paramIndex}`);
        queryParams.push(request.body.email);
        paramIndex++;
      }

      if (request.body.name !== undefined) {
        setParts.push(`name = $${paramIndex}`);
        queryParams.push(request.body.name);
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
        `UPDATE customers SET ${setParts.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        queryParams
      );

      const customer = result.rows[0];

      reply.send({
        data: {
          id: customer.id,
          stripe_customer_id: customer.stripe_customer_id,
          email: customer.email,
          name: customer.name,
          phone: stripeCustomer.phone || null,
          metadata: customer.metadata,
          created_at: customer.created_at.toISOString(),
          updated_at: customer.updated_at.toISOString()
        },
        timestamp: new Date().toISOString(),
        requestId: request.id
      });
    } catch (error) {
      request.log.error('Error updating customer:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to update customer'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });

  // Delete Customer
  fastify.delete<{
    Params: CustomerParams;
  }>('/customers/:id', {
    schema: {
      params: CustomerParamsSchema,
      response: {
        204: {
          type: 'null',
          description: 'Customer deleted successfully'
        },
        404: ErrorResponseSchema,
        500: ErrorResponseSchema
      },
      tags: ['Customers'],
      summary: 'Delete customer',
      description: 'Deletes a customer from both Stripe and local database'
    }
  }, async (request: FastifyRequest<{ Params: CustomerParams }>, reply: FastifyReply) => {
    try {
      // Get existing customer
      const existingResult = await fastify.pg.query(
        'SELECT * FROM customers WHERE id = $1',
        [request.params.id]
      );

      if (existingResult.rows.length === 0) {
        reply.status(404).send({
          error: {
            type: 'not_found',
            message: 'Customer not found'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
        return;
      }

      const existingCustomer = existingResult.rows[0];
      const stripeService = getStripeService();

      // Delete in Stripe
      await stripeService.deleteCustomer(existingCustomer.stripe_customer_id);

      // Soft delete in database (mark as deleted)
      await fastify.pg.query(
        `UPDATE customers
         SET metadata = jsonb_set(metadata, '{deleted}', 'true'), updated_at = NOW()
         WHERE id = $1`,
        [request.params.id]
      );

      reply.status(204).send();
    } catch (error) {
      request.log.error('Error deleting customer:', error);
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'Failed to delete customer'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    }
  });
}