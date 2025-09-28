import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { processNotificationJob } from '../processors/notification.processor.js';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

export const notificationWorker = new Worker(
  'notifications',
  processNotificationJob,
  {
    connection: redisConnection,
    concurrency: 10,
    limiter: {
      max: 20,
      duration: 1000,
    },
  }
);

notificationWorker.on('completed', (job) => {
  logger.info({ jobId: job.id, jobName: job.name }, 'Notification job completed');
});

notificationWorker.on('failed', (job, error) => {
  if (job) {
    logger.error(
      { jobId: job.id, jobName: job.name, error: error.message },
      'Notification job failed'
    );
  } else {
    logger.error({ error: error.message }, 'Notification job failed without job context');
  }
});

notificationWorker.on('error', (error) => {
  logger.error({ error: error.message }, 'Notification worker error');
});