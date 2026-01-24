# ⚡ One-Click Server Setup & Deployment

This is the **all-in-one automated deployment script**. Run this ONE command on your server and everything is done!

---

## 🚀 Deploy Everything in One Command

SSH to your server and run:

```bash
wget https://raw.githubusercontent.com/syedsanaulhaq/scl-institute/main/scripts/deploy-and-verify.sh -O /tmp/deploy-and-verify.sh && \
chmod +x /tmp/deploy-and-verify.sh && \
sudo /tmp/deploy-and-verify.sh
```

**That's it!** ✅

---

## 📋 What This Script Does (Automatically)

### PART 1: DEPLOYMENT ✓
1. ✓ Updates system packages
2. ✓ Installs Docker
3. ✓ Installs Docker Compose
4. ✓ Creates project directory
5. ✓ Clones the GitHub repository
6. ✓ Creates data directories
7. ✓ Builds Docker images
8. ✓ Starts all services
9. ✓ Waits for initialization

### PART 2: VERIFICATION ✓
- ✓ Checks all containers running
- ✓ Tests Frontend service
- ✓ Tests Backend API
- ✓ Tests Moodle LMS
- ✓ Tests MySQL database
- ✓ Verifies configuration files
- ✓ Checks Docker network
- ✓ Provides detailed health report

### PART 3: SUMMARY ✓
- ✓ Shows deployment status
- ✓ Lists next steps
- ✓ Provides login credentials
- ✓ Explains how to monitor services

---

## ⏱️ Estimated Time

| Task | Time |
|------|------|
| System setup | 2 minutes |
| Docker installation | 1 minute |
| Repository clone | 1 minute |
| Docker build | 3-5 minutes |
| Services startup | 1 minute |
| Health checks | 1 minute |
| **TOTAL** | **~10 minutes** |

---

## 📊 Expected Output

The script will show you something like:

```
========================================
SCL Institute - Complete Automated Deployment
========================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1: SYSTEM DEPLOYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[✓] System updated
[✓] Docker installed
[✓] Docker Compose installed
[✓] Project directory: /opt/scl-institute
[✓] Repository ready on main branch
[✓] Data directories created
[✓] Docker images built successfully
[✓] Services started
[✓] Initialization complete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: VERIFICATION & HEALTH CHECKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[✓] scli-frontend-prod is running
[✓] scli-backend-prod is running
[✓] scli-mysql-prod is running
[✓] scli-moodle-prod is running
[✓] scli-nginx-prod is running
[✓] Frontend responding
[✓] Backend API responding
[!] Moodle still initializing (this is OK)
[✓] MySQL database healthy
[✓] Environment configuration found
[✓] Docker network exists

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEPLOYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Passed: 18
! Warnings: 1
✗ Failed: 0

✓ DEPLOYMENT SUCCESSFUL!

NEXT STEPS:
1. UPDATE DNS RECORDS (point to 185.211.6.60)
2. WAIT FOR DNS PROPAGATION (5-15 minutes)
3. ACCESS YOUR SERVICES
   - Frontend: http://sclsandbox.xyz
   - LMS: http://lms.sclsandbox.xyz
   - API: http://185.211.6.60/api
4. LOGIN CREDENTIALS
   - SCL: admin@scl.com / password
   - Moodle: admin / SCLInst!2026
```

---

## ✅ After Deployment

### 1. Update DNS Records

Point to: **185.211.6.60**

| Domain | Type | Value |
|--------|------|-------|
| sclsandbox.xyz | A | 185.211.6.60 |
| lms.sclsandbox.xyz | A | 185.211.6.60 |
| www.sclsandbox.xyz | A | 185.211.6.60 |

### 2. Wait for DNS (5-15 minutes)

Test with:
```bash
nslookup sclsandbox.xyz
```

### 3. Access Services

Once DNS propagates:
- **Frontend**: http://sclsandbox.xyz
- **LMS**: http://lms.sclsandbox.xyz
- **API (IP)**: http://185.211.6.60/api

### 4. Login

**SCL Institute:**
```
Email: admin@scl.com
Password: password
```

**Moodle Admin:**
```
Username: admin
Password: SCLInst!2026
```

---

## 🔍 Monitor After Deployment

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# Check specific service
docker-compose -f docker-compose.prod.yml logs scli-moodle-prod

# Check resource usage
docker stats

# View container status
docker ps

# Check disk space
df -h
```

---

## 🆘 If Something Goes Wrong

### Check logs for errors
```bash
cd /opt/scl-institute
docker-compose -f docker-compose.prod.yml logs
```

### Restart services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Full restart (clean)
```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📝 Custom Configuration

If you need to customize before running, edit:

```bash
nano /opt/scl-institute/.env.production
```

Then restart services:
```bash
cd /opt/scl-institute
docker-compose -f docker-compose.prod.yml restart
```

---

## 🎯 That's It!

**Just run the one command and your server is fully deployed and ready!** 🚀

```bash
wget https://raw.githubusercontent.com/syedsanaulhaq/scl-institute/main/scripts/deploy-and-verify.sh -O /tmp/deploy-and-verify.sh && \
chmod +x /tmp/deploy-and-verify.sh && \
sudo /tmp/deploy-and-verify.sh
```

Questions? Check:
- [PRODUCTION_DEPLOYMENT.md](../PRODUCTION_DEPLOYMENT.md) - Full guide
- [SSH_GUIDE.md](../SSH_GUIDE.md) - SSH help
- GitHub Issues - For specific problems
