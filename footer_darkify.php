<style>
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
