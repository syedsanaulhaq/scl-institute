import { useState, useEffect, useMemo } from 'react';
import { FileText, Upload, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { openMoodleSSO } from '../../utils/ssoService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const extractYear = (courseCode) => {
    if (!courseCode) return null;
    const m = courseCode.match(/Y(\d+)/i);
    return m ? `Year ${m[1]}` : null;
};
const extractSemester = (courseCode) => {
    if (!courseCode) return null;
    const m = courseCode.match(/S(\d+)/i);
    return m ? `Semester ${m[1]}` : null;
};

const StudentAssessments = ({ user }) => {
    const [selectedTab, setSelectedTab] = useState('upcoming');
    const [assessments, setAssessments] = useState([]);
    const [submittedAssessments, setSubmittedAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [filterSemester, setFilterSemester] = useState('');

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

    // All assessments combined for filter extraction
    const allItems = useMemo(() => [...assessments, ...submittedAssessments], [assessments, submittedAssessments]);

    const uniqueYears = useMemo(() => {
        const years = new Set();
        allItems.forEach(a => { const y = extractYear(a.courseCode); if (y) years.add(y); });
        return [...years].sort();
    }, [allItems]);

    const uniqueSemesters = useMemo(() => {
        const sems = new Set();
        allItems.forEach(a => {
            if (filterYear && extractYear(a.courseCode) !== filterYear) return;
            const s = extractSemester(a.courseCode);
            if (s) sems.add(s);
        });
        return [...sems].sort();
    }, [allItems, filterYear]);

    const applyFilter = (list) => list.filter(a => {
        if (filterYear && extractYear(a.courseCode) !== filterYear) return false;
        if (filterSemester && extractSemester(a.courseCode) !== filterSemester) return false;
        return true;
    });

    const filteredUpcoming = useMemo(() => applyFilter(assessments), [assessments, filterYear, filterSemester]);
    const filteredSubmitted = useMemo(() => applyFilter(submittedAssessments), [submittedAssessments, filterYear, filterSemester]);

    // Reset semester when year changes
    useEffect(() => { setFilterSemester(''); }, [filterYear]);

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
            await openMoodleSSO(user?.email, {
                redirectTo: moodleUrl || null
            });
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessments & Exams</h1>
            <p className="text-sm text-gray-600 mb-8">View all assessment details, submission areas, and exam schedules across your programme.</p>

            {/* Year / Semester Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                        <select
                            value={filterYear}
                            onChange={e => setFilterYear(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="">All Years</option>
                            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
                        <select
                            value={filterSemester}
                            onChange={e => setFilterSemester(e.target.value)}
                            disabled={!filterYear}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">All Semesters</option>
                            {uniqueSemesters.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
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
                    Upcoming ({filteredUpcoming.length})
                </button>
                <button
                    onClick={() => setSelectedTab('submitted')}
                    className={`pb-4 px-4 font-semibold border-b-2 transition ${
                        selectedTab === 'submitted'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Submitted ({filteredSubmitted.length})
                </button>
            </div>

            {/* Upcoming Assessments */}
            {selectedTab === 'upcoming' && (
                <div className="space-y-4">
                    {filteredUpcoming.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                            <p className="text-gray-600">No upcoming assessments{filterYear ? ' for the selected filter' : ''}</p>
                        </div>
                    ) : (
                        filteredUpcoming.map(assessment => {
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
                                            <p className="text-sm text-gray-600 mb-2">
                                                {assessment.courseCode && <span className="text-purple-600 font-semibold">{assessment.courseCode} - </span>}
                                                {assessment.module} - {assessment.code}
                                            </p>
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
                                                {new Date(assessment.dueDate).toLocaleDateString('en-GB')}
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
                    {filteredSubmitted.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No submitted assessments{filterYear ? ' for the selected filter' : ' yet'}</p>
                        </div>
                    ) : (
                        filteredSubmitted.map(assessment => (
                            <div key={assessment.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <FileText className="w-5 h-5 text-green-500" />
                                            <h3 className="text-lg font-semibold text-gray-900">{assessment.title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {assessment.courseCode && <span className="text-purple-600 font-semibold">{assessment.courseCode} - </span>}
                                            {assessment.module} - {assessment.code}
                                        </p>
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
                                            {new Date(assessment.dueDate).toLocaleDateString('en-GB')}
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

