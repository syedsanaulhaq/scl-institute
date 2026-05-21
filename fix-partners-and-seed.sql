-- Step 1: Add missing columns to partners table (use --force so duplicates are ignored)
ALTER TABLE partners ADD COLUMN accreditation_number VARCHAR(100) NULL;
ALTER TABLE partners ADD COLUMN accreditation_type VARCHAR(100) NULL;
ALTER TABLE partners ADD COLUMN expiry_date DATE NULL;
ALTER TABLE partners ADD COLUMN responsible_person VARCHAR(255) NULL;
ALTER TABLE partners ADD COLUMN programme_titles TEXT NULL;
ALTER TABLE partners ADD COLUMN programme_codes TEXT NULL;
ALTER TABLE partners ADD COLUMN internal_review_date DATE NULL;
ALTER TABLE partners ADD COLUMN internal_reviewer VARCHAR(255) NULL;
ALTER TABLE partners ADD COLUMN next_review_date DATE NULL;
ALTER TABLE partners ADD COLUMN renewal_submission_date DATE NULL;
ALTER TABLE partners ADD COLUMN renewal_status VARCHAR(50) NULL DEFAULT 'not_started';
ALTER TABLE partners ADD COLUMN follow_up_actions TEXT NULL;

-- Step 2: Seed Partners & Associates
INSERT IGNORE INTO partners (partner_name, partner_type, contact_person, job_title, contact_email, phone, website, address, country, partnership_start_date, associate_type, area_of_expertise, status, accreditation_number, accreditation_type, expiry_date, renewal_status) VALUES
('Chartered Management Institute (CMI)', 'awarding_body', 'James Fletcher', 'Partnership Manager', 'j.fletcher@managers.org.uk', '01234 567890', 'https://www.managers.org.uk', '3 Chestnut Grove, Corby, Northants', 'United Kingdom', '2020-09-01', NULL, 'Business, Leadership, Management', 'active', 'CMI-2024-001', 'Full Awarding Body', '2025-08-31', 'in_progress'),
('Pearson Edexcel', 'awarding_body', 'Sarah Mitchell', 'Regional Coordinator', 's.mitchell@pearson.com', '0207 010 2000', 'https://qualifications.pearson.com', '80 Strand, London, WC2R 0RL', 'United Kingdom', '2019-01-15', NULL, 'BTEC, GCSE, A-Level Equivalencies', 'active', 'PE-2023-112', 'Approved Centre', '2025-12-31', 'not_started'),
('NCFE', 'awarding_body', 'David Patel', 'Centre Support Manager', 'd.patel@ncfe.org.uk', '0191 239 8000', 'https://www.ncfe.org.uk', 'Q6, Quorum Park, Benton Lane, Newcastle', 'United Kingdom', '2021-03-01', NULL, 'Vocational Qualifications, Health & Social Care', 'active', 'NCFE-2024-088', 'Approved Centre', '2026-02-28', 'not_started'),
('Dr. Amara Osei', 'associate', 'Dr. Amara Osei', 'Associate Lecturer', 'a.osei@associates.scl.com', '07712 345678', NULL, 'Birmingham, B15 2TT', 'United Kingdom', '2022-05-10', 'Academic', 'Business Strategy, Entrepreneurship, African Business Markets', 'active', NULL, NULL, NULL, 'not_started'),
('Prof. Linda Kamau', 'associate', 'Prof. Linda Kamau', 'Associate Professor', 'l.kamau@associates.scl.com', '07890 123456', NULL, 'London, SE1 7PB', 'United Kingdom', '2021-09-01', 'Academic', 'International Human Resource Management, DEI', 'active', NULL, NULL, NULL, 'not_started'),
('Marcus Reid Consulting', 'associate', 'Marcus Reid', 'Lead Consultant', 'm.reid@marcusreidconsulting.co.uk', '07654 321987', 'https://www.marcusreidconsulting.co.uk', 'Manchester, M1 2JX', 'United Kingdom', '2023-01-20', 'Industry Practitioner', 'Project Management, Agile, PMP Preparation', 'active', NULL, NULL, NULL, 'not_started'),
('Dr. Fatima Al-Rashid', 'associate', 'Dr. Fatima Al-Rashid', 'Associate Tutor', 'f.alrashid@associates.scl.com', '07501 234567', NULL, 'Leeds, LS1 4AP', 'United Kingdom', '2022-11-15', 'Academic', 'Finance, Islamic Finance, Accounting', 'active', NULL, NULL, NULL, 'not_started'),
('Tech Futures Ltd', 'associate', 'Rajesh Nair', 'Director', 'r.nair@techfutures.co.uk', '07923 456789', 'https://www.techfutures.co.uk', 'Bristol, BS1 5TR', 'United Kingdom', '2023-06-01', 'Industry Practitioner', 'Digital Transformation, Data Analytics, AI in Business', 'active', NULL, NULL, NULL, 'not_started'),
('SCL Alumni Network Foundation', 'affiliate', 'Kwame Asante', 'Chair', 'k.asante@sclalumni.org', '07781 012345', 'https://www.sclalumni.org', 'London, EC1A 1BB', 'United Kingdom', '2020-07-01', NULL, 'Alumni Engagement, Fundraising, Mentorship', 'active', NULL, NULL, NULL, 'not_started'),
('British Council', 'affiliate', 'Helen Cross', 'Education Partnerships Lead', 'h.cross@britishcouncil.org', '0161 957 7755', 'https://www.britishcouncil.org', '10 Spring Gardens, London, SW1A 2BN', 'United Kingdom', '2022-02-14', NULL, 'International Education, Language Testing, Student Mobility', 'active', NULL, NULL, NULL, 'not_started');

