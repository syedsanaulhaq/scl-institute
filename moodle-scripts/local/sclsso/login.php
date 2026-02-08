<?php
require_once('../../config.php');
require_once($CFG->libdir.'/adminlib.php');

/**
 * Assign Moodle roles based on SCL system roles
 * Maps SCL roles to Moodle manager/admin roles
 */
function assignMoodleRoles($userid, $sclRole) {
    global $DB, $CFG;
    
    if (empty($sclRole)) {
        return;
    }
    
    error_log('[SSO] Assigning roles for user ' . $userid . ' with SCL role: ' . $sclRole);
    
    // Define role mapping from SCL to Moodle
    $roleMapping = array(
        'Super Admin' => 'manager',           // Super Admin -> Moodle Manager
        'LMS Manager' => 'manager',           // LMS Manager -> Moodle Manager
        'Admissions Officer' => 'manager',    // Admissions Officer -> Moodle Manager
        'Faculty & HR Manager' => 'manager',  // Faculty & HR Manager -> Moodle Manager
        'Teacher' => 'editingteacher',        // Teacher -> Moodle Editing Teacher
        'Manager' => 'manager',               // Manager -> Moodle Manager
    );
    
    // Get the Moodle role ID for the mapped role
    $moodleRole = isset($roleMapping[$sclRole]) ? $roleMapping[$sclRole] : null;
    
    if (empty($moodleRole)) {
        error_log('[SSO] No role mapping found for SCL role: ' . $sclRole);
        return;
    }
    
    // Get the Moodle role ID
    $role = $DB->get_record('role', array('shortname' => $moodleRole));
    
    if (!$role) {
        error_log('[SSO] Moodle role not found: ' . $moodleRole);
        return;
    }
    
    // Assign the role at system context (all courses)
    $context = context_system::instance();
    role_assign($role->id, $userid, $context->id);
    
    error_log('[SSO] Role assigned: user ' . $userid . ' assigned Moodle role ' . $moodleRole . ' (ID: ' . $role->id . ')');
}

$token = optional_param('token', '', PARAM_ALPHANUMEXT);

if (empty($token)) {
    redirect($CFG->wwwroot, 'Invalid or missing token');
}

// Verify token via SCL backend API
$backendUrl = 'http://scli-backend-dev:4000/api/sso/verify';
$postData = json_encode(['token' => $token]);
$ch = curl_init($backendUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    error_log('[SSO] Backend verification failed: HTTP ' . $httpCode);
    redirect($CFG->wwwroot, 'SSO verification failed');
}

$tokenData = json_decode($response, true);
if (!$tokenData || !isset($tokenData['email'])) {
    error_log('[SSO] Invalid token data received from backend');
    redirect($CFG->wwwroot, 'Invalid token');
}

$email = $tokenData['email'];
$firstname = $tokenData['firstname'] ?: 'SCL';
$lastname = $tokenData['lastname'] ?: 'User';
$redirectUrl = isset($tokenData['redirect_url']) ? $tokenData['redirect_url'] : null;
$sclRole = isset($tokenData['role']) ? $tokenData['role'] : null;

error_log('[SSO] Token verified via backend API: email=' . $email . ', role=' . ($sclRole ?: 'none'));

// Write debug info to file
file_put_contents('/tmp/sso_debug.txt', date('Y-m-d H:i:s') . " - Token: $token, Email: $email, SCL Role: $sclRole, RedirectURL: " . var_export($redirectUrl, true) . "\n", FILE_APPEND);

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
    $user->username = $email; // Use email as username (must be unique)
    $user->firstname = $firstname;
    $user->lastname = $lastname;
    $user->password = hash_internal_user_password('TempPassword123!'); // Generate random password hash
    $user->city = 'London';
    $user->country = 'GB';
    $user->lang = 'en';
    $user->timezone = 'Europe/London';
    $user->timecreated = time();
    $user->timemodified = time();
    
    $user->id = $DB->insert_record('user', $user);
    error_log('[SSO] New user created: ' . $email . ' (ID: ' . $user->id . ')');
} else {
    // Update existing user
    $user->firstname = $firstname;
    $user->lastname = $lastname;
    $user->timemodified = time();
    $DB->update_record('user', $user);
    error_log('[SSO] Existing user updated: ' . $email);
}

// Assign Moodle roles based on SCL roles
assignMoodleRoles($user->id, $sclRole);

// Log the user in
complete_user_login($user);

error_log('[SSO] User logged in: ' . $email);

// Redirect to provided location or default to courses page
error_log('[SSO] About to redirect. redirectUrl=' . var_export($redirectUrl, true));
error_log('[SSO] !empty($redirectUrl)=' . (int)!empty($redirectUrl));
if (!empty($redirectUrl)) {
    // The redirectUrl is stored from the token, e.g., /mod/quiz/view.php?id=21
    $finalUrl = $CFG->wwwroot . $redirectUrl;
    error_log('[SSO] Redirecting to activity: ' . $finalUrl);
    error_log('[SSO] calling redirect() with: ' . $finalUrl);
    redirect($finalUrl, 'Login successful');
} else {
    error_log('[SSO] No redirect URL, redirecting to courses');
    error_log('[SSO] calling redirect() with: ' . $CFG->wwwroot . '/my/courses.php');
    redirect($CFG->wwwroot . '/my/courses.php', 'Login successful');
}
?>
