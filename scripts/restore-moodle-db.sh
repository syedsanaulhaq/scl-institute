#!/bin/bash
# Restore Moodle database from backup on production server

CONTAINER_NAME="scli-moodle-db-prod"
BACKUP_FILE="/tmp/moodle_backup.sql"
MARIADB_USER="bn_moodle"
MARIADB_PASSWORD="${MARIADB_PASSWORD}"
MARIADB_DATABASE="bitnami_moodle_prod"

echo "Waiting for MariaDB to be healthy..."
docker-compose -f docker-compose.prod.yml logs scli-moodle-db-prod

echo "Restoring Moodle database from backup..."
cat "$BACKUP_FILE" | docker exec -i $CONTAINER_NAME mysql -u root -p"${MARIADB_ROOT_PASSWORD}" $MARIADB_DATABASE

echo "Database restore complete!"
docker-compose -f docker-compose.prod.yml restart scli-moodle-prod

echo "Moodle is restarting with restored database..."
sleep 30
docker-compose -f docker-compose.prod.yml ps
