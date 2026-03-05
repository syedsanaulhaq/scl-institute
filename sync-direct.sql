-- Direct SCL-Moodle Sync Script (Updated)
-- Target: All student applications (submitted, accepted, etc.)
-- Date: March 5, 2026

SELECT '=== SYNC START ===' as status;

-- Step 1: Get applications to sync
SELECT CONCAT('Found ', COUNT(*), ' applications to sync') as step1
FROM scl_institute.student_applications
WHERE is_deleted = 0;

-- Step 2: Create Moodle users for applicants
INSERT IGNORE INTO moodle.mdl_user (
    auth, confirmed, policyagreed, deleted, suspended, mnethostid,
    username, password, firstname, lastname, email, phone1, city, country,
    department, description, descriptionformat, timecreated, timemodified, firstaccess
)
SELECT 
    'manual',
    1,
    1,
    0,
    0,
    1,
    LOWER(CONCAT('scl_', REPLACE(sa.email, '@', '_'))),
    MD5(CONCAT(sa.email, 'SCLPass2026!@')),
    sa.first_name,
    sa.last_name,
    sa.email,
    sa.contact_number,
    sa.town_city,
    sa.country_of_residence,
    sa.course_title,
    CONCAT('Application Status: ', sa.application_status),
    1,
    UNIX_TIMESTAMP(NOW()),
    UNIX_TIMESTAMP(NOW()),
    UNIX_TIMESTAMP(NOW())
FROM scl_institute.student_applications sa
WHERE sa.is_deleted = 0
  AND NOT EXISTS (
    SELECT 1 FROM moodle.mdl_user mu 
    WHERE LOWER(mu.email) COLLATE utf8mb4_unicode_ci = LOWER(sa.email) COLLATE utf8mb4_unicode_ci
  );

SELECT CONCAT('✓ Users created/updated: ', ROW_COUNT()) as step2;

-- Step 3: Create manual enrol instances for ALL courses
INSERT IGNORE INTO moodle.mdl_enrol (enrol, status, courseid, sortorder, timecreated, timemodified)
SELECT 
    'manual',
    0,
    mc.id,
    0,
    UNIX_TIMESTAMP(NOW()),
    UNIX_TIMESTAMP(NOW())
FROM moodle.mdl_course mc
WHERE mc.id > 1
  AND NOT EXISTS (
    SELECT 1 FROM moodle.mdl_enrol me 
    WHERE me.courseid = mc.id AND me.enrol = 'manual'
  );

SELECT CONCAT('✓ Enrol instances ready: ', ROW_COUNT()) as step3;

-- Step 4: Enroll students in their SPECIFIC courses only
-- Match by course_code or course_title
INSERT IGNORE INTO moodle.mdl_user_enrolments (enrolid, userid, status, timestart, timeend, modifierid, timemodified)
SELECT DISTINCT
    me.id,
    mu.id,
    0,
    UNIX_TIMESTAMP(NOW()),
    0,
    2,
    UNIX_TIMESTAMP(NOW())
FROM scl_institute.student_applications sa
JOIN moodle.mdl_user mu ON LOWER(mu.email) COLLATE utf8mb4_unicode_ci = LOWER(sa.email) COLLATE utf8mb4_unicode_ci
JOIN moodle.mdl_course mc ON (
    /* Match by course code (idnumber or shortname) */
    mc.idnumber = sa.course_code 
    OR mc.shortname = sa.course_code
    /* Or match by course title */
    OR mc.fullname LIKE CONCAT('%', sa.course_title, '%')
)
JOIN moodle.mdl_enrol me ON me.courseid = mc.id AND me.enrol = 'manual'
WHERE sa.is_deleted = 0
  AND sa.application_status IN ('accepted', 'conditional_accept');

SELECT CONCAT('✓ Students enrolled: ', ROW_COUNT()) as step4;

-- Step 5: Verification report
SELECT '========== VERIFICATION REPORT ==========' as report;

SELECT CONCAT('Total SCL Users in Moodle: ', COUNT(*)) as metric
FROM moodle.mdl_user WHERE username LIKE 'scl_%';

SELECT CONCAT('Total Active Enrollments: ', COUNT(*)) as metric
FROM moodle.mdl_user_enrolments ue
JOIN moodle.mdl_user mu ON ue.userid = mu.id
WHERE mu.username LIKE 'scl_%';

SELECT 'Students by Course:' as detail;
SELECT 
    SUBSTRING(mc.fullname, 1, 50) as course,
    COUNT(DISTINCT ue.userid) as students
FROM moodle.mdl_user_enrolments ue
JOIN moodle.mdl_user mu ON ue.userid = mu.id
JOIN moodle.mdl_enrol me ON ue.enrolid = me.id
JOIN moodle.mdl_course mc ON me.courseid = mc.id
WHERE mu.username LIKE 'scl_%'
GROUP BY me.courseid
ORDER BY students DESC
LIMIT 10;

SELECT '--- Sample Enrollments ---' as detail;
SELECT 
    CONCAT(mu.firstname, ' ', mu.lastname) as name,
    mu.email,
    SUBSTRING(mc.fullname, 1, 40) as course,
    CASE ue.status WHEN 0 THEN 'Active' WHEN 1 THEN 'Suspended' END as status
FROM moodle.mdl_user_enrolments ue
JOIN moodle.mdl_user mu ON ue.userid = mu.id
JOIN moodle.mdl_enrol me ON ue.enrolid = me.id
JOIN moodle.mdl_course mc ON me.courseid = mc.id
WHERE mu.username LIKE 'scl_%'
LIMIT 10;

SELECT '========== SYNC COMPLETE ==========' as status;
