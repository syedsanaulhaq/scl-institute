-- ===================================================================
-- COMPLETE COURSE LIFECYCLE DUMMY DATA FOR DEGREE AND HND PROGRAMS
-- ===================================================================
-- This script creates comprehensive dummy data for:
-- 1. Degree Programme (3-year, 6 courses per semester)
-- 2. HND Programme (2-year, 4 courses per semester)
-- Including all years, semesters, and course lifecycle entries

-- ===================================================================
-- 1. CREATE CATEGORIES (Programme Types, Programs, Years, Semesters)
-- ===================================================================

-- Clear existing categories
DELETE FROM categories WHERE category_code IN ('DEG', 'HND', 'Y1', 'Y2', 'Y3', 'S1', 'S2');

-- Insert Programme Type Categories
INSERT INTO categories (category_name, category_code, description, is_active) VALUES
('Degree', 'DEG', 'Bachelor Degree Programs', 1),
('HND', 'HND', 'Higher National Diploma Programs', 1);

SET @deg_id = LAST_INSERT_ID() - 1;
SET @hnd_id = LAST_INSERT_ID();

-- Insert Year Categories
INSERT INTO categories (category_name, category_code, description, is_active) VALUES
('Year 1', 'Y1', 'First Year of Studies', 1),
('Year 2', 'Y2', 'Second Year of Studies', 1),
('Year 3', 'Y3', 'Third Year of Studies', 1);

SET @y1_id = LAST_INSERT_ID() - 2;
SET @y2_id = LAST_INSERT_ID() - 1;
SET @y3_id = LAST_INSERT_ID();

-- Insert Semester Categories
INSERT INTO categories (category_name, category_code, description, is_active) VALUES
('Semester 1', 'S1', 'First Semester / Autumn', 1),
('Semester 2', 'S2', 'Second Semester / Spring', 1);

SET @s1_id = LAST_INSERT_ID() - 1;
SET @s2_id = LAST_INSERT_ID();

-- ===================================================================
-- 2. CREATE DEGREE PROGRAMME LIFECYCLE DATA
-- ===================================================================

-- DEGREE - YEAR 1 - SEMESTER 1
INSERT INTO course_lifecycle_master 
(lifecycle_key, course_title, course_code, programme_type_name, program_name, academic_year, semester_name, 
 programme_type_category_id, year_category_id, semester_category_id, awarding_body, qualification_level, 
 application_type, course_type, version, current_stage, created_at)
