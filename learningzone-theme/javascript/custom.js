  $(document).ready(function () {


/*
  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>learningzone Javascript Start<<<<<<<<<<<<<<<<<<<<<<<<<<<<<=
*/

/*=====
    ======= Banner Section Start============
============*/
if($("body.pagelayout-frontpage").length > 0){

  $("#slider3").responsiveSlides({
      manualControls: '#slider3-pager',
      //maxwidth: 540
      auto: true,
      pager: false,
      nav: true,
      speed: 500,
      namespace: "callbacks",
      before: function() {
          $('.events').append("<li>before event fired.</li>");
      },
      after: function() {
          $('.events').append("<li>after event fired.</li>");
      }
  });
}



/*=====
    ======= Banner Section End============
============*/


/*=====
    ======= Site News DOM Modifications Start============
============*/

try{

    if($("#page-content #site-news-forum").length > 0) {

        var siteNews = $("#page-content #site-news-forum");
        $('#news .container-fluid').append(siteNews);
        
    }

    if ($('#site-news-forum').length === 0) {
        $('#page #latest-news').css({
            'display': 'none'
        });
    }

    if ($("#site-news-forum .forumpost")) {
        $("#site-news-forum .forumpost").addClass("item");
    }
    if ($("#site-news-forum .forumpost.item")) {
        $("#site-news-forum .forumpost.item").wrapAll("<div id='owl-demo2' class='owl-carousel owl-theme'></div>");
    }

}catch(ignore){}

try{

  if ($('#site-news-forum > h2')) {
    $('#site-news-forum > h2').addClass('newsheading');
  }

  if ($('#site-news-forum .p-t-1.p-b-1').length > 0) {
      $('#site-news-forum .p-t-1.p-b-1 a.btn.btn-primary').insertAfter($("#site-news-forum .subscribelink"));
  }

}catch(ignore){}

/*=====
    ======= Site News DOM Modifications End============
============*/

/*=====
    ======= Site News Owl Carousal Start============
============*/
if($("body.pagelayout-frontpage").length > 0){
if ($('body').hasClass('dir-rtl') === true) {
        $('#owl-demo2').addClass('owl-rtl');
        $("#owl-demo2").owlCarousel({
            rtl: true,
            loop: false,
            margin: 10,
            nav: false,
            autoplay: 5000,
            navigation: false,
            singleItem: true,
            dots:true,
            responsiveClass: true,
            responsive: {
                0: {
                    items: 1,
                },
                600: {
                    items: 1,
                },
                1000: {
                    items: 1,
                }
            }

        });
    } else {
        $("#owl-demo2").owlCarousel({
            rtl: false,
            loop: false,
            margin: 10,
            nav: false,
            autoplay: 5000,
            navigation: false,
            singleItem: true,
            dots:true,
            responsiveClass: true,
            responsive: {
                0: {
                    items: 1,
                },
                600: {
                    items: 1,
                },
                1000: {
                    items: 1,
                }
            }

        });
    }
}
/*=====
    ======= Site News Owl Carousal End============
============*/



/*=====
      ======= Home Page All Available Courses Start============
  ============*/
try{
    var mainWrapper = $('.frontpage-course-list-all, .frontpage-course-list-enrolled, .course_category_tree');
    if (mainWrapper) {
      mainWrapper.each(function (ind, obj) {
        var coursebox = $(obj).find('.coursebox');
        if (coursebox) {
          coursebox.each(function (index, obj) {
            var courseimage = $(obj).find('.content .courseimage');
            var summaryNode = $(obj).find('.content .summary');
            var teacherNode = $(obj).find('.content ul.teachers');
            var moreContentNode = summaryNode && summaryNode.find(".morecontent span");
            var findDiv = $(obj).find('.info');
            if (courseimage.length > 0) {
              courseimage.insertBefore(findDiv);
            }else{
              $(obj).find('.content').addClass("nonimage");
            }
            if (findDiv && summaryNode) {
              findDiv.insertBefore(summaryNode);
            }

            if (teacherNode.length > 0 && moreContentNode.length > 0) {
              moreContentNode.append(teacherNode);
            }
          });
        }
      });
    }

}catch(ignore){}

try{

  if ($('.frontpage-course-list-all')) {
      $('.frontpage-course-list-all').parent().addClass("ourcourses");
    }

    if ($('.ourcourses > h2')) {
      $('.ourcourses > h2').addClass('ourcoursesheading');
    }

    var elements = document.getElementsByClassName('ourcoursesheading');
    if (elements) {
      for (var i = 0; i < elements.length; i++) {
        if (elements[i].innerHTML == 'Available courses') {
          elements[i].innerHTML = "Discover Our Programs";
          break;
        }
      }
    }


    if ($('#frontpage-available-course-list > h2')) {
        $('#frontpage-available-course-list > h2').after('<p id="allcoursestagline" class="tagline"></p>');
        var allCoursesTag = document.getElementById("allcoursestagline") ? document.getElementById("allcoursestagline").innerHTML = allcoursestagline : '';
        console.log("allCoursesTag::", allCoursesTag);
    }


    var ourCourses = $('.ourcourses').html();
    if (typeof ourCourses !== 'undefined' && ourCourses !== null) {
      if ($('#course-collection > .container-fluid')) {
        $('#course-collection > .container-fluid').append('<div id="frontpage-available-course-list" class="ourcourses">' + ourCourses + '</div>');
      }
      if ($('#region-main .ourcourses')) {
        $('#region-main .ourcourses').remove();
      }

    };
    if ($('.ourcourses').length === 0) {
      $('#page #course-collection').remove();
    }


}catch(ignore){}

  

  /*=====
      ======= Home Page All Available Courses End============
  ============*/


  /*=====
        ======= Front Page Available Course List Column DOM Modifications Start============
    ============*/

        try {
            var _frontpageCourseListAll = $('.frontpage-course-list-all');
            var frontpageCourseListAll = $(_frontpageCourseListAll[0]);
            if (frontpageCourseListAll) {

                var totalPageWidth = $(frontpageCourseListAll).width();
                frontpageCourseListAll.find('.coursebox').addClass('proxyW');
                var courseBoxWidth = frontpageCourseListAll.find('.coursebox:first').width();
                var allBoxes = frontpageCourseListAll.find('.coursebox');
                var totalBoxes = allBoxes.length;
                var boxesPerRow = Math.floor(totalPageWidth / courseBoxWidth);
                frontpageCourseListAll.find('.coursebox').removeClass('proxyW');
                var temp2, temp3, shadowPAGE = $('<div class="shadow-frontpage-course-list-all row-fluid-5"></div>');
                for (temp2 = 0; temp2 < boxesPerRow; temp2++) {
                    shadowPAGE.append('<div class="course-section col-lg-3 col-md-6 col-sm-12  course-section-' + temp2 + '"></div>');
                }
                for (temp2 = 0, temp3 = 0; temp2 < totalBoxes; temp2++, temp3 = (temp3 < (boxesPerRow - 1) ? temp3 + 1 : 0)) {

                    shadowPAGE.find('.course-section-' + temp3).append($(allBoxes[temp2]).clone());
                }
                var pageingMore$ = $('.frontpage-course-list-all .paging-morelink');
                shadowPAGE.append('<div class="clearfix"></div>');
                frontpageCourseListAll.html(shadowPAGE);
                if (pageingMore$ != null && pageingMore$.length > 0) {
                    pageingMore$.insertAfter(shadowPAGE);
                }
            }


            $(".visitlink a > span").addClass("all");
   
            var elements = document.getElementsByClassName('all');
            for (var i = 0; i < elements.length; i++) {
               if (elements[i].innerHTML == 'Course') {
                   elements[i].innerHTML = "Enter";
               }
            }


        } catch (ignore) {}


        /*=====
            ======= Front Page Available Course List Column DOM Modifications End============
        ============*/


        /*=====
      ======= Home Page Enrolled Courses Start============
  ============*/


try{

  if ($('.frontpage-course-list-enrolled')) {
    $('.frontpage-course-list-enrolled').parent().addClass("mycourses");
  }

  if ($('.mycourses > h2')) {
    $('.mycourses > h2').addClass('mycoursesheading');
  }

  var elements = document.getElementsByClassName('mycoursesheading');
  if (elements) {
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].innerHTML == 'My courses') {
        elements[i].innerHTML = "All Your Enrolled Courses";
        break;
      }
    }
  }

