import { factories } from '@strapi/strapi';
import { z } from 'zod';

// Validation schemas
const createPhotographerSchema = z.object({
  business_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[+]?[1-9]?[0-9]{7,15}$/).optional(),
  subscription_tier: z.enum(['free', 'basic', 'professional', 'enterprise']).default('free'),
  subscription_status: z.enum(['active', 'cancelled', 'expired', 'trial']).default('trial'),
  subscription_expires_at: z.string().datetime().optional(),
  settings: z.record(z.unknown()).default({}),
  timezone: z.string().max(50).default('UTC'),
  website_url: z.string().url().optional(),
  logo_url: z.string().url().optional(),
});

const updatePhotographerSchema = createPhotographerSchema.partial();

const photographerQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt:desc'),
  filters: z.record(z.unknown()).default({}),
  populate: z.string().default('*'),
});

interface PhotographerController {
  find(ctx: any): Promise<void>;
  findOne(ctx: any): Promise<void>;
  create(ctx: any): Promise<void>;
  update(ctx: any): Promise<void>;
  delete(ctx: any): Promise<void>;
  me(ctx: any): Promise<void>;
  updateSettings(ctx: any): Promise<void>;
}

export default factories.createCoreController('api::photographer.photographer', ({ strapi }): PhotographerController => ({
  async find(ctx) {
    try {
      const validatedQuery = photographerQuerySchema.parse(ctx.query);

      const { page, pageSize, sort, filters, populate } = validatedQuery;

      const { results, pagination } = await strapi.service('api::photographer.photographer').find({
        page,
        pageSize,
        sort: sort.split(','),
        filters,
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

      const photographer = await strapi.service('api::photographer.photographer').findOne(id, {
        populate,
      });

      if (!photographer) {
        return ctx.notFound('Photographer not found');
      }

      ctx.body = { data: photographer };
    } catch (error) {
      ctx.throw(500, 'Failed to fetch photographer');
    }
  },

  async create(ctx) {
    try {
      const validatedData = createPhotographerSchema.parse(ctx.request.body);

      // Check if email already exists
      const existingPhotographer = await strapi.service('api::photographer.photographer').findByEmail(validatedData.email);
      if (existingPhotographer) {
        return ctx.conflict('Email already registered');
      }

      const photographer = await strapi.service('api::photographer.photographer').create({
        data: validatedData,
      });

      ctx.body = { data: photographer };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ctx.badRequest('Validation failed', { details: error.issues });
      }
      ctx.throw(500, 'Failed to create photographer');
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const validatedData = updatePhotographerSchema.parse(ctx.request.body);

      // Check if photographer exists
      const existingPhotographer = await strapi.service('api::photographer.photographer').findOne(id);
      if (!existingPhotographer) {
        return ctx.notFound('Photographer not found');
      }

      // Check email uniqueness if email is being updated
      if (validatedData.email && validatedData.email !== existingPhotographer.email) {
        const emailExists = await strapi.service('api::photographer.photographer').findByEmail(validatedData.email);
        if (emailExists && emailExists.id !== parseInt(id)) {
          return ctx.conflict('Email already registered');
        }
      }

      const photographer = await strapi.service('api::photographer.photographer').update(id, {
        data: validatedData,
      });

      ctx.body = { data: photographer };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ctx.badRequest('Validation failed', { details: error.issues });
      }
      ctx.throw(500, 'Failed to update photographer');
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;

      const photographer = await strapi.service('api::photographer.photographer').findOne(id);
      if (!photographer) {
        return ctx.notFound('Photographer not found');
      }

      await strapi.service('api::photographer.photographer').delete(id);

      ctx.body = { data: { id: parseInt(id) } };
    } catch (error) {
      ctx.throw(500, 'Failed to delete photographer');
    }
  },

  async me(ctx) {
    try {
      const userId = ctx.state.user?.id;
      if (!userId) {
        return ctx.unauthorized('User not authenticated');
      }

      const photographer = await strapi.service('api::photographer.photographer').findByUserId(userId);
      if (!photographer) {
        return ctx.notFound('Photographer profile not found');
      }

      ctx.body = { data: photographer };
    } catch (error) {
      ctx.throw(500, 'Failed to fetch photographer profile');
    }
  },

  async updateSettings(ctx) {
    try {
      const { id } = ctx.params;
      const { settings } = ctx.request.body;

      if (!settings || typeof settings !== 'object') {
        return ctx.badRequest('Invalid settings format');
      }

      const photographer = await strapi.service('api::photographer.photographer').updateSettings(id, settings);
      if (!photographer) {
        return ctx.notFound('Photographer not found');
      }

      ctx.body = { data: photographer };
    } catch (error) {
      ctx.throw(500, 'Failed to update photographer settings');
    }
  },
}));