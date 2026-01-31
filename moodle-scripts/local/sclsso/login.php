<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once('../../config.php');
require_once($CFG->libdir.'/adminlib.php');

// Helper function to map SCL roles to Moodle role IDs
function get_moodle_role_id($scl_role) {
    global $DB;
    
    $role_mapping = array(
        'admin' => 'manager',      // SCL admin -> Moodle manager
        'faculty' => 'teacher',    // SCL faculty -> Moodle teacher  
        'student' => 'student',    // SCL student -> Moodle student
        'hr_admin' => 'manager'    // SCL HR admin -> Moodle manager
    );
    
    $moodle_role = isset($role_mapping[$scl_role]) ? $role_mapping[$scl_role] : 'student';
    
    $role = $DB->get_record('role', array('shortname' => $moodle_role));
    return $role ? $role->id : null;
}

// Get the token from the URL
$token = optional_param('token', '', PARAM_ALPHANUMEXT);

error_log("SSO Debug: Received token: " . $token);

if (empty($token)) {
    error_log("SSO Debug: Token is empty");
    redirect($CFG->wwwroot, 'Invalid or missing token');
}

// Connect to SCL backend database to validate token
try {
    error_log("SSO Debug: Attempting database connection to scli-mysql-dev");
    
    // Database connection to SCL backend
    $scldb = new mysqli('scli-mysql-dev', 'scl_user', 'scl_password', 'scl_institute');
    
    if ($scldb->connect_error) {
        error_log("SSO Debug: Database connection failed: " . $scldb->connect_error);
        throw new Exception('Database connection failed: ' . $scldb->connect_error);
    }
    
    error_log("SSO Debug: Database connected successfully");
    
    // Query to get user information for the token
    $stmt = $scldb->prepare("SELECT email, firstname, lastname, role, created_at FROM sso_tokens WHERE token = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
    if (!$stmt) {
        error_log("SSO Debug: Prepare failed: " . $scldb->error);
        throw new Exception('Database prepare failed: ' . $scldb->error);
    }
    
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    error_log("SSO Debug: Query executed, rows found: " . $result->num_rows);
    
    if ($result->num_rows === 0) {
        error_log("SSO Debug: No valid token found in database");
        $scldb->close();
        redirect($CFG->wwwroot, 'Invalid or expired token');
    }
    
    $tokenData = $result->fetch_assoc();
    $email = $tokenData['email'];
    $firstname = $tokenData['firstname'] ?: 'SCL';
    $lastname = $tokenData['lastname'] ?: 'User';
    $userrole = $tokenData['role'] ?: 'user';
    
    error_log("SSO Debug: Token valid for: " . $firstname . " " . $lastname . " (" . $email . ", role: " . $userrole . ")");
    
    // Find or create Moodle user
    if (!$user = $DB->get_record('user', array('email' => $email, 'deleted' => 0))) {
        error_log("SSO Debug: Creating new user for: " . $firstname . " " . $lastname . " (" . $email . ")");
        
        // Create new user with real names from SSO token
        $user = new stdClass();
        $user->auth = 'manual';
        $user->confirmed = 1;
        $user->policyagreed = 0;
        $user->deleted = 0;
        $user->suspended = 0;
        $user->mnethostid = $CFG->mnet_localhost_id;
        $user->email = $email;
        $user->username = $email;
        $user->firstname = $firstname;  // Use real first name
        $user->lastname = $lastname;    // Use real last name
        $user->city = 'London';
        $user->country = 'GB';
        $user->lang = 'en';
        $user->timezone = 'Europe/London';
        $user->timecreated = time();
        $user->timemodified = time();
        
        $user->id = $DB->insert_record('user', $user);
        error_log("SSO Debug: User created with ID: " . $user->id . " - " . $firstname . " " . $lastname);
        
        // Assign system role based on SCL role
        $roleid = get_moodle_role_id($userrole);
        if ($roleid) {
            $systemcontext = context_system::instance();
            role_assign($roleid, $user->id, $systemcontext->id);
            error_log("SSO Debug: Assigned role " . $userrole . " (ID: " . $roleid . ") to new user");
        }
    } else {
        // Update existing user with current names from token
        $user->firstname = $firstname;
        $user->lastname = $lastname;
        $user->timemodified = time();
        $DB->update_record('user', $user);
        error_log("SSO Debug: Updated existing user ID: " . $user->id . " - " . $firstname . " " . $lastname);
        
        // Update system role based on current SCL role
        $roleid = get_moodle_role_id($userrole);
        if ($roleid) {
            $systemcontext = context_system::instance();
            // Remove all existing system roles first
            $currentroles = get_user_roles($systemcontext, $user->id);
            foreach ($currentroles as $currentrole) {
                role_unassign($currentrole->roleid, $user->id, $systemcontext->id);
            }
            // Assign new role
            role_assign($roleid, $user->id, $systemcontext->id);
            error_log("SSO Debug: Updated role to " . $userrole . " (ID: " . $roleid . ") for existing user");
        }
    }
    
    // Log the user in
    error_log("SSO Debug: Logging in user");
    complete_user_login($user);
    
    // Delete the used token
    $stmt = $scldb->prepare("DELETE FROM sso_tokens WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    
    error_log("SSO Debug: Token deleted, redirecting to dashboard");
    
    $scldb->close();
    
    // Redirect to Moodle dashboard
    redirect($CFG->wwwroot . '/my/', 'Login successful');
    
} catch (Exception $e) {
    // Log error and redirect with error message
    error_log('SCL SSO Error: ' . $e->getMessage());
    redirect($CFG->wwwroot, 'Authentication failed: ' . $e->getMessage());
}
?>
