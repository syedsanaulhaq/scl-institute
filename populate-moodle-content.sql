-- ============================================================
-- Populate Moodle HND L&M Courses (189-204) with Content
-- Adds: Sections, Announcements Forum, Assignments, Quizzes
-- ============================================================

SET @now = UNIX_TIMESTAMP();
SET @week1 = @now;
SET @week2 = @now + 604800;
SET @week3 = @now + 1209600;
SET @week4 = @now + 1814400;
SET @dueweek2 = @now + 1209600;
SET @dueweek4 = @now + 2419200;
SET @dueweek6 = @now + 3628800;

-- ============================================================
-- COURSE SECTIONS (Topic 0 = General, 1-4 = Weekly Topics)
-- ============================================================

-- Course content mapping (courseId => unit name already in fullname)
-- We'll create 5 sections per course: General + 4 topic weeks

INSERT INTO mdl_course_sections (course, section, name, summary, summaryformat, sequence, visible, timemodified)
SELECT c.id, 0, 'General', CONCAT('<p>Welcome to <strong>', c.fullname, '</strong>. This section contains important announcements and course resources.</p>'), 1, '', 1, @now
FROM mdl_course c WHERE c.id BETWEEN 189 AND 204
ON DUPLICATE KEY UPDATE name = VALUES(name), summary = VALUES(summary);

INSERT INTO mdl_course_sections (course, section, name, summary, summaryformat, sequence, visible, timemodified)
SELECT c.id, 1, 'Week 1-2: Introduction & Foundations',
CONCAT('<p>Introduction to core concepts of ', c.fullname, '. Reading materials and foundational theory.</p>'), 1, '', 1, @now
FROM mdl_course c WHERE c.id BETWEEN 189 AND 204;

INSERT INTO mdl_course_sections (course, section, name, summary, summaryformat, sequence, visible, timemodified)
SELECT c.id, 2, 'Week 3-4: Core Theory & Application',
CONCAT('<p>Deep dive into key theories and practical applications in ', c.fullname, '.</p>'), 1, '', 1, @now
FROM mdl_course c WHERE c.id BETWEEN 189 AND 204;

INSERT INTO mdl_course_sections (course, section, name, summary, summaryformat, sequence, visible, timemodified)
SELECT c.id, 3, 'Week 5-6: Case Studies & Analysis',
'<p>Real-world case studies, group discussions, and analytical exercises.</p>', 1, '', 1, @now
FROM mdl_course c WHERE c.id BETWEEN 189 AND 204;

INSERT INTO mdl_course_sections (course, section, name, summary, summaryformat, sequence, visible, timemodified)
SELECT c.id, 4, 'Week 7-8: Assessment & Review',
'<p>Final assessments, revision materials, and course summary.</p>', 1, '', 1, @now
FROM mdl_course c WHERE c.id BETWEEN 189 AND 204;

-- ============================================================
-- ANNOUNCEMENTS FORUM (one per course in section 0)
-- ============================================================

INSERT INTO mdl_forum (course, type, name, intro, introformat, timemodified)
SELECT c.id, 'news', 'Announcements',
CONCAT('<p>Important announcements for ', c.fullname, '</p>'), 1, @now
FROM mdl_course c WHERE c.id BETWEEN 189 AND 204;

-- Course modules for forums
INSERT INTO mdl_course_modules (course, module, instance, section, added, visible, visibleoncoursepage)
SELECT f.course, 9, f.id,
  (SELECT cs.id FROM mdl_course_sections cs WHERE cs.course = f.course AND cs.section = 0 LIMIT 1),
  @now, 1, 1
FROM mdl_forum f
WHERE f.course BETWEEN 189 AND 204 AND f.type = 'news'
AND f.id > 91;

-- Update section 0 sequence with forum course_module IDs
UPDATE mdl_course_sections cs
JOIN (
  SELECT cm.course, cm.id as cmid
  FROM mdl_course_modules cm
  JOIN mdl_forum f ON cm.instance = f.id AND cm.module = 9
  WHERE f.course BETWEEN 189 AND 204 AND f.type = 'news' AND f.id > 91
) t ON cs.course = t.course AND cs.section = 0
SET cs.sequence = t.cmid;

