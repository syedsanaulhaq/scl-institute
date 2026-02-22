<?php
$conn = new mysqli('scli-mysql-dev', 'scl_user', 'scl_password', 'scl_institute');

if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
} else {
    echo "Connected successfully\n";
    
    $result = $conn->query('SELECT COUNT(*) FROM sso_tokens');
    $row = $result->fetch_row();
    echo "Tokens in DB: " . $row[0] . "\n";
    
    $result = $conn->query('SELECT token, email FROM sso_tokens ORDER BY created_at DESC LIMIT 3');
    echo "Recent tokens:\n";
    while ($row = $result->fetch_assoc()) {
        echo "  " . $row['token'] . " - " . $row['email'] . "\n";
    }
}
?>
