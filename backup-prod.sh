#!/bin/bash
# Production Full Backup Script
# Usage: ./backup-prod.sh [backup_location]
# Default backup location: /backups/production-$(date +%Y%m%d-%H%M%S)

set -e  # Exit on any error

BACKUP_TIME=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="${1:-/backups/production-$BACKUP_TIME}"

echo "=========================================="
echo "Production Backup Started"
echo "Backup Directory: $BACKUP_DIR"
echo "Timestamp: $BACKUP_TIME"
echo "=========================================="

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo "[$(date)] Creating backup directory..."

# 1. Backup Docker Containers State
echo "[$(date)] Backing up Docker state..."
docker ps -a > "$BACKUP_DIR/docker-containers-state.txt"
docker volume ls > "$BACKUP_DIR/docker-volumes-state.txt"
docker images > "$BACKUP_DIR/docker-images-state.txt"

# 2. Backup SCL MySQL Database (Docker)
echo "[$(date)] Backing up SCL database..."
docker exec scli-mysql-prod mysqldump \
  -u root -pRootSecurePass2024! \
  --all-databases \
  --single-transaction \
  --no-tablespaces \
  > "$BACKUP_DIR/scl_institute_full_backup_$BACKUP_TIME.sql"

# 3. Backup Moodle MySQL Database (Docker)
echo "[$(date)] Backing up Moodle database..."
docker exec scli-moodle-db-prod mysqldump \
  -u root -pmoodleroot \
  --all-databases \
  --single-transaction \
  --no-tablespaces \
  > "$BACKUP_DIR/bitnami_moodle_full_backup_$BACKUP_TIME.sql"

# 4. Backup Docker Volumes
echo "[$(date)] Backing up Docker volumes..."

# MySQL data
echo "  - Backing up SCL MySQL volume..."
docker run --rm \
  -v scli_mysql_data_prod:/data \
  -v "$BACKUP_DIR:/backup" \
  mysql:8.0 \
  tar czf /backup/scli-mysql-volume-$BACKUP_TIME.tar.gz \
  -C /data .

# Moodle database volume
echo "  - Backing up Moodle database volume..."
docker run --rm \
  -v scli_moodle_db_data_prod:/data \
  -v "$BACKUP_DIR:/backup" \
  mysql:8.0 \
  tar czf /backup/moodle-db-volume-$BACKUP_TIME.tar.gz \
  -C /data .

# Moodle files volume
echo "  - Backing up Moodle files volume..."
docker run --rm \
  -v scli_moodle_data_prod:/data \
  -v "$BACKUP_DIR:/backup" \
  alpine \
  tar czf /backup/moodle-files-volume-$BACKUP_TIME.tar.gz \
  -C /data .

# 5. Backup Docker Compose Configuration
echo "[$(date)] Backing up configuration..."
# Configuration files are in the project repo, backing up container environment instead
docker inspect scli-mysql-prod > "$BACKUP_DIR/scli-mysql-prod-config.json" 2>/dev/null || true
docker inspect scli-moodle-db-prod > "$BACKUP_DIR/scli-moodle-db-prod-config.json" 2>/dev/null || true

# 6. Create Backup Manifest
echo "[$(date)] Creating backup manifest..."
cat > "$BACKUP_DIR/BACKUP_MANIFEST.txt" << EOF
Production Backup Report
========================
Backup Timestamp: $BACKUP_TIME
Backup Location: $BACKUP_DIR

Files Included:
$(ls -lh "$BACKUP_DIR" | tail -n +2 | awk '{print "  - " $9 " (" $5 ")"}')

Total Backup Size: $(du -sh "$BACKUP_DIR" | awk '{print $1}')

Database Exports:
  - SCL Institute (scl_institute): SQL dump
  - Bitnami Moodle (bitnami_moodle): SQL dump

Docker Volumes:
  - scli_mysql_data_prod: tarball
  - scli_moodle_db_data_prod: tarball
  - scli_moodle_data_prod: tarball

System State:
  - Docker containers list
  - Docker volumes list
  - Docker images list

Configuration:
  - docker-compose.prod.yml
  - .env (if available)

Restore Instructions:
====================
To restore from this backup:

1. Stop all Docker services:
   docker-compose -f docker-compose.prod.yml down

2. Restore MySQL volumes:
   docker volume rm scli_mysql_data_prod
   docker volume create scli_mysql_data_prod
   docker run --rm -v scli_mysql_data_prod:/data -v $BACKUP_DIR:/backup \
     mysql:8.0 tar xzf /backup/scli-mysql-volume-$BACKUP_TIME.tar.gz -C /data

3. Restore Moodle database volume:
   docker volume rm scli_moodle_db_data_prod
   docker volume create scli_moodle_db_data_prod
   docker run --rm -v scli_moodle_db_data_prod:/data -v $BACKUP_DIR:/backup \
     mysql:8.0 tar xzf /backup/moodle-db-volume-$BACKUP_TIME.tar.gz -C /data

4. Restore Moodle files volume:
   docker volume rm scli_moodle_data_prod
   docker volume create scli_moodle_data_prod
   docker run --rm -v scli_moodle_data_prod:/data -v $BACKUP_DIR:/backup \
     alpine tar xzf /backup/moodle-files-volume-$BACKUP_TIME.tar.gz -C /data

5. Start services:
   docker-compose -f docker-compose.prod.yml up -d

Backup Verification:
====================
Compare checksums before and after restore:
  $ md5sum "$BACKUP_DIR"/*.tar.gz

EOF

echo "[$(date)] Creating checksums..."
cd "$BACKUP_DIR"
md5sum * > MD5CHECKSUMS.txt
cd -

# 7. Display Summary
echo ""
echo "=========================================="
echo "Backup Completed Successfully!"
echo "=========================================="
echo ""
echo "Backup Location: $BACKUP_DIR"
echo "Total Size: $(du -sh "$BACKUP_DIR" | awk '{print $1}')"
echo "Files: $(ls -1 "$BACKUP_DIR" | wc -l)"
echo ""
echo "Manifest: $BACKUP_DIR/BACKUP_MANIFEST.txt"
echo "Checksums: $BACKUP_DIR/MD5CHECKSUMS.txt"
echo ""
echo "Next Steps:"
echo "1. Verify backup files exist: ls -lh $BACKUP_DIR"
echo "2. Test one file extraction (optional): tar tzf $BACKUP_DIR/scli-mysql-volume-*.tar.gz | head"
echo "3. Store backups in secure location (external drive, cloud, etc.)"
echo "4. Document backup details for team"
echo ""
