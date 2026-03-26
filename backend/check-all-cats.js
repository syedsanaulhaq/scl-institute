const mysql = require('mysql2/promise');
(async () => {
  const c = await mysql.createConnection({
    host: process.env.MOODLE_DATABASE_HOST,
    port: Number(process.env.MOODLE_DATABASE_PORT || 3306),
    user: process.env.MOODLE_DATABASE_USER,
    password: process.env.MOODLE_DATABASE_PASSWORD,
    database: process.env.MOODLE_DATABASE_NAME
  });
  // Get ALL categories to see the full picture
  const [rows] = await c.execute(
    `SELECT id, name, idnumber, parent, depth, path
     FROM mdl_course_categories
     ORDER BY depth ASC, parent ASC, id ASC`
  );
  console.log(JSON.stringify(rows, null, 2));
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
