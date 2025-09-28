import { Queue, QueueOptions } from 'bullmq';
import { EmailJobData, QueueConfig } from '../types';
import { logger } from '../utils/logger';

export class EmailNotificationQueue {
  private readonly queue: Queue<EmailJobData>;

  constructor(config: QueueConfig) {
    const queueOptions: QueueOptions = {
      connection: config.redis,
      defaultJobOptions: {
        ...config.defaultJobOptions,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 200,
        removeOnFail: 100,
      },
    };

    this.queue = new Queue<EmailJobData>('email-notification', queueOptions);

    this.queue.on('error', (error: Error) => {
      logger.error('Email notification queue error:', error);
    });

    this.queue.on('waiting', (job) => {
      logger.info(`Email job ${job.id || 'unknown'} is waiting`);
    });

    this.queue.on('active', (job) => {
      logger.info(`Email job ${job.id || 'unknown'} started`);
    });

    this.queue.on('completed', (job) => {
      logger.info(`Email job ${job.id || 'unknown'} completed`);
    });

    this.queue.on('failed', (job, error) => {
      logger.error(`Email job ${job?.id || 'unknown'} failed:`, error);
    });
  }

  async addJob(
    name: string,
    data: EmailJobData,
    options?: Parameters<typeof this.queue.add>[2]
  ): Promise<void> {
    try {
      const jobOptions = {
        priority: this.calculatePriority(data),
        delay: this.calculateDelay(data),
        ...options,
      };

      const job = await this.queue.add(name, data, jobOptions);
      logger.info(`Added email job ${job.id || 'unknown'} with name: ${name}`);
    } catch (error) {
      logger.error('Failed to add email job:', error);
      throw error;
    }
  }

  async addScheduledEmail(
    name: string,
    data: EmailJobData,
    scheduledAt: Date,
    options?: Parameters<typeof this.queue.add>[2]
  ): Promise<void> {
    const delay = scheduledAt.getTime() - Date.now();

    if (delay <= 0) {
      throw new Error('Scheduled time must be in the future');
    }

    await this.addJob(name, data, {
      ...options,
      delay,
    });

    logger.info(`Scheduled email job for ${scheduledAt.toISOString()}`);
  }

  async addBulkEmails(
    jobs: Array<{ name: string; data: EmailJobData; opts?: Parameters<typeof this.queue.add>[2] }>
  ): Promise<void> {
    try {
      const jobsWithPriority = jobs.map((job) => ({
        ...job,
        opts: {
          ...job.opts,
          priority: this.calculatePriority(job.data),
          delay: this.calculateDelay(job.data),
        },
      }));

      await this.queue.addBulk(jobsWithPriority);
      logger.info(`Added ${jobs.length} email jobs in bulk`);
    } catch (error) {
      logger.error('Failed to add bulk email jobs:', error);
      throw error;
    }
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

  async pauseQueue(): Promise<void> {
    await this.queue.pause();
    logger.info('Email notification queue paused');
  }

  async resumeQueue(): Promise<void> {
    await this.queue.resume();
    logger.info('Email notification queue resumed');
  }

  async drainQueue(): Promise<void> {
    await this.queue.drain();
    logger.info('Email notification queue drained');
  }

  async closeQueue(): Promise<void> {
    await this.queue.close();
    logger.info('Email notification queue closed');
  }

  getQueue(): Queue<EmailJobData> {
    return this.queue;
  }

  private calculatePriority(data: EmailJobData): number {
    switch (data.priority) {
      case 'high':
        return 1;
      case 'normal':
        return 5;
      case 'low':
        return 10;
      default:
        return 5;
    }
  }

  private calculateDelay(data: EmailJobData): number {
    if (data.scheduledAt) {
      const delay = data.scheduledAt.getTime() - Date.now();
      return Math.max(0, delay);
    }
    return 0;
  }
}