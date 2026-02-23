// ===============================================
// Course Induction Compliance API Routes
// Tracks course compliance, risks, conditions, and sign-offs
// ===============================================

const express = require('express');
const router = express.Router();
const pool = require('../db');
const PDFDocument = require('pdfkit');
const mysql = require('mysql2/promise');

// Moodle database connection pool - query Moodle directly like other endpoints
// LAMP Moodle credentials from /var/www/moodle-9090/config.php
const moodleDbPool = mysql.createPool({
    host: process.env.MOODLE_DATABASE_HOST || '127.0.0.1',
    port: process.env.MOODLE_DATABASE_PORT || 3306,
    user: process.env.MOODLE_DATABASE_USER || 'moodleuser',
    password: process.env.MOODLE_DATABASE_PASSWORD || 'moodlepass',
    database: process.env.MOODLE_DATABASE_NAME || 'moodle',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

/**
 * Fetch courses directly from Moodle database
 */
async function getMoodleCourses() {
    try {
        const [courses] = await moodleDbPool.execute(`
            SELECT 
                c.id,
                c.idnumber as course_code,
                c.shortname,
                c.fullname,
                cc.name as categoryname,
                c.summary
            FROM mdl_course c
            LEFT JOIN mdl_course_categories cc ON c.category = cc.id
            WHERE c.id > 1
            ORDER BY c.fullname
        `);

        return courses.map(course => ({
            id: course.id,
            shortname: course.shortname,
            fullname: course.fullname,
            idnumber: course.course_code || '',
            summary: course.summary || '',
            categoryname: course.categoryname || 'General'
        }));
    } catch (error) {
        console.error('Error fetching courses from Moodle database:', error.message);
        console.error('Moodle DB config - Host:', process.env.MOODLE_DATABASE_HOST, 'Port:', process.env.MOODLE_DATABASE_PORT);
        return [];
    }
}

async function recalcInductionProgress(inductionId) {
    const [rows] = await pool.query(
        `SELECT 
            SUM(CASE WHEN status != 'Not Applicable' THEN 1 ELSE 0 END) AS total_applicable,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed
         FROM course_induction_requirements
         WHERE induction_id = ?`,
        [inductionId]
    );

    const total = rows[0]?.total_applicable || 0;
    const completed = rows[0]?.completed || 0;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 10000) / 100;

    await pool.query(
        'UPDATE course_inductions SET completion_percentage = ? WHERE id = ?',
        [percentage, inductionId]
    );

    return percentage;
}

const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

async function getInductionBundle(inductionId) {
    const [inductionRows] = await pool.query(
        'SELECT * FROM course_inductions WHERE id = ?',
        [inductionId]
    );

    if (inductionRows.length === 0) {
        return null;
    }

    const [requirements, conditions, risks, signoffs] = await Promise.all([
        pool.query(
            'SELECT * FROM course_induction_requirements WHERE induction_id = ? ORDER BY section_number, sort_order, id',
            [inductionId]
        ),
        pool.query(
            'SELECT * FROM course_induction_conditions WHERE induction_id = ? ORDER BY id DESC',
            [inductionId]
        ),
        pool.query(
            'SELECT * FROM course_induction_risks WHERE induction_id = ? ORDER BY id DESC',
            [inductionId]
        ),
        pool.query(
            'SELECT * FROM course_induction_signoffs WHERE induction_id = ? ORDER BY id DESC',
            [inductionId]
        )
    ]);

    return {
        induction: inductionRows[0],
        requirements: requirements[0],
        conditions: conditions[0],
        risks: risks[0],
        signoffs: signoffs[0]
    };
}

// ===============================================
// ROUTE 1: GET /api/inductions
// List all inductions - enhanced to fetch latest from Moodle
// ===============================================
router.get('/', async (req, res) => {
    try {
        const { course_id, status, from_moodle } = req.query;
        
        // If explicitly requested to get from Moodle, fetch live courses
        if (from_moodle === 'true' || from_moodle === '1') {
            const moodleCourses = await getMoodleCourses();
            
            // Enrich with induction data
            const enrichedCourses = await Promise.all(moodleCourses.map(async (mCourse) => {
                try {
                    // Try to find matching induction
                    const [inductions] = await pool.query(
                        `SELECT ci.* FROM course_inductions ci 
                         WHERE ci.moodle_course_id = ? 
                         ORDER BY ci.created_at DESC LIMIT 1`,
                        [mCourse.id]
                    );
                    
                    return {
                        ...mCourse,
                        source: 'moodle',
                        induction: inductions[0] || null,
                        has_induction: inductions.length > 0
                    };
                } catch (err) {
                    console.error(`Error enriching course ${mCourse.id}:`, err.message);
                    return {
                        ...mCourse,
                        source: 'moodle',
                        induction: null,
                        has_induction: false,
                        error: err.message
                    };
                }
            }));
            
            return res.json({ 
                success: true, 
                source: 'moodle',
                total: enrichedCourses.length,
                data: enrichedCourses 
            });
        }

        // Default: Get from inductions table (SCL database)
        const conditions = [];
        const params = [];

        if (course_id) {
            conditions.push('ci.course_id = ?');
            params.push(course_id);
        }

        if (status) {
            conditions.push('ci.overall_status = ?');
            params.push(status);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const [rows] = await pool.query(
            `SELECT 
                ci.*, 
                c.course_title AS scl_course_title, 
                c.course_code AS scl_course_code
             FROM course_inductions ci
             LEFT JOIN courses c ON c.id = ci.course_id
             ${whereClause}
             ORDER BY ci.updated_at DESC`,
            params
        );

        res.json({ 
            success: true, 
            source: 'scl_database',
            total: rows.length,
            data: rows 
        });
    } catch (error) {
        console.error('Error listing inductions:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch inductions', error: error.message });
    }
});

// ===============================================
// ROUTE 2: GET /api/inductions/:id
// Get induction with requirements, conditions, risks, sign-offs
// ===============================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [inductionRows] = await pool.query(
            'SELECT * FROM course_inductions WHERE id = ?',
            [id]
        );

        if (inductionRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Induction not found' });
        }

        const bundle = await getInductionBundle(id);

        res.json({
            success: true,
            data: bundle
        });
    } catch (error) {
        console.error('Error fetching induction:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch induction', error: error.message });
    }
});

