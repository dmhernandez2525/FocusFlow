import { factories } from '@strapi/strapi';

interface FindParams {
  page?: number;
  pageSize?: number;
  sort?: string[];
  filters?: Record<string, unknown>;
  populate?: string | string[] | Record<string, unknown>;
}

interface SessionService {
  find(params: FindParams): Promise<{ results: any[]; pagination: any }>;
  findOne(id: string | number, params?: { populate?: string | string[] }): Promise<any>;
  findByPhotographer(photographerId: string | number, params?: FindParams): Promise<{ results: any[]; pagination: any }>;
  findByClient(clientId: string | number, params?: FindParams): Promise<{ results: any[]; pagination: any }>;
  create(params: { data: any }): Promise<any>;
  update(id: string | number, params: { data: any }): Promise<any>;
  delete(id: string | number): Promise<any>;
  updateStatus(id: string | number, status: string): Promise<any>;
  updatePaymentStatus(id: string | number, paymentData: { deposit_paid?: boolean; final_payment_paid?: boolean }): Promise<any>;
  updateContractStatus(id: string | number, contractData: { contract_status?: string; contract_signed?: boolean }): Promise<any>;
  markDelivered(id: string | number): Promise<any>;
  updatePhotoCount(id: string | number, photoCount: number, selectedCount?: number): Promise<any>;
  getUpcomingSessions(photographerId: string | number, days?: number): Promise<any[]>;
  getOverdueSessions(photographerId: string | number): Promise<any[]>;
  getSessionsByStatus(photographerId: string | number, status: string): Promise<any[]>;
  getRevenueStats(photographerId: string | number, startDate?: string, endDate?: string): Promise<Record<string, number>>;
  bulkUpdateStatus(sessionIds: number[], status: string): Promise<any[]>;
}

