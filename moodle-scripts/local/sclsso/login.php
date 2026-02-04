<?php
require_once('../../config.php');
require_once($CFG->libdir.'/adminlib.php');

$token = optional_param('token', '', PARAM_ALPHANUMEXT);

if (empty($token)) {
    redirect($CFG->wwwroot, 'Invalid or missing token');
}

// Connect to SCL backend database to validate token
$scldb = new mysqli('scli-mysql-dev', 'scl_user', 'scl_password', 'scl_institute');

if ($scldb->connect_error) {
    redirect($CFG->wwwroot, 'Database connection failed');
}

// Query to get user information for the token
$stmt = $scldb->prepare("SELECT email, firstname, lastname, role, redirect_url FROM sso_tokens WHERE token = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");

if (!$stmt) {
    $scldb->close();
    redirect($CFG->wwwroot, 'Database error');
}

$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $scldb->close();
    redirect($CFG->wwwroot, 'Invalid or expired token');
}

$tokenData = $result->fetch_assoc();
$email = $tokenData['email'];
$firstname = $tokenData['firstname'] ?: 'SCL';
$lastname = $tokenData['lastname'] ?: 'User';
$redirectUrl = $tokenData['redirect_url'];  // Get redirect URL from database

// Find or create Moodle user
if (!$user = $DB->get_record('user', array('email' => $email, 'deleted' => 0))) {
    // Create new user
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
    // Update existing user
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

// Redirect to provided location or default to courses page
if (!empty($redirectUrl)) {
    // The redirectUrl is stored from the token, e.g., /mod/quiz/view.php?id=21
    $finalUrl = $CFG->wwwroot . $redirectUrl;
    error_log('[SSO] Redirecting to: ' . $finalUrl);
    redirect($finalUrl, 'Login successful');
} else {
    error_log('[SSO] No redirect URL stored, redirecting to courses');
    redirect($CFG->wwwroot . '/my/courses.php', 'Login successful');
}
?>
