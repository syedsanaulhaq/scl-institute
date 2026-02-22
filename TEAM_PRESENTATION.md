# 📊 SCL-Institute System Architecture & Workflow
## Team Presentation Document

---

## TABLE OF CONTENTS
1. System Overview & Vision
2. Complete Workflow Diagram
3. Database Structure Map
4. Role-Based Access Matrix
5. Data Flow (RAOS)
6. Integration Points
7. Implementation Timeline

---

## 🎯 SYSTEM OVERVIEW & VISION

### **What We're Building:**
A **unified institutional management system** that integrates:
- **SCL Main System** (Forms, Admin, Governance)
- **Moodle LMS** (Learning delivery, assessments)
- **ERP Capabilities** (Finance, HR, Compliance)

### **3-Tier Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│        (React Frontend @ sclsandbox.xyz)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Dashboard | Forms | Reports | User Management          │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                       │
│        (Node.js API @ backend, port 4000)                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ API Routes | Validation | Middleware | Auth            │   │
│  │ SSO Bridge | File Processing | Reporting Logic         │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                      DATA LAYER                                 │
│        (MySQL @ port 3306)                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 40+ Tables | Relationships | Audit Trail | Reports     │   │
│  │ Users | Roles | Forms | Documents | Compliance         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                             ↓
                    (SSO Integration)
                             ↓
                      ┌──────────────────┐
                      │  MOODLE LMS      │
                      │ (lms.sclsandbox) │
                      │  Port 8080       │
                      └──────────────────┘
```

---

## 🔄 COMPLETE SYSTEM WORKFLOW

### **SECTION A: USER JOURNEY - STUDENT LIFECYCLE**

```
START: Student Visits System
│
├─► STEP 1: APPLICATION PHASE
│   ├─ Student creates account (sclsandbox.xyz)
│   ├─ Completes Student Application form:
│   │  ├─ Personal info (name, DOB, contact)
│   │  ├─ Academic background
│   │  ├─ Course selection
│   │  ├─ Entry route (Standard/RPL/Mature)
│   │  └─ Document uploads (certificates, ID, etc)
│   ├─ Stored in: student_applications table
│   ├─ Status: "Draft" → "Submitted"
│   └─ Notification sent
│
├─► STEP 2: APPLICATION REVIEW (Admissions Officer)
│   ├─ Admissions officer logs in
│   ├─ Views pending applications
│   ├─ Completes Application Review form:
│   │  ├─ Academic suitability assessment
│   │  ├─ Document verification
│   │  ├─ Language proficiency check
│   │  └─ Recommendation (approve/reject/conditional)
│   ├─ Stored in: application_reviews table
│   ├─ Application status changes
│   └─ Student notified
│
├─► STEP 3: ADMISSION DECISION
│   ├─ If approved:
│   │  ├─ Admissions Decision form filled
│   │  ├─ Offer letter generated
│   │  ├─ Acceptance deadline set
│   │  ├─ Stored in: admissions table
│   │  └─ Student receives offer email
│   ├─ If rejected:
│   │  └─ Rejection reason recorded
│   └─ Status: "Accepted" / "Rejected"
│
├─► STEP 4: STUDENT ONBOARDING
│   ├─ Student accepts offer
│   ├─ Onboarding Checklist completed:
│   │  ├─ Student handbook provided
│   │  ├─ Course handbook provided
│   │  ├─ Policies explained (Code of Conduct, GDPR, etc)
│   │  ├─ IT setup (email, library access)
│   │  ├─ Consent forms signed
│   │  └─ Orientation completed
│   ├─ Stored in: student_onboarding table
│   ├─ Status: "Onboarding" → "Complete"
│   └─ Trigger: Automatic Moodle enrollment
│
├─► STEP 5: MOODLE LMS ENROLLMENT (Automatic)
│   ├─ SSO token generated
│   ├─ Course registration created
│   ├─ Student auto-logged into Moodle
│   ├─ Enrolled in course cohort
│   ├─ Access to course materials
│   └─ Learning begins
│
├─► STEP 6: ACTIVE LEARNING & ASSESSMENT
│   ├─ Course delivery in Moodle
│   ├─ Schedules & Timetable (in Moodle)
│   ├─ Assignments & Assessments (in Moodle)
│   ├─ Exams (in Moodle)
│   ├─ Grading (in Moodle)
│   └─ Data synced back to SCL system
│
├─► STEP 7: SUPPORT & ISSUE RESOLUTION
│   ├─ Student can submit Support Request:
│   │  ├─ Academic support
│   │  ├─ Technical issues
│   │  ├─ Personal/welfare support
│   │  └─ Financial queries
│   ├─ Stored in: support_requests table
│   ├─ Support team assigns & resolves
│   └─ Status tracking
│
├─► STEP 8: COMPLETION & GRADUATION
│   ├─ All assessments completed
│   ├─ Final grades recorded
│   ├─ Graduation eligibility verified
│   ├─ Certificate issued
│   └─ Record archived
│
└─► END: Student completes program

