#!/bin/bash
#
# Moodle SSO Configuration Script
# Installs and configures SSO plugin in production Moodle
# Links Moodle to SCL backend via REST API
#

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Moodle SSO Configuration${NC}"
echo -e "${YELLOW}========================================${NC}"

MOODLE_ROOT="/var/www/moodle-prod"
MOODLE_DATA="/var/moodledata-prod"
BACKEND_URL="${1:-http://localhost:4000}"
SSO_SECRET="${2:-supersecretkey}"
MOODLE_URL="${3:-http://lms.sclsandbox.xyz:8888}"

echo -e "\n${BLUE}Configuration:${NC}"
echo -e "  Moodle Root: ${GREEN}$MOODLE_ROOT${NC}"
echo -e "  Backend URL: ${GREEN}$BACKEND_URL${NC}"
echo -e "  Moodle URL: ${GREEN}$MOODLE_URL${NC}"

# 1. Verify Moodle installation
echo -e "\n${YELLOW}[1/4] Verifying Moodle installation...${NC}"

if [ ! -d "$MOODLE_ROOT" ]; then
    echo -e "${RED}✗ Moodle root directory not found: $MOODLE_ROOT${NC}"
    exit 1
fi

if [ ! -f "$MOODLE_ROOT/config.php" ]; then
    echo -e "${RED}✗ Moodle config.php not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Moodle installation verified${NC}"

# 2. Create SSO plugin directory structure
echo -e "\n${YELLOW}[2/4] Installing SSO Plugin...${NC}"

SSO_DIR="$MOODLE_ROOT/local/sclsso"
mkdir -p "$SSO_DIR"

# Create version.php
cat > "$SSO_DIR/version.php" << 'EOFVERSION'
<?php
defined('MOODLE_INTERNAL') || die();

$plugin->component = 'local_sclsso';
$plugin->version   = 2024022600;
$plugin->release   = '1.0.0';
$plugin->requires  = 2023100900; // Moodle 4.3+
$plugin->maturity  = MATURITY_STABLE;
$plugin->author    = 'SCL Institute';
$plugin->copyright = '2024 SCL Institute';
$plugin->license   = 'http://www.gnu.org/copyleft/gpl.html';
$plugin->description = 'Single Sign-On integration with SCL backend system';
EOFVERSION

echo -e "${GREEN}✓ version.php created${NC}"

# Create language file
mkdir -p "$SSO_DIR/lang/en"
cat > "$SSO_DIR/lang/en/local_sclsso.php" << 'EOFLANG'
<?php
defined('MOODLE_INTERNAL') || die();

$string['pluginname'] = 'SCL SSO';
$string['plugindesc'] = 'Single Sign-On integration with SCL Institute backend system';
$string['sso:managelogin'] = 'Manage SSO login configuration';
EOFLANG

echo -e "${GREEN}✓ Language file created${NC}"

# Create login handler
cat > "$SSO_DIR/login.php" << 'EOFLOGIN'
<?php
/**
 * SCL SSO Login Handler
 * Receives tokens from SCL backend and authenticates users in Moodle
 */

require_once('../../config.php');
require_once($CFG->libdir . '/authlib.php');
require_once($CFG->libdir . '/moodlelib.php');

// MOODLE_INTERNAL is not set, so we need to make sure Moodle is loaded properly
define('NO_MOODLE_COOKIES', true);

$token = optional_param('token', '', PARAM_ALPHANUMEXT);

if (empty($token)) {
    redirect($CFG->wwwroot, 'Invalid or missing SSO token', null, \core\output\notification::NOTIFY_ERROR);
    exit;
}

error_log('[SSO] Login handler called with token: ' . substr($token, 0, 10) . '...');

// Verify token with backend
$backend_host = getenv('SCL_BACKEND_HOST') ?: 'localhost';
$backend_port = getenv('SCL_BACKEND_PORT') ?: '4000';
$backend_url = 'http://' . $backend_host . ':' . $backend_port . '/api/sso/verify';
$sso_secret = getenv('SSO_SECRET') ?: 'supersecretkey';

error_log('[SSO] Verifying token at: ' . $backend_url);

$post_data = json_encode([
    'token' => $token,
    'secret' => $sso_secret
]);

