require('dotenv').config();
const pool = require('./db');

// SQL statements for induction requirements tables
const sqlStatements = [
    // Induction requirements table
    `CREATE TABLE IF NOT EXISTS induction_requirements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT NOT NULL,
        section_number INT NOT NULL,
        section_title VARCHAR(255) NOT NULL,
        requirement_area VARCHAR(255) NOT NULL,
        description TEXT,
        source_reference VARCHAR(500),
        evidence_held VARCHAR(500),
        responsible_person VARCHAR(255),
        compliance_status BOOLEAN DEFAULT FALSE,
        review_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        KEY idx_course_id (course_id),
        KEY idx_section (section_number),
        KEY idx_compliance (compliance_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Create indexes
    `CREATE INDEX idx_induction_course ON induction_requirements(course_id)`,
    `CREATE INDEX idx_induction_section ON induction_requirements(section_number)`,
    `CREATE INDEX idx_induction_status ON induction_requirements(compliance_status)`
];

async function runMigration() {
    let connection;
    try {
        console.log('[MIGRATION] Starting induction requirements table migration...');
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