-- Forum discussions (announcements)
INSERT INTO mdl_forum_discussions (course, forum, name, firstpost, userid, groupid, assessed, timemodified, usermodified, timestart, timeend, pinned)
SELECT f.course, f.id,
  CONCAT('Welcome to ', c.fullname),
  0, 2, -1, 0, @now, 2, 0, 0, 1
FROM mdl_forum f
JOIN mdl_course c ON f.course = c.id
WHERE f.course BETWEEN 189 AND 204 AND f.type = 'news' AND f.id > 91;

-- Forum posts for each discussion
INSERT INTO mdl_forum_posts (discussion, parent, userid, created, modified, subject, message, messageformat, messagetrust)
SELECT d.id, 0, 2, @now, @now,
  d.name,
  CONCAT('<p>Dear Students,</p><p>Welcome to <strong>', c.fullname, '</strong> for the October 2026 intake.</p>',
  '<p>Please review the course outline and familiarise yourself with the assessment schedule. All assignments must be submitted via Moodle by the specified deadlines.</p>',
  '<p>Key dates:</p><ul>',
  '<li>Assignment 1 due: Week 4</li>',
  '<li>Mid-term Quiz: Week 6</li>',
  '<li>Final Assignment due: Week 8</li>',
  '</ul><p>Best regards,<br>Course Tutor</p>'), 1, 0
FROM mdl_forum_discussions d
JOIN mdl_course c ON d.course = c.id
WHERE d.course BETWEEN 189 AND 204 AND d.timemodified = @now;

-- Update firstpost in discussions
UPDATE mdl_forum_discussions d
JOIN mdl_forum_posts p ON p.discussion = d.id
SET d.firstpost = p.id
WHERE d.course BETWEEN 189 AND 204 AND d.firstpost = 0;

-- Second announcement per course
INSERT INTO mdl_forum_discussions (course, forum, name, firstpost, userid, groupid, assessed, timemodified, usermodified, timestart, timeend, pinned)
SELECT f.course, f.id,
  'Assessment Guidelines & Submission Requirements',
  0, 2, -1, 0, @now + 100, 2, 0, 0, 0
FROM mdl_forum f
JOIN mdl_course c ON f.course = c.id
WHERE f.course BETWEEN 189 AND 204 AND f.type = 'news' AND f.id > 91;

INSERT INTO mdl_forum_posts (discussion, parent, userid, created, modified, subject, message, messageformat, messagetrust)
SELECT d.id, 0, 2, @now + 100, @now + 100,
  d.name,
  CONCAT('<p>Please note the following assessment requirements for <strong>', c.fullname, '</strong>:</p>',
  '<ul>',
  '<li>All assignments must be submitted in PDF format through Moodle</li>',
  '<li>Use Harvard referencing style with a minimum of 8 academic sources</li>',
  '<li>Word count: 2,000-2,500 words per assignment</li>',
  '<li>Plagiarism over 15% will result in referral</li>',
  '<li>Late submissions will incur a 5% penalty per day (max 5 days)</li>',
  '</ul>',
  '<p>If you have any questions about assessments, please contact your module tutor during office hours.</p>'), 1, 0
FROM mdl_forum_discussions d
JOIN mdl_course c ON d.course = c.id
WHERE d.course BETWEEN 189 AND 204 AND d.firstpost = 0 AND d.timemodified = @now + 100;

UPDATE mdl_forum_discussions d
JOIN mdl_forum_posts p ON p.discussion = d.id
SET d.firstpost = p.id
WHERE d.course BETWEEN 189 AND 204 AND d.firstpost = 0;

-- ============================================================
-- ASSIGNMENTS (2 per course: 1 in section 2, 1 in section 4)
-- ============================================================

