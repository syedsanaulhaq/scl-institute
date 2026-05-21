-- ============================================================
-- SEED DATA for Modules 28-32 (new modules)
-- Run against: scl_institute (local dev)
-- ============================================================

-- ============================================================
-- Module 28a: Deferral / Withdrawal / Transfer Requests
-- ============================================================
INSERT INTO deferral_requests
  (student_name, student_email, course_title, course_code, request_type, effective_date, justification, policy_consent, digital_signature, reviewed_by, review_date, decision, reason, status)
VALUES
  ('Emma Thompson',  'emma.thompson@student.scl.com',  'HND Business Management',     'HND-BM-01', 'Deferral',    '2026-09-01', 'Medical reasons – recovering from surgery. Have attached consultant letter.',                       1, 'E. Thompson',  'Dr. Sarah Ali',    '2026-05-10', 'Approved',              'Medical evidence accepted.',          'approved'),
  ('James Okafor',   'james.okafor@student.scl.com',   'BSc Computing',               'BSC-CS-02', 'Withdrawal',  '2026-06-01', 'Relocating abroad due to family emergency.',                                                      1, 'J. Okafor',    NULL,               NULL,         NULL,                    NULL,                                  'pending'),
  ('Aisha Rahman',   'aisha.rahman@student.scl.com',   'HND Health & Social Care',    'HND-HSC-01','Transfer',    '2026-09-15', 'Requesting transfer to evening cohort due to work commitments.',                                  1, 'A. Rahman',    'Ms. Linda Osei',   '2026-05-12', 'Approved with Conditions','Must maintain attendance above 80%.', 'approved'),
  ('Liam Chen',      'liam.chen@student.scl.com',      'Diploma in IT',               'DIP-IT-03', 'Deferral',    '2026-09-01', 'Financial difficulties – awaiting Student Finance confirmation.',                                 1, 'L. Chen',      NULL,               NULL,         NULL,                    NULL,                                  'pending'),
  ('Sara Mensah',    'sara.mensah@student.scl.com',    'BSc Nursing',                 'BSC-NUR-01','Withdrawal',  '2026-05-20', 'Changing career path. Has secured an apprenticeship.',                                           1, 'S. Mensah',    'Dr. Sarah Ali',    '2026-05-14', 'Rejected',              'Withdrawal not recommended at this stage. Student advised to speak to a counsellor.', 'rejected'),
  ('Noah Williams',  'noah.williams@student.scl.com',  'HND Business Management',     'HND-BM-01', 'Transfer',    '2026-09-01', 'Needs to switch from full-time to part-time for personal reasons.',                              1, 'N. Williams',  'Ms. Linda Osei',   '2026-05-15', NULL,                    NULL,                                  'info_requested'),
  ('Fatima Al-Farsi','fatima.alfarsi@student.scl.com', 'MSc Data Science',            'MSC-DS-01', 'Deferral',    '2027-01-01', 'Visa renewal in progress. Cannot attend classes until visa is confirmed.',                       1, 'F. Al-Farsi',  'Dr. Sarah Ali',    '2026-05-16', 'Approved',              'Visa issue accepted as valid reason.', 'approved'),
  ('Oliver Grant',   'oliver.grant@student.scl.com',   'HND Engineering',             'HND-ENG-02','Withdrawal',  '2026-06-30', 'Accepted onto a degree apprenticeship at Rolls-Royce.',                                         1, 'O. Grant',     NULL,               NULL,         NULL,                    NULL,                                  'pending');

-- ============================================================
-- Module 28b: Complaints & Appeals
-- ============================================================
INSERT INTO complaints_appeals
  (student_name, student_email, course_title, complaint_type, category, date_of_incident, details, consent, digital_signature, reviewed_by, review_date, decision, reason, remedy, status)
