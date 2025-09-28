#!/bin/sh
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warning() {
    echo "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

success() {
    echo "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

# Wait for service to be available
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local max_attempts=${4:-30}
    local attempt=1

    log "Waiting for $service_name to be available at $host:$port..."

    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            success "$service_name is available"
            return 0
        fi

        log "Attempt $attempt/$max_attempts: $service_name not yet available, waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done

    error "$service_name failed to become available after $max_attempts attempts"
    return 1
}

# Wait for PostgreSQL
wait_for_postgres() {
    if [ -n "$DATABASE_URL" ]; then
        # Parse DATABASE_URL to extract host and port
        db_host=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        db_port=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

        if [ -n "$db_host" ] && [ -n "$db_port" ]; then
            wait_for_service "$db_host" "$db_port" "PostgreSQL"
        else
            warning "Could not parse DATABASE_URL: $DATABASE_URL"
        fi
    elif [ -n "$DATABASE_HOST" ] && [ -n "$DATABASE_PORT" ]; then
        wait_for_service "$DATABASE_HOST" "$DATABASE_PORT" "PostgreSQL"
    else
        log "No database configuration found, skipping database wait"
    fi
}

# Wait for Redis
wait_for_redis() {
    if [ -n "$REDIS_URL" ]; then
        # Parse REDIS_URL to extract host and port
        redis_host=$(echo "$REDIS_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        if [ -z "$redis_host" ]; then
            redis_host=$(echo "$REDIS_URL" | sed -n 's/redis:\/\/\([^:]*\):.*/\1/p')
        fi
        redis_port=$(echo "$REDIS_URL" | sed -n 's/.*:\([0-9]*\)$/\1/p')

        if [ -n "$redis_host" ] && [ -n "$redis_port" ]; then
            wait_for_service "$redis_host" "$redis_port" "Redis"
        else
            warning "Could not parse REDIS_URL: $REDIS_URL"
        fi
    elif [ -n "$REDIS_HOST" ] && [ -n "$REDIS_PORT" ]; then
        wait_for_service "$REDIS_HOST" "$REDIS_PORT" "Redis"
    else
        log "No Redis configuration found, skipping Redis wait"
    fi
}

# Run database migrations if in production
run_migrations() {
    if [ "$NODE_ENV" = "production" ] && [ -f "package.json" ]; then
        if grep -q '"migrate"' package.json; then
            log "Running database migrations..."
            if npm run migrate; then
                success "Database migrations completed successfully"
            else
                error "Database migrations failed"
                exit 1
            fi
        else
            log "No migration script found in package.json, skipping migrations"
        fi
    else
        log "Skipping migrations (not in production or no package.json found)"
    fi
}

# Validate environment variables
validate_env() {
    local required_vars=""

    # Check for NODE_ENV
    if [ -z "$NODE_ENV" ]; then
        warning "NODE_ENV is not set, defaulting to development"
        export NODE_ENV=development
    fi

    # Check for PORT
    if [ -z "$PORT" ]; then
        warning "PORT is not set, defaulting to 3000"
        export PORT=3000
    fi

    # Production-specific validations
    if [ "$NODE_ENV" = "production" ]; then
        if [ -z "$DATABASE_URL" ] && [ -z "$DATABASE_HOST" ]; then
            required_vars="$required_vars DATABASE_URL"
        fi

        if [ -z "$JWT_SECRET" ]; then
            required_vars="$required_vars JWT_SECRET"
        fi
    fi

    if [ -n "$required_vars" ]; then
        error "Missing required environment variables:$required_vars"
        exit 1
    fi

    success "Environment validation completed"
}

# Setup signal handlers for graceful shutdown
setup_signal_handlers() {
    trap 'log "Received SIGTERM, shutting down gracefully..."; exit 0' TERM
    trap 'log "Received SIGINT, shutting down gracefully..."; exit 0' INT
}

# Main entrypoint logic
main() {
    log "Starting FocusFlow application entrypoint..."

    # Setup signal handlers
    setup_signal_handlers

    # Validate environment
    validate_env

    # Wait for dependencies
    wait_for_postgres
    wait_for_redis

    # Run migrations if needed
    run_migrations

    log "All checks passed, starting application with command: $*"

    # Execute the main command
    exec "$@"
}

# Handle different command scenarios
if [ "$#" -eq 0 ]; then
    error "No command provided"
    exit 1
fi

# If the first argument is a known Node.js command, run main logic
case "$1" in
    "npm"|"node"|"pnpm"|"yarn")
        main "$@"
        ;;
    *)
        # For other commands, just execute them directly
        log "Executing command directly: $*"
        exec "$@"
        ;;
esac