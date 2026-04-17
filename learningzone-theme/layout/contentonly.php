<?php
require_once(dirname(__FILE__).'/header.php');
require_once(dirname(__FILE__).'/reg.php');
$bodyattributes = $OUTPUT->body_attributes();
$templatecontext = [
'sitename' => format_string($SITE->shortname, true, ['context' => context_course::instance(SITEID), "escape" => false]),
'output' => $OUTPUT,
'bodyattributes' => $bodyattributes,
'reg' => $reg,
];

echo $OUTPUT->render_from_template('theme_learningzone/contentonly', $templatecontext);
require_once(dirname(__FILE__).'/footer.php');
