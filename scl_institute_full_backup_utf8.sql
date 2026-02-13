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
  PRIMARY KEY (`id`),
  KEY `idx_application_docs` (`application_id`),
  KEY `idx_document_type` (`document_type`),
  CONSTRAINT `application_documents_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `student_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_documents`
--

LOCK TABLES `application_documents` WRITE;
/*!40000 ALTER TABLE `application_documents` DISABLE KEYS */;
INSERT INTO `application_documents` VALUES (1,1,'passport_id_document','Moodle Version, Theme Recommendation, and Upgrade Strategy.pdf','1770476174102-542573375-Moodle Version, Theme Recommendation, and Upgrade Strategy.pdf','/uploads/student-documents/1770476174102-542573375-Moodle Version, Theme Recommendation, and Upgrade Strategy.pdf',97120,'application/pdf','2026-02-07 14:56:14','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (2,1,'passport_id_document','Quote-184.pdf','1770476187274-76670639-Quote-184.pdf','/uploads/student-documents/1770476187274-76670639-Quote-184.pdf',25762,'application/pdf','2026-02-07 14:56:27','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (3,1,'passport_id_document','Quote-184.pdf','1770476232752-814399639-Quote-184.pdf','/uploads/student-documents/1770476232752-814399639-Quote-184.pdf',25762,'application/pdf','2026-02-07 14:57:12','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (4,1,'passport_id_document','Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf','1770476524538-49020585-Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf','/uploads/student-documents/1770476524538-49020585-Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf',160475,'application/pdf','2026-02-07 15:02:04','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (5,1,'academic_certificates','Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf','1770477051236-436435737-Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf','/uploads/student-documents/1770477051236-436435737-Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf',160475,'application/pdf','2026-02-07 15:10:51','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (6,1,'academic_transcripts','Quote-184.pdf','1770477059685-558710753-Quote-184.pdf','/uploads/student-documents/1770477059685-558710753-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:10:59','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (7,1,'academic_transcripts','Quote-184.pdf','1770477071447-479979229-Quote-184.pdf','/uploads/student-documents/1770477071447-479979229-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:11:11','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (8,1,'academic_transcripts','Quote-184.pdf','1770477302839-786890075-Quote-184.pdf','/uploads/student-documents/1770477302839-786890075-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:15:02','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (9,1,'english_certificate','Quote-184.pdf','1770477310568-12912296-Quote-184.pdf','/uploads/student-documents/1770477310568-12912296-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:15:10','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (10,1,'student_contract','Quote-184.pdf','1770477315792-323537898-Quote-184.pdf','/uploads/student-documents/1770477315792-323537898-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:15:15','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (11,1,'cv_resume','Quote-184.pdf','1770477322330-224535753-Quote-184.pdf','/uploads/student-documents/1770477322330-224535753-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:15:22','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (12,1,'work_reference','Quote-184.pdf','1770477328247-118840392-Quote-184.pdf','/uploads/student-documents/1770477328247-118840392-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:15:28','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (14,1,'proof_of_address','Quote-184.pdf','1770478263718-772172239-Quote-184.pdf','/uploads/student-documents/1770478263718-772172239-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:31:03','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (15,1,'passport_id','Quote-184.pdf','1770479907869-872161472-Quote-184.pdf','/uploads/student-documents/1770479907869-872161472-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:58:27','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (16,1,'visa_immigration','Quote-184.pdf','1770479912474-402295349-Quote-184.pdf','/uploads/student-documents/1770479912474-402295349-Quote-184.pdf',25762,'application/pdf','2026-02-07 15:58:32','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (17,1,'passport_id','Quote-184.pdf','1770480095793-313319113-Quote-184.pdf','/uploads/student-documents/1770480095793-313319113-Quote-184.pdf',25762,'application/pdf','2026-02-07 16:01:35','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (18,1,'passport_id_document','Quote-184.pdf','1770480805517-652683963-Quote-184.pdf','/uploads/student-documents/1770480805517-652683963-Quote-184.pdf',25762,'application/pdf','2026-02-07 16:13:25','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (19,1,'visa_immigration_document','Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf','1770480821843-518303510-Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf','/uploads/student-documents/1770480821843-518303510-Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf',160475,'application/pdf','2026-02-07 16:13:41','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (20,1,'passport_id_document','Quote-184.pdf','1770480942604-211129079-Quote-184.pdf','/uploads/student-documents/1770480942604-211129079-Quote-184.pdf',25762,'application/pdf','2026-02-07 16:15:42','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (21,1,'visa_immigration_document','Quote-184.pdf','1770481227592-524835436-Quote-184.pdf','/uploads/student-documents/1770481227592-524835436-Quote-184.pdf',25762,'application/pdf','2026-02-07 16:20:27','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (22,6,'passport_id','Quote-184.pdf','1770542425879-988631858-Quote-184.pdf','/app/uploads/student-documents/1770542425879-988631858-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (23,6,'academic_certificates','Quote-184.pdf','1770542425878-455606262-Quote-184.pdf','/app/uploads/student-documents/1770542425878-455606262-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (24,6,'academic_transcripts','Quote-184.pdf','1770542425876-571701943-Quote-184.pdf','/app/uploads/student-documents/1770542425876-571701943-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (25,6,'english_certificate','Quote-184.pdf','1770542425881-850278176-Quote-184.pdf','/app/uploads/student-documents/1770542425881-850278176-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (26,6,'cv_resume','Quote-184.pdf','1770542425884-124512938-Quote-184.pdf','/app/uploads/student-documents/1770542425884-124512938-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (27,6,'work_reference','Quote-184.pdf','1770542425887-776889921-Quote-184.pdf','/app/uploads/student-documents/1770542425887-776889921-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (28,6,'proof_of_address','Quote-184.pdf','1770542425887-801106105-Quote-184.pdf','/app/uploads/student-documents/1770542425887-801106105-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (29,6,'visa_immigration','Quote-184.pdf','1770542425888-887513031-Quote-184.pdf','/app/uploads/student-documents/1770542425888-887513031-Quote-184.pdf',25762,'application/pdf','2026-02-08 09:20:25','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (30,7,'passport_id_document','Quote-184.pdf','1770824101120-91664737-Quote-184.pdf','/uploads/student-documents/1770824101120-91664737-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:35:01','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (31,7,'academic_certificates','Quote-184.pdf','1770824115540-377836523-Quote-184.pdf','/uploads/student-documents/1770824115540-377836523-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:35:15','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (32,7,'academic_transcripts','Quote-184.pdf','1770824173802-81774281-Quote-184.pdf','/uploads/student-documents/1770824173802-81774281-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:36:13','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (33,7,'english_certificate','Quote-184.pdf','1770824181053-223897016-Quote-184.pdf','/uploads/student-documents/1770824181053-223897016-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:36:21','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (34,7,'student_contract','Quote-184.pdf','1770824213762-912557693-Quote-184.pdf','/uploads/student-documents/1770824213762-912557693-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:36:53','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (35,7,'cv_resume','Quote-184.pdf','1770824221171-434422463-Quote-184.pdf','/uploads/student-documents/1770824221171-434422463-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:37:01','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (36,7,'work_reference','Quote-184.pdf','1770824227487-57873909-Quote-184.pdf','/uploads/student-documents/1770824227487-57873909-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:37:07','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (37,7,'proof_of_address','Quote-184.pdf','1770824233638-684943772-Quote-184.pdf','/uploads/student-documents/1770824233638-684943772-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:37:13','172.21.0.1',0,NULL,NULL,NULL);
INSERT INTO `application_documents` VALUES (38,7,'passport_id_document','Quote-184.pdf','1770825089251-596214679-Quote-184.pdf','/uploads/student-documents/1770825089251-596214679-Quote-184.pdf',25762,'application/pdf','2026-02-11 15:51:29','172.21.0.1',0,NULL,NULL,NULL);
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
  PRIMARY KEY (`id`),
  KEY `idx_application_review` (`application_id`),
  KEY `idx_review_stage` (`review_stage`),
  CONSTRAINT `application_reviews_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `student_applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_reviews`
