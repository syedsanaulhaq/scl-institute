<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

/**
 * Theme config
 *
 * @package    theme_scl
 * @copyright  2026 SCL Institute
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

// This setting produces child theme selector on theme selection page.
$THEME->name = 'scl';
$THEME->doctype = 'html5';

// Theme parent - boost is the parent theme.
$THEME->parents = array('boost');

// Custom CSS file.
$THEME->sheets = array('scl');

// Use theme overridden renderer factory.
$THEME->rendererfactory = 'theme_overridden_renderer_factory';
