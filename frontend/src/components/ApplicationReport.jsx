import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Filter, Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ApplicationReport = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${API_URL}/students/applications`);

            if (response.data?.success) {
                const apps = response.data.data?.applications || [];
                setApplications(apps);
            } else {
                setError('Failed to load applications');
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Error loading applications');
        } finally {
            setLoading(false);
        }
    };

    // Generate statistics
    const getStats = () => {
        const total = applications.length;
        const submitted = applications.filter(a => a.application_status === 'submitted').length;
        const underReview = applications.filter(a => a.application_status === 'under_review').length;
        const accepted = applications.filter(a => a.application_status === 'accepted' || a.application_status === 'approved').length;
        const rejected = applications.filter(a => a.application_status === 'rejected').length;

        return { total, submitted, underReview, accepted, rejected };
    };

    // Generate course statistics
    const getCourseStats = () => {
        const courseMap = {};
        applications.forEach(app => {
            if (app.course_title) {
                courseMap[app.course_title] = (courseMap[app.course_title] || 0) + 1;
            }
        });

        return Object.keys(courseMap).map(course => ({
            name: course.length > 30 ? course.substring(0, 30) + '...' : course,
            value: courseMap[course]
        }));
    };

    // Generate status distribution
    const getStatusDistribution = () => {
        const stats = getStats();
        return [
            { name: 'Pending Review', value: stats.submitted, color: '#3B82F6' },
            { name: 'Under Review', value: stats.underReview, color: '#F59E0B' },
            { name: 'Approved', value: stats.accepted, color: '#10B981' },
            { name: 'Rejected', value: stats.rejected, color: '#EF4444' }
        ];
    };

    // Generate monthly data
    const getMonthlyData = () => {
        const monthlyMap = {};
        applications.forEach(app => {
            const date = new Date(app.submitted_at);
            const monthKey = date.toLocaleString('default', { month: 'short' });
            if (!monthlyMap[monthKey]) {
                monthlyMap[monthKey] = 0;
            }
            monthlyMap[monthKey]++;
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.map(month => ({
            month,
            applications: monthlyMap[month] || 0
        }));
    };

    const stats = getStats();
    const courseStats = getCourseStats();
    const statusDistribution = getStatusDistribution();
    const monthlyData = getMonthlyData();

    if (loading) {
        return <div className="p-8 text-center text-gray-600">Loading report data...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Applications Report</h1>
                    <p className="text-gray-600 mt-2">Comprehensive analytics and insights on student applications</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    Export PDF
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm font-medium">Pending Review</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.submitted}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm font-medium">Under Review</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.underReview}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm font-medium">Approved</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.accepted}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm font-medium">Rejected</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Status Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Course Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Applications by Course</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={courseStats.slice(0, 5)}
                            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="name" 
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                interval={0}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Application Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="applications" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6', r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Detailed Stats Table */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Summary</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Count</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Percentage</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-3 text-sm text-gray-900">Pending Review</td>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900">{stats.submitted}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{((stats.submitted / stats.total) * 100).toFixed(1)}%</td>
                                <td className="px-6 py-3 text-sm text-blue-600"><TrendingUp className="w-4 h-4 inline" /></td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-3 text-sm text-gray-900">Under Review</td>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900">{stats.underReview}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{((stats.underReview / stats.total) * 100).toFixed(1)}%</td>
                                <td className="px-6 py-3 text-sm text-yellow-600"><TrendingUp className="w-4 h-4 inline" /></td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-3 text-sm text-gray-900">Approved</td>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900">{stats.accepted}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{((stats.accepted / stats.total) * 100).toFixed(1)}%</td>
                                <td className="px-6 py-3 text-sm text-green-600"><TrendingUp className="w-4 h-4 inline" /></td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-3 text-sm text-gray-900">Rejected</td>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900">{stats.rejected}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{((stats.rejected / stats.total) * 100).toFixed(1)}%</td>
                                <td className="px-6 py-3 text-sm text-red-600"><TrendingUp className="w-4 h-4 inline" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ApplicationReport;
