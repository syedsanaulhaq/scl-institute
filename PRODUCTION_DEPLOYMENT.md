# SCL Institute - Production Server Deployment Guide

**Date**: January 24, 2026  
**Server IP**: 185.211.6.60  
**Frontend Domain**: sclsandbox.xyz  
**LMS Domain**: lms.sclsandbox.xyz  
**Backend API**: http://185.211.6.60/api or http://sclsandbox.xyz/api  

---

## 📋 Pre-Deployment Checklist

- [ ] Server access via SSH (user: root or sudo capable)
- [ ] Ubuntu/Debian Linux (20.04 LTS or newer recommended)
- [ ] Minimum 4GB RAM, 20GB disk space
- [ ] Port 80 (HTTP) and 443 (HTTPS) available
- [ ] Git installed on server
- [ ] Domain DNS records ready to update

---

## 🚀 Step 1: Connect to Your Server

```bash
# Via SSH
ssh -i /path/to/key root@185.211.6.60
# or
ssh root@185.211.6.60
```

---

## 🔧 Step 2: Run Automated Setup Script

The easiest way is to use the provided deployment script:

```bash
# Download and run the setup script
wget https://raw.githubusercontent.com/syedsanaulhaq/scl-institute/main/scripts/deploy-server.sh -O /tmp/deploy-server.sh
chmod +x /tmp/deploy-server.sh
sudo /tmp/deploy-server.sh
```

**The script will:**
1. ✓ Update system packages
2. ✓ Install Docker and Docker Compose
3. ✓ Clone the project repository
4. ✓ Setup environment files
5. ✓ Build Docker images
6. ✓ Start all services
7. ✓ Verify everything is running

---

## 📝 Step 3: Manual Setup (If Needed)

If you prefer to set up manually, follow these steps:

### 3.1 Install Dependencies

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### 3.2 Clone Project

```bash
# Create project directory
sudo mkdir -p /opt/scl-institute
cd /opt/scl-institute

# Clone repository
sudo git clone https://github.com/syedsanaulhaq/scl-institute.git .

# Checkout main (production) branch
sudo git checkout main
```

### 3.3 Setup Environment

The `.env.production` file is already configured, but you should review and update:

```bash
sudo nano /opt/scl-institute/.env.production
```

**Update these values:**
```env
# Database passwords (use strong passwords!)
DB_PASS=YourSecurePassword123!
MYSQL_PASSWORD=YourSecurePassword123!
MYSQL_ROOT_PASSWORD=YourSecureRootPass456!

# Moodle Database
MARIADB_PASSWORD=YourMoodlePass789!
MARIADB_ROOT_PASSWORD=YourMoodleRootPass000!

# Security
SSO_SECRET=YourUniqueSSO_Secret_Key_Here

# Moodle Admin
MOODLE_PASSWORD=YourMoodleAdminPass!
```

### 3.4 Create Data Directories

```bash
mkdir -p /opt/scl-institute/data/{mysql,moodle,moodle-db}
chmod 755 /opt/scl-institute/data/*
```

### 3.5 Build and Start Services

```bash
cd /opt/scl-institute

# Build Docker images
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services in background
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to fully start
sleep 15

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

---

## ✅ Step 4: Verify Installation

### 4.1 Check Running Containers

```bash
docker ps

# Expected output should show:
# - scli-frontend-prod
# - scli-backend-prod
# - scli-mysql-prod
# - scli-moodle-prod
# - scli-moodle-db-prod
# - scli-nginx-prod
```

### 4.2 Test Services

```bash
# Test frontend
curl -I http://localhost:3000

# Test backend API
curl http://localhost:4000/api/health

# Test Moodle
curl -I http://localhost:8080

# Test NGINX (should work after DNS is configured)
curl -I http://185.211.6.60/api/
```

### 4.3 View Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# View specific service logs
docker-compose -f docker-compose.prod.yml logs scli-backend-prod
docker-compose -f docker-compose.prod.yml logs scli-moodle-prod

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🌐 Step 5: Configure Domain Names

### 5.1 Update DNS Records

Point your domains to the server IP: **185.211.6.60**

In your DNS provider, create these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | sclsandbox.xyz | 185.211.6.60 | 3600 |
| A | lms.sclsandbox.xyz | 185.211.6.60 | 3600 |
| A | www.sclsandbox.xyz | 185.211.6.60 | 3600 |

**Wait 5-15 minutes for DNS propagation**

### 5.2 Test Domain Access

```bash
# Test from server
curl -H "Host: sclsandbox.xyz" http://localhost
curl -H "Host: lms.sclsandbox.xyz" http://localhost

# Test from your local machine (after DNS propagates)
curl http://sclsandbox.xyz
curl http://lms.sclsandbox.xyz
```

---

## 🔐 Step 6: Setup SSL/HTTPS (Recommended)

### 6.1 Install Certbot

```bash
sudo apt-get install certbot python3-certbot-nginx -y
```

### 6.2 Generate Certificates

```bash
# For frontend domain
sudo certbot certonly --standalone -d sclsandbox.xyz -d www.sclsandbox.xyz

