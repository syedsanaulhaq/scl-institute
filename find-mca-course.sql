SELECT id, fullname, shortname, idnumber, visible 
FROM mdl_course 
WHERE idnumber = 'MCA-001' OR shortname LIKE '%MCA%' OR fullname LIKE '%MCA%';
