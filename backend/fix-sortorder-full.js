const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost', port: 3306, user: 'moodleuser', password: 'moodlepass', database: 'moodle'
  });

  console.log('Connected\n');

  // Moodle uses a recursive sort approach where:
  // - Categories are sorted by sortorder
  // - Children must have sortorder BETWEEN parent and the next category at parent's level
  // We need to rebuild sortorder for the entire tree properly

  // Get all categories ordered by parent hierarchy
  const [all] = await conn.execute(
    'SELECT id, name, parent, depth, path FROM mdl_course_categories ORDER BY parent, id'
  );

  // Build tree
  const byParent = {};
  for (const cat of all) {
    if (!byParent[cat.parent]) byParent[cat.parent] = [];
    byParent[cat.parent].push(cat);
  }

  // Recursively assign sortorder
  let counter = 10000;
  const updates = [];

  function assignSort(parentId) {
    const children = byParent[parentId] || [];
    for (const child of children) {
      updates.push({ id: child.id, name: child.name, sortorder: counter });
      counter += 10000;
      // Process children BEFORE moving to next sibling
      assignSort(child.id);
    }
  }

  assignSort(0); // Start from root

  // Also fix theme NULL vs empty string
  console.log('Rebuilding sortorder for all categories:\n');
  for (const upd of updates) {
    await conn.execute(
      'UPDATE mdl_course_categories SET sortorder = ?, theme = NULL WHERE id = ?',
      [upd.sortorder, upd.id]
    );
    console.log(`  [${upd.id}] ${upd.name.padEnd(50)} sortorder = ${upd.sortorder}`);
  }

  // Verify jjj hierarchy
  console.log('\n\n=== Verification ===');
  const [verify] = await conn.execute(
    'SELECT id, name, parent, sortorder, depth FROM mdl_course_categories WHERE id IN (144,145,146,147) ORDER BY sortorder'
  );
  console.table(verify);

  // Clear Moodle caches
  await conn.execute('DELETE FROM mdl_cache_flags');
  try { await conn.execute('TRUNCATE TABLE mdl_cache_filters'); } catch(_) {}
  
  // Update allversionshash to force cache rebuild
  const newHash = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  await conn.execute("UPDATE mdl_config SET value = ? WHERE name = 'allversionshash'", [newHash]);
  console.log('\nMoodle caches cleared');

  await conn.end();
  console.log('\n✅ Done! Refresh Moodle course management page.');
})();
