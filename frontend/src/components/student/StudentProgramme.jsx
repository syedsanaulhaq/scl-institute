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
    const [expandedSections, setExpandedSections] = useState({});
    const outcomesRef = React.useRef(null);

    const toggleSection = (index) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

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
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow p-6 mb-8 text-white">
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

            {ssoError && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                    {ssoError}
                </div>
            )}

            {/* Programme Modules - Moodle Style */}
            {courseModules.length > 0 && (
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900">Sections</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {courseModules.map((module, index) => (
                            <div key={index} className="border-b border-gray-100">
                                <button
                                    onClick={() => toggleSection(index)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-gray-600 transition-transform ${expandedSections[index] ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                        <h3 className="text-base font-medium text-gray-900">{module.name}</h3>
                                    </div>
                                </button>
                                {expandedSections[index] && module.modules?.length > 0 && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <ul className="space-y-3">
                                            {module.modules.map((activity, actIndex) => (
                                                <li key={actIndex} className="flex items-center gap-3 text-sm text-gray-700">
                                                    <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                    <span>{activity.title || activity.name || 'Activity'}</span>
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

            {/* Simple Access LMS Button */}
            <div className="flex gap-3 mb-8">
                <button
                    onClick={handleAccessLMS}
                    disabled={ssoLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                    {ssoLoading ? 'Connecting...' : 'Open in Moodle'}
                </button>
                <button 
                    type="button"
                    onClick={scrollToOutcomes}
                    className="px-4 py-2 bg-gray-200 text-gray-900 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                    Learning Outcomes
                </button>
            </div>

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
