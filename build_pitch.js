// build_pitch.js — generates SCL_PITCH_DECK.html (client-facing sales presentation)
const fs   = require('fs');
const path = require('path');

const SS = 'Client-Overview-Screenshots/screenshots/';

function img64(file) {
  const p = path.join(SS, file);
  if (!fs.existsSync(p)) return null;
  const ext  = path.extname(file).toLowerCase().slice(1);
  const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(p).toString('base64')}`;
}

function screen(file, alt, label='') {
  const src = img64(file);
  if (!src) return `<div class="screen-missing">${alt}</div>`;
  return `
    <div class="screen-frame">
      <div class="screen-bar"><span></span><span></span><span></span></div>
      <img src="${src}" alt="${alt}" class="screen-img">
      ${label ? `<div class="screen-label">${label}</div>` : ''}
    </div>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SCL Institute — Enterprise Education Management System</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
/* ── RESET & BASE ─────────────────────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;font-size:16px}
body{font-family:'Inter',sans-serif;background:#060b14;color:#e2e8f0;overflow-x:hidden}

/* ── VARIABLES ───────────────────────────────────────────────────────────── */
:root{
  --blue:#3b82f6;--blue-dark:#1d4ed8;--blue-glow:rgba(59,130,246,0.35);
  --purple:#8b5cf6;--purple-glow:rgba(139,92,246,0.3);
  --green:#10b981;--amber:#f59e0b;--rose:#f43f5e;
  --surface:rgba(255,255,255,0.04);--border:rgba(255,255,255,0.08);
  --text-muted:#64748b;--text-sub:#94a3b8;
  --radius:16px;--radius-sm:10px;
}

/* ── SCROLLBAR ───────────────────────────────────────────────────────────── */
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#334155;border-radius:2px}

/* ── SLIDE SYSTEM ─────────────────────────────────────────────────────────── */
.slide{
  min-height:100vh;width:100%;display:flex;align-items:center;
  justify-content:center;position:relative;overflow:hidden;
  padding:80px 40px;
}
.slide-inner{max-width:1200px;width:100%;margin:0 auto;position:relative;z-index:2}

