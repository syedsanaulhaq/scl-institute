#!/bin/bash

echo "=== SCL Students in Moodle ==="
docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "SELECT id, username, email, firstname, lastname FROM mdl_user WHERE email LIKE '%scl.edu' ORDER BY id;"

echo ""
echo "=== All non-admin users in Moodle ==="
docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "SELECT id, username, email, firstname, lastname FROM mdl_user WHERE id > 2 ORDER BY id;"