VALUES
  ('James Okafor',   'james.okafor@student.scl.com',   'BSc Computing',            'Complaint', 'Academic',        '2026-04-20', 'Examination result appears inconsistent with coursework grade. Requesting re-mark.',                1, 'J. Okafor',   'Academic Registrar', '2026-05-05', 'Upheld',              'Grade calculation error confirmed.',                              'Re-mark applied – grade updated to Merit.',    'resolved'),
  ('Emma Thompson',  'emma.thompson@student.scl.com',  'HND Business Management',  'Appeal',    'Administrative',  '2026-04-28', 'Appealing deferral decision outcome – believe supporting documents were not reviewed.',             1, 'E. Thompson', NULL,                 NULL,         NULL,                  NULL,                                                              NULL,                                           'submitted'),
  ('Priya Patel',    'priya.patel@student.scl.com',    'HND Health & Social Care', 'Complaint', 'Discrimination',  '2026-03-15', 'Experienced verbal remarks from a lecturer that I found discriminatory and offensive.',             1, 'P. Patel',    'HR Department',      '2026-04-10', 'Upheld',              'Investigation upheld the complaint.',                             'Formal warning issued to staff member.',       'closed'),
  ('Liam Chen',      'liam.chen@student.scl.com',      'Diploma in IT',            'Complaint', 'Academic',        '2026-05-01', 'Assignment feedback was not provided within the stated 3-week turnaround policy.',                  1, 'L. Chen',     'Module Leader',      '2026-05-08', 'Partially Upheld',    'Delay acknowledged; exceptional circumstances cited.',            'Tutor reminded of policy. Apology issued.',    'resolved'),
  ('Aisha Rahman',   'aisha.rahman@student.scl.com',   'HND Health & Social Care', 'Appeal',    'Academic',        '2026-05-10', 'Appealing fail grade for Unit 3. Believe personal circumstances were not taken into account.',      1, 'A. Rahman',   NULL,                 NULL,         NULL,                  NULL,                                                              NULL,                                           'under_review'),
  ('Noah Williams',  'noah.williams@student.scl.com',  'HND Business Management',  'Complaint', 'Administrative',  '2026-04-05', 'Timetable clashes not resolved after multiple requests to admin over 3 weeks.',                   1, 'N. Williams', 'Student Services',   '2026-04-25', 'Upheld',              'System error caused clash. Issue resolved.',                      'Timetable corrected; student compensated with extra tutorial.', 'closed'),
  ('Sara Mensah',    'sara.mensah@student.scl.com',    'BSc Nursing',              'Complaint', 'Other',           '2026-05-02', 'Library access card not working for 2 weeks despite IT tickets raised.',                          1, 'S. Mensah',   NULL,                 NULL,         NULL,                  NULL,                                                              NULL,                                           'submitted');

-- ============================================================
-- Module 28c: Academic Misconduct
-- ============================================================
INSERT INTO academic_misconduct
  (student_name, student_email, course_title, course_code, misconduct_type, incident_date, location_context, description, reviewed_by, panel_date, decision, reason, sanctions, status)
VALUES
  ('Oliver Grant',   'oliver.grant@student.scl.com',   'HND Engineering',          'HND-ENG-02', 'Plagiarism',   '2026-04-15', 'Unit 4 Assignment submission', 'TurnItIn report showed 62% similarity to published sources without citation. Student did not paraphrase or reference correctly.',         'Academic Board', '2026-05-12', 'Fail Assessment',  'Evidence of plagiarism confirmed. Student received a formal warning.',              'Grade capped at 40%; resubmission allowed once.',        'closed'),
  ('Liam Chen',      'liam.chen@student.scl.com',      'Diploma in IT',            'DIP-IT-03',  'Collusion',    '2026-04-22', 'Group project submission',     'Two students submitted near-identical individual reports. Shared files found via SharePoint version history.',                            'Academic Board', '2026-05-15', 'Warning',          'First offence. Students cooperated with investigation.',                            'Formal written warning. Monitored for 12 months.',      'closed'),
  ('Priya Patel',    'priya.patel@student.scl.com',    'HND Health & Social Care', 'HND-HSC-01', 'Cheating',     '2026-03-10', 'End of unit examination',      'Student found with hand-written notes concealed in water bottle label during closed-book exam.',                                          'Academic Board', NULL,          NULL,               NULL,                                                                                NULL,                                                     'panel_scheduled'),
  ('Sara Mensah',    'sara.mensah@student.scl.com',    'BSc Nursing',              'BSC-NUR-01', 'Fabrication',  '2026-05-05', 'Clinical placement log',       'Placement supervisor confirmed student falsified attendance dates in reflective log. 8 sessions claimed were not attended.',               'Programme Lead', NULL,          NULL,               NULL,                                                                                NULL,                                                     'under_review'),
  ('James Okafor',   'james.okafor@student.scl.com',   'BSc Computing',            'BSC-CS-02',  'Plagiarism',   '2026-02-20', 'Unit 2 project report',        'Unattributed code found in final project matching a public GitHub repo line-for-line. Student acknowledged the issue when questioned.',    'Module Leader',  '2026-03-05', 'Fail Assessment',  'Student acknowledged plagiarism. Cooperation noted in sentencing.',                 'Grade 0 for unit; allowed to resubmit in next sitting.',  'closed'),
  ('Fatima Al-Farsi','fatima.alfarsi@student.scl.com', 'MSc Data Science',         'MSC-DS-01',  'Other',        '2026-05-08', 'Online coursework submission',  'Student submitted work using AI-generated content without disclosure, in breach of the AI use policy introduced Sept 2025.',               'Programme Director', NULL,      NULL,               NULL,                                                                                NULL,                                                     'reported');