// ===============================================
// ROUTE 3: POST /api/inductions
// Create induction
// ===============================================
router.post('/', async (req, res) => {
    try {
        const {
            course_id,
            moodle_course_id,
            course_code,
            course_title,
            awarding_body,
            version,
            induction_owner,
            start_date,
            review_date,
            overall_status,
            created_by
        } = req.body;

        if (!course_id) {
            return res.status(400).json({ success: false, message: 'course_id is required' });
        }

        const [result] = await pool.query(
            `INSERT INTO course_inductions (
                course_id, moodle_course_id, course_code, course_title, awarding_body,
                version, induction_owner, start_date, review_date, overall_status, created_by, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
            [
                course_id,
                moodle_course_id || null,
                course_code || null,
                course_title || null,
                awarding_body || null,
                version || null,
                induction_owner || null,
                start_date || null,
                review_date || null,
                overall_status || 'Draft',
                created_by || null,
                created_by || null
            ]
        );

        const [rows] = await pool.query('SELECT * FROM course_inductions WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error creating induction:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create induction', error: error.message });
    }
});

// ===============================================
// ROUTE 4: PUT /api/inductions/:id
// Update induction
// ===============================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = [
            'course_id',
            'moodle_course_id',
            'course_code',
            'course_title',
            'awarding_body',
            'version',
            'induction_owner',
            'start_date',
            'review_date',
            'overall_status',
            'completion_percentage',
            'updated_by'
        ];

        const updates = [];
        const params = [];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                params.push(req.body[field]);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        params.push(id);

        await pool.query(
            `UPDATE course_inductions SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        const [rows] = await pool.query('SELECT * FROM course_inductions WHERE id = ?', [id]);
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error updating induction:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update induction', error: error.message });
    }
});

// ===============================================
// ROUTE 5: POST /api/inductions/:id/requirements
// Add requirement item
// ===============================================
router.post('/:id/requirements', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            section_number,
            section_title,
            requirement_area,
            evidence_required,
            responsible_role,
            status,
            due_date,
            completed_date,
            notes,
            evidence_links,
            sort_order
        } = req.body;

        if (!section_number || !requirement_area) {
            return res.status(400).json({ success: false, message: 'section_number and requirement_area are required' });
        }

        const [result] = await pool.query(
            `INSERT INTO course_induction_requirements (
                induction_id, section_number, section_title, requirement_area, evidence_required,
                responsible_role, status, due_date, completed_date, notes, evidence_links, sort_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                section_number,
                section_title || null,
                requirement_area,
                evidence_required || null,
                responsible_role || null,
                status || 'Not Started',
                due_date || null,
                completed_date || null,
                notes || null,
                evidence_links || null,
                sort_order || 0
            ]
        );

        await recalcInductionProgress(id);

        const [rows] = await pool.query('SELECT * FROM course_induction_requirements WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error adding requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add requirement', error: error.message });
    }
});

// ===============================================
// ROUTE 6: PUT /api/inductions/:id/requirements/:reqId
// Update requirement item
// ===============================================
router.put('/:id/requirements/:reqId', async (req, res) => {
    try {
        const { id, reqId } = req.params;
        const allowedFields = [
            'section_number',
            'section_title',
            'requirement_area',
            'evidence_required',
            'responsible_role',
            'status',
            'due_date',
            'completed_date',
            'notes',
            'evidence_links',
            'sort_order'
        ];

        const updates = [];
        const params = [];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                params.push(req.body[field]);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        params.push(reqId, id);

        await pool.query(
            `UPDATE course_induction_requirements SET ${updates.join(', ')} WHERE id = ? AND induction_id = ?`,
            params
        );

        await recalcInductionProgress(id);

        const [rows] = await pool.query('SELECT * FROM course_induction_requirements WHERE id = ?', [reqId]);
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error updating requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update requirement', error: error.message });
    }
});

// ===============================================
// ROUTE 7: DELETE /api/inductions/:id/requirements/:reqId
// Delete requirement item
// ===============================================
router.delete('/:id/requirements/:reqId', async (req, res) => {
    try {
        const { id, reqId } = req.params;

        await pool.query(
            'DELETE FROM course_induction_requirements WHERE id = ? AND induction_id = ?',
            [reqId, id]
        );

        await recalcInductionProgress(id);

        res.json({ success: true, message: 'Requirement deleted' });
    } catch (error) {
        console.error('Error deleting requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete requirement', error: error.message });
    }
});

// ===============================================
// ROUTE 8: POST /api/inductions/:id/conditions
// Add condition
// ===============================================
router.post('/:id/conditions', async (req, res) => {
    try {
        const { id } = req.params;
        const { condition_text, owner, due_date, status, resolution_notes } = req.body;

        if (!condition_text) {
            return res.status(400).json({ success: false, message: 'condition_text is required' });
        }

        const [result] = await pool.query(
            `INSERT INTO course_induction_conditions (
                induction_id, condition_text, owner, due_date, status, resolution_notes
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, condition_text, owner || null, due_date || null, status || 'Open', resolution_notes || null]
        );

        const [rows] = await pool.query('SELECT * FROM course_induction_conditions WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error adding condition:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add condition', error: error.message });
    }
});

