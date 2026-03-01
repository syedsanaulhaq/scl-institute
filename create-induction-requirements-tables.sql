-- ===============================================
-- Course Induction Requirements Schema
-- Table-based structure with sections
-- ===============================================

-- Main course inductions table (already exists, no changes needed)
-- This table already has Document Control fields

-- Induction sections table
CREATE TABLE IF NOT EXISTS induction_sections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT,
    section_number INT NOT NULL,
    section_title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_course_id (course_id),
    KEY idx_section_number (section_number),
    UNIQUE KEY unique_course_section (course_id, section_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Induction requirements table - stores individual requirement areas
CREATE TABLE IF NOT EXISTS induction_requirements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    induction_id INT NOT NULL,
    section_number INT NOT NULL,
    section_title VARCHAR(255) NOT NULL,
    requirement_area VARCHAR(255) NOT NULL,
    description TEXT,
    source_reference VARCHAR(500),
    evidence_held TEXT,
    responsible_person VARCHAR(255),
    compliance_status ENUM('compliant', 'non_compliant', 'pending', 'na') DEFAULT 'pending',
    review_notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (induction_id) REFERENCES course_inductions(id) ON DELETE CASCADE,
    KEY idx_induction_id (induction_id),
    KEY idx_section_number (section_number),
    KEY idx_compliance_status (compliance_status),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better query performance
CREATE INDEX idx_requirement_section ON induction_requirements(induction_id, section_number);
CREATE INDEX idx_requirement_status ON induction_requirements(compliance_status);
