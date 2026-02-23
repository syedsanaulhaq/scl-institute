-- Enroll all 4 approved students to available Moodle courses
-- All students enrolled to Courses 2 and 4 (same as other registered users)

-- First, remove all current enrollments for the 4 approved students
DELETE FROM mdl_user_enrolments WHERE userid IN (26, 28, 29, 30);

-- Get enrolment instance IDs for the 2 standard courses
SET @enrol_id_course_2 = (SELECT id FROM mdl_enrol WHERE courseid = 2 AND enrol = 'manual' LIMIT 1);
SET @enrol_id_course_4 = (SELECT id FROM mdl_enrol WHERE courseid = 4 AND enrol = 'manual' LIMIT 1);

-- Enroll all 4 students to course 2 (BSC Business Management)
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timemodified)
SELECT @enrol_id_course_2, u.id, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW())
FROM mdl_user u
WHERE u.id IN (26, 28, 29, 30)
AND u.deleted = 0;

-- Enroll all 4 students to course 4 (BTEC Higher National Diploma)
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timemodified)
SELECT @enrol_id_course_4, u.id, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW())
FROM mdl_user u
WHERE u.id IN (26, 28, 29, 30)
AND u.deleted = 0;

-- Verification: Show enrollments for all 4 approved students
SELECT 
  u.id,
  u.firstname,
  u.lastname,
  u.email,
  GROUP_CONCAT(c.shortname ORDER BY c.id SEPARATOR ', ') as enrolled_courses,
  COUNT(ue.id) as course_count
FROM mdl_user u
LEFT JOIN mdl_user_enrolments ue ON u.id = ue.userid
LEFT JOIN mdl_enrol e ON ue.enrolid = e.id
LEFT JOIN mdl_course c ON e.courseid = c.id
WHERE u.id IN (26, 28, 29, 30)
GROUP BY u.id, u.firstname, u.lastname, u.email
ORDER BY u.id;
