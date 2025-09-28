FROM node:18-alpine

WORKDIR /app

# Install dependencies for database connection
COPY package*.json ./
RUN npm ci --only=production

# Copy cleanup script
COPY cleanup.js ./

# Run cleanup script
CMD ["node", "cleanup.js"]