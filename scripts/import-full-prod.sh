#!/bin/bash
set -e

mysql_pass="RootSecurePass2024!"

docker exec scli-mysql-prod mysql -uroot --password="$mysql_pass" -e "DROP DATABASE IF EXISTS scl_institute; CREATE DATABASE scl_institute;"
docker exec -i scli-mysql-prod mysql --default-character-set=utf8mb4 -uroot --password="$mysql_pass" scl_institute < /tmp/scl_backup_utf8.sql

echo "Import complete"
