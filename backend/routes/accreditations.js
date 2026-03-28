const express = require('express');
const pool = require('../db');

const router = express.Router();
const INIT_MAX_RETRIES = 30;
const INIT_RETRY_DELAY_MS = 5000;

// ===============================================
// Initialize Course Accreditation Tables
// ===============================================
async function ensureCourseAccreditationTables() {
    try {
        const createTablesSQL = `
CREATE TABLE IF NOT EXISTS course_lifecycle_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lifecycle_key VARCHAR(255) NOT NULL UNIQUE,
    course_title VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NULL,
    programme_type_name VARCHAR(255) NULL,
    program_name VARCHAR(255) NULL,
    academic_year VARCHAR(50) NULL,
    semester_name VARCHAR(50) NULL,
    programme_type_category_id INT NULL,
    program_category_id INT NULL,
    year_category_id INT NULL,
    semester_category_id INT NULL,
    awarding_body VARCHAR(255) NULL,
    qualification_level VARCHAR(120) NULL,
    application_type VARCHAR(120) NULL,
    course_type VARCHAR(120) NULL,
    document_owner VARCHAR(255) NULL,
    lead_coordinator VARCHAR(255) NULL,
    version VARCHAR(20) NULL,
    accreditation_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_course_title (course_title),
    KEY idx_course_code (course_code),
    KEY idx_accreditation_id (accreditation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_accreditations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_title VARCHAR(255),
    course_code VARCHAR(50),
    awarding_body VARCHAR(255),
    application_type VARCHAR(100),
    date_started DATE,
    expected_submission_date DATE,
    lead_coordinator VARCHAR(255),
    version VARCHAR(20) DEFAULT '1.0',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    overall_status VARCHAR(50) DEFAULT 'Draft',
    completion_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    KEY idx_status (overall_status),
    KEY idx_created_at (created_at),
    KEY idx_course_code (course_code),
    KEY idx_course_title (course_title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS accreditation_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accreditation_id INT NOT NULL,
    section_number INT,
    section_title VARCHAR(255),
    task_name VARCHAR(255),
    description TEXT,
    evidence_required VARCHAR(255),
    source_reference VARCHAR(255),
    responsible_person VARCHAR(255),
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Not Started',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (accreditation_id) REFERENCES course_accreditations(id) ON DELETE CASCADE,
    KEY idx_accreditation_id (accreditation_id),
    KEY idx_section_number (section_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS accreditation_risks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accreditation_id INT NOT NULL,
    risk_issue VARCHAR(255),
    impact VARCHAR(255),
    mitigation VARCHAR(255),
    owner VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Open',
    review_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (accreditation_id) REFERENCES course_accreditations(id) ON DELETE CASCADE,
    KEY idx_accreditation_id (accreditation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS accreditation_signoffs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accreditation_id INT NOT NULL,
    role VARCHAR(255),
    name VARCHAR(255),
    sign_date DATE,
    signature VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (accreditation_id) REFERENCES course_accreditations(id) ON DELETE CASCADE,
    KEY idx_accreditation_id (accreditation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        const statements = createTablesSQL.split(';').filter((s) => s.trim());
        for (const statement of statements) {
            await pool.query(statement);
        }

        // Backward-compatible migration if table exists but misses course_code.
        try {
            await pool.query('ALTER TABLE course_accreditations ADD COLUMN course_code VARCHAR(50)');
        } catch (e) {
            // Column already exists.
        }

        const safeAddMasterColumn = async (columnSql) => {
            try {
                await pool.query(`ALTER TABLE course_lifecycle_master ADD COLUMN ${columnSql}`);
            } catch (e) {
                // Column likely exists already.
            }
        };

        await safeAddMasterColumn('qualification_level VARCHAR(120) NULL');
        await safeAddMasterColumn('application_type VARCHAR(120) NULL');
        await safeAddMasterColumn('course_type VARCHAR(120) NULL');
        await safeAddMasterColumn('document_owner VARCHAR(255) NULL');
        await safeAddMasterColumn('lead_coordinator VARCHAR(255) NULL');
        await safeAddMasterColumn('version VARCHAR(20) NULL');
        await safeAddMasterColumn('programme_type_name VARCHAR(255) NULL');
        await safeAddMasterColumn('program_name VARCHAR(255) NULL');
        await safeAddMasterColumn('academic_year VARCHAR(50) NULL');
        await safeAddMasterColumn('semester_name VARCHAR(50) NULL');
        await safeAddMasterColumn('programme_type_category_id INT NULL');
        await safeAddMasterColumn('program_category_id INT NULL');
        await safeAddMasterColumn('year_category_id INT NULL');
        await safeAddMasterColumn('semester_category_id INT NULL');
        await safeAddMasterColumn("current_stage VARCHAR(50) NULL DEFAULT 'pending_accreditation'");

        // Local (pre-Moodle-sync) category store
        await pool.query(`
            CREATE TABLE IF NOT EXISTS scl_local_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                level VARCHAR(30) NOT NULL,
                parent_local_id INT NULL,
                parent_moodle_id INT NULL,
                moodle_category_id INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✓ Course Accreditation tables initialized');
    } catch (error) {
        console.error('Error initializing course accreditation tables:', error.message);
        throw error;
    }
}

