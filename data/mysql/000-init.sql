-- ===============================================
-- SCL-Institute Complete Database Schema
-- 12-Week Implementation Project
-- Version 1.0
-- Created: January 28, 2026
-- ===============================================

-- Drop existing database (for fresh installation)
-- DROP DATABASE IF EXISTS scl_institute;

-- Create database
CREATE DATABASE IF NOT EXISTS scl_institute;
USE scl_institute;

-- ===============================================
-- CORE SYSTEM TABLES
-- ===============================================

-- Users table (Central authentication & profile)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('M', 'F', 'Other'),
    profile_photo LONGBLOB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role_name (role_name)
);

-- User-Role mapping (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    UNIQUE KEY unique_user_role (user_id, role_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
);

-- Role-Permission mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_name VARCHAR(100) NOT NULL,
    module_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_name),
    INDEX idx_role_id (role_id),
    INDEX idx_module (module_name)
);

-- SSO Tokens (for Moodle integration)
CREATE TABLE IF NOT EXISTS sso_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token_uuid VARCHAR(36) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    target_system VARCHAR(50),
    is_used BOOLEAN DEFAULT FALSE,
    expires_at DATETIME,
    used_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token_uuid),
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at)
);

-- Audit Log (Compliance tracking)
CREATE TABLE IF NOT EXISTS audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    module_name VARCHAR(50),
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created (created_at),
    INDEX idx_module (module_name)
);

-- ===============================================
-- MODULE 1: STUDENT MANAGEMENT (8 tables)
-- ===============================================

-- Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    citizenship VARCHAR(100),
    national_id VARCHAR(50),
    qualification_level VARCHAR(100),
    previous_institution VARCHAR(255),
    gpa DECIMAL(3,2),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    status ENUM('Active', 'Inactive', 'Suspended', 'Graduated'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
);

-- Student Applications
CREATE TABLE IF NOT EXISTS student_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    application_documents JSON,
    academic_transcript VARCHAR(255),
    recommendation_letters JSON,
    statement_of_purpose TEXT,
    application_status ENUM('Draft', 'Submitted', 'Under Review', 'Reviewed') DEFAULT 'Draft',
    submitted_date DATETIME,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (application_status)
);

-- Application Reviews
CREATE TABLE IF NOT EXISTS application_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    academic_score DECIMAL(5,2),
    comments TEXT,
    recommendation ENUM('Strong Accept', 'Accept', 'Conditional', 'Reject'),
    review_status ENUM('Pending', 'Completed') DEFAULT 'Pending',
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    INDEX idx_application_id (application_id),
    INDEX idx_reviewer_id (reviewer_id)
);

-- Admissions Decisions
CREATE TABLE IF NOT EXISTS admissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL UNIQUE,
    student_id INT NOT NULL,
    decision ENUM('Accepted', 'Conditionally Accepted', 'Rejected', 'Deferred'),
    decision_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    valid_until DATE,
    offer_letter VARCHAR(255),
    conditions TEXT,
    acceptance_status ENUM('Pending', 'Accepted', 'Declined', 'Deferred') DEFAULT 'Pending',
    decision_made_by INT,
    remarks TEXT,
    FOREIGN KEY (application_id) REFERENCES student_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (decision_made_by) REFERENCES users(id),
    INDEX idx_student_id (student_id),
    INDEX idx_decision (decision)
);

-- Student Onboarding
CREATE TABLE IF NOT EXISTS student_onboarding (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    onboarding_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    handbook_acknowledged BOOLEAN DEFAULT FALSE,
    code_of_conduct_signed BOOLEAN DEFAULT FALSE,
    orientation_attended BOOLEAN DEFAULT FALSE,
    it_systems_access_granted BOOLEAN DEFAULT FALSE,
    student_id_issued BOOLEAN DEFAULT FALSE,
    library_card_issued BOOLEAN DEFAULT FALSE,
    health_check_completed BOOLEAN DEFAULT FALSE,
    financial_aid_processed BOOLEAN DEFAULT FALSE,
    onboarding_status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    assigned_mentor INT,
    completion_date DATETIME,
    remarks TEXT,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_mentor) REFERENCES users(id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (onboarding_status)
);

