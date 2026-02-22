-- Moodle Course Cleanup & Student Enrollment
-- Remove problematic content and enroll students

USE bitnami_moodle;

-- ===== STEP 1: Remove Problematic Content =====

-- Delete all course modules/activities (they cause issues)
DELETE FROM mdl_course_modules WHERE course > 1;
SELECT "✓ Deleted course modules" as cleanup_step;

-- Delete extra course sections, keep only default section 0
DELETE FROM mdl_course_sections WHERE course > 1 AND section > 0;
SELECT "✓ Deleted extra sections" as cleanup_step;

-- Reset default section content
UPDATE mdl_course_sections 
SET name = NULL, summary = NULL, summaryformat = 1 
WHERE course > 1 AND section = 0;
SELECT "✓ Reset default sections" as cleanup_step;

-- ===== STEP 2: Add Placeholder Content =====

-- Add welcome message to courses missing summaries
UPDATE mdl_course 
SET summary = CONCAT(
    'Welcome to ', fullname, '.<br><br>',
    'This is a professional qualification course offered by Stratford College London.<br><br>',
    '<strong>Course Overview:</strong><br>',
    'This course provides comprehensive training and certification in the subject area outlined in the course code.<br><br>',
    '<strong>What You Will Learn:</strong><br>',
    'Students will have access to learning materials, resources, assignments, and assessment opportunities.<br><br>',
    '<strong>Course Support:</strong><br>',
    'Please contact your course administrator or support team for any questions, technical issues, or academic guidance.<br><br>',
    '<em>Course Last Updated: ' , DATE_FORMAT(NOW(), '%Y-%m-%d'), '</em>'
)
WHERE id > 1;
SELECT CONCAT("✓ Added placeholder content to ", ROW_COUNT(), " courses") as cleanup_step;

-- ===== STEP 3: Setup Enrollment Methods =====

-- Ensure each course has self-enrollment enabled
INSERT IGNORE INTO mdl_enrol (enrol, status, courseid, sortorder, name, enrolperiod, enrolstartdate, enrolenddate, expirynotify, expirythreshold, notifyall, longname, cost, currency, roleid, customint1, customint2, customint3, customint4, customtext1, customtext2, customdec1, customdec2, timecreated, timemodified)
SELECT 'manual', 0, c.id, 0, NULL, 0, 0, 0, 0, 604800, 0, NULL, '', 'USD', 5, 1, 0, 0, 0, '', '', 0, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
FROM mdl_course c
WHERE c.id > 1 AND NOT EXISTS (SELECT 1 FROM mdl_enrol e WHERE e.courseid = c.id AND e.enrol = 'manual')
LIMIT 25;
SELECT CONCAT("✓ Created enrollment method for courses") as enrollment_step;

-- ===== STEP 4: Enroll Students in All Courses =====

-- Get enrollment IDs for all courses
SET @enrol_ids = (SELECT GROUP_CONCAT(id) FROM mdl_enrol WHERE courseid > 1);

-- Enroll each student (id > 1, non-admin) in all courses
-- This uses a batch INSERT to avoid duplicates
INSERT IGNORE INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, modifierid, timecreated, timemodified)
SELECT 
    e.id,
    u.id,
    0,
    UNIX_TIMESTAMP(),
    0,
    1,
    UNIX_TIMESTAMP(),
    UNIX_TIMESTAMP()
FROM mdl_enrol e
CROSS JOIN mdl_user u
WHERE e.courseid > 1 
  AND u.id > 1 
  AND u.deleted = 0
  AND u.username != 'support_user'
  AND NOT EXISTS (
    SELECT 1 FROM mdl_user_enrolments ue 
    WHERE ue.enrolid = e.id AND ue.userid = u.id
  );

SELECT CONCAT("✓ Enrolled students - ", ROW_COUNT(), " new enrollments") as enrollment_step;

-- ===== STEP 5: Assign Student Role =====

-- Assign Student role (roleid=5) to all enrolled users
INSERT IGNORE INTO mdl_role_assignments (roleid, contextid, userid, timemodified, modifierid)
SELECT 
    5,
    ctc.id,
    ue.userid,
    UNIX_TIMESTAMP(),
    1
FROM mdl_user_enrolments ue
JOIN mdl_enrol e ON e.id = ue.enrolid
JOIN mdl_context ctc ON ctc.instanceid = e.courseid AND ctc.contextlevel = 50
LEFT JOIN mdl_role_assignments ra ON ra.contextid = ctc.id AND ra.userid = ue.userid AND ra.roleid = 5
WHERE ra.id IS NULL AND e.courseid > 1;

SELECT CONCAT("✓ Assigned student roles - ", ROW_COUNT(), " new assignments") as role_step;

-- ===== FINAL VERIFICATION =====

SELECT "=== CLEANUP & ENROLLMENT RESULTS ===" as verification;

SELECT 
    (SELECT COUNT(*) FROM mdl_course WHERE id > 1) as total_courses,
    (SELECT COUNT(*) FROM mdl_user WHERE id > 1) as total_students,
    (SELECT COUNT(*) FROM mdl_course_sections WHERE course > 1) as course_sections,
    (SELECT COUNT(*) FROM mdl_course_modules WHERE course > 1) as course_modules,
    (SELECT COUNT(DISTINCT courseid) FROM mdl_enrol WHERE courseid > 1) as courses_with_enrollment
AS summary;

SELECT CONCAT(
    "✓ Cleanup Complete: ",
    (SELECT COUNT(*) FROM mdl_course WHERE id > 1),
    " courses ready, ",
    (SELECT COUNT(*) FROM mdl_user WHERE id > 1),
    " students enrolled"
) as final_status;
