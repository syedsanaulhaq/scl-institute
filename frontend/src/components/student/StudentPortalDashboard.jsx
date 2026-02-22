import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    User, 
    FileText, 
    Calendar, 
    BookOpen,
    Bell,
    AlertCircle,
    CheckCircle,
    Clock,
    MessageSquare,
    GraduationCap
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentPortalDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [ssoLoading, setSsoLoading] = useState(false);
    const [ssoError, setSsoError] = useState('');

    useEffect(() => {
        fetchStudentData();
    }, [user]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            // Fetch student's application data
            const response = await axios.get(`${API_URL}/students/applications`);
            if (response.data?.success) {
                const apps = response.data.data?.applications || [];
                // Find application for current user's email
                const studentApp = apps.find(app => app.email === user.email);
                setStudentData(studentApp);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccessLMS = async () => {
        try {
            setSsoLoading(true);
            setSsoError('');
            const response = await axios.post(`${API_URL}/sso/generate`, {
                email: user.email
            });

            if (response.data?.success && response.data?.redirectUrl) {
                window.open(response.data.redirectUrl, '_blank', 'noopener,noreferrer');
            } else {
                setSsoError('Failed to generate SSO link');
            }
        } catch (err) {
            setSsoError(err.response?.data?.message || 'Failed to access Moodle');
        } finally {
            setSsoLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'submitted': 'bg-blue-100 text-blue-800 border-blue-200',
            'under_review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'accepted': 'bg-green-100 text-green-800 border-green-200',
            'rejected': 'bg-red-100 text-red-800 border-red-200',
            'conditional_accept': 'bg-purple-100 text-purple-800 border-purple-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'submitted':
                return <Clock className="w-5 h-5" />;
            case 'accepted':
                return <CheckCircle className="w-5 h-5" />;
            case 'rejected':
                return <AlertCircle className="w-5 h-5" />;
            case 'under_review':
                return <Clock className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    const quickLinks = [
        { 
            name: 'My Profile', 
            icon: User, 
            path: '/student/profile',
            color: 'bg-blue-500',
            description: 'View and update your personal information'
        },
        { 
            name: 'My Programme', 
            icon: GraduationCap, 
            path: '/student/programme',
            color: 'bg-purple-500',
            description: 'Access your course details and modules'
        },
        { 
            name: 'Learning Materials', 
            icon: BookOpen, 
            color: 'bg-green-500',
            description: 'Access LMS and course resources',
            isSSO: true
        },
        { 
            name: 'Timetable', 
            icon: Calendar, 
            path: '/student/timetable',
            color: 'bg-orange-500',
            description: 'View your class schedule'
        }
    ];

    const upcomingTasks = [
        { title: 'Complete Induction Checklist', dueDate: 'Tomorrow', priority: 'high' },
        { title: 'Submit Passport Copy', dueDate: 'In 3 days', priority: 'high' },
        { title: 'Review Student Handbook', dueDate: 'In 5 days', priority: 'medium' }
    ];

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome, {user?.name || studentData?.first_name || 'Student'}! 👋
                </h1>
                <p className="text-gray-600 mt-2">Here's what's happening with your studies</p>
            </div>

            {/* Application Status Card */}
            {studentData && (
                <div className="mb-6 bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Application Status</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <p className="text-sm text-gray-600">Application Reference</p>
                                    <p className="font-semibold text-gray-900">{studentData.application_reference}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Programme</p>
                                    <p className="font-semibold text-gray-900">{studentData.course_title}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Intake Start Date</p>
                                    <p className="font-semibold text-gray-900">{new Date(studentData.intake_start_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(studentData.application_status)} border`}>
                                        {getStatusIcon(studentData.application_status)}
                                        {studentData.application_status?.replace(/_/g, ' ').toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {quickLinks.map((link, index) => (
                    link.isSSO ? (
                        <button
                            key={index}
                            type="button"
                            onClick={handleAccessLMS}
                            disabled={ssoLoading}
                            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-100 hover:border-blue-200 text-left disabled:opacity-60"
                        >
                            <div className={`${link.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                                <link.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{link.name}</h3>
                            <p className="text-sm text-gray-600">{link.description}</p>
                        </button>
                    ) : (
                        <button
                            key={index}
                            onClick={() => navigate(link.path)}
                            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-100 hover:border-blue-200 text-left cursor-pointer"
                        >
                            <div className={`${link.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                                <link.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{link.name}</h3>
                            <p className="text-sm text-gray-600">{link.description}</p>
                        </button>
                    )
                ))}
            </div>

            {ssoError && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                    {ssoError}
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Tasks */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <h2 className="text-xl font-bold text-gray-900">Tasks & Deadlines</h2>
                    </div>
                    <div className="space-y-3">
                        {upcomingTasks.map((task, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className={`mt-0.5 w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{task.title}</p>
                                    <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Announcements */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="font-medium text-gray-900 mb-1">Welcome to SCL Institute!</p>
                            <p className="text-sm text-gray-600">Please complete your induction checklist and upload required documents.</p>
                            <p className="text-xs text-gray-500 mt-2">Posted: Today</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="font-medium text-gray-900 mb-1">Important: Document Submission</p>
                            <p className="text-sm text-gray-600">Please ensure all required documents are uploaded before your intake start date.</p>
                            <p className="text-xs text-gray-500 mt-2">Posted: Yesterday</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Access LMS Banner */}
            <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Access Your Learning Management System</h3>
                        <p className="text-purple-100">Access course materials, submit assignments, and track your progress</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAccessLMS}
                        disabled={ssoLoading}
                        className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60"
                    >
                        Open LMS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentPortalDashboard;
