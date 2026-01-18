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
