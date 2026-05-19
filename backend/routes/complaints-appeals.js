const express = require('express');
const router = express.Router();
const pool = require('../db');

// =============================================
// Module 28: Complaints & Appeals
// =============================================

async function initTable() {
    const conn = await pool.getConnection();
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS complaints_appeals (
                id INT PRIMARY KEY AUTO_INCREMENT,
                student_name VARCHAR(255),
                student_email VARCHAR(255),
                course_title VARCHAR(255),
                complaint_type ENUM('Complaint','Appeal') NOT NULL DEFAULT 'Complaint',
                category ENUM('Academic','Administrative','Behavioural','Discrimination','Other') DEFAULT 'Academic',
                date_of_incident DATE,
                details TEXT,
                supporting_evidence VARCHAR(500),
                consent TINYINT(1) DEFAULT 0,
                digital_signature VARCHAR(255),
                reviewed_by VARCHAR(255),
                review_date DATE,
                decision ENUM('Upheld','Partially Upheld','Not Upheld','Request More Info') NULL,
                reason TEXT,
                remedy TEXT,
                status ENUM('submitted','under_review','resolved','closed') DEFAULT 'submitted',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_type (complaint_type),
                INDEX idx_email (student_email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    } finally {
        conn.release();
    }
}
initTable().catch(console.error);

// GET /api/complaints-appeals
router.get('/', async (req, res) => {
    try {
        const { status, complaint_type, category, search } = req.query;
        let where = ['1=1'];
        const params = [];
        if (status && status !== 'all') { where.push('status = ?'); params.push(status); }
        if (complaint_type && complaint_type !== 'all') { where.push('complaint_type = ?'); params.push(complaint_type); }
        if (category && category !== 'all') { where.push('category = ?'); params.push(category); }
        if (search) {
            where.push('(student_name LIKE ? OR student_email LIKE ? OR details LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                `SELECT * FROM complaints_appeals WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,
                params
            );
            res.json({ success: true, data: rows });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/complaints-appeals/:id
router.get('/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query('SELECT * FROM complaints_appeals WHERE id = ?', [req.params.id]);
            if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: rows[0] });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/complaints-appeals
router.post('/', async (req, res) => {
    try {
        const {
            student_name, student_email, course_title, complaint_type, category,
            date_of_incident, details, supporting_evidence, consent, digital_signature
        } = req.body;
        const conn = await pool.getConnection();
        try {
            const [result] = await conn.query(
                `INSERT INTO complaints_appeals
                    (student_name, student_email, course_title, complaint_type, category,
                     date_of_incident, details, supporting_evidence, consent, digital_signature, status)
                 VALUES (?,?,?,?,?,?,?,?,?,?,'submitted')`,
                [student_name, student_email, course_title, complaint_type, category,
                 date_of_incident || null, details, supporting_evidence, consent ? 1 : 0, digital_signature]
            );
            res.json({ success: true, id: result.insertId });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/complaints-appeals/:id
router.put('/:id', async (req, res) => {
    try {
        const {
            student_name, student_email, course_title, complaint_type, category,
            date_of_incident, details, supporting_evidence, consent, digital_signature,
            reviewed_by, review_date, decision, reason, remedy, status
        } = req.body;

        let computedStatus = status;
        if (!computedStatus && decision) {
            if (decision === 'Upheld' || decision === 'Partially Upheld') computedStatus = 'resolved';
            else if (decision === 'Not Upheld') computedStatus = 'closed';
            else if (decision === 'Request More Info') computedStatus = 'under_review';
        }

        const conn = await pool.getConnection();
        try {
            await conn.query(
                `UPDATE complaints_appeals SET
                    student_name=?, student_email=?, course_title=?, complaint_type=?, category=?,
                    date_of_incident=?, details=?, supporting_evidence=?, consent=?,
                    digital_signature=?, reviewed_by=?, review_date=?,
                    decision=?, reason=?, remedy=?, status=?
                 WHERE id=?`,
                [student_name, student_email, course_title, complaint_type, category,
                 date_of_incident || null, details, supporting_evidence, consent ? 1 : 0,
                 digital_signature, reviewed_by, review_date || null,
                 decision || null, reason, remedy, computedStatus || 'submitted', req.params.id]
            );
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/complaints-appeals/:id
router.delete('/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            await conn.query('DELETE FROM complaints_appeals WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
