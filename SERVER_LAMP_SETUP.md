# Server LAMP + Moodle Setup Instructions

Since Docker Moodle is having initialization issues, we'll install Moodle natively using LAMP.

## Step 1: SSH into Server
```bash
ssh root@185.211.6.60
```

## Step 2: Stop Docker Moodle (if running)
```bash
cd /opt/scl-institute
docker-compose -f docker-compose.prod.yml down scli-moodle
```

## Step 3: Run LAMP Installation Script
```bash
bash /opt/scl-institute/install-moodle-lamp.sh
```

This will:
- Install Apache2, PHP 8.1, MariaDB client
- Download and extract Moodle 4.3 LTS
- Configure Apache virtual host on port **8088**
- Create `/var/www/moodle` and `/var/moodledata` directories

**Estimated time: 10-15 minutes**

## Step 4: Access Moodle Installer
Once the script completes, access the Moodle installer:
```
http://185.211.6.60:8088/install.php
```

Follow the Moodle web installer:
1. Select language
2. Confirm paths (should auto-populate)
3. Choose database type: **MariaDB (native/mariadb)**
4. Enter database details from `.env.production`:
   - Host: localhost
   - Database: moodle_prod (or as configured)
   - User: Check `DB_USER` in `.env.production`
   - Password: Check `DB_PASS` in `.env.production`
5. Complete admin account setup

## Step 5: Copy SSO Plugin
Once Moodle installation is complete, copy the SSO plugin:
```bash
cp /opt/scl-institute/moodle-scripts/local/sclsso /var/www/moodle/local/
```

## Step 6: Update Backend 
Pull the latest code with LAMP configuration:
```bash
cd /opt/scl-institute
git pull origin main
cp .env.production .env
docker-compose -f docker-compose.prod.yml restart scli-backend
```

## Verification
Test the LMS SSO:
1. Access your frontend: http://sclsandbox.xyz
2. Login with admin@scl.com / password
3. Click "Learning Management (Moodle)" card
4. Should redirect to: http://185.211.6.60:8088/local/sclsso/login.php?token={token}
5. Should auto-login to Moodle dashboard

## Troubleshooting
- Check Apache logs: `tail -f /var/log/apache2/moodle_error.log`
- Check Moodle logs: `tail -f /var/www/moodle/moodledata/temp/log.txt`
- Verify port 8088: `ss -tlnp | grep 8088`

---
**Note:** This is a native installation, not Docker. It will persist across server restarts.
