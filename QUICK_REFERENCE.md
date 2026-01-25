# SCL Institute - Quick Reference Guide

## 🚀 Quick Start Commands

### LOCAL Development (Your Computer)

```powershell
# Start development containers
docker-compose -f docker-compose.dev.yml up -d

# View status
docker ps

# View logs
docker logs -f scli-backend-dev
docker logs -f scli-frontend-dev

# Stop containers
docker-compose -f docker-compose.dev.yml down

# Test login (PowerShell)
$json = @{ email = 'admin@scl.com'; password = 'password' } | ConvertTo-Json
$response = Invoke-WebRequest -Uri 'http://localhost:4000/api/v1/auth/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body $json -UseBasicParsing
$response.Content
```

### SERVER Production (185.211.6.60)

```bash
# SSH into server
ssh root@185.211.6.60

# Start production containers
docker-compose -f docker-compose.prod.yml up -d

# View status
docker ps

# View logs
docker logs -f scli-backend-prod
docker logs -f scli-nginx-prod

# Stop containers
docker-compose -f docker-compose.prod.yml down

# Deploy latest code
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📍 Access URLs

### LOCAL Development
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api |
| Moodle | http://localhost:8080 |
| MySQL | localhost:33061 (user: scl_user, pass: scl_password) |

### PRODUCTION Server
| Service | URL |
|---------|-----|
| Frontend | http://sclsandbox.xyz |
| Backend API | http://sclsandbox.xyz/api |
| Moodle | http://lms.sclsandbox.xyz |
| Server IP | 185.211.6.60 |
| SSH | ssh root@185.211.6.60 |

---

## 🐳 Container Names

### LOCAL Containers (Development)
- `scli-mysql-dev` (Database)
- `scli-moodle-db-dev` (Moodle Database)
- `scli-backend-dev` (Backend API)
- `scli-frontend-dev` (Frontend)
- `scli-moodle-dev` (Moodle LMS)

### SERVER Containers (Production)
- `scli-mysql-prod` (Database)
- `scli-moodle-db-prod` (Moodle Database)
- `scli-backend-prod` (Backend API)
- `scli-frontend-prod` (Frontend)
- `scli-moodle-prod` (Moodle LMS)
- `scli-nginx-prod` (NGINX Reverse Proxy)

---

## 🔐 Login Credentials

**Email:** admin@scl.com  
**Password:** password

(Same for both LOCAL and PRODUCTION environments)

Alternative account:
- **Email:** student@scl.com
- **Password:** password

---

## 🔧 Environment Files

### LOCAL (.env for development)
- Location: `e:\SCL-Projects\SCL-Institute\.env`
- Database: `scl_institute`
- DB Password: `scl_password`

### PRODUCTION (.env.production on server)
- Location: `/opt/scl-institute/.env`
- Database: `scl_institute_prod`
- DB Password: `SecureDBPass2026!`

---

## 📊 Docker Networks

- **LOCAL**: `scl-network-dev`
- **PRODUCTION**: `scl-network-prod`

---

## 🐛 Troubleshooting

### Containers not starting?
```powershell
# Check for issues
docker-compose -f docker-compose.dev.yml logs

# Rebuild everything fresh
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Backend returning errors?
```powershell
docker logs scli-backend-dev
docker exec scli-backend-dev env | grep DB_
```

### Frontend not accessible?
```powershell
docker logs scli-frontend-dev
curl http://localhost:3000
```

### Database connection issues?
```powershell
# Test MySQL connection
docker exec scli-mysql-dev mysql -u scl_user -pscl_password -e "SELECT 1;"
```

---

## 🚢 Git Branches

- **`develop`** - Development branch
- **`main`** - Production branch (what's on the server)

---

## 📚 Related Files

- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Detailed environment guide
- [README.md](./README.md) - Project overview
- [01_START_HERE_IMPLEMENTATION.md](./01_START_HERE_IMPLEMENTATION.md) - Implementation guide
- `docker-compose.dev.yml` - Development orchestration
- `docker-compose.prod.yml` - Production orchestration
- `.env.development` - Development variables template
- `.env.production` - Production variables template

---

## ⚡ One-Liners

```powershell
# Test all local services
docker-compose -f docker-compose.dev.yml ps

# Quick login test (LOCAL)
$json = @{ email = 'admin@scl.com'; password = 'password' } | ConvertTo-Json; Invoke-WebRequest -Uri 'http://localhost:4000/api/v1/auth/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body $json -UseBasicParsing | % Content

# Quick login test (PRODUCTION)
$json = @{ email = 'admin@scl.com'; password = 'password' } | ConvertTo-Json; Invoke-WebRequest -Uri 'http://sclsandbox.xyz/api/v1/auth/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body $json -UseBasicParsing | % Content

# View all local container logs
docker-compose -f docker-compose.dev.yml logs -f

# Full restart (LOCAL)
docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up -d

# Full restart (PRODUCTION)
ssh root@185.211.6.60 "cd /opt/scl-institute && docker-compose -f docker-compose.prod.yml down -v && docker-compose -f docker-compose.prod.yml up -d"
```

---

## 🎯 Summary

✅ **To Work Locally**: Use `docker-compose.dev.yml`  
✅ **To Deploy to Server**: Push to `main` branch → SSH to server → `git pull && docker-compose up -d`  
✅ **Container Names**: Always check `*-dev` (local) vs `*-prod` (server)  
✅ **Credentials**: Same everywhere (admin@scl.com / password)  
✅ **If Confused**: Check which branch you're on and which Docker container is running!

