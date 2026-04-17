<?php
   defined('MOODLE_INTERNAL') || die();
   
   
   //user_preference_allow_ajax_update('drawer-open-nav', PARAM_ALPHA);
   require_once($CFG->libdir . '/behat/lib.php');
   //require_once(dirname(__FILE__).'/fonts.php');
   
   // General Settings
   
   if (!empty($PAGE->theme->settings->favicon)) {
             $favicon = $PAGE->theme->setting_file_url('favicon', 'favicon');
         } else {
             $favicon = $OUTPUT->image_url('favicon', 'theme');
         }
          
 
   
  if (!empty($PAGE->theme->settings->logo)) {
   $logourl = $PAGE->theme->setting_file_url('logo', 'logo');
  }else{
   $logourl =$OUTPUT->image_url('logo', 'theme');
  }

      
/*
  ===>>> Banner Settings Start
*/
    if (!empty($PAGE->theme->settings->banner1image)) {
       $banner1image = $PAGE->theme->setting_file_url('banner1image', 'banner1image');
    } else {
        $banner1image = $OUTPUT->image_url('banner1image', 'theme');
    }
   
   if (!empty($PAGE->theme->settings->banner2image)) {
       $banner2image = $PAGE->theme->setting_file_url('banner2image', 'banner2image');
   } else {
        $banner2image = $OUTPUT->image_url('banner2image', 'theme');
   }
   
   if (!empty($PAGE->theme->settings->banner3image)) {
       $banner3image = $PAGE->theme->setting_file_url('banner3image', 'banner3image');
   } else {
        $banner3image = $OUTPUT->image_url('banner3image', 'theme');
   }
   if (!empty($PAGE->theme->settings->bannerheading)) {
       $bannerheading = theme_learningzone_get_setting('bannerheading',true);
   } 
   else {
       $bannerheading = '';
   }
   if (!empty($PAGE->theme->settings->bannertagline)) {
       $bannertagline = theme_learningzone_get_setting('bannertagline',true);
   }
   else {
       $bannertagline = '';
   }
   if (!empty($PAGE->theme->settings->bannerbuttontext)) {
       $bannerbuttontext = theme_learningzone_get_setting('bannerbuttontext',true);
   } 
   else {
       $bannerbuttontext = '';
   }
   if (!empty($PAGE->theme->settings->bannerbuttonurl)) {
       $bannerbuttonurl = theme_learningzone_get_setting('bannerbuttonurl',true);
   } 
   else {
       $bannerbuttonurl = '';
   }

/*
  ===>>> Banner Settings End
*/
   
      
/*
  ===>>> Frontpage Settings Start
*/
   
  if (!empty($PAGE->theme->settings->allcoursestagline)) {
    $allcoursestagline = theme_learningzone_get_setting('allcoursestagline',true);
  }else {
    $allcoursestagline = '';
  }
  if (!empty($PAGE->theme->settings->mycoursestagline)) {
    $mycoursestagline = theme_learningzone_get_setting('mycoursestagline',true);
  }else {
    $mycoursestagline = '';
  }
  if (!empty($PAGE->theme->settings->coursestagline)) {
    $coursestagline = theme_learningzone_get_setting('coursestagline',true);
  }else {
    $coursestagline = '';
  }



  $displaygetthecoaching = (empty($PAGE->theme->settings->displaygetthecoaching) ||$PAGE->theme->settings->displaygetthecoaching < 1) ? 0 : 1;
   
   if (!empty($PAGE->theme->settings->getthecoachingimage)) {
      $getthecoachingimage = $PAGE->theme->setting_file_url('getthecoachingimage', 'getthecoachingimage');
   } else {
       $getthecoachingimage = $OUTPUT->image_url('getthecoachingimage', 'theme');
   }
   if (!empty($PAGE->theme->settings->getthecoachingheading)) {
       $getthecoachingheading = theme_learningzone_get_setting('getthecoachingheading','true');
   } 
   else {
       $getthecoachingheading = '';
   }
   if (!empty($PAGE->theme->settings->getthecoachingcontent)) {
       $getthecoachingcontent = theme_learningzone_get_setting('getthecoachingcontent','true');
   } 
   else {
       $getthecoachingcontent = '';
   }
   if (!empty($PAGE->theme->settings->getthecoachingbuttontext)) {
       $getthecoachingbuttontext = theme_learningzone_get_setting('getthecoachingbuttontext',true);
   } 
   else {
       $getthecoachingbuttontext = '';
   }
   if (!empty($PAGE->theme->settings->getthecoachingbuttonurl)) {
       $getthecoachingbuttonurl = $PAGE->theme->settings->getthecoachingbuttonurl;
   } 
   else {
       $getthecoachingbuttonurl = '';
   }

