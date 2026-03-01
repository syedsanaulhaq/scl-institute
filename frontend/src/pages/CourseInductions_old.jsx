import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    FileText,
    Loader2,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    Trash2,
    Plus,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const complianceOptions = [
    { value: 'compliant', label: '✓ Compliant', color: 'bg-green-50 text-green-700' },
    { value: 'non_compliant', label: '✗ Non-Compliant', color: 'bg-red-50 text-red-700' },
    { value: 'pending', label: '⏳ Pending', color: 'bg-yellow-50 text-yellow-700' },
    { value: 'na', label: '- N/A', color: 'bg-gray-50 text-gray-600' }
];

const CourseInductions = () => {
    const [inductions, setInductions] = useState([]);
    const [selectedInductionId, setSelectedInductionId] = useState(null);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [dataSource, setDataSource] = useState('scl'); // 'scl' or 'moodle'
    const [statusEdits, setStatusEdits] = useState({});
    const [notesEdits, setNotesEdits] = useState({});
    const [conditionForm, setConditionForm] = useState({
        condition_text: '',
        owner: '',
        due_date: ''
    });
    const [riskForm, setRiskForm] = useState({
        risk_description: '',
        impact: '',
        likelihood: '',
        mitigation: '',
        owner: ''
    });
    const [signoffEdits, setSignoffEdits] = useState({});
    const [signoffComments, setSignoffComments] = useState({});
    const [documentControlEdits, setDocumentControlEdits] = useState({});

    useEffect(() => {
        fetchInductions('scl');
    }, []);

    useEffect(() => {
        if (inductions.length && !selectedInductionId) {
            setSelectedInductionId(inductions[0].id);
        }
    }, [inductions, selectedInductionId]);

    useEffect(() => {
        if (selectedInductionId) {
            fetchInductionDetails(selectedInductionId);
        }
    }, [selectedInductionId]);

    const fetchInductions = async (source = 'scl') => {
        try {
            setLoading(true);
            setError('');
            const params = source === 'moodle' ? '?from_moodle=true' : '';
            const response = await axios.get(`${API_URL}/inductions${params}`);
            setInductions(response.data?.data || []);
            setDataSource(source);
        } catch (err) {
            console.error('Failed to fetch inductions:', err);
            setError(`Failed to load inductions from ${source === 'moodle' ? 'Moodle' : 'SCL database'}`);
        } finally {
            setLoading(false);
        }
    };

    const syncMoodleCourses = async () => {
        try {
            setSyncing(true);
            setError('');
            const response = await axios.post(`${API_URL}/inductions/sync-moodle`);
            
            if (response.data.success) {
                setError('');
                alert(`✅ Sync complete!\nSynced: ${response.data.summary.synced} courses\nSkipped: ${response.data.summary.skipped} courses`);
                // Refresh the list
                await fetchInductions(dataSource);
            }
        } catch (err) {
            console.error('Failed to sync Moodle courses:', err);
            setError(`Sync failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setSyncing(false);
        }
    };

    const fetchInductionDetails = async (id) => {
        try {
            setLoadingDetails(true);
            const response = await axios.get(`${API_URL}/inductions/${id}`);
            setDetails(response.data?.data || null);
            setStatusEdits({});
            setNotesEdits({});
            setSignoffEdits({});
            setSignoffComments({});
            setDocumentControlEdits({});
        } catch (err) {
            console.error('Failed to fetch induction details:', err);
            setError('Failed to load induction details');
        } finally {
            setLoadingDetails(false);
        }
    };

    const groupedRequirements = useMemo(() => {
        if (!details?.requirements) return [];
        const map = new Map();
        details.requirements.forEach((req) => {
            const key = `${req.section_number}-${req.section_title}`;
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key).push(req);
        });
        return Array.from(map.entries()).map(([key, items]) => ({
            key,
            sectionNumber: items[0].section_number,
            sectionTitle: items[0].section_title,
            items
        }));
    }, [details]);

    const handleRequirementSave = async (reqId, inductionId) => {
        try {
            setSaving(true);
            const payload = {
                status: statusEdits[reqId] || undefined,
                notes: notesEdits[reqId] || undefined
            };
            await axios.put(`${API_URL}/inductions/${inductionId}/requirements/${reqId}`, payload);
            await fetchInductionDetails(inductionId);
        } catch (err) {
            console.error('Failed to update requirement:', err);
            setError('Failed to update requirement');
        } finally {
            setSaving(false);
        }
    };

    const handleConditionAdd = async () => {
        if (!conditionForm.condition_text) return;
        try {
            setSaving(true);
            await axios.post(`${API_URL}/inductions/${selectedInductionId}/conditions`, conditionForm);
            setConditionForm({ condition_text: '', owner: '', due_date: '' });
            await fetchInductionDetails(selectedInductionId);
        } catch (err) {
            console.error('Failed to add condition:', err);
            setError('Failed to add condition');
        } finally {
            setSaving(false);
        }
    };

    const handleRiskAdd = async () => {
        if (!riskForm.risk_description) return;
        try {
            setSaving(true);
            await axios.post(`${API_URL}/inductions/${selectedInductionId}/risks`, riskForm);
            setRiskForm({ risk_description: '', impact: '', likelihood: '', mitigation: '', owner: '' });
            await fetchInductionDetails(selectedInductionId);
        } catch (err) {
            console.error('Failed to add risk:', err);
            setError('Failed to add risk');
        } finally {
            setSaving(false);
        }
    };

    const handleSignoffSave = async (signId, inductionId) => {
        try {
            setSaving(true);
            const payload = {
                decision: signoffEdits[signId] || undefined,
                comments: signoffComments[signId] || undefined
            };
            await axios.put(`${API_URL}/inductions/${inductionId}/signoffs/${signId}`, payload);
            await fetchInductionDetails(inductionId);
        } catch (err) {
            console.error('Failed to update sign-off:', err);
            setError('Failed to update sign-off');
        } finally {
            setSaving(false);
        }
    };

    const handleDocumentControlSave = async (inductionId) => {
        try {
            setSaving(true);
            const payload = {
                course_title: documentControlEdits.course_title !== undefined ? documentControlEdits.course_title : details.induction.course_title,
                awarding_body: documentControlEdits.awarding_body !== undefined ? documentControlEdits.awarding_body : details.induction.awarding_body,
                qualification_level: documentControlEdits.qualification_level !== undefined ? documentControlEdits.qualification_level : details.induction.qualification_level,
                approval_date: documentControlEdits.approval_date !== undefined ? documentControlEdits.approval_date : details.induction.approval_date,
                review_date: documentControlEdits.review_date !== undefined ? documentControlEdits.review_date : details.induction.review_date,
                version: documentControlEdits.version !== undefined ? documentControlEdits.version : details.induction.version,
                document_owner: documentControlEdits.document_owner !== undefined ? documentControlEdits.document_owner : details.induction.document_owner
            };
            await axios.put(`${API_URL}/inductions/${inductionId}`, payload);
            setDocumentControlEdits({});
            await fetchInductionDetails(inductionId);
        } catch (err) {
            console.error('Failed to update document control:', err);
            setError('Failed to update document control: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleExport = (type) => {
        if (!selectedInductionId) return;
        window.open(`${API_URL}/inductions/${selectedInductionId}/export/${type}`, '_blank');
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
                        <ClipboardList className="w-6 h-6 text-scl-purple" />
                        Course Induction Compliance
                    </h1>
                    <p className="text-sm text-gray-500">Track course approval requirements, risks, conditions, and sign-offs.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => fetchInductions('scl')}
                            className={`px-3 py-1 text-xs font-semibold rounded ${
                                dataSource === 'scl' 
                                    ? 'bg-white text-scl-purple border border-scl-purple' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            SCL Database
                        </button>
                        <button
                            onClick={() => fetchInductions('moodle')}
                            className={`px-3 py-1 text-xs font-semibold rounded ${
                                dataSource === 'moodle' 
                                    ? 'bg-white text-scl-purple border border-scl-purple' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Moodle Live
                        </button>
                    </div>
                    <button
                        onClick={syncMoodleCourses}
                        disabled={syncing}
                        className="px-3 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        title="Sync latest Moodle courses to inductions table"
                    >
                        <RefreshCw className={`w-4 h-4 inline mr-2 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync Moodle'}
                    </button>
                    <button
                        onClick={() => fetchInductions(dataSource)}
                        className="px-3 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                        <RefreshCw className="w-4 h-4 inline mr-2" />
                        Refresh
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        className="px-3 py-2 text-sm font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 inline mr-2" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        className="px-3 py-2 text-sm font-semibold rounded-lg bg-scl-purple text-white hover:bg-scl-purple/90"
                    >
                        <FileText className="w-4 h-4 inline mr-2" />
                        Export PDF
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Courses</h2>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                        {inductions.map((induction) => (
                            <button
                                key={induction.id}
                                onClick={() => setSelectedInductionId(induction.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                                    selectedInductionId === induction.id
                                        ? 'border-scl-purple bg-scl-purple/10'
                                        : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <div className="text-sm font-semibold text-gray-900">{induction.course_title || 'Untitled Course'}</div>
                                <div className="text-xs text-gray-500">{induction.course_code || 'No code'}</div>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100">{induction.overall_status || 'Draft'}</span>
                                    <span className="text-scl-purple font-semibold">{induction.completion_percentage || 0}%</span>
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
                                        <h2 className="text-lg font-semibold text-gray-900">{details.induction.course_title}</h2>
                                        <p className="text-sm text-gray-500">{details.induction.course_code} • {details.induction.awarding_body}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold">
                                            {details.induction.overall_status || 'Draft'}
                                        </span>
                                        <span className="text-sm font-semibold text-scl-purple">
                                            {details.induction.completion_percentage || 0}% Complete
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-scl-purple/5 to-transparent border border-scl-purple/20 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Document Control</h3>
                                    <button
                                        onClick={() => handleDocumentControlSave(details.induction.id)}
                                        disabled={saving || Object.keys(documentControlEdits).length === 0}
                                        className="px-3 py-1 text-xs rounded-md bg-scl-purple text-white hover:bg-scl-purple/90 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Course Title</p>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            value={documentControlEdits.course_title !== undefined ? documentControlEdits.course_title : (details.induction.course_title || '')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, course_title: e.target.value }))}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Awarding Body / University</p>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            value={documentControlEdits.awarding_body !== undefined ? documentControlEdits.awarding_body : (details.induction.awarding_body || '')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, awarding_body: e.target.value }))}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Qualification Level & Framework</p>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            value={documentControlEdits.qualification_level !== undefined ? documentControlEdits.qualification_level : (details.induction.qualification_level || '')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, qualification_level: e.target.value }))}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Approval Date</p>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            value={documentControlEdits.approval_date !== undefined ? documentControlEdits.approval_date : (details.induction.approval_date ? details.induction.approval_date.split('T')[0] : '')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, approval_date: e.target.value }))}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Review Date</p>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            value={documentControlEdits.review_date !== undefined ? documentControlEdits.review_date : (details.induction.review_date ? details.induction.review_date.split('T')[0] : '')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, review_date: e.target.value }))}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Version</p>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            value={documentControlEdits.version !== undefined ? documentControlEdits.version : (details.induction.version || '1.0')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, version: e.target.value }))}
                                        />
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-gray-100 md:col-span-2 lg:col-span-3">
                                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Document Owner (Department/Role)</p>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-scl-purple focus:border-scl-purple"
                                            value={documentControlEdits.document_owner !== undefined ? documentControlEdits.document_owner : (details.induction.document_owner || '')}
                                            onChange={(e) => setDocumentControlEdits(prev => ({ ...prev, document_owner: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-4">
                                <h3 className="text-sm font-semibold text-gray-700">Requirements Checklist</h3>
                                {groupedRequirements.map((group) => (
                                    <div key={group.key} className="border border-gray-100 rounded-lg">
                                        <div className="px-3 py-2 bg-gray-50 text-sm font-semibold text-gray-800">
                                            Section {group.sectionNumber} – {group.sectionTitle}
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {group.items.map((req) => (
                                                <div key={req.id} className="p-3">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">{req.requirement_area}</div>
                                                            <div className="text-xs text-gray-500">{req.evidence_required || 'No evidence listed'}</div>
                                                            <div className="text-xs text-gray-400">{req.responsible_role || 'No owner'}</div>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <select
                                                                className="border border-gray-200 rounded-md px-2 py-1 text-xs"
                                                                value={statusEdits[req.id] ?? req.status}
                                                                onChange={(event) =>
                                                                    setStatusEdits((prev) => ({
                                                                        ...prev,
                                                                        [req.id]: event.target.value
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
                                                                value={notesEdits[req.id] ?? req.notes ?? ''}
                                                                onChange={(event) =>
                                                                    setNotesEdits((prev) => ({
                                                                        ...prev,
                                                                        [req.id]: event.target.value
                                                                    }))
                                                                }
                                                            />
                                                            <button
                                                                onClick={() => handleRequirementSave(req.id, details.induction.id)}
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
                                <h3 className="text-sm font-semibold text-gray-700">Conditions & Recommendations</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <input
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm"
                                        placeholder="Condition"
                                        value={conditionForm.condition_text}
                                        onChange={(event) => setConditionForm(prev => ({ ...prev, condition_text: event.target.value }))}
                                    />
                                    <input
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm"
                                        placeholder="Owner"
                                        value={conditionForm.owner}
                                        onChange={(event) => setConditionForm(prev => ({ ...prev, owner: event.target.value }))}
                                    />
                                    <input
                                        type="date"
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm"
                                        value={conditionForm.due_date}
                                        onChange={(event) => setConditionForm(prev => ({ ...prev, due_date: event.target.value }))}
                                    />
                                </div>
                                <button
                                    onClick={handleConditionAdd}
                                    className="px-3 py-2 text-xs rounded-md bg-gray-900 text-white"
                                >
                                    Add Condition
                                </button>
                                <div className="space-y-2">
                                    {details.conditions.map((cond) => (
                                        <div key={cond.id} className="border border-gray-100 rounded-md p-2 text-sm text-gray-700">
                                            <div className="font-semibold">{cond.condition_text}</div>
                                            <div className="text-xs text-gray-500">Owner: {cond.owner || 'N/A'} • Due: {cond.due_date || 'N/A'} • {cond.status}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700">Risk & Issue Log</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <input
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm"
                                        placeholder="Risk description"
                                        value={riskForm.risk_description}
                                        onChange={(event) => setRiskForm(prev => ({ ...prev, risk_description: event.target.value }))}
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
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm"
                                        placeholder="Likelihood"
                                        value={riskForm.likelihood}
                                        onChange={(event) => setRiskForm(prev => ({ ...prev, likelihood: event.target.value }))}
                                    />
                                    <input
                                        className="border border-gray-200 rounded-md px-2 py-2 text-sm md:col-span-2"
                                        placeholder="Mitigation / action"
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
                                            <div className="font-semibold">{risk.risk_description}</div>
                                            <div className="text-xs text-gray-500">
                                                Impact: {risk.impact || 'N/A'} • Likelihood: {risk.likelihood || 'N/A'} • Status: {risk.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700">Sign-offs</h3>
                                <div className="space-y-2">
                                    {details.signoffs.map((sign) => (
                                        <div key={sign.id} className="border border-gray-100 rounded-md p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{sign.role}</div>
                                                <div className="text-xs text-gray-500">{sign.approver_name || 'Pending approver'}</div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <select
                                                    className="border border-gray-200 rounded-md px-2 py-1 text-xs"
                                                    value={signoffEdits[sign.id] ?? sign.decision}
                                                    onChange={(event) =>
                                                        setSignoffEdits((prev) => ({
                                                            ...prev,
                                                            [sign.id]: event.target.value
                                                        }))
                                                    }
                                                >
                                                    {signoffOptions.map((option) => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    className="border border-gray-200 rounded-md px-2 py-1 text-xs w-44"
                                                    placeholder="Comments"
                                                    value={signoffComments[sign.id] ?? sign.comments ?? ''}
                                                    onChange={(event) =>
                                                        setSignoffComments((prev) => ({
                                                            ...prev,
                                                            [sign.id]: event.target.value
                                                        }))
                                                    }
                                                />
                                                <button
                                                    onClick={() => handleSignoffSave(sign.id, details.induction.id)}
                                                    disabled={saving}
                                                    className="px-2 py-1 text-xs rounded-md bg-scl-purple text-white hover:bg-scl-purple/90"
                                                >
                                                    {saving ? 'Saving...' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {!loadingDetails && !details && (
                        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center text-gray-500">
                            Select a course to view induction details.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseInductions;
