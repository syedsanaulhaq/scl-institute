import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, Bell, Calendar, ExternalLink, Loader2, AlertCircle,
    Megaphone, ClipboardCheck, BarChart3, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { openMoodleSSO } from '../../utils/ssoService';
import { fetchTeacherPortalData } from '../../utils/teacherPortal';

const TeacherDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState({ courseRows: [], summary: null, activities: [], announcements: [], notifications: [] });
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [ssoLoading, setSsoLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const result = await fetchTeacherPortalData(user?.email);
                setData(result);
            } catch (err) {
                console.error('Failed to load teacher dashboard:', err);
                setError('Unable to load teacher dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        if (user?.email) load();
    }, [user]);

    const topCourses = useMemo(() => {
        return [...(data.courseRows || [])].sort((a, b) => b.moduleCount - a.moduleCount).slice(0, 6);
    }, [data.courseRows]);

    const recentAssessments = useMemo(() => {
        return (data.activities || []).filter((a) => a.type === 'assign' || a.type === 'quiz').slice(0, 8);
    }, [data.activities]);

    const handleOpenMoodle = async (redirectTo = null) => {
        try {
            setSsoLoading(true);
            await openMoodleSSO(user?.email, { redirectTo });
        } catch (err) {
            console.error('Teacher SSO failed:', err);
        } finally {
            setSsoLoading(false);
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const now = new Date();
        const date = new Date(dateStr);
        const diffMins = Math.floor((now - date) / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-500 mt-3 text-sm">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-700">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-3 text-sm text-red-600 hover:underline">Try again</button>
                </div>
            </div>
        );
    }

    const summary = data.summary || { totalCourses: 0, assessmentCount: 0, moduleCount: 0, forumCount: 0 };
    const firstName = user?.first_name || user?.name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Teacher';
    const announcements = data.announcements || [];
    const notifications = data.notifications || [];

    return (
        <div className="px-5 pt-2 pb-5 min-h-screen" style={{ background: '#FFFFFF' }}>

            {/* Welcome Header + LMS Button */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-base font-bold" style={{ color: '#1F2937' }}>
                            Welcome back, {firstName}! 👋
                        </h1>
                        <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                            Here&apos;s your teaching overview for today.
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenMoodle('/my/')}
                        disabled={ssoLoading}
                        className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-50 self-start md:self-auto"
                        style={{ background: '#2563EB' }}
                    >
                        <ExternalLink className="w-4 h-4" />
                        {ssoLoading ? 'Opening...' : 'Open Moodle LMS'}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <KpiCard icon="📚" iconBg="#DBEAFE" value={summary.totalCourses || 0} label="My Subjects" sub={`${summary.totalCourses || 0} assigned`} subColor="#6B7280" />
                <KpiCard icon="📊" iconBg="#DBEAFE" value={summary.assessmentCount || 0} label="Assessments" sub="assignments & quizzes" subColor="#6B7280" />
                <KpiCard icon="✅" iconBg="#DBEAFE" value={summary.moduleCount || 0} label="Activities" sub="total course modules" subColor="#10B981" />
                <KpiCard icon="💬" iconBg="#DBEAFE" value={summary.forumCount || 0} label="Forums" sub="discussion boards" subColor="#6B7280" />
            </div>

            {/* Row 1: My Courses + Announcements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
                            <BookOpen className="w-4 h-4" style={{ color: '#2563EB' }} />
                            My Teaching Subjects
                        </h2>
                        <button onClick={() => navigate('/teacher/programme')} className="text-xs font-medium" style={{ color: '#2563EB' }}>View all →</button>
                    </div>
                    <div className="p-4">
                        <TeacherCoursesTab courses={topCourses} onSubjectClick={(courseId) => handleOpenMoodle(`/course/view.php?id=${courseId}`)} ssoLoading={ssoLoading} />
                    </div>
                </div>

                <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
                            <Megaphone className="w-4 h-4" style={{ color: '#2563EB' }} />
                            Announcements
                        </h2>
                    </div>
                    <div className="p-4">
                        <AnnouncementsTab announcements={announcements} formatTime={formatTime} onOpenMoodle={(path) => handleOpenMoodle(path)} />
                    </div>
                </div>
            </div>

            {/* Row 2: Recent Assessments + Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
                            <ClipboardCheck className="w-4 h-4" style={{ color: '#2563EB' }} />
                            Recent Assessments
                        </h2>
                        <button onClick={() => navigate('/teacher/assessments')} className="text-xs font-medium" style={{ color: '#2563EB' }}>View all →</button>
                    </div>
                    <div className="p-4">
                        <AssessmentsTab assessments={recentAssessments} onOpenMoodle={(path) => handleOpenMoodle(path)} />
                    </div>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
                            <Bell className="w-4 h-4" style={{ color: '#2563EB' }} />
                            Notifications
                        </h2>
                        <button onClick={() => navigate('/student/notifications')} className="text-xs font-medium" style={{ color: '#2563EB' }}>View all →</button>
                    </div>
                    <div className="p-4">
                        <TeacherNotificationsTab notifications={notifications} formatTime={formatTime} />
                    </div>
                </div>
            </div>

            {/* Row 3: Calendar + Course Activity Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                <div className="lg:col-span-1">
                    <MiniCalendar date={calendarDate} onDateChange={setCalendarDate} />
                </div>
                <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-5" style={{ borderColor: '#E5E7EB' }}>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: '#1F2937' }}>Subject Activity Overview</h3>
                    <CourseActivityChart courses={topCourses.slice(0, 5)} />
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border shadow-sm p-4 mb-5" style={{ borderColor: '#E5E7EB' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#1F2937' }}>Quick Links</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { icon: '📝', label: 'Assessments', path: '/teacher/assessments' },
                        { icon: '📄', label: 'My Subjects', path: '/teacher/programme' },
                        { icon: '📊', label: 'Reports', path: '/teacher/reports' },
                        { icon: '📅', label: 'Timetable', path: '/teacher/timetable' },
                        { icon: '🎓', label: 'Teaching (LMS)', action: () => handleOpenMoodle('/my/') },
                        { icon: '⚙️', label: 'Settings', path: '/settings' },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={() => item.action ? item.action() : navigate(item.path)}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border text-center transition hover:shadow-md hover:border-blue-300"
                            style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
                        >
                            <span className="text-3xl">{item.icon}</span>
                            <span className="text-sm font-semibold" style={{ color: '#1F2937' }}>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ── Sub-components ── */

// Derive programme code + year from Moodle shortname, e.g. "HND-001-Y1-S1-C1" → { prog: "HND-001", year: "Year 1" }
const parseCourseCode = (code) => {
    const s = String(code || '').toUpperCase();
    const m = s.match(/^([A-Z]+-[A-Z0-9]+)-Y(\d+)/);
    if (m) return { prog: m[1], year: `Year ${m[2]}` };
    const parts = s.split('-');
    return { prog: parts.length >= 2 ? parts.slice(0, 2).join('-') : s, year: '' };
};

const GENERIC_CATS = new Set(['semester-1', 'semester-2', 'semester-3', 'year-1', 'year-2', 'year-3', 'general', 'miscellaneous', '']);

const getProgrammeLabel = (code, category) => {
    // Prefer the Moodle category if it looks like a real programme name
    if (category && !GENERIC_CATS.has(String(category).toLowerCase())) return category;
    const { prog, year } = parseCourseCode(code);
    return [prog, year].filter(Boolean).join(' · ');
};

const KpiCard = ({ icon, iconBg, value, label, sub, subColor }) => (
    <div className="bg-white rounded-lg border shadow-sm p-4 flex items-center gap-3" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: iconBg }}>
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-lg font-bold leading-none" style={{ color: '#1F2937' }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{label}</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: subColor || '#6B7280' }}>{sub}</p>
        </div>
    </div>
);

const TeacherCoursesTab = ({ courses, onSubjectClick, ssoLoading }) => {
    const bgColors = ['#FEF3C7', '#DBEAFE', '#F3E8FF', '#FDE2E4', '#D1FAE5', '#E0E7FF'];
    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No subjects assigned yet</p>
                <p className="text-sm mt-1">Your teaching subjects will appear here</p>
            </div>
        );
    }

    // Group subjects by cohort label
    const groups = [];
    const groupIndex = new Map();
    courses.forEach((course, idx) => {
        const key = course.cohortLabel || getProgrammeLabel(course.code, course.category) || 'Other';
        if (!groupIndex.has(key)) {
            groupIndex.set(key, groups.length);
            groups.push({ label: key, items: [] });
        }
        groups[groupIndex.get(key)].items.push({ course, origIdx: idx });
    });

    return (
        <div className="space-y-6">
            {groups.map((group) => (
                <div key={group.label}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3 pb-1 border-b" style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>
                        {group.label}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {group.items.map(({ course, origIdx }) => (
                            <div key={course.id}
                                onClick={() => !ssoLoading && onSubjectClick?.(course.id)}
                                className="rounded-lg border overflow-hidden transition-all hover:shadow-md cursor-pointer"
                                style={{ borderColor: '#E5E7EB', background: '#fff', opacity: ssoLoading ? 0.7 : 1 }}>
                                <div style={{ background: bgColors[origIdx % bgColors.length], padding: '16px', minHeight: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="text-3xl">📚</span>
                                </div>
                                <div style={{ padding: '14px' }}>
                                    <h3 className="text-sm font-semibold line-clamp-2" style={{ color: '#1F2937' }}>{course.name}</h3>
                                    <p className="text-xs mt-0.5 font-mono" style={{ color: '#6B7280' }}>{course.code}</p>
                                    <div className="mt-2 flex gap-3 text-xs" style={{ color: '#6B7280' }}>
                                        <span>📝 {course.counts?.assign || 0}</span>
                                        <span>💬 {course.counts?.forum || 0}</span>
                                        <span>📋 {course.counts?.quiz || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const AssessmentsTab = ({ assessments, onOpenMoodle }) => {
    if (!assessments || assessments.length === 0) {
        return (
            <div className="text-center py-8" style={{ color: '#6B7280' }}>
                <ClipboardCheck className="w-8 h-8 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                <p className="text-sm font-medium">No assessments found</p>
                <p className="text-xs mt-1">Assignments and quizzes will appear here</p>
            </div>
        );
    }
    return (
        <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
            {assessments.map((item) => (
                <div key={item.id} className="py-2.5 flex gap-2.5 px-1 rounded hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => onOpenMoodle?.(`/mod/${item.type}/view.php?id=${item.moduleId}`)}>  
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: item.type === 'assign' ? '#2563EB' : '#10B981' }} />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: '#1F2937' }}>{item.title}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#6B7280' }}>{item.courseCode} · {item.courseName}</p>
                    </div>
                    <span className="text-[10px] flex-shrink-0 px-2 py-0.5 rounded font-medium uppercase"
                        style={{ background: item.type === 'assign' ? '#DBEAFE' : '#D1FAE5', color: item.type === 'assign' ? '#2563EB' : '#10B981' }}>
                        {item.type}
                    </span>
                </div>
            ))}
        </div>
    );
};

const TeacherNotificationsTab = ({ notifications, formatTime }) => {
    const navigate = useNavigate();
    if (!notifications || notifications.length === 0) {
        return (
            <div className="text-center py-8" style={{ color: '#6B7280' }}>
                <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs mt-1">Notifications will appear here</p>
            </div>
        );
    }
    return (
        <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
            {notifications.map((notif) => (
                <div key={notif.id} className="py-2.5 flex gap-2.5 rounded px-1 cursor-pointer hover:bg-blue-50 transition-colors" style={{ background: !notif.is_read ? '#F0F9FF' : undefined }} onClick={() => navigate(`/student/notifications?id=${notif.id}`)}>
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: !notif.is_read ? '#2563EB' : '#D0D5E8' }} />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: !notif.is_read ? '#1F2937' : '#6B7280' }}>{notif.subject}</p>
                        <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: '#6B7280' }}>{notif.message}</p>
                    </div>
                    <span className="text-[10px] flex-shrink-0 whitespace-nowrap mt-0.5" style={{ color: '#9CA3AF' }}>{formatTime(notif.created_at)}</span>
                </div>
            ))}
        </div>
    );
};

