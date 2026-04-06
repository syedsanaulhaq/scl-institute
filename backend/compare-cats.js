const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost', port: 3306, user: 'moodleuser', password: 'moodlepass', database: 'moodle'
  });

  // Compare a WORKING category (Degree id=2, child id=10) with broken ones (jjj id=144, child id=145)
  const [rows] = await conn.execute(
    `SELECT * FROM mdl_course_categories WHERE id IN (2, 3, 10, 11, 144, 145, 146, 147) ORDER BY id`
  );

  for (const row of rows) {
    console.log(`\n=== [${row.id}] ${row.name} ===`);
    for (const [key, val] of Object.entries(row)) {
      if (key === 'description') continue; // skip long text
      console.log(`  ${key.padEnd(20)} = ${val}`);
    }
  }

  // Also check mdl_context for these
  console.log('\n\n=== CONTEXT RECORDS ===');
  const [ctxRows] = await conn.execute(
    `SELECT * FROM mdl_context WHERE contextlevel = 40 AND instanceid IN (2, 3, 10, 11, 144, 145, 146, 147) ORDER BY instanceid`
  );
  for (const row of ctxRows) {
    console.log(`\nContext for cat ${row.instanceid}:`);
    for (const [key, val] of Object.entries(row)) {
      console.log(`  ${key.padEnd(20)} = ${val}`);
    }
  }

  await conn.end();
})();
