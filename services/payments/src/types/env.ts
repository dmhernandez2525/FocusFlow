import { Type, Static } from '@sinclair/typebox';

export const EnvironmentSchema = Type.Object({
  NODE_ENV: Type.Union([
    Type.Literal('development'),
    Type.Literal('production'),
    Type.Literal('test')
  ]),
  HOST: Type.String({ default: '0.0.0.0' }),
  PORT: Type.Number({ default: 3000, minimum: 1, maximum: 65535 }),
  LOG_LEVEL: Type.Union([
    Type.Literal('fatal'),
    Type.Literal('error'),
    Type.Literal('warn'),
    Type.Literal('info'),
    Type.Literal('debug'),
    Type.Literal('trace')
  ], { default: 'info' }),

  // Database
  DATABASE_URL: Type.String(),
  DATABASE_MAX_CONNECTIONS: Type.Number({ default: 20, minimum: 1 }),
  DATABASE_IDLE_TIMEOUT: Type.Number({ default: 30000, minimum: 1000 }),
  DATABASE_CONNECTION_TIMEOUT: Type.Number({ default: 60000, minimum: 1000 }),

  // Stripe
  STRIPE_SECRET_KEY: Type.String(),
  STRIPE_WEBHOOK_SECRET: Type.String(),
  STRIPE_PUBLISHABLE_KEY: Type.String(),

  // Security
  CORS_ORIGIN: Type.Array(Type.String(), { default: [] }),
  RATE_LIMIT_MAX: Type.Number({ default: 100, minimum: 1 }),
  RATE_LIMIT_TIME_WINDOW: Type.Number({ default: 60000, minimum: 1000 }),

  // API
  API_PREFIX: Type.String({ default: '/api/v1' }),
  ENABLE_SWAGGER: Type.Boolean({ default: false }),

  // Health Check
  HEALTH_CHECK_INTERVAL: Type.Number({ default: 30000, minimum: 1000 }),

  // Payment Processing
  PAYMENT_TIMEOUT: Type.Number({ default: 30000, minimum: 5000 }),
  IDEMPOTENCY_TTL: Type.Number({ default: 86400000, minimum: 3600000 }) // 24 hours default
});

export type Environment = Static<typeof EnvironmentSchema>;

declare module 'fastify' {
  interface FastifyInstance {
    config: Environment;
  }
}