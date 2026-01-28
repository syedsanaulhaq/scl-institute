# 🐳 SCL-Institute - Docker Desktop Quick Start Guide

**For Windows Users**  
**Created**: January 28, 2026  
**Version**: 2.0

---

## ⚡ Ultra-Fast Setup (5 Steps)

### Step 1: Install Docker Desktop
1. Download: https://www.docker.com/products/docker-desktop
2. Run installer → Next → Install → Restart computer
3. Launch Docker Desktop (from Start menu or search)
4. Wait for "Docker is running" message in taskbar

### Step 2: Install Git
1. Download: https://git-scm.com/download/win
2. Run installer → Accept defaults → Finish
3. Verify: Open PowerShell and type `git --version`

### Step 3: Clone the Project
```powershell
# Open PowerShell in your desired folder
cd C:\Projects

# Clone the repository
git clone https://github.com/syedsanaulhaq/scl-institute.git
cd scl-institute
```

### Step 4: Run Setup Script
```powershell
# Run the setup script (it handles everything!)
powershell -ExecutionPolicy Bypass -File scripts\setup-complete-system.ps1
```

**The script will automatically:**
- ✅ Clone/update repository
- ✅ Create all folders
- ✅ Configure environment
- ✅ Start Docker containers (4 containers)
- ✅ Initialize database (37 tables)
- ✅ Display credentials and URLs

### Step 5: Access Your System
```
Frontend:  http://localhost:3000
Backend:   http://localhost:4000
Moodle:    http://localhost:8080
Database:  localhost:3306
```

---

## 🎯 What Gets Started in Docker Desktop

| Service | Port | Status | Management |
|---------|------|--------|------------|
| Frontend (React) | 3000 | ✓ Running | Docker Desktop > Containers |
| Backend API | 4000 | ✓ Running | Docker Desktop > Containers |
| MySQL Database | 3306 | ✓ Running | Docker Desktop > Containers |
| Moodle LMS | 8080 | ✓ Running | Docker Desktop > Containers |

All 4 containers run inside Docker Desktop on your machine!

---

## 📊 Using Docker Desktop to Manage Your System

### View Containers (Easy Way)
1. Open **Docker Desktop** application
2. Click **Containers** tab on left
3. You'll see all 4 services running:
   - `scli-frontend-prod`
   - `scli-backend-prod`
   - `scli-mysql-prod`
   - `scli-moodle-prod`

### View Container Logs
1. Open Docker Desktop
2. Click **Containers** tab
3. Click any container name
4. Scroll to see **Logs** tab
5. View real-time logs

### Check System Resources
1. Open Docker Desktop
2. Click **Resources** tab
3. See CPU, Memory, Disk usage
4. Can adjust resource limits here

### Stop/Start Services
1. Open Docker Desktop
2. Click the **Stop** button (⏸️) to stop all containers
3. Click **Play** button (▶️) to start again

---

## 💻 Command Line (Advanced)

If you prefer terminal commands:

```powershell
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f scli-mysql-prod

# Stop all services
docker-compose down

# Start services again
docker-compose -f docker-compose.prod.yml up -d

# View live stats
docker stats

# Connect to database
docker exec -it scli-mysql-prod mysql -u scl_admin -p

# Backup database
docker exec scli-mysql-prod mysqldump -u scl_admin -p scl_institute > backup.sql

# View disk usage
docker system df

# Clean up unused files
docker system prune
```

---

## 🔧 Docker Desktop Settings (Recommended)

### Optimize Performance
1. Open **Docker Desktop**
2. Click gear icon (⚙️) **Settings**
3. Go to **Resources**:
   - **CPUs**: Set to 4-6 cores (you have ~8+ cores)
   - **Memory**: Set to 8-12 GB (you have 16+ GB)
   - **Disk**: 100 GB or more
   - **Swap**: 2 GB

4. Go to **Network**:
   - Enable DNS name resolution ✓
   
5. Go to **General**:
   - Start Docker Desktop on login ✓
   - Watch for updates ✓

6. Click **Apply & Restart**

### Performance Tips
- Keep Docker Desktop running in background (taskbar)
- Close Docker Desktop when not using it (saves RAM)
- Don't run heavy apps with Docker if RAM is limited
- Use `docker system prune` monthly to clean up

---

## 🌐 Access Your Applications

### Frontend (React App)
- **URL**: http://localhost:3000
- What to see: Login page of SCL Institute
- Default user: admin@scl.com / password

### Backend API
- **URL**: http://localhost:4000
- Test it: http://localhost:4000/health
- Should return JSON: `{"status":"ok"}`

### Moodle LMS
- **URL**: http://localhost:8080
- Admin user: admin
- Admin password: Moodle@123
- This is the learning management system

### Database (MySQL)
- **Host**: localhost
- **Port**: 3306
- **User**: scl_admin
- **Password**: securePassword123!
- Use MySQL client or connect from app

---

## 🆘 Troubleshooting

