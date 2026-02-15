#!/bin/bash

echo "=== Creating Student Applications for SCL Students ==="
echo ""

# Student data structure:
# email:first_name:last_name:course_code:course_title
STUDENTS=(
    "student.ali.001@scl.edu:Ali:Hassan:BTECH-CSE-001:B.Tech Computer Science Engineering"
    "student.fatima.002@scl.edu:Fatima:Ahmed:BTECH-MEC-001:B.Tech Mechanical Engineering"
    "student.zain.003@scl.edu:Zain:Mohammed:BTECH-ECE-001:B.Tech Electrical Engineering"
    "student.noor.004@scl.edu:Noor:Ahmed:MTECH-DS-001:M.Tech Data Science"
    "student.hamad.005@scl.edu:Hamad:Ali:MBA-BA-001:MBA Business Administration"
    "student.rana.006@scl.edu:Rana:Hassan:BCOM-001:B.Com Commerce"
    "student.adnan.007@scl.edu:Adnan:Fatima:HND-BUS-001:HND Business Administration"
    "student.lina.008@scl.edu:Lina:Mohammed:BCA-001:BCA Computer Applications"
    "student.karim.009@scl.edu:Karim:Ahmed:MCA-001:MCA Computer Applications"
    "student.sara.010@scl.edu:Sara:Khan:HND-IT-001:HND Information Technology"
)

for STUDENT_DATA in "${STUDENTS[@]}"; do
    IFS=':' read -r EMAIL FIRSTNAME LASTNAME COURSE_CODE COURSE_TITLE <<< "$STUDENT_DATA"
    
    echo "Processing: $FIRSTNAME $LASTNAME ($EMAIL)"
    
    # Check if application already exists
    EXISTING=$(docker exec scli-mysql-prod mysql -uscl_user -pSclSecurePass2024! scl_institute -Nse "SELECT COUNT(*) FROM student_applications WHERE email = '$EMAIL'")
    
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
                phone,
                date_of_birth,
                gender,
                nationality,
                country_of_residence,
                address_line1,
                city,
                postal_code,
                course_code,
                course_title,
                study_mode,
                start_date,
                previous_qualification,
                institution_name,
                year_of_completion,
                english_proficiency,
                application_status,
                submitted_date,
                reviewed_date,
                reviewer_notes
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
                'full_time',
                '2026-03-01',
                'High School Diploma',
                'SCL Institute',
                '2024',
                'IELTS 6.5',
                'accepted',
                NOW(),
                NOW(),
                'Active student - enrolled in programme'
            );
        " 2>&1 | grep -v "Warning"
        
        echo "  ✓ Application created (Ref: $APP_REF)"
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
