-- Restore sample applications data
INSERT INTO student_applications (
    first_name, middle_names, last_name, date_of_birth, gender, nationality, email, contact_number,
    address_line1, address_line2, town_city, postcode, country_of_residence,
    course_title, course_code, course_type, mode_of_study, intake_start_date, entry_route,
    highest_qualification, institution_name, year_completed, relevant_work_experience, english_proficiency, english_score,
    has_disabilities_support_needs, disability_support_details,
    consent_gdpr, consent_data_sharing, consent_marketing, declaration_truth, digital_signature, declaration_date,
    application_status, submitted_at
) VALUES
-- Original test user (Mohammed Asad Rehman)
('Mohammed', 'asad', 'rehman', '1998-05-15', 'Male', 'Pakistan', 'mohammed@example.com', '+447123456789',
 '123 Oxford Street', 'Flat 5', 'London', 'SW1A 1AA', 'United Kingdom',
 'Business Administration HND', 'BUS101', 'HND', 'Full-time', '2026-09-01', 'Standard',
 'A-Level', 'Royal Grammar School', '2022-06-01', '3 years IT support', 'IELTS', 7.0,
 FALSE, NULL,
 TRUE, TRUE, TRUE, TRUE, 'Mohammed Asad Rehman', '2026-02-01',
 'submitted', NOW()),

-- Additional test users
('Ahmed', 'Khalid', 'Hassan', '2000-05-15', 'Male', 'Pakistan', 'ahmed.hassan@example.com', '+447123456789',
 '123 Oxford Street', 'Suite A', 'London', 'SW1A 1AA', 'United Kingdom',
 'Business Administration HND', 'BUS101', 'HND', 'Full-time', '2026-09-01', 'Standard',
 'A-Level', 'Royal Grammar School', '2022-06-01', '2 years banking', 'IELTS', 7.0,
 FALSE, NULL,
 TRUE, TRUE, TRUE, TRUE, 'Ahmed Khalid Hassan', '2026-02-01',
 'submitted', NOW()),

('Fatima', 'Aisha', 'Ali', '1999-12-20', 'Female', 'Saudi Arabia', 'fatima.ali@example.com', '+447234567890',
 '456 Baker Street', 'Apt 12', 'London', 'NW1 6XE', 'United Kingdom',
 'Information Technology Degree', 'IT201', 'Degree', 'Full-time', '2026-09-01', 'Standard',
 'A-Level', 'Al-Hikma International School', '2022-06-15', '1 year web design', 'IELTS', 6.5,
 FALSE, NULL,
 TRUE, TRUE, TRUE, TRUE, 'Fatima Aisha Ali', '2026-02-02',
 'submitted', NOW()),

('Mohammed', 'Hassan', 'Khan', '2001-03-10', 'Male', 'Bangladesh', 'mohammed.khan@example.com', '+447345678901',
 '789 Regent Street', 'Floor 3', 'London', 'W1B 5AH', 'United Kingdom',
 'Accounting and Finance HND', 'ACC301', 'HND', 'Full-time', '2026-09-01', 'Standard',
 'A-Level', 'Dhaka Grammar School', '2022-07-01', '4 years accounting assistant', 'IELTS', 6.8,
 FALSE, NULL,
 TRUE, TRUE, TRUE, TRUE, 'Mohammed Hassan Khan', '2026-02-03',
 'submitted', NOW()),

('Noor', 'Fatima', 'Ahmed', '2000-08-25', 'Female', 'UAE', 'noor.ahmed@example.com', '+447456789012',
 '321 Park Lane', 'Unit B', 'London', 'W1K 7AR', 'United Kingdom',
 'English Language Course', 'ENG401', 'Short Course', 'Full-time', '2026-03-01', 'Standard',
 'GCSE', 'Emirates International School', '2021-06-01', NULL, 'TOEFL', 85.0,
 FALSE, NULL,
 TRUE, TRUE, TRUE, TRUE, 'Noor Fatima Ahmed', '2026-02-04',
 'submitted', NOW()),

('Hamad', 'Ali', 'Mohammed', '1999-11-05', 'Male', 'Qatar', 'hamad.mohammed@example.com', '+447567890123',
 '654 Bond Street', 'Room 205', 'London', 'W1S 4AE', 'United Kingdom',
 'Project Management CPD', 'PROJ501', 'CPD', 'Part-time', '2026-04-01', 'Standard',
 'Degree', 'Qatar University', '2020-06-15', '8 years project management', 'IELTS', 7.2,
 FALSE, NULL,
 TRUE, TRUE, TRUE, TRUE, 'Hamad Ali Mohammed', '2026-02-05',
 'submitted', NOW());
