-- Create courses table for SCL Institute
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    course_type ENUM('HND', 'Degree', 'Vocational', 'Short Course', 'CPD') NOT NULL,
    department VARCHAR(100),
    duration_months INT DEFAULT 12,
    description TEXT,
    full_time_available BOOLEAN DEFAULT TRUE,
    part_time_available BOOLEAN DEFAULT FALSE,
    online_available BOOLEAN DEFAULT TRUE,
    blended_available BOOLEAN DEFAULT FALSE,
    awarding_body VARCHAR(255) DEFAULT 'SCL Institute',
    course_status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_course_code (course_code),
    INDEX idx_course_status (course_status)
);

-- Insert sample courses
INSERT INTO courses (course_code, course_title, course_type, department, duration_months, description, full_time_available, part_time_available, online_available, blended_available, course_status) VALUES
('BTECH-CSE-001', 'B.Tech Computer Science Engineering', 'Degree', 'Engineering', 48, 'Advanced computing with focus on AI, ML, and software development. Learn from industry experts and build practical skills.', TRUE, FALSE, FALSE, TRUE, 'active'),
('BTECH-MEC-001', 'B.Tech Mechanical Engineering', 'Degree', 'Engineering', 48, 'Design, manufacturing, and thermal systems. Hands-on experience with modern CAD and simulation tools.', TRUE, FALSE, FALSE, TRUE, 'active'),
('BTECH-ECE-001', 'B.Tech Electrical Engineering', 'Degree', 'Engineering', 48, 'Power systems, electronics, and renewable energy. Comprehensive coverage of modern electrical technologies.', TRUE, FALSE, FALSE, TRUE, 'active'),
('MBA-BA-001', 'MBA Business Administration', 'Degree', 'Business', 24, 'Strategic management, finance, and leadership. Ideal for working professionals seeking career advancement.', FALSE, TRUE, TRUE, TRUE, 'active'),
('MTECH-DS-001', 'M.Tech Data Science', 'Degree', 'Engineering', 24, 'Machine learning, big data analytics, and AI. Master the most sought-after skills in tech industry.', FALSE, TRUE, TRUE, TRUE, 'active'),
('BCOM-001', 'B.Com Commerce', 'Degree', 'Commerce', 36, 'Accounting, finance, and business law. Build expertise in financial management and commerce.', TRUE, TRUE, FALSE, TRUE, 'active'),
('BCA-001', 'BCA Computer Applications', 'Degree', 'IT', 36, 'Programming, databases, and web development. Foundation for careers in IT industry.', TRUE, FALSE, TRUE, TRUE, 'active'),
('MCA-001', 'MCA Computer Applications', 'Degree', 'IT', 24, 'Advanced programming, software engineering, and cloud technologies. Transform your IT career.', FALSE, TRUE, TRUE, TRUE, 'active'),
('CERT-CLOUD-001', 'Cloud Computing Certification', 'CPD', 'IT', 6, 'AWS and Azure certifications. Industry-recognized credential for cloud professionals.', FALSE, TRUE, TRUE, FALSE, 'active'),
('CERT-DATA-001', 'Data Science Fundamentals', 'CPD', 'Engineering', 6, 'Introduction to Python, statistics, and data analysis. Perfect starting point for data careers.', FALSE, TRUE, TRUE, FALSE, 'active'),
('CERT-WEB-001', 'Full Stack Web Development', 'CPD', 'IT', 6, 'Frontend and backend technologies. Build complete web applications from scratch.', FALSE, TRUE, TRUE, FALSE, 'active'),
('CERT-AI-001', 'Artificial Intelligence Basics', 'CPD', 'Engineering', 8, 'Machine learning fundamentals and AI concepts. Gateway to advanced AI technologies.', FALSE, TRUE, TRUE, FALSE, 'active');
