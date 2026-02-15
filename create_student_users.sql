-- Create student user accounts from student_applications
-- This syncs all accepted students with the users table so they can login

-- Create temporary table to hold unique student emails
CREATE TEMPORARY TABLE temp_student_users AS
SELECT DISTINCT 
    email,
    first_name,
    last_name,
    'password' as password,
    'student' as role
FROM student_applications
WHERE application_status = 'accepted'
AND offer_accepted = 1;

-- Insert students into users table (avoiding duplicates)
INSERT INTO users (email, first_name, last_name, password, role, created_at, updated_at)
SELECT 
    email,
    first_name,
    last_name,
    password,
    role,
    NOW(),
    NOW()
FROM temp_student_users
WHERE email NOT IN (SELECT email FROM users WHERE role = 'student')
ON DUPLICATE KEY UPDATE 
    updated_at = NOW();

-- Show created users
SELECT COUNT(*) as students_created FROM users WHERE role = 'student';

-- Display list of student accounts
SELECT id, email, CONCAT(first_name, ' ', last_name) as name, role, created_at 
FROM users 
WHERE role = 'student' 
ORDER BY created_at DESC 
LIMIT 20;
