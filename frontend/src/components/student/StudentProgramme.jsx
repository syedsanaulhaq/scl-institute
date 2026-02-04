import React, { useState, useEffect } from 'react';
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
    const outcomesRef = React.useRef(null);

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
                    // Then fetch the programme details
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

    const scrollToOutcomes = () => {
        outcomesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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
                <button 
                    type="button"
                    onClick={() => alert('Timetable feature coming soon. Check your course schedule in Moodle.')}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                    <Calendar className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                        <p className="font-semibold text-gray-900">Timetable</p>
                        <p className="text-xs text-gray-600">View class schedule</p>
                    </div>
                </button>
                <button 
                    type="button"
                    onClick={scrollToOutcomes}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
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

            {/* Programme Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Programme</p>
                            <p className="font-semibold text-gray-900">{programmeData?.title || programmeData?.course_title}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Award className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Type</p>
                            <p className="font-semibold text-gray-900">{programmeData?.type || 'Bachelor Degree'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Study Mode</p>
                            <p className="font-semibold text-gray-900">{programmeData?.studyMode || 'Full-time'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Access LMS Button */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-3">Access Your Course</h2>
                <p className="text-blue-100 mb-6">View course materials, assignments, and collaborate with peers</p>
                <button
                    onClick={handleAccessLMS}
                    disabled={ssoLoading}
                    className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                    <ExternalLink className="w-5 h-5" />
                    {ssoLoading ? 'Connecting...' : 'Open Learning Management System'}
                </button>
            </div>

            {/* Programme Modules */}
            {courseModules.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Programme Sections</h2>
                    <div className="space-y-6">
                        {courseModules.map((module, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Section Header */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <BookOpen className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{module.name}</p>
                                            <p className="text-sm text-gray-600">{module.credits} Credits</p>
                                            {module.modules?.length > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {module.modules.length} activities
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

                                {/* Section Activities/Content */}
                                {module.modules?.length > 0 && (
                                    <div className="bg-white border-t border-gray-200 p-4">
                                        <p className="text-sm font-semibold text-gray-700 mb-3">Course Content:</p>
                                        <ul className="space-y-2 list-disc list-inside">
                                            {module.modules.map((activity, actIndex) => (
                                                <li key={actIndex} className="text-gray-800">
                                                    <span className="font-medium">{activity.title || activity.name || 'Activity'}</span>
                                                    {activity.type && (
                                                        <span className="text-xs text-gray-600 ml-2">({activity.type})</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Learning Outcomes */}
            {learningOutcomes.length > 0 && (
                <div ref={outcomesRef} className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Outcomes</h2>
                    <div className="space-y-3">
                        {learningOutcomes.map((outcome, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <Target className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-900">{outcome}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProgramme;
