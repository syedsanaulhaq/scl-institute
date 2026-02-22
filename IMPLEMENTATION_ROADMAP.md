# 🚀 SCL-Institute Complete Implementation Roadmap

## ✅ COMPLETED TASKS (Task 1 & 2)

### **TASK 1: Server & Infrastructure Setup** ✅
- ✅ Ubuntu Linux Server (185.211.6.60) provisioned
- ✅ Docker & Docker Compose installed (v29.1.3, v5.0.1)
- ✅ MySQL 8.0 container (scli-mysql-prod)
- ✅ NGINX reverse proxy (scli-nginx-prod) on ports 80/443
- ✅ SSH key-based authentication configured (passwordless access)
- ✅ GitHub repository setup (syedsanaulhaq/scl-institute)
- ✅ Git workflow: main + develop branches
- ✅ Environment variables (.env.production) configured

**Current Infrastructure:**
```
Internet (80/443)
    ↓
NGINX (reverse proxy: sclsandbox.xyz, lms.sclsandbox.xyz)
    ↓
├─ scli-frontend-prod (3000, React app)
├─ scli-backend-prod (4000, Node.js)
├─ scli-moodle-prod (8080, Moodle LMS)
├─ scli-mysql-prod (3306, MySQL database)
└─ scli-moodle-db-prod (3306, Moodle MariaDB)

Network: scl-network-prod (Docker bridge)
```

---

### **TASK 2: Moodle Installation & SSO Integration** ✅
- ✅ Moodle 4.3 container deployed (bitnamilegacy/moodle:4.3)
- ✅ Moodle database (MariaDB) configured
- ✅ SSO plugin created (/moodle-scripts/local/sclsso/)
  - ✅ login.php - Handles token verification
  - ✅ lib.php - Plugin definition
  - ✅ version.php - Version control
- ✅ SSO plugin copied to running Moodle container
- ✅ Backend SSO endpoints:
  - `POST /api/sso/generate` - Creates token
  - `POST /api/sso/verify` - Verifies token + creates/updates Moodle user
- ✅ NGINX domain routing configured:
  - `sclsandbox.xyz` → Frontend (React)
  - `lms.sclsandbox.xyz` → Moodle (8080)
  - `/api/*` → Backend (4000)

**Current SSO Flow:**
```
1. User logs in to SCL Frontend
2. User clicks "LMS" card
3. Frontend calls POST /api/sso/generate with email
4. Backend creates UUID token + stores in MySQL
5. Backend redirects to http://lms.sclsandbox.xyz/local/sclsso/login.php?token=UUID
6. Moodle SSO plugin verifies token with backend (/api/sso/verify)
7. Moodle auto-creates/updates user
8. User auto-logged into Moodle dashboard
```

---

## 🎯 SYSTEM ARCHITECTURE OVERVIEW

### **Three-Tier System Architecture:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SCL-INSTITUTE MAIN SYSTEM                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LAYER 1: CORE ADMIN                                              │
│  ├─ Set-up Roles & Admin (Super Admin Management)                 │
│  │                                                                 │
│  LAYER 2: PARTNERS & ASSOCIATES MANAGEMENT                        │
│  ├─ Awarding Body / Partner Registration                          │
│  ├─ Awarding Body Visits & Inspections                            │
│  ├─ Subscriptions & Membership Management                         │
│  │                                                                 │
│  LAYER 3: COURSE OFFERINGS & PROGRAM CATALOG                      │
│  ├─ Course Approval Initiations                                   │
│  ├─ Course Compliance & Delivery Requirements                     │
│  ├─ Course Inductions                                             │
│  │                                                                 │
│  LAYER 4: STUDENTS (SCL Side)                                     │
│  ├─ Student Application Form                                      │
│  ├─ Application Review                                            │
│  ├─ Admissions Decision                                           │
│  ├─ Student Onboarding (Orientation)                              │
│  ├─ Deferral Requests                                             │
│  │                                                                 │
│  LAYER 5: ACADEMIC RESOURCE (Faculty & HR)                        │
│  ├─ Faculty Application Form                                      │
│  ├─ Faculty Selection Process                                     │
│  ├─ Faculty Onboarding                                            │
│  │                                                                 │
│  LAYER 6: SUPPORT & COMPLIANCE                                    │
│  ├─ Student Support Requests                                      │
│  ├─ Complaints & Grievances                                       │
│  ├─ Academic Misconduct Reports                                   │
│  │                                                                 │
│  LAYER 7: ERP (Enterprise Resource Planning)                      │
│  ├─ Finance Management                                            │
│  ├─ HR & Admin Records                                            │
│  ├─ Suppliers & Vendors                                           │
│  │                                                                 │
│  LAYER 8: GOVERNANCE & COMPLIANCE                                 │
│  ├─ Governance Records                                            │
│  ├─ Risk Management Register                                      │
│  ├─ Compliance Tracking                                           │
│  │                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                ↓ SSO Link ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      MOODLE LMS (Sub-System)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LAYER 6: LEARNING MANAGEMENT (Moodle Side)                       │
│  ├─ Course Delivery & Management                                  │
│  ├─ Schedules & Timetable                                         │
│  ├─ Assignments & Assessments                                     │
│  ├─ Examinations & Grading                                        │
│  ├─ Student Progress Tracking                                     │
│  │                                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 ROLE-BASED ACCESS & WORKFLOWS

