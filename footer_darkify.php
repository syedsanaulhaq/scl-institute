<script>
(function() {
    function darkifyNav() {
        // Make breadcrumb navigation links black (without bold)
        var breadcrumbs = document.querySelectorAll('nav[aria-label="Breadcrumb"] a, .breadcrumb a, .nav-breadcrumb a');
        breadcrumbs.forEach(function(el) {
            el.style.color = '#000000';
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
