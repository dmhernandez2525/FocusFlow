import { Knex } from 'knex';

export interface DatabaseConfig {
  client: 'postgresql';
  connection: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl?: boolean | { rejectUnauthorized: boolean };
  };
  pool: {
    min: number;
    max: number;
  };
  migrations: {
    directory: string;
    extension: string;
  };
  seeds: {
    directory: string;
    extension: string;
  };
}

export interface BaseTable {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface PhotographersTable extends BaseTable {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  business_name?: string;
  phone?: string;
  website?: string;
  bio?: string;
  profile_image_url?: string;
  is_active: boolean;
  email_verified: boolean;
  tenant_id: string;
}

export interface ClientsTable extends BaseTable {
  photographer_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  notes?: string;
  preferred_contact_method: 'email' | 'phone' | 'text';
  is_active: boolean;
  tenant_id: string;
}

export interface SessionsTable extends BaseTable {
  photographer_id: string;
  client_id: string;
  session_type: 'wedding' | 'portrait' | 'event' | 'commercial' | 'other';
  title: string;
  description?: string;
  scheduled_date: Date;
  duration_minutes: number;
  location?: string;
  price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  tenant_id: string;
}

export interface GalleriesTable extends BaseTable {
  session_id: string;
  photographer_id: string;
  title: string;
  description?: string;
  cover_photo_url?: string;
  is_public: boolean;
  password_protected: boolean;
  gallery_password?: string;
  expires_at?: Date;
  download_enabled: boolean;
  watermark_enabled: boolean;
  status: 'draft' | 'published' | 'archived';
  tenant_id: string;
}

export interface PhotosTable extends BaseTable {
  gallery_id: string;
  photographer_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  width: number;
  height: number;
  url: string;
  thumbnail_url: string;
  medium_url: string;
  metadata?: Record<string, unknown>;
  is_selected: boolean;
  is_favorite: boolean;
  sort_order: number;
  taken_at?: Date;
  tenant_id: string;
}

export interface PaymentsTable extends BaseTable {
  session_id: string;
  photographer_id: string;
  client_id: string;
  amount: number;
  currency: string;
  payment_method: 'stripe' | 'paypal' | 'bank_transfer' | 'cash' | 'check';
  payment_intent_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paid_at?: Date;
  description?: string;
  metadata?: Record<string, unknown>;
  tenant_id: string;
}

export interface ContractsTable extends BaseTable {
  session_id: string;
  photographer_id: string;
  client_id: string;
  title: string;
  content: string;
  terms_and_conditions: string;
  price: number;
  currency: string;
  status: 'draft' | 'sent' | 'signed' | 'completed' | 'cancelled';
  sent_at?: Date;
  signed_at?: Date;
  signed_by_client_name?: string;
  signed_by_client_ip?: string;
  expires_at?: Date;
  tenant_id: string;
}

export interface WorkflowsTable extends BaseTable {
  photographer_id: string;
  name: string;
  description?: string;
  trigger_event: 'session_created' | 'session_completed' | 'payment_received' | 'contract_signed';
  actions: Array<{
    type: 'email' | 'sms' | 'create_gallery' | 'send_contract' | 'request_payment';
    config: Record<string, unknown>;
    delay_minutes?: number;
  }>;
  is_active: boolean;
  tenant_id: string;
}

export interface Database {
  photographers: PhotographersTable;
  clients: ClientsTable;
  sessions: SessionsTable;
  galleries: GalleriesTable;
  photos: PhotosTable;
  payments: PaymentsTable;
  contracts: ContractsTable;
  workflows: WorkflowsTable;
}

declare module 'knex/types/tables' {
  interface Tables extends Database {}
}