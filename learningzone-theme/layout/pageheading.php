<?php
   defined('MOODLE_INTERNAL') || die();
   ob_start(); 
   require_once('innerbannerheading.php');
   $pageheading = ob_get_clean();
?>