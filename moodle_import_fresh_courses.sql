-- Import Fresh SCL Courses into Moodle
-- Replaces old courses with 12 professional courses from SCL office

USE bitnami_moodle;

-- Get next sort order
SET @sort := COALESCE((SELECT MAX(sortorder) FROM mdl_course), 0);

-- Insert 12 fresh SCL Institute courses
INSERT INTO mdl_course (
    category, sortorder, fullname, shortname, idnumber, summary,
    summaryformat, format, showgrades, newsitems, startdate, enddate,
    relativedatesmode, marker, maxbytes, legacyfiles, showreports,
    visible, visibleold, groupmode, groupmodeforce, defaultgroupingid,
    lang, calendartype, theme, timecreated, timemodified, requested,
    enablecompletion, completionnotify, cacherev, showactivitydates
) VALUES
-- 1. B.Tech Computer Science Engineering
(1, (@sort := @sort + 1), 'B.Tech Computer Science Engineering', 'BTECH-CSE-001', 'BTECH-CSE-001', 'Advanced computing with focus on AI, ML, and software development. Learn from industry experts and build practical skills.', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0),

-- 2. B.Tech Mechanical Engineering
(1, (@sort := @sort + 1), 'B.Tech Mechanical Engineering', 'BTECH-MEC-001', 'BTECH-MEC-001', 'Design, manufacturing, and thermal systems. Hands-on experience with modern CAD and simulation tools.', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0),

-- 3. B.Tech Electrical Engineering
(1, (@sort := @sort + 1), 'B.Tech Electrical Engineering', 'BTECH-ECE-001', 'BTECH-ECE-001', 'Power systems, electronics, and renewable energy. Comprehensive coverage of modern electrical technologies.', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0),

-- 4. MBA Business Administration
(1, (@sort := @sort + 1), 'MBA Business Administration', 'MBA-BA-001', 'MBA-BA-001', 'Strategic management, finance, and leadership. Ideal for working professionals seeking career advancement.', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0),

-- 5. M.Tech Data Science
(1, (@sort := @sort + 1), 'M.Tech Data Science', 'MTECH-DS-001', 'MTECH-DS-001', 'Machine learning, big data analytics, and AI. Master the most sought-after skills in tech industry.', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0),

-- 6. B.Com Commerce
(1, (@sort := @sort + 1), 'B.Com Commerce', 'BCOM-001', 'BCOM-001', 'Accounting, finance, and business law. Build expertise in financial management and commerce.', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0),

-- 7. BCA Computer Applications
(1, (@sort := @sort + 1), 'BCA Computer Applications', 'BCA-001', 'BCA-001', 'Programming, databases, and web development. Foundation for careers in IT industry.', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0),

-- 8. MCA Computer Applications
(1, (@sort := @sort + 1), 'MCA Computer Applications', 'MCA-001', 'MCA-001', 'Advanced programming, software engineering, and cloud technologies. Transform your IT career.', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0),

-- 9. Cloud Computing Certification
(1, (@sort := @sort + 1), 'Cloud Computing Certification', 'CERT-CLOUD-001', 'CERT-CLOUD-001', 'AWS and Azure certifications. Industry-recognized credential for cloud professionals.', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0),

-- 10. Data Science Fundamentals
(1, (@sort := @sort + 1), 'Data Science Fundamentals', 'CERT-DATA-001', 'CERT-DATA-001', 'Introduction to Python, statistics, and data analysis. Perfect starting point for data careers.', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0),

-- 11. Full Stack Web Development
(1, (@sort := @sort + 1), 'Full Stack Web Development', 'CERT-WEB-001', 'CERT-WEB-001', 'Frontend and backend technologies. Build complete web applications from scratch.', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0),

-- 12. Artificial Intelligence Basics
(1, (@sort := @sort + 1), 'Artificial Intelligence Basics', 'CERT-AI-001', 'CERT-AI-001', 'Machine learning fundamentals and AI concepts. Gateway to advanced AI technologies.', 1, 'topics', 1, 1, UNIX_TIMESTAMP(), 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, '', '', '', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 0, 0, 0, 0, 0);

-- Verify import
SELECT COUNT(*) as `✓ Courses in Moodle`, GROUP_CONCAT(fullname SEPARATOR ', ') as courses FROM mdl_course WHERE id > 1;
