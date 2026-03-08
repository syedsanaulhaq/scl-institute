-- Add redirect_url column to sso_tokens table to support course-specific redirects
ALTER TABLE sso_tokens 
ADD COLUMN redirect_url VARCHAR(500) DEFAULT NULL;
