-- ============================================
-- Moodle Custom Course Fields Setup
-- Creates 23 custom fields in 5 categories
-- Date: 2026-02-17
-- ============================================

USE bitnami_moodle;

-- Set timestamp (current Unix timestamp)
SET @now = UNIX_TIMESTAMP();

-- ============================================
-- STEP 1: Create Custom Field Categories
-- ============================================

-- Category 1: Accreditation & Compliance
INSERT INTO mdl_customfield_category (name, description, descriptionformat, sortorder, timecreated, timemodified, component, area, itemid, contextid)
VALUES ('Accreditation & Compliance', 'Fields related to course accreditation, regulation, and compliance requirements', 1, 1, @now, @now, 'core_course', 'course', 0, NULL);
SET @cat_accreditation = LAST_INSERT_ID();

-- Category 2: Academic Details
INSERT INTO mdl_customfield_category (name, description, descriptionformat, sortorder, timecreated, timemodified, component, area, itemid, contextid)
VALUES ('Academic Details', 'Academic information including learning outcomes, assessment methods, and entry requirements', 1, 2, @now, @now, 'core_course', 'course', 0, NULL);
SET @cat_academic = LAST_INSERT_ID();

-- Category 3: Financial Information
INSERT INTO mdl_customfield_category (name, description, descriptionformat, sortorder, timecreated, timemodified, component, area, itemid, contextid)
VALUES ('Financial Information', 'Course fees, costs, and funding options', 1, 3, @now, @now, 'core_course', 'course', 0, NULL);
SET @cat_financial = LAST_INSERT_ID();

-- Category 4: Delivery Information
INSERT INTO mdl_customfield_category (name, description, descriptionformat, sortorder, timecreated, timemodified, component, area, itemid, contextid)
VALUES ('Delivery Information', 'Course delivery modes, resources, and practical requirements', 1, 4, @now, @now, 'core_course', 'course', 0, NULL);
SET @cat_delivery = LAST_INSERT_ID();

-- Category 5: Administration
INSERT INTO mdl_customfield_category (name, description, descriptionformat, sortorder, timecreated, timemodified, component, area, itemid, contextid)
VALUES ('Administration', 'Administrative information including staff, dates, and partnerships', 1, 5, @now, @now, 'core_course', 'course', 0, NULL);
SET @cat_admin = LAST_INSERT_ID();

-- ============================================
-- STEP 2: Create Custom Fields
-- ============================================

-- ============================================
-- CATEGORY 1: Accreditation & Compliance (6 fields)
-- ============================================

-- 1. Course Type
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'course_type',
    'Course Type',
    'select',
    'Type of course offered',
    1,
    1,
    @cat_accreditation,
    '{"required":"0","uniquevalues":"0","options":"HND\\r\\nDegree\\r\\nVocational\\r\\nShort Course\\r\\nCPD\\r\\nProfessional Qualification","defaultvalue":""}',
    @now,
    @now
);

-- 2. Awarding Body / Accreditation
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'awarding_body',
    'Awarding Body / Accreditation',
    'select',
    'Organization that accredits or awards the qualification',
    1,
    2,
    @cat_accreditation,
    '{"required":"0","uniquevalues":"0","options":"Pearson\\r\\nCity & Guilds\\r\\nIn-house\\r\\nNCFE\\r\\nOther","defaultvalue":""}',
    @now,
    @now
);

-- 3. Regulation Level (RQF)
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'regulation_level',
    'Regulation Level (RQF)',
    'select',
    'Regulated Qualifications Framework level',
    1,
    3,
    @cat_accreditation,
    '{"required":"0","uniquevalues":"0","options":"RQF Level 1\\r\\nRQF Level 2\\r\\nRQF Level 3\\r\\nRQF Level 4\\r\\nRQF Level 5\\r\\nRQF Level 6\\r\\nRQF Level 7\\r\\nRQF Level 8\\r\\nNon-accredited","defaultvalue":""}',
    @now,
    @now
);

-- 4. UKVI Approved Course
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'ukvi_approved',
    'UKVI Approved Course',
    'select',
    'Whether the course is approved by UK Visas and Immigration',
    1,
    4,
    @cat_accreditation,
    '{"required":"0","uniquevalues":"0","options":"Yes\\r\\nNo","defaultvalue":"No"}',
    @now,
    @now
);

