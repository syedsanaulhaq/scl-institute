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
        const [enrolledRows] = await moodleDbPool.execute(`
            SELECT DISTINCT
                c.id,
                c.idnumber AS course_code,
                c.shortname AS course_shortname,
                c.fullname AS course_title,
                COALESCE(cc.name, 'General') AS course_type,
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

        // Fetch course modules
        const [moduleRows] = await moodleDbPool.execute(`
            SELECT cm.id, cm.section, cm.instance, cm.idnumber, m.name as module_type
            FROM mdl_course_modules cm
            INNER JOIN mdl_modules m ON m.id = cm.module
            WHERE cm.course = ? AND cm.deletioninprogress = 0
            ORDER BY cm.section ASC, cm.id ASC
        `, [numCourseId]);

        // Group modules by section
        const modulesBySection = {};
        moduleRows.forEach(mod => {
            if (!modulesBySection[mod.section]) {
                modulesBySection[mod.section] = [];
            }
            modulesBySection[mod.section].push({
                id: mod.id,
                instance: mod.instance,
                type: mod.module_type,
                idnumber: mod.idnumber
            });
        });

        // Build section with modules structure
        const sections = sectionRows.map(section => ({
            id: section.id,
            section: section.section,
            name: section.name || `Section ${section.section}`,
            summary: section.summary,
            modules: modulesBySection[section.section] || []
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
// ROUTE 1: GET /api/students/courses
// Get list of available courses - fetching directly from Moodle database
// ===============================================
router.get('/courses', async (req, res) => {
    try {
        const scope = String(req.query.scope || '').toLowerCase();
        const admissionsScope = scope === 'admissions';
        const activeOnlyParam = String(req.query.activeOnly || (admissionsScope ? 'true' : 'false')).toLowerCase();
        const activeOnly = activeOnlyParam === 'true' || activeOnlyParam === '1' || activeOnlyParam === 'yes';
        const nowUnix = Math.floor(Date.now() / 1000);

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
        } catch (moodleError) {
            console.error('Moodle DB error:', moodleError.message);
            // Fall through to SCL database fallback
        }

        // Fallback to SCL Institute database courses
        console.log('Using SCL Institute database courses as fallback');
        const fallbackQuery = `
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
                awarding_body,
                course_status
            FROM courses 
            ${activeOnly ? "WHERE course_status = 'active'" : ''}
            ORDER BY course_title
        `;
        const [courses] = await db.execute(fallbackQuery);

        const normalizedCourses = courses.map((course) => ({
            ...course,
            is_active: String(course.course_status || '').toLowerCase() === 'active'
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
    { name: 'visa_immigration', maxCount: 5 }
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
            course_code, 
            course_type, 
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
    { name: 'visa_immigration', maxCount: 5 }
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

        // Update main application
        await connection.execute(`
            UPDATE student_applications SET
                first_name = ?, middle_names = ?, last_name = ?, date_of_birth = ?, gender = ?, nationality = ?,
                email = ?, contact_number = ?, address_line1 = ?, address_line2 = ?, town_city = ?, postcode = ?, country_of_residence = ?,
                course_title = ?, course_code = ?, course_type = ?, mode_of_study = ?, intake_start_date = ?, entry_route = ?,
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
            course_code, 
            course_type, 
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
                    course_code
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
            SELECT sa.*, c.department, c.awarding_body, c.duration_months
            FROM student_applications sa
            LEFT JOIN courses c ON sa.course_code = c.course_code
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
                'SELECT id, email, first_name, last_name, course_title, course_code, intake_start_date, application_status FROM student_applications WHERE id = ?',
                [id]
            );

            if (appRows.length > 0) {
                const { first_name, last_name, course_title, course_code, intake_start_date, application_status } = appRows[0];
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

                // Assign student to Moodle cohort based on intake
                try {
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
                    } else {
                        console.warn(`[MOODLE COHORT WARNING] ${cohortAssignmentResult.message}`);
                    }
                } catch (cohortError) {
                    console.warn('[MOODLE COHORT ASSIGNMENT WARNING]', cohortError.message);
                }

                // Enroll student in Moodle course if accepted
                let moodleResult = null;
                let moodleSingleProgrammeCleanup = null;
                if (newStatus === 'accepted') {
                    // Use programme-wide enrolment for INFO courses
                    if (course_code && course_code.toUpperCase().includes('-INFO')) {
                        moodleResult = await enrollStudentInProgrammeCourses(
                            email,
                            first_name,
                            last_name,
                            course_code
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
async function enrollStudentInProgrammeCourses(email, firstName, lastName, infoCourseCode) {
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
            progression: progressionResult
        };

    } catch (error) {
        console.error('[PROG ENROLL ERROR]', error.message);
        try {
            const programmeCode = extractProgrammeCode(infoCourseCode);
            const allCourses = await getProgrammeModuleCourses(programmeCode);
            const fallbackResult = await fallbackEnrollStudentInCourseIds(email, allCourses.map((course) => course.id));
            let progressionResult = null;
            try {
                progressionResult = await enforceProgrammeProgressionLocks(email, programmeCode);
            } catch (progressionError) {
                console.warn('[PROG ENROLL FALLBACK PROGRESSION WARNING]', progressionError.message);
            }
            return {
                ...fallbackResult,
                enrolledCourses: allCourses.map((course) => ({ id: course.id, name: course.fullname })),
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
async function enrollStudentInMoodle(email, firstName, lastName, courseCode) {
    try {
        const axios = require('axios');
        const moodleToken = process.env.MOODLE_TOKEN || 'e86dd021aaa42f78114e6c67cc9d8ff1';
        const moodleUrl = process.env.MOODLE_INTERNAL_URL || 'http://scli-moodle-dev:8080';

        let targetCourse = await getMoodleCourseByCode(courseCode);

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
                        app.course_code
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
            WHERE email = ? AND application_status = 'accepted' AND is_deleted = FALSE
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
                application.course_code
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

        try {
            // Get course ID - try multiple ways to find the course using shared pool
            let courseId = null;
            
            // First try exact match by idnumber or shortname
            const [courseRows] = await moodleDbPool.execute(
                `SELECT id FROM mdl_course WHERE idnumber = ? OR shortname = ? LIMIT 1`,
                [courseCode, courseCode]
            );
            
            if (courseRows.length > 0) {
                courseId = courseRows[0].id;
            } else {
                // Try by idnumber starting with the code (e.g., "DEG-001 B.Sc Computer Science" contains "DEG-001")
                const [idnumberRows] = await moodleDbPool.execute(
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
                WHERE e.courseid = ? AND e.visible = 1
                ORDER BY e.timestart ASC
                `,
                [courseId]
            );

            // Get assignments with due dates
            const [assignmentRows] = await moodleDbPool.execute(
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
        
        // Get Moodle course ID using shared connection pool
        const [courseRows] = await moodleDbPool.query(
            `SELECT id FROM mdl_course WHERE idnumber LIKE ? OR fullname LIKE ? OR shortname LIKE ? LIMIT 1`,
            [`${courseCode}%`, `%${courseCode}%`, `%${courseCode}%`]
        );

        if (courseRows.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        const courseId = courseRows[0].id;

        // Get assignments with due dates
        const [assignments] = await moodleDbPool.query(
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
                                absent: absentCount,
                                late: lateCount,
                                excused: excusedCount,
                                rate: attendanceRate
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
        const courseCode = appRows[0].course_code;

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

        // Get course ID
        const [courseRows] = await moodleDbPool.query(
            `SELECT id FROM mdl_course WHERE idnumber LIKE ? OR fullname LIKE ? OR shortname LIKE ? LIMIT 1`,
            [`${courseCode}%`, `%${courseCode}%`, `%${courseCode}%`]
        );

        if (courseRows.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        const courseId = courseRows[0].id;

        // Get grades from gradebook
        const [grades] = await moodleDbPool.query(
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

        const [courseTotals] = await moodleDbPool.query(
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
                        targetCourseCode
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

module.exports = router;

