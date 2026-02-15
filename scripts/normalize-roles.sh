#!/bin/bash
set -e

docker exec scli-mysql-prod mysql -uroot -p'RootSecurePass2024!' scl_institute -e "UPDATE users SET role = LOWER(role) WHERE role IS NOT NULL;"