-- ============================================================
-- Module 29: Student Engagement (7 types)
-- ============================================================
INSERT INTO student_engagement
  (record_type, student_name, student_email, survey_title, survey_period, survey_status, notes, event_date, status)
VALUES
  ('survey', 'All Students', 'all@student.scl.com', 'Student Satisfaction Survey 2025/26', 'Term 2 2026', 'Closed', 'Response rate: 74%. Overall satisfaction 82%. Key improvement area: library opening hours.', '2026-03-01', 'closed'),
  ('survey', 'All Students', 'all@student.scl.com', 'Module Feedback – HND Business', 'Unit 5 April 2026', 'Active', 'Ongoing feedback collection for Unit 5 delivery review.', '2026-04-15', 'active'),
  ('survey', 'All Students', 'all@student.scl.com', 'Graduate Exit Survey 2025/26', 'End of Year 2026', 'Draft', 'Prepared for July graduates. Not yet launched.', NULL, 'pending');

INSERT INTO student_engagement
  (record_type, student_name, student_email, graduation_date, employment_status, employer, job_title, notes, status)
VALUES
  ('graduate_outcome', 'Emma Thompson',  'emma.thompson@student.scl.com',  '2025-07-15', 'Employed',       'KPMG UK',        'Junior Business Analyst',       'Graduate tracked via LinkedIn. Confirmed start date August 2025.', 'active'),
  ('graduate_outcome', 'James Okafor',   'james.okafor@student.scl.com',   '2025-07-15', 'Further Study',  NULL,             NULL,                            'Enrolled on MSc Software Engineering at University of East London.', 'active'),
  ('graduate_outcome', 'Priya Patel',    'priya.patel@student.scl.com',    '2025-07-15', 'Employed',       'NHS Trust',      'Healthcare Assistant',          'Part-time while completing professional registration.', 'active'),
  ('graduate_outcome', 'Noah Williams',  'noah.williams@student.scl.com',  '2024-07-15', 'Self-Employed',  NULL,             'Freelance Consultant',         'Running independent consulting practice.', 'active');

INSERT INTO student_engagement
  (record_type, student_name, student_email, support_type, notes, event_date, status)
VALUES
  ('employability', 'Liam Chen',       'liam.chen@student.scl.com',      'CV Workshop',         'Attended the February 2026 CV & Cover Letter workshop. Received 1-on-1 coaching session.', '2026-02-14', 'active'),
  ('employability', 'Sara Mensah',     'sara.mensah@student.scl.com',    'Mock Interview',      'Completed two mock interviews. Feedback: strong communication, needs to improve technical knowledge demonstration.', '2026-03-10', 'active'),
  ('employability', 'Aisha Rahman',    'aisha.rahman@student.scl.com',   'Employer Event',      'Attended the Health & Care Careers Fair. Made contact with 3 NHS trusts.', '2026-04-20', 'active');

INSERT INTO student_engagement
  (record_type, student_name, student_email, service_type, outcome, notes, event_date, status)
