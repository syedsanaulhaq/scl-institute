#!/bin/bash

echo "=== Enrolling SCL Students into Moodle Courses ==="

# First, ensure the students exist in Moodle by checking
# Student Ali (ID 8) -> B.Tech Computer Science Engineering (Course ID 2)

# Get the enrol instance ID for manual enrollments for course 2
ENROL_ID_2=$(docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -Nse "SELECT id FROM mdl_enrol WHERE courseid = 2 AND enrol = 'manual' LIMIT 1")
ENROL_ID_3=$(docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -Nse "SELECT id FROM mdl_enrol WHERE courseid = 3 AND enrol = 'manual' LIMIT 1")
ENROL_ID_4=$(docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -Nse "SELECT id FROM mdl_enrol WHERE courseid = 4 AND enrol = 'manual' LIMIT 1")

echo "Enrol IDs: Course 2=$ENROL_ID_2, Course 3=$ENROL_ID_3, Course 4=$ENROL_ID_4"

# Check if enrollment already exists
EXISTING=$(docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -Nse "SELECT COUNT(*) FROM mdl_user_enrolments ue JOIN mdl_enrol e ON e.id = ue.enrolid WHERE ue.userid = 8 AND e.courseid = 2")

if [ "$EXISTING" -gt 0 ]; then
    echo "Student Ali is already enrolled in B.Tech CSE"
else
    echo "Enrolling Student Ali (user ID 8) into B.Tech Computer Science Engineering (course ID 2)..."
    
    # Insert enrollment record
    TIMESTART=$(date +%s)
    docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "
        INSERT INTO mdl_user_enrolments (status, enrolid, userid, timestart, timecreated, timemodified, modifierid)
        VALUES (0, $ENROL_ID_2, 8, $TIMESTART, $TIMESTART, $TIMESTART, 2);
    "
    
    # Assign student role (role ID 5 = student)
    docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "
        INSERT IGNORE INTO mdl_role_assignments (roleid, contextid, userid, timemodified, modifierid)
        SELECT 5, ctx.id, 8, $TIMESTART, 2
        FROM mdl_context ctx
        WHERE ctx.contextlevel = 50 AND ctx.instanceid = 2
        LIMIT 1;
    "
    
    echo "✓ Student Ali enrolled in B.Tech Computer Science Engineering"
fi

echo ""
echo "=== Verifying Enrollment ==="
docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "
SELECT 
    u.username,
    u.email,
    c.fullname as course,
    c.shortname,
    FROM_UNIXTIME(ue.timecreated) as enrolled_date
FROM mdl_user_enrolments ue
JOIN mdl_enrol e ON e.id = ue.enrolid
JOIN mdl_course c ON c.id = e.courseid
JOIN mdl_user u ON u.id = ue.userid
WHERE u.email LIKE '%scl.edu';
"
