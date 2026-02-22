-- Enroll 4 approved SCL students to 2 major courses only
-- Students: Ahmed Hassan (26), Mohammed Khan (28), Mohammed Hassan (29), Mohammed Khalid (30)
-- Courses: BSC Business Management (2), BTEC Higher National Diploma (4)

-- First, remove all previous enrollments for these 4 students
DELETE FROM mdl_user_enrolments WHERE userid IN (26, 28, 29, 30);

-- Get enrolment instance IDs for courses 2 and 4
SET @enrol_id_course_2 = (SELECT id FROM mdl_enrol WHERE courseid = 2 AND enrol = 'manual' LIMIT 1);
SET @enrol_id_course_4 = (SELECT id FROM mdl_enrol WHERE courseid = 4 AND enrol = 'manual' LIMIT 1);

-- Enroll all 4 students to course 2 (BSC Business Management)
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timemodified)
VALUES 
  (@enrol_id_course_2, 26, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW())),
  (@enrol_id_course_2, 28, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW())),
  (@enrol_id_course_2, 29, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW())),
  (@enrol_id_course_2, 30, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW()));

-- Enroll all 4 students to course 4 (BTEC Higher National Diploma)
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timemodified)
VALUES 
  (@enrol_id_course_4, 26, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW())),
  (@enrol_id_course_4, 28, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW())),
  (@enrol_id_course_4, 29, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW())),
  (@enrol_id_course_4, 30, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW()));

-- Verification: Check enrollments for all 4 students
SELECT 
  u.id,
  u.firstname,
  u.lastname,
  u.email,
  COUNT(ue.id) as enrolled_courses
FROM mdl_user u
LEFT JOIN mdl_user_enrolments ue ON u.id = ue.userid
WHERE u.id IN (26, 28, 29, 30)
GROUP BY u.id, u.firstname, u.lastname, u.email;
