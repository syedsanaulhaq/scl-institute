-- ===============================================
-- SCL Institute - Student Management Database Tables
-- Module 1: Student Registration & Admission System
-- Based on Admission.csv requirements
-- ===============================================

-- Main student applications table (matches admission form exactly)
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

-- Student onboarding checklist (for accepted students)
CREATE TABLE student_onboarding (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    student_id VARCHAR(20) UNIQUE, -- Generated student ID
    
    -- Onboarding Checklist Items
    student_handbook_provided BOOLEAN DEFAULT FALSE,
    course_handbook_provided BOOLEAN DEFAULT FALSE,
    policies_explained BOOLEAN DEFAULT FALSE,
    it_setup_completed BOOLEAN DEFAULT FALSE,
    email_account_created BOOLEAN DEFAULT FALSE,
    library_access_granted BOOLEAN DEFAULT FALSE,
    student_card_issued BOOLEAN DEFAULT FALSE,
    moodle_access_confirmed BOOLEAN DEFAULT FALSE,
    
    -- Support Services
    support_services_explained BOOLEAN DEFAULT FALSE,
    disability_support_arranged BOOLEAN DEFAULT FALSE,
    financial_support_discussed BOOLEAN DEFAULT FALSE,
    
    -- Completion Status
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_date DATE,
    onboarded_by INT,
    
    -- Notes
    onboarding_notes TEXT,
    
    -- Timestamps
    onboarding_started_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_student_id (student_id),
    INDEX idx_onboarding_status (onboarding_completed)
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

-- Course catalog (referenced by applications)
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    course_type ENUM('HND', 'Degree', 'Vocational', 'Short Course', 'CPD') NOT NULL,
    department VARCHAR(100),
    duration_months INT,
    credit_points INT,
    
    -- Course Details
    description TEXT,
    entry_requirements TEXT,
    awarding_body VARCHAR(255),
    
    -- Study Options
    full_time_available BOOLEAN DEFAULT TRUE,
    part_time_available BOOLEAN DEFAULT FALSE,
    online_available BOOLEAN DEFAULT FALSE,
    blended_available BOOLEAN DEFAULT FALSE,
    
    -- Status
    course_status ENUM('active', 'inactive', 'under_review', 'suspended') DEFAULT 'active',
    
    -- Moodle Integration
    moodle_course_id VARCHAR(100),
    auto_enroll_enabled BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_course_code (course_code),
    INDEX idx_course_type (course_type),
    INDEX idx_course_status (course_status)
);

-- Application statistics and reporting
CREATE TABLE application_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date_recorded DATE NOT NULL,
    
    -- Daily Statistics
    total_applications INT DEFAULT 0,
    applications_submitted INT DEFAULT 0,
    applications_under_review INT DEFAULT 0,
    applications_accepted INT DEFAULT 0,
    applications_rejected INT DEFAULT 0,
    applications_deferred INT DEFAULT 0,
    
    -- Course-wise breakdown
    course_code VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_date_recorded (date_recorded),
    INDEX idx_course_stats (course_code)
);

-- Auto-generate application reference numbers
DELIMITER //
CREATE TRIGGER generate_application_reference
BEFORE INSERT ON student_applications
FOR EACH ROW
BEGIN
    IF NEW.application_reference IS NULL THEN
        SET NEW.application_reference = CONCAT('SCL', YEAR(CURDATE()), LPAD(LAST_INSERT_ID() + 1, 6, '0'));
    END IF;
END//
DELIMITER ;

-- Auto-generate student ID for onboarding
DELIMITER //
CREATE TRIGGER generate_student_id
BEFORE INSERT ON student_onboarding
FOR EACH ROW
BEGIN
    IF NEW.student_id IS NULL THEN
        SET NEW.student_id = CONCAT('SCL', YEAR(CURDATE()), LPAD(LAST_INSERT_ID() + 1, 4, '0'));
    END IF;
END//
DELIMITER ;

-- Sample data for courses table
INSERT INTO courses (course_code, course_title, course_type, department, duration_months, description, awarding_body, moodle_course_id) VALUES
('BUS101', 'Business Administration HND', 'HND', 'Business Studies', 24, 'Comprehensive business administration program covering management, finance, marketing and operations.', 'Pearson BTEC', 'bus_admin_hnd_2026'),
('IT201', 'Information Technology Degree', 'Degree', 'Computing', 36, 'Bachelor degree in Information Technology covering programming, networks, databases and systems analysis.', 'University of Greenwich', 'it_degree_2026'),
('ACC301', 'Accounting and Finance HND', 'HND', 'Business Studies', 24, 'Professional accounting qualification covering financial reporting, management accounting and taxation.', 'AAT', 'acc_finance_hnd_2026'),
('ENG401', 'English Language Course', 'Short Course', 'Languages', 6, 'Intensive English language course for international students.', 'Cambridge ESOL', 'english_lang_2026'),
('PROJ501', 'Project Management CPD', 'CPD', 'Professional Development', 3, 'Continuing professional development in project management methodologies.', 'PMI', 'proj_mgmt_cpd_2026');

-- Create indexes for better performance
CREATE INDEX idx_apps_email_status ON student_applications(email, application_status);
CREATE INDEX idx_apps_course_intake ON student_applications(course_code, intake_start_date);
CREATE INDEX idx_reviews_stage_date ON application_reviews(review_stage, reviewed_at);
CREATE INDEX idx_decisions_date_decision ON admissions_decisions(decision_date, decision);