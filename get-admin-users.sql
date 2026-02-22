SELECT DISTINCT mu.id, mu.username, mu.email, mu.firstname, mu.lastname FROM mdl_user mu 
INNER JOIN mdl_role_assignments mra ON mu.id = mra.userid 
INNER JOIN mdl_role mr ON mra.roleid = mr.id 
WHERE mr.shortname = 'admin' LIMIT 5;
