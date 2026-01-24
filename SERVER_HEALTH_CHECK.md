# 🔍 Server Health Check - Quick Guide

## Run This on Your Server to Verify Everything

SSH into your server and run this command to check server health:

```bash
wget https://raw.githubusercontent.com/syedsanaulhaq/scl-institute/main/scripts/server-health-check.sh -O /tmp/health-check.sh && \
chmod +x /tmp/health-check.sh && \
bash /tmp/health-check.sh
```

---

## What It Checks

The health check script verifies:

✅ **System Requirements**
- OS and kernel info
- Uptime
- RAM and disk space

✅ **Docker Installation**
- Docker version
- Docker Compose version
- Docker daemon running

✅ **Project Setup**
- Project directory exists
- Required files present
- Git branch is correct

✅ **Running Containers**
- Frontend running
- Backend running
- MySQL running
- Moodle running
- NGINX running

✅ **Service Health**
- Frontend responds (port 3000)
- Backend API responds (port 4000)
- Moodle responds (port 8080)
- MySQL database healthy

✅ **Network Configuration**
- Port 80 (HTTP) is open
- Port 443 (HTTPS) ready
- Docker network exists

✅ **Environment Setup**
- Production environment configured
- Domain names configured
- Backend URL configured

✅ **Data volumes**
- MySQL data volume healthy
- Moodle data volume healthy
- Database backup volume exists

✅ **Log files**
- Log directory exists
- Log files are being written

✅ **DNS/Domain Test**
- Server IP detected
- Host header routing tested

---

## Expected Output

### If Everything is Good ✅

```
✓ Passed: 35
! Warnings: 0
✗ Failed: 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ SERVER IS HEALTHY AND READY!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next steps:
  1. Update DNS records to point domains to: 185.211.6.60
  2. Wait 5-15 minutes for DNS propagation
  3. Access services at:
     - Frontend:  http://sclsandbox.xyz
     - LMS:       http://lms.sclsandbox.xyz
     - API (IP):  http://185.211.6.60/api
```

### If There Are Issues ⚠️

```
✓ Passed: 30
! Warnings: 3
✗ Failed: 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✗ SERVER HAS 1 CRITICAL ISSUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please fix the failures above and try again.
For help, check PRODUCTION_DEPLOYMENT.md troubleshooting section.
```

---

## Common Issues & Fixes

### Moodle not responding
- Moodle takes 5-10 minutes to start on first deployment
- Wait a few minutes and run health check again
- Check logs: `docker-compose -f docker-compose.prod.yml logs scli-moodle-prod`

### MySQL connection issue
- Database may still be initializing
- Wait 2-3 minutes and try again
- Check MySQL container: `docker-compose -f docker-compose.prod.yml logs scli-mysql-prod`

### Some containers not running
- Run: `docker-compose -f docker-compose.prod.yml restart`
- Check logs: `docker-compose -f docker-compose.prod.yml logs`

### Disk space low
- Check: `df -h`
- Delete old logs: `docker logs --tail 0 <container_name>`

---

## Next Steps After Healthy Check ✅

1. **Update DNS Records**
   - Point these domains to **185.211.6.60**:
     - `sclsandbox.xyz` → A record → 185.211.6.60
     - `lms.sclsandbox.xyz` → A record → 185.211.6.60
     - `www.sclsandbox.xyz` → A record → 185.211.6.60

2. **Wait for DNS Propagation**
   - Takes 5-15 minutes typically
   - Test with: `nslookup sclsandbox.xyz`

3. **Test Access**
   - Open browser and visit:
     - http://sclsandbox.xyz
     - http://lms.sclsandbox.xyz
     - http://185.211.6.60/api

4. **Setup SSL (Optional but Recommended)**
   - Install Certbot: `sudo apt-get install certbot python3-certbot-nginx`
   - Get certificates: `sudo certbot certonly --standalone -d sclsandbox.xyz -d lms.sclsandbox.xyz`

5. **Monitor Services**
   - View logs: `docker-compose -f docker-compose.prod.yml logs -f`
   - Check resource usage: `docker stats`

---

## Manual SSH Commands

If you prefer to check manually:

```bash
# Check running containers
docker ps

# View all logs
docker-compose -f docker-compose.prod.yml logs

# Check specific service
docker-compose -f docker-compose.prod.yml logs scli-backend-prod

# Test API
curl http://localhost:4000/api

# Test frontend
curl http://localhost:3000

# Test Moodle
curl http://localhost:8080

# Check MySQL
docker exec -it scli-mysql-prod mysql -u root -p
# (use MYSQL_ROOT_PASSWORD from .env.production)

# View resource usage
docker stats

# Check disk space
df -h
```

---

## Where to Go Next

- **Full Deployment Guide**: [PRODUCTION_DEPLOYMENT.md](../PRODUCTION_DEPLOYMENT.md)
- **Quick Start**: [DEPLOY_NOW.md](../DEPLOY_NOW.md)
- **Troubleshooting**: [PRODUCTION_DEPLOYMENT.md#-troubleshooting](../PRODUCTION_DEPLOYMENT.md#-troubleshooting)
- **GitHub Repository**: https://github.com/syedsanaulhaq/scl-institute

---

**Run the health check and let me know the results!** 🚀
