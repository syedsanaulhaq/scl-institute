import { useState, useEffect, useRef } from 'react';
import { FileText, CheckCircle, Clock, Upload, Download, AlertCircle, Award, GraduationCap } from 'lucide-react';
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

const StudentAdmissions = ({ user }) => {
    const [applicationData, setApplicationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null);
    const [activeTab, setActiveTab] = useState('status');
    const fileInputRefs = useRef({});

    useEffect(() => {
        fetchApplicationData();
    }, [user]);

    const fetchApplicationData = async () => {
        try {
            const response = await axios.get(`${API_URL}/students/applications`);
            console.log('Applications response:', response.data);
            
            if (response.data?.success) {
                const apps = response.data.data?.applications || [];
                console.log('All applications:', apps);
                console.log('Looking for email:', user?.email);
                
                // Find matching application by email
                const studentApp = apps.find(app => app.email === user?.email);
                console.log('Found application:', studentApp);
                
                setApplicationData(studentApp || apps[0] || null);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600';
            case 'in_progress': return 'text-yellow-600';
            case 'pending': return 'text-gray-600';
            default: return 'text-gray-600';
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

    // Enrolment steps based on application status
    const getEnrolmentSteps = () => {
        if (!applicationData) return [];
        
        const baseSteps = [
            { id: 1, title: 'Submit Application', status: 'completed' },
            { id: 2, title: 'Application Review', status: applicationData.application_status === 'under_review' ? 'in_progress' : 'completed' },
        ];

        if (applicationData.application_status === 'accepted') {
            baseSteps.push(
                { id: 3, title: 'Receive Offer', status: 'completed' },
                { id: 4, title: 'Accept Offer', status: applicationData.offer_accepted ? 'completed' : 'in_progress' },
                { id: 5, title: 'Upload Required Documents', status: applicationData.documents_verified ? 'completed' : 'in_progress' },
                { id: 6, title: 'Complete Induction', status: 'pending' },
                { id: 7, title: 'Final Enrolment', status: 'pending' }
            );
        }

        return baseSteps;
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    const enrolmentSteps = getEnrolmentSteps();

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admissions & Enrolment</h1>
                <p className="text-gray-600">Manage your application status, offers, and enrolment process</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6 border-b bg-white rounded-t-lg px-6 pt-0">
                <button
                    onClick={() => setActiveTab('status')}
                    className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                        activeTab === 'status'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Application Status
                </button>
                <button
                    onClick={() => setActiveTab('offer')}
                    className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                        activeTab === 'offer'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Offer & Acceptance
                </button>
                <button
                    onClick={() => setActiveTab('enrolment')}
                    className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                        activeTab === 'enrolment'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Enrolment Steps
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                        activeTab === 'documents'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Documents
                </button>
            </div>

            {/* APPLICATION STATUS TAB */}
            {activeTab === 'status' && (
                <div className="bg-white rounded-b-lg shadow p-6">
                    {applicationData ? (
                        <div className="space-y-6">
                            {/* Main Status */}
                            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    {getStatusIcon(applicationData.application_status)}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {applicationData.application_status?.replace(/_/g, ' ').toUpperCase()}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">Reference: {applicationData.application_reference}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Acceptance Message */}
                            {applicationData.application_status === 'accepted' && (
                                <div className="p-6 bg-green-50 border-l-4 border-green-600 rounded-lg">
                                    <h4 className="text-lg font-bold text-green-900 mb-3">🎉 Congratulations!</h4>
                                    <p className="text-green-800 mb-4">Your application has been accepted. Please proceed with the next steps to complete your enrolment.</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-green-700">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Application Accepted on {formatDate(applicationData.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Application Timeline */}
                            <div>
                                <h4 className="font-bold text-gray-900 mb-4">Application Timeline</h4>
                                <div className="space-y-3">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                            <div className="w-1 h-8 bg-green-600 my-1"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Application Submitted</p>
                                            <p className="text-sm text-gray-600">{formatDate(applicationData.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <CheckCircle className={`w-6 h-6 ${applicationData.application_status === 'accepted' ? 'text-green-600' : 'text-yellow-600'}`} />
                                            <div className={`w-1 h-8 ${applicationData.application_status === 'accepted' ? 'bg-green-600' : 'bg-gray-300'} my-1`}></div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Application Under Review</p>
                                            <p className="text-sm text-gray-600">In progress...</p>
                                        </div>
                                    </div>
                                    {applicationData.application_status === 'accepted' && (
                                        <div className="flex gap-4">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">Application Accepted</p>
                                                <p className="text-sm text-gray-600">{formatDate(applicationData.updated_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600">No application found</p>
                    )}
                </div>
            )}

            {/* OFFER & ACCEPTANCE TAB */}
            {activeTab === 'offer' && (
                <div className="bg-white rounded-b-lg shadow p-6">
                    {applicationData?.application_status === 'accepted' ? (
                        <div className="space-y-6">
                            {/* Offer Letter */}
                            <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                                <div className="flex items-start gap-4">
                                    <Award className="w-8 h-8 text-purple-600 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-bold text-purple-900 mb-2">Your Offer Letter</h3>
                                        <p className="text-purple-800 mb-4">Congratulations on receiving an offer to study with us! Please review and accept your offer below.</p>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                            <Download className="w-4 h-4" />
                                            Download Offer Letter
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Offer Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Programme</p>
                                    <p className="font-bold text-gray-900">{applicationData.programme_name || 'Not specified'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Start Date</p>
                                    <p className="font-bold text-gray-900">{applicationData.intake_month} {applicationData.intake_year}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Mode of Study</p>
                                    <p className="font-bold text-gray-900">{applicationData.study_mode || 'Not specified'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Status</p>
                                    <p className="font-bold text-green-600">{applicationData.offer_accepted ? 'Accepted' : 'Pending'}</p>
                                </div>
                            </div>

                            {/* Acceptance Confirmation */}
                            <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                                <h4 className="font-bold text-gray-900 mb-3">Accept Your Offer</h4>
                                <p className="text-gray-700 mb-4">By accepting this offer, you confirm that you will be studying with us and agree to the terms and conditions outlined in your offer letter.</p>
                                <button className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                    applicationData.offer_accepted
                                        ? 'bg-green-600 text-white cursor-default'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}>
                                    {applicationData.offer_accepted ? '✓ Offer Accepted' : 'Accept Offer'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Your offer details will appear here once your application is accepted.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ENROLMENT STEPS TAB */}
            {activeTab === 'enrolment' && (
                <div className="bg-white rounded-b-lg shadow p-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 text-lg mb-6">Your Enrolment Journey</h3>
                        {enrolmentSteps.map((step, index) => (
                            <div key={step.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                        step.status === 'completed' ? 'bg-green-600' :
                                        step.status === 'in_progress' ? 'bg-yellow-600' :
                                        'bg-gray-300'
                                    }`}>
                                        {step.status === 'completed' ? '✓' : step.id}
                                    </div>
                                    {index < enrolmentSteps.length - 1 && (
                                        <div className={`w-1 h-16 ${
                                            step.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                                        }`}></div>
                                    )}
                                </div>
                                <div className="pt-1">
                                    <p className={`font-bold text-lg ${
                                        step.status === 'completed' ? 'text-green-600' :
                                        step.status === 'in_progress' ? 'text-yellow-600' :
                                        'text-gray-600'
                                    }`}>
                                        {step.title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {step.status === 'completed' && 'Completed'}
                                        {step.status === 'in_progress' && 'In progress - Action required'}
                                        {step.status === 'pending' && 'Awaiting completion of previous steps'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
                <div className="bg-white rounded-b-lg shadow p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Required Documents</h3>
                    <p className="text-gray-600 mb-6">Upload the following documents to complete your enrolment:</p>
                    <div className="space-y-3">
                        {documents.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">{doc.name}</p>
                                        {doc.required && <span className="text-xs text-red-600 font-medium">Required</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {applicationData?.[doc.field] ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="text-sm text-green-600 font-medium">Uploaded</span>
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
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                                            >
                                                <Upload className="w-4 h-4" />
                                                {uploading === doc.field ? 'Uploading...' : 'Upload'}
                                            </button>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        ref={el => fileInputRefs.current[doc.field] = el}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) handleFileUpload(doc.field, file);
                                            e.target.value = '';
                                        }}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
                        <strong>Accepted formats:</strong> PDF, JPG, PNG | <strong>Max size:</strong> 5MB per file
                    </p>
                </div>
            )}
        </div>
    );
};

export default StudentAdmissions;
