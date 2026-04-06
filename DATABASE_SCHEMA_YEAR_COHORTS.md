# Database Schema - Year-Based Cohorts Reference

## Core Tables Overview

```
STUDENT LIFECYCLE:
┌─────────────────────────────────┐
│ student_applications            │
├─────────────────────────────────┤
│ PK: id                          │
│ FK: course_code → course_*      │
│ intake_start_date (*)           │  ← Determines academic year
│ application_status              │
│ created_at, updated_at          │
└─────────────────────────────────┘
            ↓
         [Approved]
            ↓
┌─────────────────────────────────┐
│ enrollStudentInProgrammeCourses()│  ← Calls with intakeStartDate
├─────────────────────────────────┤
│ - Extract program code          │
│ - Enroll in all courses         │
│ - Call enrollStudentInCourseCo...│  ← YEAR-BASED ENROLLMENT
└─────────────────────────────────┘


COURSE LIFECYCLE:
┌─────────────────────────────────┐
│ course_registrations (*)        │  ← Teacher registers course
├─────────────────────────────────┤
│ PK: id                          │
│ course_code (*)                 │  ← Contains Y{year}
│ programme_type_name (*)         │
│ academic_year (*)               │  ← e.g., "Year 1"
│ cohort_label (*)                │  ← e.g., "Sep-2024"
│ year_category_id                │
│ application_status: pending     │
│ moodle_sync_status              │
│ created_at, updated_at          │
└─────────────────────────────────┘
            ↓
         [Approved]
            ↓
  syncCourseRegistrationToMoodle()
            ↓
┌─────────────────────────────────┐
│ course_lifecycle (config) (*)   │  ← Pre-populated by admin
├─────────────────────────────────┤
│ PK: id                          │
│ program_code (*)                │  ← e.g., "BSc"
│ year_of_study (*)               │  ← 1, 2, 3, etc.
│ academic_year (*)               │  ← Matches intake year
│ cohort_label (*)                │  ← e.g., "Sep-2024"
│ cohort_idnumber                 │
│ created_at, lifecycle_status    │
└─────────────────────────────────┘


MOODLE SYNC:
┌─────────────────────────────────┐
│ mdl_cohort                      │
├─────────────────────────────────┤
│ PK: id                          │
│ name (*)                        │  ← "BSc Year 1 - Sep 2024"
│ idnumber (*)                    │  ← "bsc-y1-sep-2024"
│ contextid: 1 (system context)   │
│ description                     │
│ visible: 1                      │
│ timecreated, timemodified       │
└─────────────────────────────────┘
            ↓ (Linked to)
┌─────────────────────────────────┐
│ mdl_course                      │
├─────────────────────────────────┤
│ PK: id                          │
│ idnumber (*)                    │  ← "bsc-001-y1-s1-c1"
│ shortname                       │
│ fullname: "Programming..."      │
│ category: course_categories     │
└─────────────────────────────────┘
            ↓ (Added to)
┌─────────────────────────────────┐
│ mdl_cohort_members              │
├─────────────────────────────────┤
│ FK: cohortid                    │
│ FK: userid                      │
│ timeadded                       │
└─────────────────────────────────┘
            ↓ (Auto-enrolled)
┌─────────────────────────────────┐
│ mdl_user_enrolments             │
├─────────────────────────────────┤
│ FK: enrolid                     │
│ FK: userid                      │  ← Student user
│ status: 0 (active)              │
│ timestart, timeend              │
└─────────────────────────────────┘
```

---

## Table Details

### 1. `student_applications`

**Purpose:** Store student program applications

