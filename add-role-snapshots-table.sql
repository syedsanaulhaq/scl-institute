-- Role snapshot table for Moodle-synced roles
-- Stores latest role state from Moodle SSO flow

CREATE TABLE IF NOT EXISTS user_role_snapshots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    moodle_user_id INT DEFAULT NULL,
    roles TEXT NOT NULL COMMENT 'Comma-separated normalized role list from Moodle',
    role_data JSON DEFAULT NULL COMMENT 'Full role context including course-level assignments',
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT NULL,
    source VARCHAR(50) DEFAULT 'moodle',
    UNIQUE KEY unique_email (email),
    INDEX idx_email (email),
    INDEX idx_synced_at (synced_at),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
