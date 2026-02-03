# Notifications System Testing Guide

**Status**: ✅ Complete and Operational  
**Last Updated**: February 3, 2026  
**System**: In-App Notifications Module (Database + Real-time UI)

---

## 🚀 Quick Start - First Test (2 minutes)

### Step 1: Open Student Portal
```
URL: http://localhost:3000/student/login
```

### Step 2: Login as Test Student
```
Email: student1@test.com
Password: password123
```

### Step 3: Check Navbar for Notifications
- Look for **bell icon** in top-right corner of navbar
- Should show **red badge with number** if unread notifications exist
- Click bell to see **dropdown panel** with recent notifications

### Step 4: Approve the Student (In Separate Browser Tab)
```
URL: http://localhost:3000/admin/login
Email: admin@test.com
Password: password123

Navigate to: Dashboard → Applications → [Find student1@test.com]
Click: "Review Application" → "Approve" → Confirm
```

### Step 5: Refresh Student Tab
- Return to student portal tab and **refresh page** (F5)
- **Red badge should appear** on bell icon
- **Number "1"** should display on badge
- Click bell to see **welcome notification** with credentials

---

## 📋 Comprehensive Testing Checklist

### Test 1: Single Approval Notification
**Time**: 5 minutes | **Complexity**: Easy

```
1. [ ] Login as admin
2. [ ] Find pending application from: student1@test.com
3. [ ] Click "Review Application"
4. [ ] Review details
5. [ ] Click "Approve" button
6. [ ] Confirm approval dialog
7. [ ] Check backend logs for: "[NOTIFICATION] Welcome notification stored"
8. [ ] Logout from admin (or use incognito tab)
9. [ ] Login as student1@test.com
10. [ ] Should see red badge "1" on bell icon
11. [ ] Click bell icon to see dropdown
12. [ ] Should show "Welcome to SCL Institute - Your Credentials"
13. [ ] Click on notification to see full details
```

**Expected Data Display**:
- Student Name: ✓
- Course Name: ✓
- Login Email: ✓
- Temporary Password: ✓
- Portal URL: ✓
- Moodle URL: ✓
- Moodle Enrollment Status: ✓

---

### Test 2: Conditional Offer Notification
**Time**: 5 minutes | **Complexity**: Easy

```
1. [ ] Login as admin
2. [ ] Find different pending application
3. [ ] Click "Review Application"
4. [ ] Click "Give Conditional Offer"
5. [ ] Enter conditions (e.g., "Pass Math exam")
6. [ ] Click "Submit Offer"
7. [ ] Check backend logs: "[NOTIFICATION] Conditional offer notification stored"
8. [ ] Login as that student (or check in incognito)
9. [ ] Should see notification with yellow highlight
10. [ ] Click to view conditions
```

**Expected Notification Type**: `conditional_offer`

---

### Test 3: Bulk Approval Notifications
**Time**: 8 minutes | **Complexity**: Medium

```
1. [ ] Login as admin
2. [ ] Go to Dashboard → Applications
3. [ ] Select 5+ pending applications (checkboxes)
4. [ ] Click "Approve Selected" button at bottom
5. [ ] Confirm dialog
6. [ ] Check backend logs for multiple "[NOTIFICATION]" entries
7. [ ] Open database and verify 5 new rows in notifications table:
    SELECT COUNT(*) FROM notifications 
    WHERE type = 'welcome' 
    AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE);
8. [ ] For each approved student:
    - Login with their credentials
    - Should see 1 welcome notification in bell
    - Credentials should match those shown in notification
```

**Expected Result**: 5 separate notifications with 5 different student credentials

---

### Test 4: Notification Dropdown Widget
**Time**: 3 minutes | **Complexity**: Easy

```
1. [ ] Login as student who has 2+ notifications
2. [ ] Click bell icon in navbar
3. [ ] Should see dropdown with:
    - [ ] Recent notifications listed
    - [ ] Unread count badge at top
    - [ ] Filter tabs: "All", "Unread", "Welcome", "Offers"
    - [ ] "Mark all as read" button at bottom
4. [ ] Verify colors:
    - Welcome → Green ✓
    - Conditional Offer → Yellow ✓
    - Rejection → Red ✓
    - Update → Blue ✓
5. [ ] Click one notification in dropdown
    - Should mark as read
    - Badge count should decrease
6. [ ] Click "Mark all as read"
    - All notifications should appear as read
    - Badge should disappear (or show 0)
```

---

### Test 5: Full Notifications Page
**Time**: 5 minutes | **Complexity**: Easy