```

---

### **SECTION B: AWARDING BODY & PARTNER WORKFLOW**

```
START: Partnership Management
│
├─► STEP 1: PARTNER REGISTRATION
│   ├─ Super Admin adds new awarding body/partner
│   ├─ Partner record created:
│   │  ├─ Organization name
│   │  ├─ Contact details
│   │  ├─ Partnership type
│   │  └─ Status (active/inactive)
│   └─ Stored in: partners table
│
├─► STEP 2: AWARDING BODY VISIT PLANNING
│   ├─ Visit scheduled:
│   │  ├─ Visit type (Annual Monitoring, Audit, etc)
│   │  ├─ Date set
│   │  ├─ Lead contact assigned
│   │  └─ Coordinator appointed
│   ├─ Stored in: awarding_body_visits table
│   └─ Status: "Planned"
│
├─► STEP 3: PRE-VISIT PREPARATION
│   ├─ Coordinator manages checklist:
│   │  ├─ Confirm visit details
│   │  ├─ Update institutional profile
│   │  ├─ Prepare programme specifications
│   │  ├─ Compile student records
│   │  ├─ Gather staff CVs
│   │  ├─ Review facility status
│   │  ├─ Update marketing materials
│   │  ├─ Arrange facilities/attendees
│   │  └─ Prepare evidence documents
│   ├─ Each task assigned to responsible person
│   ├─ Deadlines tracked
│   └─ Stored in: pre_visit_checklist table
│
├─► STEP 4: VISIT EXECUTION
│   ├─ Visit day activities:
│   │  ├─ 9:00 - Arrival & Welcome
│   │  ├─ 9:30 - Introduction meeting
│   │  ├─ 10:00 - Document review
│   │  ├─ 11:00 - Meetings with staff
│   │  ├─ 14:00 - Student interactions
│   │  ├─ 15:30 - Closing meeting
│   │  └─ 16:00 - Departure
│   ├─ Status: "In Progress"
│   └─ Feedback notes recorded
│
├─► STEP 5: POST-VISIT ACTIONS
│   ├─ Review findings & recommendations
│   ├─ Create action items:
│   │  ├─ Priority (High/Medium/Low)
│   │  ├─ Assigned to person
│   │  ├─ Due date
│   │  └─ Expected outcome
│   ├─ Stored in: post_visit_actions table
│   ├─ Track completion with evidence
│   └─ Status: "In Progress" → "Completed"
│
├─► STEP 6: RISK & ISSUE LOG
│   ├─ Identify risks from visit:
│   │  ├─ Risk description
│   │  ├─ Impact level
│   │  ├─ Mitigation plan
│   │  └─ Owner assigned
│   ├─ Stored in: risk_register table
│   └─ Regular review scheduled
│
├─► STEP 7: SUBSCRIPTIONS & RENEWALS
│   ├─ Track partnership costs:
│   │  ├─ Subscription type
│   │  ├─ Duration (annual, multi-year)
│   │  ├─ Cost
│   │  ├─ Renewal date
│   │  └─ Payment status
│   ├─ Stored in: subscriptions table
│   └─ Reminders for renewals
│
└─► CYCLE REPEATS: Next inspection scheduled

```

---

### **SECTION C: FACULTY & HR WORKFLOW**

```
START: Faculty Management
│
├─► STEP 1: FACULTY RECRUITMENT
│   ├─ Job posting created
│   ├─ Applications received:
│   │  ├─ Personal information
│   │  ├─ Qualifications & experience
│   │  ├─ CV/Resume uploaded
│   │  └─ Application submitted
│   ├─ Stored in: faculty_applications table
│   └─ Status: "Submitted"
│
├─► STEP 2: FACULTY SCREENING & SELECTION
│   ├─ HR reviews applications:
│   │  ├─ Document verification
│   │  ├─ Shortlisting (qualifications check)
│   │  ├─ Interview scheduling
│   │  └─ Interview feedback
│   ├─ Stored in: faculty_selections table
│   ├─ Status: "Screening" → "Shortlisted" → "Interview"
│   └─ Offers extended to chosen candidates
│
├─► STEP 3: FACULTY ONBOARDING
│   ├─ Selected faculty member logs in
│   ├─ Onboarding Checklist:
│   │  ├─ Employee handbook provided
│   │  ├─ IT setup (email, systems access)
│   │  ├─ Office/workspace setup
│   │  ├─ Course assignments confirmed
│   │  ├─ Mentor assigned
│   │  ├─ Orientation completed
│   │  └─ HR processing complete
│   ├─ Stored in: faculty_onboarding table
│   └─ Status: "Complete"
│
├─► STEP 4: COURSE ASSIGNMENT & TEACHING
│   ├─ Faculty assigned to courses
│   ├─ Course delivery in Moodle:
│   │  ├─ Upload course materials
│   │  ├─ Create schedules
│   │  ├─ Set up assessments
│   │  ├─ Monitor student progress
│   │  └─ Grade submissions
│   └─ Stored in: course_deliveries, timetables, assessments
│
├─► STEP 5: HR OPERATIONS
│   ├─ Ongoing HR records maintained:
│   │  ├─ Leave management
│   │  ├─ Payroll records
│   │  ├─ Performance reviews
│   │  ├─ Professional development
│   │  └─ Promotions/transfers
│   ├─ Stored in: hr_records table
│   └─ Accessible to Faculty & HR Manager role
│
└─► CYCLE CONTINUES: Faculty manages courses & development

