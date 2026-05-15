import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const fmt = (n) => {
    const num = parseFloat(n) || 0;
    return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const fmtShort = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

const SEMESTER_LABELS = [
    'Year 1 — Semester 1',
    'Year 1 — Semester 2',
    'Year 2 — Semester 1',
    'Year 2 — Semester 2',
];

export default function FeeInvoice() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [fee, setFee] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = sessionStorage.getItem('accessToken');
        axios.get(`${API_URL}/induction-driven/student-fees/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then(r => setFee(r.data.data))
            .catch(e => setError(e.response?.data?.message || e.message));
    }, [id]);

    // Auto-print if ?print=1 is in the URL
    useEffect(() => {
        if (fee && searchParams.get('print') === '1') {
            setTimeout(() => window.print(), 400);
        }
    }, [fee, searchParams]);

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-600 text-sm">{error}</p>
        </div>
    );
    if (!fee) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const instalments = [
        { label: SEMESTER_LABELS[0], amount: fee.instalment_1_amount, due: fee.instalment_1_due, paid: fee.instalment_1_paid, paidAt: fee.instalment_1_paid_at },
        { label: SEMESTER_LABELS[1], amount: fee.instalment_2_amount, due: fee.instalment_2_due, paid: fee.instalment_2_paid, paidAt: fee.instalment_2_paid_at },
        { label: SEMESTER_LABELS[2], amount: fee.instalment_3_amount, due: fee.instalment_3_due, paid: fee.instalment_3_paid, paidAt: fee.instalment_3_paid_at },
        { label: SEMESTER_LABELS[3], amount: fee.instalment_4_amount, due: fee.instalment_4_due, paid: fee.instalment_4_paid, paidAt: fee.instalment_4_paid_at },
    ].filter(i => parseFloat(i.amount) > 0);

    const invoiceNumber = `INV-${String(fee.id).padStart(5, '0')}`;
    const issueDate = fmtDate(new Date());
    const statusLabel = { paid: 'PAID IN FULL', partial: 'PARTIALLY PAID', unpaid: 'OUTSTANDING', overdue: 'OVERDUE', waived: 'WAIVED' }[fee.fee_status] || 'OUTSTANDING';
    const statusColor = { paid: '#16a34a', partial: '#d97706', unpaid: '#dc2626', overdue: '#9f1239', waived: '#6b7280' }[fee.fee_status] || '#dc2626';

    return (
        <>
            {/* Print button bar — hidden when printing */}
            <div className="no-print bg-gray-100 border-b border-gray-200 px-6 py-3 flex items-center gap-3">
                <button
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-purple-700 text-white text-sm font-semibold rounded-lg hover:bg-purple-800 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print / Save as PDF
                </button>
                <button
                    onClick={() => window.close()}
                    className="px-4 py-2 bg-white border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
                >
                    Close
                </button>
                <span className="text-xs text-gray-400 ml-auto">Invoice {invoiceNumber}</span>
            </div>

            {/* Invoice content */}
            <div id="invoice" style={{ fontFamily: 'Georgia, serif', maxWidth: '800px', margin: '0 auto', padding: '48px 48px 64px', backgroundColor: '#fff', minHeight: '1050px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', paddingBottom: '24px', borderBottom: '3px solid #4c1d95' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ width: '48px', height: '48px', background: '#4c1d95', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>S</span>
                            </div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e1b4b', letterSpacing: '0.05em' }}>STRATFORD COLLEGE LONDON</div>
                                <div style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Fee Invoice / Payment Receipt</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.6', marginTop: '8px' }}>
                            <div>12 Water Lane, London, EC4R 3AB</div>
                            <div>Tel: +44 (0)20 1234 5678 | finance@stratfordcollege.ac.uk</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e1b4b', letterSpacing: '0.05em' }}>INVOICE</div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
                            <div><strong style={{ color: '#374151' }}>{invoiceNumber}</strong></div>
                            <div style={{ marginTop: '4px' }}>Issued: {issueDate}</div>
                            {fee.intake_start_date && <div>Intake: {fmtDate(fee.intake_start_date)}</div>}
                        </div>
                    </div>
                </div>

                {/* Bill To / Course Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '36px' }}>
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#9ca3af', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Bill To</div>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>{fee.student_name || '—'}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>{fee.student_email}</div>
                        {fee.application_reference && (
                            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>Ref: {fee.application_reference}</div>
                        )}
                    </div>
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#9ca3af', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Programme</div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>{fee.course_title || fee.course_code}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px' }}>Course Code: {fee.course_code}</div>
                        {fee.programme_type_name && (
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>{fee.programme_type_name}</div>
                        )}
                    </div>
                </div>

                {/* Payment status banner */}
                <div style={{ backgroundColor: statusColor + '12', border: `1px solid ${statusColor}33`, borderRadius: '8px', padding: '10px 16px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#374151' }}>Payment Status</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: statusColor, letterSpacing: '0.05em' }}>{statusLabel}</span>
                </div>

                {/* Fee Schedule Table */}
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#9ca3af', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>Fee Schedule</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f3f0ff', borderTop: '2px solid #4c1d95', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Semester</th>
                                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Due Date</th>
                                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Amount</th>
                                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Status</th>
                                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Date Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instalments.map((ins, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: ins.paid ? '#f0fdf4' : '#fff' }}>
                                    <td style={{ padding: '10px 12px', color: '#111827', fontWeight: ins.paid ? '500' : '400' }}>{ins.label}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#6b7280' }}>{fmtShort(ins.due)}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#111827' }}>{fmt(ins.amount)}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                        {ins.paid
                                            ? <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '12px' }}>✓ Paid</span>
                                            : <span style={{ color: '#dc2626', fontSize: '12px' }}>Pending</span>}
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                                        {ins.paid && ins.paidAt ? fmtShort(ins.paidAt) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Additional fees */}
                {(parseFloat(fee.partner_reg_fee) > 0 || parseFloat(fee.exam_fee) > 0) && (
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#9ca3af', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>Additional Charges</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <tbody>
                                {parseFloat(fee.partner_reg_fee) > 0 && (
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '8px 12px', color: '#374151' }}>Partner Registration Fee</td>
                                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>{fmt(fee.partner_reg_fee)}</td>
                                    </tr>
                                )}
                                {parseFloat(fee.exam_fee) > 0 && (
                                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '8px 12px', color: '#374151' }}>Exam / Assessment Fee</td>
                                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>{fmt(fee.exam_fee)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Totals */}
                <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '16px', marginBottom: '36px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <table style={{ fontSize: '13px', minWidth: '260px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '5px 12px', color: '#6b7280' }}>Total Course Fee</td>
                                    <td style={{ padding: '5px 12px', textAlign: 'right', fontWeight: '600', color: '#111827' }}>{fmt(fee.total_fee_gbp)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '5px 12px', color: '#16a34a' }}>Amount Paid</td>
                                    <td style={{ padding: '5px 12px', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>{fmt(fee.total_paid)}</td>
                                </tr>
                                <tr style={{ borderTop: '2px solid #111827' }}>
                                    <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#111827', fontSize: '15px' }}>Balance Due</td>
                                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', color: parseFloat(fee.balance_due) > 0 ? '#dc2626' : '#16a34a', fontSize: '15px' }}>
                                        {fmt(fee.balance_due)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notes */}
                {fee.notes && (
                    <div style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px 16px', marginBottom: '28px', fontSize: '12px', color: '#6b7280' }}>
                        <strong style={{ color: '#374151' }}>Notes: </strong>{fee.notes}
                    </div>
                )}

                {/* Footer */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#9ca3af', lineHeight: '1.6' }}>
                        <div>Stratford College London | Registered in England & Wales</div>
                        <div>For payment queries: finance@stratfordcollege.ac.uk</div>
                    </div>
                    <div style={{ fontSize: '10px', color: '#d1d5db', textAlign: 'right' }}>
                        <div>Generated: {issueDate}</div>
                        <div>{invoiceNumber}</div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; }
                    #invoice { max-width: 100%; padding: 32px 40px; }
                    @page { size: A4; margin: 12mm; }
                }
            `}</style>
        </>
    );
}