const AnnouncementsTab = ({ announcements, formatTime, onOpenMoodle }) => {
    if (!announcements || announcements.length === 0) {
        return (
            <div className="text-center py-8" style={{ color: '#6B7280' }}>
                <Megaphone className="w-8 h-8 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                <p className="text-sm font-medium">No announcements</p>
                <p className="text-xs mt-1">Course announcements from Moodle will appear here</p>
            </div>
        );
    }
    return (
    <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
        {announcements.map((ann) => (
            <div key={ann.id} className="py-3 px-1 hover:bg-gray-50 transition-colors rounded cursor-pointer" onClick={() => onOpenMoodle?.(`/mod/forum/discuss.php?d=${ann.id}`)}>
                <div className="flex items-center gap-2 mb-1">
                    <Megaphone className="w-3 h-3" style={{ color: '#D07020' }} />
                    <p className="text-xs font-semibold" style={{ color: '#1F2937' }}>{ann.subject}</p>
                </div>
                {ann.message && <p className="text-[11px] line-clamp-2 ml-5" style={{ color: '#6B7280' }}>{ann.message}</p>}
                <div className="flex items-center gap-2 mt-1 ml-5">
                    {ann.coursename && <span className="text-[10px]" style={{ color: '#6B7280' }}>{ann.coursename}</span>}
                    {ann.userfullname && <span className="text-[10px]" style={{ color: '#6B7280' }}>· {ann.userfullname}</span>}
                    <span className="text-[10px] ml-auto" style={{ color: '#9CA3AF' }}>{formatTime(ann.timemodified)}</span>
                </div>
            </div>
        ))}
    </div>
    );
};

