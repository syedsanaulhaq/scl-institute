# Production Deployment - Quick Start Guide

**Status:** Ready to Begin  
**Strategy:** Safe parallel LAMP installation with data migration  
**Timeline:** ~1 day (LAMP setup + 1 week monitoring)  

---

## ✅ Pre-Deployment Checklist

Before starting, confirm you have:

- [ ] SSH access to production server
- [ ] Production server IP/hostname
- [ ] sudo/root credentials on production
- [ ] Secure storage for backups (external drive, cloud, etc.)
- [ ] Moodle admin password ready
- [ ] Database credentials noted

---

## 🔒 Step 1: BACKUP Production (CRITICAL)

**Run on production server:**

```bash
# SSH to production
ssh root@production-server-ip

# Make script executable and run
chmod +x /path/to/backup-prod.sh
./backup-prod.sh

# Verify backup created
ls -lh /backups/production-*/
cat /backups/production-*/BACKUP_MANIFEST.txt
```

**What gets backed up:**
- ✓ Docker volumes (MySQL data, Moodle DB, Moodle files)
- ✓ Database exports (SQL dumps)
- ✓ Docker configuration
- ✓ System state (containers, volumes, images)
- ✓ Checksums for verification

**Time:** 30-60 minutes (depends on data size)

---

## 🔧 Step 2: Install LAMP on Production

**Run on production server:**

```bash
# SSH to production
ssh root@production-server-ip

# Make script executable
chmod +x /path/to/install-lamp-prod.sh

# Run installation (no arguments or set admin password)
./install-lamp-prod.sh "YourSecurePassword123"

# Monitor installation
tail -f /var/log/apache2/moodle-prod-error.log
```

**What gets installed:**
- ✓ Apache 2 web server
- ✓ MariaDB database
- ✓ PHP 8.x with all extensions
- ✓ Moodle 4.5.10+ (matching dev environment)
- ✓ Ready for Attendance plugin

**Time:** 15-20 minutes

**After installation:**
1. Access Moodle at `http://production-ip:8080/moodle-prod`
2. Complete the installation wizard
3. Use credentials:
   - Database: moodle
   - User: moodleuser
   - Password: moodlepass
4. Set admin password during wizard (secure it!)

---

## 📊 Step 3: Sync Development Data to Production

**This exports 24 synced courses + 888 requirements from dev to prod**

**Run on development machine:**

```bash
# Make script executable
chmod +x ./sync-data-to-prod.sh

# Run sync (provide production server IP and user)
./sync-data-to-prod.sh production-server-ip root

# Example:
./sync-data-to-prod.sh 192.168.1.100 root
```

**What gets synced:**
- ✓ 24 Moodle courses to production LAMP
- ✓ 888 compliance requirements
- ✓ 72 sign-off records
- ✓ Course mappings and metadata

**Time:** 10-15 minutes (depending on network)

**After sync:**
1. Verify courses appeared in production Moodle dashboard
2. Check sync endpoint works:
   ```bash
   curl http://production-ip:4000/api/inductions?from_moodle=true
   ```
3. Verify counts in databases:
   ```bash
   # On prod: mysql -u moodleuser -pmoodlepass moodle
   SELECT COUNT(*) FROM mdl_course WHERE id > 1;
   ```

---

## 🚀 Step 4: Deploy Backend with LAMP Config

**Update production backend to use LAMP Moodle:**

```bash
# SSH to production
ssh root@production-server-ip

# Navigate to project
cd /path/to/scl-institute

# Update docker-compose.prod.yml with these LAMP settings:
# MOODLE_DATABASE_HOST=production-lamp-server (use IP or hostname)
# MOODLE_DATABASE_PORT=3306
# MOODLE_DATABASE_USER=moodleuser
# MOODLE_DATABASE_PASSWORD=moodlepass
# MOODLE_DATABASE_NAME=moodle

# Rebuild backend container
docker-compose -f docker-compose.prod.yml up -d scli-backend --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f scli-backend

# Wait for healthy status
docker-compose -f docker-compose.prod.yml ps scli-backend
```

**Verify connection:**
```bash
curl http://production-ip:4000/api/health
curl http://production-ip:4000/api/inductions?from_moodle=true
```

**Time:** 10 minutes

---

## ✓ Step 5: Verify Data Integrity

**Test that everything synced correctly:**

```bash
# Check inductions were created
curl http://production-ip:4000/api/inductions | jq '.data | length'
# Should show: 24

# Check requirements were synced
curl http://production-ip:4000/api/inductions/1 | jq '.data.requirements | length'
# Should show: 37 (one per course)

# Verify Moodle course count
ssh root@production-server-ip \
  mysql -u moodleuser -pmoodlepass moodle -N \
  -e "SELECT COUNT(*) as courses FROM mdl_course WHERE id > 1;"
# Should show: 24 (or similar, depending on how many synced)
```

**Time:** 5 minutes

---

## 📋 Step 6: Monitor & Verify (1 Week)