**Key Fields for Year-Based Cohorts:**
```sql
CREATE TABLE student_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Student Info
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    
    -- Program Info
    course_code VARCHAR(50),  -- e.g., "BSc-001-INFO" (INFO indicates program info course)
    programme_name VARCHAR(255),
    
    -- CRITICAL FOR YEAR-BASED COHORTS ⭐
    intake_start_date DATETIME,  -- When student starts (e.g., 2024-09-15)
    -- Used to calculate academic year for cohort assignment
    
    -- Status
    application_status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'submitted',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Timestamps
    submitted_at DATETIME,
    approved_at DATETIME,
    
    UNIQUE KEY unique_student_course (email, course_code)
);
```

**When Enrollment Happens:**
1. Status changed to `'approved'`
2. `intakeStartDate` is passed to `enrollStudentInProgrammeCourses()`
3. Academic year calculated: `month >= 8 ? year : year - 1`
4. Student placed in year-based cohort

---

### 2. `course_registrations` (Oracle/SCL Database)

**Purpose:** Store teacher's course registrations with year info

**Key Fields for Year-Based Cohorts:**
```sql
CREATE TABLE course_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Course Identification
    course_code VARCHAR(50) NOT NULL,        -- e.g., "BSc-001-Y1-S1-C1" (must contain Y{n})
    course_title VARCHAR(255) NOT NULL,      -- e.g., "Programming Fundamentals"
    programme_type_name VARCHAR(255),        -- e.g., "B.Sc. Computer Science"
    program_name VARCHAR(255),               -- e.g., "Computer Science"
    
    -- CRITICAL FOR YEAR-BASED COHORTS ⭐
    academic_year VARCHAR(50),               -- e.g., "Year 1", "Year 2", "Postgraduate Year 1"
    year_category_id INT,                    -- Foreign key to year categories (1=Y1, 2=Y2)
    
    -- CRITICAL FOR YEAR-BASED COHORTS ⭐
    cohort_label VARCHAR(50),                -- e.g., "Sep-2024", "Jan-2024"
    cohort_category_id INT,                  -- Foreign key to cohort categories
    
    semester_name VARCHAR(100),
    semester_category_id INT,
    
    -- Course Details
    course_type VARCHAR(100),
    mode_of_delivery VARCHAR(100),
    start_date DATE,
    end_date_or_duration VARCHAR(100),
    
    -- Status
    application_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    moodle_sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending',
    moodle_sync_message TEXT,
    moodle_course_id INT,
    
    -- Tracking
    registration_reference VARCHAR(50) UNIQUE,
    reviewer_name VARCHAR(255),
    reviewer_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    last_synced_at DATETIME,
    
    UNIQUE KEY unique_course_cohort (course_code, cohort_label, year_category_id)
);
```

**Critical Relationship:**
- `course_code`: Must contain `Y{number}` for year extraction
- `academic_year`: Human-readable year (e.g., "Year 1")
- `year_category_id`: Links to program year category
- `cohort_label`: Intake identifier (e.g., "Sep-2024")

**Example Rows:**
```sql
INSERT INTO course_registrations 
  (course_code, programme_type_name, academic_year, year_category_id, cohort_label, application_status)
VALUES 
  ('BSc-001-Y1-S1-C1', 'B.Sc. Computer Science', 'Year 1', 1, 'Sep-2024', 'pending'),
  ('BSc-002-Y1-S2-C1', 'B.Sc. Computer Science', 'Year 1', 1, 'Sep-2024', 'pending'),
  ('BSc-101-Y2-S1-C1', 'B.Sc. Computer Science', 'Year 2', 2, 'Sep-2024', 'pending'),
  ('BSc-001-Y1-S1-C1', 'B.Sc. Computer Science', 'Year 1', 1, 'Jan-2024', 'pending');
```

---

### 3. `course_lifecycle` (SCL Database)

**Purpose:** Master configuration for program year structures