VALUES
  ('support_service', 'Oliver Grant',   'oliver.grant@student.scl.com',   'Counselling',         'Student completed 6 sessions. Reported improved focus and wellbeing.',   'Referred by personal tutor following attendance concerns.', '2026-01-10', 'closed'),
  ('support_service', 'Fatima Al-Farsi','fatima.alfarsi@student.scl.com', 'Financial Guidance',  'Signposted to Student Finance England and internal hardship fund.',       'Experiencing financial strain due to visa delays.',          '2026-03-15', 'active'),
  ('support_service', 'Liam Chen',      'liam.chen@student.scl.com',      'Mentoring',           'Peer mentor assigned. Fortnightly check-ins running.',                   'Requested a mentor to help with time management.',          '2026-02-01', 'active');

INSERT INTO student_engagement
  (record_type, student_name, student_email, advisor_name, meeting_date, discussion_notes, follow_up_actions, status)
VALUES
  ('advising', 'Emma Thompson',  'emma.thompson@student.scl.com',  'Dr. Sarah Ali',    '2026-05-03', 'Discussed academic progress and deferral plans. Student is on track for Merit overall.', 'Follow up in 4 weeks to confirm deferral approval.', 'active'),
  ('advising', 'James Okafor',   'james.okafor@student.scl.com',   'Ms. Linda Osei',   '2026-04-25', 'Student expressed interest in postgraduate study. Explored options and entry requirements.', 'Provide postgraduate prospectus and UCAS guidance.', 'active'),
  ('advising', 'Sara Mensah',    'sara.mensah@student.scl.com',    'Dr. Sarah Ali',    '2026-05-08', 'Student considering withdrawal. Counselled on implications and alternatives.', 'Arrange meeting with Student Support Manager.', 'active');

INSERT INTO student_engagement
  (record_type, student_name, student_email, category_type, notes, event_date, status)
VALUES
  ('wellbeing', 'Priya Patel',  'priya.patel@student.scl.com',  'Stress & Anxiety', 'Student attended the Mindfulness & Resilience workshop. Self-reported improvement in stress management.', '2026-04-05', 'closed'),
  ('wellbeing', 'Liam Chen',    'liam.chen@student.scl.com',    'Social Isolation', 'Referred to Wellbeing team by tutor. Encouraged to join student society. Now active in Computing Society.', '2026-03-20', 'active'),
  ('wellbeing', 'Noah Williams','noah.williams@student.scl.com','Financial Stress',  'Signposted to financial guidance. Student engaged with hardship fund application.', '2026-04-18', 'active');

INSERT INTO student_engagement
  (record_type, student_name, student_email, category_type, adjustments, notes, event_date, status)
VALUES
  ('disability', 'Aisha Rahman',   'aisha.rahman@student.scl.com',   'Dyslexia',             '25% extra time in assessments; coloured paper available; access to assistive technology.',    'DSA confirmed. Learning Support Plan in place since October 2025.', '2025-10-01', 'active'),
  ('disability', 'Oliver Grant',   'oliver.grant@student.scl.com',   'Physical Disability',  'Ground floor classroom allocation; lift access required; ergonomic chair provided.',           'Wheelchair user. Reasonable adjustments reviewed annually.',         '2025-09-15', 'active'),
  ('disability', 'Fatima Al-Farsi','fatima.alfarsi@student.scl.com', 'Mental Health',        'Flexible submission deadlines (24hr extension); access to quiet exam room; wellbeing check-ins.','Anxiety disorder documented. Adjustments agreed with SENCO.',      '2026-01-20', 'active');

-- ============================================================
-- Module 30: New Programmes
-- ============================================================
INSERT INTO new_programmes
  (programme_title, programme_code, programme_type, awarding_body, regulation_level, mode_of_delivery, start_date, subject_area, rationale, objectives, target_audience, entry_requirements, learning_outcomes, assessment_methods, tuition_fee, status, created_by)
