import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    CalendarCheck, RefreshCw, AlertTriangle, Clock, CheckCircle2,
    ChevronDown, ChevronRight, Loader2, Shield, FileText, BookOpen, ExternalLink
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const fmtDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getDaysUntil = (d) => {
    if (!d) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(d); target.setHours(0, 0, 0, 0);
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

const urgencyConfig = (days) => {
    if (days === null) return { label: 'No Date', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400', bar: 'bg-gray-300' };
    if (days < 0)   return { label: 'Overdue',      color: 'bg-red-100 text-red-700',    dot: 'bg-red-500',    bar: 'bg-red-500' };
    if (days < 30)  return { label: '< 30 days',    color: 'bg-red-50 text-red-600',     dot: 'bg-red-400',    bar: 'bg-red-400' };
    if (days < 90)  return { label: '< 90 days',    color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400', bar: 'bg-amber-400' };
    return               { label: 'OK',             color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500' };
};

const UrgencyBadge = ({ date }) => {
    const days = getDaysUntil(date);
    const cfg = urgencyConfig(days);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {days === null ? 'No Date' : days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d`}
        </span>
    );
};

const Section = ({ title, icon: Icon, items = [], columns, emptyMessage, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-scl-purple/10 rounded-lg">
                        <Icon className="w-4 h-4 text-scl-purple" />
                    </div>
                    <div className="text-left">
                        <h2 className="font-bold text-gray-900">{title}</h2>
                        <p className="text-xs text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>

            {open && (
                <div className="border-t border-gray-100">
                    {items.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">{emptyMessage}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {columns.map(c => (
                                            <th key={c.key} className={`px-4 py-2.5 font-semibold text-gray-600 text-left ${c.align === 'center' ? 'text-center' : ''}`}>
                                                {c.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {items.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            {columns.map(c => (
                                                <td key={c.key} className={`px-4 py-3 ${c.align === 'center' ? 'text-center' : ''}`}>
                                                    {c.render ? c.render(item) : String(item[c.key] || '—')}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ComplianceCalendar = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterUrgency, setFilterUrgency] = useState('all');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/induction-driven/compliance-calendar`);
            setData(res.data.data);
        } catch (e) {
            console.error('Failed to load compliance calendar:', e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filterByUrgency = (items, dateKey) => {
        if (filterUrgency === 'all') return items;
        return items.filter(item => {
            const days = getDaysUntil(item[dateKey]);
            if (filterUrgency === 'overdue') return days !== null && days < 0;
            if (filterUrgency === 'urgent')  return days !== null && days >= 0 && days < 30;
            if (filterUrgency === 'upcoming') return days !== null && days >= 30 && days < 90;
            return true;
        });
    };

    const summaryStats = data ? {
        overdue: [
            ...(data.induction_reviews || []).filter(i => getDaysUntil(i.review_date) !== null && getDaysUntil(i.review_date) < 0),
            ...(data.course_registration_reviews || []).filter(i => getDaysUntil(i.review_date) !== null && getDaysUntil(i.review_date) < 0),
        ].length,
        urgent: [
            ...(data.induction_reviews || []).filter(i => { const d = getDaysUntil(i.review_date); return d !== null && d >= 0 && d < 30; }),
            ...(data.course_registration_reviews || []).filter(i => { const d = getDaysUntil(i.review_date); return d !== null && d >= 0 && d < 30; }),
        ].length,
        section8: (data.section8_compliance || []).length,
        section7: (data.section7_reporting || []).length,
    } : {};

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CalendarCheck className="w-6 h-6 text-scl-purple" />
                        Compliance Calendar
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review deadlines, awarding body reporting obligations, and QA requirements from Course Inductions.
                    </p>
                </div>
                <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Summary Stats */}
            {data && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Overdue',   value: summaryStats.overdue,  icon: AlertTriangle, bg: 'bg-red-50',    text: 'text-red-700' },
                        { label: 'Urgent (< 30d)', value: summaryStats.urgent, icon: Clock, bg: 'bg-amber-50',   text: 'text-amber-700' },
                        { label: 'QA Requirements', value: summaryStats.section8, icon: Shield, bg: 'bg-blue-50',  text: 'text-blue-700' },
                        { label: 'Reporting Obligations', value: summaryStats.section7, icon: FileText, bg: 'bg-purple-50', text: 'text-scl-purple' },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
                                <div className="p-2 rounded-lg bg-white shadow-sm">
                                    <Icon className={`w-5 h-5 ${s.text}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{s.label}</p>
                                    <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Urgency Filter */}
            <div className="flex gap-2">
                {[['all', 'All'], ['overdue', 'Overdue'], ['urgent', 'Urgent < 30d'], ['upcoming', 'Upcoming < 90d']].map(([v, l]) => (
                    <button key={v} onClick={() => setFilterUrgency(v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
                            ${filterUrgency === v ? 'bg-scl-purple text-white border-scl-purple' : 'bg-white text-gray-600 border-gray-300 hover:border-scl-purple'}`}>
                        {l}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-scl-purple" />
                </div>
            ) : !data ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Unable to load compliance data.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Induction Review Dates */}
                    <Section
                        title="Course Induction Reviews"
                        icon={BookOpen}
                        defaultOpen={true}
                        emptyMessage="No induction review dates scheduled."
                        items={filterByUrgency(data.induction_reviews || [], 'review_date')}
                        columns={[
                            { key: 'course_code',  label: 'Course Code' },
                            { key: 'course_title', label: 'Title', render: (i) => <span className="text-gray-700">{i.course_title || '—'}</span> },
                            { key: 'awarding_body', label: 'Awarding Body', render: (i) => <span className="text-gray-500 text-xs">{i.awarding_body || '—'}</span> },
                            { key: 'review_date',  label: 'Review Date', render: (i) => fmtDate(i.review_date) },
                            { key: 'urgency',      label: 'Status', align: 'center', render: (i) => <UrgencyBadge date={i.review_date} /> },
                            { key: 'overall_status', label: 'Induction Status', render: (i) => (
                                <span className="capitalize text-xs font-medium text-gray-600">{i.overall_status || '—'}</span>
                            )},
                            { key: 'responsible_person', label: 'Owner', render: (i) => <span className="text-xs text-gray-500">{i.responsible_person || '—'}</span> },
                            { key: 'open', label: '', align: 'center', render: (i) => (
                                <button onClick={() => navigate(`/course-inductions/${i.id}`)} title="Open induction record"
                                    className="p-1.5 rounded-lg hover:bg-scl-purple/10 text-scl-purple transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            )},
                        ]}
                    />

                    {/* Course Registration Reviews */}
                    <Section
                        title="Course Registration Reviews"
                        icon={FileText}
                        defaultOpen={true}
                        emptyMessage="No course registration review dates found."
                        items={filterByUrgency(data.course_registration_reviews || [], 'review_date')}
                        columns={[
                            { key: 'course_code',  label: 'Course Code' },
                            { key: 'course_title', label: 'Title' },
                            { key: 'awarding_body', label: 'Awarding Body', render: (i) => <span className="text-xs text-gray-500">{i.awarding_body || '—'}</span> },
                            { key: 'review_date',  label: 'Review Date', render: (i) => fmtDate(i.review_date) },
                            { key: 'urgency',      label: 'Status', align: 'center', render: (i) => <UrgencyBadge date={i.review_date} /> },
                            { key: 'responsible_person', label: 'Programme Director', render: (i) => <span className="text-xs text-gray-500">{i.responsible_person || '—'}</span> },
                            { key: 'open', label: '', align: 'center', render: () => (
                                <button onClick={() => navigate('/course-registrations')} title="Open course registrations"
                                    className="p-1.5 rounded-lg hover:bg-scl-purple/10 text-scl-purple transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            )},
                        ]}
                    />

                    {/* Section 8 — QA Compliance */}
                    <Section
                        title="QA & Compliance Requirements (Induction Section 8)"
                        icon={Shield}
                        defaultOpen={false}
                        emptyMessage="No QA requirements found in course inductions."
                        items={data.section8_compliance || []}
                        columns={[
                            { key: 'course_code',    label: 'Course Code' },
                            { key: 'deadline_type',  label: 'Requirement Area' },
                            { key: 'description',    label: 'Description', render: (i) => (
                                <span className="text-xs text-gray-600 line-clamp-2 max-w-xs">{i.description || '—'}</span>
                            )},
                            { key: 'compliance_status', label: 'Status', render: (i) => (
                                <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full
                                    ${i.compliance_status === 'compliant' ? 'bg-emerald-100 text-emerald-700'
                                    : i.compliance_status === 'non_compliant' ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-600'}`}>
                                    {i.compliance_status || 'Not Set'}
                                </span>
                            )},
                            { key: 'responsible_person', label: 'Responsible', render: (i) => <span className="text-xs text-gray-500">{i.responsible_person || '—'}</span> },
                            { key: 'open', label: '', align: 'center', render: (i) => (
                                <button onClick={() => navigate(`/course-inductions/${i.induction_id}`)} title="Open induction record"
                                    className="p-1.5 rounded-lg hover:bg-scl-purple/10 text-scl-purple transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            )},
                        ]}
                    />

                    {/* Section 7 — Reporting Obligations */}
                    <Section
                        title="Awarding Body Reporting Obligations (Induction Section 7)"
                        icon={FileText}
                        defaultOpen={false}
                        emptyMessage="No reporting obligations found in course inductions."
                        items={data.section7_reporting || []}
                        columns={[
                            { key: 'course_code',    label: 'Course Code' },
                            { key: 'deadline_type',  label: 'Obligation' },
                            { key: 'description',    label: 'Description', render: (i) => (
                                <span className="text-xs text-gray-600 line-clamp-2 max-w-xs">{i.description || '—'}</span>
                            )},
                            { key: 'review_notes',   label: 'Notes', render: (i) => (
                                <span className="text-xs text-gray-500">{i.review_notes || '—'}</span>
                            )},
                            { key: 'compliance_status', label: 'Status', render: (i) => (
                                <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full
                                    ${i.compliance_status === 'compliant' ? 'bg-emerald-100 text-emerald-700'
                                    : i.compliance_status === 'non_compliant' ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-600'}`}>
                                    {i.compliance_status || 'Not Set'}
                                </span>
                            )},
                            { key: 'responsible_person', label: 'Responsible', render: (i) => <span className="text-xs text-gray-500">{i.responsible_person || '—'}</span> },
                            { key: 'open', label: '', align: 'center', render: (i) => (
                                <button onClick={() => navigate(`/course-inductions/${i.induction_id}`)} title="Open induction record"
                                    className="p-1.5 rounded-lg hover:bg-scl-purple/10 text-scl-purple transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            )},
                        ]}
                    />
                </div>
            )}
        </div>
    );
};

export default ComplianceCalendar;
