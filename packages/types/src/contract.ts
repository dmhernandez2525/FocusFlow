import { UUID, ISODateString, Timestamps } from './common';

export type ContractStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'signed'
  | 'countersigned'
  | 'completed'
  | 'expired'
  | 'cancelled';

export interface ContractTerms {
  payment_terms: PaymentTerms;
  delivery_terms: DeliveryTerms;
  cancellation_policy: CancellationPolicy;
  usage_rights: UsageRights;
  liability_terms: LiabilityTerms;
  additional_terms?: string[];
}

export interface PaymentTerms {
  deposit_percentage: number;
  deposit_due_days: number;
  final_payment_due: 'before_session' | 'day_of_session' | 'after_delivery' | 'custom';
  final_payment_due_days?: number;
  accepted_payment_methods: string[];
  late_fee_percentage?: number;
  late_fee_grace_period_days?: number;
}

export interface DeliveryTerms {
  delivery_timeline_days: number;
  delivery_method: 'online_gallery' | 'usb' | 'prints' | 'cloud_download';
  number_of_edited_images?: number;
  number_of_raw_images?: number;
  revision_rounds?: number;
  rush_delivery_available: boolean;
  rush_delivery_fee?: number;
}

export interface CancellationPolicy {
  client_cancellation_notice_days: number;
  client_cancellation_fee_percentage: number[];  // Array for different time periods
  photographer_cancellation_policy: string;
  force_majeure_clause: boolean;
  rescheduling_policy: string;
  weather_policy?: string;
}

export interface UsageRights {
  personal_use: boolean;
  commercial_use: boolean;
  social_media_use: boolean;
  print_release: boolean;
  model_release_required: boolean;
  copyright_owner: 'photographer' | 'client' | 'shared';
  credit_required: boolean;
  exclusivity_period_days?: number;
}

export interface LiabilityTerms {
  liability_limit: number;
  insurance_coverage: boolean;
  indemnification_clause: boolean;
  equipment_damage_responsibility: string;
  injury_waiver: boolean;
}

export interface Contract extends Timestamps {
  id: UUID;
  photographer_id: UUID;
  session_id: UUID;
  client_id: UUID;
  template_id?: UUID;
  version: number;
  title: string;
  content: string;  // HTML content
  variables: ContractVariables;
  terms: ContractTerms;
  status: ContractStatus;
  sent_at?: ISODateString;
  sent_via?: 'email' | 'sms' | 'link';
  viewed_at?: ISODateString;
  signed_at?: ISODateString;
  countersigned_at?: ISODateString;
  expires_at?: ISODateString;
  ip_address?: string;
  user_agent?: string;
  signature_data?: string;  // Base64 encoded signature image
  countersignature_data?: string;  // Base64 encoded countersignature
  pdf_url?: string;
  access_token: string;
  reminder_sent_at?: ISODateString;
  decline_reason?: string;
  amendment_history?: ContractAmendment[];
}

export interface ContractVariables {
  photographer_name: string;
  photographer_business: string;
  photographer_email: string;
  photographer_phone: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  session_date: string;
  session_time: string;
  session_location: string;
  session_type: string;
  package_name: string;
  package_price: number;
  deposit_amount: number;
  balance_amount: number;
  [key: string]: string | number | boolean;
}

export interface ContractAmendment {
  id: UUID;
  amendment_date: ISODateString;
  description: string;
  changes: string;
  agreed_by_client: boolean;
  agreed_by_photographer: boolean;
  agreed_date?: ISODateString;
}

export interface ContractTemplate {
  id: UUID;
  photographer_id: UUID;
  name: string;
  description?: string;
  category: 'wedding' | 'portrait' | 'commercial' | 'event' | 'mini_session' | 'other';
  content: string;  // HTML with {{variables}}
  available_variables: string[];
  default_terms: ContractTerms;
  is_default: boolean;
  usage_count: number;
  last_used_at?: ISODateString;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ContractSignatureRequest {
  contract_id: UUID;
  signer_name: string;
  signer_email: string;
  signature_data: string;  // Base64 encoded
  agreed_to_terms: boolean;
  ip_address: string;
  user_agent: string;
}