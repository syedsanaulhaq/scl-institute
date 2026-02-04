<?php
echo "Before require";
try {
    require_once('../../config.php');
    echo "After require - success";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
