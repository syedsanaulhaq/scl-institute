# Student Registration & Year-Based Cohorts Flow

## Overview
This document describes the complete flow of how students are registered in courses and automatically placed in year-based cohorts based on their program, academic year, and intake date.

## Three-Stage Registration Sequence

### Stage 1: Course Registration (Teacher/Admin)
**Location:** `POST/PUT /api/course-registrations`
**Who:** Course coordinators and teachers
**What happens:**
1. Teacher registers a course for a specific program, year, and intake
2. Form captures:
   - `course_code`: e.g., "BSc-001-Y1-S1-C1"
   - `programme_type_name`: e.g., "B.Sc. Computer Science"
   - `academic_year`: e.g., "Year 1"
   - `cohort_label`: e.g., "Sep-2024" (intake month/year)
   - `year_category_id`: Links to program year
3. When marked as "approved", `syncCourseRegistrationToMoodle()` is called
4. This creates:
   - **Moodle course:** e.g., `BSc-001-Y1-S1-C1`
   - **Year-based cohort:** e.g., `bsc-y1-sep-2024` (pattern: `{ProgramCode}-Y{Year}-{Intake}`)
   - The cohort is linked to all courses for that program+year

**Database:** `course_registrations` table

---

### Stage 2: Course Lifecycle Setup (System/Automation)
**Location:** `course_lifecycle` table
**What happens:**
1. For each year of a program, course lifecycle stages are created
2. Example structure for BSc Year 1:
   - Program Code: `BSc`
   - Year of Study: `1`
   - Academic Year: `2024` (or "Year 1")
   - Cohort Label: `Sep-2024` (semester/intake)
   - Cohort Pattern: Generates `BSc-Y1-Sep-2024`

3. All courses for Year 1 are linked to this year-based cohort

**Database:** `course_lifecycle` table

---

### Stage 3: Student Registration & Enrollment (Automatic)
**Location:** Student approval/enrollment triggers
**When:** When a student is approved or enrolled in a program
**What happens:**

1. **Student acceptance/approval (trigger):**
   - Student application approved in `student_applications`
   - Status changes to `accepted`

2. **`enrollStudentInProgrammeCourses()` is called with:**
   - `email`: Student email
   - `firstName`, `lastName`: Student name
   - `infoCourseCode`: e.g., "BSc-001-INFO" (program info course)
   - `intakeStartDate`: From their application (e.g., 2024-09-15)

3. **Step 1: Extract Programme Code**
   - From `BSc-001-INFO` → Extract `BSc`

4. **Step 2: Enroll in All Module Courses**
   - Get all courses for `BSc` from Moodle
   - Bulk enroll student in all courses with Student role (role_id: 5)

5. **Step 3: Calculate Academic Year & Intake**
   - From `intakeStartDate` (2024-09-15):
     - Intake month: September (9)
     - Intake year: 2024
     - **Academic Year:** 2024 (Sept is the start of the 2024 academic year)
   
6. **Step 4: Auto-Enroll in Year-Based Cohorts**
   - Calls `enrollStudentInCourseCohorts(email, firstName, lastName, "BSc", intakeStartDate)`
   
7. **In `enrollStudentInCourseCohorts()`:**
   - Derive academic year from intake date
   - **Query:** `SELECT cohort_label FROM course_lifecycle WHERE program_code = 'BSc' AND academic_year = 2024`
   - Returns year-based cohorts like: `Sep-2024`
   - For each cohort:
     - Get Moodle cohort ID for idnumber: `bsc-y1-sep-2024`
     - Add student to that cohort using `core_cohort_add_cohort_members`
   
8. **Result:**
   - Student is automatically enrolled in the year-based cohort: `BSc-Y1-Sep-2024`
   - This cohort auto-enrolls the student in all Year 1 courses

9. **Step 5: Enforce Progression Locks**
   - Apply any year/prerequisite restrictions

**Database Updates:**
- `mdl_cohort_members`: Student added to `bsc-y1-sep-2024` cohort
- Moodle auto-enrolls student in all courses linked to that cohort

---

## Data Flow Diagram

```
Teacher Creates Course Registration
        ↓
[course_registrations] ← Information: program, year, intake, course
        ↓
Approval triggered
        ↓
syncCourseRegistrationToMoodle()
        ↓
Creates:
├─ Moodle Course: BSc-001-Y1-S1-C1
└─ Year Cohort: bsc-y1-sep-2024

[course_lifecycle] ← Configured for each program year
        ↓
Contains cohort configurations:
├─ Program Code: BSc
├─ Year: 1
├─ Cohort Label: Sep-2024
└─ Links to all Year 1 courses

Student Applied for Program
        ↓
[student_applications]
        ↓
Application Approved
        ↓
enrollStudentInProgrammeCourses(email, "BSc-001-INFO", intakeDate)
        ↓
1. Enroll in all BSc courses
2. Call enrollStudentInCourseCohorts()
        ↓
calcAcademicYear(intakeDate)
        ↓
Query course_lifecycle for BSc + Year 2024
        ↓
Add to Cohort: bsc-y1-sep-2024
        ↓
[mdl_cohort_members]
        ↓
Moodle automatically enrolls student in:
└─ All courses linked to bsc-y1-sep-2024
```

