import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';

interface RateLimitRequest extends Request {
  ip: string;
  user?: {
    id: string;
  };
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  headers?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: RateLimitRequest) => string;
}

export default (config: RateLimitConfig, { strapi }: { strapi: unknown }) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message || 'Too many requests from this IP, please try again later.',
    standardHeaders: config.headers !== false,
    legacyHeaders: false,
    skipSuccessfulRequests: config.skipSuccessfulRequests || false,
    skipFailedRequests: config.skipFailedRequests || false,
    keyGenerator: config.keyGenerator || ((request: RateLimitRequest): string => {
      return request.user?.id ? `user:${request.user.id}` : `ip:${request.ip}`;
    }),
    handler: (request: Request, response: Response): void => {
      response.status(429).json({
        error: {
          status: 429,
          name: 'TooManyRequestsError',
          message: config.message || 'Too many requests from this IP, please try again later.',
          details: {
            windowMs: config.windowMs,
            max: config.max,
          },
        },
      });
    },
    onLimitReached: (request: Request): void => {
      strapi && typeof strapi === 'object' && 'log' in strapi &&
      typeof strapi.log === 'object' && strapi.log && 'warn' in strapi.log &&
      typeof strapi.log.warn === 'function' &&
      strapi.log.warn(`Rate limit exceeded for IP: ${request.ip}`);
    },
  });
};