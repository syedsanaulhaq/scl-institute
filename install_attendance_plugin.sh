#!/bin/bash

# Install Attendance Plugin for Moodle 4.3
# This script downloads and installs the attendance activity module plugin

MOODLE_PATH="/bitnami/moodle"
PLUGIN_PATH="$MOODLE_PATH/mod/attendance"
PLUGIN_VERSION="4.3"

echo "Installing Attendance Plugin for Moodle $PLUGIN_VERSION..."

# Create plugins directory structure if it doesn't exist
mkdir -p "$MOODLE_PATH/mod"

# Download attendance plugin from GitHub
# The attendance plugin for Moodle 4.3
echo "Downloading attendance plugin..."
cd /tmp
rm -rf attendance-*
wget -q https://github.com/danmarsden/moodle-mod_attendance/archive/refs/heads/main.zip -O attendance.zip 2>&1 || \
  git clone --depth 1 https://github.com/danmarsden/moodle-mod_attendance.git attendance-main 2>&1

if [ -f attendance.zip ]; then
  unzip -q attendance.zip
  if [ -d "moodle-mod_attendance-main" ]; then
    cp -r moodle-mod_attendance-main "$PLUGIN_PATH"
  fi
  rm -f attendance.zip
elif [ -d "attendance-main" ]; then
  cp -r attendance-main "$PLUGIN_PATH"
fi

# Check if plugin was installed
if [ -f "$PLUGIN_PATH/version.php" ]; then
  echo "✓ Attendance plugin files copied successfully"
  ls -la "$PLUGIN_PATH/" | head -10
else
  echo "✗ Error: Plugin installation failed"
  exit 1
fi

# Set correct permissions
chown -R daemon:root "$PLUGIN_PATH"
chmod -R 755 "$PLUGIN_PATH"

echo "Installation complete!"
echo "Next: Run Moodle upgrade from admin interface or CLI:"
echo "  php /bitnami/moodle/admin/cli/upgrade.php"
