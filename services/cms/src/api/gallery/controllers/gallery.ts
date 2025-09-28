import { factories } from '@strapi/strapi';
import { z } from 'zod';

// Validation schemas
const createGallerySchema = z.object({
  gallery_name: z.string().min(2).max(100),
  access_code: z.string().min(6).max(20).regex(/^[a-zA-Z0-9]+$/),
  description: z.string().max(1000).optional(),
  gallery_type: z.enum(['proofing', 'delivery', 'showcase', 'private']).default('proofing'),
  is_public: z.boolean().default(false),
  is_downloadable: z.boolean().default(false),
  allow_selection: z.boolean().default(true),
  allow_comments: z.boolean().default(false),
  watermark_enabled: z.boolean().default(true),
  settings: z.record(z.unknown()).default({}),
  expires_at: z.string().datetime().optional(),
  selection_deadline: z.string().datetime().optional(),
  client_notifications_enabled: z.boolean().default(true),
  password_protected: z.boolean().default(false),
  password: z.string().min(4).optional(),
  cover_photo_url: z.string().url().optional(),
  photographer: z.number().int().positive(),
  session: z.number().int().positive().optional(),
});

const updateGallerySchema = createGallerySchema.partial().omit({ photographer: true, password: true });

const galleryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt:desc'),
  filters: z.record(z.unknown()).default({}),
  populate: z.string().default('*'),
  photographer_id: z.coerce.number().int().positive().optional(),
  session_id: z.coerce.number().int().positive().optional(),
});

interface GalleryController {
  find(ctx: any): Promise<void>;
  findOne(ctx: any): Promise<void>;
  findByAccessCode(ctx: any): Promise<void>;
  create(ctx: any): Promise<void>;
  update(ctx: any): Promise<void>;
  delete(ctx: any): Promise<void>;
  findByPhotographer(ctx: any): Promise<void>;
  findBySession(ctx: any): Promise<void>;
  updateSettings(ctx: any): Promise<void>;
  recordView(ctx: any): Promise<void>;
  updatePassword(ctx: any): Promise<void>;
  validatePassword(ctx: any): Promise<void>;
  updatePhotoCount(ctx: any): Promise<void>;
}

