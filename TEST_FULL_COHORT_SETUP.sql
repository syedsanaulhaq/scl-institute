-- =====================================================
-- COMPLETE TEST: Year-Based Cohort System
-- Create Root Category → Program Type → Program → Year → Semester → Courses
-- =====================================================

-- Step 1: Create Root Category "Test Institute Programs"
-- This is the top-level category

INSERT INTO mdl_course_categories (name, idnumber, description, parent, visible, timemodified)
VALUES (
    'Test Institute Programs',
    'root-test-programs',
    'Root category for testing year-based cohorts',
    0,
    1,
    UNIX_TIMESTAMP()
);

SET @root_cat_id = LAST_INSERT_ID();

-- Step 2: Create Program Type Category: "Business Studies"
INSERT INTO mdl_course_categories (name, idnumber, description, parent, visible, timemodified)
VALUES (
    'Business Studies',
    'progtype-business',
    'Program Type: Business Studies',
    @root_cat_id,
    1,
    UNIX_TIMESTAMP()
);

SET @progtype_id = LAST_INSERT_ID();

-- Step 3: Create Program Category: "B.Sc. Management"
INSERT INTO mdl_course_categories (name, idnumber, description, parent, visible, timemodified)
VALUES (
    'B.Sc. Management',
    'prog-bscmgt',
    'Program: Bachelor of Science in Management',
    @progtype_id,
    1,
    UNIX_TIMESTAMP()
);

SET @program_id = LAST_INSERT_ID();

-- Step 4: Create Year Categories: Year 1, Year 2, Year 3
INSERT INTO mdl_course_categories (name, idnumber, description, parent, visible, timemodified)
VALUES 
    ('Year 1', 'year-1', 'Year 1 of B.Sc. Management', @program_id, 1, UNIX_TIMESTAMP()),
    ('Year 2', 'year-2', 'Year 2 of B.Sc. Management', @program_id, 1, UNIX_TIMESTAMP()),
    ('Year 3', 'year-3', 'Year 3 of B.Sc. Management', @program_id, 1, UNIX_TIMESTAMP());

SET @year1_id = (SELECT id FROM mdl_course_categories WHERE idnumber = 'year-1');
SET @year2_id = (SELECT id FROM mdl_course_categories WHERE idnumber = 'year-2');
SET @year3_id = (SELECT id FROM mdl_course_categories WHERE idnumber = 'year-3');

-- Step 5: Create Semester Categories under Year 1
INSERT INTO mdl_course_categories (name, idnumber, description, parent, visible, timemodified)
VALUES 
    ('Semester 1', 'sem-y1-1', 'Year 1, Semester 1 (Sep-Dec)', @year1_id, 1, UNIX_TIMESTAMP()),
    ('Semester 2', 'sem-y1-2', 'Year 1, Semester 2 (Jan-Apr)', @year1_id, 1, UNIX_TIMESTAMP());

SET @sem1_id = (SELECT id FROM mdl_course_categories WHERE idnumber = 'sem-y1-1');
SET @sem2_id = (SELECT id FROM mdl_course_categories WHERE idnumber = 'sem-y1-2');

-- Step 6: Create Test Courses under Semester 1
-- Course 1: Organizational Behavior
INSERT INTO mdl_course (category, fullname, shortname, idnumber, visible, timecreated, timemodified)
VALUES 
(
    @sem1_id,
    'Organizational Behavior (20 credits)',
    'MGT101',
    'bsc-001-y1-s1-c1',
    1,
    UNIX_TIMESTAMP(),
    UNIX_TIMESTAMP()
);

SET @course1_id = LAST_INSERT_ID();

-- Course 2: Business Communication
INSERT INTO mdl_course (category, fullname, shortname, idnumber, visible, timecreated, timemodified)
VALUES 
(
    @sem1_id,
    'Business Communication (15 credits)',
    'MGT102',
    'bsc-002-y1-s1-c1',
    1,
    UNIX_TIMESTAMP(),
    UNIX_TIMESTAMP()
);

SET @course2_id = LAST_INSERT_ID();

-- Course 3: Management Principles
INSERT INTO mdl_course (category, fullname, shortname, idnumber, visible, timecreated, timemodified)
VALUES 
(
    @sem1_id,
    'Management Principles (20 credits)',
    'MGT103',
    'bsc-003-y1-s1-c1',
    1,
    UNIX_TIMESTAMP(),
    UNIX_TIMESTAMP()
);

SET @course3_id = LAST_INSERT_ID();

-- =====================================================
-- Step 7: Create Year-Based Cohort in course_lifecycle
-- =====================================================

INSERT INTO course_lifecycle (program_code, year_of_study, academic_year, cohort_label, lifecycle_status)
VALUES 
('BSC', 1, '2024', 'Sep-2024', 'active');

-- =====================================================
-- RESULTS: What we've created
-- =====================================================

SELECT 'CATEGORY STRUCTURE CREATED:' as status;
SELECT 'Root Category ID' as item, @root_cat_id as value
UNION ALL
SELECT 'Program Type (Business Studies) ID', @progtype_id
UNION ALL
SELECT 'Program (B.Sc. Management) ID', @program_id
UNION ALL
SELECT 'Year 1 Category ID', @year1_id
UNION ALL
SELECT 'Semester 1 Category ID', @sem1_id;

SELECT 'COURSES CREATED:' as status;
SELECT id, fullname, shortname, idnumber FROM mdl_course WHERE idnumber LIKE 'bsc-%y1-s1-%';

SELECT 'COURSE LIFECYCLE ENTRY CREATED:' as status;
SELECT program_code, year_of_study, academic_year, cohort_label FROM course_lifecycle WHERE program_code = 'BSC' AND year_of_study = 1;

-- =====================================================
-- Now you can use the form to register these courses!
-- URL: http://localhost:3000/course-registrations?auto_open=1&course_code=bsc-001-y1-s1-c1&course_title=Organizational%20Behavior%20(20%20credits)
-- =====================================================
