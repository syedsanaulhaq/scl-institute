const express = require('express');
const pool = require('../db');

const router = express.Router();

// ===============================================
// INDUCTION REQUIREMENTS ENDPOINTS
// ===============================================

// GET all requirements for an induction (grouped by section)
router.get('/:inductionId/requirements', async (req, res) => {
    try {
        const { inductionId } = req.params;
        
        const [requirements] = await pool.query(
            `SELECT * FROM induction_requirements 
             WHERE induction_id = ? 
             ORDER BY section_number ASC, requirement_area ASC`,
            [inductionId]
        );
        
        res.json({ success: true, data: requirements });
    } catch (error) {
        console.error('Error fetching requirements:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch requirements', error: error.message });
    }
});

// GET single requirement
router.get('/:inductionId/requirements/:requirementId', async (req, res) => {
    try {
        const { inductionId, requirementId } = req.params;
        
        const [requirement] = await pool.query(
            `SELECT * FROM induction_requirements 
             WHERE id = ? AND induction_id = ?`,
            [requirementId, inductionId]
        );
        
        if (requirement.length === 0) {
            return res.status(404).json({ success: false, message: 'Requirement not found' });
        }
        
        res.json({ success: true, data: requirement[0] });
    } catch (error) {
        console.error('Error fetching requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch requirement', error: error.message });
    }
});

// POST - Add new requirement
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
            review_notes,
            created_by
        } = req.body;
        
        if (!section_number || !requirement_area) {
            return res.status(400).json({ success: false, message: 'Section number and requirement area are required' });
        }
        
        await pool.query(
            `INSERT INTO induction_requirements (
                induction_id, section_number, section_title, requirement_area,
                description, source_reference, evidence_held, responsible_person,
                compliance_status, review_notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                inductionId, section_number, section_title, requirement_area,
                description, source_reference, evidence_held, responsible_person,
                compliance_status || 'pending', review_notes, created_by
            ]
        );
        
        res.json({ success: true, message: 'Requirement added successfully' });
    } catch (error) {
        console.error('Error adding requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add requirement', error: error.message });
    }
});

// PUT - Update requirement (all fields)
router.put('/:inductionId/requirements/:requirementId', async (req, res) => {
    try {
        const { inductionId, requirementId } = req.params;
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
            params.push(compliance_status);
        }
        if (review_notes !== undefined) {
            updates.push('review_notes = ?');
            params.push(review_notes);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }
        
        params.push(inductionId, requirementId);
        
        await pool.query(
            `UPDATE induction_requirements SET ${updates.join(', ')} 
             WHERE induction_id = ? AND id = ?`,
            params
        );
        
        const [updated] = await pool.query(
            'SELECT * FROM induction_requirements WHERE id = ?',
            [requirementId]
        );
        
        res.json({ success: true, data: updated[0] });
    } catch (error) {
        console.error('Error updating requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update requirement', error: error.message });
    }
});

// PUT - Update compliance status only (quick update)
router.put('/:inductionId/requirements/:requirementId/compliance', async (req, res) => {
    try {
        const { inductionId, requirementId } = req.params;
        const { compliance_status, review_notes } = req.body;
        
        const updates = [];
        const params = [];
        
        if (compliance_status !== undefined) {
            updates.push('compliance_status = ?');
            params.push(compliance_status);
        }
        if (review_notes !== undefined) {
            updates.push('review_notes = ?');
            params.push(review_notes);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }
        
        params.push(inductionId, requirementId);
        
        await pool.query(
            `UPDATE induction_requirements SET ${updates.join(', ')} 
             WHERE induction_id = ? AND id = ?`,
            params
        );
        
        res.json({ success: true, message: 'Compliance status updated' });
    } catch (error) {
        console.error('Error updating compliance status:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update compliance status', error: error.message });
    }
});

// DELETE - Remove requirement
router.delete('/:inductionId/requirements/:requirementId', async (req, res) => {
    try {
        const { inductionId, requirementId } = req.params;
        
        await pool.query(
            `DELETE FROM induction_requirements 
             WHERE id = ? AND induction_id = ?`,
            [requirementId, inductionId]
        );
        
        res.json({ success: true, message: 'Requirement deleted successfully' });
    } catch (error) {
        console.error('Error deleting requirement:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete requirement', error: error.message });
    }
});

// GET - Get summary stats for an induction
router.get('/:inductionId/requirements/stats/summary', async (req, res) => {
    try {
        const { inductionId } = req.params;
        
        const [stats] = await pool.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN compliance_status = 'compliant' THEN 1 ELSE 0 END) as compliant,
                SUM(CASE WHEN compliance_status = 'non_compliant' THEN 1 ELSE 0 END) as non_compliant,
                SUM(CASE WHEN compliance_status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN compliance_status = 'na' THEN 1 ELSE 0 END) as not_applicable,
                ROUND((SUM(CASE WHEN compliance_status = 'compliant' THEN 1 ELSE 0 END) / COUNT(*) * 100), 2) as compliance_percentage
             FROM induction_requirements 
             WHERE induction_id = ?`,
            [inductionId]
        );
        
        res.json({ success: true, data: stats[0] });
    } catch (error) {
        console.error('Error fetching stats:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
    }
});

module.exports = router;
