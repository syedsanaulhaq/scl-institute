-- Fresh import of SCL courses to Moodle
-- No orphaned data, clean contexts, empty topics

USE bitnami_moodle;

-- Get the max sortorder
SET @sort := (SELECT COALESCE(MAX(sortorder), 0) FROM mdl_course);

-- Insert courses with proper category mapping
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
        WHEN 'HND' THEN 5
        WHEN 'Degree' THEN 6
        WHEN 'Vocational' THEN 7
        WHEN 'CPD' THEN 8
        WHEN 'Short Course' THEN 9
        ELSE 5
    END AS category,
    (@sort := @sort + 1) AS sortorder,
    c.course_title AS fullname,
    LEFT(REPLACE(c.course_title, ' ', ''), 30) AS shortname,
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
    'boost' AS theme,
    UNIX_TIMESTAMP() AS timecreated,
    UNIX_TIMESTAMP() AS timemodified,
    0 AS requested,
    0 AS enablecompletion,
    0 AS completionnotify,
    0 AS cacherev,
    0 AS showactivitydates
FROM scl_institute.courses c
WHERE c.course_code LIKE 'SCL-%'
ORDER BY c.course_title;

-- Create contexts for all newly inserted courses
INSERT INTO mdl_context (contextlevel, instanceid, path, depth)
SELECT 50 AS contextlevel, c.id AS instanceid, '' AS path, 0 AS depth
FROM mdl_course c
WHERE c.idnumber LIKE 'SCL-%'
ORDER BY c.id;

-- Update context paths based on category
UPDATE mdl_context ctx 
JOIN mdl_course c ON c.id = ctx.instanceid AND ctx.contextlevel = 50
JOIN mdl_context catctx ON catctx.contextlevel = 40 AND catctx.instanceid = c.category
SET ctx.path = CONCAT(catctx.path, '/', ctx.id), ctx.depth = 3
WHERE c.idnumber LIKE 'SCL-%';

-- Create course sections for all courses
INSERT INTO mdl_course_sections (course, section, name, summary, summaryformat, sequence, visible, availability)
SELECT c.id, sec.num, IF(sec.num = 0, '', CONCAT('Topic ', sec.num)), '', 1, '', 1, NULL
FROM mdl_course c
CROSS JOIN (
    SELECT 0 AS num UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) sec
WHERE c.idnumber LIKE 'SCL-%'
ORDER BY c.id, sec.num;

-- Add format options for topics
INSERT INTO mdl_course_format_options (courseid, format, sectionid, name, value)
SELECT c.id, 'topics', 0, 'numsections', '5'
FROM mdl_course c
WHERE c.idnumber LIKE 'SCL-%'
ON DUPLICATE KEY UPDATE value = '5';

-- Verify import
SELECT 
    cat.name AS category,
    COUNT(c.id) AS course_count
FROM mdl_course c
JOIN mdl_course_categories cat ON c.category = cat.id
WHERE c.idnumber LIKE 'SCL-%'
GROUP BY cat.name
ORDER BY cat.name;

SELECT 'Import complete!' AS status;
