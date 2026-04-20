CREATE USER IF NOT EXISTS 'moodleuser'@'%' IDENTIFIED BY 'moodlepass';
GRANT ALL PRIVILEGES ON moodle.* TO 'moodleuser'@'%';
FLUSH PRIVILEGES;
SELECT 'Remote access granted' as status;
