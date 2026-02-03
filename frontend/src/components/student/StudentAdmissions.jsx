import { useState, useEffect, useRef } from 'react';
import { FileText, CheckCircle, Clock, Upload, Download, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentAdmissions = ({ user }) => {
    const [applicationData, setApplicationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null);
    const fileInputRefs = useRef({});

    useEffect(() => {
        fetchApplicationData();
    }, [user]);

    const fetchApplicationData = async () => {
        try {
            const response = await axios.get(`${API_URL}/students/applications`);
            if (response.data?.success) {
                const apps = response.data.data?.applications || [];
                const studentApp = apps.find(app => app.email === user.email);
                setApplicationData(studentApp);
            }
        } catch (error) {
            console.error('Error fetching application:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (docField, file) => {
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Check file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only PDF and image files (JPG, PNG) are allowed');
            return;
        }

        try {
            setUploading(docField);
            const formData = new FormData();
            formData.append('document', file);
            formData.append('documentType', docField);
            formData.append('applicationId', applicationData.id);

            const response = await axios.post(
                `${API_URL}/students/applications/${applicationData.id}/upload-document`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data?.success) {
                alert('Document uploaded successfully!');
                await fetchApplicationData(); // Refresh data
            } else {
                alert('Upload failed: ' + (response.data?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload document: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(null);
        }
    };

    const triggerFileInput = (docField) => {
        if (fileInputRefs.current[docField]) {
            fileInputRefs.current[docField].click();
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted': return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'under_review': return <Clock className="w-6 h-6 text-yellow-600" />;
            case 'submitted': return <Clock className="w-6 h-6 text-blue-600" />;
            default: return <AlertCircle className="w-6 h-6 text-gray-600" />;
        }
    };

    const documents = [
        { name: 'Passport/ID', field: 'passport_id_document', required: true },
        { name: 'Academic Certificates', field: 'academic_certificates', required: true },
        { name: 'Academic Transcripts', field: 'academic_transcripts', required: true },
        { name: 'English Certificate', field: 'english_certificate', required: true },
        { name: 'CV/Resume', field: 'cv_resume', required: false },
        { name: 'Work Reference', field: 'work_reference', required: false },
        { name: 'Proof of Address', field: 'proof_of_address', required: false }
    ];

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admissions & Enrolment</h1>

            {/* Application Status */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Application Status</h2>
                {applicationData ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            {getStatusIcon(applicationData.application_status)}
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">Status: {applicationData.application_status?.replace(/_/g, ' ').toUpperCase()}</p>
                                <p className="text-sm text-gray-600">Reference: {applicationData.application_reference}</p>
                            </div>
                        </div>

                        {applicationData.application_status === 'accepted' && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h3 className="font-semibold text-green-900 mb-2">🎉 Congratulations! Your application has been accepted</h3>
                                <p className="text-sm text-green-800 mb-4">Please complete the following enrolment steps:</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-gray-700">Application Submitted</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-gray-700">Application Reviewed and Accepted</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-600" />
                                        <span className="text-sm text-gray-700">Upload Required Documents</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">Complete Induction</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">Enrolment Complete</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-600">No application found</p>
                )}
            </div>

            {/* Required Documents */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Required Documents</h2>
                <div className="space-y-3">
                    {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="font-medium text-gray-900">{doc.name}</p>
                                    {doc.required && <span className="text-xs text-red-600">Required</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {applicationData?.[doc.field] ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="text-sm text-green-600">Uploaded</span>
                                        <button 
                                            onClick={() => triggerFileInput(doc.field)}
                                            className="ml-2 text-xs text-blue-600 hover:text-blue-700 underline"
                                        >
                                            Replace
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => triggerFileInput(doc.field)}
                                            disabled={uploading === doc.field}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <Upload className="w-4 h-4" />
                                            {uploading === doc.field ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </>
                                )}
                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    ref={el => fileInputRefs.current[doc.field] = el}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) handleFileUpload(doc.field, file);
                                        e.target.value = ''; // Reset input
                                    }}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-sm text-gray-600">
                    <strong>Accepted formats:</strong> PDF, JPG, PNG | <strong>Max size:</strong> 5MB per file
                </p>
            </div>

            {/* Student Contract */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Student Contract & Terms</h2>
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900 mb-2">Please review and acknowledge the following:</p>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={applicationData?.consent_gdpr} disabled className="rounded" />
                                <span>GDPR Data Protection Policy</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={applicationData?.declaration_truth} disabled className="rounded" />
                                <span>Student Code of Conduct</span>
                            </label>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                        <Download className="w-4 h-4" />
                        Download Student Handbook
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentAdmissions;