### **5 Core Roles:**

```
┌──────────────────────────────────────────────────────────┐
│              ROLE-BASED ACCESS MATRIX                    │
├──────────────────┬─────────────────────────────────────┤
│ SUPER ADMIN      │ Full system access (ALL modules)   │
├──────────────────┼─────────────────────────────────────┤
│ LMS MANAGER      │ • Course Delivery                   │
│                  │ • Schedules & Timetable             │
│                  │ • Assessments & Exams               │
│                  │ • Grading                           │
│                  │ • Student Progress                  │
├──────────────────┼─────────────────────────────────────┤
│ PARTNERS MANAGER │ • Partner Registration              │
│                  │ • Awarding Body Visits              │
│                  │ • Inspections & Reviews             │
│                  │ • Subscriptions Management          │
├──────────────────┼─────────────────────────────────────┤
│ ADMISSIONS OFFICER
│                  │ • Student Applications              │
│                  │ • Application Review                │
│                  │ • Admissions Decisions              │
│                  │ • Student Onboarding                │
│                  │ • Deferral Requests                 │
├──────────────────┼─────────────────────────────────────┤
│ FACULTY & HR MGR │ • Faculty Applications              │
│                  │ • Faculty Selection                 │
│                  │ • Faculty Onboarding                │
│                  │ • HR Records                        │
│                  │ • Supplier Management               │
└──────────────────┴─────────────────────────────────────┘
```

---

## 📊 DATABASE STRUCTURE EVOLUTION

### **CURRENT DATABASE (Production):**
```
MySQL (scli-mysql-prod)
├─ sso_tokens          (simple: token, email, role)
├─ users               (basic: id, email, password, name)
└─ [Empty: ready for expansion]
```

### **NEXT PHASE DATABASE (To be created):**
```
MySQL (scli-mysql-prod) - Extended
├─ CORE LAYER
│  ├─ users                    (Full user profiles)
│  ├─ roles                    (5 core roles)
│  ├─ user_roles              (User→Role mapping)
│  ├─ role_permissions        (Role→Module permissions)
│  ├─ sso_tokens              (SSO bridge to Moodle)
│  └─ audit_log               (Compliance tracking)
│
├─ PARTNERS LAYER
│  ├─ partners                 (Partner/Awarding Body registry)
│  ├─ awarding_body_visits    (Inspection management)
│  ├─ pre_visit_checklist     (Pre-visit tasks)
│  ├─ post_visit_actions      (Post-visit follow-ups)
│  └─ subscriptions           (Membership management)
│
├─ COURSES LAYER
│  ├─ courses                  (Course catalog)
│  ├─ course_approvals        (Approval workflow)
│  ├─ course_compliance       (Compliance tracking)
│  └─ course_inductions       (New cohort inductions)
│
├─ STUDENTS LAYER
│  ├─ student_profiles        (Student personal info)
│  ├─ student_applications    (Application forms)
│  ├─ application_reviews     (Review workflow)
│  ├─ admissions              (Admission decisions)
│  ├─ student_onboarding      (Orientation checklist)
│  ├─ deferral_requests       (Deferral management)
│  ├─ course_registrations    (Moodle enrollment link)
│  ├─ support_requests        (Student support)
│  ├─ complaints              (Complaints registry)
│  ├─ appeals                 (Appeals management)
│  └─ academic_misconduct     (Misconduct tracking)
│
├─ FACULTY LAYER
│  ├─ faculty_profiles        (Faculty personal info)
│  ├─ faculty_applications    (Job applications)
│  ├─ faculty_selections      (Selection process)
│  └─ faculty_onboarding      (Onboarding checklist)
│
├─ LEARNING LAYER (Moodle Integration)
│  ├─ course_deliveries       (Active course runs)
│  ├─ timetables              (Schedule reference)
│  ├─ assessments             (Assessment reference)
│  ├─ exam_records            (Grades reference)
│  └─ course_registrations    (Enrollment link)
│
├─ ERP LAYER
│  ├─ finance_transactions    (Financial records)
│  ├─ hr_records              (HR operations)
│  └─ suppliers               (Vendor management)
│
├─ GOVERNANCE LAYER
│  ├─ governance_records      (Policies, procedures)
│  ├─ risk_register           (Risk tracking)
│  └─ compliances            (Compliance checklist)
│
└─ SUPPORT LAYER
   ├─ documents               (File storage reference)
   └─ audit_log              (Change tracking)
```

