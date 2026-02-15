#!/bin/bash

echo "=== SCL Institute Student Applications ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "SELECT id, first_name, last_name, email, course_code, application_status FROM student_applications WHERE application_status = 'accepted' LIMIT 20;"

echo ""
echo "=== Total Accepted Students in SCL ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "SELECT COUNT(*) as total_accepted FROM student_applications WHERE application_status = 'accepted';"

echo ""
echo "=== Accepted Students by Course ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "
SELECT 
    course_code,
    COUNT(*) as student_count
FROM student_applications 
WHERE application_status = 'accepted'
GROUP BY course_code
ORDER BY student_count DESC;
"

echo ""
echo "=== All Application Statuses ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "
SELECT 
    application_status,
    COUNT(*) as count
FROM student_applications 
GROUP BY application_status;
"
