<?php
$zip = new ZipArchive();
$zipFile = '/mnt/c/SCL System/moodle theme/Klassroom-for-4.5.zip';
$extractPath = '/var/www/moodle-9090/theme/';

if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo($extractPath);
    $zip->close();
    echo "Theme extracted successfully\n";
    
    // List extracted directories
    $themes = scandir($extractPath);
    foreach ($themes as $theme) {
        if ($theme !== '.' && $theme !== '..' && is_dir($extractPath . $theme)) {
            echo "Found theme: " . $theme . "\n";
        }
    }
} else {
    echo "Failed to open zip file\n";
}
?>
