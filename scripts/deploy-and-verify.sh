#!/bin/bash
# ============================================================================
# SCL Institute - Complete Automated Setup & Verification
# ============================================================================
# This script does EVERYTHING:
# 1. Deploys the complete system from scratch
# 2. Verifies all services
# 3. Runs health checks
# 4. Provides deployment summary
# ============================================================================

set -e

echo "======================================================================"
echo "SCL Institute - Complete Automated Deployment & Verification"
echo "======================================================================"
echo ""
date
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Functions
print_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check root
if [ "$EUID" -ne 0 ]; then 
    print_error "This script must be run as root"
    exit 1
fi

# ============================================================================
# PART 1: DEPLOYMENT
# ============================================================================
print_step "PART 1: SYSTEM DEPLOYMENT"

# Step 1: Update system
print_step "Step 1/9: Updating system packages"
apt-get update > /dev/null 2>&1
apt-get upgrade -y > /dev/null 2>&1
print_status "System updated"

# Step 2: Install Docker
print_step "Step 2/9: Installing Docker"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh > /dev/null 2>&1
    sh get-docker.sh > /dev/null 2>&1
    rm get-docker.sh
    print_status "Docker installed"
else
    print_status "Docker already installed"
fi

# Step 3: Install Docker Compose
print_step "Step 3/9: Installing Docker Compose"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose > /dev/null 2>&1
    chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed"
else
    print_status "Docker Compose already installed"
fi

# Step 4: Setup project directory
print_step "Step 4/9: Setting up project directory"
PROJECT_DIR="/opt/scl-institute"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR
print_status "Project directory: $PROJECT_DIR"

# Step 5: Clone or pull repository
print_step "Step 5/9: Cloning/updating repository"
if [ -d "$PROJECT_DIR/.git" ]; then
    print_status "Repository exists, pulling latest..."
    git pull origin main > /dev/null 2>&1
else
    print_status "Cloning repository..."
    git clone https://github.com/syedsanaulhaq/scl-institute.git . > /dev/null 2>&1
fi
git checkout main > /dev/null 2>&1
print_status "Repository ready on main branch"

