# 📊 SCL Institute - Complete Database Architecture

## 🎯 Core Principle
- **SCL System**: Store forms, admin data, compliance, governance
- **Moodle Database**: Course delivery, schedules, assessments (integrated via SSO)
- **MySQL Bridge**: Single source of truth for users and roles

---

## 📐 DATABASE SCHEMA OVERVIEW

### **LAYER 1: Core Users & Roles (Foundation)**

```sql
-- Users Table (Active Directory for all systems)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roles Table (5 Core Roles)
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Insert 5 roles:
INSERT INTO roles (role_name, description) VALUES
('super_admin', 'Full system access'),
('lms_manager', 'Manages course delivery, schedules, exams'),
('partners_manager', 'Manages partners, awarding bodies, subscriptions'),
('admissions_officer', 'Processes student applications and admissions'),
('faculty_hr_manager', 'Manages faculty and HR operations');

-- User Roles (Many-to-Many)
CREATE TABLE user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE KEY unique_user_role (user_id, role_id)
);

-- Role Permissions (Control what each role can do)
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    module_name VARCHAR(100),
    action VARCHAR(50), -- 'create', 'read', 'update', 'delete', 'review', 'approve'
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_perm (role_id, module_name, action)
);
```

---

### **LAYER 2: Partners & Associates Management**

```sql
-- Partners Table
CREATE TABLE partners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    partner_name VARCHAR(255) NOT NULL,
    partner_type ENUM('awarding_body', 'associate', 'affiliate'),
    contact_email VARCHAR(255),
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    address TEXT,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Awarding Body Inspections Form
CREATE TABLE awarding_body_visits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    partner_id INT NOT NULL,
    visit_type VARCHAR(100), -- 'Annual Monitoring', 'Initial Approval', 'Audit', 'Thematic Review'
    visit_date DATE,
    lead_contact VARCHAR(255),
    coordinator_id INT NOT NULL,
    purpose TEXT,
    scope TEXT,
    key_standards TEXT,
    visit_agenda TEXT,
    required_attendees TEXT,
    status ENUM('planned', 'in_progress', 'completed', 'deferred') DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id),
    FOREIGN KEY (coordinator_id) REFERENCES users(id)
);

-- Pre-Visit Checklist
CREATE TABLE pre_visit_checklist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    visit_id INT NOT NULL,
    requirement VARCHAR(255),
    evidence_required TEXT,
    responsible_person_id INT,
    due_date DATE,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (visit_id) REFERENCES awarding_body_visits(id) ON DELETE CASCADE,
    FOREIGN KEY (responsible_person_id) REFERENCES users(id)
);

-- Post-Visit Actions
CREATE TABLE post_visit_actions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    visit_id INT NOT NULL,
    action_item VARCHAR(255),
    priority ENUM('high', 'medium', 'low'),
    responsible_person_id INT,
    due_date DATE,
    status ENUM('open', 'in_progress', 'completed') DEFAULT 'open',
    evidence_of_completion TEXT,
    FOREIGN KEY (visit_id) REFERENCES awarding_body_visits(id) ON DELETE CASCADE,
    FOREIGN KEY (responsible_person_id) REFERENCES users(id)
);

-- Subscriptions & Membership
CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    partner_id INT NOT NULL,
    subscription_type VARCHAR(100),
    start_date DATE,
    end_date DATE,
    cost DECIMAL(10, 2),
    status ENUM('active', 'expired', 'suspended') DEFAULT 'active',
    renewal_date DATE,
    FOREIGN KEY (partner_id) REFERENCES partners(id)
);
```

---

### **LAYER 3: Course Offerings & Program Catalog**

```sql
-- Courses Table
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    course_type ENUM('HND', 'Degree', 'Vocational', 'Short Course', 'CPD'),
    mode_of_study ENUM('Full-time', 'Part-time', 'Online', 'Blended'),
    duration_months INT,
    credit_points INT,
    awarding_body_id INT,
    status ENUM('draft', 'pending_approval', 'approved', 'active', 'inactive', 'archived') DEFAULT 'draft',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (awarding_body_id) REFERENCES partners(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Course Approval Initiations
CREATE TABLE course_approvals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    initiator_id INT NOT NULL,
    approval_stage ENUM('submitted', 'under_review', 'approved', 'rejected', 'revisions_required') DEFAULT 'submitted',
    review_notes TEXT,
    reviewed_by INT,
    reviewed_at TIMESTAMP,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (initiator_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Course Compliance & Delivery Requirements
CREATE TABLE course_compliance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    requirement_name VARCHAR(255),
    requirement_description TEXT,
    compliance_status ENUM('compliant', 'non_compliant', 'pending_review'),
    evidence_provided TEXT,
    reviewed_by INT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Course Inductions
CREATE TABLE course_inductions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    induction_date DATE,
    location_or_link VARCHAR(255),
    presenter_id INT,
    attendees_count INT,
    status ENUM('planned', 'completed', 'cancelled') DEFAULT 'planned',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (presenter_id) REFERENCES users(id)
);
```

