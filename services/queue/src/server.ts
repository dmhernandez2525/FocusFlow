import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { QueueManager } from './manager';
import { BullBoardMonitoring } from './monitoring/bullBoard';
import { logger } from './utils/logger';

export class QueueServer {
  private readonly app: express.Application;
  private readonly queueManager: QueueManager;
  private readonly bullBoardMonitoring: BullBoardMonitoring;
  private server: ReturnType<typeof express.prototype.listen> | null = null;

  constructor() {
    this.app = express();
    this.queueManager = new QueueManager();
    this.bullBoardMonitoring = new BullBoardMonitoring(this.queueManager);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const healthCheck = await this.queueManager.getHealthCheck();
        res.status(healthCheck.status === 'healthy' ? 200 : 503).json(healthCheck);
      } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({
          status: 'unhealthy',
          error: 'Health check failed',
        });
      }
    });

    // Queue statistics endpoint
    this.app.get('/stats', async (req, res) => {
      try {
        const stats = await this.bullBoardMonitoring.getDetailedStats();
        res.json(stats);
      } catch (error) {
        logger.error('Failed to get queue stats:', error);
        res.status(500).json({
          error: 'Failed to get queue statistics',
        });
      }
    });

    // Queue overview endpoint
    this.app.get('/overview', async (req, res) => {
      try {
        const overview = await this.bullBoardMonitoring.getQueueOverview();
        res.json(overview);
      } catch (error) {
        logger.error('Failed to get queue overview:', error);
        res.status(500).json({
          error: 'Failed to get queue overview',
        });
      }
    });

    // Active jobs endpoint
    this.app.get('/jobs/active', async (req, res) => {
      try {
        const activeJobs = await this.bullBoardMonitoring.getActiveJobs();
        res.json(activeJobs);
      } catch (error) {
        logger.error('Failed to get active jobs:', error);
        res.status(500).json({
          error: 'Failed to get active jobs',
        });
      }
    });

    // Failed jobs endpoint
    this.app.get('/jobs/failed', async (req, res) => {
      try {
        const failedJobs = await this.bullBoardMonitoring.getFailedJobs();
        res.json(failedJobs);
      } catch (error) {
        logger.error('Failed to get failed jobs:', error);
        res.status(500).json({
          error: 'Failed to get failed jobs',
        });
      }
    });

    // Retry failed jobs endpoint
    this.app.post('/jobs/retry', async (req, res) => {
      try {
        const result = await this.bullBoardMonitoring.retryAllFailedJobs();
        res.json(result);
      } catch (error) {
        logger.error('Failed to retry failed jobs:', error);
        res.status(500).json({
          error: 'Failed to retry failed jobs',
        });
      }
    });

    // Clean old jobs endpoint
    this.app.post('/jobs/clean', async (req, res) => {
      try {
        const { days = 7 } = req.body as { days?: number };
        const result = await this.bullBoardMonitoring.cleanOldJobs(days);
        res.json(result);
      } catch (error) {
        logger.error('Failed to clean old jobs:', error);
        res.status(500).json({
          error: 'Failed to clean old jobs',
        });
      }
    });

    // Queue management endpoints
    this.app.post('/queues/pause', async (req, res) => {
      try {
        await this.queueManager.pauseAllQueues();
        res.json({ message: 'All queues paused successfully' });
      } catch (error) {
        logger.error('Failed to pause queues:', error);
        res.status(500).json({
          error: 'Failed to pause queues',
        });
      }
    });

    this.app.post('/queues/resume', async (req, res) => {
      try {
        await this.queueManager.resumeAllQueues();
        res.json({ message: 'All queues resumed successfully' });
      } catch (error) {
        logger.error('Failed to resume queues:', error);
        res.status(500).json({
          error: 'Failed to resume queues',
        });
      }
    });

    this.app.post('/queues/drain', async (req, res) => {
      try {
        await this.queueManager.drainAllQueues();
        res.json({ message: 'All queues drained successfully' });
      } catch (error) {
        logger.error('Failed to drain queues:', error);
        res.status(500).json({
          error: 'Failed to drain queues',
        });
      }
    });

    // Bull Board monitoring interface
    this.app.use('/admin/queues', this.bullBoardMonitoring.getRouter().getRouter());

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        service: 'FocusFlow Queue Service',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/health',
          stats: '/stats',
          overview: '/overview',
          monitoring: '/admin/queues',
          activeJobs: '/jobs/active',
          failedJobs: '/jobs/failed',
          retryJobs: 'POST /jobs/retry',
          cleanJobs: 'POST /jobs/clean',
          pauseQueues: 'POST /queues/pause',
          resumeQueues: 'POST /queues/resume',
          drainQueues: 'POST /queues/drain',
        },
      });
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `The endpoint ${req.method} ${req.path} was not found`,
      });
    });

    // Error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Express error:', error);

      if (res.headersSent) {
        return next(error);
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      });
    });
  }

  async start(port = 3001): Promise<void> {
    try {
      // Initialize queue manager
      await this.queueManager.initialize();

      // Start server
      this.server = this.app.listen(port, () => {
        logger.info(`Queue server running on port ${port}`);
        logger.info(`Bull Board available at: http://localhost:${port}/admin/queues`);
        logger.info(`Health check available at: http://localhost:${port}/health`);
        logger.info(`API documentation available at: http://localhost:${port}/`);
      });

      // Handle server errors
      this.server.on('error', (error: Error) => {
        logger.error('Server error:', error);
      });

      // Graceful shutdown handlers
      process.on('SIGTERM', () => this.shutdown('SIGTERM'));
      process.on('SIGINT', () => this.shutdown('SIGINT'));

    } catch (error) {
      logger.error('Failed to start queue server:', error);
      throw error;
    }
  }

  private async shutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}, shutting down gracefully...`);

    try {
      // Close server
      if (this.server) {
        this.server.close();
      }

      // Shutdown queue manager
      await this.queueManager.shutdown();

      logger.info('Server shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

  getApp(): express.Application {
    return this.app;
  }

  getQueueManager(): QueueManager {
    return this.queueManager;
  }
}