#!/bin/bash

set -e

echo "==================================================="
echo "SCL Institute - Fresh Server Setup"
echo "Ubuntu 22.04 + Docker"
echo "==================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Must run as root${NC}"
   exit 1
fi

echo -e "${YELLOW}[1/11]${NC} Update system packages..."
apt-get update
apt-get upgrade -y

echo -e "${YELLOW}[2/11]${NC} Install prerequisites..."
apt-get install -y ca-certificates curl gnupg lsb-release apt-transport-https software-properties-common

echo -e "${YELLOW}[3/11]${NC} Install Docker..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl start docker
systemctl enable docker

echo -e "${YELLOW}[4/11]${NC} Install Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo -e "${YELLOW}[5/11]${NC} Install Git..."
apt-get install -y git

echo -e "${YELLOW}[6/11]${NC} Create app directory..."
mkdir -p /opt/scl-institute
cd /opt/scl-institute

echo -e "${YELLOW}[7/11]${NC} Clone repository..."
git clone https://github.com/syedsanaulhaq/scl-institute.git . 2>/dev/null || git pull origin main
git checkout main
git pull origin main

echo -e "${YELLOW}[8/11]${NC} Create SSL certificates..."
mkdir -p nginx/ssl
openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -nodes -subj "/CN=sclsandbox.xyz"
ls -lh nginx/ssl/

echo -e "${YELLOW}[9/11]${NC} Verify environment files..."
if [ ! -f .env.production ]; then
    echo -e "${RED}ERROR: .env.production not found!${NC}"
    echo "Please upload .env.production before running setup"
    exit 1
fi

echo "✓ .env.production found"

if [ ! -f docker-compose.prod.yml ]; then
    echo -e "${RED}ERROR: docker-compose.prod.yml not found!${NC}"
    exit 1
fi

echo "✓ docker-compose.prod.yml found"

echo -e "${YELLOW}[10/11]${NC} Build and deploy containers..."
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

echo -e "${YELLOW}[11/11]${NC} Wait for services..."
sleep 15

echo ""
echo -e "${GREEN}==================================================="
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}==================================================="
echo ""

echo -e "${YELLOW}Current Services:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${YELLOW}Access Endpoints:${NC}"
echo "  • Frontend:    https://sclsandbox.xyz"
echo "  • API Health:  https://sclsandbox.xyz/api/health"
echo "  • Moodle LMS:  https://lms.sclsandbox.xyz"
echo ""

echo -e "${YELLOW}Default Credentials:${NC}"
echo "  • Email:    admin@scl.com"
echo "  • Password: password"
echo ""

echo -e "${YELLOW}Monitor Logs:${NC}"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""

echo -e "${GREEN}Setup script finished! System is initializing...${NC}"
echo "Moodle may take 2-3 minutes to fully start."
echo ""
