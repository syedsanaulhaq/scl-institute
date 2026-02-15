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
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const NodeCache = require('node-cache');
const router = express.Router();
const { sendStudentWelcomeEmail, sendConditionalApprovalEmail } = require('../utils/emailService');
const { storeNotification } = require('./notifications');

// Cache for programme data (TTL: 15 minutes)
const programmeCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

const generateTempPassword = () => crypto.randomBytes(6).toString('hex');

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

// Moodle database connection pool (shared, not per-request)
const moodleDbPool = mysql.createPool({
    host: process.env.MOODLE_DATABASE_HOST || process.env.MOODLE_DB_HOST || 'scli-moodle-db-prod',
    port: process.env.MOODLE_DATABASE_PORT || process.env.MOODLE_DB_PORT || 3306,
    user: process.env.MOODLE_DATABASE_USER || process.env.MOODLE_DB_USER || 'bn_moodle',
    password: process.env.MOODLE_DATABASE_PASSWORD || process.env.MOODLE_DB_PASS || 'bitnami_moodle_password',
    database: process.env.MOODLE_DATABASE_NAME || process.env.MOODLE_DB_NAME || 'bitnami_moodle',
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
// Get list of available courses - fetching directly from Moodle database
// ===============================================
router.get('/courses', async (req, res) => {
    try {
        // Try to fetch from Moodle database first
        let moodleCourses = [];
        try {
            // Connect to Moodle database
            const moodleDb = mysql.createPool({
                host: 'scli-moodle-db-dev',
                port: 3306,
                user: 'bn_moodle',
                password: 'bitnami_moodle_password',
                database: 'bitnami_moodle',
                waitForConnections: true,
                connectionLimit: 5,
                queueLimit: 0
            });

            const [moodleResult] = await moodleDb.execute(`
                SELECT 
                    c.id,
                    c.idnumber as course_code,
                    c.shortname as course_shortname,
                    c.fullname as course_title,
                    COALESCE(cc.name, 'General') as course_type,
                    c.summary as description,
                    c.category,
                    c.visible,
                    c.timecreated,
                    c.timemodified
                FROM mdl_course c
                LEFT JOIN mdl_course_categories cc ON c.category = cc.id
                WHERE c.id > 1 AND c.visible = 1
                ORDER BY c.fullname ASC
            `);

            moodleCourses = moodleResult.map(course => ({
                id: course.id,
                course_code: course.course_code || course.course_shortname || `COURSE-${course.id}`,
                course_title: course.course_title,
                course_type: course.course_type,
                department: 'General',
                description: course.description || course.course_title,
                duration_months: 12,
                awarding_body: 'SCL Institute',
                moodle_course_id: course.id
            }));

            await moodleDb.end();

            if (moodleCourses.length > 0) {
                console.log(`✓ Fetched ${moodleCourses.length} courses from Moodle database`);
                return res.json({
                    success: true,
                    message: `Fetched ${moodleCourses.length} courses from Moodle database`,
                    data: moodleCourses,
                    source: 'moodle-db'
                });
            }
        } catch (moodleError) {
            console.error('Moodle DB error:', moodleError.message);
            // Fall through to SCL database fallback
        }

        // Fallback to SCL Institute database courses
        console.log('Using SCL Institute database courses as fallback');
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
            message: `Fetched ${courses.length} courses from SCL Institute database`,
            data: courses,
            source: 'scl-database'
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
            digital_signature,
            declaration_date
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

        // Helper to convert empty strings to null
        const toNullIfEmpty = (val) => (val === '' || val === undefined) ? null : val;
        
        // Helper to convert to boolean
        const toBool = (val) => val === true || val === 'true';

        // Generate application reference to avoid duplicate trigger values
        const [refRows] = await connection.execute(
            'SELECT LPAD(IFNULL(MAX(id), 0) + 1, 6, "0") as nextId FROM student_applications'
        );
        const applicationReference = `SCL${new Date().getFullYear()}${refRows[0].nextId}`;

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
                declaration_date, application_reference, application_status, submitted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())
        `, [
            first_name, 
            toNullIfEmpty(middle_names), 
            last_name, 
            date_of_birth, 
            gender, 
            nationality,
            email, 
            contact_number, 
            address_line1, 
            toNullIfEmpty(address_line2), 
            town_city, 
            postcode, 
            country_of_residence,
            course_title, 
            course_code, 
            course_type, 
            mode_of_study, 
            intake_start_date, 
            entry_route,
            highest_qualification, 
            institution_name, 
            year_completed, 
            toNullIfEmpty(relevant_work_experience),
            english_proficiency, 
            toNullIfEmpty(english_score),
            documentPaths.passport_id || null,
            documentPaths.academic_certificates || null,
            documentPaths.academic_transcripts || null,
            documentPaths.english_certificate || null,
            documentPaths.cv_resume || null,
            documentPaths.work_reference || null,
            documentPaths.proof_of_address || null,
            documentPaths.visa_immigration || null,
            toBool(has_disabilities_support_needs),
            toNullIfEmpty(disability_support_details),
            toBool(consent_gdpr),
            toBool(consent_data_sharing),
            toBool(consent_marketing),
            toBool(declaration_truth),
            digital_signature,
            declaration_date || new Date().toISOString().split('T')[0],
            applicationReference
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
// ROUTE 3B: PUT /api/students/applications/:id/accept-offer
// Student accepts offer
// ===============================================
router.put('/applications/:id/accept-offer', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            'UPDATE student_applications SET offer_accepted = 1 WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        res.json({
            success: true,
            message: 'Offer accepted successfully'
        });
    } catch (error) {
        console.error('Error accepting offer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept offer',
            error: error.message
        });
    }
});

// ===============================================
// ROUTE 3C: GET /api/students/applications/:id/offer-letter
// Download offer letter PDF
// ===============================================
router.get('/applications/:id/offer-letter', async (req, res) => {
    try {
        const { id } = req.params;

        const [applications] = await db.execute(
            `SELECT 
                id, first_name, middle_names, last_name, email, contact_number,
                course_title, course_code, course_type, mode_of_study,
                intake_start_date, entry_route, application_reference,
                highest_qualification, institution_name, year_completed,
                english_proficiency, english_score,
                address_line1, address_line2, town_city, postcode, country_of_residence,
                date_of_birth, gender, nationality,
                relevant_work_experience,
                has_disabilities_support_needs, disability_support_details,
                consent_gdpr, consent_data_sharing, consent_marketing,
                declaration_truth, digital_signature, declaration_date,
                application_status, created_at, updated_at, submitted_at
             FROM student_applications
             WHERE id = ?`,
            [id]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const app = applications[0];
        const fullName = `${app.first_name} ${app.last_name}`.trim();
        const startDate = app.intake_start_date
            ? new Date(app.intake_start_date).toISOString().split('T')[0]
            : 'TBD';

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Offer_Letter_${app.application_reference || app.id}.pdf"`);

        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        doc.pipe(res);

        doc.fontSize(20).text('Offer Letter', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Date: ${new Date().toISOString().split('T')[0]}`);
        doc.moveDown();
        doc.text(`To: ${fullName}`);
        doc.text(`Email: ${app.email}`);
        doc.moveDown();
        doc.text('We are pleased to offer you a place on the following programme:');
        doc.moveDown();
        doc.text(`Programme: ${app.course_title || 'N/A'}`);
        doc.text(`Course Code: ${app.course_code || 'N/A'}`);
        doc.text(`Mode of Study: ${app.mode_of_study || 'N/A'}`);
        doc.text(`Start Date: ${startDate || 'N/A'}`);
        doc.moveDown();
        doc.text('Please review the terms and confirm acceptance via the student portal.');
        doc.moveDown();
        doc.text('Sincerely,');
        doc.text('Admissions Office');

        doc.end();
    } catch (error) {
        console.error('Error generating offer letter:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate offer letter',
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
        
        const offset = (page - 1) * parseInt(limit);
        
        // Try the full query first, fall back to simple query if it fails
        let applications = [];
        try {
            const [result] = await db.execute(`
                SELECT 
                    sa.id,
                    sa.application_reference,
                    sa.first_name,
                    sa.middle_names,
                    sa.last_name,
                    sa.email,
                    sa.contact_number,
                    sa.course_title,
                    sa.course_code,
                    sa.course_type,
                    sa.mode_of_study,
                    sa.application_status,
                    sa.offer_accepted,
                    sa.submitted_at,
                    sa.created_at,
                    sa.updated_at,
                    sa.intake_start_date,
                    sa.entry_route,
                    sa.address_line1,
                    sa.address_line2,
                    sa.town_city,
                    sa.postcode,
                    sa.country_of_residence,
                    sa.date_of_birth,
                    sa.gender,
                    sa.nationality,
                    sa.highest_qualification,
                    sa.institution_name,
                    sa.year_completed,
                    sa.english_proficiency,
                    sa.english_score,
                    sa.relevant_work_experience,
                    sa.passport_id_document,
                    sa.academic_certificates,
                    sa.academic_transcripts,
                    sa.english_certificate,
                    sa.cv_resume,
                    sa.work_reference,
                    sa.proof_of_address,
                    sa.visa_immigration_document,
                    sa.student_contract,
                    sa.brp_card,
                    sa.residency_proof
                FROM student_applications sa
                ${whereClause}
                ORDER BY sa.submitted_at DESC
                LIMIT ? OFFSET ?
            `, [...params, parseInt(limit), parseInt(offset)]);
            
            applications = result;
        } catch (error) {
            console.error('Complex query failed, trying simple query:', error.message);
            // Fallback to simple query without LIMIT/OFFSET
            try {
                const [result] = await db.execute(`
                    SELECT 
                        sa.id,
                        sa.application_reference,
                        sa.first_name,
                        sa.last_name,
                        sa.email,
                        sa.course_title,
                        sa.course_code,
                        sa.course_type,
                        sa.mode_of_study,
                        sa.application_status,
                        sa.offer_accepted,
                        sa.submitted_at,
                        sa.created_at,
                        sa.updated_at,
                        sa.intake_start_date,
                        sa.entry_route,
                        sa.contact_number,
                        sa.address_line1,
                        sa.address_line2,
                        sa.town_city,
                        sa.postcode,
                        sa.country_of_residence,
                        sa.date_of_birth,
                        sa.gender,
                        sa.nationality,
                        sa.passport_id_document,
                        sa.academic_certificates,
                        sa.academic_transcripts,
                        sa.english_certificate,
                        sa.cv_resume,
                        sa.work_reference,
                        sa.proof_of_address,
                        sa.visa_immigration_document,
                        sa.student_contract,
                        sa.brp_card,
                        sa.residency_proof
                    FROM student_applications sa
                    ${whereClause}
                    ORDER BY sa.id DESC
                `, params);
                
                applications = result;
            } catch (fallbackError) {
                console.error('Simple query also failed:', fallbackError.message);
                applications = [];
            }
        }

        // If no applications found, return empty array (not mock data)
        if (applications.length === 0) {
            console.log('No applications found in database');
        }

        // Get total count from database
        let total = applications.length;
        try {
            const [countResult] = await db.execute(`
                SELECT COUNT(*) as total
                FROM student_applications sa
                ${whereClause}
            `, params);
            total = countResult[0].total;
        } catch (countError) {
            console.error('Count query failed:', countError.message);
            total = applications.length;
        }

        res.json({
            success: true,
            data: {
                applications,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total,
                    total_pages: Math.ceil(total / parseInt(limit))
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

// ===============================================
// ROUTE: GET /api/students/applications/:id/review
// Get existing review for an application
// ===============================================
router.get('/applications/:id/review', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [reviews] = await db.execute(
            'SELECT * FROM application_reviews WHERE application_id = ? ORDER BY reviewed_at DESC LIMIT 1',
            [id]
        );

        console.log(`[REVIEW CHECK] App ID ${id}: Found ${reviews.length} reviews`);

        if (reviews.length > 0) {
            console.log(`[REVIEW CHECK] App ID ${id}: Returning review data`);
            res.json({
                success: true,
                data: reviews[0]
            });
        } else {
            console.log(`[REVIEW CHECK] App ID ${id}: No review found`);
            res.json({
                success: true,
                data: null
            });
        }
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch review',
            error: error.message
        });
    }
});

// ROUTE: POST /api/students/applications/:id/review-decision
// Submit application review decision (CSV format)
// ===============================================
router.post('/applications/:id/review-decision', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            reviewer_name,
            review_date,
            documents_verified,
            eligibility_check,
            interview_conducted,
            interview_outcome,
            english_requirement_met,
            additional_notes,
            decision,
            reason_for_refusal,
            detailed_comments,
            committee_chair_name,
            final_decision_date,
            final_decision_confirmation
        } = req.body;

        // Initialize variables for scope
        let email = null;
        let tempPassword = null;

        // Validate required fields
        if (!reviewer_name || !decision) {
            return res.status(400).json({
                success: false,
                message: 'Reviewer name and decision are required'
            });
        }

        if (decision === 'Refusal' && !reason_for_refusal) {
            return res.status(400).json({
                success: false,
                message: 'Reason for refusal is required when rejecting'
            });
        }

        // Map decision to application status
        let newStatus = 'under_review';
        if (decision === 'Offer') newStatus = 'accepted';
        else if (decision === 'Conditional Offer') newStatus = 'conditional_accept';
        else if (decision === 'Refusal') newStatus = 'rejected';
        else if (decision === 'Waitlist') newStatus = 'deferred';

        // Update application status
        await db.execute(
            'UPDATE student_applications SET application_status = ? WHERE id = ?',
            [newStatus, id]
        );

        // Auto-create student user account for accepted/conditional offers
        let createdUser = null;
        if (newStatus === 'accepted' || newStatus === 'conditional_accept') {
            const [appRows] = await db.execute(
                'SELECT email, first_name, last_name, course_title, course_code FROM student_applications WHERE id = ?',
                [id]
            );

            if (appRows.length > 0) {
                const { first_name, last_name, course_title, course_code } = appRows[0];
                email = appRows[0].email;
                const [userRows] = await db.execute(
                    'SELECT id, role FROM users WHERE email = ?',
                    [email]
                );

                if (userRows.length === 0) {
                    tempPassword = generateTempPassword();
                    const passwordHash = crypto.createHash('sha256').update(tempPassword).digest('hex');
                    await db.execute(
                        'INSERT INTO users (email, password, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
                        [email, tempPassword, passwordHash, first_name, last_name, 'student']
                    );
                    createdUser = {
                        username: email,
                        password: tempPassword,
                        role: 'student',
                        status: 'created'
                    };
                    console.log(`[STUDENT USER] Created account for ${email} (Application ${id})`);
                } else {
                    // User already exists - get their password from database
                    const [userDetails] = await db.execute(
                        'SELECT password FROM users WHERE email = ?',
                        [email]
                    );
                    if (userDetails.length > 0) {
                        tempPassword = userDetails[0].password;
                    }
                    console.log(`[STUDENT USER] User already exists for ${email} (Application ${id})`);
                }

                // Enroll student in Moodle course if accepted
                let moodleResult = null;
                if (newStatus === 'accepted') {
                    moodleResult = await enrollStudentInMoodle(
                        email,
                        first_name,
                        last_name,
                        course_code
                    );
                    if (moodleResult.success) {
                        console.log(`[MOODLE] Student ${email} enrolled successfully`);
                    } else {
                        console.warn(`[MOODLE] Enrollment warning for ${email}: ${moodleResult.message}`);
                    }
                }

                // Send welcome email for accepted students
                if (newStatus === 'accepted') {
                    const emailResult = await sendStudentWelcomeEmail(
                        email,
                        first_name,
                        last_name,
                        tempPassword,
                        course_title
                    );
                    console.log(`[EMAIL SENT] Welcome email to ${email}:`, emailResult.success ? 'Success' : 'Failed');

                    // Store notification in database (for local testing without email)
                    const notificationBody = `
Welcome to SCL Institute!

Your student account has been created. Here are your login credentials:

📧 Email/Username: ${email}
🔐 Temporary Password: ${tempPassword}

Course: ${course_title}

Please login at: http://localhost:3000/student/login
You can also access Moodle at: http://localhost:9090

Note: Please change your password after first login.
                    `;
                    
                    await storeNotification(
                        email,
                        'welcome',
                        'Welcome to SCL Institute - Your Credentials',
                        notificationBody,
                        {
                            applicant_name: `${first_name} ${last_name}`,
                            course: course_title,
                            credentials: {
                                email,
                                password: tempPassword
                            },
                            moodle_enrollment: moodleResult?.success || false,
                            portal_url: 'http://localhost:3000/student/login',
                            moodle_url: 'http://localhost:9090'
                        }
                    );
                    console.log(`[NOTIFICATION] Welcome notification stored for ${email}`);
                }
                // Send conditional approval email
                else if (newStatus === 'conditional_accept') {
                    const emailResult = await sendConditionalApprovalEmail(
                        email,
                        first_name,
                        last_name,
                        course_title,
                        detailed_comments || 'Please refer to your admissions portal for conditions.'
                    );
                    console.log(`[EMAIL SENT] Conditional approval email to ${email}:`, emailResult.success ? 'Success' : 'Failed');

                    // Store conditional approval notification
                    const conditionBody = `
Conditional Offer - SCL Institute

Dear ${first_name} ${last_name},

Congratulations! You have received a conditional offer for:

📚 Course: ${course_title}

Conditions:
${detailed_comments || 'Please refer to your admissions portal for specific conditions.'}

Your temporary account credentials have been created:
📧 Email/Username: ${email}
🔐 Temporary Password: ${tempPassword}

Please login to your portal at: http://localhost:3000/student/login

Once you fulfill the conditions, you will be fully enrolled in the course and Moodle LMS.

Best regards,
SCL Institute Admissions Team
                    `;

                    await storeNotification(
                        email,
                        'conditional_offer',
                        'Conditional Offer - SCL Institute',
                        conditionBody,
                        {
                            applicant_name: `${first_name} ${last_name}`,
                            course: course_title,
                            conditions: detailed_comments || 'Check portal for details',
                            credentials: {
                                email,
                                password: tempPassword
                            },
                            portal_url: 'http://localhost:3000/student/login'
                        }
                    );
                    console.log(`[NOTIFICATION] Conditional offer notification stored for ${email}`);
                }
            }
        }

        // Check if review already exists
        const [existingReviews] = await db.execute(
            'SELECT id FROM application_reviews WHERE application_id = ?',
            [id]
        );

        console.log(`[REVIEW SAVE] App ID ${id}: Existing reviews = ${existingReviews.length}`);

        if (existingReviews.length > 0) {
            // Update existing review
            console.log(`[REVIEW SAVE] App ID ${id}: Updating existing review`);
            await db.execute(
                `UPDATE application_reviews SET 
                    reviewer_id = 1,
                    academic_suitability = ?,
                    english_proficiency_adequate = ?,
                    documentation_complete = ?,
                    recommendation = ?,
                    review_notes = ?
                WHERE application_id = ?`,
                [
                    documents_verified === 'Yes' ? 'suitable' : 'needs_assessment',
                    english_requirement_met === 'Yes' ? 1 : 0,
                    documents_verified === 'Yes' ? 1 : 0,
                    decision === 'Offer' ? 'accept' : 
                    decision === 'Conditional Offer' ? 'conditional_accept' :
                    decision === 'Refusal' ? 'reject' : 'defer',
                    JSON.stringify({
                        reviewer_name,
                        review_date,
                        documents_verified,
                        eligibility_check,
                        interview_conducted,
                        interview_outcome,
                        english_requirement_met,
                        additional_notes,
                        decision,
                        reason_for_refusal,
                        detailed_comments,
                        committee_chair_name,
                        final_decision_date,
                        final_decision_confirmation
                    }),
                    id
                ]
            );
        } else {
            // Create new review
            console.log(`[REVIEW SAVE] App ID ${id}: Creating new review`);
            await db.execute(
                `INSERT INTO application_reviews 
                (application_id, reviewer_id, review_stage, academic_suitability, english_proficiency_adequate, documentation_complete, recommendation, review_notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    1,
                    'final_decision',
                    documents_verified === 'Yes' ? 'suitable' : 'needs_assessment',
                    english_requirement_met === 'Yes' ? 1 : 0,
                    documents_verified === 'Yes' ? 1 : 0,
                    decision === 'Offer' ? 'accept' : 
                    decision === 'Conditional Offer' ? 'conditional_accept' :
                    decision === 'Refusal' ? 'reject' : 'defer',
                    JSON.stringify({
                        reviewer_name,
                        review_date,
                        documents_verified,
                        eligibility_check,
                        interview_conducted,
                        interview_outcome,
                        english_requirement_met,
                        additional_notes,
                        decision,
                        reason_for_refusal,
                        detailed_comments,
                        committee_chair_name,
                        final_decision_date,
                        final_decision_confirmation
                    })
                ]
            );
            console.log(`[REVIEW SAVE] App ID ${id}: New review created successfully`);
        }

        res.json({
            success: true,
            message: 'Review submitted successfully',
            data: {
                application_id: id,
                new_status: newStatus,
                decision,
                reviewer: reviewer_name,
                is_update: existingReviews.length > 0,
                created_user: createdUser,
                student_credentials: newStatus === 'accepted' ? {
                    email: email,
                    temporary_password: tempPassword,
                    note: 'Share this password with the student or they can use "Forgot Password" to reset'
                } : null
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

// Upload document for student application
router.post('/applications/:id/upload-document', upload.single('document'), async (req, res) => {
    try {
        const { id } = req.params;
        const { documentType } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        if (!documentType) {
            return res.status(400).json({
                success: false,
                message: 'Document type is required'
            });
        }

        const allowedDocumentTypes = new Set([
            'passport_id_document',
            'academic_certificates',
            'academic_transcripts',
            'english_certificate',
            'student_contract',
            'cv_resume',
            'work_reference',
            'proof_of_address',
            'visa_immigration_document',
            'passport_id',
            'visa_immigration',
            'brp_card',
            'residency_proof'
        ]);

        if (!allowedDocumentTypes.has(documentType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid document type'
            });
        }

        const columnMap = {
            passport_id_document: 'passport_id_document',
            academic_certificates: 'academic_certificates',
            academic_transcripts: 'academic_transcripts',
            english_certificate: 'english_certificate',
            student_contract: 'student_contract',
            cv_resume: 'cv_resume',
            work_reference: 'work_reference',
            proof_of_address: 'proof_of_address',
            visa_immigration_document: 'visa_immigration_document'
        };

        // Store original filename in the application columns
        const filePath = `/uploads/student-documents/${file.filename}`;

        // Update the application with the original filename when mapped to a column
        if (columnMap[documentType]) {
            const updateQuery = `UPDATE student_applications SET ${columnMap[documentType]} = ? WHERE id = ?`;
            await db.execute(updateQuery, [file.originalname, id]);
        }

        // Insert into application_documents for tracking
        await db.execute(
            `INSERT INTO application_documents (
                application_id, document_type, original_filename, stored_filename,
                file_path, file_size, mime_type, uploaded_by_ip
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            , [
                id,
                documentType,
                file.originalname,
                file.filename,
                filePath,
                file.size,
                file.mimetype,
                req.ip
            ]
        );

        console.log(`[DOCUMENT UPLOAD] Application ${id}: ${documentType} uploaded - ${file.filename}`);

        res.json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                documentType,
                fileName: file.filename,
                filePath
            }
        });

    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload document',
            error: error.message
        });
    }
});

// Get document file path by application ID and document type
router.get('/applications/:id/document/:documentType', async (req, res) => {
    try {
        const { id, documentType } = req.params;

        // Get the file path from application_documents table
        const [result] = await db.execute(
            `SELECT file_path FROM application_documents 
             WHERE application_id = ? AND document_type = ? 
             ORDER BY upload_date DESC LIMIT 1`,
            [id, documentType]
        );

        if (result.length > 0) {
            res.json({
                success: true,
                filePath: result[0].file_path
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }
    } catch (error) {
        console.error('Error getting document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get document',
            error: error.message
        });
    }
});

// Delete document by application ID and document type
router.delete('/applications/:id/document/:documentType', async (req, res) => {
    try {
        const { id, documentType } = req.params;

        // Get the document path first
        const [docResult] = await db.execute(
            `SELECT file_path FROM application_documents 
             WHERE application_id = ? AND document_type = ? 
             ORDER BY upload_date DESC LIMIT 1`,
            [id, documentType]
        );

        // Delete from application_documents table
        await db.execute(
            `DELETE FROM application_documents 
             WHERE application_id = ? AND document_type = ?`,
            [id, documentType]
        );

        // Clear the document field in student_applications
        const columnMap = {
            passport_id_document: 'passport_id_document',
            academic_certificates: 'academic_certificates',
            academic_transcripts: 'academic_transcripts',
            english_certificate: 'english_certificate',
            cv_resume: 'cv_resume',
            work_reference: 'work_reference',
            proof_of_address: 'proof_of_address',
            visa_immigration_document: 'visa_immigration_document'
        };

        if (columnMap[documentType]) {
            await db.execute(
                `UPDATE student_applications SET ${columnMap[documentType]} = NULL WHERE id = ?`,
                [id]
            );
        }

        console.log(`[DOCUMENT DELETE] Application ${id}: ${documentType} deleted`);

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document',
            error: error.message
        });
    }
});

// Save student induction/onboarding
router.post('/applications/:id/induction', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            student_id, student_name, course_title, course_start_date,
            student_handbook, course_handbook, assessment_grading_policy,
            code_of_conduct, health_safety_guidelines, academic_integrity,
            attendance_punctuality, it_email_usage, data_protection,
            complaints_appeals, library_resources, student_support_services,
            equality_diversity_inclusion, safeguarding_prevent,
            consent_personal_data, consent_awarding_bodies,
            consent_communications, consent_marketing_images,
            declaration_understood, digital_signature, declaration_date
        } = req.body;

        // Format dates to YYYY-MM-DD
        const formatDateForDB = (dateString) => {
            if (!dateString) return null;
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const [result] = await db.execute(
            `INSERT INTO student_induction (
                application_id, student_id, student_name, course_title,
                course_start_date, student_handbook, course_handbook,
                assessment_grading_policy, code_of_conduct, health_safety_guidelines,
                academic_integrity, attendance_punctuality, it_email_usage,
                data_protection, complaints_appeals, library_resources,
                student_support_services, equality_diversity_inclusion,
                safeguarding_prevent, consent_personal_data, consent_awarding_bodies,
                consent_communications, consent_marketing_images,
                declaration_understood, digital_signature, declaration_date, completed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                id, student_id, student_name, course_title,
                formatDateForDB(course_start_date), student_handbook ? 1 : 0, course_handbook ? 1 : 0,
                assessment_grading_policy ? 1 : 0, code_of_conduct ? 1 : 0, health_safety_guidelines ? 1 : 0,
                academic_integrity ? 1 : 0, attendance_punctuality ? 1 : 0, it_email_usage ? 1 : 0,
                data_protection ? 1 : 0, complaints_appeals ? 1 : 0, library_resources ? 1 : 0,
                student_support_services ? 1 : 0, equality_diversity_inclusion ? 1 : 0,
                safeguarding_prevent ? 1 : 0, consent_personal_data ? 1 : 0, consent_awarding_bodies ? 1 : 0,
                consent_communications ? 1 : 0, consent_marketing_images ? 1 : 0,
                declaration_understood ? 1 : 0, digital_signature, formatDateForDB(declaration_date)
            ]
        );

        console.log(`[INDUCTION COMPLETED] Application ${id}: ${student_name} completed induction`);

        res.json({
            success: true,
            message: 'Induction completed successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error saving induction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save induction',
            error: error.message
        });
    }
});

// Get student induction data
router.get('/applications/:id/induction', async (req, res) => {
    try {
        const { id } = req.params;
        const [induction] = await db.execute(
            'SELECT * FROM student_induction WHERE application_id = ? ORDER BY completed_at DESC LIMIT 1',
            [id]
        );

        if (!induction || induction.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No induction data found'
            });
        }

        res.json({
            success: true,
            data: induction[0]
        });
    } catch (error) {
        console.error('Error fetching induction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch induction',
            error: error.message
        });
    }
});

// Helper function to enroll student in Moodle course
async function enrollStudentInMoodle(email, firstName, lastName, courseCode) {
    try {
        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';

        // Step 1: Get all courses to find matching course
        const coursesResponse = await axios.get(
            `${moodleUrl}/webservice/rest/server.php`,
            {
                params: {
                    wstoken: moodleToken,
                    wsfunction: 'core_course_get_courses',
                    moodlewsrestformat: 'json'
                }
            }
        );

        const courses = coursesResponse.data || [];
        const targetCourse = courses.find(c => 
            c.idnumber === courseCode || 
            c.shortname === courseCode ||
            c.fullname?.includes(courseCode)
        );

        if (!targetCourse) {
            console.log(`[MOODLE] No course found for code: ${courseCode}`);
            return { success: false, message: 'Course not found in Moodle' };
        }

        console.log(`[MOODLE] Found course: ${targetCourse.fullname} (ID: ${targetCourse.id})`);

        // Step 2: Create user in Moodle if not exists
        try {
            const usersResponse = await axios.post(
                `${moodleUrl}/webservice/rest/server.php`,
                {
                    wstoken: moodleToken,
                    wsfunction: 'core_user_create_users',
                    users: [
                        {
                            username: email,
                            password: require('crypto').randomBytes(6).toString('hex'),
                            firstname: firstName,
                            lastname: lastName,
                            email: email,
                            preferences: [
                                {
                                    type: 'auth_forcepasswordchange',
                                    value: '1'
                                }
                            ]
                        }
                    ],
                    moodlewsrestformat: 'json'
                }
            );

            console.log(`[MOODLE] User created/verified in Moodle for ${email}`);
        } catch (userCreateError) {
            if (userCreateError.response?.data?.exception !== 'invalid_parameter_exception') {
                console.log(`[MOODLE] User ${email} already exists or creation skipped`);
            }
        }

        // Step 3: Get user ID from Moodle
        const userSearchResponse = await axios.post(
            `${moodleUrl}/webservice/rest/server.php`,
            {
                wstoken: moodleToken,
                wsfunction: 'core_user_get_users',
                criteria: [
                    {
                        key: 'email',
                        value: email
                    }
                ],
                moodlewsrestformat: 'json'
            }
        );

        const users = userSearchResponse.data?.users || [];
        if (users.length === 0) {
            return { success: false, message: 'User not found in Moodle after creation' };
        }

        const moodleUser = users[0];
        console.log(`[MOODLE] Found Moodle user ID: ${moodleUser.id}`);

        // Step 4: Enroll user in course
        const enrollResponse = await axios.post(
            `${moodleUrl}/webservice/rest/server.php`,
            {
                wstoken: moodleToken,
                wsfunction: 'enrol_manual_enrol_users',
                enrolments: [
                    {
                        userid: moodleUser.id,
                        courseid: targetCourse.id,
                        roleid: 5 // 5 = Student role in Moodle
                    }
                ],
                moodlewsrestformat: 'json'
            }
        );

        console.log(`[MOODLE] Student ${email} enrolled in course ${targetCourse.fullname}`);
        return { 
            success: true, 
            message: `Enrolled in ${targetCourse.fullname}`,
            moodleCourseId: targetCourse.id,
            moodleUserId: moodleUser.id
        };

    } catch (error) {
        console.error('[MOODLE ENROLL ERROR]', error.message);
        return { 
            success: false, 
            message: `Moodle enrollment failed: ${error.message}` 
        };
    }
}

// Bulk approve applications
router.post('/bulk-approve', async (req, res) => {
    try {
        const { applicationIds, reviewer_name } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide application IDs'
            });
        }

        const results = [];
        let successCount = 0;

        for (const appId of applicationIds) {
            try {
                // Get application details
                const [apps] = await db.execute(
                    'SELECT * FROM student_applications WHERE id = ?',
                    [appId]
                );

                if (apps.length === 0) {
                    results.push({ appId, success: false, message: 'Application not found' });
                    continue;
                }

                const app = apps[0];

                // Update application status
                await db.execute(
                    'UPDATE student_applications SET application_status = ? WHERE id = ?',
                    ['accepted', appId]
                );

                // Create user account
                const tempPassword = require('crypto').randomBytes(6).toString('hex');
                const email = app.email;
                const username = email.split('@')[0];

                await db.execute(
                    `INSERT INTO users (email, first_name, last_name, password, role, status) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [email, app.first_name, app.last_name, tempPassword, 'student', 'active']
                );

                console.log(`[BULK APPROVE] Application ${appId}: User created with credentials`);

                // Enroll in Moodle course
                const moodleEnroll = await enrollStudentInMoodle(
                    app.email,
                    app.first_name,
                    app.last_name,
                    app.course_code
                );

                if (moodleEnroll.success) {
                    console.log(`[BULK APPROVE] Application ${appId}: Enrolled in Moodle`);
                } else {
                    console.warn(`[BULK APPROVE] Application ${appId}: Moodle enrollment warning - ${moodleEnroll.message}`);
                }

                // Send welcome email
                try {
                    const { sendStudentWelcomeEmail } = require('../utils/emailService');
                    await sendStudentWelcomeEmail({
                        email: app.email,
                        firstName: app.first_name,
                        lastName: app.last_name,
                        username: email,
                        tempPassword: tempPassword,
                        courseTitle: app.course_title
                    });
                    console.log(`[EMAIL SENT] Welcome email sent to ${app.email}`);
                } catch (emailError) {
                    console.error(`[EMAIL ERROR] Failed to send email to ${app.email}:`, emailError.message);
                }

                // Store notification in database
                const bulkNotificationBody = `
Welcome to SCL Institute!

Your student account has been created. Here are your login credentials:

📧 Email/Username: ${app.email}
🔐 Temporary Password: ${tempPassword}

Course: ${app.course_title}

Please login at: http://localhost:3000/student/login
You can also access Moodle at: http://localhost:9090

Note: Please change your password after first login.
                `;
                
                await storeNotification(
                    app.email,
                    'welcome',
                    'Welcome to SCL Institute - Your Credentials',
                    bulkNotificationBody,
                    {
                        applicant_name: `${app.first_name} ${app.last_name}`,
                        course: app.course_title,
                        credentials: {
                            email: app.email,
                            password: tempPassword
                        },
                        moodle_enrollment: moodleEnroll.success || false,
                        portal_url: 'http://localhost:3000/student/login',
                        moodle_url: 'http://localhost:9090'
                    }
                );
                console.log(`[NOTIFICATION] Welcome notification stored for ${app.email} (Bulk)`);

                results.push({
                    appId,
                    success: true,
                    studentName: `${app.first_name} ${app.last_name}`,
                    email: app.email,
                    moodleEnrollment: moodleEnroll.success
                });
                successCount++;

            } catch (appError) {
                console.error(`Error processing application ${appId}:`, appError.message);
                results.push({
                    appId,
                    success: false,
                    message: appError.message
                });
            }
        }

        res.json({
            success: true,
            message: `Approved ${successCount} of ${applicationIds.length} applications`,
            data: {
                totalProcessed: applicationIds.length,
                successCount,
                results
            }
        });

    } catch (error) {
        console.error('Error in bulk approve:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process bulk approval',
            error: error.message
        });
    }
});

// Bulk reject applications
router.post('/bulk-reject', async (req, res) => {
    try {
        const { applicationIds, reason } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide application IDs'
            });
        }

        const results = [];
        let successCount = 0;

        for (const appId of applicationIds) {
            try {
                // Get application details
                const [apps] = await db.execute(
                    'SELECT * FROM student_applications WHERE id = ?',
                    [appId]
                );

                if (apps.length === 0) {
                    results.push({ appId, success: false, message: 'Application not found' });
                    continue;
                }

                const app = apps[0];

                // Update application status
                await db.execute(
                    'UPDATE student_applications SET application_status = ? WHERE id = ?',
                    ['rejected', appId]
                );

                console.log(`[BULK REJECT] Application ${appId}: Rejected`);

                // Send rejection email (optional - implement if email template exists)

                results.push({
                    appId,
                    success: true,
                    studentName: `${app.first_name} ${app.last_name}`,
                    email: app.email
                });
                successCount++;

            } catch (appError) {
                console.error(`Error processing application ${appId}:`, appError.message);
                results.push({
                    appId,
                    success: false,
                    message: appError.message
                });
            }
        }

        res.json({
            success: true,
            message: `Rejected ${successCount} of ${applicationIds.length} applications`,
            data: {
                totalProcessed: applicationIds.length,
                successCount,
                results
            }
        });

    } catch (error) {
        console.error('Error in bulk reject:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process bulk rejection',
            error: error.message
        });
    }
});

// Get applications for a specific student by email (optimized)
router.get('/my-applications', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email parameter is required'
            });
        }

        const [applications] = await db.execute(`
            SELECT 
                id,
                application_reference,
                first_name,
                last_name,
                email,
                course_title,
                course_code,
                course_type,
                mode_of_study,
                application_status,
                intake_start_date,
                created_at
            FROM student_applications
            WHERE email = ? AND application_status = 'accepted'
            ORDER BY created_at DESC
        `, [email]);

        res.json({
            success: true,
            data: {
                applications: applications
            }
        });
    } catch (error) {
        console.error('Error fetching student applications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: error.message
        });
    }
});

// Get student's programme/course details from Moodle
router.get('/programme/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check cache first
        const cacheKey = `programme_${id}`;
        const cached = programmeCache.get(cacheKey);
        if (cached) {
            console.log(`[CACHE HIT] Programme data for ID ${id}`);
            return res.json(cached);
        }

        console.log(`[CACHE MISS] Fetching programme data for ID ${id}`);

        // Get student application to find course info
        const [apps] = await db.execute(
            'SELECT course_code, course_title, course_type, mode_of_study, intake_start_date FROM student_applications WHERE id = ?',
            [id]
        );

        if (apps.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const app = apps[0];
        const courseCode = app.course_code || app.programme_code;
        const courseTitle = app.course_title || app.programme_title;

        // Try Moodle DB first for accurate course data (using shared connection pool)
        try {
            // First, try to find by idnumber or shortname (indexed, faster)
            const [courseRows] = await moodleDbPool.execute(
                `
                SELECT id, idnumber, shortname, fullname, startdate, enddate, summary
                FROM mdl_course
                WHERE idnumber = ? OR shortname = ?
                LIMIT 1
                `,
                [courseCode, courseCode]
            );

            let studentCourse = courseRows[0];

            // If not found by code, fallback to LIKE search (slower)
            if (!studentCourse && courseTitle) {
                const [likeRows] = await moodleDbPool.execute(
                    `
                    SELECT id, idnumber, shortname, fullname, startdate, enddate, summary
                    FROM mdl_course
                    WHERE fullname LIKE ?
                    LIMIT 1
                    `,
                    [`%${courseTitle}%`]
                );
                studentCourse = likeRows[0];
            }

            if (studentCourse) {
                // OPTIMIZED: Get course sections efficiently (no modules yet)
                const [sectionRows] = await moodleDbPool.execute(
                    `SELECT id, section, name 
                    FROM mdl_course_sections 
                    WHERE course = ? AND section > 0
                    ORDER BY section ASC`,
                    [studentCourse.id]
                );

                // OPTIMIZED: Get module metadata first (just IDs and types)
                const [moduleMetadata] = await moodleDbPool.execute(
                    `SELECT cm.id AS cmid, cm.section, cm.instance, m.name AS module_type
                    FROM mdl_course_modules cm
                    INNER JOIN mdl_modules m ON m.id = cm.module
                    WHERE cm.course = ? AND cm.deletioninprogress = 0
                    ORDER BY cm.section ASC, cm.id ASC`,
                    [studentCourse.id]
                );

                // Group modules by type for batch queries
                const modulesByType = {};
                moduleMetadata.forEach(mod => {
                    if (!modulesByType[mod.module_type]) {
                        modulesByType[mod.module_type] = [];
                    }
                    modulesByType[mod.module_type].push(mod);
                });

                // Build activity name map efficiently with targeted queries
                const activityNames = {};
                
                // Query only the tables we actually need
                for (const [moduleType, modules] of Object.entries(modulesByType)) {
                    const instanceIds = modules.map(m => m.instance).filter(id => id != null);
                    if (instanceIds.length === 0) continue;

                    try {
                        const tableName = `mdl_${moduleType}`;
                        const placeholders = instanceIds.map(() => '?').join(',');
                        
                        // Use query() instead of execute() for dynamic table names
                        const [rows] = await moodleDbPool.query(
                            `SELECT id, name FROM ${tableName} WHERE id IN (${placeholders})`,
                            instanceIds
                        );
                        
                        rows.forEach(row => {
                            const mod = modules.find(m => m.instance === row.id);
                            if (mod) {
                                activityNames[mod.cmid] = row.name || moduleType;
                            }
                        });
                    } catch (err) {
                        // Table might not exist or query failed, use module type as name
                        console.log(`Could not fetch ${moduleType} names:`, err.message);
                        modules.forEach(mod => {
                            activityNames[mod.cmid] = moduleType;
                        });
                    }
                }

                // Build activities by section
                const activitiesBySection = {};
                moduleMetadata.forEach(mod => {
                    if (!activitiesBySection[mod.section]) {
                        activitiesBySection[mod.section] = [];
                    }
                    activitiesBySection[mod.section].push({
                        id: mod.cmid,
                        type: mod.module_type || 'activity',
                        title: activityNames[mod.cmid] || mod.module_type || 'Activity'
                    });
                });

                const modules = (sectionRows || []).map((section, idx) => ({
                    code: `SEC${String(section.section).padStart(2, '0')}`,
                    name: section.name || `Section ${section.section || idx + 1}`,
                    credits: 20,
                    semester: idx < 3 ? 'Semester 1' : 'Semester 2',
                    modules: activitiesBySection[section.id] || []
                }));

                const response = {
                    success: true,
                    data: {
                        programme: {
                            code: courseCode,
                            title: courseTitle || studentCourse.fullname || courseCode,
                            type: app.course_type || 'Bachelor Degree',
                            studyMode: app.mode_of_study || 'Full-time',
                            duration: '1 Year',
                            moodleCourseId: studentCourse.id,
                            startDate: studentCourse.startdate ? new Date(studentCourse.startdate * 1000) : app.intake_start_date,
                            endDate: studentCourse.enddate ? new Date(studentCourse.enddate * 1000) : null,
                            summary: studentCourse.summary || null
                        },
                        modules: modules.length > 0 ? modules : generateDefaultModules(courseCode),
                        outcomes: [
                            'Understand core principles and theories',
                            'Apply knowledge in practical scenarios',
                            'Develop critical thinking and analysis skills',
                            'Prepare for professional practice',
                            'Engage in reflective learning'
                        ],
                        source: 'moodle-db'
                    }
                };
                // Cache the response
                programmeCache.set(cacheKey, response);
                return res.json(response);
            }
        } catch (moodleDbError) {
            console.log('Moodle DB error, falling back to API/default:', moodleDbError.message);
        }

        // Fallback: Moodle API
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';
        const axios = require('axios');

        try {
            const coursesResponse = await axios.get(
                `${moodleUrl}/webservice/rest/server.php`,
                {
                    params: {
                        wstoken: moodleToken,
                        wsfunction: 'core_course_get_courses',
                        moodlewsrestformat: 'json'
                    }
                }
            );

            const allCourses = coursesResponse.data || [];
            const studentCourse = allCourses.find(c => 
                c.idnumber === courseCode || 
                c.shortname === courseCode ||
                c.fullname?.includes(courseCode)
            );

            let modules = [];
            if (studentCourse) {
                try {
                    const sectionsResponse = await axios.get(
                        `${moodleUrl}/webservice/rest/server.php`,
                        {
                            params: {
                                wstoken: moodleToken,
                                wsfunction: 'core_course_get_contents',
                                courseid: studentCourse.id,
                                moodlewsrestformat: 'json'
                            }
                        }
                    );

                    const sections = sectionsResponse.data || [];
                    modules = sections.map((section, idx) => ({
                        code: `MOD${idx + 1}`,
                        name: section.name || `Module ${idx + 1}`,
                        credits: 20,
                        semester: idx < 3 ? 'Semester 1' : 'Semester 2',
                        modules: section.modules || []
                    }));
                } catch (e) {
                    console.log('Could not fetch course sections from Moodle:', e.message);
                }
            }

            const response = {
                success: true,
                data: {
                    programme: {
                        code: courseCode,
                        title: courseTitle || studentCourse?.fullname || courseCode,
                        type: app.course_type || 'Bachelor Degree',
                        studyMode: app.mode_of_study || 'Full-time',
                        duration: '1 Year',
                        moodleCourseId: studentCourse?.id,
                        startDate: studentCourse?.startdate ? new Date(studentCourse.startdate * 1000) : app.intake_start_date,
                        endDate: studentCourse?.enddate ? new Date(studentCourse.enddate * 1000) : null
                    },
                    modules: modules.length > 0 ? modules : generateDefaultModules(courseCode),
                    outcomes: [
                        'Understand core principles and theories',
                        'Apply knowledge in practical scenarios',
                        'Develop critical thinking and analysis skills',
                        'Prepare for professional practice',
                        'Engage in reflective learning'
                    ],
                    source: 'moodle-api'
                }
            };
            // Cache the response
            programmeCache.set(cacheKey, response);
            return res.json(response);

        } catch (moodleError) {
            console.log('Moodle API error, returning default programme data:', moodleError.message);
            
            const response = {
                success: true,
                data: {
                    programme: {
                        code: courseCode,
                        title: courseTitle,
                        type: app.course_type || 'Bachelor Degree',
                        studyMode: app.mode_of_study || 'Full-time',
                        duration: '1 Year',
                        startDate: app.intake_start_date || new Date()
                    },
                    modules: generateDefaultModules(courseCode),
                    outcomes: [
                        'Understand core principles and theories',
                        'Apply knowledge in practical scenarios',
                        'Develop critical thinking and analysis skills'
                    ],
                    source: 'default'
                }
            };
            // Cache the response
            programmeCache.set(cacheKey, response);
            return res.json(response);
        }

    } catch (error) {
        console.error('Error fetching programme:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch programme details',
            error: error.message
        });
    }
});

// Helper function to generate default modules based on course code
function generateDefaultModules(courseCode) {
    const modulesByCode = {
        'CS001': [
            { code: 'CS101', name: 'Programming Fundamentals', credits: 20, semester: 'Semester 1' },
            { code: 'CS102', name: 'Data Structures', credits: 20, semester: 'Semester 1' },
            { code: 'CS103', name: 'Web Development', credits: 20, semester: 'Semester 1' },
            { code: 'CS201', name: 'Software Engineering', credits: 20, semester: 'Semester 2' },
            { code: 'CS202', name: 'Database Systems', credits: 20, semester: 'Semester 2' },
            { code: 'CS203', name: 'Cloud Computing', credits: 20, semester: 'Semester 2' }
        ],
        'BUS002': [
            { code: 'BUS101', name: 'Business Fundamentals', credits: 20, semester: 'Semester 1' },
            { code: 'BUS102', name: 'Marketing Principles', credits: 20, semester: 'Semester 1' },
            { code: 'BUS103', name: 'Financial Accounting', credits: 20, semester: 'Semester 1' },
            { code: 'BUS201', name: 'Strategic Management', credits: 20, semester: 'Semester 2' },
            { code: 'BUS202', name: 'Operations Management', credits: 20, semester: 'Semester 2' },
            { code: 'BUS203', name: 'Business Analytics', credits: 20, semester: 'Semester 2' }
        ]
    };

    return modulesByCode[courseCode] || [
        { code: 'MOD101', name: 'Module 1', credits: 20, semester: 'Semester 1' },
        { code: 'MOD102', name: 'Module 2', credits: 20, semester: 'Semester 1' },
        { code: 'MOD103', name: 'Module 3', credits: 20, semester: 'Semester 1' },
        { code: 'MOD201', name: 'Module 4', credits: 20, semester: 'Semester 2' },
        { code: 'MOD202', name: 'Module 5', credits: 20, semester: 'Semester 2' },
        { code: 'MOD203', name: 'Module 6', credits: 20, semester: 'Semester 2' }
    ];
}

// Manual re-enrollment endpoint for testing/fixing
router.post('/enroll-moodle', async (req, res) => {
    try {
        const { email, firstName, lastName, courseCode } = req.body;

        if (!email || !courseCode) {
            return res.status(400).json({
                success: false,
                message: 'Email and course code are required'
            });
        }

        const moodleResult = await enrollStudentInMoodle(email, firstName || 'Student', lastName || 'User', courseCode);

        res.json({
            success: moodleResult.success,
            message: moodleResult.message,
            data: moodleResult.success ? {
                email,
                courseCode,
                moodleCourseId: moodleResult.moodleCourseId,
                moodleUserId: moodleResult.moodleUserId
            } : null
        });
    } catch (error) {
        console.error('Error in manual enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to enroll student',
            error: error.message
        });
    }
});

// Get student timetable from Moodle course events and assignments
router.get('/timetable/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get student's application
        const [appRows] = await db.execute(
            'SELECT id, course_code FROM student_applications WHERE id = ?',
            [id]
        );

        if (appRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const courseCode = appRows[0].course_code;

        // Get connection from Moodle database pool
        const moodlePool = mysql.createPool({
            host: process.env.MOODLE_DB_HOST || 'scli-moodle-db',
            user: process.env.MOODLE_DB_USER || 'root',
            password: process.env.MOODLE_DB_PASSWORD || 'moodleroot',
            database: process.env.MOODLE_DB_NAME || 'bitnami_moodle',
            waitForConnections: true,
            connectionLimit: 2,
            queueLimit: 0
        });

        try {
            // Get course ID - try multiple ways to find the course
            let courseId = null;
            
            // First try exact match by idnumber or shortname
            const [courseRows] = await moodlePool.execute(
                `SELECT id FROM mdl_course WHERE idnumber = ? OR shortname = ? LIMIT 1`,
                [courseCode, courseCode]
            );
            
            if (courseRows.length > 0) {
                courseId = courseRows[0].id;
            } else {
                // Try by idnumber starting with the code (e.g., "DEG-001 B.Sc Computer Science" contains "DEG-001")
                const [idnumberRows] = await moodlePool.execute(
                    `SELECT id FROM mdl_course WHERE idnumber LIKE ? OR fullname LIKE ? OR shortname LIKE ? LIMIT 1`,
                    [`${courseCode}%`, `%${courseCode}%`, `%${courseCode}%`]
                );
                if (idnumberRows.length > 0) {
                    courseId = idnumberRows[0].id;
                }
            }
            
            // If still no course found, just return empty data
            if (!courseId) {
                console.log(`Timetable: No course found for code '${courseCode}'`);
                return res.json({
                    success: true,
                    data: {},
                    debug: { courseCode, courseId: null, message: 'Course not found in Moodle' }
                });
            }

            console.log(`Timetable: Found course ID ${courseId} for code '${courseCode}'`);

            // Get events from mdl_event table for this course
            // Join with course modules to get activity links
            const [eventRows] = await moodlePool.execute(
                `
                SELECT 
                    e.id, e.name, e.eventtype, e.modulename, e.timestart, e.timeduration, e.description,
                    CASE 
                        WHEN e.modulename = 'quiz' THEN CONCAT('/mod/quiz/view.php?id=', cm.id)
                        WHEN e.modulename = 'assign' THEN CONCAT('/mod/assign/view.php?id=', cm.id)
                        WHEN e.modulename = 'forum' THEN CONCAT('/mod/forum/view.php?id=', cm.id)
                        WHEN e.modulename = 'lesson' THEN CONCAT('/mod/lesson/view.php?id=', cm.id)
                        ELSE NULL
                    END as moodle_url,
                    cm.id as cm_id
                FROM mdl_event e
                LEFT JOIN mdl_course_modules cm ON cm.course = e.courseid AND (
                    (e.modulename = 'quiz' AND cm.module = (SELECT id FROM mdl_modules WHERE name = 'quiz') AND cm.instance = e.instance) OR
                    (e.modulename = 'assign' AND cm.module = (SELECT id FROM mdl_modules WHERE name = 'assign') AND cm.instance = e.instance) OR
                    (e.modulename = 'forum' AND cm.module = (SELECT id FROM mdl_modules WHERE name = 'forum') AND cm.instance = e.instance) OR
                    (e.modulename = 'lesson' AND cm.module = (SELECT id FROM mdl_modules WHERE name = 'lesson') AND cm.instance = e.instance)
                )
                WHERE e.courseid = ? AND e.visible = 1
                ORDER BY e.timestart ASC
                `,
                [courseId]
            );

            // Get assignments with due dates
            const [assignmentRows] = await moodlePool.execute(
                `
                SELECT a.id, a.name, a.duedate, cm.id as cm_id
                FROM mdl_assign a
                JOIN mdl_course_modules cm ON cm.instance = a.id AND cm.module = (SELECT id FROM mdl_modules WHERE name = 'assign')
                WHERE cm.course = ? AND a.duedate > ?
                ORDER BY a.duedate ASC
                `,
                [courseId, Math.floor(Date.now() / 1000) - 86400 * 7]
            );

            // Organize by day of week
            const timetable = {
                Monday: [],
                Tuesday: [],
                Wednesday: [],
                Thursday: [],
                Friday: [],
                Saturday: [],
                Sunday: []
            };

            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            // Add events to timetable
            if (eventRows && eventRows.length > 0) {
                eventRows.forEach(event => {
                    if (event.timestart) {
                        const eventDate = new Date(event.timestart * 1000);
                        const dayIndex = eventDate.getDay();
                        const dayName = dayNames[dayIndex];
                        const timeStr = eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                        
                        const duration = event.timeduration ? Math.floor(event.timeduration / 3600) : 1;
                        const endTime = new Date(event.timestart * 1000 + event.timeduration * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                        // Map Moodle modulename to display type
                        let displayType = 'Event';
                        if (event.modulename === 'quiz') {
                            displayType = 'Quiz';
                        } else if (event.modulename === 'assign') {
                            displayType = 'Assignment';
                        } else if (event.modulename === 'forum') {
                            displayType = 'Forum';
                        } else if (event.modulename === 'lesson') {
                            displayType = 'Lesson';
                        }

                        const eventObj = {
                            type: displayType,
                            module: event.name,
                            code: event.modulename ? event.modulename.toUpperCase() : 'EVT',
                            time: `${timeStr} - ${endTime}`,
                            room: 'TBD',
                            instructor: 'TBD'
                        };
                        
                        // Add moodle_url if available
                        if (event.moodle_url) {
                            eventObj.moodle_url = event.moodle_url;
                        }
                        
                        timetable[dayName].push(eventObj);
                    }
                });
            }

            // Add assignments (as "Assignment" type events due on specific days)
            if (assignmentRows && assignmentRows.length > 0) {
                assignmentRows.forEach(assignment => {
                    if (assignment.duedate) {
                        const dueDate = new Date(assignment.duedate * 1000);
                        const dayIndex = dueDate.getDay();
                        const dayName = dayNames[dayIndex];
                        const timeStr = dueDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                        const assignmentObj = {
                            type: 'Assignment',
                            module: assignment.name,
                            code: 'ASSGN',
                            time: `Due: ${timeStr}`,
                            room: 'Online',
                            online: true,
                            instructor: 'Submit online'
                        };
                        
                        // Add moodle_url for assignment
                        if (assignment.cm_id) {
                            assignmentObj.moodle_url = `/mod/assign/view.php?id=${assignment.cm_id}`;
                        }
                        
                        timetable[dayName].push(assignmentObj);
                    }
                });
            }

            // If no data from Moodle, return what we have (might be empty)
            return res.json({
                success: true,
                data: timetable
            });

        } catch (moodleError) {
            console.log('Moodle DB error:', moodleError.message);
            // Return empty timetable on error
            return res.json({
                success: true,
                data: {}
            });
        }

    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch timetable',
            error: error.message
        });
    }
});

// Get student assessments from Moodle
router.get('/assessments/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // Get student's course from application
        const [appRows] = await db.query(
            `SELECT course_code FROM student_applications WHERE id = ?`,
            [studentId]
        );

        if (appRows.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        const courseCode = appRows[0].course_code;
        
        // Get Moodle course ID
        const moodlePool = mysql.createPool({
            host: process.env.MOODLE_DB_HOST || 'scli-moodle-db-dev',
            port: 3306,
            user: 'root',
            password: 'moodleroot',
            database: 'bitnami_moodle',
            waitForConnections: true,
            connectionLimit: 5,
            queueLimit: 0
        });

        const [courseRows] = await moodlePool.query(
            `SELECT id FROM mdl_course WHERE idnumber LIKE ? OR fullname LIKE ? OR shortname LIKE ? LIMIT 1`,
            [`${courseCode}%`, `%${courseCode}%`, `%${courseCode}%`]
        );

        if (courseRows.length === 0) {
            moodlePool.end();
            return res.json({
                success: true,
                data: []
            });
        }

        const courseId = courseRows[0].id;

        // Get assignments with due dates
        const [assignments] = await moodlePool.query(
            `
            SELECT a.id, a.name, a.duedate, cm.id as cm_id, 'assign' as type
            FROM mdl_assign a
            JOIN mdl_course_modules cm ON cm.instance = a.id AND cm.module = (SELECT id FROM mdl_modules WHERE name = 'assign')
            WHERE cm.course = ? AND a.duedate > ?
            UNION
            SELECT e.id, e.name, e.timestart as duedate, cm.id as cm_id, e.modulename as type
            FROM mdl_event e
            LEFT JOIN mdl_course_modules cm ON cm.instance = e.instance AND cm.module = (SELECT id FROM mdl_modules WHERE name = e.modulename)
            WHERE e.courseid = ? AND e.visible = 1
            ORDER BY duedate ASC
            `,
            [courseId, Math.floor(Date.now() / 1000), courseId]
        );

        const assessments = assignments.map(assign => ({
            id: assign.id,
            module: 'Course Module',
            code: assign.type ? assign.type.toUpperCase() : 'MOD',
            title: assign.name,
            type: assign.type === 'assign' ? 'Coursework' : (assign.type === 'quiz' ? 'Quiz' : (assign.type === 'forum' ? 'Forum' : 'Assessment')),
            dueDate: new Date(assign.duedate * 1000).toISOString().split('T')[0],
            weight: '100%',
            status: 'pending',
            submitted: false,
            moodle_url: assign.cm_id ? `/mod/${assign.type}/view.php?id=${assign.cm_id}` : null
        }));

        moodlePool.end();

        return res.json({
            success: true,
            data: assessments
        });

    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assessments',
            error: error.message
        });
    }
});

// Get student grades from Moodle gradebook
router.get('/grades/:id', async (req, res) => {
    try {
        const studentId = req.params.id;

        // Get student's email and course from application
        const [appRows] = await db.query(
            `SELECT email, course_code FROM student_applications WHERE id = ?`,
            [studentId]
        );

        if (appRows.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        const userEmail = appRows[0].email;
        const courseCode = appRows[0].course_code;

        // Connect to Moodle database
        const moodlePool = mysql.createPool({
            host: process.env.MOODLE_DB_HOST || 'scli-moodle-db-dev',
            port: 3306,
            user: 'root',
            password: 'moodleroot',
            database: 'bitnami_moodle',
            waitForConnections: true,
            connectionLimit: 5,
            queueLimit: 0
        });

        // Get Moodle user ID by email
        const [moodleUsers] = await moodlePool.query(
            `SELECT id FROM mdl_user WHERE email = ?`,
            [userEmail]
        );

        if (moodleUsers.length === 0) {
            moodlePool.end();
            return res.json({
                success: true,
                data: []
            });
        }

        const moodleUserId = moodleUsers[0].id;

        // Get course ID
        const [courseRows] = await moodlePool.query(
            `SELECT id FROM mdl_course WHERE idnumber LIKE ? OR fullname LIKE ? OR shortname LIKE ? LIMIT 1`,
            [`${courseCode}%`, `%${courseCode}%`, `%${courseCode}%`]
        );

        if (courseRows.length === 0) {
            moodlePool.end();
            return res.json({
                success: true,
                data: []
            });
        }

        const courseId = courseRows[0].id;

        // Get grades from gradebook
        const [grades] = await moodlePool.query(
            `
            SELECT 
                gi.itemname,
                gi.itemmodule,
                gg.finalgrade,
                gi.grademax,
                gg.timemodified,
                cm.id as cm_id
            FROM mdl_grade_items gi
            LEFT JOIN mdl_grade_grades gg ON gi.id = gg.itemid AND gg.userid = ?
            LEFT JOIN mdl_course_modules cm ON cm.instance = gi.iteminstance AND cm.module = (SELECT id FROM mdl_modules WHERE name = gi.itemmodule)
            WHERE gi.courseid = ? AND gi.itemtype = 'mod' AND gg.finalgrade IS NOT NULL
            ORDER BY gg.timemodified DESC
            `,
            [moodleUserId, courseId]
        );

        const [courseTotals] = await moodlePool.query(
            `
            SELECT 
                gg.finalgrade,
                gi.grademax,
                gg.timemodified
            FROM mdl_grade_items gi
            LEFT JOIN mdl_grade_grades gg ON gi.id = gg.itemid AND gg.userid = ?
            WHERE gi.courseid = ? AND gi.itemtype = 'course'
            LIMIT 1
            `,
            [moodleUserId, courseId]
        );

        const gradeData = grades.map(grade => ({
            id: grade.itemname,
            module: grade.itemname,
            code: grade.itemmodule ? grade.itemmodule.toUpperCase() : 'MOD',
            type: grade.itemmodule || 'Assessment',
            grade: grade.finalgrade ? parseFloat(grade.finalgrade).toFixed(2) : 'N/A',
            maxGrade: grade.grademax ? parseFloat(grade.grademax).toFixed(2) : '100',
            percentage: grade.grademax ? Math.round((grade.finalgrade / grade.grademax) * 100) : 0,
            submittedDate: grade.timemodified ? new Date(grade.timemodified * 1000).toISOString().split('T')[0] : 'N/A',
            feedback: 'See Moodle for detailed feedback',
            moodle_url: grade.cm_id ? `/mod/${grade.itemmodule}/view.php?id=${grade.cm_id}` : null
        }));

        moodlePool.end();

        const courseSummary = courseTotals.length > 0 ? {
            finalGrade: courseTotals[0].finalgrade ? parseFloat(courseTotals[0].finalgrade).toFixed(2) : null,
            maxGrade: courseTotals[0].grademax ? parseFloat(courseTotals[0].grademax).toFixed(2) : '100',
            percentage: courseTotals[0].grademax && courseTotals[0].finalgrade
                ? Math.round((courseTotals[0].finalgrade / courseTotals[0].grademax) * 100)
                : null,
            updatedAt: courseTotals[0].timemodified ? new Date(courseTotals[0].timemodified * 1000).toISOString().split('T')[0] : null
        } : null;

        return res.json({
            success: true,
            data: {
                grades: gradeData,
                courseSummary
            }
        });

    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch grades',
            error: error.message
        });
    }
});

// ===============================================
// RIGHT TO STUDY - DOCUMENTS & COMPLIANCE
// ===============================================

// Get Right to Study documents for student
router.get('/right-to-study/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [applications] = await db.execute(
            `SELECT id, first_name, last_name, email, passport_id_document, visa_immigration_document, 
                     right_to_study_verified, compliance_confirmed_at, documents_verified
             FROM student_applications 
             WHERE id = ?`,
            [id]
        );

        if (!applications.length) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const app = applications[0];

        // Get uploaded documents
        const [documents] = await db.execute(
            `SELECT document_type, original_filename, upload_date, file_path 
             FROM application_documents 
             WHERE application_id = ? AND document_type IN ('passport_id', 'visa_immigration', 'brp_card', 'residency_proof')`,
            [id]
        );

        // Format documents with expiry tracking (mock expiry dates - would come from document metadata)
        const formattedDocs = documents.map(doc => ({
            id: doc.original_filename,
            type: getDocumentType(doc.document_type),
            documentType: doc.document_type,
            status: app.documents_verified === 'Yes' ? 'Approved' : 'Pending Review',
            uploadDate: doc.upload_date,
            filePath: doc.file_path,
            expiryDate: calculateExpiryDate(doc.document_type), // Mock calculation
            daysUntilExpiry: calculateDaysUntilExpiry(doc.document_type)
        }));

        const fallbackDocs = [];
        if (formattedDocs.length === 0) {
            if (app.passport_id_document) {
                fallbackDocs.push({
                    id: `passport-${app.id}`,
                    type: getDocumentType('passport_id'),
                    documentType: 'passport_id',
                    status: app.documents_verified === 'Yes' ? 'Approved' : 'Pending Review',
                    uploadDate: null,
                    filePath: app.passport_id_document,
                    expiryDate: calculateExpiryDate('passport_id'),
                    daysUntilExpiry: calculateDaysUntilExpiry('passport_id')
                });
            }

            if (app.visa_immigration_document) {
                fallbackDocs.push({
                    id: `visa-${app.id}`,
                    type: getDocumentType('visa_immigration'),
                    documentType: 'visa_immigration',
                    status: app.documents_verified === 'Yes' ? 'Approved' : 'Pending Review',
                    uploadDate: null,
                    filePath: app.visa_immigration_document,
                    expiryDate: calculateExpiryDate('visa_immigration'),
                    daysUntilExpiry: calculateDaysUntilExpiry('visa_immigration')
                });
            }
        }

        res.json({
            success: true,
            student: {
                id: app.id,
                name: `${app.first_name} ${app.last_name}`.trim(),
                email: app.email,
                complianceConfirmed: !!app.compliance_confirmed_at,
                rightToStudyVerified: app.right_to_study_verified === 'Yes',
                complianceConfirmedAt: app.compliance_confirmed_at
            },
            documents: formattedDocs.length > 0 ? formattedDocs : fallbackDocs
        });

    } catch (error) {
        console.error('Error fetching right to study documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents',
            error: error.message
        });
    }
});

// Update compliance confirmation
router.put('/right-to-study/:id/confirm-compliance', async (req, res) => {
    try {
        const { id } = req.params;

        await db.execute(
            `UPDATE student_applications 
             SET compliance_confirmed_at = NOW(), right_to_study_verified = 'Yes'
             WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Compliance confirmed successfully'
        });

    } catch (error) {
        console.error('Error updating compliance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update compliance',
            error: error.message
        });
    }
});

