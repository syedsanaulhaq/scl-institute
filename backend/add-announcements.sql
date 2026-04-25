-- Add news forums and announcements to Moodle courses
-- Announcements are stored as forum discussions/posts in the "news" forum type

-- Step 1: Create news forums for each course (if not exists)
INSERT INTO mdl_forum (course, name, intro, introformat, type, assessed, assesstimestart, assesstimeend, scale, maxbytes, forcesubscribe, trackingtype, ratingbias, moodleonline, completiondiscussions, completionreplies, completionposts, displaywordcount, lockdiscussionafter, timemodified, cmid)
SELECT DISTINCT c.id, 'Announcements', '', 0, 'news', 0, 0, 0, 0, -1, 2, 0, 0, 0, 0, 0, 0, 0, 0, UNIX_TIMESTAMP(NOW()), 0
FROM mdl_course c
WHERE c.id > 1 
AND NOT EXISTS (SELECT 1 FROM mdl_forum f WHERE f.course = c.id AND f.type = 'news')
LIMIT 5;

-- Step 2: Get the course and forum info for announcements
SET @now = UNIX_TIMESTAMP(NOW());

-- Add announcements to each news forum
INSERT INTO mdl_forum_discussions (forum, name, firstpost, userid, modified, timestart, timeend)
SELECT 
  f.id,
  CONCAT('Announcement: ', CASE WHEN ROW_NUMBER() OVER (PARTITION BY f.id) = 1 THEN 'Welcome to Course'
                              WHEN ROW_NUMBER() OVER (PARTITION BY f.id) = 2 THEN 'Assignment Submission Guidelines'
                              WHEN ROW_NUMBER() OVER (PARTITION BY f.id) = 3 THEN 'Course Materials Available'
                              ELSE 'Course Update' END),
  0,
  2,
  @now - (ROW_NUMBER() OVER (PARTITION BY f.id) - 1) * 86400,
  0,
  0
FROM mdl_forum f
WHERE f.type = 'news' AND f.course > 1
LIMIT 15;

-- Step 3: Add posts for each discussion
INSERT INTO mdl_forum_posts (discussion, parent, userid, created, modified, subject, message, messageformat, mailnow)
SELECT
  d.id,
  0,
  2,
  @now - (CASE WHEN d.name LIKE '%Welcome%' THEN 0 WHEN d.name LIKE '%Guidelines%' THEN 86400 ELSE 172800 END),
  @now - (CASE WHEN d.name LIKE '%Welcome%' THEN 0 WHEN d.name LIKE '%Guidelines%' THEN 86400 ELSE 172800 END),
  d.name,
  CASE 
    WHEN d.name LIKE '%Welcome%' THEN '<p>Welcome to this course! We are excited to have you enrolled. Please take time to explore the course content and familiarize yourself with the structure. If you have any questions, feel free to post in the discussion forums.</p>'
    WHEN d.name LIKE '%Guidelines%' THEN '<p>Please follow these guidelines when submitting assignments: (1) Submit before the deadline, (2) Use the assignment submission tool, (3) Keep file sizes under 50MB, (4) Name your files clearly. Contact your instructor if you have technical issues.</p>'
    WHEN d.name LIKE '%Materials%' THEN '<p>All course materials have been uploaded to the course resources section. This includes lecture slides, reading materials, and supplementary resources. You can access them in the Resources tab at any time.</p>'
    ELSE '<p>Important update: Please check the course schedule for the latest information about upcoming assessments and events. Thank you for your attention to detail.</p>'
  END,
  1,
  0
FROM mdl_forum_discussions d
WHERE d.firstpost = 0
LIMIT 15;

-- Step 4: Update discussions with firstpost ID
UPDATE mdl_forum_discussions d
SET d.firstpost = (SELECT id FROM mdl_forum_posts fp WHERE fp.discussion = d.id LIMIT 1)
WHERE d.firstpost = 0 AND d.id IN (
  SELECT d2.id FROM mdl_forum_discussions d2 WHERE d2.forum IN (SELECT id FROM mdl_forum WHERE type = 'news')
);
