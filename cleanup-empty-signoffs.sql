-- Clean up empty signoff records where name, signature, and sign_date are all empty/null
DELETE FROM accreditation_signoffs 
WHERE (name IS NULL OR name = '') 
  AND (signature IS NULL OR signature = '') 
  AND (sign_date IS NULL);
