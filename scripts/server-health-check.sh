#!/bin/bash
# ============================================================================
# SCL Institute - Production Server Health Check Script
# ============================================================================
# Run this on your server to verify everything is set up correctly
# Usage: bash server-health-check.sh
# ============================================================================

set -e

echo "======================================================================"
echo "SCL Institute - Server Health Check"
echo "======================================================================"
echo ""
date
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Functions
pass() {
    echo -e "${GREEN}[✓ PASS]${NC} $1"
    PASSED=$((PASSED + 1))
}

fail() {
    echo -e "${RED}[✗ FAIL]${NC} $1"
    FAILED=$((FAILED + 1))
}

warn() {
    echo -e "${YELLOW}[! WARN]${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

info() {
    echo -e "${BLUE}[i INFO]${NC} $1"
}

# ============================================================================
# SECTION 1: System Requirements
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. SYSTEM REQUIREMENTS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    pass "OS: $NAME $VERSION_ID"
else
    fail "Cannot detect OS"
fi

# Check kernel
KERNEL=$(uname -r)
pass "Kernel: $KERNEL"

# Check uptime
UPTIME=$(uptime -p)
pass "Uptime: $UPTIME"

# Check RAM
RAM_GB=$(free -h | awk '/^Mem:/ {print $2}')
pass "Total RAM: $RAM_GB"

# Check Disk
DISK=$(df -h / | awk 'NR==2 {print $2}')
DISK_USED=$(df -h / | awk 'NR==2 {print $3}')
DISK_PERCENT=$(df / | awk 'NR==2 {print $5}')
pass "Disk Total: $DISK | Used: $DISK_USED ($DISK_PERCENT)"

if [ "${DISK_PERCENT%\%}" -gt 80 ]; then
    warn "Disk usage is high (${DISK_PERCENT})"
fi

# ============================================================================
# SECTION 2: Docker Installation
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. DOCKER INSTALLATION CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    pass "$DOCKER_VERSION"
else
    fail "Docker is not installed"
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    DC_VERSION=$(docker-compose --version)
    pass "$DC_VERSION"
else
    fail "Docker Compose is not installed"
fi

# Check Docker daemon
if docker info &> /dev/null; then
    pass "Docker daemon is running"
else
    fail "Docker daemon is not running or not accessible"
fi

# ============================================================================
# SECTION 3: Project Directory
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. PROJECT DIRECTORY CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PROJECT_DIR="/opt/scl-institute"

if [ -d "$PROJECT_DIR" ]; then
    pass "Project directory exists: $PROJECT_DIR"
else
    fail "Project directory NOT found: $PROJECT_DIR"
    exit 1
fi

# Check key files
if [ -f "$PROJECT_DIR/docker-compose.prod.yml" ]; then
    pass "docker-compose.prod.yml found"
else
    fail "docker-compose.prod.yml NOT found"
fi

if [ -f "$PROJECT_DIR/.env.production" ]; then
    pass ".env.production found"
else
    fail ".env.production NOT found"
fi

if [ -f "$PROJECT_DIR/nginx/nginx.conf" ]; then
    pass "NGINX configuration found"
else
    fail "NGINX configuration NOT found"
fi

# Check Git
if [ -d "$PROJECT_DIR/.git" ]; then
    pass "Git repository detected"
    CURRENT_BRANCH=$(cd $PROJECT_DIR && git branch --show-current)
    pass "Current branch: $CURRENT_BRANCH"
    
    if [ "$CURRENT_BRANCH" = "main" ]; then
        pass "✓ Correct branch (main)"
    else
        warn "Current branch is '$CURRENT_BRANCH', expected 'main'"
    fi
else
    warn "Git repository not found"
fi

# ============================================================================
# SECTION 4: Running Containers
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. RUNNING CONTAINERS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$PROJECT_DIR"

# Check each service
SERVICES=("scli-frontend-prod" "scli-backend-prod" "scli-mysql-prod" "scli-moodle-prod" "scli-moodle-db-prod" "scli-nginx-prod")

for service in "${SERVICES[@]}"; do
    if docker ps | grep -q "$service"; then
        STATUS=$(docker inspect -f '{{.State.Status}}' $service)
        UPTIME=$(docker ps --format "table {{.Names}}\t{{.RunningFor}}" | grep $service | awk '{print $2}')
        pass "$service (Status: $STATUS, Running: $UPTIME)"
    else
        fail "$service is NOT running"
    fi
done

# Total container count
CONTAINER_COUNT=$(docker ps --filter "label!=skip" | wc -l)
info "Total containers running: $((CONTAINER_COUNT - 1))"

# ============================================================================
# SECTION 5: Service Health Checks
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. SERVICE HEALTH CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Frontend health
if curl -s -I http://localhost:3000 | head -1 | grep -q "200\|301\|302"; then
    pass "Frontend (localhost:3000) is responding"
else
    warn "Frontend (localhost:3000) is not responding"
fi

# Backend health
if curl -s http://localhost:4000/api &> /dev/null; then
    pass "Backend API (localhost:4000/api) is responding"
else
    warn "Backend API (localhost:4000/api) is not responding"
fi

# Moodle health
if curl -s -I http://localhost:8080 | head -1 | grep -q "200\|301\|302"; then
    pass "Moodle (localhost:8080) is responding"
else
    warn "Moodle (localhost:8080) is not responding or still initializing"
fi

# MySQL health
if docker exec scli-mysql-prod mysqladmin ping -h localhost -u root -p$(grep MYSQL_ROOT_PASSWORD $PROJECT_DIR/.env.production | cut -d= -f2) &> /dev/null; then
    pass "MySQL database is healthy"
else
    warn "MySQL health check failed"
fi

# ============================================================================
# SECTION 6: Network Configuration
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. NETWORK CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check ports
PORT_80=$(netstat -tuln 2>/dev/null | grep ":80 " | wc -l)
PORT_443=$(netstat -tuln 2>/dev/null | grep ":443 " | wc -l)
PORT_3306=$(netstat -tuln 2>/dev/null | grep ":3306 " | wc -l)

if [ $PORT_80 -gt 0 ]; then
    pass "Port 80 (HTTP) is open"
else
    warn "Port 80 (HTTP) is not listening"
fi

if [ $PORT_443 -gt 0 ]; then
    pass "Port 443 (HTTPS) is open"
else
    warn "Port 443 (HTTPS) is not listening (OK if not configured yet)"
fi

# Check Docker network
if docker network inspect scl-network-prod &> /dev/null; then
    pass "Docker network 'scl-network-prod' exists"
else
    fail "Docker network 'scl-network-prod' not found"
fi

# ============================================================================
# SECTION 7: Environment Configuration
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. ENVIRONMENT CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check environment variables
ENV_FILE="$PROJECT_DIR/.env.production"

NODE_ENV=$(grep "NODE_ENV=" $ENV_FILE | cut -d= -f2)
if [ "$NODE_ENV" = "production" ]; then
    pass "NODE_ENV is set to: $NODE_ENV"
else
    warn "NODE_ENV is: $NODE_ENV (expected: production)"
fi

FRONTEND_DOMAIN=$(grep "FRONTEND_DOMAIN=" $ENV_FILE | cut -d= -f2)
pass "Frontend domain: $FRONTEND_DOMAIN"

LMS_DOMAIN=$(grep "LMS_DOMAIN=" $ENV_FILE | cut -d= -f2)
pass "LMS domain: $LMS_DOMAIN"

BACKEND_URL=$(grep "BACKEND_URL=" $ENV_FILE | cut -d= -f2)
pass "Backend URL: $BACKEND_URL"

# ============================================================================
# SECTION 8: Volume Management
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. VOLUME & DATA MANAGEMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check volumes
VOLUMES=("mysql_data_prod" "moodle_data_prod" "moodle_db_data_prod")

for volume in "${VOLUMES[@]}"; do
    if docker volume inspect $volume &> /dev/null; then
        SIZE=$(docker volume inspect -f '{{.Mountpoint}}' $volume | xargs du -sh 2>/dev/null | awk '{print $1}')
        pass "Volume '$volume' exists (Size: $SIZE)"
    else
        warn "Volume '$volume' not found"
    fi
done

# ============================================================================
# SECTION 9: Logs
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9. LOG FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

LOG_DIR="/var/log/nginx"
if [ -d "$LOG_DIR" ]; then
    pass "Log directory exists: $LOG_DIR"
    
    if [ -f "$LOG_DIR/access.log" ]; then
        LINES=$(wc -l < $LOG_DIR/access.log)
        pass "Access log: $LINES lines"
    else
        warn "Access log not found"
    fi
else
    warn "Log directory not found"
fi

# ============================================================================
# SECTION 10: DNS Configuration (Local Test)
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "10. DNS/DOMAIN CONFIGURATION TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SERVER_IP=$(hostname -I | awk '{print $1}')
pass "Server IP: $SERVER_IP"

# Local host header test
info "Testing with Host headers (localhost)..."

if curl -s -H "Host: sclsandbox.xyz" http://localhost | grep -q "React\|html" || [ $? -eq 0 ]; then
    pass "Frontend responds to sclsandbox.xyz Host header"
else
    warn "Frontend may not be responding to Host header"
fi

if curl -s -H "Host: lms.sclsandbox.xyz" http://localhost:8080 | grep -q "moodle\|login" || [ $? -eq 0 ]; then
    pass "Moodle responds to lms.sclsandbox.xyz Host header"
else
    warn "Moodle may not be responding to Host header"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "HEALTH CHECK SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✓ Passed: $PASSED${NC}"
echo -e "${YELLOW}! Warnings: $WARNINGS${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ SERVER IS HEALTHY AND READY!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Update DNS records to point domains to: $SERVER_IP"
    echo "  2. Wait 5-15 minutes for DNS propagation"
    echo "  3. Access services at:"
    echo "     - Frontend:  http://sclsandbox.xyz"
    echo "     - LMS:       http://lms.sclsandbox.xyz"
    echo "     - API (IP):  http://$SERVER_IP/api"
    echo ""
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ SERVER HAS $FAILED CRITICAL ISSUES${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Please fix the failures above and try again."
    echo "For help, check PRODUCTION_DEPLOYMENT.md troubleshooting section."
fi

echo ""
echo "Health check completed at: $(date)"
echo "======================================================================"
