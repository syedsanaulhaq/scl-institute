import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, Bell, Calendar, ExternalLink, Loader2, AlertCircle,
    Megaphone, ClipboardCheck, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { openMoodleSSO } from '../../utils/ssoService';
import { fetchTeacherPortalData } from '../../utils/teacherPortal';

const TeacherDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState({ courseRows: [], summary: null, activities: [], announcements: [], notifications: [] });
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
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

    const calendarEvents = useMemo(() => {
        const dk = (d) => {
            if (!d) return '';
            const dt = typeof d === 'number' ? new Date(d * 1000) : new Date(d);
            return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
        };
        const map = {};
        (data.notifications || []).forEach(n => {
            const k = dk(n.created_at);
            if (!map[k]) map[k] = { notifications: [], announcements: [] };
            map[k].notifications.push(n);
        });
        (data.announcements || []).forEach(a => {
            const k = dk(a.timemodified);
            if (!map[k]) map[k] = { notifications: [], announcements: [] };
            map[k].announcements.push(a);
        });
        return map;
    }, [data.notifications, data.announcements]);

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
    const fmtKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const panelDate = selectedCalendarDay || new Date();
    const panelEvents = calendarEvents[fmtKey(panelDate)] || { notifications: [], announcements: [] };

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

            {/* Row 3: Calendar full-width, Events Panel below */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-5" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex flex-col">
                    <div className="w-full p-6" style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <MiniCalendar
                            date={calendarDate}
                            onDateChange={setCalendarDate}
                            events={calendarEvents}
                            selectedDay={selectedCalendarDay}
                            onDayClick={(d) => setSelectedCalendarDay(prev => prev?.toDateString() === d.toDateString() ? null : d)}
                        />
                    </div>
                    <div className="w-full p-6">
                        <CalendarEventsPanel
                            date={panelDate}
                            events={panelEvents}
                            assessments={recentAssessments}
                            formatTime={formatTime}
                            onNotificationClick={(id) => navigate(`/student/notifications?id=${id}`)}
                            onAnnouncementClick={(id) => handleOpenMoodle(`/mod/forum/discuss.php?d=${id}`)}
                            onAssessmentClick={(type, moduleId) => handleOpenMoodle(`/mod/${type}/view.php?id=${moduleId}`)}
                        />
                    </div>
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

const MiniCalendar = ({ date, onDateChange, events = {}, selectedDay, onDayClick }) => {
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
    const isSelected = (d) => selectedDay && d === selectedDay.getDate() && month === selectedDay.getMonth() && year === selectedDay.getFullYear();
    const getDayKey = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
                    <Calendar className="w-5 h-5" style={{ color: '#2563EB' }} />
                    Calendar
                </h2>
                <div className="flex items-center gap-1">
                    <button onClick={() => onDateChange(new Date(year, month - 1, 1))} className="p-1.5 rounded hover:bg-gray-100 transition">
                        <ChevronLeft className="w-4 h-4" style={{ color: '#6B7280' }} />
                    </button>
                    <span className="text-sm font-medium px-2" style={{ color: '#6B7280' }}>{monthName}</span>
                    <button onClick={() => onDateChange(new Date(year, month + 1, 1))} className="p-1.5 rounded hover:bg-gray-100 transition">
                        <ChevronRight className="w-4 h-4" style={{ color: '#6B7280' }} />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 mb-2">
                {['Mo','Tu','We','Th','Fr','Sa','Su'].map((d) => (
                    <div key={d} className="text-center text-xs font-semibold pb-1" style={{ color: '#9CA3AF' }}>{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((day, i) => {
                    if (!day) return <div key={i} className="w-full aspect-square" />;
                    const dayKey = getDayKey(day);
                    const dayEvt = events[dayKey] || { notifications: [], announcements: [] };
                    const hasNotif = dayEvt.notifications.length > 0;
                    const hasAnn = dayEvt.announcements.length > 0;
                    const hasAny = hasNotif || hasAnn;
                    const todayDay = isToday(day);
                    const selDay = isSelected(day);
                    return (
                        <div key={i} className="flex flex-col items-center py-1" onClick={() => hasAny && onDayClick(new Date(year, month, day))} style={{ cursor: hasAny ? 'pointer' : 'default' }}>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center transition"
                                style={{
                                    background: selDay ? '#2563EB' : todayDay ? '#DBEAFE' : 'transparent',
                                    border: !selDay && todayDay ? '2px solid #2563EB' : 'none',
                                }}>
                                <span className="text-base font-medium" style={{ color: selDay ? '#fff' : todayDay ? '#2563EB' : '#1F2937' }}>{day}</span>
                            </div>
                            <div className="flex gap-0.5 mt-0.5" style={{ minHeight: '7px' }}>
                                {hasNotif && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#2563EB' }} />}
                                {hasAnn && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#F59E0B' }} />}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-5 flex items-center gap-5" style={{ color: '#9CA3AF' }}>
                <span className="flex items-center gap-1.5 text-xs"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#2563EB' }} /> Notifications</span>
                <span className="flex items-center gap-1.5 text-xs"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#F59E0B' }} /> Announcements</span>
            </div>
        </div>
    );
};

const CalendarEventsPanel = ({ date, events, assessments, formatTime, onNotificationClick, onAnnouncementClick, onAssessmentClick }) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const dateLabel = isToday ? 'Today' : date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>{dateLabel}</h3>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Notifications column */}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3 pb-1.5 border-b flex items-center gap-1.5" style={{ color: '#2563EB', borderColor: '#DBEAFE' }}>
                        <Bell className="w-3.5 h-3.5" /> Notifications
                    </p>
                    {events.notifications?.length > 0 ? (
                        <div className="space-y-2">
                            {events.notifications.map(n => (
                                <div key={n.id} onClick={() => onNotificationClick(n.id)}
                                    className="flex gap-2.5 p-2.5 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors border"
                                    style={{ borderColor: !n.is_read ? '#BFDBFE' : '#F3F4F6', background: !n.is_read ? '#F0F9FF' : '#FAFAFA' }}>
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: !n.is_read ? '#2563EB' : '#D1D5DB' }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium" style={{ color: '#1F2937' }}>{n.subject}</p>
                                        <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: '#6B7280' }}>{n.message}</p>
                                        <p className="text-[10px] mt-1" style={{ color: '#9CA3AF' }}>{formatTime(n.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs py-3 text-center" style={{ color: '#C4C8D4' }}>{isToday ? 'No notifications today' : 'None on this day'}</p>
                    )}
                </div>
                {/* Announcements column */}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3 pb-1.5 border-b flex items-center gap-1.5" style={{ color: '#D97706', borderColor: '#FDE68A' }}>
                        <Megaphone className="w-3.5 h-3.5" /> Announcements
                    </p>
                    {events.announcements?.length > 0 ? (
                        <div className="space-y-2">
                            {events.announcements.map(a => (
                                <div key={a.id} onClick={() => onAnnouncementClick(a.id)}
                                    className="flex gap-2.5 p-2.5 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors border"
                                    style={{ borderColor: '#FDE68A', background: '#FFFBEB' }}>
                                    <Megaphone className="w-3 h-3 mt-1 flex-shrink-0" style={{ color: '#D97706' }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium" style={{ color: '#1F2937' }}>{a.subject}</p>
                                        {a.coursename && <p className="text-[11px] mt-0.5" style={{ color: '#6B7280' }}>{a.coursename}</p>}
                                        <p className="text-[10px] mt-1" style={{ color: '#9CA3AF' }}>{formatTime(a.timemodified)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs py-3 text-center" style={{ color: '#C4C8D4' }}>{isToday ? 'No announcements today' : 'None on this day'}</p>
                    )}
                </div>
                {/* Assessments column */}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3 pb-1.5 border-b flex items-center gap-1.5" style={{ color: '#10B981', borderColor: '#D1FAE5' }}>
                        <ClipboardCheck className="w-3.5 h-3.5" /> Assessments
                    </p>
                    {assessments.length > 0 ? (
                        <div className="space-y-2">
                            {assessments.slice(0, 6).map(item => (
                                <div key={item.id} onClick={() => onAssessmentClick(item.type, item.moduleId)}
                                    className="flex gap-2.5 p-2.5 rounded-lg cursor-pointer hover:bg-green-50 transition-colors border"
                                    style={{ borderColor: '#D1FAE5', background: '#F0FDF4' }}>
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.type === 'assign' ? '#2563EB' : '#10B981' }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium" style={{ color: '#1F2937' }}>{item.title}</p>
                                        <p className="text-[11px] mt-0.5" style={{ color: '#6B7280' }}>{item.courseCode} · {item.courseName}</p>
                                    </div>
                                    <span className="text-[10px] flex-shrink-0 px-1.5 py-0.5 rounded font-medium uppercase self-start"
                                        style={{ background: item.type === 'assign' ? '#DBEAFE' : '#D1FAE5', color: item.type === 'assign' ? '#2563EB' : '#10B981' }}>
                                        {item.type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs py-3 text-center" style={{ color: '#C4C8D4' }}>No assessments found</p>
                    )}
                </div>
            </div>
        </div>
    );
        </div>
    );
};

export default TeacherDashboard;
