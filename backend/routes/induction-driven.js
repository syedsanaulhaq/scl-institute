/**
 * induction-driven.js
 * Endpoints that READ from the Course Induction master record and
 * feed the data into other modules:
 *   - /induction-context/:course_code  →  all sections for a course
 *   - /student-fees                    →  CRUD for student fee records
 *   - /compliance-calendar             →  upcoming deadlines from Section 8
 */

const express = require('express');
const pool = require('../db');

const router = express.Router();

// ─── ensure student_fees table exists ────────────────────────────────────────
async function ensureStudentFeesTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS student_fees (
            id                  INT AUTO_INCREMENT PRIMARY KEY,
            application_id      INT NOT NULL,
            course_code         VARCHAR(100) NOT NULL,
            course_title        VARCHAR(255),
            student_name        VARCHAR(255),
            student_email       VARCHAR(255),
            total_fee_gbp       DECIMAL(10,2) DEFAULT 0,
            instalment_1_amount DECIMAL(10,2) DEFAULT 0,
            instalment_1_due    DATE,
            instalment_1_paid   TINYINT(1) DEFAULT 0,
            instalment_1_paid_at DATETIME,
            instalment_2_amount DECIMAL(10,2) DEFAULT 0,
            instalment_2_due    DATE,
            instalment_2_paid   TINYINT(1) DEFAULT 0,
            instalment_2_paid_at DATETIME,
            instalment_3_amount DECIMAL(10,2) DEFAULT 0,
            instalment_3_due    DATE,
            instalment_3_paid   TINYINT(1) DEFAULT 0,
            instalment_3_paid_at DATETIME,
            additional_costs    TEXT,
            funding_option      VARCHAR(150),
            partner_reg_fee     DECIMAL(10,2) DEFAULT 0,
            exam_fee            DECIMAL(10,2) DEFAULT 0,
            total_paid          DECIMAL(10,2) DEFAULT 0,
            balance_due         DECIMAL(10,2) GENERATED ALWAYS AS (total_fee_gbp - total_paid) STORED,
            fee_status          ENUM('unpaid','partial','paid','waived','overdue') DEFAULT 'unpaid',
            source              ENUM('induction','manual') DEFAULT 'induction',
            notes               TEXT,
            induction_id        INT,
            created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY idx_app (application_id),
            KEY idx_course (course_code),
            KEY idx_email (student_email),
            KEY idx_status (fee_status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
}

ensureStudentFeesTable().catch(e => console.error('[student_fees] table init error:', e.message));

// ─── helper: parse fee text from induction requirement description ────────────
function parseFeeFromDescription(description) {
    if (!description) return null;
    // Match patterns like £6,500 or £6500 or 6500 GBP
    const match = String(description).match(/[£$]?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:GBP|gbp|per year|\/year)?/);
    if (!match) return null;
    const raw = match[1].replace(/,/g, '');
    const val = parseFloat(raw);
    return isNaN(val) ? null : val;
}

