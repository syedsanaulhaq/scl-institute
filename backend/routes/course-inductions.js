const express = require('express');
const pool = require('../db');

const router = express.Router();

// ===============================================
// Initialize Course Inductions Tables
// ===============================================
async function ensureCourseInductionTables() {
    try {
        const createTablesSQL = `
-- Main course inductions table
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

-- Induction risk table
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

-- Conditions table
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
        `;

        // Split and execute each statement
        const statements = createTablesSQL.split(';').filter(s => s.trim());
        for (const statement of statements) {
            if (statement.trim()) {
                await pool.query(statement);
            }
        }
        console.log('✓ Course Induction tables initialized');
    } catch (error) {
        console.error('Error initializing course induction tables:', error.message);
    }
}

// Call on startup
ensureCourseInductionTables();

// ===============================================
// ROUTE 1: GET /api/course-inductions
// Get all course inductions
// ===============================================
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM course_inductions ORDER BY created_at DESC'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching course inductions:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch course inductions', error: error.message });
    }
});

// ===============================================
// ROUTE 2: POST /api/course-inductions
// Create new course induction
// ===============================================
router.post('/', async (req, res) => {
    try {
        const { documentControl } = req.body;

        // Create main induction record
        const [result] = await pool.query(
            'INSERT INTO course_inductions (course_title, course_code, awarding_body, qualification_level, approval_date, review_date, version, document_owner, overall_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                documentControl.course_title || 'Untitled',
                documentControl.course_code || '',
                documentControl.awarding_body || '',
                documentControl.qualification_level || '',
                documentControl.approval_date || null,
                documentControl.review_date || null,
                documentControl.version || '1.0',
                documentControl.document_owner || '',
                'Draft'
            ]
        );

        const inductionId = result.insertId;
        const [rows] = await pool.query('SELECT * FROM course_inductions WHERE id = ?', [inductionId]);
        res.status(201).json({ success: true, data: rows[0], message: 'Course induction created successfully' });
    } catch (error) {
        console.error('Error creating course induction:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create course induction', error: error.message });
    }
});

// ===============================================
// ROUTE 3: GET /api/course-inductions/:id
// Get single course induction with all details
// ===============================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get main induction
        const [inductions] = await pool.query(
            'SELECT * FROM course_inductions WHERE id = ?',
            [id]
        );

        if (inductions.length === 0) {
            return res.status(404).json({ success: false, message: 'Course induction not found' });
        }

        // Get all requirements grouped by section
        const [requirements] = await pool.query(
            'SELECT * FROM induction_requirements WHERE induction_id = ? ORDER BY section_number, id',
            [id]
        );

        // Get risks
        const [risks] = await pool.query(
            'SELECT * FROM induction_risks WHERE induction_id = ? ORDER BY created_at DESC',
            [id]
        );

        // Get sign-offs
        const [signoffs] = await pool.query(
            'SELECT * FROM induction_signoffs WHERE induction_id = ? ORDER BY role',
            [id]
        );

        // Get conditions
        const [conditions] = await pool.query(
            'SELECT * FROM induction_conditions WHERE induction_id = ? ORDER BY created_at DESC',
            [id]
        );

        res.json({
            success: true,
            data: {
                induction: inductions[0],
                requirements,
                risks,
                signoffs,
                conditions
            }
        });
    } catch (error) {
        console.error('Error fetching course induction details:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch course induction details', error: error.message });
    }
});

// ===============================================
// ROUTE 4: PUT /api/course-inductions/:id
// Update course induction document control
// ===============================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { documentControl } = req.body;

        if (documentControl) {
            const updates = [];
            const params = [];
            const allowedFields = ['course_title', 'course_code', 'awarding_body', 'qualification_level', 'approval_date', 'review_date', 'version', 'document_owner', 'overall_status', 'completion_percentage'];

            allowedFields.forEach(field => {
                if (documentControl[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    params.push(documentControl[field]);
                }
            });

            if (updates.length > 0) {
                params.push(id);
                await pool.query(
                    `UPDATE course_inductions SET ${updates.join(', ')} WHERE id = ?`,
                    params
                );
            }
        }

        const [rows] = await pool.query('SELECT * FROM course_inductions WHERE id = ?', [id]);
        res.json({ success: true, data: rows[0], message: 'Course induction updated successfully' });
    } catch (error) {
        console.error('Error updating course induction:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update course induction', error: error.message });
    }
});

