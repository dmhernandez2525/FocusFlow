# Docker Configuration for FocusFlow

This document explains the Docker configuration for the FocusFlow monorepo.

## Files Overview

- **docker-compose.yml**: Main production configuration
- **docker-compose.override.yml**: Development overrides (automatically applied)
- **docker-compose.prod.yml**: Production configuration with resource limits
- **.dockerignore**: Files to exclude from Docker context
- **infrastructure/docker/Dockerfile.base**: Multi-stage Dockerfile for all services
- **infrastructure/docker/docker-entrypoint.sh**: Smart entrypoint script with health checks
- **infrastructure/docker/init-db.sql**: PostgreSQL initialization script

## Quick Start

### Development Environment

```bash
# Start all services in development mode
docker-compose up

# Start specific services
docker-compose up postgres redis web

# Build and start services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Production Environment

```bash
# Use production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or use the production-specific file
docker-compose -f docker-compose.prod.yml up -d
```

## Services

### Infrastructure Services

- **postgres**: PostgreSQL 17.6 database
  - Port: 5432
  - Volume: postgres_data
  - Health check included

- **redis**: Redis 8.0 cache/queue
  - Port: 6379
  - Volume: redis_data
  - Health check included

### Application Services

- **web**: Frontend application (port 3000)
- **cms**: Content management service (port 8001)
- **notifications**: Notification service (port 8002)
- **payments**: Payment processing service (port 8003)
- **image-processor**: Image processing service (port 8004)

### Development Tools (development only)

- **adminer**: Database admin interface (port 8080)
- **redis-commander**: Redis admin interface (port 8081)
- **mailhog**: Email testing tool (ports 1025, 8025)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `JWT_SECRET`: JWT signing secret
- `DATABASE_PASSWORD`: Database password
- `REDIS_PASSWORD`: Redis password
- `STRIPE_SECRET_KEY`: Stripe payment key
- `AWS_*`: AWS credentials for S3

## Docker Features

### Multi-stage Builds
- **base**: Common Node.js 22 Alpine setup
- **deps**: Dependency installation
- **development**: Development with hot reload
- **builder**: Production build stage
- **production**: Optimized production image

### Security Features
- Non-root user (nextjs:nodejs)
- Minimal Alpine Linux base
- Security updates applied
- Resource limits in production

### Health Checks
- All services include health checks
- Smart dependency waiting via entrypoint script
- Graceful shutdown handling

### Volume Management
- Anonymous volumes for node_modules (performance)
- Named volumes for data persistence
- Bind mounts for development hot reload

## Networking

- Custom bridge network: `focusflow-network`
- Service discovery via service names
- Internal communication only (except exposed ports)

## Development vs Production

### Development (default)
- Hot reload enabled
- Debug logging
- Development tools included
- Source code mounted as volumes

### Production
- Optimized builds
- Minimal images
- Resource limits
- Health checks enforced
- No development tools

## Troubleshooting

### Build Issues
```bash
# Clean build
docker-compose build --no-cache

# View build logs
docker-compose build web --progress=plain
```

### Service Issues
```bash
# Check service logs
docker-compose logs web

# Execute commands in running container
docker-compose exec web sh

# Check health status
docker-compose ps
```

### Database Issues
```bash
# Connect to database
docker-compose exec postgres psql -U focusflow -d focusflow_dev

# Reset database
docker-compose down -v
docker-compose up postgres
```

### Cleanup
```bash
# Remove containers and networks
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a
```

## Performance Tips

1. **Use .dockerignore**: Reduces build context size
2. **Layer caching**: Dependencies are cached separately from source code
3. **Multi-stage builds**: Smaller production images
4. **Volume mounts**: Fast file sync in development
5. **Resource limits**: Prevents container resource exhaustion

## Security Considerations

1. **Non-root users**: All containers run as non-root
2. **Secrets management**: Use environment variables for secrets
3. **Network isolation**: Services communicate via internal network
4. **Minimal base images**: Alpine Linux reduces attack surface
5. **Health checks**: Ensures service availability

## Monitoring

Health check endpoints should be implemented at:
- `GET /health` - All application services
- Built-in health checks for PostgreSQL and Redis
- Container resource monitoring via `docker stats`