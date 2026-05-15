INSERT INTO teacher_registrations 
  (registration_reference, first_name, last_name, email, contact_number, nationality, 
   highest_qualification, years_of_experience, current_employer, teaching_statement,
   selected_course_title, selected_course_code, selected_course_type, teaching_role, application_status)
VALUES
  ('TCH2026000001', 'Dr. James', 'Wilson', 'james.wilson@example.com', '07700900001', 'British',
   'PhD', 8, 'University of London',
   'I have 8 years of experience in business management education and research.',
   'HND in Business (Business Management)', 'HND-BUS', 'HND', 'editingteacher', 'submitted'),
  ('TCH2026000002', 'Sarah', 'Thompson', 'sarah.thompson@example.com', '07700900002', 'British',
   'Master''s Degree', 3, 'City College London',
   'I have taught business modules for 3 years at further education level.',
   'HND in Leadership and Management', 'HND-LM', 'HND', 'editingteacher', 'submitted'),
  ('TCH2026000003', 'Ahmed', 'Malik', 'ahmed.malik@example.com', '07700900003', 'Pakistani',
   'A-Level', 1, 'Self-employed',
   'I have worked in business for 1 year and want to share my experience.',
   'HND in Business (Business Management)', 'HND-BUS', 'HND', 'editingteacher', 'submitted');