// ===============================================
// ROUTE 5: DELETE /api/course-inductions/:id
// Delete course induction
// ===============================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete all related data (cascading)
        await pool.query('DELETE FROM induction_requirements WHERE induction_id = ?', [id]);
        await pool.query('DELETE FROM induction_risks WHERE induction_id = ?', [id]);
        await pool.query('DELETE FROM induction_signoffs WHERE induction_id = ?', [id]);
        await pool.query('DELETE FROM induction_conditions WHERE induction_id = ?', [id]);
        await pool.query('DELETE FROM course_inductions WHERE id = ?', [id]);

        res.json({ success: true, message: 'Course induction deleted successfully' });
    } catch (error) {
        console.error('Error deleting course induction:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete course induction', error: error.message });
    }
});

// ===============================================
// ROUTE 6: POST /api/course-inductions/:id/requirements
// Add requirement
// ===============================================
router.post('/:id/requirements', async (req, res) => {
    try {
        const { id } = req.params;
        const { section_number, requirement_area, description, source_reference, evidence_held, responsible_person, compliance_status, review_notes } = req.body;

        const sectionTitles = {
            1: 'Course Approval Details',
            2: 'Staffing Requirements',
            3: 'Facilities & Resources',
            4: 'Admission & Enrolment',
            5: 'Fees & Payment Frequencies',
            6: 'Student Support & Administration',
            7: 'Returns & Reports to Awarding Body',
            8: 'Quality Assurance & Compliance',
            9: 'Conditions & Recommendations',
            10: 'Risk & Issue Log',
            11: 'Sign-off'
        };

        const [result] = await pool.query(
            'INSERT INTO induction_requirements (induction_id, section_number, section_title, requirement_area, description, source_reference, evidence_held, responsible_person, compliance_status, review_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, section_number, sectionTitles[section_number] || '', requirement_area || '', description || '', source_reference || '', evidence_held || '', responsible_person || '', compliance_status || 'Not Verified', review_notes || null]
        );

        const [rows] = await pool.query('SELECT * FROM induction_requirements WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error adding requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add requirement', error: error.message });
    }
});

