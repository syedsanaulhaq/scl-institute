#!/bin/bash

# Upload Local Database to Production Server (Linux/Mac version)

echo "================================================"
echo "SCL Institute - Upload Database to Production"
echo "================================================"
echo ""

BACKUP_FILE="scl_institute_backup_prod.sql"
SERVER="root@185.211.6.60"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    echo "   Run this command first to create backup:"
    echo "   docker exec scli-mysql-dev mysqldump -u scl_user -pscl_password --no-tablespaces scl_institute > scl_institute_backup_prod.sql"
    exit 1
fi

echo "✓ Found backup file: $BACKUP_FILE"
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "  Size: $FILE_SIZE"
echo ""

# Upload to server
echo "📤 Uploading database to production server..."
echo "   Server: 185.211.6.60"
echo ""

scp "$BACKUP_FILE" "${SERVER}:/tmp/scl_institute_restore.sql"

if [ $? -eq 0 ]; then
    echo "✓ Upload successful!"
    echo ""
    
    echo "Now SSH to the server and run these commands:"
    echo ""
    echo "ssh root@185.211.6.60"
    echo ""
    echo "# Restore the database"
    echo "docker exec -i scli-mysql-prod mysql -u scl_user -pSclSecurePass2024! scl_institute < /tmp/scl_institute_restore.sql"
    echo ""
    echo "# Restart backend"
    echo "docker restart scli-backend-prod"
    echo ""
    echo "# Verify"
    echo "docker logs scli-backend-prod --tail 20"
    echo ""
    echo "# Test database"
    echo "docker exec scli-mysql-prod mysql -u scl_user -pSclSecurePass2024! -e \"SELECT email, first_name, last_name, role FROM users LIMIT 5;\" scl_institute"
    echo ""
    echo "================================================"
    echo "✅ Ready to restore on production!"
    echo "================================================"
else
    echo "❌ Upload failed!"
    echo "   Make sure you can SSH to the server"
    exit 1
fi
