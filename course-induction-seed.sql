-- Seed Course Induction template requirements and apply to all courses
-- Database: scl_institute

CREATE TABLE IF NOT EXISTS course_induction_requirement_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    section_number INT NOT NULL,
    section_title VARCHAR(255) NOT NULL,
    requirement_area VARCHAR(255) NOT NULL,
    evidence_required TEXT,
    responsible_role VARCHAR(100),
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_section (section_number),
    INDEX idx_req_area (requirement_area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ensure course_inductions has compliance tracking columns (safe to re-run)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'course_inductions' AND COLUMN_NAME = 'moodle_course_id');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE course_inductions ADD COLUMN moodle_course_id INT NULL',
    'SELECT "moodle_course_id exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'course_inductions' AND COLUMN_NAME = 'course_code');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE course_inductions ADD COLUMN course_code VARCHAR(50)',
    'SELECT "course_code exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'course_inductions' AND COLUMN_NAME = 'course_title');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE course_inductions ADD COLUMN course_title VARCHAR(255)',
    'SELECT "course_title exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'course_inductions' AND COLUMN_NAME = 'awarding_body');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE course_inductions ADD COLUMN awarding_body VARCHAR(255)',
    'SELECT "awarding_body exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'course_inductions' AND COLUMN_NAME = 'version');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE course_inductions ADD COLUMN version VARCHAR(20)',
    'SELECT "version exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'course_inductions' AND COLUMN_NAME = 'induction_owner');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE course_inductions ADD COLUMN induction_owner VARCHAR(255)',
    'SELECT "induction_owner exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'course_inductions' AND COLUMN_NAME = 'review_date');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE course_inductions ADD COLUMN review_date DATE',
    'SELECT "review_date exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'course_inductions' AND COLUMN_NAME = 'overall_status');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE course_inductions ADD COLUMN overall_status ENUM(''Draft'', ''In Progress'', ''Pending Sign-off'', ''Approved'', ''Rejected'') DEFAULT ''Draft''',
    'SELECT "overall_status exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'course_inductions' AND COLUMN_NAME = 'completion_percentage');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE course_inductions ADD COLUMN completion_percentage DECIMAL(5,2) DEFAULT 0',
    'SELECT "completion_percentage exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'course_inductions' AND COLUMN_NAME = 'created_by');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE course_inductions ADD COLUMN created_by INT NULL',
    'SELECT "created_by exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'course_inductions' AND COLUMN_NAME = 'updated_by');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE course_inductions ADD COLUMN updated_by INT NULL',
    'SELECT "updated_by exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'course_inductions' AND COLUMN_NAME = 'created_at');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE course_inductions ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'SELECT "created_at exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'course_inductions' AND COLUMN_NAME = 'updated_at');
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE course_inductions ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'SELECT "updated_at exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Clear and reseed templates (safe to re-run)
DELETE FROM course_induction_requirement_templates;

-- Section 1 – Course Approval Details
INSERT INTO course_induction_requirement_templates
(section_number, section_title, requirement_area, evidence_required, responsible_role, notes, sort_order)
VALUES
(1, 'Course Approval Details', 'Programme Specification', 'Stored in QA folder', 'Programme Leader', 'Description: Approved and finalised version. Source/Reference: Awarding Body docs', 1),
(1, 'Course Approval Details', 'Learning Outcomes', NULL, 'Academic Lead', 'Description: As approved, mapped to framework. Source/Reference: Programme spec', 2),
(1, 'Course Approval Details', 'Curriculum Structure', NULL, 'Academic Lead', 'Description: Module titles, codes, credit values. Source/Reference: Programme spec', 3),
(1, 'Course Approval Details', 'Assessment Strategy', NULL, 'Assessment Officer', 'Description: Weighting, method, moderation. Source/Reference: Assessment handbook', 4);

-- Section 2 – Staffing Requirements
INSERT INTO course_induction_requirement_templates
(section_number, section_title, requirement_area, evidence_required, responsible_role, notes, sort_order)
VALUES
(2, 'Staffing Requirements', 'Minimum Qualifications', 'CVs on file', 'HR Manager', 'Description: E.g., teaching qualification + subject expertise. Source/Reference: Partner’s staff criteria', 1),
(2, 'Staffing Requirements', 'External Examiner', 'Contract, training cert', 'Academic Registrar', 'Description: Appointed, trained, approved. Source/Reference: Partner guidelines', 2),
(2, 'Staffing Requirements', 'CPD Requirements', 'CPD logs', 'HR Manager', 'Description: Annual hours or activities. Source/Reference: College CPD policy', 3);

