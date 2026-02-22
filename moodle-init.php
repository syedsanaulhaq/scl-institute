<?php
// Moodle configuration file - auto-generated for Docker

unset($CFG);
global $CFG;
global $DOCUMENT_ROOT;

$CFG = new stdClass();

// MySQL/MariaDB
$CFG->dbtype    = 'mysqli';
$CFG->dblibrary = 'mysqli';
$CFG->dbhost    = 'scli-moodle-db';
$CFG->dbname    = 'bitnami_moodle';
$CFG->dbuser    = 'bn_moodle';
$CFG->dbpass    = 'bitnami_moodle_password';
$CFG->prefix    = 'mdl_';
$CFG->dboptions = array (
  'dbpersist' => 0,
  'dbport' => 3306,
  'dbsocket' => '',
);

// Directories
$CFG->wwwroot   = 'http://localhost:9090';
$CFG->dataroot  = '/bitnami/moodledata';
$CFG->directorypermissions = 0777;

// Session/Cookie settings  
$CFG->sessioncookiesecure = false;
$CFG->cookiesecure = false;
$CFG->sessioncookiehttponly = false;

// Admin settings
$CFG->admin = 'admin';

// Performance and debugging
$CFG->debug = (E_ALL | E_STRICT);
$CFG->debugdisplay = false;
$CFG->debugstringkeys = true;
$CFG->performance_enable_histogram = true;

// Security
$CFG->passwordsaltmain = 'thisisasalt1234567890123456789012';

// Reverse proxy (NGINX)
$CFG->reverseproxy = false;

// Cron
$CFG->cronremotewaitdelay = 0;

require_once(__DIR__ . '/lib/setup.php');

// There is no php closing tag on purpose.
