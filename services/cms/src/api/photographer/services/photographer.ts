import { factories } from '@strapi/strapi';

interface FindParams {
  page?: number;
  pageSize?: number;
  sort?: string[];
  filters?: Record<string, unknown>;
  populate?: string | string[] | Record<string, unknown>;
}

interface PhotographerService {
  find(params: FindParams): Promise<{ results: any[]; pagination: any }>;
  findOne(id: string | number, params?: { populate?: string | string[] }): Promise<any>;
  findByEmail(email: string): Promise<any>;
  findByUserId(userId: string | number): Promise<any>;
  create(params: { data: any }): Promise<any>;
  update(id: string | number, params: { data: any }): Promise<any>;
  delete(id: string | number): Promise<any>;
  updateSettings(id: string | number, settings: Record<string, unknown>): Promise<any>;
  updateSubscription(id: string | number, subscriptionData: {
    subscription_tier?: string;
    subscription_status?: string;
    subscription_expires_at?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
  }): Promise<any>;
  deactivate(id: string | number): Promise<any>;
  activate(id: string | number): Promise<any>;
  getActivePhotographers(): Promise<any[]>;
  getSubscriptionStats(): Promise<Record<string, number>>;
}

export default factories.createCoreService('api::photographer.photographer', ({ strapi }): PhotographerService => ({
  async find(params: FindParams) {
    const { page = 1, pageSize = 25, sort = ['createdAt:desc'], filters = {}, populate } = params;

    try {
      const { results, pagination } = await strapi.documents('api::photographer.photographer').findMany({
        page,
        pageSize,
        sort,
        filters,
        populate,
      });

      return { results, pagination };
    } catch (error) {
      throw new Error('Failed to fetch photographers');
    }
  },

  async findOne(id: string | number, params = {}) {
    try {
      const photographer = await strapi.documents('api::photographer.photographer').findOne({
        documentId: id.toString(),
        ...params,
      });

      return photographer;
    } catch (error) {
      throw new Error('Failed to fetch photographer');
    }
  },

  async findByEmail(email: string) {
    try {
      const photographers = await strapi.documents('api::photographer.photographer').findMany({
        filters: { email: { $eq: email } },
        page: 1,
        pageSize: 1,
      });

      return photographers.results[0] || null;
    } catch (error) {
      throw new Error('Failed to find photographer by email');
    }
  },

  async findByUserId(userId: string | number) {
    try {
      // Assuming user relation exists or implement your auth strategy
      const photographers = await strapi.documents('api::photographer.photographer').findMany({
        filters: { user_id: { $eq: userId } },
        page: 1,
        pageSize: 1,
      });

      return photographers.results[0] || null;
    } catch (error) {
      throw new Error('Failed to find photographer by user ID');
    }
  },

  async create(params: { data: any }) {
    try {
      const photographer = await strapi.documents('api::photographer.photographer').create({
        data: {
          ...params.data,
          publishedAt: new Date(),
        },
      });

      return photographer;
    } catch (error) {
      throw new Error('Failed to create photographer');
    }
  },

  async update(id: string | number, params: { data: any }) {
    try {
      const photographer = await strapi.documents('api::photographer.photographer').update({
        documentId: id.toString(),
        data: params.data,
      });

      return photographer;
    } catch (error) {
      throw new Error('Failed to update photographer');
    }
  },

  async delete(id: string | number) {
    try {
      const result = await strapi.documents('api::photographer.photographer').delete({
        documentId: id.toString(),
      });

      return result;
    } catch (error) {
      throw new Error('Failed to delete photographer');
    }
  },

  async updateSettings(id: string | number, settings: Record<string, unknown>) {
    try {
      const photographer = await this.findOne(id);
      if (!photographer) {
        return null;
      }

      const mergedSettings = {
        ...photographer.settings,
        ...settings,
      };

      const updatedPhotographer = await this.update(id, {
        data: { settings: mergedSettings },
      });

      return updatedPhotographer;
    } catch (error) {
      throw new Error('Failed to update photographer settings');
    }
  },

  async updateSubscription(id: string | number, subscriptionData: {
    subscription_tier?: string;
    subscription_status?: string;
    subscription_expires_at?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
  }) {
    try {
      const photographer = await this.update(id, {
        data: subscriptionData,
      });

      return photographer;
    } catch (error) {
      throw new Error('Failed to update photographer subscription');
    }
  },

  async deactivate(id: string | number) {
    try {
      const photographer = await this.update(id, {
        data: { is_active: false },
      });

      return photographer;
    } catch (error) {
      throw new Error('Failed to deactivate photographer');
    }
  },

  async activate(id: string | number) {
    try {
      const photographer = await this.update(id, {
        data: { is_active: true },
      });

      return photographer;
    } catch (error) {
      throw new Error('Failed to activate photographer');
    }
  },

  async getActivePhotographers() {
    try {
      const { results } = await this.find({
        filters: { is_active: { $eq: true } },
        pageSize: 1000,
        sort: ['business_name:asc'],
      });

      return results;
    } catch (error) {
      throw new Error('Failed to fetch active photographers');
    }
  },

  async getSubscriptionStats() {
    try {
      const { results: allPhotographers } = await this.find({
        pageSize: 10000,
        populate: [],
      });

      const stats = allPhotographers.reduce((acc, photographer) => {
        const tier = photographer.subscription_tier;
        const status = photographer.subscription_status;

        acc[`tier_${tier}`] = (acc[`tier_${tier}`] || 0) + 1;
        acc[`status_${status}`] = (acc[`status_${status}`] || 0) + 1;

        return acc;
      }, {} as Record<string, number>);

      return stats;
    } catch (error) {
      throw new Error('Failed to get subscription stats');
    }
  },
}));