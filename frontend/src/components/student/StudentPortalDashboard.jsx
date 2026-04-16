import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Bell,
    CheckCircle,
    Clock,
    MessageSquare,
    GraduationCap,
    TrendingUp,
    Calendar,
    User,
    ExternalLink,
    BarChart3,
    Loader2,
    AlertCircle,
    Megaphone,
    FileText,
    Award
} from 'lucide-react';
import axios from 'axios';
import { openMoodleSSO } from '../../utils/ssoService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentPortalDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ssoLoading, setSsoLoading] = useState(false);
    const [ssoError, setSsoError] = useState('');
    const [activeTab, setActiveTab] = useState('courses');

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
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
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

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-6">

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 md:p-8 text-white shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Welcome back, {student?.name?.split(' ')[0] || 'Student'}!
                        </h1>
                        <p className="text-indigo-200 mt-1 text-sm md:text-base">
                            {application?.courseTitle || 'Your learning journey continues'}
                        </p>
                        {application && (
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                    application.status === 'accepted' ? 'bg-green-500/20 text-green-100 border-green-400/30' : 'bg-white/20 text-white border-white/30'
                                }`}>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    {application.status?.replace(/_/g, ' ').toUpperCase()}
                                </span>
                                {application.modeOfStudy && (
                                    <span className="text-xs text-indigo-200">{application.modeOfStudy}</span>
                                )}
                                {application.reference && (
                                    <span className="text-xs text-indigo-300">Ref: {application.reference}</span>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleAccessLMS}
                        disabled={ssoLoading}
                        className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur text-white px-5 py-3 rounded-xl font-medium transition-all border border-white/20 disabled:opacity-50 self-start md:self-auto"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {ssoLoading ? 'Opening...' : 'Open Moodle LMS'}
                    </button>
                </div>
                {ssoError && <p className="mt-2 text-xs text-red-200 bg-red-500/20 rounded px-3 py-1">{ssoError}</p>}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard icon={BookOpen} label="Enrolled Courses" value={summary?.totalCourses || 0} color="indigo" />
                <StatCard icon={TrendingUp} label="In Progress" value={summary?.inProgressCourses || 0} color="blue" />
                <StatCard icon={CheckCircle} label="Completed" value={summary?.completedCourses || 0} color="green" />
                <StatCard icon={BarChart3} label="Avg. Progress" value={`${summary?.averageProgress || 0}%`} color="purple" />
            </div>

            {/* Quick Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                    { icon: User, label: 'My Profile', path: '/student/profile', color: 'bg-blue-500' },
                    { icon: GraduationCap, label: 'Programme', path: '/student/programme', color: 'bg-purple-500' },
                    { icon: Calendar, label: 'Timetable', path: '/student/timetable', color: 'bg-orange-500' },
                    { icon: FileText, label: 'Assessments', path: '/student/assessments', color: 'bg-teal-500' },
                    { icon: Award, label: 'Grades', path: '/student/grades', color: 'bg-emerald-500' },
                    { icon: MessageSquare, label: 'Messages', path: '/student/messages', color: 'bg-pink-500',
                      badge: unreadMessages > 0 ? unreadMessages : null },
                ].map((item, i) => (
                    <button
                        key={i}
                        onClick={() => navigate(item.path)}
                        className="relative bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
                    >
                        <div className={`${item.color} w-9 h-9 rounded-lg flex items-center justify-center mb-2`}>
                            <item.icon className="w-4.5 h-4.5 text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">{item.label}</p>
                        {item.badge && (
                            <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 overflow-x-auto">
                    <div className="flex">
                        {[
                            { key: 'courses', label: 'My Courses', icon: BookOpen, count: courses?.length },
                            { key: 'notifications', label: 'Notifications', icon: Bell, count: notifications?.filter(n => !n.read).length },
                            { key: 'events', label: 'Upcoming', icon: Calendar, count: upcomingEvents?.length },
                            { key: 'announcements', label: 'Announcements', icon: Megaphone, count: announcements?.length },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                    activeTab === tab.key
                                        ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                        activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                                    }`}>{tab.count}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-5">
                    {activeTab === 'courses' && <CoursesTab courses={courses} />}
                    {activeTab === 'notifications' && <NotificationsTab notifications={notifications} formatTime={formatTime} />}
                    {activeTab === 'events' && <EventsTab events={upcomingEvents} formatDate={formatDate} />}
                    {activeTab === 'announcements' && <AnnouncementsTab announcements={announcements} formatTime={formatTime} />}
                </div>
            </div>

            {/* Student Info Footer */}
            {(student || application) && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
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

const StatCard = ({ icon: Icon, label, value, color }) => {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
    };
    return (
        <div className={`rounded-xl border p-4 ${colors[color] || colors.indigo}`}>
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 opacity-70" />
                <span className="text-xs font-medium opacity-80">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800 truncate">{value}</p>
    </div>
);

const CoursesTab = ({ courses }) => {
    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No courses enrolled yet</p>
                <p className="text-sm mt-1">Your enrolled courses will appear here</p>
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            {courses.map((course) => {
                const progress = course.progress ?? 0;
                const isComplete = course.completed;
                return (
                    <div
                        key={course.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isComplete ? 'bg-green-100' : progress > 0 ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                            {isComplete ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                                <BookOpen className={`w-6 h-6 ${progress > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate group-hover:text-indigo-700">{course.fullname}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                {course.shortname && <span>{course.shortname}</span>}
                                {course.lastaccess && <span>Last accessed: {new Date(course.lastaccess).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                                {course.grade && course.grade !== '-' && <span className="text-green-600 font-medium">Grade: {course.grade}</span>}
                            </div>
                            {course.totalActivities > 0 && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 w-10 text-right">{progress}%</span>
                                </div>
                            )}
                            {course.totalActivities === 0 && (
                                <p className="text-xs text-gray-400 mt-1">No tracked activities</p>
                            )}
                        </div>
                        <div className="flex-shrink-0 text-xs text-gray-400">
                            <span className="hidden md:inline">{course.completedActivities}/{course.totalActivities} activities</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const NotificationsTab = ({ notifications, formatTime }) => {
    if (!notifications || notifications.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No notifications</p>
                <p className="text-sm mt-1">You are all caught up!</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {notifications.map(notif => (
                <div key={notif.id} className={`py-3 px-2 flex gap-3 ${!notif.read ? 'bg-blue-50/50' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{notif.subject}</p>
                        {notif.text && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.text}</p>}
                    </div>
                    <span className="text-[11px] text-gray-400 flex-shrink-0 whitespace-nowrap">{formatTime(notif.timecreated)}</span>
                </div>
            ))}
        </div>
    );
};

const EventsTab = ({ events, formatDate }) => {
    if (!events || events.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No upcoming events</p>
                <p className="text-sm mt-1">Your calendar is clear</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {events.map(event => (
                <div key={event.id} className="py-3 px-2 flex items-start gap-3">
                    <div className="bg-indigo-100 text-indigo-700 rounded-lg px-2.5 py-1 text-center flex-shrink-0 min-w-[52px]">
                        <p className="text-lg font-bold leading-tight">
                            {event.timestart ? new Date(event.timestart).getDate() : '-'}
                        </p>
                        <p className="text-[10px] uppercase font-medium">
                            {event.timestart ? new Date(event.timestart).toLocaleDateString('en-GB', { month: 'short' }) : ''}
                        </p>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{event.name}</p>
                        {event.coursename && <p className="text-xs text-gray-500 mt-0.5">{event.coursename}</p>}
                        {event.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{event.description}</p>}
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex-shrink-0">{event.eventtype}</span>
                </div>
            ))}
        </div>
    );
};

const AnnouncementsTab = ({ announcements, formatTime }) => {
    if (!announcements || announcements.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <Megaphone className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No announcements</p>
                <p className="text-sm mt-1">Check back later for updates</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {announcements.map(ann => (
                <div key={ann.id} className="py-3 px-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                        <p className="text-sm font-semibold text-gray-900">{ann.subject}</p>
                    </div>
                    {ann.message && <p className="text-xs text-gray-600 line-clamp-2 ml-5">{ann.message}</p>}
                    <div className="flex items-center gap-3 mt-1 ml-5">
                        <span className="text-[11px] text-gray-400">{ann.coursename}</span>
                        <span className="text-[11px] text-gray-400">by {ann.userfullname}</span>
                        <span className="text-[11px] text-gray-400">{formatTime(ann.timemodified)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StudentPortalDashboard;