$ch = curl_init($backend_url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

error_log('[SSO] Backend response code: ' . $http_code);

if ($http_code !== 200) {
    error_log('[SSO] Backend verification failed: ' . $curl_error);
    redirect($CFG->wwwroot, 'SSO verification failed', null, \core\output\notification::NOTIFY_ERROR);
    exit;
}

$user_data = json_decode($response, true);
error_log('[SSO] User data received: ' . json_encode($user_data));

if (!$user_data || !isset($user_data['user']) || !isset($user_data['user']['email'])) {
    error_log('[SSO] Invalid user data format');
    redirect($CFG->wwwroot, 'Invalid user data', null, \core\output\notification::NOTIFY_ERROR);
    exit;
}

$sso_user = $user_data['user'];
$email = $sso_user['email'];
$firstname = $sso_user['firstname'] ?? 'User';
$lastname = $sso_user['lastname'] ?? '';
$sco_role = $sso_user['role'] ?? '';

error_log('[SSO] Processing user: ' . $email . ' (' . $firstname . ' ' . $lastname . ')');

// Check if user exists in Moodle
$user = $DB->get_record('user', ['email' => $email, 'deleted' => 0]);

if (!$user) {
    // Create new user
    error_log('[SSO] Creating new user: ' . $email);
    
    $user = new \stdClass();
    $user->username = strtolower(preg_replace('/[^a-z0-9]/', '', $email));
    $user->email = $email;
    $user->firstname = $firstname;
    $user->lastname = $lastname;
    $user->password = hash_internal_user_password(time() . rand() . $email);
    $user->auth = 'manual';
    $user->confirmed = 1;
    $user->timecreated = time();
    $user->timemodified = time();
    
    // Check if username is unique
    $username_count = $DB->count_records('user', ['username' => $user->username]);
    if ($username_count > 0) {
        $user->username = $user->username . rand(1000, 9999);
    }
    
    $user->id = $DB->insert_record('user', $user);
    error_log('[SSO] Created user ID: ' . $user->id);
} else {
    // Update existing user info
    error_log('[SSO] Updating existing user: ' . $email);
    $user->firstname = $firstname;
    $user->lastname = $lastname;
    $user->timemodified = time();
    $DB->update_record('user', $user);
}

// Assign roles based on SCL role
if (!empty($sco_role)) {
    $role_mapping = [
        'Super Admin' => 'manager',
        'LMS Manager' => 'manager',
        'Admissions Officer' => 'manager',
        'Faculty & HR Manager' => 'manager',
        'Teacher' => 'editingteacher',
        'Manager' => 'manager',
    ];
    
    $moodle_role = $role_mapping[$sco_role] ?? null;
    
    if ($moodle_role === 'manager') {
        // Add to site admins
        $admins = explode(',', $CFG->siteadmins);
        if (!in_array($user->id, $admins)) {
            $admins[] = $user->id;
            set_config('siteadmins', implode(',', $admins));
            error_log('[SSO] Added ' . $user->id . ' to siteadmins');
        }
    }
    
    if ($moodle_role && $moodle_role == 'editingteacher') {
        // Assign teacher role at system context
        $role = $DB->get_record('role', ['shortname' => 'editingteacher']);
        if ($role) {
            $context = \context_system::instance();
            if (!$DB->record_exists('role_assignments', 
                ['userid' => $user->id, 'roleid' => $role->id, 'contextid' => $context->id])) {
                role_assign($role->id, $user->id, $context->id);
                error_log('[SSO] Assigned editingteacher role to ' . $user->id);
            }
        }
    }
}

// Create session
error_log('[SSO] Authenticating user: ' . $user->id);
\core\session\manager::login_user($user, true);

// Log the login
$event = \core\event\user_loggedin::create([
    'userid' => $user->id,
    'eventtype' => 'login',
]);
$event->trigger();

error_log('[SSO] User authenticated: ' . $user->id);

// Redirect to dashboard or specified URL
$target_url = $user_data['redirectUrl'] ?? $CFG->wwwroot . '/my/';
redirect($target_url);
EOFLOGIN

echo -e "${GREEN}✓ login.php created${NC}"

# Create lib.php
cat > "$SSO_DIR/lib.php" << 'EOFLIB'
<?php
defined('MOODLE_INTERNAL') || die();

/**
 * Get SCL SSO login URL
 * Returns the URL for SSO login
 */
function local_sclsso_get_login_url($token) {
    global $CFG;
    return $CFG->wwwroot . '/local/sclsso/login.php?token=' . urlencode($token);
}

/**
 * Verify token with backend
 */
function local_sclsso_verify_token($token, $secret) {
    $backend_host = getenv('SCL_BACKEND_HOST') ?: 'localhost';
    $backend_port = getenv('SCL_BACKEND_PORT') ?: '4000';
    $backend_url = 'http://' . $backend_host . ':' . $backend_port . '/api/sso/verify';
    
    $post_data = json_encode(['token' => $token, 'secret' => $secret]);
    
    $ch = curl_init($backend_url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['http_code' => $http_code, 'response' => json_decode($response, true)];
}
EOFLIB

echo -e "${GREEN}✓ lib.php created${NC}"

# 3. Update Moodle config.php with environment variables
echo -e "\n${YELLOW}[3/4] Updating Moodle configuration...${NC}"

# Add environment variable configuration to config.php
cat >> "$MOODLE_ROOT/config.php" << EOFENV

// SCL SSO Configuration
\$CFG->sclsso_enabled = true;
\$CFG->sclsso_backend_url = getenv('SCL_BACKEND_HOST') ?: 'localhost';
\$CFG->sclsso_secret = getenv('SSO_SECRET') ?: 'supersecretkey';
\$CFG->auth = 'manual';

// Allow login via SSO without changing default auth
\$CFG->nolastloggedin = true;
\$CFG->rememberusername = 0;
EOFENV

echo -e "${GREEN}✓ Configuration updated${NC}"

# 4. Create verification script
echo -e "\n${YELLOW}[4/4] Creating verification script...${NC}"

cat > "/tmp/verify-sso-setup.sh" << 'EOFVERIFY'
#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}SSO Setup Verification${NC}\n"

# Check Moodle files
echo -e "${YELLOW}Moodle SSO Plugin Files:${NC}"
for file in version.php lang/en/local_sclsso.php login.php lib.php; do
    if [ -f "/var/www/moodle-prod/local/sclsso/$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file missing"
    fi
done

# Check environment variables
echo -e "\n${YELLOW}Environment Variables:${NC}"
ENV_FILE="/etc/environment"
if grep -q "SCL_BACKEND_HOST" "$ENV_FILE"; then
    echo -e "  ${GREEN}✓${NC} SCL_BACKEND_HOST set"
fi
if grep -q "SSO_SECRET" "$ENV_FILE"; then
    echo -e "  ${GREEN}✓${NC} SSO_SECRET set"
fi

# Check backend connectivity
echo -e "\n${YELLOW}Backend Connectivity:${NC}"
BACKEND_HOST=$(grep SCL_BACKEND_HOST /etc/environment | cut -d= -f2 | tr -d '"')
BACKEND_PORT=$(grep SCL_BACKEND_PORT /etc/environment | cut -d= -f2 | tr -d '"' || echo "4000")

if curl -s "http://${BACKEND_HOST}:${BACKEND_PORT}/api/health" > /dev/null; then
    echo -e "  ${GREEN}✓${NC} Backend reachable at http://${BACKEND_HOST}:${BACKEND_PORT}"
else
    echo -e "  ${RED}✗${NC} Cannot reach backend"
fi

echo -e "\n${YELLOW}Moodle Access:${NC}"
echo -e "  ${GREEN}✓${NC} Ready at: http://lms.sclsandbox.xyz:8888"
EOFVERIFY

chmod +x "/tmp/verify-sso-setup.sh"
echo -e "${GREEN}✓ Verification script created${NC}"

# Complete
echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}✓ SSO CONFIGURATION COMPLETE${NC}"
echo -e "${YELLOW}========================================${NC}"

echo -e "\n${YELLOW}SSO Plugin Installed at:${NC}"
echo -e "  ${GREEN}$SSO_DIR${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "  1. Set environment variables on server:"
echo -e "     export SCL_BACKEND_HOST=localhost"
echo -e "     export SCL_BACKEND_PORT=4000"
echo -e "     export SSO_SECRET=supersecretkey"
echo -e ""
echo -e "  2. Visit Moodle admin panel:"
echo -e "     http://lms.sclsandbox.xyz:8888/admin/"
echo -e ""
echo -e "  3. Check plugin status in:"
echo -e "     Administration > Plugins > Plugins overview"
echo -e ""
echo -e "  4. Test SSO login from main system Dashboard module"

echo -e "\n${YELLOW}Verification:${NC}"
bash /tmp/verify-sso-setup.sh

echo -e "\n${GREEN}Setup Complete!${NC}\n"
