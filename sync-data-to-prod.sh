#!/bin/bash
# Sync Development Data to Production
# Exports Moodle courses, SCL inductions, requirements from dev
# Imports to production LAMP and Docker environments

set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
EXPORT_DIR="/tmp/moodle-sync-$TIMESTAMP"
PROD_SERVER="${1:-production-server-ip}"
PROD_USER="${2:-root}"

echo "=========================================="
echo "Development → Production Data Sync"
echo "=========================================="
echo "Timestamp: $TIMESTAMP"
echo "Export Directory: $EXPORT_DIR"
echo "Production Server: $PROD_SERVER"
echo "=========================================="
echo ""

# Create export directory
mkdir -p "$EXPORT_DIR"

# ============================================
# STEP 1: Export from Development LAMP MySQL
# ============================================
echo "[1/6] Exporting Moodle from development LAMP..."

# Assuming dev LAMP is on WSL or local machine
# Adjust MySQL connection if needed
mysql -h localhost -u moodleuser -pmoodlepass moodle \
  --single-transaction --quick --lock-tables=false \
  > "$EXPORT_DIR/moodle_dev_export_$TIMESTAMP.sql"

echo "  ✓ Moodle export: $(du -h "$EXPORT_DIR/moodle_dev_export_$TIMESTAMP.sql" | awk '{print $1}')"

# ============================================
# STEP 2: Export SCL Inductions from Docker
# ============================================
echo "[2/6] Exporting SCL inductions from Docker..."

docker exec scli-mysql mysqldump \
  -u scl_user -pscl_password scl_institute \
  course_inductions \
  course_induction_requirements \
  course_induction_requirement_templates \
  course_induction_signoffs \
  course_induction_conditions \
  course_induction_risks \
  --single-transaction --quick --lock-tables=false \
  > "$EXPORT_DIR/scl_inductions_export_$TIMESTAMP.sql"

echo "  ✓ Inductions export: $(du -h "$EXPORT_DIR/scl_inductions_export_$TIMESTAMP.sql" | awk '{print $1}')"

# ============================================
# STEP 3: Copy 'courses' table (for moodle_course_id mapping)
# ============================================
echo "[3/6] Exporting courses table..."

docker exec scli-mysql mysqldump \
  -u scl_user -pscl_password scl_institute \
  courses \
  --single-transaction --quick --lock-tables=false \
  > "$EXPORT_DIR/scl_courses_export_$TIMESTAMP.sql"

echo "  ✓ Courses export: $(du -h "$EXPORT_DIR/scl_courses_export_$TIMESTAMP.sql" | awk '{print $1}')"

# ============================================
# STEP 4: Transfer files to production
# ============================================
echo "[4/6] Transferring exports to production server..."

# Create directory on production server
ssh "$PROD_USER@$PROD_SERVER" "mkdir -p /tmp/moodle-sync-$TIMESTAMP"

# Copy export files
scp "$EXPORT_DIR/moodle_dev_export_$TIMESTAMP.sql" \
  "$PROD_USER@$PROD_SERVER:/tmp/moodle-sync-$TIMESTAMP/"

scp "$EXPORT_DIR/scl_inductions_export_$TIMESTAMP.sql" \
  "$PROD_USER@$PROD_SERVER:/tmp/moodle-sync-$TIMESTAMP/"

scp "$EXPORT_DIR/scl_courses_export_$TIMESTAMP.sql" \
  "$PROD_USER@$PROD_SERVER:/tmp/moodle-sync-$TIMESTAMP/"

echo "  ✓ Files transferred to $PROD_SERVER:/tmp/moodle-sync-$TIMESTAMP/"

# ============================================
# STEP 5: Import to Production LAMP MySQL
# ============================================
echo "[5/6] Importing to production LAMP MySQL..."

ssh "$PROD_USER@$PROD_SERVER" << EOSSH
echo "  Clearing production Moodle database..."
mysql -u moodleuser -pmoodlepass moodle << EOF
DELETE FROM mdl_course WHERE id > 1;
DELETE FROM mdl_enrol WHERE courseid > 1;
DELETE FROM mdl_user_enrolments WHERE id > 0;
DELETE FROM mdl_course_modules WHERE id > 0;
EOF

echo "  Importing Moodle data..."
mysql -u moodleuser -pmoodlepass moodle < /tmp/moodle-sync-$TIMESTAMP/moodle_dev_export_$TIMESTAMP.sql

echo "  Verifying Moodle import..."
COURSE_COUNT=\$(mysql -u moodleuser -pmoodlepass moodle -N -e "SELECT COUNT(*) FROM mdl_course WHERE id > 1;")
echo "  ✓ Imported \$COURSE_COUNT courses to production Moodle"

EOSSH

# ============================================
# STEP 6: Import to Production Docker Database
# ============================================
echo "[6/6] Importing inductions to production Docker database..."

# Import courses table
docker exec scli-mysql-prod mysql -u scl_user -pscl_password scl_institute \
  < "$EXPORT_DIR/scl_courses_export_$TIMESTAMP.sql"

# Import inductions (using REPLACE to avoid duplicates)
docker exec scli-mysql-prod mysql -u scl_user -pscl_password scl_institute \
  < "$EXPORT_DIR/scl_inductions_export_$TIMESTAMP.sql"

# Verify
INDUCTION_COUNT=$(docker exec scli-mysql-prod mysql \
  -u scl_user -pscl_password scl_institute \
  -N -e "SELECT COUNT(*) FROM course_inductions;")

REQUIREMENT_COUNT=$(docker exec scli-mysql-prod mysql \
  -u scl_user -pscl_password scl_institute \
  -N -e "SELECT COUNT(*) FROM course_induction_requirements;")

echo "  ✓ Imported $INDUCTION_COUNT inductions"
echo "  ✓ Imported $REQUIREMENT_COUNT requirements"

# ============================================
# SUMMARY
# ============================================
echo ""
echo "=========================================="
echo "Sync Completed Successfully!"
echo "=========================================="
echo ""
echo "Data Sync Summary:"
echo "  - Moodle courses: $COURSE_COUNT (in prod LAMP)"
echo "  - SCL inductions: $INDUCTION_COUNT (in prod Docker)"
echo "  - Requirements: $REQUIREMENT_COUNT (in prod Docker)"
echo ""
echo "Export files saved locally at:"
echo "  $EXPORT_DIR/"
echo ""
echo "Files on production server:"
echo "  $PROD_SERVER:/tmp/moodle-sync-$TIMESTAMP/"
echo ""
echo "Next Steps:"
echo "1. Verify data in production LAMP Moodle"
echo "2. Test sync endpoint: POST /api/inductions/sync-moodle"
echo "3. Verify both databases have consistent course mappings"
echo "4. Archive export files for backup"
echo ""
echo "Cleanup (when ready):"
echo "  rm -rf $EXPORT_DIR"
echo "  ssh $PROD_USER@$PROD_SERVER rm -rf /tmp/moodle-sync-$TIMESTAMP"
echo ""
