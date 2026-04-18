-- Load Course Lifecycle Data directly into course_lifecycle_master
-- This script creates dummy data for Degree (3-year) and HND (2-year) programmes

INSERT INTO course_lifecycle_master 
(lifecycle_key, course_title, course_code, programme_type_name, program_name, academic_year, semester_name, awarding_body, qualification_level, application_type, course_type, version, current_stage, created_at) 
VALUES
('DEG-001-Y1-S1-001-2024-2025', 'Foundation Mathematics', 'DEG-001-Y1-S1-001', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 1', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S1-002-2024-2025', 'Introduction to Programming', 'DEG-001-Y1-S1-002', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 1', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S1-003-2024-2025', 'Digital Systems', 'DEG-001-Y1-S1-003', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 1', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S1-004-2024-2025', 'Computer Hardware', 'DEG-001-Y1-S1-004', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 1', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S1-005-2024-2025', 'Communication Skills', 'DEG-001-Y1-S1-005', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 1', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S1-006-2024-2025', 'Academic Research Methods', 'DEG-001-Y1-S1-006', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 1', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),

('DEG-001-Y1-S2-001-2024-2025', 'Advanced Mathematics', 'DEG-001-Y1-S2-001', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 2', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S2-002-2024-2025', 'Object-Oriented Programming', 'DEG-001-Y1-S2-002', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 2', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S2-003-2024-2025', 'Data Structures', 'DEG-001-Y1-S2-003', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 2', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S2-004-2024-2025', 'Web Technologies Basics', 'DEG-001-Y1-S2-004', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 2', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S2-005-2024-2025', 'Ethics and Professional Practice', 'DEG-001-Y1-S2-005', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 2', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y1-S2-006-2024-2025', 'Problem Solving Techniques', 'DEG-001-Y1-S2-006', 'Degree', 'Bachelor of Science in Computer Science', 'Year 1', 'Semester 2', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),

('DEG-001-Y2-S1-001-2024-2025', 'Database Management Systems', 'DEG-001-Y2-S1-001', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 1', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S1-002-2024-2025', 'Software Engineering Principles', 'DEG-001-Y2-S1-002', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 1', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S1-003-2024-2025', 'Networks and Security', 'DEG-001-Y2-S1-003', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 1', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S1-004-2024-2025', 'Web Development Advanced', 'DEG-001-Y2-S1-004', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 1', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S1-005-2024-2025', 'Algorithms and Complexity', 'DEG-001-Y2-S1-005', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 1', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S1-006-2024-2025', 'Project Management', 'DEG-001-Y2-S1-006', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 1', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),

('DEG-001-Y2-S2-001-2024-2025', 'Artificial Intelligence Basics', 'DEG-001-Y2-S2-001', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 2', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S2-002-2024-2025', 'Mobile Application Development', 'DEG-001-Y2-S2-002', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 2', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S2-003-2024-2025', 'Cybersecurity Fundamentals', 'DEG-001-Y2-S2-003', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 2', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S2-004-2024-2025', 'Computer Graphics', 'DEG-001-Y2-S2-004', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 2', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S2-005-2024-2025', 'Cloud Computing', 'DEG-001-Y2-S2-005', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 2', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y2-S2-006-2024-2025', 'Professional Development', 'DEG-001-Y2-S2-006', 'Degree', 'Bachelor of Science in Computer Science', 'Year 2', 'Semester 2', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),

('DEG-001-Y3-S1-001-2024-2025', 'Advanced AI and Machine Learning', 'DEG-001-Y3-S1-001', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 1', 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S1-002-2024-2025', 'Final Year Project Part 1', 'DEG-001-Y3-S1-002', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 1', 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S1-003-2024-2025', 'Enterprise Systems Development', 'DEG-001-Y3-S1-003', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 1', 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S1-004-2024-2025', 'Business Intelligence', 'DEG-001-Y3-S1-004', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 1', 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S1-005-2024-2025', 'Advanced Networking', 'DEG-001-Y3-S1-005', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 1', 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S1-006-2024-2025', 'Digital Innovation', 'DEG-001-Y3-S1-006', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 1', 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),

('DEG-001-Y3-S2-001-2024-2025', 'Industry Specialisation', 'DEG-001-Y3-S2-001', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 2', 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S2-002-2024-2025', 'Final Year Project Part 2', 'DEG-001-Y3-S2-002', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 2', 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S2-003-2024-2025', 'Contemporary Issues in Computing', 'DEG-001-Y3-S2-003', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 2', 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S2-004-2024-2025', 'Entrepreneurship in Tech', 'DEG-001-Y3-S2-004', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 2', 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S2-005-2024-2025', 'Capstone Research', 'DEG-001-Y3-S2-005', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 2', 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('DEG-001-Y3-S2-006-2024-2025', 'Career Preparation', 'DEG-001-Y3-S2-006', 'Degree', 'Bachelor of Science in Computer Science', 'Year 3', 'Semester 2', 'Stratford College London', 'Level 6', 'New Course', 'Core', '1.0', 'accredited', NOW()),

('HND-001-Y1-S1-001-2024-2025', 'Fundamentals of Computing', 'HND-001-Y1-S1-001', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 1', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y1-S1-002-2024-2025', 'Programming Fundamentals', 'HND-001-Y1-S1-002', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 1', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y1-S1-003-2024-2025', 'IT Systems Support', 'HND-001-Y1-S1-003', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 1', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y1-S1-004-2024-2025', 'Business Essentials', 'HND-001-Y1-S1-004', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 1', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),

('HND-001-Y1-S2-001-2024-2025', 'Database Design', 'HND-001-Y1-S2-001', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 2', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y1-S2-002-2024-2025', 'Web Development Basics', 'HND-001-Y1-S2-002', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 2', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y1-S2-003-2024-2025', 'Networking Essentials', 'HND-001-Y1-S2-003', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 2', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y1-S2-004-2024-2025', 'Professional Communication', 'HND-001-Y1-S2-004', 'HND', 'Higher National Diploma in Information Technology', 'Year 1', 'Semester 2', 'Stratford College London', 'Level 4', 'New Course', 'Core', '1.0', 'accredited', NOW()),

('HND-001-Y2-S1-001-2024-2025', 'Advanced Database Management', 'HND-001-Y2-S1-001', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 1', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y2-S1-002-2024-2025', 'Software Development Project', 'HND-001-Y2-S1-002', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 1', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y2-S1-003-2024-2025', 'Cybersecurity Practicals', 'HND-001-Y2-S1-003', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 1', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y2-S1-004-2024-2025', 'Enterprise IT Solutions', 'HND-001-Y2-S1-004', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 1', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),

('HND-001-Y2-S2-001-2024-2025', 'Mobile Development Applications', 'HND-001-Y2-S2-001', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 2', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y2-S2-002-2024-2025', 'Final Year Project', 'HND-001-Y2-S2-002', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 2', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y2-S2-003-2024-2025', 'Cloud Services Management', 'HND-001-Y2-S2-003', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 2', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW()),
('HND-001-Y2-S2-004-2024-2025', 'Industry Placement Preparation', 'HND-001-Y2-S2-004', 'HND', 'Higher National Diploma in Information Technology', 'Year 2', 'Semester 2', 'Stratford College London', 'Level 5', 'New Course', 'Core', '1.0', 'accredited', NOW());

-- Verify data loaded
SELECT 'SUCCESS: Loaded course lifecycle data' as status;
SELECT COUNT(*) as total_courses, COUNT(DISTINCT programme_type_name) as programme_types, COUNT(DISTINCT program_name) as programmes FROM course_lifecycle_master;
