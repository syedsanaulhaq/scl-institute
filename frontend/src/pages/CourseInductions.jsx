import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    FileText,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    ClipboardList
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const statusOptions = ['Not Started', 'In Progress', 'Completed', 'Not Applicable'];
const signoffOptions = ['Pending', 'Approved', 'Rejected'];

const CourseInductions = ({ user }) => {
    const [inductions, setInductions] = useState([]);
    const [selectedInductionId, setSelectedInductionId] = useState(null);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
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

    useEffect(() => {
        fetchInductions();
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

    const fetchInductions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/inductions`);
            setInductions(response.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch inductions:', err);
            setError('Failed to load inductions');
        } finally {
            setLoading(false);
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
                    <button
                        onClick={fetchInductions}
                        className="px-3 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                        <RefreshCw className="w-4 h-4 inline mr-2" />
                        Refresh
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
