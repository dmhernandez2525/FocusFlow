import { Job, Worker } from 'bullmq';
import { WorkflowJobData, WorkflowResult, QueueConfig, WorkflowStep, WorkflowCondition } from '../types';
import { logger } from '../utils/logger';

export class WorkflowProcessor {
  private readonly worker: Worker<WorkflowJobData, WorkflowResult>;

  constructor(config: QueueConfig) {
    this.worker = new Worker<WorkflowJobData, WorkflowResult>(
      'workflow',
      this.processJob.bind(this),
      {
        connection: config.redis,
        concurrency: parseInt(process.env.WORKFLOW_PROCESSOR_CONCURRENCY || '3', 10),
        limiter: {
          max: 20,
          duration: 60000, // 20 workflows per minute
        },
      }
    );

    this.worker.on('completed', (job: Job<WorkflowJobData, WorkflowResult>) => {
      logger.info(`Workflow job ${job.id || 'unknown'} completed successfully`);
    });

    this.worker.on('failed', (job: Job<WorkflowJobData, WorkflowResult> | undefined, error: Error) => {
      logger.error(`Workflow job ${job?.id || 'unknown'} failed:`, error);
    });

    this.worker.on('error', (error: Error) => {
      logger.error('Workflow processor worker error:', error);
    });
  }

