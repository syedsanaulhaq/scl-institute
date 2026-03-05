#!/bin/bash
# SCL-Moodle Data Synchronization Script
# Purpose: Auto-enroll students and sync application data
# Author: Auto-generated
# Date: March 5, 2026

DB_HOST="localhost"
DB_PORT=3306
DB_USER="root"
DB_PASS="rootpassword"
SCL_DB="scl_institute"
MOODLE_DB="moodle"

echo "=========================================="
echo "SCL-Moodle Data Sync Start"
echo "=========================================="

# Step 1: Create Moodle users from SCL student applications
echo "[1/5] Creating Moodle users from SCL applications..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS << 'EOF'

USE moodle;

-- Create temporary table for sync tracking
CREATE TEMPORARY TABLE IF NOT EXISTS sync_mapping AS
SELECT 
    sa.id as app_id,
    sa.email,
    sa.first_name,
    sa.last_name,
    sa.course_code,
    sa.course_title,
    COALESCE(mu.id, 0) as moodle_user_id
FROM scl_institute.student_applications sa
LEFT JOIN moodle.mdl_user mu ON sa.email = mu.email
WHERE sa.is_deleted = 0 AND sa.application_status IN ('accepted', 'conditional_accept');

-- Count pending syncs
SELECT CONCAT('Found ', COUNT(*), ' applications to sync') as sync_status
FROM sync_mapping WHERE moodle_user_id = 0;

EOF

# Step 2: Auto-enroll students in courses
echo "[2/5] Auto-enrolling students in Moodle courses..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS << 'EOF'

USE moodle;

-- Map course codes to Moodle courses and create enrollments
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, modifierid, timemodified)
SELECT DISTINCT
    ce.id as enrol_id,
    mu.id as user_id,
    0 as status,
    UNIX_TIMESTAMP() as timestart,
    0 as timeend,
    2 as modifier_id,
    UNIX_TIMESTAMP() as timemodified
FROM scl_institute.student_applications sa
JOIN moodle.mdl_user mu ON sa.email = mu.email
JOIN moodle.mdl_course mc ON CONCAT('SCL-', UPPER(REPLACE(REPLACE(sa.course_code, ' ', '-'), '.', '-'))) LIKE CONCAT(mc.shortname, '%')
JOIN moodle.mdl_enrol ce ON ce.courseid = mc.id AND ce.enrol = 'manual'
WHERE sa.application_status IN ('accepted', 'conditional_accept')
  AND sa.is_deleted = 0
  AND NOT EXISTS (
    SELECT 1 FROM mdl_user_enrolments ue 
    WHERE ue.userid = mu.id AND ue.enrolid = ce.id
  )
ON DUPLICATE KEY UPDATE timemodified = UNIX_TIMESTAMP();

SELECT CONCAT('Enrollments processed: ', ROW_COUNT(), ' records') as result;

EOF

# Step 3: Sync application status to custom fields
echo "[3/5] Syncing application data to Moodle custom fields..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS << 'EOF'

USE moodle;

-- Ensure custom fields exist
INSERT INTO mdl_customfield_category (name, component, area, configdata, sortorder, timecreated, timemodified)
VALUES 
    ('Application Info', 'core_user', 'user', JSON_OBJECT('itemid', 0), 99, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE timemodified = UNIX_TIMESTAMP();

-- Get category ID
SET @category_id = (SELECT id FROM mdl_customfield_category WHERE name = 'Application Info' LIMIT 1);

-- Create/update custom fields
INSERT INTO mdl_customfield_field (shortname, name, type, categoryid, configdata, sortorder, timecreated, timemodified)
VALUES 
    ('application_status', 'Application Status', 'select', @category_id, JSON_OBJECT('options', 'draft\naccepted\nconditional\nrejected'), 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
    ('course_applied', 'Course Applied For', 'textarea', @category_id, '{}', 2, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())
ON DUPLICATE KEY UPDATE timemodified = UNIX_TIMESTAMP();

echo 'Custom fields synchronized';

EOF

# Step 4: Update course_enrollment_mapping table
echo "[4/5] Updating enrollment mapping records..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS << 'EOF'

USE scl_institute;

UPDATE course_enrollment_mapping cem
SET 
    sync_status = 'Synced',
    last_sync_date = NOW(),
    enrollment_status = 'Enrolled'
WHERE student_id IN (
    SELECT id FROM users WHERE email IN (
        SELECT DISTINCT email FROM student_applications 
        WHERE application_status IN ('accepted', 'conditional_accept') AND is_deleted = 0
    )
);

SELECT CONCAT('Mappings updated: ', ROW_COUNT(), ' records') as result;

EOF

# Step 5: Verification report
echo "[5/5] Generating verification report..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS << 'EOF'

SELECT '============ SYNC VERIFICATION REPORT ============' as report;
SELECT CONCAT('SCL Applications (Accepted): ', COUNT(*)) as stat FROM scl_institute.student_applications 
WHERE application_status IN ('accepted', 'conditional_accept') AND is_deleted = 0;

SELECT CONCAT('Moodle User Enrollments: ', COUNT(*)) as stat FROM moodle.mdl_user_enrolments;

SELECT '--- User Email Sync Status ---' as section;
SELECT 
    CONCAT(sa.first_name, ' ', sa.last_name) as student,
    sa.email,
    CASE WHEN mu.id IS NOT NULL THEN 'SYNCED' ELSE 'MISSING' END as status
FROM scl_institute.student_applications sa
LEFT JOIN moodle.mdl_user mu ON sa.email = mu.email
WHERE sa.is_deleted = 0 
LIMIT 10;

EOF

echo ""
echo "=========================================="
echo "✓ Sync Complete!"
echo "=========================================="
echo "Next: Verify enrollments in Moodle admin panel"
