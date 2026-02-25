# Production Deployment Plan - LAMP Migration

**Status:** Planning Phase  
**Date:** February 25, 2026  
**Strategy:** Parallel LAMP environment with gradual Docker→LAMP migration

---

## Phase 1: Pre-Deployment Backup (Critical)

### 1.1 Backup Current Production Docker Environment

**Location:** Production Server

```bash
# Create backup directory with timestamp
BACKUP_DIR="/backups/production-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup Docker volumes
docker run --rm \
  -v scli_mysql_data_prod:/data \
  -v $BACKUP_DIR:/backup \
  mysql:8.0 tar czf /backup/scli-mysql-prod-$(date +%Y%m%d-%H%M%S).tar.gz /data

docker run --rm \
  -v scli_moodle_db_data_prod:/data \
  -v $BACKUP_DIR:/backup \
  mysql:8.0 tar czf /backup/moodle-db-prod-$(date +%Y%m%d-%H%M%S).tar.gz /data

docker run --rm \
  -v scli_moodle_data_prod:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/moodle-files-prod-$(date +%Y%m%d-%H%M%S).tar.gz /data

# Backup docker-compose.prod.yml
cp docker-compose.prod.yml $BACKUP_DIR/docker-compose.prod.yml.backup

# Document current Docker state
docker ps -a > $BACKUP_DIR/docker-containers-state.txt
docker volumes ls > $BACKUP_DIR/docker-volumes-state.txt

# Store backup location
echo "Backups created at: $BACKUP_DIR" > $BACKUP_DIR/BACKUP_INFO.txt
ls -lh $BACKUP_DIR >> $BACKUP_DIR/BACKUP_INFO.txt
```

### 1.2 Backup Database Exports

**Export Production SCL Database:**
```bash
docker exec scli-mysql-prod mysqldump -u scl_user -pscl_password scl_institute > \
  /backups/scl_institute_prod_$(date +%Y%m%d).sql
```

**Export Production Moodle Database:**
```bash
docker exec scli-moodle-db-prod mysqldump -u bn_moodle -pbitnami_moodle_password bitnami_moodle > \
  /backups/bitnami_moodle_prod_$(date +%Y%m%d).sql
```

---

## Phase 2: Install LAMP Environment on Production Server

### 2.1 Install LAMP Stack

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Apache
sudo apt install -y apache2
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl start apache2
sudo systemctl enable apache2

# Install MySQL/MariaDB
sudo apt install -y mariadb-server
sudo mysql_secure_installation
sudo systemctl start mysql
sudo systemctl enable mysql

# Install PHP
sudo apt install -y php php-cli php-common php-mysql php-zip php-gd \
  php-xml php-curl php-mbstring php-json php-sockets php-fpm

# Create MySQL user for Moodle
sudo mysql -u root << EOF
CREATE USER 'moodleuser'@'localhost' IDENTIFIED BY 'moodlepass';
CREATE DATABASE moodle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,CREATE TEMPORARY TABLES,DROP,INDEX,ALTER,CREATE VIEW,SHOW VIEW ON moodle.* TO 'moodleuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
```

### 2.2 Install Moodle 4.5 on LAMP

```bash
# Create Moodle directory
sudo mkdir -p /var/www/moodle-prod
sudo chown -R $USER:$USER /var/www/moodle-prod

# Download Moodle 4.5 (same version as dev)
cd /var/www/moodle-prod
git clone -b MOODLE_405_STABLE https://github.com/moodle/moodle.git .

# Create Moodle data directory
sudo mkdir -p /var/moodledata-prod
sudo chown -R www-data:www-data /var/moodledata-prod
sudo chmod 770 /var/moodledata-prod

# Configure Apache for Moodle
sudo tee /etc/apache2/sites-available/moodle-prod.conf > /dev/null << EOF
<VirtualHost *:8080>
    ServerName moodle-prod.local
    DocumentRoot /var/www/moodle-prod

    <Directory /var/www/moodle-prod>
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/moodle-prod-error.log
    CustomLog \${APACHE_LOG_DIR}/moodle-prod-access.log combined
</VirtualHost>
EOF

sudo a2ensite moodle-prod.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

### 2.3 Configure Moodle

Access `http://server-ip:8080/moodle-prod/install.php` and configure with:
- **Database:** moodle
- **User:** moodleuser
- **Password:** moodlepass
- **Port:** 3306
- **Admin Username:** admin
- **Admin Password:** [Set your own secure password]
- **Site Name:** SCL Institute LMS (Production)