-- 5. Approval Date
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'approval_date',
    'Approval Date',
    'date',
    'Date when the course was approved',
    1,
    5,
    @cat_accreditation,
    '{"required":"0","uniquevalues":"0","includetime":"0"}',
    @now,
    @now
);

-- 6. Review Date
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'review_date',
    'Review Date',
    'date',
    'Next scheduled review date for the course',
    1,
    6,
    @cat_accreditation,
    '{"required":"0","uniquevalues":"0","includetime":"0"}',
    @now,
    @now
);

-- ============================================
-- CATEGORY 2: Academic Details (7 fields)
-- ============================================

-- 7. Subject Area / Discipline
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'subject_area',
    'Subject Area / Discipline',
    'select',
    'Primary subject area or discipline',
    1,
    1,
    @cat_academic,
    '{"required":"0","uniquevalues":"0","options":"Business\\r\\nEngineering\\r\\nIT\\r\\nCreative Arts\\r\\nHealth & Social Care\\r\\nHospitality & Tourism\\r\\nOther","defaultvalue":""}',
    @now,
    @now
);

-- 8. Learning Outcomes
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'learning_outcomes',
    'Learning Outcomes',
    'textarea',
    'Expected learning outcomes upon completion',
    1,
    2,
    @cat_academic,
    '{"required":"0","uniquevalues":"0","defaultvalue":"","defaultvalueformat":"0"}',
    @now,
    @now
);

-- 9. Units / Modules Covered
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'units_modules',
    'Units / Modules Covered',
    'textarea',
    'List of units or modules included in the course',
    1,
    3,
    @cat_academic,
    '{"required":"0","uniquevalues":"0","defaultvalue":"","defaultvalueformat":"0"}',
    @now,
    @now
);

-- 10. Assessment Methods
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'assessment_methods',
    'Assessment Methods',
    'select',
    'Primary method of assessment used in the course',
    1,
    4,
    @cat_academic,
    '{"required":"0","uniquevalues":"0","options":"Exam\\r\\nCoursework\\r\\nPortfolio\\r\\nPractical\\r\\nMixed","defaultvalue":""}',
    @now,
    @now
);

-- 11. Entry Requirements
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'entry_requirements',
    'Entry Requirements',
    'textarea',
    'Minimum entry requirements for enrollment',
    1,
    5,
    @cat_academic,
    '{"required":"0","uniquevalues":"0","defaultvalue":"","defaultvalueformat":"0"}',
    @now,
    @now
);

-- 12. Special Admission Considerations
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'special_admissions',
    'Special Admission Considerations',
    'textarea',
    'Any special consideration for admissions (e.g., RPL, mature students)',
    1,
    6,
    @cat_academic,
    '{"required":"0","uniquevalues":"0","defaultvalue":"","defaultvalueformat":"0"}',
    @now,
    @now
);

-- 13. Progression Opportunities
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'progression_opportunities',
    'Progression Opportunities',
    'textarea',
    'Career or educational progression opportunities after completion',
    1,
    7,
    @cat_academic,
    '{"required":"0","uniquevalues":"0","defaultvalue":"","defaultvalueformat":"0"}',
    @now,
    @now
);

-- ============================================
-- CATEGORY 3: Financial Information (3 fields)
-- ============================================

-- 14. Tuition Fee (GBP)
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'tuition_fee',
    'Tuition Fee (GBP)',
    'text',
    'Standard tuition fee in British Pounds',
    1,
    1,
    @cat_financial,
    '{"required":"0","uniquevalues":"0","defaultvalue":"","displaysize":0,"maxlength":0,"ispassword":"0","link":""}',
    @now,
    @now
);

-- 15. Additional Costs
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'additional_costs',
    'Additional Costs',
    'textarea',
    'Any additional costs (materials, exams, certification fees, etc.)',
    1,
    2,
    @cat_financial,
    '{"required":"0","uniquevalues":"0","defaultvalue":"","defaultvalueformat":"0"}',
    @now,
    @now
);

