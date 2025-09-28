FROM node:18-alpine

WORKDIR /app

# Install dependencies for database and email
COPY package*.json ./
RUN npm ci --only=production

# Copy reminder script
COPY reminders.js ./

# Run reminder script
CMD ["node", "reminders.js"]