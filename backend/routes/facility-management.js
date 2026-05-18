const express = require('express');
const router = express.Router();
const pool = require('../db');

// =============================================
// Module 32: Building & Facility Management
// =============================================

async function initTables() {
    const conn = await pool.getConnection();
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS buildings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                building_name VARCHAR(255) NOT NULL,
                location TEXT,
                ownership_type ENUM('Owned','Leased','Rented','Other') DEFAULT 'Owned',
                year_built INT,
                purpose VARCHAR(255),
                total_floors INT,
                total_area_sqm DECIMAL(10,2),
                fire_safety_cert_file VARCHAR(500),
                fire_safety_cert_expiry DATE,
                accessibility_compliance TINYINT(1) DEFAULT 0,
                accessibility_notes TEXT,
                status ENUM('active','inactive','under_maintenance') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        await conn.query(`
            CREATE TABLE IF NOT EXISTS building_rooms (
                id INT PRIMARY KEY AUTO_INCREMENT,
                building_id INT NOT NULL,
                room_name VARCHAR(255) NOT NULL,
                room_type ENUM('Classroom','Lab','Office','Meeting Room','IT Lab','Library','Auditorium','Other') DEFAULT 'Classroom',
                capacity INT,
                floor_number INT,
                equipment TEXT,
                it_av_setup TEXT,
                accessibility_features TEXT,
                usage_schedule TEXT,
                photo_file VARCHAR(500),
                status ENUM('active','inactive','under_maintenance') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
                INDEX idx_building (building_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        await conn.query(`
            CREATE TABLE IF NOT EXISTS facility_compliance (
                id INT PRIMARY KEY AUTO_INCREMENT,
                building_id INT NOT NULL,
                compliance_type ENUM(
                    'Health & Safety at Work','Fire Safety','Emergency Evacuation',
                    'First Aid Equipment','Trained Personnel','Building Maintenance',
                    'Facilities Inspection','Disability Access','Reasonable Adjustments'
                ) NOT NULL,
                status ENUM('compliant','non_compliant','pending_review','not_applicable') DEFAULT 'pending_review',
                last_inspection_date DATE,
                next_inspection_date DATE,
                inspector_name VARCHAR(255),
                findings TEXT,
                corrective_actions TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
                INDEX idx_building (building_id),
                INDEX idx_compliance_type (compliance_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    } finally {
        conn.release();
    }
}
initTables().catch(console.error);

// ---- Buildings ----

// GET /api/facility-management/buildings
router.get('/buildings', async (req, res) => {
    try {
        const { status, search } = req.query;
        let where = ['1=1'];
        const params = [];
        if (status && status !== 'all') { where.push('b.status = ?'); params.push(status); }
        if (search) {
            where.push('(b.building_name LIKE ? OR b.location LIKE ? OR b.purpose LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const conn = await pool.getConnection();
        try {
            const [rows] = await conn.query(
                `SELECT b.*, 
                    (SELECT COUNT(*) FROM building_rooms r WHERE r.building_id = b.id AND r.status = 'active') AS room_count
                 FROM buildings b WHERE ${where.join(' AND ')} ORDER BY b.created_at DESC`,
                params
            );
            res.json({ success: true, data: rows });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/facility-management/buildings/:id
router.get('/buildings/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            const [buildings] = await conn.query('SELECT * FROM buildings WHERE id = ?', [req.params.id]);
            if (!buildings.length) return res.status(404).json({ success: false, message: 'Not found' });
            const [rooms] = await conn.query('SELECT * FROM building_rooms WHERE building_id = ? ORDER BY floor_number, room_name', [req.params.id]);
            const [compliance] = await conn.query('SELECT * FROM facility_compliance WHERE building_id = ? ORDER BY compliance_type', [req.params.id]);
            res.json({ success: true, data: { ...buildings[0], rooms, compliance } });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/facility-management/buildings
router.post('/buildings', async (req, res) => {
    try {
        const {
            building_name, location, ownership_type, year_built, purpose,
            total_floors, total_area_sqm, fire_safety_cert_file, fire_safety_cert_expiry,
            accessibility_compliance, accessibility_notes, status
        } = req.body;
        const conn = await pool.getConnection();
        try {
            const [result] = await conn.query(
                `INSERT INTO buildings (building_name, location, ownership_type, year_built, purpose,
                    total_floors, total_area_sqm, fire_safety_cert_file, fire_safety_cert_expiry,
                    accessibility_compliance, accessibility_notes, status)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
                [building_name, location, ownership_type, year_built || null, purpose,
                 total_floors || null, total_area_sqm || null, fire_safety_cert_file, fire_safety_cert_expiry || null,
                 accessibility_compliance ? 1 : 0, accessibility_notes, status || 'active']
            );

            // Create default compliance records
            const COMPLIANCE_TYPES = [
                'Health & Safety at Work','Fire Safety','Emergency Evacuation',
                'First Aid Equipment','Trained Personnel','Building Maintenance',
                'Facilities Inspection','Disability Access','Reasonable Adjustments'
            ];
            const buildingId = result.insertId;
            for (const ct of COMPLIANCE_TYPES) {
                await conn.query(
                    'INSERT INTO facility_compliance (building_id, compliance_type) VALUES (?,?)',
                    [buildingId, ct]
                );
            }
            res.json({ success: true, id: buildingId });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/facility-management/buildings/:id
router.put('/buildings/:id', async (req, res) => {
    try {
        const {
            building_name, location, ownership_type, year_built, purpose,
            total_floors, total_area_sqm, fire_safety_cert_file, fire_safety_cert_expiry,
            accessibility_compliance, accessibility_notes, status
        } = req.body;
        const conn = await pool.getConnection();
        try {
            await conn.query(
                `UPDATE buildings SET
                    building_name=?, location=?, ownership_type=?, year_built=?, purpose=?,
                    total_floors=?, total_area_sqm=?, fire_safety_cert_file=?, fire_safety_cert_expiry=?,
                    accessibility_compliance=?, accessibility_notes=?, status=?
                 WHERE id=?`,
                [building_name, location, ownership_type, year_built || null, purpose,
                 total_floors || null, total_area_sqm || null, fire_safety_cert_file, fire_safety_cert_expiry || null,
                 accessibility_compliance ? 1 : 0, accessibility_notes, status || 'active',
                 req.params.id]
            );
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/facility-management/buildings/:id
router.delete('/buildings/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            await conn.query('DELETE FROM buildings WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---- Rooms ----

// POST /api/facility-management/buildings/:buildingId/rooms
router.post('/buildings/:buildingId/rooms', async (req, res) => {
    try {
        const {
            room_name, room_type, capacity, floor_number, equipment,
            it_av_setup, accessibility_features, usage_schedule, photo_file, status
        } = req.body;
        const conn = await pool.getConnection();
        try {
            const [result] = await conn.query(
                `INSERT INTO building_rooms (building_id, room_name, room_type, capacity, floor_number,
                    equipment, it_av_setup, accessibility_features, usage_schedule, photo_file, status)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
                [req.params.buildingId, room_name, room_type, capacity || null, floor_number || null,
                 equipment, it_av_setup, accessibility_features, usage_schedule, photo_file, status || 'active']
            );
            res.json({ success: true, id: result.insertId });
        } finally { conn.release(); }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/facility-management/rooms/:id
router.put('/rooms/:id', async (req, res) => {
    try {
        const {
            room_name, room_type, capacity, floor_number, equipment,
            it_av_setup, accessibility_features, usage_schedule, photo_file, status
        } = req.body;
        const conn = await pool.getConnection();
        try {
            await conn.query(
                `UPDATE building_rooms SET
                    room_name=?, room_type=?, capacity=?, floor_number=?,
                    equipment=?, it_av_setup=?, accessibility_features=?,
                    usage_schedule=?, photo_file=?, status=?
                 WHERE id=?`,
                [room_name, room_type, capacity || null, floor_number || null,
                 equipment, it_av_setup, accessibility_features, usage_schedule, photo_file, status || 'active',
                 req.params.id]
            );
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/facility-management/rooms/:id
router.delete('/rooms/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            await conn.query('DELETE FROM building_rooms WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---- Compliance ----

// PUT /api/facility-management/compliance/:id
router.put('/compliance/:id', async (req, res) => {
    try {
        const {
            status, last_inspection_date, next_inspection_date,
            inspector_name, findings, corrective_actions, notes
        } = req.body;
        const conn = await pool.getConnection();
        try {
            await conn.query(
                `UPDATE facility_compliance SET
                    status=?, last_inspection_date=?, next_inspection_date=?,
                    inspector_name=?, findings=?, corrective_actions=?, notes=?
                 WHERE id=?`,
                [status, last_inspection_date || null, next_inspection_date || null,
                 inspector_name, findings, corrective_actions, notes,
                 req.params.id]
            );
            res.json({ success: true });
        } finally { conn.release(); }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
