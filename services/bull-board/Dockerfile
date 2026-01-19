FROM node:18-alpine

WORKDIR /app

# Install dependencies
# Note: dockerContext is repo root, so we copy from services/bull-board/
COPY services/bull-board/package*.json ./
RUN npm install --omit=dev

# Copy application code
COPY services/bull-board/ .

# Expose port (Render expects 10000 for Docker web services)
EXPOSE 10000

# Set default port (can be overridden by environment variable)
ENV PORT=10000

# Run Bull Board
CMD ["node", "index.js"]