```

---

### **SECTION D: COURSE MANAGEMENT WORKFLOW**

```
START: Course Development
│
├─► STEP 1: COURSE INITIATION
│   ├─ Faculty or admin proposes new course:
│   │  ├─ Course code & title
│   │  ├─ Course type (HND, Degree, etc)
│   │  ├─ Mode of study (Full-time, Part-time, Online)
│   │  ├─ Duration & credits
│   │  ├─ Awarding body
│   │  └─ Course description
│   ├─ Stored in: courses table
│   └─ Status: "Draft"
│
├─► STEP 2: COURSE APPROVAL INITIATION
│   ├─ Course submitted for review:
│   │  ├─ QA team receives submission
│   │  ├─ Compliance check begins
│   │  ├─ Stored in: course_approvals table
│   │  └─ Status: "Submitted" → "Under Review"
│   │
│   └─► SUB-PROCESS: Course Compliance Review
│       ├─ Check awarding body requirements
│       ├─ Verify resources (staff, facilities)
│       ├─ Assessment strategy review
│       ├─ Module specifications check
│       ├─ Stored in: course_compliance table
│       └─ Flag any non-compliance
│
├─► STEP 3: APPROVAL DECISION
│   ├─ If compliant:
│   │  ├─ Approved for delivery
│   │  ├─ Status: "Approved"
│   │  └─ Ready for induction
│   ├─ If issues found:
│   │  ├─ Feedback to course owner
│   │  ├─ Status: "Revisions Required"
│   │  └─ Resubmit with changes
│   └─ Stored in: course_approvals table
│
├─► STEP 4: COURSE INDUCTIONS
│   ├─ First cohort induction scheduled:
│   │  ├─ Induction date set
│   │  ├─ Presenter assigned (course leader or admin)
│   │  ├─ Location/online link determined
│   │  ├─ Student attendance recorded
│   │  ├─ Materials distributed
│   │  └─ Q&A session
│   ├─ Stored in: course_inductions table
│   └─ Status: "Planned" → "Completed"
│
├─► STEP 5: COURSE DELIVERY
│   ├─ Course is now active:
│   │  ├─ Created in Moodle
│   │  ├─ Students enrolled
│   │  ├─ Timetable published
│   │  ├─ Assessments set up
│   │  └─ Learning progresses
│   ├─ Stored in: course_deliveries table
│   └─ Status: "Active"
│
├─► STEP 6: ONGOING COMPLIANCE MONITORING
│   ├─ During delivery:
│   │  ├─ Assessment quality monitored
│   │  ├─ Student feedback gathered
│   │  ├─ Resource adequacy verified
│   │  └─ Compliance maintained
│   ├─ Stored in: course_compliance table
│   └─ Status: "Compliant" or flagged issues
│
└─► STEP 7: COURSE COMPLETION & ARCHIVE
    ├─ Final grades recorded
    ├─ Course marked as "Completed"
    ├─ Data archived
    └─ Ready for next iteration

