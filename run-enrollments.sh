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
    ENROL_ID=$(docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -Nse "SELECT id FROM mdl_enrol WHERE courseid = $COURSE_ID AND enrol = 'manual' LIMIT 1")
    
    if [ -z "$ENROL_ID" ]; then
        echo "  ⚠ No enrollment method for course $COURSE_ID, creating..."
        docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -e "
            INSERT INTO mdl_enrol (enrol, status, courseid, sortorder, name)
            VALUES ('manual', 0, $COURSE_ID, 0, NULL);
        " 2>/dev/null
        ENROL_ID=$(docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -Nse "SELECT id FROM mdl_enrol WHERE courseid = $COURSE_ID AND enrol = 'manual' LIMIT 1")
    fi
    
    # Check if already enrolled
    EXISTING=$(docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -Nse "
        SELECT COUNT(*) FROM mdl_user_enrolments ue 
        JOIN mdl_enrol e ON e.id = ue.enrolid 
        WHERE ue.userid = $USER_ID AND e.courseid = $COURSE_ID
    ")
    
    if [ "$EXISTING" -gt 0 ]; then
        echo "  ✓ $STUDENT_EMAIL already enrolled in $COURSE_NAME"
    else
        TIMESTAMP=$(date +%s)
        
        # Insert enrollment
        docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -e "
            INSERT INTO mdl_user_enrolments (status, enrolid, userid, timestart, timecreated, timemodified, modifierid)
            VALUES (0, $ENROL_ID, $USER_ID, $TIMESTAMP, $TIMESTAMP, $TIMESTAMP, 2);
        " 2>/dev/null
        
        # Assign student role
        docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -e "
            INSERT IGNORE INTO mdl_role_assignments (roleid, contextid, userid, timemodified, modifierid)
            SELECT 5, ctx.id, $USER_ID, $TIMESTAMP, 2
            FROM mdl_context ctx
            WHERE ctx.contextlevel = 50 AND ctx.instanceid = $COURSE_ID;
        " 2>/dev/null
        
        echo "  ✓ Enrolled $STUDENT_EMAIL in $COURSE_NAME"
    fi
}

echo "Creating students in Moodle..."
echo ""

# Create the 10 students in Moodle if they don't exist
STUDENTS=(
    "student.ali.001@scl.edu:Ali:Hassan:B.Tech Computer Science Engineering"
    "student.fatima.002@scl.edu:Fatima:Ahmed:B.Tech Mechanical Engineering"
    "student.zain.003@scl.edu:Zain:Mohammed:B.Tech Electrical Engineering"
    "student.noor.004@scl.edu:Noor:Ahmed:M.Tech Data Science"
    "student.hamad.005@scl.edu:Hamad:Ali:MBA Business Administration"
    "student.rana.006@scl.edu:Rana:Hassan:B.Com Commerce"
    "student.adnan.007@scl.edu:Adnan:Fatima:HND Business Administration"
    "student.lina.008@scl.edu:Lina:Mohammed:BCA Computer Applications"
    "student.karim.009@scl.edu:Karim:Ahmed:MCA Computer Applications"
    "student.sara.010@scl.edu:Sara:Khan:HND Information Technology"
)

for STUDENT_DATA in "${STUDENTS[@]}"; do
    IFS=':' read -r EMAIL FIRSTNAME LASTNAME COURSE_NAME <<< "$STUDENT_DATA"
    
    echo "Processing: $FIRSTNAME $LASTNAME ($EMAIL)"
    
    # Check if user exists
    USER_ID=$(docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -Nse "SELECT id FROM mdl_user WHERE email = '$EMAIL'")
    
    if [ -z "$USER_ID" ]; then
        echo "  Creating Moodle user..."
        TIMESTAMP=$(date +%s)
        USERNAME=$(echo $EMAIL | cut -d'@' -f1)
        
        docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -e "
            INSERT INTO mdl_user (auth, confirmed, username, password, firstname, lastname, email, mnethostid, timecreated, timemodified)
            VALUES ('sso', 1, '$USERNAME', 'not cached', '$FIRSTNAME', '$LASTNAME', '$EMAIL', 1, $TIMESTAMP, $TIMESTAMP);
        " 2>/dev/null
        
        USER_ID=$(docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -Nse "SELECT id FROM mdl_user WHERE email = '$EMAIL'")
        if [ ! -z "$USER_ID" ]; then
            echo "  ✓ Created user (ID: $USER_ID)"
        else
            echo "  ✗ Failed to create user"
            continue
        fi
    else
        echo "  ✓ User exists (ID: $USER_ID)"
    fi
    
    # Get course ID from course name
    COURSE_ID=$(docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -Nse "
        SELECT id FROM mdl_course WHERE fullname = '$COURSE_NAME' LIMIT 1
    ")
    
    if [ -z "$COURSE_ID" ]; then
        echo "  ✗ Course not found: $COURSE_NAME"
    else
        # Enroll in primary course
        enroll_student $USER_ID $COURSE_ID "$EMAIL" "$COURSE_NAME"
        
        # Also enroll in English Language Course
        ENGLISH_COURSE_ID=$(docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -Nse "
            SELECT id FROM mdl_course WHERE shortname = 'LANG-ENG-001' LIMIT 1
        ")
        if [ ! -z "$ENGLISH_COURSE_ID" ] && [ "$ENGLISH_COURSE_ID" != "$COURSE_ID" ]; then
            enroll_student $USER_ID $ENGLISH_COURSE_ID "$EMAIL" "English Language Course"
        fi
    fi
    
    echo ""
done

echo "=== Adding Additional Course Enrollments ==="
echo ""

# Enroll some engineering students in AI certification
echo "Enrolling B.Tech students in AI Certification..."

AI_COURSE_ID=$(docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -Nse "
    SELECT id FROM mdl_course WHERE shortname = 'AI-CERT-001' LIMIT 1
")

for EMAIL in "student.ali.001@scl.edu" "student.fatima.002@scl.edu" "student.zain.003@scl.edu"; do
    USER_ID=$(docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -Nse "SELECT id FROM mdl_user WHERE email = '$EMAIL'")
    if [ ! -z "$USER_ID" ] && [ ! -z "$AI_COURSE_ID" ]; then
        enroll_student $USER_ID $AI_COURSE_ID "$EMAIL" "AI & Machine Learning Certification"
    fi
done

echo ""
echo "=== Final Enrollment Summary ==="
docker exec scli-moodle-db-prod mariadb -u bn_moodle -pbitnami_moodle_password bitnami_moodle -e "
SELECT 
    u.firstname,
    u.lastname,
    u.email,
    GROUP_CONCAT(c.shortname SEPARATOR ', ') as enrolled_courses,
    COUNT(DISTINCT c.id) as course_count
FROM mdl_user u
LEFT JOIN mdl_user_enrolments ue ON ue.userid = u.id
LEFT JOIN mdl_enrol e ON e.id = ue.enrolid
LEFT JOIN mdl_course c ON c.id = e.courseid AND c.id > 1
WHERE u.email LIKE '%scl.edu'
GROUP BY u.id, u.firstname, u.lastname, u.email
ORDER BY u.email;
"

echo ""
echo "✅ All SCL students have been enrolled in courses!"
