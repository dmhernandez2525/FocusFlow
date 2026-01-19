# Software Design Document - FocusFlow

## 1. Overview

### Project Purpose and Goals

FocusFlow is a comprehensive ERP (Enterprise Resource Planning) platform designed specifically for photographers. The platform addresses a critical pain point in the photography industry: 60-80% of photographer time is spent on administrative tasks rather than creative work.

**Primary Goals:**
- Bridge the gap between basic contact management tools and enterprise-level business software
- Automate repetitive administrative tasks (scheduling, invoicing, contracts, gallery delivery)
- Provide a unified platform for client management, session booking, payment processing, and photo delivery
- Enable photographers to focus on their creative work while the system handles business operations

### Target Users

- **Professional Photographers**: Wedding, portrait, event, and commercial photographers
- **Photography Studios**: Multi-photographer operations requiring team management
- **Freelance Photographers**: Solo practitioners needing efficient business workflows
- **Photography Agencies**: Larger operations requiring enterprise features

### Key Features

1. **Client Lifecycle Management**: Track clients from prospect to repeat customer
2. **Session Booking System**: Calendar integration, availability management, and automated reminders
3. **Gallery Management**: Secure photo delivery with client selection and download tracking
4. **Payment Processing**: Stripe integration for deposits, invoices, and subscriptions
5. **Contract Management**: Digital signatures with e-signature integration
6. **Workflow Automation**: Automated email sequences, reminders, and follow-ups
7. **Image Processing**: Cloud-based resize, watermark, and AI tagging
8. **Analytics Dashboard**: Revenue tracking, client insights, and business metrics

---

## 2. Architecture

### High-Level Architecture Diagram

```
                                    +-------------------+
                                    |   CloudFront CDN  |
                                    +--------+----------+
                                             |
                    +------------------------+------------------------+
                    |                        |                        |
           +--------v--------+      +--------v--------+      +--------v--------+
           |   Web Frontend  |      |   Strapi CMS    |      | Payment Service |
           |   (Next.js 15)  |      |   (API Layer)   |      |   (Fastify)     |
           +--------+--------+      +--------+--------+      +--------+--------+
                    |                        |                        |
                    +------------------------+------------------------+
                                             |
                              +--------------+--------------+
                              |                             |
                    +---------v---------+         +---------v---------+
                    |    PostgreSQL     |         |      Redis        |
                    |   (Primary DB)    |         |   (Cache/Queue)   |
                    +-------------------+         +---------+---------+
                                                            |
                    +---------------------------------------+
                    |                   |                   |
           +--------v--------+ +--------v--------+ +--------v--------+
           | Image Processor | | Queue Workers   | | Bull Board      |
           | (Worker)        | | (BullMQ)        | | (Monitoring)    |
           +-----------------+ +-----------------+ +-----------------+
                    |
           +--------v--------+
           |   AWS S3        |
           | (File Storage)  |
           +-----------------+
```

### Monorepo Structure

FocusFlow uses a TurboRepo-based monorepo architecture with pnpm workspaces:

```
focusflow/
├── services/                    # Microservices
│   ├── cms/                     # Strapi CMS (API layer)
│   ├── web/                     # Next.js frontend
│   ├── payments/                # Fastify payment service
│   ├── queue/                   # BullMQ queue service
│   ├── image-processor/         # Image processing worker
│   ├── bull-board/              # Queue monitoring dashboard
│   ├── notifications/           # Email/SMS service
│   └── worker/                  # Background job worker
├── packages/                    # Shared packages
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Shared utilities
├── infrastructure/              # Infrastructure configuration
│   ├── database/                # Migrations and seeds
│   ├── docker/                  # Docker configurations
│   ├── backup/                  # Backup job Docker image
│   ├── cleanup/                 # Cleanup job Docker image
│   └── reminders/               # Reminder job Docker image
├── docker-compose.yml           # Local development
├── docker-compose.prod.yml      # Production deployment
├── render.yaml                  # Render.com Blueprint
├── turbo.json                   # TurboRepo configuration
└── pnpm-workspace.yaml          # pnpm workspace config
```

### Service Descriptions

| Service | Technology | Purpose |
|---------|------------|---------|
| **web** | Next.js 15.5.4 | User-facing frontend with React 19 |
| **cms** | Strapi v5.23.1 | Headless CMS and REST API layer |
| **payments** | Fastify v5.6.x | Stripe payment processing |
| **queue** | BullMQ 5.58.x | Background job queue management |
| **image-processor** | Node.js + Sharp | Image resize/watermark/optimization |
| **bull-board** | Bull Board | Queue monitoring UI |
| **notifications** | Node.js | Email and SMS notifications |

