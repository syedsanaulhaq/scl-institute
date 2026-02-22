# Quick Start Guide - Admin Dashboard for Admissions Team

## 🚀 Getting Started in 2 Minutes

### Step 1: Login
1. Open http://localhost:3000
2. Enter your admin credentials
3. Click "Login"

### Step 2: Access Dashboard
1. Look for the sidebar on the left
2. Click on **"Admissions Hub"** (second menu item with chart icon)
3. Dashboard loads instantly

### Step 3: See Your Data
You'll see:
- **Total Applications**: How many students have applied
- **Accepted**: Students you've approved
- **Conditional**: Students with conditions pending
- **Pending Review**: Applications awaiting decision
- **Rejected**: Declined applications

---

## 📊 Using the Dashboard

### Finding a Specific Student

**Method 1: Search**
1. Click the search box at the top
2. Type student name, email, or application reference
3. Results update instantly
4. Results show in the table below

**Method 2: Filter by Status**
1. Click the "Status" dropdown
2. Select: Submitted, Under Review, Accepted, Conditional, Rejected, or All
3. Table updates immediately

**Method 3: Filter by Course**
1. Click the "Course" dropdown
2. Select the course/programme
3. Shows only applications for that course

**Method 4: Combine Filters**
- Use search + status + course together
- Example: Search for "Ahmed" + Status "Pending" + Course "CS001"
- Shows only matching applications

---

## ✅ Approving Students (Bulk Operation)

### Quick Approval Process

**Step 1: Select Students**
1. Look at the table of applications
2. Click the checkbox (☐) next to each student you want to approve
3. Selected checkboxes turn blue (☑)
4. Count shows at the top: "X selected"

**Step 2: Select All (Optional)**
- Click the checkbox in the table header (☐) to select ALL filtered students
- Useful when you want to approve all pending applications

**Step 3: Approve**
1. Click the **"Approve Selected"** button (turns blue, shows count)
2. A dialog appears asking to confirm
3. Click **"OK"** to approve
4. System processes each student:
   - ✓ Updates status to "Accepted"
   - ✓ Creates user account
   - ✓ Generates temporary password
   - ✓ Sends welcome email
5. Success message shows how many were approved
6. Table refreshes automatically

**Step 4: Students Are Ready**
- Approved students will receive an email with:
  - Login credentials (email and temporary password)
  - Welcome message from the institute
  - Link to their student portal
  - Next steps to complete enrolment

---

## 📧 What Students Receive

After you approve them, students automatically get an email with:

```
Subject: Welcome to SCL Institute - Your Account is Ready!

Dear [Student Name],

Congratulations! Your application has been accepted.

LOGIN DETAILS:
- Email: student.email@example.com
- Temporary Password: (auto-generated, e.g., a1b2c3d4e5f6)

They can then:
1. Log in to student portal
2. Update their profile
3. View programme details
4. Check timetable and fees
5. Access learning materials
```

---

## 📥 Reviewing Individual Applications

### For Detailed Review

1. Find the student in the table
2. Click the **"Review"** button at the far right
3. Opens detailed review page where you can:
   - See all application details
   - Read documents
   - Add comments
   - Make individual decision
   - Approve/Reject/Defer

---

## 💾 Exporting Data

### When You Need Reports

1. Use filters/search to narrow down applications
   - Example: Filter by "Accepted" status
2. Click **"Export to CSV"** button (green, bottom right)
3. File downloads automatically with today's date
   - Example: `applications_2026-02-03.csv`
4. Opens in Excel, Google Sheets, or similar

### What's in the CSV
- Application ID
- Reference number
- Student name
- Email
- Course
- Application status
- Submission date

---

## ⚙️ Helpful Tips

### Tip 1: Filter Before Bulk Approve
- Filter by "Pending Review" status
- This shows only applications you haven't decided on yet
- Then select and approve them all

### Tip 2: Search for Problem Cases
- If a student's email bounced, search their email
- Review their application
- Look for correct email address
- You can contact them manually if needed

### Tip 3: Use Status Filter to Track Work
- **"Submitted"** = New applications to review
- **"Under Review"** = You're reviewing these
- **"Pending Review"** = Waiting for your decision (combined status)
- **"Accepted"** = Approved and accounts created
- **"Rejected"** = Declined applications

### Tip 4: Course Filter for Batch Processing
- Filter by specific course (e.g., "BS Computer Science")
- Approve all students for that course together
- Faster than individual approvals

