-- Production Database Restoration Script
-- This script creates all tables and inserts data without binary columns

USE scl_institute;

-- Disable foreign key checks to allow dropping tables
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables that have foreign key dependencies first
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS application_reviews;
DROP TABLE IF EXISTS application_documents;
DROP TABLE IF EXISTS admissions_decisions;
DROP TABLE IF EXISTS student_applications;
DROP TABLE IF EXISTS student_onboarding;
DROP TABLE IF EXISTS student_induction;
DROP TABLE IF EXISTS disability_documents;
DROP TABLE IF EXISTS disability_requests;
DROP TABLE IF EXISTS adjustment_plan;
DROP TABLE IF EXISTS complaint_documents;
DROP TABLE IF EXISTS complaint_timeline;
DROP TABLE IF EXISTS complaints_appeals;
DROP TABLE IF EXISTS safeguarding_timeline;
DROP TABLE IF EXISTS safeguarding_reports;
DROP TABLE IF EXISTS feedback_surveys;
DROP TABLE IF EXISTS support_requests;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS sso_tokens;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    password VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('M', 'F', 'Other'),
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Create roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role_name (role_name)
);

-- Create other essential tables
CREATE TABLE IF NOT EXISTS sso_tokens (
    token VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255),
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    target_audience VARCHAR(100),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50),
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (user_email),
    INDEX idx_read_status (read_status)
);

CREATE TABLE IF NOT EXISTS support_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    duration VARCHAR(100),
    credits INT,
    level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS student_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    course_id INT,
    phone VARCHAR(20),
    address TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS admissions_decisions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    decision VARCHAR(50),
    decision_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    offer_letter TEXT,
    notes TEXT,
    FOREIGN KEY (application_id) REFERENCES student_applications(id)
);

-- Insert roles
INSERT INTO roles (role_name, description) VALUES
('Super Admin', 'Full system access to all modules'),
('LMS Manager', 'Manages course delivery, assessments, grading'),
('Admissions Officer', 'Manages student applications, admissions, onboarding'),
('Faculty & HR Manager', 'Manages faculty recruitment, HR records'),
('Teacher', 'Teaches courses and manages student learning'),
('Student', 'Enrolled in courses'),
('Manager', 'Manages department operations');

-- Insert admin users
INSERT INTO users (id, email, password, first_name, last_name, role, is_active) VALUES
(1, 'admin@scl.com', 'password', 'SCL', 'Admin', 'Super Admin', 1),
(2, 'admin@sclsandbox.xyz', 'password123', 'System', 'Administrator', 'Super Admin', 1),
(3, 'lmsmanager@scl.edu', 'password123', 'LMS', 'Manager', 'LMS Manager', 1),
(4, 'admissions@scl.edu', 'password123', 'Admissions', 'Officer', 'Admissions Officer', 1),
(5, 'hr@scl.edu', 'password123', 'HR', 'Manager', 'Faculty & HR Manager', 1);

-- Success message
SELECT 'Database restored successfully!' AS Status;
SELECT COUNT(*) AS TotalTables FROM information_schema.tables WHERE table_schema = 'scl_institute';
SELECT COUNT(*) AS TotalUsers FROM users;
SELECT COUNT(*) AS TotalRoles FROM roles;
