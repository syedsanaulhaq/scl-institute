const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Get database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 33061,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize Notifications Table
async function initNotificationsTable() {
    try {
        const connection = await pool.getConnection();
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                email VARCHAR(255),
                type VARCHAR(50) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT,
                body TEXT,
                notification_data JSON,
                is_read BOOLEAN DEFAULT FALSE,
                read_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_email (email),
                INDEX idx_type (type),
                INDEX idx_created (created_at),
                INDEX idx_is_read (is_read)
            )
        `);
        console.log("[DB] Notifications table verified/created");
        connection.release();
    } catch (err) {
        console.error("[DB] Notifications table init failed:", err.message);
    }
}

// Initialize on load
initNotificationsTable();

// Store a notification in database
async function storeNotification(email, type, subject, body, notificationData = {}) {
    try {
        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
            `INSERT INTO notifications (email, type, subject, body, notification_data) 
             VALUES (?, ?, ?, ?, ?)`,
            [email, type, subject, body, JSON.stringify(notificationData)]
        );
        
        connection.release();
        
        console.log(`[NOTIFICATION] Stored ${type} notification for ${email}`);
        return {
            success: true,
            notificationId: result.insertId
        };
    } catch (err) {
        console.error("[NOTIFICATION] Storage failed:", err.message);
        return {
            success: false,
            error: err.message
        };
    }
}

// Get all notifications for a user by email
router.get('/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { unread_only } = req.query;

        const connection = await pool.getConnection();
        
        let query = 'SELECT * FROM notifications WHERE email = ?';
        let params = [email];
        
        if (unread_only === 'true') {
            query += ' AND is_read = FALSE';
        }
        
        query += ' ORDER BY created_at DESC LIMIT 100';
        
        const [notifications] = await connection.query(query, params);
        
        connection.release();

        res.json({
            success: true,
            count: notifications.length,
            notifications: notifications
        });

    } catch (error) {
        console.error("[NOTIFICATION] Get failed:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get unread count for a user
router.get('/unread-count/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'SELECT COUNT(*) as unread_count FROM notifications WHERE email = ? AND is_read = FALSE',
            [email]
        );
        connection.release();

        res.json({
            success: true,
            unread_count: result[0].unread_count
        });

    } catch (error) {
        console.error("[NOTIFICATION] Count failed:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();
        await connection.query(
            'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ?',
            [id]
        );
        connection.release();

        res.json({
            success: true,
            message: 'Notification marked as read'
        });

    } catch (error) {
        console.error("[NOTIFICATION] Read update failed:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Mark all notifications as read for a user
router.put('/user/:email/read-all', async (req, res) => {
    try {
        const { email } = req.params;

        const connection = await pool.getConnection();
        await connection.query(
            'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE email = ? AND is_read = FALSE',
            [email]
        );
        connection.release();

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });

    } catch (error) {
        console.error("[NOTIFICATION] Read all failed:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get notifications by type
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { email } = req.query;

        const connection = await pool.getConnection();
        
        let query = 'SELECT * FROM notifications WHERE type = ?';
        let params = [type];
        
        if (email) {
            query += ' AND email = ?';
            params.push(email);
        }
        
        query += ' ORDER BY created_at DESC LIMIT 50';
        
        const [notifications] = await connection.query(query, params);
        connection.release();

        res.json({
            success: true,
            count: notifications.length,
            notifications: notifications
        });

    } catch (error) {
        console.error("[NOTIFICATION] Type query failed:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get notification details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();
        const [notifications] = await connection.query(
            'SELECT * FROM notifications WHERE id = ?',
            [id]
        );
        connection.release();

        if (notifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            notification: notifications[0]
        });

    } catch (error) {
        console.error("[NOTIFICATION] Detail fetch failed:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================================
// ANNOUNCEMENTS SYSTEM
// ============================================

// Initialize Announcements Table
async function initAnnouncementsTable() {
    try {
        const connection = await pool.getConnection();
        await connection.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                priority VARCHAR(20) DEFAULT 'medium',
                category VARCHAR(50),
                target_audience VARCHAR(50) DEFAULT 'all',
                published_by VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_priority (priority),
                INDEX idx_category (category),
                INDEX idx_active (is_active),
                INDEX idx_created (created_at)
            )
        `);
        console.log("[DB] Announcements table verified/created");
        connection.release();
    } catch (err) {
        console.error("[DB] Announcements table init failed:", err.message);
    }
}

initAnnouncementsTable();

// Get all active announcements
router.get('/announcements', async (req, res) => {
    try {
        const { priority, category, limit = 50 } = req.query;

        const connection = await pool.getConnection();
        
        let query = 'SELECT * FROM announcements WHERE is_active = TRUE';
        let params = [];
        
        if (priority) {
            query += ' AND priority = ?';
            params.push(priority);
        }
        
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        
        query += ' ORDER BY priority DESC, created_at DESC LIMIT ?';
        params.push(parseInt(limit));
        
        const [announcements] = await connection.query(query, params);
        
        connection.release();

        res.json({
            success: true,
            count: announcements.length,
            announcements: announcements
        });

    } catch (error) {
        console.error("[ANNOUNCEMENTS] Fetch failed:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create new announcement
router.post('/announcements', async (req, res) => {
    try {
        const { title, content, priority, category, target_audience, published_by } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const connection = await pool.getConnection();
        
        const [result] = await connection.query(
            `INSERT INTO announcements (title, content, priority, category, target_audience, published_by) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, content, priority || 'medium', category, target_audience || 'all', published_by]
        );
        
        connection.release();

        res.json({
            success: true,
            announcement_id: result.insertId,
            message: 'Announcement created successfully'
        });

    } catch (error) {
        console.error("[ANNOUNCEMENTS] Create failed:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update announcement
router.put('/announcements/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, priority, category, is_active } = req.body;

        const connection = await pool.getConnection();
        
        let query = 'UPDATE announcements SET ';
        let params = [];
        let updates = [];

        if (title) {
            updates.push('title = ?');
            params.push(title);
        }
        if (content) {
            updates.push('content = ?');
            params.push(content);
        }
        if (priority) {
            updates.push('priority = ?');
            params.push(priority);
        }
        if (category) {
            updates.push('category = ?');
            params.push(category);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            params.push(is_active);
        }

        query += updates.join(', ') + ' WHERE id = ?';
        params.push(id);

        await connection.query(query, params);
        connection.release();

        res.json({
            success: true,
            message: 'Announcement updated successfully'
        });

    } catch (error) {
        console.error("[ANNOUNCEMENTS] Update failed:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete announcement
router.delete('/announcements/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const connection = await pool.getConnection();
        await connection.query('DELETE FROM announcements WHERE id = ?', [id]);
        connection.release();

        res.json({
            success: true,
            message: 'Announcement deleted successfully'
        });

    } catch (error) {
        console.error("[ANNOUNCEMENTS] Delete failed:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Clear old notifications (older than 30 days)
router.delete('/cleanup/old', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
        );
        connection.release();

        res.json({
            success: true,
            deleted_count: result.affectedRows,
            message: `Deleted ${result.affectedRows} old notifications`
        });

    } catch (error) {
        console.error("[NOTIFICATION] Cleanup failed:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Export for use in other modules
module.exports = {
    router,
    storeNotification,
    initNotificationsTable,
    initAnnouncementsTable
};
