-- Seed demo data for Partners, Vendors, Buildings/Rooms/Compliance
-- Schemas match actual production table structures

-- ================================================================
-- 1. DELETE TEST DATA (cleanup)
-- ================================================================
DELETE FROM partners WHERE partner_name = 'Test Partner';

-- ================================================================
-- 2. PARTNERS & ASSOCIATES
-- ================================================================
INSERT INTO partners (partner_name, partner_type, contact_person, job_title, contact_email, phone, website, address, country, partnership_start_date, associate_type, area_of_expertise, status, accreditation_number, accreditation_type, expiry_date, renewal_status) VALUES
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

-- ================================================================
-- 3. VENDORS & SUPPLIERS
-- ================================================================
INSERT INTO vendors (company_name, trading_name, vendor_type, primary_contact, contact_position, contact_email, contact_phone, business_address, website, payment_terms, status) VALUES
('CloudSecure IT Solutions Ltd', 'CloudSecure', 'Supplier', 'Tom Whitfield', 'Account Manager', 'tom.whitfield@cloudsecure.co.uk', '0800 123 9900', '15 Tech Park, Reading, RG1 1AA', 'https://www.cloudsecure.co.uk', 'Net 30', 'active'),
('CleanSpace FM Services Ltd', 'CleanSpace FM', 'Supplier', 'Angela Brooks', 'Contracts Manager', 'a.brooks@cleanspacefm.com', '01932 770055', '7 Industrial Way, Woking, GU22 8BX', 'https://www.cleanspacefm.com', 'Net 14', 'active'),
('PageTurn Publishing Ltd', 'PageTurn', 'Supplier', 'Henry O''Brien', 'Sales Director', 'h.obrien@pageturn.co.uk', '020 8900 4422', '55 Paper Lane, London, EC4A 2EX', 'https://www.pageturn.co.uk', 'Net 30', 'active'),
('CaterPro UK Ltd', 'CaterPro', 'Vendor', 'Sophie Martinez', 'Operations Manager', 's.martinez@caterpro.co.uk', '01234 556677', '22 Food Court, Milton Keynes, MK9 3DA', 'https://www.caterpro.co.uk', 'Net 21', 'active'),
('Legatum Legal LLP', NULL, 'Supplier', 'Richard Hayes', 'Partner', 'r.hayes@legatumlegal.com', '020 7900 8844', '1 Grays Inn Square, London, WC1R 5AA', 'https://www.legatumlegal.com', 'Hourly Rate', 'active'),
('Bright Minds Recruitment Ltd', 'Bright Minds Rec', 'Vendor', 'Claire Newton', 'Senior Consultant', 'c.newton@brightmindsrec.co.uk', '0121 400 3344', '45 Colmore Row, Birmingham, B3 2PE', 'https://www.brightmindsrec.co.uk', 'Commission', 'active'),
('Green Office Supplies Ltd', 'Green Office', 'Supplier', 'Ben Okafor', 'Sales Executive', 'b.okafor@greenoffice.co.uk', '01865 223344', '8 Riverside Park, Oxford, OX1 2EF', 'https://www.greenoffice.co.uk', 'Net 30', 'active'),
('Quantum AV Systems Ltd', 'Quantum AV', 'Supplier', 'Priya Sharma', 'Technical Director', 'p.sharma@quantumav.co.uk', '01753 881122', 'Unit 3, Windsor Trade Park, Windsor, SL4 1LH', 'https://www.quantumav.co.uk', 'Net 45', 'active');

-- ================================================================
-- 4. BUILDINGS
-- ================================================================
INSERT INTO buildings (building_name, location, ownership_type, total_floors, total_area_sqm, purpose, year_built, status) VALUES
('Main Academic Building', '12 College Road, London, E1 6RF', 'Owned', 4, 3200.00, 'Teaching and Administration', 2005, 'active'),
('Learning Resources Centre', '14 College Road, London, E1 6RF', 'Owned', 3, 1800.00, 'Library and Student Services', 2010, 'active'),
('Professional Development Hub', '16 College Road, London, E1 6RF', 'Leased', 2, 950.00, 'CPD Training and Conferencing', 2018, 'active');

