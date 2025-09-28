# FocusFlow - Photography ERP Platform Implementation Guide 2025

## Project Overview

**Repository Name**: `focusflow`  
**GitLab URL**: `gitlab.com/[your-org]/focusflow`  
**Version**: 1.0.0  
**Last Updated**: September 2025

FocusFlow is a comprehensive ERP platform designed to bridge the gap between basic contact management and enterprise-level business software for photographers. Built on modern microservices architecture addressing the critical pain point that 60-80% of photographer time is spent on administrative tasks.

## Technology Stack (Updated September 2025)

### Core Technologies

**Backend Services:**

- **CMS/API**: Strapi v5.23.1 (Document Service API)
- **Payment Service**: Fastify v5.6.x (45,743 req/sec performance)
- **Frontend**: Next.js 15.5.4 with React 19 and Turbopack
- **UI Components**: ShadCN v4 with Tailwind CSS
- **Database**: PostgreSQL 17.6 with row-level security
- **Caching**: Redis 8.0 (87% faster commands, 2x throughput)
- **Runtime**: Node.js 22 LTS (recommended through April 2027)
- **Image Processing**: AWS S3 + Lambda functions
- **Queue System**: BullMQ 5.58.9 with Redis backend
- **Real-time**: Socket.io v4.8.1
- **Hosting**: Render.com with Blueprint orchestration
- **Monitoring**: OpenTelemetry SDK 2.0

### Version Requirements

- **Node.js**: 22.x LTS (minimum 20.x)
- **npm**: 10.x
- **TypeScript**: 5.5+
- **Docker**: 28.3.3
- **Docker Compose**: 2.39.4

---

# PHASE 1: PROJECT INITIALIZATION (Week 1)

## Environment Setup Checklist

### Development Environment

- [ ] Install Node.js 22 LTS
  - [ ] Download from nodejs.org/en/download
  - [ ] Verify installation: `node --version` (should show v22.x.x)
  - [ ] Verify npm: `npm --version` (should show 10.x.x)
- [ ] Install pnpm globally: `npm install -g pnpm@9`
- [ ] Install Docker Desktop 28.3.3
  - [ ] Enable BuildKit in Docker settings
  - [ ] Configure 4GB+ memory allocation
  - [ ] Test installation: `docker --version && docker compose version`
- [ ] Install PostgreSQL 17.6 locally
  - [ ] Download from postgresql.org/download
  - [ ] Create development database: `createdb focusflow_dev`
  - [ ] Create test database: `createdb focusflow_test`
- [ ] Install Redis 8.0
  - [ ] Download from redis.io/download
  - [ ] Start Redis server: `redis-server`
  - [ ] Test connection: `redis-cli ping` (should return PONG)
- [ ] Install VS Code with extensions
  - [ ] ESLint extension
  - [ ] Prettier extension
  - [ ] TypeScript extension
  - [ ] Docker extension
  - [ ] GitLens extension
  - [ ] Thunder Client or Postman

### Project Repository Setup

- [ ] Create GitLab repository
  - [ ] Initialize with README
  - [ ] Add .gitignore for Node.js
  - [ ] Configure branch protection for main branch
  - [ ] Set up merge request templates
- [ ] Clone repository locally
  ```bash
  git clone git@gitlab.com:[your-org]/focusflow.git
  cd focusflow
  ```
- [ ] Initialize monorepo structure
  ```bash
  mkdir -p services/{cms,payments,web,image-processor,notifications}
  mkdir -p packages/{shared,types,utils,ui}
  mkdir -p infrastructure/{docker,k8s,terraform}
  mkdir -p docs/{api,architecture,deployment}
  ```
- [ ] Create root package.json
  ```json
  {
    "name": "focusflow",
    "version": "1.0.0",
    "private": true,
    "workspaces": ["services/*", "packages/*"],
    "scripts": {
      "dev": "pnpm run --parallel dev",
      "build": "pnpm run --recursive build",
      "test": "pnpm run --recursive test",
      "lint": "pnpm run --recursive lint"
    },
    "engines": {
      "node": ">=20.0.0",
      "npm": ">=10.0.0"
    }
  }
  ```
- [ ] Initialize pnpm workspace
  ```yaml
  # pnpm-workspace.yaml
  packages:
    - 'services/*'
    - 'packages/*'
  ```
- [ ] Create .nvmrc file with `22`
- [ ] Create .env.example template
  ```env
  NODE_ENV=development
  DATABASE_URL=postgresql://user:password@localhost:5432/focusflow_dev
  REDIS_URL=redis://localhost:6379
  JWT_SECRET=your-jwt-secret-here
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  AWS_ACCESS_KEY_ID=
  AWS_SECRET_ACCESS_KEY=
  S3_BUCKET=focusflow-images-dev
  ```

### CI/CD Pipeline Setup

- [ ] Create .gitlab-ci.yml

  ```yaml
  stages:
    - test
    - build
    - deploy

  variables:
    DOCKER_DRIVER: overlay2
    NODE_VERSION: '22'

  test:
    stage: test
    image: node:22-alpine
    script:
      - npm install -g pnpm
      - pnpm install
      - pnpm run test:ci
      - pnpm run lint
    coverage: '/Lines\s*:\s*([0-9.]+)%/'
  ```

- [ ] Configure GitLab CI/CD variables
  - [ ] Add RENDER_API_KEY
  - [ ] Add DOCKER_REGISTRY credentials
  - [ ] Add AWS credentials
  - [ ] Add Stripe keys
- [ ] Set up branch protection rules
  - [ ] Require merge requests for main
  - [ ] Require pipeline success
  - [ ] Require code review approval

---

# PHASE 2: CORE INFRASTRUCTURE (Week 2-3)

## Strapi CMS Setup (v5.23.1)

### Initialize Strapi Project

- [ ] Navigate to services/cms directory
- [ ] Create Strapi v5 project
  ```bash
  npx create-strapi@latest . --quickstart --no-run
  ```
- [ ] Configure for PostgreSQL in config/database.js
  ```javascript
  module.exports = ({ env }) => ({
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'focusflow_dev'),
        user: env('DATABASE_USERNAME', 'postgres'),
        password: env('DATABASE_PASSWORD', ''),
        ssl: env.bool('DATABASE_SSL', false),
      },
      pool: {
        min: 2,
        max: 10,
      },
    },
  });
  ```
- [ ] Update to Strapi v5.23.1 in package.json
- [ ] Configure server.js for production
  ```javascript
  module.exports = ({ env }) => ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
      keys: env.array('APP_KEYS'),
    },
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
  });
  ```

### Strapi Content Types

- [ ] Create Photographer content type
  - [ ] business_name (Text, required)
  - [ ] email (Email, required, unique)
  - [ ] subscription_tier (Enumeration: starter, professional, studio, enterprise)
  - [ ] subscription_status (Enumeration: trial, active, paused, cancelled)
  - [ ] stripe_customer_id (Text)
  - [ ] settings (JSON)
