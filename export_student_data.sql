-- Export all student and teacher data from local database
-- Run this to generate INSERT statements for production

USE scl_institute;

-- Export additional users (students and teachers)
SELECT CONCAT(
    'INSERT INTO users (id, email, password, first_name, last_name, role, is_active) VALUES (',
    id, ', ''', email, ''', ''', COALESCE(password, 'password123'), ''', ''', first_name, ''', ''', last_name, ''', ''', role, ''', ', is_active, ') ON DUPLICATE KEY UPDATE email=VALUES(email);'
) AS ''
FROM users
WHERE id > 5
ORDER BY id;

-- Export categories
SELECT CONCAT(
    'INSERT INTO categories (id, name, description) VALUES (',
    id, ', ''', name, ''', ', COALESCE(CONCAT('''', description, ''''), 'NULL'), ') ON DUPLICATE KEY UPDATE name=VALUES(name);'
) AS ''
FROM categories
ORDER BY id;

-- Export courses
SELECT CONCAT(
   'INSERT INTO courses (id, category_id, name, code, description, duration, credits, level) VALUES (',
    id, ', ', COALESCE(category_id, 'NULL'), ', ''', name, ''', ',
    COALESCE(CONCAT('''', code, ''''), 'NULL'), ', ',
    COALESCE(CONCAT('''', REPLACE(description, '''', ''''''), ''''), 'NULL'), ', ',
    COALESCE(CONCAT('''', duration, ''''), 'NULL'), ', ',
    COALESCE(credits, 'NULL'), ', ',
    COALESCE(CONCAT('''', level, ''''), 'NULL'),
    ') ON DUPLICATE KEY UPDATE name=VALUES(name);'
) AS ''
FROM courses
ORDER BY id;

-- Export student applications
SELECT CONCAT(
    'INSERT INTO student_applications (id, email, first_name, last_name, course_id, phone, address, status, application_date) VALUES (',
    id, ', ''', email, ''', ',
    COALESCE(CONCAT('''', first_name, ''''), 'NULL'), ', ',
    COALESCE(CONCAT('''', last_name, ''''), 'NULL'), ', ',
    COALESCE(course_id, 'NULL'), ', ',
    COALESCE(CONCAT('''', phone, ''''), 'NULL'), ', ',
    COALESCE(CONCAT('''', REPLACE(address, '''', ''''''), ''''), 'NULL'), ', ',
    COALESCE(CONCAT('''', status, ''''), '''pending'''), ', ',
    COALESCE(CONCAT('''', application_date, ''''), 'NOW()'),
    ') ON DUPLICATE KEY UPDATE email=VALUES(email);'
) AS ''
FROM student_applications
ORDER BY id;
