CREATE USER IF NOT EXISTS 'scl_user'@'%' IDENTIFIED BY 'scl_password';
GRANT ALL PRIVILEGES ON scl_institute.* TO 'scl_user'@'%';
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'Moodle_Root_P@ss';
ALTER USER 'root'@'%' IDENTIFIED BY 'Moodle_Root_P@ss';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
SELECT 'Grants done' as status;
