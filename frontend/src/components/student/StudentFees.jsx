import { useState } from 'react';
import { DollarSign, CreditCard, FileText, Download, Clock, CheckCircle } from 'lucide-react';

const StudentFees = () => {
    const [selectedTab, setSelectedTab] = useState('overview');

    const feeAccount = {
        totalTuition: 12000,
        paid: 8000,
        outstanding: 4000,
        nextPayment: 4000,
        nextPaymentDate: '2026-03-01'
    };

    const paymentHistory = [
        { id: 1, date: '2025-10-15', amount: 4000, method: 'Bank Transfer', status: 'Completed', receipt: 'RCP-2025-001' },
        { id: 2, date: '2026-01-10', amount: 4000, method: 'Card Payment', status: 'Completed', receipt: 'RCP-2026-001' }
    ];

    const paymentSchedule = [
        { installment: 1, dueDate: '2025-10-15', amount: 4000, status: 'paid' },
        { installment: 2, dueDate: '2026-01-15', amount: 4000, status: 'paid' },
        { installment: 3, dueDate: '2026-03-01', amount: 4000, status: 'pending' }
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> Paid
                </span>;
            case 'pending':
                return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    <Clock className="w-3 h-3" /> Pending
                </span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {status}
                </span>;
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Fees & Payments</h1>

            {/* Account Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-8 h-8 text-blue-600" />
                        <p className="text-sm text-gray-600">Total Tuition</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">£{feeAccount.totalTuition.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <p className="text-sm text-gray-600">Paid</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">£{feeAccount.paid.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-8 h-8 text-orange-600" />
                        <p className="text-sm text-gray-600">Outstanding</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">£{feeAccount.outstanding.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="w-8 h-8 text-purple-600" />
                        <p className="text-sm text-gray-600">Next Payment</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">£{feeAccount.nextPayment.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Due: {new Date(feeAccount.nextPaymentDate).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Payment Progress</h3>
                    <span className="text-sm text-gray-600">{Math.round((feeAccount.paid / feeAccount.totalTuition) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                        className="bg-green-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${(feeAccount.paid / feeAccount.totalTuition) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setSelectedTab('overview')}
                    className={`px-4 py-2 font-medium ${selectedTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setSelectedTab('schedule')}
                    className={`px-4 py-2 font-medium ${selectedTab === 'schedule' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                    Payment Schedule
                </button>
                <button
                    onClick={() => setSelectedTab('history')}
                    className={`px-4 py-2 font-medium ${selectedTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                    Payment History
                </button>
            </div>

            {/* Overview Tab */}
            {selectedTab === 'overview' && (
                <div className="space-y-6">
                    {feeAccount.outstanding > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Payment Due</h3>
                            <p className="text-yellow-800 mb-4">
                                Your next payment of £{feeAccount.nextPayment.toLocaleString()} is due on {new Date(feeAccount.nextPaymentDate).toLocaleDateString()}
                            </p>
                            <button className="flex items-center gap-2 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                                <CreditCard className="w-4 h-4" />
                                Make Payment
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border cursor-pointer hover:border-blue-500">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Credit/Debit Card</p>
                                    <p className="text-sm text-gray-600">Pay securely online with your card</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border cursor-pointer hover:border-blue-500">
                                <DollarSign className="w-6 h-6 text-green-600" />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Bank Transfer</p>
                                    <p className="text-sm text-gray-600">Transfer directly from your bank account</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border cursor-pointer hover:border-blue-500">
                                <FileText className="w-6 h-6 text-purple-600" />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Payment Plan</p>
                                    <p className="text-sm text-gray-600">Arrange an installment plan</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Bank Details for Transfer</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Account Name</p>
                                <p className="font-medium">SCL Institute</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Sort Code</p>
                                <p className="font-medium">12-34-56</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Account Number</p>
                                <p className="font-medium">12345678</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Reference</p>
                                <p className="font-medium">Your Student ID</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Schedule Tab */}
            {selectedTab === 'schedule' && (
                <div className="bg-white rounded-lg shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Installment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {paymentSchedule.map((payment) => (
                                    <tr key={payment.installment} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            Installment {payment.installment}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {new Date(payment.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            £{payment.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.status === 'pending' ? (
                                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                    Pay Now
                                                </button>
                                            ) : (
                                                <button className="text-gray-400 text-sm">
                                                    View Receipt
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payment History Tab */}
            {selectedTab === 'history' && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h3 className="font-semibold text-gray-900">Transaction History</h3>
                    </div>
                    <div className="divide-y">
                        {paymentHistory.map((payment) => (
                            <div key={payment.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <p className="font-semibold text-gray-900">Payment Received</p>
                                        </div>
                                        <p className="text-sm text-gray-600 ml-8">
                                            {new Date(payment.date).toLocaleDateString()} • {payment.method}
                                        </p>
                                        <p className="text-xs text-gray-500 ml-8">Receipt: {payment.receipt}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-green-600">£{payment.amount.toLocaleString()}</p>
                                        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mt-2">
                                            <Download className="w-4 h-4" />
                                            Download Receipt
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentFees;
