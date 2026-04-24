import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Bell,
    CheckCircle,
    GraduationCap,
    Calendar,
    User,
    ExternalLink,
    Loader2,
    AlertCircle,
    Megaphone,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Lock,
} from 'lucide-react';
import axios from 'axios';
import { openMoodleSSO, getMoodleUrl } from '../../utils/ssoService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentPortalDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ssoLoading, setSsoLoading] = useState(false);
    const [ssoError, setSsoError] = useState('');
    const [activeTab, setActiveTab] = useState('courses');
    const [calendarDate, setCalendarDate] = useState(new Date());

    useEffect(() => {
        if (user?.email) fetchDashboard();
    }, [user?.email]);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await axios.get(`${API_URL}/students/student-dashboard`, {
                params: { email: user.email }
            });
            if (res.data?.success) {
                setData(res.data.data);
            } else {
                setError(res.data?.message || 'Failed to load dashboard');
            }
        } catch (err) {
            console.error('Dashboard fetch failed:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleAccessLMS = async () => {
        try {
            setSsoLoading(true);
            setSsoError('');
            await openMoodleSSO(user.email, {
                onError: (msg) => setSsoError(msg)
            });
        } catch (err) {
            setSsoError(err.response?.data?.message || 'Failed to access Moodle');
        } finally {
            setSsoLoading(false);
        }
    };

    const handleCourseClick = async (courseId) => {
        try {
            setSsoLoading(true);
            setSsoError('');
            await openMoodleSSO(user.email, {
                redirectTo: `/course/view.php?id=${courseId}`,
                onError: (msg) => setSsoError(msg)
            });
        } catch (err) {
            setSsoError(err.response?.data?.message || 'Failed to access Moodle');
        } finally {
            setSsoLoading(false);
        }
    };

    const handleMoodleNavigate = async (moodlePath) => {
        if (!moodlePath) return;
        try {
            setSsoLoading(true);
            setSsoError('');
            await openMoodleSSO(user.email, {
                redirectTo: moodlePath,
                onError: (msg) => setSsoError(msg)
            });
        } catch (err) {
            setSsoError(err.response?.data?.message || 'Failed to access Moodle');
        } finally {
            setSsoLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(dateStr);
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
                    <button onClick={fetchDashboard} className="mt-3 text-sm text-red-600 hover:underline">Try again</button>
                </div>
            </div>
        );
    }

    const { student, application, courses, summary, notifications, unreadMessages, upcomingEvents, announcements } = data || {};
    const firstName = student?.name?.split(' ')[0] || 'Student';
    const unreadCount = notifications?.filter(n => !n.read).length || 0;

    return (
        <div className="px-5 pt-2 pb-5 min-h-screen" style={{ background: '#FFFFFF' }}>

            {/* Welcome + LMS Button */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-base font-bold" style={{ color: '#1F2937' }}>
                            Welcome back, {firstName}! 👋
                        </h1>
                        <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                            {application?.courseTitle || application?.programName || "Here's what's happening in your academic journey today."}
                            {application?.reference && <span className="ml-2 text-xs">· Ref: {application.reference}</span>}
                        </p>
                    </div>
                    <button
                        onClick={handleAccessLMS}
                        disabled={ssoLoading}
                        className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-50 self-start md:self-auto"
                        style={{ background: '#2563EB' }}
                    >
                        <ExternalLink className="w-4 h-4" />
                        {ssoLoading ? 'Opening...' : 'Open Moodle LMS'}
                    </button>
                </div>
                {ssoError && <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-1">{ssoError}</p>}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <KpiCard
                    icon="📚"
                    iconBg="#DBEAFE"
                    value={summary?.totalCourses || 0}
                    label="Active Courses"
                    sub={`${(summary?.totalCourses || 0) * 6} credit hrs`}
                    subColor="#6B7280"
                />
                <KpiCard
                    icon="📊"
                    iconBg="#DBEAFE"
                    value={`${summary?.averageProgress || 0}%`}
                    label="Overall Progress"
                    sub={summary?.inProgressCourses > 0 ? `${summary.inProgressCourses} in progress` : 'Keep it up!'}
                    subColor="#10B981"
                />
                <KpiCard
                    icon="✅"
                    iconBg="#DBEAFE"
                    value={summary?.completedCourses || 0}
                    label="Completed"
                    sub="modules finished"
                    subColor="#6B7280"
                />
                <KpiCard
                    icon="🔔"
                    iconBg="#FECACA"
                    value={unreadCount}
                    label="Notifications"
                    sub={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                    subColor={unreadCount > 0 ? '#DC2626' : '#6B7280'}
                />
            </div>

            {/* Main Two-Column Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">

                {/* Left: Courses panel */}
                <div className="xl:col-span-2 bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>My Courses</h2>
                        <button onClick={() => navigate('/student/programme')} className="text-xs font-medium" style={{ color: '#2563EB' }}>
                            View all →
                        </button>
                    </div>

                    {/* Tab strip */}
                    <div className="flex overflow-x-auto" style={{ borderBottom: '1px solid #E5E7EB' }}>
                        {[
                            { key: 'courses', label: 'Courses' },
                            { key: 'events', label: 'Upcoming' },
                            { key: 'announcements', label: 'Announcements' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className="px-5 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors"
                                style={{
                                    borderBottomColor: activeTab === tab.key ? '#2563EB' : 'transparent',
                                    color: activeTab === tab.key ? '#2563EB' : '#6B7280',
                                    background: 'transparent',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4">
                        {activeTab === 'courses' && <CoursesTab courses={courses} onCourseClick={handleCourseClick} />}
                        {activeTab === 'events' && <EventsTab events={upcomingEvents} formatDate={formatDate} onItemClick={handleMoodleNavigate} />}
                        {activeTab === 'announcements' && <AnnouncementsTab announcements={announcements} formatTime={formatTime} onItemClick={handleMoodleNavigate} />}
                    </div>
                </div>

                {/* Right column: Notifications + Quick Links */}
                <div className="flex flex-col gap-5">

                    {/* Notifications Panel */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
                        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                            <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Notifications</h2>
                            <button onClick={() => navigate('/student/notifications')} className="text-xs font-medium" style={{ color: '#2563EB' }}>
                                View all
                            </button>
                        </div>
                        <div className="p-4 max-h-64 overflow-y-auto">
                            <NotificationsTab notifications={notifications?.slice(0, 5)} formatTime={formatTime} onItemClick={handleMoodleNavigate} />
                        </div>
                    </div>

                    {/* Mini Calendar */}
                    <MiniCalendar
                        date={calendarDate}
                        onDateChange={setCalendarDate}
                        events={upcomingEvents}
                        onEventDayClick={() => setActiveTab('events')}
                    />

                    {/* Quick Links */}
                    <div className="bg-white rounded-xl border shadow-sm p-4" style={{ borderColor: '#E5E7EB' }}>
                        <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F2937' }}>Quick Links</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { icon: '📝', label: 'Assessments', path: '/student/assessments' },
                                { icon: '📄', label: 'My Programme', path: '/student/programme' },
                                { icon: '🏆', label: 'Grades', path: '/student/grades' },
                                { icon: '📅', label: 'Timetable', path: '/student/timetable' },
                                { icon: '📚', label: 'Library', path: '/student/library' },
                                { icon: '💬', label: 'Messages', path: '/student/messages', badge: unreadMessages > 0 ? unreadMessages : null },
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigate(item.path)}
                                    className="relative flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center transition hover:shadow-sm"
                                    style={{ borderColor: '#E5E7EB', background: '#fff' }}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="text-xs font-medium" style={{ color: '#6B7280' }}>{item.label}</span>
                                    {item.badge && (
                                        <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Info Footer */}
            {(student || application) && (
                <div className="bg-white rounded-xl border shadow-sm p-5" style={{ borderColor: '#E5E7EB' }}>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#1F2937' }}>
                        <User className="w-4 h-4" style={{ color: '#6B7280' }} />
                        Your Details
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {student?.email && <InfoItem label="Email" value={student.email} />}
                        {student?.phone && <InfoItem label="Phone" value={student.phone} />}
                        {student?.nationality && <InfoItem label="Nationality" value={student.nationality} />}
                        {application?.intakeStartDate && <InfoItem label="Intake Start" value={formatDate(application.intakeStartDate)} />}
                        {application?.programmeType && <InfoItem label="Programme Type" value={application.programmeType} />}
                        {application?.programName && <InfoItem label="Programme" value={application.programName} />}
                        {application?.courseCode && <InfoItem label="Course Code" value={application.courseCode} />}
                        {student?.lastMoodleAccess && <InfoItem label="Last LMS Access" value={formatDate(student.lastMoodleAccess)} />}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── Sub-Components ── */

const MiniCalendar = ({ date, onDateChange, events, onEventDayClick }) => {
    const today = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthName = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    // Build event day set (day numbers in this month)
    const eventDays = new Set();
    (events || []).forEach(ev => {
        if (!ev.timestart) return;
        const d = new Date(typeof ev.timestart === 'number' && ev.timestart < 1e11
            ? ev.timestart * 1000 : ev.timestart);
        if (d.getFullYear() === year && d.getMonth() === month) {
            eventDays.add(d.getDate());
        }
    });

    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Shift so Monday = 0
    const startOffset = (firstDay + 6) % 7;

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const prevMonth = () => onDateChange(new Date(year, month - 1, 1));
    const nextMonth = () => onDateChange(new Date(year, month + 1, 1));

    return (
        <div className="bg-white rounded-xl border shadow-sm p-4" style={{ borderColor: '#E5E7EB' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Calendar</h2>
                <div className="flex items-center gap-1">
                    <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 transition">
                        <ChevronLeft className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />
                    </button>
                    <span className="text-xs font-medium px-1" style={{ color: '#6B7280' }}>{monthName}</span>
                    <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 transition">
                        <ChevronRight className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />
                    </button>
                </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
                    <div key={d} className="text-center text-[10px] font-semibold pb-1" style={{ color: '#9CA3AF' }}>{d}</div>
                ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((day, i) => (
                    <div key={i} className="flex flex-col items-center justify-center py-0.5">
                        {day ? (
                            <button
                                onClick={() => eventDays.has(day) && onEventDayClick?.()}
                                className="w-7 h-7 rounded-full flex flex-col items-center justify-center relative transition"
                                style={{
                                    background: isToday(day) ? '#2563EB' : 'transparent',
                                    cursor: eventDays.has(day) ? 'pointer' : 'default',
                                }}
                            >
                                <span className="text-[11px] font-medium leading-none" style={{ color: isToday(day) ? '#fff' : '#1F2937' }}>
                                    {day}
                                </span>
                                {eventDays.has(day) && !isToday(day) && (
                                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: '#2563EB' }} />
                                )}
                                {eventDays.has(day) && isToday(day) && (
                                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white/70" />
                                )}
                            </button>
                        ) : <div className="w-7 h-7" />}
                    </div>
                ))}
            </div>

            {eventDays.size > 0 && (
                <p className="mt-2 text-[10px] text-center" style={{ color: '#6B7280' }}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle" style={{ background: '#2563EB' }} />
                    {eventDays.size} day{eventDays.size > 1 ? 's' : ''} with events this month
                </p>
            )}
        </div>
    );
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

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs" style={{ color: '#6B7280' }}>{label}</p>
        <p className="font-medium truncate" style={{ color: '#1F2937' }}>{value}</p>
    </div>
);

const CoursesTab = ({ courses, onCourseClick }) => {
    const [collapsed, setCollapsed] = useState({});

    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No courses enrolled yet</p>
                <p className="text-sm mt-1">Your enrolled courses will appear here</p>
            </div>
        );
    }

    // Parse shortname to extract programme, year, semester
    const parseCourse = (course) => {
        const match = course.shortname?.match(/^([A-Z]+-[A-Z]+)-Y(\d+)-S(\d+)-C(\d+)$/);
        if (match) {
            return { programme: match[1], year: parseInt(match[2]), semester: parseInt(match[3]), courseNum: parseInt(match[4]) };
        }
        return { programme: 'Other', year: 0, semester: 0, courseNum: 0 };
    };

    const programmeLabels = { 'HND-LM': 'HND in Leadership and Management', 'HND-BUS': 'HND in Business' };

    // Group: programme -> year -> semester -> courses
    const grouped = {};
    courses.forEach((course) => {
        const { programme, year, semester, courseNum } = parseCourse(course);
        if (!grouped[programme]) grouped[programme] = {};
        if (!grouped[programme][year]) grouped[programme][year] = {};
        if (!grouped[programme][year][semester]) grouped[programme][year][semester] = [];
        grouped[programme][year][semester].push({ ...course, courseNum });
    });

    // Sort courses within each semester
    Object.values(grouped).forEach(years =>
        Object.values(years).forEach(semesters =>
            Object.values(semesters).forEach(arr => arr.sort((a, b) => a.courseNum - b.courseNum))
        )
    );

    // Determine active semester: the earliest semester that has any in-progress activity
    let activeProgramme = null, activeYear = null, activeSemester = null;
    outer: for (const [prog, years] of Object.entries(grouped)) {
        for (const [yr, semesters] of Object.entries(years).sort(([a],[b]) => a - b)) {
            for (const [sem, semCourses] of Object.entries(semesters).sort(([a],[b]) => a - b)) {
                if (semCourses.some(c => (c.progress ?? 0) > 0 || c.totalActivities > 0)) {
                    activeProgramme = prog; activeYear = yr; activeSemester = sem;
                    break outer;
                }
            }
        }
    }

    const toggleCollapse = (key) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

    const renderCourseCard = (course, isActive) => {
        const progress = course.progress ?? 0;
        const isComplete = course.completed;
        const wrapperProps = isActive && onCourseClick ? {
            onClick: () => onCourseClick(course.id),
            role: 'link',
            tabIndex: 0,
            onKeyDown: (e) => { if (e.key === 'Enter') onCourseClick(course.id); },
        } : {};

        return (
            <div
                key={course.id}
                {...wrapperProps}
                className="flex items-center gap-3 p-3 rounded-xl border transition-all"
                style={{
                    borderColor: isActive ? '#E5E7EB' : '#F9FAFB',
                    background: isActive ? '#fff' : '#FAFBFF',
                    opacity: isActive ? 1 : 0.6,
                    cursor: isActive && onCourseClick ? 'pointer' : 'default',
                }}
            >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: isComplete ? '#EDF7EE' : isActive && progress > 0 ? '#DBEAFE' : '#F9FAFB' }}>
                    {isComplete ? (
                        <CheckCircle className="w-4 h-4" style={{ color: '#4A9A60' }} />
                    ) : !isActive ? (
                        <Lock className="w-4 h-4 text-gray-300" />
                    ) : (
                        <BookOpen className="w-4 h-4" style={{ color: progress > 0 ? '#2563EB' : '#6B7280' }} />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: isActive ? '#1F2937' : '#6B7280' }}>{course.fullname}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: '#6B7280' }}>
                        {course.lastaccess && <span>Accessed: {new Date(course.lastaccess).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                        {course.grade && course.grade !== '-' && <span style={{ color: '#4A9A60' }} className="font-medium">Grade: {course.grade}</span>}
                    </div>
                    {isActive && course.totalActivities > 0 && (
                        <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: '#E5E7EB' }}>
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${Math.min(progress, 100)}%`, background: isComplete ? '#4A9A60' : '#2563EB' }}
                                />
                            </div>
                            <span className="text-[11px] font-medium w-9 text-right" style={{ color: '#6B7280' }}>{progress}%</span>
                        </div>
                    )}
                </div>
                {isActive && (
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#9CA3AF' }} />
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {Object.entries(grouped).sort().map(([prog, years]) => {
                // Filter out empty years - only show years with active semesters
                const activeYears = Object.entries(years)
                    .filter(([yr, semesters]) => 
                        Object.values(semesters).some(semCourses => semCourses.some(c => (c.progress ?? 0) > 0 || c.completed))
                    )
                    .sort(([a],[b]) => a - b);

                if (activeYears.length === 0) return null;

                return (
                    <div key={prog}>
                        <div className="flex items-center gap-2 mb-3">
                            <GraduationCap className="w-5 h-5" style={{ color: '#2563EB' }} />
                            <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: '#1F2937' }}>{programmeLabels[prog] || prog}</h3>
                        </div>
                        {activeYears.map(([yr, semesters]) => (
                            <div key={yr} className="ml-2 mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#2563EB' }} />
                                    <h4 className="text-xs font-semibold text-gray-600">Year {yr}</h4>
                                </div>
                                {Object.entries(semesters)
                                    .filter(([sem, semCourses]) => semCourses.some(c => (c.progress ?? 0) > 0 || c.completed))
                                    .sort(([a],[b]) => a - b)
                                    .map(([sem, semCourses]) => {
                                const semKey = `${prog}-Y${yr}-S${sem}`;
                                const isActiveSem = prog === activeProgramme && yr === activeYear && sem === activeSemester;
                                const isCollapsed = collapsed[semKey];
                                const semProgress = semCourses.filter(c => (c.progress ?? 0) > 0).length;
                                const semComplete = semCourses.filter(c => c.completed).length;

                                return (
                                    <div key={sem} className="ml-4 mb-3">
                                        <button
                                            onClick={() => toggleCollapse(semKey)}
                                            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-colors"
                                            style={{ background: isActiveSem ? '#DBEAFE' : '#F9FAFB' }}
                                        >
                                            {isCollapsed ? (
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            )}
                                            <span className="text-xs font-medium" style={{ color: isActiveSem ? '#2563EB' : '#6B7280' }}>
                                                Semester {sem}
                                            </span>
                                            {isActiveSem && (
                                                <span className="ml-1 px-2 py-0.5 text-[10px] font-bold text-white rounded-full uppercase" style={{ background: '#2563EB' }}>Active</span>
                                            )}
                                            <span className="ml-auto text-xs text-gray-400">
                                                {semCourses.length} courses
                                                {semProgress > 0 && ` · ${semProgress} in progress`}
                                                {semComplete > 0 && ` · ${semComplete} completed`}
                                            </span>
                                        </button>
                                        {!isCollapsed && (
                                            <div className="mt-2 grid gap-2">
                                                {semCourses.map(course => renderCourseCard(course, isActiveSem))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

const NotificationsTab = ({ notifications, formatTime, onItemClick }) => {
    if (!notifications || notifications.length === 0) {
        return (
            <div className="text-center py-8" style={{ color: '#6B7280' }}>
                <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs mt-1">You are all caught up!</p>
            </div>
        );
    }

    return (
        <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
            {notifications.map(notif => (
                <div
                    key={notif.id}
                    onClick={() => onItemClick?.(notif.moodlePath)}
                    className="py-2.5 flex gap-2.5 cursor-pointer rounded hover:bg-gray-50 transition-colors px-1"
                    style={{ background: !notif.read ? '#F0F9FF' : undefined }}
                >
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: !notif.read ? '#2563EB' : '#D0D5E8' }} />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: !notif.read ? '#1F2937' : '#6B7280' }}>{notif.subject}</p>
                        {notif.text && <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: '#6B7280' }}>{notif.text}</p>}
                    </div>
                    <span className="text-[10px] flex-shrink-0 whitespace-nowrap mt-0.5" style={{ color: '#9CA3AF' }}>{formatTime(notif.timecreated)}</span>
                </div>
            ))}
        </div>
    );
};

const EventsTab = ({ events, formatDate, onItemClick }) => {
    if (!events || events.length === 0) {
        return (
            <div className="text-center py-8" style={{ color: '#6B7280' }}>
                <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                <p className="text-sm font-medium">No upcoming events</p>
                <p className="text-xs mt-1">Your calendar is clear</p>
            </div>
        );
    }

    return (
        <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
            {events.map(event => (
                <div key={event.id} onClick={() => onItemClick?.(event.moodlePath)} className="py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors rounded px-1">
                    <div className="rounded-lg px-2 py-1 text-center flex-shrink-0 min-w-[44px]" style={{ background: '#DBEAFE' }}>
                        <p className="text-base font-bold leading-tight" style={{ color: '#2563EB' }}>
                            {event.timestart ? new Date(event.timestart).getDate() : '-'}
                        </p>
                        <p className="text-[9px] uppercase font-semibold" style={{ color: '#6B7280' }}>
                            {event.timestart ? new Date(event.timestart).toLocaleDateString('en-GB', { month: 'short' }) : ''}
                        </p>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: '#1F2937' }}>{event.name}</p>
                        {event.coursename && <p className="text-[11px] mt-0.5" style={{ color: '#6B7280' }}>{event.coursename}</p>}
                    </div>
                    {event.eventtype && <span className="text-[10px] px-2 py-0.5 rounded flex-shrink-0 font-medium" style={{ background: '#F9FAFB', color: '#6B7280' }}>{event.eventtype}</span>}
                </div>
            ))}
        </div>
    );
};

const AnnouncementsTab = ({ announcements, formatTime, onItemClick }) => {
    if (!announcements || announcements.length === 0) {
        return (
            <div className="text-center py-8" style={{ color: '#6B7280' }}>
                <Megaphone className="w-8 h-8 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                <p className="text-sm font-medium">No announcements</p>
                <p className="text-xs mt-1">Check back later for updates</p>
            </div>
        );
    }

    return (
        <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
            {announcements.map(ann => (
                <div key={ann.id} onClick={() => onItemClick?.(ann.moodlePath)} className="py-3 px-1 cursor-pointer hover:bg-gray-50 transition-colors rounded">
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

export default StudentPortalDashboard;




