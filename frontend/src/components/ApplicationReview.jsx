import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    CheckCircle2, 
    XCircle, 
    AlertCircle,
    Save,
    Loader2,
    Copy,
    Check,
    X,
    Upload,
    Trash2,
    FileAudio,
    Play
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ApplicationReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [successData, setSuccessData] = useState(null);
    const [copiedField, setCopiedField] = useState(null);
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Interview recordings state
    const [recordings, setRecordings] = useState([]);
    const [recordingUploading, setRecordingUploading] = useState(false);
    const [recordingDate, setRecordingDate] = useState('');
    const [recordingTime, setRecordingTime] = useState('');

    // Safe date formatter
    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    const formatDisplayDate = (dateValue) => {
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

    // Review form state
    const [review, setReview] = useState({
        reviewer_name: '',
        review_date: new Date().toISOString().split('T')[0],
        documents_verified: '',
        eligibility_check: '',
        interview_conducted: '',
        interview_outcome: '',
        english_requirement_met: '',
        additional_notes: '',
        decision: '',
        reason_for_refusal: '',
        detailed_comments: '',
        committee_chair_name: '',
        final_decision_date: '',
        final_decision_confirmation: false
    });

    useEffect(() => {
        fetchApplication();
        fetchExistingReview();
        fetchRecordings();
    }, [id]);

    // Interview recordings CRUD
    const fetchRecordings = async () => {
        try {
            const res = await axios.get(`${API_URL}/students/applications/${id}/interview-recordings`);
            if (res.data?.success) setRecordings(res.data.data || []);
        } catch (err) {
            console.warn('Could not load recordings:', err.message);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleUploadRecording = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!recordingDate) {
            setError('Please select a recording date before uploading');
            return;
        }
        try {
            setRecordingUploading(true);
            const recordedAt = recordingTime
                ? `${recordingDate}T${recordingTime}:00`
                : `${recordingDate}T00:00:00`;
            const form = new FormData();
            form.append('recording', file);
            form.append('recorded_at', recordedAt);
            form.append('uploaded_by', review.reviewer_name || 'Reviewer');
            await axios.post(`${API_URL}/students/applications/${id}/interview-recordings`, form);
            await fetchRecordings();
            setRecordingDate('');
            setRecordingTime('');
        } catch (err) {
            setError('Failed to upload recording: ' + (err.response?.data?.message || err.message));
        } finally {
            setRecordingUploading(false);
        }
    };

    const handleDeleteRecording = async (recId) => {
        if (!window.confirm('Delete this recording?')) return;
        try {
            await axios.delete(`${API_URL}/students/applications/${id}/interview-recordings/${recId}`);
            await fetchRecordings();
        } catch (err) {
            setError('Failed to delete recording: ' + err.message);
        }
    };

    const fetchExistingReview = async () => {
        try {
            console.log(`[FETCH REVIEW] Loading review for app ID ${id}`);
            const response = await axios.get(`${API_URL}/students/applications/${id}/review`);
            console.log('[FETCH REVIEW] Response:', response.data);
            
            if (response.data?.success && response.data?.data) {
                const existingData = response.data.data;
                console.log('[FETCH REVIEW] Found existing review:', existingData);
                setExistingReview(existingData);
                setIsEditMode(true);
                
                // Parse review_notes if it's JSON (stored review data)
                if (existingData.review_notes) {
                    try {
                        let parsedNotes;
                        
                        // Try to parse as JSON
                        if (typeof existingData.review_notes === 'string') {
                            try {
                                parsedNotes = JSON.parse(existingData.review_notes);
                            } catch (parseErr) {
                                // If not valid JSON, treat as empty object
                                console.log('[FETCH REVIEW] review_notes is not JSON, skipping parse');
                                parsedNotes = {};
                            }
                        } else {
                            parsedNotes = existingData.review_notes;
                        }
                        
                        console.log('[FETCH REVIEW] Parsed notes:', parsedNotes);
                        
                        setReview(prev => ({
                            ...prev,
                            reviewer_name: parsedNotes.reviewer_name || '',
                            review_date: formatDate(parsedNotes.review_date) || new Date().toISOString().split('T')[0],
                            documents_verified: parsedNotes.documents_verified || '',
                            eligibility_check: parsedNotes.eligibility_check || '',
                            interview_conducted: parsedNotes.interview_conducted || '',
                            interview_outcome: parsedNotes.interview_outcome || '',
                            english_requirement_met: parsedNotes.english_requirement_met || '',
                            additional_notes: parsedNotes.additional_notes || '',
                            decision: parsedNotes.decision || '',
                            reason_for_refusal: parsedNotes.reason_for_refusal || '',
                            detailed_comments: parsedNotes.detailed_comments || '',
                            committee_chair_name: parsedNotes.committee_chair_name || '',
                            final_decision_date: formatDate(parsedNotes.final_decision_date) || '',
                            final_decision_confirmation: parsedNotes.final_decision_confirmation || false
                        }));
                    } catch (e) {
                        console.error('[FETCH REVIEW] Unexpected error:', e);
                    }
                } else {
                    console.log('[FETCH REVIEW] No review_notes found in data');
                }
            } else {
                console.log('[FETCH REVIEW] No existing review data found (data is null)');
                setIsEditMode(false);
            }
        } catch (err) {
            console.error('[FETCH REVIEW] Error fetching review:', err);
            setIsEditMode(false);
        }
    };

    const fetchApplication = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${API_URL}/students/applications/${id}`);
            
            if (response.data?.success) {
                // Backend returns data.application, not just data
                setApplication(response.data.data?.application || response.data.data);
            } else {
                setError('Failed to load application');
            }
        } catch (err) {
            console.error('Error fetching application:', err);
            setError('Error loading application details');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewChange = (field, value) => {
        setReview(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear reason for refusal if decision is not "Refusal"
        if (field === 'decision' && value !== 'Refusal') {
            setReview(prev => ({
                ...prev,
                reason_for_refusal: ''
            }));
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleCloseCredentialsModal = () => {
        setShowCredentialsModal(false);
        setTimeout(() => {
            navigate('/applications');
        }, 500);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!review.reviewer_name || !review.decision) {
            setError('Please fill in all required fields (Reviewer Name and Decision)');
            return;
        }

        if (review.decision === 'Refusal' && !review.reason_for_refusal) {
            setError('Please provide a reason for refusal');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            
            const reviewData = {
                application_id: id,
                ...review
            };

            // Save review to backend
            const response = await axios.post(
                `${API_URL}/students/applications/${id}/review-decision`,
                reviewData
            );

            if (response.data?.success) {
                setSuccess('Application review submitted successfully!');
                if (response.data?.data?.student_credentials) {
                    setSuccessData(response.data.data.student_credentials);
                    setShowCredentialsModal(true);
                } else {
                    setTimeout(() => {
                        navigate('/applications');
                    }, 2000);
                }
            } else {
                setError(response.data?.message || 'Failed to submit review');
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err.response?.data?.message || 'Error submitting review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600">Loading application...</p>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="p-8">
                <button
                    onClick={() => navigate('/applications')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Applications
                </button>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Application not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <button
                onClick={() => navigate('/applications')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Applications
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Application Details - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Application Overview */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                            {isEditMode && (
                                <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1 text-sm font-medium text-blue-800">
                                    Edit Review
                                </div>
                            )}
                            {!isEditMode && (
                                <div className="bg-green-50 border border-green-200 rounded px-3 py-1 text-sm font-medium text-green-800">
                                    Add Review
                                </div>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Reference Number</p>
                                <p className="text-lg font-semibold text-gray-900">{application.application_reference}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Submitted Date</p>
                                <p className="text-lg font-semibold text-gray-900">{formatDisplayDate(application.submitted_at)}</p>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="border-t pt-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Full Name</p>
                                    <p className="font-medium text-gray-900">{application.first_name} {application.middle_names} {application.last_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Date of Birth</p>
                                    <p className="font-medium text-gray-900">{formatDisplayDate(application.date_of_birth)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Email</p>
                                    <p className="font-medium text-blue-600">{application.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Phone</p>
                                    <p className="font-medium text-gray-900">{application.contact_number}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Gender</p>
                                    <p className="font-medium text-gray-900">{application.gender}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Nationality</p>
                                    <p className="font-medium text-gray-900">{application.nationality}</p>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="border-t pt-6 mt-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Address</h3>
                            <div className="text-sm text-gray-900 space-y-1">
                                <p>{application.address_line1}</p>
                                {application.address_line2 && <p>{application.address_line2}</p>}
                                <p>{application.town_city}, {application.postcode}</p>
                                <p>{application.country_of_residence}</p>
                            </div>
                        </div>

                        {/* Programme Information */}
                        <div className="border-t pt-6 mt-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Programme Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Programme Type</p>
                                    <p className="font-medium text-gray-900">{application.programme_type_name || application.course_type || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Programme Name</p>
                                    <p className="font-medium text-gray-900">{application.program_name || application.course_title || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Intake</p>
                                    <p className="font-medium text-gray-900">{application.intake_label || '—'}{application.intake_course_count > 0 && (<span className="ml-1 text-gray-500">({application.intake_course_count} courses)</span>)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Mode of Study</p>
                                    <p className="font-medium text-gray-900">{application.mode_of_study}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Entry Route</p>
                                    <p className="font-medium text-gray-900">{application.entry_route}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Start Date</p>
                                    <p className="font-medium text-gray-900">{formatDisplayDate(application.intake_start_date)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Academic Background */}
                        <div className="border-t pt-6 mt-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Academic Background</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Highest Qualification</p>
                                    <p className="font-medium text-gray-900">{application.highest_qualification}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Institution</p>
                                    <p className="font-medium text-gray-900">{application.institution_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Year Completed</p>
                                    <p className="font-medium text-gray-900">{formatDisplayDate(application.year_completed)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">English Proficiency</p>
                                    <p className="font-medium text-gray-900">{application.english_proficiency} ({application.english_score})</p>
                                </div>
                            </div>
                            {application.relevant_work_experience && (
                                <div className="mt-4">
                                    <p className="text-gray-600 text-sm">Work Experience</p>
                                    <p className="font-medium text-gray-900">{application.relevant_work_experience}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Review Form - Right Side */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Application Review</h2>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 text-sm flex items-center gap-2 mb-3">
                                    <CheckCircle2 className="w-4 h-4" />
                                    {success}
                                </p>
                                
                                {successData && (
                                    <div className="mt-4 p-4 bg-white rounded border border-green-200 space-y-3">
                                        <p className="text-sm font-semibold text-gray-900 mb-3">Ã°Å¸â€œâ€¹ Student Credentials</p>
                                        
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                            <div>
                                                <p className="text-xs text-gray-600">Email/Username</p>
                                                <p className="font-mono text-sm text-gray-900">{successData.email}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(successData.email, 'email')}
                                                className="p-2 hover:bg-gray-200 rounded transition-colors"
                                                title="Copy email"
                                            >
                                                {copiedField === 'email' ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-gray-600" />
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                            <div>
                                                <p className="text-xs text-gray-600">Temporary Password</p>
                                                <p className="font-mono text-sm font-bold text-gray-900">{successData.temporary_password}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(successData.temporary_password, 'password')}
                                                className="p-2 hover:bg-gray-200 rounded transition-colors"
                                                title="Copy password"
                                            >
                                                {copiedField === 'password' ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-gray-600" />
                                                )}
                                            </button>
                                        </div>

                                        <p className="text-xs text-gray-600 italic mt-2">
                                            Ã¢â€œËœ {successData.note}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            {/* Auto-filled Fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Application ID (Auto-filled)</label>
                                <input
                                    type="text"
                                    value={application.application_reference}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Applicant Name (Auto-filled)</label>
                                <input
                                    type="text"
                                    value={`${application.first_name} ${application.last_name}`}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Programme Applied For (Auto-filled)</label>
                                <input
                                    type="text"
                                    value={application.program_name || application.course_title || ''}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Application (Auto-filled)</label>
                                <input
                                    type="date"
                                    value={formatDate(application.submitted_at)}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                />
                            </div>

                            <hr className="my-4" />

                            {/* Reviewer Fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Name *</label>
                                <input
                                    type="text"
                                    value={review.reviewer_name}
                                    onChange={(e) => handleReviewChange('reviewer_name', e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Review Date</label>
                                <input
                                    type="date"
                                    value={review.review_date}
                                    onChange={(e) => handleReviewChange('review_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Documents Verified?</label>
                                <select
                                    value={review.documents_verified}
                                    onChange={(e) => handleReviewChange('documents_verified', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select...</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Check</label>
                                <select
                                    value={review.eligibility_check}
                                    onChange={(e) => handleReviewChange('eligibility_check', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select...</option>
                                    <option value="Meets criteria">Meets criteria</option>
                                    <option value="Does not meet criteria">Does not meet criteria</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Conducted?</label>
                                <select
                                    value={review.interview_conducted}
                                    onChange={(e) => handleReviewChange('interview_conducted', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select...</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    <option value="Not Required">Not Required</option>
                                </select>
                            </div>

                            {review.interview_conducted === 'Yes' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Outcome</label>
                                    <select
                                        value={review.interview_outcome}
                                        onChange={(e) => handleReviewChange('interview_outcome', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select...</option>
                                        <option value="Pass">Pass</option>
                                        <option value="Fail">Fail</option>
                                    </select>
                                </div>
                            )}

                            {/* Interview Record Files */}
                            {review.interview_conducted === 'Yes' && (
                                <div className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-indigo-800 flex items-center gap-2">
                                        <FileAudio className="w-4 h-4" /> Interview Record Files
                                    </h4>

                                    {/* Upload controls */}
                                    <div className="flex flex-wrap items-end gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Recording Date *</label>
                                            <input
                                                type="date"
                                                value={recordingDate}
                                                onChange={e => setRecordingDate(e.target.value)}
                                                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Recording Time</label>
                                            <input
                                                type="time"
                                                value={recordingTime}
                                                onChange={e => setRecordingTime(e.target.value)}
                                                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400"
                                            />
                                        </div>
                                        <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition ${
                                            recordingUploading
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        }`}>
                                            {recordingUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            {recordingUploading ? 'Uploading...' : 'Upload Recording'}
                                            <input
                                                type="file"
                                                accept="audio/*,video/mp4,video/webm"
                                                className="hidden"
                                                onChange={handleUploadRecording}
                                                disabled={recordingUploading}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">Accepted: MP3, WAV, OGG, AAC, M4A, MP4, WebM â€” max 100 MB</p>

                                    {/* Recordings list */}
                                    {recordings.length > 0 ? (
                                        <div className="space-y-2 mt-2">
                                            {recordings.map(rec => (
                                                <div key={rec.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                                                    <div className="bg-indigo-100 rounded-lg p-2 flex-shrink-0">
                                                        <FileAudio className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{rec.original_filename}</p>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                            <span>{new Date(rec.recorded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            <span>{new Date(rec.recorded_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            <span>{formatFileSize(rec.file_size)}</span>
                                                            {rec.uploaded_by && <span>by {rec.uploaded_by}</span>}
                                                        </div>
                                                        {rec.mime_type?.startsWith('audio/') && (
                                                            <audio controls preload="none" className="mt-2 w-full h-8" style={{ maxWidth: 400 }}>
                                                                <source src={`${API_URL.replace('/api', '')}${rec.file_path}`} type={rec.mime_type} />
                                                            </audio>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <a
                                                            href={`${API_URL.replace('/api', '')}${rec.file_path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"
                                                            title="Play / Download"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDeleteRecording(rec.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">No interview recordings uploaded yet.</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">English Language Requirement Met?</label>
                                <select
                                    value={review.english_requirement_met}
                                    onChange={(e) => handleReviewChange('english_requirement_met', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select...</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    <option value="Not Applicable">Not Applicable</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes from Reviewer</label>
                                <textarea
                                    value={review.additional_notes}
                                    onChange={(e) => handleReviewChange('additional_notes', e.target.value)}
                                    placeholder="Add any additional notes..."
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Decision *</label>
                                <select
                                    value={review.decision}
                                    onChange={(e) => handleReviewChange('decision', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                                >
                                    <option value="">Select...</option>
                                    <option value="Offer">Offer</option>
                                    <option value="Conditional Offer">Conditional Offer</option>
                                    <option value="Refusal">Refusal</option>
                                    <option value="Waitlist">Waitlist</option>
                                </select>
                            </div>

                            {review.decision === 'Refusal' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Refusal *</label>
                                    <select
                                        value={review.reason_for_refusal}
                                        onChange={(e) => handleReviewChange('reason_for_refusal', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select...</option>
                                        <option value="Academic criteria not met">Academic criteria not met</option>
                                        <option value="English language requirement not met">English language requirement not met</option>
                                        <option value="Insufficient documents">Insufficient documents</option>
                                        <option value="Did not pass interview">Did not pass interview</option>
                                        <option value="Course full">Course full</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Comments / Justification</label>
                                <textarea
                                    value={review.detailed_comments}
                                    onChange={(e) => handleReviewChange('detailed_comments', e.target.value)}
                                    placeholder="Provide detailed justification for your decision..."
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Committee Chair Name</label>
                                <input
                                    type="text"
                                    value={review.committee_chair_name}
                                    onChange={(e) => handleReviewChange('committee_chair_name', e.target.value)}
                                    placeholder="Enter chair name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Final Decision Date</label>
                                <input
                                    type="date"
                                    value={review.final_decision_date}
                                    onChange={(e) => handleReviewChange('final_decision_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="confirmation"
                                    checked={review.final_decision_confirmation}
                                    onChange={(e) => handleReviewChange('final_decision_confirmation', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label htmlFor="confirmation" className="ml-2 text-sm text-gray-700">
                                    I confirm this review decision
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition-colors"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {isEditMode ? 'Updating...' : 'Submitting...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {isEditMode ? 'Update Review' : 'Submit Review'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Credentials Modal Popup */}
            {showCredentialsModal && successData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-0 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <CheckCircle2 className="w-6 h-6" />
                                    Approval Successful!
                                </h3>
                                <p className="text-green-100 text-sm mt-1">Student account created and ready to use</p>
                            </div>
                            <button
                                onClick={handleCloseCredentialsModal}
                                className="text-white hover:bg-green-600 p-2 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <p className="text-gray-700 font-medium">Ã°Å¸â€œâ€¹ Share These Credentials with the Student:</p>

                            {/* Email Box */}
                            <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4">
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Email / Username</p>
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-mono text-lg font-bold text-gray-900 break-all">{successData.email}</p>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(successData.email, 'email')}
                                        className="flex-shrink-0 p-2 bg-white hover:bg-blue-100 border border-gray-300 rounded-lg transition-colors"
                                        title="Copy email"
                                    >
                                        {copiedField === 'email' ? (
                                            <Check className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-blue-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Password Box */}
                            <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4">
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Temporary Password</p>
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-mono text-lg font-bold text-gray-900 break-all">{successData.temporary_password}</p>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(successData.temporary_password, 'password')}
                                        className="flex-shrink-0 p-2 bg-white hover:bg-blue-100 border border-gray-300 rounded-lg transition-colors"
                                        title="Copy password"
                                    >
                                        {copiedField === 'password' ? (
                                            <Check className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-blue-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Note */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                                <p className="font-medium mb-1">Ã¢â€žÂ¹Ã¯Â¸Â Important Notes:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>{successData.note}</li>
                                    <li>Student will receive a notification in their portal</li>
                                    <li>Login portal: http://localhost:3000/student/login</li>
                                </ul>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t flex gap-3">
                            <button
                                onClick={() => copyToClipboard(`Email: ${successData.email}\nPassword: ${successData.temporary_password}`, 'both')}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                            >
                                Copy Both
                            </button>
                            <button
                                onClick={handleCloseCredentialsModal}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
                            >
                                Done - Go Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationReview;