### Issue: "Docker is Not Running"
**Solution:**
1. Click Windows Start button
2. Search "Docker Desktop"
3. Click it to launch
4. Wait 30 seconds for "Docker is running" message
5. Check taskbar for Docker icon

### Issue: "Port Already in Use"
**Solution:**
```powershell
# Find what's using the port (e.g., 3000)
netstat -ano | findstr :3000

# Kill the process
taskkill /PID [PID_NUMBER] /F

# Or change the port in docker-compose.prod.yml
```

### Issue: "Out of Memory" Errors
**Solution:**
1. Open Docker Desktop > Settings > Resources
2. Increase Memory to 10+ GB
3. Click Apply & Restart
4. Run: `docker-compose restart`

### Issue: Database Connection Failed
**Solution:**
```powershell
# Check MySQL is running
docker-compose logs scli-mysql-prod

# Restart MySQL
docker-compose restart scli-mysql-prod

# Wait 30 seconds, then try again
```

### Issue: Can't Access http://localhost:3000
**Solution:**
```powershell
# Check if frontend is running
docker-compose ps

# View frontend logs
docker-compose logs scli-frontend-prod

# Restart frontend
docker-compose restart scli-frontend-prod
```

### Issue: Docker Desktop Won't Start
**Solution:**
1. Restart your computer
2. If still failing, reinstall Docker Desktop
3. Make sure WSL2 is enabled (Windows feature)
4. Update Windows to latest version

---

## 📋 First-Time Checklist

After running the setup script:

- [ ] Docker Desktop is running (check taskbar icon)
- [ ] All 4 containers are in "Running" status
- [ ] Can access http://localhost:3000 (Frontend)
- [ ] Can access http://localhost:8080 (Moodle)
- [ ] Database has 37 tables created
- [ ] Logged in successfully with admin@scl.com / password

---

## 🚀 Next Steps

1. **Update Credentials** (IMPORTANT!)
   - Open `.env.production`
   - Change all default passwords
   - Save the file
   - Run: `docker-compose up -d` to apply

2. **Test All Modules**
   - Student Management
   - Course Management
   - Faculty Management
   - Partner Management
   - Support & Finance
   - Moodle Integration

3. **Configure Backups**
   - Create backup folder
   - Setup automated backup script
   - Run backups weekly

4. **Set Up Monitoring**
   - Monitor Docker stats regularly
   - Check logs for errors
   - Monitor database size

5. **Security Hardening**
   - Enable SSL/TLS certificates
   - Configure firewall rules
   - Restrict database access
   - Update all passwords after setup

---

## 📞 Getting Help

If something goes wrong:

1. **Check Docker Desktop logs**
   - Settings > Troubleshoot > View logs

2. **Check container logs**
   - `docker-compose logs -f [service-name]`

3. **Verify services running**
   - `docker-compose ps`

4. **Read documentation**
   - `COMPLETE_SETUP_GUIDE.md`
   - `PROJECT_SCHEDULE.md`
   - `README.md`

5. **Check GitHub**
   - https://github.com/syedsanaulhaq/scl-institute

---

## 💡 Pro Tips

**Tip 1: Keep commands handy**
```powershell
# Create a shortcuts file (save as scl-shortcuts.ps1)
docker-compose logs -f
# Then run: . .\scl-shortcuts.ps1
```

**Tip 2: Automatic startup**
- Enable "Start Docker Desktop on login" in Settings
- Enables to see auto-starts in background

**Tip 3: Monitor resources**
- Leave Docker stats running: `docker stats`
- Watch CPU, Memory, Network usage in real-time

**Tip 4: Fast restart**
- `docker-compose restart` (faster than down/up)
- Good for quick reloads

**Tip 5: View all logs at once**
- `docker-compose logs --tail=50 -f`
- Shows last 50 lines from all containers

---

## 📈 System Performance

Expected resource usage:

| Service | CPU | Memory | Storage |
|---------|-----|--------|---------|
| All 4 services | 1-3 cores | 3-5 GB | 50 GB |
| Idle (running) | 0.5 cores | 2 GB | - |
| Backup/Sync | 2-4 cores | 4 GB | +10 GB |

---

## 🎓 Learning Path

1. **Week 1**: Server/Docker/Infrastructure ✅ (DONE)
2. **Weeks 2-3**: Module 1 - Student Management
3. **Weeks 4-5**: Module 2 - Course Management + Moodle Sync
4. **Weeks 6-7**: Module 3 - Faculty & HR
5. **Weeks 8-9**: Module 4 - Partners & Awarding Body
6. **Week 10**: Module 5 - Support/Finance + Module 6 - Moodle Mgmt
7. **Weeks 11-12**: Testing, UAT, Go-Live

---

**Congratulations!** 🎉  
Your SCL-Institute system is now running locally in Docker Desktop!

For detailed information, see: **COMPLETE_SETUP_GUIDE.md**

---

**Version**: 2.0  
**Last Updated**: January 28, 2026
