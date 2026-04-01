-- Create course lifecycle entries based on actual Moodle course structure
-- This script gets all HND and Degree courses and their sections from Moodle
-- and creates lifecycle entries matching the exact Moodle structure

-- First, clear existing lifecycle data
DELETE FROM course_lifecycle_master;
DELETE FROM course_lifecycle;

-- Insert lifecycle data for all HND and Degree courses with their sections
INSERT INTO course_lifecycle (
    course_id,
    course_name,
    course_code,
    course_type,
    programme_type_name,
    program_name,
    academic_year,
    semester_name,
    session_start_date,
    session_end_date,
    created_at,
    updated_at
)
SELECT DISTINCT
    c.id as course_id,
    c.fullname as course_name,
    c.idnumber as course_code,
    CASE 
        WHEN cc.name LIKE '%HND%' THEN 'HND'
        WHEN cc.name LIKE '%Degree%' OR cc.name LIKE '%DEG%' THEN 'Degree'
        ELSE 'Other'
    END as course_type,
    CASE 
        WHEN cc.name LIKE '%HND%' THEN 'Higher National Diploma'
        WHEN cc.name LIKE '%Degree%' OR cc.name LIKE '%DEG%' THEN 'Bachelor of Science'
        ELSE 'Other'
    END as programme_type_name,
    c.fullname as program_name,
    CONCAT('Year ', CEIL((cs.section + 1) / 2)) as academic_year,
    CONCAT('Semester ', MOD(cs.section, 2) + 1) as semester_name,
    DATE_ADD(NOW(), INTERVAL 0 DAY) as session_start_date,
    DATE_ADD(NOW(), INTERVAL 180 DAY) as session_end_date,
    NOW() as created_at,
    NOW() as updated_at
FROM mdl_course c
JOIN mdl_course_categories cc ON c.category = cc.id
JOIN mdl_course_sections cs ON c.id = cs.course
WHERE (cc.name LIKE '%HND%' OR cc.name LIKE '%Degree%' OR cc.name LIKE '%DEG%')
    AND cs.section > 0
ORDER BY c.id, cs.section;

-- Also insert master records for tracking
INSERT INTO course_lifecycle_master (
    course_id,
    course_code,
    course_name,
    programme_type_name,
    program_name,
    academic_year,
    semester_name,
    section_number,
    created_at,
    updated_at
)
SELECT DISTINCT
    c.id as course_id,
    c.idnumber as course_code,
    c.fullname as course_name,
    CASE 
        WHEN cc.name LIKE '%HND%' THEN 'Higher National Diploma'
        WHEN cc.name LIKE '%Degree%' OR cc.name LIKE '%DEG%' THEN 'Bachelor of Science'
        ELSE 'Other'
    END as programme_type_name,
    c.fullname as program_name,
    CONCAT('Year ', CEIL((cs.section + 1) / 2)) as academic_year,
    CONCAT('Semester ', MOD(cs.section, 2) + 1) as semester_name,
    cs.section as section_number,
    NOW() as created_at,
    NOW() as updated_at
FROM mdl_course c
JOIN mdl_course_categories cc ON c.category = cc.id
JOIN mdl_course_sections cs ON c.id = cs.course
WHERE (cc.name LIKE '%HND%' OR cc.name LIKE '%Degree%' OR cc.name LIKE '%DEG%')
    AND cs.section > 0
ORDER BY c.id, cs.section;

-- Verify the data
SELECT 
    programme_type_name,
    program_name,
    academic_year,
    semester_name,
    COUNT(*) as total_courses
FROM course_lifecycle
GROUP BY programme_type_name, program_name, academic_year, semester_name
ORDER BY programme_type_name, program_name, academic_year, semester_name;
