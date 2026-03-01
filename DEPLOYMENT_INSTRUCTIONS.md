# Production Deployment Instructions

## Current Status
- ✅ Code committed to `develop` branch (commit: `2c714f9`)
- ✅ Code merged to `production` branch (commit: `4506774`)
- ✅ Both branches pushed to GitHub
- ⏳ Server deployment pending

## Production Server Details
- **Server:** 185.211.6.60
- **SSH User:** root
- **Project Path:** /root/scl-institute
- **Docker Compose:** docker-compose.prod.yml

## Changes Deployed
```
✅ frontend/src/pages/CourseInductionsDetail.jsx (NEW)
✅ frontend/src/pages/CourseInductions.jsx (UPDATED)
✅ frontend/src/App.jsx (UPDATED with routing)
```

## Manual Deployment Steps

### Option 1: SSH & Git (Recommended)
```bash
# SSH to server
ssh root@185.211.6.60

# Navigate to project
cd /root/scl-institute

# Initialize git (if not already)
git init
git remote add origin https://github.com/syedsanaulhaq/scl-institute.git

# Fetch and checkout production branch
git fetch origin production
git checkout production

# Verify latest code
git log --oneline -n 3

# Restart docker containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Verify containers are running
docker-compose -f docker-compose.prod.yml ps
```

### Option 2: Docker Pull & Rebuild
```bash
ssh root@185.211.6.60
cd /root/scl-institute

# Pull latest images and rebuild
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Option 3: Manual File Copy
If SSH/git is problematic, copy updated frontend files directly:
```bash
# Build frontend on local machine
cd frontend
npm run build

# Copy dist to server
scp -r dist/. root@185.211.6.60:/root/scl-institute/frontend/dist/

# Restart only frontend container
ssh root@185.211.6.60 'cd /root/scl-institute && docker-compose -f docker-compose.prod.yml restart frontend'
```

## Verification

### Check Frontend
```
curl http://185.211.6.60:3000/course-inductions
```

### Check Logs
```bash
ssh root@185.211.6.60
cd /root/scl-institute
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs backend
```

## Rollback (if needed)
```bash
ssh root@185.211.6.60
cd /root/scl-institute
git checkout <previous-commit>
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## Git Commits to Deploy
- **Develop:** `2c714f9` - feat: restructure course inductions - form + table layout with compact design
- **Production:** `4506774` - merge: Course Inductions redesign from develop to production

---
**Note:** Follow the "develop → test → approve → production" workflow for all future changes.
