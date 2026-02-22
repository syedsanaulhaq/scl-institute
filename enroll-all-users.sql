-- Enroll all other registered users to 2 major courses
-- Excluding: User 1 (main admin), Users 26, 28, 29, 30 (already done), User 27 (already has 25)
-- Users to enroll: 2-25 (all other registered users)

-- Get enrolment instance IDs for the 2 major courses
SET @enrol_id_course_2 = (SELECT id FROM mdl_enrol WHERE courseid = 2 AND enrol = 'manual' LIMIT 1);
SET @enrol_id_course_4 = (SELECT id FROM mdl_enrol WHERE courseid = 4 AND enrol = 'manual' LIMIT 1);

-- First, clear any existing enrollments for these users to avoid duplicates
DELETE FROM mdl_user_enrolments 
WHERE userid IN (2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25);

-- Enroll all other users to course 2 (BSC Business Management)
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timemodified)
SELECT @enrol_id_course_2, u.id, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW())
FROM mdl_user u
WHERE u.id IN (2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25)
AND u.deleted = 0;

-- Enroll all other users to course 4 (BTEC Higher National Diploma)
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timemodified)
SELECT @enrol_id_course_4, u.id, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW())
FROM mdl_user u
WHERE u.id IN (2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25)
AND u.deleted = 0;

-- Verification: Show all registered users and their enrollment counts
SELECT 
  u.id,
  u.firstname,
  u.lastname,
  CASE 
    WHEN u.id IN (26, 28, 29, 30) THEN 'Approved Student'
    WHEN u.username LIKE 'student.%' THEN 'Student'
    WHEN u.username LIKE 'prof.%' OR u.username LIKE 'dr.%' OR u.username LIKE 'eng.%' THEN 'Instructor'
    WHEN u.username LIKE 'manager.%' THEN 'Department Manager'
    ELSE 'Admin/Staff'
  END as user_role,
  COUNT(ue.id) as enrolled_courses
FROM mdl_user u
LEFT JOIN mdl_user_enrolments ue ON u.id = ue.userid
WHERE u.id NOT IN (1) -- Exclude main admin
AND u.deleted = 0
GROUP BY u.id, u.firstname, u.lastname
ORDER BY enrolled_courses DESC, u.id;
