#!/bin/bash

echo "=== Users Table Structure ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "DESCRIBE users;"

echo ""
echo "=== Checking Admin User ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "SELECT * FROM users WHERE email='admin@sclsandbox.xyz';"
