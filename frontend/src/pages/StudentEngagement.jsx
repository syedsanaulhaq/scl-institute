import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Users, Plus, Search, RefreshCw, X, Save, Loader2,
    CheckCircle2, AlertCircle, BarChart3, Briefcase, Heart,
    BookOpen, Accessibility, GraduationCap, ClipboardList
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const TABS = [
    { id: 'survey',           label: 'Surveys & Feedback',    icon: BarChart3,      color: 'blue' },
    { id: 'graduate_outcome', label: 'Graduate Outcomes',     icon: GraduationCap,  color: 'green' },
    { id: 'employability',    label: 'Employability Support', icon: Briefcase,      color: 'amber' },
    { id: 'support_service',  label: 'Student Support',       icon: Users,          color: 'purple' },
    { id: 'advising',         label: 'Academic Advising',     icon: BookOpen,       color: 'teal' },
    { id: 'wellbeing',        label: 'Wellbeing',             icon: Heart,          color: 'rose' },
    { id: 'disability',       label: 'Disability Support',    icon: Accessibility,  color: 'orange' },
];

const EMPLOYMENT_STATUSES = ['Employed', 'Self-Employed', 'Further Study', 'Unemployed', 'Unknown'];
const EMPLOYABILITY_TYPES = ['CV Workshop', 'Mock Interview', 'Internship', 'Career Fair', 'Mentorship', 'Other'];
const SERVICE_TYPES = ['Counselling', 'Financial', 'Accommodation', 'IT', 'Mental Health', 'Other'];
const WELLBEING_TYPES = ['Mental Health', 'Physical', 'Stress Management', 'Mindfulness', 'Other'];
const SURVEY_STATUSES = ['Active', 'Closed', 'Draft'];

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const emptyRecord = (type) => ({
    record_type: type,
    student_name: '', student_email: '',
    survey_title: '', survey_period: '', survey_link: '', survey_status: 'Active',
    graduation_date: '', employment_status: '', employer: '', job_title: '', evidence: '',
    support_type: '', service_type: '', outcome: '',
    advisor_name: '', meeting_date: '', discussion_notes: '', follow_up_actions: '',
    category_type: '', adjustments: '',
    notes: '', event_date: '', status: 'active'
});

