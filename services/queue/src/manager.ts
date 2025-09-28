import { JobsOptions } from 'bullmq';
import { createRedisConfig, createRedisConnection } from './config/redis';
import { QueueConfig, HealthCheckResult } from './types';
import { logger } from './utils/logger';

// Import queues
import {
  ImageProcessingQueue,
  EmailNotificationQueue,
  WebhookQueue,
  ReportGenerationQueue,
  WorkflowQueue,
} from './queues';

// Import processors
import {
  ImageProcessor,
  EmailProcessor,
  WebhookProcessor,
  ReportProcessor,
  WorkflowProcessor,
} from './processors';

export class QueueManager {
  private readonly config: QueueConfig;

  // Queues
  public readonly imageProcessingQueue: ImageProcessingQueue;
  public readonly emailNotificationQueue: EmailNotificationQueue;
  public readonly webhookQueue: WebhookQueue;
  public readonly reportGenerationQueue: ReportGenerationQueue;
  public readonly workflowQueue: WorkflowQueue;

  // Processors
  public readonly imageProcessor: ImageProcessor;
  public readonly emailProcessor: EmailProcessor;
  public readonly webhookProcessor: WebhookProcessor;
  public readonly reportProcessor: ReportProcessor;
  public readonly workflowProcessor: WorkflowProcessor;

  private isInitialized = false;
  private readonly startTime = Date.now();

  constructor() {
    // Initialize configuration
    this.config = this.createConfig();

    // Initialize queues
    this.imageProcessingQueue = new ImageProcessingQueue(this.config);
    this.emailNotificationQueue = new EmailNotificationQueue(this.config);
    this.webhookQueue = new WebhookQueue(this.config);
    this.reportGenerationQueue = new ReportGenerationQueue(this.config);
    this.workflowQueue = new WorkflowQueue(this.config);

    // Initialize processors
    this.imageProcessor = new ImageProcessor(this.config);
    this.emailProcessor = new EmailProcessor(this.config);
    this.webhookProcessor = new WebhookProcessor(this.config);
    this.reportProcessor = new ReportProcessor(this.config);
    this.workflowProcessor = new WorkflowProcessor(this.config);

    logger.info('QueueManager initialized with all queues and processors');
  }

  private createConfig(): QueueConfig {
    const redisConfig = createRedisConfig();

    const defaultJobOptions: JobsOptions = {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    };

    return {
      redis: redisConfig,
      defaultJobOptions,
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('QueueManager is already initialized');
      return;
    }

    try {
      // Test Redis connection
      const redis = createRedisConnection(this.config.redis);
      await redis.ping();
      await redis.quit();

      this.isInitialized = true;
      logger.info('QueueManager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize QueueManager:', error);
      throw error;
    }
  }

