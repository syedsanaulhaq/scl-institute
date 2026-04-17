<style>
#page-header {
    text-align: left !important;
    display: block !important;
}

#page-header h1, #page-header h2 {
    text-align: left !important;
    margin: 0 !important;
}

nav[aria-label="Breadcrumb"] {
    text-align: left !important;
    display: block !important;
}

[role="banner"] {
    text-align: left !important;
}

[role="banner"] > div {
    text-align: left !important;
}
</style>

<script>
(function() {
    function alignLeft() {
        // Breadcrumb links black
        var breadcrumbs = document.querySelectorAll('nav[aria-label="Breadcrumb"] a, .breadcrumb a, .nav-breadcrumb a');
        breadcrumbs.forEach(function(el) {
            el.style.color = '#000000';
        });
    }
    
    // Initial run
    alignLeft();
    
    // Re-run on DOM changes
    var observer = new MutationObserver(function() {
        alignLeft();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
</script>
