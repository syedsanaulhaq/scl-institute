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
</style>
