<div class="loginsection pull-right">
            <?php if(isloggedin()){
               if(isguestuser()){
               ?>
            <i class="fa fa-sign-in" aria-hidden="true"></i>
            <a class="login" href="<?php echo new moodle_url('/login/index.php', array('sesskey'=>sesskey())), get_string('login') ?> "> 
            <?php echo get_string('login') ?>
            </a>
            <?php
               }else{
               ?>
            <?php
               }
               }else{ ?>   
            <?php
               if(!empty($CFG->registerauth)){
                   $authplugin = get_auth_plugin($CFG->registerauth);
                   if($authplugin->can_signup()){
                     
                     ?>
            
            <i class="fa fa-user" aria-hidden="true"></i>
            <a class="signup" href="<?php echo $CFG->wwwroot.'/login/signup.php' ?>">Register</a>
            <?php
               }
               }
               ?>
            <i class="fa fa-sign-in" aria-hidden="true"></i>
            <a class="login" href="<?php echo new moodle_url('/login/index.php', array('sesskey'=>sesskey())), get_string('login') ?> "><?php echo get_string('login') ?>
            </a>
            <?php
               }
               ?>
         </div>

