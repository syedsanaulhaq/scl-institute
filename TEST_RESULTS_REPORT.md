# SCL Institute — API Test Results Report

**Test Environment:** `http://localhost:4001/api`  
**Test Date:** 2026-05-19  
**Test Runner:** `test-runner.js` (72 automated API tests)  
**Overall Result: ✅ 71 PASS | ⚠️ 1 PARTIAL | ❌ 0 FAIL**

---

## Summary Table

| # | Module | Tests | Result |
|---|--------|-------|--------|
| 1 | Authentication & Access Control | 10/10 | ✅ PASS |
| 2 | Student Portal | 10/10 | ✅ PASS |
| 3 | Faculty Portal | 7/7 | ✅ PASS |
| 4 | College Admin Portal | 5/5 | ✅ PASS |
| 5 | Manager / System Admin Portal | 12/12 | ✅ PASS |
| 6 | Course Lifecycle (Accreditations, Inductions & Visits) | 9/9 | ✅ PASS |
| 7 | Fees & Finance | 2/2 | ✅ PASS |
| 8 | Moodle LMS Integration | 5/5 | ✅ PASS |
| 9 | Support & Compliance | 8/8 | ✅ PASS |
| CRUD | Create / Update Operations | 3/4 | ⚠️ PARTIAL |
| **TOTAL** | | **71/72** | **✅** |

---

## Module 1 — Authentication & Access Control ✅

| Test | Method | Endpoint | Status | Result |
|------|--------|----------|--------|--------|
| Backend health | GET | /health | 200 | ✅ PASS |
| DB health | GET | /health/db | 200 | ✅ PASS |
| Manager login | POST | /login | 200 | ✅ PASS |
| CollegeAdmin login | POST | /login | 200 | ✅ PASS |
| Faculty login | POST | /login | 200 | ✅ PASS |
| Student login | POST | /login | 200 | ✅ PASS |
| Invalid login blocked | POST | /login | 401 | ✅ PASS |
| Session verify (v1) | POST | /v1/auth/verify | 200 | ✅ PASS |
| Admin users list | GET | /admin/users | 200 | ✅ PASS |
| Role privileges | GET | /admin/role-privileges | 200 | ✅ PASS |

---

## Module 2 — Student Portal ✅

| Test | Method | Endpoint | Status | Result |
|------|--------|----------|--------|--------|
| Student applications list | GET | /students/applications | 200 | ✅ PASS |
| Student application detail | GET | /students/applications/11 | 200 | ✅ PASS |
| Student application review | GET | /students/applications/11/review | 200 | ✅ PASS |
| Student fees | GET | /induction-driven/student-fees | 200 | ✅ PASS |
| Notifications for student | GET | /notifications/user/student@test.scl | 200 | ✅ PASS |
| Unread notification count | GET | /notifications/unread-count/student@test.scl | 200 | ✅ PASS |
| Support admin requests | GET | /support/admin/requests | 200 | ✅ PASS |
| Moodle my-courses (student) | GET | /students/my-moodle-courses | 200 | ✅ PASS |
| Course inductions | GET | /course-inductions | 200 | ✅ PASS |
| Public programmes | GET | /public/programs | 200 | ✅ PASS |

---

## Module 3 — Faculty Portal ✅

| Test | Method | Endpoint | Status | Result |
|------|--------|----------|--------|--------|
| Teacher courses | GET | /students/teacher-courses | 200 | ✅ PASS |
| Teacher cohort info | GET | /students/teacher-cohort-info | 200 | ✅ PASS |
| Teacher announcements | GET | /students/teacher-announcements | 200 | ✅ PASS |
| Teacher notifications | GET | /students/teacher-notifications | 200 | ✅ PASS |
| Teacher management (admin) | GET | /students/admin/teachers | 200 | ✅ PASS |
| Moodle admin courses | GET | /students/admin/moodle-courses | 200 | ✅ PASS |
| Cohort intakes (admin) | GET | /students/admin/cohort-intakes | 200 | ✅ PASS |

---

## Module 4 — College Admin Portal ✅

| Test | Method | Endpoint | Status | Result |
|------|--------|----------|--------|--------|
| Applications list | GET | /admin/applications | 200 | ✅ PASS |
| LMS enrolments | GET | /admin/lms-enrolments | 200 | ✅ PASS |
| Student programmes | GET | /admin/student-programmes | 200 | ✅ PASS |
| Programme intakes | GET | /students/programme-intakes | 200 | ✅ PASS |
| Support admin requests | GET | /support/admin/requests | 200 | ✅ PASS |

---

## Module 5 — Manager / System Admin Portal ✅

| Test | Method | Endpoint | Status | Result |
|------|--------|----------|--------|--------|
| Admin dashboard stats | GET | /admin/dashboard-stats | 200 | ✅ PASS |
| Admin overview stats | GET | /admin/overview-stats | 200 | ✅ PASS |
| Users by role | GET | /admin/users-by-role | 200 | ✅ PASS |
| All users | GET | /admin/users | 200 | ✅ PASS |
| Role privileges | GET | /admin/role-privileges | 200 | ✅ PASS |
| All applications | GET | /admin/applications | 200 | ✅ PASS |
| All enquiries | GET | /admin/enquiries | 200 | ✅ PASS |
| Vendor management | GET | /vendors | 200 | ✅ PASS |
| Facility management | GET | /facility-management/buildings | 200 | ✅ PASS |
| Deferral requests | GET | /deferral-requests | 200 | ✅ PASS |
| Complaints & appeals | GET | /complaints-appeals | 200 | ✅ PASS |
| Announcements | GET | /notifications/announcements | 200 | ✅ PASS |

