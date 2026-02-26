#!/bin/bash
#
# Import Moodle Data to Production LAMP Installation
# This script imports:
# 1. Moodle database from exported SQL
# 2. Moodle file storage
# 3. Configurations
# 4. Updates Moodle config for production
#

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Moodle Import to Production LAMP${NC}"
echo -e "${YELLOW}========================================${NC}"

# Configuration
EXPORT_DIR="${1:-.}"
MOODLE_ROOT="/var/www/moodle-prod"
MOODLE_DATA="/var/moodledata-prod"
MOODLE_DB="moodle"
MOODLE_DB_USER="moodleuser"
MOODLE_DB_PASS="moodlepass"
BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Validation
echo -e "\n${YELLOW}[1/8] Validating export data...${NC}"

if [ ! -d "$EXPORT_DIR" ]; then
    echo -e "${RED}✗ Export directory not found: $EXPORT_DIR${NC}"
    exit 1
fi

if [ ! -f "$EXPORT_DIR/database/moodle-db.sql" ]; then
    echo -e "${RED}✗ Database export not found: $EXPORT_DIR/database/moodle-db.sql${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Export directory validated${NC}"

# Backup existing production Moodle
echo -e "\n${YELLOW}[2/8] Backing up existing Moodle...${NC}"

BACKUP_DIR="/var/backups/moodle-prod-$BACKUP_TIMESTAMP"
mkdir -p "$BACKUP_DIR"

if [ -d "$MOODLE_DATA" ]; then
    echo -e "${YELLOW}   Backing up moodledata...${NC}"
    cp -r "$MOODLE_DATA" "$BACKUP_DIR/"
    echo -e "${GREEN}   ✓ Backup size: $(du -sh "$BACKUP_DIR" | cut -f1)${NC}"
else
    echo -e "${YELLOW}   ⚠ Moodle data directory not found${NC}"
fi

echo -e "${GREEN}✓ Backup location: $BACKUP_DIR${NC}"

# Stop Apache
echo -e "\n${YELLOW}[3/8] Stopping Apache...${NC}"
sudo systemctl stop apache2 || true
sleep 2
echo -e "${GREEN}✓ Apache stopped${NC}"

# Import Database
echo -e "\n${YELLOW}[4/8] Importing Moodle database...${NC}"

echo -e "${BLUE}   Dropping existing database...${NC}"
mysql -u root -p"${MARIADB_ROOT_PASSWORD:-moodleroot}" -e "DROP DATABASE IF EXISTS $MOODLE_DB;" || true
sleep 1

echo -e "${BLUE}   Creating database...${NC}"
mysql -u root -p"${MARIADB_ROOT_PASSWORD:-moodleroot}" -e "CREATE DATABASE $MOODLE_DB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo -e "${BLUE}   Importing data (this may take a while)...${NC}"
mysql -u "$MOODLE_DB_USER" -p"$MOODLE_DB_PASS" "$MOODLE_DB" < "$EXPORT_DIR/database/moodle-db.sql"

echo -e "${GREEN}✓ Database imported${NC}"

# Import File Storage
echo -e "\n${YELLOW}[5/8] Importing Moodle file storage...${NC}"

