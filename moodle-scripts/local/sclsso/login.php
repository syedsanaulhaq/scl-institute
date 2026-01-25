<?php
// /local/sclsso/login.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/authlib.php');

$token = optional_param('token', '', PARAM_RAW); // PARAM_RAW to allow dashes in UUID // PARAM_RAW to allow dashes in UUID

if (empty($token)) {
    throw new moodle_exception('notoken', 'local_sclsso');
}

// 1. Verify Token with SCL Backend
$verifier_url = 'http://scli-backend:4000/api/sso/verify';
$secret = getenv('SSO_SECRET') ?: 'dev-supersecretkey-changeinproduction';

$data = json_encode(array('token' => $token, 'secret' => $secret));

$ch = curl_init($verifier_url);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

$response = json_decode($result);

if ($http_code !== 200 || !$response || !isset($response->success) || !$response->success) {
    $msg = 'SSO Verification Failed. HTTP: ' . $http_code . '. Error: ' . ($response->message ?? 'Unknown') . '. Curl: ' . $curl_error;
    throw new moodle_exception('generalexceptionmessage', 'local_sclsso', '', $msg);
}

$sso_user = $response->user;

// 2. Find or Create User in Moodle
$user = $DB->get_record('user', array('email' => $sso_user->email));

if (!$user) {
    // Create new user
    $user = create_user_record($sso_user->email, 'manual'); // 'manual' auth by default
    
    // Update basic fields
    $user->firstname = $sso_user->firstname;
    $user->lastname = $sso_user->lastname;
    $user->email = $sso_user->email;
    $user->confirmed = 1;
    $user->mnethostid = $CFG->mnet_localhost_id;
    
    // Set a dummy password (they won't use it, but needed for 'manual' auth sometimes)
    // Or we use 'nologin' auth which is safer if we only want SSO
    $user->password = hash_internal_user_password('SCLDefaultPass123!');
    
    $DB->update_record('user', $user);
} else {
    // Update existing user just in case
    $user->firstname = $sso_user->firstname;
    $user->lastname = $sso_user->lastname;
    $DB->update_record('user', $user);
}

// 3. Handle Roles (Admin)
if ($sso_user->role === 'admin') {
    // Check if already admin
    $admins = explode(',', $CFG->siteadmins);
    if (!in_array($user->id, $admins)) {
        // Add to site admins
        $admins[] = $user->id;
        $new_admins = implode(',', array_unique($admins));
        set_config('siteadmins', $new_admins); 
        // Note: modify access might require capability check, but we are running as script with context
    }
}

// 4. Log the user in
$user = get_complete_user_data('id', $user->id); // Ensure we have full object
complete_user_login($user);

// 5. Redirect
if ($sso_user->role === 'admin') {
    redirect($CFG->wwwroot . '/admin/search.php');
} else {
    redirect($CFG->wwwroot . '/my');
}
