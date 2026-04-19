-- Seed Moodle calendar events, notifications, and announcements for active HND L&M courses
-- Active courses: 189 (Business Env), 190 (Marketing), 191 (HR), 192 (L&M)
-- James Parker: Moodle user ID 43
-- Admin user: ID 2

SET @now = UNIX_TIMESTAMP(NOW());
SET @day = 86400;
SET @userid = 43;
SET @adminid = 2;

-- ============================================================
-- 1. CALENDAR EVENTS (assignments due, quiz opens, course events)
-- ============================================================

-- Assignment 1 deadlines (due in 5-8 days)
INSERT INTO mdl_event (name, description, format, courseid, userid, modulename, instance, type, eventtype, timestart, timeduration, timesort, timemodified, uuid)
VALUES
('Assignment 1: Research Report is due', '<p>Submit your Research Report for The Contemporary Business Environment. Ensure all references follow Harvard referencing style.</p>', 1, 189, 0, 'assign', 1, 1, 'due', @now + 5*@day, 0, @now + 5*@day, @now, UUID()),
('Assignment 1: Research Report is due', '<p>Submit your Research Report for Marketing Processes and Planning. Include market analysis and strategic recommendations.</p>', 1, 190, 0, 'assign', 2, 1, 'due', @now + 6*@day, 0, @now + 6*@day, @now, UUID()),
('Assignment 1: Research Report is due', '<p>Submit your Research Report for Management of Human Resources. Cover recruitment, selection, and retention strategies.</p>', 1, 191, 0, 'assign', 3, 1, 'due', @now + 7*@day, 0, @now + 7*@day, @now, UUID()),
('Assignment 1: Research Report is due', '<p>Submit your Research Report for Leadership and Management. Analyse leadership theories with real-world examples.</p>', 1, 192, 0, 'assign', 4, 1, 'due', @now + 8*@day, 0, @now + 8*@day, @now, UUID());

-- Mid-term quizzes (opening in 10-14 days)
INSERT INTO mdl_event (name, description, format, courseid, userid, modulename, instance, type, eventtype, timestart, timeduration, timesort, timemodified, uuid)
VALUES
('Mid-Term Quiz opens', '<p>The Contemporary Business Environment mid-term quiz is now available. 30 questions, 60 minutes. One attempt only.</p>', 1, 189, 0, 'quiz', 1, 1, 'open', @now + 10*@day, 3600, @now + 10*@day, @now, UUID()),
('Mid-Term Quiz opens', '<p>Marketing Processes and Planning mid-term quiz. Covers weeks 1-5 material. 25 questions, 45 minutes.</p>', 1, 190, 0, 'quiz', 2, 1, 'open', @now + 12*@day, 3600, @now + 12*@day, @now, UUID()),
('Mid-Term Quiz opens', '<p>Management of Human Resources mid-term quiz. Focus on employment law and HR practices. 20 questions, 40 minutes.</p>', 1, 191, 0, 'quiz', 3, 1, 'open', @now + 13*@day, 3600, @now + 13*@day, @now, UUID()),
('Mid-Term Quiz opens', '<p>Leadership and Management mid-term quiz. Covers leadership styles, motivation theories. 25 questions, 50 minutes.</p>', 1, 192, 0, 'quiz', 4, 1, 'open', @now + 14*@day, 3600, @now + 14*@day, @now, UUID());

-- Assignment 2 deadlines (due in 21-28 days)
INSERT INTO mdl_event (name, description, format, courseid, userid, modulename, instance, type, eventtype, timestart, timeduration, timesort, timemodified, uuid)
VALUES
('Assignment 2: Case Study Analysis is due', '<p>Case study analysis for The Contemporary Business Environment. 3000 words, include PESTLE and SWOT frameworks.</p>', 1, 189, 0, 'assign', 32, 1, 'due', @now + 21*@day, 0, @now + 21*@day, @now, UUID()),
('Assignment 2: Case Study Analysis is due', '<p>Case study analysis for Marketing Processes and Planning. Apply the marketing mix to a real organisation.</p>', 1, 190, 0, 'assign', 33, 1, 'due', @now + 23*@day, 0, @now + 23*@day, @now, UUID()),
('Assignment 2: Case Study Analysis is due', '<p>Case study analysis for Management of Human Resources. Evaluate HR strategies in a multinational company.</p>', 1, 191, 0, 'assign', 34, 1, 'due', @now + 25*@day, 0, @now + 25*@day, @now, UUID()),
('Assignment 2: Case Study Analysis is due', '<p>Case study analysis for Leadership and Management. Critically analyse change management approaches.</p>', 1, 192, 0, 'assign', 35, 1, 'due', @now + 28*@day, 0, @now + 28*@day, @now, UUID());

