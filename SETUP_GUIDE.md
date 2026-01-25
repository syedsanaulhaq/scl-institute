# SCL Institute - Complete Setup & Commands Guide

**Last Updated:** January 25, 2026  
**Status:** ✅ Development Environment Ready | ⏳ Production Environment Ready

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Production Server Setup](#production-server-setup)
3. [Common Commands](#common-commands)
4. [Troubleshooting](#troubleshooting)
5. [Testing & Verification](#testing--verification)

---

## LOCAL DEVELOPMENT SETUP

### Prerequisites
- Docker Desktop installed
- PowerShell 5.1+
- Git installed
- Project cloned to `E:\SCL-Projects\SCL-Institute`

### Step 1: Start Development Containers

```powershell
# Navigate to project
cd E:\SCL-Projects\SCL-Institute

# Start all development containers
docker-compose -f docker-compose.dev.yml up -d

# Verify all containers are running
docker ps --filter "label=com.docker.compose.project=scl-institute" -a
```

**Expected Output:**
```
NAMES                STATUS                   PORTS
scli-mysql-dev       Up (healthy)             0.0.0.0:33061->3306/tcp
scli-moodle-db-dev   Up (healthy)             3306/tcp
scli-backend-dev     Up (healthy)             0.0.0.0:4000->4000/tcp
scli-frontend-dev    Up (healthy)             0.0.0.0:3000->3000/tcp
scli-moodle-dev      Up (healthy)             0.0.0.0:8080->8080/tcp
```

### Step 2: Wait for Initialization (2-3 minutes)

```powershell
# Watch logs for "ready to use" messages
docker-compose -f docker-compose.dev.yml logs -f

# Press Ctrl+C when you see all "ok" messages
```

### Step 3: Access Development Services

#### Frontend (React/Vite App)
```
URL: http://localhost:3000
Status: Should show login form
```

#### Backend API
```
URL: http://localhost:4000/api
Status: Should return API endpoints
```

#### Moodle LMS
```
URL: http://localhost:8080
Admin: admin / SCLInst!2026
Status: Should show Moodle dashboard
```

#### Database Access
```
Host: localhost:33061
User: scl_user
Password: scl_password
Database: scl_institute
```

### Step 4: Test Login

**Using PowerShell:**
```powershell
# Test local backend login
$json = @{ email = 'admin@scl.com'; password = 'password' } | ConvertTo-Json
$response = Invoke-WebRequest `
    -Uri 'http://localhost:4000/api/v1/auth/login' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $json `
    -UseBasicParsing

Write-Host "Status: $($response.StatusCode)"
Write-Host $response.Content
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@scl.com",
    "name": "SCL Admin",
    "role": "admin"
  },
  "tokens": {
    "accessToken": "mock_access_token_...",
    "refreshToken": "mock_refresh_token_..."
  }
}
```

### Step 5: Frontend Login Verification

1. Open http://localhost:3000
2. Login with:
   - **Email:** admin@scl.com
   - **Password:** password
3. Should see dashboard with user data and tokens

---

## LOCAL DEVELOPMENT - STOPPING & CLEANUP

### Stop Containers (Keep Volumes)
```powershell
docker-compose -f docker-compose.dev.yml down
```

### Stop & Remove Everything (Fresh Start)
```powershell
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### View Logs
```powershell
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f scli-backend-dev

# Last 50 lines
docker logs scli-backend-dev --tail 50
```

---

## PRODUCTION SERVER SETUP

### Server Details
```
IP Address:    185.211.6.60
OS:            Ubuntu 24.04.3 LTS
SSH User:      root
SSH Key:       (use your SSH key)
Compose:       docker-compose v5.0.2
Installed:     ✅ Docker, Git, Docker Compose
```

### Step 1: SSH into Production Server

```bash
ssh root@185.211.6.60
```

### Step 2: Navigate to Project

```bash
cd /opt/scl-institute
```

### Step 3: Pull Latest Code

```bash
# View current branch
git branch -v

# Pull latest from main
git pull origin main

# Verify commit
git log --oneline -5
```

### Step 4: Start Production Containers

```bash
# View environment
cat .env | grep NODE_ENV

# Start all containers with latest build
docker-compose -f docker-compose.prod.yml up -d --build

# Verify all containers
docker ps

# Wait for initialization
docker-compose -f docker-compose.prod.yml logs -f
```

**Expected Output:**
```
NAME                 STATUS             
scli-mysql-prod      Up (healthy)       
scli-moodle-db-prod  Up (healthy)       
scli-backend-prod    Up (healthy)       
scli-frontend-prod   Up (healthy)       
scli-nginx-prod      Up (healthy)       
scli-moodle-prod     Up (initializing)  
```

### Step 5: Access Production Services

#### Frontend
```
URL: http://sclsandbox.xyz
HTTPS: https://sclsandbox.xyz (when SSL ready)
Status: Should show login form
```

#### Backend API
```
URL: http://sclsandbox.xyz/api
Status: Should return API endpoints
```

#### Moodle LMS
```
URL: http://lms.sclsandbox.xyz
Admin: admin / SCLInst!2026
```

#### NGINX Health Check
```bash
curl -I http://sclsandbox.xyz/health
# Should return 200 OK
```

### Step 6: Test Production Login

**From Server:**
```bash
curl -X POST http://scli-backend:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scl.com","password":"password"}'
```

**From Local Machine (PowerShell):**
```powershell
$json = @{ email = 'admin@scl.com'; password = 'password' } | ConvertTo-Json
$response = Invoke-WebRequest `
    -Uri 'http://sclsandbox.xyz/api/v1/auth/login' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $json `
    -UseBasicParsing

Write-Host "Status: $($response.StatusCode)"
Write-Host $response.Content
```

### Step 7: Monitor Services

**Check Service Status:**
```bash
docker ps
docker-compose -f docker-compose.prod.yml ps
```

**View Logs:**
```bash
# Backend logs
docker logs scli-backend-prod -f

# NGINX logs  
docker logs scli-nginx-prod -f

# All logs
docker-compose -f docker-compose.prod.yml logs -f

# Last errors
docker logs scli-backend-prod --tail 50 | grep -i error
```

**Database Check:**
```bash
docker exec scli-mysql-prod mysql -u scl_user -pSecureDBPass2026! scl_institute_prod -e "SELECT DATABASE();"
```

---

## PRODUCTION SERVER - STOPPING & CLEANUP

### Stop Containers (Keep Volumes)
```bash
docker-compose -f docker-compose.prod.yml down
```

### Stop & Remove Everything (CAREFUL!)
```bash
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

### Emergency Restart
```bash
# Kill everything
docker-compose -f docker-compose.prod.yml down
docker system prune -f

# Fresh start
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## PRODUCTION - CODE DEPLOYMENT

### Deploy New Changes

```bash
# On local machine
cd E:\SCL-Projects\SCL-Institute

# Commit and push
git add .
git commit -m "feature: Add new feature"
git push origin main

# On server
ssh root@185.211.6.60
cd /opt/scl-institute

# Pull and deploy
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build

# Verify
docker ps
```

### View Deployment Logs

```bash
# During deployment
docker-compose -f docker-compose.prod.yml logs -f

# After deployment (last 100 lines)
docker logs scli-backend-prod --tail 100
```

### Rollback to Previous Version

```bash
cd /opt/scl-institute

# View commit history
git log --oneline -10

# Rollback (replace COMMIT_ID with actual ID)
git reset --hard COMMIT_ID
git pull origin main

# Redeploy
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## COMMON COMMANDS

### Container Management

```powershell
# LOCAL - List all dev containers
docker ps -a --filter "name=*-dev"

# LOCAL - Restart single container
docker-compose -f docker-compose.dev.yml restart scli-backend-dev

# LOCAL - Remove single container
docker-compose -f docker-compose.dev.yml rm scli-backend-dev
```

```bash
# SERVER - List all prod containers  
docker ps -a --filter "name=*-prod"

# SERVER - Restart single container
docker-compose -f docker-compose.prod.yml restart scli-backend-prod

# SERVER - Remove single container
docker-compose -f docker-compose.prod.yml rm scli-backend-prod
```

### Database Access

```powershell
# LOCAL - Connect to MySQL
docker exec -it scli-mysql-dev mysql -u scl_user -pscl_password scl_institute

# LOCAL - Run query
docker exec scli-mysql-dev mysql -u scl_user -pscl_password scl_institute -e "SELECT * FROM users LIMIT 5;"
```

```bash
# SERVER - Connect to MySQL
docker exec -it scli-mysql-prod mysql -u scl_user -pSecureDBPass2026! scl_institute_prod

# SERVER - Run query
docker exec scli-mysql-prod mysql -u scl_user -pSecureDBPass2026! scl_institute_prod -e "SELECT * FROM sso_tokens;"
```

### Network & Port Information

```powershell
# LOCAL - See networks
docker network ls

# LOCAL - Inspect dev network
docker network inspect scl-institute_scl-network-dev

# LOCAL - See port mappings
docker port scli-backend-dev
docker port scli-frontend-dev
```

```bash
# SERVER - See networks
docker network ls

# SERVER - Inspect prod network  
docker network inspect scl-institute_scl-network-prod

# SERVER - Check NGINX listening
netstat -an | grep LISTEN | grep -E "80|443"
```

### Git Operations

```powershell
# LOCAL - Check status
cd E:\SCL-Projects\SCL-Institute
git status
git branch -v

# LOCAL - Sync with remote
git fetch origin
git pull origin main

# LOCAL - Create feature branch
git checkout -b feature/new-feature
git add .
git commit -m "feature: Add new feature"
git push -u origin feature/new-feature
```

```bash
# SERVER - Check status
cd /opt/scl-institute
git status
git branch -v

# SERVER - View recent commits
git log --oneline -10

# SERVER - Check differences
git diff HEAD~1 HEAD
```

---

## TESTING & VERIFICATION

### Health Checks

#### Local Health Check
```powershell
# Frontend health
curl -Uri "http://localhost:3000" -UseBasicParsing

# Backend health  
curl -Uri "http://localhost:4000" -UseBasicParsing

# Moodle health
curl -Uri "http://localhost:8080" -UseBasicParsing

# NGINX would serve these on server
```

#### Production Health Check
```bash
# From server or local machine
curl -I http://sclsandbox.xyz/health
curl -I http://sclsandbox.xyz/api/v1/auth/login
curl -I http://lms.sclsandbox.xyz

# Response should be 200-404 (not 502 or 503)
```

### API Endpoint Testing

#### Test Login Endpoint

**Local (PowerShell):**
```powershell
$json = @{ 
    email = 'admin@scl.com'
    password = 'password' 
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:4000/api/v1/auth/login' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $json `
    -UseBasicParsing | % Content
```

**Production (Bash):**
```bash
curl -X POST http://sclsandbox.xyz/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scl.com","password":"password"}'
```

#### Test SSO Endpoint

**Local (PowerShell):**
```powershell
$json = @{ 
    email = 'admin@scl.com' 
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:4000/api/sso/generate' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $json `
    -UseBasicParsing | % Content
```

**Production (Bash):**
```bash
curl -X POST http://sclsandbox.xyz/api/sso/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scl.com"}'
```

---

## TROUBLESHOOTING

### Containers Won't Start

```powershell
# LOCAL - Check all errors
docker-compose -f docker-compose.dev.yml logs

# LOCAL - Rebuild everything fresh
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f
docker-compose -f docker-compose.dev.yml up -d
```

```bash
# SERVER - Check errors
docker-compose -f docker-compose.prod.yml logs

# SERVER - Rebuild
docker-compose -f docker-compose.prod.yml down -v
docker system prune -f
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backend Connection Issues

```powershell
# LOCAL - Test backend directly
docker exec scli-backend-dev curl -s http://localhost:4000 

# LOCAL - Check environment
docker exec scli-backend-dev env | grep DB_
```

```bash
# SERVER - Test backend directly
docker exec scli-backend-prod curl -s http://localhost:4000

# SERVER - Check environment
docker exec scli-backend-prod env | grep DB_
```

### Database Connection Issues

```powershell
# LOCAL - Test MySQL
docker exec scli-mysql-dev mysql -u scl_user -pscl_password -e "SELECT 1;"

# LOCAL - Check MySQL logs
docker logs scli-mysql-dev | tail -50
```

```bash
# SERVER - Test MySQL
docker exec scli-mysql-prod mysql -u scl_user -pSecureDBPass2026! -e "SELECT 1;"

# SERVER - Check MySQL logs
docker logs scli-mysql-prod | tail -50
```

### NGINX Issues (Production)

```bash
# Check NGINX config
docker exec scli-nginx-prod nginx -t

# Check NGINX logs
docker logs scli-nginx-prod | tail -100

# Reload NGINX
docker exec scli-nginx-prod nginx -s reload

# Check backend connectivity
docker exec scli-nginx-prod curl -I http://scli-backend:4000
```

### Frontend Not Loading

```powershell
# LOCAL - Check frontend logs
docker logs scli-frontend-dev

# LOCAL - Verify API URL in env
docker exec scli-frontend-dev env | grep VITE_API

# LOCAL - Test frontend port
curl -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction SilentlyContinue
```

```bash
# SERVER - Check frontend logs
docker logs scli-frontend-prod

# SERVER - Verify frontend is accessible via NGINX
curl -I http://sclsandbox.xyz
```

---

## ENVIRONMENT VARIABLES

### Development (.env file at root)
```
NODE_ENV=development
PORT=4000
DB_HOST=scli-mysql
DB_PORT=3306
DB_USER=scl_user
DB_PASS=scl_password
DB_NAME=scl_institute
VITE_API_URL=http://localhost:4000/api
```

### Production (.env on server at /opt/scl-institute)
```
NODE_ENV=production
PORT=4000
DB_HOST=scli-mysql
DB_PORT=3306
DB_USER=scl_user
DB_PASS=SecureDBPass2026!
DB_NAME=scl_institute_prod
VITE_API_URL=http://185.211.6.60/api
MOODLE_URL=http://lms.sclsandbox.xyz
```

---

## USEFUL LINKS

| Service | Local | Production |
|---------|-------|------------|
| Frontend | http://localhost:3000 | http://sclsandbox.xyz |
| Backend API | http://localhost:4000 | http://185.211.6.60:4000 |
| Moodle | http://localhost:8080 | http://lms.sclsandbox.xyz |
| API Health | http://localhost:4000 | http://sclsandbox.xyz/api |
| SSH | N/A | ssh root@185.211.6.60 |

---

## QUICK REFERENCE

**Start everything LOCAL:**
```powershell
cd E:\SCL-Projects\SCL-Institute
docker-compose -f docker-compose.dev.yml up -d
```

**Start everything SERVER:**
```bash
ssh root@185.211.6.60
cd /opt/scl-institute
docker-compose -f docker-compose.prod.yml up -d
```

**Test login LOCAL:**
```powershell
$json = @{ email = 'admin@scl.com'; password = 'password' } | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:4000/api/v1/auth/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body $json -UseBasicParsing | % Content
```

**Test login SERVER:**
```bash
curl -X POST http://sclsandbox.xyz/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scl.com","password":"password"}'
```

**Stop everything LOCAL:**
```powershell
docker-compose -f docker-compose.dev.yml down
```

**Stop everything SERVER:**
```bash
docker-compose -f docker-compose.prod.yml down
```

---

## Support

For issues, check:
1. Container logs: `docker logs CONTAINER_NAME`
2. Git status: `git status`
3. Port availability: `netstat -an | grep LISTEN`
4. Network connectivity: `docker network ls` and `docker network inspect`

---

**Version:** 1.0  
**Last Updated:** Jan 25, 2026  
**Maintained By:** Development Team

See also: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) | [README.md](./README.md)
