-- Verify sections were created
SELECT id, course, section, name, summary 
FROM mdl_course_sections 
WHERE course = 11 
ORDER BY section;