// Update student profile information
router.put('/applications/:id/update-profile', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            first_name,
            last_name,
            contact_number,
            date_of_birth,
            address_line1,
            address_line2,
            town_city,
            postcode,
            country_of_residence,
            gender,
            nationality,
            emergency_contact_name,
            emergency_contact_relationship,
            emergency_contact_phone,
            emergency_contact_email,
            next_of_kin_name,
            next_of_kin_relationship,
            next_of_kin_phone,
            next_of_kin_email,
            next_of_kin_address,
            passport_number,
            passport_expiry_date,
            visa_status,
            visa_expiry_date,
            brp_number,
            brp_expiry_date
        } = req.body;

        // Build the update query with only provided fields
        const updateFields = [];
        const updateValues = [];

        const fieldMap = {
            first_name,
            last_name,
            contact_number,
            date_of_birth,
            address_line1,
            address_line2,
            town_city,
            postcode,
            country_of_residence,
            gender,
            nationality,
            emergency_contact_name,
            emergency_contact_relationship,
            emergency_contact_phone,
            emergency_contact_email,
            next_of_kin_name,
            next_of_kin_relationship,
            next_of_kin_phone,
            next_of_kin_email,
            next_of_kin_address,
            passport_number,
            passport_expiry_date,
            visa_status,
            visa_expiry_date,
            brp_number,
            brp_expiry_date
        };

        for (const [field, value] of Object.entries(fieldMap)) {
            if (value !== undefined && value !== null) {
                updateFields.push(`${field} = ?`);
                updateValues.push(value);
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateValues.push(id);

        const updateQuery = `UPDATE student_applications SET ${updateFields.join(', ')} WHERE id = ?`;

        const [result] = await db.execute(updateQuery, updateValues);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { id }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

// Helper functions
function getDocumentType(docType) {
    const typeMap = {
        'passport_id': 'Passport',
        'visa_immigration': 'UK Visa',
        'brp_card': 'BRP Card',
        'residency_proof': 'Residency Proof'
    };
    return typeMap[docType] || docType;
}

function calculateExpiryDate(docType) {
    const today = new Date();
    const expiryMap = {
        'passport_id': new Date(today.getFullYear() + 10, today.getMonth(), today.getDate()),
        'visa_immigration': new Date(today.getFullYear() + 5, today.getMonth(), today.getDate()),
        'brp_card': new Date(today.getFullYear() + 10, today.getMonth(), today.getDate()),
        'residency_proof': new Date(today.getFullYear() + 2, today.getMonth(), today.getDate())
    };
    return (expiryMap[docType] || new Date()).toISOString().split('T')[0];
}

function calculateDaysUntilExpiry(docType) {
    const today = new Date();
    const expiryDate = new Date(calculateExpiryDate(docType));
    const diffTime = expiryDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Accept student contract
router.post('/accept-contract', async (req, res) => {
    try {
        const { signature, acceptance_date } = req.body;
        
        if (!signature || !acceptance_date) {
            return res.status(400).json({
                success: false,
                message: 'Signature and acceptance date are required'
            });
        }

        // Log contract acceptance
        console.log(`[CONTRACT ACCEPTED] Signature: ${signature}, Date: ${acceptance_date}`);

        res.json({
            success: true,
            message: 'Contract accepted successfully',
            data: { acceptance_date }
        });
    } catch (error) {
        console.error('Error accepting contract:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept contract',
            error: error.message
        });
    }
});

// Get contract PDF
router.get('/contract-pdf', async (req, res) => {
    try {
        // For now, return a placeholder response
        // In production, you would generate or serve an actual PDF file
        res.json({
            success: true,
            message: 'Contract PDF endpoint'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get contract PDF'
        });
    }
});

// Submit a course change request (Deferral, Withdrawal, Transfer)
router.post('/applications/:id/course-change-request', upload.single('supporting_document'), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            type_of_request, effective_date, justification, current_study_mode,
            policy_confirmation, digital_signature, request_date
        } = req.body;
        const file = req.file;

        if (!type_of_request || !effective_date) {
            return res.status(400).json({
                success: false,
                message: 'Type of request and effective date are required'
            });
        }

        // Get application details
        const [apps] = await db.execute(
            'SELECT id, first_name, last_name, course_title, programme_name, intake_start_date FROM student_applications WHERE id = ?',
            [id]
        );

        if (!apps || apps.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const app = apps[0];
        const studentName = `${app.first_name} ${app.last_name}`.trim();
        const courseTitle = app.programme_name || app.course_title;
        const courseStartDate = app.intake_start_date;
        const supportingDocumentPath = file ? `/uploads/student-documents/${file.filename}` : null;
        const policyConfirmed = policy_confirmation === '1' || policy_confirmation === 'true' || policy_confirmation === true;

        // Insert course change request
        const [result] = await db.execute(
            `INSERT INTO course_change_requests (
                application_id, student_id, student_name, course_title, course_start_date,
                current_study_mode, type_of_request, effective_date, justification,
                supporting_document, policy_confirmation, digital_signature, request_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, id, studentName, courseTitle, courseStartDate,
                current_study_mode, type_of_request, effective_date, justification,
                supportingDocumentPath, policyConfirmed ? 1 : 0, digital_signature, request_date
            ]
        );

        console.log(`[COURSE CHANGE REQUEST] Application ${id}: ${type_of_request} request submitted by ${app.student_name}`);

        res.json({
            success: true,
            message: 'Course change request submitted successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error submitting course change request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit course change request',
            error: error.message
        });
    }
});

// Get course change requests for an application
router.get('/applications/:id/course-change-requests', async (req, res) => {
    try {
        const { id } = req.params;

        const [requests] = await db.execute(
            'SELECT * FROM course_change_requests WHERE application_id = ? ORDER BY created_at DESC',
            [id]
        );

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching course change requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch course change requests',
            error: error.message
        });
    }
});

// Get single course change request
router.get('/course-change-requests/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;

        const [request] = await db.execute(
            'SELECT * FROM course_change_requests WHERE id = ?',
            [requestId]
        );

        if (!request || request.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Course change request not found'
            });
        }

        res.json({
            success: true,
            data: request[0]
        });
    } catch (error) {
        console.error('Error fetching course change request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch course change request'
        });
    }
});

module.exports = router;