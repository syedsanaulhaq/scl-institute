import { useState, useEffect } from 'react';
import { PoundSterling, CreditCard, FileText, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const fmt = (n) => {
    const num = parseFloat(n) || 0;
    return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

const StatusBadge = ({ status }) => {
    const map = {
        paid:    { label: 'Paid',    cls: 'bg-emerald-100 text-emerald-800' },
        partial: { label: 'Partial', cls: 'bg-amber-100 text-amber-800' },
        unpaid:  { label: 'Unpaid',  cls: 'bg-red-100 text-red-700' },
        overdue: { label: 'Overdue', cls: 'bg-red-200 text-red-900' },
        waived:  { label: 'Waived',  cls: 'bg-gray-100 text-gray-600' },
    };
    const cfg = map[status] || map.unpaid;
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>;
};

const StudentFees = ({ user }) => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('overview');

    useEffect(() => {
        if (!user?.email) return;
        setLoading(true);
        axios.get(`${API_URL}/induction-driven/student-fees?email=${encodeURIComponent(user.email)}`)
            .then(r => setFees(r.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [user?.email]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-scl-purple" />
        </div>
    );

    if (!fees.length) return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <PoundSterling className="w-6 h-6 text-scl-purple" /> Fees & Payments
            </h1>
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-12 text-center">
                <PoundSterling className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No fee records found</p>
                <p className="text-sm text-gray-400 mt-1">Your fee schedule will appear here once your enrolment is confirmed.</p>
            </div>
        </div>
    );

    const fee = fees[0];
    const instalments = [
        { num: 1, label: 'Year 1 — Semester 1', amount: fee.instalment_1_amount, due: fee.instalment_1_due, paid: Boolean(fee.instalment_1_paid), paidAt: fee.instalment_1_paid_at },
        { num: 2, label: 'Year 1 — Semester 2', amount: fee.instalment_2_amount, due: fee.instalment_2_due, paid: Boolean(fee.instalment_2_paid), paidAt: fee.instalment_2_paid_at },
        { num: 3, label: 'Year 2 — Semester 1', amount: fee.instalment_3_amount, due: fee.instalment_3_due, paid: Boolean(fee.instalment_3_paid), paidAt: fee.instalment_3_paid_at },
        { num: 4, label: 'Year 2 — Semester 2', amount: fee.instalment_4_amount, due: fee.instalment_4_due, paid: Boolean(fee.instalment_4_paid), paidAt: fee.instalment_4_paid_at },
    ].filter(i => parseFloat(i.amount) > 0);

    const totalFee = parseFloat(fee.total_fee_gbp) || 0;
    const totalPaid = parseFloat(fee.total_paid) || 0;
    const balance = parseFloat(fee.balance_due) || 0;
    const pct = totalFee > 0 ? Math.round((totalPaid / totalFee) * 100) : 0;
    const nextUnpaid = instalments.find(i => !i.paid);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <PoundSterling className="w-6 h-6 text-scl-purple" /> Fees & Payments
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">{fee.course_code} — {fee.course_title}</p>
                </div>
                <StatusBadge status={fee.fee_status} />
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Fee', value: fmt(totalFee), color: 'text-gray-900', bg: 'bg-gray-50', icon: PoundSterling },
                    { label: 'Paid', value: fmt(totalPaid), color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
                    { label: 'Outstanding', value: fmt(balance), color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
                    { label: 'Next Due', value: nextUnpaid ? fmt(nextUnpaid.amount) : '—', sub: nextUnpaid ? fmtDate(nextUnpaid.due) : 'All paid', color: 'text-scl-purple', bg: 'bg-purple-50', icon: CreditCard },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                            <div className="flex items-center gap-2 mb-1">
                                <Icon className={`w-4 h-4 ${s.color}`} />
                                <p className="text-xs text-gray-500">{s.label}</p>
                            </div>
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                            {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
                        </div>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Payment Progress</span>
                    <span className="text-sm font-bold text-scl-purple">{pct}% paid</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-emerald-500 h-3 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{fmt(totalPaid)} of {fmt(totalFee)}</p>
            </div>

            {/* Overdue alert */}
            {fee.fee_status === 'overdue' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-800">Payment Overdue</p>
                        <p className="text-sm text-red-700 mt-0.5">Your payment is overdue. Please contact the Finance team as soon as possible.</p>
                    </div>
                </div>
            )}

            {/* Next payment alert */}
            {nextUnpaid && fee.fee_status !== 'overdue' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">Next Payment Due</p>
                        <p className="text-sm text-amber-700 mt-0.5">
                            {nextUnpaid.label}: <strong>{fmt(nextUnpaid.amount)}</strong> due on <strong>{fmtDate(nextUnpaid.due)}</strong>
                        </p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
                {['overview', 'schedule', 'history'].map(t => (
                    <button key={t} onClick={() => setSelectedTab(t)}
                        className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors
                            ${selectedTab === t ? 'text-scl-purple border-b-2 border-scl-purple -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
                        {t === 'overview' ? 'Overview' : t === 'schedule' ? 'Payment Schedule' : 'Payment History'}
                    </button>
                ))}
            </div>

            {/* Overview tab */}
            {selectedTab === 'overview' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Fee Breakdown</h3>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Course Tuition Fee</span>
                                <span className="font-semibold">{fmt(totalFee)}</span>
                            </div>
                            {parseFloat(fee.partner_reg_fee) > 0 && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Partner Registration Fee</span>
                                    <span className="font-semibold">{fmt(fee.partner_reg_fee)}</span>
                                </div>
                            )}
                            {parseFloat(fee.exam_fee) > 0 && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Exam / Assessment Fee</span>
                                    <span className="font-semibold">{fmt(fee.exam_fee)}</span>
                                </div>
                            )}
                            {fee.funding_option && (
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Funding Type</span>
                                    <span className="font-semibold capitalize">{fee.funding_option}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2 text-emerald-700 font-medium">
                                <span>Total Paid</span>
                                <span className="font-bold">{fmt(totalPaid)}</span>
                            </div>
                            <div className="flex justify-between py-2 text-amber-700 font-medium">
                                <span>Balance Due</span>
                                <span className="font-bold">{fmt(balance)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Bank Transfer Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {[['Account Name','SCL Institute'],['Sort Code','20-00-00'],['Account Number','12345678'],['Reference', fee.application_reference || fee.student_email]].map(([label, value]) => (
                                <div key={label}>
                                    <p className="text-xs text-gray-500">{label}</p>
                                    <p className="font-semibold text-gray-800">{value}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-3">Please include your reference when making a bank transfer so we can allocate your payment correctly.</p>
                    </div>
                    <a href={`/admin/student-fees/${fee.id}/invoice`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium">
                        <FileText className="w-4 h-4" /> Download Invoice
                    </a>
                </div>
            )}

            {/* Payment Schedule tab */}
            {selectedTab === 'schedule' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Instalment</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Due Date</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {instalments.map(ins => (
                                <tr key={ins.num} className={ins.paid ? 'bg-emerald-50/40' : ''}>
                                    <td className="px-5 py-4 font-medium text-gray-800">{ins.label}</td>
                                    <td className="px-5 py-4 text-gray-600">{fmtDate(ins.due)}</td>
                                    <td className="px-5 py-4 text-right font-semibold text-gray-900">{fmt(ins.amount)}</td>
                                    <td className="px-5 py-4 text-center">
                                        {ins.paid
                                            ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Paid</span>
                                            : <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"><Clock className="w-3.5 h-3.5" /> Pending</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-200">
                            <tr>
                                <td colSpan={2} className="px-5 py-3 font-semibold text-gray-700">Total</td>
                                <td className="px-5 py-3 text-right font-bold text-gray-900">{fmt(totalFee)}</td>
                                <td />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {/* Payment History tab */}
            {selectedTab === 'history' && (
                <div className="space-y-3">
                    {instalments.filter(i => i.paid).length === 0 ? (
                        <div className="bg-gray-50 rounded-xl p-10 text-center">
                            <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 font-medium">No payments recorded yet</p>
                        </div>
                    ) : instalments.filter(i => i.paid).map(ins => (
                        <div key={ins.num} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-100 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{ins.label}</p>
                                    <p className="text-xs text-gray-500">Paid on {fmtDate(ins.paidAt) || '—'}</p>
                                </div>
                            </div>
                            <p className="text-lg font-bold text-emerald-600">{fmt(ins.amount)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentFees;
