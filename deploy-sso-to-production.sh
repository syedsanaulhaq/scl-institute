#!/bin/bash
#
# Deploy SSO Plugin from Develop to Production Moodle
# Deploys moodle-scripts/local/sclsso to production LAMP Moodle
#

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Deploy SSO Plugin to Production${NC}"
echo -e "${YELLOW}========================================${NC}"

# Configuration
LOCAL_SSO_DIR="./moodle-scripts/local/sclsso"
REMOTE_SERVER="root@185.211.6.60"
REMOTE_MOODLE_ROOT="/var/www/moodle-prod"
REMOTE_SSO_DIR="$REMOTE_MOODLE_ROOT/local/sclsso"

echo -e "\n${BLUE}Configuration:${NC}"
echo -e "  Source (local): ${GREEN}$LOCAL_SSO_DIR${NC}"
echo -e "  Target (remote): ${GREEN}$REMOTE_SSO_DIR${NC}"
echo -e "  Server: ${GREEN}$REMOTE_SERVER${NC}"

# Step 1: Verify local SSO files exist
echo -e "\n${YELLOW}[1/5] Verifying local SSO files...${NC}"

if [ ! -d "$LOCAL_SSO_DIR" ]; then
    echo -e "${RED}✗ SSO directory not found: $LOCAL_SSO_DIR${NC}"
    exit 1
fi

required_files=("version.php" "login.php" "lib.php")
for file in "${required_files[@]}"; do
    if [ ! -f "$LOCAL_SSO_DIR/$file" ]; then
        echo -e "${RED}✗ Missing file: $file${NC}"
        exit 1
    fi
    echo -e "${GREEN}  ✓ $file${NC}"
done

echo -e "${GREEN}✓ All SSO files present${NC}"

# Step 2: Verify SSH access
echo -e "\n${YELLOW}[2/5] Verifying SSH access to production...${NC}"

if ! ssh -o ConnectTimeout=5 "$REMOTE_SERVER" "echo 'SSH OK'" > /dev/null 2>&1; then
    echo -e "${RED}✗ Cannot connect to production server${NC}"
    exit 1
fi

echo -e "${GREEN}✓ SSH connection established${NC}"

# Step 3: Backup existing SSO plugin
echo -e "\n${YELLOW}[3/5] Backing up existing SSO plugin...${NC}"

ssh "$REMOTE_SERVER" << 'EOFBACKUP'
BACKUP_DIR="/var/backups/moodle-sso-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -d "/var/www/moodle-prod/local/sclsso" ]; then
    echo "Backing up existing SSO plugin..."
    cp -r "/var/www/moodle-prod/local/sclsso" "$BACKUP_DIR/" || true
    echo "✓ Backup created at: $BACKUP_DIR"
else
    echo "⚠ No existing SSO plugin found"
fi
EOFBACKUP

echo -e "${GREEN}✓ Backup completed${NC}"

# Step 4: Deploy SSO files via SCP
echo -e "\n${YELLOW}[4/5] Uploading SSO plugin files...${NC}"

# Create remote SSO directory
ssh "$REMOTE_SERVER" "mkdir -p $REMOTE_SSO_DIR"