--

LOCK TABLES `application_reviews` WRITE;
/*!40000 ALTER TABLE `application_reviews` DISABLE KEYS */;
INSERT INTO `application_reviews` VALUES (1,1,1,'final_decision','suitable',1,1,NULL,'accept','{\"reviewer_name\":\"Test Reviewer\",\"review_date\":\"2026-02-07\",\"documents_verified\":\"Yes\",\"eligibility_check\":\"Meets criteria\",\"interview_conducted\":\"Yes\",\"interview_outcome\":\"Pass\",\"english_requirement_met\":\"Yes\",\"additional_notes\":\"test\",\"decision\":\"Offer\",\"reason_for_refusal\":\"\",\"detailed_comments\":\"Approved\",\"committee_chair_name\":\"Chair\",\"final_decision_date\":\"2026-02-07\",\"final_decision_confirmation\":true}',NULL,0,NULL,NULL,NULL,'2026-02-07 12:41:12');
INSERT INTO `application_reviews` VALUES (2,5,1,'final_decision','suitable',0,1,NULL,'reject','{\"reviewer_name\":\"test\",\"review_date\":\"2026-02-07\",\"documents_verified\":\"Yes\",\"eligibility_check\":\"Does not meet criteria\",\"interview_conducted\":\"No\",\"interview_outcome\":\"\",\"english_requirement_met\":\"No\",\"additional_notes\":\"\",\"decision\":\"Refusal\",\"reason_for_refusal\":\"English language requirement not met\",\"detailed_comments\":\"test\",\"committee_chair_name\":\"test\",\"final_decision_date\":\"2026-02-07\",\"final_decision_confirmation\":true}',NULL,0,NULL,NULL,NULL,'2026-02-07 14:42:37');
INSERT INTO `application_reviews` VALUES (3,4,1,'final_decision','suitable',1,1,NULL,'conditional_accept','{\"reviewer_name\":\"test\",\"review_date\":\"2026-02-07\",\"documents_verified\":\"Yes\",\"eligibility_check\":\"Meets criteria\",\"interview_conducted\":\"Yes\",\"interview_outcome\":\"Pass\",\"english_requirement_met\":\"Yes\",\"additional_notes\":\"test\",\"decision\":\"Conditional Offer\",\"reason_for_refusal\":\"\",\"detailed_comments\":\"test\",\"committee_chair_name\":\"test\",\"final_decision_date\":\"2026-02-07\",\"final_decision_confirmation\":true}',NULL,0,NULL,NULL,NULL,'2026-02-07 14:43:38');
INSERT INTO `application_reviews` VALUES (4,3,1,'final_decision','suitable',1,1,NULL,'accept','{\"reviewer_name\":\"test\",\"review_date\":\"2026-02-07\",\"documents_verified\":\"Yes\",\"eligibility_check\":\"Meets criteria\",\"interview_conducted\":\"Yes\",\"interview_outcome\":\"Pass\",\"english_requirement_met\":\"Yes\",\"additional_notes\":\"test\",\"decision\":\"Offer\",\"reason_for_refusal\":\"\",\"detailed_comments\":\"test\",\"committee_chair_name\":\"test\",\"final_decision_date\":\"2026-02-07\",\"final_decision_confirmation\":true}',NULL,0,NULL,NULL,NULL,'2026-02-07 14:44:32');
INSERT INTO `application_reviews` VALUES (5,6,1,'final_decision','suitable',1,1,NULL,'accept','{\"reviewer_name\":\"Fazli\",\"review_date\":\"2026-02-08\",\"documents_verified\":\"Yes\",\"eligibility_check\":\"Meets criteria\",\"interview_conducted\":\"Yes\",\"interview_outcome\":\"Pass\",\"english_requirement_met\":\"Yes\",\"additional_notes\":\"test\",\"decision\":\"Offer\",\"reason_for_refusal\":\"\",\"detailed_comments\":\"test offer\",\"committee_chair_name\":\"Khalid\",\"final_decision_date\":\"2026-02-08\",\"final_decision_confirmation\":true}',NULL,0,NULL,NULL,NULL,'2026-02-08 09:22:31');
INSERT INTO `application_reviews` VALUES (6,7,1,'final_decision','suitable',1,1,NULL,'accept','{\"reviewer_name\":\"Asad Khan\",\"review_date\":\"2026-02-11\",\"documents_verified\":\"Yes\",\"eligibility_check\":\"Meets criteria\",\"interview_conducted\":\"Yes\",\"interview_outcome\":\"Pass\",\"english_requirement_met\":\"Yes\",\"additional_notes\":\"test\",\"decision\":\"Offer\",\"reason_for_refusal\":\"\",\"detailed_comments\":\"test\",\"committee_chair_name\":\"test\",\"final_decision_date\":\"2026-02-11\",\"final_decision_confirmation\":true}',NULL,0,NULL,NULL,NULL,'2026-02-11 15:25:16');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Engineering','ENG','Engineering programs including B.Tech and M.Tech courses','??????','#FF6B6B',1,1,'2026-02-08 05:02:40','2026-02-08 05:02:40');
INSERT INTO `categories` VALUES (2,'Business & Management','BUS','Business administration, MBA, and commerce programs','????','#4ECDC4',2,1,'2026-02-08 05:02:40','2026-02-08 05:02:40');
INSERT INTO `categories` VALUES (3,'IT & Computing','IT','Computer science, BCA, MCA, and IT-related courses','????','#45B7D1',3,1,'2026-02-08 05:02:40','2026-02-08 05:02:40');
INSERT INTO `categories` VALUES (4,'Professional Certifications','CERT','CPD and certification programs for professional development','????','#FFA502',4,1,'2026-02-08 05:02:40','2026-02-08 05:02:40');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'BTECH-CSE-001','B.Tech Computer Science Engineering','Degree','Engineering',48,NULL,'Advanced computing with focus on AI, ML, and software development. Learn from industry experts and build practical skills.',NULL,NULL,1,0,0,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45');
INSERT INTO `courses` VALUES (2,'BTECH-MEC-001','B.Tech Mechanical Engineering','Degree','Engineering',48,NULL,'Design, manufacturing, and thermal systems. Hands-on experience with modern CAD and simulation tools.',NULL,NULL,1,0,0,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45');
INSERT INTO `courses` VALUES (3,'BTECH-ECE-001','B.Tech Electrical Engineering','Degree','Engineering',48,NULL,'Power systems, electronics, and renewable energy. Comprehensive coverage of modern electrical technologies.',NULL,NULL,1,0,0,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45');
INSERT INTO `courses` VALUES (4,'MBA-BA-001','MBA Business Administration','Degree','Business',24,NULL,'Strategic management, finance, and leadership. Ideal for working professionals seeking career advancement.',NULL,NULL,0,1,1,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45');
INSERT INTO `courses` VALUES (5,'MTECH-DS-001','M.Tech Data Science','Degree','Engineering',24,NULL,'Machine learning, big data analytics, and AI. Master the most sought-after skills in tech industry.',NULL,NULL,0,1,1,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45');
INSERT INTO `courses` VALUES (6,'BCOM-001','B.Com Commerce','Degree','Commerce',36,NULL,'Accounting, finance, and business law. Build expertise in financial management and commerce.',NULL,NULL,1,1,0,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45');
INSERT INTO `courses` VALUES (7,'BCA-001','BCA Computer Applications','Degree','IT',36,NULL,'Programming, databases, and web development. Foundation for careers in IT industry.',NULL,NULL,1,0,1,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45');
INSERT INTO `courses` VALUES (8,'MCA-001','MCA Computer Applications','Degree','IT',24,NULL,'Advanced programming, software engineering, and cloud technologies. Transform your IT career.',NULL,NULL,0,1,1,1,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45');
INSERT INTO `courses` VALUES (9,'CERT-CLOUD-001','Cloud Computing Certification','CPD','IT',6,NULL,'AWS and Azure certifications. Industry-recognized credential for cloud professionals.',NULL,NULL,0,1,1,0,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45');
INSERT INTO `courses` VALUES (10,'CERT-DATA-001','Data Science Fundamentals','CPD','Engineering',6,NULL,'Introduction to Python, statistics, and data analysis. Perfect starting point for data careers.',NULL,NULL,0,1,1,0,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45');
INSERT INTO `courses` VALUES (11,'CERT-WEB-001','Full Stack Web Development','CPD','IT',6,NULL,'Frontend and backend technologies. Build complete web applications from scratch.',NULL,NULL,0,1,1,0,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45');
INSERT INTO `courses` VALUES (12,'CERT-AI-001','Artificial Intelligence Basics','CPD','Engineering',8,NULL,'Machine learning fundamentals and AI concepts. Gateway to advanced AI technologies.',NULL,NULL,0,1,1,0,'active',NULL,1,'2026-02-08 05:02:45','2026-02-08 05:02:45');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,NULL,'ahmed.hassan.app@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n≡ƒôº Email/Username: ahmed.hassan.app@example.com\n≡ƒöÉ Temporary Password: ed0abf2e4945\n\nCourse: Business Administration HND\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"Business Administration HND\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"ahmed.hassan.app@example.com\", \"password\": \"ed0abf2e4945\"}, \"applicant_name\": \"Ahmed Hassan\", \"moodle_enrollment\": false}',1,'2026-02-07 14:45:53','2026-02-07 12:41:11','2026-02-07 14:45:53');
INSERT INTO `notifications` VALUES (2,NULL,'ahmed.hassan.app@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n≡ƒôº Email/Username: ahmed.hassan.app@example.com\n≡ƒöÉ Temporary Password: ed0abf2e4945\n\nCourse: Business Administration HND\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"Business Administration HND\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"ahmed.hassan.app@example.com\", \"password\": \"ed0abf2e4945\"}, \"applicant_name\": \"Ahmed Hassan\", \"moodle_enrollment\": false}',1,'2026-02-07 14:45:28','2026-02-07 13:03:52','2026-02-07 14:45:28');
INSERT INTO `notifications` VALUES (3,NULL,'noor.ahmed.app@example.com','conditional_offer','Conditional Offer - SCL Institute',NULL,'\nConditional Offer - SCL Institute\n\nDear Noor Ahmed,\n\nCongratulations! You have received a conditional offer for:\n\n≡ƒôÜ Course: English Language Course\n\nConditions:\ntest\n\nYour temporary account credentials have been created:\n≡ƒôº Email/Username: noor.ahmed.app@example.com\n≡ƒöÉ Temporary Password: 0e51d63ca1c6\n\nPlease login to your portal at: http://localhost:3000/student/login\n\nOnce you fulfill the conditions, you will be fully enrolled in the course and Moodle LMS.\n\nBest regards,\nSCL Institute Admissions Team\n                    ','{\"course\": \"English Language Course\", \"conditions\": \"test\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"noor.ahmed.app@example.com\", \"password\": \"0e51d63ca1c6\"}, \"applicant_name\": \"Noor Ahmed\"}',0,NULL,'2026-02-07 14:43:38','2026-02-07 14:43:38');
INSERT INTO `notifications` VALUES (4,NULL,'mohammed.khan.app@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n≡ƒôº Email/Username: mohammed.khan.app@example.com\n≡ƒöÉ Temporary Password: 153e9b0c62fc\n\nCourse: Accounting and Finance HND\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"Accounting and Finance HND\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"mohammed.khan.app@example.com\", \"password\": \"153e9b0c62fc\"}, \"applicant_name\": \"Mohammed Khan\", \"moodle_enrollment\": false}',0,NULL,'2026-02-07 14:44:32','2026-02-07 14:44:32');
INSERT INTO `notifications` VALUES (5,NULL,'mohammed.hassan@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n≡ƒôº Email/Username: mohammed.hassan@example.com\n≡ƒöÉ Temporary Password: 1e268c2f2238\n\nCourse: Artificial Intelligence Basics\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"Artificial Intelligence Basics\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"mohammed.hassan@example.com\", \"password\": \"1e268c2f2238\"}, \"applicant_name\": \"Mohammed Hassan\", \"moodle_enrollment\": false}',1,'2026-02-08 09:24:00','2026-02-08 09:22:31','2026-02-08 09:24:00');
INSERT INTO `notifications` VALUES (6,NULL,'mohammed.khalid@example.com','welcome','Welcome to SCL Institute - Your Credentials',NULL,'\nWelcome to SCL Institute!\n\nYour student account has been created. Here are your login credentials:\n\n≡ƒôº Email/Username: mohammed.khalid@example.com\n≡ƒöÉ Temporary Password: 26cd6e25676b\n\nCourse: Artificial Intelligence & Machine Learning Certification\n\nPlease login at: http://localhost:3000/student/login\nYou can also access Moodle at: http://localhost:9090\n\nNote: Please change your password after first login.\n                    ','{\"course\": \"Artificial Intelligence & Machine Learning Certification\", \"moodle_url\": \"http://localhost:9090\", \"portal_url\": \"http://localhost:3000/student/login\", \"credentials\": {\"email\": \"mohammed.khalid@example.com\", \"password\": \"26cd6e25676b\"}, \"applicant_name\": \"Mohammed khan\", \"moodle_enrollment\": false}',1,'2026-02-11 15:26:41','2026-02-11 15:25:16','2026-02-11 15:26:41');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
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
INSERT INTO `roles` VALUES (1,'Super Admin','Full system access to all modules','2026-02-07 11:38:15');
INSERT INTO `roles` VALUES (2,'LMS Manager','Manages course delivery, assessments, grading','2026-02-07 11:38:15');
INSERT INTO `roles` VALUES (3,'Admissions Officer','Manages student applications, admissions, onboarding','2026-02-07 11:38:15');
INSERT INTO `roles` VALUES (4,'Faculty & HR Manager','Manages faculty recruitment, HR records','2026-02-07 11:38:15');
INSERT INTO `roles` VALUES (5,'Teacher','Teaches courses and manages student learning','2026-02-07 11:38:15');
INSERT INTO `roles` VALUES (6,'Student','Enrolled in courses','2026-02-07 11:38:15');
INSERT INTO `roles` VALUES (7,'Manager','Manages department operations','2026-02-07 11:38:15');
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
INSERT INTO `sso_tokens` VALUES ('064ce4e7-3c82-4f70-b320-60970f8542b1','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:46:17');
INSERT INTO `sso_tokens` VALUES ('0861e1fb-6153-47d3-adca-3f5901a76697','ahmed.hassan.app@example.com','Ahmed','Hassan','student',NULL,'2026-02-08 05:45:49');
INSERT INTO `sso_tokens` VALUES ('0aeddb16-f46f-4f3b-a163-2f322616d920','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:56:01');
INSERT INTO `sso_tokens` VALUES ('0b60af48-7d18-4394-90fd-9d705a623a77','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:54:01');
INSERT INTO `sso_tokens` VALUES ('0b81eca4-980b-4cd5-97b7-613ee4db5a18','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 12:21:58');
INSERT INTO `sso_tokens` VALUES ('10700bca-4139-4601-8bfd-b1f19446c98a','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:06:37');
INSERT INTO `sso_tokens` VALUES ('1178e371-f46d-49ce-9634-6d1cba2508a4','lmsmanager@scl.edu','LMS','Manager','LMS Manager',NULL,'2026-02-07 12:03:20');
INSERT INTO `sso_tokens` VALUES ('27a5045a-597f-41c3-8f71-a6c7d7ae0773','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:44:58');
INSERT INTO `sso_tokens` VALUES ('27b627e8-6451-4736-b1f9-fa554ecefd87','ahmed.hassan.app@example.com','Ahmed','Hassan','student',NULL,'2026-02-08 05:43:41');
INSERT INTO `sso_tokens` VALUES ('3420b314-562d-4aad-a668-becb786500a5','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:54:11');
INSERT INTO `sso_tokens` VALUES ('3715b1ed-5b6c-4b1f-a3bf-d5b29628b8aa','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 15:46:45');
INSERT INTO `sso_tokens` VALUES ('4f9c8148-7404-4f1d-ab55-089cb6ebca8f','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:25:38');
INSERT INTO `sso_tokens` VALUES ('548f2cbf-2c14-4cfd-9a41-1ac7e127a53e','student.ali.001@scl.edu','Ali','Hassan','Student',NULL,'2026-02-07 11:47:21');
INSERT INTO `sso_tokens` VALUES ('555f68fa-375a-4662-8a68-9abbe44c2e2f','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 16:18:59');
INSERT INTO `sso_tokens` VALUES ('5a769eb0-7ebe-4a56-ad09-103170b05da2','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 16:19:36');
INSERT INTO `sso_tokens` VALUES ('5c37dc50-88c1-429d-935b-be1f7315ad17','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 04:56:55');
INSERT INTO `sso_tokens` VALUES ('62b64b87-0a3c-42b1-8655-8f2b1f664520','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 12:02:23');
INSERT INTO `sso_tokens` VALUES ('64614446-6038-4674-8231-7794ab1ca20c','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:05:23');
INSERT INTO `sso_tokens` VALUES ('6dbc5ba8-5ed1-48f5-a81e-464bbb5e5005','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:36:20');
INSERT INTO `sso_tokens` VALUES ('71a28088-6334-4f92-a16c-22a959a7c4d9','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:47:42');
INSERT INTO `sso_tokens` VALUES ('87a3acda-b542-4d04-a7e2-74669068871a','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:46:22');
INSERT INTO `sso_tokens` VALUES ('906902b8-196e-45af-a290-99bd9fc3fe2b','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:43:30');
INSERT INTO `sso_tokens` VALUES ('95fd1b00-100f-4347-bcfe-26f9e989618e','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:12:24');
INSERT INTO `sso_tokens` VALUES ('9677d715-6a5c-4e92-919d-2e264012a1c6','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 12:01:46');
INSERT INTO `sso_tokens` VALUES ('9cf41978-21d9-493f-88a3-239988274854','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:53:44');
INSERT INTO `sso_tokens` VALUES ('a0cca436-4c51-4cde-98ab-3d2d0ee9432f','lmsmanager@scl.edu','LMS','Manager','LMS Manager',NULL,'2026-02-07 12:03:04');
INSERT INTO `sso_tokens` VALUES ('ab2edc8a-9ef8-4bc1-8746-bd75e5c28fb2','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 16:13:40');
INSERT INTO `sso_tokens` VALUES ('b000ab04-5f58-4f6c-ab34-d9e6f6c73738','ahmed.hassan.app@example.com','Ahmed','Hassan','student',NULL,'2026-02-08 05:38:48');
INSERT INTO `sso_tokens` VALUES ('b4937456-bf7e-48c5-b780-97e09acf9dc4','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 15:45:40');
INSERT INTO `sso_tokens` VALUES ('b7289303-d391-46fb-94ad-606674360f43','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:22:25');
INSERT INTO `sso_tokens` VALUES ('c1ff457e-6685-4fb8-a933-e62c9186a51f','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:04:30');
INSERT INTO `sso_tokens` VALUES ('c4f5d9aa-c7ba-4b6b-96d9-455e17aef2fc','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-08 05:15:10');
INSERT INTO `sso_tokens` VALUES ('d39a1baf-e20f-4075-9407-9adc681875db','ahmed.hassan.app@example.com','Ahmed','Hassan','student',NULL,'2026-02-07 17:06:52');
INSERT INTO `sso_tokens` VALUES ('d55c259b-13f8-42ef-b5ef-35f2c19e11f0','student.ali.001@scl.edu','Ali','Hassan','Student',NULL,'2026-02-07 12:05:06');
INSERT INTO `sso_tokens` VALUES ('d814d233-6ab5-43c1-82af-d9c401f52934','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 14:30:03');
INSERT INTO `sso_tokens` VALUES ('dbe27970-3f40-413d-8e9e-f09fc25c0171','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 12:02:31');
INSERT INTO `sso_tokens` VALUES ('dcd2f9d5-dd1a-40aa-9bd0-4b0afefa3802','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:42:13');
INSERT INTO `sso_tokens` VALUES ('f00585ca-3c44-4358-bd8d-603e9995024b','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 14:38:28');
INSERT INTO `sso_tokens` VALUES ('f5efb56b-740b-4de3-8de1-744f34319e5d','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 14:40:12');
INSERT INTO `sso_tokens` VALUES ('f6939777-f33f-46a6-904d-98ea383f6f75','admin@sclsandbox.xyz','System','Administrator','Super Admin',NULL,'2026-02-07 11:46:03');
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
  `course_title` varchar(255) NOT NULL,
  `course_code` varchar(50) NOT NULL,
  `course_type` enum('HND','Degree','Vocational','Short Course','CPD') NOT NULL,
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `application_reference` (`application_reference`),
  KEY `idx_email` (`email`),
  KEY `idx_application_status` (`application_status`),
  KEY `idx_course_code` (`course_code`),
  KEY `idx_intake_date` (`intake_start_date`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_applications`
--

LOCK TABLES `student_applications` WRITE;
/*!40000 ALTER TABLE `student_applications` DISABLE KEYS */;
INSERT INTO `student_applications` VALUES (1,'Ahmed',NULL,'Hassan','2000-05-15','Male','Pakistan','ahmed.hassan.app@example.com','+447123456789','123 Oxford Street',NULL,'London','SW1A 1AA','United Kingdom','Business Administration HND','MBA-BA-001','HND','Full-time','2026-09-01','Standard','A-Level','Royal Grammar School','2022-06-01',NULL,'IELTS',7.0,'Quote-184.pdf','Project Cost Estimate Proposal from Syed Fazli - 14-10-2025.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf',0,NULL,1,1,0,1,'Ahmed Hassan','2026-02-01','accepted','APP-20260207-00001','2026-02-07 12:14:38','2026-02-08 05:33:04','2026-02-07 12:14:38',1,'Quote-184.pdf',NULL,NULL,'Yes','2026-02-07 16:20:14','Pending');
INSERT INTO `student_applications` VALUES (2,'Fatima',NULL,'Ali','1999-12-20','Female','Saudi Arabia','fatima.ali.app@example.com','+447234567890','456 Baker Street',NULL,'London','NW1 6XE','United Kingdom','Information Technology Degree','BTECH-CSE-001','Degree','Full-time','2026-09-01','Standard','A-Level','Al-Hikma International School','2022-06-15',NULL,'IELTS',6.5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,1,1,0,1,'Fatima Ali','2026-02-02','submitted','APP-20260207-00002','2026-02-07 12:14:38','2026-02-08 05:33:04','2026-02-07 12:14:38',0,NULL,NULL,NULL,'Pending',NULL,'Pending');
INSERT INTO `student_applications` VALUES (3,'Mohammed',NULL,'Khan','2001-03-10','Male','Bangladesh','mohammed.khan.app@example.com','+447345678901','789 Regent Street',NULL,'London','W1B 5AH','United Kingdom','Accounting and Finance HND','BCOM-001','HND','Full-time','2026-09-01','Standard','A-Level','Dhaka Grammar School','2022-07-01',NULL,'IELTS',6.8,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,1,1,0,1,'Mohammed Khan','2026-02-03','accepted','APP-20260207-00003','2026-02-07 12:14:38','2026-02-08 05:33:04','2026-02-07 12:14:38',0,NULL,NULL,NULL,'Pending',NULL,'Pending');
INSERT INTO `student_applications` VALUES (4,'Noor',NULL,'Ahmed','2000-08-25','Female','UAE','noor.ahmed.app@example.com','+447456789012','321 Park Lane',NULL,'London','W1K 7AR','United Kingdom','English Language Course','BTECH-CSE-001','Short Course','Full-time','2026-03-01','Standard','GCSE','Emirates International School','2021-06-01',NULL,'TOEFL',85.0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,1,1,0,1,'Noor Ahmed','2026-02-04','conditional_accept','APP-20260207-00004','2026-02-07 12:14:38','2026-02-08 05:33:04','2026-02-07 12:14:38',0,NULL,NULL,NULL,'Pending',NULL,'Pending');
INSERT INTO `student_applications` VALUES (5,'Hamad',NULL,'Mohammed','1999-11-05','Male','Qatar','hamad.mohammed.app@example.com','+447567890123','654 Bond Street',NULL,'London','W1S 4AE','United Kingdom','Project Management CPD','PROJ501','CPD','Part-time','2026-04-01','Standard','Degree','Qatar University','2020-06-15',NULL,'IELTS',7.2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,1,1,0,1,'Hamad Mohammed','2026-02-05','rejected','APP-20260207-00005','2026-02-07 12:14:38','2026-02-07 14:42:37','2026-02-07 12:14:38',0,NULL,NULL,NULL,'Pending',NULL,'Pending');
INSERT INTO `student_applications` VALUES (6,'Mohammed','Ahmed','Hassan','1998-05-15','Male','Nigeria','mohammed.hassan@example.com','+234-803-555-0123','123 Lagos Street','Flat 4B','Lagos','100001','Nigeria','Artificial Intelligence Basics','CERT-AI-001','CPD','Full-time','2026-02-08','Standard','A-Level','Lagos International College','2020-06-30','2 years in IT support at Tech Solutions Ltd','IELTS',6.5,'/app/uploads/student-documents/1770542425879-988631858-Quote-184.pdf','/app/uploads/student-documents/1770542425878-455606262-Quote-184.pdf','/app/uploads/student-documents/1770542425876-571701943-Quote-184.pdf','/app/uploads/student-documents/1770542425881-850278176-Quote-184.pdf','/app/uploads/student-documents/1770542425884-124512938-Quote-184.pdf','/app/uploads/student-documents/1770542425887-776889921-Quote-184.pdf','/app/uploads/student-documents/1770542425887-801106105-Quote-184.pdf','/app/uploads/student-documents/1770542425888-887513031-Quote-184.pdf',0,NULL,1,1,1,1,'Mohammed Ahmed Hassan','2026-02-08','accepted','SCL2026000006','2026-02-08 09:20:25','2026-02-11 14:43:35','2026-02-08 09:20:25',1,NULL,NULL,NULL,'Pending',NULL,'Pending');
INSERT INTO `student_applications` VALUES (7,'Mohammed','Khalid','khan','1998-05-15','Male','Nigeria','mohammed.khalid@example.com','+234-803-555-0123','123 Lagos Street','Flat 4B','Lagos','100001','Nigeria','Artificial Intelligence & Machine Learning Certification','AI-CERT-001','CPD','Full-time','2026-02-11','Standard','A-Level','Lagos International College','2020-06-30','2 years in IT support at Tech Solutions Ltd','IELTS',6.5,'Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf','Quote-184.pdf',NULL,0,NULL,1,1,0,1,'Mohammed Khalid Khan','2026-02-11','accepted','SCL2026000007','2026-02-11 15:16:01','2026-02-11 15:59:44','2026-02-11 15:16:01',1,'Quote-184.pdf',NULL,NULL,'Yes','2026-02-11 15:59:44','Pending');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_induction`
--

LOCK TABLES `student_induction` WRITE;
/*!40000 ALTER TABLE `student_induction` DISABLE KEYS */;
INSERT INTO `student_induction` VALUES (1,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:35:27','2026-02-07 15:35:27','2026-02-07 15:35:27');
INSERT INTO `student_induction` VALUES (2,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:35:52','2026-02-07 15:35:52','2026-02-07 15:35:52');
INSERT INTO `student_induction` VALUES (3,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:39:14','2026-02-07 15:39:14','2026-02-07 15:39:14');
INSERT INTO `student_induction` VALUES (4,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:40:49','2026-02-07 15:40:49','2026-02-07 15:40:49');
INSERT INTO `student_induction` VALUES (5,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:51:14','2026-02-07 15:51:14','2026-02-07 15:51:14');
INSERT INTO `student_induction` VALUES (6,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:51:30','2026-02-07 15:51:30','2026-02-07 15:51:30');
INSERT INTO `student_induction` VALUES (7,1,1,'Ahmed Hassan','Business Administration HND','2026-09-01',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Ahmed Hassan','2026-02-07 00:00:00','2026-02-07 15:52:40','2026-02-07 15:52:40','2026-02-07 15:52:40');
INSERT INTO `student_induction` VALUES (8,7,7,'Mohammed khan','Artificial Intelligence & Machine Learning Certification','2026-02-11',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'Khaid Khan','2026-02-11 00:00:00','2026-02-11 15:47:19','2026-02-11 15:47:19','2026-02-11 15:47:19');
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
INSERT INTO `user_roles` VALUES (1,1,1,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (2,2,2,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (3,3,3,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (4,4,4,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (5,5,5,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (6,6,5,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (7,7,5,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (8,8,5,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (9,9,5,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (10,10,5,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (11,11,6,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (12,12,6,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (13,13,6,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (14,14,6,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (15,15,6,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (16,16,6,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (17,17,6,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (18,18,6,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (19,19,6,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (20,20,6,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (21,21,7,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (22,22,7,'2026-02-07 11:38:15',NULL);
INSERT INTO `user_roles` VALUES (23,23,7,'2026-02-07 11:38:15',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@sclsandbox.xyz','password123','password123','System','Administrator',NULL,NULL,NULL,NULL,1,'Super Admin','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (2,'lmsmanager@scl.edu','password123','password123','LMS','Manager',NULL,NULL,NULL,NULL,1,'LMS Manager','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (3,'admissions@scl.edu','password123','password123','Admissions','Officer',NULL,NULL,NULL,NULL,1,'Admissions Officer','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (4,'hr@scl.edu','password123','password123','HR','Manager',NULL,NULL,NULL,NULL,1,'Faculty & HR Manager','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (5,'dr.ahmed.cs@scl.edu','password123','password123','Ahmed','Khan',NULL,NULL,NULL,NULL,1,'Teacher','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (6,'prof.sara.ai@scl.edu','password123','password123','Sara','Ahmed',NULL,NULL,NULL,NULL,1,'Teacher','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (7,'dr.hassan.ml@scl.edu','password123','password123','Hassan','Ali',NULL,NULL,NULL,NULL,1,'Teacher','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (8,'eng.fahad.web@scl.edu','password123','password123','Fahad','Mohammed',NULL,NULL,NULL,NULL,1,'Teacher','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (9,'dr.aisha.data@scl.edu','password123','password123','Aisha','Fatima',NULL,NULL,NULL,NULL,1,'Teacher','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (10,'prof.usman.mech@scl.edu','password123','password123','Usman','Hassan',NULL,NULL,NULL,NULL,1,'Teacher','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (11,'student.ali.001@scl.edu','password123','password123','Ali','Hassan',NULL,NULL,NULL,NULL,1,'Student','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (12,'student.fatima.002@scl.edu','password123','password123','Fatima','Ahmed',NULL,NULL,NULL,NULL,1,'Student','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (13,'student.zain.003@scl.edu','password123','password123','Zain','Mohammed',NULL,NULL,NULL,NULL,1,'Student','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (14,'student.noor.004@scl.edu','password123','password123','Noor','Ahmed',NULL,NULL,NULL,NULL,1,'Student','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (15,'student.hamad.005@scl.edu','password123','password123','Hamad','Ali',NULL,NULL,NULL,NULL,1,'Student','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (16,'student.rana.006@scl.edu','password123','password123','Rana','Hassan',NULL,NULL,NULL,NULL,1,'Student','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (17,'student.adnan.007@scl.edu','password123','password123','Adnan','Fatima',NULL,NULL,NULL,NULL,1,'Student','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (18,'student.lina.008@scl.edu','password123','password123','Lina','Mohammed',NULL,NULL,NULL,NULL,1,'Student','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (19,'student.karim.009@scl.edu','password123','password123','Karim','Ahmed',NULL,NULL,NULL,NULL,1,'Student','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (20,'student.sara.010@scl.edu','password123','password123','Sara','Khan',NULL,NULL,NULL,NULL,1,'Student','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (21,'manager.dept.cs@scl.edu','password123','password123','Mohammad','CS Manager',NULL,NULL,NULL,NULL,1,'Manager','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (22,'manager.dept.eng@scl.edu','password123','password123','Eng','Department Manager',NULL,NULL,NULL,NULL,1,'Manager','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (23,'manager.dept.business@scl.edu','password123','password123','Business','Manager',NULL,NULL,NULL,NULL,1,'Manager','2026-02-07 11:38:15','2026-02-07 11:38:15');
INSERT INTO `users` VALUES (24,'ahmed.hassan.app@example.com','cc333cf9a45cdf6787b6238653956386a2a31362291a57e3eb5a7a4511e74ab1','ed0abf2e4945','Ahmed','Hassan',NULL,NULL,NULL,NULL,1,'student','2026-02-07 12:41:07','2026-02-07 12:41:07');
INSERT INTO `users` VALUES (25,'noor.ahmed.app@example.com','7bd5a690b45599cccae1baa4dfa2d9a24e70d0b67271939759f46f2a6f9dd967','0e51d63ca1c6','Noor','Ahmed',NULL,NULL,NULL,NULL,1,'student','2026-02-07 14:43:37','2026-02-07 14:43:37');
INSERT INTO `users` VALUES (26,'mohammed.khan.app@example.com','3b73ec5085753a0d604d27f6da701418531c816b8f423603f31c554e7df00c66','153e9b0c62fc','Mohammed','Khan',NULL,NULL,NULL,NULL,1,'student','2026-02-07 14:44:32','2026-02-07 14:44:32');
INSERT INTO `users` VALUES (27,'mohammed.hassan@example.com','d19939d2decc8b67ba71a19968497e6c39cc7d3eafcb07964e23ff34ab270b90','1e268c2f2238','Mohammed','Hassan',NULL,NULL,NULL,NULL,1,'student','2026-02-08 09:22:31','2026-02-08 09:22:31');
INSERT INTO `users` VALUES (28,'mohammed.khalid@example.com','84b43b9285335f93361d1de1823b1e3d5211208995f7cf6cad91153bfd147bcb','26cd6e25676b','Mohammed','khan',NULL,NULL,NULL,NULL,1,'student','2026-02-11 15:25:16','2026-02-11 15:25:16');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-13  4:22:13

