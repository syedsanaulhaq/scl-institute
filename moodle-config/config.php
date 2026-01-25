<?php
// Moodle Configuration File - Production
// 185.211.6.60

unset($CFG);
global $CFG;
global $DOCUMENT_ROOT;

$CFG = new stdClass();

// Database configuration
// MariaDB container port is exposed to host at localhost:3306
$CFG->dbtype    = 'mariadb';
$CFG->dblibrary = 'native';
$CFG->dbhost    = 'localhost';
$CFG->dbname    = 'bitnami_moodle_prod';
$CFG->dbuser    = 'bn_moodle';
$CFG->dbpass    = 'MoodleDBPass2026!';
$CFG->prefix    = 'mdl_';
$CFG->dboptions = array (
  'dbpersist' => 0,
  'dbport' => 3306,
  'dbsocket' => '',
  'dbcollation' => 'utf8mb4_unicode_ci',
);

// Moodle directories
$CFG->wwwroot   = 'https://lms.sclsandbox.xyz';
$CFG->dataroot  = '/var/moodledata';
$CFG->admin     = 'admin';
$CFG->directorypermissions = 0750;

// Session and cache settings
$CFG->sessioncookiesecure = 1;
$CFG->cookiesecure = 1;
$CFG->sessioncookiehttponly = 1;

// SSL / TLS settings
$CFG->sslproxy = true;

// Email settings
$CFG->smtphosts = 'localhost';

// Performance settings
$CFG->enablestats = false;
$CFG->enablerssfeeds = false;
$CFG->fsstrictnames = true;

// Security
$CFG->protectusernames = true;
$CFG->preventexecution = true;

// Cron key for scheduled tasks
$CFG->cronremotewaitdelay = 0;

// Support for reverse proxy (NGINX)
$CFG->reverseproxy = true;
$CFG->reverseproxyheader = 'HTTP_X_FORWARDED_FOR';
$CFG->proxyscriptname = '/';

// Force HTTPS
$CFG->overriddenote = 'Production server - HTTPS enforced';

require_once(__DIR__ . '/lib/setup.php');

// There is no php closing tag on purpose - it is intentional because it prevents trailing whitespace issues.
