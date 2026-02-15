#!/bin/bash

echo "=== Checking Moodle Courses ==="
docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "SELECT id, fullname, shortname, category FROM mdl_course LIMIT 20;"

echo ""
echo "=== Course Count ==="
docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "SELECT COUNT(*) as total_courses FROM mdl_course;"

echo ""
echo "=== Course Categories ==="
docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "SELECT id, name, coursecount FROM mdl_course_categories LIMIT 10;"