// ===============================================
// ROUTE 7: PUT /api/course-inductions/:id/requirements/:reqId
// Update requirement
// ===============================================
router.put('/:id/requirements/:reqId', async (req, res) => {
    try {
        const { id, reqId } = req.params;
        const { section_number, requirement_area, description, source_reference, evidence_held, responsible_person, compliance_status, review_notes } = req.body;

        const sectionTitles = {
            1: 'Course Approval Details',
            2: 'Staffing Requirements',
            3: 'Facilities & Resources',
            4: 'Admission & Enrolment',
            5: 'Fees & Payment Frequencies',
            6: 'Student Support & Administration',
            7: 'Returns & Reports to Awarding Body',
            8: 'Quality Assurance & Compliance',
            9: 'Conditions & Recommendations',
            10: 'Risk & Issue Log',
            11: 'Sign-off'
        };

        const fieldMap = {
            section_number: section_number,
            section_title: section_number ? sectionTitles[section_number] : undefined,
            requirement_area: requirement_area,
            description: description,
            source_reference: source_reference,
            evidence_held: evidence_held,
            responsible_person: responsible_person,
            compliance_status: compliance_status,
            review_notes: review_notes
        };

        const updates = [];
        const params = [];

        Object.entries(fieldMap).forEach(([dbField, value]) => {
            if (value !== undefined) {
                updates.push(`${dbField} = ?`);
                params.push(value);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        params.push(reqId, id);

        await pool.query(
            `UPDATE induction_requirements SET ${updates.join(', ')} WHERE id = ? AND induction_id = ?`,
            params
        );

        const [rows] = await pool.query('SELECT * FROM induction_requirements WHERE id = ?', [reqId]);
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error updating requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update requirement', error: error.message });
    }
});

// ===============================================
// ROUTE 8: DELETE /api/course-inductions/:id/requirements/:reqId
// Delete requirement
// ===============================================
router.delete('/:id/requirements/:reqId', async (req, res) => {
    try {
        const { id, reqId } = req.params;

        await pool.query(
            'DELETE FROM induction_requirements WHERE id = ? AND induction_id = ?',
            [reqId, id]
        );

        res.json({ success: true, message: 'Requirement deleted' });
    } catch (error) {
        console.error('Error deleting requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete requirement', error: error.message });
    }
});

// ===============================================
// ROUTE 9: POST /api/course-inductions/:id/risks
// Add risk/issue
// ===============================================
router.post('/:id/risks', async (req, res) => {
    try {
        const { id } = req.params;
        const { risk_issue, impact, mitigation, owner, review_date } = req.body;

        await pool.query(
            'INSERT INTO induction_risks (induction_id, risk_issue, impact, mitigation, owner, review_date) VALUES (?, ?, ?, ?, ?, ?)',
            [id, risk_issue, impact, mitigation, owner, review_date]
        );

        res.json({ success: true, message: 'Risk added successfully' });
    } catch (error) {
        console.error('Error adding risk:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add risk', error: error.message });
    }
});

// ===============================================
// ROUTE 10: PUT /api/course-inductions/:id/risks/:riskId
// Update risk/issue
// ===============================================
router.put('/:id/risks/:riskId', async (req, res) => {
    try {
        const { id, riskId } = req.params;
        const { status, impact, mitigation, owner, review_date } = req.body;

        const updates = [];
        const params = [];

        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }
        if (impact !== undefined) {
            updates.push('impact = ?');
            params.push(impact);
        }
        if (mitigation !== undefined) {
            updates.push('mitigation = ?');
            params.push(mitigation);
        }
        if (owner !== undefined) {
            updates.push('owner = ?');
            params.push(owner);
        }
        if (review_date !== undefined) {
            updates.push('review_date = ?');
            params.push(review_date);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        params.push(id, riskId);

        await pool.query(
            `UPDATE induction_risks SET ${updates.join(', ')} WHERE induction_id = ? AND id = ?`,
            params
        );

        res.json({ success: true, message: 'Risk updated successfully' });
    } catch (error) {
        console.error('Error updating risk:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update risk', error: error.message });
    }
});

// ===============================================
// ROUTE 11: POST /api/course-inductions/:id/signoffs
// Add sign-off
// ===============================================
router.post('/:id/signoffs', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, name, sign_date, signature } = req.body;

        const [result] = await pool.query(
            'INSERT INTO induction_signoffs (induction_id, role, name, sign_date, signature) VALUES (?, ?, ?, ?, ?)',
            [id, role, name, sign_date, signature]
        );

        const [rows] = await pool.query('SELECT * FROM induction_signoffs WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0], message: 'Sign-off added successfully' });
    } catch (error) {
        console.error('Error adding sign-off:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add sign-off', error: error.message });
    }
});

// ===============================================
// ROUTE 12: DELETE /api/course-inductions/:id/signoffs/all
// Delete all signoffs for a course induction
// ===============================================
router.delete('/:id/signoffs/all', async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            'DELETE FROM induction_signoffs WHERE induction_id = ?',
            [id]
        );

        res.json({ success: true, message: 'All sign-offs deleted' });
    } catch (error) {
        console.error('Error deleting signoffs:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete signoffs', error: error.message });
    }
});

// ===============================================
// ROUTE 13: POST /api/course-inductions/:id/conditions
// Add condition/recommendation
// ===============================================
router.post('/:id/conditions', async (req, res) => {
    try {
        const { id } = req.params;
        const { condition_recommendation, action_required, deadline, responsible_person, status, evidence } = req.body;

        const [result] = await pool.query(
            'INSERT INTO induction_conditions (induction_id, condition_recommendation, action_required, deadline, responsible_person, status, evidence) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, condition_recommendation, action_required, deadline, responsible_person, status || 'Open', evidence]
        );

        const [rows] = await pool.query('SELECT * FROM induction_conditions WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error adding condition:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add condition', error: error.message });
    }
});

module.exports = router;
