import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    GraduationCap, CheckCircle2, Clock, AlertCircle, Search, X, ChevronRight,
    Mail, BookOpen, Calendar, Save, Loader2, RefreshCw, Filter
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CHECKLIST_SECTIONS = [
    {
        title: 'Admin Setup',
        color: 'blue',
        items: [
            { key: 'welcome_email_sent',      label: 'Welcome Email Sent',     desc: 'Welcome email with login credentials sent to student' },
            { key: 'portal_access_granted',   label: 'Portal Access Granted',  desc: 'Student portal login verified and working' },
            { key: 'moodle_enrolled',         label: 'Moodle Enrolled',        desc: 'Student enrolled in all relevant Moodle courses' },
            { key: 'orientation_attended',    label: 'Orientation Attended',   desc: 'Student attended induction / orientation session' },
            { key: 'it_setup_completed',      label: 'IT Setup Completed',     desc: 'Student email, library and IT access all working' },
            { key: 'student_id_issued',       label: 'Student ID Issued',      desc: 'Physical or virtual student ID card issued' },
            { key: 'library_access_setup',    label: 'Library Access Setup',   desc: 'Student library card and online access configured' },
        ]
    },
    {
        title: 'Policy Acknowledgements',
        color: 'purple',
        items: [
            { key: 'handbook_signed',                   label: 'Student Handbook',          desc: 'Student handbook read and acknowledged' },
            { key: 'course_handbook_acknowledged',      label: 'Course Handbook',           desc: 'Course-specific handbook acknowledged' },
            { key: 'assessment_policy_acknowledged',    label: 'Assessment Policy',         desc: 'Assessment and feedback policy acknowledged' },
            { key: 'code_of_conduct_signed',            label: 'Code of Conduct',           desc: 'Student code of conduct signed' },
            { key: 'health_safety_acknowledged',        label: 'Health & Safety',           desc: 'Health and safety policy acknowledged' },
            { key: 'academic_integrity_acknowledged',   label: 'Academic Integrity',        desc: 'Academic integrity and plagiarism policy acknowledged' },
            { key: 'attendance_policy_acknowledged',    label: 'Attendance Policy',         desc: 'Attendance requirements and policy acknowledged' },
            { key: 'it_policy_acknowledged',            label: 'IT Policy',                 desc: 'IT acceptable use policy acknowledged' },
            { key: 'data_protection_acknowledged',      label: 'Data Protection',           desc: 'Data protection and privacy notice acknowledged' },
            { key: 'complaints_policy_acknowledged',    label: 'Complaints Policy',         desc: 'Complaints and appeals procedure acknowledged' },
            { key: 'edi_policy_acknowledged',           label: 'EDI Policy',                desc: 'Equality, Diversity & Inclusion policy acknowledged' },
            { key: 'safeguarding_acknowledged',         label: 'Safeguarding',              desc: 'Safeguarding policy and reporting obligations acknowledged' },
            { key: 'prevent_acknowledged',              label: 'Prevent Duty',              desc: 'Prevent duty and radicalisation awareness acknowledged' },
        ]
    },
    {
        title: 'Consents & Declaration',
        color: 'green',
        items: [
            { key: 'consent_gdpr',             label: 'GDPR Consent',                desc: 'Consent to process personal data under GDPR' },
            { key: 'consent_awarding_bodies',  label: 'Share with Awarding Bodies',  desc: 'Consent to share data with awarding bodies' },
            { key: 'consent_marketing',        label: 'Marketing Communications',    desc: 'Consent to receive marketing and news communications' },
            { key: 'declaration_signed',       label: 'Declaration Signed',          desc: 'Student declaration of accuracy and agreement signed' },
        ]
    },
];

const CHECKLIST = CHECKLIST_SECTIONS.flatMap(s => s.items);

