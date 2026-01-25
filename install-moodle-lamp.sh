#!/bin/bash

set -e

echo "==============================================="
echo "Installing LAMP Stack & Moodle 4.3 LTS"
echo "==============================================="

# Update system
echo "[1/8] Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Apache2
echo "[2/8] Installing Apache2..."
apt-get install -y apache2 apache2-utils

# Install PHP and required extensions
echo "[3/8] Installing PHP 8.1 and required extensions..."
apt-get install -y php8.1 php8.1-cli php8.1-fpm php8.1-common \
  php8.1-mysql php8.1-xml php8.1-curl php8.1-gd php8.1-mbstring \
  php8.1-intl php8.1-sqlite3 php8.1-soap php8.1-zip \
  php8.1-opcache php8.1-ldap php8.1-pspell libapache2-mod-php8.1

# Install MariaDB client (to use existing database)
echo "[4/8] Installing MariaDB client..."
apt-get install -y mariadb-client

# Enable necessary Apache modules
echo "[5/8] Enabling Apache modules..."
a2enmod rewrite
a2enmod php8.1
a2enmod headers

# Create Moodle directory
echo "[6/8] Creating Moodle directories..."
mkdir -p /var/www/moodle
mkdir -p /var/moodledata
chown -R www-data:www-data /var/www/moodle
chown -R www-data:www-data /var/moodledata
chmod -R 755 /var/www/moodle
chmod -R 777 /var/moodledata

# Download Moodle 4.3 LTS
echo "[7/8] Downloading Moodle 4.3 LTS..."
cd /tmp
# Try direct download first
wget -q https://download.moodle.org/download.php/direct/stable403/moodle-4.3.9.tgz -O moodle-4.3.tgz
if [ ! -f moodle-4.3.tgz ] || [ ! -s moodle-4.3.tgz ]; then
    echo "  Direct download failed, trying git clone..."
    apt-get install -y git
    rm -rf /tmp/moodle
    git clone --depth 1 -b MOODLE_403_STABLE https://github.com/moodle/moodle.git /tmp/moodle
    cp -r /tmp/moodle/* /var/www/moodle/
else
    tar -xzf moodle-4.3.tgz
    cp -r moodle/* /var/www/moodle/
fi
chown -R www-data:www-data /var/www/moodle/

# Create Apache virtual host configuration
echo "[8/8] Configuring Apache virtual host..."
cat > /etc/apache2/sites-available/moodle.conf << 'EOF'
<VirtualHost *:8088>
    ServerName lms.sclsandbox.xyz
    ServerAdmin admin@sclsandbox.xyz
    DocumentRoot /var/www/moodle

    <Directory /var/www/moodle>
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    <Directory /var/moodledata>
        Options FollowSymLinks
        AllowOverride All
        Require all denied
    </Directory>

    # PHP settings
    <IfModule mod_php8.1.c>
        AddType application/x-httpd-php .php
        php_value memory_limit 512M
        php_value upload_max_filesize 256M
        php_value post_max_size 256M
        php_value default_charset UTF-8
        php_value default_locale en_US.UTF-8
    </IfModule>

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/moodle_error.log
    CustomLog ${APACHE_LOG_DIR}/moodle_access.log combined
</VirtualHost>
EOF

# Enable the site
a2ensite moodle.conf

# Configure Apache to listen on port 8088
if ! grep -q "Listen 8088" /etc/apache2/ports.conf; then
    echo "Listen 8088" >> /etc/apache2/ports.conf
fi

# Test Apache configuration
apache2ctl configtest

# Restart Apache
systemctl restart apache2

echo ""
echo "==============================================="
echo "✓ LAMP Stack & Moodle Installation Complete!"
echo "==============================================="
echo ""
echo "Next steps:"
echo "1. Create Moodle database at MariaDB (3306)"
echo "2. Access http://localhost:8088/install.php"
echo "3. Complete Moodle web installer"
echo "4. Update nginx.conf to route lms.sclsandbox.xyz to localhost:8088"
echo ""
echo "Database Details (for Moodle installer):"
echo "   Host: localhost"
echo "   Database: moodle_prod"
echo "   User: Check .env.production"
echo ""
