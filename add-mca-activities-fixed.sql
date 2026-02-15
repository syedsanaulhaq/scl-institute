-- Add activities to MCA course sections (corrected for actual column names)
-- MCA Course ID: 11
-- Section IDs: 284-291

-- Get module type IDs
SET @assign_module = (SELECT id FROM mdl_modules WHERE name = 'assign');
SET @quiz_module = (SELECT id FROM mdl_modules WHERE name = 'quiz');
SET @resource_module = (SELECT id FROM mdl_modules WHERE name = 'resource');
SET @url_module = (SELECT id FROM mdl_modules WHERE name = 'url');
SET @forum_module = (SELECT id FROM mdl_modules WHERE name = 'forum');

-- SECTION 1: Programming Fundamentals (ID: 284)

-- Assignment 1: Java Programming Basics
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, nosubmissions, submissiondrafts, alwaysshowdescription)
VALUES (11, 'Assignment: Java Programming Basics', '<p>Write Java programs to demonstrate understanding of variables, loops, and conditionals.</p>', 1, 100, UNIX_TIMESTAMP(), 0, 0, 1);
SET @assign1_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @assign_module, @assign1_id, 284, 1, 0, 0);

-- Assignment 2: Python Fundamentals
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, nosubmissions, submissiondrafts, alwaysshowdescription)
VALUES (11, 'Assignment: Python Fundamentals', '<p>Create Python scripts demonstrating functions, data types, and string manipulation.</p>', 1, 100, UNIX_TIMESTAMP(), 0, 0, 1);
SET @assign2_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @assign_module, @assign2_id, 284, 1, 0, 0);

-- Quiz 1: Programming Concepts
INSERT INTO mdl_quiz (course, name, intro, introformat, timemodified, preferredbehaviour, attempts, grademethod)
VALUES (11, 'Quiz: Programming Concepts', '<p>Test your knowledge of programming fundamentals.</p>', 1, UNIX_TIMESTAMP(), 'deferredfeedback', 3, 1);
SET @quiz1_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @quiz_module, @quiz1_id, 284, 1, 0, 0);

-- Resource: Lecture Notes
INSERT INTO mdl_resource (course, name, intro, introformat, tobemigrated, legacyfiles, legacyfileslast, timemodified, display, displayoptions, filterfiles, revision)
VALUES (11, 'Lecture Notes: Programming Fundamentals', '<p>Comprehensive notes on programming basics.</p>', 1, 0, 0, 0, UNIX_TIMESTAMP(), 0, '', 1, 1);
SET @resource1_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @resource_module, @resource1_id, 284, 1, 0, 0);

-- SECTION 2: Data Structures and Algorithms (ID: 285)

-- Assignment 3: Data Structure Implementation
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, nosubmissions, submissiondrafts, alwaysshowdescription)
VALUES (11, 'Assignment: Implement Data Structures', '<p>Implement linked list, stack, and queue data structures with test cases.</p>', 1, 150, UNIX_TIMESTAMP(), 0, 0, 1);
SET @assign3_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @assign_module, @assign3_id, 285, 1, 0, 0);

-- Quiz 2: Algorithms Complexity
INSERT INTO mdl_quiz (course, name, intro, introformat, timemodified, preferredbehaviour, attempts, grademethod)
VALUES (11, 'Quiz: Algorithms and Complexity Analysis', '<p>Test your understanding of Big O notation and algorithm efficiency.</p>', 1, UNIX_TIMESTAMP(), 'deferredfeedback', 2, 1);
SET @quiz2_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @quiz_module, @quiz2_id, 285, 1, 0, 0);

-- SECTION 3: Database Management Systems (ID: 286)

-- Assignment 4: SQL Database Design
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, nosubmissions, submissiondrafts, alwaysshowdescription)
VALUES (11, 'Assignment: Database Design and Normalization', '<p>Design a database schema with proper normalization and write complex SQL queries.</p>', 1, 150, UNIX_TIMESTAMP(), 0, 0, 1);
SET @assign4_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @assign_module, @assign4_id, 286, 1, 0, 0);

-- Quiz 3: Database Concepts
INSERT INTO mdl_quiz (course, name, intro, introformat, timemodified, preferredbehaviour, attempts, grademethod)
VALUES (11, 'Quiz: Database Fundamentals', '<p>Test your knowledge of relational databases and SQL.</p>', 1, UNIX_TIMESTAMP(), 'deferredfeedback', 3, 1);
SET @quiz3_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @quiz_module, @quiz3_id, 286, 1, 0, 0);

