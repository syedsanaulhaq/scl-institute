# Moodle Custom Course Fields Reference

**Date Created:** February 17, 2026  
**Total Fields:** 24 custom fields in 5 categories  
**SQL Script:** `moodle-custom-course-fields.sql`

## Overview

These custom fields extend Moodle's course information to match SCL Institute's course registration requirements. All fields are accessible when creating or editing courses in Moodle.

---

## Category 1: Accreditation & Compliance (6 fields)

Fields related to course accreditation, regulation, and compliance requirements.

| Field Name | Short Name | Type | Options/Description |
|------------|------------|------|---------------------|
| **Course Type** | `course_type` | Dropdown | HND, Degree, Vocational, Short Course, CPD, Professional Qualification |
| **Awarding Body / Accreditation** | `awarding_body` | Dropdown | Pearson, City & Guilds, In-house, NCFE, Other |
| **Regulation Level (RQF)** | `regulation_level` | Dropdown | RQF Level 1-8, Non-accredited |
| **UKVI Approved Course** | `ukvi_approved` | Dropdown | Yes, No (Default: No) |
| **Approval Date** | `approval_date` | Date | Date when course was approved |
| **Review Date** | `review_date` | Date | Next scheduled review date |

---

## Category 2: Academic Details (7 fields)

Academic information including learning outcomes, assessment methods, and entry requirements.

| Field Name | Short Name | Type | Options/Description |
|------------|------------|------|---------------------|
| **Subject Area / Discipline** | `subject_area` | Dropdown | Business, Engineering, IT, Creative Arts, Health & Social Care, Hospitality & Tourism, Other |
| **Learning Outcomes** | `learning_outcomes` | Text Area | Expected learning outcomes upon completion |
| **Units / Modules Covered** | `units_modules` | Text Area | List of units or modules included |
| **Assessment Methods** | `assessment_methods` | Dropdown | Exam, Coursework, Portfolio, Practical, Mixed |
| **Entry Requirements** | `entry_requirements` | Text Area | Minimum entry requirements |
| **Special Admission Considerations** | `special_admissions` | Text Area | RPL, mature students, etc. |
| **Progression Opportunities** | `progression_opportunities` | Text Area | Career or educational progression |

---

## Category 3: Financial Information (3 fields)

Course fees, costs, and funding options.

| Field Name | Short Name | Type | Options/Description |
|------------|------------|------|---------------------|
| **Tuition Fee (GBP)** | `tuition_fee` | Text | Standard tuition fee in British Pounds |
| **Additional Costs** | `additional_costs` | Text Area | Materials, exams, certification fees, etc. |
| **Funding Options** | `funding_options` | Dropdown | Self-funded, Employer-funded, Student Loan, Scholarship |

---

## Category 4: Delivery Information (5 fields)

Course delivery modes, resources, and practical requirements.

| Field Name | Short Name | Type | Options/Description |
|------------|------------|------|---------------------|
| **Mode of Delivery** | `mode_of_delivery` | Dropdown | Full-time, Part-time, Online, Blended, Evening/Weekend |
| **Learning Resources Provided** | `learning_resources` | Text Area | Materials and resources provided |
| **Special Equipment Needed** | `special_equipment` | Text Area | Required equipment or software |
| **Work Placement / Internship Included** | `work_placement` | Dropdown | Yes, No (Default: No) |
| **Duration** | `duration` | Text | Course duration (e.g., 12 months, 2 years) |

---

## Category 5: Administration (3 fields)

Administrative information including staff, dates, and partnerships.

| Field Name | Short Name | Type | Options/Description |
|------------|------------|------|---------------------|
| **Course Leader / Programme Director** | `course_leader` | Text | Name of course leader |
| **Internal Verification Contact** | `internal_verification` | Text | Contact for internal verification |
| **Industry Partnerships** | `industry_partnerships` | Text Area | Associated industry partners |

---

## How to Access in Moodle

### Via Site Administration:
1. Log in as admin
2. Navigate to: **Site administration** → **Courses** → **Course custom fields**
3. View/edit the 5 categories and their fields

### When Creating/Editing a Course:
1. Go to **Site administration** → **Courses** → **Manage courses and categories**
2. Click **Create new course** or edit an existing course
3. Scroll down to find the **Custom fields** section
4. All fields are organized by category

---

## Standard Moodle Fields (Already Available)

These fields from the CSV are already built into Moodle:

| CSV Field Name | Moodle Field | Location |
|----------------|--------------|----------|
| Course Title | Full name | Basic course settings |
| Course Code / ID | ID number | Basic course settings |
| Course Description | Summary | Basic course settings |
| Start Date | Course start date | Basic course settings |
| End Date | Course end date | Basic course settings |

---

## Notes

1. **Financial Fields:** Created as custom fields at course level for display/catalog purposes. Moodle's built-in `enrol.cost` is at enrollment method level and used for actual payment processing.

2. **All Fields Optional:** No fields are marked as required, giving flexibility during course creation.

3. **Searchable:** Custom fields are searchable and can be used for filtering courses.

4. **Backup:** Custom field definitions and data are included in Moodle course backups.

5. **API Access:** Custom fields are accessible via Moodle Web Services API for integration with external systems.

---

## Database Tables

Custom fields are stored in:
- `mdl_customfield_category` - Field categories
- `mdl_customfield_field` - Field definitions
- `mdl_customfield_data` - Actual field values per course

---

## Next Steps

Consider:
1. ✅ Fields are created and ready to use
2. 🔄 Update SCL Institute courses table to match these fields
3. 🔄 Create sync script to populate Moodle custom fields from SCL database
4. 🔄 Build admin interface for bulk course updates
5. 🔄 Configure Moodle theme to display custom fields in course catalog
