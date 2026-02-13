-- Export complete schema from full backup (structure only, no data with binary issues)
-- This preserves all column definitions

-- Drop and recreate courses table with full schema
DROP TABLE IF EXISTS courses;

CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(50) NOT NULL,
  `course_title` varchar(255) NOT NULL,
  `course_type` enum('HND','Degree','Vocational','Short Course','CPD') NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `duration_months` int DEFAULT NULL,
  `credit_points` int DEFAULT NULL,
  `description` text,
  `entry_requirements` text,
  `awarding_body` varchar(255) DEFAULT NULL,
  `full_time_available` tinyint(1) DEFAULT '1',
  `part_time_available` tinyint(1) DEFAULT '0',
  `online_available` tinyint(1) DEFAULT '0',
  `blended_available` tinyint(1) DEFAULT '0',
  `course_status` enum('active','inactive','under_review','suspended') DEFAULT 'active',
  `moodle_course_id` varchar(100) DEFAULT NULL,
  `auto_enroll_enabled` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code` (`course_code`),
  KEY `idx_course_code` (`course_code`),
  KEY `idx_course_type` (`course_type`),
  KEY `idx_course_status` (`course_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert courses data
INSERT INTO `courses` VALUES 
(1,'BTECH-CSE-001','B.Tech Computer Science Engineering','Degree','Engineering',48,NULL,'Advanced computing with focus on AI, ML, and software development.','','',1,0,0,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(2,'BTECH-MEC-001','B.Tech Mechanical Engineering','Degree','Engineering',48,NULL,'Design, manufacturing, and thermal systems.','','',1,0,0,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(3,'BTECH-ECE-001','B.Tech Electrical Engineering','Degree','Engineering',48,NULL,'Power systems, electronics, and renewable energy.','','',1,0,0,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(4,'MBA-BA-001','MBA Business Administration','Degree','Business',24,NULL,'Strategic management, finance, and leadership.','','',0,1,1,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(5,'MTECH-DS-001','M.Tech Data Science','Degree','Engineering',24,NULL,'Machine learning, big data analytics, and AI.','','',0,1,1,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(6,'BCOM-001','B.Com Commerce','Degree','Commerce',36,NULL,'Accounting, finance, and business law.','','',1,1,0,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(7,'BCA-001','BCA Computer Applications','Degree','IT',36,NULL,'Programming, databases, and web development.','','',1,0,1,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(8,'MCA-001','MCA Computer Applications','Degree','IT',24,NULL,'Advanced programming, software engineering, and cloud technologies.','','',0,1,1,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(9,'CERT-CLOUD-001','Cloud Computing Certification','CPD','IT',6,NULL,'AWS and Azure certifications.','','',0,1,1,0,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(10,'CERT-DATA-001','Data Science Fundamentals','CPD','Engineering',6,NULL,'Introduction to Python, statistics, and data analysis.','','',0,1,1,0,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(11,'CERT-WEB-001','Full Stack Web Development','CPD','IT',6,NULL,'Frontend and backend technologies.','','',0,1,1,0,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45'),
(12,'CERT-AI-001','Artificial Intelligence Basics','CPD','Engineering',8,NULL,'Machine learning fundamentals and AI concepts.','','',0,1,1,0,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45');

SELECT 'Courses table restored with full schema' as status;
SELECT COUNT(*) as total_courses, COUNT(DISTINCT department) as departments FROM courses;
