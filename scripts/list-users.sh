#!/bin/bash
set -e

docker exec scli-mysql-prod mysql -uroot -p'RootSecurePass2024!' scl_institute -e "SELECT id,email,role FROM users LIMIT 50"
