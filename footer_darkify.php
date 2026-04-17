<script>
(function() {
    function darkifyNav() {
        // Darken breadcrumb navigation links only
        var breadcrumbs = document.querySelectorAll('nav[aria-label="Breadcrumb"] a, .breadcrumb a, .nav-breadcrumb a');
        breadcrumbs.forEach(function(el) {
            el.style.color = '#000000';
            el.style.fontWeight = '700';
        });
    }
    
    // Run immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', darkifyNav);
    } else {
        darkifyNav();
    }
    
    // Also wait a bit
    setTimeout(darkifyNav, 100);
})();
</script>
