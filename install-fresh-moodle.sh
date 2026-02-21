#!/bin/bash

set -e

echo "Installing fresh Moodle 4.3 from backup..."

# Ensure ca-certificates
apt-get update >/dev/null 2>&1
apt-get install -y ca-certificates curl >/dev/null 2>&1

# Download Moodle 4.3 using curl with verbose flag
cd /tmp
echo "Downloading Moodle 4.3..."
ATTEMPTS=1
while [ $ATTEMPTS -le 3 ]; do
    if curl --connect-timeout 30 -m 300 --progress-bar -L \
        "https://moodlecdn.moodle.org/download.php/direct/stable403/moodle-4.3.tar.gz" \
        -o moodle-4.3.tar.gz; then
        echo "Download successful"
        break
    else
        echo "Attempt $ATTEMPTS failed, retrying..."
        ATTEMPTS=$((ATTEMPTS + 1))
        sleep 5
    fi
done

if [ ! -f moodle-4.3.tar.gz ]; then
    echo "ERROR: Could not download Moodle"
    exit 1
fi

# Extract and install
echo "Extracting Moodle..."
tar -xzf moodle-4.3.tar.gz
echo "Copying files to /var/www/moodle..."
cp -r moodle/* /var/www/moodle/
rm -rf moodle moodle-4.3.tar.gz

# Set permissions
chown -R www-data:www-data /var/www/moodle
chmod -R 755 /var/www/moodle
chmod 777 /var/moodledata

echo "✓ Fresh Moodle 4.3 installed successfully"
ls /var/www/moodle | head -5
