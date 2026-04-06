# Duplicate Cohort Intake Validation - Implementation Summary

## Problem
The system was allowing creation of duplicate cohort intakes for the same course. For example, when "2026-Sep" intake was submitted for course "DEG-001-Y1-S1-C1", the system would create a new cohort even though one with the same intake already existed, resulting in duplicate cohorts #4 and #7 both labeled "2026-Sep".

## Root Cause
- **Backend**: No validation logic existed in the `/students/course-registrations` POST endpoint to check for duplicate (course_code, cohort_label) combinations before INSERT
- **Frontend**: No client-side validation to warn users about duplicates before submission

## Solution Implemented

### 1. Backend Validation (students.js - Line 2826-2842)
Added a duplicate check in the POST `/course-registrations` endpoint that:
- Queries existing registrations with the same `course_code` AND `cohort_label`
- Excludes rejected registrations from the check (allows reusing rejected cohort labels)
- Returns HTTP **409 Conflict** with clear error message if duplicate found
- Message: `"A cohort with intake period '{label}' already exists for this course. Please select a different intake period or edit the existing cohort."`
- Includes the `duplicate_registration_id` in the response for easy navigation

**Code Added:**
```javascript
// Check for duplicate cohort intake for this course
if (payload.cohort_label) {
    const [duplicateRows] = await db.execute(
        `SELECT id, cohort_label FROM course_registrations 
         WHERE course_code = ? AND cohort_label = ? AND application_status != 'rejected'
         LIMIT 1`,
        [payload.course_code, payload.cohort_label]
    );

    if (duplicateRows.length > 0) {
        return res.status(409).json({
            success: false,
            message: `A cohort with intake period "${payload.cohort_label}" already exists for this course. Please select a different intake period or edit the existing cohort.`,
            duplicate_registration_id: duplicateRows[0].id
        });
    }
}
```

### 2. Frontend Validation (CourseRegistrations.jsx - handleSubmitRegistration)
Added client-side duplicate check in `handleSubmitRegistration()` that:
- Validates BEFORE making the API call (prevents unnecessary server calls)
- Checks against currently loaded `registrations` in state
- Only validates new cohorts (skips check if editing existing registration - `!editingRegistrationId`)
- Displays warning message with cohort ID for easy navigation
- Message: `"⚠️ This intake period '{label}' already exists for this course. Please select a different intake period or edit cohort #{id}."`

**Code Added:**
```javascript
// Frontend validation: check for duplicate cohort intake
if (registrationForm.cohort_label && !editingRegistrationId) {
    const courseCode = selectedAccreditation.course_code || '';
    const cohortLabel = registrationForm.cohort_label.trim();
    
    // Check if any existing registration (that's not rejected) has the same course code and cohort label
    const duplicateReg = registrations.find(reg => 
        String(reg.course_code || '').trim() === courseCode &&
        String(reg.cohort_label || '').trim() === cohortLabel &&
        reg.application_status !== 'rejected'
    );

    if (duplicateReg) {
        setMessage(`⚠️ This intake period "${cohortLabel}" already exists for this course. Please select a different intake period or edit cohort #${duplicateReg.id}.`);
        return;
    }
}
```

## Behavior

### Creating New Cohort (Duplicate Prevented)
1. User fills in form with Cohort Label "2026-Sep" for course "DEG-001"
2. **Frontend validation** runs: Checks if any existing non-rejected registrations have course_code="DEG-001" AND cohort_label="2026-Sep"
3. If duplicate found → Shows warning message, prevents API call
4. If no duplicate → Proceeds to submit
5. **Backend validation** runs as final safeguard: Double-checks at DB level
6. If duplicate somehow exists → Returns HTTP 409 with error message
7. **Both errors are user-friendly** with clear guidance on what to do

### Editing Existing Cohort (Allowed)
- Frontend validation is skipped for edits (`!editingRegistrationId` check)
- User can update existing cohort without duplicate checking
- Allowed because they're modifying an existing record, not creating a new one

### Rejected Cohorts (Can Be Reused)
- Validation explicitly excludes cohorts with `application_status = 'rejected'`
- This allows users to create a new cohort with a previously rejected intake label
- Prevents historical rejected cohorts from permanently blocking an intake period

## Test Instructions

### Test 1: Attempt Duplicate Cohort (Should Fail)
1. Open course registration page (ensure you're logged in)
2. Select a course (e.g., "Degree Y1 Sem 1 Course 1")
3. Fill form with cohort label "2026-Sep" (must match existing cohort)
4. Click "Submit Cohort & Sync Moodle"
5. **Expected**: Error message appears: "This intake period '2026-Sep' already exists for this course..."
6. No new cohort created, form remains open

### Test 2: Unique Cohort (Should Succeed)
1. Same as Test 1 but use cohort label "2027-Nov" (unique for that course)
2. Click "Submit Cohort & Sync Moodle"
3. **Expected**: Course registration succeeds, Moodle sync triggered
4. New cohort created successfully

### Test 3: Edit Existing Cohort (Should Succeed)
1. Click Edit button on existing cohort
2. Change some fields (optional)
3. Click "Update Cohort & Sync Moodle"
4. **Expected**: Allows edit without duplicate checking
5. Cohort updated successfully

### Test 4: Reuse Rejected Cohort Label
1. Create cohort with label "2025-Jan" - submit
2. Delete/Reject the cohort (mark as rejected)
3. Try to create new cohort with same label "2025-Jan"
4. **Expected**: Validation allows it (rejected cohorts don't block reuse)
5. New cohort created successfully

## Files Modified
1. **backend/routes/students.js** - Added duplicate check at line 2826-2842 in POST `/course-registrations` handler
2. **frontend/src/pages/CourseRegistrations.jsx** - Added frontend validation in `handleSubmitRegistration()` function

## Impact
- **User Experience**: Prevents accidental duplicate creation; clear error messages guide users to correct action
- **Data Integrity**: Double validation (frontend + backend) ensures no duplicates slip through
- **Performance**: Frontend validation prevents unnecessary API calls
- **Compatibility**: Changes are backward compatible; only affects new cohort creation, not editing

## Notes
- The validation allows multiple intakes per course (e.g., "2026-Sep" AND "2027-Mar" can coexist)
- Only prevents exact duplicates of (course_code, cohort_label) combination
- Rejected cohorts are excluded from the duplicate check to allow historical intake labels to be reused
- Error message includes suggestion to "edit the existing cohort" with the ID for easy reference

---
**Implementation Date**: 2024
**Status**: Complete and Ready for Testing
