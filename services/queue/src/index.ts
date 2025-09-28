import { QueueServer } from './server';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  try {
    const server = new QueueServer();
    const port = parseInt(process.env.PORT || '3001', 10);

    await server.start(port);
  } catch (error) {
    logger.error('Failed to start queue service:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Start the service
if (require.main === module) {
  void main();
}

// Export for testing
export { QueueServer };
export { QueueManager } from './manager';
export * from './types';
export * from './queues';
export * from './processors';