-- Create course categories in Moodle
INSERT INTO mdl_course_categories (name, parent, sortorder, idnumber, description, visible, timemodified, depth, path) VALUES
('Engineering', 0, 1, 'ENG', 'Engineering programs including B.Tech and M.Tech courses', 1, UNIX_TIMESTAMP(), 1, '/2'),
('Business & Management', 0, 2, 'BUS', 'Business administration, MBA, and commerce programs', 1, UNIX_TIMESTAMP(), 1, '/3'),
('IT & Computing', 0, 3, 'IT', 'Computer science, BCA, MCA, and IT-related courses', 1, UNIX_TIMESTAMP(), 1, '/4'),
('Professional Certifications', 0, 4, 'CERT', 'CPD and certification programs for professional development', 1, UNIX_TIMESTAMP(), 1, '/5');
