#!/bin/bash

echo "=== Setting up Manual Enrollment for Courses ==="

# Create manual enrollment instances for all courses if they don't exist
for COURSEID in 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
    COUNT=$(docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -Nse "SELECT COUNT(*) FROM mdl_enrol WHERE courseid = $COURSEID AND enrol = 'manual'")
    
    if [ "$COUNT" -eq 0 ]; then
        echo "Creating manual enrollment for course ID $COURSEID..."
        TIMESTAMP=$(date +%s)
        docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "
            INSERT INTO mdl_enrol (enrol, status, courseid, sortorder, timecreated, timemodified)
            VALUES ('manual', 0, $COURSEID, 0, $TIMESTAMP, $TIMESTAMP);
        "
    fi
done

echo ""
echo "=== Enrolling Student Ali into B.Tech Computer Science Engineering ==="

# Get the enrol instance ID
ENROL_ID=$(docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -Nse "SELECT id FROM mdl_enrol WHERE courseid = 2 AND enrol = 'manual' LIMIT 1")
echo "Enrollment method ID for course 2: $ENROL_ID"

# Check if already enrolled
EXISTING=$(docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -Nse "
    SELECT COUNT(*) FROM mdl_user_enrolments ue 
    JOIN mdl_enrol e ON e.id = ue.enrolid 
    WHERE ue.userid = 8 AND e.courseid = 2
")

if [ "$EXISTING" -gt 0 ]; then
    echo "Student Ali is already enrolled"
else
    echo "Enrolling student Ali (user ID 8)..."
    TIMESTAMP=$(date +%s)
    
    # Insert enrollment
    docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "
        INSERT INTO mdl_user_enrolments (status, enrolid, userid, timestart, timecreated, timemodified, modifierid)
        VALUES (0, $ENROL_ID, 8, $TIMESTAMP, $TIMESTAMP, $TIMESTAMP, 2);
    "
    
    # Assign student role in course context
    docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "
        INSERT IGNORE INTO mdl_role_assignments (roleid, contextid, userid, timemodified, modifierid)
        SELECT 5, ctx.id, 8, $TIMESTAMP, 2
        FROM mdl_context ctx
        WHERE ctx.contextlevel = 50 AND ctx.instanceid = 2;
    "
    
    echo "✓ Enrollment complete"
fi

echo ""
echo "=== Current Enrollments for SCL Students ==="
docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "
SELECT 
    u.email,
    c.shortname as course_code,
    c.fullname as course_name
FROM mdl_user_enrolments ue
JOIN mdl_enrol e ON e.id = ue.enrolid
JOIN mdl_course c ON c.id = e.courseid
JOIN mdl_user u ON u.id = ue.userid
WHERE u.email LIKE '%scl.edu'
ORDER BY u.email, c.id;
"
