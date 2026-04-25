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

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Courses Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold" style={{ color: '#1F2937' }}>My Courses</h2>
                            <button onClick={() => navigate('/student/courses')} style={{ color: '#2563EB' }} className="text-sm">
                                View all ΓåÆ
                            </button>
                        </div>
                        <div className="space-y-3">
                            {courses.slice(0, 4).map((course, idx) => (
                                <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="font-medium" style={{ color: '#1F2937' }}>{course.name || `Course ${idx + 1}`}</p>
                                            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{course.credits || '3'} credit hrs</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>
                                            Active
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Announcements Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold" style={{ color: '#1F2937' }}>Announcements</h2>
                            <Bell className="w-5 h-5" style={{ color: '#2563EB' }} />
                        </div>
                        <div className="space-y-3">
                            {notifications.slice(0, 3).map((notif, idx) => (
                                <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                                    <p className="text-sm" style={{ color: '#1F2937' }}>{notif.title || 'Important Update'}</p>
                                    <p className="text-xs mt-2" style={{ color: '#6B7280' }}>Today</p>
                                </div>
                            ))}
                            {notifications.length === 0 && (
                                <p className="text-sm" style={{ color: '#9CA3AF' }}>No announcements</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5" style={{ color: '#2563EB' }} />
                        <h2 className="text-lg font-bold" style={{ color: '#1F2937' }}>Upcoming Events</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Midterm Exam', date: 'Oct 28' },
                            { title: 'Project Deadline', date: 'Nov 5' },
                            { title: 'Fee Payment Due', date: 'Oct 31' },
                            { title: 'Class Resumption', date: 'Nov 10' },
                        ].map((event, idx) => (
                            <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                                <p className="font-medium" style={{ color: '#1F2937' }}>{event.title}</p>
                                <div className="flex items-center gap-2 text-sm mt-2" style={{ color: '#6B7280' }}><Calendar className="w-4 h-4" /> {event.date}</div>
                            </div>
                        ))}
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
