# Moodle Auto-Enrollment - QUICK START GUIDE

## ✅ Status: READY TO USE

All systems operational and configured. Students are **automatically enrolled in Moodle** when approved.

---

## What Happens (Behind the Scenes)

```
You approve a student
         ↓
System creates SCL account
         ↓
⭐ System auto-enrolls in Moodle
         ↓
System sends welcome email
         ↓
Student receives both credentials
```

---

## How to Test It (5 minutes)

### Step 1: Start Monitoring
```bash
docker logs -f scli-backend-dev | grep -E "MOODLE|STUDENT|EMAIL"
```
Keep this terminal open

### Step 2: Approve a Student
1. Go to http://localhost:3000/admin/dashboard
2. Click "Applications"
3. Find any "Pending" application
4. Click "Approve" (or select multiple and bulk approve)

### Step 3: Watch the Logs
You should see (in your monitoring terminal):
```
[STUDENT USER] Created account for student@example.com (Application 42)
[MOODLE] Student student@example.com enrolled successfully
[EMAIL SENT] Welcome email sent to student@example.com
```

### Step 4: Verify in Moodle
1. Go to http://localhost:9090
2. Login as admin
   - Username: `admin`
   - Password: `SCLInst!2026`
3. Navigate to any course
4. Click "Participants"
5. Find the student name - **student should be enrolled**

---

## Common Questions

**Q: What if Moodle enrollment fails?**  
A: The student WILL still get a SCL account and welcome email. Error is logged. Admin can manually enroll if needed.

**Q: How do I check if it worked?**  
A: Check two places:
1. Backend logs: `docker logs scli-backend-dev | grep MOODLE`
2. Moodle: http://localhost:9090 → Course → Participants

**Q: What if the student doesn't appear in Moodle?**  
A: Check:
1. Course code in application matches Moodle course code
2. Moodle is running: http://localhost:9090
3. Backend logs for error messages

**Q: Can I disable this feature?**  
A: Yes, comment out the `enrollStudentInMoodle()` call and restart backend

---

## System Status

✅ **Backend** (port 4000) - Running  
✅ **Frontend** (port 3000) - Running  
✅ **Moodle** (port 9090) - Running  
✅ **Database** - Connected  
✅ **All configs** - Loaded  

---

## Key Files

| File | Purpose | Size |
|------|---------|------|
| [MOODLE_AUTO_ENROLLMENT.md](MOODLE_AUTO_ENROLLMENT.md) | Full implementation guide | 12 KB |
| [FINAL_VERIFICATION_REPORT.md](FINAL_VERIFICATION_REPORT.md) | Verification details | 8 KB |
| backend/routes/students.js | Code (lines 872, 952, 1159, 1280, 1332) | Main logic |

---

## Monitoring Commands

```bash
# Watch real-time logs during approval
docker logs -f scli-backend-dev | grep -i moodle

# Check all Moodle-related operations
docker logs scli-backend-dev | grep "[MOODLE]"

# Check if errors occurred
docker logs scli-backend-dev | grep -i "error\|failed"

# View database (approved students)
docker exec scli-mysql-dev mysql -uroot -prootpassword scl_institute -e "SELECT email, application_status FROM student_applications WHERE application_status='accepted';"
```

---

## If Something Goes Wrong

### Issue: Student not enrolled in Moodle

**Check 1**: Course code matches
```bash
# In SCL database, check student's course code
docker exec scli-mysql-dev mysql -uroot -prootpassword scl_institute \
  -e "SELECT email, course_code FROM student_applications LIMIT 5;"

# In Moodle, check course codes exist
# http://localhost:9090 → Admin → Courses → Manage Courses
```

**Check 2**: Moodle is running
```bash
curl http://localhost:9090/
# Should return Moodle login page HTML
```

**Check 3**: Backend logs
```bash
docker logs scli-backend-dev | grep -i "enrollment\|error\|moodle"
```

### Issue: Backend won't start

```bash
# Check for errors
docker logs scli-backend-dev --tail 50

# Restart
docker-compose -f docker-compose.dev.yml restart scli-backend

# Check again
docker ps | grep scli-backend
```

---

## Architecture Overview

```
APPROVAL FLOW:
├─ Admin Dashboard
│  └─ Approves Application
│     ├─ review-decision endpoint
│     └─ bulk-approve endpoint
│
├─ SCL Database (MySQL)
│  └─ Creates user account
│
├─ Moodle System (Internal)
│  ├─ Fetches course list
│  ├─ Creates user account
│  └─ Enrolls in course
│
└─ Email Service
   └─ Sends welcome email
```

---

## Environment Configuration

**Location**: `.env` file in root directory

**Moodle settings** (currently set):
```
MOODLE_TOKEN=e86dd021aaa42f78114e6c67cc9d8ff1
MOODLE_INTERNAL_URL=http://scli-moodle-dev:8080
MOODLE_EXTERNAL_URL=http://localhost:9090
MOODLE_USERNAME=admin
MOODLE_PASSWORD=SCLInst!2026
```

No changes needed - already configured!

---

## Support / Issues

### Get Help Quickly

1. **Check logs**: `docker logs scli-backend-dev | grep -i error`
2. **Is Moodle running?**: Go to http://localhost:9090
3. **Test API**: Call approval endpoint manually to see detailed errors
4. **Review documentation**: [MOODLE_AUTO_ENROLLMENT.md](MOODLE_AUTO_ENROLLMENT.md)

### Document Bugs

When reporting issues, include:
1. Student email that was approved
2. Backend logs from that time
3. Moodle course code
4. Error message (if any)

---

## Next Features (Coming Soon)

- ⏳ Manual re-enroll button in admin dashboard
- ⏳ Enrollment status column in student list
- ⏳ Auto-unenroll when application rejected
- ⏳ Conditional offer provisional enrollment
- ⏳ Sync Moodle grades back to SCL

---

## Success Indicators

✅ System is ready if you see:
- All containers running
- Backend logs show "Backend running on port 4000"
- Moodle accessible at http://localhost:9090
- No errors in backend logs

✅ Approval workflow works if:
- Student gets SCL account
- Student appears in Moodle course
- Student receives welcome email
- Backend logs show [MOODLE] success message

---

**Ready to test? Go to:** http://localhost:3000/admin/dashboard

**Questions?** Check [MOODLE_AUTO_ENROLLMENT.md](MOODLE_AUTO_ENROLLMENT.md) for full documentation.

---

**Status**: ✅ **OPERATIONAL**  
**Last Updated**: February 3, 2026  
**Version**: 1.0 (Initial Release)

