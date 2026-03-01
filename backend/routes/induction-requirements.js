const express = require('express');
const router = express.Router();
const pool = require('../db');

// ===============================================
// Get all requirements for an induction
// GET /api/inductions/:inductionId/compliance-requirements
// ===============================================
router.get('/requirements/:inductionId', async (req, res) => {
    try {
        const { inductionId } = req.params;
        
        const [requirements] = await pool.query(
            `SELECT * FROM induction_requirements 
             WHERE course_id = ?
             ORDER BY section_number ASC, id ASC`,
            [inductionId]
        );

        // Group by section
        const grouped = {};
        requirements.forEach(req => {
            if (!grouped[req.section_number]) {
                grouped[req.section_number] = {
                    section_number: req.section_number,
                    section_title: req.section_title,
                    requirements: []
                };
            }
            grouped[req.section_number].requirements.push(req);
        });

        res.json({
            success: true,
            data: Object.values(grouped)
        });
    } catch (error) {
        console.error('Error fetching requirements:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch requirements', error: error.message });
    }
});

// ===============================================
// Get single requirement
// GET /api/inductions/requirements/:requirementId
// ===============================================
router.get('/:requirementId', async (req, res) => {
    try {
        const { requirementId } = req.params;
        
        const [requirements] = await pool.query(
            'SELECT * FROM induction_requirements WHERE id = ?',
            [requirementId]
        );

        if (requirements.length === 0) {
            return res.status(404).json({ success: false, message: 'Requirement not found' });
        }

        res.json({
            success: true,
            data: requirements[0]
        });
    } catch (error) {
        console.error('Error fetching requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch requirement', error: error.message });
    }
});

// ===============================================
// Create requirement
// POST /api/inductions/:inductionId/requirements
// ===============================================
router.post('/:inductionId/requirements', async (req, res) => {
    try {
        const { inductionId } = req.params;
        const {
            section_number,
            section_title,
            requirement_area,
            description,
            source_reference,
            evidence_held,
            responsible_person,
            compliance_status,
            review_notes
        } = req.body;

        const [result] = await pool.query(
            `INSERT INTO induction_requirements (
                course_id, section_number, section_title, requirement_area,
                description, source_reference, evidence_held, responsible_person,
                compliance_status, review_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                inductionId,
                section_number,
                section_title,
                requirement_area,
                description || null,
                source_reference || null,
                evidence_held || null,
                responsible_person || null,
                compliance_status || false,
                review_notes || null
            ]
        );

        res.json({
            success: true,
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create requirement', error: error.message });
    }
});

// ===============================================
// Update requirement
// PUT /api/inductions/requirements/:requirementId
// ===============================================
router.put('/:requirementId', async (req, res) => {
    try {
        const { requirementId } = req.params;
        const {
            requirement_area,
            description,
            source_reference,
            evidence_held,
            responsible_person,
            compliance_status,
            review_notes
        } = req.body;

        const updates = [];
        const params = [];

        if (requirement_area !== undefined) {
            updates.push('requirement_area = ?');
            params.push(requirement_area);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (source_reference !== undefined) {
            updates.push('source_reference = ?');
            params.push(source_reference);
        }
        if (evidence_held !== undefined) {
            updates.push('evidence_held = ?');
            params.push(evidence_held);
        }
        if (responsible_person !== undefined) {
            updates.push('responsible_person = ?');
            params.push(responsible_person);
        }
        if (compliance_status !== undefined) {
            updates.push('compliance_status = ?');
            params.push(compliance_status ? 1 : 0);
        }
        if (review_notes !== undefined) {
            updates.push('review_notes = ?');
            params.push(review_notes);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        params.push(requirementId);

        await pool.query(
            `UPDATE induction_requirements SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        const [updated] = await pool.query(
            'SELECT * FROM induction_requirements WHERE id = ?',
            [requirementId]
        );

        res.json({
            success: true,
            data: updated[0]
        });
    } catch (error) {
        console.error('Error updating requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update requirement', error: error.message });
    }
});

// ===============================================
// Delete requirement
// DELETE /api/inductions/requirements/:requirementId
// ===============================================
router.delete('/:requirementId', async (req, res) => {
    try {
        const { requirementId } = req.params;

        await pool.query(
            'DELETE FROM induction_requirements WHERE id = ?',
            [requirementId]
        );

        res.json({
            success: true,
            message: 'Requirement deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete requirement', error: error.message });
    }
});

module.exports = router;
