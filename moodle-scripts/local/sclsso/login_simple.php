<?php
require_once('../../config.php');
require_once($CFG->libdir.'/adminlib.php');

$token = optional_param('token', '', PARAM_ALPHANUMEXT);

if (empty($token)) {
    redirect($CFG->wwwroot, 'Invalid or missing token');
}

// Connect to SCL backend database
$scldb = new mysqli('scli-mysql-dev', 'scl_user', 'scl_password', 'scl_institute');

if ($scldb->connect_error) {
    redirect($CFG->wwwroot, 'Database error');
}

// Query token
$stmt = $scldb->prepare("SELECT email, firstname, lastname, role FROM sso_tokens WHERE token = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $scldb->close();
    redirect($CFG->wwwroot, 'Invalid token');
}

$tokenData = $result->fetch_assoc();
$email = $tokenData['email'];
$firstname = $tokenData['firstname'] ?: 'SCL';
$lastname = $tokenData['lastname'] ?: 'User';
$userrole = $tokenData['role'] ?: 'user';

// Find or create Moodle user
if (!$user = $DB->get_record('user', array('email' => $email, 'deleted' => 0))) {
    $user = new stdClass();
    $user->auth = 'manual';
    $user->confirmed = 1;
    $user->policyagreed = 0;
    $user->deleted = 0;
    $user->suspended = 0;
    $user->mnethostid = $CFG->mnet_localhost_id;
    $user->email = $email;
    $user->username = $email;
    $user->firstname = $firstname;
    $user->lastname = $lastname;
    $user->city = 'London';
    $user->country = 'GB';
    $user->lang = 'en';
    $user->timezone = 'Europe/London';
    $user->timecreated = time();
    $user->timemodified = time();
    $user->id = $DB->insert_record('user', $user);
} else {
    $user->firstname = $firstname;
    $user->lastname = $lastname;
    $user->timemodified = time();
    $DB->update_record('user', $user);
}

// Log the user in
complete_user_login($user);

// Delete the token
$delstmt = $scldb->prepare("DELETE FROM sso_tokens WHERE token = ?");
$delstmt->bind_param("s", $token);
$delstmt->execute();

$scldb->close();

// Redirect to dashboard
redirect($CFG->wwwroot . '/my/', 'Login successful');
?>