-- Course-level events (workshops/seminars in next 2-3 days)
INSERT INTO mdl_event (name, description, format, courseid, userid, modulename, instance, type, eventtype, timestart, timeduration, timesort, timemodified, uuid)
VALUES
('Guest Lecture: Industry Insights', '<p>Guest speaker from Deloitte discussing current business environment trends. Room 2.14, Main Campus.</p>', 1, 189, 0, '', 0, 1, 'course', @now + 2*@day, 5400, @now + 2*@day, @now, UUID()),
('Workshop: Marketing Plan Development', '<p>Hands-on workshop to develop your marketing plan draft. Bring your laptop and course materials.</p>', 1, 190, 0, '', 0, 1, 'course', @now + 3*@day, 7200, @now + 3*@day, @now, UUID());

-- ============================================================
-- 2. NOTIFICATIONS for James Parker (user 43)
-- ============================================================

INSERT INTO mdl_notifications (useridfrom, useridto, subject, fullmessage, fullmessageformat, fullmessagehtml, smallmessage, component, eventtype, timecreated, timeread)
VALUES
-- Course welcome notifications
(@adminid, @userid, 'Welcome to The Contemporary Business Environment', 'Welcome to your course! Please review the course outline and begin with Week 1 materials.', 1, '<p>Welcome to your course! Please review the course outline and begin with Week 1 materials.</p>', 'Welcome to The Contemporary Business Environment', 'moodle', 'coursewelcome', @now - 2*@day, NULL),
(@adminid, @userid, 'Welcome to Marketing Processes and Planning', 'Welcome! Start by reading the course introduction in the General section.', 1, '<p>Welcome! Start by reading the course introduction in the General section.</p>', 'Welcome to Marketing Processes and Planning', 'moodle', 'coursewelcome', @now - 2*@day, NULL),
(@adminid, @userid, 'Welcome to Management of Human Resources', 'Welcome to HR Management. Your first assignment brief is now available.', 1, '<p>Welcome to HR Management. Your first assignment brief is now available.</p>', 'Welcome to Management of Human Resources', 'moodle', 'coursewelcome', @now - 2*@day, NULL),
(@adminid, @userid, 'Welcome to Leadership and Management', 'Welcome! Begin with the leadership self-assessment activity in Week 1.', 1, '<p>Welcome! Begin with the leadership self-assessment activity in Week 1.</p>', 'Welcome to Leadership and Management', 'moodle', 'coursewelcome', @now - 2*@day, NULL),

-- Assignment reminders (unread)
(@adminid, @userid, 'Assignment due soon: Research Report - Business Environment', 'Your Research Report for The Contemporary Business Environment is due in 5 days. Please ensure it is submitted via Moodle.', 1, '<p>Your Research Report for The Contemporary Business Environment is due in <strong>5 days</strong>. Please ensure it is submitted via Moodle.</p>', 'Research Report due in 5 days', 'mod_assign', 'assign_notification', @now - 3600, NULL),
(@adminid, @userid, 'Assignment due soon: Research Report - Marketing', 'Your Research Report for Marketing Processes and Planning is due in 6 days.', 1, '<p>Your Research Report for Marketing Processes and Planning is due in <strong>6 days</strong>.</p>', 'Marketing Research Report due in 6 days', 'mod_assign', 'assign_notification', @now - 1800, NULL),

