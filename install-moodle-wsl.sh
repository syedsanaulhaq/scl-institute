#!/bin/bash

set -e

echo "==============================================="
echo "Installing LAMP Stack & Moodle 4.3 on WSL2"
echo "==============================================="

# Install Apache2
echo "[1/6] Installing Apache2..."
sudo apt-get install -y apache2 apache2-utils

# Install PHP and required extensions
echo "[2/6] Installing PHP 8.1 and extensions..."
sudo apt-get install -y php8.1 php8.1-cli php8.1-fpm php8.1-common \
  php8.1-mysql php8.1-xml php8.1-curl php8.1-gd php8.1-mbstring \
  php8.1-intl php8.1-soap php8.1-zip php8.1-ldap libapache2-mod-php8.1

# Install MariaDB client
echo "[3/6] Installing MariaDB client..."
sudo apt-get install -y mariadb-client wget

# Enable Apache modules
echo "[4/6] Enabling Apache modules..."
sudo a2enmod rewrite
sudo a2enmod php8.1
sudo a2enmod headers

# Create Moodle directories
echo "[5/6] Creating Moodle directories..."
sudo mkdir -p /var/www/moodle
sudo mkdir -p /var/moodledata
sudo chown -R www-data:www-data /var/www/moodle
sudo chown -R www-data:www-data /var/moodledata
sudo chmod -R 755 /var/www/moodle
sudo chmod -R 777 /var/moodledata

# Download Moodle 4.3 LTS
echo "[6/6] Downloading Moodle 4.3 LTS..."
cd /tmp
wget -q https://moodlecdn.moodle.org/download.php/direct/stable403/moodle-4.3.tar.gz -O moodle-4.3.tar.gz
tar -xzf moodle-4.3.tar.gz
sudo cp -r moodle/* /var/www/moodle/
sudo chown -R www-data:www-data /var/www/moodle

echo "✓ LAMP stack and Moodle installed successfully!"
echo "=================================================="
echo "Moodle files location: /var/www/moodle"
echo "Moodle data location: /var/moodledata"
