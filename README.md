# FocusFlow

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)

A comprehensive ERP platform for photographers, bridging the gap between basic contact management and enterprise-level business software. Built on modern microservices architecture.

## Architecture

```
focusflow/
├── services/           # Microservices
│   ├── cms/           # Strapi v5 CMS/API
│   ├── payments/      # Fastify payment service
│   ├── web/           # Next.js 15 frontend
│   └── ...
├── packages/          # Shared packages
│   ├── types/         # TypeScript definitions
│   └── utils/         # Shared utilities
└── infrastructure/    # Database & Docker
    ├── database/      # Knex migrations & seeds
    └── docker/        # Dockerfiles
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, ShadCN UI, Tailwind CSS
- **Backend**: Strapi v5, Fastify v5
- **Database**: PostgreSQL 17 with Row-Level Security
- **Cache**: Redis 8.0
- **Queue**: BullMQ
- **Runtime**: Node.js 22 LTS
- **Build**: TurboRepo, pnpm

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 9+
- Docker & Docker Compose
- PostgreSQL 17
- Redis 8

### Development Setup

```bash
# Clone repository
git clone https://github.com/dmhernandez2525/focusflow.git
cd focusflow

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Run database migrations
pnpm db:setup

# Start development servers
pnpm dev
```

### Docker Development

```bash
docker compose up -d
```

## Database Commands

```bash
pnpm db:migrate     # Run migrations
pnpm db:rollback    # Rollback last migration
pnpm db:status      # Check migration status
pnpm db:seed        # Run seed files
pnpm db:reset       # Reset database
```

## Deployment

### Render.com

Configured via `render.yaml`. After creating the Blueprint, set these env vars in the Render Dashboard:

**Critical - Must Set:**
| Variable | Services | Description |
|----------|----------|-------------|
| `REDIS_HOST` | cms, payments, worker, image-processor, bull-board | Redis connection host (e.g., `redis-xxxxx.render.com`) |
| `AWS_ACCESS_KEY_ID` | cms, worker, image-processor, backup | AWS S3 access key |
| `AWS_SECRET_ACCESS_KEY` | cms, worker, image-processor, backup | AWS S3 secret key |
| `STRIPE_SECRET_KEY` | payments | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | payments | Stripe webhook secret |
| `CLERK_SECRET_KEY` | web | Clerk auth secret key |
| `SENDGRID_API_KEY` | cms, worker, reminders | SendGrid email API key |

**Frontend:**
| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key |

**Auto-configured:** DATABASE_URL, JWT_SECRET, AUTH_SECRET, API_TOKEN_SALT, etc.

**Note:** Create a managed Redis instance on Render first and update `REDIS_HOST` for all services.

## Project Status

**Current Phase**: Infrastructure Setup

- [x] Monorepo structure (TurboRepo + pnpm)
- [x] Database schema & migrations
- [x] Strapi CMS configuration
- [x] Docker configuration
- [x] Render.com deployment config
- [ ] Frontend implementation
- [ ] Payment integration
- [ ] Image processing service
- [ ] Testing infrastructure

See [doc.md](./doc.md) for the complete implementation roadmap.

## License

MIT
