-- Create the missing AI courses in Moodle that students applied for

-- Create Course: Artificial Intelligence & Machine Learning Certification (AI-CERT-001)
INSERT INTO mdl_course (
  category, sortorder, fullname, shortname, idnumber, summary, summaryformat, format, 
  timemodified, startdate, enddate, visible
)
VALUES (
  1, (SELECT MAX(sortorder) + 1 FROM mdl_course), 
  'Artificial Intelligence & Machine Learning Certification',
  'AI-CERT-001',
  'AI-CERT-001',
  'Advanced certification in AI and Machine Learning',
  1, 'topics', UNIX_TIMESTAMP(NOW()), UNIX_TIMESTAMP(NOW()), 0, 1
);

-- Create Course: Artificial Intelligence Basics (CERT-AI-001)
INSERT INTO mdl_course (
  category, sortorder, fullname, shortname, idnumber, summary, summaryformat, format, 
  timemodified, startdate, enddate, visible
)
VALUES (
  1, (SELECT MAX(sortorder) + 1 FROM mdl_course), 
  'Artificial Intelligence Basics',
  'CERT-AI-001',
  'CERT-AI-001',
  'Introduction to Artificial Intelligence fundamentals',
  1, 'topics', UNIX_TIMESTAMP(NOW()), UNIX_TIMESTAMP(NOW()), 0, 1
);

-- Create manual enrol instances for both new courses
SET @course_ai_cert = (SELECT id FROM mdl_course WHERE idnumber = 'AI-CERT-001' LIMIT 1);
SET @course_cert_ai = (SELECT id FROM mdl_course WHERE idnumber = 'CERT-AI-001' LIMIT 1);

INSERT INTO mdl_enrol (enrol, status, courseid, sortorder, name, timemodified)
VALUES 
  ('manual', 0, @course_ai_cert, 0, 'Manual enrolments', UNIX_TIMESTAMP(NOW())),
  ('manual', 0, @course_cert_ai, 0, 'Manual enrolments', UNIX_TIMESTAMP(NOW()));

-- Get the new enrol instance IDs
SET @enrol_id_ai_cert = (SELECT id FROM mdl_enrol WHERE courseid = @course_ai_cert AND enrol = 'manual' LIMIT 1);
SET @enrol_id_cert_ai = (SELECT id FROM mdl_enrol WHERE courseid = @course_cert_ai AND enrol = 'manual' LIMIT 1);

-- Enroll students to their applied AI courses
-- Mohammed Khalid (30): AI & Machine Learning Certification (AI-CERT-001)
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timemodified)
VALUES (@enrol_id_ai_cert, 30, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW()));

-- Mohammed Hassan (29): Artificial Intelligence Basics (CERT-AI-001)
INSERT INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timemodified)
VALUES (@enrol_id_cert_ai, 29, 0, UNIX_TIMESTAMP(NOW()), 0, UNIX_TIMESTAMP(NOW()));

-- Verification: Show all courses for AI students
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
WHERE u.id IN (29, 30)
GROUP BY u.id, u.firstname, u.lastname, u.email
ORDER BY u.id;
