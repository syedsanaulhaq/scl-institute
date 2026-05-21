import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    BookMarked, Plus, Search, RefreshCw, X, Save, Loader2,
    CheckCircle2, AlertCircle, FileCheck2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const TABS = [
    { id: 'proposals',   label: 'Programme Proposals', icon: BookMarked },
    { id: 'validations', label: 'Programme Validation', icon: FileCheck2 },
];

const PROGRAMME_TYPES = ['Undergraduate', 'Postgraduate', 'Diploma', 'Certificate', 'Short Course', 'CPD', 'Apprenticeship', 'HNC', 'HND', 'Other'];
const MODES = ['Full-Time', 'Part-Time', 'Online', 'Blended', 'Distance Learning', 'Work-Based'];
const PROPOSAL_STATUS = ['draft', 'submitted', 'under_review', 'approved', 'rejected'];
const DECISION_OPTIONS = ['Approved', 'Approved with Conditions', 'Deferred', 'Rejected'];
const REVIEW_STATUSES = ['Pending', 'In Progress', 'Completed', 'Not Required'];

const STATUS_COLORS = {
    draft:        'bg-gray-100 text-gray-700',
    submitted:    'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    approved:     'bg-green-100 text-green-800',
    rejected:     'bg-red-100 text-red-800',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const emptyProposal = () => ({
    programme_title: '', programme_code: '', programme_type: 'Undergraduate',
    awarding_body: '', regulation_level: '', mode_of_delivery: 'Full-Time',
    start_date: '', end_date: '', subject_area: '',
    rationale: '', objectives: '', target_audience: '', entry_requirements: '',
    learning_outcomes: '', programme_structure: '', assessment_methods: '',
    resource_requirements: '', staffing_requirements: '',
    tuition_fee: '', additional_costs: '', funding_options: '', work_placement: '',
    compliance_checks: '', internal_approval_authority: '', approval_date: '', notes: '',
    status: 'draft', created_by: ''
});

const emptyValidation = () => ({
    programme_id: '', programme_title: '',
    qualification_level: '', mode_of_delivery: 'Full-Time',
    start_date: '', programme_lead: '',
    doc_programme_spec: '', doc_module_descriptors: '', doc_learning_outcomes_map: '',
    doc_assessment_strategy: '', doc_staff_cvs: '', doc_resource_plan: '',
    doc_market_research: '', doc_risk_assessment: '', doc_external_examiner: '',
    faculty_review_status: 'Pending', faculty_review_notes: '', faculty_review_date: '',
    qa_review_status: 'Pending', qa_review_notes: '', qa_review_date: '',
    panel_decision: '', conditions: '', panel_chair: '', decision_date: '',
    status: 'pending'
});

export default function NewProgramme() {
    const [activeTab, setActiveTab] = useState('proposals');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyProposal());
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [formSection, setFormSection] = useState('basic');

    const isProposals = activeTab === 'proposals';
    const endpoint = isProposals ? '/api/new-programmes' : '/api/new-programmes/validations/all';

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (statusFilter !== 'all') params.status = statusFilter;
            const url = isProposals ? `${API_URL}/new-programmes` : `${API_URL}/new-programmes/validations/all`;
            const res = await axios.get(url, { params });
            if (res.data?.success) setRecords(res.data.data || []);
        } catch { showToast('Failed to load records.', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { setRecords([]); fetchData(); }, [activeTab, statusFilter]);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
    const openNew = () => { setForm(isProposals ? emptyProposal() : emptyValidation()); setSelected(null); setFormSection('basic'); setShowForm(true); };
    const openEdit = async (id) => {
        try {
            const url = isProposals ? `${API_URL}/new-programmes/${id}` : `${API_URL}/new-programmes/validations/${id}`;
            const res = await axios.get(url);
            if (res.data?.success) { setForm(res.data.data); setSelected(res.data.data); setFormSection('basic'); setShowForm(true); }
        } catch { showToast('Failed to load record.', 'error'); }
    };
    const closeForm = () => { setShowForm(false); setSelected(null); };

    const save = async () => {
        if (!form.programme_title) { showToast('Programme title is required.', 'error'); return; }
        setSaving(true);
        try {
            if (selected?.id) {
                const url = isProposals ? `${API_URL}/new-programmes/${selected.id}` : `${API_URL}/new-programmes/validations/${selected.id}`;
                await axios.put(url, form);
            } else {
                const url = isProposals ? `${API_URL}/new-programmes` : `${API_URL}/new-programmes/validations`;
                await axios.post(url, form);
            }
            showToast('Saved successfully.');
            fetchData(); closeForm();
        } catch { showToast('Failed to save.', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        try {
            const url = isProposals ? `${API_URL}/new-programmes/${id}` : `${API_URL}/new-programmes/validations/${id}`;
            await axios.delete(url); showToast('Deleted.'); fetchData();
        } catch { showToast('Failed to delete.', 'error'); }
    };

    const stats = useMemo(() => ({
        total: records.length,
        approved: records.filter(r => r.status === 'approved').length,
        pending: records.filter(r => ['draft', 'submitted', 'under_review', 'pending'].includes(r.status)).length,
        rejected: records.filter(r => r.status === 'rejected').length,
    }), [records]);

    const LabelInput = ({ label, name, type = 'text', required }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
            <input type={type} value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>
    );
    const LabelTextarea = ({ label, name, rows = 3 }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <textarea rows={rows} value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
        </div>
    );
    const LabelSelect = ({ label, name, options, required }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
            <select value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">Select…</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );

    const PROPOSAL_SECTIONS = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'content', label: 'Content & Outcomes' },
        { id: 'resources', label: 'Resources & Finance' },
        { id: 'approval', label: 'Approval' },
    ];

    const VALIDATION_SECTIONS = [
        { id: 'basic', label: 'Programme Details' },
        { id: 'docs', label: 'Documentation' },
        { id: 'reviews', label: 'Reviews' },
        { id: 'decision', label: 'Panel Decision' },
    ];

    const sections = isProposals ? PROPOSAL_SECTIONS : VALIDATION_SECTIONS;

    const renderProposalSection = () => {
        switch (formSection) {
            case 'basic': return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LabelInput label="Programme Title" name="programme_title" required />
                        <LabelInput label="Programme Code" name="programme_code" />
                        <LabelSelect label="Programme Type" name="programme_type" options={PROGRAMME_TYPES} />
                        <LabelSelect label="Mode of Delivery" name="mode_of_delivery" options={MODES} />
                        <LabelInput label="Awarding Body" name="awarding_body" />
                        <LabelInput label="Regulation Level (e.g. Level 6)" name="regulation_level" />
                        <LabelInput label="Subject Area" name="subject_area" />
                        <LabelInput label="Start Date" name="start_date" type="date" />
                        <LabelInput label="End Date" name="end_date" type="date" />
                    </div>
                </div>
            );
            case 'content': return (
                <div className="space-y-4">
                    <LabelTextarea label="Rationale / Justification" name="rationale" rows={3} />
                    <LabelTextarea label="Programme Objectives" name="objectives" rows={3} />
                    <LabelTextarea label="Target Audience" name="target_audience" rows={2} />
                    <LabelTextarea label="Entry Requirements" name="entry_requirements" rows={2} />
                    <LabelTextarea label="Learning Outcomes" name="learning_outcomes" rows={3} />
                    <LabelTextarea label="Programme Structure" name="programme_structure" rows={3} />
                    <LabelTextarea label="Assessment Methods" name="assessment_methods" rows={2} />
                    <LabelTextarea label="Work Placement Details" name="work_placement" rows={2} />
                </div>
            );
            case 'resources': return (
                <div className="space-y-4">
                    <LabelTextarea label="Resource Requirements" name="resource_requirements" rows={3} />
                    <LabelTextarea label="Staffing Requirements" name="staffing_requirements" rows={3} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LabelInput label="Tuition Fee (£)" name="tuition_fee" type="number" />
                        <LabelInput label="Additional Costs" name="additional_costs" />
                    </div>
                    <LabelTextarea label="Funding Options" name="funding_options" rows={2} />
                    <LabelTextarea label="Compliance Checks" name="compliance_checks" rows={2} />
                </div>
            );
            case 'approval': return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LabelInput label="Internal Approval Authority" name="internal_approval_authority" />
                        <LabelInput label="Approval Date" name="approval_date" type="date" />
                        <LabelInput label="Created By" name="created_by" />
                        <LabelSelect label="Status" name="status" options={PROPOSAL_STATUS} />
                    </div>
                    <LabelTextarea label="Notes" name="notes" rows={3} />
                </div>
            );
            default: return null;
        }
    };

    const renderValidationSection = () => {
        switch (formSection) {
            case 'basic': return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LabelInput label="Programme Title" name="programme_title" required />
                    <LabelInput label="Programme ID (linked proposal)" name="programme_id" type="number" />
                    <LabelInput label="Qualification Level" name="qualification_level" />
                    <LabelSelect label="Mode of Delivery" name="mode_of_delivery" options={MODES} />
                    <LabelInput label="Start Date" name="start_date" type="date" />
                    <LabelInput label="Programme Lead" name="programme_lead" />
                </div>
            );
            case 'docs': return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        ['Programme Specification', 'doc_programme_spec'],
                        ['Module Descriptors', 'doc_module_descriptors'],
                        ['Learning Outcomes Map', 'doc_learning_outcomes_map'],
                        ['Assessment Strategy', 'doc_assessment_strategy'],
                        ['Staff CVs', 'doc_staff_cvs'],
                        ['Resource Plan', 'doc_resource_plan'],
                        ['Market Research', 'doc_market_research'],
                        ['Risk Assessment', 'doc_risk_assessment'],
                        ['External Examiner CV', 'doc_external_examiner'],
                    ].map(([label, name]) => (
                        <LabelInput key={name} label={`${label} (filename)`} name={name} />
                    ))}
                </div>
            );
            case 'reviews': return (
                <div className="space-y-5">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Faculty Review</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <LabelSelect label="Status" name="faculty_review_status" options={REVIEW_STATUSES} />
                            <LabelInput label="Review Date" name="faculty_review_date" type="date" />
                            <div className="sm:col-span-2"><LabelTextarea label="Notes" name="faculty_review_notes" rows={2} /></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">QA Review</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <LabelSelect label="Status" name="qa_review_status" options={REVIEW_STATUSES} />
                            <LabelInput label="Review Date" name="qa_review_date" type="date" />
                            <div className="sm:col-span-2"><LabelTextarea label="Notes" name="qa_review_notes" rows={2} /></div>
                        </div>
                    </div>
                </div>
            );
            case 'decision': return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LabelSelect label="Panel Decision" name="panel_decision" options={DECISION_OPTIONS} />
                        <LabelInput label="Decision Date" name="decision_date" type="date" />
                        <LabelInput label="Panel Chair" name="panel_chair" />
                        <LabelSelect label="Status" name="status" options={['pending', 'in_progress', 'completed', 'approved', 'rejected']} />
                    </div>
                    <LabelTextarea label="Conditions (if any)" name="conditions" rows={3} />
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="p-6 max-w-screen-xl mx-auto">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BookMarked className="text-violet-700" size={24} /> New Programmes
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Module 30 — Programme proposals and validation</p>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-violet-700 text-white rounded-lg text-sm font-medium hover:bg-violet-800">
                    <Plus size={16} /> {isProposals ? 'New Proposal' : 'New Validation'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-violet-700 text-white shadow' : 'text-gray-600 hover:bg-white hover:text-gray-900'}`}>
                            <Icon size={15} />{tab.label}
                        </button>
                    );
                })}
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total', value: stats.total, cls: 'bg-gray-50 border-gray-200' },
                    { label: 'Approved', value: stats.approved, cls: 'bg-green-50 border-green-200' },
                    { label: 'In Progress', value: stats.pending, cls: 'bg-yellow-50 border-yellow-200' },
                    { label: 'Rejected', value: stats.rejected, cls: 'bg-red-50 border-red-200' },
                ].map(({ label, value, cls }) => (
                    <div key={label} className={`rounded-xl border p-4 ${cls}`}>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs font-medium text-gray-600">{label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchData()}
                        placeholder="Search programmes…"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                    <option value="all">All Statuses</option>
                    {(isProposals ? PROPOSAL_STATUS : ['pending', 'in_progress', 'completed', 'approved', 'rejected']).map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                </select>
                <button onClick={fetchData} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><RefreshCw size={16} className="text-gray-500" /></button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 size={24} className="animate-spin text-violet-600" /></div>
                ) : records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <BookMarked size={32} className="mb-2" />
                        <p className="text-sm">No {isProposals ? 'proposals' : 'validations'} found.</p>
                        <button onClick={openNew} className="mt-3 px-4 py-2 bg-violet-700 text-white rounded-lg text-sm hover:bg-violet-800">Add First Record</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {(isProposals
                                        ? ['Programme', 'Type', 'Mode', 'Awarding Body', 'Start Date', 'Status', 'Actions']
                                        : ['Programme', 'Level', 'Mode', 'Lead', 'Faculty Review', 'Panel Decision', 'Actions']
                                    ).map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {records.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{r.programme_title}</p>
                                            {r.programme_code && <p className="text-xs text-gray-500">{r.programme_code}</p>}
                                        </td>
                                        {isProposals ? (<>
                                            <td className="px-4 py-3 text-gray-600">{r.programme_type}</td>
                                            <td className="px-4 py-3 text-gray-600">{r.mode_of_delivery}</td>
                                            <td className="px-4 py-3 text-gray-600">{r.awarding_body || '—'}</td>
                                            <td className="px-4 py-3 text-gray-600">{fmt(r.start_date)}</td>
                                        </>) : (<>
                                            <td className="px-4 py-3 text-gray-600">{r.qualification_level || '—'}</td>
                                            <td className="px-4 py-3 text-gray-600">{r.mode_of_delivery}</td>
                                            <td className="px-4 py-3 text-gray-600">{r.programme_lead || '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.faculty_review_status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{r.faculty_review_status || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{r.panel_decision || '—'}</td>
                                        </>)}
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>{r.status?.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(r.id)} className="text-xs px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Edit</button>
                                                <button onClick={() => handleDelete(r.id)} className="text-xs px-3 py-1 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-40 bg-black/40 flex items-start justify-center pt-8 px-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mb-8">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">
                                {selected ? `Edit ${isProposals ? 'Proposal' : 'Validation'}` : `New ${isProposals ? 'Programme Proposal' : 'Validation'}`}
                            </h2>
                            <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        {/* Section tabs */}
                        <div className="px-5 pt-4 flex flex-wrap gap-1 border-b border-gray-200 pb-3">
                            {sections.map(s => (
                                <button key={s.id} onClick={() => setFormSection(s.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formSection === s.id ? 'bg-violet-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        <div className="p-5 overflow-y-auto max-h-[60vh]">
                            {isProposals ? renderProposalSection() : renderValidationSection()}
                        </div>
                        <div className="p-5 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex gap-2">
                                {sections.findIndex(s => s.id === formSection) > 0 && (
                                    <button onClick={() => setFormSection(sections[sections.findIndex(s => s.id === formSection) - 1].id)}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">← Back</button>
                                )}
                                {sections.findIndex(s => s.id === formSection) < sections.length - 1 && (
                                    <button onClick={() => setFormSection(sections[sections.findIndex(s => s.id === formSection) + 1].id)}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Next →</button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={closeForm} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-violet-700 text-white rounded-lg text-sm font-medium hover:bg-violet-800 disabled:opacity-60">
                                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                    {saving ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