-- Assignment 1: placed in section 2 (Week 3-4)
INSERT INTO mdl_assign (course, name, intro, introformat, alwaysshowdescription, nosubmissions, submissiondrafts, sendnotifications, sendlatenotifications, duedate, allowsubmissionsfromdate, grade, timemodified, requiresubmissionstatement, completionsubmit, markingworkflow, markingallocation)
SELECT c.id,
  CONCAT(c.fullname, ' - Assignment 1: Research Report'),
  CONCAT('<h4>Assignment 1: Research Report</h4>',
  '<p>Write a comprehensive research report on a key topic within <strong>', c.fullname, '</strong>.</p>',
  '<h5>Requirements:</h5>',
  '<ul>',
  '<li>Word count: 2,000 - 2,500 words</li>',
  '<li>Include at least 8 academic references (Harvard style)</li>',
  '<li>Structure: Introduction, Literature Review, Analysis, Conclusion, References</li>',
  '<li>Submit as PDF via Moodle</li>',
  '</ul>',
  '<h5>Learning Outcomes Assessed:</h5>',
  '<ul><li>LO1: Demonstrate understanding of core concepts</li>',
  '<li>LO2: Apply theoretical frameworks to practical scenarios</li></ul>',
  '<p><strong>Weighting: 40% of module grade</strong></p>'),
  1, 1, 0, 0, 1, 0, @dueweek4, @week1, 100, @now, 0, 0, 0, 0
FROM mdl_course c WHERE c.id BETWEEN 189 AND 204;

-- Assignment 2: placed in section 4 (Week 7-8)
INSERT INTO mdl_assign (course, name, intro, introformat, alwaysshowdescription, nosubmissions, submissiondrafts, sendnotifications, sendlatenotifications, duedate, allowsubmissionsfromdate, grade, timemodified, requiresubmissionstatement, completionsubmit, markingworkflow, markingallocation)
SELECT c.id,
  CONCAT(c.fullname, ' - Assignment 2: Case Study Analysis'),
  CONCAT('<h4>Assignment 2: Case Study Analysis</h4>',
  '<p>Analyse the provided case study applying concepts from <strong>', c.fullname, '</strong>.</p>',
  '<h5>Requirements:</h5>',
  '<ul>',
  '<li>Word count: 2,500 - 3,000 words</li>',
  '<li>Include at least 10 academic references (Harvard style)</li>',
  '<li>Apply at least 3 theoretical models/frameworks</li>',
  '<li>Include recommendations section</li>',
  '<li>Submit as PDF via Moodle</li>',
  '</ul>',
  '<h5>Learning Outcomes Assessed:</h5>',
  '<ul><li>LO3: Critically analyse real-world business scenarios</li>',
  '<li>LO4: Propose evidence-based recommendations</li></ul>',
  '<p><strong>Weighting: 60% of module grade</strong></p>'),
  1, 1, 0, 0, 1, 0, @dueweek6, @week3, 100, @now, 0, 0, 0, 0
FROM mdl_course c WHERE c.id BETWEEN 189 AND 204;

-- Course modules for Assignment 1 (section 2)
INSERT INTO mdl_course_modules (course, module, instance, section, added, visible, visibleoncoursepage)
SELECT a.course, 1, a.id,
  (SELECT cs.id FROM mdl_course_sections cs WHERE cs.course = a.course AND cs.section = 2 LIMIT 1),
  @now, 1, 1
FROM mdl_assign a
WHERE a.course BETWEEN 189 AND 204 AND a.name LIKE '%Assignment 1%';

-- Course modules for Assignment 2 (section 4)
INSERT INTO mdl_course_modules (course, module, instance, section, added, visible, visibleoncoursepage)
SELECT a.course, 1, a.id,
  (SELECT cs.id FROM mdl_course_sections cs WHERE cs.course = a.course AND cs.section = 4 LIMIT 1),
  @now, 1, 1
FROM mdl_assign a
WHERE a.course BETWEEN 189 AND 204 AND a.name LIKE '%Assignment 2%';

-- ============================================================
-- QUIZZES (1 per course in section 3)
-- ============================================================

INSERT INTO mdl_quiz (course, name, intro, introformat, timeopen, timeclose, timelimit, preferredbehaviour, attempts, grademethod, decimalpoints, questiondecimalpoints, sumgrades, grade, timecreated, timemodified)
SELECT c.id,
  CONCAT(c.fullname, ' - Mid-Term Quiz'),
  CONCAT('<h4>Mid-Term Knowledge Check</h4>',
  '<p>This quiz covers the key concepts from Weeks 1-6 of <strong>', c.fullname, '</strong>.</p>',
  '<ul>',
  '<li>Duration: 45 minutes</li>',
  '<li>Questions: 20 multiple choice + 5 short answer</li>',
  '<li>Attempts: 1</li>',
  '<li>Covers all topics from Weeks 1-6</li>',
  '</ul>',
  '<p><strong>This quiz contributes 20% to your overall module grade.</strong></p>'),
  1, @week3, @week4, 2700, 'deferredfeedback', 1, 1, 2, -1, 100.00, 100.00, @now, @now
