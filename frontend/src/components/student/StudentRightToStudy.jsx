import { useState, useEffect, useRef } from 'react';
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
    const [uploadingDoc, setUploadingDoc] = useState(null);
    const [message, setMessage] = useState(null);
    const [appId, setAppId] = useState(null);
    const fileInputRefs = useRef({});

    const baseUrl = API_URL.replace(/\/api$/, '');

    const documentTypes = [
        { label: 'Passport', type: 'passport_id' },
        { label: 'UK Visa', type: 'visa_immigration' },
        { label: 'BRP Card', type: 'brp_card' },
        { label: 'Residency Proof', type: 'residency_proof' }
    ];

    const loadDummyData = () => {
        setStudentApp({
            id: 0,
            name: 'Demo Student',
            email: 'demo.student@example.com',
            complianceConfirmed: true,
            rightToStudyVerified: true,
            complianceConfirmedAt: new Date().toISOString()
        });

        setDocuments([
            {
                id: 'demo-passport',
                type: 'Passport',
                documentType: 'passport_id',
                status: 'Approved',
                uploadDate: new Date().toISOString(),
                filePath: null,
                expiryDate: calculateExpiryDate('passport_id'),
                daysUntilExpiry: calculateDaysUntilExpiry('passport_id')
            },
            {
                id: 'demo-visa',
                type: 'UK Visa',
                documentType: 'visa_immigration',
                status: 'Pending Review',
                uploadDate: new Date().toISOString(),
                filePath: null,
                expiryDate: calculateExpiryDate('visa_immigration'),
                daysUntilExpiry: calculateDaysUntilExpiry('visa_immigration')
            },
            {
                id: 'demo-brp',
                type: 'BRP Card',
                documentType: 'brp_card',
                status: 'Approved',
                uploadDate: new Date().toISOString(),
                filePath: null,
                expiryDate: calculateExpiryDate('brp_card'),
                daysUntilExpiry: calculateDaysUntilExpiry('brp_card')
            }
        ]);

        setComplianceConfirmed(true);
        setMessage({ type: 'success', text: 'Showing demo compliance data.' });
    };

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setMessage({ type: 'error', text: 'User session not found. Please log in again.' });
                setLoading(false);
                return;
            }
            
            const user = JSON.parse(userStr);
            
            // Get student application by email
            const appResponse = await axios.get(`${API_URL}/students/applications`);
            if (appResponse.data?.success) {
                const apps = appResponse.data.data?.applications || [];
                const studentApp = apps.find((app) => app.email === user.email);

                if (!studentApp) {
                    loadDummyData();
                    return;
                }

                setAppId(studentApp.id);

                // Fetch Right to Study documents
                const docsResponse = await axios.get(`${API_URL}/students/right-to-study/${studentApp.id}`);
                if (docsResponse.data.success) {
                    setStudentApp(docsResponse.data.student);
                    setDocuments(docsResponse.data.documents);
                    setComplianceConfirmed(docsResponse.data.student.complianceConfirmed);
                }
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            loadDummyData();
        } finally {
            setLoading(false);
        }
    };

    const handleComplianceConfirm = async () => {
        try {
            setSaveLoading(true);
            if (!appId) {
                setMessage({ type: 'error', text: 'Application not found. Please refresh.' });
                return;
            }

            const response = await axios.put(
                `${API_URL}/students/right-to-study/${appId}/confirm-compliance`
            );

            if (response.data.success) {
                setComplianceConfirmed(true);
                setStudentApp((prev) => ({
                    ...prev,
                    complianceConfirmed: true,
                    complianceConfirmedAt: new Date().toISOString()
                }));
                setMessage({ type: 'success', text: 'Compliance confirmed successfully!' });
            }
        } catch (error) {
            console.error('Error confirming compliance:', error);
            setMessage({ type: 'error', text: 'Failed to confirm compliance. Please try again.' });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleFileChange = (docType, file) => {
        if (!file) return;

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File size must be less than 5MB.' });
            return;
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Only PDF, JPG, and PNG files are allowed.' });
            return;
        }

        uploadDocument(docType, file);
    };

    const uploadDocument = async (docType, file) => {
        if (!appId) {
            setMessage({ type: 'error', text: 'Application not found. Please refresh.' });
            return;
        }

        try {
            setUploadingDoc(docType);
            setMessage(null);

            const formData = new FormData();
            formData.append('document', file);
            formData.append('documentType', docType);

            const response = await axios.post(
                `${API_URL}/students/applications/${appId}/upload-document`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data?.success) {
                setMessage({ type: 'success', text: 'Document uploaded successfully.' });
                await fetchStudentData();
            } else {
                setMessage({ type: 'error', text: response.data?.message || 'Upload failed.' });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Upload failed.' });
        } finally {
            setUploadingDoc(null);
        }
    };

    const triggerFileInput = (docType) => {
        if (fileInputRefs.current[docType]) {
            fileInputRefs.current[docType].click();
        }
    };

    const handleViewDocument = (filePath) => {
        if (!filePath) {
            setMessage({ type: 'error', text: 'Document file not available.' });
            return;
        }
        window.open(`${baseUrl}${filePath}`, '_blank', 'noopener,noreferrer');
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

    const resolveDocType = (doc) => {
        if (doc.documentType) return doc.documentType;
        const map = {
            Passport: 'passport_id',
            'UK Visa': 'visa_immigration',
            'BRP Card': 'brp_card',
            'Residency Proof': 'residency_proof'
        };
        return map[doc.type] || 'passport_id';
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

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {message.text}
                </div>
            )}

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
                    {documentTypes.map((doc) => (
                        <div key={doc.type}>
                            <input
                                ref={(el) => (fileInputRefs.current[doc.type] = el)}
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange(doc.type, e.target.files[0])}
                            />
                            <button
                                onClick={() => triggerFileInput(doc.type)}
                                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                                disabled={uploadingDoc === doc.type}
                            >
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">
                                    {uploadingDoc === doc.type ? 'Uploading...' : `Upload ${doc.label}`}
                                </p>
                            </button>
                        </div>
                    ))}
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
                                                <p className="text-sm text-gray-500">
                                                    Uploaded on {doc.uploadDate ? formatDate(doc.uploadDate) : '—'}
                                                </p>
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
                                        <button
                                            onClick={() => handleViewDocument(doc.filePath)}
                                            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            View Document
                                        </button>
                                        <button
                                            onClick={() => triggerFileInput(resolveDocType(doc))}
                                            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
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
                {documents.length === 0 ? (
                    <p className="text-sm text-gray-600">No audit entries yet.</p>
                ) : (
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div key={`audit-${doc.id}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                {doc.status === 'Approved' ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {doc.type} {doc.status === 'Approved' ? 'verified and approved' : 'pending review'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {doc.uploadDate ? formatDate(doc.uploadDate) : 'Date not available'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentRightToStudy;
