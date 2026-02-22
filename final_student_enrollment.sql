-- Comprehensive Student Enrollment in All Courses

USE bitnami_moodle;

-- Insert enrollment instances for all courses if not already exists
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
  AND u.id > 2  -- Skip admin users (id 1, 2)
  AND u.deleted = 0;

SELECT CONCAT("✓ Total enrollments: ", COUNT(*)) as enrollment_status FROM mdl_user_enrolments;

-- Assign Student role to all enrolled users
INSERT IGNORE INTO mdl_role_assignments (roleid, contextid, userid, timemodified, modifierid)
SELECT 
    5,  -- Student role
    ctc.id,
    ue.userid,
    UNIX_TIMESTAMP(),
    1
FROM mdl_user_enrolments ue
JOIN mdl_enrol e ON e.id = ue.enrolid
JOIN mdl_context ctc ON ctc.instanceid = e.courseid AND ctc.contextlevel = 50
WHERE e.courseid > 1 AND NOT EXISTS (
    SELECT 1 FROM mdl_role_assignments ra 
    WHERE ra.contextid = ctc.id AND ra.userid = ue.userid AND ra.roleid = 5
);

SELECT "✓ Student roles assigned" as role_status;

-- Verify enrollment
SELECT 
    (SELECT COUNT(*) FROM mdl_course WHERE id > 1) as total_courses,
    (SELECT COUNT(*) FROM mdl_user WHERE id > 2 AND deleted = 0) as total_students,
    (SELECT COUNT(*) FROM mdl_user_enrolments) as total_enrollments,
    (SELECT COUNT(DISTINCT userid) FROM mdl_user_enrolments) as unique_students_enrolled,
    (SELECT COUNT(DISTINCT enrolid) FROM mdl_user_enrolments ue JOIN mdl_enrol e ON e.id = ue.enrolid WHERE e.courseid > 1) as courses_with_students
AS final_enrollment_stats;

-- Show sample enrollments
SELECT "Sample enrollment distribution:" as info;
SELECT 
    c.shortname,
    c.fullname,
    COUNT(DISTINCT ue.userid) as enrolled_students
FROM mdl_course c
LEFT JOIN mdl_enrol e ON e.courseid = c.id
LEFT JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
WHERE c.id > 1
GROUP BY c.id, c.shortname, c.fullname
ORDER BY c.id
LIMIT 5;
