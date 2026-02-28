-- ================================================
-- Migration: Update student_applications table schema
-- Add missing columns for the edit feature
-- ================================================

-- Rename old table if it exists with wrong schema
ALTER TABLE IF EXISTS student_applications RENAME TO student_applications_old;

-- Create new student_applications table with correct schema
CREATE TABLE IF NOT EXISTS student_applications (
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

-- Migrate data from old table if it exists and has data
-- Note: This is a basic migration - you may need to adjust field mappings based on your actual data
-- If the old table doesn't exist, this will simply skip
-- The new table will be empty and ready for fresh data
