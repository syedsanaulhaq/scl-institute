#!/bin/bash
# ============================================
# PRODUCTION PULL & RESTART SCRIPT
# ============================================
# Purpose: Run on production server to pull latest code and restart
# Location: /home/scl-institute/pull-and-restart.sh
# Usage: ./pull-and-restart.sh [optional: --force-restart]
#
# REQUIRED ENVIRONMENT VARIABLES:
# MYSQL_ROOT_PASSWORD - MySQL root password (set before running)

set -e

# ============================================
# ENVIRONMENT VARIABLES
# ============================================
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-}" 

if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    echo "ERROR: MYSQL_ROOT_PASSWORD environment variable not set"
    echo "To fix, run: export MYSQL_ROOT_PASSWORD='your-password'"
    exit 1
fi

REPO_DIR="/home/scl-institute"
LOG_FILE="/var/log/scl-deployment.log"
DB_MIGRATION_DIR="$REPO_DIR/database/migrations"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a $LOG_FILE
}

log "INFO" "=========================================="
log "INFO" "PRODUCTION PULL & RESTART STARTED"
log "INFO" "=========================================="

# Verify repository exists
if [ ! -d "$REPO_DIR/.git" ]; then
    log "ERROR" "Git repository not found at $REPO_DIR"
    exit 1
fi

cd "$REPO_DIR"

# Check current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
log "INFO" "Current branch: $current_branch"

# Verify we're on production branch
if [ "$current_branch" != "production" ]; then
    log "ERROR" "Not on production branch. Current: $current_branch"
    exit 1
fi

# Show current code version
log "INFO" "Current production commit:"
git log --oneline -1

# Store previous commit for rollback reference
previous_commit=$(git rev-parse --short HEAD)
previous_tag="rollback_$(date +%Y%m%d_%H%M%S)_from_$previous_commit"

log "INFO" "Creating rollback checkpoint: $previous_tag"
git tag "$previous_tag"
git push origin "$previous_tag"

# Pull latest production branch
log "INFO" "Pulling latest changes from GitHub..."
if ! git pull origin production; then
    log "ERROR" "Failed to pull from origin. Check network connection."
    exit 1
fi

# Show new version
log "INFO" "New production commit:"
git log --oneline -1

# Check for database migrations
log "INFO" "Checking for database migrations..."
if [ -d "$DB_MIGRATION_DIR" ]; then
    # Find new migration files compared to previous commit
    migration_files=$(git diff $previous_commit..HEAD --name-only -- "$DB_MIGRATION_DIR" 2>/dev/null || echo "")
    
    if [ -n "$migration_files" ]; then
        log "INFO" "Database migrations detected:"
        echo "$migration_files" | tee -a $LOG_FILE
        
        log "INFO" "Applying database migrations..."
        for migration_file in $migration_files; do
            if [ -f "$migration_file" ] && [ "${migration_file##*.}" = "sql" ]; then
                log "INFO" "Applying: $migration_file"
                mysql -u root -p"${MYSQL_ROOT_PASSWORD}" scl_institute < "$migration_file"
                if [ $? -eq 0 ]; then
                    log "INFO" "✅ Applied: $migration_file"
                else
                    log "ERROR" "❌ Failed to apply: $migration_file"
                    exit 1
                fi
                
                # Also check for moodle migrations
                if grep -q "moodle\|mdl_" "$migration_file"; then
                    log "INFO" "Also applying to Moodle database"
                    mysql -u root -p"${MYSQL_ROOT_PASSWORD}" moodle < "$migration_file" || true
                fi
            fi
        done
        log "SUCCESS" "All database migrations applied"
    else
        log "INFO" "No database migrations found"
    fi
else
    log "INFO" "No migration directory found"
fi

# Rebuild Docker images
log "INFO" "Building Docker images..."
if ! docker-compose build; then
    log "ERROR" "Docker build failed"
    exit 1
fi

log "INFO" "Stopping current containers..."
docker-compose down

log "INFO" "Starting new containers..."
if ! docker-compose up -d; then
    log "ERROR" "Failed to start containers"
    log "WARNING" "Rolling back to previous version: $previous_tag"
    git reset --hard "$previous_tag"
    docker-compose up -d
    exit 1
fi

# Wait for services to stabilize
log "INFO" "Waiting for services to start (10 seconds)..."
sleep 10

# Show container status
log "INFO" "Container status:"
docker-compose ps | tee -a $LOG_FILE

# Optional health checks
log "INFO" "Performing health checks..."

# Check MySQL
if ! docker-compose exec -T scli-mysql mysqladmin ping -u root -prootpassword > /dev/null 2>&1; then
    log "ERROR" "MySQL health check failed"
    exit 1
fi
log "SUCCESS" "✅ MySQL is healthy"

# Check if backend is responding
sleep 3
if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
    log "SUCCESS" "✅ Backend API is responding"
else
    log "WARNING" "⚠️  Backend API not immediately responding (may take longer to start)"
fi

# Show recent logs
log "INFO" "Recent container logs:"
docker-compose logs --tail=20 | tee -a $LOG_FILE

log "SUCCESS" "=========================================="
log "SUCCESS" "✅ PULL & RESTART COMPLETED SUCCESSFULLY"
log "SUCCESS" "=========================================="
log "INFO" "Deployment completed at $(date)"
log "INFO" "New code version: $(git rev-parse --short HEAD)"
log "INFO" "Rollback available: $previous_tag"

exit 0
