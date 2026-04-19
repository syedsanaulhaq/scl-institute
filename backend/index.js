require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
console.log("Backend process starting...");
const studentsRouter = require('./routes/students');
const { router: notificationsRouter } = require('./routes/notifications');
const courseInductionsRouter = require('./routes/course-inductions');
const accreditationsRouter = require('./routes/accreditations');
const courseVisitsRouter = require('./routes/course-visits');

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

const app = express();
const PORT = process.env.PORT || 4000;
const moodleTablePrefix = process.env.MOODLE_TABLE_PREFIX || 'mdl_';

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection Definition
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Alias for convenience
const db = pool;

// In-memory session store. Automatically cleared on server restart,
// which forces all users to re-authenticate after a restart.
const activeSessions = new Map();

const moodlePool = mysql.createPool({
    host: process.env.MOODLE_DATABASE_HOST || 'host.docker.internal',
    port: process.env.MOODLE_DATABASE_PORT || 3306,
    user: process.env.MOODLE_DATABASE_USER,
    password: process.env.MOODLE_DATABASE_PASSWORD,
    database: process.env.MOODLE_DATABASE_NAME || 'moodle',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

// Simple auth middleware
const requireAuth = (req, res, next) => {
    // For now, just check if we have some basic auth
    // In production, implement proper JWT token validation
    const authHeader = req.headers.authorization;
    if (authHeader || req.body.authenticated || req.query.auth === 'admin') {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
};

// Create Tokens Table on Startup
async function initDB() {
    try {
        console.log(`[DB] Attempting to connect to ${process.env.DB_HOST || 'localhost'}...`);
        const connection = await pool.getConnection();
        console.log("[DB] Connection successful. Initializing tables...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sso_tokens (
                token VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255),
                firstname VARCHAR(255),
                lastname VARCHAR(255),
                role VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_role_snapshots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                moodle_user_id INT DEFAULT NULL,
                roles TEXT NOT NULL,
                role_data JSON DEFAULT NULL,
                synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP DEFAULT NULL,
                source VARCHAR(50) DEFAULT 'moodle',
                UNIQUE KEY unique_email (email),
                INDEX idx_email (email),
                INDEX idx_synced_at (synced_at),
                INDEX idx_expires_at (expires_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS course_change_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                application_id INT NOT NULL,
                student_id INT NULL,
                student_name VARCHAR(255) NULL,
                course_title VARCHAR(255) NULL,
                course_start_date DATE NULL,
                current_study_mode VARCHAR(50) NULL,
                type_of_request VARCHAR(50) NOT NULL,
                effective_date DATE NOT NULL,
                justification TEXT NULL,
                supporting_document VARCHAR(500) NULL,
                policy_confirmation TINYINT(1) DEFAULT 0,
                digital_signature VARCHAR(255) NULL,
                request_date DATE NULL,
                decision VARCHAR(100) NULL,
                reviewed_by VARCHAR(255) NULL,
                review_date DATETIME NULL,
                rejection_reason TEXT NULL,
                committee_comments TEXT NULL,
                final_decision_confirmation TINYINT(1) DEFAULT 0,
                new_course_code VARCHAR(50) NULL,
                new_course_title VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_course_change_application (application_id),
                INDEX idx_course_change_type (type_of_request),
                INDEX idx_course_change_decision (decision),
                INDEX idx_course_change_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS student_programme_registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                application_id INT NOT NULL,
                student_email VARCHAR(255) NOT NULL,
                programme_code VARCHAR(50) NOT NULL,
                programme_title VARCHAR(255) NULL,
                status ENUM('active', 'completed', 'transferred_out', 'withdrawn', 'rejected') DEFAULT 'active',
                source VARCHAR(50) DEFAULT 'admission_decision',
                course_change_request_id INT NULL,
                notes TEXT NULL,
                started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                ended_at DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_registration_application (application_id),
                INDEX idx_registration_email_status (student_email, status),
                INDEX idx_registration_programme_status (programme_code, status),
                INDEX idx_registration_started (started_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Safe column additions - ignore errors if columns already exist
        const safeAddColumn = async (table, col, def) => {
            try { await connection.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`); } catch(e) { /* column likely exists */ }
        };
        await safeAddColumn('course_change_requests', 'decision', 'VARCHAR(100) NULL');
        await safeAddColumn('course_change_requests', 'reviewed_by', 'VARCHAR(255) NULL');
        await safeAddColumn('course_change_requests', 'review_date', 'DATETIME NULL');
        await safeAddColumn('course_change_requests', 'rejection_reason', 'TEXT NULL');
        await safeAddColumn('course_change_requests', 'committee_comments', 'TEXT NULL');
        await safeAddColumn('course_change_requests', 'final_decision_confirmation', 'TINYINT(1) DEFAULT 0');
        await safeAddColumn('course_change_requests', 'new_course_code', 'VARCHAR(50) NULL');
        await safeAddColumn('course_change_requests', 'new_course_title', 'VARCHAR(255) NULL');
        await safeAddColumn('student_programme_registrations', 'source', "VARCHAR(50) DEFAULT 'admission_decision'");
        await safeAddColumn('student_programme_registrations', 'course_change_request_id', 'INT NULL');
        await safeAddColumn('student_programme_registrations', 'notes', 'TEXT NULL');
        await safeAddColumn('student_programme_registrations', 'started_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
        await safeAddColumn('student_programme_registrations', 'ended_at', 'DATETIME NULL');
        console.log("[DB] Tables initialized");
        connection.release();
    } catch (err) {
        console.error("[DB] Connection failed:", err.message);
    }
}

// Initialize DB on startup
initDB();

// Middleware  
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:7777',
        'http://127.0.0.1:7777',
        'http://localhost:5173',
        'http://localhost:8080',
        'http://103.93.57.101:3000',
        'http://103.93.57.101:7777',
        'http://103.93.57.101:5173',
        'http://103.93.57.101:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));

app.use(bodyParser.json({ verify: (req, res, buf, encoding) => {
    req.rawBody = buf.toString(encoding);
} }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/students', studentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/course-inductions', courseInductionsRouter);
app.use('/api/accreditations', accreditationsRouter);
app.use('/api/course-visits', courseVisitsRouter);

// ===============================
// ROUTES
// ===============================

// Health check routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

app.get('/api/health/db', async (req, res) => {
    try {
        console.log("[DEBUG] Testing DB connection...");
        const [rows] = await pool.query('SELECT 1 as result');
        res.json({ status: 'OK', database: 'Connected', data: rows });
    } catch (err) {
        console.error("[DEBUG] DB Health error:", err.message);
        res.status(500).json({ status: 'Error', message: err.message });
    }
});

// ===============================
// PUBLIC ROUTES
// ===============================

// Get all programs
app.get('/api/public/programs', async (req, res) => {
    try {
        const query = `
            SELECT id, name, code, description, duration, qualification, 
                   fee_amount, fee_currency, status, created_at
            FROM programs 
            WHERE status = 'active'
            ORDER BY name
        `;
        
        const [results] = await db.execute(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ error: 'Failed to fetch programs' });
    }
});

// Submit application
app.post('/api/public/applications', async (req, res) => {
    try {
        const {
            first_name, last_name, email, phone, date_of_birth, nationality, gender,
            address_line1, address_line2, city, postal_code, country,
            highest_qualification, institution_name, graduation_year, gpa_grade,
            program_id, intake_year, intake_month, how_did_you_hear, personal_statement
        } = req.body;

        // Generate reference number
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const reference_number = `SCL${year}${month}${day}${randomNum}`;

        const query = `
            INSERT INTO applications (
                reference_number, first_name, last_name, email, phone, date_of_birth, 
                nationality, gender, address_line1, address_line2, city, postal_code, 
                country, highest_qualification, institution_name, graduation_year, 
                gpa_grade, program_id, intake_year, intake_month, how_did_you_hear, 
                personal_statement, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            reference_number, first_name, last_name, email, phone, date_of_birth,
            nationality, gender, address_line1, address_line2, city, postal_code,
            country, highest_qualification, institution_name, graduation_year,
            gpa_grade, program_id, intake_year, intake_month, how_did_you_hear,
            personal_statement, 'pending', now, now
        ];

        const [result] = await db.execute(query, values);

        res.status(201).json({
            message: 'Application submitted successfully',
            reference_number: reference_number,
            application_id: result.insertId
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// Submit general enquiry
app.post('/api/public/enquiries', async (req, res) => {
    try {
        const { name, email, phone, subject, message, enquiry_type } = req.body;
        
        const now = new Date();
        const query = `
            INSERT INTO enquiries (name, email, phone, subject, message, enquiry_type, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
        `;
        
        const values = [name, email, phone, subject, message, enquiry_type || 'general', now, now];
        const [result] = await db.execute(query, values);
        
        res.status(201).json({
            message: 'Enquiry submitted successfully',
            enquiry_id: result.insertId
        });
    } catch (error) {
        console.error('Error submitting enquiry:', error);
        res.status(500).json({ error: 'Failed to submit enquiry' });
    }
});

// ===============================
// ADMIN ROUTES (Protected)
// ===============================

// Get all applications (admin)
app.get('/api/admin/applications', requireAuth, async (req, res) => {
    try {
        const query = `
            SELECT * FROM student_applications
            WHERE is_deleted = FALSE
            ORDER BY created_at DESC
        `;
        
        const [results] = await db.execute(query);
        console.log(`Fetched ${results.length} applications from database`);
        
        // Transform results to match frontend expectations
        const transformedResults = results.map(app => {
            const refNum = app.application_reference || `SCL${String(app.id).padStart(6, '0')}`;
            return {
                ...app,
                reference_number: refNum,
                application_reference: refNum,
                status: app.application_status || 'pending',
                program_id: app.program_id || 0
            };
        });
        
        console.log(`First application after transform:`, transformedResults[0]);
        res.json(transformedResults);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Update application status (admin)
app.put('/api/admin/applications/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        const query = `
            UPDATE applications 
            SET status = ?, admin_notes = ?, updated_at = ?
            WHERE id = ?
        `;
        
        const [result] = await db.execute(query, [status, notes, new Date(), id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        res.json({ message: 'Application updated successfully' });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
});

// Delete application (admin)
app.delete('/api/admin/applications/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if application exists and is not already deleted
        const [applications] = await db.execute(
            'SELECT id, is_deleted FROM student_applications WHERE id = ?',
            [id]
        );

        if (applications.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Application not found' 
            });
        }

        if (applications[0].is_deleted) {
            return res.status(400).json({ 
                success: false,
                error: 'Application is already deleted' 
            });
        }

        // Soft delete the application with cascade
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Mark application as deleted
            await connection.execute(
                'UPDATE student_applications SET is_deleted = TRUE, deleted_at = NOW() WHERE id = ?',
                [id]
            );

            // Cascade: mark associated documents as deleted
            await connection.execute(
                'UPDATE application_documents SET is_deleted = TRUE, deleted_at = NOW() WHERE application_id = ?',
                [id]
            );

            // Cascade: mark associated reviews as deleted
            await connection.execute(
                'UPDATE application_reviews SET is_deleted = TRUE, deleted_at = NOW() WHERE application_id = ?',
                [id]
            );

            // Cascade: mark associated decisions as deleted
            await connection.execute(
                'UPDATE admissions_decisions SET is_deleted = TRUE, deleted_at = NOW() WHERE application_id = ?',
                [id]
            );

            await connection.commit();

            res.json({
                success: true,
                message: 'Application deleted successfully',
                data: {
                    id,
                    deleted_at: new Date().toISOString()
                }
            });
        } catch (transactionError) {
            await connection.rollback();
            throw transactionError;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete application' 
        });
    }
});

// Get all enquiries (admin)
app.get('/api/admin/enquiries', requireAuth, async (req, res) => {
    try {
        const query = `
            SELECT * FROM enquiries
            ORDER BY created_at DESC
        `;
        
        const [results] = await db.execute(query);
        res.json(results);
    } catch (error) {
        console.error('Error fetching enquiries:', error);
        res.status(500).json({ error: 'Failed to fetch enquiries' });
    }
});

// Update enquiry status (admin)
app.put('/api/admin/enquiries/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, response } = req.body;
        
        const query = `
            UPDATE enquiries 
            SET status = ?, admin_response = ?, updated_at = ?
            WHERE id = ?
        `;
        
        const [result] = await db.execute(query, [status, response, new Date(), id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }
        
        res.json({ message: 'Enquiry updated successfully' });
    } catch (error) {
        console.error('Error updating enquiry:', error);
        res.status(500).json({ error: 'Failed to update enquiry' });
    }
});

// Get dashboard statistics (admin)
app.get('/api/admin/dashboard-stats', requireAuth, async (req, res) => {
    try {
        const queries = {
            applications: 'SELECT COUNT(*) as count FROM applications',
            pending_applications: 'SELECT COUNT(*) as count FROM applications WHERE status = "pending"',
            approved_applications: 'SELECT COUNT(*) as count FROM applications WHERE status = "approved"',
            enquiries: 'SELECT COUNT(*) as count FROM enquiries',
            pending_enquiries: 'SELECT COUNT(*) as count FROM enquiries WHERE status = "pending"',
            programs: 'SELECT COUNT(*) as count FROM programs WHERE status = "active"'
        };
        
        const stats = {};
        for (const [key, query] of Object.entries(queries)) {
            const [result] = await db.execute(query);
            stats[key] = result[0].count;
        }
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

app.post('/api/admin/manual-role-sync', requireAuth, async (req, res) => {
    if (roleSyncJobInProgress) {
        return res.status(409).json({
            success: false,
            error: 'Role sync already in progress'
        });
    }

    try {
        const result = await syncAllUserRoleSnapshots();
        console.log(`[ROLE SYNC] Manual sync complete: ${result.successCount}/${result.totalUsers} users refreshed`);
        res.json({
            success: true,
            message: 'Manual role sync completed',
            data: result
        });
    } catch (error) {
        console.error('[ROLE SYNC] Manual sync error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to run manual role sync'
        });
    }
});

// ===============================
// AUTHENTICATION ROUTES
// ===============================

const roleAliasMap = {
    'super admin': 'manager',
    'lms manager': 'manager',
    'course creator': 'coursecreator',
    'non-editing teacher': 'teacher',
    noneditingteacher: 'teacher',
    'authenticated user': 'user',
    'authenticated user on site home': 'frontpage'
};

const managementRoles = new Set(['admin', 'manager', 'coursecreator']);
const teachingRoles = new Set(['editingteacher', 'teacher']);
const learningRoles = new Set(['student']);
const protectedManagementEmails = new Set(
    String(process.env.PROTECTED_MANAGEMENT_EMAILS || 'admin@sclsandbox.xyz,admin@scl.com')
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean)
);

function normalizeRole(role) {
    if (!role) {
        return '';
    }

    const normalized = String(role).trim().toLowerCase();
    return roleAliasMap[normalized] || normalized;
}

function parseRoleTokens(roleValue) {
    if (!roleValue) {
        return [];
    }

    return String(roleValue)
        .split(/[|,;]+/)
        .map((entry) => normalizeRole(entry))
        .filter(Boolean);
}

function buildRoleContext(roleValue, roleData = null) {
    const roles = [...new Set(parseRoleTokens(roleValue))];
    const primaryRole = roles[0] || null;

    // Extract context-aware assignments if available
    const assignments = roleData?.assignments || [];
    
    // Categorize by context level
    const systemRoles = [];
    const courseRoles = {};
    
    for (const assignment of assignments) {
        const normalized = normalizeRole(assignment.shortname);
        if (!normalized) continue;
        
        if (assignment.contextlevel === 10) {
            // System-level role
            if (!systemRoles.includes(normalized)) {
                systemRoles.push(normalized);
            }
        } else if (assignment.contextlevel === 50 && assignment.courseid) {
            // Course-level role
            if (!courseRoles[assignment.courseid]) {
                courseRoles[assignment.courseid] = [];
            }
            if (!courseRoles[assignment.courseid].includes(normalized)) {
                courseRoles[assignment.courseid].push(normalized);
            }
        }
    }

    // System assignments are ideal, but local/seeded management roles must still grant access.
    const hasSystemManagement = systemRoles.some((role) => managementRoles.has(role));
    const hasManagement = roles.some((role) => managementRoles.has(role));

    return {
        primaryRole,
        roles,
        assignments,
        systemRoles,
        courseRoles,
        hasSystemManagement,
        hasManagement,
        hasTeaching: roles.some((role) => teachingRoles.has(role)),
        hasStudent: roles.some((role) => learningRoles.has(role)),
        canAccessManagementPortal: hasSystemManagement || hasManagement,
        canAccessStudentPortal: roles.some((role) => learningRoles.has(role) || teachingRoles.has(role))
    };
}

function getRolePriority(role) {
    const priority = {
        manager: 1,
        admin: 1,
        coursecreator: 2,
        editingteacher: 3,
        teacher: 4,
        student: 5,
        user: 6,
        frontpage: 7,
        guest: 8
    };

    return priority[role] || 99;
}

function isProtectedManagementEmail(email) {
    return Boolean(email && protectedManagementEmails.has(String(email).trim().toLowerCase()));
}

function mergeRoles(localRoleValue, moodleRoles = [], options = {}) {
    const forceManager = options.forceManager === true;
    const localRoles = parseRoleTokens(localRoleValue);
    const remoteRoles = Array.isArray(moodleRoles)
        ? moodleRoles.map((role) => normalizeRole(role)).filter(Boolean)
        : [];

    if (forceManager) {
        localRoles.push('manager');
    }

    return [...new Set([...localRoles, ...remoteRoles])]
        .sort((a, b) => getRolePriority(a) - getRolePriority(b));
}

async function callMoodle(wsfunction, params = {}) {
    const moodleBaseUrl = process.env.MOODLE_INTERNAL_URL || process.env.MOODLE_URL || 'http://localhost:9090';
    const moodleToken = process.env.MOODLE_TOKEN;

    if (!moodleToken) {
        return null;
    }

    const endpoint = `${moodleBaseUrl.replace(/\/$/, '')}/webservice/rest/server.php`;

    const response = await axios.post(endpoint, null, {
        params: {
            wstoken: moodleToken,
            wsfunction,
            moodlewsrestformat: 'json',
            ...params
        },
        timeout: 5000
    });

    const payload = response?.data;
    if (payload && payload.exception) {
        throw new Error(`${wsfunction} failed: ${payload.message || payload.exception}`);
    }

    return payload;
}

async function getRoleSnapshot(email) {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM user_role_snapshots WHERE email = ? AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY synced_at DESC LIMIT 1',
            [email]
        );

        if (rows.length === 0) {
            return null;
        }

        const snapshot = rows[0];
        const snapshotRoles = String(snapshot.roles || '')
            .split(',')
            .map((role) => role.trim())
            .filter(Boolean);

        if (snapshotRoles.length === 0) {
            return null;
        }

        let roleData = null;
        if (snapshot.role_data) {
            try {
                roleData = typeof snapshot.role_data === 'string' 
                    ? JSON.parse(snapshot.role_data) 
                    : snapshot.role_data;
            } catch (e) {
                console.warn('[SNAPSHOT] Failed to parse role_data:', e.message);
            }
        }

        return {
            source: 'snapshot',
            moodleUserId: snapshot.moodle_user_id,
            roles: snapshotRoles,
            roleData,
            syncedAt: snapshot.synced_at
        };
    } catch (error) {
        console.warn('[LOGIN] Role snapshot fetch failed:', error.message);
        return null;
    }
}

async function upsertRoleSnapshot({ email, moodleUserId = null, roles = [], roleData = null, source = 'moodle' }) {
    if (!email || !Array.isArray(roles)) {
        return;
    }

    const rolesString = roles.join(',');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await pool.query(
        `INSERT INTO user_role_snapshots (email, moodle_user_id, roles, role_data, synced_at, expires_at, source)
         VALUES (?, ?, ?, ?, NOW(), ?, ?)
         ON DUPLICATE KEY UPDATE
            moodle_user_id = VALUES(moodle_user_id),
            roles = VALUES(roles),
            role_data = VALUES(role_data),
            synced_at = NOW(),
            expires_at = VALUES(expires_at),
            source = VALUES(source)`,
        [email, moodleUserId, rolesString, roleData ? JSON.stringify(roleData) : null, expiresAt, source]
    );
}

async function getMoodleRolesFromDbByEmail(email) {
    if (!process.env.MOODLE_DATABASE_USER || !process.env.MOODLE_DATABASE_PASSWORD) {
        return null;
    }

    const [userRows] = await moodlePool.query(
        `SELECT id FROM ${moodleTablePrefix}user WHERE email = ? AND deleted = 0 LIMIT 1`,
        [email]
    );

    if (!Array.isArray(userRows) || userRows.length === 0) {
        return null;
    }

    const moodleUserId = userRows[0].id;
    const [roleRows] = await moodlePool.query(
        `SELECT DISTINCT r.shortname, r.name, c.contextlevel, c.id as contextid, c.instanceid as courseid
         FROM ${moodleTablePrefix}role_assignments ra
         JOIN ${moodleTablePrefix}role r ON r.id = ra.roleid
         JOIN ${moodleTablePrefix}context c ON c.id = ra.contextid
         WHERE ra.userid = ?
         ORDER BY c.contextlevel ASC, r.sortorder ASC`,
        [moodleUserId]
    );

    const roles = [
        ...new Set(
            (roleRows || [])
                .map((row) => normalizeRole(row.shortname || row.name))
                .filter(Boolean)
        )
    ].sort((a, b) => getRolePriority(a) - getRolePriority(b));

    if (roles.length === 0) {
        return null;
    }

    // Build context-aware role assignments
    const assignments = (roleRows || []).map((row) => ({
        shortname: row.shortname || null,
        name: row.name || null,
        contextlevel: row.contextlevel || null,
        contextid: row.contextid || null,
        courseid: row.contextlevel === 50 ? row.courseid : null // Only include courseid for course context
    }));

    const roleData = { assignments };

    await upsertRoleSnapshot({
        email,
        moodleUserId,
        roles,
        roleData,
        source: 'moodle-db'
    });

    return {
        source: 'moodle-db',
        moodleUserId,
        roles,
        roleData
    };
}

async function getEmailFromMoodleUserId(moodleUserId) {
    if (!moodleUserId) {
        return null;
    }

    const [rows] = await moodlePool.query(
        `SELECT email FROM ${moodleTablePrefix}user WHERE id = ? AND deleted = 0 LIMIT 1`,
        [moodleUserId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
        return null;
    }

    return rows[0].email || null;
}

async function forceResyncRoleSnapshot({ email, moodleUserId = null }) {
    let resolvedEmail = email;

    if (!resolvedEmail && moodleUserId) {
        resolvedEmail = await getEmailFromMoodleUserId(moodleUserId);
    }

    if (!resolvedEmail) {
        throw new Error('Unable to resolve email for resync');
    }

    const fresh = await getMoodleRolesByEmail(resolvedEmail, { preferSnapshot: false });
    if (!fresh || !Array.isArray(fresh.roles) || fresh.roles.length === 0) {
        throw new Error('No Moodle roles found for user');
    }

    // Preserve an existing local management role so periodic sync doesn't
    // accidentally downgrade admins to course-only roles.
    let effectiveRoles = fresh.roles;
    try {
        const [currentRows] = await pool.query('SELECT role FROM users WHERE email = ? LIMIT 1', [resolvedEmail]);
        const currentRole = currentRows?.[0]?.role || null;
        const currentRoleTokens = parseRoleTokens(currentRole);
        const hasLocalManagementRole = currentRoleTokens.some((role) => managementRoles.has(role));
        const protectedManagement = isProtectedManagementEmail(resolvedEmail);

        if (hasLocalManagementRole || protectedManagement) {
            effectiveRoles = mergeRoles(currentRole, fresh.roles, { forceManager: protectedManagement });
        }
    } catch (e) {
        console.warn('[SSO RESYNC] Could not read local role for merge:', e.message);
    }

    // Ensure snapshot has a fresh timestamp even if resolver returned from fallback path.
    await upsertRoleSnapshot({
        email: resolvedEmail,
        moodleUserId: fresh.moodleUserId || moodleUserId || null,
        roles: effectiveRoles,
        roleData: fresh.roleData || null,
        source: `${fresh.source || 'moodle'}-resync`
    });

    // Keep local role roughly aligned for legacy readers.
    try {
        const roleContext = buildRoleContext(effectiveRoles.join(','), fresh.roleData || null);
        const primaryRole = roleContext.primaryRole;
        if (primaryRole) {
            await pool.query('UPDATE users SET role = ? WHERE email = ?', [primaryRole, resolvedEmail]);
        }
    } catch (e) {
        console.warn('[SSO RESYNC] Could not update users.role:', e.message);
    }

    return {
        email: resolvedEmail,
        moodleUserId: fresh.moodleUserId || moodleUserId || null,
        roles: effectiveRoles,
        roleData: fresh.roleData || null,
        source: fresh.source || 'moodle'
    };
}

let roleSyncJobInProgress = false;

async function syncAllUserRoleSnapshots() {
    if (roleSyncJobInProgress) {
        throw new Error('Role sync already in progress');
    }

    roleSyncJobInProgress = true;
    const startedAt = Date.now();

    try {
        const [users] = await pool.query('SELECT email FROM users WHERE email IS NOT NULL AND email != ""');
        let successCount = 0;
        let failureCount = 0;

        for (const user of users) {
            try {
                await forceResyncRoleSnapshot({ email: user.email });
                successCount += 1;
            } catch (syncErr) {
                failureCount += 1;
            }
        }

        return {
            totalUsers: users.length,
            successCount,
            failureCount,
            durationMs: Date.now() - startedAt
        };
    } finally {
        roleSyncJobInProgress = false;
    }
}

async function getMoodleRolesByEmail(email, options = {}) {
    // Skip Moodle integration if disabled
    if (process.env.ENABLE_MOODLE_INTEGRATION === 'false') {
        return null;
    }

    const preferSnapshot = options.preferSnapshot !== false;

    if (preferSnapshot) {
        const snapshot = await getRoleSnapshot(email);
        if (snapshot) {
            console.log(`[LOGIN] Using cached role snapshot for ${email} (synced: ${snapshot.syncedAt})`);
            return snapshot;
        }
    }

    try {
        const usersResult = await callMoodle('core_user_get_users_by_field', {
            field: 'email',
            'values[0]': email
        });

        if (!Array.isArray(usersResult) || usersResult.length === 0) {
            return null;
        }

        const moodleUser = usersResult[0];
        const wsRoleTokens = new Set();
        const wsRoleData = [];

        const userCourses = await callMoodle('core_enrol_get_users_courses', {
            userid: moodleUser.id
        });

        if (Array.isArray(userCourses) && userCourses.length > 0) {
            const courseIds = userCourses.map((course) => course.id).filter(Boolean).slice(0, 25);

            for (const courseId of courseIds) {
                const courseProfiles = await callMoodle('core_user_get_course_user_profiles', {
                    'userlist[0][userid]': moodleUser.id,
                    'userlist[0][courseid]': courseId
                });

                const profile = Array.isArray(courseProfiles) ? courseProfiles[0] : null;
                const profileRoles = Array.isArray(profile?.roles) ? profile.roles : [];

                for (const role of profileRoles) {
                    const normalized = normalizeRole(role.shortname || role.name);
                    if (!normalized) {
                        continue;
                    }
                    wsRoleTokens.add(normalized);
                    wsRoleData.push({
                        shortname: role.shortname || null,
                        name: role.name || null,
                        contextlevel: 50, // Course context
                        contextid: role.roleid || null,
                        courseid: courseId
                    });
                }
            }
        }

        const wsRoles = [...wsRoleTokens].sort((a, b) => getRolePriority(a) - getRolePriority(b));
        if (wsRoles.length > 0) {
            const roleData = { assignments: wsRoleData };
            await upsertRoleSnapshot({
                email,
                moodleUserId: moodleUser.id,
                roles: wsRoles,
                roleData,
                source: 'moodle-ws'
            });

            return {
                source: 'moodle-ws',
                moodleUserId: moodleUser.id,
                roles: wsRoles,
                roleData
            };
        }
    } catch (error) {
        console.warn('[LOGIN] Moodle API role fetch failed:', error.message);
    }

    try {
        const dbRoles = await getMoodleRolesFromDbByEmail(email);
        if (dbRoles) {
            return dbRoles;
        }
    } catch (error) {
        console.warn('[LOGIN] Moodle DB role fetch failed:', error.message);
    }

    const snapshot = await getRoleSnapshot(email);
    if (snapshot) {
        console.log(`[LOGIN] Falling back to cached role snapshot for ${email} (synced: ${snapshot.syncedAt})`);
        return snapshot;
    }

    console.warn('[LOGIN] Falling back to local role after Moodle API/DB/snapshot lookup failed');
    return null;
}

const users = [
    { id: 1, email: 'admin@scl.com', password: 'password', name: 'SCL Admin', role: 'admin' },
    { id: 2, email: 'student@scl.com', password: 'password', name: 'John Doe', role: 'student' }
];

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    
    try {
        const [rows] = await pool.query(
            'SELECT id, email, first_name, last_name, role FROM users WHERE email = ? AND password = ?', 
            [email, password]
        );
        
        if (rows.length > 0) {
            const user = rows[0];
            const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || email;
            const moodleRoleData = await getMoodleRolesByEmail(user.email, { preferSnapshot: false });
            const mergedRoles = mergeRoles(user.role, moodleRoleData?.roles || [], {
                forceManager: isProtectedManagementEmail(user.email)
            });
            const roleSeed = mergedRoles.length ? mergedRoles.join(',') : user.role;
            const roleContext = buildRoleContext(roleSeed, moodleRoleData?.roleData);

            // Student accounts must have at least one accepted application to sign in.
            const isStudentOnly = roleContext.hasStudent && !roleContext.hasManagement && !roleContext.hasTeaching;
            if (isStudentOnly) {
                const [acceptedApps] = await pool.query(
                    `SELECT id
                     FROM student_applications
                     WHERE email = ? AND application_status = 'accepted' AND is_deleted = FALSE
                     LIMIT 1`,
                    [user.email]
                );

                if (acceptedApps.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: 'Your application is not accepted yet. Please wait for admissions approval.'
                    });
                }
            }

            const token = 'Bearer ' + Buffer.from(`${user.id}:${user.email}`).toString('base64');
            activeSessions.set(token, user.id);
            res.json({ 
                success: true,
                token: token,
                user: { 
                    id: user.id, 
                    email: user.email, 
                    name: fullName,
                    role: roleContext.primaryRole || user.role,
                    roles: roleContext.roles,
                    roleContext: {
                        ...roleContext,
                        source: moodleRoleData?.source || 'local'
                    }
                } 
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        res.status(500).json({ success: false, message: 'Database error', error: error.message });
    }
});

app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [rows] = await pool.query(
            'SELECT id, email, first_name, last_name, role FROM users WHERE email = ? AND password = ?', 
            [email, password]
        );
        
        if (rows.length > 0) {
            const user = rows[0];
            const moodleRoleData = await getMoodleRolesByEmail(user.email, { preferSnapshot: false });
            const mergedRoles = mergeRoles(user.role, moodleRoleData?.roles || [], {
                forceManager: isProtectedManagementEmail(user.email)
            });
            const roleSeed = mergedRoles.length ? mergedRoles.join(',') : user.role;
            const roleContext = buildRoleContext(roleSeed, moodleRoleData?.roleData);

            // Student accounts must have at least one accepted application to sign in.
            const isStudentOnly = roleContext.hasStudent && !roleContext.hasManagement && !roleContext.hasTeaching;
            if (isStudentOnly) {
                const [acceptedApps] = await pool.query(
                    `SELECT id
                     FROM student_applications
                     WHERE email = ? AND application_status = 'accepted' AND is_deleted = FALSE
                     LIMIT 1`,
                    [user.email]
                );

                if (acceptedApps.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message: 'Your application is not accepted yet. Please wait for admissions approval.'
                    });
                }
            }

            console.log(`[LOGIN V1] User authenticated:`, { email: user.email, role: user.role });
            
            const accessToken = `token_${user.id}_${Date.now()}`;
            activeSessions.set(accessToken, user.id);
            res.json({ 
                success: true,
                tokens: {
                    accessToken: accessToken
                },
                user: { 
                    id: user.id, 
                    email: user.email, 
                    name: `${user.first_name} ${user.last_name}`.trim(),
                    role: roleContext.primaryRole || user.role,
                    roles: roleContext.roles,
                    roleContext: {
                        ...roleContext,
                        source: moodleRoleData?.source || 'local'
                    }
                } 
            });
        } else {
            console.log(`[LOGIN V1] Authentication failed for: ${email}`);
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('[LOGIN V1] Database error:', error.message);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

const changePasswordHandler = async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Email, current password, and new password are required'
        });
    }

    if (String(newPassword).length < 8) {
        return res.status(400).json({
            success: false,
            message: 'New password must be at least 8 characters long'
        });
    }

    if (currentPassword === newPassword) {
        return res.status(400).json({
            success: false,
            message: 'New password must be different from current password'
        });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id, password FROM users WHERE email = ? LIMIT 1',
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = rows[0];
        if (String(user.password || '') !== String(currentPassword)) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        const passwordHash = crypto.createHash('sha256').update(String(newPassword)).digest('hex');

        await pool.query(
            'UPDATE users SET password = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newPassword, passwordHash, user.id]
        );

        return res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('[CHANGE PASSWORD] Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to update password' });
    }
};

app.post('/api/change-password', changePasswordHandler);
app.post('/api/v1/auth/change-password', changePasswordHandler);

// Validate a stored access token — returns { valid: true } if the session is still
// alive on this server instance (i.e. the server has not restarted since login).
app.post('/api/v1/auth/verify', (req, res) => {
    const { token } = req.body || {};
    if (token && activeSessions.has(token)) {
        return res.json({ valid: true });
    }
    return res.json({ valid: false });
});

app.post('/api/sso/generate', async (req, res) => {
    const { email, redirect_url } = req.body;
    console.log(`[SSO] Generating token for ${email}...`, redirect_url ? `with redirect: ${redirect_url}` : '');
    
    // Get real user data from database instead of hardcoded array
    let user;
    try {
        const [rows] = await pool.query('SELECT id, email, first_name, last_name, role FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found in database' });
        }
        user = rows[0];
        console.log(`[SSO] Found user in database:`, { email: user.email, name: `${user.first_name} ${user.last_name}`, role: user.role });
    } catch (dbErr) {
        console.error('[SSO] Database error while fetching user:', dbErr.message);
        return res.status(500).json({ success: false, message: 'Database error while fetching user' });
    }

    const token = uuidv4();
    const firstname = user.first_name || 'SCL';
    const lastname = user.last_name || 'User';

    let ssoRole = user.role;
    try {
        const moodleRoleData = await getMoodleRolesByEmail(user.email, { preferSnapshot: false });
        const mergedRoles = mergeRoles(user.role, moodleRoleData?.roles || [], {
            forceManager: isProtectedManagementEmail(user.email)
        });
        const effectiveRoleContext = buildRoleContext(
            mergedRoles.length ? mergedRoles.join(',') : user.role,
            moodleRoleData?.roleData
        );

        // Protected admin accounts should always provision as Super Admin in Moodle SSO.
        if (isProtectedManagementEmail(user.email)) {
            ssoRole = 'Super Admin';
        } else {
            ssoRole = effectiveRoleContext.primaryRole || user.role;
        }
    } catch (roleErr) {
        console.warn('[SSO] Could not derive merged role for token:', roleErr.message);
        if (isProtectedManagementEmail(user.email)) {
            ssoRole = 'Super Admin';
        }
    }

    try {
        console.log(`[SSO] Inserting token into DB...`);
        await pool.query(
            'INSERT INTO sso_tokens (token, email, firstname, lastname, role, redirect_url) VALUES (?, ?, ?, ?, ?, ?)',
            [token, user.email, firstname, lastname, ssoRole, redirect_url || null]
        );
        const moodleUrl = process.env.MOODLE_EXTERNAL_URL || process.env.MOODLE_URL || 'http://localhost:8080';
        const redirectUrl = `${moodleUrl}/local/sclsso/login.php?token=${token}`;
        console.log(`[SSO] Token created. Redirect: ${redirectUrl}`);
        res.json({ success: true, redirectUrl });
    } catch (err) {
        console.error("[SSO] Generate Error:", err.message);
        res.status(500).json({ success: false, message: 'DB Error: ' + err.message });
    }
});

app.post('/api/sso/verify', async (req, res) => {
    const { token, secret } = req.body;
    if (secret !== (process.env.SSO_SECRET || 'supersecretkey')) {
        return res.status(403).json({ success: false, message: 'Invalid secret' });
    }

    const normalizedToken = token.replace(/-/g, '');
    try {
        const [rows] = await pool.query('SELECT * FROM sso_tokens');
        const tokenData = rows.find(r => r.token === token || r.token.replace(/-/g, '') === normalizedToken);

        if (tokenData) {
            await pool.query('DELETE FROM sso_tokens WHERE token = ?', [tokenData.token]);
            res.json({ success: true, user: tokenData });
        } else {
            res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }
    } catch (err) {
        console.error("[SSO] Verify Error:", err.message);
        res.status(500).json({ success: false, message: 'DB Error' });
    }
});

app.post('/api/sso/role-sync', async (req, res) => {
    const { email, moodle_user_id, roles, role_data, secret } = req.body;
    
    if (secret !== (process.env.SSO_SECRET || 'supersecretkey')) {
        return res.status(403).json({ success: false, message: 'Invalid secret' });
    }

    if (!email || !roles) {
        return res.status(400).json({ success: false, message: 'Email and roles required' });
    }

    try {
        const rolesString = Array.isArray(roles) ? roles.join(',') : String(roles);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        
        await pool.query(`
            INSERT INTO user_role_snapshots (email, moodle_user_id, roles, role_data, synced_at, expires_at, source)
            VALUES (?, ?, ?, ?, NOW(), ?, 'moodle')
            ON DUPLICATE KEY UPDATE
                moodle_user_id = VALUES(moodle_user_id),
                roles = VALUES(roles),
                role_data = VALUES(role_data),
                synced_at = NOW(),
                expires_at = VALUES(expires_at),
                source = 'moodle'
        `, [email, moodle_user_id || null, rolesString, role_data ? JSON.stringify(role_data) : null, expiresAt]);
        
        console.log(`[SSO ROLE SYNC] Updated role snapshot for ${email}: ${rolesString}`);
        res.json({ success: true, message: 'Role snapshot updated' });
    } catch (err) {
        console.error('[SSO ROLE SYNC] Error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to update role snapshot' });
    }
});


// ====== NOTIFICATIONS ENDPOINTS ======
// GET /api/notifications/user/:email - Get notifications for user
app.get('/api/notifications/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        // Return empty array if notifications table doesn't exist or for now
        res.json([]);
    } catch (err) {
        console.error('[NOTIFICATIONS] Error:', err.message);
        res.json([]);
    }
});

// GET /api/notifications/unread-count/:email - Get unread count for user
app.get('/api/notifications/unread-count/:email', async (req, res) => {
    try {
        const { email } = req.params;
        // Return 0 unread count for now
        res.json({ unread_count: 0 });
    } catch (err) {
        console.error('[UNREAD COUNT] Error:', err.message);
        res.json({ unread_count: 0 });
    }
});

// ====== STUDENT APPLICATIONS ENDPOINTS ======
// GET /api/students/applications - Get all student applications
app.get('/api/students/applications', async (req, res) => {
    try {
        // Try to get applications from student_applications table
        const [applications] = await db.execute(
            `SELECT * FROM student_applications LIMIT 100`
        );
        
        // Transform results to generate reference numbers
        const transformedApplications = (applications || []).map(app => {
            const refNum = app.application_reference || `SCL${String(app.id).padStart(6, '0')}`;
            return {
                ...app,
                reference_number: refNum,
                application_reference: refNum
            };
        });
        
        res.json({
            success: true,
            data: {
                applications: transformedApplications
            }
        });
    } catch (err) {
        console.error('[STUDENT APPLICATIONS] Error:', err.message);
        // Return empty array if table doesn't exist yet
        res.json({
            success: true,
            data: {
                applications: []
            }
        });
    }
});

// GET /api/students/applications/:id - Get single application by ID
app.get('/api/students/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [results] = await db.execute(
            `SELECT * FROM student_applications WHERE id = ? AND is_deleted = FALSE`,
            [id]
        );
        
        if (!results || results.length === 0) {
            return res.json({
                success: false,
                data: null,
                error: 'Application not found'
            });
        }
        
        const app = results[0];
        const refNum = app.application_reference || `SCL${String(app.id).padStart(6, '0')}`;
        
        const transformedApp = {
            ...app,
            reference_number: refNum,
            application_reference: refNum
        };
        
        res.json({
            success: true,
            data: {
                application: transformedApp
            }
        });
    } catch (err) {
        console.error('[GET APPLICATION] Error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch application'
        });
    }
});

// GET /api/students/applications/:id/review - Get review status for an application
app.get('/api/students/applications/:id/review', async (req, res) => {
    try {
        const { id } = req.params;
        // For now, return null review data (can be extended later)
        res.json({
            success: true,
            data: null
        });
    } catch (err) {
        console.error('[REVIEW STATUS] Error:', err.message);
        res.json({
            success: true,
            data: null
        });
    }
});

// Background role sync — every 5 minutes, refresh Moodle role snapshots for all users
// so that Moodle admin changes (role/enrolment) propagate automatically without requiring re-login.
setInterval(async () => {
    try {
        const result = await syncAllUserRoleSnapshots();
        console.log(`[ROLE SYNC] Background sync complete: ${result.successCount}/${result.totalUsers} users refreshed`);
    } catch (e) {
        if (e.message !== 'Role sync already in progress') {
            console.error('[ROLE SYNC] Background sync error:', e.message);
        }
    }
}, 5 * 60 * 1000); // every 5 minutes

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
});