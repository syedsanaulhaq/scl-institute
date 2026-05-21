-- Production demo seed data

-- Partners
INSERT IGNORE INTO partners
  (partner_name, partner_type, contact_person, job_title, contact_email, phone,
   website, address, country, partnership_start_date,
   associate_type, area_of_expertise, notes, status,
   accreditation_number, accreditation_type, expiry_date, responsible_person,
   programme_titles, programme_codes,
   internal_review_date, internal_reviewer, next_review_date,
   renewal_submission_date, renewal_status, follow_up_actions)
VALUES
  ('Pearson Education Ltd','awarding_body','David Wright','Partnership Manager','david.wright@pearson.com','+44 20 7010 2000','https://www.pearson.com','80 Strand London WC2R 0RL','United Kingdom','2020-09-01',NULL,NULL,'Primary awarding body for HND Business Management and HND Computing programmes.','active','PRS-SCL-2020-001','Programme-specific','2027-08-31','Dr. Sarah Ali','HND Business Management, HND Computing','HND-BM-01, BSC-CS-02','2026-03-15','Dr. Sarah Ali','2026-09-01','2026-06-01','in_progress','Submit updated programme specs by 01 Jun 2026.'),
  ('City and Guilds','awarding_body','Yvonne Clarke','Account Director','y.clarke@cityandguilds.com','+44 20 7294 2468','https://www.cityandguilds.com','1 Giltspur Street London EC1A 9DD','United Kingdom','2019-01-15',NULL,NULL,'Awarding body for Health and Social Care and Engineering.','active','CG-SCL-2019-007','Programme-specific','2026-12-31','Ms. Linda Osei','HND Health and Social Care','HND-HSC-01','2026-02-20','Ms. Linda Osei','2026-08-20','2026-05-30','submitted','Awaiting renewal outcome.'),
  ('British Computer Society BCS','awarding_body','Marcus Bell','Partnerships Lead','m.bell@bcs.uk','+44 1793 417 417','https://www.bcs.org','5 Southampton Street London WC2E 7HA','United Kingdom','2022-04-01',NULL,NULL,'Professional accreditation for IT programmes.','pending_renewal','BCS-SCL-2022-003','Professional Body','2026-03-31','Dr. Sarah Ali','BSc Computing, MSc Data Science','BSC-CS-02, MSC-DS-01','2026-01-10','Dr. Sarah Ali','2026-09-10',NULL,'not_started','Renewal must be submitted by end of Q2.'),
  ('Dr. Yemi Adeyinka','associate','Dr. Yemi Adeyinka','External Examiner','y.adeyinka@londonmet.ac.uk','+44 7712 345 678',NULL,'London Metropolitan University N7 8DB','United Kingdom','2023-09-01','External Examiner','Business Management, Strategy','External examiner for HND Business Management.','active',NULL,NULL,NULL,'Ms. Linda Osei','HND Business Management','HND-BM-01','2026-05-01','Ms. Linda Osei','2027-08-31',NULL,'not_started',NULL),
  ('Prof. Karen Hughes','associate','Prof. Karen Hughes','External Examiner','k.hughes@ucl.ac.uk','+44 7834 567 890',NULL,'UCL Gower Street London WC1E 6BT','United Kingdom','2022-01-10','External Examiner','Health Sciences, Nursing, Social Care','External examiner for BSc Nursing.','active',NULL,NULL,NULL,'Ms. Linda Osei','BSc Nursing, HND Health and Social Care','BSC-NUR-01, HND-HSC-01','2026-04-15','Ms. Linda Osei','2026-10-15',NULL,'not_started',NULL),
  ('TechCorp UK Ltd','associate','James Hargreaves','Head of Talent','j.hargreaves@techcorp.co.uk','+44 20 3456 7890','https://www.techcorp.co.uk','22 Silicon Way Reading RG1 1HT','United Kingdom','2024-02-01','Placement Provider','Software Development, Cloud, Cybersecurity','Industry placements for BSc Computing students.','active',NULL,NULL,NULL,'Dr. Sarah Ali','BSc Computing, MSc Data Science','BSC-CS-02, MSC-DS-01','2026-03-01','Dr. Sarah Ali','2027-02-01',NULL,'not_started',NULL),
  ('Mr. Tariq Hussain','associate','Mr. Tariq Hussain','Industry Mentor','t.hussain@hsconsulting.co.uk','+44 7923 111 222',NULL,'45 Canary Wharf London E14 5AB','United Kingdom','2025-01-15','Industry Mentor','Finance, Accounting, Business Strategy','Mentors final-year HND Business Management students.','active',NULL,NULL,NULL,'Ms. Linda Osei','HND Business Management','HND-BM-01','2026-01-15','Ms. Linda Osei','2027-01-15',NULL,'not_started',NULL),
  ('Dr. Amina Osei','associate','Dr. Amina Osei','Guest Lecturer','a.osei@nhs.net','+44 7601 234 567',NULL,'Royal Free Hospital London NW3 2QG','United Kingdom','2024-09-01','Guest Lecturer','Mental Health, Wellbeing, Community Nursing','Delivers 4 guest lectures per year.','active',NULL,NULL,NULL,'Ms. Linda Osei','BSc Nursing, HND Health and Social Care','BSC-NUR-01, HND-HSC-01','2026-04-01','Ms. Linda Osei','2027-08-31',NULL,'not_started',NULL),
  ('British Chamber of Commerce','affiliate','Rebecca Thornton','Membership Relations','r.thornton@britishchambers.org.uk','+44 20 7654 5800','https://www.britishchambers.org.uk','65 Petty France London SW1H 9EU','United Kingdom','2021-06-01',NULL,NULL,'Provides networking and guest speaker referrals for Business programmes.','active',NULL,NULL,NULL,'Dr. Sarah Ali',NULL,NULL,'2026-02-01','Dr. Sarah Ali','2026-12-01',NULL,'not_started',NULL),
  ('UK Tech Alliance','affiliate','Sophie Grant','Partnerships Manager','s.grant@uktechalliance.org','+44 20 7123 4567','https://www.uktechalliance.org','10 Innovation Hub London SW1A 2AA','United Kingdom','2023-03-01',NULL,NULL,'Industry alliance. Co-runs annual Graduate Tech Fair.','inactive',NULL,NULL,NULL,'Dr. Sarah Ali',NULL,NULL,'2025-11-01','Dr. Sarah Ali','2026-11-01',NULL,'not_started','Reactivation under discussion Q3 2026.');

