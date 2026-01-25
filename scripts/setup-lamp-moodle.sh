#!/bin/bash
# Install Moodle 4.3 on LAMP Stack (Linux, Apache, MySQL, PHP)
# For production server at 185.211.6.60

set -e

echo "====================================="
echo "Installing Moodle 4.3 on LAMP Stack"
echo "====================================="

# Step 1: Install Apache
echo "[1/8] Installing Apache Web Server..."
apt-get update
apt-get install -y apache2 apache2-utils

# Add Ondrej PHP PPA (required for PHP 8.2)
echo "[1.5/8] Adding PHP PPA..."
apt-get install -y software-properties-common
add-apt-repository -y ppa:ondrej/php
apt-get update

# Step 2: Install PHP 8.2 (required for Moodle 4.3)
echo "[2/8] Installing PHP 8.2..."
apt-get install -y php8.2 php8.2-fpm php8.2-cli php8.2-common
apt-get install -y php8.2-mysql php8.2-gd php8.2-imap php8.2-ldap
apt-get install -y php8.2-curl php8.2-zip php8.2-xml php8.2-intl
apt-get install -y php8.2-fileinfo php8.2-mbstring php8.2-soap
apt-get install -y php8.2-xmlrpc php8.2-cgi php8.2-redis

# Step 3: Configure PHP settings for Moodle
echo "[3/8] Configuring PHP for Moodle..."
php_ini="/etc/php/8.2/apache2/php.ini"
sed -i "s/upload_max_filesize = 2M/upload_max_filesize = 100M/" $php_ini
sed -i "s/post_max_size = 8M/post_max_size = 100M/" $php_ini
sed -i "s/max_execution_time = 30/max_execution_time = 300/" $php_ini
sed -i "s/default_socket_timeout = 60/default_socket_timeout = 300/" $php_ini
sed -i "s/;date.timezone =/date.timezone = UTC/" $php_ini

# Enable mod_rewrite for Moodle
echo "[4/8] Enabling Apache modules..."
a2enmod rewrite
a2enmod php8.2
a2enmod ssl
a2enmod proxy
a2enmod proxy_http
a2enmod headers

# Step 5: Download Moodle 4.3
echo "[5/8] Downloading Moodle 4.3..."
cd /var/www
wget -q https://download.moodle.org/download.php/direct/stable43/moodle-4.3.tar.gz
tar -xzf moodle-4.3.tar.gz
rm moodle-4.3.tar.gz

# Step 6: Create Moodle data directory
echo "[6/8] Creating Moodle data directory..."
mkdir -p /var/moodledata
chown -R www-data:www-data /var/www/moodle
chown -R www-data:www-data /var/moodledata
chmod 0750 /var/www/moodle
chmod 0750 /var/moodledata

# Step 7: Create Apache virtual host configuration
echo "[7/8] Configuring Apache virtual host..."
cat > /etc/apache2/sites-available/moodle.conf << 'EOF'
<VirtualHost *:8080>
    ServerName lms.sclsandbox.xyz
    DocumentRoot /var/www/moodle
    
    <Directory /var/www/moodle>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.php?/$1 [QSA,L]
    </Directory>
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/moodle_error.log
    CustomLog ${APACHE_LOG_DIR}/moodle_access.log combined
    
    # PHP FPM configuration
    <FilesMatch \.php$>
        SetHandler "proxy:unix:/run/php/php8.2-fpm.sock|fcgi://localhost/"
    </FilesMatch>
</VirtualHost>
EOF

a2ensite moodle.conf

# Step 8: Configure Apache to listen on port 8080 for Moodle
echo "[8/8] Configuring Apache ports..."
sed -i '$ a\Listen 8080' /etc/apache2/ports.conf

# Test Apache configuration
apache2ctl configtest

# Restart Apache
systemctl restart apache2
systemctl restart php8.2-fpm

echo ""
echo "====================================="
echo "✅ LAMP Stack with Moodle 4.3 Installed"
echo "====================================="
echo ""
echo "Next Steps:"
echo "1. Visit: http://185.211.6.60:8080/moodle"
echo "2. Complete Moodle setup wizard"
echo "3. Database Host: scli-moodle-db-prod"
echo "4. Database Name: bitnami_moodle_prod"
echo "5. Database User: bn_moodle"
echo "6. Database Password: MoodleDBPass2026!"
echo ""
echo "Apache is listening on port 8080"
echo "NGINX will proxy from lms.sclsandbox.xyz:443 -> localhost:8080"
echo ""
