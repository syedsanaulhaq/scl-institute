-- Add sample activities to MCA course sections

-- Get module type IDs
SET @assign_module = (SELECT id FROM mdl_modules WHERE name = 'assign');
SET @quiz_module = (SELECT id FROM mdl_modules WHERE name = 'quiz');
SET @resource_module = (SELECT id FROM mdl_modules WHERE name = 'resource');
SET @url_module = (SELECT id FROM mdl_modules WHERE name = 'url');
SET @forum_module = (SELECT id FROM mdl_modules WHERE name = 'forum');

-- Section 1: Programming Fundamentals
-- Assignment: Java Programming Basics
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, timecreated) 
VALUES (11, 'Assignment: Java Programming Basics', '<p>Write Java programs to demonstrate understanding of variables, loops, and conditionals.</p>', 1, 100, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());
SET @assign1_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @assign_module, @assign1_id, 284, 1, 0, 0);

-- Quiz: Python Basics
INSERT INTO mdl_quiz (course, name, intro, introformat, timeopen, timemodified, timecreated, grade, questionsperpage) 
VALUES (11, 'Quiz: Python Fundamentals', '<p>Test your knowledge of Python basics.</p>', 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 10, 1);
SET @quiz1_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @quiz_module, @quiz1_id, 284, 1, 0, 0);

-- Resource: Programming Guide
INSERT INTO mdl_resource (course, name, intro, introformat, tobemigrated, legacyfiles, legacyfileslast, display, displayoptions, filterfiles, revision, timemodified) 
VALUES (11, 'Lecture Notes: OOP Concepts', '<p>Comprehensive guide to Object-Oriented Programming.</p>', 1, 0, 0, NULL, 0, 'a:2:{s:10:"printintro";s:1:"1";s:10:"framewidth";s:3:"620";}', 0, 1, UNIX_TIMESTAMP());
SET @resource1_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @resource_module, @resource1_id, 284, 1, 0, 0);

-- Section 2: Data Structures and Algorithms  
-- Assignment: Implement Stack and Queue
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, timecreated) 
VALUES (11, 'Assignment: Implement Data Structures', '<p>Implement Stack, Queue, and Linked List in Java.</p>', 1, 100, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());
SET @assign2_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @assign_module, @assign2_id, 285, 1, 0, 0);

-- Quiz: Algorithm Analysis
INSERT INTO mdl_quiz (course, name, intro, introformat, timeopen, timemodified, timecreated, grade, questionsperpage) 
VALUES (11, 'Quiz: Big O Notation & Complexity', '<p>Test understanding of algorithm complexity analysis.</p>', 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 10, 1);
SET @quiz2_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @quiz_module, @quiz2_id, 285, 1, 0, 0);

-- Section 3: Database Management Systems
-- Assignment: Database Design Project
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, timecreated) 
VALUES (11, 'Project: Library Management System DB', '<p>Design and implement a complete database for a library management system.</p>', 1, 100, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());
SET @assign3_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @assign_module, @assign3_id, 286, 1, 0, 0);

-- Quiz: SQL Queries
INSERT INTO mdl_quiz (course, name, intro, introformat, timeopen, timemodified, timecreated, grade, questionsperpage) 
VALUES (11, 'Quiz: Advanced SQL', '<p>Practice complex SQL queries, joins, and subqueries.</p>', 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 15, 1);
SET @quiz3_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @quiz_module, @quiz3_id, 286, 1, 0, 0);

-- Section 4: Web Technologies
-- Assignment: Full Stack Web App
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, timecreated) 
VALUES (11, 'Project: E-Commerce Website', '<p>Build a full-stack e-commerce application using React and Node.js.</p>', 1, 150, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());
SET @assign4_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @assign_module, @assign4_id, 287, 1, 0, 0);

-- URL: Web Development Tutorial
INSERT INTO mdl_url (course, name, intro, introformat, externalurl, display, displayoptions, parameters, timemodified) 
VALUES (11, 'Tutorial: React.js Documentation', '<p>Official React documentation and learning resources.</p>', 1, 'https://react.dev/', 0, 'a:1:{s:10:"printintro";s:1:"1";}', '', UNIX_TIMESTAMP());
SET @url1_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @url_module, @url1_id, 287, 1, 0, 0);

-- Section 5: Software Engineering
-- Assignment: Design Patterns Implementation
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, timecreated) 
VALUES (11, 'Assignment: Implement Design Patterns', '<p>Implement Singleton, Factory, and Observer patterns in Java.</p>', 1, 100, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());
SET @assign5_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @assign_module, @assign5_id, 288, 1, 0, 0);

-- Forum: Software Engineering Discussion
INSERT INTO mdl_forum (course, type, name, intro, introformat, assessed, scale, maxbytes, maxattachments, forcesubscribe, trackingtype, rsstype, rssarticles, timemodified, completionposts, completiondiscussions, completionreplies) 
VALUES (11, 'general', 'Discussion: Agile vs Waterfall', '<p>Discuss different software development methodologies.</p>', 1, 0, 0, 0, 0, 0, 1, 0, 0, UNIX_TIMESTAMP(), 0, 0, 0);
SET @forum1_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @forum_module, @forum1_id, 288, 1, 0, 0);

-- Section 6: Computer Networks  
-- Quiz: Network Protocols
INSERT INTO mdl_quiz (course, name, intro, introformat, timeopen, timemodified, timecreated, grade, questionsperpage) 
VALUES (11, 'Quiz: TCP/IP and OSI Model', '<p>Test your knowledge of network protocols and models.</p>', 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 10, 1);
SET @quiz4_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @quiz_module, @quiz4_id, 289, 1, 0, 0);

-- Section 7: Operating Systems
-- Assignment: OS Concepts
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, timecreated) 
VALUES (11, 'Assignment: Process Scheduling Simulation', '<p>Implement different CPU scheduling algorithms.</p>', 1, 100, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());
SET @assign6_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @assign_module, @assign6_id, 290, 1, 0, 0);

-- Section 8: Mobile Application Development
-- Assignment: Build Mobile App
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, timecreated) 
VALUES (11, 'Project: Weather App with React Native', '<p>Develop a weather application using React Native.</p>', 1, 150, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());
SET @assign7_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @assign_module, @assign7_id, 291, 1, 0, 0);

-- Quiz: Mobile Development
INSERT INTO mdl_quiz (course, name, intro, introformat, timeopen, timemodified, timecreated, grade, questionsperpage) 
VALUES (11, 'Quiz: Mobile App Development Basics', '<p>Test knowledge of mobile development concepts.</p>', 1, 0, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 10, 1);
SET @quiz5_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion) 
VALUES (11, @quiz_module, @quiz5_id, 291, 1, 0, 0);