// ─── helper: get induction sections for a course code ────────────────────────
async function getInductionForCourse(courseCode) {
    if (!courseCode) return null;
    const code = String(courseCode).trim();

    // 1. Exact match
    let [rows] = await pool.execute(
        `SELECT ci.* FROM course_inductions ci WHERE ci.course_code = ? ORDER BY ci.id DESC LIMIT 1`,
        [code]
    );

    // 2. Try matching via the courses table (course_code → course_title → induction title)
    if (!rows.length) {
        const [courseRows] = await pool.execute(
            `SELECT course_title FROM courses WHERE course_code = ? AND course_status = 'active' LIMIT 1`,
            [code]
        );
        if (courseRows.length) {
            [rows] = await pool.execute(
                `SELECT ci.* FROM course_inductions ci
                 WHERE ci.course_title = ? OR ci.course_code = ?
                 ORDER BY ci.id DESC LIMIT 1`,
                [courseRows[0].course_title, code]
            );
        }
    }

    // 3. Prefix match — but ONLY for programme-level codes (no module suffix -Yn-Sn-Cn)
    if (!rows.length) {
        const baseParts = code.split('-').slice(0, 2).join('-');
        [rows] = await pool.execute(
            `SELECT ci.* FROM course_inductions ci
             WHERE ci.course_code LIKE ?
               AND ci.course_code NOT REGEXP '-Y[0-9]+-S[0-9]+'
             ORDER BY ci.id DESC LIMIT 1`,
            [`${baseParts}%`]
        );
    }

    if (!rows.length) return null;

    const induction = rows[0];

    // Fetch requirements in a separate query to avoid GROUP_CONCAT 1024-byte truncation
    const [reqRows] = await pool.execute(
        `SELECT section_number, requirement_area, description, review_notes, compliance_status, responsible_person
         FROM induction_requirements WHERE induction_id = ? ORDER BY section_number, id`,
        [induction.id]
    );

    const sections = {};
    for (let i = 1; i <= 11; i++) sections[i] = [];
    for (const r of reqRows) {
        const s = parseInt(r.section_number, 10);
        if (s >= 1 && s <= 11) {
            sections[s].push({
                area: r.requirement_area,
                description: r.description,
                review_notes: r.review_notes,
                compliance_status: r.compliance_status,
                responsible_person: r.responsible_person
            });
        }
    }

    return { ...induction, sections };
}

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/induction-driven/induction-context/:course_code
// Returns all induction sections for the given course code.
// Used by: application review, teacher assignment, any module needing rules.
// ══════════════════════════════════════════════════════════════════════════════
router.get('/induction-context/:course_code', async (req, res) => {
    try {
        const induction = await getInductionForCourse(req.params.course_code);
        if (!induction) {
            return res.json({ success: true, data: null, message: 'No completed induction found for this course' });
        }
        return res.json({ success: true, data: induction });
    } catch (err) {
        console.error('[induction-context] ERROR:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/induction-driven/compliance-calendar
// Returns all upcoming revalidation / review deadlines from Section 8 + induction review dates.
// ══════════════════════════════════════════════════════════════════════════════
router.get('/compliance-calendar', async (req, res) => {
    try {
        // Get inductions with review_date set
        const [inductionDeadlines] = await pool.execute(`
            SELECT 
                ci.id, ci.course_code, ci.course_title, ci.awarding_body,
                ci.review_date, ci.overall_status,
                'Induction Review Due' AS deadline_type,
                ci.document_owner AS responsible_person
            FROM course_inductions ci
            WHERE ci.review_date IS NOT NULL
            ORDER BY ci.review_date ASC
        `);

        // Get Section 8 requirements that have review notes with dates
        const [section8Reqs] = await pool.execute(`
            SELECT 
                ci.id AS induction_id, ci.course_code, ci.course_title,
                ir.requirement_area AS deadline_type,
                ir.description, ir.review_notes, ir.responsible_person,
                ir.compliance_status
            FROM induction_requirements ir
            JOIN course_inductions ci ON ci.id = ir.induction_id
            WHERE ir.section_number = 8
            ORDER BY ci.course_code, ir.id
        `);

        // Get Section 7 reporting obligations
        const [section7Reqs] = await pool.execute(`
            SELECT 
                ci.id AS induction_id, ci.course_code, ci.course_title,
                ir.requirement_area AS deadline_type,
                ir.description, ir.review_notes, ir.responsible_person,
                ir.compliance_status
            FROM induction_requirements ir
            JOIN course_inductions ci ON ci.id = ir.induction_id
            WHERE ir.section_number = 7
            ORDER BY ci.course_code, ir.id
        `);

        // Get course registrations with review dates
        const [courseReviewDates] = await pool.execute(`
            SELECT 
                id, course_code, course_title, awarding_body_accreditation AS awarding_body,
                review_date, course_leader_programme_director AS responsible_person,
                'Course Registration Review' AS deadline_type
            FROM course_registrations
            WHERE review_date IS NOT NULL AND is_master = 1
            ORDER BY review_date ASC
        `);

        return res.json({
            success: true,
            data: {
                induction_reviews: inductionDeadlines,
                section8_compliance: section8Reqs,
                section7_reporting: section7Reqs,
                course_registration_reviews: courseReviewDates
            }
        });
    } catch (err) {
        console.error('[compliance-calendar] ERROR:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/induction-driven/student-fees/create-from-induction
// Called when application is accepted — reads induction Section 5 and creates fee record.
// ══════════════════════════════════════════════════════════════════════════════
router.post('/student-fees/create-from-induction', async (req, res) => {
    try {
        const { application_id, course_code, student_name, student_email, intake_start_date } = req.body;
        if (!application_id || !course_code) {
            return res.status(400).json({ success: false, message: 'application_id and course_code are required' });
        }

        // Check if fee record already exists
        const [existing] = await pool.execute(
            'SELECT id FROM student_fees WHERE application_id = ? LIMIT 1',
            [application_id]
        );
        if (existing.length > 0) {
            return res.json({ success: true, data: existing[0], already_existed: true });
        }

        // Get induction data
        const induction = await getInductionForCourse(course_code);
        let totalFee = 0, partnerRegFee = 0, examFee = 0, additionalCosts = '', fundingOption = '', inductionId = null;

        if (induction) {
            inductionId = induction.id;
            const section5 = induction.sections[5] || [];
            for (const req of section5) {
                const area = String(req.area || '').toLowerCase();
                const desc = String(req.description || '');
                const notes = String(req.review_notes || '');
                const combined = `${desc} ${notes}`;
                if (area.includes('tuition') || area.includes('student tuition')) {
                    totalFee = parseFeeFromDescription(combined) || parseFeeFromDescription(desc) || 0;
                }
                if (area.includes('partner accreditation') || area.includes('accreditation fee')) {
                    partnerRegFee = parseFeeFromDescription(combined) || 0;
                }
                if (area.includes('exam') || area.includes('assessment fee')) {
                    examFee = parseFeeFromDescription(combined) || 0;
                }
            }
            // Also try course_registrations for tuition_fee_gbp
            if (totalFee === 0) {
                const [regRows] = await pool.execute(
                    `SELECT tuition_fee_gbp, additional_costs, funding_options FROM course_registrations 
                     WHERE course_code = ? AND is_master = 1 ORDER BY id DESC LIMIT 1`,
                    [course_code]
                );
                if (regRows.length > 0) {
                    totalFee = parseFloat(regRows[0].tuition_fee_gbp) || 0;
                    additionalCosts = regRows[0].additional_costs || '';
                    fundingOption = regRows[0].funding_options || '';
                }
            }
        }

        // Look up course duration to calculate semester schedule
        const [courseRows] = await pool.execute(
            'SELECT duration_months FROM courses WHERE course_code = ? LIMIT 1',
            [course_code]
        );
        const durationMonths  = courseRows.length > 0 ? (parseInt(courseRows[0].duration_months) || 24) : 24;
        const numSemesters    = Math.ceil(durationMonths / 6); // 2 semesters per year

        // totalFee IS the full course fee — divide equally across semesters
        const totalCourseFee  = totalFee;
        const perSem = numSemesters > 0 && totalCourseFee > 0
            ? parseFloat((totalCourseFee / numSemesters).toFixed(2))
            : 0;
        // Last semester absorbs any rounding remainder
        const lastSem = totalCourseFee > 0
            ? parseFloat((totalCourseFee - perSem * (numSemesters - 1)).toFixed(2))
            : 0;

        // Due dates: semester 1 at intake start, then +6mo each
        const startDate = intake_start_date ? new Date(intake_start_date) : new Date();
        const addMonths = (d, m) => { const r = new Date(d); r.setMonth(r.getMonth() + m); return r; };
        const fmt       = (d) => d.toISOString().split('T')[0];
        const s1Due = fmt(startDate);
        const s2Due = fmt(addMonths(startDate, 6));
        const s3Due = fmt(addMonths(startDate, 12));
        const s4Due = fmt(addMonths(startDate, 18));
        const s1 = numSemesters >= 1 ? perSem : 0;
        const s2 = numSemesters >= 2 ? perSem : 0;
        const s3 = numSemesters >= 3 ? perSem : 0;
        const s4 = numSemesters >= 4 ? lastSem : 0;

        const [result] = await pool.execute(`
            INSERT INTO student_fees 
                (application_id, course_code, course_title, student_name, student_email,
                 total_fee_gbp, instalment_1_amount, instalment_1_due,
                 instalment_2_amount, instalment_2_due,
                 instalment_3_amount, instalment_3_due,
                 instalment_4_amount, instalment_4_due,
                 additional_costs, funding_option, partner_reg_fee, exam_fee,
                 fee_status, source, induction_id)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `, [
            application_id, course_code,
            induction?.course_title || course_code,
            student_name || '', student_email || '',
            totalCourseFee, s1, s1Due, s2, s2Due, s3, s3Due, s4, s4Due,
            additionalCosts, fundingOption, partnerRegFee, examFee,
            totalCourseFee > 0 ? 'unpaid' : 'waived',
            'induction', inductionId
        ]);

        const [newFee] = await pool.execute('SELECT * FROM student_fees WHERE id = ?', [result.insertId]);
        return res.json({ success: true, data: newFee[0], created: true });
    } catch (err) {
        console.error('[create-from-induction] ERROR:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/induction-driven/student-fees
// List all student fees. Query params: course_code, status, email
// ══════════════════════════════════════════════════════════════════════════════
router.get('/student-fees', async (req, res) => {
    try {
        const { course_code, status, email, application_id } = req.query;
        let where = 'WHERE 1=1';
        const params = [];
        if (course_code) { where += ' AND sf.course_code = ?'; params.push(course_code); }
        if (status) { where += ' AND sf.fee_status = ?'; params.push(status); }
        if (email) { where += ' AND sf.student_email = ?'; params.push(email); }
        if (application_id) { where += ' AND sf.application_id = ?'; params.push(application_id); }

        const [rows] = await pool.execute(`
            SELECT sf.*, 
                   sa.first_name, sa.last_name, sa.application_reference,
                   sa.application_status, sa.intake_start_date, sa.programme_type_name
            FROM student_fees sf
            LEFT JOIN student_applications sa ON sa.id = sf.application_id
            ${where}
            ORDER BY sf.created_at DESC
        `, params);

        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error('[student-fees GET] ERROR:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/induction-driven/student-fees/:id
// ══════════════════════════════════════════════════════════════════════════════
router.get('/student-fees/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT sf.*, sa.first_name, sa.last_name, sa.application_reference,
                   sa.application_status, sa.intake_start_date, sa.programme_type_name
            FROM student_fees sf
            LEFT JOIN student_applications sa ON sa.id = sf.application_id
            WHERE sf.id = ? LIMIT 1
        `, [req.params.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Fee record not found' });
        return res.json({ success: true, data: rows[0] });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Helper: normalise any date value to YYYY-MM-DD string for MySQL DATE columns
function toMysqlDate(val) {
    if (!val) return null;
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    // Handle ISO string or datetime string
    const s = String(val);
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

// ══════════════════════════════════════════════════════════════════════════════
// PUT /api/induction-driven/student-fees/:id
// Update fee record — mark instalment paid, override amounts, add notes
// ══════════════════════════════════════════════════════════════════════════════
router.put('/student-fees/:id', async (req, res) => {
    try {
        const {
            instalment_1_paid, instalment_1_paid_at,
            instalment_2_paid, instalment_2_paid_at,
            instalment_3_paid, instalment_3_paid_at,
            instalment_4_paid, instalment_4_paid_at,
            total_fee_gbp,
            instalment_1_amount, instalment_1_due,
            instalment_2_amount, instalment_2_due,
            instalment_3_amount, instalment_3_due,
            instalment_4_amount, instalment_4_due,
            additional_costs, funding_option,
            partner_reg_fee, exam_fee,
            fee_status, notes
        } = req.body;

        // Calculate total_paid from paid instalments
        const [current] = await pool.execute('SELECT * FROM student_fees WHERE id = ? LIMIT 1', [req.params.id]);
        if (!current.length) return res.status(404).json({ success: false, message: 'Fee record not found' });
        const cur = current[0];

        const i1Paid = instalment_1_paid !== undefined ? Boolean(instalment_1_paid) : Boolean(cur.instalment_1_paid);
        const i2Paid = instalment_2_paid !== undefined ? Boolean(instalment_2_paid) : Boolean(cur.instalment_2_paid);
        const i3Paid = instalment_3_paid !== undefined ? Boolean(instalment_3_paid) : Boolean(cur.instalment_3_paid);
        const i4Paid = instalment_4_paid !== undefined ? Boolean(instalment_4_paid) : Boolean(cur.instalment_4_paid);

        const i1Amt = instalment_1_amount !== undefined ? parseFloat(instalment_1_amount) : parseFloat(cur.instalment_1_amount);
        const i2Amt = instalment_2_amount !== undefined ? parseFloat(instalment_2_amount) : parseFloat(cur.instalment_2_amount);
        const i3Amt = instalment_3_amount !== undefined ? parseFloat(instalment_3_amount) : parseFloat(cur.instalment_3_amount);
        const i4Amt = instalment_4_amount !== undefined ? parseFloat(instalment_4_amount) : parseFloat(cur.instalment_4_amount || 0);

        const calcTotalPaid = (i1Paid ? i1Amt : 0) + (i2Paid ? i2Amt : 0) + (i3Paid ? i3Amt : 0) + (i4Paid ? i4Amt : 0);
        const newTotalFee = total_fee_gbp !== undefined ? parseFloat(total_fee_gbp) : parseFloat(cur.total_fee_gbp);

        // Auto-derive fee_status
        let derivedStatus = fee_status || cur.fee_status;
        if (!fee_status) {
            if (newTotalFee === 0) derivedStatus = 'waived';
            else if (calcTotalPaid >= newTotalFee) derivedStatus = 'paid';
            else if (calcTotalPaid > 0) derivedStatus = 'partial';
            else derivedStatus = 'unpaid';
        }

        await pool.execute(`
            UPDATE student_fees SET
                total_fee_gbp       = ?,
                instalment_1_amount = ?, instalment_1_due = ?, instalment_1_paid = ?, instalment_1_paid_at = ?,
                instalment_2_amount = ?, instalment_2_due = ?, instalment_2_paid = ?, instalment_2_paid_at = ?,
                instalment_3_amount = ?, instalment_3_due = ?, instalment_3_paid = ?, instalment_3_paid_at = ?,
                instalment_4_amount = ?, instalment_4_due = ?, instalment_4_paid = ?, instalment_4_paid_at = ?,
                additional_costs = ?, funding_option = ?,
                partner_reg_fee = ?, exam_fee = ?,
                total_paid = ?, fee_status = ?, notes = ?
            WHERE id = ?
        `, [
            newTotalFee,
            i1Amt, toMysqlDate(instalment_1_due || cur.instalment_1_due), i1Paid ? 1 : 0, i1Paid ? (instalment_1_paid_at || cur.instalment_1_paid_at || new Date()) : null,
            i2Amt, toMysqlDate(instalment_2_due || cur.instalment_2_due), i2Paid ? 1 : 0, i2Paid ? (instalment_2_paid_at || cur.instalment_2_paid_at || new Date()) : null,
            i3Amt, toMysqlDate(instalment_3_due || cur.instalment_3_due), i3Paid ? 1 : 0, i3Paid ? (instalment_3_paid_at || cur.instalment_3_paid_at || new Date()) : null,
            i4Amt, toMysqlDate(instalment_4_due || cur.instalment_4_due), i4Paid ? 1 : 0, i4Paid ? (instalment_4_paid_at || cur.instalment_4_paid_at || new Date()) : null,
            additional_costs !== undefined ? additional_costs : cur.additional_costs,
            funding_option !== undefined ? funding_option : cur.funding_option,
            partner_reg_fee !== undefined ? parseFloat(partner_reg_fee) : parseFloat(cur.partner_reg_fee),
            exam_fee !== undefined ? parseFloat(exam_fee) : parseFloat(cur.exam_fee),
            calcTotalPaid,
            derivedStatus,
            notes !== undefined ? notes : cur.notes,
            req.params.id
        ]);

        const [updated] = await pool.execute('SELECT * FROM student_fees WHERE id = ?', [req.params.id]);
        return res.json({ success: true, data: updated[0] });
    } catch (err) {
        console.error('[student-fees PUT] ERROR:', err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/induction-driven/student-fees/summary/stats
// Aggregate stats for the fees dashboard
// ══════════════════════════════════════════════════════════════════════════════
router.get('/student-fees/summary/stats', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                COUNT(*) AS total_records,
                SUM(total_fee_gbp) AS total_expected,
                SUM(total_paid) AS total_collected,
                SUM(balance_due) AS total_outstanding,
                SUM(fee_status = 'paid') AS fully_paid,
                SUM(fee_status = 'partial') AS partial,
                SUM(fee_status = 'unpaid') AS unpaid,
                SUM(fee_status = 'overdue') AS overdue,
                SUM(fee_status = 'waived') AS waived
            FROM student_fees
        `);
        return res.json({ success: true, data: rows[0] });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
