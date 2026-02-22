<?php
// Moodle configuration file for port 9090 (Fresh SCL Installation)

unset($CFG);
global $CFG;
$CFG = new stdClass();

// Database configuration - pointing to Docker MariaDB container
$CFG->dbtype    = 'mariadb';
$CFG->dblibrary = 'native';
$CFG->dbhost    = 'scli-moodle-db-dev';
$CFG->dbname    = 'bitnami_moodle';
$CFG->dbuser    = 'bn_moodle';
$CFG->dbpass    = 'bitnami_moodle_password';
$CFG->prefix    = 'mdl_';
$CFG->dboptions = array(
    'dbpersist' => 0,
    'dbport'    => 3306,
    'dbsocket'  => false,
    'dbcollation' => 'utf8mb4_unicode_ci',
);

// Site configuration - Auto-detect protocol and host
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost:9090';
$CFG->wwwroot   = $protocol . $host;
$CFG->dataroot  = '/bitnami/moodledata';
$CFG->admin     = 'admin';

// File permissions
$CFG->directorypermissions = 0777;
$CFG->filepermissions      = 0666;
$CFG->umaskpermissions     = 0022;

// Password salt
$CFG->passwordsaltmain = 'SCLInst2026SecurePasswordSalt!@#$';

// Debug settings
@error_reporting(E_ALL | E_STRICT);
@ini_set('display_errors', '1');
$CFG->debug = 32767;
$CFG->debugdisplay = 1;
ini_set('log_errors', '1');
ini_set('error_log', '/bitnami/moodledata/moodle.log');

// Language
$CFG->lang = 'en';

// Session configuration
$CFG->sessioncookie    = 'MoodleSCL9090';
$CFG->sessioncookiedomain = '';
$CFG->sessioncookiepath   = '/';
$CFG->sessioncookiesecure = false;

// Disable auto-updates
$CFG->disableupdateautodeploy = true;

require_once(__DIR__ . '/lib/setup.php');
// There is no php closing tag intentionally to prevent trailing whitespace issues
