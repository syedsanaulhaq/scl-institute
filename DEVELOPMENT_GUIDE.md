# 🚀 SCL-Institute DEVELOPMENT ENVIRONMENT Setup Guide

**Version**: 2.0  
**Created**: January 28, 2026  
**Purpose**: Full development environment setup for local development  

---

## ⚡ Ultra-Fast Development Setup (3 Steps)

### Step 1: Install Prerequisites
```bash
# Windows: Download and install
# - Docker Desktop: https://www.docker.com/products/docker-desktop
# - Git: https://git-scm.com/download/win

# Linux/macOS: Install via package manager
sudo apt install docker.io docker-compose git  # Ubuntu/Debian
brew install docker docker-compose git  # macOS
```

### Step 2: Clone Repository
```bash
cd ~/projects  # or your desired location
git clone https://github.com/syedsanaulhaq/scl-institute.git
cd scl-institute
```

### Step 3: Run Development Setup

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-dev-environment.ps1
```

**Linux/macOS:**
```bash
chmod +x scripts/setup-dev-environment.sh
./scripts/setup-dev-environment.sh
```

That's it! Your development environment is running! 🎉

---

## 🐳 What Gets Started in Docker

### Development Services (in Docker containers)

| Service | Port | Features | Container Name |
|---------|------|----------|-----------------|
| **Frontend** (React Vite) | **3000** | Hot-reload, live code changes | `scli-frontend-dev` |
| **Backend** (Node.js) | **4000** | Hot-reload, debug logs | `scli-backend-dev` |
| **MySQL Database** | **33061** | Full database (37 tables) | `scli-mysql-dev` |
| **Moodle LMS** | **9090** | Full Moodle 4.3 with SSO | `scli-moodle-dev` |

**Key Difference from Production:**
- ✅ **Hot-reload**: Code changes reflect immediately (no rebuild)
- ✅ **Source mapping**: Containers have your source code mounted
- ✅ **Debug mode**: Enhanced logging and error messages
- ✅ **Development DB**: Same schema as production (37 tables)
- ✅ **Different ports**: Doesn't conflict with other services

---

## 📊 Development vs Production Comparison

| Aspect | Development | Production |
|--------|-------------|------------|
| **Docker Compose** | `docker-compose.dev.yml` | `docker-compose.prod.yml` |
| **Environment File** | `.env.development` | `.env.production` |
| **Frontend Port** | 3000 | 3000 |
| **Backend Port** | 4000 | 4000 |
| **MySQL Port** | **33061** | 3306 |
| **Moodle Port** | **9090** | 8080 |
| **Hot-reload** | ✅ Yes | ❌ No |
| **Source Mapping** | ✅ Mounted | ❌ Built in image |
| **Debug Logs** | ✅ Verbose | ❌ Minimal |
| **Performance** | Good | Optimized |
| **Purpose** | Active development | Live users |

---

## 🎯 Using Development Environment

### Start Development
```bash
# These commands run within the project directory

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Or use convenience script (already running from setup)
```

### View Logs in Real-Time
```bash
# All services logs
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f scli-frontend-dev
docker-compose -f docker-compose.dev.yml logs -f scli-backend-dev
docker-compose -f docker-compose.dev.yml logs -f scli-mysql-dev

# Last 50 lines only
docker-compose -f docker-compose.dev.yml logs --tail=50
```

### Monitor Container Status
```bash
# View running containers
docker-compose -f docker-compose.dev.yml ps

# Watch live stats (CPU, Memory, Network)
docker stats

# Check specific container
docker exec scli-frontend-dev npm list
```

### Stop/Start Services
```bash
# Stop all services (data preserved)
docker-compose -f docker-compose.dev.yml down

# Start again
docker-compose -f docker-compose.dev.yml up -d

# Restart specific service
docker-compose -f docker-compose.dev.yml restart scli-backend-dev

# Full rebuild and restart
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### Database Access

**Via Command Line:**
```bash
# Access MySQL shell
docker exec -it scli-mysql-dev mysql -u scl_user -p
# When prompted, enter: scl_password

# Run queries
docker exec scli-mysql-dev mysql -u scl_user -p scl_institute -e "SELECT * FROM users LIMIT 5;"

# Backup database
docker exec scli-mysql-dev mysqldump -u scl_user -p scl_institute > backup.sql
# When prompted, enter: scl_password
```

**Via MySQL Workbench/DBeaver:**
```
Host: localhost:33061
User: scl_user
Password: scl_password
Database: scl_institute
```

---

## 🔥 Hot-Reload Development Features

### Frontend Hot-Reload (React Vite)
```bash
# Edit any file in frontend/src/
# Changes appear automatically in browser
# Example:
cd frontend/src
# Edit App.jsx
# -> Browser auto-refreshes with changes
```

