const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================
// SUPPORT ROUTES CONFIGURATION
// ============================================

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads', 'support-documents');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only PDF, DOC, DOCX, JPG, PNG, TXT files allowed'));
    }
});

// ============================================
// DATABASE INITIALIZATION
// ============================================

async function initSupportTables() {
    try {
        const connection = await pool.getConnection();

        // Support Requests Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS support_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                description LONGTEXT NOT NULL,
                admin_reply LONGTEXT NULL,
                status VARCHAR(50) DEFAULT 'open',
                priority VARCHAR(20) DEFAULT 'medium',
                assigned_to VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP NULL,
                INDEX idx_student (student_id),
                INDEX idx_status (status),
                INDEX idx_type (type),
                INDEX idx_created (created_at)
            )
        `);

        // Backfill admin reply column for existing environments (MySQL <8.0.3 safe).
        try {
            await connection.query(`
                ALTER TABLE support_requests
                ADD COLUMN admin_reply LONGTEXT NULL AFTER description
            `);
        } catch (e) {
            if (!e.message.includes('Duplicate column name')) throw e;
        }

        // Feedback Surveys Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS feedback_surveys (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                course_id INT,
                module_code VARCHAR(50),
                feedback_type VARCHAR(50),
                rating INT,
                comments LONGTEXT,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_student (student_id),
                INDEX idx_module (module_code),
                INDEX idx_submitted (submitted_at)
            )
        `);

        // Complaints & Appeals Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS complaints_appeals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                case_number VARCHAR(50) UNIQUE NOT NULL,
                student_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                category VARCHAR(100),
                description LONGTEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'submitted',
                priority VARCHAR(20) DEFAULT 'medium',
                assigned_to VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deadline TIMESTAMP NULL,
                resolved_at TIMESTAMP NULL,
                decision VARCHAR(50),
                decision_notes LONGTEXT,
                INDEX idx_student (student_id),
                INDEX idx_case (case_number),
                INDEX idx_status (status),
                INDEX idx_created (created_at)
            )
        `);

        // Complaint Timeline Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS complaint_timeline (
                id INT AUTO_INCREMENT PRIMARY KEY,
                complaint_id INT NOT NULL,
                stage VARCHAR(100),
                description LONGTEXT,
                updated_by VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                student_notification BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (complaint_id) REFERENCES complaints_appeals(id),
                INDEX idx_complaint (complaint_id)
            )
        `);

        // Complaint Documents Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS complaint_documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                complaint_id INT NOT NULL,
                document_url VARCHAR(500),
                document_type VARCHAR(100),
                uploaded_by VARCHAR(255),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (complaint_id) REFERENCES complaints_appeals(id),
                INDEX idx_complaint (complaint_id)
            )
        `);

        // Disability Support Requests Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS disability_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                request_type VARCHAR(100),
                description LONGTEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                approved_date TIMESTAMP NULL,
                valid_until TIMESTAMP NULL,
                INDEX idx_student (student_id),
                INDEX idx_status (status)
            )
        `);

        // Adjustment Plan Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS adjustment_plan (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_id INT NOT NULL,
                adjustment_detail LONGTEXT,
                implementation_notes LONGTEXT,
                valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                valid_until TIMESTAMP NULL,
                visible_to_student BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (request_id) REFERENCES disability_requests(id),
                INDEX idx_request (request_id)
            )
        `);

        // Disability Documents Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS disability_documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_id INT NOT NULL,
                document_url VARCHAR(500),
                document_type VARCHAR(100),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (request_id) REFERENCES disability_requests(id),
                INDEX idx_request (request_id)
            )
        `);

        // Safeguarding Reports Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS safeguarding_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                report_type VARCHAR(50),
                description LONGTEXT NOT NULL,
                severity VARCHAR(20) DEFAULT 'medium',
                status VARCHAR(50) DEFAULT 'reported',
                confidential BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                assigned_to VARCHAR(255),
                resolved_at TIMESTAMP NULL,
                INDEX idx_student (student_id),
                INDEX idx_severity (severity),
                INDEX idx_status (status),
                INDEX idx_created (created_at)
            )
        `);

        // Safeguarding Timeline Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS safeguarding_timeline (
                id INT AUTO_INCREMENT PRIMARY KEY,
                report_id INT NOT NULL,
                action_taken LONGTEXT,
                notes LONGTEXT,
                updated_by VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                visible_to_student BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (report_id) REFERENCES safeguarding_reports(id),
                INDEX idx_report (report_id)
            )
        `);

        console.log("[DB] Support tables verified/created");
        connection.release();
    } catch (err) {
        console.error("[DB] Support tables init failed:", err.message);
    }
}

