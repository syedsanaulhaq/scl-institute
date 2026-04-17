<style>
/* == TOP NAVBAR - PURPLE BACKGROUND WITH WHITE TEXT == */
.navbar,
nav.navbar,
[role="navigation"] {
    background-color: rgb(85, 51, 153) !important;
    background: rgb(85, 51, 153) !important;
}

/* Navbar text and links - white */
.navbar-brand,
.navbar-text,
.navbar a,
.navbar button,
.navbar-nav .nav-link,
.navbar-nav a,
#page-navbar,
#page-navbar a,
#page-navbar *,
[role="navigation"],
[role="navigation"] a,
[role="navigation"] *,
[role="menuitem"],
[role="tab"],
nav a,
header a,
header button,
header [role="menuitem"],
header [role="tab"] {
    color: white !important;
    text-decoration: none !important;
}

/* Navbar hover state */
.navbar-nav .nav-link:hover,
.navbar a:hover,
[role="menuitem"]:hover,
[role="tab"]:hover {
    color: #E9D5FF !important;
    opacity: 0.9 !important;
}

/* Override flex/grid centering at all levels */
#page-header {
    text-align: left !important;
    display: block !important;
    justify-content: flex-start !important;
    align-items: flex-start !important;
    width: 100% !important;
    margin-left: 0 !important;
}

#page-header * {
    text-align: left !important;
    justify-content: flex-start !important;
    align-items: flex-start !important;
}

#page-header h1, #page-header h2 {
    text-align: left !important;
    margin: 0 !important;
    display: block !important;
    width: 100% !important;
}

/* Breadcrumb - comprehensive override */
nav[aria-label="Breadcrumb"],
.breadcrumb,
.nav-breadcrumb {
    text-align: left !important;
    display: block !important;
    justify-content: flex-start !important;
    align-items: flex-start !important;
    width: 100% !important;
}

nav[aria-label="Breadcrumb"] *,
.breadcrumb *,
.nav-breadcrumb * {
    text-align: left !important;
    justify-content: flex-start !important;
    align-items: flex-start !important;
}

nav[aria-label="Breadcrumb"] li,
nav[aria-label="Breadcrumb"] ul {
    text-align: left !important;
    display: block !important;
}

/* Banner - override the wrapper */
[role="banner"] {
    text-align: left !important;
    display: block !important;
    justify-content: flex-start !important;
    width: 100% !important;
}

[role="banner"] > * {
    text-align: left !important;
    display: block !important;
    justify-content: flex-start !important;
    width: 100% !important;
}

[role="banner"] * {
    justify-content: flex-start !important;
    align-items: flex-start !important;
}

/* Specifically target inner divs and containers */
[role="banner"] > div > div {
    display: block !important;
    text-align: left !important;
    width: 100% !important;
}
</style>

<script>
(function() {
    function fixAllAlignment() {
        // == NAVBAR STYLING - PURPLE WITH WHITE TEXT ==
        // Style navbar background
        var navbars = document.querySelectorAll('.navbar, nav, [role="navigation"]');
        navbars.forEach(function(nav) {
            nav.style.backgroundColor = 'rgb(85, 51, 153)';
        });
        
        // Style all navbar text and links white
        var navElements = document.querySelectorAll('.navbar a, .navbar button, .navbar-brand, .navbar-text, .navbar-nav .nav-link, #page-navbar, #page-navbar a, [role="navigation"] a, [role="navigation"] *, [role="menuitem"], [role="tab"], nav a, header a, header button');
        navElements.forEach(function(el) {
            el.style.color = 'white';
            el.style.textDecoration = 'none';
        });
        
        // Breadcrumb links stay black
        var breadcrumbs = document.querySelectorAll('nav[aria-label="Breadcrumb"] a, .breadcrumb a, .nav-breadcrumb a');
        breadcrumbs.forEach(function(el) {
            el.style.color = '#000000';
        });
        
        // Override page-header specifically
        var pageHeader = document.getElementById('page-header');
        if (pageHeader) {
            pageHeader.style.cssText = 'display: block !important; text-align: left !important; width: 100% !important; margin: 0 !important; padding: 1rem 0 !important;';
        }
        
        // Override breadcrumb container
        var breadcrumbNav = document.querySelector('nav[aria-label="Breadcrumb"]');
        if (breadcrumbNav) {
            breadcrumbNav.style.cssText = 'display: block !important; text-align: left !important; width: 100% !important; margin-left: 0 !important;';
            // Also fix the list inside
            var breadcrumbList = breadcrumbNav.querySelector('ul');
            if (breadcrumbList) {
                breadcrumbList.style.cssText = 'display: block !important; text-align: left !important;';
            }
        }
        
        // Override all banner elements
        var banners = document.querySelectorAll('[role="banner"]');
        banners.forEach(function(banner) {
            banner.style.cssText = 'display: block !important; text-align: left !important; width: 100% !important;';
            
            // Fix all direct children 
            Array.from(banner.children).forEach(function(child) {
                child.style.cssText = 'display: block !important; text-align: left !important; width: 100% !important;';
                // Fix nested children too
                Array.from(child.children).forEach(function(grandchild) {
                    grandchild.style.cssText = 'display: block !important; text-align: left !important;';
                });
            });
        });
        
        // Find and override heading
        var heading = document.querySelector('h1.h2, #page-header h1, #page-header h2');
        if (heading) {
            heading.style.cssText = 'text-align: left !important; display: block !important; margin: 0 !important; width: 100% !important;';
        }
    }
    
    // Initial run
    window.addEventListener('load', fixAllAlignment);
    fixAllAlignment();
    
    // Monitor for all DOM changes
    var observer = new MutationObserver(function() {
        fixAllAlignment();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'id']
    });
})();
</script>
