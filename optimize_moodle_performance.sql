-- ================================================
-- Moodle Database Performance Optimization
-- Adds indexes to improve query performance for student programme page
-- ================================================

-- Index on mdl_course for faster lookups by idnumber and shortname
CREATE INDEX IF NOT EXISTS idx_course_idnumber ON mdl_course(idnumber);
CREATE INDEX IF NOT EXISTS idx_course_shortname ON mdl_course(shortname);
CREATE INDEX IF NOT EXISTS idx_course_fullname ON mdl_course(fullname(100));

-- Index on mdl_course_sections for faster section lookups
CREATE INDEX IF NOT EXISTS idx_course_sections_course ON mdl_course_sections(course, section);

-- Index on mdl_course_modules for faster module lookups
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON mdl_course_modules(course, deletioninprogress);
CREATE INDEX IF NOT EXISTS idx_course_modules_section ON mdl_course_modules(section, deletioninprogress);
CREATE INDEX IF NOT EXISTS idx_course_modules_instance ON mdl_course_modules(instance, module);

-- Composite index for the join between course_modules and modules
CREATE INDEX IF NOT EXISTS idx_course_modules_module ON mdl_course_modules(module, course);

-- Index on student_applications for faster application lookups
CREATE INDEX IF NOT EXISTS idx_student_applications_id ON student_applications(id);
CREATE INDEX IF NOT EXISTS idx_student_applications_course_code ON student_applications(course_code);

-- Analyze tables to update statistics
ANALYZE TABLE mdl_course;
ANALYZE TABLE mdl_course_sections;
ANALYZE TABLE mdl_course_modules;
ANALYZE TABLE mdl_modules;
ANALYZE TABLE student_applications;

-- Show index status
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM 
    INFORMATION_SCHEMA.STATISTICS
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('mdl_course', 'mdl_course_sections', 'mdl_course_modules', 'student_applications')
ORDER BY 
    TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