- [ ] Create Client content type
  - [ ] name (Text, required)
  - [ ] email (Email)
  - [ ] phone (Text)
  - [ ] address (JSON)
  - [ ] lifecycle_stage (Enumeration: prospect, lead, customer, repeat)
  - [ ] tags (Text array)
  - [ ] notes (Rich text)
  - [ ] photographer (Relation: many-to-one with Photographer)
- [ ] Create Session content type
  - [ ] session_type (Text)
  - [ ] session_date (DateTime)
  - [ ] duration_minutes (Number)
  - [ ] location (JSON)
  - [ ] status (Enumeration: inquiry, booked, confirmed, completed, cancelled)
  - [ ] total_amount (Decimal)
  - [ ] deposit_amount (Decimal)
  - [ ] client (Relation: many-to-one with Client)
  - [ ] photographer (Relation: many-to-one with Photographer)
- [ ] Create Gallery content type
  - [ ] name (Text, required)
  - [ ] access_code (Text, unique)
  - [ ] is_public (Boolean)
  - [ ] is_downloadable (Boolean)
  - [ ] expiry_date (DateTime)
  - [ ] view_count (Number)
  - [ ] session (Relation: one-to-one with Session)
- [ ] Create Photo content type
  - [ ] original_filename (Text)
  - [ ] s3_key (Text, required)
  - [ ] cloudfront_urls (JSON)
  - [ ] file_size_bytes (Number)
  - [ ] dimensions (JSON)
  - [ ] ai_tags (Text array)
  - [ ] gallery (Relation: many-to-one with Gallery)

### Strapi Plugins & Middleware

- [ ] Install authentication plugin
  ```bash
  npm install @strapi/plugin-users-permissions
  ```
- [ ] Configure JWT authentication
- [ ] Set up rate limiting middleware
- [ ] Configure CORS for frontend domains
- [ ] Install and configure upload provider for S3
  ```bash
  npm install @strapi/provider-upload-aws-s3
  ```
- [ ] Configure S3 upload in plugins.js
- [ ] Set up webhook endpoints for Stripe
- [ ] Create custom API routes for business logic
- [ ] Implement multi-tenant data isolation logic

### Strapi Admin Customization

- [ ] Customize admin panel branding
- [ ] Create custom admin dashboard widgets
- [ ] Set up role-based permissions
- [ ] Configure content versioning
- [ ] Enable draft/publish workflow

## Next.js 15.5.4 Frontend Setup

### Initialize Next.js Project

- [ ] Navigate to services/web directory
- [ ] Create Next.js 15 project with TypeScript
  ```bash
  npx create-next-app@15.5.4 . --typescript --tailwind --app --use-pnpm
  ```
- [ ] Update next.config.ts for production

  ```typescript
  import type { NextConfig } from 'next';

  const config: NextConfig = {
    reactStrictMode: true,
    experimental: {
      turbo: {
        resolveAlias: {
          '@': './src',
        },
      },
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: process.env.NEXT_PUBLIC_CDN_DOMAIN || '',
        },
      ],
    },
  };

  export default config;
  ```

### Frontend Architecture Setup

- [ ] Set up folder structure
  ```
  app/
    (auth)/
      login/
      register/
      forgot-password/
    (dashboard)/
      dashboard/
      clients/
      sessions/
      galleries/
      settings/
    (public)/
      gallery/[code]/
    api/
      auth/
      stripe/
  components/
    ui/
    layouts/
    features/
  lib/
    api/
    utils/
    hooks/
  providers/
  types/
  ```
- [ ] Install ShadCN UI v4
  ```bash
  npx shadcn-ui@latest init --legacy-peer-deps
  ```
- [ ] Configure ShadCN components
  - [ ] Button
  - [ ] Card
  - [ ] Dialog
  - [ ] Form
  - [ ] Input
  - [ ] Select
  - [ ] Table
  - [ ] Toast
  - [ ] Calendar
  - [ ] Charts
- [ ] Set up authentication with Clerk
  ```bash
  npm install @clerk/nextjs@latest
  ```
- [ ] Configure Clerk in layout.tsx
- [ ] Create authentication middleware
- [ ] Set up protected routes

### Frontend Core Components

- [ ] Create layout components
  - [ ] DashboardLayout
  - [ ] PublicLayout
  - [ ] AuthLayout
  - [ ] Sidebar navigation
  - [ ] Header with user menu
- [ ] Build dashboard pages
  - [ ] Overview dashboard with metrics
  - [ ] Revenue charts
  - [ ] Upcoming sessions calendar
  - [ ] Recent activity feed
- [ ] Create client management interface
  - [ ] Client list with filters
  - [ ] Client detail view
  - [ ] Add/edit client forms
  - [ ] Client lifecycle tracking
- [ ] Build session booking system
  - [ ] Session calendar view
  - [ ] Booking form
  - [ ] Session detail page
  - [ ] Contract management
- [ ] Implement gallery system
  - [ ] Gallery creation wizard
  - [ ] Photo upload interface
  - [ ] Gallery customization options
  - [ ] Public gallery view

## Fastify Payment Service (v5.6.x)

### Initialize Fastify Service

- [ ] Navigate to services/payments directory
- [ ] Initialize Node.js project
  ```bash
  npm init -y
  npm install fastify@5.6 @fastify/cors @fastify/helmet @fastify/rate-limit
  npm install stripe@18 @sinclair/typebox ajv
  npm install -D @types/node typescript tsx nodemon
  ```
- [ ] Create TypeScript configuration
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true
    }
  }
  ```

### Payment Service Implementation

- [ ] Create Fastify server setup (src/app.ts)
- [ ] Implement payment routes
  - [ ] POST /payment-intents - Create payment intent
  - [ ] POST /webhook - Stripe webhook handler
  - [ ] GET /payments/:id - Get payment details
  - [ ] GET /payments/session/:sessionId - Get session payments
  - [ ] POST /subscriptions - Create subscription
  - [ ] PUT /subscriptions/:id - Update subscription
  - [ ] DELETE /subscriptions/:id - Cancel subscription
- [ ] Set up Stripe integration
  - [ ] Initialize Stripe SDK
  - [ ] Create customer profiles
  - [ ] Handle payment methods
  - [ ] Process webhooks
  - [ ] Manage subscriptions
- [ ] Implement database queries
  - [ ] Payment recording
  - [ ] Transaction history
  - [ ] Revenue reporting
- [ ] Add payment validation schemas
- [ ] Create error handling middleware
- [ ] Implement idempotency for payments
- [ ] Set up payment notifications

### Payment Service Security

- [ ] Configure rate limiting per endpoint
- [ ] Implement webhook signature verification
- [ ] Set up API key authentication
- [ ] Add request validation
- [ ] Configure CORS properly
- [ ] Implement audit logging
- [ ] Set up PCI compliance measures

## Database Setup (PostgreSQL 17.6)

### Database Initialization

- [ ] Create production database
  ```sql
  CREATE DATABASE focusflow_production;
  CREATE USER focusflow_admin WITH ENCRYPTED PASSWORD 'secure_password';
  GRANT ALL PRIVILEGES ON DATABASE focusflow_production TO focusflow_admin;
  ```
- [ ] Enable required extensions
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  CREATE EXTENSION IF NOT EXISTS "pg_trgm";
  ```

