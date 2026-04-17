<?php
// This line protects the file from being accessed by a URL directly.
defined('MOODLE_INTERNAL') || die();
function theme_learningzone_get_main_scss_content($theme) {
global $CFG;
$scss = '';
$filename = !empty($theme->settings->preset) ? $theme->settings->preset : null;
$fs = get_file_storage();
$context = context_system::instance();
//$scss .= file_get_contents($CFG->dirroot . '/theme/learningzone/scss/learningzone/pre.scss');
if ($filename && ($presetfile = $fs->get_file($context->id, 'theme_learningzone', 'preset', 0, '/', $filename))) {
$scss .= $presetfile->get_content();
} else {
// Safety fallback - maybe new installs etc.
/*
====== post.scss for internal pages/sections====
*/
$scss .= file_get_contents($CFG->dirroot . '/theme/learningzone/scss/preset/default.scss');
}
/*
====== post.scss for internal page such as Dashboard====
*/
$scss .= file_get_contents($CFG->dirroot . '/theme/learningzone/scss/learningzone/post.scss');
/*
====== custom.scss for customization pages/sections ====
*/
$scss .= file_get_contents($CFG->dirroot . '/theme/learningzone/scss/custom.scss');


/*$scss .= ".block_calendar_month .card-body .calendar-controls .previous{background-image: url([[pix:theme|arrow-left]])}";
$scss .= ".block_calendar_month .card-body .calendar-controls .next{background-image: url([[pix:theme|arrow-right]])}";
$scss .= "body.pagelayout-frontpage button.sldr-prv{background-image: url([[pix:theme|prev]]), url([[pix:theme|tr1]]);}";
$scss .= "body.pagelayout-frontpage button.sldr-nxt{background-image: url([[pix:theme|next]]), url([[pix:theme|tr1]]);}";
$scss .= "body.pagelayout-frontpage .captions div{background-image: url([[pix:theme|tr1]]);}";*/

$scss .= ".top-page-header {background-image: url([[pix:theme|tr1]])}";
$scss .= ".navbar-brand {background-image: url([[pix:theme|home]])}";
$scss .= "#news {background-image: url([[pix:theme|wave2]]), url([[pix:theme|wave]])}";
$scss .= ".owl-item .body-content-container .content-alignment-container div[data-region='post-actions-container'] a:first-child {background-image: url([[pix:theme|permalink]])}";
$scss .= ".owl-item .body-content-container .content-alignment-container div[data-region='post-actions-container'] a:nth-child(2) {background-image: url([[pix:theme|editicon]])}";
$scss .= ".owl-item .body-content-container .content-alignment-container div[data-region='post-actions-container'] a:nth-child(3) {background-image: url([[pix:theme|deleteicon]])}";
$scss .= ".visitlink a {background-image: url([[pix:theme|enter]])}";
$scss .= ".visitlink a:hover {background-image: url([[pix:theme|enter]]), url([[pix:theme|hover]])}";
$scss .= "#frontpage-course-list .frontpage-course-list-enrolled .coursebox .content .info .moreinfo {background-image: url([[pix:theme|enrolledicon]])}";
$scss .= ".view-first .mask {background-image: url([[pix:theme|tr4]])}";
$scss .= ".block-section label.slideblocklabel {background-image: url([[pix:theme|blockicon]])}";
$scss .= "body#page-login-index #page #page-content .login-main-wrapper .login-section {background-image: url([[pix:theme|tr-img-white]])}";
$scss .= "body#page-login-index #page #page-content .login-main-wrapper .login-section .login-inner form#login button[type='submit']:hover, body#page-login-index #page #page-content .login-main-wrapper .login-section .login-inner form#guestlogin button[type='submit']:hover {background-image: url([[pix:theme|tr-img-white]])}";
$scss .= "body#page-login-index #page #page-content .login-main-wrapper .login-section .login-inner .card-body .loginerrors div, body#page-login-index #page #page-content .login-main-wrapper .login-section .login-inner .card-body .loginerrors a {background-image: url([[pix:theme|warning]])}";
$scss .= "body#page-login-index #page #page-content .login-main-wrapper .signup-section .signup-wrapper .signup-form #signup button[type='submit']:hover{background-image: url([[pix:theme|tr-img-white]])}";

$scss .= "body.pagelayout-course #page-content aside.desktop-first-column .mycourses .courses .coursebox .info h3.coursename a{background-image: url([[pix:theme|enter2]])}";


$scss .= ".callbacks_container a.btn:hover,.btn-primary:hover, .btn-primary:active, .btn-primary:focus {background-image: url([[pix:theme|hover]])}";


/*
	>>> Get Coaching Section Settings Start
*/


if ($getcoachingbgurl = $theme->setting_file_url('getthecoachingbg', 'getthecoachingbg')) {
$scss .= "#getcoaching {background-image: url('$getcoachingbgurl');}";
} else {
$scss .= "#getcoaching {background-image: url([[pix:theme|getthecoachingbg]]);}";
}

/*
	>>> Get Coaching Section Settings End
*/

/*
	>>> Innerbanner Section Settings Start
*/


if ($internalbannerimageurl = $theme->setting_file_url('internalbannerimage', 'internalbannerimage')) {
$scss .= ".innerbanner {background-image: url('$internalbannerimageurl');}";
} else {
$scss .= ".innerbanner {background-image: url([[pix:theme|bannerinternaldefaultimage]]);}";
}

/*
	>>> Innerbanner Section Settings End
*/

/*
	>>> Numbers Section Settings Start
*/


if ($numbersbgurl = $theme->setting_file_url('numbersbg', 'numbersbg')) {
$scss .= ".numbers {background-image: url('$numbersbgurl');}";
} else {
$scss .= ".numbers {background-image: url([[pix:theme|numbersbg]]);}";
}


/*
	>>> Numbers Section Settings End
*/	



if ($loginbgurl = $theme->setting_file_url('loginbg', 'loginbg')) {
$scss .= "body.pagelayout-login #page{background-image:  url('$loginbgurl');}";
} else {
$scss .= "body.pagelayout-login #page{background-image: url([[pix:theme|loginbackgroundimage]]);}";
}

if ($loginbgurl = $theme->setting_file_url('loginbg', 'loginbg')) {
$scss .= "body.pagelayout-login #page{background-image:  url('$loginbgurl');}";
}



return $scss;
}
/**
* Get SCSS to prepend.
*
* @param theme_config $theme The theme config object.
* @return array
*/
function theme_learningzone_get_pre_scss($theme) {
$scss = '';
$configurable = [
// Config key => [variableName, ...].
'siteorangecolor' => 'siteorcolor',
];
// Prepend variables first.
foreach ($configurable as $configkey => $targets) {
$value = isset($theme->settings->{$configkey}) ? $theme->settings->{$configkey} : null;
if (empty($value)) {
continue;
}
array_map(function($target) use (&$scss, $value) {
$scss .= '$' . $target . ': ' . $value . ";\n";
}, (array) $targets);
}
// Prepend pre-scss.
if (!empty($theme->settings->scsspre)) {
$scss .= $theme->settings->scsspre;
}
return $scss;
}
/**
* Inject additional SCSS.
*
* @param theme_config $theme The theme config object.
* @return string
*/
function theme_learningzone_get_extra_scss($theme) {
global $CFG;
$content = '';
// Set the page background image.
$imageurl = $theme->setting_file_url('backgroundimage', 'backgroundimage');
if (!empty($imageurl)) {
$content .= '$imageurl: "' . $imageurl . '";';
$content .= file_get_contents($CFG->dirroot .
'/theme/learningzone/scss/learningzone/body-background.scss');
}
if (!empty($theme->settings->navbardark)) {
$content .= file_get_contents($CFG->dirroot .
'/theme/learningzone/scss/learningzone/navbar-dark.scss');
} else {
$content .= file_get_contents($CFG->dirroot .
'/theme/learningzone/scss/learningzone/navbar-light.scss');
}
if (!empty($theme->settings->scss)) {
$content .= $theme->settings->scss;
}
return $content;
}
/**
* Get compiled css.
*
* @return string compiled css
*/
function theme_learningzone_get_precompiled_css() {
global $CFG;
return file_get_contents($CFG->dirroot . '/theme/learningzone/style/moodle.css');
}
/**
* Serves any files associated with the theme settings.
*
* @param stdClass $course
* @param stdClass $cm
* @param context $context
* @param string $filearea
* @param array $args
* @param bool $forcedownload
* @param array $options
* @return bool
*/

