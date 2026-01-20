FROM node:18-alpine

WORKDIR /app

# Install dependencies for database connection (skip if no package.json)
COPY package*.json* ./
RUN if [ -f package.json ]; then \
      if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi \
    fi

# Copy cleanup script
COPY cleanup.js* ./

# Run cleanup script
CMD ["node", "cleanup.js"]