<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

defined('MOODLE_INTERNAL') || die();

/**
 * Post CSS process the stylesheet
 *
 * @param string $scss The SCSS
 * @param theme_config $theme The theme config
 * @return string The processed CSS.
 */
function theme_scltheme_process_scss($scss, $theme) {
    global $CFG;

    // Include parent theme SCSS
    $scss = file_get_contents(__DIR__ . '/scss/custom.scss');

    return $scss;
}

/**
 * Get SCSS to include in the page
 */
function theme_scltheme_get_extra_scss($theme) {
    return '';
}