if ($('#frontpage-course-list > h2')) {
  $('#frontpage-course-list > h2').after('<p id="enrolledcoursestagline" class="tagline"></p>');
  var allCoursesTag = document.getElementById("enrolledcoursestagline") ? document.getElementById("enrolledcoursestagline").innerHTML = mycoursestagline : '';
}

var myCourses = $('.mycourses').html();
  if (typeof myCourses !== 'undefined' && myCourses !== null) {
    if ($('#enrolledcourses > .container-fluid')) {
      $('#enrolledcourses > .container-fluid').append('<div id="frontpage-course-list" class="mycourses">' + myCourses + '</div>');
    }

    

    if ($('#region-main .mycourses')) {
      $('#region-main .mycourses').remove();
    }

  }
  if ($('.mycourses').length === 0) {
    $('#page #enrolledcourses').remove();
  }
if($("#frontpage-course-list h2.mycoursesheading").length > 0){
    if(!$("#enrolledcourses .enrolledheader .container-fluid h2.mycoursesheading").length > 0){
        $("#enrolledcourses .enrolledheader .container-fluid").append($("#frontpage-course-list h2.mycoursesheading"));
    }
}

if($("#frontpage-course-list p#enrolledcoursestagline").length > 0){
    if(!$("#enrolledcourses .enrolledheader .container-fluid p#enrolledcoursestagline").length > 0){
        $("#enrolledcourses .enrolledheader .container-fluid").append($("#frontpage-course-list p#enrolledcoursestagline"));
    }
}

}catch(ignore){}



  /*=====
      ======= Home Page Enrolled Courses End============
  ============*/


        /*=====
            ======= Front Page Enrolled Course List Column DOM Modifications Start============
        ============*/


        try {
            var frontpageCourseListEnrolled = $('body.pagelayout-frontpage .frontpage-course-list-enrolled');
            var totalPageWidth = $(frontpageCourseListEnrolled).width();
            frontpageCourseListEnrolled.find('.coursebox').addClass('proxyW');
            var courseBoxWidth = frontpageCourseListEnrolled.find('.coursebox:first').width();
            var enrolledBoxes = frontpageCourseListEnrolled.find('.coursebox');
            var totalBoxes = enrolledBoxes.length;
            var boxesPerRow = Math.floor(totalPageWidth / courseBoxWidth);
            frontpageCourseListEnrolled.find('.coursebox').removeClass('proxyW');
            var temp2, temp3, shadowPAGE = $('<div class="shadow-frontpage-course-list-enrolled row-fluid-5"></div>');
            for (temp2 = 0; temp2 < boxesPerRow; temp2++) {
                shadowPAGE.append('<div class="course-section col-lg-3 col-md-6 col-sm-12 course-section-' + temp2 + '"></div>');
            }
            for (temp2 = 0, temp3 = 0; temp2 < totalBoxes; temp2++, temp3 = (temp3 < (boxesPerRow - 1) ? temp3 + 1 : 0)) {
                shadowPAGE.find('.course-section-' + temp3).append($(enrolledBoxes[temp2]).clone());
            }
            var pageingMore$ = $('.frontpage-course-list-enrolled .paging-morelink');
            shadowPAGE.append('<div class="clearfix"></div>');

            frontpageCourseListEnrolled.html(shadowPAGE);

            if (pageingMore$ != null && pageingMore$.length > 0) {
                pageingMore$.insertAfter(shadowPAGE);
            }

        } catch (ignore) {}

         
       /*=====
            ======= Front Page Enrolled Course List Column DOM Modifications End============
        ============*/


        /*=====
            ======= Search Course Section Start============
        ============*/

