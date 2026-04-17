<?php
require_once(dirname(__FILE__).'/header.php');
require_once(dirname(__FILE__).'/reg.php');
require_once(dirname(__FILE__).'/botheader.php');
$bodyattributes = $OUTPUT->body_attributes();
$blockspre = $OUTPUT->blocks('side-pre');
$blockspost = $OUTPUT->blocks('side-post');
$hassidepre = $PAGE->blocks->region_has_content('side-pre', $OUTPUT);
$hassidepost = $PAGE->blocks->region_has_content('side-post', $OUTPUT);
$pagelatecontext = [
'sitename' => format_string($SITE->shortname, true, ['context' => context_course::instance(SITEID), "escape" => false]),
'output' => $OUTPUT,
'sidepreblocks' => $blockspre,
'sidepostblocks' => $blockspost,
'haspreblocks' => $hassidepre,
'haspostblocks' => $hassidepost,
'bodyattributes' => $bodyattributes,
// Global
'favicon' => $favicon,
'logourl' => $logourl,    


/*===>>> Banner Settings Start*/

'banner1image' => $banner1image,
'banner2image' => $banner2image,
'banner3image' => $banner3image,
'bannerheading' => $bannerheading,
'bannertagline' => $bannertagline,
'bannerbuttontext' => $bannerbuttontext,
'bannerbuttonurl' => $bannerbuttonurl,

/*===>>> Banner Settings End*/

/*
	===>>> Frontpage Settings Start
*/

'allcoursestagline' => $allcoursestagline,
'mycoursestagline' => $mycoursestagline,
'coursestagline' => $coursestagline,

/*===>>> Number Settings Start*/

'displaynumberssection' => $displaynumberssection,
'numbers' => $numbers,
'numbers1icon' => $numbers1icon,
'numbers1count' => $numbers1count,
'numbers1heading' => $numbers1heading,
'numbers2icon' => $numbers2icon,
'numbers2count' => $numbers2count,
'numbers2heading' => $numbers2heading,
'numbers3icon' => $numbers3icon,
'numbers3count' => $numbers3count,
'numbers3heading' => $numbers3heading,
'numbers4icon' => $numbers4icon,
'numbers4count' => $numbers4count,
'numbers4heading' => $numbers4heading,


/*===>>> Number Settings End*/

/*===>>> Get the coaching Settings Start*/

'displaygetthecoaching' => $displaygetthecoaching,
'getthecoachingimage' => $getthecoachingimage,
'getthecoachingheading' => $getthecoachingheading,
'getthecoachingcontent' => $getthecoachingcontent,
'getthecoachingbuttontext' => $getthecoachingbuttontext,
'getthecoachingbuttonurl' => $getthecoachingbuttonurl,

/*===>>> Get the coaching Settings End*/

/*
	===>>> Frontpage Settings End
*/


/*
	===>>> Tutor Section Settings Start
*/

'displayfacultysection' => $displayfacultysection,
'facultyheading' => $facultyheading,
'facultytagline' => $facultytagline,
'faculty1image' => $faculty1image,
'faculty1name' => $faculty1name,
'faculty1profile' => $faculty1profile,
'faculty2image' => $faculty2image,
'faculty2name' => $faculty2name,
'faculty2url' => $faculty2url,
'faculty2profile' => $faculty2profile,
'faculty3image' => $faculty3image,
'faculty3name' => $faculty3name,
'faculty3url' => $faculty3url,
'faculty3profile' => $faculty3profile,
'faculty4image' => $faculty4image,
'faculty4name' => $faculty4name,
'faculty4url' => $faculty4url,
'faculty4profile' => $faculty4profile,

/*
	===>>> Tutor Section Settings End
*/

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

echo $OUTPUT->render_from_template('theme_learningzone/frontpage', $pagelatecontext);

require_once(dirname(__FILE__).'/footer.php');
