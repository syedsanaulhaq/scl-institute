-- Add sample course content to MBA-BA-001 course

-- Get the course ID for MBA-BA-001
SET @course_id = (SELECT id FROM mdl_course WHERE shortname = 'MBA-BA-001');

-- Create sections (weeks/topics)
INSERT INTO mdl_course_sections (course, section, name, summary, summaryformat, sequence, visible) VALUES
(@course_id, 1, 'Introduction to Business Administration', 'Overview of business fundamentals and management principles', 1, '', 1),
(@course_id, 2, 'Strategic Management', 'Learn strategic planning and decision-making processes', 1, '', 1),
(@course_id, 3, 'Financial Management', 'Understanding financial statements and business finance', 1, '', 1),
(@course_id, 4, 'Marketing Principles', 'Core concepts of marketing and customer relationship management', 1, '', 1),
(@course_id, 5, 'Human Resource Management', 'Managing people and organizational behavior', 1, '', 1);

-- Add Page module for content
INSERT INTO mdl_page (course, name, intro, introformat, content, contentformat, legacyfiles, legacyfileslast, display, displayoptions, revision, timemodified, timecreated) VALUES
(@course_id, 'Course Overview and Syllabus', 'Welcome to MBA Business Administration', 1, 
'<h2>Course Overview</h2><p>This course provides a comprehensive introduction to business administration, covering key areas such as:</p><ul><li>Strategic Planning</li><li>Financial Management</li><li>Marketing Strategies</li><li>Human Resources</li><li>Operations Management</li></ul><h3>Learning Outcomes</h3><p>Upon completion, you will be able to:</p><ol><li>Understand core business principles</li><li>Analyze financial statements</li><li>Develop marketing strategies</li><li>Manage teams effectively</li></ol>', 
1, 0, NULL, 5, '', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

SET @page_id = LAST_INSERT_ID();

-- Add course module for the page
INSERT INTO mdl_course_modules (course, module, instance, section, idnumber, added, score, indent, visible, visibleoncoursepage, visibleold, groupmode, groupingid, completion, completionview, completionexpected, completiongradeitemnumber, showdescription, availability, deletioninprogress, downloadcontent, lang) VALUES
(@course_id, (SELECT id FROM mdl_modules WHERE name='page'), @page_id, (SELECT id FROM mdl_course_sections WHERE course=@course_id AND section=1), '', UNIX_TIMESTAMP(), 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, NULL, 0, NULL, 0, 1, '');

-- Add Quiz
INSERT INTO mdl_quiz (course, name, intro, introformat, timeopen, timeclose, timelimit, overduehandling, graceperiod, preferredbehaviour, canredoquestions, attempts, attemptonlast, grademethod, decimalpoints, questiondecimalpoints, reviewattempt, reviewcorrectness, reviewmarks, reviewspecificfeedback, reviewgeneralfeedback, reviewrightanswer, reviewoverallfeedback, questionsperpage, navmethod, shuffleanswers, sumgrades, grade, timecreated, timemodified, password, subnet, browsersecurity, delay1, delay2, showuserpicture, showblocks, completionattemptsexhausted, completionpass, allowofflineattempts, autosaveperiod, hasquestions, overduehandlingautosave) VALUES
(@course_id, 'Week 1 Quiz: Business Fundamentals', 'Test your understanding of basic business concepts', 1, 0, 0, 0, 'autosubmit', 0, 'deferredfeedback', 0, 0, 0, 1, 2, 2, 65552, 65552, 65552, 65552, 65552, 65552, 65552, 1, 'free', 1, 10.00, 10.00, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), '', '', '', 0, 0, 0, 0, 0, 0, 0, 60, 0, 'infoitemsubmit');

SET @quiz_id = LAST_INSERT_ID();

INSERT INTO mdl_course_modules (course, module, instance, section, idnumber, added, score, indent, visible, visibleoncoursepage, visibleold, groupmode, groupingid, completion, completionview, completionexpected, completiongradeitemnumber, showdescription, availability, deletioninprogress, downloadcontent, lang) VALUES
(@course_id, (SELECT id FROM mdl_modules WHERE name='quiz'), @quiz_id, (SELECT id FROM mdl_course_sections WHERE course=@course_id AND section=1), '', UNIX_TIMESTAMP(), 0, 0, 1, 1, 1, 0, 0, 2, 0, 0, 0, 1, NULL, 0, 1, '');

-- Add Assignment
INSERT INTO mdl_assign (course, name, intro, introformat, alwaysshowdescription, nosubmissions, submissiondrafts, sendnotifications, sendlatenotifications, sendstudentnotifications, duedate, allowsubmissionsfromdate, grade, timemodified, requiresubmissionstatement, completionsubmit, cutoffdate, gradingduedate, teamsubmission, requireallteammemberssubmit, teamsubmissiongroupingid, blindmarking, hidegrader, revealidentities, attemptreopenmethod, maxattempts, markingworkflow, markingallocation, sendstudentnotifications, preventsubmissionnotingroup, activity, activityformat) VALUES
(@course_id, 'Assignment 1: Business Case Study Analysis', 'Analyze the provided business case and submit a 2000-word report', 1, 1, 0, 0, 0, 1, 1, UNIX_TIMESTAMP() + (7 * 24 * 3600), UNIX_TIMESTAMP(), 100.00, UNIX_TIMESTAMP(), 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 'none', -1, 0, 0, 1, 0, '', 0);

SET @assign_id = LAST_INSERT_ID();

INSERT INTO mdl_course_modules (course, module, instance, section, idnumber, added, score, indent, visible, visibleoncoursepage, visibleold, groupmode, groupingid, completion, completionview, completionexpected, completiongradeitemnumber, showdescription, availability, deletioninprogress, downloadcontent, lang) VALUES
(@course_id, (SELECT id FROM mdl_modules WHERE name='assign'), @assign_id, (SELECT id FROM mdl_course_sections WHERE course=@course_id AND section=2), '', UNIX_TIMESTAMP(), 0, 0, 1, 1, 1, 0, 0, 2, 0, 0, 0, 1, NULL, 0, 1, '');

-- Update course format to show these sections
UPDATE mdl_course SET format = 'topics', numsections = 5 WHERE id = @course_id;

SELECT 'Course content added successfully!' as status;
