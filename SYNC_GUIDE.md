# SCL-Moodle Data Synchronization Guide

## Overview

This document describes how to synchronize data between the SCL Institute database and Moodle LMS. The synchronization process:

1. **Creates Moodle user accounts** for accepted SCL applicants
2. **Auto-enrolls students** in their assigned Moodle courses
3. **Updates enrollment mappings** to track sync status
4. **Generates verification reports** for quality assurance

## Database Status

### Current Data (Post-Sync, March 5, 2026)

| Component | Count | Status |
|-----------|-------|--------|
| SCL Applications (Accepted) | 6 | ✅ Ready |
| Moodle Users Created | 6+ | ✅ Synced |
| Moodle Courses | 25 | ✅ Available |
| Student Enrollments | TBD | ⏳ Pending |

## Sync Methods

### Method 1: SQL Script (Fastest & Safest)

**Best for:** One-time syncs, production environments

```bash
# Execute directly in MySQL
mysql -h localhost -P 33062 -u root -prootpassword < sync-scl-moodle.sql

# Or using Docker
docker-compose exec -T scli-mysql mysql -u root -prootpassword < sync-scl-moodle.sql
```

**What it does:**
- ✅ Validates data before any changes
- ✅ Uses transactions (atomic operations)
- ✅ Detailed verification reports
- ✅ Minimal performance impact

**SQL Script Workflow:**
1. Query accepted applications
2. Identify missing Moodle users
3. Create user accounts with temp passwords
4. Create/verify enrol instances for courses
5. Generate enrollments
6. Update mapping table
7. Print detailed verification report

### Method 2: PHP Script (Flexible & Logged)

**Best for:** Scheduled syncing, logging, error handling

```bash
# Dry-run (test mode, no changes)
php sync-scl-moodle.php --dry-run --verbose

# Live sync (applies all changes)
php sync-scl-moodle.php --verbose

# Production (runs silently, logs errors)
php sync-scl-moodle.php
```

**Features:**
- ✅ Dry-run mode for testing
- ✅ Detailed logging
- ✅ Error catching & reporting
- ✅ Per-user/enrollment statistics
- ✅ Configurable via environment variables

### Method 3: Bash Script (Automated)

**Best for:** Cron jobs, CI/CD pipelines

```bash
# Run sync
./sync-scl-moodle.sh

# Results printed with verification report
```

## Configuration

### Environment Variables (for PHP script)

```bash
export DB_HOST="localhost"
export DB_PORT="33062"
export DB_USER="root"
export DB_PASS="rootpassword"
export MOODLE_DB_HOST="localhost"
export MOODLE_DB_PORT="33062"
export MOODLE_DB_USER="root"
export MOODLE_DB_PASS="rootpassword"

php sync-scl-moodle.php
```

### Docker Configuration

All scripts work with your current Docker setup:
- **MySQL Host:** `localhost:33062`
- **Root User:** `root`
- **Password:** `rootpassword`
- **SCL Database:** `scl_institute`
- **Moodle Database:** `moodle`

## What Gets Synced

### User Accounts Created

For each accepted SCL application:

| Field | Source | Destination | Notes |
|-------|--------|-------------|-------|
| Email | application email | mdl_user.email | Primary identifier |
| Username | scl_[email] | mdl_user.username | Auto-generated |
| First Name | student_applications | mdl_user.firstname | From app data |
| Last Name | student_applications | mdl_user.lastname | From app data |
| Department | course_title | mdl_user.department | For filtering |
| Description | application_status | mdl_user.description | Track sync source |
| Password | Generated | mdl_user.password | Hashed with MD5 |
| Status | Auto | mdl_user.confirmed = 1 | Pre-confirmed |

**Default Temp Password:** First-time users should reset password in Moodle

### Enrollments Created

Students automatically enrolled in courses matching:

```sql
WHERE mc.shortname LIKE '%{course_code}%'
   OR mc.fullname LIKE '%{course_title}%'
```

**Enrollment Status:** `0` (Active/Current)

### Mapping Updates

The `scl_institute.course_enrollment_mapping` table tracks:

- `moodle_enrollment_id` - Links to Moodle enrollment
- `sync_status` - 'Synced', 'Pending', 'Failed'
- `last_sync_date` - Timestamp of last sync
- `enrollment_status` - 'Enrolled', 'Pending', 'Suspended'

## Verification & Testing

### Check Sync Status