---

### **LAYER 4: Students**

```sql
-- Student Profile (extends users table)
CREATE TABLE student_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    student_id VARCHAR(20) UNIQUE NOT NULL AUTO_INCREMENT,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other', 'Prefer not to say'),
    nationality VARCHAR(100),
    highest_qualification VARCHAR(100),
    work_experience TEXT,
    english_proficiency VARCHAR(50),
    english_score DECIMAL(5, 2),
    disabilities_or_support_needed BOOLEAN DEFAULT FALSE,
    disability_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Student Applications (Forms)
CREATE TABLE student_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_user_id INT NOT NULL,
    course_id INT NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    entry_route ENUM('Standard', 'RPL', 'Mature Student') DEFAULT 'Standard',
    intake_date DATE,
    application_status ENUM('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'deferred') DEFAULT 'draft',
    supporting_documents_uploaded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Application Reviews (Form)
CREATE TABLE application_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    reviewed_by INT NOT NULL,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    academic_suitability VARCHAR(255),
    language_proficiency_check VARCHAR(255),
    documentation_complete BOOLEAN,
    recommendation ENUM('approve', 'reject', 'conditional_accept', 'deferred'),
    review_notes TEXT,
    FOREIGN KEY (application_id) REFERENCES student_applications(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Admissions (Form)
CREATE TABLE admissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    admission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admission_decision ENUM('accepted', 'conditional', 'rejected'),
    conditions TEXT,
    admission_status ENUM('confirmed', 'pending_confirmation', 'declined') DEFAULT 'pending_confirmation',
    acceptance_deadline DATE,
    FOREIGN KEY (application_id) REFERENCES student_applications(id)
);

-- Student Onboarding (Form)
CREATE TABLE student_onboarding (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_user_id INT NOT NULL,
    course_id INT NOT NULL,
    onboarding_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    student_handbook_provided BOOLEAN,
    course_handbook_provided BOOLEAN,
    policies_explained BOOLEAN,
    it_and_email_setup BOOLEAN,
    library_access_provided BOOLEAN,
    support_services_explained BOOLEAN,
    consent_gdpr BOOLEAN,
    consent_data_share BOOLEAN,
    declaration_signed BOOLEAN,
    declaration_date DATE,
    FOREIGN KEY (student_user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Deferral Requests (Form)
CREATE TABLE deferral_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_user_id INT NOT NULL,
    course_id INT NOT NULL,
    current_start_date DATE,
    requested_start_date DATE,
    deferral_reason TEXT,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    request_status ENUM('submitted', 'under_review', 'approved', 'rejected') DEFAULT 'submitted',
    reviewed_by INT,
    review_date TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (student_user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Course Registration (Moodle Link - reference)
CREATE TABLE course_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_user_id INT NOT NULL,
    course_id INT NOT NULL,
    moodle_enrollment_id VARCHAR(100),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('registered', 'active', 'suspended', 'completed') DEFAULT 'active',
    FOREIGN KEY (student_user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

---

### **LAYER 5: Academic Resource (Faculty & HR)**

```sql
-- Faculty Profile (extends users table)
CREATE TABLE faculty_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100),
    specialization VARCHAR(255),
    qualifications TEXT,
    experience_years INT,
    hire_date DATE,
    status ENUM('active', 'inactive', 'on_leave', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Faculty Applications (Form)
CREATE TABLE faculty_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    applicant_user_id INT NOT NULL,
    position VARCHAR(255),
    department VARCHAR(100),
    specialization VARCHAR(255),
    qualifications TEXT,
    experience LONGTEXT,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_status ENUM('draft', 'submitted', 'screening', 'shortlisted', 'interview', 'offered', 'rejected') DEFAULT 'draft',
    FOREIGN KEY (applicant_user_id) REFERENCES users(id)
);

-- Faculty Selections (Form)
CREATE TABLE faculty_selections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    selection_round INT,
    selected_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    selected_by INT NOT NULL,
    interview_date DATE,
    interview_feedback TEXT,
    selection_status ENUM('selected', 'alternative', 'not_selected') DEFAULT 'selected',
    FOREIGN KEY (application_id) REFERENCES faculty_applications(id),
    FOREIGN KEY (selected_by) REFERENCES users(id)
);

