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
    const [data, setData] = useState({ courseRows: [], summary: null, activities: [] });
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
    const firstName = user?.name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Teacher';

    const defaultAnnouncements = [
        { id: 1, subject: 'Welcome to Your Teaching Dashboard', message: 'This is your teaching hub. View your courses, assessments, and student activity from here.', coursename: 'System', userfullname: 'Admin', timemodified: new Date().toISOString() },
        { id: 2, subject: 'Assignment Grading Reminder', message: 'Please review and grade pending student submissions before the end of the semester.', coursename: 'Academics', userfullname: 'Registrar', timemodified: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, subject: 'New Course Resources Available', message: 'Updated teaching materials and resources are now available on the LMS for your courses.', coursename: 'Library', userfullname: 'Librarian', timemodified: new Date(Date.now() - 172800000).toISOString() },
    ];

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
                        onClick={() => handleOpenMoodle()}
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
                <KpiCard icon="📚" iconBg="#DBEAFE" value={summary.totalCourses || 0} label="My Courses" sub={`${summary.totalCourses || 0} assigned`} subColor="#6B7280" />
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
                            My Teaching Courses
                        </h2>
                        <button onClick={() => navigate('/teacher/programme')} className="text-xs font-medium" style={{ color: '#2563EB' }}>View all →</button>
                    </div>
                    <div className="p-4">
                        <TeacherCoursesTab courses={topCourses} onCourseClick={(id) => handleOpenMoodle(`/course/view.php?id=${id}`)} />
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
                        <AnnouncementsTab announcements={defaultAnnouncements} formatTime={formatTime} />
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
                        <AssessmentsTab assessments={recentAssessments} />
                    </div>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
                            <Bell className="w-4 h-4" style={{ color: '#2563EB' }} />
                            Notifications
                        </h2>
                    </div>
                    <div className="p-4">
                        <TeacherNotificationsTab formatTime={formatTime} />
                    </div>
                </div>
            </div>

            {/* Row 3: Calendar + Course Activity Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                <div className="lg:col-span-1">
                    <MiniCalendar date={calendarDate} onDateChange={setCalendarDate} />
                </div>
                <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-5" style={{ borderColor: '#E5E7EB' }}>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: '#1F2937' }}>Course Activity Overview</h3>
                    <CourseActivityChart courses={topCourses.slice(0, 5)} />
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border shadow-sm p-4 mb-5" style={{ borderColor: '#E5E7EB' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#1F2937' }}>Quick Links</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { icon: '📝', label: 'Assessments', path: '/teacher/assessments' },
                        { icon: '📄', label: 'My Programme', path: '/teacher/programme' },
                        { icon: '📊', label: 'Reports', path: '/teacher/reports' },
                        { icon: '📅', label: 'Timetable', path: '/teacher/timetable' },
                        { icon: '🎓', label: 'Teaching (LMS)', action: () => handleOpenMoodle() },
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

const TeacherCoursesTab = ({ courses, onCourseClick }) => {
    const bgColors = ['#FEF3C7', '#DBEAFE', '#F3E8FF', '#FDE2E4', '#D1FAE5', '#E0E7FF'];
    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No courses assigned yet</p>
                <p className="text-sm mt-1">Your teaching courses will appear here</p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.map((course, idx) => (
                <div key={course.id} onClick={() => onCourseClick?.(course.id)}
                    className="rounded-lg border overflow-hidden transition-all hover:shadow-md cursor-pointer"
                    style={{ borderColor: '#E5E7EB', background: '#fff' }}>
                    <div style={{ background: bgColors[idx % bgColors.length], padding: '24px 16px', minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="text-4xl">📚</span>
                    </div>
                    <div style={{ padding: '16px' }}>
                        <h3 className="text-sm font-semibold line-clamp-2" style={{ color: '#1F2937' }}>{course.name}</h3>
                        <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{course.code}</p>
                        <div className="mt-3 flex gap-3 text-xs" style={{ color: '#6B7280' }}>
                            <span>📝 {course.counts?.assign || 0} assign</span>
                            <span>💬 {course.counts?.forum || 0} forums</span>
                            <span>📋 {course.counts?.quiz || 0} quizzes</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const AssessmentsTab = ({ assessments }) => {
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
                <div key={item.id} className="py-2.5 flex gap-2.5 px-1">
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

const TeacherNotificationsTab = ({ formatTime }) => {
    const notifications = [
        { id: 1, subject: 'Student submission received', text: 'A student has submitted their assignment for grading.', read: false, timecreated: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, subject: 'Forum activity', text: 'A student posted a new question in the discussion forum.', read: false, timecreated: new Date(Date.now() - 7200000).toISOString() },
        { id: 3, subject: 'Course material updated', text: 'Your course materials have been synced from Moodle.', read: true, timecreated: new Date(Date.now() - 86400000).toISOString() },
    ];
    return (
        <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
            {notifications.map((notif) => (
                <div key={notif.id} className="py-2.5 flex gap-2.5 rounded px-1" style={{ background: !notif.read ? '#F0F9FF' : undefined }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: !notif.read ? '#2563EB' : '#D0D5E8' }} />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: !notif.read ? '#1F2937' : '#6B7280' }}>{notif.subject}</p>
                        <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: '#6B7280' }}>{notif.text}</p>
                    </div>
                    <span className="text-[10px] flex-shrink-0 whitespace-nowrap mt-0.5" style={{ color: '#9CA3AF' }}>{formatTime(notif.timecreated)}</span>
                </div>
            ))}
        </div>
    );
};

const AnnouncementsTab = ({ announcements, formatTime }) => (
    <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
        {announcements.map((ann) => (
            <div key={ann.id} className="py-3 px-1 hover:bg-gray-50 transition-colors rounded">
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
