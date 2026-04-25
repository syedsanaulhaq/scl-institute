import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Bell,
    CheckCircle,
    Calendar,
    Megaphone,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import axios from 'axios';
import { openMoodleSSO } from '../../utils/ssoService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentPortalDashboard2 = ({ user }) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [sclNotifications, setSclNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ssoLoading, setSsoLoading] = useState(false);
    const [ssoError, setSsoError] = useState('');
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#2563EB' }} />
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

    // Fallback announcements
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
    ];

    // Fallback notifications
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
    ];

    const announcements = apiAnnouncements && apiAnnouncements.length > 0 ? apiAnnouncements : defaultAnnouncements;

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

    const formatTime = (dateStr) => {
        if (!dateStr) return 'Recently';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    // Determine course background color
    const getCourseColor = (courseName) => {
        const name = (courseName || '').toLowerCase();
        if (name.includes('business')) return '#E0E7FF';
        if (name.includes('marketing')) return '#FDE2E4';
        if (name.includes('accounting')) return '#E0F2FE';
        if (name.includes('management')) return '#FEF3C7';
        if (name.includes('finance')) return '#DCFCE7';
        if (name.includes('technology')) return '#F3E8FF';
        if (name.includes('communication')) return '#FCE7F3';
        if (name.includes('leadership')) return '#EFF6FF';
        return '#DBEAFE';
    };

    return (
        <div className="px-5 pt-2 pb-5 min-h-screen" style={{ background: '#FFFFFF' }}>
            {/* Welcome Section */}
            <div className="mb-6">
                <h1 className="text-base font-bold" style={{ color: '#1F2937' }}>Welcome back, {firstName}! 👋</h1>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                    {application?.courseTitle || application?.programName || "Here's what's happening in your academic journey today."}
                </p>
            </div>

            {/* KPI Cards - 4 Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                    <p className="text-2xl font-bold" style={{ color: '#1F2937' }}>{courses?.length || 0}</p>
                    <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Courses</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                    <p className="text-2xl font-bold" style={{ color: '#1F2937' }}>{summary?.completedCount || 0}</p>
                    <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Completed</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                    <p className="text-2xl font-bold" style={{ color: '#1F2937' }}>{summary?.avgProgress || 0}%</p>
                    <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Progress</p>
                </div>
                <div className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                    <p className="text-2xl font-bold" style={{ color: '#1F2937' }}>{unreadCount || 0}</p>
                    <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Unread</p>
                </div>
            </div>

            {/* Row 1: Courses | Announcements */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                {/* Courses Grid */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>My Courses</h2>
                        <button onClick={() => navigate('/student/dashboard?layout=1')} className="text-xs" style={{ color: '#2563EB' }}>View all</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {courses?.slice(0, 5).map((course, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleCourseClick(course.id)}
                                className="p-3 rounded-lg cursor-pointer border border-gray-200 hover:shadow-md transition"
                                style={{ backgroundColor: getCourseColor(course.name) }}
                            >
                                <p className="text-xs font-semibold" style={{ color: '#1F2937' }}>{course.name}</p>
                                <p className="text-[10px] mt-1" style={{ color: '#6B7280' }}>{course.code}</p>
                                {course.progress !== null && (
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                                        <div
                                            className="h-1 rounded-full transition-all"
                                            style={{
                                                width: `${course.progress}%`,
                                                backgroundColor: course.completed ? '#10B981' : '#2563EB'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Announcements */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Announcements</h2>
                        <Megaphone className="w-4 h-4" style={{ color: '#D07020' }} />
                    </div>
                    <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: '#F9FAFB' }}>
                        {announcements?.slice(0, 5).map(ann => (
                            <div key={ann.id} onClick={() => handleMoodleNavigate(ann.moodlePath)} className="py-2 px-1 cursor-pointer hover:bg-gray-50 transition-colors rounded">
                                <p className="text-xs font-semibold" style={{ color: '#1F2937' }}>{ann.subject}</p>
                                {ann.message && <p className="text-[10px] line-clamp-1 mt-1" style={{ color: '#6B7280' }}>{ann.message}</p>}
                                <p className="text-[10px] mt-1" style={{ color: '#9CA3AF' }}>{formatTime(ann.timemodified)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 2: Events | Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                {/* Upcoming Events */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Upcoming Events</h2>
                        <Calendar className="w-4 h-4" style={{ color: '#2563EB' }} />
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {upcomingEvents?.slice(0, 5).map((event, idx) => (
                            <div key={idx} className="p-3 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold" style={{ color: '#1F2937' }}>{event.name}</p>
                                        <p className="text-[10px] mt-1" style={{ color: '#6B7280' }}>{event.description}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] mt-2" style={{ color: '#9CA3AF' }}>{formatDate(event.timestart)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notifications */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Notifications</h2>
                        <Bell className="w-4 h-4" style={{ color: '#2563EB' }} />
                    </div>
                    <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: '#F9FAFB' }}>
                        {notifications?.slice(0, 5).map(notif => (
                            <div
                                key={notif.id}
                                onClick={() => handleMoodleNavigate(notif.moodlePath)}
                                className="py-2 flex gap-2 cursor-pointer rounded hover:bg-gray-50 transition-colors px-1"
                                style={{ background: !notif.read ? '#F0F9FF' : undefined }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: !notif.read ? '#2563EB' : '#D0D5E8' }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium" style={{ color: !notif.read ? '#1F2937' : '#6B7280' }}>{notif.subject}</p>
                                    {notif.text && <p className="text-[10px] line-clamp-1" style={{ color: '#6B7280' }}>{notif.text}</p>}
                                </div>
                                <span className="text-[10px] flex-shrink-0 whitespace-nowrap" style={{ color: '#9CA3AF' }}>{formatTime(notif.timecreated)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Calendar | Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Mini Calendar */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Calendar</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))} className="text-xs px-2 py-1 rounded" style={{ color: '#6B7280', backgroundColor: '#F3F4F6' }}>←</button>
                            <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))} className="text-xs px-2 py-1 rounded" style={{ color: '#6B7280', backgroundColor: '#F3F4F6' }}>→</button>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                        <div className="text-center mb-4">
                            <p className="text-xs font-semibold" style={{ color: '#1F2937' }}>
                                {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-[10px] font-semibold" style={{ color: '#6B7280' }}>{day}</div>
                            ))}
                            {Array.from({ length: getFirstDayOfMonth(calendarDate) }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {Array.from({ length: getDaysInMonth(calendarDate) }).map((_, i) => (
                                <div key={i + 1} className="text-center text-[10px] p-1 rounded" style={{ color: '#6B7280' }}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F2937' }}>Quick Links</h2>
                    <div className="space-y-2">
                        <button onClick={() => navigate('/student/dashboard?layout=1')} className="w-full p-3 rounded-lg text-left text-xs hover:shadow-md transition border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#2563EB' }}>
                            Layout 1
                        </button>
                        <button onClick={() => navigate('/student/dashboard?layout=3')} className="w-full p-3 rounded-lg text-left text-xs hover:shadow-md transition border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#2563EB' }}>
                            Layout 3
                        </button>
                        <button onClick={handleAccessLMS} disabled={ssoLoading} className="w-full p-3 rounded-lg text-center text-xs font-semibold text-white transition" style={{ backgroundColor: '#2563EB' }}>
                            {ssoLoading ? 'Opening...' : 'Open Moodle'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Student Info Footer */}
            {student && (
                <div className="mt-8 pt-6 border-t" style={{ borderColor: '#E5E7EB' }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                            <p style={{ color: '#6B7280' }}>Name</p>
                            <p className="font-semibold" style={{ color: '#1F2937' }}>{student.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ color: '#6B7280' }}>Email</p>
                            <p className="font-semibold" style={{ color: '#1F2937' }}>{student.email || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ color: '#6B7280' }}>Student ID</p>
                            <p className="font-semibold" style={{ color: '#1F2937' }}>{student.id || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ color: '#6B7280' }}>Programme</p>
                            <p className="font-semibold" style={{ color: '#1F2937' }}>{application?.courseTitle || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentPortalDashboard2;
