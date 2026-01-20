# Multi-stage build for FocusFlow Worker Service
# NOTE: This Dockerfile expects to be built from the REPO ROOT
# e.g., docker build -f services/worker/Dockerfile .

FROM node:20-alpine AS base

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init libc6-compat python3 make g++ vips-dev && \
    rm -rf /var/cache/apk/*

# Install dependencies
FROM base AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files and workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy ALL workspace package.json files (required for pnpm workspace resolution)
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY services/web/package.json ./services/web/
COPY services/cms/package.json ./services/cms/
COPY services/payments/package.json ./services/payments/
COPY services/queue/package.json ./services/queue/
COPY services/worker/package.json ./services/worker/
COPY services/bull-board/package.json ./services/bull-board/

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy all files
COPY . .

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules
COPY --from=deps /app/services/worker/node_modules ./services/worker/node_modules

# Build the types package first (dependency for utils and worker)
RUN cd packages/types && pnpm run build

# Build the utils package (dependency for worker)
RUN cd packages/utils && pnpm run build

# Build the worker service
RUN cd services/worker && pnpm run build

# Production stage
FROM node:20-alpine AS production

# Install security updates and runtime dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init vips-dev && \
    rm -rf /var/cache/apk/*

# Create app directory and user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S worker-service -u 1001

# Install pnpm for production deps
RUN npm install -g pnpm

# Copy package files for production install
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/types/package.json ./packages/types/
COPY --from=builder /app/packages/utils/package.json ./packages/utils/
COPY --from=builder /app/services/worker/package.json ./services/worker/

# Copy built packages
COPY --from=builder --chown=worker-service:nodejs /app/packages/types/dist ./packages/types/dist
COPY --from=builder --chown=worker-service:nodejs /app/packages/utils/dist ./packages/utils/dist
COPY --from=builder --chown=worker-service:nodejs /app/services/worker/dist ./services/worker/dist

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "process.exit(0);"

# Switch to non-root user
USER worker-service

# Set working directory to the service
WORKDIR /app/services/worker

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
