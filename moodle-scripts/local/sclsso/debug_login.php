<?php
// Minimal debug version to test what's causing the error
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>SSO Debug</h1>";

try {
    echo "Step 1: Including Moodle config...<br>";
    require_once(__DIR__ . '/../../config.php');
    echo "✓ Config loaded successfully<br>";
    
    echo "Step 2: Getting token...<br>";
    $token = optional_param('token', '', PARAM_RAW);
    echo "Token: " . htmlspecialchars($token) . "<br>";
    
    if (empty($token)) {
        throw new Exception('No token provided');
    }
    
    echo "Step 3: Preparing backend verification...<br>";
    $verifier_url = 'http://scli-backend-dev:4000/api/sso/verify';
    $secret = getenv('SSO_SECRET') ?: 'dev-supersecretkey-changeinproduction';
    echo "Backend URL: " . htmlspecialchars($verifier_url) . "<br>";
    echo "Secret: " . htmlspecialchars(substr($secret, 0, 10)) . "...<br>";
    
    echo "Step 4: Making HTTP request...<br>";
    $data = json_encode(array('token' => $token, 'secret' => $secret));
    
    $ch = curl_init($verifier_url);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    echo "HTTP Code: " . $http_code . "<br>";
    echo "Response: " . htmlspecialchars($result) . "<br>";
    echo "Curl Error: " . htmlspecialchars($curl_error) . "<br>";
    
    $response = json_decode($result);
    
    if ($http_code !== 200 || !$response || !isset($response->success) || !$response->success) {
        throw new Exception('Token verification failed: ' . ($response->message ?? 'Unknown error'));
    }
    
    echo "✓ Token verified successfully<br>";
    echo "User data: " . json_encode($response->user) . "<br>";
    
} catch (Throwable $e) {
    echo "<h2>ERROR:</h2>";
    echo "<p style='color: red;'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>Stack trace:\n" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}
?>