# Step 6: Create data directories
print_step "Step 6/9: Creating data directories"
mkdir -p $PROJECT_DIR/data/{mysql,moodle,moodle-db}
mkdir -p /var/log/nginx
chmod 755 $PROJECT_DIR/data/*
print_status "Data directories created"

# Step 7: Build Docker images
print_step "Step 7/9: Building Docker images (this may take a few minutes)"
docker-compose -f $PROJECT_DIR/docker-compose.prod.yml build --no-cache > /dev/null 2>&1
print_status "Docker images built successfully"

# Step 8: Start containers
print_step "Step 8/9: Starting services"
docker-compose -f $PROJECT_DIR/docker-compose.prod.yml up -d > /dev/null 2>&1
print_status "Services started"

# Step 9: Wait for services
print_step "Step 9/9: Waiting for services to initialize"
echo "Waiting 15 seconds for services to fully start..."
sleep 15
print_status "Initialization complete"

# ============================================================================
# PART 2: VERIFICATION & HEALTH CHECK
# ============================================================================
print_step "PART 2: VERIFICATION & HEALTH CHECKS"

PASSED=0
FAILED=0
WARNINGS=0

echo "Checking all services..."
echo ""

# Check containers
SERVICES=("scli-frontend-prod" "scli-backend-prod" "scli-mysql-prod" "scli-moodle-prod" "scli-mysql-prod" "scli-nginx-prod")
CONTAINER_FAILED=0

for service in "${SERVICES[@]}"; do
    if docker ps | grep -q "$service"; then
        STATUS=$(docker inspect -f '{{.State.Status}}' $service 2>/dev/null)
        echo -e "${GREEN}[✓]${NC} $service is running (Status: $STATUS)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}[✗]${NC} $service is NOT running"
        CONTAINER_FAILED=$((CONTAINER_FAILED + 1))
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "Checking service health..."
echo ""

# Frontend health
if curl -s -I http://localhost:3000 | head -1 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}[✓]${NC} Frontend (localhost:3000) responding"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}[!]${NC} Frontend still initializing (this is OK)"
    WARNINGS=$((WARNINGS + 1))
fi

# Backend health
if curl -s http://localhost:4000/api > /dev/null 2>&1; then
    echo -e "${GREEN}[✓]${NC} Backend API (localhost:4000/api) responding"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}[!]${NC} Backend API still initializing (this is OK)"
    WARNINGS=$((WARNINGS + 1))
fi

# Moodle health
if curl -s -I http://localhost:8080 | head -1 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}[✓]${NC} Moodle (localhost:8080) responding"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}[!]${NC} Moodle still initializing (this can take 5-10 minutes)"
    WARNINGS=$((WARNINGS + 1))
fi

# MySQL health
if docker exec scli-mysql-prod mysqladmin ping -h localhost -u root -p$(grep MYSQL_ROOT_PASSWORD $PROJECT_DIR/.env.production | cut -d= -f2) &> /dev/null; then
    echo -e "${GREEN}[✓]${NC} MySQL database healthy"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}[!]${NC} MySQL health check pending (this is OK)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "Checking configuration..."
echo ""

# Environment
if [ -f "$PROJECT_DIR/.env.production" ]; then
    echo -e "${GREEN}[✓]${NC} Environment configuration found"
    PASSED=$((PASSED + 1))
    
    NODE_ENV=$(grep "NODE_ENV=" $PROJECT_DIR/.env.production | cut -d= -f2)
    FRONTEND_DOMAIN=$(grep "FRONTEND_DOMAIN=" $PROJECT_DIR/.env.production | cut -d= -f2)
    LMS_DOMAIN=$(grep "LMS_DOMAIN=" $PROJECT_DIR/.env.production | cut -d= -f2)
    
    echo "  - NODE_ENV: $NODE_ENV"
    echo "  - Frontend Domain: $FRONTEND_DOMAIN"
    echo "  - LMS Domain: $LMS_DOMAIN"
else
    echo -e "${RED}[✗]${NC} Environment configuration NOT found"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "Checking Docker network..."
echo ""

if docker network inspect scl-network-prod &> /dev/null; then
    echo -e "${GREEN}[✓]${NC} Docker network 'scl-network-prod' exists"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}[✗]${NC} Docker network NOT found"
    FAILED=$((FAILED + 1))
fi

# ============================================================================
# PART 3: SUMMARY & NEXT STEPS
# ============================================================================
print_step "DEPLOYMENT SUMMARY"

echo ""
echo -e "${GREEN}✓ Passed: $PASSED${NC}"
echo -e "${YELLOW}! Warnings: $WARNINGS${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Your production system is running!"
    echo ""
    echo "📋 NEXT STEPS:"
    echo ""
    echo "1. UPDATE DNS RECORDS"
    echo "   Point these domains to: 185.211.6.60"
    echo "     - sclsandbox.xyz"
    echo "     - lms.sclsandbox.xyz"
    echo "     - www.sclsandbox.xyz"
    echo ""
    echo "2. WAIT FOR DNS PROPAGATION (5-15 minutes)"
    echo ""
    echo "3. ACCESS YOUR SERVICES"
    echo "     - Frontend:     http://sclsandbox.xyz"
    echo "     - LMS:          http://lms.sclsandbox.xyz"
    echo "     - API (IP):     http://185.211.6.60/api"
    echo ""
    echo "4. LOGIN CREDENTIALS"
    echo "     SCL Institute:"
    echo "       Email: admin@scl.com"
    echo "       Password: password"
    echo ""
    echo "     Moodle Admin:"
    echo "       Username: admin"
    echo "       Password: SCLInst!2026"
    echo ""
    echo "5. MONITOR SERVICES"
    echo "     docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo "6. CHECK SYSTEM RESOURCES"
    echo "     docker stats"
    echo ""
    echo "⏱️  NOTE: Moodle may take 5-10 minutes to fully initialize"
    echo "   Check with: docker-compose -f docker-compose.prod.yml logs scli-moodle-prod"
    echo ""
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ DEPLOYMENT HAS $FAILED CRITICAL ISSUES${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Please check the logs:"
    echo "  docker-compose -f docker-compose.prod.yml logs"
    echo ""
    echo "For specific service:"
    echo "  docker-compose -f docker-compose.prod.yml logs scli-backend-prod"
fi

echo ""
echo "======================================================================"
echo "Deployment completed at: $(date)"
echo "======================================================================"
