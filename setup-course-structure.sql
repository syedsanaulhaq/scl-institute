-- Simplified course content for MBA-BA-001

-- Get course ID
SET @course_id = (SELECT id FROM mdl_course WHERE shortname = 'MBA-BA-001');

-- Update course to have 5 topics/sections
UPDATE mdl_course SET numsections = 5, format = 'topics' WHERE id = @course_id;

-- Verify sections exist (create if needed)
INSERT IGNORE INTO mdl_course_sections (course, section, name, summary, summaryformat, visible, timemodified) VALUES
(@course_id, 0, '', '', 1, 1, UNIX_TIMESTAMP()),
(@course_id, 1, 'Week 1: Introduction to Business', 'Business fundamentals and principles', 1, 1, UNIX_TIMESTAMP()),
(@course_id, 2, 'Week 2: Strategic Management', 'Planning and decision-making', 1, 1, UNIX_TIMESTAMP()),
(@course_id, 3, 'Week 3: Financial Management', 'Finance and accounting basics', 1, 1, UNIX_TIMESTAMP()),
(@course_id, 4, 'Week 4: Marketing', 'Marketing strategies and customer relations', 1, 1, UNIX_TIMESTAMP()),
(@course_id, 5, 'Week 5: Human Resources', 'People management and organizational behavior', 1, 1, UNIX_TIMESTAMP());

SELECT 'Course structure updated!' as status, @course_id as course_id;
