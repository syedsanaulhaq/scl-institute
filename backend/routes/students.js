// ===============================================
// Student Management API Routes
// Module 1: Student Admission System
// Handles all student registration and admission workflows
// ===============================================

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const mysql = require('mysql2/promise');
const router = express.Router();

// Database connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/student-documents');
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'));
        }
    }
});

// ===============================================
// ROUTE 1: GET /api/students/courses
// Get list of available courses for application form
// ===============================================
router.get('/courses', async (req, res) => {
    try {
        const [courses] = await db.execute(`
            SELECT 
                id,
                course_code,
                course_title,
                course_type,
                department,
                duration_months,
                description,
                full_time_available,
                part_time_available,
                online_available,
                blended_available,
                awarding_body
            FROM courses 
            WHERE course_status = 'active'
            ORDER BY course_title
        `);

        res.json({
            success: true,
            data: courses
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch courses',
            error: error.message
        });
    }
});

// ===============================================
// ROUTE 2: POST /api/students/applications
// Submit new student application (matches admission form exactly)
// ===============================================
router.post('/applications', upload.fields([
    { name: 'passport_id', maxCount: 1 },
    { name: 'academic_certificates', maxCount: 1 },
    { name: 'academic_transcripts', maxCount: 1 },
    { name: 'english_certificate', maxCount: 1 },
    { name: 'cv_resume', maxCount: 1 },
    { name: 'work_reference', maxCount: 1 },
    { name: 'proof_of_address', maxCount: 1 },
    { name: 'visa_immigration', maxCount: 1 }
]), async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Extract form data (matches admission.csv exactly)
        const {
            // Personal Information
            first_name,
            middle_names,
            last_name,
            date_of_birth,
            gender,
            nationality,
            email,
            contact_number,
            address_line1,
            address_line2,
            town_city,
            postcode,
            country_of_residence,
            
            // Course Selection
            course_title,
            course_code,
            course_type,
            mode_of_study,
            intake_start_date,
            entry_route,
            
            // Academic Background
            highest_qualification,
            institution_name,
            year_completed,
            relevant_work_experience,
            english_proficiency,
            english_score,
            
            // Support Requirements
            has_disabilities_support_needs,
            disability_support_details,
            
            // Consents & Declaration
            consent_gdpr,
            consent_data_sharing,
            consent_marketing,
            declaration_truth,
            digital_signature
        } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email || !course_code || !consent_gdpr || !declaration_truth) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if email already exists
        const [existingApp] = await connection.execute(
            'SELECT id FROM student_applications WHERE email = ?',
            [email]
        );

        if (existingApp.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'An application with this email already exists'
            });
        }

        // Process uploaded files
        const documentPaths = {};
        if (req.files) {
            Object.keys(req.files).forEach(fieldName => {
                if (req.files[fieldName] && req.files[fieldName][0]) {
                    documentPaths[fieldName] = req.files[fieldName][0].path;
                }
            });
        }

        // Insert main application
        const [result] = await connection.execute(`
            INSERT INTO student_applications (
                first_name, middle_names, last_name, date_of_birth, gender, nationality,
                email, contact_number, address_line1, address_line2, town_city, postcode, country_of_residence,
                course_title, course_code, course_type, mode_of_study, intake_start_date, entry_route,
                highest_qualification, institution_name, year_completed, relevant_work_experience, 
                english_proficiency, english_score,
                passport_id_document, academic_certificates, academic_transcripts, english_certificate,
                cv_resume, work_reference, proof_of_address, visa_immigration_document,
                has_disabilities_support_needs, disability_support_details,
                consent_gdpr, consent_data_sharing, consent_marketing, declaration_truth, digital_signature,
                declaration_date, application_status, submitted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'submitted', NOW())
        `, [
            first_name, middle_names, last_name, date_of_birth, gender, nationality,
            email, contact_number, address_line1, address_line2, town_city, postcode, country_of_residence,
            course_title, course_code, course_type, mode_of_study, intake_start_date, entry_route,
            highest_qualification, institution_name, year_completed, relevant_work_experience,
            english_proficiency, english_score,
            documentPaths.passport_id || null,
            documentPaths.academic_certificates || null,
            documentPaths.academic_transcripts || null,
            documentPaths.english_certificate || null,
            documentPaths.cv_resume || null,
            documentPaths.work_reference || null,
            documentPaths.proof_of_address || null,
            documentPaths.visa_immigration || null,
            has_disabilities_support_needs === 'true',
            disability_support_details,
            consent_gdpr === 'true',
            consent_data_sharing === 'true',
            consent_marketing === 'true',
            declaration_truth === 'true',
            digital_signature
        ]);

        const applicationId = result.insertId;

        // Store document records if uploaded
        if (req.files && Object.keys(req.files).length > 0) {
            for (const [fieldName, files] of Object.entries(req.files)) {
                if (files && files[0]) {
                    const file = files[0];
                    await connection.execute(`
                        INSERT INTO application_documents (
                            application_id, document_type, original_filename, stored_filename,
                            file_path, file_size, mime_type, uploaded_by_ip
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        applicationId,
                        fieldName,
                        file.originalname,
                        file.filename,
                        file.path,
                        file.size,
                        file.mimetype,
                        req.ip
                    ]);
                }
            }
        }

        await connection.commit();

        // Get the created application with reference number
        const [createdApp] = await connection.execute(
            'SELECT id, application_reference, email, first_name, last_name FROM student_applications WHERE id = ?',
            [applicationId]
        );

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                application_id: applicationId,
                application_reference: createdApp[0].application_reference,
                email: createdApp[0].email,
                name: `${createdApp[0].first_name} ${createdApp[0].last_name}`,
                status: 'submitted'
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error submitting application:', error);
        
        // Clean up uploaded files if database insert failed
        if (req.files) {
            for (const files of Object.values(req.files)) {
                for (const file of files) {
                    try {
                        await fs.unlink(file.path);
                    } catch (cleanupError) {
                        console.error('Error cleaning up file:', cleanupError);
                    }
                }
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to submit application',
            error: error.message
        });
    } finally {
        connection.release();
    }
});

// ===============================================
// ROUTE 3: GET /api/students/applications/:id
// Get single application details
// ===============================================
router.get('/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [applications] = await db.execute(`
            SELECT sa.*, c.department, c.awarding_body, c.duration_months
            FROM student_applications sa
            LEFT JOIN courses c ON sa.course_code = c.course_code
            WHERE sa.id = ?
        `, [id]);

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Get associated documents
        const [documents] = await db.execute(
            'SELECT document_type, original_filename, upload_date FROM application_documents WHERE application_id = ?',
            [id]
        );

        res.json({
            success: true,
            data: {
                application: applications[0],
                documents
            }
        });

    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch application',
            error: error.message
        });
    }
});

// ===============================================
// ROUTE 4: GET /api/students/applications
// Get applications list (for admissions staff)
// ===============================================
router.get('/applications', async (req, res) => {
    try {
        const { status, course_code, page = 1, limit = 50 } = req.query;
        
        let whereClause = 'WHERE 1=1';
        const params = [];
        
        if (status) {
            whereClause += ' AND sa.application_status = ?';
            params.push(status);
        }
        
        if (course_code) {
            whereClause += ' AND sa.course_code = ?';
            params.push(course_code);
        }
        
        const offset = (page - 1) * limit;
        
        const [applications] = await db.execute(`
            SELECT 
                sa.id,
                sa.application_reference,
                sa.first_name,
                sa.last_name,
                sa.email,
                sa.course_title,
                sa.course_code,
                sa.application_status,
                sa.submitted_at,
                sa.intake_start_date,
                c.department
            FROM student_applications sa
            LEFT JOIN courses c ON sa.course_code = c.course_code
            ${whereClause}
            ORDER BY sa.submitted_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);

        // Get total count
        const [countResult] = await db.execute(`
            SELECT COUNT(*) as total
            FROM student_applications sa
            ${whereClause}
        `, params);

        res.json({
            success: true,
            data: {
                applications,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total: countResult[0].total,
                    total_pages: Math.ceil(countResult[0].total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: error.message
        });
    }
});

// ===============================================
// ROUTE 5: POST /api/students/applications/:id/review
// Submit application review (admissions officers)
// ===============================================
router.post('/applications/:id/review', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            reviewer_id,
            review_stage,
            academic_suitability,
            english_proficiency_adequate,
            documentation_complete,
            work_experience_relevant,
            recommendation,
            review_notes,
            conditions_if_conditional,
            interview_required,
            interview_date,
            interview_location
        } = req.body;

        // Validate required fields
        if (!reviewer_id || !review_stage || !academic_suitability || !recommendation) {
            return res.status(400).json({
                success: false,
                message: 'Missing required review fields'
            });
        }

        // Insert review
        await db.execute(`
            INSERT INTO application_reviews (
                application_id, reviewer_id, review_stage,
                academic_suitability, english_proficiency_adequate, documentation_complete,
                work_experience_relevant, recommendation, review_notes, conditions_if_conditional,
                interview_required, interview_date, interview_location
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, reviewer_id, review_stage,
            academic_suitability, english_proficiency_adequate, documentation_complete,
            work_experience_relevant, recommendation, review_notes, conditions_if_conditional,
            interview_required, interview_date, interview_location
        ]);

        // Update application status based on recommendation
        let newStatus = 'under_review';
        if (recommendation === 'accept') newStatus = 'accepted';
        else if (recommendation === 'reject') newStatus = 'rejected';
        else if (recommendation === 'interview_required') newStatus = 'interview_scheduled';
        else if (recommendation === 'defer') newStatus = 'deferred';

        await db.execute(
            'UPDATE student_applications SET application_status = ? WHERE id = ?',
            [newStatus, id]
        );

        res.json({
            success: true,
            message: 'Review submitted successfully',
            data: {
                application_id: id,
                new_status: newStatus,
                recommendation
            }
        });

    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit review',
            error: error.message
        });
    }
});

// ===============================================
// ROUTE 6: GET /api/students/dashboard-stats
// Get dashboard statistics for admissions team
// ===============================================
router.get('/dashboard-stats', async (req, res) => {
    try {
        // Get application counts by status
        const [statusCounts] = await db.execute(`
            SELECT 
                application_status,
                COUNT(*) as count
            FROM student_applications 
            GROUP BY application_status
        `);

        // Get applications by course
        const [courseCounts] = await db.execute(`
            SELECT 
                sa.course_code,
                sa.course_title,
                COUNT(*) as applications,
                COUNT(CASE WHEN sa.application_status = 'accepted' THEN 1 END) as accepted
            FROM student_applications sa
            GROUP BY sa.course_code, sa.course_title
            ORDER BY applications DESC
        `);

        // Get recent applications (last 7 days)
        const [recentApplications] = await db.execute(`
            SELECT COUNT(*) as count
            FROM student_applications 
            WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);

        res.json({
            success: true,
            data: {
                status_summary: statusCounts,
                course_summary: courseCounts,
                recent_applications: recentApplications[0].count,
                last_updated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
});

module.exports = router;