### Schema Migration System

- [ ] Set up Knex.js for migrations
  ```bash
  npm install knex pg
  npx knex init
  ```
- [ ] Create initial migration files
  - [ ] 001_create_photographers_table.js
  - [ ] 002_create_clients_table.js
  - [ ] 003_create_sessions_table.js
  - [ ] 004_create_galleries_table.js
  - [ ] 005_create_photos_table.js
  - [ ] 006_create_payments_table.js
  - [ ] 007_create_contracts_table.js
  - [ ] 008_create_workflows_table.js
- [ ] Run migrations
  ```bash
  npx knex migrate:latest
  ```

### Row-Level Security Setup

- [ ] Enable RLS on all tables
- [ ] Create security policies for multi-tenancy
- [ ] Set up photographer isolation
- [ ] Configure cross-tenant restrictions
- [ ] Test security policies
- [ ] Create database roles
- [ ] Set up connection pooling with PgBouncer

### Database Performance Optimization

- [ ] Create appropriate indexes
  - [ ] Foreign key indexes
  - [ ] Search field indexes
  - [ ] Composite indexes for common queries
  - [ ] GIN indexes for array/JSON fields
- [ ] Set up database backups
  - [ ] Daily automated backups
  - [ ] Point-in-time recovery setup
  - [ ] Backup testing procedures
- [ ] Configure monitoring
  - [ ] Query performance monitoring
  - [ ] Connection pool monitoring
  - [ ] Disk usage alerts

## Redis 8.0 & BullMQ Setup

### Redis Configuration

- [ ] Install Redis 8.0
- [ ] Configure redis.conf
  ```conf
  maxmemory 2gb
  maxmemory-policy allkeys-lru
  save 900 1
  save 300 10
  save 60 10000
  ```
- [ ] Set up Redis persistence
- [ ] Configure Redis Sentinel for HA
- [ ] Set up Redis authentication

### BullMQ Implementation

- [ ] Install BullMQ 5.58.9
  ```bash
  npm install bullmq ioredis
  ```
- [ ] Create queue definitions
  - [ ] Image processing queue
  - [ ] Email notification queue
  - [ ] Webhook processing queue
  - [ ] Report generation queue
- [ ] Implement job processors
  - [ ] Image resize processor
  - [ ] Watermark processor
  - [ ] Email sender processor
  - [ ] PDF generator processor
- [ ] Set up Bull Board for monitoring
  ```bash
  npm install @bull-board/express @bull-board/api
  ```
- [ ] Configure job retry logic
- [ ] Implement job scheduling
- [ ] Set up job cleanup policies

---

# PHASE 3: MICROSERVICES IMPLEMENTATION (Week 4-5)

## Image Processing Service

### Lambda Function Setup

- [ ] Create image-processor service directory
- [ ] Initialize AWS SAM application
  ```bash
  sam init --runtime nodejs22.x --name image-processor
  ```
- [ ] Install Sharp and AWS SDK
  ```bash
  npm install sharp @aws-sdk/client-s3 @aws-sdk/client-lambda
  ```
- [ ] Create image processing handler
- [ ] Implement resize functionality
- [ ] Add watermark capability
- [ ] Create thumbnail generation
- [ ] Implement EXIF data extraction
- [ ] Add AI tagging integration

### S3 Integration

- [ ] Create S3 buckets
  - [ ] Raw uploads bucket
  - [ ] Processed images bucket
  - [ ] Backup bucket
- [ ] Configure bucket policies
- [ ] Set up lifecycle rules
- [ ] Configure CloudFront distribution
- [ ] Implement signed URLs
- [ ] Set up origin access control

### Image Processing Pipeline

- [ ] Create S3 event triggers
- [ ] Implement processing workflow
  - [ ] Receive S3 upload event
  - [ ] Download original image
  - [ ] Generate multiple sizes
  - [ ] Apply watermarks if needed
  - [ ] Upload to processed bucket
  - [ ] Update database with URLs
  - [ ] Queue CDN cache warming
- [ ] Set up error handling
- [ ] Implement retry logic
- [ ] Add processing metrics

## Notification Service

### Email Service Setup

- [ ] Create notification service
- [ ] Install email dependencies
  ```bash
  npm install @sendgrid/mail handlebars
  ```
- [ ] Configure SendGrid API
- [ ] Create email templates
  - [ ] Welcome email
  - [ ] Booking confirmation
  - [ ] Payment receipt
  - [ ] Gallery ready
  - [ ] Contract signature request
  - [ ] Password reset

### Notification Workflows

- [ ] Implement notification triggers
  - [ ] New client registration
  - [ ] Session booking
  - [ ] Payment received
  - [ ] Gallery published
  - [ ] Contract signed
- [ ] Create notification preferences
- [ ] Implement unsubscribe functionality
- [ ] Add email tracking
- [ ] Set up bounce handling

### SMS Integration (Optional)

- [ ] Configure Twilio integration
- [ ] Create SMS templates
- [ ] Implement SMS notifications
- [ ] Set up opt-in/opt-out

## Real-time Features (Socket.io)

### WebSocket Server Setup

- [ ] Install Socket.io dependencies
  ```bash
  npm install socket.io @socket.io/admin-ui
  ```
- [ ] Create Socket.io server
- [ ] Configure Fastify integration
- [ ] Set up Redis adapter for scaling
- [ ] Implement authentication

### Real-time Features

- [ ] Live gallery updates
  - [ ] Photo upload progress
  - [ ] New photo notifications
  - [ ] Selection updates
- [ ] Dashboard live metrics
  - [ ] Revenue updates
  - [ ] Booking notifications
  - [ ] Client activity
- [ ] Collaborative features
  - [ ] Multi-user editing
  - [ ] Live comments
  - [ ] Activity presence

---

# PHASE 4: INTEGRATIONS & FEATURES (Week 6-7)

## Third-Party Integrations

### Calendar Integration

- [ ] Google Calendar API setup
  - [ ] OAuth2 configuration
  - [ ] Calendar sync implementation
  - [ ] Event creation/updates
  - [ ] Availability checking
- [ ] Calendly webhook integration
- [ ] iCal feed generation
- [ ] Timezone handling

### Accounting Integration

- [ ] QuickBooks API integration
  - [ ] OAuth setup
  - [ ] Invoice sync
  - [ ] Payment recording
  - [ ] Tax reporting
