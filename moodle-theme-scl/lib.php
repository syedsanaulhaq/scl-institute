<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * SCL Theme Library Functions
 *
 * @package    theme_scl
 * @copyright  2026 SCL Institute
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Process CSS string - allows us to modify CSS after Sass was compiled
 *
 * @param string $css The CSS
 * @param stdClass $theme The theme config
 *
 * @return string The processed CSS
 */
function theme_scl_process_css($css, $theme) {
    // Get primary color from settings
    $primarycolor = isset($theme->settings['primarycolor']) ? $theme->settings['primarycolor'] : '#7c3aed';
    
    // Replace primary color variable
    $css = str_replace('[[primarycolor]]', $primarycolor, $css);
    
    return $css;
}

/**
 * Inject custom CSS into page
 *
 * @param moodle_page $page The moodle page object
 */
function theme_scl_page_init(moodle_page $page) {
    // Custom initialization if needed
}

/**
 * Returns an object containing HTML for the menus structure of a course or category
 *
 * @param core_renderer $renderer Renderer used to render coursestructure
 * @param int $menuid The current menu id
 *
 * @return string HTML to display course structure
 */
function theme_scl_render_course_content($renderer, $menuid = 0) {
    return '';
}

/**
 * Compatibility wrapper for deprecated Moodle methods
 * Handles firstview_fakeblocks which may be called by legacy code
 */
function theme_scl_renderer_firstview_fakeblocks() {
    // Return empty string for deprecated method
    return '';
}