```

---

## 📊 DATABASE STRUCTURE MAP

### **DATABASE SCHEMA DIAGRAM**

```
MYSQL DATABASE (scli-mysql-prod)
│
├── AUTHENTICATION & AUTHORIZATION LAYER
│   ├─ users
│   │  ├─ id (PK)
│   │  ├─ email (UNIQUE)
│   │  ├─ password
│   │  ├─ first_name
│   │  ├─ last_name
│   │  ├─ phone
│   │  ├─ address
│   │  ├─ created_at
│   │  └─ updated_at
│   │
│   ├─ roles
│   │  ├─ id (PK)
│   │  ├─ role_name (UNIQUE) → super_admin
│   │  │                    → lms_manager
│   │  │                    → partners_manager
│   │  │                    → admissions_officer
│   │  │                    → faculty_hr_manager
│   │  ├─ description
│   │  └─ created_at
│   │
│   ├─ user_roles (Many-to-Many junction)
│   │  ├─ id (PK)
│   │  ├─ user_id (FK → users)
│   │  ├─ role_id (FK → roles)
│   │  ├─ assigned_at
│   │  └─ assigned_by (FK → users)
│   │
│   ├─ role_permissions (Action-based permissions)
│   │  ├─ id (PK)
│   │  ├─ role_id (FK → roles)
│   │  ├─ module_name → 'students', 'courses', 'partners'
│   │  ├─ action → 'create', 'read', 'update', 'delete', 'approve'
│   │  └─ UNIQUE(role_id, module_name, action)
│   │
│   └─ sso_tokens (Moodle bridge)
│      ├─ token (PK, UUID)
│      ├─ email
│      ├─ firstname
│      ├─ lastname
│      ├─ role
│      ├─ created_at
│      └─ EXPIRES after 30 minutes
│
├── STUDENT MANAGEMENT LAYER
│   ├─ student_profiles
│   │  ├─ id (PK)
│   │  ├─ user_id (FK → users, UNIQUE)
│   │  ├─ student_id (UNIQUE, Auto-increment)
│   │  ├─ date_of_birth
│   │  ├─ gender
│   │  ├─ nationality
│   │  ├─ highest_qualification
│   │  ├─ work_experience
│   │  ├─ english_proficiency
│   │  ├─ english_score
│   │  ├─ disabilities_support_needed
│   │  └─ created_at
│   │
│   ├─ student_applications
│   │  ├─ id (PK)
│   │  ├─ student_user_id (FK → users)
│   │  ├─ course_id (FK → courses)
│   │  ├─ application_date
│   │  ├─ entry_route (Standard/RPL/Mature)
│   │  ├─ intake_date
│   │  ├─ application_status → draft
│   │  │                    → submitted
│   │  │                    → under_review
│   │  │                    → accepted
│   │  │                    → rejected
│   │  ├─ supporting_documents_uploaded (BOOLEAN)
│   │  ├─ created_at
│   │  └─ updated_at
│   │
│   ├─ application_reviews
│   │  ├─ id (PK)
│   │  ├─ application_id (FK → student_applications)
│   │  ├─ reviewed_by (FK → users)
│   │  ├─ review_date
│   │  ├─ academic_suitability
│   │  ├─ language_proficiency_check
│   │  ├─ documentation_complete
│   │  ├─ recommendation → approve/reject/conditional
│   │  └─ review_notes
│   │
│   ├─ admissions
│   │  ├─ id (PK)
│   │  ├─ application_id (FK → student_applications)
│   │  ├─ admission_date
│   │  ├─ admission_decision → accepted/conditional/rejected
│   │  ├─ conditions (TEXT if conditional)
│   │  ├─ admission_status → pending_confirmation/confirmed/declined
│   │  └─ acceptance_deadline
│   │
│   ├─ student_onboarding
│   │  ├─ id (PK)
│   │  ├─ student_user_id (FK → users)
│   │  ├─ course_id (FK → courses)
│   │  ├─ onboarding_date
│   │  ├─ student_handbook_provided
│   │  ├─ course_handbook_provided
│   │  ├─ policies_explained
│   │  ├─ it_and_email_setup
│   │  ├─ library_access_provided
│   │  ├─ support_services_explained
│   │  ├─ consent_gdpr
│   │  ├─ consent_data_share
│   │  ├─ declaration_signed
│   │  └─ declaration_date
│   │
│   ├─ deferral_requests
│   │  ├─ id (PK)
│   │  ├─ student_user_id (FK → users)
│   │  ├─ course_id (FK → courses)
│   │  ├─ current_start_date
│   │  ├─ requested_start_date
│   │  ├─ deferral_reason
│   │  ├─ request_date
│   │  ├─ request_status → submitted/under_review/approved/rejected
│   │  ├─ reviewed_by (FK → users)
│   │  └─ notes
│   │
│   ├─ course_registrations
│   │  ├─ id (PK)
│   │  ├─ student_user_id (FK → users)
│   │  ├─ course_id (FK → courses)
│   │  ├─ moodle_enrollment_id (Link to Moodle)
│   │  ├─ registration_date
│   │  └─ status → registered/active/suspended/completed
│   │
│   ├─ support_requests
│   │  ├─ id (PK)
│   │  ├─ student_user_id (FK → users)
│   │  ├─ support_category → Academic/Personal/Financial/Technical
│   │  ├─ request_date
│   │  ├─ description
│   │  ├─ assigned_to (FK → users)
│   │  ├─ status → open/in_progress/resolved/closed
│   │  └─ resolution_notes
│   │
│   ├─ complaints
│   │  ├─ id (PK)
│   │  ├─ complainant_user_id (FK → users)
│   │  ├─ complaint_date
│   │  ├─ complaint_category
│   │  ├─ complaint_details
│   │  ├─ complaint_status → submitted/under_investigation/resolved
│   │  ├─ assigned_to (FK → users)
│   │  └─ resolved_date
│   │
│   ├─ appeals
│   │  ├─ id (PK)
│   │  ├─ complaint_id (FK → complaints, nullable)
│   │  ├─ appellant_user_id (FK → users)
│   │  ├─ appeal_date
│   │  ├─ appeal_reason
│   │  ├─ appeal_against → Grade/Decision/Disciplinary
│   │  ├─ appeal_status → submitted/approved/rejected/upheld
│   │  ├─ reviewed_by (FK → users)
│   │  └─ appeal_outcome
│   │
│   └─ academic_misconduct
│      ├─ id (PK)
│      ├─ student_user_id (FK → users)
│      ├─ course_id (FK → courses)
│      ├─ assessment_id (FK → assessments)
│      ├─ misconduct_date
│      ├─ misconduct_type → Plagiarism/Cheating/Collusion
│      ├─ description
│      ├─ reported_by (FK → users)
│      ├─ reported_date
│      ├─ investigation_status
│      ├─ investigation_findings
│      └─ penalty_applied_date
│
├── COURSE MANAGEMENT LAYER
│   ├─ courses
│   │  ├─ id (PK)
│   │  ├─ course_code (UNIQUE)
│   │  ├─ course_title
│   │  ├─ course_type → HND/Degree/Vocational/Short Course/CPD
│   │  ├─ mode_of_study → Full-time/Part-time/Online/Blended
│   │  ├─ duration_months
│   │  ├─ credit_points
│   │  ├─ awarding_body_id (FK → partners)
│   │  ├─ status → draft/pending/approved/active/inactive
│   │  ├─ created_by (FK → users)
│   │  ├─ created_at
│   │  └─ updated_at
│   │
│   ├─ course_approvals
│   │  ├─ id (PK)
│   │  ├─ course_id (FK → courses)
│   │  ├─ initiator_id (FK → users)
│   │  ├─ approval_stage → submitted/under_review/approved/rejected
│   │  ├─ review_notes
│   │  ├─ reviewed_by (FK → users)
│   │  ├─ reviewed_at
│   │  └─ submitted_at
│   │
│   ├─ course_compliance
│   │  ├─ id (PK)
│   │  ├─ course_id (FK → courses)
│   │  ├─ requirement_name
│   │  ├─ requirement_description
│   │  ├─ compliance_status → compliant/non_compliant
│   │  ├─ evidence_provided
│   │  ├─ reviewed_by (FK → users)
│   │  └─ last_updated
│   │
│   ├─ course_inductions
│   │  ├─ id (PK)
│   │  ├─ course_id (FK → courses)
│   │  ├─ induction_date
│   │  ├─ location_or_link
│   │  ├─ presenter_id (FK → users)
│   │  ├─ attendees_count
│   │  ├─ status → planned/completed/cancelled
│   │  └─ notes
│   │
│   ├─ course_deliveries (Moodle integration)
│   │  ├─ id (PK)
│   │  ├─ course_id (FK → courses)
│   │  ├─ cohort_name
│   │  ├─ start_date
│   │  ├─ end_date
│   │  ├─ faculty_lead_id (FK → users)
│   │  ├─ moodle_course_id (Reference to Moodle)
│   │  └─ status → planned/active/completed
│   │
│   ├─ timetables (Moodle reference)
│   │  ├─ id (PK)
│   │  ├─ delivery_id (FK → course_deliveries)
│   │  ├─ session_date
│   │  ├─ start_time & end_time
│   │  ├─ session_type → Lecture/Tutorial/Seminar
│   │  ├─ location_or_link
│   │  ├─ facilitator_id (FK → users)
│   │  └─ topic & notes
│   │
│   ├─ assessments (Moodle reference)
│   │  ├─ id (PK)
│   │  ├─ delivery_id (FK → course_deliveries)
│   │  ├─ assessment_name
│   │  ├─ assessment_type → Assignment/Quiz/Exam
│   │  ├─ due_date
│   │  ├─ weight_percentage
│   │  ├─ total_marks & passing_mark
│   │  └─ moodle_assignment_id
│   │
│   └─ exam_records (Moodle reference)
│      ├─ id (PK)
│      ├─ assessment_id (FK → assessments)
│      ├─ student_user_id (FK → users)
│      ├─ exam_date
│      ├─ marks_obtained
│      ├─ grade → A/B/C/D/F
│      ├─ feedback
│      ├─ submitted_by (FK → users)
│      └─ submission_date
│
├── PARTNER & COMPLIANCE LAYER
│   ├─ partners
│   │  ├─ id (PK)
│   │  ├─ partner_name
│   │  ├─ partner_type → awarding_body/associate/affiliate
│   │  ├─ contact_email & contact_person
│   │  ├─ phone & website
│   │  ├─ address
│   │  ├─ status → active/inactive/suspended
│   │  └─ created_at
│   │
│   ├─ awarding_body_visits
│   │  ├─ id (PK)
│   │  ├─ partner_id (FK → partners)
│   │  ├─ visit_type → Annual Monitoring/Audit/Review
│   │  ├─ visit_date
│   │  ├─ lead_contact
│   │  ├─ coordinator_id (FK → users)
│   │  ├─ purpose & scope
│   │  ├─ visit_agenda & required_attendees
│   │  ├─ status → planned/in_progress/completed
│   │  ├─ created_at
│   │  └─ updated_at
│   │
│   ├─ pre_visit_checklist
│   │  ├─ id (PK)
│   │  ├─ visit_id (FK → awarding_body_visits)
│   │  ├─ requirement (task description)
│   │  ├─ evidence_required
│   │  ├─ responsible_person_id (FK → users)
│   │  ├─ due_date
│   │  ├─ status → pending/in_progress/completed
│   │  └─ notes
│   │
│   ├─ post_visit_actions
│   │  ├─ id (PK)
│   │  ├─ visit_id (FK → awarding_body_visits)
│   │  ├─ action_item
│   │  ├─ priority → high/medium/low
│   │  ├─ responsible_person_id (FK → users)
│   │  ├─ due_date
│   │  ├─ status → open/in_progress/completed
│   │  └─ evidence_of_completion
│   │
│   ├─ subscriptions
│   │  ├─ id (PK)
│   │  ├─ partner_id (FK → partners)
│   │  ├─ subscription_type
│   │  ├─ start_date & end_date
│   │  ├─ cost (DECIMAL)
│   │  ├─ status → active/expired/suspended
│   │  └─ renewal_date
│   │
│   ├─ governance_records
│   │  ├─ id (PK)
│   │  ├─ record_type → Policy/Procedure/Minutes/Decision
│   │  ├─ title
│   │  ├─ description
│   │  ├─ effective_date
│   │  ├─ review_date
│   │  ├─ owner_id (FK → users)
│   │  ├─ status → draft/approved/active/archived
│   │  └─ version
│   │
│   ├─ risk_register
│   │  ├─ id (PK)
│   │  ├─ risk_description
│   │  ├─ risk_category
│   │  ├─ impact_level → low/medium/high/critical
│   │  ├─ probability → low/medium/high
│   │  ├─ risk_score (calculated)
│   │  ├─ mitigation_strategy
│   │  ├─ owner_id (FK → users)
│   │  ├─ status → open/mitigating/resolved
│   │  └─ created_at
│   │
│   └─ compliances
│      ├─ id (PK)
│      ├─ compliance_type → GDPR/QA/Accreditation
│      ├─ requirement
│      ├─ deadline
│      ├─ owner_id (FK → users)
│      ├─ status → not_started/in_progress/completed
│      ├─ evidence_file
│      ├─ reviewed_by (FK → users)
│      └─ review_date
│
├── FACULTY & HR LAYER
│   ├─ faculty_profiles
│   │  ├─ id (PK)
│   │  ├─ user_id (FK → users, UNIQUE)
│   │  ├─ employee_id (UNIQUE)
│   │  ├─ department
│   │  ├─ specialization
│   │  ├─ qualifications
│   │  ├─ experience_years
│   │  ├─ hire_date
│   │  ├─ status → active/inactive/on_leave
│   │  └─ created_at
│   │
│   ├─ faculty_applications
│   │  ├─ id (PK)
│   │  ├─ applicant_user_id (FK → users)
│   │  ├─ position
│   │  ├─ department
│   │  ├─ specialization
│   │  ├─ qualifications
│   │  ├─ experience
│   │  ├─ application_date
│   │  ├─ application_status → draft/submitted/screening/shortlisted
│   │  └─ [...]
│   │
│   ├─ faculty_selections
│   │  ├─ id (PK)
│   │  ├─ application_id (FK → faculty_applications)
│   │  ├─ selected_date
│   │  ├─ selected_by (FK → users)
│   │  ├─ interview_date
│   │  ├─ interview_feedback
│   │  └─ selection_status
│   │
│   ├─ faculty_onboarding
│   │  ├─ id (PK)
│   │  ├─ faculty_user_id (FK → users)
│   │  ├─ onboarding_date
│   │  ├─ employee_handbook_provided
│   │  ├─ it_setup_completed
│   │  ├─ office_access_granted
│   │  ├─ course_assignment_completed
│   │  ├─ mentor_assigned_to (FK → users)
│   │  └─ orientation_completed
│   │
│   └─ hr_records
│      ├─ id (PK)
│      ├─ employee_user_id (FK → users)
│      ├─ record_type → leave/payroll/promotion/disciplinary
│      ├─ record_date
│      ├─ details
│      ├─ processed_by (FK → users)
│      └─ processed_at
│
├── ERP LAYER
│   ├─ finance_transactions
│   │  ├─ id (PK)
│   │  ├─ transaction_date
│   │  ├─ transaction_type → fee_payment/refund/expense
│   │  ├─ student_user_id (FK → users, nullable)
│   │  ├─ amount (DECIMAL)
│   │  ├─ description
│   │  ├─ status → pending/completed/failed
│   │  ├─ recorded_by (FK → users)
│   │  └─ recorded_at
│   │
│   └─ suppliers
│      ├─ id (PK)
│      ├─ supplier_name
│      ├─ supplier_type
│      ├─ contact_email & contact_person
│      ├─ phone & payment_terms
│      ├─ status → active/inactive/blacklisted
│      └─ created_at
│
└── SUPPORT LAYER
    ├─ documents
    │  ├─ id (PK)
    │  ├─ document_type → Application/Certificate/Report
    │  ├─ uploaded_by (FK → users)
    │  ├─ related_form & related_form_id
    │  ├─ file_path
    │  ├─ file_size
    │  └─ uploaded_at
    │
    └─ audit_log (Compliance tracking)
       ├─ id (PK)
       ├─ user_id (FK → users)
       ├─ action
       ├─ table_name & record_id
       ├─ old_value & new_value
       └─ timestamp
