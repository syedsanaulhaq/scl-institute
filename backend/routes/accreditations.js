const express = require('express');
const pool = require('../db');

const router = express.Router();

// ===============================================
// ROUTE 1: GET /api/accreditations
// Get all accreditations
// ===============================================
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM course_accreditations ORDER BY created_at DESC'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching accreditations:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch accreditations', error: error.message });
    }
});

// ===============================================
// ROUTE 1B: POST /api/accreditations
// Create new accreditation
// ===============================================
router.post('/', async (req, res) => {
    try {
        const { documentControl, sections, risks, signoffs } = req.body;

        // Create main accreditation record
        const [result] = await pool.query(
            'INSERT INTO course_accreditations (course_title, course_code, awarding_body, application_type, date_started, expected_submission_date, lead_coordinator, version, overall_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                documentControl.course_title || 'Untitled',
                documentControl.course_code || '',
                documentControl.awarding_body || '',
                documentControl.application_type || '',
                documentControl.date_started || null,
                documentControl.expected_submission_date || null,
                documentControl.lead_coordinator || '',
                documentControl.version || '1.0',
                'Draft'
            ]
        );

        const accreditationId = result.insertId;

        // NOTE: Tasks, risks, and signoffs are handled separately by the frontend
        // via the individual endpoint calls, not through the sections array here.
        // This prevents duplicate inserts.

        const [rows] = await pool.query('SELECT * FROM course_accreditations WHERE id = ?', [accreditationId]);
        res.status(201).json({ success: true, data: rows[0], message: 'Accreditation created successfully' });
    } catch (error) {
        console.error('Error creating accreditation:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create accreditation', error: error.message });
    }
});

// ===============================================
// ROUTE 2: GET /api/accreditations/:id
// Get single accreditation with all details
// ===============================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get main accreditation
        const [accreditations] = await pool.query(
            'SELECT * FROM course_accreditations WHERE id = ?',
            [id]
        );

        if (accreditations.length === 0) {
            return res.status(404).json({ success: false, message: 'Accreditation not found' });
        }

        // Get all tasks grouped by section
        const [tasks] = await pool.query(
            'SELECT * FROM accreditation_tasks WHERE accreditation_id = ? ORDER BY section_number, id',
            [id]
        );

        // Get risks
        const [risks] = await pool.query(
            'SELECT * FROM accreditation_risks WHERE accreditation_id = ? ORDER BY created_at DESC',
            [id]
        );

        // Get sign-offs
        const [signoffs] = await pool.query(
            'SELECT * FROM accreditation_signoffs WHERE accreditation_id = ? ORDER BY role',
            [id]
        );

        res.json({
            success: true,
            data: {
                accreditation: accreditations[0],
                tasks,
                risks,
                signoffs
            }
        });
    } catch (error) {
        console.error('Error fetching accreditation details:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch accreditation details', error: error.message });
    }
});

// ===============================================
// ROUTE 3: PUT /api/accreditations/:id
// Update accreditation (Document Control fields and all sections)
// ===============================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { documentControl } = req.body;

        if (documentControl) {
            const updates = [];
            const params = [];
            const allowedFields = ['course_title', 'course_code', 'awarding_body', 'application_type', 'date_started', 'expected_submission_date', 'lead_coordinator', 'version', 'overall_status', 'completion_percentage'];

            allowedFields.forEach(field => {
                if (documentControl[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    params.push(documentControl[field]);
                }
            });

            if (updates.length > 0) {
                params.push(id);
                await pool.query(
                    `UPDATE course_accreditations SET ${updates.join(', ')} WHERE id = ?`,
                    params
                );
            }
        }

        // NOTE: Tasks, risks, and signoffs are handled separately by the frontend
        // via the individual endpoint calls, not through the sections array here.
        // This prevents duplicate inserts.

        const [rows] = await pool.query('SELECT * FROM course_accreditations WHERE id = ?', [id]);
        res.json({ success: true, data: rows[0], message: 'Accreditation updated successfully' });
    } catch (error) {
        console.error('Error updating accreditation:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update accreditation', error: error.message });
    }
});

