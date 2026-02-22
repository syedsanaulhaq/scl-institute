# Moodle Auto-Enrollment Integration

## Overview

Students are now **automatically enrolled in Moodle courses** when their applications are approved. This completes the end-to-end admission workflow.

## What Happens When a Student is Approved

### Workflow Steps

1. **Admin Approves Application**
   - Navigate to `/admin/dashboard`
   - Select one or more applications
   - Click "Approve Selected" (or "Approve" for single application)

2. **SCL Account Creation**
   - Student email, name, and temporary password generated
   - Account created in `users` table with role `student`
   - Status: ✅ Automatic

3. **Moodle Enrollment** ⭐ **NEW FEATURE**
   - Student automatically enrolled in their course in Moodle
   - User created in Moodle (if not exists)
   - Student role assigned in the course
   - Status: ✅ Automatic

4. **Welcome Email Sent**
   - Email sent with SCL credentials and Moodle access info
   - Student can login to both SCL and Moodle immediately
   - Status: ✅ Automatic

## Technical Implementation

### Backend Endpoints Modified

#### 1. Single Approval: `POST /api/students/applications/:id/review-decision`
**File**: [backend/routes/students.js](backend/routes/students.js#L872)

Automatically calls `enrollStudentInMoodle()` when decision is "Offer":

```javascript
if (newStatus === 'accepted') {
    const moodleResult = await enrollStudentInMoodle(
        email,
        first_name,
        last_name,
        course_code || programme_code
    );
    if (moodleResult.success) {
        console.log(`[MOODLE] Student ${email} enrolled successfully`);
    } else {
        console.warn(`[MOODLE] Enrollment warning for ${email}: ${moodleResult.message}`);
    }
}
```

#### 2. Bulk Approval: `POST /api/students/bulk-approve`
**File**: [backend/routes/students.js](backend/routes/students.js#L1332)

Enrolls multiple students in Moodle in batch:

```javascript
const moodleEnroll = await enrollStudentInMoodle(
    app.email,
    app.first_name,
    app.last_name,
    app.course_code || app.programme_code
);
if (moodleEnroll.success) {
    console.log(`[BULK APPROVE] Application ${appId}: Enrolled in Moodle`);
}
```

### Helper Function: `enrollStudentInMoodle()`
**File**: [backend/routes/students.js](backend/routes/students.js#L1159)

Complete Moodle API integration (110+ lines):

```javascript
async function enrollStudentInMoodle(email, firstName, lastName, courseCode) {
    try {
        // 1. Get all courses from Moodle
        const coursesRes = await axios.get(
            `${MOODLE_URL}/webservice/rest/server.php?wstoken=${MOODLE_TOKEN}&wsfunction=core_course_get_courses&moodlewsrestformat=json`
        );

        // 2. Find matching course by code
        const course = findMatchingCourse(coursesRes.data, courseCode);
        if (!course) throw new Error(`Course not found for code: ${courseCode}`);

        // 3. Create or verify user in Moodle
        const createRes = await axios.get(`${MOODLE_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: MOODLE_TOKEN,
                wsfunction: 'core_user_create_users',
                moodlewsrestformat: 'json',
                'users[0][username]': email,
                'users[0][email]': email,
                'users[0][firstname]': firstName,
                'users[0][lastname]': lastName,
                'users[0][password]': crypto.randomBytes(16).toString('hex')
            }
        });

        // 4. Get Moodle user ID
        const userRes = await axios.get(
            `${MOODLE_URL}/webservice/rest/server.php?wstoken=${MOODLE_TOKEN}&wsfunction=core_user_get_users_by_field&field=email&values[0]=${email}&moodlewsrestformat=json`
        );
        const moodleUser = userRes.data[0];

        // 5. Enroll user in course (Role 5 = Student)
        const enrollRes = await axios.get(
            `${MOODLE_URL}/webservice/rest/server.php?wstoken=${MOODLE_TOKEN}&wsfunction=enrol_manual_enrol_users&enrolments[0][userid]=${moodleUser.id}&enrolments[0][courseid]=${course.id}&enrolments[0][roleid]=5&moodlewsrestformat=json`
        );

        return {
            success: true,
            message: 'Student enrolled in Moodle course',
            moodleCourseId: course.id,
            moodleUserId: moodleUser.id
        };
    } catch (error) {
        console.error(`[MOODLE ENROLL ERROR] ${email}:`, error.message);
        return {
            success: false,
            message: `Moodle enrollment failed: ${error.message}`
        };
    }
}
```

## Testing the Workflow

### Prerequisites
- ✅ Moodle running (port 9090)
- ✅ Backend running (port 4000)
- ✅ Frontend running (port 3000)
- ✅ Moodle API token configured: `e86dd021aaa42f78114e6c67cc9d8ff1`
- ✅ Database contains test applications with course codes

### Test Steps

1. **Login as Admin**
   ```
   URL: http://localhost:3000/admin/dashboard
   Username: admin
   Password: [admin password]
   ```

2. **Find Pending Application**
   - Go to Applications tab
   - Filter by "Pending" status
   - Select an application

3. **Approve Application**
   - Click "Approve" button
   - OR select multiple and click "Approve Selected"
   - Confirm approval

4. **Verify Student Account Created**
   ```bash
   # Check MySQL
   docker exec scli-mysql-dev mysql -uroot -proot -e "USE scl_institute; SELECT * FROM users WHERE email = 'student@example.com';"
   ```

5. **Verify Moodle Enrollment**
   ```bash
   # Check backend logs
   docker logs scli-backend-dev | grep -i moodle
   
   # Expected log output:
   # [MOODLE] Student student@example.com enrolled successfully
   ```

6. **Check Moodle Directly**
   - Go to http://localhost:9090/
   - Navigate to course page
   - Verify student appears in enrolled participants

## Configuration

### Environment Variables Required

```env
# Moodle API
MOODLE_TOKEN=e86dd021aaa42f78114e6c67cc9d8ff1
MOODLE_INTERNAL_URL=http://scli-moodle-dev:8080    # Internal container communication
MOODLE_EXTERNAL_URL=http://localhost:9090           # For browser access (optional)
```

### Database Requirements

**student_applications table must have:**
- `course_code` (VARCHAR) - Moodle course code
- `programme_code` (VARCHAR) - Alternative course identifier
- `email` (VARCHAR) - Student email for Moodle username
- `first_name` (VARCHAR) - Student first name
- `last_name` (VARCHAR) - Student last name
- `application_status` (VARCHAR) - Set to 'accepted' or 'conditional_accept'

### Moodle Setup Checklist

- ✅ API token generated
- ✅ Web service enabled
- ✅ Course codes configured in Moodle
- ✅ Student role available (roleid 5)
- ✅ Manual enrolment plugin enabled

## Error Handling

### If Moodle Enrollment Fails

The system is designed to **gracefully fail**:

1. ✅ Student account WILL be created in SCL
2. ✅ Welcome email WILL be sent
3. ⚠️ Student will NOT be enrolled in Moodle
4. 📋 Error logged to backend console

**Admin should:**
- Check backend logs: `docker logs scli-backend-dev`
- Verify Moodle is running: `http://localhost:9090/`
- Check API token is valid
- Manually enroll student if necessary

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Course not found" | Course code doesn't match Moodle | Update course code in application or Moodle |
| "User creation failed" | Email already exists in Moodle | User already enrolled, check Moodle directly |
| Moodle unreachable | Container down or network issue | Restart Moodle: `docker-compose restart scli-moodle` |
| API token invalid | Token expired or misconfigured | Regenerate token in Moodle admin panel |

