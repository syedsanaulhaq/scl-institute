-- Add course sections and structure to all courses

-- MBA-BA-001 sections
SET @mba = (SELECT id FROM mdl_course WHERE shortname = 'MBA-BA-001');
INSERT IGNORE INTO mdl_course_sections (course, section, name, summary, summaryformat, visible, availability) VALUES
(@mba, 0, '', '', 1, 1, NULL),
(@mba, 1, 'Week 1: Introduction to Business Administration', '<p>Welcome to the course! This week covers business fundamentals, organizational structures, and management principles.</p>', 1, 1, NULL),
(@mba, 2, 'Week 2: Strategic Management', '<p>Learn strategic planning, competitive analysis, and decision-making frameworks.</p>', 1, 1, NULL),
(@mba, 3, 'Week 3: Financial Management', '<p>Understanding financial statements, budgeting, and investment decisions.</p>', 1, 1, NULL),
(@mba, 4, 'Week 4: Marketing and Customer Relations', '<p>Marketing strategies, branding, and customer relationship management.</p>', 1, 1, NULL),
(@mba, 5, 'Week 5: Human Resource Management', '<p>People management, organizational behavior, and HR best practices.</p>', 1, 1, NULL);

-- BCOM-001 sections
SET @bcom = (SELECT id FROM mdl_course WHERE shortname = 'BCOM-001');
INSERT IGNORE INTO mdl_course_sections (course, section, name, summary, summaryformat, visible, availability) VALUES
(@bcom, 0, '', '', 1, 1, NULL),
(@bcom, 1, 'Week 1: Introduction to Commerce', '<p>Overview of commerce, business transactions, and economic principles.</p>', 1, 1, NULL),
(@bcom, 2, 'Week 2: Accounting Fundamentals', '<p>Basic accounting concepts, journal entries, and financial statements.</p>', 1, 1, NULL),
(@bcom, 3, 'Week 3: Business Economics', '<p>Market structures, demand and supply, and economic analysis.</p>', 1, 1, NULL),
(@bcom, 4, 'Week 4: Business Law', '<p>Legal aspects of business, contracts, and corporate regulations.</p>', 1, 1, NULL);

-- BTECH-CSE-001 sections
SET @btech = (SELECT id FROM mdl_course WHERE shortname = 'BTECH-CSE-001');
INSERT IGNORE INTO mdl_course_sections (course, section, name, summary, summaryformat, visible, availability) VALUES
(@btech, 0, '', '', 1, 1, NULL),
(@btech, 1, 'Week 1: Programming Fundamentals', '<p>Introduction to programming, algorithms, and data structures.</p>', 1, 1, NULL),
(@btech, 2, 'Week 2: Object-Oriented Programming', '<p>OOP concepts, classes, inheritance, and polymorphism.</p>', 1, 1, NULL),
(@btech, 3, 'Week 3: Database Systems', '<p>SQL, database design, normalization, and queries.</p>', 1, 1, NULL),
(@btech, 4, 'Week 4: Web Development', '<p>HTML, CSS, JavaScript, and modern web frameworks.</p>', 1, 1, NULL),
(@btech, 5, 'Week 5: Software Engineering', '<p>SDLC, Agile methodologies, version control, and testing.</p>', 1, 1, NULL);

-- MTECH-DS-001 sections
SET @mtech = (SELECT id FROM mdl_course WHERE shortname = 'MTECH-DS-001');
INSERT IGNORE INTO mdl_course_sections (course, section, name, summary, summaryformat, visible, availability) VALUES
(@mtech, 0, '', '', 1, 1, NULL),
(@mtech, 1, 'Week 1: Introduction to Data Science', '<p>Overview of data science, tools, and methodologies.</p>', 1, 1, NULL),
(@mtech, 2, 'Week 2: Statistical Analysis', '<p>Probability, statistics, and hypothesis testing.</p>', 1, 1, NULL),
(@mtech, 3, 'Week 3: Machine Learning Basics', '<p>Supervised and unsupervised learning algorithms.</p>', 1, 1, NULL),
(@mtech, 4, 'Week 4: Data Visualization', '<p>Creating effective visualizations and dashboards.</p>', 1, 1, NULL);

SELECT 'Course sections created!' as status;