// ===============================================
// ROUTE 3B: DELETE /api/accreditations/:id
// Delete accreditation
// ===============================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete all related data (cascading)
        await pool.query('DELETE FROM accreditation_tasks WHERE accreditation_id = ?', [id]);
        await pool.query('DELETE FROM accreditation_risks WHERE accreditation_id = ?', [id]);
        await pool.query('DELETE FROM accreditation_signoffs WHERE accreditation_id = ?', [id]);
        await pool.query('DELETE FROM course_accreditations WHERE id = ?', [id]);

        res.json({ success: true, message: 'Accreditation deleted successfully' });
    } catch (error) {
        console.error('Error deleting accreditation:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete accreditation', error: error.message });
    }
});

// ===============================================
// ROUTE 4: POST /api/accreditations/:id/tasks
// Add task/requirement
// ===============================================
router.post('/:id/tasks', async (req, res) => {
    try {
        const { id } = req.params;
        const { section_number, area, description, responsible, status, notes, source, evidence } = req.body;

        // Get section title from SECTION_CONFIG or use default
        const sectionTitles = {
            1: 'Initial Planning & Approval',
            2: 'Application Preparation',
            3: 'Submission & Engagement',
            4: 'Review, Visits & Validation',
            5: 'Agreement & Implementation',
            6: 'Post-Approval Monitoring',
            7: 'Risk & Issue Log',
            8: 'Sign-off'
        };

        const [result] = await pool.query(
            'INSERT INTO accreditation_tasks (accreditation_id, section_number, section_title, task_name, description, evidence_required, source_reference, responsible_person, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, section_number, sectionTitles[section_number] || '', area || '', description || '', evidence || '', source || '', responsible || '', status || 'Not Started', notes || null]
        );

        const [rows] = await pool.query('SELECT * FROM accreditation_tasks WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error adding task:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add task', error: error.message });
    }
});

// ===============================================
// ROUTE 5: PUT /api/accreditations/:id/tasks/:taskId
// Update task
// ===============================================
router.put('/:id/tasks/:taskId', async (req, res) => {
    try {
        const { id, taskId } = req.params;
        const { section_number, area, description, responsible, status, notes, source, evidence } = req.body;

        // Section title lookup
        const sectionTitles = {
            1: 'Initial Planning & Approval',
            2: 'Application Preparation',
            3: 'Submission & Engagement',
            4: 'Review, Visits & Validation',
            5: 'Agreement & Implementation',
            6: 'Post-Approval Monitoring',
            7: 'Risk & Issue Log',
            8: 'Sign-off'
        };

        // Map frontend field names to database field names
        const fieldMap = {
            section_number: section_number,
            section_title: section_number ? sectionTitles[section_number] : undefined,
            task_name: area,
            description: description,
            evidence_required: evidence,
            source_reference: source,
            responsible_person: responsible,
            status: status,
            notes: notes
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

        params.push(taskId, id);

        await pool.query(
            `UPDATE accreditation_tasks SET ${updates.join(', ')} WHERE id = ? AND accreditation_id = ?`,
            params
        );

        const [rows] = await pool.query('SELECT * FROM accreditation_tasks WHERE id = ?', [taskId]);
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error updating task:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update task', error: error.message });
    }
});

// ===============================================
// ROUTE 6: DELETE /api/accreditations/:id/tasks/:taskId
// Delete task
// ===============================================
router.delete('/:id/tasks/:taskId', async (req, res) => {
    try {
        const { id, taskId } = req.params;

        await pool.query(
            'DELETE FROM accreditation_tasks WHERE id = ? AND accreditation_id = ?',
            [taskId, id]
        );

        res.json({ success: true, message: 'Task deleted' });
    } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete task', error: error.message });
    }
});

