-- Enable SSO authentication method in Moodle
-- This configures Moodle to use our custom SSO plugin

-- Enable the sso auth plugin
UPDATE mdl_config 
SET value = 'manual,sso' 
WHERE name = 'authloginwww' 
LIMIT 1;

-- Set SSO as one of the enabled authentication methods
INSERT INTO mdl_config (name, value) 
VALUES ('auth_sso_enabled', '1') 
ON DUPLICATE KEY UPDATE value = '1';

-- Create SSO token table for verification
CREATE TABLE IF NOT EXISTS mdl_sso_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    KEY user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Register the local_sclsso plugin as installed
INSERT INTO mdl_config_plugins (plugin, name, value)
VALUES ('local_sclsso', 'version', '2024011500')
ON DUPLICATE KEY UPDATE value = '2024011500';

INSERT INTO mdl_config_plugins (plugin, name, value)
VALUES ('local_sclsso', 'requires', '2019051100')
ON DUPLICATE KEY UPDATE value = '2019051100';
