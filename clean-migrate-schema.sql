-- ================================================
-- Clean Migration: Completely recreate schema
-- Drop all dependent tables first
-- ================================================

SET FOREIGN_KEY_CHECKS=0;

-- Drop all existing tables in reverse dependency order
DROP TABLE IF EXISTS application_documents;
DROP TABLE IF EXISTS application_stats;
DROP TABLE IF EXISTS student_onboarding;  
DROP TABLE IF EXISTS admissions_decisions;
DROP TABLE IF EXISTS application_reviews;
DROP TABLE IF EXISTS student_applications;

SET FOREIGN_KEY_CHECKS=1;

-- Now create the correct schema
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

-- Document storage tracking
CREATE TABLE application_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    document_type ENUM('passport_id', 'academic_certificates', 'academic_transcripts', 'english_certificate', 'cv_resume', 'work_reference', 'proof_address', 'visa_immigration') NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by_ip VARCHAR(45),
    
    -- Verification Status
    document_verified BOOLEAN DEFAULT FALSE,
    verified_by INT,
    verified_date TIMESTAMP,
    verification_notes TEXT,
    
    -- Foreign Keys
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_application_docs (application_id),
    INDEX idx_document_type (document_type)
);

-- Application reviews table (for admissions officers)
CREATE TABLE application_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    review_stage ENUM('initial_screening', 'academic_review', 'interview_assessment', 'final_decision') NOT NULL,
    
    -- Review Assessment Fields
    academic_suitability ENUM('suitable', 'needs_assessment', 'unsuitable') NOT NULL,
    english_proficiency_adequate BOOLEAN NOT NULL,
    documentation_complete BOOLEAN NOT NULL,
    work_experience_relevant BOOLEAN,
    
    -- Review Decision
    recommendation ENUM('accept', 'conditional_accept', 'interview_required', 'reject', 'defer') NOT NULL,
    review_notes TEXT,
    conditions_if_conditional TEXT,
    
    -- Interview Details (if required)
    interview_required BOOLEAN DEFAULT FALSE,
    interview_date DATETIME NULL,
    interview_location VARCHAR(255),
    interview_notes TEXT,
    
    -- Timestamps
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    INDEX idx_application_review (application_id),
    INDEX idx_review_stage (review_stage)
);

-- Final admissions decisions table
CREATE TABLE admissions_decisions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    
    -- Decision Details
    decision ENUM('accepted', 'conditional_accept', 'rejected', 'deferred') NOT NULL,
    decision_date DATE NOT NULL,
    decision_made_by INT NOT NULL,
    
    -- Conditional Acceptance Details
    conditions TEXT,
    conditions_deadline DATE,
    
    -- Acceptance/Rejection Details
    offer_letter_sent BOOLEAN DEFAULT FALSE,
    offer_letter_sent_date DATE,
    student_response ENUM('accepted', 'declined', 'pending') DEFAULT 'pending',
    student_response_date DATE,
    
    -- Deferral Details
    deferred_to_intake DATE,
    deferral_reason TEXT,
    
    -- Rejection Details
    rejection_reason TEXT,
    feedback_provided TEXT,
    
    -- Course Allocation (for accepted students)
    allocated_to_course BOOLEAN DEFAULT FALSE,
    moodle_enrollment_id VARCHAR(100),
    enrollment_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_decision (decision),
    INDEX idx_decision_date (decision_date),
    INDEX idx_student_response (student_response)
);

-- Create indexes for better performance
CREATE INDEX idx_apps_email_status ON student_applications(email, application_status);
CREATE INDEX idx_apps_course_intake ON student_applications(course_code, intake_start_date);
CREATE INDEX idx_reviews_stage_date ON application_reviews(review_stage, reviewed_at);
CREATE INDEX idx_decisions_date_decision ON admissions_decisions(decision_date, decision);

-- Triggers removed due to binary logging permissions in Docker environment
-- Application references will be generated by the backend application
