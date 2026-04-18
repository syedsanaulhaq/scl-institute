const mysql = require('./backend/node_modules/mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '33062'),
        user: process.env.DB_USER || 'scl_user',
        password: process.env.DB_PASS || 'scl_password',
        database: process.env.DB_NAME || 'scl_institute',
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0
    });

    try {
        const connection = await pool.getConnection();
        console.log('✓ Connected to database');
        
        // Read the main schema file
        const schemaPath = path.join(__dirname, 'data', 'mysql', '000-init.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = schema.split(';').map(s => s.trim()).filter(s => s && !s.startsWith('--'));
        
        for (const statement of statements) {
            try {
                await connection.query(statement);
            } catch (err) {
                if (!err.message.includes('already exists')) {
                    console.error('✗ Error executing statement:', err.message);
                    console.error('Statement:', statement.substring(0, 100));
                }
            }
        }
        
        console.log('✓ Database initialization complete');
        connection.release();
        await pool.end();
    } catch (err) {
        console.error('✗ Database initialization failed:', err.message);
        process.exit(1);
    }
}

initDatabase();
