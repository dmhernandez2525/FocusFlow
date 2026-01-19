import { UUID, ISODateString, Address, Timestamps, Coordinates } from './common';

export type SessionStatus =
  | 'inquiry'
  | 'booked'
  | 'confirmed'
  | 'preparing'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

export type SessionLocationType = 'studio' | 'outdoor' | 'client_location' | 'destination';

export interface SessionLocation {
  type: SessionLocationType;
  address?: Address;
  coordinates?: Coordinates;
  venue_name?: string;
  notes?: string;
  parking_info?: string;
  access_instructions?: string;
}

export interface SessionPackage {
  name: string;
  description: string;
  duration_minutes: number;
  deliverables: SessionDeliverable[];
  includes_items: string[];
  preparation_required: string[];
  price: number;
  deposit_percentage: number;
}

export interface SessionDeliverable {
  type: 'digital_images' | 'prints' | 'album' | 'canvas' | 'usb';
  quantity: number;
  description: string;
  size?: string;
}

export interface Session extends Timestamps {
  id: UUID;
  photographer_id: UUID;
  client_id?: UUID;
  session_type: string;
  session_date?: ISODateString;
  duration_minutes?: number;
  location: SessionLocation;
  status: SessionStatus;
  package_details: SessionPackage;
  total_amount?: number;
  deposit_amount?: number;
  deposit_paid: boolean;
  deposit_paid_at?: ISODateString;
  balance_amount?: number;
  balance_paid: boolean;
  balance_paid_at?: ISODateString;
  contract_id?: UUID;
  contract_signed: boolean;
  contract_signed_at?: ISODateString;
  preparation_notes?: string;
  session_notes?: string;
  weather_backup_date?: ISODateString;
  cancellation_reason?: string;
  cancelled_at?: ISODateString;
  participants: SessionParticipant[];
  shot_list?: ShotListItem[];
  timeline?: SessionTimelineItem[];
  equipment_needed?: string[];
  props_needed?: string[];
  mood_board_urls?: string[];
  inspiration_notes?: string;
}

export interface SessionParticipant {
  name: string;
  role: 'primary' | 'partner' | 'child' | 'family' | 'pet' | 'other';
  age?: number;
  notes?: string;
}

export interface ShotListItem {
  id: UUID;
  description: string;
  priority: 'must_have' | 'nice_to_have' | 'if_time';
  completed: boolean;
  notes?: string;
}

export interface SessionTimelineItem {
  time: string; // HH:MM format
  activity: string;
  duration_minutes: number;
  location?: string;
  notes?: string;
}

export interface SessionAvailability {
  date: ISODateString;
  available_slots: SessionTimeSlot[];
  booked_slots: SessionTimeSlot[];
}

export interface SessionTimeSlot {
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  session_id?: UUID;
}

export interface SessionReminder {
  id: UUID;
  session_id: UUID;
  type: 'confirmation' | 'reminder' | 'preparation' | 'follow_up';
  scheduled_for: ISODateString;
  sent_at?: ISODateString;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  message_template_id?: UUID;
}