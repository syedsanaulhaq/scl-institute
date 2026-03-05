-- SCL-Moodle Synchronization SQL Script
-- Purpose: Sync student applications and enrollments
-- Date: March 5, 2026
-- Status: Auto-generated

-- ============================================
-- STEP 1: User Synchronization
-- ============================================

-- Create temporary sync table
CREATE TEMPORARY TABLE sync_temp AS
SELECT 
    sa.id as app_id,
    sa.email,
    sa.first_name,
    sa.last_name,
    sa.course_code,
    sa.course_title,
    sa.application_status,
    COALESCE(mu.id, 0) as moodle_user_id,
    COALESCE(mu.username, CONCAT('scl_', REPLACE(sa.email, '@', '_'))) as username
FROM scl_institute.student_applications sa
LEFT JOIN moodle.mdl_user mu ON sa.email = mu.email
WHERE sa.is_deleted = 0 
  AND sa.application_status IN ('accepted', 'conditional_accept', 'conditional_accepted')
ORDER BY sa.id;

-- Log: Count records to sync
SELECT CONCAT('Total applications to sync: ', COUNT(*)) as sync_summary
FROM sync_temp
WHERE moodle_user_id = 0;

-- ============================================
-- STEP 2: Create Missing Moodle Users
-- ============================================

-- Insert missing users into Moodle
INSERT INTO moodle.mdl_user 
(auth, confirmed, policyagreed, deleted, suspended, mnethostid, username, password, idnumber, firstname, lastname, email, emailstop, icq, skype, aim, yahoo, msn, phone1, phone2, institution, department, address, city, country, lang, calendartype, theme, timezone, firstaccess, lastaccess, lastlogin, currentlogin, lastip, secret, picture, url, description, descriptionformat, mailformat, maildigest, maildisplay, autosubscribe, trackforums, timecreated, timemodified)
SELECT 
    'manual' as auth,
    1 as confirmed,
    1 as policyagreed,
    0 as deleted,
    0 as suspended,
    1 as mnethostid,
    LOWER(CONCAT('scl_', REPLACE(st.email, '@', '_'))) as username,
    MD5(CONCAT('TempPass2026!', st.email)) as password,
    CONCAT('SCL_', st.id) as idnumber,
    st.first_name as firstname,
    st.last_name as lastname,
    st.email,
    0 as emailstop,
    '' as icq,
    '' as skype,
    '' as aim,
    '' as yahoo,
    '' as msn,
    st.contact_number as phone1,
    '' as phone2,
    'SCL Institute' as institution,
    COALESCE(st.course_title, 'Student') as department,
    st.address_line1 as address,
    st.town_city as city,
    st.country_of_residence as country,
    'en' as lang,
    'gregorian' as calendartype,
    '' as theme,
    '99' as timezone,
    UNIX_TIMESTAMP(NOW()) as firstaccess,
    0 as lastaccess,
    0 as lastlogin,
    0 as currentlogin,
    '' as lastip,
    '' as secret,
    0 as picture,
    '' as url,
    CONCAT('Application: ', st.course_title, ' | Status: ', st.application_status) as description,
    1 as descriptionformat,
    2 as mailformat,
    0 as maildigest,
    2 as maildisplay,
    1 as autosubscribe,
    0 as trackforums,
    UNIX_TIMESTAMP(NOW()) as timecreated,
    UNIX_TIMESTAMP(NOW()) as timemodified
FROM sync_temp st
WHERE st.moodle_user_id = 0;

SELECT CONCAT('New Moodle users created: ', ROW_COUNT()) as result;

-- Refresh sync table with new user IDs
DROP TEMPORARY TABLE sync_temp;
CREATE TEMPORARY TABLE sync_temp AS
SELECT 
    sa.id as app_id,
    sa.email,
    sa.first_name,
    sa.last_name,
    sa.course_code,
    sa.course_title,
    sa.application_status,
    mu.id as moodle_user_id
FROM scl_institute.student_applications sa
JOIN moodle.mdl_user mu ON sa.email = mu.email
WHERE sa.is_deleted = 0 
  AND sa.application_status IN ('accepted', 'conditional_accept', 'conditional_accepted');

-- ============================================
-- STEP 3: Course Enrollment
-- ============================================

-- Create manual enrol instances if they don't exist
INSERT IGNORE INTO moodle.mdl_enrol (enrol, status, courseid, sortorder, name, enrolperiod, enrolstartdate, enrolenddate, expirynotify, expirythreshold, notifyall, roleid, cost, currency, timecreated, timemodified)
SELECT 
    'manual' as enrol,
    0 as status,
    mc.id as courseid,
    0 as sortorder,
    NULL as name,
    0 as enrolperiod,
    0 as enrolstartdate,
    0 as enrolenddate,
    0 as expirynotify,
    0 as expirythreshold,
    0 as notifyall,
    5 as roleid,
    0 as cost,
    NULL as currency,
    UNIX_TIMESTAMP(NOW()) as timecreated,
    UNIX_TIMESTAMP(NOW()) as timemodified
FROM moodle.mdl_course mc
WHERE mc.id > 1 
  AND NOT EXISTS (SELECT 1 FROM moodle.mdl_enrol WHERE courseid = mc.id AND enrol = 'manual');