### Tip 5: Export Weekly
- Every Friday, export all applications
- Keep as backup
- Use for reports and analysis
- Share with management

---

## 🚨 Common Questions

**Q: What happens when I approve a student?**
A: System automatically:
1. Updates their status to "Accepted"
2. Creates a student account with their email
3. Generates a secure temporary password
4. Sends them a welcome email with login details

**Q: What is the temporary password?**
A: A random secure password (like "a1b2c3d4e5f6") that students must change on first login for security.

**Q: Can I undo an approval?**
A: Contact your system administrator. The account will exist in the system.

**Q: What if the email fails?**
A: Check the application for the correct email address. Try sending a manual email or use the contact info in their application.

**Q: How many students can I approve at once?**
A: As many as you want! Select all with the "Select All" checkbox and approve them together.

**Q: Where do I see how many students are enrolled?**
A: Look at the Statistics cards at the top:
- **Total Applications**: All who applied
- **Accepted**: All you've approved
- Count the approved to see enrollments

**Q: Can I approve and reject simultaneously?**
A: No, but you can:
1. Filter by a status
2. Select some students
3. Approve them
4. Then select others and reject them

**Q: How do I know which applications I've reviewed?**
A: Look at the Status column. If it shows:
- "Accepted" = You approved them
- "Rejected" = You rejected them
- "Pending Review" = Still need your decision

---

## 📱 Using on Mobile

The dashboard works on phones and tablets:

1. Open http://localhost:3000 on your phone
2. Login normally
3. Navigate to Admissions Hub
4. Everything works the same way
5. Buttons scale for touch screens

---

## ⏱️ Typical Workflow

### Daily Process (30 minutes)

1. **Check Dashboard** (2 min)
   - See new applications count
   - Review statistics

2. **Filter Pending** (1 min)
   - Set Status to "Pending Review"
   - Shows applications awaiting decision

3. **Bulk Review** (20 min)
   - Click "Review" on each application
   - Read documents and notes
   - Make decision

4. **Bulk Approve** (5 min)
   - Filter to show your decisions
   - Select approved students
   - Click "Approve Selected"
   - Wait for confirmation

5. **Export Records** (2 min)
   - Click "Export to CSV"
   - Save the file
   - Email to manager or archive

### Weekly Process (1 hour)

1. Monday morning: Export all applications
2. Throughout week: Process applications daily
3. Friday: Export final counts for report
4. Archive all weekly exports

---

## 🆘 Troubleshooting

### Dashboard Won't Load
- Refresh the page (F5)
- Clear browser cache (Ctrl+Shift+Delete)
- Try a different browser
- Contact IT support

### Search Not Working
- Make sure there are applications in the database
- Try removing all filters
- Refresh the page
- Contact IT support

### Bulk Approve Seems Stuck
- Check the message at top of screen
- Wait 5-10 seconds (could still processing)
- Check that you selected students
- Contact IT support if still stuck

### Didn't Get Email Confirmation
- Check spam/junk folder
- Ask IT to check email service
- Check system logs for errors

### CSV File Won't Open
- Make sure Excel/Sheets is installed
- Try opening with Google Sheets online
- Use comma-separated format
- Ask IT support

---

## 📞 Getting Help

### Quick Help
1. Read this guide again
2. Check the FAQ section above
3. Hover over buttons (tooltips appear)

### Detailed Help
- See: ADMIN_DASHBOARD.md file
- Contains full feature documentation
- Step-by-step instructions with examples

### Technical Issues
- Contact IT support
- Tell them:
  - What you were trying to do
  - What error message you saw
  - What happened instead

---

## 🎓 Training & Support

### First Time Using?
1. Read this Quick Start guide (you're reading it!)
2. Log in to the dashboard
3. Try searching for a student
4. Try filtering by status
5. Try reviewing one application

### Want More Details?
- See ADMIN_DASHBOARD.md
- Contains comprehensive documentation
- Screenshots and examples
- All features explained

### Need Help?
- Contact: Your IT support team
- Include: What you tried, what happened, any error messages

---

## 🎉 You're Ready!

You now know how to:
✅ Access the Admin Dashboard
✅ Search and filter applications
✅ Approve multiple students at once
✅ Export data for reports
✅ Review individual applications
✅ Handle common issues

**Happy admissions processing!**

---

**Version**: 1.0  
**Last Updated**: February 3, 2026  
**Questions?** Contact IT Support
