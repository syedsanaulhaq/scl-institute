-- Import SCL London courses into Moodle with proper category mapping
-- Uses scl_institute.courses as source

USE bitnami_moodle;

SET @sort := (SELECT COALESCE(MAX(sortorder), 0) FROM mdl_course);

-- Import courses with category mapping based on course_type
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
)
SELECT
    CASE c.course_type
        WHEN 'HND' THEN (SELECT id FROM mdl_course_categories WHERE name = 'HND')
        WHEN 'Degree' THEN (SELECT id FROM mdl_course_categories WHERE name = 'Degree')
        WHEN 'Vocational' THEN (SELECT id FROM mdl_course_categories WHERE name = 'Vocational')
        WHEN 'CPD' THEN (SELECT id FROM mdl_course_categories WHERE name = 'CPD')
        WHEN 'Short Course' THEN (SELECT id FROM mdl_course_categories WHERE name = 'Short Course')
        ELSE 1
    END AS category,
    (@sort := @sort + 1) AS sortorder,
    c.course_title AS fullname,
    c.course_code AS shortname,
    c.course_code AS idnumber,
    COALESCE(c.description, '') AS summary,
    1 AS summaryformat,
    'topics' AS format,
    1 AS showgrades,
    1 AS newsitems,
    UNIX_TIMESTAMP() AS startdate,
    0 AS enddate,
    0 AS relativedatesmode,
    0 AS marker,
    0 AS maxbytes,
    0 AS legacyfiles,
    0 AS showreports,
    1 AS visible,
    1 AS visibleold,
    0 AS groupmode,
    0 AS groupmodeforce,
    0 AS defaultgroupingid,
    '' AS lang,
    '' AS calendartype,
    '' AS theme,
    UNIX_TIMESTAMP() AS timecreated,
    UNIX_TIMESTAMP() AS timemodified,
    0 AS requested,
    0 AS enablecompletion,
    0 AS completionnotify,
    0 AS cacherev,
    0 AS showactivitydates
FROM scl_institute.courses c
LEFT JOIN mdl_course m ON m.idnumber = CONVERT(c.course_code USING utf8mb4) COLLATE utf8mb4_unicode_ci
WHERE m.id IS NULL
  AND CONVERT(c.course_code USING utf8mb4) COLLATE utf8mb4_unicode_ci LIKE 'SCL-%'
ORDER BY c.course_title;

-- Sync Moodle course ids back to SCL courses table
UPDATE scl_institute.courses c
JOIN mdl_course m ON m.idnumber = CONVERT(c.course_code USING utf8mb4) COLLATE utf8mb4_unicode_ci
SET c.moodle_course_id = m.id
WHERE CONVERT(c.course_code USING utf8mb4) COLLATE utf8mb4_unicode_ci LIKE 'SCL-%';

-- Show results
SELECT cat.name AS category, COUNT(*) AS course_count
FROM mdl_course m
JOIN mdl_course_categories cat ON m.category = cat.id
WHERE m.idnumber LIKE 'SCL-%'
GROUP BY cat.name
ORDER BY cat.name;

SELECT 'Moodle import with categories completed' AS status;
