-- Restore all core schema tables
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
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

CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role_name (role_name)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE KEY unique_user_role (user_id, role_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
);

-- Insert roles
INSERT INTO roles (role_name, description) VALUES
('Super Admin', 'Full system access to all modules'),
('LMS Manager', 'Manages course delivery, assessments, grading'),
('Admissions Officer', 'Manages student applications, admissions, onboarding'),
('Faculty & HR Manager', 'Manages faculty recruitment, HR records'),
('Teacher', 'Teaches courses and manages student learning'),
('Student', 'Enrolled in courses'),
('Manager', 'Manages department operations')
ON DUPLICATE KEY UPDATE role_name=VALUES(role_name);

-- Insert all 23 users with password set to 'password123'
INSERT INTO users (id, email, password_hash, password, first_name, last_name, role) VALUES
(1, 'admin@sclsandbox.xyz', 'password123', 'password123', 'System', 'Administrator', 'Super Admin'),
(2, 'lmsmanager@scl.edu', 'password123', 'password123', 'LMS', 'Manager', 'LMS Manager'),
(3, 'admissions@scl.edu', 'password123', 'password123', 'Admissions', 'Officer', 'Admissions Officer'),
(4, 'hr@scl.edu', 'password123', 'password123', 'HR', 'Manager', 'Faculty & HR Manager'),
(5, 'dr.ahmed.cs@scl.edu', 'password123', 'password123', 'Ahmed', 'Khan', 'Teacher'),
(6, 'prof.sara.ai@scl.edu', 'password123', 'password123', 'Sara', 'Ahmed', 'Teacher'),
(7, 'dr.hassan.ml@scl.edu', 'password123', 'password123', 'Hassan', 'Ali', 'Teacher'),
(8, 'eng.fahad.web@scl.edu', 'password123', 'password123', 'Fahad', 'Mohammed', 'Teacher'),
(9, 'dr.aisha.data@scl.edu', 'password123', 'password123', 'Aisha', 'Fatima', 'Teacher'),
(10, 'prof.usman.mech@scl.edu', 'password123', 'password123', 'Usman', 'Hassan', 'Teacher'),
(11, 'student.ali.001@scl.edu', 'password123', 'password123', 'Ali', 'Hassan', 'Student'),
(12, 'student.fatima.002@scl.edu', 'password123', 'password123', 'Fatima', 'Ahmed', 'Student'),
(13, 'student.zain.003@scl.edu', 'password123', 'password123', 'Zain', 'Mohammed', 'Student'),
(14, 'student.noor.004@scl.edu', 'password123', 'password123', 'Noor', 'Ahmed', 'Student'),
(15, 'student.hamad.005@scl.edu', 'password123', 'password123', 'Hamad', 'Ali', 'Student'),
(16, 'student.rana.006@scl.edu', 'password123', 'password123', 'Rana', 'Hassan', 'Student'),
(17, 'student.adnan.007@scl.edu', 'password123', 'password123', 'Adnan', 'Fatima', 'Student'),
(18, 'student.lina.008@scl.edu', 'password123', 'password123', 'Lina', 'Mohammed', 'Student'),
(19, 'student.karim.009@scl.edu', 'password123', 'password123', 'Karim', 'Ahmed', 'Student'),
(20, 'student.sara.010@scl.edu', 'password123', 'password123', 'Sara', 'Khan', 'Student'),
(21, 'manager.dept.cs@scl.edu', 'password123', 'password123', 'Mohammad', 'CS Manager', 'Manager'),
(22, 'manager.dept.eng@scl.edu', 'password123', 'password123', 'Eng', 'Department Manager', 'Manager'),
(23, 'manager.dept.business@scl.edu', 'password123', 'password123', 'Business', 'Manager', 'Manager')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Assign roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),  -- admin is Super Admin
(2, 2),  -- lmsmanager is LMS Manager
(3, 3),  -- admissions is Admissions Officer
(4, 4),  -- hr is Faculty & HR Manager
(5, 5),  -- dr.ahmed is Teacher
(6, 5),  -- prof.sara is Teacher
(7, 5),  -- dr.hassan is Teacher
(8, 5),  -- eng.fahad is Teacher
(9, 5),  -- dr.aisha is Teacher
(10, 5), -- prof.usman is Teacher
(11, 6), -- student.ali is Student
(12, 6), -- student.fatima is Student
(13, 6), -- student.zain is Student
(14, 6), -- student.noor is Student
(15, 6), -- student.hamad is Student
(16, 6), -- student.rana is Student
(17, 6), -- student.adnan is Student
(18, 6), -- student.lina is Student
(19, 6), -- student.karim is Student
(20, 6), -- student.sara is Student
(21, 7), -- manager.dept.cs is Manager
(22, 7), -- manager.dept.eng is Manager
(23, 7)  -- manager.dept.business is Manager
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);

SELECT 'Users restored: '; SELECT COUNT(*) as total_users FROM users;
SELECT 'Roles assigned: '; SELECT COUNT(*) as total_assignments FROM user_roles;
