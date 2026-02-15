#!/bin/bash

echo "=== Checking Moodle Users ==="
docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "SELECT id, username, firstname, lastname, email FROM mdl_user WHERE id > 2 LIMIT 20;"

echo ""
echo "=== Checking Course Enrollments ==="
docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "SELECT COUNT(*) as total_enrollments FROM mdl_user_enrolments;"

echo ""
echo "=== Enrolled Students by Course ==="
docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "
SELECT 
    c.id as course_id,
    c.fullname,
    COUNT(ue.id) as enrolled_students
FROM mdl_course c
LEFT JOIN mdl_enrol e ON e.courseid = c.id
LEFT JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
WHERE c.id > 1
GROUP BY c.id, c.fullname
ORDER BY c.id;
"

echo ""
echo "=== Sample Enrollments (First 10) ==="
docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "
SELECT 
    u.username,
    u.email,
    c.shortname as course,
    FROM_UNIXTIME(ue.timecreated) as enrolled_date
FROM mdl_user_enrolments ue
JOIN mdl_enrol e ON e.id = ue.enrolid
JOIN mdl_course c ON c.id = e.courseid
JOIN mdl_user u ON u.id = ue.userid
LIMIT 10;
"
