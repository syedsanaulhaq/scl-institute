# Student Registration Year-Based Cohorts - Implementation Guide

## Quick Summary

The system now ensures that when students are enrolled in a program, they are automatically placed in **year-based cohorts** that:
- Match their program (e.g., `BSc`)
- Match their year of study (e.g., `Year 1`)
- Match their intake cohort (e.g., `Sep-2024`)

**Result:** Cohort name in Moodle: `bsc-y1-sep-2024`

---

## What Changed

### Updated Function: `enrollStudentInCourseCohorts()` 
**File:** `backend/routes/students.js` (Line 5615)

**Old Approach:**
- Used `cohort_label` directly from `course_registrations`
- No year structure
- Students mixed across different years in same cohort

**New Approach:**
- Queries `course_lifecycle` table for year-based configurations
- Builds structured cohort idnumber: `{program}-y{year}-{intake}`
- Automatically derived academic year from intake date
- Ensures year-separated cohorts

---

## Step-by-Step: How It Works

### 1️⃣ **Teacher Registers Course**
**When:** Teacher/Admin creates a course registration

**Form Fields Required:**
- `course_code`: e.g., "BSc-001-Y1-S1-C1"
- `programme_type_name`: e.g., "B.Sc. Computer Science"
- `academic_year`: e.g., "Year 1"
- `cohort_label`: e.g., "Sep-2024"
- `year_category_id`: Links to program year (1, 2, 3, etc.)

**Endpoint:** `POST /api/course-registrations`

```json
{
  "course_code": "BSc-001-Y1-S1-C1",
  "programme_type_name": "B.Sc. Computer Science",
  "academic_year": "Year 1",
  "cohort_label": "Sep-2024",
  "year_category_id": 1
}
```

**Action:** Registration saved with status `pending`

---

### 2️⃣ **Course Registration Approved**
**When:** Reviewer approves the course registration

**Endpoint:** `POST /api/course-registrations/:id/approve`

**What Happens:**
- Status changes to `approved`
- `syncCourseRegistrationToMoodle()` called automatically
- In Moodle:
  - ✅ Course created: `BSc-001-Y1-S1-C1`
  - ✅ Year-based cohort created: `bsc-y1-sep-2024`
  - ✅ Cohort linked to all Year 1 courses for BSc

---

### 3️⃣ **Course Lifecycle Configured** (System Setup)
**When:** System administrator sets up program structure

**Where:** `course_lifecycle` table

**Example Data:**
```sql
INSERT INTO course_lifecycle (program_code, year_of_study, academic_year, cohort_label)
VALUES ('BSc', 1, '2024', 'Sep-2024');
```

**Purpose:** Defines which cohorts exist for each program+year combination

---

### 4️⃣ **Student Application Approved**
**When:** Admissions team approves student application

**Database Update:**
- `student_applications.application_status` → `'approved'`
- `student_applications.intake_start_date` → Student's program start date
- `student_applications.course_code` → Program (e.g., `'BSc-001-INFO'`)

**Triggers:** `enrollStudentInProgrammeCourses()` function

---

### 5️⃣ **Student Automatically Enrolled in Year Cohort** ⭐
**When:** `enrollStudentInProgrammeCourses()` is called

**Calls:** `enrollStudentInCourseCohorts(email, firstName, lastName, program, intakeDate)`

**Parameters Passed:**
- `email`: "john.smith@example.com"
- `firstName`: "John"
- `lastName`: "Smith"
- `programmeCode`: Extracted from course code (e.g., `"BSc"` from `"BSc-001-INFO"`)
- `intakeStartDate`: From application (e.g., `2024-09-15`)

**Function Logic:**
```
1. Get Moodle user ID by email
   └─ If not exists: Create user first

2. Calculate academic year from intake date:
   └─ September (month 9) or later = current year (2024)
   └─ January-July = previous year (2023)

3. Query course_lifecycle for this program+year:
   SELECT cohort_label, year_of_study 
   FROM course_lifecycle 
   WHERE program_code = 'BSc' 
   AND academic_year = 2024
   Result: Sep-2024, Year 1

4. For each cohort, build idnumber:
   └─ cohortIdnumber = "bsc-y1-sep-2024"
   └─ cohortName = "B.Sc. Computer Science Year 1 - Sep-2024"

5. Ensure cohort exists in Moodle:
   └─ Check: SELECT * FROM mdl_cohort WHERE idnumber='bsc-y1-sep-2024'
   └─ If not exists: Create it
   
6. Add student to cohort:
   └─ INSERT INTO mdl_cohort_members (cohortid, userid, timeadded)
   └─ Moodle auto-enrolls student in all linked courses
```

**Result:**
```json
{
  "success": true,
  "message": "Enrolled student in 1 year-based cohort(s)",
  "cohorts": [
    {
      "cohortLabel": "Sep-2024",
      "yearOfStudy": 1,
      "success": true,
      "method": "api" // or "db" if fallback
    }
  ]
}
```

