-- Initialize Production Database with Admin User
-- Run this on the production server to fix authentication issue

USE scl_institute;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    password VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('M', 'F', 'Other'),
    profile_photo LONGBLOB,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role_name (role_name)
);

-- Insert roles
INSERT INTO roles (role_name, description) VALUES
('Super Admin', 'Full system access to all modules'),
('LMS Manager', 'Manages course delivery, assessments, grading'),
('Admissions Officer', 'Manages student applications, admissions, onboarding'),
('Faculty & HR Manager', 'Manages faculty recruitment, HR records'),
('Teacher', 'Teaches courses and manages student learning'),
('Student', 'Enrolled in courses')
ON DUPLICATE KEY UPDATE role_name=VALUES(role_name);

-- Insert admin user with password 'password'
INSERT INTO users (email, password_hash, password, first_name, last_name, role, is_active) VALUES
('admin@scl.com', 'password', 'password', 'SCL', 'Admin', 'Super Admin', TRUE),
('admin@sclsandbox.xyz', 'password123', 'password123', 'System', 'Administrator', 'Super Admin', TRUE)
ON DUPLICATE KEY UPDATE 
    password = VALUES(password),
    password_hash = VALUES(password_hash),
    role = VALUES(role);

-- Display success message
SELECT 'Database initialized successfully!' AS status;
SELECT email, first_name, last_name, role FROM users WHERE email IN ('admin@scl.com', 'admin@sclsandbox.xyz');
