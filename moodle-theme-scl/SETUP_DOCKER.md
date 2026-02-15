# SCL Institute Moodle Theme - Docker Setup Guide

## 🐳 Docker Installation

This guide will help you install the SCL Institute theme on a Moodle instance running in Docker.

### Prerequisites

- Docker installed and running
- Moodle container running (scli-moodle-dev or scli-moodle-prod)
- Admin access to Moodle

### Installation Methods

## Method 1: Quick Copy (Recommended)

### Step 1: Copy Theme to Docker Container

```bash
# For Development Environment
docker cp moodle-theme-scl scli-moodle-dev:/bitnami/moodle/theme/scl

# For Production Environment
docker cp moodle-theme-scl scli-moodle-prod:/bitnami/moodle/theme/scl
```

### Step 2: Verify Files

```bash
# Check if files were copied correctly
docker exec scli-moodle-dev ls -la /bitnami/moodle/theme/scl

# You should see:
# version.php
# config.php
# README.md
# style/
# db/
# lang/
```

### Step 3: Clear Cache

```bash
# This triggers Moodle to detect the new theme
docker exec scli-moodle-dev bash -c "cd /bitnami/moodle && php admin/cli/purge_caches.php"
```

## Method 2: Docker Compose Integration

### Option A: Mount as Volume

Edit your `docker-compose.yml`:

```yaml
services:
  moodle:
    image: bitnami/moodle:latest
    volumes:
      - ./moodle-theme-scl:/bitnami/moodle/theme/scl
    # ... other configs
```

Then restart:

```bash
docker-compose down
docker-compose up -d
```

### Option B: Volume Copy During Build

Add to your Dockerfile:

```dockerfile
FROM bitnami/moodle:latest

# Copy SCL theme
COPY moodle-theme-scl /bitnami/moodle/theme/scl

# Set permissions
RUN chmod -R 755 /bitnami/moodle/theme/scl
```

Build and run:

```bash
docker build -t moodle-scl .
docker run -d moodle-scl
```

## Method 3: Using Moodle Web Interface

### Step 1: Prepare Theme

Package the theme:

```bash
tar -czf scl-theme.tar.gz moodle-theme-scl/
```

### Step 2: Upload via Web

1. Login to Moodle as Admin
2. Go to **Site Administration → Plugins → Install plugins**
3. **Choose a plugin type**: Theme (from dropdown)
4. **Upload ZIP file**: Upload `scl-theme.tar.gz`
5. **Install plugin**

### Step 3: Activate Theme

1. Go to **Site Administration → Appearance → Themes → Theme Selector**
2. Find and select "SCL Institute"
3. Click **Use theme**

---

## ✅ Activation in Moodle

### Step 1: Login as Administrator

```
URL: http://localhost:9090
Username: admin
Password: bitnami (or your configured password)
```

### Step 2: Access Theme Selector

Navigate to:
```
Site Administration 
  → Appearance 
    → Themes 
      → Theme Selector
```

Or direct URL:
```
http://localhost:9090/admin/settings.php?section=themeselector
```

### Step 3: Select SCL Theme

1. Under "Available themes", look for **"SCL Institute"**
2. Click on it
3. Click **"Use theme"** button
4. Confirm by clicking **"Save changes"**

### Step 4: Verify Installation

1. Logout from admin panel
2. Navigate to login page or dashboard
3. You should see the purple SCL color scheme
4. Check:
   - Purple navigation bar
   - Purple gradient buttons
   - Blue sidebar blocks
   - Professional styling on courses

---

## 🔧 Container Commands Reference

### Check Theme Installation

```bash
# List theme directory
docker exec scli-moodle-dev ls -la /bitnami/moodle/theme/scl

# Check file ownership
docker exec scli-moodle-dev stat /bitnami/moodle/theme/scl
```

### View Moodle Logs

```bash
# Show last 50 lines of logs
docker logs scli-moodle-dev | tail -50

# Follow logs in real-time
docker logs -f scli-moodle-dev

# Search for theme-related messages
docker logs scli-moodle-dev | grep -i theme
```

### Clear Caches

```bash
# Using Moodle CLI
docker exec scli-moodle-dev bash -c "cd /bitnami/moodle && php admin/cli/purge_caches.php"

# Using Docker volume (if applicable)
docker exec scli-moodle-dev rm -rf /bitnami/moodle/cache/*
docker exec scli-moodle-dev rm -rf /bitnami/moodle/localcache/*
```

### Update Theme Files

After making changes to theme files:

```bash
# Copy updated files
docker cp moodle-theme-scl scli-moodle-dev:/bitnami/moodle/theme/scl

# Clear cache
docker exec scli-moodle-dev bash -c "cd /bitnami/moodle && php admin/cli/purge_caches.php"
```

### Reset to Default Theme

If needed to revert:

```bash
# Access Moodle database
docker exec -it scli-moodle-db-dev mysql -uroot -p

# In MySQL console:
# UPDATE mdl_config SET value='boost' WHERE name='theme';
```

