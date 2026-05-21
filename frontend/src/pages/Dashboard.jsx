import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard,
    GraduationCap,
    Users,
    Key,
    ArrowUpRight,
    Activity,
    LogOut,
    Loader2,
    CheckCircle2,
    Users2,
    ShieldCheck,
    Library,
    UserCircle,
    UserSquare2,
    Settings2,
    Lock,
    ClipboardList,
    Server,
    Database,
    Wifi,
    TrendingUp,
    BookOpen,
    UserCheck,
    Clock
} from 'lucide-react';
import { openMoodleSSO } from '../utils/ssoService';
import { getRoleContext } from '../utils/roleAccess';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ─── Inline SVG helpers ─────────────────────────────────────────────────────

// Donut chart (applications by status)
function DonutChart({ segments, size = 120, strokeWidth = 18 }) {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const cx = size / 2, cy = size / 2;
    let offset = 0;
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
            {segments.map((seg, i) => {
                const dash = (seg.value / total) * circ;
                const gap = circ - dash;
                const el = (
                    <circle key={i} cx={cx} cy={cy} r={r}
                        fill="none" stroke={seg.color} strokeWidth={strokeWidth}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="butt"
                    />
                );
                offset += dash;
                return el;
            })}
        </svg>
    );
}

// Minimal horizontal bar chart
function HBarChart({ bars, maxVal }) {
    const max = maxVal || Math.max(...bars.map(b => b.value), 1);
    return (
        <div className="space-y-2">
            {bars.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-24 truncate text-gray-500 text-right shrink-0">{b.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                            className="h-3 rounded-full transition-all duration-700"
                            style={{ width: `${(b.value / max) * 100}%`, background: b.color || '#6366f1' }}
                        />
                    </div>
                    <span className="w-6 text-gray-700 font-semibold">{b.value}</span>
                </div>
            ))}
        </div>
    );
}

// Mini sparkline bar chart (monthly trend)
function SparkBar({ data, color = '#6366f1' }) {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex items-end gap-0.5 h-14">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <div
                        className="w-full rounded-sm transition-all duration-500"
                        style={{ height: `${Math.max((d.value / max) * 52, 2)}px`, background: color, opacity: 0.8 }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                        {d.label}: {d.value}
                    </div>
                </div>
            ))}
        </div>
    );
}

