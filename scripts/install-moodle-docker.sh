#!/bin/bash
# Deploy Moodle 4.4 with Docker on Ubuntu 22.04
# Handles fresh LAMP server cleanup and Docker setup

set -e

echo "======================================"
echo "Moodle 4.4 Docker Installation"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose-moodle.prod.yml"
ENV_FILE="$PROJECT_ROOT/.env"

echo -e "${YELLOW}[1/8] Checking prerequisites...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed${NC}"
    echo "Install Docker:"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not installed${NC}"
    echo "Install Docker Compose:"
    echo "  sudo apt install -y docker-compose"
    exit 1
fi

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ .env file not found at $ENV_FILE${NC}"
    echo "Please create .env file with database credentials"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose installed${NC}"
echo ""

echo -e "${YELLOW}[2/8] Stopping existing containers...${NC}"
docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true
echo -e "${GREEN}✅ Stopped${NC}"
echo ""

echo -e "${YELLOW}[3/8] Removing old volumes (fresh start)...${NC}"
docker volume prune -f > /dev/null 2>&1 || true
echo -e "${GREEN}✅ Cleaned${NC}"
echo ""

echo -e "${YELLOW}[4/8] Building Moodle 4.4 Docker image...${NC}"
echo "This may take several minutes..."
if docker-compose -f "$COMPOSE_FILE" build --no-cache scli-moodle 2>&1 | tee /tmp/build.log; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed, check /tmp/build.log${NC}"
    cat /tmp/build.log
    exit 1
fi
echo ""

echo -e "${YELLOW}[5/8] Starting all services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d
echo -e "${GREEN}✅ Services started${NC}"
echo ""

echo -e "${YELLOW}[6/8] Waiting for services to be healthy...${NC}"
echo "This may take 60-120 seconds..."

# Wait for Moodle to be healthy
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec scli-moodle-prod curl -f http://localhost/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Moodle is healthy${NC}"
        break
    fi
    attempt=$((attempt+1))
    echo "  Attempt $attempt/$max_attempts..."
    sleep 4
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${YELLOW}⚠️  Moodle still initializing, check logs with:${NC}"
    echo "  docker logs scli-moodle-prod"
fi
echo ""

echo -e "${YELLOW}[7/8] Verifying database connection...${NC}"
if docker-compose -f "$COMPOSE_FILE" exec -T scli-moodle-db-prod mysqladmin ping -h localhost -u root -p$(grep MARIADB_ROOT_PASSWORD "$ENV_FILE" | cut -d= -f2) > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connected${NC}"
else
    echo -e "${YELLOW}⚠️  Database check skipped (may still be initializing)${NC}"
fi
echo ""

echo -e "${YELLOW}[8/8] Service status check...${NC}"
docker-compose -f "$COMPOSE_FILE" ps
echo ""

echo "======================================"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo "======================================"
echo ""
echo "📋 Moodle Installation Credentials:"
source "$ENV_FILE"
echo "  URL: http://185.211.6.60:8080"
echo "  Admin User: $MOODLE_USERNAME"
echo "  Admin Password: $MOODLE_PASSWORD"
echo "  Database Host: scli-moodle-db-prod"
echo "  Database User: $MARIADB_USER"
echo "  Database Name: $MARIADB_DATABASE"
echo ""
echo "🌐 Access Methods:"
echo "  Direct: http://185.211.6.60:8080"
echo "  Via NGINX: http://lms.sclsandbox.xyz (when configured)"
echo ""
echo "📊 View Logs:"
echo "  docker-compose -f $COMPOSE_FILE logs -f scli-moodle"
echo ""
echo "🔄 Restart Services:"
echo "  docker-compose -f $COMPOSE_FILE restart"
echo ""
echo "⚠️  Note: If you see connection errors, wait a few more seconds and refresh"
echo "======================================"
