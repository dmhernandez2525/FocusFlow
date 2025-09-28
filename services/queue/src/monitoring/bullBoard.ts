import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { QueueManager } from '../manager';
import { logger } from '../utils/logger';

export class BullBoardMonitoring {
  private readonly serverAdapter: ExpressAdapter;
  private readonly queueManager: QueueManager;

  constructor(queueManager: QueueManager) {
    this.queueManager = queueManager;
    this.serverAdapter = new ExpressAdapter();
    this.serverAdapter.setBasePath('/admin/queues');

    this.setupBullBoard();
  }

  private setupBullBoard(): void {
    try {
      // Get all queue instances
      const queues = [
        this.queueManager.imageProcessingQueue.getQueue(),
        this.queueManager.emailNotificationQueue.getQueue(),
        this.queueManager.webhookQueue.getQueue(),
        this.queueManager.reportGenerationQueue.getQueue(),
        this.queueManager.workflowQueue.getQueue(),
      ];

      // Create Bull Board with queue adapters
      createBullBoard({
        queues: queues.map(queue => new BullMQAdapter(queue)),
        serverAdapter: this.serverAdapter,
        options: {
          uiConfig: {
            boardTitle: 'FocusFlow Queue Dashboard',
            boardLogo: {
              path: 'https://cdn.jsdelivr.net/npm/bullmq@5/docs/gitbook/assets/logo.png',
              width: '100px',
              height: 'auto',
            },
            miscLinks: [
              {
                text: 'Health Check',
                url: '/health',
              },
              {
                text: 'Queue Stats',
                url: '/stats',
              },
            ],
            favIcon: {
              default: 'static/images/logo.svg',
              alternative: 'static/favicon-32x32.png',
            },
            locale: {
              lng: 'en',
            },
          },
        },
      });

      logger.info('Bull Board monitoring setup completed');
    } catch (error) {
      logger.error('Failed to setup Bull Board monitoring:', error);
      throw error;
    }
  }

  getRouter(): ExpressAdapter {
    return this.serverAdapter;
  }

  getBasePath(): string {
    return '/admin/queues';
  }

