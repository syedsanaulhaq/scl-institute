<?php
// Script to inject custom CSS into Classic theme

define('CLI_SCRIPT', true);
require_once('/bitnami/moodle/config.php');

// Read the custom CSS file
$customcss = file_get_contents('/tmp/custom.css');

// Set it to Classic theme
set_config('customcss', $customcss, 'theme_classic');

echo "✓ Custom CSS injected into Classic theme\n";
echo "✓ Purple header styling applied\n";