**Watch production for stability:**

```bash
# Daily checks
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs --tail=100 scli-backend
curl http://production-ip:4000/api/health

# Check error logs
tail -f /var/log/apache2/moodle-prod-error.log
```

**Verify:**
- ✓ Backend connects to LAMP Moodle successfully
- ✓ Inductions display correctly
- ✓ Course sync works
- ✓ No connection errors in logs
- ✓ Admin can sign off on requirements
- ✓ Performance is acceptable

**Time:** 7 days of monitoring

---

## 🔄 Step 7: Graduate to Full LAMP (After 1 Week Proven)

**Once LAMP is stable, disable Docker Moodle:**

```bash
# SSH to production
ssh root@production-server-ip

# Stop (but don't delete) Docker Moodle
docker-compose -f docker-compose.prod.yml stop scli-moodle scli-moodle-db

# Archive old Moodle data (for recovery if needed)
tar czf /backups/docker-moodle-final-$(date +%Y%m%d).tar.gz \
  /var/lib/docker/volumes/scli_moodle_db_data_prod/_data

# Update docker-compose.prod.yml:
# - Remove or comment out scli-moodle and scli-moodle-db services
# - Ensure backend points to LAMP only

# Restart backend (will now use only LAMP)
docker-compose -f docker-compose.prod.yml up -d scli-backend --build

# Verify
curl http://production-ip:4000/api/inductions?from_moodle=true
```

**Time:** 30 minutes

---

## 🔙 Rollback Plan (If Something Fails)

**Emergency recovery:**

```bash
# SSH to production
ssh root@production-server-ip

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restore from backup (see backup manifest)
docker volume rm scli_mysql_data_prod
docker volume create scli_mysql_data_prod
docker run --rm -v scli_mysql_data_prod:/data -v /backups/production-<timestamp>:/backup \
  mysql:8.0 tar xzf /backup/scli-mysql-volume-<timestamp>.tar.gz -C /data

# Restart services
docker-compose -f docker-compose.prod.yml up -d

# Verify restore
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs scli-backend
```

---

## 📋 Files Ready for Use

All files are in your project root:

| File | Purpose |
|------|---------|
| `PRODUCTION_DEPLOYMENT_PLAN.md` | Comprehensive deployment guide |
| `backup-prod.sh` | Full backup script (run first!) |
| `install-lamp-prod.sh` | LAMP + Moodle installation |
| `sync-data-to-prod.sh` | Sync dev courses to prod |

---

## 🎯 Command Sequence Summary

**On Production Server:**
```bash
# 1. Backup (CRITICAL - DO FIRST)
./backup-prod.sh

# 2. Install LAMP
./install-lamp-prod.sh "AdminPassword123"

# Wait 30 mins for Apache/MySQL to start
sleep 1800

# 3. Access Moodle installer (web browser or curl)
# http://prod-ip:8080/moodle-prod/install.php
```

**On Development Machine:**
```bash
# 4. Sync data from dev to prod
./sync-data-to-prod.sh production-server-ip root

# 5. Deploy updated backend
ssh root@production-server-ip
docker-compose -f docker-compose.prod.yml up -d scli-backend --build
```

**On Production Server:**
```bash
# 6. Verify everything
curl http://localhost:4000/api/health
curl http://localhost:4000/api/inductions?from_moodle=true

# 7. Monitor for 1 week
docker-compose -f docker-compose.prod.yml logs -f scli-backend
```

---

## ⚠️ Important Notes

1. **Always backup first** - Do not skip this step
2. **Test in staging first** - If possible, use a staging server to verify
3. **Keep backups** - Retain for 90 days minimum
4. **Monitor carefully** - Watch logs for errors during first week
5. **Document everything** - Record passwords, IPs, decisions
6. **Gradual migration** - Don't rush to disable Docker Moodle
7. **Communicate** - Notify users of any changes/downtime

---

## 📞 Troubleshooting

| Problem | Solution |
|---------|----------|
| LAMP MySQL won't start | Check: `sudo systemctl status mysql`, review `/var/log/mysql/error.log` |
| Apache moodle-prod not found | Verify: `a2ensite moodle-prod.conf`, `apache2ctl configtest`, `systemctl reload apache2` |
| Moodle installer not loading | Check port 8080 is open: `sudo netstat -tuln \| grep 8080` |
| Backend can't reach LAMP | Verify: LAMP is running, firewall allows port 3306, database user exists |
| Sync fails | Check: MySQL credentials correct, databases exist, courses table structure matches |

---

## Next Actions

1. ✅ Review this guide with your team
2. ✅ Confirm production server access
3. ✅ Schedule backup window
4. ✅ Begin Phase 1 (Backup)
5. ✅ Proceed with Phase 2+ after backup confirmed

**Ready to start? Confirm:**
- [ ] Production server IP/hostname
- [ ] Production user for SSH
- [ ] Backup location is secure
- [ ] Team is aware of timeline