VALUES
  ('HND Artificial Intelligence & Data Science', 'HND-AIDS-01', 'HND', 'Pearson BTEC', 'Level 5', 'Full-Time',    '2027-09-01', 'Computing & Technology', 'Growing employer demand for AI/ML practitioners. Aligns with the UK National AI Strategy.', 'Develop practical AI and data analysis skills; prepare students for T-level progression or degree top-up.', 'School leavers and career changers aged 18+.', '4 GCSEs grade 4+ including Maths; or Level 3 vocational qualification.', 'Analyse large datasets; build basic ML models; apply ethical AI principles.', 'Coursework (70%), Practical projects (30%).', 9250.00, 'approved', 'Dr. Sarah Ali'),
  ('MSc Cybersecurity & Digital Forensics',      'MSC-CDF-01',  'Degree', 'University of East London', 'Level 7', 'Blended',    '2027-01-01', 'Computing & Technology', 'Rising need for cybersecurity professionals in public and private sectors post-2023 data breaches.', 'Provide advanced knowledge of cyber threats, digital investigation and incident response.', 'Computing graduates and IT professionals.', 'Relevant undergraduate degree (2:2 minimum) or equivalent professional experience.', 'Conduct digital forensics investigations; design secure network architectures; lead incident response.', 'Assignments (60%), Dissertation (40%).', 12500.00, 'under_review', 'Dr. Sarah Ali'),
  ('Short Course: Project Management Fundamentals','SC-PMF-01', 'Short Course', 'SCL Internal', 'Level 4', 'Online', '2026-09-01', 'Business & Management', 'High demand from employers for certified project managers. Quick-win CPD opportunity for existing students.', 'Introduce project management methodologies (Agile, PRINCE2 basics) in a digestible 8-week format.', 'Working professionals and final-year students.', 'No formal entry requirements. Basic IT literacy required.', 'Create project plans; manage budgets; apply Agile sprint methodology.', 'Online quizzes (50%), Practical project plan submission (50%).', 850.00, 'approved', 'Ms. Linda Osei'),
  ('HND Green Energy & Sustainability',           'HND-GES-01', 'HND', 'Pearson BTEC', 'Level 5', 'Part-Time',   '2027-09-01', 'Engineering & Science', 'UK Net Zero 2050 target creating demand for sustainability professionals across all industries.', 'Train technicians in renewable energy, environmental compliance and sustainable business practices.', 'Engineering professionals and school leavers with science A-levels.', '4 GCSEs grade 4+ including Science; or relevant Level 3 qualification.', 'Assess environmental impact; design solar/wind energy solutions; prepare sustainability reports.', 'Coursework (60%), Field studies (20%), Portfolio (20%).', 7500.00, 'draft', 'Mr. Ahmed Khan'),
  ('PGCert Leadership in Education',              'PGC-LE-01',  'CPD', 'University of Greenwich', 'Level 7', 'Part-Time', '2026-09-01', 'Education & Training', 'Increasing demand for leadership training among senior educators and department heads in FE/HE.', 'Develop strategic leadership capabilities specific to educational contexts.', 'Senior lecturers, HODs and school leadership teams.', 'Undergraduate degree and 3+ years in education sector.', 'Lead curriculum change; manage institutional quality; coach and mentor teams.', 'Essay (50%), Leadership project (50%).', 4500.00, 'submitted', 'Dr. Sarah Ali');

-- Programme Validations
INSERT INTO programme_validations
  (programme_title, qualification_level, mode_of_delivery, start_date, programme_lead, faculty_review_status, faculty_review_notes, faculty_review_date, qa_review_status, qa_review_notes, qa_review_date, panel_decision, panel_chair, decision_date, status)
VALUES
  ('HND Artificial Intelligence & Data Science', 'Level 5', 'Full-Time', '2027-09-01', 'Dr. Sarah Ali',  'approved', 'Faculty review complete. Strong curriculum design.', '2026-02-10', 'approved', 'QA review passed. Industry links excellent.', '2026-03-01', 'Approved', 'Prof. Michael Brown', '2026-03-15', 'approved'),
  ('MSc Cybersecurity & Digital Forensics',      'Level 7', 'Blended',   '2027-01-01', 'Dr. James Holt', 'approved', 'Faculty approved with minor amendments.', '2026-04-01',            'pending',  NULL,                                        NULL,          NULL,       NULL,                  NULL,          'qa_review'),
  ('Short Course: Project Management Fundamentals','Level 4','Online',   '2026-09-01', 'Ms. Linda Osei', 'approved', 'Fast-track review approved.', '2026-01-20',                        'approved', 'QA confirmed light-touch process applied.',  '2026-02-05', 'Approved', 'Dr. Sarah Ali',       '2026-02-10', 'approved'),
  ('PGCert Leadership in Education',             'Level 7', 'Part-Time', '2026-09-01', 'Dr. Sarah Ali',  'pending',  NULL,                          NULL,                                'pending',  NULL,                                        NULL,          NULL,       NULL,                  NULL,          'faculty_review');

