SELECT COUNT(*) as total_users FROM users;
SELECT role_name, COUNT(*) as count FROM roles LEFT JOIN user_roles ON roles.id = user_roles.role_id GROUP BY role_name;
SELECT email, first_name, last_name FROM users LIMIT 5;