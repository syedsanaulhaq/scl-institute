# Course Registration Form - Year-Based Cohort Fields

## Overview
When teachers/coordinators register a course, the form must capture **year** and **intake** information to enable proper student cohort assignment.

---

## Required Form Fields

### 1. **Course Code** (Required)
- **Format:** `{Program}-{Number}-Y{Year}-S{Semester}-C{Component}`
- **Example:** `BSc-001-Y1-S1-C1`
- **Description:** Unique identifier following program structure with year embedded
- **Validation:** Must match pattern with year (Y1, Y2, Y3, etc.)

### 2. **Course Title** (Required)
- **Example:** `Programming Fundamentals`
- **Description:** Name of the course/module

### 3. **Programme Type Name** (Required)
- **Example:** `B.Sc. Computer Science`
- **Description:** Full degree/program name
- **Used for:** Cohort name generation (shown to students)

### 4. **Program Name** (Optional)
- **Example:** `Computer Science`
- **Description:** Short program name
- **Used for:** Identification only

### 5. **Academic Year** ⭐ (Required - for Year-Based Cohorts)
- **Field Type:** Dropdown or manual entry
- **Options:**
  - `Year 1` (First Year)
  - `Year 2` (Second Year)
  - `Year 3` (Third Year)
  - `Year 4` (Fourth Year)
  - `Masters/Postgraduate Year 1`
  - etc.
- **Example:** `Year 1`
- **Purpose:** Determines which year cohort students are placed in
- **Important:** This is the **year of the program**, not the academic year (e.g., "Year 1" means "all Year 1 students")

### 6. **Semester Name** (Optional)
- **Example:** `Semester 1`, `Autumn`
- **Description:** When the course runs
- **Used for:** Scheduling and organization

### 7. **Cohort Label** ⭐ (Required - for Year-Based Cohorts)
- **Field Type:** Dropdown or text entry
- **Options:**
  - `Sep-2024` (September 2024 intake)
  - `Jan-2024` (January 2024 intake)
  - `Aug-2024` (August 2024 intake)
  - etc.
- **Format:** `{Month}-{Year}` or `{Month}-{YearLastTwo}`
- **Example:** `Sep-2024`
- **Purpose:** Identifies the **intake cohort** - which students (by enrollment date) should be in this course
- **Key Point:** Students with Sep-2024 intake start in Sep 2024 and continue through their years

### 8. **Year Category ID** ⭐ (Required - backend link)
- **Field Type:** Hidden or selection
- **Options:** Pre-populated based on Academic Year selection
  - Year 1 → ID: 1
  - Year 2 → ID: 2
  - Year 3 → ID: 3
  - etc.
- **Purpose:** Links to program structure in database
- **Auto-populated:** When teacher selects "Academic Year"

### 9. **Cohort Category ID** (Optional - backend link)
- **Field Type:** Hidden
- **Purpose:** Links intake label to predefined cohorts
- **Auto-populated:** When teacher selects "Cohort Label"

### 10. **Semester Category ID** (Optional - backend link)
- **Field Type:** Hidden
- **Purpose:** Organizes by semester
- **Auto-populated:** Based on scheduling

---

## Form Design: Registration Page Layout

```
┌─ COURSE REGISTRATION FORM ────────────────────────────────────────┐
│                                                                    │
│ COURSE DETAILS SECTION                                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ Course Code * __________________ (e.g., BSc-001-Y1-S1-C1)          │
│                                                                    │
│ Course Title * _________________ (e.g., Programming Fundamentals)  │
│                                                                    │
│ Programme Type Name * __________ (e.g., B.Sc. Computer Science)   │
│                                                                    │
│ Program Name __________________ (e.g., Computer Science)          │
│                                                                    │
│ SCHEDULING & COHORT SECTION                                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ Academic Year * ○ Year 1                                           │
│                 ○ Year 2                                           │
│                 ○ Year 3                                           │
│                 ○ Postgraduate Year 1                              │
│                 [Year Category ID: 1]  (auto-populated)            │
│                                                                    │
│ Cohort Label * ○ Sep-2024                                          │
│                ○ Jan-2024                                          │
│                ○ May-2024                                          │
│                ○ Aug-2024                                          │
│                [Cohort Category ID: auto]                          │
│                                                                    │
│ Semester Name ○ Semester 1 (Autumn)                                │
│               ○ Semester 2 (Spring)                                │
│               ○ Full Year                                          │
│                                                                    │
│ ADDITIONAL DETAILS                                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ Course Type ________________________                                │
│ Mode of Delivery ⊙ On-Campus ○ Online ○ Blended                   │
│ Start Date [Date Picker]                                           │
│ End Date [Date Picker]                                             │
│                                                                    │
│ Submit     Reset    Preview                                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Year-Based Cohort Assignment Logic

When form is submitted with:
- Academic Year: `Year 1`
- Cohort Label: `Sep-2024`

**Generated Cohort Details:**
```
Program Code: BSc (from course code)
Year of Study: 1 (from Academic Year field)
Intake Cohort: Sep-2024 (from Cohort Label field)

↓↓↓ Generates ↓↓↓

