#!/bin/bash
# Development environment startup script for Linux/Mac

echo ""
echo "========================================"
echo "SCL Institute - Development Environment"
echo "========================================"
echo ""

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    exit 1
fi

echo "Starting development environment..."
echo ""

# Load dev environment and start containers
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d

if [ $? -ne 0 ]; then
    echo "Error: Failed to start development containers"
    exit 1
fi

echo ""
echo "========================================"
echo "Development environment started!"
echo "========================================"
echo ""
echo "Access the following services:"
echo "  - Frontend:  http://localhost:3000"
echo "  - Backend:   http://localhost:4000/api"
echo "  - Moodle:    http://localhost:8080"
echo "  - MySQL:     localhost:33061"
echo ""
echo "Use 'docker-compose -f docker-compose.dev.yml logs -f' to view logs"
echo "Use './scripts/stop-dev.sh' to stop the environment"
echo ""
