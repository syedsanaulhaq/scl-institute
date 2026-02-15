#!/bin/bash

echo "=== Fixing student_applications Table Constraints ==="
echo ""

echo "Step 1: Removing UNIQUE constraint from email column..."
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "
ALTER TABLE student_applications DROP INDEX email;
" 2>&1 | grep -v "Warning"

echo "✓ Email unique constraint removed"
echo ""

echo "Step 2: Adding composite unique key on (email, course_code)..."
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "
ALTER TABLE student_applications 
ADD UNIQUE KEY unique_email_course (email, course_code);
" 2>&1 | grep -v "Warning"

echo "✓ Composite unique key added"
echo ""

echo "=== Verification - Table Constraints ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "
SHOW CREATE TABLE student_applications\G
" 2>&1 | grep -E "UNIQUE|KEY" | head -10

echo ""
echo "✅ Table constraints updated - students can now have multiple applications!"
