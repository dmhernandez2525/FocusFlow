import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

export const redisConnection = new Redis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisConnection.on('error', (error) => {
  throw new Error(`Redis connection error: ${error.message}`);
});

redisConnection.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    process.stdout.write('Redis connected successfully\n');
  }
});