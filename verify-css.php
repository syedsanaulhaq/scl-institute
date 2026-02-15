<?php
define('CLI_SCRIPT', true);
require_once('/bitnami/moodle/config.php');

$css = get_config('theme_classic', 'customcss');
echo "Custom CSS loaded: " . strlen($css) . " characters\n";

if (strpos($css, 'scl-purple') !== false) {
    echo "✓ Purple SCL colors detected in CSS\n";
} else {
    echo "✗ SCL colors not found\n";
}

if (strpos($css, 'navbar') !== false) {
    echo "✓ Navbar styling present\n";
} else {
    echo "✗ Navbar styling not found\n";
}
