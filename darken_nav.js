define([], function() {
    return {
        init: function() {
            // Force dark text on navigation elements
            function darkifyNav() {
                var navElements = document.querySelectorAll('[role="menuitem"], [role="tab"], nav a, header a, .navbar a, .nav-link, button[role="tab"]');
                navElements.forEach(function(el) {
                    el.style.color = '#000000';
                    el.style.fontWeight = '900';
                });
            }
            
            // Run on DOMContentLoaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', darkifyNav);
            } else {
                darkifyNav();
            }
            
            // Also run on any mutations to catch dynamic content
            var observer = new MutationObserver(darkifyNav);
            observer.observe(document.body, { childList: true, subtree: true });
        }
    };
});
