<?php
// SCL Theme CSS Injection Footer
// Injects SCL Purple branding CSS and patterns

// Color Palette
$colors = array(
    'scl-purple' => '#6B46C1',
    'scl-dark' => '#553399',
    'scl-light' => '#8B5CF6', 
    'scl-lighter' => '#E9D5FF',
    'scl-bg' => '#F7F9FC',
    'scl-text' => '#1F2937',
    'scl-white' => '#FFFFFF',
);
?>

<style>
/* SCL Institute Theme - CSS Variables */
:root {
    --scl-purple: #6B46C1;
    --scl-dark: #553399;
    --scl-light: #8B5CF6;
   --scl-lighter: #E9D5FF;
    --scl-bg: #F7F9FC;
    --scl-text: #1F2937;
    --scl-white: #FFFFFF;
    --primary-color: #6B46C1;
    --primary-dark: #553399;
}

/* Body Background */
body {
    background-color: #F7F9FC;
    color: #1F2937;
}

/* Navbar - SCL Purple Gradient */
nav.navbar,
.navbar {
    background: linear-gradient(135deg, #6B46C1 0%, #553399 100%) !important;
    box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2) !important;
    border-bottom: none !important;
}

.navbar-brand,
.navbar-brand a {
    color: #FFFFFF !important;
    font-weight: 700 !important;
}

.nav-link {
    color: rgba(255, 255, 255, 0.9) !important;
    font-weight: 500;
    transition: all 0.3s ease;
}

.nav-link:hover {
    color: #FFFFFF !important;
}

.nav-link.active {
    color: #FFFFFF !important;
    font-weight: 700 !important;
}

/* Main Content Area */
.main-wrapper {
    background-color: #F7F9FC;
}

main {
    background-color: #F7F9FC;
}

/* Cards and Blocks */
.card,
.block,
.block-region {
    background-color: #FFFFFF;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    border-top: 4px solid #6B46C1;
    transition: all 0.3s ease;
}

.card:hover,
.block:hover {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.card-header,
.block-header {
    background: linear-gradient(135deg, #6B46C1 0%, #553399 100%) !important;
    color: #FFFFFF !important;
    border: none !important;
    padding: 1.25rem 1.5rem !important;
    font-weight: 600;
    border-radius: 12px 12px 0 0;
}

.card-title,
.block-title,
.block_navigation .block-title {
    color: #FFFFFF !important;
    font-weight: 700;
    margin: 0;
}

.card-body,
.block-content {
    padding: 1.5rem;
    color: #1F2937;
}

/* Sidebar Navigation */
.block_navigation,
.list-group-item {
    background-color: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-left: 3px solid transparent;
    transition: all 0.2s ease;
}

.list-group-item:hover {
    background-color: rgba(107, 70, 193, 0.05);
    border-left-color: #6B46C1;
}

.list-group-item.active {
    background-color: #6B46C1 !important;
    border-color: #6B46C1 !important;
    color: #FFFFFF !important;
}

.list-group-item a,
.block_navigation a {
    color: #6B46C1;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
}

.list-group-item a:hover,
.block_navigation a:hover {
    color: #553399;
    text-decoration: underline;
}

.list-group-item.active a {
    color: #FFFFFF !important;
}

/* Buttons */
.btn,
button {
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
    border: none;
}

.btn-primary,
button.btn-primary {
    background: linear-gradient(135deg, #6B46C1 0%, #553399 100%) !important;
    color: #FFFFFF !important;
    box-shadow: 0 4px 12px rgba(107, 70, 193, 0.3);
}

.btn-primary:hover,
button.btn-primary:hover {
    background: linear-gradient(135deg, #553399 0%, #4c2a99 100%) !important;
    box-shadow: 0 6px 16px rgba(107, 70, 193, 0.4);
    transform: translateY(-1px);
}

.btn-outline-primary {
    color: #6B46C1 !important;
    border: 2px solid #6B46C1 !important;
    background-color: transparent;
}

.btn-outline-primary:hover {
    background-color: #6B46C1 !important;
    color: #FFFFFF !important;
}

/* Links */
a {
    color: #6B46C1;
    transition: color 0.2s ease;
}

a:hover {
    color: #553399;
    text-decoration: none;
}

/* Breadcrumb */
.breadcrumb {
    background-color: transparent;
    border-bottom: 1px solid rgba(107, 70, 193, 0.1);
    margin-bottom: 1.5rem;
    padding: 0.5rem 0 1rem 0;
}

.breadcrumb-item {
    color: #1F2937;
}

.breadcrumb-item.active {
    color: #6B46C1;
    font-weight: 600;
}

.breadcrumb-item a {
    color: #6B46C1;
}

/* Alerts */
.alert {
    border-left: 4px solid;
    border-radius: 12px;
    padding: 1rem 1.5rem;
    border-top: none !important;
    border-right: none !important;
    border-bottom: none !important;
}

.alert-info {
    background-color: rgba(59, 130, 246, 0.1) !important;
    border-left-color: #3B82F6 !important;
    color: #1e40af !important;
}

.alert-success {
    background-color: rgba(16, 185, 129, 0.1) !important;
    border-left-color: #10B981 !important;
    color: #047857 !important;
}

.alert-warning {
    background-color: rgba(245, 158, 11, 0.1) !important;
    border-left-color: #F59E0B !important;
    color: #92400e !important;
}

.alert-danger {
    background-color: rgba(239, 68, 68, 0.1) !important;
    border-left-color: #EF4444 !important;
    color: #991b1b !important;
}

/* Forms */
.form-control,
.form-select {
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 0.75rem 1rem;
    transition: all 0.2s ease;
}

.form-control:focus,
.form-select:focus {
    border-color: #6B46C1 !important;
    box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1) !important;
}

.form-label {
    color: #1F2937;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

/* Page Header */
.page-header-headings h1 {
    color: #1F2937;
    font-weight: 700;
    border-bottom: 3px solid #6B46C1;
    padding-bottom: 0.75rem;
    margin-bottom: 0.5rem;
}

/* Footer */
footer,
footer.footer {
    background: linear-gradient(135deg, #553399 0%, #6B46C1 100%) !important;
    color: #FFFFFF !important;
    padding: 3rem 0 1rem 0;
    margin-top: 4rem;
}

footer a,
footer h5 {
    color: #FFFFFF !important;
}

footer a:hover {
    color: #E9D5FF !important;
}

/* Responsive */
@media (max-width: 768px) {
    .card,
    .block {
        margin-bottom: 1rem;
    }
    
    .page-header-headings h1 {
        font-size: 1.5rem;
    }
}

/* Animations */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card,
.block {
    animation: fadeIn 0.3s ease;
}

/* Utility Classes */
.text-scl-purple {
    color: #6B46C1 !important;
}

.bg-scl-purple {
    background-color: #6B46C1 !important;
}

.bg-scl-light {
    background-color: #E9D5FF !important;
}

.shadow-scl {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
}
</style>