# Moodle 4.4 Docker Installation Guide

## Quick Start (3 Steps)

### Step 1: Prepare Your Server

SSH into your server:
```bash
ssh root@185.211.6.60
```

Ensure Docker is installed. If not:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
apt install -y docker-compose
```

### Step 2: Clone/Update Project

```bash
cd /opt/scl-institute  # or your project path
git pull origin main
```

### Step 3: Configure Environment (.env file)

Create or update `.env` file with **production credentials**:

```bash
cat > /opt/scl-institute/.env << 'EOF'
# Node Environment
NODE_ENV=production
PORT=4000
VITE_ENV=production

# MySQL Settings
MYSQL_ROOT_PASSWORD=secure_root_password_2026!
MYSQL_DATABASE=scl_institute_prod
MYSQL_USER=scl_user
MYSQL_PASSWORD=secure_db_password_2026!
DB_PORT=3306
DB_USER=scl_user
DB_PASS=secure_db_password_2026!
DB_NAME=scl_institute_prod

# Moodle Database Settings (MariaDB)
MARIADB_ROOT_PASSWORD=secure_moodle_root_2026!
MARIADB_DATABASE=bitnami_moodle_prod
MARIADB_USER=bn_moodle
MARIADB_PASSWORD=secure_moodle_password_2026!
MARIADB_CHARACTER_SET=utf8mb4
MARIADB_COLLATE=utf8mb4_unicode_ci

# Moodle Configuration
MOODLE_USERNAME=admin
MOODLE_PASSWORD=SCLInst!2026_secure_password_here
MOODLE_SITE_NAME=SCL Institute LMS

# API & Service Configuration
VITE_API_URL=http://185.211.6.60/api
MOODLE_URL=http://lms.sclsandbox.xyz
SSO_SECRET=your_super_secret_sso_key_2026
EOF
```

**⚠️ IMPORTANT:** Replace all `secure_*` values with strong passwords!

### Step 4: Run Installation Script

```bash
cd /opt/scl-institute
chmod +x scripts/install-moodle-docker.sh
./scripts/install-moodle-docker.sh
```

This script will:
- ✅ Check Docker/Docker Compose installation
- ✅ Stop existing containers
- ✅ Build Moodle 4.4 Docker image (with automatic fallback downloads)
- ✅ Start all services
- ✅ Wait for services to be ready
- ✅ Display access credentials

## What Happens During Installation

1. **Dockerfile builds Moodle 4.4 with multiple download methods:**
   - Tries official Moodle download
   - Falls back to GitHub if needed
   - Falls back to git clone if both fail
   - All PHP extensions pre-configured

2. **Containers started:**
   - `scli-mysql-prod` - Main application database
   - `scli-moodle-db-prod` - Moodle database (MariaDB)
   - `scli-moodle-prod` - **Moodle 4.4 LMS** on port 8080
   - `scli-backend-prod` - API server on port 4000
   - `scli-frontend-prod` - React app on port 3000
   - `scli-nginx-prod` - Reverse proxy on ports 80/443

3. **Automatic initialization:**
   - Databases created automatically
   - Tables initialized
   - Ready to access immediately

## Access Your Moodle Installation

After script completes (~5 minutes):

### Direct Access
```
http://185.211.6.60:8080
```

### Via NGINX (when configured)
```
http://lms.sclsandbox.xyz
```

**Initial Admin Credentials:** (from your .env file)
- Username: `admin`
- Password: (whatever you set in MOODLE_PASSWORD)

## Verification

Check all services running:
```bash
docker-compose -f docker-compose-moodle.prod.yml ps
```

View Moodle logs:
```bash
docker-compose -f docker-compose-moodle.prod.yml logs -f scli-moodle
```

Test Moodle:
```bash
docker exec scli-moodle-prod curl http://localhost/
```

## Common Issues

### Issue: "Build failed"
Check the build log:
```bash
docker-compose -f docker-compose-moodle.prod.yml build --no-cache scli-moodle
```

### Issue: "Connection refused" on first access
Wait 30-60 seconds, the Moodle installer needs time to initialize. Refresh page.

### Issue: "Database connection error"
Verify MariaDB is healthy:
```bash
docker-compose -f docker-compose-moodle.prod.yml logs scli-moodle-db-prod
```

### Issue: Can't access port 8080
Check if Apache/LAMP is still running and using the port:
```bash
ss -tlnp | grep 8080
```

If LAMP is still running, stop it:
```bash
systemctl stop apache2
systemctl stop php8.1-fpm
```

## Next Steps

### 1. Configure NGINX to proxy Moodle

Edit `nginx/nginx.conf` and add:
```nginx
upstream moodle {
    server scli-moodle:80;
}

server {
    listen 80;
    server_name lms.sclsandbox.xyz;
    
    location / {
        proxy_pass http://moodle;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Then restart NGINX:
```bash
docker-compose -f docker-compose-moodle.prod.yml restart scli-nginx-prod
```

### 2. Set Up Moodle Admin Account

On first access (`http://185.211.6.60:8080`), Moodle installer will ask you to:
1. Confirm database settings
2. Check PHP environment
3. Install plugins/language packs
4. Create site configuration

Just follow the wizard - database credentials are pre-configured.

### 3. Configure SSO Plugin

See `MOODLE_SSO_SETUP.md` for integrating your custom SSO authentication.

## Stopping/Restarting Services

Stop all services:
```bash
docker-compose -f docker-compose-moodle.prod.yml down
```

Restart all services:
```bash
docker-compose -f docker-compose-moodle.prod.yml up -d
```

Restart just Moodle:
```bash
docker-compose -f docker-compose-moodle.prod.yml restart scli-moodle-prod
```

## Backing Up Moodle

Export Moodle database:
```bash
docker-compose -f docker-compose-moodle.prod.yml exec -T scli-moodle-db-prod mysqldump -u bn_moodle -p$(grep MARIADB_PASSWORD .env | cut -d= -f2) bitnami_moodle_prod > moodle_backup_$(date +%Y%m%d).sql
```

Export Moodle files:
```bash
docker cp scli-moodle-prod:/var/moodledata ./moodledata_backup_$(date +%Y%m%d)
```

## Performance Tips

1. Increase Docker resources (in Docker Desktop settings):
   - CPUs: 4+
   - Memory: 4GB+

2. Clear Docker cache if build is slow:
```bash
docker system prune -a
```

3. Monitor resource usage:
```bash
docker stats
```

## Support Commands

Full service health:
```bash
docker-compose -f docker-compose-moodle.prod.yml ps
```

View all logs:
```bash
docker-compose -f docker-compose-moodle.prod.yml logs
```

Network inspection:
```bash
docker network inspect scl-institute_scl-network-prod
```

Database test:
```bash
docker exec scli-moodle-db-prod mysql -u bn_moodle -p"$(grep MARIADB_PASSWORD .env | cut -d= -f2)" bitnami_moodle_prod -e "SELECT 1;"
```

---

**Questions?** Check the logs and share the output:
```bash
docker-compose -f docker-compose-moodle.prod.yml logs --tail 100
```
