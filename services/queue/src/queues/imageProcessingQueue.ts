import { Queue, QueueOptions } from 'bullmq';
import { ImageProcessingJobData, QueueConfig } from '../types';
import { logger } from '../utils/logger';

export class ImageProcessingQueue {
  private readonly queue: Queue<ImageProcessingJobData>;

  constructor(config: QueueConfig) {
    const queueOptions: QueueOptions = {
      connection: config.redis,
      defaultJobOptions: {
        ...config.defaultJobOptions,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    };

    this.queue = new Queue<ImageProcessingJobData>('image-processing', queueOptions);

    this.queue.on('error', (error: Error) => {
      logger.error('Image processing queue error:', error);
    });

    this.queue.on('waiting', (job) => {
      logger.info(`Image processing job ${job.id || 'unknown'} is waiting`);
    });

    this.queue.on('active', (job) => {
      logger.info(`Image processing job ${job.id || 'unknown'} started`);
    });

    this.queue.on('completed', (job) => {
      logger.info(`Image processing job ${job.id || 'unknown'} completed`);
    });

    this.queue.on('failed', (job, error) => {
      logger.error(`Image processing job ${job?.id || 'unknown'} failed:`, error);
    });
  }

  async addJob(
    name: string,
    data: ImageProcessingJobData,
    options?: Parameters<typeof this.queue.add>[2]
  ): Promise<void> {
    try {
      const job = await this.queue.add(name, data, {
        priority: this.calculatePriority(data),
        delay: options?.delay,
        ...options,
      });

      logger.info(`Added image processing job ${job.id || 'unknown'} with name: ${name}`);
    } catch (error) {
      logger.error('Failed to add image processing job:', error);
      throw error;
    }
  }

  async addBulkJobs(
    jobs: Array<{ name: string; data: ImageProcessingJobData; opts?: Parameters<typeof this.queue.add>[2] }>
  ): Promise<void> {
    try {
      const jobsWithPriority = jobs.map((job) => ({
        ...job,
        opts: {
          ...job.opts,
          priority: this.calculatePriority(job.data),
        },
      }));

      await this.queue.addBulk(jobsWithPriority);
      logger.info(`Added ${jobs.length} image processing jobs in bulk`);
    } catch (error) {
      logger.error('Failed to add bulk image processing jobs:', error);
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
    logger.info('Image processing queue paused');
  }

  async resumeQueue(): Promise<void> {
    await this.queue.resume();
    logger.info('Image processing queue resumed');
  }

  async drainQueue(): Promise<void> {
    await this.queue.drain();
    logger.info('Image processing queue drained');
  }

  async closeQueue(): Promise<void> {
    await this.queue.close();
    logger.info('Image processing queue closed');
  }

  getQueue(): Queue<ImageProcessingJobData> {
    return this.queue;
  }

  private calculatePriority(data: ImageProcessingJobData): number {
    // Higher priority for operations that require less processing
    let priority = 1;

    const hasResize = data.operations.some(op => op.type === 'resize');
    const hasWatermark = data.operations.some(op => op.type === 'watermark');
    const hasAITag = data.operations.some(op => op.type === 'ai-tag');

    if (hasAITag) priority += 10; // AI operations are most expensive
    if (hasWatermark) priority += 5;
    if (hasResize) priority += 2;

    return priority;
  }
}