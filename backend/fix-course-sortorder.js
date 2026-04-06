const mysql = require('mysql2/promise');

(async () => {
  const db = await mysql.createConnection({
    host: 'localhost', port: 3306,
    user: 'moodleuser', password: 'moodlepass', database: 'moodle'
  });

  // Fix sortorder for courses in category 147 (Semester-1, sortorder=350000)
  const catSortorder = 350000;
  await db.query('UPDATE mdl_course SET sortorder = ? WHERE id = 154', [catSortorder + 10001]);
  await db.query('UPDATE mdl_course SET sortorder = ? WHERE id = 155', [catSortorder + 10002]);
  console.log('Fixed course sortorders: 154=360001, 155=360002');

  // Update category coursecount
  const [countRes] = await db.query('SELECT COUNT(*) as cnt FROM mdl_course WHERE category = 147');
  await db.query('UPDATE mdl_course_categories SET coursecount = ? WHERE id = 147', [countRes[0].cnt]);
  console.log('Updated Semester-1 coursecount to', countRes[0].cnt);

  // Create context records for courses (contextlevel=50)
  // Parent context for category 147 is /1/391/392/393/394 (depth 5)
  const parentPath = '/1/391/392/393/394';
  const parentDepth = 5;

  for (const courseId of [154, 155]) {
    const [existing] = await db.query(
      'SELECT id FROM mdl_context WHERE instanceid=? AND contextlevel=50', [courseId]
    );
    if (existing.length === 0) {
      const [ins] = await db.query(
        'INSERT INTO mdl_context (contextlevel, instanceid, depth, locked) VALUES (50, ?, ?, 0)',
        [courseId, parentDepth + 1]
      );
      const ctxId = ins.insertId;
      await db.query('UPDATE mdl_context SET path = ? WHERE id = ?', [parentPath + '/' + ctxId, ctxId]);
      console.log('Created context for course', courseId, '-> ctx id', ctxId, 'path', parentPath + '/' + ctxId);
    } else {
      console.log('Context already exists for course', courseId);
    }
  }

  // Purge caches
  await db.query('DELETE FROM mdl_cache_flags');
  await db.query('DELETE FROM mdl_cache_filters');
  const ts = Math.floor(Date.now() / 1000).toString();
  await db.query("UPDATE mdl_config SET value = ? WHERE name = 'allversionshash'", [ts]);
  console.log('Caches purged');

  // Verify
  const [verify] = await db.query('SELECT id, fullname, category, sortorder FROM mdl_course WHERE id IN (154,155)');
  console.table(verify);
  const [ctxVerify] = await db.query('SELECT * FROM mdl_context WHERE instanceid IN (154,155) AND contextlevel=50');
  console.table(ctxVerify);

  await db.end();
  console.log('Done!');
})();
