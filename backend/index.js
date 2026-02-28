require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const path = require('path');
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
const pool = require('./db');

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
                redirect_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("[DB] SSO Tokens table verified/created");
        connection.release();
    } catch (err) {
        console.error("[DB] Init Failed:", err.message);
        setTimeout(initDB, 5000); // Retry
    }
}
initDB();

// Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// CORS configuration - allow all origins and credentials
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        // Allow all origins for development/production
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Total-Count', 'X-Page-Count'],
    optionsSuccessStatus: 200
}));

app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/documents', express.static(path.join(__dirname, 'public', 'documents')));

// Import routes
const studentRoutes = require('./routes/students');
const moodleRoutes = require('./routes/moodle');
const { router: notificationsRouter } = require('./routes/notifications');
const supportRoutes = require('./routes/support');
const inductionRoutes = require('./routes/inductions');

// Use routes
app.use('/api/students', studentRoutes);
app.use('/api/moodle', moodleRoutes);
app.use('/api/notifications', notificationsRouter);
app.use('/api/support', supportRoutes);
app.use('/api/inductions', inductionRoutes);

// Routes
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
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role 
                } 
            });
        } else {
            console.log(`[LOGIN] Failed login attempt for: ${email}`);
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (dbErr) {
        console.error('[LOGIN] Database error:', dbErr.message);
        res.status(500).json({ success: false, message: 'Database error during authentication' });
    }
});

app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log(`[LOGIN] Received email: "${email}", password: "${password}"`);
    console.log(`[LOGIN] Body keys:`, Object.keys(req.body));

    try {
        console.log(`[LOGIN] Querying database with email="${email}" password="${password}"`);
        const [rows] = await pool.query(
            'SELECT id, email, first_name, last_name, role FROM users WHERE email = ? AND password = ?',
            [email, password]
        );
        
        console.log(`[LOGIN] Query returned ${rows.length} rows`);

        if (rows.length > 0) {
            const user = rows[0];
            console.log(`[LOGIN] User authenticated: ${user.email} (ID: ${user.id})`);
            const accessToken = `mock_access_token_${Date.now()}`;
            const refreshToken = `mock_refresh_token_${Date.now()}`;

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: `${user.first_name} ${user.last_name}`.trim(),
                    role: user.role
                },
                tokens: { accessToken, refreshToken }
            });
        } else {
            console.log(`[LOGIN] No user found for email="${email}" with password="${password}"`);
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (dbErr) {
        console.error('[LOGIN V1] Database error:', dbErr.message);
        console.error('[LOGIN V1] Stack:', dbErr.stack);
        res.status(500).json({ message: 'Database error during authentication' });
    }
});

app.post('/api/sso/generate', async (req, res) => {
    const { email, redirect_to } = req.body;
    console.log(`[SSO] Generating token for ${email}...`);
    console.log(`[SSO] Request body:`, req.body);
    console.log(`[SSO] Pool available:`, !!pool);
    
    // Validate email first
    if (!email) {
        console.error('[SSO] Email not provided in request');
        return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    // Get real user data from database instead of hardcoded array
    let user;
    try {
        console.log(`[SSO] Attempting pool.query with email: ${email}`);
        const query = 'SELECT id, email, first_name, last_name, role FROM users WHERE email = ?';
        console.log(`[SSO] Query: ${query}, params: [${email}]`);
        const [rows] = await pool.query(query, [email]);
        console.log(`[SSO] Query result count:`, rows.length);
        console.log(`[SSO] Query result:`, rows);
        if (rows.length === 0) {
            console.log(`[SSO] User not found for email: ${email}`);
            return res.status(404).json({ success: false, message: 'User not found in database' });
        }
        user = rows[0];
        console.log(`[SSO] Found user in database:`, { email: user.email, name: `${user.first_name} ${user.last_name}`, role: user.role });
    } catch (dbErr) {
        console.error('[SSO] Database error while fetching user:', dbErr.message);
        console.error('[SSO] Error stack:', dbErr.stack);
        return res.status(500).json({ success: false, message: 'Database error while fetching user', error: dbErr.message });
    }

    const token = uuidv4();
    const firstname = user.first_name || 'SCL';
    const lastname = user.last_name || 'User';

    try {
        console.log(`[SSO] Inserting token into DB...`);
        await pool.query(
            'INSERT INTO sso_tokens (token, email, firstname, lastname, role, redirect_url) VALUES (?, ?, ?, ?, ?, ?)',
            [token, user.email, firstname, lastname, user.role, redirect_to || null]
        );
        const moodleUrl = process.env.MOODLE_URL || 'http://localhost:9090';
        let redirectUrl = `${moodleUrl}/local/sclsso/login.php?token=${token}`;
        
        // Log the redirect if provided
        if (redirect_to) {
            console.log(`[SSO] Token includes redirect to: ${redirect_to}`);
        }
        
        console.log(`[SSO] Token created. Final Redirect URL: ${redirectUrl}`);
        res.json({ success: true, redirectUrl });
    } catch (err) {
        console.error("[SSO] Generate Error:", err.message);
        res.status(500).json({ success: false, message: 'DB Error: ' + err.message });
    }
});

app.post('/api/sso/verify', async (req, res) => {
    const { token, secret } = req.body;
    console.log('[SSO] Verify request received:', { token: token?.substring(0, 10) + '...', secret: secret, bodyKeys: Object.keys(req.body) });
    if (secret !== (process.env.SSO_SECRET || 'supersecretkey')) {
        console.log('[SSO] Secret mismatch. Received:', secret, 'Expected:', process.env.SSO_SECRET || 'supersecretkey');
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
