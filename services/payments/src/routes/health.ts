import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getStripeService } from '@/utils/stripe';

export default async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  // Basic health check
  fastify.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' },
            environment: { type: 'string' }
          },
          required: ['status', 'timestamp', 'uptime', 'version', 'environment']
        }
      },
      tags: ['Health'],
      summary: 'Basic health check',
      description: 'Returns basic service health status'
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: fastify.config.NODE_ENV
    });
  });

  // Detailed health check with dependencies
  fastify.get('/health/detailed', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' },
            environment: { type: 'string' },
            dependencies: {
              type: 'object',
              properties: {
                database: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    responseTime: { type: 'number' }
                  },
                  required: ['status']
                },
                stripe: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    responseTime: { type: 'number' }
                  },
                  required: ['status']
                }
              },
              required: ['database', 'stripe']
            }
          },
          required: ['status', 'timestamp', 'uptime', 'version', 'environment', 'dependencies']
        },
        503: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            dependencies: {
              type: 'object',
              additionalProperties: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  error: { type: 'string' },
                  responseTime: { type: 'number' }
                },
                required: ['status']
              }
            }
          },
          required: ['status', 'timestamp', 'dependencies']
        }
      },
      tags: ['Health'],
      summary: 'Detailed health check',
      description: 'Returns detailed service health status including dependency checks'
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const healthChecks = {
      database: { status: 'unknown', responseTime: 0 },
      stripe: { status: 'unknown', responseTime: 0 }
    };

    let overallStatus = 'healthy';

    // Check database connection
    try {
      const dbStart = Date.now();
      await fastify.pg.query('SELECT 1');
      healthChecks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStart
      };
    } catch (error) {
      healthChecks.database = {
        status: 'unhealthy',
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
      overallStatus = 'unhealthy';
    }

    // Check Stripe connectivity
    try {
      const stripeStart = Date.now();
      const stripeService = getStripeService();
      // Just check if we can access the Stripe client (don't make actual API calls)
      const stripeInstance = stripeService.getStripeInstance();
      if (!stripeInstance) {
        throw new Error('Stripe client not initialized');
      }
      healthChecks.stripe = {
        status: 'healthy',
        responseTime: Date.now() - stripeStart
      };
    } catch (error) {
      healthChecks.stripe = {
        status: 'unhealthy',
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown Stripe error'
      };
      overallStatus = 'unhealthy';
    }

    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    reply.status(statusCode).send({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: fastify.config.NODE_ENV,
      dependencies: healthChecks
    });
  });

  // Readiness probe (for Kubernetes)
  fastify.get('/ready', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            ready: { type: 'boolean' },
            timestamp: { type: 'string' }
          },
          required: ['ready', 'timestamp']
        },
        503: {
          type: 'object',
          properties: {
            ready: { type: 'boolean' },
            timestamp: { type: 'string' },
            reason: { type: 'string' }
          },
          required: ['ready', 'timestamp', 'reason']
        }
      },
      tags: ['Health'],
      summary: 'Readiness probe',
      description: 'Kubernetes readiness probe endpoint'
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Quick database connectivity check
      await fastify.pg.query('SELECT 1');

      reply.send({
        ready: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      reply.status(503).send({
        ready: false,
        timestamp: new Date().toISOString(),
        reason: 'Database connection failed'
      });
    }
  });

  // Liveness probe (for Kubernetes)
  fastify.get('/live', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            alive: { type: 'boolean' },
            timestamp: { type: 'string' }
          },
          required: ['alive', 'timestamp']
        }
      },
      tags: ['Health'],
      summary: 'Liveness probe',
      description: 'Kubernetes liveness probe endpoint'
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      alive: true,
      timestamp: new Date().toISOString()
    });
  });

  // Metrics endpoint
  fastify.get('/metrics', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            memory: {
              type: 'object',
              properties: {
                rss: { type: 'number' },
                heapTotal: { type: 'number' },
                heapUsed: { type: 'number' },
                external: { type: 'number' },
                arrayBuffers: { type: 'number' }
              },
              required: ['rss', 'heapTotal', 'heapUsed', 'external']
            },
            cpu: {
              type: 'object',
              properties: {
                user: { type: 'number' },
                system: { type: 'number' }
              },
              required: ['user', 'system']
            },
            uptime: { type: 'number' },
            timestamp: { type: 'string' }
          },
          required: ['memory', 'cpu', 'uptime', 'timestamp']
        }
      },
      tags: ['Health'],
      summary: 'Service metrics',
      description: 'Returns service performance metrics'
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    reply.send({
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers || 0
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });
}