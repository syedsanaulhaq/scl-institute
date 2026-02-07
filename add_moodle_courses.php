<?php
define('CLI_SCRIPT', true);
define('ABORT_AFTER_CONFIG', true);

// Set Moodle config path
$_SERVER['argv'] = array('cli');
$_SERVER['argc'] = 1;

// Include Moodle config
require_once('/opt/bitnami/moodle/config.php');

// Get database connection
global $DB;

$courses = [
    ['fullname' => 'B.Tech Computer Science Engineering', 'shortname' => 'BTECH-CSE-001', 'summary' => 'Advanced computing with focus on AI, ML, and software development'],
    ['fullname' => 'B.Tech Mechanical Engineering', 'shortname' => 'BTECH-MEC-001', 'summary' => 'Design, manufacturing, and thermal systems'],
    ['fullname' => 'B.Tech Electrical Engineering', 'shortname' => 'BTECH-ECE-001', 'summary' => 'Power systems, electronics, and renewable energy'],
    ['fullname' => 'MBA Business Administration', 'shortname' => 'MBA-BA-001', 'summary' => 'Strategic management, finance, and leadership'],
    ['fullname' => 'M.Tech Data Science', 'shortname' => 'MTECH-DS-001', 'summary' => 'Machine learning, big data analytics, and AI'],
    ['fullname' => 'B.Com Commerce', 'shortname' => 'BCOM-001', 'summary' => 'Accounting, finance, and business law'],
    ['fullname' => 'BCA Computer Applications', 'shortname' => 'BCA-001', 'summary' => 'Programming, databases, and web development'],
    ['fullname' => 'MCA Computer Applications', 'shortname' => 'MCA-001', 'summary' => 'Advanced programming, software engineering, and cloud']
];

foreach ($courses as $course) {
    $DB->insert_record('course', (object)[
        'fullname' => $course['fullname'],
        'shortname' => $course['shortname'],
        'summary' => $course['summary'],
        'category' => 1,
        'visible' => 1,
        'format' => 'topics',
        'startdate' => time(),
        'enddate' => 0
    ]);
    echo "Created: {$course['shortname']}\n";
}

echo "Courses created successfully!\n";
?>