// ===============================================
// ROUTE 7: POST /api/accreditations/:id/risks
// Add risk/issue
// ===============================================
router.post('/:id/risks', async (req, res) => {
    try {
        const { id } = req.params;
        const { risk_issue, impact, mitigation, owner, review_date } = req.body;

        await pool.query(
            'INSERT INTO accreditation_risks (accreditation_id, risk_issue, impact, mitigation, owner, review_date) VALUES (?, ?, ?, ?, ?, ?)',
            [id, risk_issue, impact, mitigation, owner, review_date]
        );

        res.json({ success: true, message: 'Risk added successfully' });
    } catch (error) {
        console.error('Error adding risk:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add risk', error: error.message });
    }
});

// ===============================================
// ROUTE 7: PUT /api/accreditations/:id/risks/:riskId
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
            `UPDATE accreditation_risks SET ${updates.join(', ')} WHERE accreditation_id = ? AND id = ?`,
            params
        );

        res.json({ success: true, message: 'Risk updated successfully' });
    } catch (error) {
        console.error('Error updating risk:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update risk', error: error.message });
    }
});

// ===============================================
// ROUTE 8: POST /api/accreditations/:id/signoffs
// Add sign-off
// ===============================================
router.post('/:id/signoffs', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, name, sign_date, signature } = req.body;

        console.log('Creating signoff:', { accreditation_id: id, role, name, sign_date, signature });

        const [result] = await pool.query(
            'INSERT INTO accreditation_signoffs (accreditation_id, role, name, sign_date, signature) VALUES (?, ?, ?, ?, ?)',
            [id, role, name, sign_date, signature]
        );

        const [rows] = await pool.query('SELECT * FROM accreditation_signoffs WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0], message: 'Sign-off added successfully' });
    } catch (error) {
        console.error('Error adding sign-off:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add sign-off', error: error.message });
    }
});

// ===============================================
// ROUTE 9: PUT /api/accreditations/:id/signoffs/:signoffId
// Update sign-off
// ===============================================
router.put('/:id/signoffs/:signoffId', async (req, res) => {
    try {
        const { id, signoffId } = req.params;
        const { role, name, sign_date, signature } = req.body;

        console.log('Updating signoff:', { accreditation_id: id, signoff_id: signoffId, role, name, sign_date, signature });

        const updates = [];
        const params = [];

        if (role !== undefined) {
            updates.push('role = ?');
            params.push(role);
        }
        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (sign_date !== undefined) {
            updates.push('sign_date = ?');
            params.push(sign_date);
        }
        if (signature !== undefined) {
            updates.push('signature = ?');
            params.push(signature);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        params.push(id, signoffId);

        const updateResult = await pool.query(
            `UPDATE accreditation_signoffs SET ${updates.join(', ')} WHERE accreditation_id = ? AND id = ?`,
            params
        );

        console.log('Update result:', updateResult[0]);

        const [rows] = await pool.query('SELECT * FROM accreditation_signoffs WHERE id = ?', [signoffId]);
        res.json({ success: true, data: rows[0], message: 'Sign-off updated successfully' });
    } catch (error) {
        console.error('Error updating sign-off:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update sign-off', error: error.message });
    }
});

// ===============================================
// ROUTE 10: DELETE /api/accreditations/:id/risks/:riskId
// Delete risk/issue
// ===============================================
router.delete('/:id/risks/:riskId', async (req, res) => {
    try {
        const { id, riskId } = req.params;

        await pool.query(
            'DELETE FROM accreditation_risks WHERE accreditation_id = ? AND id = ?',
            [id, riskId]
        );

        res.json({ success: true, message: 'Risk deleted successfully' });
    } catch (error) {
        console.error('Error deleting risk:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete risk', error: error.message });
    }
});

// ===============================================
// ROUTE 11: DELETE /api/accreditations/:id/signoffs/:signoffId
// Delete sign-off
// ===============================================
router.delete('/:id/signoffs/:signoffId', async (req, res) => {
    try {
        const { id, signoffId } = req.params;

        await pool.query(
            'DELETE FROM accreditation_signoffs WHERE accreditation_id = ? AND id = ?',
            [id, signoffId]
        );

        res.json({ success: true, message: 'Sign-off deleted successfully' });
    } catch (error) {
        console.error('Error deleting sign-off:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete sign-off', error: error.message });
    }
});

module.exports = router;
