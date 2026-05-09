import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, LineChart, Line, ResponsiveContainer
} from 'recharts';
import {
    Users, FileText, CheckCircle2, XCircle, Clock, TrendingUp,
    AlertCircle, GraduationCap, BarChart3, RefreshCw, ArrowRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ── Colour palette ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    accepted:          { label: 'Accepted',    color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    approved:          { label: 'Approved',    color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    pending:           { label: 'Pending',     color: '#f59e0b', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
    submitted:         { label: 'Submitted',   color: '#3b82f6', bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
    under_review:      { label: 'Under Review',color: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    rejected:          { label: 'Rejected',    color: '#ef4444', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
    conditional_accept:{ label: 'Conditional', color: '#f97316', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    withdrawn:         { label: 'Withdrawn',   color: '#94a3b8', bg: 'bg-slate-50',  text: 'text-slate-700',  border: 'border-slate-200'  },
};

const PIE_COLORS = ['#10b981','#f59e0b','#ef4444','#3b82f6','#6366f1','#f97316','#94a3b8','#8b5cf6'];

const cfgFor = (status) => STATUS_CONFIG[status] || {
    label: status, color: '#94a3b8', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200'
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtMonth = (ym) => {
    if (!ym) return '';
    const [y, m] = ym.split('-');
    return new Date(+y, +m - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
};

const StatusBadge = ({ status }) => {
    const cfg = cfgFor(status);
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            {cfg.label}
        </span>
    );
};

const StatCard = ({ icon: Icon, label, value, sub, iconColor, borderColor }) => (
    <div className={`bg-white rounded-xl border-l-4 ${borderColor} shadow-sm p-4 flex items-center gap-4`}>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor} bg-opacity-10 flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="min-w-0">
            <p className="text-sm text-slate-500 truncate">{label}</p>
            <p className="text-2xl font-bold text-slate-800">{value ?? '—'}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const CollegeAdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        setError('');
        try {
            const res = await axios.get(`${API_URL}/students/dashboard-stats`);
            if (res.data?.success) setData(res.data.data);
            else setError('Failed to load dashboard data.');
        } catch {
            setError('Unable to fetch dashboard statistics. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    // ── Derived data ─────────────────────────────────────────────────────────
    const statusMap = {};
    (data?.status_summary || []).forEach(r => {
        const key = r.application_status;
        statusMap[key] = (statusMap[key] || 0) + Number(r.count);
    });

    // Merge accepted + approved into one slice for display
    const accepted = (statusMap.accepted || 0) + (statusMap.approved || 0);
    const pending   = (statusMap.pending  || 0) + (statusMap.submitted || 0) + (statusMap.under_review || 0);
    const rejected  = statusMap.rejected  || 0;
    const conditional = statusMap.conditional_accept || 0;
    const withdrawn = statusMap.withdrawn || 0;
    const total = accepted + pending + rejected + conditional + withdrawn;

    const pieData = [
        accepted   && { name: 'Accepted',    value: accepted,   color: '#10b981' },
        pending    && { name: 'Pending',      value: pending,    color: '#f59e0b' },
        rejected   && { name: 'Rejected',     value: rejected,   color: '#ef4444' },
        conditional && { name: 'Conditional', value: conditional,color: '#f97316' },
        withdrawn  && { name: 'Withdrawn',    value: withdrawn,  color: '#94a3b8' },
    ].filter(Boolean);

    const barData = (data?.course_summary || []).slice(0, 8).map(c => ({
        name: (c.course_code || c.course_title || '').slice(0, 20),
        fullName: c.course_title || c.course_code,
        Applications: Number(c.applications),
        Accepted: Number(c.accepted),
        Pending: Number(c.pending),
        Rejected: Number(c.rejected),
    }));

    const trendData = (data?.monthly_trend || []).map(r => ({
        month: fmtMonth(r.month),
        Total: Number(r.total),
        Accepted: Number(r.accepted),
        Pending: Number(r.pending),
        Rejected: Number(r.rejected),
    }));

    // ── Loading / Error ───────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-slate-600">{error}</p>
            <button onClick={() => fetchStats()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                Retry
            </button>
        </div>
    );

    return (
        <div className="space-y-6 p-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Admissions Overview</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Welcome back, {user?.name || 'College Admin'} · Last updated {new Date(data?.last_updated).toLocaleTimeString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchStats(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => navigate('/applications')}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
                    >
                        <FileText className="w-4 h-4" />
                        All Applications
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon={Users}        label="Total Applications" value={total}      iconColor="text-indigo-600" borderColor="border-indigo-500" />
                <StatCard icon={CheckCircle2} label="Accepted"           value={accepted}   iconColor="text-emerald-600" borderColor="border-emerald-500" />
                <StatCard icon={Clock}        label="Pending / In Review" value={pending}   iconColor="text-amber-500"  borderColor="border-amber-400" />
                <StatCard icon={XCircle}      label="Rejected"           value={rejected}   iconColor="text-red-500"    borderColor="border-red-500" />
                <StatCard icon={AlertCircle}  label="Conditional"        value={conditional} iconColor="text-orange-500" borderColor="border-orange-400" />
                <StatCard icon={TrendingUp}   label="Last 7 Days"        value={data?.recent_applications ?? 0} sub="new applications" iconColor="text-blue-500" borderColor="border-blue-500" />
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Pie – Status Breakdown */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                    <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-500" />
                        Application Status Breakdown
                    </h2>
                    {pieData.length === 0 ? (
                        <p className="text-center text-slate-400 py-10">No data</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%" cy="50%"
                                    innerRadius={55} outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v, n) => [`${v} applications`, n]} />
                                <Legend iconType="circle" iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Bar – Applications per Course */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                    <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-500" />
                        Applications by Programme (Top 8)
                    </h2>
                    {barData.length === 0 ? (
                        <p className="text-center text-slate-400 py-10">No data</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        const entry = barData.find(d => d.name === label);
                                        return (
                                            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow text-xs">
                                                <p className="font-semibold text-slate-700 mb-1">{entry?.fullName || label}</p>
                                                {payload.map(p => (
                                                    <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
                                                ))}
                                            </div>
                                        );
                                    }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '8px' }} iconSize={10} />
                                <Bar dataKey="Applications" fill="#6366f1" radius={[3,3,0,0]} />
                                <Bar dataKey="Accepted"     fill="#10b981" radius={[3,3,0,0]} />
                                <Bar dataKey="Pending"      fill="#f59e0b" radius={[3,3,0,0]} />
                                <Bar dataKey="Rejected"     fill="#ef4444" radius={[3,3,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── Monthly Trend ── */}
            {trendData.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                    <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        Monthly Application Trends (Last 12 Months)
                    </h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={trendData} margin={{ top: 4, right: 16, left: -20, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip />
                            <Legend iconSize={10} />
                            <Line type="monotone" dataKey="Total"    stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="Accepted" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="Pending"  stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="Rejected" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* ── Recent Applications Table ── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        Recent Applications
                    </h2>
                    <button
                        onClick={() => navigate('/applications')}
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {(data?.recent_list || []).length === 0 ? (
                    <p className="text-center text-slate-400 py-8">No applications yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                                    <th className="text-left px-4 py-3 font-medium">Ref</th>
                                    <th className="text-left px-4 py-3 font-medium">Name</th>
                                    <th className="text-left px-4 py-3 font-medium">Email</th>
                                    <th className="text-left px-4 py-3 font-medium">Programme</th>
                                    <th className="text-left px-4 py-3 font-medium">Status</th>
                                    <th className="text-left px-4 py-3 font-medium">Submitted</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(data?.recent_list || []).map(app => (
                                    <tr
                                        key={app.id}
                                        className="hover:bg-slate-50 transition cursor-pointer"
                                        onClick={() => navigate(`/student-detail/${app.id}`)}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                            {app.application_reference || `#${app.id}`}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-800">
                                            {app.first_name} {app.last_name}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 truncate max-w-[180px]">{app.email}</td>
                                        <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]">
                                            {app.course_title || app.course_code}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={app.application_status} />
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                            {app.submitted_at
                                                ? new Date(app.submitted_at).toLocaleDateString('en-GB')
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <ArrowRight className="w-4 h-4 text-slate-300" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
};

export default CollegeAdminDashboard;
