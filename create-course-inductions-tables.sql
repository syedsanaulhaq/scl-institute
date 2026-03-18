-- ================================================
-- Course Inductions Management
-- ================================================

-- Main course inductions table with Document Control fields
CREATE TABLE IF NOT EXISTS course_inductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_title VARCHAR(255),
    course_code VARCHAR(50),
    awarding_body VARCHAR(255),
    qualification_level VARCHAR(100),
    approval_date DATE,
    review_date DATE,
    version VARCHAR(20) DEFAULT '1.0',
    document_owner VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    overall_status VARCHAR(50) DEFAULT 'Draft',
    completion_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    KEY idx_status (overall_status),
    KEY idx_created_at (created_at DESC),
    KEY idx_course (course_title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Induction requirements table
CREATE TABLE IF NOT EXISTS induction_requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    induction_id INT NOT NULL,
    section_number INT,
    section_title VARCHAR(255),
    requirement_area VARCHAR(255),
    description TEXT,
    source_reference VARCHAR(255),
    evidence_held VARCHAR(255),
    responsible_person VARCHAR(255),
    compliance_status VARCHAR(50) DEFAULT 'Not Verified',
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (induction_id) REFERENCES course_inductions(id) ON DELETE CASCADE,
    KEY idx_induction_id (induction_id),
    KEY idx_section_number (section_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Induction risk and issue log table
CREATE TABLE IF NOT EXISTS induction_risks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    induction_id INT NOT NULL,
    risk_issue VARCHAR(255),
    impact VARCHAR(255),
    mitigation VARCHAR(255),
    owner VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Open',
    review_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (induction_id) REFERENCES course_inductions(id) ON DELETE CASCADE,
    KEY idx_induction_id (induction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Induction sign-off table
CREATE TABLE IF NOT EXISTS induction_signoffs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    induction_id INT NOT NULL,
    role VARCHAR(255),
    name VARCHAR(255),
    sign_date DATE,
    signature VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (induction_id) REFERENCES course_inductions(id) ON DELETE CASCADE,
    KEY idx_induction_id (induction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conditions & Recommendations table
CREATE TABLE IF NOT EXISTS induction_conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    induction_id INT NOT NULL,
    condition_recommendation TEXT,
    action_required TEXT,
    deadline DATE,
    responsible_person VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Open',
    evidence VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (induction_id) REFERENCES course_inductions(id) ON DELETE CASCADE,
    KEY idx_induction_id (induction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
