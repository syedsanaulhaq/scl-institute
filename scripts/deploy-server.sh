#!/bin/bash
# ============================================================================
# SCL Institute Production Server Setup Script
# ============================================================================
# This script will:
# 1. Install Docker and Docker Compose
# 2. Clone/Pull the project code
# 3. Setup environment files
# 4. Build and start all production containers
# 5. Verify services are running
# ============================================================================

set -e

echo "======================================================================"
echo "SCL Institute - Production Server Setup"
echo "======================================================================"
echo ""
echo "Server IP: 185.211.6.60"
echo "Frontend Domain: sclsandbox.xyz"
echo "LMS Domain: lms.sclsandbox.xyz"
echo "Backend API: http://185.211.6.60/api"
echo ""
echo "======================================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "This script must be run as root"
    exit 1
fi

# Step 1: Update system
print_status "Updating system packages..."
apt-get update
apt-get upgrade -y

# Step 2: Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    print_status "Docker installed successfully"
else
    print_status "Docker already installed"
fi

# Step 3: Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose already installed"
fi

# Step 4: Create project directory
PROJECT_DIR="/opt/scl-institute"
print_status "Creating project directory: $PROJECT_DIR"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Step 5: Clone or pull repository
print_status "Setting up project repository..."
if [ -d "$PROJECT_DIR/.git" ]; then
    print_status "Repository exists, pulling latest changes..."
    git pull origin main
else
    print_status "Cloning repository..."
    git clone https://github.com/syedsanaulhaq/scl-institute.git .
fi

# Step 6: Verify main branch
print_status "Checking out main branch..."
git checkout main
git pull origin main

# Step 7: Create/Update .env.production
print_status "Setting up .env.production..."
if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    print_error "ERROR: .env.production template not found!"
    exit 1
fi
print_status ".env.production file ready"
cp .env.production .env
print_status "Copied .env.production to .env for Docker Compose"

# Step 8: Create necessary directories
print_status "Creating data directories..."
mkdir -p $PROJECT_DIR/data/{mysql,moodle,moodle-db}
chmod 755 $PROJECT_DIR/data/*

# Step 9: Create log directory
print_status "Creating log directory..."
mkdir -p /var/log/nginx
touch /var/log/nginx/access.log /var/log/nginx/error.log
chmod 644 /var/log/nginx/*.log

# Step 10: Build and start containers
print_status "Building Docker images..."
docker-compose -f $PROJECT_DIR/docker-compose.prod.yml build --no-cache

print_status "Starting production containers..."
docker-compose -f $PROJECT_DIR/docker-compose.prod.yml up -d

# Step 11: Wait for services to be healthy
print_status "Waiting for services to start..."
sleep 10

# Step 12: Verify services
print_status "Verifying services..."
echo ""

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

# Step 13: Apply Moodle Reverse Proxy Fix (Auto-HTTPS)
print_status "Applying Moodle SSL Proxy settings..."
MAX_RETRIES=30
COUNT=0
MOODLE_CONTAINER="scli-moodle-prod"

while [ $COUNT -lt $MAX_RETRIES ]; do
    if docker exec $MOODLE_CONTAINER ls /opt/bitnami/moodle/config.php >/dev/null 2>&1; then
        print_status "Found Moodle config.php! Applying SSL fix..."
        # Append reverse proxy settings ensuring no duplication
        docker exec $MOODLE_CONTAINER bash -c "grep -q 'reverseproxy' /opt/bitnami/moodle/config.php || echo \"\\\$CFG->sslproxy = true; \\\$CFG->reverseproxy = true;\" >> /opt/bitnami/moodle/config.php"
        print_status "SSL Fix applied. Restarting Moodle..."
        docker restart $MOODLE_CONTAINER
        break
    else
        echo "Waiting for Moodle to initialize... ($COUNT/$MAX_RETRIES)"
        sleep 5
        COUNT=$((COUNT+1))
    fi
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    print_warning "Timed out waiting for Moodle config. You may need to run the fix manually."
fi
echo "======================================================================"
echo "Setup Complete!"
echo "======================================================================"
echo ""

if [ $FAILED -eq 0 ]; then
    print_status "All services are running successfully!"
    echo ""
    echo "Access your services at:"
    echo "  - Frontend:     http://sclsandbox.xyz"
    echo "  - LMS:          http://lms.sclsandbox.xyz"
    echo "  - API (IP):     http://185.211.6.60/api"
    echo "  - API (Domain): http://sclsandbox.xyz/api"
    echo ""
    echo "Next steps:"
    echo "  1. Update DNS records to point to this server (185.211.6.60)"
    echo "  2. Configure SSL certificates (recommended)"
    echo "  3. Setup log rotation and monitoring"
    echo "  4. Configure database backups"
    echo ""
    echo "View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "Stop services: docker-compose -f docker-compose.prod.yml down"
    echo ""
else
    print_error "$FAILED service(s) failed to start"
    echo ""
    echo "View logs with:"
    echo "  docker-compose -f $PROJECT_DIR/docker-compose.prod.yml logs"
    exit 1
fi

echo "======================================================================"
