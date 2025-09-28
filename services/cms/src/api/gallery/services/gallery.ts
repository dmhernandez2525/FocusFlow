import { factories } from '@strapi/strapi';
import bcrypt from 'bcrypt';

interface FindParams {
  page?: number;
  pageSize?: number;
  sort?: string[];
  filters?: Record<string, unknown>;
  populate?: string | string[] | Record<string, unknown>;
}

interface GalleryService {
  find(params: FindParams): Promise<{ results: any[]; pagination: any }>;
  findOne(id: string | number, params?: { populate?: string | string[] }): Promise<any>;
  findByAccessCode(accessCode: string, params?: { populate?: string | string[] }): Promise<any>;
  findByPhotographer(photographerId: string | number, params?: FindParams): Promise<{ results: any[]; pagination: any }>;
  findBySession(sessionId: string | number, params?: FindParams): Promise<{ results: any[]; pagination: any }>;
  create(params: { data: any }): Promise<any>;
  update(id: string | number, params: { data: any }): Promise<any>;
  delete(id: string | number): Promise<any>;
  updateSettings(id: string | number, settings: Record<string, unknown>): Promise<any>;
  recordView(id: string | number): Promise<any>;
  hashPassword(password: string): Promise<string>;
  updatePassword(id: string | number, password?: string): Promise<any>;
  validatePassword(accessCode: string, password: string): Promise<boolean>;
  updatePhotoCount(id: string | number, photoCount?: number, selectedCount?: number): Promise<any>;
  getExpiredGalleries(): Promise<any[]>;
  getGalleriesByType(photographerId: string | number, type: string): Promise<any[]>;
  generateUniqueAccessCode(): Promise<string>;
  bulkUpdateSettings(galleryIds: number[], settings: Record<string, unknown>): Promise<any[]>;
}

