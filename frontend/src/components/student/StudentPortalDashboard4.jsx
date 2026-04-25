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
    FileText,
    Award,
    Clock,
    TrendingUp,
} from 'lucide-react';
import axios from 'axios';
import { openMoodleSSO } from '../../utils/ssoService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentPortalDashboard4 = ({ user }) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ssoLoading, setSsoLoading] = useState(false);

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
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const courses = data?.courses?.slice(0, 5) || [];
    const student = data?.student || {};

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

    const quickLinks = [
        { 
            name: 'My Profile', 
            icon: User, 
            path: '/student/profile',
            color: 'bg-blue-500 hover:bg-blue-600',
            description: 'View your personal information'
        },
        { 
            name: 'My Programme', 
            icon: GraduationCap, 
            path: '/student/programme',
            color: 'bg-purple-500 hover:bg-purple-600',
            description: 'Access your courses'
        },
        { 
            name: 'Admissions', 
            icon: FileText, 
            path: '/student/admissions',
            color: 'bg-green-500 hover:bg-green-600',
            description: 'Enrollment details'
        },
        { 
            name: 'Materials', 
            icon: BookOpen, 
            path: '/student/materials',
            color: 'bg-orange-500 hover:bg-orange-600',
            description: 'Learning materials'
        },
        { 
            name: 'Support', 
            icon: Bell, 
            path: '/student/support',
            color: 'bg-pink-500 hover:bg-pink-600',
            description: 'Get support'
        },
        { 
            name: 'Grades', 
            icon: Award, 
            path: '/student/grades',
            color: 'bg-red-500 hover:bg-red-600',
            description: 'View grades'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-8 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome back, {student.firstName || 'Student'} 👋
                    </h1>
                    <p className="text-blue-100">
                        {student.programme || 'Programme'} · Roll No: {student.rollNumber || 'N/A'} · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {error && (
                    <div className="p-4 rounded-lg mb-6 bg-red-50 border border-red-200">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 mr-3 text-red-600" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* KPI Cards - Colorful */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {/* CGPA Card - Blue */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-300 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full bg-blue-200 text-blue-800 font-semibold">↑ +0.04</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-900 mb-1">{data?.summary?.cgpa || '3.72'}</p>
                        <p className="text-sm text-blue-700">Current CGPA</p>
                    </div>

                    {/* Courses Card - Purple */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-2 border-purple-300 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full bg-purple-200 text-purple-800 font-semibold">Active</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-900 mb-1">{courses.length || '5'}</p>
                        <p className="text-sm text-purple-700">Active Courses</p>
                    </div>

                    {/* Attendance Card - Green */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-300 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full bg-green-200 text-green-800 font-semibold">{data?.summary?.attendance || '91'}%</span>
                        </div>
                        <p className="text-3xl font-bold text-green-900 mb-1">{data?.summary?.attendance || '91'}%</p>
                        <p className="text-sm text-green-700">Attendance Rate</p>
                    </div>

                    {/* Fee Due Card - Red */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border-2 border-red-300 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full bg-red-200 text-red-800 font-semibold">Due</span>
                        </div>
                        <p className="text-3xl font-bold text-red-900 mb-1">PKR 12.5k</p>
                        <p className="text-sm text-red-700">Fee Due (Oct 31)</p>
                    </div>
                </div>

                {/* Quick Links - Colorful Grid */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Links</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {quickLinks.map((link, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(link.path)}
                                className={`${link.color} text-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105`}
                            >
                                <link.icon className="w-8 h-8 mx-auto mb-3" />
                                <p className="font-semibold text-sm">{link.name}</p>
                                <p className="text-xs opacity-90 mt-1">{link.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tasks & Results Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Pending Tasks - Left */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">📋 Pending Tasks</h2>
                        <div className="space-y-3">
                            {[
                                { title: 'DB Systems Midterm', date: 'Oct 24', location: 'Hall B2 · 9 AM', color: 'border-l-4 border-blue-500 bg-blue-50' },
                                { title: 'SE Project Phase 2', date: 'Oct 26', location: 'Online', color: 'border-l-4 border-purple-500 bg-purple-50' },
                                { title: 'OS Lab Assignment #4', date: 'Oct 28', location: 'Lab C', color: 'border-l-4 border-green-500 bg-green-50' },
                                { title: 'Fee Challan Submission', date: 'Oct 31', location: 'Finance Office', color: 'border-l-4 border-red-500 bg-red-50' },
                            ].map((task, idx) => (
                                <div key={idx} className={`p-4 rounded-lg ${task.color} shadow-sm`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-800">{task.title}</p>
                                            <p className="text-sm text-gray-600 mt-1">📅 {task.date} · {task.location}</p>
                                        </div>
                                        <Clock className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Last Results - Right */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-6">📊 Last Results</h2>
                        <div className="space-y-2">
                            {[
                                { course: 'Algorithms & Complexity', grade: 'A', color: 'bg-green-100 text-green-800' },
                                { course: 'Data Structures', grade: 'A', color: 'bg-green-100 text-green-800' },
                                { course: 'Digital Logic Design', grade: 'A-', color: 'bg-green-100 text-green-800' },
                                { course: 'Probability & Stats', grade: 'B+', color: 'bg-yellow-100 text-yellow-800' },
                                { course: 'Technical Communication', grade: 'B', color: 'bg-yellow-100 text-yellow-800' },
                            ].map((result, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                                    <span className="text-sm text-gray-700">{result.course}</span>
                                    <span className={`font-bold text-sm px-3 py-1 rounded-full ${result.color}`}>
                                        {result.grade}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Moodle Access - Gradient Banner */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white rounded-lg shadow-lg p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Open Moodle Learning Platform</h3>
                            <p className="text-blue-100">Access your courses, materials, and interactive content</p>
                        </div>
                        <button
                            onClick={handleMoodleSSO}
                            disabled={ssoLoading}
                            className="px-8 py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-50 transition shadow-md flex items-center gap-2"
                        >
                            {ssoLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Opening...
                                </>
                            ) : (
                                <>
                                    <GraduationCap className="w-4 h-4" />
                                    Open Now
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Announcements/Events */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">📢 Announcements & Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Semester Ends', date: 'Oct 30', icon: '🎓', color: 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300' },
                            { title: 'Final Exams Begin', date: 'Nov 5', icon: '📝', color: 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300' },
                            { title: 'Fee Payment Due', date: 'Oct 31', icon: '💳', color: 'bg-gradient-to-br from-red-100 to-red-200 border-red-300' },
                            { title: 'Winter Holidays', date: 'Dec 15', icon: '❄️', color: 'bg-gradient-to-br from-cyan-100 to-cyan-200 border-cyan-300' },
                        ].map((event, idx) => (
                            <div key={idx} className={`p-5 rounded-lg border-2 ${event.color} shadow-md`}>
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">{event.icon}</div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{event.title}</p>
                                        <p className="text-sm text-gray-600">📅 {event.date}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentPortalDashboard4;
