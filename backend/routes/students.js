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
const PROGRAMME_SWITCH_CONFIRMATION_PHRASE = 'CONFIRM PROGRAMME SWITCH';
const PROGRAMME_SWITCH_CONFIRMATION_ALIASES = [
    PROGRAMME_SWITCH_CONFIRMATION_PHRASE,
    'CONFIRM PROGRAMME SWTICH'
];

function normalizeProgrammeSwitchConfirmation(value) {
    return String(value || '').trim().replace(/\s+/g, ' ').toUpperCase();
}

// Cache for programme data (TTL: 15 minutes)
const programmeCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

// Cache for attendance data (TTL: 10 minutes)
const attendanceCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const generateTempPassword = () => crypto.randomBytes(6).toString('hex');

// Database connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
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
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 3000, // 3 second connection timeout
    acquireTimeout: 3000  // 3 second timeout for acquiring connection from pool
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

// Multer config for mixed files and fields
const uploadFields = upload.fields([
    { name: 'documents', maxCount: 10 },
    { name: 'documentType', maxCount: 1 },
    { name: 'applicationId', maxCount: 1 }
]);

async function ensureTeacherRegistrationTables() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS teacher_registrations (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                registration_reference VARCHAR(20) NULL UNIQUE,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                contact_number VARCHAR(20) NULL,
                nationality VARCHAR(100) NULL,
                highest_qualification VARCHAR(255) NULL,
                years_of_experience INT NULL,
                current_employer VARCHAR(255) NULL,
                teaching_statement TEXT NULL,
                selected_course_title VARCHAR(255) NOT NULL,
                selected_course_code VARCHAR(100) NOT NULL,
                selected_course_type VARCHAR(100) NULL,
                teaching_role VARCHAR(50) NOT NULL DEFAULT 'editingteacher',
                cv_resume VARCHAR(500) NULL,
                application_status ENUM('submitted', 'under_review', 'accepted', 'rejected') DEFAULT 'submitted',
                reviewer_name VARCHAR(255) NULL,
                reviewer_notes TEXT NULL,
                approved_at DATETIME NULL,
                rejected_at DATETIME NULL,
                created_user_id INT NULL,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_teacher_reg_status (application_status),
                INDEX idx_teacher_reg_email (email),
                INDEX idx_teacher_reg_course (selected_course_code)
            )
        `);
    } catch (error) {
        console.error('[TEACHER REGISTRATION] Failed to ensure tables:', error.message);
    }
}

ensureTeacherRegistrationTables();

async function ensureCourseRegistrationTables() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS course_registrations (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                registration_reference VARCHAR(20) NULL UNIQUE,
                course_title VARCHAR(255) NOT NULL,
                course_code VARCHAR(100) NOT NULL,
                programme_type_name VARCHAR(255) NULL,
                program_name VARCHAR(255) NULL,
                academic_year VARCHAR(50) NULL,
                semester_name VARCHAR(50) NULL,
                cohort_label VARCHAR(100) NULL,
                programme_type_category_id INT NULL,
                program_category_id INT NULL,
                year_category_id INT NULL,
                semester_category_id INT NULL,
                cohort_category_id INT NULL,
                course_type VARCHAR(100) NULL,
                awarding_body_accreditation VARCHAR(255) NULL,
                regulation_level VARCHAR(100) NULL,
                mode_of_delivery VARCHAR(100) NULL,
                start_date DATE NULL,
                end_date_or_duration VARCHAR(100) NULL,
                subject_area_discipline VARCHAR(150) NULL,
                course_description TEXT NULL,
                learning_outcomes TEXT NULL,
                units_modules_covered TEXT NULL,
                assessment_methods VARCHAR(150) NULL,
                entry_requirements TEXT NULL,
                tuition_fee_gbp DECIMAL(10,2) NULL,
                additional_costs TEXT NULL,
                funding_options VARCHAR(150) NULL,
                learning_resources_provided TEXT NULL,
                special_equipment_needed TEXT NULL,
                work_placement_included VARCHAR(10) NULL,
                course_leader_programme_director VARCHAR(255) NULL,
                internal_verification_contact VARCHAR(255) NULL,
                ukvi_approved_course VARCHAR(10) NULL,
                approval_date DATE NULL,
                review_date DATE NULL,
                special_admission_considerations TEXT NULL,
                progression_opportunities TEXT NULL,
                industry_partnerships TEXT NULL,
                application_status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'submitted',
                reviewer_name VARCHAR(255) NULL,
                reviewer_notes TEXT NULL,
                approved_at DATETIME NULL,
                rejected_at DATETIME NULL,
                moodle_course_id INT NULL,
                moodle_sync_status ENUM('pending', 'synced', 'failed') DEFAULT 'pending',
                moodle_sync_message TEXT NULL,
                last_synced_at DATETIME NULL,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_course_reg_code (course_code),
                INDEX idx_course_reg_status (application_status),
                INDEX idx_course_reg_sync (moodle_sync_status)
            )
        `);

        const [existingColumns] = await db.query('SHOW COLUMNS FROM course_registrations');
        const existingColumnNames = new Set(existingColumns.map((column) => String(column.Field || '').toLowerCase()));
        const requiredColumns = [
            { name: 'programme_type_name', sql: 'ALTER TABLE course_registrations ADD COLUMN programme_type_name VARCHAR(255) NULL AFTER course_code' },
            { name: 'program_name', sql: 'ALTER TABLE course_registrations ADD COLUMN program_name VARCHAR(255) NULL AFTER course_code' },
            { name: 'academic_year', sql: 'ALTER TABLE course_registrations ADD COLUMN academic_year VARCHAR(50) NULL AFTER program_name' },
            { name: 'semester_name', sql: 'ALTER TABLE course_registrations ADD COLUMN semester_name VARCHAR(50) NULL AFTER academic_year' },
            { name: 'cohort_label', sql: 'ALTER TABLE course_registrations ADD COLUMN cohort_label VARCHAR(100) NULL AFTER semester_name' },
            { name: 'programme_type_category_id', sql: 'ALTER TABLE course_registrations ADD COLUMN programme_type_category_id INT NULL AFTER semester_name' },
            { name: 'program_category_id', sql: 'ALTER TABLE course_registrations ADD COLUMN program_category_id INT NULL AFTER semester_name' },
            { name: 'year_category_id', sql: 'ALTER TABLE course_registrations ADD COLUMN year_category_id INT NULL AFTER program_category_id' },
            { name: 'semester_category_id', sql: 'ALTER TABLE course_registrations ADD COLUMN semester_category_id INT NULL AFTER year_category_id' },
            { name: 'cohort_category_id', sql: 'ALTER TABLE course_registrations ADD COLUMN cohort_category_id INT NULL AFTER semester_category_id' }
        ];

        for (const column of requiredColumns) {
            if (!existingColumnNames.has(column.name)) {
                await db.query(column.sql);
            }
        }
    } catch (error) {
        console.error('[COURSE REGISTRATION] Failed to ensure table:', error.message);
    }
}

ensureCourseRegistrationTables();

async function ensureProgramYearCohortsTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS program_year_cohorts (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                program_code VARCHAR(50) NOT NULL,
                academic_year VARCHAR(50) NOT NULL,
                program_name VARCHAR(255) NULL,
                programme_type_name VARCHAR(255) NULL,
                moodle_cohort_id INT NULL,
                moodle_cohort_idnumber VARCHAR(255) NULL,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_program_year (program_code, academic_year),
                INDEX idx_program_code (program_code),
                INDEX idx_moodle_cohort (moodle_cohort_id)
            )
        `);
    } catch (error) {
        console.error('[PROGRAM YEAR COHORTS] Failed to ensure table:', error.message);
    }
}

ensureProgramYearCohortsTable();

// ===============================================
// TABLE: programme_intakes
// Tracks programme intake batches (e.g. Sep-2025 cohort for jjj→hhhh)
// ===============================================
async function ensureProgrammeIntakesTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS programme_intakes (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                programme_type_name VARCHAR(255) NOT NULL,
                program_name VARCHAR(255) NOT NULL,
                intake_label VARCHAR(100) NOT NULL,
                intake_start_date DATE NULL,
                intake_end_date DATE NULL,
                moodle_cohort_id INT NULL,
                moodle_cohort_idnumber VARCHAR(255) NULL,
                programme_type_category_id INT NULL,
                program_category_id INT NULL,
                status ENUM('active', 'closed') DEFAULT 'active',
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_programme_intake (programme_type_name, program_name, intake_label),
                INDEX idx_intake_status (status)
            )
        `);
    } catch (error) {
        console.error('[PROGRAMME INTAKES] Failed to ensure table:', error.message);
    }
}

ensureProgrammeIntakesTable();

// Add intake_id column to course_registrations if missing
async function ensureIntakeIdColumn() {
    try {
        const [cols] = await db.query('SHOW COLUMNS FROM course_registrations');
        const colNames = new Set(cols.map(c => String(c.Field || '').toLowerCase()));
        if (!colNames.has('intake_id')) {
            await db.query('ALTER TABLE course_registrations ADD COLUMN intake_id INT NULL AFTER id');
            await db.query('ALTER TABLE course_registrations ADD INDEX idx_intake_id (intake_id)');
        }
    } catch (error) {
        console.error('[COURSE REGISTRATION] Failed to add intake_id:', error.message);
    }
}

ensureIntakeIdColumn();

// ===============================================
// ROUTE: POST /api/students/program-year-cohorts/create-or-fetch
// Create or fetch program-year cohort
// ===============================================
router.post('/program-year-cohorts/create-or-fetch', async (req, res) => {
    try {
        const { program_code, academic_year, program_name, programme_type_name } = req.body;

        if (!program_code || !academic_year) {
            return res.status(400).json({
                success: false,
                message: 'program_code and academic_year are required'
            });
        }

        // Extract year number from academic_year (e.g., "Year 1" -> 1)
        const yearMatch = String(academic_year).match(/[Yy]ear\s*(\d+)|Y(\d+)/);
        const yearNum = Number(yearMatch ? (yearMatch[1] || yearMatch[2]) : 1);

        // Check if already exists in our table
        const [existingCohports] = await db.execute(
            'SELECT * FROM program_year_cohorts WHERE program_code = ? AND academic_year = ?',
            [program_code, academic_year]
        );

        if (existingCohports.length > 0) {
            return res.json({
                success: true,
                message: 'Program-year cohort already exists',
                data: existingCohports[0],
                created: false
            });
        }

        // Create Moodle cohort if it doesn't exist
        const cohortIdnumber = `${program_code}-Y${yearNum}`.replace(/\s+/g, '-').toLowerCase();
        const cohortName = `${programme_type_name || 'Programme'} Year ${yearNum}`;

        const [existingMoodleCohorts] = await moodleDbPool.execute(
            'SELECT id FROM mdl_cohort WHERE idnumber = ? AND contextid = 1 LIMIT 1',
            [cohortIdnumber]
        );

        let moodleCohortId = null;
        if (existingMoodleCohorts.length > 0) {
            moodleCohortId = existingMoodleCohorts[0].id;
        } else {
            // Create new cohort in Moodle
            const now = Math.floor(Date.now() / 1000);
            const [result] = await moodleDbPool.execute(
                `INSERT INTO mdl_cohort (contextid, name, idnumber, description, timecreated, timemodified)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [1, cohortName, cohortIdnumber, `Master cohort for ${program_code} Year ${yearNum}`, now, now]
            );
            moodleCohortId = Number(result.insertId);
        }

        // Save to our database
        const [insertResult] = await db.execute(
            `INSERT INTO program_year_cohorts (program_code, academic_year, program_name, programme_type_name, moodle_cohort_id, moodle_cohort_idnumber)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [program_code, academic_year, program_name, programme_type_name, moodleCohortId, cohortIdnumber]
        );

        const [newCohort] = await db.execute(
            'SELECT * FROM program_year_cohorts WHERE id = ?',
            [insertResult.insertId]
        );

        res.json({
            success: true,
            message: 'Program-year cohort created',
            data: newCohort[0],
            created: true
        });
    } catch (error) {
        console.error('[create-or-fetch program-year cohort] Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create or fetch program-year cohort',
            error: error.message
        });
    }
});

// ===============================================
// ROUTE: GET /api/students/program-year-cohorts
// Get all program-year cohorts
// ===============================================
router.get('/program-year-cohorts', async (req, res) => {
    try {
        const { program_code, academic_year } = req.query;

        let query = 'SELECT * FROM program_year_cohorts WHERE 1=1';
        const params = [];

        if (program_code) {
            query += ' AND program_code = ?';
            params.push(program_code);
        }

        if (academic_year) {
            query += ' AND academic_year = ?';
            params.push(academic_year);
        }

        const [cohorts] = await db.execute(query, params);

        res.json({
            success: true,
            data: cohorts
        });
    } catch (error) {
        console.error('[get program-year cohorts] Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch program-year cohorts',
            error: error.message
        });
    }
});

// ===============================================
// ROUTE: GET /api/students/moodle-cohorts
// Fetch existing Moodle cohorts from mdl_cohort filtered by programme code prefix
// ===============================================
router.get('/moodle-cohorts', async (req, res) => {
    try {
        const programCode = String(req.query.program_code || '').trim().toLowerCase();

        let query, params;
        if (programCode) {
            query = `SELECT id, name, idnumber, description, timecreated FROM mdl_cohort WHERE idnumber LIKE ? ORDER BY timecreated DESC`;
            params = [`${programCode}-%`];
        } else {
            query = `SELECT id, name, idnumber, description, timecreated FROM mdl_cohort ORDER BY timecreated DESC LIMIT 100`;
            params = [];
        }

        const [rows] = await moodleDbPool.execute(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('[moodle-cohorts] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch Moodle cohorts', error: error.message });
    }
});

// ===============================================
// ROUTE: GET /api/students/programme-intakes
// Fetch all programme intakes, optionally filtered
// ===============================================
router.get('/programme-intakes', async (req, res) => {
    try {
        const { programme_type_name, program_name, status } = req.query;
        let query = `SELECT pi.*,
            (SELECT COUNT(*) FROM course_registrations cr WHERE cr.intake_id = pi.id) AS registration_count
            FROM programme_intakes pi WHERE 1=1`;
        const params = [];

        if (programme_type_name) {
            query += ' AND pi.programme_type_name = ?';
            params.push(programme_type_name);
        }
        if (program_name) {
            query += ' AND pi.program_name = ?';
            params.push(program_name);
        }
        if (status) {
            query += ' AND pi.status = ?';
            params.push(status);
        }

        query += ' ORDER BY pi.created_at DESC';
        const [rows] = await db.execute(query, params);

        // For each intake, fetch its course registrations
        const intakesWithCourses = [];
        for (const intake of rows) {
            const [courses] = await db.execute(
                `SELECT cr.id, cr.course_title, cr.course_code, cr.programme_type_name, cr.program_name,
                        cr.academic_year, cr.semester_name, cr.cohort_label, cr.course_type,
                        cr.moodle_course_id, cr.moodle_sync_status, cr.moodle_sync_message,
                        cr.application_status, cr.start_date, cr.created_at
                 FROM course_registrations cr
                 WHERE cr.intake_id = ?
                 ORDER BY cr.academic_year, cr.semester_name, cr.course_code`,
                [intake.id]
            );
            intakesWithCourses.push({ ...intake, courses });
        }

        res.json({ success: true, data: intakesWithCourses });
    } catch (error) {
        console.error('[programme-intakes GET] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch programme intakes', error: error.message });
    }
});

// ===============================================
// ROUTE: GET /api/students/course-intakes/:courseCode
// Returns active intakes for a given course code (used by application form)
// ===============================================
router.get('/course-intakes/:courseCode', async (req, res) => {
    try {
        const { courseCode } = req.params;
        // Map course code to programme name
        const [courseRows] = await db.execute(
            'SELECT course_code, course_title, course_type FROM courses WHERE course_code = ? AND course_status = ? LIMIT 1',
            [courseCode, 'active']
        );
        if (!courseRows.length) {
            return res.json({ success: true, data: [], message: 'Course not found' });
        }
        const course = courseRows[0];

        // Find intakes whose program_name roughly matches the course title
        const [intakes] = await db.execute(
            `SELECT id, programme_type_name, program_name, intake_label, intake_start_date, intake_end_date, status
             FROM programme_intakes
             WHERE status = 'active'
               AND (program_name = ? OR program_name LIKE ?)
             ORDER BY intake_start_date ASC`,
            [course.course_title, `%${course.course_title.substring(0, 20)}%`]
        );

        res.json({ success: true, data: intakes });
    } catch (error) {
        console.error('[course-intakes GET] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch course intakes', error: error.message });
    }
});

// ===============================================
// ROUTE: POST /api/students/programme-intakes
// Create a programme intake: creates Moodle cohort + registration rows for all courses in that programme
// ===============================================
router.post('/programme-intakes', async (req, res) => {
    try {
        const {
            programme_type_name,
            program_name,
            intake_label,
            intake_start_date,
            intake_end_date,
            programme_type_category_id,
            program_category_id,
        } = req.body || {};

        if (!programme_type_name || !program_name || !intake_label) {
            return res.status(400).json({ success: false, message: 'Programme type, program name, and intake label are required.' });
        }

        // Check for duplicate
        const [existing] = await db.execute(
            `SELECT id FROM programme_intakes WHERE programme_type_name = ? AND program_name = ? AND intake_label = ? LIMIT 1`,
            [programme_type_name, program_name, intake_label]
        );
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Intake "${intake_label}" already exists for ${programme_type_name} → ${program_name}.`,
                existing_intake_id: existing[0].id
            });
        }

        // 1. Create Moodle cohort
        const programCode = String(programme_type_name).substring(0, 10).replace(/\s+/g, '-').toLowerCase();
        const progCode = String(program_name).substring(0, 10).replace(/\s+/g, '-').toLowerCase();
        const cohortIdnumber = `${programCode}-${progCode}-${intake_label}`.replace(/\s+/g, '-').toLowerCase();
        const cohortName = `${programme_type_name} - ${program_name} - ${intake_label}`;

        let moodleCohortId = null;
        try {
            // Check if cohort already exists in Moodle
            const [existingCohorts] = await moodleDbPool.execute(
                `SELECT id FROM mdl_cohort WHERE idnumber = ? LIMIT 1`,
                [cohortIdnumber]
            );

            if (existingCohorts.length > 0) {
                moodleCohortId = existingCohorts[0].id;
            } else {
                const now = Math.floor(Date.now() / 1000);
                const [cohortResult] = await moodleDbPool.execute(
                    `INSERT INTO mdl_cohort (contextid, name, idnumber, description, descriptionformat, timecreated, timemodified)
                     VALUES (1, ?, ?, ?, 1, ?, ?)`,
                    [cohortName, cohortIdnumber, `Intake ${intake_label} for ${programme_type_name} - ${program_name}`, now, now]
                );
                moodleCohortId = Number(cohortResult.insertId);
            }
        } catch (moodleErr) {
            console.warn('[programme-intakes] Moodle cohort creation warning:', moodleErr.message);
        }

        // 2. Insert the programme_intakes row
        const [insertResult] = await db.execute(
            `INSERT INTO programme_intakes
             (programme_type_name, program_name, intake_label, intake_start_date, intake_end_date,
              moodle_cohort_id, moodle_cohort_idnumber, programme_type_category_id, program_category_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [
                programme_type_name, program_name, intake_label,
                intake_start_date || null, intake_end_date || null,
                moodleCohortId, cohortIdnumber,
                programme_type_category_id || null, program_category_id || null
            ]
        );
        const intakeId = Number(insertResult.insertId);

        // 3. Find all courses for this programme from course_lifecycle_master
        const [masterCourses] = await db.execute(
            `SELECT * FROM course_lifecycle_master
             WHERE programme_type_name = ? AND program_name = ?
             ORDER BY academic_year, semester_name, course_code`,
            [programme_type_name, program_name]
        );

        // 4. Create a course_registration row per course, linked to this intake
        // Copy all 22 custom fields from any existing registration with the same course_code
        const DETAIL_FIELDS = [
            'regulation_level', 'mode_of_delivery', 'start_date', 'end_date_or_duration',
            'subject_area_discipline', 'course_description', 'learning_outcomes',
            'units_modules_covered', 'assessment_methods', 'entry_requirements',
            'tuition_fee_gbp', 'additional_costs', 'funding_options',
            'learning_resources_provided', 'special_equipment_needed', 'work_placement_included',
            'course_leader_programme_director', 'internal_verification_contact',
            'ukvi_approved_course', 'approval_date', 'review_date',
            'special_admission_considerations', 'progression_opportunities', 'industry_partnerships'
        ];

        const registrationIds = [];
        for (const mc of masterCourses) {
            // Skip if a registration already exists for this course + intake_label
            const [dupCheck] = await db.execute(
                `SELECT id FROM course_registrations WHERE course_code = ? AND cohort_label = ? AND intake_id = ? LIMIT 1`,
                [mc.course_code, intake_label, intakeId]
            );
            if (dupCheck.length > 0) {
                registrationIds.push(dupCheck[0].id);
                continue;
            }

            // Look up an existing registration with same course_code that has detail fields filled
            let sourceReg = null;
            const [existingRegs] = await db.execute(
                `SELECT * FROM course_registrations
                 WHERE course_code = ? AND intake_id != ?
                   AND (regulation_level IS NOT NULL OR mode_of_delivery IS NOT NULL
                        OR learning_outcomes IS NOT NULL OR course_description IS NOT NULL
                        OR entry_requirements IS NOT NULL)
                 ORDER BY id DESC LIMIT 1`,
                [mc.course_code, intakeId]
            );
            if (existingRegs.length > 0) {
                sourceReg = existingRegs[0];
            }

            // Build the INSERT with all detail fields included
            const detailColumns = DETAIL_FIELDS.join(', ');
            const detailPlaceholders = DETAIL_FIELDS.map(() => '?').join(', ');

            const [regResult] = await db.execute(
                `INSERT INTO course_registrations
                 (intake_id, course_title, course_code, programme_type_name, program_name,
                  academic_year, semester_name, cohort_label,
                  programme_type_category_id, program_category_id, year_category_id, semester_category_id,
                  course_type, awarding_body_accreditation, ${detailColumns},
                  application_status, moodle_sync_status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${detailPlaceholders}, 'submitted', 'pending')`,
                [
                    intakeId,
                    mc.course_title,
                    mc.course_code,
                    mc.programme_type_name,
                    mc.program_name,
                    mc.academic_year,
                    mc.semester_name,
                    intake_label,
                    mc.programme_type_category_id || null,
                    mc.program_category_id || null,
                    mc.year_category_id || null,
                    mc.semester_category_id || null,
                    mc.course_type || mc.programme_type_name || null,
                    mc.awarding_body || null,
                    // Copy detail fields from source registration (if any)
                    ...DETAIL_FIELDS.map(f => (sourceReg && sourceReg[f] != null) ? sourceReg[f] : null)
                ]
            );
            const regId = Number(regResult.insertId);
            const regRef = `CRS-${String(regId).padStart(6, '0')}`;
            await db.execute('UPDATE course_registrations SET registration_reference = ? WHERE id = ?', [regRef, regId]);
            registrationIds.push(regId);
            if (sourceReg) {
                console.log(`[INTAKE] Copied ${DETAIL_FIELDS.filter(f => sourceReg[f] != null).length} detail fields from reg #${sourceReg.id} to new reg #${regId} (${mc.course_code})`);
            }
        }

        // 5. Sync each registration to Moodle
        const syncResults = [];
        for (const regId of registrationIds) {
            try {
                const syncResult = await syncCourseRegistrationToMoodle(regId);
                syncResults.push({ registration_id: regId, ...syncResult });
            } catch (syncErr) {
                syncResults.push({ registration_id: regId, success: false, message: syncErr.message });
            }
        }

        // Fetch the complete intake with courses
        const [intakeRow] = await db.execute('SELECT * FROM programme_intakes WHERE id = ?', [intakeId]);
        const [courses] = await db.execute(
            `SELECT * FROM course_registrations WHERE intake_id = ? ORDER BY academic_year, semester_name, course_code`,
            [intakeId]
        );

        res.status(201).json({
            success: true,
            message: `Intake "${intake_label}" created with ${masterCourses.length} course(s). ${syncResults.filter(s => s.success).length} synced to Moodle.`,
            data: {
                intake: { ...intakeRow[0], courses },
                sync_results: syncResults
            }
        });
    } catch (error) {
        console.error('[programme-intakes POST] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create programme intake', error: error.message });
    }
});

// ===============================================
// ROUTE: DELETE /api/students/programme-intakes/:id
// Delete an intake and its associated registrations
// ===============================================
router.delete('/programme-intakes/:id', async (req, res) => {
    try {
        const intakeId = Number(req.params.id);
        if (!intakeId) return res.status(400).json({ success: false, message: 'Invalid intake ID' });

        // Look up the Moodle cohort ID before deleting the intake
        const [intakeRows] = await db.execute(
            'SELECT moodle_cohort_id FROM programme_intakes WHERE id = ?', [intakeId]
        );
        const moodleCohortId = intakeRows?.[0]?.moodle_cohort_id;

        // Delete the Moodle cohort and its members if it exists
        if (moodleCohortId && moodleDbPool) {
            try {
                await moodleDbPool.execute('DELETE FROM mdl_cohort_members WHERE cohortid = ?', [moodleCohortId]);
                await moodleDbPool.execute('DELETE FROM mdl_cohort WHERE id = ?', [moodleCohortId]);
                console.log(`[programme-intakes DELETE] Deleted Moodle cohort ${moodleCohortId} and its members`);
            } catch (moodleErr) {
                console.error(`[programme-intakes DELETE] Failed to delete Moodle cohort ${moodleCohortId}:`, moodleErr.message);
                // Continue with local deletion even if Moodle cleanup fails
            }
        }

        // Delete associated registrations
        await db.execute('DELETE FROM course_registrations WHERE intake_id = ?', [intakeId]);
        await db.execute('DELETE FROM programme_intakes WHERE id = ?', [intakeId]);

        res.json({ success: true, message: 'Intake deleted successfully' });
    } catch (error) {
        console.error('[programme-intakes DELETE] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete intake', error: error.message });
    }
});

// ===============================================
// ROUTE: POST /api/students/programme-intakes/:id/sync
// Sync all courses in an intake to Moodle
// ===============================================
router.post('/programme-intakes/:id/sync', async (req, res) => {
    try {
        const intakeId = Number(req.params.id);
        if (!intakeId) return res.status(400).json({ success: false, message: 'Invalid intake ID' });

        const [regs] = await db.execute('SELECT id FROM course_registrations WHERE intake_id = ?', [intakeId]);
        const syncResults = [];
        for (const reg of regs) {
            try {
                const result = await syncCourseRegistrationToMoodle(reg.id);
                syncResults.push({ registration_id: reg.id, ...result });
            } catch (err) {
                syncResults.push({ registration_id: reg.id, success: false, message: err.message });
            }
        }

        res.json({
            success: true,
            message: `Synced ${syncResults.filter(s => s.success).length}/${regs.length} courses to Moodle`,
            data: syncResults
        });
    } catch (error) {
        console.error('[programme-intakes sync] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to sync intake', error: error.message });
    }
});

// ===============================================
// ROUTE: GET /api/students/teacher-courses
// Get courses where user is assigned as teacher/editingteacher
// ===============================================
router.get('/teacher-courses', async (req, res) => {
    const { email } = req.query;
    
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email parameter is required'
        });
    }

    try {
        // Fetch courses from Moodle where user has teaching role
        const [teacherCourses] = await moodleDbPool.execute(`
            SELECT DISTINCT
                c.id,
                c.idnumber as course_code,
                c.shortname as course_shortname,
                c.fullname as course_title,
                COALESCE(cc.name, 'General') as course_type,
                c.summary as description,
                c.category,
                c.visible,
                c.timecreated,
                c.timemodified,
                r.shortname as role_name
            FROM mdl_user u
            INNER JOIN mdl_role_assignments ra ON ra.userid = u.id
            INNER JOIN mdl_role r ON r.id = ra.roleid
            INNER JOIN mdl_context ctx ON ctx.id = ra.contextid
            INNER JOIN mdl_course c ON c.id = ctx.instanceid
            LEFT JOIN mdl_course_categories cc ON c.category = cc.id
            WHERE u.email = ?
                AND ctx.contextlevel = 50
                AND r.shortname IN ('teacher', 'editingteacher', 'noneditingteacher')
                AND c.id > 1
                AND c.visible = 1
            ORDER BY c.fullname ASC
        `, [email]);

        const courses = teacherCourses.map(course => ({
            id: course.id,
            course_code: course.course_code || course.course_shortname || `COURSE-${course.id}`,
            course_title: course.course_title,
            course_type: course.course_type,
            department: 'General',
            description: course.description || course.course_title,
            duration_months: 12,
            awarding_body: 'SCL Institute',
            moodle_course_id: course.id,
            role: course.role_name
        }));

        console.log(`✓ Fetched ${courses.length} teaching courses for ${email} from Moodle`);
        return res.json({
            success: true,
            message: `Found ${courses.length} courses`,
            data: courses,
            source: 'moodle-database'
        });
    } catch (error) {
        console.error('Error fetching teacher courses:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch teacher courses from Moodle',
            error: error.message
        });
    }
});

// ===============================================
// ROUTE: GET /api/students/teacher-cohort-info
// Returns { moodleCourseId: cohortLabel } map for a teacher's courses
// ===============================================
router.get('/teacher-cohort-info', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'email required' });

    try {
        const [courseIdRows] = await moodleDbPool.execute(
            `SELECT DISTINCT c.id
             FROM mdl_user u
             JOIN mdl_role_assignments ra ON ra.userid = u.id
             JOIN mdl_role r ON r.id = ra.roleid
             JOIN mdl_context ctx ON ctx.id = ra.contextid
             JOIN mdl_course c ON c.id = ctx.instanceid
             WHERE u.email = ?
               AND ctx.contextlevel = 50
               AND r.shortname IN ('teacher','editingteacher','noneditingteacher')
               AND c.id > 1`,
            [email]
        );

        if (courseIdRows.length === 0) return res.json({ success: true, data: {} });

        const ids = courseIdRows.map(r => r.id);
        const placeholders = ids.map(() => '?').join(',');
        const [rows] = await db.execute(
            `SELECT cr.moodle_course_id,
                    pi.intake_label    AS intakeLabel,
                    pi.programme_type_name AS programmeType,
                    pi.program_name    AS programName
             FROM course_registrations cr
             JOIN programme_intakes pi ON pi.id = cr.intake_id
             WHERE cr.moodle_course_id IN (${placeholders})
             ORDER BY pi.intake_start_date DESC`,
            ids
        );

        const data = {};
        for (const row of rows) {
            if (!data[row.moodle_course_id]) {
                const label = [row.intakeLabel, row.programName || row.programmeType].filter(Boolean).join(' ');
                data[row.moodle_course_id] = label ? `${label} Cohort` : null;
            }
        }

        return res.json({ success: true, data });
    } catch (err) {
        console.error('teacher-cohort-info error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch cohort info' });
    }
});

// ===============================================
// ROUTE: GET /api/students/my-moodle-courses
// Get Moodle courses for a user with role flags (teaching/student)
// ===============================================
router.get('/my-moodle-courses', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email parameter is required'
        });
    }

    try {
        // Teaching assignments from course-level role assignments.
        const [teachingRows] = await moodleDbPool.execute(`
            SELECT DISTINCT
                c.id,
                c.idnumber AS course_code,
                c.shortname AS course_shortname,
                c.fullname AS course_title,
                COALESCE(cc.name, 'General') AS course_type,
                c.startdate AS course_startdate,
                c.enddate AS course_enddate,
                c.summary AS description,
                r.shortname AS role_name
            FROM mdl_user u
            INNER JOIN mdl_role_assignments ra ON ra.userid = u.id
            INNER JOIN mdl_role r ON r.id = ra.roleid
            INNER JOIN mdl_context ctx ON ctx.id = ra.contextid
            INNER JOIN mdl_course c ON c.id = ctx.instanceid
            LEFT JOIN mdl_course_categories cc ON c.category = cc.id
            WHERE u.email = ?
              AND ctx.contextlevel = 50
              AND r.shortname IN ('teacher', 'editingteacher', 'noneditingteacher')
              AND c.id > 1
              AND c.visible = 1
            ORDER BY c.fullname ASC
        `, [email]);

        // Student registrations from enrol/user_enrolments (active + suspended for progression visibility).
        const fetchEnrolledRows = async () => {
            const [rows] = await moodleDbPool.execute(`
            SELECT DISTINCT
                c.id,
                c.idnumber AS course_code,
                c.shortname AS course_shortname,
                c.fullname AS course_title,
                COALESCE(cc.name, 'General') AS course_type,
                c.startdate AS course_startdate,
                c.enddate AS course_enddate,
                c.summary AS description,
                ue.status AS enrolment_status
            FROM mdl_user u
            INNER JOIN mdl_user_enrolments ue ON ue.userid = u.id AND ue.status IN (0, 1)
            INNER JOIN mdl_enrol e ON e.id = ue.enrolid AND e.status = 0
            INNER JOIN mdl_course c ON c.id = e.courseid
            LEFT JOIN mdl_course_categories cc ON c.category = cc.id
            WHERE u.email = ?
              AND c.id > 1
              AND c.visible = 1
            ORDER BY c.fullname ASC
        `, [email]);

            return rows;
        };

        let enrolledRows = await fetchEnrolledRows();

        // Self-heal missing Moodle enrollment when the student is accepted in SCL but has no Moodle rows yet.
        if (enrolledRows.length === 0) {
            try {
                const [acceptedApps] = await db.execute(
                    `SELECT id, email, first_name, last_name, course_code, intake_start_date
                     FROM student_applications
                     WHERE email = ? AND application_status = 'accepted' AND is_deleted = FALSE
                     ORDER BY created_at DESC
                     LIMIT 1`,
                    [email]
                );

                if (acceptedApps.length > 0) {
                    const acceptedApp = acceptedApps[0];
                    const acceptedCourseCode = String(acceptedApp.course_code || '').trim();

                    if (acceptedCourseCode) {
                        const enrollmentResult = acceptedCourseCode.toUpperCase().includes('-INFO')
                            ? await enrollStudentInProgrammeCourses(
                                acceptedApp.email,
                                acceptedApp.first_name,
                                acceptedApp.last_name,
                                acceptedCourseCode,
                                acceptedApp.intake_start_date
                            )
                            : await enrollStudentInMoodle(
                                acceptedApp.email,
                                acceptedApp.first_name,
                                acceptedApp.last_name,
                                acceptedCourseCode
                            );

                        if (enrollmentResult?.success) {
                            console.log(`[MOODLE SELF-HEAL] Rebuilt missing enrolments for ${email} (${acceptedCourseCode})`);
                            enrolledRows = await fetchEnrolledRows();
                        } else {
                            console.warn(`[MOODLE SELF-HEAL] Enrollment warning for ${email}: ${enrollmentResult?.message || 'Unknown error'}`);
                        }
                    }
                }
            } catch (selfHealError) {
                console.warn(`[MOODLE SELF-HEAL] Failed for ${email}:`, selfHealError.message);
            }
        }

        const enrolledCourseIds = Array.from(new Set(enrolledRows.map((course) => Number(course.id)).filter(Boolean)));
        const completedCourseIds = await getCompletedCourseIdsByEmail(email, enrolledCourseIds);
        const groupedByProgramme = new Map();

        enrolledRows.forEach((course) => {
            const code = String(course.course_code || course.course_shortname || '').toUpperCase();
            const programmeMatch = code.match(/^([A-Z]+-\d+)-/);
            const programmeCode = programmeMatch ? programmeMatch[1] : null;
            if (!programmeCode) {
                return;
            }

            if (!groupedByProgramme.has(programmeCode)) {
                groupedByProgramme.set(programmeCode, []);
            }

            groupedByProgramme.get(programmeCode).push({
                id: Number(course.id),
                course_code: course.course_code || course.course_shortname || `COURSE-${course.id}`
            });
        });

        // Merge by Moodle course id so UI can render one consistent list.
        const byCourseId = new Map();

        teachingRows.forEach((course) => {
            const id = Number(course.id);
            byCourseId.set(id, {
                id,
                moodle_course_id: id,
                course_code: course.course_code || course.course_shortname || `COURSE-${id}`,
                course_title: course.course_title,
                course_type: course.course_type,
                start_date: Number(course.course_startdate || 0) > 0 ? new Date(Number(course.course_startdate) * 1000).toISOString() : null,
                end_date: Number(course.course_enddate || 0) > 0 ? new Date(Number(course.course_enddate) * 1000).toISOString() : null,
                department: 'General',
                description: course.description || course.course_title,
                duration_months: 12,
                awarding_body: 'SCL Institute',
                hasTeachingRole: true,
                isStudentEnrolled: false
            });
        });

        enrolledRows.forEach((course) => {
            const id = Number(course.id);
            const existing = byCourseId.get(id);
            const normalizedCode = course.course_code || course.course_shortname || `COURSE-${id}`;
            const yearNumber = extractYearNumberFromCourseCode(normalizedCode);
            const semesterNumber = extractSemesterNumberFromCourseCode(normalizedCode);
            const programmeMatch = String(normalizedCode).toUpperCase().match(/^([A-Z]+-\d+)-/);
            const programmeCode = programmeMatch ? programmeMatch[1] : null;
            const programmeCourses = programmeCode ? groupedByProgramme.get(programmeCode) || [] : [];
            const progressionResult = isYearUnlocked(
                { id, course_code: normalizedCode },
                programmeCourses,
                completedCourseIds
            );
            const progressionUnlocked = progressionResult.unlocked !== false;
            const enrolmentStatus = Number(course.enrolment_status || 0);
            const isLocked = !progressionUnlocked || enrolmentStatus !== 0;
            const lockReason = !progressionUnlocked
                ? (progressionResult.reason || `Locked: complete all previous courses before this one`)
                : enrolmentStatus !== 0
                    ? 'Registration is currently suspended'
                    : null;
            const isCompleted = completedCourseIds.has(id);

            if (existing) {
                existing.isStudentEnrolled = true;
                existing.hasActiveEnrollment = enrolmentStatus === 0;
                existing.enrolment_status = enrolmentStatus;
                existing.year_number = yearNumber;
                existing.semester_number = semesterNumber;
                existing.isLocked = isLocked;
                existing.lockReason = lockReason;
                existing.isCompleted = isCompleted;
                return;
            }

            byCourseId.set(id, {
                id,
                moodle_course_id: id,
                course_code: normalizedCode,
                course_title: course.course_title,
                course_type: course.course_type,
                start_date: Number(course.course_startdate || 0) > 0 ? new Date(Number(course.course_startdate) * 1000).toISOString() : null,
                end_date: Number(course.course_enddate || 0) > 0 ? new Date(Number(course.course_enddate) * 1000).toISOString() : null,
                department: 'General',
                description: course.description || course.course_title,
                duration_months: 12,
                awarding_body: 'SCL Institute',
                hasTeachingRole: false,
                isStudentEnrolled: true,
                hasActiveEnrollment: enrolmentStatus === 0,
                enrolment_status: enrolmentStatus,
                year_number: yearNumber,
                semester_number: semesterNumber,
                isLocked,
                lockReason,
                isCompleted
            });
        });

        const courses = Array.from(byCourseId.values()).sort((a, b) =>
            String(a.course_title || '').localeCompare(String(b.course_title || ''))
        );

        // Sync Moodle enrollment status (suspend locked, activate unlocked) in background
        for (const [programmeCode] of groupedByProgramme) {
            enforceProgrammeProgressionLocks(email, programmeCode).catch(err => {
                console.warn(`[PROGRESSION SYNC] Failed for ${programmeCode}:`, err.message);
            });
        }

        return res.json({
            success: true,
            message: `Found ${courses.length} Moodle courses for ${email}`,
            data: courses,
            source: 'moodle-db'
        });
    } catch (error) {
        console.error('Error fetching my Moodle courses:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch Moodle courses',
            error: error.message
        });
    }
});

// ===============================================
// ROUTE: GET /api/students/moodle-course/:courseId/sections
// Fetch course sections and modules from Moodle by course ID
// ===============================================
router.get('/moodle-course/:courseId/sections', async (req, res) => {
    const { courseId } = req.params;

    if (!courseId) {
        return res.status(400).json({
            success: false,
            message: 'Course ID is required'
        });
    }

    try {
        const numCourseId = Number(courseId);

        // Fetch course details from Moodle
        const [courseRows] = await moodleDbPool.execute(`
            SELECT id, fullname, summary, startdate, enddate
            FROM mdl_course
            WHERE id = ?
        `, [numCourseId]);

        if (courseRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Course not found in Moodle'
            });
        }

        const course = courseRows[0];

        // Fetch course sections
        const [sectionRows] = await moodleDbPool.execute(`
            SELECT id, section, name, summary
            FROM mdl_course_sections
            WHERE course = ?
            ORDER BY section ASC
        `, [numCourseId]);

        // Fetch course modules with activity names
        const [moduleRows] = await moodleDbPool.execute(`
            SELECT cm.id, cm.section, cm.instance, cm.idnumber, m.name as module_type,
                   COALESCE(a.name, q.name, f.name, r.name, p.name, u.name, l.name) AS activity_name
            FROM mdl_course_modules cm
            INNER JOIN mdl_modules m ON m.id = cm.module
            LEFT JOIN mdl_assign a ON m.name = 'assign' AND a.id = cm.instance
            LEFT JOIN mdl_quiz q ON m.name = 'quiz' AND q.id = cm.instance
            LEFT JOIN mdl_forum f ON m.name = 'forum' AND f.id = cm.instance
            LEFT JOIN mdl_resource r ON m.name = 'resource' AND r.id = cm.instance
            LEFT JOIN mdl_page p ON m.name = 'page' AND p.id = cm.instance
            LEFT JOIN mdl_url u ON m.name = 'url' AND u.id = cm.instance
            LEFT JOIN mdl_label l ON m.name = 'label' AND l.id = cm.instance
            WHERE cm.course = ? AND cm.deletioninprogress = 0
            ORDER BY cm.section ASC, cm.id ASC
        `, [numCourseId]);

        // Group modules by section ID (cm.section stores the section ID, not section number)
        const modulesBySection = {};
        moduleRows.forEach(mod => {
            if (!modulesBySection[mod.section]) {
                modulesBySection[mod.section] = [];
            }
            modulesBySection[mod.section].push({
                id: mod.id,
                instance: mod.instance,
                type: mod.module_type,
                idnumber: mod.idnumber,
                name: mod.activity_name || mod.idnumber || `${mod.module_type} ${mod.id}`
            });
        });

        // Build section with modules structure (lookup by section.id, not section.section)
        const sections = sectionRows.map(section => ({
            id: section.id,
            section: section.section,
            name: section.name || `Section ${section.section}`,
            summary: section.summary,
            modules: modulesBySection[section.id] || []
        }));

        return res.json({
            success: true,
            message: 'Course sections loaded',
            data: {
                course: {
                    id: course.id,
                    title: course.fullname,
                    summary: course.summary,
                    startdate: course.startdate,
                    enddate: course.enddate
                },
                sections: sections
            }
        });
    } catch (error) {
        console.error('Error fetching course sections:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch course sections',
            error: error.message
        });
    }
});

// ===============================================
// ROUTE: GET /api/students/teacher-announcements
// Fetch news forum announcements from Moodle for a teacher's courses
// ===============================================
router.get('/teacher-announcements', async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ success: false, message: 'email is required' });
    }
    try {
        // Find teacher's Moodle user id
        const userRows = await safeMoodleSelectRows(
            'SELECT id FROM mdl_user WHERE email = ? AND deleted = 0 LIMIT 1',
            [email]
        );
        if (!userRows || userRows.length === 0) {
            return res.json({ success: true, data: [] });
        }
        const moodleUserId = userRows[0].id;

        // Get announcements from news forums in courses the teacher is assigned to
        const rows = await safeMoodleSelectRows(
            `SELECT fd.id, fd.name AS subject, fd.timemodified,
                    SUBSTRING(fp.message, 1, 800) AS message,
                    CONCAT(u.firstname, ' ', u.lastname) AS userfullname,
                    c.fullname AS coursename, c.id AS courseid
             FROM mdl_forum_discussions fd
             JOIN mdl_forum_posts fp ON fp.discussion = fd.id AND fp.parent = 0
             JOIN mdl_user u ON u.id = fp.userid
             JOIN mdl_course c ON c.id = fd.course
             JOIN mdl_forum f ON f.id = fd.forum AND f.type = 'news'
             JOIN mdl_context ctx ON ctx.contextlevel = 50 AND ctx.instanceid = c.id
             JOIN mdl_role_assignments ra ON ra.contextid = ctx.id AND ra.userid = ?
             WHERE c.visible = 1
             ORDER BY fd.timemodified DESC
             LIMIT 15`,
            [moodleUserId]
        );

        // Strip HTML tags from message for clean display
        const announcements = rows.map((row) => ({
            id: row.id,
            subject: row.subject,
            message: String(row.message || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 300),
            userfullname: row.userfullname,
            coursename: row.coursename,
            courseid: row.courseid,
            timemodified: new Date(Number(row.timemodified) * 1000).toISOString()
        }));

        return res.json({ success: true, data: announcements });
    } catch (error) {
        console.error('Error fetching teacher announcements:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch announcements', error: error.message });
    }
});

// ===============================================
// ROUTE: GET /api/students/teacher-notifications
// Fetch Moodle notifications for a teacher
// ===============================================
router.get('/teacher-notifications', async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ success: false, message: 'email is required' });
    }
    try {
        const userRows = await safeMoodleSelectRows(
            'SELECT id FROM mdl_user WHERE email = ? AND deleted = 0 LIMIT 1',
            [email]
        );
        if (!userRows || userRows.length === 0) {
            return res.json({ success: true, data: [] });
        }
        const moodleUserId = userRows[0].id;

        const rows = await safeMoodleSelectRows(
            `SELECT n.id, n.subject, n.smallmessage, n.timecreated, n.timeread,
                    CONCAT(u.firstname, ' ', u.lastname) AS senderfullname
             FROM mdl_notifications n
             LEFT JOIN mdl_user u ON u.id = n.useridfrom
             WHERE n.useridto = ?
             ORDER BY n.timecreated DESC
             LIMIT 15`,
            [moodleUserId]
        );

        const notifications = rows.map((row) => ({
            id: row.id,
            subject: row.subject || 'Notification',
            text: String(row.smallmessage || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200),
            read: row.timeread !== null,
            timecreated: new Date(Number(row.timecreated) * 1000).toISOString(),
            sender: row.senderfullname
        }));

        return res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error fetching teacher notifications:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
    }
});

// ===============================================
// ROUTE: GET /api/students/admin/teachers
// Returns all teachers from SCL DB with their Moodle course enrollments
// ===============================================
// Helper: deduplicate courses keeping the row with best enrollment status
function dedupeByBestEnrollment(courses) {
    const seen = new Map();
    for (const c of (courses || [])) {
        const existing = seen.get(c.courseId);
        if (!existing || (c.enrollStatus !== null && c.enrollStatus !== undefined && (existing.enrollStatus === null || existing.enrollStatus === undefined))) {
            seen.set(c.courseId, c);
        }
    }
    return Array.from(seen.values());
}
router.get('/admin/teachers', async (req, res) => {
    try {
        // Only return faculty who went through the proper pipeline:
        // accepted application + activated (created_user_id set by "Activate Faculty Account")
        const [sclTeachers] = await db.execute(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.created_at
             FROM users u
             INNER JOIN teacher_registrations tr ON tr.created_user_id = u.id
             WHERE tr.application_status = 'accepted'
             ORDER BY u.first_name, u.last_name`
        );

        // For each teacher, look up their Moodle courses
        const teachersWithCourses = await Promise.all(sclTeachers.map(async (t) => {
            const moodleCourses = await safeMoodleSelectRows(
                `SELECT c.id as courseId, c.fullname as courseName, c.shortname as courseCode,
                        r.shortname as role, ue.status as enrollStatus,
                        ue.id as enrolmentId
                 FROM mdl_user u
                 JOIN mdl_role_assignments ra ON ra.userid = u.id
                 JOIN mdl_role r ON r.id = ra.roleid AND r.roleid IN (3,4)
                 JOIN mdl_context ctx ON ctx.id = ra.contextid AND ctx.contextlevel = 50
                 JOIN mdl_course c ON c.id = ctx.instanceid
                 LEFT JOIN mdl_enrol e ON e.courseid = c.id AND e.enrol = 'manual'
                 LEFT JOIN mdl_user_enrolments ue ON ue.enrolid = e.id AND ue.userid = u.id
                 WHERE u.email = ? AND u.deleted = 0
                 ORDER BY c.fullname`,
                [t.email]
            ).catch(() => []);

            // Fix: roleid column is on mdl_role not ra — use r.id in list
            const fixedCourses = moodleCourses.length === 0
                ? await safeMoodleSelectRows(
                    `SELECT c.id as courseId, c.fullname as courseName, c.shortname as courseCode,
                            r.shortname as role, ue.status as enrollStatus,
                            ue.id as enrolmentId
                     FROM mdl_user u
                     JOIN mdl_role_assignments ra ON ra.userid = u.id
                     JOIN mdl_role r ON r.id = ra.roleid
                     JOIN mdl_context ctx ON ctx.id = ra.contextid AND ctx.contextlevel = 50
                     JOIN mdl_course c ON c.id = ctx.instanceid
                     LEFT JOIN mdl_enrol e ON e.courseid = c.id AND e.enrol = 'manual'
                     LEFT JOIN mdl_user_enrolments ue ON ue.enrolid = e.id AND ue.userid = u.id
                     WHERE u.email = ? AND u.deleted = 0
                     AND r.shortname IN ('editingteacher','teacher','non-editing teacher')
                     ORDER BY c.fullname`,
                    [t.email]
                ).catch(() => [])
                : moodleCourses;

            return {
                id: t.id,
                firstName: t.first_name,
                lastName: t.last_name,
                email: t.email,
                role: t.role,
                courses: dedupeByBestEnrollment(fixedCourses)
            };
        }));

        // Bulk-enrich each teacher's courses with SCL intake/cohort info
        // Collect all unique moodle_course_ids across all teachers
        const allMoodleIds = [...new Set(
            teachersWithCourses.flatMap(t => (t.courses || []).map(c => c.courseId).filter(Boolean))
        )];

        let intakeByMoodleId = {};
        if (allMoodleIds.length > 0) {
            try {
                const placeholders = allMoodleIds.map(() => '?').join(',');
                const [intakeRows] = await db.execute(
                    `SELECT cr.moodle_course_id, cr.semester_name, cr.start_date as courseStartDate,
                            pi.id as intakeId, pi.intake_label as intakeLabel,
                            pi.programme_type_name as programmeType,
                            pi.program_name as programName,
                            pi.intake_start_date as intakeStartDate
                     FROM course_registrations cr
                     JOIN programme_intakes pi ON pi.id = cr.intake_id
                     WHERE cr.moodle_course_id IN (${placeholders})
                       AND cr.moodle_course_id IS NOT NULL
                     ORDER BY pi.intake_start_date DESC`,
                    allMoodleIds
                );
                // If multiple intakes have the same moodle course, keep most recent
                for (const row of intakeRows) {
                    if (!intakeByMoodleId[row.moodle_course_id]) {
                        intakeByMoodleId[row.moodle_course_id] = {
                            intakeId: row.intakeId,
                            intakeLabel: row.intakeLabel,
                            programmeType: row.programmeType,
                            programName: row.programName,
                            semesterName: row.semester_name,
                            intakeStartDate: row.intakeStartDate,
                            courseStartDate: row.courseStartDate
                        };
                    }
                }
            } catch (e) {
                console.error('Could not enrich with intake info:', e.message);
            }
        }

        // Attach intake info to each course
        const enrichedTeachers = teachersWithCourses.map(t => ({
            ...t,
            courses: (t.courses || []).map(c => ({
                ...c,
                ...(intakeByMoodleId[c.courseId] || {})
            }))
        }));

        return res.json({ success: true, data: enrichedTeachers });
    } catch (error) {
        console.error('Error fetching admin teachers:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch teachers', error: error.message });
    }
});
// Returns all visible Moodle courses for teacher assignment
// ===============================================
router.get('/admin/moodle-courses', async (req, res) => {
    try {
        const courses = await safeMoodleSelectRows(
            `SELECT c.id, c.fullname as name, c.shortname as code, c.visible,
                    cat.name as categoryName
             FROM mdl_course c
             LEFT JOIN mdl_course_categories cat ON cat.id = c.category
             WHERE c.id > 1 AND c.visible = 1
             ORDER BY cat.name, c.fullname`
        );
        return res.json({ success: true, data: courses });
    } catch (error) {
        console.error('Error fetching Moodle courses:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
    }
});

// ===============================================
// ROUTE: GET /api/students/admin/cohort-intakes
// Returns active programme intakes with their course_registrations
// (only those that have a moodle_course_id assigned)
// ===============================================
router.get('/admin/cohort-intakes', async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT
                pi.id as intakeId,
                pi.intake_label as intakeLabel,
                pi.programme_type_name as programmeType,
                pi.program_name as programName,
                pi.intake_start_date as startDate,
                pi.intake_end_date as endDate,
                cr.id as registrationId,
                cr.course_code as courseCode,
                cr.course_title as courseTitle,
                cr.semester_name as semesterName,
                cr.start_date as courseStartDate,
                cr.moodle_course_id as moodleCourseId
             FROM programme_intakes pi
             JOIN course_registrations cr ON cr.intake_id = pi.id
             WHERE pi.status = 'active'
               AND cr.moodle_course_id IS NOT NULL
             ORDER BY pi.intake_start_date DESC, cr.semester_name, cr.course_code`
        );

        // Group by intake
        const intakeMap = new Map();
        for (const row of rows) {
            if (!intakeMap.has(row.intakeId)) {
                intakeMap.set(row.intakeId, {
                    id: row.intakeId,
                    label: row.intakeLabel,
                    programmeType: row.programmeType,
                    programName: row.programName,
                    startDate: row.startDate,
                    endDate: row.endDate,
                    courses: []
                });
            }
            intakeMap.get(row.intakeId).courses.push({
                registrationId: row.registrationId,
                moodleCourseId: row.moodleCourseId,
                courseCode: row.courseCode,
                courseTitle: row.courseTitle,
                semesterName: row.semesterName,
                courseStartDate: row.courseStartDate
            });
        }

        return res.json({ success: true, data: Array.from(intakeMap.values()) });
    } catch (error) {
        console.error('Error fetching cohort intakes:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch cohort intakes', error: error.message });
    }
});

// ===============================================
// ROUTE: POST /api/students/admin/teacher-enroll
// Enroll a teacher in a Moodle course (role assignment + user enrolment)
// Body: { teacherEmail, courseId }
// ===============================================
router.post('/admin/teacher-enroll', async (req, res) => {
    const { teacherEmail, courseId } = req.body;
    if (!teacherEmail || !courseId) {
        return res.status(400).json({ success: false, message: 'teacherEmail and courseId are required' });
    }
    try {
        // Resolve Moodle user — create the account now if it doesn't exist yet.
        // This is intentional: Moodle provisioning is deferred until the first course assignment.
        let moodleUserId;
        const userRows = await safeMoodleSelectRows(
            'SELECT id FROM mdl_user WHERE email = ? AND deleted = 0 LIMIT 1',
            [teacherEmail]
        );
        if (!userRows || userRows.length === 0) {
            const [portalRows] = await db.execute(
                'SELECT first_name, last_name FROM users WHERE email = ? LIMIT 1',
                [teacherEmail]
            );
            const firstName = portalRows[0]?.first_name || 'Teacher';
            const lastName  = portalRows[0]?.last_name  || 'User';
            const moodleCreate = await ensureMoodleUserAccount(teacherEmail, firstName, lastName);
            if (!moodleCreate?.success) {
                return res.status(502).json({ success: false, message: `Failed to provision Moodle account for ${teacherEmail}` });
            }
            moodleUserId = moodleCreate.moodleUserId;
        } else {
            moodleUserId = userRows[0].id;
        }
        const now = Math.floor(Date.now() / 1000);

        // Get context id for this course
        const ctxRows = await safeMoodleSelectRows(
            'SELECT id FROM mdl_context WHERE contextlevel = 50 AND instanceid = ? LIMIT 1',
            [courseId]
        );
        if (!ctxRows || ctxRows.length === 0) {
            return res.status(404).json({ success: false, message: `No Moodle context found for course ${courseId}` });
        }
        const contextId = ctxRows[0].id;

        // Get editingteacher role id
        const roleRows = await safeMoodleSelectRows(
            "SELECT id FROM mdl_role WHERE shortname = 'editingteacher' LIMIT 1"
        );
        const roleId = roleRows && roleRows.length > 0 ? roleRows[0].id : 3;

        // Ensure manual enrol method exists for this course
        let enrolRows = await safeMoodleSelectRows(
            "SELECT id FROM mdl_enrol WHERE courseid = ? AND enrol = 'manual' LIMIT 1",
            [courseId]
        );
        let enrolId;
        if (!enrolRows || enrolRows.length === 0) {
            return res.status(500).json({ success: false, message: 'No manual enrol method found for this course. Please enable manual enrolment in Moodle first.' });
        }
        enrolId = enrolRows[0].id;

        // Insert role assignment only if not already present
        const existingRa = await safeMoodleSelectRows(
            'SELECT id FROM mdl_role_assignments WHERE roleid=? AND contextid=? AND userid=? AND component="" AND itemid=0 LIMIT 1',
            [roleId, contextId, moodleUserId]
        ).catch(() => []);
        if (!existingRa || existingRa.length === 0) {
            await safeMoodleSelectRows(
                `INSERT INTO mdl_role_assignments
                 (roleid, contextid, userid, timemodified, modifierid, component, itemid, sortorder)
                 VALUES (?, ?, ?, ?, 2, '', 0, 0)`,
                [roleId, contextId, moodleUserId, now]
            ).catch(() => null);
        }

        // Upsert user enrolment — activate if already exists (suspended), insert if new
        await safeMoodleSelectRows(
            `INSERT INTO mdl_user_enrolments
             (enrolid, userid, status, timestart, timeend, modifierid, timecreated, timemodified)
             VALUES (?, ?, 0, 0, 0, 2, ?, ?)
             ON DUPLICATE KEY UPDATE status=0, timemodified=VALUES(timemodified)`,
            [enrolId, moodleUserId, now, now]
        ).catch(() => null);

        return res.json({ success: true, message: `Teacher enrolled in course successfully` });
    } catch (error) {
        console.error('Error enrolling teacher:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to enroll teacher', error: error.message });
    }
});

// ===============================================
// ROUTE: DELETE /api/students/admin/teacher-unenroll
// Remove a teacher from a Moodle course
// Body: { teacherEmail, courseId }
// ===============================================
router.delete('/admin/teacher-unenroll', async (req, res) => {
    const { teacherEmail, courseId } = req.body;
    if (!teacherEmail || !courseId) {
        return res.status(400).json({ success: false, message: 'teacherEmail and courseId are required' });
    }
    try {
        const userRows = await safeMoodleSelectRows(
            'SELECT id FROM mdl_user WHERE email = ? AND deleted = 0 LIMIT 1',
            [teacherEmail]
        );
        if (!userRows || userRows.length === 0) {
            return res.status(404).json({ success: false, message: `No Moodle account found for ${teacherEmail}` });
        }
        const moodleUserId = userRows[0].id;

        // Get context id for this course
        const ctxRows = await safeMoodleSelectRows(
            'SELECT id FROM mdl_context WHERE contextlevel = 50 AND instanceid = ? LIMIT 1',
            [courseId]
        );
        if (ctxRows && ctxRows.length > 0) {
            const contextId = ctxRows[0].id;
            await safeMoodleSelectRows(
                'DELETE FROM mdl_role_assignments WHERE contextid = ? AND userid = ?',
                [contextId, moodleUserId]
            ).catch(() => null);
        }

        // Remove user enrolment
        const enrolRows = await safeMoodleSelectRows(
            "SELECT id FROM mdl_enrol WHERE courseid = ? AND enrol = 'manual' LIMIT 1",
            [courseId]
        );
        if (enrolRows && enrolRows.length > 0) {
            await safeMoodleSelectRows(
                'DELETE FROM mdl_user_enrolments WHERE enrolid = ? AND userid = ?',
                [enrolRows[0].id, moodleUserId]
            ).catch(() => null);
        }

        return res.json({ success: true, message: 'Teacher removed from course successfully' });
    } catch (error) {
        console.error('Error unenrolling teacher:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to remove teacher from course', error: error.message });
    }
});

// ===============================================
// ROUTE: GET /api/students/programmes
// Returns programme types and programmes from Moodle category hierarchy
// Used by admissions form for programme-based selection
// Falls back to SCL database if Moodle unavailable
// ===============================================
router.get('/programmes', async (req, res) => {
    try {
        const { programme_type_name } = req.query;

        // Try to get Moodle category hierarchy first (more complete)
        try {
            const moodleRows = await safeMoodleSelectRows(
                `SELECT id, parent, name, visible FROM mdl_course_categories WHERE parent = 0 ORDER BY sortorder, id`,
                []
            );
            
            if (moodleRows && moodleRows.length > 0) {
                // Found Moodle data - return it in grouped format
                const grouped = {};
                
                for (const cat of moodleRows) {
                    const catName = cat.name;
                    
                    // Get sub-categories (programmes under this type)
                    const subCats = await safeMoodleSelectRows(
                        `SELECT id, parent, name FROM mdl_course_categories WHERE parent = ? ORDER BY sortorder, id`,
                        [cat.id]
                    );
                    
                    grouped[catName] = subCats.map(s => s.name);
                }
                
                if (Object.keys(grouped).length > 0) {
                    return res.json({ success: true, data: grouped });
                }
            }
        } catch (moodleError) {
            console.warn('[programmes GET] Moodle fetch failed, falling back to SCL data:', moodleError.message);
        }

        // Fallback to SCL database data
        if (programme_type_name) {
            // Return distinct programs for a given programme type from SCL
            const [rows] = await db.execute(
                `SELECT DISTINCT program_name FROM course_lifecycle_master WHERE programme_type_name = ? ORDER BY program_name`,
                [programme_type_name]
            );
            return res.json({ success: true, data: rows.map(r => r.program_name) });
        }

        // Return all programme types with their programs from SCL
        const [rows] = await db.execute(
            `SELECT DISTINCT programme_type_name, program_name FROM course_lifecycle_master ORDER BY programme_type_name, program_name`
        );
        const grouped = {};
        for (const row of rows) {
            if (!grouped[row.programme_type_name]) grouped[row.programme_type_name] = [];
            grouped[row.programme_type_name].push(row.program_name);
        }
        res.json({ success: true, data: grouped });
    } catch (error) {
        console.error('[programmes GET] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch programmes', error: error.message });
    }
});

// ===============================================
// ROUTE 1: GET /api/students/courses
// Get list of available courses - fetching directly from Moodle database
// ===============================================
router.get('/courses', async (req, res) => {
    try {
        console.log('[DEBUG] /courses route called');
        const scope = String(req.query.scope || '').toLowerCase();
        const admissionsScope = scope === 'admissions';
        const activeOnlyParam = String(req.query.activeOnly || (admissionsScope ? 'true' : 'false')).toLowerCase();
        const activeOnly = activeOnlyParam === 'true' || activeOnlyParam === '1' || activeOnlyParam === 'yes';
        const nowUnix = Math.floor(Date.now() / 1000);

        console.log('[DEBUG] Testing direct database query...');
        try {
            const [testResult] = await db.execute('SELECT COUNT(*) as count FROM course_lifecycle_master LIMIT 1');
            console.log('[DEBUG] Direct query successful, count:', testResult[0].count);
        } catch (testErr) {
            console.error('[DEBUG] Direct query failed:', testErr.message);
        }

        const isProgrammeLevelCourse = (course) => {
            const code = String(course.course_code || '').trim();
            const title = String(course.course_title || '').toLowerCase();
            const codeUpper = code.toUpperCase();

            // Exclude module-like codes (e.g. DEG-001-Y0-S1-C1) and info-only admin wrappers.
            const looksLikeModuleCode = /-Y\d+(-S\d+)?(-C\d+)?$/i.test(codeUpper);
            const looksLikeInfoCourse = /-INFO$/i.test(codeUpper) || title.includes('programme information');

            return !looksLikeModuleCode && !looksLikeInfoCourse;
        };

        const isInfoProgrammeCourse = (course) => {
            const code = String(course.course_code || '').trim();
            const title = String(course.course_title || '').toLowerCase();
            return /-INFO$/i.test(code) || title.includes('programme information');
        };

        // Try to fetch from Moodle database first
        let moodleCourses = [];
        try {
            // Use shared connection pool configured for prod environment
            // Moodle database pool check
            if (moodleDbPool && false) {  // Temporarily disabled - moodle not running
                const [moodleResult] = await moodleDbPool.execute(`
                SELECT 
                    c.id,
                    c.idnumber as course_code,
                    c.shortname as course_shortname,
                    c.fullname as course_title,
                    COALESCE(cc.name, 'General') as course_type,
                    cc.depth as category_depth,
                    c.summary as description,
                    c.category,
                    c.visible,
                    c.startdate,
                    c.enddate,
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
                    category_depth: Number(course.category_depth || 0),
                    department: 'General',
                    description: course.description || course.course_title,
                    duration_months: 12,
                    awarding_body: 'SCL Institute',
                    moodle_course_id: course.id,
                    is_active: Number(course.visible || 0) === 1 && (Number(course.enddate || 0) === 0 || Number(course.enddate || 0) >= nowUnix)
                }));

                if (admissionsScope) {
                    const infoCourses = moodleCourses.filter(isInfoProgrammeCourse);
                    if (infoCourses.length > 0) {
                        moodleCourses = infoCourses;
                    }
                }

                if (admissionsScope) {
                    moodleCourses = moodleCourses.filter((course) => {
                        const depth = Number(course.category_depth || 0);
                        // Admissions should show programme-level courses only (typically depth 2).
                        if (depth > 2) {
                            return false;
                        }
                        return isInfoProgrammeCourse(course) || isProgrammeLevelCourse(course);
                    });
                }

                if (activeOnly) {
                    moodleCourses = moodleCourses.filter((course) => course.is_active === true);
                }

                moodleCourses = moodleCourses.map(({ category_depth, ...course }) => course);

                if (moodleCourses.length > 0) {
                    console.log(`Γ£ô Fetched ${moodleCourses.length} courses from Moodle database`);
                    return res.json({
                        success: true,
                        message: `Fetched ${moodleCourses.length} courses from Moodle database`,
                        data: moodleCourses,
                        source: 'moodle-db'
                    });
                }
            }
        } catch (moodleError) {
            console.error('Moodle DB error:', moodleError.message);
            // Fall through to SCL database fallback
        }

        // Primary: use the courses table (official programme registry)
        console.log('Fetching courses from official courses table');
        const [officialCourses] = await db.execute(`
            SELECT
                id,
                course_code,
                course_title,
                course_type,
                department,
                duration_months,
                credit_points,
                awarding_body,
                entry_requirements,
                full_time_available,
                part_time_available,
                online_available,
                blended_available,
                course_status,
                'courses' as source
            FROM courses
            WHERE course_status = 'active'
              AND course_code IS NOT NULL
            ORDER BY course_title ASC
        `);

        if (officialCourses.length > 0) {
            const result = officialCourses.map(c => ({ ...c, is_active: true }));
            console.log(`✔ Fetched ${result.length} courses from official courses table`);
            return res.json({
                success: true,
                message: `Fetched ${result.length} courses`,
                data: result,
                source: 'courses-table'
            });
        }

        // Fallback to SCL Institute database courses from course_lifecycle_master
        console.log('courses table empty — falling back to course_lifecycle_master');
        const fallbackQuery = `
            SELECT
                id,
                course_code,
                course_title,
                course_type,
                awarding_body,
                qualification_level,
                application_type,
                programme_type_name as department,
                'course_lifecycle_master' as source
            FROM course_lifecycle_master
            WHERE course_code IS NOT NULL AND course_title IS NOT NULL
            LIMIT 100
        `;
        const [courses] = await db.execute(fallbackQuery);

        const normalizedCourses = courses.map((course) => ({
            ...course,
            is_active: true  // course_lifecycle_master doesn't track status, assume active
        }));

        let scopedCourses = normalizedCourses;
        if (admissionsScope) {
            const infoCourses = normalizedCourses.filter(isInfoProgrammeCourse);
            scopedCourses = infoCourses.length > 0
                ? infoCourses
                : normalizedCourses.filter(isProgrammeLevelCourse);

            scopedCourses = scopedCourses.sort((a, b) => {
                const aCode = String(a.course_code || '').toUpperCase();
                const bCode = String(b.course_code || '').toUpperCase();
                if (aCode && bCode) {
                    return aCode.localeCompare(bCode);
                }
                if (aCode) return -1;
                if (bCode) return 1;

                return String(a.course_title || '').localeCompare(String(b.course_title || ''));
            });
        }

        res.json({
            success: true,
            message: `Fetched ${scopedCourses.length} courses from SCL Institute database`,
            data: scopedCourses,
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
// ROUTE: GET /api/students/course-catalog
// Returns hierarchical course catalog: category -> subcategory -> courses
// ===============================================
router.get('/course-catalog', async (req, res) => {
    try {
        const [categoryRows] = await moodleDbPool.execute(`
            SELECT id, name, parent, depth, path
            FROM mdl_course_categories
            ORDER BY depth ASC, sortorder ASC, name ASC
        `);

        const [courseRows] = await moodleDbPool.execute(`
            SELECT
                c.id,
                c.idnumber AS course_code,
                c.shortname AS course_shortname,
                c.fullname AS course_title,
                c.summary AS description,
                c.startdate,
                c.enddate,
                c.visible,
                c.category AS category_id,
                cc.name AS category_name
            FROM mdl_course c
            LEFT JOIN mdl_course_categories cc ON cc.id = c.category
            WHERE c.id > 1
              AND c.visible = 1
            ORDER BY c.fullname ASC
        `);

        const categoryById = new Map(categoryRows.map((row) => [Number(row.id), {
            id: Number(row.id),
            name: row.name,
            parent: Number(row.parent || 0),
            depth: Number(row.depth || 0)
        }]));

        const getAncestors = (categoryId) => {
            const ancestors = [];
            let cursor = categoryById.get(Number(categoryId));
            const guard = new Set();

            while (cursor && !guard.has(cursor.id)) {
                guard.add(cursor.id);
                ancestors.unshift(cursor);
                if (!cursor.parent) {
                    break;
                }
                cursor = categoryById.get(cursor.parent);
            }

            return ancestors;
        };

        const hierarchy = new Map();

        for (const course of courseRows) {
            const courseCategoryId = Number(course.category_id || 0);
            const ancestors = getAncestors(courseCategoryId);
            if (ancestors.length === 0) {
                continue;
            }

            const topCategory = ancestors[0];
            const subcategory = ancestors.length > 1 ? ancestors[1] : null;

            if (!hierarchy.has(topCategory.id)) {
                hierarchy.set(topCategory.id, {
                    id: topCategory.id,
                    name: topCategory.name,
                    courses: [],
                    subcategories: new Map()
                });
            }

            const normalizedCourse = {
                id: Number(course.id),
                course_code: course.course_code || course.course_shortname || `COURSE-${course.id}`,
                course_title: course.course_title,
                description: course.description || '',
                startdate: Number(course.startdate || 0),
                enddate: Number(course.enddate || 0),
                category_id: courseCategoryId,
                category_name: course.category_name || ''
            };

            if (!subcategory) {
                hierarchy.get(topCategory.id).courses.push(normalizedCourse);
                continue;
            }

            const topBucket = hierarchy.get(topCategory.id);
            if (!topBucket.subcategories.has(subcategory.id)) {
                topBucket.subcategories.set(subcategory.id, {
                    id: subcategory.id,
                    name: subcategory.name,
                    courses: []
                });
            }

            topBucket.subcategories.get(subcategory.id).courses.push(normalizedCourse);
        }

        const categories = Array.from(hierarchy.values())
            .map((category) => ({
                id: category.id,
                name: category.name,
                courses: category.courses,
                subcategories: Array.from(category.subcategories.values())
                    .sort((a, b) => String(a.name).localeCompare(String(b.name)))
            }))
            .sort((a, b) => String(a.name).localeCompare(String(b.name)));

        return res.json({
            success: true,
            message: 'Course catalog loaded',
            data: {
                categories,
                total_courses: courseRows.length
            },
            source: 'moodle-db'
        });
    } catch (error) {
        console.error('Error fetching course catalog:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch course catalog',
            error: error.message
        });
    }
});

// ===============================================
// ROUTE 2: POST /api/students/applications
// Submit new student application (matches admission form exactly)
// ===============================================
router.post('/applications', upload.fields([
    { name: 'passport_id', maxCount: 5 },
    { name: 'academic_certificates', maxCount: 5 },
    { name: 'academic_transcripts', maxCount: 5 },
    { name: 'english_certificate', maxCount: 5 },
    { name: 'cv_resume', maxCount: 5 },
    { name: 'work_reference', maxCount: 5 },
    { name: 'proof_of_address', maxCount: 5 },
    { name: 'visa_immigration', maxCount: 5 },
    { name: 'statement_of_purpose', maxCount: 5 }
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
            programme_type_name,
            program_name,
            intake_id,
            mode_of_study,
            intake_start_date,
            entry_route,
            course_change_confirmed,
            course_change_confirmation_text,
            
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
        if (!first_name || !last_name || !email || !consent_gdpr || !declaration_truth) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Require intake_id for programme-based applications
        if (programme_type_name && program_name && !intake_id) {
            console.warn(`[APPLICATION WARNING] Submission for ${email} is missing intake_id (programme: ${programme_type_name} / ${program_name}). Moodle enrollment on approval will require an active intake.`);
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
        
        // Helper to convert ISO date to YYYY-MM-DD format
        const formatDateForDB = (dateValue) => {
            if (!dateValue) return null;
            if (typeof dateValue === 'string') {
                // If it's already YYYY-MM-DD format, return as-is
                if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return dateValue;
                }
                // If it's ISO format with time, extract just the date
                if (dateValue.includes('T')) {
                    return dateValue.split('T')[0];
                }
            }
            return null;
        };

        // Format all dates before saving
        const formattedDOB = formatDateForDB(date_of_birth);
        const formattedIntakeDate = formatDateForDB(intake_start_date);
        const formattedYearCompleted = formatDateForDB(year_completed);
        const formattedDeclarationDate = formatDateForDB(declaration_date) || new Date().toISOString().split('T')[0];

        // Auto-resolve course_code if not sent from frontend
        let resolvedCourseCode = toNullIfEmpty(course_code);
        if (!resolvedCourseCode) {
            const titleToSearch = toNullIfEmpty(course_title) || toNullIfEmpty(program_name);
            if (titleToSearch) {
                const [codeRows] = await connection.execute(
                    'SELECT course_code FROM courses WHERE course_title = ? OR ? LIKE CONCAT(course_title, \'%\') ORDER BY LENGTH(course_title) DESC LIMIT 1',
                    [titleToSearch, titleToSearch]
                );
                if (codeRows.length > 0) resolvedCourseCode = codeRows[0].course_code;
            }
        }

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
                course_title, course_code, course_type, programme_type_name, program_name, intake_id,
                mode_of_study, intake_start_date, entry_route,
                highest_qualification, institution_name, year_completed, relevant_work_experience, 
                english_proficiency, english_score,
                passport_id_document, academic_certificates, academic_transcripts, english_certificate,
                cv_resume, work_reference, proof_of_address, visa_immigration_document, statement_of_purpose_document,
                has_disabilities_support_needs, disability_support_details,
                consent_gdpr, consent_data_sharing, consent_marketing, declaration_truth, digital_signature,
                declaration_date, application_reference, application_status, submitted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())
        `, [
            first_name, 
            toNullIfEmpty(middle_names), 
            last_name, 
            formattedDOB, 
            gender, 
            nationality,
            email, 
            contact_number, 
            address_line1, 
            toNullIfEmpty(address_line2), 
            town_city, 
            postcode, 
            country_of_residence,
            toNullIfEmpty(course_title), 
            resolvedCourseCode, 
            toNullIfEmpty(course_type),
            toNullIfEmpty(programme_type_name),
            toNullIfEmpty(program_name),
            toNullIfEmpty(intake_id) ? Number(intake_id) : null,
            mode_of_study, 
            formattedIntakeDate, 
            entry_route,
            highest_qualification, 
            institution_name, 
            formattedYearCompleted, 
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
            documentPaths.statement_of_purpose || null,
            toBool(has_disabilities_support_needs),
            toNullIfEmpty(disability_support_details),
            toBool(consent_gdpr),
            toBool(consent_data_sharing),
            toBool(consent_marketing),
            toBool(declaration_truth),
            digital_signature,
            formattedDeclarationDate,
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

// ROUTE 2: PUT /api/students/applications/:id - Update existing application
router.put('/applications/:id', upload.fields([
    { name: 'passport_id', maxCount: 5 },
    { name: 'academic_certificates', maxCount: 5 },
    { name: 'academic_transcripts', maxCount: 5 },
    { name: 'english_certificate', maxCount: 5 },
    { name: 'cv_resume', maxCount: 5 },
    { name: 'work_reference', maxCount: 5 },
    { name: 'proof_of_address', maxCount: 5 },
    { name: 'visa_immigration', maxCount: 5 },
    { name: 'statement_of_purpose', maxCount: 5 }
]), async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { id } = req.params;
        
        console.log(`[PUT /applications/:id] Updating application ID: ${id}`);
        console.log('[PUT] Request body keys:', Object.keys(req.body));

        // Extract form data
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
            course_change_confirmed,
            course_change_confirmation_text,
            
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

        // Validate application exists
        const [existingApp] = await connection.execute(
            'SELECT id, application_reference, application_status, course_code, email, first_name, last_name FROM student_applications WHERE id = ?',
            [id]
        );

        if (existingApp.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const previousApplication = existingApp[0];
        const courseCodeChanged = String(previousApplication.course_code || '') !== String(course_code || '');
        const shouldReenroll = previousApplication.application_status === 'accepted' && courseCodeChanged && course_code;

        if (shouldReenroll) {
            const confirmationAccepted = String(course_change_confirmed || '').toLowerCase() === 'true';
            const confirmationText = normalizeProgrammeSwitchConfirmation(course_change_confirmation_text);

            if (!confirmationAccepted || !PROGRAMME_SWITCH_CONFIRMATION_ALIASES.includes(confirmationText)) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Programme switch confirmation is required before changing an accepted application. This change removes previous course access and related programme data.'
                });
            }
        }

        // Helper to convert empty strings to null
        const toNullIfEmpty = (val) => (val === '' || val === undefined) ? null : val;
        
        // Helper to convert to boolean
        const toBool = (val) => val === true || val === 'true';
        
        // Helper to convert ISO date to YYYY-MM-DD format
        const formatDateForDB = (dateValue) => {
            if (!dateValue) return null;
            if (typeof dateValue === 'string') {
                // If it's already YYYY-MM-DD format, return as-is
                if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return dateValue;
                }
                // If it's ISO format with time, extract just the date
                if (dateValue.includes('T')) {
                    return dateValue.split('T')[0];
                }
            }
            return null;
        };

        // Format all dates before saving
        const formattedDOB = formatDateForDB(date_of_birth);
        const formattedIntakeDate = formatDateForDB(intake_start_date);
        const formattedYearCompleted = formatDateForDB(year_completed);
        const formattedDeclarationDate = formatDateForDB(declaration_date) || new Date().toISOString().split('T')[0];

        // Auto-resolve course_code if not sent from frontend
        let resolvedCourseCode = toNullIfEmpty(course_code);
        if (!resolvedCourseCode) {
            const titleToSearch = toNullIfEmpty(course_title) || toNullIfEmpty(program_name);
            if (titleToSearch) {
                const [codeRows] = await connection.execute(
                    'SELECT course_code FROM courses WHERE course_title = ? OR ? LIKE CONCAT(course_title, \'%\') ORDER BY LENGTH(course_title) DESC LIMIT 1',
                    [titleToSearch, titleToSearch]
                );
                if (codeRows.length > 0) resolvedCourseCode = codeRows[0].course_code;
            }
        }

        // Update main application
        await connection.execute(`
            UPDATE student_applications SET
                first_name = ?, middle_names = ?, last_name = ?, date_of_birth = ?, gender = ?, nationality = ?,
                email = ?, contact_number = ?, address_line1 = ?, address_line2 = ?, town_city = ?, postcode = ?, country_of_residence = ?,
                course_title = ?, course_code = ?, course_type = ?, programme_type_name = ?, program_name = ?, intake_id = ?,
                mode_of_study = ?, intake_start_date = ?, entry_route = ?,
                highest_qualification = ?, institution_name = ?, year_completed = ?, relevant_work_experience = ?, 
                english_proficiency = ?, english_score = ?,
                has_disabilities_support_needs = ?, disability_support_details = ?,
                consent_gdpr = ?, consent_data_sharing = ?, consent_marketing = ?, declaration_truth = ?, digital_signature = ?,
                declaration_date = ?
            WHERE id = ?
        `, [
            first_name, 
            toNullIfEmpty(middle_names), 
            last_name, 
            formattedDOB, 
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
            resolvedCourseCode, 
            course_type, 
            toNullIfEmpty(programme_type_name),
            toNullIfEmpty(program_name),
            toNullIfEmpty(intake_id) ? Number(intake_id) : null,
            mode_of_study, 
            formattedIntakeDate, 
            entry_route,
            highest_qualification, 
            institution_name, 
            formattedYearCompleted, 
            toNullIfEmpty(relevant_work_experience),
            english_proficiency, 
            toNullIfEmpty(english_score),
            toBool(has_disabilities_support_needs),
            toNullIfEmpty(disability_support_details),
            toBool(consent_gdpr),
            toBool(consent_data_sharing),
            toBool(consent_marketing),
            toBool(declaration_truth),
            digital_signature,
            formattedDeclarationDate,
            id
        ]);

        // Store new document records if files were uploaded
        if (req.files && Object.keys(req.files).length > 0) {
            for (const [fieldName, files] of Object.entries(req.files)) {
                if (files && files.length > 0) {
                    for (const file of files) {
                        await connection.execute(`
                            INSERT INTO application_documents (
                                application_id, document_type, original_filename, stored_filename,
                                file_path, file_size, mime_type, uploaded_by_ip
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                            id,
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
        }

        await connection.commit();

        let moodleUnenrollment = null;
        let moodleReenrollment = null;
        if (shouldReenroll) {
            const previousCourseCode = String(previousApplication.course_code || '');
            if (previousCourseCode) {
                if (previousCourseCode.toUpperCase().includes('-INFO')) {
                    moodleUnenrollment = await unenrollStudentFromProgrammeCourses(
                        email || previousApplication.email,
                        previousCourseCode
                    );
                } else {
                    moodleUnenrollment = await unenrollStudentFromSingleCourse(
                        email || previousApplication.email,
                        previousCourseCode
                    );
                }

                if (moodleUnenrollment?.success) {
                    console.log(`[APPLICATION UPDATE] Removed application ${id} from ${previousCourseCode}`);
                } else {
                    console.warn(`[APPLICATION UPDATE] Unenrollment warning for application ${id}: ${moodleUnenrollment?.message || 'Unknown error'}`);
                }
            }

            if (String(course_code).toUpperCase().includes('-INFO')) {
                moodleReenrollment = await enrollStudentInProgrammeCourses(
                    email || previousApplication.email,
                    first_name || previousApplication.first_name,
                    last_name || previousApplication.last_name,
                    course_code,
                    intake_start_date
                );
            } else {
                moodleReenrollment = await enrollStudentInMoodle(
                    email || previousApplication.email,
                    first_name || previousApplication.first_name,
                    last_name || previousApplication.last_name,
                    course_code
                );
            }

            if (moodleReenrollment?.success) {
                console.log(`[APPLICATION UPDATE] Re-enrolled application ${id} to ${course_code}`);
            } else {
                console.warn(`[APPLICATION UPDATE] Re-enrollment warning for application ${id}: ${moodleReenrollment?.message || 'Unknown error'}`);
            }
        }

        // Get the updated application
        const [updatedApp] = await connection.execute(
            'SELECT id, application_reference, email, first_name, last_name FROM student_applications WHERE id = ?',
            [id]
        );

        res.status(200).json({
            success: true,
            message: shouldReenroll
                ? 'Application updated successfully and Moodle re-enrolment triggered'
                : 'Application updated successfully',
            data: {
                application_id: updatedApp[0].id,
                application_reference: updatedApp[0].application_reference,
                email: updatedApp[0].email,
                name: `${updatedApp[0].first_name} ${updatedApp[0].last_name}`,
                status: 'submitted',
                moodle_unenrollment: moodleUnenrollment,
                moodle_reenrollment: moodleReenrollment
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error updating application:', error);
        
        // Clean up uploaded files if database update failed
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
            message: 'Failed to update application',
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
            SELECT sa.*, c.course_code as course_code_ref, c.course_title as course_title,
                   pi.intake_label, pi.intake_start_date as intake_start,
                   (SELECT COUNT(*) FROM course_registrations cr WHERE cr.intake_id = sa.intake_id) as intake_course_count
            FROM student_applications sa
            LEFT JOIN courses c ON sa.course_code = c.course_code
            LEFT JOIN programme_intakes pi ON sa.intake_id = pi.id
            WHERE sa.id = ? AND sa.is_deleted = FALSE
        `, [id]);

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Get associated documents (exclude deleted documents)
        const [documents] = await db.execute(
            'SELECT document_type, original_filename, upload_date FROM application_documents WHERE application_id = ? AND is_deleted = FALSE',
            [id]
        );

        const application = applications[0];
        
        // Generate application reference if missing
        if (!application.application_reference) {
            application.application_reference = `SCL2026${String(application.id).padStart(6, '0')}`;
        }

        res.json({
            success: true,
            data: {
                application,
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
// ROUTE 3B2: DELETE /api/students/applications/:id
// Soft delete an application (mark as deleted)
// ===============================================
router.delete('/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if application exists and is not already deleted
        const [applications] = await db.execute(
            'SELECT id, is_deleted FROM student_applications WHERE id = ?',
            [id]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (applications[0].is_deleted) {
            return res.status(400).json({
                success: false,
                message: 'Application is already deleted'
            });
        }

        // Soft delete the application
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Mark application as deleted
            await connection.execute(
                'UPDATE student_applications SET is_deleted = TRUE, deleted_at = NOW() WHERE id = ?',
                [id]
            );

            // Optionally cascade: mark associated documents as deleted
            await connection.execute(
                'UPDATE application_documents SET is_deleted = TRUE, deleted_at = NOW() WHERE application_id = ?',
                [id]
            );

            // Optionally cascade: mark associated reviews as deleted
            await connection.execute(
                'UPDATE application_reviews SET is_deleted = TRUE, deleted_at = NOW() WHERE application_id = ?',
                [id]
            );

            // Optionally cascade: mark associated decisions as deleted
            await connection.execute(
                'UPDATE admissions_decisions SET is_deleted = TRUE, deleted_at = NOW() WHERE application_id = ?',
                [id]
            );

            await connection.commit();

            res.json({
                success: true,
                message: 'Application deleted successfully',
                data: {
                    id,
                    deleted_at: new Date().toISOString()
                }
            });
        } catch (transactionError) {
            await connection.rollback();
            throw transactionError;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete application',
            error: error.message
        });
    }
});

// ===============================================
// ROUTE 3B3: POST /api/students/applications/:id/restore
// Restore a soft-deleted application
// ===============================================
router.post('/applications/:id/restore', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if application exists and is deleted
        const [applications] = await db.execute(
            'SELECT id, is_deleted FROM student_applications WHERE id = ?',
            [id]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (!applications[0].is_deleted) {
            return res.status(400).json({
                success: false,
                message: 'Application is not deleted'
            });
        }

        // Restore the application
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Restore application
            await connection.execute(
                'UPDATE student_applications SET is_deleted = FALSE, deleted_at = NULL WHERE id = ?',
                [id]
            );

            // Optionally cascade: restore associated documents
            await connection.execute(
                'UPDATE application_documents SET is_deleted = FALSE, deleted_at = NULL WHERE application_id = ?',
                [id]
            );

            // Optionally cascade: restore associated reviews
            await connection.execute(
                'UPDATE application_reviews SET is_deleted = FALSE, deleted_at = NULL WHERE application_id = ?',
                [id]
            );

            // Optionally cascade: restore associated decisions
            await connection.execute(
                'UPDATE admissions_decisions SET is_deleted = FALSE, deleted_at = NULL WHERE application_id = ?',
                [id]
            );

            await connection.commit();

            res.json({
                success: true,
                message: 'Application restored successfully',
                data: {
                    id,
                    restored_at: new Date().toISOString()
                }
            });
        } catch (transactionError) {
            await connection.rollback();
            throw transactionError;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error restoring application:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to restore application',
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

router.post('/teacher-registrations', upload.single('cv_resume'), async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            contact_number,
            nationality,
            highest_qualification,
            years_of_experience,
            current_employer,
            teaching_statement,
            selected_course_title,
            selected_course_code,
            selected_course_type,
            teaching_role
        } = req.body;

        if (!first_name || !last_name || !email || !selected_course_title || !selected_course_code) {
            return res.status(400).json({ success: false, message: 'First name, last name, email, course title, and course code are required' });
        }

        const cvResumePath = req.file ? `/uploads/student-documents/${req.file.filename}` : null;
        const [result] = await db.execute(
            `INSERT INTO teacher_registrations (
                first_name, last_name, email, contact_number, nationality,
                highest_qualification, years_of_experience, current_employer,
                teaching_statement, selected_course_title, selected_course_code,
                selected_course_type, teaching_role, cv_resume, application_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')`,
            [
                first_name,
                last_name,
                email,
                contact_number || null,
                nationality || null,
                highest_qualification || null,
                years_of_experience ? Number(years_of_experience) : null,
                current_employer || null,
                teaching_statement || null,
                selected_course_title,
                selected_course_code,
                selected_course_type || null,
                teaching_role || 'editingteacher',
                cvResumePath
            ]
        );

        const registrationId = Number(result.insertId);
        const registrationReference = `TCH-${String(registrationId).padStart(6, '0')}`;
        await db.execute('UPDATE teacher_registrations SET registration_reference = ? WHERE id = ?', [registrationReference, registrationId]);

        return res.status(201).json({
            success: true,
            message: 'Teacher registration submitted successfully',
            data: { id: registrationId, registration_reference: registrationReference }
        });
    } catch (error) {
        console.error('Error creating teacher registration:', error);
        res.status(500).json({ success: false, message: 'Failed to submit teacher registration', error: error.message });
    }
});

router.get('/teacher-registrations', async (req, res) => {
    try {
        const { status, search } = req.query;
        const conditions = ['1 = 1'];
        const values = [];

        if (status && status !== 'all') {
            conditions.push('application_status = ?');
            values.push(status);
        }

        if (search) {
            conditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR registration_reference LIKE ? OR selected_course_title LIKE ? OR selected_course_code LIKE ?)');
            const searchValue = `%${search}%`;
            values.push(searchValue, searchValue, searchValue, searchValue, searchValue, searchValue);
        }

        const [rows] = await db.execute(
            `SELECT * FROM teacher_registrations WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
            values
        );

        res.json({ success: true, data: { registrations: rows } });
    } catch (error) {
        console.error('Error fetching teacher registrations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch teacher registrations', error: error.message });
    }
});

router.get('/teacher-registrations/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM teacher_registrations WHERE id = ? LIMIT 1', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Teacher registration not found' });
        }
        res.json({ success: true, data: { registration: rows[0] } });
    } catch (error) {
        console.error('Error fetching teacher registration:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch teacher registration', error: error.message });
    }
});

router.post('/teacher-registrations/:id/decision', async (req, res) => {
    try {
        const { decision, reviewer_name, reviewer_notes } = req.body;
        const registrationId = req.params.id;

        if (!decision || !['accepted', 'rejected', 'under_review'].includes(String(decision))) {
            return res.status(400).json({ success: false, message: 'Valid decision is required' });
        }

        const [rows] = await db.execute('SELECT * FROM teacher_registrations WHERE id = ? LIMIT 1', [registrationId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Teacher registration not found' });
        }

        const registration = rows[0];

        // Accept/reject is a status-only operation.
        // User account + Moodle account creation happens at "Activate Faculty Account" (onboarding step).
        await db.execute(
            `UPDATE teacher_registrations
             SET application_status = ?, reviewer_name = ?, reviewer_notes = ?,
                 approved_at = CASE WHEN ? = 'accepted' THEN NOW() ELSE NULL END,
                 rejected_at = CASE WHEN ? = 'rejected' THEN NOW() ELSE NULL END
             WHERE id = ?`,
            [decision, reviewer_name || null, reviewer_notes || null, decision, decision, registrationId]
        );

        return res.json({
            success: true,
            message: `Teacher registration ${decision}`,
            data: {
                registrationId: Number(registrationId),
                status: decision
            }
        });
    } catch (error) {
        console.error('Error processing teacher registration decision:', error);
        res.status(500).json({ success: false, message: 'Failed to process teacher registration decision', error: error.message });
    }
});

router.get('/moodle/category-hierarchy', async (req, res) => {
    try {
        const includeInactiveParam = String(req.query.include_inactive || 'false').trim().toLowerCase();
        const includeInactive = includeInactiveParam === 'true' || includeInactiveParam === '1' || includeInactiveParam === 'yes';
        const rows = await safeMoodleSelectRows(
            `SELECT id, parent, name, idnumber, sortorder, depth, path, visible
             FROM mdl_course_categories
             ${includeInactive ? '' : 'WHERE COALESCE(visible, 1) = 1'}
             ORDER BY depth ASC, parent ASC, sortorder ASC, name ASC`,
            []
        );

        const categories = (rows || []).map((row) => ({
            id: Number(row.id),
            parent: Number(row.parent || 0),
            name: String(row.name || '').trim(),
            idnumber: String(row.idnumber || '').trim(),
            sortorder: Number(row.sortorder || 0),
            depth: Number(row.depth || 0),
            path: String(row.path || '').trim(),
            visible: Number(row.visible ?? 1) === 1
        }));

        const byParent = new Map();
        for (const row of categories) {
            if (!byParent.has(row.parent)) {
                byParent.set(row.parent, []);
            }
            byParent.get(row.parent).push(row);
        }

        const sortCategoryNodes = (list) => (list || []).slice().sort((a, b) => {
            if (a.sortorder !== b.sortorder) return a.sortorder - b.sortorder;
            return a.name.localeCompare(b.name);
        });

        // Fetch local (not-yet-synced) categories from SCL DB
        let localRows = [];
        try {
            const [lRows] = await db.execute('SELECT * FROM scl_local_categories WHERE moodle_category_id IS NULL ORDER BY id ASC');
            localRows = lRows || [];
        } catch (e) {
            // Table may not exist yet; ignore
        }

        // Build local lookup maps (using negative IDs)
        const localById = new Map(localRows.map(r => [r.id, r]));
        const localByParentLocal = new Map();
        const localByParentMoodle = new Map();
        for (const r of localRows) {
            if (r.parent_local_id) {
                if (!localByParentLocal.has(r.parent_local_id)) localByParentLocal.set(r.parent_local_id, []);
                localByParentLocal.get(r.parent_local_id).push(r);
            } else if (r.parent_moodle_id) {
                if (!localByParentMoodle.has(r.parent_moodle_id)) localByParentMoodle.set(r.parent_moodle_id, []);
                localByParentMoodle.get(r.parent_moodle_id).push(r);
            }
        }
        const localRoots = localRows.filter(r => !r.parent_local_id && !r.parent_moodle_id);

        const makeLocalSemesters = (parentLocalId, parentMoodleId) => {
            const kids = parentLocalId ? (localByParentLocal.get(parentLocalId) || []) : (localByParentMoodle.get(parentMoodleId) || []);
            return kids.filter(r => r.level === 'semester').map(r => ({
                id: -(r.id), name: r.name, parent: parentMoodleId || -(parentLocalId), depth: 4, path: '', sortorder: 9999, is_local: true
            }));
        };

        const makeLocalYears = (parentLocalId, parentMoodleId) => {
            const kids = parentLocalId ? (localByParentLocal.get(parentLocalId) || []) : (localByParentMoodle.get(parentMoodleId) || []);
            return kids.filter(r => r.level === 'year').map(r => ({
                id: -(r.id), name: r.name, parent: parentMoodleId || -(parentLocalId), depth: 3, path: '', sortorder: 9999, is_local: true,
                semesters: makeLocalSemesters(r.id, null)
            }));
        };

        const makeLocalPrograms = (parentLocalId, parentMoodleId) => {
            const kids = parentLocalId ? (localByParentLocal.get(parentLocalId) || []) : (localByParentMoodle.get(parentMoodleId) || []);
            return kids.filter(r => r.level === 'program').map(r => ({
                id: -(r.id), name: r.name, parent: parentMoodleId || -(parentLocalId), depth: 2, path: '', sortorder: 9999, is_local: true,
                years: [
                    ...sortCategoryNodes(byParent.get(-(r.id)) || []).map((year) => {
                        const semesters = sortCategoryNodes(byParent.get(year.id) || []).map(s => ({ id: s.id, name: s.name, parent: s.parent, depth: s.depth, path: s.path, sortorder: s.sortorder }));
                        return { id: year.id, name: year.name, parent: year.parent, depth: year.depth, path: year.path, sortorder: year.sortorder, semesters };
                    }),
                    ...makeLocalYears(r.id, null)
                ]
            }));
        };

        const programme_types = [
            ...sortCategoryNodes(byParent.get(0) || []).map((programmeType) => {
                const moodlePrograms = sortCategoryNodes(byParent.get(programmeType.id) || []).map((program) => {
                    const moodleYears = sortCategoryNodes(byParent.get(program.id) || []).map((year) => {
                        const semesters = [
                            ...sortCategoryNodes(byParent.get(year.id) || []).map((semester) => ({
                                id: semester.id, name: semester.name, parent: semester.parent, depth: semester.depth, path: semester.path, sortorder: semester.sortorder
                            })),
                            ...makeLocalSemesters(null, year.id)
                        ];
                        return { id: year.id, name: year.name, parent: year.parent, depth: year.depth, path: year.path, sortorder: year.sortorder, semesters };
                    });
                    return {
                        id: program.id, name: program.name, idnumber: program.idnumber || '', parent: program.parent, depth: program.depth, path: program.path, sortorder: program.sortorder,
                        years: [...moodleYears, ...makeLocalYears(null, program.id)]
                    };
                });
                return {
                    id: programmeType.id, name: programmeType.name, parent: programmeType.parent, depth: programmeType.depth, path: programmeType.path, sortorder: programmeType.sortorder,
                    programs: [...moodlePrograms, ...makeLocalPrograms(null, programmeType.id)]
                };
            }),
            // Local root-level programme types
            ...localRoots.filter(r => r.level === 'programme_type').map(r => ({
                id: -(r.id), name: r.name, parent: 0, depth: 1, path: '', sortorder: 9999, is_local: true,
                programs: makeLocalPrograms(r.id, null)
            }))
        ];

        const programs = programme_types.flatMap((type) => type.programs || []);

        return res.json({
            success: true,
            data: {
                programme_types,
                programs,
                categories
            }
        });
    } catch (error) {
        console.error('Error fetching Moodle category hierarchy:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch Moodle category hierarchy', error: error.message });
    }
});

// POST /api/students/moodle/ensure-category-path
// Create full category path in Moodle if not exist and return IDs
router.post('/moodle/ensure-category-path', async (req, res) => {
    try {
        const programmeTypeName = String(req.body?.programme_type_name || '').trim();
        const programName = String(req.body?.program_name || '').trim();
        const academicYear = String(req.body?.academic_year || '').trim();
        const semesterName = String(req.body?.semester_name || '').trim();

        console.log('[ensure-category-path] Input:', { programmeTypeName, programName, academicYear, semesterName });

        if (!programmeTypeName || !programName || !academicYear || !semesterName) {
            return res.status(400).json({
                success: false,
                message: 'programme_type_name, program_name, academic_year and semester_name are required'
            });
        }

        console.log('[ensure-category-path] Finding root category...');
        const rootCategoryId = getStructureRootCategoryId();
        console.log('[ensure-category-path] Root category ID:', rootCategoryId);

        console.log('[ensure-category-path] Creating programme type category:', programmeTypeName);
        const programmeTypeCategoryId = await findOrCreateMoodleCategory(programmeTypeName, rootCategoryId, 'programme-type');
        console.log('[ensure-category-path] Programme type category ID:', programmeTypeCategoryId);

        console.log('[ensure-category-path] Creating program category:', programName);
        const programCategoryId = await findOrCreateMoodleCategory(programName, programmeTypeCategoryId, 'program');
        console.log('[ensure-category-path] Program category ID:', programCategoryId);

        console.log('[ensure-category-path] Creating year category:', academicYear);
        const yearCategoryId = await findOrCreateMoodleCategory(academicYear, programCategoryId, 'year');
        console.log('[ensure-category-path] Year category ID:', yearCategoryId);

        console.log('[ensure-category-path] Creating semester category:', semesterName);
        const semesterCategoryId = await findOrCreateMoodleCategory(semesterName, yearCategoryId, 'semester');
        console.log('[ensure-category-path] Semester category ID:', semesterCategoryId);

        return res.json({
            success: true,
            message: 'Moodle category path ensured',
            data: {
                programme_type_category_id: programmeTypeCategoryId,
                program_category_id: programCategoryId,
                year_category_id: yearCategoryId,
                semester_category_id: semesterCategoryId
            }
        });
    } catch (error) {
        console.error('[ensure-category-path] ERROR:', error);
        console.error('[ensure-category-path] Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to ensure Moodle category path',
            error: error.message,
            detail: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// POST /api/students/moodle/create-level-category
// Create category in Moodle at click-time and respect the direct parent passed from frontend.
router.post('/moodle/create-level-category', async (req, res) => {
    try {
        const name = String(req.body?.name || '').trim();
        const level = String(req.body?.level || '').trim(); // 'programme_type' | 'program' | 'year' | 'semester'
        const programmeTypeName = String(req.body?.programme_type_name || '').trim();
        const programName = String(req.body?.program_name || '').trim();
        const academicYear = String(req.body?.academic_year || '').trim();
        const courseCode = String(req.body?.course_code || '').trim();
        const explicitCode = String(req.body?.explicit_code || '').trim();
        
        // Respect the direct parent_category_id from frontend
        let directParentId = req.body?.parent_category_id ? Number(req.body.parent_category_id) : null;
        
        // If parent is negative (local), resolve it or skip Moodle creation
        if (directParentId && directParentId < 0) {
            // Local parent - can't use it in Moodle directly
            // We'll rebuild the hierarchy using parents
            directParentId = null;
        }

        if (!name || !level) {
            return res.status(400).json({ success: false, message: 'name and level are required' });
        }

        const rootId = getStructureRootCategoryId();
        const resultIds = {};
        const hierarchyCodes = buildHierarchyCodePattern(courseCode, programmeTypeName, programName, academicYear, name);

        const thisCode = explicitCode || (
            level === 'programme_type' ? hierarchyCodes.programmeTypeCode :
            level === 'program' ? hierarchyCodes.programCode :
            level === 'year' ? hierarchyCodes.yearCode :
            hierarchyCodes.semesterCode
        );

        if (level !== 'programme_type' && !thisCode) {
            return res.status(400).json({
                success: false,
                message: 'Hierarchy code is missing for this level. Refresh the page and try again.'
            });
        }

        const codeParts = String(thisCode || '').split('-').filter(Boolean);
        const programmeTypeCode = codeParts[0] || hierarchyCodes.programmeTypeCode;
        const programCode = codeParts.length >= 2 ? `${codeParts[0]}-${codeParts[1]}` : hierarchyCodes.programCode;
        const yearCode = codeParts.length >= 3 ? `${codeParts[0]}-${codeParts[1]}-${codeParts[2]}` : hierarchyCodes.yearCode;
        const semesterCode = codeParts.length >= 4 ? `${codeParts[0]}-${codeParts[1]}-${codeParts[2]}-${codeParts[3]}` : hierarchyCodes.semesterCode;

        // ENFORCE: Parent required for non-root levels
        if (level !== 'programme_type' && (!directParentId || directParentId < 1)) {
            return res.status(400).json({
                success: false,
                message: `Cannot create ${level} without a valid parent ID. Select/create the parent level first.`
            });
        }

        // Create under specified parent
        const parentPrefix = level === 'programme_type' ? 'programme-type' :
                            level === 'program' ? 'program' :
                            level === 'year' ? 'year' : 'semester';

        const useParentId = level === 'programme_type' ? rootId : directParentId;

        const categoryIdField = level === 'programme_type' ? 'programme_type_category_id' :
                               level === 'program' ? 'program_category_id' :
                               level === 'year' ? 'year_category_id' : 'semester_category_id';

        resultIds[categoryIdField] = await findOrCreateMoodleCategory(
            name,
            useParentId,
            parentPrefix,
            thisCode || (
                level === 'programme_type' ? programmeTypeCode :
                level === 'program' ? programCode :
                level === 'year' ? yearCode : semesterCode
            )
        );

        return res.json({ success: true, data: resultIds });
    } catch (error) {
        console.error('[create-level-category] ERROR:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to create Moodle category', error: error.message });
    }
});

// POST /api/students/moodle/create-programme-with-info
// Creates a programme Moodle category + INFO course with programme-level custom fields.
router.post('/moodle/create-programme-with-info', async (req, res) => {
    try {
        const name = String(req.body?.name || '').trim();
        const parentCatId = req.body?.parent_category_id ? Number(req.body.parent_category_id) : null;
        if (!name || !parentCatId) {
            return res.status(400).json({ success: false, message: 'name and parent_category_id are required' });
        }

        // 1. Auto-compute programme code (e.g., HND-001, HND-002) from sibling count
        const [parentRows] = await moodleDbPool.execute(
            'SELECT idnumber FROM mdl_course_categories WHERE id = ? LIMIT 1',
            [parentCatId]
        );
        const parentIdnumber = String(parentRows[0]?.idnumber || '').trim();
        const [siblingRows] = await moodleDbPool.execute(
            'SELECT COUNT(*) AS cnt FROM mdl_course_categories WHERE parent = ?',
            [parentCatId]
        );
        const siblingCount = Number(siblingRows[0]?.cnt || 0);
        const nextNum = String(siblingCount + 1).padStart(3, '0');
        const programCode = parentIdnumber ? `${parentIdnumber}-${nextNum}` : `PROG-${nextNum}`;

        // 2. Find or create the programme category in Moodle
        const programCatId = await findOrCreateMoodleCategory(name, parentCatId, 'program', programCode);

        // 3. Build registration-like object for INFO course creation
        const infoRegistration = {
            course_code: programCode,
            course_title: name,
            course_type: String(req.body?.course_type || '').trim(),
            awarding_body_accreditation: String(req.body?.awarding_body_accreditation || '').trim(),
            regulation_level: String(req.body?.regulation_level || '').trim(),
            subject_area_discipline: String(req.body?.subject_area_discipline || '').trim(),
            learning_outcomes: String(req.body?.learning_outcomes || '').trim(),
            units_modules_covered: String(req.body?.units_modules_covered || '').trim(),
            entry_requirements: String(req.body?.entry_requirements || '').trim(),
        };

        // 4. Create the INFO course (or reuse if it already exists)
        const infoResult = await ensureProgrammeInfoCourse(infoRegistration, programCatId);

        // 5. Push programme-level custom fields onto the INFO course
        await upsertMoodleCourseCustomFields(infoResult.moodleCourseId, infoRegistration, PROGRAMME_CUSTOM_FIELD_ALIASES);

        return res.json({
            success: true,
            data: {
                program_category_id: programCatId,
                course_code: programCode,
                info_course_id: infoResult.moodleCourseId,
                info_course_created: infoResult.created,
            }
        });
    } catch (error) {
        console.error('[create-programme-with-info] ERROR:', error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/students/moodle/sync-master-course
// Create or update a course in Moodle immediately using the category IDs from a master course record.
router.post('/moodle/sync-master-course', async (req, res) => {
    try {
        const course_title = String(req.body?.course_title || '').trim();
        const course_code = String(req.body?.course_code || '').trim();
        let programme_type_name = String(req.body?.programme_type_name || '').trim();
        let program_name = String(req.body?.program_name || '').trim();
        let academic_year = String(req.body?.academic_year || '').trim();
        let semester_name = String(req.body?.semester_name || '').trim();

        if (!course_title || !course_code) {
            return res.status(400).json({ success: false, message: 'course_title and course_code are required' });
        }

        const hasExplicitStructure = Boolean(
            programme_type_name &&
            program_name &&
            academic_year &&
            semester_name
        );

        const derivedHierarchy = deriveHierarchyFromCourseCode(course_code);
        if (!hasExplicitStructure && derivedHierarchy) {
            programme_type_name = derivedHierarchy.programme_type_name;
            program_name = derivedHierarchy.program_name;
            academic_year = derivedHierarchy.academic_year;
            semester_name = derivedHierarchy.semester_name;
        }

        if (!programme_type_name || !program_name || !academic_year || !semester_name) {
            return res.status(400).json({
                success: false,
                message: 'programme_type_name, program_name, academic_year and semester_name are required before syncing to Moodle'
            });
        }

        const parseId = (value) => {
            const parsed = Number(value);
            return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
        };

        const parseAnyInt = (value) => {
            const parsed = Number(value);
            return Number.isInteger(parsed) ? parsed : null;
        };

        const hierarchyCodes = buildHierarchyCodePattern(course_code, programme_type_name, program_name, academic_year, semester_name);

        const resolveCategoryId = async (rawValue, categoryName, parentId, level, explicitIdNumber = null) => {
            const parsed = parseAnyInt(rawValue);
            if (!parsed) return null;
            if (parsed > 0) return parsed;

            // Local temporary IDs are negative in UI; map them to real Moodle IDs if available.
            const localId = Math.abs(parsed);
            try {
                const [rows] = await db.execute(
                    'SELECT id, name, moodle_category_id FROM scl_local_categories WHERE id = ? LIMIT 1',
                    [localId]
                );
                if (!rows.length) return null;

                const localCat = rows[0];
                let moodleId = localCat.moodle_category_id ? Number(localCat.moodle_category_id) : null;

                // If local category hasn't been synced to Moodle yet, create it now
                if (!Number.isInteger(moodleId) || moodleId <= 0) {
                    const catName = categoryName || String(localCat.name || '').trim();
                    if (catName && parentId && level) {
                        moodleId = await findOrCreateMoodleCategory(catName, parentId, level, explicitIdNumber);
                        if (Number.isInteger(moodleId) && moodleId > 0) {
                            // Update local category with the real Moodle ID
                            await db.execute(
                                'UPDATE scl_local_categories SET moodle_category_id = ? WHERE id = ?',
                                [moodleId, localId]
                            ).catch(() => {});
                        }
                    }
                }

                return Number.isInteger(moodleId) && moodleId > 0 ? moodleId : null;
            } catch (_error) {
                return null;
            }
        };

        const rootCategoryId = getStructureRootCategoryId();

        const registration = {
            course_title,
            course_code,
            programme_type_name,
            program_name,
            academic_year,
            semester_name,
            programme_type_category_id: await resolveCategoryId(req.body?.programme_type_category_id, programme_type_name, rootCategoryId, 'programme-type', hierarchyCodes.programmeTypeCode),
            program_category_id: null,
            year_category_id: null,
            semester_category_id: null,
            start_date: null
        };

        // Resolve program under programme type
        if (registration.programme_type_category_id) {
            registration.program_category_id = await resolveCategoryId(req.body?.program_category_id, program_name, registration.programme_type_category_id, 'program', hierarchyCodes.programCode);
        }

        // Resolve year under program
        if (registration.program_category_id) {
            registration.year_category_id = await resolveCategoryId(req.body?.year_category_id, academic_year, registration.program_category_id, 'year', hierarchyCodes.yearCode);
        }

        // Resolve semester under year
        if (registration.year_category_id) {
            registration.semester_category_id = await resolveCategoryId(req.body?.semester_category_id, semester_name, registration.year_category_id, 'semester', hierarchyCodes.semesterCode);
        }

        const hasExplicitHierarchyIds = Boolean(
            registration.programme_type_category_id &&
            registration.program_category_id &&
            registration.year_category_id &&
            registration.semester_category_id
        );

        let usedExplicitHierarchyIds = false;
        if (hasExplicitHierarchyIds) {
            const ids = [
                registration.programme_type_category_id,
                registration.program_category_id,
                registration.year_category_id,
                registration.semester_category_id
            ];

            const [rows] = await moodleDbPool.execute(
                `SELECT id, parent FROM mdl_course_categories WHERE id IN (?, ?, ?, ?)`,
                ids
            );

            const byId = new Map((rows || []).map((row) => [Number(row.id), Number(row.parent)]));
            const programParent = byId.get(registration.program_category_id);
            const yearParent = byId.get(registration.year_category_id);
            const semesterParent = byId.get(registration.semester_category_id);

            usedExplicitHierarchyIds =
                byId.size === 4 &&
                programParent === Number(registration.programme_type_category_id) &&
                yearParent === Number(registration.program_category_id) &&
                semesterParent === Number(registration.year_category_id);
        }

        if (!usedExplicitHierarchyIds) {
            try {
                const rootCategoryId = getStructureRootCategoryId();
                const programmeTypeCategoryId = await findOrCreateMoodleCategory(registration.programme_type_name, rootCategoryId, 'programme-type', hierarchyCodes.programmeTypeCode);
                const programCategoryId = await findOrCreateMoodleCategory(registration.program_name, programmeTypeCategoryId, 'program', hierarchyCodes.programCode);
                const yearCategoryId = await findOrCreateMoodleCategory(registration.academic_year, programCategoryId, 'year', hierarchyCodes.yearCode);
                const semesterCategoryId = await findOrCreateMoodleCategory(registration.semester_name, yearCategoryId, 'semester', hierarchyCodes.semesterCode);

                registration.programme_type_category_id = programmeTypeCategoryId;
                registration.program_category_id = programCategoryId;
                registration.year_category_id = yearCategoryId;
                registration.semester_category_id = semesterCategoryId;
            } catch (categoryError) {
                // Fallback: resolve only from existing Moodle DB categories without creating new ones.
                const rootCategoryId = getStructureRootCategoryId();
                const programmeTypeCategoryId = await findMoodleCategoryByName(registration.programme_type_name, rootCategoryId);
                const programCategoryId = programmeTypeCategoryId ? await findMoodleCategoryByName(registration.program_name, programmeTypeCategoryId) : null;
                const yearCategoryId = programCategoryId ? await findMoodleCategoryByName(registration.academic_year, programCategoryId) : null;
                const semesterCategoryId = yearCategoryId ? await findMoodleCategoryByName(registration.semester_name, yearCategoryId) : null;

                if (programmeTypeCategoryId && programCategoryId && yearCategoryId && semesterCategoryId) {
                    registration.programme_type_category_id = programmeTypeCategoryId;
                    registration.program_category_id = programCategoryId;
                    registration.year_category_id = yearCategoryId;
                    registration.semester_category_id = semesterCategoryId;
                } else {
                    throw new Error(`Could not resolve Moodle category path: ${categoryError.message}`);
                }
            }
        }

        const result = await createOrUpdateMoodleCourseCore(registration);
        return res.json({
            success: true,
            message: result.created ? 'Course created in Moodle' : 'Course updated in Moodle',
            data: {
                moodle_course_id: result.moodleCourseId,
                created: result.created,
                resolved_category_ids: {
                    programme_type_category_id: registration.programme_type_category_id,
                    program_category_id: registration.program_category_id,
                    year_category_id: registration.year_category_id,
                    semester_category_id: registration.semester_category_id
                },
                resolved_hierarchy: {
                    programme_type_name: registration.programme_type_name,
                    program_name: registration.program_name,
                    academic_year: registration.academic_year,
                    semester_name: registration.semester_name
                }
            }
        });
    } catch (error) {
        console.error('[sync-master-course] ERROR:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to sync course to Moodle', error: error.message });
    }
});

// POST /api/students/moodle/create-category
// Create a single category in Moodle and return its ID
router.post('/moodle/create-category', async (req, res) => {
    try {
        const name = String(req.body?.name || '').trim();
        const parentId = req.body?.parent_id ? Number(req.body.parent_id) : null;
        const level = String(req.body?.level || '').trim();

        console.log('[create-category] Input:', { name, parentId, level });

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        let actualParentId = parentId;
        if (!actualParentId || actualParentId <= 0) {
            actualParentId = getStructureRootCategoryId();
        }

        const existingId = await findMoodleCategoryByName(name, actualParentId);
        if (existingId) {
            return res.json({
                success: true,
                message: 'Category already exists',
                data: {
                    id: existingId,
                    name,
                    created: false
                }
            });
        }

        const idnumber = [level, toCategorySlug(name)].filter(Boolean).join('-').slice(0, 100);
        console.log('[create-category] Creating with idnumber:', idnumber);

        // Use findOrCreateMoodleCategory which has REST + direct-DB fallback
        const createdId = await findOrCreateMoodleCategory(name, actualParentId, level, idnumber);
        if (!createdId) {
            throw new Error('Failed to create category: no ID returned from Moodle');
        }

        console.log('[create-category] Category created with ID:', createdId);

        return res.json({
            success: true,
            message: 'Category created successfully',
            data: {
                id: createdId,
                name,
                created: true
            }
        });
    } catch (error) {
        console.error('[create-category] ERROR:', error);
        console.error('[create-category] Stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message,
            detail: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// DELETE /api/students/moodle/delete-category/:id
// Cascade-delete a Moodle category: removes all child categories, courses, and related lifecycle records
router.delete('/moodle/delete-category/:id', async (req, res) => {
    try {
        const rawId = Number(req.params.id);
        if (!rawId || !Number.isInteger(rawId)) {
            return res.status(400).json({ success: false, message: 'Invalid category ID' });
        }

        const isLocal = rawId < 0;
        const localId = Math.abs(rawId);

        if (isLocal) {
            const [rows] = await db.execute('SELECT id, name, level FROM scl_local_categories WHERE id = ?', [localId]);
            if (!rows || rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Local category not found' });
            }
            const [children] = await db.execute('SELECT id FROM scl_local_categories WHERE parent_local_id = ? LIMIT 1', [localId]);
            if (children && children.length > 0) {
                return res.status(400).json({ success: false, message: 'Cannot delete: this category has child categories. Delete children first.' });
            }
            await db.execute('DELETE FROM scl_local_categories WHERE id = ?', [localId]);
            console.log(`[delete-category] Deleted local category #${localId} (${rows[0].name})`);
            return res.json({ success: true, message: `Local category "${rows[0].name}" deleted`, data: { id: rawId, name: rows[0].name } });
        }

        // Moodle category — check it exists
        const catRows = await safeMoodleSelectRows('SELECT id, name, parent FROM mdl_course_categories WHERE id = ?', [rawId]);
        if (!catRows || catRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Moodle category not found' });
        }
        const catName = catRows[0].name;

        // ── Collect ALL descendant category IDs (breadth-first) ──
        const allCatIds = [rawId];
        let queue = [rawId];
        while (queue.length > 0) {
            const parentId = queue.shift();
            const children = await safeMoodleSelectRows('SELECT id FROM mdl_course_categories WHERE parent = ?', [parentId]);
            if (children && children.length > 0) {
                for (const child of children) {
                    allCatIds.push(child.id);
                    queue.push(child.id);
                }
            }
        }
        console.log(`[delete-category] Category "${catName}" (#${rawId}) — found ${allCatIds.length} categories to delete (including self): [${allCatIds.join(', ')}]`);

        // ── Collect ALL courses in these categories ──
        const allCourses = [];
        for (const catId of allCatIds) {
            const courses = await safeMoodleSelectRows('SELECT id, fullname, shortname FROM mdl_course WHERE category = ?', [catId]);
            if (courses && courses.length > 0) {
                allCourses.push(...courses);
            }
        }
        console.log(`[delete-category] Found ${allCourses.length} courses to cascade-delete`);

        // ── Delete lifecycle records for each course from SCL database ──
        const deletedSummary = { accreditations: 0, visits: 0, inductions: 0, registrations: 0, enrollments: 0, courses: 0, categories: 0 };

        for (const course of allCourses) {
            const moodleCourseId = course.id;
            const courseTitle = course.fullname;
            const courseShortname = course.shortname;

            // Delete accreditation records (child tables cascade via ON DELETE CASCADE)
            try {
                const [accResult] = await db.execute('DELETE FROM course_accreditations WHERE course_title = ?', [courseTitle]);
                deletedSummary.accreditations += accResult.affectedRows || 0;
            } catch (e) { console.warn(`[delete-category] accreditations cleanup error:`, e.message); }

            // Delete visit records
            try {
                const [visitResult] = await db.execute('DELETE FROM course_visits WHERE course_title = ? OR course_code = ?', [courseTitle, courseShortname]);
                deletedSummary.visits += visitResult.affectedRows || 0;
            } catch (e) { console.warn(`[delete-category] visits cleanup error:`, e.message); }

            // Delete induction records (child tables cascade via ON DELETE CASCADE)
            try {
                const [indResult] = await db.execute(
                    'DELETE FROM course_inductions WHERE course_title = ? OR course_code = ?',
                    [courseTitle, courseShortname]
                );
                deletedSummary.inductions += indResult.affectedRows || 0;
            } catch (e) { console.warn(`[delete-category] inductions cleanup error:`, e.message); }

            // Delete enrollment mappings
            try {
                const [enrolResult] = await db.execute('DELETE FROM course_enrollment_mapping WHERE moodle_course_id = ?', [moodleCourseId]);
                deletedSummary.enrollments += enrolResult.affectedRows || 0;
            } catch (e) { console.warn(`[delete-category] enrollment cleanup error:`, e.message); }

            // Delete course registrations
            try {
                const [regResult] = await db.execute(
                    'DELETE FROM course_registrations WHERE moodle_course_id = ? OR course_code = ?',
                    [moodleCourseId, courseShortname]
                );
                deletedSummary.registrations += regResult.affectedRows || 0;
            } catch (e) { console.warn(`[delete-category] registrations cleanup error:`, e.message); }

            // Delete from SCL courses table
            try {
                const [courseResult] = await db.execute('DELETE FROM courses WHERE moodle_course_id = ?', [moodleCourseId]);
                deletedSummary.courses += courseResult.affectedRows || 0;
            } catch (e) { console.warn(`[delete-category] courses cleanup error:`, e.message); }

            // Delete from moodle_course_mapping
            try {
                await db.execute('DELETE FROM moodle_course_mapping WHERE moodle_course_id = ?', [moodleCourseId]);
            } catch (e) { /* table may not exist */ }

            // Delete from course_lifecycle_master by course title/code
            try {
                const [masterResult] = await db.execute('DELETE FROM course_lifecycle_master WHERE course_title = ? OR course_code = ?', [courseTitle, courseShortname]);
                deletedSummary.lifecycleMaster = (deletedSummary.lifecycleMaster || 0) + (masterResult.affectedRows || 0);
            } catch (e) { console.warn(`[delete-category] lifecycle_master cleanup error:`, e.message); }

            // Delete the Moodle course itself
            try {
                await callMoodleRest('core_course_delete_courses', { 'courseids[0]': moodleCourseId });
                console.log(`[delete-category] Deleted Moodle course #${moodleCourseId} (${courseTitle}) via REST`);
            } catch (moodleErr) {
                console.warn(`[delete-category] REST course delete failed for #${moodleCourseId}, trying direct DB:`, moodleErr.message);
                try {
                    await moodleDbPool.execute('DELETE FROM mdl_course WHERE id = ?', [moodleCourseId]);
                    console.log(`[delete-category] Deleted Moodle course #${moodleCourseId} via direct DB`);
                } catch (dbErr) {
                    console.error(`[delete-category] Failed to delete Moodle course #${moodleCourseId}:`, dbErr.message);
                }
            }
        }

        // ── Delete categories bottom-up (deepest children first) ──
        const reversedCatIds = [...allCatIds].reverse();
        for (const catId of reversedCatIds) {
            try {
                await callMoodleRest('core_course_delete_categories', {
                    'categories[0][id]': catId,
                    'categories[0][recursive]': 0
                });
                deletedSummary.categories++;
                console.log(`[delete-category] Deleted Moodle category #${catId} via REST`);
            } catch (moodleErr) {
                console.warn(`[delete-category] REST category delete failed for #${catId}, trying direct DB:`, moodleErr.message);
                try {
                    await moodleDbPool.execute('DELETE FROM mdl_course_categories WHERE id = ?', [catId]);
                    deletedSummary.categories++;
                    console.log(`[delete-category] Deleted Moodle category #${catId} via direct DB`);
                } catch (dbErr) {
                    console.error(`[delete-category] Failed to delete category #${catId}:`, dbErr.message);
                }
            }

            // Clean up local category references
            try {
                await db.execute('DELETE FROM scl_local_categories WHERE moodle_category_id = ?', [catId]);
            } catch (e) { /* ignore */ }
        }

        // Final sweep: delete any course_lifecycle_master entries referencing deleted category IDs
        try {
            const placeholders = allCatIds.map(() => '?').join(',');
            await db.execute(
                `DELETE FROM course_lifecycle_master WHERE programme_type_category_id IN (${placeholders}) OR program_category_id IN (${placeholders}) OR year_category_id IN (${placeholders}) OR semester_category_id IN (${placeholders})`,
                [...allCatIds, ...allCatIds, ...allCatIds, ...allCatIds]
            );
        } catch (e) { console.warn(`[delete-category] lifecycle_master category sweep error:`, e.message); }

        const summary = `Deleted "${catName}": ${deletedSummary.categories} categories, ${allCourses.length} courses, ${deletedSummary.accreditations} accreditations, ${deletedSummary.visits} visits, ${deletedSummary.inductions} inductions, ${deletedSummary.registrations} registrations, ${deletedSummary.enrollments} enrollments`;
        console.log(`[delete-category] ${summary}`);

        return res.json({
            success: true,
            message: summary,
            data: { id: rawId, name: catName, ...deletedSummary, coursesDeleted: allCourses.length }
        });
    } catch (error) {
        console.error('[delete-category] ERROR:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
    }
});

// PUT /api/students/moodle/rename-category/:id
// Rename a Moodle category (or local SCL category) by updating the name directly in the DB
router.put('/moodle/rename-category/:id', async (req, res) => {
    try {
        const rawId = Number(req.params.id);
        const newName = String(req.body.name || '').trim();
        if (!rawId || !Number.isInteger(rawId)) {
            return res.status(400).json({ success: false, message: 'Invalid category ID' });
        }
        if (!newName) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        if (rawId < 0) {
            // Local SCL category
            const localId = Math.abs(rawId);
            await db.execute('UPDATE scl_local_categories SET name = ? WHERE id = ?', [newName, localId]);
            return res.json({ success: true, message: `Local category renamed to "${newName}"` });
        }

        // Moodle category — update directly in Moodle DB
        const moodleConn = await moodleDbPool.getConnection();
        try {
            await moodleConn.execute('UPDATE mdl_course_categories SET name = ? WHERE id = ?', [newName, rawId]);
        } finally {
            moodleConn.release();
        }

        // Cascade rename to local SCL course_lifecycle_master table
        // The category ID may be stored in any of the 4 level columns
        try {
            await db.execute('UPDATE course_lifecycle_master SET programme_type_name = ? WHERE programme_type_category_id = ?', [newName, rawId]);
            await db.execute('UPDATE course_lifecycle_master SET program_name = ? WHERE program_category_id = ?', [newName, rawId]);
            await db.execute('UPDATE course_lifecycle_master SET academic_year = ? WHERE year_category_id = ?', [newName, rawId]);
            await db.execute('UPDATE course_lifecycle_master SET semester_name = ? WHERE semester_category_id = ?', [newName, rawId]);
        } catch (localErr) {
            console.warn('[rename-category] Failed to cascade to course_lifecycle_master:', localErr.message);
        }

        console.log(`[rename-category] Category #${rawId} renamed to "${newName}"`);
        return res.json({ success: true, message: `Category renamed to "${newName}"` });
    } catch (error) {
        console.error('[rename-category] ERROR:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to rename category', error: error.message });
    }
});

// PUT /api/students/moodle/rename-course/:id
// Rename a Moodle course by updating fullname directly in the DB
router.put('/moodle/rename-course/:id', async (req, res) => {
    try {
        const courseId = Number(req.params.id);
        const newName = String(req.body.name || '').trim();
        if (!courseId || !Number.isInteger(courseId)) {
            return res.status(400).json({ success: false, message: 'Invalid course ID' });
        }
        if (!newName) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const moodleConn = await moodleDbPool.getConnection();
        let courseCode = null;
        try {
            await moodleConn.execute('UPDATE mdl_course SET fullname = ? WHERE id = ?', [newName, courseId]);
            // Get the shortname to cascade rename to local SCL tables
            const [codeRows] = await moodleConn.execute('SELECT shortname FROM mdl_course WHERE id = ?', [courseId]);
            courseCode = codeRows?.[0]?.shortname || null;
        } finally {
            moodleConn.release();
        }

        // Cascade rename to local SCL tables using course_code (shortname)
        if (courseCode) {
            try {
                await db.execute('UPDATE course_lifecycle_master SET course_title = ? WHERE course_code = ?', [newName, courseCode]);
                await db.execute('UPDATE course_accreditations SET course_title = ? WHERE course_code = ?', [newName, courseCode]);
                await db.execute('UPDATE course_visits SET course_title = ? WHERE course_code = ?', [newName, courseCode]);
                await db.execute('UPDATE course_inductions SET course_title = ? WHERE course_code = ?', [newName, courseCode]);
                await db.execute('UPDATE course_registrations SET course_title = ? WHERE course_code = ?', [newName, courseCode]);
            } catch (localErr) {
                console.warn('[rename-course] Failed to cascade to local tables:', localErr.message);
            }
        }

        console.log(`[rename-course] Course #${courseId} renamed to "${newName}"`);
        return res.json({ success: true, message: `Course renamed to "${newName}"` });
    } catch (error) {
        console.error('[rename-course] ERROR:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to rename course', error: error.message });
    }
});

router.get('/moodle/courses-by-structure', async (req, res) => {
    try {
        const normalizeLocal = (value) => String(value || '').trim().toLowerCase();
        const parseNullableInt = (value) => {
            const parsed = Number(value);
            return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
        };

        const programmeTypeName = String(req.query.programme_type_name || '').trim();
        const programName = String(req.query.program_name || '').trim();
        const academicYear = String(req.query.academic_year || '').trim();
        const semesterName = String(req.query.semester_name || '').trim();

        const semesterCategoryId = parseNullableInt(req.query.semester_category_id);
        const yearCategoryId = parseNullableInt(req.query.year_category_id);
        const programCategoryId = parseNullableInt(req.query.program_category_id);
        const programmeTypeCategoryId = parseNullableInt(req.query.programme_type_category_id);

        const rootCategoryId = semesterCategoryId || yearCategoryId || programCategoryId || programmeTypeCategoryId;
        const seen = new Set();
        const courses = [];
        if (rootCategoryId) {
            const [categoryRows] = await moodleDbPool.execute(
                `SELECT id
                   FROM mdl_course_categories
                  WHERE id = ?
                     OR path LIKE ?
                     OR path LIKE ?`,
                [rootCategoryId, `%/${rootCategoryId}/%`, `%/${rootCategoryId}`]
            );

            const categoryIds = (categoryRows || []).map((row) => Number(row.id)).filter((id) => Number.isInteger(id) && id > 0);
            if (categoryIds.length) {
                const placeholders = categoryIds.map(() => '?').join(', ');
                const [courseRows] = await moodleDbPool.execute(
                    `SELECT c.id, c.fullname, c.shortname, c.idnumber, c.category, c.visible,
                            cc.name AS category_name
                       FROM mdl_course c
                       LEFT JOIN mdl_course_categories cc ON cc.id = c.category
                      WHERE c.id <> 1
                        AND COALESCE(c.visible, 1) = 1
                        AND c.category IN (${placeholders})
                      ORDER BY c.fullname ASC, c.shortname ASC`,
                    categoryIds
                );

                for (const row of courseRows || []) {
                    const title = String(row.fullname || '').trim();
                    if (!title) continue;
                    const code = String(row.idnumber || row.shortname || '').trim() || `CRS-${row.id}`;
                    const key = `${normalizeLocal(title)}|${normalizeLocal(code)}`;
                    if (seen.has(key)) continue;
                    seen.add(key);

                    courses.push({
                        id: Number(row.id),
                        course_title: title,
                        course_code: code,
                        moodle_course_id: Number(row.id),
                        category_id: Number(row.category),
                        category_name: String(row.category_name || '').trim()
                    });
                }
            }
        }

        // If subtree has no courses, fallback to fuzzy Moodle search using selected structure text.
        if (!courses.length) {
            const [allCourseRows] = await moodleDbPool.execute(
                `SELECT c.id, c.fullname, c.shortname, c.idnumber, c.category, c.visible,
                        cc.name AS category_name
                   FROM mdl_course c
                   LEFT JOIN mdl_course_categories cc ON cc.id = c.category
                  WHERE c.id <> 1
                    AND COALESCE(c.visible, 1) = 1`
            );

            const typeName = programmeTypeName.toLowerCase();
            const typeAbbrev = typeName.replace(/[^a-z]/g, '').slice(0, 3);
            const programTokens = programName
                .toLowerCase()
                .split(/[^a-z0-9]+/)
                .filter((token) => token.length >= 4);
            const yearMatch = academicYear.match(/\d+/);
            const semMatch = semesterName.match(/\d+/);
            const yearNum = yearMatch ? yearMatch[0] : '';
            const semNum = semMatch ? semMatch[0] : '';

            const scored = [];
            for (const row of allCourseRows || []) {
                const title = String(row.fullname || '').trim();
                if (!title) continue;
                const code = String(row.idnumber || row.shortname || '').trim() || `CRS-${row.id}`;
                const hay = `${title} ${code} ${String(row.category_name || '')}`.toLowerCase();

                let score = 0;
                if (typeName && hay.includes(typeName)) score += 3;
                if (typeAbbrev && hay.includes(typeAbbrev)) score += 3;
                for (const token of programTokens) {
                    if (hay.includes(token)) score += 2;
                }
                if (yearNum && (hay.includes(`y${yearNum}`) || hay.includes(`year ${yearNum}`) || hay.includes(`l${Number(yearNum) + 3}`) || hay.includes(`level ${Number(yearNum) + 3}`))) {
                    score += 1;
                }
                if (semNum && (hay.includes(`s${semNum}`) || hay.includes(`semester ${semNum}`) || hay.includes(`sem-${semNum}`))) {
                    score += 1;
                }

                if (score <= 0) continue;
                scored.push({
                    score,
                    row: {
                        id: Number(row.id),
                        course_title: title,
                        course_code: code,
                        moodle_course_id: Number(row.id),
                        category_id: Number(row.category),
                        category_name: String(row.category_name || '').trim()
                    }
                });
            }

            scored.sort((a, b) => b.score - a.score || a.row.course_title.localeCompare(b.row.course_title));
            for (const item of scored.slice(0, 120)) {
                const key = `${normalizeLocal(item.row.course_title)}|${normalizeLocal(item.row.course_code)}`;
                if (seen.has(key)) continue;
                seen.add(key);
                courses.push(item.row);
            }

            // Final safety fallback: provide active Moodle courses so client-side typing can still find matches.
            if (!courses.length) {
                for (const row of allCourseRows || []) {
                    const title = String(row.fullname || '').trim();
                    if (!title) continue;
                    const code = String(row.idnumber || row.shortname || '').trim() || `CRS-${row.id}`;
                    const key = `${normalizeLocal(title)}|${normalizeLocal(code)}`;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    courses.push({
                        id: Number(row.id),
                        course_title: title,
                        course_code: code,
                        moodle_course_id: Number(row.id),
                        category_id: Number(row.category),
                        category_name: String(row.category_name || '').trim()
                    });
                    if (courses.length >= 200) break;
                }
            }
        }

        return res.json({ success: true, data: { courses } });
    } catch (error) {
        console.error('Error fetching Moodle courses by structure:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch Moodle courses', error: error.message });
    }
});

router.post('/course-registrations', async (req, res) => {
    try {
        const payload = normalizeCourseRegistrationPayload(req.body || {});
        if (!payload.course_title || !payload.course_code) {
            return res.status(400).json({ success: false, message: 'Course Title and Course Code / ID are required' });
        }

        const gateCheck = await ensureRegistrationGateFromInduction(payload.course_code, payload.course_title);
        if (!gateCheck.allowed) {
            return res.status(403).json({ success: false, message: gateCheck.message });
        }

        // Check for duplicate cohort intake for this course
        if (payload.cohort_label) {
            const [duplicateRows] = await db.execute(
                `SELECT id, cohort_label FROM course_registrations 
                 WHERE course_code = ? AND cohort_label = ? AND application_status != 'rejected'
                 LIMIT 1`,
                [payload.course_code, payload.cohort_label]
            );

            if (duplicateRows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: `A cohort with intake period "${payload.cohort_label}" already exists for this course. Please select a different intake period or edit the existing cohort.`,
                    duplicate_registration_id: duplicateRows[0].id
                });
            }
        }

        const [result] = await db.execute(
            `INSERT INTO course_registrations (
                intake_id, course_title, course_code, programme_type_name, program_name, academic_year, semester_name, cohort_label, programme_type_category_id, program_category_id, year_category_id, semester_category_id, cohort_category_id, course_type, awarding_body_accreditation, regulation_level,
                mode_of_delivery, start_date, end_date_or_duration, subject_area_discipline,
                course_description, learning_outcomes, units_modules_covered, assessment_methods,
                entry_requirements, tuition_fee_gbp, additional_costs, funding_options,
                learning_resources_provided, special_equipment_needed, work_placement_included,
                course_leader_programme_director, internal_verification_contact, ukvi_approved_course,
                approval_date, review_date, special_admission_considerations, progression_opportunities,
                industry_partnerships, application_status, moodle_sync_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                payload.intake_id || null,
                payload.course_title,
                payload.course_code,
                payload.programme_type_name,
                payload.program_name,
                payload.academic_year,
                payload.semester_name,
                payload.cohort_label,
                payload.programme_type_category_id,
                payload.program_category_id,
                payload.year_category_id,
                payload.semester_category_id,
                payload.cohort_category_id,
                payload.course_type,
                payload.awarding_body_accreditation,
                payload.regulation_level,
                payload.mode_of_delivery,
                payload.start_date,
                payload.end_date_or_duration,
                payload.subject_area_discipline,
                payload.course_description,
                payload.learning_outcomes,
                payload.units_modules_covered,
                payload.assessment_methods,
                payload.entry_requirements,
                payload.tuition_fee_gbp,
                payload.additional_costs,
                payload.funding_options,
                payload.learning_resources_provided,
                payload.special_equipment_needed,
                payload.work_placement_included,
                payload.course_leader_programme_director,
                payload.internal_verification_contact,
                payload.ukvi_approved_course,
                payload.approval_date,
                payload.review_date,
                payload.special_admission_considerations,
                payload.progression_opportunities,
                payload.industry_partnerships,
                payload.application_status
            ]
        );

        const registrationId = Number(result.insertId);
        const registrationReference = `CRS-${String(registrationId).padStart(6, '0')}`;
        await db.execute('UPDATE course_registrations SET registration_reference = ? WHERE id = ?', [registrationReference, registrationId]);

        let moodleSync = null;
        const shouldSyncNow = Boolean(req.body?.sync_to_moodle) || payload.application_status === 'approved';
        if (shouldSyncNow) {
            moodleSync = await syncCourseRegistrationToMoodle(registrationId);
        }

        const [rows] = await db.execute('SELECT * FROM course_registrations WHERE id = ? LIMIT 1', [registrationId]);
        return res.status(201).json({
            success: true,
            message: shouldSyncNow ? 'Course registration submitted and Moodle sync attempted' : 'Course registration submitted successfully',
            data: {
                registration: rows[0],
                moodle_sync: moodleSync
            }
        });
    } catch (error) {
        console.error('Error creating course registration:', error);
        return res.status(500).json({ success: false, message: 'Failed to submit course registration', error: error.message });
    }
});

router.put('/course-registrations/:id', async (req, res) => {
    try {
        const registrationId = Number(req.params.id);
        if (!Number.isInteger(registrationId) || registrationId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid course registration ID' });
        }

        const payload = normalizeCourseRegistrationPayload(req.body || {});
        if (!payload.course_title || !payload.course_code) {
            return res.status(400).json({ success: false, message: 'Course Title and Course Code / ID are required' });
        }

        const [existingRows] = await db.execute('SELECT * FROM course_registrations WHERE id = ? LIMIT 1', [registrationId]);
        if (!existingRows || existingRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Course registration not found' });
        }

        // Skip induction gate for existing cohort registrations (intake_id set means created via intake system)
        if (!existingRows[0].intake_id) {
            const gateCheck = await ensureRegistrationGateFromInduction(payload.course_code, payload.course_title);
            if (!gateCheck.allowed) {
                return res.status(403).json({ success: false, message: gateCheck.message });
            }
        }

        const shouldSyncNow = Boolean(req.body?.sync_to_moodle) || payload.application_status === 'approved';
        const nextSyncStatus = shouldSyncNow ? 'pending' : (existingRows[0].moodle_sync_status || 'pending');

        await db.execute(
            `UPDATE course_registrations
             SET course_title = ?,
                 course_code = ?,
                 programme_type_name = ?,
                 program_name = ?,
                 academic_year = ?,
                 semester_name = ?,
                 cohort_label = ?,
                 programme_type_category_id = ?,
                 program_category_id = ?,
                 year_category_id = ?,
                 semester_category_id = ?,
                 cohort_category_id = ?,
                 course_type = ?,
                 awarding_body_accreditation = ?,
                 regulation_level = ?,
                 mode_of_delivery = ?,
                 start_date = ?,
                 end_date_or_duration = ?,
                 subject_area_discipline = ?,
                 course_description = ?,
                 learning_outcomes = ?,
                 units_modules_covered = ?,
                 assessment_methods = ?,
                 entry_requirements = ?,
                 tuition_fee_gbp = ?,
                 additional_costs = ?,
                 funding_options = ?,
                 learning_resources_provided = ?,
                 special_equipment_needed = ?,
                 work_placement_included = ?,
                 course_leader_programme_director = ?,
                 internal_verification_contact = ?,
                 ukvi_approved_course = ?,
                 approval_date = ?,
                 review_date = ?,
                 special_admission_considerations = ?,
                 progression_opportunities = ?,
                 industry_partnerships = ?,
                 application_status = ?,
                 moodle_sync_status = ?
             WHERE id = ?`,
            [
                payload.course_title,
                payload.course_code,
                payload.programme_type_name,
                payload.program_name,
                payload.academic_year,
                payload.semester_name,
                payload.cohort_label,
                payload.programme_type_category_id,
                payload.program_category_id,
                payload.year_category_id,
                payload.semester_category_id,
                payload.cohort_category_id,
                payload.course_type,
                payload.awarding_body_accreditation,
                payload.regulation_level,
                payload.mode_of_delivery,
                payload.start_date,
                payload.end_date_or_duration,
                payload.subject_area_discipline,
                payload.course_description,
                payload.learning_outcomes,
                payload.units_modules_covered,
                payload.assessment_methods,
                payload.entry_requirements,
                payload.tuition_fee_gbp,
                payload.additional_costs,
                payload.funding_options,
                payload.learning_resources_provided,
                payload.special_equipment_needed,
                payload.work_placement_included,
                payload.course_leader_programme_director,
                payload.internal_verification_contact,
                payload.ukvi_approved_course,
                payload.approval_date,
                payload.review_date,
                payload.special_admission_considerations,
                payload.progression_opportunities,
                payload.industry_partnerships,
                payload.application_status,
                nextSyncStatus,
                registrationId
            ]
        );

        let moodleSync = null;
        if (shouldSyncNow) {
            moodleSync = await syncCourseRegistrationToMoodle(registrationId);
        }

        const [rows] = await db.execute('SELECT * FROM course_registrations WHERE id = ? LIMIT 1', [registrationId]);
        return res.json({
            success: true,
            message: shouldSyncNow ? 'Course registration updated and Moodle sync attempted' : 'Course registration updated successfully',
            data: {
                registration: rows[0],
                moodle_sync: moodleSync
            }
        });
    } catch (error) {
        console.error('Error updating course registration:', error);
        return res.status(500).json({ success: false, message: 'Failed to update course registration', error: error.message });
    }
});

router.get('/course-registrations', async (req, res) => {
    try {
        const { status, sync_status, search } = req.query;
        const conditions = ['1 = 1'];
        const values = [];

        if (status && status !== 'all') {
            conditions.push('application_status = ?');
            values.push(status);
        }

        if (sync_status && sync_status !== 'all') {
            conditions.push('moodle_sync_status = ?');
            values.push(sync_status);
        }

        if (search) {
            conditions.push('(course_title LIKE ? OR course_code LIKE ? OR registration_reference LIKE ? OR awarding_body_accreditation LIKE ?)');
            const q = `%${search}%`;
            values.push(q, q, q, q);
        }

        const [rows] = await db.execute(
            `SELECT * FROM course_registrations WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
            values
        );

        return res.json({ success: true, data: { registrations: rows } });
    } catch (error) {
        console.error('Error listing course registrations:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch course registrations', error: error.message });
    }
});

router.get('/course-registrations/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM course_registrations WHERE id = ? LIMIT 1', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Course registration not found' });
        }
        return res.json({ success: true, data: { registration: rows[0] } });
    } catch (error) {
        console.error('Error fetching course registration:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch course registration', error: error.message });
    }
});

router.get('/course-lifecycle/dashboard', async (req, res) => {
    try {
        // Get course lifecycle data directly from Moodle category hierarchy
        // Walks up to 4 levels: Programme Type → Programme → Year → Semester → Course
        const lifecycleCourses = await safeMoodleSelectRows(`
            SELECT
                c.id        AS course_id,
                c.fullname  AS course_name,
                c.shortname AS course_code,
                CASE
                    WHEN cat4.id IS NOT NULL THEN cat4.name
                    WHEN cat3.id IS NOT NULL THEN cat3.name
                    WHEN cat2.id IS NOT NULL THEN cat2.name
                    ELSE cat1.name
                END AS programme_type_name,
                CASE
                    WHEN cat4.id IS NOT NULL THEN cat3.name
                    WHEN cat3.id IS NOT NULL THEN cat2.name
                    WHEN cat2.id IS NOT NULL THEN cat1.name
                    ELSE NULL
                END AS program_name,
                CASE
                    WHEN cat4.id IS NOT NULL THEN cat2.name
                    WHEN cat3.id IS NOT NULL THEN cat1.name
                    ELSE NULL
                END AS academic_year,
                CASE
                    WHEN cat4.id IS NOT NULL THEN cat1.name
                    ELSE NULL
                END AS semester_name
            FROM mdl_course c
            JOIN mdl_course_categories cat1 ON c.category = cat1.id
            LEFT JOIN mdl_course_categories cat2 ON cat1.parent = cat2.id AND cat1.parent != 0
            LEFT JOIN mdl_course_categories cat3 ON cat2.parent = cat3.id AND cat2.parent != 0
            LEFT JOIN mdl_course_categories cat4 ON cat3.parent = cat4.id AND cat3.parent != 0
            WHERE c.id != 1
              AND cat1.depth = 4
              AND COALESCE(cat1.visible, 1) = 1
              AND COALESCE(cat2.visible, 1) = 1
              AND COALESCE(cat3.visible, 1) = 1
              AND COALESCE(cat4.visible, 1) = 1
            ORDER BY programme_type_name, program_name, academic_year, semester_name
        `);
        
        // Get course lifecycle master from SCL database (not Moodle)
        const lifecycleMaster = await safeSelectRows('SELECT * FROM course_lifecycle_master ORDER BY updated_at DESC, created_at DESC');
        
        // ALSO fetch from SCL's local categories to show newly created hierarchy items
        const localCategories = await safeSelectRows('SELECT * FROM scl_local_categories ORDER BY level, name').catch(() => []);
        
        const accreditations = await safeSelectRows('SELECT * FROM course_accreditations ORDER BY updated_at DESC, created_at DESC');
        const visits = await safeSelectRows('SELECT * FROM course_visits ORDER BY updated_at DESC, created_at DESC');
        const inductions = await safeSelectRows('SELECT * FROM course_inductions ORDER BY updated_at DESC, created_at DESC');
        const registrations = await safeSelectRows('SELECT * FROM course_registrations ORDER BY updated_at DESC, created_at DESC');

        const courseMap = new Map();

        const ensureCourseRow = (courseCode, courseTitle) => {
            const key = buildCourseLifecycleKey(courseCode, courseTitle);
            if (!courseMap.has(key)) {
                const normalizedTitle = normalizeCourseTitle(courseTitle);
                const incomingCode = String(courseCode || '').trim();
                // Only merge by title when at least one side has no course code
                const existingByTitle = normalizedTitle
                    ? Array.from(courseMap.values()).find((row) => {
                        if (normalizeCourseTitle(row.course_title) !== normalizedTitle) return false;
                        // If both have distinct course codes, they are different courses
                        if (row.course_code && incomingCode && row.course_code !== incomingCode) return false;
                        return true;
                    })
                    : null;

                if (existingByTitle) {
                    if (!existingByTitle.course_code && incomingCode) {
                        existingByTitle.course_code = incomingCode;
                    }
                    return existingByTitle;
                }

                courseMap.set(key, {
                    lifecycle_key: key,
                    master_id: null,
                    moodle_course_id: null,
                    course_code: String(courseCode || '').trim(),
                    course_title: String(courseTitle || '').trim() || 'Untitled Course',
                    programme_type_name: null,
                    program_name: null,
                    academic_year: null,
                    semester_name: null,
                    awarding_body: null,
                    qualification_level: null,
                    application_type: null,
                    course_type: null,
                    document_owner: null,
                    lead_coordinator: null,
                    version: null,
                    accreditation_id: null,
                    visit_id: null,
                    induction_id: null,
                    registration_id: null,
                    accreditation_status: 'not_started',
                    visit_status: 'not_started',
                    induction_status: 'not_started',
                    registration_status: 'not_started',
                    accreditation_raw_status: null,
                    visit_raw_status: null,
                    induction_raw_status: null,
                    registration_raw_status: null,
                    accreditation_created_at: null,
                    visit_created_at: null,
                    induction_created_at: null,
                    registration_created_at: null,
                    entry_created_at: null,
                    accreditation_updated_at: null,
                    visit_updated_at: null,
                    induction_updated_at: null,
                    registration_updated_at: null,
                    last_updated_at: null
                });
            }
            return courseMap.get(key);
        };

        // Helper: program-level codes like HND-001, DEG-001 have ≤2 dash-separated parts.
        // These are Programme/Course categories, not Subject courses — skip creating courseMap entries for them.
        const isProgramLevelCode = (code) => {
            const s = String(code || '').trim();
            return s.length > 0 && s.split('-').length <= 2;
        };

        // Populate from Moodle category hierarchy first
        for (const course of lifecycleCourses) {
            const item = ensureCourseRow(course.course_code, course.course_name);
            item.moodle_course_id = course.course_id || item.moodle_course_id;
            item.course_type = course.course_type || item.course_type;
            item.programme_type_name = (course.programme_type_name || '').trim() || item.programme_type_name;
            item.program_name = (course.program_name || '').trim() || item.program_name;
            item.academic_year = (course.academic_year || '').trim() || item.academic_year;
            item.semester_name = (course.semester_name || '').trim() || item.semester_name;
            item.entry_created_at = new Date().toISOString();
        }

        // Merge data from course_lifecycle_master
        for (const master of lifecycleMaster) {
            const courseTitle = master.course_name || master.course_title;
            const item = ensureCourseRow(master.course_code, courseTitle);
            item.master_id = master.id || item.master_id;
            item.programme_type_name = master.programme_type_name || item.programme_type_name;
            item.program_name = master.program_name || item.program_name;
            item.academic_year = master.academic_year || item.academic_year;
            item.semester_name = master.semester_name || item.semester_name;
            item.awarding_body = master.awarding_body || item.awarding_body;
            item.qualification_level = master.qualification_level || item.qualification_level;
            item.application_type = master.application_type || item.application_type;
            item.course_type = master.course_type || item.course_type;
            item.document_owner = master.document_owner || item.document_owner;
            item.lead_coordinator = master.lead_coordinator || item.lead_coordinator;
            item.version = master.version || item.version;
            item.entry_created_at = minDate(item.entry_created_at, master.created_at || null);
            if (master.accreditation_id && !item.accreditation_id) {
                item.accreditation_id = master.accreditation_id;
            }
        }

        for (const row of accreditations) {
            if (isProgramLevelCode(row.course_code)) continue; // skip program-level accreditations
            const item = ensureCourseRow(row.course_code, row.course_title);
            if (!item.accreditation_id || item.accreditation_id === row.id) {
                item.accreditation_id = row.id;
                item.accreditation_status = toLifecycleStatus(row.overall_status, row.completion_percentage);
                item.accreditation_raw_status = row.overall_status || null;
                item.accreditation_created_at = row.created_at || null;
                item.entry_created_at = minDate(item.entry_created_at, item.accreditation_created_at);
                item.accreditation_updated_at = row.updated_at || row.created_at || null;
                item.last_updated_at = maxDate(item.last_updated_at, item.accreditation_updated_at);
            }
        }

        for (const row of visits) {
            if (isProgramLevelCode(row.course_code)) continue; // skip program-level visits
            const item = ensureCourseRow(row.course_code, row.course_title);
            if (!item.visit_id || item.visit_id === row.id) {
                item.visit_id = row.id;
                item.visit_status = toLifecycleStatus(row.overall_status, row.completion_percentage);
                item.visit_raw_status = row.overall_status || null;
                item.visit_created_at = row.created_at || null;
                item.entry_created_at = minDate(item.entry_created_at, item.visit_created_at);
                item.visit_updated_at = row.updated_at || row.created_at || null;
                item.last_updated_at = maxDate(item.last_updated_at, item.visit_updated_at);
            }
        }

        for (const row of inductions) {
            if (isProgramLevelCode(row.course_code)) continue; // skip program-level inductions
            const item = ensureCourseRow(row.course_code, row.course_title);
            if (!item.induction_id || item.induction_id === row.id) {
                item.induction_id = row.id;
                item.induction_status = toLifecycleStatus(row.overall_status, row.completion_percentage);
                item.induction_raw_status = row.overall_status || null;
                item.induction_created_at = row.created_at || null;
                item.entry_created_at = minDate(item.entry_created_at, item.induction_created_at);
                item.induction_updated_at = row.updated_at || row.created_at || null;
                item.last_updated_at = maxDate(item.last_updated_at, item.induction_updated_at);
            }
        }

        for (const row of registrations) {
            if (isProgramLevelCode(row.course_code)) continue; // skip program-level registrations in subject dashboard
            const item = ensureCourseRow(row.course_code, row.course_title);
            if (!item.registration_id || item.registration_id === row.id) {
                item.registration_id = row.id;
                item.registration_status = toRegistrationLifecycleStatus(row.application_status, row.moodle_sync_status);
                item.registration_raw_status = row.application_status || null;
                item.registration_created_at = row.created_at || null;
                item.entry_created_at = minDate(item.entry_created_at, item.registration_created_at);
                item.registration_updated_at = row.updated_at || row.created_at || null;
                item.last_updated_at = maxDate(item.last_updated_at, item.registration_updated_at);
            }
        }

        const courses = Array.from(courseMap.values())
            .sort((a, b) => new Date(b.entry_created_at || 0).getTime() - new Date(a.entry_created_at || 0).getTime());

        const summary = {
            total_courses: courses.length,
            accreditation_completed: courses.filter((row) => ['completed', 'approved'].includes(row.accreditation_status)).length,
            visit_completed: courses.filter((row) => ['completed', 'approved'].includes(row.visit_status)).length,
            induction_completed: courses.filter((row) => ['completed', 'approved'].includes(row.induction_status)).length,
            registration_completed: courses.filter((row) => ['completed', 'approved'].includes(row.registration_status)).length,
            fully_active: courses.filter((row) => ['completed', 'approved'].includes(row.accreditation_status) && ['completed', 'approved'].includes(row.visit_status) && ['completed', 'approved'].includes(row.induction_status) && ['completed', 'approved'].includes(row.registration_status)).length
        };

        return res.json({ success: true, data: { courses, summary } });
    } catch (error) {
        console.error('Error fetching course lifecycle dashboard:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch course lifecycle dashboard', error: error.message });
    }
});

router.get('/programme-lifecycle-status', async (req, res) => {
    try {
        const rows = await safeSelectRows(`
            SELECT
                pi.programme_type_name,
                pi.program_name,
                ca.id AS accreditation_id,
                ca.overall_status AS accreditation_raw_status,
                ca.completion_percentage AS accreditation_pct,
                cv.id AS visit_id,
                cv.overall_status AS visit_raw_status,
                cv.completion_percentage AS visit_pct,
                ci.id AS induction_id,
                ci.overall_status AS induction_raw_status,
                ci.completion_percentage AS induction_pct,
                cr.id AS registration_id,
                cr.application_status AS registration_raw_status,
                cr.moodle_sync_status AS registration_sync_status
            FROM (
                SELECT DISTINCT programme_type_name, program_name
                FROM programme_intakes
                WHERE program_name IS NOT NULL AND program_name != ''
            ) pi
            LEFT JOIN (
                SELECT course_title, id, overall_status, completion_percentage
                FROM course_accreditations
                WHERE id IN (
                    SELECT MAX(id) FROM course_accreditations
                    WHERE course_title IS NOT NULL AND course_title != ''
                    GROUP BY course_title
                )
            ) ca ON ca.course_title COLLATE utf8mb4_unicode_ci = pi.program_name
            LEFT JOIN (
                SELECT course_title, id, overall_status, completion_percentage
                FROM course_visits
                WHERE id IN (
                    SELECT MAX(id) FROM course_visits
                    WHERE course_title IS NOT NULL AND course_title != ''
                    GROUP BY course_title
                )
            ) cv ON cv.course_title COLLATE utf8mb4_unicode_ci = pi.program_name
            LEFT JOIN (
                SELECT course_title, id, overall_status, completion_percentage
                FROM course_inductions
                WHERE id IN (
                    SELECT MAX(id) FROM course_inductions
                    WHERE course_title IS NOT NULL AND course_title != ''
                    GROUP BY course_title
                )
            ) ci ON ci.course_title COLLATE utf8mb4_unicode_ci = pi.program_name
            LEFT JOIN (
                SELECT program_name, id, application_status, moodle_sync_status
                FROM course_registrations
                WHERE id IN (
                    SELECT MAX(id) FROM course_registrations
                    WHERE program_name IS NOT NULL AND program_name != ''
                    GROUP BY program_name
                )
            ) cr ON cr.program_name COLLATE utf8mb4_unicode_ci = pi.program_name
            ORDER BY pi.programme_type_name, pi.program_name
        `);

        const result = rows.map(row => ({
            programme_type_name: row.programme_type_name,
            program_name: row.program_name,
            accreditation_id: row.accreditation_id || null,
            accreditation_status: toLifecycleStatus(row.accreditation_raw_status, row.accreditation_pct),
            visit_id: row.visit_id || null,
            visit_status: toLifecycleStatus(row.visit_raw_status, row.visit_pct),
            induction_id: row.induction_id || null,
            induction_status: toLifecycleStatus(row.induction_raw_status, row.induction_pct),
            registration_id: row.registration_id || null,
            registration_status: toRegistrationLifecycleStatus(row.registration_raw_status, row.registration_sync_status)
        }));

        return res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error fetching programme lifecycle status:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch programme lifecycle status' });
    }
});

router.get('/course-lifecycle/details', async (req, res) => {
    try {
        const normalizedCode = String(req.query.course_code || '').trim();
        const normalizedTitle = String(req.query.course_title || '').trim();

        if (!normalizedCode && !normalizedTitle) {
            return res.status(400).json({ success: false, message: 'course_code or course_title is required' });
        }

        const findWhere = [];
        const values = [];

        if (normalizedCode) {
            findWhere.push('course_code = ?');
            values.push(normalizedCode);
        }
        if (normalizedTitle) {
            findWhere.push('course_title = ?');
            values.push(normalizedTitle);
        }

        const whereClause = findWhere.length > 0 ? `WHERE ${findWhere.join(' OR ')}` : '';

        const accreditationRows = await safeSelectRows(
            `SELECT * FROM course_accreditations ${whereClause} ORDER BY updated_at DESC, created_at DESC LIMIT 1`,
            values
        );
        const accreditation = accreditationRows[0] || null;

        const visitRows = await safeSelectRows(
            `SELECT * FROM course_visits ${whereClause} ORDER BY updated_at DESC, created_at DESC LIMIT 1`,
            values
        );
        const visit = visitRows[0] || null;

        const inductionRows = await safeSelectRows(
            `SELECT * FROM course_inductions ${whereClause} ORDER BY updated_at DESC, created_at DESC LIMIT 1`,
            values
        );
        const induction = inductionRows[0] || null;

        const registrationRows = await safeSelectRows(
            `SELECT * FROM course_registrations ${whereClause} ORDER BY updated_at DESC, created_at DESC LIMIT 1`,
            values
        );
        const registration = registrationRows[0] || null;

        let tasks = [];
        let accreditationRisks = [];
        let accreditationSignoffs = [];
        if (accreditation?.id) {
            tasks = await safeSelectRows('SELECT * FROM accreditation_tasks WHERE accreditation_id = ? ORDER BY section_number, id', [accreditation.id]);
            accreditationRisks = await safeSelectRows('SELECT * FROM accreditation_risks WHERE accreditation_id = ? ORDER BY id DESC', [accreditation.id]);
            accreditationSignoffs = await safeSelectRows('SELECT * FROM accreditation_signoffs WHERE accreditation_id = ? ORDER BY id DESC', [accreditation.id]);
        }

        let requirements = [];
        let conditions = [];
        let inductionRisks = [];
        let inductionSignoffs = [];
        if (induction?.id) {
            requirements = await safeSelectRows('SELECT * FROM induction_requirements WHERE induction_id = ? ORDER BY section_number, id', [induction.id]);
            conditions = await safeSelectRows('SELECT * FROM induction_conditions WHERE induction_id = ? ORDER BY id DESC', [induction.id]);
            inductionRisks = await safeSelectRows('SELECT * FROM induction_risks WHERE induction_id = ? ORDER BY id DESC', [induction.id]);
            inductionSignoffs = await safeSelectRows('SELECT * FROM induction_signoffs WHERE induction_id = ? ORDER BY id DESC', [induction.id]);
        }

        return res.json({
            success: true,
            data: {
                accreditation: {
                    document: accreditation,
                    tasks,
                    risks: accreditationRisks,
                    signoffs: accreditationSignoffs
                },
                visit: {
                    document: visit
                },
                induction: {
                    document: induction,
                    requirements,
                    conditions,
                    risks: inductionRisks,
                    signoffs: inductionSignoffs
                },
                registration: {
                    document: registration
                }
            }
        });
    } catch (error) {
        console.error('Error fetching lifecycle details:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch lifecycle details', error: error.message });
    }
});

router.delete('/course-lifecycle/delete', async (req, res) => {
    try {
        const courseCode = String(req.body.course_code || '').trim();
        const courseTitle = String(req.body.course_title || '').trim();

        if (!courseCode && !courseTitle) {
            return res.status(400).json({ success: false, message: 'course_code or course_title is required' });
        }

        const safeMoodleDelete = async (query, params = []) => {
            try {
                const [result] = await moodleDbPool.execute(query, params);
                return result;
            } catch (error) {
                if (error && (error.code === 'ER_NO_SUCH_TABLE' || String(error.message || '').includes("doesn't exist"))) {
                    return { affectedRows: 0 };
                }
                throw error;
            }
        };

        const safeMoodleSelectRows = async (query, params = []) => {
            try {
                const [rows] = await moodleDbPool.execute(query, params);
                return rows;
            } catch (error) {
                if (error && (error.code === 'ER_NO_SUCH_TABLE' || String(error.message || '').includes("doesn't exist"))) {
                    return [];
                }
                throw error;
            }
        };

        // Delete from Moodle first
        const moodleWhere = [];
        const moodleValues = [];
        if (courseCode) {
            moodleWhere.push('(shortname = ? OR idnumber = ?)');
            moodleValues.push(courseCode, courseCode);
        }
        if (courseTitle) {
            moodleWhere.push('fullname = ?');
            moodleValues.push(courseTitle);
        }

        let moodleCoursesDeleted = 0;
        let moodleCategoriesDeleted = 0;
        if (moodleWhere.length > 0) {
            const [moodleCourseRows] = await moodleDbPool.execute(
                `SELECT id FROM mdl_course WHERE id > 1 AND (${moodleWhere.join(' OR ')})`,
                moodleValues
            );

            for (const row of moodleCourseRows) {
                const moodleCourseId = Number(row.id);
                if (!moodleCourseId) continue;

                const categoryRows = await safeMoodleSelectRows(
                    'SELECT category FROM mdl_course WHERE id = ? LIMIT 1',
                    [moodleCourseId]
                );
                const courseCategoryId = Number(categoryRows[0]?.category || 0);

                await safeMoodleDelete(
                    `DELETE FROM mdl_role_assignments
                     WHERE contextid IN (
                        SELECT id FROM (
                            SELECT id FROM mdl_context WHERE contextlevel = 50 AND instanceid = ?
                        ) c
                     )`,
                    [moodleCourseId]
                );
                await safeMoodleDelete('DELETE FROM mdl_course_modules_completion WHERE coursemoduleid IN (SELECT id FROM (SELECT id FROM mdl_course_modules WHERE course = ?) cm)', [moodleCourseId]);
                await safeMoodleDelete('DELETE FROM mdl_course_modules_viewed WHERE coursemoduleid IN (SELECT id FROM (SELECT id FROM mdl_course_modules WHERE course = ?) cmv)', [moodleCourseId]);
                await safeMoodleDelete('DELETE FROM mdl_course_completions WHERE course = ?', [moodleCourseId]);
                await safeMoodleDelete('DELETE FROM mdl_grade_items WHERE courseid = ?', [moodleCourseId]);
                await safeMoodleDelete('DELETE FROM mdl_grade_categories WHERE courseid = ?', [moodleCourseId]);
                await safeMoodleDelete('DELETE FROM mdl_enrol WHERE courseid = ?', [moodleCourseId]);
                await safeMoodleDelete('DELETE FROM mdl_course_modules WHERE course = ?', [moodleCourseId]);
                await safeMoodleDelete('DELETE FROM mdl_course_sections WHERE course = ?', [moodleCourseId]);
                await safeMoodleDelete('DELETE FROM mdl_course_format_options WHERE courseid = ?', [moodleCourseId]);
                await safeMoodleDelete('DELETE FROM mdl_context WHERE contextlevel = 50 AND instanceid = ?', [moodleCourseId]);
                const deleteCourseResult = await safeMoodleDelete('DELETE FROM mdl_course WHERE id = ? AND id > 1', [moodleCourseId]);
                if (deleteCourseResult && deleteCourseResult.affectedRows) {
                    moodleCoursesDeleted += deleteCourseResult.affectedRows;
                    console.log(`✓ Deleted Moodle course ID: ${moodleCourseId}`);

                    if (courseCategoryId > 1) {
                        const targetCategoryRows = await safeMoodleSelectRows(
                            'SELECT id, path FROM mdl_course_categories WHERE id = ? LIMIT 1',
                            [courseCategoryId]
                        );

                        const categoryPath = String(targetCategoryRows[0]?.path || '').trim();
                        const categoryIdsToCheck = Array.from(new Set(
                            categoryPath
                                .split('/')
                                .map((value) => Number(value))
                                .filter((id) => Number.isFinite(id) && id > 1)
                        )).reverse();

                        if (categoryIdsToCheck.length === 0) {
                            categoryIdsToCheck.push(courseCategoryId);
                        }

                        for (const categoryId of categoryIdsToCheck) {
                            const rowsWithCourses = await safeMoodleSelectRows(
                                'SELECT COUNT(*) AS total FROM mdl_course WHERE category = ?',
                                [categoryId]
                            );
                            const rowsWithChildren = await safeMoodleSelectRows(
                                'SELECT COUNT(*) AS total FROM mdl_course_categories WHERE parent = ?',
                                [categoryId]
                            );

                            const remainingCourses = Number(rowsWithCourses[0]?.total || 0);
                            const remainingChildren = Number(rowsWithChildren[0]?.total || 0);

                            if (remainingCourses === 0 && remainingChildren === 0) {
                                const deleteCategoryResult = await safeMoodleDelete(
                                    'DELETE FROM mdl_course_categories WHERE id = ? AND id > 1',
                                    [categoryId]
                                );
                                if (deleteCategoryResult && deleteCategoryResult.affectedRows) {
                                    moodleCategoriesDeleted += deleteCategoryResult.affectedRows;
                                    console.log(`✓ Deleted empty Moodle category ID: ${categoryId}`);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Delete from SCL database
        const whereConditions = [];
        const values = [];

        if (courseCode) {
            whereConditions.push('course_code = ?');
            values.push(courseCode);
        }
        if (courseTitle) {
            whereConditions.push('course_title = ?');
            values.push(courseTitle);
        }

        const whereClause = whereConditions.join(' OR ');

        // Delete from all related tables
        const tables = [
            'course_visits',
            'course_inductions',
            'course_registrations',
            'course_accreditations',
            'course_lifecycle_master'
        ];

        let totalDeleted = 0;
        for (const table of tables) {
            const [result] = await db.execute(
                `DELETE FROM ${table} WHERE ${whereClause}`,
                values
            );
            if (result) {
                totalDeleted += result.affectedRows || 0;
                console.log(`✓ Deleted from ${table}: ${result.affectedRows || 0} rows`);
            }
        }

        return res.json({ 
            success: true, 
            message: `Course deleted: ${totalDeleted} SCL records removed, ${moodleCoursesDeleted} Moodle courses removed, ${moodleCategoriesDeleted} empty Moodle categories removed`,
            data: {
                recordsDeleted: totalDeleted,
                moodleCoursesDeleted,
                moodleCategoriesDeleted
            }
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to delete course',
            error: error.message 
        });
    }
});

router.post('/course-registrations/:id/approve', async (req, res) => {
    try {
        const registrationId = Number(req.params.id);
        const reviewerName = req.body?.reviewer_name || null;
        const reviewerNotes = req.body?.reviewer_notes || null;

        await db.execute(
            `UPDATE course_registrations
             SET application_status = 'approved',
                 reviewer_name = ?,
                 reviewer_notes = ?,
                 approved_at = NOW(),
                 rejected_at = NULL,
                 moodle_sync_status = 'pending'
             WHERE id = ?`,
            [reviewerName, reviewerNotes, registrationId]
        );

        const moodleSync = await syncCourseRegistrationToMoodle(registrationId);
        const [rows] = await db.execute('SELECT * FROM course_registrations WHERE id = ? LIMIT 1', [registrationId]);

        if (rows[0]?.application_status === 'approved') {
            await updateLifecycleMasterStageByCourse(rows[0].course_code, rows[0].course_title, 'registered');
        }

        return res.json({
            success: true,
            message: 'Course registration approved and Moodle sync attempted',
            data: {
                registration: rows[0] || null,
                moodle_sync: moodleSync
            }
        });
    } catch (error) {
        console.error('Error approving course registration:', error);
        return res.status(500).json({ success: false, message: 'Failed to approve course registration', error: error.message });
    }
});

router.post('/course-registrations/:id/sync-moodle', async (req, res) => {
    try {
        const registrationId = Number(req.params.id);
        const moodleSync = await syncCourseRegistrationToMoodle(registrationId);

        const statusCode = moodleSync?.success ? 200 : 502;
        return res.status(statusCode).json({
            success: Boolean(moodleSync?.success),
            message: moodleSync?.message || 'Moodle sync finished',
            data: moodleSync
        });
    } catch (error) {
        console.error('Error syncing course registration to Moodle:', error);
        return res.status(500).json({ success: false, message: 'Failed to sync course registration to Moodle', error: error.message });
    }
});

router.delete('/course-registrations/:id', async (req, res) => {
    try {
        const registrationId = Number(req.params.id);
        
        // Fetch the registration to get details
        const [registrations] = await db.execute(
            'SELECT * FROM course_registrations WHERE id = ? LIMIT 1',
            [registrationId]
        );
        
        if (registrations.length === 0) {
            return res.status(404).json({ success: false, message: 'Course registration not found' });
        }
        
        const registration = registrations[0];
        
        // Check for enrolled students in this cohort from Moodle
        let moodleEnrolledCount = 0;
        if (registration.cohort_label) {
            try {
                // Use year-based program cohort naming: DEG-Y1-2026-Sep
                const programCode = String(registration.course_code || '').split('-')[0].toUpperCase();
                const year = await extractYearFromCourseOrField(registration.course_code, registration.academic_year);
                const cohortIdnumber = `${programCode}-Y${year}-${registration.cohort_label}`.replace(/\s+/g, '-').toLowerCase();
                
                const [moodleCohort] = await moodleDbPool.execute(
                    'SELECT id FROM mdl_cohort WHERE idnumber = ? AND contextid = 1 LIMIT 1',
                    [cohortIdnumber]
                );
                
                if (moodleCohort.length > 0) {
                    const [enrolledCount] = await moodleDbPool.execute(
                        'SELECT COUNT(*) as count FROM mdl_cohort_members WHERE cohortid = ?',
                        [moodleCohort[0].id]
                    );
                    moodleEnrolledCount = enrolledCount[0].count;
                }
            } catch (moodleError) {
                console.error('Error checking Moodle enrollments:', moodleError);
            }
        }
        
        if (moodleEnrolledCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete: ${moodleEnrolledCount} student(s) enrolled in this cohort in Moodle. Remove enrollments first.` 
            });
        }
        
        // Delete the cohort from Moodle if it exists
        let moodleDeleteMessage = '';
        if (registration.cohort_label) {
            try {
                // Generate year-based program cohort idnumber to find and delete
                const programCode = String(registration.course_code || '').split('-')[0].toUpperCase();
                const year = await extractYearFromCourseOrField(registration.course_code, registration.academic_year);
                const cohortIdnumber = `${programCode}-Y${year}-${registration.cohort_label}`.replace(/\s+/g, '-').toLowerCase();
                
                // Find the cohort in Moodle
                const [moodleCohort] = await moodleDbPool.execute(
                    'SELECT id FROM mdl_cohort WHERE idnumber = ? AND contextid = 1 LIMIT 1',
                    [cohortIdnumber]
                );
                
                if (moodleCohort.length > 0) {
                    // First, check if this is the only registration for this cohort
                    // If it is, delete the cohort. If not, just remove the course link
                    const [otherRegs] = await db.execute(
                        'SELECT COUNT(*) as count FROM course_registrations WHERE cohort_label = ? AND course_code LIKE ? AND academic_year LIKE ?',
                        [registration.cohort_label, `${programCode}%`, `%${year}%`]
                    );
                    
                    // Only delete cohort if no other registrations use it
                    if (otherRegs[0].count <= 1) {
                        await moodleDbPool.execute(
                            'DELETE FROM mdl_cohort WHERE id = ?',
                            [moodleCohort[0].id]
                        );
                        moodleDeleteMessage = ' | Year cohort removed from Moodle';
                    } else {
                        moodleDeleteMessage = ' | Course unlinked from cohort';
                    }
                }
            } catch (moodleError) {
                console.error('Error deleting cohort from Moodle:', moodleError);
                moodleDeleteMessage = ' | Warning: Could not remove cohort from Moodle';
            }
        }
        
        // Delete from SCL database
        await db.execute('DELETE FROM course_registrations WHERE id = ?', [registrationId]);
        
        const successMessage = `Course registration #${registrationId} deleted successfully${moodleDeleteMessage}`;
        
        return res.status(200).json({
            success: true,
            message: successMessage,
            deleted_registration_id: registrationId
        });
        
    } catch (error) {
        console.error('Error deleting course registration:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete course registration', error: error.message });
    }
});

// ===============================================
// ROUTE 4: GET /api/students/applications
// Get applications list (for admissions staff)
// ===============================================
router.get('/applications', async (req, res) => {
    try {
        const { status, course_code, page = 1, limit = 50 } = req.query;
        
        let whereClause = 'WHERE sa.is_deleted = FALSE';
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
        
        // Query with correct columns from new schema
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
                    sa.has_disabilities_support_needs,
                    sa.disability_support_details,
                    sa.consent_gdpr,
                    sa.consent_data_sharing,
                    sa.consent_marketing,
                    sa.declaration_truth,
                    sa.offer_accepted,
                    sa.passport_id_document,
                    sa.academic_certificates,
                    sa.academic_transcripts,
                    sa.english_certificate,
                    sa.student_contract,
                    sa.cv_resume,
                    sa.work_reference,
                    sa.proof_of_address,
                    sa.visa_immigration_document,
                    sa.statement_of_purpose_document,
                    sa.brp_card,
                    sa.residency_proof
                FROM student_applications sa
                ${whereClause}
                ORDER BY sa.id DESC
            `, params);
            
            applications = result;
            console.log(`✅ Query successful: Found ${applications.length} applications`);
            
            // Generate application references for records that don't have them
            applications = applications.map(app => {
                if (!app.application_reference) {
                    app.application_reference = `SCL2026${String(app.id).padStart(6, '0')}`;
                }
                return app;
            });
        } catch (error) {
            console.error('❌ Query failed:', error.message);
            applications = [];
        }

        // If no applications found, return empty array (not mock data)
        if (applications.length === 0) {
            console.log('No applications found in database');
        }

        // Get total count
        const total = applications.length;

        // Apply pagination to the results
        const paginatedApplications = applications.slice(
            (page - 1) * limit,
            page * limit
        );

        res.json({
            success: true,
            data: {
                applications: paginatedApplications,
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

        let moodleEnrollment = null;
        if (newStatus === 'accepted') {
            try {
                const [appRows] = await db.execute(
                    'SELECT email, first_name, last_name, course_code, intake_start_date FROM student_applications WHERE id = ? LIMIT 1',
                    [id]
                );

                if (appRows.length > 0) {
                    const app = appRows[0];
                    const normalizedCourseCode = String(app.course_code || '').trim();

                    if (normalizedCourseCode.toUpperCase().includes('-INFO')) {
                        moodleEnrollment = await enrollStudentInProgrammeCourses(
                            app.email,
                            app.first_name,
                            app.last_name,
                            normalizedCourseCode,
                            app.intake_start_date
                        );
                    } else if (normalizedCourseCode) {
                        moodleEnrollment = await enrollStudentInMoodle(
                            app.email,
                            app.first_name,
                            app.last_name,
                            normalizedCourseCode
                        );
                    }

                    // ── Auto-create fee record from induction Section 5 ──
                    try {
                        const axios = require('axios');
                        await axios.post('http://localhost:4000/api/induction-driven/student-fees/create-from-induction', {
                            application_id: id,
                            course_code: normalizedCourseCode,
                            student_name: `${app.first_name} ${app.last_name}`.trim(),
                            student_email: app.email,
                            intake_start_date: app.intake_start_date
                        }).catch(feeErr => {
                            console.warn(`[FEE AUTO-CREATE] Application ${id}: ${feeErr.message}`);
                        });
                    } catch (feeCreateErr) {
                        console.warn(`[FEE AUTO-CREATE] Skipped for application ${id}: ${feeCreateErr.message}`);
                    }
                }
            } catch (enrollError) {
                console.warn(`[REVIEW ENROLLMENT WARNING] Application ${id}: ${enrollError.message}`);
            }
        }

        res.json({
            success: true,
            message: 'Review submitted successfully',
            data: {
                application_id: id,
                new_status: newStatus,
                recommendation,
                moodle_enrollment: moodleEnrollment
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
            WHERE is_deleted = FALSE
            GROUP BY application_status
        `);

        // Get applications by course (top 10)
        const [courseCounts] = await db.execute(`
            SELECT 
                sa.course_code,
                sa.course_title,
                COUNT(*) as applications,
                COUNT(CASE WHEN sa.application_status IN ('accepted','approved') THEN 1 END) as accepted,
                COUNT(CASE WHEN sa.application_status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN sa.application_status = 'rejected' THEN 1 END) as rejected
            FROM student_applications sa
            WHERE sa.is_deleted = FALSE
            GROUP BY sa.course_code, sa.course_title
            ORDER BY applications DESC
            LIMIT 10
        `);

        // Get recent applications (last 7 days)
        const [recentApplications] = await db.execute(`
            SELECT COUNT(*) as count
            FROM student_applications 
            WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              AND is_deleted = FALSE
        `);

        // Monthly trend for last 12 months
        const [monthlyTrend] = await db.execute(`
            SELECT 
                DATE_FORMAT(submitted_at, '%Y-%m') as month,
                COUNT(*) as total,
                COUNT(CASE WHEN application_status IN ('accepted','approved') THEN 1 END) as accepted,
                COUNT(CASE WHEN application_status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN application_status = 'rejected' THEN 1 END) as rejected
            FROM student_applications
            WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
              AND is_deleted = FALSE
            GROUP BY DATE_FORMAT(submitted_at, '%Y-%m')
            ORDER BY month ASC
        `);

        // Recent 10 applications
        const [recentList] = await db.execute(`
            SELECT 
                id, application_reference, first_name, last_name,
                email, course_title, course_code, application_status, submitted_at
            FROM student_applications
            WHERE is_deleted = FALSE
            ORDER BY submitted_at DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                status_summary: statusCounts,
                course_summary: courseCounts,
                recent_applications: recentApplications[0].count,
                monthly_trend: monthlyTrend,
                recent_list: recentList,
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
            final_decision_confirmation,
            remove_all_moodle_memberships
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
        let cohortAssignment = null;
        let moodleCleanup = null;
        if (newStatus === 'accepted' || newStatus === 'conditional_accept') {
            const [appRows] = await db.execute(
                'SELECT id, email, first_name, last_name, course_title, course_code, intake_start_date, application_status, programme_type_name, program_name, intake_id FROM student_applications WHERE id = ?',
                [id]
            );

            if (appRows.length > 0) {
                let { first_name, last_name, course_title, course_code, intake_start_date, application_status, programme_type_name: appProgType, program_name: appProgName, intake_id: appIntakeId } = appRows[0];
                email = appRows[0].email;

                // Fallback: if intake_id is NULL, try to find the latest active intake for the student's programme
                if (!appIntakeId && appProgType && appProgName) {
                    const trimmedProgType = appProgType.trim();
                    const trimmedProgName = appProgName.trim();
                    const [fallbackIntakes] = await db.execute(
                        'SELECT id, moodle_cohort_idnumber FROM programme_intakes WHERE TRIM(programme_type_name) = ? AND TRIM(program_name) = ? AND status = ? ORDER BY id DESC LIMIT 1',
                        [trimmedProgType, trimmedProgName, 'active']
                    );
                    if (fallbackIntakes.length > 0) {
                        appIntakeId = fallbackIntakes[0].id;
                        // Also update the application record so the intake is permanently linked
                        await db.execute('UPDATE student_applications SET intake_id = ?, course_code = ? WHERE id = ?', [appIntakeId, fallbackIntakes[0].moodle_cohort_idnumber || null, id]);
                        console.log(`[APPROVAL FALLBACK] Application ${id}: intake_id was NULL, auto-resolved to intake ${appIntakeId} (${trimmedProgType} / ${trimmedProgName})`);
                    } else {
                        console.warn(`[APPROVAL WARNING] Application ${id}: intake_id is NULL and no active intake found for ${trimmedProgType} / ${trimmedProgName}. Moodle enrollment will be skipped.`);
                    }
                }

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

                // Assign student to Moodle cohort based on intake
                try {
                    // If an intake_id is provided, assign to the programme intake's Moodle cohort
                    if (appIntakeId) {
                        const [intakeRows] = await db.execute(
                            'SELECT moodle_cohort_id, moodle_cohort_idnumber, intake_label FROM programme_intakes WHERE id = ?',
                            [appIntakeId]
                        );
                        if (intakeRows.length > 0 && intakeRows[0].moodle_cohort_id) {
                            const moodleUserId = await getMoodleUserIdByEmail(email);
                            if (moodleUserId) {
                                // Check if already a member
                                const [existing] = await moodleDbPool.execute(
                                    'SELECT id FROM mdl_cohort_members WHERE cohortid = ? AND userid = ?',
                                    [intakeRows[0].moodle_cohort_id, moodleUserId]
                                );
                                if (existing.length === 0) {
                                    const now = Math.floor(Date.now() / 1000);
                                    await moodleDbPool.execute(
                                        'INSERT INTO mdl_cohort_members (cohortid, userid, timeadded) VALUES (?, ?, ?)',
                                        [intakeRows[0].moodle_cohort_id, moodleUserId, now]
                                    );
                                    console.log(`[MOODLE COHORT] Added ${email} to intake cohort ${intakeRows[0].moodle_cohort_idnumber}`);
                                }
                                cohortAssignment = { success: true, message: `Added to intake cohort ${intakeRows[0].moodle_cohort_idnumber}` };
                            }
                        }
                    } else {
                        // Fallback: legacy programme-code-based cohort assignment
                        const cohortProgrammeCode = extractProgrammeCode(course_code)
                            || String(course_code || '').trim().toUpperCase();
                        const cohortAssignmentResult = await assignStudentToMoodleCohort(
                            email,
                            first_name,
                            last_name,
                            cohortProgrammeCode,
                            intake_start_date
                        );
                        if (cohortAssignmentResult.success) {
                            console.log(`[MOODLE COHORT] ${cohortAssignmentResult.message}`);
                            cohortAssignment = cohortAssignmentResult;
                        } else {
                            console.warn(`[MOODLE COHORT WARNING] ${cohortAssignmentResult.message}`);
                        }
                    }
                } catch (cohortError) {
                    console.warn('[MOODLE COHORT ASSIGNMENT WARNING]', cohortError.message);
                }

                // Enroll student in Moodle course if accepted
                let moodleResult = null;
                let moodleSingleProgrammeCleanup = null;
                if (newStatus === 'accepted') {
                    // If intake_id is set, enroll in all courses of that intake via direct DB
                    if (appIntakeId) {
                        const [intakeCourses] = await db.execute(
                            'SELECT moodle_course_id, course_title FROM course_registrations WHERE intake_id = ? AND moodle_course_id IS NOT NULL',
                            [appIntakeId]
                        );

                        // Ensure Moodle user exists (create if needed)
                        let moodleUserId = await getMoodleUserIdByEmail(email);
                        if (!moodleUserId) {
                            const now = Math.floor(Date.now() / 1000);
                            const username = email.toLowerCase();
                            const [createResult] = await moodleDbPool.execute(
                                `INSERT INTO mdl_user (auth, confirmed, mnethostid, username, password, firstname, lastname, email, timecreated, timemodified)
                                 VALUES ('manual', 1, 1, ?, '', ?, ?, ?, ?, ?)`,
                                [username, first_name, last_name, email, now, now]
                            );
                            moodleUserId = Number(createResult.insertId);
                            console.log(`[MOODLE] Created Moodle user for ${email} (ID: ${moodleUserId})`);
                        }

                        const STUDENT_ROLE_ID = 5; // Moodle student role
                        let enrolledCount = 0;
                        const now = Math.floor(Date.now() / 1000);

                        for (const ic of intakeCourses) {
                            try {
                                const courseId = Number(ic.moodle_course_id);
                                // Ensure manual enrolment instance exists
                                const enrolId = await ensureManualEnrolmentForCourse(courseId);

                                // Check if already enrolled
                                const [existingEnrol] = await moodleDbPool.execute(
                                    'SELECT id FROM mdl_user_enrolments WHERE userid = ? AND enrolid = ? LIMIT 1',
                                    [moodleUserId, enrolId]
                                );
                                if (existingEnrol.length > 0) {
                                    await moodleDbPool.execute(
                                        'UPDATE mdl_user_enrolments SET status = 0, timemodified = ? WHERE userid = ? AND enrolid = ?',
                                        [now, moodleUserId, enrolId]
                                    );
                                } else {
                                    await moodleDbPool.execute(
                                        `INSERT INTO mdl_user_enrolments (status, enrolid, userid, timestart, timeend, modifierid, timecreated, timemodified)
                                         VALUES (0, ?, ?, ?, 0, 0, ?, ?)`,
                                        [enrolId, moodleUserId, now, now, now]
                                    );
                                }

                                // Assign student role in course context
                                const contextRows = await getCourseContextRows([courseId]);
                                if (contextRows.length > 0) {
                                    const contextId = Number(contextRows[0].id);
                                    const [existingRole] = await moodleDbPool.execute(
                                        'SELECT id FROM mdl_role_assignments WHERE roleid = ? AND contextid = ? AND userid = ? LIMIT 1',
                                        [STUDENT_ROLE_ID, contextId, moodleUserId]
                                    );
                                    if (existingRole.length === 0) {
                                        await moodleDbPool.execute(
                                            `INSERT INTO mdl_role_assignments (roleid, contextid, userid, timemodified, modifierid, component, itemid, sortorder)
                                             VALUES (?, ?, ?, ?, 0, '', 0, 0)`,
                                            [STUDENT_ROLE_ID, contextId, moodleUserId, now]
                                        );
                                    }
                                }

                                enrolledCount++;
                                console.log(`[MOODLE ENROLL] ${email} enrolled in course ${courseId} (${ic.course_title})`);
                            } catch (err) {
                                console.warn(`[MOODLE ENROLL] Warning enrolling ${email} in course ${ic.moodle_course_id}: ${err.message}`);
                            }
                        }

                        // Purge Moodle caches
                        try {
                            await moodleDbPool.execute('DELETE FROM mdl_cache_flags');
                        } catch (e) {}

                        moodleResult = { success: true, message: `Enrolled in ${enrolledCount}/${intakeCourses.length} intake courses`, courseCount: enrolledCount };
                        console.log(`[MOODLE] Student ${email} enrolled in ${enrolledCount}/${intakeCourses.length} intake courses`);
                    } else if (course_code && course_code.toUpperCase().includes('-INFO')) {
                        moodleResult = await enrollStudentInProgrammeCourses(
                            email,
                            first_name,
                            last_name,
                            course_code,
                            intake_start_date
                        );
                        if (moodleResult.success) {
                            console.log(`[MOODLE] Student ${email} enrolled in ${moodleResult.courseCount} programme courses`);
                        } else {
                            console.warn(`[MOODLE] Programme enrollment warning for ${email}: ${moodleResult.message}`);
                        }
                    } else {
                        // Fallback: single course enrolment
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

                    // Enforce single active programme in Moodle by removing other programme memberships.
                    try {
                        const currentProgrammeCode = extractProgrammeCode(course_code)
                            || String(course_code || '').trim().toUpperCase();
                        const allEnrolments = await getStudentAllMoodleEnrolments(email);
                        const otherProgrammeCourses = allEnrolments.filter((course) => {
                            const programmeCode = extractProgrammeCode(course.course_code || '');
                            return programmeCode && programmeCode !== currentProgrammeCode;
                        });

                        const unenrollOtherResult = await hardUnenrollStudentFromCourseIds(
                            email,
                            otherProgrammeCourses.map((course) => course.id)
                        );
                        const removeOtherCohortsResult = await removeStudentFromNonProgrammeMoodleCohorts(email, currentProgrammeCode);

                        moodleSingleProgrammeCleanup = {
                            current_programme_code: currentProgrammeCode,
                            removed_other_programme_course_count: otherProgrammeCourses.length,
                            removed_other_programme_courses: otherProgrammeCourses,
                            other_programme_unenrollment: unenrollOtherResult,
                            other_programme_cohort_cleanup: removeOtherCohortsResult
                        };

                        console.log(`[MOODLE SINGLE PROGRAMME] Removed ${otherProgrammeCourses.length} non-current programme course enrolment(s) for ${email}`);
                    } catch (singleProgrammeError) {
                        console.warn('[MOODLE SINGLE PROGRAMME WARNING]', singleProgrammeError.message);
                    }
                }

                // Keep exactly one active SCL programme registration for accepted/conditional statuses.
                try {
                    const registrationResult = await setSingleActiveProgrammeRegistration({
                        applicationId: id,
                        email,
                        courseCode: course_code,
                        courseTitle: course_title,
                        source: 'admission_decision',
                        notes: newStatus === 'conditional_accept'
                            ? 'Activated from conditional decision'
                            : 'Activated from acceptance decision'
                    });

                    if (!registrationResult.success) {
                        console.warn('[SCL REGISTRATION WARNING]', registrationResult.message);
                    }
                } catch (registrationError) {
                    console.warn('[SCL REGISTRATION ERROR]', registrationError.message);
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

≡ƒôº Email/Username: ${email}
≡ƒöÉ Temporary Password: ${tempPassword}

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
                            moodle_single_programme_cleanup: moodleSingleProgrammeCleanup,
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

≡ƒôÜ Course: ${course_title}

Conditions:
${detailed_comments || 'Please refer to your admissions portal for specific conditions.'}

Your temporary account credentials have been created:
≡ƒôº Email/Username: ${email}
≡ƒöÉ Temporary Password: ${tempPassword}

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
        } else if (newStatus === 'rejected') {
            const [appRows] = await db.execute(
                'SELECT id, email, course_code FROM student_applications WHERE id = ? LIMIT 1',
                [id]
            );

            if (appRows.length > 0) {
                const application = appRows[0];
                email = application.email;
                const programmeCode = extractProgrammeCode(application.course_code)
                    || String(application.course_code || '').trim().toUpperCase();

                const removeAllMemberships = Boolean(remove_all_moodle_memberships);
                const coursesToRemove = removeAllMemberships
                    ? await getStudentAllMoodleEnrolments(email)
                    : await getStudentProgrammeMoodleEnrolments(email, programmeCode);

                const unenrollmentResult = await hardUnenrollStudentFromCourseIds(
                    email,
                    coursesToRemove.map((course) => course.id)
                );

                const cohortRemovalResult = removeAllMemberships
                    ? await removeStudentFromAllMoodleCohorts(email)
                    : await removeStudentFromMoodleProgrammeCohorts(email, programmeCode);

                try {
                    const registrationCloseResult = await closeActiveProgrammeRegistrationAsRejected({
                        applicationId: id,
                        email,
                        courseCode: application.course_code,
                        notes: 'Closed from rejection decision'
                    });
                    if (!registrationCloseResult.success) {
                        console.warn('[SCL REJECTION REGISTRATION WARNING]', registrationCloseResult.message);
                    }
                } catch (registrationCloseError) {
                    console.warn('[SCL REJECTION REGISTRATION ERROR]', registrationCloseError.message);
                }

                moodleCleanup = {
                    scope: removeAllMemberships ? 'all' : 'programme',
                    programme_code: programmeCode,
                    removed_course_count: coursesToRemove.length,
                    removed_courses: coursesToRemove,
                    unenrollment: unenrollmentResult,
                    cohort_removal: cohortRemovalResult
                };

                if (unenrollmentResult.success) {
                    console.log(`[MOODLE CLEANUP] Removed ${coursesToRemove.length} Moodle course enrolment(s) for ${email} (scope=${moodleCleanup.scope})`);
                } else {
                    console.warn(`[MOODLE CLEANUP WARNING] ${unenrollmentResult.message}`);
                }

                if (!cohortRemovalResult.success) {
                    console.warn(`[MOODLE COHORT CLEANUP WARNING] ${cohortRemovalResult.message}`);
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
                cohort_assignment: cohortAssignment,
                moodle_cleanup: moodleCleanup,
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

// Upload multiple documents for student application
router.post('/applications/:id/upload-document', (req, res, next) => {
    // Use multer fields middleware to handle both files and form fields
    uploadFields(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error(`[UPLOAD ERROR] MulterError: ${err.message}`);
            return res.status(400).json({
                success: false,
                message: `Upload validation error: ${err.message}`
            });
        } else if (err) {
            console.error(`[UPLOAD ERROR] Error: ${err.message}`);
            return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
            });
        }
        // Continue to next middleware if no error
        handleUploadLogic(req, res);
    });
});

// Separated upload logic handler
async function handleUploadLogic(req, res) {
    try {
        const { id } = req.params;
        
        // Get documentType from form fields (multer.fields puts non-file fields in req.body)
        const documentType = req.body?.documentType;
        
        // Get files array from multer
        const files = req.files?.documents || [];

        console.log(`[UPLOAD DEBUG] ID: ${id}, DocumentType: ${documentType}, Files count: ${files.length}`);
        console.log(`[UPLOAD DEBUG] Files:`, files.length > 0 ? files.map(f => f.originalname) : 'NONE');

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
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
            'statement_of_purpose_document',
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
            visa_immigration_document: 'visa_immigration_document',
            statement_of_purpose_document: 'statement_of_purpose_document'
        };

        const uploadedFiles = [];

        // Process each file
        for (const file of files) {
            const filePath = `/uploads/student-documents/${file.filename}`;

            // Update the application with the original filename when mapped to a column (store first file)
            if (columnMap[documentType] && uploadedFiles.length === 0) {
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

            uploadedFiles.push({
                fileName: file.originalname,
                storedName: file.filename,
                filePath,
                fileSize: file.size
            });

            console.log(`[DOCUMENT UPLOAD] Application ${id}: ${documentType} uploaded - ${file.filename}`);
        }

        res.json({
            success: true,
            message: `${uploadedFiles.length} document(s) uploaded successfully`,
            data: {
                documentType,
                filesCount: uploadedFiles.length,
                files: uploadedFiles
            }
        });

    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload documents',
            error: error.message
        });
    }
}

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

// Get all documents for a specific application and document type
router.get('/applications/:id/documents/:documentType', async (req, res) => {
    try {
        const { id, documentType } = req.params;

        // Get all documents for this type
        const [results] = await db.execute(
            `SELECT id, original_filename, stored_filename, file_path, file_size, upload_date, document_verified
             FROM application_documents 
             WHERE application_id = ? AND document_type = ? AND is_deleted = FALSE
             ORDER BY upload_date DESC`,
            [id, documentType]
        );

        res.json({
            success: true,
            data: {
                documentType,
                documents: results,
                count: results.length
            }
        });
    } catch (error) {
        console.error('Error getting documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get documents',
            error: error.message
        });
    }
});

// Delete specific document by ID
router.delete('/applications/:id/documents/:docId', async (req, res) => {
    try {
        const { id, docId } = req.params;

        // Get the document info first
        const [docResult] = await db.execute(
            `SELECT document_type, file_path FROM application_documents 
             WHERE id = ? AND application_id = ?`,
            [docId, id]
        );

        if (docResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Soft delete the document
        await db.execute(
            `UPDATE application_documents SET is_deleted = TRUE, deleted_at = NOW() WHERE id = ?`,
            [docId]
        );

        // Check if there are other documents of same type
        const [otherDocs] = await db.execute(
            `SELECT COUNT(*) as count FROM application_documents 
             WHERE application_id = ? AND document_type = ? AND is_deleted = FALSE`,
            [id, docResult[0].document_type]
        );

        // If no other documents of this type, clear the main field
        if (otherDocs[0].count === 0) {
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

            if (columnMap[docResult[0].document_type]) {
                await db.execute(
                    `UPDATE student_applications SET ${columnMap[docResult[0].document_type]} = NULL WHERE id = ?`,
                    [id]
                );
            }
        }

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

function extractProgrammeCode(courseCode) {
    const normalizedCode = String(courseCode || '').trim();
    const programmeMatch = normalizedCode.match(/^([A-Z]+-\d+)(?:-INFO)?$/i);
    return programmeMatch ? programmeMatch[1] : null;
}

async function setSingleActiveProgrammeRegistration({
    applicationId,
    email,
    courseCode,
    courseTitle,
    source = 'admission_decision',
    courseChangeRequestId = null,
    notes = null
}) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedProgrammeCode = extractProgrammeCode(courseCode)
        || String(courseCode || '').trim().toUpperCase();

    if (!applicationId || !normalizedEmail || !normalizedProgrammeCode) {
        return {
            success: false,
            message: 'Missing application, email, or programme code for registration sync'
        };
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute(
            `UPDATE student_programme_registrations
             SET status = 'transferred_out',
                 ended_at = COALESCE(ended_at, NOW()),
                 notes = COALESCE(notes, 'Closed by programme activation'),
                 updated_at = CURRENT_TIMESTAMP
             WHERE student_email = ?
               AND status = 'active'
               AND programme_code <> ?`,
            [normalizedEmail, normalizedProgrammeCode]
        );

        const [activeRows] = await connection.execute(
            `SELECT id
             FROM student_programme_registrations
             WHERE student_email = ?
               AND programme_code = ?
               AND status = 'active'
             LIMIT 1`,
            [normalizedEmail, normalizedProgrammeCode]
        );

        if (activeRows.length === 0) {
            await connection.execute(
                `INSERT INTO student_programme_registrations
                    (application_id, student_email, programme_code, programme_title, status, source, course_change_request_id, notes, started_at)
                 VALUES (?, ?, ?, ?, 'active', ?, ?, ?, NOW())`,
                [
                    Number(applicationId),
                    normalizedEmail,
                    normalizedProgrammeCode,
                    courseTitle || null,
                    source,
                    courseChangeRequestId,
                    notes
                ]
            );
        } else {
            await connection.execute(
                `UPDATE student_programme_registrations
                 SET application_id = ?,
                     programme_title = COALESCE(?, programme_title),
                     source = ?,
                     course_change_request_id = ?,
                     notes = COALESCE(?, notes),
                     ended_at = NULL,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [
                    Number(applicationId),
                    courseTitle || null,
                    source,
                    courseChangeRequestId,
                    notes,
                    activeRows[0].id
                ]
            );
        }

        await connection.commit();
        return {
            success: true,
            message: `Active programme set to ${normalizedProgrammeCode}`,
            data: {
                applicationId: Number(applicationId),
                email: normalizedEmail,
                programmeCode: normalizedProgrammeCode
            }
        };
    } catch (error) {
        await connection.rollback();
        return {
            success: false,
            message: `Registration sync failed: ${error.message}`
        };
    } finally {
        connection.release();
    }
}

async function closeActiveProgrammeRegistrationAsRejected({ applicationId, email, courseCode, notes = null }) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedProgrammeCode = extractProgrammeCode(courseCode)
        || String(courseCode || '').trim().toUpperCase();

    if (!applicationId || !normalizedEmail || !normalizedProgrammeCode) {
        return {
            success: false,
            message: 'Missing application, email, or programme code for rejection sync'
        };
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [activeRows] = await connection.execute(
            `SELECT id
             FROM student_programme_registrations
             WHERE student_email = ?
               AND programme_code = ?
               AND status = 'active'`,
            [normalizedEmail, normalizedProgrammeCode]
        );

        if (activeRows.length > 0) {
            await connection.execute(
                `UPDATE student_programme_registrations
                 SET status = 'rejected',
                     ended_at = COALESCE(ended_at, NOW()),
                     notes = COALESCE(?, notes),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE student_email = ?
                   AND programme_code = ?
                   AND status = 'active'`,
                [notes, normalizedEmail, normalizedProgrammeCode]
            );
        } else {
            await connection.execute(
                `INSERT INTO student_programme_registrations
                    (application_id, student_email, programme_code, status, source, notes, started_at, ended_at)
                 VALUES (?, ?, ?, 'rejected', 'admission_decision', ?, NOW(), NOW())`,
                [Number(applicationId), normalizedEmail, normalizedProgrammeCode, notes]
            );
        }

        await connection.commit();
        return {
            success: true,
            message: `Marked ${normalizedProgrammeCode} as rejected for ${normalizedEmail}`
        };
    } catch (error) {
        await connection.rollback();
        return {
            success: false,
            message: `Rejection registration sync failed: ${error.message}`
        };
    } finally {
        connection.release();
    }
}

// Assign student to Moodle cohort based on intake
async function assignStudentToMoodleCohort(email, firstName, lastName, programmeCode, intakeStartDate) {
    try {
        if (!email || !programmeCode || !intakeStartDate) {
            return {
                success: false,
                message: 'Missing email, programme code, or intake date for cohort assignment'
            };
        }

        // Get Moodle user ID
        const moodleUserId = await getMoodleUserIdByEmail(email);
        if (!moodleUserId) {
            return { success: false, message: 'User not found in Moodle' };
        }

        // Derive cohort name from intake date (e.g., "2026/2027" cohort for intake in Aug 2026)
        const intakeDate = new Date(intakeStartDate);
        const intakeMonth = intakeDate.getMonth() + 1;
        const intakeYear = intakeDate.getFullYear();
        const cohortYear = intakeMonth >= 8 ? intakeYear : intakeYear - 1;
        const cohortLabel = `${programmeCode}-${cohortYear}-${cohortYear + 1}`;
        const cohortDescription = `${programmeCode} Cohort ${cohortYear}/${cohortYear + 1}`;

        // Create or get cohort in Moodle (via REST API)
        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';

        try {
            // Try to create cohort (will fail if exists, but idnumber is unique)
            await axios.post(
                `${moodleUrl}/webservice/rest/server.php`,
                {
                    wstoken: moodleToken,
                    wsfunction: 'core_cohort_create_cohorts',
                    cohorts: [{
                        contextid: 1, // System context
                        name: cohortDescription,
                        idnumber: cohortLabel,
                        description: `${programmeCode} cohort for intake year ${cohortYear}`
                    }],
                    moodlewsrestformat: 'json'
                }
            );
            console.log(`[MOODLE COHORT] Created cohort ${cohortLabel}`);
        } catch (cohortCreateErr) {
            console.log(`[MOODLE COHORT] Cohort ${cohortLabel} may already exist`);
        }

        // Get cohort ID by idnumber
        let cohortId = null;
        try {
            const cohortResponse = await axios.post(
                `${moodleUrl}/webservice/rest/server.php`,
                {
                    wstoken: moodleToken,
                    wsfunction: 'core_cohort_get_cohorts',
                    moodlewsrestformat: 'json'
                }
            );

            const cohort = (cohortResponse.data || []).find(c => c.idnumber === cohortLabel);
            if (cohort) {
                cohortId = cohort.id;
            }
        } catch (getCohortErr) {
            console.warn('[MOODLE COHORT GET] Error fetching cohorts via REST, trying DB fallback');
        }

        // Fallback: get cohort from Moodle DB
        if (!cohortId) {
            const [cohortRows] = await moodleDbPool.execute(
                `SELECT id FROM mdl_cohort WHERE idnumber = ? LIMIT 1`,
                [cohortLabel]
            );
            if (cohortRows.length > 0) {
                cohortId = cohortRows[0].id;
            }
        }

        // Final fallback: create cohort directly in Moodle DB if still missing.
        if (!cohortId) {
            const now = Math.floor(Date.now() / 1000);
            await moodleDbPool.execute(
                `INSERT INTO mdl_cohort
                    (contextid, name, idnumber, description, descriptionformat, visible, component, timecreated, timemodified)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    description = VALUES(description),
                    timemodified = VALUES(timemodified)`,
                [
                    1,
                    cohortDescription,
                    cohortLabel,
                    `${programmeCode} cohort for intake year ${cohortYear}`,
                    1,
                    1,
                    '',
                    now,
                    now
                ]
            );

            const [cohortRowsAfterCreate] = await moodleDbPool.execute(
                `SELECT id FROM mdl_cohort WHERE idnumber = ? LIMIT 1`,
                [cohortLabel]
            );
            if (cohortRowsAfterCreate.length > 0) {
                cohortId = cohortRowsAfterCreate[0].id;
                console.log(`[MOODLE COHORT DB] Created/found cohort ${cohortLabel} via DB fallback`);
            }
        }

        if (!cohortId) {
            return {
                success: false,
                message: `Cohort ${cohortLabel} not found in Moodle`
            };
        }

        // Add member to cohort (via REST if possible, else DB)
        try {
            await axios.post(
                `${moodleUrl}/webservice/rest/server.php`,
                {
                    wstoken: moodleToken,
                    wsfunction: 'core_cohort_add_cohort_members',
                    members: [{
                        cohortid: cohortId,
                        userid: moodleUserId
                    }],
                    moodlewsrestformat: 'json'
                }
            );
            console.log(`[MOODLE COHORT] Added ${email} to cohort ${cohortLabel}`);
        } catch (addMemberErr) {
            console.log(`[MOODLE COHORT] Member add via REST failed, trying DB fallback`);

            // Fallback: insert into mdl_cohort_members directly
            const now = Math.floor(Date.now() / 1000);
            await moodleDbPool.execute(
                `INSERT INTO mdl_cohort_members (cohortid, userid, timeadded)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE timeadded = VALUES(timeadded)`,
                [cohortId, moodleUserId, now]
            );
            console.log(`[MOODLE COHORT DB] Added ${email} to cohort ${cohortLabel} via DB fallback`);
        }

        return {
            success: true,
            message: `Assigned ${email} to Moodle cohort ${cohortLabel}`,
            data: {
                cohortLabel,
                cohortId,
                moodleUserId
            }
        };
    } catch (error) {
        console.error('[COHORT ASSIGNMENT ERROR]', error.message);
        return {
            success: false,
            message: `Cohort assignment failed: ${error.message}`
        };
    }
}

async function removeStudentFromMoodleProgrammeCohorts(email, programmeCode) {
    try {
        const normalizedProgrammeCode = String(programmeCode || '').trim().toUpperCase();
        if (!email || !normalizedProgrammeCode) {
            return {
                success: false,
                message: 'Missing email or programme code for cohort removal'
            };
        }

        const moodleUserId = await getMoodleUserIdByEmail(email);
        if (!moodleUserId) {
            return { success: true, message: 'User not found in Moodle; no cohort memberships removed', removedCount: 0 };
        }

        const [cohortRows] = await moodleDbPool.execute(
            `SELECT c.id
             FROM mdl_cohort_members cm
             INNER JOIN mdl_cohort c ON c.id = cm.cohortid
             WHERE cm.userid = ? AND c.idnumber LIKE ?`,
            [moodleUserId, `${normalizedProgrammeCode}-%`]
        );

        if (cohortRows.length === 0) {
            return { success: true, message: 'No Moodle cohort memberships found for this programme', removedCount: 0 };
        }

        const cohortIds = cohortRows.map((row) => Number(row.id)).filter(Boolean);
        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';

        try {
            await axios.post(
                `${moodleUrl}/webservice/rest/server.php`,
                {
                    wstoken: moodleToken,
                    wsfunction: 'core_cohort_delete_cohort_members',
                    members: cohortIds.map((cohortId) => ({
                        cohortid: cohortId,
                        userid: moodleUserId
                    })),
                    moodlewsrestformat: 'json'
                }
            );
        } catch (apiError) {
            const placeholders = cohortIds.map(() => '?').join(', ');
            await moodleDbPool.execute(
                `DELETE FROM mdl_cohort_members
                 WHERE userid = ? AND cohortid IN (${placeholders})`,
                [moodleUserId, ...cohortIds]
            );
        }

        return {
            success: true,
            message: `Removed ${cohortIds.length} Moodle cohort membership(s) for ${normalizedProgrammeCode}`,
            removedCount: cohortIds.length
        };
    } catch (error) {
        console.error('[MOODLE COHORT REMOVE ERROR]', error.message);
        return {
            success: false,
            message: `Failed to remove Moodle cohort memberships: ${error.message}`
        };
    }
}

async function removeStudentFromAllMoodleCohorts(email) {
    try {
        if (!email) {
            return {
                success: false,
                message: 'Missing email for cohort removal'
            };
        }

        const moodleUserId = await getMoodleUserIdByEmail(email);
        if (!moodleUserId) {
            return { success: true, message: 'User not found in Moodle; no cohort memberships removed', removedCount: 0 };
        }

        const [cohortRows] = await moodleDbPool.execute(
            `SELECT cohortid FROM mdl_cohort_members WHERE userid = ?`,
            [moodleUserId]
        );

        if (cohortRows.length === 0) {
            return { success: true, message: 'No Moodle cohort memberships found', removedCount: 0 };
        }

        const cohortIds = cohortRows.map((row) => Number(row.cohortid)).filter(Boolean);
        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';

        try {
            await axios.post(
                `${moodleUrl}/webservice/rest/server.php`,
                {
                    wstoken: moodleToken,
                    wsfunction: 'core_cohort_delete_cohort_members',
                    members: cohortIds.map((cohortId) => ({
                        cohortid: cohortId,
                        userid: moodleUserId
                    })),
                    moodlewsrestformat: 'json'
                }
            );
        } catch (apiError) {
            await moodleDbPool.execute(
                `DELETE FROM mdl_cohort_members WHERE userid = ?`,
                [moodleUserId]
            );
        }

        return {
            success: true,
            message: `Removed ${cohortIds.length} Moodle cohort membership(s)`,
            removedCount: cohortIds.length
        };
    } catch (error) {
        console.error('[MOODLE COHORT REMOVE ALL ERROR]', error.message);
        return {
            success: false,
            message: `Failed to remove Moodle cohort memberships: ${error.message}`
        };
    }
}

async function removeStudentFromNonProgrammeMoodleCohorts(email, currentProgrammeCode) {
    const normalizedCurrentProgrammeCode = String(currentProgrammeCode || '').trim().toUpperCase();
    if (!email || !normalizedCurrentProgrammeCode) {
        return {
            success: false,
            message: 'Missing email or current programme code for cohort cleanup'
        };
    }

    const moodleUserId = await getMoodleUserIdByEmail(email);
    if (!moodleUserId) {
        return { success: true, message: 'User not found in Moodle; no cohort memberships removed', removedCount: 0 };
    }

    const [cohortRows] = await moodleDbPool.execute(
        `SELECT c.id, c.idnumber
         FROM mdl_cohort_members cm
         INNER JOIN mdl_cohort c ON c.id = cm.cohortid
         WHERE cm.userid = ?`,
        [moodleUserId]
    );

    const removeCohortIds = cohortRows
        .filter((row) => {
            const memberProgrammeCode = extractProgrammeCode(row.idnumber || '');
            return memberProgrammeCode && memberProgrammeCode !== normalizedCurrentProgrammeCode;
        })
        .map((row) => Number(row.id))
        .filter(Boolean);

    if (removeCohortIds.length === 0) {
        return { success: true, message: 'No non-current programme cohort memberships found', removedCount: 0 };
    }

    try {
        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';

        await axios.post(
            `${moodleUrl}/webservice/rest/server.php`,
            {
                wstoken: moodleToken,
                wsfunction: 'core_cohort_delete_cohort_members',
                members: removeCohortIds.map((cohortId) => ({
                    cohortid: cohortId,
                    userid: moodleUserId
                })),
                moodlewsrestformat: 'json'
            }
        );
    } catch (apiError) {
        const placeholders = removeCohortIds.map(() => '?').join(', ');
        await moodleDbPool.execute(
            `DELETE FROM mdl_cohort_members
             WHERE userid = ? AND cohortid IN (${placeholders})`,
            [moodleUserId, ...removeCohortIds]
        );
    }

    return {
        success: true,
        message: `Removed ${removeCohortIds.length} non-current programme cohort membership(s)`,
        removedCount: removeCohortIds.length
    };
}

function extractYearNumberFromCourseCode(courseCode) {
    const match = String(courseCode || '').toUpperCase().match(/-Y(\d+)(?:-|$)/);
    return match ? Number(match[1]) : null;
}

function extractSemesterNumberFromCourseCode(courseCode) {
    const match = String(courseCode || '').toUpperCase().match(/-S(\d+)(?:-|$)/);
    return match ? Number(match[1]) : null;
}

function isCourseCompletedByUser(completedCourseIds, courseId) {
    return completedCourseIds.has(Number(courseId));
}

function isYearUnlocked(course, allProgrammeCourses, completedCourseIds) {
    const targetYear = extractYearNumberFromCourseCode(course.course_code);
    const targetSemester = extractSemesterNumberFromCourseCode(course.course_code);

    // Year 0: no year-level prerequisite, but still enforce semester progression
    if (targetYear === 0) {
        if (targetSemester && targetSemester > 1) {
            const prereqSemesterCourses = allProgrammeCourses.filter((candidate) => {
                const cYear = extractYearNumberFromCourseCode(candidate.course_code);
                const cSem = extractSemesterNumberFromCourseCode(candidate.course_code);
                return cYear === 0 && cSem && cSem < targetSemester;
            });
            if (prereqSemesterCourses.length > 0 && !prereqSemesterCourses.every((p) => isCourseCompletedByUser(completedCourseIds, p.id))) {
                return { unlocked: false, reason: `Locked: complete all Semester ${targetSemester - 1} courses before Semester ${targetSemester}` };
            }
        }
        return { unlocked: true };
    }

    // Year 1: check if Year 0 courses exist and must be completed first
    if (!targetYear || targetYear <= 1) {
        // Check if there are Year 0 courses that need completion
        if (targetYear === 1) {
            const year0Courses = allProgrammeCourses.filter((candidate) => {
                return extractYearNumberFromCourseCode(candidate.course_code) === 0;
            });
            if (year0Courses.length > 0 && !year0Courses.every((p) => isCourseCompletedByUser(completedCourseIds, p.id))) {
                return { unlocked: false, reason: `Locked: complete all Year 0 (Foundation) courses before Year 1` };
            }
        }
        // If this course has a semester, check semester progression within Year 1
        if (targetSemester && targetSemester > 1) {
            const prereqSemesterCourses = allProgrammeCourses.filter((candidate) => {
                const cYear = extractYearNumberFromCourseCode(candidate.course_code);
                const cSem = extractSemesterNumberFromCourseCode(candidate.course_code);
                return cYear === targetYear && cSem && cSem < targetSemester;
            });
            if (prereqSemesterCourses.length > 0 && !prereqSemesterCourses.every((p) => isCourseCompletedByUser(completedCourseIds, p.id))) {
                return { unlocked: false, reason: `Locked: complete all Semester ${targetSemester - 1} courses before Semester ${targetSemester}` };
            }
        }
        return { unlocked: true };
    }

    // For Year 2+, first check all previous year courses are completed
    const previousYearCourses = allProgrammeCourses.filter((candidate) => {
        const year = extractYearNumberFromCourseCode(candidate.course_code);
        return year !== null && year !== undefined && year < targetYear;
    });

    if (previousYearCourses.length > 0 && !previousYearCourses.every((prereq) => isCourseCompletedByUser(completedCourseIds, prereq.id))) {
        return { unlocked: false, reason: `Locked: complete all previous year courses before Year ${targetYear}` };
    }

    // Within the same year, check semester progression
    if (targetSemester && targetSemester > 1) {
        const prereqSemesterCourses = allProgrammeCourses.filter((candidate) => {
            const cYear = extractYearNumberFromCourseCode(candidate.course_code);
            const cSem = extractSemesterNumberFromCourseCode(candidate.course_code);
            return cYear === targetYear && cSem && cSem < targetSemester;
        });
        if (prereqSemesterCourses.length > 0 && !prereqSemesterCourses.every((p) => isCourseCompletedByUser(completedCourseIds, p.id))) {
            return { unlocked: false, reason: `Locked: complete all Semester ${targetSemester - 1} courses before Semester ${targetSemester}` };
        }
    }

    return { unlocked: true };
}

async function getCompletedCourseIdsByEmail(email, courseIds) {
    const ids = Array.from(new Set((courseIds || []).map((id) => Number(id)).filter(Boolean)));
    if (!email || ids.length === 0) {
        return new Set();
    }

    const placeholders = ids.map(() => '?').join(', ');
    const [rows] = await moodleDbPool.query(
        `SELECT cc.course
         FROM mdl_course_completions cc
         INNER JOIN mdl_user u ON u.id = cc.userid
         WHERE u.email = ?
           AND cc.timecompleted IS NOT NULL
           AND cc.timecompleted > 0
           AND cc.course IN (${placeholders})`,
        [email, ...ids]
    );

    return new Set(rows.map((row) => Number(row.course)));
}

// Enroll student in all course-specific cohorts for their programme and year
async function enrollStudentInCourseCohorts(email, firstName, lastName, programmeCode, intakeStartDate) {
    try {
        if (!email || !programmeCode || !intakeStartDate) {
            return {
                success: false,
                message: 'Missing email, programme code, or intake date for course cohort enrollment',
                cohorts: []
            };
        }

        // Get Moodle user ID
        const moodleUserId = await getMoodleUserIdByEmail(email);
        if (!moodleUserId) {
            return { success: false, message: 'User not found in Moodle', cohorts: [] };
        }

        // Derive intake year from intake date (academic year)
        const intakeDate = new Date(intakeStartDate);
        const intakeMonth = intakeDate.getMonth() + 1;
        const intakeYear = intakeDate.getFullYear();
        const academicYear = intakeMonth >= 8 ? intakeYear : intakeYear - 1;

        // Query course_lifecycle for year-based cohorts
        const [courseLifecycleRows] = await db.execute(
            `SELECT DISTINCT 
                cl.cohort_label,
                cl.year_of_study,
                cl.academic_year
            FROM course_lifecycle cl
            WHERE UPPER(cl.program_code) = ?
              AND cl.academic_year = ?
              AND cl.cohort_label IS NOT NULL
            ORDER BY cl.year_of_study, cl.cohort_label`,
            [programmeCode, academicYear]
        );

        if (courseLifecycleRows.length === 0) {
            console.warn(`[COURSE COHORT] No course lifecycle cohorts found for programme ${programmeCode}, year ${academicYear}`);
            return {
                success: false, 
                message: `No course lifecycle cohorts found for ${programmeCode} ${academicYear}`,
                cohorts: []
            };
        }

        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';
        const cohortResults = [];

        // Add student to each year-based cohort
        for (const courseStage of courseLifecycleRows) {
            const cohortLabel = String(courseStage.cohort_label || '').trim();
            const yearOfStudy = courseStage.year_of_study || 1;
            if (!cohortLabel) continue;

            try {
                // Build year-based program cohort idnumber and name
                const cohortIdnumber = `${programmeCode}-y${yearOfStudy}-${cohortLabel}`.replace(/\s+/g, '-').toLowerCase();
                const cohortName = `${programmeCode} Year ${yearOfStudy} - ${cohortLabel}`;

                // Check if year-based program cohort already exists in Moodle
                let cohortId = null;

                // Try database lookup first (faster)
                const [existingCohorts] = await moodleDbPool.execute(
                    `SELECT id FROM mdl_cohort WHERE idnumber = ? AND contextid = 1 LIMIT 1`,
                    [cohortIdnumber]
                );

                if (existingCohorts.length > 0) {
                    cohortId = existingCohorts[0].id;
                } else {
                    // Try to create via REST API
                    try {
                        const createResponse = await axios.post(
                            `${moodleUrl}/webservice/rest/server.php`,
                            {
                                wstoken: moodleToken,
                                wsfunction: 'core_cohort_create_cohorts',
                                cohorts: [{
                                    contextid: 1,
                                    name: cohortName,
                                    idnumber: cohortIdnumber,
                                    description: `${programmeCode} Year ${yearOfStudy} cohort for intake ${cohortLabel}`
                                }],
                                moodlewsrestformat: 'json'
                            }
                        );
                        if (createResponse.data?.[0]?.id) {
                            cohortId = createResponse.data[0].id;
                        }
                    } catch (restErr) {
                        console.log(`[COURSE COHORT] REST API failed, trying DB fallback`);
                    }

                    // Fallback: create directly in database
                    if (!cohortId) {
                        const now = Math.floor(Date.now() / 1000);
                        try {
                            await moodleDbPool.execute(
                                `INSERT INTO mdl_cohort (contextid, name, idnumber, description, descriptionformat, visible, component, timecreated, timemodified)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                                 ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), timemodified = VALUES(timemodified)`,
                                [1, cohortName, cohortIdnumber, `${programmeCode} Year ${yearOfStudy} cohort for intake ${cohortLabel}`, 1, 1, '', now, now]
                            );
                            
                            const [newCohortRows] = await moodleDbPool.execute(
                                `SELECT id FROM mdl_cohort WHERE idnumber = ? LIMIT 1`,
                                [cohortIdnumber]
                            );
                            if (newCohortRows.length > 0) {
                                cohortId = newCohortRows[0].id;
                                console.log(`[COURSE COHORT] Created cohort ${cohortIdnumber} via DB`);
                            }
                        } catch (dbCreateErr) {
                            console.error(`[COURSE COHORT] Failed to create cohort via DB:`, dbCreateErr.message);
                        }
                    }
                }

                // Add student to cohort if cohort exists
                if (cohortId) {
                    try {
                        await axios.post(
                            `${moodleUrl}/webservice/rest/server.php`,
                            {
                                wstoken: moodleToken,
                                wsfunction: 'core_cohort_add_cohort_members',
                                members: [{
                                    cohortid: cohortId,
                                    userid: moodleUserId
                                }],
                                moodlewsrestformat: 'json'
                            }
                        );
                        console.log(`[COURSE COHORT] Added ${email} to cohort ${cohortIdnumber}`);
                        cohortResults.push({ cohortLabel, yearOfStudy, success: true });
                    } catch (addErr) {
                        // Fallback to DB insert
                        const now = Math.floor(Date.now() / 1000);
                        try {
                            await moodleDbPool.execute(
                                `INSERT INTO mdl_cohort_members (cohortid, userid, timeadded)
                                 VALUES (?, ?, ?)
                                 ON DUPLICATE KEY UPDATE timeadded = VALUES(timeadded)`,
                                [cohortId, moodleUserId, now]
                            );
                            console.log(`[COURSE COHORT] Added ${email} to cohort ${cohortIdnumber} via DB`);
                            cohortResults.push({ cohortLabel, yearOfStudy, success: true, method: 'db' });
                        } catch (dbErr) {
                            console.error(`[COURSE COHORT] Failed to add ${email} to ${cohortIdnumber}:`, dbErr.message);
                            cohortResults.push({ cohortLabel, yearOfStudy, success: false, error: dbErr.message });
                        }
                    }
                } else {
                    console.warn(`[COURSE COHORT] Could not create or find cohort ${cohortIdnumber}`);
                    cohortResults.push({ cohortLabel, yearOfStudy, success: false, error: 'Cohort not found or created' });
                }
            } catch (cohortErr) {
                console.error(`[COURSE COHORT] Error processing cohort for ${cohortLabel}:`, cohortErr.message);
                cohortResults.push({ cohortLabel, yearOfStudy: courseStage.year_of_study, success: false, error: cohortErr.message });
            }
        }

        return {
            success: cohortResults.filter(r => r.success).length > 0,
            message: cohortResults.filter(r => r.success).length > 0 ? `Enrolled student in ${cohortResults.filter(r => r.success).length} year-based cohort(s)` : 'Failed to enroll student in cohorts',
            cohorts: cohortResults
        };

    } catch (error) {
        console.error('[COURSE COHORT ENROLLMENT ERROR]', error.message);
        return {
            success: false,
            message: `Course cohort enrollment failed: ${error.message}`,
            cohorts: []
        };
    }
}

async function getMoodleUserIdByEmail(email) {
    const normalizedEmail = String(email || '').trim();
    if (!normalizedEmail) {
        return null;
    }

    try {
        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';

        const userSearchResponse = await axios.post(
            `${moodleUrl}/webservice/rest/server.php`,
            {
                wstoken: moodleToken,
                wsfunction: 'core_user_get_users',
                criteria: [{ key: 'email', value: normalizedEmail }],
                moodlewsrestformat: 'json'
            }
        );

        const users = userSearchResponse.data?.users || [];
        if (users.length > 0) {
            return users[0].id;
        }
    } catch (error) {
        console.warn('[MOODLE USER LOOKUP FALLBACK]', error.message);
    }

    const [users] = await moodleDbPool.execute(
        'SELECT id FROM mdl_user WHERE email = ? LIMIT 1',
        [normalizedEmail]
    );

    return users.length > 0 ? Number(users[0].id) : null;
}

async function getMoodleCourseByCode(courseCode) {
    const normalizedCode = String(courseCode || '').trim();
    if (!normalizedCode) {
        return null;
    }

    const [matchingCourses] = await moodleDbPool.query(`
        SELECT id, idnumber, shortname, fullname
        FROM mdl_course
        WHERE id > 1 AND (
            idnumber = ? OR shortname = ? OR fullname LIKE CONCAT('%', ?, '%')
        )
        ORDER BY CASE WHEN idnumber = ? THEN 0 WHEN shortname = ? THEN 1 ELSE 2 END, id ASC
        LIMIT 1
    `, [normalizedCode, normalizedCode, normalizedCode, normalizedCode, normalizedCode]);

    return matchingCourses.length > 0 ? matchingCourses[0] : null;
}

async function getManualEnrolmentRows(courseIds) {
    const ids = Array.from(new Set((courseIds || []).map((id) => Number(id)).filter(Boolean)));
    if (ids.length === 0) {
        return [];
    }

    const placeholders = ids.map(() => '?').join(', ');
    const [rows] = await moodleDbPool.query(`
        SELECT id, courseid, enrol, status, roleid
        FROM mdl_enrol
        WHERE enrol = 'manual'
          AND courseid IN (${placeholders})
        ORDER BY courseid ASC, status ASC, id ASC
    `, ids);

    const rowsByCourse = new Map();
    for (const row of rows) {
        if (!rowsByCourse.has(Number(row.courseid))) {
            rowsByCourse.set(Number(row.courseid), row);
        }
    }

    return ids.map((courseId) => rowsByCourse.get(courseId)).filter(Boolean);
}

async function getCourseContextRows(courseIds) {
    const ids = Array.from(new Set((courseIds || []).map((id) => Number(id)).filter(Boolean)));
    if (ids.length === 0) {
        return [];
    }

    const placeholders = ids.map(() => '?').join(', ');
    const [rows] = await moodleDbPool.query(`
        SELECT id, instanceid
        FROM mdl_context
        WHERE contextlevel = 50
          AND instanceid IN (${placeholders})
    `, ids);

    return rows;
}

function normalizeCourseRegistrationPayload(rawPayload) {
    const payload = rawPayload || {};
    const numberValue = payload.tuition_fee_gbp === '' || payload.tuition_fee_gbp === null || payload.tuition_fee_gbp === undefined
        ? null
        : Number(payload.tuition_fee_gbp);
    const parseNullableInt = (value) => {
        const numericValue = Number(value);
        return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null;
    };

    const normalizeDateValue = (value) => {
        const trimmed = String(value || '').trim();
        return trimmed ? trimmed : null;
    };

    return {
        intake_id: parseNullableInt(payload.intake_id),
        course_title: String(payload.course_title || '').trim(),
        course_code: String(payload.course_code || '').trim(),
        programme_type_name: String(payload.programme_type_name || '').trim() || null,
        program_name: String(payload.program_name || '').trim() || null,
        academic_year: String(payload.academic_year || '').trim() || null,
        semester_name: String(payload.semester_name || '').trim() || null,
        cohort_label: String(payload.cohort_label || '').trim() || null,
        programme_type_category_id: parseNullableInt(payload.programme_type_category_id),
        program_category_id: parseNullableInt(payload.program_category_id),
        year_category_id: parseNullableInt(payload.year_category_id),
        semester_category_id: parseNullableInt(payload.semester_category_id),
        cohort_category_id: parseNullableInt(payload.cohort_category_id),
        course_type: payload.course_type || null,
        awarding_body_accreditation: payload.awarding_body_accreditation || null,
        regulation_level: payload.regulation_level || null,
        mode_of_delivery: payload.mode_of_delivery || null,
        start_date: normalizeDateValue(payload.start_date),
        end_date_or_duration: payload.end_date_or_duration || null,
        subject_area_discipline: payload.subject_area_discipline || null,
        course_description: payload.course_description || null,
        learning_outcomes: payload.learning_outcomes || null,
        units_modules_covered: payload.units_modules_covered || null,
        assessment_methods: payload.assessment_methods || null,
        entry_requirements: payload.entry_requirements || null,
        tuition_fee_gbp: Number.isFinite(numberValue) ? numberValue : null,
        additional_costs: payload.additional_costs || null,
        funding_options: payload.funding_options || null,
        learning_resources_provided: payload.learning_resources_provided || null,
        special_equipment_needed: payload.special_equipment_needed || null,
        work_placement_included: payload.work_placement_included || null,
        course_leader_programme_director: payload.course_leader_programme_director || null,
        internal_verification_contact: payload.internal_verification_contact || null,
        ukvi_approved_course: payload.ukvi_approved_course || null,
        approval_date: normalizeDateValue(payload.approval_date),
        review_date: normalizeDateValue(payload.review_date),
        special_admission_considerations: payload.special_admission_considerations || null,
        progression_opportunities: payload.progression_opportunities || null,
        industry_partnerships: payload.industry_partnerships || null,
        application_status: ['draft', 'submitted', 'approved', 'rejected'].includes(String(payload.application_status || '').toLowerCase())
            ? String(payload.application_status).toLowerCase()
            : 'submitted'
    };
}

function normalizeLifecycleStatus(value) {
    return String(value || '').trim().toLowerCase();
}

function isDoneLifecycleStatus(value) {
    return ['completed', 'complete', 'approved', 'active'].includes(normalizeLifecycleStatus(value));
}

async function findLatestInductionForCourse(courseCode, courseTitle) {
    const normalizedCode = String(courseCode || '').trim();
    const normalizedTitle = String(courseTitle || '').trim();

    if (normalizedCode) {
        const [rows] = await db.execute(
            'SELECT * FROM course_inductions WHERE course_code = ? ORDER BY updated_at DESC, created_at DESC LIMIT 1',
            [normalizedCode]
        );
        if (rows.length > 0) {
            return rows[0];
        }
    }

    if (normalizedTitle) {
        const [rows] = await db.execute(
            'SELECT * FROM course_inductions WHERE course_title = ? ORDER BY updated_at DESC, created_at DESC LIMIT 1',
            [normalizedTitle]
        );
        if (rows.length > 0) {
            return rows[0];
        }
    }

    return null;
}

async function ensureRegistrationGateFromInduction(courseCode, courseTitle) {
    const induction = await findLatestInductionForCourse(courseCode, courseTitle);
    if (!induction) {
        return {
            allowed: false,
            message: 'Course registration is locked. Complete induction first.'
        };
    }

    if (!isDoneLifecycleStatus(induction.overall_status)) {
        return {
            allowed: false,
            message: 'Course registration is locked. Induction must be Completed or Approved before registration.'
        };
    }

    return { allowed: true };
}

async function updateLifecycleMasterStageByCourse(courseCode, courseTitle, stage) {
    const normalizedCode = String(courseCode || '').trim();
    const normalizedTitle = String(courseTitle || '').trim();

    if (!normalizedCode && !normalizedTitle) {
        return;
    }

    if (normalizedCode) {
        await db.execute(
            'UPDATE course_lifecycle_master SET current_stage = ?, updated_at = CURRENT_TIMESTAMP WHERE course_code = ?',
            [stage, normalizedCode]
        );
        return;
    }

    await db.execute(
        'UPDATE course_lifecycle_master SET current_stage = ?, updated_at = CURRENT_TIMESTAMP WHERE course_title = ?',
        [stage, normalizedTitle]
    );
}

function normalizeFieldKey(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function normalizeCourseTitle(value) {
    return String(value || '').trim().toLowerCase();
}

function buildCourseLifecycleKey(courseCode, courseTitle) {
    const code = String(courseCode || '').trim().toUpperCase();
    if (code) {
        return `code:${code}`;
    }

    const title = normalizeCourseTitle(courseTitle);
    if (title) {
        return `title:${title}`;
    }

    return 'unknown';
}

function toLifecycleStatus(rawStatus, completionPercentage) {
    const normalizedStatus = String(rawStatus || '').trim().toLowerCase();
    const completion = Number(completionPercentage || 0);

    if (['approved', 'active'].includes(normalizedStatus)) {
        return 'approved';
    }

    if (['rejected', 'failed', 'cancelled', 'canceled'].includes(normalizedStatus)) {
        return 'rejected';
    }

    if (['completed', 'complete'].includes(normalizedStatus) || completion >= 100) {
        return 'completed';
    }

    if (['in progress', 'in_progress', 'processing'].includes(normalizedStatus)) {
        return 'in_progress';
    }

    if (['draft', 'pending', 'submitted', 'open'].includes(normalizedStatus)) {
        return 'in_progress';
    }

    if (['not started', 'not_started'].includes(normalizedStatus)) {
        return 'not_started';
    }

    if (!normalizedStatus) {
        return completion > 0 ? 'in_progress' : 'not_started';
    }

    return completion > 0 ? 'in_progress' : 'not_started';
}

function toRegistrationLifecycleStatus(applicationStatus, moodleSyncStatus) {
    const status = String(applicationStatus || '').trim().toLowerCase();
    const syncStatus = String(moodleSyncStatus || '').trim().toLowerCase();

    if (!status) {
        return 'completed';
    }

    if (status === 'rejected') {
        return 'rejected';
    }

    if (status === 'approved') {
        return syncStatus === 'failed' ? 'completed' : 'approved';
    }

    return 'completed';
}

function maxDate(a, b) {
    if (!a) return b || null;
    if (!b) return a || null;
    return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

function minDate(a, b) {
    if (!a) return b || null;
    if (!b) return a || null;
    return new Date(a).getTime() <= new Date(b).getTime() ? a : b;
}

async function safeMoodleSelectRows(query, params = []) {
    try {
        const connection = await moodleDbPool.getConnection();
        try {
            const [rows] = await connection.execute(query, params);
            return rows;
        } finally {
            connection.release();
        }
    } catch (error) {
        if (error && (error.code === 'ER_NO_SUCH_TABLE' || String(error.message || '').includes("doesn't exist"))) {
            return [];
        }
        if (error && (
            error.code === 'ER_ACCESS_DENIED_ERROR' ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ETIMEDOUT'
        )) {
            console.warn('Moodle DB unavailable for query, returning empty rows:', error.code || error.message);
            return [];
        }
        console.error('Moodle DB Error:', error);
        throw error;
    }
}

async function safeSelectRows(query, params = []) {
    try {
        const [rows] = await db.execute(query, params);
        return rows;
    } catch (error) {
        if (error && (error.code === 'ER_NO_SUCH_TABLE' || String(error.message || '').includes("doesn't exist"))) {
            return [];
        }
        throw error;
    }
}

function parseCourseModules(unitsModulesCovered) {
    const lines = String(unitsModulesCovered || '')
        .split(/\r?\n|,/)
        .map((line) => String(line || '').trim())
        .filter(Boolean);

    return Array.from(new Set(lines));
}

function buildCourseSummaryFromRegistration(registration) {
    const blocks = [];
    if (registration.course_description) {
        blocks.push(`Course Description:\n${registration.course_description}`);
    }
    if (registration.learning_outcomes) {
        blocks.push(`Learning Outcomes:\n${registration.learning_outcomes}`);
    }
    if (registration.entry_requirements) {
        blocks.push(`Entry Requirements:\n${registration.entry_requirements}`);
    }
    return blocks.join('\n\n');
}

function toEpochDate(value) {
    if (!value) return 0;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 0;
    }
    return Math.floor(date.getTime() / 1000);
}

function parseDurationToDays(rawValue) {
    const value = String(rawValue || '').trim().toLowerCase();
    if (!value) return 0;

    const match = value.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/i);
    if (!match) return 0;

    const amount = Number(match[1] || 0);
    const unit = String(match[2] || '').toLowerCase();
    if (!amount) return 0;

    if (unit.startsWith('day')) return amount;
    if (unit.startsWith('week')) return amount * 7;
    if (unit.startsWith('month')) return amount * 30;
    if (unit.startsWith('year')) return amount * 365;
    return 0;
}

function deriveCourseDates(registration) {
    const startDateEpoch = toEpochDate(registration.start_date);

    let endDateEpoch = toEpochDate(registration.end_date_or_duration);
    if (!endDateEpoch && startDateEpoch) {
        const durationDays = parseDurationToDays(registration.end_date_or_duration);
        if (durationDays > 0) {
            endDateEpoch = startDateEpoch + (durationDays * 24 * 60 * 60);
        }
    }

    return {
        startDateEpoch,
        endDateEpoch
    };
}

function deriveMoodleShortname(registration) {
    const baseCode = String(registration.course_code || '').trim();
    const cohortToken = toCategorySlug(registration.cohort_label || '').toUpperCase();
    if (baseCode && cohortToken) {
        return `${baseCode}-${cohortToken}`.slice(0, 255);
    }
    if (baseCode) {
        return baseCode.slice(0, 255);
    }

    return String(registration.course_title || '').trim().slice(0, 255);
}

function deriveMoodleCourseIdNumber(registration) {
    const baseCode = String(registration.course_code || '').trim();
    const cohortToken = toCategorySlug(registration.cohort_label || '').toUpperCase();
    if (baseCode && cohortToken) {
        return `${baseCode}-${cohortToken}`.slice(0, 255);
    }
    return baseCode.slice(0, 255);
}

function getMoodleRestConfig() {
    const preferredBaseUrls = [
        process.env.MOODLE_URL,
        process.env.MOODLE_INTERNAL_URL,
        process.env.MOODLE_EXTERNAL_URL,
        'http://localhost:9090',
        'http://127.0.0.1:9090'
    ]
        .map((value) => String(value || '').trim().replace(/\/$/, ''))
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index);

    return {
        token: process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1',
        baseUrl: preferredBaseUrls[0] || 'http://localhost:9090',
        baseUrls: preferredBaseUrls
    };
}

function getStructureRootCategoryId() {
    // Always keep the academic hierarchy at top level in Moodle.
    return 0;
}

function appendMoodleParam(form, key, value) {
    if (Array.isArray(value)) {
        value.forEach((item, index) => appendMoodleParam(form, `${key}[${index}]`, item));
        return;
    }

    if (value !== null && value !== undefined && typeof value === 'object') {
        Object.entries(value).forEach(([childKey, childValue]) => appendMoodleParam(form, `${key}[${childKey}]`, childValue));
        return;
    }

    form.append(key, value === null || value === undefined ? '' : String(value));
}

async function callMoodleRest(wsfunction, params = {}) {
    const axios = require('axios');
    const { token, baseUrls, baseUrl } = getMoodleRestConfig();
    const candidateBaseUrls = (Array.isArray(baseUrls) && baseUrls.length ? baseUrls : [baseUrl]).filter(Boolean);
    let lastError = null;

    for (const currentBaseUrl of candidateBaseUrls) {
        const endpoint = `${currentBaseUrl}/webservice/rest/server.php`;
        const form = new URLSearchParams();

        form.append('wstoken', token);
        form.append('wsfunction', wsfunction);
        form.append('moodlewsrestformat', 'json');
        Object.entries(params || {}).forEach(([key, value]) => appendMoodleParam(form, key, value));

        console.log(`[callMoodleRest] Calling ${wsfunction} to ${endpoint}`);

        try {
            const response = await axios.post(endpoint, form.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 15000
            });

            if (response.data && response.data.exception) {
                console.error(`[callMoodleRest] Moodle exception for ${wsfunction}:`, response.data);
                throw new Error(response.data.message || response.data.errorcode || 'Moodle API error');
            }

            console.log(`[callMoodleRest] Success for ${wsfunction} via ${currentBaseUrl}`);
            return response.data;
        } catch (error) {
            lastError = error;
            const code = String(error?.code || '').toUpperCase();
            const message = String(error?.message || '');
            const isConnectionError = code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT' || message.includes('ECONNREFUSED') || message.includes('ENOTFOUND') || message.includes('ETIMEDOUT');

            console.error(`[callMoodleRest] Error calling ${wsfunction} via ${currentBaseUrl}:`, message);
            if (error.response) {
                console.error(`[callMoodleRest] Response status: ${error.response.status}`);
                console.error(`[callMoodleRest] Response data:`, error.response.data);
            }

            if (!isConnectionError) {
                throw error;
            }
        }
    }

    throw lastError || new Error(`Failed to call Moodle REST (${wsfunction})`);
}

async function findBestMoodleCategoryId() {
    const [rows] = await moodleDbPool.execute(
        `SELECT id FROM mdl_course_categories WHERE id > 0 ORDER BY CASE WHEN id = 1 THEN 0 ELSE 1 END, id ASC LIMIT 1`
    );
    return rows.length > 0 ? Number(rows[0].id) : 1;
}

function toCategorySlug(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function toLooseToken(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
}

function parseCourseCodeStructure(courseCode) {
    const parts = String(courseCode || '').trim().split('-').map((part) => String(part || '').trim()).filter(Boolean);
    if (parts.length < 5) {
        return null;
    }

    const yearPart = parts[2];
    const semesterPart = parts[3];
    if (!/^y\d+$/i.test(yearPart) || !/^s\d+$/i.test(semesterPart)) {
        return null;
    }

    return {
        programCode: `${parts[0]}-${parts[1]}`,
        yearCode: yearPart.toUpperCase(),
        semesterCode: semesterPart.toUpperCase()
    };
}

function deriveHierarchyFromCourseCode(courseCode) {
    const raw = String(courseCode || '').trim().toUpperCase();
    const match = raw.match(/^([A-Z0-9]+)-(\d{3})-(Y\d+)-(S\d+)-C\d+$/i);
    if (!match) {
        return null;
    }

    const programmeType = String(match[1] || '').toUpperCase();
    const programCode = `${programmeType}-${String(match[2] || '').toUpperCase()}`;
    const yearCode = `${programCode}-${String(match[3] || '').toUpperCase()}`;
    const semesterCode = `${yearCode}-${String(match[4] || '').toUpperCase()}`;

    return {
        programme_type_name: programmeType,
        program_name: programCode,
        academic_year: yearCode,
        semester_name: semesterCode
    };
}

function abbreviateProgrammeTypeCode(name) {
    const clean = String(name || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return clean.slice(0, 3);
}

function extractSequenceToken(value, prefix) {
    const direct = String(value || '').trim().toUpperCase().match(new RegExp(`^${prefix}(\\d+)$`, 'i'));
    if (direct) {
        return `${prefix}${direct[1]}`;
    }

    const number = String(value || '').match(/\d+/);
    if (!number) {
        return '';
    }

    return `${prefix}${number[0]}`;
}

function buildHierarchyCodePattern(courseCode, programmeTypeName, programName, academicYear, semesterName) {
    const rawCourseCode = String(courseCode || '').trim().toUpperCase();
    const match = rawCourseCode.match(/^([A-Z0-9]+)-(\d{3})-(Y\d+)-(S\d+)-C\d+$/i);

    let programmeTypeCode = '';
    let programCode = '';
    let yearToken = '';
    let semesterToken = '';

    if (match) {
        programmeTypeCode = String(match[1] || '').toUpperCase();
        programCode = `${programmeTypeCode}-${String(match[2] || '').toUpperCase()}`;
        yearToken = String(match[3] || '').toUpperCase();
        semesterToken = String(match[4] || '').toUpperCase();
    }

    const normalizedProgramName = String(programName || '').trim().toUpperCase();
    if (!programCode && /^[A-Z0-9]+-\d{3}$/.test(normalizedProgramName)) {
        programCode = normalizedProgramName;
        programmeTypeCode = programmeTypeCode || normalizedProgramName.split('-')[0];
    }

    if (!programmeTypeCode) {
        programmeTypeCode = abbreviateProgrammeTypeCode(programmeTypeName || programName || '');
    }

    if (!yearToken) {
        yearToken = extractSequenceToken(academicYear, 'Y');
    }

    if (!semesterToken) {
        semesterToken = extractSequenceToken(semesterName, 'S');
    }

    const yearCode = programCode && yearToken ? `${programCode}-${yearToken}` : '';
    const semesterCode = yearCode && semesterToken ? `${yearCode}-${semesterToken}` : '';

    return {
        programmeTypeCode: String(programmeTypeCode || '').slice(0, 20),
        programCode: String(programCode || '').slice(0, 40),
        yearCode: String(yearCode || '').slice(0, 60),
        semesterCode: String(semesterCode || '').slice(0, 80)
    };
}

// Find a Moodle category by its exact idnumber field (anywhere in the tree).
async function findMoodleCategoryByIdnumber(idnumber) {
    const code = String(idnumber || '').trim();
    if (!code) return null;
    const [rows] = await moodleDbPool.execute(
        `SELECT id FROM mdl_course_categories WHERE idnumber = ? LIMIT 1`,
        [code]
    );
    return rows.length ? Number(rows[0].id) : null;
}

async function findMoodleCategoryByName(name, parentId) {
    const normalized = String(name || '').trim();
    if (!normalized) {
        return null;
    }

    const [rows] = await moodleDbPool.execute(
        `SELECT id
           FROM mdl_course_categories
          WHERE parent = ?
            AND (name = ? OR idnumber = ?)
          ORDER BY CASE WHEN name = ? THEN 0 ELSE 1 END, id ASC
          LIMIT 1`,
        [parentId, normalized, normalized, normalized]
    );

    if (!rows.length) {
        return null;
    }

    return Number(rows[0].id);
}

async function findMoodleCategoryByCodeHint(codeHint, parentId, level) {
    const hint = String(codeHint || '').trim();
    if (!hint) {
        return null;
    }

    const [rows] = await moodleDbPool.execute(
        `SELECT id, name, idnumber
           FROM mdl_course_categories
          WHERE parent = ?
          ORDER BY id ASC`,
        [parentId]
    );

    if (!rows.length) {
        return null;
    }

    const hintToken = toLooseToken(hint);
    const hintDigits = (hint.match(/\d+/) || [''])[0];

    const exact = rows.find((row) => {
        const nameToken = toLooseToken(row.name);
        const idNumberToken = toLooseToken(row.idnumber);
        return nameToken === hintToken || idNumberToken === hintToken;
    });
    if (exact) {
        return Number(exact.id);
    }

    const byContains = rows.find((row) => {
        const nameToken = toLooseToken(row.name);
        const idNumberToken = toLooseToken(row.idnumber);
        return nameToken.includes(hintToken) || idNumberToken.includes(hintToken);
    });
    if (byContains) {
        return Number(byContains.id);
    }

    if (!hintDigits) {
        return null;
    }

    const byLevelAndNumber = rows.find((row) => {
        const nameToken = toLooseToken(row.name);
        const idNumberToken = toLooseToken(row.idnumber);

        if (level === 'year') {
            return (
                nameToken.includes(`year${hintDigits}`) ||
                idNumberToken.includes(`year${hintDigits}`) ||
                nameToken === `y${hintDigits}` ||
                idNumberToken === `y${hintDigits}`
            );
        }

        if (level === 'semester') {
            return (
                nameToken.includes(`semester${hintDigits}`) ||
                idNumberToken.includes(`semester${hintDigits}`) ||
                nameToken === `s${hintDigits}` ||
                idNumberToken === `s${hintDigits}`
            );
        }

        return false;
    });

    return byLevelAndNumber ? Number(byLevelAndNumber.id) : null;
}

function isMoodleConnectionError(error) {
    const code = String(error?.code || '').toUpperCase();
    const message = String(error?.message || '');
    return code === 'ECONNREFUSED'
        || code === 'ENOTFOUND'
        || code === 'ETIMEDOUT'
        || message.includes('ECONNREFUSED')
        || message.includes('ENOTFOUND')
        || message.includes('ETIMEDOUT');
}

async function createMoodleCategoryViaDb(name, parentId, idnumber) {
    const normalizedName = String(name || '').trim();
    if (!normalizedName) {
        throw new Error('Category name is required for DB fallback');
    }

    const existingId = await findMoodleCategoryByName(normalizedName, parentId);
    if (existingId) {
        return existingId;
    }

    let parentDepth = 0;
    let parentPath = '';

    if (Number(parentId) > 0) {
        const [parentRows] = await moodleDbPool.execute(
            `SELECT id, depth, path
               FROM mdl_course_categories
              WHERE id = ?
              LIMIT 1`,
            [parentId]
        );

        if (!parentRows.length) {
            throw new Error(`Parent Moodle category not found for DB fallback: ${parentId}`);
        }

        parentDepth = Number(parentRows[0].depth || 0);
        parentPath = String(parentRows[0].path || '').trim() || `/${parentId}`;
    }

    // Calculate sortorder: children go right after parent's last descendant
    let sortorder;
    if (Number(parentId) > 0) {
        // Find the parent's sortorder and its last descendant's sortorder
        const [parentSortRows] = await moodleDbPool.execute(
            `SELECT sortorder FROM mdl_course_categories WHERE id = ?`, [parentId]
        );
        const parentSort = Number(parentSortRows[0]?.sortorder || 0);

        // Find next sibling of parent (next category at same depth with same grandparent)
        const [parentInfoRows] = await moodleDbPool.execute(
            `SELECT parent AS grandparent FROM mdl_course_categories WHERE id = ?`, [parentId]
        );
        const grandparent = parentInfoRows[0]?.grandparent;
        const [nextSibRows] = await moodleDbPool.execute(
            `SELECT MIN(sortorder) as next_sort FROM mdl_course_categories WHERE parent = ? AND sortorder > ?`,
            [grandparent, parentSort]
        );
        const nextSibSort = nextSibRows[0]?.next_sort;

        if (nextSibSort) {
            // Place before next sibling - find last child sortorder under this parent
            const [lastChildRows] = await moodleDbPool.execute(
                `SELECT MAX(sortorder) as max_child FROM mdl_course_categories WHERE path LIKE ?`,
                [`${parentPath}/%`]
            );
            const lastChild = Number(lastChildRows[0]?.max_child || parentSort);
            sortorder = lastChild + 10000;
            // If that would exceed next sibling, shift everything after up
            if (sortorder >= nextSibSort) {
                await moodleDbPool.execute(
                    `UPDATE mdl_course_categories SET sortorder = sortorder + 10000 WHERE sortorder >= ?`,
                    [sortorder]
                );
            }
        } else {
            // No next sibling, just use global max + 10000
            const [maxRows] = await moodleDbPool.execute(
                `SELECT COALESCE(MAX(sortorder), 0) AS mx FROM mdl_course_categories`
            );
            sortorder = Number(maxRows[0]?.mx || 0) + 10000;
        }
    } else {
        // Root level - use global max + 10000
        const [maxRows] = await moodleDbPool.execute(
            `SELECT COALESCE(MAX(sortorder), 0) AS mx FROM mdl_course_categories`
        );
        sortorder = Number(maxRows[0]?.mx || 0) + 10000;
    }

    const now = Math.floor(Date.now() / 1000);

    const [insertResult] = await moodleDbPool.execute(
        `INSERT INTO mdl_course_categories (
            name, idnumber, description, descriptionformat, parent, sortorder,
            coursecount, visible, visibleold, timemodified, depth, path, theme
        ) VALUES (?, ?, '', 0, ?, ?, 0, 1, 1, ?, ?, '', NULL)`,
        [normalizedName, idnumber || '', parentId, sortorder, now, parentDepth + 1]
    );

    const newId = Number(insertResult.insertId);
    if (!newId) {
        throw new Error(`Failed DB fallback insert for Moodle category: ${normalizedName}`);
    }

    const newPath = parentPath ? `${parentPath}/${newId}` : `/${newId}`;
    await moodleDbPool.execute(
        `UPDATE mdl_course_categories
            SET path = ?, depth = ?, timemodified = ?
          WHERE id = ?`,
        [newPath, parentDepth + 1, now, newId]
    );

    // Create Moodle context record (contextlevel 40 = category)
    try {
        // Find parent context
        let parentCtxPath = '/1'; // System context
        let parentCtxDepth = 1;
        if (Number(parentId) > 0) {
            const [ctxRows] = await moodleDbPool.execute(
                `SELECT id, path, depth FROM mdl_context WHERE contextlevel = 40 AND instanceid = ? LIMIT 1`,
                [parentId]
            );
            if (ctxRows.length) {
                parentCtxPath = ctxRows[0].path || '/1';
                parentCtxDepth = Number(ctxRows[0].depth || 1);
            }
        }
        const [ctxInsert] = await moodleDbPool.execute(
            `INSERT INTO mdl_context (contextlevel, instanceid, depth, path) VALUES (40, ?, 0, NULL)`,
            [newId]
        );
        const ctxId = Number(ctxInsert.insertId);
        if (ctxId) {
            await moodleDbPool.execute(
                `UPDATE mdl_context SET path = ?, depth = ? WHERE id = ?`,
                [`${parentCtxPath}/${ctxId}`, parentCtxDepth + 1, ctxId]
            );
        }
    } catch (ctxErr) {
        console.warn(`[createMoodleCategoryViaDb] Context creation warning: ${ctxErr.message}`);
    }

    // Purge Moodle caches so the new category appears immediately
    try {
        await moodleDbPool.execute(`DELETE FROM mdl_cache_flags`);
        await moodleDbPool.execute(`DELETE FROM mdl_cache_filters`);
        // Bump the version hash to force Moodle to rebuild its caches
        const newHash = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        await moodleDbPool.execute(
            `UPDATE mdl_config SET value = ? WHERE name = 'allversionshash'`,
            [newHash]
        );
        // Also clear coursecat cache in MUC store if table exists
        try {
            await moodleDbPool.execute(`DELETE FROM mdl_cache_store WHERE cache LIKE '%coursecat%'`);
        } catch (_) { /* table may not exist */ }
    } catch (cacheErr) {
        console.warn(`[createMoodleCategoryViaDb] Cache purge warning: ${cacheErr.message}`);
    }

    return newId;
}

async function findOrCreateMoodleCategory(name, parentId, idNumberPrefix, explicitIdNumber = null) {
    const normalizedName = String(name || '').trim();
    if (!normalizedName) {
        return parentId;
    }

    // Search by display name first, then by idnumber/code so that a category
    // titled "Arts" with idnumber "ART" is found when we look for "ART".
    let existingId = await findMoodleCategoryByName(normalizedName, parentId);
    if (!existingId) {
        const codeToTry = String(explicitIdNumber || '').trim();
        if (codeToTry && codeToTry !== normalizedName) {
            existingId = await findMoodleCategoryByName(codeToTry, parentId);
        }
    }
    if (existingId) {
        const targetIdNumber = String(explicitIdNumber || '').trim().slice(0, 100);
        if (targetIdNumber) {
            await moodleDbPool.execute(
                `UPDATE mdl_course_categories
                    SET idnumber = ?
                  WHERE id = ?
                    AND (idnumber IS NULL OR idnumber = '' OR idnumber LIKE ?)`,
                [targetIdNumber, existingId, `${idNumberPrefix}-%`]
            ).catch(() => {});
        }
        return existingId;
    }

    const requestedIdNumber = String(explicitIdNumber || '').trim();
    const idnumber = (requestedIdNumber || [idNumberPrefix, toCategorySlug(normalizedName)].filter(Boolean).join('-')).slice(0, 100);
    let created = null;
    try {
        created = await callMoodleRest('core_course_create_categories', {
            categories: [{
                name: normalizedName,
                parent: parentId,
                idnumber
            }]
        });
    } catch (apiError) {
        const msg = String(apiError?.message || '');
        const isAccessError = msg.includes('accessexception') || msg.includes('Access control exception') || msg.includes('is not allowed');
        if (!isMoodleConnectionError(apiError) && !isAccessError) {
            throw apiError;
        }

        // Match registration/induction style resilience: write directly to Moodle DB when REST is unavailable
        // or when the function is not registered in the Moodle service.
        const fallbackId = await createMoodleCategoryViaDb(normalizedName, parentId, idnumber);
        if (fallbackId) {
            return fallbackId;
        }
    }

    const createdId = Array.isArray(created) && created[0]?.id ? Number(created[0].id) : null;
    if (createdId) {
        return createdId;
    }

    const afterCreateId = await findMoodleCategoryByName(normalizedName, parentId);
    if (afterCreateId) {
        return afterCreateId;
    }

    throw new Error(`Failed to create Moodle category: ${normalizedName}`);
}

async function resolveMoodleCategoryIdForRegistration(registration) {
    // First, check if the course already exists in Moodle - use its existing category
    const existingCourse = await getMoodleCourseByCode(registration.course_code);
    if (existingCourse?.category) {
        return Number(existingCourse.category);
    }

    const semesterCategoryId = Number(registration.semester_category_id || 0);
    if (semesterCategoryId > 0) {
        return semesterCategoryId;
    }

    const yearCategoryId = Number(registration.year_category_id || 0);
    if (yearCategoryId > 0) {
        return yearCategoryId;
    }

    const programCategoryId = Number(registration.program_category_id || 0);
    if (programCategoryId > 0) {
        return programCategoryId;
    }

    const programmeTypeCategoryId = Number(registration.programme_type_category_id || 0);
    if (programmeTypeCategoryId > 0) {
        return programmeTypeCategoryId;
    }

    const fallbackCategoryId = getStructureRootCategoryId();
    const programmeTypeName = String(registration.programme_type_name || '').trim();
    const programName = String(registration.program_name || '').trim();
    const academicYear = String(registration.academic_year || '').trim();
    const semesterName = String(registration.semester_name || '').trim();
    const cohortLabel = String(registration.cohort_label || '').trim();
    const hierarchyCodes = buildHierarchyCodePattern(registration.course_code, programmeTypeName, programName, academicYear, semesterName);

    const codeParts = parseCourseCodeStructure(registration.course_code);

    if (!programmeTypeName && !programName && !academicYear && !semesterName && !cohortLabel && !codeParts) {
        return fallbackCategoryId;
    }

    try {
        let parentId = fallbackCategoryId;

        // If course code follows pattern like DEG-001-Y0-S1-C4, use it to resolve existing category path.
        if (codeParts) {
            const programIdByCode = await findMoodleCategoryByCodeHint(codeParts.programCode, parentId, 'program');
            if (programIdByCode) {
                parentId = programIdByCode;

                const yearIdByCode = await findMoodleCategoryByCodeHint(codeParts.yearCode, parentId, 'year');
                if (yearIdByCode) {
                    parentId = yearIdByCode;

                    const semesterIdByCode = await findMoodleCategoryByCodeHint(codeParts.semesterCode, parentId, 'semester');
                    if (semesterIdByCode) {
                        return semesterIdByCode;
                    }
                }
            }
        }

        parentId = fallbackCategoryId;
        if (programmeTypeName) {
            parentId = await findOrCreateMoodleCategory(programmeTypeName, parentId, 'programme-type', hierarchyCodes.programmeTypeCode);
        }
        if (programName) {
            parentId = await findOrCreateMoodleCategory(programName, parentId, 'program', hierarchyCodes.programCode);
        }
        if (academicYear) {
            parentId = await findOrCreateMoodleCategory(academicYear, parentId, 'year', hierarchyCodes.yearCode);
        }
        if (semesterName) {
            parentId = await findOrCreateMoodleCategory(semesterName, parentId, 'semester', hierarchyCodes.semesterCode);
        }

        // NOTE: cohort_label should NOT create a Moodle category.
        // Cohorts are created as mdl_cohort records by createOrUpdateMoodleCohort().
        // Course should be placed under the semester category.

        return parentId;
    } catch (error) {
        console.warn(`[COURSE REGISTRATION] Category hierarchy fallback: ${error.message}`);
        return fallbackCategoryId;
    }
}

async function createOrUpdateMoodleCourseCore(registration) {
    const moodleIdNumber = deriveMoodleCourseIdNumber(registration);
    const existingCourse = await getMoodleCourseByCode(moodleIdNumber);
    const summary = buildCourseSummaryFromRegistration(registration);
    const { startDateEpoch, endDateEpoch } = deriveCourseDates(registration);
    const shortname = deriveMoodleShortname(registration);
    const categoryId = await resolveMoodleCategoryIdForRegistration(registration);

    if (existingCourse) {
        try {
            await callMoodleRest('core_course_update_courses', {
                courses: [{
                    id: existingCourse.id,
                    categoryid: categoryId,
                    fullname: registration.course_title,
                    shortname,
                    idnumber: moodleIdNumber,
                    summary,
                    summaryformat: 1,
                    startdate: startDateEpoch,
                    enddate: endDateEpoch,
                    visible: 1
                }]
            });
        } catch (apiError) {
            await moodleDbPool.execute(
                `UPDATE mdl_course
                 SET category = ?, fullname = ?, shortname = ?, idnumber = ?, summary = ?, summaryformat = 1,
                     startdate = ?, enddate = ?, timemodified = ?
                 WHERE id = ?`,
                [categoryId, registration.course_title, shortname, registration.course_code, summary, startDateEpoch, endDateEpoch, Math.floor(Date.now() / 1000), existingCourse.id]
            );
        }

        return { moodleCourseId: Number(existingCourse.id), created: false };
    }

    try {
        const createResult = await callMoodleRest('core_course_create_courses', {
            courses: [{
                fullname: registration.course_title,
                shortname,
                idnumber: moodleIdNumber,
                categoryid: categoryId,
                summary,
                summaryformat: 1,
                format: 'topics',
                visible: 1,
                startdate: startDateEpoch,
                enddate: endDateEpoch
            }]
        });

        const createdCourse = Array.isArray(createResult) ? createResult[0] : null;
        if (!createdCourse?.id) {
            throw new Error('Moodle did not return created course ID');
        }

        return { moodleCourseId: Number(createdCourse.id), created: true };
    } catch (apiError) {
        const now = Math.floor(Date.now() / 1000);

        // Calculate proper sortorder: category_sortorder + 10001 + existing_course_count
        const [[catRow]] = await moodleDbPool.execute(
            'SELECT sortorder FROM mdl_course_categories WHERE id = ?', [categoryId]
        );
        const catSortorder = catRow ? catRow.sortorder : 0;
        const [[countRow]] = await moodleDbPool.execute(
            'SELECT COUNT(*) as cnt FROM mdl_course WHERE category = ?', [categoryId]
        );
        const courseSortorder = catSortorder + 10001 + (countRow ? countRow.cnt : 0);

        const [insertResult] = await moodleDbPool.execute(
            `INSERT INTO mdl_course (
                category, sortorder, fullname, shortname, idnumber, summary, summaryformat, format,
                showgrades, newsitems, startdate, enddate, marker, maxbytes, legacyfiles, showreports,
                visible, visibleold, groupmode, groupmodeforce, defaultgroupingid, timecreated, timemodified
            ) VALUES (?, ?, ?, ?, ?, ?, 1, 'topics', 1, 5, ?, ?, 0, 0, 0, 0, 1, 1, 0, 0, 0, ?, ?)`,
            [categoryId, courseSortorder, registration.course_title, shortname, moodleIdNumber, summary, startDateEpoch, endDateEpoch, now, now]
        );

        const newCourseId = Number(insertResult.insertId);

        // Update category coursecount
        await moodleDbPool.execute(
            'UPDATE mdl_course_categories SET coursecount = coursecount + 1 WHERE id = ?', [categoryId]
        );

        // Create context record (contextlevel=50 for courses)
        const [[catCtx]] = await moodleDbPool.execute(
            'SELECT id, path, depth FROM mdl_context WHERE instanceid = ? AND contextlevel = 40', [categoryId]
        );
        if (catCtx) {
            const [ctxIns] = await moodleDbPool.execute(
                'INSERT INTO mdl_context (contextlevel, instanceid, depth, locked) VALUES (50, ?, ?, 0)',
                [newCourseId, catCtx.depth + 1]
            );
            const ctxId = ctxIns.insertId;
            await moodleDbPool.execute(
                'UPDATE mdl_context SET path = ? WHERE id = ?',
                [catCtx.path + '/' + ctxId, ctxId]
            );
        }

        // Purge Moodle caches
        await moodleDbPool.execute('DELETE FROM mdl_cache_flags');
        await moodleDbPool.execute('DELETE FROM mdl_cache_filters');
        const tsStr = now.toString();
        await moodleDbPool.execute("UPDATE mdl_config SET value = ? WHERE name = 'allversionshash'", [tsStr]);

        return { moodleCourseId: newCourseId, created: true };
    }
}

async function ensureManualEnrolmentForCourse(courseId) {
    const [rows] = await moodleDbPool.execute(
        `SELECT id FROM mdl_enrol WHERE courseid = ? AND enrol = 'manual' LIMIT 1`,
        [courseId]
    );

    if (rows.length > 0) {
        return Number(rows[0].id);
    }

    const now = Math.floor(Date.now() / 1000);
    const [insertResult] = await moodleDbPool.execute(
        `INSERT INTO mdl_enrol (
            enrol, status, courseid, sortorder, name, enrolperiod, expirythreshold,
            expirynotify, notifyall, enrolstartdate, enrolenddate, timecreated, timemodified, customint6
        ) VALUES ('manual', 0, ?, 0, '', 0, 0, 0, 0, 0, 0, ?, ?, 5)`,
        [courseId, now, now]
    );

    return Number(insertResult.insertId);
}

// Fields that describe the programme itself — go on the HND-001-INFO course (stable, same across all cohorts)
const PROGRAMME_CUSTOM_FIELD_ALIASES = {
    course_type:                    ['course_type', 'course_type_id', 'type_of_course'],
    awarding_body_accreditation:    ['awarding_body_accreditation', 'awarding_body', 'accreditation'],
    regulation_level:               ['regulation_level', 'rqf_level'],
    subject_area_discipline:        ['subject_area_discipline', 'subject_area', 'discipline'],
    learning_outcomes:              ['learning_outcomes'],
    units_modules_covered:          ['units_modules_covered', 'units_modules'],
    entry_requirements:             ['entry_requirements'],
    learning_resources_provided:    ['learning_resources_provided'],
    special_admission_considerations: ['special_admission_considerations'],
    progression_opportunities:      ['progression_opportunities'],
    industry_partnerships:          ['industry_partnerships'],
};

// Fields that are specific to a cohort intake — go on the HND-001-SEP-2025 cohort course
const COHORT_CUSTOM_FIELD_ALIASES = {
    mode_of_delivery:               ['mode_of_delivery', 'delivery_mode'],
    end_date_or_duration:           ['end_date_or_duration', 'duration'],
    assessment_methods:             ['assessment_methods', 'assessment_method'],
    tuition_fee_gbp:                ['tuition_fee_gbp', 'tuition_fee'],
    additional_costs:               ['additional_costs'],
    funding_options:                ['funding_options'],
    special_equipment_needed:       ['special_equipment_needed'],
    work_placement_included:        ['work_placement_included', 'work_placement_internship_included'],
    course_leader_programme_director: ['course_leader_programme_director', 'course_leader'],
    internal_verification_contact:  ['internal_verification_contact'],
    ukvi_approved_course:           ['ukvi_approved_course'],
    approval_date:                  ['approval_date'],
    review_date:                    ['review_date'],
};

// Combined (used by existing single-course sync path)
const COURSE_CUSTOM_FIELD_ALIASES = { ...PROGRAMME_CUSTOM_FIELD_ALIASES, ...COHORT_CUSTOM_FIELD_ALIASES };

async function upsertMoodleCourseCustomFields(courseId, registration, aliasMap = COURSE_CUSTOM_FIELD_ALIASES) {
    let fields = [];
    try {
        const [rows] = await moodleDbPool.execute(
            `SELECT f.id, f.shortname, f.name
             FROM mdl_customfield_field f
             INNER JOIN mdl_customfield_category c ON c.id = f.categoryid
             WHERE c.component = 'core_course' AND c.area = 'course'`
        );
        fields = rows;
    } catch (error) {
        return { updated: 0, message: 'Custom field tables not available; skipped custom field sync' };
    }

    if (!fields.length) {
        return { updated: 0, message: 'No Moodle course custom fields found; skipped custom field sync' };
    }

    const fieldsByKey = new Map();
    fields.forEach((field) => {
        fieldsByKey.set(normalizeFieldKey(field.shortname), field);
        fieldsByKey.set(normalizeFieldKey(field.name), field);
    });

    let updates = 0;
    for (const [payloadKey, aliases] of Object.entries(aliasMap)) {
        const rawValue = registration[payloadKey];
        if (rawValue === null || rawValue === undefined || rawValue === '') {
            continue;
        }

        const matchedField = aliases
            .map((alias) => fieldsByKey.get(normalizeFieldKey(alias)))
            .find(Boolean);

        if (!matchedField) {
            continue;
        }

        const valueText = String(rawValue);
        const charValue = valueText.slice(0, 255);
        const numericValue = Number(rawValue);
        const intValue = Number.isInteger(numericValue) ? numericValue : 0;
        
        // Safely convert to decimal with range validation (DECIMAL(15,2) range: -9999999999.99 to 9999999999.99)
        let decValue = 0;
        if (Number.isFinite(numericValue)) {
            // Round to 2 decimal places for currency/monetary fields
            decValue = Math.round(numericValue * 100) / 100;
            // Clamp to valid DECIMAL(15,2) range
            decValue = Math.max(-9999999999.99, Math.min(9999999999.99, decValue));
        }
        const now = Math.floor(Date.now() / 1000);

        await moodleDbPool.execute(
            `INSERT INTO mdl_customfield_data (
                fieldid, instanceid, intvalue, decvalue, shortcharvalue, charvalue, value,
                valueformat, timecreated, timemodified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
            ON DUPLICATE KEY UPDATE
                intvalue = VALUES(intvalue),
                decvalue = VALUES(decvalue),
                shortcharvalue = VALUES(shortcharvalue),
                charvalue = VALUES(charvalue),
                value = VALUES(value),
                timemodified = VALUES(timemodified)`,
            [matchedField.id, courseId, intValue, decValue, charValue, charValue, valueText, now, now]
        );
        updates += 1;
    }

    return { updated: updates, message: `Updated ${updates} Moodle custom field value(s)` };
}

async function upsertMoodleCourseSections(courseId, unitsModulesCovered) {
    const modules = parseCourseModules(unitsModulesCovered);
    if (!modules.length) {
        return { updated: 0, message: 'No modules supplied; skipped section sync' };
    }

    const [existingRows] = await moodleDbPool.execute(
        `SELECT id, section FROM mdl_course_sections WHERE course = ? AND section > 0`,
        [courseId]
    );
    const existingBySection = new Map(existingRows.map((row) => [Number(row.section), Number(row.id)]));
    const now = Math.floor(Date.now() / 1000);
    let updated = 0;

    for (let index = 0; index < modules.length; index += 1) {
        const sectionNumber = index + 1;
        const sectionName = modules[index];

        if (existingBySection.has(sectionNumber)) {
            await moodleDbPool.execute(
                `UPDATE mdl_course_sections
                 SET name = ?, timemodified = ?
                 WHERE id = ?`,
                [sectionName, now, existingBySection.get(sectionNumber)]
            );
        } else {
            await moodleDbPool.execute(
                `INSERT INTO mdl_course_sections (
                    course, section, name, summary, summaryformat, sequence, visible, timemodified
                ) VALUES (?, ?, ?, '', 1, '', 1, ?)`,
                [courseId, sectionNumber, sectionName, now]
            );
        }

        updated += 1;
    }

    return { updated, message: `Synced ${updated} Moodle section(s)` };
}

// Returns the Moodle course ID for the programme INFO course (e.g. HND-001-INFO).
// Creates it inside the programme category if it doesn't exist yet.
async function ensureProgrammeInfoCourse(registration, programmeCategoryId) {
    const infoIdNumber = `${String(registration.course_code || '').trim()}-INFO`;
    const existing = await getMoodleCourseByCode(infoIdNumber);
    if (existing?.id) return { moodleCourseId: Number(existing.id), created: false };

    const infoReg = {
        ...registration,
        // Override idnumber/shortname derivation by injecting into course_code
        course_code: infoIdNumber,
        cohort_label: '',           // no cohort suffix
        programme_type_category_id: null,
        program_category_id: programmeCategoryId, // place directly inside HND-001 category
        year_category_id: null,
        semester_category_id: null,
    };
    const result = await createOrUpdateMoodleCourseCore(infoReg);
    await ensureManualEnrolmentForCourse(result.moodleCourseId);
    return result;
}

async function syncCourseRegistrationToMoodle(registrationId) {
    const [rows] = await db.execute('SELECT * FROM course_registrations WHERE id = ? LIMIT 1', [registrationId]);
    if (rows.length === 0) {
        return { success: false, message: 'Course registration not found' };
    }

    const registration = rows[0];

    try {
        // ── 1. Resolve the programme category (e.g. cat 164 for HND-001) ────────
        // programme_type_category_id points to the type (HND), program_category_id to the programme (HND-001)
        const programmeCategoryId = registration.program_category_id || registration.programme_type_category_id || null;

        // ── 2. Ensure the HND-001-INFO programme course exists ───────────────────
        let infoMessage = '';
        let infoCourseId = null;
        if (programmeCategoryId) {
            const infoSync = await ensureProgrammeInfoCourse(registration, programmeCategoryId);
            infoCourseId = infoSync.moodleCourseId;
            infoMessage = infoSync.created ? 'Programme INFO course created' : 'Programme INFO course exists';
            // Push programme-level custom fields + sections onto INFO course
            await upsertMoodleCourseCustomFields(infoCourseId, registration, PROGRAMME_CUSTOM_FIELD_ALIASES);
            await upsertMoodleCourseSections(infoCourseId, registration.units_modules_covered);
        }

        // ── 3. Create/update the cohort course (HND-001-SEP-2025) ────────────────
        const existingMoodleCourse = await getMoodleCourseByCode(
            `${String(registration.course_code || '').trim()}-${toCategorySlug(registration.cohort_label || '').toUpperCase()}`
        ) || await getMoodleCourseByCode(registration.course_code);
        const courseAlreadyExists = Boolean(existingMoodleCourse?.id);

        let moodleCourseId = existingMoodleCourse?.id || null;
        let courseSync = null;
        let customFieldSync = null;
        let sectionSync = null;
        let courseMessage = '';

        // Place cohort course inside the programme category (same level as INFO course)
        const cohortReg = programmeCategoryId
            ? { ...registration, program_category_id: programmeCategoryId, programme_type_category_id: null, year_category_id: null, semester_category_id: null }
            : registration;

        if (!courseAlreadyExists) {
            courseSync = await createOrUpdateMoodleCourseCore(cohortReg);
            moodleCourseId = courseSync.moodleCourseId;
            courseMessage = courseSync.created ? 'Course created in Moodle' : 'Course updated in Moodle';
            await ensureManualEnrolmentForCourse(moodleCourseId);
        } else {
            moodleCourseId = existingMoodleCourse.id;
            courseMessage = 'Course already exists in Moodle';
        }

        // Push cohort-specific custom fields onto the cohort course
        customFieldSync = await upsertMoodleCourseCustomFields(moodleCourseId, registration, COHORT_CUSTOM_FIELD_ALIASES);
        sectionSync = { message: '' }; // sections live on INFO course only

        // Create cohort if cohort_label provided (applies to any registration)
        let cohortSync = null;
        if (registration.cohort_label) {
            cohortSync = await createOrUpdateMoodleCohort(moodleCourseId, registration);
        }

        const syncMessage = [
            infoMessage,
            courseMessage,
            customFieldSync?.message || '',
            cohortSync?.message || ''
        ].filter(Boolean).join(' | ');

        await db.execute(
            `UPDATE course_registrations
             SET moodle_course_id = ?, moodle_sync_status = 'synced', moodle_sync_message = ?, last_synced_at = NOW()
             WHERE id = ?`,
            [moodleCourseId, syncMessage, registrationId]
        );

        return {
            success: true,
            message: syncMessage,
            registration_id: registrationId,
            moodle_course_id: moodleCourseId,
            created_in_moodle: courseSync?.created || false,
            course_already_existed: courseAlreadyExists,
            custom_fields_updated: customFieldSync?.updated || false,
            sections_synced: sectionSync?.updated || false,
            cohort_created_or_updated: Boolean(cohortSync?.success)
        };
    } catch (error) {
        await db.execute(
            `UPDATE course_registrations
             SET moodle_sync_status = 'failed', moodle_sync_message = ?, last_synced_at = NOW()
             WHERE id = ?`,
            [error.message || 'Moodle sync failed', registrationId]
        );

        return {
            success: false,
            message: error.message || 'Moodle sync failed',
            registration_id: registrationId
        };
    }
}

async function extractYearFromCourseOrField(courseCode, academicYear) {
    // Try to extract year from academic_year field first (e.g., "Year 1")
    if (academicYear) {
        const yearMatch = String(academicYear).match(/[Yy]ear\s*(\d+)|Y(\d+)/);
        if (yearMatch) {
            return Number(yearMatch[1] || yearMatch[2]);
        }
    }

    // Fall back to extracting from course code (e.g., "DEG-001-Y1-S1-C1")
    if (courseCode) {
        const codeMatch = String(courseCode).match(/Y(\d+)/i);
        if (codeMatch) {
            return Number(codeMatch[1]);
        }
    }

    return 1; // Default to Year 1
}

async function createOrUpdateMoodleCohort(moodleCourseId, registration) {
    if (!registration.cohort_label) {
        return { success: false, message: 'Missing cohort label' };
    }

    try {
        // Extract program code from course code (e.g., "DEG" from "DEG-001-Y1-S1-C1")
        const programCode = String(registration.course_code || '').split('-')[0].toUpperCase();
        if (!programCode) {
            return { success: false, message: 'Cannot determine program code from course code' };
        }

        // Extract year from academic_year or course code
        const year = await extractYearFromCourseOrField(registration.course_code, registration.academic_year);

        // Create year-based program cohort idnumber: DEG-Y1-2026-Sep
        const cohortIdnumber = `${programCode}-Y${year}-${registration.cohort_label}`.replace(/\s+/g, '-').toLowerCase();
        
        // Cohort name should show program + year + intake: "B.Tech Year 1 - Sep 2026"
        const cohortName = `${registration.programme_type_name || 'Programme'} Year ${year} - ${registration.cohort_label}`;

        // Check if year-based program cohort already exists
        const [existingCohorts] = await moodleDbPool.execute(
            `SELECT id FROM mdl_cohort WHERE idnumber = ? AND contextid = 1 LIMIT 1`,
            [cohortIdnumber]
        );

        let cohortId;
        let created = false;

        if (existingCohorts.length > 0) {
            // Program year cohort already exists
            cohortId = existingCohorts[0].id;
        } else {
            // Create new year-based program cohort
            const now = Math.floor(Date.now() / 1000);
            const [result] = await moodleDbPool.execute(
                `INSERT INTO mdl_cohort (contextid, name, idnumber, description, timecreated, timemodified)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [1, cohortName, cohortIdnumber, `${registration.programme_type_name || 'Programme'} Year ${year} cohort for intake ${registration.cohort_label}`, now, now]
            );
            cohortId = Number(result.insertId);
            created = true;
        }

        // Now link this cohort to ALL courses for this program AND year
        const programYearCourses = await getAllCoursesForProgramAndYear(programCode, year);
        if (programYearCourses.length > 0) {
            for (const course of programYearCourses) {
                // Courses are already linked via the cohort idnumber matching
                // Moodle will auto-enroll students in the cohort to all linked courses
            }
        }

        return {
            success: true,
            message: created ? `Program Year ${year} cohort created in Moodle` : `Program Year ${year} cohort already exists`,
            cohort_id: cohortId,
            cohort_idnumber: cohortIdnumber,
            year: year,
            created: created
        };
    } catch (error) {
        console.error('[createOrUpdateMoodleCohort] Error:', error.message);
        return {
            success: false,
            message: error.message,
            cohort_id: null
        };
    }
}

async function getAllCoursesForProgramAndYear(programCode, year) {
    try {
        // Get all courses that:
        // 1. Start with the program code
        // 2. Contain Y{year} in the idnumber
        // 3. Include both CORE courses and semester courses for that year
        const normalizedCode = String(programCode || '').trim().toUpperCase();
        if (!normalizedCode) return [];

        const [courses] = await moodleDbPool.execute(
            `SELECT id, idnumber, shortname, fullname 
             FROM mdl_course 
             WHERE idnumber LIKE ? AND idnumber LIKE ?
             ORDER BY idnumber ASC`,
            [`${normalizedCode}%`, `%Y${year}%`]
        );

        return courses || [];
    } catch (error) {
        console.error('[getAllCoursesForProgramAndYear] Error:', error.message);
        return [];
    }
}

function mergeRoleValue(existingRoleValue, roleToAdd) {
    const existingRoles = String(existingRoleValue || '')
        .split(/[|,;]+/)
        .map((entry) => String(entry || '').trim())
        .filter(Boolean);

    if (!existingRoles.some((entry) => entry.toLowerCase() === String(roleToAdd || '').trim().toLowerCase())) {
        existingRoles.push(roleToAdd);
    }

    return existingRoles.join(', ');
}

async function createMoodleUserAccountFallback(email, firstName, lastName) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const now = Math.floor(Date.now() / 1000);

    try {
        const [result] = await moodleDbPool.execute(
            `INSERT INTO mdl_user (
                auth, confirmed, mnethostid, username, password, firstname, lastname, email,
                lang, calendartype, timezone, timecreated, timemodified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'manual',
                1,
                1,
                normalizedEmail,
                generateTempPassword(),
                firstName || 'Teacher',
                lastName || 'User',
                normalizedEmail,
                'en',
                'gregorian',
                'Europe/London',
                now,
                now
            ]
        );

        return {
            success: true,
            moodleUserId: Number(result.insertId),
            created: true,
            method: 'db-fallback'
        };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const existingUserId = await getMoodleUserIdByEmail(normalizedEmail);
            if (existingUserId) {
                return { success: true, moodleUserId: existingUserId, created: false, method: 'db-fallback-existing' };
            }
        }
        throw error;
    }
}

async function ensureMoodleUserAccount(email, firstName, lastName) {
    const existingUserId = await getMoodleUserIdByEmail(email);
    if (existingUserId) {
        return { success: true, moodleUserId: existingUserId, created: false };
    }

    const axios = require('axios');
    const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
    const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';

    try {
        await axios.post(
            `${moodleUrl}/webservice/rest/server.php`,
            {
                wstoken: moodleToken,
                wsfunction: 'core_user_create_users',
                users: [{
                    username: email,
                    password: generateTempPassword(),
                    firstname: firstName || 'Teacher',
                    lastname: lastName || 'User',
                    email
                }],
                moodlewsrestformat: 'json'
            }
        );
    } catch (error) {
        console.warn('[MOODLE USER CREATE FALLBACK]', error.message);
        return createMoodleUserAccountFallback(email, firstName, lastName);
    }

    const createdUserId = await getMoodleUserIdByEmail(email);
    if (!createdUserId) {
        return createMoodleUserAccountFallback(email, firstName, lastName);
    }

    return { success: true, moodleUserId: createdUserId, created: true, method: 'webservice' };
}

async function assignTeacherToMoodleCourse(email, firstName, lastName, courseCode, roleShortname = 'editingteacher') {
    try {
        const targetCourse = await getMoodleCourseByCode(courseCode);
        if (!targetCourse) {
            return { success: false, message: 'Course not found in Moodle' };
        }

        const roleId = String(roleShortname || '').toLowerCase() === 'teacher' ? 4 : 3;
        const moodleUserAccount = await ensureMoodleUserAccount(email, firstName, lastName);
        const moodleUserId = moodleUserAccount.moodleUserId;
        const manualEnrolRows = await getManualEnrolmentRows([targetCourse.id]);
        if (manualEnrolRows.length === 0) {
            return { success: false, message: 'No manual enrolment instance found for teacher course assignment' };
        }

        const contextRows = await getCourseContextRows([targetCourse.id]);
        const contextId = contextRows.length > 0 ? Number(contextRows[0].id) : null;
        if (!contextId) {
            return { success: false, message: 'Course context not found in Moodle' };
        }

        const enrolId = Number(manualEnrolRows[0].id);
        const now = Math.floor(Date.now() / 1000);
        const connection = await moodleDbPool.getConnection();

        try {
            await connection.beginTransaction();

            const [existingEnrolments] = await connection.query(
                `SELECT id FROM mdl_user_enrolments WHERE userid = ? AND enrolid = ? LIMIT 1`,
                [moodleUserId, enrolId]
            );

            if (existingEnrolments.length > 0) {
                await connection.query(
                    `UPDATE mdl_user_enrolments
                     SET status = 0, timestart = CASE WHEN timestart = 0 THEN ? ELSE timestart END, timeend = 0, timemodified = ?
                     WHERE userid = ? AND enrolid = ?`,
                    [now, now, moodleUserId, enrolId]
                );
            } else {
                await connection.query(
                    `INSERT INTO mdl_user_enrolments
                        (status, enrolid, userid, timestart, timeend, modifierid, timecreated, timemodified)
                     VALUES (0, ?, ?, ?, 0, 0, ?, ?)`,
                    [enrolId, moodleUserId, now, now, now]
                );
            }

            const [existingAssignments] = await connection.query(
                `SELECT id FROM mdl_role_assignments WHERE roleid = ? AND contextid = ? AND userid = ? LIMIT 1`,
                [roleId, contextId, moodleUserId]
            );

            if (existingAssignments.length === 0) {
                await connection.query(
                    `INSERT INTO mdl_role_assignments
                        (roleid, contextid, userid, timemodified, modifierid, component, itemid, sortorder)
                     VALUES (?, ?, ?, ?, 0, '', 0, 0)`,
                    [roleId, contextId, moodleUserId, now]
                );
            }

            await connection.commit();
            return {
                success: true,
                message: `Teacher assigned to ${targetCourse.fullname}`,
                moodleUserId,
                moodleCourseId: targetCourse.id,
                roleId,
                roleShortname
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('[TEACHER MOODLE ASSIGNMENT ERROR]', error.message);
        return { success: false, message: error.message };
    }
}

async function fallbackUnenrollStudentFromCourseIds(email, courseIds) {
    const ids = Array.from(new Set((courseIds || []).map((id) => Number(id)).filter(Boolean)));
    if (ids.length === 0) {
        return { success: true, message: 'No Moodle courses to cancel', courseCount: 0, method: 'db-fallback' };
    }

    const moodleUserId = await getMoodleUserIdByEmail(email);
    if (!moodleUserId) {
        return { success: false, message: 'User not found in Moodle' };
    }

    const manualEnrolRows = await getManualEnrolmentRows(ids);
    if (manualEnrolRows.length === 0) {
        return {
            success: true,
            message: 'No manual enrolment instances found for cancellation',
            courseCount: 0,
            method: 'db-fallback'
        };
    }

    const enrolIds = manualEnrolRows.map((row) => Number(row.id));
    const now = Math.floor(Date.now() / 1000);
    const connection = await moodleDbPool.getConnection();

    try {
        await connection.beginTransaction();

        const enrolPlaceholders = enrolIds.map(() => '?').join(', ');
        const [existingEnrolments] = await connection.query(
            `SELECT enrolid
             FROM mdl_user_enrolments
             WHERE userid = ?
               AND enrolid IN (${enrolPlaceholders})`,
            [moodleUserId, ...enrolIds]
        );

        const existingEnrolIds = existingEnrolments.map((row) => Number(row.enrolid));
        if (existingEnrolIds.length === 0) {
            await connection.commit();
            return {
                success: true,
                message: 'No active Moodle enrolment records found to cancel',
                courseCount: 0,
                method: 'db-fallback'
            };
        }

        const existingEnrolPlaceholders = existingEnrolIds.map(() => '?').join(', ');
        await connection.query(
            `UPDATE mdl_user_enrolments
             SET status = 1,
                 timeend = CASE WHEN timeend = 0 OR timeend > ? THEN ? ELSE timeend END,
                 modifierid = 0,
                 timemodified = ?
             WHERE userid = ?
               AND enrolid IN (${existingEnrolPlaceholders})`,
            [now, now, now, moodleUserId, ...existingEnrolIds]
        );

        await connection.commit();
        console.log(`[MOODLE DB SUSPEND] Suspended ${email} in ${existingEnrolIds.length} course(s) at ${now}`);

        return {
            success: true,
            message: `Cancelled registration in ${existingEnrolIds.length} Moodle course(s) via DB fallback`,
            courseCount: existingEnrolIds.length,
            method: 'db-fallback'
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function hardUnenrollStudentFromCourseIds(email, courseIds) {
    const ids = Array.from(new Set((courseIds || []).map((id) => Number(id)).filter(Boolean)));
    if (ids.length === 0) {
        return { success: true, message: 'No Moodle courses to remove', courseCount: 0, method: 'hard-unenrol' };
    }

    const moodleUserId = await getMoodleUserIdByEmail(email);
    if (!moodleUserId) {
        return { success: false, message: 'User not found in Moodle' };
    }

    try {
        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';

        await axios.post(
            `${moodleUrl}/webservice/rest/server.php`,
            {
                wstoken: moodleToken,
                wsfunction: 'enrol_manual_unenrol_users',
                enrolments: ids.map((courseId) => ({
                    userid: moodleUserId,
                    courseid: courseId
                })),
                moodlewsrestformat: 'json'
            }
        );

        return {
            success: true,
            message: `Removed student from ${ids.length} Moodle course(s)`,
            courseCount: ids.length,
            method: 'hard-unenrol-api'
        };
    } catch (apiError) {
        const manualEnrolRows = await getManualEnrolmentRows(ids);
        if (manualEnrolRows.length === 0) {
            return {
                success: true,
                message: 'No manual enrolment instances found for removal',
                courseCount: 0,
                method: 'hard-unenrol-db'
            };
        }

        const enrolIds = manualEnrolRows.map((row) => Number(row.id));
        const placeholders = enrolIds.map(() => '?').join(', ');
        const [result] = await moodleDbPool.execute(
            `DELETE FROM mdl_user_enrolments
             WHERE userid = ? AND enrolid IN (${placeholders})`,
            [moodleUserId, ...enrolIds]
        );

        return {
            success: true,
            message: `Removed student from ${result.affectedRows || 0} Moodle enrolment record(s) via DB fallback`,
            courseCount: result.affectedRows || 0,
            method: 'hard-unenrol-db'
        };
    }
}

async function fallbackEnrollStudentInCourseIds(email, courseIds) {
    const ids = Array.from(new Set((courseIds || []).map((id) => Number(id)).filter(Boolean)));
    if (ids.length === 0) {
        return { success: false, message: 'No Moodle courses supplied for enrolment' };
    }

    const moodleUserId = await getMoodleUserIdByEmail(email);
    if (!moodleUserId) {
        return { success: false, message: 'User not found in Moodle' };
    }

    const manualEnrolRows = await getManualEnrolmentRows(ids);
    if (manualEnrolRows.length === 0) {
        return { success: false, message: 'No manual enrolment instances found for these courses' };
    }

    const contextRows = await getCourseContextRows(manualEnrolRows.map((row) => row.courseid));
    const contextByCourseId = new Map(contextRows.map((row) => [Number(row.instanceid), Number(row.id)]));
    const enrolIds = manualEnrolRows.map((row) => Number(row.id));
    const contextIds = Array.from(new Set(manualEnrolRows.map((row) => contextByCourseId.get(Number(row.courseid))).filter(Boolean)));
    const now = Math.floor(Date.now() / 1000);
    const connection = await moodleDbPool.getConnection();

    try {
        await connection.beginTransaction();

        const enrolPlaceholders = enrolIds.map(() => '?').join(', ');
        const [existingEnrolments] = await connection.query(
            `SELECT enrolid
             FROM mdl_user_enrolments
             WHERE userid = ?
               AND enrolid IN (${enrolPlaceholders})`,
            [moodleUserId, ...enrolIds]
        );
        const existingEnrolIds = new Set(existingEnrolments.map((row) => Number(row.enrolid)));

        for (const enrolRow of manualEnrolRows) {
            const enrolId = Number(enrolRow.id);
            if (existingEnrolIds.has(enrolId)) {
                await connection.query(
                    `UPDATE mdl_user_enrolments
                     SET status = 0,
                         timestart = CASE WHEN timestart = 0 THEN ? ELSE timestart END,
                         timeend = 0,
                         modifierid = 0,
                         timemodified = ?
                     WHERE userid = ? AND enrolid = ?`,
                    [now, now, moodleUserId, enrolId]
                );
            } else {
                await connection.query(
                    `INSERT INTO mdl_user_enrolments
                        (status, enrolid, userid, timestart, timeend, modifierid, timecreated, timemodified)
                     VALUES (0, ?, ?, ?, 0, 0, ?, ?)`,
                    [enrolId, moodleUserId, now, now, now]
                );
            }
        }

        if (contextIds.length > 0) {
            const contextPlaceholders = contextIds.map(() => '?').join(', ');
            const [existingAssignments] = await connection.query(
                `SELECT contextid
                 FROM mdl_role_assignments
                 WHERE userid = ?
                   AND roleid = 5
                   AND contextid IN (${contextPlaceholders})`,
                [moodleUserId, ...contextIds]
            );
            const existingContextIds = new Set(existingAssignments.map((row) => Number(row.contextid)));

            for (const courseId of ids) {
                const contextId = contextByCourseId.get(courseId);
                if (!contextId || existingContextIds.has(contextId)) {
                    continue;
                }

                await connection.query(
                    `INSERT INTO mdl_role_assignments
                        (roleid, contextid, userid, timemodified, modifierid, component, itemid, sortorder)
                     VALUES (5, ?, ?, ?, 0, '', 0, 0)`,
                    [contextId, moodleUserId, now]
                );
            }
        }

        await connection.commit();
        console.log(`[MOODLE DB ENROLL] Enrolled ${email} in ${manualEnrolRows.length} course(s) at ${now}`);

        return {
            success: true,
            message: `Enrolled in ${manualEnrolRows.length} Moodle course(s) via DB fallback`,
            courseCount: manualEnrolRows.length,
            moodleUserId,
            method: 'db-fallback'
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getProgrammeModuleCourses(programmeCode) {
    const [allCourses] = await moodleDbPool.query(`
        SELECT DISTINCT
            c.id,
            c.idnumber,
            c.shortname,
            c.fullname,
            c.category,
            cc.name as cat_name,
            cc.depth as cat_depth
        FROM mdl_course c
        LEFT JOIN mdl_course_categories cc ON c.category = cc.id
        WHERE c.id > 1 AND c.visible = 1
            AND (
                c.idnumber LIKE CONCAT(?, '%')
                OR c.shortname LIKE CONCAT(?, '%')
            )
            AND (
                c.idnumber NOT LIKE '%-INFO%'
                OR c.idnumber IS NULL
            )
        ORDER BY
            CASE
                WHEN c.idnumber REGEXP '-Y0-' THEN 0
                WHEN c.idnumber REGEXP '-Y1-' THEN 1
                WHEN c.idnumber REGEXP '-Y2-' THEN 2
                WHEN c.idnumber REGEXP '-Y3-' THEN 3
                ELSE 4
            END,
            CASE
                WHEN c.idnumber REGEXP '-S1' THEN 0
                WHEN c.idnumber REGEXP '-S2' THEN 1
                ELSE 2
            END,
            c.fullname ASC
    `, [programmeCode, programmeCode]);

    return allCourses;
}

async function enforceProgrammeProgressionLocks(email, programmeCode) {
    const normalizedProgrammeCode = String(programmeCode || '').trim().toUpperCase();
    if (!email || !normalizedProgrammeCode) {
        return {
            success: false,
            message: 'Missing email or programme code for progression enforcement'
        };
    }

    const moodleUserId = await getMoodleUserIdByEmail(email);
    if (!moodleUserId) {
        return { success: false, message: 'User not found in Moodle' };
    }

    const programmeCourses = await getProgrammeModuleCourses(normalizedProgrammeCode);
    if (programmeCourses.length === 0) {
        return {
            success: true,
            message: 'No programme module courses found for progression enforcement',
            lockedCourses: 0,
            unlockedCourses: 0,
            updatedRows: 0
        };
    }

    const normalizedProgrammeCourses = programmeCourses.map((course) => ({
        id: Number(course.id),
        course_code: course.idnumber || course.shortname || ''
    }));

    const courseIds = normalizedProgrammeCourses.map((course) => course.id);
    const completedCourseIds = await getCompletedCourseIdsByEmail(email, courseIds);
    const manualEnrolRows = await getManualEnrolmentRows(courseIds);
    const enrolByCourseId = new Map(manualEnrolRows.map((row) => [Number(row.courseid), Number(row.id)]));

    if (manualEnrolRows.length === 0) {
        return {
            success: true,
            message: 'No manual enrolment rows found while enforcing progression',
            lockedCourses: 0,
            unlockedCourses: 0,
            updatedRows: 0
        };
    }

    const enrolIds = manualEnrolRows.map((row) => Number(row.id));
    const enrolPlaceholders = enrolIds.map(() => '?').join(', ');
    const [userEnrolRows] = await moodleDbPool.query(
        `SELECT enrolid, status
         FROM mdl_user_enrolments
         WHERE userid = ?
           AND enrolid IN (${enrolPlaceholders})`,
        [moodleUserId, ...enrolIds]
    );

    const statusByEnrolId = new Map(userEnrolRows.map((row) => [Number(row.enrolid), Number(row.status)]));
    const now = Math.floor(Date.now() / 1000);
    const updates = [];
    let lockedCourses = 0;
    let unlockedCourses = 0;

    for (const course of normalizedProgrammeCourses) {
        const enrolId = enrolByCourseId.get(course.id);
        if (!enrolId || !statusByEnrolId.has(enrolId)) {
            continue;
        }

        const progressionResult = isYearUnlocked(course, normalizedProgrammeCourses, completedCourseIds);
        const unlocked = progressionResult.unlocked;
        if (unlocked) {
            unlockedCourses += 1;
        } else {
            lockedCourses += 1;
        }

        const targetStatus = unlocked ? 0 : 1;
        const currentStatus = Number(statusByEnrolId.get(enrolId));
        if (currentStatus !== targetStatus) {
            updates.push({ enrolId, targetStatus });
        }
    }

    if (updates.length > 0) {
        const connection = await moodleDbPool.getConnection();
        try {
            await connection.beginTransaction();
            for (const update of updates) {
                await connection.query(
                    `UPDATE mdl_user_enrolments
                     SET status = ?,
                         timemodified = ?,
                         modifierid = 0,
                         timeend = CASE
                            WHEN ? = 1 AND (timeend = 0 OR timeend > ?) THEN ?
                            WHEN ? = 0 THEN 0
                            ELSE timeend
                         END
                     WHERE userid = ? AND enrolid = ?`,
                    [
                        update.targetStatus,
                        now,
                        update.targetStatus,
                        now,
                        now,
                        update.targetStatus,
                        moodleUserId,
                        update.enrolId
                    ]
                );
            }
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    return {
        success: true,
        message: `Progression enforced for ${normalizedProgrammeCode}`,
        lockedCourses,
        unlockedCourses,
        updatedRows: updates.length
    };
}

function courseBelongsToProgramme(courseCode, programmeCode) {
    const normalizedCourseCode = String(courseCode || '').trim().toUpperCase();
    const normalizedProgrammeCode = String(programmeCode || '').trim().toUpperCase();

    if (!normalizedCourseCode || !normalizedProgrammeCode) {
        return false;
    }

    return normalizedCourseCode === `${normalizedProgrammeCode}-INFO` || normalizedCourseCode.startsWith(`${normalizedProgrammeCode}-`);
}

async function getStudentEnrolledMoodleCourses(email) {
    const [enrolledRows] = await moodleDbPool.execute(`
        SELECT DISTINCT
            c.id,
            c.idnumber AS course_code,
            c.shortname AS course_shortname,
            c.fullname AS course_title,
            COALESCE(cc.name, 'General') AS course_type,
            c.summary AS description
        FROM mdl_user u
        INNER JOIN mdl_user_enrolments ue ON ue.userid = u.id AND ue.status = 0
        INNER JOIN mdl_enrol e ON e.id = ue.enrolid AND e.status = 0
        INNER JOIN mdl_course c ON c.id = e.courseid
        LEFT JOIN mdl_course_categories cc ON c.category = cc.id
        WHERE u.email = ?
          AND c.id > 1
          AND c.visible = 1
        ORDER BY c.fullname ASC
    `, [email]);

    return enrolledRows.map((course) => ({
        id: Number(course.id),
        course_code: course.course_code || course.course_shortname || `COURSE-${course.id}`,
        course_title: course.course_title,
        course_type: course.course_type,
        description: course.description || course.course_title
    }));
}

async function getStudentAllMoodleEnrolments(email) {
    if (!email) {
        return [];
    }

    const [rows] = await moodleDbPool.execute(
        `SELECT DISTINCT
            c.id,
            c.idnumber AS course_code,
            c.shortname AS course_shortname,
            c.fullname AS course_title,
            ue.status AS enrol_status
         FROM mdl_user u
         INNER JOIN mdl_user_enrolments ue ON ue.userid = u.id
         INNER JOIN mdl_enrol e ON e.id = ue.enrolid
         INNER JOIN mdl_course c ON c.id = e.courseid
         WHERE u.email = ?
           AND c.id > 1
         ORDER BY c.id`,
        [email]
    );

    return rows.map((row) => ({
        id: Number(row.id),
        course_code: row.course_code || row.course_shortname || `COURSE-${row.id}`,
        course_title: row.course_title,
        enrol_status: Number(row.enrol_status)
    }));
}

async function getStudentProgrammeMoodleEnrolments(email, programmeCode) {
    const normalizedProgrammeCode = String(programmeCode || '').trim().toUpperCase();
    if (!email || !normalizedProgrammeCode) {
        return [];
    }

    const [rows] = await moodleDbPool.execute(
        `SELECT DISTINCT
            c.id,
            c.idnumber AS course_code,
            c.shortname AS course_shortname,
            c.fullname AS course_title,
            ue.status AS enrol_status
         FROM mdl_user u
         INNER JOIN mdl_user_enrolments ue ON ue.userid = u.id
         INNER JOIN mdl_enrol e ON e.id = ue.enrolid
         INNER JOIN mdl_course c ON c.id = e.courseid
         WHERE u.email = ?
           AND c.id > 1
           AND (c.idnumber = ? OR c.idnumber LIKE CONCAT(?, '-%'))
         ORDER BY c.id`,
        [email, `${normalizedProgrammeCode}-INFO`, normalizedProgrammeCode]
    );

    return rows.map((row) => ({
        id: Number(row.id),
        course_code: row.course_code || row.course_shortname || `COURSE-${row.id}`,
        course_title: row.course_title,
        enrol_status: Number(row.enrol_status)
    }));
}

async function unenrollStudentFromCourseIds(email, courseIds) {
    try {
        const ids = Array.from(new Set((courseIds || []).map((id) => Number(id)).filter(Boolean)));
        if (ids.length === 0) {
            return { success: true, message: 'No Moodle courses to cancel', courseCount: 0 };
        }

        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';
        const moodleUserId = await getMoodleUserIdByEmail(email);

        if (!moodleUserId) {
            return { success: false, message: 'User not found in Moodle' };
        }

        await axios.post(
            `${moodleUrl}/webservice/rest/server.php`,
            {
                wstoken: moodleToken,
                wsfunction: 'enrol_manual_enrol_users',
                enrolments: ids.map((courseId) => ({
                    userid: moodleUserId,
                    courseid: courseId,
                    roleid: 5,
                    status: 1
                })),
                moodlewsrestformat: 'json'
            }
        );

        return {
            success: true,
            message: `Cancelled registration in ${ids.length} Moodle course(s)`,
            courseCount: ids.length
        };
    } catch (error) {
        console.error('[COURSE BATCH UNENROLL ERROR]', error.message);
        try {
            return await fallbackUnenrollStudentFromCourseIds(email, courseIds);
        } catch (fallbackError) {
            console.error('[COURSE BATCH UNENROLL FALLBACK ERROR]', fallbackError.message);
            return {
                success: false,
                message: `Batch unenrolment failed: ${error.message}. DB fallback failed: ${fallbackError.message}`
            };
        }
    }
}

async function unenrollStudentFromProgrammeCourses(email, infoCourseCode) {
    try {
        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';

        const programmeCode = extractProgrammeCode(infoCourseCode);
        if (!programmeCode) {
            return { success: false, message: 'Invalid programme code format' };
        }

        const moodleUserId = await getMoodleUserIdByEmail(email);
        if (!moodleUserId) {
            return { success: false, message: 'User not found in Moodle' };
        }

        const allCourses = await getProgrammeModuleCourses(programmeCode);
        if (allCourses.length === 0) {
            return { success: true, message: 'No old programme module courses found', courseCount: 0 };
        }

        await axios.post(
            `${moodleUrl}/webservice/rest/server.php`,
            {
                wstoken: moodleToken,
                wsfunction: 'enrol_manual_enrol_users',
                enrolments: allCourses.map((course) => ({
                    userid: moodleUserId,
                    courseid: course.id,
                    roleid: 5,
                    status: 1
                })),
                moodlewsrestformat: 'json'
            }
        );

        console.log(`[PROG SUSPEND] Student ${email} registration cancelled in ${allCourses.length} courses for ${programmeCode}`);
        return {
            success: true,
            message: `Cancelled registration in ${allCourses.length} programme courses`,
            courseCount: allCourses.length
        };
    } catch (error) {
        console.error('[PROG UNENROLL ERROR]', error.message);
        try {
            const allCourses = await getProgrammeModuleCourses(extractProgrammeCode(infoCourseCode));
            return await fallbackUnenrollStudentFromCourseIds(email, allCourses.map((course) => course.id));
        } catch (fallbackError) {
            console.error('[PROG UNENROLL FALLBACK ERROR]', fallbackError.message);
            return {
                success: false,
                message: `Programme unenrolment failed: ${error.message}. DB fallback failed: ${fallbackError.message}`
            };
        }
    }
}

async function unenrollStudentFromSingleCourse(email, courseCode) {
    try {
        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';

        const moodleUserId = await getMoodleUserIdByEmail(email);
        if (!moodleUserId) {
            return { success: false, message: 'User not found in Moodle' };
        }

        const matchingCourse = await getMoodleCourseByCode(courseCode);

        if (!matchingCourse) {
            return { success: true, message: 'No old course found to unenrol' };
        }

        await axios.post(
            `${moodleUrl}/webservice/rest/server.php`,
            {
                wstoken: moodleToken,
                wsfunction: 'enrol_manual_enrol_users',
                enrolments: [{
                    userid: moodleUserId,
                    courseid: matchingCourse.id,
                    roleid: 5,
                    status: 1
                }],
                moodlewsrestformat: 'json'
            }
        );

        console.log(`[COURSE SUSPEND] Student ${email} registration cancelled in ${matchingCourse.fullname}`);
        return { success: true, message: `Cancelled registration in ${matchingCourse.fullname}` };
    } catch (error) {
        console.error('[COURSE UNENROLL ERROR]', error.message);
        try {
            const matchingCourse = await getMoodleCourseByCode(courseCode);
            if (!matchingCourse) {
                return { success: true, message: 'No old course found to unenrol' };
            }

            const fallbackResult = await fallbackUnenrollStudentFromCourseIds(email, [matchingCourse.id]);
            return {
                ...fallbackResult,
                message: fallbackResult.success ? `Cancelled registration in ${matchingCourse.fullname} via DB fallback` : fallbackResult.message
            };
        } catch (fallbackError) {
            console.error('[COURSE UNENROLL FALLBACK ERROR]', fallbackError.message);
            return {
                success: false,
                message: `Course unenrolment failed: ${error.message}. DB fallback failed: ${fallbackError.message}`
            };
        }
    }
}

// Helper function to enroll student in ALL module courses of their programme
async function enrollStudentInProgrammeCourses(email, firstName, lastName, infoCourseCode, intakeStartDate) {
    try {
        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';

        console.log(`[PROG ENROLL] Attempting to enrol ${email} in all courses for programme: ${infoCourseCode}`);

        // Step 1: Extract programme code from INFO course code (e.g., DEG-001-INFO → DEG-001)
        const programmeCode = extractProgrammeCode(infoCourseCode);
        if (!programmeCode) {
            console.warn(`[PROG ENROLL] Could not extract programme code from: ${infoCourseCode}`);
            return { success: false, message: 'Invalid programme code format' };
        }

        // Step 2: Use direct DB to find all courses under this programme's category hierarchy
        const allCourses = await getProgrammeModuleCourses(programmeCode);

        console.log(`[PROG ENROLL] Found ${allCourses.length} module courses for programme ${programmeCode}`);

        if (allCourses.length === 0) {
            return { success: false, message: 'No module courses found for this programme' };
        }

        // Step 3: Create user in Moodle if not exists
        try {
            await axios.post(
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
                            preferences: [{ type: 'auth_forcepasswordchange', value: '1' }]
                        }
                    ],
                    moodlewsrestformat: 'json'
                }
            );
            console.log(`[PROG ENROLL] User created/verified in Moodle for ${email}`);
        } catch (userCreateError) {
            console.log(`[PROG ENROLL] User ${email} already exists (or creation skipped)`);
        }

        // Step 4: Get user ID from Moodle
        const moodleUserId = await getMoodleUserIdByEmail(email);
        if (!moodleUserId) {
            return { success: false, message: 'User not found in Moodle' };
        }

        console.log(`[PROG ENROLL] Moodle user ID: ${moodleUserId}`);

        // Step 5: Bulk enrol user in all module courses
        const enrollmentsBatch = allCourses.map(course => ({
            userid: moodleUserId,
            courseid: course.id,
            roleid: 5  // 5 = Student role
        }));

        const enrollResponse = await axios.post(
            `${moodleUrl}/webservice/rest/server.php`,
            {
                wstoken: moodleToken,
                wsfunction: 'enrol_manual_enrol_users',
                enrolments: enrollmentsBatch,
                moodlewsrestformat: 'json'
            }
        );

        // Step 6: Add student to cohorts for each course
        let cohortResults = [];
        if (intakeStartDate) {
            cohortResults = await enrollStudentInCourseCohorts(
                email,
                firstName,
                lastName,
                programmeCode,
                intakeStartDate
            );
        }

        let progressionResult = null;
        try {
            progressionResult = await enforceProgrammeProgressionLocks(email, programmeCode);
        } catch (progressionError) {
            console.warn('[PROG ENROLL PROGRESSION WARNING]', progressionError.message);
        }

        console.log(`[PROG ENROLL] Student ${email} successfully enrolled in ${allCourses.length} courses`);
        return {
            success: true,
            message: `Enrolled in ${allCourses.length} programme courses`,
            courseCount: allCourses.length,
            moodleUserId,
            enrolledCourses: allCourses.map(c => ({ id: c.id, name: c.fullname })),
            cohorts: cohortResults,
            progression: progressionResult
        };

    } catch (error) {
        console.error('[PROG ENROLL ERROR]', error.message);
        try {
            const programmeCode = extractProgrammeCode(infoCourseCode);
            const allCourses = await getProgrammeModuleCourses(programmeCode);
            const fallbackResult = await fallbackEnrollStudentInCourseIds(email, allCourses.map((course) => course.id));
            
            let cohortResults = [];
            if (intakeStartDate) {
                cohortResults = await enrollStudentInCourseCohorts(
                    email,
                    firstName,
                    lastName,
                    programmeCode,
                    intakeStartDate
                );
            }
            
            let progressionResult = null;
            try {
                progressionResult = await enforceProgrammeProgressionLocks(email, programmeCode);
            } catch (progressionError) {
                console.warn('[PROG ENROLL FALLBACK PROGRESSION WARNING]', progressionError.message);
            }
            return {
                ...fallbackResult,
                enrolledCourses: allCourses.map((course) => ({ id: course.id, name: course.fullname })),
                cohorts: cohortResults,
                progression: progressionResult
            };
        } catch (fallbackError) {
            console.error('[PROG ENROLL FALLBACK ERROR]', fallbackError.message);
            return {
                success: false,
                message: `Programme enrolment failed: ${error.message}. DB fallback failed: ${fallbackError.message}`
            };
        }
    }
}

// Helper function to enroll student in Moodle course
async function enrollStudentInMoodle(email, firstName, lastName, courseCode, moodleCourseId = null) {
    try {
        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';

        let targetCourse = null;

        // If moodleCourseId provided, fetch course directly by ID
        if (moodleCourseId) {
            try {
                const [rows] = await moodleDbPool.execute(
                    'SELECT id, fullname, shortname, idnumber FROM mdl_course WHERE id = ?',
                    [moodleCourseId]
                );
                if (rows.length > 0) {
                    targetCourse = rows[0];
                }
            } catch (e) {
                console.warn(`[MOODLE] DB lookup for course ID ${moodleCourseId} failed:`, e.message);
            }
        }

        if (!targetCourse && courseCode) {
            targetCourse = await getMoodleCourseByCode(courseCode);
        }

        // Step 1: Get all courses to find matching course
        if (!targetCourse) {
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
            targetCourse = courses.find(c => 
                c.idnumber === courseCode || 
                c.shortname === courseCode ||
                c.fullname?.includes(courseCode)
            );
        }

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
        try {
            const targetCourse = await getMoodleCourseByCode(courseCode);
            if (!targetCourse) {
                return {
                    success: false,
                    message: `Moodle enrollment failed: ${error.message}`
                };
            }

            const fallbackResult = await fallbackEnrollStudentInCourseIds(email, [targetCourse.id]);
            return {
                ...fallbackResult,
                message: fallbackResult.success ? `Enrolled in ${targetCourse.fullname} via DB fallback` : fallbackResult.message,
                moodleCourseId: targetCourse.id
            };
        } catch (fallbackError) {
            console.error('[MOODLE ENROLL FALLBACK ERROR]', fallbackError.message);
            return { 
                success: false, 
                message: `Moodle enrollment failed: ${error.message}. DB fallback failed: ${fallbackError.message}` 
            };
        }
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

                // Enroll in Moodle course - use programme-wide enrolment for INFO courses
                let moodleEnroll;
                if (app.course_code && app.course_code.toUpperCase().includes('-INFO')) {
                    // Enrol in all programme courses
                    moodleEnroll = await enrollStudentInProgrammeCourses(
                        app.email,
                        app.first_name,
                        app.last_name,
                        app.course_code,
                        app.intake_start_date
                    );
                } else {
                    // Fallback: enrol in single course
                    moodleEnroll = await enrollStudentInMoodle(
                        app.email,
                        app.first_name,
                        app.last_name,
                        app.course_code
                    );
                }

                if (moodleEnroll.success) {
                    console.log(`[BULK APPROVE] Application ${appId}: Enrolled in Moodle (${moodleEnroll.courseCount || 1} course(s))`);
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

≡ƒôº Email/Username: ${app.email}
≡ƒöÉ Temporary Password: ${tempPassword}

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
                middle_names,
                last_name,
                email,
                date_of_birth,
                gender,
                nationality,
                contact_number,
                address_line1,
                address_line2,
                town_city,
                postcode,
                country_of_residence,
                course_title,
                course_code,
                course_type,
                mode_of_study,
                entry_route,
                intake_start_date,
                highest_qualification,
                institution_name,
                year_completed,
                relevant_work_experience,
                english_proficiency,
                english_score,
                application_status,
                submitted_at,
                created_at,
                updated_at
            FROM student_applications
            WHERE email = ? AND is_deleted = FALSE
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

        // Skip Moodle DB in dev if not configured or explicitly disabled
        const enableMoodleIntegration = process.env.ENABLE_MOODLE_INTEGRATION !== 'false';
        const skipMoodleDb = !enableMoodleIntegration || (!process.env.MOODLE_DATABASE_HOST && !process.env.MOODLE_DB_HOST);

        // Try Moodle DB first for accurate course data (using shared connection pool)
        if (!skipMoodleDb) {
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
        }

        // Fallback: Moodle API (skip if not configured or pointing to dev/localhost)
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || process.env.MOODLE_URL;
        const skipMoodleApi = !enableMoodleIntegration || 
            !moodleUrl || 
            moodleUrl.includes('scli-moodle-dev') || 
            moodleUrl.includes('localhost') ||
            moodleUrl.includes('127.0.0.1');

        if (!skipMoodleApi) {
            const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
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
        }
        }

        // Return default programme data (Moodle not available or configured)
        console.log('Returning default programme data for:', courseCode);
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

// Sync student's live Moodle enrolments to current accepted SCL programme
router.post('/sync-moodle-programme', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const [apps] = await db.execute(`
            SELECT id, first_name, last_name, email, course_title, course_code, intake_start_date, application_status, created_at
            FROM student_applications
            WHERE email = ? AND application_status = 'accepted' AND is_deleted = FALSE
            ORDER BY created_at DESC
            LIMIT 1
        `, [email]);

        if (apps.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No accepted application found for this student'
            });
        }

        const application = apps[0];
        const currentProgrammeCode = extractProgrammeCode(application.course_code) || String(application.course_code || '').trim().toUpperCase();
        const enrolledCoursesBefore = await getStudentEnrolledMoodleCourses(email);

        const coursesToRemove = enrolledCoursesBefore.filter((course) => !courseBelongsToProgramme(course.course_code, currentProgrammeCode));
        const unenrollmentResult = await unenrollStudentFromCourseIds(email, coursesToRemove.map((course) => course.id));

        let reenrollmentResult;
        let progressionResult = null;
        if (String(application.course_code || '').toUpperCase().includes('-INFO')) {
            reenrollmentResult = await enrollStudentInProgrammeCourses(
                application.email,
                application.first_name,
                application.last_name,
                application.course_code,
                application.intake_start_date
            );
            try {
                progressionResult = await enforceProgrammeProgressionLocks(application.email, currentProgrammeCode);
            } catch (progressionError) {
                console.warn('[SYNC PROGRESSION WARNING]', progressionError.message);
            }
        } else {
            reenrollmentResult = await enrollStudentInMoodle(
                application.email,
                application.first_name,
                application.last_name,
                application.course_code
            );
        }

        const enrolledCoursesAfter = await getStudentEnrolledMoodleCourses(email);

        res.json({
            success: true,
            message: 'Moodle programme sync completed',
            data: {
                application: {
                    id: application.id,
                    email: application.email,
                    course_title: application.course_title,
                    course_code: application.course_code
                },
                current_programme_code: currentProgrammeCode,
                removed_courses: coursesToRemove,
                moodle_unenrollment: unenrollmentResult,
                moodle_reenrollment: reenrollmentResult,
                progression: progressionResult,
                enrolments_before: enrolledCoursesBefore,
                enrolments_after: enrolledCoursesAfter
            }
        });
    } catch (error) {
        console.error('Error syncing Moodle programme:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync Moodle programme',
            error: error.message
        });
    }
});

// Get student timetable from Moodle course events and assignments
router.get('/timetable/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get student's email from application
        const [appRows] = await db.execute(
            'SELECT id, email FROM student_applications WHERE id = ?',
            [id]
        );

        if (appRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const userEmail = appRows[0].email;

        try {
            // Find Moodle user by email
            const [moodleUsers] = await moodleDbPool.execute(
                `SELECT id FROM mdl_user WHERE email = ?`, [userEmail]
            );

            if (moodleUsers.length === 0) {
                return res.json({
                    success: true,
                    data: {},
                    debug: { message: 'Moodle user not found for email: ' + userEmail }
                });
            }

            const moodleUserId = moodleUsers[0].id;

            // Get ALL enrolled courses via enrollment tables
            const [enrolledCourses] = await moodleDbPool.execute(
                `SELECT DISTINCT c.id
                FROM mdl_course c
                JOIN mdl_enrol e ON e.courseid = c.id
                JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
                WHERE ue.userid = ? AND c.id != 1`,
                [moodleUserId]
            );

            if (enrolledCourses.length === 0) {
                return res.json({
                    success: true,
                    data: {},
                    debug: { message: 'No enrolled courses found' }
                });
            }

            const courseIds = enrolledCourses.map(c => c.id);
            const placeholders = courseIds.map(() => '?').join(',');

            console.log(`Timetable: Found ${courseIds.length} enrolled courses for user ${moodleUserId}`);

            // Get events from mdl_event table for ALL enrolled courses
            const [eventRows] = await moodleDbPool.execute(
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
                WHERE e.courseid IN (${placeholders}) AND e.visible = 1
                ORDER BY e.timestart ASC
                `,
                courseIds
            );

            // Get assignments with due dates from ALL enrolled courses
            const [assignmentRows] = await moodleDbPool.execute(
                `
                SELECT a.id, a.name, a.duedate, cm.id as cm_id
                FROM mdl_assign a
                JOIN mdl_course_modules cm ON cm.instance = a.id AND cm.module = (SELECT id FROM mdl_modules WHERE name = 'assign')
                WHERE cm.course IN (${placeholders}) AND a.duedate > ?
                ORDER BY a.duedate ASC
                `,
                [...courseIds, Math.floor(Date.now() / 1000) - 86400 * 7]
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
        
        // Get student's email from application
        const [appRows] = await db.query(
            `SELECT email FROM student_applications WHERE id = ?`,
            [studentId]
        );

        if (appRows.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        const userEmail = appRows[0].email;
        
        // Find Moodle user by email
        const [moodleUsers] = await moodleDbPool.query(
            `SELECT id FROM mdl_user WHERE email = ?`, [userEmail]
        );

        if (moodleUsers.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const moodleUserId = moodleUsers[0].id;

        // Get ALL enrolled courses via enrollment tables
        const [enrolledCourses] = await moodleDbPool.query(
            `SELECT DISTINCT c.id
            FROM mdl_course c
            JOIN mdl_enrol e ON e.courseid = c.id
            JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
            WHERE ue.userid = ? AND c.id != 1`,
            [moodleUserId]
        );

        if (enrolledCourses.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const courseIds = enrolledCourses.map(c => c.id);
        const placeholders = courseIds.map(() => '?').join(',');

        // Get assignments with due dates from ALL enrolled courses
        const [assignments] = await moodleDbPool.query(
            `
            SELECT a.id, a.name, a.duedate, cm.id as cm_id, 'assign' as type, c.fullname as course_name, COALESCE(NULLIF(c.idnumber,''), c.shortname) as course_code
            FROM mdl_assign a
            JOIN mdl_course_modules cm ON cm.instance = a.id AND cm.module = (SELECT id FROM mdl_modules WHERE name = 'assign')
            JOIN mdl_course c ON c.id = cm.course
            WHERE cm.course IN (${placeholders}) AND a.duedate > ?
            UNION
            SELECT e.id, e.name, e.timestart as duedate, cm.id as cm_id, e.modulename as type, c.fullname as course_name, COALESCE(NULLIF(c.idnumber,''), c.shortname) as course_code
            FROM mdl_event e
            LEFT JOIN mdl_course_modules cm ON cm.instance = e.instance AND cm.module = (SELECT id FROM mdl_modules WHERE name = e.modulename)
            LEFT JOIN mdl_course c ON c.id = e.courseid
            WHERE e.courseid IN (${placeholders}) AND e.visible = 1
            ORDER BY duedate ASC
            `,
            [...courseIds, Math.floor(Date.now() / 1000), ...courseIds]
        );

        const assessments = assignments.map(assign => ({
            id: assign.id,
            module: assign.course_name || 'Course Module',
            code: assign.type ? assign.type.toUpperCase() : 'MOD',
            title: assign.name,
            type: assign.type === 'assign' ? 'Coursework' : (assign.type === 'quiz' ? 'Quiz' : (assign.type === 'forum' ? 'Forum' : 'Assessment')),
            dueDate: new Date(assign.duedate * 1000).toISOString().split('T')[0],
            weight: '100%',
            status: 'pending',
            submitted: false,
            moodle_url: assign.cm_id ? `/mod/${assign.type}/view.php?id=${assign.cm_id}` : null,
            courseCode: assign.course_code || ''
        }));

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

// Get student attendance from Moodle
router.get('/attendance/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // Check cache first
        const cacheKey = `attendance_${studentId}`;
        const cachedData = attendanceCache.get(cacheKey);
        
        if (cachedData) {
            console.log(`[CACHE HIT] Attendance for student ${studentId}`);
            return res.json(cachedData);
        }
        
        console.log(`[CACHE MISS] Fetching attendance for student ${studentId}`);
        
        // Get student's email
        const [appRows] = await db.query(
            `SELECT email FROM student_applications WHERE id = ?`,
            [studentId]
        );

        if (appRows.length === 0) {
            const emptyResponse = {
                success: true,
                data: { courseGroups: [], summary: null }
            };
            attendanceCache.set(cacheKey, emptyResponse);
            return res.json(emptyResponse);
        }

        const userEmail = appRows[0].email;

        try {
            // Get Moodle user ID
            const [moodleUsers] = await moodleDbPool.query(
                `SELECT id FROM mdl_user WHERE email = ?`,
                [userEmail]
            );

            if (moodleUsers.length === 0) {
                return res.json({
                    success: true,
                    data: { courseGroups: [], summary: null }
                });
            }

            const moodleUserId = moodleUsers[0].id;

            // Get all courses the student is enrolled in
            const [enrolledCourses] = await moodleDbPool.query(
                `SELECT DISTINCT c.id, c.fullname, c.shortname
                FROM mdl_course c
                JOIN mdl_enrol e ON e.courseid = c.id
                JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
                WHERE ue.userid = ? AND c.id != 1
                ORDER BY c.fullname`,
                [moodleUserId]
            );

            if (enrolledCourses.length === 0) {
                return res.json({
                    success: true,
                    data: { courseGroups: [], summary: null }
                });
            }

            // Map status codes to readable status
            const statusMap = {
                'P': 'present',
                'A': 'absent',
                'L': 'late',
                'E': 'excused'
            };

            let allRecords = [];
            const courseGroups = [];
            
            const courseIds = enrolledCourses.map(c => c.id);
            const placeholders = courseIds.map(() => '?').join(',');

            // Get all attendance modules for all enrolled courses in one query
            const [attendanceModules] = await moodleDbPool.query(
                `SELECT a.id as attendance_id, a.name, a.course as course_id, c.fullname, c.shortname
                FROM mdl_attendance a
                JOIN mdl_course_modules cm ON cm.instance = a.id 
                JOIN mdl_modules m ON m.id = cm.module AND m.name = 'attendance'
                JOIN mdl_course c ON c.id = a.course
                WHERE a.course IN (${placeholders})`,
                courseIds
            );

            if (attendanceModules.length > 0) {
                const attendanceIds = attendanceModules.map(a => a.attendance_id);
                const attPlaceholders = attendanceIds.map(() => '?').join(',');

                // Get all attendance records for all modules in one query
                const [allAttendanceRecords] = await moodleDbPool.query(
                    `SELECT 
                        sess.attendanceid,
                        sess.sessdate as date,
                        sess.description as session,
                        stat.acronym as status_code,
                        stat.description as status_name,
                        log.remarks as notes
                    FROM mdl_attendance_sessions sess
                    LEFT JOIN mdl_attendance_log log ON log.sessionid = sess.id AND log.studentid = ?
                    LEFT JOIN mdl_attendance_statuses stat ON stat.id = log.statusid
                    WHERE sess.attendanceid IN (${attPlaceholders})
                    ORDER BY sess.sessdate DESC
                    LIMIT 500`,
                    [moodleUserId, ...attendanceIds]
                );

                // Group records by course
                const recordsByCourse = {};
                attendanceModules.forEach(module => {
                    recordsByCourse[module.course_id] = {
                        courseId: module.course_id,
                        courseName: module.fullname,
                        courseCode: module.shortname,
                        records: []
                    };
                });

                allAttendanceRecords.forEach(record => {
                    const module = attendanceModules.find(m => m.attendance_id === record.attendanceid);
                    if (module && recordsByCourse[module.course_id]) {
                        recordsByCourse[module.course_id].records.push({
                            date: new Date(record.date * 1000).toISOString(),
                            session: record.session || 'Class Session',
                            courseId: module.course_id,
                            courseName: module.fullname,
                            courseCode: module.shortname,
                            status: statusMap[record.status_code] || 'present',
                            notes: record.notes || ''
                        });
                    }
                });

                // Calculate summary for each course
                Object.values(recordsByCourse).forEach(courseData => {
                    if (courseData.records.length > 0) {
                        const presentCount = courseData.records.filter(r => r.status === 'present').length;
                        const absentCount = courseData.records.filter(r => r.status === 'absent').length;
                        const lateCount = courseData.records.filter(r => r.status === 'late').length;
                        const excusedCount = courseData.records.filter(r => r.status === 'excused').length;
                        const attendanceRate = courseData.records.length > 0 
                            ? Math.round((presentCount / courseData.records.length) * 100) 
                            : 0;

                        courseGroups.push({
                            courseId: courseData.courseId,
                            courseName: courseData.courseName,
                            courseCode: courseData.courseCode,
                            records: courseData.records,
                            summary: {
                                total: courseData.records.length,
                                present: presentCount,
                                presentCount: presentCount,
                                absent: absentCount,
                                absentCount: absentCount,
                                late: lateCount,
                                lateCount: lateCount,
                                excused: excusedCount,
                                excusedCount: excusedCount,
                                rate: attendanceRate,
                                attendanceRate: attendanceRate
                            }
                        });

                        allRecords = allRecords.concat(courseData.records);
                    }
                });
            }

            // Calculate overall summary
            const totalSessions = allRecords.length;
            const presentCount = allRecords.filter(r => r.status === 'present').length;
            const absentCount = allRecords.filter(r => r.status === 'absent').length;
            const lateCount = allRecords.filter(r => r.status === 'late').length;
            const excusedCount = allRecords.filter(r => r.status === 'excused').length;
            
            const attendanceRate = totalSessions > 0 
                ? Math.round((presentCount / totalSessions) * 100) 
                : 0;

            const summary = {
                total: totalSessions,
                present: presentCount,
                absent: absentCount,
                late: lateCount,
                excused: excusedCount,
                rate: attendanceRate
            };

            const responseData = {
                success: true,
                data: { courseGroups, summary }
            };
            
            // Cache the response
            attendanceCache.set(cacheKey, responseData);
            
            return res.json(responseData);

        } catch (moodleError) {
            console.log('Moodle attendance module error:', moodleError.message);
            const emptyResponse = {
                success: true,
                data: { courseGroups: [], summary: null }
            };
            attendanceCache.set(cacheKey, emptyResponse);
            return res.json(emptyResponse);
        }

    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendance',
            error: error.message
        });
    }
});

// Get library resources from student's enrolled courses
router.get('/library/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // Get student's email
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

        try {
            // Get Moodle user ID
            const [moodleUsers] = await moodleDbPool.query(
                `SELECT id FROM mdl_user WHERE email = ?`,
                [userEmail]
            );

            if (moodleUsers.length === 0) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            const moodleUserId = moodleUsers[0].id;

            // Get all courses the student is enrolled in
            const [enrolledCourses] = await moodleDbPool.query(
                `SELECT DISTINCT c.id, c.fullname, c.shortname
                FROM mdl_course c
                JOIN mdl_enrol e ON e.courseid = c.id
                JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
                WHERE ue.userid = ? AND c.id != 1
                ORDER BY c.fullname`,
                [moodleUserId]
            );

            if (enrolledCourses.length === 0) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            const courseIds = enrolledCourses.map(c => c.id);
            const placeholders = courseIds.map(() => '?').join(',');

            // Get resources (files, PDFs, documents) from enrolled courses
            const [resources] = await moodleDbPool.query(
                `SELECT 
                    r.id,
                    r.course,
                    r.name as title,
                    c.fullname as course_name,
                    c.shortname as course_code,
                    cm.id as cmid,
                    'resource' as type,
                    'PDF' as format
                FROM mdl_resource r
                JOIN mdl_course_modules cm ON cm.instance = r.id
                JOIN mdl_modules m ON m.id = cm.module AND m.name = 'resource'
                JOIN mdl_course c ON c.id = r.course
                WHERE r.course IN (${placeholders}) AND cm.deletioninprogress = 0
                ORDER BY c.fullname, r.name
                LIMIT 50`,
                courseIds
            );

            // Get URLs (external links, videos, etc.) from enrolled courses
            const [urls] = await moodleDbPool.query(
                `SELECT 
                    u.id,
                    u.course,
                    u.name as title,
                    c.fullname as course_name,
                    c.shortname as course_code,
                    cm.id as cmid,
                    'url' as type,
                    'Link' as format
                FROM mdl_url u
                JOIN mdl_course_modules cm ON cm.instance = u.id
                JOIN mdl_modules m ON m.id = cm.module AND m.name = 'url'
                JOIN mdl_course c ON c.id = u.course
                WHERE u.course IN (${placeholders}) AND cm.deletioninprogress = 0
                ORDER BY c.fullname, u.name
                LIMIT 50`,
                courseIds
            );

            // Get learning activities from enrolled courses so Library is useful
            // even when explicit resource/url modules are not present.
            const [activities] = await moodleDbPool.query(
                `SELECT
                    cm.id as cmid,
                    c.fullname as course_name,
                    c.shortname as course_code,
                    m.name as module_type,
                    COALESCE(a.name, q.name, f.name) as title,
                    COALESCE(a.intro, q.intro, f.intro) as description,
                    COALESCE(a.id, q.id, f.id) as instance_id
                FROM mdl_course_modules cm
                JOIN mdl_course c ON c.id = cm.course
                JOIN mdl_modules m ON m.id = cm.module
                LEFT JOIN mdl_assign a ON m.name = 'assign' AND a.id = cm.instance
                LEFT JOIN mdl_quiz q ON m.name = 'quiz' AND q.id = cm.instance
                LEFT JOIN mdl_forum f ON m.name = 'forum' AND f.id = cm.instance
                WHERE cm.course IN (${placeholders})
                  AND cm.deletioninprogress = 0
                  AND m.name IN ('assign', 'quiz', 'forum')
                ORDER BY c.fullname, cm.id
                LIMIT 100`,
                courseIds
            );

            // Combine and format resources
            const allResources = [
                ...resources.map(r => ({
                    id: `resource-${r.id}`,
                    title: r.title,
                    type: 'ebooks',
                    category: r.course_name,
                    course_code: r.course_code,
                    author: 'Course Material',
                    description: `Resource from ${r.course_name}`,
                    format: r.format,
                    available: true,
                    cmid: r.cmid,
                    moodleUrl: `/mod/resource/view.php?id=${r.cmid}`
                })),
                ...urls.map(u => ({
                    id: `url-${u.id}`,
                    title: u.title,
                    type: 'articles',
                    category: u.course_name,
                    course_code: u.course_code,
                    author: 'External Resource',
                    description: `Link from ${u.course_name}`,
                    format: u.format,
                    available: true,
                    cmid: u.cmid,
                    moodleUrl: `/mod/url/view.php?id=${u.cmid}`
                })),
                ...activities
                    .filter(act => act.title)
                    .map(act => ({
                        id: `${act.module_type}-${act.instance_id}`,
                        title: act.title,
                        type: 'articles',
                        category: act.course_name,
                        course_code: act.course_code,
                        author: 'Course Activity',
                        description: act.description
                            ? `Activity from ${act.course_name}`
                            : `Learning activity from ${act.course_name}`,
                        format: act.module_type === 'assign'
                            ? 'Assignment'
                            : act.module_type === 'quiz'
                                ? 'Quiz'
                                : 'Forum',
                        available: true,
                        cmid: act.cmid,
                        moodleUrl: `/mod/${act.module_type}/view.php?id=${act.cmid}`
                    }))
            ];

            return res.json({
                success: true,
                data: allResources
            });

        } catch (moodleError) {
            console.log('Moodle library fetch error:', moodleError.message);
            return res.json({
                success: true,
                data: []
            });
        }

    } catch (error) {
        console.error('Error fetching library resources:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch library resources',
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

        // Get Moodle user ID by email using shared pool
        const [moodleUsers] = await moodleDbPool.query(
            `SELECT id FROM mdl_user WHERE email = ?`,
            [userEmail]
        );

        if (moodleUsers.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        const moodleUserId = moodleUsers[0].id;

        // Get ALL enrolled courses with idnumber (course_code) and fullname
        const [enrolledCourses] = await moodleDbPool.query(
            `SELECT DISTINCT c.id, COALESCE(NULLIF(c.idnumber,''), c.shortname) as course_code, c.fullname
            FROM mdl_course c
            JOIN mdl_enrol e ON e.courseid = c.id
            JOIN mdl_user_enrolments ue ON ue.enrolid = e.id
            WHERE ue.userid = ? AND c.id != 1`,
            [moodleUserId]
        );

        if (enrolledCourses.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // Build course lookup map
        const courseMap = {};
        enrolledCourses.forEach(c => {
            courseMap[c.id] = { course_code: c.course_code || '', fullname: c.fullname || '' };
        });

        const courseIds = enrolledCourses.map(c => c.id);
        const placeholders = courseIds.map(() => '?').join(',');

        // Get grades from gradebook for ALL enrolled courses (include courseid)
        const [grades] = await moodleDbPool.query(
            `
            SELECT 
                gi.courseid,
                gi.itemname,
                gi.itemmodule,
                gg.finalgrade,
                gi.grademax,
                gg.timemodified,
                cm.id as cm_id
            FROM mdl_grade_items gi
            LEFT JOIN mdl_grade_grades gg ON gi.id = gg.itemid AND gg.userid = ?
            LEFT JOIN mdl_course_modules cm ON cm.instance = gi.iteminstance AND cm.module = (SELECT id FROM mdl_modules WHERE name = gi.itemmodule)
            WHERE gi.courseid IN (${placeholders}) AND gi.itemtype = 'mod' AND gg.finalgrade IS NOT NULL
            ORDER BY gg.timemodified DESC
            `,
            [moodleUserId, ...courseIds]
        );

        // Get ALL course totals (not just LIMIT 1)
        const [courseTotals] = await moodleDbPool.query(
            `
            SELECT 
                gi.courseid,
                gg.finalgrade,
                gi.grademax,
                gg.timemodified
            FROM mdl_grade_items gi
            LEFT JOIN mdl_grade_grades gg ON gi.id = gg.itemid AND gg.userid = ?
            WHERE gi.courseid IN (${placeholders}) AND gi.itemtype = 'course' AND gg.finalgrade IS NOT NULL
            `,
            [moodleUserId, ...courseIds]
        );

        const gradeData = grades.map(grade => {
            const courseInfo = courseMap[grade.courseid] || {};
            return {
                id: `${grade.courseid}-${grade.itemname}`,
                module: grade.itemname,
                code: grade.itemmodule ? grade.itemmodule.toUpperCase() : 'MOD',
                type: grade.itemmodule || 'Assessment',
                grade: grade.finalgrade ? parseFloat(grade.finalgrade).toFixed(2) : 'N/A',
                maxGrade: grade.grademax ? parseFloat(grade.grademax).toFixed(2) : '100',
                percentage: grade.grademax ? Math.round((grade.finalgrade / grade.grademax) * 100) : 0,
                submittedDate: grade.timemodified ? new Date(grade.timemodified * 1000).toISOString().split('T')[0] : 'N/A',
                feedback: 'See Moodle for detailed feedback',
                moodle_url: grade.cm_id ? `/mod/${grade.itemmodule}/view.php?id=${grade.cm_id}` : null,
                courseCode: courseInfo.course_code,
                courseName: courseInfo.fullname
            };
        });

        // Per-course summaries
        const courseGrades = courseTotals.map(ct => {
            const courseInfo = courseMap[ct.courseid] || {};
            return {
                courseId: ct.courseid,
                courseCode: courseInfo.course_code,
                courseName: courseInfo.fullname,
                finalGrade: ct.finalgrade ? parseFloat(ct.finalgrade).toFixed(2) : null,
                maxGrade: ct.grademax ? parseFloat(ct.grademax).toFixed(2) : '100',
                percentage: ct.grademax && ct.finalgrade
                    ? Math.round((ct.finalgrade / ct.grademax) * 100) : null,
                updatedAt: ct.timemodified ? new Date(ct.timemodified * 1000).toISOString().split('T')[0] : null
            };
        });

        // Overall programme summary (average across all course totals)
        let programmeSummary = null;
        if (courseTotals.length > 0) {
            const totalGrade = courseTotals.reduce((sum, ct) => sum + (parseFloat(ct.finalgrade) || 0), 0);
            const totalMax = courseTotals.reduce((sum, ct) => sum + (parseFloat(ct.grademax) || 100), 0);
            const latestUpdate = Math.max(...courseTotals.map(ct => ct.timemodified || 0));
            programmeSummary = {
                finalGrade: totalGrade.toFixed(2),
                maxGrade: totalMax.toFixed(2),
                percentage: totalMax > 0 ? Math.round((totalGrade / totalMax) * 100) : 0,
                coursesGraded: courseTotals.length,
                coursesTotal: enrolledCourses.length,
                updatedAt: latestUpdate ? new Date(latestUpdate * 1000).toISOString().split('T')[0] : null
            };
        }

        return res.json({
            success: true,
            data: {
                grades: gradeData,
                courseGrades,
                programmeSummary,
                // Keep backward compat
                courseSummary: programmeSummary
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

// Download right-to-study document
router.get('/right-to-study/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        const { documentType, filename } = req.query;

        if (!documentType || !filename) {
            return res.status(400).json({ 
                success: false, 
                message: 'Document type and filename are required' 
            });
        }

        // Get the file path from application_documents table
        const [result] = await db.execute(
            `SELECT file_path, original_filename FROM application_documents 
             WHERE application_id = ? AND document_type = ? AND original_filename = ?`,
            [id, documentType, filename]
        );

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const filePath = result[0].file_path;
        const absolutePath = path.resolve(path.join(__dirname, '../uploads', filePath.replace(/^uploads\//i, '')));
        const uploadsRoot = path.resolve(path.join(__dirname, '../uploads'));

        // Security: Ensure path is within uploads directory
        if (!absolutePath.startsWith(uploadsRoot)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid document path' 
            });
        }

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on disk'
            });
        }

        const downloadName = result[0].original_filename || filename;
        return res.download(absolutePath, downloadName);

    } catch (error) {
        console.error('Error downloading right-to-study document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download document',
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
            'SELECT id, first_name, last_name, course_title, intake_start_date FROM student_applications WHERE id = ?',
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
        const courseTitle = app.course_title;
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

        console.log(`[COURSE CHANGE REQUEST] Application ${id}: ${type_of_request} request submitted by ${studentName}`);

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

// Manager: get available programmes (the -INFO courses students enroll into)
router.get('/programmes', async (req, res) => {
    try {
        const [rows] = await moodleDbPool.execute(
            `SELECT id, idnumber AS course_code, fullname AS course_title, shortname
             FROM mdl_course
             WHERE idnumber LIKE '%-INFO'
             ORDER BY fullname`
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching programmes:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch programmes' });
    }
});

// Manager: get all course change requests (optional status filter)
router.get('/course-change-requests', async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT
                ccr.*,
                sa.email,
                sa.first_name,
                sa.last_name,
                sa.course_code AS current_course_code,
                sa.course_title AS current_course_title,
                sa.application_status
            FROM course_change_requests ccr
            LEFT JOIN student_applications sa ON sa.id = ccr.application_id
        `;
        const params = [];

        if (status) {
            if (String(status).toLowerCase() === 'pending') {
                query += ' WHERE ccr.decision IS NULL OR ccr.decision = ?';
                params.push('');
            } else {
                query += ' WHERE ccr.decision = ?';
                params.push(status);
            }
        }

        query += ' ORDER BY ccr.created_at DESC';

        const [requests] = await db.execute(query, params);
        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching all course change requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch course change requests',
            error: error.message
        });
    }
});

// Manager: review course change request and apply transfer workflow
router.post('/course-change-requests/:requestId/review', async (req, res) => {
    try {
        const { requestId } = req.params;
        const {
            decision,
            reviewed_by,
            committee_comments,
            rejection_reason,
            final_decision_confirmation,
            new_course_code,
            new_course_title,
            apply_moodle_changes
        } = req.body || {};

        if (!decision) {
            return res.status(400).json({
                success: false,
                message: 'Decision is required'
            });
        }

        const [requestRows] = await db.execute(
            `SELECT ccr.*, sa.email, sa.first_name, sa.last_name, sa.course_code, sa.course_title, sa.intake_start_date
             FROM course_change_requests ccr
             INNER JOIN student_applications sa ON sa.id = ccr.application_id
             WHERE ccr.id = ?
             LIMIT 1`,
            [requestId]
        );

        if (!requestRows.length) {
            return res.status(404).json({
                success: false,
                message: 'Course change request not found'
            });
        }

        const requestRecord = requestRows[0];
        const applyMoodleChanges = apply_moodle_changes !== false;

        await db.execute(
            `UPDATE course_change_requests
             SET decision = ?,
                 reviewed_by = ?,
                 review_date = NOW(),
                 rejection_reason = ?,
                 committee_comments = ?,
                 final_decision_confirmation = ?,
                 new_course_code = ?,
                 new_course_title = ?
             WHERE id = ?`,
            [
                decision,
                reviewed_by || 'Admissions Manager',
                rejection_reason || null,
                committee_comments || null,
                final_decision_confirmation ? 1 : 0,
                new_course_code ? String(new_course_code).trim().toUpperCase() : null,
                new_course_title ? String(new_course_title).trim() : null,
                requestId
            ]
        );

        let transferResult = null;
        if (String(requestRecord.type_of_request || '').toLowerCase() === 'transfer' && String(decision).startsWith('Approved')) {
            const transferCourseCodeFromRequest = new_course_code || requestRecord.new_course_code;
            const transferCourseTitleFromRequest = new_course_title || requestRecord.new_course_title;

            if (!transferCourseCodeFromRequest) {
                return res.status(400).json({
                    success: false,
                    message: 'new_course_code is required for approved transfer requests'
                });
            }

            const targetCourseCode = String(transferCourseCodeFromRequest).trim().toUpperCase();
            let targetCourseTitle = String(transferCourseTitleFromRequest || '').trim();

            if (!targetCourseTitle) {
                const [courseRows] = await db.execute(
                    'SELECT course_title FROM courses WHERE course_code = ? LIMIT 1',
                    [targetCourseCode]
                );
                if (courseRows.length > 0) {
                    targetCourseTitle = courseRows[0].course_title;
                }
            }

            await db.execute(
                `UPDATE student_applications
                 SET course_code = ?,
                     course_title = COALESCE(?, course_title),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [targetCourseCode, targetCourseTitle || null, requestRecord.application_id]
            );

            const registrationSyncResult = await setSingleActiveProgrammeRegistration({
                applicationId: requestRecord.application_id,
                email: requestRecord.email,
                courseCode: targetCourseCode,
                courseTitle: targetCourseTitle || requestRecord.course_title,
                source: 'course_change',
                courseChangeRequestId: Number(requestId),
                notes: `Transfer approved from ${requestRecord.course_code} to ${targetCourseCode}`
            });
            if (!registrationSyncResult.success) {
                console.warn('[SCL TRANSFER REGISTRATION WARNING]', registrationSyncResult.message);
            }

            transferResult = {
                updated_application_id: requestRecord.application_id,
                previous_course_code: requestRecord.course_code,
                new_course_code: targetCourseCode,
                moodle_changes: null
            };

            if (applyMoodleChanges) {
                const oldProgrammeCode = extractProgrammeCode(requestRecord.course_code)
                    || String(requestRecord.course_code || '').trim().toUpperCase();
                const newProgrammeCode = extractProgrammeCode(targetCourseCode)
                    || String(targetCourseCode || '').trim().toUpperCase();

                const oldProgrammeCourses = await getStudentProgrammeMoodleEnrolments(requestRecord.email, oldProgrammeCode);
                const unenrollmentResult = await hardUnenrollStudentFromCourseIds(
                    requestRecord.email,
                    oldProgrammeCourses.map((course) => course.id)
                );
                const oldCohortRemoval = await removeStudentFromMoodleProgrammeCohorts(requestRecord.email, oldProgrammeCode);

                let enrollmentResult;
                let progressionResult = null;
                if (targetCourseCode.includes('-INFO')) {
                    enrollmentResult = await enrollStudentInProgrammeCourses(
                        requestRecord.email,
                        requestRecord.first_name,
                        requestRecord.last_name,
                        targetCourseCode,
                        requestRecord.intake_start_date
                    );
                    progressionResult = await enforceProgrammeProgressionLocks(requestRecord.email, newProgrammeCode);
                } else {
                    enrollmentResult = await enrollStudentInMoodle(
                        requestRecord.email,
                        requestRecord.first_name,
                        requestRecord.last_name,
                        targetCourseCode
                    );
                }

                const newCohortAssignment = await assignStudentToMoodleCohort(
                    requestRecord.email,
                    requestRecord.first_name,
                    requestRecord.last_name,
                    newProgrammeCode,
                    requestRecord.intake_start_date
                );

                transferResult.moodle_changes = {
                    old_programme_code: oldProgrammeCode,
                    removed_old_programme_courses: oldProgrammeCourses.length,
                    old_programme_unenrollment: unenrollmentResult,
                    old_programme_cohort_removal: oldCohortRemoval,
                    new_programme_code: newProgrammeCode,
                    new_programme_enrollment: enrollmentResult,
                    new_programme_progression: progressionResult,
                    new_programme_cohort_assignment: newCohortAssignment
                };
            }
        }

        res.json({
            success: true,
            message: 'Course change request reviewed successfully',
            data: {
                request_id: Number(requestId),
                decision,
                transfer: transferResult
            }
        });
    } catch (error) {
        console.error('Error reviewing course change request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to review course change request',
            error: error.message
        });
    }
});

// ===============================================
// Student Dashboard — aggregated Moodle + local data
// Uses direct DB queries since Moodle REST may not be reachable from Docker
// ===============================================
router.get('/student-dashboard', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // 1. Get local application data
        const [apps] = await db.execute(
            `SELECT id, application_reference, first_name, middle_names, last_name, email,
                    course_title, course_code, course_type, programme_type_name, program_name,
                    mode_of_study, intake_start_date, application_status, nationality,
                    contact_number, date_of_birth, gender
             FROM student_applications
             WHERE email = ? AND (is_deleted = 0 OR is_deleted IS NULL)
             ORDER BY FIELD(application_status, 'accepted', 'conditional_accept', 'under_review', 'submitted', 'rejected'), created_at DESC`,
            [email]
        );
        const acceptedApp = apps.find(a => a.application_status === 'accepted') || apps[0] || null;

        // 2. Resolve Moodle user via direct DB
        let moodleUser = null;
        let moodleConn = null;
        try {
            moodleConn = await moodleDbPool.getConnection();
            const [mUsers] = await moodleConn.execute(
                'SELECT id, username, firstname, lastname, email, city, country, lastaccess, firstaccess FROM mdl_user WHERE email = ? AND deleted = 0 AND suspended = 0 LIMIT 1',
                [email]
            );
            if (mUsers.length > 0) {
                moodleUser = mUsers[0];
            }
        } catch (e) {
            console.warn('[student-dashboard] Moodle user lookup failed:', e.message);
        }

        // 3. Get enrolled courses from Moodle DB
        let courses = [];
        if (moodleUser && moodleConn) {
            try {
                const [enrolledCourses] = await moodleConn.execute(`
                    SELECT c.id, c.fullname, c.shortname, c.startdate, c.enddate, c.visible, c.category,
                           ue.timestart AS enrol_start, ue.timeend AS enrol_end,
                           COALESCE(cmc_done.completed_activities, 0) AS completed_activities,
                           COALESCE(cmc_total.total_activities, 0) AS total_activities,
                           ul.timeaccess AS lastaccess
                    FROM mdl_user_enrolments ue
                    JOIN mdl_enrol e ON ue.enrolid = e.id
                    JOIN mdl_course c ON e.courseid = c.id
                    LEFT JOIN (
                        SELECT cm.course, COUNT(*) AS completed_activities
                        FROM mdl_course_modules_completion cmc
                        JOIN mdl_course_modules cm ON cmc.coursemoduleid = cm.id
                        WHERE cmc.userid = ? AND cmc.completionstate > 0
                        GROUP BY cm.course
                    ) cmc_done ON cmc_done.course = c.id
                    LEFT JOIN (
                        SELECT course, COUNT(*) AS total_activities
                        FROM mdl_course_modules
                        WHERE completion > 0 AND deletioninprogress = 0
                        GROUP BY course
                    ) cmc_total ON cmc_total.course = c.id
                    LEFT JOIN mdl_user_lastaccess ul ON ul.userid = ue.userid AND ul.courseid = c.id
                    WHERE ue.userid = ? AND c.id != 1 AND c.visible = 1
                    ORDER BY c.fullname`,
                    [moodleUser.id, moodleUser.id]
                );
                courses = enrolledCourses.map(c => {
                    const total = Number(c.total_activities) || 0;
                    const done = Number(c.completed_activities) || 0;
                    const progress = total > 0 ? Math.round((done / total) * 100) : null;
                    return {
                        id: c.id,
                        fullname: c.fullname,
                        shortname: c.shortname,
                        progress,
                        completed: total > 0 && done >= total,
                        startdate: c.startdate ? new Date(c.startdate * 1000).toISOString() : null,
                        enddate: c.enddate ? new Date(c.enddate * 1000).toISOString() : null,
                        lastaccess: c.lastaccess ? new Date(c.lastaccess * 1000).toISOString() : null,
                        visible: c.visible,
                        category: c.category,
                        completedActivities: done,
                        totalActivities: total
                    };
                });
            } catch (e) {
                console.warn('[student-dashboard] Moodle courses fetch failed:', e.message);
            }
        }

        // 4. Get grades from Moodle DB
        let grades = [];
        if (moodleUser && moodleConn) {
            try {
                const [gradeRows] = await moodleConn.execute(`
                    SELECT gi.courseid,
                           ROUND(gg.finalgrade, 2) AS grade,
                           ROUND(gi.grademax, 2) AS grademax,
                           gi.itemname
                    FROM mdl_grade_grades gg
                    JOIN mdl_grade_items gi ON gg.itemid = gi.id
                    WHERE gg.userid = ? AND gi.itemtype = 'course'
                    ORDER BY gi.courseid`,
                    [moodleUser.id]
                );
                grades = gradeRows.map(g => ({
                    courseid: g.courseid,
                    grade: g.grade != null ? `${g.grade}` : '-',
                    grademax: g.grademax,
                    rawgrade: g.grade
                }));
            } catch (e) {
                console.warn('[student-dashboard] Moodle grades fetch failed:', e.message);
            }
        }

        // Merge grades into courses and recalculate progress from grades or timeline
        const gradeMap = new Map(grades.map(g => [g.courseid, g]));
        courses = courses.map(c => {
            const courseGrade = gradeMap.get(c.id);
            let finalProgress = c.progress; // Use activity completion progress if available
            
            // If no activity completion progress, try grades
            if ((finalProgress === null || finalProgress === 0) && courseGrade?.rawgrade != null) {
                const gradePercent = Math.round((courseGrade.rawgrade / (courseGrade.grademax || 100)) * 100);
                finalProgress = Math.min(gradePercent, 100);
            }
            
            // If still no progress, calculate from course timeline
            if ((finalProgress === null || finalProgress === 0) && c.startdate && c.enddate) {
                const now = new Date();
                const start = new Date(c.startdate);
                const end = new Date(c.enddate);
                
                if (now < start) {
                    finalProgress = 0; // Course hasn't started
                } else if (now > end) {
                    finalProgress = 100; // Course ended
                } else {
                    // Course is ongoing - calculate progress based on timeline
                    const totalDuration = end - start;
                    const elapsed = now - start;
                    finalProgress = Math.round((elapsed / totalDuration) * 100);
                }
            }
            
            return {
                ...c,
                progress: finalProgress ?? 0,
                grade: courseGrade?.grade || '-',
                grademax: courseGrade?.grademax || null,
                rawgrade: courseGrade?.rawgrade || null
            };
        });

        // Determine active course IDs (courses in the earliest active semester)
        // Parse course shortnames to extract year and semester
        const parseCourseShortname = (shortname) => {
            const m = (shortname || '').match(/^(HND-\w+)-Y(\d+)-S(\d+)-C(\d+)$/);
            if (m) return { programme: m[1], year: parseInt(m[2]), semester: parseInt(m[3]) };
            return null;
        };
        
        // Group courses by year+semester combination
        const semesterCourses = {};
        courses.forEach(c => {
            const parsed = parseCourseShortname(c.shortname);
            if (!parsed) return;
            
            const semesterKey = `Y${parsed.year}S${parsed.semester}`;
            if (!semesterCourses[semesterKey]) {
                semesterCourses[semesterKey] = {
                    year: parsed.year,
                    semester: parsed.semester,
                    courses: []
                };
            }
            semesterCourses[semesterKey].courses.push(c);
        });
        
        // Find the earliest (first) semester with courses
        let activeCourseIds = [];
        if (Object.keys(semesterCourses).length > 0) {
            const sortedSemesters = Object.keys(semesterCourses)
                .map(key => semesterCourses[key])
                .sort((a, b) => a.year - b.year || a.semester - b.semester);
            
            // Use the first semester (earliest year, then lowest semester number)
            if (sortedSemesters.length > 0) {
                activeCourseIds = sortedSemesters[0].courses.map(c => c.id);
            }
        }
        
        // Fallback: if no semester found in shortname pattern, use all courses
        if (activeCourseIds.length === 0 && courses.length > 0) {
            activeCourseIds = courses.map(c => c.id);
        }
        
        // FILTER: Keep only courses from the active semester
        const activeCourseIdSet = new Set(activeCourseIds);
        courses = courses.filter(c => activeCourseIdSet.has(c.id));

        // 5. Get notifications from Moodle DB
        let notifications = [];
        if (moodleUser && moodleConn) {
            try {
                const [notifRows] = await moodleConn.execute(`
                    SELECT id, subject, smallmessage, fullmessage, component, eventtype,
                           contexturl, timecreated, timeread
                    FROM mdl_notifications
                    WHERE useridto = ?
                    ORDER BY timecreated DESC
                    LIMIT 15`,
                    [moodleUser.id]
                );
                notifications = notifRows.map(n => {
                    let moodlePath = '/my/';
                    if (n.contexturl) {
                        try {
                            const u = new URL(n.contexturl);
                            moodlePath = u.pathname + u.search;
                        } catch (_) {
                            moodlePath = n.contexturl.replace(/^https?:\/\/[^/]+/, '') || '/my/';
                        }
                    }
                    return {
                        id: n.id,
                        subject: n.subject || 'Notification',
                        text: n.smallmessage || n.fullmessage || '',
                        timecreated: n.timecreated ? new Date(n.timecreated * 1000).toISOString() : null,
                        read: n.timeread != null,
                        type: n.eventtype || n.component || 'notification',
                        moodlePath
                    };
                });
            } catch (e) {
                console.warn('[student-dashboard] Moodle notifications fetch failed:', e.message);
            }
        }

        // 6. Get unread message count from Moodle DB
        let unreadMessages = 0;
        if (moodleUser && moodleConn) {
            try {
                const [unreadRows] = await moodleConn.execute(`
                    SELECT COUNT(*) AS cnt
                    FROM mdl_messages m
                    JOIN mdl_message_conversation_members mcm ON m.conversationid = mcm.conversationid
                    LEFT JOIN mdl_message_user_actions mua ON mua.messageid = m.id AND mua.userid = mcm.userid AND mua.action = 1
                    WHERE mcm.userid = ? AND m.useridfrom != ? AND mua.id IS NULL`,
                    [moodleUser.id, moodleUser.id]
                );
                unreadMessages = unreadRows[0]?.cnt || 0;
            } catch (e) {
                console.warn('[student-dashboard] Moodle unread messages failed:', e.message);
            }
        }

        // 7. Get upcoming calendar events from Moodle DB (active courses only)
        let upcomingEvents = [];
        if (moodleUser && moodleConn && activeCourseIds.length > 0) {
            try {
                const now = Math.floor(Date.now() / 1000);
                const eventPlaceholders = activeCourseIds.map(() => '?').join(',');
                const [eventRows] = await moodleConn.execute(`
                    SELECT e.id, e.name, e.description, e.courseid, e.timestart, e.timeduration,
                           e.eventtype, e.modulename, e.instance, c.fullname AS coursename,
                           cm.id AS cmid
                    FROM mdl_event e
                    LEFT JOIN mdl_course c ON e.courseid = c.id
                    LEFT JOIN mdl_modules m ON m.name = e.modulename
                    LEFT JOIN mdl_course_modules cm ON cm.course = e.courseid AND cm.module = m.id AND cm.instance = e.instance
                    WHERE (e.userid = ? OR e.courseid IN (${eventPlaceholders}) OR e.eventtype = 'site')
                    AND e.timestart >= ?
                    ORDER BY e.timestart ASC
                    LIMIT 10`,
                    [moodleUser.id, ...activeCourseIds, now]
                );
                upcomingEvents = eventRows.map(ev => {
                    let moodlePath = ev.courseid ? `/course/view.php?id=${ev.courseid}` : '/calendar/view.php';
                    if (ev.cmid && ev.modulename) {
                        moodlePath = `/mod/${ev.modulename}/view.php?id=${ev.cmid}`;
                    }
                    return {
                        id: ev.id,
                        name: ev.name,
                        description: (ev.description || '').replace(/<[^>]*>/g, '').substring(0, 200),
                        coursename: ev.coursename || '',
                        courseid: ev.courseid,
                        timestart: ev.timestart ? new Date(ev.timestart * 1000).toISOString() : null,
                        timeduration: ev.timeduration,
                        eventtype: ev.eventtype,
                        moodlePath
                    };
                });
            } catch (e) {
                console.warn('[student-dashboard] Moodle events fetch failed:', e.message);
            }
        }

        // 8. Get announcements from course news forums via Moodle DB (active courses only)
        let announcements = [];
        if (moodleUser && moodleConn && activeCourseIds.length > 0) {
            try {
                const placeholders = activeCourseIds.map(() => '?').join(',');
                const [announceRows] = await moodleConn.execute(`
                    SELECT fd.id, fd.name AS subject, fp.message, fp.modified AS timemodified,
                           c.fullname AS coursename, c.id AS courseid,
                           CONCAT(u.firstname, ' ', u.lastname) AS userfullname
                    FROM mdl_forum f
                    JOIN mdl_forum_discussions fd ON fd.forum = f.id
                    JOIN mdl_forum_posts fp ON fp.discussion = fd.id AND fp.parent = 0
                    JOIN mdl_course c ON f.course = c.id
                    LEFT JOIN mdl_user u ON fp.userid = u.id
                    WHERE f.type = 'news' AND f.course IN (${placeholders})
                    ORDER BY fp.modified DESC
                    LIMIT 10`,
                    activeCourseIds
                );
                announcements = announceRows.map(a => ({
                    id: a.id,
                    subject: a.subject,
                    message: (a.message || '').replace(/<[^>]*>/g, '').substring(0, 300),
                    coursename: a.coursename,
                    courseid: a.courseid,
                    timemodified: a.timemodified ? new Date(a.timemodified * 1000).toISOString() : null,
                    userfullname: a.userfullname || 'System',
                    moodlePath: `/mod/forum/discuss.php?d=${a.id}`
                }));
            } catch (e) {
                console.warn('[student-dashboard] Moodle announcements fetch failed:', e.message);
            }
        }

        // Release Moodle connection
        if (moodleConn) {
            try { moodleConn.release(); } catch (_) {}
        }

        // 9. Calculate summary stats
        const totalCourses = courses.length;
        const completedCourses = courses.filter(c => c.completed === true).length;
        const inProgressCourses = courses.filter(c => c.progress !== null && c.progress > 0 && !c.completed).length;
        const avgProgress = courses.length > 0
            ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / courses.length)
            : 0;

        return res.json({
            success: true,
            data: {
                student: {
                    name: moodleUser
                        ? `${moodleUser.firstname} ${moodleUser.lastname}`
                        : acceptedApp
                            ? `${acceptedApp.first_name} ${acceptedApp.last_name}`
                            : 'Student',
                    email,
                    moodleId: moodleUser?.id || null,
                    nationality: acceptedApp?.nationality || null,
                    phone: acceptedApp?.contact_number || null,
                    dateOfBirth: acceptedApp?.date_of_birth || null,
                    gender: acceptedApp?.gender || null,
                    lastMoodleAccess: moodleUser?.lastaccess ? new Date(moodleUser.lastaccess * 1000).toISOString() : null
                },
                application: acceptedApp ? {
                    id: acceptedApp.id,
                    reference: acceptedApp.application_reference,
                    status: acceptedApp.application_status,
                    courseTitle: acceptedApp.course_title,
                    courseCode: acceptedApp.course_code,
                    programmeType: acceptedApp.programme_type_name,
                    programName: acceptedApp.program_name,
                    modeOfStudy: acceptedApp.mode_of_study,
                    intakeStartDate: acceptedApp.intake_start_date
                } : null,
                courses,
                summary: {
                    totalCourses,
                    completedCourses,
                    inProgressCourses,
                    notStarted: totalCourses - completedCourses - inProgressCourses,
                    averageProgress: avgProgress
                },
                grades,
                notifications,
                unreadMessages,
                upcomingEvents,
                announcements,
                activeCourseIds
            }
        });
    } catch (error) {
        console.error('[student-dashboard] ERROR:', error);
        return res.status(500).json({ success: false, message: 'Failed to load student dashboard', error: error.message });
    }
});

// ===============================================
// Interview Recordings
// ===============================================

// Ensure table exists
(async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS interview_recordings (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                application_id INT NOT NULL,
                original_filename VARCHAR(500) NOT NULL,
                stored_filename VARCHAR(500) NOT NULL,
                file_path VARCHAR(1000) NOT NULL,
                file_size BIGINT DEFAULT 0,
                mime_type VARCHAR(100),
                recorded_at DATETIME NOT NULL,
                uploaded_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE
            )
        `);
    } catch (e) {
        console.error('Failed to create interview_recordings table:', e.message);
    }
})();

// Multer for audio/video uploads
const interviewRecordingStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/interview-recordings');
        await fs.mkdir(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'));
    }
});

const uploadRecording = multer({
    storage: interviewRecordingStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        const allowed = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg',
            'audio/webm', 'audio/aac', 'audio/mp4', 'audio/x-m4a',
            'video/mp4', 'video/webm', 'video/ogg'
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio/video files (MP3, WAV, OGG, AAC, M4A, MP4, WebM) are allowed.'));
        }
    }
}).single('recording');

// Upload interview recording
router.post('/applications/:id/interview-recordings', (req, res) => {
    uploadRecording(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        try {
            const { id } = req.params;
            const recordedAt = req.body.recorded_at || new Date().toISOString();
            const uploadedBy = req.body.uploaded_by || 'Admin';

            const [result] = await db.query(
                `INSERT INTO interview_recordings
                    (application_id, original_filename, stored_filename, file_path, file_size, mime_type, recorded_at, uploaded_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    req.file.originalname,
                    req.file.filename,
                    `/uploads/interview-recordings/${req.file.filename}`,
                    req.file.size,
                    req.file.mimetype,
                    recordedAt,
                    uploadedBy
                ]
            );

            res.json({
                success: true,
                data: {
                    id: result.insertId,
                    original_filename: req.file.originalname,
                    file_path: `/uploads/interview-recordings/${req.file.filename}`,
                    file_size: req.file.size,
                    mime_type: req.file.mimetype,
                    recorded_at: recordedAt,
                    uploaded_by: uploadedBy
                }
            });
        } catch (error) {
            console.error('Error saving interview recording:', error);
            res.status(500).json({ success: false, message: 'Failed to save recording' });
        }
    });
});

// List interview recordings
router.get('/applications/:id/interview-recordings', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, original_filename, file_path, file_size, mime_type, recorded_at, uploaded_by, created_at
             FROM interview_recordings
             WHERE application_id = ?
             ORDER BY recorded_at DESC`,
            [req.params.id]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching interview recordings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch recordings' });
    }
});

// Delete interview recording
router.delete('/applications/:id/interview-recordings/:recordingId', async (req, res) => {
    try {
        const { recordingId } = req.params;
        const [rows] = await db.query(
            'SELECT stored_filename FROM interview_recordings WHERE id = ? AND application_id = ?',
            [recordingId, req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Recording not found' });
        }
        // Remove file from disk
        const filePath = path.join(__dirname, '../uploads/interview-recordings', rows[0].stored_filename);
        try { await fs.unlink(filePath); } catch (e) { /* file may already be gone */ }

        await db.query('DELETE FROM interview_recordings WHERE id = ?', [recordingId]);
        res.json({ success: true, message: 'Recording deleted' });
    } catch (error) {
        console.error('Error deleting interview recording:', error);
        res.status(500).json({ success: false, message: 'Failed to delete recording' });
    }
});

// ===============================================
// FACULTY ONBOARDING
// Table: teacher_onboarding (auto-created, linked to teacher_registrations.id)
// ===============================================

const ensureTeacherOnboardingTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS teacher_onboarding (
            id INT PRIMARY KEY AUTO_INCREMENT,
            registration_id INT NOT NULL UNIQUE,
            contract_signed TINYINT(1) DEFAULT 0,
            it_setup_completed TINYINT(1) DEFAULT 0,
            lms_access_granted TINYINT(1) DEFAULT 0,
            course_assigned TINYINT(1) DEFAULT 0,
            office_orientation TINYINT(1) DEFAULT 0,
            handbook_received TINYINT(1) DEFAULT 0,
            id_card_issued TINYINT(1) DEFAULT 0,
            onboarding_status ENUM('Pending','In Progress','Completed') DEFAULT 'Pending',
            remarks TEXT,
            started_at DATETIME,
            completed_at DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (registration_id) REFERENCES teacher_registrations(id) ON DELETE CASCADE,
            INDEX idx_reg_id (registration_id),
            INDEX idx_status (onboarding_status)
        )
    `);
};

// GET /api/students/faculty-onboarding
router.get('/faculty-onboarding', async (req, res) => {
    try {
        await ensureTeacherOnboardingTable();
        const { status, search } = req.query;
        let conditions = [`tr.application_status = 'accepted'`];
        const params = [];
        if (status && status !== 'all') {
            conditions.push('COALESCE(tob.onboarding_status, "Pending") = ?');
            params.push(status);
        }
        if (search) {
            conditions.push('(tr.first_name LIKE ? OR tr.last_name LIKE ? OR tr.email LIKE ? OR tr.registration_reference LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const [rows] = await db.execute(
            `SELECT tr.id, tr.registration_reference,
                    CONCAT(tr.first_name, ' ', tr.last_name) as full_name,
                    tr.email, tr.contact_number as phone_number,
                    tr.selected_course_title as subject_specialisation,
                    tr.created_at as applied_at,
                    tob.id as onboarding_id,
                    COALESCE(tob.contract_signed, 0) as contract_signed,
                    COALESCE(tob.it_setup_completed, 0) as it_setup_completed,
                    COALESCE(tob.lms_access_granted, 0) as lms_access_granted,
                    COALESCE(tob.course_assigned, 0) as course_assigned,
                    COALESCE(tob.office_orientation, 0) as office_orientation,
                    COALESCE(tob.handbook_received, 0) as handbook_received,
                    COALESCE(tob.id_card_issued, 0) as id_card_issued,
                    COALESCE(tob.onboarding_status, 'Pending') as onboarding_status,
                    tob.remarks, tob.started_at, tob.completed_at,
                    (tr.created_user_id IS NOT NULL) as moodle_activated,
                    tr.selected_course_code
             FROM teacher_registrations tr
             LEFT JOIN teacher_onboarding tob ON tob.registration_id = tr.id
             ${where}
             ORDER BY tr.created_at DESC`,
            params
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching faculty onboarding:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/students/faculty-onboarding/:registrationId
router.put('/faculty-onboarding/:registrationId', async (req, res) => {
    try {
        await ensureTeacherOnboardingTable();
        const { registrationId } = req.params;
        const {
            contract_signed, it_setup_completed, lms_access_granted,
            course_assigned, office_orientation, handbook_received,
            id_card_issued, remarks
        } = req.body;

        const boolFields = [contract_signed, it_setup_completed, lms_access_granted,
            course_assigned, office_orientation, handbook_received, id_card_issued];
        const completedCount = boolFields.filter(v => v == 1 || v === true).length;
        const total = 7;
        let onboarding_status = 'Pending';
        if (completedCount === total) onboarding_status = 'Completed';
        else if (completedCount > 0) onboarding_status = 'In Progress';

        // Fetch existing row to preserve started_at / completed_at
        const [existing] = await db.execute(
            'SELECT id, started_at, completed_at FROM teacher_onboarding WHERE registration_id = ? LIMIT 1',
            [registrationId]
        );

        const now = new Date();
        const started_at = completedCount > 0
            ? (existing[0]?.started_at || now)
            : null;
        const completed_at = onboarding_status === 'Completed'
            ? (existing[0]?.completed_at || now)
            : null;

        const vals = [
            contract_signed ? 1 : 0, it_setup_completed ? 1 : 0, lms_access_granted ? 1 : 0,
            course_assigned ? 1 : 0, office_orientation ? 1 : 0, handbook_received ? 1 : 0,
            id_card_issued ? 1 : 0, onboarding_status, remarks || null, started_at, completed_at
        ];

        if (existing.length > 0) {
            await db.execute(
                `UPDATE teacher_onboarding SET
                    contract_signed = ?, it_setup_completed = ?, lms_access_granted = ?,
                    course_assigned = ?, office_orientation = ?, handbook_received = ?,
                    id_card_issued = ?, onboarding_status = ?, remarks = ?,
                    started_at = ?, completed_at = ?
                 WHERE registration_id = ?`,
                [...vals, registrationId]
            );
        } else {
            await db.execute(
                `INSERT INTO teacher_onboarding
                    (registration_id, contract_signed, it_setup_completed, lms_access_granted,
                     course_assigned, office_orientation, handbook_received, id_card_issued,
                     onboarding_status, remarks, started_at, completed_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [registrationId, ...vals]
            );
        }

        res.json({ success: true, message: 'Onboarding updated', onboarding_status });
    } catch (error) {
        console.error('Error updating faculty onboarding:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/students/faculty-onboarding/:registrationId/activate
// Creates Moodle user account + SCL portal account for a completed faculty member.
// Course assignment is done separately via the Active Faculty page.
router.post('/faculty-onboarding/:registrationId/activate', async (req, res) => {
    try {
        const { registrationId } = req.params;
        const [rows] = await db.execute('SELECT * FROM teacher_registrations WHERE id = ? LIMIT 1', [registrationId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Faculty registration not found' });

        const reg = rows[0];
        if (reg.application_status !== 'accepted') {
            return res.status(400).json({ success: false, message: 'Faculty application must be accepted before activation' });
        }

        // NOTE: No Moodle operations here.
        // Moodle account + course enrollment happen together when the first course
        // is assigned via Active Faculty → Assign to Subject Unit.

        // Create or update SCL portal user account
        const [userRows] = await db.execute('SELECT id, password, role FROM users WHERE email = ? LIMIT 1', [reg.email]);
        let userId, tempPassword = null, userStatus;
        if (userRows.length === 0) {
            tempPassword = generateTempPassword();
            const passwordHash = crypto.createHash('sha256').update(tempPassword).digest('hex');
            const mergedRole = mergeRoleValue('', reg.teaching_role || 'editingteacher');
            const [ins] = await db.execute(
                'INSERT INTO users (email, password, password_hash, first_name, last_name, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
                [reg.email, tempPassword, passwordHash, reg.first_name, reg.last_name, mergedRole, reg.contact_number || null]
            );
            userId = Number(ins.insertId);
            userStatus = 'created';
        } else {
            userId = Number(userRows[0].id);
            tempPassword = userRows[0].password || null;
            const mergedRole = mergeRoleValue(userRows[0].role, reg.teaching_role || 'editingteacher');
            await db.execute(
                'UPDATE users SET role = ?, first_name = ?, last_name = ?, phone = COALESCE(?, phone), is_active = 1 WHERE id = ?',
                [mergedRole, reg.first_name, reg.last_name, reg.contact_number || null, userId]
            );
            userStatus = 'updated';
        }

        // Mark registration as activated
        await db.execute(
            'UPDATE teacher_registrations SET created_user_id = ? WHERE id = ?',
            [userId, registrationId]
        );

        return res.json({
            success: true,
            message: `${reg.first_name} ${reg.last_name} portal account is ready. Assign a subject in Active Faculty to provision their Moodle account.`,
            data: {
                email: reg.email,
                full_name: `${reg.first_name} ${reg.last_name}`,
                password: tempPassword,
                user_status: userStatus,
                portal_role: reg.teaching_role || 'editingteacher'
            }
        });
    } catch (error) {
        console.error('Error activating faculty member:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===============================================
// STUDENT ONBOARDING TRACKER
// Table: student_onboarding_tracker (auto-created, linked to student_applications.id)
// ===============================================

const ensureStudentOnboardingTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS student_onboarding_tracker (
            id INT PRIMARY KEY AUTO_INCREMENT,
            application_id INT NOT NULL UNIQUE,
            welcome_email_sent TINYINT(1) DEFAULT 0,
            portal_access_granted TINYINT(1) DEFAULT 0,
            moodle_enrolled TINYINT(1) DEFAULT 0,
            handbook_signed TINYINT(1) DEFAULT 0,
            orientation_attended TINYINT(1) DEFAULT 0,
            it_setup_completed TINYINT(1) DEFAULT 0,
            student_id_issued TINYINT(1) DEFAULT 0,
            onboarding_status ENUM('Pending','In Progress','Completed') DEFAULT 'Pending',
            remarks TEXT,
            started_at DATETIME,
            completed_at DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
            INDEX idx_app_id (application_id),
            INDEX idx_status (onboarding_status)
        )
    `);
};

// GET /api/students/student-onboarding
router.get('/student-onboarding', async (req, res) => {
    try {
        await ensureStudentOnboardingTable();
        const { status, search, course_code } = req.query;
        let conditions = [`sa.application_status = 'accepted'`];
        const params = [];
        if (status && status !== 'all') {
            conditions.push('COALESCE(sot.onboarding_status, "Pending") = ?');
            params.push(status);
        }
        if (search) {
            conditions.push('(sa.first_name LIKE ? OR sa.last_name LIKE ? OR sa.email LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (course_code) {
            conditions.push('sa.course_code = ?');
            params.push(course_code);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const [rows] = await db.execute(
            `SELECT sa.id, sa.application_reference, sa.first_name, sa.last_name,
                    sa.email, sa.course_title, sa.course_code, sa.intake_start_date,
                    sa.created_at as applied_at,
                    sot.id as onboarding_id,
                    COALESCE(sot.welcome_email_sent, 0) as welcome_email_sent,
                    COALESCE(sot.portal_access_granted, 0) as portal_access_granted,
                    COALESCE(sot.moodle_enrolled, 0) as moodle_enrolled,
                    COALESCE(sot.handbook_signed, 0) as handbook_signed,
                    COALESCE(sot.orientation_attended, 0) as orientation_attended,
                    COALESCE(sot.it_setup_completed, 0) as it_setup_completed,
                    COALESCE(sot.student_id_issued, 0) as student_id_issued,
                    COALESCE(sot.onboarding_status, 'Pending') as onboarding_status,
                    sot.remarks, sot.started_at, sot.completed_at
             FROM student_applications sa
             LEFT JOIN student_onboarding_tracker sot ON sot.application_id = sa.id
             ${where}
             ORDER BY sa.created_at DESC`,
            params
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching student onboarding:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/students/student-onboarding/:applicationId
router.put('/student-onboarding/:applicationId', async (req, res) => {
    try {
        await ensureStudentOnboardingTable();
        const { applicationId } = req.params;
        const {
            welcome_email_sent, portal_access_granted, moodle_enrolled,
            handbook_signed, orientation_attended, it_setup_completed,
            student_id_issued, remarks
        } = req.body;

        const fields = { welcome_email_sent, portal_access_granted, moodle_enrolled,
            handbook_signed, orientation_attended, it_setup_completed, student_id_issued };
        const completedCount = Object.values(fields).filter(v => v == 1 || v === true).length;
        const total = 7;
        let onboarding_status = 'Pending';
        if (completedCount === total) onboarding_status = 'Completed';
        else if (completedCount > 0) onboarding_status = 'In Progress';

        await db.execute(
            `INSERT INTO student_onboarding_tracker
                (application_id, welcome_email_sent, portal_access_granted, moodle_enrolled,
                 handbook_signed, orientation_attended, it_setup_completed, student_id_issued,
                 onboarding_status, remarks, started_at, completed_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, IF(? > 0, NOW(), NULL), IF(? = ?, NOW(), NULL))
             ON DUPLICATE KEY UPDATE
                welcome_email_sent = VALUES(welcome_email_sent),
                portal_access_granted = VALUES(portal_access_granted),
                moodle_enrolled = VALUES(moodle_enrolled),
                handbook_signed = VALUES(handbook_signed),
                orientation_attended = VALUES(orientation_attended),
                it_setup_completed = VALUES(it_setup_completed),
                student_id_issued = VALUES(student_id_issued),
                onboarding_status = VALUES(onboarding_status),
                remarks = VALUES(remarks),
                started_at = IF(VALUES(welcome_email_sent) OR VALUES(portal_access_granted) OR VALUES(moodle_enrolled) OR VALUES(handbook_signed) OR VALUES(orientation_attended) OR VALUES(it_setup_completed) OR VALUES(student_id_issued), COALESCE(started_at, NOW()), started_at),
                completed_at = IF(VALUES(onboarding_status) = 'Completed', COALESCE(completed_at, NOW()), NULL)`,
            [
                applicationId,
                welcome_email_sent ? 1 : 0, portal_access_granted ? 1 : 0, moodle_enrolled ? 1 : 0,
                handbook_signed ? 1 : 0, orientation_attended ? 1 : 0, it_setup_completed ? 1 : 0,
                student_id_issued ? 1 : 0,
                onboarding_status, remarks || null,
                completedCount,
                completedCount, total
            ]
        );
        res.json({ success: true, message: 'Onboarding updated', onboarding_status });
    } catch (error) {
        console.error('Error updating student onboarding:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