/*
  ===>>> Frontpage Settings End
*/
   
/*
   @@@>>> Number Settings Start
*/
$displaynumberssection = (empty($PAGE->theme->settings->displaynumberssection) ||$PAGE->theme->settings->displaynumberssection < 1) ? 0 : 1;
   
 if (!empty($PAGE->theme->settings->numbers)) {
     $numbers = theme_learningzone_get_setting('numbers','true');
 } 
 else {
     $numbers = '';
 }
 if (!empty($PAGE->theme->settings->numbers1icon)) {
    $numbers1icon = $PAGE->theme->setting_file_url('numbers1icon', 'numbers1icon');
 } else {
     $numbers1icon = $OUTPUT->image_url('icon-1', 'theme');
 }
 if (!empty($PAGE->theme->settings->numbers1count)) {
     $numbers1count = theme_learningzone_get_setting('numbers1count',true);
 } 
 else {
     $numbers1count = '';
 }
 if (!empty($PAGE->theme->settings->numbers1heading)) {
     $numbers1heading = theme_learningzone_get_setting('numbers1heading',true);
 } 
 else {
     $numbers1heading = '';
 }
 if (!empty($PAGE->theme->settings->numbers2icon)) {
    $numbers2icon = $PAGE->theme->setting_file_url('numbers2icon', 'numbers2icon');
 } else {
     $numbers2icon = $OUTPUT->image_url('icon-2', 'theme');
 }
 if (!empty($PAGE->theme->settings->numbers2count)) {
     $numbers2count = theme_learningzone_get_setting('numbers2count',true);
 } 
 else {
     $numbers2count = '';
 }
 if (!empty($PAGE->theme->settings->numbers2heading)) {
     $numbers2heading = theme_learningzone_get_setting('numbers2heading',true);
 } 
 else {
     $numbers2heading = '';
 }
 if (!empty($PAGE->theme->settings->numbers3icon)) {
    $numbers3icon = $PAGE->theme->setting_file_url('numbers3icon', 'numbers3icon');
 } else {
     $numbers3icon = $OUTPUT->image_url('icon-3', 'theme');
 }
 if (!empty($PAGE->theme->settings->numbers3count)) {
     $numbers3count = theme_learningzone_get_setting('numbers3count',true);
 } 
 else {
     $numbers3count = '';
 }
 if (!empty($PAGE->theme->settings->numbers3heading)) {
     $numbers3heading = theme_learningzone_get_setting('numbers3heading',true);
 } 
 else {
     $numbers3heading = '';
 }
 
 if (!empty($PAGE->theme->settings->numbers4icon)) {
    $numbers4icon = $PAGE->theme->setting_file_url('numbers4icon', 'numbers4icon');
 } else {
     $numbers4icon = $OUTPUT->image_url('icon-4', 'theme');
 }
 if (!empty($PAGE->theme->settings->numbers4count)) {
     $numbers4count = theme_learningzone_get_setting('numbers4count',true);
 } 
 else {
     $numbers4count = '';
 }
 if (!empty($PAGE->theme->settings->numbers4heading)) {
     $numbers4heading = theme_learningzone_get_setting('numbers4heading',true);
 } 
 else {
     $numbers4heading = '';
 }
   

/*
   @@@>>> Number Settings End
*/


/*
   @@@>>> Faculty Section Settings Start
*/

$displayfacultysection = (empty($PAGE->theme->settings->displayfacultysection) ||$PAGE->theme->settings->displayfacultysection < 1) ? 0 : 1;
      
