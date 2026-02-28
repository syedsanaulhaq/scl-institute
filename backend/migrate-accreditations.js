require('dotenv').config();
const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    let connection;
    try {
        console.log('[MIGRATION] Starting accreditation tables migration...');
        connection = await pool.getConnection();
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, '..', 'create-accreditation-tables.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
        
        // Split by semicolon and execute each statement
        const statements = sqlContent.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                console.log('[MIGRATION] Executing:', statement.substring(0, 50) + '...');
                await connection.query(statement);
            }
        }
        
        console.log('[MIGRATION] ✅ Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('[MIGRATION] ❌ Error:', err.message);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

runMigration();
