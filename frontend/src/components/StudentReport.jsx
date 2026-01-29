import React, { useState, useEffect } from 'react';
import { 
    Users, 
    TrendingUp, 
    Calendar, 
    BookOpen,
    FileBarChart,
    Download,
    Filter,
    Search,
    BarChart3,
    PieChart
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const StudentReport = () => {
    const [students, setStudents] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/students/applications');
            if (response.ok) {
                const result = await response.json();
                // Handle the response structure from the API
                console.log('API Response:', result); // Debug log
                const data = result.data?.applications || result.applications || result || [];
                console.log('Extracted data:', data); // Debug log
                setStudents(Array.isArray(data) ? data : []);
                setFilteredData(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    const admissionTrends = [
        { month: 'Jan', admissions: Array.isArray(students) ? students.filter(s => s.submitted_at && new Date(s.submitted_at).getMonth() === 0).length : 0 },
        { month: 'Feb', admissions: Array.isArray(students) ? students.filter(s => s.submitted_at && new Date(s.submitted_at).getMonth() === 1).length : 0 },
        { month: 'Mar', admissions: Array.isArray(students) ? students.filter(s => s.submitted_at && new Date(s.submitted_at).getMonth() === 2).length : 0 },
        { month: 'Apr', admissions: Array.isArray(students) ? students.filter(s => s.submitted_at && new Date(s.submitted_at).getMonth() === 3).length : 0 },
        { month: 'May', admissions: Array.isArray(students) ? students.filter(s => s.submitted_at && new Date(s.submitted_at).getMonth() === 4).length : 0 },
        { month: 'Jun', admissions: Array.isArray(students) ? students.filter(s => s.submitted_at && new Date(s.submitted_at).getMonth() === 5).length : 0 },
    ];

    const statusDistribution = [
        { name: 'Approved', value: Array.isArray(students) ? students.filter(s => s.application_status === 'approved').length : 0, color: '#10B981' },
        { name: 'Pending', value: Array.isArray(students) ? students.filter(s => s.application_status === 'pending').length : 0, color: '#F59E0B' },
        { name: 'Rejected', value: Array.isArray(students) ? students.filter(s => s.application_status === 'rejected').length : 0, color: '#EF4444' },
    ];

    const programDistribution = [
        { name: 'Computer Science', value: Array.isArray(students) ? students.filter(s => s.course_title && s.course_title.includes('Computer Science')).length : 0 },
        { name: 'Engineering', value: Array.isArray(students) ? students.filter(s => s.course_title && s.course_title.includes('Engineering')).length : 0 },
        { name: 'Business', value: Array.isArray(students) ? students.filter(s => s.course_title && s.course_title.includes('Business')).length : 0 },
        { name: 'Others', value: Array.isArray(students) ? students.filter(s => s.course_title && !['Computer Science', 'Engineering', 'Business'].some(prog => s.course_title.includes(prog))).length : 0 },
    ];

    const stats = [
        {
            title: 'Total Applications',
            value: Array.isArray(students) ? students.length : 0,
            icon: Users,
            color: 'from-blue-400 to-blue-500',
            change: '+12%'
        },
        {
            title: 'Approved',
            value: Array.isArray(students) ? students.filter(s => s.application_status === 'approved').length : 0,
            icon: TrendingUp,
            color: 'from-green-400 to-green-500',
            change: '+8%'
        },
        {
            title: 'This Month',
            value: Array.isArray(students) ? students.filter(s => s.submitted_at && new Date(s.submitted_at).getMonth() === new Date().getMonth()).length : 0,
            icon: Calendar,
            color: 'from-purple-400 to-purple-500',
            change: '+15%'
        },
        {
            title: 'Programs',
            value: Array.isArray(students) ? [...new Set(students.map(s => s.course_title).filter(Boolean))].length : 0,
            icon: BookOpen,
            color: 'from-orange-400 to-orange-500',
            change: '+2'
        }
    ];

    const exportReport = () => {
        const studentsArray = Array.isArray(students) ? students : [];
        const csvContent = [
            ['Application ID', 'Name', 'Email', 'Course', 'Status', 'Submission Date'],
            ...studentsArray.map(student => [
                student.application_reference || student.id,
                `${student.first_name} ${student.last_name}`,
                student.email,
                student.course_title,
                student.application_status,
                student.submitted_at ? new Date(student.submitted_at).toLocaleDateString() : ''
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student-applications-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scl-purple"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                        <FileBarChart className="w-7 h-7 text-scl-purple" />
                        <span>Student Analytics Report</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Comprehensive student data analysis and insights</p>
                </div>
                <div className="flex space-x-3">
                    <select 
                        value={dateRange} 
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                    >
                        <option value="all">All Time</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                    <button
                        onClick={exportReport}
                        className="bg-scl-purple text-white px-4 py-2 rounded-lg hover:bg-scl-dark transition-colors flex items-center space-x-2 text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className={`bg-gradient-to-r ${stat.color} p-4 rounded-xl text-white shadow-md`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                                <p className="text-white/70 text-xs mt-1">{stat.change} from last period</p>
                            </div>
                            <stat.icon className="w-8 h-8 text-white/70" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Admission Trends */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5 text-scl-purple" />
                            <span>Admission Trends</span>
                        </h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={admissionTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="admissions" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Status Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <PieChart className="w-5 h-5 text-scl-purple" />
                            <span>Student Status</span>
                        </h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <RechartsPieChart>
                            <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Summary Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Admissions Summary</h3>
                    <p className="text-gray-500 text-sm mt-1">Latest 10 student admissions</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Array.isArray(students) ? students.slice(0, 10).map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {student.first_name} {student.last_name}
                                            </div>
                                            <div className="text-sm text-gray-500">{student.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{student.course_title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            student.application_status === 'approved' ? 'bg-green-100 text-green-800' :
                                            student.application_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {student.application_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {student.submitted_at ? new Date(student.submitted_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        No applications found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentReport;