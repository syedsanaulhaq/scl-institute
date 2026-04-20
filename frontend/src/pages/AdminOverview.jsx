import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, GraduationCap, FileText, BookOpen, TrendingUp,
    ClipboardList, UserCheck, BarChart3, Activity, ArrowUpRight,
    RefreshCw, AlertCircle, Calendar, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];
const STATUS_COLORS = {
    accepted: '#10b981',
    approved: '#10b981',
    pending: '#f59e0b',
    submitted: '#3b82f6',
    rejected: '#ef4444',
    draft: '#9ca3af',
    active: '#10b981',
    withdrawn: '#ef4444',
    transferred_out: '#f59e0b',
    completed: '#3b82f6',
};

const AdminOverview = ({ user }) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/admin/overview-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data?.success) {
                setData(res.data.data);
            } else {
                setError('Failed to load dashboard data');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Loading overview...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-700 font-medium">{error}</p>
                    <button onClick={fetchData} className="mt-3 text-sm text-red-600 underline">Retry</button>
                </div>
            </div>
        );
    }

    const { users, applications, courseRegistrations, programmeIntakes, courseLifecycle, changeRequests, teacherRegistrations, studentProgrammes, moodle } = data;

    // Prepare chart data
    const appStatusData = (applications?.byStatus || []).map(s => ({
        name: (s.status || 'unknown').charAt(0).toUpperCase() + (s.status || 'unknown').slice(1),
        value: Number(s.count),
        fill: STATUS_COLORS[s.status] || '#9ca3af',
    }));

    const appMonthData = (applications?.byMonth || []).map(m => ({
        month: m.month,
        applications: Number(m.count),
    }));

    const appCourseData = (applications?.byCourse || []).map(c => ({
        name: c.course_title?.length > 30 ? c.course_title.slice(0, 28) + '…' : c.course_title,
        fullName: c.course_title,
        accepted: Number(c.accepted || 0),
        rejected: Number(c.rejected || 0),
        pending: Number(c.pending || 0),
    }));

    const userRoleData = (users?.byRole || []).map(r => ({
        name: (r.role || 'unknown').charAt(0).toUpperCase() + (r.role || 'unknown').slice(1),
        value: Number(r.count),
    }));

    const moodleCourseData = (moodle?.courseBreakdown || []).map(c => ({
        name: c.shortname || c.fullname?.slice(0, 20),
        fullName: c.fullname,
        enrollments: Number(c.enrollments),
    }));

    const intakeStatusData = (programmeIntakes || []).map(i => ({
        name: (i.status || 'unknown').charAt(0).toUpperCase() + (i.status || 'unknown').slice(1),
        value: Number(i.count),
        fill: STATUS_COLORS[i.status] || '#9ca3af',
    }));

    const progRegData = (studentProgrammes || []).map(p => ({
        name: (p.status || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: Number(p.count),
        fill: STATUS_COLORS[p.status] || '#9ca3af',
    }));

    const totalApps = appStatusData.reduce((sum, s) => sum + s.value, 0);
    const totalIntakes = intakeStatusData.reduce((sum, s) => sum + s.value, 0);

    // Stat cards
    const statCards = [
        { label: 'Total Users', value: users?.total || 0, icon: Users, color: 'purple', path: '/applicants' },
        { label: 'Student Applications', value: totalApps, icon: FileText, color: 'blue', path: '/applications' },
        { label: 'Course Registrations', value: courseRegistrations?.total || 0, icon: BookOpen, color: 'emerald', path: '/course-registrations' },
        { label: 'LMS Enrolments', value: moodle?.enrollments || 0, icon: GraduationCap, color: 'indigo' },
        { label: 'Moodle Courses', value: moodle?.courses || 0, icon: BarChart3, color: 'cyan' },
        { label: 'Programme Intakes', value: totalIntakes, icon: Calendar, color: 'amber', path: '/programme-intakes' },
        { label: 'Course Lifecycle', value: courseLifecycle?.total || 0, icon: ClipboardList, color: 'rose', path: '/course-lifecycle' },
        { label: 'Recent Apps (7d)', value: applications?.recent7Days || 0, icon: TrendingUp, color: 'green' },
    ];

    const colorMap = {
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        rose: 'bg-rose-50 text-rose-700 border-rose-200',
        green: 'bg-green-50 text-green-700 border-green-200',
    };

    const iconColorMap = {
        purple: 'bg-purple-100 text-purple-600',
        blue: 'bg-blue-100 text-blue-600',
        emerald: 'bg-emerald-100 text-emerald-600',
        indigo: 'bg-indigo-100 text-indigo-600',
        cyan: 'bg-cyan-100 text-cyan-600',
        amber: 'bg-amber-100 text-amber-600',
        rose: 'bg-rose-100 text-rose-600',
        green: 'bg-green-100 text-green-600',
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) {
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
        }
        return null;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Institutional summary — users, applications, enrolments, courses & lifecycle.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div
                        key={i}
                        onClick={() => card.path && navigate(card.path)}
                        className={`rounded-xl border p-4 ${colorMap[card.color]} ${card.path ? 'cursor-pointer hover:shadow-md' : ''} transition`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-lg ${iconColorMap[card.color]}`}>
                                <card.icon className="w-5 h-5" />
                            </div>
                            {card.path && <ArrowUpRight className="w-4 h-4 opacity-40" />}
                        </div>
                        <p className="text-2xl font-extrabold">{card.value.toLocaleString()}</p>
                        <p className="text-xs font-medium opacity-70 mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Row 1: Application Status Pie + Applications by Month */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Application Status Pie */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" /> Application Status
                    </h3>
                    {appStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={appStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, value }) => `${name} (${value})`}
                                >
                                    {appStatusData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-12">No application data</p>
                    )}
                </div>

                {/* Applications by Month Area Chart */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" /> Applications Trend (6 Months)
                    </h3>
                    {appMonthData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={appMonthData}>
                                <defs>
                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="applications" stroke="#7c3aed" fill="url(#colorApps)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-12">No trend data available</p>
                    )}
                </div>
            </div>

            {/* Row 2: Applications by Course (stacked bar) */}
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" /> Applications by Course
                </h3>
                {appCourseData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={appCourseData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                            <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="accepted" stackId="a" fill="#10b981" name="Accepted" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                            <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-400 text-sm text-center py-12">No course data</p>
                )}
            </div>

            {/* Row 3: User Roles Pie + Moodle Enrolments Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User roles */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" /> Users by Role
                    </h3>
                    {userRoleData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={userRoleData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({ name, value }) => `${name} (${value})`}
                                >
                                    {userRoleData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-12">No user data</p>
                    )}
                </div>

                {/* Moodle Course Enrolments */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-purple-600" /> LMS Course Enrolments (Top 10)
                    </h3>
                    {moodleCourseData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={moodleCourseData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="enrollments" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Enrolments" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-12">LMS data unavailable</p>
                    )}
                </div>
            </div>

            {/* Row 4: Course Lifecycle + Programme Intake + Programme Registrations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Course Lifecycle Cards */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-rose-600" /> Course Lifecycle
                    </h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Master Courses', value: courseLifecycle?.total || 0, color: 'bg-purple-100 text-purple-700' },
                            { label: 'Accreditations', value: courseLifecycle?.accreditations || 0, color: 'bg-blue-100 text-blue-700' },
                            { label: 'Inductions', value: courseLifecycle?.inductions || 0, color: 'bg-emerald-100 text-emerald-700' },
                            { label: 'Visits', value: courseLifecycle?.visits || 0, color: 'bg-amber-100 text-amber-700' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                <span className={`text-sm font-bold px-3 py-1 rounded-full ${item.color}`}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Programme Intake Status */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-amber-600" /> Programme Intakes
                    </h3>
                    {intakeStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={intakeStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={75}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, value }) => `${name} (${value})`}
                                >
                                    {intakeStatusData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill || COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-12">No intake data</p>
                    )}
                </div>

                {/* Student Programme Registrations */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-green-600" /> Student Programmes
                    </h3>
                    {progRegData.length > 0 ? (
                        <div className="space-y-3 mt-2">
                            {progRegData.map((item, i) => {
                                const total = progRegData.reduce((s, p) => s + p.value, 0);
                                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{item.name}</span>
                                            <span className="font-bold text-gray-900">{item.value} ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div
                                                className="h-2.5 rounded-full transition-all"
                                                style={{ width: `${pct}%`, backgroundColor: item.fill }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-12">No data</p>
                    )}
                </div>
            </div>

            {/* Row 5: Change Requests + Teacher Registrations + Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Change Requests */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-orange-600" /> Course Change Requests
                    </h3>
                    {(changeRequests || []).length > 0 ? (
                        <div className="space-y-2">
                            {changeRequests.map((cr, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700 capitalize">{cr.request_type?.replace(/_/g, ' ')}</span>
                                        <span className="mx-2 text-gray-300">·</span>
                                        <span className="text-xs capitalize" style={{ color: STATUS_COLORS[cr.status] || '#6b7280' }}>{cr.status}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{cr.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-8">No change requests</p>
                    )}
                </div>

                {/* Teacher Registrations + Moodle Users */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" /> System Snapshot
                    </h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Teacher Registrations', value: teacherRegistrations || 0 },
                            { label: 'LMS Users (Moodle)', value: moodle?.moodleUsers || 0 },
                            { label: 'LMS Courses', value: moodle?.courses || 0 },
                            { label: 'LMS Enrolments', value: moodle?.enrollments || 0 },
                            { label: 'Course Registrations', value: courseRegistrations?.total || 0 },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <span className="text-sm text-gray-600">{item.label}</span>
                                <span className="text-sm font-bold text-gray-900">{item.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ArrowUpRight className="w-5 h-5 text-purple-600" /> Quick Links
                    </h3>
                    <div className="space-y-2">
                        {[
                            { label: 'View Applications', path: '/applications', icon: FileText },
                            { label: 'Admissions Hub', path: '/admin/dashboard', icon: BarChart3 },
                            { label: 'Student Records', path: '/students', icon: Users },
                            { label: 'Course Lifecycle', path: '/course-lifecycle', icon: ClipboardList },
                            { label: 'Programme Intakes', path: '/programme-intakes', icon: Calendar },
                            { label: 'Application Reports', path: '/applications-report', icon: TrendingUp },
                        ].map((link, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(link.path)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition text-left"
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                                <ArrowUpRight className="w-3 h-3 ml-auto opacity-40" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 py-4">
                Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </div>
        </div>
    );
};

export default AdminOverview;
