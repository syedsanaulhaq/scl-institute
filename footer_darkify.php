<!-- Left-align breadcrumbs and headings -->
<style>
/* Breadcrumbs - LEFT ALIGN */
nav[aria-label="Breadcrumb"],
.breadcrumb {
    text-align: left !important;
}

/* All headings - LEFT ALIGN */
h1, h2, h3, h4, h5, h6 {
    text-align: left !important;
    margin-left: 0 !important;
}

/* Page header - LEFT ALIGN with flexbox override */
.page-header,
.page-header-headings,
#page-header,
.activity-header {
    text-align: left !important;
    justify-content: flex-start !important;
    align-items: flex-start !important;
    display: block !important;
    width: 100% !important;
}

/* Banner - LEFT ALIGN */
[role="banner"] {
    text-align: left !important;
}

[role="banner"] * {
    text-align: left !important;
    justify-content: flex-start !important;
}

/* Main heading inside page header */
.page-header h1,
#page-header h1,
.activity-header h1 {
    text-align: left !important;
    margin-left: 0 !important;
    width: 100% !important;
}

/* Fix file picker modal backdrop - make it dismissible */
.modal-backdrop {
    background-color: rgba(0, 0, 0, 0.3) !important;
    cursor: pointer !important;
}

/* Ensure modal dialog is always visible and can be closed */
.modal-dialog {
    pointer-events: auto !important;
}

/* Add close button styling */
.modal-header .close {
    cursor: pointer !important;
    opacity: 1 !important;
}
</style>

<script>
// Make file picker modal dismissible
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when backdrop is clicked
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList && e.target.classList.contains('modal-backdrop')) {
            var modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                // Remove backdrop
                var backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(function(bd) { bd.remove(); });
            }
        }
    });
    
    // Ensure close buttons work
    var closeButtons = document.querySelectorAll('.modal-header .close, .modal-header button[aria-label="Close"]');
    closeButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                var backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(function(bd) { bd.remove(); });
            }
        });
    });
    
    // Allow ESC key to close file picker
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var modals = document.querySelectorAll('.modal[style*="display: block"], .modal.show');
            modals.forEach(function(modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
            var backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(function(bd) { bd.remove(); });
        }
    });
});
</script>
