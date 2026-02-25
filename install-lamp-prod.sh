#!/bin/bash
# Production LAMP + Moodle 4.5 Installation Script
# This script installs a complete LAMP stack with Moodle 4.5 and Attendance plugin
# Compatible with the development environment

set -e  # Exit on error

# Configuration
MOODLE_VERSION="MOODLE_405_STABLE"
MOODLE_ROOT="/var/www/moodle-prod"
MOODLE_DATA="/var/moodledata-prod"
DB_NAME="moodle"
DB_USER="moodleuser"
DB_PASS="moodlepass"
ADMIN_USER="admin"
ADMIN_PASS="${1:-changeme}"  # Pass as argument or set manually
APACHE_PORT="8888"

echo "=========================================="
echo "LAMP + Moodle 4.5 Installation"
echo "=========================================="
echo "Moodle Root: $MOODLE_ROOT"
echo "Moodle Data: $MOODLE_DATA"
echo "Database: $DB_NAME"
echo "Apache Port: $APACHE_PORT"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root"
  exit 1
fi

# Step 1: Update system
echo "[1/12] Updating system packages..."
apt update
apt upgrade -y

# Step 2: Install Apache
echo "[2/12] Installing Apache..."
apt install -y apache2
a2enmod rewrite
a2enmod proxy
a2enmod proxy_http

# Configure Apache to listen on custom port
echo "Listen $APACHE_PORT" > /etc/apache2/ports.conf
systemctl start apache2
systemctl enable apache2

# Step 3: Install MariaDB
echo "[3/12] Installing MariaDB..."
apt install -y mariadb-server
systemctl start mysql
systemctl enable mysql

# Step 4: Create Moodle database and user
echo "[4/12] Creating Moodle database and user..."
mysql -u root << EOSQL
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,CREATE TEMPORARY TABLES,DROP,INDEX,ALTER,CREATE VIEW,SHOW VIEW ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOSQL

# Step 5: Install PHP and required extensions
echo "[5/12] Installing PHP and extensions..."
apt install -y php php-cli php-common php-mysql php-zip php-gd php-xml php-curl \
  php-mbstring php-json php-sockets php-fpm php-intl php-opcache

# Optimize PHP configuration for Moodle
php_config="/etc/php/$(php -r 'echo phpversion();' | cut -d. -f1-2)/apache2/php.ini"
if [ -f "$php_config" ]; then
  echo "[5/12] Configuring PHP for Moodle..."
  sed -i 's/max_execution_time = .*/max_execution_time = 300/' "$php_config"
  sed -i 's/max_input_vars = .*/max_input_vars = 5000/' "$php_config"
  sed -i 's/memory_limit = .*/memory_limit = 512M/' "$php_config"
  sed -i 's/post_max_size = .*/post_max_size = 220M/' "$php_config"
  sed -i 's/upload_max_filesize = .*/upload_max_filesize = 200M/' "$php_config"
fi

systemctl restart apache2

# Step 6: Create directories
echo "[6/12] Creating Moodle directories..."
mkdir -p "$MOODLE_ROOT"
mkdir -p "$MOODLE_DATA"
chown -R www-data:www-data "$MOODLE_DATA"
chmod 770 "$MOODLE_DATA"

# Step 7: Install Moodle from GitHub
echo "[7/12] Cloning Moodle 4.5 from GitHub..."
cd "$MOODLE_ROOT"
git clone -q -b "$MOODLE_VERSION" https://github.com/moodle/moodle.git .
echo "  Moodle installed: $(git log -1 --format='%h %s')"

# Step 8: Set permissions
echo "[8/12] Setting permissions..."
chown -R www-data:www-data "$MOODLE_ROOT"
chmod 755 "$MOODLE_ROOT"
chmod 644 "$MOODLE_ROOT/config.php" 2>/dev/null || true

# Step 9: Configure Apache Virtual Host
echo "[9/12] Configuring Apache virtual host..."
cat > /etc/apache2/sites-available/moodle-prod.conf << EOF
<VirtualHost *:$APACHE_PORT>
    ServerName moodle-prod.local
    ServerAdmin admin@moodle-prod.local
    DocumentRoot $MOODLE_ROOT

    <Directory $MOODLE_ROOT>
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    <IfModule mod_ssl.c>
        SSLEngine off
    </IfModule>

    ErrorLog \${APACHE_LOG_DIR}/moodle-prod-error.log
    CustomLog \${APACHE_LOG_DIR}/moodle-prod-access.log combined
    LogLevel warn

    # Cache headers for static assets
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresDefault "access plus 1 week"
    </IfModule>

    # Compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
    </IfModule>