-- Course Registrations (Student enrollment link)
CREATE TABLE IF NOT EXISTS course_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    moodle_enrolled BOOLEAN DEFAULT FALSE,
    moodle_enrollment_date DATETIME,
    enrollment_status ENUM('Registered', 'Active', 'Completed', 'Withdrawn') DEFAULT 'Registered',
    completion_date DATETIME,
    grade DECIMAL(5,2),
    gpa DECIMAL(3,2),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (enrollment_status),
    UNIQUE KEY unique_enrollment (student_id, course_id)
);

-- Support Requests
CREATE TABLE IF NOT EXISTS support_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    request_type ENUM('Academic', 'Financial', 'Technical', 'Health', 'Other'),
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    assigned_to INT,
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
    resolution TEXT,
    resolved_date DATETIME,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
);

-- Student Complaints & Grievances
CREATE TABLE IF NOT EXISTS student_complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    complaint_type ENUM('Academic', 'Harassment', 'Discrimination', 'Service Quality', 'Other'),
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    complaint_against VARCHAR(255),
    date_of_incident DATE,
    reported_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status ENUM('Registered', 'Under Investigation', 'Resolved', 'Closed') DEFAULT 'Registered',
    investigation_report TEXT,
    resolution TEXT,
    resolved_date DATETIME,
    assigned_to INT,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
);

-- ===============================================
-- MODULE 2: COURSE MANAGEMENT (7 tables)
-- ===============================================

-- Courses
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    description TEXT,
    credits INT,
    level ENUM('Certificate', 'Diploma', 'Degree', 'Masters'),
    duration_months INT,
    start_date DATE,
    end_date DATE,
    delivery_mode ENUM('Online', 'Offline', 'Hybrid'),
    course_status ENUM('Draft', 'Active', 'Archived', 'Discontinued') DEFAULT 'Draft',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_course_code (course_code),
    INDEX idx_status (course_status)
);

-- Course Approvals
CREATE TABLE IF NOT EXISTS course_approvals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    submitted_for_approval_date DATETIME,
    approval_status ENUM('Pending', 'Approved', 'Rejected', 'Conditional') DEFAULT 'Pending',
    approved_by INT,
    approval_date DATETIME,
    comments TEXT,
    compliance_checked BOOLEAN DEFAULT FALSE,
    accreditation_verified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (approval_status)
);

-- Course Compliance
CREATE TABLE IF NOT EXISTS course_compliance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    compliance_check_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    standards_met TEXT,
    learning_outcomes_defined BOOLEAN DEFAULT FALSE,
    assessment_methods_documented BOOLEAN DEFAULT FALSE,
    instructor_qualifications_verified BOOLEAN DEFAULT FALSE,
    resource_adequacy_checked BOOLEAN DEFAULT FALSE,
    compliance_status ENUM('Compliant', 'Non-Compliant', 'Pending Review') DEFAULT 'Pending Review',
    reviewed_by INT,
    remarks TEXT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_course_id (course_id)
);

-- Course Inductions (Cohort management)
CREATE TABLE IF NOT EXISTS course_inductions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    cohort_number INT,
    start_date DATE,
    end_date DATE,
    induction_date DATETIME,
    induction_status ENUM('Planned', 'Completed', 'Cancelled') DEFAULT 'Planned',
    enrolled_students INT DEFAULT 0,
    orientation_completed BOOLEAN DEFAULT FALSE,
    materials_distributed BOOLEAN DEFAULT FALSE,
    conducted_by INT,
    remarks TEXT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (conducted_by) REFERENCES users(id),
    INDEX idx_course_id (course_id)
);

-- Course Deliveries (Active course runs)
CREATE TABLE IF NOT EXISTS course_deliveries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    delivery_start_date DATE NOT NULL,
    delivery_end_date DATE NOT NULL,
    instructor_id INT,
    delivery_mode ENUM('Online', 'Offline', 'Hybrid'),
    maximum_students INT,
    enrolled_count INT DEFAULT 0,
    delivery_status ENUM('Planned', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Planned',
    learning_management_reference VARCHAR(255),
    remarks TEXT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(id),
    INDEX idx_course_id (course_id),
    INDEX idx_delivery_status (delivery_status)
);

