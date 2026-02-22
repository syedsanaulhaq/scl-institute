-- Fix User Roles Capitalization
-- Date: 2026-02-17
-- Purpose: Update all user roles to match frontend expectations (proper capitalization)

USE scl_institute;

-- Update all roles to proper title case
UPDATE users 
SET role = CASE 
    WHEN role = 'super admin' THEN 'Super Admin'
    WHEN role = 'admissions officer' THEN 'Admissions Officer'
    WHEN role = 'faculty & hr manager' THEN 'Faculty & HR Manager'
    WHEN role = 'lms manager' THEN 'LMS Manager'
    WHEN role = 'manager' THEN 'Manager'
    WHEN role = 'student' THEN 'Student'
    WHEN role = 'teacher' THEN 'Teacher'
    ELSE role 
END;

-- Verify roles
SELECT DISTINCT role, COUNT(*) as user_count 
FROM users 
GROUP BY role 
ORDER BY role;
