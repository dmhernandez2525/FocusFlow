import pino from 'pino';
import { emailWorker } from './workers/email.worker.js';
import { imageWorker } from './workers/image.worker.js';
import { notificationWorker } from './workers/notification.worker.js';
import { analyticsWorker } from './workers/analytics.worker.js';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  } : undefined,
});

async function start(): Promise<void> {
  logger.info('Starting FocusFlow worker service...');

  const workers = [
    { name: 'Email', worker: emailWorker },
    { name: 'Image Processing', worker: imageWorker },
    { name: 'Notification', worker: notificationWorker },
    { name: 'Analytics', worker: analyticsWorker },
  ];

  for (const { name, worker } of workers) {
    await worker.waitUntilReady();
    logger.info(`${name} worker started successfully`);
  }

  logger.info('All workers started successfully');

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM signal, gracefully shutting down workers...');

    await Promise.all(workers.map(async ({ name, worker }) => {
      await worker.close();
      logger.info(`${name} worker closed`);
    }));

    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('Received SIGINT signal, gracefully shutting down workers...');

    await Promise.all(workers.map(async ({ name, worker }) => {
      await worker.close();
      logger.info(`${name} worker closed`);
    }));

    process.exit(0);
  });
}

start().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logger.error({ error: errorMessage }, 'Failed to start worker service');
  process.exit(1);
});