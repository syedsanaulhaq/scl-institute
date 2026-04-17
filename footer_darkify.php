<script>
(function() {
    function darkifyNav() {
        var navElements = document.querySelectorAll('[role="menuitem"], [role="tab"], nav a, header a, .navbar a, .nav-link');
        navElements.forEach(function(el) {
            el.style.color = '#000000';
            el.style.fontWeight = '900';
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
