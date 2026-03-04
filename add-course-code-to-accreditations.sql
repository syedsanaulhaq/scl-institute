-- Add course_code column to course_accreditations if it doesn't exist
ALTER TABLE course_accreditations ADD COLUMN course_code VARCHAR(50) AFTER course_title;
