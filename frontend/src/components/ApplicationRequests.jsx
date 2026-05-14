import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    Download,
    Edit,
    Trash2
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

const ApplicationRequests = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
    const [selectedApp, setSelectedApp] = useState(null);
    const [error, setError] = useState('');
    const [reviewStatus, setReviewStatus] = useState({});
    const [highlightedRef, setHighlightedRef] = useState(searchParams.get('highlight'));
    const [showSuccessMsg, setShowSuccessMsg] = useState(!!highlightedRef);
    const [inductionContext, setInductionContext] = useState(null);
    const [inductionLoading, setInductionLoading] = useState(false);

    // Load induction context whenever selectedApp changes and has a course_code
    useEffect(() => {
        if (selectedApp?.course_code) {
            setInductionLoading(true);
            setInductionContext(null);
            axios.get(`${API_URL}/induction-driven/induction-context/${selectedApp.course_code}`)
                .then(res => setInductionContext(res.data.data || null))
                .catch(() => setInductionContext(null))
                .finally(() => setInductionLoading(false));
        } else {
            setInductionContext(null);
        }
    }, [selectedApp?.course_code]);

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    // Auto-dismiss success message after 5 seconds
    useEffect(() => {
        if (showSuccessMsg) {
            const timer = setTimeout(() => {
                setShowSuccessMsg(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMsg]);

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
                
                // Check review status for ALL applications IN PARALLEL (not sequential)
                console.log('[CHECKING REVIEWS] Starting parallel review checks for', sortedApps.length, 'apps');
                const reviewPromises = sortedApps.map(app => 
                    checkReviewStatus(app.id)
                        .then(hasReview => ({ appId: app.id, hasReview }))
                        .catch(() => ({ appId: app.id, hasReview: false }))
                );
                
                const reviewResults = await Promise.all(reviewPromises);
                const reviewStatuses = {};
                reviewResults.forEach(result => {
                    reviewStatuses[result.appId] = result.hasReview;
                });
                console.log('[REVIEWS COMPLETE] All review statuses loaded:', reviewStatuses);
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
            'conditional_accept': 'bg-blue-100 text-blue-800'
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

    const handleDeleteApplication = async (appId) => {
        if (!window.confirm('Are you sure you want to delete this application? It will be marked as deleted and can be restored later.')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/students/applications/${appId}`, {
                withCredentials: true
            });
            
            setApplications(prev => prev.filter(app => app.id !== appId));
            setSelectedApp(null);
        } catch (error) {
            console.error('Error deleting application:', error);
            alert('Failed to delete application: ' + (error.response?.data?.error || error.message));
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

            {/* Success Message */}
            {showSuccessMsg && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start justify-between">
                    <div className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-green-800 font-semibold">Application Submitted Successfully!</p>
                            <p className="text-green-700 text-sm mt-1">Your new application has been added to the list below and is highlighted for your reference. Our admissions team will review it shortly.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowSuccessMsg(false)}
                        className="text-green-600 hover:text-green-800 font-bold ml-4"
                    >
                        ✕
                    </button>
                </div>
            )}

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
                                        highlightedRef && (app.application_reference === highlightedRef || app.id === parseInt(highlightedRef))
                                            ? 'bg-amber-100 hover:bg-amber-200 shadow-md'
                                            : app.application_status === 'accepted' 
                                            ? 'bg-green-50 hover:bg-green-100' 
                                            : 'hover:bg-gray-50'
                                    }`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => setSelectedApp(app)}
                                                    className="text-sm font-mono font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                >
                                                    {app.application_reference}
                                                </button>
                                                {highlightedRef && (app.application_reference === highlightedRef || app.id === parseInt(highlightedRef)) && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-200 text-green-800 animate-pulse">
                                                        ✨ NEW
                                                    </span>
                                                )}
                                            </div>
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
                                                {formatDate(app.submitted_at)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit ${getStatusBadge(app.application_status)}`}>
                                                {getStatusIcon(app.application_status)}
                                                {app.application_status?.replace(/_/g, ' ') || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/applications/${app.id}/edit`)}
                                                    className="p-1.5 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                                                    title="Edit Application"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/applications/${app.id}/review`)}
                                                    className={`p-1.5 rounded-full transition-colors ${
                                                        reviewStatus[app.id] 
                                                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                                    }`}
                                                    title={reviewStatus[app.id] ? 'Edit Review' : 'Add Review'}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteApplication(app.id)}
                                                    className="p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                                                    title="Delete Application"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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

                            {/* ── Induction Scrutiny Gate Panel ── */}
                            {inductionLoading && (
                                <div className="bg-purple-50 rounded-lg p-4 flex items-center gap-2 text-sm text-purple-700">
                                    <Clock className="w-4 h-4 animate-spin" />
                                    Running induction scrutiny check...
                                </div>
                            )}
                            {!inductionLoading && inductionContext && (() => {
                                const section4 = inductionContext.sections?.[4] || [];
                                const section5 = inductionContext.sections?.[5] || [];
                                if (!section4.length && !section5.length) return null;

                                // ── Gate check function ────────────────────────────────────────
                                // Returns { status: 'pass'|'fail'|'review', verdict, applicantValue }
                                const gateCheck = (req, app) => {
                                    const area = (req.area || '').toLowerCase();

                                    // ── 1. English Language ──────────────────────────────────────
                                    if (area.includes('english') || area.includes('language') || area.includes('ielts') || area.includes('proficiency')) {
                                        const prof = (app.english_proficiency || '').trim();
                                        const score = parseFloat(app.english_score) || 0;
                                        if (!prof) return { status: 'fail', verdict: 'No English qualification provided', applicantValue: '—' };
                                        const p = prof.toUpperCase();
                                        if (p.includes('IELTS'))  return score >= 5.5 ? { status: 'pass', verdict: `IELTS ${score} meets minimum 5.5`,   applicantValue: `IELTS ${score}` }
                                                                                      : { status: 'fail', verdict: `IELTS ${score} — minimum 5.5 required`, applicantValue: `IELTS ${score}` };
                                        if (p.includes('TOEFL'))  return score >= 60  ? { status: 'pass', verdict: `TOEFL ${score} meets minimum 60`,     applicantValue: `TOEFL ${score}` }
                                                                                      : { status: 'fail', verdict: `TOEFL ${score} — minimum 60 required`,  applicantValue: `TOEFL ${score}` };
                                        if (p.includes('PTE'))    return score >= 42  ? { status: 'pass', verdict: `PTE ${score} meets minimum 42`,        applicantValue: `PTE ${score}` }
                                                                                      : { status: 'fail', verdict: `PTE ${score} — minimum 42 required`,    applicantValue: `PTE ${score}` };
                                        if (p.includes('GCSE') && area.includes('english')) return { status: 'pass', verdict: 'GCSE English accepted', applicantValue: `GCSE English` };
                                        if (['NATIVE', 'FIRST LANGUAGE', 'UK', 'EXEMPT'].some(k => p.includes(k))) return { status: 'pass', verdict: 'Native/exempt — no test required', applicantValue: prof };
                                        return { status: 'review', verdict: `${prof} — manual verification needed`, applicantValue: `${prof}${score ? ` ${score}` : ''}` };
                                    }

                                    // ── 2. Academic / Entry Qualification ───────────────────────
                                    if (area.includes('entry') || area.includes('qualification') || area.includes('academic') || area.includes('minimum qual')) {
                                        const qual = (app.highest_qualification || '').toLowerCase();
                                        if (!qual) return { status: 'fail', verdict: 'No qualification recorded', applicantValue: '—' };
                                        const level3Plus = ['a-level', 'a level', 'as level', 'btec', 'nvq level 3', 'level 3', 'hnc', 'hnd', 'access to he', 'access to higher', 'foundation degree', 'fd ', 'degree', 'bachelor', 'bsc', 'ba ', 'msc', 'ma ', 'phd', 'pgce', 'diploma of higher', 'higher national'];
                                        if (level3Plus.some(q => qual.includes(q)))
                                            return { status: 'pass', verdict: 'Meets Level 3+ entry requirement', applicantValue: app.highest_qualification };
                                        // Below Level 3 — check if work experience may compensate
                                        const hasExp = (app.relevant_work_experience || '').trim().length > 20;
                                        if (hasExp)
                                            return { status: 'review', verdict: `${app.highest_qualification} is below Level 3 — work experience to be assessed`, applicantValue: app.highest_qualification };
                                        return { status: 'fail', verdict: `${app.highest_qualification} does not meet Level 3 entry requirement`, applicantValue: app.highest_qualification };
                                    }

                                    // ── 3. RPL / Prior Learning ──────────────────────────────────
                                    if (area.includes('rpl') || area.includes('prior learning') || area.includes('credit transfer')) {
                                        const exp = (app.relevant_work_experience || '').trim();
                                        if (exp.length > 20) return { status: 'review', verdict: 'Work/prior learning experience provided — RPL assessment required', applicantValue: exp.slice(0, 60) + (exp.length > 60 ? '…' : '') };
                                        return { status: 'review', verdict: 'No prior learning documented — RPL not applicable', applicantValue: '—' };
                                    }

                                    // ── 4. Enrolment Documentation ──────────────────────────────
                                    if (area.includes('documentation') || area.includes('enrolment doc') || area.includes('enrollment doc')) {
                                        const compStatus = (req.compliance_status || '').toLowerCase();
                                        if (compStatus === 'completed') return { status: 'pass', verdict: 'Documentation checklist completed', applicantValue: 'Completed' };
                                        return { status: 'review', verdict: 'ID, qualifications & visa to be verified at enrolment', applicantValue: 'Pending' };
                                    }

                                    // ── 5. Application Process / Offer Letter / Other process items
                                    return { status: 'review', verdict: 'Reviewed by admissions team', applicantValue: 'N/A' };
                                };

                                // ── Compute all results ────────────────────────────────────────
                                const results = section4.map(req => ({ req, check: gateCheck(req, selectedApp) }));
                                const failCount   = results.filter(r => r.check.status === 'fail').length;
                                const reviewCount = results.filter(r => r.check.status === 'review').length;
                                const passCount   = results.filter(r => r.check.status === 'pass').length;
                                const overallStatus = failCount > 0 ? 'fail' : reviewCount > 0 ? 'review' : 'pass';

                                const overallCfg = {
                                    fail:   { bg: 'bg-red-600',    badge: 'bg-red-100 text-red-800',     icon: '✗', label: 'INDUCTION SCRUTINY: FAILED',             sub: `${failCount} condition${failCount>1?'s':''} not met — application cannot proceed` },
                                    review: { bg: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-800', icon: '⚠', label: 'INDUCTION SCRUTINY: NEEDS REVIEW',         sub: `${passCount} passed · ${reviewCount} require manual verification` },
                                    pass:   { bg: 'bg-emerald-600',badge: 'bg-emerald-100 text-emerald-800', icon: '✓', label: 'INDUCTION SCRUTINY: ALL CONDITIONS MET', sub: `All ${passCount} admission requirements satisfied` },
                                };
                                const cfg = overallCfg[overallStatus];

                                const statusCfg = {
                                    pass:   { border: 'border-emerald-200', bg: 'bg-emerald-50',  icon: '✓', iconCls: 'text-emerald-600 bg-emerald-100', badge: 'text-emerald-700 font-bold' },
                                    fail:   { border: 'border-red-200',     bg: 'bg-red-50',      icon: '✗', iconCls: 'text-red-600 bg-red-100',         badge: 'text-red-700 font-bold' },
                                    review: { border: 'border-amber-200',   bg: 'bg-amber-50',    icon: '⚠', iconCls: 'text-amber-600 bg-amber-100',     badge: 'text-amber-700 font-bold' },
                                };

                                return (
                                    <div className="border border-purple-200 rounded-lg overflow-hidden">
                                        {/* Header */}
                                        <div className="bg-purple-700 px-4 py-2.5 flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                Induction Scrutiny Gate
                                            </h3>
                                            <span className="text-purple-200 text-xs">{inductionContext.course_code} Induction v{inductionContext.version}</span>
                                        </div>

                                        {/* Overall gate result banner */}
                                        <div className={`${cfg.bg} px-4 py-3 flex items-center gap-3`}>
                                            <span className="text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full bg-white/20 flex-shrink-0">{cfg.icon}</span>
                                            <div className="flex-1">
                                                <p className="text-white font-bold text-sm tracking-wide">{cfg.label}</p>
                                                <p className="text-white/80 text-xs mt-0.5">{cfg.sub}</p>
                                            </div>
                                            <div className="text-right text-xs text-white/70 flex-shrink-0">
                                                <div>{passCount} PASS</div>
                                                <div>{reviewCount} REVIEW</div>
                                                <div>{failCount} FAIL</div>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-3 bg-gray-50">
                                            {/* Section 4 — per-requirement results */}
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Section 4 — Admission &amp; Enrolment Conditions</p>
                                                <div className="space-y-2">
                                                    {results.map(({ req, check }, i) => {
                                                        const s = statusCfg[check.status];
                                                        return (
                                                            <div key={i} className={`rounded-lg border ${s.border} ${s.bg} p-3 flex gap-3 items-start`}>
                                                                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${s.iconCls}`}>{s.icon}</span>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <p className="text-sm font-semibold text-gray-800">{req.area}</p>
                                                                        {check.applicantValue && check.applicantValue !== 'N/A' && (
                                                                            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-white/70 border ${s.border} ${s.badge}`}>
                                                                                {check.applicantValue}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-0.5">{req.description}</p>
                                                                    <p className={`text-xs mt-1 font-medium ${s.badge}`}>{check.verdict}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Section 5 — Fee structure (informational) */}
                                            {section5.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Section 5 — Fee Structure (Informational)</p>
                                                    <div className="grid grid-cols-1 gap-1.5">
                                                        {section5.map((r, i) => (
                                                            <div key={i} className="bg-white rounded border border-gray-200 px-3 py-2 text-sm flex justify-between items-center">
                                                                <span className="font-medium text-gray-700">{r.area}</span>
                                                                <span className="text-xs text-gray-400">{r.description}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

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
                                        <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(selectedApp.submitted_at)}</p>
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

