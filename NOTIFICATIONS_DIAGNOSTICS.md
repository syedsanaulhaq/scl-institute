# 🔍 Notifications System - Diagnostics Checklist

**Purpose**: Quickly identify and fix any issues with the Notifications Module  
**Time to Complete**: 3-5 minutes max  
**Created**: February 3, 2026

---

## ✅ Pre-Test System Health Check (Start Here)

Run these checks in this order to verify system readiness:

### 1. Docker Containers Running?
```bash
docker-compose -f docker-compose.dev.yml ps
```
**Expected Output**:
```
NAME              STATUS
scli-backend-dev    Up
scli-frontend-dev   Up
scli-mysql-dev      Up (healthy)
scli-moodle-dev     Up
(others)            Up
```

**If NOT running**:
```bash
docker-compose -f docker-compose.dev.yml up -d
# Wait 30 seconds
docker-compose -f docker-compose.dev.yml ps
```

---

### 2. Backend Initialized?
```bash
docker logs scli-backend-dev | tail -10
```
**Expected Output** (last 3 lines should include):
```
Backend running on port 4000
[DB] Connection successful. Initializing tables...
[DB] Notifications table verified/created
```

**If NOT initialized**:
```bash
docker-compose -f docker-compose.dev.yml restart scli-backend-dev
# Wait 5 seconds
docker logs scli-backend-dev | tail -5
```

---

### 3. MySQL Connected?
```bash
docker logs scli-mysql-dev | grep -i ready
```
**Expected Output**:
```
[Server] ready for connections
```

**If NOT connected**:
```bash
docker-compose -f docker-compose.dev.yml restart scli-mysql-dev
# Wait 10 seconds then check again
```

---

### 4. Notifications Table Exists?
```bash
docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e \
"SHOW TABLES LIKE 'notifications';"
```
**Expected Output**:
```
Tables_in_scl_db (notifications)
notifications
```

**If MISSING**:
```bash
# Stop everything
docker-compose -f docker-compose.dev.yml down

# Start fresh
docker-compose -f docker-compose.dev.yml up -d

# Wait 15 seconds for full initialization
docker logs scl-backend-dev | grep -i notification
```

---

### 5. Can Access Portals?
- [ ] Student Portal: http://localhost:3000/student/login (opens without error)
- [ ] Admin Portal: http://localhost:3000/admin/login (opens without error)
- [ ] API Health: http://localhost:4000/api/notifications/user/test@test.com (returns JSON or empty array)

**If NOT accessible**:
- Restart frontend: `docker-compose -f docker-compose.dev.yml restart scli-frontend-dev`
- Wait 5 seconds
- Try again

---

## 🧪 Feature Testing Checklist

### Test 1: Bell Icon Visible?
1. Login as student: student1@test.com / password123
2. Look at navbar (top right corner)
3. Should see **bell icon** 🔔

**If NOT visible**:
- [ ] Check browser console (F12) for errors
- [ ] Refresh page (F5)
- [ ] Clear cache (Ctrl+Shift+Del)
- [ ] Check frontend logs: `docker logs scli-frontend-dev | tail -20`

---

### Test 2: Notification Appears on Approval?
1. In Student tab: stay on portal (logged in)
2. In Admin tab: login and approve a pending application
3. Return to Student tab
4. **Within 10 seconds**: Red badge should appear on bell

**If badge NOT appearing**:
- [ ] Refresh page (F5) - polling may need to catch up
- [ ] Wait 15 seconds - polling interval is 10 seconds
- [ ] Check browser console for JavaScript errors
- [ ] Check backend logs: `docker logs scli-backend-dev | grep -i notification`

**If still not appearing**:
```bash
# Manually check if notification stored
docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e \
"SELECT COUNT(*) FROM notifications WHERE email='student1@test.com';"
```
Should return: `COUNT(*) 1` (or higher)

---

### Test 3: Notification Details Visible?
1. Click bell icon
2. Should see dropdown with notification
3. Should see: Student name, Course, Message
4. Click notification → should show full details with credentials

