<?php
define('CLI_SCRIPT', true);
require('/var/www/moodle-9090/config.php');
for ($i = 189; $i <= 204; $i++) {
    rebuild_course_cache($i, true);
    echo "Rebuilt cache for course $i\n";
}
echo "Done\n";
