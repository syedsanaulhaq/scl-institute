-- Update all user passwords to plain text for testing
UPDATE users SET password_hash = 'password123' WHERE id > 0;