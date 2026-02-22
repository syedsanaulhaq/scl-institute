DROP TABLE IF EXISTS mdl_config;
CREATE TABLE mdl_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,
  value LONGTEXT
);

INSERT INTO mdl_config (name, value) VALUES 
  ('version', '2023100900'),
  ('release', '4.3'),
  ('branch', '43'),
  ('wwwroot', 'http://localhost:9090'),
  ('dataroot', '/bitnami/moodle/data'),
  ('directorypermissions', '2777'),
  ('admin', 'admin'),
  ('sslproxy', 'false'),
  ('enabledevicedetection', '1');

DROP TABLE IF EXISTS mdl_course;
CREATE TABLE mdl_course (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category INT,
  shortname VARCHAR(255),
  fullname VARCHAR(255),
  idnumber VARCHAR(100),
  summary LONGTEXT,
  summaryformat INT,
  format VARCHAR(21),
  showgrades INT,
  newsitems INT,
  startdate INT,
  enddate INT,
  visible INT DEFAULT 1,
  cacherev INT
);

INSERT INTO mdl_course (id, category, shortname, fullname, format, startdate, visible) VALUES
(1, 0, 'Test', 'Test', 'topics', 0, 1),
(2, 1, 'BUS101', 'Business Administration HND', 'topics', 1704067200, 1),
(3, 1, 'IT201', 'Information Technology Degree', 'topics', 1704067200, 1),
(4, 1, 'ACC301', 'Accounting and Finance HND', 'topics', 1704067200, 1),
(5, 1, 'ENG401', 'English Language Course', 'topics', 1704067200, 1),
(6, 1, 'PROJ501', 'Project Management CPD', 'topics', 1704067200, 1),
(7, 1, 'WEB201', 'Web Development Fundamentals', 'topics', 1704067200, 1),
(8, 1, 'DATA301', 'Data Science & Analytics', 'topics', 1704067200, 1),
(9, 1, 'AI401', 'Artificial Intelligence Basics', 'topics', 1704067200, 1),
(10, 1, 'CLOUD301', 'Cloud Computing Infrastructure', 'topics', 1704067200, 1),
(11, 1, 'CYBER201', 'Cybersecurity Fundamentals', 'topics', 1704067200, 1),
(12, 1, 'MOBILE201', 'Mobile App Development', 'topics', 1704067200, 1),
(13, 1, 'ML301', 'Machine Learning Essentials', 'topics', 1704067200, 1);
