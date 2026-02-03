import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Award, Target, ExternalLink } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentProgramme = ({ user }) => {
    const [programmeData, setProgrammeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgrammeData();
    }, [user]);

    const fetchProgrammeData = async () => {
        try {
            const response = await axios.get(`${API_URL}/students/applications`);
            if (response.data?.success) {
                const apps = response.data.data?.applications || [];
                const studentApp = apps.find(app => app.email === user.email);
                setProgrammeData(studentApp);
            }
        } catch (error) {
            console.error('Error fetching programme:', error);
        } finally {
            setLoading(false);
        }
    };

    const modules = [
        { code: 'BUS101', name: 'Business Fundamentals', credits: 20, semester: 'Semester 1' },
        { code: 'BUS102', name: 'Marketing Principles', credits: 20, semester: 'Semester 1' },
        { code: 'BUS103', name: 'Financial Accounting', credits: 20, semester: 'Semester 1' },
        { code: 'BUS201', name: 'Strategic Management', credits: 20, semester: 'Semester 2' },
        { code: 'BUS202', name: 'Operations Management', credits: 20, semester: 'Semester 2' },
        { code: 'BUS203', name: 'Business Analytics', credits: 20, semester: 'Semester 2' }
    ];

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Programme</h1>

            {/* Programme Overview */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow p-6 mb-6 text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{programmeData?.programme_title}</h2>
                        <p className="text-blue-100 mb-4">Programme Code: {programmeData?.programme_code}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-blue-200">Programme Type</p>
                                <p className="font-semibold">{programmeData?.programme_type}</p>
                            </div>
                            <div>
                                <p className="text-blue-200">Study Mode</p>
                                <p className="font-semibold">{programmeData?.study_mode}</p>
                            </div>
                            <div>
                                <p className="text-blue-200">Intake Date</p>
                                <p className="font-semibold">{new Date(programmeData?.intake_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-blue-200">Duration</p>
                                <p className="font-semibold">1 Year Full-time</p>
                            </div>
                        </div>
                    </div>
                    <Award className="w-16 h-16 text-blue-200" />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <a href="http://localhost:9090" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <div>
                        <p className="font-semibold text-gray-900">Learning Materials</p>
                        <p className="text-xs text-gray-600">Access course content</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                </a>
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

            {/* Programme Modules */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Programme Modules</h2>
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
