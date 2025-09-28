# =================================
# FOCUSFLOW CMS DOCKERFILE
# Strapi v5.23.1 with Node.js 20 Alpine
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

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S strapi -u 1001 -G nodejs

# Set ownership
RUN chown -R strapi:nodejs /app

# Switch to non-root user
USER strapi

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    vips-dev \
    dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S strapi -u 1001 -G nodejs

# Copy built application from builder stage
COPY --from=builder --chown=strapi:nodejs /app/build ./build
COPY --from=builder --chown=strapi:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=strapi:nodejs /app/package.json ./package.json
COPY --from=builder --chown=strapi:nodejs /app/config ./config
COPY --from=builder --chown=strapi:nodejs /app/public ./public

# Create necessary directories
RUN mkdir -p .cache .tmp uploads && \
    chown -R strapi:nodejs .cache .tmp uploads

# Switch to non-root user
USER strapi

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

# Multi-stage build labels
LABEL maintainer="FocusFlow Team <dev@focusflow.com>"
LABEL description="FocusFlow CMS powered by Strapi v5.23.1"
LABEL version="1.0.0"
LABEL org.opencontainers.image.title="FocusFlow CMS"
LABEL org.opencontainers.image.description="Production-ready Strapi CMS for FocusFlow"
LABEL org.opencontainers.image.vendor="FocusFlow"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/focusflow/cms"