# Quick Start Guide - Development vs Production

## 🌿 Git Branches - First Things First!

**Before anything else, make sure you understand our branching strategy:**

- **Working on your laptop (development)**: Always use the **`develop`** branch
- **Production server code**: The **`main`** branch (don't work on main directly!)

```bash
# Start your work
git checkout develop
git pull origin develop

# Create a feature branch
git checkout -b feature/your-feature-name

# Work, test, commit
# When done, create a Pull Request to develop
```

**📖 Read [GIT_WORKFLOW.md](GIT_WORKFLOW.md) for the complete workflow guide**

---

## 🚀 Quick Start

### Development (Local Machine) - 2 Steps

1. **Ensure you're on develop branch**:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Start development environment**:
   ```bash
   ./scripts/start-dev.bat    # Windows
   ./scripts/start-dev.sh     # Linux/Mac
   ```

3. **Access services**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000
   - Moodle: http://localhost:8080

**Stop with**: `./scripts/stop-all.bat` (Windows) or `./scripts/stop-all.sh` (Linux/Mac)

---

## 📋 Environment Overview

### Development Environment
- **Location**: Your local machine
- **Git Branch**: `develop` (your default working branch)
- **Config File**: `.env.development`
- **Docker Compose**: `docker-compose.dev.yml`
- **Purpose**: Development and testing
- **Features**:
  - Hot reload enabled
  - Console logging
  - Database volumes (local)

### Production Environment
- **Location**: Production server
- **Git Branch**: `main` (production-only, requires PR review)
- **Config File**: `.env.production`
- **Docker Compose**: `docker-compose.prod.yml`
- **Purpose**: Live deployment
- **Features**:
  - Auto-restart on failure
  - File-based logging with rotation
  - Optimized performance
  - SSL/TLS support

---

## 🔧 Manual Environment Commands

### Start Development
```bash
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d
```

### Stop Development
```bash
docker-compose -f docker-compose.dev.yml down
```

### View Development Logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Start Production (on server)
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### View Production Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🔐 Security for Production

**Before deploying to production, update these in `.env.production`:**

```env
# Database passwords
DB_PASS=your_secure_password_here
MYSQL_PASSWORD=your_secure_password_here
MYSQL_ROOT_PASSWORD=your_secure_root_password

# Moodle passwords
MARIADB_PASSWORD=your_secure_password_here
MARIADB_ROOT_PASSWORD=your_secure_root_password
MOODLE_PASSWORD=your_production_admin_password

# SSL secret
SSO_SECRET=your_production_secret_key_here
```

---

## 📁 File Structure

```
.env.development              # Development configuration (local)
.env.production               # Production configuration (server)
docker-compose.dev.yml        # Development containers setup
docker-compose.prod.yml       # Production containers setup
scripts/
  └─ start-dev.bat            # Quick start development (Windows)
  └─ start-dev.sh             # Quick start development (Linux/Mac)
  └─ start-prod.bat           # Quick start production (Windows)
  └─ stop-all.bat             # Stop all environments (Windows)
  └─ stop-all.sh              # Stop all environments (Linux/Mac)
ENVIRONMENT_SETUP.md          # Detailed environment documentation
```

---

## 🌐 Service URLs

### Development
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Moodle LMS | http://localhost:8080 |
| MySQL | localhost:33061 |

### Production
| Service | URL |
|---------|-----|
| Frontend | https://sclsandbox.xyz |
| Backend API | https://api.sclsandbox.xyz |
| Moodle LMS | https://lms.sclsandbox.xyz |

---

## 🔄 Git Workflow + Environment Management

### Your Daily Workflow (Development)

```bash
# 1. Each morning, sync with latest develop
git checkout develop
git pull origin develop

# 2. Start your development environment
./scripts/start-dev.bat    # Windows
./scripts/start-dev.sh     # Linux/Mac

# 3. Create a feature branch (use meaningful names)
git checkout -b feature/add-dashboard-cards
# or for bugfixes:
git checkout -b bugfix/fix-login-error

# 4. Work, test, commit
# Edit files, test on http://localhost:3000
git add .
git commit -m "feat(dashboard): add professional module cards"

# 5. Push to your feature branch
git push origin feature/add-dashboard-cards

# 6. When done, create a Pull Request to develop (via GitHub)
# - Go to https://github.com/syedsanaulhaq/scl-institute
# - Click "Create Pull Request"
# - Set: From feature/add-dashboard-cards → To develop

# 7. After approval, merge your PR on GitHub

# 8. Update local develop and cleanup
git checkout develop
git pull origin develop
git branch -d feature/add-dashboard-cards
git push origin --delete feature/add-dashboard-cards
```

### Releasing to Production

```bash
# When develop is stable and ready for production:

# 1. Create a Pull Request on GitHub
# - From: develop → To: main
# - Title: "Release v1.0.0" or "Release: Feb 2026 Update"
# - List all changes

# 2. Get review and approval from team

# 3. Merge to main on GitHub

# 4. On production server:
git checkout main
git pull origin main
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Switching Between Dev and Production Environments

**From Dev to Production** (deploying to server):
```bash
# 1. Stop development
./scripts/stop-all.bat

# 2. On production server, pull latest main
git checkout main
git pull origin main

# 3. Update .env.production with real passwords (if not already done)

# 4. Start production
./scripts/start-prod.bat
```

**From Production back to Dev** (if needed):
```bash
# On production server:
docker-compose -f docker-compose.prod.yml down

# On your local laptop:
./scripts/start-dev.bat
```

---

## 📝 Important: Never Commit Sensitive Data!

**The .gitignore already protects these files:**
- `.env` (never commit!)
- `.env.local`

**But remember:**
- `.env.development` is safe to commit (it's example values)
- `.env.production` is safe to commit (it has placeholder values)
- **ALWAYS** update actual passwords on the production server before deploying!

---

## 🔐 Security for Production

**Before deploying to production, update these in `.env.production`:**

```env
# Database passwords
DB_PASS=your_secure_password_here
MYSQL_PASSWORD=your_secure_password_here
MYSQL_ROOT_PASSWORD=your_secure_root_password

# Moodle passwords
MARIADB_PASSWORD=your_secure_password_here
MARIADB_ROOT_PASSWORD=your_secure_root_password
MOODLE_PASSWORD=your_production_admin_password

# SSL secret
SSO_SECRET=your_production_secret_key_here
```

---

## 📁 File Structure

```
.env.development              # Development configuration (local)
.env.production               # Production configuration (server)
docker-compose.dev.yml        # Development containers setup
docker-compose.prod.yml       # Production containers setup
GIT_WORKFLOW.md               # Complete Git workflow guide
scripts/
  └─ start-dev.bat            # Quick start development (Windows)
  └─ start-dev.sh             # Quick start development (Linux/Mac)
  └─ start-prod.bat           # Quick start production (Windows)
  └─ stop-all.bat             # Stop all environments (Windows)
  └─ stop-all.sh              # Stop all environments (Linux/Mac)
ENVIRONMENT_SETUP.md          # Detailed environment documentation
```

---

## 🌐 Service URLs

### Development (Your Laptop)
| Service | URL | Branch |
|---------|-----|--------|
| Frontend | http://localhost:3000 | develop |
| Backend API | http://localhost:4000 | develop |
| Moodle LMS | http://localhost:8080 | develop |
| MySQL | localhost:33061 | develop |

### Production (Server)
| Service | URL | Branch |
|---------|-----|--------|
| Frontend | https://sclsandbox.xyz | main |
| Backend API | https://api.sclsandbox.xyz | main |
| Moodle LMS | https://lms.sclsandbox.xyz | main |

---

## 📊 Environment + Git Reference

| Aspect | Development | Production |
|--------|-------------|-----------|
| **Git Branch** | `develop` | `main` |
| **Location** | Your laptop | Server |
| **Configuration** | `.env.development` | `.env.production` |
| **Docker Compose** | `docker-compose.dev.yml` | `docker-compose.prod.yml` |
| **Hot Reload** | ✅ Yes | ❌ No |
| **Auto-restart** | ❌ No | ✅ Yes |
| **Logging** | Console | JSON file |
| **Data Persistence** | Local volumes | Production volumes |

---

## ✅ Deployment Checklist for Production

- [ ] All work merged to `develop` branch
- [ ] All reviews approved
- [ ] Code tested on localhost
- [ ] Create PR from develop → main
- [ ] Get approval for production release
- [ ] Merge to main on GitHub
- [ ] Tag version on main (git tag v1.0.0)
- [ ] Pull main on production server
- [ ] Update `.env.production` with real passwords
- [ ] Run `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Test all services on production URLs
- [ ] Verify database connections
- [ ] Monitor logs for errors

---

## 🐛 Troubleshooting

**Container won't start?**
```bash
docker-compose -f docker-compose.dev.yml logs
```

**Database connection error?**
```bash
docker-compose -f docker-compose.dev.yml ps
```

**Port already in use?**
```bash
# Change ports in docker-compose.dev.yml or stop other services
```

**Need to switch branches?**
```bash
# List all branches
git branch -a

# Switch to a branch
git checkout develop
git checkout feature/my-feature

# If you have uncommitted changes, stash them first:
git stash              # Save changes
git checkout develop
git stash pop          # Restore changes later
```

---

## 📖 Full Documentation

- **[GIT_WORKFLOW.md](GIT_WORKFLOW.md)** - Complete Git workflow guide with examples
- **[ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)** - Detailed environment configuration
- **[README.md](README.md)** - Project overview and architecture