initSupportTables();

// ============================================
// SUPPORT REQUESTS ENDPOINTS
// ============================================

// Create support request
router.post('/requests', async (req, res) => {
    try {
        const { student_id, type, subject, description } = req.body;

        if (!student_id || !type || !subject || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
            `INSERT INTO support_requests (student_id, type, subject, description) 
             VALUES (?, ?, ?, ?)`,
            [student_id, type, subject, description]
        );

        connection.release();

        res.json({
            success: true,
            message: 'Support request created',
            request_id: result.insertId
        });
    } catch (error) {
        console.error("[SUPPORT] Create request failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all support requests for student
router.get('/requests/:student_id', async (req, res) => {
    try {
        const { student_id } = req.params;
        const connection = await pool.getConnection();

        const [requests] = await connection.query(
            `SELECT * FROM support_requests WHERE student_id = ? ORDER BY created_at DESC`,
            [student_id]
        );

        connection.release();

        res.json({
            success: true,
            count: requests.length,
            requests: requests
        });
    } catch (error) {
        console.error("[SUPPORT] Fetch requests failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single request
router.get('/requests/:student_id/:request_id', async (req, res) => {
    try {
        const { request_id } = req.params;
        const connection = await pool.getConnection();

        const [requests] = await connection.query(
            `SELECT * FROM support_requests WHERE id = ?`,
            [request_id]
        );

        connection.release();

        if (!requests.length) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.json({
            success: true,
            request: requests[0]
        });
    } catch (error) {
        console.error("[SUPPORT] Fetch single request failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update request status
router.put('/requests/:request_id', async (req, res) => {
    try {
        const { request_id } = req.params;
        const { status, assigned_to, admin_reply } = req.body;
        const connection = await pool.getConnection();

        await connection.query(
            `UPDATE support_requests SET status = ?, assigned_to = ?, admin_reply = ?, updated_at = NOW() WHERE id = ?`,
            [status, assigned_to || null, admin_reply || null, request_id]
        );

        connection.release();

        res.json({
            success: true,
            message: 'Request updated'
        });
    } catch (error) {
        console.error("[SUPPORT] Update request failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// SUPPORT REPLIES (threaded conversation)
// ============================================
// SUPPORT REPLIES — generic threaded conversations
// Works for: requests, feedback, complaints, disability, safeguarding
// ============================================
const VALID_REPLY_TYPES = ['requests', 'feedback', 'complaints', 'disability', 'safeguarding', 'course-changes'];

// GET /support/admin/:record_type/:record_id/replies
router.get('/admin/:record_type/:record_id/replies', async (req, res) => {
    try {
        const { record_type, record_id } = req.params;
        if (!VALID_REPLY_TYPES.includes(record_type)) {
            return res.status(400).json({ success: false, message: 'Invalid record type.' });
        }
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT id, record_type, request_id AS record_id, sender_type, sender_name, message, created_at
             FROM support_replies
             WHERE request_id = ? AND record_type = ?
             ORDER BY created_at ASC`,
            [record_id, record_type]
        );
        connection.release();
        res.json({ success: true, replies: rows });
    } catch (error) {
        console.error('[SUPPORT] Get replies failed:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /support/admin/:record_type/:record_id/replies
router.post('/admin/:record_type/:record_id/replies', async (req, res) => {
    try {
        const { record_type, record_id } = req.params;
        if (!VALID_REPLY_TYPES.includes(record_type)) {
            return res.status(400).json({ success: false, message: 'Invalid record type.' });
        }
        const { message, sender_name } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required.' });
        }
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            `INSERT INTO support_replies (record_type, request_id, sender_type, sender_name, message) VALUES (?, ?, 'admin', ?, ?)`,
            [record_type, record_id, sender_name || 'Admin', message.trim()]
        );
        const [[inserted]] = await connection.query(
            `SELECT id, record_type, request_id AS record_id, sender_type, sender_name, message, created_at FROM support_replies WHERE id = ?`,
            [result.insertId]
        );
        connection.release();
        res.json({ success: true, reply: inserted });
    } catch (error) {
        console.error('[SUPPORT] Post reply failed:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /support/student/:record_type/:record_id/replies  — student-side reply (sender_type = 'student')
router.post('/student/:record_type/:record_id/replies', async (req, res) => {
    try {
        const { record_type, record_id } = req.params;
        if (!VALID_REPLY_TYPES.includes(record_type)) {
            return res.status(400).json({ success: false, message: 'Invalid record type.' });
        }
        const { message, sender_name } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required.' });
        }
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            `INSERT INTO support_replies (record_type, request_id, sender_type, sender_name, message) VALUES (?, ?, 'student', ?, ?)`,
            [record_type, record_id, sender_name || 'Student', message.trim()]
        );
        const [[inserted]] = await connection.query(
            `SELECT id, record_type, request_id AS record_id, sender_type, sender_name, message, created_at FROM support_replies WHERE id = ?`,
            [result.insertId]
        );
        connection.release();
        res.json({ success: true, reply: inserted });
    } catch (error) {
        console.error('[SUPPORT] Student post reply failed:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// FEEDBACK & EVALUATIONS ENDPOINTS
// ============================================


// Submit feedback
router.post('/feedback', async (req, res) => {
    try {
        const { student_id, course_id, module_code, feedback_type, rating, comments } = req.body;

        if (!student_id || !feedback_type || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
            `INSERT INTO feedback_surveys (student_id, course_id, module_code, feedback_type, rating, comments) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [student_id, course_id, module_code, feedback_type, rating, comments]
        );

        connection.release();

        res.json({
            success: true,
            message: 'Feedback submitted',
            feedback_id: result.insertId
        });
    } catch (error) {
        console.error("[FEEDBACK] Submit failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get feedback submissions
router.get('/feedback/:student_id', async (req, res) => {
    try {
        const { student_id } = req.params;
        const connection = await pool.getConnection();

        const [feedback] = await connection.query(
            `SELECT * FROM feedback_surveys WHERE student_id = ? ORDER BY submitted_at DESC`,
            [student_id]
        );

        connection.release();

        res.json({
            success: true,
            count: feedback.length,
            feedback: feedback
        });
    } catch (error) {
        console.error("[FEEDBACK] Fetch failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// COMPLAINTS & APPEALS ENDPOINTS
// ============================================

// Generate case number
function generateCaseNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
    return `CASE-${year}-${month}-${random}`;
}

// Create complaint/appeal
router.post('/complaints', async (req, res) => {
    try {
        const { student_id, type, category, description, priority } = req.body;

        if (!student_id || !type || !category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const caseNumber = generateCaseNumber();
        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
            `INSERT INTO complaints_appeals (case_number, student_id, type, category, description, priority) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [caseNumber, student_id, type, category, description, priority || 'medium']
        );

        // Add initial timeline entry
        await connection.query(
            `INSERT INTO complaint_timeline (complaint_id, stage, description) VALUES (?, ?, ?)`,
            [result.insertId, 'submitted', 'Complaint/Appeal submitted by student']
        );

        connection.release();

        res.json({
            success: true,
            message: 'Complaint/Appeal submitted',
            case_number: caseNumber,
            complaint_id: result.insertId
        });
    } catch (error) {
        console.error("[COMPLAINTS] Create failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get complaints for student
router.get('/complaints/:student_id', async (req, res) => {
    try {
        const { student_id } = req.params;
        const connection = await pool.getConnection();

        const [complaints] = await connection.query(
            `SELECT * FROM complaints_appeals WHERE student_id = ? ORDER BY created_at DESC`,
            [student_id]
        );

        connection.release();

        res.json({
            success: true,
            count: complaints.length,
            complaints: complaints
        });
    } catch (error) {
        console.error("[COMPLAINTS] Fetch failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single complaint with timeline
router.get('/complaints/:student_id/:complaint_id', async (req, res) => {
    try {
        const { complaint_id } = req.params;
        const connection = await pool.getConnection();

        const [complaints] = await connection.query(
            `SELECT * FROM complaints_appeals WHERE id = ?`,
            [complaint_id]
        );

        if (!complaints.length) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        const [timeline] = await connection.query(
            `SELECT * FROM complaint_timeline WHERE complaint_id = ? ORDER BY updated_at ASC`,
            [complaint_id]
        );

        const [documents] = await connection.query(
            `SELECT * FROM complaint_documents WHERE complaint_id = ?`,
            [complaint_id]
        );

        connection.release();

        res.json({
            success: true,
            complaint: complaints[0],
            timeline: timeline,
            documents: documents
        });
    } catch (error) {
        console.error("[COMPLAINTS] Fetch single failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Upload complaint documents
router.post('/complaints/:complaint_id/documents', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { complaint_id } = req.params;
        const connection = await pool.getConnection();

        await connection.query(
            `INSERT INTO complaint_documents (complaint_id, document_url, document_type, uploaded_by) 
             VALUES (?, ?, ?, ?)`,
            [complaint_id, req.file.filename, req.file.mimetype, 'student']
        );

        connection.release();

        res.json({
            success: true,
            message: 'Document uploaded',
            filename: req.file.filename
        });
    } catch (error) {
        console.error("[COMPLAINTS] Upload failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// DISABILITY SUPPORT ENDPOINTS
// ============================================

// Create disability request
router.post('/disability', async (req, res) => {
    try {
        const { student_id, request_type, description } = req.body;

        if (!student_id || !request_type || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
            `INSERT INTO disability_requests (student_id, request_type, description) 
             VALUES (?, ?, ?)`,
            [student_id, request_type, description]
        );

        connection.release();

        res.json({
            success: true,
            message: 'Disability request created',
            request_id: result.insertId
        });
    } catch (error) {
        console.error("[DISABILITY] Create request failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get disability requests for student
router.get('/disability/:student_id', async (req, res) => {
    try {
        const { student_id } = req.params;
        const connection = await pool.getConnection();

        const [requests] = await connection.query(
            `SELECT * FROM disability_requests WHERE student_id = ? ORDER BY created_at DESC`,
            [student_id]
        );

        connection.release();

        res.json({
            success: true,
            count: requests.length,
            requests: requests
        });
    } catch (error) {
        console.error("[DISABILITY] Fetch requests failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get disability adjustment plan
router.get('/disability/:student_id/:request_id/plan', async (req, res) => {
    try {
        const { request_id } = req.params;
        const connection = await pool.getConnection();

        const [plan] = await connection.query(
            `SELECT * FROM adjustment_plan WHERE request_id = ?`,
            [request_id]
        );

        connection.release();

        res.json({
            success: true,
            plan: plan
        });
    } catch (error) {
        console.error("[DISABILITY] Fetch plan failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Upload disability documents
router.post('/disability/:request_id/documents', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { request_id } = req.params;
        const connection = await pool.getConnection();

        await connection.query(
            `INSERT INTO disability_documents (request_id, document_url, document_type) 
             VALUES (?, ?, ?)`,
            [request_id, req.file.filename, req.file.mimetype]
        );

        connection.release();

        res.json({
            success: true,
            message: 'Document uploaded',
            filename: req.file.filename
        });
    } catch (error) {
        console.error("[DISABILITY] Upload failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// SAFEGUARDING ENDPOINTS
// ============================================

// Report safeguarding concern
router.post('/safeguarding/report', async (req, res) => {
    try {
        const { student_id, report_type, description, severity } = req.body;

        if (!student_id || !report_type || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
            `INSERT INTO safeguarding_reports (student_id, report_type, description, severity) 
             VALUES (?, ?, ?, ?)`,
            [student_id, report_type, description, severity || 'medium']
        );

        // Add initial timeline entry (not visible to student)
        await connection.query(
            `INSERT INTO safeguarding_timeline (report_id, action_taken, visible_to_student) 
             VALUES (?, ?, FALSE)`,
            [result.insertId, 'Report received and logged']
        );

        connection.release();

        console.log(`[SAFEGUARDING] Critical report filed by student ${student_id}`);

        res.json({
            success: true,
            message: 'Safeguarding concern reported',
            report_id: result.insertId
        });
    } catch (error) {
        console.error("[SAFEGUARDING] Report failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get safeguarding reports for student
router.get('/safeguarding/:student_id', async (req, res) => {
    try {
        const { student_id } = req.params;
        const connection = await pool.getConnection();

        const [reports] = await connection.query(
            `SELECT * FROM safeguarding_reports WHERE student_id = ? ORDER BY created_at DESC`,
            [student_id]
        );

        connection.release();

        res.json({
            success: true,
            count: reports.length,
            reports: reports
        });
    } catch (error) {
        console.error("[SAFEGUARDING] Fetch reports failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get safeguarding report with timeline
router.get('/safeguarding/:student_id/:report_id', async (req, res) => {
    try {
        const { report_id } = req.params;
        const connection = await pool.getConnection();

        const [reports] = await connection.query(
            `SELECT * FROM safeguarding_reports WHERE id = ?`,
            [report_id]
        );

        if (!reports.length) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Only fetch visible timeline entries for students
        const [timeline] = await connection.query(
            `SELECT * FROM safeguarding_timeline WHERE report_id = ? AND visible_to_student = TRUE ORDER BY updated_at ASC`,
            [report_id]
        );

        connection.release();

        res.json({
            success: true,
            report: reports[0],
            timeline: timeline
        });
    } catch (error) {
        console.error("[SAFEGUARDING] Fetch single failed:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// GET all support requests (admin)
router.get('/admin/requests', async (req, res) => {
    try {
        const { status, type } = req.query;
        const connection = await pool.getConnection();
        let where = 'WHERE 1=1';
        const params = [];
        if (status && status !== 'all') { where += ' AND sr.status = ?'; params.push(status); }
        if (type && type !== 'all')     { where += ' AND sr.type = ?';   params.push(type); }

        const [rows] = await connection.query(
            `SELECT sr.*, CONCAT(sa.first_name, ' ', sa.last_name) as student_name, sa.email as student_email
             FROM support_requests sr
             LEFT JOIN student_applications sa ON sr.student_id = sa.id
             ${where}
             ORDER BY sr.created_at DESC`,
            params
        );
        connection.release();
        res.json({ success: true, count: rows.length, requests: rows });
    } catch (err) {
        console.error('[ADMIN] Fetch support requests failed:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all feedback (admin)
router.get('/admin/feedback', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT fs.*, CONCAT(sa.first_name, ' ', sa.last_name) as student_name, sa.email as student_email
             FROM feedback_surveys fs
             LEFT JOIN student_applications sa ON fs.student_id = sa.id
             ORDER BY fs.submitted_at DESC`
        );
        connection.release();
        res.json({ success: true, count: rows.length, feedback: rows });
    } catch (err) {
        console.error('[ADMIN] Fetch feedback failed:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all complaints (admin)
router.get('/admin/complaints', async (req, res) => {
    try {
        const { status } = req.query;
        const connection = await pool.getConnection();
        let where = 'WHERE 1=1';
        const params = [];
        if (status && status !== 'all') { where += ' AND ca.status = ?'; params.push(status); }

        const [rows] = await connection.query(
            `SELECT ca.*, CONCAT(sa.first_name, ' ', sa.last_name) as student_name, sa.email as student_email
             FROM complaints_appeals ca
             LEFT JOIN student_applications sa ON ca.student_id = sa.id
             ${where}
             ORDER BY ca.created_at DESC`,
            params
        );
        connection.release();
        res.json({ success: true, count: rows.length, complaints: rows });
    } catch (err) {
        console.error('[ADMIN] Fetch complaints failed:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all disability requests (admin)
router.get('/admin/disability', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT dr.*, CONCAT(sa.first_name, ' ', sa.last_name) as student_name, sa.email as student_email
             FROM disability_requests dr
             LEFT JOIN student_applications sa ON dr.student_id = sa.id
             ORDER BY dr.created_at DESC`
        );
        connection.release();
        res.json({ success: true, count: rows.length, requests: rows });
    } catch (err) {
        console.error('[ADMIN] Fetch disability requests failed:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all safeguarding reports (admin)
router.get('/admin/safeguarding', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT sg.*, CONCAT(sa.first_name, ' ', sa.last_name) as student_name, sa.email as student_email
             FROM safeguarding_reports sg
             LEFT JOIN student_applications sa ON sg.student_id = sa.id
             ORDER BY sg.created_at DESC`
        );
        connection.release();
        res.json({ success: true, count: rows.length, reports: rows });
    } catch (err) {
        console.error('[ADMIN] Fetch safeguarding reports failed:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT update support request status (admin)
router.put('/admin/requests/:id', async (req, res) => {
    try {
        const { status, assigned_to, admin_reply } = req.body;
        const connection = await pool.getConnection();
        await connection.query(
            `UPDATE support_requests
             SET status = COALESCE(?, status), assigned_to = ?, admin_reply = ?, updated_at = NOW()
             WHERE id = ?`,
            [status || null, assigned_to || null, admin_reply || null, req.params.id]
        );
        connection.release();
        res.json({ success: true, message: 'Updated' });
    } catch (err) {
        console.error('[ADMIN] Update support request failed:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT update complaint status (admin)
router.put('/admin/complaints/:id', async (req, res) => {
    try {
        const { status, decision, decision_notes, assigned_to } = req.body;
        const connection = await pool.getConnection();
        await connection.query(
            `UPDATE complaints_appeals SET status = ?, decision = ?, decision_notes = ?, assigned_to = ?, updated_at = NOW() WHERE id = ?`,
            [status, decision || null, decision_notes || null, assigned_to || null, req.params.id]
        );
        if (status === 'resolved' || status === 'rejected') {
            await connection.query(
                `INSERT INTO complaint_timeline (complaint_id, stage, description, updated_by) VALUES (?, ?, ?, ?)`,
                [req.params.id, status, decision_notes || `Status changed to ${status}`, 'admin']
            );
        }
        connection.release();
        res.json({ success: true, message: 'Updated' });
    } catch (err) {
        console.error('[ADMIN] Update complaint failed:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT update disability request status (admin)
router.put('/admin/disability/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const connection = await pool.getConnection();
        await connection.query(
            `UPDATE disability_requests SET status = ?, updated_at = NOW() WHERE id = ?`,
            [status, req.params.id]
        );
        connection.release();
        res.json({ success: true, message: 'Updated' });
    } catch (err) {
        console.error('[ADMIN] Update disability failed:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
