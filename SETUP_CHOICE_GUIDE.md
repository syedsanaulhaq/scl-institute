# 🔄 Setup Choice Guide: Development vs Production

**Choose Your Setup Based on Your Needs**

---

## ❓ Which Setup Should I Use?

### 🟢 Use DEVELOPMENT Setup If:
- ✅ You're actively developing code
- ✅ You want hot-reload (instant code changes)
- ✅ You need to test frequently
- ✅ You want debugging capabilities
- ✅ You're on your own computer or team dev machine
- ✅ You need to modify database schema safely
- ✅ You want interactive terminals/logs

**→ To Setup Development:** See `DEVELOPMENT_GUIDE.md`

**Quick Start:**
```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts\setup-dev-environment.ps1

# Linux/macOS
chmod +x scripts/setup-dev-environment.sh && ./scripts/setup-dev-environment.sh
```

---

### 🔴 Use PRODUCTION Setup If:
- ✅ You're deploying to a live server
- ✅ You need optimal performance
- ✅ You're using containers in cloud (AWS, Azure, GCP)
- ✅ You need monitoring and logging
- ✅ You're running user-facing system
- ✅ You need automatic restarts and health checks
- ✅ You're setting up on a server (not personal computer)

**→ To Setup Production:** See `DOCKER_DESKTOP_QUICKSTART.md` or `COMPLETE_SETUP_GUIDE.md`

**Quick Start:**
```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts\setup-complete-system.ps1

# Linux/macOS
chmod +x scripts/setup-complete-system.sh && ./scripts/setup-complete-system.sh
```

---

## 🔍 Detailed Comparison

| Feature | Development | Production |
|---------|-------------|------------|
| **Setup Complexity** | Simple (3 steps) | Simple (4 steps) |
| **Hot-Reload** | ✅ Auto code reload | ❌ Rebuild needed |
| **Source Code in Container** | ✅ Mounted/visible | ❌ Built into image |
| **Debug Logs** | ✅ Verbose output | ❌ Minimal logs |
| **Performance** | Good (10-20% slower) | Optimized (fastest) |
| **Memory Usage** | 3-5 GB | 2-4 GB |
| **Frontend Port** | 3000 | 3000 |
| **Backend Port** | 4000 | 4000 |
| **MySQL Port** | **33061** | 3306 |
| **Moodle Port** | **9090** | 8080 |
| **Build Image Size** | 1.2 GB | 800 MB |
| **Startup Time** | 30-45 seconds | 20-30 seconds |
| **Use Case** | Active coding | Live users |
| **Who Uses It** | Developers | Users/Customers |
| **Cost** | Low | Varies |
| **Monitoring** | Basic | Advanced (metrics, alerts) |
| **Auto-Restart** | Manual | Automatic |
| **SSL/TLS** | Optional | Required |
| **Backup Strategy** | Manual | Automated |

---

## 📊 Technical Architecture Difference

### Development Setup
```
Your Computer
  ├─ Docker Desktop
  │   ├─ Container: Frontend (hot-reload), code mounted
  │   ├─ Container: Backend (hot-reload), code mounted  
  │   ├─ Container: MySQL (dev data)
  │   └─ Container: Moodle (testing)
  │
  └─ Source Code (visible, editable)
      ├─ frontend/src/ → mounted in container
      └─ backend/ → mounted in container
```

### Production Setup
```
Production Server (Cloud/Dedicated)
  ├─ Docker Engine
  │   ├─ Container: Frontend (optimized image)
  │   ├─ Container: Backend (optimized image)
  │   ├─ Container: MySQL (production data)
  │   └─ Container: Moodle (live LMS)
  │
  ├─ NGINX (Reverse Proxy + Load Balancer)
  ├─ Monitoring (Prometheus, Grafana)
  ├─ Logs (Centralized logging)
  └─ Backups (Automated daily)
```

---

## 💻 How to Use on Another Computer

### Option 1: Setup Development on Another Dev Computer
```bash
# On Team Developer's Computer 1
git clone https://github.com/syedsanaulhaq/scl-institute.git
powershell -ExecutionPolicy Bypass -File scripts\setup-dev-environment.ps1
# → Same hot-reload development environment

# On Team Developer's Computer 2
git clone https://github.com/syedsanaulhaq/scl-institute.git
powershell -ExecutionPolicy Bypass -File scripts\setup-dev-environment.ps1
# → Identical development environment
```

### Option 2: Setup Production on Server
```bash
# On Production Server
git clone https://github.com/syedsanaulhaq/scl-institute.git
bash scripts/setup-complete-system.sh
# → Production-optimized, user-facing system
```

### Option 3: Setup One of Each
```bash
# Developer Computer 1 (Development)
powershell -ExecutionPolicy Bypass -File scripts\setup-dev-environment.ps1
# Hot-reload, debugging, active development

# Server (Production)
bash scripts/setup-complete-system.sh  
# User-facing, optimized, monitored

# Developer Computer 2 (Development)
powershell -ExecutionPolicy Bypass -File scripts\setup-dev-environment.ps1
# Same as Computer 1 for consistency
```

