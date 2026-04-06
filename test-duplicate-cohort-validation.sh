#!/bin/bash

# =====================================================
# TEST: Duplicate Cohort Intake Validation
# =====================================================

API_URL="http://localhost:4000/api"
COURSE_CODE="DEG-001-Y1-S1-C1"
COURSE_TITLE="Degree Y1 Sem 1 Course 1"

echo "=========================================="
echo "Testing Duplicate Cohort Validation"
echo "=========================================="
echo ""

# Test 1: Create first cohort (should succeed)
echo "[TEST 1] Creating first cohort with intake '2026-Sep'..."
RESPONSE1=$(curl -s -X POST "$API_URL/students/course-registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "course_title": "'"$COURSE_TITLE"'",
    "course_code": "'"$COURSE_CODE"'",
    "cohort_label": "2026-Sep",
    "course_type": "Degree",
    "awarding_body_accreditation": "Pearson",
    "regulation_level": "RQF Level 6",
    "mode_of_delivery": "Full-time",
    "programme_type_name": "Degree",
    "program_name": "Business",
    "academic_year": "Year 1",
    "semester_name": "Semester 1",
    "application_status": "submitted",
    "sync_to_moodle": false
  }')

# Check if successful (status 201)
SUCCESS1=$(echo "$RESPONSE1" | grep -o '"success":true')
REG_ID1=$(echo "$RESPONSE1" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

if [ -n "$SUCCESS1" ]; then
  echo "✅ PASSED: First cohort created successfully (ID: $REG_ID1)"
  echo "   Response: $RESPONSE1" | head -c 200
  echo ""
else
  echo "❌ FAILED: First cohort creation failed"
  echo "   Response: $RESPONSE1"
  echo ""
fi

echo ""
echo "[TEST 2] Attempting to create DUPLICATE cohort with same intake '2026-Sep'..."
RESPONSE2=$(curl -s -X POST "$API_URL/students/course-registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "course_title": "'"$COURSE_TITLE"'",
    "course_code": "'"$COURSE_CODE"'",
    "cohort_label": "2026-Sep",
    "course_type": "Degree",
    "awarding_body_accreditation": "City & Guilds",
    "regulation_level": "RQF Level 6",
    "mode_of_delivery": "Part-time",
    "programme_type_name": "Degree",
    "program_name": "Business",
    "academic_year": "Year 1",
    "semester_name": "Semester 1",
    "application_status": "submitted",
    "sync_to_moodle": false
  }')

# Check if failed with HTTP 409 (Conflict)
CONFLICT=$(echo "$RESPONSE2" | grep -o '"success":false')
DUPLICATE_MSG=$(echo "$RESPONSE2" | grep -o 'already exists for this course')
HTTP_STATUS=$(echo "$RESPONSE2" | grep -o '409')

if [ -n "$CONFLICT" ] && [ -n "$DUPLICATE_MSG" ]; then
  echo "✅ PASSED: Duplicate cohort correctly rejected with error message"
  echo "   Message from response includes: 'already exists for this course'"
  echo "   Full response: $RESPONSE2" | head -c 300
  echo ""
else
  echo "❌ FAILED: Duplicate cohort was not rejected"
  echo "   Response: $RESPONSE2"
  echo ""
fi

echo ""
echo "[TEST 3] Creating different cohort with unique intake '2027-Mar' (should succeed)..."
RESPONSE3=$(curl -s -X POST "$API_URL/students/course-registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "course_title": "'"$COURSE_TITLE"'",
    "course_code": "'"$COURSE_CODE"'",
    "cohort_label": "2027-Mar",
    "course_type": "Degree",
    "awarding_body_accreditation": "Pearson",
    "regulation_level": "RQF Level 6",
    "mode_of_delivery": "Full-time",
    "programme_type_name": "Degree",
    "program_name": "Business",
    "academic_year": "Year 1",
    "semester_name": "Semester 1",
    "application_status": "submitted",
    "sync_to_moodle": false
  }')

SUCCESS3=$(echo "$RESPONSE3" | grep -o '"success":true')
REG_ID3=$(echo "$RESPONSE3" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

if [ -n "$SUCCESS3" ]; then
  echo "✅ PASSED: Different intake '2027-Mar' created successfully (ID: $REG_ID3)"
  echo "   Response: $RESPONSE3" | head -c 200
  echo ""
else
  echo "❌ FAILED: Different intake creation failed"
  echo "   Response: $RESPONSE3"
  echo ""
fi

echo ""
echo "[TEST 4] Verify duplicate cohorts don't exist in database..."
DUPLICATE_COUNT=$(mysql -h localhost -u root -proot moodle -se "
  SELECT COUNT(*) FROM course_registrations 
  WHERE course_code = '$COURSE_CODE' 
  AND cohort_label = '2026-Sep' 
  AND application_status NOT IN ('rejected');" 2>/dev/null)

if [ "$DUPLICATE_COUNT" = "1" ]; then
  echo "✅ PASSED: Exactly 1 cohort with intake '2026-Sep' exists in database"
  echo "   Count: $DUPLICATE_COUNT"
  echo ""
else
  echo "❌ FAILED: Unexpected count of duplicate cohorts"
  echo "   Count: $DUPLICATE_COUNT (expected: 1)"
  echo ""
fi

echo ""
echo "[TEST 5] Verify multiple unique intakes coexist..."
TOTAL_COHORTS=$(mysql -h localhost -u root -proot moodle -se "
  SELECT COUNT(*) FROM course_registrations 
  WHERE course_code = '$COURSE_CODE' 
  AND application_status NOT IN ('rejected');" 2>/dev/null)

if [ "$TOTAL_COHORTS" -ge "2" ]; then
  echo "✅ PASSED: Multiple cohorts with different intakes coexist"
  echo "   Total non-rejected cohorts for $COURSE_CODE: $TOTAL_COHORTS"
  mysql -h localhost -u root -proot moodle -se "
    SELECT id, cohort_label, application_status 
    FROM course_registrations 
    WHERE course_code = '$COURSE_CODE' 
    ORDER BY id;" 2>/dev/null
  echo ""
else
  echo "⚠️  WARNING: Expected 2+ cohorts, found: $TOTAL_COHORTS"
  echo ""
fi

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="
