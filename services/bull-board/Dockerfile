FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Expose port (Render expects 10000 for Docker web services)
EXPOSE 10000

# Set default port (can be overridden by environment variable)
ENV PORT=10000

# Run Bull Board
CMD ["node", "index.js"]