-- Quiz availability notifications (unread)
(@adminid, @userid, 'Mid-Term Quiz available in 10 days', 'The mid-term quiz for The Contemporary Business Environment will open in 10 days. Review Weeks 1-5 material to prepare.', 1, '<p>The mid-term quiz for The Contemporary Business Environment will open in <strong>10 days</strong>. Review Weeks 1-5 material to prepare.</p>', 'Business Environment Mid-Term Quiz reminder', 'mod_quiz', 'attempt', @now - 7200, NULL),

-- Forum notification (unread)
(@adminid, @userid, 'New forum post in Announcements', 'A new announcement has been posted in The Contemporary Business Environment. Check the course page for details.', 1, '<p>A new announcement has been posted in The Contemporary Business Environment. Check the course page for details.</p>', 'New announcement posted', 'mod_forum', 'post', @now - 10800, NULL),

-- Profile update (already read)
(@adminid, @userid, 'Your Moodle profile has been updated', 'Your user profile has been created and you have been enrolled in your HND Leadership and Management courses.', 1, '<p>Your user profile has been created and you have been enrolled in your HND Leadership and Management courses.</p>', 'Profile updated - courses enrolled', 'moodle', 'messagecontactrequests', @now - 3*@day, @now - 2*@day);

-- ============================================================
-- 3. ANNOUNCEMENT FORUM POSTS (news forums for active courses)
-- Forum IDs: 92 (course 189), 93 (course 190), 94 (course 191), 95 (course 192)
-- ============================================================

INSERT INTO mdl_forum_discussions (course, forum, name, userid, timemodified, usermodified, timestart, timeend)
VALUES
(189, 92, 'Assignment 1 Brief Released - Research Report', @adminid, @now - 1*@day, @adminid, 0, 0),
(189, 92, 'Guest Lecture This Week - Deloitte Industry Talk', @adminid, @now - 3600, @adminid, 0, 0),
(190, 93, 'Marketing Plan Template Now Available', @adminid, @now - 2*@day, @adminid, 0, 0),
(190, 93, 'Workshop Reminder: Marketing Plan Development', @adminid, @now - 7200, @adminid, 0, 0),
(191, 94, 'Week 3-4 Reading List Updated', @adminid, @now - 3*@day, @adminid, 0, 0),
(191, 94, 'HR Case Study Resources Added', @adminid, @now - 4*3600, @adminid, 0, 0),
(192, 95, 'Leadership Self-Assessment Due This Week', @adminid, @now - 2*@day, @adminid, 0, 0),
(192, 95, 'Recommended Reading: Leadership Styles', @adminid, @now - 5*3600, @adminid, 0, 0);

SET @disc_start = LAST_INSERT_ID();

INSERT INTO mdl_forum_posts (discussion, parent, userid, created, modified, subject, message, messageformat, messagetrust)
VALUES
(@disc_start, 0, @adminid, @now - 1*@day, @now - 1*@day, 'Assignment 1 Brief Released - Research Report',
 '<p>Dear Students,</p><p>The brief for Assignment 1 (Research Report) has been released. You will find it in the Week 3-4 section. The deadline is <strong>5 days from now</strong>.</p><p>Key requirements:<br>- 2500 words (+/- 10%)<br>- Harvard referencing<br>- Minimum 8 academic sources</p><p>Good luck!</p>', 1, 0),

(@disc_start+1, 0, @adminid, @now - 3600, @now - 3600, 'Guest Lecture This Week - Deloitte Industry Talk',
 '<p>We are pleased to announce a guest lecture by a Senior Consultant from Deloitte.</p><p><strong>Topic:</strong> The Impact of Global Trends on UK Business<br><strong>Date:</strong> This Thursday, 2:00 PM<br><strong>Location:</strong> Room 2.14, Main Campus</p><p>Attendance is strongly recommended and may be referenced in your assignments.</p>', 1, 0),

(@disc_start+2, 0, @adminid, @now - 2*@day, @now - 2*@day, 'Marketing Plan Template Now Available',
 '<p>A marketing plan template has been uploaded to the General section of this course. Use it as a guide for your Assignment 1 submission.</p><p>The template covers:<br>- Situation Analysis<br>- Target Market<br>- Marketing Mix (4Ps)<br>- Implementation Timeline</p>', 1, 0),