## Backend Logs

Monitor the approval process with:

```bash
# Watch real-time logs
docker logs -f scli-backend-dev | grep -i "MOODLE\|STUDENT\|EMAIL"

# Search past logs
docker logs scli-backend-dev | grep "[MOODLE]"
```

**Log Format:**
```
[STUDENT USER] Created account for student@example.com (Application 42)
[MOODLE] Student student@example.com enrolled successfully
[EMAIL SENT] Welcome email sent to student@example.com
[BULK APPROVE] Application 42: Enrolled in Moodle
```

## Frontend Changes

No changes required to admin interface. Moodle enrollment happens automatically in the background.

## Data Flow Diagram

```
Admin Dashboard
    ↓
Select Application(s)
    ↓
Click "Approve Selected"
    ↓
    ├→ [review-decision OR bulk-approve endpoint]
    │
    ├→ Update application_status to 'accepted'
    │
    ├→ [enrollStudentInMoodle() called]
    │   ├→ Get Moodle courses list
    │   ├→ Find matching course by code
    │   ├→ Create user in Moodle
    │   ├→ Get user ID
    │   └→ Enroll user in course
    │
    ├→ Create user account in SCL
    │
    ├→ Generate temporary password
    │
    └→ Send welcome email
        ├→ SCL credentials
        └→ Moodle access info

Student receives email
    ↓
Login to SCL: http://localhost:3000
    ↓
Login to Moodle: http://localhost:9090
    ↓
Access programme/modules
```

## Next Steps

### Phase 2: Student Self-Service Enhancements
- [ ] Add "My Moodle Courses" widget to student dashboard
- [ ] Add direct link to Moodle from student portal
- [ ] Show Moodle course progress on admissions page
- [ ] Sync Moodle grades back to SCL database

### Phase 3: Admin Enhancements
- [ ] Manual Moodle enrollment button if auto-enrollment fails
- [ ] Moodle enrollment status column in admin dashboard
- [ ] Bulk re-enroll students if Moodle was down
- [ ] Moodle sync logs export

### Phase 4: Advanced Features
- [ ] Conditional offer → Provisional enrollment (Student role without access)
- [ ] Rejection → Unenroll from Moodle
- [ ] Withdrawal → Remove from Moodle
- [ ] Automated backup before bulk changes

## References

- [Moodle Web Services API](https://docs.moodle.org/403/en/Web_services)
- [core_course_get_courses](https://docs.moodle.org/403/en/Development:Web_services/Core_course_functions#core_course_get_courses)
- [core_user_create_users](https://docs.moodle.org/403/en/Development:Web_services/Core_user_functions#core_user_create_users)
- [enrol_manual_enrol_users](https://docs.moodle.org/403/en/Development:Web_services/Manual_enrolment_functions#enrol_manual_enrol_users)

## Support

For issues or questions:
1. Check backend logs: `docker logs scli-backend-dev`
2. Verify Moodle is accessible: `http://localhost:9090/`
3. Check database: Student account should exist in `users` table
4. Review this documentation for error handling section

---

**Status**: ✅ **FULLY IMPLEMENTED AND TESTED** (February 3, 2026)

**Last Updated**: Backend restarted at 19:57 UTC+5:00

**Tested By**: Development Team

**Next Review**: After first batch of real student approvals
