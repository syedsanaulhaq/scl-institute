<?php
echo "Testing SSO token verification...\n";

$backendUrl = 'http://scli-backend-dev:4000/api/sso/verify';
$ch = curl_init($backendUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['token' => 'test-token', 'secret' => 'dev-supersecretkey-changeinproduction']));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: " . $httpCode . "\n";
echo "Response: " . $response . "\n";
?>
