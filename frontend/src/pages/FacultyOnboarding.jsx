import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Users, CheckCircle2, Clock, AlertCircle, Search, X, ChevronRight,
    Mail, Phone, BookOpen, Calendar, Save, Loader2, RefreshCw, Award, Zap, Copy, Eye, EyeOff
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CHECKLIST = [
    { key: 'contract_signed',      label: 'Contract Signed',         desc: 'Employment contract reviewed and signed' },
    { key: 'it_setup_completed',   label: 'IT Setup',                desc: 'Laptop, email account and system access set up' },
    { key: 'lms_access_granted',   label: 'LMS Access Granted',      desc: 'Moodle account created and courses assigned' },
    { key: 'course_assigned',      label: 'Course Assignment',       desc: 'Teaching timetable and course list confirmed' },
    { key: 'office_orientation',   label: 'Office Orientation',      desc: 'Campus tour, office keys and parking issued' },
    { key: 'handbook_received',    label: 'Handbook Received',       desc: 'Staff handbook and policies acknowledged' },
    { key: 'id_card_issued',       label: 'ID Card Issued',          desc: 'Staff photo ID card printed and issued' },
];

const STATUS_CONFIG = {
    Pending:     { color: 'bg-gray-100 text-gray-700',   dot: 'bg-gray-400' },
    'In Progress': { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
    Completed:   { color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function FacultyOnboarding() {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({});
    const [toast, setToast] = useState(null);
    const [activating, setActivating] = useState(false);
    const [activateModal, setActivateModal] = useState(null); // holds login details after activation
    const [showPassword, setShowPassword] = useState(false);

    const fetchFaculty = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await axios.get(`${API_URL}/students/faculty-onboarding`, {
                params: { status: statusFilter !== 'all' ? statusFilter : undefined, search: search || undefined }
            });
            if (res.data?.success) setFaculty(res.data.data || []);
        } catch (e) {
            setError('Failed to load faculty onboarding data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFaculty(); }, [statusFilter]);

    const handleSearch = (e) => { e.preventDefault(); fetchFaculty(); };

    const openPanel = (f) => {
        setSelected(f);
        const init = {};
        CHECKLIST.forEach(c => { init[c.key] = f[c.key] === 1 || f[c.key] === true; });
        init.remarks = f.remarks || '';
        setForm(init);
    };

    const closePanel = () => { setSelected(null); setForm({}); };

    const toggle = (key) => setForm(prev => ({ ...prev, [key]: !prev[key] }));

    const save = async () => {
        if (!selected) return;
        try {
            setSaving(true);
            await axios.put(`${API_URL}/students/faculty-onboarding/${selected.id}`, form);
            showToast('Onboarding record saved.', 'success');
            fetchFaculty();
            // Update local selected state
            setSelected(prev => ({ ...prev, ...form }));
        } catch {
            showToast('Failed to save. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const activate = async () => {
        if (!selected) return;
        try {
            setActivating(true);
            const res = await axios.post(`${API_URL}/students/faculty-onboarding/${selected.id}/activate`);
            if (res.data?.success) {
                setActivateModal(res.data.data);
                showToast(`${res.data.data.full_name} activated as Active Faculty!`, 'success');
                fetchFaculty();
                setSelected(prev => ({ ...prev, moodle_activated: true }));
            }
        } catch (e) {
            showToast(e.response?.data?.message || 'Activation failed. Please try again.', 'error');
        } finally {
            setActivating(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard', 'success'));
    };

    const stats = useMemo(() => {
        const total = faculty.length;
        const pending = faculty.filter(f => f.onboarding_status === 'Pending').length;
        const inProgress = faculty.filter(f => f.onboarding_status === 'In Progress').length;
        const completed = faculty.filter(f => f.onboarding_status === 'Completed').length;
        return { total, pending, inProgress, completed };
    }, [faculty]);

    const completedTasks = useMemo(() => {
        if (!selected) return 0;
        return CHECKLIST.filter(c => form[c.key]).length;
    }, [form, selected]);

    return (
        <div className="p-6 max-w-screen-xl mx-auto">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Activation Success Modal */}
            {activateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <Zap size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Portal Account Created!</p>
                                    <p className="text-xs text-gray-500">SCL portal account ready — Moodle account will be created when you assign their first subject</p>
                                </div>
                            </div>
                            <button onClick={() => setActivateModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-sm font-semibold text-green-800 mb-3">Login Credentials</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between bg-white rounded-lg border border-green-200 px-3 py-2">
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="text-sm font-medium text-gray-900">{activateModal.email}</p>
                                        </div>
                                        <button onClick={() => copyToClipboard(activateModal.email)} className="p-1.5 hover:bg-green-50 rounded text-green-600"><Copy size={14} /></button>
                                    </div>
                                    {activateModal.password && (
                                        <div className="flex items-center justify-between bg-white rounded-lg border border-green-200 px-3 py-2">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">Temporary Password</p>
                                                <p className="text-sm font-mono font-medium text-gray-900">{showPassword ? activateModal.password : '••••••••••••'}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => setShowPassword(p => !p)} className="p-1.5 hover:bg-green-50 rounded text-gray-500">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                                                <button onClick={() => copyToClipboard(activateModal.password)} className="p-1.5 hover:bg-green-50 rounded text-green-600"><Copy size={14} /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 space-y-1">
                                <p><span className="font-semibold">Role:</span> {activateModal.portal_role}</p>
                                <p><span className="font-semibold">Account:</span> {activateModal.user_status === 'created' ? 'New account created' : 'Existing account updated'}</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                                <p className="font-semibold mb-1">Next step</p>
                                <p>Go to <strong>Active Faculty</strong> to assign a subject. Assigning their first subject will <strong>automatically create their Moodle account and enrol them as a teacher</strong> in one step.</p>
                            </div>
                            <p className="text-xs text-gray-400 text-center">Share these credentials securely with the faculty member. They can reset their password after first login.</p>
                        </div>
                        <div className="p-4 border-t border-gray-100">
                            <button onClick={() => setActivateModal(null)} className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">Done</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Faculty Onboarding</h1>
                <p className="text-gray-500 text-sm mt-1">Track onboarding completion for accepted faculty members</p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Faculty', value: stats.total,      icon: Users,       bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-200' },
                    { label: 'Pending',        value: stats.pending,    icon: Clock,       bg: 'bg-gray-50',   text: 'text-gray-700',  border: 'border-gray-200' },
                    { label: 'In Progress',    value: stats.inProgress, icon: AlertCircle, bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-200' },
                    { label: 'Completed',      value: stats.completed,  icon: CheckCircle2,bg: 'bg-green-50',  text: 'text-green-700', border: 'border-green-200' },
                ].map(({ label, value, icon: Icon, bg, text, border }) => (
                    <div key={label} className={`rounded-xl border p-4 flex items-center gap-3 ${bg} ${border}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bg} border ${border}`}>
                            <Icon size={18} className={text} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                            <p className={`text-xs font-medium ${text}`}>{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, email or reference…"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1">
                        <Search size={14} /> Search
                    </button>
                </form>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
                <button onClick={fetchFaculty} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50" title="Refresh">
                    <RefreshCw size={16} className="text-gray-500" />
                </button>
            </div>

            {/* Main layout */}
            <div className="flex gap-5">
                {/* List */}
                <div className={`bg-white rounded-xl border border-gray-200 shadow-sm flex-1 min-w-0 ${selected ? 'hidden lg:block lg:w-1/2' : 'w-full'}`}>
                    {error && (
                        <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                            <AlertCircle size={15} /> {error}
                        </div>
                    )}
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 size={24} className="animate-spin text-blue-500" />
                        </div>
                    ) : faculty.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <Users size={32} className="mb-2" />
                            <p className="text-sm">No accepted faculty members found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {faculty.map(f => {
                                const done = CHECKLIST.filter(c => f[c.key] === 1 || f[c.key] === true).length;
                                const pct = Math.round((done / CHECKLIST.length) * 100);
                                const sc = STATUS_CONFIG[f.onboarding_status] || STATUS_CONFIG.Pending;
                                const isActive = selected?.id === f.id;
                                return (
                                    <div
                                        key={f.id}
                                        onClick={() => openPanel(f)}
                                        className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-blue-50 transition-colors ${isActive ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                                    >
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                            {initials(f.full_name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-semibold text-gray-900 text-sm truncate">{f.full_name}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${sc.color}`}>
                                                    {f.onboarding_status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{f.email}</p>
                                            <div className="mt-1.5 flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-400' : 'bg-gray-300'}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400 shrink-0">{done}/{CHECKLIST.length}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-400 shrink-0" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Detail panel */}
                {selected && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full lg:w-1/2 flex flex-col">
                        {/* Panel header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {initials(selected.full_name)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{selected.full_name}</p>
                                    <p className="text-xs text-gray-500">{selected.registration_reference}</p>
                                </div>
                            </div>
                            <button onClick={closePanel} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Contact info */}
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1.5"><Mail size={12} />{selected.email}</span>
                            {selected.phone_number && <span className="flex items-center gap-1.5"><Phone size={12} />{selected.phone_number}</span>}
                            {selected.subject_specialisation && <span className="flex items-center gap-1.5 col-span-2"><BookOpen size={12} />{selected.subject_specialisation}</span>}
                            <span className="flex items-center gap-1.5"><Calendar size={12} />Applied: {fmt(selected.applied_at)}</span>
                        </div>

                        {/* Progress summary */}
                        <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700">Onboarding Progress</span>
                                <span className="text-xs font-bold text-gray-900">{completedTasks} / {CHECKLIST.length} tasks</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${completedTasks === CHECKLIST.length ? 'bg-green-500' : completedTasks > 0 ? 'bg-amber-400' : 'bg-gray-300'}`}
                                    style={{ width: `${Math.round((completedTasks / CHECKLIST.length) * 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Onboarding Checklist</p>
                            {CHECKLIST.map(({ key, label, desc }) => (
                                <label key={key} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${form[key] ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                    <input
                                        type="checkbox"
                                        checked={!!form[key]}
                                        onChange={() => toggle(key)}
                                        className="mt-0.5 w-4 h-4 accent-green-600 cursor-pointer"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${form[key] ? 'text-green-800 line-through' : 'text-gray-800'}`}>{label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                                    </div>
                                    {form[key] && <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />}
                                </label>
                            ))}

                            {/* Remarks */}
                            <div className="mt-3">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Remarks / Notes</label>
                                <textarea
                                    rows={3}
                                    value={form.remarks || ''}
                                    onChange={e => setForm(prev => ({ ...prev, remarks: e.target.value }))}
                                    placeholder="Add any additional notes…"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>

                        {/* Save + Activate buttons */}
                        <div className="p-4 border-t border-gray-100 space-y-2">
                            <button
                                onClick={save}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {saving ? 'Saving…' : 'Save Onboarding Record'}
                            </button>
                            {selected.onboarding_status === 'Completed' && (
                                selected.moodle_activated
                                    ? (
                                        <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-50 border border-green-300 text-green-700 rounded-lg text-sm font-medium">
                                            <CheckCircle2 size={16} />
                                            Portal Account Created — Assign Subject in Active Faculty
                                        </div>
                                    ) : (
                                        <button
                                            onClick={activate}
                                            disabled={activating}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            {activating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                            {activating ? 'Activating…' : 'Activate Faculty Account'}
                                        </button>
                                    )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