---

## 3. Service Design

### CMS Service (Strapi)

**Purpose**: Content management and primary REST API layer

**Technology Stack**:
- Strapi v5.23.1 with Document Service API
- PostgreSQL database connection
- JWT-based authentication
- S3 upload provider

**Key Responsibilities**:
- User authentication and authorization
- CRUD operations for all business entities
- Content type management
- Multi-tenant data isolation
- Webhook endpoints for external integrations

**Content Types**:
- `Photographer`: Business profile and subscription management
- `Client`: Customer information and lifecycle tracking
- `Session`: Booking details and scheduling
- `Gallery`: Photo collection management
- `Photo`: Individual image metadata

**Configuration Files**:
- `/services/cms/config/database.ts`: PostgreSQL connection with pooling
- `/services/cms/config/server.ts`: Server and JWT configuration
- `/services/cms/config/plugins.ts`: Plugin settings (S3, auth)

### Payment Service (Fastify)

**Purpose**: High-performance payment processing with Stripe integration

**Technology Stack**:
- Fastify v5.6.x (45,743 req/sec performance)
- TypeBox for runtime validation
- Stripe SDK v18
- PostgreSQL for transaction records

**Key Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/payment-intents` | POST | Create payment intent |
| `/payment-intents/:id` | GET | Retrieve payment intent |
| `/payment-intents/:id` | PATCH | Update payment intent |
| `/payment-intents/:id/confirm` | POST | Confirm payment |
| `/payment-intents/:id/cancel` | POST | Cancel payment |
| `/payment-intents/:id/capture` | POST | Capture authorized payment |
| `/webhook` | POST | Stripe webhook handler |
| `/customers` | CRUD | Customer management |
| `/subscriptions` | CRUD | Subscription management |
| `/health` | GET | Health check endpoint |

**Key Features**:
- Idempotency key support for safe retries
- Webhook signature verification
- Rate limiting per endpoint
- Graceful shutdown handling
- Request/response logging with Pino

### Web Frontend (Next.js)

**Purpose**: User-facing application with dashboard and client portal

**Technology Stack**:
- Next.js 15.5.4 with React 19
- Turbopack for development
- ShadCN UI v4 with Tailwind CSS
- Clerk authentication

**Route Structure**:
```
app/
├── (auth)/                      # Authentication routes
│   ├── sign-in/
│   └── sign-up/
├── (dashboard)/                 # Protected dashboard routes
│   ├── dashboard/               # Main dashboard
│   ├── clients/                 # Client management
│   ├── sessions/                # Session booking
│   ├── galleries/               # Gallery management
│   └── settings/                # User settings
└── (public)/                    # Public routes
    └── gallery/[code]/          # Public gallery access
```

**Key Features**:
- Server-side rendering with React Server Components
- Optimized image loading with Next/Image
- Security headers (CSP, XSS protection)
- Standalone output for Docker deployment

### Image Processor (Worker)

**Purpose**: Background image processing using Sharp

**Technology Stack**:
- Node.js 22 LTS
- Sharp for image manipulation
- BullMQ for job queuing
- AWS S3 for storage

**Processing Operations**:
1. **Resize**: Generate multiple image sizes (thumbnail, preview, full)
2. **Watermark**: Add text or image watermarks
3. **AI Tagging**: Automatic image classification
4. **Format Conversion**: JPEG, PNG, WebP optimization

**Job Flow**:
```
S3 Upload → Queue Job → Download Original → Process → Upload Processed → Update DB
```

---

## 4. Database Design

### PostgreSQL Schema Overview

The database uses PostgreSQL 17.6 with UUID primary keys and row-level security for multi-tenancy.

### Core Tables

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  photographers  │     │     clients     │     │    sessions     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (UUID PK)    │     │ id (UUID PK)    │     │ id (UUID PK)    │
│ email           │◄────│ photographer_id │◄────│ photographer_id │
│ business_name   │     │ name            │     │ client_id       │
│ subscription_*  │     │ email           │     │ session_type    │
│ settings (JSON) │     │ lifecycle_stage │     │ scheduled_date  │
│ tenant_id       │     │ tenant_id       │     │ status          │
└─────────────────┘     └─────────────────┘     │ price           │
                                                │ tenant_id       │
                                                └─────────────────┘
                                                         │
                               ┌─────────────────────────┼─────────────────────────┐
                               │                         │                         │
                        ┌──────▼──────┐          ┌──────▼──────┐          ┌──────▼──────┐
                        │  galleries  │          │  payments   │          │  contracts  │
                        ├─────────────┤          ├─────────────┤          ├─────────────┤
                        │ id (UUID)   │          │ id (UUID)   │          │ id (UUID)   │
                        │ session_id  │          │ session_id  │          │ session_id  │
                        │ name        │          │ amount      │          │ content     │
                        │ access_code │          │ status      │          │ signed_at   │
                        │ is_public   │          │ stripe_id   │          │ tenant_id   │
                        │ tenant_id   │          │ tenant_id   │          └─────────────┘
                        └──────┬──────┘          └─────────────┘
                               │
                        ┌──────▼──────┐
                        │   photos    │
                        ├─────────────┤
                        │ id (UUID)   │
                        │ gallery_id  │
                        │ s3_key      │
                        │ ai_tags     │
                        │ tenant_id   │
                        └─────────────┘
```

