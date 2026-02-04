<?php
// Test connection to scl_institute database from Moodle
error_log('[TEST] Testing mysqli connection...');

$scldb = new mysqli('scli-mysql-dev', 'scl_user', 'scl_password', 'scl_institute');

if ($scldb->connect_error) {
    error_log('[TEST] Connection failed: ' . $scldb->connect_error);
    echo "Connection failed: " . $scldb->connect_error;
} else {
    error_log('[TEST] Connection successful!');
    
    // Test token query
    $stmt = $scldb->prepare("SELECT token, email, redirect_url FROM sso_tokens LIMIT 1");
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        error_log('[TEST] Sample token found: ' . $row['token'] . ', redirect_url: ' . ($row['redirect_url'] ?: 'NULL'));
    }
    
    $scldb->close();
    echo "Connection successful - check Moodle error log for details";
}
?>
