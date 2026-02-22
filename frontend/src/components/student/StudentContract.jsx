import { useState } from 'react';
import { FileText, CheckCircle, Download } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function StudentContract({ user }) {
    const [accepted, setAccepted] = useState(false);
    const [signature, setSignature] = useState('');
    const [acceptanceDate, setAcceptanceDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleDownloadContract = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/students/contract-pdf`,
                { responseType: 'blob' }
            );
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Student_Contract_Terms.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download contract');
        }
    };

    const handleSubmit = async () => {
        if (!accepted) {
            alert('Please accept the contract terms');
            return;
        }

        if (!signature || signature.trim() === '') {
            alert('Please enter your signature');
            return;
        }

        if (!acceptanceDate) {
            alert('Please select the acceptance date');
            return;
        }

        try {
            setSubmitting(true);
            const response = await axios.post(
                `${API_URL}/students/accept-contract`,
                {
                    signature,
                    acceptance_date: acceptanceDate
                }
            );

            if (response.data?.success) {
                setSubmitted(true);
                alert('Contract accepted successfully!');
            } else {
                alert('Failed to accept contract: ' + (response.data?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Failed to accept contract: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Contract & Terms</h1>
                <p className="text-gray-600">Please review and accept the student contract and terms & conditions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {/* Contract Document Section */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="flex items-center gap-4 mb-6">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Contract & Terms of Study</h2>
                                <p className="text-gray-600 text-sm mt-1">Version 2.0 - Effective from January 2026</p>
                            </div>
                        </div>

                        {/* Contract Content */}
                        <div className="bg-gray-50 p-6 rounded-lg mb-6 max-h-96 overflow-y-auto border border-gray-200">
                            <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
                                <section>
                                    <h3 className="font-bold text-gray-900 mb-2">1. Introduction</h3>
                                    <p>This Student Contract sets out the rights and responsibilities of both the Institution and you as a student. It forms the basis of your relationship with the Institution and applies to all students, regardless of their mode or level of study.</p>
                                </section>

                                <section>
                                    <h3 className="font-bold text-gray-900 mb-2">2. Admission and Registration</h3>
                                    <p>Your acceptance of an offer of a place is conditional upon you:</p>
                                    <ul className="list-disc list-inside ml-2 space-y-1">
                                        <li>Meeting all conditions of your offer letter</li>
                                        <li>Providing all required documentation</li>
                                        <li>Maintaining satisfactory conduct and attendance</li>
                                        <li>Completing all registration requirements</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-bold text-gray-900 mb-2">3. Academic Standards</h3>
                                    <p>As a student, you are expected to:</p>
                                    <ul className="list-disc list-inside ml-2 space-y-1">
                                        <li>Maintain satisfactory academic progress</li>
                                        <li>Comply with assessment regulations and deadlines</li>
                                        <li>Uphold academic integrity and honesty</li>
                                        <li>Engage actively in your learning</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-bold text-gray-900 mb-2">4. Fees and Financial Obligations</h3>
                                    <p>You are responsible for:</p>
                                    <ul className="list-disc list-inside ml-2 space-y-1">
                                        <li>Paying tuition fees by the due date</li>
                                        <li>Paying any other charges specified in your fee agreement</li>
                                        <li>Informing the Institution of any financial difficulties</li>
                                        <li>Meeting payment plans if agreed</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-bold text-gray-900 mb-2">5. Code of Conduct</h3>
                                    <p>You must comply with the Institution's Code of Conduct, which includes:</p>
                                    <ul className="list-disc list-inside ml-2 space-y-1">
                                        <li>Treating others with respect</li>
                                        <li>Not engaging in harassment or discrimination</li>
                                        <li>Following health and safety regulations</li>
                                        <li>Respecting Institution property</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-bold text-gray-900 mb-2">6. Data Protection and Privacy</h3>
                                    <p>The Institution will process your personal data in accordance with applicable data protection laws. Your data will be used for educational, administrative and contractual purposes. You have rights regarding your data as detailed in our Privacy Policy.</p>
                                </section>

                                <section>
                                    <h3 className="font-bold text-gray-900 mb-2">7. Intellectual Property</h3>
                                    <p>Work created as part of your studies may be subject to intellectual property rights owned or co-owned by the Institution, as specified in individual course or programme documents.</p>
                                </section>

                                <section>
                                    <h3 className="font-bold text-gray-900 mb-2">8. Liability and Indemnity</h3>
                                    <p>The Institution is not liable for any indirect or consequential loss. You agree to indemnify the Institution against any claims arising from your breach of this contract or from your conduct as a student.</p>
                                </section>

                                <section>
                                    <h3 className="font-bold text-gray-900 mb-2">9. Suspension and Termination</h3>
                                    <p>The Institution may suspend or terminate this contract if you:</p>
                                    <ul className="list-disc list-inside ml-2 space-y-1">
                                        <li>Breach the terms of this contract</li>
                                        <li>Fail to meet academic progress requirements</li>
                                        <li>Commit serious misconduct</li>
                                        <li>Fail to pay fees without agreed arrangements</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-bold text-gray-900 mb-2">10. Disputes and Complaints</h3>
                                    <p>Any disputes arising from this contract will be handled in accordance with the Institution's Student Complaints Procedure. You have the right to seek resolution through this procedure.</p>
                                </section>

                                <section>
                                    <h3 className="font-bold text-gray-900 mb-2">11. Changes to Terms</h3>
                                    <p>The Institution reserves the right to change the terms of this contract with reasonable notice. Material changes will be communicated to you in writing.</p>
                                </section>

                                <section>
                                    <h3 className="font-bold text-gray-900 mb-2">12. Governing Law</h3>
                                    <p>This contract is governed by and construed in accordance with the laws of England and Wales, and the parties irrevocably submit to the exclusive jurisdiction of the English courts.</p>
                                </section>
                            </div>
                        </div>

                        {/* Download Button */}
                        <button
                            onClick={handleDownloadContract}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-6"
                        >
                            <Download className="w-5 h-5" />
                            Download Full Contract (PDF)
                        </button>
                    </div>

                    {/* Acceptance Form */}
                    {!submitted ? (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Accept Contract Terms</h3>

                            {/* Signature */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Signature (Full Name)
                                </label>
                                <input
                                    type="text"
                                    value={signature}
                                    onChange={(e) => setSignature(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">By entering your name, you are electronically signing this contract</p>
                            </div>

                            {/* Date of Acceptance */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Acceptance
                                </label>
                                <input
                                    type="date"
                                    value={acceptanceDate}
                                    onChange={(e) => setAcceptanceDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Checkbox */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={accepted}
                                        onChange={(e) => setAccepted(e.target.checked)}
                                        className="w-5 h-5 rounded mt-0.5"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            I have read and understood the Student Contract & Terms
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            I agree to comply with all the terms and conditions outlined above and accept the responsibilities as a student of the Institution.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !accepted}
                                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                                    accepted && !submitting
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                }`}
                            >
                                {submitting ? 'Accepting Contract...' : 'Accept Contract'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
                            <div className="flex items-center gap-4">
                                <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold text-green-900">Contract Accepted</h3>
                                    <p className="text-green-800 mt-1">
                                        You have successfully accepted the Student Contract & Terms on {new Date(acceptanceDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-green-700 mt-2">
                                        Signed by: {signature}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div>
                    <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Important Information</h3>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div>
                                <p className="font-medium text-gray-900 mb-1">Status</p>
                                <p className={submitted ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                                    {submitted ? '✓ Accepted' : '⏱ Pending Acceptance'}
                                </p>
                            </div>
                            <div className="border-t pt-4">
                                <p className="font-medium text-gray-900 mb-2">Requirements</p>
                                <ul className="space-y-2">
                                    <li className={`flex items-center gap-2 ${signature ? 'text-green-600' : 'text-gray-500'}`}>
                                        <span className="w-2 h-2 bg-current rounded-full"></span>
                                        Provide signature
                                    </li>
                                    <li className={`flex items-center gap-2 ${acceptanceDate ? 'text-green-600' : 'text-gray-500'}`}>
                                        <span className="w-2 h-2 bg-current rounded-full"></span>
                                        Select acceptance date
                                    </li>
                                    <li className={`flex items-center gap-2 ${accepted ? 'text-green-600' : 'text-gray-500'}`}>
                                        <span className="w-2 h-2 bg-current rounded-full"></span>
                                        Accept terms
                                    </li>
                                </ul>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-xs text-gray-500">
                                    <strong>Note:</strong> By accepting this contract, you acknowledge that you have read, understood and agree to be bound by all terms and conditions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
