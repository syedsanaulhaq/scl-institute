<?php
error_log('[TEST] Testing SSO redirect logic...');

$token = '3a0608d7-c6a7-4a89-abd8-465cffc7716c';

$scldb = new mysqli('scli-mysql-dev', 'scl_user', 'scl_password', 'scl_institute');

if ($scldb->connect_error) {
    error_log('[TEST] Connection failed: ' . $scldb->connect_error);
    exit;
}

error_log('[TEST] Testing token: ' . $token);

$stmt = $scldb->prepare("SELECT email, firstname, lastname, role, redirect_url FROM sso_tokens WHERE token = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");

if (!$stmt) {
    error_log('[TEST] Prepare failed: ' . $scldb->error);
    $scldb->close();
    exit;
}

$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

error_log('[TEST] Query executed, rows: ' . $result->num_rows);

if ($result->num_rows === 0) {
    error_log('[TEST] Token not found or expired');
} else {
    $tokenData = $result->fetch_assoc();
    error_log('[TEST] Token data: ' . json_encode($tokenData));
    
    $redirectUrl = !empty($tokenData['redirect_url']) ? $tokenData['redirect_url'] : null;
    error_log('[TEST] Extracted redirectUrl: ' . ($redirectUrl ?: 'NULL'));
    error_log('[TEST] Condition check: !empty($redirectUrl) = ' . (int)!empty($redirectUrl));
    
    if (!empty($redirectUrl)) {
        error_log('[TEST] Would redirect to: http://localhost:9090' . $redirectUrl);
    } else {
        error_log('[TEST] Would redirect to default courses page');
    }
}

$scldb->close();
echo "Test complete - check Moodle error log";
?>
