#!/bin/bash

# ===============================================
# SCL-Institute Complete System Setup Script
# For Linux/Unix Systems
# Version 1.0
# Created: January 28, 2026
# ===============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/syedsanaulhaq/scl-institute.git"
PROJECT_DIR="scl-institute"
DB_NAME="scl_institute"
DB_USER="scl_admin"
DB_PASSWORD="securePassword123!"
MYSQL_ROOT_PASSWORD="rootPassword123!"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SCL-Institute Complete System Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Check Prerequisites
echo -e "${YELLOW}[STEP 1/8] Checking Prerequisites...${NC}"
command -v git >/dev/null 2>&1 || { echo -e "${RED}Git not installed. Please install Git first.${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker not installed. Please install Docker first.${NC}"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Docker Compose not installed. Please install Docker Compose first.${NC}"; exit 1; }
echo -e "${GREEN}✓ All prerequisites found${NC}"
echo ""

# Step 2: Clone Repository
echo -e "${YELLOW}[STEP 2/8] Cloning Repository...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}Directory already exists. Pulling latest changes...${NC}"
    cd "$PROJECT_DIR"
    git pull origin main
    cd ..
else
    git clone "$REPO_URL" "$PROJECT_DIR"
fi
echo -e "${GREEN}✓ Repository cloned/updated${NC}"
echo ""

# Step 3: Navigate to project directory
echo -e "${YELLOW}[STEP 3/8] Setting up Project Structure...${NC}"
cd "$PROJECT_DIR"
PROJECT_PATH=$(pwd)
echo "Project path: $PROJECT_PATH"

# Create necessary directories
mkdir -p data/mysql
mkdir -p data/moodle
mkdir -p logs
mkdir -p backups
mkdir -p screenshots

echo -e "${GREEN}✓ Directory structure created${NC}"
echo ""

# Step 4: Setup Environment Variables
echo -e "${YELLOW}[STEP 4/8] Creating Environment File...${NC}"
if [ ! -f .env.production ]; then
    cat > .env.production << 'EOF'
# ==========================================
# SCL-Institute Environment Configuration
# ==========================================

# Database Configuration
DB_HOST=scli-mysql-prod
DB_PORT=3306
DB_NAME=scl_institute
DB_USER=scl_admin
DB_PASSWORD=securePassword123!
MYSQL_ROOT_PASSWORD=rootPassword123!

# Backend API Configuration
BACKEND_PORT=4000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key_change_this_in_production
API_URL=http://localhost:4000

# Frontend Configuration
FRONTEND_PORT=3000
REACT_APP_API_URL=http://localhost:4000/api

# Moodle Configuration
MOODLE_PORT=8080
MOODLE_ADMIN_USER=admin
MOODLE_ADMIN_PASSWORD=Moodle@123
MOODLE_SITENAME=SCL Institute LMS

# Domain Configuration
DOMAIN=sclsandbox.xyz
LMS_DOMAIN=lms.sclsandbox.xyz
API_DOMAIN=api.sclsandbox.xyz

# Docker Network
DOCKER_NETWORK=scl-network-prod

# SSL Configuration
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem

# Logging
LOG_LEVEL=info
LOG_DIR=/var/log/scl-institute

# Server Configuration
SERVER_IP=185.211.6.60
TIMEZONE=UTC

EOF
    echo -e "${GREEN}✓ Environment file created${NC}"
else
    echo -e "${YELLOW}✓ Environment file already exists${NC}"
fi
echo ""

# Step 5: Create Database Backup Directory
echo -e "${YELLOW}[STEP 5/8] Creating Database Structure...${NC}"
if [ -f database_schema.sql ]; then
    echo -e "${YELLOW}Database schema found. It will be loaded automatically when MySQL container starts.${NC}"
    cp database_schema.sql data/mysql/000-init.sql
    echo -e "${GREEN}✓ Database schema prepared${NC}"
else
    echo -e "${RED}⚠ database_schema.sql not found in project root${NC}"
fi
echo ""

# Step 6: Create Docker Network and Containers
echo -e "${YELLOW}[STEP 6/8] Starting Docker Containers...${NC}"
if [ -f docker-compose.prod.yml ]; then
    docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml up -d
    echo -e "${GREEN}✓ Docker containers started${NC}"
else
    echo -e "${RED}✗ docker-compose.prod.yml not found${NC}"
    exit 1
fi
echo ""

# Step 7: Wait for Services to be Ready
echo -e "${YELLOW}[STEP 7/8] Waiting for Services to Start (this may take 2-3 minutes)...${NC}"
sleep 30

# Check MySQL
echo "Checking MySQL..."
for i in {1..30}; do
    if docker exec scli-mysql-prod mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ MySQL is ready${NC}"
        break
    fi
    echo "Waiting for MySQL... ($i/30)"
    sleep 5
done

# Check if database exists and create if needed
docker exec scli-mysql-prod mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME;" >/dev/null 2>&1 || {
    echo "Creating database..."
    docker exec scli-mysql-prod mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE $DB_NAME;"
}

sleep 10

# Check Backend
echo "Checking Backend API..."
if [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4000/health)" = "200" ]; then
    echo -e "${GREEN}✓ Backend API is ready${NC}"
else
    echo -e "${YELLOW}⚠ Backend API may still be starting...${NC}"
fi

# Check Frontend
echo "Checking Frontend..."
if [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is ready${NC}"
else
    echo -e "${YELLOW}⚠ Frontend may still be starting...${NC}"
fi

# Check Moodle
echo "Checking Moodle LMS..."
if [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080)" = "200" ]; then
    echo -e "${GREEN}✓ Moodle LMS is ready${NC}"
else
    echo -e "${YELLOW}⚠ Moodle may still be starting...${NC}"
fi

echo ""

# Step 8: Display Summary
echo -e "${YELLOW}[STEP 8/8] Setup Complete!${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SCL-Institute System Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  Frontend:  ${YELLOW}http://localhost:3000${NC}"
echo -e "  Backend:   ${YELLOW}http://localhost:4000${NC}"
echo -e "  Moodle:    ${YELLOW}http://localhost:8080${NC}"
echo -e "  Database:  ${YELLOW}localhost:3306${NC}"
echo ""
echo -e "${BLUE}Default Credentials:${NC}"
echo -e "  Database User: ${YELLOW}$DB_USER${NC}"
echo -e "  Database Pass: ${YELLOW}$DB_PASSWORD${NC}"
echo -e "  Moodle Admin:  ${YELLOW}${MOODLE_ADMIN_USER}${NC} / ${YELLOW}Moodle@123${NC}"
echo ""
echo -e "${BLUE}Docker Containers:${NC}"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Update .env.production with your actual domain and credentials"
echo "2. Configure SSL certificates in nginx/ssl/"
echo "3. Set up proper database backups"
echo "4. Configure NGINX domains pointing to this server"
echo "5. Check logs: docker-compose logs -f"
echo "6. Verify database: mysql -h 127.0.0.1 -u $DB_USER -p"
echo ""
echo -e "${GREEN}✓ Setup Complete!${NC}"