const STATUS_CONFIG = {
    Pending:       { color: 'bg-gray-100 text-gray-700',   bar: 'bg-gray-400'  },
    'In Progress': { color: 'bg-amber-100 text-amber-700', bar: 'bg-amber-400' },
    Completed:     { color: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
};

const initials = (fn = '', ln = '') => `${fn?.[0] ?? ''}${ln?.[0] ?? ''}`.toUpperCase();
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function StudentOnboarding() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({});
    const [toast, setToast] = useState(null);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await axios.get(`${API_URL}/students/student-onboarding`, {
                params: { status: statusFilter !== 'all' ? statusFilter : undefined, search: search || undefined }
            });
            if (res.data?.success) setStudents(res.data.data || []);
        } catch {
            setError('Failed to load student onboarding data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, [statusFilter]);

    const handleSearch = (e) => { e.preventDefault(); fetchStudents(); };

    const openPanel = (s) => {
        setSelected(s);
        const init = {};
        CHECKLIST.forEach(c => { init[c.key] = s[c.key] === 1 || s[c.key] === true; });
        init.remarks = s.remarks || '';
        init.onboarding_digital_signature = s.onboarding_digital_signature || '';
        setForm(init);
    };

    const closePanel = () => { setSelected(null); setForm({}); };

    const toggle = (key) => setForm(prev => ({ ...prev, [key]: !prev[key] }));

    const save = async () => {
        if (!selected) return;
        try {
            setSaving(true);
            await axios.put(`${API_URL}/students/student-onboarding/${selected.id}`, form);
            showToast('Onboarding record saved.', 'success');
            fetchStudents();
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

    const stats = useMemo(() => ({
        total:      students.length,
        pending:    students.filter(s => s.onboarding_status === 'Pending').length,
        inProgress: students.filter(s => s.onboarding_status === 'In Progress').length,
        completed:  students.filter(s => s.onboarding_status === 'Completed').length,
    }), [students]);

    const completedTasks = useMemo(() => {
        if (!selected) return 0;
        return CHECKLIST.filter(c => form[c.key]).length;
    }, [form, selected]);

    // Unique courses for filter (future use)
    const courses = useMemo(() => [...new Set(students.map(s => s.course_code).filter(Boolean))], [students]);

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
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Student Onboarding</h1>
                <p className="text-gray-500 text-sm mt-1">Track onboarding completion for admitted students</p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Students',  value: stats.total,      icon: GraduationCap, bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-200' },
                    { label: 'Pending',          value: stats.pending,    icon: Clock,         bg: 'bg-gray-50',   text: 'text-gray-700',  border: 'border-gray-200' },
                    { label: 'In Progress',      value: stats.inProgress, icon: AlertCircle,   bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-200' },
                    { label: 'Completed',        value: stats.completed,  icon: CheckCircle2,  bg: 'bg-green-50',  text: 'text-green-700', border: 'border-green-200' },
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
                            placeholder="Search by name or email…"
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
                <button onClick={fetchStudents} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50" title="Refresh">
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
                    ) : students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <GraduationCap size={32} className="mb-2" />
                            <p className="text-sm">No admitted students found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {students.map(s => {
                                const done = CHECKLIST.filter(c => s[c.key] === 1 || s[c.key] === true).length;
                                const pct = Math.round((done / CHECKLIST.length) * 100);
                                const sc = STATUS_CONFIG[s.onboarding_status] || STATUS_CONFIG.Pending;
                                const isActive = selected?.id === s.id;
                                return (
                                    <div
                                        key={s.id}
                                        onClick={() => openPanel(s)}
                                        className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-blue-50 transition-colors ${isActive ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                                    >
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                            {initials(s.first_name, s.last_name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-semibold text-gray-900 text-sm truncate">{s.first_name} {s.last_name}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${sc.color}`}>
                                                    {s.onboarding_status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{s.email} · {s.course_code}</p>
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
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {initials(selected.first_name, selected.last_name)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{selected.first_name} {selected.last_name}</p>
                                    <p className="text-xs text-gray-500">{selected.application_reference}</p>
                                </div>
                            </div>
                            <button onClick={closePanel} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Info strip */}
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1.5"><Mail size={12} />{selected.email}</span>
                            <span className="flex items-center gap-1.5"><BookOpen size={12} />{selected.course_title}</span>
                            <span className="flex items-center gap-1.5"><Calendar size={12} />Intake: {fmt(selected.intake_start_date)}</span>
                            <span className="flex items-center gap-1.5"><Calendar size={12} />Admitted: {fmt(selected.applied_at)}</span>
                        </div>

                        {/* Progress */}
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
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {CHECKLIST_SECTIONS.map(({ title, color, items }) => (
                                <div key={title}>
                                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                                        color === 'blue' ? 'text-blue-600' : color === 'purple' ? 'text-purple-600' : 'text-green-600'
                                    }`}>{title}</p>
                                    <div className="space-y-1.5">
                                        {items.map(({ key, label, desc }) => (
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
                                    </div>
                                </div>
                            ))}

                            {/* Digital Signature */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Digital Signature</label>
                                <input
                                    type="text"
                                    value={form.onboarding_digital_signature || ''}
                                    onChange={e => setForm(prev => ({ ...prev, onboarding_digital_signature: e.target.value }))}
                                    placeholder="Student full name as digital signature…"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Remarks */}
                            <div>
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

                        {/* Save button */}
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={save}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {saving ? 'Saving…' : 'Save Onboarding Record'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
