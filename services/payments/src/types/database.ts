export interface PaymentIntent {
  id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  customer_id: string | null;
  metadata: Record<string, string>;
  idempotency_key: string;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: string;
  stripe_subscription_id: string;
  customer_id: string;
  status: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
  current_period_start: Date;
  current_period_end: Date;
  plan_id: string;
  metadata: Record<string, string>;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  stripe_customer_id: string;
  email: string;
  name: string | null;
  metadata: Record<string, string>;
  created_at: Date;
  updated_at: Date;
}

export interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  processed: boolean;
  processed_at: Date | null;
  data: Record<string, unknown>;
  created_at: Date;
}

export interface IdempotencyRecord {
  key: string;
  response_body: string;
  response_status: number;
  created_at: Date;
  expires_at: Date;
}