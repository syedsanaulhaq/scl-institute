-- Map old course codes to new Moodle courses

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

-- Verify the updates
SELECT id, email, first_name, course_code, course_title FROM student_applications WHERE application_status IN ('accepted', 'conditional_accept');
