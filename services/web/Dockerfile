# Use the official Node.js 20 Alpine image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
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

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy all files
COPY . .

# Copy node_modules from deps stage (pnpm hoists to root)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules
COPY --from=deps /app/services/web/node_modules ./services/web/node_modules

# Build the types package first (dependency for web)
RUN cd packages/types && pnpm run build

# Generate Prisma client
RUN cd services/web && npx prisma generate

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build only the web application
RUN cd services/web && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# Note: In a monorepo, standalone output preserves the directory structure
COPY --from=builder --chown=nextjs:nodejs /app/services/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/services/web/.next/static ./services/web/.next/static

# Copy healthcheck script to the app working directory
COPY --from=builder --chown=nextjs:nodejs /app/services/web/healthcheck.js ./services/web/healthcheck.js

# Copy public folder to the correct location
COPY --from=builder --chown=nextjs:nodejs /app/services/web/public ./services/web/public

# Set the correct permission for prerender cache
RUN mkdir -p ./services/web/.next
RUN chown nextjs:nodejs ./services/web/.next

# Switch to non-root user
USER nextjs

# Set working directory to the web service
WORKDIR /app/services/web

# Expose port (Render uses PORT env var, typically 10000)
EXPOSE 10000

# Don't hardcode PORT - let Render's PORT env var take precedence
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]