// ===============================================
// ROUTE 9: PUT /api/inductions/:id/conditions/:condId
// Update condition
// ===============================================
router.put('/:id/conditions/:condId', async (req, res) => {
    try {
        const { id, condId } = req.params;
        const allowedFields = ['condition_text', 'owner', 'due_date', 'status', 'resolution_notes'];
        const updates = [];
        const params = [];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                params.push(req.body[field]);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        params.push(condId, id);

        await pool.query(
            `UPDATE course_induction_conditions SET ${updates.join(', ')} WHERE id = ? AND induction_id = ?`,
            params
        );

        const [rows] = await pool.query('SELECT * FROM course_induction_conditions WHERE id = ?', [condId]);
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error updating condition:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update condition', error: error.message });
    }
});

// ===============================================
// ROUTE 10: DELETE /api/inductions/:id/conditions/:condId
// Delete condition
// ===============================================
router.delete('/:id/conditions/:condId', async (req, res) => {
    try {
        const { id, condId } = req.params;
        await pool.query(
            'DELETE FROM course_induction_conditions WHERE id = ? AND induction_id = ?',
            [condId, id]
        );

        res.json({ success: true, message: 'Condition deleted' });
    } catch (error) {
        console.error('Error deleting condition:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete condition', error: error.message });
    }
});