-- ============================================================
-- Module 31: Vendors
-- ============================================================
INSERT INTO vendors
  (company_name, trading_name, registration_number, vat_number, vendor_type, nature_of_business, website, primary_contact, contact_position, contact_email, contact_phone, business_address, bank_name, account_number, sort_code, payment_terms, scope_of_work, rates, status)
VALUES
  ('CleanPro Services Ltd',     'CleanPro',         '08123456', 'GB123456789', 'Subcontractor', 'Commercial cleaning and facilities maintenance.',        'www.cleanpro.co.uk',    'David Hughes',   'Operations Director', 'david@cleanpro.co.uk',    '07700 900001', '14 Industrial Way, London E1 6RF', 'Barclays',  '12345678', '20-15-30', '30 days', 'Daily cleaning of all campus buildings Mon-Fri 06:00-08:00. Deep clean monthly.', '£18/hr per operative; £2,200/month flat rate for 2 operatives.', 'active'),
  ('TechSupport Solutions UK',  'TechSupport UK',   '09234567', 'GB234567890', 'Vendor',        'IT hardware supply, software licensing and support.',    'www.techsupportuk.com', 'Angela Mensah',  'Account Manager',     'angela@techsupportuk.com','07700 900002', '22 Tech Park, London EC2A 4BX',    'HSBC',      '87654321', '40-12-34', '14 days', 'Supply of laptops, networking equipment and Microsoft licensing for academic year.', 'Per quote basis; standard SLA 4hr response.', 'active'),
  ('Green Grounds Landscaping', 'Green Grounds',    '07345678', NULL,          'Subcontractor', 'Grounds maintenance, gardening and external upkeep.',    'www.greengrounds.co.uk','Tom Briggs',     'Director',            'tom@greengrounds.co.uk',  '07700 900003', '5 Garden Road, London SE12 9TT',   'NatWest',   '11223344', '60-00-01', '30 days', 'Fortnightly grounds maintenance during term time; additional visits as required.', '£650 per visit.', 'active'),
  ('SafeSecure Ltd',            'SafeSecure',       '06456789', 'GB456789012', 'Supplier',      'CCTV installation, monitoring and security personnel.',  'www.safesecure.co.uk',  'Maria Santos',   'Commercial Manager',  'maria@safesecure.co.uk',  '07700 900004', '9 Security House, London N1 8QP',  'Lloyds',    '55667788', '30-99-00', '14 days', 'CCTV monitoring 24/7; 2 security personnel on site during opening hours.', '£4,800/month all-inclusive.', 'active'),
  ('PrintRight Ltd',            'PrintRight',       '05567890', 'GB567890123', 'Vendor',        'Printing, reprographics, stationery and branded materials.','www.printright.co.uk', 'Karen Yeboah',   'Sales Director',      'karen@printright.co.uk',  '07700 900005', '33 Print Lane, London SE1 7PG',    'Santander', '99887766', '20-45-60', '30 days', 'All printing needs for academic and marketing materials. Student Union materials included.', 'Per job pricing; volume discounts above £500.', 'active'),
  ('Novus Catering Group',      'Novus Catering',   '04678901', 'GB678901234', 'Subcontractor', 'Campus catering, vending machines and event hospitality.', 'www.novuscatering.co.uk','Stuart Collins', 'Contract Manager',    'stuart@novuscatering.co.uk','07700 900006','45 Food Court Way, London W1T 3HG', 'Halifax',   '44332211', '77-55-22', '30 days', 'Canteen operation Mon-Fri 08:00-16:00; vending machines all areas; event catering as required.', 'Revenue share model: 15% of net catering income.', 'pending'),
  ('LexLegal Associates',       NULL,               '03789012', 'GB789012345', 'Supplier',      'Legal services, HR compliance and employment law advice.', 'www.lexlegal.co.uk',    'Rachel Green',   'Partner',             'rachel@lexlegal.co.uk',   '07700 900007', '78 Chancery Lane, London WC2A 1AA','Royal Bank', '22334455', '16-00-08', '30 days', 'Ongoing employment law and contractual advice; student disciplinary support.', '£280/hr; fixed monthly retainer £2,000.', 'active');

