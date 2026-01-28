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

app.use(cors());
app.use(bodyParser.json());

// Import routes
const studentRoutes = require('./routes/students');

// Use routes
app.use('/api/students', studentRoutes);

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

const users = [
    { id: 1, email: 'admin@scl.com', password: 'password', name: 'SCL Admin', role: 'admin' },
    { id: 2, email: 'student@scl.com', password: 'password', name: 'John Doe', role: 'student' }
];

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        const accessToken = `mock_access_token_${Date.now()}`;
        const refreshToken = `mock_refresh_token_${Date.now()}`;
        res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, tokens: { accessToken, refreshToken } });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.post('/api/sso/generate', async (req, res) => {
    const { email } = req.body;
    console.log(`[SSO] Generating token for ${email}...`);
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = uuidv4();
    const firstname = user.name.split(' ')[0];
    const lastname = user.name.split(' ')[1] || '';

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
