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

/* Navbar container contents - purple background */
.navbar .container-fluid,
.navbar-nav {
    background-color: transparent !important;
}

/* Navbar text and links - all white (TOP NAVBAR ONLY) */
.navbar-brand,
.navbar-text,
.navbar a,
.navbar button,
.navbar span,
.navbar-nav .nav-link,
.navbar-nav a,
.navbar-nav span,
.navbar-dark .navbar-text,
.navbar svg,
.navbar i,
.navbar .icon,
.navbar .fa,
.navbar .fas,
.navbar .far,
.navbar .fab,
.navbar-light .navbar-brand,
.navbar-light .navbar-nav .nav-link,
.navbar button:not(.btn-close),
header button,
[role="navigation"] button,
.usermenu a,
.usermenu button,
.usermenu span,
.navbar .dropdown-toggle,
.navbar .dropdown-toggle::after,
.navbar menubar [role="menuitem"],
.navbar [role="menuitem"],
[role="menubar"] [role="menuitem"],
.navbar menubar,
[role="menubar"] {
    color: white !important;
}

/* Ensure submenu items are NOT styled */
.moremenu,
.moremenu.navigation,
nav.moremenu.navigation,
.moremenu *,
.moremenu a,
.moremenu button,
.moremenu span,
.moremenu .nav-link {
    color: inherit !important;
    background-color: transparent !important;
}

/* Navbar hover state */
.navbar-nav .nav-link:hover,
.navbar a:hover {
    color: #E9D5FF !important;
    opacity: 0.9 !important;
}

/* Breadcrumb - all black */
nav[aria-label="Breadcrumb"],
.breadcrumb,
.nav-breadcrumb,
nav[aria-label="Breadcrumb"] *,
.breadcrumb *,
.nav-breadcrumb *,
nav[aria-label="Breadcrumb"] a,
.breadcrumb a,
.nav-breadcrumb a,
nav[aria-label="Breadcrumb"] li,
.breadcrumb li,
nav[aria-label="Breadcrumb"] span,
.breadcrumb span {
    color: #000000 !important;
    background-color: transparent !important;
}

/* Force all navbar and navigation children to have white text/color */
.navbar *,
[role="navigation"] *,
.navbar,
[role="navigation"],
menuitem,
[role="menuitem"],
menubar,
[role="menubar"] {
    color: white !important;
}

/* But exclude moremenu from being white */
.navbar .moremenu,
.navbar .moremenu *,
.navbar .moremenu a,
.navbar .moremenu button,
[role="navigation"] .moremenu,
[role="navigation"] .moremenu * {
    color: inherit !important;
}
</style>

<script>
// Direct navbar styling - ensure entire navbar is purple with white text/icons
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        // Purple background for entire navbar and all sections
        var navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.setAttribute('style', 'background-color: rgb(85, 51, 153) !important; background: rgb(85, 51, 153) !important;');
        }
        
        var containerFluid = document.querySelector('.navbar .container-fluid');
        if (containerFluid) {
            containerFluid.setAttribute('style', 'background-color: transparent !important;');
        }
        
        // White color for navbar links, buttons, text (but NOT moremenu)
        var navElements = document.querySelectorAll('.navbar a, .navbar button, .navbar span, .navbar [role="menuitem"], .navbar menubar, [role="menubar"], [role="menuitem"], .usermenu a, .usermenu button, .navbar-nav .nav-link');
        navElements.forEach(function(el) {
            if (!el.closest('.moremenu')) {
                el.style.setProperty('color', 'white', 'important');
            }
        });
        
        // Fill attribute for SVG icons to be white (but NOT moremenu)
        var svgs = document.querySelectorAll('.navbar svg:not(.moremenu svg)');
        svgs.forEach(function(svg) {
            if (!svg.closest('.moremenu')) {
                svg.setAttribute('fill', 'white');
                var paths = svg.querySelectorAll('path, circle, rect, polygon');
                paths.forEach(function(path) {
                    path.setAttribute('fill', 'white');
                });
            }
        });
    }, 100);
});

// Make breadcrumb links and all breadcrumb elements black
(function() {
    function fixBreadcrumbs() {
        // Make all breadcrumb links and text black
        var breadcrumbs = document.querySelectorAll('nav[aria-label="Breadcrumb"], .breadcrumb, .nav-breadcrumb');
        breadcrumbs.forEach(function(bc) {
            bc.style.color = '#000000';
            // Make all children black as well
            var allChildren = bc.querySelectorAll('*');
            allChildren.forEach(function(child) {
                child.style.color = '#000000';
            });
        });
        
        // Specifically target breadcrumb links and items
        var breadcrumbItems = document.querySelectorAll('nav[aria-label="Breadcrumb"] a, .breadcrumb a, .nav-breadcrumb a, .breadcrumb li, .breadcrumb span');
        breadcrumbItems.forEach(function(el) {
            el.style.color = '#000000';
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixBreadcrumbs);
    } else {
        fixBreadcrumbs();
    }
    setTimeout(fixBreadcrumbs, 100);
    setTimeout(fixBreadcrumbs, 500);
})();
</script>
