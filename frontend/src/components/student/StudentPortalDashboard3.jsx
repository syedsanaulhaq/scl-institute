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
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Lock,
    TrendingUp,
    Clock,
    FileText,
    Award,
} from 'lucide-react';
import axios from 'axios';
import { openMoodleSSO, getMoodleUrl } from '../../utils/ssoService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentPortalDashboard3 = ({ user }) => {
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
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#2563EB' }} />
            </div>
        );
    }

    const courses = data?.courses?.slice(0, 5) || [];
    const student = data?.student || {};
    const unreadCount = data?.notifications?.filter(n => !n.read).length || 0;

    return (
        <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
            {/* Welcome Section */}
            <div className="px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-1" style={{ color: '#1F2937' }}>
                        Welcome back, {student.firstName || 'Student'} ≡ƒæï
                    </h1>
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                        {student.programme || 'Programme'} ┬╖ Roll No: {student.rollNumber || 'N/A'} ┬╖ {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
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

                {/* KPI Cards - Clean Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {/* CGPA Card */}
                    <div className="p-6 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                                <Award className="w-6 h-6" style={{ color: '#2563EB' }} />
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#D1FAE5', color: '#047857' }}>
                                {data?.summary?.cgpa >= 3.5 ? '+0.04' : '-0.02'}
                            </span>
                        </div>
                        <p className="text-2xl font-bold mb-1" style={{ color: '#1F2937' }}>
                            {data?.summary?.cgpa || '3.72'}
                        </p>
                        <p style={{ color: '#6B7280' }} className="text-sm">Current CGPA</p>
                    </div>

                    {/* Active Courses Card */}
                    <div className="p-6 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                                <BookOpen className="w-6 h-6" style={{ color: '#2563EB' }} />
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}>
                                {courses.length} active
                            </span>
                        </div>
                        <p className="text-2xl font-bold mb-1" style={{ color: '#1F2937' }}>
                            {courses.length || '5'}
                        </p>
                        <p style={{ color: '#6B7280' }} className="text-sm">Active Courses</p>
                    </div>

                    {/* Attendance Card */}
                    <div className="p-6 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                                <CheckCircle className="w-6 h-6" style={{ color: '#2563EB' }} />
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#FED7AA', color: '#92400E' }}>
                                {data?.summary?.attendance || '91'}%
                            </span>
                        </div>
                        <p className="text-2xl font-bold mb-1" style={{ color: '#1F2937' }}>
                            {data?.summary?.attendance || '91'}%
                        </p>
                        <p style={{ color: '#6B7280' }} className="text-sm">Attendance Rate</p>
                    </div>

                    {/* Fee Due Card */}
                    <div className="p-6 rounded-lg border" style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                                <FileText className="w-6 h-6" style={{ color: '#2563EB' }} />
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#FECACA', color: '#DC2626' }}>
                                Due
                            </span>
                        </div>
                        <p className="text-2xl font-bold mb-1" style={{ color: '#1F2937' }}>
                            PKR 12.5k
                        </p>
                        <p style={{ color: '#6B7280' }} className="text-sm">Fee Due (Oct 31)</p>
                    </div>
                </div>

                {/* Main Content - Two Column */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Pending Tasks - Left Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold" style={{ color: '#1F2937' }}>
                                ≡ƒôï Pending Tasks
                            </h2>
                            <button
                                onClick={() => navigate('/student/tasks')}
                                className="text-sm flex items-center gap-1 hover:underline"
                                style={{ color: '#2563EB' }}
                            >
                                View all
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {[
                                { title: 'DB Systems Midterm', date: 'Oct 24', location: 'Hall B2 ┬╖ 9 AM' },
                                { title: 'SE Project Phase 2', date: 'Oct 26', location: 'Online' },
                                { title: 'OS Lab Assignment #4', date: 'Oct 28', location: 'Lab C' },
                                { title: 'Fee Challan Submission', date: 'Oct 31', location: 'Finance Office' },
                            ].map((task, idx) => (
                                <div key={idx} className="p-4 rounded-lg border hover:shadow-md transition" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium" style={{ color: '#1F2937' }}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm mt-1" style={{ color: '#6B7280' }}>
                                                <Calendar className="w-4 h-4" />
                                                {task.date}
                                                <span>•</span>
                                                {task.location}
                                            </div>
                                        </div>
                                        <Clock className="w-4 h-4" style={{ color: '#D1D5DB' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Last Semester Results - Right Column */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold" style={{ color: '#1F2937' }}>
                                ≡ƒôè Last Results
                            </h2>
                            <button
                                onClick={() => navigate('/student/grades')}
                                className="text-sm flex items-center gap-1 hover:underline"
                                style={{ color: '#2563EB' }}
                            >
                                Full report
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {[
                                { course: 'Algorithms & Complexity', grade: 'A' },
                                { course: 'Data Structures', grade: 'A' },
                                { course: 'Digital Logic Design', grade: 'A-' },
                                { course: 'Probability & Stats', grade: 'B+' },
                                { course: 'Technical Communication', grade: 'B' },
                            ].map((result, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                                    <span className="text-sm" style={{ color: '#6B7280' }}>
                                        {result.course}
                                    </span>
                                    <span
                                        className="font-bold text-sm px-2 py-1 rounded"
                                        style={{
                                            backgroundColor: '#DBEAFE',
                                            color: '#2563EB'
                                        }}
                                    >
                                        {result.grade}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-lg font-bold mb-4" style={{ color: '#1F2937' }}>
                        ΓÜí Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/student/admissions')}
                            className="p-4 rounded-lg border text-center hover:shadow-md transition"
                            style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
                        >
                            <div className="text-2xl mb-2">≡ƒô¥</div>
                            <p className="text-sm font-medium" style={{ color: '#1F2937' }}>
                                Enroll Courses
                            </p>
                        </button>

                        <button
                            onClick={() => navigate('/student/documents')}
                            className="p-4 rounded-lg border text-center hover:shadow-md transition"
                            style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
                        >
                            <div className="text-2xl mb-2">≡ƒôä</div>
                            <p className="text-sm font-medium" style={{ color: '#1F2937' }}>
                                Download Transcript
                            </p>
                        </button>

                        <button
                            onClick={() => navigate('/student/support')}
                            className="p-4 rounded-lg border text-center hover:shadow-md transition"
                            style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
                        >
                            <div className="text-2xl mb-2">≡ƒÅª</div>
                            <p className="text-sm font-medium" style={{ color: '#1F2937' }}>
                                Pay Fee Online
                            </p>
                        </button>

                        <button
                            onClick={() => navigate('/student/programme')}
                            className="p-4 rounded-lg border text-center hover:shadow-md transition"
                            style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
                        >
                            <div className="text-2xl mb-2">≡ƒÄô</div>
                            <p className="text-sm font-medium" style={{ color: '#1F2937' }}>
                                Degree Audit
                            </p>
                        </button>
                    </div>
                </div>

                {/* Open Moodle Button */}
                <div className="mt-10 pt-8 border-t" style={{ borderColor: '#E5E7EB' }}>
                    <button
                        onClick={handleMoodleSSO}
                        disabled={ssoLoading}
                        className="w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
                    >
                        {ssoLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Opening Moodle...
                            </>
                        ) : (
                            <>
                                <GraduationCap className="w-4 h-4" />
                                Open Moodle Learning Platform
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentPortalDashboard3;
