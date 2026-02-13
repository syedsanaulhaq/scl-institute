-- Fix notifications table column mismatches

-- Check if we need to rename columns
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'user_email');

-- Rename user_email to email if it exists
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE notifications CHANGE COLUMN user_email email VARCHAR(255) NOT NULL',
    'SELECT "Column user_email already renamed or does not exist" as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if read_status exists
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'read_status');

-- Rename read_status to is_read if it exists
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE notifications CHANGE COLUMN read_status is_read BOOLEAN DEFAULT FALSE',
    'SELECT "Column read_status already renamed or does not exist" as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add missing columns that backend expects (check each individually)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'user_id');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE notifications ADD COLUMN user_id INT AFTER id',
    'SELECT "user_id exists" as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'subject');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE notifications ADD COLUMN subject VARCHAR(255) AFTER type',
    'SELECT "subject exists" as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'body');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE notifications ADD COLUMN body TEXT AFTER message',
    'SELECT "body exists" as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'notification_data');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE notifications ADD COLUMN notification_data JSON AFTER body',
    'SELECT "notification_data exists" as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'read_at');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP NULL AFTER is_read',
    'SELECT "read_at exists" as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'updated_at');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE notifications ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at',
    'SELECT "updated_at exists" as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key if not exists
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = 'scl_institute' AND TABLE_NAME = 'notifications' AND CONSTRAINT_TYPE = 'FOREIGN KEY' AND CONSTRAINT_NAME = 'notifications_ibfk_1');

SET @sql = IF(@fk_exists = 0, 
    'ALTER TABLE notifications ADD CONSTRAINT notifications_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists" as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Show updated structure
DESCRIBE notifications;

SELECT 'Notifications table fixed successfully' as status;