function formatUptime(secs) {
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

const Dashboard = ({ user, viewMode = 'auto' }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const roleContext = getRoleContext(user);

    // ─── Stats & health state ────────────────────────────────────────────────
    const [sysOverview, setSysOverview] = useState(null);
    const [dashStats, setDashStats] = useState(null);
    const [infraHealth, setInfraHealth] = useState({ api: null, db: null });

    useEffect(() => {
        // Fetch system overview counts
        axios.get(`${API_URL}/students/system-overview`)
            .then(r => r.data?.success && setSysOverview(r.data.data))
            .catch(() => {});

        // Fetch dashboard stats (applications trend etc.)
        axios.get(`${API_URL}/students/dashboard-stats`)
            .then(r => r.data?.success && setDashStats(r.data.data))
            .catch(() => {});

        // Fetch infrastructure health
        const t0 = Date.now();
        axios.get(`${API_URL}/health`)
            .then(() => setInfraHealth(prev => ({ ...prev, api: { ok: true, ms: Date.now() - t0 } })))
            .catch(() => setInfraHealth(prev => ({ ...prev, api: { ok: false, ms: null } })));
        axios.get(`${API_URL}/health/db`)
            .then(r => setInfraHealth(prev => ({ ...prev, db: { ok: r.data?.status === 'OK', ms: null } })))
            .catch(() => setInfraHealth(prev => ({ ...prev, db: { ok: false, ms: null } })));
    }, []);


    // Resolve current dashboard audience mode.
    const activeView = viewMode !== 'auto'
        ? viewMode
        : roleContext?.canAccessManagementPortal
            ? 'manager'
            : roleContext?.hasTeaching
                ? 'teacher'
                : 'student';

    const handleAccessLMS = async () => {
        setLoading(true);
        setError('');
        
        const success = await openMoodleSSO(user.email, {
            onError: (errorMsg) => setError(errorMsg),
            onSuccess: () => setError('')
        });
        
        setLoading(false);
    };

    const handleModuleClick = (module) => {
        if (module.isSSO) {
            handleAccessLMS();
        } else if (module.id === 'programs') {
            navigate(activeView === 'teacher' ? '/teacher/programme' : '/student/programme');
        } else if (module.path) {
            navigate(module.path);
        } else {
            console.log(`Navigate to ${module.id} module`);
        }
    };

    // Module definitions with explicit audience targeting
    const modules = [
        {
            id: 'applications',
            title: 'Student Applications',
            description: 'Review incoming student admission requests, applications, and manage enrollment decisions.',
            icon: Users,
            requiredRoles: ['manager', 'admin', 'admissions officer', 'super admin'],
            audiences: ['manager'],
            color: 'green',
            path: '/applications'
        },
        {
            id: 'students',
            title: 'Student Management',
            description: 'Student records, admissions, enrollment tracking and comprehensive management dashboard.',
            icon: Users2,
            requiredRoles: ['manager', 'admin', 'admissions officer', 'super admin'],
            audiences: ['manager'],
            color: 'blue',
            path: '/students'
        },
        {
            id: 'partners',
            title: 'Partner & Associates Management',
            description: 'Manage institutional partnerships and external associate directories.',
            icon: Users,
            requiredRoles: ['manager', 'admin', 'partners manager', 'super admin'],
            audiences: ['manager'],
            color: 'indigo'
        },
        {
            id: 'compliance',
            title: 'Accreditation, QA & Compliance',
            description: 'Track accreditation status, quality assurance audits, and regulatory compliance.',
            icon: ShieldCheck,
            requiredRoles: ['manager', 'admin', 'compliance officer', 'super admin'],
            audiences: ['manager'],
            color: 'indigo'
        },
        {
            id: 'course-inductions',
            title: 'Course Induction Compliance',
            description: 'Track course approval requirements, risks, conditions, and sign-offs.',
            icon: ClipboardList,
            requiredRoles: ['manager', 'admin', 'super admin'],
            audiences: ['manager'],
            color: 'blue',
            path: '/course-inductions'
        },
        {
            id: 'programs',
            title: 'Course Offerings & Program Catalog',
            description: 'Define and manage full program lifecycle, modules, and credit structures.',
            icon: Library,
            requiredRoles: ['manager', 'admin', 'teacher', 'editingteacher', 'student', 'admissions officer', 'super admin'],
            audiences: ['manager', 'teacher', 'student'],
            color: 'purple',
            path: '/student/programme'
        },
        {
            id: 'student-portal',
            title: 'Student Portal',
            description: 'Access induction resources, support requests, and formal appeals.',
            icon: UserCircle,
            requiredRoles: ['student', 'super admin', 'manager', 'admin'],
            audiences: ['student', 'manager'],
            color: 'emerald',
            path: '/student/portal'
        },
        {
            id: 'faculty-hr',
            title: 'Faculty Management & HR Directory',
            description: 'Staff directory, workload management, and HR essentials.',
            icon: UserSquare2,
            requiredRoles: ['manager', 'admin', 'faculty & hr manager', 'teacher', 'editingteacher', 'super admin'],
            audiences: ['manager', 'teacher'],
            color: 'orange'
        },
        {
            id: 'lms',
            title: 'Learning Management (Moodle)',
            description: 'Seamless Single Sign-On access to the Moodle education platform.',
            icon: GraduationCap,
            requiredRoles: ['manager', 'admin', 'lms manager', 'teacher', 'editingteacher', 'student', 'super admin'],
            audiences: ['manager', 'teacher', 'student'],
            color: 'scl-purple',
            isSSO: true
        },
        {
            id: 'governance',
            title: 'Governance & ERP Lite Essentials',
            description: 'Core institutional records, financial summaries, and governance tools.',
            icon: Settings2,
            requiredRoles: ['manager', 'admin', 'super admin'],
            audiences: ['manager'],
            color: 'slate'
        }
    ];

    // Filter modules using canonical role context from backend/login.
    const normalizedRoles = Array.isArray(roleContext?.roles)
        ? roleContext.roles
            .map((role) => String(role || '').trim().toLowerCase())
            .filter(Boolean)
        : [];
    const fallbackPrimaryRole = String(roleContext?.primaryRole || user?.role || '')
        .trim()
        .toLowerCase();
    const effectiveRoles = new Set([
        ...normalizedRoles,
        ...(fallbackPrimaryRole ? [fallbackPrimaryRole] : [])
    ]);

    const visibleModules = modules.filter((mod) => {
        const audiences = Array.isArray(mod.audiences) ? mod.audiences : [];
        if (!audiences.includes(activeView)) {
            return false;
        }

        const requiredRoles = (mod.requiredRoles || []).map((role) => String(role || '').toLowerCase());
        return requiredRoles.some((role) => effectiveRoles.has(role));
    });

    const accessLabel = roleContext?.primaryRole || user?.role || 'user';

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Institutional Dashboard</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">
                        Welcome back, <span className="text-scl-purple">{user.name}</span>. Viewing {activeView} dashboard.
                    </p>
                </div>
                <div className="hidden sm:flex space-x-2">
                    <span className="px-3 py-1 bg-scl-purple/10 text-scl-purple rounded-full text-xs font-bold uppercase tracking-wider border border-scl-purple/20">
                        {accessLabel} Access
                    </span>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-800">Operational Modules</h2>
                    <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg text-xs font-bold">{visibleModules.length}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {visibleModules.map((module, index) => {
                        // Muted gradients for less brightness
                        const gradients = [
                            'from-blue-400 to-blue-500',
                            'from-indigo-400 to-indigo-500',
                            'from-purple-400 to-purple-500',
                            'from-emerald-400 to-emerald-500',
                            'from-orange-400 to-orange-500',
                            'from-scl-purple/80 to-scl-dark/90',
                            'from-slate-500 to-slate-600'
                        ];
                        const bgGradient = gradients[index % gradients.length];

                        return (
                            <div
                                key={module.id}
                                onClick={() => handleModuleClick(module)}
                                className={`relative overflow-hidden rounded-xl p-3 border border-white/10 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer bg-gradient-to-br ${bgGradient} text-white`}
                            >
                                <div className="relative z-10 flex flex-col h-full min-h-[85px]">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="p-1.5 rounded-lg bg-white/15 backdrop-blur-md text-white shadow-md border border-white/10 group-hover:scale-105 transition-transform duration-300">
                                            <module.icon className="w-4 h-4" />
                                        </div>
                                        <div className="p-0.5 rounded-full bg-white/10 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowUpRight className="w-2.5 h-2.5" />
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-semibold mb-0.5 leading-tight tracking-tight">
                                        {module.title}
                                    </h3>

                                    <p className="text-[9px] text-white/75 leading-snug flex-grow font-medium line-clamp-1">
                                        {module.description}
                                    </p>

                                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[8px] uppercase font-black tracking-widest text-white/60">
                                            {roleContext?.hasSystemManagement ? 'Full' : 'Std'}
                                        </span>
                                        {module.isSSO ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAccessLMS(); }}
                                                disabled={loading}
                                                className="text-[10px] font-bold text-white hover:underline flex items-center space-x-1"
                                            >
                                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Launch</span>}
                                            </button>
                                        ) : (
                                            <span className="text-[10px] font-bold text-white/90 group-hover:text-white transition-colors">Open</span>
                                        )}
                                    </div>
                                </div>

                                {/* Subtle large icon overlay */}
                                <div className="absolute -top-2 -right-2 opacity-5 group-hover:opacity-15 transition-all duration-500 scale-90">
                                    <module.icon className="w-20 h-20" />
                                </div>

                                {/* Bottom shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>
                        );
                    })}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center space-x-4">
                    <ShieldCheck className="w-6 h-6 text-red-500" />
                    <div>
                        <p className="text-sm font-bold text-red-800">Security / Integration Error</p>
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                </div>
            )}

            {/* ── KPI Cards ─────────────────────────────────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-800">Institution Overview</h2>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-xs font-bold">Live</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Total Users', value: sysOverview?.total_users, icon: Users, color: 'bg-blue-500', text: 'text-blue-600' },
                        { label: 'Students', value: sysOverview?.total_students, icon: GraduationCap, color: 'bg-indigo-500', text: 'text-indigo-600' },
                        { label: 'Staff', value: sysOverview?.total_staff, icon: UserCheck, color: 'bg-purple-500', text: 'text-purple-600' },
                        { label: 'Active Courses', value: sysOverview?.total_courses, icon: BookOpen, color: 'bg-emerald-500', text: 'text-emerald-600' },
                        { label: 'Applications', value: sysOverview?.total_applications, icon: ClipboardList, color: 'bg-orange-500', text: 'text-orange-600' },
                        { label: 'Pending Review', value: sysOverview?.pending_applications, icon: Clock, color: 'bg-amber-500', text: 'text-amber-600' },
                    ].map((kpi, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
                            <div className={`w-8 h-8 ${kpi.color} rounded-lg flex items-center justify-center`}>
                                <kpi.icon className="w-4 h-4 text-white" />
                            </div>
                            <p className={`text-2xl font-extrabold ${kpi.text}`}>
                                {sysOverview ? (kpi.value ?? 0).toLocaleString() : '—'}
                            </p>
                            <p className="text-[11px] text-gray-500 font-medium leading-tight">{kpi.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Charts Row ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Application Status Donut */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Applications by Status</h3>
                    {dashStats ? (() => {
                        const palette = {
                            'accepted': '#22c55e',
                            'approved': '#16a34a',
                            'pending': '#f59e0b',
                            'rejected': '#ef4444',
                            'under_review': '#6366f1',
                            'conditional_accept': '#3b82f6',
                            'conditional': '#3b82f6',
                            'submitted': '#94a3b8',
                        };
                        const segs = (dashStats.status_summary || []).map(s => ({
                            label: s.application_status,
                            value: Number(s.count),
                            color: palette[s.application_status?.toLowerCase()] || '#cbd5e1'
                        }));
                        const total = segs.reduce((s, x) => s + x.value, 0);
                        return (
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <DonutChart segments={segs} size={110} strokeWidth={16} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-extrabold text-gray-800">{total}</span>
                                        <span className="text-[9px] text-gray-400 font-medium">Total</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    {segs.map((s, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                                            <span className="capitalize text-gray-600 truncate flex-1">{s.label.replace(/_/g, ' ')}</span>
                                            <span className="font-bold text-gray-800">{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })() : (
                        <div className="flex items-center justify-center h-28 text-gray-300 text-xs">Loading…</div>
                    )}
                </div>

                {/* Monthly Applications Trend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Monthly Applications (12 months)</h3>
                    {dashStats?.monthly_trend?.length > 0 ? (() => {
                        const bars = dashStats.monthly_trend.map(m => ({
                            label: m.month?.slice(5) || m.month,
                            value: Number(m.total)
                        }));
                        return (
                            <>
                                <SparkBar data={bars} color="#6366f1" />
                                <div className="flex justify-between mt-1">
                                    <span className="text-[9px] text-gray-400">{bars[0]?.label}</span>
                                    <span className="text-[9px] text-gray-400">{bars[bars.length - 1]?.label}</span>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Last 30 days: <strong className="text-gray-800">{sysOverview?.apps_last_30d ?? '…'}</strong> applications</span>
                                </div>
                            </>
                        );
                    })() : (
                        <div className="flex items-center justify-center h-28 text-gray-300 text-xs">
                            {dashStats ? 'No trend data yet' : 'Loading…'}
                        </div>
                    )}
                </div>

                {/* Top Courses by Applications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Top Courses by Applications</h3>
                    {dashStats?.course_summary?.length > 0 ? (() => {
                        const bars = dashStats.course_summary.slice(0, 6).map((c, i) => ({
                            label: c.course_code || c.course_title?.slice(0, 12) || `Course ${i + 1}`,
                            value: Number(c.applications),
                            color: ['#6366f1','#22c55e','#f59e0b','#3b82f6','#ef4444','#8b5cf6'][i % 6]
                        }));
                        return <HBarChart bars={bars} />;
                    })() : (
                        <div className="flex items-center justify-center h-28 text-gray-300 text-xs">
                            {dashStats ? 'No course data yet' : 'Loading…'}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Access Level & Infrastructure ──────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Active Privileges */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-700">Your Active Privileges</h3>
                        <span className="text-xs bg-scl-purple/10 text-scl-purple px-2 py-0.5 rounded-full font-bold">
                            {visibleModules.length} / {modules.length} modules
                        </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-scl-purple to-indigo-400 transition-all duration-700"
                            style={{ width: `${(visibleModules.length / Math.max(modules.length, 1)) * 100}%` }}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {modules.map(mod => {
                            const active = visibleModules.some(v => v.id === mod.id);
                            return (
                                <div
                                    key={mod.id}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                                        active
                                            ? 'bg-scl-purple/10 text-scl-purple border-scl-purple/20'
                                            : 'bg-gray-50 text-gray-300 border-gray-100'
                                    }`}
                                >
                                    <mod.icon className="w-3 h-3" />
                                    {mod.title.split('&')[0].trim().split(' ').slice(0, 2).join(' ')}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-3">
                        Role: <strong className="text-gray-600 capitalize">{accessLabel}</strong> · Access level: <strong className="text-gray-600">{roleContext?.hasSystemManagement ? 'Full System' : 'Standard'}</strong>
                    </p>
                </div>

                {/* Infrastructure Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-700">Infrastructure Status</h3>
                        <span className="text-[10px] text-gray-400">system.sclsandbox.xyz</span>
                    </div>
                    <div className="space-y-3">
                        {[
                            {
                                label: 'API Server',
                                icon: Server,
                                status: infraHealth.api == null ? 'checking' : infraHealth.api.ok ? 'ok' : 'down',
                                detail: infraHealth.api?.ok ? `${infraHealth.api.ms}ms` : infraHealth.api?.ok === false ? 'Unreachable' : '…'
                            },
                            {
                                label: 'Database (MySQL)',
                                icon: Database,
                                status: infraHealth.db == null ? 'checking' : infraHealth.db.ok ? 'ok' : 'down',
                                detail: infraHealth.db?.ok ? 'Connected' : infraHealth.db?.ok === false ? 'Error' : '…'
                            },
                            {
                                label: 'Backend Process',
                                icon: Activity,
                                status: sysOverview ? 'ok' : 'checking',
                                detail: sysOverview ? `Uptime: ${formatUptime(sysOverview.server_uptime_seconds)}` : '…'
                            },
                            {
                                label: 'Node.js Runtime',
                                icon: Settings2,
                                status: sysOverview ? 'ok' : 'checking',
                                detail: sysOverview?.node_version || '…'
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-gray-50">
                                    <item.icon className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                                    <p className="text-[10px] text-gray-400">{item.detail}</p>
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    item.status === 'ok' ? 'bg-green-50 text-green-600' :
                                    item.status === 'down' ? 'bg-red-50 text-red-600' :
                                    'bg-gray-50 text-gray-400'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        item.status === 'ok' ? 'bg-green-500' :
                                        item.status === 'down' ? 'bg-red-500' :
                                        'bg-gray-300 animate-pulse'
                                    }`} />
                                    {item.status === 'ok' ? 'Online' : item.status === 'down' ? 'Down' : 'Checking'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
