/**
 * SCL Institute - Comprehensive Module Test Runner
 * Tests all backend API endpoints against the TEST environment (port 4001)
 * Based on Progress Report v2 module structure
 */

const http = require('http');

const BASE = 'http://localhost:4001/api';
let adminToken = null;
let studentToken = null;
let facultyToken = null;
let cadminToken = null;

const results = [];
let passed = 0, failed = 0, warned = 0;

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
function request(method, path, body, token) {
  return new Promise((resolve) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 4001,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (e) => resolve({ status: 0, body: e.message }));
    req.setTimeout(8000, () => { req.destroy(); resolve({ status: 0, body: 'TIMEOUT' }); });
    if (postData) req.write(postData);
    req.end();
  });
}

async function login(email, password) {
  const r = await request('POST', '/login', { email, password });
  if (r.status === 200) {
    const d = JSON.parse(r.body);
    if (d.success) return d.token;
  }
  return null;
}

// ─── Test helper ──────────────────────────────────────────────────────────────
// Pass token=false to explicitly make unauthenticated requests.
// Pass token=null to use the adminToken (default).
async function test(label, method, path, body, token, expectedStatus = 200, notes = '') {
  const effectiveToken = (token === false || token === 'NONE') ? null : (token || adminToken);
  const r = await request(method, path, body, effectiveToken);
  const ok = (r.status === expectedStatus) || (expectedStatus === 200 && r.status >= 200 && r.status < 300);
  const icon = ok ? '✅' : (r.status === 0 ? '❌' : '⚠️');
  const preview = r.body.replace(/\s+/g, ' ').substring(0, 100);
  const entry = `${icon} [${r.status}] ${method} ${path} — ${label}${notes ? ' ['+notes+']' : ''} | ${preview}`;

  if (ok) passed++; else if (r.status > 0) warned++; else failed++;
  results.push(entry);
  console.log(entry);
  return { ok, status: r.status, body: r.body };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function runTests() {
  console.log('='.repeat(70));
  console.log('  SCL INSTITUTE — FULL MODULE TEST SUITE');
  console.log(`  Target: ${BASE}`);
  console.log(`  Date:   ${new Date().toISOString()}`);
  console.log('='.repeat(70));

  // ── STEP 0: Get tokens ──────────────────────────────────────────────────────
  console.log('\n>>> ACQUIRING TOKENS');
  adminToken  = await login('superadmin@test.scl', 'test123');
  cadminToken = await login('collegeadmin@test.scl', 'test123');
  facultyToken= await login('faculty@test.scl', 'test123');
  studentToken= await login('student@test.scl', 'test123');

  console.log(`  Manager:      ${adminToken  ? '✅ token acquired' : '❌ login FAILED'}`);
  console.log(`  CollegeAdmin: ${cadminToken ? '✅ token acquired' : '❌ login FAILED'}`);
  console.log(`  Faculty:      ${facultyToken? '✅ token acquired' : '❌ login FAILED'}`);
  console.log(`  Student:      ${studentToken? '✅ token acquired' : '❌ login FAILED'}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE 1: AUTHENTICATION & ACCESS CONTROL
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70));
  console.log('MODULE 1: AUTHENTICATION & ACCESS CONTROL');
  console.log('─'.repeat(70));

  await test('Backend health',       'GET',  '/health',              null, false);
  await test('DB health',            'GET',  '/health/db',           null, false);
  await test('Manager login',        'POST', '/login',               {email:'superadmin@test.scl',password:'test123'}, false);
  await test('CollegeAdmin login',   'POST', '/login',               {email:'collegeadmin@test.scl',password:'test123'}, false);
  await test('Faculty login',        'POST', '/login',               {email:'faculty@test.scl',password:'test123'}, false);
  await test('Student login',        'POST', '/login',               {email:'student@test.scl',password:'test123'}, false);
  await test('Invalid login blocked','POST', '/login',               {email:'nobody@fake.com',password:'wrong'}, false, 401);
  await test('Session verify (v1)',       'POST', '/v1/auth/verify',         {token:'invalid'}, false, 200);
  await test('Admin users list',     'GET',  '/admin/users',         null, adminToken);
  await test('Role privileges',      'GET',  '/admin/role-privileges',null,adminToken);

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE 2: STUDENT PORTAL (18 features)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70));
  console.log('MODULE 2: STUDENT PORTAL');
  console.log('─'.repeat(70));

  await test('Student applications list',   'GET', '/students/applications',           null, studentToken);
  await test('Student application detail',  'GET', '/students/applications/11',        null, studentToken);
  await test('Student application review',  'GET', '/students/applications/11/review', null, studentToken);
  await test('Student fees',                'GET', '/induction-driven/student-fees',   null, studentToken);
  await test('Notifications for student',   'GET', '/notifications/user/student@test.scl', null, studentToken);
  await test('Unread notification count',   'GET', '/notifications/unread-count/student@test.scl', null, studentToken);
  await test('Support admin requests',      'GET', '/support/admin/requests',           null, adminToken);
  await test('Moodle my-courses (student)', 'GET', '/students/my-moodle-courses?email=student@test.scl',      null, studentToken);
  await test('Course inductions',           'GET', '/course-inductions',                null, studentToken);
  await test('Public programmes',           'GET', '/public/programs',                  null, false);

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE 3: FACULTY PORTAL (8 features)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70));
  console.log('MODULE 3: FACULTY PORTAL');
  console.log('─'.repeat(70));

  await test('Teacher courses',             'GET', '/students/teacher-courses?email=faculty@test.scl',      null, facultyToken);
  await test('Teacher cohort info',         'GET', '/students/teacher-cohort-info?email=faculty@test.scl',  null, facultyToken);
  await test('Teacher announcements',       'GET', '/students/teacher-announcements?email=faculty@test.scl',null, facultyToken);
  await test('Teacher notifications',       'GET', '/students/teacher-notifications?email=faculty@test.scl',null, facultyToken);
  await test('Teacher management (admin)',  'GET', '/students/admin/teachers',           null, adminToken);
  await test('Moodle admin courses',        'GET', '/students/admin/moodle-courses',     null, adminToken);
  await test('Cohort intakes (admin)',       'GET', '/students/admin/cohort-intakes',     null, adminToken);

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE 4: COLLEGE ADMIN PORTAL (9 features)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70));
  console.log('MODULE 4: COLLEGE ADMIN PORTAL');
  console.log('─'.repeat(70));

  await test('Applications (cadmin)',       'GET', '/admin/applications',               null, cadminToken);
  await test('LMS enrolments',             'GET', '/admin/lms-enrolments',             null, adminToken);
  await test('Student programmes',         'GET', '/admin/student-programmes',         null, adminToken);
  await test('Programme intakes',          'GET', '/students/programme-intakes',        null, adminToken);
  await test('Support admin requests',     'GET', '/support/admin/requests',            null, cadminToken);

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE 5: MANAGER / SYSTEM ADMIN PORTAL (20 features)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70));
  console.log('MODULE 5: MANAGER / SYSTEM ADMIN PORTAL');
  console.log('─'.repeat(70));

  await test('Admin dashboard stats',      'GET', '/admin/dashboard-stats',            null, adminToken);
  await test('Admin overview stats',       'GET', '/admin/overview-stats',             null, adminToken);
  await test('Users by role',              'GET', '/admin/users-by-role',              null, adminToken);
  await test('All users',                  'GET', '/admin/users',                      null, adminToken);
  await test('Role privileges',            'GET', '/admin/role-privileges',            null, adminToken);
  await test('All applications',           'GET', '/admin/applications',               null, adminToken);
  await test('All enquiries',              'GET', '/admin/enquiries',                  null, adminToken);
  await test('Vendor management',          'GET', '/vendors',                          null, adminToken);
  await test('Facility management',        'GET', '/facility-management/buildings',   null, adminToken);
  await test('Deferral requests',          'GET', '/deferral-requests',                null, adminToken);
  await test('Complaints & appeals',       'GET', '/complaints-appeals',              null, adminToken);
  await test('Announcements',              'GET', '/notifications/announcements',      null, adminToken);

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE 6: COURSE LIFECYCLE (16 features)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70));
  console.log('MODULE 6: COURSE LIFECYCLE — ACCREDITATIONS, INDUCTIONS & VISITS');
  console.log('─'.repeat(70));

  await test('Courses list',               'GET', '/students/courses',                 null, adminToken);
  await test('Programmes list',            'GET', '/students/programmes',              null, adminToken);
  await test('Accreditations list',        'GET', '/accreditations',                   null, adminToken);
  await test('Course visits list',         'GET', '/course-visits',                    null, adminToken);
  await test('Course inductions list',     'GET', '/course-inductions',                null, adminToken);
  await test('Induction requirements',     'GET', '/induction-requirements/requirements/1', null, adminToken);
  await test('Induction driven fees',      'GET', '/induction-driven/student-fees',    null, adminToken);
  await test('Programme intakes',          'GET', '/students/programme-intakes',        null, adminToken);
  await test('Academic misconduct',        'GET', '/academic-misconduct',              null, adminToken);

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE 7: FEES & FINANCE (11 features)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70));
  console.log('MODULE 7: FEES & FINANCE');
  console.log('─'.repeat(70));

  await test('Student fees (admin)',        'GET', '/induction-driven/student-fees',   null, adminToken);
  await test('Student fees (student)',      'GET', '/induction-driven/student-fees',   null, studentToken);

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE 8: MOODLE LMS INTEGRATION
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70));
  console.log('MODULE 8: MOODLE LMS INTEGRATION');
  console.log('─'.repeat(70));

  await test('SSO token generate',         'POST', '/sso/generate', {email:'superadmin@test.scl'}, adminToken);
  await test('SSO verify (invalid token)', 'POST', '/sso/verify',   {token:'invalid',secret:'test-supersecretkey-donotuse-inprod'}, false, 400);
  await test('Moodle my courses',          'GET',  '/students/my-moodle-courses?email=student@test.scl',     null, studentToken);
  await test('Moodle admin moodle-courses','GET',  '/students/admin/moodle-courses',    null, adminToken);
  await test('Session verify',             'POST', '/v1/auth/verify',                   {token:'fake'}, false);

  // ─────────────────────────────────────────────────────────────────────────────
  // MODULE 9: SUPPORT & COMPLIANCE
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70));
  console.log('MODULE 9: SUPPORT & COMPLIANCE');
  console.log('─'.repeat(70));

  await test('Support admin requests',     'GET', '/support/admin/requests',            null, adminToken);
  await test('Complaints (student)',       'GET', '/support/complaints/5',              null, studentToken);
  await test('Disability requests',        'GET', '/support/disability/5',              null, studentToken);
  await test('Safeguarding (student)',     'GET', '/support/safeguarding/5',            null, studentToken);
  await test('Complaints & appeals',       'GET', '/complaints-appeals',               null, adminToken);
  await test('Academic misconduct',        'GET', '/academic-misconduct',              null, adminToken);
  await test('Student engagement',         'GET', '/student-engagement',               null, adminToken);
  await test('Inductions list',            'GET', '/inductions',                       null, adminToken);

  // ─────────────────────────────────────────────────────────────────────────────
  // CRUD TESTS: Create / Update / Delete on key entities
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70));
  console.log('CRUD OPERATIONS — CREATE / UPDATE');
  console.log('─'.repeat(70));

  // Create notification (inline route)
  await test('Create announcement (POST)', 'POST', '/notifications/announcements',
    {title:'Test Announcement',content:'System test from test runner',type:'announcement'},
    adminToken);

  // Create support request
  await test('Create support request (POST)', 'POST', '/support/requests',
    {student_id:5, type:'general', subject:'Test Request', description:'Testing support system via test runner'},
    studentToken);

  // Create course visit
  await test('Create course visit (POST)', 'POST', '/course-visits',
    {course_id:1, visit_date:'2026-06-01', visitor_name:'Test Inspector', visit_type:'External', outcome:'Satisfactory'},
    adminToken);

  // Create accreditation
  await test('Create accreditation (POST)', 'POST', '/accreditations',
    {documentControl:{course_title:'Test Course Accreditation',course_code:'BSC-BM-001',awarding_body:'Pearson',application_type:'Full',date_started:'2026-01-01',expected_submission_date:'2026-12-31',lead_coordinator:'Test Coordinator',version:'1.0'}},
    adminToken);

  // ─────────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('  TEST RESULTS SUMMARY');
  console.log('='.repeat(70));
  console.log(`  ✅ PASSED:  ${passed}`);
  console.log(`  ⚠️  WARNED:  ${warned}  (HTTP 4xx/5xx — endpoint exists but returned error)`);
  console.log(`  ❌ FAILED:  ${failed}  (No response / network error)`);
  console.log(`  TOTAL:     ${passed+warned+failed}`);
  console.log('='.repeat(70));

  // Detailed failure list
  const failures = results.filter(r => r.startsWith('❌') || r.startsWith('⚠️'));
  if (failures.length > 0) {
    console.log('\n  DETAILS — WARNINGS & FAILURES:');
    failures.forEach(f => console.log('  ' + f));
  }
  console.log('');
}

runTests().catch(console.error);
