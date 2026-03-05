#!/bin/bash
# Sync SCL Institute Database from Development to Production
# This script exports the development database and imports it to production
# Usage: bash sync-db-to-production.sh

set -e

PROD_SERVER="185.211.6.60"
PROD_USER="root"
LOCAL_DUMP="scl-institute-dev-backup-$(date +%Y%m%d_%H%M%S).sql"

echo "=========================================="
echo "SCL DATABASE SYNC: Development → Production"
echo "=========================================="

# Step 1: Export development database
echo "[1/4] Exporting development database..."
docker-compose exec -T scli-mysql mysqldump -u root -prootpassword --no-tablespaces scl_institute > "$LOCAL_DUMP"
echo "  ✅ Exported to: $LOCAL_DUMP"

# Step 2: Copy to production server
echo "[2/4] Copying to production server..."
scp "$LOCAL_DUMP" "$PROD_USER@$PROD_SERVER":/root/scl-institute/
echo "  ✅ Copied to production"

# Step 3: Import on production
echo "[3/4] Importing on production server..."
ssh "$PROD_USER@$PROD_SERVER" "docker exec scli-mysql mysql -u root -p'RootSecurePass2024!' scl_institute < /root/scl-institute/$LOCAL_DUMP"
echo "  ✅ Database imported"

# Step 4: Verify
echo "[4/4] Verifying sync..."
PROD_COUNT=$(ssh "$PROD_USER@$PROD_SERVER" "docker exec scli-mysql mysql -u scl_user -p'SclSecurePass2024!' scl_institute --execute='SELECT COUNT(*) as count FROM student_applications;' | tail -1")
LOCAL_COUNT=$(docker-compose exec -T scli-mysql mysql -u scl_user -pscl_password scl_institute --execute="SELECT COUNT(*) as count FROM student_applications;" | tail -1)

echo "  Development applications: $LOCAL_COUNT"
echo "  Production applications: $PROD_COUNT"

if [ "$PROD_COUNT" = "$LOCAL_COUNT" ]; then
    echo ""
    echo "=========================================="
    echo "✅ SYNC COMPLETED SUCCESSFULLY"
    echo "=========================================="
else
    echo ""
    echo "⚠️  WARNING: Counts don't match!"
    echo "Development: $LOCAL_COUNT"
    echo "Production: $PROD_COUNT"
fi

# Clean up local dump
rm "$LOCAL_DUMP"
echo "Cleaned up local backup"
