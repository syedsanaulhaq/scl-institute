#!/bin/bash

# ===============================================
# SCL-Institute Development Environment Setup
# For Linux/macOS - Docker
# Version 1.0
# Created: January 28, 2026
# ===============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SCL-Institute DEVELOPMENT Setup v1.0              ║${NC}"
echo -e "${BLUE}║  Docker Edition (Hot Reload + Live Development)    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "    1. Docker and Docker Compose must be installed"
echo "    2. This setup is for DEVELOPMENT (not production)"
echo "    3. Hot-reload enabled for frontend/backend code"
echo "    4. Ports: Frontend 3000, Backend 4000, Moodle 9090, MySQL 33061"
echo ""
sleep 2

# Step 1: Check Prerequisites
echo -e "${YELLOW}[STEP 1/8] Checking Prerequisites...${NC}"
command -v git >/dev/null 2>&1 || { echo -e "${RED}Git not found${NC}"; exit 1; }
echo -e "${GREEN}✓ Git found${NC}"

command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker not found${NC}"; exit 1; }
echo -e "${GREEN}✓ Docker found${NC}"

command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Docker Compose not found${NC}"; exit 1; }
echo -e "${GREEN}✓ Docker Compose found${NC}"
echo ""

# Step 2: Clone or Update Repository
echo -e "${YELLOW}[STEP 2/8] Cloning/Updating Repository...${NC}"
REPO_URL="https://github.com/syedsanaulhaq/scl-institute.git"
PROJECT_DIR="scl-institute"

if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}Directory exists. Pulling latest changes...${NC}"
    cd "$PROJECT_DIR"
    git pull origin main
    cd ..
else
    git clone "$REPO_URL" "$PROJECT_DIR"
fi
echo -e "${GREEN}✓ Repository ready${NC}"
echo ""

# Step 3: Setup Directory Structure
echo -e "${YELLOW}[STEP 3/8] Setting up Project Structure...${NC}"
cd "$PROJECT_DIR"

mkdir -p data/mysql data/moodle logs backups screenshots
echo -e "${GREEN}✓ Directory structure created${NC}"
echo ""

# Step 4: Verify Environment Files
echo -e "${YELLOW}[STEP 4/8] Verifying Development Environment Files...${NC}"
if [ -f ".env.development" ]; then
    echo -e "${GREEN}✓ .env.development found${NC}"
else
    echo -e "${RED}✗ .env.development not found${NC}"
    exit 1
fi

if [ -f "docker-compose.dev.yml" ]; then
    echo -e "${GREEN}✓ docker-compose.dev.yml found${NC}"
else
    echo -e "${RED}✗ docker-compose.dev.yml not found${NC}"
    exit 1
fi
echo ""

# Step 5: Prepare Database Schema
echo -e "${YELLOW}[STEP 5/8] Preparing Database Schema...${NC}"
if [ -f "database_schema.sql" ]; then
    cp database_schema.sql data/mysql/000-init.sql
    echo -e "${GREEN}✓ Database schema prepared${NC}"
else
    echo -e "${YELLOW}⚠ database_schema.sql not found${NC}"
fi
echo ""

# Step 6: Load Development Environment
echo -e "${YELLOW}[STEP 6/8] Loading Development Environment...${NC}"
echo "Using environment file: .env.development"

# Copy .env.development to .env
cp .env.development .env
echo -e "${GREEN}✓ Environment configured for development${NC}"
echo ""

# Step 7: Start Docker Containers
echo -e "${YELLOW}[STEP 7/8] Starting Development Containers...${NC}"
echo "ℹ️  Using docker-compose.dev.yml for development setup"
echo "   • Hot-reload enabled for code changes"
echo "   • Source code mounted in containers"
echo "   • Development database configuration"
echo "   • This may take 2-3 minutes on first run..."
echo ""

docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.dev.yml up -d
echo -e "${GREEN}✓ Development containers started${NC}"
echo ""

# Step 8: Wait for Services and Display Summary
echo -e "${YELLOW}[STEP 8/8] Finalizing Development Setup...${NC}"
echo "Waiting for services to start (45 seconds)..."
sleep 45

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  SCL-Institute DEVELOPMENT Ready on Docker!        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}✨ Development Environment Access:${NC}"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:4000"
echo "  Moodle:    http://localhost:9090"
echo "  MySQL:     localhost:33061"
echo ""

echo -e "${BLUE}🔐 Development Credentials:${NC}"
echo "  Database User: scl_user"
echo "  Database Pass: scl_password"
echo "  Moodle Admin:  admin / SCLInst!2026"
echo ""

echo -e "${BLUE}⚙️  Development Features:${NC}"
echo "  ✓ Hot-reload enabled (code changes auto-reflected)"
echo "  ✓ Source code mounted in containers"
echo "  ✓ Interactive debugging supported"
echo "  ✓ Database accessible from localhost:33061"
echo "  ✓ Logs available in real-time"
echo ""

echo -e "${BLUE}📊 Running Containers:${NC}"
docker-compose -f docker-compose.dev.yml ps
echo ""

echo -e "${BLUE}💡 Development Commands:${NC}"
echo "  View logs:        docker-compose -f docker-compose.dev.yml logs -f"
echo "  Stop services:    docker-compose -f docker-compose.dev.yml down"
echo "  Restart services: docker-compose -f docker-compose.dev.yml restart"
echo "  Database shell:   docker exec -it scli-mysql-dev mysql -u scl_user -p"
echo ""

echo -e "${GREEN}✓ Development Environment Ready!${NC}"
echo -e "${BLUE}📖 For more details, see: DEVELOPMENT_GUIDE.md${NC}"
echo ""

cd ..
