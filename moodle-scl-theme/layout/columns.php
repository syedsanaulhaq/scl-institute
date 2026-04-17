<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

defined('MOODLE_INTERNAL') || die();

user_preference_allow_ajax_update('drawer-open-nav', PARAM_ALPHA);
require_once($CFG->libdir . '/behat/lib.php');

$extraclasses = [];
$bodyattributes = $OUTPUT->body_attributes($extraclasses);
$blockshtml = $OUTPUT->blocks('side-pre');
$hasblocks = strpos($blockshtml, 'data-block=') !== false || strpos($blockshtml, 'data-block-region=') !== false;
$regionmainsettings = !$hasblocks;

?>
<!DOCTYPE html>
<html lang="<?php echo current_language(); ?>"<?php echo $OUTPUT->htmlattributes(); ?>>
<head>
    <title><?php echo $PAGE->title; ?></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php echo $OUTPUT->standard_head_html(); ?>
    <!-- SCL Theme CSS -->
    <?php require_once(__DIR__ . '/footer_scl.php'); ?>
</head>
<body <?php echo $bodyattributes; ?>>
<?php echo $OUTPUT->standard_top_of_body_html(); ?>

<div id="page-wrapper">
    <?php echo $OUTPUT->navbar(); ?>
    
    <div id="page" class="container-fluid">
        <div id="page-content" class="row">
            <main id="moodle-page" class="<?php echo $hasblocks ? 'col-md-9' : 'col-12'; ?>">
                <div id="region-main">
                    <?php echo $OUTPUT->course_content_header(); ?>
                    <?php echo $OUTPUT->main_content(); ?>
                    <?php echo $OUTPUT->course_content_footer(); ?>
                </div>
            </main>
            
            <?php if ($hasblocks): ?>
                <aside id="region-side-pre" class="col-md-3">
                    <?php echo $blockshtml; ?>
                </aside>
            <?php endif; ?>
        </div>
    </div>

    <?php echo $OUTPUT->standard_footer_html(); ?>
</div>

<?php echo $OUTPUT->standard_end_of_body_html(); ?>
</body>
</html>
