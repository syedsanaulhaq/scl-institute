# Deployment Setup Instructions

## What Was Created

I've created a comprehensive deployment management system with the following components:

### Core Files
1. **`deploy.sh`** - Main deployment script for Linux/Mac
2. **`deploy.ps1`** - Main deployment script for Windows PowerShell
3. **`.env.example`** - Template for development environment variables
4. **`.env.production.example`** - Template for production environment variables

### Documentation
1. **`DEPLOYMENT_SYSTEM_README.md`** - System overview and quick start
2. **`DEPLOYMENT_GUIDE.md`** - Complete workflows and troubleshooting

## System Overview

This system manages three critical operations:

1. **Environment Configuration** - Separate .env files for develop and production
2. **Validation** - Automatic checks before deployment
3. **Health Checks** - Verification after deployment
4. **Git Workflow** - Automated develop → production merging

## Initial Setup (Development Machine)

### Step 1: Copy Environment Template

```bash
# Copy the example environment
cp .env.example .env
```

### Step 2: Edit Environment Variables

```bash
# Edit your local development configuration
nano .env  # or use your editor
```

Update these values for your local setup:
```bash
DB_HOST=scli-mysql
DB_USER=scl_user
DB_PASSWORD=SclSecurePass2024!
DB_NAME=scl_institute
MOODLE_URL=http://localhost:8080
VITE_API_URL=http://localhost:4000/api
```

### Step 3: Make Scripts Executable (Mac/Linux only)

```bash
chmod +x deploy.sh
```

### Step 4: Test the Setup

```bash
# Test deployment to develop environment
./deploy.sh develop            # Linux/Mac
.\deploy.ps1 develop           # Windows PowerShell

# OR validate only without deploying
./deploy.sh develop --validate-only
.\deploy.ps1 develop -ValidateOnly
```

## Remote Server Setup (Already Done)

The remote server (185.211.6.60) already has:
- ✓ `.env.production` file configured
- ✓ Latest deployment scripts
- ✓ All Docker services running

The production `.env.production` has:
```bash
MOODLE_URL=http://185.211.6.60:8888        # Production server
VITE_API_URL=http://185.211.6.60/api       # Production API
```

## Daily Usage

### Scenario 1: Making Local Changes

```bash
# 1. Switch to develop branch
git checkout develop

# 2. Pull latest changes
git pull origin develop

# 3. Create feature branch (optional)
git checkout -b feature/your-feature-name

# 4. Make your changes
# ... edit files ...

# 5. Validate locally
./deploy.sh develop --validate-only

# 6. Deploy to local Docker containers
./deploy.sh develop

# 7. Test your changes
# ... run tests, manual testing ...

# 8. Commit changes
git add .
git commit -m "feat: describe what changed"

# 9. Push to develop
git push origin feature/your-feature-name
# (or git push origin develop if no feature branch)
```

### Scenario 2: Deploying to Production

```bash
# ONE COMMAND - does everything automatically:
./deploy.sh production

# OR validate without deploying:
./deploy.sh production --validate-only
```

What happens automatically:
1. ✓ Switches to production branch
2. ✓ Merges develop into production
3. ✓ Validates all configurations
4. ✓ Pushes to GitHub
5. ✓ Pulls on remote server
6. ✓ Restarts Docker containers
7. ✓ Runs health checks
8. ✓ Reports success/failure

## Key Features

### Prevents Configuration Mistakes

**Before:**
```bash
# ✗ Hardcoded localhost in production
MOODLE_URL=http://localhost:8088

# ✗ Wrong path in URL
MOODLE_URL=http://185.211.6.60:8888/moodle-prod

# ✗ Credentials in docker-compose.yml
```

**Now:**
```bash
# ✓ Separate .env files
# ✓ Validated URLs
# ✓ Secrets in .env files (not in git)
# ✓ Docker uses env_file directive
```

### Automated Validation