-- Section 3 – Facilities & Resources
INSERT INTO course_induction_requirement_templates
(section_number, section_title, requirement_area, evidence_required, responsible_role, notes, sort_order)
VALUES
(3, 'Facilities & Resources', 'Classroom / Lab Standards', 'Room audit reports', 'Estates Manager', 'Description: Min size, equipment, accessibility. Source/Reference: Partner facility guidelines', 1),
(3, 'Facilities & Resources', 'Library & Learning Resources', 'Subscription invoices', 'Librarian', 'Description: Physical and digital access. Source/Reference: Library policy', 2),
(3, 'Facilities & Resources', 'Specialist Equipment', 'Asset register', 'Programme Leader', 'Description: Software, instruments, safety equipment. Source/Reference: Programme spec', 3);

-- Section 4 – Admission & Enrolment
INSERT INTO course_induction_requirement_templates
(section_number, section_title, requirement_area, evidence_required, responsible_role, notes, sort_order)
VALUES
(4, 'Admission & Enrolment', 'Entry Requirements', 'Admissions policy', 'Admissions Officer', 'Description: Academic and/or work experience criteria. Source/Reference: Programme spec / Partner regs', 1),
(4, 'Admission & Enrolment', 'English Language Requirements', 'Test score copies', 'Admissions Officer', 'Description: Minimum IELTS/TOEFL or equivalent. Source/Reference: Partner admissions guidelines', 2),
(4, 'Admission & Enrolment', 'Recognition of Prior Learning (RPL)', 'RPL assessment forms', 'QA Officer', 'Description: Process for credit transfer or exemption. Source/Reference: RPL policy', 3),
(4, 'Admission & Enrolment', 'Application Process', 'Application form', 'Admissions Officer', 'Description: Forms, deadlines, documents required. Source/Reference: College prospectus / website', 4),
(4, 'Admission & Enrolment', 'Offer Letter Format', 'Sample offer letters', 'Admissions Officer', 'Description: Partner-approved wording & conditions. Source/Reference: Partner template', 5),
(4, 'Admission & Enrolment', 'Enrolment Documentation', 'Student files', 'Registry Manager', 'Description: Proof of ID, qualifications, visas. Source/Reference: Partner regs', 6),
(4, 'Admission & Enrolment', 'Data Entry & Reporting', 'System screenshots', 'Registry Manager', 'Description: Entry into MIS/partner portal. Source/Reference: Partner data requirements', 7),
(4, 'Admission & Enrolment', 'Induction Registration', 'Attendance register', 'Student Services', 'Description: Attendance & completion tracking. Source/Reference: Induction schedule', 8);

-- Section 5 – Fees & Payment Frequencies
INSERT INTO course_induction_requirement_templates
(section_number, section_title, requirement_area, evidence_required, responsible_role, notes, sort_order)
VALUES
(5, 'Fees & Payment Frequencies', 'Partner Accreditation Fees', 'Invoice & payment record', 'Finance Manager', 'Description: Annual/periodic validation or licence fees. Source/Reference: Partner agreement', 1),
(5, 'Fees & Payment Frequencies', 'Per-Student Registration Fees', 'Student fee report', 'Finance Manager', 'Description: Fee per student to awarding body. Source/Reference: Partner agreement', 2),
(5, 'Fees & Payment Frequencies', 'Exam / Assessment Fees', 'Payment records', 'Exams Officer', 'Description: Fees for exam entries or moderation. Source/Reference: Partner guidelines', 3),
(5, 'Fees & Payment Frequencies', 'Payment Schedule', 'Payment calendar', 'Finance Manager', 'Description: Agreed payment dates & frequency. Source/Reference: Partner agreement', 4),
(5, 'Fees & Payment Frequencies', 'Late Payment Penalties', 'Payment policy', 'Finance Manager', 'Description: Rules and consequences. Source/Reference: Partner T&Cs', 5),
(5, 'Fees & Payment Frequencies', 'Student Tuition Fee Structure', 'Prospectus', 'Finance Manager', 'Description: Approved rates & instalment plan. Source/Reference: College fee policy', 6);

-- Section 6 – Student Support & Administration
INSERT INTO course_induction_requirement_templates
(section_number, section_title, requirement_area, evidence_required, responsible_role, notes, sort_order)
VALUES
(6, 'Student Support & Administration', 'Induction Programme', 'Induction plan', 'Student Services', 'Description: Schedule, content, materials. Source/Reference: Induction policy', 1),
(6, 'Student Support & Administration', 'Academic Guidance', 'Timetable', 'Programme Leader', 'Description: Tutor allocation, office hours. Source/Reference: QA handbook', 2),
(6, 'Student Support & Administration', 'Accessibility & Inclusivity', 'Student support records', 'Disability Officer', 'Description: Reasonable adjustments, resources. Source/Reference: Equality Act compliance', 3);

