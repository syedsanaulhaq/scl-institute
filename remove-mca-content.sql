-- Remove all course content added to MCA course (ID: 11)
-- This removes activities, assignments, quizzes, forums, resources, URLs and sections

-- Delete from course modules (this will cascade or we delete referenced activities first)
DELETE FROM mdl_course_modules WHERE course = 11;

-- Delete assignments
DELETE FROM mdl_assign WHERE course = 11;

-- Delete quizzes
DELETE FROM mdl_quiz WHERE course = 11;

-- Delete forums
DELETE FROM mdl_forum WHERE course = 11;

-- Delete resources
DELETE FROM mdl_resource WHERE course = 11;

-- Delete URLs
DELETE FROM mdl_url WHERE course = 11;

-- Delete course sections (except the General section which is section 0)
DELETE FROM mdl_course_sections WHERE course = 11 AND section != 0;

-- Verify removal
SELECT 'Content removal complete. Current status:' AS status;
SELECT 'Course Modules:' AS type, COUNT(*) AS count FROM mdl_course_modules WHERE course = 11
UNION ALL
SELECT 'Assignments:', COUNT(*) FROM mdl_assign WHERE course = 11
UNION ALL
SELECT 'Quizzes:', COUNT(*) FROM mdl_quiz WHERE course = 11
UNION ALL
SELECT 'Forums:', COUNT(*) FROM mdl_forum WHERE course = 11
UNION ALL
SELECT 'Resources:', COUNT(*) FROM mdl_resource WHERE course = 11
UNION ALL
SELECT 'URLs:', COUNT(*) FROM mdl_url WHERE course = 11
UNION ALL
SELECT 'Sections:', COUNT(*) FROM mdl_course_sections WHERE course = 11 AND section != 0;
