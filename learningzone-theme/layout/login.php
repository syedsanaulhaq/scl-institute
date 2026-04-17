<?php

defined('MOODLE_INTERNAL') || die();
require_once(dirname(__FILE__).'/header.php');
require_once(dirname(__FILE__).'/reg.php');
require_once(dirname(__FILE__).'/botheader.php');
   
$bodyattributes = $OUTPUT->body_attributes();
   
$templatecontext = [

'sitename' => format_string($SITE->shortname, true, ['context' => context_course::instance(SITEID), "escape" => false]),
'output' => $OUTPUT,
'bodyattributes' => $bodyattributes,

// Global
'favicon' => $favicon,
'logourl' => $logourl,
'reg' => $reg,

/*
   ===>>> Social Network Section Settings Start
*/
'displaysocialnetwork' => $displaysocialnetwork,
'hasfacebook' => $hasfacebook,
'hastwitter' => $hastwitter,
'hasgooglepluse' => $hasgooglepluse,
'haspinterest' => $haspinterest,
'hasvimeo' => $hasvimeo,
'hasgit' => $hasgit,
'hasyahoo' => $hasyahoo,
'haslinkdin' => $haslinkdin,

/*
   ===>>> Social Network Section Settings End
*/


/*
	===>>> Footer Section Settings Start
*/


// Footer Section
'displayfootersection' => $displayfootersection,
'footersection1heading' => $footersection1heading,
'footersection1content' => $footersection1content,
'footersection1email' => $footersection1email,
'footersection1contactno' => $footersection1contactno,
'footersection1address' => $footersection1address,


'footersection2heading' => $footersection2heading,
'footersection2link1' => $footersection2link1,
'footersection2link1url' => $footersection2link1url,
'footersection2link2' => $footersection2link2,
'footersection2link2url' => $footersection2link2url,
'footersection2link3' => $footersection2link3,
'footersection2link3url' => $footersection2link3url,
'footersection2link4' => $footersection2link4,
'footersection2link4url' => $footersection2link4url,
'footersection2link5' => $footersection2link5,
'footersection2link5url' => $footersection2link5url,
'footersection3heading' => $footersection3heading,
'footersection3link1' => $footersection3link1,
'footersection3link1url' => $footersection3link1url,
'footersection3link2' => $footersection3link2,
'footersection3link2url' => $footersection3link2url,
'footersection3link3' => $footersection3link3,
'footersection3link3url' => $footersection3link3url,
'footersection3link4' => $footersection3link4,
'footersection3link4url' => $footersection3link4url,
'footersection3link5' => $footersection3link5,
'footersection3link5url' => $footersection3link5url,
'footersection4heading' => $footersection4heading,
'instagram1image' => $instagram1image,
'instagram2image' => $instagram2image,
'instagram3image' => $instagram3image,
'instagram4image' => $instagram4image,
'instagram5image' => $instagram5image,
'instagram6image' => $instagram6image,
'followus' => $followus,
'followusurl' => $followusurl,
'copyrightY' => $copyrightY,
'hascopyright' => $hascopyright,
'backtotop' => $backtotop,
/*
	===>>> Footer Section Settings End
*/

/*
	===>>> Misc Section Settings Start
*/

'reg' => $reg,
'bheader' => $bheader,

/*
	===>>> Misc Section Settings End
*/


];
   
echo $OUTPUT->render_from_template('theme_learningzone/login', $templatecontext);
require_once(dirname(__FILE__).'/footer.php');
?>

