import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Scale, Plus, Search, RefreshCw, X, Save, Loader2,
    CheckCircle2, AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CATEGORIES = ['Academic', 'Administrative', 'Behavioural', 'Discrimination', 'Other'];

const STATUS_COLORS = {
    submitted:    'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    resolved:     'bg-green-100 text-green-800',
    closed:       'bg-gray-100 text-gray-700',
};

const TYPE_COLORS = {
    Complaint: 'bg-red-50 text-red-700 border-red-200',
    Appeal:    'bg-purple-50 text-purple-700 border-purple-200',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const empty = () => ({
    student_name: '', student_email: '', course_title: '',
    complaint_type: 'Complaint', category: 'Academic',
    date_of_incident: '', details: '', supporting_evidence: '',
    consent: false, digital_signature: '',
    reviewed_by: '', review_date: '', decision: '', reason: '', remedy: '',
    status: 'submitted'
});

export default function ComplaintsAppeals() {
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
            if (typeFilter !== 'all') params.complaint_type = typeFilter;
            if (search) params.search = search;
            const res = await axios.get(`${API_URL}/complaints-appeals`, { params });
            if (res.data?.success) setRecords(res.data.data || []);
        } catch { showToast('Failed to load records.', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [statusFilter, typeFilter]);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
    const openNew = () => { setForm(empty()); setSelected(null); setShowForm(true); };
    const openEdit = (r) => { setForm({ ...r, consent: !!r.consent }); setSelected(r); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setSelected(null); };

    const save = async () => {
        if (!form.student_name) { showToast('Student name is required.', 'error'); return; }
        setSaving(true);
        try {
            if (selected?.id) {
                await axios.put(`${API_URL}/complaints-appeals/${selected.id}`, form);
            } else {
                await axios.post(`${API_URL}/complaints-appeals`, form);
            }
            showToast('Saved successfully.');
            fetchData(); closeForm();
        } catch { showToast('Failed to save.', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        try { await axios.delete(`${API_URL}/complaints-appeals/${id}`); showToast('Deleted.'); fetchData(); }
        catch { showToast('Failed to delete.', 'error'); }
    };

    const stats = useMemo(() => ({
        total: records.length,
        complaints: records.filter(r => r.complaint_type === 'Complaint').length,
        appeals: records.filter(r => r.complaint_type === 'Appeal').length,
        resolved: records.filter(r => r.status === 'resolved' || r.status === 'closed').length,
    }), [records]);

    const LabelInput = ({ label, name, type = 'text', required }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
            <input type={type} value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
    );

    const LabelTextarea = ({ label, name, rows = 3 }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <textarea rows={rows} value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
    );

    const LabelSelect = ({ label, name, options, required }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
            <select value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
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
                        <Scale className="text-purple-600" size={24} /> Complaints & Appeals
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Track and resolve student complaints and appeals</p>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                    <Plus size={16} /> New Record
                </button>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total', value: stats.total, cls: 'bg-gray-50 border-gray-200 text-gray-700' },
                    { label: 'Complaints', value: stats.complaints, cls: 'bg-red-50 border-red-200 text-red-700' },
                    { label: 'Appeals', value: stats.appeals, cls: 'bg-purple-50 border-purple-200 text-purple-700' },
                    { label: 'Resolved/Closed', value: stats.resolved, cls: 'bg-green-50 border-green-200 text-green-700' },
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
                        placeholder="Search student or details…"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="all">All Types</option>
                    <option value="Complaint">Complaint</option>
                    <option value="Appeal">Appeal</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
                <button onClick={fetchData} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <RefreshCw size={16} className="text-gray-500" />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 size={24} className="animate-spin text-purple-500" /></div>
                ) : records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <Scale size={32} className="mb-2" />
                        <p className="text-sm">No complaints or appeals found.</p>
                        <button onClick={openNew} className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">Add First Record</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Student', 'Type', 'Category', 'Incident Date', 'Decision', 'Status', 'Actions'].map(h => (
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
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${TYPE_COLORS[r.complaint_type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>{r.complaint_type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{r.category}</td>
                                        <td className="px-4 py-3 text-gray-600">{fmt(r.date_of_incident)}</td>
                                        <td className="px-4 py-3 text-gray-600">{r.decision || '—'}</td>
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
                            <h2 className="text-lg font-bold text-gray-900">{selected ? 'Review Record' : 'New Complaint / Appeal'}</h2>
                            <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Student & Complaint Details</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <LabelInput label="Student Name" name="student_name" required />
                                    <LabelInput label="Student Email" name="student_email" type="email" />
                                    <LabelInput label="Course Title" name="course_title" />
                                    <LabelSelect label="Type" name="complaint_type" options={['Complaint', 'Appeal']} required />
                                    <LabelSelect label="Category" name="category" options={CATEGORIES} />
                                    <LabelInput label="Date of Incident" name="date_of_incident" type="date" />
                                </div>
                                <div className="mt-4 space-y-3">
                                    <LabelTextarea label="Details of Complaint / Appeal" name="details" rows={4} />
                                    <LabelInput label="Supporting Evidence (filename or URL)" name="supporting_evidence" />
                                </div>
                                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                    <input type="checkbox" checked={!!form.consent} onChange={e => set('consent', e.target.checked)} className="w-4 h-4 accent-purple-600" />
                                    <span className="text-sm text-gray-700">Student consents to processing this complaint</span>
                                </label>
                                <div className="mt-3">
                                    <LabelInput label="Digital Signature (full name)" name="digital_signature" />
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Review & Decision (Admin)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <LabelInput label="Reviewed By" name="reviewed_by" />
                                    <LabelInput label="Review Date" name="review_date" type="date" />
                                    <LabelSelect label="Decision" name="decision" options={['Upheld', 'Partially Upheld', 'Not Upheld', 'Request More Info']} />
                                </div>
                                <div className="mt-4 space-y-3">
                                    <LabelTextarea label="Reason" name="reason" />
                                    <LabelTextarea label="Remedy / Action Taken" name="remedy" />
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={closeForm} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60">
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
