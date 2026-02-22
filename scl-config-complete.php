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
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * SCL Professional Theme Configuration
 *
 * @package   theme_scl
 * @copyright 2026 SCL Institute
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$THEME->name = 'scl';

$THEME->sheets = [];

$THEME->layouts = [
    'base' => [
        'file' => 'columns.php',
        'regions' => [],
    ],
    'standard' => [
        'file' => 'columns.php',
        'regions' => ['side-pre', 'side-post'],
        'defaultregion' => 'side-pre',
    ],
    'course' => [
        'file' => 'columns.php',
        'regions' => ['side-pre', 'side-post'],
        'defaultregion' => 'side-pre',
        'options' => ['langmenu' => true],
    ],
    'coursecategory' => [
        'file' => 'columns.php',
        'regions' => ['side-pre'],
        'defaultregion' => 'side-pre',
    ],
    'incourse' => [
        'file' => 'columns.php',
        'regions' => ['side-pre', 'side-post'],
        'defaultregion' => 'side-pre',
    ],
    'frontpage' => [
        'file' => 'columns.php',
        'regions' => ['side-pre', 'side-post'],
        'defaultregion' => 'side-pre',
        'options' => ['nofullheader' => true],
    ],
    'admin' => [
        'file' => 'columns.php',
        'regions' => ['side-pre'],
        'defaultregion' => 'side-pre',
    ],
    'mycourses' => [
        'file' => 'columns.php',
        'regions' => ['side-pre', 'side-post'],
        'defaultregion' => 'side-pre',
    ],
    'mydashboard' => [
        'file' => 'columns.php',
        'regions' => ['side-pre', 'side-post'],
        'defaultregion' => 'side-pre',
    ],
    'mypublic' => [
        'file' => 'columns.php',
        'regions' => ['side-pre', 'side-post'],
        'defaultregion' => 'side-pre',
    ],
    'login' => [
        'file' => 'columns.php',
        'regions' => [],
        'options' => ['langmenu' => true, 'nonavbar' => true],
    ],
    'popup' => [
        'file' => 'columns.php',
        'regions' => [],
        'options' => ['nofooter' => true, 'nonavbar' => true],
    ],
    'frametop' => [
        'file' => 'columns.php',
        'regions' => [],
        'options' => ['nofooter' => true],
    ],
    'embedded' => [
        'file' => 'columns.php',
        'regions' => [],
        'options' => ['nofooter' => true, 'nonavbar' => true],
    ],
    'maintenance' => [
        'file' => 'columns.php',
        'regions' => [],
        'options' => ['nofooter' => true, 'nonavbar' => true, 'nologo' => true],
    ],
    'print' => [
        'file' => 'columns.php',
        'regions' => [],
        'options' => ['nofooter' => true, 'nonavbar' => false],
    ],
    'redirect' => [
        'file' => 'columns.php',
        'regions' => [],
        'options' => ['nofooter' => true, 'nonavbar' => true],
    ],
];

// Theme inheritance - inherit from boost theme
$THEME->parents = ['classic'];

// Disable dock by default
$THEME->enable_dock = false;

// Empty rendererstooverride
$THEME->rendererstooverride = [];

// SCSS post-processor function
$THEME->csspostprocess = 'theme_scl_process_scss';
