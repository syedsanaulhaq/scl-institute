import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Clock, FileText, Search, ShieldAlert, ShieldCheck, UserPlus, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-GB');
};

const getStatusClasses = (status) => {
    switch (status) {
        case 'accepted':
            return 'bg-green-100 text-green-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        case 'under_review':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-blue-100 text-blue-800';
    }
};

const TeacherRegistrationRequests = ({ user }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [reviewerNotes, setReviewerNotes] = useState('');
    const [submittingDecision, setSubmittingDecision] = useState(false);
    const [decisionModal, setDecisionModal] = useState(null);
    const [copyStatus, setCopyStatus] = useState('');

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${API_URL}/students/teacher-registrations`, {
                params: {
                    status: statusFilter,
                    search: searchTerm || undefined
                }
            });

            if (response.data?.success) {
                const rows = response.data.data?.registrations || [];
                setRegistrations(rows);
                const highlight = searchParams.get('highlight');
                if (highlight) {
                    const match = rows.find((row) => row.registration_reference === highlight);
                    setSelectedId(match?.id || rows[0]?.id || null);
                } else if (!selectedId && rows.length > 0) {
                    setSelectedId(rows[0].id);
                }
            } else {
                setError('Failed to load teacher registrations.');
            }
        } catch (fetchError) {
            console.error('Failed to load teacher registrations:', fetchError);
            setError('Failed to load teacher registrations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, [statusFilter]);

    const filteredRegistrations = useMemo(() => {
        if (!searchTerm) return registrations;
        const normalized = searchTerm.toLowerCase();
        return registrations.filter((registration) =>
            [
                registration.first_name,
                registration.last_name,
                registration.email,
                registration.registration_reference,
                registration.selected_course_title,
                registration.selected_course_code
            ].some((value) => String(value || '').toLowerCase().includes(normalized))
        );
    }, [registrations, searchTerm]);

    useEffect(() => {
        if (!selectedId && filteredRegistrations.length > 0) {
            setSelectedId(filteredRegistrations[0].id);
        }
        if (selectedId && !filteredRegistrations.some((registration) => registration.id === selectedId)) {
            setSelectedId(filteredRegistrations[0]?.id || null);
        }
    }, [filteredRegistrations, selectedId]);

    const selectedRegistration = filteredRegistrations.find((registration) => registration.id === selectedId) || null;

    // ── Teacher qualification gate ──────────────────────────────────
    const teacherGate = useMemo(() => {
        if (!selectedRegistration) return null;
        const qual = (selectedRegistration.highest_qualification || '').toLowerCase();
        const years = parseInt(selectedRegistration.years_of_experience) || 0;

        const checks = [];

        // Qualification check — must be Level 6+ (degree or above)
        const level6Plus = ['degree','bachelor','bsc','ba ','llb','beng','bmed','msc','ma ','mba','meng','llm','pgce','pgcert','pgdip','phd','doctorate','dphil','doctor'];
        const level5 = ['hnc','hnd','foundation degree','fd '];
        const qualOk = level6Plus.some(q => qual.includes(q));
        const qualReview = !qualOk && level5.some(q => qual.includes(q));

        if (qualOk) {
            checks.push({ status: 'pass', label: 'Qualification', verdict: `${selectedRegistration.highest_qualification} meets Level 6+ requirement` });
        } else if (qualReview) {
            checks.push({ status: 'review', label: 'Qualification', verdict: `${selectedRegistration.highest_qualification} (Level 5) — may qualify with 5+ years' experience` });
        } else if (!qual) {
            checks.push({ status: 'fail', label: 'Qualification', verdict: 'No qualification recorded' });
        } else {
            checks.push({ status: 'fail', label: 'Qualification', verdict: `${selectedRegistration.highest_qualification} does not meet minimum Level 6 (degree) requirement` });
        }

        // Experience check — minimum 2 years
        if (years >= 5) {
            checks.push({ status: 'pass', label: 'Experience', verdict: `${years} years — exceeds 2-year minimum` });
        } else if (years >= 2) {
            checks.push({ status: 'pass', label: 'Experience', verdict: `${years} years meets minimum requirement` });
        } else if (years === 1) {
            checks.push({ status: 'review', label: 'Experience', verdict: '1 year — below 2-year minimum, exceptional approval may apply' });
        } else {
            checks.push({ status: 'fail', label: 'Experience', verdict: `${years || 0} years does not meet 2-year minimum teaching/industry experience` });
        }

        const failCount   = checks.filter(c => c.status === 'fail').length;
        const reviewCount = checks.filter(c => c.status === 'review').length;
        const passCount   = checks.filter(c => c.status === 'pass').length;
        const overall = failCount > 0 ? 'fail' : reviewCount > 0 ? 'review' : 'pass';
        return { checks, failCount, reviewCount, passCount, overall };
    }, [selectedRegistration]);

    const handleDecision = async (decision) => {
        if (!selectedRegistration) return;

        // Block approval if teacher gate failed
        if (decision === 'accepted' && teacherGate?.overall === 'fail') {
            setError(`Cannot approve: ${teacherGate.failCount} teacher qualification requirement(s) not met. Add justification in reviewer notes if overriding.`);
            return;
        }

        try {
            setSubmittingDecision(true);
            const response = await axios.post(`${API_URL}/students/teacher-registrations/${selectedRegistration.id}/decision`, {
                decision,
                reviewer_name: user?.name || user?.email || 'Admissions Team',
                reviewer_notes: reviewerNotes
            });

            const payload = response.data?.data || {};
            setDecisionModal({
                decision,
                message: response.data?.message || `Teacher registration ${decision}`,
                registration: selectedRegistration,
                loginDetails: payload.login_details || null,
                moodleAssignment: payload.moodle_assignment || null
            });

            setReviewerNotes('');
            await fetchRegistrations();
        } catch (decisionError) {
            console.error(`Failed to ${decision} teacher registration:`, decisionError);
            setError(decisionError.response?.data?.message || `Failed to ${decision} teacher registration.`);
        } finally {
            setSubmittingDecision(false);
        }
    };

    const handleCopyCredentials = async () => {
        if (!decisionModal?.loginDetails) return;

        const details = decisionModal.loginDetails;
        const teacherName = `${decisionModal.registration?.first_name || ''} ${decisionModal.registration?.last_name || ''}`.trim();
        const copyText = [
            `Teacher Login Details${teacherName ? ` - ${teacherName}` : ''}`,
            `Email: ${details.email || 'N/A'}`,
            `Password: ${details.password || 'Existing password (not changed)'}`,
            `Role: ${details.role || 'teacher'}`,
            `Portal Login: ${details.portal_login_url || 'N/A'}`,
            `Moodle URL: ${details.moodle_url || 'N/A'}`,
            `Assigned Course: ${details.moodle_course_title || 'N/A'} (${details.moodle_course_code || 'N/A'})`
        ].join('\n');

        try {
            await navigator.clipboard.writeText(copyText);
            setCopyStatus('Credentials copied');
            setTimeout(() => setCopyStatus(''), 2000);
        } catch (err) {
            console.error('Failed to copy credentials:', err);
            setCopyStatus('Copy failed');
            setTimeout(() => setCopyStatus(''), 2000);
        }
    };

    return (
        <>
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Faculty Registrations</h1>
                    <p className="text-gray-600 mt-2">Review faculty registrations and approve them onto their assigned Moodle course.</p>
                </div>
                <button onClick={() => navigate('/teacher-registration')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    New Teacher Registration
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg border bg-red-50 text-red-800 border-red-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-5"><div className="text-sm text-gray-600">Total</div><div className="text-2xl font-bold text-gray-900">{registrations.length}</div></div>
                <div className="bg-white rounded-lg shadow p-5"><div className="text-sm text-gray-600">Submitted</div><div className="text-2xl font-bold text-blue-600">{registrations.filter((row) => row.application_status === 'submitted').length}</div></div>
                <div className="bg-white rounded-lg shadow p-5"><div className="text-sm text-gray-600">Approved</div><div className="text-2xl font-bold text-green-600">{registrations.filter((row) => row.application_status === 'accepted').length}</div></div>
                <div className="bg-white rounded-lg shadow p-5"><div className="text-sm text-gray-600">Rejected</div><div className="text-2xl font-bold text-red-600">{registrations.filter((row) => row.application_status === 'rejected').length}</div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg shadow">
                    <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search registrations" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="all">All statuses</option>
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under review</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                        {loading ? (
                            <div className="p-6 text-gray-500">Loading faculty registrations...</div>
                        ) : filteredRegistrations.length === 0 ? (
                            <div className="p-6 text-gray-500">No faculty registrations found.</div>
                        ) : filteredRegistrations.map((registration) => (
                            <button
                                key={registration.id}
                                onClick={() => setSelectedId(registration.id)}
                                className={`w-full text-left p-4 hover:bg-gray-50 ${selectedId === registration.id ? 'bg-indigo-50' : ''}`}
                            >
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <div className="font-semibold text-gray-900">{registration.first_name} {registration.last_name}</div>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusClasses(registration.application_status)}`}>
                                        {registration.application_status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">{registration.email}</div>
                                <div className="text-sm text-gray-500 mt-1">{registration.selected_course_title}</div>
                                <div className="text-xs text-gray-400 mt-1">{registration.registration_reference || `TCH-${registration.id}`}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
                    {!selectedRegistration ? (
                        <div className="text-gray-500">Select a faculty registration to review.</div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedRegistration.first_name} {selectedRegistration.last_name}</h2>
                                    <p className="text-gray-600">{selectedRegistration.email}</p>
                                    <p className="text-sm text-gray-500 mt-1">Reference: {selectedRegistration.registration_reference || `TCH-${selectedRegistration.id}`}</p>
                                </div>
                                <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusClasses(selectedRegistration.application_status)}`}>
                                    {selectedRegistration.application_status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div><p className="text-gray-500">Contact Number</p><p className="font-medium text-gray-900">{selectedRegistration.contact_number || 'N/A'}</p></div>
                                <div><p className="text-gray-500">Nationality</p><p className="font-medium text-gray-900">{selectedRegistration.nationality || 'N/A'}</p></div>
                                <div><p className="text-gray-500">Highest Qualification</p><p className="font-medium text-gray-900">{selectedRegistration.highest_qualification || 'N/A'}</p></div>
                                <div><p className="text-gray-500">Years of Experience</p><p className="font-medium text-gray-900">{selectedRegistration.years_of_experience ?? 'N/A'}</p></div>
                                <div><p className="text-gray-500">Current Employer</p><p className="font-medium text-gray-900">{selectedRegistration.current_employer || 'N/A'}</p></div>
                                <div><p className="text-gray-500">Teaching Role</p><p className="font-medium text-gray-900">{selectedRegistration.teaching_role || 'editingteacher'}</p></div>
                                <div><p className="text-gray-500">Course</p><p className="font-medium text-gray-900">{selectedRegistration.selected_course_title}</p></div>
                                <div><p className="text-gray-500">Course Code</p><p className="font-medium text-gray-900">{selectedRegistration.selected_course_code}</p></div>
                                <div><p className="text-gray-500">Submitted</p><p className="font-medium text-gray-900">{formatDate(selectedRegistration.created_at)}</p></div>
                                <div><p className="text-gray-500">Reviewed By</p><p className="font-medium text-gray-900">{selectedRegistration.reviewer_name || 'Pending'}</p></div>
                            </div>

                            <div>
                                <p className="text-gray-500 text-sm mb-1">Teaching Statement</p>
                                <div className="rounded-lg bg-gray-50 p-4 text-gray-800 whitespace-pre-wrap">{selectedRegistration.teaching_statement || 'No teaching statement provided.'}</div>
                            </div>

                            {selectedRegistration.cv_resume && (
                                <div className="flex items-center gap-2 text-sm">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <a href={`${API_URL.replace(/\/api$/, '')}${selectedRegistration.cv_resume}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                        Open CV / Resume
                                    </a>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Notes</label>
                                <textarea value={reviewerNotes} onChange={(e) => setReviewerNotes(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Add approval or rejection notes" />
                            </div>

                            {/* Teacher Qualification Gate */}
                            {teacherGate && (() => {
                                const cfg = {
                                    fail:   { bg: 'bg-red-50',    border: 'border-red-300',    Icon: ShieldAlert,  iconCls: 'text-red-600',    title: 'Faculty Gate: QUALIFICATION NOT MET',  titleCls: 'text-red-700 font-bold' },
                                    review: { bg: 'bg-amber-50',  border: 'border-amber-300',  Icon: AlertCircle,  iconCls: 'text-amber-600',  title: 'Faculty Gate: REVIEW REQUIRED',         titleCls: 'text-amber-700 font-bold' },
                                    pass:   { bg: 'bg-emerald-50',border: 'border-emerald-300',Icon: ShieldCheck,  iconCls: 'text-emerald-600',title: 'Faculty Gate: QUALIFICATION CONFIRMED',  titleCls: 'text-emerald-700 font-bold' },
                                }[teacherGate.overall];
                                const { Icon } = cfg;
                                return (
                                    <div className={`rounded-lg border ${cfg.border} ${cfg.bg} p-3`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.iconCls}`} />
                                            <span className={`text-sm ${cfg.titleCls}`}>{cfg.title}</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {teacherGate.checks.map((c, i) => (
                                                <div key={i} className="flex items-start gap-2 text-xs">
                                                    <span className={`flex-shrink-0 font-bold mt-0.5 ${c.status === 'pass' ? 'text-emerald-600' : c.status === 'fail' ? 'text-red-600' : 'text-amber-600'}`}>
                                                        {c.status === 'pass' ? '\u2713' : c.status === 'fail' ? '\u2717' : '\u26a0'}
                                                    </span>
                                                    <span className="text-gray-700"><span className="font-semibold">{c.label}:</span> {c.verdict}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {teacherGate.overall === 'fail' && (
                                            <p className="text-xs text-red-600 font-semibold mt-2 pt-2 border-t border-red-200">
                                                ⚠ Approve is blocked. Add documented justification in reviewer notes to override.
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}

                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => handleDecision('under_review')} disabled={submittingDecision} className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 inline-flex items-center gap-2 disabled:opacity-60">
                                    <Clock className="w-4 h-4" /> Mark Under Review
                                </button>
                                <button
                                    onClick={() => handleDecision('accepted')}
                                    disabled={submittingDecision || teacherGate?.overall === 'fail'}
                                    title={teacherGate?.overall === 'fail' ? 'Blocked: qualification requirements not met' : 'Approve and assign to Moodle'}
                                    className={`px-4 py-2 rounded-lg inline-flex items-center gap-2 disabled:opacity-60 ${
                                        teacherGate?.overall === 'fail'
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {teacherGate?.overall === 'fail' ? 'Approve (Blocked)' : 'Approve & Assign to Moodle'}
                                </button>
                                <button onClick={() => handleDecision('rejected')} disabled={submittingDecision} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2 disabled:opacity-60">
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {decisionModal && (
            <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">
                            {decisionModal.decision === 'accepted' ? 'Faculty Accepted' : decisionModal.decision === 'rejected' ? 'Faculty Rejected' : 'Decision Updated'}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setDecisionModal(null)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Close
                        </button>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                            <p className="text-sm text-gray-800 font-medium">{decisionModal.message}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                {decisionModal.registration?.first_name} {decisionModal.registration?.last_name} ({decisionModal.registration?.email})
                            </p>
                        </div>

                        {decisionModal.decision === 'accepted' && decisionModal.loginDetails && (
                            <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
                                <p className="text-sm font-semibold text-green-900">Login Details</p>
                                <p className="text-sm text-green-900"><span className="font-medium">Email:</span> {decisionModal.loginDetails.email}</p>
                                <p className="text-sm text-green-900"><span className="font-medium">Password:</span> {decisionModal.loginDetails.password || 'Existing password (not changed)'}</p>
                                <p className="text-sm text-green-900"><span className="font-medium">Role:</span> {decisionModal.loginDetails.role}</p>
                                <p className="text-sm text-green-900"><span className="font-medium">Portal Login:</span> {decisionModal.loginDetails.portal_login_url}</p>
                                <p className="text-sm text-green-900"><span className="font-medium">Assigned Course:</span> {decisionModal.loginDetails.moodle_course_title} ({decisionModal.loginDetails.moodle_course_code})</p>
                                <p className="text-xs text-green-800 mt-1">{decisionModal.loginDetails.note}</p>
                            </div>
                        )}

                        {decisionModal.decision === 'accepted' && decisionModal.moodleAssignment?.success && (
                            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                                <p className="text-sm font-semibold text-blue-900">Moodle Assignment</p>
                                <p className="text-sm text-blue-900 mt-1">{decisionModal.moodleAssignment.message}</p>
                                <p className="text-sm text-blue-900 mt-1">
                                    Course ID: {decisionModal.moodleAssignment.moodleCourseId} | Role: {decisionModal.moodleAssignment.roleShortname}
                                </p>
                            </div>
                        )}

                        {decisionModal.decision === 'rejected' && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                                <p className="text-sm font-semibold text-red-900">Rejected</p>
                                <p className="text-sm text-red-900 mt-1">No login account details are shared for rejected registrations.</p>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                        {decisionModal.decision === 'accepted' && decisionModal.loginDetails && (
                            <button
                                type="button"
                                onClick={handleCopyCredentials}
                                className="px-4 py-2 mr-3 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50"
                            >
                                Copy Credentials
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setDecisionModal(null)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Done
                        </button>
                    </div>
                    {copyStatus && (
                        <div className="px-6 pb-4 text-sm text-indigo-700">{copyStatus}</div>
                    )}
                </div>
            </div>
        )}
        </>
    );
};

export default TeacherRegistrationRequests;
