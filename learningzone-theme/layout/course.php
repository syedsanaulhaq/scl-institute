<?php
require_once(dirname(__FILE__).'/header.php');
require_once(dirname(__FILE__).'/reg.php');
require_once(dirname(__FILE__).'/botheader.php');
require_once(dirname(__FILE__).'/pageheading.php');

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
'pageheading' => $pageheading,
'bheader' => $bheader,


/*
   ===>>> Misc Section Settings End
*/
];


?>

<?php
   // Get Course Image and Display.
   global $COURSE;
   if ($COURSE->id > 0) {
       global $CFG;
       if (empty($COURSE->visible)) {
           $attributes['class'] = 'dimmed';
       }
       if ($COURSE instanceof stdClass) {
           //require_once($CFG->libdir . '/coursecatlib.php');
           $COURSE = new core_course_list_element($COURSE);
       }

   }
?>
<?php echo $OUTPUT->doctype(); ?>
<html <?php echo $OUTPUT->htmlattributes(); ?>>
<head>
    <title><?php echo $OUTPUT->page_title(); ?></title>
    <link rel="shortcut icon" href="<?php echo $OUTPUT->favicon(); ?>" />
    <?php echo $OUTPUT->standard_head_html() ?>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body theme="learningzone" <?php echo $OUTPUT->body_attributes(); ?>>

<div id="page-wrapper">
<?php echo $OUTPUT->standard_top_of_body_html() ?>
<div id="page">
<!-- Start navigation -->
<?php
	echo $OUTPUT->render_from_template('theme_learningzone/navbar', $templatecontext);

?>

<!-- End navigation -->
<!-- Start Full-header -->

<?php
	echo $OUTPUT->render_from_template('theme_learningzone/full_header', $templatecontext);
?>
<!-- Start Breadcrumb -->    
<div id="page-navbar-con" class="clearfix">
   <div class="container-fluid">
      <nav class="breadcrumb-nav float-left"><?php echo $OUTPUT->navbar(); ?></nav>
      <div class="breadcrumb-button float-right"><?php echo $OUTPUT->page_heading_button(); ?></div>
   </div>
</div>
<!-- End Breadcrumb -->
<!-- End Full-header -->

    <div class="container-fluid container-wrapper">

        <div id="page-content" class="row <?php if($hassidepre){echo 'blocks-pre';}?><?php if($hassidepost){echo 'blocks-post';}?>">
            <div id="region-main-box" class="region-main">
            	<aside class="col-lg-3 desktop-first-column">
				   <?php if ($COURSE->has_course_contacts()){ ?>
				      <div class="teacherlist">
				         <h3 class="headingtag">Teachers For This Course</h3>
				         <?php   echo $content = html_writer::start_tag('ul', array('class' => 'teachers'));
				            foreach ($COURSE->get_course_contacts() as $userid => $coursecontact) {
				            global $DB, $OUTPUT;
				            $user = $DB->get_record('user', array('id'=> $userid));
				            $face = $OUTPUT->user_picture($user, array('size'=>50) );
				            $name = '<div class = "face pull-left">'.$face. '</div>'. ' ' .
				            html_writer::start_tag('div', array('class' => 'username')).
				                   html_writer::link(new moodle_url('/user/view.php', array('id' => $userid, 'course' => SITEID)), $coursecontact['username']).'</br>'.'<span class="email">'.$user->email.'</span>'.
				            html_writer::end_tag('div');
				            
				            echo $content = html_writer::tag('li', '<div class = "teacher-container clearfix">'.$name.'</div>');
				            
				            
				            }
				            echo $content = html_writer::end_tag('ul'); // .teachers
				            ?>
				      </div>
				      <?php } ?>
				      <?php  $courserenderer = $PAGE->get_renderer('core', 'course');
				         if(!empty($courserenderer->frontpage_my_courses())) { ?>
				      <h3 class="headingtag">My Courses</h3>
				      <div class="allcourses" style="margin-bottom:20px;">
				         <?php
				            echo $courserenderer->frontpage_my_courses(); ?>
				      </div>
				    <?php } ?>
				</aside>
				<section id="region-main" class="region-main-content col-lg-9" aria-label="content">
	                <?php
			            echo $OUTPUT->course_content_header();
			            echo $OUTPUT->main_content();
			            echo $OUTPUT->course_content_footer();
			            echo $OUTPUT->activity_navigation();
	            	?>
	            </section>
            </div>                
        </div>
    </div>


</div>
<?php echo $OUTPUT->standard_after_main_region_html() ?>

<?php
	echo $OUTPUT->render_from_template('theme_learningzone/footer', $templatecontext);
	require_once(dirname(__FILE__).'/footer.php');

?>
<script type="text/javascript">
      var activeurl = window.location;
      $('h3.coursename a[href="' + activeurl + '"]').addClass('active');
   </script>
</div>
</body>
</html>