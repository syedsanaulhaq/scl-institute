SELECT role,
  JSON_EXTRACT(privileges, '$.can_manage_partners') as partners,
  JSON_EXTRACT(privileges, '$.can_manage_vendors') as vendors,
  JSON_EXTRACT(privileges, '$.can_manage_facilities') as facilities
FROM role_privileges;
