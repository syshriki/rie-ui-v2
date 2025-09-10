FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies with no cache
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Copy env file
COPY .prod.env ./.env

# Build the application with no cache
ENV NODE_ENV=production
RUN npm run build --no-cache

# Production image
FROM node:24-alpine

WORKDIR /app

# Copy from builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env ./.env

# Set permissions
RUN chmod -R a-w+x . && chmod -R a+x .next node_modules

EXPOSE 3000

ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]