/**
* Gets the colour the user has selected, or the default if they have never changed
*
* @param string $default The default colour to use, normally red
* @return string The colour the user has selected
*/



function theme_learningzone_pluginfile($course, $cm, $context, $filearea, $args, $forcedownload, array $options = array()) {

if ($context->contextlevel == CONTEXT_SYSTEM && ($filearea === 'favicon' || $filearea === 'logo' || $filearea === 'banner1image' || 
$filearea === 'banner2image' || $filearea === 'banner3image'|| $filearea === 'numbersbg' ||
$filearea === 'getthecoachingimage' || $filearea === 'getthecoachingbg' || 
$filearea === 'faculty1image' || $filearea === 'faculty2image' || $filearea === 'faculty3image' || 
$filearea === 'faculty4image' ||
$filearea === 'numbers1icon'|| $filearea === 'numbers2icon'|| 
$filearea === 'numbers3icon'|| $filearea === 'numbers4icon'||  
$filearea === 'clientlogo1' || $filearea === 'clientlogo2' || $filearea === 'clientlogo3' || 
$filearea === 'clientlogo4' || $filearea === 'clientlogo5' || $filearea === 'clientlogo6' || 
$filearea === 'internalbannerimage' ||
$filearea === 'loginbg' || $filearea === 'instagram1image' || 
$filearea === 'instagram2image' || $filearea === 'instagram3image' || $filearea === 'instagram4image' ||
$filearea === 'instagram5image' || $filearea === 'instagram6image'
)) {
$theme = theme_config::load('learningzone');
// By default, theme files must be cache-able by both browsers and proxies.
if (!array_key_exists('cacheability', $options)) {
$options['cacheability'] = 'public';
}
return $theme->setting_file_serve($filearea, $args, $forcedownload, $options);
} else {
send_file_not_found();
}    
}
/* Multilanguage
--------------------- */
function theme_learningzone_get_setting($setting, $format = false) {
global $CFG;
require_once($CFG->dirroot . '/lib/weblib.php');
static $theme;
if (empty($theme)) {
$theme = theme_config::load('learningzone');
}
if (empty($theme->settings->$setting)) {
return false;
} else if (!$format) {
return $theme->settings->$setting;
} else if ($format === 'format_text') {
return format_text($theme->settings->$setting, FORMAT_PLAIN);
} else if ($format === 'format_html') {
return format_text($theme->settings->$setting, FORMAT_HTML, array('trusted' => true, 'noclean' => true));
} else {
return format_string($theme->settings->$setting);
}
}
