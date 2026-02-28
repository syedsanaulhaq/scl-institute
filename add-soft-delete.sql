-- ================================================
-- Add Soft Delete Functionality to Applications
-- ================================================

-- Add soft delete columns to student_applications table
ALTER TABLE student_applications ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE AFTER updated_at;
ALTER TABLE student_applications ADD COLUMN deleted_at TIMESTAMP NULL AFTER is_deleted;

-- Add soft delete columns to application_documents table
ALTER TABLE application_documents ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE AFTER verification_notes;
ALTER TABLE application_documents ADD COLUMN deleted_at TIMESTAMP NULL AFTER is_deleted;

-- Add soft delete columns to application_reviews table
ALTER TABLE application_reviews ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE AFTER reviewed_at;
ALTER TABLE application_reviews ADD COLUMN deleted_at TIMESTAMP NULL AFTER is_deleted;

-- Add soft delete columns to admissions_decisions table
ALTER TABLE admissions_decisions ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE AFTER updated_at;
ALTER TABLE admissions_decisions ADD COLUMN deleted_at TIMESTAMP NULL AFTER is_deleted;

-- Add composite indexes for soft delete filtering with common queries
CREATE INDEX idx_is_deleted ON student_applications(is_deleted);
CREATE INDEX idx_deleted_at ON student_applications(deleted_at);
CREATE INDEX idx_is_deleted_docs ON application_documents(is_deleted);
CREATE INDEX idx_is_deleted_reviews ON application_reviews(is_deleted);
CREATE INDEX idx_is_deleted_decisions ON admissions_decisions(is_deleted);

-- Verify changes
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'student_applications' 
AND COLUMN_NAME IN ('is_deleted', 'deleted_at')
ORDER BY ORDINAL_POSITION;