```

---

## 🔐 ROLE-BASED ACCESS MATRIX

### **What Each Role Can Do:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SUPER ADMIN (Unrestricted Access)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✅ User Management                 │ Create/Edit/Delete users & assign roles  │
│ ✅ System Configuration            │ Manage all settings                      │
│ ✅ ALL Modules                     │ Full access to every module              │
│ ✅ Reports & Analytics             │ View all reports                         │
│ ✅ Audit Logs                      │ View all activity logs                   │
│ ✅ Governance & Compliance         │ Manage policies & procedures              │
│ ✅ Finance Management              │ View/create transactions                 │
│ ✅ HR & Supplier Management        │ Full HR operations                       │
│ ✅ Moodle Integration              │ Manage SSO & Moodle settings             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                   LMS MANAGER (Learning & Assessments)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ READ      │ Courses, Students, Course Deliveries                            │
│ CREATE    │ Timetables, Assessments, Assignments                           │
│ UPDATE    │ Schedule changes, Assessment details                            │
│ DELETE    │ Draft assessments only                                          │
│ APPROVE   │ Cannot approve, can only manage                                │
│ ✅ Access│ Moodle interface → Manage course delivery    │
│           │ View student grades from assessments        │
│           │ Create course schedules & timetables        │
│           │ Set up assignments & exams                 │
│           │ View student progress & grades             │
│ ❌ Cannot │ Create new courses (Admin only)             │
│           │ Modify student records                      │
│           │ Access finance/HR modules                   │
│           │ Manage partners/compliance                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│              PARTNERS & ASSOCIATES MANAGER (Awarding Bodies)                │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✅ Partners Module    │ Register new partners & awarding bodies             │
│ ✅ Visits & Inspections
│                       │ Schedule & manage awarding body visits              │
│                       │ Pre-visit checklist (create tasks & track)          │
│                       │ Post-visit actions (record & track outcomes)        │
│ ✅ Subscriptions      │ Manage partnership subscriptions & renewals         │
│ ✅ Reviews & Feedback │ Document visit outcomes                            │
│ ✅ Risk Management    │ Log risks identified during inspections            │
│ ❌ Cannot            │ Create new courses                                   │
│                      │ Manage student records                              │
│                      │ Access finance/HR modules                           │
│                      │ Approve admissions                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│              ADMISSIONS OFFICER (Student Admissions Process)                │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✅ Student Applications
│                       │ View all pending applications                       │
│                       │ Request additional documents                        │
│                       │ Complete Application Review form                    │
│                       │ Make academic suitability assessment                │
│ ✅ Admissions Decisions
│                       │ Approve/reject applications                        │
│                       │ Send offer letters                                  │
│                       │ Track acceptance/decline responses                  │
│ ✅ Student Onboarding │ Verify documents received                          │
│                       │ Complete orientation checklist                      │
│                       │ Confirm student ready for Moodle                   │
│ ✅ Deferral Requests  │ Review deferral requests                           │
│                       │ Approve/reject deferrals                            │
│ ✅ Student Records    │ View student profiles (read-only)                  │
│ ❌ Cannot            │ Modify course records                               │
│                      │ Access finance/HR/governance modules                │
│                      │ Approve/reject at super admin level                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│           FACULTY & HR MANAGER (Faculty & HR Operations)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✅ Faculty Management │ Register new faculty                               │
│                       │ Track faculty applications & selection process      │
│                       │ Complete faculty onboarding                         │
│ ✅ HR Records        │ Create/update leave, payroll, transfers             │
│                       │ Process promotions                                  │
│                       │ Manage disciplinary records                         │
│ ✅ Supplier Management
│                       │ Register suppliers/vendors                          │
│                       │ Manage payment terms                                │
│                       │ Track supplier status                               │
│ ✅ Course Assignment  │ Assign faculty to courses                          │
│ ✅ Payroll & Benefits │ Manage compensation records                        │
│ ❌ Cannot            │ Create new users (Super Admin only)                │
│                      │ Manage student records (unless assigned)            │
│                      │ Access finance transactions                         │
│                      │ Approve at super admin level                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 DATA FLOW DIAGRAM (RAOS Model)

### **REQUIREMENTS → ARCHITECTURE → OPERATIONS → STRUCTURE**

```
BUSINESS REQUIREMENTS
│
├─ Requirement 1: Students apply for courses
│  └─► ARCHITECTURE: student_applications table
│      └─► OPERATIONS: Application → Review → Admission → Onboarding → Moodle
│          └─► STRUCTURE: 
│              ├─ users (student profile)
│              ├─ student_profiles (extended info)
│              ├─ student_applications (form data)
│              ├─ application_reviews (assessment)
│              ├─ admissions (decision)
│              ├─ student_onboarding (orientation)
│              └─ course_registrations (Moodle link)
│
├─ Requirement 2: Awarding bodies conduct inspections
│  └─► ARCHITECTURE: awarding_body_visits, pre_visit_checklist, post_visit_actions
│      └─► OPERATIONS: Visit Planning → Preparation → Execution → Follow-up
│          └─► STRUCTURE:
│              ├─ partners (awarding body)
│              ├─ awarding_body_visits (visit record)
│              ├─ pre_visit_checklist (preparation tasks)
│              ├─ post_visit_actions (action items)
│              └─ risk_register (identified risks)
│
├─ Requirement 3: Courses are created & approved
│  └─► ARCHITECTURE: courses, course_approvals, course_compliance
│      └─► OPERATIONS: Proposal → Compliance → Approval → Delivery
│          └─► STRUCTURE:
│              ├─ courses (catalog entry)
│              ├─ course_approvals (approval workflow)
│              ├─ course_compliance (compliance checks)
│              ├─ course_inductions (new cohort inductions)
│              └─ course_deliveries (active runs)
│
├─ Requirement 4: Faculty are hired & onboarded
│  └─► ARCHITECTURE: faculty_applications, faculty_selections, faculty_onboarding
│      └─► OPERATIONS: Application → Screening → Selection → Onboarding
│          └─► STRUCTURE:
│              ├─ users (faculty user account)
│              ├─ faculty_profiles (credentials & info)
│              ├─ faculty_applications (job application)
│              ├─ faculty_selections (selection process)
│              └─ faculty_onboarding (orientation)
│
├─ Requirement 5: Learning happens in Moodle
│  └─► ARCHITECTURE: course_deliveries, timetables, assessments, exam_records
│      └─► OPERATIONS: Enroll → Deliver → Assess → Grade → Archive
│          └─► STRUCTURE:
│              ├─ course_registrations (Moodle enrollment)
│              ├─ course_deliveries (course running)
│              ├─ timetables (schedules)
│              ├─ assessments (assignments & exams)
│              └─ exam_records (grades)
│
├─ Requirement 6: Students have support services
│  └─► ARCHITECTURE: support_requests, complaints, appeals, academic_misconduct
│      └─► OPERATIONS: Request → Assignment → Resolution → Closure
│          └─► STRUCTURE:
│              ├─ support_requests (support form)
│              ├─ complaints (complaint registry)
│              ├─ appeals (appeals process)
│              └─ academic_misconduct (misconduct tracking)
│
└─ Requirement 7: Governance & Compliance Managed
   └─► ARCHITECTURE: governance_records, risk_register, compliances
       └─► OPERATIONS: Policy → Implementation → Monitoring → Review
           └─► STRUCTURE:
               ├─ governance_records (policy documents)
               ├─ risk_register (risk tracking)
               └─ compliances (compliance checklist)
