import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { openMoodleSSO } from '../../utils/ssoService';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

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

const StudentGrades = ({ user }) => {
    const [grades, setGrades] = useState([]);
    const [courseGrades, setCourseGrades] = useState([]);
    const [programmeSummary, setProgrammeSummary] = useState(null);
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
                    const gradesResponse = await axios.get(`${API_URL}/students/grades/${studentApp.id}`);
                    if (gradesResponse.data?.success) {
                        const gradePayload = gradesResponse.data.data || {};
                        setGrades(gradePayload.grades || []);
                        setCourseGrades(gradePayload.courseGrades || []);
                        setProgrammeSummary(gradePayload.programmeSummary || null);
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

    // Filter logic
    const uniqueYears = useMemo(() => {
        const years = new Set();
        grades.forEach(g => { const y = extractYear(g.courseCode); if (y) years.add(y); });
        courseGrades.forEach(g => { const y = extractYear(g.courseCode); if (y) years.add(y); });
        return [...years].sort();
    }, [grades, courseGrades]);

    const uniqueSemesters = useMemo(() => {
        const sems = new Set();
        const source = [...grades, ...courseGrades];
        source.forEach(g => {
            if (filterYear && extractYear(g.courseCode) !== filterYear) return;
            const s = extractSemester(g.courseCode);
            if (s) sems.add(s);
        });
        return [...sems].sort();
    }, [grades, courseGrades, filterYear]);

    const filteredGrades = useMemo(() => {
        return grades.filter(g => {
            if (filterYear && extractYear(g.courseCode) !== filterYear) return false;
            if (filterSemester && extractSemester(g.courseCode) !== filterSemester) return false;
            return true;
        });
    }, [grades, filterYear, filterSemester]);

    const filteredCourseGrades = useMemo(() => {
        return courseGrades.filter(g => {
            if (filterYear && extractYear(g.courseCode) !== filterYear) return false;
            if (filterSemester && extractSemester(g.courseCode) !== filterSemester) return false;
            return true;
        });
    }, [courseGrades, filterYear, filterSemester]);

    // Compute filtered summary
    const filteredSummary = useMemo(() => {
        if (filteredCourseGrades.length === 0) return programmeSummary;
        const totalGrade = filteredCourseGrades.reduce((s, c) => s + (parseFloat(c.finalGrade) || 0), 0);
        const totalMax = filteredCourseGrades.reduce((s, c) => s + (parseFloat(c.maxGrade) || 100), 0);
        return {
            finalGrade: totalGrade.toFixed(2),
            maxGrade: totalMax.toFixed(2),
            percentage: totalMax > 0 ? Math.round((totalGrade / totalMax) * 100) : 0,
            coursesGraded: filteredCourseGrades.length,
            coursesTotal: filteredCourseGrades.length,
            updatedAt: programmeSummary?.updatedAt || null
        };
    }, [filteredCourseGrades, programmeSummary]);

    // Reset semester when year changes
    useEffect(() => {
        setFilterSemester('');
    }, [filterYear]);

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Grades & Academic Progress</h1>
            <p className="text-sm text-gray-600 mb-8">View your grades, transcripts, feedback, and overall academic progress across your programme.</p>

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

            {/* Programme Overall Summary */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {filterYear ? `${filterYear}${filterSemester ? ` – ${filterSemester}` : ''}` : 'Overall Programme'} Grade
                    </h2>
                    {filteredSummary ? (
                        <p className="text-sm text-gray-600">
                            {filteredSummary.coursesGraded} of {filteredSummary.coursesTotal || filteredSummary.coursesGraded} courses graded · Updated: {filteredSummary.updatedAt || 'N/A'}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-600">No overall grade available yet.</p>
                    )}
                </div>

                {filteredSummary && (
                    <div className="space-y-8">
                        {/* Progress Bar */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                                <span className="text-3xl font-bold text-gray-900">{filteredSummary.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${filteredSummary.percentage || 0}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {filteredSummary.finalGrade} / {filteredSummary.maxGrade} points
                            </p>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">Grade Distribution</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Points Earned', value: parseFloat(filteredSummary.finalGrade) || 0 },
                                                { name: 'Points Remaining', value: (parseFloat(filteredSummary.maxGrade) || 100) - (parseFloat(filteredSummary.finalGrade) || 0) },
                                            ]}
                                            cx="50%" cy="50%" labelLine={false}
                                            label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                                            outerRadius={80} fill="#8884d8" dataKey="value"
                                        >
                                            <Cell fill="#3b82f6" />
                                            <Cell fill="#e5e7eb" />
                                        </Pie>
                                        <Tooltip formatter={(value) => value.toFixed(1)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Bar Chart - Per Course Performance */}
                            <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4">Performance by Course</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart
                                        data={filteredCourseGrades.map(cg => ({
                                            name: cg.courseCode ? cg.courseCode.replace(/^HND-LM-/, '') : cg.courseName?.substring(0, 15),
                                            grade: parseFloat(cg.finalGrade) || 0,
                                            max: parseFloat(cg.maxGrade) || 100,
                                        }))}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                        <Legend />
                                        <Bar dataKey="grade" fill="#10b981" radius={[8, 8, 0, 0]} name="Your Grade" />
                                        <Bar dataKey="max" fill="#d1d5db" radius={[8, 8, 0, 0]} name="Maximum" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Grade Summary Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-100">
                                <p className="text-xs text-gray-600 mb-1">Your Grade</p>
                                <p className="text-3xl font-bold text-blue-600">{filteredSummary.finalGrade}</p>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-4 text-center border-2 border-indigo-100">
                                <p className="text-xs text-gray-600 mb-1">Maximum</p>
                                <p className="text-3xl font-bold text-indigo-600">{filteredSummary.maxGrade}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-100">
                                <p className="text-xs text-gray-600 mb-1">Grade</p>
                                <p className="text-3xl font-bold text-green-600">{filteredSummary.percentage}%</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Per-Course Grade Breakdown */}
            {filteredCourseGrades.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Course Grade Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredCourseGrades.map(cg => (
                            <div
                                key={cg.courseCode}
                                className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                                onClick={() => handleViewInMoodle(cg.courseId ? `/grade/report/user/index.php?id=${cg.courseId}` : null)}
                            >
                                <p className="text-xs font-semibold text-purple-600 mb-1">{cg.courseCode}</p>
                                <p className="text-sm font-medium text-gray-900 mb-3 line-clamp-2">{cg.courseName}</p>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{cg.percentage}%</p>
                                        <p className="text-xs text-gray-500">{cg.finalGrade} / {cg.maxGrade}</p>
                                    </div>
                                    <div className={`text-xs font-semibold px-2 py-1 rounded ${
                                        cg.percentage >= 70 ? 'bg-green-100 text-green-700' :
                                        cg.percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                                        cg.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {cg.percentage >= 70 ? 'Distinction' : cg.percentage >= 60 ? 'Merit' : cg.percentage >= 50 ? 'Pass' : 'Refer'}
                                    </div>
                                </div>
                                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${
                                            cg.percentage >= 70 ? 'bg-green-500' :
                                            cg.percentage >= 60 ? 'bg-blue-500' :
                                            cg.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${cg.percentage || 0}%` }}
                                    ></div>
                                </div>
                                <p className="mt-2 text-xs text-blue-600 font-medium">View in Moodle →</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Individual Grades Table */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Individual Assessment Grades ({filteredGrades.length})</h2>
                
                {filteredGrades.length === 0 ? (
                    <div className="text-center py-8">
                        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No individual grades available yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Course</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Assessment</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Grade</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Percentage</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Submitted</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredGrades.map(grade => (
                                    <tr key={grade.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4">
                                            <p className="text-xs font-semibold text-purple-600">{grade.courseCode}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">{grade.courseName}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-gray-900">{grade.module}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium">{grade.code}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <p className="font-bold text-gray-900">{grade.grade}</p>
                                            <p className="text-xs text-gray-600">/ {grade.maxGrade}</p>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`font-bold ${getGradeColor(grade.percentage)}`}>
                                                {grade.percentage}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">{grade.submittedDate || 'N/A'}</td>
                                        <td className="px-4 py-4 text-center">
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
