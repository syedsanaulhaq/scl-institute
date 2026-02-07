INSERT INTO student_applications (
    first_name, last_name, date_of_birth, gender, nationality, email, contact_number,
    address_line1, town_city, postcode, country_of_residence,
    course_title, course_code, course_type, mode_of_study, intake_start_date, entry_route,
    highest_qualification, institution_name, year_completed, english_proficiency, english_score,
    consent_gdpr, consent_data_sharing, declaration_truth, digital_signature, declaration_date,
    application_status, submitted_at
) VALUES
('Ahmed', 'Hassan', '2000-05-15', 'Male', 'Pakistan', 'ahmed.hassan.app@example.com', '+447123456789',
 '123 Oxford Street', 'London', 'SW1A 1AA', 'United Kingdom',
 'Business Administration HND', 'BUS101', 'HND', 'Full-time', '2026-09-01', 'Standard',
 'A-Level', 'Royal Grammar School', '2022-06-01', 'IELTS', 7.0,
 TRUE, TRUE, TRUE, 'Ahmed Hassan', '2026-02-01',
 'submitted', NOW()),

('Fatima', 'Ali', '1999-12-20', 'Female', 'Saudi Arabia', 'fatima.ali.app@example.com', '+447234567890',
 '456 Baker Street', 'London', 'NW1 6XE', 'United Kingdom',
 'Information Technology Degree', 'IT201', 'Degree', 'Full-time', '2026-09-01', 'Standard',
 'A-Level', 'Al-Hikma International School', '2022-06-15', 'IELTS', 6.5,
 TRUE, TRUE, TRUE, 'Fatima Ali', '2026-02-02',
 'submitted', NOW()),

('Mohammed', 'Khan', '2001-03-10', 'Male', 'Bangladesh', 'mohammed.khan.app@example.com', '+447345678901',
 '789 Regent Street', 'London', 'W1B 5AH', 'United Kingdom',
 'Accounting and Finance HND', 'ACC301', 'HND', 'Full-time', '2026-09-01', 'Standard',
 'A-Level', 'Dhaka Grammar School', '2022-07-01', 'IELTS', 6.8,
 TRUE, TRUE, TRUE, 'Mohammed Khan', '2026-02-03',
 'submitted', NOW()),

('Noor', 'Ahmed', '2000-08-25', 'Female', 'UAE', 'noor.ahmed.app@example.com', '+447456789012',
 '321 Park Lane', 'London', 'W1K 7AR', 'United Kingdom',
 'English Language Course', 'ENG401', 'Short Course', 'Full-time', '2026-03-01', 'Standard',
 'GCSE', 'Emirates International School', '2021-06-01', 'TOEFL', 85.0,
 TRUE, TRUE, TRUE, 'Noor Ahmed', '2026-02-04',
 'submitted', NOW()),

('Hamad', 'Mohammed', '1999-11-05', 'Male', 'Qatar', 'hamad.mohammed.app@example.com', '+447567890123',
 '654 Bond Street', 'London', 'W1S 4AE', 'United Kingdom',
 'Project Management CPD', 'PROJ501', 'CPD', 'Part-time', '2026-04-01', 'Standard',
 'Degree', 'Qatar University', '2020-06-15', 'IELTS', 7.2,
 TRUE, TRUE, TRUE, 'Hamad Mohammed', '2026-02-05',
 'submitted', NOW());