-- Moodle Course Mapping (Links SCL courses to Moodle courses)
CREATE TABLE IF NOT EXISTS moodle_course_mapping (
    id INT PRIMARY KEY AUTO_INCREMENT,
    scl_course_id INT NOT NULL UNIQUE,
    moodle_course_id INT,
    moodle_course_name VARCHAR(255),
    moodle_shortname VARCHAR(100),
    mapping_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    sync_status ENUM('Pending', 'Synced', 'Failed', 'Manual') DEFAULT 'Pending',
    last_sync_date DATETIME,
    auto_sync_enabled BOOLEAN DEFAULT TRUE,
    enrollment_sync_enabled BOOLEAN DEFAULT TRUE,
    grade_sync_enabled BOOLEAN DEFAULT TRUE,
    sync_error_message TEXT,
    FOREIGN KEY (scl_course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_scl_course_id (scl_course_id),
    INDEX idx_moodle_course_id (moodle_course_id),
    INDEX idx_sync_status (sync_status)
);

-- ===============================================
-- MODULE 3: FACULTY & HR MANAGEMENT (6 tables)
-- ===============================================

-- Faculty Profiles
CREATE TABLE IF NOT EXISTS faculty_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    designation VARCHAR(100),
    specialization VARCHAR(255),
    qualification VARCHAR(255),
    years_of_experience INT,
    office_phone VARCHAR(20),
    office_location VARCHAR(255),
    bio TEXT,
    research_interests TEXT,
    publications TEXT,
    employment_status ENUM('Permanent', 'Contract', 'Visiting', 'Adjunct', 'On Leave') DEFAULT 'Permanent',
    start_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_department (department)
);

-- Faculty Applications
CREATE TABLE IF NOT EXISTS faculty_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    applicant_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    position_applied_for VARCHAR(100),
    qualification_level VARCHAR(100),
    years_of_experience INT,
    current_institution VARCHAR(255),
    resume VARCHAR(255),
    cover_letter TEXT,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_status ENUM('Received', 'Under Review', 'Interview Scheduled', 'Rejected', 'Offer Extended') DEFAULT 'Received',
    assigned_to INT,
    remarks TEXT,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    INDEX idx_email (email),
    INDEX idx_status (application_status)
);

-- Faculty Selection Process
CREATE TABLE IF NOT EXISTS faculty_selections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    screening_date DATETIME,
    screening_status ENUM('Pass', 'Fail', 'Pending') DEFAULT 'Pending',
    interview_date DATETIME,
    interview_panel_members JSON,
    interview_score DECIMAL(5,2),
    interview_status ENUM('Pending', 'Completed', 'Scheduled') DEFAULT 'Pending',
    selection_decision ENUM('Selected', 'Waitlisted', 'Rejected', 'Pending') DEFAULT 'Pending',
    decision_date DATETIME,
    salary_offer DECIMAL(10,2),
    joining_date DATE,
    background_check_status ENUM('Not Started', 'In Progress', 'Cleared', 'Failed') DEFAULT 'Not Started',
    FOREIGN KEY (application_id) REFERENCES faculty_applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id),
    INDEX idx_decision (selection_decision)
);

-- Faculty Onboarding
CREATE TABLE IF NOT EXISTS faculty_onboarding (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL,
    onboarding_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    orientation_conducted BOOLEAN DEFAULT FALSE,
    it_setup_completed BOOLEAN DEFAULT FALSE,
    office_assigned BOOLEAN DEFAULT FALSE,
    access_cards_issued BOOLEAN DEFAULT FALSE,
    health_check_completed BOOLEAN DEFAULT FALSE,
    teaching_schedule_assigned BOOLEAN DEFAULT FALSE,
    course_materials_provided BOOLEAN DEFAULT FALSE,
    mentorship_assigned BOOLEAN DEFAULT FALSE,
    mentor_id INT,
    onboarding_completed_date DATETIME,
    onboarding_status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    remarks TEXT,
    FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES users(id),
    INDEX idx_faculty_id (faculty_id)
);

-- HR Records
CREATE TABLE IF NOT EXISTS hr_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL,
    record_type ENUM('Attendance', 'Performance Review', 'Leave Request', 'Promotion', 'Disciplinary', 'Other'),
    record_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    document_path VARCHAR(255),
    status ENUM('Active', 'Archived', 'Pending Review') DEFAULT 'Active',
    reviewed_by INT,
    review_date DATETIME,
    remarks TEXT,
    FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_faculty_id (faculty_id),
    INDEX idx_record_type (record_type)
);