function shouldRetryInit(error) {
    const message = String(error?.message || '').toLowerCase();
    return (
        error?.code === 'ECONNREFUSED' ||
        error?.code === 'ETIMEDOUT' ||
        error?.code === 'PROTOCOL_CONNECTION_LOST' ||
        message.includes('connect econnrefused') ||
        message.includes('too many connections') ||
        message.includes('can\'t connect')
    );
}

function startAccreditationInitWithRetry(attempt = 1) {
    ensureCourseAccreditationTables()
        .then(() => {
            if (attempt > 1) {
                console.log(`[INIT] Course accreditation tables initialized after retry attempt ${attempt}`);
            }
        })
        .catch((error) => {
            if (!shouldRetryInit(error) || attempt >= INIT_MAX_RETRIES) {
                console.error(`[INIT] Course accreditation table init failed permanently after attempt ${attempt}:`, error.message);
                return;
            }

            console.warn(`[INIT] Course accreditation table init retry ${attempt}/${INIT_MAX_RETRIES} in ${INIT_RETRY_DELAY_MS}ms`);
            setTimeout(() => startAccreditationInitWithRetry(attempt + 1), INIT_RETRY_DELAY_MS);
        });
}

startAccreditationInitWithRetry();

function buildLifecycleMasterKey(courseCode, courseTitle) {
    const code = String(courseCode || '').trim().toUpperCase();
    if (code) return `code:${code}`;
    return `title:${String(courseTitle || '').trim().toLowerCase()}`;
}

async function getLifecycleMasterColumnSet() {
    const [rows] = await pool.query('SHOW COLUMNS FROM course_lifecycle_master');
    return new Set((rows || []).map((r) => r.Field));
}

function buildDynamicUpsertSql(tableName, insertMap, updateMap) {
    const columns = Object.keys(insertMap);
    const placeholders = columns.map(() => '?').join(', ');
    const updates = Object.keys(updateMap).map((col) => `${col} = ${updateMap[col]}`).join(', ');

    return {
        sql: `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates}`,
        values: columns.map((col) => insertMap[col])
    };
}

async function upsertLifecycleMasterFromAccreditation(accreditation) {
    if (!accreditation) return;
    const lifecycleKey = buildLifecycleMasterKey(accreditation.course_code, accreditation.course_title);
    if (!lifecycleKey || lifecycleKey === 'title:') return;

    const columns = await getLifecycleMasterColumnSet();
    const insertMap = {};
    const updateMap = {};

    insertMap.lifecycle_key = lifecycleKey;
    updateMap.lifecycle_key = 'VALUES(lifecycle_key)';

    if (columns.has('course_title')) {
        insertMap.course_title = accreditation.course_title || 'Untitled';
        updateMap.course_title = 'VALUES(course_title)';
    }
    if (columns.has('course_code')) {
        insertMap.course_code = accreditation.course_code || null;
        updateMap.course_code = 'VALUES(course_code)';
    }
    if (columns.has('awarding_body')) {
        insertMap.awarding_body = accreditation.awarding_body || null;
        updateMap.awarding_body = 'VALUES(awarding_body)';
    }
    if (columns.has('application_type')) {
        insertMap.application_type = accreditation.application_type || null;
        updateMap.application_type = 'IFNULL(VALUES(application_type), application_type)';
    }
    if (columns.has('lead_coordinator')) {
        insertMap.lead_coordinator = accreditation.lead_coordinator || null;
        updateMap.lead_coordinator = 'IFNULL(VALUES(lead_coordinator), lead_coordinator)';
    }
    if (columns.has('version')) {
        insertMap.version = accreditation.version || null;
        updateMap.version = 'IFNULL(VALUES(version), version)';
    }
    if (columns.has('accreditation_id')) {
        insertMap.accreditation_id = accreditation.id || null;
        updateMap.accreditation_id = 'VALUES(accreditation_id)';
    }
    if (columns.has('current_stage')) {
        insertMap.current_stage = 'pending_accreditation';
        updateMap.current_stage = "IFNULL(current_stage, 'pending_accreditation')";
    }
    if (columns.has('updated_at')) {
        updateMap.updated_at = 'CURRENT_TIMESTAMP';
    }

    const { sql, values } = buildDynamicUpsertSql('course_lifecycle_master', insertMap, updateMap);
    await pool.query(sql, values);
}

function normalizeLifecycleStatus(value) {
    return String(value || '').trim().toLowerCase();
}

function isDoneLifecycleStatus(value) {
    return ['completed', 'complete', 'approved', 'active'].includes(normalizeLifecycleStatus(value));
}

async function updateLifecycleMasterStage(courseCode, courseTitle, stage) {
    const normalizedCode = String(courseCode || '').trim();
    const normalizedTitle = String(courseTitle || '').trim();

    if (!normalizedCode && !normalizedTitle) {
        return;
    }

    if (normalizedCode) {
        await pool.query(
            'UPDATE course_lifecycle_master SET current_stage = ?, updated_at = CURRENT_TIMESTAMP WHERE course_code = ?',
            [stage, normalizedCode]
        );
        return;
    }

    await pool.query(
        'UPDATE course_lifecycle_master SET current_stage = ?, updated_at = CURRENT_TIMESTAMP WHERE course_title = ?',
        [stage, normalizedTitle]
    );
}

