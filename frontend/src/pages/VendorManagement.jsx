import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Truck, Plus, Search, RefreshCw, X, Save, Loader2,
    CheckCircle2, AlertCircle, Building2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const VENDOR_TYPES = ['Supplier', 'Vendor', 'Subcontractor'];
const PAYMENT_TERMS_OPTIONS = ['Net 30', 'Net 60', 'Net 90', 'Immediate', 'Monthly', 'Other'];

const STATUS_COLORS = {
    pending:   'bg-yellow-100 text-yellow-800',
    active:    'bg-green-100 text-green-800',
    inactive:  'bg-gray-100 text-gray-700',
    suspended: 'bg-red-100 text-red-800',
};

const empty = () => ({
    company_name: '', trading_name: '', registration_number: '', vat_number: '',
    vendor_type: 'Supplier', nature_of_business: '', website: '',
    primary_contact: '', contact_position: '', contact_email: '', contact_phone: '',
    business_address: '', postal_address: '',
    doc_insurance: '', doc_health_safety: '', doc_data_protection: '',
    doc_risk_assessment: '', certifications: '',
    bank_name: '', account_number: '', sort_code: '', payment_terms: '',
    previous_clients: '', case_studies: '', references_text: '',
    signatory_name: '', signatory_position: '', agreement_date: '',
    digital_signature: '', consent: false,
    scope_of_work: '', rates: '', module_reference: '',
    status: 'pending'
});

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function VendorManagement() {
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
    const [section, setSection] = useState('company');

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.vendor_type = typeFilter;
            if (search) params.search = search;
            const res = await axios.get(`${API_URL}/vendors`, { params });
            if (res.data?.success) setRecords(res.data.data || []);
        } catch { showToast('Failed to load vendors.', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [statusFilter, typeFilter]);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
    const openNew = () => { setForm(empty()); setSelected(null); setSection('company'); setShowForm(true); };
    const openEdit = async (id) => {
        try {
            const res = await axios.get(`${API_URL}/vendors/${id}`);
            if (res.data?.success) { setForm({ ...res.data.data, consent: !!res.data.data.consent }); setSelected(res.data.data); setSection('company'); setShowForm(true); }
        } catch { showToast('Failed to load vendor.', 'error'); }
    };
    const closeForm = () => { setShowForm(false); setSelected(null); };

    const save = async () => {
        if (!form.company_name) { showToast('Company name is required.', 'error'); return; }
        setSaving(true);
        try {
            if (selected?.id) await axios.put(`${API_URL}/vendors/${selected.id}`, form);
            else await axios.post(`${API_URL}/vendors`, form);
            showToast('Saved successfully.');
            fetchData(); closeForm();
        } catch { showToast('Failed to save.', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this vendor?')) return;
        try { await axios.delete(`${API_URL}/vendors/${id}`); showToast('Deleted.'); fetchData(); }
        catch { showToast('Failed to delete.', 'error'); }
    };

    const stats = useMemo(() => ({
        total: records.length,
        active: records.filter(r => r.status === 'active').length,
        pending: records.filter(r => r.status === 'pending').length,
        suspended: records.filter(r => r.status === 'suspended' || r.status === 'inactive').length,
    }), [records]);

    const LabelInput = ({ label, name, type = 'text', required }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
            <input type={type} value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
    );
    const LabelTextarea = ({ label, name, rows = 3 }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <textarea rows={rows} value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>
    );
    const LabelSelect = ({ label, name, options, required }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
            <select value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select…</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );

    const SECTIONS = [
        { id: 'company',    label: 'Company Info' },
        { id: 'contact',    label: 'Contact' },
        { id: 'compliance', label: 'Compliance Docs' },
        { id: 'financial',  label: 'Financial' },
        { id: 'references', label: 'References' },
        { id: 'work',       label: 'Work Details' },
        { id: 'declaration',label: 'Declaration' },
    ];

    const renderSection = () => {
        switch (section) {
            case 'company': return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LabelInput label="Company Name" name="company_name" required />
                    <LabelInput label="Trading Name" name="trading_name" />
                    <LabelInput label="Registration Number" name="registration_number" />
                    <LabelInput label="VAT Number" name="vat_number" />
                    <LabelSelect label="Vendor Type" name="vendor_type" options={VENDOR_TYPES} />
                    <LabelInput label="Website" name="website" />
                    <div className="sm:col-span-2"><LabelTextarea label="Nature of Business" name="nature_of_business" rows={2} /></div>
                </div>
            );
            case 'contact': return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LabelInput label="Primary Contact Name" name="primary_contact" />
                    <LabelInput label="Position / Role" name="contact_position" />
                    <LabelInput label="Email" name="contact_email" type="email" />
                    <LabelInput label="Phone" name="contact_phone" />
                    <div className="sm:col-span-2"><LabelTextarea label="Business Address" name="business_address" rows={2} /></div>
                    <div className="sm:col-span-2"><LabelTextarea label="Postal Address (if different)" name="postal_address" rows={2} /></div>
                </div>
            );
            case 'compliance': return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LabelInput label="Insurance Certificate (filename)" name="doc_insurance" />
                    <LabelInput label="Health & Safety Policy (filename)" name="doc_health_safety" />
                    <LabelInput label="Data Protection Policy (filename)" name="doc_data_protection" />
                    <LabelInput label="Risk Assessment (filename)" name="doc_risk_assessment" />
                    <div className="sm:col-span-2"><LabelTextarea label="Certifications / Accreditations" name="certifications" rows={3} /></div>
                </div>
            );
            case 'financial': return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LabelInput label="Bank Name" name="bank_name" />
                    <LabelInput label="Sort Code" name="sort_code" />
                    <LabelInput label="Account Number" name="account_number" />
                    <LabelSelect label="Payment Terms" name="payment_terms" options={PAYMENT_TERMS_OPTIONS} />
                </div>
            );
            case 'references': return (
                <div className="space-y-4">
                    <LabelTextarea label="Previous Clients" name="previous_clients" rows={3} />
                    <LabelTextarea label="Case Studies" name="case_studies" rows={3} />
                    <LabelTextarea label="References" name="references_text" rows={3} />
                </div>
            );
            case 'work': return (
                <div className="space-y-4">
                    <LabelTextarea label="Scope of Work" name="scope_of_work" rows={4} />
                    <LabelTextarea label="Rates / Pricing" name="rates" rows={3} />
                    <LabelInput label="Module Reference" name="module_reference" />
                </div>
            );
            case 'declaration': return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LabelInput label="Signatory Name" name="signatory_name" />
                        <LabelInput label="Signatory Position" name="signatory_position" />
                        <LabelInput label="Agreement Date" name="agreement_date" type="date" />
                    </div>
                    <LabelInput label="Digital Signature (full name)" name="digital_signature" />
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!form.consent} onChange={e => set('consent', e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                        <span className="text-sm text-gray-700">Vendor consents to data storage and processing</span>
                    </label>
                    <LabelSelect label="Status" name="status" options={['pending', 'active', 'inactive', 'suspended']} />
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
                        <Truck className="text-indigo-600" size={24} /> Vendor Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Module 31 — Suppliers, vendors and subcontractors</p>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    <Plus size={16} /> Add Vendor
                </button>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total', value: stats.total, cls: 'bg-gray-50 border-gray-200' },
                    { label: 'Active', value: stats.active, cls: 'bg-green-50 border-green-200' },
                    { label: 'Pending', value: stats.pending, cls: 'bg-yellow-50 border-yellow-200' },
                    { label: 'Inactive/Suspended', value: stats.suspended, cls: 'bg-red-50 border-red-200' },
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
                        placeholder="Search company or contact…"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="all">All Types</option>
                    {VENDOR_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                </select>
                <button onClick={fetchData} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><RefreshCw size={16} className="text-gray-500" /></button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
                ) : records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <Truck size={32} className="mb-2" />
                        <p className="text-sm">No vendors found.</p>
                        <button onClick={openNew} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Add First Vendor</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Company', 'Type', 'Contact', 'Email', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {records.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{r.company_name}</p>
                                            {r.trading_name && <p className="text-xs text-gray-500">t/a {r.trading_name}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{r.vendor_type}</td>
                                        <td className="px-4 py-3 text-gray-600">{r.primary_contact || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600">{r.contact_email || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>{r.status}</span>
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
                            <h2 className="text-lg font-bold text-gray-900">{selected ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                            <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        {/* Section tabs */}
                        <div className="px-5 pt-4 flex flex-wrap gap-1 border-b border-gray-200 pb-3">
                            {SECTIONS.map(s => (
                                <button key={s.id} onClick={() => setSection(s.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${section === s.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        <div className="p-5 overflow-y-auto max-h-[60vh]">
                            {renderSection()}
                        </div>
                        <div className="p-5 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex gap-2">
                                {SECTIONS.findIndex(s => s.id === section) > 0 && (
                                    <button onClick={() => setSection(SECTIONS[SECTIONS.findIndex(s => s.id === section) - 1].id)}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">← Back</button>
                                )}
                                {SECTIONS.findIndex(s => s.id === section) < SECTIONS.length - 1 && (
                                    <button onClick={() => setSection(SECTIONS[SECTIONS.findIndex(s => s.id === section) + 1].id)}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Next →</button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={closeForm} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                    {saving ? 'Saving…' : 'Save Vendor'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
