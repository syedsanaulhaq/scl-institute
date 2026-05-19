const express = require('express');
const router = express.Router();
const pool = require('../db');

// =============================================
// Module 30: New Programme Proposals + Programme Validation
// =============================================

async function initTables() {
    const conn = await pool.getConnection();
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS new_programmes (
                id INT PRIMARY KEY AUTO_INCREMENT,
                programme_title VARCHAR(255) NOT NULL,
                programme_code VARCHAR(100),
                programme_type ENUM('HND','Degree','Vocational','Short Course','CPD','Professional','Other') DEFAULT 'HND',
                awarding_body VARCHAR(255),
                regulation_level VARCHAR(50),
                mode_of_delivery ENUM('Full-Time','Part-Time','Online','Blended','Distance Learning') DEFAULT 'Full-Time',
                start_date DATE,
                end_date DATE,
                subject_area VARCHAR(255),
                rationale TEXT,
                objectives TEXT,
                target_audience TEXT,
                entry_requirements TEXT,
                learning_outcomes TEXT,
                programme_structure TEXT,
                assessment_methods TEXT,
                resource_requirements TEXT,
                staffing_requirements TEXT,
                tuition_fee DECIMAL(10,2),
                additional_costs TEXT,
                funding_options TEXT,
                work_placement TINYINT(1) DEFAULT 0,
                compliance_checks TEXT,
                internal_approval_authority VARCHAR(255),
                approval_date DATE,
                notes TEXT,
                status ENUM('draft','submitted','under_review','approved','rejected') DEFAULT 'draft',
                created_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_programme_type (programme_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS programme_validations (
                id INT PRIMARY KEY AUTO_INCREMENT,
                programme_id INT NULL,
                programme_title VARCHAR(255) NOT NULL,
                qualification_level VARCHAR(50),
                mode_of_delivery VARCHAR(100),
                start_date DATE,
                programme_lead VARCHAR(255),
                doc_programme_spec VARCHAR(500),
                doc_module_descriptors VARCHAR(500),
                doc_learning_outcomes_map VARCHAR(500),
                doc_assessment_strategy VARCHAR(500),
                doc_staff_cvs VARCHAR(500),
                doc_resource_plan VARCHAR(500),
                doc_market_research VARCHAR(500),
                doc_risk_assessment VARCHAR(500),
                doc_external_examiner VARCHAR(500),
                faculty_review_status ENUM('pending','approved','rejected','conditions') DEFAULT 'pending',
                faculty_review_notes TEXT,
                faculty_review_date DATE,
                qa_review_status ENUM('pending','approved','rejected','conditions') DEFAULT 'pending',
                qa_review_notes TEXT,
                qa_review_date DATE,
                panel_decision ENUM('Approved','Approved with Conditions','Rejected','Request Further Info') NULL,
                conditions TEXT,
                panel_chair VARCHAR(255),
                decision_date DATE,
                status ENUM('draft','submitted','faculty_review','qa_review','panel_review','approved','rejected') DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (programme_id) REFERENCES new_programmes(id) ON DELETE SET NULL,
                INDEX idx_status (status),
                INDEX idx_programme_id (programme_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    } finally {
        conn.release();
    }
}
initTables().catch(console.error);

// ========================
// New Programmes Routes
// ========================

// GET /api/new-programmes
router.get('/', async (req, res) => {
    try {
        const { status, programme_type, search } = req.query;
        let where = ['1=1'];
        const params = [];
        if (status && status !== 'all') { where.push('status = ?'); params.push(status); }
        if (programme_type && programme_type !== 'all') { where.push('programme_type = ?'); params.push(programme_type); }
        if (search) {
            where.push('(programme_title LIKE ? OR programme_code LIKE ? OR awarding_body LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                `SELECT id, programme_title, programme_code, programme_type, awarding_body,
                        regulation_level, mode_of_delivery, start_date, status, created_at, updated_at
                 FROM new_programmes WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,
                params
            );
            res.json({ success: true, data: rows });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/new-programmes/:id
router.get('/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query('SELECT * FROM new_programmes WHERE id = ?', [req.params.id]);
            if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: rows[0] });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/new-programmes
router.post('/', async (req, res) => {
    try {
        const {
            programme_title, programme_code, programme_type, awarding_body, regulation_level,
            mode_of_delivery, start_date, end_date, subject_area, rationale, objectives,
            target_audience, entry_requirements, learning_outcomes, programme_structure,
            assessment_methods, resource_requirements, staffing_requirements,
            tuition_fee, additional_costs, funding_options, work_placement,
            compliance_checks, internal_approval_authority, approval_date, notes, status, created_by
        } = req.body;
        const conn = await pool.getConnection();
        try {
            const [result] = await conn.query(
                `INSERT INTO new_programmes (
                    programme_title, programme_code, programme_type, awarding_body, regulation_level,
                    mode_of_delivery, start_date, end_date, subject_area, rationale, objectives,
                    target_audience, entry_requirements, learning_outcomes, programme_structure,
                    assessment_methods, resource_requirements, staffing_requirements,
                    tuition_fee, additional_costs, funding_options, work_placement,
                    compliance_checks, internal_approval_authority, approval_date, notes, status, created_by
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    programme_title, programme_code, programme_type, awarding_body, regulation_level,
                    mode_of_delivery, start_date || null, end_date || null, subject_area, rationale, objectives,
                    target_audience, entry_requirements, learning_outcomes, programme_structure,
                    assessment_methods, resource_requirements, staffing_requirements,
                    tuition_fee || null, additional_costs, funding_options, work_placement ? 1 : 0,
                    compliance_checks, internal_approval_authority, approval_date || null, notes,
                    status || 'draft', created_by
                ]
            );
            res.json({ success: true, id: result.insertId });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/new-programmes/:id
router.put('/:id', async (req, res) => {
    try {
        const {
            programme_title, programme_code, programme_type, awarding_body, regulation_level,
            mode_of_delivery, start_date, end_date, subject_area, rationale, objectives,
            target_audience, entry_requirements, learning_outcomes, programme_structure,
            assessment_methods, resource_requirements, staffing_requirements,
            tuition_fee, additional_costs, funding_options, work_placement,
            compliance_checks, internal_approval_authority, approval_date, notes, status
        } = req.body;
        const conn = await pool.getConnection();
        try {
            await conn.query(
                `UPDATE new_programmes SET
                    programme_title=?, programme_code=?, programme_type=?, awarding_body=?, regulation_level=?,
                    mode_of_delivery=?, start_date=?, end_date=?, subject_area=?, rationale=?, objectives=?,
                    target_audience=?, entry_requirements=?, learning_outcomes=?, programme_structure=?,
                    assessment_methods=?, resource_requirements=?, staffing_requirements=?,
                    tuition_fee=?, additional_costs=?, funding_options=?, work_placement=?,
                    compliance_checks=?, internal_approval_authority=?, approval_date=?, notes=?, status=?
                 WHERE id=?`,
                [
                    programme_title, programme_code, programme_type, awarding_body, regulation_level,
                    mode_of_delivery, start_date || null, end_date || null, subject_area, rationale, objectives,
                    target_audience, entry_requirements, learning_outcomes, programme_structure,
                    assessment_methods, resource_requirements, staffing_requirements,
                    tuition_fee || null, additional_costs, funding_options, work_placement ? 1 : 0,
                    compliance_checks, internal_approval_authority, approval_date || null, notes,
                    status || 'draft', req.params.id
                ]
            );
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/new-programmes/:id
router.delete('/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            await conn.query('DELETE FROM new_programmes WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ========================
// Programme Validation Routes
// ========================

// GET /api/new-programmes/validations/all
router.get('/validations/all', async (req, res) => {
    try {
        const { status, search } = req.query;
        let where = ['1=1'];
        const params = [];
        if (status && status !== 'all') { where.push('pv.status = ?'); params.push(status); }
        if (search) {
            where.push('(pv.programme_title LIKE ? OR pv.programme_lead LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                `SELECT pv.*, np.programme_type
                 FROM programme_validations pv
                 LEFT JOIN new_programmes np ON pv.programme_id = np.id
                 WHERE ${where.join(' AND ')} ORDER BY pv.created_at DESC`,
                params
            );
            res.json({ success: true, data: rows });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/new-programmes/validations/:id
router.get('/validations/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query('SELECT * FROM programme_validations WHERE id = ?', [req.params.id]);
            if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: rows[0] });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/new-programmes/validations
router.post('/validations', async (req, res) => {
    try {
        const {
            programme_id, programme_title, qualification_level, mode_of_delivery,
            start_date, programme_lead,
            doc_programme_spec, doc_module_descriptors, doc_learning_outcomes_map,
            doc_assessment_strategy, doc_staff_cvs, doc_resource_plan,
            doc_market_research, doc_risk_assessment, doc_external_examiner,
            faculty_review_status, faculty_review_notes, faculty_review_date,
            qa_review_status, qa_review_notes, qa_review_date,
            panel_decision, conditions, panel_chair, decision_date, status
        } = req.body;
        const conn = await pool.getConnection();
        try {
            const [result] = await conn.query(
                `INSERT INTO programme_validations (
                    programme_id, programme_title, qualification_level, mode_of_delivery,
                    start_date, programme_lead,
                    doc_programme_spec, doc_module_descriptors, doc_learning_outcomes_map,
                    doc_assessment_strategy, doc_staff_cvs, doc_resource_plan,
                    doc_market_research, doc_risk_assessment, doc_external_examiner,
                    faculty_review_status, faculty_review_notes, faculty_review_date,
                    qa_review_status, qa_review_notes, qa_review_date,
                    panel_decision, conditions, panel_chair, decision_date, status
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    programme_id || null, programme_title, qualification_level, mode_of_delivery,
                    start_date || null, programme_lead,
                    doc_programme_spec, doc_module_descriptors, doc_learning_outcomes_map,
                    doc_assessment_strategy, doc_staff_cvs, doc_resource_plan,
                    doc_market_research, doc_risk_assessment, doc_external_examiner,
                    faculty_review_status || 'pending', faculty_review_notes, faculty_review_date || null,
                    qa_review_status || 'pending', qa_review_notes, qa_review_date || null,
                    panel_decision || null, conditions, panel_chair, decision_date || null,
                    status || 'draft'
                ]
            );
            res.json({ success: true, id: result.insertId });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/new-programmes/validations/:id
router.put('/validations/:id', async (req, res) => {
    try {
        const {
            programme_id, programme_title, qualification_level, mode_of_delivery,
            start_date, programme_lead,
            doc_programme_spec, doc_module_descriptors, doc_learning_outcomes_map,
            doc_assessment_strategy, doc_staff_cvs, doc_resource_plan,
            doc_market_research, doc_risk_assessment, doc_external_examiner,
            faculty_review_status, faculty_review_notes, faculty_review_date,
            qa_review_status, qa_review_notes, qa_review_date,
            panel_decision, conditions, panel_chair, decision_date, status
        } = req.body;
        const conn = await pool.getConnection();
        try {
            await conn.query(
                `UPDATE programme_validations SET
                    programme_id=?, programme_title=?, qualification_level=?, mode_of_delivery=?,
                    start_date=?, programme_lead=?,
                    doc_programme_spec=?, doc_module_descriptors=?, doc_learning_outcomes_map=?,
                    doc_assessment_strategy=?, doc_staff_cvs=?, doc_resource_plan=?,
                    doc_market_research=?, doc_risk_assessment=?, doc_external_examiner=?,
                    faculty_review_status=?, faculty_review_notes=?, faculty_review_date=?,
                    qa_review_status=?, qa_review_notes=?, qa_review_date=?,
                    panel_decision=?, conditions=?, panel_chair=?, decision_date=?, status=?
                 WHERE id=?`,
                [
                    programme_id || null, programme_title, qualification_level, mode_of_delivery,
                    start_date || null, programme_lead,
                    doc_programme_spec, doc_module_descriptors, doc_learning_outcomes_map,
                    doc_assessment_strategy, doc_staff_cvs, doc_resource_plan,
                    doc_market_research, doc_risk_assessment, doc_external_examiner,
                    faculty_review_status || 'pending', faculty_review_notes, faculty_review_date || null,
                    qa_review_status || 'pending', qa_review_notes, qa_review_date || null,
                    panel_decision || null, conditions, panel_chair, decision_date || null,
                    status || 'draft', req.params.id
                ]
            );
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/new-programmes/validations/:id
router.delete('/validations/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            await conn.query('DELETE FROM programme_validations WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
