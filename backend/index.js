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

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    });
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body));
    }
    next();
});

app.use(cors());
app.use(bodyParser.json());

// Database Connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 33061,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Create Tokens Table on Startup
async function initDB() {
    try {
        const connection = await pool.getConnection();
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
        console.log("SSO Tokens table initialized");
        connection.release();
    } catch (err) {
        console.error("DB Init Failed:", err);
        setTimeout(initDB, 5000); // Retry
    }
}
initDB();

// Mock User DB
const users = [
    { id: 1, email: 'admin@scl.com', password: 'password', name: 'SCL Admin', role: 'admin' },
    { id: 2, email: 'student@scl.com', password: 'password', name: 'John Doe', role: 'student' }
];

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({
            success: true,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// V1 Auth Login Endpoint (for frontend compatibility)
app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        console.log(`[AUTH] Login successful for: ${email}`);
        // Generate mock tokens
        const accessToken = `mock_access_token_${Date.now()}`;
        const refreshToken = `mock_refresh_token_${Date.now()}`;

        res.json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            tokens: { accessToken, refreshToken }
        });
    } else {
        console.log(`[AUTH] Login failed for: ${email}`);
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Generate SSO Token Endpoint
app.post('/api/sso/generate', async (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = uuidv4();
    const firstname = user.name.split(' ')[0];
    const lastname = user.name.split(' ')[1] || '';

    try {
        await pool.query(
            'INSERT INTO sso_tokens (token, email, firstname, lastname, role) VALUES (?, ?, ?, ?, ?)',
            [token, user.email, firstname, lastname, user.role]
        );
        console.log(`[SSO] Created token in DB: ${token} for ${email}`);

        const moodleUrl = process.env.MOODLE_URL || 'http://localhost:8080';
        const redirectUrl = `${moodleUrl}/local/sclsso/login.php?token=${token}`;

        res.json({ success: true, redirectUrl });
    } catch (err) {
        console.error("Token Generate Error:", err);
        res.status(500).json({ success: false, message: 'DB Error' });
    }
});

// Verify SSO Token Endpoint (Called by Moodle)
app.post('/api/sso/verify', async (req, res) => {
    const { token, secret } = req.body;

    if (secret !== (process.env.SSO_SECRET || 'supersecretkey')) {
        return res.status(403).json({ success: false, message: 'Invalid secret' });
    }

    const normalizedToken = token.replace(/-/g, '');
    console.log(`[SSO] Verifying token: ${token} (normalized: ${normalizedToken})`);

    try {
        // Find token by exact match or normalized match
        const [rows] = await pool.query('SELECT * FROM sso_tokens');
        const tokenData = rows.find(r => r.token === token || r.token.replace(/-/g, '') === normalizedToken);

        if (tokenData) {
            await pool.query('DELETE FROM sso_tokens WHERE token = ?', [tokenData.token]); // One-time use via DB

            console.log(`[SSO] Verified token successfully: ${tokenData.token}`);
            res.json({ success: true, user: tokenData });
        } else {
            console.log(`[SSO] Token not found: ${token}`);
            res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }
    } catch (err) {
        console.error("Token Verify Error:", err);
        res.status(500).json({ success: false, message: 'DB Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