- [ ] Xero integration (optional)
- [ ] CSV export functionality

### Social Media Integration

- [ ] Instagram Basic Display API
  - [ ] Portfolio sync
  - [ ] Gallery sharing
- [ ] Facebook pixel integration
- [ ] Pinterest Rich Pins

### Print Fulfillment

- [ ] Print service API integration
  - [ ] Product catalog sync
  - [ ] Order processing
  - [ ] Shipping tracking
- [ ] Print pricing calculator
- [ ] Markup configuration

## Advanced Features

### AI/ML Capabilities

- [ ] Image auto-tagging
  - [ ] AWS Rekognition integration
  - [ ] Custom model training
  - [ ] Face detection/grouping
- [ ] Smart pricing suggestions
- [ ] Client sentiment analysis
- [ ] Automated image culling

### Marketing Automation

- [ ] Email campaign builder
- [ ] Automated follow-ups
- [ ] Lead scoring system
- [ ] Referral program
- [ ] Review request automation
- [ ] Social proof widgets

### Analytics & Reporting

- [ ] Revenue analytics
  - [ ] Monthly/yearly comparisons
  - [ ] Service profitability
  - [ ] Client lifetime value
- [ ] Gallery analytics
  - [ ] View tracking
  - [ ] Download metrics
  - [ ] Engagement heatmaps
- [ ] Marketing ROI tracking
- [ ] Custom report builder

### Contract Management

- [ ] Template builder
- [ ] Variable substitution
- [ ] E-signature integration
- [ ] PDF generation
- [ ] Version tracking
- [ ] Legal compliance

---

# PHASE 5: TESTING & QUALITY ASSURANCE (Week 8)

## Testing Infrastructure

### Unit Testing

- [ ] Set up Jest for all services
  ```bash
  npm install -D jest @types/jest ts-jest
  ```
- [ ] Configure test coverage reporting
- [ ] Write unit tests for:
  - [ ] API endpoints (min 80% coverage)
  - [ ] Business logic functions
  - [ ] Database queries
  - [ ] Utility functions
  - [ ] React components
- [ ] Set up test data factories
- [ ] Mock external services

### Integration Testing

- [ ] Set up Supertest for API testing
- [ ] Create integration test suites
  - [ ] Authentication flows
  - [ ] Payment processing
  - [ ] File upload workflows
  - [ ] Gallery access
- [ ] Database transaction testing
- [ ] Redis queue testing

### E2E Testing

- [ ] Set up Playwright
  ```bash
  npm install -D @playwright/test
  ```
- [ ] Create E2E test scenarios
  - [ ] User registration
  - [ ] Client booking flow
  - [ ] Payment processing
  - [ ] Gallery delivery
  - [ ] Admin workflows
- [ ] Cross-browser testing
- [ ] Mobile responsive testing

### Performance Testing

- [ ] Set up k6 for load testing
- [ ] Create performance test scenarios
  - [ ] API endpoint load tests
  - [ ] Database query performance
  - [ ] Image processing throughput
  - [ ] Concurrent user testing
- [ ] Establish performance baselines
- [ ] Document performance targets

## Security Hardening

### Security Audit

- [ ] Run npm audit and fix vulnerabilities
- [ ] OWASP dependency check
- [ ] Code security scanning with Snyk
- [ ] Secret scanning in repository
- [ ] SSL/TLS configuration audit

### Security Implementation

- [ ] Implement CSP headers
- [ ] Set up rate limiting
- [ ] Configure WAF rules
- [ ] Implement DDoS protection
- [ ] Set up intrusion detection
- [ ] Configure backup encryption
- [ ] Implement audit logging
- [ ] Set up security monitoring

### Compliance

- [ ] GDPR compliance audit
- [ ] PCI DSS compliance for payments
- [ ] Data retention policies
- [ ] Privacy policy implementation
- [ ] Terms of service
- [ ] Cookie consent management

---

# PHASE 6: DEPLOYMENT & DEVOPS (Week 9)

## Docker Configuration

### Dockerfiles Creation

- [ ] Create multi-stage Dockerfile for CMS

  ```dockerfile
  FROM node:22-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --only=production
  COPY . .
  RUN npm run build

  FROM node:22-alpine
  RUN apk add --no-cache dumb-init
  WORKDIR /app
  COPY --from=builder /app .
  USER node
  EXPOSE 1337
  ENTRYPOINT ["dumb-init", "--"]
  CMD ["npm", "start"]
  ```

- [ ] Create Dockerfile for payment service
- [ ] Create Dockerfile for web frontend
- [ ] Create Dockerfile for notification service
- [ ] Optimize Docker images for size
- [ ] Set up Docker health checks

### Docker Compose Setup

- [ ] Create docker-compose.yml for local development
- [ ] Configure service networking
- [ ] Set up volume mounts
- [ ] Configure environment variables
- [ ] Create docker-compose.override.yml
- [ ] Set up hot reloading for development

## Render.com Deployment

### Render Blueprint Configuration

- [ ] Create render.yaml
  ```yaml
  services:
    - type: web
      name: focusflow-cms
      runtime: docker
      plan: standard
      dockerfilePath: ./services/cms/Dockerfile
      envVars:
        - key: NODE_ENV
          value: production
        - key: DATABASE_URL
          fromDatabase:
            name: focusflow-db
            property: connectionString
  ```
- [ ] Configure all services in Blueprint
- [ ] Set up environment groups
- [ ] Configure auto-deploy from GitLab
- [ ] Set up preview environments
- [ ] Configure custom domains

### Database & Redis Setup

- [ ] Provision PostgreSQL 17 on Render
- [ ] Configure connection pooling
- [ ] Set up read replicas
- [ ] Provision Redis instance
- [ ] Configure Redis persistence
- [ ] Set up backup schedules

### CDN & Static Assets

- [ ] Configure CloudFront distribution
- [ ] Set up origin access control
- [ ] Configure cache behaviors
- [ ] Implement cache invalidation
- [ ] Set up image optimization
- [ ] Configure HTTPS certificates

## Monitoring & Observability

### OpenTelemetry Setup

- [ ] Install OpenTelemetry SDK 2.0
  ```bash
  npm install @opentelemetry/api @opentelemetry/sdk-node
  npm install @opentelemetry/auto-instrumentations-node
  ```
- [ ] Configure tracing
- [ ] Set up metrics collection
- [ ] Implement custom spans
- [ ] Configure exporters

### Monitoring Services

- [ ] Set up Datadog or New Relic
- [ ] Configure application monitoring
- [ ] Set up infrastructure monitoring
- [ ] Create custom dashboards
- [ ] Configure alerting rules
- [ ] Set up log aggregation

### Error Tracking

- [ ] Integrate Sentry
  ```bash
  npm install @sentry/node @sentry/nextjs
  ```
- [ ] Configure error boundaries
- [ ] Set up source maps
- [ ] Configure release tracking
- [ ] Set up error alerts

