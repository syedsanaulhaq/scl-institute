import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    ShieldAlert, Plus, Search, RefreshCw, X, Save, Loader2,
    CheckCircle2, AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const MISCONDUCT_TYPES = ['Plagiarism', 'Collusion', 'Cheating', 'Fabrication', 'Other'];

const STATUS_COLORS = {
    reported:        'bg-yellow-100 text-yellow-800',
    under_review:    'bg-blue-100 text-blue-800',
    panel_scheduled: 'bg-purple-100 text-purple-800',
    closed:          'bg-gray-100 text-gray-700',
};

const DECISION_COLORS = {
    'Warning':          'bg-yellow-100 text-yellow-800',
    'Fail Assessment':  'bg-orange-100 text-orange-800',
    'Fail Module':      'bg-red-100 text-red-800',
    'Expulsion':        'bg-red-200 text-red-900 font-bold',
    'No Action':        'bg-green-100 text-green-800',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const empty = () => ({
    student_name: '', student_email: '', course_title: '', course_code: '',
    misconduct_type: 'Plagiarism', incident_date: '', location_context: '',
    description: '', supporting_evidence: '', student_response: '',
    student_supporting_docs: '', declaration: false,
    reviewed_by: '', panel_date: '', decision: '', reason: '', sanctions: '',
    status: 'reported'
});

export default function AcademicMisconduct() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(empty());
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.misconduct_type = typeFilter;
            if (search) params.search = search;
            const res = await axios.get(`${API_URL}/academic-misconduct`, { params });
            if (res.data?.success) setRecords(res.data.data || []);
        } catch { showToast('Failed to load records.', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [statusFilter, typeFilter]);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
    const openNew = () => { setForm(empty()); setSelected(null); setShowForm(true); };
    const openEdit = (r) => { setForm({ ...r, declaration: !!r.declaration }); setSelected(r); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setSelected(null); };

    const save = async () => {
        if (!form.student_name) { showToast('Student name is required.', 'error'); return; }
        setSaving(true);
        try {
            if (selected?.id) await axios.put(`${API_URL}/academic-misconduct/${selected.id}`, form);
            else await axios.post(`${API_URL}/academic-misconduct`, form);
            showToast('Saved successfully.');
            fetchData(); closeForm();
        } catch { showToast('Failed to save.', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        try { await axios.delete(`${API_URL}/academic-misconduct/${id}`); showToast('Deleted.'); fetchData(); }
        catch { showToast('Failed to delete.', 'error'); }
    };

    const stats = useMemo(() => ({
        total: records.length,
        reported: records.filter(r => r.status === 'reported').length,
        underReview: records.filter(r => r.status === 'under_review' || r.status === 'panel_scheduled').length,
        closed: records.filter(r => r.status === 'closed').length,
    }), [records]);

    const LabelInput = ({ label, name, type = 'text', required }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
            <input type={type} value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
    );
    const LabelTextarea = ({ label, name, rows = 3 }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <textarea rows={rows} value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
        </div>
    );
    const LabelSelect = ({ label, name, options, required }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
            <select value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Select…</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );

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
                        <ShieldAlert className="text-red-600" size={24} /> Academic Misconduct
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Track plagiarism, cheating and misconduct cases</p>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                    <Plus size={16} /> Report Case
                </button>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Cases', value: stats.total, cls: 'bg-gray-50 border-gray-200 text-gray-700' },
                    { label: 'Reported', value: stats.reported, cls: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                    { label: 'Under Review', value: stats.underReview, cls: 'bg-orange-50 border-orange-200 text-orange-700' },
                    { label: 'Closed', value: stats.closed, cls: 'bg-green-50 border-green-200 text-green-700' },
                ].map(({ label, value, cls }) => (
                    <div key={label} className={`rounded-xl border p-4 ${cls}`}>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs font-medium">{label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchData()}
                        placeholder="Search student or course…"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="all">All Types</option>
                    {MISCONDUCT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="all">All Statuses</option>
                    <option value="reported">Reported</option>
                    <option value="under_review">Under Review</option>
                    <option value="panel_scheduled">Panel Scheduled</option>
                    <option value="closed">Closed</option>
                </select>
                <button onClick={fetchData} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><RefreshCw size={16} className="text-gray-500" /></button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 size={24} className="animate-spin text-red-500" /></div>
                ) : records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <ShieldAlert size={32} className="mb-2" />
                        <p className="text-sm">No misconduct cases found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Student', 'Course', 'Type', 'Incident Date', 'Decision', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {records.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{r.student_name}</p>
                                            <p className="text-xs text-gray-500">{r.student_email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{r.course_title || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">{r.misconduct_type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{fmt(r.incident_date)}</td>
                                        <td className="px-4 py-3">
                                            {r.decision
                                                ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DECISION_COLORS[r.decision] || 'bg-gray-100 text-gray-700'}`}>{r.decision}</span>
                                                : <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>{r.status?.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(r)} className="text-xs px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Review</button>
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
                            <h2 className="text-lg font-bold text-gray-900">{selected ? 'Review Misconduct Case' : 'Report Academic Misconduct'}</h2>
                            <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Incident Details</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <LabelInput label="Student Name" name="student_name" required />
                                    <LabelInput label="Student Email" name="student_email" type="email" />
                                    <LabelInput label="Course Title" name="course_title" />
                                    <LabelInput label="Course Code" name="course_code" />
                                    <LabelSelect label="Misconduct Type" name="misconduct_type" options={MISCONDUCT_TYPES} required />
                                    <LabelInput label="Date of Incident" name="incident_date" type="date" />
                                </div>
                                <div className="mt-4 space-y-3">
                                    <LabelInput label="Location / Context" name="location_context" />
                                    <LabelTextarea label="Description of Incident" name="description" rows={4} />
                                    <LabelInput label="Supporting Evidence (filename or URL)" name="supporting_evidence" />
                                    <LabelTextarea label="Student Response" name="student_response" />
                                    <LabelInput label="Student Supporting Documents" name="student_supporting_docs" />
                                </div>
                                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                    <input type="checkbox" checked={!!form.declaration} onChange={e => set('declaration', e.target.checked)} className="w-4 h-4 accent-red-600" />
                                    <span className="text-sm text-gray-700">Student declaration acknowledged</span>
                                </label>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Panel Review & Decision (Admin)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <LabelInput label="Reviewed By" name="reviewed_by" />
                                    <LabelInput label="Panel Date" name="panel_date" type="date" />
                                    <LabelSelect label="Decision" name="decision" options={['Warning', 'Fail Assessment', 'Fail Module', 'Expulsion', 'No Action']} />
                                </div>
                                <div className="mt-4 space-y-3">
                                    <LabelTextarea label="Reason / Findings" name="reason" />
                                    <LabelTextarea label="Sanctions Applied" name="sanctions" />
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={closeForm} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60">
                                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
