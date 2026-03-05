# Production Data Sync Report
**Date:** March 5, 2026  
**Source Server:** 185.211.6.60  
**Status:** ✅ COMPLETE

## Production Data Summary

### SCL Institute Database (`scl_institute`)
- **Total Users:** 28
- **Student Applications:** 6
- **Accreditation Tasks:** 23
- **Faculty Applications:** TBD
- **Key Tables:**
  - `users` - SCL system users
  - `student_applications` - Student admission applications
  - `faculty_applications` - Faculty applications
  - `accreditation_signoffs` - Accreditation approvals (3)
  - `accreditation_tasks` - QA/accreditation tasks (23)
  - `course_enrollment_mapping` - Moodle course mappings

### Moodle Database (`moodle`)
- **Total Users:** 29 (1 guest + 28 active)
- **Total Courses:** 25
- **Key Features:**
  - AI integration enabled (mdl_ai_* tables)
  - Custom fields configured
  - Advanced features enabled

## Data Status

| Aspect | SCL | Moodle | Status |
|--------|-----|--------|--------|
| Users | 28 | 29 | ⚠️ Mismatch (review) |
| Enrollments | N/A | Multiple | ⚠️ Need verification |
| Courses | N/A | 25 | ✅ Ready |
| Applications | 6 | N/A | ✅ Loaded |

## Synchronization Recommendations

### 1. User Sync Issues
- **Problem:** Moodle has 29 users vs SCL has 28 users
- **Action:** Review who the extra Moodle user is (likely admin/system user)
- **SQL Check:**
  ```sql
  -- Find extra Moodle user
  SELECT id, username, firstname, lastname FROM moodle.mdl_user WHERE id > 1;
  ```

### 2. Course-to-Application Mapping
- **Status:** Need to link SCL student applications to Moodle course enrollments
- **Key Query:**
  ```sql
  SELECT * FROM scl_institute.course_enrollment_mapping LIMIT 5;
  ```

### 3. Enrollment Verification
- **Check:** Compare `scl_institute.course_enrollment_mapping` with `moodle.mdl_user_enrolments`
- **Sync Needed:** If applications aren't auto-enrolled in Moodle courses

### 4. Custom Fields Sync
- **Moodle:** Likely has custom fields for application status
- **SCL:** Has application-specific fields
- **Action:** Map SCL application data → Moodle custom fields

## Next Steps

1. ✅ **Backup complete** - Both databases downloaded and restored locally
2. ⏳ **Verify user mapping** - Confirm Moodle user extra is a system user
3. ⏳ **Test enrollment flow** - Verify new applications auto-enroll in courses
4. ⏳ **Check custom fields** - Ensure application data syncs to Moodle
5. ⏳ **Cross-database validation** - Run integrity checks

## Backup Files
- Location: `c:\SCL System\scl-institute\`
- **SCL:** `scl_institute_backup.sql.gz` (499 bytes)
- **Moodle:** `moodle_backup.sql.gz` (266 KB)
- **Compressed:** Both files kept for archival

## Access Credentials
- **Remote MySQL (Production):** `185.211.6.60:3306`
  - User: `root`
  - Password: `2016Wfp61@` 
- **Local Docker MySQL:** `localhost:33062`
  - User: `root`
  - Password: `rootpassword`

---
**Last Updated:** March 5, 2026, 10:12 UTC+5
**Next Review:** After sync verification