---

## Module 6 — Course Lifecycle (Accreditations, Inductions & Visits) ✅

| Test | Method | Endpoint | Status | Result |
|------|--------|----------|--------|--------|
| Courses list | GET | /students/courses | 200 | ✅ PASS |
| Programmes list | GET | /students/programmes | 200 | ✅ PASS |
| Accreditations list | GET | /accreditations | 200 | ✅ PASS |
| Course visits list | GET | /course-visits | 200 | ✅ PASS |
| Course inductions list | GET | /course-inductions | 200 | ✅ PASS |
| Induction requirements | GET | /induction-requirements/requirements/1 | 200 | ✅ PASS |
| Induction driven fees | GET | /induction-driven/student-fees | 200 | ✅ PASS |
| Programme intakes | GET | /students/programme-intakes | 200 | ✅ PASS |
| Academic misconduct | GET | /academic-misconduct | 200 | ✅ PASS |

---

## Module 7 — Fees & Finance ✅

| Test | Method | Endpoint | Status | Result |
|------|--------|----------|--------|--------|
| Student fees (admin) | GET | /induction-driven/student-fees | 200 | ✅ PASS |
| Student fees (student) | GET | /induction-driven/student-fees | 200 | ✅ PASS |

---

## Module 8 — Moodle LMS Integration ✅

| Test | Method | Endpoint | Status | Result |
|------|--------|----------|--------|--------|
| SSO token generate | POST | /sso/generate | 200 | ✅ PASS |
| SSO verify (invalid token) | POST | /sso/verify | 400 | ✅ PASS |
| Moodle my courses | GET | /students/my-moodle-courses | 200 | ✅ PASS |
| Moodle admin courses | GET | /students/admin/moodle-courses | 200 | ✅ PASS |
| Session verify | POST | /v1/auth/verify | 200 | ✅ PASS |

---

## Module 9 — Support & Compliance ✅

| Test | Method | Endpoint | Status | Result |
|------|--------|----------|--------|--------|
| Support admin requests | GET | /support/admin/requests | 200 | ✅ PASS |
| Complaints (student) | GET | /support/complaints/5 | 200 | ✅ PASS |
| Disability requests | GET | /support/disability/5 | 200 | ✅ PASS |
| Safeguarding (student) | GET | /support/safeguarding/5 | 200 | ✅ PASS |
| Complaints & appeals | GET | /complaints-appeals | 200 | ✅ PASS |
| Academic misconduct | GET | /academic-misconduct | 200 | ✅ PASS |
| Student engagement | GET | /student-engagement | 200 | ✅ PASS |
| Inductions list | GET | /inductions | 200 | ✅ PASS |

---

## CRUD Operations ⚠️ PARTIAL

| Test | Method | Endpoint | Status | Result | Notes |
|------|--------|----------|--------|--------|-------|
| Create announcement | POST | /notifications/announcements | 200 | ✅ PASS | |
| Create support request | POST | /support/requests | 200 | ✅ PASS | |
| Create course visit | POST | /course-visits | 403 | ⚠️ PARTIAL | Business rule: accreditation must be completed first |
| Create accreditation | POST | /accreditations | 201 | ✅ PASS | |

> **Note on course-visit POST 403:** This is expected business logic. The system enforces that a course visit can only be created after its associated accreditation is in `completed` status. This is not a bug — the endpoint works correctly and enforces the intended workflow constraint.

---

## Bugs Fixed During Testing

| # | Bug | Fix Applied |
|---|-----|-------------|
| 1 | `student_applications` missing `programme_type_name` column | Added VARCHAR column via ALTER TABLE |
| 2 | `student_applications` missing `intake_id` column | Added INT column via ALTER TABLE |
| 3 | `student_applications.course_code` collation mismatch with `courses.course_code` | ALTER COLUMN to utf8mb4_0900_ai_ci |
| 4 | `courses` table missing columns (course_title, course_type, etc.) | Recreated table with full schema, seeded 4 test courses |
| 5 | `enquiries` table not found | Created table with full schema |
| 6 | `application_reviews` missing `reviewed_at` column | Added TIMESTAMP column |
| 7 | `application_documents` table not found | Created table with full schema |
| 8 | `course_inductions` missing `course_id`, `moodle_course_id` columns | Added columns via ALTER TABLE |
| 9 | `induction_requirements` route using `course_id` (wrong column name) | Fixed to `induction_id` in route query |
| 10 | `admin/dashboard-stats` using wrong table names | Updated SQL to use `student_applications` and `courses` |
| 11 | `public/programs` using wrong table name `programs` | Updated SQL to use `courses` with aliases |
| 12 | 7 route modules not mounted in `index.js` | Added imports + `app.use` for deferral-requests, complaints-appeals, academic-misconduct, student-engagement, inductions, induction-requirements, moodle |

---

## Test Credentials Used

| Role | Email | Token |
|------|-------|-------|
| Manager (superadmin) | superadmin@test.scl | Bearer MTpzdXBlcmFkbWluQHRlc3Quc2Ns |
| CollegeAdmin | collegeadmin@test.scl | Bearer Mzpjb2xsZWdlYWRtaW5AdGVzdC5zY2w= |
| Faculty | faculty@test.scl | Bearer NDpmYWN1bHR5QHRlc3Quc2Ns |
| Student | student@test.scl | Bearer NTpzdHVkZW50QHRlc3Quc2Ns |
