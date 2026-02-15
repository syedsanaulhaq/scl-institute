<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * SCL Theme Renderers
 *
 * @package    theme_scl
 * @copyright  2026 SCL Institute
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace theme_scl\output;

use moodle_url;
use html_writer;

defined('MOODLE_INTERNAL') || die();

/**
 * Core renderer for SCL theme
 *
 * @package    theme_scl
 * @copyright  2026 SCL Institute
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class core_renderer extends \theme_boost\output\core_renderer {

    /**
     * Override to provide custom course content rendering
     */
    public function course_content_header($onlyoutput = false) {
        // Call parent implementation
        return parent::course_content_header($onlyoutput);
    }

    /**
     * Override to provide custom course content footer
     */
    public function course_content_footer($onlyoutput = false) {
        // Call parent implementation
        return parent::course_content_footer($onlyoutput);
    }
}
