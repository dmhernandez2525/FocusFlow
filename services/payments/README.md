# FocusFlow Payment Service

A high-performance payment processing microservice built with Fastify 5.6.x and Stripe integration, designed to handle 45,000+ requests per second.

## Features

- **High Performance**: Built with Fastify 5.6.x for maximum throughput
- **Stripe Integration**: Complete Stripe SDK v18 integration with webhook support
- **Type Safety**: Strict TypeScript with no `any` types
- **Validation**: TypeBox schemas for request/response validation
- **Security**: Comprehensive security middleware, rate limiting, and CORS
- **Idempotency**: Built-in idempotency support for payment processing
- **Health Checks**: Kubernetes-ready health check endpoints
- **Monitoring**: Structured logging with Pino and metrics endpoints
- **Database**: PostgreSQL with connection pooling
- **Documentation**: Auto-generated OpenAPI/Swagger documentation

## API Endpoints

### Health & Monitoring
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with dependencies
- `GET /ready` - Kubernetes readiness probe
- `GET /live` - Kubernetes liveness probe
- `GET /metrics` - Service metrics

### Payment Intents
- `POST /api/v1/payment-intents` - Create payment intent
- `GET /api/v1/payment-intents/:id` - Get payment intent
- `GET /api/v1/payment-intents` - List payment intents
- `PATCH /api/v1/payment-intents/:id` - Update payment intent
- `POST /api/v1/payment-intents/:id/confirm` - Confirm payment intent
- `POST /api/v1/payment-intents/:id/cancel` - Cancel payment intent
- `POST /api/v1/payment-intents/:id/capture` - Capture payment intent

### Customers
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers/:id` - Get customer
- `GET /api/v1/customers` - List customers
- `PATCH /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer

### Subscriptions
- `POST /api/v1/subscriptions` - Create subscription
- `GET /api/v1/subscriptions/:id` - Get subscription
- `GET /api/v1/subscriptions` - List subscriptions
- `PATCH /api/v1/subscriptions/:id` - Update subscription
- `POST /api/v1/subscriptions/:id/cancel` - Cancel subscription

### Webhooks
- `POST /api/v1/webhooks/stripe` - Stripe webhook endpoint
- `GET /api/v1/webhooks/events/:eventId` - Get webhook event status
- `GET /api/v1/webhooks/events` - List webhook events

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Environment
NODE_ENV=development
HOST=0.0.0.0
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/payment_service
DATABASE_MAX_CONNECTIONS=20
DATABASE_IDLE_TIMEOUT=30000
DATABASE_CONNECTION_TIMEOUT=60000

# Stripe
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Security
CORS_ORIGIN=["http://localhost:3000","https://yourdomain.com"]
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=60000

# API
API_PREFIX=/api/v1
ENABLE_SWAGGER=true

# Health Check
HEALTH_CHECK_INTERVAL=30000

# Payment Processing
PAYMENT_TIMEOUT=30000
IDEMPOTENCY_TTL=86400000
```

## Development

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Docker (optional)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up database:
```bash
# Create PostgreSQL database
createdb payment_service

# The service will auto-create tables on startup
```

4. Start development server:
```bash
npm run dev
```

The service will be available at `http://localhost:3000`

### Scripts

- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run test` - Run tests
- `npm run type-check` - Run TypeScript type checking

## Docker

### Development with Docker Compose

```bash
# Start all services (app + database)
docker-compose up -d

# View logs
docker-compose logs -f payment-service

# Stop services
docker-compose down
```

### Production Docker Build

```bash
# Build image
docker build -t focusflow/payment-service .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e STRIPE_SECRET_KEY=sk_live_... \
  focusflow/payment-service
```

## Kubernetes Deployment

Deploy to Kubernetes using the provided manifests:

```bash
# Create namespace
kubectl create namespace focusflow

# Apply configurations
kubectl apply -f k8s/deployment.yaml

# Check deployment
kubectl get pods -n focusflow
kubectl logs -f deployment/payment-service -n focusflow
```

## Security Features

- **Helmet**: Security headers and CSP
- **CORS**: Configurable cross-origin policies
- **Rate Limiting**: Per-IP rate limiting with different limits for endpoints
- **Input Validation**: Strict TypeBox schema validation
- **Error Handling**: Sanitized error responses in production
- **Request Timeouts**: Protection against slow requests
- **Body Size Limits**: Protection against large payloads
- **Non-root User**: Container runs as non-root user

## Performance Optimizations

- **Fastify 5.6.x**: High-performance web framework
- **Connection Pooling**: PostgreSQL connection pooling
- **Idempotency**: Prevents duplicate payment processing
- **Efficient Logging**: Structured JSON logging with Pino
- **Health Checks**: Kubernetes-optimized health endpoints
- **Graceful Shutdown**: Proper cleanup on termination

## Monitoring & Observability

- **Structured Logging**: JSON logs with request correlation
- **Health Endpoints**: Multiple health check endpoints
- **Metrics**: Performance and usage metrics
- **Request Tracing**: Request ID tracking
- **Error Tracking**: Comprehensive error logging

## Stripe Webhook Events

The service handles these Stripe webhook events:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `payment_intent.requires_action`
- `customer.created`
- `customer.updated`
- `customer.deleted`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Database Schema

The service automatically creates these tables:

- `customers` - Customer information
- `payment_intents` - Payment intent records
- `subscriptions` - Subscription records
- `webhook_events` - Webhook event processing log
- `idempotency_records` - Idempotency key storage

## API Documentation

When `ENABLE_SWAGGER=true`, visit `/docs` for interactive API documentation.

## Contributing

1. Follow TypeScript strict mode guidelines
2. No `any` types allowed
3. No `console.log` statements
4. No TODO comments in production code
5. Add tests for new features
6. Ensure all linting passes

## License

MIT