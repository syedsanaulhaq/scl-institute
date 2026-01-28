# Fresh Development Reset Guide

## What Does This Script Do?

The fresh development reset script (`fresh-dev-reset.ps1` for Windows or `fresh-dev-reset.sh` for Linux/macOS) is a **complete cleanup and reinstall script** that:

1. **Stops & Removes** all existing Docker containers
2. **Deletes** all Docker volumes (database, Moodle data, logs)
3. **Removes** the entire project directory
4. **Clones** a fresh copy from GitHub
5. **Sets up** a brand new development environment
6. **Starts** all services from scratch

### Perfect For:
- ✅ Completely cleaning up after failed setups
- ✅ Starting fresh for testing
- ✅ Resetting database to initial state
- ✅ Troubleshooting persistent Docker issues
- ✅ Creating clean environment on new machines

### ⚠️ WARNING:
**ALL DATA WILL BE PERMANENTLY DELETED!**
- Local database records
- Moodle data and configurations
- Any manual changes to files
- Docker containers and volumes

---

## How to Use

### Windows (PowerShell)

#### Option 1: Basic Usage (Recommended)
```powershell
cd E:\SCL-Projects
powershell -ExecutionPolicy Bypass -File SCL-Institute\scripts\fresh-dev-reset.ps1
```

#### Option 2: With Custom Project Path
```powershell
powershell -ExecutionPolicy Bypass -File SCL-Institute\scripts\fresh-dev-reset.ps1 -ProjectPath "my-scl-institute"
```

#### Option 3: Skip Confirmation (Use with Caution!)
```powershell
powershell -ExecutionPolicy Bypass -File SCL-Institute\scripts\fresh-dev-reset.ps1 -SkipConfirmation
```

#### Steps After Running:
1. Script displays **big red warning**
2. You **MUST** type **`YES`** in UPPERCASE to proceed
3. If you don't type "YES", nothing happens - safe abort
4. Script proceeds with cleanup and setup
5. Takes approximately **5-10 minutes** total

---

### Linux / macOS (Bash)

#### Option 1: Basic Usage (Recommended)
```bash
cd ~/projects
bash SCL-Institute/scripts/fresh-dev-reset.sh
```

#### Option 2: With Custom Project Path
```bash
bash SCL-Institute/scripts/fresh-dev-reset.sh my-scl-institute
```

#### Option 3: Skip Confirmation (Use with Caution!)
```bash
bash SCL-Institute/scripts/fresh-dev-reset.sh scl-institute true
```

#### Make Script Executable (One-time)
```bash
chmod +x SCL-Institute/scripts/fresh-dev-reset.sh
```

Then use:
```bash
./SCL-Institute/scripts/fresh-dev-reset.sh
```

---

## Step-by-Step What Happens

### Step 1: Prerequisites Check (30 seconds)
```
✓ Docker installed?
✓ Docker Compose installed?
✓ Docker Desktop running?
```

### Step 2: Stop & Remove Containers (1-2 minutes)
```
Stops: Development containers
Stops: Production containers
Remove: Orphaned containers
```

### Step 3: Delete Docker Volumes (30 seconds)
```
Finds all SCL-related volumes
Deletes: scl-mysql-dev, scl-backend-dev, etc.
WARNING: Database data is GONE
```

### Step 4: Remove Project Directory (30 seconds)
```
Deletes: Entire scl-institute/ folder
Deletes: All local files and changes
```

### Step 5: Clone Fresh Repository (1-2 minutes)
```
Clones: https://github.com/syedsanaulhaq/scl-institute.git
Downloads: All project files
Gets: Latest code from GitHub
```

### Step 6: Setup Directory Structure (30 seconds)
```
Creates: data/mysql/
Creates: data/moodle/
Creates: logs/
Creates: backups/
Creates: screenshots/
```

### Step 7: Configure Environment (30 seconds)
```
Copies: .env.development → .env
Prepares: database_schema.sql (37 tables)
```

### Step 8: Start Docker Containers (2-3 minutes)
```
Builds: Fresh Docker images
Starts: Frontend (React Vite)
Starts: Backend (Node.js)
Starts: MySQL Database
Starts: Moodle LMS
```

### Step 9: Verify Status (1-2 minutes)
```
Waits: 45 seconds for services to fully initialize
Checks: Frontend http://localhost:3000
Checks: Backend http://localhost:4000
Displays: Running containers
Shows: Access credentials
```

---

## After Script Completes Successfully

### ✨ Environment is Ready at:

| Service | URL/Port | User | Password |
|---------|----------|------|----------|
| Frontend | http://localhost:3000 | - | - |
| Backend | http://localhost:4000 | - | - |
| Moodle | http://localhost:9090 | admin | SCLInst!2026 |
| MySQL | localhost:33061 | scl_user | scl_password |

### 📋 Database Status:
- **Fresh**: All 37 tables created automatically
- **Empty**: No data loaded (clean slate)
- **Ready**: Can start adding data

### 🎯 Source Code:
- **Fresh**: Latest from GitHub
- **Mounted**: Source code available in containers
- **Hot-reload**: Enabled for frontend and backend
- **Edit here**: `/scl-institute/frontend/` and `/backend/`

---

## Quick Commands After Setup

### View Logs
```powershell
# PowerShell
docker-compose -f docker-compose.dev.yml logs -f

# Bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Stop All Services
```powershell
# PowerShell
docker-compose -f docker-compose.dev.yml down

# Bash
docker-compose -f docker-compose.dev.yml down
```

### Restart Services
```powershell
# PowerShell
docker-compose -f docker-compose.dev.yml restart

