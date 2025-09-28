import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { processImageJob } from '../processors/image.processor.js';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

export const imageWorker = new Worker(
  'image-processing',
  processImageJob,
  {
    connection: redisConnection,
    concurrency: 3,
    limiter: {
      max: 5,
      duration: 5000,
    },
  }
);

imageWorker.on('completed', (job) => {
  logger.info({ jobId: job.id, jobName: job.name }, 'Image processing job completed');
});

imageWorker.on('failed', (job, error) => {
  if (job) {
    logger.error(
      { jobId: job.id, jobName: job.name, error: error.message },
      'Image processing job failed'
    );
  } else {
    logger.error({ error: error.message }, 'Image processing job failed without job context');
  }
});

imageWorker.on('progress', (job, progress) => {
  logger.info(
    { jobId: job.id, jobName: job.name, progress },
    'Image processing progress'
  );
});

imageWorker.on('error', (error) => {
  logger.error({ error: error.message }, 'Image worker error');
});