### Backend Hot-Reload (Node.js)
```bash
# Edit any file in backend/
# Changes automatically picked up by nodemon
# Example:
cd backend
# Edit routes/api.js
# -> Server restarts and new code is loaded
```

### No Build Required!
- ✅ Edit code
- ✅ Save
- ✅ See changes in browser immediately
- ❌ No build step needed
- ❌ No container rebuild needed

---

## 🔧 Customizing Development Environment

### Edit Environment Variables
```bash
# Open .env.development in your editor
# Edit any values:
# - Database credentials
# - API URLs
# - Moodle settings
# - Feature flags
# - Ports (if needed)

# Apply changes
docker-compose -f docker-compose.dev.yml restart
```

**Important Variables:**
```bash
# Frontend API URL
VITE_API_URL=http://localhost:4000/api

# Database
DB_HOST=scli-mysql-dev
DB_USER=scl_user
DB_PASS=scl_password

# Moodle
MOODLE_URL=http://localhost:9090
MOODLE_USERNAME=admin
MOODLE_PASSWORD=SCLInst!2026

# Debug
NODE_ENV=development
VITE_ENV=development
```

### Change Ports (if Conflicts)
```bash
# Edit docker-compose.dev.yml
# Change port mappings:
# Example: Change frontend from 3000 to 3001
ports:
  - "3001:3000"  # Changed from 3000:3000

# Restart containers
docker-compose -f docker-compose.dev.yml restart
```

---

## 💻 IDE/Editor Integration

### VS Code Development Setup

1. **Install Extensions:**
   - Docker (Microsoft)
   - Remote - Containers (Microsoft)
   - Prettier (code formatter)
   - ESLint
   - Thunder Client (API testing)

2. **Run Frontend & Backend Servers:**
   ```bash
   # In terminal 1: Frontend
   cd frontend && npm run dev
   
   # In terminal 2: Backend
   cd backend && npm start
   ```

3. **Use Docker Containers:**
   - Open VS Code command palette: `Ctrl+Shift+P`
   - Search: "Remote-Containers: Open Folder in Container"
   - Select `frontend` or `backend` folder

### Debugging

**Node.js Backend Debugging:**
```bash
# In docker-compose.dev.yml, add to backend:
# ports:
#   - "9229:9229"  # Debug port
# command: node --inspect=0.0.0.0:9229 index.js

# In VS Code, create .vscode/launch.json:
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Docker",
      "port": 9229,
      "address": "localhost",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}

# Set breakpoints and debug!
```

**Frontend React Debugging:**
- Use browser DevTools (F12)
- React DevTools Browser Extension
- Thunder Client for API testing
- Network tab to see API calls

---

## 🧪 Testing Development Setup

### Health Check Script
```bash
# Create dev-health-check.ps1 (Windows)
cat > dev-health-check.ps1 << 'EOF'
echo "=== SCL-Institute Development Health Check ==="

# Frontend
Write-Host "Frontend: " -NoNewline
curl.exe -s -o $null -w "%{http_code}" "http://localhost:3000"

# Backend
Write-Host "Backend: " -NoNewline
curl.exe -s -o $null -w "%{http_code}" "http://localhost:4000/health"

# Moodle
Write-Host "Moodle: " -NoNewline
curl.exe -s -o $null -w "%{http_code}" "http://localhost:9090"

# MySQL
Write-Host "MySQL: " -NoNewline
docker exec scli-mysql-dev mysql -u scl_user -pscl_password -e "SELECT 1;" > $null && echo "200" || echo "500"
EOF

./dev-health-check.ps1
```

### Verify All Services
```bash
# Check containers running
docker-compose -f docker-compose.dev.yml ps

# Should show:
# scli-frontend-dev       Up
# scli-backend-dev        Up
# scli-mysql-dev          Up
# scli-moodle-dev         Up
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:4000/health

# Should return:
# {"status":"ok"}

# Test database connection
curl http://localhost:4000/api/test-db

# List users (if endpoint exists)
curl http://localhost:4000/api/users
```

---

## 🆘 Troubleshooting Development Issues

### Issue: "Container crashes immediately"
**Solution:**
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs scli-backend-dev

# Rebuild image
docker-compose -f docker-compose.dev.yml build --no-cache scli-backend-dev

# Restart
docker-compose -f docker-compose.dev.yml up -d
```

### Issue: "Hot-reload not working"
**Solution:**
```bash
# Ensure volumes are mounted correctly
docker-compose -f docker-compose.dev.yml config | grep -A 5 volumes:

# Should show source code volumes mounted
# Example: ./backend:/app