FROM mdl_course c WHERE c.id BETWEEN 189 AND 204;

-- Course modules for quizzes (section 3)
INSERT INTO mdl_course_modules (course, module, instance, section, added, visible, visibleoncoursepage)
SELECT q.course, 17, q.id,
  (SELECT cs.id FROM mdl_course_sections cs WHERE cs.course = q.course AND cs.section = 3 LIMIT 1),
  @now, 1, 1
FROM mdl_quiz q
WHERE q.course BETWEEN 189 AND 204;

-- ============================================================
-- UPDATE SECTION SEQUENCES (link course_modules to sections)
-- ============================================================

-- Section 2: Add assignment 1 course_modules
UPDATE mdl_course_sections cs
JOIN (
  SELECT cm.section, GROUP_CONCAT(cm.id ORDER BY cm.id) as cmids
  FROM mdl_course_modules cm
  JOIN mdl_assign a ON cm.instance = a.id AND cm.module = 1
  WHERE a.course BETWEEN 189 AND 204 AND a.name LIKE '%Assignment 1%'
  GROUP BY cm.section
) t ON cs.id = t.section
SET cs.sequence = CASE WHEN cs.sequence = '' OR cs.sequence IS NULL THEN t.cmids ELSE CONCAT(cs.sequence, ',', t.cmids) END;

-- Section 3: Add quiz course_modules
UPDATE mdl_course_sections cs
JOIN (
  SELECT cm.section, GROUP_CONCAT(cm.id ORDER BY cm.id) as cmids
  FROM mdl_course_modules cm
  JOIN mdl_quiz q ON cm.instance = q.id AND cm.module = 17
  WHERE q.course BETWEEN 189 AND 204
  GROUP BY cm.section
) t ON cs.id = t.section
SET cs.sequence = CASE WHEN cs.sequence = '' OR cs.sequence IS NULL THEN t.cmids ELSE CONCAT(cs.sequence, ',', t.cmids) END;

-- Section 4: Add assignment 2 course_modules
UPDATE mdl_course_sections cs
JOIN (
  SELECT cm.section, GROUP_CONCAT(cm.id ORDER BY cm.id) as cmids
  FROM mdl_course_modules cm
  JOIN mdl_assign a ON cm.instance = a.id AND cm.module = 1
  WHERE a.course BETWEEN 189 AND 204 AND a.name LIKE '%Assignment 2%'
  GROUP BY cm.section
) t ON cs.id = t.section
SET cs.sequence = CASE WHEN cs.sequence = '' OR cs.sequence IS NULL THEN t.cmids ELSE CONCAT(cs.sequence, ',', t.cmids) END;

-- ============================================================
-- CONTEXTS for course modules (needed for Moodle to display them)
-- ============================================================

INSERT INTO mdl_context (contextlevel, instanceid, path, depth)
SELECT 70, cm.id,
  CONCAT((SELECT ctx.path FROM mdl_context ctx WHERE ctx.contextlevel = 50 AND ctx.instanceid = cm.course LIMIT 1), '/', 0),
  (SELECT ctx.depth + 1 FROM mdl_context ctx WHERE ctx.contextlevel = 50 AND ctx.instanceid = cm.course LIMIT 1)
FROM mdl_course_modules cm
WHERE cm.course BETWEEN 189 AND 204 AND cm.id > 100;

-- Fix context paths (self-referencing)
UPDATE mdl_context ctx
SET ctx.path = REPLACE(ctx.path, '/0', CONCAT('/', ctx.id))
WHERE ctx.contextlevel = 70 AND ctx.instanceid > 100 AND ctx.path LIKE '%/0';

-- ============================================================
-- CLEAR CACHES
-- ============================================================
DELETE FROM mdl_cache_flags;
DELETE FROM mdl_cache_filters;

SELECT 'DONE: Content populated for 16 courses' as status;
