import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { processAnalyticsJob } from '../processors/analytics.processor.js';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

export const analyticsWorker = new Worker(
  'analytics',
  processAnalyticsJob,
  {
    connection: redisConnection,
    concurrency: 20,
    limiter: {
      max: 50,
      duration: 1000,
    },
  }
);

analyticsWorker.on('completed', (job) => {
  logger.info({ jobId: job.id, jobName: job.name }, 'Analytics job completed');
});

analyticsWorker.on('failed', (job, error) => {
  if (job) {
    logger.error(
      { jobId: job.id, jobName: job.name, error: error.message },
      'Analytics job failed'
    );
  } else {
    logger.error({ error: error.message }, 'Analytics job failed without job context');
  }
});

analyticsWorker.on('error', (error) => {
  logger.error({ error: error.message }, 'Analytics worker error');
});