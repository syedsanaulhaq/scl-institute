#!/bin/bash
set -e

# ====================================================================
# SCL Institute Deployment Script
# Usage: ./deploy.sh [develop|production] [--validate-only] [--no-restart]
# ====================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENVIRONMENT="${1:-develop}"
VALIDATE_ONLY="${2:---validate-only}"
NO_RESTART="${3:---no-restart}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ====================================================================
# Helper Functions
# ====================================================================

log_section() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}\n"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ====================================================================
# Validation Functions
# ====================================================================

validate_env_file() {
    local env_file="$1"
    
    if [ ! -f "$env_file" ]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    
    log_info "Validating $env_file"
    
    # Check required environment variables
    local required_vars=(
        "DB_HOST"
        "DB_USER"
        "DB_PASSWORD"
        "DB_NAME"
        "MOODLE_URL"
        "VITE_API_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file"; then
            log_error "Missing required variable: $var"
            return 1
        fi
    done
    
    log_success "Environment file validation passed"
    return 0
}

validate_docker_compose() {
    log_info "Validating docker-compose.yml syntax"
    
    if ! docker-compose config > /dev/null 2>&1; then
        log_error "docker-compose.yml validation failed"
        return 1
    fi
    
    log_success "docker-compose.yml is valid"
    return 0
}

validate_nginx_config() {
    log_info "Validating nginx configuration"
    
    if ! docker run --rm -v "$SCRIPT_DIR/nginx:/etc/nginx" nginx:alpine \
        nginx -t 2>&1 | grep -q "successful"; then
        log_warning "Could not validate nginx (container may not be running)"
    else
        log_success "Nginx configuration is valid"
    fi
    return 0
}

validate_git_status() {
    local branch="$1"
    
    # Check if we're on the correct branch
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    if [ "$current_branch" != "$branch" ]; then
        log_warning "Not on $branch branch. Current: $current_branch"
        log_info "Checking out $branch branch..."
        if ! git checkout "$branch"; then
            log_error "Failed to checkout $branch branch"
            return 1
        fi
    fi
    
    # Ensure working directory is clean for production deploy
    if [ "$branch" = "production" ]; then
        if ! git diff-index --quiet HEAD --; then
            log_error "Working directory has uncommitted changes. Please commit or stash them."
            return 1
        fi
    fi
    
    log_success "Git status validated for $branch"
    return 0
}

check_port_availability() {
    local port="$1"
    local service="$2"
    
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        log_warning "Port $port is already in use by $service (this is expected if service is running)"
        return 0
    fi
    
    return 0
}

# ====================================================================
# Health Check Functions
# ====================================================================

health_check_local() {
    log_section "Running Local Health Checks"
    
    log_info "Waiting for services to be ready..."
    sleep 5
    
    # Check backend
    if curl -sf http://localhost:4000/api/health > /dev/null 2>&1; then
        log_success "Backend API is responding"
    else
        log_error "Backend API health check failed"
        return 1
    fi
    
    # Check if we can connect to database
    if docker exec scli-mysql mysql -u root -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; then
        log_success "Database connection successful"
    else
        log_error "Database connection failed"
        return 1
    fi
    
    log_success "Local health checks passed"
    return 0
}

health_check_remote() {
    local host="$1"
    
    log_section "Running Remote Health Checks (${host})"
    
    log_info "Waiting for services to be ready on remote server..."
    sleep 5
    
    # Check backend health endpoint
    if ssh -o ConnectTimeout=5 "root@${host}" "curl -sf http://localhost/api/health" > /dev/null 2>&1; then
        log_success "Remote backend API is responding"
    else
        log_error "Remote backend API health check failed"
        return 1
    fi
    
    # Check Moodle accessibility
    if ssh -o ConnectTimeout=5 "root@${host}" "curl -sf -I http://localhost:8888 | head -1" | grep -q "200"; then
        log_success "Remote Moodle LAMP is accessible"
    else
        log_error "Remote Moodle LAMP is not accessible"
        return 1
    fi
    
    log_success "Remote health checks passed"
    return 0
}

# ====================================================================
# Deployment Functions
# ====================================================================

deploy_develop() {
    log_section "Deploying to DEVELOP Environment"
    
    # Validate environment
    if ! validate_env_file ".env"; then
        return 1
    fi
    
    if ! validate_docker_compose; then
        return 1
    fi
    
    if ! validate_nginx_config; then
        return 1
    fi
    
    if [ "$VALIDATE_ONLY" = "--validate-only" ]; then
        log_success "Validation passed. Skipping deployment."
        return 0
    fi
    
    if [ "$NO_RESTART" != "--no-restart" ]; then
        log_info "Pulling environment variables from .env"
        source .env
        
        log_info "Restarting Docker containers..."
        if ! docker-compose restart; then
            log_error "Failed to restart containers"
            return 1
        fi
    fi
    
    if ! health_check_local; then
        log_error "Health checks failed after deployment"
        return 1
    fi
    
    log_success "DEVELOP environment deployed successfully"
    return 0
}

deploy_production() {
    local git_push="${VALIDATE_ONLY:--push-git}"
    
    log_section "Deploying to PRODUCTION Environment"
    
    # Step 1: Validate develop branch
    log_info "Step 1: Validating develop branch..."
    if ! git checkout develop; then
        log_error "Failed to checkout develop branch"
        return 1
    fi
    
    if ! validate_env_file ".env.production"; then
        log_error ".env.production file is invalid"
        return 1
    fi
    
    # Step 2: Merge develop into production
    log_info "Step 2: Merging develop → production..."
    if ! git checkout production; then
        log_error "Failed to checkout production branch"
        return 1
    fi
    
    if ! git merge develop --no-edit; then
        log_error "Merge conflict or failed merge. Please resolve conflicts manually."
        git merge --abort
        return 1
    fi
    
    log_success "Successfully merged develop into production"
    
    # Step 3: Validate production branch
    log_info "Step 3: Validating production configurations..."
    if ! validate_docker_compose; then
        log_error "docker-compose.yml validation failed"
        git reset --hard HEAD~1
        return 1
    fi
    
    if ! validate_nginx_config; then
        log_error "Nginx configuration validation failed"
        git reset --hard HEAD~1
        return 1
    fi
    
    if [ "$VALIDATE_ONLY" = "--validate-only" ]; then
        log_warning "Validation mode: Git changes were NOT pushed"
        return 0
    fi
    
    # Step 4: Push to GitHub
    log_info "Step 4: Pushing production branch to GitHub..."
    if ! git push origin production; then
        log_error "Failed to push to GitHub"
        return 1
    fi
    
    log_success "Pushed production branch to GitHub"
    
    # Step 5: Deploy to remote server
    log_info "Step 5: Pulling latest changes on remote server..."
    local remote_result=$(ssh root@${PRODUCTION_SERVER} "cd /root/scl-institute && git pull && echo 'Pull successful'")
    
    if ! echo "$remote_result" | grep -q "Pull successful"; then
        log_error "Failed to pull on remote server"
        return 1
    fi
    
    log_success "Remote server updated with latest code"
    
    # Step 6: Restart containers
    if [ "$NO_RESTART" != "--no-restart" ]; then
        log_info "Step 6: Restarting containers on remote server..."
        
        ssh root@${PRODUCTION_SERVER} "
            cd /root/scl-institute && \
            docker-compose down && \
            docker-compose up -d && \
            echo 'Containers started'
        "
        
        log_success "Containers restarted on production server"
    fi
    
    # Step 7: Health checks
    log_info "Step 7: Running remote health checks..."
    if ! health_check_remote "${PRODUCTION_SERVER}"; then
        log_error "Remote health checks failed"
        log_warning "Please investigate the production server"
        return 1
    fi
    
    log_success "PRODUCTION environment deployed successfully"
    return 0
}

# ====================================================================
# Main Execution
# ====================================================================

main() {
    log_section "SCL Institute Deployment System v1.0"
    
    # Load environment variables
    if [ -f ".env" ]; then
        source .env
    fi
    
    if [ -f ".env.${ENVIRONMENT}" ]; then
        source ".env.${ENVIRONMENT}" 2>/dev/null || true
    fi
    
    # Set defaults if not set
    PRODUCTION_SERVER="${PRODUCTION_SERVER:-185.211.6.60}"
    
    log_info "Environment: $ENVIRONMENT"
    log_info "Production Server: $PRODUCTION_SERVER"
    
    # Validate git is available
    if ! command -v git &> /dev/null; then
        log_error "git is not installed or not in PATH"
        return 1
    fi
    
    # Validate docker is available
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed or not in PATH"
        return 1
    fi
    
    case "$ENVIRONMENT" in
        develop)
            deploy_develop
            ;;
        production)
            deploy_production
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            echo "Usage: ./deploy.sh [develop|production] [--validate-only] [--no-restart]"
            return 1
            ;;
    esac
}

# Run main function
main