SELECT CONCAT('Enrol instances checked: ', ROW_COUNT(), ' records') as result;

-- Enroll students in their course
INSERT IGNORE INTO moodle.mdl_user_enrolments (enrolid, userid, status, timestart, timeend, modifierid, timemodified)
SELECT DISTINCT
    me.id as enrolid,
    st.moodle_user_id,
    0 as status,
    UNIX_TIMESTAMP(NOW()) as timestart,
    0 as timeend,
    2 as modifierid,
    UNIX_TIMESTAMP(NOW()) as timemodified
FROM sync_temp st
JOIN moodle.mdl_course mc ON 
    mc.shortname LIKE CONCAT('SCL-%', REPLACE(UPPER(st.course_code), ' ', '%'), '%')
    OR mc.fullname LIKE CONCAT('%', st.course_title, '%')
JOIN moodle.mdl_enrol me ON me.courseid = mc.id AND me.enrol = 'manual'
WHERE st.moodle_user_id > 0;

SELECT CONCAT('Students enrolled in courses: ', ROW_COUNT(), ' enrollments') as result;

-- Assign student role (usually role 5)
INSERT IGNORE INTO moodle.mdl_user_enrolments (enrolid, userid, status, timestart, timeend, modifierid, timemodified)
SELECT DISTINCT
    me.id,
    st.moodle_user_id,
    0,
    UNIX_TIMESTAMP(NOW()),
    0,
    2,
    UNIX_TIMESTAMP(NOW())
FROM sync_temp st
JOIN moodle.mdl_course mc ON mc.id > 1
JOIN moodle.mdl_enrol me ON me.courseid = mc.id AND me.enrol = 'manual'
WHERE NOT EXISTS (
    SELECT 1 FROM moodle.mdl_user_enrolments ue 
    WHERE ue.userid = st.moodle_user_id AND ue.enrolid = me.id
);

-- ============================================
-- STEP 4: Update SCL Mapping Table
-- ============================================

UPDATE scl_institute.course_enrollment_mapping cem
SET 
    moodle_enrollment_id = (
        SELECT ue.id 
        FROM moodle.mdl_user_enrolments ue
        JOIN sync_temp st ON ue.userid = st.moodle_user_id
        WHERE cem.student_id = st.app_id
        LIMIT 1
    ),
    sync_status = 'Synced',
    last_sync_date = NOW(),
    enrollment_status = CASE 
        WHEN moodle_enrollment_id IS NOT NULL THEN 'Enrolled'
        ELSE 'Pending'
    END
WHERE student_id IN (SELECT app_id FROM sync_temp);

SELECT CONCAT('Mapping table updated: ', ROW_COUNT(), ' records') as result;

-- ============================================
-- STEP 5: Verification & Reporting
-- ============================================

SELECT '========== SYNC VERIFICATION REPORT ==========' as section;

SELECT CONCAT('✓ SCL Applications (Accepted): ', COUNT(*)) as stat 
FROM scl_institute.student_applications 
WHERE application_status IN ('accepted', 'conditional_accept', 'conditional_accepted') 
  AND is_deleted = 0;

SELECT CONCAT('✓ Moodle Users Created: ', COUNT(*)) as stat 
FROM moodle.mdl_user 
WHERE username LIKE 'scl_%';

SELECT CONCAT('✓ Student Enrollments: ', COUNT(*)) as stat 
FROM moodle.mdl_user_enrolments ue
JOIN moodle.mdl_user mu ON ue.userid = mu.id
WHERE mu.username LIKE 'scl_%';

SELECT CONCAT('✓ Synced Mappings: ', COUNT(*)) as stat 
FROM scl_institute.course_enrollment_mapping
WHERE sync_status = 'Synced';

-- Detailed sync status
SELECT '========== ENROLLMENTS BY COURSE ==========' as section;
SELECT 
    mc.fullname as course_name,
    COUNT(DISTINCT ue.userid) as enrolled_students,
    MIN(ue.timestart) as first_enrollment
FROM moodle.mdl_user_enrolments ue
JOIN moodle.mdl_enrol me ON ue.enrolid = me.id
JOIN moodle.mdl_course mc ON me.courseid = mc.id
JOIN moodle.mdl_user mu ON ue.userid = mu.id
WHERE mu.username LIKE 'scl_%'
GROUP BY mc.id
ORDER BY enrolled_students DESC;

-- Sample enrollment details
SELECT '========== SAMPLE ENROLLMENT DETAILS ==========' as section;
SELECT 
    CONCAT(mu.firstname, ' ', mu.lastname) as student_name,
    mu.email,
    mc.fullname as course,
    CASE ue.status WHEN 0 THEN 'Active' WHEN 1 THEN 'Suspended' END as status,
    FROM_UNIXTIME(ue.timestart) as enrolled_date
FROM moodle.mdl_user_enrolments ue
JOIN moodle.mdl_user mu ON ue.userid = mu.id
JOIN moodle.mdl_enrol me ON ue.enrolid = me.id
JOIN moodle.mdl_course mc ON me.courseid = mc.id
WHERE mu.username LIKE 'scl_%'
LIMIT 15;

SELECT '========== SYNC COMPLETE ==========' as status;