---

## Database Tables

### `course_registrations`
Stores what teacher registered:
```
id | course_code | programme_type_name | academic_year | cohort_label | year_category_id | status
-- | ----------- | ------------------- | ------------- | ------------ | --------------- | -------
1  | BSc-001-Y1  | B.Sc. Comp Sci      | Year 1        | Sep-2024     | 1                | approved
```

### `course_lifecycle`
Stores program year configurations:
```
id | program_code | year_of_study | academic_year | cohort_label
-- | ------------ | ------------- | ------------- | -----------
1  | BSc          | 1             | 2024          | Sep-2024
2  | BSc          | 2             | 2024          | Sep-2024
```

### Moodle: `mdl_cohort`
Stores actual cohorts:
```
id  | name                                    | idnumber           | contextid
--- | --------------------------------------- | ------------------ | ---------
42  | B.Sc. Computer Science Year 1 - Sep24  | bsc-y1-sep-2024    | 1
```

### Moodle: `mdl_cohort_members`
Links students to cohorts:
```
cohortid | userid | timeadded
-------- | ------ | --------
42       | 156    | 1726920000
```

---

## Validation Checklist

✅ **Before Deploying:**
1. Verify `course_lifecycle` is populated with all program years
2. Check that intake dates in applications use valid date format
3. Ensure year_of_study values in course_lifecycle match registration academic_year
4. Test with one student to verify cohort assignment

✅ **After Deploying:**
1. Check Moodle `mdl_cohort` for year-based ids: `program-y#-intake`
2. Verify students are in correct cohorts
3. Confirm auto-enrollment into courses works
4. Check server logs for any "[COURSE COHORT]" errors

---

## Example: Complete Flow

### Given:
- Program: B.Sc. Computer Science (code: `BSc`)
- Student: Jane Doe (jane@university.edu)
- Intake: September 15, 2024
- Year: 1 (First Year)

### Timeline:
```
10:00 AM - Teacher registers BSc Year 1 course
          └─ Creates course_registrations with year=1, cohort=Sep-2024

10:15 AM - Reviewer approves registration
          └─ syncCourseRegistrationToMoodle() runs
          └─ Creates Moodle cohort: "bsc-y1-sep-2024"

10:30 AM - Admissions approves Jane's application
          └─ student_applications.application_status = 'approved'
          └─ Triggers enrollStudentInProgrammeCourses()

10:30:15 AM - Student Enrollment Process:
          └─ Extract program: "BSc"
          └─ Calc academic year: 2024 (Sept >= 8)
          └─ Query: course_lifecycle for BSc + 2024
          └─ Found: Sep-2024, Year 1
          └─ Build cohort id: "bsc-y1-sep-2024"
          └─ Add Jane to cohort "bsc-y1-sep-2024"
          └─ Moodle auto-enrolls Jane in all Year 1 courses
          
10:31 AM - Result:
          ✅ Jane is in cohort: "B.Sc. Computer Science Year 1 - Sep 2024"
          ✅ Jane is enrolled in all Year 1 courses
          ✅ Jane's progression locked to Year 1
```

---

## Troubleshooting

### Issue: Student not in cohort
**Check:**
1. Moodle user created? `mdl_user` table has student email
2. Cohort exists? `mdl_cohort` has idnumber like `bsc-y1-sep-2024`
3. course_lifecycle populated? `SELECT * FROM course_lifecycle WHERE program_code='BSc'`

**Fix:**
- Run: `POST /api/students/re-enroll-cohorts` (if endpoint exists)
- Or manually check `enrollStudentInCourseCohorts()` logs

### Issue: Wrong year assignment
**Check:** intake_start_date
- Sept-Dec (months 9-12) = current year
- Jan-Aug (months 1-8) = previous year

**Example:** Student with intake 2024-07-15 → Academic year 2023

**Fix:** Update application intake_start_date if wrong

### Issue: "No course lifecycle cohorts found"
**Check:** `course_lifecycle` table is populated for program+year

**Fix:**
```sql
INSERT INTO course_lifecycle (program_code, year_of_study, academic_year, cohort_label)
VALUES ('BSc', 1, 2024, 'Sep-2024');
```

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/students/applications/:id` | POST | Submit application |
| `/api/admissions-decisions/:id/approve` | POST | Approve application (triggers enrollment) |
| `/api/course-registrations` | POST/PUT | Create/update course registration |
| `/api/course-registrations/:id/approve` | POST | Approve registration (creates cohort) |

---

## Future Enhancements

1. **Auto-progression:** Move students from Y1 → Y2 cohorts automatically
2. **Cohort Reports:** Dashboard showing enrollment by cohort/year
3. **Bulk Updates:** Tools to reassign cohorts for multiple students
4. **Validation Rules:** Prevent assigning students to wrong year cohorts