---

## 📊 Troubleshooting

### Problem: Theme Not Appearing

**Solution:**

1. Clear all caches:
```bash
docker exec scli-moodle-dev bash -c "cd /bitnami/moodle && php admin/cli/purge_caches.php"
```

2. Hard refresh browser:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. Try incognito/private window

### Problem: 404 - Theme Not Found

**Solution:**

1. Verify file location:
```bash
docker exec scli-moodle-dev ls /bitnami/moodle/theme/scl/version.php
```

2. Check file permissions:
```bash
docker exec scli-moodle-dev chmod -R 755 /bitnami/moodle/theme/scl
```

3. Restart container:
```bash
docker restart scli-moodle-dev
```

### Problem: Styling Not Applied

**Solution:**

1. Hard refresh browser cache
2. Check browser dev console (F12) for CSS errors
3. Verify CSS file is loaded:
```bash
docker exec scli-moodle-dev test -f /bitnami/moodle/theme/scl/style/scl.css && echo "CSS file exists"
```

4. Check web server logs:
```bash
docker logs scli-moodle-nginx-dev | grep -i 404
```

### Problem: Database Connection Error

**Solution:**

```bash
# Restart database container
docker restart scli-moodle-db-dev

# Restart Moodle container
docker restart scli-moodle-dev

# Wait 30 seconds and try again
sleep 30
```

---

## 🚀 Quick Start Script

Create a file `install-scl-theme.sh`:

```bash
#!/bin/bash

CONTAINER="scli-moodle-dev"
THEMES_DIR="/bitnami/moodle/theme"

echo "Installing SCL Institute Theme..."
echo "=================================="

# Copy theme
echo "Copying theme files..."
docker cp moodle-theme-scl $CONTAINER:$THEMES_DIR/scl

# Set permissions
echo "Setting permissions..."
docker exec $CONTAINER chmod -R 755 $THEMES_DIR/scl

# Clear caches
echo "Clearing caches..."
docker exec $CONTAINER bash -c "cd /bitnami/moodle && php admin/cli/purge_caches.php"

# Verify
echo "Verifying installation..."
docker exec $CONTAINER test -f $THEMES_DIR/scl/version.php && echo "✓ Theme installed successfully" || echo "✗ Installation failed"

echo ""
echo "=================================="
echo "Installation complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Login to Moodle: http://localhost:9090"
echo "2. Go to: Admin → Appearance → Themes → Theme Selector"
echo "3. Select 'SCL Institute' theme"
echo "4. Click 'Use theme' and save"
echo ""
```

Run the script:

```bash
chmod +x install-scl-theme.sh
./install-scl-theme.sh
```

---

## 📝 Docker Compose Configuration Example

```yaml
version: '3.8'

services:
  moodle-db:
    image: 'bitnami/mariadb:latest'
    volumes:
      - 'moodle_db_data:/bitnami/mariadb'
    environment:
      - MARIADB_ROOT_PASSWORD=moodleroot
      - MARIADB_DATABASE=bitnami_moodle
    networks:
      - scl-network

  moodle:
    image: 'bitnami/moodle:latest'
    ports:
      - '9090:8080'
    depends_on:
      - moodle-db
    volumes:
      - 'moodle_data:/bitnami/moodle'
      - 'moodledata_data:/bitnami/moodledata'
      # Mount SCL theme
      - './moodle-theme-scl:/bitnami/moodle/theme/scl'
    environment:
      - MOODLE_USERNAME=admin
      - MOODLE_PASSWORD=SCLInst!2026
      - MOODLE_EMAIL=admin@sclsandbox.xyz
      - MARIADB_HOST=moodle-db
      - MARIADB_PORT_NUMBER=3306
      - MARIADB_ROOT_PASSWORD=moodleroot
      - MARIADB_DATABASE=bitnami_moodle
    networks:
      - scl-network

volumes:
  moodle_db_data:
  moodle_data:
  moodledata_data:

networks:
  scl-network:
    driver: bridge
```

---

## ✨ Verification Checklist

- [ ] Theme files copied to container
- [ ] Files have correct permissions (755)
- [ ] Moodle caches cleared
- [ ] Theme appears in Theme Selector
- [ ] Theme can be activated without errors
- [ ] Purple color scheme displays on login page
- [ ] Navigation bar shows purple gradient
- [ ] Buttons styled correctly
- [ ] Course cards display properly
- [ ] Responsive design works on mobile

---

## 📞 Support

If you encounter issues:

1. Check Moodle logs: `docker logs scli-moodle-dev`
2. Verify theme files: `docker exec scli-moodle-dev ls /bitnami/moodle/theme/scl`
3. Check database: Ensure Moodle database is running
4. Clear browser cache and try again
5. Contact: admin@sclsandbox.xyz

---

**Last Updated**: February 13, 2026  
**Theme Version**: 1.0  
**Moodle Version**: 4.1+
