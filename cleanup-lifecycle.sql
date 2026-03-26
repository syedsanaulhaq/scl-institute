-- Cleanup Course Lifecycle Test Records
-- This removes all records from course lifecycle and related tables

SET FOREIGN_KEY_CHECKS=0;

DELETE FROM accreditation_signoffs WHERE 1=1;
DELETE FROM accreditation_risks WHERE 1=1;
DELETE FROM accreditation_tasks WHERE 1=1;
DELETE FROM course_accreditations WHERE 1=1;
DELETE FROM course_registrations WHERE 1=1;
DELETE FROM course_lifecycle_master WHERE 1=1;
DELETE FROM scl_local_categories WHERE 1=1;

SET FOREIGN_KEY_CHECKS=1;

-- Confirm all tables are empty
SELECT 'Verification - Remaining Records:' as status;
SELECT 'course_lifecycle_master' as table_name, COUNT(*) as count FROM course_lifecycle_master
UNION ALL
SELECT 'course_registrations', COUNT(*) FROM course_registrations
UNION ALL
SELECT 'course_accreditations', COUNT(*) FROM course_accreditations
UNION ALL
SELECT 'accreditation_tasks', COUNT(*) FROM accreditation_tasks
UNION ALL
SELECT 'accreditation_risks', COUNT(*) FROM accreditation_risks
UNION ALL
SELECT 'accreditation_signoffs', COUNT(*) FROM accreditation_signoffs
UNION ALL
SELECT 'scl_local_categories', COUNT(*) FROM scl_local_categories;
