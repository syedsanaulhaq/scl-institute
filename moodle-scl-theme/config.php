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

$THEME->name = 'scltheme';
$THEME->doctype = 'html5';
$THEME->parents = array('boost');
$THEME->enable_dock = true;
$THEME->sheets = array();
$THEME->editor_sheets = array();
$THEME->usefallback = true;

// Set up block regions
$THEME->blockregions = array(
    'side-pre',
    'side-post',
    'content',
);

$THEME->requiredblocks = '';
$THEME->addblockposition = BLOCK_ADDBLOCK_POSITION_FLATNAV;

// The following layouts map all Moodle main layout areas to regions in the theme.
$THEME->layouts = array(
    // Most backwards compatible layout without the blocks - this is the layout used by default
    'base' => array(
        'file' => 'columns.php',
        'regions' => array(),
        'defaultregion' => '',
    ),
    // Standard layout with blocks, this is recommended for most pages with general information
    'standard' => array(
        'file' => 'columns.php',
        'regions' => array('side-pre'),
        'defaultregion' => 'side-pre',
    ),
    // Main course page
    'course' => array(
        'file' => 'columns.php',
        'regions' => array('side-pre'),
        'defaultregion' => 'side-pre',
    ),
    'coursecategory' => array(
        'file' => 'columns.php',
        'regions' => array('side-pre'),
        'defaultregion' => 'side-pre',
    ),
    // The site home page
    'frontpage' => array(
        'file' => 'columns.php',
        'regions' => array('side-pre'),
        'defaultregion' => 'side-pre',
    ),
    // Server administration scripts
    'admin' => array(
        'file' => 'columns.php',
        'regions' => array(),
        'defaultregion' => '',
    ),
    // My dashboard page
    'mydashboard' => array(
        'file' => 'columns.php',
        'regions' => array('side-pre'),
        'defaultregion' => 'side-pre',
    ),
    // My public profile page
    'mypublic' => array(
        'file' => 'columns.php',
        'regions' => array('side-pre'),
        'defaultregion' => 'side-pre',
    ),
    'login' => array(
        'file' => 'columns.php',
        'regions' => array(),
        'defaultregion' => '',
    ),
);

// SCL Theme Icon Fonts
$THEME->iconfonts = array('fontawesome');

// Custom settings
$THEME->settings_navs = array('scl_branding');
