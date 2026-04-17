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

/* Navbar text and links - all white (TOP NAVBAR ONLY) - keep it simple */
.navbar-nav .nav-link {
    color: white !important;
}

.navbar-expand .navbar-nav .nav-link {
    color: white !important;
}

.navbar-light .navbar-nav .nav-link {
    color: white !important;
}

.navbar-light .navbar-nav .nav-link.active {
    color: white !important;
}

.navbar-light .navbar-nav .nav-link:focus,
.navbar-light .navbar-nav .nav-link:hover {
    color: #E9D5FF !important;
}

.navbar .nav-link {
    color: white !important;
}

.navbar .nav-link.active {
    color: white !important;
}

[role="navigation"] .nav-link {
    color: white !important;
}

[role="menuitem"] {
    color: white !important;
}

.navbar-brand,
.navbar-text,
.navbar a,
.navbar button,
.navbar span,
.navbar-dark .navbar-text,
.navbar svg,
.navbar i,
.navbar .icon,
.navbar .fa,
.navbar .fas,
.navbar .far,
.navbar .fab,
.navbar-light .navbar-brand,
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

/* Submenu items - ENSURE BLACK text */
.moremenu,
.moremenu a,
.moremenu button,
.moremenu span,
.moremenu [role="menuitem"] {
    color: #000000 !important;
}

/* Submenu items - BLACK text */
.moremenu,
.moremenu.navigation,
nav.moremenu.navigation,
.moremenu *,
.moremenu a,
.moremenu button,
.moremenu span,
.moremenu .nav-link {
    color: #000000 !important;
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

</style>

<script>
// Direct navbar styling - ensure entire navbar is purple with white text/icons
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        // Purple background for entire navbar and all sections
        var navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.backgroundColor = 'rgb(85, 51, 153)';
        }
        
        // Use MutationObserver to watch for style changes and revert them
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    var el = mutation.target;
                    
                    // If it's a nav-link or moremenu item, enforce our color
                    if (el.matches('.navbar-nav .nav-link') && !el.closest('.moremenu')) {
                        el.style.color = 'white';
                    }
                    if (el.matches('.moremenu, .moremenu *')) {
                        el.style.color = '#000000';
                    }
                }
            });
        });
        
        // Observe all navbar elements for attribute changes
        var navElements = document.querySelectorAll('.navbar-nav .nav-link, .navbar a, .navbar button, .moremenu, .moremenu *');
        navElements.forEach(function(el) {
            observer.observe(el, {
                attributes: true,
                attributeFilter: ['style']
            });
        });
        
        // Also force colors immediately
        var navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(function(el) {
            if (!el.closest('.moremenu')) {
                el.style.color = 'white';
            }
        });
        
        // Black for moremenu
        var moremenuItems = document.querySelectorAll('.moremenu, .moremenu a, .moremenu button, .moremenu span');
        moremenuItems.forEach(function(el) {
            el.style.color = '#000000';
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
