-- Insert 12 Moodle courses
INSERT INTO mdl_course (id, category, shortname, fullname, idnumber, format, startdate, enddate, visible) VALUES
(2, 1, 'BUS101', 'Business Administration HND', 'BUS101', 'topics', 1704067200, 1735689600, 1),
(3, 1, 'IT201', 'Information Technology Degree', 'IT201', 'topics', 1704067200, 1735689600, 1),
(4, 1, 'ACC301', 'Accounting and Finance HND', 'ACC301', 'topics', 1704067200, 1735689600, 1),
(5, 1, 'ENG401', 'English Language Course', 'ENG401', 'topics', 1704067200, 1735689600, 1),
(6, 1, 'PROJ501', 'Project Management CPD', 'PROJ501', 'topics', 1704067200, 1735689600, 1),
(7, 1, 'WEB201', 'Web Development Fundamentals', 'WEB201', 'topics', 1704067200, 1735689600, 1),
(8, 1, 'DATA301', 'Data Science & Analytics', 'DATA301', 'topics', 1704067200, 1735689600, 1),
(9, 1, 'AI401', 'Artificial Intelligence Basics', 'AI401', 'topics', 1704067200, 1735689600, 1),
(10, 1, 'CLOUD301', 'Cloud Computing Infrastructure', 'CLOUD301', 'topics', 1704067200, 1735689600, 1),
(11, 1, 'CYBER201', 'Cybersecurity Fundamentals', 'CYBER201', 'topics', 1704067200, 1735689600, 1),
(12, 1, 'MOBILE201', 'Mobile App Development', 'MOBILE201', 'topics', 1704067200, 1735689600, 1),
(13, 1, 'ML301', 'Machine Learning Essentials', 'ML301', 'topics', 1704067200, 1735689600, 1);

SELECT 'Moodle Courses Restored:';
SELECT COUNT(*) as total_courses FROM mdl_course WHERE id > 1;
SELECT id, shortname, fullname FROM mdl_course WHERE id > 1 ORDER BY id;