**If details NOT visible**:
- [ ] Check browser console (F12)
- [ ] Verify notification_data column: 
```bash
docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e \
"SELECT notification_data FROM notifications LIMIT 1 \G"
```
Should show JSON with credentials

- [ ] If NULL or corrupted, check backend approval endpoint logs

---

### Test 4: Full Notifications Page Works?
1. Navigate to: http://localhost:3000/student/notifications
2. Should see: List of all notifications with styling
3. Should see: Filter tabs (All, Unread, Welcome, Offers)

**If page NOT loading**:
- [ ] Check if route exists in App.jsx
- [ ] Verify StudentNotifications component imports
- [ ] Check console for errors: F12 → Console tab

---

### Test 5: Mark as Read Works?
1. Click notification in dropdown
2. Badge count should **decrease by 1**
3. Notification should show as "read"

**If NOT working**:
- [ ] Check browser console for fetch errors
- [ ] Verify API endpoint is responding: 
```bash
curl -X PUT http://localhost:4000/api/notifications/1/read
```
Should return: `{"success":true}`

---

## 🔧 Quick Fixes (In Order)

### Problem: Nothing works
**Solution 1** (5 seconds):
```bash
# Refresh page
Press F5
```

**Solution 2** (10 seconds):
```bash
# Clear browser cache
Ctrl+Shift+Del
Select "All time"
Click "Clear"
Then F5 to refresh
```

**Solution 3** (30 seconds):
```bash
# Restart frontend
docker-compose -f docker-compose.dev.yml restart scli-frontend-dev
Wait 5 seconds
Refresh browser (F5)
```

**Solution 4** (60 seconds):
```bash
# Restart everything
docker-compose -f docker-compose.dev.yml restart
Wait 15 seconds
Try again
```

**Solution 5** (2 minutes):
```bash
# Full reset
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
Wait 20 seconds
Try again
```

---

## 📊 Database Diagnostics

### Check Total Notifications Stored:
```bash
docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e \
"SELECT COUNT(*) FROM notifications;"
```
**Should return**: A number (0 if no approvals done yet)

---

### Check Specific Student Notifications:
```bash
docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e \
"SELECT id, email, type, subject, is_read, created_at \
FROM notifications \
WHERE email='student1@test.com' \
ORDER BY created_at DESC;"
```

---

### Check Notification Data Format:
```bash
docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e \
"SELECT id, email, type, notification_data \
FROM notifications \
WHERE email='student1@test.com' \
LIMIT 1 \G"
```
**Should show**: Valid JSON with credentials

---

### Count by Type:
```bash
docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e \
"SELECT type, COUNT(*) \
FROM notifications \
GROUP BY type;"
```

---

### Check for Read/Unread Status:
```bash
docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e \
"SELECT email, COUNT(*) as total, \
SUM(IF(is_read=1, 1, 0)) as read, \
SUM(IF(is_read=0, 1, 0)) as unread \
FROM notifications \
GROUP BY email;"
```

---

## 🔍 Log Monitoring

### Watch Backend for Notification Events:
```bash
docker logs -f scli-backend-dev | grep -i notification
```
**When you approve, should see**:
```
[NOTIFICATION] Welcome notification stored for student@test.com
[NOTIFICATION] Conditional offer notification stored for student@test.com
```

---

### Check for Backend Errors:
```bash
docker logs scli-backend-dev | grep -i error
```
**Should be EMPTY** (no errors)

---

### Check Frontend Console Errors:
1. Open browser (F12)
2. Go to Console tab
3. Approve a student
4. Watch for red error messages
5. Note the error text
6. Search that error in backend logs

---

## 🌐 API Testing

### Test API Directly:
```bash
# Get all notifications for a student
curl http://localhost:4000/api/notifications/user/student1@test.com | jq

# Get unread count
curl http://localhost:4000/api/notifications/unread-count/student1@test.com | jq

# Get by type
curl http://localhost:4000/api/notifications/type/welcome | jq

# Mark as read (replace 1 with actual notification ID)
curl -X PUT http://localhost:4000/api/notifications/1/read | jq
```