### 2.4 Install Attendance Plugin (Same as Dev)

```bash
cd /var/www/moodle-prod/mod
git clone -b MOODLE_405_STABLE https://github.com/danmarsden/moodle-mod_attendance.git attendance

# Run upgrade
cd /var/www/moodle-prod
php admin/cli/upgrade.php
```

---

## Phase 3: Sync Development LAMP to Production LAMP

### 3.1 Export Development Moodle Data

**On Development Server:**
```bash
# Export dev Moodle database (local LAMP)
mysqldump -u moodleuser -pmoodlepass moodle > /tmp/moodle_dev_export.sql

# Copy to production (via scp/rsync)
rsync -avz /tmp/moodle_dev_export.sql user@prod-server:/tmp/
```

### 3.2 Import to Production Moodle

**On Production Server:**
```bash
# IMPORTANT: Delete all default courses first (keep system data)
mysql -u moodleuser -pmoodlepass moodle << EOF
-- Delete non-system courses
DELETE FROM mdl_course WHERE id > 1;
DELETE FROM mdl_enrol WHERE courseid > 1;
DELETE FROM mdl_user_enrolments WHERE enrolid NOT IN (SELECT id FROM mdl_enrol);
EOF

# Import dev data
mysql -u moodleuser -pmoodlepass moodle < /tmp/moodle_dev_export.sql

# Verify import
mysql -u moodleuser -pmoodlepass moodle -e "SELECT COUNT(*) as total_courses FROM mdl_course; SELECT COUNT(*) as total_users FROM mdl_user;"
```

### 3.3 Import SCL Inductions Data

**On Production Server:**
```bash
# Export dev SCL inductions (from Docker)
docker exec scli-mysql mysqldump -u scl_user -pscl_password scl_institute \
  course_inductions course_induction_requirements course_induction_requirement_templates \
  course_induction_signoffs course_induction_conditions course_induction_risks > /tmp/inductions_export.sql

# Create SCL database on production LAMP MySQL
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS scl_institute CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'scl_user'@'localhost' IDENTIFIED BY 'scl_password';
GRANT ALL PRIVILEGES ON scl_institute.* TO 'scl_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Import inductions
mysql -u scl_user -pscl_password scl_institute < /tmp/inductions_export.sql
```

---

## Phase 4: Deploy Backend to Production (LAMP-Ready)

### 4.1 Create Production .env

**File:** `/path/to/backend/.env.production`

```env
# Production Environment
NODE_ENV=production
PORT=4000

# SCL Database (Docker - unchanged for now)
DB_HOST=scli-mysql-prod
DB_PORT=3306
DB_USER=scl_user
DB_PASS=scl_password
DB_NAME=scl_institute

# Moodle Database (LAMP - NEW!)
MOODLE_DATABASE_HOST=production-server-ip
MOODLE_DATABASE_PORT=3306
MOODLE_DATABASE_USER=moodleuser
MOODLE_DATABASE_PASSWORD=moodlepass
MOODLE_DATABASE_NAME=moodle

# URLs
MOODLE_URL=https://production-domain.com/moodle-prod/
VITE_API_URL=https://production-domain.com/api
SSO_SECRET=your-production-secret-here
```

### 4.2 Update Backend Docker Service (Temporary)

**File:** `docker-compose.prod.yml`

```yaml
  scli-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: scli-backend-prod
    restart: always
    env_file: .env
    environment:
      - NODE_ENV=${NODE_ENV}
      - PORT=${PORT}
      - DB_HOST=scli-mysql-prod
      - DB_PORT=${DB_PORT}
      - DB_USER=${DB_USER}
      - DB_PASS=${DB_PASS}
      - DB_NAME=${DB_NAME}
      - MOODLE_DATABASE_HOST=production-lamp-server
      - MOODLE_DATABASE_PORT=3306
      - MOODLE_DATABASE_USER=moodleuser
      - MOODLE_DATABASE_PASSWORD=moodlepass
      - MOODLE_DATABASE_NAME=moodle
      - MOODLE_URL=https://production-domain.com/moodle-prod/
      - SSO_SECRET=${SSO_SECRET}
      - VITE_API_URL=${VITE_API_URL}
    depends_on:
      scli-mysql:
        condition: service_healthy
    networks:
      - scl-network-prod
    healthcheck:
      test: [ "CMD", "wget", "-q", "--spider", "http://127.0.0.1:4000/api/health" ]
      timeout: 10s
      retries: 5
      start_period: 20s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4.3 Deploy & Test

```bash
# Update code
git pull origin production

