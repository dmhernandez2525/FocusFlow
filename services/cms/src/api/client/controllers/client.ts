import { factories } from '@strapi/strapi';
import { z } from 'zod';

// Validation schemas
const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
}).strict();

const createClientSchema = z.object({
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^[+]?[1-9]?[0-9]{7,15}$/).optional(),
  address: addressSchema.optional(),
  tags: z.array(z.string()).default([]),
  lifecycle_stage: z.enum(['lead', 'prospect', 'client', 'past_client', 'inactive']).default('lead'),
  source: z.enum(['referral', 'website', 'social_media', 'advertising', 'word_of_mouth', 'other']).optional(),
  notes: z.string().max(2000).optional(),
  budget_range: z.enum(['under_1000', '1000_2500', '2500_5000', '5000_10000', 'over_10000']).optional(),
  preferred_contact_method: z.enum(['email', 'phone', 'text', 'any']).default('email'),
  last_contact_date: z.string().datetime().optional(),
  next_followup_date: z.string().datetime().optional(),
  photographer: z.number().int().positive(),
});

const updateClientSchema = createClientSchema.partial().omit({ photographer: true });

const clientQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt:desc'),
  filters: z.record(z.unknown()).default({}),
  populate: z.string().default('*'),
  photographer_id: z.coerce.number().int().positive().optional(),
});

interface ClientController {
  find(ctx: any): Promise<void>;
  findOne(ctx: any): Promise<void>;
  create(ctx: any): Promise<void>;
  update(ctx: any): Promise<void>;
  delete(ctx: any): Promise<void>;
  findByPhotographer(ctx: any): Promise<void>;
  updateLifecycleStage(ctx: any): Promise<void>;
  addTag(ctx: any): Promise<void>;
  removeTag(ctx: any): Promise<void>;
  updateFollowup(ctx: any): Promise<void>;
}

export default factories.createCoreController('api::client.client', ({ strapi }): ClientController => ({
  async find(ctx) {
    try {
      const validatedQuery = clientQuerySchema.parse(ctx.query);
      const { page, pageSize, sort, filters, populate, photographer_id } = validatedQuery;

      // Add photographer filter if provided
      const finalFilters = photographer_id ? {
        ...filters,
        photographer: { id: { $eq: photographer_id } }
      } : filters;

      const { results, pagination } = await strapi.service('api::client.client').find({
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

      const client = await strapi.service('api::client.client').findOne(id, {
        populate,
      });

      if (!client) {
        return ctx.notFound('Client not found');
      }

      ctx.body = { data: client };
    } catch (error) {
      ctx.throw(500, 'Failed to fetch client');
    }
  },

  async create(ctx) {
    try {
      const validatedData = createClientSchema.parse(ctx.request.body);

      // Verify photographer exists
      const photographer = await strapi.service('api::photographer.photographer').findOne(validatedData.photographer);
      if (!photographer) {
        return ctx.badRequest('Invalid photographer ID');
      }

      const client = await strapi.service('api::client.client').create({
        data: validatedData,
      });

      ctx.body = { data: client };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ctx.badRequest('Validation failed', { details: error.issues });
      }
      ctx.throw(500, 'Failed to create client');
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const validatedData = updateClientSchema.parse(ctx.request.body);

      const existingClient = await strapi.service('api::client.client').findOne(id);
      if (!existingClient) {
        return ctx.notFound('Client not found');
      }

      const client = await strapi.service('api::client.client').update(id, {
        data: validatedData,
      });

      ctx.body = { data: client };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ctx.badRequest('Validation failed', { details: error.issues });
      }
      ctx.throw(500, 'Failed to update client');
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;

      const client = await strapi.service('api::client.client').findOne(id);
      if (!client) {
        return ctx.notFound('Client not found');
      }

      await strapi.service('api::client.client').delete(id);

      ctx.body = { data: { id: parseInt(id) } };
    } catch (error) {
      ctx.throw(500, 'Failed to delete client');
    }
  },

  async findByPhotographer(ctx) {
    try {
      const { photographer_id } = ctx.params;
      const validatedQuery = clientQuerySchema.parse(ctx.query);

      const { page, pageSize, sort, filters, populate } = validatedQuery;

      const finalFilters = {
        ...filters,
        photographer: { id: { $eq: photographer_id } }
      };

      const { results, pagination } = await strapi.service('api::client.client').find({
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
      ctx.throw(500, 'Failed to fetch clients for photographer');
    }
  },

  async updateLifecycleStage(ctx) {
    try {
      const { id } = ctx.params;
      const { lifecycle_stage } = ctx.request.body;

      if (!['lead', 'prospect', 'client', 'past_client', 'inactive'].includes(lifecycle_stage)) {
        return ctx.badRequest('Invalid lifecycle stage');
      }

      const client = await strapi.service('api::client.client').updateLifecycleStage(id, lifecycle_stage);
      if (!client) {
        return ctx.notFound('Client not found');
      }

      ctx.body = { data: client };
    } catch (error) {
      ctx.throw(500, 'Failed to update client lifecycle stage');
    }
  },

  async addTag(ctx) {
    try {
      const { id } = ctx.params;
      const { tag } = ctx.request.body;

      if (!tag || typeof tag !== 'string') {
        return ctx.badRequest('Valid tag string is required');
      }

      const client = await strapi.service('api::client.client').addTag(id, tag);
      if (!client) {
        return ctx.notFound('Client not found');
      }

      ctx.body = { data: client };
    } catch (error) {
      ctx.throw(500, 'Failed to add tag to client');
    }
  },

  async removeTag(ctx) {
    try {
      const { id } = ctx.params;
      const { tag } = ctx.request.body;

      if (!tag || typeof tag !== 'string') {
        return ctx.badRequest('Valid tag string is required');
      }

      const client = await strapi.service('api::client.client').removeTag(id, tag);
      if (!client) {
        return ctx.notFound('Client not found');
      }

      ctx.body = { data: client };
    } catch (error) {
      ctx.throw(500, 'Failed to remove tag from client');
    }
  },

  async updateFollowup(ctx) {
    try {
      const { id } = ctx.params;
      const { next_followup_date } = ctx.request.body;

      const followupSchema = z.object({
        next_followup_date: z.string().datetime().optional(),
      });

      const validatedData = followupSchema.parse({ next_followup_date });

      const client = await strapi.service('api::client.client').updateFollowup(id, validatedData.next_followup_date);
      if (!client) {
        return ctx.notFound('Client not found');
      }

      ctx.body = { data: client };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ctx.badRequest('Invalid date format');
      }
      ctx.throw(500, 'Failed to update followup date');
    }
  },
}));