const MiniCalendar = ({ date, onDateChange }) => {
    const today = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthName = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay + 6) % 7;
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    return (
        <div className="bg-white rounded-xl border shadow-sm p-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Calendar</h2>
                <div className="flex items-center gap-1">
                    <button onClick={() => onDateChange(new Date(year, month - 1, 1))} className="p-1 rounded hover:bg-gray-100 transition">
                        <ChevronLeft className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />
                    </button>
                    <span className="text-xs font-medium px-1" style={{ color: '#6B7280' }}>{monthName}</span>
                    <button onClick={() => onDateChange(new Date(year, month + 1, 1))} className="p-1 rounded hover:bg-gray-100 transition">
                        <ChevronRight className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 mb-1">
                {['Mo','Tu','We','Th','Fr','Sa','Su'].map((d) => (
                    <div key={d} className="text-center text-[10px] font-semibold pb-1" style={{ color: '#9CA3AF' }}>{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((day, i) => (
                    <div key={i} className="flex flex-col items-center justify-center py-0.5">
                        {day ? (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center"
                                style={{ background: isToday(day) ? '#2563EB' : 'transparent' }}>
                                <span className="text-[11px] font-medium" style={{ color: isToday(day) ? '#fff' : '#1F2937' }}>{day}</span>
                            </div>
                        ) : <div className="w-7 h-7" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

const CourseActivityChart = ({ courses }) => {
    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-8" style={{ color: '#6B7280' }}>
                <BarChart3 className="w-8 h-8 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                <p className="text-sm">No course activity data yet</p>
            </div>
        );
    }
    const maxModules = Math.max(...courses.map((c) => c.moduleCount || 1), 1);
    return (
        <div className="space-y-3">
            {courses.map((course) => {
                const pct = Math.round(((course.moduleCount || 0) / maxModules) * 100);
                return (
                    <div key={course.id}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="truncate max-w-[65%] font-medium" style={{ color: '#1F2937' }}>{course.code || course.name}</span>
                            <span style={{ color: '#6B7280' }}>{course.moduleCount} modules</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: '#2563EB', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TeacherDashboard;
