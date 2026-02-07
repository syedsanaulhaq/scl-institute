import { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentAssessments = ({ user }) => {
    const [selectedTab, setSelectedTab] = useState('upcoming');
    const [assessments, setAssessments] = useState([]);
    const [submittedAssessments, setSubmittedAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const appsResponse = await axios.get(`${API_URL}/students/applications`);
            if (appsResponse.data?.success) {
                const apps = appsResponse.data.data?.applications || [];
                const studentApp = apps.find(app => app.email === user?.email);
                
                if (studentApp) {
                    // Fetch assessments only
                    const assessResponse = await axios.get(`${API_URL}/students/assessments/${studentApp.id}`);
                    if (assessResponse.data?.success) {
                        const allAssessments = assessResponse.data.data || [];
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const upcoming = allAssessments.filter(a => new Date(a.dueDate) >= today);
                        const submitted = allAssessments.filter(a => new Date(a.dueDate) < today);
                        
                        setAssessments(upcoming);
                        setSubmittedAssessments(submitted);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching assessments:', err);
            setError('Could not load assessments from Moodle');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    <Clock className="w-3 h-3" /> Pending
                </span>;
            case 'submitted':
                return <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> Submitted
                </span>;
            case 'graded':
                return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> Graded
                </span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {status}
                </span>;
        }
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diff = due - today;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const handleViewInMoodle = async (moodleUrl) => {
        try {
            const ssoPayload = { email: user?.email };
            if (moodleUrl) {
                ssoPayload.redirect_to = moodleUrl;
            }
            
            const response = await axios.post(`${API_URL}/sso/generate`, ssoPayload);
            if (response.data?.success && response.data?.redirectUrl) {
                window.open(response.data.redirectUrl, '_blank');
            }
        } catch (err) {
            console.error('SSO Error:', err);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading assessments...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Assessments & Exams</h1>

            {/* LMS Guidance */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Information (LMS)</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            All assessment details, exam schedules, submission areas, and academic integrity guidance are available in Moodle.
                        </p>
                        <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Assessment briefs & requirements</li>
                            <li>Exam timetable (if applicable)</li>
                            <li>Submission area (upload + timestamp + receipts)</li>
                            <li>Academic integrity / misconduct guidance</li>
                        </ul>
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={() => handleViewInMoodle()}
                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                        >
                            Open Moodle (SSO)
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setSelectedTab('upcoming')}
                    className={`pb-4 px-4 font-semibold border-b-2 transition ${
                        selectedTab === 'upcoming'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Upcoming ({assessments.length})
                </button>
                <button
                    onClick={() => setSelectedTab('submitted')}
                    className={`pb-4 px-4 font-semibold border-b-2 transition ${
                        selectedTab === 'submitted'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Submitted ({submittedAssessments.length})
                </button>
            </div>

            {/* Upcoming Assessments */}
            {selectedTab === 'upcoming' && (
                <div className="space-y-4">
                    {assessments.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                            <p className="text-gray-600">No upcoming assessments</p>
                        </div>
                    ) : (
                        assessments.map(assessment => {
                            const daysUntil = getDaysUntilDue(assessment.dueDate);
                            const isUrgent = daysUntil <= 7;

                            return (
                                <div key={assessment.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <FileText className="w-5 h-5 text-blue-500" />
                                                <h3 className="text-lg font-semibold text-gray-900">{assessment.title}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{assessment.module} • {assessment.code}</p>
                                            <p className="text-sm text-gray-600">Type: <span className="font-medium">{assessment.type}</span></p>
                                        </div>
                                        <div className="text-right">
                                            {getStatusBadge(assessment.status)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-200">
                                        <div>
                                            <p className="text-xs text-gray-600">Due Date</p>
                                            <p className={`text-lg font-semibold ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                                                {new Date(assessment.dueDate).toLocaleDateString()}
                                            </p>
                                            <p className={`text-xs ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                                                {daysUntil} days left
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Weight</p>
                                            <p className="text-lg font-semibold text-gray-900">{assessment.weight}</p>
                                        </div>
                                        <div className="text-right">
                                            {assessment.moodle_url && (
                                                <button
                                                    onClick={() => handleViewInMoodle(assessment.moodle_url)}
                                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                                                >
                                                    View in Moodle
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Submitted Assessments */}
            {selectedTab === 'submitted' && (
                <div className="space-y-4">
                    {submittedAssessments.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No submitted assessments yet</p>
                        </div>
                    ) : (
                        submittedAssessments.map(assessment => (
                            <div key={assessment.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <FileText className="w-5 h-5 text-green-500" />
                                            <h3 className="text-lg font-semibold text-gray-900">{assessment.title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{assessment.module} • {assessment.code}</p>
                                        <p className="text-sm text-gray-600">Type: <span className="font-medium">{assessment.type}</span></p>
                                    </div>
                                    <div className="text-right">
                                        {getStatusBadge('submitted')}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                                    <div>
                                        <p className="text-xs text-gray-600">Due Date</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {new Date(assessment.dueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Weight</p>
                                        <p className="text-sm font-semibold text-gray-900">{assessment.weight}</p>
                                    </div>
                                    <div className="text-right">
                                        {assessment.moodle_url && (
                                            <button
                                                onClick={() => handleViewInMoodle(assessment.moodle_url)}
                                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                                            >
                                                View in Moodle
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentAssessments;
