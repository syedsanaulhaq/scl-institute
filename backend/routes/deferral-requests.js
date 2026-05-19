const express = require('express');
const router = express.Router();
const pool = require('../db');

// =============================================
// Module 28: Deferral / Withdrawal / Transfer
// =============================================

async function initTable() {
    const conn = await pool.getConnection();
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS deferral_requests (
                id INT PRIMARY KEY AUTO_INCREMENT,
                student_name VARCHAR(255),
                student_email VARCHAR(255),
                course_title VARCHAR(255),
                course_code VARCHAR(100),
                request_type ENUM('Withdrawal','Deferral','Transfer') NOT NULL DEFAULT 'Deferral',
                effective_date DATE,
                justification TEXT,
                supporting_docs VARCHAR(500),
                policy_consent TINYINT(1) DEFAULT 0,
                digital_signature VARCHAR(255),
                reviewed_by VARCHAR(255),
                review_date DATE,
                decision ENUM('Approved','Approved with Conditions','Rejected','Request More Info') NULL,
                reason TEXT,
                committee_comments TEXT,
                final_decision_date DATE,
                status ENUM('pending','approved','rejected','info_requested') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_request_type (request_type),
                INDEX idx_email (student_email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // Safe column additions for existing tables
        const safeAdd = async (col, def) => {
            try { await conn.query(`ALTER TABLE deferral_requests ADD COLUMN ${col} ${def}`); } catch(e) { /* exists */ }
        };
        await safeAdd('application_id', 'INT NULL');
    } finally {
        conn.release();
    }
}
initTable().catch(console.error);

// GET /api/deferral-requests
router.get('/', async (req, res) => {
    try {
        const { status, request_type, search } = req.query;
        let where = ['1=1'];
        const params = [];
        if (status && status !== 'all') { where.push('status = ?'); params.push(status); }
        if (request_type && request_type !== 'all') { where.push('request_type = ?'); params.push(request_type); }
        if (search) {
            where.push('(student_name LIKE ? OR student_email LIKE ? OR course_title LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                `SELECT * FROM deferral_requests WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,
                params
            );
            res.json({ success: true, data: rows });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/deferral-requests/:id
router.get('/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query('SELECT * FROM deferral_requests WHERE id = ?', [req.params.id]);
            if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: rows[0] });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/deferral-requests
router.post('/', async (req, res) => {
    try {
        const {
            student_name, student_email, course_title, course_code, application_id,
            request_type, effective_date, justification, supporting_docs,
            policy_consent, digital_signature
        } = req.body;
        const conn = await pool.getConnection();
        try {
            const [result] = await conn.query(
                `INSERT INTO deferral_requests
                    (student_name, student_email, course_title, course_code, application_id,
                     request_type, effective_date, justification, supporting_docs,
                     policy_consent, digital_signature, status)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,'pending')`,
                [student_name, student_email, course_title, course_code, application_id || null,
                 request_type, effective_date || null, justification, supporting_docs,
                 policy_consent ? 1 : 0, digital_signature]
            );
            res.json({ success: true, id: result.insertId });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/deferral-requests/:id
router.put('/:id', async (req, res) => {
    try {
        const {
            student_name, student_email, course_title, course_code, request_type, effective_date,
            justification, supporting_docs, policy_consent, digital_signature,
            reviewed_by, review_date, decision, reason, committee_comments, final_decision_date, status
        } = req.body;

        // Map decision to status
        let computedStatus = status;
        if (!computedStatus && decision) {
            if (decision === 'Approved' || decision === 'Approved with Conditions') computedStatus = 'approved';
            else if (decision === 'Rejected') computedStatus = 'rejected';
            else if (decision === 'Request More Info') computedStatus = 'info_requested';
        }

        const conn = await pool.getConnection();
        try {
            await conn.query(
                `UPDATE deferral_requests SET
                    student_name=?, student_email=?, course_title=?, course_code=?, request_type=?,
                    effective_date=?, justification=?, supporting_docs=?, policy_consent=?,
                    digital_signature=?, reviewed_by=?, review_date=?, decision=?,
                    reason=?, committee_comments=?, final_decision_date=?, status=?
                 WHERE id=?`,
                [student_name, student_email, course_title, course_code, request_type,
                 effective_date || null, justification, supporting_docs, policy_consent ? 1 : 0,
                 digital_signature, reviewed_by, review_date || null, decision || null,
                 reason, committee_comments, final_decision_date || null,
                 computedStatus || 'pending', req.params.id]
            );
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/deferral-requests/:id
router.delete('/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            await conn.query('DELETE FROM deferral_requests WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
