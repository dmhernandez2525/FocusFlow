# =================================
# FOCUSFLOW CMS DOCKERFILE
# Strapi with Node.js 20 Alpine
# NOTE: This Dockerfile expects to be built from the REPO ROOT
# e.g., docker build -f services/cms/Dockerfile .
# =================================

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    gcc \
    autoconf \
    automake \
    zlib-dev \
    libpng-dev \
    nasm \
    bash \
    vips-dev \
    git

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

# Copy all source code
COPY . .

# Create public directory if it doesn't exist (Strapi expects it)
RUN mkdir -p services/cms/public

# Build the CMS application with NODE_ENV=production (required by Strapi)
RUN cd services/cms && NODE_ENV=production pnpm run build

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    vips-dev \
    dumb-init

# Install pnpm
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S strapi -u 1001 -G nodejs

# Copy package files for production install
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/types/package.json ./packages/types/
COPY --from=builder /app/packages/utils/package.json ./packages/utils/
COPY --from=builder /app/services/cms/package.json ./services/cms/

# Copy built application from builder stage
COPY --from=builder --chown=strapi:nodejs /app/services/cms/build ./services/cms/build
COPY --from=builder --chown=strapi:nodejs /app/services/cms/config ./services/cms/config
COPY --from=builder --chown=strapi:nodejs /app/services/cms/public ./services/cms/public
COPY --from=builder --chown=strapi:nodejs /app/services/cms/src ./services/cms/src

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Create necessary directories
RUN mkdir -p services/cms/.cache services/cms/.tmp services/cms/uploads && \
    chown -R strapi:nodejs services/cms/.cache services/cms/.tmp services/cms/uploads

# Switch to non-root user
USER strapi

# Set working directory to the CMS service
WORKDIR /app/services/cms

# Expose port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:1337/_health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "build/index.js"]