```
1. [ ] Login as student
2. [ ] Click on bell icon, then scroll down
3. [ ] OR navigate directly: http://localhost:3000/student/notifications
4. [ ] Should see:
    - [ ] Page title: "My Notifications"
    - [ ] Filter tabs with counts
    - [ ] List of all notifications with timestamps
    - [ ] Gradient background (blue to indigo)
5. [ ] Click on any notification:
    - [ ] Should expand or navigate to detail view
    - [ ] Show full message body
    - [ ] Show structured data (credentials, course, etc.)
6. [ ] Test filter tabs:
    - [ ] "All" → Shows all notifications
    - [ ] "Unread" → Shows only unread (if any)
    - [ ] "Welcome" → Shows only welcome type
    - [ ] "Offers" → Shows only conditional_offer type
```

---

### Test 6: Mark as Read/Unread
**Time**: 3 minutes | **Complexity**: Easy

```
1. [ ] Login as student with unread notifications
2. [ ] Note badge number on bell icon
3. [ ] Click notification in dropdown
    - [ ] Should mark as read
    - [ ] Badge count should decrease by 1
4. [ ] Go to full notifications page
5. [ ] Find a read notification
6. [ ] Should have "Mark as Unread" button
7. [ ] Click "Mark as Unread"
    - [ ] Notification should appear unread again
    - [ ] Badge should reappear (or increment)
8. [ ] Click "Mark all as Read"
    - [ ] All notifications should be marked read
    - [ ] Badge should disappear
    - [ ] No unread notifications should remain
```

---

### Test 7: Real-time Polling
**Time**: 5 minutes | **Complexity**: Medium

```
1. [ ] Open student portal in one tab/window
2. [ ] Note bell icon has no badge (0 unread)
3. [ ] Open admin in another tab
4. [ ] Find the student's pending application
5. [ ] Click "Approve"
6. [ ] Return to student tab (DO NOT REFRESH)
7. [ ] Wait up to 10 seconds
    - [ ] Red badge should automatically appear
    - [ ] Number should increment
    - [ ] NO PAGE REFRESH NEEDED
8. [ ] Click bell to see dropdown
    - [ ] Notification should be visible immediately
    - [ ] Data should be complete and correct
```

**Note**: Polling interval is 10 seconds

---

### Test 8: Data Integrity Check
**Time**: 5 minutes | **Complexity**: Advanced

```
1. [ ] Approve a student application for course: "Bachelor of Engineering"
2. [ ] Login as that student
3. [ ] Open notification detail
4. [ ] Verify all fields match application:
    - [ ] Student Name: Matches first_name + last_name
    - [ ] Course Name: Matches course_title
    - [ ] Email: Matches application email
    - [ ] Password: Should be temporary, different each time
    - [ ] Portal URL: http://localhost:3000/student/login
    - [ ] Moodle URL: http://localhost:9090
    - [ ] Moodle enrollment: Should show true/false based on attempt
5. [ ] Database query to verify storage:
    ```sql
    SELECT id, email, type, subject, notification_data 
    FROM notifications 
    WHERE email = 'student@test.com' 
    LIMIT 1;
    ```
    - notification_data should be valid JSON
    - Should contain: applicant_name, course, credentials, portal_url, moodle_url
```

---

### Test 9: Multiple Student Test
**Time**: 10 minutes | **Complexity**: Medium

```
1. [ ] Create or find 3 test students:
    - student1@test.com
    - student2@test.com
    - student3@test.com

2. [ ] Approve student 1
    - Login as student1
    - Should see 1 notification
    - Logout

3. [ ] Approve student 2
    - Login as student2
    - Should see 1 notification (only theirs, not student1's)
    - Logout

4. [ ] Approve student 3
    - Login as student3
    - Should see 1 notification (only theirs)
    - Logout

5. [ ] Verify isolation:
    - Each student should ONLY see their own notifications
    - Data should be completely separate
    - Passwords should be different for each student
```

---

### Test 10: Backend Integration Verification
**Time**: 5 minutes | **Complexity**: Advanced

```
1. [ ] Monitor backend logs in real-time:
    ```bash
    docker logs -f scli-backend-dev | grep -i notification
    ```

2. [ ] Approve 2-3 students and watch logs
3. [ ] Should see entries like:
    ```
    [NOTIFICATION] Welcome notification stored for student1@test.com
    [NOTIFICATION] Welcome notification stored for student2@test.com
    ```

4. [ ] Verify API is accessible:
    ```bash
    curl -X GET "http://localhost:4000/api/notifications/user/student1@test.com"
    ```
    - Should return JSON array of notifications
    - Should include: type, subject, message, is_read, created_at

5. [ ] Check database directly:
    ```bash
    docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e \
    "SELECT COUNT(*) as total_notifications FROM notifications;"
    ```
    - Should show count of all stored notifications
```

---

## 🔍 Debugging Guide

### Issue: Badge doesn't appear after approval

**Solution 1**: Refresh page (F5)
- Notifications poll every 10 seconds
- Manual refresh forces immediate check

