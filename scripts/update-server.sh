# ============================================================================
# SCL Institute Production Server Update Script
# ============================================================================
# Run this script after changes are merged to main branch
# It will pull latest code and restart services
# ============================================================================

#!/bin/bash

set -e

PROJECT_DIR="/opt/scl-institute"
cd $PROJECT_DIR

echo "======================================================================"
echo "SCL Institute - Production Update"
echo "======================================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Step 1: Pull latest code from main
print_status "Pulling latest code from main branch..."
git checkout main
git pull origin main

# Step 2: Check for changes
CHANGES=$(git status --porcelain)
if [ -z "$CHANGES" ]; then
    print_warning "No changes detected. Updating containers anyway..."
fi

# Step 3: Stop current containers
print_status "Stopping current containers..."
docker-compose -f docker-compose.prod.yml down

# Step 4: Build new images
print_status "Building new Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Step 5: Start containers
print_status "Starting updated containers..."
docker-compose -f docker-compose.prod.yml up -d

# Step 6: Wait for services
sleep 10

# Step 7: Verify
print_status "Verifying services..."
SERVICES=("scli-frontend-prod" "scli-backend-prod" "scli-mysql-prod" "scli-moodle-prod" "scli-nginx-prod")
FAILED=0

for service in "${SERVICES[@]}"; do
    if docker ps | grep -q "$service"; then
        print_status "Service running: $service"
    else
        print_error "Service NOT running: $service"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "======================================================================"
if [ $FAILED -eq 0 ]; then
    print_status "Update completed successfully!"
else
    print_error "$FAILED service(s) failed to start"
    echo "View logs: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi
echo "======================================================================"
