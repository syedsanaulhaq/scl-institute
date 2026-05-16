import { useState, useEffect, useRef } from 'react';
import { FileText, CheckCircle, Clock, Upload, AlertCircle, Send, MessageSquare } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const fmtTime = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ---------- Student-facing threaded conversation ----------
const StudentReplyThread = ({ recordId, studentName, studentMessage, studentDate }) => {
    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(true);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        axios.get(`${API_URL}/support/admin/course-changes/${recordId}/replies`)
            .then(r => { if (!cancelled) setReplies(r.data.replies || []); })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoadingReplies(false); });
        return () => { cancelled = true; };
    }, [recordId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [replies]);

    const postReply = async () => {
        if (!draft.trim() || sending) return;
        setSending(true);
        try {
            const r = await axios.post(`${API_URL}/support/student/course-changes/${recordId}/replies`, {
                message: draft.trim(),
                sender_name: studentName || 'Student'
            });
            setReplies(prev => [...prev, r.data.reply]);
            setDraft('');
        } catch { /* ignore */ } finally { setSending(false); }
    };

    return (
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden mt-4">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">Conversation with Admin</span>
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {/* Student's opening message */}
                {studentMessage && (
                    <div className="flex gap-3 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {studentName?.charAt(0) || 'S'}
                        </div>
                        <div className="flex-1 flex flex-col items-end">
                            <div className="flex items-center gap-2 mb-1 flex-row-reverse">
                                <span className="text-xs font-semibold text-gray-700">You</span>
                                <span className="text-xs text-gray-400">{fmtTime(studentDate)}</span>
                            </div>
                            <div className="bg-blue-600 text-white rounded-xl rounded-tr-none px-3 py-2 text-sm max-w-md">
                                {studentMessage}
                            </div>
                        </div>
                    </div>
                )}

                {/* Thread replies */}
                {loadingReplies ? (
                    <p className="text-xs text-gray-400 text-center py-2">Loading…</p>
                ) : replies.length === 0 && !studentMessage ? (
                    <p className="text-xs text-gray-400 text-center py-4">No messages yet.</p>
                ) : (
                    replies.map(r => (
                        <div key={r.id} className={`flex gap-3 ${r.sender_type === 'student' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${r.sender_type === 'student' ? 'bg-blue-500' : 'bg-indigo-500'}`}>
                                {r.sender_name?.charAt(0) || '?'}
                            </div>
                            <div className={`flex-1 flex flex-col ${r.sender_type === 'student' ? 'items-end' : ''}`}>
                                <div className={`flex items-center gap-2 mb-1 ${r.sender_type === 'student' ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-xs font-semibold text-gray-700">
                                        {r.sender_type === 'student' ? 'You' : r.sender_name}
                                    </span>
                                    <span className="text-xs text-gray-400">{fmtTime(r.created_at)}</span>
                                </div>
                                <div className={`px-3 py-2 rounded-xl text-sm max-w-md ${r.sender_type === 'student' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                    {r.message}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
            {/* Reply composer */}
            <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
                <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); postReply(); } }}
                    placeholder="Reply to admin… (Ctrl+Enter to send)"
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                    onClick={postReply}
                    disabled={!draft.trim() || sending}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 flex items-center gap-1 self-end"
                >
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending…' : 'Reply'}
                </button>
            </div>
        </div>
    );
};
// ----------------------------------------------------------


const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export default function StudentCourseChanges({ user }) {
    const [applicationData, setApplicationData] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('new-request');
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        type_of_request: 'Deferral',
        current_study_mode: '',
        effective_date: '',
        justification: '',
        policy_confirmation: false,
        digital_signature: '',
        request_date: new Date().toISOString().split('T')[0],
        supporting_document: null
    });

    useEffect(() => {
        if (applicationData?.mode_of_study && !formData.current_study_mode) {
            setFormData(prev => ({ ...prev, current_study_mode: applicationData.mode_of_study }));
        }
    }, [applicationData?.mode_of_study]);

    useEffect(() => {
        fetchApplicationData();
    }, [user]);

    const fetchApplicationData = async () => {
        try {
            const response = await axios.get(`${API_URL}/students/applications`);
            if (response.data?.success) {
                const apps = response.data.data?.applications || [];
                const studentApp = apps.find(app => app.email === user?.email);
                setApplicationData(studentApp || apps[0] || null);
                
                if (studentApp?.id) {
                    fetchCourseChangeRequests(studentApp.id);
                }
            }
        } catch (error) {
            console.error('Error fetching application:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseChangeRequests = async (appId) => {
        try {
            const response = await axios.get(
                `${API_URL}/students/applications/${appId}/course-change-requests`
            );
            if (response.data?.success) {
                setRequests(response.data.data || []);
            }
        } catch (error) {
            console.log('No course change requests found');
        }
    };

    const handleSubmitRequest = async () => {
        if (!applicationData?.id) {
            alert('Application not found');
            return;
        }

        if (!formData.type_of_request || !formData.effective_date) {
            alert('Please fill in all required fields');
            return;
        }

        if (!formData.policy_confirmation) {
            alert('Please confirm you have read the policy');
            return;
        }

        if (!formData.digital_signature || formData.digital_signature.trim() === '') {
            alert('Please provide your signature');
            return;
        }

        try {
            setSubmitting(true);
            const payload = new FormData();
            payload.append('type_of_request', formData.type_of_request);
            payload.append('current_study_mode', formData.current_study_mode);
            payload.append('effective_date', formData.effective_date);
            payload.append('justification', formData.justification);
            payload.append('policy_confirmation', formData.policy_confirmation ? '1' : '0');
            payload.append('digital_signature', formData.digital_signature);
            payload.append('request_date', formData.request_date);
            if (formData.supporting_document) {
                payload.append('supporting_document', formData.supporting_document);
            }

            const response = await axios.post(
                `${API_URL}/students/applications/${applicationData.id}/course-change-request`,
                payload,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            if (response.data?.success) {
                alert('Course change request submitted successfully!');
                // Reset form
                setFormData({
                    type_of_request: 'Deferral',
                    current_study_mode: applicationData?.mode_of_study || '',
                    effective_date: '',
                    justification: '',
                    policy_confirmation: false,
                    digital_signature: '',
                    request_date: new Date().toISOString().split('T')[0],
                    supporting_document: null
                });
                // Refresh requests list
                await fetchCourseChangeRequests(applicationData.id);
                setActiveTab('my-requests');
            } else {
                alert('Failed to submit request: ' + (response.data?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Failed to submit request: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (decision) => {
        if (!decision) {
            return <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Pending Review</span>;
        }
        
        switch (decision) {
            case 'Approved':
                return <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Approved</span>;
            case 'Approved with Conditions':
                return <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Approved with Conditions</span>;
            case 'Rejected':
                return <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Rejected</span>;
            case 'Request More Information':
                return <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">More Info Needed</span>;
            default:
                return <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Pending</span>;
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Changes</h1>
                <p className="text-gray-600">Request deferral, withdrawal, or course transfer</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6 border-b border-gray-300">
                <button
                    onClick={() => setActiveTab('new-request')}
                    className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                        activeTab === 'new-request'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    New Request
                </button>
                <button
                    onClick={() => setActiveTab('my-requests')}
                    className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                        activeTab === 'my-requests'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    My Requests ({requests.length})
                </button>
            </div>

            {/* New Request Tab */}
            {activeTab === 'new-request' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Course Change Request</h2>

                    {/* Auto-filled Fields */}
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Student ID</p>
                            <p className="font-bold text-gray-900">{applicationData?.application_reference || applicationData?.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Student Name</p>
                            <p className="font-bold text-gray-900">{applicationData?.first_name} {applicationData?.last_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Course Title</p>
                            <p className="font-bold text-gray-900">{applicationData?.programme_name || applicationData?.course_title}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Course Start Date</p>
                            <p className="font-bold text-gray-900">{formatDate(applicationData?.intake_start_date)}</p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                        {/* Type of Request */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type of Request <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={formData.type_of_request}
                                onChange={(e) => setFormData(prev => ({ ...prev, type_of_request: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Deferral">Deferral</option>
                                <option value="Withdrawal">Withdrawal</option>
                                <option value="Transfer">Transfer</option>
                            </select>
                        </div>

                        {/* Current Study Mode */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Study Mode
                            </label>
                            <select
                                value={formData.current_study_mode}
                                onChange={(e) => setFormData(prev => ({ ...prev, current_study_mode: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select study mode</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Online">Online</option>
                                <option value="Blended">Blended</option>
                            </select>
                        </div>

                        {/* Effective Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Effective Date of Change <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.effective_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Justification */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Justification for Request <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                value={formData.justification}
                                onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
                                placeholder="Please provide detailed justification for your request..."
                                rows="5"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Supporting Documents */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Supporting Documents
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    onChange={(e) => setFormData(prev => ({ ...prev, supporting_document: e.target.files?.[0] || null }))}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="block w-full text-sm text-gray-600"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG (max 10MB)</p>
                        </div>

                        {/* Digital Signature */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Digital Signature / Your Name <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.digital_signature}
                                onChange={(e) => setFormData(prev => ({ ...prev, digital_signature: e.target.value }))}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Request Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Request
                            </label>
                            <input
                                type="date"
                                value={formData.request_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, request_date: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Policy Confirmation */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.policy_confirmation}
                                    onChange={(e) => setFormData(prev => ({ ...prev, policy_confirmation: e.target.checked }))}
                                    className="w-5 h-5 rounded mt-0.5"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        I confirm that I have read and understood the policy on withdrawals/deferrals/transfers
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        By checking this box, you acknowledge that you understand the implications of this course change request.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => window.history.back()}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitRequest}
                                disabled={submitting}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                    submitting
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                <Send className="w-5 h-5" />
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* My Requests Tab */}
            {activeTab === 'my-requests' && (
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">No course change requests submitted yet</p>
                            <button
                                onClick={() => setActiveTab('new-request')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Submit a Request
                            </button>
                        </div>
                    ) : (
                        requests.map((request) => (
                            <div key={request.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{request.type_of_request} Request</h3>
                                        <p className="text-sm text-gray-600 mt-1">Submitted on {formatDate(request.created_at)}</p>
                                    </div>
                                    {getStatusBadge(request.decision)}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Type of Request</p>
                                        <p className="font-medium text-gray-900">{request.type_of_request}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Effective Date</p>
                                            <p className="font-medium text-gray-900">{formatDate(request.effective_date)}</p>
                                    </div>
                                        {request.supporting_document && (
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-600 mb-1">Supporting Document</p>
                                                <a
                                                    href={`${API_URL.replace('/api', '')}${request.supporting_document}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 hover:underline text-sm"
                                                >
                                                    View document
                                                </a>
                                            </div>
                                        )}
                                    {request.justification && (
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-600 mb-1">Justification</p>
                                            <p className="text-gray-900 text-sm">{request.justification}</p>
                                        </div>
                                    )}
                                </div>

                                {request.decision && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h4 className="font-bold text-gray-900 mb-2">Review Decision</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Decision:</strong> {request.decision}</p>
                                            {request.reviewed_by && <p><strong>Reviewed By:</strong> {request.reviewed_by}</p>}
                                            {request.review_date && <p><strong>Review Date:</strong> {formatDate(request.review_date)}</p>}
                                            {request.rejection_reason && <p><strong>Reason:</strong> {request.rejection_reason}</p>}
                                            {request.committee_comments && (
                                                <p><strong>Comments:</strong> {request.committee_comments}</p>
                                            )}
                                            {typeof request.final_decision_confirmation !== 'undefined' && (
                                                <p><strong>Final Decision Confirmation:</strong> {request.final_decision_confirmation ? 'Confirmed' : 'Pending'}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <StudentReplyThread
                                    recordId={request.id}
                                    studentName={`${applicationData?.first_name || ''} ${applicationData?.last_name || ''}`.trim()}
                                    studentMessage={request.justification}
                                    studentDate={request.created_at}
                                />
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
