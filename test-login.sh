#!/bin/bash
# Test SCL Student Login in Moodle
# This script tests if students can authenticate after syncing

echo "=========================================="
echo "SCL-MOODLE LOGIN TEST"
echo "=========================================="

MOODLE_URL="http://localhost:9090"
DB_HOST="localhost"
DB_PORT=33062
DB_USER="root"
DB_PASS="rootpassword"

echo ""
echo "[1] Checking Moodle connectivity..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$MOODLE_URL/login/index.php")
if [ "$STATUS" == "200" ]; then
    echo "✅ Moodle is accessible at $MOODLE_URL"
else
    echo "⚠️  Moodle returned status $STATUS (may not be running or accessible)"
    echo "   Continuing with database verification..."
fi

echo ""
echo "[2] Verifying SCL user accounts..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS -e "
USE moodle;
SELECT 
    username,
    email,
    CASE WHEN confirmed = 1 THEN 'Confirmed' ELSE 'Pending' END as status,
    CASE WHEN suspended = 0 THEN 'Active' ELSE 'Suspended' END as account_status
FROM mdl_user 
WHERE username LIKE 'scl_%'
ORDER BY firstname;"

echo ""
echo "[3] Verifying enrollments..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS -e "
USE moodle;
SELECT 
    CONCAT(mu.firstname, ' ', mu.lastname) as student,
    COUNT(*) as enrollment_count,
    CASE WHEN COUNT(*) > 0 THEN 'Enrolled' ELSE 'Not Enrolled' END as enrollment_status
FROM mdl_user mu
LEFT JOIN mdl_user_enrolments ue ON mu.id = ue.userid
WHERE mu.username LIKE 'scl_%'
GROUP BY mu.id
ORDER BY student;"

echo ""
echo "[4] Checking course access permissions..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS -e "
USE moodle;
SELECT 
    COUNT(DISTINCT mu.id) as scl_users,
    COUNT(DISTINCT ue.userid) as users_with_enrollments,
    COUNT(DISTINCT ue.id) as total_enrollments
FROM mdl_user mu
LEFT JOIN mdl_user_enrolments ue ON mu.id = ue.userid
WHERE mu.username LIKE 'scl_%';"

echo ""
echo "[5] Sample course access test..."
echo "Testing if students can view their enrolled courses..."
STUDENT=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS -N -e "
USE moodle;
SELECT DISTINCT mu.username 
FROM mdl_user mu
JOIN mdl_user_enrolments ue ON mu.id = ue.userid
WHERE mu.username LIKE 'scl_%'
LIMIT 1;")

if [ -z "$STUDENT" ]; then
    echo "❌ No test student found"
else
    echo "✅ Test student: $STUDENT"
    mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS -e "
    USE moodle;
    SELECT 
        mu.username,
        mc.shortname,
        mc.fullname,
        CASE ue.status WHEN 0 THEN 'Active' WHEN 1 THEN 'Suspended' END as enrollment_status
    FROM mdl_user mu
    JOIN mdl_user_enrolments ue ON mu.id = ue.userid
    JOIN mdl_enrol me ON ue.enrolid = me.id
    JOIN mdl_course mc ON me.courseid = mc.id
    WHERE mu.username = '$STUDENT'
    LIMIT 5;"
fi

echo ""
echo "=========================================="
echo "✅ DATABASE VERIFICATION COMPLETE"
echo "=========================================="
echo ""
echo "Manual Login Test:"
echo "1. Open: $MOODLE_URL"
echo "2. Select one of the students listed above"
echo "3. Use their username to login"
echo "4. Click 'Dashboard' or 'Courses'"
echo "5. Verify all 25 courses appear"
echo ""
echo "Note: Passwords are hashed. Users will need to reset password on first login."
echo ""
