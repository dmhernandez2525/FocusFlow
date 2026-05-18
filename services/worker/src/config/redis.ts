import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisOptions = {
  maxRetriesPerRequest: null,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

export const redisConnection = redisUrl
  ? new Redis(redisUrl, redisOptions)
  : new Redis({
      host: redisHost,
      port: redisPort,
      ...redisOptions,
    });

redisConnection.on('error', (error) => {
  throw new Error(`Redis connection error: ${error.message}`);
});

redisConnection.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    process.stdout.write('Redis connected successfully\n');
  }
});
