-- Enroll approved students to all available Moodle courses
-- Students: Ahmed Hassan (26), Mohammed Khan (28), Mohammed Hassan (29), Mohammed Khalid (30)
-- Courses: All courses where id > 1

-- First, ensure each course has a manual enrol method
INSERT INTO mdl_enrol (enrol, courseid, status, sortorder)
SELECT 'manual' as enrol, c.id as courseid, 0 as status, (SELECT MAX(sortorder) + 1 FROM mdl_enrol WHERE courseid = c.id) as sortorder
FROM mdl_course c
WHERE c.id > 1
AND c.id NOT IN (SELECT DISTINCT courseid FROM mdl_enrol WHERE enrol = 'manual')
ORDER BY c.id;

-- Enroll students to courses (role 5 = student)
-- Get or create enrol instances first
INSERT INTO mdl_user_enrolments (userid, enrolid, status, timestart, timeend, modifierid, timemodified)
SELECT u.id, e.id, 0, UNIX_TIMESTAMP(), 0, 1, UNIX_TIMESTAMP()
FROM mdl_user u
CROSS JOIN mdl_enrol e
WHERE u.id IN (26, 28, 29, 30)
AND e.enrol = 'manual'
AND NOT EXISTS (
  SELECT 1 FROM mdl_user_enrolments ue 
  WHERE ue.userid = u.id 
  AND ue.enrolid = e.id
);

-- Ensure role assignments for enrolled users
INSERT INTO mdl_role_assignments (roleid, userid, contextid, timemodified, modifierid)
SELECT 5, ue.userid, (SELECT id FROM mdl_context WHERE contextlevel = 50 AND instanceid = e.courseid LIMIT 1), UNIX_TIMESTAMP(), 1
FROM mdl_user_enrolments ue
JOIN mdl_enrol e ON ue.enrolid = e.id
WHERE ue.userid IN (26, 28, 29, 30)
AND NOT EXISTS (
  SELECT 1 FROM mdl_role_assignments ra
  WHERE ra.userid = ue.userid
  AND ra.roleid = 5
  AND ra.contextid = (SELECT id FROM mdl_context WHERE contextlevel = 50 AND instanceid = e.courseid LIMIT 1)
);

-- Verify enrollments
SELECT 
  u.id,
  u.firstname,
  u.lastname,
  u.email,
  COUNT(DISTINCT e.courseid) as enrolled_courses
FROM mdl_user u
JOIN mdl_user_enrolments ue ON u.id = ue.userid
JOIN mdl_enrol e ON ue.enrolid = e.id
WHERE u.id IN (26, 28, 29, 30)
GROUP BY u.id, u.firstname, u.lastname, u.email;
