import Redis from 'ioredis';
import { RedisConfig } from '../types';
import { logger } from '../utils/logger';

export const createRedisConfig = (): RedisConfig => {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true,
    connectTimeout: 10000,
    commandTimeout: 5000,
  };
};

export const createRedisConnection = (config: RedisConfig): Redis => {
  const redis = new Redis({
    ...config,
    retryStrategy: (times: number): number => {
      const delay = Math.min(times * 50, 2000);
      logger.warn(`Redis connection retry attempt ${times}, delay: ${delay}ms`);
      return delay;
    },
    reconnectOnError: (err: Error): boolean => {
      const targetError = 'READONLY';
      return err.message.includes(targetError);
    },
  });

  redis.on('connect', (): void => {
    logger.info('Redis connected successfully');
  });

  redis.on('ready', (): void => {
    logger.info('Redis connection ready');
  });

  redis.on('error', (error: Error): void => {
    logger.error('Redis connection error:', error);
  });

  redis.on('close', (): void => {
    logger.warn('Redis connection closed');
  });

  redis.on('reconnecting', (): void => {
    logger.info('Redis reconnecting...');
  });

  return redis;
};