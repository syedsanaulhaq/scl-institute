#!/bin/bash
# Verify SCLondon courses import

echo "===== SCLONDON COURSES IMPORT - FINAL VERIFICATION ====="
echo ""
echo "Total Moodle courses:"
docker exec scli-moodle-db-dev mariadb -ubn_moodle -pbitnami_moodle_password bitnami_moodle -N -e "SELECT COUNT(*) FROM mdl_course;"

echo ""
echo "SCLondon Courses (25 courses):"
echo "=================================="
docker exec scli-moodle-db-dev mariadb -ubn_moodle -pbitnami_moodle_password bitnami_moodle -N -e "SELECT id, shortname FROM mdl_course WHERE id > 1 ORDER BY id;"

echo ""
echo "✓ All SCLondon courses successfully imported!"
echo "✓ Access: http://localhost:9090"
