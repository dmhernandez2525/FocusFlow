import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';

export default fp(async function (fastify: FastifyInstance) {
  if (!fastify.config.ENABLE_SWAGGER) {
    return;
  }

  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'FocusFlow Payment Service API',
        description: 'High-performance payment processing service with Stripe integration',
        version: '1.0.0',
        contact: {
          name: 'FocusFlow Team',
          email: 'support@focusflow.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: `http://localhost:${fastify.config.PORT}${fastify.config.API_PREFIX}`,
          description: 'Development server'
        },
        {
          url: `https://api.focusflow.com${fastify.config.API_PREFIX}`,
          description: 'Production server'
        }
      ],
      tags: [
        {
          name: 'Health',
          description: 'Health check and monitoring endpoints'
        },
        {
          name: 'Payment Intents',
          description: 'Payment intent management'
        },
        {
          name: 'Customers',
          description: 'Customer management'
        },
        {
          name: 'Subscriptions',
          description: 'Subscription management'
        },
        {
          name: 'Webhooks',
          description: 'Stripe webhook processing'
        }
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'API Key for authentication'
          }
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  message: { type: 'string' },
                  code: { type: 'string' },
                  details: {}
                },
                required: ['type', 'message']
              },
              timestamp: { type: 'string', format: 'date-time' },
              path: { type: 'string' },
              requestId: { type: 'string' }
            },
            required: ['error', 'timestamp', 'path', 'requestId']
          },
          ValidationError: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['validation_error'] },
                  message: { type: 'string' },
                  validation: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        instancePath: { type: 'string' },
                        schemaPath: { type: 'string' },
                        keyword: { type: 'string' },
                        params: { type: 'object' },
                        message: { type: 'string' }
                      },
                      required: ['instancePath', 'schemaPath', 'keyword', 'params', 'message']
                    }
                  }
                },
                required: ['type', 'message', 'validation']
              },
              timestamp: { type: 'string', format: 'date-time' },
              path: { type: 'string' },
              requestId: { type: 'string' }
            },
            required: ['error', 'timestamp', 'path', 'requestId']
          }
        }
      },
      security: [
        {
          apiKey: []
        }
      ]
    }
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true
  });
});