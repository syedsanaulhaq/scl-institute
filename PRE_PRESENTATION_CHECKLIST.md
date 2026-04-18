# Pre-Presentation Checklist - VERIFY BEFORE SHOWING

**Run these commands 5 minutes before your presentation to ensure everything is live and ready.**

---

## Step 1: Verify Docker Containers (30 seconds)

```bash
docker ps
```

**Expected Output:** You should see 5 containers all with status "Up":
- scli-nginx (healthy)
- scli-frontend (Up)
- scli-backend (Up)
- scli-mysql (healthy)
- scli-public-portal-dev (Up)

**If any say "Exited":** Run:
```bash
docker-compose up -d
```
Wait 60 seconds, then check again.

---

## Step 2: Test Backend API (30 seconds)

```bash
curl http://localhost:4000/api/students/applications 2>/dev/null | head -100
```

**Expected:** JSON response starting with `{"data":"[{` containing application records

**If error:** Backend may be restarting. Wait 30 seconds and try again.

---

## Step 3: Open Browser (1 minute)

Go to: **http://localhost:3000**

**Expected:** SCL Institute login page appears immediately

**If blank page:** Wait 15 seconds and refresh. Frontend may still be loading.

---

## Step 4: Login (1 minute)

**Email:** admin@sclsandbox.xyz  
**Password:** password123

Click "Sign In to Dashboard"

**Expected:** Dashboard loads showing "10" at the top (10 operational modules)

**If login fails:** The admin user might need resyncing. Contact support.

---

## Step 5: Check Applications (2 minutes)

Click "Admissions Hub" on the left menu

**Expected:** Admissions Dashboard shows:
- Total Applications: **10**
- Pending Review: **4**
- Rejected: **1**
- Table below shows applicants (Maya Patel, James Taylor, Lisa Anderson, etc.)

**If shows 0 applications:** Database may not have loaded. Contact support immediately.

---

## Step 6: Check Courses (2 minutes)

Click "Course Lifecycle" on the left menu

**Expected:** Course Lifecycle Dashboard shows:
- Found **52 courses** (below filter section)
- Total Courses: **52** (in blue card)
- HND: **1 Programme**
- Degree: **1 Programme**

**If shows 0 courses:** Database connection issue. Contact support.

---

## Summary Before Presenting

✅ All 5 containers running  
✅ Backend responding  
✅ Browser access working  
✅ Login successful  
✅ 10 applications visible  
✅ 52 courses visible  

**You're good to present!**

---

## If Something Breaks During Presentation

**Quick fixes (during presentation):**

1. **System freezes:** Click "Refresh" button on dashboard
2. **Takes too long to load:** Ask audience "One moment while the system loads..." (it's normal)
3. **Page won't load:** Press F5 to refresh browser
4. **Demo completely dies:** Say "Technical difficulties, let me restart the demo" and:
   ```bash
   docker-compose restart
   ```
   Wait 60 seconds, then try again

---

## Contact

If something is genuinely broken and won't fix:
- Check Docker logs: `docker logs scli-backend`
- Check database: `docker exec scli-mysql mysql -u scl_user -pscl_password scl_institute -e "SELECT COUNT(*) FROM student_applications;"`
- Restart everything: `docker-compose down && docker-compose up -d`

---

**Good luck! Your system is production-ready and thoroughly tested. You've got this! 🎉**
