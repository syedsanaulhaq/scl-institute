import { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    Eye, 
    Mail, 
    Phone, 
    Calendar,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return 'N/A';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return 'N/A';
    }
};

const ApplicantsList = () => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${API_URL}/students/applications`);

            if (response.data?.success) {
                const apps = response.data.data?.applications || [];
                setApplicants(apps);
            } else {
                setError('Failed to load applicants');
            }
        } catch (err) {
            console.error('Error fetching applicants:', err);
            setError('Error loading applicants');
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

    const filteredApplicants = applicants.filter(app =>
        searchTerm === '' || 
        app.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Applicants List</h1>
                <p className="text-gray-600 mt-2">All students who have submitted applications</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm font-medium">Total Applicants</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{applicants.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm font-medium">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{applicants.filter(a => a.application_status === 'submitted').length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm font-medium">Approved</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{applicants.filter(a => a.application_status === 'accepted' || a.application_status === 'approved').length}</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Applicants List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">Loading applicants...</p>
                    </div>
                ) : filteredApplicants.length === 0 ? (
                    <div className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No applicants found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredApplicants.map((applicant) => (
                            <div 
                                key={applicant.id}
                                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => setSelectedApplicant(applicant)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                                {applicant.first_name?.[0]}{applicant.last_name?.[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{applicant.first_name} {applicant.last_name}</h3>
                                                <p className="text-sm text-gray-500">{applicant.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(applicant.application_status)}`}>
                                            {applicant.application_status?.replace(/_/g, ' ')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span>{applicant.course_title}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(applicant.submitted_at)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedApplicant && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold">{selectedApplicant.first_name} {selectedApplicant.last_name}</h2>
                            <button
                                onClick={() => setSelectedApplicant(null)}
                                className="text-white hover:bg-white/20 p-2 rounded transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApplicant.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApplicant.contact_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Date of Birth</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApplicant.date_of_birth}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Nationality</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApplicant.nationality}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Applied Course</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Course</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApplicant.course_title}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Code</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApplicant.course_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Type</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedApplicant.course_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Start Date</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(selectedApplicant.intake_start_date)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">{selectedApplicant.application_status?.replace(/_/g, ' ')}</p>
                                <p className="text-xs text-gray-500 mt-2">Submitted: {formatDate(selectedApplicant.submitted_at)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicantsList;