-- Step 3: Seed Vendors
INSERT IGNORE INTO vendors (vendor_name, vendor_type, contact_person, contact_email, phone, address, country, status, contract_start_date, contract_end_date, payment_terms, notes) VALUES
('CloudSecure IT Solutions', 'IT & Technology', 'Tom Whitfield', 'tom.whitfield@cloudsecure.co.uk', '0800 123 9900', '15 Tech Park, Reading, RG1 1AA', 'United Kingdom', 'active', '2023-01-01', '2025-12-31', 'Net 30', 'Primary IT infrastructure & cybersecurity vendor'),
('CleanSpace FM Services', 'Facilities Management', 'Angela Brooks', 'a.brooks@cleanspacefm.com', '01932 770055', '7 Industrial Way, Woking, GU22 8BX', 'United Kingdom', 'active', '2022-09-01', '2024-08-31', 'Net 14', 'Cleaning, maintenance and building management'),
('PageTurn Publishing Ltd', 'Stationery & Print', 'Henry O''Brien', 'h.obrien@pageturn.co.uk', '020 8900 4422', '55 Paper Lane, London, EC4A 2EX', 'United Kingdom', 'active', '2023-03-15', NULL, 'Net 30', 'Course materials, printing and stationery'),
('CaterPro UK', 'Catering', 'Sophie Martinez', 's.martinez@caterpro.co.uk', '01234 556677', '22 Food Court, Milton Keynes, MK9 3DA', 'United Kingdom', 'active', '2023-06-01', '2025-05-31', 'Net 21', 'Catering for events and staff canteen'),
('Legatum Legal LLP', 'Legal Services', 'Richard Hayes', 'r.hayes@legatumlegal.com', '020 7900 8844', '1 Gray''s Inn Square, London, WC1R 5AA', 'United Kingdom', 'active', '2021-11-01', NULL, 'Hourly Rate', 'Employment law and contract review specialists'),
('Bright Minds Recruitment', 'Recruitment', 'Claire Newton', 'c.newton@brightmindsrec.co.uk', '0121 400 3344', '45 Colmore Row, Birmingham, B3 2PE', 'United Kingdom', 'active', '2022-04-01', '2024-03-31', 'Commission', 'Academic and admin staff recruitment'),
('Green Office Supplies', 'Stationery & Print', 'Ben Okafor', 'b.okafor@greenoffice.co.uk', '01865 223344', '8 Riverside Park, Oxford, OX1 2EF', 'United Kingdom', 'preferred', '2023-08-01', NULL, 'Net 30', 'Eco-friendly stationery and office supplies'),
('Quantum AV Systems', 'IT & Technology', 'Priya Sharma', 'p.sharma@quantumav.co.uk', '01753 881122', 'Unit 3, Windsor Trade Park, Windsor, SL4 1LH', 'United Kingdom', 'active', '2023-10-01', '2026-09-30', 'Net 45', 'Audio/visual equipment, lecture hall technology');

-- Step 4: Seed Buildings
INSERT IGNORE INTO buildings (building_name, building_code, address, building_type, floors, total_area_sqm, year_built, status, description) VALUES
('Main Academic Building', 'MAB', '12 College Road, London, E1 6RF', 'Academic', 4, 3200.00, 2005, 'operational', 'Primary teaching and administrative building with lecture halls and seminar rooms'),
('Learning Resources Centre', 'LRC', '14 College Road, London, E1 6RF', 'Library', 3, 1800.00, 2010, 'operational', 'Student library, IT suites, group study rooms and student services'),
('Professional Development Hub', 'PDH', '16 College Road, London, E1 6RF', 'Mixed Use', 2, 950.00, 2018, 'operational', 'Conference rooms, boardroom, CPD training suites and staff offices');

