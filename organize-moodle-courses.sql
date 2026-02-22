-- Update courses to proper categories

-- Engineering category (id=2)
UPDATE mdl_course SET category = 2 WHERE shortname IN ('BTECH-CSE-001', 'BTECH-MEC-001', 'BTECH-ECE-001', 'MTECH-DS-001');

-- Business & Management category (id=3)
UPDATE mdl_course SET category = 3 WHERE shortname IN ('MBA-BA-001', 'BCOM-001');

-- IT & Computing category (id=4)
UPDATE mdl_course SET category = 4 WHERE shortname IN ('BCA-001', 'MCA-001', 'CERT-CLOUD-001', 'CERT-WEB-001');

-- Professional Certifications category (id=5)
UPDATE mdl_course SET category = 5 WHERE shortname IN ('CERT-DATA-001', 'CERT-AI-001');
