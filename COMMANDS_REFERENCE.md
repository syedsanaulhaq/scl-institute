# SCL Institute - Complete Commands Reference

Complete command reference for both LOCAL development and PRODUCTION server environments.

---

## Table of Contents

1. [LOCAL Development Commands](#local-development-commands)
2. [PRODUCTION Server Commands](#production-server-commands)
3. [Docker Commands](#docker-commands)
4. [Database Commands](#database-commands)
5. [Git Commands](#git-commands)
6. [API Testing Commands](#api-testing-commands)
7. [Troubleshooting Commands](#troubleshooting-commands)

---

## LOCAL Development Commands

### Starting & Stopping Containers

**Start all development containers:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Start specific container:**
```bash
docker-compose -f docker-compose.dev.yml up -d scli-backend-dev
docker-compose -f docker-compose.dev.yml up -d scli-frontend-dev
docker-compose -f docker-compose.dev.yml up -d scli-mysql-dev
```

**Stop all development containers:**
```bash
docker-compose -f docker-compose.dev.yml down
```

**Stop specific container:**
```bash
docker-compose -f docker-compose.dev.yml stop scli-backend-dev
```

**Restart containers:**
```bash
docker-compose -f docker-compose.dev.yml restart
docker-compose -f docker-compose.dev.yml restart scli-backend-dev
```

**Remove containers and volumes (fresh start):**
```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Viewing Status & Logs

**List all running containers:**
```bash
docker ps
docker-compose -f docker-compose.dev.yml ps
```

**View detailed container status:**
```bash
docker ps -a
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**View real-time logs:**
```bash
# All containers
docker-compose -f docker-compose.dev.yml logs -f

# Specific containers
docker logs -f scli-backend-dev
docker logs -f scli-frontend-dev
docker logs -f scli-mysql-dev
docker logs -f scli-moodle-dev

# Last 50 lines
docker logs --tail 50 scli-backend-dev

# Last 50 lines with follow
docker logs --tail 50 -f scli-backend-dev

# With timestamps
docker logs -f --timestamps scli-backend-dev

# Since specific time
docker logs --since 10m scli-backend-dev
```

**View environment variables in container:**
```bash
docker exec scli-backend-dev env
docker exec scli-backend-dev env | grep DB_
docker exec scli-mysql-dev env | grep MYSQL_
```

### Building & Rebuilding

**Rebuild and restart specific container:**
```bash
docker-compose -f docker-compose.dev.yml up -d --build scli-backend-dev
```

**Rebuild all containers:**
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

**Rebuild from scratch:**
```bash
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a --volumes
docker-compose -f docker-compose.dev.yml up -d --build
```

### Executing Commands in Containers

**Run command in container:**
```bash
docker exec scli-backend-dev node --version
docker exec scli-mysql-dev mysql --version
```

**Interactive shell:**
```bash
# Backend container
docker exec -it scli-backend-dev sh
docker exec -it scli-backend-dev bash

# MySQL container
docker exec -it scli-mysql-dev bash
docker exec -it scli-mysql-dev mysql -u scl_user -pscl_password
```

**View container process list:**
```bash
docker exec scli-backend-dev ps aux
```

---

## PRODUCTION Server Commands

### SSH Access

**Connect to production server:**
```bash
ssh root@185.211.6.60
```

**SSH with specific key:**
```bash
ssh -i ~/.ssh/id_rsa root@185.211.6.60
```

**Copy file to server:**
```bash
scp myfile.txt root@185.211.6.60:/opt/scl-institute/
```

**Copy file from server:**
```bash
scp root@185.211.6.60:/opt/scl-institute/file.txt ./
```

### Starting & Stopping Containers (Server)

**Navigate to project directory:**
```bash
cd /opt/scl-institute
```

**Start all production containers:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Start specific container:**
```bash
docker-compose -f docker-compose.prod.yml up -d scli-backend-prod
docker-compose -f docker-compose.prod.yml up -d scli-nginx-prod
```

**Stop all production containers:**
```bash
docker-compose -f docker-compose.prod.yml down
```

**Stop specific container:**
```bash
docker-compose -f docker-compose.prod.yml stop scli-backend-prod
```

**Restart all containers:**
```bash
docker-compose -f docker-compose.prod.yml restart
```

**Restart specific container:**
```bash
docker-compose -f docker-compose.prod.yml restart scli-backend-prod
docker-compose -f docker-compose.prod.yml restart scli-nginx-prod
```

**Remove containers and volumes (fresh start):**
```bash
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

### Viewing Status & Logs (Server)

**List all running containers:**
```bash
docker ps
docker-compose -f docker-compose.prod.yml ps
```

**View container status with ports:**
```bash
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**View logs:**
```bash
# All containers
docker-compose -f docker-compose.prod.yml logs -f

# Specific containers
docker logs -f scli-backend-prod
docker logs -f scli-nginx-prod
docker logs -f scli-frontend-prod
docker logs -f scli-mysql-prod

# Last 100 lines
docker logs --tail 100 scli-backend-prod

# Follow logs
docker logs -f --tail 50 scli-backend-prod
```

**View environment variables:**
```bash
docker exec scli-backend-prod env | grep DB_
docker exec scli-nginx-prod env
```

### Deployment Commands (Server)

**Pull latest code from GitHub:**
```bash
cd /opt/scl-institute
git pull origin main
```

**Update and restart all containers:**
```bash
cd /opt/scl-institute
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

**Update specific container:**
```bash
cd /opt/scl-institute
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build scli-backend-prod
```

**Force rebuild (ignore cache):**
```bash
cd /opt/scl-institute
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build --no-cache
```

**Full fresh deployment:**
```bash
cd /opt/scl-institute
git pull origin main
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

### Executing Commands on Server

**Run command in container:**
```bash
docker exec scli-backend-prod node --version
docker exec scli-mysql-prod mysql --version
```

**Interactive shell in container:**
```bash
docker exec -it scli-backend-prod sh
docker exec -it scli-mysql-prod mysql -u scl_user -pSecureDBPass2026!
```

---

## Docker Commands

### Image Management

**List all images:**
```bash
docker images
docker images -a
```

**Show image details:**
```bash
docker inspect scl-institute-scli-backend
```

**Remove image:**
```bash
docker rmi scl-institute-scli-backend
```

**Remove unused images:**
```bash
docker image prune
docker image prune -a
```

**Build image:**
```bash
docker build -t myimage:latest .
```

### Volume Management

**List all volumes:**
```bash
docker volume ls
```

**Show volume details:**
```bash
docker volume inspect mysql_data_dev
```

**Remove volume:**
```bash
docker volume rm mysql_data_dev
```

**Remove unused volumes:**
```bash
docker volume prune
```

### Network Management

**List all networks:**
```bash
docker network ls
```

**Show network details:**
```bash
docker network inspect scl-institute_scl-network-dev
```

**Test connectivity between containers:**
```bash
# From NGINX to Backend
docker exec scli-nginx-prod curl http://scli-backend:4000/

# From Frontend to Backend
docker exec scli-frontend-dev curl http://scli-backend-dev:4000/
```

### System Cleanup

**Show disk usage:**
```bash
docker system df
```

**Remove unused containers:**
```bash
docker container prune
```

**Remove everything unused:**
```bash
docker system prune -a
```

**Full cleanup (WARNING: removes all unused resources):**
```bash
docker system prune -a --volumes
```

---

## Database Commands

### LOCAL MySQL (Development)

**Connect to MySQL:**
```bash
docker exec -it scli-mysql-dev mysql -u scl_user -pscl_password scl_institute
```

**List all databases:**
```bash
docker exec scli-mysql-dev mysql -u scl_user -pscl_password -e "SHOW DATABASES;"
```

**List all tables:**
```bash
docker exec scli-mysql-dev mysql -u scl_user -pscl_password scl_institute -e "SHOW TABLES;"
```

**Describe table:**
```bash
docker exec scli-mysql-dev mysql -u scl_user -pscl_password scl_institute -e "DESCRIBE users;"
```

**Query data:**
```bash
docker exec scli-mysql-dev mysql -u scl_user -pscl_password scl_institute -e "SELECT * FROM sso_tokens LIMIT 5;"
```

**Test connection:**
```bash
docker exec scli-mysql-dev mysql -u scl_user -pscl_password -e "SELECT 1;"
```

**Backup database:**
```bash
docker exec scli-mysql-dev mysqldump -u scl_user -pscl_password scl_institute > backup_dev.sql
```

**Restore database:**
```bash
docker exec -i scli-mysql-dev mysql -u scl_user -pscl_password scl_institute < backup_dev.sql
```

### PRODUCTION MySQL (Server)

**Connect to MySQL:**
```bash
docker exec -it scli-mysql-prod mysql -u scl_user -pSecureDBPass2026! scl_institute_prod
```

**List all databases:**
```bash
docker exec scli-mysql-prod mysql -u scl_user -pSecureDBPass2026! -e "SHOW DATABASES;"
```

**Query data:**
```bash
docker exec scli-mysql-prod mysql -u scl_user -pSecureDBPass2026! scl_institute_prod -e "SELECT * FROM sso_tokens LIMIT 5;"
```

**Test connection:**
```bash
docker exec scli-mysql-prod mysql -u scl_user -pSecureDBPass2026! -e "SELECT 1;"
```

**Backup production database:**
```bash
docker exec scli-mysql-prod mysqldump -u scl_user -pSecureDBPass2026! scl_institute_prod > backup_prod.sql
```

### MariaDB Commands (Moodle Database)

**Development:**
```bash
docker exec -it scli-moodle-db-dev mysql -u bn_moodle -pbitnami_moodle_password bitnami_moodle
```

**Production:**
```bash
docker exec -it scli-moodle-db-prod mysql -u bn_moodle -pbitnami_moodle_password bitnami_moodle
```

---

## Git Commands

### Basic Git Operations

**Check current branch:**
```bash
git branch -v
git status
```

**Switch branch:**
```bash
git checkout develop
git checkout main
```

**Create new branch:**
```bash
git checkout -b feature/new-feature
```

**Make changes and commit:**
```bash
git add .
git commit -m "feat: Add new feature"
git commit -m "fix: Fix login issue"
git commit -m "docs: Update documentation"
```

**Push to GitHub:**
```bash
git push origin main
git push origin develop
git push -u origin new-branch
```

**Pull from GitHub:**
```bash
git pull origin main
git pull origin develop
```

### Viewing Commit History

**View recent commits:**
```bash
git log
git log --oneline
git log --oneline -10
```

**View commits with details:**
```bash
git log -p
git log --stat
```

**View commits for specific file:**
```bash
git log -- filename.txt
```

### Branching Operations

**List all branches:**
```bash
git branch -a
```

**Create and switch to new branch:**
```bash
git checkout -b develop
git checkout -b feature/login-fix
```

**Merge branches:**
```bash
git checkout main
git merge develop
```

**Delete branch (local):**
```bash
git branch -d develop
```

**Delete branch (remote):**
```bash
git push origin --delete develop
```

---

## API Testing Commands

### PowerShell (Windows)

**Test login - LOCAL:**
```powershell
$json = @{ email = 'admin@scl.com'; password = 'password' } | ConvertTo-Json
$response = Invoke-WebRequest -Uri 'http://localhost:4000/api/v1/auth/login' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $json `
    -UseBasicParsing
Write-Host $response.Content
```

**Test login - PRODUCTION:**
```powershell
$json = @{ email = 'admin@scl.com'; password = 'password' } | ConvertTo-Json
$response = Invoke-WebRequest -Uri 'http://sclsandbox.xyz/api/v1/auth/login' `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $json `
    -UseBasicParsing
Write-Host $response.Content
```

**Test frontend - LOCAL:**
```powershell
$response = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
```

**Test frontend - PRODUCTION:**
```powershell
$response = Invoke-WebRequest -Uri 'http://sclsandbox.xyz' -UseBasicParsing
Write-Host "Status: $($response.StatusCode)"
```

**Test API health - LOCAL:**
```powershell
$response = Invoke-WebRequest -Uri 'http://localhost:4000' -UseBasicParsing -ErrorAction SilentlyContinue
if ($response) { Write-Host "Backend is alive" } else { Write-Host "Backend is down" }
```

### Bash/Linux (Server)

**Test login - PRODUCTION:**
```bash
curl -X POST http://185.211.6.60/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scl.com","password":"password"}'
```

**Test via domain:**
```bash
curl -X POST http://sclsandbox.xyz/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scl.com","password":"password"}'
```

**Test frontend:**
```bash
curl -I http://sclsandbox.xyz
```

**Test with verbose output:**
```bash
curl -v -X POST http://sclsandbox.xyz/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scl.com","password":"password"}'
```

**Save response to file:**
```bash
curl -X POST http://sclsandbox.xyz/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scl.com","password":"password"}' \
  -o response.json
```

---

## Troubleshooting Commands

### Check Container Status

**Are containers running?**
```bash
docker ps
docker-compose -f docker-compose.dev.yml ps
```

**Are containers healthy?**
```bash
docker ps --format "table {{.Names}}\t{{.State}}\t{{.Status}}"
```

**Why did container stop?**
```bash
docker logs scli-backend-dev
docker logs --tail 50 scli-backend-dev
```

### Port Issues

**Check if port is in use (Windows PowerShell):**
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :4000
```

**Kill process on port (Windows PowerShell):**
```powershell
$process = Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
Stop-Process -Id $process.OwningProcess -Force
```

**Check if port is listening (Linux/Mac):**
```bash
lsof -i :3000
lsof -i :4000
```

**Kill process on port (Linux/Mac):**
```bash
kill -9 $(lsof -t -i:3000)
```

### Network Issues

**Test connectivity between containers - LOCAL:**
```bash
docker exec scli-backend-dev ping scli-mysql-dev
docker exec scli-nginx-prod curl http://scli-backend-prod:4000/
```

**Check network:**
```bash
docker network ls
docker network inspect scl-institute_scl-network-dev
```

**Check DNS resolution in container:**
```bash
docker exec scli-backend-dev nslookup scli-mysql-dev
```

### Database Issues

**Test database connection - LOCAL:**
```bash
docker exec scli-mysql-dev mysql -u scl_user -pscl_password -e "SELECT 1;"
```

**Test database connection - PRODUCTION:**
```bash
docker exec scli-mysql-prod mysql -u scl_user -pSecureDBPass2026! -e "SELECT 1;"
```

**Check database user permissions:**
```bash
docker exec scli-mysql-dev mysql -u root -prootpassword -e "SELECT user, host FROM mysql.user;"
```

**Check database tables:**
```bash
docker exec scli-mysql-dev mysql -u scl_user -pscl_password scl_institute -e "SHOW TABLES;"
```

### Backend Issues

**Check if backend is responding:**
```bash
curl http://localhost:4000
curl http://185.211.6.60:4000
```

**View backend environment variables:**
```bash
docker exec scli-backend-dev env | grep DB_
docker exec scli-backend-prod env | grep DB_
```

**Check backend logs for errors:**
```bash
docker logs -f scli-backend-dev
docker logs scli-backend-dev | grep -i error
```

### Frontend Issues

**Check if frontend is responding:**
```bash
curl http://localhost:3000
curl http://sclsandbox.xyz
```

**View frontend logs:**
```bash
docker logs -f scli-frontend-dev
docker logs scli-frontend-prod
```

### NGINX Issues (Production)

**Check NGINX configuration:**
```bash
docker exec scli-nginx-prod nginx -t
```

**View NGINX logs:**
```bash
docker logs -f scli-nginx-prod
docker logs scli-nginx-prod | grep error
```

**Check NGINX configuration file:**
```bash
docker exec scli-nginx-prod cat /etc/nginx/nginx.conf
```

**Test NGINX can reach backend:**
```bash
docker exec scli-nginx-prod curl http://scli-backend-prod:4000/
```

### Common Issues & Solutions

**Problem:** Containers won't start
```bash
# Solution 1: Check logs
docker logs scli-backend-dev

# Solution 2: Rebuild
docker-compose -f docker-compose.dev.yml up -d --build

# Solution 3: Fresh start
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

**Problem:** Port already in use
```bash
# Windows
netstat -ano | findstr :4000

# Linux/Mac
lsof -i :4000
```

**Problem:** Database connection fails
```bash
# Check if MySQL is running
docker ps | grep mysql

# Test connection
docker exec scli-mysql-dev mysql -u scl_user -pscl_password -e "SELECT 1;"

# Check logs
docker logs scli-mysql-dev
```

**Problem:** Frontend can't reach API
```bash
# Check if backend is running
docker ps | grep backend

# Test direct connection
curl http://localhost:4000/api/v1/auth/login

# Check frontend API URL
docker exec scli-frontend-dev env | grep VITE_API
```

---

## Environment Comparison

### LOCAL Development
```
Compose File:  docker-compose.dev.yml
Environment:   .env (from .env.development)
Database:      scl_institute
DB User:       scl_user
DB Password:   scl_password
Frontend:      http://localhost:3000
Backend:       http://localhost:4000
MySQL Port:    33061
Network:       scl-network-dev
```

### PRODUCTION Server
```
Compose File:  docker-compose.prod.yml
Environment:   .env (from .env.production)
Database:      scl_institute_prod
DB User:       scl_user
DB Password:   SecureDBPass2026!
Frontend:      http://sclsandbox.xyz
Backend:       http://185.211.6.60:4000
MySQL Port:    3306 (internal only)
Network:       scl-network-prod
SSL:           Available (HTTPS)
```

---

## Quick Command Reference (Cheat Sheet)

### Do This...                                    | Run This Command
|----------------------------------------------|-----------------------------------------------------|
| Start local development                        | `docker-compose -f docker-compose.dev.yml up -d` |
| Stop local development                         | `docker-compose -f docker-compose.dev.yml down` |
| View local logs                                | `docker-compose -f docker-compose.dev.yml logs -f` |
| Start production                               | `ssh root@185.211.6.60` then `docker-compose -f docker-compose.prod.yml up -d` |
| Deploy code to production                      | Push to main branch → SSH to server → `git pull && docker-compose up -d --build` |
| Test local login                               | See "API Testing Commands" section above |
| Check if backend is running                    | `docker ps | grep backend` |
| View database                                  | `docker exec scli-mysql-dev mysql -u scl_user -pscl_password scl_institute` |
| Restart a container                            | `docker-compose -f docker-compose.dev.yml restart scli-backend-dev` |
| Fresh start (delete data)                      | `docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up -d` |
| SSH to production server                       | `ssh root@185.211.6.60` |
| Pull latest code on server                     | `cd /opt/scl-institute && git pull origin main` |

---

## Generated Documentation Date
**Created:** January 25, 2026  
**Last Updated:** January 25, 2026

---

## Related Documentation
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick lookup guide
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Detailed environment explanation
- [README.md](./README.md) - Project overview

