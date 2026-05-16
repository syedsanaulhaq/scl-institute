// build_demo.js — generates SCL_SYSTEM_DEMO.html
const fs = require('fs');
const path = require('path');

const SS = 'Client-Overview-Screenshots/screenshots/';

function img(file, alt) {
  const p = path.join(SS, file);
  if (!fs.existsSync(p)) return `<div class="img-missing">Screenshot: ${file}</div>`;
  const ext = path.extname(file).toLowerCase().slice(1);
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  const b64 = fs.readFileSync(p).toString('base64');
  return `<img src="data:${mime};base64,${b64}" alt="${alt}" loading="lazy" onclick="openLightbox(this.src,'${alt}')" title="Click to enlarge">`;
}

// ─── FLOWCHARTS via SVG ────────────────────────────────────────────────────
function flowBox(x, y, w, h, label, sub, color) {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${color}" stroke="none"/>
  <text x="${x + w/2}" y="${y + h/2 - (sub ? 7 : 0)}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="12" font-weight="700" font-family="Inter,sans-serif">${label}</text>
  ${sub ? `<text x="${x + w/2}" y="${y + h/2 + 10}" text-anchor="middle" dominant-baseline="middle" fill="rgba(255,255,255,0.8)" font-size="10" font-family="Inter,sans-serif">${sub}</text>` : ''}`;
}
function arrow(x1,y1,x2,y2,color='#94a3b8') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" marker-end="url(#arrowhead)"/>`;
}
function diamond(cx,cy,hw,hh,label,color) {
  const pts = `${cx},${cy-hh} ${cx+hw},${cy} ${cx},${cy+hh} ${cx-hw},${cy}`;
  return `<polygon points="${pts}" fill="${color}" stroke="none"/>
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10" font-weight="700" font-family="Inter,sans-serif">${label}</text>`;
}

