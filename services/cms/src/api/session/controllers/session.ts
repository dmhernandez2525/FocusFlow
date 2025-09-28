import { factories } from '@strapi/strapi';
import { z } from 'zod';

// Validation schemas
const locationSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  notes: z.string().optional(),
}).strict();

const createSessionSchema = z.object({
  session_name: z.string().min(2).max(100),
  session_type: z.enum(['wedding', 'portrait', 'family', 'corporate', 'event', 'maternity', 'newborn', 'engagement', 'other']),
  session_date: z.string().datetime(),
  session_duration: z.number().int().min(15).max(1440).default(120),
  location: locationSchema.optional(),
  status: z.enum(['inquiry', 'booked', 'confirmed', 'in_progress', 'completed', 'delivered', 'cancelled']).default('inquiry'),
  total_amount: z.number().min(0).optional(),
  deposit_amount: z.number().min(0).optional(),
  final_payment_amount: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
  preparation_notes: z.string().max(2000).optional(),
  equipment_checklist: z.array(z.string()).default([]),
  shot_list: z.array(z.string()).default([]),
  delivery_deadline: z.string().datetime().optional(),
  photographer: z.number().int().positive(),
  client: z.number().int().positive(),
});

const updateSessionSchema = createSessionSchema.partial().omit({ photographer: true, client: true });

const sessionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('session_date:desc'),
  filters: z.record(z.unknown()).default({}),
  populate: z.string().default('*'),
  photographer_id: z.coerce.number().int().positive().optional(),
  client_id: z.coerce.number().int().positive().optional(),
});

interface SessionController {
  find(ctx: any): Promise<void>;
  findOne(ctx: any): Promise<void>;
  create(ctx: any): Promise<void>;
  update(ctx: any): Promise<void>;
  delete(ctx: any): Promise<void>;
  findByPhotographer(ctx: any): Promise<void>;
  findByClient(ctx: any): Promise<void>;
  updateStatus(ctx: any): Promise<void>;
  updatePaymentStatus(ctx: any): Promise<void>;
  updateContractStatus(ctx: any): Promise<void>;
  markDelivered(ctx: any): Promise<void>;
  getUpcoming(ctx: any): Promise<void>;
  getOverdue(ctx: any): Promise<void>;
}