-- Suppliers & Vendors
CREATE TABLE IF NOT EXISTS suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(255) UNIQUE NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    supplier_type ENUM('Equipment', 'Services', 'Materials', 'Consulting', 'Other'),
    address VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    banking_details JSON,
    supplier_status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    rating DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_supplier_name (supplier_name),
    INDEX idx_status (supplier_status)
);

-- ===============================================
-- MODULE 4: PARTNER & AWARDING BODY MANAGEMENT (6 tables)
-- ===============================================

-- Partners & Awarding Bodies
CREATE TABLE IF NOT EXISTS partners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    partner_name VARCHAR(255) UNIQUE NOT NULL,
    partner_type ENUM('Awarding Body', 'Partner Institution', 'Industry Partner', 'Strategic Partner'),
    registration_number VARCHAR(100),
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    website VARCHAR(255),
    accreditation_status ENUM('Accredited', 'Pending', 'Suspended'),
    partnership_agreement_date DATE,
    agreement_document VARCHAR(255),
    partner_status ENUM('Active', 'Inactive', 'Under Review', 'Suspended') DEFAULT 'Active',
    risk_level ENUM('Low', 'Medium', 'High') DEFAULT 'Low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_partner_name (partner_name),
    INDEX idx_partner_type (partner_type)
);

-- Awarding Body Visits & Inspections
CREATE TABLE IF NOT EXISTS awarding_body_visits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    partner_id INT NOT NULL,
    visit_date DATE NOT NULL,
    visit_type ENUM('Routine Inspection', 'Accreditation', 'Follow-up', 'Emergency') DEFAULT 'Routine Inspection',
    visit_scheduled_date DATE,
    visit_start_time TIME,
    visit_end_time TIME,
    assigned_inspector_id INT,
    purpose TEXT,
    visit_notes TEXT,
    visit_status ENUM('Planned', 'In Progress', 'Completed', 'Rescheduled', 'Cancelled') DEFAULT 'Planned',
    findings_report VARCHAR(255),
    overall_rating ENUM('Excellent', 'Good', 'Satisfactory', 'Poor'),
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_inspector_id) REFERENCES users(id),
    INDEX idx_partner_id (partner_id),
    INDEX idx_visit_date (visit_date)
);

-- Pre-Visit Checklist
CREATE TABLE IF NOT EXISTS pre_visit_checklist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    visit_id INT NOT NULL,
    checklist_item VARCHAR(255),
    item_status ENUM('Pending', 'Completed', 'N/A') DEFAULT 'Pending',
    responsible_person INT,
    due_date DATE,
    actual_date DATE,
    notes TEXT,
    FOREIGN KEY (visit_id) REFERENCES awarding_body_visits(id) ON DELETE CASCADE,
    FOREIGN KEY (responsible_person) REFERENCES users(id),
    INDEX idx_visit_id (visit_id)
);

-- Post-Visit Actions & Follow-ups
CREATE TABLE IF NOT EXISTS post_visit_actions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    visit_id INT NOT NULL,
    action_item VARCHAR(255),
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    responsible_person INT,
    due_date DATE,
    target_completion_date DATE,
    action_status ENUM('Open', 'In Progress', 'Completed', 'Overdue') DEFAULT 'Open',
    completion_evidence VARCHAR(255),
    completion_date DATETIME,
    remarks TEXT,
    FOREIGN KEY (visit_id) REFERENCES awarding_body_visits(id) ON DELETE CASCADE,
    FOREIGN KEY (responsible_person) REFERENCES users(id),
    INDEX idx_visit_id (visit_id),
    INDEX idx_status (action_status)
);

-- Subscriptions & Membership
CREATE TABLE IF NOT EXISTS partner_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    partner_id INT NOT NULL,
    subscription_type ENUM('Annual', 'Multi-Year', 'Per Course', 'Per Student'),
    subscription_start_date DATE,
    subscription_end_date DATE,
    subscription_fee DECIMAL(10,2),
    payment_status ENUM('Pending', 'Paid', 'Overdue', 'Cancelled') DEFAULT 'Pending',
    subscription_status ENUM('Active', 'Expired', 'Suspended') DEFAULT 'Active',
    renewal_date DATE,
    documents JSON,
    renewal_reminder_sent BOOLEAN DEFAULT FALSE,
    remarks TEXT,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    INDEX idx_partner_id (partner_id),
    INDEX idx_status (subscription_status)
);