-- Vendors
INSERT IGNORE INTO vendors
  (company_name, trading_name, vendor_type, nature_of_business, website,
   primary_contact, contact_position, contact_email, contact_phone,
   business_address, payment_terms, scope_of_work, status)
VALUES
  ('Mitie Group PLC','Mitie','Vendor','Facilities management, cleaning, security and maintenance','https://www.mitie.com','Paul Simmons','Account Manager','p.simmons@mitie.com','+44 20 3123 8000','The Shard 32 London Bridge Street London SE1 9SG','Net 30','Campus cleaning, security, building maintenance across all SCL sites','active'),
  ('Computacenter PLC','Computacenter','Supplier','IT hardware, software procurement and managed services','https://www.computacenter.com','Sandra Hill','Education Sector Lead','s.hill@computacenter.com','+44 1707 631 000','Hatfield Avenue Hatfield AL10 9TW','Net 45','Supply of laptops, servers, networking equipment and software licences','active'),
  ('Sodexo UK and Ireland','Sodexo','Vendor','Catering and hospitality for educational institutions','https://uk.sodexo.com','Mark Davies','Contracts Director','m.davies@sodexo.com','+44 20 7535 9000','1 Southampton Row London WC1B 5HA','Net 30','On-site canteen management and catering for staff and student events','active'),
  ('G4S Facilities Management','G4S FM','Vendor','Security services and access control','https://www.g4s.com','Angela Foster','Client Services Manager','a.foster@g4s.com','+44 20 8770 7000','The Manor Manor Royal Crawley RH10 9UN','Net 30','Security personnel, CCTV monitoring and access control management','active'),
  ('Ricoh UK Ltd','Ricoh','Supplier','Print, document management and digital services','https://www.ricoh.co.uk','Claire Thompson','Account Executive','c.thompson@ricoh.co.uk','+44 1753 789 000','Ricoh House Coulsdon CR5 2HR','Net 30','Multi-function printers, photocopiers and managed print services','active'),
  ('Travis Perkins PLC','Travis Perkins','Supplier','Building materials and construction supplies','https://www.travisperkins.co.uk','Gary Norton','Trade Account Manager','g.norton@travisperkins.co.uk','+44 1604 752 424','Lodge Way House Northampton NN5 7UG','Net 30','Building materials for campus refurbishment and maintenance projects','pending'),
  ('Vodafone UK','Vodafone','Supplier','Mobile and broadband telecommunications services','https://www.vodafone.co.uk','Helen Marsh','Business Account Manager','h.marsh@vodafone.co.uk','+44 1635 33251','Vodafone House Newbury RG14 2FN','Monthly','Mobile phone contracts for admin staff and broadband connectivity','active'),
  ('DHL Supply Chain UK','DHL','Subcontractor','Logistics and courier services','https://www.dhl.com/gb','Tom Knight','Business Development','t.knight@dhl.com','+44 1753 608 000','DHL House Billingshurst RH14 0AZ','Net 14','Document delivery, student pack distribution and inter-campus logistics','active');

