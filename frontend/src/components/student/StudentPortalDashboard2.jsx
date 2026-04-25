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
    FileText,
    Award,
    HelpCircle,
    DollarSign,
    Bookmark,
} from 'lucide-react';
import axios from 'axios';
import { openMoodleSSO, getMoodleUrl } from '../../utils/ssoService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentPortalDashboard2 = ({ user }) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ssoLoading, setSsoLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('courses');
    const [courseScroll, setCourseScroll] = useState(0);

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
            console.error('Dashboard error:', err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMoodleSSO = async () => {
        try {
            setSsoLoading(true);
            await openMoodleSSO(user.email);
        } catch (err) {
            console.error('SSO error:', err);
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

    const courses = data?.courses || [];
    const student = data?.student || {};
    const notifications = data?.notifications || [];
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
            <div className="px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-1" style={{ color: '#1F2937' }}>
                        Welcome back, {student.firstName || 'Student'}! 👋
                    </h1>
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                        {student.programme || 'Programme'} • Roll No: {student.rollNumber || 'N/A'} • {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </p>
                </div>

                {error && (
                    <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: '#FEE2E2', borderLeft: '4px solid #EF4444' }}>
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 mr-3" style={{ color: '#EF4444' }} />
                            <p style={{ color: '#DC2626' }}>{error}</p>
                        </div>
                    </div>
                )}

                {/* KPI Cards - 4 Columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-5 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                        <p className="text-2xl font-bold" style={{ color: '#1F2937' }}>{data?.summary?.cgpa || '3.72'}</p>
                        <p className="text-xs mt-2" style={{ color: '#6B7280' }}>Current CGPA</p>
                    </div>
                    <div className="p-5 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                        <p className="text-2xl font-bold" style={{ color: '#1F2937' }}>{courses.length || '5'}</p>
                        <p className="text-xs mt-2" style={{ color: '#6B7280' }}>Active Courses</p>
                    </div>
                    <div className="p-5 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                        <p className="text-2xl font-bold" style={{ color: '#1F2937' }}>{data?.summary?.attendance || '91'}%</p>
                        <p className="text-xs mt-2" style={{ color: '#6B7280' }}>Attendance</p>
                    </div>
                    <div className="p-5 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                        <p className="text-2xl font-bold" style={{ color: '#1F2937' }}>PKR 12.5k</p>
                        <p className="text-xs mt-2" style={{ color: '#6B7280' }}>Fee Due</p>
                    </div>
                </div>

                {/* Courses Section - Moodle Style */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-6 h-6" style={{ color: '#2563EB' }} />
                            <h2 className="text-2xl font-bold" style={{ color: '#1F2937' }}>My Courses</h2>
                        </div>
                        <button onClick={() => navigate('/student/courses')} style={{ color: '#2563EB' }} className="text-sm font-medium hover:underline">
                            View all →
                        </button>
                    </div>
                    
                    {/* Horizontal Scrollable Cards */}
                    <div className="relative">
                        <div 
                            className="flex gap-6 pb-4 overflow-x-auto scroll-smooth" 
                            style={{ scrollBehavior: 'smooth', scrollbarWidth: 'thin' }}
                            ref={(el) => { if(el) el.scrollLeft = courseScroll; }}
                        >
                            {courses.length > 0 ? courses.map((course, idx) => (
                                <div key={idx} className="flex-shrink-0 w-72 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border" 
                                    style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
                                    {/* Course Image */}
                                    <div className="h-40 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)` }}>
                                        <div className="h-full flex items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-white opacity-50" />
                                        </div>
                                    </div>
                                    
                                    {/* Course Info */}
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: '#1F2937' }}>
                                            {course.name || `Course ${idx + 1}`}
                                        </h3>
                                        <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                                            {course.description || `${course.credits || 3} credit hours • Active`}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>
                                                Active
                                            </span>
                                            <button className="text-sm font-medium hover:underline" style={{ color: '#2563EB' }}>
                                                Open →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex items-center justify-center w-full h-48 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                                    <p style={{ color: '#9CA3AF' }}>No courses enrolled yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Announcements and Upcoming Events - Two Column */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Announcements Section */}
                    <div className="rounded-lg border p-6" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="w-6 h-6" style={{ color: '#2563EB' }} />
                            <h2 className="text-xl font-bold" style={{ color: '#1F2937' }}>Announcements</h2>
                        </div>
                        
                        <div className="space-y-4">
                            {notifications.slice(0, 5).map((notif, idx) => (
                                <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
                                    <div className="flex gap-3">
                                        <Megaphone className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: '#2563EB' }} />
                                        <div className="flex-1">
                                            <p className="font-medium" style={{ color: '#1F2937' }}>{notif.title || 'Important Update'}</p>
                                            <p className="text-xs mt-2" style={{ color: '#6B7280' }}>{notif.message || 'New announcement'}</p>
                                            <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>Today</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {notifications.length === 0 && (
                                <p className="text-center py-8" style={{ color: '#9CA3AF' }}>No announcements yet</p>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events Section */}
                    <div className="rounded-lg border p-6" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar className="w-6 h-6" style={{ color: '#2563EB' }} />
                            <h2 className="text-xl font-bold" style={{ color: '#1F2937' }}>Upcoming Events</h2>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: 'Midterm Exam', date: 'Oct 28', time: '9:00 AM' },
                                { title: 'Project Deadline', date: 'Nov 5', time: '11:59 PM' },
                                { title: 'Fee Payment Due', date: 'Oct 31', time: '5:00 PM' },
                                { title: 'Class Resumption', date: 'Nov 10', time: '8:00 AM' },
                                { title: 'Semester Break', date: 'Dec 15', time: 'All day' },
                            ].map((event, idx) => (
                                <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                                            <Calendar className="w-5 h-5" style={{ color: '#2563EB' }} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium" style={{ color: '#1F2937' }}>{event.title}</p>
                                            <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{event.date} • {event.time}</p>
                                        </div>
                                        <Bookmark className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: '#D1D5DB' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Open Moodle Section */}
                <div style={{ backgroundColor: '#DBEAFE', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold mb-1" style={{ color: '#1F2937' }}>Access Learning Platform</h3>
                            <p className="text-sm" style={{ color: '#6B7280' }}>Open Moodle to view courses and materials</p>
                        </div>
                        <button
                            onClick={handleMoodleSSO}
                            disabled={ssoLoading}
                            className="px-6 py-2 rounded-lg font-medium transition"
                            style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                        >
                            {ssoLoading ? 'Opening...' : 'Open Moodle'}
                        </button>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h2 className="text-lg font-bold mb-4" style={{ color: '#1F2937' }}>Quick Links</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button onClick={() => navigate('/student/admissions')} className="p-4 rounded-lg text-center border hover:shadow-md transition" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                            <GraduationCap className="w-8 h-8 mx-auto mb-2" style={{ color: '#2563EB' }} />
                            <p className="text-xs font-medium" style={{ color: '#1F2937' }}>Enroll</p>
                        </button>
                        <button onClick={() => navigate('/student/documents')} className="p-4 rounded-lg text-center border hover:shadow-md transition" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                            <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: '#2563EB' }} />
                            <p className="text-xs font-medium" style={{ color: '#1F2937' }}>Documents</p>
                        </button>
                        <button onClick={() => navigate('/student/grades')} className="p-4 rounded-lg text-center border hover:shadow-md transition" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                            <Award className="w-8 h-8 mx-auto mb-2" style={{ color: '#2563EB' }} />
                            <p className="text-xs font-medium" style={{ color: '#1F2937' }}>Grades</p>
                        </button>
                        <button onClick={() => navigate('/student/support')} className="p-4 rounded-lg text-center border hover:shadow-md transition" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                            <HelpCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#2563EB' }} />
                            <p className="text-xs font-medium" style={{ color: '#1F2937' }}>Support</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentPortalDashboard2;