//        try {
//          var courseSearch = $('.simplesearchform').html(); 
//          if (typeof courseSearch !== 'undefined' && courseSearch !== null) {
//            if ($('.searchcourses > .container-fluid')) {
//              $('.searchcourses > .container-fluid').append('<form class"xfg" action="./course/search.php">' + courseSearch + '</form>');
//            }
//            if ($('#region-main .simplesearchform')) {
//              $('#region-main .simplesearchform').remove();
//            }
//
//          };
//          if ($('.simplesearchform').length === 0) {
//            $('#page .searchcourses').remove();
//          }
//        } catch (ignore) {}

    /*=====
        ======= Search Course Section End============
    ============*/


/*=====
    ======= Frontpage Category Combo Section Start============
============*/

try{

if($("#frontpage-category-combo").length > 0) {

  var cateCombo = $("#page-content #frontpage-category-combo");
  $('#frontpage-category-wrapper > .container-fluid').append(cateCombo);
        
}

  $("#frontpage-category-combo > h2").after("<p id='coursestagline' class='tagline'></p>");
  var courseTag = document.getElementById("coursestagline") ? document.getElementById("coursestagline").innerHTML = coursestagline : '';

}catch(ignore){}




/*=====
    ======= Frontpage Category Combo Section End============
============*/


