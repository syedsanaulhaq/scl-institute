<?php
define('CLI_SCRIPT', true);
require('/var/www/moodle-9090/config.php');
require_once($CFG->libdir . '/accesslib.php');
require_once($CFG->dirroot . '/enrol/locallib.php');

echo "=== Step 1: Assign student role to enrolled users missing role_assignments ===\n";

// Find all enrolled users who don't have a role assignment in the course context
$sql = "SELECT DISTINCT ue.userid, e.courseid
        FROM {user_enrolments} ue
        JOIN {enrol} e ON e.id = ue.enrolid
        LEFT JOIN (
            SELECT ra.userid, ctx.instanceid as courseid
            FROM {role_assignments} ra
            JOIN {context} ctx ON ctx.id = ra.contextid AND ctx.contextlevel = " . CONTEXT_COURSE . "
        ) ra ON ra.userid = ue.userid AND ra.courseid = e.courseid
        WHERE ra.userid IS NULL AND ue.status = 0";

$missing_roles = $DB->get_records_sql($sql);
echo "Found " . count($missing_roles) . " user-course pairs missing role assignments.\n";

$studentroleid = $DB->get_field('role', 'id', array('shortname' => 'student'));

$affected_courses = array();
foreach ($missing_roles as $mr) {
    $ctx = context_course::instance($mr->courseid, IGNORE_MISSING);
    if ($ctx) {
        role_assign($studentroleid, $mr->userid, $ctx->id);
        echo "  Assigned student role to user {$mr->userid} in course {$mr->courseid}\n";
        $affected_courses[$mr->courseid] = true;
    } else {
        echo "  WARN: No context for course {$mr->courseid}\n";
    }
}

echo "\n=== Step 2: Fix any remaining broken course modules ===\n";

// Check for course_modules with missing context
$sql = "SELECT cm.id, cm.course
        FROM {course_modules} cm
        LEFT JOIN {context} ctx ON ctx.instanceid = cm.id AND ctx.contextlevel = " . CONTEXT_MODULE . "
        WHERE ctx.id IS NULL";
$missing_ctx = $DB->get_records_sql($sql);
echo "Found " . count($missing_ctx) . " course modules still missing context.\n";

foreach ($missing_ctx as $cm) {
    $ctx = context_module::instance($cm->id, IGNORE_MISSING);
    if ($ctx) {
        echo "  Created context for cm {$cm->id}\n";
        $affected_courses[$cm->course] = true;
    }
}

echo "\n=== Step 3: Rebuild ALL course caches ===\n";

// Get ALL courses
$courses = $DB->get_records('course', null, 'id', 'id');
$count = 0;
foreach ($courses as $c) {
    if ($c->id == 1) continue; // skip site course
    try {
        rebuild_course_cache($c->id, true);
        $count++;
    } catch (Exception $e) {
        echo "  WARN: Failed to rebuild course $c->id: " . $e->getMessage() . "\n";
    }
}
echo "Rebuilt cache for $count courses.\n";

echo "\n=== Step 4: Purge all caches ===\n";
purge_all_caches();
echo "All caches purged.\n";

echo "\nDone!\n";
