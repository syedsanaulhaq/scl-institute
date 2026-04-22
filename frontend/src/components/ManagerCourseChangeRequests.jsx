import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    FileText,
    ArrowRightLeft,
    PauseCircle,
    LogOut,
    ChevronDown,
    ChevronUp,
    Send,
    Eye
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
    } catch {
        return 'N/A';
    }
};

const typeIcons = {
    'Transfer': ArrowRightLeft,
    'Deferral': PauseCircle,
    'Withdrawal': LogOut
};

const ManagerCourseChangeRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [reviewingId, setReviewingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [courses, setCourses] = useState([]);
    const [courseSearch, setCourseSearch] = useState('');
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);

    // Review form state
    const [reviewForm, setReviewForm] = useState({
        decision: '',
        committee_comments: '',
        rejection_reason: '',
        new_course_code: '',
        new_course_title: '',
        apply_moodle_changes: true,
        final_decision_confirmation: true
    });

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get(`${API_URL}/students/programmes`);
            if (response.data?.success) {
                setCourses(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching programmes:', err);
        }
    };

    const filteredCourses = courses.filter(c => {
        if (!courseSearch) return true;
        const term = courseSearch.toLowerCase();
        return c.course_code?.toLowerCase().includes(term) || c.course_title?.toLowerCase().includes(term);
    });

    const handleSelectCourse = (course) => {
        setReviewForm(f => ({ ...f, new_course_code: course.course_code, new_course_title: course.course_title }));
        setCourseSearch('');
        setShowCourseDropdown(false);
    };

    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError('');
            const params = {};
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const response = await axios.get(`${API_URL}/students/course-change-requests`, { params });
            if (response.data?.success) {
                setRequests(response.data.data || []);
            } else {
                setError('Failed to load course change requests');
            }
        } catch (err) {
            console.error('Error fetching course change requests:', err);
            setError('Error loading course change requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStartReview = (req) => {
        setReviewingId(req.id);
        setExpandedId(req.id);
        setCourseSearch('');
        setShowCourseDropdown(false);
        setReviewForm({
            decision: '',
            committee_comments: '',
            rejection_reason: '',
            new_course_code: '',
            new_course_title: '',
            apply_moodle_changes: true,
            final_decision_confirmation: true
        });
    };

    const handleSubmitReview = async (requestId) => {
        if (!reviewForm.decision) {
            alert('Please select a decision');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                decision: reviewForm.decision,
                reviewed_by: 'Manager',
                committee_comments: reviewForm.committee_comments,
                final_decision_confirmation: reviewForm.final_decision_confirmation,
                apply_moodle_changes: reviewForm.apply_moodle_changes
            };

            if (reviewForm.decision === 'Rejected') {
                payload.rejection_reason = reviewForm.rejection_reason;
            }

            if (reviewForm.decision === 'Approved' || reviewForm.decision === 'Approved with Conditions') {
                // For transfers, include new course info
                const req = requests.find(r => r.id === requestId);
                if (req?.type_of_request === 'Transfer') {
                    payload.new_course_code = reviewForm.new_course_code;
                    payload.new_course_title = reviewForm.new_course_title;
                }
            }

            const response = await axios.post(
                `${API_URL}/students/course-change-requests/${requestId}/review`,
                payload
            );

            if (response.data?.success) {
                setSuccessMsg(`Request #${requestId} has been ${reviewForm.decision.toLowerCase()} successfully.`);
                setReviewingId(null);
                setExpandedId(null);
                fetchRequests();
            } else {
                alert(response.data?.message || 'Failed to submit review');
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            alert(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (decision) => {
        if (!decision || decision === '') {
            return { label: 'Pending Review', style: 'bg-yellow-100 text-yellow-800', icon: Clock };
        }
        const map = {
            'Approved': { label: 'Approved', style: 'bg-green-100 text-green-800', icon: CheckCircle2 },
            'Approved with Conditions': { label: 'Approved (Conditions)', style: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
            'Rejected': { label: 'Rejected', style: 'bg-red-100 text-red-800', icon: XCircle },
            'Request More Information': { label: 'More Info Requested', style: 'bg-blue-100 text-blue-800', icon: AlertCircle }
        };
        return map[decision] || { label: decision, style: 'bg-gray-100 text-gray-800', icon: FileText };
    };

    const getTypeBadge = (type) => {
        const map = {
            'Transfer': 'bg-indigo-100 text-indigo-800',
            'Deferral': 'bg-amber-100 text-amber-800',
            'Withdrawal': 'bg-red-100 text-red-800'
        };
        return map[type] || 'bg-gray-100 text-gray-800';
    };

    const filteredRequests = requests.filter(req => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            req.first_name?.toLowerCase().includes(term) ||
            req.last_name?.toLowerCase().includes(term) ||
            req.email?.toLowerCase().includes(term) ||
            req.current_course_code?.toLowerCase().includes(term) ||
            req.type_of_request?.toLowerCase().includes(term)
        );
    });

    const pendingCount = requests.filter(r => !r.decision || r.decision === '').length;
    const approvedCount = requests.filter(r => r.decision === 'Approved' || r.decision === 'Approved with Conditions').length;
    const rejectedCount = requests.filter(r => r.decision === 'Rejected').length;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Course Change Requests</h1>
                <p className="text-gray-600 mt-2">Review and manage student transfer, deferral and withdrawal requests</p>
            </div>

            {/* Success Message */}
            {successMsg && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start justify-between">
                    <div className="flex items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-green-800 font-semibold">{successMsg}</p>
                    </div>
                    <button onClick={() => setSuccessMsg('')} className="text-green-600 hover:text-green-800 font-bold ml-4">✕</button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Requests</p>
                            <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Pending Review</p>
                            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Approved</p>
                            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Rejected</p>
                            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
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
                                placeholder="Search by student name, email, or course code..."
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
                            <option value="pending">Pending Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Request More Information">More Info Requested</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Requests List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">Loading requests...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No course change requests found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Current Course</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Effective Date</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submitted</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map((req) => {
                                    const status = getStatusBadge(req.decision);
                                    const StatusIcon = status.icon;
                                    const TypeIcon = typeIcons[req.type_of_request] || FileText;
                                    const isExpanded = expandedId === req.id;
                                    const isPending = !req.decision || req.decision === '';

                                    return (
                                        <tr key={req.id} className="border-b border-gray-200">
                                            <td colSpan={8} className="p-0">
                                                {/* Main Row */}
                                                <div className={`flex items-center px-6 py-4 cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-blue-50' : ''}`}
                                                     onClick={() => setExpandedId(isExpanded ? null : req.id)}>
                                                    <div className="w-12 text-sm text-gray-500 font-mono">#{req.id}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {req.first_name} {req.last_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{req.email}</p>
                                                    </div>
                                                    <div className="w-28">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(req.type_of_request)}`}>
                                                            <TypeIcon className="w-3 h-3" />
                                                            {req.type_of_request}
                                                        </span>
                                                    </div>
                                                    <div className="w-40 text-sm text-gray-700">
                                                        <span className="font-medium truncate block">{req.current_course_code || 'N/A'}</span>
                                                        {req.current_course_title && <span className="text-xs text-gray-500 truncate block">{req.current_course_title}</span>}
                                                    </div>
                                                    <div className="w-28 text-sm text-gray-600">{formatDate(req.effective_date)}</div>
                                                    <div className="w-28 text-sm text-gray-600">{formatDate(req.created_at)}</div>
                                                    <div className="w-36">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.style}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                    <div className="w-20 flex items-center gap-1">
                                                        {isPending ? (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleStartReview(req); }}
                                                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                                                            >
                                                                Review
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : req.id); }}
                                                                className="p-1 text-gray-500 hover:text-gray-700"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                                    </div>
                                                </div>

                                                {/* Expanded Detail Panel */}
                                                {isExpanded && (
                                                    <div className="px-6 pb-4 bg-gray-50 border-t border-gray-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                            {/* Left: Request Details */}
                                                            <div className="space-y-3">
                                                                <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Request Details</h3>
                                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                                    <span className="text-gray-500">Type:</span>
                                                                    <span className="font-medium">{req.type_of_request}</span>
                                                                    <span className="text-gray-500">Current Course:</span>
                                                                    <span className="font-medium">{req.current_course_code}</span>
                                                                    <span className="text-gray-500">Current Title:</span>
                                                                    <span className="font-medium">{req.current_course_title || 'N/A'}</span>
                                                                    <span className="text-gray-500">Study Mode:</span>
                                                                    <span className="font-medium">{req.current_study_mode || 'N/A'}</span>
                                                                    <span className="text-gray-500">Effective Date:</span>
                                                                    <span className="font-medium">{formatDate(req.effective_date)}</span>
                                                                    <span className="text-gray-500">Submitted:</span>
                                                                    <span className="font-medium">{formatDate(req.created_at)}</span>
                                                                </div>
                                                                {req.justification && (
                                                                    <div>
                                                                        <p className="text-gray-500 text-sm">Justification:</p>
                                                                        <p className="text-sm text-gray-800 bg-white p-2 rounded border mt-1">{req.justification}</p>
                                                                    </div>
                                                                )}
                                                                {req.digital_signature && (
                                                                    <div>
                                                                        <p className="text-gray-500 text-sm">Digital Signature:</p>
                                                                        <p className="text-sm text-gray-800 italic">{req.digital_signature}</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Right: Review / Decision */}
                                                            <div className="space-y-3">
                                                                {req.decision && req.decision !== '' && reviewingId !== req.id ? (
                                                                    <>
                                                                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Decision</h3>
                                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                                            <span className="text-gray-500">Decision:</span>
                                                                            <span className="font-medium">{req.decision}</span>
                                                                            <span className="text-gray-500">Reviewed By:</span>
                                                                            <span className="font-medium">{req.reviewed_by || 'N/A'}</span>
                                                                            <span className="text-gray-500">Review Date:</span>
                                                                            <span className="font-medium">{formatDate(req.review_date)}</span>
                                                                            {req.new_course_code && (
                                                                                <>
                                                                                    <span className="text-gray-500">New Course:</span>
                                                                                    <span className="font-medium">{req.new_course_code}{req.new_course_title ? ` — ${req.new_course_title}` : ''}</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        {req.committee_comments && (
                                                                            <div>
                                                                                <p className="text-gray-500 text-sm">Committee Comments:</p>
                                                                                <p className="text-sm text-gray-800 bg-white p-2 rounded border mt-1">{req.committee_comments}</p>
                                                                            </div>
                                                                        )}
                                                                        {req.rejection_reason && (
                                                                            <div>
                                                                                <p className="text-gray-500 text-sm">Rejection Reason:</p>
                                                                                <p className="text-sm text-red-700 bg-red-50 p-2 rounded border mt-1">{req.rejection_reason}</p>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : reviewingId === req.id ? (
                                                                    <>
                                                                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Submit Review</h3>
                                                                        <div className="space-y-3">
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Decision *</label>
                                                                                <select
                                                                                    value={reviewForm.decision}
                                                                                    onChange={(e) => setReviewForm(f => ({ ...f, decision: e.target.value }))}
                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                                                                >
                                                                                    <option value="">Select decision...</option>
                                                                                    <option value="Approved">Approve</option>
                                                                                    <option value="Approved with Conditions">Approve with Conditions</option>
                                                                                    <option value="Rejected">Reject</option>
                                                                                    <option value="Request More Information">Request More Information</option>
                                                                                </select>
                                                                            </div>

                                                                            {/* Transfer: new course fields */}
                                                                            {(reviewForm.decision === 'Approved' || reviewForm.decision === 'Approved with Conditions') && req.type_of_request === 'Transfer' && (
                                                                                <div className="space-y-2">
                                                                                    <div>
                                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Transfer To Programme *</label>
                                                                                        <div className="relative">
                                                                                            <input
                                                                                                type="text"
                                                                                                value={courseSearch || (reviewForm.new_course_code ? `${reviewForm.new_course_code} — ${reviewForm.new_course_title}` : '')}
                                                                                                onChange={(e) => {
                                                                                                    setCourseSearch(e.target.value);
                                                                                                    setShowCourseDropdown(true);
                                                                                                    if (!e.target.value) {
                                                                                                        setReviewForm(f => ({ ...f, new_course_code: '', new_course_title: '' }));
                                                                                                    }
                                                                                                }}
                                                                                                onFocus={() => setShowCourseDropdown(true)}
                                                                                                placeholder="Search by course code or name..."
                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                                                                            />
                                                                                            {showCourseDropdown && (
                                                                                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                                                                    {filteredCourses.length === 0 ? (
                                                                                                        <div className="px-3 py-2 text-sm text-gray-500">No courses found</div>
                                                                                                    ) : (
                                                                                                        filteredCourses.map((c) => (
                                                                                                            <button
                                                                                                                key={c.id}
                                                                                                                type="button"
                                                                                                                onClick={() => handleSelectCourse(c)}
                                                                                                                className={`w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-0 ${
                                                                                                                    reviewForm.new_course_code === c.course_code ? 'bg-blue-50 font-medium' : ''
                                                                                                                }`}
                                                                                                            >
                                                                                                                <span className="font-medium text-gray-900">{c.course_code}</span>
                                                                                                                <span className="text-gray-500 ml-2">— {c.course_title}</span>
                                                                                                            </button>
                                                                                                        ))
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        {reviewForm.new_course_code && (
                                                                                            <div className="mt-1 px-2 py-1 bg-blue-50 rounded text-xs text-blue-800">
                                                                                                Selected: <strong>{reviewForm.new_course_code}</strong> — {reviewForm.new_course_title}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={reviewForm.apply_moodle_changes}
                                                                                            onChange={(e) => setReviewForm(f => ({ ...f, apply_moodle_changes: e.target.checked }))}
                                                                                            className="rounded"
                                                                                        />
                                                                                        <label className="text-sm text-gray-600">Apply changes to Moodle LMS automatically</label>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Rejection reason */}
                                                                            {reviewForm.decision === 'Rejected' && (
                                                                                <div>
                                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                                                                                    <textarea
                                                                                        value={reviewForm.rejection_reason}
                                                                                        onChange={(e) => setReviewForm(f => ({ ...f, rejection_reason: e.target.value }))}
                                                                                        rows={2}
                                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                                                                        placeholder="Reason for rejection..."
                                                                                    />
                                                                                </div>
                                                                            )}

                                                                            <div>
                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                                                                                <textarea
                                                                                    value={reviewForm.committee_comments}
                                                                                    onChange={(e) => setReviewForm(f => ({ ...f, committee_comments: e.target.value }))}
                                                                                    rows={2}
                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                                                                    placeholder="Committee comments..."
                                                                                />
                                                                            </div>

                                                                            <div className="flex gap-2 pt-1">
                                                                                <button
                                                                                    onClick={() => handleSubmitReview(req.id)}
                                                                                    disabled={submitting || !reviewForm.decision}
                                                                                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                                                >
                                                                                    <Send className="w-4 h-4" />
                                                                                    {submitting ? 'Submitting...' : 'Submit Decision'}
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setReviewingId(null)}
                                                                                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full">
                                                                        <p className="text-gray-400 text-sm italic">No review submitted yet</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerCourseChangeRequests;