# For LMS domain
sudo certbot certonly --standalone -d lms.sclsandbox.xyz
```

### 6.3 Update NGINX Configuration (Optional for Advanced Setup)

Update `/opt/scl-institute/nginx/nginx.conf` to redirect HTTP to HTTPS:

```nginx
# Add SSLredirect blocks (see NGINX documentation)
```

### 6.4 Restart NGINX

```bash
docker-compose -f docker-compose.prod.yml restart scli-nginx-prod
```

---

## 📊 Step 7: Database Configuration

### 7.1 Access MySQL

```bash
# Connect to MySQL container
docker exec -it scli-mysql-prod mysql -u root -p

# Enter password: (from MYSQL_ROOT_PASSWORD in .env.production)
```

### 7.2 Create Databases and Users

```sql
-- Everything should be auto-created, but verify:
SHOW DATABASES;
SHOW USERS;
EXIT;
```

### 7.3 Database Backups

```bash
# Create backup directory
mkdir -p /opt/scl-institute/backups

# Backup MySQL
docker exec scli-mysql-prod mysqldump -u root -p$(grep MYSQL_ROOT_PASSWORD /opt/scl-institute/.env.production | cut -d= -f2) --all-databases > /opt/scl-institute/backups/mysql-backup-$(date +%Y%m%d-%H%M%S).sql

# Setup automatic backups (cron job)
# Add to: crontab -e
# 0 2 * * * docker exec scli-mysql-prod mysqldump -u root -p<password> --all-databases > /opt/scl-institute/backups/mysql-backup-$(date +\%Y\%m\%d-\%H\%M\%S).sql
```

---

## 🚀 Step 8: Access Your Services

Once DNS has propagated:

| Service | URL | Username | Password |
|---------|-----|----------|----------|
| Frontend | http://sclsandbox.xyz | - | - |
| Frontend API | http://sclsandbox.xyz/api | - | - |
| API (Direct IP) | http://185.211.6.60/api | - | - |
| Moodle LMS | http://lms.sclsandbox.xyz | admin | SCLInst!2026 |

### 8.1 Default Credentials

**SCL Institute Login:**
```
Email: admin@scl.com
Password: password
```

**Moodle Admin:**
```
Username: admin
Password: SCLInst!2026
```

---

## 📝 Step 9: Update Deployment Process

### 9.1 When Code Changes in GitHub

Once you merge a Pull Request to the `main` branch:

```bash
# SSH into server
ssh root@185.211.6.60

# Run update script
cd /opt/scl-institute
bash ./scripts/update-server.sh

# Or manually:
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### 9.2 Recommended: Setup Automatic Deployment

You can setup GitHub Actions or webhooks to automatically deploy when code is pushed to main.

---

## 🔍 Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check specific service
docker-compose -f docker-compose.prod.yml logs scli-backend-prod

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Full restart (clean)
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Moodle Installation Stuck

```bash
# Moodle may take 5-10 minutes to start initially
# Monitor logs:
docker-compose -f docker-compose.prod.yml logs -f scli-moodle-prod

# Wait for "Moodle ready" message
```

### Database Connection Errors

```bash
# Verify MySQL is running
docker ps | grep mysql

# Check MySQL logs
docker-compose -f docker-compose.prod.yml logs scli-mysql-prod

# Verify environment variables
grep DB_ /opt/scl-institute/.env.production
```

### API Not Responding

```bash
# Test from inside container
docker exec scli-backend-prod curl http://localhost:4000/api

# Check backend logs
docker-compose -f docker-compose.prod.yml logs scli-backend-prod

# Verify NGINX proxy configuration
docker exec scli-nginx-prod cat /etc/nginx/nginx.conf | grep -A 10 "api"
```

---

## 📊 Monitoring & Maintenance

### View Container Resource Usage

```bash
docker stats

# Watch CPU, Memory, Network usage
docker stats --no-stream
```

### Check Disk Space

```bash
df -h

# Check Docker volumes
docker volume ls
docker volume inspect <volume_name>
```

### View Network Status

```bash
docker network ls
docker network inspect scl-network-prod
```

---

## 🛑 Stopping/Restarting

### Stop All Services

```bash
cd /opt/scl-institute
docker-compose -f docker-compose.prod.yml down
```

### Restart Services

```bash
cd /opt/scl-institute
docker-compose -f docker-compose.prod.yml restart
```

### Stop Specific Service

```bash
docker-compose -f docker-compose.prod.yml stop scli-frontend-prod
docker-compose -f docker-compose.prod.yml stop scli-backend-prod
```

---

## 🔄 Rolling Back to Previous Version

```bash
cd /opt/scl-institute

# View commit history
git log --oneline -10

# Rollback to specific commit
git checkout <commit-hash>

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Moodle Documentation](https://docs.moodle.org/)
- [NGINX Documentation](https://nginx.org/en/docs/)
- [Project GitHub Repository](https://github.com/syedsanaulhaq/scl-institute)

---

## ⚠️ Important Notes

1. **Passwords**: Change all default passwords immediately
2. **Backups**: Setup automatic database backups
3. **Monitoring**: Monitor disk space and container resources
4. **Updates**: Regularly update system and Docker images
5. **Logs**: Monitor logs for errors and issues
6. **Security**: Consider setting up a firewall and SSL certificates

---

## 🎯 Next Steps

1. ✓ Deployment complete
2. Configure SSL certificates (HTTPS)
3. Setup monitoring and alerting
4. Configure log rotation
5. Setup automated backups
6. Document your customizations

---

**Deployment Date**: January 24, 2026  
**Deployed By**: GitHub Copilot  
**Support**: Refer to GitHub Issues or Project Documentation
