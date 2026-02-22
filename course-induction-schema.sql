-- Course Induction Compliance Tracking Schema
-- Database: scl_institute

CREATE TABLE IF NOT EXISTS course_inductions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    moodle_course_id INT NULL,
    course_code VARCHAR(50),
    course_title VARCHAR(255),
    awarding_body VARCHAR(255),
    version VARCHAR(20),
    induction_owner VARCHAR(255),
    start_date DATE,
    review_date DATE,
    overall_status ENUM('Draft', 'In Progress', 'Pending Sign-off', 'Approved', 'Rejected') DEFAULT 'Draft',
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    created_by INT NULL,
    updated_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_course_id (course_id),
    INDEX idx_status (overall_status),
    INDEX idx_review_date (review_date),
    CONSTRAINT fk_inductions_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course_induction_requirements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    induction_id INT NOT NULL,
    section_number INT NOT NULL,
    section_title VARCHAR(255),
    requirement_area VARCHAR(255) NOT NULL,
    evidence_required TEXT,
    responsible_role VARCHAR(100),
    status ENUM('Not Started', 'In Progress', 'Completed', 'Not Applicable') DEFAULT 'Not Started',
    due_date DATE,
    completed_date DATE,
    notes TEXT,
    evidence_links TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_induction (induction_id),
    INDEX idx_section (section_number),
    INDEX idx_status (status),
    CONSTRAINT fk_requirements_induction
        FOREIGN KEY (induction_id) REFERENCES course_inductions(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course_induction_conditions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    induction_id INT NOT NULL,
    condition_text TEXT NOT NULL,
    owner VARCHAR(100),
    due_date DATE,
    status ENUM('Open', 'Closed') DEFAULT 'Open',
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_induction (induction_id),
    INDEX idx_status (status),
    CONSTRAINT fk_conditions_induction
        FOREIGN KEY (induction_id) REFERENCES course_inductions(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course_induction_risks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    induction_id INT NOT NULL,
    risk_description TEXT NOT NULL,
    impact VARCHAR(50),
    likelihood VARCHAR(50),
    mitigation TEXT,
    owner VARCHAR(100),
    status ENUM('Open', 'Mitigated', 'Closed') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_induction (induction_id),
    INDEX idx_status (status),
    CONSTRAINT fk_risks_induction
        FOREIGN KEY (induction_id) REFERENCES course_inductions(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course_induction_signoffs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    induction_id INT NOT NULL,
    role VARCHAR(100) NOT NULL,
    approver_name VARCHAR(255),
    approver_email VARCHAR(255),
    decision ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    decision_date DATE,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_induction (induction_id),
    INDEX idx_decision (decision),
    CONSTRAINT fk_signoffs_induction
        FOREIGN KEY (induction_id) REFERENCES course_inductions(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'Course induction schema ready' AS status;