const express = require('express');
const router = express.Router();
const pool = require('../db');

// =============================================
// Module 29: Student Engagement & Support
// Sub-sections: survey, graduate_outcome, employability,
//               support_service, advising, wellbeing, disability
// =============================================

async function initTables() {
    const conn = await pool.getConnection();
    try {
        // Single records table with type discriminator + JSON data
        await conn.query(`
            CREATE TABLE IF NOT EXISTS student_engagement (
                id INT PRIMARY KEY AUTO_INCREMENT,
                record_type ENUM(
                    'survey','graduate_outcome','employability',
                    'support_service','advising','wellbeing','disability'
                ) NOT NULL,
                student_name VARCHAR(255),
                student_email VARCHAR(255),
                -- Survey & Feedback fields
                survey_title VARCHAR(255),
                survey_period VARCHAR(100),
                survey_link VARCHAR(500),
                survey_status ENUM('Active','Closed','Draft') NULL,
                -- Graduate Outcome fields
                graduation_date DATE,
                employment_status ENUM('Employed','Self-Employed','Further Study','Unemployed','Unknown') NULL,
                employer VARCHAR(255),
                job_title VARCHAR(255),
                evidence VARCHAR(500),
                -- Employability Support fields
                support_type VARCHAR(100),
                -- Support Service fields
                service_type VARCHAR(100),
                outcome TEXT,
                -- Academic Advising fields
                advisor_name VARCHAR(255),
                meeting_date DATE,
                discussion_notes TEXT,
                follow_up_actions TEXT,
                -- Wellbeing / Disability fields
                category_type VARCHAR(100),
                adjustments TEXT,
                -- Shared fields
                notes TEXT,
                event_date DATE,
                status ENUM('active','closed','pending') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_type (record_type),
                INDEX idx_email (student_email),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    } finally {
        conn.release();
    }
}
initTables().catch(console.error);

// ---- Generic CRUD helpers ----

// GET /api/student-engagement?record_type=survey&search=...
router.get('/', async (req, res) => {
    try {
        const { record_type, status, search } = req.query;
        let where = ['1=1'];
        const params = [];
        if (record_type && record_type !== 'all') { where.push('record_type = ?'); params.push(record_type); }
        if (status && status !== 'all') { where.push('status = ?'); params.push(status); }
        if (search) {
            where.push('(student_name LIKE ? OR student_email LIKE ? OR survey_title LIKE ? OR employer LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                `SELECT * FROM student_engagement WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,
                params
            );
            res.json({ success: true, data: rows });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/student-engagement/:id
router.get('/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query('SELECT * FROM student_engagement WHERE id = ?', [req.params.id]);
            if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: rows[0] });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/student-engagement
router.post('/', async (req, res) => {
    try {
        const {
            record_type, student_name, student_email,
            survey_title, survey_period, survey_link, survey_status,
            graduation_date, employment_status, employer, job_title, evidence,
            support_type, service_type, outcome,
            advisor_name, meeting_date, discussion_notes, follow_up_actions,
            category_type, adjustments,
            notes, event_date, status
        } = req.body;

        const conn = await pool.getConnection();
        try {
            const [result] = await conn.query(
                `INSERT INTO student_engagement (
                    record_type, student_name, student_email,
                    survey_title, survey_period, survey_link, survey_status,
                    graduation_date, employment_status, employer, job_title, evidence,
                    support_type, service_type, outcome,
                    advisor_name, meeting_date, discussion_notes, follow_up_actions,
                    category_type, adjustments,
                    notes, event_date, status
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    record_type, student_name, student_email,
                    survey_title, survey_period, survey_link, survey_status || null,
                    graduation_date || null, employment_status || null, employer, job_title, evidence,
                    support_type, service_type, outcome,
                    advisor_name, meeting_date || null, discussion_notes, follow_up_actions,
                    category_type, adjustments,
                    notes, event_date || null, status || 'active'
                ]
            );
            res.json({ success: true, id: result.insertId });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/student-engagement/:id
router.put('/:id', async (req, res) => {
    try {
        const {
            record_type, student_name, student_email,
            survey_title, survey_period, survey_link, survey_status,
            graduation_date, employment_status, employer, job_title, evidence,
            support_type, service_type, outcome,
            advisor_name, meeting_date, discussion_notes, follow_up_actions,
            category_type, adjustments,
            notes, event_date, status
        } = req.body;

        const conn = await pool.getConnection();
        try {
            await conn.query(
                `UPDATE student_engagement SET
                    record_type=?, student_name=?, student_email=?,
                    survey_title=?, survey_period=?, survey_link=?, survey_status=?,
                    graduation_date=?, employment_status=?, employer=?, job_title=?, evidence=?,
                    support_type=?, service_type=?, outcome=?,
                    advisor_name=?, meeting_date=?, discussion_notes=?, follow_up_actions=?,
                    category_type=?, adjustments=?,
                    notes=?, event_date=?, status=?
                 WHERE id=?`,
                [
                    record_type, student_name, student_email,
                    survey_title, survey_period, survey_link, survey_status || null,
                    graduation_date || null, employment_status || null, employer, job_title, evidence,
                    support_type, service_type, outcome,
                    advisor_name, meeting_date || null, discussion_notes, follow_up_actions,
                    category_type, adjustments,
                    notes, event_date || null, status || 'active',
                    req.params.id
                ]
            );
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/student-engagement/:id
router.delete('/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            await conn.query('DELETE FROM student_engagement WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
