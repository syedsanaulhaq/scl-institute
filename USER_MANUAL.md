# SCL Institute System - User Manual
**Admin Portal: http://system.sclsandbox.xyz**  
**Public Website: http://sclsandbox.xyz**

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Admin Portal Guide](#admin-portal-guide)
4. [Application Management](#application-management)
5. [Student Management](#student-management)
6. [Course Management](#course-management)
7. [Notifications System](#notifications-system)
8. [Reports & Analytics](#reports--analytics)
9. [Troubleshooting](#troubleshooting)

---

## 1. System Overview

The SCL Institute Management System consists of two main portals:

### **Public Portal** (http://sclsandbox.xyz)
- Student course browsing
- Online application submission
- Course information
- Contact information

### **Admin System** (http://system.sclsandbox.xyz)
- Application review and approval
- Student management
- Course management
- Notifications
- Reports and analytics

---

## 2. Getting Started

### Accessing the Admin System

1. **Navigate to:** http://system.sclsandbox.xyz
2. **Login Credentials:**
   - Email: `admin@sclsandbox.xyz`
   - Password: `password123`

### Default Admin Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@sclsandbox.xyz | password123 | Super Admin |
| admin@scl.com | password | Admin |

---

## 3. Admin Portal Guide

### Dashboard Overview

After logging in, you'll see the **Admin Dashboard** with:

#### Key Metrics Cards
- **Total Applications** - Number of applications received
- **Pending Reviews** - Applications awaiting review
- **Accepted Students** - Approved applications
- **Active Courses** - Available courses

#### Quick Actions
- **Review Applications** - Access pending applications
- **Manage Students** - View enrolled students
- **Send Notifications** - Broadcast messages
- **Generate Reports** - View analytics

#### Recent Activity
- Latest application submissions
- Recent approvals/rejections
- System notifications

---

## 4. Application Management

### Viewing Applications

1. Click **"Applications"** in the sidebar
2. Filter applications by:
   - Status (Draft, Submitted, Under Review, Accepted, Rejected)
   - Course
   - Date range

### Application Review Process

#### Step 1: Open Application
1. Click **"Review"** button on any application
2. View applicant details:
   - Personal information
   - Contact details
   - Course selection
   - Academic background
   - Submitted documents

#### Step 2: Complete Review Form
Fill in the following fields:

**Auto-filled Information:**
- Application ID
- Applicant Name
- Course Applied For
- Application Date

**Reviewer Assessment:**
- **Reviewer Name** * (Required) - Enter your full name
- **Review Date** - Auto-populated (current date)
- **Documents Verified** - Select: Yes / No / Pending
- **Eligibility Check** - Select: Meets criteria / Does not meet criteria / Pending
- **Interview Conducted** - Select: Yes / No / Not Required
  - If "Yes": **Interview Outcome** - Pass / Fail
- **English Language Requirement Met** - Select: Yes / No / Not Applicable
- **Additional Notes** - Free text comments

**Final Decision:**
- **Decision** * (Required) - Select one:
  - **Offer** - Approve application
  - **Conditional Offer** - Approve with conditions
  - **Refusal** - Reject application
  - **Waitlist** - Place on waiting list

- **Reason for Refusal** * (If Refusal selected)
  - Academic criteria not met
  - English language requirement not met
  - Insufficient documents
  - Did not pass interview
  - Course full
  - Other

- **Detailed Comments** - Justification for decision
- **Committee Chair Name** - Optional
- **Final Decision Date** - Optional
- **Confirmation Checkbox** - Confirm review decision

#### Step 3: Submit Review
1. Click **"Submit Review"** button
2. For **Approved applications**, student credentials will be generated:
   - Email/Username
   - Temporary password
   - **Copy these credentials** before closing

### Review Status Indicators
- 🔵 **Draft** - Application not yet submitted
- 🟡 **Submitted** - Awaiting review
- 🟠 **Under Review** - Being processed
- 🟢 **Accepted** - Approved
- 🟣 **Conditional Accept** - Approved with conditions
- 🔴 **Rejected** - Application declined
- ⚪ **Deferred** - Postponed

### Viewing Existing Reviews
- Applications with completed reviews show in **read-only mode**
- Click **"Edit Review"** to modify existing reviews
- All review history is preserved

---

## 5. Student Management

### Student List
1. Navigate to **"Students"** in sidebar
2. View all enrolled students
3. Filter by:
   - Course
   - Status (Active, Completed, Withdrawn)
   - Enrollment date

### Student Actions
- **View Profile** - See full student details
- **Edit Information** - Update student records
- **View Applications** - See application history
- **Enrollment Status** - Manage active/inactive status

---

## 6. Course Management

### Viewing Courses
1. Click **"Courses"** in sidebar
2. See all available courses with:
   - Course code
   - Course title
   - Department
   - Duration
   - Status

### Course Information
Each course displays:
- **Course Code** - Unique identifier (e.g., BTECH-CSE-001)
- **Course Title** - Full name
- **Type** - HND / Degree / Vocational / Short Course / CPD
- **Department** - Engineering / Business / IT / Commerce
- **Duration** - In months
- **Study Modes:**
  - Full-time
  - Part-time
  - Online
  - Blended
- **Status** - Active / Inactive

### Available Courses
| Course Code | Title | Type | Duration |
|-------------|-------|------|----------|
| BTECH-CSE-001 | B.Tech Computer Science | Degree | 48 months |
| BTECH-MEC-001 | B.Tech Mechanical Engineering | Degree | 48 months |
| MBA-BA-001 | MBA Business Administration | Degree | 24 months |
| MCA-001 | Master of Computer Applications | Degree | 24 months |
| BCOM-001 | B.Com Commerce | Degree | 36 months |
| CERT-AI-001 | Artificial Intelligence Basics | CPD | 8 months |

---

## 7. Notifications System

### Sending Notifications
1. Navigate to **"Notifications"** section
2. Click **"Send Notification"**
3. Fill in:
   - **Recipients** - Select users or groups
   - **Title** - Notification subject
   - **Message** - Notification body
   - **Type** - Info / Warning / Success
4. Click **"Send"**

### Viewing Notifications
- Bell icon in top navigation shows unread count
- Click to view all notifications
- Mark as read/unread

---

## 8. Reports & Analytics

### Dashboard Analytics
- Application trends over time
- Acceptance/rejection rates
- Course popularity
- Student enrollment statistics

### Generating Reports
1. Go to **"Reports"** section
2. Select report type:
   - Applications Report
   - Enrollment Report
   - Course Performance
3. Choose date range
4. Export as PDF or Excel

---

## 9. Troubleshooting

### Common Issues

#### Cannot Login
- **Solution:** Verify credentials
- Default admin: `admin@sclsandbox.xyz` / `password123`
- Contact system administrator if forgotten

#### Application Not Loading
- **Solution:** Refresh the page
- Clear browser cache
- Check internet connection

#### Cannot Submit Review
- **Solution:** 
  - Ensure all required fields (*) are filled
  - Check "Reviewer Name" and "Decision" are completed
  - If "Refusal", must select "Reason for Refusal"

#### Student Credentials Not Generated
- **Solution:**
  - Only "Offer" decision generates credentials
  - Credentials appear after successful review submission
  - Copy credentials immediately (shown only once)

#### Page Loading Slowly
- **Solution:**
  - System loads all data on startup
  - First page load may take 5-10 seconds
  - Subsequent navigation is faster

### Getting Help

**Technical Support:**
- Email: support@sclsandbox.xyz
- Phone: +44 (0) 20 xxxx xxxx

**System Administrator:**
- Email: admin@sclsandbox.xyz

---

## Quick Reference Commands

### Keyboard Shortcuts
- `Ctrl + S` - Save (where applicable)
- `Esc` - Close modals
- `Tab` - Navigate between fields

### Important URLs
- **Admin Portal:** http://system.sclsandbox.xyz
- **Public Website:** http://sclsandbox.xyz
- **API Endpoint:** http://system.sclsandbox.xyz/api

### Status Codes
- 200 - Success
- 401 - Unauthorized (login required)
- 404 - Not Found
- 500 - Server Error

---

## Appendix

### User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full system access |
| **Admin** | Manage applications, students, courses |
| **Teacher** | View students, manage course content |
| **Student** | View own profile, submit applications |

### Data Backup
- System automatically backs up daily
- Database snapshots stored securely
- Restore available through administrator

### Security Best Practices
- Change default passwords immediately
- Use strong passwords (min. 8 characters)
- Log out after each session
- Don't share login credentials

---

**Document Version:** 1.0  
**Last Updated:** February 13, 2026  
**System Version:** Production v1.0

For updates to this manual, visit: http://system.sclsandbox.xyz/help
