-- Fresh import of 25 SCL courses to Moodle
-- Clean contexts, empty topics, no orphaned data

USE bitnami_moodle;

SET @sort := (SELECT COALESCE(MAX(sortorder), 0) FROM mdl_course);

-- Insert all 25 courses
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, visible, visibleold, lang, theme,
    timecreated, timemodified
)
VALUES
(6, @sort + 1, 'BSC (Hons) Business Management offered with Foundation Year', 'BSCBUSINESSFDN', 'SCL-BSC-HONS-BUSINESS-MANAGEMENT-OFFERED-WITH-FOU', 'Degree level course', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(5, @sort + 2, 'BTEC Higher National Certificate (1 Year)', 'BTECHNC1YR', 'SCL-BTEC-HIGHER-NATIONAL-CERTIFICATE-1-YEAR', 'HND Level 4', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(5, @sort + 3, 'BTEC Higher National Diploma (2 Years)', 'BTECHND2YR', 'SCL-BTEC-HIGHER-NATIONAL-DIPLOMA-2-YEARS', 'HND Level 5', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(6, @sort + 4, 'Extended Diploma In Strategic Management and Leadership', 'EDIPLSTRATMGT', 'SCL-EXTENDED-DIPLOMA-IN-STRATEGIC-MANAGEMENT-AND', 'Degree Level 7', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(7, @sort + 5, 'GCSE / GCE A LEVEL COURSES', 'GCSEAGCE', 'SCL-GCSE-GCE-A-LEVEL-COURSES', 'Vocational courses', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(5, @sort + 6, 'Higher National Diploma in International Travel & Tourism Management', 'HNDTRAVELTOURSM', 'SCL-HIGHER-NATIONAL-DIPLOMA-IN-INTERNATIONAL-TRAV', 'HND Travel & Tourism', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(5, @sort + 7, 'HNC/HND Administration and Information Technology (SQA)', 'HNCADMINTTECH', 'SCL-HNC-HND-ADMINISTRATION-AND-INFORMATION-TECHNO', 'HND Admin IT', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(5, @sort + 8, 'HND HOSPITALITY MANAGEMENT', 'HNDHOSPITALITY', 'SCL-HND-HOSPITALITY-MANAGEMENT', 'HND Hospitality', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(5, @sort + 9, 'HND IN BUSINESS RQF', 'HNDBUSIN', 'SCL-HND-IN-BUSINESS-RQF', 'HND Business', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(5, @sort + 10, 'HND in Hospitality Management', 'HNDHOSP2', 'SCL-HND-IN-HOSPITALITY-MANAGEMENT', 'HND Hospitality', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(5, @sort + 11, 'HND in Leadership and Management for England Course', 'HNDLEADERSHIPMGMT', 'SCL-HND-IN-LEADERSHIP-AND-MANAGEMENT-FOR-ENGLAND', 'HND Leadership', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(7, @sort + 12, 'NCFE QUALIFICATIONS', 'NCFE', 'SCL-NCFE-8211-QUALIFICATIONS', 'Vocational NCFE courses', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(7, @sort + 13, 'NCFE Level 1 Award in Travel & Tourism', 'NCFEL1TRAVEL', 'SCL-NCFE-LEVEL-1-AWARD-IN-TRAVEL-038-TOURISM', 'Vocational Level 1', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(7, @sort + 14, 'NCFE Level 1 Certificate in Hospitality & Catering Management', 'NCFEL1HOSP', 'SCL-NCFE-LEVEL-1-CERTIFICATE-IN-HOSPITALITY-038-C', 'Vocational Level 1', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(7, @sort + 15, 'NCFE Level 1 Certificate in Travel and Tourism', 'NCFEL1TRAVTOUR', 'SCL-NCFE-LEVEL-1-CERTIFICATE-IN-TRAVEL-AND-TOURIS', 'Vocational Level 1', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(7, @sort + 16, 'NCFE Level 2 Award for Resort Representatives', 'NCFEL2RESORT', 'SCL-NCFE-LEVEL-2-AWARD-FOR-RESORT-REPRESENTATIVES', 'Vocational Level 2', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(7, @sort + 17, 'NCFE Level 2 Award in Food Safety in Catering', 'NCFEL2FOODSAFE', 'SCL-NCFE-LEVEL-2-AWARD-IN-FOOD-SAFETY-IN-CATERING', 'Vocational Level 2', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(7, @sort + 18, 'NCFE Level 2 Certificate for Airline Cabin Crew', 'NCFEL2CABIN', 'SCL-NCFE-LEVEL-2-CERTIFICATE-FOR-AIRLINE-CABIN-CR', 'Vocational Level 2', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(7, @sort + 19, 'NCFE Level 2 Certificate in Aviation Operations on the Ground', 'NCFEL2AVIATION', 'SCL-NCFE-LEVEL-2-CERTIFICATE-IN-AVIATION-OPERATIO', 'Vocational Level 2', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(7, @sort + 20, 'NCFE Level 2 Certificate in Hospitality and Catering (Front of House)', 'NCFEL2HOSPFOH', 'SCL-NCFE-LEVEL-2-CERTIFICATE-IN-HOSPITALITY-AN-2', 'Vocational Level 2', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(7, @sort + 21, 'NCFE Level 2 Certificate in Hospitality and Catering (Services)', 'NCFEL2HOSPSERV', 'SCL-NCFE-LEVEL-2-CERTIFICATE-IN-HOSPITALITY-AND-C', 'Vocational Level 2', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(7, @sort + 22, 'NCFE Level 2 Certificate in Nutrition & Health', 'NCFEL2NUTRITION', 'SCL-NCFE-LEVEL-2-CERTIFICATE-IN-NUTRITION-038-HEA', 'Vocational Level 2', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(6, @sort + 23, 'NCFE Level 2 NVQ Diploma in Front of House Reception', 'NCFEL2NVQFOH', 'SCL-NCFE-LEVEL-2-NVQ-DIPLOMA-IN-FRONT-OF-HOUSE-RE', 'Degree Level 2', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(6, @sort + 24, 'Pearson BTEC Level 7 Extended Diploma in Strategic Management and Leadership', 'PEARSONBTECL7', 'SCL-PEARSON-BTEC-LEVEL-7-EXTENDED-DIPLOMA-IN-STRA', 'Degree Level 7', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(5, @sort + 25, 'Structure of Edexcel Level 5 BTEC HND in Hospitality Management', 'EDEXCELHND', 'SCL-STRUCTURE-OF-EDEXCEL-LEVEL-5-BTEC-HIGHER-NATI', 'HND Level 5', 1, 'topics', 1, 1, '', 'boost', UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- Create contexts for all courses
INSERT INTO mdl_context (contextlevel, instanceid, path, depth)
SELECT 50, c.id, '', 0 FROM mdl_course c WHERE c.idnumber LIKE 'SCL-%';

-- Update context paths
UPDATE mdl_context ctx 
JOIN mdl_course c ON c.id = ctx.instanceid AND ctx.contextlevel = 50
JOIN mdl_context catctx ON catctx.contextlevel = 40 AND catctx.instanceid = c.category
SET ctx.path = CONCAT(catctx.path, '/', ctx.id), ctx.depth = 3
WHERE c.idnumber LIKE 'SCL-%';

-- Create sections for all courses
INSERT INTO mdl_course_sections (course, section, name, visible)
SELECT c.id, 0, '', 1 FROM mdl_course c WHERE c.idnumber LIKE 'SCL-%'
UNION ALL
SELECT c.id, 1, 'Topic 1', 1 FROM mdl_course c WHERE c.idnumber LIKE 'SCL-%'
UNION ALL
SELECT c.id, 2, 'Topic 2', 1 FROM mdl_course c WHERE c.idnumber LIKE 'SCL-%'
UNION ALL
SELECT c.id, 3, 'Topic 3', 1 FROM mdl_course c WHERE c.idnumber LIKE 'SCL-%'
UNION ALL
SELECT c.id, 4, 'Topic 4', 1 FROM mdl_course c WHERE c.idnumber LIKE 'SCL-%'
UNION ALL
SELECT c.id, 5, 'Topic 5', 1 FROM mdl_course c WHERE c.idnumber LIKE 'SCL-%';

-- Verify results
SELECT 'Import Complete!' AS status;
SELECT cat.name, COUNT(c.id) as courses
FROM mdl_course c
JOIN mdl_course_categories cat ON c.category = cat.id
WHERE c.idnumber LIKE 'SCL-%'
GROUP BY cat.id, cat.name
ORDER BY cat.name;