---

## 🛠️ STEP-BY-STEP IMPLEMENTATION PLAN

### **TASK 3: Database Schema Creation** (Next)
**Time: 2-3 hours**

1. Create SQL migration file with all 40+ tables
2. Set up proper foreign key relationships
3. Create indexes for performance
4. Run migrations on production database
5. Verify schema integrity

**Deliverables:**
- ✅ `database_migration.sql` (all CREATE TABLE statements)
- ✅ Updated database with proper structure

---

### **TASK 4: Backend API Development**
**Time: 1-2 days**

1. Create Express routes for each module:
   ```
   /api/partners/*              (Partner management)
   /api/courses/*               (Course management)
   /api/students/*              (Student management)
   /api/faculty/*               (Faculty management)
   /api/admissions/*            (Admissions workflow)
   /api/support/*               (Support requests)
   /api/finance/*               (Finance records)
   /api/governance/*            (Governance)
   /api/reports/*               (Analytics & reports)
   ```

2. Create database models (using MySQL connector)
3. Implement CRUD operations for each form
4. Add role-based middleware (check user permissions)
5. Add validation & error handling
6. Create audit logging

**Deliverables:**
- ✅ 50+ API endpoints
- ✅ Database models
- ✅ Middleware for auth & permissions
- ✅ Test endpoints

---

### **TASK 5: Frontend Form Components**
**Time: 2-3 days**

1. Create reusable form components:
   ```
   components/
   ├─ forms/
   │  ├─ PartnerForm.jsx
   │  ├─ AWBVisitForm.jsx
   │  ├─ CourseApprovalForm.jsx
   │  ├─ StudentApplicationForm.jsx
   │  ├─ AdmissionForm.jsx
   │  ├─ FacultyApplicationForm.jsx
   │  ├─ StudentOnboardingForm.jsx
   │  ├─ SupportRequestForm.jsx
   │  ├─ ComplaintForm.jsx
   │  └─ [10+ more forms]
   │
   └─ modules/
      ├─ PartnersModule.jsx
      ├─ CoursesModule.jsx
      ├─ StudentsModule.jsx
      ├─ FacultyModule.jsx
      ├─ SupportModule.jsx
      └─ GovernanceModule.jsx
   ```

2. Implement form validation
3. Add file upload for documents
4. Create list/view components for each form type
5. Add status workflows (buttons for transitions)
6. Add search & filter capabilities

**Deliverables:**
- ✅ 40+ form components
- ✅ Validation logic
- ✅ File handling

---

### **TASK 6: Dashboard & Navigation**
**Time: 1 day**

1. Update Dashboard.jsx with role-based modules
2. Create module card components
3. Update Sidebar with all module links
4. Add breadcrumb navigation
5. Create module listing pages
6. Add quick stats/KPIs

**Current Dashboard (Hardcoded):**
```jsx
const modules = [
    { id: 'partners', title: 'Partner Management', roles: ['admin', 'partners_manager'] },
    { id: 'courses', title: 'Course Offerings', roles: ['admin', 'faculty'] },
    // ... etc
];
```

**Updated Dashboard (Dynamic + Database):**
```jsx
// Fetch user's role from database
// Filter modules based on role → role_permissions table
// Show only authorized modules
```

**Deliverables:**
- ✅ Updated Dashboard component
- ✅ Module navigation
- ✅ Role filtering

---

### **TASK 7: Testing & Deployment**
**Time: 1 day**

1. Unit tests for API endpoints
2. Form validation tests
3. Role-based access tests
4. End-to-end workflow tests
5. Database migration on production
6. Deploy to production server
7. Smoke tests

---

## 📈 WORKFLOW DIAGRAMS

