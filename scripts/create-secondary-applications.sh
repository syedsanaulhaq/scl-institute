#!/bin/bash

echo "=== Creating Additional Applications for Secondary Course Enrollments ==="
echo ""

# Create application for Ali Hassan - English Language Course
create_app() {
    local EMAIL=$1
    local FIRSTNAME=$2
    local LASTNAME=$3
    local COURSE_CODE=$4
    local COURSE_TITLE=$5
    local COURSE_TYPE=$6
    
    # Check if application already exists
    EXISTING=$(docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -Nse "SELECT COUNT(*) FROM student_applications WHERE email = '$EMAIL' AND course_code = '$COURSE_CODE'" 2>&1 | grep -v Warning)
    
    if [ "$EXISTING" -gt 0 ]; then
        echo "  ✓ Application already exists for $COURSE_CODE"
    else
        APP_REF="SCL-$(date +%Y%m)-$(printf '%05d' $RANDOM)"
        
        docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "
            INSERT INTO student_applications (
                application_reference, first_name, last_name, email, contact_number,
                date_of_birth, gender, nationality, country_of_residence,
                address_line1, town_city, postcode, course_code, course_title, course_type,
                mode_of_study, intake_start_date, entry_route, highest_qualification,
                institution_name, year_completed, english_proficiency, english_score,
                consent_gdpr, consent_data_sharing, declaration_truth,
                digital_signature, declaration_date, application_status, submitted_at, offer_accepted
            ) VALUES (
                '$APP_REF', '$FIRSTNAME', '$LASTNAME', '$EMAIL', '+971501234567',
                '2000-01-01', 'M', 'United Arab Emirates', 'United Arab Emirates',
                'Dubai', 'Dubai', '12345', '$COURSE_CODE', '$COURSE_TITLE', '$COURSE_TYPE',
                'Full-time', '2026-03-01', 'Standard', 'A-Level',
                'SCL Institute', '2024-01-01', 'IELTS', 6.5,
                1, 1, 1, '$FIRSTNAME $LASTNAME', '2026-01-15', 'accepted', NOW(), 1
            );
        " 2>&1 | grep -v "Warning"
        echo "  ✓ Created application for $COURSE_TITLE ($APP_REF)"
    fi
}

# Ali Hassan - Additional courses
echo "Ali Hassan (student.ali.001@scl.edu):"
create_app "student.ali.001@scl.edu" "Ali" "Hassan" "LANG-ENG-001" "English Language Course" "Short Course"
create_app "student.ali.001@scl.edu" "Ali" "Hassan" "AI-CERT-001" "Artificial Intelligence & Machine Learning Certification" "CPD"

# Fatima Ahmed - Additional courses
echo ""
echo "Fatima Ahmed (student.fatima.002@scl.edu):"
create_app "student.fatima.002@scl.edu" "Fatima" "Ahmed" "LANG-ENG-001" "English Language Course" "Short Course"
create_app "student.fatima.002@scl.edu" "Fatima" "Ahmed" "AI-CERT-001" "Artificial Intelligence & Machine Learning Certification" "CPD"

# Zain Mohammed - Additional courses
echo ""
echo "Zain Mohammed (student.zain.003@scl.edu):"
create_app "student.zain.003@scl.edu" "Zain" "Mohammed" "LANG-ENG-001" "English Language Course" "Short Course"
create_app "student.zain.003@scl.edu" "Zain" "Mohammed" "AI-CERT-001" "Artificial Intelligence & Machine Learning Certification" "CPD"

# Noor Ahmed - Additional course
echo ""
echo "Noor Ahmed (student.noor.004@scl.edu):"
create_app "student.noor.004@scl.edu" "Noor" "Ahmed" "LANG-ENG-001" "English Language Course" "Short Course"

# Hamad Ali - Additional course
echo ""
echo "Hamad Ali (student.hamad.005@scl.edu):"
create_app "student.hamad.005@scl.edu" "Hamad" "Ali" "LANG-ENG-001" "English Language Course" "Short Course"

# Rana Hassan - Additional course
echo ""
echo "Rana Hassan (student.rana.006@scl.edu):"
create_app "student.rana.006@scl.edu" "Rana" "Hassan" "LANG-ENG-001" "English Language Course" "Short Course"

# Adnan Fatima - Additional course
echo ""
echo "Adnan Fatima (student.adnan.007@scl.edu):"
create_app "student.adnan.007@scl.edu" "Adnan" "Fatima" "LANG-ENG-001" "English Language Course" "Short Course"

# Lina Mohammed - Additional course
echo ""
echo "Lina Mohammed (student.lina.008@scl.edu):"
create_app "student.lina.008@scl.edu" "Lina" "Mohammed" "LANG-ENG-001" "English Language Course" "Short Course"

# Karim Ahmed - Additional course
echo ""
echo "Karim Ahmed (student.karim.009@scl.edu):"
create_app "student.karim.009@scl.edu" "Karim" "Ahmed" "LANG-ENG-001" "English Language Course" "Short Course"

# Sara Khan - Additional course
echo ""
echo "Sara Khan (student.sara.010@scl.edu):"
create_app "student.sara.010@scl.edu" "Sara" "Khan" "LANG-ENG-001" "English Language Course" "Short Course"

echo ""
echo "=== Verification - Applications per Student ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "
    SELECT 
        email,
        COUNT(*) as application_count,
        GROUP_CONCAT(course_code SEPARATOR ', ') as courses
    FROM student_applications
    WHERE email LIKE '%scl.edu'
    GROUP BY email
    ORDER BY email;
" 2>&1 | grep -v "Warning"

echo ""
echo "✅ Additional course applications have been created!"
