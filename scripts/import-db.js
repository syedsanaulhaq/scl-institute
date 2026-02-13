const mysql = require('mysql2/promise');
const fs = require('fs');

(async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'scli-mysql-prod',
            user: 'scl_user',
            password: 'scl_password',
            database: 'scl_institute',
            multipleStatements: true
        });
        
        console.log('Reading SQL file...');
        const sql = fs.readFileSync('/tmp/backup.sql', 'utf8');
        
        console.log('Importing database...');
        await connection.query(sql);
        
        console.log('✅ Database import successful!');
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Import failed:', err.message);
        process.exit(1);
    }
})();
