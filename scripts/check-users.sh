#!/bin/bash
set -e
mysql_pass="RootSecurePass2024!"

docker exec scli-mysql-prod mysql -uroot --password="$mysql_pass" -e "USE scl_institute; SHOW TABLES LIKE 'users'; SELECT COUNT(*) AS users_count FROM users;"
