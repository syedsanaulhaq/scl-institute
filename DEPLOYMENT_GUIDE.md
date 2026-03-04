# SCL Institute Deployment Guide

## Overview

This guide explains how to properly manage the develop and production environments for the SCL Institute application.

## Environment Structure

### Develop Environment (Local)
- **Purpose**: Development and testing
- **Configuration**: `.env` file
- **Docker**: Local `docker-compose.yml`
- **Branch**: `develop`

### Production Environment (Remote)
- **Purpose**: Live application server
- **Configuration**: `.env.production` file (remote server only)
- **Docker**: Remote `docker-compose.yml`
- **Branch**: `production`
- **Server**: `185.211.6.60`

## Workflow

### 1. Making Changes in Develop

```bash
# Switch to develop branch
git checkout develop

# Pull latest changes
git pull origin develop

# Create feature branch (optional)
git checkout -b feature/your-feature

# Make your changes
# ... edit files ...

# Validate develop environment locally
./deploy.sh develop --validate-only

# If validation passes, restart containers locally
./deploy.sh develop

# Run your tests locally
# ... test your changes ...

# Commit changes
git add .
git commit -m "Your commit message"

# Push feature branch (if created) or push to develop
git push origin feature/your-feature
# Or if committing directly to develop:
git push origin develop
```

### 2. Deploying to Production

```bash
# Deploy from develop to production (merges and pushes automatically)
./deploy.sh production

# Or validate first without making changes
./deploy.sh production --validate-only

# If validation fails, fix issues in develop and try again
```

### 3. What the Deploy Script Does

#### For Develop:
1. ✓ Validates `.env` file
2. ✓ Validates `docker-compose.yml` syntax
3. ✓ Validates `nginx.conf` 
4. ✓ Restarts Docker containers with environment variables
5. ✓ Performs health checks
6. ✓ Reports any issues

#### For Production:
1. ✓ Ensures develop branch is valid
2. ✓ Checks `.env.production` on remote server
3. ✓ Merges develop → production locally
4. ✓ Validates merged code
5. ✓ Pushes production branch to GitHub
6. ✓ Pulls changes on remote server
7. ✓ Restarts containers on production
8. ✓ Performs remote health checks
9. ✓ Confirms deployment success

## Configuration Files

### `.env` (Development)
```bash
# Copy from .env.example
cp .env.example .env

# Edit with your local values
nano .env

# Required variables:
# - DB_HOST=scli-mysql (Docker hostname)
# - DB_PASSWORD=SclSecurePass2024!
# - MOODLE_URL=http://localhost:8080
# - VITE_API_URL=http://localhost:4000/api
```

### `.env.production` (Production Server Only)
```bash
# On remote server at /root/scl-institute/.env.production
# Copy from .env.production.example if needed

# IMPORTANT: Never commit this file to git
# IMPORTANT: Use correct server IP in MOODLE_URL
# IMPORTANT: MOODLE_URL must NOT have /moodle-prod suffix

# All values should point to production infrastructure
# - DB_HOST=scli-mysql (Docker hostname - same as develop)
# - MOODLE_URL=http://185.211.6.60:8888 (NO PATH SUFFIX)
# - VITE_API_URL=http://185.211.6.60/api
```

## Important Environment Variables

### Moodle URL
```bash
# ✓ CORRECT (root of port 8888)
MOODLE_URL=http://185.211.6.60:8888

# ✗ WRONG (invalid path)
MOODLE_URL=http://185.211.6.60:8888/moodle-prod

# ✓ CORRECT (development)
MOODLE_URL=http://localhost:8080
```

### Database Host
```bash
# In Docker containers (both develop and production):
DB_HOST=scli-mysql  # Docker DNS resolution

# External connections (rare):
DB_HOST=localhost or 185.211.6.60

# NOTE: Always use Docker hostname inside containers
```

### API URL
```bash
# Development:
VITE_API_URL=http://localhost:4000/api

# Production:
VITE_API_URL=http://185.211.6.60/api
# NOT: http://185.211.6.60:80/api
# NOT: http://185.211.6.60:4000/api (port 4000 is internal only)
```

## Common Tasks

### Task 1: Fix a Bug in Develop

```bash
# Ensure you're in develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b fix/bug-name

# Fix the bug
nano filename.js

# Test locally
./deploy.sh develop --validate-only
./deploy.sh develop

# Verify it works
# ... manual testing ...

# Commit and push
git add filename.js
git commit -m "fix: describe what was fixed"
git push origin fix/bug-name

# Create a Pull Request (optional but recommended)
# Then merge to develop on GitHub

# Deploy to production when ready
git checkout develop
git pull origin develop
./deploy.sh production
```

