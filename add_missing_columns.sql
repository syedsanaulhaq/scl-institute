-- Add missing columns to student_applications table
-- These are post-acceptance and compliance columns

ALTER TABLE student_applications
ADD COLUMN offer_accepted BOOLEAN DEFAULT FALSE AFTER submitted_at,
ADD COLUMN student_contract VARCHAR(500) AFTER offer_accepted,
ADD COLUMN brp_card VARCHAR(500) AFTER student_contract,
ADD COLUMN residency_proof VARCHAR(500) AFTER brp_card,
ADD COLUMN right_to_study_verified ENUM('Pending', 'Yes', 'No') DEFAULT 'Pending' AFTER residency_proof,
ADD COLUMN compliance_confirmed_at TIMESTAMP NULL AFTER right_to_study_verified,
ADD COLUMN documents_verified ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending' AFTER compliance_confirmed_at;

-- Show updated structure
DESCRIBE student_applications;

-- Verify all applications still there
SELECT COUNT(*) as total_applications FROM student_applications;