export default factories.createCoreService('api::gallery.gallery', ({ strapi }): GalleryService => ({
  async find(params: FindParams) {
    const { page = 1, pageSize = 25, sort = ['createdAt:desc'], filters = {}, populate } = params;

    try {
      const { results, pagination } = await strapi.documents('api::gallery.gallery').findMany({
        page,
        pageSize,
        sort,
        filters,
        populate,
      });

      return { results, pagination };
    } catch (error) {
      throw new Error('Failed to fetch galleries');
    }
  },

  async findOne(id: string | number, params = {}) {
    try {
      const gallery = await strapi.documents('api::gallery.gallery').findOne({
        documentId: id.toString(),
        ...params,
      });

      return gallery;
    } catch (error) {
      throw new Error('Failed to fetch gallery');
    }
  },

  async findByAccessCode(accessCode: string, params = {}) {
    try {
      const galleries = await strapi.documents('api::gallery.gallery').findMany({
        filters: { access_code: { $eq: accessCode } },
        page: 1,
        pageSize: 1,
        ...params,
      });

      return galleries.results[0] || null;
    } catch (error) {
      throw new Error('Failed to find gallery by access code');
    }
  },

  async findByPhotographer(photographerId: string | number, params: FindParams = {}) {
    try {
      const filters = {
        ...params.filters,
        photographer: { id: { $eq: photographerId } }
      };

      return await this.find({
        ...params,
        filters,
      });
    } catch (error) {
      throw new Error('Failed to fetch galleries by photographer');
    }
  },

  async findBySession(sessionId: string | number, params: FindParams = {}) {
    try {
      const filters = {
        ...params.filters,
        session: { id: { $eq: sessionId } }
      };

      return await this.find({
        ...params,
        filters,
      });
    } catch (error) {
      throw new Error('Failed to fetch galleries by session');
    }
  },

  async create(params: { data: any }) {
    try {
      const gallery = await strapi.documents('api::gallery.gallery').create({
        data: {
          ...params.data,
          publishedAt: new Date(),
        },
      });

      return gallery;
    } catch (error) {
      throw new Error('Failed to create gallery');
    }
  },

  async update(id: string | number, params: { data: any }) {
    try {
      const gallery = await strapi.documents('api::gallery.gallery').update({
        documentId: id.toString(),
        data: params.data,
      });

      return gallery;
    } catch (error) {
      throw new Error('Failed to update gallery');
    }
  },

  async delete(id: string | number) {
    try {
      const result = await strapi.documents('api::gallery.gallery').delete({
        documentId: id.toString(),
      });

      return result;
    } catch (error) {
      throw new Error('Failed to delete gallery');
    }
  },

  async updateSettings(id: string | number, settings: Record<string, unknown>) {
    try {
      const gallery = await this.findOne(id);
      if (!gallery) {
        return null;
      }

      const mergedSettings = {
        ...gallery.settings,
        ...settings,
      };

      const updatedGallery = await this.update(id, {
        data: { settings: mergedSettings },
      });

      return updatedGallery;
    } catch (error) {
      throw new Error('Failed to update gallery settings');
    }
  },

  async recordView(id: string | number) {
    try {
      const gallery = await this.findOne(id);
      if (!gallery) {
        return null;
      }

      const updatedGallery = await this.update(id, {
        data: {
          view_count: (gallery.view_count || 0) + 1,
          last_viewed_at: new Date().toISOString(),
        },
      });

      return updatedGallery;
    } catch (error) {
      throw new Error('Failed to record gallery view');
    }
  },

  async hashPassword(password: string) {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  },

  async updatePassword(id: string | number, password?: string) {
    try {
      const updateData: Record<string, unknown> = {
        password_protected: !!password,
      };

      if (password) {
        updateData.password_hash = await this.hashPassword(password);
      } else {
        updateData.password_hash = null;
      }

      const gallery = await this.update(id, {
        data: updateData,
      });

      return gallery;
    } catch (error) {
      throw new Error('Failed to update gallery password');
    }
  },

  async validatePassword(accessCode: string, password: string) {
    try {
      const gallery = await this.findByAccessCode(accessCode);
      if (!gallery || !gallery.password_protected || !gallery.password_hash) {
        return false;
      }

      return await bcrypt.compare(password, gallery.password_hash);
    } catch (error) {
      throw new Error('Failed to validate password');
    }
  },

  async updatePhotoCount(id: string | number, photoCount?: number, selectedCount?: number) {
    try {
      const updateData: Record<string, unknown> = {};

      if (photoCount !== undefined) {
        updateData.photo_count = photoCount;
      }

      if (selectedCount !== undefined) {
        updateData.selected_photo_count = selectedCount;
      }

      const gallery = await this.update(id, {
        data: updateData,
      });

      return gallery;
    } catch (error) {
      throw new Error('Failed to update photo count');
    }
  },

  async getExpiredGalleries() {
    try {
      const { results } = await this.find({
        filters: {
          expires_at: {
            $lt: new Date().toISOString(),
          },
          is_active: true,
        },
        pageSize: 100,
        sort: ['expires_at:asc'],
      });

      return results;
    } catch (error) {
      throw new Error('Failed to get expired galleries');
    }
  },

  async getGalleriesByType(photographerId: string | number, type: string) {
    try {
      const { results } = await this.findByPhotographer(photographerId, {
        filters: { gallery_type: { $eq: type } },
        sort: ['createdAt:desc'],
        pageSize: 100,
      });

      return results;
    } catch (error) {
      throw new Error('Failed to get galleries by type');
    }
  },

  async generateUniqueAccessCode() {
    try {
      const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      let accessCode: string;
      let exists = true;

      // Keep generating until we find a unique code
      while (exists) {
        accessCode = generateCode();
        const existingGallery = await this.findByAccessCode(accessCode);
        exists = !!existingGallery;
      }

      return accessCode!;
    } catch (error) {
      throw new Error('Failed to generate unique access code');
    }
  },

  async bulkUpdateSettings(galleryIds: number[], settings: Record<string, unknown>) {
    try {
      const updatedGalleries = [];

      for (const galleryId of galleryIds) {
        const gallery = await this.updateSettings(galleryId, settings);
        if (gallery) {
          updatedGalleries.push(gallery);
        }
      }

      return updatedGalleries;
    } catch (error) {
      throw new Error('Failed to bulk update gallery settings');
    }
  },
}));