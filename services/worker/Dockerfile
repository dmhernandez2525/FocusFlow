FROM node:18-alpine AS builder

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

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi

# Copy built code from builder
COPY --from=builder /app/dist ./dist

# Run the worker
CMD ["node", "dist/index.js"]