(@disc_start+3, 0, @adminid, @now - 7200, @now - 7200, 'Workshop Reminder: Marketing Plan Development',
 '<p>Reminder: The hands-on Marketing Plan workshop is scheduled for this week.</p><p>Please bring:<br>- Your laptop<br>- Draft marketing plan<br>- Course textbook (Chapter 5-7)</p><p>This workshop will directly support your Assignment 1.</p>', 1, 0),

(@disc_start+4, 0, @adminid, @now - 3*@day, @now - 3*@day, 'Week 3-4 Reading List Updated',
 '<p>The reading list for Weeks 3-4 has been updated with additional resources on employment law and the Equality Act 2010.</p><p>New additions:<br>- Taylor, S. (2023) Employment Law<br>- CIPD factsheet on Diversity & Inclusion</p>', 1, 0),

(@disc_start+5, 0, @adminid, @now - 4*3600, @now - 4*3600, 'HR Case Study Resources Added',
 '<p>New case study materials have been added to support your learning in Weeks 5-6.</p><p>These include real-world HR scenarios from NHS, Tesco, and Google. Please review before the seminar.</p>', 1, 0),

(@disc_start+6, 0, @adminid, @now - 2*@day, @now - 2*@day, 'Leadership Self-Assessment Due This Week',
 '<p>Please complete the Leadership Self-Assessment activity by the end of this week. This formative task helps you reflect on your leadership strengths and areas for development.</p><p>You can find it in the Week 1-2 section.</p>', 1, 0),

(@disc_start+7, 0, @adminid, @now - 5*3600, @now - 5*3600, 'Recommended Reading: Leadership Styles',
 '<p>For this week, please read Chapter 3 of your textbook on Leadership Styles (Transformational, Transactional, Servant Leadership).</p><p>Additionally, watch the 15-minute video linked in the Week 1-2 section. We will discuss these in the next session.</p>', 1, 0);

-- Update discussions to point to first post
UPDATE mdl_forum_discussions d
SET d.firstpost = (SELECT MIN(p.id) FROM mdl_forum_posts p WHERE p.discussion = d.id)
WHERE d.id >= @disc_start AND d.id < @disc_start + 8;

-- ============================================================
-- 4. UPDATE ASSIGNMENT DUE DATES AND QUIZ TIMES
-- ============================================================

-- Assignment 1: due in 5-8 days
UPDATE mdl_assign SET duedate = @now + 5*@day, cutoffdate = @now + 7*@day WHERE id = 1;
UPDATE mdl_assign SET duedate = @now + 6*@day, cutoffdate = @now + 8*@day WHERE id = 2;
UPDATE mdl_assign SET duedate = @now + 7*@day, cutoffdate = @now + 9*@day WHERE id = 3;
UPDATE mdl_assign SET duedate = @now + 8*@day, cutoffdate = @now + 10*@day WHERE id = 4;

-- Assignment 2: due in 21-28 days
UPDATE mdl_assign SET duedate = @now + 21*@day, cutoffdate = @now + 23*@day WHERE id = 32;
UPDATE mdl_assign SET duedate = @now + 23*@day, cutoffdate = @now + 25*@day WHERE id = 33;
UPDATE mdl_assign SET duedate = @now + 25*@day, cutoffdate = @now + 27*@day WHERE id = 34;
UPDATE mdl_assign SET duedate = @now + 28*@day, cutoffdate = @now + 30*@day WHERE id = 35;

-- Quiz open/close
UPDATE mdl_quiz SET timeopen = @now + 10*@day, timeclose = @now + 11*@day WHERE id = 1;
UPDATE mdl_quiz SET timeopen = @now + 12*@day, timeclose = @now + 13*@day WHERE id = 2;
UPDATE mdl_quiz SET timeopen = @now + 13*@day, timeclose = @now + 14*@day WHERE id = 3;
UPDATE mdl_quiz SET timeopen = @now + 14*@day, timeclose = @now + 15*@day WHERE id = 4;

SELECT 'DONE: Seeded events, notifications, announcements, and updated due dates' AS result;
