-- ================================================
-- Course Accreditation / Partnership Management
-- ================================================

-- Main accreditation table with Document Control fields
CREATE TABLE IF NOT EXISTS course_accreditations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_title VARCHAR(255),
    awarding_body VARCHAR(255),
    application_type VARCHAR(100),
    date_started DATE,
    expected_submission_date DATE,
    lead_coordinator VARCHAR(255),
    version VARCHAR(20) DEFAULT '1.0',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    overall_status VARCHAR(50) DEFAULT 'Draft',
    completion_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Accreditation tasks/requirements table
CREATE TABLE IF NOT EXISTS accreditation_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accreditation_id INT NOT NULL,
    section_number INT,
    section_title VARCHAR(255),
    task_name VARCHAR(255),
    description TEXT,
    evidence_required VARCHAR(255),
    source_reference VARCHAR(255),
    responsible_person VARCHAR(255),
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Not Started',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (accreditation_id) REFERENCES course_accreditations(id) ON DELETE CASCADE,
    KEY idx_accreditation_id (accreditation_id),
    KEY idx_section_number (section_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Risk and issue log table
CREATE TABLE IF NOT EXISTS accreditation_risks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accreditation_id INT NOT NULL,
    risk_issue VARCHAR(255),
    impact VARCHAR(255),
    mitigation VARCHAR(255),
    owner VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Open',
    review_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (accreditation_id) REFERENCES course_accreditations(id) ON DELETE CASCADE,
    KEY idx_accreditation_id (accreditation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sign-off table
CREATE TABLE IF NOT EXISTS accreditation_signoffs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accreditation_id INT NOT NULL,
    role VARCHAR(255),
    name VARCHAR(255),
    sign_date DATE,
    signature VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (accreditation_id) REFERENCES course_accreditations(id) ON DELETE CASCADE,
    KEY idx_accreditation_id (accreditation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for performance
CREATE INDEX idx_status ON course_accreditations(overall_status);
CREATE INDEX idx_created_at ON course_accreditations(created_at DESC);
CREATE INDEX idx_awarding_body ON course_accreditations(awarding_body);
