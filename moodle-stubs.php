<?php
/**
 * Moodle Global Stubs - Suppress false positive errors
 * These are injected by Moodle at runtime and are always available
 */

// Global objects
global $CFG, $DB, $USER, $COURSE, $SESSION, $THEME, $PAGE, $OUTPUT;

// Theme configuration object
$THEME = new stdClass();

// Plugin configuration object
$plugin = new stdClass();

// Database object
$DB = null;

// Config object
$CFG = new stdClass();

// User object
$USER = new stdClass();

// Course object
$COURSE = new stdClass();

// Session object
$SESSION = new stdClass();

// Page object
$PAGE = null;

// Output object
$OUTPUT = null;

// Moodle constants
define('PARAM_ALPHANUMEXT', 1);
define('PARAM_RAW', 2);
define('PARAM_NOTAGS', 3);
define('PARAM_INT', 4);
define('PARAM_FLOAT', 5);
define('PARAM_BOOL', 6);
define('PARAM_TEXT', 7);

// Moodle functions (stubs for IDE autocomplete)
function optional_param($parname, $default, $type) { return $default; }
function required_param($parname, $type) { return null; }
function hash_internal_user_password($password) { return ''; }
function complete_user_login(&$user) {}
function redirect($url, $message = '', $delay = 0) {}
function context_system() { return null; }
function get_config($plugin = 'moodle', $name = null) { return null; }
function set_config($name, $value, $plugin = 'moodle') {}
function is_siteadmin($userid = null) { return false; }
function user_has_role_assignment($userid, $roleid, $contextid) { return false; }
function role_assign($roleid, $userid, $contextid, $component = '', $itemid = 0, $timemodified = '') {}
function user_create_user($user, $updatepassword = true, $triggerevent = true) { return null; }
function get_courses($filter = '', $sort = '', $fields = '*') { return []; }
function theme_classic_process_scss($scss, $theme) { return $scss; }