async function recalculateAccreditationProgress(accreditationId) {
    const [accreditationRows] = await pool.query(
        'SELECT * FROM course_accreditations WHERE id = ? LIMIT 1',
        [accreditationId]
    );

    if (!accreditationRows.length) {
        return null;
    }

    const accreditation = accreditationRows[0];
    const [summaryRows] = await pool.query(
        `SELECT
            COUNT(*) AS total_tasks,
            SUM(CASE WHEN LOWER(TRIM(status)) IN ('completed', 'complete', 'approved', 'done') THEN 1 ELSE 0 END) AS done_tasks
         FROM accreditation_tasks
         WHERE accreditation_id = ?`,
        [accreditationId]
    );

    const summary = summaryRows[0] || {};
    const totalTasks = Number(summary.total_tasks || 0);
    const doneTasks = Number(summary.done_tasks || 0);
    const completionPercentage = totalTasks > 0
        ? Math.max(0, Math.min(100, Math.round((doneTasks / totalTasks) * 100)))
        : 0;

    let derivedStatus = 'Not Started';
    if (completionPercentage >= 100 && totalTasks > 0) {
        derivedStatus = 'Completed';
    } else if (completionPercentage > 0 || totalTasks > 0) {
        derivedStatus = 'In Progress';
    }

    const currentStatus = String(accreditation.overall_status || '').trim();
    const isApproved = normalizeLifecycleStatus(currentStatus) === 'approved';
    const nextStatus = isApproved ? currentStatus || 'Approved' : derivedStatus;

    await pool.query(
        'UPDATE course_accreditations SET completion_percentage = ?, overall_status = ? WHERE id = ?',
        [completionPercentage, nextStatus, accreditationId]
    );

    const [updatedRows] = await pool.query('SELECT * FROM course_accreditations WHERE id = ?', [accreditationId]);
    const updated = updatedRows[0] || null;

    if (updated) {
        await upsertLifecycleMasterFromAccreditation(updated);
        if (isDoneLifecycleStatus(updated.overall_status)) {
            await updateLifecycleMasterStage(updated.course_code, updated.course_title, 'accreditation_done');
        }
    }

    return updated;
}

router.get('/master-courses', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM course_lifecycle_master ORDER BY updated_at DESC, created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching lifecycle master courses:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch lifecycle master courses', error: error.message });
    }
});

// Returns the next available course counter (C-part) for a given structure
router.get('/next-course-counter', async (req, res) => {
    try {
        const programme_type_name = String(req.query.programme_type_name || '').trim();
        const program_name = String(req.query.program_name || '').trim();
        const academic_year = String(req.query.academic_year || '').trim();
        const semester_name = String(req.query.semester_name || '').trim();
        const codePrefix = String(req.query.code_prefix || '').trim();

        const [rows] = await pool.query(
            `SELECT course_code
               FROM course_lifecycle_master
              WHERE programme_type_name = ? AND program_name = ? AND academic_year = ? AND semester_name = ?`,
            [programme_type_name, program_name, academic_year, semester_name]
        );

        let maxCounter = 0;
        if (codePrefix) {
            for (const row of rows || []) {
                const code = String(row?.course_code || '').trim();
                if (!code.startsWith(codePrefix)) continue;
                const suffix = code.slice(codePrefix.length);
                const parsed = Number.parseInt(suffix, 10);
                if (Number.isInteger(parsed) && parsed > maxCounter) {
                    maxCounter = parsed;
                }
            }
        }

        const counter = maxCounter > 0 ? maxCounter + 1 : (rows || []).length + 1;
        res.json({ success: true, counter });
    } catch (error) {
        console.error('Error getting next course counter:', error.message);
        res.status(500).json({ success: false, message: 'Failed to get counter', error: error.message });
    }
});