if (!empty($PAGE->theme->settings->facultyheading)) {
       $facultyheading = theme_learningzone_get_setting('facultyheading',true);
   } 
   else {
       $facultyheading = '';
   }
   if (!empty($PAGE->theme->settings->facultytagline)) {
       $facultytagline = theme_learningzone_get_setting('facultytagline',true);
   } 
   else {
       $facultytagline = '';
   }
   if (!empty($PAGE->theme->settings->faculty1image)) {
      $faculty1image = $PAGE->theme->setting_file_url('faculty1image', 'faculty1image');
   } else {
       $faculty1image = $OUTPUT->image_url('faculty1image', 'theme');
   }
   if (!empty($PAGE->theme->settings->faculty1name)) {
       $faculty1name =theme_learningzone_get_setting('faculty1name',true);
   }else {
       $faculty1name = '';
   }
   if (!empty($PAGE->theme->settings->faculty1url)) {
       $faculty1url =$PAGE->theme->settings->faculty1url;
   }else {
       $faculty1url = '';
   }
   if (!empty($PAGE->theme->settings->faculty1profile)) {
       $faculty1profile = theme_learningzone_get_setting('faculty1profile',true);
   } 
   else {
       $faculty1profile = '';
   }
   
   if (!empty($PAGE->theme->settings->faculty2image)) {
      $faculty2image = $PAGE->theme->setting_file_url('faculty2image', 'faculty2image');
   } else {
       $faculty2image = $OUTPUT->image_url('faculty2image', 'theme');
   }
   if (!empty($PAGE->theme->settings->faculty2name)) {
       $faculty2name =theme_learningzone_get_setting('faculty2name',true);
   }else {
       $faculty2name = '';
   }
   if (!empty($PAGE->theme->settings->faculty2url)) {
       $faculty2url =$PAGE->theme->settings->faculty2url;
   }else {
       $faculty2url = '';
   }
   if (!empty($PAGE->theme->settings->faculty2profile)) {
       $faculty2profile = theme_learningzone_get_setting('faculty2profile',true);
   } 
   else {
       $faculty2profile = '';
   }
   
   if (!empty($PAGE->theme->settings->faculty3image)) {
      $faculty3image = $PAGE->theme->setting_file_url('faculty3image', 'faculty3image');
   } else {
       $faculty3image = $OUTPUT->image_url('faculty3image', 'theme');
   }
   if (!empty($PAGE->theme->settings->faculty3name)) {
       $faculty3name =theme_learningzone_get_setting('faculty3name',true);
   }else {
       $faculty3name = '';
   }
   if (!empty($PAGE->theme->settings->faculty3url)) {
       $faculty3url =$PAGE->theme->settings->faculty3url;
   }else {
       $faculty3url = '';
   }
   if (!empty($PAGE->theme->settings->faculty3profile)) {
       $faculty3profile = theme_learningzone_get_setting('faculty3profile',true);
   } 
   else {
       $faculty3profile = '';
   }
   
   if (!empty($PAGE->theme->settings->faculty4image)) {
      $faculty4image = $PAGE->theme->setting_file_url('faculty4image', 'faculty4image');
   } else {
       $faculty4image = $OUTPUT->image_url('faculty4image', 'theme');
   }
   if (!empty($PAGE->theme->settings->faculty4name)) {
       $faculty4name =theme_learningzone_get_setting('faculty4name',true);
   }else {
       $faculty4name = '';
   }
   if (!empty($PAGE->theme->settings->faculty4url)) {
       $faculty4url =$PAGE->theme->settings->faculty4url;
   }else {
       $faculty4url = '';
   }
   if (!empty($PAGE->theme->settings->faculty4profile)) {
       $faculty4profile = theme_learningzone_get_setting('faculty4profile',true);
   } 
   else {
       $faculty4profile = '';
   }     

/*
   @@@>>> Faculty Section Settings End
*/

/*
   ===>>> Social Network Section Settings Start
*/
$displaysocialnetwork = (empty($PAGE->theme->settings->displaysocialnetwork) ||$PAGE->theme->settings->displaysocialnetwork < 1) ? 0 : 1;

$hasfacebook    = (empty($PAGE->theme->settings->facebook)) ? false : $PAGE->theme->settings->facebook;
   // If any of the above social networks are true, sets this to true.
$hassocialnetworks = ($hasfacebook) ? true : false;

$hastwitter    = (empty($PAGE->theme->settings->twitter)) ? false : $PAGE->theme->settings->twitter;
// If any of the above social networks are true, sets this to true.
$hassocialnetworks = ($hastwitter) ? true : false;

$hasgooglepluse    = (empty($PAGE->theme->settings->googlepluse)) ? false : $PAGE->theme->settings->googlepluse;
// If any of the above social networks are true, sets this to true.
$hassocialnetworks = ($hasgooglepluse) ? true : false;

$haspinterest    = (empty($PAGE->theme->settings->pinterest)) ? false : $PAGE->theme->settings->pinterest;
// If any of the above social networks are true, sets this to true.
$hassocialnetworks = ($haspinterest) ? true : false;

$hasvimeo    = (empty($PAGE->theme->settings->vimeo)) ? false : $PAGE->theme->settings->vimeo;
// If any of the above social networks are true, sets this to true.
$hassocialnetworks = ($hasvimeo) ? true : false;

