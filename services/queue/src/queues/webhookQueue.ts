import { Queue, QueueOptions } from 'bullmq';
import { WebhookJobData, QueueConfig } from '../types';
import { logger } from '../utils/logger';

export class WebhookQueue {
  private readonly queue: Queue<WebhookJobData>;

  constructor(config: QueueConfig) {
    const queueOptions: QueueOptions = {
      connection: config.redis,
      defaultJobOptions: {
        ...config.defaultJobOptions,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    };

    this.queue = new Queue<WebhookJobData>('webhook', queueOptions);

    this.queue.on('error', (error: Error) => {
      logger.error('Webhook queue error:', error);
    });

    this.queue.on('waiting', (job) => {
      logger.info(`Webhook job ${job.id || 'unknown'} is waiting`);
    });

    this.queue.on('active', (job) => {
      logger.info(`Webhook job ${job.id || 'unknown'} started`);
    });

    this.queue.on('completed', (job) => {
      logger.info(`Webhook job ${job.id || 'unknown'} completed`);
    });

    this.queue.on('failed', (job, error) => {
      logger.error(`Webhook job ${job?.id || 'unknown'} failed:`, error);
    });
  }

  async addJob(
    name: string,
    data: WebhookJobData,
    options?: Parameters<typeof this.queue.add>[2]
  ): Promise<void> {
    try {
      const jobOptions = {
        priority: this.calculatePriority(data),
        attempts: data.retryCount ?? 3,
        ...options,
      };

      const job = await this.queue.add(name, data, jobOptions);
      logger.info(`Added webhook job ${job.id || 'unknown'} for URL: ${data.url}`);
    } catch (error) {
      logger.error('Failed to add webhook job:', error);
      throw error;
    }
  }

  async addBulkJobs(
    jobs: Array<{ name: string; data: WebhookJobData; opts?: Parameters<typeof this.queue.add>[2] }>
  ): Promise<void> {
    try {
      const jobsWithOptions = jobs.map((job) => ({
        ...job,
        opts: {
          ...job.opts,
          priority: this.calculatePriority(job.data),
          attempts: job.data.retryCount ?? 3,
        },
      }));

      await this.queue.addBulk(jobsWithOptions);
      logger.info(`Added ${jobs.length} webhook jobs in bulk`);
    } catch (error) {
      logger.error('Failed to add bulk webhook jobs:', error);
      throw error;
    }
  }

  async addDelayedWebhook(
    name: string,
    data: WebhookJobData,
    delayMs: number,
    options?: Parameters<typeof this.queue.add>[2]
  ): Promise<void> {
    await this.addJob(name, data, {
      ...options,
      delay: delayMs,
    });

    logger.info(`Added delayed webhook job for ${delayMs}ms delay`);
  }

  async getJobCounts(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    return await this.queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
  }

  async getFailedJobs(): Promise<Array<{ id: string; data: WebhookJobData; failedReason: string }>> {
    const failedJobs = await this.queue.getFailed();
    return failedJobs.map(job => ({
      id: job.id || 'unknown',
      data: job.data,
      failedReason: job.failedReason || 'Unknown error',
    }));
  }

  async retryFailedJobs(): Promise<void> {
    const failedJobs = await this.queue.getFailed();

    for (const job of failedJobs) {
      try {
        await job.retry();
        logger.info(`Retried failed webhook job ${job.id || 'unknown'}`);
      } catch (error) {
        logger.error(`Failed to retry webhook job ${job.id || 'unknown'}:`, error);
      }
    }
  }

  async pauseQueue(): Promise<void> {
    await this.queue.pause();
    logger.info('Webhook queue paused');
  }

  async resumeQueue(): Promise<void> {
    await this.queue.resume();
    logger.info('Webhook queue resumed');
  }

  async drainQueue(): Promise<void> {
    await this.queue.drain();
    logger.info('Webhook queue drained');
  }

  async closeQueue(): Promise<void> {
    await this.queue.close();
    logger.info('Webhook queue closed');
  }

  getQueue(): Queue<WebhookJobData> {
    return this.queue;
  }

  private calculatePriority(data: WebhookJobData): number {
    // Higher priority for webhooks with fewer retries remaining
    const maxRetries = data.retryCount ?? 3;
    return maxRetries <= 1 ? 1 : 5;
  }
}