const mysql = require('mysql2/promise');

(async () => {
  // Try different connection configs
  const configs = [
    { host: 'localhost', port: 33063, user: 'root', password: 'root', database: 'moodle' },
    { host: 'localhost', port: 3306, user: 'moodleuser', password: 'moodlepass', database: 'moodle' },
    { host: 'localhost', port: 33061, user: 'root', password: 'root', database: 'moodle' },
  ];
  
  let conn;
  for (const cfg of configs) {
    try {
      conn = await mysql.createConnection(cfg);
      console.log(`Connected via port ${cfg.port} user ${cfg.user}`);
      break;
    } catch (e) {
      console.log(`Failed port ${cfg.port} user ${cfg.user}: ${e.code || e.message}`);
    }
  }
  
  if (!conn) {
    console.error('Could not connect to Moodle DB');
    process.exit(1);
  }

  const [rows] = await conn.execute(
    'SELECT id, name, parent, depth, path, sortorder, visible FROM mdl_course_categories ORDER BY sortorder'
  );
  console.table(rows);
  
  await conn.end();
})();
