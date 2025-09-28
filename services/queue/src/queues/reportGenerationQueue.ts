import { Queue, QueueOptions } from 'bullmq';
import { ReportJobData, QueueConfig } from '../types';
import { logger } from '../utils/logger';

export class ReportGenerationQueue {
  private readonly queue: Queue<ReportJobData>;

  constructor(config: QueueConfig) {
    const queueOptions: QueueOptions = {
      connection: config.redis,
      defaultJobOptions: {
        ...config.defaultJobOptions,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
        removeOnComplete: 25,
        removeOnFail: 50,
        timeout: 300000, // 5 minutes timeout for report generation
      },
    };

    this.queue = new Queue<ReportJobData>('report-generation', queueOptions);

    this.queue.on('error', (error: Error) => {
      logger.error('Report generation queue error:', error);
    });

    this.queue.on('waiting', (job) => {
      logger.info(`Report generation job ${job.id || 'unknown'} is waiting`);
    });

    this.queue.on('active', (job) => {
      logger.info(`Report generation job ${job.id || 'unknown'} started`);
    });

    this.queue.on('completed', (job) => {
      logger.info(`Report generation job ${job.id || 'unknown'} completed`);
    });

    this.queue.on('failed', (job, error) => {
      logger.error(`Report generation job ${job?.id || 'unknown'} failed:`, error);
    });

    this.queue.on('progress', (job, progress) => {
      logger.info(`Report generation job ${job.id || 'unknown'} progress: ${progress}%`);
    });
  }

  async addJob(
    name: string,
    data: ReportJobData,
    options?: Parameters<typeof this.queue.add>[2]
  ): Promise<void> {
    try {
      const jobOptions = {
        priority: this.calculatePriority(data),
        timeout: this.calculateTimeout(data),
        ...options,
      };

      const job = await this.queue.add(name, data, jobOptions);
      logger.info(`Added report generation job ${job.id || 'unknown'} of type: ${data.reportType}`);
    } catch (error) {
      logger.error('Failed to add report generation job:', error);
      throw error;
    }
  }

  async addScheduledReport(
    name: string,
    data: ReportJobData,
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

    logger.info(`Scheduled report generation job for ${scheduledAt.toISOString()}`);
  }

  async addBulkJobs(
    jobs: Array<{ name: string; data: ReportJobData; opts?: Parameters<typeof this.queue.add>[2] }>
  ): Promise<void> {
    try {
      const jobsWithOptions = jobs.map((job) => ({
        ...job,
        opts: {
          ...job.opts,
          priority: this.calculatePriority(job.data),
          timeout: this.calculateTimeout(job.data),
        },
      }));

      await this.queue.addBulk(jobsWithOptions);
      logger.info(`Added ${jobs.length} report generation jobs in bulk`);
    } catch (error) {
      logger.error('Failed to add bulk report generation jobs:', error);
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

  async getActiveJobs(): Promise<Array<{ id: string; progress: number; data: ReportJobData }>> {
    const activeJobs = await this.queue.getActive();
    return activeJobs.map(job => ({
      id: job.id || 'unknown',
      progress: job.progress || 0,
      data: job.data,
    }));
  }

  async pauseQueue(): Promise<void> {
    await this.queue.pause();
    logger.info('Report generation queue paused');
  }

  async resumeQueue(): Promise<void> {
    await this.queue.resume();
    logger.info('Report generation queue resumed');
  }

  async drainQueue(): Promise<void> {
    await this.queue.drain();
    logger.info('Report generation queue drained');
  }

  async closeQueue(): Promise<void> {
    await this.queue.close();
    logger.info('Report generation queue closed');
  }

  getQueue(): Queue<ReportJobData> {
    return this.queue;
  }

  private calculatePriority(data: ReportJobData): number {
    // Priority based on report complexity
    switch (data.reportType) {
      case 'csv':
        return 1; // Highest priority (fastest)
      case 'excel':
        return 3;
      case 'pdf':
        return 5; // Lowest priority (most resource intensive)
      default:
        return 3;
    }
  }

  private calculateTimeout(data: ReportJobData): number {
    // Timeout based on report complexity
    const baseTimeout = 60000; // 1 minute base

    switch (data.reportType) {
      case 'csv':
        return baseTimeout * 2; // 2 minutes
      case 'excel':
        return baseTimeout * 5; // 5 minutes
      case 'pdf':
        return baseTimeout * 10; // 10 minutes
      default:
        return baseTimeout * 5;
    }
  }
}