# Bash
docker-compose -f docker-compose.dev.yml restart
```

### Access MySQL Database
```powershell
# PowerShell
docker exec -it scli-mysql-dev mysql -u scl_user -pscl_password

# Bash
docker exec -it scli-mysql-dev mysql -u scl_user -pscl_password
```

### View Running Containers
```powershell
# PowerShell
docker-compose -f docker-compose.dev.yml ps

# Bash
docker-compose -f docker-compose.dev.yml ps
```

### View Docker Volume List
```powershell
# PowerShell
docker volume ls | findstr "scli"

# Bash
docker volume ls | grep scli
```

---

## Troubleshooting

### Issue: "Docker Desktop is NOT running!"
**Solution:**
1. Click Windows Start menu
2. Search for "Docker Desktop"
3. Click to launch
4. Wait for icon to appear in system tray
5. Try script again

### Issue: "Failed to clone repository"
**Solution:**
1. Check internet connection
2. Check if GitHub is accessible
3. Verify git is installed: `git --version`
4. Try again in a few minutes

### Issue: "Permission denied" on Linux/macOS
**Solution:**
```bash
chmod +x scripts/fresh-dev-reset.sh
bash scripts/fresh-dev-reset.sh
```

### Issue: Services not starting after script finishes
**Solution:**
```bash
# PowerShell
docker-compose -f docker-compose.dev.yml up -d

# Bash
docker-compose -f docker-compose.dev.yml up -d
```

### Issue: "Cannot connect to localhost:3000"
**Causes & Solutions:**
1. Services still starting (wait 2-3 more minutes)
2. Port in use: `docker-compose -f docker-compose.dev.yml restart`
3. Docker not running: Start Docker Desktop
4. Check: `docker-compose -f docker-compose.dev.yml ps`

### Issue: Database not creating tables
**Solution:**
```bash
# Manually run schema
docker exec scli-mysql-dev mysql -u scl_user -pscl_password < database_schema.sql
```

### Issue: Want to Partially Reset

**Only stop containers (keep data):**
```powershell
# PowerShell
docker-compose -f docker-compose.dev.yml down

# Bash
docker-compose -f docker-compose.dev.yml down
```

**Restart containers (without reset):**
```powershell
# PowerShell
docker-compose -f docker-compose.dev.yml up -d

# Bash
docker-compose -f docker-compose.dev.yml up -d
```

**Remove only database volume (keep everything else):**
```powershell
# PowerShell
docker volume rm scli-mysql-vol-dev

# Bash
docker volume rm scli-mysql-vol-dev
```

---

## Comparison: When to Use Each Script

| Task | Script to Use |
|------|---------------|
| Complete cleanup & fresh start | ✅ **fresh-dev-reset.ps1/.sh** |
| Just stop containers | `docker-compose down` |
| Restart containers | `docker-compose up -d` |
| Reset database only | `docker volume rm scli-mysql-vol-dev` |
| Initial setup on new machine | `setup-dev-environment.ps1/.sh` |
| Setup production instead | `setup-complete-system.ps1/.sh` |

---

## Complete Fresh Reset Workflow

### Scenario: "Complete reset everything and start fresh"

**Windows (PowerShell):**
```powershell
# Navigate to project directory
cd E:\SCL-Projects\SCL-Institute

# Run fresh reset
powershell -ExecutionPolicy Bypass -File scripts\fresh-dev-reset.ps1

# Type: YES
# Wait: 5-10 minutes
# Result: ✅ Clean development environment ready
```

**Linux/macOS (Bash):**
```bash
# Navigate to project directory
cd ~/projects/SCL-Institute

# Make executable
chmod +x scripts/fresh-dev-reset.sh

# Run fresh reset
bash scripts/fresh-dev-reset.sh

# Type: YES
# Wait: 5-10 minutes
# Result: ✅ Clean development environment ready
```

---

## Important Notes

### Safety Features Built-in:
- ✅ **Requires confirmation**: Must type "YES" in UPPERCASE
- ✅ **Clear warnings**: Big red text explaining what will be deleted
- ✅ **No silent deletion**: Cannot accidentally run with wrong parameters
- ✅ **Abortable**: Type anything except "YES" to safely cancel
- ✅ **Exit on error**: Script stops at any critical failure

### What You Get After:
- ✅ **37-table database**: All tables created automatically
- ✅ **Fresh code**: Latest from GitHub main branch
- ✅ **Hot-reload enabled**: Instant code changes without rebuild
- ✅ **Clean slate**: No previous data or configurations
- ✅ **Ready to develop**: All services running and healthy

### What You Lose:
- ✗ All local database data
- ✗ Any local file modifications
- ✗ Moodle course configurations
- ✗ User data and records
- ✗ Docker containers and volumes

---

## Support & Help

If you encounter issues:

1. **Check logs**: `docker-compose -f docker-compose.dev.yml logs`
2. **Review DEVELOPMENT_GUIDE.md**: Comprehensive troubleshooting section
3. **Check SETUP_CHOICE_GUIDE.md**: If unsure about Dev vs Prod
4. **Verify prerequisites**: Docker, Docker Compose, Git installed
5. **Try again**: Sometimes services need a few minutes to fully start

---

## Summary

The **fresh-dev-reset script** is your nuclear option for:
- Complete environment cleanup
- Fresh development restart
- Troubleshooting persistent issues
- Testing full deployment workflow

**Use with confidence** - it's designed to be safe with built-in confirmations, but **understand what it does** - it will delete everything and rebuild from scratch.

**Time needed:** ~5-10 minutes from start to ready development environment.
