import { Queue, QueueOptions } from 'bullmq';
import { WorkflowJobData, QueueConfig } from '../types';
import { logger } from '../utils/logger';

export class WorkflowQueue {
  private readonly queue: Queue<WorkflowJobData>;

  constructor(config: QueueConfig) {
    const queueOptions: QueueOptions = {
      connection: config.redis,
      defaultJobOptions: {
        ...config.defaultJobOptions,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 100,
        timeout: 600000, // 10 minutes timeout for workflows
      },
    };

    this.queue = new Queue<WorkflowJobData>('workflow', queueOptions);

    this.queue.on('error', (error: Error) => {
      logger.error('Workflow queue error:', error);
    });

    this.queue.on('waiting', (job) => {
      logger.info(`Workflow job ${job.id || 'unknown'} is waiting`);
    });

    this.queue.on('active', (job) => {
      logger.info(`Workflow job ${job.id || 'unknown'} started`);
    });

    this.queue.on('completed', (job) => {
      logger.info(`Workflow job ${job.id || 'unknown'} completed`);
    });

    this.queue.on('failed', (job, error) => {
      logger.error(`Workflow job ${job?.id || 'unknown'} failed:`, error);
    });

    this.queue.on('progress', (job, progress) => {
      logger.info(`Workflow job ${job.id || 'unknown'} progress: ${progress}%`);
    });
  }

  async addJob(
    name: string,
    data: WorkflowJobData,
    options?: Parameters<typeof this.queue.add>[2]
  ): Promise<void> {
    try {
      const jobOptions = {
        priority: this.calculatePriority(data),
        timeout: this.calculateTimeout(data),
        ...options,
      };

      const job = await this.queue.add(name, data, jobOptions);
      logger.info(`Added workflow job ${job.id || 'unknown'} for workflow: ${data.workflowId}`);
    } catch (error) {
      logger.error('Failed to add workflow job:', error);
      throw error;
    }
  }

  async addDelayedWorkflow(
    name: string,
    data: WorkflowJobData,
    delayMs: number,
    options?: Parameters<typeof this.queue.add>[2]
  ): Promise<void> {
    await this.addJob(name, data, {
      ...options,
      delay: delayMs,
    });

    logger.info(`Added delayed workflow job for ${delayMs}ms delay`);
  }

  async addBulkJobs(
    jobs: Array<{ name: string; data: WorkflowJobData; opts?: Parameters<typeof this.queue.add>[2] }>
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
      logger.info(`Added ${jobs.length} workflow jobs in bulk`);
    } catch (error) {
      logger.error('Failed to add bulk workflow jobs:', error);
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

  async getActiveWorkflows(): Promise<Array<{
    id: string;
    progress: number;
    workflowId: string;
    currentStep?: string;
  }>> {
    const activeJobs = await this.queue.getActive();
    return activeJobs.map(job => ({
      id: job.id || 'unknown',
      progress: job.progress || 0,
      workflowId: job.data.workflowId,
      currentStep: job.data.context.currentStep as string | undefined,
    }));
  }

  async pauseWorkflow(workflowId: string): Promise<void> {
    const jobs = await this.queue.getJobs(['waiting', 'delayed']);
    const workflowJobs = jobs.filter(job => job.data.workflowId === workflowId);

    for (const job of workflowJobs) {
      try {
        await job.remove();
        logger.info(`Removed workflow job ${job.id || 'unknown'} for paused workflow ${workflowId}`);
      } catch (error) {
        logger.error(`Failed to remove workflow job ${job.id || 'unknown'}:`, error);
      }
    }
  }

  async pauseQueue(): Promise<void> {
    await this.queue.pause();
    logger.info('Workflow queue paused');
  }

  async resumeQueue(): Promise<void> {
    await this.queue.resume();
    logger.info('Workflow queue resumed');
  }

  async drainQueue(): Promise<void> {
    await this.queue.drain();
    logger.info('Workflow queue drained');
  }

  async closeQueue(): Promise<void> {
    await this.queue.close();
    logger.info('Workflow queue closed');
  }

  getQueue(): Queue<WorkflowJobData> {
    return this.queue;
  }

  private calculatePriority(data: WorkflowJobData): number {
    // Priority based on workflow complexity and step count
    const stepCount = data.steps.length;

    if (stepCount <= 2) return 1; // High priority for simple workflows
    if (stepCount <= 5) return 3; // Medium priority
    return 5; // Low priority for complex workflows
  }

  private calculateTimeout(data: WorkflowJobData): number {
    // Timeout based on number of steps
    const baseTimeout = 60000; // 1 minute base
    const stepCount = data.steps.length;

    return Math.min(baseTimeout * stepCount, 600000); // Max 10 minutes
  }
}