# Rebuild backend with new config
docker-compose -f docker-compose.prod.yml up -d scli-backend --build

# Test connection
curl -X GET http://production-server:4000/api/health
curl -X GET http://production-server:4000/api/inductions?from_moodle=true

# Check logs
docker-compose -f docker-compose.prod.yml logs -f scli-backend
```

---

## Phase 5: Verify Data Integrity

### 5.1 Verify Inductions Sync

```bash
# Test sync from LAMP to SCL database
curl -X POST http://production-server:4000/api/inductions/sync-moodle \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Check results
docker exec scli-mysql-prod mysql -u scl_user -pscl_password scl_institute -e \
  "SELECT COUNT(*) as total_inductions FROM course_inductions WHERE moodle_course_id IS NOT NULL;"
```

### 5.2 Verify Requirements

```bash
docker exec scli-mysql-prod mysql -u scl_user -pscl_password scl_institute -e \
  "SELECT 'Requirements' AS Type, COUNT(*) AS Count FROM course_induction_requirements 
   UNION ALL SELECT 'Sign-offs' AS Type, COUNT(*) AS Count FROM course_induction_signoffs;"
```

---

## Phase 6: Graduate Cutover (Later - When LAMP Proven)

Once LAMP is stable for 1+ week:

### 6.1 Disable Docker Moodle

```bash
# Stop Docker Moodle (keep running until verified)
docker-compose -f docker-compose.prod.yml stop scli-moodle scli-moodle-db

# Remove from compose (comment out or delete)
# Update docker-compose.prod.yml to remove moodle services
```

### 6.2 Point Everything to LAMP

```yaml
# Update all environment variables across services to point to LAMP Moodle
MOODLE_DATABASE_HOST=production-lamp-server
MOODLE_DATABASE_PORT=3306
```

### 6.3 Archive Docker Moodle Data

```bash
# Keep backups of Docker Moodle volumes for 90 days
tar czf /backups/moodle-docker-final-archive-$(date +%Y%m%d).tar.gz \
  /var/lib/docker/volumes/scli_moodle_db_data_prod/_data
```

---

## Rollback Plan

If anything fails:

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restore from backup
docker run --rm \
  -v scli_mysql_data_prod:/data \
  -v /backups:/backup \
  mysql:8.0 tar xzf /backup/scli-mysql-prod-<timestamp>.tar.gz

# Restart Docker Moodle
docker-compose -f docker-compose.prod.yml up -d scli-moodle scli-moodle-db

# Verify
docker-compose -f docker-compose.prod.yml logs scli-moodle
```

---

## Deployment Checklist

- [ ] **Phase 1:** Backup current Docker environment
- [ ] **Phase 2:** Install LAMP + Moodle on production  
- [ ] **Phase 3:** Sync dev LAMP to prod LAMP
- [ ] **Phase 4:** Update backend config & deploy
- [ ] **Phase 5:** Verify all data synced correctly
- [ ] **Phase 6:** Monitor for 1 week, then disable Docker Moodle
- [ ] **Phase 7:** Archive Docker Moodle data
- [ ] **Phase 8:** Update DNS/load balancer to point to LAMP HTTPS

---

## Timeline

- **Phase 1-2:** 2-3 hours (LAMP install)
- **Phase 3:** 30-60 minutes (data sync)
- **Phase 4:** 30 minutes (deploy backend)
- **Phase 5:** 30 minutes (verification)
- **Phase 6:** 1+ week of monitoring after approval
- **Total:** ~1 week including monitoring buffer

---

## Next Steps

1. ✅ Confirm production server credentials and access
2. ✅ Take full backup (I'll prepare backup script)
3. ✅ Install LAMP stack
4. ✅ Sync dev Moodle courses to prod
5. ✅ Deploy backend with LAMP config
6. ✅ Test end-to-end
7. ✅ Monitor for stability
8. ✅ Migrate SSO to LAMP
9. ✅ Disable Docker Moodle

**Ready to proceed? Provide:**
- Production server IP/hostname
- SSH credentials (or confirm access method)
- Admin password for Moodle