---

## Database Tables Involved

### 1. `course_registrations`
Stores course registration details with year information:
- `course_code`: Program+year identifier
- `academic_year`: Year of study
- `cohort_label`: Intake identifier
- `year_category_id`: Year classification ID

### 2. `course_lifecycle`
Stores the lifecycle map for each program year:
- `program_code`: Program identifier
- `year_of_study`: Which year of program
- `academic_year`: Academic year/intake
- `cohort_label`: Intake cohort name
- `cohort_idnumber`: Moodle cohort reference

### 3. `student_applications`
Student enrollment requests:
- `application_status`: 'draft', 'submitted', 'approved', 'rejected'
- `course_code`: Program (e.g., "BSc-001-INFO")
- `intake_start_date`: When student starts

### 4. Moodle Tables (`mdl_*`)
- `mdl_course`: Courses (id, idnumber, shortname)
- `mdl_cohort`: Cohorts (idnumber: "bsc-y1-sep-2024")
- `mdl_cohort_members`: Student↔Cohort mappings
- `mdl_enrol`: Course enrolment instances
- `mdl_user_enrolments`: Student↔Course enrolments

---

## Updated Function: `enrollStudentInCourseCohorts()`

**File:** `backend/routes/students.js` (Line 5615)

**Parameters:**
- `email`: Student email
- `firstName`, `lastName`: Student names
- `programmeCode`: Program code (e.g., "BSc")
- `intakeStartDate`: DateTime of program start

**Flow:**
1. Get Moodle user ID by email
2. Derive academic year from `intakeStartDate`
   - If month ≥ August: current year (Sept-July wrap around)
   - If month < August: previous year
3. Query `course_lifecycle` for cohorts matching:
   - `program_code` = `programmeCode`
   - `academic_year` = derived year
4. For each cohort returned:
   - Get Moodle cohort ID via idnumber pattern
   - Add student to cohort using `core_cohort_add_cohort_members`
5. Return enrollment results

**Result:**
```json
{
  "success": true,
  "message": "Enrolled student in 4 course cohorts",
  "cohorts": [
    {
      "cohortLabel": "Sep-2024",
      "yearOfStudy": 1,
      "success": true
    }
  ]
}
```

---

## Key Improvements Over Previous Implementation

### Previous (Course Registrations-based):
- Student enrollment used `course_registrations.cohort_label` directly
- No year structure - treated all cohorts equally
- Missing linking to course lifecycle

### Current (Course Lifecycle-based):
- ✅ Year-structured cohorts: `{Program}-Y{Year}-{Intake}`
- ✅ Linked to `course_lifecycle` configurations
- ✅ Automatic year derivation from intake date
- ✅ Ensures all students in same cohort have same intake & year
- ✅ Supports progression rules (next year cohorts)

---

## Example Scenarios

### Example 1: BSc Student, Year 1, Sep 2024
```
Application:
  - Program: B.Sc. Computer Science
  - Course Code: BSc-001-INFO
  - Intake Date: 2024-09-15

Processing:
  1. Extract program code: BSc
  2. Derive academic year: 2024 (Sept ≥ August)
  3. Query: SELECT * FROM course_lifecycle WHERE program_code="BSc" AND academic_year=2024
     Result: Cohort "Sep-2024" for Year 1
  4. Enroll in Moodle cohort: "bsc-y1-sep-2024"

Result:
  - Student in cohort: "B.Sc. Computer Science Year 1 - Sep 2024"
  - Auto-enrolled in: All Year 1 courses
  - Academic Year: 2024-2025
```

### Example 2: Same Program, Year 2, Sep 2024
```
When student progresses:
  - Still intake: Sep 2024
  - Now year: 2 (promoted)
  - Query: SELECT * FROM course_lifecycle WHERE program_code="BSc" AND academic_year=2024 AND year_of_study=2
  - New cohort: "bsc-y2-sep-2024"
  - Student moves to: "B.Sc. Computer Science Year 2 - Sep 2024"
```

---

## Troubleshooting

### Students not in right cohorts?
1. Check `intakeStartDate` is correct in application
2. Verify `course_lifecycle` has entries for program+year+academic_year
3. Check Moodle cohort idnumber format matches: `{program}-y{year}-{intake}`

### Cohort not found?
1. Ensure course registration was approved
2. Verify `syncCourseRegistrationToMoodle()` completed successfully
3. Check Moodle `mdl_cohort` table for cohort entry

### Year calculation wrong?
1. Check intake date month/year
2. Academic year calculation:
   ```
   intakeMonth ≥ 8 ? currentYear : currentYear - 1
   ```
   - Sep-Dec: current year cohort
   - Jan-Jul: previous year cohort

---

## Next Steps / Future Enhancements

1. **Progression Automation:**
   - Auto-move students from Y1 to Y2 cohorts after completion
   
2. **Cohort Visibility:**
   - Show year/intake in student portals for clarity
   
3. **Reporting:**
   - Generate cohort enrollment reports by year/intake
   
4. **Validation:**
   - Prevent assigning students to wrong year cohorts
   
5. **Bulk Operations:**
   - Bulk move students between year cohorts