router.get('/structure-courses', async (req, res) => {
    try {
        const programme_type_name = String(req.query.programme_type_name || '').trim();
        const program_name = String(req.query.program_name || '').trim();
        const academic_year = String(req.query.academic_year || '').trim();
        const semester_name = String(req.query.semester_name || '').trim();
        const codePrefix = String(req.query.code_prefix || '').trim();
        const parseNullableInt = (value) => {
            const parsed = Number(value);
            return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
        };
        const programme_type_category_id = parseNullableInt(req.query.programme_type_category_id);
        const program_category_id = parseNullableInt(req.query.program_category_id);
        const year_category_id = parseNullableInt(req.query.year_category_id);
        const semester_category_id = parseNullableInt(req.query.semester_category_id);

        const hasIds = Boolean(programme_type_category_id || program_category_id || year_category_id || semester_category_id);
        const hasNames = Boolean(programme_type_name && program_name && academic_year && semester_name);
        if (!hasIds && !hasNames) {
            return res.json({ success: true, data: { courses: [], next_counter: 1 } });
        }

        const whereClauses = [];
        const values = [];
        if (semester_category_id) {
            whereClauses.push('semester_category_id = ?');
            values.push(semester_category_id);
        } else if (year_category_id) {
            whereClauses.push('year_category_id = ?');
            values.push(year_category_id);
        } else if (program_category_id) {
            whereClauses.push('program_category_id = ?');
            values.push(program_category_id);
        } else if (programme_type_category_id) {
            whereClauses.push('programme_type_category_id = ?');
            values.push(programme_type_category_id);
        } else {
            whereClauses.push('programme_type_name = ? AND program_name = ? AND academic_year = ? AND semester_name = ?');
            values.push(programme_type_name, program_name, academic_year, semester_name);
        }

        const whereSql = whereClauses.join(' AND ');

        const fetchRows = async (sqlWhere, sqlValues, limitSql = '') => {
            const [mRows] = await pool.query(
                `SELECT id, lifecycle_key, course_title, course_code, updated_at, created_at
                   FROM course_lifecycle_master
                  WHERE ${sqlWhere}
                  ORDER BY updated_at DESC, created_at DESC ${limitSql}`,
                sqlValues
            );

            const [rRows] = await pool.query(
                `SELECT id, NULL AS lifecycle_key, course_title, course_code, updated_at, created_at
                   FROM course_registrations
                  WHERE ${sqlWhere}
                  ORDER BY updated_at DESC, created_at DESC ${limitSql}`,
                sqlValues
            );

            return [mRows || [], rRows || []];
        };

        let [masterRows, registrationRows] = await fetchRows(whereSql, values);

        // Fallback 1: exact name match (for records without category IDs)
        if ((masterRows.length + registrationRows.length === 0) && hasIds && hasNames) {
            const fallbackWhereSql = 'programme_type_name = ? AND program_name = ? AND academic_year = ? AND semester_name = ?';
            [masterRows, registrationRows] = await fetchRows(
                fallbackWhereSql,
                [programme_type_name, program_name, academic_year, semester_name]
            );
        }

        // Fallback 2: legacy shifted mapping (old 3-level data stored in program/year/semester columns)
        if ((masterRows.length + registrationRows.length === 0) && hasNames) {
            const shiftedWhereSql = 'program_name = ? AND academic_year = ? AND semester_name = ?';
            [masterRows, registrationRows] = await fetchRows(
                shiftedWhereSql,
                [programme_type_name, program_name, academic_year]
            );
        }

        // Fallback 3: fuzzy match across structure columns (allows partial historical variance)
        if ((masterRows.length + registrationRows.length === 0) && hasNames) {
            const tokens = [programme_type_name, program_name, academic_year, semester_name]
                .map((t) => String(t || '').trim())
                .filter(Boolean);

            if (tokens.length) {
                const fuzzyParts = [];
                const fuzzyValues = [];
                for (const token of tokens) {
                    fuzzyParts.push("(COALESCE(programme_type_name, '') LIKE ? OR COALESCE(program_name, '') LIKE ? OR COALESCE(academic_year, '') LIKE ? OR COALESCE(semester_name, '') LIKE ?)");
                    const like = `%${token}%`;
                    fuzzyValues.push(like, like, like, like);
                }

                [masterRows, registrationRows] = await fetchRows(fuzzyParts.join(' AND '), fuzzyValues, 'LIMIT 100');
            }
        }

        const mergedRows = [...(masterRows || []), ...(registrationRows || [])];
        const seen = new Set();
        const rows = [];
        for (const row of mergedRows) {
            const key = `${String(row?.course_code || '').trim().toLowerCase()}|${String(row?.course_title || '').trim().toLowerCase()}`;
            if (seen.has(key)) continue;
            seen.add(key);
            rows.push(row);
        }

        let maxCounter = 0;
        if (codePrefix) {
            for (const row of rows || []) {
                const code = String(row?.course_code || '').trim();
                if (!code.startsWith(codePrefix)) continue;
                const suffix = code.slice(codePrefix.length);
                const parsed = Number.parseInt(suffix, 10);
                if (Number.isInteger(parsed) && parsed > maxCounter) {
                    maxCounter = parsed;
                }
            }
        }

        const nextCounter = maxCounter > 0 ? maxCounter + 1 : (rows || []).length + 1;
        return res.json({
            success: true,
            data: {
                courses: rows || [],
                next_counter: nextCounter
            }
        });
    } catch (error) {
        console.error('Error fetching structure courses:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch structure courses', error: error.message });
    }
});

