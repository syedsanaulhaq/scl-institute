#!/bin/bash

set -e

echo "==============================================="
echo "SCL Institute - Production Server Setup"
echo "Ubuntu 22.04 LTS - Docker Deployment"
echo "==============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

echo -e "${YELLOW}[1/8]${NC} Updating system packages..."
apt-get update
apt-get upgrade -y

echo -e "${YELLOW}[2/8]${NC} Installing prerequisites..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    apt-transport-https \
    software-properties-common

echo -e "${YELLOW}[3/8]${NC} Installing Docker..."
# Add Docker GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker service
systemctl start docker
systemctl enable docker

echo -e "${YELLOW}[4/8]${NC} Installing Docker Compose (standalone)..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo -e "${YELLOW}[5/8]${NC} Installing Git..."
apt-get install -y git

echo -e "${YELLOW}[6/8]${NC} Cloning SCL Institute repository..."
cd /opt
git clone https://github.com/syedsanaulhaq/scl-institute.git
cd /opt/scl-institute

# Verify we're on the main branch with production config
git checkout main
git pull origin main

echo -e "${YELLOW}[7/8]${NC} Verifying production configuration files..."
if [ ! -f .env.production ]; then
    echo -e "${RED}ERROR: .env.production not found!${NC}"
    echo "Please create .env.production file before running this script."
    exit 1
fi

if [ ! -f docker-compose.prod.yml ]; then
    echo -e "${RED}ERROR: docker-compose.prod.yml not found!${NC}"
    exit 1
fi

if [ ! -d nginx/ssl ]; then
    echo -e "${RED}ERROR: SSL certificates directory not found at nginx/ssl!${NC}"
    echo "Create nginx/ssl directory and add cert.pem and key.pem"
    exit 1
fi

echo -e "${YELLOW}[8/8]${NC} Building and starting all services..."
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo -e "${GREEN}===============================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}===============================================${NC}"
echo ""

# Wait for services to start
echo "Waiting for services to initialize (30 seconds)..."
sleep 30

echo ""
echo -e "${GREEN}Service Status:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${YELLOW}Access Points:${NC}"
echo "  • Frontend:  https://sclsandbox.xyz"
echo "  • API:       https://sclsandbox.xyz/api/"
echo "  • Moodle:    https://lms.sclsandbox.xyz"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Monitor logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "2. Access frontend and test login"
echo "3. Access Moodle and complete setup wizard"
echo "4. Configure Moodle SSO plugin"
echo ""

echo -e "${GREEN}Server setup complete! All services are running.${NC}"
