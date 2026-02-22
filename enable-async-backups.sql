-- Enable asynchronous backups
UPDATE mdl_config SET value = 1 WHERE name = 'backup_async_enabled';

-- Verify the change
SELECT name, value FROM mdl_config WHERE name = 'backup_async_enabled';
