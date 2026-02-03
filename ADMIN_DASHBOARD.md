# Admin Dashboard Documentation

## Overview
The new Admin Dashboard provides admissions staff with comprehensive tools to manage student applications efficiently, including real-time statistics, advanced search and filtering, bulk operations, and data export capabilities.

## Features

### 1. Real-Time Statistics
The dashboard displays key performance indicators (KPIs) at a glance:
- **Total Applications**: Complete count of all applications
- **Accepted**: Number of students who received acceptance offers
- **Conditional**: Students with conditional acceptance pending conditions
- **Pending Review**: Applications awaiting initial review or decision
- **Rejected**: Applications that were rejected

### 2. Advanced Search & Filtering

#### Search
- Search by student name, email, or application reference
- Real-time filtering as you type
- Case-insensitive search across all fields

#### Status Filter
- All Statuses
- Submitted
- Under Review
- Accepted
- Conditional
- Rejected

#### Course Filter
- Dynamically populated with all offered courses
- Filter applications by specific programmes

### 3. Application Table
Displays all filtered applications with:
- Checkbox selection for bulk operations
- Student name and email
- Course code
- Application reference number
- Current application status with color-coded badges
- Submission date
- Quick action buttons ("Review" button links to detailed review page)

### 4. Bulk Actions
Once applications are selected:
- Selected count display
- **Approve Selected**: Bulk approve multiple applications
  - Automatically creates student user accounts
  - Generates temporary passwords
  - Sends welcome emails to approved students
  - Updates application status to "accepted"

### 5. Data Export
- **Export to CSV**: Download filtered application data
- Includes: ID, Reference, Name, Email, Course, Status, Submitted Date
- Useful for reporting, analysis, and archival

### 6. Responsive Design
- Mobile-friendly layout
- Collapsible sidebar for more screen space
- Touch-friendly controls

## How to Use

### Accessing the Admin Dashboard
1. Login as an admin user
2. Click "Admissions Hub" in the sidebar (second option in admin menu)
3. Dashboard loads with all applications and statistics

### Searching for Applications
1. Use the search box to find specific students
2. Enter any part of the name, email, or reference number
3. Results update instantly

### Filtering by Status
1. Click the "Status" dropdown
2. Select desired status (e.g., "Pending Review")
3. Table updates automatically
4. Combine with other filters for precise results

### Filtering by Course
1. Click the "Course" dropdown
2. Select a course code
3. Only applications for that course appear

### Selecting Applications
1. Click checkboxes next to applications you want to select
2. Use the "Select All" checkbox in the header to select all displayed applications
3. Selected count shows at the top

### Bulk Approving Applications
1. Select one or more applications using checkboxes
2. Click the blue "Approve Selected" button
3. Confirm the action in the popup dialog
4. System will:
   - Update application status to "Accepted"
   - Create student user accounts
   - Generate temporary passwords (e.g., "a1b2c3d4e5f6")
   - Send welcome emails with login credentials and next steps
5. Refresh confirmation shows successful approvals

### Exporting Data
1. Apply any filters/search to narrow down data
2. Click "Export to CSV" button
3. CSV file downloads automatically with timestamp
4. Open in Excel or Google Sheets for analysis

### Reviewing Individual Applications
1. Click "Review" button on the desired application row
2. Opens the detailed application review page
3. Can add comments, make decisions, and approve/reject individually

## Backend API Endpoints

### Statistics
```
GET /api/students/dashboard-stats
```
Returns counts of applications by status.

### Get Applications
```
GET /api/students/applications?status=pending&course=CS001
```
Query parameters:
- `status`: Filter by application status
- `course`: Filter by course code

### Bulk Approve
```
POST /api/students/bulk-approve
Body: {
  applicationIds: [1, 2, 3],
  reviewer_name: "Admin Name"
}
```
- Creates user accounts for each application
- Generates temporary passwords
- Sends welcome emails
- Updates status to "accepted"

### Bulk Reject
```
POST /api/students/bulk-reject
Body: {
  applicationIds: [1, 2],
  reason: "Insufficient qualifications"
}
```
- Updates status to "rejected"
- Records rejection reason

## Features Coming Soon

- [ ] Conditional approval bulk action
- [ ] Deferred applications management
- [ ] Advanced date range filtering
- [ ] Custom report generation
- [ ] Email templates customization
- [ ] Application history and audit trail
- [ ] Notification preferences
- [ ] Bulk email sending (separate from approvals)

## Performance Notes

- Dashboard loads 100+ applications efficiently
- Search is instant with client-side filtering
- Bulk operations are batched for optimal database performance
- CSV export handles large datasets gracefully

## User Roles & Permissions

- **Admin**: Full access to all dashboard features
- **Student**: Cannot access; redirected to student portal
- **Staff** (if applicable): Access depends on role configuration

## Troubleshooting

### Applications Not Loading
- Verify backend service is running
- Check browser console for API errors
- Ensure MySQL database has application data

### Bulk Approve Not Creating Users
- Check backend logs for user creation errors
- Verify database `users` table exists and is accessible
- Ensure student emails don't already exist in `users` table

### Emails Not Sending
- Check backend email service configuration
- Verify SMTP credentials in environment variables
- Check backend logs for email service errors
- System logs to console if SMTP is unavailable

### Filters Not Working
- Refresh the page and try again
- Check that data exists for selected filters
- Try removing all filters to reset

## Best Practices

1. **Regular Exports**: Export application data weekly for backup
2. **Batch Processing**: Process applications in batches of 10-20 for better tracking
3. **Review First**: Always review at least one application individually before bulk approval
4. **Verify Emails**: Confirm email service is configured before bulk operations
5. **Track Changes**: Note who approved applications and when (logged in system)

## Contact & Support

For issues or feature requests:
- Check backend logs: `docker logs scli-backend-dev`
- Check frontend console (F12 → Console tab)
- Review this documentation for common solutions