-- Partner Risk Register
CREATE TABLE IF NOT EXISTS partner_risk_register (
    id INT PRIMARY KEY AUTO_INCREMENT,
    partner_id INT NOT NULL,
    risk_description TEXT,
    risk_type ENUM('Financial', 'Operational', 'Reputational', 'Compliance', 'Other'),
    risk_probability ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    risk_impact ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    risk_level ENUM('Low', 'Medium', 'High', 'Critical'),
    mitigation_strategy TEXT,
    responsible_person INT,
    review_date DATE,
    status ENUM('Identified', 'Under Review', 'Mitigated', 'Accepted') DEFAULT 'Identified',
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    FOREIGN KEY (responsible_person) REFERENCES users(id),
    INDEX idx_partner_id (partner_id),
    INDEX idx_risk_level (risk_level)
);

-- ===============================================
-- MODULE 5: SUPPORT, FINANCE & GOVERNANCE (6 tables)
-- ===============================================

-- Appeals Management
CREATE TABLE IF NOT EXISTS student_appeals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    appeal_type ENUM('Academic', 'Disciplinary', 'Financial', 'Grade', 'Other'),
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    appeal_reason TEXT,
    supporting_documents JSON,
    appeal_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    appeal_status ENUM('Registered', 'Under Review', 'Approved', 'Rejected', 'Resolved') DEFAULT 'Registered',
    appeal_committee_members JSON,
    review_date DATETIME,
    decision TEXT,
    decision_date DATETIME,
    appeal_outcome ENUM('Upheld', 'Partially Upheld', 'Not Upheld', 'Pending') DEFAULT 'Pending',
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_status (appeal_status)
);

-- Finance Transactions
CREATE TABLE IF NOT EXISTS finance_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_type ENUM('Tuition', 'Registration', 'Examination', 'Refund', 'Other Fee', 'Payment'),
    related_entity_type ENUM('Student', 'Faculty', 'Partner', 'Vendor'),
    related_entity_id INT,
    amount DECIMAL(12,2) NOT NULL,
    transaction_date DATE,
    payment_method ENUM('Bank Transfer', 'Credit Card', 'Cheque', 'Cash', 'Other'),
    payment_status ENUM('Pending', 'Completed', 'Failed', 'Cancelled') DEFAULT 'Pending',
    transaction_reference VARCHAR(100),
    invoice_number VARCHAR(100),
    notes TEXT,
    recorded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    INDEX idx_entity_type (related_entity_type),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_date (transaction_date)
);

-- Governance Records
CREATE TABLE IF NOT EXISTS governance_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    record_type ENUM('Policy', 'Procedure', 'Minutes', 'Decision', 'Regulation', 'Other'),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    document_path VARCHAR(255),
    effective_date DATE,
    review_date DATE,
    next_review_date DATE,
    approved_by INT,
    approval_date DATETIME,
    status ENUM('Draft', 'Active', 'Archived', 'Superseded') DEFAULT 'Draft',
    version VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_effective_date (effective_date)
);

-- Compliance Tracking
CREATE TABLE IF NOT EXISTS compliance_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    compliance_item VARCHAR(255) NOT NULL,
    compliance_type ENUM('Regulatory', 'Accreditation', 'Internal Policy', 'Safety', 'Data Protection', 'Other'),
    description TEXT,
    requirement TEXT,
    responsible_person INT,
    target_date DATE,
    actual_date DATE,
    compliance_status ENUM('Compliant', 'Non-Compliant', 'In Progress', 'N/A') DEFAULT 'In Progress',
    evidence_document VARCHAR(255),
    remarks TEXT,
    reviewed_by INT,
    review_date DATETIME,
    FOREIGN KEY (responsible_person) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_responsible (responsible_person),
    INDEX idx_status (compliance_status)
);

-- ===============================================
-- MODULE 6: MOODLE INTEGRATION & MANAGEMENT (4 tables)
-- ===============================================

-- Moodle Sync Log (Tracks all Moodle sync operations)
CREATE TABLE IF NOT EXISTS moodle_sync_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sync_type ENUM('Course Sync', 'Enrollment Sync', 'Grade Sync', 'User Sync', 'Full Sync'),
    sync_start_time DATETIME,
    sync_end_time DATETIME,
    total_records INT DEFAULT 0,
    successful_records INT DEFAULT 0,
    failed_records INT DEFAULT 0,
    sync_status ENUM('Pending', 'In Progress', 'Completed', 'Failed', 'Partial') DEFAULT 'Pending',
    error_message TEXT,
    sync_details JSON,
    initiated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (initiated_by) REFERENCES users(id),
    INDEX idx_sync_type (sync_type),
    INDEX idx_status (sync_status),
    INDEX idx_created (created_at)
);

