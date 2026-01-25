<?php
/**
 * SCL SSO Plugin - Library functions
 * 
 * @package    local_sclsso
 * @copyright  2026
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Hook for Moodle local plugin - called when plugin is installed
 */
function local_sclsso_install() {
    return true;
}

/**
 * Hook for Moodle local plugin - called when plugin is uninstalled
 */
function local_sclsso_uninstall() {
    return true;
}
