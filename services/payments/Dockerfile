# Multi-stage build for FocusFlow Payment Service
# NOTE: This Dockerfile expects to be built from the REPO ROOT
# e.g., docker build -f services/payments/Dockerfile .

FROM node:20-alpine AS base

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init libc6-compat && \
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
COPY --from=deps /app/services/payments/node_modules ./services/payments/node_modules

# Build the types package first (dependency for payments)
RUN cd packages/types && pnpm run build

# Build the payments service
RUN cd services/payments && pnpm run build

# Production stage
FROM node:20-alpine AS production

# Install security updates and dumb-init
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create app directory and user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S payment-service -u 1001

# Install pnpm for production deps
RUN npm install -g pnpm

# Copy package files for production install
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/types/package.json ./packages/types/
COPY --from=builder /app/services/payments/package.json ./services/payments/

# Copy built packages
COPY --from=builder --chown=payment-service:nodejs /app/packages/types/dist ./packages/types/dist
COPY --from=builder --chown=payment-service:nodejs /app/services/payments/dist ./services/payments/dist

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

# Switch to non-root user
USER payment-service

# Set working directory to the service
WORKDIR /app/services/payments

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/app.js"]