function svgFlow(nodes, arrows, w=780, h=420) {
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" class="flowchart-svg">
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#94a3b8"/>
    </marker>
  </defs>
  ${arrows}
  ${nodes}
</svg>`;
}

// ─── STUDENT FLOWCHART ────────────────────────────────────────────────────
function studentFlow() {
  const c = '#2563eb';
  const nodes = [
    flowBox(20,10,120,44,'Login','Email + Password',c),
    flowBox(160,10,120,44,'Dashboard','Portal Home',c),
    flowBox(300,10,120,44,'My Programme','View Courses',c),
    flowBox(300,80,120,44,'Assessments','View Tasks',c),
    flowBox(440,10,120,44,'Grades','Progress 78%',c),
    flowBox(160,80,120,44,'My Profile','Personal Info',c),
    flowBox(20,80,120,44,'LMS','Moodle Courses',c),
    flowBox(580,10,120,44,'Support','Wellbeing',c),
    flowBox(580,80,120,44,'Finance','Fees & Docs',c),
  ];
  const arrs = [
    arrow(140,32,160,32),
    arrow(280,32,300,32),
    arrow(420,32,440,32),
    arrow(560,32,580,32),
    arrow(360,54,360,80),
    arrow(220,54,220,80),
    arrow(140,102,160,102),
    arrow(560,54,580,80),
  ];
  return svgFlow(nodes.join(''), arrs.join(''), 720, 148);
}

// ─── TEACHER FLOWCHART ────────────────────────────────────────────────────
function teacherFlow() {
  const c = '#059669';
  const nodes = [
    flowBox(20,10,120,44,'Login','Credentials',c),
    flowBox(160,10,120,44,'Dashboard','Overview',c),
    flowBox(300,10,120,44,'Teaching Programme','My Courses',c),
    flowBox(440,10,120,44,'Assessments','Assignments/Quizzes',c),
    flowBox(300,80,120,44,'Reports','Activity Stats',c),
    flowBox(160,80,120,44,'Teaching LMS','Moodle Link',c),
    flowBox(440,80,120,44,'Timetable','Schedule View',c),
  ];
  const arrs = [
    arrow(140,32,160,32),
    arrow(280,32,300,32),
    arrow(420,32,440,32),
    arrow(360,54,360,80),
    arrow(220,54,220,80),
    arrow(500,54,500,80),
  ];
  return svgFlow(nodes.join(''), arrs.join(''), 580, 148);
}

// ─── MANAGER FLOWCHART ────────────────────────────────────────────────────
function managerFlow() {
  const c = '#7c3aed';
  const nodes = [
    flowBox(20,10,130,44,'Login','Admin Credentials',c),
    flowBox(170,10,130,44,'Admin Overview','Reports + Stats',c),
    flowBox(320,10,130,44,'Admissions','Applications',c),
    flowBox(470,10,130,44,'LMS Enrolments','93 Students',c),
    flowBox(620,10,130,44,'Course Lifecycle','55 Courses',c),
    flowBox(20,90,130,44,'Applicants List','All Applicants',c),
    flowBox(170,90,130,44,'Users by Role','Role Groups',c),
    flowBox(320,90,130,44,'Programme Intakes','Cohort Mgmt',c),
    flowBox(470,90,130,44,'Staff','Teacher Mgmt',c),
    flowBox(620,90,130,44,'Settings','System Config',c),
  ];
  const arrs = [
    arrow(150,32,170,32), arrow(300,32,320,32), arrow(450,32,470,32), arrow(600,32,620,32),
    arrow(85,54,85,90), arrow(235,54,235,90), arrow(385,54,385,90), arrow(535,54,535,90), arrow(685,54,685,90),
  ];
  return svgFlow(nodes.join(''), arrs.join(''), 770, 152);
}

// ─── COLLEGE ADMIN FLOWCHART ──────────────────────────────────────────────
function cadminFlow() {
  const c = '#d97706';
  const nodes = [
    flowBox(20,10,130,44,'Login','College Admin',c),
    flowBox(170,10,130,44,'Dashboard','Overview',c),
    flowBox(320,10,130,44,'Admissions Hub','New + Applications',c),
    flowBox(470,10,130,44,'Student Applications','Review & Approve',c),
    flowBox(170,90,130,44,'Student Management','Records',c),
    flowBox(320,90,130,44,'Course Intakes','Programmes',c),
    flowBox(470,90,130,44,'LMS Enrolments','Sync Moodle',c),
    flowBox(620,90,130,44,'Support Inbox','Student Issues',c),
  ];
  const arrs = [
    arrow(150,32,170,32), arrow(300,32,320,32), arrow(450,32,470,32),
    arrow(235,54,235,90), arrow(385,54,385,90), arrow(535,54,535,90), arrow(685,10,685,90),
  ];
  return svgFlow(nodes.join(''), arrs.join(''), 770, 152);
}

// ─── STEP CARD ─────────────────────────────────────────────────────────────
function step(num, title, desc, imgFile, alt, badge='', url='') {
  const badgeHtml = badge ? `<span class="step-badge">${badge}</span>` : '';
  const urlHtml = url ? `<a href="${url}" target="_blank" class="step-link">🔗 View Live</a>` : '';
  return `
  <div class="step-card">
    <div class="step-num">${num}</div>
    <div class="step-body">
      <div class="step-header">
        <h3>${title} ${badgeHtml}</h3>
        ${urlHtml}
      </div>
      <p class="step-desc">${desc}</p>
      <div class="step-img-wrap">
        ${img(imgFile, alt)}
      </div>
    </div>
  </div>`;
}

// ─── LOGIN SECTION ─────────────────────────────────────────────────────────
function loginSection() {
  return `
  <section id="login" class="section section-login">
    <div class="container">
      <div class="section-title">
        <span class="section-icon">🔐</span>
        <h2>Login Screen — All Roles</h2>
        <p>Every user accesses the system through a single secure login portal. The system automatically detects the role and redirects to the correct dashboard.</p>
      </div>
      <div class="login-demo">
        <div class="login-screenshot">
          ${img('s00-login-screen.jpg', 'SCL Login Screen')}
        </div>
        <div class="login-creds">
          <h3>Demo Credentials</h3>
          <div class="cred-table">
            <div class="cred-row cred-student">
              <div class="cred-role"><span class="role-dot" style="background:#2563eb"></span>Student</div>
              <div class="cred-email">sarah.johnson.lm@example.com</div>
              <div class="cred-pass">089f4607e213</div>
            </div>
            <div class="cred-row cred-teacher">
              <div class="cred-role"><span class="role-dot" style="background:#059669"></span>Teacher</div>
              <div class="cred-email">test@teacher.com</div>
              <div class="cred-pass">password123</div>
            </div>
            <div class="cred-row cred-manager">
              <div class="cred-role"><span class="role-dot" style="background:#7c3aed"></span>Manager</div>
              <div class="cred-email">admin@sclsandbox.xyz</div>
              <div class="cred-pass">password123</div>
            </div>
            <div class="cred-row cred-cadmin">
              <div class="cred-role"><span class="role-dot" style="background:#d97706"></span>College Admin</div>
              <div class="cred-email">collegeadmin@scl.com</div>
              <div class="cred-pass">password</div>
            </div>
          </div>
          <div class="live-link-box">
            <p>🌐 Live System</p>
            <a href="https://system.sclsandbox.xyz/login" target="_blank" class="live-btn">Open Login Page →</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

// ─── ROLE SECTION TEMPLATE ─────────────────────────────────────────────────
function roleSection(id, color, lightColor, icon, roleName, subtitle, badge, flowHtml, steps, extraHtml = '') {
  return `
  <section id="${id}" class="section role-section" style="--role-color:${color};--role-light:${lightColor}">
    <div class="container">
      <div class="role-header">
        <div class="role-icon-big">${icon}</div>
        <div>
          <div class="role-badge-big">${badge}</div>
          <h2>${roleName}</h2>
          <p>${subtitle}</p>
          <a href="https://system.sclsandbox.xyz" target="_blank" class="live-btn-sm">🔗 Open Live System</a>
        </div>
      </div>

      <div class="flowchart-block">
        <h3 class="flow-title">📊 ${roleName} Workflow</h3>
        <div class="flowchart-wrap">${flowHtml}</div>
      </div>

      <div class="steps-title">
        <h3>📸 Step-by-Step Demo</h3>
        <p>Real screenshots captured while logged in as ${roleName}</p>
      </div>
      <div class="steps-grid">
        ${steps}
      </div>
      ${extraHtml}
    </div>
  </section>`;
}

// ─── BUILD FULL HTML ───────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SCL Institute — Full System Demo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Inter',sans-serif;background:#0f172a;color:#e2e8f0;line-height:1.6}

/* ── NAV ── */
#topnav{position:fixed;top:0;left:0;right:0;z-index:1000;background:rgba(15,23,42,0.95);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,0.08);padding:0 1.5rem;height:56px;display:flex;align-items:center;justify-content:space-between}
.nav-logo{font-size:1rem;font-weight:800;color:#fff;white-space:nowrap}
.nav-logo span{color:#3b82f6}
.nav-links{display:flex;align-items:center;gap:0.25rem;overflow-x:auto}
.nav-links a{padding:0.35rem 0.75rem;border-radius:6px;font-size:0.8rem;font-weight:600;color:#94a3b8;text-decoration:none;white-space:nowrap;transition:all 0.2s}
.nav-links a:hover{color:#fff;background:rgba(255,255,255,0.1)}
.nav-links a.student{color:#60a5fa}.nav-links a.student:hover,.nav-links a.student.active{background:rgba(37,99,235,0.3);color:#3b82f6}
.nav-links a.teacher{color:#34d399}.nav-links a.teacher:hover,.nav-links a.teacher.active{background:rgba(5,150,105,0.3);color:#10b981}
.nav-links a.manager{color:#a78bfa}.nav-links a.manager:hover,.nav-links a.manager.active{background:rgba(124,58,237,0.3);color:#8b5cf6}
.nav-links a.cadmin{color:#fbbf24}.nav-links a.cadmin:hover,.nav-links a.cadmin.active{background:rgba(217,119,6,0.3);color:#f59e0b}
.nav-live{padding:0.35rem 1rem;background:#3b82f6;color:#fff;border-radius:6px;font-size:0.8rem;font-weight:700;text-decoration:none;white-space:nowrap;transition:background 0.2s}
.nav-live:hover{background:#2563eb}

/* ── HERO ── */
#hero{padding:120px 1.5rem 80px;background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%);text-align:center;position:relative;overflow:hidden}
#hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 40%,rgba(99,102,241,0.15) 0%,transparent 70%)}
.hero-eyebrow{display:inline-block;padding:0.35rem 1rem;background:rgba(99,102,241,0.2);border:1px solid rgba(99,102,241,0.4);border-radius:20px;color:#a78bfa;font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1.5rem}
#hero h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:900;color:#fff;line-height:1.1;margin-bottom:1rem}
#hero h1 span{background:linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
#hero p{font-size:1.1rem;color:#94a3b8;max-width:600px;margin:0 auto 2.5rem}
.hero-stats{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-bottom:3rem}
.stat{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:1rem 1.5rem;text-align:center}
.stat-n{font-size:1.8rem;font-weight:900;color:#fff}
.stat-l{font-size:0.75rem;color:#64748b;text-transform:uppercase;letter-spacing:0.05em}
.hero-roles{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.role-chip{display:flex;align-items:center;gap:0.5rem;padding:0.6rem 1.2rem;border-radius:30px;font-size:0.85rem;font-weight:700;text-decoration:none;border:2px solid transparent;transition:all 0.2s}
.role-chip:hover{transform:translateY(-2px)}
.chip-student{background:rgba(37,99,235,0.15);border-color:#2563eb;color:#60a5fa}
.chip-teacher{background:rgba(5,150,105,0.15);border-color:#059669;color:#34d399}
.chip-manager{background:rgba(124,58,237,0.15);border-color:#7c3aed;color:#a78bfa}
.chip-cadmin{background:rgba(217,119,6,0.15);border-color:#d97706;color:#fbbf24}

/* ── SECTION BASE ── */
.section{padding:80px 1.5rem;border-top:1px solid rgba(255,255,255,0.06)}
.container{max-width:1100px;margin:0 auto}
.section-title{text-align:center;margin-bottom:3rem}
.section-icon{font-size:2.5rem;display:block;margin-bottom:0.75rem}
.section-title h2{font-size:1.8rem;font-weight:800;color:#fff;margin-bottom:0.5rem}
.section-title p{color:#64748b;max-width:600px;margin:0 auto}

/* ── LOGIN SECTION ── */
.section-login{background:#111827}
.login-demo{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start}
@media(max-width:768px){.login-demo{grid-template-columns:1fr}}
.login-screenshot img{width:100%;border-radius:12px;border:1px solid rgba(255,255,255,0.1);box-shadow:0 20px 60px rgba(0,0,0,0.5);cursor:pointer;transition:transform 0.2s}
.login-screenshot img:hover{transform:scale(1.02)}
.login-creds h3{font-size:1.2rem;font-weight:700;color:#fff;margin-bottom:1.25rem}
.cred-table{display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem}
.cred-row{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:0.875rem 1rem;display:grid;grid-template-columns:140px 1fr;gap:0.5rem}
.cred-role{display:flex;align-items:center;gap:0.5rem;font-weight:700;font-size:0.85rem;color:#fff}
.role-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.cred-email{font-size:0.8rem;color:#94a3b8;font-family:monospace;grid-column:2;padding:0.2rem 0}
.cred-pass{font-size:0.8rem;color:#64748b;font-family:monospace;grid-column:2}
.live-link-box{background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:10px;padding:1rem;text-align:center}
.live-link-box p{font-size:0.85rem;color:#94a3b8;margin-bottom:0.5rem}
.live-btn{display:inline-block;padding:0.6rem 1.5rem;background:#3b82f6;color:#fff;border-radius:8px;font-weight:700;font-size:0.9rem;text-decoration:none;transition:background 0.2s}
.live-btn:hover{background:#2563eb}

/* ── ROLE SECTIONS ── */
.role-section{background:#0f172a}
.role-section:nth-child(even){background:#111827}
.role-header{display:flex;gap:1.5rem;align-items:flex-start;margin-bottom:2.5rem;padding:1.5rem;background:rgba(var(--role-color-rgb,59,130,246),0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;border-left:4px solid var(--role-color)}
.role-icon-big{font-size:3rem;flex-shrink:0}
.role-badge-big{display:inline-block;padding:0.25rem 0.75rem;background:var(--role-color);color:#fff;border-radius:20px;font-size:0.7rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem}
.role-header h2{font-size:1.6rem;font-weight:800;color:#fff;margin-bottom:0.25rem}
.role-header p{color:#64748b;font-size:0.95rem}
.live-btn-sm{display:inline-block;margin-top:0.75rem;padding:0.35rem 0.9rem;background:var(--role-color);color:#fff;border-radius:6px;font-size:0.78rem;font-weight:700;text-decoration:none;transition:opacity 0.2s}
.live-btn-sm:hover{opacity:0.85}

/* ── FLOWCHART ── */
.flowchart-block{margin-bottom:3rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:1.5rem}
.flow-title{font-size:1.1rem;font-weight:700;color:#cbd5e1;margin-bottom:1rem}
.flowchart-wrap{overflow-x:auto;padding-bottom:0.5rem}
.flowchart-svg{min-width:400px;width:100%;height:auto;display:block}

/* ── STEPS ── */
.steps-title{margin-bottom:1.5rem}
.steps-title h3{font-size:1.2rem;font-weight:700;color:#fff;margin-bottom:0.25rem}
.steps-title p{font-size:0.85rem;color:#64748b}
.steps-grid{display:flex;flex-direction:column;gap:2rem}
.step-card{display:grid;grid-template-columns:48px 1fr;gap:1rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:1.25rem;transition:border-color 0.2s}
.step-card:hover{border-color:var(--role-color,#3b82f6)}
.step-num{width:48px;height:48px;border-radius:50%;background:var(--role-color,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:900;color:#fff;flex-shrink:0;margin-top:0.25rem}
.step-body{}
.step-header{display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;flex-wrap:wrap}
.step-header h3{font-size:1rem;font-weight:700;color:#fff}
.step-badge{padding:0.2rem 0.5rem;border-radius:4px;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;background:rgba(255,255,255,0.1);color:#94a3b8}
.step-link{font-size:0.75rem;color:#3b82f6;text-decoration:none;margin-left:auto}
.step-link:hover{text-decoration:underline}
.step-desc{font-size:0.875rem;color:#94a3b8;margin-bottom:1rem;line-height:1.5}
.step-img-wrap{border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)}
.step-img-wrap img{width:100%;height:auto;display:block;cursor:pointer;transition:transform 0.2s}
.step-img-wrap img:hover{transform:scale(1.01)}
.img-missing{padding:3rem;text-align:center;color:#475569;font-size:0.85rem;background:rgba(255,255,255,0.02)}

/* ── LIGHTBOX ── */
#lightbox{display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.92);padding:2rem;cursor:zoom-out}
#lightbox.open{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem}
#lightbox img{max-width:90vw;max-height:85vh;border-radius:8px;box-shadow:0 30px 80px rgba(0,0,0,0.8)}
#lightbox .lb-caption{color:#94a3b8;font-size:0.85rem}
#lightbox .lb-close{position:absolute;top:1rem;right:1.5rem;color:#fff;font-size:1.5rem;cursor:pointer;opacity:0.6;transition:opacity 0.2s}
#lightbox .lb-close:hover{opacity:1}

/* ── FOOTER ── */
footer{background:#020617;border-top:1px solid rgba(255,255,255,0.06);padding:3rem 1.5rem;text-align:center}
footer p{color:#475569;font-size:0.85rem}
footer a{color:#3b82f6;text-decoration:none}

/* ── SCROLLBAR ── */
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:#0f172a}
::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}

/* ── VIDEO EMBED ── */
.video-embed-block{margin-top:3rem}
.video-embed-block h3{font-size:1.1rem;font-weight:700;color:#e2e8f0;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem}
.video-player-wrap{border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);background:#000;box-shadow:0 8px 32px rgba(0,0,0,0.5)}
.video-player-wrap video{width:100%;display:block;max-height:520px}
</style>
</head>
<body>

<!-- LIGHTBOX -->
<div id="lightbox" onclick="closeLightbox()">
  <span class="lb-close" onclick="closeLightbox()">✕</span>
  <img id="lb-img" src="" alt="">
  <p class="lb-caption" id="lb-cap"></p>
</div>

<!-- NAV -->
<nav id="topnav">
  <div class="nav-logo">SCL <span>Institute</span> — System Demo</div>
  <div class="nav-links">
    <a href="#login">🔐 Login</a>
    <a href="#student" class="student">👤 Student</a>
    <a href="#teacher" class="teacher">🎓 Teacher</a>
    <a href="#manager" class="manager">⚙️ Manager</a>
    <a href="#cadmin" class="cadmin">🏛️ College Admin</a>
    <a href="https://system.sclsandbox.xyz" target="_blank" class="nav-live">Open Live Site →</a>
  </div>
</nav>

<!-- HERO -->
<section id="hero">
  <div class="hero-eyebrow">Full System Demo — All Roles</div>
  <h1>SCL Institute<br><span>Management Portal</span></h1>
  <p>A complete walkthrough of the system — from login to every feature — for all four user roles.</p>
  <div class="hero-stats">
    <div class="stat"><div class="stat-n">4</div><div class="stat-l">User Roles</div></div>
    <div class="stat"><div class="stat-n">55+</div><div class="stat-l">Courses</div></div>
    <div class="stat"><div class="stat-n">93</div><div class="stat-l">LMS Students</div></div>
    <div class="stat"><div class="stat-n">12</div><div class="stat-l">Applications</div></div>
    <div class="stat"><div class="stat-n">100%</div><div class="stat-l">Cloud Hosted</div></div>
  </div>
  <div class="hero-roles">
    <a href="#student" class="role-chip chip-student">👤 Student Portal</a>
    <a href="#teacher" class="role-chip chip-teacher">🎓 Teacher Portal</a>
    <a href="#manager" class="role-chip chip-manager">⚙️ Manager Portal</a>
    <a href="#cadmin" class="role-chip chip-cadmin">🏛️ College Admin</a>
  </div>
</section>

${loginSection()}

${roleSection(
  'student','#2563eb','rgba(37,99,235,0.1)','👤','Student Portal',
  'Students can view their courses, track grades, manage their profile, and access all learning materials.',
  'STUDENT ROLE',
  studentFlow(),
  [
    step(1,'Login','Student logs in at system.sclsandbox.xyz with their email and password. The system detects the STUDENT role and redirects to the Student Portal.','s00-login-screen.jpg','Login Screen','URL: /login','https://system.sclsandbox.xyz/login'),
    step(2,'Student Dashboard','The main portal home shows enrolled courses, upcoming assessments, notifications, and a progress summary. Student can see their full academic overview at a glance.','s01-student-dashboard.jpg','Student Dashboard','URL: /student/portal','https://system.sclsandbox.xyz/student/portal'),
    step(3,'Grades & Progress','The Grades page shows a detailed breakdown of all module scores. Sarah has earned 311.7/400 points (78% overall progress) across all her courses.','s06-student-grades.jpg','Student Grades','URL: /student/grades','https://system.sclsandbox.xyz/student/grades'),
    step(4,'Assessments','View all upcoming and past assessments — assignments, quizzes, and submissions — with due dates, status, and feedback from teachers.','s05-student-assessments.jpg','Student Assessments','URL: /student/assessments','https://system.sclsandbox.xyz/student/assessments'),
    step(5,'My Profile','Students can view and update their personal details — name, contact, address, nationality, visa status, emergency contacts, and programme details.','s04-student-profile.jpg','Student Profile','URL: /student/profile','https://system.sclsandbox.xyz/student/profile'),
  ].join(''),
  `<div class="video-embed-block">
    <h3>🎬 Student Portal Overview</h3>
    <div class="video-player-wrap">
      <video controls preload="metadata" poster="">
        <source src="/demo/videos/student-walkthrough.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
  </div>`
)}

${roleSection(
  'teacher','#059669','rgba(5,150,105,0.1)','🎓','Teacher Portal',
  'Teachers manage their courses, set assessments, track student progress, and view course reports via Moodle LMS integration.',
  'TEACHER ROLE',
  teacherFlow(),
  [
    step(1,'Login','Teacher logs in with their credentials. The system detects the EDITINGTEACHER role and redirects to the Teacher Dashboard.','s00-login-screen.jpg','Login Screen','URL: /login','https://system.sclsandbox.xyz/login'),
    step(2,'Teacher Dashboard','The teacher dashboard shows a summary of their assigned courses, recent student activity, assessment counts, and quick-access links.','s11-teacher-dashboard.jpg','Teacher Dashboard','URL: /teacher/dashboard','https://system.sclsandbox.xyz/teacher/dashboard'),
    step(3,'My Teaching Programme','View all courses assigned to the teacher — course codes, programme details, intake dates, and student counts. Links directly to Moodle for course management.','s13-teacher-programme.png','Teacher Programme','URL: /teacher/programme','https://system.sclsandbox.xyz/teacher/programme'),
    step(4,'Assessments','Full list of all assignments, quizzes, and forums across teaching courses. Filter by activity type or course. Each item links to Moodle for grading.','s14-teacher-assessments.jpg','Teacher Assessments','URL: /teacher/assessments','https://system.sclsandbox.xyz/teacher/assessments'),
    step(5,'Reports','Course-level activity breakdown — total assignments (3), quizzes (2), forums (2), resources (1), links (1). Summary shows 10 total modules per course.','s15-teacher-reports.jpg','Teacher Reports','URL: /teacher/reports','https://system.sclsandbox.xyz/teacher/reports'),
  ].join('')
)}

${roleSection(
  'manager','#7c3aed','rgba(124,58,237,0.1)','⚙️','Manager / System Admin',
  'Full system access — manage all students, applications, intakes, LMS enrolments, course lifecycle, users, and system settings.',
  'MANAGER ROLE',
  managerFlow(),
  [
    step(1,'Login','Manager logs in as System Administrator. The system detects the MANAGER/ADMIN role and loads the full admin portal with access to all modules.','s00-login-screen.jpg','Login Screen','URL: /login','https://system.sclsandbox.xyz/login'),
    step(2,'Admin Overview / Reports','The main dashboard shows system-wide KPIs: applications, student counts, LMS stats, course status. All key metrics in one view with drill-down cards.','s27-manager-reports.jpg','Manager Dashboard','URL: /','https://system.sclsandbox.xyz/'),
    step(3,'Student Applications','View and manage all student applications — 12 total (10 accepted, 1 pending, 1 rejected). Review documents, approve applications, and track admissions status.','s22-manager-applications.jpg','Student Applications','URL: /applications','https://system.sclsandbox.xyz/applications'),
    step(4,'Applicants List','Complete list of all applicants across programmes — filter by status, date, and programme. Export data and manage admission workflows.','s28-manager-applicants.jpg','Applicants List','URL: /applicants','https://system.sclsandbox.xyz/applicants'),
    step(5,'Programme Intakes','Create and manage programme intake cohorts — set start dates, capacity, and enrolment windows. View all active intakes across programmes.','s23-manager-intakes.jpg','Programme Intakes','URL: /programme-intakes','https://system.sclsandbox.xyz/programme-intakes'),
    step(6,'LMS Enrolments','Manage Moodle LMS enrolments — 93 students enrolled across courses. Sync enrolments, update roles, and monitor LMS access for all students.','s24-manager-lms.jpg','LMS Enrolments','URL: /admin/lms-enrolments','https://system.sclsandbox.xyz/admin/lms-enrolments'),
    step(7,'Course Lifecycle','Track all 55 courses through their lifecycle stages — from creation to archival. View status, enrolment counts, and manage course progression.','s25-manager-lifecycle.jpg','Course Lifecycle','URL: /admin/course-lifecycle','https://system.sclsandbox.xyz/admin/course-lifecycle'),
    step(8,'Users by Role','View all system users grouped by role — Students, Teachers, Managers, College Admins. Assign and revoke roles, reset passwords, and manage access.','s26-manager-users.jpg','Users by Role','URL: /admin/users-by-role','https://system.sclsandbox.xyz/admin/users-by-role'),
  ].join('')
)}

${roleSection(
  'cadmin','#d97706','rgba(217,119,6,0.1)','🏛️','College Admin',
  'College Admins handle day-to-day admissions, student records, course intake management, and LMS enrolment coordination.',
  'COLLEGE ADMIN ROLE',
  cadminFlow(),
  [
    step(1,'Login','College Admin logs in with their credentials. The system detects the COLLEGEADMIN role and loads the College Admin portal with access to admissions and student management.','s00-login-screen.jpg','Login Screen','URL: /login','https://system.sclsandbox.xyz/login'),
    step(2,'College Admin Dashboard','Overview of admissions pipeline, student counts, application statistics, and quick-action buttons for common tasks.','s31-cadmin-dashboard.jpg','College Admin Dashboard','URL: /','https://system.sclsandbox.xyz/'),
    step(3,'Student Applications','Review and process incoming student applications — view applicant details, uploaded documents, and update application status (accept/reject/pending).','s32-cadmin-applications.jpg','College Admin Applications','URL: /applications','https://system.sclsandbox.xyz/applications'),
    step(4,'Student Management','Full student records list — search by name, ID, or programme. View individual student profiles, academic records, and contact information.','s33-cadmin-students.jpg','Student Management','URL: /students','https://system.sclsandbox.xyz/students'),
    step(5,'Course Intakes','Manage programme intake schedules — create new cohorts, set intake dates, assign students to intakes, and monitor capacity across all programmes.','s34-cadmin-intakes.jpg','Course Intakes','URL: /programme-intakes','https://system.sclsandbox.xyz/programme-intakes'),
  ].join(''),
  `<div class="video-embed-block">
    <h3>🎬 College Admin Overview</h3>
    <div class="video-player-wrap">
      <video controls preload="metadata" poster="">
        <source src="/demo/videos/cadmin-walkthrough.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
  </div>`
)}

<footer>
  <p>SCL Institute Management Portal &nbsp;|&nbsp; <a href="https://system.sclsandbox.xyz" target="_blank">system.sclsandbox.xyz</a> &nbsp;|&nbsp; Demo generated May 2026</p>
  <p style="margin-top:0.5rem">Screenshots captured live from production system &nbsp;•&nbsp; All 4 roles: Student · Teacher · Manager · College Admin</p>
</footer>

<script>
function openLightbox(src,cap){
  document.getElementById('lb-img').src=src;
  document.getElementById('lb-cap').textContent=cap;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeLightbox(){
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow='';
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox()});

// Active nav highlight on scroll
const sections=['login','student','teacher','manager','cadmin'];
const links=document.querySelectorAll('.nav-links a');
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const id=e.target.id;
      links.forEach(l=>{l.classList.toggle('active',l.getAttribute('href')==='#'+id)});
    }
  });
},{threshold:0.3,rootMargin:'-56px 0px -50% 0px'});
sections.forEach(id=>{const el=document.getElementById(id);if(el)obs.observe(el)});
</script>
</body>
</html>`;

fs.writeFileSync('SCL_SYSTEM_DEMO.html', html);
console.log('Written SCL_SYSTEM_DEMO.html', fs.statSync('SCL_SYSTEM_DEMO.html').size, 'bytes');
