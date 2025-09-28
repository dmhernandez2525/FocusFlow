import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { processEmailJob } from '../processors/email.processor.js';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

export const emailWorker = new Worker(
  'email',
  processEmailJob,
  {
    connection: redisConnection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    },
  }
);

emailWorker.on('completed', (job) => {
  logger.info({ jobId: job.id, jobName: job.name }, 'Email job completed');
});

emailWorker.on('failed', (job, error) => {
  if (job) {
    logger.error(
      { jobId: job.id, jobName: job.name, error: error.message },
      'Email job failed'
    );
  } else {
    logger.error({ error: error.message }, 'Email job failed without job context');
  }
});

emailWorker.on('error', (error) => {
  logger.error({ error: error.message }, 'Email worker error');
});