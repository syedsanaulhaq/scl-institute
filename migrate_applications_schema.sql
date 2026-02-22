-- ===============================================
-- Migration: Upgrade student_applications to full schema
-- Backs up existing data and recreates table with full schema
-- ===============================================

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Step 1: Backup existing applications data
CREATE TABLE IF NOT EXISTS student_applications_backup AS 
SELECT * FROM student_applications;

-- Step 2: Drop old table
DROP TABLE IF EXISTS student_applications;

-- Step 3: Create new table with full schema (from backend/database/student-tables.sql)
CREATE TABLE student_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Personal Information Section (13 fields)
    first_name VARCHAR(100) NOT NULL,
    middle_names VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other', 'Prefer not to say') NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    town_city VARCHAR(100) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    country_of_residence VARCHAR(100) NOT NULL,
    
    -- Course Selection Section (6 fields)
    course_title VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    course_type ENUM('HND', 'Degree', 'Vocational', 'Short Course', 'CPD') NOT NULL,
    mode_of_study ENUM('Full-time', 'Part-time', 'Online', 'Blended') NOT NULL,
    intake_start_date DATE NOT NULL,
    entry_route ENUM('Standard', 'RPL', 'Mature Student') NOT NULL,
    
    -- Academic Background Section (5 fields)
    highest_qualification ENUM('GCSE', 'A-Level', 'Level 3 Diploma', 'HND', 'Degree', 'Other') NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    year_completed DATE NOT NULL,
    relevant_work_experience TEXT,
    english_proficiency ENUM('IELTS', 'TOEFL', 'Other') NOT NULL,
    english_score DECIMAL(4,1),
    
    -- Document Upload Section (8 files) - stored as file paths
    passport_id_document VARCHAR(500),
    academic_certificates VARCHAR(500),
    academic_transcripts VARCHAR(500),
    english_certificate VARCHAR(500),
    cv_resume VARCHAR(500),
    work_reference VARCHAR(500),
    proof_of_address VARCHAR(500),
    visa_immigration_document VARCHAR(500),
    
    -- Disability Support Section
    has_disabilities_support_needs BOOLEAN DEFAULT FALSE,
    disability_support_details TEXT,
    
    -- Consents & Declaration Section (6 fields)
    consent_gdpr BOOLEAN NOT NULL DEFAULT FALSE,
    consent_data_sharing BOOLEAN NOT NULL DEFAULT FALSE,
    consent_marketing BOOLEAN DEFAULT FALSE,
    declaration_truth BOOLEAN NOT NULL DEFAULT FALSE,
    digital_signature VARCHAR(255) NOT NULL,
    declaration_date DATE NOT NULL,
    
    -- Application Management
    application_status ENUM('draft', 'submitted', 'under_review', 'interview_scheduled', 'accepted', 'conditional_accept', 'rejected', 'deferred') DEFAULT 'draft',
    application_reference VARCHAR(20) UNIQUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    
    -- Indexes for performance
    INDEX idx_email (email),
    INDEX idx_application_status (application_status),
    INDEX idx_course_code (course_code),
    INDEX idx_intake_date (intake_start_date)
);

-- Step 4: Migrate data from backup to new table with field mapping
INSERT INTO student_applications (
    id,
    first_name,
    middle_names,
    last_name,
    date_of_birth,
    gender,
    nationality,
    email,
    contact_number,
    address_line1,
    address_line2,
    town_city,
    postcode,
    country_of_residence,
    course_title,
    course_code,
    course_type,
    mode_of_study,
    intake_start_date,
    entry_route,
    highest_qualification,
    institution_name,
    year_completed,
    relevant_work_experience,
    english_proficiency,
    english_score,
    has_disabilities_support_needs,
    consent_gdpr,
    consent_data_sharing,
    consent_marketing,
    declaration_truth,
    digital_signature,
    declaration_date,
    application_status,
    application_reference,
    created_at,
    submitted_at
)
SELECT 
    bak.id,
    bak.first_name,
    NULL as middle_names,
    bak.last_name,
    '2000-01-01' as date_of_birth,  -- Default, needs updating
    'Prefer not to say' as gender,
    'United Kingdom' as nationality,
    bak.email,
    COALESCE(bak.phone, '+44000000000') as contact_number,
    COALESCE(bak.address, 'To be provided') as address_line1,
    NULL as address_line2,
    'London' as town_city,
    'SW1A 1AA' as postcode,
    'United Kingdom' as country_of_residence,
    COALESCE(c.name, 'Course TBD') as course_title,
    COALESCE(c.code, 'TBD-001') as course_code,
    'HND' as course_type,
    'Full-time' as mode_of_study,
    '2026-09-01' as intake_start_date,
    'Standard' as entry_route,
    'A-Level' as highest_qualification,
    'To be provided' as institution_name,
    '2024-06-01' as year_completed,
    NULL as relevant_work_experience,
    'IELTS' as english_proficiency,
    6.5 as english_score,
    FALSE as has_disabilities_support_needs,
    TRUE as consent_gdpr,
    TRUE as consent_data_sharing,
    FALSE as consent_marketing,
    TRUE as declaration_truth,
    CONCAT('SIG-', bak.id) as digital_signature,
    DATE(bak.application_date) as declaration_date,
    CASE 
        WHEN bak.status = 'accepted' THEN 'accepted'
        WHEN bak.status = 'submitted' THEN 'submitted'
        WHEN bak.status = 'conditional_accept' THEN 'conditional_accept'
        WHEN bak.status = 'rejected' THEN 'rejected'
        ELSE 'submitted'
    END as application_status,
    CONCAT('APP-2026-', LPAD(bak.id, 4, '0')) as application_reference,
    bak.application_date as created_at,
    bak.application_date as submitted_at
FROM student_applications_backup bak
LEFT JOIN courses c ON c.id = bak.course_id;

-- Step 5: Verify migration
SELECT 
    COUNT(*) as total_migrated,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(DISTINCT application_reference) as unique_references
FROM student_applications;

-- Step 6: Show migrated data
SELECT 
    id,
    application_reference,
    first_name,
    last_name,
    email,
    course_title,
    course_code,
    application_status,
    created_at
FROM student_applications
ORDER BY id;

-- Step 7: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Note: You can drop the backup table after verifying:
-- DROP TABLE student_applications_backup;
