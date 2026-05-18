import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    Building2, Users, Globe, Mail, Phone, Plus, Edit2, Trash2, Eye,
    X, RefreshCw, Search, ChevronDown, ChevronRight, Calendar,
    DollarSign, ClipboardList, CheckCircle, AlertTriangle, Clock, Loader2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtCost = (n) => n != null ? `£${Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : '—';

const TYPE_LABELS = { awarding_body: 'Awarding Body', associate: 'Associate', affiliate: 'Affiliate' };
const TYPE_COLORS = {
    awarding_body: 'bg-purple-100 text-purple-700',
    associate: 'bg-blue-100 text-blue-700',
    affiliate: 'bg-teal-100 text-teal-700',
};
const STATUS_COLORS = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-500',
    suspended: 'bg-red-100 text-red-700',
    pending_renewal: 'bg-amber-100 text-amber-700',
    expired: 'bg-red-200 text-red-800',
};
const VISIT_STATUS_COLORS = {
    planned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    deferred: 'bg-gray-100 text-gray-500',
};
const SUB_STATUS_COLORS = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    suspended: 'bg-gray-100 text-gray-500',
};

const ASSOCIATE_TYPES = [
    'External Examiner', 'Industry Mentor', 'Guest Lecturer',
    'Placement Provider', 'Partner University', 'External Assessor', 'Other'
];
const ACCREDITATION_TYPES = ['Programme-specific', 'Institutional', 'Professional Body', 'Other'];
const RENEWAL_STATUSES = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
];
const VISIT_TYPES = ['Annual Monitoring', 'Initial Approval', 'Audit', 'Thematic Review', 'Spot Check', 'Progress Review'];
const SUB_TYPES = ['Annual Membership Fee', 'Registration Fee', 'Quality Assurance Fee', 'Awarding Fee', 'Other'];

// ── empty forms ───────────────────────────────────────────────────────────────
const emptyPartner = {
    partner_name: '', partner_type: 'awarding_body', contact_person: '', job_title: '',
    contact_email: '', phone: '', website: '', address: '', country: 'United Kingdom',
    partnership_start_date: '', associate_type: '', area_of_expertise: '', notes: '', status: 'active',
    accreditation_number: '', accreditation_type: '', expiry_date: '', responsible_person: '',
    programme_titles: '', programme_codes: '',
    internal_review_date: '', internal_reviewer: '', next_review_date: '',
    renewal_submission_date: '', renewal_status: 'not_started', follow_up_actions: ''
};
const emptyVisit = {
    visit_type: '', visit_date: '', lead_contact: '', coordinator: '',
    purpose: '', scope: '', key_standards: '', visit_agenda: '',
    required_attendees: '', outcomes: '', status: 'planned'
};
const emptySub = {
    subscription_type: '', start_date: '', end_date: '', renewal_date: '',
    cost: '', currency: 'GBP', status: 'active', notes: ''
};

// ── Field component ───────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
    </div>
);
const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400';
const selCls = inputCls + ' bg-white';
const textareaCls = inputCls + ' resize-none';

// ── Partner Form Modal ────────────────────────────────────────────────────────
function PartnerFormModal({ initial, onClose, onSaved }) {
    const [form, setForm] = useState(initial || emptyPartner);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.partner_name.trim()) { setErr('Organisation name is required.'); return; }
        setSaving(true); setErr('');
        try {
            if (form.id) {
                await axios.put(`${API_URL}/students/admin/partners/${form.id}`, form);
            } else {
                await axios.post(`${API_URL}/students/admin/partners`, form);
            }
            onSaved();
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    const isAssociate = form.partner_type !== 'awarding_body';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-bold text-gray-900">
                        {form.id ? 'Edit Partner / Associate' : 'Add New Partner / Associate'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={submit} className="overflow-y-auto px-6 py-4 space-y-5 flex-1">
                    {err && <div className="bg-red-50 text-red-700 rounded-lg px-4 py-2 text-sm">{err}</div>}

                    {/* ── Organisation Details ── */}
                    <div>
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">Organisation Details</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Organisation Name" required>
                                <input className={inputCls} value={form.partner_name} onChange={e => set('partner_name', e.target.value)} placeholder="e.g. Pearson Education" />
                            </Field>
                            <Field label="Partner Type" required>
                                <select className={selCls} value={form.partner_type} onChange={e => set('partner_type', e.target.value)}>
                                    <option value="awarding_body">Awarding Body</option>
                                    <option value="associate">Associate</option>
                                    <option value="affiliate">Affiliate</option>
                                </select>
                            </Field>
                            <Field label="Website">
                                <input className={inputCls} value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://" />
                            </Field>
                            <Field label="Partnership Start Date">
                                <input type="date" className={inputCls} value={form.partnership_start_date} onChange={e => set('partnership_start_date', e.target.value)} />
                            </Field>
                            <div className="sm:col-span-2">
                                <Field label="Address">
                                    <textarea className={textareaCls} rows={2} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" />
                                </Field>
                            </div>
                            <Field label="Country">
                                <input className={inputCls} value={form.country} onChange={e => set('country', e.target.value)} />
                            </Field>
                            <Field label="Status">
                                <select className={selCls} value={form.status} onChange={e => set('status', e.target.value)}>
                                    <option value="active">Active</option>
                                    <option value="pending_renewal">Pending Renewal</option>
                                    <option value="expired">Expired</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </Field>
                        </div>
                    </div>

                    {/* ── Contact Information ── */}
                    <div>
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">Contact Information</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Contact Person Name">
                                <input className={inputCls} value={form.contact_person} onChange={e => set('contact_person', e.target.value)} placeholder="Full name" />
                            </Field>
                            <Field label="Job Title / Role">
                                <input className={inputCls} value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="e.g. Partnership Manager" />
                            </Field>
                            <Field label="Contact Email">
                                <input type="email" className={inputCls} value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="email@organisation.com" />
                            </Field>
                            <Field label="Phone Number">
                                <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+44 ..." />
                            </Field>
                        </div>
                    </div>

                    {/* ── Accreditation Details (Awarding Body only) ── */}
                    {!isAssociate && (
                        <div>
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">Accreditation Details</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Accreditation Number / Reference">
                                    <input className={inputCls} value={form.accreditation_number} onChange={e => set('accreditation_number', e.target.value)} placeholder="e.g. BTEC/AB/2024/001" />
                                </Field>
                                <Field label="Type of Accreditation">
                                    <select className={selCls} value={form.accreditation_type} onChange={e => set('accreditation_type', e.target.value)}>
                                        <option value="">Select type...</option>
                                        {ACCREDITATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </Field>
                                <Field label="Expiry / Renewal Date">
                                    <input type="date" className={inputCls} value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} />
                                </Field>
                                <Field label="Responsible Person (SCL)">
                                    <input className={inputCls} value={form.responsible_person} onChange={e => set('responsible_person', e.target.value)} placeholder="Internal staff member" />
                                </Field>
                                <Field label="Related Programme Title(s)">
                                    <input className={inputCls} value={form.programme_titles} onChange={e => set('programme_titles', e.target.value)} placeholder="e.g. HND in Business Management" />
                                </Field>
                                <Field label="Programme Code(s)">
                                    <input className={inputCls} value={form.programme_codes} onChange={e => set('programme_codes', e.target.value)} placeholder="e.g. HND-BUS" />
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* ── Review & Renewal (Awarding Body only) ── */}
                    {!isAssociate && (
                        <div>
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">Review & Renewal</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Last Internal Review Date">
                                    <input type="date" className={inputCls} value={form.internal_review_date} onChange={e => set('internal_review_date', e.target.value)} />
                                </Field>
                                <Field label="Internal Reviewer">
                                    <input className={inputCls} value={form.internal_reviewer} onChange={e => set('internal_reviewer', e.target.value)} placeholder="Staff name" />
                                </Field>
                                <Field label="Next Review Due">
                                    <input type="date" className={inputCls} value={form.next_review_date} onChange={e => set('next_review_date', e.target.value)} />
                                </Field>
                                <Field label="Renewal Submission Date">
                                    <input type="date" className={inputCls} value={form.renewal_submission_date} onChange={e => set('renewal_submission_date', e.target.value)} />
                                </Field>
                                <div className="sm:col-span-2">
                                    <Field label="Renewal Status">
                                        <select className={selCls} value={form.renewal_status} onChange={e => set('renewal_status', e.target.value)}>
                                            {RENEWAL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                    </Field>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Associate-specific ── */}
                    {isAssociate && (
                        <div>
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">Associate Details</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Associate Type">
                                    <select className={selCls} value={form.associate_type} onChange={e => set('associate_type', e.target.value)}>
                                        <option value="">Select type...</option>
                                        {ASSOCIATE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </Field>
                                <div className="sm:col-span-1" />
                                <div className="sm:col-span-2">
                                    <Field label="Area of Expertise">
                                        <textarea className={textareaCls} rows={2} value={form.area_of_expertise} onChange={e => set('area_of_expertise', e.target.value)} placeholder="e.g. Business Strategy, AI & Machine Learning" />
                                    </Field>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Notes ── */}
                    <Field label="Internal Notes">
                        <textarea className={textareaCls} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes..." />
                    </Field>
                    {!isAssociate && (
                        <Field label="Follow-up Actions">
                            <textarea className={textareaCls} rows={2} value={form.follow_up_actions} onChange={e => set('follow_up_actions', e.target.value)} placeholder="Outstanding compliance tasks or follow-up actions..." />
                        </Field>
                    )}
                </form>

                <div className="px-6 py-4 border-t flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 hover:bg-gray-50">Cancel</button>
                    <button onClick={submit} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60 flex items-center gap-2">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {form.id ? 'Save Changes' : 'Add Partner'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Visit Form Modal ──────────────────────────────────────────────────────────
function VisitFormModal({ partnerId, initial, onClose, onSaved }) {
    const [form, setForm] = useState(initial || emptyVisit);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.visit_type || !form.visit_date) { setErr('Visit type and date are required.'); return; }
        setSaving(true); setErr('');
        try {
            if (form.id) {
                await axios.put(`${API_URL}/students/admin/partners/visits/${form.id}`, form);
            } else {
                await axios.post(`${API_URL}/students/admin/partners/${partnerId}/visits`, form);
            }
            onSaved();
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-bold text-gray-900">{form.id ? 'Edit Visit' : 'Log Awarding Body Visit'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={submit} className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
                    {err && <div className="bg-red-50 text-red-700 rounded-lg px-4 py-2 text-sm">{err}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Visit Type" required>
                            <select className={selCls} value={form.visit_type} onChange={e => set('visit_type', e.target.value)}>
                                <option value="">Select...</option>
                                {VISIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </Field>
                        <Field label="Visit Date" required>
                            <input type="date" className={inputCls} value={form.visit_date} onChange={e => set('visit_date', e.target.value)} />
                        </Field>
                        <Field label="Lead Contact (SCL Side)">
                            <input className={inputCls} value={form.lead_contact} onChange={e => set('lead_contact', e.target.value)} placeholder="Name" />
                        </Field>
                        <Field label="Coordinator">
                            <input className={inputCls} value={form.coordinator} onChange={e => set('coordinator', e.target.value)} placeholder="Name" />
                        </Field>
                        <Field label="Status">
                            <select className={selCls} value={form.status} onChange={e => set('status', e.target.value)}>
                                <option value="planned">Planned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="deferred">Deferred</option>
                            </select>
                        </Field>
                        <div />
                    </div>
                    {[
                        ['purpose', 'Purpose of Visit'],
                        ['scope', 'Scope'],
                        ['key_standards', 'Key Standards to Review'],
                        ['visit_agenda', 'Visit Agenda'],
                        ['required_attendees', 'Required Attendees'],
                        ['outcomes', 'Outcomes / Actions'],
                    ].map(([k, lbl]) => (
                        <Field key={k} label={lbl}>
                            <textarea className={textareaCls} rows={2} value={form[k]} onChange={e => set(k, e.target.value)} />
                        </Field>
                    ))}
                </form>
                <div className="px-6 py-4 border-t flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 hover:bg-gray-50">Cancel</button>
                    <button onClick={submit} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60 flex items-center gap-2">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {form.id ? 'Save Changes' : 'Log Visit'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Subscription Form Modal ───────────────────────────────────────────────────
function SubFormModal({ partnerId, initial, onClose, onSaved }) {
    const [form, setForm] = useState(initial || emptySub);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true); setErr('');
        try {
            if (form.id) {
                await axios.put(`${API_URL}/students/admin/partners/subscriptions/${form.id}`, form);
            } else {
                await axios.post(`${API_URL}/students/admin/partners/${partnerId}/subscriptions`, form);
            }
            onSaved();
        } catch (e) {
            setErr(e.response?.data?.message || 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-bold text-gray-900">{form.id ? 'Edit Subscription' : 'Add Subscription / Membership'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={submit} className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
                    {err && <div className="bg-red-50 text-red-700 rounded-lg px-4 py-2 text-sm">{err}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Field label="Subscription / Fee Type">
                                <select className={selCls} value={form.subscription_type} onChange={e => set('subscription_type', e.target.value)}>
                                    <option value="">Select...</option>
                                    {SUB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </Field>
                        </div>
                        <Field label="Start Date">
                            <input type="date" className={inputCls} value={form.start_date} onChange={e => set('start_date', e.target.value)} />
                        </Field>
                        <Field label="Expiry / End Date">
                            <input type="date" className={inputCls} value={form.end_date} onChange={e => set('end_date', e.target.value)} />
                        </Field>
                        <Field label="Renewal Date">
                            <input type="date" className={inputCls} value={form.renewal_date} onChange={e => set('renewal_date', e.target.value)} />
                        </Field>
                        <Field label="Annual Cost (£)">
                            <input type="number" step="0.01" min="0" className={inputCls} value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="0.00" />
                        </Field>
                        <div className="col-span-2">
                            <Field label="Status">
                                <select className={selCls} value={form.status} onChange={e => set('status', e.target.value)}>
                                    <option value="active">Active</option>
                                    <option value="expired">Expired</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </Field>
                        </div>
                        <div className="col-span-2">
                            <Field label="Notes">
                                <textarea className={textareaCls} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
                            </Field>
                        </div>
                    </div>
                </form>
                <div className="px-6 py-4 border-t flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 hover:bg-gray-50">Cancel</button>
                    <button onClick={submit} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60 flex items-center gap-2">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {form.id ? 'Save Changes' : 'Add Subscription'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Partner Detail Panel ──────────────────────────────────────────────────────
function PartnerDetailPanel({ partnerId, onClose, onEdit }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');
    const [visitModal, setVisitModal] = useState(null);
    const [subModal, setSubModal] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/students/admin/partners/${partnerId}`);
            setData(res.data.data);
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [partnerId]);

    useEffect(() => { load(); }, [load]);

    const deleteVisit = async (id) => {
        if (!window.confirm('Delete this visit record?')) return;
        await axios.delete(`${API_URL}/students/admin/partners/visits/${id}`);
        load();
    };
    const deleteSub = async (id) => {
        if (!window.confirm('Delete this subscription?')) return;
        await axios.delete(`${API_URL}/students/admin/partners/subscriptions/${id}`);
        load();
    };

    if (loading) return (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
    );
    if (!data) return null;

    return (
        <div className="fixed inset-0 z-40 flex justify-end">
            <div className="flex-1 bg-black/30" onClick={onClose} />
            <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-6 py-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold bg-white/20 rounded-full px-3 py-0.5">{TYPE_LABELS[data.partner_type]}</span>
                                <span className={`text-xs font-semibold rounded-full px-3 py-0.5 ${data.status === 'active' ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'}`}>{data.status}</span>
                            </div>
                            <h2 className="text-xl font-bold">{data.partner_name}</h2>
                            {data.contact_person && <p className="text-purple-200 text-sm mt-0.5">{data.contact_person}{data.job_title ? ` — ${data.job_title}` : ''}</p>}
                        </div>
                        <div className="flex gap-2 mt-1">
                            <button onClick={() => onEdit(data)} className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1">
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b bg-white px-4">
                    {[['info', 'Details'], ['visits', `Visits (${data.visits?.length || 0})`], ['subs', `Subscriptions (${data.subscriptions?.length || 0})`]].map(([k, lbl]) => (
                        <button key={k} onClick={() => setActiveTab(k)}
                            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === k ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                            {lbl}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* ── Details tab ── */}
                    {activeTab === 'info' && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    ['Contact Email', data.contact_email, Mail],
                                    ['Phone', data.phone, Phone],
                                    ['Website', data.website, Globe],
                                    ['Country', data.country, Building2],
                                    ['Partnership Since', fmt(data.partnership_start_date), Calendar],
                                ].map(([lbl, val, Icon]) => val ? (
                                    <div key={lbl} className="flex items-start gap-2">
                                        <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500">{lbl}</p>
                                            <p className="text-sm font-medium text-gray-800 break-all">
                                                {lbl === 'Website' ? <a href={val} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">{val}</a> : val}
                                            </p>
                                        </div>
                                    </div>
                                ) : null)}
                            </div>
                            {data.address && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Address</p>
                                    <p className="text-sm text-gray-800 whitespace-pre-line">{data.address}</p>
                                </div>
                            )}
                            {data.partner_type !== 'awarding_body' && data.associate_type && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Associate Type</p>
                                        <p className="text-sm font-medium text-gray-800">{data.associate_type}</p>
                                    </div>
                                    {data.area_of_expertise && (
                                        <div>
                                            <p className="text-xs text-gray-500">Area of Expertise</p>
                                            <p className="text-sm text-gray-800">{data.area_of_expertise}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Accreditation Details — Awarding Bodies */}
                            {data.partner_type === 'awarding_body' && (data.accreditation_number || data.accreditation_type || data.expiry_date || data.responsible_person) && (
                                <div>
                                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">Accreditation Details</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {data.accreditation_number && <div><p className="text-xs text-gray-500">Reference No.</p><p className="text-sm font-medium">{data.accreditation_number}</p></div>}
                                        {data.accreditation_type && <div><p className="text-xs text-gray-500">Type</p><p className="text-sm font-medium">{data.accreditation_type}</p></div>}
                                        {data.expiry_date && <div><p className="text-xs text-gray-500">Expiry Date</p><p className="text-sm font-semibold text-amber-600">{fmt(data.expiry_date)}</p></div>}
                                        {data.responsible_person && <div><p className="text-xs text-gray-500">Responsible (SCL)</p><p className="text-sm font-medium">{data.responsible_person}</p></div>}
                                        {data.programme_titles && <div className="col-span-2"><p className="text-xs text-gray-500">Programmes</p><p className="text-sm">{data.programme_titles}</p></div>}
                                        {data.programme_codes && <div><p className="text-xs text-gray-500">Programme Codes</p><p className="text-sm">{data.programme_codes}</p></div>}
                                    </div>
                                </div>
                            )}

                            {/* Review & Renewal — Awarding Bodies */}
                            {data.partner_type === 'awarding_body' && (data.internal_review_date || data.renewal_status) && (
                                <div>
                                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">Review & Renewal</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {data.internal_review_date && <div><p className="text-xs text-gray-500">Last Internal Review</p><p className="text-sm font-medium">{fmt(data.internal_review_date)}</p></div>}
                                        {data.internal_reviewer && <div><p className="text-xs text-gray-500">Internal Reviewer</p><p className="text-sm font-medium">{data.internal_reviewer}</p></div>}
                                        {data.next_review_date && <div><p className="text-xs text-gray-500">Next Review Due</p><p className="text-sm font-semibold text-amber-600">{fmt(data.next_review_date)}</p></div>}
                                        {data.renewal_submission_date && <div><p className="text-xs text-gray-500">Renewal Submitted</p><p className="text-sm font-medium">{fmt(data.renewal_submission_date)}</p></div>}
                                        {data.renewal_status && data.renewal_status !== 'not_started' && <div><p className="text-xs text-gray-500">Renewal Status</p><p className="text-sm font-semibold capitalize">{data.renewal_status.replace('_', ' ')}</p></div>}
                                    </div>
                                </div>
                            )}

                            {data.notes && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{data.notes}</p>
                                </div>
                            )}
                            {data.follow_up_actions && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Follow-up Actions</p>
                                    <p className="text-sm text-gray-700 bg-amber-50 rounded-lg p-3">{data.follow_up_actions}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Visits tab ── */}
                    {activeTab === 'visits' && (
                        <div className="space-y-3">
                            {data.partner_type === 'awarding_body' && (
                                <button onClick={() => setVisitModal({ mode: 'add' })}
                                    className="w-full border-2 border-dashed border-purple-300 text-purple-600 rounded-lg py-2.5 text-sm font-semibold hover:bg-purple-50 flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Log New Visit
                                </button>
                            )}
                            {(!data.visits || data.visits.length === 0) ? (
                                <p className="text-center text-sm text-gray-400 py-8">No visits recorded yet.</p>
                            ) : data.visits.map(v => (
                                <div key={v.id} className="border border-gray-200 rounded-xl p-4 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{v.visit_type}</p>
                                            <p className="text-xs text-gray-500">{fmt(v.visit_date)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${VISIT_STATUS_COLORS[v.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {v.status?.replace('_', ' ')}
                                            </span>
                                            <button onClick={() => setVisitModal({ mode: 'edit', visit: v })} className="text-gray-400 hover:text-purple-600"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => deleteVisit(v.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                    {v.lead_contact && <p className="text-xs text-gray-600">Lead: {v.lead_contact} {v.coordinator ? `· Coordinator: ${v.coordinator}` : ''}</p>}
                                    {v.purpose && <p className="text-xs text-gray-700 bg-gray-50 rounded p-2"><span className="font-semibold">Purpose:</span> {v.purpose}</p>}
                                    {v.outcomes && <p className="text-xs text-gray-700 bg-amber-50 rounded p-2"><span className="font-semibold">Outcomes:</span> {v.outcomes}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Subscriptions tab ── */}
                    {activeTab === 'subs' && (
                        <div className="space-y-3">
                            <button onClick={() => setSubModal({ mode: 'add' })}
                                className="w-full border-2 border-dashed border-purple-300 text-purple-600 rounded-lg py-2.5 text-sm font-semibold hover:bg-purple-50 flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Add Subscription / Fee
                            </button>
                            {(!data.subscriptions || data.subscriptions.length === 0) ? (
                                <p className="text-center text-sm text-gray-400 py-8">No subscriptions recorded yet.</p>
                            ) : data.subscriptions.map(s => (
                                <div key={s.id} className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{s.subscription_type || 'Subscription'}</p>
                                            <p className="text-lg font-bold text-purple-700">{fmtCost(s.cost)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SUB_STATUS_COLORS[s.status] || 'bg-gray-100'}`}>{s.status}</span>
                                            <button onClick={() => setSubModal({ mode: 'edit', sub: s })} className="text-gray-400 hover:text-purple-600"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => deleteSub(s.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                                        {s.start_date && <span>From: {fmt(s.start_date)}</span>}
                                        {s.end_date && <span>To: {fmt(s.end_date)}</span>}
                                        {s.renewal_date && <span className="text-amber-600 font-semibold">Renewal: {fmt(s.renewal_date)}</span>}
                                    </div>
                                    {s.notes && <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded p-2">{s.notes}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {visitModal && (
                <VisitFormModal
                    partnerId={partnerId}
                    initial={visitModal.mode === 'edit' ? visitModal.visit : null}
                    onClose={() => setVisitModal(null)}
                    onSaved={() => { setVisitModal(null); load(); }}
                />
            )}
            {subModal && (
                <SubFormModal
                    partnerId={partnerId}
                    initial={subModal.mode === 'edit' ? subModal.sub : null}
                    onClose={() => setSubModal(null)}
                    onSaved={() => { setSubModal(null); load(); }}
                />
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PartnersManagement() {
    const [searchParams] = useSearchParams();
    const [partners, setPartners] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Sync typeFilter when URL ?type= param changes (sidebar nav)
    useEffect(() => {
        setTypeFilter(searchParams.get('type') || 'all');
    }, [searchParams]);
    const [partnerModal, setPartnerModal] = useState(null);
    const [detailId, setDetailId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [pRes, sRes] = await Promise.all([
                axios.get(`${API_URL}/students/admin/partners`),
                axios.get(`${API_URL}/students/admin/partners/stats`),
            ]);
            setPartners(pRes.data?.data || []);
            setStats(sRes.data?.data || null);
        } catch (e) {
            console.error('Failed to load partners', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this partner? This will also delete all related visits and subscriptions.')) return;
        await axios.delete(`${API_URL}/students/admin/partners/${id}`);
        load();
    };

    const filtered = partners.filter(p => {
        const matchType = typeFilter === 'all' || p.partner_type === typeFilter;
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;
        const q = search.toLowerCase();
        const matchSearch = !q || p.partner_name?.toLowerCase().includes(q) || p.contact_person?.toLowerCase().includes(q) || p.contact_email?.toLowerCase().includes(q);
        return matchType && matchStatus && matchSearch;
    });

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Page header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-purple-700" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Partners & Associates</h1>
                                <p className="text-sm text-gray-500">Manage awarding bodies, associates and affiliates</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <button onClick={() => setPartnerModal({ mode: 'add' })}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold">
                                <Plus className="w-4 h-4" /> Add Partner / Associate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {[
                            ['Total', stats.total, 'bg-gray-800', Building2],
                            ['Awarding Bodies', stats.awarding_bodies, 'bg-purple-600', ClipboardList],
                            ['Associates', stats.associates, 'bg-blue-600', Users],
                            ['Affiliates', stats.affiliates, 'bg-teal-600', Globe],
                            ['Active', stats.active_count, 'bg-green-600', CheckCircle],
                        ].map(([lbl, val, bg, Icon]) => (
                            <div key={lbl} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-900">{val ?? 0}</p>
                                    <p className="text-xs text-gray-500">{lbl}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                            placeholder="Search by name, contact…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {[['all', 'All Types'], ['awarding_body', 'Awarding Bodies'], ['associate', 'Associates'], ['affiliate', 'Affiliates']].map(([v, lbl]) => (
                            <button key={v} onClick={() => setTypeFilter(v)}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${typeFilter === v ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-300 hover:border-purple-300'}`}>
                                {lbl}
                            </button>
                        ))}
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-300 bg-white text-gray-600">
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center gap-3 text-gray-400">
                            <Loader2 className="w-7 h-7 animate-spin text-purple-500" />
                            <p className="text-sm">Loading partners…</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">No partners or associates found.</p>
                            <button onClick={() => setPartnerModal({ mode: 'add' })} className="mt-3 text-sm text-purple-600 hover:underline font-semibold">+ Add the first one</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Organisation</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Since</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(p => (
                                        <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-900 text-sm">{p.partner_name}</div>
                                                {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:underline">{p.website}</a>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[p.partner_type] || 'bg-gray-100 text-gray-600'}`}>
                                                    {TYPE_LABELS[p.partner_type] || p.partner_type}
                                                </span>
                                                {p.associate_type && <div className="text-xs text-gray-400 mt-0.5">{p.associate_type}</div>}
                                            </td>
                                            <td className="px-4 py-3">
                                                {p.contact_person && <div className="text-sm text-gray-800">{p.contact_person}</div>}
                                                {p.contact_email && <div className="text-xs text-gray-500">{p.contact_email}</div>}
                                                {p.phone && <div className="text-xs text-gray-400">{p.phone}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{fmt(p.partnership_start_date)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || 'bg-gray-100'}`}>{p.status}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => setDetailId(p.id)} title="View" className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setPartnerModal({ mode: 'edit', partner: p })} title="Edit" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(p.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {partnerModal && (
                <PartnerFormModal
                    initial={partnerModal.mode === 'edit' ? partnerModal.partner : null}
                    onClose={() => setPartnerModal(null)}
                    onSaved={() => { setPartnerModal(null); load(); }}
                />
            )}
            {detailId && (
                <PartnerDetailPanel
                    partnerId={detailId}
                    onClose={() => setDetailId(null)}
                    onEdit={(p) => { setDetailId(null); setPartnerModal({ mode: 'edit', partner: p }); }}
                />
            )}
        </div>
    );
}