# Restart container
docker-compose -f docker-compose.dev.yml restart scli-backend-dev

# Check file system notifications (Linux)
cat /proc/sys/fs/inotify/max_user_watches  # Should be > 8000
```

### Issue: "Port already in use"
**Solution:**
```bash
# Find what's using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in docker-compose.dev.yml
```

### Issue: "Database connection refused"
**Solution:**
```bash
# Check MySQL is running
docker-compose -f docker-compose.dev.yml ps scli-mysql-dev

# Check credentials in .env.development
cat .env.development | grep DB_

# Verify MySQL is responding
docker exec scli-mysql-dev mysql -u scl_user -pscl_password -e "SELECT 1;"

# Restart MySQL
docker-compose -f docker-compose.dev.yml restart scli-mysql-dev
```

### Issue: "Out of memory or too slow"
**Solution:**
```bash
# Check Docker resource allocation
docker system df

# Linux: Increase system limits
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Windows: Docker Desktop Settings > Resources
# Increase Memory to 10+ GB
```

---

## 📋 Development Workflow

### Typical Day Development Flow

```bash
# 1. Start the day
docker-compose -f docker-compose.dev.yml up -d

# 2. Work on code
# Edit frontend/src/App.jsx (auto-reloads in browser)
# Edit backend/routes/api.js (auto-reloads on server)

# 3. Monitor progress
docker-compose -f docker-compose.dev.yml logs -f

# 4. Test changes
curl http://localhost:4000/api/endpoint  # Test API

# 5. Database changes
docker exec scli-mysql-dev mysql -u scl_user -pscl_password scl_institute -e "SELECT * FROM users;"

# 6. End of day
docker-compose -f docker-compose.dev.yml down
```

### Making Database Schema Changes

```bash
# 1. Update database_schema.sql with new table/column
# 2. Recreate MySQL container
docker-compose -f docker-compose.dev.yml down -v  # Remove volume
docker-compose -f docker-compose.dev.yml up -d    # Recreate with new schema

# 3. Or apply migrations
docker exec scli-mysql-dev mysql -u scl_user -pscl_password scl_institute < migration.sql
```

### Adding New Dependencies

**Backend:**
```bash
# Install npm package
docker exec -it scli-backend-dev npm install express dotenv

# The package.json is updated, container picks it up automatically
```

**Frontend:**
```bash
# Install npm package
docker exec -it scli-frontend-dev npm install axios

# The vite dev server rebuilds automatically
```

---

## 🚀 Pushing Changes to Production

### Before Deploying
```bash
# 1. Test thoroughly on development
docker-compose -f docker-compose.dev.yml logs -f

# 2. Run any linting
docker exec scli-frontend-dev npm run lint
docker exec scli-backend-dev npm run lint

# 3. Commit to git
git add .
git commit -m "Feature: Description of changes"
git push origin main

# 4. On production server
git pull origin main
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📈 Development Performance Tips

1. **Use .dockerignore:**
   ```
   node_modules
   .git
   logs
   *.sh
   ```

2. **Limit log output:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs --tail=50 -f
   ```

3. **Monitor resources:**
   ```bash
   docker stats --no-stream
   ```

4. **Clean up periodically:**
   ```bash
   docker system prune -a
   docker volume prune
   ```

---

## 📚 Next Steps

1. ✅ Development environment started
2. 📝 Read project documentation
3. 🧑‍💻 Open VS Code and start coding
4. 🔗 Test API endpoints
5. 🗄️ Create test data in database
6. 🚀 Deploy to production when ready

---

## 📞 Quick Reference

```bash
# Development commands
docker-compose -f docker-compose.dev.yml up -d       # Start
docker-compose -f docker-compose.dev.yml down        # Stop
docker-compose -f docker-compose.dev.yml ps          # Status
docker-compose -f docker-compose.dev.yml logs -f     # View logs
docker-compose -f docker-compose.dev.yml restart     # Restart

# Database
docker exec -it scli-mysql-dev mysql -u scl_user -p  # Connect
docker exec scli-mysql-dev mysqldump -u scl_user -p scl_institute > backup.sql  # Backup

# Building
docker-compose -f docker-compose.dev.yml build       # Build images
docker-compose -f docker-compose.dev.yml pull        # Update images

# Debugging
docker-compose -f docker-compose.dev.yml logs -f --tail=100    # Last 100 lines
docker exec scli-backend-dev npm list                # Check dependencies
docker system df                                      # Disk usage
```

---

**Congratulations!** 🎉  
Your SCL-Institute development environment is ready!

Happy coding! 💻✨

---

**Version**: 2.0  
**Last Updated**: January 28, 2026  
**Status**: Production Ready for Development
