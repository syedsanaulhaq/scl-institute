const mysql = require('mysql2/promise');
const crypto = require('crypto');

(async () => {
  const scl = mysql.createPool({
    host: process.env.DB_HOST, port: process.env.DB_PORT,
    user: process.env.DB_USER, password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });
  const moodle = mysql.createPool({
    host: process.env.MOODLE_DATABASE_HOST, port: process.env.MOODLE_DATABASE_PORT,
    user: process.env.MOODLE_DATABASE_USER, password: process.env.MOODLE_DATABASE_PASSWORD,
    database: process.env.MOODLE_DATABASE_NAME
  });

  // Get all active Moodle users with their highest role
  const [moodleUsers] = await moodle.query(`
    SELECT u.id, u.firstname, u.lastname, u.email,
           COALESCE(MIN(r.shortname), 'student') as role
    FROM mdl_user u
    LEFT JOIN mdl_role_assignments ra ON ra.userid = u.id
    LEFT JOIN mdl_role r ON r.id = ra.roleid
    WHERE u.deleted = 0 AND u.id > 1 AND u.email != ''
    GROUP BY u.id
  `);

  const [sclUsers] = await scl.query('SELECT email FROM users');
  const sclEmails = new Set(sclUsers.map(u => u.email.toLowerCase()));

  const missing = moodleUsers.filter(u => u.email && !sclEmails.has(u.email.toLowerCase()));
  console.log('Moodle users: ' + moodleUsers.length);
  console.log('SCL users: ' + sclUsers.length);
  console.log('Missing from SCL: ' + missing.length);

  if (missing.length === 0) {
    console.log('All Moodle users already exist in SCL DB. Nothing to do.');
    await scl.end(); await moodle.end();
    return;
  }

  const dummyHash = crypto.createHash('sha256').update('moodle-synced-' + Date.now()).digest('hex');
  let created = 0;

  for (const u of missing) {
    try {
      await scl.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [u.email.toLowerCase(), dummyHash, u.firstname || '', u.lastname || '', u.role || 'student', 1]
      );
      console.log('  + ' + u.firstname + ' ' + u.lastname + ' (' + u.email + ') role=' + u.role);
      created++;
    } catch (err) {
      console.error('  FAILED: ' + u.email + ' - ' + err.message);
    }
  }

  console.log('Done. Created ' + created + '/' + missing.length + ' users in SCL DB from Moodle.');
  await scl.end(); await moodle.end();
})();
