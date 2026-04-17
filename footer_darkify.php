<style>
/* == TOP NAVBAR ONLY - PURPLE BACKGROUND WITH WHITE TEXT == */

/* Primary navbar containers - purple background (TOP ONLY) */
.navbar,
nav.navbar,
.navbar-expand,
.navbar-light {
    background-color: rgb(85, 51, 153) !important;
    background: rgb(85, 51, 153) !important;
}

/* Remove white background from moremenu */
.moremenu,
.moremenu.navigation,
nav.moremenu.navigation {
    background-color: rgb(85, 51, 153) !important;
}

/* Navbar text and links - all white (TOP NAVBAR ONLY) */
.navbar-brand,
.navbar-text,
.navbar a,
.navbar button,
.navbar-nav .nav-link,
.navbar-nav a,
.navbar-nav span,
.nav-link,
.moremenu a,
.moremenu button,
.moremenu span,
.navbar-dark .navbar-text {
    color: white !important;
}

/* Navbar hover state */
.navbar-nav .nav-link:hover,
.navbar a:hover,
.moremenu a:hover {
    color: #E9D5FF !important;
    opacity: 0.9 !important;
}
</style>

<script>
// Direct moremenu styling - simple and direct
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        // Purple background for moremenu
        var moremenu = document.querySelector('.moremenu.navigation, nav.moremenu, .moremenu');
        if (moremenu) {
            moremenu.setAttribute('style', 'background-color: rgb(85, 51, 153) !important; background: rgb(85, 51, 153) !important;');
        }
        
        // Also style the UL inside if it exists
        var morenavUl = document.querySelector('.moremenu .nav, .moremenu ul, .moremenu nav');
        if (morenavUl) {
            morenavUl.setAttribute('style', 'background-color: rgb(85, 51, 153) !important; background: rgb(85, 51, 153) !important;');
        }
        
        // Color all links white
        var allLinks = document.querySelectorAll('.moremenu a, .moremenu span, .moremenu button');
        allLinks.forEach(function(el) {
            el.setAttribute('style', el.getAttribute('style') ? el.getAttribute('style') + '; color: white !important;' : 'color: white !important;');
        });
    }, 100);
});

// Make breadcrumb links black (banner area should stay white background)
(function() {
    function fixBreadcrumbs() {
        var breadcrumbs = document.querySelectorAll('nav[aria-label="Breadcrumb"] a, .breadcrumb a, .nav-breadcrumb a');
        breadcrumbs.forEach(function(el) {
            el.style.color = '#000000';
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixBreadcrumbs);
    } else {
        fixBreadcrumbs();
    }
    setTimeout(fixBreadcrumbs, 100);
})();
</script>
