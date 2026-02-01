import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    GraduationCap,
    Users,
    BookOpen,
    FileText,
    Search,
    Filter,
    Eye,
    Download,
    CheckCircle,
    Clock,
    XCircle,
    Mail,
    Phone,
    Calendar,
    User,
    Loader2,
    MoreVertical,
    Trash2,
    Edit
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const AdminApplications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        program: '',
        search: ''
    });
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchApplications();
        fetchPrograms();
    }, []);

    useEffect(() => {
        updateStats();
    }, [applications]);

    const fetchApplications = async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/applications`, {
                withCredentials: true
            });
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPrograms = async () => {
        try {
            const response = await axios.get(`${API_URL}/public/programs`);
            setPrograms(response.data);
        } catch (error) {
            console.error('Error fetching programs:', error);
        }
    };

    const updateStats = () => {
        const newStats = {
            total: applications.length,
            pending: applications.filter(app => app.status === 'pending').length,
            approved: applications.filter(app => app.status === 'approved').length,
            rejected: applications.filter(app => app.status === 'rejected').length
        };
        setStats(newStats);
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            await axios.put(`${API_URL}/admin/applications/${applicationId}`, {
                status: newStatus
            }, { withCredentials: true });
            
            setApplications(prev => 
                prev.map(app => 
                    app.id === applicationId ? { ...app, status: newStatus } : app
                )
            );
            
            if (selectedApplication && selectedApplication.id === applicationId) {
                setSelectedApplication(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error('Error updating application status:', error);
        }
    };

    const handleDeleteApplication = async (applicationId) => {
        if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/admin/applications/${applicationId}`, {
                withCredentials: true
            });
            
            setApplications(prev => prev.filter(app => app.id !== applicationId));
            setShowModal(false);
            setSelectedApplication(null);
        } catch (error) {
            console.error('Error deleting application:', error);
        }
    };

    const filteredApplications = applications.filter(app => {
        const matchesStatus = !filters.status || app.status === filters.status;
        const matchesProgram = !filters.program || app.program_id.toString() === filters.program;
        const matchesSearch = !filters.search || 
            app.first_name.toLowerCase().includes(filters.search.toLowerCase()) ||
            app.last_name.toLowerCase().includes(filters.search.toLowerCase()) ||
            app.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            app.reference_number.toLowerCase().includes(filters.search.toLowerCase());
        
        return matchesStatus && matchesProgram && matchesSearch;
    });

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
            approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
            under_review: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="h-3 w-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getProgramName = (programId) => {
        const program = programs.find(p => p.id === programId);
        return program ? program.name : 'Unknown Program';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <span className="text-lg text-gray-600">Loading applications...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <GraduationCap className="h-8 w-8 text-purple-600" />
                                <span className="text-xl font-bold text-gray-800">SCL Institute</span>
                            </div>
                            <span className="text-gray-400">|</span>
                            <span className="text-lg font-medium text-gray-600">Applications Management</span>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rejected</p>
                                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search applications..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                        
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        
                        <select
                            value={filters.program}
                            onChange={(e) => setFilters(prev => ({ ...prev, program: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="">All Programs</option>
                            {programs.map(program => (
                                <option key={program.id} value={program.id}>
                                    {program.name}
                                </option>
                            ))}
                        </select>
                        
                        <button
                            onClick={() => setFilters({ status: '', program: '', search: '' })}
                            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Applications Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800">
                            Applications ({filteredApplications.length})
                        </h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Applicant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Program
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Intake
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Applied Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredApplications.map((application) => (
                                    <tr key={application.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-medium text-gray-800">
                                                        {application.first_name} {application.last_name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {application.email}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Ref: {application.reference_number}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800">
                                                {getProgramName(application.program_id)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-800">
                                                {application.intake_month} {application.intake_year}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-800">
                                                {formatDate(application.created_at)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(application.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedApplication(application);
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                
                                                {application.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(application.id, 'approved')}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                
                                                <button
                                                    onClick={() => handleDeleteApplication(application.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredApplications.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No applications found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Application Detail Modal */}
            {showModal && selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Application Details</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-8">
                            {/* Header Info */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {selectedApplication.first_name} {selectedApplication.last_name}
                                    </h3>
                                    <p className="text-gray-600">Ref: {selectedApplication.reference_number}</p>
                                    <p className="text-sm text-gray-500">
                                        Applied on {formatDate(selectedApplication.created_at)}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {getStatusBadge(selectedApplication.status)}
                                    <select
                                        value={selectedApplication.status}
                                        onChange={(e) => handleStatusUpdate(selectedApplication.id, e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="under_review">Under Review</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Contact Information
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                        <span>{selectedApplication.email}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                        <span>{selectedApplication.phone}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                        <span>{selectedApplication.date_of_birth}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-gray-600">Nationality: {selectedApplication.nationality}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Program Details */}
                            <div className="bg-purple-50 rounded-lg p-6">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                                    <BookOpen className="h-5 w-5 mr-2" />
                                    Program Details
                                </h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Program:</span> {getProgramName(selectedApplication.program_id)}</p>
                                    <p><span className="font-medium">Intake:</span> {selectedApplication.intake_month} {selectedApplication.intake_year}</p>
                                    {selectedApplication.how_did_you_hear && (
                                        <p><span className="font-medium">How they heard about us:</span> {selectedApplication.how_did_you_hear}</p>
                                    )}
                                </div>
                            </div>

                            {/* Academic Background */}
                            {(selectedApplication.highest_qualification || selectedApplication.institution_name) && (
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-4">Academic Background</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        {selectedApplication.highest_qualification && (
                                            <p><span className="font-medium">Qualification:</span> {selectedApplication.highest_qualification}</p>
                                        )}
                                        {selectedApplication.institution_name && (
                                            <p><span className="font-medium">Institution:</span> {selectedApplication.institution_name}</p>
                                        )}
                                        {selectedApplication.graduation_year && (
                                            <p><span className="font-medium">Graduation Year:</span> {selectedApplication.graduation_year}</p>
                                        )}
                                        {selectedApplication.gpa_grade && (
                                            <p><span className="font-medium">Grade/GPA:</span> {selectedApplication.gpa_grade}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Personal Statement */}
                            {selectedApplication.personal_statement && (
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-4">Personal Statement</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.personal_statement}</p>
                                    </div>
                                </div>
                            )}

                            {/* Address */}
                            {selectedApplication.address_line1 && (
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-4">Address</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p>{selectedApplication.address_line1}</p>
                                        {selectedApplication.address_line2 && <p>{selectedApplication.address_line2}</p>}
                                        <p>
                                            {[selectedApplication.city, selectedApplication.postal_code, selectedApplication.country]
                                                .filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApplications;