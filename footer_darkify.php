<!-- Auto-close file picker modals -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Auto-close any file picker modal that appears
    var checkForModal = setInterval(function() {
        var modal = document.querySelector('.modal.show, .modal[style*="display: block"]');
        if (modal && modal.classList.contains('editor_atto_filepicker')) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            var backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach(function(bd) { bd.remove(); });
        }
    }, 100);
    
    // Stop checking after 5 seconds
    setTimeout(function() { clearInterval(checkForModal); }, 5000);
    
    // Also prevent file picker buttons from being clickable
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.classList.contains('openpicker') || 
            e.target.classList.contains('filepicker') ||
            e.target.closest('[data-action="filepicker"]'))) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);
    
    // Hide file picker fields entirely
    var filePickerFields = document.querySelectorAll('[data-fieldtype="filepicker"], .filepicker');
    filePickerFields.forEach(function(field) {
        field.style.display = 'none';
    });
});

// Force close any modal that appears
window.addEventListener('show.bs.modal', function(e) {
    if (e.target && e.target.classList.contains('editor_atto_filepicker')) {
        e.preventDefault();
        e.target.style.display = 'none';
    }
});
</script>