Moodle Cohort ID: bsc-y1-sep-2024
Display Name: B.Sc. Computer Science Year 1 - Sep 2024
Description: Year 1 cohort for Sep 2024 intake
```

---

## Form Validation Rules

### Required Fields:
- ✓ Course Code (must contain Y{number})
- ✓ Course Title (not empty)
- ✓ Programme Type Name (not empty)
- ✓ Academic Year (must select one)
- ✓ Cohort Label (must select one)

### Format Validation:
- ✓ Course Code matches: `*-Y\d+*` (contains year indicator)
- ✓ Cohort Label matches: `Mon-YYYY` format (e.g., Sep-2024)
- ✓ Academic Year matches: `Year \d+` or `Postgraduate*`

### Business Rules:
- ✓ Cannot have duplicate (program + year + cohort) combinations
- ✓ Cohort label must be valid intake date (in course_lifecycle)
- ✓ Academic year must exist in program structure

---

## Examples: Different Scenarios

### Example 1: BSc Year 1, September Intake
```
Course Code:           BSc-001-Y1-S1-C1
Course Title:          Programming Fundamentals
Programme Type Name:   B.Sc. Computer Science
Academic Year:         Year 1
Cohort Label:          Sep-2024
Semester Name:         Semester 1

Result Cohort: bsc-y1-sep-2024
Students with Sep intake in Year 1 will be auto-enrolled
```

### Example 2: MSc Year 1, January Intake
```
Course Code:           MSc-101-Y1-S2-C1
Course Title:          Advanced Research Methods
Programme Type Name:   M.Sc. Data Science
Academic Year:         Postgraduate Year 1
Cohort Label:          Jan-2024
Semester Name:         Semester 2

Result Cohort: msc-y1-jan-2024
Students with Jan intake in MSc Year 1 will be auto-enrolled
```

### Example 3: Undergraduate Year 3, May Intake
```
Course Code:           BSc-301-Y3-S1-C1
Course Title:          Capstone Project
Programme Type Name:   B.Sc. Engineering
Academic Year:         Year 3
Cohort Label:          May-2024
Semester Name:         Semester 1

Result Cohort: bsc-y3-may-2024
Students with May intake in Year 3 will be auto-enrolled
```

---

## Field Explanations for Teachers

### "Academic Year" Field
> **What is this?**
> Select which **year of the program** this course is for.
> - Year 1: First-year courses
> - Year 2: Second-year courses
> - Year 3: Third-year courses
> - etc.

> **Why does it matter?**
> Students are grouped by their year. Year 1 students should only take Year 1 courses. This field ensures students are automatically placed in the right cohort.

> **Example:**
> If you're registering "Programming Fundamentals" for Year 1, select "Year 1"

---

### "Cohort Label" Field
> **What is this?**
> Select the **intake date** that this cohort represents.
> - Sep-2024: Students who start in September 2024
> - Jan-2024: Students who start in January 2024
> - May-2024: Students who start in May 2024

> **Why does it matter?**
> The system automatically enrolls students based on when they started their program. This field links students with the same start date to the same course.

> **Example:**
> If you're teaching Sep 2024 intake students, select "Sep-2024"

---

## Form Submission Flow

```
Teacher Fills Form
        ↓
Validate Required Fields
        ↓
Check Cohort Pattern
        ↓
Query: course_lifecycle for {Program} + {Year}
        ↓
If cohort_label matches
├─ ✅ Valid - Allow submission
└─ ❌ Invalid - Show error
        ↓
Save to course_registrations
        ↓
Show: "Registration submitted successfully"
        ↓
Teacher clicks "Approve" (or admin does)
        ↓
syncMoodleCohort() creates {program}-y{year}-{intake}
        ↓
Cohort ready for student enrollment
```

---

## Server-Side Processing

When form is submitted (POST `/api/course-registrations`):

```javascript
// 1. Extract year from course code (validation)
const yearMatch = courseCode.match(/Y(\d+)/);
if (!yearMatch) {
    error: "Course code must contain year (Y1, Y2, etc.)"
}

// 2. Validate academic_year matches year in course code
if (academicYear !== `Year ${yearMatch[1]}`) {
    warning: "Academic Year doesn't match course code year"
}

// 3. Validate cohort_label format
if (!cohortLabel.match(/\w+-\d{4}/)) {
    error: "Cohort label must be in format: Month-Year (e.g., Sep-2024)"
}

// 4. Extract program code
const programCode = courseCode.split('-')[0];

// 5. Query course_lifecycle
const cohorts = await db.execute(
    `SELECT * FROM course_lifecycle
     WHERE program_code = ? AND academic_year = ?`,
    [programCode, cohortLabel]
);

if (cohorts.length === 0) {
    warning: "No course lifecycle found for this program/year combination"
}

// 6. Save registration
await db.execute(`INSERT INTO course_registrations ...`);

// 7. Return success
return { success: true, registration_id: newId };
```

---

## Testing the Form

### Test Case 1: Valid Registration
**Input:**
- Course Code: `BSc-001-Y1-S1-C1`
- Programme Type: `B.Sc. Computer Science`
- Academic Year: `Year 1`
- Cohort Label: `Sep-2024`

**Expected:** ✅ Registration saved, cohort `bsc-y1-sep-2024` created

### Test Case 2: Missing Year in Code
**Input:**
- Course Code: `BSc-001-S1-C1` (no Y1)
- Academic Year: `Year 1`

**Expected:** ⚠️ Warning: Code doesn't match year

### Test Case 3: Wrong Cohort Label Format
**Input:**
- Cohort Label: `September2024` (not Month-Year format)

**Expected:** ❌ Error: Invalid cohort label format

### Test Case 4: No Lifecycle Configured
**Input:**
- Program: New program not in course_lifecycle
- Cohort Label: `Sep-2024`

**Expected:** ⚠️ Warning, but registration still saves (admin can configure later)