**Expected Responses**:
- Should return valid JSON
- No 500 errors
- Should match database contents

---

## 🛠️ File Verification

### Check if Files Exist:
```bash
# Backend API
Test-Path "backend\routes\notifications.js"  # Should be $True

# Frontend Components
Test-Path "frontend\src\components\Notifications.jsx"  # Should be $True
Test-Path "frontend\src\pages\StudentNotifications.jsx"  # Should be $True

# Check integrations
findstr /N "storeNotification" backend\routes\students.js  # Should find 3+ matches
```

---

### Check if Files Have Content:
```bash
# Backend API file should have 150+ lines
(Get-Content backend\routes\notifications.js).Count  # Should show ~150+

# Components should have 200+ lines
(Get-Content frontend\src\components\Notifications.jsx).Count  # Should show ~200+
```

---

## 🆘 Still Not Working?

### Collect Diagnostic Data:
```bash
# Save this information to diagnose the issue

# 1. Docker status
docker-compose -f docker-compose.dev.yml ps > docker_status.txt

# 2. Backend logs (last 30 lines)
docker logs scli-backend-dev --tail 30 > backend_logs.txt

# 3. Database connection test
docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e "SELECT 1;" > db_test.txt

# 4. Notifications table check
docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e "SHOW CREATE TABLE notifications \G" > table_schema.txt

# 5. Sample notification
docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e "SELECT * FROM notifications LIMIT 1 \G" > sample_notification.txt
```

**Then**:
1. Review the files created
2. Compare with expected outputs from this guide
3. Note what doesn't match
4. Check [NOTIFICATIONS_SYSTEM.md](NOTIFICATIONS_SYSTEM.md) for detailed architecture

---

## ✅ Final Verification

When everything is working, you should see:

```
✅ Docker containers: All Up
✅ Backend logs: Shows "[DB] Notifications table verified/created"
✅ MySQL connection: Connected and healthy
✅ Notifications table: Exists in scl_db
✅ Portals: Both load without errors
✅ Bell icon: Visible in navbar
✅ Badge appears: Within 10 seconds of approval
✅ Details visible: Click shows credentials
✅ Filtering works: All/Unread/Welcome/Offers
✅ Mark as read: Badge decreases and disappears
✅ Database populated: Notifications table has rows
✅ API responding: curl requests return valid JSON
✅ Logs clear: No errors in backend logs
```

**When you see all ✅**: System is fully operational

---

## 📞 Emergency Restart

If everything is broken and you need to start fresh:

```bash
# 1. Stop everything
docker-compose -f docker-compose.dev.yml down

# 2. Remove volumes (WARNING: this deletes all data!)
docker volume rm scl-institute_scli-mysql-data scl-institute_scli-moodle-data

# 3. Start fresh
docker-compose -f docker-compose.dev.yml up -d

# 4. Wait for initialization (20 seconds)
Wait...

# 5. Verify
docker logs scli-backend-dev | tail -5
docker-compose -f docker-compose.dev.yml ps
```

**Note**: This will delete all test data. Only use if absolutely necessary.

---

## 📋 Pre-Submission Checklist

Before considering the feature complete:

- [ ] Ran pre-test system health check (all 5 items)
- [ ] Ran feature testing checklist (all 5 tests passed)
- [ ] Quick fixes section not needed (nothing broke)
- [ ] Database has notifications stored
- [ ] API endpoints responding correctly
- [ ] Logs are clean (no errors)
- [ ] Both portals open without errors
- [ ] Real-time polling works (badge appears within 10 sec)

**If all checked**: Ready for production testing

---

**Last Updated**: February 3, 2026  
**Status**: ✅ Fully Diagnostic Ready

For more information, see [NOTIFICATIONS_TESTING_GUIDE.md](NOTIFICATIONS_TESTING_GUIDE.md)
