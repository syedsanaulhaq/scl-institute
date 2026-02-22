<?php
// SSO Login Handler - Direct entry point
// This file must be placed at the Moodle document root for access via /sso_login.php

define('CLI_SCRIPT', false); // Not a CLI script, it's a web script
require_once(__DIR__ . '/config.php');
require_once($CFG->libdir . '/authlib.php');

$token = optional_param('token', '', PARAM_ALPHANUMEXT);

if (empty($token)) {
    http_response_code(400);
    die('Invalid or missing token');
}

// Verify token via SCL backend API
$backendUrl = 'http://scli-backend-dev:4000/api/sso/verify';
$ssoSecret = getenv('SSO_SECRET') ?: 'dev-supersecretkey-changeinproduction';

error_log('[SSO] Backend URL: ' . $backendUrl);

$postData = json_encode([
    'token' => $token,
    'secret' => $ssoSecret
]);

$ch = curl_init($backendUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    error_log('[SSO] Backend verification failed: HTTP ' . $httpCode . ' Response: ' . $response);
    http_response_code(401);
    die('SSO verification failed');
}

$responseData = json_decode($response, true);
if (!$responseData || !isset($responseData['user'])) {
    error_log('[SSO] Invalid response structure from backend');
    http_response_code(400);
    die('Invalid token');
}

$tokenData = $responseData['user'];

$email = $tokenData['email'];
$firstname = $tokenData['firstname'] ?: 'SCL';
$lastname = $tokenData['lastname'] ?: 'User';
$sclRole = isset($tokenData['role']) ? $tokenData['role'] : null;

error_log('[SSO] Token verified: email=' . $email . ', role=' . ($sclRole ?: 'none'));

// Find or create Moodle user
if (!$user = $DB->get_record('user', array('email' => $email, 'deleted' => 0))) {
    // Create new user
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
    $user->password = hash_internal_user_password('TempPassword' . substr(md5($email), 0, 8) . '!');
    $user->city = 'London';
    $user->country = 'GB';
    $user->lang = 'en';
    $user->timezone = 'Europe/London';
    $user->timecreated = time();
    $user->timemodified = time();
    
    $user->id = $DB->insert_record('user', $user);
    error_log('[SSO] New user created: ' . $email . ' (ID: ' . $user->id . ')');
} else {
    error_log('[SSO] Existing user found: ' . $email);
}

// Log the user in
complete_user_login($user);

error_log('[SSO] User logged in: ' . $email);

// Redirect to dashboard
redirect($CFG->wwwroot . '/my/courses.php', 'Login successful'); 
?>
