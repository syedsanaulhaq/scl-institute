-- Fix broken category paths for HND Leadership & Management categories
-- Root cause: Categories 176-182 had paths starting with /1/ referencing
-- non-existent category ID 1. This caused Moodle's navigation block to crash
-- with "Call to a member function is_uservisible() on false" error.
-- 
-- The correct path structure follows category 163 (HND) which has path /163

-- Fix category paths
UPDATE mdl_course_categories SET path = '/163/176', depth = 2 WHERE id = 176;
UPDATE mdl_course_categories SET path = '/163/176/177', depth = 3 WHERE id = 177;
UPDATE mdl_course_categories SET path = '/163/176/178', depth = 3 WHERE id = 178;
UPDATE mdl_course_categories SET path = '/163/176/177/179', depth = 4 WHERE id = 179;
UPDATE mdl_course_categories SET path = '/163/176/177/180', depth = 4 WHERE id = 180;
UPDATE mdl_course_categories SET path = '/163/176/178/181', depth = 4 WHERE id = 181;
UPDATE mdl_course_categories SET path = '/163/176/178/182', depth = 4 WHERE id = 182;

-- Fix context paths (category 163's context is id=429, path=/1/429)
UPDATE mdl_context SET path = '/1/429/450', depth = 3 WHERE id = 450;       -- cat 176
UPDATE mdl_context SET path = '/1/429/450/451', depth = 4 WHERE id = 451;   -- cat 177
UPDATE mdl_context SET path = '/1/429/450/452', depth = 4 WHERE id = 452;   -- cat 178
UPDATE mdl_context SET path = '/1/429/450/451/453', depth = 5 WHERE id = 453; -- cat 179
UPDATE mdl_context SET path = '/1/429/450/451/454', depth = 5 WHERE id = 454; -- cat 180
UPDATE mdl_context SET path = '/1/429/450/452/455', depth = 5 WHERE id = 455; -- cat 181
UPDATE mdl_context SET path = '/1/429/450/452/456', depth = 5 WHERE id = 456; -- cat 182

-- Fix course context paths
UPDATE mdl_context SET path = CONCAT('/1/429/450/451/453/', id), depth = 6 WHERE id BETWEEN 457 AND 460;
UPDATE mdl_context SET path = CONCAT('/1/429/450/451/454/', id), depth = 6 WHERE id BETWEEN 461 AND 464;
UPDATE mdl_context SET path = CONCAT('/1/429/450/452/455/', id), depth = 6 WHERE id BETWEEN 465 AND 468;
UPDATE mdl_context SET path = CONCAT('/1/429/450/452/456/', id), depth = 6 WHERE id BETWEEN 469 AND 472;

-- Fix module context paths
UPDATE mdl_context mc
JOIN mdl_course_modules cm ON cm.id = mc.instanceid
JOIN mdl_context cc ON cc.instanceid = cm.course AND cc.contextlevel = 50
SET mc.path = CONCAT(cc.path, '/', mc.id), mc.depth = cc.depth + 1
WHERE mc.contextlevel = 70 AND cm.course BETWEEN 189 AND 204;
