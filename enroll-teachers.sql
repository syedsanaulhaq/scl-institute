-- Create teachers in Moodle and assign to courses

-- Create teacher user accounts
INSERT IGNORE INTO mdl_user (auth, username, firstname, lastname, email, confirmed, policyagreed, deleted, mnethostid, password, city, country, lang, timezone, timecreated, timemodified) VALUES
('manual', 'dr.ahmed.cs@scl.edu', 'Ahmed', 'Khan', 'dr.ahmed.cs@scl.edu', 1, 0, 0, 1, MD5('TeacherPass123'), 'London', 'GB', 'en', 'Europe/London', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('manual', 'prof.sara.ai@scl.edu', 'Sara', 'Ahmed', 'prof.sara.ai@scl.edu', 1, 0, 0, 1, MD5('TeacherPass123'), 'London', 'GB', 'en', 'Europe/London', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('manual', 'dr.hassan.ml@scl.edu', 'Hassan', 'Ali', 'dr.hassan.ml@scl.edu', 1, 0, 0, 1, MD5('TeacherPass123'), 'London', 'GB', 'en', 'Europe/London', UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- Get course IDs
SET @mba_course = (SELECT id FROM mdl_course WHERE shortname = 'MBA-BA-001');
SET @bcom_course = (SELECT id FROM mdl_course WHERE shortname = 'BCOM-001');
SET @btech_course = (SELECT id FROM mdl_course WHERE shortname = 'BTECH-CSE-001');
SET @mtech_course = (SELECT id FROM mdl_course WHERE shortname = 'MTECH-DS-001');

-- Create manual enrollment instances for courses if not exists
INSERT IGNORE INTO mdl_enrol (enrol, status, courseid, sortorder, roleid) VALUES
('manual', 0, @mba_course, 0, 3),
('manual', 0, @bcom_course, 0, 3),
('manual', 0, @btech_course, 0, 3),
('manual', 0, @mtech_course, 0, 3);

-- Get teacher user IDs
SET @teacher1 = (SELECT id FROM mdl_user WHERE email = 'dr.ahmed.cs@scl.edu');
SET @teacher2 = (SELECT id FROM mdl_user WHERE email = 'prof.sara.ai@scl.edu');
SET @teacher3 = (SELECT id FROM mdl_user WHERE email = 'dr.hassan.ml@scl.edu');

-- Enroll teachers as editing teachers (roleid = 3)
-- Dr. Ahmed for BTECH and MTECH courses
INSERT IGNORE INTO mdl_user_enrolments (status, enrolid, userid, timestart, timeend, timecreated, timemodified) 
SELECT 0, e.id, @teacher1, UNIX_TIMESTAMP(), 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
FROM mdl_enrol e WHERE e.courseid = @btech_course AND e.enrol = 'manual';

INSERT IGNORE INTO mdl_user_enrolments (status, enrolid, userid, timestart, timeend, timecreated, timemodified)
SELECT 0, e.id, @teacher1, UNIX_TIMESTAMP(), 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
FROM mdl_enrol e WHERE e.courseid = @mtech_course AND e.enrol = 'manual';

-- Prof. Sara for MBA course
INSERT IGNORE INTO mdl_user_enrolments (status, enrolid, userid, timestart, timeend, timecreated, timemodified)
SELECT 0, e.id, @teacher2, UNIX_TIMESTAMP(), 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
FROM mdl_enrol e WHERE e.courseid = @mba_course AND e.enrol = 'manual';

-- Dr. Hassan for BCOM course  
INSERT IGNORE INTO mdl_user_enrolments (status, enrolid, userid, timestart, timeend, timecreated, timemodified)
SELECT 0, e.id, @teacher3, UNIX_TIMESTAMP(), 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
FROM mdl_enrol e WHERE e.courseid = @bcom_course AND e.enrol = 'manual';

-- Assign editing teacher role to enrolled teachers
-- Get context IDs for courses
SET @mba_context = (SELECT id FROM mdl_context WHERE contextlevel = 50 AND instanceid = @mba_course);
SET @bcom_context = (SELECT id FROM mdl_context WHERE contextlevel = 50 AND instanceid = @bcom_course);
SET @btech_context = (SELECT id FROM mdl_context WHERE contextlevel = 50 AND instanceid = @btech_course);
SET @mtech_context = (SELECT id FROM mdl_context WHERE contextlevel = 50 AND instanceid = @mtech_course);

-- Assign roles (roleid 3 = editingteacher)
INSERT IGNORE INTO mdl_role_assignments (roleid, contextid, userid, timemodified, modifierid) VALUES
(3, @btech_context, @teacher1, UNIX_TIMESTAMP(), 2),
(3, @mtech_context, @teacher1, UNIX_TIMESTAMP(), 2),
(3, @mba_context, @teacher2, UNIX_TIMESTAMP(), 2),
(3, @bcom_context, @teacher3, UNIX_TIMESTAMP(), 2);

SELECT 'Teachers created and enrolled!' as status;
