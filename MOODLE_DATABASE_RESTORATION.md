# Moodle Database Restoration Guide

## Status
✅ COMPLETED - Moodle database restored and verified

## Prerequisites
- Docker container `scli-mysql` running
- Backup file: `moodle-4.3.12-backup.sql` in project root
- MySQL: port 33062 exposed

## Restoration Steps

### Option 1: Manual Restoration (Completed)
```bash
# 1. Copy backup to MySQL container
docker cp moodle-4.3.12-backup.sql scli-mysql:/tmp/moodle-backup.sql

# 2. Create moodle database
docker exec scli-mysql mysql -u root -prootpassword -e "CREATE DATABASE IF NOT EXISTS moodle;"

# 3. Restore database from backup
docker exec scli-mysql bash -c "mysql -u root -prootpassword moodle < /tmp/moodle-backup.sql"

# 4. Verify restoration
docker exec scli-mysql mysql -u root -prootpassword -e "USE moodle; SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='moodle';"
# Expected output: 483 tables
```

### Option 2: Automated Restoration Script
Run the initialization script to restore Moodle database on system startup:
```bash
./scripts/restore-moodle-db.sh
```

## Post-Restoration Verification

### Check both databases exist:
```bash
docker exec scli-mysql mysql -u root -prootpassword -e "SHOW DATABASES;"
```

Expected output:
```
Database
information_schema
moodle
mysql
performance_schema
scl_institute
```

### Check Moodle table count:
```bash
docker exec scli-mysql mysql -u root -prootpassword -e "USE moodle; SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='moodle';"
```

Expected output: `483`

### Check SCL Institute table count:
```bash
docker exec scli-mysql mysql -u root -prootpassword -e "USE scl_institute; SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='scl_institute';"
```

Expected output: `28`

## Database Credentials

| Database | Host | Port | User | Password |
|----------|------|------|------|----------|
| scl_institute | scli-mysql | 3306 | scl_user | scl_password |
| moodle | scli-mysql | 3306 | moodleuser | moodlepass |
| (Root access) | scli-mysql | 3306 | root | rootpassword |

## Notes
- Moodle database requires restoration from backup on fresh system deployment
- Backend configured to access moodle database via environment variables
- Both databases share the same MySQL 8.0 container instance
- Moodle user (moodleuser) has permissions to moodle database
- SCL user (scl_user) is restricted to scl_institute database

## Integration Points
- Backend API: Uses MOODLE_DATABASE_* environment variables to connect
- SSO: Backend manages Single Sign-On between SCL and Moodle
- User Sync: Application can sync users from Moodle via REST API