/* ── NAVBAR ──────────────────────────────────────────────────────────────── */
#nav{
  position:fixed;top:0;left:0;right:0;z-index:1000;
  background:rgba(6,11,20,0.85);backdrop-filter:blur(16px);
  border-bottom:1px solid var(--border);
  padding:0 48px;height:60px;
  display:flex;align-items:center;justify-content:space-between;
}
.nav-brand{font-size:1rem;font-weight:800;color:#fff;letter-spacing:-0.02em}
.nav-brand span{color:var(--blue)}
.nav-pill{
  padding:.35rem 1rem;background:var(--blue);color:#fff;border-radius:20px;
  font-size:.8rem;font-weight:700;text-decoration:none;transition:background .2s;
}
.nav-pill:hover{background:var(--blue-dark)}
.nav-links-bar{display:flex;gap:.25rem;align-items:center}
.nav-links-bar a{
  padding:.3rem .7rem;border-radius:6px;font-size:.78rem;font-weight:600;
  color:var(--text-muted);text-decoration:none;transition:all .2s;
}
.nav-links-bar a:hover{color:#fff;background:var(--surface)}

/* ── PROGRESS BAR ────────────────────────────────────────────────────────── */
#progress{position:fixed;top:60px;left:0;height:3px;background:linear-gradient(90deg,var(--blue),var(--purple));width:0%;z-index:999;transition:width .15s}

/* ── BACKGROUNDS ─────────────────────────────────────────────────────────── */
.bg-hero{background:radial-gradient(ellipse 80% 70% at 50% 30%,rgba(99,102,241,.18) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 80% 70%,rgba(139,92,246,.12) 0%,transparent 60%),#060b14}
.bg-dark{background:#060b14}
.bg-surface{background:#0a1020}
.bg-blue{background:linear-gradient(135deg,#0c1445 0%,#0f172a 100%)}
.bg-green{background:linear-gradient(135deg,#052e16 0%,#0f172a 100%)}
.bg-amber{background:linear-gradient(135deg,#1c1005 0%,#0f172a 100%)}
.bg-purple{background:linear-gradient(135deg,#1e0a45 0%,#0f172a 100%)}

/* decorative blobs */
.blob{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;opacity:.5}
.blob-1{width:500px;height:500px;background:rgba(99,102,241,.15);top:-100px;right:-100px}
.blob-2{width:400px;height:400px;background:rgba(139,92,246,.12);bottom:-100px;left:-50px}
.blob-3{width:300px;height:300px;background:rgba(59,130,246,.1);top:50%;left:50%}

/* ── GRID PATTERNS ─────────────────────────────────────────────────────── */
.grid-bg{
  position:absolute;inset:0;z-index:0;
  background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),
                   linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);
  background-size:60px 60px;
}

/* ── TYPOGRAPHY ──────────────────────────────────────────────────────────── */
.eyebrow{
  display:inline-flex;align-items:center;gap:.5rem;
  padding:.35rem 1rem;border-radius:20px;
  background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.3);
  color:#a78bfa;font-size:.75rem;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;margin-bottom:1.5rem;
}
.eyebrow-green{background:rgba(16,185,129,.12);border-color:rgba(16,185,129,.3);color:#34d399}
.eyebrow-amber{background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.3);color:#fbbf24}
.eyebrow-blue{background:rgba(59,130,246,.12);border-color:rgba(59,130,246,.3);color:#60a5fa}
.eyebrow-purple{background:rgba(139,92,246,.12);border-color:rgba(139,92,246,.3);color:#a78bfa}

h1.mega{
  font-size:clamp(2.8rem,6vw,5.5rem);font-weight:900;line-height:1.05;
  letter-spacing:-.04em;color:#fff;margin-bottom:1.25rem;
}
h1.mega .grad{
  background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 40%,#ec4899 80%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
h2.section-title{
  font-size:clamp(1.8rem,4vw,3rem);font-weight:800;color:#fff;
  letter-spacing:-.03em;line-height:1.1;margin-bottom:1rem;
}
h2.section-title .accent{color:var(--blue)}
h3.card-title{font-size:1.15rem;font-weight:700;color:#fff;margin-bottom:.4rem}
p.lead{font-size:1.1rem;color:var(--text-sub);line-height:1.7;max-width:640px}
p.body{font-size:.95rem;color:var(--text-sub);line-height:1.6}

/* ── STATS ROW ───────────────────────────────────────────────────────────── */
.stats-row{display:flex;gap:1.5rem;flex-wrap:wrap;margin-top:2.5rem}
.stat-block{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-sm);padding:1.25rem 1.75rem;text-align:center;
  min-width:120px;
}
.stat-n{font-size:2.5rem;font-weight:900;color:#fff;line-height:1}
.stat-l{font-size:.72rem;color:var(--text-muted);letter-spacing:.06em;text-transform:uppercase;margin-top:.3rem}

/* ── FEATURE CARDS ───────────────────────────────────────────────────────── */
.features-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.25rem;margin-top:2rem}
.feat-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius);padding:1.5rem;
  transition:border-color .25s,transform .25s;cursor:default;
}
.feat-card:hover{border-color:rgba(99,102,241,.5);transform:translateY(-3px)}
.feat-icon{
  width:48px;height:48px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:1.4rem;margin-bottom:1rem;
}
.fi-blue{background:rgba(59,130,246,.15)}
.fi-green{background:rgba(16,185,129,.15)}
.fi-purple{background:rgba(139,92,246,.15)}
.fi-amber{background:rgba(245,158,11,.15)}
.fi-rose{background:rgba(244,63,94,.15)}
.feat-desc{font-size:.875rem;color:var(--text-sub);line-height:1.55;margin-top:.3rem}

/* ── ROLE PORTAL CARDS ───────────────────────────────────────────────────── */
.portals-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem;margin-top:2rem}
@media(max-width:768px){.portals-grid{grid-template-columns:1fr}}
.portal-card{
  border-radius:var(--radius);padding:2rem;position:relative;overflow:hidden;
  border:1px solid var(--border);
}
.portal-card.pc-blue{background:linear-gradient(135deg,rgba(37,99,235,.15),rgba(37,99,235,.04));border-color:rgba(37,99,235,.3)}
.portal-card.pc-green{background:linear-gradient(135deg,rgba(5,150,105,.15),rgba(5,150,105,.04));border-color:rgba(5,150,105,.3)}
.portal-card.pc-amber{background:linear-gradient(135deg,rgba(217,119,6,.15),rgba(217,119,6,.04));border-color:rgba(217,119,6,.3)}
.portal-card.pc-purple{background:linear-gradient(135deg,rgba(124,58,237,.15),rgba(124,58,237,.04));border-color:rgba(124,58,237,.3)}
.portal-icon{font-size:2.5rem;margin-bottom:.75rem}
.portal-badge{
  display:inline-block;padding:.2rem .6rem;border-radius:4px;
  font-size:.65rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;
  margin-bottom:.5rem;
}
.pb-blue{background:rgba(37,99,235,.25);color:#93c5fd}
.pb-green{background:rgba(5,150,105,.25);color:#6ee7b7}
.pb-amber{background:rgba(217,119,6,.25);color:#fcd34d}
.pb-purple{background:rgba(124,58,237,.25);color:#c4b5fd}
.portal-card h3{font-size:1.3rem;font-weight:800;color:#fff;margin-bottom:.5rem}
.portal-card p{font-size:.875rem;color:var(--text-sub);line-height:1.55;margin-bottom:1rem}
.feature-list{list-style:none;display:flex;flex-direction:column;gap:.4rem}
.feature-list li{font-size:.825rem;color:#cbd5e1;display:flex;align-items:flex-start;gap:.5rem}
.feature-list li::before{content:'✓';font-weight:700;flex-shrink:0;margin-top:1px}
.fli-blue .feature-list li::before{color:#60a5fa}
.fli-green .feature-list li::before{color:#34d399}
.fli-amber .feature-list li::before{color:#fbbf24}
.fli-purple .feature-list li::before{color:#a78bfa}

/* ── SCREENSHOTS ─────────────────────────────────────────────────────────── */
.screen-frame{
  border-radius:12px;overflow:hidden;
  border:1px solid rgba(255,255,255,.12);
  box-shadow:0 20px 60px rgba(0,0,0,.6);background:#1e293b;
}
.screen-bar{
  height:28px;background:#1e293b;display:flex;align-items:center;gap:5px;padding:0 12px;
  border-bottom:1px solid rgba(255,255,255,.08);
}
.screen-bar span{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.15)}
.screen-bar span:nth-child(1){background:#ff5f57}
.screen-bar span:nth-child(2){background:#febc2e}
.screen-bar span:nth-child(3){background:#28c840}
.screen-img{width:100%;display:block;max-height:340px;object-fit:cover;object-position:top}
.screen-label{
  padding:.5rem 1rem;font-size:.75rem;font-weight:600;color:var(--text-muted);
  border-top:1px solid var(--border);background:#111827;text-align:center;
}
.screen-missing{
  height:200px;display:flex;align-items:center;justify-content:center;
  color:var(--text-muted);font-size:.85rem;background:var(--surface);
}

/* ── SCREENSHOT SHOWCASE LAYOUT ──────────────────────────────────────────── */
.showcase{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;align-items:center}
.showcase.reverse{direction:rtl}
.showcase.reverse>*{direction:ltr}
@media(max-width:900px){.showcase,.showcase.reverse{grid-template-columns:1fr}}
.showcase-text{padding:.5rem 0}
.showcase-screens{display:grid;gap:1rem}
.showcase-screens.two{grid-template-columns:1fr 1fr}
.showcase-screens.one{grid-template-columns:1fr}

/* ── TIMELINE / PROCESS ──────────────────────────────────────────────────── */
.process-row{display:flex;gap:1.5rem;flex-wrap:wrap;margin-top:2rem}
.process-step{
  flex:1;min-width:160px;background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius-sm);padding:1.25rem;position:relative;
}
.process-step::after{
  content:'→';position:absolute;right:-1.2rem;top:50%;transform:translateY(-50%);
  color:var(--text-muted);font-size:1.2rem;
}
.process-step:last-child::after{display:none}
.step-num{
  width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));
  display:flex;align-items:center;justify-content:center;
  font-size:.8rem;font-weight:900;color:#fff;margin-bottom:.75rem;
}

/* ── TECH STACK ──────────────────────────────────────────────────────────── */
.tech-pills{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1rem}
.tech-pill{
  padding:.4rem 1rem;border-radius:20px;font-size:.8rem;font-weight:600;
  border:1px solid var(--border);background:var(--surface);color:var(--text-sub);
}

/* ── QUOTE / CALLOUT ────────────────────────────────────────────────────── */
.callout{
  border-left:3px solid var(--blue);padding:1.25rem 1.5rem;
  background:rgba(59,130,246,.07);border-radius:0 var(--radius-sm) var(--radius-sm) 0;
  margin-top:1.5rem;
}
.callout p{color:#cbd5e1;font-size:.95rem;line-height:1.6;font-style:italic}

/* ── BIG NUMBER HIGHLIGHT ────────────────────────────────────────────────── */
.big-numbers{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1.5rem;margin-top:2rem}
.big-num-card{
  text-align:center;padding:2rem 1rem;
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  transition:transform .2s;
}
.big-num-card:hover{transform:scale(1.03)}
.bnn{font-size:3.5rem;font-weight:900;line-height:1;background:linear-gradient(135deg,var(--blue),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.bnl{font-size:.8rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;margin-top:.5rem}
.bns{font-size:.78rem;color:var(--text-sub);margin-top:.4rem}

/* ── CTA SECTION ─────────────────────────────────────────────────────────── */
.cta-box{
  text-align:center;padding:4rem 2rem;
  background:linear-gradient(135deg,rgba(99,102,241,.12),rgba(139,92,246,.08));
  border:1px solid rgba(99,102,241,.3);border-radius:24px;
  position:relative;overflow:hidden;
}
.cta-glow{
  position:absolute;width:400px;height:400px;border-radius:50%;
  background:rgba(99,102,241,.15);filter:blur(80px);
  top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;
}
.btn-primary{
  display:inline-flex;align-items:center;gap:.5rem;
  padding:1rem 2.5rem;background:linear-gradient(135deg,#4f46e5,#7c3aed);
  color:#fff;border-radius:50px;font-size:1rem;font-weight:700;
  text-decoration:none;transition:all .25s;box-shadow:0 8px 30px rgba(99,102,241,.4);
}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(99,102,241,.6)}
.btn-secondary{
  display:inline-flex;align-items:center;gap:.5rem;
  padding:1rem 2.5rem;background:var(--surface);
  color:#fff;border-radius:50px;font-size:1rem;font-weight:700;
  text-decoration:none;border:1px solid var(--border);transition:all .25s;
}
.btn-secondary:hover{background:rgba(255,255,255,.08)}
.btn-row{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem}

/* ── DIVIDER ─────────────────────────────────────────────────────────────── */
.section-divider{height:1px;background:linear-gradient(90deg,transparent,var(--border),transparent);margin:0}

/* ── SCROLL INDICATOR ────────────────────────────────────────────────────── */
.scroll-hint{
  position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);
  display:flex;flex-direction:column;align-items:center;gap:.4rem;
  color:var(--text-muted);font-size:.72rem;letter-spacing:.08em;
  text-transform:uppercase;animation:bounce 2s infinite;
}
.scroll-hint svg{width:20px;height:20px;opacity:.5}
@keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(6px)}}

/* ── PROBLEM CARDS ───────────────────────────────────────────────────────── */
.problems-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;margin-top:2rem}
@media(max-width:768px){.problems-grid{grid-template-columns:1fr}}
.problem-card{
  padding:1.75rem;background:rgba(244,63,94,.06);
  border:1px solid rgba(244,63,94,.15);border-radius:var(--radius);
}
.problem-card .p-icon{font-size:2rem;margin-bottom:.75rem}
.problem-card h4{color:#fca5a5;font-weight:700;margin-bottom:.4rem}
.problem-card p{font-size:.85rem;color:var(--text-sub);line-height:1.55}

/* ── SOLUTION CARDS ──────────────────────────────────────────────────────── */
.solution-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;margin-top:2rem}
@media(max-width:768px){.solution-cards{grid-template-columns:1fr}}
.solution-card{
  padding:1.75rem;background:rgba(16,185,129,.06);
  border:1px solid rgba(16,185,129,.15);border-radius:var(--radius);
}
.solution-card .s-icon{font-size:2rem;margin-bottom:.75rem}
.solution-card h4{color:#6ee7b7;font-weight:700;margin-bottom:.4rem}
.solution-card p{font-size:.85rem;color:var(--text-sub);line-height:1.55}

/* ── FOOTER ──────────────────────────────────────────────────────────────── */
footer{
  background:#020609;border-top:1px solid var(--border);
  padding:2.5rem 48px;display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:1rem;
}
footer p{font-size:.82rem;color:var(--text-muted)}
footer a{color:var(--blue);text-decoration:none}

/* ── ANIMATIONS ──────────────────────────────────────────────────────────── */
.fade-up{opacity:0;transform:translateY(30px);transition:opacity .7s ease,transform .7s ease}
.fade-up.visible{opacity:1;transform:translateY(0)}

/* ── COMPARISON TABLE ────────────────────────────────────────────────────── */
.compare-table{width:100%;border-collapse:collapse;margin-top:1.5rem;font-size:.9rem}
.compare-table th{padding:.875rem 1.25rem;text-align:left;background:rgba(99,102,241,.1);color:#e2e8f0;font-weight:700;border:1px solid var(--border)}
.compare-table td{padding:.75rem 1.25rem;border:1px solid var(--border);color:var(--text-sub)}
.compare-table tr:nth-child(even) td{background:rgba(255,255,255,.02)}
.check-yes{color:var(--green);font-weight:700;font-size:1.1rem}
.check-no{color:var(--text-muted)}
.check-partial{color:var(--amber)}

/* ── MODULE BADGES ───────────────────────────────────────────────────────── */
.module-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.75rem;margin-top:1.5rem}
.module-badge{
  display:flex;align-items:center;gap:.6rem;
  padding:.6rem 1rem;background:var(--surface);
  border:1px solid var(--border);border-radius:8px;
  font-size:.82rem;color:#cbd5e1;
}
.module-badge span{font-size:1rem}
</style>
</head>
<body>

<!-- ══ NAVIGATION ══════════════════════════════════════════════════════════ -->
<nav id="nav">
  <div class="nav-brand">SCL <span>Institute</span></div>
  <div class="nav-links-bar">
    <a href="#overview">Overview</a>
    <a href="#portals">Portals</a>
    <a href="#features">Features</a>
    <a href="#tech">Technology</a>
  </div>
  <a href="https://system.sclsandbox.xyz" target="_blank" class="nav-pill">🔗 View Live System →</a>
</nav>
<div id="progress"></div>

<!-- ══ SLIDE 1 — COVER ═════════════════════════════════════════════════════ -->
<section class="slide bg-hero" id="cover" style="min-height:100vh">
  <div class="grid-bg"></div>
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>
  <div class="slide-inner">
    <div style="max-width:780px">
      <div class="eyebrow">🎓 Enterprise Education Technology</div>
      <h1 class="mega">The <span class="grad">Complete Platform</span><br>for Modern Colleges</h1>
      <p class="lead" style="font-size:1.25rem;margin-bottom:2rem">
        SCL Institute Management System — a fully cloud-hosted, role-based portal that
        manages every aspect of college operations from admissions to graduation,
        fully integrated with Moodle LMS.
      </p>
      <div class="stats-row">
        <div class="stat-block"><div class="stat-n" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">4</div><div class="stat-l">User Roles</div></div>
        <div class="stat-block"><div class="stat-n" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">55+</div><div class="stat-l">Courses</div></div>
        <div class="stat-block"><div class="stat-n" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">100+</div><div class="stat-l">Modules</div></div>
        <div class="stat-block"><div class="stat-n" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">24/7</div><div class="stat-l">Cloud Access</div></div>
        <div class="stat-block"><div class="stat-n" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Live</div><div class="stat-l">Production Ready</div></div>
      </div>
    </div>
  </div>
  <div class="scroll-hint">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
    Scroll to explore
  </div>
</section>

<div class="section-divider"></div>

<!-- ══ SLIDE 2 — THE PROBLEM ═══════════════════════════════════════════════ -->
<section class="slide bg-dark fade-up" id="problem" style="padding:100px 40px">
  <div class="slide-inner">
    <div class="eyebrow">⚠️ The Challenge</div>
    <h2 class="section-title">What Colleges Struggle With<br>Every Single Day</h2>
    <p class="lead">Traditional college management is fragmented, manual, and error-prone. Critical data sits in spreadsheets, emails, and disconnected tools.</p>
    <div class="problems-grid">
      <div class="problem-card">
        <div class="p-icon">📋</div>
        <h4>Paper-Based Admissions</h4>
        <p>Application forms, document collection, and approval workflows are manual — causing delays, lost files, and poor tracking.</p>
      </div>
      <div class="problem-card">
        <div class="p-icon">🔀</div>
        <h4>Disconnected Systems</h4>
        <p>Student records, fees, LMS, timetables and compliance documents live in separate silos with no integration.</p>
      </div>
      <div class="problem-card">
        <div class="p-icon">😤</div>
        <h4>Poor Student Experience</h4>
        <p>Students can't access their grades, fees, documents, or support in one place — leading to frustration and disengagement.</p>
      </div>
      <div class="problem-card">
        <div class="p-icon">📊</div>
        <h4>No Real-Time Visibility</h4>
        <p>Management has no live overview of enrolments, fee collection, attendance, or compliance status.</p>
      </div>
      <div class="problem-card">
        <div class="p-icon">⚖️</div>
        <h4>Compliance Risks</h4>
        <p>Course accreditations, induction requirements, and regulatory visits are tracked in spreadsheets — easy to miss deadlines.</p>
      </div>
      <div class="problem-card">
        <div class="p-icon">💸</div>
        <h4>Fee Management Chaos</h4>
        <p>No centralised fee tracking, instalment records, or automated invoicing — finance teams work blind.</p>
      </div>
    </div>
  </div>
</section>

<div class="section-divider"></div>

<!-- ══ SLIDE 3 — THE SOLUTION ══════════════════════════════════════════════ -->
<section class="slide bg-surface fade-up" id="solution" style="padding:100px 40px">
  <div class="grid-bg"></div>
  <div class="slide-inner">
    <div class="eyebrow eyebrow-green">✅ Our Solution</div>
    <h2 class="section-title">One Unified Platform.<br><span class="accent">Every Role. Every Process.</span></h2>
    <p class="lead">SCL Institute Management System replaces every disconnected tool with a single, beautifully designed cloud platform — built specifically for further and higher education institutions.</p>
    <div class="solution-cards">
      <div class="solution-card">
        <div class="s-icon">🏗️</div>
        <h4>Complete Infrastructure</h4>
        <p>Cloud-hosted, HTTPS-secured, Docker-containerised system with automatic backups. No hardware needed.</p>
      </div>
      <div class="solution-card">
        <div class="s-icon">🎯</div>
        <h4>Role-Based Portals</h4>
        <p>Dedicated dashboards for Students, Faculty, College Admins, and Managers — each seeing exactly what they need.</p>
      </div>
      <div class="solution-card">
        <div class="s-icon">🔗</div>
        <h4>Moodle LMS Integration</h4>
        <p>Seamless Single Sign-On to Moodle. Students and faculty move between the portal and LMS without a second login.</p>
      </div>
      <div class="solution-card">
        <div class="s-icon">📈</div>
        <h4>Real-Time Reporting</h4>
        <p>Live dashboards for admissions pipeline, fee collection status, enrolment counts, and compliance progress.</p>
      </div>
      <div class="solution-card">
        <div class="s-icon">🛡️</div>
        <h4>Compliance Management</h4>
        <p>Course accreditations, induction requirements, external visits, and compliance calendar — all tracked in one place.</p>
      </div>
      <div class="solution-card">
        <div class="s-icon">💰</div>
        <h4>Fees & Finance</h4>
        <p>Complete fee lifecycle — instalment schedules, payment tracking, waiver management, and printable invoices.</p>
      </div>
    </div>
  </div>
</section>

<div class="section-divider"></div>

<!-- ══ SLIDE 4 — KEY NUMBERS ═══════════════════════════════════════════════ -->
<section class="slide bg-dark fade-up" id="overview" style="padding:100px 40px">
  <div class="blob blob-1" style="opacity:.3"></div>
  <div class="slide-inner">
    <div class="eyebrow eyebrow-blue">📊 At a Glance</div>
    <h2 class="section-title">Built for Scale.<br><span class="accent">Ready from Day One.</span></h2>
    <div class="big-numbers">
      <div class="big-num-card"><div class="bnn">4</div><div class="bnl">User Roles</div><div class="bns">Student · Faculty · College Admin · Manager</div></div>
      <div class="big-num-card"><div class="bnn">55+</div><div class="bnl">Courses</div><div class="bns">Imported from SCLondon course catalog</div></div>
      <div class="big-num-card"><div class="bnn">114</div><div class="bnl">Modules</div><div class="bns">Features tracked &amp; live in production</div></div>
      <div class="big-num-card"><div class="bnn">96%</div><div class="bnl">Completed</div><div class="bns">96 of 114 features fully live</div></div>
      <div class="big-num-card"><div class="bnn">100%</div><div class="bnl">Cloud Hosted</div><div class="bns">HTTPS, Docker, auto-restart, backups</div></div>
      <div class="big-num-card"><div class="bnn">1</div><div class="bnl">Login</div><div class="bns">SSO — one login accesses portal + Moodle LMS</div></div>
    </div>
    <div class="callout" style="margin-top:2.5rem;max-width:700px">
      <p>"The entire system is live in production at <strong>system.sclsandbox.xyz</strong> — not a demo or prototype. Every screenshot in this presentation is captured from the live running system."</p>
    </div>
  </div>
</section>

<div class="section-divider"></div>

<!-- ══ SLIDE 5 — PORTALS OVERVIEW ══════════════════════════════════════════ -->
<section class="slide bg-surface fade-up" id="portals" style="padding:100px 40px">
  <div class="grid-bg"></div>
  <div class="slide-inner">
    <div class="eyebrow eyebrow-purple">👥 Role-Based Portals</div>
    <h2 class="section-title">One System.<br><span class="accent">Four Powerful Portals.</span></h2>
    <p class="lead">Every user type gets a tailored experience. No clutter, no confusion — just the tools they need.</p>
    <div class="portals-grid">
      <div class="portal-card pc-blue fli-blue">
        <div class="portal-icon">👤</div>
        <div class="portal-badge pb-blue">Student Role</div>
        <h3>Student Portal</h3>
        <p>A fully-featured self-service portal where students manage every aspect of their academic life.</p>
        <ul class="feature-list">
          <li>Personalised dashboard with course overview</li>
          <li>Grades, assessments &amp; attendance tracking</li>
          <li>Fee balance &amp; instalment schedule</li>
          <li>Document centre &amp; right-to-study</li>
          <li>Support hub — raise &amp; track tickets</li>
          <li>Timetable, library &amp; course materials</li>
          <li>One-click Moodle LMS access (SSO)</li>
        </ul>
      </div>
      <div class="portal-card pc-green fli-green">
        <div class="portal-icon">🎓</div>
        <div class="portal-badge pb-green">Faculty Role</div>
        <h3>Faculty Portal</h3>
        <p>Everything a teacher needs to manage courses, track students, and deliver assessments — all in one place.</p>
        <ul class="feature-list">
          <li>Faculty dashboard with course KPIs</li>
          <li>My Teaching Programme — full course list</li>
          <li>Assignments, quizzes &amp; grading via Moodle</li>
          <li>Student activity &amp; progress reports</li>
          <li>Personal timetable view</li>
          <li>Faculty onboarding checklist</li>
          <li>Direct SSO link to Moodle teaching environment</li>
        </ul>
      </div>
      <div class="portal-card pc-amber fli-amber">
        <div class="portal-icon">🏛️</div>
        <div class="portal-badge pb-amber">College Admin Role</div>
        <h3>College Admin Portal</h3>
        <p>Day-to-day admissions and student management for College Admin staff — without needing full system access.</p>
        <ul class="feature-list">
          <li>Admissions hub — new applications pipeline</li>
          <li>Application review, approve, reject, defer</li>
          <li>Student records management</li>
          <li>Programme intake &amp; cohort management</li>
          <li>Moodle LMS enrolment sync</li>
          <li>Student support inbox</li>
          <li>Student onboarding checklist tracking</li>
        </ul>
      </div>
      <div class="portal-card pc-purple fli-purple">
        <div class="portal-icon">⚙️</div>
        <div class="portal-badge pb-purple">Manager Role</div>
        <h3>Manager / Admin Portal</h3>
        <p>Full system control — every module, every report, every setting — for senior management and system administrators.</p>
        <ul class="feature-list">
          <li>System-wide KPI dashboard &amp; reports</li>
          <li>Complete student &amp; faculty management</li>
          <li>Course lifecycle, accreditations &amp; inductions</li>
          <li>Fees management &amp; invoice generation</li>
          <li>Partners, vendors &amp; facility management</li>
          <li>User role management &amp; privilege control</li>
          <li>Compliance calendar &amp; regulatory tracking</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<div class="section-divider"></div>

<!-- ══ SLIDE 6 — STUDENT PORTAL SCREENSHOTS ════════════════════════════════ -->
<section class="slide bg-blue fade-up" style="padding:80px 40px">
  <div class="blob blob-1" style="background:rgba(37,99,235,.2);opacity:.4"></div>
  <div class="slide-inner">
    <div class="eyebrow eyebrow-blue">👤 Student Experience</div>
    <div class="showcase">
      <div class="showcase-text">
        <h2 class="section-title" style="font-size:2.2rem">Students Love<br><span class="accent">Their Portal</span></h2>
        <p class="body" style="margin-bottom:1.5rem">From the moment they log in, students have instant access to everything — no hunting through emails or calling admin. Their entire academic life in one clean dashboard.</p>
        <ul class="feature-list fli-blue" style="gap:.6rem">
          <li>Live grade tracking — see progress in real-time</li>
          <li>Upcoming assessments with deadlines highlighted</li>
          <li>Personal fee account with instalment breakdown</li>
          <li>Complete document centre — upload visa, transcripts</li>
          <li>Course change requests submitted in seconds</li>
          <li>Support tickets — raise an issue, track its progress</li>
        </ul>
      </div>
      <div class="showcase-screens two">
        ${screen('s01-student-dashboard.jpg','Student Dashboard','Student Dashboard')}
        ${screen('s06-student-grades.jpg','Student Grades','Grades & Progress')}
        ${screen('s05-student-assessments.jpg','Student Assessments','Assessments')}
        ${screen('s04-student-profile.jpg','Student Profile','My Profile')}
      </div>
    </div>
  </div>
</section>

<div class="section-divider"></div>

<!-- ══ SLIDE 7 — MANAGER / ADMIN SCREENSHOTS ═══════════════════════════════ -->
<section class="slide bg-purple fade-up" style="padding:80px 40px">
  <div class="blob blob-2" style="background:rgba(124,58,237,.2);opacity:.4"></div>
  <div class="slide-inner">
    <div class="eyebrow eyebrow-purple">⚙️ Management Dashboard</div>
    <div class="showcase reverse">
      <div class="showcase-text">
        <h2 class="section-title" style="font-size:2.2rem">Total System<br><span style="color:#a78bfa">Visibility</span></h2>
        <p class="body" style="margin-bottom:1.5rem">Managers see everything — from how many applications are pending to which courses have compliance issues. Every KPI on one screen, drilling down to individual records in one click.</p>
        <ul class="feature-list fli-purple" style="gap:.6rem">
          <li>System-wide KPIs: students, enrolments, fees, applications</li>
          <li>Application pipeline with 1-click approve/reject</li>
          <li>Programme intake management with capacity tracking</li>
          <li>Moodle LMS enrolment sync — 93 students, live</li>
          <li>Course lifecycle — accreditations, inductions, visits</li>
          <li>Full user management — assign roles, reset passwords</li>
        </ul>
      </div>
      <div class="showcase-screens two">
        ${screen('s27-manager-reports.jpg','Manager Dashboard','Admin Overview')}
        ${screen('s22-manager-applications.jpg','Student Applications','Applications')}
        ${screen('s23-manager-intakes.jpg','Programme Intakes','Programme Intakes')}
        ${screen('s25-manager-lifecycle.jpg','Course Lifecycle','Course Lifecycle')}
      </div>
    </div>
  </div>
</section>

<div class="section-divider"></div>

<!-- ══ SLIDE 8 — COLLEGE ADMIN SCREENSHOTS ═════════════════════════════════ -->
<section class="slide bg-amber fade-up" style="padding:80px 40px">
  <div class="blob blob-1" style="background:rgba(217,119,6,.2);opacity:.4"></div>
  <div class="slide-inner">
    <div class="eyebrow eyebrow-amber">🏛️ College Admin View</div>
    <div class="showcase">
      <div class="showcase-text">
        <h2 class="section-title" style="font-size:2.2rem">Admissions<br><span style="color:#fbbf24">Made Simple</span></h2>
        <p class="body" style="margin-bottom:1.5rem">College Admin staff handle the day-to-day admission flow without needing full system access. A focused, purpose-built interface for what they actually do.</p>
        <ul class="feature-list fli-amber" style="gap:.6rem">
          <li>View and process student applications end-to-end</li>
          <li>Review uploaded documents and applicant details</li>
          <li>Manage student records and programme enrolments</li>
          <li>Create &amp; manage intake cohorts</li>
          <li>Sync approved students to Moodle LMS</li>
          <li>Respond to student support tickets</li>
        </ul>
      </div>
      <div class="showcase-screens two">
        ${screen('s31-cadmin-dashboard.jpg','College Admin Dashboard','Admin Overview')}
        ${screen('s32-cadmin-applications.jpg','Applications List','Applications')}
        ${screen('s33-cadmin-students.jpg','Student Management','Student Management')}
        ${screen('s34-cadmin-intakes.jpg','Course Intakes','Course Intakes')}
      </div>
    </div>
  </div>
</section>

<div class="section-divider"></div>

<!-- ══ SLIDE 9 — MOODLE LMS ════════════════════════════════════════════════ -->
<section class="slide bg-green fade-up" style="padding:80px 40px">
  <div class="blob blob-2" style="background:rgba(16,185,129,.2);opacity:.4"></div>
  <div class="slide-inner">
    <div class="eyebrow eyebrow-green">🎓 Moodle LMS Integration</div>
    <div class="showcase reverse">
      <div class="showcase-text">
        <h2 class="section-title" style="font-size:2.2rem">Powered by<br><span style="color:#34d399">Moodle 4.3</span></h2>
        <p class="body" style="margin-bottom:1.5rem">The system integrates directly with Moodle, the world's leading open-source LMS. Students and faculty access their courses through a single seamless login — no separate Moodle account needed.</p>
        <ul class="feature-list fli-green" style="gap:.6rem">
          <li>Single Sign-On (SSO) — one login, both systems</li>
          <li>55+ courses across 10+ programme categories</li>
          <li>Auto-enrolment on application approval</li>
          <li>Student attendance via Moodle Attendance plugin</li>
          <li>Grade sync — live in the student portal</li>
          <li>Custom SCL-branded Moodle theme</li>
          <li>Cohort-based enrolment groups per intake</li>
        </ul>
      </div>
      <div class="showcase-screens one" style="max-width:480px">
        ${screen('s24-manager-lms.jpg','LMS Enrolments','Moodle LMS Enrolment Management')}
        ${screen('03-moodle-lms.png','Moodle LMS','Moodle LMS — Branded Theme')}
      </div>
    </div>
  </div>
</section>

<div class="section-divider"></div>

<!-- ══ SLIDE 10 — ALL FEATURES ═════════════════════════════════════════════ -->
<section class="slide bg-dark fade-up" id="features" style="padding:100px 40px">
  <div class="grid-bg"></div>
  <div class="slide-inner">
    <div class="eyebrow">🧩 Complete Feature Set</div>
    <h2 class="section-title">Everything You Need.<br><span class="accent">Nothing You Don't.</span></h2>
    <p class="lead">Every module purpose-built for UK further and higher education institutions. 96 features live in production.</p>
    <div class="features-grid">
      <div class="feat-card">
        <div class="feat-icon fi-blue">🔐</div>
        <h3 class="card-title">Role-Based Access Control</h3>
        <p class="feat-desc">4 distinct roles with configurable privilege flags. Admin can toggle feature access per role without code changes.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon fi-green">📝</div>
        <h3 class="card-title">Admissions Management</h3>
        <p class="feat-desc">Full application pipeline — from online form submission to document review, approval, and Moodle enrolment.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon fi-purple">📊</div>
        <h3 class="card-title">Course Lifecycle</h3>
        <p class="feat-desc">Track every course from creation through accreditation, induction sign-off, external visits, to active delivery.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon fi-amber">💰</div>
        <h3 class="card-title">Fees & Finance</h3>
        <p class="feat-desc">Semester instalment schedules, payment tracking, waiver management, PDF invoice generation, and payment reminders.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon fi-rose">🛡️</div>
        <h3 class="card-title">Compliance & Accreditations</h3>
        <p class="feat-desc">Course accreditation records with awarding body tracking, conditions, documents, and sign-off workflows.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon fi-blue">📋</div>
        <h3 class="card-title">Induction Management</h3>
        <p class="feat-desc">Per-course induction requirements, risk records, conditions, and sign-offs. Student-facing induction checklist.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon fi-green">🗓️</div>
        <h3 class="card-title">Timetable & Attendance</h3>
        <p class="feat-desc">Weekly/daily timetable view for students and faculty. Attendance records synced from Moodle Attendance plugin.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon fi-purple">🔔</div>
        <h3 class="card-title">Notifications System</h3>
        <p class="feat-desc">Real-time in-app notifications for all roles. Read/unread state, role-targeted messages, bell indicator.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon fi-amber">🤝</div>
        <h3 class="card-title">Support Hub</h3>
        <p class="feat-desc">Students raise categorised support tickets. Admin responds with full reply thread. Resolve and track all issues.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon fi-rose">🏢</div>
        <h3 class="card-title">Partners & Vendors</h3>
        <p class="feat-desc">Manage partner institutions and third-party vendors. Privilege-gated — only visible to authorised managers.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon fi-blue">🏗️</div>
        <h3 class="card-title">Facility Management</h3>
        <p class="feat-desc">Track rooms, labs, and physical assets. Assign resources to courses and manage capacity.</p>
      </div>
      <div class="feat-card">
        <div class="feat-icon fi-green">📈</div>
        <h3 class="card-title">Reports & Analytics</h3>
        <p class="feat-desc">Student reports, application analytics, programme summaries — all exportable. KPI dashboard for management.</p>
      </div>
    </div>
  </div>
</section>

<div class="section-divider"></div>

<!-- ══ SLIDE 11 — FULL MODULE LIST ════════════════════════════════════════ -->
<section class="slide bg-surface fade-up" style="padding:80px 40px">
  <div class="grid-bg"></div>
  <div class="slide-inner">
    <div class="eyebrow eyebrow-green">✅ What's Live Right Now</div>
    <h2 class="section-title">96 Features.<br><span class="accent">All Live in Production.</span></h2>
    <div class="module-grid">
      <div class="module-badge"><span>👤</span> Student Dashboard</div>
      <div class="module-badge"><span>📚</span> My Programme</div>
      <div class="module-badge"><span>📊</span> Grades & Results</div>
      <div class="module-badge"><span>📝</span> Assessments</div>
      <div class="module-badge"><span>🗓️</span> Timetable</div>
      <div class="module-badge"><span>👁️</span> Attendance</div>
      <div class="module-badge"><span>💰</span> Student Fees</div>
      <div class="module-badge"><span>📄</span> Documents Centre</div>
      <div class="module-badge"><span>✍️</span> Learning Contract</div>
      <div class="module-badge"><span>🔄</span> Course Changes</div>
      <div class="module-badge"><span>🛂</span> Right to Study</div>
      <div class="module-badge"><span>📖</span> Library Access</div>
      <div class="module-badge"><span>🆘</span> Support Hub</div>
      <div class="module-badge"><span>🔔</span> Notifications</div>
      <div class="module-badge"><span>🎓</span> Faculty Dashboard</div>
      <div class="module-badge"><span>📋</span> Teaching Programme</div>
      <div class="module-badge"><span>🧪</span> Assessment Manager</div>
      <div class="module-badge"><span>📉</span> Course Reports</div>
      <div class="module-badge"><span>🏛️</span> College Admin Portal</div>
      <div class="module-badge"><span>📥</span> Admissions Hub</div>
      <div class="module-badge"><span>🔍</span> Application Review</div>
      <div class="module-badge"><span>👥</span> Student Management</div>
      <div class="module-badge"><span>📅</span> Programme Intakes</div>
      <div class="module-badge"><span>🔗</span> LMS Enrolment Sync</div>
      <div class="module-badge"><span>⚙️</span> Manager Dashboard</div>
      <div class="module-badge"><span>📑</span> Application Reports</div>
      <div class="module-badge"><span>🏗️</span> Course Lifecycle</div>
      <div class="module-badge"><span>🏅</span> Course Accreditations</div>
      <div class="module-badge"><span>📋</span> Course Inductions</div>
      <div class="module-badge"><span>🔎</span> External Visits</div>
      <div class="module-badge"><span>⚖️</span> Compliance Calendar</div>
      <div class="module-badge"><span>🧾</span> Fee Invoices (PDF)</div>
      <div class="module-badge"><span>💳</span> Instalment Tracking</div>
      <div class="module-badge"><span>🤫</span> Fee Waivers</div>
      <div class="module-badge"><span>🤝</span> Partners Management</div>
      <div class="module-badge"><span>🏢</span> Vendor Management</div>
      <div class="module-badge"><span>🏗️</span> Facility Management</div>
      <div class="module-badge"><span>🔐</span> Role Privileges Config</div>
      <div class="module-badge"><span>👤</span> User Management</div>
      <div class="module-badge"><span>🎓</span> Faculty Onboarding</div>
      <div class="module-badge"><span>🧑‍🎓</span> Student Onboarding</div>
      <div class="module-badge"><span>🔑</span> SSO — Moodle Login</div>
      <div class="module-badge"><span>🌐</span> Moodle Themed LMS</div>
      <div class="module-badge"><span>☁️</span> Cloud Infrastructure</div>
    </div>
  </div>
</section>

<div class="section-divider"></div>

<!-- ══ SLIDE 12 — TECHNOLOGY STACK ════════════════════════════════════════ -->
<section class="slide bg-dark fade-up" id="tech" style="padding:100px 40px">
  <div class="blob blob-3" style="background:rgba(99,102,241,.1);opacity:.4"></div>
  <div class="slide-inner">
    <div class="eyebrow">⚡ Technology</div>
    <h2 class="section-title">Built on Modern,<br><span class="accent">Enterprise-Grade Tech</span></h2>
    <p class="lead">Every component chosen for reliability, scalability, and security. No proprietary lock-in — all industry-standard open technologies.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.5rem;margin-top:2rem">
      <div>
        <h3 style="color:var(--blue);font-size:1rem;font-weight:700;margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.06em">Frontend</h3>
        <div class="tech-pills">
          <span class="tech-pill">React 18</span>
          <span class="tech-pill">Vite</span>
          <span class="tech-pill">Tailwind CSS</span>
          <span class="tech-pill">React Router v6</span>
          <span class="tech-pill">Axios</span>
        </div>
      </div>
      <div>
        <h3 style="color:var(--green);font-size:1rem;font-weight:700;margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.06em">Backend</h3>
        <div class="tech-pills">
          <span class="tech-pill">Node.js</span>
          <span class="tech-pill">Express.js</span>
          <span class="tech-pill">MySQL 8</span>
          <span class="tech-pill">JWT Auth</span>
          <span class="tech-pill">REST API</span>
        </div>
      </div>
      <div>
        <h3 style="color:var(--purple);font-size:1rem;font-weight:700;margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.06em">Infrastructure</h3>
        <div class="tech-pills">
          <span class="tech-pill">Docker</span>
          <span class="tech-pill">Nginx 1.29</span>
          <span class="tech-pill">Ubuntu VPS</span>
          <span class="tech-pill">Let's Encrypt SSL</span>
          <span class="tech-pill">Git / GitHub</span>
        </div>
      </div>
    </div>
    <div style="margin-top:2.5rem">
      <h3 style="color:var(--amber);font-size:1rem;font-weight:700;margin-bottom:.75rem;text-transform:uppercase;letter-spacing:.06em">LMS & Integrations</h3>
      <div class="tech-pills">
        <span class="tech-pill">Moodle 4.3</span>
        <span class="tech-pill">Custom SSO Plugin</span>
        <span class="tech-pill">Moodle REST API</span>
        <span class="tech-pill">Attendance Plugin</span>
        <span class="tech-pill">Custom SCL Theme</span>
        <span class="tech-pill">Cohort Enrolments</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:2rem">
      <div class="feat-card" style="border-color:rgba(16,185,129,.2)">
        <div class="feat-icon fi-green">🔒</div>
        <h3 class="card-title">Security</h3>
        <p class="feat-desc">HTTPS on all endpoints, JWT token authentication, session verification on every page load, role-privilege enforcement at API and UI level, secure password hashing.</p>
      </div>
      <div class="feat-card" style="border-color:rgba(59,130,246,.2)">
        <div class="feat-icon fi-blue">☁️</div>
        <h3 class="card-title">Reliability</h3>
        <p class="feat-desc">Docker containers with auto-restart, Nginx reverse proxy with load balancing config, database backups, zero-downtime deployment via Git pull workflow.</p>
      </div>
    </div>
  </div>
</section>

<div class="section-divider"></div>

<!-- ══ SLIDE 13 — COMPETITIVE COMPARISON ══════════════════════════════════ -->
<section class="slide bg-surface fade-up" style="padding:80px 40px">
  <div class="grid-bg"></div>
  <div class="slide-inner">
    <div class="eyebrow eyebrow-blue">🏆 Why Choose Us</div>
    <h2 class="section-title">How We Compare</h2>
    <p class="lead">Unlike generic off-the-shelf systems, SCL Institute Management was built specifically for UK further &amp; higher education — and is already live.</p>
    <table class="compare-table">
      <thead>
        <tr>
          <th>Feature</th>
          <th>SCL Institute System</th>
          <th>Generic SIMS</th>
          <th>Spreadsheets / Email</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>UK Education Purpose-Built</td><td class="check-yes">✓ Yes</td><td class="check-partial">⚠ Partial</td><td class="check-no">✗ No</td></tr>
        <tr><td>Moodle LMS Integration + SSO</td><td class="check-yes">✓ Included</td><td class="check-no">✗ Extra cost</td><td class="check-no">✗ No</td></tr>
        <tr><td>Role-Based Portals (4 roles)</td><td class="check-yes">✓ Yes</td><td class="check-partial">⚠ Limited</td><td class="check-no">✗ No</td></tr>
        <tr><td>Course Accreditation Tracking</td><td class="check-yes">✓ Built-in</td><td class="check-no">✗ Not included</td><td class="check-partial">⚠ Manual</td></tr>
        <tr><td>Induction Requirements Manager</td><td class="check-yes">✓ Built-in</td><td class="check-no">✗ Not included</td><td class="check-partial">⚠ Manual</td></tr>
        <tr><td>Fee Instalment + Invoice PDF</td><td class="check-yes">✓ Built-in</td><td class="check-partial">⚠ Add-on cost</td><td class="check-partial">⚠ Manual</td></tr>
        <tr><td>Cloud-hosted, HTTPS, Docker</td><td class="check-yes">✓ Included</td><td class="check-partial">⚠ Varies</td><td class="check-no">✗ No</td></tr>
        <tr><td>Live in Production Today</td><td class="check-yes">✓ Yes</td><td class="check-partial">⚠ Setup required</td><td class="check-yes">✓ Yes</td></tr>
        <tr><td>Customisable to Your Brand</td><td class="check-yes">✓ Fully customisable</td><td class="check-no">✗ Locked themes</td><td class="check-yes">✓ Yes</td></tr>
        <tr><td>Student Self-Service Portal</td><td class="check-yes">✓ Full portal</td><td class="check-partial">⚠ Basic only</td><td class="check-no">✗ No</td></tr>
      </tbody>
    </table>
  </div>
</section>

<div class="section-divider"></div>

<!-- ══ SLIDE 14 — CTA ══════════════════════════════════════════════════════ -->
<section class="slide bg-hero fade-up" style="padding:100px 40px;min-height:80vh">
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>
  <div class="grid-bg"></div>
  <div class="slide-inner" style="text-align:center">
    <div class="eyebrow" style="margin:0 auto 1.5rem">🚀 Ready to Transform Your College</div>
    <h2 class="section-title" style="font-size:clamp(2rem,5vw,4rem);text-align:center">
      See It Live.<br><span class="accent">Right Now.</span>
    </h2>
    <p class="lead" style="margin:0 auto 0.5rem;text-align:center;font-size:1.15rem">
      The system is live and running at <strong style="color:#fff">system.sclsandbox.xyz</strong><br>
      — not a mockup, not a prototype. Log in and explore every feature today.
    </p>
    <div style="margin:2rem auto 0;max-width:600px">
      <div class="cta-box">
        <div class="cta-glow"></div>
        <p style="font-size:1.1rem;color:#cbd5e1;margin-bottom:0.5rem;position:relative;z-index:1">
          Everything you've seen in this presentation is <strong style="color:#fff">live and working</strong>.
        </p>
        <p style="font-size:.9rem;color:var(--text-sub);margin-bottom:1.5rem;position:relative;z-index:1">
          Explore all 4 portals. Review every feature. Ask anything.
        </p>
        <div class="btn-row" style="position:relative;z-index:1">
          <a href="https://system.sclsandbox.xyz" target="_blank" class="btn-primary">
            🔗 Open Live System
          </a>
          <a href="https://system.sclsandbox.xyz/demo/SCL_SYSTEM_DEMO.html" target="_blank" class="btn-secondary">
            📋 Full Feature Demo
          </a>
        </div>
        <div style="margin-top:1.5rem;display:flex;gap:1.5rem;justify-content:center;flex-wrap:wrap;position:relative;z-index:1">
          <div style="text-align:left">
            <p style="font-size:.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.25rem">Student Login</p>
            <p style="font-size:.82rem;color:#94a3b8;font-family:monospace">sarah.johnson.lm@example.com<br>Password: 089f4607e213</p>
          </div>
          <div style="text-align:left">
            <p style="font-size:.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.25rem">Manager Login</p>
            <p style="font-size:.82rem;color:#94a3b8;font-family:monospace">admin@sclsandbox.xyz<br>Password: password123</p>
          </div>
          <div style="text-align:left">
            <p style="font-size:.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.25rem">College Admin Login</p>
            <p style="font-size:.82rem;color:#94a3b8;font-family:monospace">collegeadmin@scl.com<br>Password: password</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══ FOOTER ═══════════════════════════════════════════════════════════════ -->
<footer>
  <div>
    <p style="color:#fff;font-weight:700;font-size:.9rem;margin-bottom:.3rem">SCL Institute Management System</p>
    <p>Built with React 18 · Node.js · MySQL · Moodle 4.3 · Docker · Nginx</p>
  </div>
  <div style="text-align:right">
    <p><a href="https://system.sclsandbox.xyz">system.sclsandbox.xyz</a></p>
    <p>Presentation generated July 2026</p>
  </div>
</footer>

<script>
// ── Progress bar
const bar = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  bar.style.width = pct + '%';
});

// ── Fade-up on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ── Keyboard navigation
document.addEventListener('keydown', e => {
  if(e.key === 'ArrowDown' || e.key === 'PageDown') {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  }
  if(e.key === 'ArrowUp' || e.key === 'PageUp') {
    window.scrollBy({ top: -window.innerHeight * 0.85, behavior: 'smooth' });
  }
});
</script>
</body>
</html>`;

fs.writeFileSync('SCL_PITCH_DECK.html', html);
const bytes = fs.statSync('SCL_PITCH_DECK.html').size;
console.log(`Written SCL_PITCH_DECK.html ${(bytes/1024).toFixed(0)} KB`);