### Row-Level Security

Multi-tenant isolation is enforced at the database level:

```sql
-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policy
CREATE POLICY clients_tenant_isolation ON clients
FOR ALL
USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_uuid::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Key Tables and Relationships

| Table | Description | Key Relationships |
|-------|-------------|-------------------|
| `photographers` | User accounts and subscriptions | Root entity, owns all tenant data |
| `clients` | Customer records | belongs_to: photographer |
| `sessions` | Photography bookings | belongs_to: photographer, client |
| `galleries` | Photo collections | belongs_to: session |
| `photos` | Individual images | belongs_to: gallery |
| `payments` | Transaction records | belongs_to: session |
| `contracts` | Digital agreements | belongs_to: session, client |
| `workflows` | Automation rules | belongs_to: photographer |

### Database Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- Encryption
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Fuzzy text search
```

---

## 5. Shared Packages

### @focusflow/types

**Location**: `/packages/types/`

**Purpose**: Centralized TypeScript type definitions shared across all services.

**Modules**:
- `photographer.ts`: Photographer, PhotographerSettings, BusinessHours
- `client.ts`: Client, ClientLifecycleStage
- `session.ts`: Session, SessionStatus, SessionLocation
- `gallery.ts`: Gallery, GallerySettings
- `photo.ts`: Photo, PhotoMetadata
- `payment.ts`: Payment, PaymentStatus
- `contract.ts`: Contract, ContractTemplate
- `workflow.ts`: Workflow, WorkflowTrigger
- `common.ts`: UUID, ISODateString, Email, URL, Timestamps
- `api.ts`: ApiRequest, ApiResponse, AuthenticatedUser

**Example Types**:
```typescript
// Common types
export type UUID = string;
export type Email = string;
export type SubscriptionTier = 'starter' | 'professional' | 'studio' | 'enterprise';

// Session status
export type SessionStatus =
  | 'inquiry' | 'booked' | 'confirmed'
  | 'preparing' | 'completed' | 'cancelled' | 'rescheduled';

// API response
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  metadata?: ResponseMetadata;
}
```

### @focusflow/utils

**Location**: `/packages/utils/`

**Purpose**: Shared utility functions and validation helpers.

**Modules**:
- `validation.ts`: Zod schemas for UUID, email, phone, password validation
- `formatting.ts`: Date, currency, and number formatting
- `crypto.ts`: Hashing and encryption utilities
- `dates.ts`: Date manipulation and timezone handling
- `strings.ts`: String manipulation utilities
- `arrays.ts`: Array helper functions
- `objects.ts`: Object manipulation utilities
- `errors.ts`: Custom error classes
- `logger.ts`: Structured logging utilities
- `retry.ts`: Retry logic with exponential backoff

**Example Validators**:
```typescript
import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const passwordSchema = z.string()
  .min(8)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/[0-9]/)
  .regex(/[^A-Za-z0-9]/);
```

---

## 6. API Design

### REST Endpoints

#### CMS API (Strapi)

Base URL: `https://api.focusflow.com`

| Resource | Endpoint | Methods |
|----------|----------|---------|
| Photographers | `/api/photographers` | GET, POST, PUT, DELETE |
| Clients | `/api/clients` | GET, POST, PUT, DELETE |
| Sessions | `/api/sessions` | GET, POST, PUT, DELETE |
| Galleries | `/api/galleries` | GET, POST, PUT, DELETE |
| Photos | `/api/photos` | GET, POST, PUT, DELETE |

#### Payment API (Fastify)

Base URL: `https://payments.focusflow.com`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/payment-intents` | POST | Create payment |
| `/api/v1/payment-intents/:id` | GET | Get payment |
| `/api/v1/payment-intents/:id/confirm` | POST | Confirm payment |
| `/api/v1/payment-intents/:id/cancel` | POST | Cancel payment |
| `/api/v1/customers` | POST | Create customer |
| `/api/v1/subscriptions` | POST | Create subscription |
| `/api/v1/webhook` | POST | Stripe webhooks |

### Authentication/Authorization

**Authentication**: JWT tokens issued by Clerk

**Request Format**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-Request-ID: <uuid>
Idempotency-Key: <key> (for POST requests)
```

