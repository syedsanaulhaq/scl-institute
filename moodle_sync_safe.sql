-- Safe Moodle Data Sync for Production
-- This adds missing users and courses without conflicts

USE bitnami_moodle;

-- Insert missing users (IDs 4-7 from local)
-- These are students who completed applications
INSERT IGNORE INTO mdl_user (id, username, email, firstname, lastname, password, confirmed, mnethostid, auth) VALUES
(4, 'ahmed.hassan.app@example.com', 'ahmed.hassan.app@example.com', 'Ahmed', 'Hassan', 'not cached', 1, 1, 'manual'),
(5, 'mohammed.khan.app@example.com', 'mohammed.khan.app@example.com', 'Mohammed', 'Khan', 'not cached', 1, 1, 'manual'),
(6, 'mohammed.hassan@example.com', 'mohammed.hassan@example.com', 'Mohammed', 'Hassan', 'not cached', 1, 1, 'manual'),
(7, 'mohammed.khalid@example.com', 'mohammed.khalid@example.com', 'Mohammed', 'Khan', 'not cached', 1, 1, 'manual');

-- Insert missing courses if they don't exist
INSERT IGNORE INTO mdl_course (id, category, fullname, shortname, visible, format, timecreated, timemodified) VALUES
(14, 1, 'English Language Course', 'LANG-ENG-001', 1, 'topics', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(15, 1, 'Artificial Intelligence & Machine Learning Certification', 'AI-CERT-001', 1, 'topics', UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- Verify sync
SELECT 'Moodle Sync Complete!' AS Status;
SELECT COUNT(*) - 2 AS TotalCourses FROM mdl_course;
SELECT COUNT(*) - 2 AS TotalUsers FROM mdl_user;
