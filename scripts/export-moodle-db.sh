#!/bin/bash
# Export local Moodle database backup for uploading to server

echo "Exporting local Moodle database..."
docker exec scli-moodle-db-dev mysqldump -u bn_moodle -pbitnami_moodle_password bitnami_moodle > "../moodle-backup/moodle_backup.sql"

echo "Backup file created at: ../moodle-backup/moodle_backup.sql"
ls -lh ../moodle-backup/moodle_backup.sql