// ===============================================
// ROUTE 11: POST /api/inductions/:id/risks
// Add risk
// ===============================================
router.post('/:id/risks', async (req, res) => {
    try {
        const { id } = req.params;
        const { risk_description, impact, likelihood, mitigation, owner, status } = req.body;

        if (!risk_description) {
            return res.status(400).json({ success: false, message: 'risk_description is required' });
        }

        const [result] = await pool.query(
            `INSERT INTO course_induction_risks (
                induction_id, risk_description, impact, likelihood, mitigation, owner, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, risk_description, impact || null, likelihood || null, mitigation || null, owner || null, status || 'Open']
        );

        const [rows] = await pool.query('SELECT * FROM course_induction_risks WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error adding risk:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add risk', error: error.message });
    }
});

// ===============================================
// ROUTE 12: PUT /api/inductions/:id/risks/:riskId
// Update risk
// ===============================================
router.put('/:id/risks/:riskId', async (req, res) => {
    try {
        const { id, riskId } = req.params;
        const allowedFields = ['risk_description', 'impact', 'likelihood', 'mitigation', 'owner', 'status'];
        const updates = [];
        const params = [];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                params.push(req.body[field]);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        params.push(riskId, id);

        await pool.query(
            `UPDATE course_induction_risks SET ${updates.join(', ')} WHERE id = ? AND induction_id = ?`,
            params
        );

        const [rows] = await pool.query('SELECT * FROM course_induction_risks WHERE id = ?', [riskId]);
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error updating risk:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update risk', error: error.message });
    }
});

// ===============================================
// ROUTE 13: DELETE /api/inductions/:id/risks/:riskId
// Delete risk
// ===============================================
router.delete('/:id/risks/:riskId', async (req, res) => {
    try {
        const { id, riskId } = req.params;
        await pool.query(
            'DELETE FROM course_induction_risks WHERE id = ? AND induction_id = ?',
            [riskId, id]
        );

        res.json({ success: true, message: 'Risk deleted' });
    } catch (error) {
        console.error('Error deleting risk:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete risk', error: error.message });
    }
});

// ===============================================
// ROUTE 14: POST /api/inductions/:id/signoffs
// Add sign-off
// ===============================================
router.post('/:id/signoffs', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, approver_name, approver_email, decision, decision_date, comments } = req.body;

        if (!role) {
            return res.status(400).json({ success: false, message: 'role is required' });
        }

        const [result] = await pool.query(
            `INSERT INTO course_induction_signoffs (
                induction_id, role, approver_name, approver_email, decision, decision_date, comments
            ) VALUES (?, ?, ?, ?, ?, ?, ?)` ,
            [id, role, approver_name || null, approver_email || null, decision || 'Pending', decision_date || null, comments || null]
        );

        const [rows] = await pool.query('SELECT * FROM course_induction_signoffs WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error adding signoff:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add signoff', error: error.message });
    }
});

// ===============================================
// ROUTE 15: PUT /api/inductions/:id/signoffs/:signId
// Update sign-off
// ===============================================
router.put('/:id/signoffs/:signId', async (req, res) => {
    try {
        const { id, signId } = req.params;
        const allowedFields = ['role', 'approver_name', 'approver_email', 'decision', 'decision_date', 'comments'];
        const updates = [];
        const params = [];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                params.push(req.body[field]);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        params.push(signId, id);

        await pool.query(
            `UPDATE course_induction_signoffs SET ${updates.join(', ')} WHERE id = ? AND induction_id = ?`,
            params
        );

        const [rows] = await pool.query('SELECT * FROM course_induction_signoffs WHERE id = ?', [signId]);
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error updating signoff:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update signoff', error: error.message });
    }
});

// ===============================================
// ROUTE 16: DELETE /api/inductions/:id/signoffs/:signId
// Delete sign-off
// ===============================================
router.delete('/:id/signoffs/:signId', async (req, res) => {
    try {
        const { id, signId } = req.params;
        await pool.query(
            'DELETE FROM course_induction_signoffs WHERE id = ? AND induction_id = ?',
            [signId, id]
        );

        res.json({ success: true, message: 'Sign-off deleted' });
    } catch (error) {
        console.error('Error deleting signoff:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete signoff', error: error.message });
    }
});

// ===============================================
// ROUTE 17: GET /api/inductions/:id/export/csv
// Export induction details to CSV
// ===============================================
router.get('/:id/export/csv', async (req, res) => {
    try {
        const { id } = req.params;
        const bundle = await getInductionBundle(id);

        if (!bundle) {
            return res.status(404).json({ success: false, message: 'Induction not found' });
        }

        const { induction, requirements, conditions, risks, signoffs } = bundle;

        const lines = [];
        lines.push('Course Induction Compliance Report');
        lines.push(`Course Title,${escapeCsvValue(induction.course_title || '')}`);
        lines.push(`Course Code,${escapeCsvValue(induction.course_code || '')}`);
        lines.push(`Awarding Body,${escapeCsvValue(induction.awarding_body || '')}`);
        lines.push(`Version,${escapeCsvValue(induction.version || '')}`);
        lines.push(`Induction Owner,${escapeCsvValue(induction.induction_owner || '')}`);
        lines.push(`Start Date,${escapeCsvValue(induction.start_date || '')}`);
        lines.push(`Review Date,${escapeCsvValue(induction.review_date || '')}`);
        lines.push(`Overall Status,${escapeCsvValue(induction.overall_status || '')}`);
        lines.push(`Completion %,${escapeCsvValue(induction.completion_percentage || 0)}`);
        lines.push('');

        lines.push('Requirements');
        lines.push('Section Number,Section Title,Requirement Area,Evidence Required,Responsible Role,Status,Due Date,Completed Date,Notes');
        requirements.forEach((req) => {
            lines.push([
                req.section_number,
                req.section_title,
                req.requirement_area,
                req.evidence_required,
                req.responsible_role,
                req.status,
                req.due_date,
                req.completed_date,
                req.notes
            ].map(escapeCsvValue).join(','));
        });
        lines.push('');

        lines.push('Conditions');
        lines.push('Condition,Owner,Due Date,Status,Resolution Notes');
        conditions.forEach((cond) => {
            lines.push([
                cond.condition_text,
                cond.owner,
                cond.due_date,
                cond.status,
                cond.resolution_notes
            ].map(escapeCsvValue).join(','));
        });
        lines.push('');

        lines.push('Risks');
        lines.push('Risk,Impact,Likelihood,Mitigation,Owner,Status');
        risks.forEach((risk) => {
            lines.push([
                risk.risk_description,
                risk.impact,
                risk.likelihood,
                risk.mitigation,
                risk.owner,
                risk.status
            ].map(escapeCsvValue).join(','));
        });
        lines.push('');

        lines.push('Sign-offs');
        lines.push('Role,Approver Name,Approver Email,Decision,Decision Date,Comments');
        signoffs.forEach((sign) => {
            lines.push([
                sign.role,
                sign.approver_name,
                sign.approver_email,
                sign.decision,
                sign.decision_date,
                sign.comments
            ].map(escapeCsvValue).join(','));
        });

        const csv = lines.join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="course-induction-${id}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting induction CSV:', error.message);
        res.status(500).json({ success: false, message: 'Failed to export CSV', error: error.message });
    }
});

// ===============================================
// ROUTE 18: GET /api/inductions/:id/export/pdf
// Export induction details to PDF
// ===============================================
router.get('/:id/export/pdf', async (req, res) => {
    try {
        const { id } = req.params;
        const bundle = await getInductionBundle(id);

        if (!bundle) {
            return res.status(404).json({ success: false, message: 'Induction not found' });
        }

        const { induction, requirements, conditions, risks, signoffs } = bundle;

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="course-induction-${id}.pdf"`);
        doc.pipe(res);

        doc.fontSize(18).text('Course Induction Compliance Report', { align: 'center' });
        doc.moveDown();

        doc.fontSize(11);
        doc.text(`Course Title: ${induction.course_title || ''}`);
        doc.text(`Course Code: ${induction.course_code || ''}`);
        doc.text(`Awarding Body: ${induction.awarding_body || ''}`);
        doc.text(`Version: ${induction.version || ''}`);
        doc.text(`Induction Owner: ${induction.induction_owner || ''}`);
        doc.text(`Start Date: ${induction.start_date || ''}`);
        doc.text(`Review Date: ${induction.review_date || ''}`);
        doc.text(`Overall Status: ${induction.overall_status || ''}`);
        doc.text(`Completion: ${induction.completion_percentage || 0}%`);
        doc.moveDown();

        doc.fontSize(13).text('Requirements', { underline: true });
        doc.moveDown(0.5);
        requirements.forEach((req) => {
            doc.fontSize(10).text(
                `Section ${req.section_number} - ${req.section_title} | ${req.requirement_area} | Status: ${req.status}`
            );
            if (req.evidence_required) {
                doc.fontSize(9).text(`Evidence: ${req.evidence_required}`);
            }
            if (req.responsible_role) {
                doc.fontSize(9).text(`Responsible: ${req.responsible_role}`);
            }
            if (req.notes) {
                doc.fontSize(9).text(`Notes: ${req.notes}`);
            }
            doc.moveDown(0.25);
        });

        doc.addPage();
        doc.fontSize(13).text('Conditions', { underline: true });
        doc.moveDown(0.5);
        conditions.forEach((cond) => {
            doc.fontSize(10).text(`${cond.condition_text} | Status: ${cond.status}`);
            if (cond.owner) doc.fontSize(9).text(`Owner: ${cond.owner}`);
            if (cond.due_date) doc.fontSize(9).text(`Due: ${cond.due_date}`);
            if (cond.resolution_notes) doc.fontSize(9).text(`Notes: ${cond.resolution_notes}`);
            doc.moveDown(0.25);
        });

        doc.moveDown();
        doc.fontSize(13).text('Risks', { underline: true });
        doc.moveDown(0.5);
        risks.forEach((risk) => {
            doc.fontSize(10).text(`${risk.risk_description} | Status: ${risk.status}`);
            if (risk.impact) doc.fontSize(9).text(`Impact: ${risk.impact}`);
            if (risk.likelihood) doc.fontSize(9).text(`Likelihood: ${risk.likelihood}`);
            if (risk.mitigation) doc.fontSize(9).text(`Mitigation: ${risk.mitigation}`);
            if (risk.owner) doc.fontSize(9).text(`Owner: ${risk.owner}`);
            doc.moveDown(0.25);
        });

        doc.moveDown();
        doc.fontSize(13).text('Sign-offs', { underline: true });
        doc.moveDown(0.5);
        signoffs.forEach((sign) => {
            doc.fontSize(10).text(`${sign.role} | Decision: ${sign.decision}`);
            if (sign.approver_name) doc.fontSize(9).text(`Name: ${sign.approver_name}`);
            if (sign.approver_email) doc.fontSize(9).text(`Email: ${sign.approver_email}`);
            if (sign.decision_date) doc.fontSize(9).text(`Date: ${sign.decision_date}`);
            if (sign.comments) doc.fontSize(9).text(`Comments: ${sign.comments}`);
            doc.moveDown(0.25);
        });

        doc.end();
    } catch (error) {
        console.error('Error exporting induction PDF:', error.message);
        res.status(500).json({ success: false, message: 'Failed to export PDF', error: error.message });
    }
});

