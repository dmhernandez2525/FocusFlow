import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // NextAuth.js
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),

  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // External Services
  REDIS_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // App Configuration
  APP_URL: z.string().url(),
  APP_NAME: z.string().default('FocusFlow'),
  APP_DESCRIPTION: z.string().default('Focus and productivity management platform'),

  // Analytics & Monitoring
  ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),

  // File Storage
  UPLOAD_MAX_SIZE: z.string().transform(Number).default('10485760'),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp,application/pdf'),

  // Rate Limiting
  RATE_LIMIT_REQUESTS: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('900000'),

  // Feature Flags
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_EMAIL_NOTIFICATIONS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_PUSH_NOTIFICATIONS: z.string().transform(val => val === 'true').default('false'),
  ENABLE_DARK_MODE: z.string().transform(val => val === 'true').default('true'),

  // Security
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CSRF_SECRET: z.string().min(1),

  // Development
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  DEBUG_MODE: z.string().transform(val => val === 'true').default('false'),
})

type Env = z.infer<typeof envSchema>

const parseEnv = (): Env => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => err.path.join('.'))
        .join(', ')

      throw new Error(`Missing or invalid environment variables: ${missingVars}`)
    }
    throw error
  }
}

export const env = parseEnv()

// Export types for use in other files
export type { Env }