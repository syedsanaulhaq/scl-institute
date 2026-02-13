-- Clean data export for production - NO BINARY DATA
USE scl_institute;

-- Insert students and teachers (IDs 6-28)
INSERT INTO users (id, email, password, first_name, last_name, role, is_active) VALUES
(6, 'dr.ahmed.cs@scl.edu', 'password123', 'Ahmed', 'Khan', 'Teacher', 1),
(7, 'prof.sara.ai@scl.edu', 'password123', 'Sara', 'Ahmed', 'Teacher', 1),
(8, 'dr.hassan.ml@scl.edu', 'password123', 'Hassan', 'Ali', 'Teacher', 1),
(9, 'eng.fahad.web@scl.edu', 'password123', 'Fahad', 'Mohammed', 'Teacher', 1),
(10, 'dr.aisha.data@scl.edu', 'password123', 'Aisha', 'Fatima', 'Teacher', 1),
(11, 'prof.usman.mech@scl.edu', 'password123', 'Usman', 'Hassan', 'Teacher', 1),
(12, 'student.ali.001@scl.edu', 'password123', 'Ali', 'Hassan', 'Student', 1),
(13, 'student.fatima.002@scl.edu', 'password123', 'Fatima', 'Ahmed', 'Student', 1),
(14, 'student.zain.003@scl.edu', 'password123', 'Zain', 'Mohammed', 'Student', 1),
(15, 'student.noor.004@scl.edu', 'password123', 'Noor', 'Ahmed', 'Student', 1),
(16, 'student.hamad.005@scl.edu', 'password123', 'Hamad', 'Ali', 'Student', 1),
(17, 'student.rana.006@scl.edu', 'password123', 'Rana', 'Hassan', 'Student', 1),
(18, 'student.adnan.007@scl.edu', 'password123', 'Adnan', 'Fatima', 'Student', 1),
(19, 'student.lina.008@scl.edu', 'password123', 'Lina', 'Mohammed', 'Student', 1),
(20, 'student.karim.009@scl.edu', 'password123', 'Karim', 'Ahmed', 'Student', 1),
(21, 'student.sara.010@scl.edu', 'password123', 'Sara', 'Khan', 'Student', 1),
(24, 'ahmed.hassan.app@example.com', 'password123', 'Ahmed', 'Hassan', 'student', 1),
(25, 'noor.ahmed.app@example.com', 'password123', 'Noor', 'Ahmed', 'student', 1),
(26, 'mohammed.khan.app@example.com', 'password123', 'Mohammed', 'Khan', 'student', 1),
(27, 'mohammed.hassan@example.com', 'password123', 'Mohammed', 'Hassan', 'student', 1),
(28, 'mohammed.khalid@example.com', 'password123', 'Mohammed', 'Khan', 'student', 1)
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Insert categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Engineering', 'Engineering programs including B.Tech and M.Tech courses'),
(2, 'Computer Science', 'Computer Science and IT related programs'),
(3, 'Business', 'Business Administration and Management programs'),
(4, 'Arts & Humanities', 'Arts, Literature, and Humanities programs')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert courses
INSERT INTO courses (id, category_id, name, code, description, duration, credits, level) VALUES
(1, 1, 'Bachelor of Technology in Computer Science', 'CS-BTECH-001', 'Comprehensive computer science program', '4 years', 160, 'Undergraduate'),
(2, 1, 'Bachelor of Technology in Mechanical Engineering', 'ME-BTECH-002', 'Mechanical engineering fundamentals and advanced topics', '4 years', 160, 'Undergraduate'),
(3, 2, 'Master of Computer Applications', 'MCA-001', 'Advanced computing and application development', '3 years', 90, 'Postgraduate'),
(4, 2, 'BSc Computer Science', 'CS-BSC-001', 'Computer science basics and programming', '3 years', 90, 'Undergraduate'),
(5, 3, 'MBA General Management', 'MBA-GM-001', 'General management and business administration', '2 years', 60, 'Postgraduate'),
(6, 3, 'BBA Business Administration', 'BBA-001', 'Business fundamentals and entrepreneurship', '3 years', 90, 'Undergraduate'),
(7, 4, 'BA English Literature', 'ENG-BA-001', 'English literature and language studies', '3 years', 90, 'Undergraduate'),
(8, 2, 'MSc Data Science', 'DS-MSC-001', 'Advanced data analytics and machine learning', '2 years', 60, 'Postgraduate'),
(9, 1, 'B.Tech Electrical Engineering', 'EE-BTECH-003', 'Electrical systems and electronics', '4 years', 160, 'Undergraduate'),
(10, 2, 'B.Tech Artificial Intelligence', 'AI-BTECH-004', 'AI and machine learning specialization', '4 years', 160, 'Undergraduate'),
(11, 3, 'B.Com Commerce', 'BCOM-001', 'Commerce and accounting fundamentals', '3 years', 90, 'Undergraduate'),
(12, 4, 'BA Psychology', 'PSY-BA-001', 'Human behavior and mental processes', '3 years', 90, 'Undergraduate')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert student applications
INSERT INTO student_applications (id, first_name, last_name, email, phone, course_id, status, application_date) VALUES
(1, 'Ahmed', 'Hassan', 'ahmed.hassan.app@example.com', '+447123456789', 5, 'accepted', '2026-02-07 12:14:38'),
(2, 'Fatima', 'Ali', 'fatima.ali.app@example.com', '+447234567890', 1, 'submitted', '2026-02-07 12:14:38'),
(3, 'Mohammed', 'Khan', 'mohammed.khan.app@example.com', '+447345678901', 11, 'accepted', '2026-02-07 12:14:38'),
(4, 'Noor', 'Ahmed', 'noor.ahmed.app@example.com', '+447456789012', 1, 'conditional_accept', '2026-02-07 12:14:38'),
(5, 'Hamad', 'Mohammed', 'hamad.mohammed.app@example.com', '+447567890123', 3, 'rejected', '2026-02-07 12:14:38'),
(6, 'Mohammed', 'Hassan', 'mohammed.hassan@example.com', '+234-803-555-0123', 10, 'accepted', '2026-02-08 09:20:25'),
(7, 'Mohammed', 'Khan', 'mohammed.khalid@example.com', '+234-803-555-0123', 10, 'accepted', '2026-02-11 15:16:01')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Success message
SELECT 'Clean data imported successfully!' AS Status;
SELECT COUNT(*) AS TotalUsers FROM users;
SELECT COUNT(*) AS TotalCategories FROM categories;
SELECT COUNT(*) AS TotalCourses FROM courses;
SELECT COUNT(*) AS TotalApplications FROM student_applications;