-- Section 7 – Returns & Reports to Awarding Body
INSERT INTO course_induction_requirement_templates
(section_number, section_title, requirement_area, evidence_required, responsible_role, notes, sort_order)
VALUES
(7, 'Returns & Reports to Awarding Body', 'Student Registration Data', 'Submission confirmation', 'Registry Manager', 'Description: Enrolment list sent to awarding body. Frequency/Deadline: Within 30 days of start. Source/Reference: Partner data submission guide', 1),
(7, 'Returns & Reports to Awarding Body', 'Assessment Results', 'Grade file', 'Exams Officer', 'Description: Marks and grades reporting. Frequency/Deadline: As per assessment board dates. Source/Reference: Partner regulations', 2),
(7, 'Returns & Reports to Awarding Body', 'Annual Monitoring Report', 'Report copy', 'QA Manager', 'Description: Quality review & performance data. Frequency/Deadline: Annually. Source/Reference: Partner QA handbook', 3),
(7, 'Returns & Reports to Awarding Body', 'External Examiner Reports', 'Report archive', 'Academic Registrar', 'Description: Submission to partner. Frequency/Deadline: Annually or per exam cycle. Source/Reference: Partner policy', 4),
(7, 'Returns & Reports to Awarding Body', 'Financial Returns', 'Payment record', 'Finance Manager', 'Description: Student registration fee reconciliation. Frequency/Deadline: As per agreement. Source/Reference: Finance terms', 5),
(7, 'Returns & Reports to Awarding Body', 'Policy Updates', 'Notification email', 'QA Manager', 'Description: Notify partner of changes to key policies. Frequency/Deadline: As changes occur. Source/Reference: Partner agreement', 6);

-- Section 8 – Quality Assurance & Compliance
INSERT INTO course_induction_requirement_templates
(section_number, section_title, requirement_area, evidence_required, responsible_role, notes, sort_order)
VALUES
(8, 'Quality Assurance & Compliance', 'Annual Monitoring', 'Monitoring reports', 'QA Officer', 'Description: Data submission deadlines. Source/Reference: Partner QA schedule', 1),
(8, 'Quality Assurance & Compliance', 'Assessment Board Attendance', 'Attendance logs', 'Academic Registrar', 'Description: Required staff presence. Source/Reference: Partner regs', 2),
(8, 'Quality Assurance & Compliance', 'Policy Alignment', 'Policy matrix', 'QA Manager', 'Description: College policies mapped to partner. Source/Reference: Cross-reference checklist', 3),
(8, 'Quality Assurance & Compliance', 'Revalidation Cycle', 'Calendar', 'Programme Leader', 'Description: Timeline & requirements. Source/Reference: Partner agreement', 4);

-- Create an induction for every course if missing
INSERT INTO course_inductions (
    course_id, course_code, course_title, awarding_body, version, induction_owner,
    start_date, review_date, overall_status
)
SELECT 
    c.id, c.course_code, c.course_title, c.awarding_body, 'v1.0', 'QA Department',
    CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'Draft'
FROM courses c
LEFT JOIN course_inductions ci ON ci.course_id = c.id
WHERE ci.id IS NULL;

-- Apply all template requirements to each induction (idempotent)
INSERT INTO course_induction_requirements (
    induction_id, section_number, section_title, requirement_area,
    evidence_required, responsible_role, notes, sort_order
)
SELECT 
    ci.id,
    t.section_number,
    t.section_title,
    t.requirement_area,
    t.evidence_required,
    t.responsible_role,
    t.notes,
    t.sort_order
FROM course_inductions ci
CROSS JOIN course_induction_requirement_templates t
LEFT JOIN course_induction_requirements r
    ON r.induction_id = ci.id
    AND r.section_number = t.section_number
    AND r.requirement_area = t.requirement_area
WHERE r.id IS NULL;

-- Seed sign-offs for each induction (idempotent)
INSERT INTO course_induction_signoffs (induction_id, role, decision)
SELECT ci.id, roles.role, 'Pending'
FROM course_inductions ci
CROSS JOIN (
    SELECT 'Programme Leader' AS role
    UNION ALL SELECT 'QA Manager'
    UNION ALL SELECT 'Senior Management'
) roles
LEFT JOIN course_induction_signoffs s
    ON s.induction_id = ci.id AND s.role = roles.role
WHERE s.id IS NULL;

SELECT 'Course induction templates seeded and applied' AS status;