**Schema:**
```sql
CREATE TABLE course_lifecycle (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Program Year Structure ⭐
    program_code VARCHAR(50) NOT NULL,       -- e.g., "BSc", "MSc"
    year_of_study INT NOT NULL,              -- 1, 2, 3, 4 (which year of program)
    academic_year VARCHAR(50) NOT NULL,      -- e.g., "2024", "Year 1", "2024-2025"
    
    -- Year Cohort ⭐
    cohort_label VARCHAR(50) NOT NULL,       -- e.g., "Sep-2024", "Jan-2024"
    
    -- Optional: cached idnumber for quick lookup
    cohort_idnumber VARCHAR(100),            -- e.g., "bsc-y1-sep-2024" (calculated)
    
    -- Lifecycle Status
    lifecycle_status ENUM('planning', 'active', 'archived') DEFAULT 'active',
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint: one cohort per program+year
    UNIQUE KEY unique_prog_year_cohort (program_code, year_of_study, academic_year, cohort_label),
    KEY idx_prog_year (program_code, year_of_study),
    KEY idx_prog_acad (program_code, academic_year)
);
```

**Purpose of Each Field:**

| Field | Purpose | Example |
|-------|---------|---------|
| program_code | Program identifier | `BSc`, `MSc`, `UnderGrad` |
| year_of_study | Year number in program | 1, 2, 3, 4 |
| academic_year | When cohort starts | `2024`, `2024-2025`, `2025` |
| cohort_label | Intake date identification | `Sep-2024`, `Jan-2024`, `May-2024` |
| cohort_idnumber | Moodle cohort ID (lowercase) | `bsc-y1-sep-2024` |

**Example Data:**
```sql
INSERT INTO course_lifecycle 
  (program_code, year_of_study, academic_year, cohort_label)
VALUES 
  ('BSc', 1, '2024', 'Sep-2024'),     -- BSc Year 1, Sep 2024 intake
  ('BSc', 2, '2024', 'Sep-2024'),     -- BSc Year 2, Sep 2024 intake (same intake, advanced year)
  ('BSc', 3, '2024', 'Sep-2024'),     -- BSc Year 3, Sep 2024 intake
  ('BSc', 1, '2024', 'Jan-2024'),     -- BSc Year 1, Jan 2024 intake
  ('MSc', 1, '2024', 'Sep-2024'),     -- MSc Year 1, Sep 2024 intake
  ('MSc', 1, '2024', 'Jan-2024'),     -- MSc Year 1, Jan 2024 intake
  ('PartTime', 1, '2024', 'Sep-2024'); -- Part-time Year 1, Sep 2024 intake
```

**Query: Find all cohorts for BSc Year 1 with Sep 2024 intake**
```sql
SELECT * FROM course_lifecycle
WHERE program_code = 'BSc'
  AND year_of_study = 1
  AND academic_year = '2024'
  AND cohort_label = 'Sep-2024';
-- Returns 1 row defining the Year 1 Sep 2024 cohort for BSc
```

---

### 4. Moodle: `mdl_cohort`

**Purpose:** Store cohorts in Moodle

**Key Fields:**
```sql
CREATE TABLE mdl_cohort (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    contextid BIGINT,               -- Always 1 (system context)
    name VARCHAR(254),              -- Display name: "BSc Year 1 - Sep 2024"
    idnumber VARCHAR(100) UNIQUE,   -- Unique: "bsc-y1-sep-2024" ⭐
    description LONGTEXT,
    descriptionformat INT DEFAULT 1,
    visible TINYINT DEFAULT 1,
    component VARCHAR(100),         -- Empty for manual cohort
    timecreated BIGINT,
    timemodified BIGINT
);
```

**Critical Fields:**
- `idnumber`: **MUST** follow pattern `{program}-y{year}-{intake}` (lowercase, dashes)
- `name`: Human-readable cohort name
- `contextid`: Always 1 (system-wide cohort)

**Example:**
```sql
INSERT INTO mdl_cohort (contextid, name, idnumber, description, timecreated, timemodified)
VALUES (
    1,
    'B.Sc. Computer Science Year 1 - Sep 2024',
    'bsc-y1-sep-2024',
    'Year 1 cohort for Sep 2024 intake of B.Sc. Computer Science programme',
    1726920000,
    1726920000
);
```

