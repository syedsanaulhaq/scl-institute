# =====================================================
# TEST: Duplicate Cohort Intake Validation
# =====================================================

$API_URL = "http://localhost:4000/api"
$COURSE_CODE = "DEG-001-Y1-S1-C1"
$COURSE_TITLE = "Degree Y1 Sem 1 Course 1"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing Duplicate Cohort Validation" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Create first cohort (should succeed)
Write-Host "[TEST 1] Creating first cohort with intake '2026-Sep'..." -ForegroundColor Yellow
$Payload1 = @{
    course_title = $COURSE_TITLE
    course_code = $COURSE_CODE
    cohort_label = "2026-Sep"
    course_type = "Degree"
    awarding_body_accreditation = "Pearson"
    regulation_level = "RQF Level 6"
    mode_of_delivery = "Full-time"
    programme_type_name = "Degree"
    program_name = "Business"
    academic_year = "Year 1"
    semester_name = "Semester 1"
    application_status = "submitted"
    sync_to_moodle = $false
} | ConvertTo-Json

try {
    $Response1 = Invoke-RestMethod -Uri "$API_URL/students/course-registrations" `
        -Method POST `
        -ContentType "application/json" `
        -Body $Payload1 -ErrorAction SilentlyContinue

    if ($Response1.success -eq $true) {
        $RegID1 = $Response1.data.registration.id
        Write-Host "✅ PASSED: First cohort created successfully (ID: $RegID1)" -ForegroundColor Green
        Write-Host "   Response: $($Response1 | ConvertTo-Json -Depth 2 | Select-Object -First 5)" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "❌ FAILED: First cohort creation failed" -ForegroundColor Red
        Write-Host "   Response: $($Response1 | ConvertTo-Json)" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host ""
Write-Host "[TEST 2] Attempting to create DUPLICATE cohort with same intake '2026-Sep'..." -ForegroundColor Yellow

$Payload2 = @{
    course_title = $COURSE_TITLE
    course_code = $COURSE_CODE
    cohort_label = "2026-Sep"
    course_type = "Degree"
    awarding_body_accreditation = "City & Guilds"
    regulation_level = "RQF Level 6"
    mode_of_delivery = "Part-time"
    programme_type_name = "Degree"
    program_name = "Business"
    academic_year = "Year 1"
    semester_name = "Semester 1"
    application_status = "submitted"
    sync_to_moodle = $false
} | ConvertTo-Json

try {
    $Response2 = Invoke-RestMethod -Uri "$API_URL/students/course-registrations" `
        -Method POST `
        -ContentType "application/json" `
        -Body $Payload2 -ErrorAction SilentlyContinue

    if ($Response2.success -eq $false -and $Response2.message -like "*already exists for this course*") {
        Write-Host "✅ PASSED: Duplicate cohort correctly rejected with error message" -ForegroundColor Green
        Write-Host "   Error Message: $($Response2.message)" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "❌ FAILED: Duplicate cohort was not rejected properly" -ForegroundColor Red
        Write-Host "   Response: $($Response2 | ConvertTo-Json)" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    $ErrorResponse = $_.Exception.Response
    if ($ErrorResponse.StatusCode -eq "Conflict") {
        Write-Host "✅ PASSED: Duplicate cohort correctly rejected (HTTP 409)" -ForegroundColor Green
        $BodyReader = [System.IO.StreamReader]::new($ErrorResponse.GetResponseStream())
        $Body = $BodyReader.ReadToEnd()
        Write-Host "   Error Response: $Body" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "⚠️  Response: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host ""
    }
}

Write-Host ""
Write-Host "[TEST 3] Creating different cohort with unique intake '2027-Mar' (should succeed)..." -ForegroundColor Yellow

$Payload3 = @{
    course_title = $COURSE_TITLE
    course_code = $COURSE_CODE
    cohort_label = "2027-Mar"
    course_type = "Degree"
    awarding_body_accreditation = "Pearson"
    regulation_level = "RQF Level 6"
    mode_of_delivery = "Full-time"
    programme_type_name = "Degree"
    program_name = "Business"
    academic_year = "Year 1"
    semester_name = "Semester 1"
    application_status = "submitted"
    sync_to_moodle = $false
} | ConvertTo-Json

try {
    $Response3 = Invoke-RestMethod -Uri "$API_URL/students/course-registrations" `
        -Method POST `
        -ContentType "application/json" `
        -Body $Payload3 -ErrorAction SilentlyContinue

    if ($Response3.success -eq $true) {
        $RegID3 = $Response3.data.registration.id
        Write-Host "✅ PASSED: Different intake '2027-Mar' created successfully (ID: $RegID3)" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ FAILED: Different intake creation failed" -ForegroundColor Red
        Write-Host "   Response: $($Response3 | ConvertTo-Json)" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host ""
Write-Host "[TEST 4] Verify no duplicate cohorts in database..." -ForegroundColor Yellow

try {
    $DuplicateQuery = "SELECT COUNT(*) as count FROM course_registrations WHERE course_code = '$COURSE_CODE' AND cohort_label = '2026-Sep' AND application_status NOT IN ('rejected');"
    
    $DuplicateCount = mysql -h localhost -u root -proot moodle -se "$DuplicateQuery" 2>&1 | Select-Object -First 1
    
    if ($DuplicateCount -eq "1") {
        Write-Host "✅ PASSED: Exactly 1 cohort with intake '2026-Sep' exists" -ForegroundColor Green
        Write-Host "   Count: $DuplicateCount" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "⚠️  WARNING: Unexpected count of cohorts" -ForegroundColor Yellow
        Write-Host "   Count: $DuplicateCount (expected: 1)" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "⚠️  Could not verify DB (MySQL may not be in PATH): $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "[TEST 5] List all cohorts for this course..." -ForegroundColor Yellow

try {
    $ListQuery = "SELECT id, cohort_label, application_status FROM course_registrations WHERE course_code = '$COURSE_CODE' ORDER BY id;"
    
    Write-Host "Cohorts in database:" -ForegroundColor Cyan
    mysql -h localhost -u root -proot moodle -se "$ListQuery" 2>&1
    Write-Host ""
} catch {
    Write-Host "⚠️  Could not list cohorts: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
