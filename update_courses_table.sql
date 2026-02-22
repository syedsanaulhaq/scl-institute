-- Add missing columns to courses table (checking each individually)

-- Add course_code
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'course_code');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE courses ADD COLUMN course_code VARCHAR(50) AFTER code',
    'SELECT "course_code exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add course_title
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'course_title');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE courses ADD COLUMN course_title VARCHAR(255) AFTER course_code',
    'SELECT "course_title exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add course_type
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'course_type');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE courses ADD COLUMN course_type ENUM(''HND'', ''Degree'', ''Vocational'', ''Short Course'', ''CPD'') AFTER course_title',
    'SELECT "course_type exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add department
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'department');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE courses ADD COLUMN department VARCHAR(100) AFTER course_type',
    'SELECT "department exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add duration_months
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'duration_months');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE courses ADD COLUMN duration_months INT AFTER duration',
    'SELECT "duration_months exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add awarding_body
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'awarding_body');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE courses ADD COLUMN awarding_body VARCHAR(255) AFTER description',
    'SELECT "awarding_body exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add full_time_available
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'full_time_available');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE courses ADD COLUMN full_time_available BOOLEAN DEFAULT TRUE AFTER awarding_body',
    'SELECT "full_time_available exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add part_time_available
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'part_time_available');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE courses ADD COLUMN part_time_available BOOLEAN DEFAULT FALSE AFTER full_time_available',
    'SELECT "part_time_available exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add course_status
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'course_status');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE courses ADD COLUMN course_status ENUM(''active'', ''inactive'', ''archived'') DEFAULT ''active''',
    'SELECT "course_status exists" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Copy data from existing columns to new columns
UPDATE courses SET 
    course_code = COALESCE(code, CONCAT('CRS-', LPAD(id, 3, '0'))),
    course_title = name,
    course_type = 'Degree',
    department = 'General Studies',
    duration_months = 12,
    awarding_body = 'SCL Institute',
    full_time_available = TRUE,
    part_time_available = TRUE,
    course_status = 'active'
WHERE course_code IS NULL;

-- Show updated structure
SELECT 'Courses table updated successfully' as status;
SELECT COUNT(*) as total_courses FROM courses;
