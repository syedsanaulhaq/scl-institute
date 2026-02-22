-- Test Data Seeding Script for SCL Institute
USE scl_instituteitment, HR records'),
(6, 'Student', 'Student role with access to learning portal'),
(7, 'Faculty', 'Faculty role with course management access');

-- ===============================================
-- 3. INSERT TEST ADMIN USER
-- ===============================================
INSERT IGNORE INTO users (id, email, password_hash, password, first_name, last_name, is_active)
VALUES (1, 'admin@scl.edu', NULL, 'admin123', 'Admin', 'User', TRUE);

-- ===============================================
-- 4. INSERT TEST STUDENT USERS
-- ===============================================
-- Student 1: Ali Hassan
INSERT IGNORE INTO users (id, email, password_hash, password, first_name, last_name, is_active)
VALUES (11, 'ali.hassan@scl.edu', NULL, 'student123', 'Ali', 'Hassan', TRUE);

-- Student 2: Fatima Ahmed
INSERT IGNORE INTO users (id, email, password_hash, password, first_name, last_name, is_active)
VALUES (12, 'fatima.ahmed@scl.edu', NULL, 'student123', 'Fatima', 'Ahmed', TRUE);

-- Student 3: Zain Mohammed
INSERT IGNORE INTO users (id, email, password_hash, password, first_name, last_name, is_active)
VALUES (13, 'zain.mohammed@scl.edu', NULL, 'student123', 'Zain', 'Mohammed', TRUE);

-- Student 4: Noor Ahmed
INSERT IGNORE INTO users (id, email, password_hash, password, first_name, last_name, is_active)
VALUES (14, 'noor.ahmed@scl.edu', NULL, 'student123', 'Noor', 'Ahmed', TRUE);

-- Student 5: Hamad Ali
INSERT IGNORE INTO users (id, email, password_hash, password, first_name, last_name, is_active)
VALUES (15, 'hamad.ali@scl.edu', NULL, 'student123', 'Hamad', 'Ali', TRUE);

-- ===============================================
-- 5. INSERT TEST FACULTY USERS
-- ===============================================
-- Faculty 1: Dr. Ahmed Khan
INSERT IGNORE INTO users (id, email, password_hash, password, first_name, last_name, is_active)
VALUES (21, 'dr.ahmed.khan@scl.edu', NULL, 'faculty123', 'Ahmed', 'Khan', TRUE);

-- Faculty 2: Prof. Sara Ahmed
INSERT IGNORE INTO users (id, email, password_hash, password, first_name, last_name, is_active)
VALUES (22, 'prof.sara.ahmed@scl.edu', NULL, 'faculty123', 'Sara', 'Ahmed', TRUE);

-- Faculty 3: Dr. Hassan Ali
INSERT IGNORE INTO users (id, email, password_hash, password, first_name, last_name, is_active)
VALUES (23, 'dr.hassan.ali@scl.edu', NULL, 'faculty123', 'Hassan', 'Ali', TRUE);

-- ===============================================
-- 6. ASSIGN ROLES TO USERS
-- ===============================================
-- Admin role
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (1, 1);

-- Student roles
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (11, 6);
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (12, 6);
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (13, 6);
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (14, 6);
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (15, 6);

-- Faculty roles
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (21, 7);
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (22, 7);
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (23, 7);

-- ===============================================
-- 7. INSERT TEST COURSES
-- ===============================================
INSERT IGNORE INTO courses (id, course_code, course_name, description, credits, level, duration_months, delivery_mode, course_status, created_by)
VALUES
(1, 'MCA-001', 'Master of Computer Applications', 'Advanced computer science program', 120, 'Masters', 24, 'Online', 'Active', 1),
(2, 'MBA-001', 'Master of Business Administration', 'Business management program', 120, 'Masters', 24, 'Hybrid', 'Active', 1),
(3, 'BCS-001', 'Bachelor of Computer Science', 'Undergraduate computer science program', 96, 'Degree', 36, 'Hybrid', 'Active', 1),
(4, 'ENG-101', 'Engineering Basics', 'Introduction to engineering concepts', 20, 'Certificate', 3, 'Online', 'Active', 1),
(5, 'DS-101', 'Data Science Fundamentals', 'Introduction to data science', 20, 'Certificate', 3, 'Online', 'Active', 1);

