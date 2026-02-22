-- Create missing tables that the backend expects

-- Application reviews table (for admissions officers)
CREATE TABLE IF NOT EXISTS application_reviews (
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
CREATE TABLE IF NOT EXISTS admissions_decisions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    
    -- Decision Details
    decision ENUM('accepted', 'conditional_accept', 'rejected', 'deferred') NOT NULL,
    decision_date DATE NOT NULL,
    decision_made_by INT NOT NULL,
    
    -- Offer Details
    offer_letter_path VARCHAR(500),
    conditions TEXT,
    valid_until_date DATE,
    
    -- Student Response
    student_response ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    response_date DATE NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    INDEX idx_application_decision (application_id),
    INDEX idx_decision (decision)
);

-- Student profiles table (if not exists)
CREATE TABLE IF NOT EXISTS student_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    application_id INT,
    
    -- Personal Information
    student_reference VARCHAR(20) UNIQUE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    
    -- Medical Information
    medical_conditions TEXT,
    allergies TEXT,
    
    -- Financial Information
    fee_status ENUM('home', 'international') DEFAULT 'home',
    sponsorship_details TEXT,
    
    -- Status
    profile_status ENUM('incomplete', 'pending_verification', 'verified', 'suspended') DEFAULT 'incomplete',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_application_id (application_id)
);

-- Show created tables
SELECT 'Tables created successfully' as status;
