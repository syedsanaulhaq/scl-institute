#!/bin/bash
# Backfill fee records for all accepted applications

echo "Backfilling student fees for accepted applications..."

# Get accepted applications from DB
APPS=$(docker exec scli-mysql-prod mysql -u scl_user -pSclSecurePass2024! scl_institute --skip-column-names -e \
  "SELECT id, CONCAT(first_name,' ',last_name), email, course_code, COALESCE(intake_start_date,'2026-09-01') FROM student_applications WHERE application_status IN ('accepted','conditional_accept')")

echo "$APPS" | while IFS=$'\t' read -r app_id student_name student_email course_code intake_date; do
  echo "Creating fee for app $app_id ($student_name) - $course_code - $intake_date"
  curl -s -X POST http://localhost:4000/api/induction-driven/student-fees/create-from-induction \
    -H "Content-Type: application/json" \
    -d "{\"application_id\": $app_id, \"course_code\": \"$course_code\", \"student_name\": \"$student_name\", \"student_email\": \"$student_email\", \"intake_start_date\": \"$intake_date\"}" \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print('  Result:', d.get('created','exists'), 'fee:', d.get('data',{}).get('total_fee_gbp','?'))"
done

echo "Done!"