// POST /api/accreditations/local-categories
// Save a new category to SCL DB only (will sync to Moodle later)
router.post('/local-categories', async (req, res) => {
    try {
        const name = String(req.body?.name || '').trim();
        const level = String(req.body?.level || '').trim(); // 'programme_type', 'program', 'year', 'semester'
        const parentLocalId = req.body?.parent_local_id ? Math.abs(Number(req.body.parent_local_id)) : null;
        const parentMoodleId = req.body?.parent_moodle_id ? Number(req.body.parent_moodle_id) : null;
        const moodleCategoryId = req.body?.moodle_category_id ? Number(req.body.moodle_category_id) : null;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }
        if (!level) {
            return res.status(400).json({ success: false, message: 'Category level is required' });
        }

        // Check if already exists locally
        const [existing] = await pool.execute(
            'SELECT id FROM scl_local_categories WHERE name = ? AND level = ? AND (parent_local_id <=> ? OR parent_moodle_id <=> ?)',
            [name, level, parentLocalId, parentMoodleId]
        );
        if (existing.length > 0) {
            // Update moodle_category_id if we now have it
            if (moodleCategoryId) {
                await pool.execute('UPDATE scl_local_categories SET moodle_category_id = ? WHERE id = ?', [moodleCategoryId, existing[0].id]);
            }
            return res.json({
                success: true,
                message: 'Category already exists locally',
                data: { id: -(existing[0].id), name, level, is_local: true, moodle_category_id: moodleCategoryId }
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO scl_local_categories (name, level, parent_local_id, parent_moodle_id, moodle_category_id) VALUES (?, ?, ?, ?, ?)',
            [name, level, parentLocalId, parentMoodleId, moodleCategoryId]
        );

        return res.json({
            success: true,
            message: moodleCategoryId ? 'Category created in Moodle and saved locally' : 'Category saved locally (will sync to Moodle on next sync)',
            data: { id: -(result.insertId), name, level, is_local: true, moodle_category_id: moodleCategoryId }
        });
    } catch (error) {
        console.error('Error saving local category:', error);
        return res.status(500).json({ success: false, message: 'Failed to save category', error: error.message });
    }
});

// GET /api/accreditations/local-categories
router.get('/local-categories', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM scl_local_categories ORDER BY id ASC');
        return res.json({ success: true, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to fetch local categories', error: error.message });
    }
});

router.post('/master-courses', async (req, res) => {
    try {
        const course_title = String(req.body?.course_title || '').trim();
        const course_code = String(req.body?.course_code || '').trim();
        const programme_type_name = String(req.body?.programme_type_name || '').trim();
        const program_name = String(req.body?.program_name || '').trim();
        const academic_year = String(req.body?.academic_year || '').trim();
        const semester_name = String(req.body?.semester_name || '').trim();
        const parseNullableInt = (value) => {
            const parsed = Number(value);
            return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
        };
        const programme_type_category_id = parseNullableInt(req.body?.programme_type_category_id);
        const program_category_id = parseNullableInt(req.body?.program_category_id);
        const year_category_id = parseNullableInt(req.body?.year_category_id);
        const semester_category_id = parseNullableInt(req.body?.semester_category_id);
        const awarding_body = String(req.body?.awarding_body || '').trim();
        const qualification_level = String(req.body?.qualification_level || '').trim();
        const application_type = String(req.body?.application_type || '').trim();
        const course_type = String(req.body?.course_type || '').trim();
        const document_owner = String(req.body?.document_owner || '').trim();
        const lead_coordinator = String(req.body?.lead_coordinator || '').trim();
        const version = String(req.body?.version || '').trim();

        if (!course_title) {
            return res.status(400).json({ success: false, message: 'Course title is required' });
        }

        const lifecycle_key = buildLifecycleMasterKey(course_code, course_title);

        const columns = await getLifecycleMasterColumnSet();
        const insertMap = {
            lifecycle_key,
            course_title,
            course_code: course_code || null,
            programme_type_name: programme_type_name || null,
            program_name: program_name || null,
            academic_year: academic_year || null,
            semester_name: semester_name || null,
            programme_type_category_id,
            program_category_id,
            year_category_id,
            semester_category_id,
            awarding_body: awarding_body || null
        };
        const updateMap = {
            course_title: 'VALUES(course_title)',
            course_code: 'VALUES(course_code)',
            programme_type_name: 'VALUES(programme_type_name)',
            program_name: 'VALUES(program_name)',
            academic_year: 'VALUES(academic_year)',
            semester_name: 'VALUES(semester_name)',
            programme_type_category_id: 'VALUES(programme_type_category_id)',
            program_category_id: 'VALUES(program_category_id)',
            year_category_id: 'VALUES(year_category_id)',
            semester_category_id: 'VALUES(semester_category_id)',
            awarding_body: 'VALUES(awarding_body)'
        };

        if (!columns.has('programme_type_name')) {
            delete insertMap.programme_type_name;
            delete updateMap.programme_type_name;
        }

        if (!columns.has('program_name')) {
            delete insertMap.program_name;
            delete updateMap.program_name;
        }
        if (!columns.has('academic_year')) {
            delete insertMap.academic_year;
            delete updateMap.academic_year;
        }
        if (!columns.has('semester_name')) {
            delete insertMap.semester_name;
            delete updateMap.semester_name;
        }
        if (!columns.has('programme_type_category_id')) {
            delete insertMap.programme_type_category_id;
            delete updateMap.programme_type_category_id;
        }
        if (!columns.has('program_category_id')) {
            delete insertMap.program_category_id;
            delete updateMap.program_category_id;
        }
        if (!columns.has('year_category_id')) {
            delete insertMap.year_category_id;
            delete updateMap.year_category_id;
        }
        if (!columns.has('semester_category_id')) {
            delete insertMap.semester_category_id;
            delete updateMap.semester_category_id;
        }

        if (columns.has('qualification_level')) {
            insertMap.qualification_level = qualification_level || null;
            updateMap.qualification_level = 'VALUES(qualification_level)';
        }
        if (columns.has('application_type')) {
            insertMap.application_type = application_type || null;
            updateMap.application_type = 'VALUES(application_type)';
        }
        if (columns.has('course_type')) {
            insertMap.course_type = course_type || null;
            updateMap.course_type = 'VALUES(course_type)';
        }
        if (columns.has('document_owner')) {
            insertMap.document_owner = document_owner || null;
            updateMap.document_owner = 'VALUES(document_owner)';
        }
        if (columns.has('lead_coordinator')) {
            insertMap.lead_coordinator = lead_coordinator || null;
            updateMap.lead_coordinator = 'VALUES(lead_coordinator)';
        }
        if (columns.has('version')) {
            insertMap.version = version || null;
            updateMap.version = 'VALUES(version)';
        }
        if (columns.has('updated_at')) {
            updateMap.updated_at = 'CURRENT_TIMESTAMP';
        }

        const { sql, values } = buildDynamicUpsertSql('course_lifecycle_master', insertMap, updateMap);
        await pool.query(sql, values);

        const [rows] = await pool.query('SELECT * FROM course_lifecycle_master WHERE lifecycle_key = ? LIMIT 1', [lifecycle_key]);
        res.status(201).json({ success: true, data: rows[0], message: 'Course master saved successfully' });
    } catch (error) {
        console.error('Error saving lifecycle master course:', error.message);
        res.status(500).json({ success: false, message: 'Failed to save lifecycle master course', error: error.message });
    }
});

router.get('/master-courses/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM course_lifecycle_master WHERE id = ? LIMIT 1', [req.params.id]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Master course not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching lifecycle master course by id:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch lifecycle master course', error: error.message });
    }
});

