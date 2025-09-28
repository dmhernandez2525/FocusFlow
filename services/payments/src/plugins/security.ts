import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { FastifyInstance } from 'fastify';

export default fp(async function (fastify: FastifyInstance) {
  // Register sensible for HTTP errors
  await fastify.register(sensible);

  // Security headers with Helmet
  await fastify.register(helmet, {
    global: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  });

  // CORS configuration
  await fastify.register(cors, {
    origin: (origin, callback) => {
      const allowedOrigins = fastify.config.CORS_ORIGIN;

      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'idempotency-key',
      'stripe-signature'
    ]
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: fastify.config.RATE_LIMIT_MAX,
    timeWindow: fastify.config.RATE_LIMIT_TIME_WINDOW,
    skipSuccessfulRequests: false,
    skipOnError: false,
    ban: 5, // Ban after 5 violations
    keyGenerator: (request) => {
      // Use IP address as the key
      return request.ip;
    },
    errorResponseBuilder: (request, context) => {
      return {
        error: {
          type: 'rate_limit_exceeded',
          message: `Too many requests. Limit: ${context.max} requests per ${Math.floor(context.timeWindow / 1000)} seconds`,
          retryAfter: Math.round(context.ttl / 1000)
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      };
    },
    onBanReach: (req, key, totalHits, banHits) => {
      fastify.log.warn(`IP ${key} banned for exceeding rate limit. Total hits: ${totalHits}, Ban hits: ${banHits}`);
    },
    onExceeding: (req, key) => {
      fastify.log.warn(`IP ${key} is exceeding rate limit`);
    }
  });

  // Stricter rate limiting for sensitive endpoints
  fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: 10, // Very restrictive for webhooks
      timeWindow: 60000, // 1 minute
      skipSuccessfulRequests: false,
      keyGenerator: (request) => {
        return request.ip;
      },
      errorResponseBuilder: (request, context) => {
        return {
          error: {
            type: 'rate_limit_exceeded',
            message: `Too many webhook requests. Limit: ${context.max} requests per ${Math.floor(context.timeWindow / 1000)} seconds`
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        };
      }
    });

    fastify.addHook('preHandler', async (request, reply) => {
      // Additional security for webhook endpoints
      if (request.url.includes('/webhooks/')) {
        // Ensure proper content type for webhooks
        if (!request.headers['content-type']?.includes('application/json')) {
          throw fastify.httpErrors.badRequest('Invalid content type for webhook');
        }
      }
    });
  }, { prefix: '/api/v1/webhooks' });

  // Payment endpoints stricter rate limiting
  fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: 50, // More restrictive for payment operations
      timeWindow: 60000, // 1 minute
      skipSuccessfulRequests: false,
      keyGenerator: (request) => {
        return request.ip;
      },
      errorResponseBuilder: (request, context) => {
        return {
          error: {
            type: 'rate_limit_exceeded',
            message: `Too many payment requests. Limit: ${context.max} requests per ${Math.floor(context.timeWindow / 1000)} seconds`
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        };
      }
    });
  }, { prefix: '/api/v1/payment-intents' });

  // Request logging and security monitoring
  fastify.addHook('preHandler', async (request, reply) => {
    // Log all requests for security monitoring
    request.log.info({
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      referer: request.headers.referer
    }, 'Incoming request');

    // Security headers for all responses
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  });

  // Error handling for security-related errors
  fastify.setErrorHandler(async (error, request, reply) => {
    // Log security-related errors
    if (error.statusCode === 403 || error.statusCode === 401) {
      request.log.warn({
        error: error.message,
        ip: request.ip,
        url: request.url,
        method: request.method
      }, 'Security error');
    }

    // Don't expose internal error details in production
    if (fastify.config.NODE_ENV === 'production' && error.statusCode >= 500) {
      reply.status(500).send({
        error: {
          type: 'internal_server_error',
          message: 'An internal error occurred'
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
      return;
    }

    // Validation errors
    if (error.validation) {
      reply.status(400).send({
        error: {
          type: 'validation_error',
          message: 'Request validation failed',
          validation: error.validation
        },
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      });
      return;
    }

    // Default error response
    reply.status(error.statusCode || 500).send({
      error: {
        type: error.code || 'unknown_error',
        message: error.message
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.id
    });
  });

  // Request timeout protection
  fastify.addHook('onRequest', async (request, reply) => {
    // Set timeout for payment processing requests
    if (request.url.includes('/payment-intents') || request.url.includes('/subscriptions')) {
      reply.raw.setTimeout(fastify.config.PAYMENT_TIMEOUT, () => {
        reply.code(408).send({
          error: {
            type: 'request_timeout',
            message: 'Request timeout - payment processing took too long'
          },
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id
        });
      });
    }
  });

  // Body size limits
  fastify.addHook('preValidation', async (request, reply) => {
    const maxBodySize = 1024 * 1024; // 1MB limit

    if (request.headers['content-length']) {
      const contentLength = parseInt(request.headers['content-length']);
      if (contentLength > maxBodySize) {
        throw fastify.httpErrors.payloadTooLarge('Request body too large');
      }
    }
  });
});