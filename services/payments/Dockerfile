# Multi-stage build for optimal image size and security
FROM node:20-alpine AS base

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create app directory and user
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S payment-service -u 1001

# Copy package files
COPY --chown=payment-service:nodejs package*.json ./

# Install dependencies
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build
COPY --chown=payment-service:nodejs . .
RUN npm ci && \
    npm run build && \
    npm prune --production

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

# Copy built application
COPY --from=build --chown=payment-service:nodejs /app/dist ./dist
COPY --from=build --chown=payment-service:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=payment-service:nodejs /app/package.json ./package.json

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

# Switch to non-root user
USER payment-service

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/app.js"]