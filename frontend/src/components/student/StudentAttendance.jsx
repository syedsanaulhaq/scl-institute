import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentAttendance = ({ user }) => {
    const [courseGroups, setCourseGroups] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedCourses, setExpandedCourses] = useState({});

    useEffect(() => {
        fetchAttendance();
    }, [user]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            // Get student's applications
            const appsResponse = await axios.get(`${API_URL}/students/my-applications`, {
                params: { email: user.email }
            });
            
            if (appsResponse.data?.success) {
                const apps = appsResponse.data.data?.applications || [];
                if (apps.length > 0) {
                    const studentApp = apps[0];
                    
                    // Fetch attendance data
                    const response = await axios.get(`${API_URL}/students/attendance/${studentApp.id}`);
                    if (response.data?.success) {
                        const groups = response.data.data?.courseGroups || [];
                        setCourseGroups(groups);
                        setSummary(response.data.data?.summary || null);
                        
                        // Auto-expand all courses by default
                        const expanded = {};
                        groups.forEach(group => {
                            expanded[group.courseId] = true;
                        });
                        setExpandedCourses(expanded);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError('Could not load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const toggleCourse = (courseId) => {
        setExpandedCourses(prev => ({
            ...prev,
            [courseId]: !prev[courseId]
        }));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'absent':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'late':
                return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'excused':
                return <AlertTriangle className="w-5 h-5 text-blue-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            present: 'bg-green-100 text-green-800',
            absent: 'bg-red-100 text-red-800',
            late: 'bg-yellow-100 text-yellow-800',
            excused: 'bg-blue-100 text-blue-800'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return <div className="p-8 text-center">Loading attendance data...</div>;
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance Data Not Available</h3>
                    <p className="text-gray-600 mb-4">
                        Attendance is tracked in Moodle. Please check your LMS for attendance records.
                    </p>
                    <button
                        onClick={() => window.open('http://system.sclsandbox.xyz:9090', '_blank')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Open Moodle
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Attendance</h1>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.total || 0}</p>
                            </div>
                            <Calendar className="w-10 h-10 text-gray-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Present</p>
                                <p className="text-2xl font-bold text-green-600">{summary.present || 0}</p>
                            </div>
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Absent</p>
                                <p className="text-2xl font-bold text-red-600">{summary.absent || 0}</p>
                            </div>
                            <XCircle className="w-10 h-10 text-red-400" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                                <p className={`text-2xl font-bold ${summary.rate >= 80 ? 'text-green-600' : summary.rate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {summary.rate || 0}%
                                </p>
                            </div>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${summary.rate >= 80 ? 'bg-green-100' : summary.rate >= 70 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                                <span className={`text-xl font-bold ${summary.rate >= 80 ? 'text-green-600' : summary.rate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {summary.rate}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Records - Grouped by Course */}
            <div className="space-y-6">
                {courseGroups.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No attendance records available yet.</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Attendance is tracked in Moodle and will appear here once recorded.
                        </p>
                    </div>
                ) : (
                    courseGroups.map((courseGroup) => (
                        <div key={courseGroup.courseId} className="bg-white rounded-lg shadow">
                            {/* Course Header */}
                            <div 
                                className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleCourse(courseGroup.courseId)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{courseGroup.courseName}</h2>
                                        <p className="text-sm text-gray-600 mt-1">{courseGroup.courseCode}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Attendance Rate</p>
                                            <p className={`text-2xl font-bold ${
                                                courseGroup.summary.rate >= 80 ? 'text-green-600' : 
                                                courseGroup.summary.rate >= 70 ? 'text-yellow-600' : 
                                                'text-red-600'
                                            }`}>
                                                {courseGroup.summary.rate}%
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">
                                                {courseGroup.records.length} sessions
                                            </span>
                                            <svg 
                                                className={`w-6 h-6 text-gray-400 transition-transform ${expandedCourses[courseGroup.courseId] ? 'rotate-180' : ''}`}
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Course Summary Stats */}
                                <div className="mt-4 flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-gray-600">Present: <span className="font-semibold">{courseGroup.summary.present}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        <span className="text-sm text-gray-600">Absent: <span className="font-semibold">{courseGroup.summary.absent}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-600" />
                                        <span className="text-sm text-gray-600">Late: <span className="font-semibold">{courseGroup.summary.late}</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Course Attendance Table */}
                            {expandedCourses[courseGroup.courseId] && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Session
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Notes
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {courseGroup.records.map((record, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(record.date).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {record.session}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(record.status)}
                                                            {getStatusBadge(record.status)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {record.notes || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Attendance Policy Notice */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Attendance Policy</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Minimum 80% attendance is required for course completion</li>
                    <li>• Late arrivals (more than 15 minutes) are marked as "Late"</li>
                    <li>• Absences must be reported within 48 hours with valid documentation</li>
                    <li>• Contact your programme coordinator if you have concerns about your attendance</li>
                </ul>
            </div>
        </div>
    );
};

export default StudentAttendance;
