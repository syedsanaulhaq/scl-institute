/**
 * Seed script: Partners & Associates demo data
 * Run from backend/ with env vars set.
 */
const pool = require('./db');

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
              -- Awarding Bodies
              ('Pearson Education Ltd', 'awarding_body',
               'David Wright', 'Partnership Manager',
               'david.wright@pearson.com', '+44 20 7010 2000',
               'https://www.pearson.com', '80 Strand, London, WC2R 0RL', 'United Kingdom',
               '2020-09-01',
               NULL, NULL,
               'Primary awarding body for HND Business Management and HND Computing programmes.',
               'active',
               'PRS-SCL-2020-001', 'Programme-specific', '2027-08-31', 'Dr. Sarah Ali',
               'HND Business Management, HND Computing, HND Engineering',
               'HND-BM-01, BSC-CS-02, HND-ENG-02',
               '2026-03-15', 'Dr. Sarah Ali', '2026-09-01',
               '2026-06-01', 'in_progress',
               'Submit updated programme specifications by 01 Jun 2026.'),

              ('City & Guilds', 'awarding_body',
               'Yvonne Clarke', 'Account Director',
               'y.clarke@cityandguilds.com', '+44 20 7294 2468',
               'https://www.cityandguilds.com', '1 Giltspur Street, London, EC1A 9DD', 'United Kingdom',
               '2019-01-15',
               NULL, NULL,
               'Awarding body for vocational Health & Social Care and Engineering qualifications.',
               'active',
               'CG-SCL-2019-007', 'Programme-specific', '2026-12-31', 'Ms. Linda Osei',
               'HND Health & Social Care, Diploma in Engineering',
               'HND-HSC-01, DIP-ENG-01',
               '2026-02-20', 'Ms. Linda Osei', '2026-08-20',
               '2026-05-30', 'submitted',
               'Awaiting outcome of renewal submission. Follow up if no response by 15 Jun.'),

              ('British Computer Society (BCS)', 'awarding_body',
               'Marcus Bell', 'Partnerships Lead',
               'm.bell@bcs.uk', '+44 1793 417 417',
               'https://www.bcs.org', 'First Floor, The Davidson Building, 5 Southampton Street, London, WC2E 7HA', 'United Kingdom',
               '2022-04-01',
               NULL, NULL,
               'Professional membership and accreditation for IT and Computing programmes.',
               'pending_renewal',
               'BCS-SCL-2022-003', 'Professional Body', '2026-03-31', 'Dr. Sarah Ali',
               'BSc Computing, MSc Data Science',
               'BSC-CS-02, MSC-DS-01',
               '2026-01-10', 'Dr. Sarah Ali', '2026-09-10',
               NULL, 'not_started',
               'Accreditation expired. Renewal application must be submitted by end of Q2.'),

              -- Associates
              ('Dr. Yemi Adeyinka', 'associate',
               'Dr. Yemi Adeyinka', 'External Examiner',
               'y.adeyinka@londonmet.ac.uk', '+44 7712 345 678',
               NULL, 'London Metropolitan University, 166-220 Holloway Rd, London N7 8DB', 'United Kingdom',
               '2023-09-01',
               'External Examiner', 'Business Management, Strategy, Organisational Behaviour',
               'External examiner for HND Business Management. Annual review visit scheduled for June.',
               'active',
               NULL, NULL, NULL, 'Ms. Linda Osei',
               'HND Business Management', 'HND-BM-01',
               '2026-05-01', 'Ms. Linda Osei', '2027-08-31',
               NULL, 'not_started', NULL),

              ('Prof. Karen Hughes', 'associate',
               'Prof. Karen Hughes', 'External Examiner',
               'k.hughes@ucl.ac.uk', '+44 7834 567 890',
               NULL, 'University College London, Gower Street, London, WC1E 6BT', 'United Kingdom',
               '2022-01-10',
               'External Examiner', 'Health Sciences, Nursing, Social Care',
               'External examiner for BSc Nursing and HND Health & Social Care. Completed two full annual cycles.',
               'active',
               NULL, NULL, NULL, 'Ms. Linda Osei',
               'BSc Nursing, HND Health & Social Care', 'BSC-NUR-01, HND-HSC-01',
               '2026-04-15', 'Ms. Linda Osei', '2026-10-15',
               NULL, 'not_started', NULL),

              ('TechCorp UK Ltd', 'associate',
               'James Hargreaves', 'Head of Talent & Partnerships',
               'j.hargreaves@techcorp.co.uk', '+44 20 3456 7890',
               'https://www.techcorp.co.uk', '22 Silicon Way, Reading, RG1 1HT', 'United Kingdom',
               '2024-02-01',
               'Placement Provider', 'Software Development, Cloud Computing, Cybersecurity',
               'Provides industry placements for BSc Computing and MSc Data Science students. Hosts up to 6 students per year.',
               'active',
               NULL, NULL, NULL, 'Dr. Sarah Ali',
               'BSc Computing, MSc Data Science', 'BSC-CS-02, MSC-DS-01',
               '2026-03-01', 'Dr. Sarah Ali', '2027-02-01',
               NULL, 'not_started', NULL),

              ('Mr. Tariq Hussain', 'associate',
               'Mr. Tariq Hussain', 'Industry Mentor',
               't.hussain@hsconsulting.co.uk', '+44 7923 111 222',
               NULL, '45 Canary Wharf, London, E14 5AB', 'United Kingdom',
               '2025-01-15',
               'Industry Mentor', 'Finance, Accounting, Business Strategy',
               'Mentors final-year HND Business Management students. Runs termly group sessions and 1:1 coaching.',
               'active',
               NULL, NULL, NULL, 'Ms. Linda Osei',
               'HND Business Management', 'HND-BM-01',
               '2026-01-15', 'Ms. Linda Osei', '2027-01-15',
               NULL, 'not_started', NULL),

              ('Dr. Amina Osei', 'associate',
               'Dr. Amina Osei', 'Guest Lecturer',
               'a.osei@nhs.net', '+44 7601 234 567',
               NULL, 'Royal Free Hospital, Pond Street, London, NW3 2QG', 'United Kingdom',
               '2024-09-01',
               'Guest Lecturer', 'Mental Health, Wellbeing, Community Nursing',
               'Delivers 4 guest lectures per academic year for BSc Nursing and HND Health & Social Care cohorts.',
               'active',
               NULL, NULL, NULL, 'Ms. Linda Osei',
               'BSc Nursing, HND Health & Social Care', 'BSC-NUR-01, HND-HSC-01',
               '2026-04-01', 'Ms. Linda Osei', '2027-08-31',
               NULL, 'not_started', NULL),

              -- Affiliates
              ('British Chamber of Commerce', 'affiliate',
               'Rebecca Thornton', 'Membership Relations',
               'r.thornton@britishchambers.org.uk', '+44 20 7654 5800',
               'https://www.britishchambers.org.uk', '65 Petty France, London, SW1H 9EU', 'United Kingdom',
               '2021-06-01',
               NULL, NULL,
               'Corporate affiliate. Provides networking opportunities and guest speaker referrals for Business programmes.',
               'active',
               NULL, NULL, NULL, 'Dr. Sarah Ali',
               NULL, NULL,
               '2026-02-01', 'Dr. Sarah Ali', '2026-12-01',
               NULL, 'not_started', NULL),

              ('UK Tech Alliance', 'affiliate',
               'Sophie Grant', 'Partnerships Manager',
               's.grant@uktechalliance.org', '+44 20 7123 4567',
               'https://www.uktechalliance.org', '10 Downing Street Innovation Hub, London, SW1A 2AA', 'United Kingdom',
               '2023-03-01',
               NULL, NULL,
               'Industry alliance affiliate supporting digital skills agenda. Co-runs annual Graduate Tech Fair.',
               'inactive',
               NULL, NULL, NULL, 'Dr. Sarah Ali',
               NULL, NULL,
               '2025-11-01', 'Dr. Sarah Ali', '2026-11-01',
               NULL, 'not_started', 'Reactivation under discussion. Follow up in Q3 2026.')
        `);

        // Retrieve inserted partner IDs by name for visits/subscriptions
        const [partners] = await conn.query(`SELECT id, partner_name, partner_type FROM partners ORDER BY id`);
        const byName = {};
        for (const p of partners) byName[p.partner_name] = p.id;

        // ── Partner Visits ─────────────────────────────────────────────────────
        console.log('Seeding partner_visits...');
        const pearsonId   = byName['Pearson Education Ltd'];
        const cityId      = byName['City & Guilds'];
        const bcsId       = byName['British Computer Society (BCS)'];
        const techCorpId  = byName['TechCorp UK Ltd'];

        if (pearsonId) {
            await conn.query(`
                INSERT IGNORE INTO partner_visits
                  (partner_id, visit_type, visit_date, lead_contact, coordinator,
                   purpose, scope, key_standards, visit_agenda, required_attendees, outcomes, status)
                VALUES
                  (?, 'Annual Monitoring',  '2025-10-14', 'Dr. Sarah Ali', 'Ms. Linda Osei',
                   'Annual monitoring review of HND Business Management programme delivery.',
                   'Assessment practices, internal verification, student progression data.',
                   'BTEC Standards Chapter 5 – Assessment & Internal Verification',
                   'Welcome and introductions; Programme review; IV sampling; Student feedback; Recommendations.',
                   'Programme Leader, IV coordinator, 2 student representatives',
                   'All assessment practices compliant. Minor recommendation to improve feedback turnaround time.',
                   'completed'),
                  (?, 'Progress Review',   '2026-03-05', 'Dr. Sarah Ali', 'Ms. Linda Osei',
                   'Mid-year progress review for HND Computing cohort.',
                   'Student achievement data, at-risk learners, grade distribution.',
                   'BTEC Standards Chapter 3 – Learner Achievement',
                   'Data review; At-risk learner action plans; Staff CPD update.',
                   'Programme Leader, Personal Tutors, Student Welfare Officer',
                   NULL,
                   'planned')
            `, [pearsonId, pearsonId]);
        }

        if (cityId) {
            await conn.query(`
                INSERT IGNORE INTO partner_visits
                  (partner_id, visit_type, visit_date, lead_contact, coordinator,
                   purpose, scope, key_standards, visit_agenda, required_attendees, outcomes, status)
                VALUES
                  (?, 'Audit', '2025-06-18', 'Ms. Linda Osei', 'Admin Team',
                   'Full qualification audit for HND Health & Social Care.',
                   'Learner files, assessment records, centre approval conditions.',
                   'City & Guilds Centre Operations Handbook',
                   'Centre tour; Document review; Learner interview; Standardisation check.',
                   'Centre Manager, Programme Leader, 3 learner sample',
                   'Centre approval maintained. One corrective action issued regarding portfolio storage.',
                   'completed')
            `, [cityId]);
        }

        if (bcsId) {
            await conn.query(`
                INSERT IGNORE INTO partner_visits
                  (partner_id, visit_type, visit_date, lead_contact, coordinator,
                   purpose, scope, key_standards, visit_agenda, required_attendees, outcomes, status)
                VALUES
                  (?, 'Initial Approval', '2026-07-10', 'Dr. Sarah Ali', 'IT Department',
                   'BCS accreditation re-approval visit for BSc Computing and MSc Data Science.',
                   'Curriculum alignment, staff qualifications, learning resources.',
                   'BCS Accreditation Criteria v2.3',
                   'Document submission review; Staff interview; Curriculum mapping session.',
                   'HoD Computing, Programme Leaders, 2 academic staff',
                   NULL,
                   'planned')
            `, [bcsId]);
        }

        if (techCorpId) {
            await conn.query(`
                INSERT IGNORE INTO partner_visits
                  (partner_id, visit_type, visit_date, lead_contact, coordinator,
                   purpose, scope, key_standards, visit_agenda, required_attendees, outcomes, status)
                VALUES
                  (?, 'Thematic Review', '2026-04-22', 'Dr. Sarah Ali', 'Placements Coordinator',
                   'Placement quality review and student welfare check.',
                   'Student supervision, workplace assessment, mentor engagement.',
                   'Placement Quality Framework v1.2',
                   'Site visit; Student interviews (3); Mentor debrief; Action planning.',
                   'Placements Coordinator, 3 placement students, TechCorp HR',
                   'Students reported positive experiences. Supervision consistency to be improved.',
                   'completed')
            `, [techCorpId]);
        }

        // ── Partner Subscriptions ──────────────────────────────────────────────
        console.log('Seeding partner_subscriptions...');
        if (pearsonId) {
            await conn.query(`
                INSERT IGNORE INTO partner_subscriptions
                  (partner_id, subscription_type, start_date, end_date, renewal_date, cost, currency, status, notes)
                VALUES
                  (?, 'Annual Membership Fee', '2025-09-01', '2026-08-31', '2026-07-01', 4800.00, 'GBP', 'active',
                   'Annual centre registration fee for BTEC suite of qualifications.'),
                  (?, 'Awarding Fee', '2025-09-01', '2026-08-31', '2026-06-01', 12600.00, 'GBP', 'active',
                   'Per-learner awarding fees for 2025-26 cohort. Estimate based on 84 registered learners.')
            `, [pearsonId, pearsonId]);
        }

        if (cityId) {
            await conn.query(`
                INSERT IGNORE INTO partner_subscriptions
                  (partner_id, subscription_type, start_date, end_date, renewal_date, cost, currency, status, notes)
                VALUES
                  (?, 'Registration Fee', '2025-01-15', '2026-01-14', '2025-11-15', 2500.00, 'GBP', 'active',
                   'Annual centre approval and registration fee.'),
                  (?, 'Quality Assurance Fee', '2025-01-15', '2026-01-14', '2025-11-15', 1800.00, 'GBP', 'expired',
                   'External quality assurance annual fee. Renewal in progress.')
            `, [cityId, cityId]);
        }

        if (bcsId) {
            await conn.query(`
                INSERT IGNORE INTO partner_subscriptions
                  (partner_id, subscription_type, start_date, end_date, renewal_date, cost, currency, status, notes)
                VALUES
                  (?, 'Annual Membership Fee', '2022-04-01', '2026-03-31', '2026-02-01', 3200.00, 'GBP', 'expired',
                   'BCS institutional membership. Lapsed during accreditation renewal process.')
            `, [bcsId]);
        }

        console.log('\n✅ Partners & Associates seed data inserted successfully!');
        console.log('   - 9 partners (3 awarding bodies, 5 associates, 2 affiliates)');
        console.log('   - 6 partner visits');
        console.log('   - 7 partner subscriptions');
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        throw err;
    } finally {
        conn.release();
        process.exit(0);
    }
}

seed();
