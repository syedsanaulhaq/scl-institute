<?php
define('CLI_SCRIPT', true);
require('/var/www/moodle-9090/config.php');
require_once($CFG->libdir . '/accesslib.php');

echo "=== Fixing all missing module contexts ===\n";

// Find all course_modules missing contexts
$sql = "SELECT cm.id, cm.course
        FROM {course_modules} cm
        LEFT JOIN {context} ctx ON ctx.instanceid = cm.id AND ctx.contextlevel = " . CONTEXT_MODULE . "
        WHERE ctx.id IS NULL";

$missing = $DB->get_records_sql($sql);
echo "Found " . count($missing) . " course modules missing context records.\n";

$affected_courses = array();
foreach ($missing as $cm) {
    // Create context using Moodle API (this properly sets path, depth, etc.)
    $ctx = context_module::instance($cm->id, IGNORE_MISSING);
    if ($ctx) {
        echo "  Created context for cm {$cm->id} (course {$cm->course})\n";
    } else {
        echo "  WARN: Could not create context for cm {$cm->id} (course {$cm->course})\n";
    }
    $affected_courses[$cm->course] = true;
}

echo "\n=== Rebuilding caches for " . count($affected_courses) . " affected courses ===\n";

// Also add our HND L&M courses just in case
for ($i = 189; $i <= 204; $i++) {
    $affected_courses[$i] = true;
}

foreach (array_keys($affected_courses) as $courseid) {
    try {
        rebuild_course_cache($courseid, true);
        echo "  Rebuilt cache for course $courseid\n";
    } catch (Exception $e) {
        echo "  WARN: Failed to rebuild cache for course $courseid: " . $e->getMessage() . "\n";
    }
}

// Also purge all caches
purge_all_caches();
echo "\nAll caches purged.\n";
echo "Done!\n";
