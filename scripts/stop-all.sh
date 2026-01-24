#!/bin/bash
# Stop all environments

echo ""
echo "Checking for running containers..."
echo ""

# Check for dev containers
if docker-compose -f docker-compose.dev.yml ps --quiet &> /dev/null; then
    echo "Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
    echo "Development environment stopped."
    echo ""
fi

# Check for prod containers
if docker-compose -f docker-compose.prod.yml ps --quiet &> /dev/null; then
    echo "Stopping production environment..."
    docker-compose -f docker-compose.prod.yml down
    echo "Production environment stopped."
    echo ""
fi

echo "All environments stopped."