-- ================================================================
-- 5. BUILDING ROOMS (using subqueries to get correct building_id)
-- ================================================================
INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number, status)
SELECT id, 'Lecture Hall A', 'Auditorium', 120, 1, 'active' FROM buildings WHERE building_name = 'Main Academic Building';

INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number, status)
SELECT id, 'Lecture Hall B', 'Auditorium', 80, 1, 'active' FROM buildings WHERE building_name = 'Main Academic Building';

INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number, status)
SELECT id, 'Seminar Room 1', 'Classroom', 30, 2, 'active' FROM buildings WHERE building_name = 'Main Academic Building';

INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number, status)
SELECT id, 'Seminar Room 2', 'Classroom', 25, 2, 'active' FROM buildings WHERE building_name = 'Main Academic Building';

INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number, status)
SELECT id, 'Computer Lab', 'IT Lab', 40, 3, 'active' FROM buildings WHERE building_name = 'Main Academic Building';

INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number, status)
SELECT id, 'Staff Common Room', 'Office', 20, 4, 'active' FROM buildings WHERE building_name = 'Main Academic Building';

INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number, status)
SELECT id, 'Library Main Hall', 'Library', 200, 1, 'active' FROM buildings WHERE building_name = 'Learning Resources Centre';

INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number, status)
SELECT id, 'IT Suite 1', 'IT Lab', 35, 2, 'active' FROM buildings WHERE building_name = 'Learning Resources Centre';

INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number, status)
SELECT id, 'Group Study Room A', 'Classroom', 12, 2, 'active' FROM buildings WHERE building_name = 'Learning Resources Centre';

INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number, status)
SELECT id, 'Group Study Room B', 'Classroom', 10, 2, 'active' FROM buildings WHERE building_name = 'Learning Resources Centre';

INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number, status)
SELECT id, 'Main Conference Room', 'Meeting Room', 50, 1, 'active' FROM buildings WHERE building_name = 'Professional Development Hub';

INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number, status)
SELECT id, 'Boardroom', 'Meeting Room', 16, 1, 'active' FROM buildings WHERE building_name = 'Professional Development Hub';

INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number, status)
SELECT id, 'CPD Training Suite', 'Classroom', 30, 2, 'active' FROM buildings WHERE building_name = 'Professional Development Hub';

-- ================================================================
-- 6. FACILITY COMPLIANCE
-- ================================================================
INSERT INTO facility_compliance (building_id, compliance_type, status, last_inspection_date, next_inspection_date, inspector_name, notes)
SELECT id, 'Fire Safety', 'compliant', '2024-03-15', '2025-03-15', 'John Bradley (BFS Safety)', 'Annual fire safety inspection passed. All extinguishers serviced.'
FROM buildings WHERE building_name = 'Main Academic Building';

INSERT INTO facility_compliance (building_id, compliance_type, status, last_inspection_date, next_inspection_date, inspector_name, notes)
SELECT id, 'Health & Safety at Work', 'compliant', '2024-01-10', '2025-01-10', 'HSE Qualified Officer', 'General H&S risk assessment completed. Low risk rating.'
FROM buildings WHERE building_name = 'Main Academic Building';

INSERT INTO facility_compliance (building_id, compliance_type, status, last_inspection_date, next_inspection_date, inspector_name, notes)
SELECT id, 'Fire Safety', 'pending_review', '2023-10-20', '2024-10-20', 'John Bradley (BFS Safety)', 'Inspection due October 2024. Reminder sent to facilities team.'
FROM buildings WHERE building_name = 'Learning Resources Centre';

INSERT INTO facility_compliance (building_id, compliance_type, status, last_inspection_date, next_inspection_date, inspector_name, notes)
SELECT id, 'Disability Access', 'non_compliant', '2023-06-01', '2024-09-30', 'DDA Compliance Auditor', 'Lift inspection overdue. Awaiting contractor availability.'
FROM buildings WHERE building_name = 'Learning Resources Centre';

INSERT INTO facility_compliance (building_id, compliance_type, status, last_inspection_date, next_inspection_date, inspector_name, notes)
SELECT id, 'Building Maintenance', 'compliant', '2024-04-01', '2025-04-01', 'Facilities Manager', 'Annual structural survey completed. No issues found.'
FROM buildings WHERE building_name = 'Professional Development Hub';
