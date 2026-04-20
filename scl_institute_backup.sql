-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: scl_institute
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accreditation_risks`
--

DROP TABLE IF EXISTS `accreditation_risks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accreditation_risks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `accreditation_id` int NOT NULL,
  `risk_issue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `impact` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mitigation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Open',
  `review_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_accreditation_id` (`accreditation_id`),
  CONSTRAINT `accreditation_risks_ibfk_1` FOREIGN KEY (`accreditation_id`) REFERENCES `course_accreditations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accreditation_risks`
--

LOCK TABLES `accreditation_risks` WRITE;
/*!40000 ALTER TABLE `accreditation_risks` DISABLE KEYS */;
/*!40000 ALTER TABLE `accreditation_risks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accreditation_signoffs`
--

DROP TABLE IF EXISTS `accreditation_signoffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accreditation_signoffs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `accreditation_id` int NOT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sign_date` date DEFAULT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_accreditation_id` (`accreditation_id`),
  CONSTRAINT `accreditation_signoffs_ibfk_1` FOREIGN KEY (`accreditation_id`) REFERENCES `course_accreditations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accreditation_signoffs`
--

LOCK TABLES `accreditation_signoffs` WRITE;
/*!40000 ALTER TABLE `accreditation_signoffs` DISABLE KEYS */;
INSERT INTO `accreditation_signoffs` VALUES (40,7,'Lead Coordinator','Dr Sarah Mitchell','2026-04-09','Signed','2026-04-09 03:52:34','2026-04-09 03:52:34'),(41,7,'QA Manager','Mr John Carter','2026-04-09','Signed','2026-04-09 03:52:34','2026-04-09 03:52:34'),(42,7,'Principal / CEO','Ms Anna Reid','2026-04-09','Signed','2026-04-09 03:52:34','2026-04-09 03:52:34'),(43,8,'Lead Coordinator','Dr Sarah Mitchell','2026-04-15','Signed','2026-04-15 10:28:09','2026-04-15 10:28:09'),(44,8,'QA Manager','Mr John Carter','2026-04-15','Signed','2026-04-15 10:28:09','2026-04-15 10:28:09'),(45,8,'Principal / CEO','Ms Anna Reid','2026-04-15','Signed','2026-04-15 10:28:09','2026-04-15 10:28:09');
/*!40000 ALTER TABLE `accreditation_signoffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accreditation_tasks`
--

DROP TABLE IF EXISTS `accreditation_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accreditation_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `accreditation_id` int NOT NULL,
  `section_number` int DEFAULT NULL,
  `section_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `task_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `evidence_required` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_reference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsible_person` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Not Started',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_accreditation_id` (`accreditation_id`),
  KEY `idx_section_number` (`section_number`),
  CONSTRAINT `accreditation_tasks_ibfk_1` FOREIGN KEY (`accreditation_id`) REFERENCES `course_accreditations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accreditation_tasks`
--

LOCK TABLES `accreditation_tasks` WRITE;
/*!40000 ALTER TABLE `accreditation_tasks` DISABLE KEYS */;
INSERT INTO `accreditation_tasks` VALUES (145,7,1,'Initial Planning & Approval','Strategic Fit Assessment','Confirm course/partnership aligns with college mission & market need','Document 1.1','Evidence source 1.1','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(146,7,1,'Initial Planning & Approval','Governing Body Approval in Principle','Formal approval to proceed','Document 1.2','Evidence source 1.2','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(147,7,1,'Initial Planning & Approval','Gap Analysis','Compare college capabilities vs. awarding body requirements','Document 1.3','Evidence source 1.3','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(148,7,1,'Initial Planning & Approval','Resource Plan','Staffing, facilities, budget needs','Document 1.4','Evidence source 1.4','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(149,7,2,'Application Preparation','Identify Target Institution','Research and confirm most suitable awarding body','Document 2.1','Evidence source 2.1','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(150,7,2,'Application Preparation','Institutional Profile Document','History, governance, quality systems, financial stability','Document 2.2','Evidence source 2.2','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(151,7,2,'Application Preparation','Programme Specification','Approved content, LOs, mapping to framework','Document 2.3','Evidence source 2.3','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(152,7,2,'Application Preparation','Assessment Strategy','Weightings, moderation, external examiner','Document 2.4','Evidence source 2.4','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(153,7,2,'Application Preparation','Staff CVs & Qualifications','To meet awarding body standards','Document 2.5','Evidence source 2.5','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(154,7,3,'Submission & Engagement','Pre-Application Contact','Initial discussion with awarding body','Document 3.1','Evidence source 3.1','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(155,7,3,'Submission & Engagement','Application Dossier Compilation','Assemble all documents in required format','Document 3.2','Evidence source 3.2','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(156,7,3,'Submission & Engagement','Formal Submission','Submit application and confirm receipt','Document 3.3','Evidence source 3.3','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(157,7,3,'Submission & Engagement','Partner Queries Response','Clarifications and additional requests','Document 3.4','Evidence source 3.4','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(158,7,4,'Review, Visits & Validation','Institutional Approval Visit','Arrange and host awarding body visit','Document 4.1','Evidence source 4.1','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(159,7,4,'Review, Visits & Validation','Course Validation Event','Attend and present course proposal','Document 4.2','Evidence source 4.2','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(160,7,4,'Review, Visits & Validation','Response to Conditions','Implement and document required changes','Document 4.3','Evidence source 4.3','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(161,7,5,'Agreement & Implementation','Contract Review','Legal review of agreement terms','Document 5.1','Evidence source 5.1','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(162,7,5,'Agreement & Implementation','Marketing & Recruitment Plan','Joint plan with partner','Document 5.2','Evidence source 5.2','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(163,7,5,'Agreement & Implementation','Staff Briefing & Training','Induction on partner processes','Document 5.3','Evidence source 5.3','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(164,7,5,'Agreement & Implementation','Launch Readiness Check','All requirements met before first intake','Document 5.4','Evidence source 5.4','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(165,7,6,'Post-Approval Monitoring','Annual Monitoring Report Submission','Required by partner','Document 6.1','Evidence source 6.1','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(166,7,6,'Post-Approval Monitoring','Partnership Review Meetings','Periodic progress meetings','Document 6.2','Evidence source 6.2','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(167,7,6,'Post-Approval Monitoring','Policy Alignment Updates','Ensure ongoing compliance','Document 6.3','Evidence source 6.3','QA Team',NULL,'Completed','Auto-filled test data','2026-04-09 03:52:34','2026-04-09 03:52:34'),(168,7,7,'Risk & Issue Log','Panel scheduling risk','Delay in partner panel visit may impact timeline.','Mail chain','Partner email thread','QA Manager',NULL,'Completed','Mitigation plan in progress.','2026-04-09 03:52:34','2026-04-09 03:52:34'),(169,8,1,'Initial Planning & Approval','Strategic Fit Assessment','Confirm course/partnership aligns with college mission & market need','Document 1.1','Evidence source 1.1','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:03','2026-04-15 10:28:03'),(170,8,1,'Initial Planning & Approval','Governing Body Approval in Principle','Formal approval to proceed','Document 1.2','Evidence source 1.2','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:03','2026-04-15 10:28:03'),(171,8,1,'Initial Planning & Approval','Gap Analysis','Compare college capabilities vs. awarding body requirements','Document 1.3','Evidence source 1.3','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:04','2026-04-15 10:28:04'),(172,8,1,'Initial Planning & Approval','Resource Plan','Staffing, facilities, budget needs','Document 1.4','Evidence source 1.4','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:04','2026-04-15 10:28:04'),(173,8,2,'Application Preparation','Identify Target Institution','Research and confirm most suitable awarding body','Document 2.1','Evidence source 2.1','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:04','2026-04-15 10:28:04'),(174,8,2,'Application Preparation','Institutional Profile Document','History, governance, quality systems, financial stability','Document 2.2','Evidence source 2.2','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:04','2026-04-15 10:28:04'),(175,8,2,'Application Preparation','Programme Specification','Approved content, LOs, mapping to framework','Document 2.3','Evidence source 2.3','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:05','2026-04-15 10:28:05'),(176,8,2,'Application Preparation','Assessment Strategy','Weightings, moderation, external examiner','Document 2.4','Evidence source 2.4','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:05','2026-04-15 10:28:05'),(177,8,2,'Application Preparation','Staff CVs & Qualifications','To meet awarding body standards','Document 2.5','Evidence source 2.5','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:05','2026-04-15 10:28:05'),(178,8,3,'Submission & Engagement','Pre-Application Contact','Initial discussion with awarding body','Document 3.1','Evidence source 3.1','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:05','2026-04-15 10:28:05'),(179,8,3,'Submission & Engagement','Application Dossier Compilation','Assemble all documents in required format','Document 3.2','Evidence source 3.2','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:06','2026-04-15 10:28:06'),(180,8,3,'Submission & Engagement','Formal Submission','Submit application and confirm receipt','Document 3.3','Evidence source 3.3','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:06','2026-04-15 10:28:06'),(181,8,3,'Submission & Engagement','Partner Queries Response','Clarifications and additional requests','Document 3.4','Evidence source 3.4','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:06','2026-04-15 10:28:06'),(182,8,4,'Review, Visits & Validation','Institutional Approval Visit','Arrange and host awarding body visit','Document 4.1','Evidence source 4.1','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:06','2026-04-15 10:28:06'),(183,8,4,'Review, Visits & Validation','Course Validation Event','Attend and present course proposal','Document 4.2','Evidence source 4.2','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:07','2026-04-15 10:28:07'),(184,8,4,'Review, Visits & Validation','Response to Conditions','Implement and document required changes','Document 4.3','Evidence source 4.3','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:07','2026-04-15 10:28:07'),(185,8,5,'Agreement & Implementation','Contract Review','Legal review of agreement terms','Document 5.1','Evidence source 5.1','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:07','2026-04-15 10:28:07'),(186,8,5,'Agreement & Implementation','Marketing & Recruitment Plan','Joint plan with partner','Document 5.2','Evidence source 5.2','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:07','2026-04-15 10:28:07'),(187,8,5,'Agreement & Implementation','Staff Briefing & Training','Induction on partner processes','Document 5.3','Evidence source 5.3','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:07','2026-04-15 10:28:07'),(188,8,5,'Agreement & Implementation','Launch Readiness Check','All requirements met before first intake','Document 5.4','Evidence source 5.4','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:08','2026-04-15 10:28:08'),(189,8,6,'Post-Approval Monitoring','Annual Monitoring Report Submission','Required by partner','Document 6.1','Evidence source 6.1','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:08','2026-04-15 10:28:08'),(190,8,6,'Post-Approval Monitoring','Partnership Review Meetings','Periodic progress meetings','Document 6.2','Evidence source 6.2','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:08','2026-04-15 10:28:08'),(191,8,6,'Post-Approval Monitoring','Policy Alignment Updates','Ensure ongoing compliance','Document 6.3','Evidence source 6.3','QA Team',NULL,'Completed','Auto-filled test data','2026-04-15 10:28:08','2026-04-15 10:28:08'),(192,8,7,'Risk & Issue Log','Panel scheduling risk','Delay in partner panel visit may impact timeline.','Mail chain','Partner email thread','QA Manager',NULL,'Completed','Mitigation plan in progress.','2026-04-15 10:28:09','2026-04-15 10:28:09');
/*!40000 ALTER TABLE `accreditation_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adjustment_plan`
--

DROP TABLE IF EXISTS `adjustment_plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adjustment_plan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `adjustment_detail` longtext,
  `implementation_notes` longtext,
  `valid_from` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `valid_until` timestamp NULL DEFAULT NULL,
  `visible_to_student` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_request` (`request_id`),
  CONSTRAINT `adjustment_plan_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `disability_requests` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adjustment_plan`
--

LOCK TABLES `adjustment_plan` WRITE;
/*!40000 ALTER TABLE `adjustment_plan` DISABLE KEYS */;
/*!40000 ALTER TABLE `adjustment_plan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admissions_decisions`
--

DROP TABLE IF EXISTS `admissions_decisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admissions_decisions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `decision` enum('accepted','conditional_accept','rejected','deferred') NOT NULL,
  `decision_date` date NOT NULL,
  `decision_made_by` int NOT NULL,
  `conditions` text,
  `conditions_deadline` date DEFAULT NULL,
  `offer_letter_sent` tinyint(1) DEFAULT '0',
  `offer_letter_sent_date` date DEFAULT NULL,
  `student_response` enum('accepted','declined','pending') DEFAULT 'pending',
  `student_response_date` date DEFAULT NULL,
  `deferred_to_intake` date DEFAULT NULL,
  `deferral_reason` text,
  `rejection_reason` text,
  `feedback_provided` text,
  `allocated_to_course` tinyint(1) DEFAULT '0',
  `moodle_enrollment_id` varchar(100) DEFAULT NULL,
  `enrollment_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  KEY `idx_decision` (`decision`),
  KEY `idx_decision_date` (`decision_date`),
  KEY `idx_student_response` (`student_response`),
  CONSTRAINT `admissions_decisions_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `student_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admissions_decisions`
--

LOCK TABLES `admissions_decisions` WRITE;
/*!40000 ALTER TABLE `admissions_decisions` DISABLE KEYS */;
/*!40000 ALTER TABLE `admissions_decisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `priority` varchar(20) DEFAULT 'medium',
  `category` varchar(50) DEFAULT NULL,
  `target_audience` varchar(50) DEFAULT 'all',
  `published_by` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_priority` (`priority`),
  KEY `idx_category` (`category`),
  KEY `idx_active` (`is_active`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_documents`
--

DROP TABLE IF EXISTS `application_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `document_type` enum('passport_id','passport_id_document','academic_certificates','academic_transcripts','english_certificate','cv_resume','work_reference','proof_address','proof_of_address','visa_immigration','visa_immigration_document','student_contract','brp_card','residency_proof') NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `stored_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by_ip` varchar(45) DEFAULT NULL,
  `document_verified` tinyint(1) DEFAULT '0',
  `verified_by` int DEFAULT NULL,
  `verified_date` timestamp NULL DEFAULT NULL,
  `verification_notes` text,
  `is_deleted` tinyint(1) DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_application_docs` (`application_id`),
  KEY `idx_document_type` (`document_type`),
  CONSTRAINT `application_documents_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `student_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_documents`
--

LOCK TABLES `application_documents` WRITE;
/*!40000 ALTER TABLE `application_documents` DISABLE KEYS */;
INSERT INTO `application_documents` VALUES (5,1,'academic_certificates','Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf','1770477051236-436435737-Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf','/uploads/student-documents/1770477051236-436435737-Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf',160475,'application/pdf','2026-02-07 15:10:51','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(6,1,'academic_transcripts','Quote-184.pdf','1770477059685-558710753-Quote-184.pdf','/uploads/student-documents/1770477059685-558710753-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:10:59','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(7,1,'academic_transcripts','Quote-184.pdf','1770477071447-479979229-Quote-184.pdf','/uploads/student-documents/1770477071447-479979229-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:11:11','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(8,1,'academic_transcripts','Quote-184.pdf','1770477302839-786890075-Quote-184.pdf','/uploads/student-documents/1770477302839-786890075-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:15:02','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(9,1,'english_certificate','Quote-184.pdf','1770477310568-12912296-Quote-184.pdf','/uploads/student-documents/1770477310568-12912296-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:15:10','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(10,1,'student_contract','Quote-184.pdf','1770477315792-323537898-Quote-184.pdf','/uploads/student-documents/1770477315792-323537898-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:15:15','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(11,1,'cv_resume','Quote-184.pdf','1770477322330-224535753-Quote-184.pdf','/uploads/student-documents/1770477322330-224535753-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:15:22','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(12,1,'work_reference','Quote-184.pdf','1770477328247-118840392-Quote-184.pdf','/uploads/student-documents/1770477328247-118840392-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:15:28','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(14,1,'proof_of_address','Quote-184.pdf','1770478263718-772172239-Quote-184.pdf','/uploads/student-documents/1770478263718-772172239-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:31:03','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(15,1,'passport_id','Quote-184.pdf','1770479907869-872161472-Quote-184.pdf','/uploads/student-documents/1770479907869-872161472-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:58:27','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(16,1,'visa_immigration','Quote-184.pdf','1770479912474-402295349-Quote-184.pdf','/uploads/student-documents/1770479912474-402295349-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:58:32','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(17,1,'passport_id','Quote-184.pdf','1770480095793-313319113-Quote-184.pdf','/uploads/student-documents/1770480095793-313319113-Quote-184.pdf',25762,'application/pdf','2026-02-07 16:01:35','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(19,1,'visa_immigration_document','Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf','1770480821843-518303510-Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf','/uploads/student-documents/1770480821843-518303510-Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf',160475,'application/pdf','2026-02-07 16:13:41','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(21,1,'visa_immigration_document','Quote-184.pdf','1770481227592-524835436-Quote-184.pdf','/uploads/student-documents/1770481227592-524835436-Quote-184.pdf',25762,'application/pdf','2026-02-07 16:20:27','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(22,6,'passport_id','Quote-184.pdf','1770542425879-988631858-Quote-184.pdf','/app/uploads/student-documents/1770542425879-988631858-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(23,6,'academic_certificates','Quote-184.pdf','1770542425878-455606262-Quote-184.pdf','/app/uploads/student-documents/1770542425878-455606262-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(24,6,'academic_transcripts','Quote-184.pdf','1770542425876-571701943-Quote-184.pdf','/app/uploads/student-documents/1770542425876-571701943-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(25,6,'english_certificate','Quote-184.pdf','1770542425881-850278176-Quote-184.pdf','/app/uploads/student-documents/1770542425881-850278176-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(26,6,'cv_resume','Quote-184.pdf','1770542425884-124512938-Quote-184.pdf','/app/uploads/student-documents/1770542425884-124512938-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(27,6,'work_reference','Quote-184.pdf','1770542425887-776889921-Quote-184.pdf','/app/uploads/student-documents/1770542425887-776889921-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(28,6,'proof_of_address','Quote-184.pdf','1770542425887-801106105-Quote-184.pdf','/app/uploads/student-documents/1770542425887-801106105-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(29,6,'visa_immigration','Quote-184.pdf','1770542425888-887513031-Quote-184.pdf','/app/uploads/student-documents/1770542425888-887513031-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(30,7,'passport_id_document','Quote-184.pdf','1770824101120-91664737-Quote-184.pdf','/uploads/student-documents/1770824101120-91664737-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:35:01','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(31,7,'academic_certificates','Quote-184.pdf','1770824115540-377836523-Quote-184.pdf','/uploads/student-documents/1770824115540-377836523-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:35:15','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(32,7,'academic_transcripts','Quote-184.pdf','1770824173802-81774281-Quote-184.pdf','/uploads/student-documents/1770824173802-81774281-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:36:13','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(33,7,'english_certificate','Quote-184.pdf','1770824181053-223897016-Quote-184.pdf','/uploads/student-documents/1770824181053-223897016-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:36:21','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(34,7,'student_contract','Quote-184.pdf','1770824213762-912557693-Quote-184.pdf','/uploads/student-documents/1770824213762-912557693-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:36:53','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(35,7,'cv_resume','Quote-184.pdf','1770824221171-434422463-Quote-184.pdf','/uploads/student-documents/1770824221171-434422463-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:37:01','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(36,7,'work_reference','Quote-184.pdf','1770824227487-57873909-Quote-184.pdf','/uploads/student-documents/1770824227487-57873909-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:37:07','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(37,7,'proof_of_address','Quote-184.pdf','1770824233638-684943772-Quote-184.pdf','/uploads/student-documents/1770824233638-684943772-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:37:13','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(38,7,'passport_id_document','Quote-184.pdf','1770825089251-596214679-Quote-184.pdf','/uploads/student-documents/1770825089251-596214679-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:51:29','172.21.0.1',0,NULL,NULL,NULL,0,NULL),(40,1,'passport_id_document','DEVELOPMENT-WEEK-ACTIVITIES-119-e1756127497368.jpg','1772712150028-284015214-DEVELOPMENT-WEEK-ACTIVITIES-119-e1756127497368.jpg','/uploads/student-documents/1772712150028-284015214-DEVELOPMENT-WEEK-ACTIVITIES-119-e1756127497368.jpg',90691,'image/jpeg','2026-03-05 12:02:30','172.18.0.1',0,NULL,NULL,NULL,0,NULL);
/*!40000 ALTER TABLE `application_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_reviews`
--

DROP TABLE IF EXISTS `application_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `reviewer_id` int NOT NULL,
  `review_stage` enum('initial_screening','academic_review','interview_assessment','final_decision') NOT NULL,
  `academic_suitability` enum('suitable','needs_assessment','unsuitable') NOT NULL,
  `english_proficiency_adequate` tinyint(1) NOT NULL,
  `documentation_complete` tinyint(1) NOT NULL,
  `work_experience_relevant` tinyint(1) DEFAULT NULL,
  `recommendation` enum('accept','conditional_accept','interview_required','reject','defer') NOT NULL,
  `review_notes` text,
  `conditions_if_conditional` text,
  `interview_required` tinyint(1) DEFAULT '0',
  `interview_date` datetime DEFAULT NULL,
  `interview_location` varchar(255) DEFAULT NULL,
  `interview_notes` text,
  `reviewed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_application_review` (`application_id`),
  KEY `idx_review_stage` (`review_stage`),
  CONSTRAINT `application_reviews_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `student_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_reviews`
--

LOCK TABLES `application_reviews` WRITE;
/*!40000 ALTER TABLE `application_reviews` DISABLE KEYS */;
INSERT INTO `application_reviews` VALUES (1,1,1,'final_decision','needs_assessment',0,0,NULL,'reject','{\"reviewer_name\":\"QA Admin\",\"decision\":\"Refusal\",\"reason_for_refusal\":\"Strict full cleanup\",\"detailed_comments\":\"Remove from all Moodle records\",\"final_decision_confirmation\":\"Yes\"}',NULL,0,NULL,NULL,NULL,'2026-02-07 12:41:12',0,NULL),(2,5,1,'final_decision','suitable',0,1,NULL,'reject','{\"reviewer_name\":\"test\",\"review_date\":\"2026-02-07\",\"documents_verified\":\"Yes\",\"eligibility_check\":\"Does not meet criteria\",\"interview_conducted\":\"No\",\"interview_outcome\":\"\",\"english_requirement_met\":\"No\",\"additional_notes\":\"\",\"decision\":\"Refusal\",\"reason_for_refusal\":\"English language requirement not met\",\"detailed_comments\":\"test\",\"committee_chair_name\":\"test\",\"final_decision_date\":\"2026-02-07\",\"final_decision_confirmation\":true}',NULL,0,NULL,NULL,NULL,'2026-02-07 14:42:37',0,NULL),(3,4,1,'final_decision','suitable',1,1,NULL,'accept','{\"reviewer_name\":\"test\",\"review_date\":\"2026-02-07\",\"documents_verified\":\"Yes\",\"eligibility_check\":\"Meets criteria\",\"interview_conducted\":\"Yes\",\"interview_outcome\":\"Pass\",\"english_requirement_met\":\"Yes\",\"additional_notes\":\"test\",\"decision\":\"Offer\",\"reason_for_refusal\":\"\",\"detailed_comments\":\"test\",\"committee_chair_name\":\"test\",\"final_decision_date\":\"2026-02-07\",\"final_decision_confirmation\":true}',NULL,0,NULL,NULL,NULL,'2026-02-07 14:43:38',0,NULL),(4,3,1,'final_decision','needs_assessment',0,0,NULL,'accept','{\"reviewer_name\":\"QA Admin\",\"decision\":\"Offer\",\"detailed_comments\":\"E2E flow test accept then transfer\",\"final_decision_confirmation\":\"Yes\"}',NULL,0,NULL,NULL,NULL,'2026-02-07 14:44:32',0,NULL),(5,6,1,'final_decision','suitable',1,1,NULL,'accept','{\"reviewer_name\":\"Fazli\",\"review_date\":\"2026-02-08\",\"documents_verified\":\"Yes\",\"eligibility_check\":\"Meets criteria\",\"interview_conducted\":\"Yes\",\"interview_outcome\":\"Pass\",\"english_requirement_met\":\"Yes\",\"additional_notes\":\"test\",\"decision\":\"Offer\",\"reason_for_refusal\":\"\",\"detailed_comments\":\"test offer\",\"committee_chair_name\":\"Khalid\",\"final_decision_date\":\"2026-02-08\",\"final_decision_confirmation\":true}',NULL,0,NULL,NULL,NULL,'2026-02-08 09:22:31',0,NULL),(6,7,1,'final_decision','suitable',1,1,NULL,'accept','{\"reviewer_name\":\"Asad Khan\",\"review_date\":\"2026-02-11\",\"documents_verified\":\"Yes\",\"eligibility_check\":\"Meets criteria\",\"interview_conducted\":\"Yes\",\"interview_outcome\":\"Pass\",\"english_requirement_met\":\"Yes\",\"additional_notes\":\"test\",\"decision\":\"Offer\",\"reason_for_refusal\":\"\",\"detailed_comments\":\"test\",\"committee_chair_name\":\"test\",\"final_decision_date\":\"2026-02-11\",\"final_decision_confirmation\":true}',NULL,0,NULL,NULL,NULL,'2026-02-11 15:25:16',0,NULL),(7,2,1,'final_decision','suitable',1,1,NULL,'accept','{\"reviewer_name\":\"test\",\"review_date\":\"2026-03-13\",\"documents_verified\":\"Yes\",\"eligibility_check\":\"Meets criteria\",\"interview_conducted\":\"Yes\",\"interview_outcome\":\"Pass\",\"english_requirement_met\":\"Yes\",\"additional_notes\":\"test\",\"decision\":\"Offer\",\"reason_for_refusal\":\"\",\"detailed_comments\":\"test\",\"committee_chair_name\":\"test\",\"final_decision_date\":\"2026-03-13\",\"final_decision_confirmation\":true}',NULL,0,NULL,NULL,NULL,'2026-03-13 11:14:45',0,NULL),(8,8,1,'final_decision','needs_assessment',0,0,NULL,'accept','{\"reviewer_name\":\"Admin\",\"review_date\":\"2026-04-06\",\"documents_verified\":true,\"eligibility_check\":true,\"decision\":\"Offer\"}',NULL,0,NULL,NULL,NULL,'2026-04-06 12:10:32',0,NULL),(9,9,1,'final_decision','suitable',1,1,NULL,'accept','{\"reviewer_name\":\"test\",\"review_date\":\"2026-04-15\",\"documents_verified\":\"Yes\",\"eligibility_check\":\"Meets criteria\",\"interview_conducted\":\"Yes\",\"interview_outcome\":\"Pass\",\"english_requirement_met\":\"Yes\",\"additional_notes\":\"test\",\"decision\":\"Offer\",\"reason_for_refusal\":\"\",\"detailed_comments\":\"test\",\"committee_chair_name\":\"test\",\"final_decision_date\":\"2026-04-15\",\"final_decision_confirmation\":true}',NULL,0,NULL,NULL,NULL,'2026-04-15 15:44:35',0,NULL);
/*!40000 ALTER TABLE `application_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_stats`
--

DROP TABLE IF EXISTS `application_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date_recorded` date NOT NULL,
  `total_applications` int DEFAULT '0',
  `applications_submitted` int DEFAULT '0',
  `applications_under_review` int DEFAULT '0',
  `applications_accepted` int DEFAULT '0',
  `applications_rejected` int DEFAULT '0',
  `applications_deferred` int DEFAULT '0',
  `course_code` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_date_recorded` (`date_recorded`),
  KEY `idx_course_stats` (`course_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_stats`
--

LOCK TABLES `application_stats` WRITE;
/*!40000 ALTER TABLE `application_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `application_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  `category_code` varchar(50) NOT NULL,
  `description` text,
  `icon` varchar(100) DEFAULT NULL,
  `color_code` varchar(7) DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_name` (`category_name`),
  UNIQUE KEY `category_code` (`category_code`),
  KEY `idx_category_code` (`category_code`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Engineering','ENG','Engineering programs including B.Tech and M.Tech courses','??????','#FF6B6B',1,1,'2026-02-08 05:02:40','2026-02-08 05:02:40'),(2,'Business & Management','BUS','Business administration, MBA, and commerce programs','????','#4ECDC4',2,1,'2026-02-08 05:02:40','2026-02-08 05:02:40'),(3,'IT & Computing','IT','Computer science, BCA, MCA, and IT-related courses','????','#45B7D1',3,1,'2026-02-08 05:02:40','2026-02-08 05:02:40'),(4,'Professional Certifications','CERT','CPD and certification programs for professional development','????','#FFA502',4,1,'2026-02-08 05:02:40','2026-02-08 05:02:40'),(5,'Degree','DEG','Bachelor Degree Programs',NULL,NULL,0,1,'2026-04-01 05:01:51','2026-04-01 05:01:51'),(6,'HND','HND','Higher National Diploma Programs',NULL,NULL,0,1,'2026-04-01 05:01:51','2026-04-01 05:01:51'),(7,'Year 1','Y1','First Year of Studies',NULL,NULL,0,1,'2026-04-01 05:01:51','2026-04-01 05:01:51'),(8,'Year 2','Y2','Second Year of Studies',NULL,NULL,0,1,'2026-04-01 05:01:51','2026-04-01 05:01:51'),(9,'Year 3','Y3','Third Year of Studies',NULL,NULL,0,1,'2026-04-01 05:01:51','2026-04-01 05:01:51'),(10,'Semester 1','S1','First Semester / Autumn',NULL,NULL,0,1,'2026-04-01 05:01:51','2026-04-01 05:01:51'),(11,'Semester 2','S2','Second Semester / Spring',NULL,NULL,0,1,'2026-04-01 05:01:51','2026-04-01 05:01:51');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint_documents`
--

DROP TABLE IF EXISTS `complaint_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `document_url` varchar(500) DEFAULT NULL,
  `document_type` varchar(100) DEFAULT NULL,
  `uploaded_by` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_complaint` (`complaint_id`),
  CONSTRAINT `complaint_documents_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints_appeals` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_documents`
--

LOCK TABLES `complaint_documents` WRITE;
/*!40000 ALTER TABLE `complaint_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `complaint_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaint_timeline`
--

DROP TABLE IF EXISTS `complaint_timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaint_timeline` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complaint_id` int NOT NULL,
  `stage` varchar(100) DEFAULT NULL,
  `description` longtext,
  `updated_by` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `student_notification` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_complaint` (`complaint_id`),
  CONSTRAINT `complaint_timeline_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints_appeals` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaint_timeline`
--

LOCK TABLES `complaint_timeline` WRITE;
/*!40000 ALTER TABLE `complaint_timeline` DISABLE KEYS */;
/*!40000 ALTER TABLE `complaint_timeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaints_appeals`
--

DROP TABLE IF EXISTS `complaints_appeals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints_appeals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `case_number` varchar(50) NOT NULL,
  `student_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` longtext NOT NULL,
  `status` varchar(50) DEFAULT 'submitted',
  `priority` varchar(20) DEFAULT 'medium',
  `assigned_to` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deadline` timestamp NULL DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `decision` varchar(50) DEFAULT NULL,
  `decision_notes` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `case_number` (`case_number`),
  KEY `idx_student` (`student_id`),
  KEY `idx_case` (`case_number`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints_appeals`
--

LOCK TABLES `complaints_appeals` WRITE;
/*!40000 ALTER TABLE `complaints_appeals` DISABLE KEYS */;
/*!40000 ALTER TABLE `complaints_appeals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_accreditations`
--

DROP TABLE IF EXISTS `course_accreditations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_accreditations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `awarding_body` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `application_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_started` date DEFAULT NULL,
  `expected_submission_date` date DEFAULT NULL,
  `lead_coordinator` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '1.0',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `overall_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `completion_percentage` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`overall_status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_course_code` (`course_code`),
  KEY `idx_course_title` (`course_title`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_accreditations`
--

LOCK TABLES `course_accreditations` WRITE;
/*!40000 ALTER TABLE `course_accreditations` DISABLE KEYS */;
INSERT INTO `course_accreditations` VALUES (7,'Course-1','HMS-001-Y1-S1-C1','test','New Course Accreditation','2026-04-09','2026-06-08','Dr Sarah Mitchell','1.0','2026-04-09 03:52:34','Completed',100,'2026-04-09 03:52:33','2026-04-09 03:52:34',NULL,NULL),(8,'Course-2','HMS-001-Y1-S1-C2','test','New Course Accreditation','2026-04-15','2026-06-14','Dr Sarah Mitchell','1.0','2026-04-15 10:28:03','Completed',100,'2026-04-15 10:28:03','2026-04-15 10:28:03',NULL,NULL);
/*!40000 ALTER TABLE `course_accreditations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_change_requests`
--

DROP TABLE IF EXISTS `course_change_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_change_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `student_id` int DEFAULT NULL,
  `student_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_start_date` date DEFAULT NULL,
  `current_study_mode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_of_request` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `effective_date` date NOT NULL,
  `justification` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `supporting_document` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `policy_confirmation` tinyint(1) DEFAULT '0',
  `digital_signature` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_date` date DEFAULT NULL,
  `decision` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `review_date` datetime DEFAULT NULL,
  `rejection_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `committee_comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `final_decision_confirmation` tinyint(1) DEFAULT '0',
  `new_course_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_course_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_change_application` (`application_id`),
  KEY `idx_course_change_type` (`type_of_request`),
  KEY `idx_course_change_decision` (`decision`),
  KEY `idx_course_change_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_change_requests`
--

LOCK TABLES `course_change_requests` WRITE;
/*!40000 ALTER TABLE `course_change_requests` DISABLE KEYS */;
INSERT INTO `course_change_requests` VALUES (1,3,3,'Mohammed Khan','HND in International Travel & Tourism Management','2026-09-01','Full-time','Transfer','2026-09-01','Smoke test transfer workflow',NULL,1,'Test Student','2026-03-12','Approved','Admissions Manager','2026-03-12 04:38:57',NULL,'Approved transfer smoke test',1,'HND-001-INFO','HND IN BUSINESS RQF','2026-03-12 04:38:57','2026-03-12 04:38:57'),(2,3,3,'Mohammed Khan','HND IN BUSINESS RQF','2026-09-01','Full-time','Transfer','2026-09-15','Lifecycle sync test',NULL,1,'Test Student','2026-03-12','Approved','Admissions Manager','2026-03-12 05:42:26',NULL,'Approve transfer to HND-004',1,'HND-004-INFO','HND IN HOSPITALITY MANAGEMENT','2026-03-12 05:42:26','2026-03-12 05:42:26'),(3,3,3,'Mohammed Khan','HND IN HOSPITALITY MANAGEMENT','2026-09-01','Full-time','Transfer','2026-09-20','E2E transfer test',NULL,1,'Test Student','2026-03-12','Approved','Admissions Manager','2026-03-12 05:49:54',NULL,'Approve transfer with moodle changes',1,'HND-001-INFO','HND IN BUSINESS RQF','2026-03-12 05:49:54','2026-03-12 05:49:54'),(4,3,3,'Mohammed Khan','HND IN BUSINESS RQF','2026-09-01','Full-time','Transfer','2026-09-25','Cohort fix validation',NULL,1,'Test Student','2026-03-12','Approved','Admissions Manager','2026-03-12 05:51:12',NULL,'Transfer back to HND-004 with Moodle changes',1,'HND-004-INFO','HND IN HOSPITALITY MANAGEMENT','2026-03-12 05:51:12','2026-03-12 05:51:12'),(5,3,3,'Mohammed Khan','HND IN HOSPITALITY MANAGEMENT','2026-09-01','Full-time','Transfer','2026-09-26','Cohort fallback validation',NULL,1,'Test Student','2026-03-12','Approved','Admissions Manager','2026-03-12 05:52:36',NULL,'Final test transfer to HND-001',1,'HND-001-INFO','HND IN BUSINESS RQF','2026-03-12 05:52:35','2026-03-12 05:52:36'),(6,3,3,'Mohammed Khan','HND IN BUSINESS RQF','2026-09-01','Full-time','Transfer','2026-03-12','Please transfer me to the BSC',NULL,1,'Mohammad Khan','2026-03-12','Approved','Manager','2026-03-12 07:04:08',NULL,'it is transfered',1,'DEG-001-INFO','BSC (Hons) Business Management offered','2026-03-12 06:42:31','2026-03-12 07:04:08');
/*!40000 ALTER TABLE `course_change_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_inductions`
--

DROP TABLE IF EXISTS `course_inductions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_inductions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `awarding_body` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qualification_level` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_date` date DEFAULT NULL,
  `review_date` date DEFAULT NULL,
  `version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '1.0',
  `document_owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `overall_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `completion_percentage` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`overall_status`),
  KEY `idx_created_at` (`created_at` DESC),
  KEY `idx_course` (`course_title`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_inductions`
--

LOCK TABLES `course_inductions` WRITE;
/*!40000 ALTER TABLE `course_inductions` DISABLE KEYS */;
INSERT INTO `course_inductions` VALUES (7,'Course-1','HMS-001-Y1-S1-C1','test','Level 6 (Degree)','2026-04-09','2026-07-08','1.0','QA Team','2026-04-09 03:56:18','Completed',100,'2026-04-09 03:56:17','2026-04-09 03:56:18',NULL,NULL),(8,'Course-2','HMS-001-Y1-S1-C2','test','Level 6 (Degree)','2026-04-15','2026-07-14','1.0','QA Team','2026-04-15 10:39:45','Completed',100,'2026-04-15 10:39:36','2026-04-15 10:39:45',NULL,NULL);
/*!40000 ALTER TABLE `course_inductions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_lifecycle_master`
--

DROP TABLE IF EXISTS `course_lifecycle_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_lifecycle_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lifecycle_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `programme_type_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `program_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `academic_year` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `semester_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `programme_type_category_id` int DEFAULT NULL,
  `program_category_id` int DEFAULT NULL,
  `year_category_id` int DEFAULT NULL,
  `semester_category_id` int DEFAULT NULL,
  `awarding_body` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qualification_level` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `application_type` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_type` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lead_coordinator` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accreditation_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `current_stage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending_accreditation',
  PRIMARY KEY (`id`),
  UNIQUE KEY `lifecycle_key` (`lifecycle_key`),
  KEY `idx_course_title` (`course_title`),
  KEY `idx_course_code` (`course_code`),
  KEY `idx_accreditation_id` (`accreditation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_lifecycle_master`
--

LOCK TABLES `course_lifecycle_master` WRITE;
/*!40000 ALTER TABLE `course_lifecycle_master` DISABLE KEYS */;
INSERT INTO `course_lifecycle_master` VALUES (86,'code:DEG-001-Y0-S3-C1','Semester 3 Course 1','DEG-001-Y0-S3-C1','Degree','BSC (Hons) Business Management offered','Year - 0 (Foundation Level Modules)','Semester-3',2,10,11,158,'Test',NULL,NULL,NULL,NULL,NULL,'1.0',NULL,'2026-04-08 15:47:34','2026-04-15 10:25:14','pending_accreditation'),(87,'code:DEG-001-Y0-S3-C2','Course 2 of S3','DEG-001-Y0-S3-C2','Degree','BSC (Hons) Business Management offered','Year - 0 (Foundation Level Modules)','Semester-3',2,10,11,158,'test',NULL,NULL,NULL,NULL,NULL,'1.0',NULL,'2026-04-08 16:01:53','2026-04-15 10:25:14','pending_accreditation'),(88,'code:HMS-001-Y1-S1-C1','Course-1','HMS-001-Y1-S1-C1','HMS','New Program','Year-1','Semester-1',159,160,161,162,'test',NULL,'New Course Accreditation',NULL,NULL,'Dr Sarah Mitchell','1.0',7,'2026-04-09 03:50:12','2026-04-09 03:56:18','induction_done'),(114,'code:HMS-001-Y1-S1-C2','Course-2','HMS-001-Y1-S1-C2','HMS','New Program','Year-1','Semester-1',159,160,161,162,'test',NULL,'New Course Accreditation',NULL,NULL,'Dr Sarah Mitchell','1.0',8,'2026-04-15 10:26:07','2026-04-15 10:39:45','induction_done'),(140,'code:HND-001-Y1-S1-C1','Course-1','HND-001-Y1-S1-C1','HND','Level-3','Year-1','Semester-1',163,164,165,166,'test',NULL,NULL,NULL,NULL,NULL,'1.0',NULL,'2026-04-15 15:24:53','2026-04-15 15:24:53','pending_accreditation'),(141,'code:HND-001-Y2-S1-C1','Course-2','HND-001-Y2-S1-C1','HND','Level-3','Year-2','Semester-1',163,164,167,168,'test',NULL,NULL,NULL,NULL,NULL,'1.0',NULL,'2026-04-15 15:27:15','2026-04-15 15:27:15','pending_accreditation'),(142,'code:HMS-001-Y1-S1-C3','Course-3','HMS-001-Y1-S1-C3','HMS','New Program','Year-1','Semester-1',159,160,161,162,'test',NULL,NULL,NULL,NULL,NULL,'1.0',NULL,'2026-04-15 15:29:10','2026-04-15 15:29:10','pending_accreditation');
/*!40000 ALTER TABLE `course_lifecycle_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_registrations`
--

DROP TABLE IF EXISTS `course_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `intake_id` int DEFAULT NULL,
  `registration_reference` varchar(20) DEFAULT NULL,
  `course_title` varchar(255) NOT NULL,
  `course_code` varchar(100) NOT NULL,
  `programme_type_name` varchar(255) DEFAULT NULL,
  `program_name` varchar(255) DEFAULT NULL,
  `academic_year` varchar(50) DEFAULT NULL,
  `semester_name` varchar(50) DEFAULT NULL,
  `cohort_label` varchar(100) DEFAULT NULL,
  `programme_type_category_id` int DEFAULT NULL,
  `program_category_id` int DEFAULT NULL,
  `year_category_id` int DEFAULT NULL,
  `semester_category_id` int DEFAULT NULL,
  `cohort_category_id` int DEFAULT NULL,
  `course_type` varchar(100) DEFAULT NULL,
  `awarding_body_accreditation` varchar(255) DEFAULT NULL,
  `regulation_level` varchar(100) DEFAULT NULL,
  `mode_of_delivery` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date_or_duration` varchar(100) DEFAULT NULL,
  `subject_area_discipline` varchar(150) DEFAULT NULL,
  `course_description` text,
  `learning_outcomes` text,
  `units_modules_covered` text,
  `assessment_methods` varchar(150) DEFAULT NULL,
  `entry_requirements` text,
  `tuition_fee_gbp` decimal(10,2) DEFAULT NULL,
  `additional_costs` text,
  `funding_options` varchar(150) DEFAULT NULL,
  `learning_resources_provided` text,
  `special_equipment_needed` text,
  `work_placement_included` varchar(10) DEFAULT NULL,
  `course_leader_programme_director` varchar(255) DEFAULT NULL,
  `internal_verification_contact` varchar(255) DEFAULT NULL,
  `ukvi_approved_course` varchar(10) DEFAULT NULL,
  `approval_date` date DEFAULT NULL,
  `review_date` date DEFAULT NULL,
  `special_admission_considerations` text,
  `progression_opportunities` text,
  `industry_partnerships` text,
  `parent_registration_id` int DEFAULT NULL,
  `is_master` tinyint(1) DEFAULT '1',
  `application_status` enum('draft','submitted','approved','rejected') DEFAULT 'submitted',
  `reviewer_name` varchar(255) DEFAULT NULL,
  `reviewer_notes` text,
  `approved_at` datetime DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `moodle_course_id` int DEFAULT NULL,
  `moodle_sync_status` enum('pending','synced','failed') DEFAULT 'pending',
  `moodle_sync_message` text,
  `last_synced_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registration_reference` (`registration_reference`),
  KEY `idx_course_reg_code` (`course_code`),
  KEY `idx_course_reg_status` (`application_status`),
  KEY `idx_course_reg_sync` (`moodle_sync_status`),
  KEY `idx_intake_id` (`intake_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_registrations`
--

LOCK TABLES `course_registrations` WRITE;
/*!40000 ALTER TABLE `course_registrations` DISABLE KEYS */;
INSERT INTO `course_registrations` VALUES (49,NULL,'CRS-000049','Course-1','HMS-001-Y1-S1-C1','HMS','New Program','Year-1','Semester-1','2026-Sep',NULL,NULL,NULL,NULL,NULL,'HMS','test','RQF Level 6','Blended','2026-04-09','12 months','Business','Course-1 prepares learners with practical and academic skills for progression and employment.','Apply subject knowledge in practical scenarios; demonstrate critical thinking and communication skills.','Module 1: Core Concepts\nModule 2: Applied Practice\nModule 3: Assessment & Reflection','Mixed','Level 3 qualification or equivalent experience.',9250.00,'Materials and certification fees may apply.','Self-funded','Lecture slides, recorded sessions, practical workshops, online quizzes.','Laptop with stable internet.','No','Dr Sarah Mitchell','QA Team','Yes','2026-04-09','2026-10-09','Reasonable adjustments available following assessment.','Progression to advanced study or industry roles.','Employer engagement and guest sessions included.',NULL,1,'submitted',NULL,NULL,NULL,NULL,170,'synced','Course already exists in Moodle | Updated 24 Moodle custom field value(s) | Synced 3 Moodle section(s) | Field \'descriptionformat\' doesn\'t have a default value','2026-04-09 03:57:02','2026-04-09 03:57:02','2026-04-09 03:57:02'),(50,NULL,'CRS-000050','Course-2','HMS-001-Y1-S1-C2','HMS','New Program','Year-1','Semester-1','2026-Sep',NULL,NULL,NULL,NULL,NULL,'HMS','test','RQF Level 3','Blended','2026-04-15','12 months','Engineering','Course-2 prepares learners with practical and academic skills for progression and employment.','Apply subject knowledge in practical scenarios; demonstrate critical thinking and communication skills.','Module 1: Core Concepts\nModule 2: Applied Practice\nModule 3: Assessment & Reflection','Mixed','Level 2 qualification or equivalent experience.',8000.00,'Materials and certification fees may apply.','Self-funded','Lecture slides, recorded sessions, practical workshops, online quizzes.','Laptop with stable internet.','Yes','Dr Sarah Mitchell','QA Team','Yes','2026-04-15','2026-10-15','Reasonable adjustments available following assessment.','Progression to advanced study or industry roles.','Employer engagement and guest sessions included.',NULL,1,'submitted',NULL,NULL,NULL,NULL,171,'synced','Course already exists in Moodle | Updated 24 Moodle custom field value(s) | Synced 3 Moodle section(s) | Field \'descriptionformat\' doesn\'t have a default value','2026-04-15 10:41:39','2026-04-15 10:41:39','2026-04-15 10:41:39'),(51,8,'CRS-000051','Course-1','HMS-001-Y1-S1-C1','HMS','New Program','Year-1','Semester-1','Sep-2026',159,160,161,162,NULL,'HMS','test',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'submitted',NULL,NULL,NULL,NULL,170,'synced','Course already exists in Moodle | Updated 2 Moodle custom field value(s) | No modules supplied; skipped section sync | Field \'descriptionformat\' doesn\'t have a default value','2026-04-15 10:43:15','2026-04-15 10:43:15','2026-04-15 10:43:15'),(52,8,'CRS-000052','Course-2','HMS-001-Y1-S1-C2','HMS','New Program','Year-1','Semester-1','Sep-2026',159,160,161,162,NULL,'HMS','test','RQF Level 6','Blended','2026-04-15','12 months','Business','Course-2 prepares learners with practical and academic skills for progression and employment.','Apply subject knowledge in practical scenarios; demonstrate critical thinking and communication skills.','Module 1: Core Concepts\nModule 2: Applied Practice\nModule 3: Assessment & Reflection\nModule 4: Test','Coursework','Level 3 qualification or equivalent experience.',9250.00,'Materials and certification fees may apply.','Self-funded','Lecture slides, recorded sessions, practical workshops, online quizzes.','Laptop with stable internet.','No','Dr Sarah Mitchell','QA Team','Yes','2026-04-15','2026-10-15','Reasonable adjustments available following assessment.','Progression to advanced study or industry roles.','Employer engagement and guest sessions included.',NULL,1,'submitted',NULL,NULL,NULL,NULL,171,'synced','Course already exists in Moodle | Updated 24 Moodle custom field value(s) | Synced 4 Moodle section(s) | Field \'descriptionformat\' doesn\'t have a default value','2026-04-15 15:32:57','2026-04-15 10:43:15','2026-04-15 15:32:57');
/*!40000 ALTER TABLE `course_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_visits`
--

DROP TABLE IF EXISTS `course_visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_visits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `awarding_body` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visit_type` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visit_date` date DEFAULT NULL,
  `lead_contact_awarding_body` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `college_visit_coordinator` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '1.0',
  `last_updated_date` date DEFAULT NULL,
  `purpose_of_visit` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `scope_focus_areas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `key_standards_regulations` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `visit_agenda` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `required_attendees` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `pre_visit_preparation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `evidence_document_log` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `day_of_visit_management` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `post_visit_actions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `risk_issue_log` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `signoff_details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `overall_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `completion_percentage` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course` (`course_title`),
  KEY `idx_course_code` (`course_code`),
  KEY `idx_status` (`overall_status`),
  KEY `idx_updated_at` (`updated_at`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_visits`
--

LOCK TABLES `course_visits` WRITE;
/*!40000 ALTER TABLE `course_visits` DISABLE KEYS */;
INSERT INTO `course_visits` VALUES (7,'Course-1','HMS-001-Y1-S1-C1','test','Annual Monitoring','2026-05-09','Prof. Helen Woods','QA Manager','1.0','2026-04-09','Routine annual quality monitoring visit.','Assessment quality, student progression, governance compliance.','Partner QA framework, OfS baseline standards.','09:00 Welcome; 10:00 Document review; 12:00 Student panel; 14:00 Feedback.','Principal, QA Manager, Programme Leader, Registry Officer.','[{\"task\":\"Confirm Visit Date & Agenda\",\"description\":\"Confirm with awarding body and circulate internally\",\"evidence_required\":\"Email confirmation\",\"source_reference\":\"Awarding body contact\",\"responsible_person\":\"Visit Coordinator\",\"due_date\":\"2026-04-09\",\"status\":\"Completed\",\"notes\":\"Confirmed by partner.\"},{\"task\":\"Update Institutional Profile\",\"description\":\"Ensure most recent profile is available\",\"evidence_required\":\"Profile document\",\"source_reference\":\"QA folder\",\"responsible_person\":\"QA Manager\",\"due_date\":\"2026-05-09\",\"status\":\"Completed\",\"notes\":\"Final review pending.\"}]','[{\"evidence_item\":\"Programme Specifications\",\"location\":\"QA/Visits/Specs\",\"hard_copy_required\":\"Y\",\"responsible_person\":\"Programme Leader\",\"status\":\"Completed\",\"notes\":\"Latest approved versions attached.\"}]','[{\"time\":\"09:00\",\"activity\":\"Arrival & Welcome\",\"location\":\"Reception\",\"lead_person\":\"Visit Coordinator\",\"notes\":\"\"},{\"time\":\"10:00\",\"activity\":\"Document Review\",\"location\":\"QA Office\",\"lead_person\":\"QA Manager\",\"notes\":\"\"}]','[{\"action_recommendation\":\"Submit revised annual monitoring template\",\"source\":\"Panel feedback\",\"priority\":\"High\",\"responsible_person\":\"QA Manager\",\"due_date\":\"2026-05-09\",\"status\":\"Completed\",\"evidence_completion\":\"\"}]','[{\"risk_issue\":\"Evidence sign-off delay\",\"impact\":\"Could delay partner approval\",\"mitigation_action\":\"Pre-review evidence checklist weekly\",\"owner\":\"Visit Coordinator\",\"status\":\"Completed\",\"review_date\":\"2026-05-09\"}]','[{\"name\":\"Visit Coordinator\",\"role\":\"Coordinator\",\"date\":\"2026-04-09\",\"signature\":\"Signed\"},{\"name\":\"QA Manager\",\"role\":\"QA Manager\",\"date\":\"2026-04-09\",\"signature\":\"Signed\"},{\"name\":\"Principal / CEO\",\"role\":\"Principal / CEO\",\"date\":\"\",\"signature\":\"\"}]','Completed',65,'2026-04-09 03:53:50','2026-04-09 03:53:50'),(8,'Course-2','HMS-001-Y1-S1-C2','test','Annual Monitoring','2026-05-15','Prof. Helen Woods','QA Manager','1.0','2026-04-15','Routine annual quality monitoring visit.','Assessment quality, student progression, governance compliance.','Partner QA framework, OfS baseline standards.','09:00 Welcome; 10:00 Document review; 12:00 Student panel; 14:00 Feedback.','Principal, QA Manager, Programme Leader, Registry Officer.','[{\"task\":\"Confirm Visit Date & Agenda\",\"description\":\"Confirm with awarding body and circulate internally\",\"evidence_required\":\"Email confirmation\",\"source_reference\":\"Awarding body contact\",\"responsible_person\":\"Visit Coordinator\",\"due_date\":\"2026-04-15\",\"status\":\"Completed\",\"notes\":\"Confirmed by partner.\"},{\"task\":\"Update Institutional Profile\",\"description\":\"Ensure most recent profile is available\",\"evidence_required\":\"Profile document\",\"source_reference\":\"QA folder\",\"responsible_person\":\"QA Manager\",\"due_date\":\"2026-05-15\",\"status\":\"Completed\",\"notes\":\"Final review pending.\"}]','[{\"evidence_item\":\"Programme Specifications\",\"location\":\"QA/Visits/Specs\",\"hard_copy_required\":\"Y\",\"responsible_person\":\"Programme Leader\",\"status\":\"Completed\",\"notes\":\"Latest approved versions attached.\"}]','[{\"time\":\"09:00\",\"activity\":\"Arrival & Welcome\",\"location\":\"Reception\",\"lead_person\":\"Visit Coordinator\",\"notes\":\"\"},{\"time\":\"10:00\",\"activity\":\"Document Review\",\"location\":\"QA Office\",\"lead_person\":\"QA Manager\",\"notes\":\"\"}]','[{\"action_recommendation\":\"Submit revised annual monitoring template\",\"source\":\"Panel feedback\",\"priority\":\"High\",\"responsible_person\":\"QA Manager\",\"due_date\":\"2026-05-15\",\"status\":\"Completed\",\"evidence_completion\":\"\"}]','[{\"risk_issue\":\"Evidence sign-off delay\",\"impact\":\"Could delay partner approval\",\"mitigation_action\":\"Pre-review evidence checklist weekly\",\"owner\":\"Visit Coordinator\",\"status\":\"Completed\",\"review_date\":\"2026-05-15\"}]','[{\"name\":\"Visit Coordinator\",\"role\":\"Coordinator\",\"date\":\"2026-04-15\",\"signature\":\"Signed\"},{\"name\":\"QA Manager\",\"role\":\"QA Manager\",\"date\":\"2026-04-15\",\"signature\":\"Signed\"},{\"name\":\"Principal / CEO\",\"role\":\"Principal / CEO\",\"date\":\"\",\"signature\":\"\"}]','Completed',65,'2026-04-15 10:37:35','2026-04-15 10:37:35');
/*!40000 ALTER TABLE `course_visits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disability_documents`
--

DROP TABLE IF EXISTS `disability_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disability_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `document_url` varchar(500) DEFAULT NULL,
  `document_type` varchar(100) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_request` (`request_id`),
  CONSTRAINT `disability_documents_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `disability_requests` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disability_documents`
--

LOCK TABLES `disability_documents` WRITE;
/*!40000 ALTER TABLE `disability_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `disability_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disability_requests`
--

DROP TABLE IF EXISTS `disability_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disability_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `request_type` varchar(100) DEFAULT NULL,
  `description` longtext,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_date` timestamp NULL DEFAULT NULL,
  `valid_until` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disability_requests`
--

LOCK TABLES `disability_requests` WRITE;
/*!40000 ALTER TABLE `disability_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `disability_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback_surveys`
--

DROP TABLE IF EXISTS `feedback_surveys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback_surveys` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `course_id` int DEFAULT NULL,
  `module_code` varchar(50) DEFAULT NULL,
  `feedback_type` varchar(50) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comments` longtext,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_module` (`module_code`),
  KEY `idx_submitted` (`submitted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback_surveys`
--

LOCK TABLES `feedback_surveys` WRITE;
/*!40000 ALTER TABLE `feedback_surveys` DISABLE KEYS */;
/*!40000 ALTER TABLE `feedback_surveys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `induction_conditions`
--

DROP TABLE IF EXISTS `induction_conditions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `induction_conditions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `induction_id` int NOT NULL,
  `condition_recommendation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `action_required` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `deadline` date DEFAULT NULL,
  `responsible_person` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Open',
  `evidence` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_induction_id` (`induction_id`),
  CONSTRAINT `induction_conditions_ibfk_1` FOREIGN KEY (`induction_id`) REFERENCES `course_inductions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `induction_conditions`
--

LOCK TABLES `induction_conditions` WRITE;
/*!40000 ALTER TABLE `induction_conditions` DISABLE KEYS */;
INSERT INTO `induction_conditions` VALUES (15,7,'Update student handbook','Align handbook with approved curriculum and assessment policy.','2026-07-08','Registry Manager','Open',NULL,'2026-04-09 03:56:18','2026-04-09 03:56:18'),(16,8,'Update student handbook','Align handbook with approved curriculum and assessment policy.','2026-07-14','Registry Manager','Open',NULL,'2026-04-15 10:39:44','2026-04-15 10:39:44');
/*!40000 ALTER TABLE `induction_conditions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `induction_requirements`
--

DROP TABLE IF EXISTS `induction_requirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `induction_requirements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `induction_id` int NOT NULL,
  `section_number` int DEFAULT NULL,
  `section_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requirement_area` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `source_reference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `evidence_held` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsible_person` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `compliance_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Not Verified',
  `review_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_induction_id` (`induction_id`),
  KEY `idx_section_number` (`section_number`),
  CONSTRAINT `induction_requirements_ibfk_1` FOREIGN KEY (`induction_id`) REFERENCES `course_inductions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=265 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `induction_requirements`
--

LOCK TABLES `induction_requirements` WRITE;
/*!40000 ALTER TABLE `induction_requirements` DISABLE KEYS */;
INSERT INTO `induction_requirements` VALUES (199,7,1,'Course Approval Details','Programme Specification','Approved and finalised version','Policy ref 1.1','Evidence file 1.1','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:17','2026-04-09 03:56:17'),(200,7,1,'Course Approval Details','Learning Outcomes','As approved, mapped to framework','Policy ref 1.2','Evidence file 1.2','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:17','2026-04-09 03:56:17'),(201,7,1,'Course Approval Details','Curriculum Structure','Module titles, codes, credit values','Policy ref 1.3','Evidence file 1.3','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:17','2026-04-09 03:56:17'),(202,7,1,'Course Approval Details','Assessment Strategy','Weighting, method, moderation','Policy ref 1.4','Evidence file 1.4','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:17','2026-04-09 03:56:17'),(203,7,2,'Staffing Requirements','Minimum Qualifications','E.g., teaching qualification + subject expertise','Policy ref 2.1','Evidence file 2.1','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:17','2026-04-09 03:56:17'),(204,7,2,'Staffing Requirements','External Examiner','Appointed, trained, approved','Policy ref 2.2','Evidence file 2.2','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:17','2026-04-09 03:56:17'),(205,7,2,'Staffing Requirements','CPD Requirements','Annual hours or activities','Policy ref 2.3','Evidence file 2.3','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:17','2026-04-09 03:56:17'),(206,7,3,'Facilities & Resources','Classroom / Lab Standards','Min size, equipment, accessibility','Policy ref 3.1','Evidence file 3.1','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:17','2026-04-09 03:56:17'),(207,7,3,'Facilities & Resources','Library & Learning Resources','Physical and digital access','Policy ref 3.2','Evidence file 3.2','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:17','2026-04-09 03:56:17'),(208,7,3,'Facilities & Resources','Specialist Equipment','Software, instruments, safety equipment','Policy ref 3.3','Evidence file 3.3','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:17','2026-04-09 03:56:17'),(209,7,4,'Admission & Enrolment','Entry Requirements','Academic and/or work experience criteria','Policy ref 4.1','Evidence file 4.1','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:17','2026-04-09 03:56:17'),(210,7,4,'Admission & Enrolment','English Language Requirements','Minimum IELTS/TOEFL or equivalent','Policy ref 4.2','Evidence file 4.2','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:17','2026-04-09 03:56:17'),(211,7,4,'Admission & Enrolment','Recognition of Prior Learning (RPL)','Process for credit transfer or exemption','Policy ref 4.3','Evidence file 4.3','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(212,7,4,'Admission & Enrolment','Application Process','Forms, deadlines, documents required','Policy ref 4.4','Evidence file 4.4','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(213,7,4,'Admission & Enrolment','Offer Letter Format','Partner-approved wording & conditions','Policy ref 4.5','Evidence file 4.5','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(214,7,4,'Admission & Enrolment','Enrolment Documentation','Proof of ID, qualifications, visas','Policy ref 4.6','Evidence file 4.6','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(215,7,5,'Fees & Payment Frequencies','Partner Accreditation Fees','Annual/periodic validation or licence fees','Policy ref 5.1','Evidence file 5.1','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(216,7,5,'Fees & Payment Frequencies','Per-Student Registration Fees','Fee per student to awarding body','Policy ref 5.2','Evidence file 5.2','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(217,7,5,'Fees & Payment Frequencies','Exam / Assessment Fees','Fees for exam entries or moderation','Policy ref 5.3','Evidence file 5.3','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(218,7,5,'Fees & Payment Frequencies','Payment Schedule','Agreed payment dates & frequency','Policy ref 5.4','Evidence file 5.4','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(219,7,5,'Fees & Payment Frequencies','Student Tuition Fee Structure','Approved rates & instalment plan','Policy ref 5.5','Evidence file 5.5','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(220,7,6,'Student Support & Administration','Induction Programme','Schedule, content, materials','Policy ref 6.1','Evidence file 6.1','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(221,7,6,'Student Support & Administration','Academic Guidance','Tutor allocation, office hours','Policy ref 6.2','Evidence file 6.2','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(222,7,6,'Student Support & Administration','Accessibility & Inclusivity','Reasonable adjustments, resources','Policy ref 6.3','Evidence file 6.3','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(223,7,7,'Returns & Reports to Awarding Body','Student Registration Data','Enrolment list sent within 30 days','Policy ref 7.1','Evidence file 7.1','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(224,7,7,'Returns & Reports to Awarding Body','Assessment Results','Marks and grades reporting','Policy ref 7.2','Evidence file 7.2','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(225,7,7,'Returns & Reports to Awarding Body','Annual Monitoring Report','Quality review & performance data','Policy ref 7.3','Evidence file 7.3','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(226,7,7,'Returns & Reports to Awarding Body','External Examiner Reports','Submission to partner','Policy ref 7.4','Evidence file 7.4','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(227,7,7,'Returns & Reports to Awarding Body','Financial Returns','Student registration fee reconciliation','Policy ref 7.5','Evidence file 7.5','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(228,7,8,'Quality Assurance & Compliance','Annual Monitoring','Data submission deadlines','Policy ref 8.1','Evidence file 8.1','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(229,7,8,'Quality Assurance & Compliance','Assessment Board Attendance','Required staff presence','Policy ref 8.2','Evidence file 8.2','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(230,7,8,'Quality Assurance & Compliance','Policy Alignment','College policies mapped to partner','Policy ref 8.3','Evidence file 8.3','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(231,7,8,'Quality Assurance & Compliance','Revalidation Cycle','Timeline & requirements','Policy ref 8.4','Evidence file 8.4','Programme Team','Completed','Auto-filled test data','2026-04-09 03:56:18','2026-04-09 03:56:18'),(232,8,1,'Course Approval Details','Programme Specification','Approved and finalised version','Policy ref 1.1','Evidence file 1.1','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:37','2026-04-15 10:39:37'),(233,8,1,'Course Approval Details','Learning Outcomes','As approved, mapped to framework','Policy ref 1.2','Evidence file 1.2','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:37','2026-04-15 10:39:37'),(234,8,1,'Course Approval Details','Curriculum Structure','Module titles, codes, credit values','Policy ref 1.3','Evidence file 1.3','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:37','2026-04-15 10:39:37'),(235,8,1,'Course Approval Details','Assessment Strategy','Weighting, method, moderation','Policy ref 1.4','Evidence file 1.4','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:37','2026-04-15 10:39:37'),(236,8,2,'Staffing Requirements','Minimum Qualifications','E.g., teaching qualification + subject expertise','Policy ref 2.1','Evidence file 2.1','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:38','2026-04-15 10:39:38'),(237,8,2,'Staffing Requirements','External Examiner','Appointed, trained, approved','Policy ref 2.2','Evidence file 2.2','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:38','2026-04-15 10:39:38'),(238,8,2,'Staffing Requirements','CPD Requirements','Annual hours or activities','Policy ref 2.3','Evidence file 2.3','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:38','2026-04-15 10:39:38'),(239,8,3,'Facilities & Resources','Classroom / Lab Standards','Min size, equipment, accessibility','Policy ref 3.1','Evidence file 3.1','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:38','2026-04-15 10:39:38'),(240,8,3,'Facilities & Resources','Library & Learning Resources','Physical and digital access','Policy ref 3.2','Evidence file 3.2','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:39','2026-04-15 10:39:39'),(241,8,3,'Facilities & Resources','Specialist Equipment','Software, instruments, safety equipment','Policy ref 3.3','Evidence file 3.3','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:39','2026-04-15 10:39:39'),(242,8,4,'Admission & Enrolment','Entry Requirements','Academic and/or work experience criteria','Policy ref 4.1','Evidence file 4.1','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:39','2026-04-15 10:39:39'),(243,8,4,'Admission & Enrolment','English Language Requirements','Minimum IELTS/TOEFL or equivalent','Policy ref 4.2','Evidence file 4.2','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:39','2026-04-15 10:39:39'),(244,8,4,'Admission & Enrolment','Recognition of Prior Learning (RPL)','Process for credit transfer or exemption','Policy ref 4.3','Evidence file 4.3','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:40','2026-04-15 10:39:40'),(245,8,4,'Admission & Enrolment','Application Process','Forms, deadlines, documents required','Policy ref 4.4','Evidence file 4.4','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:40','2026-04-15 10:39:40'),(246,8,4,'Admission & Enrolment','Offer Letter Format','Partner-approved wording & conditions','Policy ref 4.5','Evidence file 4.5','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:40','2026-04-15 10:39:40'),(247,8,4,'Admission & Enrolment','Enrolment Documentation','Proof of ID, qualifications, visas','Policy ref 4.6','Evidence file 4.6','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:40','2026-04-15 10:39:40'),(248,8,5,'Fees & Payment Frequencies','Partner Accreditation Fees','Annual/periodic validation or licence fees','Policy ref 5.1','Evidence file 5.1','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:40','2026-04-15 10:39:40'),(249,8,5,'Fees & Payment Frequencies','Per-Student Registration Fees','Fee per student to awarding body','Policy ref 5.2','Evidence file 5.2','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:41','2026-04-15 10:39:41'),(250,8,5,'Fees & Payment Frequencies','Exam / Assessment Fees','Fees for exam entries or moderation','Policy ref 5.3','Evidence file 5.3','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:41','2026-04-15 10:39:41'),(251,8,5,'Fees & Payment Frequencies','Payment Schedule','Agreed payment dates & frequency','Policy ref 5.4','Evidence file 5.4','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:41','2026-04-15 10:39:41'),(252,8,5,'Fees & Payment Frequencies','Student Tuition Fee Structure','Approved rates & instalment plan','Policy ref 5.5','Evidence file 5.5','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:41','2026-04-15 10:39:41'),(253,8,6,'Student Support & Administration','Induction Programme','Schedule, content, materials','Policy ref 6.1','Evidence file 6.1','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:41','2026-04-15 10:39:41'),(254,8,6,'Student Support & Administration','Academic Guidance','Tutor allocation, office hours','Policy ref 6.2','Evidence file 6.2','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:42','2026-04-15 10:39:42'),(255,8,6,'Student Support & Administration','Accessibility & Inclusivity','Reasonable adjustments, resources','Policy ref 6.3','Evidence file 6.3','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:42','2026-04-15 10:39:42'),(256,8,7,'Returns & Reports to Awarding Body','Student Registration Data','Enrolment list sent within 30 days','Policy ref 7.1','Evidence file 7.1','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:42','2026-04-15 10:39:42'),(257,8,7,'Returns & Reports to Awarding Body','Assessment Results','Marks and grades reporting','Policy ref 7.2','Evidence file 7.2','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:42','2026-04-15 10:39:42'),(258,8,7,'Returns & Reports to Awarding Body','Annual Monitoring Report','Quality review & performance data','Policy ref 7.3','Evidence file 7.3','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:42','2026-04-15 10:39:42'),(259,8,7,'Returns & Reports to Awarding Body','External Examiner Reports','Submission to partner','Policy ref 7.4','Evidence file 7.4','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:43','2026-04-15 10:39:43'),(260,8,7,'Returns & Reports to Awarding Body','Financial Returns','Student registration fee reconciliation','Policy ref 7.5','Evidence file 7.5','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:43','2026-04-15 10:39:43'),(261,8,8,'Quality Assurance & Compliance','Annual Monitoring','Data submission deadlines','Policy ref 8.1','Evidence file 8.1','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:43','2026-04-15 10:39:43'),(262,8,8,'Quality Assurance & Compliance','Assessment Board Attendance','Required staff presence','Policy ref 8.2','Evidence file 8.2','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:43','2026-04-15 10:39:43'),(263,8,8,'Quality Assurance & Compliance','Policy Alignment','College policies mapped to partner','Policy ref 8.3','Evidence file 8.3','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:44','2026-04-15 10:39:44'),(264,8,8,'Quality Assurance & Compliance','Revalidation Cycle','Timeline & requirements','Policy ref 8.4','Evidence file 8.4','Programme Team','Completed','Auto-filled test data','2026-04-15 10:39:44','2026-04-15 10:39:44');
/*!40000 ALTER TABLE `induction_requirements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `induction_risks`
--

DROP TABLE IF EXISTS `induction_risks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `induction_risks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `induction_id` int NOT NULL,
  `risk_issue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `impact` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mitigation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Open',
  `review_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_induction_id` (`induction_id`),
  CONSTRAINT `induction_risks_ibfk_1` FOREIGN KEY (`induction_id`) REFERENCES `course_inductions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `induction_risks`
--

LOCK TABLES `induction_risks` WRITE;
/*!40000 ALTER TABLE `induction_risks` DISABLE KEYS */;
INSERT INTO `induction_risks` VALUES (15,7,'Late timetabling risk','Medium','Reserve backup teaching slots and staff availability.','Timetable Officer','Open',NULL,'2026-04-09 03:56:18','2026-04-09 03:56:18'),(16,8,'Late timetabling risk','Medium','Reserve backup teaching slots and staff availability.','Timetable Officer','Open',NULL,'2026-04-15 10:39:44','2026-04-15 10:39:44');
/*!40000 ALTER TABLE `induction_risks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `induction_signoffs`
--

DROP TABLE IF EXISTS `induction_signoffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `induction_signoffs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `induction_id` int NOT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sign_date` date DEFAULT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_induction_id` (`induction_id`),
  CONSTRAINT `induction_signoffs_ibfk_1` FOREIGN KEY (`induction_id`) REFERENCES `course_inductions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `induction_signoffs`
--

LOCK TABLES `induction_signoffs` WRITE;
/*!40000 ALTER TABLE `induction_signoffs` DISABLE KEYS */;
INSERT INTO `induction_signoffs` VALUES (30,7,'Programme Leader','Dr Sarah Mitchell',NULL,NULL,'2026-04-09 03:56:18','2026-04-09 03:56:18'),(31,7,'QA Manager','Mr John Carter',NULL,NULL,'2026-04-09 03:56:18','2026-04-09 03:56:18'),(32,7,'Senior Management','Ms Anna Reid',NULL,NULL,'2026-04-09 03:56:18','2026-04-09 03:56:18'),(33,8,'Programme Leader','Dr Sarah Mitchell',NULL,NULL,'2026-04-15 10:39:44','2026-04-15 10:39:44'),(34,8,'QA Manager','Mr John Carter',NULL,NULL,'2026-04-15 10:39:45','2026-04-15 10:39:45'),(35,8,'Senior Management','Ms Anna Reid',NULL,NULL,'2026-04-15 10:39:45','2026-04-15 10:39:45');
/*!40000 ALTER TABLE `induction_signoffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text,
  `body` text,
  `notification_data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_email` (`email`),
  KEY `idx_type` (`type`),
  KEY `idx_created` (`created_at`),
  KEY `idx_is_read` (`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,NULL,'ahmed.hassan.app@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n???? Email/Username: ahmed.hassan.app@example.com\n???? Temporary Password: ed0abf2e4945\n\nCourse: Business Administration HND\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"Business Administration HND\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"ahmed.hassan.app@example.com\", \"password\": \"ed0abf2e4945\"}, \"applicant_name\": \"Ahmed Hassan\", \"moodle_enrollment\": false}',1,'2026-02-07 14:45:53','2026-02-07 12:41:11','2026-02-07 14:45:53'),(2,NULL,'ahmed.hassan.app@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n???? Email/Username: ahmed.hassan.app@example.com\n???? Temporary Password: ed0abf2e4945\n\nCourse: Business Administration HND\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"Business Administration HND\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"ahmed.hassan.app@example.com\", \"password\": \"ed0abf2e4945\"}, \"applicant_name\": \"Ahmed Hassan\", \"moodle_enrollment\": false}',1,'2026-02-07 14:45:28','2026-02-07 13:03:52','2026-02-07 14:45:28'),(3,NULL,'noor.ahmed.app@example.com','conditional_offer','Conditional Offer - SCL Institute',NULL,'\nConditional Offer - SCL Institute\n\nDear Noor Ahmed,\n\nCongratulations! You have received a conditional offer for:\n\n???? Course: English Language Course\n\nConditions:\ntest\n\nYour temporary account credentials have been created:\n???? Email/Username: noor.ahmed.app@example.com\n???? Temporary Password: 0e51d63ca1c6\n\nPlease login to your portal at: http://localhost:3000/student/login\n\nOnce you fulfill the conditions, you will be fully enrolled in the course and Moodle LMS.\n\nBest regards,\nSCL Institute Admissions Team\n                    ','{\"course\": \"English Language Course\", \"conditions\": \"test\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"noor.ahmed.app@example.com\", \"password\": \"0e51d63ca1c6\"}, \"applicant_name\": \"Noor Ahmed\"}',0,NULL,'2026-02-07 14:43:38','2026-02-07 14:43:38'),(4,NULL,'mohammed.khan.app@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n???? Email/Username: mohammed.khan.app@example.com\n???? Temporary Password: 153e9b0c62fc\n\nCourse: Accounting and Finance HND\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"Accounting and Finance HND\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"mohammed.khan.app@example.com\", \"password\": \"153e9b0c62fc\"}, \"applicant_name\": \"Mohammed Khan\", \"moodle_enrollment\": false}',0,NULL,'2026-02-07 14:44:32','2026-02-07 14:44:32'),(5,NULL,'mohammed.hassan@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n???? Email/Username: mohammed.hassan@example.com\n???? Temporary Password: 1e268c2f2238\n\nCourse: Artificial Intelligence Basics\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"Artificial Intelligence Basics\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"mohammed.hassan@example.com\", \"password\": \"1e268c2f2238\"}, \"applicant_name\": \"Mohammed Hassan\", \"moodle_enrollment\": false}',1,'2026-02-08 09:24:00','2026-02-08 09:22:31','2026-02-08 09:24:00'),(6,NULL,'mohammed.khalid@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n???? Email/Username: mohammed.khalid@example.com\n???? Temporary Password: 26cd6e25676b\n\nCourse: Artificial Intelligence & Machine Learning Certification\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"Artificial Intelligence & Machine Learning Certification\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"mohammed.khalid@example.com\", \"password\": \"26cd6e25676b\"}, \"applicant_name\": \"Mohammed khan\", \"moodle_enrollment\": false}',1,'2026-02-11 15:26:41','2026-02-11 15:25:16','2026-02-11 15:26:41'),(7,NULL,'noor.ahmed.app@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\nG????+?-? Email/Username: noor.ahmed.app@example.com\nG????+?+? Temporary Password: 0e51d63ca1c6\n\nCourse: English Language Course\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"English Language Course\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"noor.ahmed.app@example.com\", \"password\": \"0e51d63ca1c6\"}, \"applicant_name\": \"Noor Ahmed\", \"moodle_enrollment\": false}',0,NULL,'2026-03-05 12:05:47','2026-03-05 12:05:47'),(8,NULL,'mohammed.khalid@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\nG????+?-? Email/Username: mohammed.khalid@example.com\nG????+?+? Temporary Password: 26cd6e25676b\n\nCourse: HND in Hospitality Management\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"HND in Hospitality Management\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"mohammed.khalid@example.com\", \"password\": \"26cd6e25676b\"}, \"applicant_name\": \"Mohammed khan\", \"moodle_enrollment\": false}',0,NULL,'2026-03-05 12:41:23','2026-03-05 12:41:23'),(9,NULL,'ahmed.hassan.app@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\nG????+?-? Email/Username: ahmed.hassan.app@example.com\nG????+?+? Temporary Password: ed0abf2e4945\n\nCourse: HND IN BUSINESS RQF\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"HND IN BUSINESS RQF\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"ahmed.hassan.app@example.com\", \"password\": \"ed0abf2e4945\"}, \"applicant_name\": \"Ahmed Hassan\", \"moodle_enrollment\": true}',0,NULL,'2026-03-11 17:25:51','2026-03-11 17:25:51'),(10,NULL,'mohammed.khan.app@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\nG????+?-? Email/Username: mohammed.khan.app@example.com\nG????+?+? Temporary Password: 153e9b0c62fc\n\nCourse: HND IN HOSPITALITY MANAGEMENT\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"HND IN HOSPITALITY MANAGEMENT\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"mohammed.khan.app@example.com\", \"password\": \"153e9b0c62fc\"}, \"applicant_name\": \"Mohammed Khan\", \"moodle_enrollment\": true, \"moodle_single_programme_cleanup\": {\"current_programme_code\": \"HND-004\", \"other_programme_unenrollment\": {\"method\": \"hard-unenrol\", \"message\": \"No Moodle courses to remove\", \"success\": true, \"courseCount\": 0}, \"other_programme_cohort_cleanup\": {\"message\": \"No non-current programme cohort memberships found\", \"success\": true, \"removedCount\": 0}, \"removed_other_programme_courses\": [], \"removed_other_programme_course_count\": 0}}',0,NULL,'2026-03-12 05:49:53','2026-03-12 05:49:53'),(11,NULL,'fatima.ali.app@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\nG????+?-? Email/Username: fatima.ali.app@example.com\nG????+?+? Temporary Password: 0f199f5a623f\n\nCourse: HND in Leadership and Management for England Course\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"HND in Leadership and Management for England Course\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"fatima.ali.app@example.com\", \"password\": \"0f199f5a623f\"}, \"applicant_name\": \"Fatima Ali\", \"moodle_enrollment\": false, \"moodle_single_programme_cleanup\": {\"current_programme_code\": \"HND-002\", \"other_programme_unenrollment\": {\"method\": \"hard-unenrol\", \"message\": \"No Moodle courses to remove\", \"success\": true, \"courseCount\": 0}, \"other_programme_cohort_cleanup\": {\"message\": \"User not found in Moodle; no cohort memberships removed\", \"success\": true, \"removedCount\": 0}, \"removed_other_programme_courses\": [], \"removed_other_programme_course_count\": 0}}',0,NULL,'2026-03-13 11:14:45','2026-03-13 11:14:45'),(12,NULL,'syed.m.umer@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n????????? Email/Username: syed.m.umer@example.com\n????????? Temporary Password: dcecc1e471f2\n\nCourse: hhhh\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"hhhh\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"syed.m.umer@example.com\", \"password\": \"dcecc1e471f2\"}, \"applicant_name\": \"Syed Umer\", \"moodle_enrollment\": true, \"moodle_single_programme_cleanup\": {\"current_programme_code\": \"JJJ-HHHH-APR-2027\", \"other_programme_unenrollment\": {\"method\": \"hard-unenrol\", \"message\": \"No Moodle courses to remove\", \"success\": true, \"courseCount\": 0}, \"other_programme_cohort_cleanup\": {\"message\": \"User not found in Moodle; no cohort memberships removed\", \"success\": true, \"removedCount\": 0}, \"removed_other_programme_courses\": [], \"removed_other_programme_course_count\": 0}}',0,NULL,'2026-04-06 12:10:32','2026-04-06 12:10:32'),(13,NULL,'syed.m.umer@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n????????? Email/Username: syed.m.umer@example.com\n????????? Temporary Password: dcecc1e471f2\n\nCourse: hhhh\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"hhhh\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"syed.m.umer@example.com\", \"password\": \"dcecc1e471f2\"}, \"applicant_name\": \"Syed Umer\", \"moodle_enrollment\": true, \"moodle_single_programme_cleanup\": {\"current_programme_code\": \"JJJ-HHHH-APR-2027\", \"other_programme_unenrollment\": {\"method\": \"hard-unenrol\", \"message\": \"No Moodle courses to remove\", \"success\": true, \"courseCount\": 0}, \"other_programme_cohort_cleanup\": {\"message\": \"User not found in Moodle; no cohort memberships removed\", \"success\": true, \"removedCount\": 0}, \"removed_other_programme_courses\": [], \"removed_other_programme_course_count\": 0}}',0,NULL,'2026-04-06 12:13:46','2026-04-06 12:13:46'),(14,NULL,'syed.m.umer@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n????????? Email/Username: syed.m.umer@example.com\n????????? Temporary Password: dcecc1e471f2\n\nCourse: hhhh\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"hhhh\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"syed.m.umer@example.com\", \"password\": \"dcecc1e471f2\"}, \"applicant_name\": \"Syed Umer\", \"moodle_enrollment\": true, \"moodle_single_programme_cleanup\": {\"current_programme_code\": \"JJJ-HHHH-APR-2027\", \"other_programme_unenrollment\": {\"method\": \"hard-unenrol\", \"message\": \"No Moodle courses to remove\", \"success\": true, \"courseCount\": 0}, \"other_programme_cohort_cleanup\": {\"message\": \"No non-current programme cohort memberships found\", \"success\": true, \"removedCount\": 0}, \"removed_other_programme_courses\": [], \"removed_other_programme_course_count\": 0}}',0,NULL,'2026-04-06 12:21:47','2026-04-06 12:21:47'),(15,NULL,'asad.ali@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n≡ƒôº Email/Username: asad.ali@example.com\n≡ƒöÉ Temporary Password: 2ff8db1bb507\n\nCourse: New Program\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"New Program\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"asad.ali@example.com\", \"password\": \"2ff8db1bb507\"}, \"applicant_name\": \"Asad Ali\", \"moodle_enrollment\": true, \"moodle_single_programme_cleanup\": {\"current_programme_code\": \"HMS-NEW-PROGRA-SEP-2026\", \"other_programme_unenrollment\": {\"method\": \"hard-unenrol\", \"message\": \"No Moodle courses to remove\", \"success\": true, \"courseCount\": 0}, \"other_programme_cohort_cleanup\": {\"message\": \"No non-current programme cohort memberships found\", \"success\": true, \"removedCount\": 0}, \"removed_other_programme_courses\": [], \"removed_other_programme_course_count\": 0}}',0,NULL,'2026-04-15 15:44:35','2026-04-15 15:44:35');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program_year_cohorts`
--

DROP TABLE IF EXISTS `program_year_cohorts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program_year_cohorts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `program_code` varchar(50) NOT NULL,
  `academic_year` varchar(50) NOT NULL,
  `program_name` varchar(255) DEFAULT NULL,
  `programme_type_name` varchar(255) DEFAULT NULL,
  `moodle_cohort_id` int DEFAULT NULL,
  `moodle_cohort_idnumber` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_program_year` (`program_code`,`academic_year`),
  KEY `idx_program_code` (`program_code`),
  KEY `idx_moodle_cohort` (`moodle_cohort_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program_year_cohorts`
--

LOCK TABLES `program_year_cohorts` WRITE;
/*!40000 ALTER TABLE `program_year_cohorts` DISABLE KEYS */;
/*!40000 ALTER TABLE `program_year_cohorts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programme_intakes`
--

DROP TABLE IF EXISTS `programme_intakes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programme_intakes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `programme_type_name` varchar(255) NOT NULL,
  `program_name` varchar(255) NOT NULL,
  `intake_label` varchar(100) NOT NULL,
  `intake_start_date` date DEFAULT NULL,
  `intake_end_date` date DEFAULT NULL,
  `moodle_cohort_id` int DEFAULT NULL,
  `moodle_cohort_idnumber` varchar(255) DEFAULT NULL,
  `programme_type_category_id` int DEFAULT NULL,
  `program_category_id` int DEFAULT NULL,
  `status` enum('active','closed') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_programme_intake` (`programme_type_name`,`program_name`,`intake_label`),
  KEY `idx_intake_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programme_intakes`
--

LOCK TABLES `programme_intakes` WRITE;
/*!40000 ALTER TABLE `programme_intakes` DISABLE KEYS */;
INSERT INTO `programme_intakes` VALUES (6,'HND','HND IN BUSINESS RQF','Sep-2026',NULL,NULL,7,'hnd-hnd-in-bus-sep-2026',3,23,'active','2026-04-06 15:31:04','2026-04-06 15:31:04'),(7,'HND','HND IN BUSINESS RQF','Sep-2027',NULL,NULL,8,'hnd-hnd-in-bus-sep-2027',3,23,'active','2026-04-06 15:31:51','2026-04-06 15:31:51'),(8,'HMS','New Program','Sep-2026','2026-09-15','2027-09-15',9,'hms-new-progra-sep-2026',159,160,'active','2026-04-15 10:43:15','2026-04-15 10:43:15');
/*!40000 ALTER TABLE `programme_intakes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`),
  KEY `idx_role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Super Admin','Full system access to all modules','2026-02-07 11:38:15'),(2,'LMS Manager','Manages course delivery, assessments, grading','2026-02-07 11:38:15'),(3,'Admissions Officer','Manages student applications, admissions, onboarding','2026-02-07 11:38:15'),(4,'Faculty & HR Manager','Manages faculty recruitment, HR records','2026-02-07 11:38:15'),(5,'Teacher','Teaches courses and manages student learning','2026-02-07 11:38:15'),(6,'Student','Enrolled in courses','2026-02-07 11:38:15'),(7,'Manager','Manages department operations','2026-02-07 11:38:15');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safeguarding_reports`
--

DROP TABLE IF EXISTS `safeguarding_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `safeguarding_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `report_type` varchar(50) DEFAULT NULL,
  `description` longtext NOT NULL,
  `severity` varchar(20) DEFAULT 'medium',
  `status` varchar(50) DEFAULT 'reported',
  `confidential` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `assigned_to` varchar(255) DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_severity` (`severity`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safeguarding_reports`
--

LOCK TABLES `safeguarding_reports` WRITE;
/*!40000 ALTER TABLE `safeguarding_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `safeguarding_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safeguarding_timeline`
--

DROP TABLE IF EXISTS `safeguarding_timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `safeguarding_timeline` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_id` int NOT NULL,
  `action_taken` longtext,
  `notes` longtext,
  `updated_by` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `visible_to_student` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_report` (`report_id`),
  CONSTRAINT `safeguarding_timeline_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `safeguarding_reports` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safeguarding_timeline`
--

LOCK TABLES `safeguarding_timeline` WRITE;
/*!40000 ALTER TABLE `safeguarding_timeline` DISABLE KEYS */;
/*!40000 ALTER TABLE `safeguarding_timeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scl_local_categories`
--

DROP TABLE IF EXISTS `scl_local_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scl_local_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_local_id` int DEFAULT NULL,
  `parent_moodle_id` int DEFAULT NULL,
  `moodle_category_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scl_local_categories`
--

LOCK TABLES `scl_local_categories` WRITE;
/*!40000 ALTER TABLE `scl_local_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `scl_local_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sso_tokens`
--

DROP TABLE IF EXISTS `sso_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sso_tokens` (
  `token` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `redirect_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sso_tokens`
--

LOCK TABLES `sso_tokens` WRITE;
/*!40000 ALTER TABLE `sso_tokens` DISABLE KEYS */;
INSERT INTO `sso_tokens` VALUES ('0432af29-6fed-4466-92c0-f257c7b6862f','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-03-05 09:42:05'),('064ce4e7-3c82-4f70-b320-60970f8542b1','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:46:17'),('0861e1fb-6153-47d3-adca-3f5901a76697','ahmed.hassan.app@example.com','Ahmed','Hassan','student',NULL,'2026-02-08 05:45:49'),('0aeddb16-f46f-4f3b-a163-2f322616d920','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:56:01'),('0b60af48-7d18-4394-90fd-9d705a623a77','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:54:01'),('0b81eca4-980b-4cd5-97b7-613ee4db5a18','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 12:21:58'),('10700bca-4139-4601-8bfd-b1f19446c98a','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:06:37'),('1178e371-f46d-49ce-9634-6d1cba2508a4','lmsmanager@scl.edu','LMS','Manager','LMS Manager',NULL,'2026-02-07 12:03:20'),('18fa5bc9-fcd2-4bf0-b887-6f5bfb8508ca','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-03-05 09:40:50'),('27a5045a-597f-41c3-8f71-a6c7d7ae0773','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:44:58'),('27b627e8-6451-4736-b1f9-fa554ecefd87','ahmed.hassan.app@example.com','Ahmed','Hassan','student',NULL,'2026-02-08 05:43:41'),('2a960e57-a742-40a3-9924-3ec8560dc387','student.ali.001@scl.edu','Ali','Hassan','Student',NULL,'2026-02-22 07:59:35'),('32cb2360-c6dd-4335-b9ae-0c88446868a7','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-22 08:13:39'),('3420b314-562d-4aad-a668-becb786500a5','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:54:11'),('3715b1ed-5b6c-4b1f-a3bf-d5b29628b8aa','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 15:46:45'),('4a7612a6-91d1-45f3-b9ed-b4f13015d62e','manager.dept.business@scl.edu','Business','Manager','Manager',NULL,'2026-03-08 05:25:57'),('4f9c8148-7404-4f1d-ab55-089cb6ebca8f','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:25:38'),('548f2cbf-2c14-4cfd-9a41-1ac7e127a53e','student.ali.001@scl.edu','Ali','Hassan','Student',NULL,'2026-02-07 11:47:21'),('555f68fa-375a-4662-8a68-9abbe44c2e2f','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 16:18:59'),('5a769eb0-7ebe-4a56-ad09-103170b05da2','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 16:19:36'),('5c37dc50-88c1-429d-935b-be1f7315ad17','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 04:56:55'),('617dc3d0-0e05-4a9a-abfa-e7e4548d57f3','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-03-05 09:38:40'),('62b64b87-0a3c-42b1-8655-8f2b1f664520','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 12:02:23'),('64614446-6038-4674-8231-7794ab1ca20c','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:05:23'),('6dbc5ba8-5ed1-48f5-a81e-464bbb5e5005','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:36:20'),('71a28088-6334-4f92-a16c-22a959a7c4d9','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:47:42'),('74982914-0f13-480c-bfdd-2f77f92d738a','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-22 08:14:08'),('7d51a6cb-653b-4a2f-83cf-66e5959cd510','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-03-26 20:56:11'),('87a3acda-b542-4d04-a7e2-74669068871a','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:46:22'),('8f402794-8e66-40b3-8c6e-f2cb99303815','student.ali.001@scl.edu','Ali','Hassan','Student',NULL,'2026-02-22 07:58:21'),('906902b8-196e-45af-a290-99bd9fc3fe2b','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:43:30'),('95fd1b00-100f-4347-bcfe-26f9e989618e','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:12:24'),('9677d715-6a5c-4e92-919d-2e264012a1c6','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 12:01:46'),('9cf41978-21d9-493f-88a3-239988274854','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:53:44'),('a0cca436-4c51-4cde-98ab-3d2d0ee9432f','lmsmanager@scl.edu','LMS','Manager','LMS Manager',NULL,'2026-02-07 12:03:04'),('ab2edc8a-9ef8-4bc1-8746-bd75e5c28fb2','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 16:13:40'),('b000ab04-5f58-4f6c-ab34-d9e6f6c73738','ahmed.hassan.app@example.com','Ahmed','Hassan','student',NULL,'2026-02-08 05:38:48'),('b4937456-bf7e-48c5-b780-97e09acf9dc4','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 15:45:40'),('b7289303-d391-46fb-94ad-606674360f43','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:22:25'),('c1ff457e-6685-4fb8-a933-e62c9186a51f','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:04:30'),('c4f5d9aa-c7ba-4b6b-96d9-455e17aef2fc','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:15:10'),('c9659a15-213b-4b05-be1d-815f8d5a34be','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-03-13 11:11:46'),('d39a1baf-e20f-4075-9407-9adc681875db','ahmed.hassan.app@example.com','Ahmed','Hassan','student',NULL,'2026-02-07 17:06:52'),('d4041742-3b59-43d6-b958-64f5fd0674e5','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-03-05 09:35:19'),('d55c259b-13f8-42ef-b5ef-35f2c19e11f0','student.ali.001@scl.edu','Ali','Hassan','Student',NULL,'2026-02-07 12:05:06'),('d814d233-6ab5-43c1-82af-d9c401f52934','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 14:30:03'),('dbe27970-3f40-413d-8e9e-f09fc25c0171','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 12:02:31'),('dcd2f9d5-dd1a-40aa-9bd0-4b0afefa3802','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:42:13'),('e2fcbdd3-a237-4267-b84f-aebe833d9f2e','student.ali.001@scl.edu','Ali','Hassan','Student',NULL,'2026-02-22 07:56:56'),('f00585ca-3c44-4358-bd8d-603e9995024b','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 14:38:28'),('f24271c3-8ab8-4f6c-b8fd-e44033d93101','student.ali.001@scl.edu','Ali','Hassan','Student',NULL,'2026-02-22 07:57:04'),('f58b1ae3-c968-422e-81a7-e6d2375b7099','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-03-05 09:41:56'),('f5efb56b-740b-4de3-8de1-744f34319e5d','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 14:40:12'),('f6939777-f33f-46a6-904d-98ea383f6f75','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:46:03');
/*!40000 ALTER TABLE `sso_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_applications`
--

DROP TABLE IF EXISTS `student_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `middle_names` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `nationality` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contact_number` varchar(20) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `town_city` varchar(100) NOT NULL,
  `postcode` varchar(20) NOT NULL,
  `country_of_residence` varchar(100) NOT NULL,
  `course_title` varchar(255) DEFAULT NULL,
  `course_code` varchar(50) DEFAULT NULL,
  `course_type` varchar(100) DEFAULT NULL,
  `programme_type_name` varchar(255) DEFAULT NULL,
  `program_name` varchar(255) DEFAULT NULL,
  `intake_id` int DEFAULT NULL,
  `mode_of_study` enum('Full-time','Part-time','Online','Blended') NOT NULL,
  `intake_start_date` date NOT NULL,
  `entry_route` enum('Standard','RPL','Mature Student') NOT NULL,
  `highest_qualification` enum('GCSE','A-Level','Level 3 Diploma','HND','Degree','Other') NOT NULL,
  `institution_name` varchar(255) NOT NULL,
  `year_completed` date NOT NULL,
  `relevant_work_experience` text,
  `english_proficiency` enum('IELTS','TOEFL','Other') NOT NULL,
  `english_score` decimal(4,1) DEFAULT NULL,
  `passport_id_document` varchar(500) DEFAULT NULL,
  `academic_certificates` varchar(500) DEFAULT NULL,
  `academic_transcripts` varchar(500) DEFAULT NULL,
  `english_certificate` varchar(500) DEFAULT NULL,
  `cv_resume` varchar(500) DEFAULT NULL,
  `work_reference` varchar(500) DEFAULT NULL,
  `proof_of_address` varchar(500) DEFAULT NULL,
  `visa_immigration_document` varchar(500) DEFAULT NULL,
  `has_disabilities_support_needs` tinyint(1) DEFAULT '0',
  `disability_support_details` text,
  `consent_gdpr` tinyint(1) NOT NULL DEFAULT '0',
  `consent_data_sharing` tinyint(1) NOT NULL DEFAULT '0',
  `consent_marketing` tinyint(1) DEFAULT '0',
  `declaration_truth` tinyint(1) NOT NULL DEFAULT '0',
  `digital_signature` varchar(255) NOT NULL,
  `declaration_date` date NOT NULL,
  `application_status` enum('draft','submitted','under_review','interview_scheduled','accepted','conditional_accept','rejected','deferred') DEFAULT 'draft',
  `application_reference` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `offer_accepted` tinyint(1) DEFAULT '0',
  `student_contract` varchar(500) DEFAULT NULL,
  `brp_card` varchar(500) DEFAULT NULL,
  `residency_proof` varchar(500) DEFAULT NULL,
  `right_to_study_verified` enum('Yes','No','Pending') DEFAULT 'Pending',
  `compliance_confirmed_at` datetime DEFAULT NULL,
  `documents_verified` enum('Yes','No','Pending') DEFAULT 'Pending',
  `is_deleted` tinyint(1) DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `application_reference` (`application_reference`),
  KEY `idx_email` (`email`),
  KEY `idx_application_status` (`application_status`),
  KEY `idx_course_code` (`course_code`),
  KEY `idx_intake_date` (`intake_start_date`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_applications`
--

LOCK TABLES `student_applications` WRITE;
/*!40000 ALTER TABLE `student_applications` DISABLE KEYS */;
INSERT INTO `student_applications` VALUES (1,'Ahmed',NULL,'Hassan','2000-05-15','Male','Pakistan','ahmed.hassan.app@example.com','+447123456789','123 Oxford Street',NULL,'London','SW1A 1AA','United Kingdom','HND IN BUSINESS RQF','HND-001-INFO','HND',NULL,NULL,NULL,'Full-time','2026-09-01','Standard','A-Level','Royal Grammar School','2022-06-01',NULL,'IELTS',7.0,'DEVELOPMENT-WEEK-ACTIVITIES-119-e1756127497368.jpg','Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf',0,NULL,0,0,0,0,'Ahmed Hassan','2026-02-01','rejected','APP-20260207-00001','2026-02-07 12:14:38','2026-03-11 17:29:06','2026-02-07 12:14:38',1,'Quote-184.pdf',NULL,NULL,'Yes','2026-02-07 16:20:14','Pending',0,NULL),(2,'Fatima',NULL,'Ali','1999-12-20','Female','Saudi Arabia','fatima.ali.app@example.com','+447234567890','456 Baker Street',NULL,'London','NW1 6XE','United Kingdom','HND in Leadership and Management for England Course','HND-002-INFO','HND',NULL,NULL,NULL,'Full-time','2026-09-01','Standard','A-Level','Al-Hikma International School','2022-06-15',NULL,'IELTS',6.5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,0,0,0,'Fatima Ali','2026-02-02','accepted','APP-20260207-00002','2026-02-07 12:14:38','2026-03-13 11:14:45','2026-02-07 12:14:38',0,NULL,NULL,NULL,'Pending',NULL,'Pending',0,NULL),(3,'Mohammed',NULL,'Khan','2001-03-10','Male','Bangladesh','mohammed.khan.app@example.com','+447345678901','789 Regent Street',NULL,'London','W1B 5AH','United Kingdom','BSC (Hons) Business Management offered','DEG-001-INFO','HND',NULL,NULL,NULL,'Full-time','2026-09-01','Standard','A-Level','Dhaka Grammar School','2022-07-01',NULL,'IELTS',6.8,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,0,0,0,'Mohammed Khan','2026-02-03','accepted','APP-20260207-00003','2026-02-07 12:14:38','2026-03-12 07:04:08','2026-02-07 12:14:38',0,NULL,NULL,NULL,'Pending',NULL,'Pending',0,NULL),(4,'Noor',NULL,'Ahmed','2000-08-25','Female','UAE','noor.ahmed.app@example.com','+447456789012','321 Park Lane',NULL,'London','W1K 7AR','United Kingdom','HND IN BUSINESS RQF','HND-001-INFO','HND',NULL,NULL,NULL,'Full-time','2026-03-01','Standard','GCSE','Emirates International School','2021-06-01',NULL,'TOEFL',85.0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,0,0,0,'Noor Ahmed','2026-02-04','accepted','APP-20260207-00004','2026-02-07 12:14:38','2026-03-10 18:15:06','2026-02-07 12:14:38',0,NULL,NULL,NULL,'Pending',NULL,'Pending',0,NULL),(5,'Hamad',NULL,'Mohammed','1999-11-05','Male','Qatar','hamad.mohammed.app@example.com','+447567890123','654 Bond Street',NULL,'London','W1S 4AE','United Kingdom','BSC (Hons) Business Management offered','DEG-001-INFO','CPD',NULL,NULL,NULL,'Part-time','2026-04-01','Standard','Degree','Qatar University','2020-06-15',NULL,'IELTS',7.2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,0,0,0,0,'Hamad Mohammed','2026-02-05','rejected','APP-20260207-00005','2026-02-07 12:14:38','2026-03-10 18:14:55','2026-02-07 12:14:38',0,NULL,NULL,NULL,'Pending',NULL,'Pending',0,NULL),(6,'Mohammed','Ahmed','Hassan','1998-05-15','Male','Nigeria','mohammed.hassan@example.com','+234-803-555-0123','123 Lagos Street','Flat 4B','Lagos','100001','Nigeria','HND in Hospitality Management ','HND-003-INFO','HND',NULL,NULL,NULL,'Full-time','2026-02-08','Standard','A-Level','Lagos International College','2020-06-30','2 years in IT support at Tech Solutions Ltd','IELTS',6.5,'/app/uploads/student-documents/1770542425879-988631858-Quote-184.pdf','/app/uploads/student-documents/1770542425878-455606262-Quote-184.pdf','/app/uploads/student-documents/1770542425876-571701943-Quote-184.pdf','/app/uploads/student-documents/1770542425881-850278176-Quote-184.pdf','/app/uploads/student-documents/1770542425884-124512938-Quote-184.pdf','/app/uploads/student-documents/1770542425887-776889921-Quote-184.pdf','/app/uploads/student-documents/1770542425887-801106105-Quote-184.pdf','/app/uploads/student-documents/1770542425888-887513031-Quote-184.pdf',0,NULL,0,0,0,0,'Mohammed Ahmed Hassan','2026-02-08','accepted','SCL2026000006','2026-02-08 09:20:25','2026-03-11 06:36:34','2026-02-08 09:20:25',1,NULL,NULL,NULL,'Pending',NULL,'Pending',0,NULL),(7,'Mohammed','Khalid','khan','1998-05-15','Male','Nigeria','mohammed.khalid@example.com','+234-803-555-0123','123 Lagos Street','Flat 4B','Lagos','100001','Nigeria','HND in International Travel & Tourism Management','HND-004-INFO','HND',NULL,NULL,NULL,'Full-time','2026-02-11','Standard','A-Level','Lagos International College','2020-06-30','2 years in IT support at Tech Solutions Ltd','IELTS',6.5,'Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf',NULL,0,NULL,0,0,0,0,'Mohammed Khalid Khan','2026-02-11','accepted','SCL2026000007','2026-02-11 15:16:01','2026-03-11 06:34:56','2026-02-11 15:16:01',1,'Quote-184.pdf',NULL,NULL,'Yes','2026-02-11 15:59:44','Pending',0,NULL),(8,'Syed','M','Umer','1998-05-15','Male','Pakistan','syed.m.umer@example.com','+92-803-555-0123','123 Lagos Street','Flat 4B','Lagos','100001','Pakistan','hhhh','jjj-hhhh-apr-2027','jjj','jjj','hhhh',4,'Full-time','2026-04-06','Standard','A-Level','Lagos International College','2020-06-30','2 years in IT support at Tech Solutions Ltd','IELTS',6.5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,1,1,0,1,'Mohammed Ahmed Hassan','2026-04-06','accepted','SCL2026000008','2026-04-06 12:08:56','2026-04-06 12:21:47','2026-04-06 12:08:56',1,NULL,NULL,NULL,'Pending',NULL,'Pending',0,NULL),(9,'Asad','Khan','Ali','1998-05-15','Male','Nigeria','asad.ali@example.com','+234-803-555-0123','123 Lagos Street','Flat 4B','Lagos','100001','Nigeria','New Program','hms-new-progra-sep-2026','HMS','HMS','New Program',8,'Full-time','2026-04-15','Standard','A-Level','Lagos International College','2020-06-30','2 years in IT support at Tech Solutions Ltd','IELTS',6.5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,1,1,0,1,'Mohammed Ahmed Hassan','2026-04-15','accepted','SCL2026000009','2026-04-15 15:43:15','2026-04-15 15:44:20','2026-04-15 15:43:15',0,NULL,NULL,NULL,'Pending',NULL,'Pending',0,NULL);
/*!40000 ALTER TABLE `student_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_induction`
--

DROP TABLE IF EXISTS `student_induction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_induction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `student_id` int DEFAULT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `course_title` varchar(255) DEFAULT NULL,
  `course_start_date` date DEFAULT NULL,
  `student_handbook` tinyint(1) DEFAULT '0',
  `course_handbook` tinyint(1) DEFAULT '0',
  `assessment_grading_policy` tinyint(1) DEFAULT '0',
  `code_of_conduct` tinyint(1) DEFAULT '0',
  `health_safety_guidelines` tinyint(1) DEFAULT '0',
  `academic_integrity` tinyint(1) DEFAULT '0',
  `attendance_punctuality` tinyint(1) DEFAULT '0',
  `it_email_usage` tinyint(1) DEFAULT '0',
  `data_protection` tinyint(1) DEFAULT '0',
  `complaints_appeals` tinyint(1) DEFAULT '0',
  `library_resources` tinyint(1) DEFAULT '0',
  `student_support_services` tinyint(1) DEFAULT '0',
  `equality_diversity_inclusion` tinyint(1) DEFAULT '0',
  `safeguarding_prevent` tinyint(1) DEFAULT '0',
  `consent_personal_data` tinyint(1) DEFAULT '0',
  `consent_awarding_bodies` tinyint(1) DEFAULT '0',
  `consent_communications` tinyint(1) DEFAULT '0',
  `consent_marketing_images` tinyint(1) DEFAULT '0',
  `declaration_understood` tinyint(1) DEFAULT '0',
  `digital_signature` varchar(500) DEFAULT NULL,
  `declaration_date` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  CONSTRAINT `student_induction_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `student_applications` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_induction`
--

LOCK TABLES `student_induction` WRITE;
/*!40000 ALTER TABLE `student_induction` DISABLE KEYS */;
INSERT INTO `student_induction` VALUES (1,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:35:27','2026-02-07 15:35:27','2026-02-07 15:35:27'),(2,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:35:52','2026-02-07 15:35:52','2026-02-07 15:35:52'),(3,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:39:14','2026-02-07 15:39:14','2026-02-07 15:39:14'),(4,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:40:49','2026-02-07 15:40:49','2026-02-07 15:40:49'),(5,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:51:14','2026-02-07 15:51:14','2026-02-07 15:51:14'),(6,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:51:30','2026-02-07 15:51:30','2026-02-07 15:51:30'),(7,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:52:40','2026-02-07 15:52:40','2026-02-07 15:52:40'),(8,7,7,'Mohammed khan','Artificial Intelligence & Machine Learning Certification','2026-02-11',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Khaid Khan','2026-02-11 00:00:00','2026-02-11 15:47:19','2026-02-11 15:47:19','2026-02-11 15:47:19'),(9,8,8,'Syed Umer','hhhh','2026-04-06',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Syed M Umer','2026-04-06 00:00:00','2026-04-06 12:14:59','2026-04-06 12:14:59','2026-04-06 12:14:59');
/*!40000 ALTER TABLE `student_induction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_onboarding`
--

DROP TABLE IF EXISTS `student_onboarding`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_onboarding` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `student_handbook_provided` tinyint(1) DEFAULT '0',
  `course_handbook_provided` tinyint(1) DEFAULT '0',
  `policies_explained` tinyint(1) DEFAULT '0',
  `it_setup_completed` tinyint(1) DEFAULT '0',
  `email_account_created` tinyint(1) DEFAULT '0',
  `library_access_granted` tinyint(1) DEFAULT '0',
  `student_card_issued` tinyint(1) DEFAULT '0',
  `moodle_access_confirmed` tinyint(1) DEFAULT '0',
  `support_services_explained` tinyint(1) DEFAULT '0',
  `disability_support_arranged` tinyint(1) DEFAULT '0',
  `financial_support_discussed` tinyint(1) DEFAULT '0',
  `onboarding_completed` tinyint(1) DEFAULT '0',
  `onboarding_completed_date` date DEFAULT NULL,
  `onboarded_by` int DEFAULT NULL,
  `onboarding_notes` text,
  `onboarding_started_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`),
  KEY `application_id` (`application_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_onboarding_status` (`onboarding_completed`),
  CONSTRAINT `student_onboarding_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `student_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_onboarding`
--

LOCK TABLES `student_onboarding` WRITE;
/*!40000 ALTER TABLE `student_onboarding` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_onboarding` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_programme_registrations`
--

DROP TABLE IF EXISTS `student_programme_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_programme_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `student_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `programme_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `programme_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','completed','transferred_out','withdrawn','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `source` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'admission_decision',
  `course_change_request_id` int DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `started_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `ended_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_registration_application` (`application_id`),
  KEY `idx_registration_email_status` (`student_email`,`status`),
  KEY `idx_registration_programme_status` (`programme_code`,`status`),
  KEY `idx_registration_started` (`started_at`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_programme_registrations`
--

LOCK TABLES `student_programme_registrations` WRITE;
/*!40000 ALTER TABLE `student_programme_registrations` DISABLE KEYS */;
INSERT INTO `student_programme_registrations` VALUES (1,3,'mohammed.khan.app@example.com','HND-004','HND IN HOSPITALITY MANAGEMENT','transferred_out','admission_decision',NULL,'Activated from acceptance decision','2026-03-12 05:42:26','2026-03-12 05:49:54','2026-03-12 05:42:26','2026-03-12 05:49:54'),(2,3,'mohammed.khan.app@example.com','HND-001','HND IN BUSINESS RQF','transferred_out','course_change',3,'Transfer approved from HND-004-INFO to HND-001-INFO','2026-03-12 05:49:54','2026-03-12 05:51:12','2026-03-12 05:49:54','2026-03-12 05:51:12'),(3,3,'mohammed.khan.app@example.com','HND-004','HND IN HOSPITALITY MANAGEMENT','transferred_out','course_change',4,'Transfer approved from HND-001-INFO to HND-004-INFO','2026-03-12 05:51:12','2026-03-12 05:52:36','2026-03-12 05:51:12','2026-03-12 05:52:36'),(4,3,'mohammed.khan.app@example.com','HND-001','HND IN BUSINESS RQF','transferred_out','course_change',5,'Transfer approved from HND-004-INFO to HND-001-INFO','2026-03-12 05:52:36','2026-03-12 07:04:08','2026-03-12 05:52:36','2026-03-12 07:04:08'),(5,3,'mohammed.khan.app@example.com','DEG-001','BSC (Hons) Business Management offered','active','course_change',6,'Transfer approved from HND-001-INFO to DEG-001-INFO','2026-03-12 07:04:08',NULL,'2026-03-12 07:04:08','2026-03-12 07:04:08'),(6,2,'fatima.ali.app@example.com','HND-002','HND in Leadership and Management for England Course','active','admission_decision',NULL,'Activated from acceptance decision','2026-03-13 11:14:45',NULL,'2026-03-13 11:14:45','2026-03-13 11:14:45'),(7,8,'syed.m.umer@example.com','JJJ-HHHH-APR-2027','hhhh','active','admission_decision',NULL,'Activated from acceptance decision','2026-04-06 12:10:31',NULL,'2026-04-06 12:10:31','2026-04-06 12:21:47'),(8,9,'asad.ali@example.com','HMS-NEW-PROGRA-SEP-2026','New Program','active','admission_decision',NULL,'Activated from acceptance decision','2026-04-15 15:44:35',NULL,'2026-04-15 15:44:35','2026-04-15 15:44:35');
/*!40000 ALTER TABLE `student_programme_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_requests`
--

DROP TABLE IF EXISTS `support_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `status` varchar(50) DEFAULT 'open',
  `priority` varchar(20) DEFAULT 'medium',
  `assigned_to` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_requests`
--

LOCK TABLES `support_requests` WRITE;
/*!40000 ALTER TABLE `support_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_registrations`
--

DROP TABLE IF EXISTS `teacher_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_reference` varchar(20) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `highest_qualification` varchar(255) DEFAULT NULL,
  `years_of_experience` int DEFAULT NULL,
  `current_employer` varchar(255) DEFAULT NULL,
  `teaching_statement` text,
  `selected_course_title` varchar(255) NOT NULL,
  `selected_course_code` varchar(100) NOT NULL,
  `selected_course_type` varchar(100) DEFAULT NULL,
  `teaching_role` varchar(50) NOT NULL DEFAULT 'editingteacher',
  `cv_resume` varchar(500) DEFAULT NULL,
  `application_status` enum('submitted','under_review','accepted','rejected') DEFAULT 'submitted',
  `reviewer_name` varchar(255) DEFAULT NULL,
  `reviewer_notes` text,
  `approved_at` datetime DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `created_user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registration_reference` (`registration_reference`),
  KEY `idx_teacher_reg_status` (`application_status`),
  KEY `idx_teacher_reg_email` (`email`),
  KEY `idx_teacher_reg_course` (`selected_course_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_registrations`
--

LOCK TABLES `teacher_registrations` WRITE;
/*!40000 ALTER TABLE `teacher_registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role_snapshots`
--

DROP TABLE IF EXISTS `user_role_snapshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role_snapshots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `moodle_user_id` int DEFAULT NULL,
  `roles` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_data` json DEFAULT NULL,
  `synced_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `source` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'moodle',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_synced_at` (`synced_at`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=8784 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role_snapshots`
--

LOCK TABLES `user_role_snapshots` WRITE;
/*!40000 ALTER TABLE `user_role_snapshots` DISABLE KEYS */;
INSERT INTO `user_role_snapshots` VALUES (7,'admin@sclsandbox.xyz',34,'manager','[{\"name\": \"\", \"shortname\": \"manager\", \"contextlevel\": \"10\"}]','2026-04-15 15:25:21','2026-04-15 15:30:22','moodle'),(10,'student.ali.001@scl.edu',13,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-08 07:08:30','2026-03-08 07:38:30','moodle-db'),(13,'ahmed.hassan.app@example.com',26,'editingteacher,student','{\"assignments\": [{\"name\": null, \"courseid\": 8, \"contextid\": 52, \"shortname\": \"editingteacher\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 63, \"contextid\": 154, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 6, \"contextid\": 58, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 86, \"contextid\": 186, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 19, \"contextid\": 65, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 93, \"contextid\": 193, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 52, \"contextid\": 141, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 59, \"contextid\": 150, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 24, \"contextid\": 47, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 10, \"contextid\": 54, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 82, \"contextid\": 182, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 15, \"contextid\": 61, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 89, \"contextid\": 189, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 22, \"contextid\": 68, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 55, \"contextid\": 144, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 62, \"contextid\": 153, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 7, \"contextid\": 51, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 26, \"contextid\": 57, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 85, \"contextid\": 185, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 18, \"contextid\": 64, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 92, \"contextid\": 192, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 51, \"contextid\": 140, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 58, \"contextid\": 149, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 5, \"contextid\": 46, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 81, \"contextid\": 180, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 9, \"contextid\": 53, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 14, \"contextid\": 60, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 88, \"contextid\": 188, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 95, \"contextid\": 196, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 21, \"contextid\": 67, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 54, \"contextid\": 143, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 61, \"contextid\": 152, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 3, \"contextid\": 49, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 12, \"contextid\": 56, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 84, \"contextid\": 184, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 17, \"contextid\": 63, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 91, \"contextid\": 191, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 50, \"contextid\": 139, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 57, \"contextid\": 147, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 64, \"contextid\": 155, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 8, \"contextid\": 52, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 13, \"contextid\": 59, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 87, \"contextid\": 187, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 20, \"contextid\": 66, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 94, \"contextid\": 194, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 53, \"contextid\": 142, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 60, \"contextid\": 151, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 25, \"contextid\": 48, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 11, \"contextid\": 55, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 83, \"contextid\": 183, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 16, \"contextid\": 62, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 90, \"contextid\": 190, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 23, \"contextid\": 69, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 56, \"contextid\": 145, \"shortname\": \"student\", \"contextlevel\": 50}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(28,'dr.ahmed.cs@scl.edu',7,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(30,'dr.aisha.data@scl.edu',11,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(31,'dr.hassan.ml@scl.edu',9,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(32,'eng.fahad.web@scl.edu',10,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(33,'prof.sara.ai@scl.edu',8,'editingteacher,student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}, {\"name\": null, \"courseid\": 8, \"contextid\": 52, \"shortname\": \"editingteacher\", \"contextlevel\": 50}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(34,'prof.usman.mech@scl.edu',12,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(78,'mohammed.khan.app@example.com',28,'student','{\"assignments\": [{\"name\": null, \"courseid\": 104, \"contextid\": 215, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 41, \"contextid\": 127, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 4, \"contextid\": 50, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 26, \"contextid\": 57, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 48, \"contextid\": 134, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 18, \"contextid\": 64, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 55, \"contextid\": 144, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 62, \"contextid\": 153, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 30, \"contextid\": 109, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 100, \"contextid\": 206, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 37, \"contextid\": 117, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 5, \"contextid\": 46, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 9, \"contextid\": 53, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 107, \"contextid\": 218, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 44, \"contextid\": 130, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 14, \"contextid\": 60, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 51, \"contextid\": 140, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 58, \"contextid\": 149, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 21, \"contextid\": 67, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 96, \"contextid\": 200, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 33, \"contextid\": 112, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 103, \"contextid\": 214, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 40, \"contextid\": 126, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 3, \"contextid\": 49, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 12, \"contextid\": 56, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 110, \"contextid\": 222, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 47, \"contextid\": 133, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 17, \"contextid\": 63, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 54, \"contextid\": 143, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 61, \"contextid\": 152, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 29, \"contextid\": 107, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 99, \"contextid\": 205, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 36, \"contextid\": 116, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 2, \"contextid\": 45, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 106, \"contextid\": 217, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 43, \"contextid\": 129, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 8, \"contextid\": 52, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 13, \"contextid\": 59, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 50, \"contextid\": 139, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 57, \"contextid\": 147, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 20, \"contextid\": 66, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 64, \"contextid\": 155, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 32, \"contextid\": 111, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 102, \"contextid\": 208, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 39, \"contextid\": 124, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 25, \"contextid\": 48, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 11, \"contextid\": 55, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 109, \"contextid\": 221, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 46, \"contextid\": 132, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 16, \"contextid\": 62, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 53, \"contextid\": 142, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 60, \"contextid\": 151, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 23, \"contextid\": 69, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 98, \"contextid\": 203, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 35, \"contextid\": 114, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 105, \"contextid\": 216, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 42, \"contextid\": 128, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 7, \"contextid\": 51, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 6, \"contextid\": 58, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 49, \"contextid\": 135, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 19, \"contextid\": 65, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 56, \"contextid\": 145, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 63, \"contextid\": 154, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 31, \"contextid\": 110, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 101, \"contextid\": 207, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 38, \"contextid\": 123, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 24, \"contextid\": 47, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 10, \"contextid\": 54, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 108, \"contextid\": 219, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 45, \"contextid\": 131, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 15, \"contextid\": 61, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 52, \"contextid\": 141, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 59, \"contextid\": 150, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 22, \"contextid\": 68, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 97, \"contextid\": 202, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 34, \"contextid\": 113, \"shortname\": \"student\", \"contextlevel\": 50}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(87,'mohammed.khalid@example.com',30,'student','{\"assignments\": [{\"name\": null, \"courseid\": 4, \"contextid\": 50, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 26, \"contextid\": 57, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 18, \"contextid\": 64, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 5, \"contextid\": 46, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 9, \"contextid\": 53, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 14, \"contextid\": 60, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 21, \"contextid\": 67, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 3, \"contextid\": 49, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 12, \"contextid\": 56, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 17, \"contextid\": 63, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 2, \"contextid\": 45, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 8, \"contextid\": 52, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 13, \"contextid\": 59, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 20, \"contextid\": 66, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 25, \"contextid\": 48, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 11, \"contextid\": 55, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 16, \"contextid\": 62, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 23, \"contextid\": 69, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 7, \"contextid\": 51, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 6, \"contextid\": 58, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 19, \"contextid\": 65, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 24, \"contextid\": 47, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 10, \"contextid\": 54, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 15, \"contextid\": 61, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 22, \"contextid\": 68, \"shortname\": \"student\", \"contextlevel\": 50}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(108,'admissions@scl.edu',5,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:41','2026-03-14 08:56:42','moodle-db-resync'),(120,'hr@scl.edu',6,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(122,'lmsmanager@scl.edu',4,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(124,'manager.dept.business@scl.edu',25,'manager','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"manager\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(126,'manager.dept.cs@scl.edu',23,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(128,'manager.dept.eng@scl.edu',24,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(130,'mohammed.hassan@example.com',32,'student','{\"assignments\": [{\"name\": null, \"courseid\": 39, \"contextid\": 124, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 46, \"contextid\": 132, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 35, \"contextid\": 114, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 42, \"contextid\": 128, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 49, \"contextid\": 135, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 30, \"contextid\": 109, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 38, \"contextid\": 123, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 45, \"contextid\": 131, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 34, \"contextid\": 113, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 41, \"contextid\": 127, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 48, \"contextid\": 134, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 29, \"contextid\": 107, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 37, \"contextid\": 117, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 44, \"contextid\": 130, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 33, \"contextid\": 112, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 40, \"contextid\": 126, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 47, \"contextid\": 133, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 36, \"contextid\": 116, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 43, \"contextid\": 129, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 111, \"contextid\": 223, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 32, \"contextid\": 111, \"shortname\": \"student\", \"contextlevel\": 50}]}','2026-04-15 10:05:15','2026-04-15 10:10:16','moodle-db-resync'),(136,'noor.ahmed.app@example.com',27,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}, {\"name\": null, \"courseid\": 54, \"contextid\": 143, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 61, \"contextid\": 152, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 50, \"contextid\": 139, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 57, \"contextid\": 147, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 64, \"contextid\": 155, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 53, \"contextid\": 142, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 60, \"contextid\": 151, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 56, \"contextid\": 145, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 63, \"contextid\": 154, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 52, \"contextid\": 141, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 59, \"contextid\": 150, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 55, \"contextid\": 144, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 62, \"contextid\": 153, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 51, \"contextid\": 140, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 58, \"contextid\": 149, \"shortname\": \"student\", \"contextlevel\": 50}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(142,'student.adnan.007@scl.edu',19,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(144,'student.fatima.002@scl.edu',14,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(146,'student.hamad.005@scl.edu',17,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(148,'student.karim.009@scl.edu',21,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(150,'student.lina.008@scl.edu',20,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(152,'student.noor.004@scl.edu',16,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(154,'student.rana.006@scl.edu',18,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(156,'student.sara.010@scl.edu',22,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(158,'student.zain.003@scl.edu',15,'student','{\"assignments\": [{\"name\": null, \"courseid\": null, \"contextid\": 1, \"shortname\": \"student\", \"contextlevel\": 10}]}','2026-03-14 08:51:42','2026-03-14 08:56:43','moodle-db-resync'),(1103,'fatima.ali.app@example.com',31,'student','{\"assignments\": [{\"name\": null, \"courseid\": 70, \"contextid\": 164, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 77, \"contextid\": 172, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 66, \"contextid\": 160, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 73, \"contextid\": 168, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 80, \"contextid\": 176, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 69, \"contextid\": 163, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 76, \"contextid\": 171, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 65, \"contextid\": 158, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 72, \"contextid\": 166, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 79, \"contextid\": 175, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 68, \"contextid\": 162, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 75, \"contextid\": 170, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 71, \"contextid\": 165, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 78, \"contextid\": 173, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 67, \"contextid\": 161, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 74, \"contextid\": 169, \"shortname\": \"student\", \"contextlevel\": 50}]}','2026-03-14 08:51:42','2026-03-14 08:56:42','moodle-db-resync'),(5293,'syed.m.umer@example.com',37,'student','{\"assignments\": [{\"name\": null, \"courseid\": 166, \"contextid\": 416, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 155, \"contextid\": 397, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 165, \"contextid\": 415, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 154, \"contextid\": 396, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 164, \"contextid\": 414, \"shortname\": \"student\", \"contextlevel\": 50}, {\"name\": null, \"courseid\": 160, \"contextid\": 410, \"shortname\": \"student\", \"contextlevel\": 50}]}','2026-04-15 10:05:15','2026-04-15 10:10:16','moodle-db-resync'),(8783,'asad.ali@example.com',39,'student','[{\"name\": \"\", \"shortname\": \"student\", \"contextlevel\": \"50\"}]','2026-04-15 15:47:35','2026-04-15 15:52:36','moodle');
/*!40000 ALTER TABLE `user_role_snapshots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  KEY `assigned_by` (`assigned_by`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,1,'2026-02-07 11:38:15',NULL),(2,2,2,'2026-02-07 11:38:15',NULL),(3,3,3,'2026-02-07 11:38:15',NULL),(4,4,4,'2026-02-07 11:38:15',NULL),(5,5,5,'2026-02-07 11:38:15',NULL),(6,6,5,'2026-02-07 11:38:15',NULL),(7,7,5,'2026-02-07 11:38:15',NULL),(8,8,5,'2026-02-07 11:38:15',NULL),(9,9,5,'2026-02-07 11:38:15',NULL),(10,10,5,'2026-02-07 11:38:15',NULL),(11,11,6,'2026-02-07 11:38:15',NULL),(12,12,6,'2026-02-07 11:38:15',NULL),(13,13,6,'2026-02-07 11:38:15',NULL),(14,14,6,'2026-02-07 11:38:15',NULL),(15,15,6,'2026-02-07 11:38:15',NULL),(16,16,6,'2026-02-07 11:38:15',NULL),(17,17,6,'2026-02-07 11:38:15',NULL),(18,18,6,'2026-02-07 11:38:15',NULL),(19,19,6,'2026-02-07 11:38:15',NULL),(20,20,6,'2026-02-07 11:38:15',NULL),(21,21,7,'2026-02-07 11:38:15',NULL),(22,22,7,'2026-02-07 11:38:15',NULL),(23,23,7,'2026-02-07 11:38:15',NULL);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('M','F','Other') DEFAULT NULL,
  `profile_photo` longblob,
  `is_active` tinyint(1) DEFAULT '1',
  `role` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@sclsandbox.xyz','password123','password123','System','Administrator',NULL,NULL,NULL,NULL,1,'manager','2026-02-07 11:38:15','2026-03-13 10:28:27'),(2,'lmsmanager@scl.edu','password123','password123','LMS','Manager',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(3,'admissions@scl.edu','password123','password123','Admissions','Officer',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(4,'hr@scl.edu','password123','password123','HR','Manager',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(5,'dr.ahmed.cs@scl.edu','password123','password123','Ahmed','Khan',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(6,'prof.sara.ai@scl.edu','password123','password123','Sara','Ahmed',NULL,NULL,NULL,NULL,1,'editingteacher','2026-02-07 11:38:15','2026-03-13 09:58:13'),(7,'dr.hassan.ml@scl.edu','password123','password123','Hassan','Ali',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(8,'eng.fahad.web@scl.edu','password123','password123','Fahad','Mohammed',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(9,'dr.aisha.data@scl.edu','password123','password123','Aisha','Fatima',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(10,'prof.usman.mech@scl.edu','password123','password123','Usman','Hassan',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(11,'student.ali.001@scl.edu','password123','password123','Ali','Hassan',NULL,NULL,NULL,NULL,1,'Student','2026-02-07 11:38:15','2026-02-07 11:38:15'),(12,'student.fatima.002@scl.edu','password123','password123','Fatima','Ahmed',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(13,'student.zain.003@scl.edu','password123','password123','Zain','Mohammed',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:14'),(14,'student.noor.004@scl.edu','password123','password123','Noor','Ahmed',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:14'),(15,'student.hamad.005@scl.edu','password123','password123','Hamad','Ali',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(16,'student.rana.006@scl.edu','password123','password123','Rana','Hassan',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:14'),(17,'student.adnan.007@scl.edu','password123','password123','Adnan','Fatima',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(18,'student.lina.008@scl.edu','password123','password123','Lina','Mohammed',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(19,'student.karim.009@scl.edu','password123','password123','Karim','Ahmed',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(20,'student.sara.010@scl.edu','password123','password123','Sara','Khan',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:14'),(21,'manager.dept.cs@scl.edu','password123','password123','Mohammad','CS Manager',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(22,'manager.dept.eng@scl.edu','password123','password123','Eng','Department Manager',NULL,NULL,NULL,NULL,1,'student','2026-02-07 11:38:15','2026-03-13 09:58:13'),(23,'manager.dept.business@scl.edu','password123','password123','Business','Manager',NULL,NULL,NULL,NULL,1,'manager','2026-02-07 11:38:15','2026-03-13 09:58:13'),(24,'ahmed.hassan.app@example.com','cc333cf9a45cdf6787b6238653956386a2a31362291a57e3eb5a7a4511e74ab1','ed0abf2e4945','Ahmed','Hassan',NULL,NULL,NULL,NULL,1,'editingteacher','2026-02-07 12:41:07','2026-03-13 09:58:13'),(25,'noor.ahmed.app@example.com','7bd5a690b45599cccae1baa4dfa2d9a24e70d0b67271939759f46f2a6f9dd967','0e51d63ca1c6','Noor','Ahmed',NULL,NULL,NULL,NULL,1,'student','2026-02-07 14:43:37','2026-02-07 14:43:37'),(26,'mohammed.khan.app@example.com','3b73ec5085753a0d604d27f6da701418531c816b8f423603f31c554e7df00c66','153e9b0c62fc','Mohammed','Khan',NULL,NULL,NULL,NULL,1,'student','2026-02-07 14:44:32','2026-02-07 14:44:32'),(27,'mohammed.hassan@example.com','d19939d2decc8b67ba71a19968497e6c39cc7d3eafcb07964e23ff34ab270b90','1e268c2f2238','Mohammed','Hassan',NULL,NULL,NULL,NULL,1,'student','2026-02-08 09:22:31','2026-03-27 05:16:08'),(28,'mohammed.khalid@example.com','84b43b9285335f93361d1de1823b1e3d5211208995f7cf6cad91153bfd147bcb','26cd6e25676b','Mohammed','khan',NULL,NULL,NULL,NULL,1,'student','2026-02-11 15:25:16','2026-02-11 15:25:16'),(29,'fatima.ali.app@example.com','4db7fa15b29ae467b22806b3874188d25d21687c37a1dd43fbba90e6d4f17a81','0f199f5a623f','Fatima','Ali',NULL,NULL,NULL,NULL,1,'student','2026-03-13 11:14:45','2026-03-13 11:14:45'),(30,'syed.m.umer@example.com','9120f97bd922a2f75999c87b106be71a50ef41dd5f3f87c825c7a6b446877ec9','dcecc1e471f2','Syed','Umer',NULL,NULL,NULL,NULL,1,'student','2026-04-06 12:10:31','2026-04-06 12:10:31'),(31,'asad.ali@example.com','111539ac1408ebcdc0ccb453ba941f45db383b6201cc2095a5a1d39359788412','2ff8db1bb507','Asad','Ali',NULL,NULL,NULL,NULL,1,'student','2026-04-15 15:44:20','2026-04-15 15:44:20');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'scl_institute'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-18 10:21:42