export default function StudentEngagement() {
    const [activeTab, setActiveTab] = useState('survey');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState(emptyRecord('survey'));
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { record_type: activeTab };
            if (search) params.search = search;
            const res = await axios.get(`${API_URL}/student-engagement`, { params });
            if (res.data?.success) setRecords(res.data.data || []);
        } catch { showToast('Failed to load records.', 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { setRecords([]); fetchData(); }, [activeTab]);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
    const openNew = () => { setForm(emptyRecord(activeTab)); setSelected(null); setShowForm(true); };
    const openEdit = (r) => { setForm({ ...r }); setSelected(r); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setSelected(null); };

    const save = async () => {
        setSaving(true);
        try {
            if (selected?.id) await axios.put(`${API_URL}/student-engagement/${selected.id}`, form);
            else await axios.post(`${API_URL}/student-engagement`, form);
            showToast('Saved successfully.');
            fetchData(); closeForm();
        } catch { showToast('Failed to save.', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        try { await axios.delete(`${API_URL}/student-engagement/${id}`); showToast('Deleted.'); fetchData(); }
        catch { showToast('Failed to delete.', 'error'); }
    };

    const currentTab = TABS.find(t => t.id === activeTab);
    const colorMap = {
        blue: { btn: 'bg-blue-600 hover:bg-blue-700', tab: 'border-blue-500 text-blue-700 bg-blue-50', ring: 'focus:ring-blue-500' },
        green: { btn: 'bg-green-600 hover:bg-green-700', tab: 'border-green-500 text-green-700 bg-green-50', ring: 'focus:ring-green-500' },
        amber: { btn: 'bg-amber-600 hover:bg-amber-700', tab: 'border-amber-500 text-amber-700 bg-amber-50', ring: 'focus:ring-amber-500' },
        purple: { btn: 'bg-purple-600 hover:bg-purple-700', tab: 'border-purple-500 text-purple-700 bg-purple-50', ring: 'focus:ring-purple-500' },
        teal: { btn: 'bg-teal-600 hover:bg-teal-700', tab: 'border-teal-500 text-teal-700 bg-teal-50', ring: 'focus:ring-teal-500' },
        rose: { btn: 'bg-rose-600 hover:bg-rose-700', tab: 'border-rose-500 text-rose-700 bg-rose-50', ring: 'focus:ring-rose-500' },
        orange: { btn: 'bg-orange-600 hover:bg-orange-700', tab: 'border-orange-500 text-orange-700 bg-orange-50', ring: 'focus:ring-orange-500' },
    };
    const colors = colorMap[currentTab?.color] || colorMap.blue;

    const LabelInput = ({ label, name, type = 'text' }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <input type={type} value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${colors.ring}`} />
        </div>
    );
    const LabelTextarea = ({ label, name, rows = 3 }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <textarea rows={rows} value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${colors.ring} resize-none`} />
        </div>
    );
    const LabelSelect = ({ label, name, options }) => (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <select value={form[name] || ''} onChange={e => set(name, e.target.value)}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 ${colors.ring}`}>
                <option value="">Select…</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );

    // Render tab-specific form fields
    const renderFormFields = () => {
        const shared = (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <LabelInput label="Student Name" name="student_name" />
                <LabelInput label="Student Email" name="student_email" type="email" />
            </div>
        );

        switch (activeTab) {
            case 'survey':
                return (<>
                    {shared}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LabelInput label="Survey Title" name="survey_title" />
                        <LabelInput label="Survey Period (e.g. Term 1 2025)" name="survey_period" />
                        <LabelInput label="Survey Link / URL" name="survey_link" />
                        <LabelSelect label="Status" name="survey_status" options={SURVEY_STATUSES} />
                    </div>
                    <div className="mt-4"><LabelTextarea label="Notes / Results Summary" name="notes" /></div>
                </>);

            case 'graduate_outcome':
                return (<>
                    {shared}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LabelInput label="Graduation Date" name="graduation_date" type="date" />
                        <LabelSelect label="Employment Status" name="employment_status" options={EMPLOYMENT_STATUSES} />
                        <LabelInput label="Employer" name="employer" />
                        <LabelInput label="Job Title" name="job_title" />
                        <LabelInput label="Evidence (file or URL)" name="evidence" />
                    </div>
                    <div className="mt-4"><LabelTextarea label="Notes" name="notes" /></div>
                </>);

            case 'employability':
                return (<>
                    {shared}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LabelSelect label="Support Type" name="support_type" options={EMPLOYABILITY_TYPES} />
                        <LabelInput label="Date" name="event_date" type="date" />
                    </div>
                    <div className="mt-4"><LabelTextarea label="Notes" name="notes" /></div>
                </>);

            case 'support_service':
                return (<>
                    {shared}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LabelSelect label="Service Type" name="service_type" options={SERVICE_TYPES} />
                        <LabelInput label="Date" name="event_date" type="date" />
                    </div>
                    <div className="mt-4 space-y-3">
                        <LabelTextarea label="Outcome" name="outcome" />
                        <LabelTextarea label="Notes" name="notes" />
                    </div>
                </>);

            case 'advising':
                return (<>
                    {shared}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LabelInput label="Advisor Name" name="advisor_name" />
                        <LabelInput label="Meeting Date" name="meeting_date" type="date" />
                    </div>
                    <div className="mt-4 space-y-3">
                        <LabelTextarea label="Discussion Notes" name="discussion_notes" />
                        <LabelTextarea label="Follow-up Actions" name="follow_up_actions" />
                    </div>
                </>);

            case 'wellbeing':
                return (<>
                    {shared}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LabelSelect label="Wellbeing Type" name="category_type" options={WELLBEING_TYPES} />
                        <LabelInput label="Date" name="event_date" type="date" />
                    </div>
                    <div className="mt-4 space-y-3">
                        <LabelTextarea label="Outcome" name="outcome" />
                        <LabelTextarea label="Notes" name="notes" />
                    </div>
                </>);

            case 'disability':
                return (<>
                    {shared}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LabelInput label="Disability Type" name="category_type" />
                        <LabelInput label="Date" name="event_date" type="date" />
                        <LabelInput label="Evidence (file or URL)" name="evidence" />
                    </div>
                    <div className="mt-4 space-y-3">
                        <LabelTextarea label="Adjustments Provided" name="adjustments" rows={4} />
                        <LabelTextarea label="Notes" name="notes" />
                    </div>
                </>);

            default: return null;
        }
    };

    // Render table columns per tab
    const getColumns = () => {
        switch (activeTab) {
            case 'survey':          return [['Survey Title', 'survey_title'], ['Period', 'survey_period'], ['Survey Status', 'survey_status']];
            case 'graduate_outcome': return [['Employment', 'employment_status'], ['Employer', 'employer'], ['Graduation', 'graduation_date']];
            case 'employability':   return [['Support Type', 'support_type'], ['Date', 'event_date']];
            case 'support_service': return [['Service Type', 'service_type'], ['Outcome', 'outcome'], ['Date', 'event_date']];
            case 'advising':        return [['Advisor', 'advisor_name'], ['Meeting Date', 'meeting_date']];
            case 'wellbeing':       return [['Type', 'category_type'], ['Date', 'event_date'], ['Outcome', 'outcome']];
            case 'disability':      return [['Type', 'category_type'], ['Date', 'event_date']];
            default: return [];
        }
    };

    const columns = getColumns();

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
                        <Users className="text-teal-600" size={24} /> Student Engagement & Support
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Module 29 — Surveys, outcomes, advising, wellbeing and disability support</p>
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const tc = colorMap[tab.color];
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                isActive ? `${tc.tab} border` : 'text-gray-600 hover:bg-white hover:text-gray-900'
                            }`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Header row with search + add */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchData()}
                        placeholder={`Search ${currentTab?.label}…`}
                        className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 ${colors.ring}`} />
                </div>
                <button onClick={fetchData} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><RefreshCw size={16} className="text-gray-500" /></button>
                <button onClick={openNew} className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium ${colors.btn}`}>
                    <Plus size={16} /> Add {currentTab?.label}
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 size={24} className="animate-spin text-blue-500" /></div>
                ) : records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        {currentTab && <currentTab.icon size={32} className="mb-2" />}
                        <p className="text-sm">No {currentTab?.label} records found.</p>
                        <button onClick={openNew} className={`mt-3 px-4 py-2 text-white rounded-lg text-sm ${colors.btn}`}>Add First Record</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Student</th>
                                    {columns.map(([h]) => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                                    ))}
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Added</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {records.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{r.student_name || '—'}</p>
                                            <p className="text-xs text-gray-500">{r.student_email || ''}</p>
                                        </td>
                                        {columns.map(([, key]) => (
                                            <td key={key} className="px-4 py-3 text-gray-600">
                                                {key.includes('date') ? fmt(r[key]) : (r[key] || '—')}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3 text-gray-500">{fmt(r.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(r)} className="text-xs px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Edit</button>
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
                                {selected ? `Edit ${currentTab?.label}` : `Add ${currentTab?.label}`}
                            </h2>
                            <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        <div className="p-5 overflow-y-auto max-h-[75vh]">
                            {renderFormFields()}
                        </div>
                        <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={closeForm} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={save} disabled={saving} className={`flex items-center gap-2 px-5 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-60 ${colors.btn}`}>
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