---

# PHASE 7: PRODUCTION READINESS (Week 10)

## Performance Optimization

### Frontend Optimization

- [ ] Implement code splitting
- [ ] Configure Turbopack for production
- [ ] Optimize bundle sizes
- [ ] Implement lazy loading
- [ ] Configure image optimization
- [ ] Set up service workers
- [ ] Implement PWA features
- [ ] Configure prefetching strategies

### Backend Optimization

- [ ] Database query optimization
- [ ] Implement query caching
- [ ] Configure connection pooling
- [ ] Optimize N+1 queries
- [ ] Implement pagination
- [ ] Set up request caching
- [ ] Configure CDN caching
- [ ] Optimize API response sizes

### Infrastructure Optimization

- [ ] Configure auto-scaling rules
- [ ] Optimize Docker images
- [ ] Set up geographic distribution
- [ ] Configure edge caching
- [ ] Implement database indexing
- [ ] Optimize Redis memory usage

## Documentation

### Technical Documentation

- [ ] API documentation with OpenAPI/Swagger
- [ ] Database schema documentation
- [ ] Architecture diagrams
- [ ] Deployment procedures
- [ ] Troubleshooting guides
- [ ] Performance benchmarks

### User Documentation

- [ ] User onboarding guide
- [ ] Feature documentation
- [ ] Video tutorials
- [ ] FAQ section
- [ ] API client documentation
- [ ] Webhook documentation

### Developer Documentation

- [ ] Contributing guidelines
- [ ] Code style guide
- [ ] Git workflow documentation
- [ ] Local development setup
- [ ] Testing procedures
- [ ] Release process

## Launch Preparation

### Pre-launch Checklist

- [ ] Final security audit
- [ ] Performance benchmarking
- [ ] Load testing at scale
- [ ] Disaster recovery testing
- [ ] Rollback procedures
- [ ] Support ticket system
- [ ] Status page setup

### Beta Testing

- [ ] Recruit 10-20 beta photographers
- [ ] Create feedback collection system
- [ ] Monitor beta usage patterns
- [ ] Fix critical issues
- [ ] Implement feature requests
- [ ] Gather testimonials

### Marketing Launch

- [ ] Create landing page
- [ ] Set up analytics tracking
- [ ] Configure SEO metadata
- [ ] Prepare launch email campaign
- [ ] Social media announcement
- [ ] Press release preparation

---

# PHASE 8: POST-LAUNCH & SCALING (Week 11-12+)

## Continuous Improvement

### Feature Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced AI features
- [ ] Multi-language support
- [ ] White-label capabilities
- [ ] Advanced workflow automation
- [ ] Enterprise SSO integration

### Performance Monitoring

- [ ] Weekly performance reviews
- [ ] Monthly cost optimization
- [ ] Quarterly security audits
- [ ] User feedback analysis
- [ ] Competitive analysis
- [ ] Technology stack updates

### Scaling Strategy

- [ ] Implement horizontal scaling
- [ ] Database sharding planning
- [ ] Multi-region deployment
- [ ] Edge computing implementation
- [ ] Microservices decomposition
- [ ] Event-driven architecture

## Business Operations

### Customer Success

- [ ] Onboarding automation
- [ ] Customer health scoring
- [ ] Churn prediction models
- [ ] Upsell opportunity tracking
- [ ] Customer satisfaction surveys
- [ ] Support documentation expansion

### Revenue Optimization

- [ ] A/B testing framework
- [ ] Pricing optimization
- [ ] Feature usage analytics
- [ ] Conversion funnel optimization
- [ ] Referral program launch
- [ ] Partnership development

---

# CRITICAL MIGRATION NOTES

## Immediate Actions Required

### Node.js 18 to 22 Migration (URGENT - Before April 2025)

- [ ] Update all Docker base images to node:22-alpine
- [ ] Update .nvmrc files to version 22
- [ ] Update package.json engines to require Node.js >=20
- [ ] Test all services with Node.js 22
- [ ] Update CI/CD pipelines to use Node.js 22
- [ ] Update Lambda functions to nodejs22.x runtime

### Breaking Changes to Address

#### Strapi v5 Migration

- [ ] Migrate from Entity Service to Document Service API
- [ ] Update all API calls to use flattened response structure
- [ ] Remove nested data.attributes references
- [ ] Update frontend API client for new response format
- [ ] Test all CRUD operations with new API

#### Next.js 15 Migration

- [ ] Convert all request APIs to async
  - [ ] Add await to cookies()
  - [ ] Add await to headers()
  - [ ] Add await to params
- [ ] Update to next.config.ts format
- [ ] Test Turbopack in production
- [ ] Update image optimization configuration

#### Database Updates

- [ ] Plan PostgreSQL 17.6 upgrade
- [ ] Test row-level security policies
- [ ] Optimize for new write throughput capabilities
- [ ] Update connection pooling configuration

---

# SUCCESS METRICS

## Technical KPIs

- [ ] API response time < 200ms (P95)
- [ ] Page load speed < 2 seconds
- [ ] Image processing < 10 seconds
- [ ] System uptime > 99.9%
- [ ] Error rate < 0.1%
- [ ] Test coverage > 80%

## Business KPIs

- [ ] Customer acquisition cost < $150
- [ ] Monthly recurring revenue growth > 20%
- [ ] Churn rate < 5% monthly
- [ ] Net Promoter Score > 50
- [ ] Feature adoption rate > 70%
- [ ] Support ticket resolution < 24 hours

## User Engagement Metrics

- [ ] Daily active users > 60%
- [ ] Average sessions per month > 5
- [ ] Gallery completion rate > 80%
- [ ] Client portal adoption > 75%
- [ ] Mobile usage > 40%
- [ ] API usage growth > 30% monthly

---

# BUDGET ALLOCATION

## Development Costs (12 months)

- Development team (10 developers): $1,200,000
- Design team (3 designers): $300,000
- DevOps team (2 engineers): $240,000
- Project management: $150,000
- **Total HR**: $1,890,000

## Infrastructure Costs (Annual)

- Render.com hosting: $24,000
- AWS services (S3, CloudFront, Lambda): $36,000
- Database hosting: $12,000
- Redis hosting: $6,000
- Domain & SSL: $500
- Third-party APIs: $10,000
- **Total Infrastructure**: $88,500

## Tools & Services (Annual)

- Monitoring (Datadog/New Relic): $12,000
- Error tracking (Sentry): $3,600
- Email service (SendGrid): $6,000
- SMS service (Twilio): $2,400
- Analytics tools: $4,800
- **Total Services**: $28,800

## Marketing & Launch

- Beta testing incentives: $10,000
- Launch campaign: $50,000
- Content creation: $20,000
- **Total Marketing**: $80,000

**TOTAL PROJECT BUDGET**: ~$2,087,300

---

# RISK MITIGATION

## Technical Risks

