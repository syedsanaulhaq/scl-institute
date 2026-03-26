<?php
define('CLI_SCRIPT', true);
require_once('/var/www/html/e-learning/config.php');

// Fix depth and path for all nested categories
echo "Fixing category depths and paths...\n";
$DB->execute("
    UPDATE mdl_course_categories cc1
    INNER JOIN mdl_course_categories cc2 ON cc2.id = cc1.parent
    SET cc1.depth = cc2.depth + 1,
        cc1.path = CONCAT(cc2.path, '/', cc1.id)
    WHERE cc1.parent != 0
");
echo "Multi-level fix pass 1 done\n";

// Run again for deeper nesting (4 levels)
$DB->execute("
    UPDATE mdl_course_categories cc1
    INNER JOIN mdl_course_categories cc2 ON cc2.id = cc1.parent
    SET cc1.depth = cc2.depth + 1,
        cc1.path = CONCAT(cc2.path, '/', cc1.id)
    WHERE cc1.parent != 0
      AND (cc1.depth != cc2.depth + 1 OR cc1.path != CONCAT(cc2.path, '/', cc1.id))
");
echo "Multi-level fix pass 2 done\n";

// Show TES categories
$cats = $DB->get_records_select('course_categories', "idnumber LIKE 'TES%'", null, 'depth ASC');
foreach ($cats as $cat) {
    echo "id={$cat->id} name={$cat->name} idnumber={$cat->idnumber} parent={$cat->parent} depth={$cat->depth} path={$cat->path}\n";
}

// Purge caches
try {
    cache_helper::purge_by_definition('core', 'coursecat');
    echo "coursecat cache purged\n";
} catch (Exception $e) {
    echo "Cache purge note: " . $e->getMessage() . "\n";
}

fix_course_sortorder();
echo "Course sort order fixed\n";
echo "Done!\n";