### Task 2: Update Environment Variables

```bash
# For develop (local):
nano .env
./deploy.sh develop

# For production (remote):
# SSH into server
ssh root@185.211.6.60
cd /root/scl-institute

# Edit production environment
nano .env.production

# Restart containers
docker-compose restart

# Verify
curl http://localhost/api/health
```

### Task 3: Rollback Production

```bash
# If production deployment fails:
ssh root@185.211.6.60
cd /root/scl-institute

# View recent commits
git log --oneline -5

# Rollback to previous version
git reset --hard HEAD~1

# Restart containers
docker-compose down
docker-compose up -d

# Verify
curl http://localhost/api/health
```

### Task 4: View Logs

```bash
# Local development
docker logs scli-backend -f
docker logs scli-nginx -f
docker logs scli-mysql -f

# Remote production
ssh root@185.211.6.60
docker logs scli-backend -f
docker logs scli-nginx -f
docker logs scli-mysql -f
```

## Preventing Configuration Issues

### ✓ DO

1. ✓ Always use `.env.example` as a template
2. ✓ Never commit `.env` or `.env.production` files (already in .gitignore)
3. ✓ Use `DB_HOST=scli-mysql` inside Docker containers
4. ✓ Use server IP for external connections
5. ✓ Test in develop before deploying to production
6. ✓ Use the deploy script - don't manually restart containers
7. ✓ Validate configurations with `--validate-only` flag
8. ✓ Create feature branches for new changes
9. ✓ Write descriptive commit messages
10. ✓ Keep docker-compose.yml in git (with env_file directive)

### ✗ DON'T

1. ✗ Don't commit environment files with passwords (`DB_PASSWORD`, `SSO_SECRET`)
2. ✗ Don't hardcode `localhost` in production environment
3. ✗ Don't use incorrect paths in `MOODLE_URL` (no `/moodle-prod`)
4. ✗ Don't restart containers manually without Environment variables
5. ✗ Don't edit production configurations without backing them up
6. ✗ Don't merge directly to production without testing in develop
7. ✗ Don't skip validation before deployment
8. ✗ Don't modify `docker-compose.yml` to hardcode values
9. ✗ Don't expose sensitive variables in docker-compose (use env_file)
10. ✗ Don't deploy at random times - use the structured workflow

## Troubleshooting

### Issue: "Email is required" Error in SSO
- **Cause**: Request body not being forwarded through nginx
- **Solution**: 
  ```bash
  # Restart nginx
  ./deploy.sh develop
  
  # Or verify nginx config
  docker exec scli-nginx nginx -t
  ```

### Issue: Database Connection Failed
- **Cause**: `DB_HOST` incorrect or database not running
- **Solution**:
  ```bash
  # Check if MySQL container is running
  docker ps | grep scli-mysql
  
  # Check database credentials
  cat .env | grep DB_
  
  # Restart database
  docker-compose restart scli-mysql
  ```

### Issue: Moodle Page Not Loading
- **Cause**: `MOODLE_URL` incorrect or LAMP service not running
- **Solution**:
  ```bash
  # SSH to remote server
  ssh root@185.211.6.60
  
  # Check LAMP status
  systemctl status apache2
  systemctl status mysql
  
  # Check environment variable
  cat /root/scl-institute/.env.production | grep MOODLE_URL
  ```

### Issue: Merge Conflict During Deployment
- **Cause**: Develop and production branches diverged
- **Solution**:
  ```bash
  # Abort the deployment
  git merge --abort
  
  # Manually merge develop into production locally
  git checkout develop
  git pull
  git checkout production
  git pull
  git merge develop
  
  # Resolve conflicts
  # Then commit and try deployment again
  git add .
  git commit -m "Merge develop into production (conflict resolution)"
  ./deploy.sh production
  ```

## Monitoring After Deployment

```bash
# Local development
./deploy.sh develop  # Includes health checks

# Remote production
./deploy.sh production  # Includes remote health checks

# Manual health check
curl http://185.211.6.60/api/health

# Check logs
ssh root@185.211.6.60 "docker logs scli-backend | tail -20"
```

## Summary

The deployment workflow is:

1. **Make changes** in develop branch
2. **Test locally** with `./deploy.sh develop`
3. **Commit and push** to develop
4. **Deploy to production** with `./deploy.sh production`
5. **Verify** remote health checks pass
6. **Monitor** logs for any issues

This ensures:
- ✓ No hardcoded configuration values
- ✓ Separate develop and production environments
- ✓ Environment variables properly isolated
- ✓ Docker containers restart with correct config
- ✓ Automated validation before deployment
- ✓ Health checks after deployment
- ✓ Easy rollback if needed