-- ===============================================
-- 8. INSERT STUDENT PROFILES
-- ===============================================
-- Profile for Ali Hassan
INSERT IGNORE INTO student_profiles (id, user_id, student_id, phone, address, city, state, country, postal_code, citizenship, status)
VALUES (11, 11, 'STU001', '+966501234567', '123 Main Street', 'Riyadh', 'Riyadh', 'Saudi Arabia', '11111', 'Saudi', 'Active');

-- Profile for Fatima Ahmed
INSERT IGNORE INTO student_profiles (id, user_id, student_id, phone, address, city, state, country, postal_code, citizenship, status)
VALUES (12, 12, 'STU002', '+966502345678', '456 Oak Avenue', 'Jeddah', 'Western', 'Saudi Arabia', '22222', 'Saudi', 'Active');

-- Profile for Zain Mohammed
INSERT IGNORE INTO student_profiles (id, user_id, student_id, phone, address, city, state, country, postal_code, citizenship, status)
VALUES (13, 13, 'STU003', '+966503456789', '789 Pine Road', 'Dammam', 'Eastern', 'Saudi Arabia', '33333', 'Saudi', 'Active');

-- Profile for Noor Ahmed
INSERT IGNORE INTO student_profiles (id, user_id, student_id, phone, address, city, state, country, postal_code, citizenship, status)
VALUES (14, 14, 'STU004', '+966504567890', '321 Elm Street', 'Medina', 'Medina', 'Saudi Arabia', '44444', 'Saudi', 'Active');

-- Profile for Hamad Ali
INSERT IGNORE INTO student_profiles (id, user_id, student_id, phone, address, city, state, country, postal_code, citizenship, status)
VALUES (15, 15, 'STU005', '+966505678901', '654 Maple Drive', 'Al Khobar', 'Eastern', 'Saudi Arabia', '55555', 'Saudi', 'Active');

-- ===============================================
-- 9. INSERT STUDENT APPLICATIONS
-- ===============================================
-- Ali Hassan's application to MCA
INSERT IGNORE INTO student_applications (id, student_id, course_id, application_date, statement_of_purpose, application_status, submitted_date)
VALUES (1, 11, 1, NOW(), 'I am applying for the Master of Computer Applications program to advance my skills in software development and machine learning.', 'Submitted', NOW());

-- Fatima Ahmed's application to MBA
INSERT IGNORE INTO student_applications (id, student_id, course_id, application_date, statement_of_purpose, application_status, submitted_date)
VALUES (2, 12, 2, NOW(), 'I wish to pursue the MBA program to develop leadership and business management skills.', 'Submitted', NOW());

-- Zain Mohammed's application to MCA
INSERT IGNORE INTO student_applications (id, student_id, course_id, application_date, statement_of_purpose, application_status, submitted_date)
VALUES (3, 13, 1, NOW(), 'The MCA program aligns with my career goals in software engineering and cloud computing.', 'Submitted', NOW());

-- Noor Ahmed's application to Data Science Fundamentals
INSERT IGNORE INTO student_applications (id, student_id, course_id, application_date, statement_of_purpose, application_status, submitted_date)
VALUES (4, 14, 5, NOW(), 'I am committed to learning data science fundamentals to transition into the data science field.', 'Submitted', NOW());

-- Hamad Ali's application to Engineering Basics
INSERT IGNORE INTO student_applications (id, student_id, course_id, application_date, statement_of_purpose, application_status, submitted_date)
VALUES (5, 15, 4, NOW(), 'The Engineering Basics certificate will prepare me for advanced engineering coursework.', 'Submitted', NOW());

-- ===============================================
-- 10. INSERT COURSE REGISTRATIONS
-- ===============================================
-- Ali Hassan registered to MCA
INSERT IGNORE INTO course_registrations (id, student_id, course_id, enrollment_date, enrollment_status)
VALUES (1, 11, 1, NOW(), 'Active');

-- Fatima Ahmed registered to MBA
INSERT IGNORE INTO course_registrations (id, student_id, course_id, enrollment_date, enrollment_status)
VALUES (2, 12, 2, NOW(), 'Active');

-- Zain Mohammed registered to MCA
INSERT IGNORE INTO course_registrations (id, student_id, course_id, enrollment_date, enrollment_status)
VALUES (3, 13, 1, NOW(), 'Active');

