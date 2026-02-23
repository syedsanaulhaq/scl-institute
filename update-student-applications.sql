-- Update student applications to match their Moodle course enrollments
-- Change from applied AI courses to actual available courses they're enrolled in

-- Ahmed Hassan: Change from Business Administration HND to BSC Business Management
UPDATE student_applications 
SET course_title = 'BSC (Hons) Business Management offered with Foundation Year',
    course_code = 'SCL-BSC-HONS-BUSINESS-MANAGEMENT-OFFERED-WITH-FOU'
WHERE first_name = 'Ahmed' AND last_name = 'Hassan' AND email = 'ahmed.hassan.app@example.com';

-- Mohammed Khan: Change from Accounting and Finance HND to BSC Business Management
UPDATE student_applications 
SET course_title = 'BSC (Hons) Business Management offered with Foundation Year',
    course_code = 'SCL-BSC-HONS-BUSINESS-MANAGEMENT-OFFERED-WITH-FOU'
WHERE first_name = 'Mohammed' AND last_name = 'Khan' AND email = 'mohammed.khan.app@example.com';

-- Mohammed Hassan: Change from AI Basics to BTEC Higher National Diploma
UPDATE student_applications 
SET course_title = 'BTEC Higher National Diploma (2 Years)',
    course_code = 'SCL-BTEC-HIGHER-NATIONAL-DIPLOMA-2-YEARS'
WHERE first_name = 'Mohammed' AND last_name = 'Hassan' AND email = 'mohammed.hassan@example.com';

-- Mohammed Khalid: Change from AI & Machine Learning to BTEC Higher National Diploma
UPDATE student_applications 
SET course_title = 'BTEC Higher National Diploma (2 Years)',
    course_code = 'SCL-BTEC-HIGHER-NATIONAL-DIPLOMA-2-YEARS'
WHERE first_name = 'Mohammed' AND last_name = 'khan' AND email = 'mohammed.khalid@example.com';
