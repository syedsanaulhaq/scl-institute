#!/bin/bash
# Import SCL Institute database backup to production

echo "Starting database import..."
cd /opt/scl-institute

# Get password from environment or use default
DB_ROOT_PASS="${MYSQL_ROOT_PASSWORD:-rootpassword}"

# Drop existing database
docker exec scli-mysql-prod mysql -u root -p"$DB_ROOT_PASS" -e "DROP DATABASE IF EXISTS scl_institute;" 2>/dev/null || echo "Could not drop database (might not exist)"

# Recreate database
docker exec scli-mysql-prod mysql -u root -p"$DB_ROOT_PASS" -e "CREATE DATABASE scl_institute;" 2>/dev/null

# Import backup using local socket (no password needed when using socket connection)
docker exec -i scli-mysql-prod bash -c 'mysql --protocol=socket scl_institute < /tmp/scl_institute_full_backup.sql' 2>&1

# Verify import
echo "Verifying import..."
docker exec scli-mysql-prod mysql --protocol=socket -e "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='scl_institute';" 2>/dev/null

echo "Database import completed!"