VALUES
('DEG-001-Y1-S1-001-2024-2025', 'Foundation Mathematics', 'DEG-001-Y1-S1-001', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 1', @deg_id, @y1_id, @s1_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S1-002-2024-2025', 'Introduction to Programming', 'DEG-001-Y1-S1-002', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 1', @deg_id, @y1_id, @s1_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S1-003-2024-2025', 'Digital Systems', 'DEG-001-Y1-S1-003', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 1', @deg_id, @y1_id, @s1_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S1-004-2024-2025', 'Computer Hardware', 'DEG-001-Y1-S1-004', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 1', @deg_id, @y1_id, @s1_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S1-005-2024-2025', 'Communication Skills', 'DEG-001-Y1-S1-005', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 1', @deg_id, @y1_id, @s1_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S1-006-2024-2025', 'Academic Research Methods', 'DEG-001-Y1-S1-006', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 1', @deg_id, @y1_id, @s1_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW());

-- DEGREE - YEAR 1 - SEMESTER 2
INSERT INTO course_lifecycle_master 
(lifecycle_key, course_title, course_code, programme_type_name, program_name, academic_year, semester_name, 
 programme_type_category_id, year_category_id, semester_category_id, awarding_body, qualification_level, 
 application_type, course_type, version, current_stage, created_at)
VALUES
('DEG-001-Y1-S2-001-2024-2025', 'Advanced Mathematics', 'DEG-001-Y1-S2-001', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 2', @deg_id, @y1_id, @s2_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S2-002-2024-2025', 'Object-Oriented Programming', 'DEG-001-Y1-S2-002', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 2', @deg_id, @y1_id, @s2_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S2-003-2024-2025', 'Data Structures', 'DEG-001-Y1-S2-003', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 2', @deg_id, @y1_id, @s2_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S2-004-2024-2025', 'Web Technologies Basics', 'DEG-001-Y1-S2-004', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 2', @deg_id, @y1_id, @s2_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S2-005-2024-2025', 'Ethics and Professional Practice', 'DEG-001-Y1-S2-005', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 2', @deg_id, @y1_id, @s2_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S2-006-2024-2025', 'Problem Solving Techniques', 'DEG-001-Y1-S2-006', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 2', @deg_id, @y1_id, @s2_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW());

-- DEGREE - YEAR 2 - SEMESTER 1
INSERT INTO course_lifecycle_master 
(lifecycle_key, course_title, course_code, programme_type_name, program_name, academic_year, semester_name, 
 programme_type_category_id, year_category_id, semester_category_id, awarding_body, qualification_level, 
 application_type, course_type, version, current_stage, created_at)
VALUES
('DEG-001-Y2-S1-001-2024-2025', 'Database Management Systems', 'DEG-001-Y2-S1-001', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 1', @deg_id, @y2_id, @s1_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S1-002-2024-2025', 'Software Engineering Principles', 'DEG-001-Y2-S1-002', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 1', @deg_id, @y2_id, @s1_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S1-003-2024-2025', 'Networks and Security', 'DEG-001-Y2-S1-003', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 1', @deg_id, @y2_id, @s1_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S1-004-2024-2025', 'Web Development Advanced', 'DEG-001-Y2-S1-004', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 1', @deg_id, @y2_id, @s1_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S1-005-2024-2025', 'Algorithms and Complexity', 'DEG-001-Y2-S1-005', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 1', @deg_id, @y2_id, @s1_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S1-006-2024-2025', 'Project Management', 'DEG-001-Y2-S1-006', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 1', @deg_id, @y2_id, @s1_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW());

-- DEGREE - YEAR 2 - SEMESTER 2
INSERT INTO course_lifecycle_master 
(lifecycle_key, course_title, course_code, programme_type_name, program_name, academic_year, semester_name, 
 programme_type_category_id, year_category_id, semester_category_id, awarding_body, qualification_level, 
 application_type, course_type, version, current_stage, created_at)
VALUES
('DEG-001-Y2-S2-001-2024-2025', 'Artificial Intelligence Basics', 'DEG-001-Y2-S2-001', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 2', @deg_id, @y2_id, @s2_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S2-002-2024-2025', 'Mobile Application Development', 'DEG-001-Y2-S2-002', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 2', @deg_id, @y2_id, @s2_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S2-003-2024-2025', 'Cybersecurity Fundamentals', 'DEG-001-Y2-S2-003', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 2', @deg_id, @y2_id, @s2_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S2-004-2024-2025', 'Computer Graphics', 'DEG-001-Y2-S2-004', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 2', @deg_id, @y2_id, @s2_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S2-005-2024-2025', 'Cloud Computing', 'DEG-001-Y2-S2-005', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 2', @deg_id, @y2_id, @s2_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S2-006-2024-2025', 'Professional Development', 'DEG-001-Y2-S2-006', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 2', @deg_id, @y2_id, @s2_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW());

-- DEGREE - YEAR 3 - SEMESTER 1
INSERT INTO course_lifecycle_master 
(lifecycle_key, course_title, course_code, programme_type_name, program_name, academic_year, semester_name, 
 programme_type_category_id, year_category_id, semester_category_id, awarding_body, qualification_level, 
 application_type, course_type, version, current_stage, created_at)
VALUES
('DEG-001-Y3-S1-001-2024-2025', 'Advanced AI and Machine Learning', 'DEG-001-Y3-S1-001', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 1', @deg_id, @y3_id, @s1_id, 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S1-002-2024-2025', 'Final Year Project Part 1', 'DEG-001-Y3-S1-002', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 1', @deg_id, @y3_id, @s1_id, 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S1-003-2024-2025', 'Enterprise Systems Development', 'DEG-001-Y3-S1-003', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 1', @deg_id, @y3_id, @s1_id, 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S1-004-2024-2025', 'Business Intelligence', 'DEG-001-Y3-S1-004', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 1', @deg_id, @y3_id, @s1_id, 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S1-005-2024-2025', 'Advanced Networking', 'DEG-001-Y3-S1-005', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 1', @deg_id, @y3_id, @s1_id, 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S1-006-2024-2025', 'Digital Innovation', 'DEG-001-Y3-S1-006', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 1', @deg_id, @y3_id, @s1_id, 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW());

-- DEGREE - YEAR 3 - SEMESTER 2
INSERT INTO course_lifecycle_master 
(lifecycle_key, course_title, course_code, programme_type_name, program_name, academic_year, semester_name, 
 programme_type_category_id, year_category_id, semester_category_id, awarding_body, qualification_level, 
 application_type, course_type, version, current_stage, created_at)
VALUES
('DEG-001-Y3-S2-001-2024-2025', 'Industry Specialisation', 'DEG-001-Y3-S2-001', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 2', @deg_id, @y3_id, @s2_id, 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S2-002-2024-2025', 'Final Year Project Part 2', 'DEG-001-Y3-S2-002', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 2', @deg_id, @y3_id, @s2_id, 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S2-003-2024-2025', 'Contemporary Issues in Computing', 'DEG-001-Y3-S2-003', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 2', @deg_id, @y3_id, @s2_id, 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S2-004-2024-2025', 'Entrepreneurship in Tech', 'DEG-001-Y3-S2-004', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 2', @deg_id, @y3_id, @s2_id, 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S2-005-2024-2025', 'Capstone Research', 'DEG-001-Y3-S2-005', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 2', @deg_id, @y3_id, @s2_id, 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S2-006-2024-2025', 'Career Preparation', 'DEG-001-Y3-S2-006', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 2', @deg_id, @y3_id, @s2_id, 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW());

-- ===================================================================
-- 3. CREATE HND PROGRAMME LIFECYCLE DATA
-- ===================================================================

-- HND - YEAR 1 - SEMESTER 1
INSERT INTO course_lifecycle_master 
(lifecycle_key, course_title, course_code, programme_type_name, program_name, academic_year, semester_name, 
 programme_type_category_id, year_category_id, semester_category_id, awarding_body, qualification_level, 
 application_type, course_type, version, current_stage, created_at)
VALUES
('HND-001-Y1-S1-001-2024-2025', 'Fundamentals of Computing', 'HND-001-Y1-S1-001', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 1', @hnd_id, @y1_id, @s1_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y1-S1-002-2024-2025', 'Programming Fundamentals', 'HND-001-Y1-S1-002', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 1', @hnd_id, @y1_id, @s1_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y1-S1-003-2024-2025', 'IT Systems Support', 'HND-001-Y1-S1-003', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 1', @hnd_id, @y1_id, @s1_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y1-S1-004-2024-2025', 'Business Essentials', 'HND-001-Y1-S1-004', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 1', @hnd_id, @y1_id, @s1_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW());

-- HND - YEAR 1 - SEMESTER 2
INSERT INTO course_lifecycle_master 
(lifecycle_key, course_title, course_code, programme_type_name, program_name, academic_year, semester_name, 
 programme_type_category_id, year_category_id, semester_category_id, awarding_body, qualification_level, 
 application_type, course_type, version, current_stage, created_at)
VALUES
('HND-001-Y1-S2-001-2024-2025', 'Database Design', 'HND-001-Y1-S2-001', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 2', @hnd_id, @y1_id, @s2_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y1-S2-002-2024-2025', 'Web Development Basics', 'HND-001-Y1-S2-002', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 2', @hnd_id, @y1_id, @s2_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y1-S2-003-2024-2025', 'Networking Essentials', 'HND-001-Y1-S2-003', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 2', @hnd_id, @y1_id, @s2_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y1-S2-004-2024-2025', 'Professional Communication', 'HND-001-Y1-S2-004', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 2', @hnd_id, @y1_id, @s2_id, 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW());

-- HND - YEAR 2 - SEMESTER 1
INSERT INTO course_lifecycle_master 
(lifecycle_key, course_title, course_code, programme_type_name, program_name, academic_year, semester_name, 
 programme_type_category_id, year_category_id, semester_category_id, awarding_body, qualification_level, 
 application_type, course_type, version, current_stage, created_at)
VALUES
('HND-001-Y2-S1-001-2024-2025', 'Advanced Database Management', 'HND-001-Y2-S1-001', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 1', @hnd_id, @y2_id, @s1_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y2-S1-002-2024-2025', 'Software Development Project', 'HND-001-Y2-S1-002', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 1', @hnd_id, @y2_id, @s1_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y2-S1-003-2024-2025', 'Cybersecurity Practicals', 'HND-001-Y2-S1-003', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 1', @hnd_id, @y2_id, @s1_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y2-S1-004-2024-2025', 'Enterprise IT Solutions', 'HND-001-Y2-S1-004', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 1', @hnd_id, @y2_id, @s1_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW());

-- HND - YEAR 2 - SEMESTER 2
INSERT INTO course_lifecycle_master 
(lifecycle_key, course_title, course_code, programme_type_name, program_name, academic_year, semester_name, 
 programme_type_category_id, year_category_id, semester_category_id, awarding_body, qualification_level, 
 application_type, course_type, version, current_stage, created_at)
VALUES
('HND-001-Y2-S2-001-2024-2025', 'Mobile Development Applications', 'HND-001-Y2-S2-001', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 2', @hnd_id, @y2_id, @s2_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y2-S2-002-2024-2025', 'Final Year Project', 'HND-001-Y2-S2-002', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 2', @hnd_id, @y2_id, @s2_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y2-S2-003-2024-2025', 'Cloud Services Management', 'HND-001-Y2-S2-003', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 2', @hnd_id, @y2_id, @s2_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y2-S2-004-2024-2025', 'Industry Placement Preparation', 'HND-001-Y2-S2-004', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 2', @hnd_id, @y2_id, @s2_id, 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW());

-- ===================================================================
-- VERIFICATION QUERIES (Run these to verify the data was created)
-- ===================================================================

-- SELECT COUNT(*) as total_lifecycle_records FROM course_lifecycle_master;
-- SELECT programme_type_name, program_name, COUNT(*) as course_count FROM course_lifecycle_master GROUP BY programme_type_name, program_name;
-- SELECT programme_type_name, program_name, academic_year, semester_name, COUNT(*) as courses FROM course_lifecycle_master GROUP BY programme_type_name, program_name, academic_year, semester_name ORDER BY programme_type_name, program_name, academic_year, semester_name;
