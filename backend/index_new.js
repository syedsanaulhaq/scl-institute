require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

console.log("Backend process starting...");

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

const app = express();
const PORT = process.env.PORT || 4000;

// Database Connection Definition
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 33061,
    user: process.env.DB_USER,
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
        'http://localhost:5173',
        'http://localhost:8080',
        'http://103.93.57.101:3000',
        'http://103.93.57.101:5173',
        'http://103.93.57.101:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
            SELECT a.*, p.name as program_name, p.code as program_code
            FROM applications a
            LEFT JOIN programs p ON a.program_id = p.id
            ORDER BY a.created_at DESC
        `;
        
        const [results] = await db.execute(query);
        res.json(results);
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
        
        const query = 'DELETE FROM applications WHERE id = ?';
        const [result] = await db.execute(query, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        res.json({ message: 'Application deleted successfully' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ error: 'Failed to delete application' });
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

// ===============================
// AUTHENTICATION ROUTES
// ===============================

const users = [
    { id: 1, email: 'admin@scl.com', password: 'password', name: 'SCL Admin', role: 'admin' },
    { id: 2, email: 'student@scl.com', password: 'password', name: 'John Doe', role: 'student' }
];

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Get user from database instead of hardcoded array
        const [rows] = await pool.query(
            'SELECT id, email, first_name, last_name, role FROM users WHERE email = ? AND password = ?', 
            [email, password]
        );
        
        if (rows.length > 0) {
            const user = rows[0];
            console.log(`[LOGIN] User authenticated:`, { email: user.email, role: user.role });
            res.json({ 
                success: true, 
                user: { 
                    id: user.id, 
                    email: user.email, 
                    name: `${user.first_name} ${user.last_name}`.trim(),
                    role: user.role 
                } 
            });
        } else {
            console.log(`[LOGIN] Authentication failed for: ${email}`);
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('[LOGIN] Database error:', error.message);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

app.post('/api/sso/generate', async (req, res) => {
    const { email } = req.body;
    console.log(`[SSO] Generating token for ${email}...`);
    
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

    try {
        console.log(`[SSO] Inserting token into DB...`);
        await pool.query(
            'INSERT INTO sso_tokens (token, email, firstname, lastname, role) VALUES (?, ?, ?, ?, ?)',
            [token, user.email, firstname, lastname, user.role]
        );
        const moodleUrl = process.env.MOODLE_URL || 'http://localhost:8080';
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
});