**Solution 2**: Check browser console (F12)
- Open Developer Tools
- Go to Console tab
- Look for any red error messages
- Try login again

**Solution 3**: Verify backend logs
```bash
docker logs scli-backend-dev | grep -i notification
```
- Should show "[NOTIFICATION]" entries
- If not, approval may not have completed

### Issue: Credentials not showing in notification

**Solution 1**: Check notification_data column
```bash
docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e \
"SELECT notification_data FROM notifications WHERE email='student1@test.com' LIMIT 1;"
```

**Solution 2**: Verify JSON format
- notification_data should be valid JSON
- If NULL or corrupted, check backend logs

**Solution 3**: Clear browser cache
```
Ctrl+Shift+Delete → Clear all
```

### Issue: Other student can see notifications

**Possible cause**: Email not matching correctly

**Solution**: Verify student email:
```bash
docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e \
"SELECT email FROM student_applications LIMIT 5;"
```
- Use exact email for testing
- Case-sensitive in some systems

### Issue: Notification table doesn't exist

**Solution**: Check backend logs for errors
```bash
docker logs scli-backend-dev | grep -i error
```

**If table missing**: 
1. Stop containers: `docker-compose -f docker-compose.dev.yml down`
2. Restart: `docker-compose -f docker-compose.dev.yml up -d`
3. Wait 10 seconds for backend to initialize
4. Check logs again

---

## 📊 Database Verification Commands

### Count all notifications
```sql
SELECT COUNT(*) FROM notifications;
```

### View recent notifications
```sql
SELECT email, type, subject, is_read, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check unread count for specific user
```sql
SELECT COUNT(*) FROM notifications 
WHERE email = 'student1@test.com' 
AND is_read = FALSE;
```

### View notification details with JSON data
```sql
SELECT email, type, subject, notification_data 
FROM notifications 
WHERE email = 'student1@test.com' 
ORDER BY created_at DESC;
```

### Check notification types
```sql
SELECT type, COUNT(*) 
FROM notifications 
GROUP BY type;
```

---

## 🎯 Performance Testing

### Expected Response Times

| Operation | Expected Time | Actual Time |
|-----------|---------------|-------------|
| Fetch notifications (1 user) | <100ms | ___ |
| Store notification | <50ms | ___ |
| Mark as read | <50ms | ___ |
| Dropdown render | <200ms | ___ |
| Full page load | <1000ms | ___ |
| Real-time update (poll) | 10 sec interval | ___ |

---

## ✅ Final Verification Checklist

- [ ] All 6 containers running and healthy
- [ ] Backend logs show "[DB] Notifications table verified/created"
- [ ] Student receives notification on approval
- [ ] Navbar badge appears with unread count
- [ ] Dropdown shows notification details
- [ ] Full page shows all notifications
- [ ] Filtering works (All, Unread, Welcome, Offers)
- [ ] Mark as read removes badge
- [ ] Real-time polling works (updates within 10 seconds)
- [ ] Each student sees only their own notifications
- [ ] Credentials display correctly
- [ ] Colors match notification types
- [ ] Bulk approvals create multiple notifications
- [ ] Backend logs show "[NOTIFICATION]" entries
- [ ] Database stores all notification data

---

## 📞 Support

If you encounter any issues:

1. **Check Backend Logs**:
   ```bash
   docker logs scli-backend-dev --tail 50
   ```

2. **Check Database Connection**:
   ```bash
   docker exec scli-mysql-dev mysql -u scl_user -p'scl_password' scl_db -e "SELECT 1;"
   ```

3. **Check Frontend Console** (F12 in browser)

4. **Restart Services**:
   ```bash
   docker-compose -f docker-compose.dev.yml restart
   ```

5. **Review Log Files**:
   - [NOTIFICATIONS_SYSTEM.md](NOTIFICATIONS_SYSTEM.md) - Technical details
   - [NOTIFICATIONS_SUMMARY.txt](NOTIFICATIONS_SUMMARY.txt) - Quick reference

---

## 🎓 Educational Notes

**Why In-App Notifications?**
- Email not configured in local development
- Database provides persistence for testing
- Real-time polling provides instant feedback
- Better for showcasing workflow
- No external dependencies required

**How It Works:**
1. Student approval stored in `student_applications` table
2. Approval endpoint calls `storeNotification()` function
3. Function creates entry in `notifications` table
4. Frontend polls `/api/notifications/user/:email` every 10 seconds
5. When new notification received, badge appears and dropdown updates
6. Student can click to mark read or view full details

**Security Notes:**
- Notifications filtered by email (from localStorage)
- Students cannot see other students' notifications
- Temporary passwords are unique per approval
- All data stored in database with timestamps
- Read/unread status tracks user interaction

---

**Ready to test? Start with Test 1: Single Approval Notification**

Expected time to complete all tests: **60 minutes**
