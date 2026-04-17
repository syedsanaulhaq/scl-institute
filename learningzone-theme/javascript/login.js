$(document).ready(function () {
    try {

        /*=====
    ======= Login Section Start============
============*/

        if($("#page-login-index")){
            var loginNode = $("#page-content .col-md-5").eq(0).html() + $("#page-content .col-md-5").eq(1).html();
            if($("#region-main")){
                var loginSection = $("#region-main .login-main-wrapper .login-section .login-inner") ? $("#region-main .login-main-wrapper .login-section .login-inner").append(loginNode): "";
                var cardBody = $("#region-main .login-main-wrapper .login-section .login-inner") ? $("#region-main .login-main-wrapper .login-section .login-inner").prepend($(".card-body").eq(0)): "";
            }
            if($("form#signup")){
                var signupSection = $(".login-main-wrapper .signup-section .signup-form") ? $(".login-main-wrapper .signup-section .signup-form").append($("form#signup")) : "";
            }
        }

        if($(".login-section .card-body")){
            var srNode = $(".login-section .login-inner .card-body .sr-only") ? $(".login-section .login-inner .card-body .sr-only").remove() : "";
            var mdNode = $(".login-section .login-inner .card-body .justify-content-md-center") ? $(".login-section .login-inner .card-body .justify-content-md-center").remove() : "";
        }
       // var login = $("body#page-login-index #page-wrapper, body#page-login-signup #page") ? $("body#page-login-index #page-wrapper, body#page-login-signup #page").prepend("<div class='overlay overlay-bg'></div>") : "";

/*=====
    ======= Login Section End============
============*/

/*=====
    ======= Signup Section Start============
============*/

        if($("#page-login-signup")){
            if($("#page-login-signup .login-main-wrapper .login-section.col-lg-4").length > 0){
                $("#page-login-signup .login-main-wrapper .login-section.col-lg-4").addClass("col-lg-8").removeClass("col-lg-4");
            }
        }

/*=====
    ======= Signup Section End============
============*/


    } catch (ignore) {}


});