$hasgit    = (empty($PAGE->theme->settings->git)) ? false : $PAGE->theme->settings->git;
// If any of the above social networks are true, sets this to true.
$hassocialnetworks = ($hasgit) ? true : false;

$hasyahoo    = (empty($PAGE->theme->settings->yahoo)) ? false : $PAGE->theme->settings->yahoo;
// If any of the above social networks are true, sets this to true.
$hassocialnetworks = ($hasyahoo) ? true : false;

$haslinkdin    = (empty($PAGE->theme->settings->linkdin)) ? false : $PAGE->theme->settings->linkdin;
// If any of the above social networks are true, sets this to true.
$hassocialnetworks = ($haslinkdin) ? true : false; 


/*
   ===>>> Social Network Section Settings End
*/

/*
   @@@>>> Footer Section Settings Start
*/


// Footer Settings
$displayfootersection = (empty($PAGE->theme->settings->displayfooter) ||$PAGE->theme->settings->displayfooter < 1) ? 0 : 1;

if (!empty($PAGE->theme->settings->footersection1heading)) {
    $footersection1heading = theme_learningzone_get_setting('footersection1heading','format_html');
}else {
    $footersection1heading = '';
}
if (!empty($PAGE->theme->settings->footersection1content)) {
    $footersection1content = theme_learningzone_get_setting('footersection1content',true);
}else {
    $footersection1content = '';
}
if (!empty($PAGE->theme->settings->footersection1email)) {
    $footersection1email = theme_learningzone_get_setting('footersection1email',true);
}else {
    $footersection1email = '';
}
if (!empty($PAGE->theme->settings->footersection1contactno)) {
    $footersection1contactno = theme_learningzone_get_setting('footersection1contactno',true);
}else {
    $footersection1contactno = '';
}
if (!empty($PAGE->theme->settings->footersection1address)) {
    $footersection1address = theme_learningzone_get_setting('footersection1address',true);
}else {
    $footersection1address = '';
}

if (!empty($PAGE->theme->settings->footersection2heading)) {
   $footersection2heading = theme_learningzone_get_setting('footersection2heading',true);
}else {
   $footersection2heading = '';
}
if (!empty($PAGE->theme->settings->footersection2link1)) {
   $footersection2link1 = theme_learningzone_get_setting('footersection2link1',true);
}else {
   $footersection2link1 = '';
}
if (!empty($PAGE->theme->settings->footersection2link1url)) {
   $footersection2link1url = theme_learningzone_get_setting('footersection2link1url',true);
}else {
   $footersection2link1url = '';
}
if (!empty($PAGE->theme->settings->footersection2link2)) {
   $footersection2link2 = theme_learningzone_get_setting('footersection2link2',true);
}else {
   $footersection2link2 = '';
}
if (!empty($PAGE->theme->settings->footersection2link2url)) {
   $footersection2link2url = theme_learningzone_get_setting('footersection2link2url',true);
}else {
   $footersection2link2url = '';
}
if (!empty($PAGE->theme->settings->footersection2link3)) {
   $footersection2link3 = theme_learningzone_get_setting('footersection2link3',true);
}else {
   $footersection2link3 = '';
}
if (!empty($PAGE->theme->settings->footersection2link3url)) {
   $footersection2link3url = theme_learningzone_get_setting('footersection2link3url',true);
}else {
   $footersection2link3url = '';
}
if (!empty($PAGE->theme->settings->footersection2link4)) {
   $footersection2link4 = theme_learningzone_get_setting('footersection2link4',true);
}else {
   $footersection2link4 = '';
}
if (!empty($PAGE->theme->settings->footersection2link4url)) {
   $footersection2link4url = theme_learningzone_get_setting('footersection2link4url',true);
}else {
   $footersection2link4url = '';
}
if (!empty($PAGE->theme->settings->footersection2link5)) {
   $footersection2link5 = theme_learningzone_get_setting('footersection2link5',true);
}else {
   $footersection2link5 = '';
}
if (!empty($PAGE->theme->settings->footersection2link5url)) {
   $footersection2link5url = theme_learningzone_get_setting('footersection2link5url',true);
}else {
   $footersection2link5url = '';
}
if (!empty($PAGE->theme->settings->footersection3heading)) {
   $footersection3heading = theme_learningzone_get_setting('footersection3heading',true);
}else {
   $footersection3heading = '';
}
if (!empty($PAGE->theme->settings->footersection3link1)) {
   $footersection3link1 = theme_learningzone_get_setting('footersection3link1',true);
}else {
   $footersection3link1 = '';
}
if (!empty($PAGE->theme->settings->footersection3link1url)) {
   $footersection3link1url = theme_learningzone_get_setting('footersection3link1url',true);
}else {
   $footersection3link1url = '';
}
if (!empty($PAGE->theme->settings->footersection3link2)) {
   $footersection3link2 = theme_learningzone_get_setting('footersection3link2',true);
}else {
   $footersection3link2 = '';
}
if (!empty($PAGE->theme->settings->footersection3link2url)) {
   $footersection3link2url = theme_learningzone_get_setting('footersection3link2url',true);
}else {
   $footersection3link2url = '';
}
if (!empty($PAGE->theme->settings->footersection3link3)) {
   $footersection3link3 = theme_learningzone_get_setting('footersection3link3',true);
}else {
   $footersection3link3 = '';
}
if (!empty($PAGE->theme->settings->footersection3link3url)) {
   $footersection3link3url = theme_learningzone_get_setting('footersection3link3url',true);
}else {
   $footersection3link3url = '';
}
if (!empty($PAGE->theme->settings->footersection3link4)) {
   $footersection3link4 = theme_learningzone_get_setting('footersection3link4',true);
}else {
   $footersection3link4 = '';
}
if (!empty($PAGE->theme->settings->footersection3link4url)) {
   $footersection3link4url = theme_learningzone_get_setting('footersection3link4url',true);
}else {
   $footersection3link4url = '';
}
if (!empty($PAGE->theme->settings->footersection3link5)) {
   $footersection3link5 = theme_learningzone_get_setting('footersection3link5',true);
}else {
   $footersection3link5 = '';
}
if (!empty($PAGE->theme->settings->footersection3link5url)) {
 $footersection3link5url = theme_learningzone_get_setting('footersection3link5url',true);
}else {
 $footersection3link5url = '';
}

