#!/bin/bash

echo "=== Student Users in SCL (from users table) ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "SELECT id, email, first_name, last_name, role FROM users WHERE role = 'student' LIMIT 20;"

echo ""
echo "=== Checking if there's a student-course mapping table ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "SHOW TABLES LIKE '%enroll%';"
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "SHOW TABLES LIKE '%course%';"
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "SHOW TABLES LIKE '%student%';"

echo ""
echo "=== Checking courses table structure ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "DESCRIBE courses;"
