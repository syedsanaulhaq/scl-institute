-- Map old course codes to new Moodle courses
-- This will reassign students from old courses to proper Moodle courses

-- Clear existing enrollments first (keeping only admin)
DELETE FROM mdl_user_enrolments 
WHERE userid NOT IN (SELECT id FROM mdl_user WHERE username='admin');

-- Create course enrollment mapping
-- Business courses mapping
UPDATE student_applications 
SET course_code = 'MBA-BA-001' 
WHERE course_code LIKE 'BUS%' OR course_title LIKE '%Business%';

-- Accounting mapping  
UPDATE student_applications 
SET course_code = 'BCOM-001' 
WHERE course_code LIKE 'ACC%' OR course_title LIKE '%Accounting%' OR course_title LIKE '%Finance%';

-- Engineering courses mapping
UPDATE student_applications 
SET course_code = 'BTECH-CSE-001' 
WHERE course_code LIKE 'ENG%' OR course_code LIKE 'TECH%' OR course_title LIKE '%Engineering%' OR course_title LIKE '%Technology%';

-- Update course titles to match
UPDATE student_applications sa
INNER JOIN courses c ON sa.course_code = c.course_code
SET sa.course_title = c.course_name
WHERE sa.course_code IN (SELECT course_code FROM courses);
