const express = require('express');
const router = express.Router();
const pool = require('../db');

// =============================================
// Module 31: Vendor / Supplier Management
// =============================================

async function initTable() {
    const conn = await pool.getConnection();
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS vendors (
                id INT PRIMARY KEY AUTO_INCREMENT,
                company_name VARCHAR(255) NOT NULL,
                trading_name VARCHAR(255),
                registration_number VARCHAR(100),
                vat_number VARCHAR(100),
                vendor_type ENUM('Supplier','Vendor','Subcontractor') DEFAULT 'Supplier',
                nature_of_business TEXT,
                website VARCHAR(255),
                primary_contact VARCHAR(255),
                contact_position VARCHAR(255),
                contact_email VARCHAR(255),
                contact_phone VARCHAR(50),
                business_address TEXT,
                postal_address TEXT,
                doc_insurance VARCHAR(500),
                doc_health_safety VARCHAR(500),
                doc_data_protection VARCHAR(500),
                doc_risk_assessment VARCHAR(500),
                certifications TEXT,
                bank_name VARCHAR(255),
                account_number VARCHAR(100),
                sort_code VARCHAR(50),
                payment_terms VARCHAR(100),
                previous_clients TEXT,
                case_studies TEXT,
                references_text TEXT,
                signatory_name VARCHAR(255),
                signatory_position VARCHAR(255),
                agreement_date DATE,
                digital_signature VARCHAR(255),
                consent TINYINT(1) DEFAULT 0,
                scope_of_work TEXT,
                rates TEXT,
                module_reference VARCHAR(255),
                status ENUM('pending','active','inactive','suspended') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_vendor_type (vendor_type),
                INDEX idx_company (company_name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    } finally {
        conn.release();
    }
}
initTable().catch(console.error);

// GET /api/vendors
router.get('/', async (req, res) => {
    try {
        const { status, vendor_type, search } = req.query;
        let where = ['1=1'];
        const params = [];
        if (status && status !== 'all') { where.push('status = ?'); params.push(status); }
        if (vendor_type && vendor_type !== 'all') { where.push('vendor_type = ?'); params.push(vendor_type); }
        if (search) {
            where.push('(company_name LIKE ? OR trading_name LIKE ? OR contact_email LIKE ? OR nature_of_business LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                `SELECT id, company_name, trading_name, registration_number, vendor_type, nature_of_business,
                        primary_contact, contact_email, contact_phone, website, status,
                        agreement_date, created_at, updated_at
                 FROM vendors WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,
                params
            );
            res.json({ success: true, data: rows });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/vendors/:id (full detail)
router.get('/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query('SELECT * FROM vendors WHERE id = ?', [req.params.id]);
            if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: rows[0] });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/vendors
router.post('/', async (req, res) => {
    try {
        const {
            company_name, trading_name, registration_number, vat_number, vendor_type,
            nature_of_business, website, primary_contact, contact_position, contact_email,
            contact_phone, business_address, postal_address,
            doc_insurance, doc_health_safety, doc_data_protection, doc_risk_assessment,
            certifications, bank_name, account_number, sort_code, payment_terms,
            previous_clients, case_studies, references_text,
            signatory_name, signatory_position, agreement_date, digital_signature, consent,
            scope_of_work, rates, module_reference, status
        } = req.body;

        const conn = await pool.getConnection();
        try {
            const [result] = await conn.query(
                `INSERT INTO vendors (
                    company_name, trading_name, registration_number, vat_number, vendor_type,
                    nature_of_business, website, primary_contact, contact_position, contact_email,
                    contact_phone, business_address, postal_address,
                    doc_insurance, doc_health_safety, doc_data_protection, doc_risk_assessment,
                    certifications, bank_name, account_number, sort_code, payment_terms,
                    previous_clients, case_studies, references_text,
                    signatory_name, signatory_position, agreement_date, digital_signature, consent,
                    scope_of_work, rates, module_reference, status
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    company_name, trading_name, registration_number, vat_number, vendor_type,
                    nature_of_business, website, primary_contact, contact_position, contact_email,
                    contact_phone, business_address, postal_address,
                    doc_insurance, doc_health_safety, doc_data_protection, doc_risk_assessment,
                    certifications, bank_name, account_number, sort_code, payment_terms,
                    previous_clients, case_studies, references_text,
                    signatory_name, signatory_position, agreement_date || null, digital_signature, consent ? 1 : 0,
                    scope_of_work, rates, module_reference, status || 'pending'
                ]
            );
            res.json({ success: true, id: result.insertId });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/vendors/:id
router.put('/:id', async (req, res) => {
    try {
        const {
            company_name, trading_name, registration_number, vat_number, vendor_type,
            nature_of_business, website, primary_contact, contact_position, contact_email,
            contact_phone, business_address, postal_address,
            doc_insurance, doc_health_safety, doc_data_protection, doc_risk_assessment,
            certifications, bank_name, account_number, sort_code, payment_terms,
            previous_clients, case_studies, references_text,
            signatory_name, signatory_position, agreement_date, digital_signature, consent,
            scope_of_work, rates, module_reference, status
        } = req.body;

        const conn = await pool.getConnection();
        try {
            await conn.query(
                `UPDATE vendors SET
                    company_name=?, trading_name=?, registration_number=?, vat_number=?, vendor_type=?,
                    nature_of_business=?, website=?, primary_contact=?, contact_position=?, contact_email=?,
                    contact_phone=?, business_address=?, postal_address=?,
                    doc_insurance=?, doc_health_safety=?, doc_data_protection=?, doc_risk_assessment=?,
                    certifications=?, bank_name=?, account_number=?, sort_code=?, payment_terms=?,
                    previous_clients=?, case_studies=?, references_text=?,
                    signatory_name=?, signatory_position=?, agreement_date=?, digital_signature=?, consent=?,
                    scope_of_work=?, rates=?, module_reference=?, status=?
                 WHERE id=?`,
                [
                    company_name, trading_name, registration_number, vat_number, vendor_type,
                    nature_of_business, website, primary_contact, contact_position, contact_email,
                    contact_phone, business_address, postal_address,
                    doc_insurance, doc_health_safety, doc_data_protection, doc_risk_assessment,
                    certifications, bank_name, account_number, sort_code, payment_terms,
                    previous_clients, case_studies, references_text,
                    signatory_name, signatory_position, agreement_date || null, digital_signature, consent ? 1 : 0,
                    scope_of_work, rates, module_reference, status || 'pending',
                    req.params.id
                ]
            );
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/vendors/:id
router.delete('/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            await conn.query('DELETE FROM vendors WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
