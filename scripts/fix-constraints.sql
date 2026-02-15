-- Remove unique constraint from email
ALTER TABLE student_applications DROP INDEX email;

-- Add composite unique key on (email, course_code)
ALTER TABLE student_applications ADD UNIQUE KEY unique_email_course (email, course_code);