The system checks:
- ✓ All required environment variables present
- ✓ docker-compose.yml syntax is valid
- ✓ nginx.conf syntax is valid
- ✓ Backend API responds after deployment
- ✓ Database connection works
- ✓ Moodle LAMP is accessible (production)

### Git Workflow

```
develop branch
     ↓
./deploy.sh production
     ├─ Validates develop ✓
     ├─ Merges to production ✓
     ├─ Pushes to GitHub ✓
     ├─ Pulls on remote ✓
     ├─ Restarts containers ✓
     └─ Health checks ✓
     ↓
production branch updated
     ↓
Remote server running latest code
```

## Commands Quick Reference

### Windows PowerShell

```powershell
# Validate development environment
.\deploy.ps1 develop -ValidateOnly

# Deploy to development
.\deploy.ps1 develop

# Validate before production deploy
.\deploy.ps1 production -ValidateOnly

# Deploy to production
.\deploy.ps1 production

# Deploy without restarting
.\deploy.ps1 develop -NoRestart
```

### Linux/Mac Bash

```bash
# Validate development environment
./deploy.sh develop --validate-only

# Deploy to development
./deploy.sh develop

# Validate before production deploy
./deploy.sh production --validate-only

# Deploy to production
./deploy.sh production

# Deploy without restarting
./deploy.sh develop --no-restart
```

## Environment Variables - Important

### DEVELOPMENT (.env)
```bash
# Use localhost and development ports
DB_HOST=scli-mysql
MOODLE_URL=http://localhost:8080
VITE_API_URL=http://localhost:4000/api
```

### PRODUCTION (.env.production - Remote Only)
```bash
# Use production server IP - NO /moodle-prod path
DB_HOST=scli-mysql
MOODLE_URL=http://185.211.6.60:8888
VITE_API_URL=http://185.211.6.60/api
```

⚠️ **CRITICAL**: Never use `/moodle-prod` in MOODLE_URL

## Git Protection

These files are **PROTECTED** from being committed (in .gitignore):
```bash
.env                    # Local secrets
.env.production          # Production secrets
```

These files **ARE TRACKED** in git (required):
```bash
.env.example            # Template
.env.production.example  # Template  
deploy.sh               # Deployment script
deploy.ps1              # Deployment script
docker-compose.yml      # Docker config
nginx/nginx.conf        # Web server config
```

## Troubleshooting

### Docker not found
```bash
# Windows: Install Docker Desktop
# Or restart PowerShell after installation

# Linux/Mac: Install Docker
brew install docker  # Mac
sudo apt-get install docker.io  # Ubuntu
```

### Git not found
```bash
# Windows: Install Git from https://git-scm.com
# Restart PowerShell after installation

# Linux/Mac
brew install git  # Mac
sudo apt-get install git  # Ubuntu
```

### Permission denied (deploy.sh)
```bash
chmod +x deploy.sh
```

### Health check failed
```bash
# Check if containers are running
docker ps

# Check backend logs
docker logs scli-backend

# Restart containers
docker-compose restart
```

## Documentation

For complete information, see:

1. **DEPLOYMENT_SYSTEM_README.md** - System overview
2. **DEPLOYMENT_GUIDE.md** - Complete workflows and troubleshooting
3. **.env.example** - Environment variable definitions
4. **.env.production.example** - Production environment template

## Next Steps

1. ✓ Copy `.env.example` to `.env`
2. ✓ Edit `.env` for your environment
3. ✓ Run `./deploy.sh develop` to verify setup
4. ✓ Start developing!

When ready to deploy:
1. Make changes in develop branch
2. Test locally with `./deploy.sh develop`
3. Commit and push changes
4. Run `./deploy.sh production` when ready

That's it! The system handles everything else.

---

**Summary:** You now have an automated deployment system that prevents the configuration mess that happened before. Just use `./deploy.sh develop` for local testing and `./deploy.sh production` for production deployment.
