<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

defined('MOODLE_INTERNAL') || die();

$settings = null;

if ($ADMIN->fulltree) {
    $page = new admin_settingpage('themesettingsscl', get_string('settings', 'theme_boost'));

    // Primary color setting
    $name = 'theme_scltheme/primarycolor';
    $title = get_string('primarycolor', 'theme_boost');
    $description = get_string('primarycolordesc', 'theme_boost');
    $setting = new admin_setting_configcolourpicker($name, $title, $description, '#6B46C1');
    $page->add($setting);

    // Secondary color setting
    $name = 'theme_scltheme/secondarycolor';
    $title = get_string('secondarycolor', 'theme_boost');
    $description = get_string('secondarycolordesc', 'theme_boost');
    $setting = new admin_setting_configcolourpicker($name, $title, $description, '#553399');
    $page->add($setting);

    // Logo
    $name = 'theme_scltheme/logo';
    $title = get_string('logo', 'theme_boost');
    $description = get_string('logodesc', 'theme_boost');
    $setting = new admin_setting_configstoredfile($name, $title, $description, 'logo');
    $setting->set_updatedcallback('theme_reset_all_caches');
    $page->add($setting);

    // Font family
    $name = 'theme_scltheme/fontfamily';
    $title = 'Font Family';
    $description = 'Select the font family for the theme';
    $choices = array(
        'system' => 'System Fonts (Recommended)',
        'georgia' => 'Georgia',
        'times' => 'Times New Roman',
        'trebuchet' => 'Trebuchet MS'
    );
    $setting = new admin_setting_configselect($name, $title, $description, 'system', $choices);
    $page->add($setting);

    // Enable animations
    $name = 'theme_scltheme/enableanimations';
    $title = 'Enable Animations';
    $description = 'Show smooth animations and transitions';
    $setting = new admin_setting_configcheckbox($name, $title, $description, 1);
    $page->add($setting);

    $ADMIN->add('appearance', $page);
}