  async getHealthCheck(): Promise<HealthCheckResult> {
    const checks = {
      redis: false,
      queues: {} as Record<string, boolean>,
      workers: {} as Record<string, boolean>,
    };

    try {
      // Check Redis connection
      const redis = createRedisConnection(this.config.redis);
      await redis.ping();
      checks.redis = true;
      await redis.quit();
    } catch (error) {
      logger.error('Redis health check failed:', error);
    }

    try {
      // Check queue health
      const queueChecks = await Promise.allSettled([
        this.imageProcessingQueue.getJobCounts(),
        this.emailNotificationQueue.getJobCounts(),
        this.webhookQueue.getJobCounts(),
        this.reportGenerationQueue.getJobCounts(),
        this.workflowQueue.getJobCounts(),
      ]);

      checks.queues = {
        'image-processing': queueChecks[0]?.status === 'fulfilled',
        'email-notification': queueChecks[1]?.status === 'fulfilled',
        'webhook': queueChecks[2]?.status === 'fulfilled',
        'report-generation': queueChecks[3]?.status === 'fulfilled',
        'workflow': queueChecks[4]?.status === 'fulfilled',
      };
    } catch (error) {
      logger.error('Queue health check failed:', error);
    }

    // Check worker health (workers are always healthy if they were created successfully)
    checks.workers = {
      'image-processor': !!this.imageProcessor,
      'email-processor': !!this.emailProcessor,
      'webhook-processor': !!this.webhookProcessor,
      'report-processor': !!this.reportProcessor,
      'workflow-processor': !!this.workflowProcessor,
    };

    // Determine overall status
    const redisHealthy = checks.redis;
    const queuesHealthy = Object.values(checks.queues).every(healthy => healthy);
    const workersHealthy = Object.values(checks.workers).every(healthy => healthy);

    let status: 'healthy' | 'unhealthy' | 'degraded';
    if (redisHealthy && queuesHealthy && workersHealthy) {
      status = 'healthy';
    } else if (redisHealthy && (queuesHealthy || workersHealthy)) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      checks,
      timestamp: new Date(),
      uptime: Date.now() - this.startTime,
    };
  }

  async getQueueStats(): Promise<Record<string, unknown>> {
    try {
      const [
        imageStats,
        emailStats,
        webhookStats,
        reportStats,
        workflowStats,
      ] = await Promise.all([
        this.imageProcessingQueue.getJobCounts(),
        this.emailNotificationQueue.getJobCounts(),
        this.webhookQueue.getJobCounts(),
        this.reportGenerationQueue.getJobCounts(),
        this.workflowQueue.getJobCounts(),
      ]);

      return {
        'image-processing': imageStats,
        'email-notification': emailStats,
        'webhook': webhookStats,
        'report-generation': reportStats,
        'workflow': workflowStats,
      };
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      throw error;
    }
  }

  async pauseAllQueues(): Promise<void> {
    logger.info('Pausing all queues...');

    await Promise.all([
      this.imageProcessingQueue.pauseQueue(),
      this.emailNotificationQueue.pauseQueue(),
      this.webhookQueue.pauseQueue(),
      this.reportGenerationQueue.pauseQueue(),
      this.workflowQueue.pauseQueue(),
    ]);

    logger.info('All queues paused');
  }

  async resumeAllQueues(): Promise<void> {
    logger.info('Resuming all queues...');

    await Promise.all([
      this.imageProcessingQueue.resumeQueue(),
      this.emailNotificationQueue.resumeQueue(),
      this.webhookQueue.resumeQueue(),
      this.reportGenerationQueue.resumeQueue(),
      this.workflowQueue.resumeQueue(),
    ]);

    logger.info('All queues resumed');
  }

  async drainAllQueues(): Promise<void> {
    logger.warn('Draining all queues...');

    await Promise.all([
      this.imageProcessingQueue.drainQueue(),
      this.emailNotificationQueue.drainQueue(),
      this.webhookQueue.drainQueue(),
      this.reportGenerationQueue.drainQueue(),
      this.workflowQueue.drainQueue(),
    ]);

    logger.warn('All queues drained');
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down QueueManager...');

    try {
      // Close all processors
      await Promise.all([
        this.imageProcessor.close(),
        this.emailProcessor.close(),
        this.webhookProcessor.close(),
        this.reportProcessor.close(),
        this.workflowProcessor.close(),
      ]);

      // Close all queues
      await Promise.all([
        this.imageProcessingQueue.closeQueue(),
        this.emailNotificationQueue.closeQueue(),
        this.webhookQueue.closeQueue(),
        this.reportGenerationQueue.closeQueue(),
        this.workflowQueue.closeQueue(),
      ]);

      this.isInitialized = false;
      logger.info('QueueManager shut down successfully');
    } catch (error) {
      logger.error('Error during QueueManager shutdown:', error);
      throw error;
    }
  }

  // Utility methods for getting queue instances
  getQueue(queueName: string): unknown {
    switch (queueName) {
      case 'image-processing':
        return this.imageProcessingQueue.getQueue();
      case 'email-notification':
        return this.emailNotificationQueue.getQueue();
      case 'webhook':
        return this.webhookQueue.getQueue();
      case 'report-generation':
        return this.reportGenerationQueue.getQueue();
      case 'workflow':
        return this.workflowQueue.getQueue();
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }

  getProcessor(processorName: string): unknown {
    switch (processorName) {
      case 'image-processor':
        return this.imageProcessor.getWorker();
      case 'email-processor':
        return this.emailProcessor.getWorker();
      case 'webhook-processor':
        return this.webhookProcessor.getWorker();
      case 'report-processor':
        return this.reportProcessor.getWorker();
      case 'workflow-processor':
        return this.workflowProcessor.getWorker();
      default:
        throw new Error(`Unknown processor: ${processorName}`);
    }
  }

  getConfig(): QueueConfig {
    return this.config;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}