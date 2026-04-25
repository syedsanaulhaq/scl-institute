import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StudentPortalDashboard2 from './StudentPortalDashboard2';
import StudentPortalDashboard3 from './StudentPortalDashboard3';
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

// Wrapper component that routes to the correct dashboard variant
const StudentPortalDashboardRouter = ({ user }) => {
    const [searchParams] = useSearchParams();
    const layoutParam = searchParams.get('layout');
    
    // Route to appropriate dashboard based on layout parameter
    if (layoutParam === '2') {
        return <StudentPortalDashboard2 user={user} />;
    }
    if (layoutParam === '3') {
        return <StudentPortalDashboard3 user={user} />;
    }
    
    // Default to Dashboard 1
    return <StudentPortalDashboard1 user={user} />;
};

const StudentPortalDashboard1 = ({ user }) => {
    const navigate = useNavigate();
    
    // Define all hooks unconditionally (required for React hook rules)
    const [data, setData] = useState(null);
    const [sclNotifications, setSclNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ssoLoading, setSsoLoading] = useState(false);
    const [ssoError, setSsoError] = useState('');
    const [activeTab, setActiveTab] = useState('courses');
    const [calendarDate, setCalendarDate] = useState(new Date());

    useEffect(() => {
        if (user?.email) {
            fetchDashboard();
            fetchSCLNotifications();
        }
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

    const fetchSCLNotifications = async () => {
        try {
            const res = await axios.get(`${API_URL}/notifications/user/${user.email}`);
            if (res.data?.success && res.data?.notifications) {
                setSclNotifications(res.data.notifications);
            }
        } catch (err) {
            console.error('SCL notifications fetch failed:', err);
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

    const { student, application, courses, summary, notifications: apiNotifications, unreadMessages, upcomingEvents, announcements: apiAnnouncements } = data || {};
    
    // Add fallback announcements if none from API
    const defaultAnnouncements = [
        {
            id: 1,
            subject: 'Welcome to Your Student Portal',
            message: 'Welcome! This is your personal student dashboard where you can track your courses, announcements, and upcoming events.',
            coursename: 'System',
            userfullname: 'Admin',
            timemodified: new Date().toISOString(),
            moodlePath: '/course/view.php?id=1'
        },
        {
            id: 2,
            subject: 'Semester 2 Registration Now Open',
            message: 'Registration for Semester 2 courses is now open. Please visit the course registration page to enroll in your courses.',
            coursename: 'Academics',
            userfullname: 'Registrar',
            timemodified: new Date(Date.now() - 86400000).toISOString(),
            moodlePath: '/course/view.php?id=2'
        },
        {
            id: 3,
            subject: 'Library Resources Available',
            message: 'New online library resources are now available. Access them through the library portal with your student ID.',
            coursename: 'Library',
            userfullname: 'Librarian',
            timemodified: new Date(Date.now() - 172800000).toISOString(),
            moodlePath: '/course/view.php?id=3'
        }
    ];

    // Add fallback notifications if none from API
    const defaultNotifications = [
        {
            id: 1,
            subject: 'Course Assignment Due',
            text: 'You have an assignment due tomorrow. Please submit your work before the deadline.',
            timecreated: new Date(Date.now() - 3600000).toISOString(),
            read: false,
            type: 'assign_due',
            moodlePath: '/mod/assign/view.php?id=1'
        },
        {
            id: 2,
            subject: 'New Course Material',
            text: 'Your instructor has uploaded new lecture slides and reading materials.',
            timecreated: new Date(Date.now() - 7200000).toISOString(),
            read: false,
            type: 'resource_added',
            moodlePath: '/mod/resource/view.php?id=1'
        },
        {
            id: 3,
            subject: 'Course Announcement',
            text: 'New announcement posted in your course by your instructor.',
            timecreated: new Date(Date.now() - 86400000).toISOString(),
            read: true,
            type: 'post_created',
            moodlePath: '/mod/forum/view.php?id=1'
        }
    ];
    
    const announcements = apiAnnouncements && apiAnnouncements.length > 0 ? apiAnnouncements : defaultAnnouncements;
    
    // Use SCL notifications if available, otherwise fallback to Moodle notifications, then default notifications
    let notifications = [];
    if (sclNotifications && sclNotifications.length > 0) {
        notifications = sclNotifications.map(n => ({
            id: n.id,
            subject: n.subject,
            text: n.message || n.body || '',
            timecreated: n.created_at ? new Date(n.created_at).toISOString() : new Date().toISOString(),
            read: n.is_read || false,
            type: n.type || 'notification',
            moodlePath: '/student/notifications'
        }));
    } else if (apiNotifications && apiNotifications.length > 0) {
        notifications = apiNotifications;
    } else {
        notifications = defaultNotifications;
    }
    
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

            {/* Main Content - 2 Column Layout */}
            
            {/* Row 1: Courses (Left) and Announcements (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Courses Block - Moodle Style */}
                <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
                            <BookOpen className="w-4 h-4" style={{ color: '#2563EB' }} />
                            My Courses
                        </h2>
                        <button onClick={() => navigate('/student/programme')} className="text-xs font-medium" style={{ color: '#2563EB' }}>
                            View all →
                        </button>
                    </div>
                    <div className="p-4">
                        <CoursesTab courses={courses?.slice(0, 5)} onCourseClick={handleCourseClick} />
                    </div>
                </div>

                {/* Announcements Block */}
                <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
                            <Megaphone className="w-4 h-4" style={{ color: '#2563EB' }} />
                            Announcements
                        </h2>
                        <button onClick={() => navigate('/student/notifications')} className="text-xs font-medium" style={{ color: '#2563EB' }}>
                            View all →
                        </button>
                    </div>
                    <div className="p-4">
                        <AnnouncementsTab announcements={announcements?.slice(0, 5)} formatTime={formatTime} onItemClick={handleMoodleNavigate} />
                    </div>
                </div>
            </div>

            {/* Row 2: Upcoming Events (Left) and Notifications (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Upcoming Events Block */}
                <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
                            <Calendar className="w-4 h-4" style={{ color: '#2563EB' }} />
                            Upcoming Events
                        </h2>
                        <button onClick={() => navigate('/student/timetable')} className="text-xs font-medium" style={{ color: '#2563EB' }}>
                            View all →
                        </button>
                    </div>
                    <div className="p-4">
                        <EventsTab events={upcomingEvents?.slice(0, 5)} formatDate={formatDate} onItemClick={handleMoodleNavigate} />
                    </div>
                </div>

                {/* Notifications Block */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
                            <Bell className="w-4 h-4" style={{ color: '#2563EB' }} />
                            Notifications
                        </h2>
                        <button onClick={() => navigate('/student/notifications')} className="text-xs font-medium" style={{ color: '#2563EB' }}>
                            View all
                        </button>
                    </div>
                    <div className="p-4">
                        <NotificationsTab notifications={notifications?.slice(0, 5)} formatTime={formatTime} onItemClick={handleMoodleNavigate} />
                    </div>
                </div>
            </div>

            {/* Row 3: Calendar and Performance by Course */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                <div className="lg:col-span-1">
                    <MiniCalendar
                        date={calendarDate}
                        onDateChange={setCalendarDate}
                        events={upcomingEvents}
                        onEventDayClick={() => {}}
                    />
                </div>

                {/* Performance by Course Chart */}
                {courses && courses.length > 0 && (
                    <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-5" style={{ borderColor: '#E5E7EB' }}>
                        <h3 className="text-sm font-semibold mb-4" style={{ color: '#1F2937' }}>Performance by Course</h3>
                        <PerformanceChart courses={courses.slice(0, 4)} />
                    </div>
                )}
            </div>

            {/* Quick Links Section */}
            <div className="bg-white rounded-xl border shadow-sm p-4 mb-5" style={{ borderColor: '#E5E7EB' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#1F2937' }}>Quick Links</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
                            className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg border text-center transition hover:shadow-md hover:border-blue-300"
                            style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
                        >
                            <span className="text-3xl">{item.icon}</span>
                            <span className="text-sm font-semibold" style={{ color: '#1F2937' }}>{item.label}</span>
                            {item.badge && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
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
    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No courses enrolled yet</p>
                <p className="text-sm mt-1">Your enrolled courses will appear here</p>
            </div>
        );
    }

    // Get course background pattern based on course name
    const getCoursePattern = (courseName) => {
        const lower = courseName.toLowerCase();
        const patterns = {
            'accounting': { bg: '#E0E7FF', svg: 'M10,10 L30,10 L30,30 L10,30 Z M15,15 L25,15 L25,25 L15,25 Z' },
            'marketing': { bg: '#FDE2E4', svg: 'M10,10 L20,10 L25,20 L20,30 L10,30 L5,20 Z' },
            'business': { bg: '#FEF3C7', svg: 'M5,10 L25,10 L35,20 L25,30 L5,30 L-5,20 Z' },
            'management': { bg: '#F3E8FF', svg: 'M10,5 L30,15 L30,35 L10,35 Z' },
            'finance': { bg: '#BFDBFE', svg: 'M10,15 L20,5 L30,15 L20,25 Z M10,25 L20,35 L30,25' },
            'technology': { bg: '#DBEAFE', svg: 'M8,8 L13,8 L13,13 L8,13 Z M17,8 L22,8 L22,13 L17,13 Z M26,8 L31,8 L31,13 L26,13 Z' },
            'communication': { bg: '#A7F3D0', svg: 'M10,10 L30,10 L30,20 L10,20 Z M15,22 L12,28 L25,25 Z' },
            'leadership': { bg: '#FEF3C7', svg: 'M20,5 L30,15 L30,30 L10,30 L10,15 Z M16,16 L24,16 L24,28 L16,28 Z' },
            'analytics': { bg: '#C7D2FE', svg: 'M8,28 L12,20 L16,24 L20,12 L24,18 L28,10 L32,15' }
        };

        for (const [key, pattern] of Object.entries(patterns)) {
            if (lower.includes(key)) return pattern;
        }
        return { bg: '#F3F4F6', svg: 'M10,10 L30,10 L30,30 L10,30 Z' };
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.map(course => {
                const progress = course.progress ?? 0;
                const isComplete = course.completed;
                const pattern = getCoursePattern(course.fullname);
                const bgColor = isComplete ? '#F0FDF4' : pattern.bg;
                
                return (
                    <div
                        key={course.id}
                        onClick={() => onCourseClick?.(course.id)}
                        className="rounded-lg border overflow-hidden transition-all hover:shadow-md cursor-pointer"
                        style={{ borderColor: '#E5E7EB', background: '#fff' }}
                    >
                        {/* Course Background with SVG Pattern */}
                        <div style={{ background: bgColor, padding: '24px 16px', textAlign: 'center', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="80" height="80" viewBox="0 0 40 40" style={{ opacity: 0.3 }}>
                                <path d={pattern.svg} stroke={isComplete ? '#10B981' : '#6B7280'} strokeWidth="1.5" fill="none" />
                            </svg>
                        </div>
                        
                        {/* Course Content */}
                        <div style={{ padding: '16px' }}>
                            <h3 className="text-sm font-semibold line-clamp-2" style={{ color: '#1F2937' }}>
                                {course.fullname}
                            </h3>
                            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                                {course.shortname}
                            </p>
                            
                            {/* Progress Bar */}
                            <div style={{ marginTop: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span className="text-xs font-medium" style={{ color: '#6B7280' }}>
                                        {isComplete ? '✓ Completed' : 'Progress'}
                                    </span>
                                    <span className="text-xs font-bold" style={{ color: isComplete ? '#10B981' : '#2563EB' }}>
                                        {progress}%
                                    </span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            height: '100%',
                                            width: `${Math.min(progress, 100)}%`,
                                            background: isComplete ? '#10B981' : '#2563EB',
                                            transition: 'width 0.3s ease',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
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

const PerformanceChart = ({ courses }) => {
    const chartWidth = 600;
    const chartHeight = 200;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const plotWidth = chartWidth - margin.left - margin.right;
    const plotHeight = chartHeight - margin.top - margin.bottom;
    
    // Create bars for first 4 courses
    const courseData = courses.map((course, idx) => ({
        code: course.code?.substring(0, 6) || `C${idx + 1}`,
        grade: course.progress || 70,
        max: 100
    }));

    const barWidth = plotWidth / (courseData.length * 2.5);
    const spacing = barWidth * 1.5;

    return (
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ minWidth: '100%' }}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((val) => {
                const y = margin.top + plotHeight - (val / 100) * plotHeight;
                return (
                    <line
                        key={`grid-${val}`}
                        x1={margin.left}
                        y1={y}
                        x2={chartWidth - margin.right}
                        y2={y}
                        stroke="#F3F4F6"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                    />
                );
            })}

            {/* Y-axis */}
            <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotHeight} stroke="#D1D5DB" strokeWidth="2" />
            
            {/* X-axis */}
            <line x1={margin.left} y1={margin.top + plotHeight} x2={chartWidth - margin.right} y2={margin.top + plotHeight} stroke="#D1D5DB" strokeWidth="2" />

            {/* Y-axis labels */}
            {[0, 25, 50, 75, 100].map((val) => {
                const y = margin.top + plotHeight - (val / 100) * plotHeight;
                return (
                    <g key={`label-${val}`}>
                        <line x1={margin.left - 5} y1={y} x2={margin.left} y2={y} stroke="#D1D5DB" strokeWidth="1" />
                        <text x={margin.left - 10} y={y + 4} fontSize="12" textAnchor="end" fill="#6B7280">{val}</text>
                    </g>
                );
            })}

            {/* Bars */}
            {courseData.map((data, idx) => {
                const x = margin.left + idx * (barWidth * 2 + spacing);
                
                // Your grade bar height
                const yourHeight = (data.grade / data.max) * plotHeight;
                const maxHeight = (data.max / data.max) * plotHeight;
                
                return (
                    <g key={`course-${idx}`}>
                        {/* Your Grade Bar (Green) */}
                        <rect
                            x={x}
                            y={margin.top + plotHeight - yourHeight}
                            width={barWidth}
                            height={yourHeight}
                            fill="#10B981"
                        />

                        {/* Maximum Bar (Light Purple) */}
                        <rect
                            x={x + barWidth + 5}
                            y={margin.top + plotHeight - maxHeight}
                            width={barWidth}
                            height={maxHeight}
                            fill="#E9D5FF"
                            opacity="0.6"
                        />

                        {/* Course Label */}
                        <text
                            x={x + barWidth / 2}
                            y={margin.top + plotHeight + 25}
                            fontSize="12"
                            textAnchor="middle"
                            fill="#6B7280"
                        >
                            {data.code}
                        </text>
                    </g>
                );
            })}

            {/* Legend */}
            <g>
                <rect x={margin.left} y={chartHeight - 25} width="10" height="10" fill="#10B981" />
                <text x={margin.left + 15} y={chartHeight - 17} fontSize="11" fill="#6B7280">Your Grade</text>

                <rect x={margin.left + 130} y={chartHeight - 25} width="10" height="10" fill="#E9D5FF" opacity="0.6" />
                <text x={margin.left + 145} y={chartHeight - 17} fontSize="11" fill="#6B7280">Maximum</text>
            </g>
        </svg>
    );
};

export default StudentPortalDashboardRouter;




