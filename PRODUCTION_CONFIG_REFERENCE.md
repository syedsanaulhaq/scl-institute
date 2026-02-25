# Production Environment Configuration Reference

This file shows the exact configuration needed for production after LAMP deployment.

---

## Production .env File

**Location:** `/path/to/scl-institute/.env` (production version)

```env
# ==================================
# Production Environment Configuration
# ==================================

# Node Environment
NODE_ENV=production
PORT=4000

# ===== SCL Institute Database =====
# This stays on Docker (unchanged)
DB_HOST=scli-mysql-prod
DB_PORT=3306
DB_USER=scl_user
DB_PASS=scl_password
DB_NAME=scl_institute

# ===== Moodle LAMP Database =====
# NEW: Points to LAMP server (after Phase 2 installation)
MOODLE_DATABASE_HOST=production-lamp-server-ip  # CHANGE THIS to actual IP
MOODLE_DATABASE_PORT=3306
MOODLE_DATABASE_USER=moodleuser
MOODLE_DATABASE_PASSWORD=moodlepass
MOODLE_DATABASE_NAME=moodle

# ===== URLs & Domains =====
MOODLE_URL=https://your-production-domain.com/moodle-prod/
VITE_API_URL=https://your-production-domain.com/api
FRONTEND_URL=https://your-production-domain.com

# ===== Security =====
SSO_SECRET=your-production-secret-key-here-change-this
SESSION_SECRET=your-session-secret-key-here-change-this

# ===== Email Configuration =====
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
MAIL_FROM=noreply@your-production-domain.com

# ===== Logging =====
LOG_LEVEL=info
DEBUG=false

# ===== Caching (Optional) =====
CACHE_PROVIDER=redis  # or 'none' if no caching
REDIS_HOST=redis-cache
REDIS_PORT=6379

# ===== File Upload Limits =====
MAX_FILE_SIZE=220M
MAX_UPLOAD_SIZE=200M

# ===== Backup & Maintenance Window =====
MAINTENANCE_MODE=false
MAINTENANCE_WINDOW=02:00-04:00  # 2-4 AM for backups

```

---

## docker-compose.prod.yml - Backend Service Update

**Section to update in `docker-compose.prod.yml`:**

```yaml
services:
  scli-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: scli-backend-prod
    restart: always
    env_file: .env
    environment:
      # SCL Database (unchanged - still Docker)
      - NODE_ENV=${NODE_ENV}
      - PORT=${PORT}
      - DB_HOST=scli-mysql-prod
      - DB_PORT=${DB_PORT}
      - DB_USER=${DB_USER}
      - DB_PASS=${DB_PASS}
      - DB_NAME=${DB_NAME}
      
      # MOODLE LAMP DATABASE (NEW - CHANGED FROM DOCKER)
      - MOODLE_DATABASE_HOST=${MOODLE_DATABASE_HOST}  # production-lamp-server-ip
      - MOODLE_DATABASE_PORT=${MOODLE_DATABASE_PORT}  # 3306
      - MOODLE_DATABASE_USER=${MOODLE_DATABASE_USER}  # moodleuser
      - MOODLE_DATABASE_PASSWORD=${MOODLE_DATABASE_PASSWORD}  # moodlepass
      - MOODLE_DATABASE_NAME=${MOODLE_DATABASE_NAME}  # moodle
      
      # URLs & Secrets
      - MOODLE_URL=${MOODLE_URL}
      - VITE_API_URL=${VITE_API_URL}
      - SSO_SECRET=${SSO_SECRET}
      
    depends_on:
      scli-mysql:
        condition: service_healthy
    networks:
      - scl-network-prod
    
    # IMPORTANT: No extra_hosts needed anymore (LAMP is on network)
    # extra_hosts:
    #   - "wsl-host:host-gateway"  # Remove this for production
    
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

---

## Production LAMP Moodle Database Credentials

**After running `install-lamp-prod.sh`, you will have:**

```
=== Production LAMP Moodle ===
Host:     production-lamp-server-ip  (or hostname)
Port:     3306
Database: moodle
User:     moodleuser
Password: moodlepass

=== MariaDB Root ===
User:     root
Password: [set during mysql_secure_installation]

=== Moodle Admin ===
Username: admin
Password: [set during Moodle installer]
```

---

## Firewall Configuration (If Needed)

**Production server needs these ports open:**

```bash
# HTTP/HTTPS (for web access)
Port 80 (HTTP)
Port 443 (HTTPS)
Port 8080 (Apache - Moodle)

# Database (Docker backend needs access)
Port 3306 (MySQL - accessible only from Docker network)

# Backend API
Port 4000 (Internal - accessed via Nginx)

