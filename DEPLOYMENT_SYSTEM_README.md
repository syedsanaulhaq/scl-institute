# Deployment Management System

## Overview

This automated deployment system ensures that the develop and production environments remain properly configured and synchronized, preventing configuration mismatches like the ones that occurred previously.

## Files in This System

### Core Scripts
- **`deploy.sh`** - Linux/Mac deployment script (recommended)
- **`deploy.ps1`** - Windows PowerShell deployment script

### Configuration Templates
- **`.env.example`** - Template for development environment variables
- **`.env.production.example`** - Template for production environment variables

### Documentation
- **`DEPLOYMENT_GUIDE.md`** - Complete deployment guide with workflows and troubleshooting
- **`README.md`** (this file) - Overview and quick start

## Quick Start

### 1. Setup (One Time)

```bash
# Clone environment template
cp .env.example .env

# Edit with your values
nano .env

# Make script executable (Linux/Mac)
chmod +x deploy.sh
```

### 2. Daily Development

```bash
# Make changes
git checkout develop
# ... edit files ...

# Validate and deploy to local containers
./deploy.sh develop                    # Linux/Mac
.\deploy.ps1 develop                   # Windows PowerShell

# Commit and push
git add .
git commit -m "your message"
git push origin develop
```

### 3. Deploy to Production

```bash
# One command - validates, merges, pushes, and deploys
./deploy.sh production                 # Linux/Mac
.\deploy.ps1 production                # Windows PowerShell
```

## Key Features

✓ **Environment Validation** - Checks all required variables are present
✓ **Configuration Safety** - Prevents hardcoded values in git
✓ **Automated Health Checks** - Verifies services are working after deployment
✓ **Clean Git Workflow** - Manages develop → production merging
✓ **Windows & Linux Support** - Works on any platform
✓ **Easy Rollback** - Git-based version control for quick recovery
✓ **Comprehensive Logging** - Clear output showing what's happening

## Workflow

### Develop Environment
```
Your Local Machine
     ↓
Edit Code (develop branch)
     ↓
./deploy.sh develop  ← Validates and restarts containers locally
     ↓
Test Locally
     ↓
git push origin develop
```

### Production Environment
```
develop branch Ready
     ↓
./deploy.sh production  ← Does everything:
     ↓                    1. Validates develop
     ├─ Merges develop → production locally
     ├─ Validates merged code
     ├─ Pushes to GitHub
     ├─ SSH pulls on remote server
     ├─ Restarts containers remotely
     └─ Runs remote health checks
     ↓
Production Server Updated
```

## Environment Configuration

### Development (.env)
```bash
DB_HOST=scli-mysql                      # Docker hostname
MOODLE_URL=http://localhost:8080        # Local development
VITE_API_URL=http://localhost:4000/api  # Local API
```

### Production (.env.production - Remote Only)
```bash
DB_HOST=scli-mysql                      # Docker hostname (same)
MOODLE_URL=http://185.211.6.60:8888     # Production server
VITE_API_URL=http://185.211.6.60/api    # Production API
```

## Common Commands

```bash
# Validate without deploying
./deploy.sh develop --validate-only
.\deploy.ps1 develop -ValidateOnly

# Deploy specific environment
./deploy.sh develop
./deploy.sh production

# View deployment guide
less DEPLOYMENT_GUIDE.md
```

## What Gets Validated

### Environment Files
- ✓ All required variables present
- ✓ No syntax errors
- ✓ Proper URLs (no /moodle-prod paths)

### Docker Configuration
- ✓ `docker-compose.yml` syntax
- ✓ `nginx.conf` syntax
- ✓ All services can start

### After Deployment
- ✓ Backend API responds at /api/health
- ✓ Database connection works
- ✓ Moodle LAMP is accessible (production only)

## Preventing the Previous Issues

| Issue | How We Prevent It |
|-------|-------------------|
| Hardcoded development URLs in production | Environment variables via `.env.production` |
| Wrong Moodle path (/moodle-prod) | Validation checks MOODLE_URL format |
| Containers restarting without env vars | docker-compose uses `env_file` directive |
| Database credential mismatches | Variables kept in .env files (not git) |
| Skipping validation before deploy | Scripts validate automatically |
| Manual configuration changes getting lost | Everything in code or env files |
| Merge conflicts during deploy | Git workflow managed by script |

## Important Security Notes

```bash
# NEVER commit these files:
.env                      # Local development secrets
.env.production            # Production secrets

# ALWAYS commit these files:
docker-compose.yml        # Uses env_file: directive
nginx/nginx.conf          # Uses variables for values
.env.example              # Template (no actual values)
.env.production.example    # Template (no actual values)
```

## Troubleshooting

### Script won't run
- **Windows**: Ensure PowerShell execution policy allows scripts
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- **Linux/Mac**: Make script executable
  ```bash
  chmod +x deploy.sh
  ```

### Health check failing
```bash
# Check logs
docker logs scli-backend
docker logs scli-nginx

# Restart containers manually
docker-compose restart
```

### Docker not found
- Ensure Docker Desktop is installed and running
- Restart your terminal after Docker installation

## See Also

- **`DEPLOYMENT_GUIDE.md`** - Complete guide with detailed workflows
- **`.env.example`** - Development environment template
- **`.env.production.example`** - Production environment template
- **`docker-compose.yml`** - Docker services configuration
- **`nginx/nginx.conf`** - Web server configuration

## Support

For issues or questions:
1. Check `DEPLOYMENT_GUIDE.md` troubleshooting section
2. Review deployment logs carefully
3. Check Docker logs: `docker logs <container-name>`
4. Use `--validate-only` flag to dry-run deployment