-- Course Enrollment Mapping (Moodle enrollment tracking)
CREATE TABLE IF NOT EXISTS course_enrollment_mapping (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT NOT NULL,
    moodle_enrollment_id INT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    moodle_course_id INT,
    enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    enrollment_status ENUM('Pending', 'Enrolled', 'Suspended', 'Completed') DEFAULT 'Pending',
    last_sync_date DATETIME,
    sync_status ENUM('Synced', 'Pending', 'Failed') DEFAULT 'Pending',
    sync_error TEXT,
    FOREIGN KEY (registration_id) REFERENCES course_registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    INDEX idx_registration_id (registration_id),
    INDEX idx_student_id (student_id),
    INDEX idx_moodle_enrollment_id (moodle_enrollment_id),
    UNIQUE KEY unique_enrollment (student_id, course_id)
);

-- Grade Sync Configuration & Tracking
CREATE TABLE IF NOT EXISTS grade_sync_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_mapping_id INT NOT NULL,
    grade_sync_enabled BOOLEAN DEFAULT TRUE,
    sync_interval_hours INT DEFAULT 24,
    last_sync_date DATETIME,
    passing_grade DECIMAL(5,2),
    grade_scale VARCHAR(50),
    sync_method ENUM('Automatic', 'Manual', 'Hybrid') DEFAULT 'Automatic',
    next_sync_scheduled DATETIME,
    failed_syncs INT DEFAULT 0,
    last_error_message TEXT,
    config_status ENUM('Active', 'Inactive', 'Error') DEFAULT 'Active',
    FOREIGN KEY (course_mapping_id) REFERENCES moodle_course_mapping(id) ON DELETE CASCADE,
    INDEX idx_course_mapping_id (course_mapping_id),
    INDEX idx_status (config_status)
);

-- Moodle Analytics & Reporting
CREATE TABLE IF NOT EXISTS moodle_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_date DATE,
    course_id INT,
    moodle_course_id INT,
    total_enrolled INT DEFAULT 0,
    active_participants INT DEFAULT 0,
    inactive_participants INT DEFAULT 0,
    average_grade DECIMAL(5,2),
    completion_rate DECIMAL(5,2),
    assignment_submission_rate DECIMAL(5,2),
    forum_participation_rate DECIMAL(5,2),
    student_engagement_score DECIMAL(5,2),
    high_performers INT DEFAULT 0,
    at_risk_students INT DEFAULT 0,
    completion_date DATETIME,
    analytics_status ENUM('Pending', 'Completed', 'Error') DEFAULT 'Pending',
    insights TEXT,
    generated_by INT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (generated_by) REFERENCES users(id),
    INDEX idx_course_id (course_id),
    INDEX idx_report_date (report_date),
    UNIQUE KEY unique_report (course_id, report_date)
);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- Additional performance indexes
CREATE INDEX idx_student_applications_course ON student_applications(course_id);
CREATE INDEX idx_course_registrations_course ON course_registrations(course_id);
CREATE INDEX idx_faculty_onboarding_status ON faculty_onboarding(onboarding_status);
CREATE INDEX idx_audit_log_timestamp ON audit_log(created_at);
CREATE INDEX idx_moodle_sync_log_timestamp ON moodle_sync_log(created_at);
CREATE INDEX idx_partner_subscriptions_date ON partner_subscriptions(subscription_start_date);

-- ===============================================
-- DEFAULT DATA
-- ===============================================

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
('Super Admin', 'Full system access to all modules'),
('LMS Manager', 'Manages course delivery, assessments, grading'),
('Partners Manager', 'Manages partner registrations, visits, compliance'),
('Admissions Officer', 'Manages student applications, admissions, onboarding'),
('Faculty & HR Manager', 'Manages faculty recruitment, HR records')
ON DUPLICATE KEY UPDATE role_name=VALUES(role_name);

-- ===============================================
-- SCHEMA COMPLETE
-- ===============================================
-- Total Tables: 37
-- Total Entities: 6 Modules
-- Created: January 28, 2026
-- Status: Ready for deployment
-- ===============================================
