SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='scl_institute' AND TABLE_NAME='student_applications' AND COLUMN_NAME='statement_of_purpose_document');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE student_applications ADD COLUMN statement_of_purpose_document VARCHAR(500) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='scl_institute' AND TABLE_NAME='student_applications' AND COLUMN_NAME='department');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE student_applications ADD COLUMN department VARCHAR(255) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='scl_institute' AND TABLE_NAME='student_applications' AND COLUMN_NAME='awarding_body');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE student_applications ADD COLUMN awarding_body VARCHAR(255) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='scl_institute' AND TABLE_NAME='student_applications' AND COLUMN_NAME='duration_months');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE student_applications ADD COLUMN duration_months INT DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT 'Columns added' as status;
