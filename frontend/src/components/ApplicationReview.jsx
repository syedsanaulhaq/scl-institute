import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    CheckCircle2, 
    XCircle, 
    AlertCircle,
    Save,
    Loader2
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
    }, [id]);

    const fetchApplication = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${API_URL}/students/applications/${id}`);
            
            if (response.data?.success) {
                setApplication(response.data.data);
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
                `${API_URL}/students/applications/${id}/review`,
                reviewData
            );

            if (response.data?.success) {
                setSuccess('Application review submitted successfully!');
                setTimeout(() => {
                    navigate('/applications');
                }, 2000);
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Details</h2>
                        
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Reference Number</p>
                                <p className="text-lg font-semibold text-gray-900">{application.application_reference}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Submitted Date</p>
                                <p className="text-lg font-semibold text-gray-900">{new Date(application.submitted_at).toLocaleDateString()}</p>
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
                                    <p className="font-medium text-gray-900">{application.date_of_birth}</p>
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

                        {/* Course Information */}
                        <div className="border-t pt-6 mt-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Course Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Course Title</p>
                                    <p className="font-medium text-gray-900">{application.course_title}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Course Code</p>
                                    <p className="font-medium text-gray-900">{application.course_code}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Course Type</p>
                                    <p className="font-medium text-gray-900">{application.course_type}</p>
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
                                    <p className="font-medium text-gray-900">{application.intake_start_date}</p>
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
                                    <p className="font-medium text-gray-900">{application.year_completed}</p>
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
                                <p className="text-green-800 text-sm flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    {success}
                                </p>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Applied For (Auto-filled)</label>
                                <input
                                    type="text"
                                    value={application.course_title}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Application (Auto-filled)</label>
                                <input
                                    type="date"
                                    value={new Date(application.submitted_at).toISOString().split('T')[0]}
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
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Submit Review
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationReview;