// ===============================================
// ROUTE 1: GET /api/accreditations
// Get all accreditations
// ===============================================
router.get('/', async (req, res) => {
    try {
        const activeOnlyParam = String(req.query.active_only || 'true').trim().toLowerCase();
        const activeOnly = !(activeOnlyParam === 'false' || activeOnlyParam === '0' || activeOnlyParam === 'no');
        const [rows] = await pool.query(
            'SELECT * FROM course_accreditations ORDER BY created_at DESC'
        );

        const isActiveCourse = (row) => {
            if (Object.prototype.hasOwnProperty.call(row, 'is_active')) {
                return Number(row.is_active) === 1 || row.is_active === true || String(row.is_active) === '1';
            }

            const status = String(row.course_status || row.status || row.overall_status || '').trim().toLowerCase();
            if (!status) return true;

            const inactiveStates = new Set(['inactive', 'archived', 'disabled', 'suspended', 'deleted', 'closed']);
            return !inactiveStates.has(status);
        };

        const filteredRows = activeOnly ? rows.filter(isActiveCourse) : rows;
        res.json({ success: true, data: filteredRows });
    } catch (error) {
        console.error('Error fetching accreditations:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch accreditations', error: error.message });
    }
});

// ===============================================
// ROUTE 1B: POST /api/accreditations
// Create new accreditation
// ===============================================
router.post('/', async (req, res) => {
    try {
        const { documentControl, sections, risks, signoffs } = req.body;

        // Create main accreditation record
        const [result] = await pool.query(
            'INSERT INTO course_accreditations (course_title, course_code, awarding_body, application_type, date_started, expected_submission_date, lead_coordinator, version, overall_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                documentControl.course_title || 'Untitled',
                documentControl.course_code || '',
                documentControl.awarding_body || '',
                documentControl.application_type || '',
                documentControl.date_started || null,
                documentControl.expected_submission_date || null,
                documentControl.lead_coordinator || '',
                documentControl.version || '1.0',
                'Draft'
            ]
        );

        const accreditationId = result.insertId;

        // NOTE: Tasks, risks, and signoffs are handled separately by the frontend
        // via the individual endpoint calls, not through the sections array here.
        // This prevents duplicate inserts.

        const [rows] = await pool.query('SELECT * FROM course_accreditations WHERE id = ?', [accreditationId]);
        await upsertLifecycleMasterFromAccreditation(rows[0]);
        res.status(201).json({ success: true, data: rows[0], message: 'Accreditation created successfully' });
    } catch (error) {
        console.error('Error creating accreditation:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create accreditation', error: error.message });
    }
});

// ===============================================
// ROUTE 2: GET /api/accreditations/:id
// Get single accreditation with all details
// ===============================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get main accreditation
        const [accreditations] = await pool.query(
            'SELECT * FROM course_accreditations WHERE id = ?',
            [id]
        );

        if (accreditations.length === 0) {
            return res.status(404).json({ success: false, message: 'Accreditation not found' });
        }

        // Get all tasks grouped by section
        const [tasks] = await pool.query(
            'SELECT * FROM accreditation_tasks WHERE accreditation_id = ? ORDER BY section_number, id',
            [id]
        );

        // Get risks
        const [risks] = await pool.query(
            'SELECT * FROM accreditation_risks WHERE accreditation_id = ? ORDER BY created_at DESC',
            [id]
        );

        // Get sign-offs
        const [signoffs] = await pool.query(
            'SELECT * FROM accreditation_signoffs WHERE accreditation_id = ? ORDER BY role',
            [id]
        );

        res.json({
            success: true,
            data: {
                accreditation: accreditations[0],
                tasks,
                risks,
                signoffs
            }
        });
    } catch (error) {
        console.error('Error fetching accreditation details:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch accreditation details', error: error.message });
    }
});

