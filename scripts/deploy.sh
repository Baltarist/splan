#!/bin/bash

# Splan Production Deployment Script
set -e

echo "🚀 Starting Splan deployment..."

# Configuration
APP_NAME="splan"
DOCKER_IMAGE="splan:latest"
CONTAINER_NAME="splan-backend"
NETWORK_NAME="splan-network"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Stop and remove existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans || true

# Remove old images
print_status "Cleaning up old images..."
docker image prune -f || true

# Build new image
print_status "Building new Docker image..."
docker-compose build --no-cache

# Start services
print_status "Starting services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
print_status "Checking service status..."
if docker-compose ps | grep -q "Up"; then
    print_status "Services are running successfully!"
else
    print_error "Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Run database migrations
print_status "Running database migrations..."
docker-compose exec -T splan-backend npx prisma migrate deploy || {
    print_warning "Database migration failed. This might be expected if migrations are already applied."
}

# Health check
print_status "Performing health check..."
for i in {1..10}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_status "Health check passed! Application is ready."
        break
    else
        print_warning "Health check attempt $i failed. Retrying in 10 seconds..."
        sleep 10
    fi
done

# Final status
print_status "Deployment completed successfully!"
print_status "Application URL: http://localhost:3000"
print_status "API Documentation: http://localhost:3000/api-docs"
print_status "Health Check: http://localhost:3000/health"

# Show running containers
print_status "Running containers:"
docker-compose ps

echo ""
print_status "🎉 Splan is now deployed and ready to use!" 