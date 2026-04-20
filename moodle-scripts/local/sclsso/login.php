<?php
require_once('../../config.php');
require_once($CFG->libdir.'/adminlib.php');

// Set up $PAGE early so Moodle navigation/renderers don't hit null.
$PAGE->set_context(context_system::instance());
$PAGE->set_url(new moodle_url('/local/sclsso/login.php'));

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
    
    // Give Super Admin users site admin privileges AND system-level manager role
    if ($sclRole === 'Super Admin') {
        // Add to siteadmins
        $admins = explode(',', $CFG->siteadmins);
        if (!in_array($userid, $admins)) {
            $admins[] = $userid;
            set_config('siteadmins', implode(',', $admins));
            error_log('[SSO] Added user ' . $userid . ' to siteadmins');
        }
        
        // Also assign manager role at system context
        $managerRole = $DB->get_record('role', array('shortname' => 'manager'));
        if ($managerRole) {
            $context = context_system::instance();
            // Check if role already assigned
            $existing = $DB->get_record('role_assignments', 
                array('userid' => $userid, 'roleid' => $managerRole->id, 'contextid' => $context->id));
            if (!$existing) {
                role_assign($managerRole->id, $userid, $context->id);
                error_log('[SSO] Assigned manager role at system context to user ' . $userid);
            }
        }
        return;
    }

    // For non-super-admin users, ensure accidental site admin access is removed.
    $admins = array_filter(explode(',', (string)$CFG->siteadmins));
    if (in_array((string)$userid, array_map('strval', $admins), true)) {
        $admins = array_values(array_filter($admins, function($id) use ($userid) {
            return (string)$id !== (string)$userid;
        }));
        set_config('siteadmins', implode(',', $admins));
        error_log('[SSO] Removed user ' . $userid . ' from siteadmins (non-super-admin login)');
    }

    // Clear previously assigned system-level role mappings to prevent role drift.
    $context = context_system::instance();
    $managedRoleShortnames = array('manager', 'editingteacher', 'teacher', 'student', 'coursecreator');
    foreach ($managedRoleShortnames as $shortname) {
        $existingRole = $DB->get_record('role', array('shortname' => $shortname));
        if ($existingRole) {
            role_unassign($existingRole->id, $userid, $context->id);
        }
    }
    
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
    
    // Assign the mapped role at system context (all courses)
    role_assign($role->id, $userid, $context->id);
    
    error_log('[SSO] Role assigned: user ' . $userid . ' assigned Moodle role ' . $moodleRole . ' (ID: ' . $role->id . ')');
}

/**
 * Sync Moodle role assignments back to SCL backend
 */
function syncRolesToBackend($userid, $email, $backendHost, $backendPort) {
    global $DB;
    
    // Fetch all role assignments for this user with full context
    $sql = "SELECT DISTINCT r.shortname, r.name, c.contextlevel, c.id as contextid, c.instanceid as courseid
            FROM {role_assignments} ra
            JOIN {role} r ON ra.roleid = r.id
            JOIN {context} c ON ra.contextid = c.id
            WHERE ra.userid = ?
            ORDER BY c.contextlevel ASC, r.sortorder ASC";
    
    $roleRecords = $DB->get_records_sql($sql, array($userid));
    
    if (empty($roleRecords)) {
        error_log('[SSO ROLE SYNC] No roles found for user ' . $userid);
        return;
    }
    
    // Build roles array (use shortnames) and detailed assignments
    $roles = array();
    $assignments = array();
    foreach ($roleRecords as $record) {
        $roles[] = $record->shortname;
        $assignments[] = array(
            'shortname' => $record->shortname,
            'name' => $record->name,
            'contextlevel' => (int)$record->contextlevel,
            'contextid' => (int)$record->contextid,
            'courseid' => $record->contextlevel == 50 ? (int)$record->courseid : null
        );
    }
    
    $ssoSecret = getenv('SSO_SECRET') ?: 'dev-supersecretkey-changeinproduction';
    $syncUrl = 'http://' . $backendHost . ':' . $backendPort . '/api/sso/role-sync';
    
    $postData = json_encode([
        'email' => $email,
        'moodle_user_id' => $userid,
        'roles' => $roles,
        'role_data' => array('assignments' => $assignments),
        'secret' => $ssoSecret
    ]);
    
    $ch = curl_init($syncUrl);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        error_log('[SSO ROLE SYNC] Successfully synced roles for ' . $email . ': ' . implode(', ', $roles));
    } else {
        error_log('[SSO ROLE SYNC] Failed to sync roles for ' . $email . ': HTTP ' . $httpCode . ' - ' . $response);
    }
}

$token = optional_param('token', '', PARAM_ALPHANUMEXT);

if (empty($token)) {
    redirect(new moodle_url('/'));
}

// Verify token via SCL backend API
// Use environment variable, fallback to localhost for LAMP-based Moodle.
$backendHost = getenv('SCL_BACKEND_HOST') ?: 'localhost';
$backendPort = getenv('SCL_BACKEND_PORT') ?: '4000';
$backendUrl = 'http://' . $backendHost . ':' . $backendPort . '/api/sso/verify';
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
    redirect(new moodle_url('/'));
}

$responseData = json_decode($response, true);
if (!$responseData || !isset($responseData['user'])) {
    error_log('[SSO] Invalid response structure from backend');
    redirect(new moodle_url('/'));
}

$tokenData = $responseData['user'];

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
    $user->firstnamephonetic = '';
    $user->lastnamephonetic = '';
    $user->middlename = '';
    $user->alternatename = '';
    $user->password = hash_internal_user_password('TempPassword123!'); // Generate random password hash
    $user->city = 'London';
    $user->country = 'GB';
    $user->lang = 'en';
    $user->timezone = 'Europe/London';
    $user->picture = 0;
    $user->firstaccess = 0;
    $user->lastaccess = 0;
    $user->lastlogin = 0;
    $user->currentlogin = 0;
    $user->lastip = '';
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

// Always re-fetch a complete user record before login. Moodle's
// complete_user_login() and renderers expect many core fields to exist.
$user = $DB->get_record('user', array('id' => $user->id), '*', MUST_EXIST);

// Assign Moodle roles based on SCL roles
assignMoodleRoles($user->id, $sclRole);

// Log the user in
complete_user_login($user);

error_log('[SSO] User logged in: ' . $email);

// Sync role data back to SCL backend
syncRolesToBackend($user->id, $email, $backendHost, $backendPort);

// Redirect to provided location or default to courses page
error_log('[SSO] About to redirect. redirectUrl=' . var_export($redirectUrl, true));
error_log('[SSO] !empty($redirectUrl)=' . (int)!empty($redirectUrl));
if (!empty($redirectUrl)) {
    // The redirectUrl is stored from the token, e.g., /mod/quiz/view.php?id=21
    $finalUrl = new moodle_url($redirectUrl);
    error_log('[SSO] Redirecting to activity: ' . $finalUrl->out(false));
    redirect($finalUrl);
} else {
    error_log('[SSO] No redirect URL, redirecting to courses');
    redirect(new moodle_url('/my/courses.php'));
}
?>
