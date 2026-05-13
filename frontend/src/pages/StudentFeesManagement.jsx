import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
    PoundSterling, CheckCircle2, Clock, AlertCircle, RefreshCw,
    Search, ChevronDown, ChevronUp, Edit2, Save, X, Loader2,
    TrendingUp, Users, BadgeCheck, AlertTriangle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const STATUS_CONFIG = {
    paid:    { label: 'Paid',    color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
    partial: { label: 'Partial', color: 'bg-amber-100 text-amber-800',    icon: Clock },
    unpaid:  { label: 'Unpaid',  color: 'bg-red-100 text-red-800',        icon: AlertCircle },
    overdue: { label: 'Overdue', color: 'bg-red-200 text-red-900',        icon: AlertTriangle },
    waived:  { label: 'Waived',  color: 'bg-gray-100 text-gray-600',      icon: BadgeCheck },
};

const fmt = (n) => {
    const num = parseFloat(n) || 0;
    return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unpaid;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
            <Icon className="w-3 h-3" />{cfg.label}
        </span>
    );
};

const InstalmentRow = ({ label, amount, due, paid, onToggle, saving }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-3">
            <button
                onClick={onToggle}
                disabled={saving}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                    ${paid ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 hover:border-emerald-400'}`}
            >
                {paid && <CheckCircle2 className="w-3 h-3" />}
            </button>
            <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-500">Due: {fmtDate(due)}</p>
            </div>
        </div>
        <span className={`text-sm font-semibold ${paid ? 'text-emerald-600' : 'text-gray-700'}`}>
            {fmt(amount)}
        </span>
    </div>
);

// ── Fee Detail Modal ──────────────────────────────────────────────────────────
const FeeDetailModal = ({ fee, onClose, onSaved }) => {
    const [form, setForm] = useState({ ...fee });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const toggleInstalment = async (num) => {
        const key = `instalment_${num}_paid`;
        const newVal = !form[key];
        const updated = { ...form, [key]: newVal };
        setForm(updated);
        await save(updated);
    };

    const save = async (data = form) => {
        setSaving(true); setError('');
        try {
            const res = await axios.put(`${API_URL}/induction-driven/student-fees/${fee.id}`, data);
            setForm(res.data.data);
            onSaved(res.data.data);
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{form.student_name || form.student_email}</h2>
                        <p className="text-sm text-gray-500">{form.course_code} — {form.course_title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500 mb-1">Total Fee</p>
                            <p className="text-lg font-bold text-gray-900">{fmt(form.total_fee_gbp)}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500 mb-1">Paid</p>
                            <p className="text-lg font-bold text-emerald-700">{fmt(form.total_paid)}</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500 mb-1">Balance</p>
                            <p className="text-lg font-bold text-amber-700">{fmt(form.balance_due)}</p>
                        </div>
                    </div>

                    {/* Instalments */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Instalments</h3>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <InstalmentRow label="Instalment 1" amount={form.instalment_1_amount} due={form.instalment_1_due}
                                paid={Boolean(form.instalment_1_paid)} onToggle={() => toggleInstalment(1)} saving={saving} />
                            <InstalmentRow label="Instalment 2" amount={form.instalment_2_amount} due={form.instalment_2_due}
                                paid={Boolean(form.instalment_2_paid)} onToggle={() => toggleInstalment(2)} saving={saving} />
                            <InstalmentRow label="Instalment 3" amount={form.instalment_3_amount} due={form.instalment_3_due}
                                paid={Boolean(form.instalment_3_paid)} onToggle={() => toggleInstalment(3)} saving={saving} />
                        </div>
                    </div>

                    {/* Other Fees */}
                    {(parseFloat(form.partner_reg_fee) > 0 || parseFloat(form.exam_fee) > 0) && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Additional Charges</h3>
                            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                                {parseFloat(form.partner_reg_fee) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Partner Registration Fee</span>
                                        <span className="font-medium">{fmt(form.partner_reg_fee)}</span>
                                    </div>
                                )}
                                {parseFloat(form.exam_fee) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Exam / Assessment Fee</span>
                                        <span className="font-medium">{fmt(form.exam_fee)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                        <textarea rows={2} value={form.notes || ''}
                            onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            placeholder="Payment notes, special arrangements..." />
                    </div>

                    {/* Source badge */}
                    <p className="text-xs text-gray-400">
                        Fee structure source: <span className="font-medium capitalize">{form.source}</span>
                        {form.induction_id && ` (Induction #${form.induction_id})`}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                            Close
                        </button>
                        <button onClick={() => save()} disabled={saving}
                            className="flex-1 px-4 py-2 bg-scl-purple text-white rounded-lg text-sm font-semibold hover:bg-purple-800 disabled:opacity-50 flex items-center justify-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Notes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const StudentFeesManagement = () => {
    const [fees, setFees] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedFee, setSelectedFee] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [feesRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/induction-driven/student-fees`),
                axios.get(`${API_URL}/induction-driven/student-fees/summary/stats`)
            ]);
            setFees(feesRes.data.data || []);
            setStats(statsRes.data.data || null);
        } catch (e) {
            console.error('Failed to load fees:', e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = fees.filter(f => {
        const q = search.toLowerCase();
        const matchSearch = !q || [f.student_name, f.student_email, f.course_code, f.course_title, f.application_reference]
            .some(v => String(v || '').toLowerCase().includes(q));
        const matchStatus = !filterStatus || f.fee_status === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleSaved = (updated) => {
        setFees(prev => prev.map(f => f.id === updated.id ? { ...f, ...updated } : f));
        if (selectedFee?.id === updated.id) setSelectedFee({ ...selectedFee, ...updated });
        load(); // refresh stats
    };

    const toggleRow = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <PoundSterling className="w-6 h-6 text-scl-purple" />
                        Student Fee Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Fee schedules are auto-generated from Course Induction Section 5 when a student is accepted.
                    </p>
                </div>
                <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Expected', value: fmt(stats.total_expected), icon: TrendingUp, color: 'text-gray-700', bg: 'bg-gray-50' },
                        { label: 'Total Collected', value: fmt(stats.total_collected), icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                        { label: 'Outstanding', value: fmt(stats.total_outstanding), icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
                        { label: 'Students', value: stats.total_records, icon: Users, color: 'text-scl-purple', bg: 'bg-purple-50' },
                    ].map(s => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
                                <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                                    <Icon className={`w-5 h-5 ${s.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{s.label}</p>
                                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Status Pills */}
            <div className="flex flex-wrap gap-2">
                {[['', 'All'], ['unpaid', 'Unpaid'], ['partial', 'Partial'], ['paid', 'Paid'], ['overdue', 'Overdue'], ['waived', 'Waived']].map(([v, l]) => (
                    <button key={v} onClick={() => setFilterStatus(v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
                            ${filterStatus === v ? 'bg-scl-purple text-white border-scl-purple' : 'bg-white text-gray-600 border-gray-300 hover:border-scl-purple'}`}>
                        {l}
                        {v && stats && (
                            <span className="ml-1 opacity-75">
                                ({stats[v] || 0})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by student name, email, course code..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-scl-purple" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                    <PoundSterling className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No fee records found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Fee records are created automatically when a student application is accepted.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-6"></th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-600">Course</th>
                                <th className="text-right px-4 py-3 font-semibold text-gray-600">Total Fee</th>
                                <th className="text-right px-4 py-3 font-semibold text-gray-600">Paid</th>
                                <th className="text-right px-4 py-3 font-semibold text-gray-600">Balance</th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(f => (
                                <>
                                    <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <button onClick={() => toggleRow(f.id)} className="text-gray-400 hover:text-gray-600">
                                                {expandedRows[f.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{f.student_name || '—'}</p>
                                            <p className="text-xs text-gray-500">{f.student_email}</p>
                                            {f.application_reference && (
                                                <p className="text-xs text-gray-400">Ref: {f.application_reference}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-700">{f.course_code}</p>
                                            <p className="text-xs text-gray-500">{f.course_title}</p>
                                            {f.programme_type_name && (
                                                <p className="text-xs text-gray-400">{f.programme_type_name}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(f.total_fee_gbp)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">{fmt(f.total_paid)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-amber-600">{fmt(f.balance_due)}</td>
                                        <td className="px-4 py-3 text-center"><StatusBadge status={f.fee_status} /></td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => setSelectedFee(f)}
                                                className="px-3 py-1.5 text-xs font-semibold bg-scl-purple/10 text-scl-purple rounded-lg hover:bg-scl-purple/20 flex items-center gap-1 mx-auto">
                                                <Edit2 className="w-3 h-3" /> Manage
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRows[f.id] && (
                                        <tr key={`${f.id}-exp`} className="bg-gray-50">
                                            <td colSpan={8} className="px-6 py-4">
                                                <div className="grid grid-cols-3 gap-4 text-xs">
                                                    {[
                                                        { label: 'Instalment 1', amount: f.instalment_1_amount, due: f.instalment_1_due, paid: f.instalment_1_paid },
                                                        { label: 'Instalment 2', amount: f.instalment_2_amount, due: f.instalment_2_due, paid: f.instalment_2_paid },
                                                        { label: 'Instalment 3', amount: f.instalment_3_amount, due: f.instalment_3_due, paid: f.instalment_3_paid },
                                                    ].map(ins => (
                                                        <div key={ins.label} className={`p-3 rounded-lg border ${ins.paid ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                {ins.paid
                                                                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                                    : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                                                                <span className="font-semibold">{ins.label}</span>
                                                            </div>
                                                            <p className="text-base font-bold">{fmt(ins.amount)}</p>
                                                            <p className="text-gray-500">Due: {fmtDate(ins.due)}</p>
                                                            <p className={ins.paid ? 'text-emerald-600 font-medium' : 'text-amber-600'}>
                                                                {ins.paid ? 'Paid' : 'Pending'}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {f.funding_option && (
                                                    <p className="mt-2 text-xs text-gray-500">
                                                        Funding: <span className="font-medium">{f.funding_option}</span>
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detail Modal */}
            {selectedFee && (
                <FeeDetailModal fee={selectedFee} onClose={() => setSelectedFee(null)} onSaved={handleSaved} />
            )}
        </div>
    );
};

export default StudentFeesManagement;
