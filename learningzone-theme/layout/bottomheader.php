<!-- Start Bottom Header Section -->
<div class="bottom-header navbar-fixed-top">
   <div class="container-fluid">
      <div class="pull-left">
         <?php if(isloggedin()) { ?>           
         <div class="mycourse"> 
            <a href="<?php echo $CFG->wwwroot;?>/my">     
            <?php echo 'Your Total Courses';
               $courses = enrol_get_my_courses(); ?>
            <span class="circle">
            <?php echo $totalcount = count($courses); ?>
            </span>
            </a>    
         </div>
         <?php } ?>    
      </div>
      <div class="pull-right">    
         <a class="cal" href="<?php echo $CFG->wwwroot;?>/course/"><i class="fa fa-folder-open-o"></i> Courses</a>
         <a class="cal" href="<?php echo $CFG->wwwroot;?>/calendar/view.php?view=month&time"><i class="fa fa-calendar"></i> Calendar</a>
          <?php echo $OUTPUT->search_box(); ?>
      </div>
      <div class="clearfix"></div>
   </div>
</div>
<!-- End Bottom Header Section -->