-- Faculty Onboarding (Form)
CREATE TABLE faculty_onboarding (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_user_id INT NOT NULL,
    onboarding_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    employee_handbook_provided BOOLEAN,
    it_setup_completed BOOLEAN,
    office_access_granted BOOLEAN,
    course_assignment_completed BOOLEAN,
    mentor_assigned_to INT,
    orientation_completed BOOLEAN,
    hr_processing_complete BOOLEAN,
    FOREIGN KEY (faculty_user_id) REFERENCES users(id),
    FOREIGN KEY (mentor_assigned_to) REFERENCES users(id)
);
```

---

### **LAYER 6: Learning Management**

```sql
-- Course Delivery (Moodle integration table)
CREATE TABLE course_deliveries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    cohort_name VARCHAR(100),
    start_date DATE,
    end_date DATE,
    faculty_lead_id INT,
    moodle_course_id VARCHAR(100),
    status ENUM('planned', 'active', 'completed', 'cancelled') DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (faculty_lead_id) REFERENCES users(id)
);

-- Schedules & Timetable (Moodle)
CREATE TABLE timetables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    delivery_id INT NOT NULL,
    session_date DATE,
    start_time TIME,
    end_time TIME,
    session_type VARCHAR(100), -- 'Lecture', 'Tutorial', 'Lab', 'Seminar'
    location_or_link VARCHAR(255),
    facilitator_id INT,
    topic VARCHAR(255),
    notes TEXT,
    FOREIGN KEY (delivery_id) REFERENCES course_deliveries(id),
    FOREIGN KEY (facilitator_id) REFERENCES users(id)
);

-- Assignments & Assessments (Moodle)
CREATE TABLE assessments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    delivery_id INT NOT NULL,
    assessment_name VARCHAR(255),
    assessment_type ENUM('Assignment', 'Quiz', 'Exam', 'Project', 'Presentation'),
    due_date DATE,
    weight_percentage INT,
    total_marks INT,
    passing_mark INT,
    description TEXT,
    moodle_assignment_id VARCHAR(100),
    FOREIGN KEY (delivery_id) REFERENCES course_deliveries(id)
);