# Copy SSO files
echo -e "${BLUE}  Copying files to $REMOTE_SERVER...${NC}"
scp -r "$LOCAL_SSO_DIR"/* "$REMOTE_SERVER:$REMOTE_SSO_DIR/" \
    || scp -r "$LOCAL_SSO_DIR/" "$REMOTE_SERVER:$REMOTE_MOODLE_ROOT/local/"

echo -e "${GREEN}✓ SSO plugin uploaded${NC}"

# Step 5: Configure permissions and environment
echo -e "\n${YELLOW}[5/5] Configuring permissions and environment...${NC}"

ssh "$REMOTE_SERVER" << 'EOFCONFIG'
set -e

MOODLE_ROOT="/var/www/moodle-prod"
SSO_DIR="$MOODLE_ROOT/local/sclsso"

echo "Setting file permissions..."
sudo chown -R www-data:www-data "$SSO_DIR"
sudo chmod -R 755 "$SSO_DIR"
sudo chmod 644 "$SSO_DIR"/*.php
sudo chmod -R 755 "$SSO_DIR/lang"

echo "✓ Permissions set"

# Update Moodle config.php if not already updated
if ! grep -q "SCL SSO Configuration" "$MOODLE_ROOT/config.php"; then
    echo "Updating Moodle config.php..."
    cat >> "$MOODLE_ROOT/config.php" << 'EOFMOODLECONFIG'

// SCL SSO Configuration
$CFG->sclsso_enabled = true;
$CFG->sclsso_backend_host = getenv('SCL_BACKEND_HOST') ?: '127.0.0.1';
$CFG->sclsso_backend_port = getenv('SCL_BACKEND_PORT') ?: '4000';
$CFG->sclsso_secret = getenv('SSO_SECRET') ?: 'supersecretkey';
EOFMOODLECONFIG
    echo "✓ config.php updated"
else
    echo "✓ config.php already configured"
fi

# Set environment variables in Apache
APACHE_ENVVARS="/etc/apache2/envvars"
if [ -f "$APACHE_ENVVARS" ]; then
    if ! grep -q "export SCL_BACKEND_HOST" "$APACHE_ENVVARS"; then
        echo ""  >> "$APACHE_ENVVARS"
        echo "# SCL SSO Environment Variables" >> "$APACHE_ENVVARS"
        echo "export SCL_BACKEND_HOST=${SCL_BACKEND_HOST:-127.0.0.1}" >> "$APACHE_ENVVARS"
        echo "export SCL_BACKEND_PORT=${SCL_BACKEND_PORT:-4000}" >> "$APACHE_ENVVARS"
        echo "export SSO_SECRET=${SSO_SECRET:-supersecretkey}" >> "$APACHE_ENVVARS"
    fi
fi

# Restart Apache to load new environment variables
echo "Restarting Apache..."
sudo systemctl restart apache2

echo "✓ Apache restarted"
EOFCONFIG

echo -e "${GREEN}✓ Configuration applied${NC}"

# Verification
echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE${NC}"
echo -e "${YELLOW}========================================${NC}"

echo -e "\n${YELLOW}Deployment Summary:${NC}"
echo -e "  SSO Plugin Location: ${GREEN}$REMOTE_SSO_DIR${NC}"
echo -e "  Permission: ${GREEN}755 (rwxr-xr-x)${NC}"
echo -e "  Owner: ${GREEN}www-data:www-data${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "  1. Verify SSO plugin on production:"
echo -e "     ${BLUE}ssh $REMOTE_SERVER \"ls -la $REMOTE_SSO_DIR/\"${NC}"
echo -e ""
echo -e "  2. Check Apache can read SSO files:"
echo -e "     ${BLUE}ssh $REMOTE_SERVER \"curl http://lms.sclsandbox.xyz:8888/local/sclsso/\"${NC}"
echo -e ""
echo -e "  3. Test SSO login flow:"
echo -e "     - Open main dashboard"
echo -e "     - Click 'Learning Management (Moodle)' module"
echo -e "     - Should redirect to Moodle with SSO"
echo -e ""
echo -e "  4. Monitor logs for errors:"
echo -e "     ${BLUE}ssh $REMOTE_SERVER \"sudo tail -f /var/log/apache2/error.log\"${NC}"

echo -e "\n${YELLOW}Troubleshooting:${NC}"
echo -e "  If SSO fails:"
echo -e "    1. Check backend is running: ${BLUE}docker ps${NC}"
echo -e "    2. Verify environment variables:"
echo -e "       ${BLUE}echo \$SCL_BACKEND_HOST && echo \$SSO_SECRET${NC}"
echo -e "    3. Check Moodle logs:"
echo -e "       ${BLUE}tail /var/www/moodle-prod/sso_errors.log${NC}"

echo -e "\n${GREEN}Deployment successful!${NC}\n"
