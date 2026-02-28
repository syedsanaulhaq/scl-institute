import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    FileText,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    ClipboardList,
    AlertTriangle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const statusOptions = ['Not Started', 'In Progress', 'Completed', 'Not Applicable'];
const signoffOptions = ['Pending', 'Signed', 'Not Required'];

const CourseAccreditations = ({ user }) => {
    const [accreditations, setAccreditations] = useState([]);
    const [selectedAccreditationId, setSelectedAccreditationId] = useState(null);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [statusEdits, setStatusEdits] = useState({});
    const [notesEdits, setNotesEdits] = useState({});
    const [documentControlEdits, setDocumentControlEdits] = useState({});
    const [riskForm, setRiskForm] = useState({
        risk_issue: '',
        impact: '',
        mitigation: '',
        owner: '',
        review_date: ''
    });
    const [signoffForm, setSignoffForm] = useState({
        role: '',
        name: '',
        sign_date: ''
    });

    useEffect(() => {
        fetchAccreditations();
    }, []);

    useEffect(() => {
        if (accreditations.length && !selectedAccreditationId) {
            setSelectedAccreditationId(accreditations[0].id);
        }
    }, [accreditations, selectedAccreditationId]);

    useEffect(() => {
        if (selectedAccreditationId) {
            fetchAccreditationDetails(selectedAccreditationId);
        }
    }, [selectedAccreditationId]);

    const fetchAccreditations = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${API_URL}/accreditations`);
            setAccreditations(response.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch accreditations:', err);
            setError('Failed to load accreditations');
        } finally {
            setLoading(false);
        }
    };

    const fetchAccreditationDetails = async (id) => {
        try {
            setLoadingDetails(true);
            const response = await axios.get(`${API_URL}/accreditations/${id}`);
            setDetails(response.data?.data || null);
            setStatusEdits({});
            setNotesEdits({});
            setDocumentControlEdits({});
        } catch (err) {
            console.error('Failed to fetch accreditation details:', err);
            setError('Failed to load accreditation details');
        } finally {
            setLoadingDetails(false);
        }
    };

    const groupedTasks = useMemo(() => {
        if (!details?.tasks) return [];
        const map = new Map();
        details.tasks.forEach((task) => {
            const key = `${task.section_number}-${task.section_title}`;
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key).push(task);
        });
        return Array.from(map.entries()).map(([key, items]) => ({
            key,
            sectionNumber: items[0].section_number,
            sectionTitle: items[0].section_title,
            items
        }));
    }, [details]);

    const handleTaskSave = async (taskId) => {
        try {
            setSaving(true);
            const payload = {
                status: statusEdits[taskId] || undefined,
                notes: notesEdits[taskId] || undefined
            };
            await axios.put(`${API_URL}/accreditations/${selectedAccreditationId}/tasks/${taskId}`, payload);
            await fetchAccreditationDetails(selectedAccreditationId);
        } catch (err) {
            console.error('Failed to update task:', err);
            setError('Failed to update task');
        } finally {
            setSaving(false);
        }
    };

    const handleDocumentControlSave = async () => {
        try {
            setSaving(true);
            const payload = {
                course_title: documentControlEdits.course_title !== undefined ? documentControlEdits.course_title : details.accreditation.course_title,
                awarding_body: documentControlEdits.awarding_body !== undefined ? documentControlEdits.awarding_body : details.accreditation.awarding_body,
                application_type: documentControlEdits.application_type !== undefined ? documentControlEdits.application_type : details.accreditation.application_type,
                date_started: documentControlEdits.date_started !== undefined ? documentControlEdits.date_started : details.accreditation.date_started,
                expected_submission_date: documentControlEdits.expected_submission_date !== undefined ? documentControlEdits.expected_submission_date : details.accreditation.expected_submission_date,
                lead_coordinator: documentControlEdits.lead_coordinator !== undefined ? documentControlEdits.lead_coordinator : details.accreditation.lead_coordinator,
                version: documentControlEdits.version !== undefined ? documentControlEdits.version : details.accreditation.version
            };
            await axios.put(`${API_URL}/accreditations/${selectedAccreditationId}`, payload);
            setDocumentControlEdits({});
            await fetchAccreditationDetails(selectedAccreditationId);
        } catch (err) {
            console.error('Failed to update document control:', err);
            setError('Failed to update document control: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleRiskAdd = async () => {
        if (!riskForm.risk_issue) return;
        try {
            setSaving(true);
            await axios.post(`${API_URL}/accreditations/${selectedAccreditationId}/risks`, riskForm);
            setRiskForm({ risk_issue: '', impact: '', mitigation: '', owner: '', review_date: '' });
            await fetchAccreditationDetails(selectedAccreditationId);
        } catch (err) {
            console.error('Failed to add risk:', err);
            setError('Failed to add risk');
        } finally {
            setSaving(false);
        }
    };

    const handleSignoffAdd = async () => {
        if (!signoffForm.role || !signoffForm.name) return;
        try {
            setSaving(true);
            await axios.post(`${API_URL}/accreditations/${selectedAccreditationId}/signoffs`, signoffForm);
            setSignoffForm({ role: '', name: '', sign_date: '' });
            await fetchAccreditationDetails(selectedAccreditationId);
        } catch (err) {
            console.error('Failed to add sign-off:', err);
            setError('Failed to add sign-off');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-6 h-6 animate-spin text-scl-purple" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-scl-purple" />
                        Course Accreditation Management
                    </h1>
                    <p className="text-sm text-gray-500">Track course accreditation applications, partnerships, and progress.</p>
                </div>
                <button
                    onClick={() => fetchAccreditations()}
                    className="px-3 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Accreditations</h2>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                        {accreditations.map((accreditation) => (
                            <button
                                key={accreditation.id}
                                onClick={() => setSelectedAccreditationId(accreditation.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                                    selectedAccreditationId === accreditation.id
                                        ? 'border-scl-purple bg-scl-purple/10'
                                        : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <div className="text-sm font-semibold text-gray-900">{accreditation.course_title || 'Untitled'}</div>
                                <div className="text-xs text-gray-500">{accreditation.awarding_body || 'No body'}</div>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100">{accreditation.overall_status || 'Draft'}</span>
                                    <span className="text-scl-purple font-semibold">{accreditation.completion_percentage || 0}%</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {loadingDetails && (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-6 h-6 animate-spin text-scl-purple" />
                        </div>
                    )}

                    {!loadingDetails && details && (
                        <>
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">{details.accreditation.course_title}</h2>
                                        <p className="text-sm text-gray-500">{details.accreditation.awarding_body}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold">
                                            {details.accreditation.overall_status || 'Draft'}
                                        </span>
                                        <span className="text-sm font-semibold text-scl-purple">
                                            {details.accreditation.completion_percentage || 0}% Complete
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-scl-purple/5 to-transparent border border-scl-purple/20 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Document Control</h3>
                                    <button
                                        onClick={handleDocumentControlSave}
                                        disabled={saving || Object.keys(documentControlEdits).length === 0}
                                        className="px-3 py-1 text-xs rounded-md bg-scl-purple text-white hover:bg-scl-purple/90 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Course Title</p>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            value={documentControlEdits.course_title !== undefined ? documentControlEdits.course_title : (details.accreditation.course_title || '')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, course_title: e.target.value }))}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Awarding Body</p>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            value={documentControlEdits.awarding_body !== undefined ? documentControlEdits.awarding_body : (details.accreditation.awarding_body || '')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, awarding_body: e.target.value }))}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Application Type</p>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            placeholder="e.g., New Course, Partnership, Revalidation"
                                            value={documentControlEdits.application_type !== undefined ? documentControlEdits.application_type : (details.accreditation.application_type || '')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, application_type: e.target.value }))}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Lead Coordinator</p>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            value={documentControlEdits.lead_coordinator !== undefined ? documentControlEdits.lead_coordinator : (details.accreditation.lead_coordinator || '')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, lead_coordinator: e.target.value }))}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Date Started</p>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            value={documentControlEdits.date_started !== undefined ? documentControlEdits.date_started : (details.accreditation.date_started ? details.accreditation.date_started.split('T')[0] : '')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, date_started: e.target.value }))}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Expected Submission</p>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            value={documentControlEdits.expected_submission_date !== undefined ? documentControlEdits.expected_submission_date : (details.accreditation.expected_submission_date ? details.accreditation.expected_submission_date.split('T')[0] : '')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, expected_submission_date: e.target.value }))}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Version</p>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            value={documentControlEdits.version !== undefined ? documentControlEdits.version : (details.accreditation.version || '1.0')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, version: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-4">
                                <h3 className="text-sm font-semibold text-gray-700">Accreditation Tasks</h3>
                                {groupedTasks.map((group) => (
                                    <div key={group.key} className="border border-gray-100 rounded-lg">
                                        <div className="px-3 py-2 bg-gray-50 text-sm font-semibold text-gray-800">
                                            Section {group.sectionNumber} – {group.sectionTitle}
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {group.items.map((task) => (
                                                <div key={task.id} className="p-3">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="text-sm font-semibold text-gray-900">{task.task_name}</div>
                                                            <div className="text-xs text-gray-500">{task.description}</div>
                                                            <div className="text-xs text-gray-400">Evidence: {task.evidence_required || 'N/A'}</div>
                                                            <div className="text-xs text-gray-400">Owner: {task.responsible_person || 'N/A'} • Due: {task.due_date || 'N/A'}</div>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <select
                                                                className="border border-gray-200 rounded-md px-2 py-1 text-xs"
                                                                value={statusEdits[task.id] ?? task.status}
                                                                onChange={(event) =>
                                                                    setStatusEdits((prev) => ({
                                                                        ...prev,
                                                                        [task.id]: event.target.value
                                                                    }))
                                                                }
                                                            >
                                                                {statusOptions.map((option) => (
                                                                    <option key={option} value={option}>{option}</option>
                                                                ))}
                                                            </select>
                                                            <input
                                                                className="border border-gray-200 rounded-md px-2 py-1 text-xs w-44"
                                                                placeholder="Notes"
                                                                value={notesEdits[task.id] ?? task.notes ?? ''}
                                                                onChange={(event) =>
                                                                    setNotesEdits((prev) => ({
                                                                        ...prev,
                                                                        [task.id]: event.target.value
                                                                    }))
                                                                }
                                                            />
                                                            <button
                                                                onClick={() => handleTaskSave(task.id)}
                                                                disabled={saving}
                                                                className="px-2 py-1 text-xs rounded-md bg-scl-purple text-white hover:bg-scl-purple/90"
                                                            >
                                                                {saving ? 'Saving...' : 'Save'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700">Risk & Issue Log</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <input
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm"
                                        placeholder="Risk / Issue"
                                        value={riskForm.risk_issue}
                                        onChange={(event) => setRiskForm(prev => ({ ...prev, risk_issue: event.target.value }))}
                                    />
                                    <input
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm"
                                        placeholder="Owner"
                                        value={riskForm.owner}
                                        onChange={(event) => setRiskForm(prev => ({ ...prev, owner: event.target.value }))}
                                    />
                                    <input
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm"
                                        placeholder="Impact"
                                        value={riskForm.impact}
                                        onChange={(event) => setRiskForm(prev => ({ ...prev, impact: event.target.value }))}
                                    />
                                    <input
                                        type="date"
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm"
                                        value={riskForm.review_date}
                                        onChange={(event) => setRiskForm(prev => ({ ...prev, review_date: event.target.value }))}
                                    />
                                    <input
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm md:col-span-2"
                                        placeholder="Mitigation / Action"
                                        value={riskForm.mitigation}
                                        onChange={(event) => setRiskForm(prev => ({ ...prev, mitigation: event.target.value }))}
                                    />
                                </div>
                                <button
                                    onClick={handleRiskAdd}
                                    className="px-3 py-2 text-xs rounded-md bg-gray-900 text-white"
                                >
                                    Add Risk
                                </button>
                                <div className="space-y-2">
                                    {details.risks.map((risk) => (
                                        <div key={risk.id} className="border border-gray-100 rounded-md p-2 text-sm text-gray-700">
                                            <div className="font-semibold">{risk.risk_issue}</div>
                                            <div className="text-xs text-gray-500">
                                                Impact: {risk.impact || 'N/A'} • Owner: {risk.owner || 'N/A'} • Status: {risk.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700">Sign-offs</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <input
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm"
                                        placeholder="Role (e.g., Lead Coordinator)"
                                        value={signoffForm.role}
                                        onChange={(event) => setSignoffForm(prev => ({ ...prev, role: event.target.value }))}
                                    />
                                    <input
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm"
                                        placeholder="Name"
                                        value={signoffForm.name}
                                        onChange={(event) => setSignoffForm(prev => ({ ...prev, name: event.target.value }))}
                                    />
                                    <input
                                        type="date"
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm"
                                        value={signoffForm.sign_date}
                                        onChange={(event) => setSignoffForm(prev => ({ ...prev, sign_date: event.target.value }))}
                                    />
                                </div>
                                <button
                                    onClick={handleSignoffAdd}
                                    className="px-3 py-2 text-xs rounded-md bg-gray-900 text-white"
                                >
                                    Add Sign-off
                                </button>
                                <div className="space-y-2">
                                    {details.signoffs.map((signoff) => (
                                        <div key={signoff.id} className="border border-gray-100 rounded-md p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{signoff.role}</div>
                                                <div className="text-xs text-gray-500">{signoff.name || 'Pending'} • Signed: {signoff.sign_date || 'N/A'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {!loadingDetails && !details && (
                        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center text-gray-500">
                            Select an accreditation to view details.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseAccreditations;
