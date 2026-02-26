#!/bin/bash
# Production LAMP + Moodle 4.5 Installation Script (Fixed)

set -e

MOODLE_VERSION="MOODLE_405_STABLE"
MOODLE_ROOT="/var/www/moodle-prod"
MOODLE_DATA="/var/moodledata-prod"
DB_NAME="moodle"
DB_USER="moodleuser"
DB_PASS="moodlepass"
ADMIN_USER="admin"
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

# Step 1: Create Moodle database and user
echo "[1/8] Creating Moodle database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
mysql -u root -e "GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,CREATE TEMPORARY TABLES,DROP,INDEX,ALTER,CREATE VIEW,SHOW VIEW ON $DB_NAME.* TO '$DB_USER'@'localhost';"
mysql -u root -e "FLUSH PRIVILEGES;"

echo "  Database created successfully"

# Step 2: Install PHP and required extensions
echo "[2/8] Installing PHP and extensions..."
apt install -y php php-cli php-common php-mysql php-zip php-gd php-xml php-curl \
  php-mbstring php-json php-sockets php-fpm php-intl php-opcache php-dev > /dev/null 2>&1

echo "  PHP installed successfully"

# Step 3: Optimize PHP configuration for Moodle
echo "[3/8] Configuring PHP for Moodle..."
PHP_INI="/etc/php/$(php -r 'echo phpversion();' | cut -d. -f1-2)/apache2/php.ini"
if [ -f "$PHP_INI" ]; then
  sed -i 's/max_execution_time = .*/max_execution_time = 300/' "$PHP_INI"
  sed -i 's/max_input_vars = .*/max_input_vars = 5000/' "$PHP_INI"
  sed -i 's/memory_limit = .*/memory_limit = 512M/' "$PHP_INI"
  sed -i 's/post_max_size = .*/post_max_size = 220M/' "$PHP_INI"
  sed -i 's/upload_max_filesize = .*/upload_max_filesize = 200M/' "$PHP_INI"
fi

echo "  PHP configured successfully"

# Step 4: Create directories
echo "[4/8] Creating Moodle directories..."
mkdir -p "$MOODLE_ROOT"
mkdir -p "$MOODLE_DATA"
chown -R www-data:www-data "$MOODLE_DATA"
chmod 770 "$MOODLE_DATA"

echo "  Directories created successfully"

# Step 5: Install Moodle from GitHub
echo "[5/8] Cloning Moodle 4.5 from GitHub..."
cd "$MOODLE_ROOT"
git clone -q -b "$MOODLE_VERSION" https://github.com/moodle/moodle.git . > /dev/null 2>&1

echo "  Moodle installed successfully"

# Step 6: Set permissions
echo "[6/8] Setting permissions..."
chown -R www-data:www-data "$MOODLE_ROOT"
chmod 755 "$MOODLE_ROOT"

echo "  Permissions set successfully"

# Step 7: Configure Apache Virtual Host
echo "[7/8] Configuring Apache..."
cat > /etc/apache2/sites-available/moodle-prod.conf << 'EOF'
<VirtualHost *:8888>
    ServerName lms.sclsandbox.xyz
    ServerAlias moodle-prod.local
    DocumentRoot /var/www/moodle-prod

    <Directory /var/www/moodle-prod>
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/moodle-prod-error.log
    CustomLog ${APACHE_LOG_DIR}/moodle-prod-access.log combined
    LogLevel warn

    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresDefault "access plus 1 week"
    </IfModule>

    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
    </IfModule>
</VirtualHost>
EOF

a2ensite moodle-prod.conf > /dev/null 2>&1
apache2ctl configtest > /dev/null 2>&1
systemctl reload apache2

echo "  Apache configured successfully"

# Step 8: Create Moodle config.php
echo "[8/8] Creating Moodle configuration..."
cat > "$MOODLE_ROOT/config.php" << 'EOFCONFIG'
<?php
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
  'optimisememory' => false,
);

$CFG->wwwroot   = 'http://lms.sclsandbox.xyz';
$CFG->dataroot  = '/var/moodledata-prod';
$CFG->admin     = 'admin';

ini_set('session.name', 'MoodleSession');
ini_set('session.cookie_secure', false);
ini_set('session.cookie_httponly', true);

$CFG->maxbytes       = 220 * 1024 * 1024;
$CFG->userquota      = 100 * 1024 * 1024;

$CFG->debug          = DEBUG_NORMAL;
$CFG->debugdisplay   = 0;
$CFG->debugstringkeys = 0;
$CFG->cachejs        = 1;

$CFG->directorypermissions = 02777;

$CFG->smtphosts = '';
$CFG->noreplyaddress = 'noreply@scl.local';

$CFG->passwordpolicy = true;
$CFG->minpasswordlength = 8;

require_once(__DIR__ . '/lib/setup.php');
?>
EOFCONFIG

chmod 644 "$MOODLE_ROOT/config.php"
chown www-data:www-data "$MOODLE_ROOT/config.php"

echo "  Configuration created successfully"

echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "✓ Moodle Root: $MOODLE_ROOT"
echo "✓ Moodle Data: $MOODLE_DATA"
echo "✓ Database: $DB_NAME"
echo "✓ DB User: $DB_USER"
echo "✓ DB Pass: $DB_PASS"
echo "✓ Apache Port: $APACHE_PORT"
echo ""
echo "Access Moodle at:"
echo "  http://lms.sclsandbox.xyz:$APACHE_PORT"
echo ""
echo "Next: Complete the Moodle installation wizard"
echo "=========================================="
