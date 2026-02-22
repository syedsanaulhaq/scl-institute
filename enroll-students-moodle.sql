-- Enroll students in Moodle courses based on their course codes

-- First, get the mapping of course codes to course IDs
-- MBA-BA-001 is course ID 15
-- BCOM-001 is course ID 17
-- BTECH-CSE-001 is course ID 14

-- Create enrol method record for manual enrolment if not exists
INSERT IGNORE INTO mdl_enrol (enrol, status, courseid, sortorder, name)
SELECT 'manual', 0, c.id, 0, NULL
FROM mdl_course c;

-- Enroll Ahmed Hassan (student ID 1) in MBA-BA-001 (course ID 15)
-- First create/find user
INSERT IGNORE INTO mdl_user (auth, username, firstname, lastname, email, confirmed, policyagreed, deleted, mnethostid, password, timecreated, timemodified)
VALUES ('manual', 'ahmed.hassan.app@example.com', 'Ahmed', 'Hassan', 'ahmed.hassan.app@example.com', 1, 0, 0, 1, MD5('temp'), UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- Enroll Ahmed in MBA-BA-001
INSERT IGNORE INTO mdl_user_enrolments (status, enrolid, userid, timestart, timeend, timecreated, timemodified)
SELECT 0, e.id, u.id, UNIX_TIMESTAMP(), 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
FROM mdl_enrol e, mdl_user u, mdl_course c
WHERE e.courseid = c.id AND c.shortname = 'MBA-BA-001' AND u.email = 'ahmed.hassan.app@example.com' AND e.enrol = 'manual';

-- Enroll Mohammed Khan (student ID 3) in BCOM-001 (course ID 17)
INSERT IGNORE INTO mdl_user (auth, username, firstname, lastname, email, confirmed, policyagreed, deleted, mnethostid, password, timecreated, timemodified)
VALUES ('manual', 'mohammed.khan.app@example.com', 'Mohammed', 'Khan', 'mohammed.khan.app@example.com', 1, 0, 0, 1, MD5('temp'), UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

INSERT IGNORE INTO mdl_user_enrolments (status, enrolid, userid, timestart, timeend, timecreated, timemodified)
SELECT 0, e.id, u.id, UNIX_TIMESTAMP(), 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
FROM mdl_enrol e, mdl_user u, mdl_course c
WHERE e.courseid = c.id AND c.shortname = 'BCOM-001' AND u.email = 'mohammed.khan.app@example.com' AND e.enrol = 'manual';

-- Enroll Noor Ahmed (student ID 4) in BTECH-CSE-001 (course ID 14)
INSERT IGNORE INTO mdl_user (auth, username, firstname, lastname, email, confirmed, policyagreed, deleted, mnethostid, password, timecreated, timemodified)
VALUES ('manual', 'noor.ahmed.app@example.com', 'Noor', 'Ahmed', 'noor.ahmed.app@example.com', 1, 0, 0, 1, MD5('temp'), UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

INSERT IGNORE INTO mdl_user_enrolments (status, enrolid, userid, timestart, timeend, timecreated, timemodified)
SELECT 0, e.id, u.id, UNIX_TIMESTAMP(), 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
FROM mdl_enrol e, mdl_user u, mdl_course c
WHERE e.courseid = c.id AND c.shortname = 'BTECH-CSE-001' AND u.email = 'noor.ahmed.app@example.com' AND e.enrol = 'manual';

-- Verify enrollments
SELECT u.email, u.firstname, u.lastname, c.shortname, c.fullname
FROM mdl_user_enrolments ue
JOIN mdl_user u ON ue.userid = u.id
JOIN mdl_enrol e ON ue.enrolid = e.id
JOIN mdl_course c ON e.courseid = c.id
WHERE u.email LIKE '%@example.com%'
ORDER BY u.email;
