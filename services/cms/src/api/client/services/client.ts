import { factories } from '@strapi/strapi';

interface FindParams {
  page?: number;
  pageSize?: number;
  sort?: string[];
  filters?: Record<string, unknown>;
  populate?: string | string[] | Record<string, unknown>;
}

interface ClientService {
  find(params: FindParams): Promise<{ results: any[]; pagination: any }>;
  findOne(id: string | number, params?: { populate?: string | string[] }): Promise<any>;
  findByPhotographer(photographerId: string | number, params?: FindParams): Promise<{ results: any[]; pagination: any }>;
  findByEmail(email: string, photographerId?: string | number): Promise<any>;
  create(params: { data: any }): Promise<any>;
  update(id: string | number, params: { data: any }): Promise<any>;
  delete(id: string | number): Promise<any>;
  updateLifecycleStage(id: string | number, stage: string): Promise<any>;
  addTag(id: string | number, tag: string): Promise<any>;
  removeTag(id: string | number, tag: string): Promise<any>;
  updateFollowup(id: string | number, followupDate?: string): Promise<any>;
  updateLastContact(id: string | number): Promise<any>;
  getClientsByStage(photographerId: string | number): Promise<Record<string, any[]>>;
  getUpcomingFollowups(photographerId: string | number, days?: number): Promise<any[]>;
  bulkUpdateStage(clientIds: number[], stage: string): Promise<any[]>;
  searchClients(photographerId: string | number, query: string): Promise<any[]>;
}

export default factories.createCoreService('api::client.client', ({ strapi }): ClientService => ({
  async find(params: FindParams) {
    const { page = 1, pageSize = 25, sort = ['createdAt:desc'], filters = {}, populate } = params;

    try {
      const { results, pagination } = await strapi.documents('api::client.client').findMany({
        page,
        pageSize,
        sort,
        filters,
        populate,
      });

      return { results, pagination };
    } catch (error) {
      throw new Error('Failed to fetch clients');
    }
  },

  async findOne(id: string | number, params = {}) {
    try {
      const client = await strapi.documents('api::client.client').findOne({
        documentId: id.toString(),
        ...params,
      });

      return client;
    } catch (error) {
      throw new Error('Failed to fetch client');
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
      throw new Error('Failed to fetch clients by photographer');
    }
  },

  async findByEmail(email: string, photographerId?: string | number) {
    try {
      const filters: Record<string, unknown> = { email: { $eq: email } };

      if (photographerId) {
        filters.photographer = { id: { $eq: photographerId } };
      }

      const clients = await strapi.documents('api::client.client').findMany({
        filters,
        page: 1,
        pageSize: 1,
      });

      return clients.results[0] || null;
    } catch (error) {
      throw new Error('Failed to find client by email');
    }
  },

  async create(params: { data: any }) {
    try {
      const client = await strapi.documents('api::client.client').create({
        data: {
          ...params.data,
          publishedAt: new Date(),
        },
      });

      return client;
    } catch (error) {
      throw new Error('Failed to create client');
    }
  },

  async update(id: string | number, params: { data: any }) {
    try {
      const client = await strapi.documents('api::client.client').update({
        documentId: id.toString(),
        data: params.data,
      });

      return client;
    } catch (error) {
      throw new Error('Failed to update client');
    }
  },

  async delete(id: string | number) {
    try {
      const result = await strapi.documents('api::client.client').delete({
        documentId: id.toString(),
      });

      return result;
    } catch (error) {
      throw new Error('Failed to delete client');
    }
  },

  async updateLifecycleStage(id: string | number, stage: string) {
    try {
      const client = await this.update(id, {
        data: {
          lifecycle_stage: stage,
          last_contact_date: new Date().toISOString(),
        },
      });

      return client;
    } catch (error) {
      throw new Error('Failed to update client lifecycle stage');
    }
  },

  async addTag(id: string | number, tag: string) {
    try {
      const client = await this.findOne(id);
      if (!client) {
        return null;
      }

      const currentTags = Array.isArray(client.tags) ? client.tags : [];
      if (!currentTags.includes(tag)) {
        const updatedTags = [...currentTags, tag];
        return await this.update(id, {
          data: { tags: updatedTags },
        });
      }

      return client;
    } catch (error) {
      throw new Error('Failed to add tag to client');
    }
  },

  async removeTag(id: string | number, tag: string) {
    try {
      const client = await this.findOne(id);
      if (!client) {
        return null;
      }

      const currentTags = Array.isArray(client.tags) ? client.tags : [];
      const updatedTags = currentTags.filter((t: string) => t !== tag);

      return await this.update(id, {
        data: { tags: updatedTags },
      });
    } catch (error) {
      throw new Error('Failed to remove tag from client');
    }
  },

  async updateFollowup(id: string | number, followupDate?: string) {
    try {
      const updateData: Record<string, unknown> = {
        next_followup_date: followupDate || null,
      };

      const client = await this.update(id, {
        data: updateData,
      });

      return client;
    } catch (error) {
      throw new Error('Failed to update followup date');
    }
  },

  async updateLastContact(id: string | number) {
    try {
      const client = await this.update(id, {
        data: {
          last_contact_date: new Date().toISOString(),
        },
      });

      return client;
    } catch (error) {
      throw new Error('Failed to update last contact date');
    }
  },

  async getClientsByStage(photographerId: string | number) {
    try {
      const { results } = await this.findByPhotographer(photographerId, {
        pageSize: 1000,
        populate: [],
      });

      const clientsByStage = results.reduce((acc, client) => {
        const stage = client.lifecycle_stage;
        if (!acc[stage]) {
          acc[stage] = [];
        }
        acc[stage].push(client);
        return acc;
      }, {} as Record<string, any[]>);

      return clientsByStage;
    } catch (error) {
      throw new Error('Failed to get clients by stage');
    }
  },

  async getUpcomingFollowups(photographerId: string | number, days: number = 7) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { results } = await this.findByPhotographer(photographerId, {
        filters: {
          next_followup_date: {
            $lte: futureDate.toISOString(),
            $gte: new Date().toISOString(),
          },
        },
        sort: ['next_followup_date:asc'],
        pageSize: 100,
      });

      return results;
    } catch (error) {
      throw new Error('Failed to get upcoming followups');
    }
  },

  async bulkUpdateStage(clientIds: number[], stage: string) {
    try {
      const updatedClients = [];

      for (const clientId of clientIds) {
        const client = await this.updateLifecycleStage(clientId, stage);
        if (client) {
          updatedClients.push(client);
        }
      }

      return updatedClients;
    } catch (error) {
      throw new Error('Failed to bulk update client stages');
    }
  },

  async searchClients(photographerId: string | number, query: string) {
    try {
      const { results } = await this.findByPhotographer(photographerId, {
        filters: {
          $or: [
            { first_name: { $containsi: query } },
            { last_name: { $containsi: query } },
            { email: { $containsi: query } },
            { phone: { $containsi: query } },
          ],
        },
        pageSize: 50,
        sort: ['first_name:asc', 'last_name:asc'],
      });

      return results;
    } catch (error) {
      throw new Error('Failed to search clients');
    }
  },
}));