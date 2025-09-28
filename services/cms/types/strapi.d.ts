import type { Strapi } from '@strapi/strapi';

declare global {
  var strapi: Strapi;
}

export interface StrapiContext {
  strapi: Strapi;
}

export interface DocumentServiceParams {
  fields?: string[];
  populate?: string[] | Record<string, unknown>;
  filters?: Record<string, unknown>;
  sort?: string | string[] | Record<string, unknown>;
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
  };
  locale?: string;
  status?: 'draft' | 'published';
}

export interface DocumentServiceCreateParams {
  data: Record<string, unknown>;
  locale?: string;
  status?: 'draft' | 'published';
}

export interface DocumentServiceUpdateParams {
  documentId: string;
  data: Record<string, unknown>;
  locale?: string;
  status?: 'draft' | 'published';
}

export interface DocumentService {
  findOne(documentId: string, params?: DocumentServiceParams): Promise<unknown>;
  findMany(params?: DocumentServiceParams): Promise<unknown[]>;
  findFirst(params?: DocumentServiceParams): Promise<unknown>;
  create(params: DocumentServiceCreateParams): Promise<unknown>;
  update(params: DocumentServiceUpdateParams): Promise<unknown>;
  delete(documentId: string, params?: { locale?: string }): Promise<unknown>;
  count(params?: Omit<DocumentServiceParams, 'fields' | 'populate' | 'sort' | 'pagination'>): Promise<number>;
  clone(documentId: string, params?: { data?: Record<string, unknown>; locale?: string }): Promise<unknown>;
}

declare module '@strapi/strapi' {
  interface Strapi {
    documents(uid: string): DocumentService;
  }
}