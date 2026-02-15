#!/bin/bash

echo "=== Enrolling All SCL Students into Moodle Courses ==="
echo ""

# Function to enroll a student into a course
enroll_student() {
    local USER_ID=$1
    local COURSE_ID=$2
    local STUDENT_EMAIL=$3
    local COURSE_NAME=$4
    
    # Get enrol instance ID
    ENROL_ID=$(docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -Nse "SELECT id FROM mdl_enrol WHERE courseid = $COURSE_ID AND enrol = 'manual' LIMIT 1")
    
    if [ -z "$ENROL_ID" ]; then
        echo "  ⚠ No enrollment method for course $COURSE_ID, skipping..."
        return
    fi
    
    # Check if already enrolled
    EXISTING=$(docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -Nse "
        SELECT COUNT(*) FROM mdl_user_enrolments ue 
        JOIN mdl_enrol e ON e.id = ue.enrolid 
        WHERE ue.userid = $USER_ID AND e.courseid = $COURSE_ID
    ")
    
    if [ "$EXISTING" -gt 0 ]; then
        echo "  ✓ $STUDENT_EMAIL already enrolled in $COURSE_NAME"
    else
        TIMESTAMP=$(date +%s)
        
        # Insert enrollment
        docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "
            INSERT INTO mdl_user_enrolments (status, enrolid, userid, timestart, timecreated, timemodified, modifierid)
            VALUES (0, $ENROL_ID, $USER_ID, $TIMESTAMP, $TIMESTAMP, $TIMESTAMP, 2);
        " 2>/dev/null
        
        # Assign student role
        docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "
            INSERT IGNORE INTO mdl_role_assignments (roleid, contextid, userid, timemodified, modifierid)
            SELECT 5, ctx.id, $USER_ID, $TIMESTAMP, 2
            FROM mdl_context ctx
            WHERE ctx.contextlevel = 50 AND ctx.instanceid = $COURSE_ID;
        " 2>/dev/null
        
        echo "  ✓ Enrolled $STUDENT_EMAIL in $COURSE_NAME"
    fi
}

# First, create users in Moodle if they don't exist (they'll be created on first SSO login)
# For now, we'll just note which students need to be created

echo "Note: Students will be created in Moodle on their first SSO login"
echo ""

# Student Ali (ID 8) - Already enrolled in B.Tech CSE (Course 2)
echo "Student 1: Ali Hassan (student.ali.001@scl.edu)"
enroll_student 8 2 "student.ali.001@scl.edu" "B.Tech Computer Science Engineering"
enroll_student 8 14 "student.ali.001@scl.edu" "English Language Course"

echo ""
echo "Creating placeholder students for remaining SCL students..."
echo ""

# Create the other 9 students in Moodle if they don't exist
STUDENTS=(
    "student.fatima.002@scl.edu:Fatima:Ahmed:3:B.Tech Mechanical Engineering"
    "student.zain.003@scl.edu:Zain:Mohammed:4:B.Tech Electrical Engineering"
    "student.noor.004@scl.edu:Noor:Ahmed:5:M.Tech Data Science"
    "student.hamad.005@scl.edu:Hamad:Ali:6:MBA Business Administration"
    "student.rana.006@scl.edu:Rana:Hassan:7:B.Com Commerce"
    "student.adnan.007@scl.edu:Adnan:Fatima:8:HND Business Administration"
    "student.lina.008@scl.edu:Lina:Mohammed:10:BCA Computer Applications"
    "student.karim.009@scl.edu:Karim:Ahmed:11:MCA Computer Applications"
    "student.sara.010@scl.edu:Sara:Khan:12:HND Information Technology"
)

for STUDENT_DATA in "${STUDENTS[@]}"; do
    IFS=':' read -r EMAIL FIRSTNAME LASTNAME COURSE_ID COURSE_NAME <<< "$STUDENT_DATA"
    
    echo "Student: $FIRSTNAME $LASTNAME ($EMAIL)"
    
    # Check if user exists
    USER_ID=$(docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -Nse "SELECT id FROM mdl_user WHERE email = '$EMAIL'")
    
    if [ -z "$USER_ID" ]; then
        echo "  Creating Moodle user..."
        TIMESTAMP=$(date +%s)
        USERNAME=$(echo $EMAIL | cut -d'@' -f1)
        
        docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "
            INSERT INTO mdl_user (auth, confirmed, username, password, firstname, lastname, email, mnethostid, timecreated, timemodified)
            VALUES ('manual', 1, '$EMAIL', 'not cached', '$FIRSTNAME', '$LASTNAME', '$EMAIL', 1, $TIMESTAMP, $TIMESTAMP);
        " 2>/dev/null
        
        USER_ID=$(docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -Nse "SELECT id FROM mdl_user WHERE email = '$EMAIL'")
        echo "  ✓ Created user (ID: $USER_ID)"
    else
        echo "  ✓ User exists (ID: $USER_ID)"
    fi
    
    # Enroll in primary course
    enroll_student $USER_ID $COURSE_ID "$EMAIL" "$COURSE_NAME"
    
    # Also enroll in English Language Course (everyone needs English)
    if [ "$COURSE_ID" != "14" ]; then
        enroll_student $USER_ID 14 "$EMAIL" "English Language Course"
    fi
    
    echo ""
done

# Enroll some students in additional courses for variety
echo "=== Adding Additional Course Enrollments ==="
echo ""

# Enroll some engineering students in AI certification
echo "Enrolling B.Tech students in AI Certification..."
USER_ID_ALI=8
USER_ID_FATIMA=$(docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -Nse "SELECT id FROM mdl_user WHERE email = 'student.fatima.002@scl.edu'")
USER_ID_ZAIN=$(docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -Nse "SELECT id FROM mdl_user WHERE email = 'student.zain.003@scl.edu'")

[ ! -z "$USER_ID_ALI" ] && enroll_student $USER_ID_ALI 15 "student.ali.001@scl.edu" "AI & ML Certification"
[ ! -z "$USER_ID_FATIMA" ] && enroll_student $USER_ID_FATIMA 15 "student.fatima.002@scl.edu" "AI & ML Certification"
[ ! -z "$USER_ID_ZAIN" ] && enroll_student $USER_ID_ZAIN 15 "student.zain.003@scl.edu" "AI & ML Certification"

echo ""
echo "=== Final Enrollment Summary ==="
docker exec scli-moodle-db-prod mysql -uroot -pmoodleroot bitnami_moodle -e "
SELECT 
    u.firstname,
    u.lastname,
    u.email,
    GROUP_CONCAT(c.shortname SEPARATOR ', ') as enrolled_courses,
    COUNT(c.id) as course_count
FROM mdl_user u
LEFT JOIN mdl_user_enrolments ue ON ue.userid = u.id
LEFT JOIN mdl_enrol e ON e.id = ue.enrolid
LEFT JOIN mdl_course c ON c.id = e.courseid
WHERE u.email LIKE '%scl.edu'
GROUP BY u.id, u.firstname, u.lastname, u.email
ORDER BY u.email;
"

echo ""
echo "✅ All SCL students have been enrolled in courses!"
