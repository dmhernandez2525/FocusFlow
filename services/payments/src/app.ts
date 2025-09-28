import Fastify, { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import closeWithGrace from 'close-with-grace';

// Import plugins
import envPlugin from '@/plugins/env';
import databasePlugin from '@/plugins/database';
import securityPlugin from '@/plugins/security';
import swaggerPlugin from '@/plugins/swagger';

// Import routes
import healthRoutes from '@/routes/health';
import paymentIntentsRoutes from '@/routes/payment-intents';
import customersRoutes from '@/routes/customers';
import subscriptionsRoutes from '@/routes/subscriptions';
import webhooksRoutes from '@/routes/webhooks';

// Import utilities
import { initializeStripeService } from '@/utils/stripe';
import { IdempotencyService } from '@/utils/idempotency';

const app: FastifyInstance = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    ...(process.env.NODE_ENV === 'development' && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    })
  },
  requestIdLogLabel: 'requestId',
  requestIdHeader: 'x-request-id',
  disableRequestLogging: false,
  trustProxy: true,
  ignoreTrailingSlash: true,
  bodyLimit: 1048576, // 1MB
  keepAliveTimeout: 30000,
  maxParamLength: 100
}).withTypeProvider<TypeBoxTypeProvider>();

// Graceful shutdown handler
const closeListeners = closeWithGrace(
  { delay: parseInt(process.env.FASTIFY_CLOSE_GRACE_DELAY || '500') },
  async function ({ signal, err, manual }) {
    if (err) {
      app.log.error(err);
    }
    app.log.info(`Received ${signal}, closing server gracefully`);
    await app.close();
  }
);

app.addHook('onClose', async () => {
  closeListeners.uninstall();
});

async function build(): Promise<FastifyInstance> {
  try {
    // Register plugins in order
    await app.register(envPlugin);

    app.log.info('Environment configuration loaded');

    // Initialize Stripe service after env is loaded
    initializeStripeService(app);
    app.log.info('Stripe service initialized');

    await app.register(databasePlugin);
    app.log.info('Database connection established');

    await app.register(securityPlugin);
    app.log.info('Security middleware configured');

    await app.register(swaggerPlugin);
    app.log.info('Swagger documentation configured');

    // Request ID generation
    app.addHook('onRequest', async (request, reply) => {
      if (!request.headers['x-request-id']) {
        request.headers['x-request-id'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
    });

    // Add timing information to responses
    app.addHook('onSend', async (request, reply, payload) => {
      const responseTime = reply.elapsedTime;
      reply.header('X-Response-Time', `${responseTime}ms`);

      if (app.config.NODE_ENV === 'development') {
        app.log.info({
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
          responseTime: `${responseTime}ms`
        }, 'Request completed');
      }

      return payload;
    });

    // Register health routes first (no API prefix)
    await app.register(healthRoutes);

    // Register API routes with prefix
    await app.register(async function (fastify) {
      await fastify.register(paymentIntentsRoutes);
      await fastify.register(customersRoutes);
      await fastify.register(subscriptionsRoutes);
      await fastify.register(webhooksRoutes);
    }, { prefix: app.config.API_PREFIX });

    // 404 handler
    app.setNotFoundHandler(async (request, reply) => {
      reply.status(404).send({
        error: {
          type: 'not_found',
          message: `Route ${request.method} ${request.url} not found`
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    });

    // Global error handler (already set in security plugin, but as backup)
    app.setErrorHandler(async (error, request, reply) => {
      request.log.error(error);

      if (reply.sent) {
        return;
      }

      reply.status(error.statusCode || 500).send({
        error: {
          type: error.code || 'internal_server_error',
          message: error.message || 'An unexpected error occurred'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
    });

    // Periodic cleanup of expired idempotency records
    if (app.config.NODE_ENV !== 'test') {
      const cleanupInterval = setInterval(async () => {
        try {
          const idempotencyService = new IdempotencyService(app);
          await idempotencyService.cleanupExpiredRecords();
          app.log.debug('Cleaned up expired idempotency records');
        } catch (error) {
          app.log.error('Error cleaning up idempotency records:', error);
        }
      }, 60000 * 60); // Every hour

      app.addHook('onClose', async () => {
        clearInterval(cleanupInterval);
      });
    }

    // Ready hook
    app.addHook('onReady', async function () {
      app.log.info({
        host: app.config.HOST,
        port: app.config.PORT,
        environment: app.config.NODE_ENV,
        nodeVersion: process.version,
        apiPrefix: app.config.API_PREFIX
      }, 'FocusFlow Payment Service is ready');

      if (app.config.ENABLE_SWAGGER) {
        app.log.info(`Swagger documentation available at: http://${app.config.HOST}:${app.config.PORT}/docs`);
      }
    });

    return app;
  } catch (error) {
    app.log.error('Error building application:', error);
    throw error;
  }
}

async function start(): Promise<void> {
  try {
    const server = await build();

    await server.listen({
      host: server.config.HOST,
      port: server.config.PORT
    });

    // Health check interval
    if (server.config.NODE_ENV !== 'test') {
      setInterval(async () => {
        try {
          await server.pg.query('SELECT 1');
        } catch (error) {
          server.log.error('Health check failed:', error);
        }
      }, server.config.HEALTH_CHECK_INTERVAL);
    }

  } catch (error) {
    app.log.error('Error starting server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  app.log.fatal(error, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  app.log.fatal({ reason, promise }, 'Unhandled rejection');
  process.exit(1);
});

// Start the server if this file is executed directly
if (require.main === module) {
  start();
}

export { build, start };
export default app;