const express = require('express');
const router = express.Router();
const pool = require('../db');

// =============================================
// Module 28: Academic Misconduct
// =============================================

async function initTable() {
    const conn = await pool.getConnection();
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS academic_misconduct (
                id INT PRIMARY KEY AUTO_INCREMENT,
                student_name VARCHAR(255),
                student_email VARCHAR(255),
                course_title VARCHAR(255),
                course_code VARCHAR(100),
                misconduct_type ENUM('Plagiarism','Collusion','Cheating','Fabrication','Other') NOT NULL DEFAULT 'Plagiarism',
                incident_date DATE,
                location_context VARCHAR(500),
                description TEXT,
                supporting_evidence VARCHAR(500),
                student_response TEXT,
                student_supporting_docs VARCHAR(500),
                declaration TINYINT(1) DEFAULT 0,
                reviewed_by VARCHAR(255),
                panel_date DATE,
                decision ENUM('Warning','Fail Assessment','Fail Module','Expulsion','No Action') NULL,
                reason TEXT,
                sanctions TEXT,
                status ENUM('reported','under_review','panel_scheduled','closed') DEFAULT 'reported',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_type (misconduct_type),
                INDEX idx_email (student_email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    } finally {
        conn.release();
    }
}
initTable().catch(console.error);

// GET /api/academic-misconduct
router.get('/', async (req, res) => {
    try {
        const { status, misconduct_type, search } = req.query;
        let where = ['1=1'];
        const params = [];
        if (status && status !== 'all') { where.push('status = ?'); params.push(status); }
        if (misconduct_type && misconduct_type !== 'all') { where.push('misconduct_type = ?'); params.push(misconduct_type); }
        if (search) {
            where.push('(student_name LIKE ? OR student_email LIKE ? OR course_title LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                `SELECT * FROM academic_misconduct WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,
                params
            );
            res.json({ success: true, data: rows });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/academic-misconduct/:id
router.get('/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query('SELECT * FROM academic_misconduct WHERE id = ?', [req.params.id]);
            if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: rows[0] });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/academic-misconduct
router.post('/', async (req, res) => {
    try {
        const {
            student_name, student_email, course_title, course_code,
            misconduct_type, incident_date, location_context, description,
            supporting_evidence, student_response, student_supporting_docs, declaration
        } = req.body;
        const conn = await pool.getConnection();
        try {
            const [result] = await conn.query(
                `INSERT INTO academic_misconduct
                    (student_name, student_email, course_title, course_code, misconduct_type,
                     incident_date, location_context, description, supporting_evidence,
                     student_response, student_supporting_docs, declaration, status)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'reported')`,
                [student_name, student_email, course_title, course_code, misconduct_type,
                 incident_date || null, location_context, description, supporting_evidence,
                 student_response, student_supporting_docs, declaration ? 1 : 0]
            );
            res.json({ success: true, id: result.insertId });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/academic-misconduct/:id
router.put('/:id', async (req, res) => {
    try {
        const {
            student_name, student_email, course_title, course_code, misconduct_type,
            incident_date, location_context, description, supporting_evidence,
            student_response, student_supporting_docs, declaration,
            reviewed_by, panel_date, decision, reason, sanctions, status
        } = req.body;

        let computedStatus = status;
        if (!computedStatus && decision) {
            computedStatus = 'closed';
        }

        const conn = await pool.getConnection();
        try {
            await conn.query(
                `UPDATE academic_misconduct SET
                    student_name=?, student_email=?, course_title=?, course_code=?,
                    misconduct_type=?, incident_date=?, location_context=?, description=?,
                    supporting_evidence=?, student_response=?, student_supporting_docs=?,
                    declaration=?, reviewed_by=?, panel_date=?, decision=?,
                    reason=?, sanctions=?, status=?
                 WHERE id=?`,
                [student_name, student_email, course_title, course_code, misconduct_type,
                 incident_date || null, location_context, description, supporting_evidence,
                 student_response, student_supporting_docs, declaration ? 1 : 0,
                 reviewed_by, panel_date || null, decision || null,
                 reason, sanctions, computedStatus || 'reported', req.params.id]
            );
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/academic-misconduct/:id
router.delete('/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            await conn.query('DELETE FROM academic_misconduct WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