**Query: Find all BSc year-based cohorts**
```sql
SELECT * FROM mdl_cohort
WHERE idnumber LIKE 'bsc-y%'
ORDER BY idnumber;
-- Returns: bsc-y1-sep-2024, bsc-y2-sep-2024, etc.
```

---

### 5. Moodle: `mdl_cohort_members`

**Purpose:** Link students to cohorts (auto-enrollment happens here)

**Schema:**
```sql
CREATE TABLE mdl_cohort_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    cohortid BIGINT NOT NULL,       -- Foreign key to mdl_cohort
    userid BIGINT NOT NULL,         -- Foreign key to mdl_user
    timeadded BIGINT,               -- When added to cohort
    
    UNIQUE KEY cohortid_userid (cohortid, userid),
    KEY userid (userid)
);
```

**When Student Enrolls:**
```sql
-- 1. Check if cohort exists
SELECT id FROM mdl_cohort WHERE idnumber = 'bsc-y1-sep-2024';
-- Result: id = 42

-- 2. Get student Moodle ID
SELECT id FROM mdl_user WHERE email = 'john.smith@example.com';
-- Result: id = 156

-- 3. Add student to cohort
INSERT INTO mdl_cohort_members (cohortid, userid, timeadded)
VALUES (42, 156, UNIX_TIMESTAMP());

-- 4. Moodle automatically enrolls student in all courses linked to cohort 42
-- This creates entries in mdl_user_enrolments for each course
```

---

### 6. Moodle: `mdl_course`

**Purpose:** Store courses (synced from `course_registrations`)

**Key Fields:**
```sql
CREATE TABLE mdl_course (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    category BIGINT,                -- Course category
    idnumber VARCHAR(100) UNIQUE,   -- "bsc-001-y1-s1-c1" ⭐
    shortname VARCHAR(255),         -- "BSc001Y1"
    fullname VARCHAR(1333),         -- "Programming Fundamentals"
    
    -- Cohort linking
    -- Courses are linked to cohorts via idnumber matching or explicit link
    
    timecreated BIGINT,
    timemodified BIGINT
);
```

**Example:**
```sql
INSERT INTO mdl_course (category, idnumber, shortname, fullname, timecreated, timemodified)
VALUES (
    4,  -- course category
    'bsc-001-y1-s1-c1',
    'BSc001Y1',
    'Programming Fundamentals',
    1726920000,
    1726920000
);
```

---

## The Complete Data Flow

### Flow 1: Course Registration → Moodle Cohort Creation

```sql
-- Step 1: Teacher registers course
INSERT INTO course_registrations 
  (course_code, programme_type_name, academic_year, cohort_label, ...)
VALUES ('BSc-001-Y1-S1-C1', 'B.Sc. Computer Science', 'Year 1', 'Sep-2024', ...);
-- id = 10, status = 'pending'

-- Step 2: Admin/System approves it
UPDATE course_registrations
SET application_status = 'approved'
WHERE id = 10;

-- Step 3: syncCourseRegistrationToMoodle(10) is called
--   a) Create Moodle course from course_registrations row

INSERT INTO mdl_course (idnumber, shortname, fullname, ...)
VALUES ('bsc-001-y1-s1-c1', 'BSc001Y1', 'Programming Fundamentals', ...);
-- id = 234

--   b) Create year-based cohort
--      Extract: program='BSc', year='1', intake='Sep-2024'
--      Build idnumber: 'bsc-y1-sep-2024'

INSERT INTO mdl_cohort (name, idnumber, ...)
VALUES ('B.Sc. Computer Science Year 1 - Sep 2024', 'bsc-y1-sep-2024', ...);
-- id = 42

-- Step 4: Update course_registrations with Moodle IDs
UPDATE course_registrations
SET moodle_course_id = 234, moodle_sync_status = 'synced'
WHERE id = 10;
```