- **Risk**: Strapi v5 stability issues
  - **Mitigation**: Maintain v4 fallback branch, extensive testing
- **Risk**: Performance degradation at scale
  - **Mitigation**: Load testing, caching strategy, CDN implementation
- **Risk**: Security vulnerabilities
  - **Mitigation**: Regular audits, dependency updates, WAF implementation

## Business Risks

- **Risk**: Low adoption rate
  - **Mitigation**: Beta program, iterative development, user feedback loops
- **Risk**: Payment processing issues
  - **Mitigation**: Multiple payment providers, extensive testing, fallback systems
- **Risk**: Data loss
  - **Mitigation**: Automated backups, disaster recovery plan, data replication

## Operational Risks

- **Risk**: Team scaling challenges
  - **Mitigation**: Comprehensive documentation, onboarding process, knowledge sharing
- **Risk**: Third-party API changes
  - **Mitigation**: API versioning, abstraction layers, fallback providers
- **Risk**: Compliance issues
  - **Mitigation**: Legal review, compliance audits, data governance policies

---

# CONTACT & SUPPORT

**Project Lead**: [Your Name]  
**Technical Lead**: [Tech Lead Name]  
**Repository**: gitlab.com/[your-org]/focusflow  
**Documentation**: docs.focusflow.com  
**Support**: support@focusflow.com

**Emergency Contacts**:

- On-call Engineer: [Phone]
- Database Admin: [Phone]
- Security Team: [Email]

---

_This document represents a living guide and will be updated as the project evolves. Last updated: September 2025_

### Complete Database Schema (PostgreSQL 17.6)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Photographers (Tenants)
CREATE TABLE photographers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'starter',
    subscription_status VARCHAR(50) DEFAULT 'trial',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE photographers ENABLE ROW LEVEL SECURITY;

-- Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address JSONB,
    tags TEXT[],
    lifecycle_stage VARCHAR(50) DEFAULT 'prospect',
    total_lifetime_value DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_client_per_photographer UNIQUE(photographer_id, email)
);

CREATE INDEX idx_clients_photographer ON clients(photographer_id);
CREATE INDEX idx_clients_lifecycle ON clients(photographer_id, lifecycle_stage);
CREATE INDEX idx_clients_tags ON clients USING GIN(tags);

-- Sessions (Bookings)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    session_type VARCHAR(100) NOT NULL,
    session_date TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    location JSONB,
    status VARCHAR(50) DEFAULT 'inquiry',
    package_details JSONB,
    total_amount DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),
    deposit_paid BOOLEAN DEFAULT FALSE,
    balance_paid BOOLEAN DEFAULT FALSE,
    contract_signed BOOLEAN DEFAULT FALSE,
    contract_signed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_photographer ON sessions(photographer_id);
CREATE INDEX idx_sessions_date ON sessions(photographer_id, session_date);
CREATE INDEX idx_sessions_status ON sessions(photographer_id, status);

-- Galleries
CREATE TABLE galleries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    access_code VARCHAR(20) UNIQUE,
    is_public BOOLEAN DEFAULT FALSE,
    is_downloadable BOOLEAN DEFAULT TRUE,
    download_limit INTEGER,
    downloads_used INTEGER DEFAULT 0,
    expiry_date TIMESTAMP WITH TIME ZONE,
    watermark_enabled BOOLEAN DEFAULT TRUE,
    theme_settings JSONB DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_galleries_session ON galleries(session_id);
CREATE INDEX idx_galleries_access_code ON galleries(access_code) WHERE access_code IS NOT NULL;
CREATE INDEX idx_galleries_expiry ON galleries(expiry_date) WHERE expiry_date IS NOT NULL;

-- Photos
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
    photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
    original_filename VARCHAR(255),
    s3_key VARCHAR(500) NOT NULL,
    cloudfront_urls JSONB, -- {thumbnail, preview, watermarked, full}
    file_size_bytes BIGINT,
    width INTEGER,
    height INTEGER,
    metadata JSONB, -- EXIF data
    ai_tags TEXT[],
    client_selected BOOLEAN DEFAULT FALSE,
    client_favorited BOOLEAN DEFAULT FALSE,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_photos_gallery ON photos(gallery_id);
CREATE INDEX idx_photos_selected ON photos(gallery_id, client_selected);
CREATE INDEX idx_photos_order ON photos(gallery_id, display_order);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_invoice_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    type VARCHAR(50), -- deposit, final_payment, subscription
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_photographer ON payments(photographer_id);
CREATE INDEX idx_payments_session ON payments(session_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Contracts
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    template_id UUID,
    content TEXT NOT NULL,
    variables JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    signed_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    signature_data TEXT,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contracts_photographer ON contracts(photographer_id);
CREATE INDEX idx_contracts_session ON contracts(session_id);
CREATE INDEX idx_contracts_status ON contracts(status);

-- Workflow Automations
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50), -- booking_created, payment_received, etc.
    conditions JSONB,
    actions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workflows_photographer ON workflows(photographer_id);
CREATE INDEX idx_workflows_active ON workflows(photographer_id, is_active);

-- Row Level Security Policies
CREATE POLICY photographer_isolation ON photographers
    FOR ALL USING (id = current_setting('app.current_photographer_id')::UUID);

CREATE POLICY client_isolation ON clients
    FOR ALL USING (photographer_id = current_setting('app.current_photographer_id')::UUID);

CREATE POLICY session_isolation ON sessions
    FOR ALL USING (photographer_id = current_setting('app.current_photographer_id')::UUID);

CREATE POLICY gallery_isolation ON galleries
    FOR ALL USING (photographer_id = current_setting('app.current_photographer_id')::UUID);

CREATE POLICY photo_isolation ON photos
    FOR ALL USING (photographer_id = current_setting('app.current_photographer_id')::UUID);

-- Performance indexes
CREATE INDEX idx_photographers_email ON photographers(email);
CREATE INDEX idx_photographers_stripe_customer ON photographers(stripe_customer_id);
CREATE INDEX idx_sessions_upcoming ON sessions(session_date)
    WHERE status IN ('confirmed', 'preparing') AND session_date > NOW();
```

### Complete Fastify Payment Service Implementation

```javascript
// services/payments/src/app.js
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { Type } from '@sinclair/typebox';
import Stripe from 'stripe';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
    },
  },
  ajv: {
    customOptions: {
      removeAdditional: 'all',
      coerceTypes: true,
      useDefaults: true,
    },
  },
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Register plugins
await fastify.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
});

await fastify.register(helmet);
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Schema definitions using TypeBox
const CreatePaymentIntentSchema = {
  body: Type.Object({
    amount: Type.Number({ minimum: 50 }), // $0.50 minimum
    currency: Type.String({ default: 'usd' }),
    photographerId: Type.String({ format: 'uuid' }),
    sessionId: Type.String({ format: 'uuid' }),
    type: Type.Union([
      Type.Literal('deposit'),
      Type.Literal('final_payment'),
      Type.Literal('full_payment'),
    ]),
    metadata: Type.Optional(Type.Object({})),
  }),
  response: {
    200: Type.Object({
      clientSecret: Type.String(),
      paymentIntentId: Type.String(),
      amount: Type.Number(),
      status: Type.String(),
    }),
  },
};

