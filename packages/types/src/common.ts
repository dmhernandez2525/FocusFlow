/**
 * Common types shared across the platform
 * NO any types, all strictly typed
 */

export type UUID = string;
export type ISODateString = string;
export type Email = string;
export type URL = string;

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Timestamps {
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type SubscriptionTier = 'starter' | 'professional' | 'studio' | 'enterprise';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'paused' | 'cancelled' | 'cancelling';

export interface Money {
  amount: number;
  currency: string;
}

export interface FileUpload {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface S3Location {
  bucket: string;
  key: string;
  region: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DateRange {
  start_date: ISODateString;
  end_date: ISODateString;
}

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationType =
  | 'booking_confirmation'
  | 'payment_received'
  | 'gallery_published'
  | 'contract_signed'
  | 'reminder'
  | 'marketing';

export interface Notification {
  id: UUID;
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  content: string;
  metadata: Record<string, unknown>;
  sent_at?: ISODateString;
  read_at?: ISODateString;
  error?: string;
}