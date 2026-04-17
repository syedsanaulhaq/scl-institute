<?php
require_once(dirname(__FILE__).'/header.php');
$bodyattributes = $OUTPUT->body_attributes();
$blockspre = $OUTPUT->blocks('side-pre');
$blockspost = $OUTPUT->blocks('side-post');
$hassidepre = $PAGE->blocks->region_has_content('side-pre', $OUTPUT);
$hassidepost = $PAGE->blocks->region_has_content('side-post', $OUTPUT);
$templatecontext = [
'sitename' => format_string($SITE->shortname, true, ['context' => context_course::instance(SITEID), "escape" => false]),
'output' => $OUTPUT,
'sidepreblocks' => $blockspre,
'sidepostblocks' => $blockspost,
'haspreblocks' => $hassidepre,
'haspostblocks' => $hassidepost,
'bodyattributes' => $bodyattributes,
// Global
'favicon' => $favicon,


/*===>>> TopHeader Settings Start*/

'logourl' => $logourl,    


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


/*
	===>>> Misc Section Settings End
*/
];

echo $OUTPUT->render_from_template('theme_learningzone/secure', $templatecontext);
require_once(dirname(__FILE__).'/footer.php');
