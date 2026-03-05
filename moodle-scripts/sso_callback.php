<?php
// phpstan ignore all
// Simple SSO entry point in Moodle root
// Handles token verification and user login

require_once('config.php');
require_once($CFG->libdir . '/authlib.php');
require_once($CFG->libdir . '/accesslib.php');
require_once($CFG->libdir . '/adminlib.php');

// Get token from query parameter
$token = optional_param('token', '', PARAM_ALPHANUMEXT);

if (empty($token)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No token provided']);
    exit;
}

// Verify token against backend (LAMP Moodle hits host backend)
$backendUrl = 'http://localhost:4000/api/sso/verify';
$ch = curl_init($backendUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'token' => $token,
    'secret' => getenv('SSO_SECRET') ?: 'dev-supersecretkey-changeinproduction'
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Token verification failed']);
    exit;
}

$responseData = json_decode($response, true);
if (!$responseData || !isset($responseData['user'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid token data']);
    exit;
}

$tokenData = $responseData['user'];
$email = $tokenData['email'];
$firstname = $tokenData['firstname'] ?: 'SCL';
$lastname = $tokenData['lastname'] ?: 'User';
$role = strtolower(trim($tokenData['role'] ?? ''));

// Find or create user
$user = $DB->get_record('user', ['email' => $email, 'deleted' => 0]);
if (!$user) {
    $user = new stdClass();
    $user->auth = 'manual';
    $user->confirmed = 1;
    $user->deleted = 0;
    $user->suspended = 0;
    $user->mnethostid = $CFG->mnet_localhost_id;
    $user->email = $email;
    $user->username = $email;
    $user->firstname = $firstname;
    $user->lastname = $lastname;
    $user->password = hash_internal_user_password(uniqid());
    $user->city = 'London';
    $user->country = 'GB';
    $user->lang = 'en';
    $user->timezone = 'Europe/London';
    $user->timecreated = time();
    $user->timemodified = time();
    $user->id = $DB->insert_record('user', $user);
}

// Log user in and redirect
// Map SSO roles to Moodle roles at system context
$systemContext = context_system::instance();

// Super admin or admin users are added to site admins list
if ($role === 'super admin' || $role === 'admin') {
    if (!is_siteadmin($user)) {
        $siteadmins = get_config('moodle', 'siteadmins');
        $adminIds = array_filter(array_map('trim', explode(',', (string)$siteadmins)));
        $adminIds[] = (string)$user->id;
        $adminIds = array_unique($adminIds);
        set_config('siteadmins', implode(',', $adminIds));
    }
    // Also assign manager role for admin capabilities
    $adminRole = $DB->get_record('role', ['shortname' => 'manager']);
    if ($adminRole && !user_has_role_assignment($user->id, $adminRole->id, $systemContext->id)) {
        role_assign($adminRole->id, $user->id, $systemContext->id);
    }
} else {
    // Map standard roles
    $roleMap = [
        'student' => 'student',
        'teacher' => 'editingteacher',
        'manager' => 'manager'
    ];

    $roleShortname = $roleMap[$role] ?? 'student';
    $moodleRole = $DB->get_record('role', ['shortname' => $roleShortname]);
    if ($moodleRole && !user_has_role_assignment($user->id, $moodleRole->id, $systemContext->id)) {
        role_assign($moodleRole->id, $user->id, $systemContext->id);
    }
}

complete_user_login($user);
redirect($CFG->wwwroot . '/my/courses.php');
?>
