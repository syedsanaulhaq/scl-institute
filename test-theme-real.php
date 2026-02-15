<?php
// Test script that simulates what happens in drawers.php layout

define('CLI_SCRIPT', true);
require_once('/bitnami/moodle/config.php');
require_once($CFG->libdir . '/outputrenderers.php');

global $PAGE, $OUTPUT;

// Simulate a page context
$PAGE->set_context(context_system::instance());
$PAGE->set_url('/');

// Force theme to SCL
$PAGE->force_theme('scl');

// Try to get the renderer
try {
    echo "Current theme: " . $PAGE->theme->name . "\n";
    
    $renderer = $PAGE->get_renderer('core');
    echo "✓ Renderer loaded: " . get_class($renderer) . "\n";
    
    if (method_exists($renderer, 'firstview_fakeblocks')) {
        echo "✓ firstview_fakeblocks method exists on renderer\n";
        
        // Try calling it (like the layout does)
        $result = $renderer->firstview_fakeblocks();
        echo "✓ Method called successfully! Returned: " . var_export($result, true) . "\n";
        echo "\n✓✓✓ SUCCESS - No errors!\n";
    } else {
        echo "✗ firstview_fakeblocks method NOT found on renderer\n";
        echo "Available methods: " . implode(', ', get_class_methods($renderer)) . "\n";
    }
    
} catch (Exception $e) {
    echo "✗ ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
