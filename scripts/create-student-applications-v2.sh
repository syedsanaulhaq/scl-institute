#!/bin/bash

echo "=== Creating Student Applications for SCL Students ==="
echo ""

# Student data structure:
# email:first_name:last_name:course_code:course_title:course_type:mode
STUDENTS=(
    "student.ali.001@scl.edu:Ali:Hassan:BTECH-CSE-001:B.Tech Computer Science Engineering:Degree:Full-time"
    "student.fatima.002@scl.edu:Fatima:Ahmed:BTECH-MEC-001:B.Tech Mechanical Engineering:Degree:Full-time"
    "student.zain.003@scl.edu:Zain:Mohammed:BTECH-ECE-001:B.Tech Electrical Engineering:Degree:Full-time"
    "student.noor.004@scl.edu:Noor:Ahmed:MTECH-DS-001:M.Tech Data Science:Degree:Full-time"
    "student.hamad.005@scl.edu:Hamad:Ali:MBA-BA-001:MBA Business Administration:Degree:Full-time"
    "student.rana.006@scl.edu:Rana:Hassan:BCOM-001:B.Com Commerce:Degree:Full-time"
    "student.adnan.007@scl.edu:Adnan:Fatima:HND-BUS-001:HND Business Administration:HND:Full-time"
    "student.lina.008@scl.edu:Lina:Mohammed:BCA-001:BCA Computer Applications:Degree:Full-time"
    "student.karim.009@scl.edu:Karim:Ahmed:MCA-001:MCA Computer Applications:Degree:Full-time"
    "student.sara.010@scl.edu:Sara:Khan:HND-IT-001:HND Information Technology:HND:Full-time"
)

for STUDENT_DATA in "${STUDENTS[@]}"; do
    IFS=':' read -r EMAIL FIRSTNAME LASTNAME COURSE_CODE COURSE_TITLE COURSE_TYPE MODE <<< "$STUDENT_DATA"
    
    echo "Processing: $FIRSTNAME $LASTNAME ($EMAIL)"
    
    # Check if application already exists
    EXISTING=$(docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -Nse "SELECT COUNT(*) FROM student_applications WHERE email = '$EMAIL'" 2>&1 | grep -v Warning)
    
    if [ "$EXISTING" -gt 0 ]; then
        echo "  ✓ Application already exists"
    else
        echo "  Creating student application..."
        
        # Generate application reference
        APP_REF="SCL-$(date +%Y%m)-$(printf '%05d' $RANDOM)"
        
        docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "
            INSERT INTO student_applications (
                application_reference,
                first_name,
                last_name,
                email,
                contact_number,
                date_of_birth,
                gender,
                nationality,
                country_of_residence,
                address_line1,
                town_city,
                postcode,
                course_code,
                course_title,
                course_type,
                mode_of_study,
                intake_start_date,
                entry_route,
                highest_qualification,
                institution_name,
                year_completed,
                english_proficiency,
                english_score,
                consent_gdpr,
                consent_data_sharing,
                declaration_truth,
                digital_signature,
                declaration_date,
                application_status,
                submitted_at,
                offer_accepted
            ) VALUES (
                '$APP_REF',
                '$FIRSTNAME',
                '$LASTNAME',
                '$EMAIL',
                '+971501234567',
                '2000-01-01',
                'M',
                'United Arab Emirates',
                'United Arab Emirates',
                'Dubai',
                'Dubai',
                '12345',
                '$COURSE_CODE',
                '$COURSE_TITLE',
                '$COURSE_TYPE',
                '$MODE',
                '2026-03-01',
                'Standard',
                'A-Level',
                'SCL Institute',
                '2024-01-01',
                'IELTS',
                6.5,
                1,
                1,
                1,
                '$FIRSTNAME $LASTNAME',
                '2026-01-15',
                'accepted',
                NOW(),
                1
            );
        " 2>&1 | grep -v "Warning"
        
        if [ $? -eq 0 ]; then
            echo "  ✓ Application created (Ref: $APP_REF)"
        else
            echo "  ✗ Failed to create application"
        fi
    fi
    echo ""
done

echo ""
echo "=== Verification - Student Applications Created ==="
docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -e "
    SELECT 
        application_reference,
        first_name,
        last_name,
        email,
        course_code,
        application_status
    FROM student_applications
    WHERE email LIKE '%scl.edu'
    ORDER BY email;
" 2>&1 | grep -v "Warning"

echo ""
echo "✅ All student applications have been created!"
