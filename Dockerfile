FROM node:24-alpine

# Install git for cloning docs repo
RUN apk add --no-cache git openssh-client

WORKDIR /app

# Copy package files first (only rebuilds if dependencies change)
COPY package*.json ./

# Install dependencies (cached unless package*.json changes)
RUN npm ci --only=production

# Copy application files (rebuilds if code changes)
COPY server.js ./
COPY config.js ./
COPY public ./public

# Create docs directory
RUN mkdir -p docs

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