**Response Format**:
```json
{
  "data": { ... },
  "timestamp": "2025-01-17T00:00:00.000Z",
  "requestId": "req_abc123"
}
```

**Error Response**:
```json
{
  "error": {
    "type": "validation_error",
    "message": "Invalid request body"
  },
  "timestamp": "2025-01-17T00:00:00.000Z",
  "path": "/api/v1/payment-intents",
  "requestId": "req_abc123"
}
```

### Rate Limiting

- 100 requests per minute per IP
- 10 image processing jobs per minute per user
- Custom limits for webhook endpoints

---

## 7. Infrastructure

### Docker Configuration

**Base Dockerfile** (`/infrastructure/docker/Dockerfile.base`):
- Multi-stage build for optimized images
- Node.js 22-alpine base
- Non-root user for security
- Health checks configured

**Docker Compose Services**:

| Service | Port | Dependencies |
|---------|------|--------------|
| postgres | 5432 | - |
| redis | 6379 | - |
| web | 3000 | postgres, redis |
| cms | 8001 | postgres, redis |
| payments | 8003 | postgres, redis |
| image-processor | 8004 | postgres, redis |
| notifications | 8002 | postgres, redis |

### Render.com Deployment

**Blueprint Configuration** (`/render.yaml`):

**Web Services**:
- `focusflow-cms`: Strapi API (standard plan)
- `focusflow-payments`: Payment service (standard plan)
- `focusflow-web`: Next.js frontend (standard plan)
- `focusflow-bull-board`: Queue monitoring (starter plan)

**Worker Services**:
- `focusflow-worker`: Background jobs (starter plan)
- `focusflow-image-processor`: Image processing (starter plan)

**Cron Jobs**:
- `database-backup`: Daily at 3 AM
- `cleanup-expired-galleries`: Daily at 4 AM
- `send-trial-reminders`: Daily at 10 AM

**Databases**:
- `focusflow-db`: PostgreSQL 15 (standard plan)

### Redis/BullMQ Queues

**Queue Types**:

| Queue | Purpose | Concurrency |
|-------|---------|-------------|
| `image-processing` | Image resize, watermark | 2 |
| `email-notification` | Transactional emails | 5 |
| `webhook` | Outgoing webhooks | 3 |
| `report-generation` | PDF/CSV exports | 1 |
| `workflow` | Automation execution | 2 |

**Queue Configuration**:
```typescript
{
  connection: { host: REDIS_HOST, port: 6379 },
  concurrency: 2,
  limiter: { max: 10, duration: 60000 }
}
```

---

## 8. Dependencies

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22 LTS | Runtime environment |
| TypeScript | 5.5+ | Type safety |
| pnpm | 9.0 | Package management |
| TurboRepo | 2.0 | Monorepo build system |

### Backend Stack

| Package | Version | Purpose |
|---------|---------|---------|
| Strapi | 5.23.1 | CMS and API layer |
| Fastify | 5.6.x | High-performance API server |
| PostgreSQL | 17.6 | Primary database |
| Redis | 8.0 | Caching and queues |
| BullMQ | 5.58.9 | Job queue system |
| Stripe | 18.x | Payment processing |
| Sharp | Latest | Image processing |
| Knex.js | Latest | Database migrations |

### Frontend Stack

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 15.5.4 | React framework |
| React | 19 | UI library |
| Tailwind CSS | Latest | Styling |
| ShadCN UI | v4 | Component library |
| Clerk | Latest | Authentication |
| Zod | Latest | Validation |

### DevOps Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 28.3.3 | Containerization |
| Docker Compose | 2.39.4 | Local orchestration |
| Render.com | - | Cloud hosting |
| OpenTelemetry | 2.0 | Observability |
| Sentry | Latest | Error tracking |

---

## 9. Testing Strategy

### Test Types Per Service

| Service | Unit | Integration | E2E |
|---------|------|-------------|-----|
| web | Jest + React Testing Library | API mocks | Playwright |
| cms | Jest | Supertest | - |
| payments | Jest | Supertest | Stripe Test Mode |
| queue | Jest | Redis mocks | - |
| image-processor | Jest | Sharp mocks | - |

### Testing Tools

- **Unit Testing**: Jest with TypeScript support
- **Integration Testing**: Supertest for API endpoints
- **E2E Testing**: Playwright for browser automation
- **Load Testing**: k6 for performance benchmarks

