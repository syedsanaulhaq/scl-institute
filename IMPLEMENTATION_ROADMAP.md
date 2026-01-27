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

### **TASK 2: Module 1 - Student Management** (Weeks 2-3)
**Time: 2 weeks (Feb 2-15)**

**What we're building:**
- Student profiles, applications, admissions, onboarding
- Database: 8 tables
- API: 20+ endpoints for student workflows
- Frontend: 11 form components

**Deliverables:**
- ✅ Database tables created (student_profiles, student_applications, admissions, etc.)
- ✅ API endpoints for student management
- ✅ Form components (ApplicationForm, AdmissionForm, OnboardingForm, etc.)
- ✅ Integration tests passing

---

### **TASK 3: Module 2 - Course Management** (Weeks 4-5)
**Time: 2 weeks (Feb 16-Mar 1)**

**What we're building:**
- Course creation, approval, compliance, delivery
- Database: 6 tables
- API: 18+ endpoints for course workflows
- Frontend: 9 form components

**Deliverables:**
- ✅ Database tables (courses, course_approvals, course_compliance, etc.)
- ✅ API endpoints for course workflows
- ✅ Form components (CourseForm, ApprovalForm, ComplianceForm, etc.)
- ✅ Integration tests passing

---

### **TASK 4: Module 3 - Faculty & HR Management** (Weeks 6-7)
**Time: 2 weeks (Mar 2-15)**

**What we're building:**
- Faculty recruitment, hiring, onboarding, HR records
- Database: 6 tables
- API: 18+ endpoints for faculty & HR
- Frontend: 8 form components

**Deliverables:**
- ✅ Database tables (faculty_profiles, faculty_applications, faculty_selections, etc.)
- ✅ API endpoints for faculty & HR workflows
- ✅ Form components (ApplicationForm, SelectionForm, OnboardingForm, etc.)
- ✅ Integration tests passing

---

### **TASK 5: Module 4 - Partner & Awarding Body Management** (Weeks 8-9)
**Time: 2 weeks (Mar 16-29)**

**What we're building:**
- Partner registration, inspection visits, compliance, risk management
- Database: 6 tables
- API: 18+ endpoints for partner workflows
- Frontend: 9 form components

