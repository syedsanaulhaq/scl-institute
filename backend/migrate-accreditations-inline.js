require('dotenv').config();
const pool = require('./db');

// All SQL statements for accreditation tables
const sqlStatements = [
    // Main accreditation table
    `CREATE TABLE IF NOT EXISTS course_accreditations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_title VARCHAR(255) NOT NULL,
        awarding_body VARCHAR(255),
        application_type VARCHAR(255),
        date_started DATE,
        expected_submission_date DATE,
        lead_coordinator VARCHAR(255),
        version VARCHAR(50) DEFAULT '1.0',
        overall_status VARCHAR(100) DEFAULT 'Draft',
        completion_percentage INT DEFAULT 0,
        updated_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_course_body (course_title, awarding_body)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Accreditation tasks/requirements table
    `CREATE TABLE IF NOT EXISTS accreditation_tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        accreditation_id INT NOT NULL,
        section_number INT NOT NULL,
        section_title VARCHAR(255) NOT NULL,
        task_name VARCHAR(255) NOT NULL,
        description TEXT,
        evidence_required VARCHAR(500),
        source_reference VARCHAR(255),
        responsible_person VARCHAR(255),
        due_date DATE,
        status VARCHAR(50) DEFAULT 'Not Started',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (accreditation_id) REFERENCES course_accreditations(id) ON DELETE CASCADE,
        KEY idx_accreditation_id (accreditation_id),
        KEY idx_section (section_number),
        KEY idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Risk and issue log table
    `CREATE TABLE IF NOT EXISTS accreditation_risks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        accreditation_id INT NOT NULL,
        risk_issue VARCHAR(500) NOT NULL,
        impact TEXT,
        mitigation TEXT,
        owner VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Active',
        review_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (accreditation_id) REFERENCES course_accreditations(id) ON DELETE CASCADE,
        KEY idx_accreditation_id (accreditation_id),
        KEY idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Sign-off table
    `CREATE TABLE IF NOT EXISTS accreditation_signoffs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        accreditation_id INT NOT NULL,
        role VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        sign_date DATE,
        signature VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (accreditation_id) REFERENCES course_accreditations(id) ON DELETE CASCADE,
        KEY idx_accreditation_id (accreditation_id),
        KEY idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Create indexes for performance
    `CREATE INDEX idx_created_at ON course_accreditations(created_at)`,
    `CREATE INDEX idx_awarding_body ON course_accreditations(awarding_body)`,
    `CREATE INDEX idx_task_accredited ON accreditation_tasks(accreditation_id)`,
    `CREATE INDEX idx_risk_accredited ON accreditation_risks(accreditation_id)`,
    `CREATE INDEX idx_signoff_accredited ON accreditation_signoffs(accreditation_id)`
];

async function runMigration() {
    let connection;
    try {
        console.log('[MIGRATION] Starting accreditation tables migration...');
        connection = await pool.getConnection();
        
        for (const statement of sqlStatements) {
            if (statement.trim()) {
                console.log('[MIGRATION] Executing:', statement.substring(0, 60) + '...');
                try {
                    await connection.query(statement);
                } catch (err) {
                    // Ignore "already exists" and duplicate key errors
                    if (err.code !== 'ER_TABLE_EXISTS_ERROR' && err.code !== 'ER_DUP_KEYNAME') {
                        throw err;
                    }
                }
            }
        }
        
        console.log('[MIGRATION] ✅ Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('[MIGRATION] ❌ Error:', err.message);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

runMigration();
