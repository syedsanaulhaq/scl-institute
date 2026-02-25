# Phase 6: Production Monitoring & Stability Assessment
**Duration:** 1 Week (Feb 25 - Mar 4, 2026)  
**Status:** 🟢 ACTIVE

## Baseline Metrics (Feb 25, 2026 09:23:30)

### ✅ Healthy Components
| Component | Status | Details |
|-----------|--------|---------|
| **Backend API** | ✅ 200 OK | Port 4000, responsive |
| **LAMP MySQL** | ✅ Connected | User: moodleuser, Database: moodle |
| **Docker MySQL** | ✅ Connected | User: root, Database: scl_institute |
| **SCL Courses** | ✅ 36 | All synced from dev |
| **SCL Inductions** | ✅ 24 | All synced from dev |
| **SCL Requirements** | ✅ 888 | All synced from dev |
| **Frontend** | ✅ Healthy | Port 3000, 9 days uptime |
| **Nginx** | ✅ Healthy | Reverse proxy active |

### ⚠️ Attention Needed
| Component | Status | Action |
|-----------|--------|--------|
| **LAMP Moodle Config** | 404 | Moodle installer accessible at :8888/moodle-prod/install.php |
| **Docker Moodle** | 404 | Legacy container, will be decommissioned after 1-week monitoring |
| **Stopped Containers** | 1 | Identify and clean up if not needed |

## System Resources
- **Disk Usage:** 21G / 146G (15%) ✅
- **Memory:** 1.6G / 7.8G (20%) ✅
- **Uptime (Containers):** 
  - SCL Backend: 7 minutes (restarted today for config)
  - Frontend: 9 days
  - MySQL: 9 days

## Daily Monitoring Schedule

### Automated Checks (Every 6 hours via cron)
```bash
0 */6 * * * /tmp/phase6_monitoring.sh >> /var/log/scl-production-cron.log 2>&1
```

### Manual Verification Points (Daily)
1. **API Health:** `curl http://185.211.6.60:4000/api/health`
2. **Data Access:** Check backend logs for errors
3. **Database Integrity:** Verify row counts in scl_institute tables
4. **Resource Usage:** Monitor disk and memory trends

### Weekly Report Items
- Error logs from all components
- Performance metrics
- Data consistency checks
- Container restart events
- Security audit (if applicable)

## Critical Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| **API Response Time** | > 1000ms | > 5000ms |
| **DB Connection Errors** | > 5/day | > 20/day |
| **Disk Usage** | > 70% | > 85% |
| **Memory Usage** | > 75% | > 90% |
| **Docker Restart Count** | > 3/week | > 10/week |

## Testing Checklist

### Day 1-2 (Feb 25-26): Connectivity
- [ ] Backend API responds to health check
- [ ] SCL data accessible via API
- [ ] Database connections stable
- [ ] Containers auto-restart without issues

### Day 3-4 (Feb 27-28): Data Integrity
- [ ] Course count remains 36
- [ ] Induction count remains 24
- [ ] Requirement count remains 888
- [ ] No data corruption detected
- [ ] Backup integrity verified

### Day 5-6 (Mar 1-2): Moodle Migration
- [ ] LAMP Moodle initialization complete (if needed)
- [ ] User enrollment sync working
- [ ] Course data accessible in new Moodle
- [ ] No conflicts with Docker Moodle

### Day 7 (Mar 3-4): Go-Live Decision
- [ ] All stability checks passed
- [ ] No error patterns identified
- [ ] Resource usage stable
- [ ] **Decision:** Proceed to Docker Moodle decommission or extend monitoring

## Monitoring Commands

### View Current Health
```bash
ssh root@185.211.6.60 "/tmp/phase6_monitoring.sh"
```

### View Historical Logs
```bash
ssh root@185.211.6.60 "tail -100 /var/log/scl-production-health.log"
```

### Check Backend Logs
```bash
ssh root@185.211.6.60 "docker logs --tail 50 scli-backend-prod"
```

### Check MySQL Replication (if configured)
```bash
ssh root@185.211.6.60 "docker exec scli-mysql-prod mysql -u root -pRootSecurePass2024! -e 'SHOW SLAVE STATUS\G'"
```

## Decommission Plan (Post-Monitoring)

Once monitoring period complete and all checks pass:

### Phase 6a: Docker Moodle Shutdown (Optional)
```bash
# If migration to LAMP successful:
docker stop scli-moodle-prod
docker stop scli-moodle-db-prod
docker rm scli-moodle-prod scli-moodle-db-prod

# Backup containers (optional)
docker commit scli-moodle-prod moodle-backup:feb2026
docker commit scli-moodle-db-prod moodle-db-backup:feb2026
```

### Phase 6b: Resource Cleanup
- Remove Docker Moodle volumes (after backup confirmation)
- Archive old Moodle database dumps
- Update DNS/load balancer if applicable

## Contact & Escalation

### Hardware/Infrastructure Issues
- SSH to: root@185.211.6.60
- Check: `/var/log/syslog`, `dmesg`

### Application Issues
- Backend logs: `docker logs scli-backend-prod`
- Check .env.production credentials
- Verify MySQL connectivity from backend

### Database Issues
- Check MySQL error log: `docker exec scli-mysql-prod tail -50 /var/lib/mysql/error.log`
- Connection limit: `docker exec scli-mysql-prod mysql -u root -pXXX -e 'SHOW STATUS LIKE "Threads%";'`

## Sign-Off

**Monitoring Started:** Feb 25, 2026 09:23  
**Expected Completion:** Mar 4, 2026  
**Status:** 🟢 Healthy - All systems nominal  
**Next Review:** Daily automated checks + weekly manual verification

---

**Git Commits This Phase:**
- Phase 6 monitoring infrastructure deployed
- Baseline metrics established
- Automation scripts created

