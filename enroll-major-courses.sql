-- Step 1: Select major category courses (1 per category)
-- Categories identified:
-- 1. Business (BSC)
-- 2. BTEC National Diplomas  
-- 3. Extended Diploma
-- 4. GCSE/GCE/A-Level
-- 5. Travel & Tourism
-- 6. HNC/HND Administration & IT
-- 7. Hospitality Management
-- 8. Leadership & Management
-- 9. NCFE Qualifications

-- First, unenroll all students from all courses
DELETE FROM mdl_user_enrolments 
WHERE enrolid IN (
    SELECT id FROM mdl_enrol 
    WHERE courseid IN (SELECT id FROM mdl_course WHERE id > 1)
)
AND userid IN (26, 28, 29, 30);

-- Step 2: Enroll to major category courses only
-- User IDs: 26=Ahmed, 28=Mohammed Khan, 29=Mohammed Hassan, 30=Mohammed Khalid

-- Create enrollments for the 9 major courses if needed
INSERT IGNORE INTO mdl_user_enrolments (enrolid, userid, status, timestart, timeend, timecreated, timemodified)
SELECT e.id, u.id, 0, UNIX_TIMESTAMP(), 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()
FROM mdl_enrol e
CROSS JOIN (SELECT 26 as id UNION SELECT 28 UNION SELECT 29 UNION SELECT 30) u
WHERE e.courseid IN (
    2,  -- BSC (Hons) Business Management
    4,  -- BTEC Higher National Diploma (2 Years)
    5,  -- Extended Diploma In Strategic Management
    6,  -- GCSE / GCE / A-Level
    7,  -- Higher National Diploma Travel & Tourism
    8,  -- HNC/HND Administration and Information Technology
    9,  -- HND Hospitality Management
    12, -- HND Leadership and Management for England
    13  -- NCFE Qualifications (umbrella)
)
AND e.enrol = 'manual'
AND NOT EXISTS (
    SELECT 1 FROM mdl_user_enrolments ue 
    WHERE ue.enrolid = e.id AND ue.userid = u.id
);

-- Step 3: Verify enrollment
SELECT 
    u.id,
    u.firstname,
    u.lastname,
    u.email,
    COUNT(DISTINCT ue.enrolid) as enrolled_courses
FROM mdl_user u
LEFT JOIN mdl_user_enrolments ue ON u.id = ue.userid
LEFT JOIN mdl_enrol e ON ue.enrolid = e.id
WHERE u.id IN (26, 28, 29, 30)
GROUP BY u.id, u.firstname, u.lastname, u.email
ORDER BY u.id;