// Routes
fastify.post(
  '/payment-intents',
  {
    schema: CreatePaymentIntentSchema,
    preHandler: authenticate,
  },
  async (request, reply) => {
    const { amount, currency, photographerId, sessionId, type, metadata } =
      request.body;

    try {
      // Create Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          photographerId,
          sessionId,
          type,
          ...metadata,
        },
      });

      // Store in database
      await fastify.pg.query(
        `INSERT INTO payments (
        stripe_payment_intent_id, photographer_id, session_id, 
        amount, currency, type, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          paymentIntent.id,
          photographerId,
          sessionId,
          amount,
          currency,
          type,
          'pending',
        ]
      );

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        status: paymentIntent.status,
      };
    } catch (error) {
      fastify.log.error(error);
      throw new Error('Payment processing failed');
    }
  }
);

// Stripe Webhook Handler
fastify.post(
  '/webhook',
  {
    config: {
      rawBody: true, // Required for Stripe signature verification
    },
  },
  async (request, reply) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        sig,
        endpointSecret
      );
    } catch (err) {
      fastify.log.error(
        `Webhook signature verification failed: ${err.message}`
      );
      return reply.code(400).send();
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePayment(event.data.object);
        break;
      default:
        fastify.log.info(`Unhandled event type ${event.type}`);
    }

    reply.send({ received: true });
  }
);

// Health check
fastify.get('/health', async () => ({
  status: 'healthy',
  timestamp: new Date().toISOString(),
}));

export default fastify;
```

### Docker Configuration for Payment Service

```dockerfile
# services/payments/Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
```

### Complete Image Processing Lambda Function

```javascript
// services/image-processor/src/handlers/processImage.js
import AWS from 'aws-sdk';
import sharp from 'sharp';
import { Queue } from 'bullmq';

const s3 = new AWS.S3();
const imageQueue = new Queue('image-processing', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

export const handler = async (event) => {
  // Triggered by S3 upload event
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  );

  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    // Get the original image
    const originalImage = await s3.getObject(params).promise();

    // Parse metadata from S3 object tags
    const tagging = await s3.getObjectTagging(params).promise();
    const tags = Object.fromEntries(
      tagging.TagSet.map((tag) => [tag.Key, tag.Value])
    );

    const galleryId = tags.galleryId;
    const photoId = tags.photoId;

    // Generate multiple versions
    const versions = [
      { name: 'thumbnail', width: 400, quality: 80 },
      { name: 'preview', width: 1600, quality: 85 },
      { name: 'watermarked', width: 2400, quality: 90, watermark: true },
      { name: 'full', width: 4000, quality: 95 },
    ];

    const processedVersions = await Promise.all(
      versions.map(async (version) => {
        let processedImage = sharp(originalImage.Body)
          .resize(version.width, null, {
            withoutEnlargement: true,
            fit: 'inside',
          })
          .jpeg({ quality: version.quality, progressive: true });

        // Add watermark if needed
        if (version.watermark) {
          const watermark = await getWatermark(tags.photographerId);
          processedImage = processedImage.composite([
            {
              input: watermark,
              gravity: 'southeast',
              blend: 'over',
            },
          ]);
        }

        const buffer = await processedImage.toBuffer();

        // Upload to S3
        const versionKey = `galleries/${galleryId}/${photoId}/${version.name}.jpg`;
        await s3
          .putObject({
            Bucket: process.env.PROCESSED_BUCKET,
            Key: versionKey,
            Body: buffer,
            ContentType: 'image/jpeg',
            CacheControl: 'max-age=31536000',
            Metadata: {
              originalKey: key,
              version: version.name,
              galleryId,
              photoId,
            },
          })
          .promise();

        return {
          version: version.name,
          url: `https://${process.env.CDN_DOMAIN}/${versionKey}`,
          size: buffer.length,
        };
      })
    );

    // Update database with processed URLs
    await imageQueue.add('update-photo-urls', {
      photoId,
      galleryId,
      versions: processedVersions,
    });

    // Schedule archival for cold storage
    await imageQueue.add(
      'schedule-archival',
      {
        key,
        photoId,
        scheduleDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      {
        delay: 30 * 24 * 60 * 60 * 1000,
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Image processed successfully',
        versions: processedVersions,
      }),
    };
  } catch (error) {
    console.error('Error processing image:', error);

    // Add to retry queue
    await imageQueue.add('retry-processing', {
      bucket,
      key,
      error: error.message,
      attempt: 1,
    });

    throw error;
  }
};
```

### Complete Render.yaml Blueprint Configuration

```yaml
# render.yaml - Render Blueprint Configuration
services:
  # 1. Main Strapi CMS Service
  - type: web
    name: focusflow-cms
    runtime: docker
    dockerfilePath: ./services/cms/Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: focusflow-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: focusflow-redis
          type: keyvalue
          property: connectionString
    disk:
      name: cms-uploads
      mountPath: /opt/app/public/uploads
      sizeGB: 100

  # 2. Payment Microservice (Fastify)
  - type: web
    name: focusflow-payments
    runtime: docker
    dockerfilePath: ./services/payments/Dockerfile
    envVars:
      - key: PORT
        value: 3001
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: focusflow-db
          property: connectionString
    healthCheckPath: /health

  # 3. Image Processing Service
  - type: worker
    name: focusflow-image-processor
    runtime: docker
    dockerfilePath: ./services/image-processor/Dockerfile
    envVars:
      - key: AWS_ACCESS_KEY_ID
        sync: false
      - key: AWS_SECRET_ACCESS_KEY
        sync: false
      - key: S3_BUCKET
        value: focusflow-images
      - key: REDIS_URL
        fromService:
          name: focusflow-redis
          type: keyvalue
          property: connectionString

  # 4. Next.js Frontend
  - type: web
    name: focusflow-web
    runtime: docker
    dockerfilePath: ./services/web/Dockerfile
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://focusflow-cms.onrender.com
      - key: NEXT_PUBLIC_STRIPE_KEY
        sync: false

  # 5. Notification Service
  - type: worker
    name: focusflow-notifications
    runtime: docker
    dockerfilePath: ./services/notifications/Dockerfile
    envVars:
      - key: SENDGRID_API_KEY
        sync: false
      - key: REDIS_URL
        fromService:
          name: focusflow-redis
          type: keyvalue
          property: connectionString