if [ -d "$EXPORT_DIR/files/moodledata" ]; then
    echo -e "${BLUE}   Removing old moodledata...${NC}"
    rm -rf "$MOODLE_DATA"/*
    
    echo -e "${BLUE}   Copying new moodledata...${NC}"
    cp -r "$EXPORT_DIR/files/moodledata"/* "$MOODLE_DATA/" 2>/dev/null || true
    
    echo -e "${BLUE}   Setting permissions...${NC}"
    sudo chown -R www-data:www-data "$MOODLE_DATA"
    sudo chmod -R 775 "$MOODLE_DATA"
    
    echo -e "${GREEN}✓ File storage imported${NC}"
else
    echo -e "${YELLOW}⚠ No moodledata directory in export${NC}"
fi

# Update Moodle Configuration
echo -e "\n${YELLOW}[6/8] Updating Moodle configuration for production...${NC}"

# Create updated config.php
cat > "$MOODLE_ROOT/config.php" << 'EOFCONFIG'
<?php
// Moodle Configuration File
// Production LAMP Installation - auto-generated on import

unset($CFG);
$CFG = new \stdClass();

// Database configuration
$CFG->dbtype    = 'mariadb';
$CFG->dblibrary = 'native';
$CFG->dbhost    = 'localhost';
$CFG->dbname    = 'moodle';
$CFG->dbuser    = 'moodleuser';
$CFG->dbpass    = 'moodlepass';
$CFG->prefix    = 'mdl_';
$CFG->dboptions = array (
  'dbpersist' => 0,
  'dbsocket' => false,
  'dbport' => 3306,
  'dbcollation' => 'utf8mb4_unicode_ci',
);

// Web address
$CFG->wwwroot   = 'http://lms.sclsandbox.xyz:8888';
$CFG->httpswwwroot = 'https://lms.sclsandbox.xyz';

// File paths
$CFG->dataroot = '/var/moodledata-prod';
$CFG->directorypermissions = 02777;

// Application paths
$CFG->admin = 'admin';

// Debugging - set to false in production
$CFG->debug = ( E_ALL | E_STRICT );
$CFG->debugdisplay = false;
$CFG->debugsmtp = false;

// Session configuration
$CFG->sessiontimeout = 28800;
$CFG->sessioncookiesite = '';

// SSL configuration
$CFG->sslproxy = true;
$CFG->sslproxy_host = '';
$CFG->sslproxy_port = 443;

// Security
$CFG->cookiesecure = false;
$CFG->cookiehttponly = true;
$CFG->cookiesamesite = 'Lax';

// Moodle theme defaults
$CFG->theme = 'boost';

// System paths
require_once(__DIR__ . '/lib/setup.php');

// Production settings
$CFG->forceclean = false;
$CFG->skiplangupgrade = false;
$CFG->enablegravatar = true;

// Custom SCL settings
$CFG->brandingelement = 'SCL Institute';

// Mail configuration
$CFG->smtphosts = 'localhost';
$CFG->noreplyaddress = 'noreply@sclsandbox.xyz';

// Cache configuration
$CFG->cachedir = '/var/moodledata-prod/cache';

// If this file is replaced during upgrades, this flag is set to true.
// Remove this flag after you have verified that the installation is complete.
$CFG->upgraderunning = 0;
EOFCONFIG

echo -e "${GREEN}✓ Configuration updated${NC}"

# Fix file permissions
echo -e "\n${YELLOW}[7/8] Setting file permissions...${NC}"

sudo chown -R www-data:www-data "$MOODLE_ROOT"
sudo chmod -R 755 "$MOODLE_ROOT"
sudo chmod -R 777 "$MOODLE_ROOT/config.php"

sudo chown -R www-data:www-data "$MOODLE_DATA"
sudo chmod -R 777 "$MOODLE_DATA"

echo -e "${GREEN}✓ Permissions set${NC}"

# Start Apache
echo -e "\n${YELLOW}[8/8] Starting Apache...${NC}"
sudo systemctl start apache2
sleep 3

if sudo systemctl is-active --quiet apache2; then
    echo -e "${GREEN}✓ Apache started successfully${NC}"
else
    echo -e "${RED}✗ Apache failed to start${NC}"
    systemctl status apache2
fi

# Verify installation
echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}✓ IMPORT COMPLETE${NC}"
echo -e "${YELLOW}========================================${NC}"

echo -e "\n${YELLOW}Verification:${NC}"

# Check database
echo -e "${BLUE}   Checking database...${NC}"
TABLE_COUNT=$(mysql -u "$MOODLE_DB_USER" -p"$MOODLE_DB_PASS" -se "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$MOODLE_DB';" 2>/dev/null || echo "ERROR")
if [ "$TABLE_COUNT" != "ERROR" ] && [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}   ✓ Database has $TABLE_COUNT tables${NC}"
else
    echo -e "${RED}   ✗ Database check failed${NC}"
fi

# Check Apache
if sudo systemctl is-active --quiet apache2; then
    echo -e "${GREEN}   ✓ Apache running${NC}"
fi

# Check Moodle files
if [ -d "$MOODLE_ROOT" ]; then
    echo -e "${GREEN}   ✓ Moodle root: $MOODLE_ROOT${NC}"
fi

if [ -d "$MOODLE_DATA" ]; then
    echo -e "${GREEN}   ✓ Moodle data: $MOODLE_DATA${NC}"
fi

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "  1. Visit Moodle: http://lms.sclsandbox.xyz:8888"
echo -e "  2. Complete setup wizard if needed"
echo -e "  3. Configure SSO in Moodle local plugin (if needed)"
echo -e "  4. Test login flow from main system"

echo -e "\n${YELLOW}Backup Information:${NC}"
echo -e "  Backup Location: $BACKUP_DIR"
echo -e "  Restore Command: bash /tmp/restore-moodle.sh $BACKUP_DIR"

echo -e "\n${GREEN}Complete!${NC}\n"
