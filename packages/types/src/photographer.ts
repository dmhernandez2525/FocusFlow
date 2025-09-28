import { UUID, ISODateString, Email, URL, Timestamps, SubscriptionTier, SubscriptionStatus } from './common';

export interface PhotographerSettings {
  business_hours: BusinessHours;
  booking_buffer_days: number;
  deposit_percentage: number;
  watermark_enabled: boolean;
  auto_reminder_enabled: boolean;
  gallery_expiry_days: number;
  default_session_duration_minutes: number;
  timezone: string;
  currency: string;
  tax_rate: number;
  invoice_prefix: string;
  next_invoice_number: number;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  is_open: boolean;
  open_time?: string; // HH:MM format
  close_time?: string; // HH:MM format
  breaks?: TimeSlot[];
}

export interface TimeSlot {
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
}

export interface Photographer extends Timestamps {
  id: UUID;
  business_name: string;
  email: Email;
  phone?: string;
  website?: URL;
  bio?: string;
  avatar_url?: URL;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  trial_ends_at?: ISODateString;
  settings: PhotographerSettings;
  onboarding_completed: boolean;
  total_storage_used_bytes: number;
  total_bandwidth_used_bytes: number;
}

export interface PhotographerStats {
  total_clients: number;
  active_sessions: number;
  total_galleries: number;
  total_photos: number;
  revenue_this_month: number;
  revenue_last_month: number;
  average_session_value: number;
  conversion_rate: number;
  client_retention_rate: number;
}

export interface PhotographerOnboarding {
  current_step: number;
  total_steps: number;
  completed_steps: OnboardingStep[];
  skipped_steps: OnboardingStep[];
}

export type OnboardingStep =
  | 'business_info'
  | 'pricing_packages'
  | 'payment_setup'
  | 'calendar_sync'
  | 'branding'
  | 'email_templates'
  | 'test_booking';

export interface PhotographerBranding {
  logo_url?: URL;
  primary_color: string;
  secondary_color: string;
  font_family?: string;
  email_signature?: string;
  watermark_logo_url?: URL;
  social_media: SocialMediaLinks;
}

export interface SocialMediaLinks {
  instagram?: URL;
  facebook?: URL;
  twitter?: URL;
  pinterest?: URL;
  tiktok?: URL;
  youtube?: URL;
  linkedin?: URL;
}