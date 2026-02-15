#!/bin/bash

echo "=== Checking Admin User Role ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "SELECT id, username, email, role FROM users WHERE email='admin@sclsandbox.xyz';"

echo ""
echo "=== All Admin/Super Admin Users ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "SELECT id, username, email, role FROM users WHERE role LIKE '%admin%' OR role LIKE '%Admin%';"