### Flow 2: Student Application Approval → Cohort Enrollment

```sql
-- Step 1: Student applies for program
INSERT INTO student_applications 
  (email, course_code, intake_start_date, application_status)
VALUES ('john.smith@example.com', 'BSc-001-INFO', '2024-09-15', 'submitted');
-- id = 150

-- Step 2: Admissions approves
UPDATE student_applications
SET application_status = 'approved'
WHERE id = 150;

-- Step 3: enrollStudentInProgrammeCourses() is called with:
--   - email: 'john.smith@example.com'
--   - course_code: 'BSc-001-INFO'
--   - intake_start_date: '2024-09-15'

-- Step 3a: Get Moodle user ID
SELECT id FROM mdl_user WHERE email = 'john.smith@example.com';
-- Result: id = 156 (created if not exists)

-- Step 3b: Enroll in all BSc courses
INSERT INTO mdl_user_enrolments (userid, enrolid, ...)
VALUES (156, ...,), ...;  -- For each BSc course

-- Step 3c: enrollStudentInCourseCohorts() is called:
--   - Derive academic year from '2024-09-15': month=9, year=2024
--   - Academic year = 2024 (month >= 8)

SELECT * FROM course_lifecycle
WHERE program_code = 'BSc'
  AND academic_year = '2024';
-- Returns: year_of_study=1, cohort_label='Sep-2024'

-- Step 3d: Build cohort idnumber and find it
SELECT id FROM mdl_cohort WHERE idnumber = 'bsc-y1-sep-2024';
-- Result: id = 42

-- Step 3e: Add student to cohort
INSERT INTO mdl_cohort_members (cohortid, userid, timeadded)
VALUES (42, 156, UNIX_TIMESTAMP());

-- Step 3f: Moodle AUTOMATICALLY enrolls student in all courses linked to cohort 42
-- (This is built-in Moodle behavior - cohort auto-enrollment)
```

---

## Query Examples

### Find all students in a cohort
```sql
-- Moodle query
SELECT u.id, u.firstname, u.lastname, u.email
FROM mdl_user u
JOIN mdl_cohort_members cm ON u.id = cm.userid
JOIN mdl_cohort c ON cm.cohortid = c.id
WHERE c.idnumber = 'bsc-y1-sep-2024'
ORDER BY u.lastname, u.firstname;
```

### Find all courses for a cohort
```sql
-- Moodle query
SELECT c.id, c.fullname, c.idnumber
FROM mdl_course c
WHERE c.idnumber LIKE 'bsc-001-y1-%'  -- All Y1 components
UNION
SELECT c.id, c.fullname, c.idnumber
FROM mdl_course c
WHERE c.idnumber LIKE 'bsc-101-y1-%'  -- All Y1 core courses
ORDER BY c.idnumber;
```

### Check if student in correct cohort
```sql
-- SCL query
SELECT sa.email, sa.intake_start_date, cl.program_code, cl.year_of_study, cl.cohort_label
FROM student_applications sa
JOIN course_lifecycle cl ON sa.program_code = cl.program_code
WHERE sa.email = 'john.smith@example.com'
  AND YEAR(sa.intake_start_date) = YEAR(NOW())
  AND MONTH(sa.intake_start_date) >= 8;
```

### Find students missing from year cohort
```sql
-- Find BSc Year 1 Sep 2024 students not in cohort
SELECT u.id, u.firstname, u.lastname, u.email
FROM mdl_user u
WHERE u.email IN (
    SELECT email FROM student_applications
    WHERE course_code LIKE 'BSc%'
      AND intake_start_date >= '2024-09-01'
      AND intake_start_date < '2024-10-01'
)
AND u.id NOT IN (
    SELECT cm.userid
    FROM mdl_cohort_members cm
    JOIN mdl_cohort c ON cm.cohortid = c.id
    WHERE c.idnumber = 'bsc-y1-sep-2024'
);
```