# Databases
databases:
  - name: focusflow-db
    plan: standard
    databaseName: focusflow_production
    user: focusflow_admin
    ipAllowList:
      - source: 0.0.0.0/0
        description: Allow all connections

  # Redis Cache
  - name: focusflow-redis
    type: keyvalue
    plan: standard
    ipAllowList:
      - source: 0.0.0.0/0
        description: Allow all connections
```

### Dashboard Components with ShadCN

```typescript
// app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { Overview } from '@/components/overview';
import { RecentSessions } from '@/components/recent-sessions';
import { getServerSession } from 'next-auth';
import { getDashboardMetrics } from '@/lib/api';

export default async function DashboardPage() {
  const session = await getServerSession();
  const metrics = await getDashboardMetrics(session.user.id);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${metrics.revenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.activeSessions}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.upcomingThisWeek} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Client Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.satisfaction}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {metrics.reviewCount} reviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gallery Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.galleryViews.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Suspense fallback={<div>Loading chart...</div>}>
                  <Overview data={metrics.chartData} />
                </Suspense>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentSessions sessions={metrics.recentSessions} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Optimized Image Component

```typescript
// components/optimized-image.tsx
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  quality?: number;
  onLoad?: () => void;
}

const cloudFrontLoader = ({ src, width, quality }: any) => {
  // Use CloudFront with on-the-fly resizing
  const params = new URLSearchParams();
  params.set('width', width.toString());
  params.set('quality', (quality || 85).toString());
  params.set('format', 'auto'); // Auto-select WebP/AVIF

  return `${process.env.NEXT_PUBLIC_CDN_URL}/${src}?${params.toString()}`;
};

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  priority = false,
  className,
  quality = 85,
  onLoad,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && <div className="absolute inset-0 animate-pulse bg-muted" />}
      <Image
        loader={cloudFrontLoader}
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        className={cn(
          'duration-700 ease-in-out',
          isLoading ? 'scale-110 blur-2xl' : 'scale-100 blur-0'
        )}
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}
```

### Security Middleware Implementation

```javascript
// shared/middleware/security.js
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';

export async function registerSecurityMiddleware(fastify) {
  // Helmet for security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.stripe.com'],
      },
    },
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    cache: 10000,
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
    skipSuccessfulRequests: false,
    skipFailedRequests: true,
  });

  // JWT authentication
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET,
    sign: {
      expiresIn: '7d',
    },
  });

  // CORS configuration
  await fastify.register(cors, {
    origin: (origin, cb) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Authentication decorator
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();

      // Set photographer context for RLS
      const { photographerId } = request.user;
      request.photographerId = photographerId;
    } catch (err) {
      reply.send(err);
    }
  });

  // Request validation
  fastify.setErrorHandler(function (error, request, reply) {
    if (error.validation) {
      reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation error',
        details: error.validation,
      });
    } else {
      reply.send(error);
    }
  });
}
```

### Pricing Tiers Implementation

```typescript
// lib/pricing.ts
export const PRICING_TIERS = {
  starter: {
    name: 'Starter',
    price: 49,
    currency: 'USD',
    interval: 'month',
    features: {
      photographers: 1,
      storage: 100, // GB
      monthlyGalleryVisitors: 500,
      transactionFee: 0.03, // 3%
      customDomain: false,
      whiteLabel: false,
      apiAccess: false,
      prioritySupport: false,
    },
    stripeProductId: 'prod_starter',
    stripePriceId: 'price_starter_monthly',
  },
  professional: {
    name: 'Professional',
    price: 149,
    currency: 'USD',
    interval: 'month',
    features: {
      photographers: 3,
      storage: 500,
      monthlyGalleryVisitors: 5000,
      transactionFee: 0.02, // 2%
      customDomain: true,
      whiteLabel: false,
      apiAccess: false,
      prioritySupport: true,
      workflowAutomation: true,
    },
    stripeProductId: 'prod_professional',
    stripePriceId: 'price_professional_monthly',
  },
  studio: {
    name: 'Studio',
    price: 399,
    currency: 'USD',
    interval: 'month',
    features: {
      photographers: 10,
      storage: 2000,
      monthlyGalleryVisitors: -1, // Unlimited
      transactionFee: 0.01, // 1%
      customDomain: true,
      whiteLabel: true,
      apiAccess: true,
      prioritySupport: true,
      workflowAutomation: true,
      teamManagement: true,
    },
    stripeProductId: 'prod_studio',
    stripePriceId: 'price_studio_monthly',
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // Custom pricing
    currency: 'USD',
    interval: 'month',
    features: {
      photographers: -1, // Unlimited
      storage: -1, // Unlimited
      monthlyGalleryVisitors: -1,
      transactionFee: 0.005, // 0.5%
      customDomain: true,
      whiteLabel: true,
      apiAccess: true,
      prioritySupport: true,
      workflowAutomation: true,
      teamManagement: true,
      dedicatedInfrastructure: true,
      sla: true,
      customIntegrations: true,
    },
  },
};
```

### OpenTelemetry Integration

```javascript
// shared/telemetry/index.js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const traceExporter = new OTLPTraceExporter({
  url:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    'http://localhost:4318/v1/traces',
  headers: {
    'x-honeycomb-team': process.env.HONEYCOMB_API_KEY,
  },
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]:
      process.env.SERVICE_NAME || 'focusflow',
    [SemanticResourceAttributes.SERVICE_VERSION]:
      process.env.SERVICE_VERSION || '1.0.0',
  }),
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
    exportIntervalMillis: 10000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

sdk.start();
```

### Complete GitLab CI/CD Pipeline

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: ''
  NODE_VERSION: '22'

before_script:
  - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

# Testing Stage
test:
  stage: test
  image: node:22-alpine
  script:
    - npm install -g pnpm
    - pnpm install
    - pnpm run test:ci
    - pnpm run lint
  coverage: '/Lines\s*:\s*([0-9.]+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# Build Docker Images
build:
  stage: build
  image: docker:28
  services:
    - docker:28-dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE/cms:$CI_COMMIT_SHA ./services/cms
    - docker build -t $CI_REGISTRY_IMAGE/payments:$CI_COMMIT_SHA ./services/payments
    - docker build -t $CI_REGISTRY_IMAGE/web:$CI_COMMIT_SHA ./services/web
    - docker build -t $CI_REGISTRY_IMAGE/image-processor:$CI_COMMIT_SHA ./services/image-processor
    - docker push $CI_REGISTRY_IMAGE/cms:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/payments:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/web:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE/image-processor:$CI_COMMIT_SHA
  only:
    - main
    - develop

# Deploy to Render
deploy:production:
  stage: deploy
  image: curlimages/curl:latest
  script:
    - |
      curl -X POST https://api.render.com/v1/services/$RENDER_CMS_ID/deploys \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"clearCache": false}'
    - |
      curl -X POST https://api.render.com/v1/services/$RENDER_PAYMENTS_ID/deploys \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"clearCache": false}'
  environment:
    name: production
    url: https://focusflow.com
  only:
    - main
  when: manual
```
