const mysql = require('mysql2/promise');

(async () => {
    try {
        const pool = mysql.createPool({
            host: 'scli-mysql-prod',
            user: 'scl_user',
            password: 'scl_password',
            database: 'scl_institute'
        });
        
        const [rows] = await pool.query(
            "SELECT id, email, password, role FROM users WHERE role LIKE '%admin%' OR role LIKE '%Admin%' LIMIT 10"
        );
        
        console.log(JSON.stringify(rows, null, 2));
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();
