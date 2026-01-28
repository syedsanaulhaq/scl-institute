#!/bin/bash

# ===============================================
# SCL-Institute Fresh Development Reset Script
# For Linux/macOS (Bash)
# Version 1.0
# Created: January 28, 2026
# ===============================================

# ⚠️ WARNING: This script will DELETE all existing containers and data!

set -e

PROJECT_PATH="${1:-scl-institute}"
GIT_REPO="${2:-https://github.com/syedsanaulhaq/scl-institute.git}"
SKIP_CONFIRMATION="${3:-false}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
write_success() { echo -e "${GREEN}$@${NC}"; }
write_error() { echo -e "${RED}$@${NC}"; }
write_warning() { echo -e "${YELLOW}$@${NC}"; }
write_info() { echo -e "${CYAN}$@${NC}"; }

# Clear screen
clear

write_error "╔════════════════════════════════════════════════════╗"
write_error "║  SCL-Institute FRESH SETUP RESET v1.0              ║"
write_error "║  WARNING: This will DELETE all existing data!       ║"
write_error "╚════════════════════════════════════════════════════╝"
echo ""

write_warning "⚠️  CAUTION - READ CAREFULLY:"
echo ""
write_error "This script will:"
write_error "  1. STOP all running Docker containers"
write_error "  2. DELETE all Docker containers"
write_error "  3. DELETE all Docker volumes (database data)"
write_error "  4. REMOVE the existing project directory"
write_error "  5. CLONE a fresh copy from GitHub"
write_error "  6. START fresh development environment"
echo ""
write_error "All local changes and database data WILL BE LOST!"
echo ""

if [ "$SKIP_CONFIRMATION" != "true" ]; then
    write_warning "DO YOU WANT TO CONTINUE? (Type: YES in UPPERCASE to proceed)"
    echo ""
    echo -n "Your choice: "
    read confirmation
    
    if [ "$confirmation" != "YES" ]; then
        write_info "Setup cancelled. No changes made."
        exit 0
    fi
fi

echo ""
write_info "Starting fresh development environment setup..."
echo ""
sleep 2

# Step 1: Check Prerequisites
write_warning "[STEP 1/9] Checking Prerequisites..."

if ! command -v docker &> /dev/null; then
    write_error "✗ Docker not found. Please install Docker."
    exit 1
fi
write_success "✓ Docker found"

if ! command -v docker-compose &> /dev/null; then
    write_error "✗ Docker Compose not found"
    exit 1
fi
write_success "✓ Docker Compose found"

if ! command -v git &> /dev/null; then
    write_error "✗ Git not found. Please install Git."
    exit 1
fi
write_success "✓ Git found"

# Check if Docker daemon is running
write_info "Checking if Docker daemon is running..."
if ! docker info > /dev/null 2>&1; then
    write_error "✗ Docker daemon is NOT running!"
    write_warning "Please start Docker and try again"
    exit 1
fi
write_success "✓ Docker daemon is running"
echo ""

# Step 2: Stop and Remove Existing Containers
write_warning "[STEP 2/9] Stopping and Removing Existing Containers..."

write_info "Stopping development containers..."
docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
write_success "✓ Development containers stopped"

write_info "Stopping production containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
write_success "✓ Production containers stopped"

echo ""

# Step 3: Remove Docker Volumes
write_warning "[STEP 3/9] Removing Docker Volumes..."

write_info "Finding and removing old volumes..."
volumes=$(docker volume ls -q 2>/dev/null || echo "")
if [ ! -z "$volumes" ]; then
    while IFS= read -r volume; do
        if [[ "$volume" =~ scl|dev|mysql|moodle ]]; then
            write_info "Removing volume: $volume"
            docker volume rm "$volume" 2>/dev/null || true
        fi
    done <<< "$volumes"
    write_success "✓ Old volumes removed"
else
    write_info "No SCL volumes found to remove"
fi
echo ""

# Step 4: Remove Old Project Directory
write_warning "[STEP 4/9] Cleaning Up Old Project..."

if [ -d "$PROJECT_PATH" ]; then
    write_info "Removing existing project directory: $PROJECT_PATH"
    rm -rf "$PROJECT_PATH"
    write_success "✓ Old project directory removed"
    sleep 2
else
    write_info "Project directory does not exist (fresh start)"
fi
echo ""

# Step 5: Clone Fresh Repository
write_warning "[STEP 5/9] Cloning Fresh Repository..."

write_info "Cloning from GitHub: $GIT_REPO"
git clone "$GIT_REPO" "$PROJECT_PATH"

if [ $? -ne 0 ]; then
    write_error "✗ Failed to clone repository"
    exit 1
fi

write_success "✓ Repository cloned successfully"
echo ""

# Step 6: Setup Directory Structure
write_warning "[STEP 6/9] Setting up Project Structure..."

cd "$PROJECT_PATH"

dirs=(
    "data/mysql"
    "data/moodle"
    "logs"
    "backups"
    "screenshots"
)

for dir in "${dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        write_info "✓ Created: $dir"
    fi
done

write_success "✓ Directory structure ready"
echo ""

# Step 7: Setup Environment
write_warning "[STEP 7/9] Configuring Development Environment..."

if [ ! -f ".env.development" ]; then
    write_error "✗ .env.development not found in cloned repository"
    exit 1
fi

cp .env.development .env
write_success "✓ Development environment configured"

if [ -f "database_schema.sql" ]; then
    cp database_schema.sql data/mysql/000-init.sql
    write_success "✓ Database schema prepared"
fi

echo ""

# Step 8: Start Fresh Development Environment
write_warning "[STEP 8/9] Starting Fresh Development Containers..."

write_info "Building and starting fresh containers (this may take 2-3 minutes)..."
docker-compose -f docker-compose.dev.yml up -d

if [ $? -ne 0 ]; then
    write_error "✗ Failed to start containers"
    exit 1
fi

write_success "✓ Fresh development containers started"
echo ""

# Step 9: Verify and Display Summary
write_warning "[STEP 9/9] Verifying Fresh Setup..."

write_info "Waiting for services to start (45 seconds)..."
sleep 45

write_info "Checking service status..."
echo ""

write_success "╔════════════════════════════════════════════════════╗"
write_success "║  Fresh Development Environment Ready!              ║"
write_success "╚════════════════════════════════════════════════════╝"
echo ""

write_info "✨ Development Environment Access:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:4000"
echo "  Moodle:    http://localhost:9090"
echo "  MySQL:     localhost:33061"
echo ""

write_info "🔐 Fresh Development Credentials:"
echo "  Database User: scl_user"
echo "  Database Pass: scl_password"
echo "  Moodle Admin:  admin / SCLInst!2026"
echo ""

write_info "📊 Running Containers Status:"
docker-compose -f docker-compose.dev.yml ps
echo ""

write_info "💡 Quick Commands:"
echo "  View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "  Stop all: docker-compose -f docker-compose.dev.yml down"
echo "  Restart: docker-compose -f docker-compose.dev.yml restart"
echo "  Check DB: docker exec -it scli-mysql-dev mysql -u scl_user -p"
echo ""

write_success "✓ Fresh Development Environment Ready!"
write_info "📖 Next: Start coding with hot-reload enabled!"
echo ""

write_warning "⚠️  Important Notes:"
echo "  • All previous data has been deleted"
echo "  • This is a completely fresh installation"
echo "  • Database is empty (37 tables created automatically)"
echo "  • Source code is mounted for hot-reload"
echo ""

cd - > /dev/null
