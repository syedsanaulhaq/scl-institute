<?php
// Test the actual login logic
$token = 'dcd2f9d5-dd1a-40aa-9bd0-4b0afefa3802'; // Use a known token

$scldb = new mysqli('scli-mysql-dev', 'scl_user', 'scl_password', 'scl_institute');

if ($scldb->connect_error) {
    echo "Database connection failed: " . $scldb->connect_error;
    exit();
}

echo "Connected to database\n";
echo "Looking for token: $token\n";

// Try the prepared statement
$stmt = $scldb->prepare("SELECT email, firstname, lastname, role, redirect_url FROM sso_tokens WHERE token = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");

if (!$stmt) {
    echo "Prepare failed: " . $scldb->error;
    $scldb->close();
    exit();
}

$stmt->bind_param("s", $token);
echo "About to execute...\n";
$stmt->execute();
echo "Executed\n";
$result = $stmt->get_result();

echo "Number of rows: " . $result->num_rows . "\n";

if ($result->num_rows === 0) {
    echo "Token not found or expired\n";
    // Let's check without the time constraint
    echo "\nTrying without time constraint:\n";
    $stmt2 = $scldb->prepare("SELECT email, firstname, lastname, role, redirect_url, created_at FROM sso_tokens WHERE token = ?");
    $stmt2->bind_param("s", $token);
    $stmt2->execute();
    $result2 = $stmt2->get_result();
    echo "Result count: " . $result2->num_rows . "\n";
    if ($result2->num_rows > 0) {
        $row = $result2->fetch_assoc();
        echo "Found: " . print_r($row, true);
    }
} else {
    echo "Token found!\n";
    $tokenData = $result->fetch_assoc();
    echo print_r($tokenData, true);
}

$scldb->close();
?>
