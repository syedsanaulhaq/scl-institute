import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    Mail,
    Phone,
    Calendar,
    FileText,
    ChevronRight,
    AlertCircle,
    Download
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ApplicationRequests = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedApp, setSelectedApp] = useState(null);
    const [error, setError] = useState('');
    const [reviewStatus, setReviewStatus] = useState({});

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    const checkReviewStatus = async (appId) => {
        try {
            const response = await axios.get(`${API_URL}/students/applications/${appId}/review`);
            const hasReview = response.data?.data !== null;
            console.log(`[REVIEW STATUS] App ID ${appId}: hasReview = ${hasReview}, data =`, response.data?.data);
            return hasReview;
        } catch (err) {
            console.error(`[REVIEW STATUS ERROR] App ID ${appId}:`, err.message);
            return false;
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${API_URL}/students/applications`, {
                params: { status: statusFilter !== 'all' ? statusFilter : undefined }
            });

            if (response.data?.success) {
                // The API returns applications nested under data.applications
                const apps = response.data.data?.applications || [];
                // Sort by submitted_at descending (latest first)
                const sortedApps = apps.sort((a, b) => {
                    const dateA = new Date(a.submitted_at);
                    const dateB = new Date(b.submitted_at);
                    return dateB - dateA;
                });
                console.log('[FETCH APPS] Got', sortedApps.length, 'applications');
                setApplications(sortedApps);
                
                // Check review status for each application
                const reviewStatuses = {};
                for (const app of sortedApps) {
                    console.log(`[CHECKING REVIEW] App ID ${app.id}`);
                    reviewStatuses[app.id] = await checkReviewStatus(app.id);
                }
                console.log('[FINAL REVIEW STATUS]', reviewStatuses);
                setReviewStatus(reviewStatuses);
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

    const getStatusBadge = (status) => {
        const styles = {
            'submitted': 'bg-blue-100 text-blue-800',
            'under_review': 'bg-yellow-100 text-yellow-800',
            'approved': 'bg-green-100 text-green-800',
            'accepted': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'conditional_accept': 'bg-purple-100 text-purple-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'submitted':
                return <Clock className="w-4 h-4" />;
            case 'approved':
                return <CheckCircle2 className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            case 'under_review':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const filteredApplications = applications.filter(app =>
        searchTerm === '' || 
        app.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.application_reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Student Applications</h1>
                <p className="text-gray-600 mt-2">Manage incoming student admission requests</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                            <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Pending Review</p>
                            <p className="text-2xl font-bold text-yellow-600">{applications.filter(a => a.application_status === 'submitted').length}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Approved</p>
                            <p className="text-2xl font-bold text-green-600">{applications.filter(a => a.application_status === 'accepted').length}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Rejected</p>
                            <p className="text-2xl font-bold text-red-600">{applications.filter(a => a.application_status === 'rejected').length}</p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or reference number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="submitted">Pending Review</option>
                            <option value="under_review">Under Review</option>
                            <option value="accepted">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="conditional_accept">Conditional Accept</option>
                            <option value="interview_scheduled">Interview Scheduled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Applications Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">Loading applications...</p>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No applications found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reference</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Applicant</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submitted</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.map((app) => (
                                    <tr key={app.id} className={`border-b border-gray-200 transition-colors ${
                                        app.application_status === 'accepted' 
                                            ? 'bg-green-50 hover:bg-green-100' 
                                            : 'hover:bg-gray-50'
                                    }`}>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => setSelectedApp(app)}
                                                className="text-sm font-mono font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                            >
                                                {app.application_reference}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{app.first_name} {app.last_name}</p>
                                                <p className="text-sm text-gray-500">{app.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{app.course_title || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">{app.course_code || ''}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">
                                                {new Date(app.submitted_at).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit ${getStatusBadge(app.application_status)}`}>
                                                {getStatusIcon(app.application_status)}
                                                {app.application_status?.replace(/_/g, ' ') || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => navigate(`/applications/${app.id}/review`)}
                                                className={`p-2 rounded-full transition-colors ${
                                                    reviewStatus[app.id] 
                                                        ? 'text-blue-600 hover:bg-blue-100' 
                                                        : 'text-green-600 hover:bg-green-100'
                                                }`}
                                                title={reviewStatus[app.id] ? 'Edit Review' : 'Add Review'}
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold">Application Details</h2>
                                <p className="text-blue-100 text-sm mt-1">Reference: {selectedApp.application_reference}</p>
                            </div>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="text-white hover:bg-white/20 p-2 rounded transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Full Name</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.first_name} {selectedApp.middle_names} {selectedApp.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Date of Birth</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.date_of_birth}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="text-sm font-medium text-blue-600">{selectedApp.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.contact_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Gender</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Nationality</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.nationality}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-900">{selectedApp.address_line1}</p>
                                    {selectedApp.address_line2 && <p className="text-gray-900">{selectedApp.address_line2}</p>}
                                    <p className="text-gray-900">{selectedApp.town_city}, {selectedApp.postcode}</p>
                                    <p className="text-gray-900">{selectedApp.country_of_residence}</p>
                                </div>
                            </div>

                            {/* Course Selection */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Selection</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Course</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.course_title}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Code</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.course_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Type</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.course_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Mode of Study</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.mode_of_study}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Entry Route</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.entry_route}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Start Date</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.intake_start_date}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Background */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Background</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Highest Qualification</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.highest_qualification}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Institution</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.institution_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Year Completed</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.year_completed}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">English Proficiency</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApp.english_proficiency} ({selectedApp.english_score})</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600">Work Experience</p>
                                    <p className="text-sm text-gray-900 mt-1">{selectedApp.relevant_work_experience || 'Not provided'}</p>
                                </div>
                            </div>

                            {/* Status and Action */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Current Status</p>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit mt-2 ${getStatusBadge(selectedApp.application_status)}`}>
                                            {getStatusIcon(selectedApp.application_status)}
                                            {selectedApp.application_status?.replace(/_/g, ' ') || 'Unknown'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Submitted</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{new Date(selectedApp.submitted_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationRequests;