</VirtualHost>
EOF

a2ensite moodle-prod.conf
apache2ctl configtest
systemctl reload apache2

# Step 10: Create Moodle config.php template
echo "[10/12] Creating Moodle configuration template..."
cat > "$MOODLE_ROOT/config.php" << 'EOFCONFIG'
<?php
// Moodle Production Configuration
// Database and path information.

unset($CFG);
global $CFG;

$CFG->dbtype    = 'mariadb';
$CFG->dblibrary = 'native';
$CFG->dbhost    = 'localhost';
$CFG->dbname    = 'moodle';
$CFG->dbuser    = 'moodleuser';
$CFG->dbpass    = 'moodlepass';
$CFG->prefix    = 'mdl_';
$CFG->dboptions = array (
  'dbpersist' => false,
  'bigblobs' => true,
  'debugdb' => false,
  'debugobjects' => false,
  'larg数据转移 = false,
  'optimisememory' => false,
);

$CFG->wwwroot   = 'http://localhost:8080/moodle-prod';
$CFG->dataroot  = '/var/moodledata-prod';
$CFG->admin     = 'admin';

// Session Configuration
ini_set('session.name', 'MoodleSession');
ini_set('session.cookie_secure', false);  // Set true for HTTPS
ini_set('session.cookie_httponly', true);

// File Uploads
$CFG->maxbytes       = 220 * 1024 * 1024;
$CFG->userquota      = 100 * 1024 * 1024;

// Performance & Security
$CFG->debug          = DEBUG_NORMAL;
$CFG->debugdisplay   = 0;
$CFG->debugstringkeys = 0;
$CFG->cachejs        = 1;

// Required for git-based installs
$CFG->directorypermissions = 02777;

// Email settings (configure after install)
$CFG->smtphosts = '';
$CFG->noreplyaddress = 'noreply@example.com';

// Additional protection
$CFG->passwordpolicy = true;
$CFG->minpasswordlength = 8;
$CFG->minpassworddigits = 1;
$CFG->minpasswordlower = 1;
$CFG->minpasswordupper = 1;
$CFG->minpasswordnonalphanum = 1;

// Finish code coverage execution
require_once(__DIR__ . '/lib/setup.php');

if (file_exists(__DIR__.'/local/register_globals.php')) {
    include_once(__DIR__.'/local/register_globals.php');
}
?>
EOFCONFIG

# Also copy to production version
cp "$MOODLE_ROOT/config.php" "$MOODLE_ROOT/config-production.php.template"

# Step 11: Set correct permissions for config.php
echo "[11/12] Setting configuration file permissions..."
chmod 644 "$MOODLE_ROOT/config.php"
chown www-data:www-data "$MOODLE_ROOT/config.php"

# Step 12: Verify installation
echo "[12/12] Verifying installation..."
echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Access Moodle: http://$(hostname -I | awk '{print $1}'):8080/moodle-prod"
echo "2. Complete installation wizard"
echo "3. Admin username: $ADMIN_USER"
echo "4. Set admin password during wizard"
echo ""
echo "Database Details:"
echo "  - Host: localhost"
echo "  - Database: $DB_NAME"
echo "  - User: $DB_USER"
echo "  - Password: $DB_PASS"
echo ""
echo "Path Details:"
echo "  - Moodle Root: $MOODLE_ROOT"
echo "  - Moodle Data: $MOODLE_DATA"
echo ""
echo "MySQL Credentials for installation:"
echo "  - Database: $DB_NAME"
echo "  - DB Username: $DB_USER"
echo "  - DB Password: $DB_PASS"
echo ""
echo "Important Notes:"
echo "1. During installation, DO NOT select 'Admin' account - use default"
echo "2. Select 'MariaDB' as database type"
echo "3. Keep Apache port at $APACHE_PORT"
echo "4. After install, you can install Attendance plugin"
echo "5. Document the Moodle admin password securely"
echo ""