-- Step 5: Seed Building Rooms (depends on buildings above existing)
INSERT IGNORE INTO building_rooms (building_id, room_name, room_code, floor_number, capacity, room_type, has_projector, has_whiteboard, has_video_conferencing, status) 
SELECT b.id, 'Lecture Hall A', 'MAB-LH-A', 1, 120, 'lecture_hall', 1, 1, 1, 'available'
FROM buildings b WHERE b.building_code = 'MAB'
AND NOT EXISTS (SELECT 1 FROM building_rooms WHERE room_code = 'MAB-LH-A');

INSERT IGNORE INTO building_rooms (building_id, room_name, room_code, floor_number, capacity, room_type, has_projector, has_whiteboard, has_video_conferencing, status)
SELECT b.id, 'Lecture Hall B', 'MAB-LH-B', 1, 80, 'lecture_hall', 1, 1, 0, 'available'
FROM buildings b WHERE b.building_code = 'MAB'
AND NOT EXISTS (SELECT 1 FROM building_rooms WHERE room_code = 'MAB-LH-B');

INSERT IGNORE INTO building_rooms (building_id, room_name, room_code, floor_number, capacity, room_type, has_projector, has_whiteboard, has_video_conferencing, status)
SELECT b.id, 'Seminar Room 1', 'MAB-SR-01', 2, 30, 'seminar_room', 1, 1, 0, 'available'
FROM buildings b WHERE b.building_code = 'MAB'
AND NOT EXISTS (SELECT 1 FROM building_rooms WHERE room_code = 'MAB-SR-01');

INSERT IGNORE INTO building_rooms (building_id, room_name, room_code, floor_number, capacity, room_type, has_projector, has_whiteboard, has_video_conferencing, status)
SELECT b.id, 'Seminar Room 2', 'MAB-SR-02', 2, 25, 'seminar_room', 1, 1, 0, 'available'
FROM buildings b WHERE b.building_code = 'MAB'
AND NOT EXISTS (SELECT 1 FROM building_rooms WHERE room_code = 'MAB-SR-02');

INSERT IGNORE INTO building_rooms (building_id, room_name, room_code, floor_number, capacity, room_type, has_projector, has_whiteboard, has_video_conferencing, status)
SELECT b.id, 'Computer Lab', 'MAB-CL-01', 3, 40, 'computer_lab', 1, 0, 0, 'available'
FROM buildings b WHERE b.building_code = 'MAB'
AND NOT EXISTS (SELECT 1 FROM building_rooms WHERE room_code = 'MAB-CL-01');

INSERT IGNORE INTO building_rooms (building_id, room_name, room_code, floor_number, capacity, room_type, has_projector, has_whiteboard, has_video_conferencing, status)
SELECT b.id, 'Staff Common Room', 'MAB-SCR', 4, 20, 'staff_room', 0, 0, 0, 'available'
FROM buildings b WHERE b.building_code = 'MAB'
AND NOT EXISTS (SELECT 1 FROM building_rooms WHERE room_code = 'MAB-SCR');

INSERT IGNORE INTO building_rooms (building_id, room_name, room_code, floor_number, capacity, room_type, has_projector, has_whiteboard, has_video_conferencing, status)
SELECT b.id, 'Library Main Hall', 'LRC-MAIN', 1, 200, 'library', 0, 0, 0, 'available'
FROM buildings b WHERE b.building_code = 'LRC'
AND NOT EXISTS (SELECT 1 FROM building_rooms WHERE room_code = 'LRC-MAIN');

INSERT IGNORE INTO building_rooms (building_id, room_name, room_code, floor_number, capacity, room_type, has_projector, has_whiteboard, has_video_conferencing, status)
SELECT b.id, 'IT Suite 1', 'LRC-IT-01', 2, 35, 'computer_lab', 1, 0, 0, 'available'
FROM buildings b WHERE b.building_code = 'LRC'
AND NOT EXISTS (SELECT 1 FROM building_rooms WHERE room_code = 'LRC-IT-01');

INSERT IGNORE INTO building_rooms (building_id, room_name, room_code, floor_number, capacity, room_type, has_projector, has_whiteboard, has_video_conferencing, status)
SELECT b.id, 'Group Study Room A', 'LRC-GS-A', 2, 12, 'seminar_room', 1, 1, 0, 'available'
FROM buildings b WHERE b.building_code = 'LRC'
AND NOT EXISTS (SELECT 1 FROM building_rooms WHERE room_code = 'LRC-GS-A');

