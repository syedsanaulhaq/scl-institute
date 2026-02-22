-- Map approved SCL students to similar Moodle courses based on their applications
-- Unenroll from generic courses and enroll to courses matching their applied course

-- User IDs and their applications:
-- 26: Ahmed Hassan - Applied for Business Administration HND (MBA-BA-001)
--     MAP TO: Course 10 (HND IN BUSINESS RQF) + Course 2 (BSC Business Management)
-- 28: Mohammed Khan (khan.app) - Applied for Accounting and Finance HND (BCOM-001)
--     MAP TO: Course 10 (HND IN BUSINESS RQF) + Course 2 (BSC Business Management)
-- 29: Mohammed Hassan - Applied for Artificial Intelligence Basics (CERT-AI-001)
--     MAP TO: Course 8 (HNC/HND Administration and Information Technology)
-- 30: Mohammed Khalid - Applied for AI & Machine Learning Certification (AI-CERT-001)
--     MAP TO: Course 8 (HNC/HND Administration and Information Technology)

-- First, remove all current enrollments for the 4 approved students
DELETE FROM mdl_user_enrolments WHERE userid IN (26, 28, 29, 30);

-- Get enrolment instance IDs for the mapped courses
SET @enrol_id_course_2 = (SELECT id FROM mdl_enrol WHERE courseid = 2 AND enrol = 'manual' LIMIT 1);
SET @enrol_id_course_8 = (SELECT id FROM mdl_enrol WHERE courseid = 8 AND enrol = 'manual' LIMIT 1);
SET @enrol_id_course_10 = (SELECT id FROM mdl_enrol WHERE courseid = 10 AND enrol = 'manual' LIMIT 1);

-- Ahmed Hassan (26): Business Administration HND → Courses 2 + 10
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timemodified)
VALUES 
  (@enrol_id_course_2, 26, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW())),
  (@enrol_id_course_10, 26, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW()));

-- Mohammed Khan (28): Accounting and Finance HND → Courses 2 + 10
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timemodified)
VALUES 
  (@enrol_id_course_2, 28, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW())),
  (@enrol_id_course_10, 28, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW()));

-- Mohammed Hassan (29): Artificial Intelligence Basics → Course 8
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timemodified)
VALUES 
  (@enrol_id_course_8, 29, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW()));

-- Mohammed Khalid (30): AI & Machine Learning Certification → Course 8
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timemodified)
VALUES 
  (@enrol_id_course_8, 30, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW()));

-- Verification: Show mapped courses for all 4 approved students
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
