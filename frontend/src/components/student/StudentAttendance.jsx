import { useState, useEffect } from 'react';
import { Check, X, Clock, FileText, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentAttendance = ({ user }) => {
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        fetchAttendanceData();
    }, [user]);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get student ID from user email
            const appResponse = await axios.get(`${API_URL}/students/applications`);
            
            if (appResponse.data?.success) {
                const apps = appResponse.data.data?.applications || [];
                const studentApp = apps.find(app => app.email === user?.email);
                
                if (studentApp) {
                    // Fetch attendance data for this student
                    const attResponse = await axios.get(
                        `${API_URL}/students/attendance/${studentApp.id}`
                    );
                    
                    if (attResponse.data?.success) {
                        const courseGroups = attResponse.data.data?.courseGroups || [];
                        setAttendanceData({
                            courseGroups,
                            summary: attResponse.data.data?.summary
                        });
                        
                        // Select first course by default
                        if (courseGroups.length > 0) {
                            setSelectedCourse(courseGroups[0]);
                        }
                    }
                } else {
                    setError('Student information not found');
                }
            }
        } catch (err) {
            console.error('Error fetching attendance data:', err);
            setError('Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-UK', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <Check className="w-4 h-4 text-green-600" />;
            case 'absent':
                return <X className="w-4 h-4 text-red-600" />;
            case 'late':
                return <Clock className="w-4 h-4 text-amber-600" />;
            case 'excused':
                return <FileText className="w-4 h-4 text-blue-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present':
                return 'bg-green-50 text-green-800 border-green-200';
            case 'absent':
                return 'bg-red-50 text-red-800 border-red-200';
            case 'late':
                return 'bg-amber-50 text-amber-800 border-amber-200';
            case 'excused':
                return 'bg-blue-50 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-50 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-600">Loading attendance records...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
                <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="text-red-800 font-semibold">Error</h3>
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const courses = attendanceData?.courseGroups || [];

    if (courses.length === 0) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-6">
                <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="text-blue-800 font-semibold mb-2">No Attendance Records</h3>
                        <p className="text-blue-600">
                            You don't have any enrolled courses with attendance records yet. Once courses are added, 
                            attendance will appear here.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Records</h1>
                <p className="text-gray-600">
                    View your attendance records across all enrolled courses
                </p>
            </div>

            {/* Course Selection and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* Course List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                            <h2 className="text-white font-semibold">Courses</h2>
                        </div>
                        <div className="divide-y">
                            {courses.map((course, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedCourse(course)}
                                    className={`w-full text-left px-4 py-3 transition-colors ${
                                        selectedCourse?.courseId === course.courseId
                                            ? 'bg-blue-50 border-l-4 border-blue-600'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="font-semibold text-sm text-gray-900">
                                        {course.courseCode}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        {course.courseName}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Course Summary */}
                {selectedCourse && (
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                {selectedCourse.courseCode} - {selectedCourse.courseName}
                            </h3>
                            
                            {selectedCourse.summary ? (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <div className="text-2xl font-bold text-green-600">
                                            {selectedCourse.summary.presentCount}
                                        </div>
                                        <div className="text-sm text-green-700 mt-1">Present</div>
                                    </div>
                                    
                                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                        <div className="text-2xl font-bold text-red-600">
                                            {selectedCourse.summary.absentCount}
                                        </div>
                                        <div className="text-sm text-red-700 mt-1">Absent</div>
                                    </div>
                                    
                                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                        <div className="text-2xl font-bold text-amber-600">
                                            {selectedCourse.summary.lateCount}
                                        </div>
                                        <div className="text-sm text-amber-700 mt-1">Late</div>
                                    </div>
                                    
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {selectedCourse.summary.excusedCount}
                                        </div>
                                        <div className="text-sm text-blue-700 mt-1">Excused</div>
                                    </div>
                                    
                                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {selectedCourse.summary.attendanceRate}%
                                        </div>
                                        <div className="text-sm text-purple-700 mt-1">Rate</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-600">No attendance summary available</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Attendance Details */}
            {selectedCourse && selectedCourse.records.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                        <h3 className="text-white font-semibold">
                            Attendance Sessions ({selectedCourse.records.length})
                        </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Session</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {selectedCourse.records.map((record, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                            {formatDate(record.date)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {record.session}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(record.status)}`}>
                                                {getStatusIcon(record.status)}
                                                {getStatusText(record.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {record.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedCourse && selectedCourse.records.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-blue-800 font-semibold mb-2">No Sessions Yet</h3>
                            <p className="text-blue-600">
                                No attendance sessions have been recorded for this course yet.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentAttendance;
