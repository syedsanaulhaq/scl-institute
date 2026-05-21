import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, GraduationCap, FileText, TrendingUp,
    ClipboardList, UserCheck, BarChart3, ArrowUpRight,
    RefreshCw, AlertCircle, Calendar, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const STATUS_COLORS = {
    accepted:  '#10b981',
    approved:  '#10b981',
    pending:   '#f59e0b',
    submitted: '#3b82f6',
    under_review: '#6366f1',
    rejected:  '#ef4444',
    conditional_accept: '#f97316',
    withdrawn: '#94a3b8',
};

const fmtMonth = (ym) => {
    if (!ym) return '';
    const [y, m] = String(ym).split('-');
    return new Date(+y, +m - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
            <p className="font-semibold text-gray-800 mb-1">{payload[0]?.payload?.fullName || label}</p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color || entry.fill }}>
                    {entry.name}: <span className="font-bold">{entry.value}</span>
                </p>
            ))}
        </div>
    );
};

const SectionLink = ({ to, children, navigate }) => (
    <button
        onClick={() => navigate(to)}
        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition ml-auto"
    >
        {children || 'View Details'} <ArrowUpRight className="w-3.5 h-3.5" />
    </button>
);

const CollegeAdminOverview = ({ user }) => {
    const navigate = useNavigate();
    const [stats, setStats]   = useState(null);
    const [extraData, setExtraData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
            const [res, extraRes] = await Promise.allSettled([
                axios.get(`${API_URL}/students/dashboard-stats`, authHeaders),
                axios.get(`${API_URL}/admin/overview-stats`, authHeaders),
            ]);
            if (res.status === 'fulfilled' && res.value.data?.success) setStats(res.value.data.data);
            else setError('Failed to load dashboard data');
            if (extraRes.status === 'fulfilled' && extraRes.value.data?.data) setExtraData(extraRes.value.data.data);
        } catch {
            setError('Unable to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading overview…</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700 font-medium">{error}</p>
                <button onClick={fetchData} className="mt-3 text-sm text-red-600 underline">Retry</button>
            </div>
        </div>
    );

    // ── Derived data ─────────────────────────────────────────────────────────
    const statusMap = {};
    (stats?.status_summary || []).forEach(r => {
        statusMap[r.application_status] = (statusMap[r.application_status] || 0) + Number(r.count);
    });

    const accepted    = (statusMap.accepted || 0) + (statusMap.approved || 0);
    const pending     = (statusMap.pending  || 0) + (statusMap.submitted || 0) + (statusMap.under_review || 0);
    const rejected    = statusMap.rejected  || 0;
    const conditional = statusMap.conditional_accept || 0;
    const withdrawn   = statusMap.withdrawn || 0;
    const total       = accepted + pending + rejected + conditional + withdrawn;

    const pieData = [
        accepted    && { name: 'Accepted',    value: accepted,    fill: '#10b981' },
        pending     && { name: 'Pending',      value: pending,     fill: '#f59e0b' },
        rejected    && { name: 'Rejected',     value: rejected,    fill: '#ef4444' },
        conditional && { name: 'Conditional',  value: conditional, fill: '#f97316' },
        withdrawn   && { name: 'Withdrawn',    value: withdrawn,   fill: '#94a3b8' },
    ].filter(Boolean);

    const appCourseData = (stats?.course_summary || []).slice(0, 8).map(c => ({
        name: (c.course_code || c.course_title || '').slice(0, 22),
        fullName: c.course_title || c.course_code,
        Accepted: Number(c.accepted),
        Pending:  Number(c.pending),
        Rejected: Number(c.rejected),
    }));

    const trendData = (stats?.monthly_trend || []).map(r => ({
        month: fmtMonth(r.month),
        Total:    Number(r.total),
        Accepted: Number(r.accepted),
        Pending:  Number(r.pending),
        Rejected: Number(r.rejected),
    }));

    const kpiCards = [
        { label: 'Total Applications', value: total,       icon: FileText,     color: 'indigo',  path: '/applications' },
        { label: 'Accepted',           value: accepted,    icon: CheckCircle2, color: 'emerald', path: '/applications?status=accepted' },
        { label: 'Pending / Review',   value: pending,     icon: Clock,        color: 'amber',   path: '/applications?status=submitted' },
        { label: 'Rejected',           value: rejected,    icon: XCircle,      color: 'red',     path: '/applications?status=rejected' },
        { label: 'Conditional',        value: conditional, icon: AlertCircle,  color: 'orange',  path: '/applications?status=conditional_accept' },
        { label: 'New This Week',      value: stats?.recent_applications ?? 0, icon: TrendingUp, color: 'blue', path: '/applications' },
        { label: 'All Students',       value: total,       icon: Users,        color: 'purple',  path: '/student-list' },
        { label: 'Course Intakes',  value: '—',         icon: Calendar,     color: 'rose',    path: '/programme-intakes' },
    ];

    const colorMap = {
        indigo:  'bg-indigo-50  text-indigo-700  border-indigo-200',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        amber:   'bg-amber-50   text-amber-700   border-amber-200',
        red:     'bg-red-50     text-red-700     border-red-200',
        orange:  'bg-orange-50  text-orange-700  border-orange-200',
        blue:    'bg-blue-50    text-blue-700    border-blue-200',
        purple:  'bg-purple-50  text-purple-700  border-purple-200',
        rose:    'bg-rose-50    text-rose-700    border-rose-200',
    };
    const iconMap = {
        indigo:  'bg-indigo-100  text-indigo-600',
        emerald: 'bg-emerald-100 text-emerald-600',
        amber:   'bg-amber-100   text-amber-600',
        red:     'bg-red-100     text-red-600',
        orange:  'bg-orange-100  text-orange-600',
        blue:    'bg-blue-100    text-blue-600',
        purple:  'bg-purple-100  text-purple-600',
        rose:    'bg-rose-100    text-rose-600',
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-8">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">College Admin Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Welcome, {user?.name || 'College Admin'} · Admissions, students &amp; courses at a glance.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpiCards.map((card, i) => (
                    <div
                        key={i}
                        onClick={() => card.path && navigate(card.path)}
                        className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${colorMap[card.color]} cursor-pointer hover:shadow-md transition`}
                    >
                        <div className={`p-2 rounded-lg shrink-0 ${iconMap[card.color]}`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xl font-extrabold leading-tight">
                                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                            </p>
                            <p className="text-xs font-medium opacity-70 leading-tight mt-0.5 truncate">{card.label}</p>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                    </div>
                ))}
            </div>

            {/* ── Row 1: Pie + Trend ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Status Pie */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                    <div className="flex items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" /> Application Status
                        </h3>
                        <SectionLink to="/applications" navigate={navigate} />
                    </div>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, value }) => `${name} (${value})`}
                                >
                                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-12">No application data</p>
                    )}
                </div>

                {/* Monthly Trend Area */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                    <div className="flex items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" /> Application Trend (12 Months)
                        </h3>
                        <SectionLink to="/applications-report" navigate={navigate} />
                    </div>
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="Total"    stroke="#6366f1" fill="url(#caGrad)" strokeWidth={2} />
                                <Line type="monotone" dataKey="Accepted" stroke="#10b981" strokeWidth={1.5} dot={false} />
                                <Line type="monotone" dataKey="Rejected" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-12">No trend data available</p>
                    )}
                </div>
            </div>

            {/* ── Applications by Course ── */}}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-600" /> Applications by Course (Top 8)
                    </h3>
                    <SectionLink to="/applications" navigate={navigate} />
                </div>
                {appCourseData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={appCourseData} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Accepted" stackId="a" fill="#10b981" />
                            <Bar dataKey="Pending"  stackId="a" fill="#f59e0b" />
                            <Bar dataKey="Rejected" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-400 text-sm text-center py-12">No course data</p>
                )}
            </div>

            {/* ── Vendors, Partners & Infrastructure ── */}
            {extraData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Vendors by Type */}
                    <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                        <div className="flex items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-cyan-600" /> Vendors &amp; Suppliers
                            </h3>
                            <SectionLink to="/admin/vendors" navigate={navigate}>View All</SectionLink>
                        </div>
                        {(() => {
                            const vendorTypeData = (extraData.vendors?.byType || []).reduce((acc, row) => {
                                const t = row.vendor_type || 'Unknown';
                                const existing = acc.find(a => a.name === t);
                                if (existing) existing.value += Number(row.count);
                                else acc.push({ name: t, value: Number(row.count) });
                                return acc;
                            }, []);
                            const vColors = ['#0891b2', '#06b6d4', '#67e8f9', '#a5f3fc'];
                            return vendorTypeData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={vendorTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                                                {vendorTypeData.map((_, i) => <Cell key={i} fill={vColors[i % vColors.length]} />)}
                                            </Pie>
                                            <Tooltip />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <p className="text-center text-sm font-bold text-gray-700 mt-1">{extraData.vendors?.total || 0} Total Vendors</p>
                                </>
                            ) : <p className="text-gray-400 text-sm text-center py-12">No vendor data</p>;
                        })()}
                    </div>

                    {/* Partners & Associates by Type */}
                    <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                        <div className="flex items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" /> Partners &amp; Associates
                            </h3>
                            <SectionLink to="/admin/partners" navigate={navigate}>View All</SectionLink>
                        </div>
                        {(() => {
                            const partnerTypeData = (extraData.partners?.byType || []).reduce((acc, row) => {
                                const t = (row.partner_type || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                const existing = acc.find(a => a.name === t);
                                if (existing) existing.value += Number(row.count);
                                else acc.push({ name: t, value: Number(row.count) });
                                return acc;
                            }, []);
                            const pColors = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];
                            return partnerTypeData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={partnerTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                                                {partnerTypeData.map((_, i) => <Cell key={i} fill={pColors[i % pColors.length]} />)}
                                            </Pie>
                                            <Tooltip />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <p className="text-center text-sm font-bold text-gray-700 mt-1">{extraData.partners?.total || 0} Total Partners</p>
                                </>
                            ) : <p className="text-gray-400 text-sm text-center py-12">No partner data</p>;
                        })()}
                    </div>

                    {/* Infrastructure */}
                    <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                        <div className="flex items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-rose-600" /> Infrastructure
                            </h3>
                            <SectionLink to="/admin/facility-management" navigate={navigate}>View All</SectionLink>
                        </div>
                        {(() => {
                            const infra = extraData.infrastructure || {};
                            const infraBars = [
                                { name: 'Buildings', value: Number(infra.buildings || 0), fill: '#f43f5e' },
                                { name: 'Rooms', value: Number(infra.rooms || 0), fill: '#fb7185' },
                                { name: 'Facility Checks', value: (infra.facilityCompliance || []).reduce((s, r) => s + Number(r.count), 0), fill: '#fda4af' },
                            ];
                            return (
                                <>
                                    <ResponsiveContainer width="100%" height={160}>
                                        <BarChart data={infraBars} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                            <Tooltip />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Count">
                                                {infraBars.map((b, i) => <Cell key={i} fill={b.fill} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                    {(infra.facilityCompliance || []).length > 0 && (
                                        <div className="mt-3 space-y-1">
                                            {infra.facilityCompliance.map((fc, i) => (
                                                <div key={i} className="flex justify-between text-xs px-1">
                                                    <span className="capitalize text-gray-600">{fc.status || 'unknown'}</span>
                                                    <span className="font-bold text-gray-800">{fc.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* ── Recent Applications ── */}
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <div className="flex items-center px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" /> Recent Applications
                    </h3>
                    <SectionLink to="/applications" navigate={navigate}>View All</SectionLink>
                </div>
                {(stats?.recent_list || []).length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No applications yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                    <th className="text-left px-4 py-3 font-medium">Reference</th>
                                    <th className="text-left px-4 py-3 font-medium">Name</th>
                                    <th className="text-left px-4 py-3 font-medium">Course</th>
                                    <th className="text-left px-4 py-3 font-medium">Status</th>
                                    <th className="text-left px-4 py-3 font-medium">Submitted</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {(stats?.recent_list || []).map(app => {
                                    const cfg = { accepted: 'bg-emerald-50 text-emerald-700', approved: 'bg-emerald-50 text-emerald-700', pending: 'bg-amber-50 text-amber-700', submitted: 'bg-blue-50 text-blue-700', rejected: 'bg-red-50 text-red-700', conditional_accept: 'bg-orange-50 text-orange-700' };
                                    const cls = cfg[app.application_status] || 'bg-gray-50 text-gray-700';
                                    return (
                                        <tr key={app.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => navigate(`/applications/${app.id}/review`)}>                                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{app.application_reference || `#${app.id}`}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800">{app.first_name} {app.last_name}</td>
                                            <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{app.course_title || app.course_code}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
                                                    {(app.application_status || '').replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-GB') : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Quick Actions ── */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-indigo-600" /> Quick Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'New Admission',       path: '/student-application', icon: UserCheck,     color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
                        { label: 'All Applications',    path: '/applications',         icon: FileText,      color: 'text-indigo-600  bg-indigo-50  hover:bg-indigo-100'  },
                        { label: 'Student List',        path: '/student-list',         icon: Users,         color: 'text-blue-600    bg-blue-50    hover:bg-blue-100'    },
                        { label: 'Course Intakes',      path: '/programme-intakes',    icon: Calendar,      color: 'text-amber-600   bg-amber-50   hover:bg-amber-100'   },
                        { label: 'LMS Enrolments',      path: '/admin/lms-enrolments', icon: GraduationCap, color: 'text-cyan-600    bg-cyan-50    hover:bg-cyan-100'    },
                        { label: 'Application Reports', path: '/applications-report',  icon: BarChart3,     color: 'text-rose-600    bg-rose-50    hover:bg-rose-100'    },
                        { label: 'Admissions Hub',      path: '/college-admin/dashboard', icon: TrendingUp, color: 'text-gray-600    bg-gray-50    hover:bg-gray-100'   },
                    ].map((a, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(a.path)}
                            className={`flex flex-col items-center gap-2 rounded-xl p-4 transition border border-transparent ${a.color}`}
                        >
                            <a.icon className="w-6 h-6" />
                            <span className="text-xs font-semibold text-center leading-tight">{a.label}</span>
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default CollegeAdminOverview;