```sql
-- Accepted applications
SELECT COUNT(*) FROM scl_institute.student_applications 
WHERE application_status = 'accepted' AND is_deleted = 0;

-- Created Moodle users
SELECT COUNT(*) FROM moodle.mdl_user 
WHERE username LIKE 'scl_%';

-- Active enrollments
SELECT COUNT(*) FROM moodle.mdl_user_enrolments ue
JOIN moodle.mdl_user mu ON ue.userid = mu.id
WHERE mu.username LIKE 'scl_%';

-- Synced mappings
SELECT COUNT(*) FROM scl_institute.course_enrollment_mapping 
WHERE sync_status = 'Synced';
```

### View Enrollment Details

```sql
SELECT 
    CONCAT(mu.firstname, ' ', mu.lastname) as student,
    mu.email,
    mc.fullname as course,
    FROM_UNIXTIME(ue.timestart) as enrolled_date
FROM moodle.mdl_user_enrolments ue
JOIN moodle.mdl_user mu ON ue.userid = mu.id
JOIN moodle.mdl_enrol me ON ue.enrolid = me.id
JOIN moodle.mdl_course mc ON me.courseid = mc.id
WHERE mu.username LIKE 'scl_%'
ORDER BY ue.timestart DESC
LIMIT 20;
```

## Known Issues & Solutions

### Issue 1: "User already exists"
**Cause:** Email exists in Moodle from previous sync
**Solution:** Scripts automatically detect and skip existing users

### Issue 2: "Course not found"
**Cause:** Course code/title doesn't match Moodle course names
**Solution:** Check `moodle.mdl_course` shortnames and adjust matching logic

### Issue 3: Enrollment failed
**Cause:** Enrol instance missing or invalid userid
**Solution:** Scripts auto-create enrol instances; check user exists first

## Post-Sync Checklist

- [ ] Run sync script in dry-run mode
- [ ] Review verification report
- [ ] Check row counts match expectations
- [ ] Verify 2-3 sample enrollments in Moodle
- [ ] Test student login with temp password
- [ ] Check course visibility in student dashboard
- [ ] Run full sync when confident

## Rollback Procedure

If something goes wrong:

```sql
-- Restore from backup
mysql -u root -prootpassword scl_institute < scl_institute_backup.sql
mysql -u root -prootpassword moodle < moodle_backup.sql
```

## Scheduling (Cron)

To sync daily at 2 AM:

```bash
0 2 * * * cd /path/to/scl-institute && php sync-scl-moodle.php >> sync.log 2>&1
```

## Performance Considerations

- **Sync Time:** ~5-30 seconds for 6+ applications
- **Lock Time:** Minimal (no long transaction locks)
- **Network:** Works with remote MySQL (no performance hit over local)

## Support & Debugging

### Enable Verbose Output
```bash
php sync-scl-moodle.php --dry-run --verbose
```

### Check Logs
```bash
tail -f sync.log
```

### Manual Enrollment
If sync fails for specific student:

```sql
-- Find user
SELECT id FROM moodle.mdl_user WHERE email = 'student@example.com';

-- Find course
SELECT id FROM moodle.mdl_course WHERE shortname LIKE '%COURSE-CODE%';

-- Create enrollment manually
INSERT INTO moodle.mdl_user_enrolments (enrolid, userid, status, timestart, timeend, modifierid, timemodified)
SELECT id as enrolid, {USER_ID}, 0, UNIX_TIMESTAMP(NOW()), 0, 2, UNIX_TIMESTAMP(NOW())
FROM moodle.mdl_enrol 
WHERE courseid = {COURSE_ID} AND enrol = 'manual'
LIMIT 1;
```

## Next Steps

1. **Test dry-run:** `php sync-scl-moodle.php --dry-run --verbose`
2. **Review report:** Check all counts and status
3. **Run production:** `php sync-scl-moodle.php`
4. **Verify in Moodle:** Check Courses > Enrolled users
5. **Monitor:** Watch for sync errors in logs

## Files Included

- `sync-scl-moodle.sql` - Pure SQL script
- `sync-scl-moodle.php` - PHP wrapper with logging
- `sync-scl-moodle.sh` - Bash wrapper script
- `PRODUCTION_DATA_SYNC_REPORT.md` - Initial sync report

---

**Last Updated:** March 5, 2026  
**Status:** ✅ Production Ready  
**Next Review:** After first live sync
