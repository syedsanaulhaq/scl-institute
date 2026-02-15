-- Clean up MCA course and add proper sections

-- First, delete course modules from old sections (if any exist)
DELETE FROM mdl_course_modules WHERE course = 11 AND section IN (124,125,126,127,128,129,130,131,132,133,134,135);

-- Delete old generic sections (keep section 0 which is General)
DELETE FROM mdl_course_sections WHERE course = 11 AND section > 0;

-- Add proper MCA course sections
INSERT INTO mdl_course_sections (course, section, name, summary, summaryformat, visible, availability) VALUES
(11, 1, 'Programming Fundamentals', '<p>Learn core programming concepts using Java and Python. Covers variables, loops, functions, and object-oriented programming principles.</p>', 1, 1, NULL),
(11, 2, 'Data Structures and Algorithms', '<p>Study essential data structures (arrays, linked lists, trees, graphs) and algorithms (sorting, searching, dynamic programming).</p>', 1, 1, NULL),
(11, 3, 'Database Management Systems', '<p>Master relational databases, SQL, normalization, and database design. Includes practical work with MySQL and PostgreSQL.</p>', 1, 1, NULL),
(11, 4, 'Web Technologies', '<p>Build modern web applications using HTML5, CSS3, JavaScript, React, and Node.js. Learn full-stack development.</p>', 1, 1, NULL),
(11, 5, 'Software Engineering', '<p>Understand software development lifecycle, design patterns, testing methodologies, and agile practices.</p>', 1, 1, NULL),
(11, 6, 'Computer Networks', '<p>Explore network protocols (TCP/IP, HTTP), network architecture, security, and distributed systems.</p>', 1, 1, NULL),
(11, 7, 'Operating Systems', '<p>Learn OS concepts including process management, memory management, file systems, and concurrency.</p>', 1, 1, NULL),
(11, 8, 'Mobile Application Development', '<p>Develop mobile apps for Android and iOS using React Native and Flutter frameworks.</p>', 1, 1, NULL);

-- Update course format sections count
UPDATE mdl_course SET numsections = 8 WHERE id = 11;