-- SECTION 4: Web Technologies (ID: 287)

-- Assignment 5: Web Application Development
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, nosubmissions, submissiondrafts, alwaysshowdescription)
VALUES (11, 'Assignment: Build a Responsive Web Application', '<p>Create a modern web application using HTML5, CSS3, and JavaScript with responsive design.</p>', 1, 150, UNIX_TIMESTAMP(), 0, 0, 1);
SET @assign5_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @assign_module, @assign5_id, 287, 1, 0, 0);

-- URL: MDN Web Docs
INSERT INTO mdl_url (course, name, intro, introformat, externalurl, display, displayoptions, parameters, timemodified)
VALUES (11, 'Resource: MDN Web Development Reference', '<p>Link to Mozilla Developer Network documentation.</p>', 1, 'https://developer.mozilla.org', 4, '', '', UNIX_TIMESTAMP());
SET @url1_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @url_module, @url1_id, 287, 1, 0, 0);

-- SECTION 5: Software Engineering (ID: 288)

-- Assignment 6: Software Development Project
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, nosubmissions, submissiondrafts, alwaysshowdescription)
VALUES (11, 'Assignment: Design and Implement Software Project', '<p>Plan and deliver a complete software project following SDLC principles with documentation.</p>', 1, 200, UNIX_TIMESTAMP(), 0, 0, 1);
SET @assign6_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @assign_module, @assign6_id, 288, 1, 0, 0);

-- Forum: Software Engineering Discussions
INSERT INTO mdl_forum (course, type, name, intro, introformat, duedate, cutoffdate, timemodified)
VALUES (11, 'general', 'Forum: Software Engineering Best Practices', '<p>Discuss software development methodologies and best practices.</p>', 1, 0, 0, UNIX_TIMESTAMP());
SET @forum1_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @forum_module, @forum1_id, 288, 1, 0, 0);

-- SECTION 6: Computer Networks (ID: 289)

-- Quiz 4: Network Protocols
INSERT INTO mdl_quiz (course, name, intro, introformat, timemodified, preferredbehaviour, attempts, grademethod)
VALUES (11, 'Quiz: Network Protocols and TCP/IP', '<p>Assessment on network layering, protocols, and TCP/IP stack.</p>', 1, UNIX_TIMESTAMP(), 'deferredfeedback', 3, 1);
SET @quiz4_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @quiz_module, @quiz4_id, 289, 1, 0, 0);

-- SECTION 7: Operating Systems (ID: 290)

-- Assignment 7: OS Concepts Implementation
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, nosubmissions, submissiondrafts, alwaysshowdescription)
VALUES (11, 'Assignment: Process Management and Scheduling', '<p>Implement process scheduling algorithms and memory management simulations.</p>', 1, 100, UNIX_TIMESTAMP(), 0, 0, 1);
SET @assign7_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @assign_module, @assign7_id, 290, 1, 0, 0);

-- SECTION 8: Mobile Application Development (ID: 291)

-- Assignment 8: Mobile App Development
INSERT INTO mdl_assign (course, name, intro, introformat, grade, timemodified, nosubmissions, submissiondrafts, alwaysshowdescription)
VALUES (11, 'Assignment: Develop a Mobile Application', '<p>Create a functional mobile app for Android or iOS with user interface and backend integration.</p>', 1, 150, UNIX_TIMESTAMP(), 0, 0, 1);
SET @assign8_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @assign_module, @assign8_id, 291, 1, 0, 0);

-- Quiz 5: Mobile Development Concepts
INSERT INTO mdl_quiz (course, name, intro, introformat, timemodified, preferredbehaviour, attempts, grademethod)
VALUES (11, 'Quiz: Mobile Development Fundamentals', '<p>Test your knowledge of mobile app architectures and frameworks.</p>', 1, UNIX_TIMESTAMP(), 'deferredfeedback', 2, 1);
SET @quiz5_id = LAST_INSERT_ID();
INSERT INTO mdl_course_modules (course, module, instance, section, visible, groupmode, completion)
VALUES (11, @quiz_module, @quiz5_id, 291, 1, 0, 0);

-- Final verification: Count activities per section
SELECT 'Activities added successfully. Summary:' AS status;
SELECT s.id, s.name, COUNT(cm.id) AS activity_count
FROM mdl_course_sections s
LEFT JOIN mdl_course_modules cm ON s.id = cm.section
WHERE s.course = 11
GROUP BY s.id, s.name
ORDER BY s.id;
