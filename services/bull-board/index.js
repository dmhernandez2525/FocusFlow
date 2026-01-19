const express = require('express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Configuration
const PORT = process.env.PORT || 3003;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME || 'admin';
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || 'admin';

// Queue names matching the queue service
const QUEUE_NAMES = [
  'image-processing',
  'email-notification',
  'webhook',
  'report-generation',
  'workflow'
];

// Create Redis connection (lazy connect - won't fail immediately if Redis unavailable)
let redisConnection = null;
let redisConnected = false;

function createRedisConnection() {
  const connection = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) {
        console.log('Redis connection failed after 3 retries');
        return null; // Stop retrying
      }
      return Math.min(times * 100, 3000);
    }
  });

  connection.on('connect', () => {
    console.log('Redis connected');
    redisConnected = true;
  });

  connection.on('error', (err) => {
    console.error('Redis error:', err.message);
    redisConnected = false;
  });

  connection.on('close', () => {
    console.log('Redis connection closed');
    redisConnected = false;
  });

  return connection;
}

if (REDIS_HOST) {
  redisConnection = createRedisConnection();
} else {
  console.log('REDIS_HOST not configured - running in demo mode');
}

// Create Express app
const app = express();

// Basic auth middleware
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board"');
    return res.status(401).send('Authentication required');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username === BASIC_AUTH_USERNAME && password === BASIC_AUTH_PASSWORD) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board"');
  return res.status(401).send('Invalid credentials');
};

// Health check endpoint (no auth required)
app.get('/health', async (req, res) => {
  try {
    if (!redisConnection) {
      // No Redis configured - return healthy but note Redis is not configured
      return res.status(200).json({
        status: 'healthy',
        service: 'bull-board',
        redis: 'not_configured',
        message: 'Running in demo mode - configure REDIS_HOST to connect to queues',
        timestamp: new Date().toISOString()
      });
    }

    // Check Redis connection
    await redisConnection.ping();
    res.status(200).json({
      status: 'healthy',
      service: 'bull-board',
      redis: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Return 200 for health check even if Redis is down
    // The service is running, just not fully functional
    res.status(200).json({
      status: 'degraded',
      service: 'bull-board',
      redis: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Setup Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/');

// Create queue instances only if Redis is configured
let queues = [];
if (REDIS_HOST) {
  queues = QUEUE_NAMES.map(name => {
    return new Queue(name, {
      connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        maxRetriesPerRequest: null,
        enableReadyCheck: false
      }
    });
  });
}

// Create Bull Board
createBullBoard({
  queues: queues.map(queue => new BullMQAdapter(queue)),
  serverAdapter,
  options: {
    uiConfig: {
      boardTitle: 'FocusFlow Queue Dashboard',
      boardLogo: {
        path: 'https://cdn.jsdelivr.net/npm/bullmq@5/docs/gitbook/assets/logo.png',
        width: '100px',
        height: 'auto'
      },
      miscLinks: [
        {
          text: 'Health Check',
          url: '/health'
        }
      ],
      locale: {
        lng: 'en'
      }
    }
  }
});

// Apply basic auth to Bull Board routes (except health check)
app.use('/', basicAuth, serverAdapter.getRouter());

// Start server
async function start() {
  try {
    // Connect to Redis if configured
    if (redisConnection) {
      try {
        await redisConnection.connect();
        console.log('Connected to Redis');
      } catch (error) {
        console.error('Failed to connect to Redis:', error.message);
        console.log('Continuing without Redis connection...');
      }
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Bull Board running on port ${PORT}`);
      console.log(`Dashboard available at: http://localhost:${PORT}/`);
      console.log(`Health check available at: http://localhost:${PORT}/health`);
      if (!REDIS_HOST) {
        console.log('Note: REDIS_HOST not configured - running in demo mode');
      }
    });
  } catch (error) {
    console.error('Failed to start Bull Board:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down...');
  if (redisConnection) {
    await redisConnection.quit();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down...');
  if (redisConnection) {
    await redisConnection.quit();
  }
  process.exit(0);
});

start();
