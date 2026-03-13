import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { openMoodleSSO } from '../../utils/ssoService';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentGrades = ({ user }) => {
    const [grades, setGrades] = useState([]);
    const [courseSummary, setCourseSummary] = useState(null);
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
                    // Fetch grades
                    const gradesResponse = await axios.get(`${API_URL}/students/grades/${studentApp.id}`);
                    if (gradesResponse.data?.success) {
                        const gradePayload = gradesResponse.data.data || {};
                        setGrades(gradePayload.grades || []);
                        setCourseSummary(gradePayload.courseSummary || null);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching grades:', err);
            setError('Could not load grades from Moodle');
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (percentage) => {
        if (percentage >= 70) return 'text-green-600';
        if (percentage >= 60) return 'text-blue-600';
        if (percentage >= 50) return 'text-yellow-600';
        return 'text-red-600';
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
        return <div className="p-8 text-center">Loading grades and progress...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Grades & Academic Progress</h1>

            {/* Guidance Panel */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Academic Performance</h2>
                <p className="text-sm text-gray-600 mb-4">
                    View your grades, transcripts, feedback, and overall academic progress for the course.
                </p>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                    <li>Results & transcripts (as permitted)</li>
                    <li>Feedback release</li>
                    <li>Progress tracking with visual graphs</li>
                    <li>Grades breakdown by assessment</li>
                </ul>
            </div>

            {/* Course Summary with Charts */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Overall Course Grade</h2>
                    {courseSummary ? (
                        <p className="text-sm text-gray-600">
                            Updated: {courseSummary.updatedAt || 'N/A'}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-600">No overall grade available yet.</p>
                    )}
                </div>

                {courseSummary && (
                    <div className="space-y-8">
                        {/* Progress Bar */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                                <span className="text-3xl font-bold text-gray-900">{courseSummary.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${courseSummary.percentage || 0}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {courseSummary.finalGrade} / {courseSummary.maxGrade} points
                            </p>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Pie Chart - Points Earned vs Remaining */}
                            <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">Grade Distribution</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                {
                                                    name: 'Points Earned',
                                                    value: parseFloat(courseSummary.finalGrade) || 0,
                                                },
                                                {
                                                    name: 'Points Remaining',
                                                    value: (parseFloat(courseSummary.maxGrade) || 100) - (parseFloat(courseSummary.finalGrade) || 0),
                                                },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            <Cell fill="#3b82f6" />
                                            <Cell fill="#e5e7eb" />
                                        </Pie>
                                        <Tooltip formatter={(value) => value.toFixed(1)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Bar Chart - Performance Overview */}
                            <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">Performance Summary</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart
                                        data={[
                                            {
                                                name: 'Performance',
                                                current: parseFloat(courseSummary.finalGrade) || 0,
                                                maximum: parseFloat(courseSummary.maxGrade) || 100,
                                            },
                                        ]}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value) => value.toFixed(1)}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="current" fill="#10b981" radius={[8, 8, 0, 0]} name="Your Grade" />
                                        <Bar dataKey="maximum" fill="#d1d5db" radius={[8, 8, 0, 0]} name="Maximum Grade" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Grade Summary Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-100">
                                <p className="text-xs text-gray-600 mb-1">Your Grade</p>
                                <p className="text-3xl font-bold text-blue-600">{courseSummary.finalGrade}</p>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-4 text-center border-2 border-indigo-100">
                                <p className="text-xs text-gray-600 mb-1">Maximum</p>
                                <p className="text-3xl font-bold text-indigo-600">{courseSummary.maxGrade}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-100">
                                <p className="text-xs text-gray-600 mb-1">Grade</p>
                                <p className="text-3xl font-bold text-green-600">{courseSummary.percentage}%</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Individual Grades Table */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Individual Assessment Grades</h2>
                
                {grades.length === 0 ? (
                    <div className="text-center py-8">
                        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No individual grades available yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Assessment</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Module</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Grade</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Percentage</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Feedback</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Submitted</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {grades.map(grade => (
                                    <tr key={grade.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{grade.module}</p>
                                            <p className="text-xs text-gray-600">{grade.type}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{grade.code}</td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="font-bold text-gray-900">{grade.grade}</p>
                                            <p className="text-xs text-gray-600">/ {grade.maxGrade}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-bold ${getGradeColor(grade.percentage)}`}>
                                                {grade.percentage}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {grade.feedback ? (
                                                <div className="text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                                                    {grade.feedback}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">No feedback yet</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{grade.submittedDate || 'N/A'}</td>
                                        <td className="px-6 py-4 text-center">
                                            {grade.moodle_url && (
                                                <button
                                                    onClick={() => handleViewInMoodle(grade.moodle_url)}
                                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                >
                                                    View Details
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentGrades;
