FROM node:18-alpine

# Install git for cloning docs repo
RUN apk add --no-cache git openssh-client

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY server.js ./
COPY public ./public
COPY config.example.json ./

# Create docs directory
RUN mkdir -p docs

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