# SSH (for administration)
Port 22 (SSH - restrict to your IP)

# NOT NEEDED AFTER LAMP MIGRATION:
Port 9090 (old LAMP Moodle - can be closed)
```

---

## Network Architecture After LAMP Migration

**Before (Current - Dev):**
```
Windows PowerShell
    ↓
Docker Backend Container (port 4000)
    ↓
    ├→ Docker MySQL (scli-mysql on 33062)
    │
    └→ WSL LAMP MySQL (127.0.0.1:3306) via wsl-host
       └→ /var/www/moodle-9090
```

**After (Production - LAMP):**
```
Internet
    ↓
Nginx (port 80/443)
    ├→ Frontend (port 3000)
    │
    ├→ Backend API (port 4000)
    │  ├→ Docker MySQL (scli-mysql-prod)
    │  │
    │  └→ LAMP MySQL (production-server:3306)
    │     └→ /var/www/moodle-prod
    │
    └→ Apache (port 8080)
       └→ LAMP Moodle (/var/www/moodle-prod)
```

---

## Database Synchronization Script

**After LAMP is installed, keep these in sync:**

```bash
#!/bin/bash
# Sync production Moodle database with courses
# Run this after new courses are added to Moodle

# Export latest Moodle data
mysqldump -h production-server -u moodleuser -pmoodlepass moodle \
  mdl_course mdl_enrol mdl_user_enrolments \
  > /tmp/moodle-prod-export.sql

# Import to Docker SCL database
docker exec scli-mysql-prod mysql -u scl_user -pscl_password scl_institute \
  < /tmp/moodle-prod-export.sql

# Trigger inductions sync
curl -X POST http://production-server:4000/api/inductions/sync-moodle \
  -H "Authorization: Bearer $ADMIN_TOKEN"

echo "Sync complete"
```

---

## Connection Test Commands

**Run these to verify production setup:**

```bash
# Test LAMP Moodle MySQL connection
mysql -h production-server -u moodleuser -pmoodlepass moodle -e "SELECT VERSION();"

# Test Docker backend can reach LAMP
docker exec scli-backend-prod mysql \
  -h production-lamp-server \
  -u moodleuser -pmoodlepass moodle -e "SELECT COUNT(*) as courses FROM mdl_course WHERE id > 1;"

# Test API endpoint
curl http://production-server:4000/api/inductions?from_moodle=true

# Test sync works
curl -X POST http://production-server:4000/api/inductions/sync-moodle \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Check backend logs
docker-compose -f docker-compose.prod.yml logs scli-backend | grep -i moodle
```

---

## Verification Checklist

After deploying, verify all of:

```bash
# ✓ LAMP MySQL is running
systemctl status mysql

# ✓ Apache is running
systemctl status apache2

# ✓ Moodle is accessible
curl http://localhost:8080/moodle-prod/login/index.php

# ✓ Database connectivity works
mysql -u moodleuser -pmoodlepass moodle -e "SHOW TABLES;" | head

# ✓ Docker containers are running
docker ps | grep -E "scli-(backend|mysql|frontend)"

# ✓ Backend can reach LAMP
docker logs scli-backend-prod | grep -i "moodle"

# ✓ API responds with LAMP data
curl http://localhost:4000/api/inductions | jq '.data | length'

# ✓ No connection errors in logs
docker-compose -f docker-compose.prod.yml logs scli-backend | grep -i error
```

---

## Performance Optimization (Optional)

**For production LAMP, consider:**

```bash
# PHP Configuration for Moodle
# File: /etc/php/8.x/apache2/php.ini

max_execution_time = 300
max_input_vars = 5000
memory_limit = 512M
post_max_size = 220M
upload_max_filesize = 200M

# MySQL Configuration
# File: /etc/mysql/mysql.conf.d/mysqld.cnf

[mysqld]
max_connections = 200
max_allowed_packet = 256M
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
log_bin = /var/log/mysql/mysql-bin.log
```

---

## Key Changes from Development

| Aspect | Development | Production |
|--------|-------------|-----------|
| Moodle Location | WSL LAMP | Server LAMP |
| Database Host | `wsl-host` via Docker | Direct IP/hostname |
| Extra Hosts | Required (wsl-host) | Not needed |
| Apache Port | 9090 | 8080 |
| Moodle Path | /var/www/moodle-9090 | /var/www/moodle-prod |
|  Data Path | /var/moodledata | /var/moodledata-prod |
| Database | moodle | moodle (same name) |
| User | moodleuser | moodleuser (same) |
| Password | moodlepass | moodlepass (same) |
| SSL/TLS | None (dev) | Required (prod) |
| Monitoring | Manual | Automated (recommended) |

