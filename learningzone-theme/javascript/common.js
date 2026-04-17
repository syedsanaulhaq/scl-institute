$(document).ready(function () {

  if ($('body')) {
    $('body').addClass('fixed-nav');
  }
  /*
  ====== Navigation section start ======
*/


  try {
    if ($("nav.navbar ul.navbar-nav.navigation")) {
      $("nav.navbar ul.navbar-nav.navigation").addClass("main-menu theme-ddmenu");
    }
    if ($("nav.navbar ul.navbar-nav")) {
      $("nav.navbar ul.navbar-nav li.nav-item").removeClass("nav-item");
    }
    if ($("nav.navbar ul.navbar-nav.main-menu")) {
      $("nav.navbar ul.navbar-nav.main-menu").attr({
        "data-animtype": 2,
        "data-animspeed": 450
      });
      //$("nav.navbar ul.navbar-nav.main-menu li.dropdown ul.dropdown-list a.dropdown-item").removeClass("dropdown-item");
    }


  } catch (ignore) {}

  //<b class="mobile-arrow"></b>
  try {
    if ($('#nav-main nav.navbar ul.main-menu li.dropdown')) {
      $.each($('#nav-main nav.navbar ul.main-menu li.dropdown a[data-toggle="dropdown"]'), function (index, obj) {
        var arrow = document.createElement('b');
        $(arrow)[0].className += "mobile-arrow";
        obj.appendChild(arrow);
      });
    }
  } catch (ignore) {}

});
