# SCL-Institute Complete System Setup Guide

**Version**: 1.0  
**Created**: January 28, 2026  
**Project**: SCL Institute Unified Institutional Management System  

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start](#quick-start)
3. [Detailed Setup Steps](#detailed-setup-steps)
4. [Configuration](#configuration)
5. [Verification](#verification)
6. [Maintenance](#maintenance)
7. [Troubleshooting](#troubleshooting)

---

## 🖥️ System Requirements

### Hardware Minimum
- **RAM**: 8 GB (16 GB recommended)
- **Storage**: 50 GB free space
- **CPU**: 4 cores (8 cores recommended)
- **Internet**: Stable connection for initial setup

### Software Required

#### Windows
- Windows 10 Pro or Windows Server 2016+
- PowerShell 5.0+
- Docker Desktop for Windows (with WSL2 backend)
- Git for Windows
- Curl (included in Windows 10+) or download separately

#### Linux
- Ubuntu 20.04 LTS or equivalent
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- Bash shell
- Curl/Wget

#### macOS
- macOS 11+ (Big Sur or later)
- Docker Desktop for Mac
- Git
- Bash shell

---

## 🚀 Quick Start

### On Windows (Recommended)

```powershell
# 1. Open PowerShell as Administrator
# 2. Navigate to your desired installation directory
cd C:\Projects

# 3. Run the setup script
powershell -ExecutionPolicy Bypass -File .\scl-institute\scripts\setup-complete-system.ps1

# The script will automatically:
# - Clone the repository
# - Create directory structure
# - Set up environment variables
# - Start Docker containers
# - Initialize the database
# - Start all services
```

### On Linux/macOS

```bash
# 1. Navigate to your desired installation directory
cd /home/user/projects

# 2. Make setup script executable
chmod +x ./scripts/setup-complete-system.sh

# 3. Run the setup script
./scripts/setup-complete-system.sh

# The script will:
# - Clone the repository
# - Create directory structure
# - Set up environment variables
# - Start Docker containers
# - Initialize the database
# - Start all services
```

### Manual Setup (If Scripts Fail)

```bash
# 1. Clone repository
git clone https://github.com/syedsanaulhaq/scl-institute.git
cd scl-institute

# 2. Create directories
mkdir -p data/mysql data/moodle logs backups screenshots

# 3. Copy environment template
cp .env.example .env.production

# 4. Copy database schema
cp database_schema.sql data/mysql/000-init.sql

# 5. Start services
docker-compose -f docker-compose.prod.yml up -d

# 6. Wait 60 seconds for initialization
# 7. Verify services are running
docker-compose -f docker-compose.prod.yml ps
```

---

## 📝 Detailed Setup Steps

### Step 1: Prerequisites Installation

#### Windows
1. **Install Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop
   - Enable WSL2 backend during installation
   - Verify: `docker --version`

2. **Install Git**
   - Download: https://git-scm.com/download/win
   - Install with default options
   - Verify: `git --version`

3. **Verify PowerShell**
   - Open PowerShell
   - Run: `$PSVersionTable.PSVersion`
   - Should show version 5.0 or higher

#### Linux
```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install -y docker-compose

# Install Git
sudo apt install -y git curl

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Repository Setup

```bash
# Clone the repository
git clone https://github.com/syedsanaulhaq/scl-institute.git

# Navigate to project
cd scl-institute

# Verify git history
git log --oneline | head -5
```

### Step 3: Environment Configuration

**Edit `.env.production`:**

```bash
# Critical settings to update:

# Database
DB_HOST=scli-mysql-prod
DB_NAME=scl_institute
DB_USER=scl_admin
DB_PASSWORD=YOUR_SECURE_PASSWORD  # Change this!
MYSQL_ROOT_PASSWORD=YOUR_ROOT_PASSWORD  # Change this!

# Domain (if hosting publicly)
DOMAIN=your-domain.com
LMS_DOMAIN=lms.your-domain.com
API_DOMAIN=api.your-domain.com

# JWT Secret (for backend security)
JWT_SECRET=YOUR_LONG_RANDOM_SECRET_KEY  # Change this!

# Timezone
TIMEZONE=UTC  # Or your timezone: Asia/Kolkata, etc.
```

### Step 4: Docker Initialization

```bash
# Build images (if custom Dockerfile changes)
docker-compose -f docker-compose.prod.yml build

# Start containers
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 5: Database Initialization

```bash
# Check if MySQL is running
docker-compose -f docker-compose.prod.yml logs scli-mysql-prod

# Create database (if needed)
docker exec scli-mysql-prod mysql -u root -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE scl_institute;"

# Load schema
docker exec -i scli-mysql-prod mysql -u scl_admin -p$DB_PASSWORD scl_institute < database_schema.sql

# Verify tables created
docker exec scli-mysql-prod mysql -u scl_admin -p$DB_PASSWORD -e "USE scl_institute; SHOW TABLES;" -v
```

### Step 6: Service Verification

```bash
# Check all containers running
docker-compose ps

# Test Frontend
curl http://localhost:3000

# Test Backend
curl http://localhost:4000/health

# Test MySQL
docker exec scli-mysql-prod mysql -u scl_admin -p$DB_PASSWORD -e "SELECT VERSION();"

# Test Moodle
curl http://localhost:8080
```

---

## ⚙️ Configuration

### Critical Configuration Files

#### 1. **docker-compose.prod.yml**
- Defines all services (Frontend, Backend, MySQL, Moodle)
- Configure ports, volumes, networks
- Set resource limits

#### 2. **.env.production**
- Environment variables for all services
- Credentials and secrets
- Domain configuration

#### 3. **nginx/nginx.conf**
- Reverse proxy configuration
- Domain routing
- SSL/TLS configuration
- Load balancing

#### 4. **moodle-config/config.php**
- Moodle LMS settings
- Database connection
- Plugin configuration

### Security Configuration

```bash
# 1. Change all default passwords in .env.production
DB_PASSWORD=GenerateStrongPassword123!456
MYSQL_ROOT_PASSWORD=GenerateStrongPassword789!012

# 2. Generate JWT Secret (Linux/macOS)
openssl rand -base64 32

# 3. Set proper file permissions
chmod 600 .env.production
chmod 755 scripts/*.sh

# 4. Configure SSL certificates
# Place your certificates in nginx/ssl/
# Update nginx.conf with certificate paths
```

---

## ✅ Verification

### Health Check Script

```bash
# Create health-check.sh
cat > health-check.sh << 'EOF'
#!/bin/bash
echo "=== SCL-Institute Health Check ==="

# Frontend
echo "Frontend Status:"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000

# Backend
echo "Backend Status:"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4000/health

# Moodle
echo "Moodle Status:"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080

# MySQL
echo "MySQL Status:"
docker exec scli-mysql-prod mysql -u scl_admin -p$DB_PASSWORD -e "SELECT 1;" >/dev/null && echo "200" || echo "500"

# Nginx
echo "NGINX Status:"
curl -s -o /dev/null -w "%{http_code}\n" http://sclsandbox.xyz

EOF

chmod +x health-check.sh
./health-check.sh
```

### Database Verification

```bash
# Connect to MySQL
docker exec -it scli-mysql-prod mysql -u scl_admin -p$DB_PASSWORD

# Inside MySQL shell:
USE scl_institute;
SHOW TABLES;  -- Should show 37+ tables
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='scl_institute';
SELECT * FROM roles;  -- Should show 5 roles
```

### Service Logs

```bash
# View all logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f scli-backend-prod
docker-compose logs -f scli-frontend-prod
docker-compose logs -f scli-mysql-prod
docker-compose logs -f scli-moodle-prod

# Error logs only
docker-compose logs -f --tail=50
```

---

## 🔧 Maintenance

### Regular Tasks

#### Daily
```bash
# Check service health
docker-compose ps

# Monitor logs for errors
docker-compose logs --tail=100 | grep ERROR
```

#### Weekly
```bash
# Database backup
docker exec scli-mysql-prod mysqldump -u scl_admin -p$DB_PASSWORD scl_institute > backups/scl_institute_$(date +%Y%m%d).sql

# Clean up old logs
find logs -name "*.log" -mtime +30 -delete

# Update images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

#### Monthly
```bash
# Full system check
./health-check.sh

# Review security settings
cat .env.production | grep PASSWORD

# Check disk usage
docker system df

# Prune unused data
docker system prune -a --volumes
```

### Database Backup/Restore

```bash
# Backup
docker exec scli-mysql-prod mysqldump -u scl_admin -p$DB_PASSWORD scl_institute > scl_backup.sql

# Restore
docker exec -i scli-mysql-prod mysql -u scl_admin -p$DB_PASSWORD scl_institute < scl_backup.sql

# Backup to archive
tar -czf scl_institute_backup_$(date +%Y%m%d).tar.gz backups/ logs/
```

### Updating Project

```bash
# Pull latest changes
git pull origin main

# Rebuild images
docker-compose -f docker-compose.prod.yml build --no-cache

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Ports Already in Use**
```bash
# Find what's using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different ports in docker-compose.yml
```

#### 2. **Database Connection Failed**
```bash
# Check MySQL container
docker-compose logs scli-mysql-prod

# Verify credentials
docker exec scli-mysql-prod mysql -u scl_admin -p$DB_PASSWORD -e "SELECT 1;"

# Check network connectivity
docker exec scli-backend-prod ping scli-mysql-prod
```

#### 3. **Docker Daemon Not Running**
```bash
# Windows: Start Docker Desktop application

# Linux: Start Docker service
sudo systemctl start docker

# Verify
docker --version
docker ps
```

#### 4. **Permission Denied Errors**
```bash
# Linux: Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Windows: Run PowerShell as Administrator
```

#### 5. **Out of Memory**
```bash
# Check available memory
free -h  # Linux
Get-ChildItem -Path "\\?\GlobalRoot\Device\HardenedDeviceMap\StatusSnapshots\MemStatus" | Select-Object @{Name="MemUsage";Expression={[Math]::Round($_.PrivateMemorySize/1MB, 2)}} # Windows

# Increase Docker memory allocation:
# Windows: Docker Desktop > Settings > Resources > Memory (set to 8GB+)
# Linux: No limit, but monitor with: docker stats
```

#### 6. **Frontend/Backend Not Communicating**
```bash
# Check backend is accessible from frontend container
docker exec scli-frontend-prod curl http://scli-backend-prod:4000/health

# Verify network
docker network ls
docker network inspect scl-network-prod

# Check API_URL in frontend .env
echo $REACT_APP_API_URL
```

#### 7. **Moodle SSO Not Working**
```bash
# Check SSO plugin installed
docker exec scli-moodle-prod ls /bitnami/moodle/local/sclsso/

# Check backend SSO endpoints
curl http://localhost:4000/api/sso/generate -X POST

# View Moodle logs
docker exec scli-moodle-prod tail /opt/bitnami/moodle/var/log/moodle.log
```

### Debug Mode

```bash
# Enable verbose logging
export DEBUG=*
docker-compose -f docker-compose.prod.yml up

# Watch real-time metrics
docker stats

# Monitor network traffic
docker exec scli-backend-prod tcpdump -i eth0 -n

# Check system resources
docker system df
docker system events
```

### Reset Everything (⚠️ Use With Caution)

```bash
# Stop and remove all containers
docker-compose -f docker-compose.prod.yml down -v

# Remove all images
docker image prune -a

# Remove all volumes
docker volume prune -a

# Start fresh
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Support

### Resources

- **GitHub**: https://github.com/syedsanaulhaq/scl-institute
- **Issues**: Report on GitHub Issues
- **Documentation**: Check PROJECT_SCHEDULE.md and IMPLEMENTATION_ROADMAP.md

### Log Files Location

- **Frontend**: `logs/frontend/`
- **Backend**: `logs/backend/`
- **MySQL**: Docker logs via `docker-compose logs scli-mysql-prod`
- **Moodle**: `logs/moodle/`
- **NGINX**: `logs/nginx/`

### Collecting Debug Information

```bash
# Create debug bundle
tar -czf debug_bundle.tar.gz \
  .env.production \
  docker-compose.prod.yml \
  logs/ \
  <(docker-compose logs) \
  <(docker stats --no-stream) \
  <(docker exec scli-mysql-prod mysql -u scl_admin -pXXXX -e "SHOW VARIABLES;")
```

---

## ✨ Next Steps After Setup

1. **Verify all services are running** (see Verification section)
2. **Update security credentials** in .env.production
3. **Configure SSL certificates** for production
4. **Set up domain routing** if hosting on public server
5. **Configure automated backups** for database
6. **Set up monitoring and alerts** (e.g., Prometheus, Grafana)
7. **Review logs regularly** for errors or issues
8. **Test all modules** (Students, Courses, Faculty, Partners, Support, Moodle)
9. **Create admin user account** in application
10. **Plan for capacity and scaling** as usage grows

---

## 📊 Project Information

- **Version**: 1.0
- **Total Database Tables**: 37
- **Total API Endpoints**: 112+
- **Total Components**: 55+
- **Development Timeline**: 12 weeks
- **Go-Live Target**: Mid-April 2026
- **Repository**: https://github.com/syedsanaulhaq/scl-institute

---

**Last Updated**: January 28, 2026  
**Created By**: Development Team  
**Status**: Production Ready