-- ============================================================
-- Module 32: Buildings & Facilities
-- ============================================================
INSERT INTO buildings
  (building_name, location, ownership_type, year_built, purpose, total_floors, total_area_sqm, fire_safety_cert_expiry, accessibility_compliance, accessibility_notes, status)
VALUES
  ('Main Campus Building – Stratford', 'The Grove, Stratford, London E15 1EL', 'Leased',  1985, 'Primary teaching, admin and student services', 4, 3200.00, '2026-12-31', 1, 'Fully DDA compliant. Lifts on all floors. Accessible toilets on each level.', 'active'),
  ('Annex Block – West Wing',          'West Side Road, Stratford, London E15 2BQ','Rented', 2005, 'Lecture halls, IT labs and student common room', 2, 1100.00, '2026-09-30', 1, 'Lift installed 2018. Step-free access from main entrance.',                  'active'),
  ('Bowman House – City Campus',       '42 Bowman Road, London EC1V 5AQ',         'Owned',  2012, 'Library, research rooms and postgraduate study space', 3, 1800.00, '2027-03-15', 1, 'Fully accessible. Hearing loops in all meeting rooms.',                      'active'),
  ('East Block – Sports & Wellbeing',  'East Campus Lane, London E15 3CD',        'Leased', 2000, 'Sports hall, gym and wellbeing centre', 2, 950.00, '2026-11-30', 0, 'Ramp access at rear entrance. Lift under repair (ETA July 2026).', 'under_maintenance');

INSERT INTO building_rooms
  (building_id, room_name, room_type, capacity, floor_number, equipment, it_av_setup, accessibility_features, status)
VALUES
  (1, 'Room 101 – Lecture Hall A',    'Classroom',    60, 1, 'Whiteboard, projector, student desks (60)', 'Projector + screen, HDMI ports, WiFi', 'Hearing loop, wide aisles, designated wheelchair space', 'active'),
  (1, 'Room 102 – Seminar Room B',    'Classroom',    25, 1, 'Interactive whiteboard, flipcharts', 'Smart TV 65", HDMI, Webcam for hybrid', 'Step-free access, adjustable tables', 'active'),
  (1, 'Room 203 – IT Lab 1',          'IT Lab',       30, 2, '30x Dell PCs, printers, scanners', 'Individual PC stations, dual monitors, high-speed fibre', 'Accessible workstations available', 'active'),
  (1, 'Room 204 – IT Lab 2',          'IT Lab',       30, 2, '30x Dell PCs', 'Same spec as Lab 1', 'Accessible workstations available', 'active'),
  (1, 'Admin Suite – Ground Floor',   'Office',       20, 0, 'Admin desks, filing systems, reception desk', 'Standard office IT, phone system', 'Reception counter at accessible height', 'active'),
  (2, 'Lecture Hall – West Wing',     'Auditorium',   120, 1, 'Tiered seating, stage, podium', 'Full AV system, 2x projectors, PA system', 'Hearing loop, step-free side entrance, reserved front-row seating', 'active'),
  (2, 'Common Room',                  'Other',        80, 0, 'Sofas, TV, vending machines, lockers', 'TV screens, USB charging stations', 'Wide open-plan layout, accessible seating areas', 'active'),
  (3, 'Library – Main Floor',         'Library',      100, 0, 'Books, journals, study carrels, silent zones', 'Self-checkout terminals, 20x PCs, WiFi 6', 'Accessible shelving, height-adjustable desks', 'active'),
  (3, 'Postgraduate Study Room',      'Meeting Room', 20, 2, 'Whiteboard, presentation screen', 'TV + laptop dock, video conferencing', 'Fully accessible, adjustable furniture', 'active'),
  (4, 'Sports Hall',                  'Other',        200, 0, 'Basketball court markings, sports equipment', 'PA system, scoreboard', 'Ramp access, accessible changing rooms', 'active');

