const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost', port: 3306, user: 'moodleuser', password: 'moodlepass', database: 'moodle'
  });

  console.log('Connected to Moodle DB\n');

  // Get the current max sortorder
  const [[{ maxSort }]] = await conn.execute('SELECT MAX(sortorder) as maxSort FROM mdl_course_categories');
  console.log('Current max sortorder:', maxSort);

  // Get our new categories that have sortorder = 1 (the broken ones)
  const [broken] = await conn.execute(
    'SELECT id, name, parent, depth, path, sortorder FROM mdl_course_categories WHERE sortorder <= 1 ORDER BY depth, id'
  );

  if (broken.length === 0) {
    console.log('No categories with broken sortorder found');
    await conn.end();
    return;
  }

  console.log(`\nFound ${broken.length} categories with sortorder=1:`);
  console.table(broken);

  // Fix sortorder: assign proper values based on hierarchy
  // Each category needs a unique sortorder, children should come after parents
  let nextSort = Math.ceil((maxSort + 10000) / 10000) * 10000;

  for (const cat of broken) {
    await conn.execute('UPDATE mdl_course_categories SET sortorder = ? WHERE id = ?', [nextSort, cat.id]);
    console.log(`  Fixed: ${cat.name} (id=${cat.id}) -> sortorder=${nextSort}`);
    nextSort += 10000;
  }

  // Now call Moodle's context fix - update the context table too
  // Moodle also needs context records for categories
  const [contexts] = await conn.execute(
    `SELECT c.id, c.contextlevel, c.instanceid, c.path as ctx_path, c.depth as ctx_depth 
     FROM mdl_context c 
     WHERE c.contextlevel = 40 AND c.instanceid IN (${broken.map(b => b.id).join(',')})
     ORDER BY c.instanceid`
  );
  console.log('\nContext records for these categories:');
  console.table(contexts);

  // If any categories are missing context records, create them
  for (const cat of broken) {
    const hasContext = contexts.find(c => c.instanceid === cat.id);
    if (!hasContext) {
      console.log(`  Creating missing context for category ${cat.name} (id=${cat.id})`);
      await conn.execute(
        'INSERT INTO mdl_context (contextlevel, instanceid, depth, path) VALUES (40, ?, 0, NULL)',
        [cat.id]
      );
    }
  }

  // Verify
  const [fixed] = await conn.execute(
    `SELECT id, name, parent, depth, path, sortorder FROM mdl_course_categories WHERE id IN (${broken.map(b => b.id).join(',')}) ORDER BY sortorder`
  );
  console.log('\nFixed categories:');
  console.table(fixed);

  await conn.end();
  console.log('\n✅ Sort order fixed! Moodle should now display hierarchy correctly.');
  console.log('You may need to purge Moodle caches: Site Admin > Development > Purge all caches');
})();