### Coverage Goals

| Category | Target |
|----------|--------|
| Unit Tests | 80% line coverage |
| Integration Tests | Critical paths covered |
| E2E Tests | Core user flows |

### Test Commands

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e
```

---

## 10. Security Considerations

### Multi-Tenancy

1. **Row-Level Security (RLS)**: PostgreSQL policies enforce tenant isolation at the database level
2. **Tenant Context**: Every request sets `app.current_tenant_id` before queries
3. **Automatic Tenant Assignment**: Triggers automatically assign `tenant_id` on INSERT
4. **No Cross-Tenant Access**: RLS policies prevent any cross-tenant data access

### Payment Security

1. **PCI Compliance**: Stripe handles all card data; no PANs stored locally
2. **Webhook Verification**: All Stripe webhooks verified with signature
3. **Idempotency Keys**: Prevent duplicate charges on retries
4. **Rate Limiting**: 100 requests/minute per IP
5. **Audit Logging**: All payment actions logged

### Data Protection

1. **Encryption at Rest**: PostgreSQL with encryption
2. **Encryption in Transit**: TLS 1.3 for all connections
3. **Password Hashing**: bcrypt with salt
4. **JWT Tokens**: Short-lived tokens (7 days expiry)
5. **CORS Configuration**: Strict origin allowlist
6. **Security Headers**: CSP, XSS protection, HSTS

### Access Control

1. **Role-Based Access**: photographer, admin, client, assistant roles
2. **Permission System**: Granular permissions (manage_clients, view_analytics, etc.)
3. **Session Management**: Clerk-managed sessions with revocation
4. **API Authentication**: JWT bearer tokens required

### Security Headers (Next.js)

```typescript
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

---

## 11. Future Considerations

### Implementation Phases

**Phase 1 (Weeks 1-3)**: Core Infrastructure
- Monorepo setup with TurboRepo
- Database schema and migrations
- Strapi CMS configuration
- Basic authentication

**Phase 2 (Weeks 4-5)**: Microservices
- Payment service with Stripe
- Image processing pipeline
- Queue system setup
- Notification service

**Phase 3 (Weeks 6-7)**: Features
- Client management
- Session booking
- Gallery system
- Contract management

**Phase 4 (Week 8)**: Testing & QA
- Unit test coverage
- Integration tests
- E2E tests
- Security audit

**Phase 5 (Week 9)**: Deployment
- Docker optimization
- Render.com setup
- Monitoring configuration
- Documentation

**Phase 6 (Week 10+)**: Launch
- Beta testing
- Performance optimization
- Public launch

### Scalability Plans

1. **Horizontal Scaling**
   - Stateless services for easy replication
   - Redis cluster for session/cache scaling
   - PostgreSQL read replicas

2. **Database Optimization**
   - Connection pooling with PgBouncer
   - Query optimization and indexing
   - Potential sharding for large datasets

3. **CDN Strategy**
   - CloudFront for image delivery
   - Edge caching for static assets
   - Geographic distribution

4. **Queue Scaling**
   - Multiple worker instances
   - Priority queues for critical jobs
   - Dead letter queues for failed jobs

### Future Features

1. **Mobile Application**: React Native for iOS/Android
2. **AI Enhancements**: Advanced image culling, smart scheduling
3. **Multi-Language Support**: i18n for global expansion
4. **White-Label**: Custom branding for agencies
5. **Enterprise SSO**: SAML/OIDC integration
6. **Advanced Workflows**: Visual workflow builder
7. **Print Fulfillment**: Integration with print labs
8. **Social Media Integration**: Instagram/Pinterest publishing

### Technical Debt Considerations

- Migrate to Event-Driven Architecture for better decoupling
- Implement GraphQL alongside REST for flexible queries
- Add comprehensive API versioning strategy
- Enhance observability with distributed tracing

---

## Appendix

### Environment Variables

Required environment variables for each service are documented in:
- `/services/cms/.env.example`
- `/services/payments/.env.example`
- `/services/web/.env.example`
- `/.env.example` (root)

### Quick Start

```bash
# Install dependencies
pnpm install

# Start local development
docker-compose up -d
pnpm dev

# Run database migrations
pnpm db:migrate

# Run tests
pnpm test
```

### Repository Information

- **Version**: 1.0.0
- **Node.js Requirement**: >= 20.0.0 (22 LTS recommended)
- **Package Manager**: pnpm 9.0.0
- **Build System**: TurboRepo 2.0

---

*Document Version: 1.0*
*Last Updated: January 2026*
