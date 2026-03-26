const mysql = require('mysql2/promise');
(async () => {
  const c = await mysql.createConnection({
    host: process.env.MOODLE_DATABASE_HOST,
    port: Number(process.env.MOODLE_DATABASE_PORT || 3306),
    user: process.env.MOODLE_DATABASE_USER,
    password: process.env.MOODLE_DATABASE_PASSWORD,
    database: process.env.MOODLE_DATABASE_NAME
  });
  const [rows] = await c.execute(
    `SELECT c.id, c.name, c.idnumber, c.parent, p.name AS parent_name, c.depth, c.path
     FROM mdl_course_categories c
     LEFT JOIN mdl_course_categories p ON p.id = c.parent
     WHERE c.name IN ('test program type','test program','year-1','semester-1')
        OR c.idnumber LIKE 'TES%'
     ORDER BY c.id ASC`
  );
  console.log(JSON.stringify(rows, null, 2));
  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
