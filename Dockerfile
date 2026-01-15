FROM node:24-alpine

RUN apk add --no-cache git openssh-client

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server.js ./
COPY config.js ./
COPY public ./public

RUN mkdir -p docs

EXPOSE 3000
CMD ["node", "server.js"]