-- Examinations & Grading (Moodle)
CREATE TABLE exam_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assessment_id INT NOT NULL,
    student_user_id INT NOT NULL,
    exam_date DATE,
    exam_location VARCHAR(255),
    marks_obtained DECIMAL(5, 2),
    grade VARCHAR(5), -- 'A', 'B', 'C', 'D', 'F', 'Pass', 'Fail'
    feedback TEXT,
    submitted_by INT,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id),
    FOREIGN KEY (student_user_id) REFERENCES users(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id)
);
```

---

### **LAYER 7: Student Support & Complaints**

```sql
-- Student Support (Form)
CREATE TABLE support_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_user_id INT NOT NULL,
    support_category VARCHAR(100), -- 'Academic', 'Personal', 'Financial', 'Technical'
    support_type VARCHAR(100),
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    required_action TEXT,
    assigned_to INT,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    resolution_notes TEXT,
    FOREIGN KEY (student_user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Complaints & Grievances (Form)
CREATE TABLE complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    complainant_user_id INT NOT NULL,
    complaint_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    complaint_category VARCHAR(100), -- 'Academic', 'Conduct', 'Services', 'Facilities'
    complaint_details TEXT,
    complaint_status ENUM('submitted', 'acknowledged', 'under_investigation', 'resolved', 'closed') DEFAULT 'submitted',
    assigned_to INT,
    resolution TEXT,
    resolved_date TIMESTAMP,
    FOREIGN KEY (complainant_user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Complaints & Appeals (Form)
CREATE TABLE appeals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT,
    appellant_user_id INT NOT NULL,
    appeal_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    appeal_reason TEXT,
    appeal_against VARCHAR(100), -- 'Grade', 'Decision', 'Disciplinary'
    appeal_status ENUM('submitted', 'under_review', 'approved', 'rejected', 'upheld') DEFAULT 'submitted',
    reviewed_by INT,
    review_date TIMESTAMP,
    appeal_outcome TEXT,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id),
    FOREIGN KEY (appellant_user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Academic Misconduct (Form)
CREATE TABLE academic_misconduct (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_user_id INT NOT NULL,
    course_id INT NOT NULL,
    assessment_id INT,
    misconduct_date DATE,
    misconduct_type VARCHAR(100), -- 'Plagiarism', 'Cheating', 'Collusion', 'Fabrication'
    description TEXT,
    reported_by INT NOT NULL,
    reported_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    investigation_status ENUM('reported', 'investigating', 'concluded') DEFAULT 'reported',
    investigation_findings TEXT,
    penalty VARCHAR(255),
    penalty_applied_date DATE,
    FOREIGN KEY (student_user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (assessment_id) REFERENCES assessments(id),
    FOREIGN KEY (reported_by) REFERENCES users(id)
);
```

---

### **LAYER 8: ERP (Finance, HR & Administration)**

```sql
-- Finance Transactions
CREATE TABLE finance_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_date DATE,
    transaction_type ENUM('fee_payment', 'refund', 'expense', 'purchase'),
    student_user_id INT,
    amount DECIMAL(12, 2),
    description TEXT,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    recorded_by INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_user_id) REFERENCES users(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- HR & Admin
CREATE TABLE hr_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_user_id INT NOT NULL,
    record_type ENUM('leave', 'payroll', 'promotion', 'disciplinary'),
    record_date DATE,
    details TEXT,
    processed_by INT NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_user_id) REFERENCES users(id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- Suppliers & Vendors
CREATE TABLE suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(255),
    supplier_type VARCHAR(100),
    contact_email VARCHAR(255),
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    payment_terms VARCHAR(100),
    status ENUM('active', 'inactive', 'blacklisted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### **LAYER 9: Governance & Risk Management**

```sql
-- Governance Records
CREATE TABLE governance_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    record_type VARCHAR(100), -- 'Policy', 'Procedure', 'Minutes', 'Decision'
    title VARCHAR(255),
    description LONGTEXT,
    effective_date DATE,
    review_date DATE,
    owner_id INT NOT NULL,
    status ENUM('draft', 'approved', 'active', 'archived') DEFAULT 'draft',
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Risk Management Register
CREATE TABLE risk_register (
    id INT PRIMARY KEY AUTO_INCREMENT,
    risk_description TEXT,
    risk_category VARCHAR(100),
    impact_level ENUM('low', 'medium', 'high', 'critical'),
    probability ENUM('low', 'medium', 'high'),
    risk_score INT GENERATED ALWAYS AS (
        CASE 
            WHEN impact_level = 'critical' THEN 4
            WHEN impact_level = 'high' THEN 3
            WHEN impact_level = 'medium' THEN 2
            ELSE 1
        END *
        CASE 
            WHEN probability = 'high' THEN 3
            WHEN probability = 'medium' THEN 2
            ELSE 1
        END
    ) STORED,
    mitigation_strategy TEXT,
    owner_id INT NOT NULL,
    status ENUM('open', 'mitigating', 'resolved') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Compliances
CREATE TABLE compliances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    compliance_type VARCHAR(100), -- 'GDPR', 'QA', 'Accreditation', 'Regulatory'
    requirement TEXT,
    deadline DATE,
    owner_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed', 'failed') DEFAULT 'not_started',
    evidence_file TEXT,
    reviewed_by INT,
    review_date TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

---

### **SUPPORTING TABLES**

```sql
-- Document Upload Storage (Reference table)
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_type VARCHAR(100), -- 'Application', 'Certificate', 'Report', etc
    uploaded_by INT NOT NULL,
    related_form VARCHAR(100),
    related_form_id INT,
    file_path VARCHAR(500),
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Audit Log (Compliance tracking)
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100),
    table_name VARCHAR(100),
    record_id INT,
    old_value LONGTEXT,
    new_value LONGTEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- SSO Tokens (Already exists)
CREATE TABLE sso_tokens (
    token VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255),
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 **Data Flow & Relationships**

```
LOGIN → users/user_roles/roles
         ↓
    DASHBOARD (based on role)
         ↓
    ├─ Super Admin     → ALL modules
    ├─ LMS Manager     → Course Delivery, Assessments, Exams
    ├─ Partners Mgr    → Partners, Inspections, Subscriptions
    ├─ Admissions      → Applications, Admissions, Onboarding
    └─ Faculty HR Mgr  → Faculty Apps, Faculty Onboarding, HR Records
         ↓
    MOODLE INTEGRATION (via SSO + sso_tokens)
         ↓
    ├─ course_registrations (link SCL to Moodle)
    ├─ timetables (scheduled in Moodle)
    ├─ assessments (created in Moodle)
    └─ exam_records (grades from Moodle)
```

---

## 📊 **KEY DESIGN PRINCIPLES**

✅ **Role-Based Access Control (RBAC)**
- `user_roles` + `role_permissions` tables control all access
- Frontend filters based on user.role
- Backend enforces permissions via middleware

✅ **Modularity**
- Each layer has self-contained tables
- Clear separation: SCL System vs Moodle Integration
- Referential integrity via Foreign Keys

✅ **Audit Trail**
- `audit_log` tracks all changes for compliance
- Timestamps on all records
- `created_by`, `updated_by`, `reviewed_by` fields

✅ **Data Integrity**
- Foreign key constraints prevent orphaned records
- Unique constraints prevent duplicates
- Proper enum types restrict invalid values

✅ **Scalability**
- Indexed on foreign keys
- Status fields allow workflow transitions
- Document storage for attachments

---

**Ready to start building? Should I create:**
1. ✅ SQL migration file (all CREATE TABLE statements)
2. ✅ Backend API routes for each module
3. ✅ Frontend forms for each module
4. ✅ Role-based dashboard with navigation

**Which first?** 🚀
