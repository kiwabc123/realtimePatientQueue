#!/bin/bash

echo ""
echo "========================================"
echo "Real-time Patient Queue System"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    echo "Please install Docker from https://www.docker.com/products/docker-desktop"
    echo ""
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "WARNING: Docker Compose not found"
    echo "Using 'docker compose' instead"
    DOCKER_CMD="docker compose"
else
    DOCKER_CMD="docker-compose"
fi

echo ""
echo "1. Building Docker image..."
echo ""

$DOCKER_CMD build

if [ $? -ne 0 ]; then
    echo "ERROR: Docker build failed"
    exit 1
fi

echo ""
echo "2. Starting application..."
echo ""

$DOCKER_CMD up
