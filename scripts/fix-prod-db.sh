#!/bin/bash

# Production Database Initialization Script
# Fixes: "Table 'scl_institute.users' doesn't exist" error
# Run this on the production server at 185.211.6.60

set -e

echo "================================================"
echo "SCL Institute - Production Database Setup"
echo "================================================"
echo ""

# Check if running on production server
if ! docker ps | grep -q "scli-mysql-prod"; then
    echo "❌ Error: scli-mysql-prod container not found!"
    echo "   Make sure Docker containers are running."
    exit 1
fi

echo "✓ Found MySQL container"
echo ""

# Download the SQL initialization script
echo "📥 Downloading initialization script..."
if [ ! -f "/tmp/init-prod-db.sql" ]; then
    cat > /tmp/init-prod-db.sql <<'EOF'
-- Initialize Production Database with Admin User
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
EOF
fi

echo "✓ SQL script ready"
echo ""

# Execute SQL script
echo "🗄️  Initializing database..."
docker exec -i scli-mysql-prod mysql -u scl_user -pSclSecurePass2024! scl_institute < /tmp/init-prod-db.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✅ DATABASE INITIALIZED SUCCESSFULLY!"
    echo "================================================"
    echo ""
    echo "Admin credentials:"
    echo "  Email:    admin@scl.com"
    echo "  Password: password"
    echo ""
    echo "  Email:    admin@sclsandbox.xyz"
    echo "  Password: password123"
    echo ""
    echo "Testing login..."
    docker restart scli-backend-prod > /dev/null 2>&1
    sleep 3
    echo "✓ Backend restarted"
    echo ""
    echo "You can now login at: https://sclsandbox.xyz"
    echo "================================================"
else
    echo ""
    echo "❌ Error: Database initialization failed"
    echo "   Check the error messages above"
    exit 1
fi