-- 16. Funding Options
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'funding_options',
    'Funding Options',
    'select',
    'Available funding options for students',
    1,
    3,
    @cat_financial,
    '{"required":"0","uniquevalues":"0","options":"Self-funded\\r\\nEmployer-funded\\r\\nStudent Loan\\r\\nScholarship","defaultvalue":""}',
    @now,
    @now
);

-- ============================================
-- CATEGORY 4: Delivery Information (5 fields)
-- ============================================

-- 17. Mode of Delivery
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'mode_of_delivery',
    'Mode of Delivery',
    'select',
    'How the course is delivered to students',
    1,
    1,
    @cat_delivery,
    '{"required":"0","uniquevalues":"0","options":"Full-time\\r\\nPart-time\\r\\nOnline\\r\\nBlended\\r\\nEvening/Weekend","defaultvalue":""}',
    @now,
    @now
);

-- 18. Learning Resources Provided
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'learning_resources',
    'Learning Resources Provided',
    'textarea',
    'Materials and resources provided to students',
    1,
    2,
    @cat_delivery,
    '{"required":"0","uniquevalues":"0","defaultvalue":"","defaultvalueformat":"0"}',
    @now,
    @now
);

-- 19. Special Equipment Needed
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'special_equipment',
    'Special Equipment Needed',
    'textarea',
    'Any special equipment or software required',
    1,
    3,
    @cat_delivery,
    '{"required":"0","uniquevalues":"0","defaultvalue":"","defaultvalueformat":"0"}',
    @now,
    @now
);

-- 20. Work Placement / Internship Included
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'work_placement',
    'Work Placement / Internship Included',
    'select',
    'Whether the course includes work placement or internship',
    1,
    4,
    @cat_delivery,
    '{"required":"0","uniquevalues":"0","options":"Yes\\r\\nNo","defaultvalue":"No"}',
    @now,
    @now
);

-- 21. Duration / End Date
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'duration',
    'Duration',
    'text',
    'Course duration (e.g., 12 months, 2 years)',
    1,
    5,
    @cat_delivery,
    '{"required":"0","uniquevalues":"0","defaultvalue":"","displaysize":0,"maxlength":100,"ispassword":"0","link":""}',
    @now,
    @now
);

-- ============================================
-- CATEGORY 5: Administration (2 fields)
-- ============================================

-- 22. Course Leader / Programme Director
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'course_leader',
    'Course Leader / Programme Director',
    'text',
    'Name of the course leader or programme director',
    1,
    1,
    @cat_admin,
    '{"required":"0","uniquevalues":"0","defaultvalue":"","displaysize":0,"maxlength":255,"ispassword":"0","link":""}',
    @now,
    @now
);

-- 23. Internal Verification Contact
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'internal_verification',
    'Internal Verification Contact',
    'text',
    'Contact person for internal verification',
    1,
    2,
    @cat_admin,
    '{"required":"0","uniquevalues":"0","defaultvalue":"","displaysize":0,"maxlength":255,"ispassword":"0","link":""}',
    @now,
    @now
);

-- 24. Industry Partnerships
INSERT INTO mdl_customfield_field (shortname, name, type, description, descriptionformat, sortorder, categoryid, configdata, timecreated, timemodified)
VALUES (
    'industry_partnerships',
    'Industry Partnerships',
    'textarea',
    'Industry partners or employers associated with the course',
    1,
    3,
    @cat_admin,
    '{"required":"0","uniquevalues":"0","defaultvalue":"","defaultvalueformat":"0"}',
    @now,
    @now
);

-- ============================================
-- Verification Query
-- ============================================

SELECT 
    cc.name AS category,
    COUNT(cf.id) AS field_count
FROM mdl_customfield_category cc
LEFT JOIN mdl_customfield_field cf ON cc.id = cf.categoryid
WHERE cc.component = 'core_course'
GROUP BY cc.id, cc.name
ORDER BY cc.sortorder;

-- Show all fields created
SELECT 
    cc.name AS category,
    cf.name AS field_name,
    cf.shortname,
    cf.type
FROM mdl_customfield_field cf
JOIN mdl_customfield_category cc ON cf.categoryid = cc.id
WHERE cc.component = 'core_course'
ORDER BY cc.sortorder, cf.sortorder;