  async getQueueOverview(): Promise<{
    totalQueues: number;
    totalJobs: number;
    activeJobs: number;
    failedJobs: number;
    completedJobs: number;
  }> {
    try {
      const stats = await this.queueManager.getQueueStats();
      const queueStats = Object.values(stats) as Array<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
      }>;

      const totalQueues = queueStats.length;
      const totalJobs = queueStats.reduce(
        (sum, stat) => sum + stat.waiting + stat.active + stat.completed + stat.failed + stat.delayed,
        0
      );
      const activeJobs = queueStats.reduce((sum, stat) => sum + stat.active, 0);
      const failedJobs = queueStats.reduce((sum, stat) => sum + stat.failed, 0);
      const completedJobs = queueStats.reduce((sum, stat) => sum + stat.completed, 0);

      return {
        totalQueues,
        totalJobs,
        activeJobs,
        failedJobs,
        completedJobs,
      };
    } catch (error) {
      logger.error('Failed to get queue overview:', error);
      throw error;
    }
  }

  async getDetailedStats(): Promise<Record<string, unknown>> {
    try {
      const stats = await this.queueManager.getQueueStats();
      const healthCheck = await this.queueManager.getHealthCheck();

      return {
        queues: stats,
        health: healthCheck,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to get detailed stats:', error);
      throw error;
    }
  }

  async getActiveJobs(): Promise<Array<{
    queueName: string;
    jobId: string;
    jobName: string;
    progress: number;
    data: unknown;
  }>> {
    try {
      const activeJobs: Array<{
        queueName: string;
        jobId: string;
        jobName: string;
        progress: number;
        data: unknown;
      }> = [];

      // Get active jobs from each queue
      const queues = [
        { name: 'image-processing', queue: this.queueManager.imageProcessingQueue.getQueue() },
        { name: 'email-notification', queue: this.queueManager.emailNotificationQueue.getQueue() },
        { name: 'webhook', queue: this.queueManager.webhookQueue.getQueue() },
        { name: 'report-generation', queue: this.queueManager.reportGenerationQueue.getQueue() },
        { name: 'workflow', queue: this.queueManager.workflowQueue.getQueue() },
      ];

      for (const { name, queue } of queues) {
        try {
          const jobs = await queue.getActive();

          jobs.forEach(job => {
            activeJobs.push({
              queueName: name,
              jobId: job.id || 'unknown',
              jobName: job.name || 'unknown',
              progress: job.progress || 0,
              data: job.data,
            });
          });
        } catch (error) {
          logger.warn(`Failed to get active jobs for queue ${name}:`, error);
        }
      }

      return activeJobs;
    } catch (error) {
      logger.error('Failed to get active jobs:', error);
      throw error;
    }
  }

  async getFailedJobs(): Promise<Array<{
    queueName: string;
    jobId: string;
    jobName: string;
    failedReason: string;
    attemptsMade: number;
    timestamp: Date;
  }>> {
    try {
      const failedJobs: Array<{
        queueName: string;
        jobId: string;
        jobName: string;
        failedReason: string;
        attemptsMade: number;
        timestamp: Date;
      }> = [];

      // Get failed jobs from each queue
      const queues = [
        { name: 'image-processing', queue: this.queueManager.imageProcessingQueue.getQueue() },
        { name: 'email-notification', queue: this.queueManager.emailNotificationQueue.getQueue() },
        { name: 'webhook', queue: this.queueManager.webhookQueue.getQueue() },
        { name: 'report-generation', queue: this.queueManager.reportGenerationQueue.getQueue() },
        { name: 'workflow', queue: this.queueManager.workflowQueue.getQueue() },
      ];

      for (const { name, queue } of queues) {
        try {
          const jobs = await queue.getFailed();

          jobs.forEach(job => {
            failedJobs.push({
              queueName: name,
              jobId: job.id || 'unknown',
              jobName: job.name || 'unknown',
              failedReason: job.failedReason || 'Unknown error',
              attemptsMade: job.attemptsMade,
              timestamp: new Date(job.timestamp),
            });
          });
        } catch (error) {
          logger.warn(`Failed to get failed jobs for queue ${name}:`, error);
        }
      }

      return failedJobs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      logger.error('Failed to get failed jobs:', error);
      throw error;
    }
  }

  async retryAllFailedJobs(): Promise<{ retried: number; failed: number }> {
    let retriedCount = 0;
    let failedCount = 0;

    try {
      const queues = [
        this.queueManager.imageProcessingQueue.getQueue(),
        this.queueManager.emailNotificationQueue.getQueue(),
        this.queueManager.webhookQueue.getQueue(),
        this.queueManager.reportGenerationQueue.getQueue(),
        this.queueManager.workflowQueue.getQueue(),
      ];

      for (const queue of queues) {
        try {
          const failedJobs = await queue.getFailed();

          for (const job of failedJobs) {
            try {
              await job.retry();
              retriedCount++;
            } catch (error) {
              logger.error(`Failed to retry job ${job.id || 'unknown'}:`, error);
              failedCount++;
            }
          }
        } catch (error) {
          logger.error('Failed to get failed jobs for retry:', error);
          failedCount++;
        }
      }

      logger.info(`Retry operation completed: ${retriedCount} retried, ${failedCount} failed`);
      return { retried: retriedCount, failed: failedCount };
    } catch (error) {
      logger.error('Failed to retry failed jobs:', error);
      throw error;
    }
  }

  async cleanOldJobs(daysOld = 7): Promise<{ cleaned: number }> {
    let cleanedCount = 0;

    try {
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

      const queues = [
        this.queueManager.imageProcessingQueue.getQueue(),
        this.queueManager.emailNotificationQueue.getQueue(),
        this.queueManager.webhookQueue.getQueue(),
        this.queueManager.reportGenerationQueue.getQueue(),
        this.queueManager.workflowQueue.getQueue(),
      ];

      for (const queue of queues) {
        try {
          await queue.clean(cutoffTime, 0, 'completed');
          await queue.clean(cutoffTime, 0, 'failed');
          cleanedCount++;
        } catch (error) {
          logger.error(`Failed to clean queue ${queue.name}:`, error);
        }
      }

      logger.info(`Cleaned old jobs from ${cleanedCount} queues`);
      return { cleaned: cleanedCount };
    } catch (error) {
      logger.error('Failed to clean old jobs:', error);
      throw error;
    }
  }
}