if (!empty($PAGE->theme->settings->footersection4heading)) {
$footersection4heading = theme_learningzone_get_setting('footersection4heading',true);
}else {
  $footersection4heading = '';
}

if (!empty($PAGE->theme->settings->instagram1image)) {
$instagram1image = $PAGE->theme->setting_file_url('instagram1image', 'instagram1image');
} else {
    $instagram1image = $OUTPUT->image_url('instagram-1-image', 'theme');
}
if (!empty($PAGE->theme->settings->instagram2image)) {
   $instagram2image = $PAGE->theme->setting_file_url('instagram2image', 'instagram2image');
} else {
    $instagram2image = $OUTPUT->image_url('instagram-2-image', 'theme');
}
if (!empty($PAGE->theme->settings->instagram3image)) {
   $instagram3image = $PAGE->theme->setting_file_url('instagram3image', 'instagram3image');
} else {
    $instagram3image = $OUTPUT->image_url('instagram-3-image', 'theme');
}
if (!empty($PAGE->theme->settings->instagram4image)) {
   $instagram4image = $PAGE->theme->setting_file_url('instagram4image', 'instagram4image');
} else {
    $instagram4image = $OUTPUT->image_url('instagram-4-image', 'theme');
}
if (!empty($PAGE->theme->settings->instagram5image)) {
   $instagram5image = $PAGE->theme->setting_file_url('instagram5image', 'instagram5image');
} else {
    $instagram5image = $OUTPUT->image_url('instagram-5-image', 'theme');
}
if (!empty($PAGE->theme->settings->instagram6image)) {
   $instagram6image = $PAGE->theme->setting_file_url('instagram6image', 'instagram6image');
} else {
    $instagram6image = $OUTPUT->image_url('instagram-6-image', 'theme');
}

if (!empty($PAGE->theme->settings->followus)) {
    $followus = theme_learningzone_get_setting('followus',true);
}else {
    $followus = '';
}
if (!empty($PAGE->theme->settings->followusurl)) {
    $followusurl = theme_learningzone_get_setting('followusurl',true);
}else {
    $followusurl = '';
}
$copyrightY = date("Y");
if (!empty($PAGE->theme->settings->copyright)) {
    $hascopyright = theme_learningzone_get_setting('copyright',true);
} 
else {
    $hascopyright = '';
} 

if (!empty($PAGE->theme->settings->backtotop)) {
 $backtotop = theme_learningzone_get_setting('backtotop',true);
}else {
 $backtotop = '';
}

/*
   @@@>>> Footer Section Settings Start
*/
          
   ?>
