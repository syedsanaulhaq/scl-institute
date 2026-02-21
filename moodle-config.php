<?php
unset($CFG);
global $CFG;
$CFG = new stdClass();

$CFG->dbtype    = 'mysqli';
$CFG->dblibrary = 'native';
$CFG->dbhost    = 'scli-moodle-db';
$CFG->dbname    = 'bitnami_moodle';
$CFG->dbuser    = 'bn_moodle';
$CFG->dbpass    = 'bitnami_moodle_password';
$CFG->prefix    = 'mdl_';
$CFG->dboptions = array(
    'dbpersist' => false,
    'dbport'    => 3306,
    'dbsocket'  => '',
    'dbcollation' => 'utf8mb4_unicode_ci',
);

$CFG->wwwroot   = 'http://localhost:9090';
$CFG->dataroot  = '/var/www/moodledata';
$CFG->admin     = 'admin';

$CFG->directorypermissions = 0777;
$CFG->filepermissions      = 0666;
$CFG->umaskpermissions     = 0022;

$CFG->passwordsaltmain = 'thisissupersecret123!';

@error_reporting(E_ALL | E_STRICT);
@ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', '/bitnami/moodle/var/log/moodle.log');

if (empty($_SERVER['HTTP_HOST'])) {
    $_SERVER['HTTP_HOST'] = 'localhost:9090';
}

$CFG->disableupdateautodeploy = true;
$CFG->upgraderunning = 0;
$CFG->maintenance_enabled = false;
$CFG->debug_developer = false;

require_once(__DIR__ . '/lib/setup.php');
// There is no php closing tag intentionally to prevent trailing whitespace issues
