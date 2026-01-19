import { UUID, ISODateString, Timestamps } from './common';

export type PaymentType =
  | 'deposit'
  | 'final_payment'
  | 'full_payment'
  | 'subscription'
  | 'addon'
  | 'print'
  | 'other';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'cancelled';

export type PaymentMethod = 'card' | 'bank_transfer' | 'cash' | 'check' | 'other';

export interface PaymentDetails {
  last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  bank_name?: string;
  check_number?: string;
}

export interface Payment extends Timestamps {
  id: UUID;
  photographer_id: UUID;
  session_id?: UUID;
  client_id?: UUID;
  stripe_payment_intent_id?: string;
  stripe_invoice_id?: string;
  stripe_charge_id?: string;
  amount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  payment_method?: PaymentMethod;
  payment_details?: PaymentDetails;
  refund_amount?: number;
  refund_reason?: string;
  refunded_at?: ISODateString;
  fee_amount?: number;
  net_amount?: number;
  metadata: Record<string, string | number | boolean>;
  receipt_url?: string;
  invoice_pdf_url?: string;
  notes?: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  photographer_id: UUID;
  session_id?: UUID;
  client_id?: UUID;
  type: PaymentType;
  metadata?: Record<string, string>;
  description?: string;
  statement_descriptor?: string;
  payment_method_types?: string[];
  setup_future_usage?: 'on_session' | 'off_session';
  customer_id?: string;
}

export interface PaymentIntentResponse {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  created: number;
  metadata: Record<string, string>;
}

export interface RefundRequest {
  payment_id: UUID;
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'other';
  notes?: string;
}

export interface RefundResponse {
  id: string;
  payment_id: UUID;
  amount: number;
  currency: string;
  status: string;
  reason?: string;
  created_at: ISODateString;
}

export interface PaymentSummary {
  total_revenue: number;
  pending_payments: number;
  failed_payments: number;
  refunded_amount: number;
  net_revenue: number;
  average_payment: number;
  payment_count: number;
}

export interface PaymentFilter {
  photographer_id?: UUID;
  client_id?: UUID;
  session_id?: UUID;
  status?: PaymentStatus;
  type?: PaymentType;
  date_from?: ISODateString;
  date_to?: ISODateString;
  amount_min?: number;
  amount_max?: number;
}

export interface Invoice {
  id: UUID;
  invoice_number: string;
  photographer_id: UUID;
  client_id: UUID;
  session_id?: UUID;
  issue_date: ISODateString;
  due_date: ISODateString;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  notes?: string;
  terms?: string;
  payment_instructions?: string;
  sent_at?: ISODateString;
  paid_at?: ISODateString;
  pdf_url?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  tax_rate?: number;
  discount?: number;
}