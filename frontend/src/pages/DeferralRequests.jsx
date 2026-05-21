import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    FileText, Plus, Search, RefreshCw, X, Save, Loader2,
    CheckCircle2, AlertCircle, Clock, User, Calendar, ChevronRight, Filter
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const REQUEST_TYPES = ['Withdrawal', 'Deferral', 'Transfer'];

const STATUS_COLORS = {
    pending:        'bg-yellow-100 text-yellow-800',
    approved:       'bg-green-100 text-green-800',
    rejected:       'bg-red-100 text-red-800',
    info_requested: 'bg-blue-100 text-blue-800',
};

const TYPE_COLORS = {
    Withdrawal: 'bg-red-50 text-red-700 border-red-200',
    Deferral:   'bg-amber-50 text-amber-700 border-amber-200',
    Transfer:   'bg-blue-50 text-blue-700 border-blue-200',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const empty = () => ({
    student_name: '', student_email: '', course_title: '', course_code: '',
    request_type: 'Deferral', effective_date: '', justification: '',
    supporting_docs: '', policy_consent: false, digital_signature: '',
    reviewed_by: '', review_date: '', decision: '', reason: '',
    committee_comments: '', final_decision_date: '', status: 'pending'
});

export default function DeferralRequests() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(empty());
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.request_type = typeFilter;
            if (search) params.search = search;
            const res = await axios.get(`${API_URL}/deferral-requests`, { params });
            if (res.data?.success) setRecords(res.data.data || []);
        } catch {
            showToast('Failed to load records.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [statusFilter, typeFilter]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const openNew = () => {
        setForm(empty());
        setSelected(null);
        setShowForm(true);
    };

    const openEdit = (r) => {
        setForm({ ...r, policy_consent: !!r.policy_consent });
        setSelected(r);
        setShowForm(true);
    };

    const closeForm = () => { setShowForm(false); setSelected(null); };

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const save = async () => {
        if (!form.student_name || !form.request_type) {
            showToast('Student name and request type are required.', 'error');
            return;
        }
        setSaving(true);
        try {
            if (selected?.id) {
                await axios.put(`${API_URL}/deferral-requests/${selected.id}`, form);
                showToast('Request updated successfully.');
            } else {
                await axios.post(`${API_URL}/deferral-requests`, form);
                showToast('Request created successfully.');
            }
            fetchData();
            closeForm();
        } catch {
            showToast('Failed to save. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this request?')) return;
        try {
            await axios.delete(`${API_URL}/deferral-requests/${id}`);
            showToast('Request deleted.');
            fetchData();
        } catch {
            showToast('Failed to delete.', 'error');
        }
    };

    const stats = useMemo(() => ({
        total: records.length,
        pending: records.filter(r => r.status === 'pending').length,
        approved: records.filter(r => r.status === 'approved').length,
        rejected: records.filter(r => r.status === 'rejected').length,
    }), [records]);

    const LabelInput = ({ label, name, type = 'text', required }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
            <input
                type={type}
                value={form[name] || ''}
                onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );

    const LabelTextarea = ({ label, name, rows = 3 }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <textarea
                rows={rows}
                value={form[name] || ''}
                onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
        </div>
    );

    const LabelSelect = ({ label, name, options, required }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
            <select
                value={form[name] || ''}
                onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
                <option value="">Select…</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );

    return (
        <div className="p-6 max-w-screen-xl mx-auto">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="text-blue-600" size={24} /> Deferral & Withdrawal Requests
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage student deferral, withdrawal and transfer requests</p>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    <Plus size={16} /> New Request
                </button>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total', value: stats.total, color: 'blue' },
                    { label: 'Pending', value: stats.pending, color: 'yellow' },
                    { label: 'Approved', value: stats.approved, color: 'green' },
                    { label: 'Rejected', value: stats.rejected, color: 'red' },
                ].map(({ label, value, color }) => (
                    <div key={label} className={`rounded-xl border p-4 bg-${color}-50 border-${color}-200`}>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className={`text-xs font-medium text-${color}-700`}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchData()}
                        placeholder="Search by name or email…"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="all">All Types</option>
                    {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="info_requested">Info Requested</option>
                </select>
                <button onClick={fetchData} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <RefreshCw size={16} className="text-gray-500" />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 size={24} className="animate-spin text-blue-500" /></div>
                ) : records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <FileText size={32} className="mb-2" />
                        <p className="text-sm">No requests found.</p>
                        <button onClick={openNew} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Create First Request</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Student', 'Course', 'Type', 'Effective Date', 'Status', 'Created', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {records.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{r.student_name}</p>
                                            <p className="text-xs text-gray-500">{r.student_email}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-700">{r.course_title || '—'}</p>
                                            <p className="text-xs text-gray-400">{r.course_code || ''}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${TYPE_COLORS[r.request_type] || 'bg-gray-100 text-gray-700'}`}>
                                                {r.request_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{fmt(r.effective_date)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {r.status?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{fmt(r.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
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
                            <h2 className="text-lg font-bold text-gray-900">
                                {selected ? 'Review Request' : 'New Deferral / Withdrawal Request'}
                            </h2>
                            <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
                            {/* Student Info */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Student Information</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <LabelInput label="Student Name" name="student_name" required />
                                    <LabelInput label="Student Email" name="student_email" type="email" />
                                    <LabelInput label="Course Title" name="course_title" />
                                    <LabelInput label="Course Code" name="course_code" />
                                </div>
                            </div>

                            {/* Request Details */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Request Details</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <LabelSelect label="Request Type" name="request_type" options={REQUEST_TYPES} required />
                                    <LabelInput label="Effective Date" name="effective_date" type="date" />
                                </div>
                                <div className="mt-4">
                                    <LabelTextarea label="Justification" name="justification" rows={4} />
                                </div>
                                <div className="mt-4">
                                    <LabelInput label="Supporting Documents (filename or URL)" name="supporting_docs" />
                                </div>
                                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                    <input type="checkbox" checked={!!form.policy_consent} onChange={e => set('policy_consent', e.target.checked)} className="w-4 h-4 accent-blue-600" />
                                    <span className="text-sm text-gray-700">Student consents to this request being processed</span>
                                </label>
                                <div className="mt-3">
                                    <LabelInput label="Digital Signature (full name)" name="digital_signature" />
                                </div>
                            </div>

                            {/* Review Section */}
                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Review Decision (Admin)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <LabelInput label="Reviewed By" name="reviewed_by" />
                                    <LabelInput label="Review Date" name="review_date" type="date" />
                                    <LabelSelect label="Decision" name="decision" options={['Approved','Approved with Conditions','Rejected','Request More Info']} />
                                    <LabelInput label="Final Decision Date" name="final_decision_date" type="date" />
                                </div>
                                <div className="mt-4 space-y-3">
                                    <LabelTextarea label="Reason / Rationale" name="reason" />
                                    <LabelTextarea label="Committee Comments" name="committee_comments" />
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={closeForm} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                {saving ? 'Saving…' : 'Save Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
