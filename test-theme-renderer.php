<?php
// Test script to verify SCL theme renderer loads correctly

define('CLI_SCRIPT', true);
require_once('/bitnami/moodle/config.php');

try {
    // Check if the SCL renderer class exists
    $class = 'theme_scl\\output\\core_renderer';
    
    if (class_exists($class)) {
        echo "✓ Renderer class exists: $class\n";
        
        $parent = get_parent_class($class);
        echo "✓ Parent class: $parent\n";
        
        $reflection = new ReflectionClass($class);
        if ($reflection->hasMethod('firstview_fakeblocks')) {
            echo "✓ firstview_fakeblocks method exists\n";
            
            $method = $reflection->getMethod('firstview_fakeblocks');
            $returnType = $method->getReturnType();
            echo "✓ Return type: " . ($returnType ? $returnType->getName() : 'none') . "\n";
        } else {
            echo "✗ firstview_fakeblocks method NOT found\n";
        }
        
    } else {
        echo "✗ Renderer class NOT found: $class\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
