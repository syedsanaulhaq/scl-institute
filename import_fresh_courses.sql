-- Fresh SCL Institute Courses Import
-- Import 12 professional courses from SCL office database

USE scl_institute;

-- Create courses table if it doesn't exist
CREATE TABLE IF NOT EXISTS `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(50) NOT NULL UNIQUE,
  `course_title` varchar(255) NOT NULL,
  `course_type` varchar(50),
  `category` varchar(100),
  `duration_days` int,
  `max_capacity` int,
  `description` longtext,
  `prerequisites` longtext,
  `learning_outcomes` longtext,
  `is_active` tinyint(1) DEFAULT '1',
  `is_online` tinyint(1) DEFAULT '0',
  `is_hybrid` tinyint(1) DEFAULT '0',
  `has_certification` tinyint(1) DEFAULT '1',
  `status` varchar(50) DEFAULT 'active',
  `image_url` varchar(500),
  `order_sequence` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clear existing courses
DELETE FROM `courses`;

-- Insert fresh courses from SCL office
INSERT INTO `courses` VALUES 
(1,'BTECH-CSE-001','B.Tech Computer Science Engineering','Degree','Engineering',48,NULL,'Advanced computing with focus on AI, ML, and software development. Learn from industry experts and build practical skills.',NULL,NULL,1,0,0,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(2,'BTECH-MEC-001','B.Tech Mechanical Engineering','Degree','Engineering',48,NULL,'Design, manufacturing, and thermal systems. Hands-on experience with modern CAD and simulation tools.',NULL,NULL,1,0,0,1,'active',NULL,2,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(3,'BTECH-ECE-001','B.Tech Electrical Engineering','Degree','Engineering',48,NULL,'Power systems, electronics, and renewable energy. Comprehensive coverage of modern electrical technologies.',NULL,NULL,1,0,0,1,'active',NULL,3,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(4,'MBA-BA-001','MBA Business Administration','Degree','Business',24,NULL,'Strategic management, finance, and leadership. Ideal for working professionals seeking career advancement.',NULL,NULL,0,1,1,1,'active',NULL,4,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(5,'MTECH-DS-001','M.Tech Data Science','Degree','Engineering',24,NULL,'Machine learning, big data analytics, and AI. Master the most sought-after skills in tech industry.',NULL,NULL,0,1,1,1,'active',NULL,5,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(6,'BCOM-001','B.Com Commerce','Degree','Commerce',36,NULL,'Accounting, finance, and business law. Build expertise in financial management and commerce.',NULL,NULL,1,1,0,1,'active',NULL,6,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(7,'BCA-001','BCA Computer Applications','Degree','IT',36,NULL,'Programming, databases, and web development. Foundation for careers in IT industry.',NULL,NULL,1,0,1,1,'active',NULL,7,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(8,'MCA-001','MCA Computer Applications','Degree','IT',24,NULL,'Advanced programming, software engineering, and cloud technologies. Transform your IT career.',NULL,NULL,0,1,1,1,'active',NULL,8,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(9,'CERT-CLOUD-001','Cloud Computing Certification','CPD','IT',6,NULL,'AWS and Azure certifications. Industry-recognized credential for cloud professionals.',NULL,NULL,0,1,1,0,'active',NULL,9,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(10,'CERT-DATA-001','Data Science Fundamentals','CPD','Engineering',6,NULL,'Introduction to Python, statistics, and data analysis. Perfect starting point for data careers.',NULL,NULL,0,1,1,0,'active',NULL,10,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(11,'CERT-WEB-001','Full Stack Web Development','CPD','IT',6,NULL,'Frontend and backend technologies. Build complete web applications from scratch.',NULL,NULL,0,1,1,0,'active',NULL,11,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(12,'CERT-AI-001','Artificial Intelligence Basics','CPD','Engineering',8,NULL,'Machine learning fundamentals and AI concepts. Gateway to advanced AI technologies.',NULL,NULL,0,1,1,0,'active',NULL,12,'2026-02-08 05:02:45','2026-02-08 05:02:45');

SELECT COUNT(*) as `✓ Courses Imported` FROM courses;
