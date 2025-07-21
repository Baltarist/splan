# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Build the application (needs tsc from devDependencies)
RUN npm run build

# Generate Prisma client (after build, in case schema uses built code)
RUN npx prisma generate

# Production stage
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application and prisma client
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Install OpenSSL 1.1 if available, otherwise fallback to default openssl
RUN apk add --no-cache openssl1.1 || apk add --no-cache openssl

# Set NODE_ENV for production best practices
ENV NODE_ENV=production

# Generate Prisma client in production image
RUN npx prisma generate

# Create logs directory and set permissions
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Add a shell for debugging (optional, can be removed in strict prod)
SHELL ["/bin/sh", "-c"]

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# Start the application
CMD ["npm", "start"] 

# If Prisma still fails, check Alpine version and consider using debian-based node image for full OpenSSL 1.1 support 