-- Create categories table for SCL Institute
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    category_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color_code VARCHAR(7),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_code (category_code),
    INDEX idx_is_active (is_active)
);

-- Insert categories based on your existing courses
INSERT INTO categories (category_name, category_code, description, icon, color_code, display_order, is_active) VALUES
('Engineering', 'ENG', 'Engineering programs including B.Tech and M.Tech courses', '⚙️', '#FF6B6B', 1, TRUE),
('Business & Management', 'BUS', 'Business administration, MBA, and commerce programs', '💼', '#4ECDC4', 2, TRUE),
('IT & Computing', 'IT', 'Computer science, BCA, MCA, and IT-related courses', '💻', '#45B7D1', 3, TRUE),
('Professional Certifications', 'CERT', 'CPD and certification programs for professional development', '🏆', '#FFA502', 4, TRUE);

-- Link courses to categories (optional - if you want to add a course_category column later)
-- For now, use the department field in courses table which already categorizes them
