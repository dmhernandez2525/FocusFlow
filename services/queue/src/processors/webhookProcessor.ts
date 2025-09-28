import { Job, Worker } from 'bullmq';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { WebhookJobData, WebhookResult, QueueConfig } from '../types';
import { logger } from '../utils/logger';

export class WebhookProcessor {
  private readonly worker: Worker<WebhookJobData, WebhookResult>;
  private readonly retryDelays: number[] = [1000, 5000, 15000]; // 1s, 5s, 15s

  constructor(config: QueueConfig) {
    this.worker = new Worker<WebhookJobData, WebhookResult>(
      'webhook',
      this.processJob.bind(this),
      {
        connection: config.redis,
        concurrency: parseInt(process.env.WEBHOOK_PROCESSOR_CONCURRENCY || '10', 10),
        limiter: {
          max: 100,
          duration: 60000, // 100 webhooks per minute
        },
      }
    );

    this.worker.on('completed', (job: Job<WebhookJobData, WebhookResult>) => {
      logger.info(`Webhook job ${job.id || 'unknown'} completed successfully`);
    });

    this.worker.on('failed', (job: Job<WebhookJobData, WebhookResult> | undefined, error: Error) => {
      logger.error(`Webhook job ${job?.id || 'unknown'} failed:`, error);
    });

    this.worker.on('error', (error: Error) => {
      logger.error('Webhook processor worker error:', error);
    });
  }

  private async processJob(job: Job<WebhookJobData, WebhookResult>): Promise<WebhookResult> {
    const startTime = Date.now();

    try {
      logger.info(`Processing webhook job ${job.id || 'unknown'} for URL: ${job.data.url}`);

      await job.updateProgress(25);

      const response = await this.makeWebhookRequest(job.data);

      await job.updateProgress(100);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          statusCode: response.status,
          responseTime: executionTime,
          response: this.sanitizeResponse(response.data),
        },
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`Webhook processing failed for job ${job.id || 'unknown'}:`, error);

      // Determine if this error should trigger a retry
      const shouldRetry = this.shouldRetryError(error);
      const attemptNumber = job.attemptsMade;
      const maxRetries = job.data.retryCount ?? 3;

      if (shouldRetry && attemptNumber < maxRetries) {
        const retryDelay = this.calculateRetryDelay(attemptNumber);
        logger.info(`Webhook job ${job.id || 'unknown'} will retry in ${retryDelay}ms (attempt ${attemptNumber + 1}/${maxRetries})`);

        // Re-queue the job with delay
        throw new Error(`Webhook failed, will retry: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime,
        metadata: {
          attemptNumber,
          maxRetries,
          url: job.data.url,
          webhookId: job.data.webhookId,
        },
      };
    }
  }

  private async makeWebhookRequest(data: WebhookJobData): Promise<AxiosResponse> {
    const config: AxiosRequestConfig = {
      method: data.method,
      url: data.url,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FocusFlow-Webhook/1.0',
        ...data.headers,
      },
      timeout: data.timeout || 30000, // 30 seconds default
      validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      maxRedirects: 3,
    };

    if (data.payload && ['POST', 'PUT', 'PATCH'].includes(data.method)) {
      config.data = data.payload;
    }

    try {
      const response = await axios(config);

      // Log successful webhook calls
      logger.info(`Webhook succeeded: ${data.method} ${data.url} -> ${response.status}`);

      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          logger.warn(`Webhook returned error status: ${error.response.status} for ${data.url}`);
          return error.response;
        } else if (error.request) {
          // Network error
          throw new Error(`Network error calling webhook ${data.url}: ${error.message}`);
        }
      }

      throw new Error(`Webhook request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private shouldRetryError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      // Retry on network errors
      if (!error.response) {
        return true;
      }

      // Retry on 5xx server errors
      if (error.response.status >= 500) {
        return true;
      }

      // Retry on rate limiting (429)
      if (error.response.status === 429) {
        return true;
      }

      // Don't retry on 4xx client errors (except 429)
      if (error.response.status >= 400 && error.response.status < 500) {
        return false;
      }
    }

    // Retry on timeout errors
    if (error instanceof Error && error.message.includes('timeout')) {
      return true;
    }

    // Default to retry for unknown errors
    return true;
  }

  private calculateRetryDelay(attemptNumber: number): number {
    if (attemptNumber < this.retryDelays.length) {
      return this.retryDelays[attemptNumber] || 0;
    }

    // Exponential backoff for attempts beyond predefined delays
    return Math.min(30000, 1000 * Math.pow(2, attemptNumber));
  }

  private sanitizeResponse(response: unknown): unknown {
    if (typeof response === 'string') {
      // Limit string response size
      return response.length > 1000 ? response.substring(0, 1000) + '...' : response;
    }

    if (typeof response === 'object' && response !== null) {
      // Limit object response size by converting to JSON and truncating
      try {
        const jsonString = JSON.stringify(response);
        return jsonString.length > 1000
          ? JSON.parse(jsonString.substring(0, 1000) + '}')
          : response;
      } catch {
        return { error: 'Failed to serialize response' };
      }
    }

    return response;
  }

  async testWebhook(url: string, method: 'GET' | 'POST' = 'POST'): Promise<WebhookResult> {
    const testData: WebhookJobData = {
      url,
      method,
      payload: method === 'POST' ? { test: true, timestamp: new Date().toISOString() } : undefined,
      timeout: 10000,
      webhookId: 'test-webhook',
    };

    const startTime = Date.now();

    try {
      const response = await this.makeWebhookRequest(testData);
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          statusCode: response.status,
          responseTime: executionTime,
          response: this.sanitizeResponse(response.data),
        },
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime,
      };
    }
  }

  async getWorkerStats(): Promise<{
    concurrency: number;
    running: number;
    completed: number;
    failed: number;
  }> {
    // These stats would be available in a real implementation
    return {
      concurrency: parseInt(process.env.WEBHOOK_PROCESSOR_CONCURRENCY || '10', 10),
      running: 0,
      completed: 0,
      failed: 0,
    };
  }

  async close(): Promise<void> {
    await this.worker.close();
    logger.info('Webhook processor worker closed');
  }

  getWorker(): Worker<WebhookJobData, WebhookResult> {
    return this.worker;
  }
}