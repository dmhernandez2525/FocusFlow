import { JobsOptions } from 'bullmq';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetriesPerRequest?: number;
  retryDelayOnFailover?: number;
  lazyConnect?: boolean;
  connectTimeout?: number;
  commandTimeout?: number;
}

export interface QueueConfig {
  redis: RedisConfig;
  defaultJobOptions: JobsOptions;
}

// Image Processing Types
export interface ImageProcessingJobData {
  imageUrl: string;
  userId: string;
  operations: ImageOperation[];
  outputFormat?: 'jpeg' | 'png' | 'webp';
  quality?: number;
  metadata?: Record<string, unknown>;
}

export interface ImageOperation {
  type: 'resize' | 'watermark' | 'ai-tag';
  params: ResizeParams | WatermarkParams | AITagParams;
}

export interface ResizeParams {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill';
}

export interface WatermarkParams {
  text?: string;
  imageUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
}

export interface AITagParams {
  confidence?: number;
  maxTags?: number;
}

// Email Notification Types
export interface EmailJobData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  template: string;
  variables: Record<string, unknown>;
  attachments?: EmailAttachment[];
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: Date;
}

export interface EmailAttachment {
  filename: string;
  content?: Buffer;
  path?: string;
  contentType?: string;
}

// Webhook Types
export interface WebhookJobData {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  payload?: Record<string, unknown>;
  timeout?: number;
  retryCount?: number;
  webhookId: string;
}

// Report Generation Types
export interface ReportJobData {
  reportType: 'pdf' | 'excel' | 'csv';
  template: string;
  data: Record<string, unknown>;
  userId: string;
  filters?: Record<string, unknown>;
  format?: ReportFormat;
}

export interface ReportFormat {
  pageSize?: 'A4' | 'A3' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Workflow Types
export interface WorkflowJobData {
  workflowId: string;
  triggerId: string;
  userId: string;
  context: Record<string, unknown>;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  type: 'email' | 'webhook' | 'delay' | 'condition' | 'image-process' | 'report';
  config: Record<string, unknown>;
  conditions?: WorkflowCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
}

// Job Result Types
export interface JobResult {
  success: boolean;
  data?: unknown;
  error?: string;
  executionTime?: number;
  metadata?: Record<string, unknown>;
}

export interface ImageProcessingResult extends JobResult {
  data?: {
    processedImageUrl: string;
    originalSize: number;
    processedSize: number;
    tags?: string[];
  };
}

export interface EmailResult extends JobResult {
  data?: {
    messageId: string;
    recipients: string[];
    sentAt: Date;
  };
}

export interface WebhookResult extends JobResult {
  data?: {
    statusCode: number;
    responseTime: number;
    response?: unknown;
  };
}

export interface ReportResult extends JobResult {
  data?: {
    reportUrl: string;
    fileSize: number;
    generatedAt: Date;
  };
}

export interface WorkflowResult extends JobResult {
  data?: {
    completedSteps: string[];
    failedSteps?: string[];
    totalExecutionTime: number;
  };
}

// Health Check Types
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: {
    redis: boolean;
    queues: Record<string, boolean>;
    workers: Record<string, boolean>;
  };
  timestamp: Date;
  uptime: number;
}