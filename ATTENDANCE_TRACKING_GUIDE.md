# Attendance Tracking Guide for Moodle 4.3

**Note:** The official Attendance activity module requires Moodle 5.1+. For Moodle 4.3, we'll use built-in Moodle features to track attendance.

---

## Option 1: Daily Sign-In Quiz (Recommended)

Create a quick daily attendance quiz that students must complete.

### Steps:
1. Navigate to Course → Add Activity → Quiz
2. **Settings:**
   - Name: "Daily Attendance - [Date]"
   - Points: 1-5 (auto-graded)
   - Time Limit: 1-2 minutes
   - Attempt Settings: Allow 1 attempt only
   - Due Date: Start of class (optional)

3. **Create Single Question:**
   - Question Type: Multiple Choice or Short Answer
   - Question: "What is today's date?" or "Attendance confirmation"
   - Accept any answer (marked correct automatically)

4. **Grade Report:**
   - Go to Grade Book → View attendance via quiz completion
   - Filter by date/quiz to see who attended

---

## Option 2: Course Participation Tracking

Use Moodle's built-in participation and completion tracking.

### Steps:
1. **Enable Course Completion:**
   - Course Settings → Restrict Access → Completion Tracking
   - Enable: "Course completion"

2. **Create Check-in Forum:**
   - Add Activity → Forum
   - Name: "Daily Check-in"
   - Type: "Q and A"
   - Require: First post before viewing (auto-attendance)

3. **View Participation:**
   - Navigate to: Reports → Logs
   - Filter by student to see login and activity records
   - Filter by date range to track attendance

---

## Option 3: Session Assignment

Create a simple assignment for attendance proof.

### Steps:
1. Add Activity → Assignment
   - Name: "Attendance: [Date]"
   - Type: "Online text" or "File submission"
   - Grade: Out of 10 (Pass/Fail)
   - Due Date: End of class

2. **Instructions:**
   ```
   Attendance Confirmation
   
   To confirm your attendance, submit a brief reflection (one sentence minimum):
   - What was the most important topic covered today?
   - One question you have about today's lesson
   - One key point you learned
   ```

3. **Grading:**
   - Allocate 10 minutes at session end for students to submit
   - Grade as "Complete" or "Incomplete"

---

## Option 4: Roll Call Using Course Restrictions

Use conditional access based on check-in.

### Steps:
1. Create a "Classroom Access" activity
   - Add Activity → Choice
   - Name: "Are you present today?"
   - Options: Yes / No / Excused absence
   - Auto-limit responses to 1 per student

2. **Restrict Access to Resources:**
   - Lesson/quiz content requires "Choice" completion
   - Students must complete choice first
   - Acts as attendance gate

3. **Analytics:**
   - Reports → Course Activity (shows who participated)
   - Reports → Logs (shows time of check-in)

---

## Option 5: Grade Book Attendance Column (Manual)

Create a dedicated attendance column in the grade book.

### Steps:
1. Go to Course → Grades → Course Grade
2. Click **Setup → Category and Items**
3. **Create New Category:**
   - Name: "Attendance"
   - Type: Manual (no calculation)

4. **Add Grade Items:**
   - For each session/week, create a grade item
   - Format: "Present" (10 pts) or "Absent" (0 pts)
   - Enter grades manually based on activity/participation

5. **View Summary:**
   - Reports → Grade Analysis
   - See attendance patterns per student

---

## Recommended Workflow for Daily Attendance:

### Morning Check-in (2 minutes):
```
1. Student logs into course
2. Completes 1-question "Attendance Quiz" 
3. Grade automatically recorded
4. Student gains access to lesson materials

Tracking: Visible in Course Grade Report
```

### End of Class Reflection (5 minutes):
```
1. Student submits assignment: "Today's Learning"
2. Teacher reviews participation
3. Marks as "Present" in attendance column

Tracking: Manual entry in Grade Book
```

### Alternative - Weekly Summary:
```
1. Run Course Logs Report (Reports → Logs)
2. Filter by week
3. Count logins and activity completion
4. Calculate attendance = activities completed / expected

Tracking: Percentage-based from logs
```

---

## Reports to Use for Attendance:

1. **Activity Logs**: Course Admin (top-left) → Reports → Logs
   - Shows every login and action
   - Filter by date and user
   - Dates/times prove attendance

2. **Grade Report**: Grades → View Grades as
   - Shows quiz/assignment completion
   - Dates of submission
   - Proves presence at time of submission

3. **User Activity Report**: Grades → Student Activities
   - Shows each user's engagement
   - Last login times
   - Course participation metrics

4. **Completion Report**: Course → Completion Report
   - Shows who completed assessments
   - Completion dates and times
   - Percentage progress

---

## Database Query for Attendance Export:

You can also query attendance data directly:

```sql
-- Recent logins (last 7 days)
SELECT u.id, u.firstname, u.lastname, u.email, 
       MAX(l.timecreated) as last_login
FROM mdl_logstore_standard_log l
JOIN mdl_user u ON l.userid = u.id
WHERE l.courseid = 11
AND l.timecreated > UNIX_TIMESTAMP() - (7 * 24 * 60 * 60)
GROUP BY l.userid
ORDER BY last_login DESC;

-- Assignment submissions (attendance proof)
SELECT u.firstname, u.lastname, a.name, 
       MAX(asub.timemodified) as submission_time
FROM mdl_assign_submission asub
JOIN mdl_assign a ON asub.assignment = a.id
JOIN mdl_user u ON asub.userid = u.id
WHERE a.course = 11
GROUP BY u.id, a.id
ORDER BY submission_time DESC;
```

---

## Summary: Choose Your Method

| Method | Setup Time | Accuracy | Automation | Notes |
|--------|-----------|----------|-----------|-------|
| Daily Quiz | 10 min | High | Auto-graded | Best for online |
| Forum Check-in | 5 min | Medium | Requires review | Good for engagement |
| Assignment | 10 min | High | Manual review | Proves work done |
| Access Gate | 15 min | High | Automatic | Strict but fair |
| Manual Grade Book | 15 min | Variable | Manual entry | Simple integration |

**Recommended**: Combine Daily Quiz (automatic) + Grade Book (manual confirmation) for accurate attendance tracking.