-- Buildings
INSERT IGNORE INTO buildings
  (building_name, location, ownership_type, year_built, purpose,
   total_floors, total_area_sqm, accessibility_compliance, status)
VALUES
  ('Main Campus Building','Forest Gate Stratford London E7 9HZ','Leased',1998,'Primary academic and administrative hub',5,3200.00,1,'active'),
  ('Annex Building','Forest Gate Stratford London E7 9HZ','Leased',2005,'IT labs, library and student services',3,1400.00,1,'active'),
  ('Student Support Centre','14 Romford Road Stratford London E15 4BZ','Rented',2015,'Student welfare, counselling and careers services',2,650.00,1,'active');

-- Rooms for Main Campus Building (id=1)
INSERT IGNORE INTO building_rooms
  (building_id, room_name, room_type, capacity, floor_number, equipment, it_av_setup, status)
VALUES
  (1,'Lecture Hall A','Classroom',80,1,'Projector, whiteboards, fixed seating','Full AV with HDMI, Apple TV and sound system','active'),
  (1,'Lecture Hall B','Classroom',60,1,'Projector, whiteboards, flexible seating','Projector, wireless presentation system','active'),
  (1,'Seminar Room 1','Meeting Room',20,2,'Tables, chairs, flip charts','TV screen, HDMI connection','active'),
  (1,'Seminar Room 2','Meeting Room',20,2,'Tables, chairs, flip charts','TV screen, HDMI connection','active'),
  (1,'Admin Office','Office',15,3,'Desks, computers, printers','Networked PCs, printer, scanner','active'),
  (1,'Principals Office','Office',4,4,'Executive desk, meeting table','PC, phone, conferencing facility','active');

-- Rooms for Annex Building (id=2)
INSERT IGNORE INTO building_rooms
  (building_id, room_name, room_type, capacity, floor_number, equipment, it_av_setup, status)
VALUES
  (2,'IT Lab 1','IT Lab',30,1,'30 workstations, printers','Windows PCs with Microsoft Office, Visual Studio, AutoCAD','active'),
  (2,'IT Lab 2','IT Lab',30,1,'30 workstations, scanners','Windows PCs with Adobe Creative Suite, Python, coding tools','active'),
  (2,'Library','Library',50,2,'Book stacks, study carrels, group tables','Online catalogue terminals, Wi-Fi throughout','active'),
  (2,'Study Zone','Library',40,3,'Open-plan study tables, charging points','Wi-Fi, printing kiosks','active');

-- Rooms for Student Support Centre (id=3)
INSERT IGNORE INTO building_rooms
  (building_id, room_name, room_type, capacity, floor_number, equipment, it_av_setup, status)
VALUES
  (3,'Counselling Room','Meeting Room',3,1,'Comfortable seating, private space','None','active'),
  (3,'Careers Hub','Office',8,1,'Desks, brochure racks, interview prep area','PCs, job portal access','active'),
  (3,'Disability and Wellbeing Office','Office',6,2,'Specialist equipment, quiet space','Assistive technology software','active');

-- Compliance for Main Campus (id=1)
INSERT IGNORE INTO facility_compliance
  (building_id, compliance_type, status, last_inspection_date, next_inspection_date,
   inspector_name, notes)
VALUES
  (1,'Fire Safety','compliant','2026-01-15','2027-01-15','John Briggs Fire Safety Officer','Annual fire safety certificate renewed. All extinguishers checked and tagged.'),
  (1,'Health and Safety at Work','compliant','2026-02-10','2027-02-10','HSE Approved Inspector','Full H&S audit completed. Minor recommendation on stairwell lighting actioned.'),
  (1,'Disability Access','compliant','2025-11-20','2026-11-20','Inclusive Design Ltd Access Consultant','Lift operational. All accessible routes clearly signed. DDA compliant.'),
  (1,'Emergency Evacuation','review_required','2025-08-01','2026-08-01','Internal H&S Team','Evacuation drill completed but new annex requires updated assembly point signage.'),
  (1,'First Aid Equipment','compliant','2026-03-01','2027-03-01','St John Ambulance','All first aid kits restocked. 4 trained first aiders on site.');

SELECT 'Partners' as tbl, COUNT(*) as cnt FROM partners
UNION ALL SELECT 'Vendors', COUNT(*) FROM vendors
UNION ALL SELECT 'Buildings', COUNT(*) FROM buildings
UNION ALL SELECT 'Rooms', COUNT(*) FROM building_rooms
UNION ALL SELECT 'Compliance', COUNT(*) FROM facility_compliance;
