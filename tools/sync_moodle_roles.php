<?php
// Sync roles from backend users table into Moodle.

define('CLI_SCRIPT', true);

require_once('/var/www/moodle-9090/config.php');
require_once($CFG->libdir . '/accesslib.php');
require_once($CFG->libdir . '/adminlib.php');
require_once($CFG->libdir . '/authlib.php');
require_once($CFG->dirroot . '/user/lib.php');

$backendHost = '127.0.0.1';
$backendPort = 33061;
$backendUser = 'scl_user';
$backendPass = 'scl_password';
$backendDb = 'scl_institute';

$mysqli = new mysqli($backendHost, $backendUser, $backendPass, $backendDb, $backendPort);
if ($mysqli->connect_errno) {
    fwrite(STDERR, "Failed to connect to backend DB: {$mysqli->connect_error}\n");
    exit(1);
}

$result = $mysqli->query("SELECT email, first_name, last_name, role FROM users WHERE email IS NOT NULL AND email <> ''");
if (!$result) {
    fwrite(STDERR, "Backend query failed: {$mysqli->error}\n");
    exit(1);
}

$users = [];
$superEmail = null;
while ($row = $result->fetch_assoc()) {
    $email = trim((string)$row['email']);
    if ($email === '') {
        continue;
    }
    $role = strtolower(trim((string)$row['role']));
    if ($superEmail === null && ($role === 'super admin' || $role === 'admin')) {
        $superEmail = $email;
    }
    $users[] = [
        'email' => $email,
        'firstname' => trim((string)$row['first_name']) ?: 'SCL',
        'lastname' => trim((string)$row['last_name']) ?: 'User',
        'role' => $role
    ];
}
$result->free();
$mysqli->close();

if ($superEmail === null) {
    fwrite(STDERR, "No super admin/admin found in backend users.\n");
}

$systemContext = context_system::instance();
$roleStudent = $DB->get_record('role', ['shortname' => 'student']);
$roleManager = $DB->get_record('role', ['shortname' => 'manager']);

if (!$roleStudent) {
    fwrite(STDERR, "Student role not found in Moodle.\n");
    exit(1);
}

foreach ($users as $u) {
    $email = $u['email'];
    $user = $DB->get_record('user', ['email' => $email, 'deleted' => 0]);

    if (!$user) {
        $newUser = new stdClass();
        $newUser->auth = 'manual';
        $newUser->confirmed = 1;
        $newUser->deleted = 0;
        $newUser->suspended = 0;
        $newUser->mnethostid = $CFG->mnet_localhost_id;
        $newUser->email = $email;
        $newUser->username = $email;
        $newUser->firstname = $u['firstname'];
        $newUser->lastname = $u['lastname'];
        $newUser->password = hash_internal_user_password(uniqid('sso', true));
        $newUser->city = 'London';
        $newUser->country = 'GB';
        $newUser->lang = 'en';
        $newUser->timezone = 'Europe/London';
        $newUser->timecreated = time();
        $newUser->timemodified = time();

        $newUserId = user_create_user($newUser, false, false);
        $user = $DB->get_record('user', ['id' => $newUserId]);
        echo "Created Moodle user: {$email}\n";
    }

    if ($superEmail !== null && $email === $superEmail) {
        if (!is_siteadmin($user)) {
            $siteadmins = get_config('moodle', 'siteadmins');
            $adminIds = array_filter(array_map('trim', explode(',', (string)$siteadmins)));
            $adminIds[] = (string)$user->id;
            $adminIds = array_unique($adminIds);
            set_config('siteadmins', implode(',', $adminIds));
            echo "Added site admin: {$email}\n";
        }
        if ($roleManager && !user_has_role_assignment($user->id, $roleManager->id, $systemContext->id)) {
            role_assign($roleManager->id, $user->id, $systemContext->id);
            echo "Assigned manager role to: {$email}\n";
        }
        continue;
    }

    if (!user_has_role_assignment($user->id, $roleStudent->id, $systemContext->id)) {
        role_assign($roleStudent->id, $user->id, $systemContext->id);
        echo "Assigned student role to: {$email}\n";
    }
}

echo "Role sync complete.\n";