export default factories.createCoreController('api::session.session', ({ strapi }): SessionController => ({
  async find(ctx) {
    try {
      const validatedQuery = sessionQuerySchema.parse(ctx.query);
      const { page, pageSize, sort, filters, populate, photographer_id, client_id } = validatedQuery;

      let finalFilters = { ...filters };

      if (photographer_id) {
        finalFilters.photographer = { id: { $eq: photographer_id } };
      }

      if (client_id) {
        finalFilters.client = { id: { $eq: client_id } };
      }

      const { results, pagination } = await strapi.service('api::session.session').find({
        page,
        pageSize,
        sort: sort.split(','),
        filters: finalFilters,
        populate,
      });

      ctx.body = {
        data: results,
        meta: { pagination }
      };
    } catch (error) {
      ctx.throw(400, error instanceof z.ZodError ? error.issues : 'Invalid query parameters');
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const { populate = '*' } = ctx.query;

      const session = await strapi.service('api::session.session').findOne(id, {
        populate,
      });

      if (!session) {
        return ctx.notFound('Session not found');
      }

      ctx.body = { data: session };
    } catch (error) {
      ctx.throw(500, 'Failed to fetch session');
    }
  },

  async create(ctx) {
    try {
      const validatedData = createSessionSchema.parse(ctx.request.body);

      // Verify photographer and client exist
      const photographer = await strapi.service('api::photographer.photographer').findOne(validatedData.photographer);
      if (!photographer) {
        return ctx.badRequest('Invalid photographer ID');
      }

      const client = await strapi.service('api::client.client').findOne(validatedData.client);
      if (!client) {
        return ctx.badRequest('Invalid client ID');
      }

      // Verify client belongs to photographer
      if (client.photographer?.id !== validatedData.photographer) {
        return ctx.badRequest('Client does not belong to photographer');
      }

      const session = await strapi.service('api::session.session').create({
        data: validatedData,
      });

      ctx.body = { data: session };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ctx.badRequest('Validation failed', { details: error.issues });
      }
      ctx.throw(500, 'Failed to create session');
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const validatedData = updateSessionSchema.parse(ctx.request.body);

      const existingSession = await strapi.service('api::session.session').findOne(id);
      if (!existingSession) {
        return ctx.notFound('Session not found');
      }

      const session = await strapi.service('api::session.session').update(id, {
        data: validatedData,
      });

      ctx.body = { data: session };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ctx.badRequest('Validation failed', { details: error.issues });
      }
      ctx.throw(500, 'Failed to update session');
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;

      const session = await strapi.service('api::session.session').findOne(id);
      if (!session) {
        return ctx.notFound('Session not found');
      }

      await strapi.service('api::session.session').delete(id);

      ctx.body = { data: { id: parseInt(id) } };
    } catch (error) {
      ctx.throw(500, 'Failed to delete session');
    }
  },

  async findByPhotographer(ctx) {
    try {
      const { photographer_id } = ctx.params;
      const validatedQuery = sessionQuerySchema.parse(ctx.query);

      const { page, pageSize, sort, filters, populate } = validatedQuery;

      const finalFilters = {
        ...filters,
        photographer: { id: { $eq: photographer_id } }
      };

      const { results, pagination } = await strapi.service('api::session.session').find({
        page,
        pageSize,
        sort: sort.split(','),
        filters: finalFilters,
        populate,
      });

      ctx.body = {
        data: results,
        meta: { pagination }
      };
    } catch (error) {
      ctx.throw(500, 'Failed to fetch sessions for photographer');
    }
  },

  async findByClient(ctx) {
    try {
      const { client_id } = ctx.params;
      const validatedQuery = sessionQuerySchema.parse(ctx.query);

      const { page, pageSize, sort, filters, populate } = validatedQuery;

      const finalFilters = {
        ...filters,
        client: { id: { $eq: client_id } }
      };

      const { results, pagination } = await strapi.service('api::session.session').find({
        page,
        pageSize,
        sort: sort.split(','),
        filters: finalFilters,
        populate,
      });

      ctx.body = {
        data: results,
        meta: { pagination }
      };
    } catch (error) {
      ctx.throw(500, 'Failed to fetch sessions for client');
    }
  },

  async updateStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status } = ctx.request.body;

      if (!['inquiry', 'booked', 'confirmed', 'in_progress', 'completed', 'delivered', 'cancelled'].includes(status)) {
        return ctx.badRequest('Invalid session status');
      }

      const session = await strapi.service('api::session.session').updateStatus(id, status);
      if (!session) {
        return ctx.notFound('Session not found');
      }

      ctx.body = { data: session };
    } catch (error) {
      ctx.throw(500, 'Failed to update session status');
    }
  },

  async updatePaymentStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { deposit_paid, final_payment_paid } = ctx.request.body;

      const paymentSchema = z.object({
        deposit_paid: z.boolean().optional(),
        final_payment_paid: z.boolean().optional(),
      });

      const validatedData = paymentSchema.parse({ deposit_paid, final_payment_paid });

      const session = await strapi.service('api::session.session').updatePaymentStatus(id, validatedData);
      if (!session) {
        return ctx.notFound('Session not found');
      }

      ctx.body = { data: session };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ctx.badRequest('Invalid payment status data');
      }
      ctx.throw(500, 'Failed to update payment status');
    }
  },

  async updateContractStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { contract_status, contract_signed } = ctx.request.body;

      const contractSchema = z.object({
        contract_status: z.enum(['not_sent', 'sent', 'signed', 'expired']).optional(),
        contract_signed: z.boolean().optional(),
      });

      const validatedData = contractSchema.parse({ contract_status, contract_signed });

      const session = await strapi.service('api::session.session').updateContractStatus(id, validatedData);
      if (!session) {
        return ctx.notFound('Session not found');
      }

      ctx.body = { data: session };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ctx.badRequest('Invalid contract status data');
      }
      ctx.throw(500, 'Failed to update contract status');
    }
  },

  async markDelivered(ctx) {
    try {
      const { id } = ctx.params;

      const session = await strapi.service('api::session.session').markDelivered(id);
      if (!session) {
        return ctx.notFound('Session not found');
      }

      ctx.body = { data: session };
    } catch (error) {
      ctx.throw(500, 'Failed to mark session as delivered');
    }
  },

  async getUpcoming(ctx) {
    try {
      const { photographer_id } = ctx.params;
      const { days = 30 } = ctx.query;

      const sessions = await strapi.service('api::session.session').getUpcomingSessions(photographer_id, parseInt(days));

      ctx.body = { data: sessions };
    } catch (error) {
      ctx.throw(500, 'Failed to fetch upcoming sessions');
    }
  },

  async getOverdue(ctx) {
    try {
      const { photographer_id } = ctx.params;

      const sessions = await strapi.service('api::session.session').getOverdueSessions(photographer_id);

      ctx.body = { data: sessions };
    } catch (error) {
      ctx.throw(500, 'Failed to fetch overdue sessions');
    }
  },
}));