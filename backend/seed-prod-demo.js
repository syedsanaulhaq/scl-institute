/**
 * Production demo seed: Partners, Vendors & Buildings/Facilities
 * Run via: docker exec scli-backend-prod node /tmp/seed-prod-demo.js
 */
const pool = require('/app/db');

async function seed() {
    const conn = await pool.getConnection();
    try {
        // ── Partners ──────────────────────────────────────────────────────────
        console.log('Seeding partners...');
        await conn.query(`
            INSERT IGNORE INTO partners
              (partner_name, partner_type, contact_person, job_title, contact_email, phone,
               website, address, country, partnership_start_date,
               associate_type, area_of_expertise, notes, status,
               accreditation_number, accreditation_type, expiry_date, responsible_person,
               programme_titles, programme_codes,
               internal_review_date, internal_reviewer, next_review_date,
               renewal_submission_date, renewal_status, follow_up_actions)
            VALUES
              ('Pearson Education Ltd', 'awarding_body',
               'David Wright', 'Partnership Manager', 'david.wright@pearson.com', '+44 20 7010 2000',
               'https://www.pearson.com', '80 Strand, London, WC2R 0RL', 'United Kingdom', '2020-09-01',
               NULL, NULL, 'Primary awarding body for HND Business Management and HND Computing programmes.', 'active',
               'PRS-SCL-2020-001', 'Programme-specific', '2027-08-31', 'Dr. Sarah Ali',
               'HND Business Management, HND Computing, HND Engineering', 'HND-BM-01, BSC-CS-02, HND-ENG-02',
               '2026-03-15', 'Dr. Sarah Ali', '2026-09-01', '2026-06-01', 'in_progress',
               'Submit updated programme specifications by 01 Jun 2026.'),

              ('City & Guilds', 'awarding_body',
               'Yvonne Clarke', 'Account Director', 'y.clarke@cityandguilds.com', '+44 20 7294 2468',
               'https://www.cityandguilds.com', '1 Giltspur Street, London, EC1A 9DD', 'United Kingdom', '2019-01-15',
               NULL, NULL, 'Awarding body for vocational Health & Social Care and Engineering qualifications.', 'active',
               'CG-SCL-2019-007', 'Programme-specific', '2026-12-31', 'Ms. Linda Osei',
               'HND Health & Social Care, Diploma in Engineering', 'HND-HSC-01, DIP-ENG-01',
               '2026-02-20', 'Ms. Linda Osei', '2026-08-20', '2026-05-30', 'submitted',
               'Awaiting outcome of renewal submission. Follow up if no response by 15 Jun.'),

              ('British Computer Society (BCS)', 'awarding_body',
               'Marcus Bell', 'Partnerships Lead', 'm.bell@bcs.uk', '+44 1793 417 417',
               'https://www.bcs.org', '5 Southampton Street, London, WC2E 7HA', 'United Kingdom', '2022-04-01',
               NULL, NULL, 'Professional membership and accreditation for IT and Computing programmes.', 'pending_renewal',
               'BCS-SCL-2022-003', 'Professional Body', '2026-03-31', 'Dr. Sarah Ali',
               'BSc Computing, MSc Data Science', 'BSC-CS-02, MSC-DS-01',
               '2026-01-10', 'Dr. Sarah Ali', '2026-09-10', NULL, 'not_started',
               'Accreditation expired. Renewal application must be submitted by end of Q2.'),

              ('Dr. Yemi Adeyinka', 'associate',
               'Dr. Yemi Adeyinka', 'External Examiner', 'y.adeyinka@londonmet.ac.uk', '+44 7712 345 678',
               NULL, 'London Metropolitan University, London N7 8DB', 'United Kingdom', '2023-09-01',
               'External Examiner', 'Business Management, Strategy, Organisational Behaviour',
               'External examiner for HND Business Management. Annual review visit scheduled for June.', 'active',
               NULL, NULL, NULL, 'Ms. Linda Osei',
               'HND Business Management', 'HND-BM-01',
               '2026-05-01', 'Ms. Linda Osei', '2027-08-31', NULL, 'not_started', NULL),

              ('Prof. Karen Hughes', 'associate',
               'Prof. Karen Hughes', 'External Examiner', 'k.hughes@ucl.ac.uk', '+44 7834 567 890',
               NULL, 'University College London, Gower Street, London, WC1E 6BT', 'United Kingdom', '2022-01-10',
               'External Examiner', 'Health Sciences, Nursing, Social Care',
               'External examiner for BSc Nursing and HND Health & Social Care.', 'active',
               NULL, NULL, NULL, 'Ms. Linda Osei',
               'BSc Nursing, HND Health & Social Care', 'BSC-NUR-01, HND-HSC-01',
               '2026-04-15', 'Ms. Linda Osei', '2026-10-15', NULL, 'not_started', NULL),

              ('TechCorp UK Ltd', 'associate',
               'James Hargreaves', 'Head of Talent & Partnerships', 'j.hargreaves@techcorp.co.uk', '+44 20 3456 7890',
               'https://www.techcorp.co.uk', '22 Silicon Way, Reading, RG1 1HT', 'United Kingdom', '2024-02-01',
               'Placement Provider', 'Software Development, Cloud Computing, Cybersecurity',
               'Provides industry placements for BSc Computing and MSc Data Science students.', 'active',
               NULL, NULL, NULL, 'Dr. Sarah Ali',
               'BSc Computing, MSc Data Science', 'BSC-CS-02, MSC-DS-01',
               '2026-03-01', 'Dr. Sarah Ali', '2027-02-01', NULL, 'not_started', NULL),

              ('Mr. Tariq Hussain', 'associate',
               'Mr. Tariq Hussain', 'Industry Mentor', 't.hussain@hsconsulting.co.uk', '+44 7923 111 222',
               NULL, '45 Canary Wharf, London, E14 5AB', 'United Kingdom', '2025-01-15',
               'Industry Mentor', 'Finance, Accounting, Business Strategy',
               'Mentors final-year HND Business Management students.', 'active',
               NULL, NULL, NULL, 'Ms. Linda Osei',
               'HND Business Management', 'HND-BM-01',
               '2026-01-15', 'Ms. Linda Osei', '2027-01-15', NULL, 'not_started', NULL),

              ('Dr. Amina Osei', 'associate',
               'Dr. Amina Osei', 'Guest Lecturer', 'a.osei@nhs.net', '+44 7601 234 567',
               NULL, 'Royal Free Hospital, Pond Street, London, NW3 2QG', 'United Kingdom', '2024-09-01',
               'Guest Lecturer', 'Mental Health, Wellbeing, Community Nursing',
               'Delivers 4 guest lectures per academic year for BSc Nursing cohorts.', 'active',
               NULL, NULL, NULL, 'Ms. Linda Osei',
               'BSc Nursing, HND Health & Social Care', 'BSC-NUR-01, HND-HSC-01',
               '2026-04-01', 'Ms. Linda Osei', '2027-08-31', NULL, 'not_started', NULL),

              ('British Chamber of Commerce', 'affiliate',
               'Rebecca Thornton', 'Membership Relations', 'r.thornton@britishchambers.org.uk', '+44 20 7654 5800',
               'https://www.britishchambers.org.uk', '65 Petty France, London, SW1H 9EU', 'United Kingdom', '2021-06-01',
               NULL, NULL, 'Provides networking opportunities and guest speaker referrals for Business programmes.', 'active',
               NULL, NULL, NULL, 'Dr. Sarah Ali', NULL, NULL,
               '2026-02-01', 'Dr. Sarah Ali', '2026-12-01', NULL, 'not_started', NULL),

              ('UK Tech Alliance', 'affiliate',
               'Sophie Grant', 'Partnerships Manager', 's.grant@uktechalliance.org', '+44 20 7123 4567',
               'https://www.uktechalliance.org', '10 Innovation Hub, London, SW1A 2AA', 'United Kingdom', '2023-03-01',
               NULL, NULL, 'Industry alliance affiliate. Co-runs annual Graduate Tech Fair.', 'inactive',
               NULL, NULL, NULL, 'Dr. Sarah Ali', NULL, NULL,
               '2025-11-01', 'Dr. Sarah Ali', '2026-11-01', NULL, 'not_started',
               'Reactivation under discussion. Follow up in Q3 2026.')
        `);
        console.log('✅ Partners seeded');

        // ── Vendors ───────────────────────────────────────────────────────────
        console.log('Seeding vendors...');
        await conn.query(`
            INSERT IGNORE INTO vendors
              (company_name, trading_name, vendor_type, nature_of_business, website,
               primary_contact, contact_position, contact_email, contact_phone,
               business_address, payment_terms, scope_of_work, status)
            VALUES
              ('Mitie Group PLC', 'Mitie', 'Vendor',
               'Facilities management, cleaning, security and maintenance services',
               'https://www.mitie.com',
               'Paul Simmons', 'Account Manager', 'p.simmons@mitie.com', '+44 20 3123 8000',
               'The Shard, 32 London Bridge Street, London, SE1 9SG',
               'Net 30', 'Campus cleaning, security, building maintenance across all SCL sites', 'active'),

              ('Computacenter PLC', 'Computacenter', 'Supplier',
               'IT hardware, software procurement and managed services',
               'https://www.computacenter.com',
               'Sandra Hill', 'Education Sector Lead', 's.hill@computacenter.com', '+44 1707 631 000',
               'Hatfield Avenue, Hatfield, AL10 9TW',
               'Net 45', 'Supply of laptops, servers, networking equipment and software licences', 'active'),

              ('Sodexo UK & Ireland', 'Sodexo', 'Vendor',
               'Catering and hospitality services for educational institutions',
               'https://uk.sodexo.com',
               'Mark Davies', 'Contracts Director', 'm.davies@sodexo.com', '+44 20 7535 9000',
               '1 Southampton Row, London, WC1B 5HA',
               'Net 30', 'On-site canteen management and catering for staff and student events', 'active'),

              ('G4S Facilities Management', 'G4S FM', 'Vendor',
               'Security services and access control',
               'https://www.g4s.com',
               'Angela Foster', 'Client Services Manager', 'a.foster@g4s.com', '+44 20 8770 7000',
               'The Manor, Manor Royal, Crawley, RH10 9UN',
               'Net 30', 'Security personnel, CCTV monitoring and access control management', 'active'),

              ('Ricoh UK Ltd', 'Ricoh', 'Supplier',
               'Print, document management and digital services',
               'https://www.ricoh.co.uk',
               'Claire Thompson', 'Account Executive', 'c.thompson@ricoh.co.uk', '+44 1753 789 000',
               'Ricoh House, Ullswater Crescent, Coulsdon, CR5 2HR',
               'Net 30', 'Multi-function printers, photocopiers and managed print services', 'active'),

              ('Travis Perkins PLC', 'Travis Perkins', 'Supplier',
               'Building materials and construction supplies',
               'https://www.travisperkins.co.uk',
               'Gary Norton', 'Trade Account Manager', 'g.norton@travisperkins.co.uk', '+44 1604 752 424',
               'Lodge Way House, Harlestone Road, Northampton, NN5 7UG',
               'Net 30', 'Building materials for campus refurbishment and maintenance projects', 'pending'),

              ('Vodafone UK', 'Vodafone', 'Supplier',
               'Mobile and broadband telecommunications services',
               'https://www.vodafone.co.uk',
               'Helen Marsh', 'Business Account Manager', 'h.marsh@vodafone.co.uk', '+44 1635 33251',
               'Vodafone House, The Connection, Newbury, RG14 2FN',
               'Monthly', 'Mobile phone contracts for admin staff and broadband connectivity', 'active'),

              ('DHL Supply Chain UK', 'DHL', 'Subcontractor',
               'Logistics and courier services',
               'https://www.dhl.com/gb',
               'Tom Knight', 'Business Development', 't.knight@dhl.com', '+44 1753 608 000',
               'DHL House, New Pound, Wisborough Green, Billingshurst, RH14 0AZ',
               'Net 14', 'Document delivery, student pack distribution and inter-campus logistics', 'active')
        `);
        console.log('✅ Vendors seeded');

        // ── Buildings & Rooms ─────────────────────────────────────────────────
        console.log('Seeding buildings...');
        const [b1] = await conn.query(`
            INSERT IGNORE INTO buildings
              (building_name, location, ownership_type, year_built, purpose,
               total_floors, total_area_sqm, accessibility_compliance, status)
            VALUES
              ('Main Campus Building', 'Forest Gate, Stratford, London E7 9HZ', 'Leased', 1998,
               'Primary academic and administrative hub', 5, 3200.00, 1, 'active')
        `);

        const [b2] = await conn.query(`
            INSERT IGNORE INTO buildings
              (building_name, location, ownership_type, year_built, purpose,
               total_floors, total_area_sqm, accessibility_compliance, status)
            VALUES
              ('Annex Building', 'Forest Gate, Stratford, London E7 9HZ', 'Leased', 2005,
               'IT labs, library and student services', 3, 1400.00, 1, 'active')
        `);

        const [b3] = await conn.query(`
            INSERT IGNORE INTO buildings
              (building_name, location, ownership_type, year_built, purpose,
               total_floors, total_area_sqm, accessibility_compliance, status)
            VALUES
              ('Student Support Centre', '14 Romford Road, Stratford, London E15 4BZ', 'Rented', 2015,
               'Student welfare, counselling and careers services', 2, 650.00, 1, 'active')
        `);

        // Rooms for Main Campus
        const mainId = b1.insertId || 1;
        const annexId = b2.insertId || 2;
        const supportId = b3.insertId || 3;

        await conn.query(`
            INSERT IGNORE INTO building_rooms
              (building_id, room_name, room_type, capacity, floor_number,
               equipment, it_av_setup, status)
            VALUES
              (?, 'Lecture Hall A', 'Classroom', 80, 1,
               'Projector, whiteboards, fixed seating', 'Full AV with HDMI, Apple TV and sound system', 'active'),
              (?, 'Lecture Hall B', 'Classroom', 60, 1,
               'Projector, whiteboards, flexible seating', 'Projector, wireless presentation system', 'active'),
              (?, 'Seminar Room 1', 'Meeting Room', 20, 2,
               'Tables, chairs, flip charts', 'TV screen, HDMI connection', 'active'),
              (?, 'Seminar Room 2', 'Meeting Room', 20, 2,
               'Tables, chairs, flip charts', 'TV screen, HDMI connection', 'active'),
              (?, 'Admin Office', 'Office', 15, 3,
               'Desks, computers, printers', 'Networked PCs, printer, scanner', 'active'),
              (?, 'Principal''s Office', 'Office', 4, 4,
               'Executive desk, meeting table', 'PC, phone, conferencing facility', 'active')
        `, [mainId, mainId, mainId, mainId, mainId, mainId]);

        await conn.query(`
            INSERT IGNORE INTO building_rooms
              (building_id, room_name, room_type, capacity, floor_number,
               equipment, it_av_setup, status)
            VALUES
              (?, 'IT Lab 1', 'IT Lab', 30, 1,
               '30 workstations, printers', 'Windows PCs with Microsoft Office, Visual Studio, AutoCAD', 'active'),
              (?, 'IT Lab 2', 'IT Lab', 30, 1,
               '30 workstations, scanners', 'Windows PCs with Adobe Creative Suite, Python, coding tools', 'active'),
              (?, 'Library', 'Library', 50, 2,
               'Book stacks, study carrels, group tables', 'Online catalogue terminals, Wi-Fi throughout', 'active'),
              (?, 'Study Zone', 'Library', 40, 3,
               'Open-plan study tables, charging points', 'Wi-Fi, printing kiosks', 'active')
        `, [annexId, annexId, annexId, annexId]);

        await conn.query(`
            INSERT IGNORE INTO building_rooms
              (building_id, room_name, room_type, capacity, floor_number,
               equipment, it_av_setup, status)
            VALUES
              (?, 'Counselling Room', 'Meeting Room', 3, 1,
               'Comfortable seating, private space', 'None (privacy maintained)', 'active'),
              (?, 'Careers Hub', 'Office', 8, 1,
               'Desks, brochure racks, interview prep area', 'PCs, job portal access', 'active'),
              (?, 'Disability & Wellbeing Office', 'Office', 6, 2,
               'Specialist equipment, quiet space', 'Assistive technology software', 'active')
        `, [supportId, supportId, supportId]);

        // Compliance records
        await conn.query(`
            INSERT IGNORE INTO facility_compliance
              (building_id, compliance_type, status, last_inspection_date,
               next_inspection_date, inspector_name, certificate_file, notes)
            VALUES
              (?, 'Fire Safety', 'compliant', '2026-01-15', '2027-01-15',
               'John Briggs, Fire Safety Officer', NULL,
               'Annual fire safety certificate renewed. All extinguishers checked and tagged.'),
              (?, 'Health & Safety at Work', 'compliant', '2026-02-10', '2027-02-10',
               'HSE Approved Inspector', NULL,
               'Full H&S audit completed. Minor recommendation on stairwell lighting actioned.'),
              (?, 'Disability Access', 'compliant', '2025-11-20', '2026-11-20',
               'Access Consultant — Inclusive Design Ltd', NULL,
               'Lift operational. All accessible routes clearly signed. DDA compliant.'),
              (?, 'Emergency Evacuation', 'review_required', '2025-08-01', '2026-08-01',
               'Internal H&S Team', NULL,
               'Evacuation drill completed but new annex requires updated assembly point signage.'),
              (?, 'First Aid Equipment', 'compliant', '2026-03-01', '2027-03-01',
               'St John Ambulance', NULL,
               'All first aid kits restocked. 4 trained first aiders on site.')
        `, [mainId, mainId, mainId, mainId, mainId]);

        console.log('✅ Buildings, rooms and compliance seeded');
        console.log('');
        console.log('🎉 All production demo data seeded successfully!');
    } finally {
        conn.release();
        process.exit(0);
    }
}

seed().catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); });
