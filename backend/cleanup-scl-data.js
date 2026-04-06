const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 33061,
      user: 'scl_user',
      password: 'scl_password',
      database: 'scl_institute'
    });

    console.log('✓ Connected to SCL database\n');

    const tables = [
      'scl_local_categories',
      'course_lifecycle_master',
      'course_accreditations',
      'course_visits',
      'course_inductions',
      'course_registrations'
    ];

    for (const table of tables) {
      try {
        await conn.execute(`DELETE FROM ${table}`);
        const [[result]] = await conn.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✓ Cleared ${table.padEnd(25)} (${result.count} rows remaining)`);
      } catch (e) {
        if (e.code === 'ER_NO_SUCH_TABLE') {
          console.log(`⚠ Table ${table.padEnd(25)} does not exist`);
        } else {
          console.log(`⚠ Error on ${table.padEnd(25)}: ${e.message.substring(0, 40)}`);
        }
      }
    }

    await conn.end();
    console.log('\n✅ Cleanup complete! All test data removed from SCL database.');
  } catch(e) {
    console.error('❌ Connection error:', e.message);
  }
})();
