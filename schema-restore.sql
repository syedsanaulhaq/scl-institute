-- ===============================================
-- SCL-Institute Minimal Schema
-- ===============================================

CREATE DATABASE IF NOT EXISTS scl_institute;
USE scl_institute;

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Role mapping
CREATE TABLE IF NOT EXISTS user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role_id)
);

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
('Super Admin', 'Full system access'),
('LMS Manager', 'Manages LMS'),
('Teacher', 'Teaches courses'),
('Student', 'Enrolled in courses'),
('Manager', 'Department manager');

-- Insert admin users (passwords: password123)
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active) VALUES
(1, 'admin@sclsandbox.xyz', 'password123', 'System', 'Administrator', '+92300000001', 1),
(2, 'lmsmanager@scl.edu', 'password123', 'Ahmed', 'Khan', '+92300000002', 1),
(3, 'dr.ahmed.cs@scl.edu', 'password123', 'Dr. Ahmed', 'Malik', '+92321111001', 1),
(4, 'prof.sara.ai@scl.edu', 'password123', 'Prof. Sara', 'Mirza', '+92321111002', 1),
(5, 'student.ali.001@scl.edu', 'password123', 'Ali', 'Hassan', '+92333001001', 1),
(6, 'student.fatima.002@scl.edu', 'password123', 'Fatima', 'Khan', '+92333001002', 1);

-- Assign roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- admin is Super Admin
(2, 2), -- lmsmanager is LMS Manager
(3, 3), -- dr.ahmed is Teacher
(4, 3), -- prof.sara is Teacher
(5, 4), -- ali is Student
(6, 4); -- fatima is Student