  private async processJob(job: Job<WorkflowJobData, WorkflowResult>): Promise<WorkflowResult> {
    const startTime = Date.now();
    const completedSteps: string[] = [];
    const failedSteps: string[] = [];

    try {
      logger.info(`Processing workflow job ${job.id || 'unknown'} for workflow: ${job.data.workflowId}`);

      const totalSteps = job.data.steps.length;
      let currentStepIndex = 0;

      for (const step of job.data.steps) {
        try {
          const progress = Math.floor((currentStepIndex / totalSteps) * 100);
          await job.updateProgress(progress);

          logger.info(`Executing workflow step ${step.id} of type ${step.type}`);

          // Check step conditions
          if (step.conditions && !this.evaluateConditions(step.conditions, job.data.context)) {
            logger.info(`Skipping step ${step.id} due to unmet conditions`);
            currentStepIndex++;
            continue;
          }

          // Execute the step
          await this.executeStep(step, job.data.context);
          completedSteps.push(step.id);

          logger.info(`Completed workflow step ${step.id}`);
        } catch (error) {
          logger.error(`Failed to execute workflow step ${step.id}:`, error);
          failedSteps.push(step.id);

          // Stop execution on step failure
          throw new Error(`Workflow failed at step ${step.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        currentStepIndex++;
      }

      await job.updateProgress(100);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          completedSteps,
          failedSteps: failedSteps.length > 0 ? failedSteps : undefined,
          totalExecutionTime: executionTime,
        },
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`Workflow processing failed for job ${job.id || 'unknown'}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime,
        metadata: {
          workflowId: job.data.workflowId,
          completedSteps,
          failedSteps,
        },
      };
    }
  }

  private evaluateConditions(conditions: WorkflowCondition[], context: Record<string, unknown>): boolean {
    return conditions.every(condition => this.evaluateCondition(condition, context));
  }

  private evaluateCondition(condition: WorkflowCondition, context: Record<string, unknown>): boolean {
    const fieldValue = this.getNestedValue(context, condition.field);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      default:
        logger.warn(`Unknown condition operator: ${condition.operator}`);
        return false;
    }
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' && key in current
        ? (current as Record<string, unknown>)[key]
        : undefined;
    }, obj);
  }

  private async executeStep(step: WorkflowStep, context: Record<string, unknown>): Promise<void> {
    switch (step.type) {
      case 'email':
        await this.executeEmailStep(step, context);
        break;
      case 'webhook':
        await this.executeWebhookStep(step, context);
        break;
      case 'delay':
        await this.executeDelayStep(step, context);
        break;
      case 'condition':
        await this.executeConditionStep(step, context);
        break;
      case 'image-process':
        await this.executeImageProcessStep(step, context);
        break;
      case 'report':
        await this.executeReportStep(step, context);
        break;
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  private async executeEmailStep(step: WorkflowStep, context: Record<string, unknown>): Promise<void> {
    const config = step.config as {
      to: string;
      template: string;
      variables?: Record<string, unknown>;
    };

    // Simulate email sending (in real implementation, would use EmailQueue)
    logger.info(`Sending email to ${config.to} with template ${config.template}`);

    // Merge context with step variables
    const emailVariables = {
      ...context,
      ...config.variables,
    };

    // Simulate email processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    logger.info(`Email step ${step.id} completed`);
  }

  private async executeWebhookStep(step: WorkflowStep, context: Record<string, unknown>): Promise<void> {
    const config = step.config as {
      url: string;
      method: string;
      payload?: Record<string, unknown>;
    };

    // Simulate webhook call (in real implementation, would use WebhookQueue)
    logger.info(`Calling webhook ${config.method} ${config.url}`);

    const payload = {
      ...context,
      ...config.payload,
    };

    // Simulate webhook processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    logger.info(`Webhook step ${step.id} completed`);
  }

  private async executeDelayStep(step: WorkflowStep, context: Record<string, unknown>): Promise<void> {
    const config = step.config as {
      duration: number; // milliseconds
    };

    logger.info(`Delaying workflow for ${config.duration}ms`);
    await new Promise(resolve => setTimeout(resolve, config.duration));

    logger.info(`Delay step ${step.id} completed`);
  }

  private async executeConditionStep(step: WorkflowStep, context: Record<string, unknown>): Promise<void> {
    const config = step.config as {
      conditions: WorkflowCondition[];
      onTrue?: WorkflowStep[];
      onFalse?: WorkflowStep[];
    };

    const conditionResult = this.evaluateConditions(config.conditions, context);

    logger.info(`Condition step ${step.id} evaluated to: ${conditionResult}`);

    const stepsToExecute = conditionResult ? config.onTrue : config.onFalse;

    if (stepsToExecute) {
      for (const subStep of stepsToExecute) {
        await this.executeStep(subStep, context);
      }
    }

    logger.info(`Condition step ${step.id} completed`);
  }

  private async executeImageProcessStep(step: WorkflowStep, context: Record<string, unknown>): Promise<void> {
    const config = step.config as {
      imageUrl: string;
      operations: Array<{ type: string; params: Record<string, unknown> }>;
    };

    // Simulate image processing (in real implementation, would use ImageProcessingQueue)
    logger.info(`Processing image ${config.imageUrl} with ${config.operations.length} operations`);

    // Simulate image processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    logger.info(`Image process step ${step.id} completed`);
  }

  private async executeReportStep(step: WorkflowStep, context: Record<string, unknown>): Promise<void> {
    const config = step.config as {
      reportType: string;
      template: string;
      data: Record<string, unknown>;
    };

    // Simulate report generation (in real implementation, would use ReportGenerationQueue)
    logger.info(`Generating ${config.reportType} report with template ${config.template}`);

    // Simulate report generation time
    await new Promise(resolve => setTimeout(resolve, 3000));

    logger.info(`Report step ${step.id} completed`);
  }

  async getActiveWorkflows(): Promise<Array<{
    jobId: string;
    workflowId: string;
    progress: number;
    currentStep?: string;
  }>> {
    // This would return actual active workflows in a real implementation
    return [];
  }

  async pauseWorkflow(workflowId: string): Promise<void> {
    logger.info(`Pausing workflow ${workflowId}`);
    // Implementation would pause all jobs for this workflow
  }

  async resumeWorkflow(workflowId: string): Promise<void> {
    logger.info(`Resuming workflow ${workflowId}`);
    // Implementation would resume all jobs for this workflow
  }

  async close(): Promise<void> {
    await this.worker.close();
    logger.info('Workflow processor worker closed');
  }

  getWorker(): Worker<WorkflowJobData, WorkflowResult> {
    return this.worker;
  }
}