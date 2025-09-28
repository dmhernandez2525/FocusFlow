import { UUID } from './common';

/**
 * API Request and Response types
 * NO any types - all strictly typed
 */

export interface ApiRequest<T = Record<string, unknown>> {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  headers: Record<string, string>;
  query?: Record<string, string | number | boolean>;
  body?: T;
  user?: AuthenticatedUser;
}

export interface AuthenticatedUser {
  id: UUID;
  email: string;
  photographer_id: UUID;
  role: UserRole;
  permissions: Permission[];
  session_id: string;
}

export type UserRole = 'photographer' | 'admin' | 'client' | 'assistant';

export type Permission =
  | 'manage_clients'
  | 'manage_sessions'
  | 'manage_galleries'
  | 'manage_payments'
  | 'manage_contracts'
  | 'manage_settings'
  | 'view_analytics'
  | 'export_data';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  metadata?: ResponseMetadata;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ValidationError[] | Record<string, unknown>;
    stack?: string;  // Only in development
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ResponseMetadata {
  timestamp: string;
  request_id: string;
  version: string;
  pagination?: PaginationMetadata;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface WebhookPayload<T = Record<string, unknown>> {
  id: string;
  timestamp: string;
  event: string;
  data: T;
  signature: string;
}

export interface StripeWebhookPayload {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    object: Record<string, unknown>;
    previous_attributes?: Record<string, unknown>;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string | null;
    idempotency_key: string | null;
  };
  type: string;
}

export interface IdempotencyRequest<T = Record<string, unknown>> {
  key: string;
  request: ApiRequest<T>;
  ttl_seconds?: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset_at: string;
  retry_after?: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  uptime_seconds: number;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  response_time_ms?: number;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface FileUploadResponse {
  file_id: UUID;
  filename: string;
  size_bytes: number;
  mime_type: string;
  url: string;
  thumbnail_url?: string;
  metadata?: Record<string, unknown>;
}

export interface BatchOperationRequest<T = Record<string, unknown>> {
  operations: Array<{
    id: string;
    method: 'CREATE' | 'UPDATE' | 'DELETE';
    data: T;
  }>;
  transaction?: boolean;  // Run all in a transaction
  continue_on_error?: boolean;
}

export interface BatchOperationResponse<T = Record<string, unknown>> {
  results: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: {
      code: string;
      message: string;
    };
  }>;
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}

export interface ExportRequest {
  entity_type: 'clients' | 'sessions' | 'payments' | 'photos';
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  filters?: Record<string, unknown>;
  fields?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ExportResponse {
  export_id: UUID;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  expires_at?: string;
  file_size_bytes?: number;
}