import { UUID, ISODateString, Timestamps } from './common';

export type WorkflowTriggerType =
  | 'booking_created'
  | 'booking_confirmed'
  | 'payment_received'
  | 'deposit_received'
  | 'session_completed'
  | 'gallery_published'
  | 'photos_selected'
  | 'contract_signed'
  | 'client_created'
  | 'invoice_overdue'
  | 'trial_ending'
  | 'custom_date'
  | 'manual';

export type WorkflowActionType =
  | 'send_email'
  | 'send_sms'
  | 'create_task'
  | 'update_client_stage'
  | 'add_tag'
  | 'remove_tag'
  | 'create_invoice'
  | 'create_gallery'
  | 'notify_team'
  | 'webhook'
  | 'wait'
  | 'conditional';

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value?: string | number | boolean;
  combine_with?: 'AND' | 'OR';
}

export interface WorkflowAction {
  id: UUID;
  type: WorkflowActionType;
  name: string;
  description?: string;
  config: WorkflowActionConfig;
  conditions?: WorkflowCondition[];
  delay_minutes?: number;
  order: number;
}

export interface WorkflowActionConfig {
  // Email action
  email_template_id?: UUID;
  email_to?: string[];
  email_subject?: string;
  email_body?: string;

  // SMS action
  sms_to?: string;
  sms_message?: string;

  // Task action
  task_title?: string;
  task_description?: string;
  task_due_days?: number;
  task_assignee?: string;

  // Client update action
  new_lifecycle_stage?: string;
  tags_to_add?: string[];
  tags_to_remove?: string[];
  custom_fields?: Record<string, string | number | boolean>;

  // Invoice action
  invoice_template_id?: UUID;
  invoice_due_days?: number;
  invoice_items?: Array<{
    description: string;
    amount: number;
  }>;

  // Gallery action
  gallery_template_id?: UUID;
  gallery_expiry_days?: number;
  gallery_settings?: Record<string, unknown>;

  // Webhook action
  webhook_url?: string;
  webhook_method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
  webhook_headers?: Record<string, string>;
  webhook_body?: Record<string, unknown>;

  // Wait action
  wait_minutes?: number;
  wait_until_date?: ISODateString;
  wait_until_time?: string;

  // Conditional action
  if_conditions?: WorkflowCondition[];
  then_actions?: WorkflowAction[];
  else_actions?: WorkflowAction[];
}

export interface Workflow extends Timestamps {
  id: UUID;
  photographer_id: UUID;
  name: string;
  description?: string;
  trigger_type: WorkflowTriggerType;
  trigger_conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  is_active: boolean;
  run_count: number;
  last_run_at?: ISODateString;
  last_run_status?: WorkflowStatus;
  last_error?: string;
  test_mode: boolean;
  max_runs_per_day?: number;
  excluded_clients?: UUID[];
  included_tags?: string[];
  excluded_tags?: string[];
}

export interface WorkflowRun {
  id: UUID;
  workflow_id: UUID;
  photographer_id: UUID;
  trigger_data: WorkflowTriggerData;
  status: WorkflowStatus;
  started_at?: ISODateString;
  completed_at?: ISODateString;
  execution_log: WorkflowExecutionLog[];
  error_message?: string;
  created_at: ISODateString;
}

export interface WorkflowTriggerData {
  trigger_type: WorkflowTriggerType;
  entity_type?: 'session' | 'client' | 'payment' | 'gallery' | 'contract';
  entity_id?: UUID;
  metadata: Record<string, unknown>;
}

export interface WorkflowExecutionLog {
  timestamp: ISODateString;
  action_id: UUID;
  action_type: WorkflowActionType;
  status: 'started' | 'completed' | 'failed' | 'skipped';
  message?: string;
  error?: string;
  result?: Record<string, unknown>;
}

export interface WorkflowTemplate {
  id: UUID;
  name: string;
  description: string;
  category: 'onboarding' | 'booking' | 'delivery' | 'marketing' | 'admin';
  trigger_type: WorkflowTriggerType;
  actions: WorkflowAction[];
  is_public: boolean;
  usage_count: number;
  rating?: number;
  author?: string;
}