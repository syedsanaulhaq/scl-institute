#!/bin/bash

echo "=== SCL Institute Students ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "SELECT id, first_name, last_name, email, course_code, enrollment_status FROM students WHERE enrollment_status = 'enrolled' LIMIT 20;"

echo ""
echo "=== Total Enrolled Students in SCL ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "SELECT COUNT(*) as total_students FROM students WHERE enrollment_status = 'enrolled';"

echo ""
echo "=== Students by Course ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "
SELECT 
    course_code,
    COUNT(*) as student_count
FROM students 
WHERE enrollment_status = 'enrolled'
GROUP BY course_code
ORDER BY student_count DESC;
"
