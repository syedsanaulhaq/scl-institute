const express = require('express');
const pool = require('../db');

const router = express.Router();
const INIT_MAX_RETRIES = 30;
const INIT_RETRY_DELAY_MS = 5000;

async function ensureCourseVisitTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS course_visits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_title VARCHAR(255),
                course_code VARCHAR(50),
                awarding_body VARCHAR(255),
                visit_type VARCHAR(120),
                visit_date DATE,
                lead_contact_awarding_body VARCHAR(255),
                college_visit_coordinator VARCHAR(255),
                version VARCHAR(20) DEFAULT '1.0',
                last_updated_date DATE,
                purpose_of_visit TEXT,
                scope_focus_areas TEXT,
                key_standards_regulations TEXT,
                visit_agenda TEXT,
                required_attendees TEXT,
                pre_visit_preparation TEXT,
                evidence_document_log TEXT,
                day_of_visit_management TEXT,
                post_visit_actions TEXT,
                risk_issue_log TEXT,
                signoff_details TEXT,
                overall_status VARCHAR(50) DEFAULT 'Draft',
                completion_percentage INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                KEY idx_course (course_title),
                KEY idx_course_code (course_code),
                KEY idx_status (overall_status),
                KEY idx_updated_at (updated_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Course Visit tables initialized');
    } catch (error) {
        console.error('Error initializing course visit tables:', error.message);
        throw error;
    }
}

function shouldRetryInit(error) {
    const message = String(error?.message || '').toLowerCase();
    return (
        error?.code === 'ECONNREFUSED' ||
        error?.code === 'ETIMEDOUT' ||
        error?.code === 'PROTOCOL_CONNECTION_LOST' ||
        message.includes('connect econnrefused') ||
        message.includes('too many connections') ||
        message.includes('can\'t connect')
    );
}

function startVisitInitWithRetry(attempt = 1) {
    ensureCourseVisitTables()
        .then(() => {
            if (attempt > 1) {
                console.log(`[INIT] Course visit tables initialized after retry attempt ${attempt}`);
            }
        })
        .catch((error) => {
            if (!shouldRetryInit(error) || attempt >= INIT_MAX_RETRIES) {
                console.error(`[INIT] Course visit table init failed permanently after attempt ${attempt}:`, error.message);
                return;
            }

            console.warn(`[INIT] Course visit table init retry ${attempt}/${INIT_MAX_RETRIES} in ${INIT_RETRY_DELAY_MS}ms`);
            setTimeout(() => startVisitInitWithRetry(attempt + 1), INIT_RETRY_DELAY_MS);
        });
}

startVisitInitWithRetry();

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM course_visits ORDER BY updated_at DESC, created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching course visits:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch course visits', error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const dc = req.body.documentControl || req.body;
        const [result] = await pool.query(
            `INSERT INTO course_visits (
                course_title, course_code, awarding_body, visit_type, visit_date,
                lead_contact_awarding_body, college_visit_coordinator, version, last_updated_date,
                purpose_of_visit, scope_focus_areas, key_standards_regulations, visit_agenda,
                required_attendees, pre_visit_preparation, evidence_document_log,
                day_of_visit_management, post_visit_actions, risk_issue_log, signoff_details,
                overall_status, completion_percentage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
            [
                dc.course_title || 'Untitled',
                dc.course_code || '',
                dc.awarding_body || '',
                dc.visit_type || '',
                dc.visit_date || null,
                dc.lead_contact_awarding_body || '',
                dc.college_visit_coordinator || '',
                dc.version || '1.0',
                dc.last_updated_date || null,
                dc.purpose_of_visit || '',
                dc.scope_focus_areas || '',
                dc.key_standards_regulations || '',
                dc.visit_agenda || '',
                dc.required_attendees || '',
                dc.pre_visit_preparation || '',
                dc.evidence_document_log || '',
                dc.day_of_visit_management || '',
                dc.post_visit_actions || '',
                dc.risk_issue_log || '',
                dc.signoff_details || '',
                dc.overall_status || 'Draft',
                Number.isFinite(Number(dc.completion_percentage)) ? Number(dc.completion_percentage) : 0
            ]
        );

        const [rows] = await pool.query('SELECT * FROM course_visits WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0], message: 'Course visit created successfully' });
    } catch (error) {
        console.error('Error creating course visit:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create course visit', error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM course_visits WHERE id = ?', [req.params.id]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Course visit not found' });
        }
        res.json({ success: true, data: { visit: rows[0] } });
    } catch (error) {
        console.error('Error fetching course visit details:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch course visit details', error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const dc = req.body.documentControl || req.body;
        const allowed = [
            'course_title', 'course_code', 'awarding_body', 'visit_type', 'visit_date',
            'lead_contact_awarding_body', 'college_visit_coordinator', 'version', 'last_updated_date',
            'purpose_of_visit', 'scope_focus_areas', 'key_standards_regulations', 'visit_agenda',
            'required_attendees', 'pre_visit_preparation', 'evidence_document_log',
            'day_of_visit_management', 'post_visit_actions', 'risk_issue_log', 'signoff_details',
            'overall_status', 'completion_percentage'
        ];

        const updates = [];
        const values = [];
        allowed.forEach((field) => {
            if (dc[field] !== undefined) {
                updates.push(`${field} = ?`);
                if (field === 'completion_percentage') {
                    values.push(Number.isFinite(Number(dc[field])) ? Number(dc[field]) : 0);
                } else {
                    values.push(dc[field]);
                }
            }
        });

        if (updates.length > 0) {
            values.push(req.params.id);
            await pool.query(`UPDATE course_visits SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        const [rows] = await pool.query('SELECT * FROM course_visits WHERE id = ?', [req.params.id]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Course visit not found' });
        }

        res.json({ success: true, data: rows[0], message: 'Course visit updated successfully' });
    } catch (error) {
        console.error('Error updating course visit:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update course visit', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM course_visits WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Course visit deleted successfully' });
    } catch (error) {
        console.error('Error deleting course visit:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete course visit', error: error.message });
    }
});

module.exports = router;
