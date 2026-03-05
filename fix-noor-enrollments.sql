-- Fix Noor Ahmed's course enrollments
-- She should ONLY be in "English Language Course" (ENG-LANG-001)
-- Remove all other course enrollments

USE moodle;

-- Get Noor's user ID
SET @noor_userid = (SELECT id FROM mdl_user WHERE email = 'noor.ahmed.app@example.com' LIMIT 1);

-- Show current enrollments BEFORE cleanup
SELECT '=== BEFORE: Noor Ahmed Current Enrollments ===' as status;
SELECT 
    mc.id as course_id,
    mc.shortname,
    mc.fullname,
    ue.status,
    FROM_UNIXTIME(ue.timemodified) as enrolled_date
FROM mdl_user_enrolments ue
JOIN mdl_enrol me ON ue.enrolid = me.id
JOIN mdl_course mc ON me.courseid = mc.id
WHERE ue.userid = @noor_userid;

-- Delete all enrollments for Noor
DELETE ue FROM mdl_user_enrolments ue
JOIN mdl_enrol me ON ue.enrolid = me.id
JOIN mdl_course mc ON me.courseid = mc.id
WHERE ue.userid = @noor_userid;

SELECT CONCAT('✓ Removed ', ROW_COUNT(), ' incorrect enrollments') as cleanup;

-- Re-enroll Noor ONLY in English Language Course
-- Try to find the course by idnumber, shortname, or title
INSERT IGNORE INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, modifierid, timemodified)
SELECT 
    me.id,
    @noor_userid,
    0,
    UNIX_TIMESTAMP(NOW()),
    0,
    2,
    UNIX_TIMESTAMP(NOW())
FROM mdl_course mc
JOIN mdl_enrol me ON me.courseid = mc.id AND me.enrol = 'manual'
WHERE (
    mc.idnumber = 'ENG-LANG-001'
    OR mc.shortname = 'ENG-LANG-001'
    OR mc.fullname LIKE '%English Language Course%'
)
AND mc.id > 1
LIMIT 1;

SELECT CONCAT('✓ Enrolled in correct course: ', ROW_COUNT()) as result;

-- Show AFTER cleanup
SELECT '=== AFTER: Noor Ahmed Final Enrollments ===' as status;
SELECT 
    mc.id as course_id,
    mc.shortname,
    mc.fullname,
    ue.status,
    FROM_UNIXTIME(ue.timemodified) as enrolled_date
FROM mdl_user_enrolments ue
JOIN mdl_enrol me ON ue.enrolid = me.id
JOIN mdl_course mc ON me.courseid = mc.id
WHERE ue.userid = @noor_userid;