---

## 🚀 Your Scenario: Shifting to Another Computer

**You said:** "I'm shifting the system to another computer"

### If for Development (Team Coding):
```bash
# On original computer
git push origin main  # Already done! ✓

# On new developer computer
git clone https://github.com/syedsanaulhaq/scl-institute.git
cd scl-institute
powershell -ExecutionPolicy Bypass -File scripts\setup-dev-environment.ps1
# → Identical development environment starts!
```

**Result:** 
- ✅ Same hot-reload
- ✅ Same ports (3000, 4000, etc.)
- ✅ Same database schema
- ✅ Same code changes reflected instantly
- ✅ Team can develop in parallel

---

### If for Production (Live System):
```bash
# On original computer (staging)
git push origin main  # Already done! ✓

# On production server
git clone https://github.com/syedsanaulhaq/scl-institute.git
cd scl-institute
bash scripts/setup-complete-system.sh
# → Production system starts!
```

**Result:**
- ✅ Optimized performance
- ✅ Real users accessing at sclsandbox.xyz
- ✅ Monitoring and alerts
- ✅ Automated backups
- ✅ SSL/TLS security
- ✅ 99%+ uptime

---

## 🔄 Switching Between Dev & Prod

If you have both environments and need to switch:

```bash
# Currently on DEVELOPMENT
docker-compose -f docker-compose.dev.yml down

# Switch to PRODUCTION
docker-compose -f docker-compose.prod.yml up -d

# Or vice versa
docker-compose -f docker-compose.dev.yml up -d
```

**Note:** Different ports mean they DON'T conflict!
- Can run BOTH at same time
- Dev on 3000, Prod on 3000+ (or different machine)
- Both use different MySQL ports (33061 vs 3306)

---

## 📋 Pre-Setup Checklist

### Before Running Setup Script

**For Development:**
- [ ] Docker Desktop installed
- [ ] Git installed
- [ ] Have VS Code or editor ready
- [ ] At least 8 GB RAM free
- [ ] 50 GB disk space
- [ ] Internet connection

**For Production:**
- [ ] Cloud server provisioned (AWS/Azure/GCP) or dedicated server
- [ ] Linux installed (Ubuntu 20.04+)
- [ ] Docker and Docker Compose installed
- [ ] Domain name pointing to server
- [ ] SSL certificate available
- [ ] Database backup strategy defined
- [ ] Monitoring configured
- [ ] Firewall rules set up

---

## ❓ FAQ

**Q: Can I switch from development to production setup?**
A: Yes! Just copy environment files and switch the docker-compose file. Data will be fresh.

**Q: What if I want both running?**
A: Run them on different machines OR different ports. They don't conflict.

**Q: Can I push code from development to production?**
A: Yes! Commit to Git, pull on production server, rebuild Docker image.

**Q: What about database migration?**
A: Dev and prod can have same schema. You can backup dev and restore to prod.

**Q: Which is faster?**
A: Production (no hot-reload overhead, optimized images)

**Q: Which is easier to use?**
A: Development (simplest setup, auto-reload, better for active work)

---

## 🎯 Recommended Setup for Your Use Case

**You're shifting the system to another computer:**

### If the other computer is for...

**👨‍💻 Development/Testing:**
```bash
Use: setup-dev-environment.ps1
Reason: Hot-reload, debugging, active development
Result: Same experience as current computer
```

**🌍 Live Users:**
```bash
Use: setup-complete-system.ps1
Reason: Production-optimized, secure, monitored
Result: Stable system for end users
```

**🤝 Team Collaboration:**
```bash
All developers use: setup-dev-environment.ps1
Same environment on all dev machines
Consistent experience = fewer bugs
```

---

## 🚀 Next Steps

1. **Decide:** Development or Production?
2. **Check:** Do you have prerequisites installed?
3. **Read:** Full guide for your choice
   - Dev: DEVELOPMENT_GUIDE.md
   - Prod: COMPLETE_SETUP_GUIDE.md or DOCKER_DESKTOP_QUICKSTART.md
4. **Run:** Appropriate setup script
5. **Verify:** Services are running
6. **Start:** Using the system!

---

## 📞 Quick Command Reference

**START DEVELOPMENT:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-dev-environment.ps1
```

**START PRODUCTION:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-complete-system.ps1
```

**STOP ALL SERVICES:**
```bash
# Development
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose -f docker-compose.prod.yml down
```

**VIEW LOGS:**
```bash
# Development
docker-compose -f docker-compose.dev.yml logs -f

# Production
docker-compose -f docker-compose.prod.yml logs -f
```

---

**Ready to setup?** Pick your guide and get started! 🚀

---

**Created**: January 28, 2026  
**Version**: 1.0