INSERT IGNORE INTO building_rooms (building_id, room_name, room_code, floor_number, capacity, room_type, has_projector, has_whiteboard, has_video_conferencing, status)
SELECT b.id, 'Group Study Room B', 'LRC-GS-B', 2, 10, 'seminar_room', 0, 1, 0, 'available'
FROM buildings b WHERE b.building_code = 'LRC'
AND NOT EXISTS (SELECT 1 FROM building_rooms WHERE room_code = 'LRC-GS-B');

INSERT IGNORE INTO building_rooms (building_id, room_name, room_code, floor_number, capacity, room_type, has_projector, has_whiteboard, has_video_conferencing, status)
SELECT b.id, 'Main Conference Room', 'PDH-MCR', 1, 50, 'conference_room', 1, 1, 1, 'available'
FROM buildings b WHERE b.building_code = 'PDH'
AND NOT EXISTS (SELECT 1 FROM building_rooms WHERE room_code = 'PDH-MCR');

INSERT IGNORE INTO building_rooms (building_id, room_name, room_code, floor_number, capacity, room_type, has_projector, has_whiteboard, has_video_conferencing, status)
SELECT b.id, 'Boardroom', 'PDH-BR', 1, 16, 'conference_room', 1, 0, 1, 'available'
FROM buildings b WHERE b.building_code = 'PDH'
AND NOT EXISTS (SELECT 1 FROM building_rooms WHERE room_code = 'PDH-BR');

INSERT IGNORE INTO building_rooms (building_id, room_name, room_code, floor_number, capacity, room_type, has_projector, has_whiteboard, has_video_conferencing, status)
SELECT b.id, 'CPD Training Suite', 'PDH-CPD', 2, 30, 'seminar_room', 1, 1, 1, 'available'
FROM buildings b WHERE b.building_code = 'PDH'
AND NOT EXISTS (SELECT 1 FROM building_rooms WHERE room_code = 'PDH-CPD');

-- Step 6: Seed Facility Compliance
INSERT IGNORE INTO facility_compliance (building_id, compliance_type, description, due_date, status, responsible_person, notes)
SELECT b.id, 'Fire Safety', 'Annual fire safety inspection and risk assessment', '2024-11-30', 'compliant', 'Facilities Manager', 'Last inspection passed. Next due November 2024'
FROM buildings b WHERE b.building_code = 'MAB'
AND NOT EXISTS (SELECT 1 FROM facility_compliance WHERE building_id = b.id AND compliance_type = 'Fire Safety');

INSERT IGNORE INTO facility_compliance (building_id, compliance_type, description, due_date, status, responsible_person, notes)
SELECT b.id, 'Electrical Safety', 'Fixed wire testing (EICR) 5-year cycle', '2025-06-30', 'compliant', 'Facilities Manager', 'EICR certificate valid until June 2025'
FROM buildings b WHERE b.building_code = 'MAB'
AND NOT EXISTS (SELECT 1 FROM facility_compliance WHERE building_id = b.id AND compliance_type = 'Electrical Safety');

INSERT IGNORE INTO facility_compliance (building_id, compliance_type, description, due_date, status, responsible_person, notes)
SELECT b.id, 'Fire Safety', 'Annual fire safety inspection', '2024-10-31', 'due_soon', 'Facilities Manager', 'Inspection scheduled for October 2024'
FROM buildings b WHERE b.building_code = 'LRC'
AND NOT EXISTS (SELECT 1 FROM facility_compliance WHERE building_id = b.id AND compliance_type = 'Fire Safety');

INSERT IGNORE INTO facility_compliance (building_id, compliance_type, description, due_date, status, responsible_person, notes)
SELECT b.id, 'Disability Access', 'DDA compliance audit and accessibility review', '2024-09-30', 'overdue', 'Compliance Officer', 'Awaiting contractor availability for lift inspection'
FROM buildings b WHERE b.building_code = 'LRC'
AND NOT EXISTS (SELECT 1 FROM facility_compliance WHERE building_id = b.id AND compliance_type = 'Disability Access');

INSERT IGNORE INTO facility_compliance (building_id, compliance_type, description, due_date, status, responsible_person, notes)
SELECT b.id, 'Gas Safety', 'Annual gas safety certificate (CP12)', '2025-03-31', 'compliant', 'Facilities Manager', 'Gas Safe engineer inspection completed March 2024'
FROM buildings b WHERE b.building_code = 'PDH'
AND NOT EXISTS (SELECT 1 FROM facility_compliance WHERE building_id = b.id AND compliance_type = 'Gas Safety');
