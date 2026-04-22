import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    Download,
    CheckCircle2,
    Clock,
    XCircle,
    HourglassIcon,
    TrendingUp,
    Users,
    FileText,
    Filter,
    ChevronDown,
    CheckSquare,
    Settings,
    RefreshCw,
    Mail
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const AdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [courses, setCourses] = useState([]);
    const [selectedApps, setSelectedApps] = useState(new Set());
    const [stats, setStats] = useState({
        total: 0,
        accepted: 0,
        pending: 0,
        rejected: 0,
        conditionalAccept: 0
    });
    const [syncingRoles, setSyncingRoles] = useState(false);
    const [syncStatus, setSyncStatus] = useState(null);

    // Fetch applications on mount
    useEffect(() => {
        fetchApplications();
    }, []);

    // Filter applications when search/filters change
    useEffect(() => {
        applyFilters();
    }, [applications, searchQuery, selectedStatus, selectedCourse]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${API_URL}/students/applications`);
            
            if (response.data?.success) {
                const apps = response.data.data?.applications || [];
                setApplications(apps);

                // Extract unique courses
                const uniqueCourses = [...new Set(apps.map(app => app.course_code))];
                setCourses(uniqueCourses);

                // Calculate statistics
                calculateStats(apps);
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (apps) => {
        setStats({
            total: apps.length,
            accepted: apps.filter(a => a.application_status === 'accepted').length,
            pending: apps.filter(a => a.application_status === 'submitted' || a.application_status === 'under_review').length,
            rejected: apps.filter(a => a.application_status === 'rejected').length,
            conditionalAccept: apps.filter(a => a.application_status === 'conditional_accept').length
        });
    };

    const applyFilters = () => {
        let filtered = [...applications];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(app =>
                app.first_name?.toLowerCase().includes(query) ||
                app.last_name?.toLowerCase().includes(query) ||
                app.email?.toLowerCase().includes(query) ||
                app.application_reference?.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(app => app.application_status === selectedStatus);
        }

        // Course filter
        if (selectedCourse !== 'all') {
            filtered = filtered.filter(app => app.course_code === selectedCourse);
        }

        // Sort by newest first
        filtered.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

        setFilteredApplications(filtered);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return 'bg-green-50 text-green-700 border-green-200';
            case 'conditional_accept': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
            case 'submitted':
            case 'under_review': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted': return <CheckCircle2 className="w-4 h-4" />;
            case 'conditional_accept': return <Clock className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            default: return <HourglassIcon className="w-4 h-4" />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'accepted': return 'Accepted';
            case 'conditional_accept': return 'Conditional';
            case 'rejected': return 'Rejected';
            case 'submitted': return 'Submitted';
            case 'under_review': return 'Under Review';
            default: return status;
        }
    };

    const toggleSelectApp = (appId) => {
        const newSelected = new Set(selectedApps);
        if (newSelected.has(appId)) {
            newSelected.delete(appId);
        } else {
            newSelected.add(appId);
        }
        setSelectedApps(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedApps.size === filteredApplications.length) {
            setSelectedApps(new Set());
        } else {
            setSelectedApps(new Set(filteredApplications.map(app => app.id)));
        }
    };

    const handleBulkApprove = async () => {
        if (selectedApps.size === 0) {
            alert('Please select applications to approve');
            return;
        }

        if (!confirm(`Approve ${selectedApps.size} application(s)?`)) return;

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/students/bulk-approve`, {
                applicationIds: Array.from(selectedApps),
                reviewer_name: user?.name || 'Admin'
            });

            if (response.data?.success) {
                alert(`${response.data.data.successCount} applications approved successfully!`);
                setSelectedApps(new Set());
                await fetchApplications();
            } else {
                setError('Failed to approve applications');
            }
        } catch (err) {
            console.error('Error approving applications:', err);
            setError('Failed to approve applications');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (filteredApplications.length === 0) {
            alert('No applications to export');
            return;
        }

        const headers = ['ID', 'Reference', 'Name', 'Email', 'Course', 'Status', 'Submitted Date'];
        const rows = filteredApplications.map(app => [
            app.id,
            app.application_reference,
            `${app.first_name} ${app.last_name}`,
            app.email,
            app.course_title,
            getStatusLabel(app.application_status),
            new Date(app.submitted_at).toLocaleDateString('en-GB')
        ]);

        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleManualRoleSync = async () => {
        try {
            setSyncingRoles(true);
            setSyncStatus(null);

            const token = localStorage.getItem('authToken') || sessionStorage.getItem('accessToken');
            const headers = token ? { Authorization: token } : {};
            const response = await axios.post(
                `${API_URL}/admin/manual-role-sync`,
                {},
                { headers, withCredentials: true }
            );

            const result = response.data?.data;
            setSyncStatus({
                type: 'success',
                message: `Role sync complete. Refreshed ${result?.successCount ?? 0} of ${result?.totalUsers ?? 0} users in ${((result?.durationMs ?? 0) / 1000).toFixed(1)}s.`
            });
        } catch (err) {
            console.error('Error running manual role sync:', err);
            setSyncStatus({
                type: 'error',
                message: err.response?.data?.error || 'Failed to run manual role sync.'
            });
        } finally {
            setSyncingRoles(false);
        }
    };

    if (loading && applications.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600">Loading admissions data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admissions Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage and review student applications</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleManualRoleSync}
                        disabled={syncingRoles}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncingRoles ? 'animate-spin' : ''}`} />
                        {syncingRoles ? 'Syncing Roles...' : 'Sync Moodle Roles'}
                    </button>
                    <button
                        onClick={fetchApplications}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {syncStatus && (
                <div className={`p-4 rounded-lg border ${
                    syncStatus.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    {syncStatus.message}
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400">
                    <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <p className="text-sm text-gray-600 mb-1">Accepted</p>
                    <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-600 mb-1">Conditional</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.conditionalAccept}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                    <p className="text-sm text-gray-600 mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or reference..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Statuses</option>
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="accepted">Accepted</option>
                            <option value="conditional_accept">Conditional</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Course Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Courses</option>
                            {courses.map(course => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedApps.size > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">{selectedApps.size} selected</span>
                        <button
                            onClick={handleBulkApprove}
                            className="ml-auto flex items-center gap-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve Selected
                        </button>
                    </div>
                )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Showing <strong>{filteredApplications.length}</strong> of <strong>{applications.length}</strong> applications
                </p>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export to CSV
                </button>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedApps.size === filteredApplications.length && filteredApplications.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Submitted</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        No applications found
                                    </td>
                                </tr>
                            ) : (
                                filteredApplications.map(app => (
                                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedApps.has(app.id)}
                                                onChange={() => toggleSelectApp(app.id)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{app.first_name} {app.last_name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{app.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{app.course_code}</td>
                                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{app.application_reference}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(app.application_status)}`}>
                                                {getStatusIcon(app.application_status)}
                                                {getStatusLabel(app.application_status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(app.submitted_at).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => navigate(`/applications/${app.id}/review`)}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;