export default factories.createCoreController('api::gallery.gallery', ({ strapi }): GalleryController => ({
  async find(ctx) {
    try {
      const validatedQuery = galleryQuerySchema.parse(ctx.query);
      const { page, pageSize, sort, filters, populate, photographer_id, session_id } = validatedQuery;

      let finalFilters = { ...filters };

      if (photographer_id) {
        finalFilters.photographer = { id: { $eq: photographer_id } };
      }

      if (session_id) {
        finalFilters.session = { id: { $eq: session_id } };
      }

      const { results, pagination } = await strapi.service('api::gallery.gallery').find({
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

      const gallery = await strapi.service('api::gallery.gallery').findOne(id, {
        populate,
      });

      if (!gallery) {
        return ctx.notFound('Gallery not found');
      }

      ctx.body = { data: gallery };
    } catch (error) {
      ctx.throw(500, 'Failed to fetch gallery');
    }
  },

  async findByAccessCode(ctx) {
    try {
      const { access_code } = ctx.params;
      const { populate = '*' } = ctx.query;

      const gallery = await strapi.service('api::gallery.gallery').findByAccessCode(access_code, {
        populate,
      });

      if (!gallery) {
        return ctx.notFound('Gallery not found');
      }

      // Check if gallery is expired
      if (gallery.expires_at && new Date(gallery.expires_at) < new Date()) {
        return ctx.forbidden('Gallery has expired');
      }

      // Don't return password hash
      const sanitizedGallery = { ...gallery };
      delete sanitizedGallery.password_hash;

      ctx.body = { data: sanitizedGallery };
    } catch (error) {
      ctx.throw(500, 'Failed to fetch gallery');
    }
  },

  async create(ctx) {
    try {
      const validatedData = createGallerySchema.parse(ctx.request.body);

      // Verify photographer exists
      const photographer = await strapi.service('api::photographer.photographer').findOne(validatedData.photographer);
      if (!photographer) {
        return ctx.badRequest('Invalid photographer ID');
      }

      // Verify session exists if provided
      if (validatedData.session) {
        const session = await strapi.service('api::session.session').findOne(validatedData.session);
        if (!session) {
          return ctx.badRequest('Invalid session ID');
        }

        // Verify session belongs to photographer
        if (session.photographer?.id !== validatedData.photographer) {
          return ctx.badRequest('Session does not belong to photographer');
        }
      }

      // Check if access code is unique
      const existingGallery = await strapi.service('api::gallery.gallery').findByAccessCode(validatedData.access_code);
      if (existingGallery) {
        return ctx.conflict('Access code already exists');
      }

      const createData = { ...validatedData };
      delete createData.password;

      // Hash password if provided
      if (validatedData.password && validatedData.password_protected) {
        createData.password_hash = await strapi.service('api::gallery.gallery').hashPassword(validatedData.password);
      }

      const gallery = await strapi.service('api::gallery.gallery').create({
        data: createData,
      });

      ctx.body = { data: gallery };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ctx.badRequest('Validation failed', { details: error.issues });
      }
      ctx.throw(500, 'Failed to create gallery');
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const validatedData = updateGallerySchema.parse(ctx.request.body);

      const existingGallery = await strapi.service('api::gallery.gallery').findOne(id);
      if (!existingGallery) {
        return ctx.notFound('Gallery not found');
      }

      // Check access code uniqueness if being updated
      if (validatedData.access_code && validatedData.access_code !== existingGallery.access_code) {
        const codeExists = await strapi.service('api::gallery.gallery').findByAccessCode(validatedData.access_code);
        if (codeExists && codeExists.id !== parseInt(id)) {
          return ctx.conflict('Access code already exists');
        }
      }

      const gallery = await strapi.service('api::gallery.gallery').update(id, {
        data: validatedData,
      });

      ctx.body = { data: gallery };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ctx.badRequest('Validation failed', { details: error.issues });
      }
      ctx.throw(500, 'Failed to update gallery');
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;

      const gallery = await strapi.service('api::gallery.gallery').findOne(id);
      if (!gallery) {
        return ctx.notFound('Gallery not found');
      }

      await strapi.service('api::gallery.gallery').delete(id);

      ctx.body = { data: { id: parseInt(id) } };
    } catch (error) {
      ctx.throw(500, 'Failed to delete gallery');
    }
  },

  async findByPhotographer(ctx) {
    try {
      const { photographer_id } = ctx.params;
      const validatedQuery = galleryQuerySchema.parse(ctx.query);

      const { page, pageSize, sort, filters, populate } = validatedQuery;

      const finalFilters = {
        ...filters,
        photographer: { id: { $eq: photographer_id } }
      };

      const { results, pagination } = await strapi.service('api::gallery.gallery').find({
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
      ctx.throw(500, 'Failed to fetch galleries for photographer');
    }
  },

  async findBySession(ctx) {
    try {
      const { session_id } = ctx.params;
      const validatedQuery = galleryQuerySchema.parse(ctx.query);

      const { page, pageSize, sort, filters, populate } = validatedQuery;

      const finalFilters = {
        ...filters,
        session: { id: { $eq: session_id } }
      };

      const { results, pagination } = await strapi.service('api::gallery.gallery').find({
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
      ctx.throw(500, 'Failed to fetch galleries for session');
    }
  },

  async updateSettings(ctx) {
    try {
      const { id } = ctx.params;
      const { settings } = ctx.request.body;

      if (!settings || typeof settings !== 'object') {
        return ctx.badRequest('Invalid settings format');
      }

      const gallery = await strapi.service('api::gallery.gallery').updateSettings(id, settings);
      if (!gallery) {
        return ctx.notFound('Gallery not found');
      }

      ctx.body = { data: gallery };
    } catch (error) {
      ctx.throw(500, 'Failed to update gallery settings');
    }
  },

  async recordView(ctx) {
    try {
      const { id } = ctx.params;

      const gallery = await strapi.service('api::gallery.gallery').recordView(id);
      if (!gallery) {
        return ctx.notFound('Gallery not found');
      }

      ctx.body = { data: { view_count: gallery.view_count } };
    } catch (error) {
      ctx.throw(500, 'Failed to record gallery view');
    }
  },

  async updatePassword(ctx) {
    try {
      const { id } = ctx.params;
      const { password } = ctx.request.body;

      const passwordSchema = z.object({
        password: z.string().min(4).optional(),
      });

      const validatedData = passwordSchema.parse({ password });

      const gallery = await strapi.service('api::gallery.gallery').updatePassword(id, validatedData.password);
      if (!gallery) {
        return ctx.notFound('Gallery not found');
      }

      ctx.body = { data: { password_protected: gallery.password_protected } };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ctx.badRequest('Invalid password format');
      }
      ctx.throw(500, 'Failed to update gallery password');
    }
  },

  async validatePassword(ctx) {
    try {
      const { access_code } = ctx.params;
      const { password } = ctx.request.body;

      if (!password) {
        return ctx.badRequest('Password is required');
      }

      const isValid = await strapi.service('api::gallery.gallery').validatePassword(access_code, password);

      ctx.body = { data: { valid: isValid } };
    } catch (error) {
      ctx.throw(500, 'Failed to validate password');
    }
  },

  async updatePhotoCount(ctx) {
    try {
      const { id } = ctx.params;
      const { photo_count, selected_photo_count } = ctx.request.body;

      const countSchema = z.object({
        photo_count: z.number().int().min(0).optional(),
        selected_photo_count: z.number().int().min(0).optional(),
      });

      const validatedData = countSchema.parse({ photo_count, selected_photo_count });

      const gallery = await strapi.service('api::gallery.gallery').updatePhotoCount(
        id,
        validatedData.photo_count,
        validatedData.selected_photo_count
      );

      if (!gallery) {
        return ctx.notFound('Gallery not found');
      }

      ctx.body = { data: gallery };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ctx.badRequest('Invalid count data');
      }
      ctx.throw(500, 'Failed to update photo count');
    }
  },
}));