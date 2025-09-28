import { UUID, ISODateString, Email, Address, Timestamps } from './common';

export type ClientLifecycleStage = 'prospect' | 'lead' | 'customer' | 'repeat' | 'inactive';

export interface ClientCustomFields {
  [key: string]: string | number | boolean | null;
}

export interface Client extends Timestamps {
  id: UUID;
  photographer_id: UUID;
  name: string;
  email?: Email;
  phone?: string;
  secondary_phone?: string;
  address?: Address;
  tags: string[];
  lifecycle_stage: ClientLifecycleStage;
  total_lifetime_value: number;
  last_interaction_at?: ISODateString;
  notes?: string;
  custom_fields: ClientCustomFields;
  is_archived: boolean;
  birthday?: ISODateString;
  anniversary?: ISODateString;
  partner_name?: string;
  children_names?: string[];
  referred_by?: UUID; // Reference to another client
  referral_count: number;
  preferred_contact_method?: 'email' | 'phone' | 'sms';
  marketing_consent: boolean;
  marketing_consent_date?: ISODateString;
}

export interface ClientStats {
  total_sessions: number;
  total_spent: number;
  average_order_value: number;
  last_session_date?: ISODateString;
  next_session_date?: ISODateString;
  total_photos_purchased: number;
  total_referrals: number;
}

export interface ClientInteraction {
  id: UUID;
  client_id: UUID;
  photographer_id: UUID;
  type: InteractionType;
  date: ISODateString;
  duration_minutes?: number;
  notes?: string;
  outcome?: string;
  follow_up_required: boolean;
  follow_up_date?: ISODateString;
}

export type InteractionType =
  | 'phone_call'
  | 'email'
  | 'sms'
  | 'meeting'
  | 'session'
  | 'consultation'
  | 'complaint'
  | 'feedback';

export interface ClientSegment {
  id: UUID;
  photographer_id: UUID;
  name: string;
  description?: string;
  criteria: SegmentCriteria[];
  client_count: number;
  is_dynamic: boolean; // Auto-update based on criteria
}

export interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: string | number | boolean | string[];
}

export interface ClientImportMapping {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tags?: string;
  notes?: string;
  custom_fields?: Record<string, string>;
}