// ===============================================
// ROUTE 3: PUT /api/accreditations/:id
// Update accreditation (Document Control fields and all sections)
// ===============================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { documentControl } = req.body;

        if (documentControl) {
            const updates = [];
            const params = [];
            const allowedFields = ['course_title', 'course_code', 'awarding_body', 'application_type', 'date_started', 'expected_submission_date', 'lead_coordinator', 'version', 'overall_status', 'completion_percentage'];

            allowedFields.forEach(field => {
                if (documentControl[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    params.push(documentControl[field]);
                }
            });

            if (updates.length > 0) {
                params.push(id);
                await pool.query(
                    `UPDATE course_accreditations SET ${updates.join(', ')} WHERE id = ?`,
                    params
                );
            }
        }

        // NOTE: Tasks, risks, and signoffs are handled separately by the frontend
        // via the individual endpoint calls, not through the sections array here.
        // This prevents duplicate inserts.

        const [rows] = await pool.query('SELECT * FROM course_accreditations WHERE id = ?', [id]);
        await upsertLifecycleMasterFromAccreditation(rows[0]);

        if (rows[0] && isDoneLifecycleStatus(rows[0].overall_status)) {
            await updateLifecycleMasterStage(rows[0].course_code, rows[0].course_title, 'accreditation_done');
        }

        res.json({ success: true, data: rows[0], message: 'Accreditation updated successfully' });
    } catch (error) {
        console.error('Error updating accreditation:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update accreditation', error: error.message });
    }
});

// ===============================================
// ROUTE 3B: DELETE /api/accreditations/:id
// Delete accreditation
// ===============================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete all related data (cascading)
        await pool.query('DELETE FROM accreditation_tasks WHERE accreditation_id = ?', [id]);
        await pool.query('DELETE FROM accreditation_risks WHERE accreditation_id = ?', [id]);
        await pool.query('DELETE FROM accreditation_signoffs WHERE accreditation_id = ?', [id]);
        await pool.query('DELETE FROM course_accreditations WHERE id = ?', [id]);

        res.json({ success: true, message: 'Accreditation deleted successfully' });
    } catch (error) {
        console.error('Error deleting accreditation:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete accreditation', error: error.message });
    }
});

// ===============================================
// ROUTE 4: POST /api/accreditations/:id/tasks
// Add task/requirement
// ===============================================
router.post('/:id/tasks', async (req, res) => {
    try {
        const { id } = req.params;
        const { section_number, area, description, responsible, status, notes, source, evidence } = req.body;

        // Get section title from SECTION_CONFIG or use default
        const sectionTitles = {
            1: 'Initial Planning & Approval',
            2: 'Application Preparation',
            3: 'Submission & Engagement',
            4: 'Review, Visits & Validation',
            5: 'Agreement & Implementation',
            6: 'Post-Approval Monitoring',
            7: 'Risk & Issue Log',
            8: 'Sign-off'
        };

        const [result] = await pool.query(
            'INSERT INTO accreditation_tasks (accreditation_id, section_number, section_title, task_name, description, evidence_required, source_reference, responsible_person, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, section_number, sectionTitles[section_number] || '', area || '', description || '', evidence || '', source || '', responsible || '', status || 'Not Started', notes || null]
        );

        await recalculateAccreditationProgress(id);

        const [rows] = await pool.query('SELECT * FROM accreditation_tasks WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error adding task:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add task', error: error.message });
    }
});

// ===============================================
// ROUTE 5: PUT /api/accreditations/:id/tasks/:taskId
// Update task
// ===============================================
router.put('/:id/tasks/:taskId', async (req, res) => {
    try {
        const { id, taskId } = req.params;
        const { section_number, area, description, responsible, status, notes, source, evidence } = req.body;

        // Section title lookup
        const sectionTitles = {
            1: 'Initial Planning & Approval',
            2: 'Application Preparation',
            3: 'Submission & Engagement',
            4: 'Review, Visits & Validation',
            5: 'Agreement & Implementation',
            6: 'Post-Approval Monitoring',
            7: 'Risk & Issue Log',
            8: 'Sign-off'
        };

        // Map frontend field names to database field names
        const fieldMap = {
            section_number: section_number,
            section_title: section_number ? sectionTitles[section_number] : undefined,
            task_name: area,
            description: description,
            evidence_required: evidence,
            source_reference: source,
            responsible_person: responsible,
            status: status,
            notes: notes
        };

        const updates = [];
        const params = [];

        Object.entries(fieldMap).forEach(([dbField, value]) => {
            if (value !== undefined) {
                updates.push(`${dbField} = ?`);
                params.push(value);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        params.push(taskId, id);

        await pool.query(
            `UPDATE accreditation_tasks SET ${updates.join(', ')} WHERE id = ? AND accreditation_id = ?`,
            params
        );

        await recalculateAccreditationProgress(id);

        const [rows] = await pool.query('SELECT * FROM accreditation_tasks WHERE id = ?', [taskId]);
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error updating task:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update task', error: error.message });
    }
});

// ===============================================
// ROUTE 6: DELETE /api/accreditations/:id/tasks/:taskId
// Delete task
// ===============================================
router.delete('/:id/tasks/:taskId', async (req, res) => {
    try {
        const { id, taskId } = req.params;

        await pool.query(
            'DELETE FROM accreditation_tasks WHERE id = ? AND accreditation_id = ?',
            [taskId, id]
        );

        await recalculateAccreditationProgress(id);

        res.json({ success: true, message: 'Task deleted' });
    } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete task', error: error.message });
    }
});

// ===============================================
// ROUTE 7: POST /api/accreditations/:id/risks
// Add risk/issue
// ===============================================
router.post('/:id/risks', async (req, res) => {
    try {
        const { id } = req.params;
        const { risk_issue, impact, mitigation, owner, review_date } = req.body;

        await pool.query(
            'INSERT INTO accreditation_risks (accreditation_id, risk_issue, impact, mitigation, owner, review_date) VALUES (?, ?, ?, ?, ?, ?)',
            [id, risk_issue, impact, mitigation, owner, review_date]
        );

        res.json({ success: true, message: 'Risk added successfully' });
    } catch (error) {
        console.error('Error adding risk:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add risk', error: error.message });
    }
});

// ===============================================
// ROUTE 7: PUT /api/accreditations/:id/risks/:riskId
// Update risk/issue
// ===============================================
router.put('/:id/risks/:riskId', async (req, res) => {
    try {
        const { id, riskId } = req.params;
        const { status, impact, mitigation, owner, review_date } = req.body;

        const updates = [];
        const params = [];

        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }
        if (impact !== undefined) {
            updates.push('impact = ?');
            params.push(impact);
        }
        if (mitigation !== undefined) {
            updates.push('mitigation = ?');
            params.push(mitigation);
        }
        if (owner !== undefined) {
            updates.push('owner = ?');
            params.push(owner);
        }
        if (review_date !== undefined) {
            updates.push('review_date = ?');
            params.push(review_date);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        params.push(id, riskId);

        await pool.query(
            `UPDATE accreditation_risks SET ${updates.join(', ')} WHERE accreditation_id = ? AND id = ?`,
            params
        );

        res.json({ success: true, message: 'Risk updated successfully' });
    } catch (error) {
        console.error('Error updating risk:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update risk', error: error.message });
    }
});