INSERT INTO facility_compliance
  (building_id, compliance_type, status, last_inspection_date, next_inspection_date, inspector_name, findings, corrective_actions)
VALUES
  (1, 'Health & Safety at Work',  'compliant',       '2026-01-10', '2027-01-10', 'H&S Inspector – John Price',   'No significant issues found. Minor housekeeping recommendations noted.', 'Staff reminded about corridor clearance policy.'),
  (1, 'Fire Safety',               'compliant',       '2025-12-05', '2026-12-05', 'London Fire Brigade',          'All fire exits clear and signaged. Extinguishers serviced.', 'None required.'),
  (1, 'Emergency Evacuation',      'compliant',       '2026-02-20', '2026-08-20', 'Site Safety Officer',          'Evacuation drill completed successfully. Evacuation time: 3 mins 40 secs.', 'Update PEEP for two new mobility-impaired students.'),
  (1, 'First Aid Equipment',       'compliant',       '2026-04-01', '2026-10-01', 'First Aid Officer',            'All kits fully stocked. Defibrillator serviced.', 'None.'),
  (1, 'Trained Personnel',         'compliant',       '2026-03-15', '2027-03-15', 'Training Records Team',        '6 qualified first aiders on site. Records up to date.', 'None.'),
  (1, 'Building Maintenance',      'compliant',       '2026-04-15', '2026-10-15', 'Facilities Manager',           'Minor plumbing issue on floor 3 resolved.', 'Plumbing maintenance schedule updated.'),
  (1, 'Facilities Inspection',     'compliant',       '2026-03-01', '2026-09-01', 'Estates Inspector',            'General condition good. Carpets showing wear on floor 2.', 'Schedule carpet replacement for summer 2026.'),
  (1, 'Disability Access',         'compliant',       '2026-01-20', '2027-01-20', 'Access Consultant',            'DDA compliance confirmed. All lifts operational.', 'None.'),
  (1, 'Reasonable Adjustments',    'compliant',       '2026-02-10', '2027-02-10', 'SENCO / Disability Team',      'Adjustments reviewed for 12 students. All in place.', 'None.'),
  (2, 'Fire Safety',               'compliant',       '2025-11-20', '2026-11-20', 'Site Safety Officer',          'Fire doors all operational. No blockages found.', 'None.'),
  (2, 'Health & Safety at Work',   'compliant',       '2026-01-15', '2027-01-15', 'H&S Inspector',                'Compliant. Cleaning schedule visible and up to date.', 'None.'),
  (2, 'Disability Access',         'pending_review',  '2025-09-01', '2026-06-01', 'Access Consultant',            'Lift was out of service at last inspection. Review pending post-repair.', 'Lift repair scheduled Q2 2026. Re-inspection booked for June 2026.'),
  (3, 'Fire Safety',               'compliant',       '2026-02-15', '2027-02-15', 'London Fire Brigade',          'All compliant. Recent installation of new fire alarm system confirmed.', 'None.'),
  (3, 'Health & Safety at Work',   'compliant',       '2026-02-15', '2027-02-15', 'H&S Inspector',                'No issues. Excellent housekeeping standards observed.', 'None.'),
  (3, 'Disability Access',         'compliant',       '2026-01-25', '2027-01-25', 'Access Consultant',            'Fully DDA compliant. Hearing loops working in all rooms.', 'None.'),
  (4, 'Health & Safety at Work',   'non_compliant',   '2026-04-10', '2026-07-10', 'H&S Inspector',                'Lift out of service. Risk to mobility-impaired users. Immediate action required.', 'Lift repair contracted. Temporary signage in place. Review July 2026.'),
  (4, 'Fire Safety',               'compliant',       '2026-01-08', '2027-01-08', 'Site Safety Officer',          'No issues found.', 'None.'),
  (4, 'Disability Access',         'non_compliant',   '2026-04-10', '2026-07-10', 'Access Consultant',            'Lift failure impacting DDA compliance. Upper floor inaccessible to wheelchair users.', 'Urgent lift repair required. Alternative access arrangements communicated to affected students.');
