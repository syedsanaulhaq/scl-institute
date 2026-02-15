-- Check current sections in MCA course
SELECT id, course, section, name, summary, visible 
FROM mdl_course_sections 
WHERE course = 11 
ORDER BY section;
