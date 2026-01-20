FROM node:18-alpine

WORKDIR /app

# Install dependencies for database and email (skip if no package.json)
COPY package*.json* ./
RUN if [ -f package.json ]; then \
      if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi \
    fi

# Copy reminder script
COPY reminders.js* ./

# Run reminder script
CMD ["node", "reminders.js"]