/*=====
    ======= Frontpage Category Section Start============
============*/

try{
  var frontpageCategory = $('#frontpage-category-names').html();
  if (typeof frontpageCategory !== 'undefined' && frontpageCategory !== null) {
      $('#block-region-side-pre').prepend('<div id="frontpage-category-names">' + frontpageCategory + '</div>');
      $('#region-main #frontpage-category-names').css({
          'display': 'none'
      });
  };

  $('#frontpage-category-names h2').each(function() {
      var text = $(this).text().split(' ');
      if (text.length < 2)
          return;
      text[0] = '<span class="hide">' + text[0] + '</span>';

      $(this).html(text.join(' '));
  });

}catch(ignore){}
/*=====
    ======= Frontpage Category Section End============
============*/

/*=====
    ======= Number Counter Section Start============
============*/
try{
  $('.counter').counterUp({
     delay: 10,
     time: 1000
  });
}catch(ignore){}

/*=====
    ======= Course Counter Section End============
============*/

/*=====
    ======= Course Page Section Start============
============*/

try{

  if($("body.pagelayout-course").length > 0){

    if($("#nav-main ul.right-top-header li.user-menu .usermenu a.dropdown-toggle").length > 0){
      $("#nav-main ul.right-top-header li.user-menu .usermenu a.dropdown-toggle").attr({
      "href" : "javascript:void(0);"
      });
      $('body.pagelayout-course .course-content a.dropdown-toggle').each(function(index, value){
       $(this).attr("href", "javascript:void(0);");
      });

        if($('.course-content a.dropdown-toggle').length > 0){
          $('.course-content a.dropdown-toggle').each(function(index, value){
           $(this).attr("href", "javascript:void(0);");
          });
        }
        $("#nav-main ul.right-top-header li.user-menu .usermenu a.dropdown-toggle, .course-content a.dropdown-toggle").on("click", function(event){
          event.stopPropagation();
          if($(this).parent().hasClass("show") && $(this).next().hasClass("show")){
          $(this).parent().removeClass("show");
          $(this).next().removeClass("show");  
          }else{
            $(this).parent().addClass("show");
            $(this).next().addClass("show");
          }
        
        });


    }



  }

  $(document).on('click', function (event) {
  if (!$(event.target).closest('ul.right-top-header').length) {
  if(($("#nav-main ul.right-top-header li.user-menu .usermenu .dropdown").length > 0) && ($("#nav-main ul.right-top-header li.user-menu .usermenu .dropdown .dropdown-menu").length > 0) ){
    if(($("#nav-main ul.right-top-header li.user-menu .usermenu .dropdown").hasClass("show")) && ($("#nav-main ul.right-top-header li.user-menu .usermenu .dropdown .dropdown-menu").hasClass("show"))){
      $("#nav-main ul.right-top-header li.user-menu .usermenu .dropdown").removeClass("show");
      $("#nav-main ul.right-top-header li.user-menu .usermenu .dropdown .dropdown-menu").removeClass("show");
    }
  }
    if(($(".course-content .dropdown").length > 0) && ($(".course-content .dropdown .dropdown-menu").length > 0)){
      if(($(".course-content .dropdown").hasClass("show")) && ($(".course-content .dropdown .dropdown-menu").hasClass("show"))){
          $(".course-content .dropdown").removeClass("show");
          $(".course-content .dropdown .dropdown-menu").removeClass("show");
      }
    }
  }
  });

}catch(ignore){}


/*=====
    ======= Course Page Section End============
============*/

/*
  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>learningzone Javascript End<<<<<<<<<<<<<<<<<<<<<<<<<<<<<=
*/
  

  });