// ===============================================
// ROUTE 8: POST /api/accreditations/:id/signoffs
// Add sign-off
// ===============================================
router.post('/:id/signoffs', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, name, sign_date, signature } = req.body;

        console.log('Creating signoff:', { accreditation_id: id, role, name, sign_date, signature });

        const [result] = await pool.query(
            'INSERT INTO accreditation_signoffs (accreditation_id, role, name, sign_date, signature) VALUES (?, ?, ?, ?, ?)',
            [id, role, name, sign_date, signature]
        );

        const [rows] = await pool.query('SELECT * FROM accreditation_signoffs WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0], message: 'Sign-off added successfully' });
    } catch (error) {
        console.error('Error adding sign-off:', error.message);
        res.status(500).json({ success: false, message: 'Failed to add sign-off', error: error.message });
    }
});

// ===============================================
// ROUTE 9: PUT /api/accreditations/:id/signoffs/:signoffId
// Update sign-off
// ===============================================
router.put('/:id/signoffs/:signoffId', async (req, res) => {
    try {
        const { id, signoffId } = req.params;
        const { role, name, sign_date, signature } = req.body;

        console.log('Updating signoff:', { accreditation_id: id, signoff_id: signoffId, role, name, sign_date, signature });

        const updates = [];
        const params = [];

        if (role !== undefined) {
            updates.push('role = ?');
            params.push(role);
        }
        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (sign_date !== undefined) {
            updates.push('sign_date = ?');
            params.push(sign_date);
        }
        if (signature !== undefined) {
            updates.push('signature = ?');
            params.push(signature);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        params.push(id, signoffId);

        const updateResult = await pool.query(
            `UPDATE accreditation_signoffs SET ${updates.join(', ')} WHERE accreditation_id = ? AND id = ?`,
            params
        );

        console.log('Update result:', updateResult[0]);

        const [rows] = await pool.query('SELECT * FROM accreditation_signoffs WHERE id = ?', [signoffId]);
        res.json({ success: true, data: rows[0], message: 'Sign-off updated successfully' });
    } catch (error) {
        console.error('Error updating sign-off:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update sign-off', error: error.message });
    }
});

// ===============================================
// ROUTE 10: DELETE /api/accreditations/:id/risks/:riskId
// Delete risk/issue
// ===============================================
router.delete('/:id/risks/:riskId', async (req, res) => {
    try {
        const { id, riskId } = req.params;

        await pool.query(
            'DELETE FROM accreditation_risks WHERE accreditation_id = ? AND id = ?',
            [id, riskId]
        );

        res.json({ success: true, message: 'Risk deleted successfully' });
    } catch (error) {
        console.error('Error deleting risk:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete risk', error: error.message });
    }
});

// ===============================================
// ROUTE 11A: DELETE /api/accreditations/:id/signoffs/all
// Delete all sign-offs for an accreditation
// ===============================================
router.delete('/:id/signoffs/all', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting all signoffs for accreditation:', id);

        const result = await pool.query(
            'DELETE FROM accreditation_signoffs WHERE accreditation_id = ?',
            [id]
        );

        console.log('Delete result:', result[0]);
        res.json({ success: true, message: 'All sign-offs deleted successfully' });
    } catch (error) {
        console.error('Error deleting all sign-offs:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete all sign-offs', error: error.message });
    }
});

// ===============================================
// ROUTE 11: DELETE /api/accreditations/:id/signoffs/:signoffId
// Delete sign-off
// ===============================================
router.delete('/:id/signoffs/:signoffId', async (req, res) => {
    try {
        const { id, signoffId } = req.params;

        await pool.query(
            'DELETE FROM accreditation_signoffs WHERE accreditation_id = ? AND id = ?',
            [id, signoffId]
        );

        res.json({ success: true, message: 'Sign-off deleted successfully' });
    } catch (error) {
        console.error('Error deleting sign-off:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete sign-off', error: error.message });
    }
});

module.exports = router;
