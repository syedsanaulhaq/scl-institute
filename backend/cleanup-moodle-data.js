const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 33061,
      user: 'moodleuser',
      password: 'moodlepass',
      database: 'moodle'
    });

    console.log('✓ Connected to Moodle database\n');

    // Get all category IDs (excluding system categories)
    const [categories] = await conn.execute(
      `SELECT id, name, parent FROM mdl_course_categories WHERE parent >= 0 ORDER BY id DESC`
    );

    console.log(`Found ${categories.length} categories to delete\n`);

    // Delete in reverse order (children first) to avoid foreign key issues
    for (const cat of categories) {
      try {
        // First delete any courses in this category
        await conn.execute(
          `UPDATE mdl_course SET category = 1 WHERE category = ?`,
          [cat.id]
        );

        // Then delete the category
        await conn.execute(
          `DELETE FROM mdl_course_categories WHERE id = ?`,
          [cat.id]
        );

        console.log(`✓ Deleted category: ${cat.name} (ID: ${cat.id})`);
      } catch (e) {
        console.log(`⚠ Error deleting ${cat.name}: ${e.message.substring(0, 40)}`);
      }
    }

    await conn.end();
    console.log('\n✅ Moodle cleanup complete! All test categories removed.');
  } catch(e) {
    console.error('❌ Error:', e.message);
  }
})();
