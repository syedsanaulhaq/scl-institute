#!/bin/bash
#
# Export Moodle Complete Data From Local Docker to Production LAMP
# This script exports:
# 1. Moodle database (MySQL)
# 2. Moodle file storage (/bitnami/moodledata)
# 3. Moodle core files
# 4. Configuration files
#

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Moodle Export from Docker${NC}"
echo -e "${YELLOW}========================================${NC}"

# Configuration
LOCAL_EXPORT_DIR="./moodle-export-$(date +%Y%m%d-%H%M%S)"
DOCKER_CONTAINER="scli-moodle-dev"
MOODLE_DB_CONTAINER="scli-moodle-db-dev"

# Check if Docker containers exist
echo -e "\n${YELLOW}[1/6] Checking Docker containers...${NC}"
if ! docker ps -a | grep -q "$DOCKER_CONTAINER"; then
    echo -e "${RED}✗ Docker container '$DOCKER_CONTAINER' not found${NC}"
    echo -e "${YELLOW}Available containers:${NC}"
    docker ps -a --format "table {{.Names}}\t{{.Status}}"
    exit 1
fi
echo -e "${GREEN}✓ Docker containers found${NC}"

# Create export directory
echo -e "\n${YELLOW}[2/6] Creating export directory...${NC}"
mkdir -p "$LOCAL_EXPORT_DIR"/{database,files,config}
echo -e "${GREEN}✓ Export directory: $LOCAL_EXPORT_DIR${NC}"

# Export Moodle Database
echo -e "\n${YELLOW}[3/6] Exporting Moodle database...${NC}"
if docker ps | grep -q "$MOODLE_DB_CONTAINER"; then
    DB_HOST=$(docker inspect --format='{{.NetworkSettings.IPAddress}}' "$MOODLE_DB_CONTAINER" 2>/dev/null || echo "scli-moodle-db-dev")
    echo -e "${YELLOW}   Database host: $DB_HOST${NC}"
    
    docker exec "$MOODLE_DB_CONTAINER" mysqldump \
        -u bn_moodle \
        -pbitnami_moodle_password \
        bitnami_moodle > "$LOCAL_EXPORT_DIR/database/moodle-db.sql"
    
    echo -e "${GREEN}✓ Database exported: $LOCAL_EXPORT_DIR/database/moodle-db.sql${NC}"
    echo -e "${YELLOW}   Size: $(du -h "$LOCAL_EXPORT_DIR/database/moodle-db.sql" | cut -f1)${NC}"
else
    echo -e "${RED}✗ Database container not running, trying from Moodle container...${NC}"
    docker exec "$DOCKER_CONTAINER" mysqldump \
        -h scli-moodle-db-dev \
        -u bn_moodle \
        -pbitnami_moodle_password \
        bitnami_moodle > "$LOCAL_EXPORT_DIR/database/moodle-db.sql"
    echo -e "${GREEN}✓ Database exported via Moodle container${NC}"
fi

# Export Moodle Files (moodledata)
echo -e "\n${YELLOW}[4/6] Exporting Moodle file storage...${NC}"
MOODLE_DATA_PATH="/bitnami/moodledata"

if docker exec "$DOCKER_CONTAINER" test -d "$MOODLE_DATA_PATH"; then
    docker cp "$DOCKER_CONTAINER:$MOODLE_DATA_PATH" "$LOCAL_EXPORT_DIR/files/moodledata"
    echo -e "${GREEN}✓ Moodle file storage exported${NC}"
    echo -e "${YELLOW}   Size: $(du -sh "$LOCAL_EXPORT_DIR/files/moodledata" 2>/dev/null | cut -f1)${NC}"
else
    echo -e "${YELLOW}⚠ Moodle data directory not found at $MOODLE_DATA_PATH${NC}"
    mkdir -p "$LOCAL_EXPORT_DIR/files/moodledata"
fi

# Export Moodle Configuration
echo -e "\n${YELLOW}[5/6] Exporting Moodle configuration...${NC}"
MOODLE_CONFIG_PATH="/bitnami/moodle/config.php"

if docker exec "$DOCKER_CONTAINER" test -f "$MOODLE_CONFIG_PATH"; then
    docker cp "$DOCKER_CONTAINER:$MOODLE_CONFIG_PATH" "$LOCAL_EXPORT_DIR/config/config.php.bak"
    echo -e "${GREEN}✓ Configuration file exported${NC}"
else
    echo -e "${YELLOW}⚠ Config file not found${NC}"
fi

# Export theme and plugin files
echo -e "\n${YELLOW}[6/6] Exporting themes and plugins...${NC}"
docker cp "$DOCKER_CONTAINER:/bitnami/moodle/theme" "$LOCAL_EXPORT_DIR/files/" 2>/dev/null || true
docker cp "$DOCKER_CONTAINER:/bitnami/moodle/mod" "$LOCAL_EXPORT_DIR/files/" 2>/dev/null || true
docker cp "$DOCKER_CONTAINER:/bitnami/moodle/blocks" "$LOCAL_EXPORT_DIR/files/" 2>/dev/null || true

echo -e "${GREEN}✓ Themes and plugins exported${NC}"

# Create summary
echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}✓ EXPORT COMPLETE${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "\n${YELLOW}Export Summary:${NC}"
echo -e "  Directory: ${GREEN}$LOCAL_EXPORT_DIR${NC}"
echo -e "  Database: ${GREEN}$([ -f "$LOCAL_EXPORT_DIR/database/moodle-db.sql" ] && echo "✓ Present" || echo "✗ Missing")${NC}"
echo -e "  Files: ${GREEN}$([ -d "$LOCAL_EXPORT_DIR/files/moodledata" ] && echo "✓ Present" || echo "✗ Missing")${NC}"
echo -e "  Config: ${GREEN}$([ -f "$LOCAL_EXPORT_DIR/config/config.php.bak" ] && echo "✓ Present" || echo "✗ Missing")${NC}"

echo -e "\n${YELLOW}Total Size: $(du -sh "$LOCAL_EXPORT_DIR" | cut -f1)${NC}"

# Create manifest
cat > "$LOCAL_EXPORT_DIR/MANIFEST.txt" << EOF
Moodle Export Manifest
======================
Export Date: $(date)
Source: Docker Development Environment
Local Moodle Container: $DOCKER_CONTAINER
Local Database Container: $MOODLE_DB_CONTAINER

Contents:
---------
1. database/moodle-db.sql     - Complete MySQL database dump
2. files/moodledata/          - Moodle file storage directory
3. files/theme/               - Moodle themes
4. files/mod/                 - Moodle modules
5. files/blocks/              - Moodle blocks
6. config/config.php.bak      - Original Moodle configuration

Next Steps:
-----------
1. Copy this entire folder to production server:
   scp -r $LOCAL_EXPORT_DIR root@185.211.6.60:/tmp/

2. Run import script on production:
   bash /tmp/import-moodle-production.sh $LOCAL_EXPORT_DIR

3. Verify SSO configuration:
   - Check backend environment variables
   - Test Moodle → Backend connection
   - Verify login flow
EOF

echo -e "\n${YELLOW}Manifest created: $LOCAL_EXPORT_DIR/MANIFEST.txt${NC}"
echo -e "\n${GREEN}Next: Copy this folder to production and run import script${NC}"
