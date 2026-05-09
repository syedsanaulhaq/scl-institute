const fs = require('fs');
const path = require('path');

const ss = 'Client-Overview-Screenshots/screenshots';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SCL Institute – System Overview</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fa; color: #1a1a2e; }

  /* ── NAV ── */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: #1a1a2e; display: flex; align-items: center; gap: 8px;
    padding: 12px 24px; box-shadow: 0 2px 10px rgba(0,0,0,.35);
  }
  nav .logo { font-size: 1.1rem; font-weight: 700; color: #fff; margin-right: auto; letter-spacing: 1px; }
  nav a {
    text-decoration: none; color: #cdd4e0; font-size: .82rem; font-weight: 600;
    padding: 7px 16px; border-radius: 20px; transition: all .2s;
  }
  nav a:hover, nav a.active { background: rgba(255,255,255,.15); color: #fff; }
  nav a.live-btn { background: #3b82f6; color: #fff; }
  nav a.live-btn:hover { background: #2563eb; }

  /* ── HERO ── */
  .hero {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    color: white; text-align: center; padding: 64px 24px 48px;
  }
  .hero h1 { font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 800; letter-spacing: -1px; }
  .hero p { font-size: 1.1rem; color: #94a3b8; margin-top: 12px; max-width: 600px; margin-inline: auto; }
  .stats-row {
    display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;
    margin-top: 40px; max-width: 900px; margin-inline: auto;
  }
  .stat-card {
    background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
    border-radius: 12px; padding: 18px 28px; text-align: center; min-width: 130px;
  }
  .stat-card .num { font-size: 2rem; font-weight: 800; color: #60a5fa; }
  .stat-card .lbl { font-size: .75rem; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: .5px; }

  /* ── SECTIONS ── */
  section { padding: 60px 24px; max-width: 1100px; margin: 0 auto; }
  .role-header {
    border-radius: 16px; padding: 36px 40px; margin-bottom: 40px;
    display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
  }
  .rh-student  { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
  .rh-teacher  { background: linear-gradient(135deg, #065f46, #059669); }
  .rh-manager  { background: linear-gradient(135deg, #92400e, #d97706); }
  .rh-admin    { background: linear-gradient(135deg, #5b21b6, #7c3aed); }
  .role-icon { font-size: 3rem; }
  .role-info h2 { font-size: 1.8rem; font-weight: 800; color: #fff; }
  .role-info p  { color: rgba(255,255,255,.8); font-size: 1rem; margin-top: 6px; }
  .cred-card {
    background: rgba(0,0,0,.25); border-radius: 10px; padding: 12px 18px; margin-top: 14px;
    color: #fff; font-size: .83rem; line-height: 1.8;
  }
  .cred-card strong { color: #fde68a; }
  .cred-card code { background: rgba(255,255,255,.15); padding: 2px 6px; border-radius: 4px; font-family: monospace; }

  /* ── SCREENSHOTS ── */
  .ss-grid {
    display: grid; gap: 16px; margin-bottom: 36px;
  }
  .ss-grid.ss-1 { grid-template-columns: 1fr; }
  .ss-grid.ss-2 { grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); }
  .ss-grid.ss-3 { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  .ss-item { position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.15); }
  .ss-item img { width: 100%; height: auto; display: block; transition: transform .3s; }
  .ss-item:hover img { transform: scale(1.02); }
  .ss-caption {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,.7));
    color: #fff; font-size: .75rem; font-weight: 600; padding: 20px 12px 10px;
    text-align: center; letter-spacing: .5px; text-transform: uppercase;
  }

  /* ── JOURNEY STEPS ── */
  .steps-section h3 { font-size: 1.1rem; font-weight: 700; color: #374151; margin-bottom: 16px; text-transform: uppercase; letter-spacing: .5px; }
  .steps-list { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 36px; }
  .step {
    display: flex; align-items: flex-start; gap: 12px;
    background: #fff; border-radius: 10px; padding: 14px 16px;
    flex: 1 1 220px; box-shadow: 0 2px 8px rgba(0,0,0,.06);
    border-left: 4px solid #e5e7eb;
  }
  .step.blue  { border-left-color: #3b82f6; }
  .step.green { border-left-color: #10b981; }
  .step.amber { border-left-color: #f59e0b; }
  .step.purple{ border-left-color: #8b5cf6; }
  .step-num { font-size: 1.2rem; font-weight: 800; min-width: 28px; }
  .step-txt h4 { font-size: .88rem; font-weight: 700; color: #1f2937; }
  .step-txt p  { font-size: .78rem; color: #6b7280; margin-top: 2px; }

  /* ── FEATURE CARDS ── */
  .feat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 40px; }
  .feat-card {
    background: #fff; border-radius: 10px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,.06);
    border-top: 3px solid #e5e7eb; transition: transform .2s, box-shadow .2s;
  }
  .feat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.1); }
  .feat-card.blue   { border-top-color: #3b82f6; }
  .feat-card.green  { border-top-color: #10b981; }
  .feat-card.amber  { border-top-color: #f59e0b; }
  .feat-card.purple { border-top-color: #8b5cf6; }
  .feat-card .icon  { font-size: 1.5rem; margin-bottom: 8px; }
  .feat-card h4 { font-size: .88rem; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
  .feat-card p  { font-size: .76rem; color: #6b7280; }

  /* ── DIVIDER ── */
  .section-divider { border: none; border-top: 2px solid #e5e7eb; margin: 40px 0; }

  /* ── ACCESS TABLE ── */
  .access-table-wrap { overflow-x: auto; margin-bottom: 40px; }
  table { width: 100%; border-collapse: collapse; font-size: .82rem; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  th { background: #1a1a2e; color: #fff; padding: 12px 14px; text-align: left; font-weight: 600; }
  td { padding: 10px 14px; border-bottom: 1px solid #f3f4f6; }
  tr:last-child td { border-bottom: none; }
  .check { color: #10b981; font-size: 1.1rem; }
  .cross { color: #ef4444; font-size: 1.1rem; }

  /* ── FOOTER ── */
  footer { background: #1a1a2e; color: #94a3b8; text-align: center; padding: 32px; font-size: .82rem; }
  footer strong { color: #fff; }

  /* ── SYS INFO ── */
  .sys-info { background: #1a1a2e; padding: 48px 24px; }
  .sys-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; max-width: 900px; margin: 0 auto; }
  .sys-card { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: 20px 28px; color: #fff; min-width: 220px; flex: 1 1 220px; }
  .sys-card h4 { font-size: .75rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
  .sys-card p  { font-size: .9rem; font-weight: 600; }
  .sys-card .tag { display: inline-block; background: rgba(59,130,246,.3); border-radius: 20px; padding: 2px 10px; font-size: .72rem; margin-top: 6px; }
</style>
</head>
<body>

<!-- ══ NAV ══ -->
<nav>
  <span class="logo">🎓 SCL Institute</span>
  <a href="#student">Student</a>
  <a href="#teacher">Teacher</a>
  <a href="#manager">Manager</a>
  <a href="#admin">College Admin</a>
  <a href="https://system.sclsandbox.xyz/" target="_blank" class="live-btn">↗ Open Live Site</a>
</nav>

<!-- ══ HERO ══ -->
<div class="hero">
  <h1>SCL Institute — System Overview</h1>
  <p>A complete walkthrough of the SCL Institute management portal, showing each role's experience with real screenshots.</p>
  <div class="stats-row">
    <div class="stat-card"><div class="num">38</div><div class="lbl">Total Users</div></div>
    <div class="stat-card"><div class="num">12</div><div class="lbl">Applications</div></div>
    <div class="stat-card"><div class="num">70</div><div class="lbl">Moodle Courses</div></div>
    <div class="stat-card"><div class="num">9</div><div class="lbl">Intakes</div></div>
    <div class="stat-card"><div class="num">55</div><div class="lbl">Lifecycle Items</div></div>
    <div class="stat-card"><div class="num">93</div><div class="lbl">LMS Enrolments</div></div>
  </div>
</div>

<!-- ══ LOGIN SCREEN ══ -->
<section style="padding: 48px 24px; max-width: 1100px; margin: 0 auto;">
  <h3 style="font-size:1.1rem;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px;">Login Screen</h3>
  <div class="ss-grid ss-1">
    <div class="ss-item" style="max-width: 800px; margin: 0 auto;">
      <img src="${ss}/s00-login-screen.jpg" alt="SCL Login Screen" loading="lazy">
      <div class="ss-caption">SCL Institute Login — system.sclsandbox.xyz</div>
    </div>
  </div>
</section>

<!-- ══════════════════════════════════════════════════════════ -->
<!--                     STUDENT SECTION                        -->
<!-- ══════════════════════════════════════════════════════════ -->
<section id="student">
  <div class="role-header rh-student">
    <div class="role-icon">🎓</div>
    <div class="role-info">
      <h2>Student</h2>
      <p>Track your academic journey — courses, grades, announcements and Moodle LMS access.</p>
      <div class="cred-card">
        <strong>Demo Account:</strong><br>
        Email: <code>sarah.johnson.lm@example.com</code><br>
        Password: <code>089f4607e213</code>
      </div>
    </div>
  </div>

  <div class="ss-grid ss-2">
    <div class="ss-item">
      <img src="${ss}/s01-student-portal.png" alt="Student Portal Dashboard" loading="lazy">
      <div class="ss-caption">Student Dashboard — Sarah Johnson</div>
    </div>
    <div class="ss-item">
      <img src="${ss}/s02-student-grades.png" alt="Student Grades" loading="lazy">
      <div class="ss-caption">Grades &amp; Academic Progress</div>
    </div>
  </div>

  <div class="steps-section">
    <h3>Student Journey</h3>
    <div class="steps-list">
      <div class="step blue"><div class="step-num">1</div><div class="step-txt"><h4>Login</h4><p>Enter email &amp; password at system.sclsandbox.xyz</p></div></div>
      <div class="step blue"><div class="step-num">2</div><div class="step-txt"><h4>Dashboard</h4><p>View active courses, upcoming events &amp; announcements</p></div></div>
      <div class="step blue"><div class="step-num">3</div><div class="step-txt"><h4>My Courses</h4><p>Browse enrolled courses and programme details</p></div></div>
      <div class="step blue"><div class="step-num">4</div><div class="step-txt"><h4>Grades</h4><p>View assessment grades and academic progress</p></div></div>
      <div class="step blue"><div class="step-num">5</div><div class="step-txt"><h4>Moodle LMS</h4><p>Single-click SSO into Moodle for course content</p></div></div>
    </div>
  </div>

  <div class="feat-grid">
    <div class="feat-card blue"><div class="icon">📚</div><h4>My Courses</h4><p>View enrolled courses, credit hours and progress</p></div>
    <div class="feat-card blue"><div class="icon">📊</div><h4>Grades &amp; Progress</h4><p>See assessment grades, transcripts and overall GPA</p></div>
    <div class="feat-card blue"><div class="icon">📅</div><h4>Upcoming Events</h4><p>Track deadlines, inductions and academic events</p></div>
    <div class="feat-card blue"><div class="icon">🔔</div><h4>Notifications</h4><p>Real-time announcements from admin &amp; tutors</p></div>
    <div class="feat-card blue"><div class="icon">🎓</div><h4>Moodle LMS</h4><p>One-click SSO access to course materials &amp; quizzes</p></div>
    <div class="feat-card blue"><div class="icon">👤</div><h4>Profile Settings</h4><p>Update personal details and password</p></div>
  </div>
</section>

<!-- ══════════════════════════════════════════════════════════ -->
<!--                     TEACHER SECTION                        -->
<!-- ══════════════════════════════════════════════════════════ -->
<section id="teacher" style="background: #f0fdf4; padding: 60px 24px;">
<div style="max-width: 1100px; margin: 0 auto;">
  <div class="role-header rh-teacher">
    <div class="role-icon">👨‍🏫</div>
    <div class="role-info">
      <h2>Teacher / Editing Teacher</h2>
      <p>Manage your teaching programme, assessments and access the Moodle LMS for course delivery.</p>
      <div class="cred-card">
        <strong>Demo Account:</strong><br>
        Email: <code>test@teacher.com</code><br>
        Password: <code>password123</code>
      </div>
    </div>
  </div>

  <div class="ss-grid ss-2">
    <div class="ss-item">
      <img src="${ss}/s11-teacher-portal.png" alt="Teacher Dashboard" loading="lazy">
      <div class="ss-caption">Teacher Dashboard — test teacher (EDITINGTEACHER)</div>
    </div>
    <div class="ss-item">
      <img src="${ss}/s13-teacher-programme.png" alt="My Teaching Programme" loading="lazy">
      <div class="ss-caption">My Teaching Programme — Assigned Courses</div>
    </div>
  </div>

  <div class="steps-section">
    <h3>Teacher Workflow</h3>
    <div class="steps-list">
      <div class="step green"><div class="step-num">1</div><div class="step-txt"><h4>Login</h4><p>Sign in as EDITINGTEACHER at system.sclsandbox.xyz</p></div></div>
      <div class="step green"><div class="step-num">2</div><div class="step-txt"><h4>Dashboard</h4><p>View notifications and open Moodle LMS</p></div></div>
      <div class="step green"><div class="step-num">3</div><div class="step-txt"><h4>My Teaching Programme</h4><p>See all assigned courses and unit details</p></div></div>
      <div class="step green"><div class="step-num">4</div><div class="step-txt"><h4>Moodle LMS</h4><p>Click "View in Moodle" for direct course access</p></div></div>
      <div class="step green"><div class="step-num">5</div><div class="step-txt"><h4>Assessments &amp; Reports</h4><p>Track student submissions and generate reports</p></div></div>
    </div>
  </div>

  <div class="feat-grid">
    <div class="feat-card green"><div class="icon">📖</div><h4>My Teaching Programme</h4><p>All assigned courses with unit codes &amp; levels</p></div>
    <div class="feat-card green"><div class="icon">🖥️</div><h4>Open Moodle LMS</h4><p>Single-sign-on to Moodle to manage course content</p></div>
    <div class="feat-card green"><div class="icon">📝</div><h4>Assessments</h4><p>View and manage student assessments</p></div>
    <div class="feat-card green"><div class="icon">📈</div><h4>Reports</h4><p>Generate teaching and progress reports</p></div>
    <div class="feat-card green"><div class="icon">🔔</div><h4>Notifications</h4><p>Stay updated with system announcements</p></div>
    <div class="feat-card green"><div class="icon">⚙️</div><h4>Profile Settings</h4><p>Manage account and preferences</p></div>
  </div>
</div>
</section>

<!-- ══════════════════════════════════════════════════════════ -->
<!--                     MANAGER SECTION                        -->
<!-- ══════════════════════════════════════════════════════════ -->
<section id="manager">
  <div class="role-header rh-manager">
    <div class="role-icon">🏛️</div>
    <div class="role-info">
      <h2>Manager / System Administrator</h2>
      <p>Full system oversight — users, applications, course lifecycle, LMS enrolments and programme intakes.</p>
      <div class="cred-card">
        <strong>Demo Account:</strong><br>
        Email: <code>admin@sclsandbox.xyz</code><br>
        Password: <code>password123</code>
      </div>
    </div>
  </div>

  <div class="ss-grid ss-2">
    <div class="ss-item">
      <img src="${ss}/s21-manager-dashboard.png" alt="Admin Overview Dashboard" loading="lazy">
      <div class="ss-caption">Admin Overview — System Administrator (MANAGER)</div>
    </div>
    <div class="ss-item">
      <img src="${ss}/s22-manager-applications.jpg" alt="Student Applications" loading="lazy">
      <div class="ss-caption">Student Applications — 12 Total, 10 Accepted</div>
    </div>
  </div>

  <div class="ss-grid ss-3">
    <div class="ss-item">
      <img src="${ss}/s23-manager-intakes.jpg" alt="Programme Intakes" loading="lazy">
      <div class="ss-caption">Programme Intakes — 9 Active</div>
    </div>
    <div class="ss-item">
      <img src="${ss}/s24-manager-lms.jpg" alt="LMS Enrolments" loading="lazy">
      <div class="ss-caption">LMS Enrolments — 93 Students Enrolled</div>
    </div>
    <div class="ss-item">
      <img src="${ss}/s25-manager-lifecycle.jpg" alt="Course Lifecycle" loading="lazy">
      <div class="ss-caption">Course Lifecycle Dashboard — 55 Courses</div>
    </div>
  </div>

  <div class="steps-section">
    <h3>Manager Workflow</h3>
    <div class="steps-list">
      <div class="step amber"><div class="step-num">1</div><div class="step-txt"><h4>Admin Overview</h4><p>See all KPIs: users, apps, courses, enrolments at a glance</p></div></div>
      <div class="step amber"><div class="step-num">2</div><div class="step-txt"><h4>Review Applications</h4><p>Accept, reject or conditionally approve student applications</p></div></div>
      <div class="step amber"><div class="step-num">3</div><div class="step-txt"><h4>Programme Intakes</h4><p>Create and manage cohort intakes with start/end dates</p></div></div>
      <div class="step amber"><div class="step-num">4</div><div class="step-txt"><h4>LMS Enrolments</h4><p>Sync students to Moodle courses automatically</p></div></div>
      <div class="step amber"><div class="step-num">5</div><div class="step-txt"><h4>Course Lifecycle</h4><p>Track accreditation, visits, inductions per course</p></div></div>
    </div>
  </div>

  <div class="feat-grid">
    <div class="feat-card amber"><div class="icon">📊</div><h4>Admin Overview</h4><p>Real-time KPI dashboard with charts and trends</p></div>
    <div class="feat-card amber"><div class="icon">📋</div><h4>Student Applications</h4><p>Full admissions pipeline with status management</p></div>
    <div class="feat-card amber"><div class="icon">📅</div><h4>Programme Intakes</h4><p>Create cohorts with registration windows</p></div>
    <div class="feat-card amber"><div class="icon">🖥️</div><h4>LMS Enrolments</h4><p>Map students to Moodle courses in bulk</p></div>
    <div class="feat-card amber"><div class="icon">🔄</div><h4>Course Lifecycle</h4><p>Track accreditation, visit &amp; induction status</p></div>
    <div class="feat-card amber"><div class="icon">👥</div><h4>User &amp; Role Management</h4><p>Assign roles, manage all system users</p></div>
  </div>
</section>

<!-- ══════════════════════════════════════════════════════════ -->
<!--                  COLLEGE ADMIN SECTION                     -->
<!-- ══════════════════════════════════════════════════════════ -->
<section id="admin" style="background: #faf5ff; padding: 60px 24px;">
<div style="max-width: 1100px; margin: 0 auto;">
  <div class="role-header rh-admin">
    <div class="role-icon">🏫</div>
    <div class="role-info">
      <h2>College Admin</h2>
      <p>Manage student admissions, track student records and oversee programme intakes from the college perspective.</p>
      <div class="cred-card">
        <strong>Demo Account:</strong><br>
        Email: <code>collegeadmin@scl.com</code><br>
        Password: <code>password</code>
      </div>
    </div>
  </div>

  <div class="ss-grid ss-2">
    <div class="ss-item">
      <img src="${ss}/s31-cadmin-dashboard.jpg" alt="College Admin Overview" loading="lazy">
      <div class="ss-caption">College Admin Overview — Admissions Dashboard</div>
    </div>
    <div class="ss-item">
      <img src="${ss}/s32-cadmin-applications.jpg" alt="Student Applications" loading="lazy">
      <div class="ss-caption">Student Applications — Admissions Pipeline</div>
    </div>
  </div>

  <div class="ss-grid ss-1">
    <div class="ss-item" style="max-width: 700px; margin: 0 auto;">
      <img src="${ss}/s33-cadmin-students.jpg" alt="Student Management" loading="lazy">
      <div class="ss-caption">Student Management — Student Records</div>
    </div>
  </div>

  <div class="steps-section">
    <h3>College Admin Tasks</h3>
    <div class="steps-list">
      <div class="step purple"><div class="step-num">1</div><div class="step-txt"><h4>Admissions Overview</h4><p>See total applications, accepted, pending and rejected</p></div></div>
      <div class="step purple"><div class="step-num">2</div><div class="step-txt"><h4>Student Applications</h4><p>Review incoming applications and update status</p></div></div>
      <div class="step purple"><div class="step-num">3</div><div class="step-txt"><h4>Student Management</h4><p>View and manage student records and profiles</p></div></div>
      <div class="step purple"><div class="step-num">4</div><div class="step-txt"><h4>Programme Intakes</h4><p>View intake schedules and enrolment counts</p></div></div>
    </div>
  </div>

  <div class="feat-grid">
    <div class="feat-card purple"><div class="icon">📊</div><h4>Admissions Overview</h4><p>KPIs: total apps, accepted, pending, rejected</p></div>
    <div class="feat-card purple"><div class="icon">📋</div><h4>Student Applications</h4><p>Review and process admission requests</p></div>
    <div class="feat-card purple"><div class="icon">👩‍🎓</div><h4>Student Management</h4><p>Manage enrolled student profiles and records</p></div>
    <div class="feat-card purple"><div class="icon">📅</div><h4>Programme Intakes</h4><p>View intake windows and student counts</p></div>
    <div class="feat-card purple"><div class="icon">🖥️</div><h4>LMS Enrolments</h4><p>Check student Moodle course enrolments</p></div>
    <div class="feat-card purple"><div class="icon">📬</div><h4>Support Inbox</h4><p>Handle support queries from students</p></div>
  </div>

  <!-- ACCESS MATRIX -->
  <h3 style="font-size:1.1rem;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px;">Role Access Matrix</h3>
  <div class="access-table-wrap">
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Student</th>
          <th>Teacher</th>
          <th>Manager</th>
          <th>College Admin</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Student Portal / Dashboard</td><td class="check">✓</td><td class="check">✓</td><td class="cross">—</td><td class="cross">—</td></tr>
        <tr><td>My Grades &amp; Progress</td><td class="check">✓</td><td class="cross">—</td><td class="cross">—</td><td class="cross">—</td></tr>
        <tr><td>Teaching Programme</td><td class="cross">—</td><td class="check">✓</td><td class="cross">—</td><td class="cross">—</td></tr>
        <tr><td>Admin Overview Dashboard</td><td class="cross">—</td><td class="cross">—</td><td class="check">✓</td><td class="cross">—</td></tr>
        <tr><td>College Admin Overview</td><td class="cross">—</td><td class="cross">—</td><td class="cross">—</td><td class="check">✓</td></tr>
        <tr><td>Student Applications</td><td class="cross">—</td><td class="cross">—</td><td class="check">✓</td><td class="check">✓</td></tr>
        <tr><td>Programme Intakes</td><td class="cross">—</td><td class="cross">—</td><td class="check">✓</td><td class="check">✓</td></tr>
        <tr><td>LMS Enrolments</td><td class="cross">—</td><td class="cross">—</td><td class="check">✓</td><td class="check">✓</td></tr>
        <tr><td>Course Lifecycle</td><td class="cross">—</td><td class="cross">—</td><td class="check">✓</td><td class="cross">—</td></tr>
        <tr><td>Role Management</td><td class="cross">—</td><td class="cross">—</td><td class="check">✓</td><td class="cross">—</td></tr>
        <tr><td>Moodle LMS (SSO)</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td><td class="cross">—</td></tr>
        <tr><td>User Management</td><td class="cross">—</td><td class="cross">—</td><td class="check">✓</td><td class="cross">—</td></tr>
      </tbody>
    </table>
  </div>
</div>
</section>

<!-- ══ SYSTEM INFO ══ -->
<div class="sys-info">
  <div class="sys-grid">
    <div class="sys-card">
      <h4>Frontend</h4>
      <p>React 18 + Vite + Tailwind CSS</p>
      <span class="tag">system.sclsandbox.xyz</span>
    </div>
    <div class="sys-card">
      <h4>Backend</h4>
      <p>Node.js + Express + MySQL</p>
      <span class="tag">REST API</span>
    </div>
    <div class="sys-card">
      <h4>LMS</h4>
      <p>Moodle with SSO Integration</p>
      <span class="tag">moodle.sclsandbox.xyz</span>
    </div>
    <div class="sys-card">
      <h4>Deployment</h4>
      <p>Docker containers on VPS</p>
      <span class="tag">185.211.6.60</span>
    </div>
  </div>
</div>

<footer>
  <strong>Stratford College London — SCL Institute</strong><br>
  &copy; 2026 SCL Institute Global. All rights reserved. &nbsp;|&nbsp;
  <a href="https://system.sclsandbox.xyz/" target="_blank" style="color:#60a5fa;">system.sclsandbox.xyz</a>
</footer>

</body>
</html>`;

fs.writeFileSync(path.join('C:\\SCL System', 'scl-institute', 'SCL_COMPLETE_OVERVIEW.html'), html, 'utf8');
console.log('HTML written:', html.length, 'chars');