-- Noor Ahmed registered to Data Science
INSERT IGNORE INTO course_registrations (id, student_id, course_id, enrollment_date, enrollment_status)
VALUES (4, 14, 5, NOW(), 'Active');

-- Hamad Ali registered to Engineering Basics
INSERT IGNORE INTO course_registrations (id, student_id, course_id, enrollment_date, enrollment_status)
VALUES (5, 15, 4, NOW(), 'Active');

-- ===============================================
-- 11. INSERT FACULTY PROFILES
-- ===============================================
-- Dr. Ahmed Khan profile
INSERT IGNORE INTO faculty_profiles (id, user_id, employee_id, department, designation, specialization, qualification)
VALUES (1, 21, 'FAC001', 'Computer Science', 'Associate Professor', 'Software Engineering', 'PhD in Computer Science');

-- Prof. Sara Ahmed profile
INSERT IGNORE INTO faculty_profiles (id, user_id, employee_id, department, designation, specialization, qualification)
VALUES (2, 22, 'FAC002', 'Business Administration', 'Senior Lecturer', 'Business Management', 'MBA, PhD in Business');

-- Dr. Hassan Ali profile
INSERT IGNORE INTO faculty_profiles (id, user_id, employee_id, department, designation, specialization, qualification)
VALUES (3, 23, 'FAC003', 'Engineering', 'Assistant Professor', 'Mechanical Engineering', 'PhD in Mechanical Engineering');

-- ===============================================
-- 12. INSERT ADMISSIONS RECORDS
-- ===============================================
-- Admission for Ali Hassan to MCA
INSERT IGNORE INTO admissions (id, application_id, student_id, decision, decision_date, acceptance_status)
VALUES (1, 1, 11, 'Accepted', NOW(), 'Accepted');

-- Admission for Fatima Ahmed to MBA
INSERT IGNORE INTO admissions (id, application_id, student_id, decision, decision_date, acceptance_status)
VALUES (2, 2, 12, 'Accepted', NOW(), 'Accepted');

-- Admission for Zain Mohammed to MCA
INSERT IGNORE INTO admissions (id, application_id, student_id, decision, decision_date, acceptance_status)
VALUES (3, 3, 13, 'Accepted', NOW(), 'Accepted');

-- Admission for Noor Ahmed to Data Science
INSERT IGNORE INTO admissions (id, application_id, student_id, decision, decision_date, acceptance_status)
VALUES (4, 4, 14, 'Accepted', NOW(), 'Accepted');

-- Admission for Hamad Ali to Engineering Basics
INSERT IGNORE INTO admissions (id, application_id, student_id, decision, decision_date, acceptance_status)
VALUES (5, 5, 15, 'Accepted', NOW(), 'Accepted');

-- ===============================================
-- 13. VERIFICATION QUERIES (run these to verify data was loaded)
-- ===============================================

-- Check users count
-- SELECT COUNT(*) as user_count FROM users;
-- Expected: At least 9 users (1 admin + 5 students + 3 faculty)

-- Check student profiles count
-- SELECT COUNT(*) as student_profiles FROM student_profiles;
-- Expected: 5 student profiles

-- Check student applications
-- SELECT COUNT(*) as applications FROM student_applications;
-- Expected: 5 applications

-- Check course registrations
-- SELECT COUNT(*) as registrations FROM course_registrations;
-- Expected: 5 registrations

-- Check admissions
-- SELECT COUNT(*) as admissions FROM admissions;
-- Expected: 5 admissions

-- Sample login credentials for testing:
-- ===================================
-- Admin:
-- Email: admin@scl.edu
-- Password: admin123

-- Student:
-- Email: ali.hassan@scl.edu
-- Password: student123
-- Email: fatima.ahmed@scl.edu
-- Password: student123
-- Email: zain.mohammed@scl.edu
-- Password: student123
-- Email: noor.ahmed@scl.edu
-- Password: student123
-- Email: hamad.ali@scl.edu
-- Password: student123

-- Faculty:
-- Email: dr.ahmed.khan@scl.edu
-- Password: faculty123
-- Email: prof.sara.ahmed@scl.edu
-- Password: faculty123
-- Email: dr.hassan.ali@scl.edu
-- Password: faculty123

-- ===============================================
-- End of Test Data Seeding Script
-- ===============================================
