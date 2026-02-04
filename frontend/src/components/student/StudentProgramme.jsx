import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Award, Target, ExternalLink } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentProgramme = ({ user }) => {
    const [programmeData, setProgrammeData] = useState(null);
    const [courseModules, setCourseModules] = useState([]);
    const [learningOutcomes, setLearningOutcomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ssoLoading, setSsoLoading] = useState(false);
    const [ssoError, setSsoError] = useState('');

    useEffect(() => {
        fetchProgrammeData();
    }, [user]);

    const fetchProgrammeData = async () => {
        try {
            setLoading(true);
            // First get student's application to find their course
            const appsResponse = await axios.get(`${API_URL}/students/applications`);
            if (appsResponse.data?.success) {
                const apps = appsResponse.data.data?.applications || [];
                const studentApp = apps.find(app => app.email === user.email);
                
                if (studentApp) {
                    // Then fetch the programme details (which will try to get from Moodle)
                    const progResponse = await axios.get(`${API_URL}/students/programme/${studentApp.id}`);
                    if (progResponse.data?.success) {
                        const { programme, modules, outcomes } = progResponse.data.data;
                        setProgrammeData({
                            ...studentApp,
                            ...programme
                        });
                        setCourseModules(modules || []);
                        setLearningOutcomes(outcomes || []);
                    }
                } else {
                    setError('No application found');
                }
            }
        } catch (err) {
            console.error('Error fetching programme:', err);
            setError('Failed to load programme details');
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

    const modules = courseModules.length > 0 ? courseModules : [
        { code: 'MOD101', name: 'Module 1', credits: 20, semester: 'Semester 1' },
        { code: 'MOD102', name: 'Module 2', credits: 20, semester: 'Semester 1' },
        { code: 'MOD103', name: 'Module 3', credits: 20, semester: 'Semester 1' },
        { code: 'MOD201', name: 'Module 4', credits: 20, semester: 'Semester 2' },
        { code: 'MOD202', name: 'Module 5', credits: 20, semester: 'Semester 2' },
        { code: 'MOD203', name: 'Module 6', credits: 20, semester: 'Semester 2' }
    ];

    const totalActivities = courseModules.reduce(
        (sum, module) => sum + (module.modules?.length || 0),
        0
    );

    const showMoodleContent = courseModules.length > 0;

    if (loading) {
        return <div className="p-8 text-center">Loading programme details...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Programme</h1>

            {/* Programme Overview */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow p-6 mb-6 text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{programmeData?.title || programmeData?.course_title || 'Programme Title'}</h2>
                        <p className="text-blue-100 mb-4">Programme Code: {programmeData?.code || programmeData?.course_code || 'N/A'}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-blue-200">Programme Type</p>
                                <p className="font-semibold">{programmeData?.type || 'Bachelor Degree'}</p>
                            </div>
                            <div>
                                <p className="text-blue-200">Study Mode</p>
                                <p className="font-semibold">{programmeData?.studyMode || 'Full-time'}</p>
                            </div>
                            <div>
                                <p className="text-blue-200">Start Date</p>
                                <p className="font-semibold">
                                    {programmeData?.startDate ? new Date(programmeData.startDate).toLocaleDateString() : 'TBD'}
                                </p>
                            </div>
                            <div>
                                <p className="text-blue-200">Duration</p>
                                <p className="font-semibold">{programmeData?.duration || '1 Year Full-time'}</p>
                            </div>
                        </div>
                    </div>
                    <Award className="w-16 h-16 text-blue-200" />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                    type="button"
                    onClick={handleAccessLMS}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-60"
                    disabled={ssoLoading}
                >
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <div>
                        <p className="font-semibold text-gray-900">Open Moodle (SSO)</p>
                        <p className="text-xs text-gray-600">Live course content & activities</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
                <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <Calendar className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                        <p className="font-semibold text-gray-900">Timetable</p>
                        <p className="text-xs text-gray-600">View class schedule</p>
                    </div>
                </button>
                <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <Target className="w-8 h-8 text-purple-600" />
                    <div className="text-left">
                        <p className="font-semibold text-gray-900">Learning Outcomes</p>
                        <p className="text-xs text-gray-600">Programme objectives</p>
                    </div>
                </button>
            </div>

            {ssoError && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                    {ssoError}
                </div>
            )}

            {/* Moodle Course Snapshot */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Moodle Course Snapshot</h2>
                    <button
                        type="button"
                        onClick={handleAccessLMS}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                    >
                        Open in Moodle <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-700">Sections</p>
                        <p className="text-2xl font-bold text-blue-900">{courseModules.length || 0}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm text-green-700">Activities</p>
                        <p className="text-2xl font-bold text-green-900">{totalActivities}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-sm text-purple-700">Status</p>
                        <p className="text-2xl font-bold text-purple-900">
                            {showMoodleContent ? 'Live' : 'Pending'}
                        </p>
                    </div>
                </div>
                {!showMoodleContent && (
                    <p className="mt-4 text-sm text-gray-600">
                        Moodle content is not available yet. Open Moodle to view the live course content.
                    </p>
                )}
            </div>

            {/* Programme Modules */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Programme Modules</h2>
                    <span className="text-xs text-gray-500">
                        {showMoodleContent ? 'From Moodle' : 'Default list'}
                    </span>
                </div>
                <div className="space-y-3">
                    {modules.map((module, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:border-blue-300 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{module.name}</p>
                                    <p className="text-sm text-gray-600">{module.code} • {module.credits} Credits</p>
                                    {module.modules?.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {module.modules.length} activities in Moodle
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {module.semester}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Learning Outcomes */}
            {learningOutcomes.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Outcomes</h2>
                    <div className="space-y-3">
                        {learningOutcomes.map((outcome, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                                <Target className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-900">{outcome}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Programme Handbook */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Programme Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-gray-900">Programme Handbook</span>
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-gray-900">Module Descriptors</span>
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-gray-900">Assessment Calendar</span>
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-gray-900">Academic Regulations</span>
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentProgramme;