### **Complete Student Workflow:**
```
┌─────────────────┐
│ Application     │  Student submits application + documents
├─────────────────┤
│ Under Review    │  Admissions officer reviews documents
├─────────────────┤
│ Interview       │  (Optional) Interview stage
├─────────────────┤
│ Admission       │  Offer letter sent
│ Decision        │  Student accepts/declines
├─────────────────┤
│ Onboarding      │  Orientation orientation + handbook review
├─────────────────┤
│ Moodle          │  → Auto-enroll in LMS
│ Registration    │  → Course delivery begins
├─────────────────┤
│ Active Student  │  Full course participation
├─────────────────┤
│ Assessment &    │  → Exams managed in Moodle
│ Grading         │  → Grades recorded
├─────────────────┤
│ Completion      │  Graduation/Certificate awarded
└─────────────────┘
```

### **Super Admin Role (All Access):**
```
Super Admin Dashboard
├─ User Management (Create/Edit/Delete users & roles)
├─ System Settings & Configuration
├─ All Module Access:
│  ├─ Partners Management
│  ├─ Course Management
│  ├─ Student Management
│  ├─ Faculty Management
│  ├─ Support Management
│  ├─ Finance Management
│  ├─ Governance & Risk
│  └─ Reports & Analytics
└─ Audit Logs & Compliance
```

### **Admissions Officer Role:**
```
Admissions Officer Dashboard
├─ Student Applications (List/Review/Decide)
├─ Admissions Workflow
│  ├─ View applications
│  ├─ Request documents
│  ├─ Send admission offer
│  └─ Track acceptance
├─ Student Onboarding
│  ├─ Verify documents received
│  ├─ Conduct orientation
│  └─ Confirm ready for Moodle
├─ Deferral Requests
│  ├─ Review deferral reasons
│  └─ Approve/Reject
└─ Reports
   └─ Application stats
```

---

## 📋 DATABASE MIGRATION SCRIPT (TASK 3)

**File:** `scripts/001_create_schema.sql`

Will contain:
- User management (40+ table creation statements)
- Foreign key constraints
- Indexes for performance
- Default roles insertion
- Sample audit log setup

---

## 🔄 DATA FLOW AFTER IMPLEMENTATION

```
        SCL FRONTEND
            ↓ (User logs in)
        Backend /api/login
            ↓ (Validates credentials against users table)
        Dashboard
            ↓ (Fetches user_roles & role_permissions from DB)
        Role-Based Modules
            ↓ (User selects a module, e.g., "Student Applications")
        Module Form Component
            ↓ (Form loads data from API)
        API /api/students/applications
            ↓ (Backend queries student_applications table)
        Database Query
            ↓ (Returns filtered results based on user role)
        Frontend displays list
            ↓ (User clicks to edit/review/approve)
        Form Submission
            ↓ (PATCH /api/students/applications/123)
        Database Update
            ↓ (Updates record + logs action in audit_log)
        Status Updated
            ↓ (If complete, triggers Moodle enrollment)
        Moodle SSO
            ↓ (User auto-enrolled in course)
        Learning Dashboard
```

---

## 🎯 SUCCESS METRICS (Post-Implementation)

✅ Users can log in once, access all modules via role
✅ All 12 forms functional with data persistence
✅ Role-based access working (no unauthorized access)
✅ SSO to Moodle seamless after onboarding
✅ Audit trail tracking all changes
✅ Reports generating correctly
✅ Zero data loss or inconsistency
✅ Sub-1 second form submission

---

## 📅 TIMELINE SUMMARY

| Task | Status | Duration | Cumulative |
|------|--------|----------|-----------|
| Task 1: Infrastructure | ✅ Done | 4 hours | 4 hrs |
| Task 2: Moodle + SSO | ✅ Done | 6 hours | 10 hrs |
| **Task 3: Database Schema** | **→ Next** | **2-3 hrs** | **12-13 hrs** |
| **Task 4: Backend API** | Pending | **1-2 days** | **1.5-2 days** |
| **Task 5: Frontend Forms** | Pending | **2-3 days** | **3.5-5 days** |
| **Task 6: Dashboard** | Pending | **1 day** | **4.5-6 days** |
| **Task 7: Testing & Deploy** | Pending | **1 day** | **5.5-7 days** |

**Total: ~1 week to full system completion**

---

## 🚀 READY TO START TASK 3?

**Next Action:** Create the SQL migration file with all database tables.

Shall I:
1. ✅ Create `scripts/001_create_schema.sql` (all tables)
2. ✅ Create connection setup for running migrations
3. ✅ Deploy to production database

**Proceed?** 🎯