**Deliverables:**
- ✅ Database tables (partners, awarding_body_visits, subscriptions, etc.)
- ✅ API endpoints for partner workflows
- ✅ Form components (RegistrationForm, VisitForm, ChecklistForm, etc.)
- ✅ Integration tests passing
   │  ├─ StudentApplicationForm.jsx
   │  ├─ AdmissionForm.jsx
   │  ├─ FacultyApplicationForm.jsx
   │  ├─ StudentOnboardingForm.jsx
   │  ├─ SupportRequestForm.jsx
   │  ├─ ComplaintForm.jsx
   │  └─ [Various form components for each module]
   │
   └─ modules/
      ├─ StudentsModule.jsx
      ├─ CoursesModule.jsx
      ├─ FacultyModule.jsx
      ├─ PartnersModule.jsx
      └─ SupportModule.jsx
   ```

**Deliverables:**
- ✅ All database & API endpoints for Module 4
- ✅ Form components working
- ✅ File handling configured

---

### **TASK 6: Module 5 - Support, Finance & Governance** (Week 10)
**Time: 1 week (Mar 30-Apr 4)**

**What we're building:**
- Support requests, complaints, appeals, finance, governance
- Database: 6 tables
- API: 20+ endpoints
- Frontend: 9 form components

**Deliverables:**
- ✅ Database tables (support_requests, complaints, appeals, finance_transactions, etc.)
- ✅ API endpoints for support & finance workflows
- ✅ Form components (SupportForm, ComplaintForm, AppealForm, FinanceForm, etc.)
- ✅ Integration tests passing

---

### **TASK 7: Dashboard Integration, Testing & Deployment** (Weeks 11-12)
**Time: 2 weeks (Apr 5-18)**

**What we're doing:**
- Integrate all 5 modules into master dashboard
- Comprehensive testing & UAT
- Production deployment & go-live

**Week 11: Integration & Testing**
1. Build master Dashboard.jsx
2. Integrate all 5 modules
3. Create role-based module display
4. Run comprehensive test suite (80%+ coverage)
5. Execute UAT with stakeholders
6. Fix critical bugs

**Week 12: Production & Go-Live**
1. Final data backup
2. Deploy to production
3. Run smoke tests
4. Conduct user training
5. Launch system
6. Monitor performance

**Deliverables:**
- ✅ Master dashboard integrated
- ✅ 80%+ test coverage
- ✅ UAT sign-off
- ✅ Production deployment
- ✅ Go-live successful

---

## 🗓️ TIMELINE UPDATE: MODULE-BASED DEVELOPMENT

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

## 📅 12-WEEK IMPLEMENTATION TIMELINE

### **PROJECT SCHEDULE AT A GLANCE**

| Phase | Task | Duration | Timeline | Status | 
|-------|------|----------|----------|--------|
| **Week 1** | Task 1: Infrastructure | 4 hours | Week 1 (Jan 26-Feb 1) | ✅ Done |
| **Week 1** | Task 2: Moodle + SSO | 6 hours | Week 1 (Jan 26-Feb 1) | ✅ Done |
| **Weeks 2-3** | Task 2: Module 1 - Students | 2 weeks | Feb 2-15 | → Next |
| **Weeks 4-5** | Task 3: Module 2 - Courses | 2 weeks | Feb 16-Mar 1 | Pending |
| **Weeks 6-7** | Task 4: Module 3 - Faculty & HR | 2 weeks | Mar 2-15 | Pending |
| **Weeks 8-9** | Task 5: Module 4 - Partners | 2 weeks | Mar 16-29 | Pending |
| **Week 10** | Task 6: Module 5 - Support/Finance | 1 week | Mar 30-Apr 4 | Pending |
| **Weeks 11-12** | Task 7: Integration & Go-Live | 2 weeks | Apr 5-18 | Pending |
| | | | **🚀 Go-Live** | **12 weeks** |

### **WEEKLY DELIVERABLES**

**WEEK 1: FOUNDATION** ✅
- Task 1: Infrastructure setup (4 hrs) 
  - Ubuntu server, Docker, GitHub, SSH
- Task 2: Moodle + SSO (6 hrs)
  - Moodle installed, SSO plugin working, domains configured
- **Milestone**: Ready for module-based development

**WEEKS 2-3: MODULE 1 - STUDENT MANAGEMENT**
- Task 2: Complete end-to-end student module
  - Database: 8 tables for student lifecycle
  - API: 20+ endpoints for students, applications, admissions, support
  - Frontend: 11 form components for student workflows
  - Integration tests passing

**WEEKS 4-5: MODULE 2 - COURSE MANAGEMENT**
- Task 3: Complete end-to-end course module
  - Database: 6 tables for courses and approvals
  - API: 18+ endpoints for course workflows
  - Frontend: 9 form components for course management
  - Integration tests passing

**WEEKS 6-7: MODULE 3 - FACULTY & HR MANAGEMENT**
- Task 4: Complete end-to-end faculty module
  - Database: 6 tables for faculty and HR
  - API: 18+ endpoints for faculty & HR workflows
  - Frontend: 8 form components for faculty management
  - Integration tests passing

**WEEKS 8-9: MODULE 4 - PARTNER & AWARDING BODY MANAGEMENT**
- Task 5: Complete end-to-end partner module
  - Database: 6 tables for partners and visits
  - API: 18+ endpoints for partner workflows
  - Frontend: 9 form components for partner management
  - Integration tests passing

**WEEK 10: MODULE 5 - SUPPORT, FINANCE & GOVERNANCE**
- Task 6: Complete end-to-end support/finance module
  - Database: 6 tables for support, finance, governance
  - API: 20+ endpoints for support & finance workflows
  - Frontend: 9 form components
  - Integration tests passing

**WEEKS 11-12: DASHBOARD INTEGRATION, TESTING & GO-LIVE**
- Task 7: Master integration and production
  - Integrate all 5 modules into dashboard
  - Comprehensive testing (80%+ coverage)
  - UAT with stakeholders
  - Production deployment
  - Go-live & monitoring
  - Deploy to production
  - Verify integrity & performance
  - Create backups & restore procedures

**WEEKS 4-6: API BACKBONE**
- Task 4: Backend API (3 weeks)
  - Week 4: Partners & Governance APIs
  - Week 5: Student Management APIs  
  - Week 6: Course & Faculty APIs
  - 60+ endpoints total
  - Full authentication & RBAC
  - Audit logging
  - API documentation

**WEEKS 7-9: FRONTEND UI**
- Task 5: Frontend Forms (3 weeks)
  - Week 7: Partnership & course forms
  - Week 8: Student application forms
  - Week 9: Faculty, support & governance forms
  - 40+ form components
  - File upload & validation
  - API integration

**WEEK 10: INTEGRATION & POLISH**
- Task 6: Dashboard & Navigation (1 week)
  - All modules integrated
  - Role-based filtering
  - KPIs & statistics
  - Navigation polish

**WEEKS 11-12: QUALITY & DEPLOYMENT**
- Task 7: Testing, UAT & Deployment (2 weeks)
  - Week 11: Full testing & UAT
  - Week 12: Production deployment & go-live
  - User support & training
  - Performance monitoring

### **MILESTONES & GO-LIVE**

- **End of Week 1**: Infrastructure ready
- **End of Week 3**: Database deployed to production
- **End of Week 6**: Full API complete & tested
- **End of Week 9**: All frontend forms integrated
- **End of Week 10**: Dashboard complete
- **End of Week 12**: System deployed to production 🚀

---

## 🚀 START TASK 3: DATABASE SCHEMA (Weeks 2-3)

**Timeline**: Weeks 2-3 of the 12-week project

**Objective**: Design and deploy the complete database schema with 40+ tables

**Next Steps**:
1. ✅ Design database schema with all 40+ tables
2. ✅ Create foreign key relationships
3. ✅ Set up performance indexes
4. ✅ Create migration scripts
5. ✅ Run migrations on production MySQL
6. ✅ Verify data integrity
7. ✅ Create backup procedures

**Expected Delay**: 2 weeks (proper testing & planning)

**Proceed?** 🎯
