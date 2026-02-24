const mysql = require('mysql2/promise');

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 33061,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'scl_institute',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

module.exports = pool;
