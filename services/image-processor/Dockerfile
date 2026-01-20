FROM node:18-alpine AS builder

# Install sharp dependencies for build
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev

WORKDIR /app

# Install all dependencies (including devDependencies for TypeScript build)
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install sharp runtime dependencies
RUN apk add --no-cache vips-dev

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi

# Copy built code from builder
COPY --from=builder /app/dist ./dist

# Run the image processor
CMD ["node", "dist/index.js"]