-- Insert courses into Moodle database
INSERT INTO mdl_course (category, sortorder, fullname, shortname, idnumber, summary, format, startdate, enddate, visible) VALUES
(2, 1, 'B.Tech Computer Science Engineering', 'BTECH-CSE-001', 'BTECH-CSE-001', 'Advanced computing with focus on AI, ML, and software development. Learn from industry experts and build practical skills.', 'topics', UNIX_TIMESTAMP(), 0, 1),
(2, 2, 'B.Tech Mechanical Engineering', 'BTECH-MEC-001', 'BTECH-MEC-001', 'Design, manufacturing, and thermal systems. Hands-on experience with modern CAD and simulation tools.', 'topics', UNIX_TIMESTAMP(), 0, 1),
(2, 3, 'B.Tech Electrical Engineering', 'BTECH-ECE-001', 'BTECH-ECE-001', 'Power systems, electronics, and renewable energy. Comprehensive coverage of modern electrical technologies.', 'topics', UNIX_TIMESTAMP(), 0, 1),
(2, 4, 'MBA Business Administration', 'MBA-BA-001', 'MBA-BA-001', 'Strategic management, finance, and leadership. Ideal for working professionals seeking career advancement.', 'topics', UNIX_TIMESTAMP(), 0, 1),
(2, 5, 'M.Tech Data Science', 'MTECH-DS-001', 'MTECH-DS-001', 'Machine learning, big data analytics, and AI. Master the most sought-after skills in tech industry.', 'topics', UNIX_TIMESTAMP(), 0, 1),
(2, 6, 'B.Com Commerce', 'BCOM-001', 'BCOM-001', 'Accounting, finance, and business law. Build expertise in financial management and commerce.', 'topics', UNIX_TIMESTAMP(), 0, 1),
(2, 7, 'BCA Computer Applications', 'BCA-001', 'BCA-001', 'Programming, databases, and web development. Foundation for careers in IT industry.', 'topics', UNIX_TIMESTAMP(), 0, 1),
(2, 8, 'MCA Computer Applications', 'MCA-001', 'MCA-001', 'Advanced programming, software engineering, and cloud technologies. Transform your IT career.', 'topics', UNIX_TIMESTAMP(), 0, 1),
(2, 9, 'Cloud Computing Certification', 'CERT-CLOUD-001', 'CERT-CLOUD-001', 'AWS and Azure certifications. Industry-recognized credential for cloud professionals.', 'topics', UNIX_TIMESTAMP(), 0, 1),
(2, 10, 'Data Science Fundamentals', 'CERT-DATA-001', 'CERT-DATA-001', 'Introduction to Python, statistics, and data analysis. Perfect starting point for data careers.', 'topics', UNIX_TIMESTAMP(), 0, 1),
(2, 11, 'Full Stack Web Development', 'CERT-WEB-001', 'CERT-WEB-001', 'Frontend and backend technologies. Build complete web applications from scratch.', 'topics', UNIX_TIMESTAMP(), 0, 1),
(2, 12, 'Artificial Intelligence Basics', 'CERT-AI-001', 'CERT-AI-001', 'Machine learning fundamentals and AI concepts. Gateway to advanced AI technologies.', 'topics', UNIX_TIMESTAMP(), 0, 1);
