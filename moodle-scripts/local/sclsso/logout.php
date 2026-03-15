<?php
require_once('../../config.php');

$closewindow = optional_param('close', 0, PARAM_BOOL);
$redirectpath = optional_param('redirect', '/login/index.php', PARAM_LOCALURL);

if (!empty($redirectpath)) {
    $redirecturl = new moodle_url($redirectpath);
} else {
    $redirecturl = new moodle_url('/login/index.php');
}

require_logout();

if ($closewindow) {
    $title = get_string('loggedout');
    $message = get_string('loggedout');
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo s($title); ?></title>
</head>
<body>
    <p><?php echo s($message); ?></p>
    <script>
        try {
            window.opener?.postMessage({ type: 'scl-moodle-logged-out' }, '*');
        } catch (err) {
            // Ignore cross-origin messaging failures.
        }

        try {
            window.close();
        } catch (err) {
            // Ignore window close failures.
        }

        setTimeout(function() {
            try {
                if (!window.closed) {
                    window.location.replace(<?php echo json_encode($redirecturl->out(false)); ?>);
                }
            } catch (err) {
                // Ignore fallback redirect failures.
            }
        }, 150);
    </script>
</body>
</html>
<?php
    exit;
}

redirect($redirecturl, get_string('loggedout'));