// ===============================================
// ROUTE: POST /api/inductions/sync-moodle
// Sync latest Moodle courses to inductions table
// ===============================================
router.post('/sync-moodle', async (req, res) => {
    try {
        console.log('🔄 Fetching latest courses from Moodle database...');

        // Fetch latest courses from Moodle database
        const moodleCourses = await getMoodleCourses();

        if (moodleCourses.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No courses found in Moodle database. Please create courses in Moodle first.'
            });
        }

        let synced = 0;
        let skipped = 0;
        const results = [];

        // Sync each Moodle course
        for (const mCourse of moodleCourses) {
            try {
                // Check if induction already exists for this Moodle course
                const [existing] = await pool.query(
                    'SELECT id FROM course_inductions WHERE moodle_course_id = ?',
                    [mCourse.id]
                );

                if (existing.length > 0) {
                    // Update existing
                    await pool.query(
                        `UPDATE course_inductions 
                         SET course_code = ?, course_title = ?, updated_at = NOW()
                         WHERE moodle_course_id = ?`,
                        [mCourse.shortname, mCourse.fullname, mCourse.id]
                    );
                    synced++;
                    results.push({
                        course: mCourse.fullname,
                        action: 'updated',
                        id: existing[0].id
                    });
                } else {
                    // Create new
                    const [result] = await pool.query(
                        `INSERT INTO course_inductions 
                         (moodle_course_id, course_code, course_title, overall_status, created_at, updated_at)
                         VALUES (?, ?, ?, ?, NOW(), NOW())`,
                        [mCourse.id, mCourse.shortname, mCourse.fullname, 'Draft']
                    );
                    synced++;
                    results.push({
                        course: mCourse.fullname,
                        action: 'created',
                        id: result.insertId
                    });
                }
            } catch (err) {
                console.error(`Error syncing course ${mCourse.fullname}:`, err.message);
                skipped++;
                results.push({
                    course: mCourse.fullname,
                    action: 'error',
                    error: err.message
                });
            }
        }

        res.json({
            success: true,
            message: `Synced ${synced} courses from Moodle database`,
            summary: {
                total_moodle_courses: moodleCourses.length,
                synced,
                skipped,
                database_source: `${process.env.MOODLE_DATABASE_HOST || 'localhost'}:${process.env.MOODLE_DATABASE_PORT || 3306} (Moodle DB)`
            },
            results: results.slice(0, 20) // Return first 20 for display
        });
    } catch (error) {
        console.error('Error syncing Moodle courses:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to sync Moodle courses',
            error: error.message
        });
    }
});

module.exports = router;