export default factories.createCoreService('api::session.session', ({ strapi }): SessionService => ({
  async find(params: FindParams) {
    const { page = 1, pageSize = 25, sort = ['session_date:desc'], filters = {}, populate } = params;

    try {
      const { results, pagination } = await strapi.documents('api::session.session').findMany({
        page,
        pageSize,
        sort,
        filters,
        populate,
      });

      return { results, pagination };
    } catch (error) {
      throw new Error('Failed to fetch sessions');
    }
  },

  async findOne(id: string | number, params = {}) {
    try {
      const session = await strapi.documents('api::session.session').findOne({
        documentId: id.toString(),
        ...params,
      });

      return session;
    } catch (error) {
      throw new Error('Failed to fetch session');
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
      throw new Error('Failed to fetch sessions by photographer');
    }
  },

  async findByClient(clientId: string | number, params: FindParams = {}) {
    try {
      const filters = {
        ...params.filters,
        client: { id: { $eq: clientId } }
      };

      return await this.find({
        ...params,
        filters,
      });
    } catch (error) {
      throw new Error('Failed to fetch sessions by client');
    }
  },

  async create(params: { data: any }) {
    try {
      const session = await strapi.documents('api::session.session').create({
        data: {
          ...params.data,
          publishedAt: new Date(),
        },
      });

      return session;
    } catch (error) {
      throw new Error('Failed to create session');
    }
  },

  async update(id: string | number, params: { data: any }) {
    try {
      const session = await strapi.documents('api::session.session').update({
        documentId: id.toString(),
        data: params.data,
      });

      return session;
    } catch (error) {
      throw new Error('Failed to update session');
    }
  },

  async delete(id: string | number) {
    try {
      const result = await strapi.documents('api::session.session').delete({
        documentId: id.toString(),
      });

      return result;
    } catch (error) {
      throw new Error('Failed to delete session');
    }
  },

  async updateStatus(id: string | number, status: string) {
    try {
      const updateData: Record<string, unknown> = { status };

      // Auto-update certain fields based on status
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      } else if (status === 'in_progress') {
        updateData.delivered_at = null;
      }

      const session = await this.update(id, {
        data: updateData,
      });

      return session;
    } catch (error) {
      throw new Error('Failed to update session status');
    }
  },

  async updatePaymentStatus(id: string | number, paymentData: { deposit_paid?: boolean; final_payment_paid?: boolean }) {
    try {
      const session = await this.update(id, {
        data: paymentData,
      });

      return session;
    } catch (error) {
      throw new Error('Failed to update payment status');
    }
  },

  async updateContractStatus(id: string | number, contractData: { contract_status?: string; contract_signed?: boolean }) {
    try {
      const updateData: Record<string, unknown> = { ...contractData };

      // Auto-update contract_signed based on status
      if (contractData.contract_status === 'signed') {
        updateData.contract_signed = true;
      } else if (contractData.contract_status === 'not_sent' || contractData.contract_status === 'sent') {
        updateData.contract_signed = false;
      }

      const session = await this.update(id, {
        data: updateData,
      });

      return session;
    } catch (error) {
      throw new Error('Failed to update contract status');
    }
  },

  async markDelivered(id: string | number) {
    try {
      const session = await this.update(id, {
        data: {
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        },
      });

      return session;
    } catch (error) {
      throw new Error('Failed to mark session as delivered');
    }
  },

  async updatePhotoCount(id: string | number, photoCount: number, selectedCount?: number) {
    try {
      const updateData: Record<string, unknown> = { photo_count: photoCount };

      if (selectedCount !== undefined) {
        updateData.selected_photo_count = selectedCount;
      }

      const session = await this.update(id, {
        data: updateData,
      });

      return session;
    } catch (error) {
      throw new Error('Failed to update photo count');
    }
  },

  async getUpcomingSessions(photographerId: string | number, days: number = 30) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { results } = await this.findByPhotographer(photographerId, {
        filters: {
          session_date: {
            $gte: new Date().toISOString(),
            $lte: futureDate.toISOString(),
          },
          status: {
            $in: ['booked', 'confirmed', 'in_progress'],
          },
        },
        sort: ['session_date:asc'],
        pageSize: 100,
        populate: ['client', 'photographer'],
      });

      return results;
    } catch (error) {
      throw new Error('Failed to get upcoming sessions');
    }
  },

  async getOverdueSessions(photographerId: string | number) {
    try {
      const { results } = await this.findByPhotographer(photographerId, {
        filters: {
          delivery_deadline: {
            $lt: new Date().toISOString(),
          },
          status: {
            $in: ['completed'],
          },
        },
        sort: ['delivery_deadline:asc'],
        pageSize: 100,
        populate: ['client', 'photographer'],
      });

      return results;
    } catch (error) {
      throw new Error('Failed to get overdue sessions');
    }
  },

  async getSessionsByStatus(photographerId: string | number, status: string) {
    try {
      const { results } = await this.findByPhotographer(photographerId, {
        filters: { status: { $eq: status } },
        sort: ['session_date:desc'],
        pageSize: 100,
        populate: ['client'],
      });

      return results;
    } catch (error) {
      throw new Error('Failed to get sessions by status');
    }
  },

  async getRevenueStats(photographerId: string | number, startDate?: string, endDate?: string) {
    try {
      const filters: Record<string, unknown> = {
        photographer: { id: { $eq: photographerId } },
        status: { $in: ['completed', 'delivered'] },
      };

      if (startDate && endDate) {
        filters.session_date = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      const { results } = await this.find({
        filters,
        pageSize: 1000,
        populate: [],
      });

      const stats = results.reduce((acc, session) => {
        const totalAmount = session.total_amount || 0;
        const depositAmount = session.deposit_amount || 0;
        const finalAmount = session.final_payment_amount || 0;

        acc.total_revenue += totalAmount;
        acc.total_deposits += depositAmount;
        acc.total_final_payments += finalAmount;
        acc.session_count += 1;

        if (session.deposit_paid) {
          acc.deposits_collected += depositAmount;
        }

        if (session.final_payment_paid) {
          acc.final_payments_collected += finalAmount;
        }

        return acc;
      }, {
        total_revenue: 0,
        total_deposits: 0,
        total_final_payments: 0,
        deposits_collected: 0,
        final_payments_collected: 0,
        session_count: 0,
      });

      return stats;
    } catch (error) {
      throw new Error('Failed to get revenue stats');
    }
  },

  async bulkUpdateStatus(sessionIds: number[], status: string) {
    try {
      const updatedSessions = [];

      for (const sessionId of sessionIds) {
        const session = await this.updateStatus(sessionId, status);
        if (session) {
          updatedSessions.push(session);
        }
      }

      return updatedSessions;
    } catch (error) {
      throw new Error('Failed to bulk update session status');
    }
  },
}));