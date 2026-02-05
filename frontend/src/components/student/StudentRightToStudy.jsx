import { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Calendar, Shield } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Helper function to format date as dd/mm/yyyy
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const StudentRightToStudy = () => {
    const [studentApp, setStudentApp] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [complianceConfirmed, setComplianceConfirmed] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setLoading(false);
                return;
            }
            
            const user = JSON.parse(userStr);
            
            // Get student application ID
            const appResponse = await axios.get(`${API_URL}/students/application/${user.email}`);
            if (appResponse.data.success) {
                const appId = appResponse.data.application.id;
                
                // Fetch Right to Study documents
                const docsResponse = await axios.get(`${API_URL}/students/right-to-study/${appId}`);
                if (docsResponse.data.success) {
                    setStudentApp(docsResponse.data.student);
                    setDocuments(docsResponse.data.documents);
                    setComplianceConfirmed(docsResponse.data.student.complianceConfirmed);
                }
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplianceConfirm = async () => {
        try {
            setSaveLoading(true);
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            
            const appResponse = await axios.get(`${API_URL}/students/application/${user.email}`);
            const appId = appResponse.data.application.id;

            const response = await axios.put(
                `${API_URL}/students/right-to-study/${appId}/confirm-compliance`
            );

            if (response.data.success) {
                setComplianceConfirmed(true);
                alert('Compliance confirmed successfully!');
            }
        } catch (error) {
            console.error('Error confirming compliance:', error);
            alert('Failed to confirm compliance. Please try again.');
        } finally {
            setSaveLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Approved': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            'Pending Review': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle },
            'Expired': { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
            'Rejected': { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle }
        };

        const config = statusConfig[status] || statusConfig['Pending Review'];
        const Icon = config.icon;

        return (
            <span className={`flex items-center gap-1 px-3 py-1 ${config.bg} ${config.text} rounded-full text-sm font-medium`}>
                <Icon className="w-4 h-4" />
                {status}
            </span>
        );
    };

    const getExpiryWarning = (days) => {
        if (days < 0) return { color: 'text-red-600', message: 'EXPIRED' };
        if (days < 30) return { color: 'text-red-600', message: `Expires in ${days} days - URGENT` };
        if (days < 90) return { color: 'text-yellow-600', message: `Expires in ${days} days - Action Required` };
        return { color: 'text-gray-600', message: `Expires in ${days} days` };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Right to Study - International Compliance</h1>
                <p className="text-gray-600">Manage your immigration documents and compliance status</p>
            </div>

            {/* Compliance Confirmation Section */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6 rounded-lg">
                <div className="flex items-start gap-4">
                    <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Compliance Confirmation Required</h3>
                        <p className="text-gray-700 mb-4">
                            As an international student, you must confirm that all your immigration documents are valid and up-to-date. 
                            This is a legal requirement under UK immigration law.
                        </p>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="compliance"
                                checked={complianceConfirmed}
                                onChange={(e) => setComplianceConfirmed(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label htmlFor="compliance" className="text-sm text-gray-900 font-medium cursor-pointer">
                                I confirm that all my immigration documents are valid and I have the right to study in the UK
                            </label>
                        </div>
                        {complianceConfirmed && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                <p className="text-sm text-green-800 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Compliance confirmed on {formatDate(studentApp?.complianceConfirmedAt || new Date().toISOString())}
                                </p>
                                {!studentApp?.complianceConfirmed && (
                                    <button
                                        onClick={handleComplianceConfirm}
                                        disabled={saveLoading}
                                        className="ml-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {saveLoading ? 'Saving...' : 'Save Confirmation'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Upload Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Required Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Upload Passport</p>
                    </button>
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Upload UK Visa</p>
                    </button>
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Upload BRP Card</p>
                    </button>
                    <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Upload Residency Proof</p>
                    </button>
                </div>
            </div>

            {/* Documents List with Expiry Tracking */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Your Immigration Documents</h2>
                    <p className="text-sm text-gray-600 mt-1">Track expiry dates and compliance status</p>
                </div>

                {documents.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No documents uploaded yet</p>
                        <p className="text-sm text-gray-500 mt-2">Upload your immigration documents above to get started</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {documents.map((doc) => {
                            const expiryWarning = getExpiryWarning(doc.daysUntilExpiry);
                            return (
                                <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-blue-100 rounded-lg">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{doc.type}</h3>
                                                <p className="text-sm text-gray-500">Uploaded on {formatDate(doc.uploadDate)}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(doc.status)}
                                    </div>
                                    
                                    <div className="ml-14 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Expiry Date</p>
                                                <p className="text-sm font-medium text-gray-900">{formatDate(doc.expiryDate)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className={`w-4 h-4 ${expiryWarning.color}`} />
                                            <div>
                                                <p className="text-sm text-gray-600">Status</p>
                                                <p className={`text-sm font-medium ${expiryWarning.color}`}>{expiryWarning.message}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {doc.daysUntilExpiry < 90 && (
                                        <div className="ml-14 mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                            <p className="text-sm text-yellow-800">
                                                <strong>Action Required:</strong> Please renew this document before it expires to maintain your right to study.
                                            </p>
                                        </div>
                                    )}

                                    <div className="ml-14 mt-4 flex gap-3">
                                        <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            View Document
                                        </button>
                                        <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            Upload New Version
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Audit Trail */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Compliance Audit Trail</h2>
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Passport verified and approved</p>
                            <p className="text-xs text-gray-500">January 15, 2026 at 10:30 AM by Admissions Office</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">UK Visa verified and approved</p>
                            <p className="text-xs text-gray-500">January 15, 2026 at 10:35 AM by Admissions Office</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">BRP Card pending review</p>
                            <p className="text-xs text-gray-500">February 1, 2026 at 2:15 PM - Awaiting verification</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentRightToStudy;