```

---

## 🌐 SYSTEM INTEGRATION POINTS

### **How Systems Connect:**

```
                    SCL FRONTEND
                   (React.js)
                        ↓
                   NGINX Router
            (sclsandbox.xyz, lms.sclsandbox.xyz)
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    Frontend API     Backend API    Moodle LMS
    (port 3000)   (port 4000)     (port 8080)
        ↓               ↓               ↓
   ┌─────────────────────────┬──────────────────┐
   │  SCL SYSTEM             │  MOODLE          │
   │  (MySQL DB)             │  (MariaDB)       │
   │                         │                  │
   │ • users                 │ • mdl_user       │
   │ • roles                 │ • mdl_course     │
   │ • students              │ • mdl_enrol      │
   │ • courses               │ • mdl_grades     │
   │ • applications          │ • mdl_assign     │
   │ • admissions            │ • mdl_quiz       │
   │ • faculty               │ • mdl_modules    │
   │ • governance            │                  │
   │ • finance               │  [Moodle data]   │
   │ • sso_tokens ◄─────────────────┐         │
   │   (SSO Bridge)                  │         │
   └─────────────────────────────────┼──────────┘
                                     │
                    SSO Token Exchange
                    (token verification)
```

### **API Endpoints Structure:**

```
BACKEND API (Node.js @ port 4000)
│
├─ /api/auth/*
│  ├─ POST /api/auth/login
│  ├─ POST /api/auth/logout
│  ├─ GET /api/auth/profile
│  └─ POST /api/auth/refresh-token
│
├─ /api/sso/*
│  ├─ POST /api/sso/generate (create SSO token for Moodle)
│  ├─ POST /api/sso/verify (Moodle verifies token)
│  └─ GET /api/sso/status
│
├─ /api/students/*
│  ├─ GET /api/students (list students)
│  ├─ POST /api/students (create new student)
│  ├─ PATCH /api/students/:id (update student)
│  ├─ GET /api/students/:id/applications
│  ├─ POST /api/students/:id/applications
│  ├─ GET /api/students/:id/onboarding
│  └─ [50+ more endpoints]
│
├─ /api/courses/*
│  ├─ GET /api/courses (list courses)
│  ├─ POST /api/courses (create)
│  ├─ GET /api/courses/:id/approvals
│  ├─ POST /api/courses/:id/approvals
│  ├─ GET /api/courses/:id/compliance
│  ├─ GET /api/courses/:id/deliveries
│  └─ [...]
│
├─ /api/faculty/*
│  ├─ GET /api/faculty (list faculty)
│  ├─ POST /api/faculty/applications
│  ├─ GET /api/faculty/:id/applications
│  ├─ POST /api/faculty/:id/onboarding
│  └─ [...]
│
├─ /api/partners/*
│  ├─ GET /api/partners (list partners)
│  ├─ POST /api/partners (register new)
│  ├─ GET /api/partners/:id/visits
│  ├─ POST /api/partners/:id/visits
│  ├─ POST /api/partners/:id/visits/:vid/checklist
│  ├─ POST /api/partners/:id/subscriptions
│  └─ [...]
│
├─ /api/admissions/*
│  ├─ GET /api/admissions/applications
│  ├─ POST /api/admissions/:appid/review
│  ├─ POST /api/admissions/:appid/decision
│  ├─ GET /api/admissions/:studentid/onboarding
│  └─ [...]
│
├─ /api/support/*
│  ├─ POST /api/support/requests (submit request)
│  ├─ GET /api/support/requests/:studentid
│  ├─ POST /api/support/requests/:id/resolve
│  ├─ POST /api/complaints (submit complaint)
│  ├─ POST /api/appeals (submit appeal)
│  └─ [...]
│
├─ /api/reports/*
│  ├─ GET /api/reports/students
│  ├─ GET /api/reports/admissions
│  ├─ GET /api/reports/courses
│  ├─ GET /api/reports/finance
│  └─ [...]
│
└─ /api/governance/*
   ├─ GET /api/governance/policies
   ├─ GET /api/governance/risks
   ├─ POST /api/governance/risks
   └─ [...]
```

---

## 📈 IMPLEMENTATION TIMELINE

```
TASK 1: Infrastructure (✅ COMPLETE)
├─ Server setup          │ Ubuntu 20.04 Linux          │ ✅
├─ Docker/Compose        │ Containerization            │ ✅
├─ GitHub setup          │ Repository & workflow       │ ✅
├─ SSH access            │ Passwordless auth           │ ✅
└─ Time: 4 hours total

TASK 2: Moodle & SSO (✅ COMPLETE)
├─ Moodle container      │ Bitnami Moodle 4.3         │ ✅
├─ Database setup        │ MariaDB + MySQL            │ ✅
├─ SSO plugin            │ Custom plugin created      │ ✅
├─ NGINX config          │ Domain routing             │ ✅
└─ Time: 6 hours total

TASK 3: Database Schema (→ NEXT - 2-3 hours)
├─ Create all 40+ tables
├─ Set up relationships
├─ Create indexes
├─ Run migrations
└─ Deploy to production

TASK 4: Backend API (1-2 days)
├─ Create 50+ API endpoints
├─ Database models
├─ Validation & middleware
└─ Testing

TASK 5: Frontend Forms (2-3 days)
├─ Build 40+ form components
├─ File upload handling
├─ Form validation
└─ Integration with API

TASK 6: Dashboard & Navigation (1 day)
├─ Update dashboard
├─ Module navigation
├─ Role-based filtering
└─ User experience improvements

TASK 7: Testing & Deployment (1 day)
├─ Unit tests
├─ Integration tests
├─ Production deployment
└─ Smoke tests

TOTAL: ~1 week to production
```

---

## ✅ SUCCESS CRITERIA

After complete implementation:

✅ **Authentication**
- Users can login with email/password
- Passwordless SSO to Moodle works
- Role-based dashboard displays correct modules

✅ **Student Workflow**
- Application submission → Review → Admission → Onboarding → Moodle enrollment
- All data persisted in database
- No manual steps required

✅ **Compliance & Governance**
- Audit trail tracks all changes
- Risk register maintained
- Compliance checklist managed

✅ **Multi-User Support**
- 5 different roles with proper access control
- No unauthorized data access
- Reports available per role

✅ **Data Integrity**
- Foreign key constraints enforced
- No orphaned records
- Backup procedures in place

✅ **Performance**
- API responses < 500ms
- Form submissions < 1 second
- Database queries optimized

---

## 📞 PRESENTATION NOTES

**For stakeholders:**

1. **Infrastructure**: Production-grade Linux server with Docker containers
2. **Database**: Comprehensive 40+ table schema covering all institutional needs
3. **Roles**: 5 distinct roles with granular permission control
4. **Integration**: Seamless SSO between SCL system and Moodle LMS
5. **Workflow**: Automated processes reduce manual work (e.g., auto-enrollment)
6. **Compliance**: Audit trail & governance tracking built-in
7. **Scalability**: Architecture supports growth (multiple institutions, courses, etc)

---

**Ready for presentation!** 🎯
