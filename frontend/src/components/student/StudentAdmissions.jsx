import { useState, useEffect, useRef } from 'react';
import { FileText, CheckCircle, Clock, Upload, Download, AlertCircle, Award, GraduationCap, RefreshCw, Trash2 } from 'lucide-react';
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

const StudentAdmissions = ({ user, initialTab }) => {
    const [applicationData, setApplicationData] = useState(null);
    const [inductionData, setInductionData] = useState({});
    const [uploadedDocuments, setUploadedDocuments] = useState({}); // Track all documents by type
    const [savingInduction, setSavingInduction] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null);
    const [acceptingOffer, setAcceptingOffer] = useState(false);
    const [downloadingOffer, setDownloadingOffer] = useState(false);
    const [activeTab, setActiveTab] = useState(initialTab || 'status');
    const fileInputRefs = useRef({});

    useEffect(() => {
        fetchApplicationData();
    }, [user]);

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    useEffect(() => {
        if (applicationData?.id) {
            fetchInductionData();
            fetchUploadedDocuments();
        }
    }, [applicationData?.id]);

    const fetchUploadedDocuments = async () => {
        if (!applicationData?.id) return;
        try {
            const docTypes = [
                'passport_id_document',
                'academic_certificates',
                'academic_transcripts',
                'english_certificate',
                'student_contract',
                'cv_resume',
                'work_reference',
                'proof_of_address',
                'visa_immigration_document'
            ];

            const docs = {};
            for (const docType of docTypes) {
                try {
                    const response = await axios.get(
                        `${API_URL}/students/applications/${applicationData.id}/documents/${docType}`
                    );
                    if (response.data?.success) {
                        docs[docType] = response.data.data.documents || [];
                    }
                } catch (err) {
                    // No documents of this type yet
                    docs[docType] = [];
                }
            }
            setUploadedDocuments(docs);
        } catch (error) {
            console.error('Error fetching uploaded documents:', error);
        }
    };

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
                console.log('CV Resume value:', studentApp?.cv_resume);
                console.log('Work Reference value:', studentApp?.work_reference);
                console.log('Academic Transcripts value:', studentApp?.academic_transcripts);
                console.log('All document fields:', {
                    passport_id_document: studentApp?.passport_id_document,
                    academic_certificates: studentApp?.academic_certificates,
                    academic_transcripts: studentApp?.academic_transcripts,
                    english_certificate: studentApp?.english_certificate,
                    student_contract: studentApp?.student_contract,
                    cv_resume: studentApp?.cv_resume,
                    work_reference: studentApp?.work_reference,
                    proof_of_address: studentApp?.proof_of_address,
                    visa_immigration_document: studentApp?.visa_immigration_document
                });
                
                setApplicationData(studentApp || apps[0] || null);
            }
        } catch (error) {
            console.error('Error fetching application:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInductionData = async () => {
        try {
            if (!applicationData?.id) return;
            
            const response = await axios.get(
                `${API_URL}/students/applications/${applicationData.id}/induction`
            );
            
            if (response.data?.success && response.data.data) {
                // Set induction data from backend to populate the form and show completion status
                const inductionRecord = response.data.data;
                setInductionData({
                    student_handbook: inductionRecord.student_handbook,
                    course_handbook: inductionRecord.course_handbook,
                    assessment_grading_policy: inductionRecord.assessment_grading_policy,
                    code_of_conduct: inductionRecord.code_of_conduct,
                    health_safety_guidelines: inductionRecord.health_safety_guidelines,
                    academic_integrity: inductionRecord.academic_integrity,
                    attendance_punctuality: inductionRecord.attendance_punctuality,
                    it_email_usage: inductionRecord.it_email_usage,
                    data_protection: inductionRecord.data_protection,
                    complaints_appeals: inductionRecord.complaints_appeals,
                    library_resources: inductionRecord.library_resources,
                    student_support_services: inductionRecord.student_support_services,
                    equality_diversity_inclusion: inductionRecord.equality_diversity_inclusion,
                    safeguarding_prevent: inductionRecord.safeguarding_prevent,
                    consent_personal_data: inductionRecord.consent_personal_data,
                    consent_awarding_bodies: inductionRecord.consent_awarding_bodies,
                    consent_communications: inductionRecord.consent_communications,
                    consent_marketing_images: inductionRecord.consent_marketing_images,
                    declaration_understood: inductionRecord.declaration_understood,
                    digital_signature: inductionRecord.digital_signature,
                    declaration_date: inductionRecord.declaration_date
                });
            }
        } catch (error) {
            // No induction data yet, that's fine
            console.log('No induction data found yet');
        }
    };

    const handleAcceptOffer = async () => {
        if (!applicationData?.id || applicationData.offer_accepted) return;
        try {
            setAcceptingOffer(true);
            const response = await axios.put(
                `${API_URL}/students/applications/${applicationData.id}/accept-offer`
            );
            if (response.data?.success) {
                setApplicationData(prev => ({ ...prev, offer_accepted: 1 }));
            } else {
                alert(response.data?.message || 'Failed to accept offer');
            }
        } catch (error) {
            console.error('Accept offer error:', error);
            alert(error.response?.data?.message || 'Failed to accept offer');
        } finally {
            setAcceptingOffer(false);
        }
    };

    const handleDownloadOffer = async () => {
        if (!applicationData?.id) return;
        try {
            setDownloadingOffer(true);
            const response = await axios.get(
                `${API_URL}/students/applications/${applicationData.id}/offer-letter`,
                { responseType: 'blob' }
            );
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `Offer_Letter_${applicationData.application_reference || applicationData.id}.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download offer letter error:', error);
            alert(error.response?.data?.message || 'Failed to download offer letter');
        } finally {
            setDownloadingOffer(false);
        }
    };

    const handleFileUpload = async (docField, files) => {
        if (!files || files.length === 0) return;

        console.log(`Uploading ${files.length} file(s) for:`, docField);
        
        // Validate all files
        for (const file of files) {
            console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert(`File ${file.name} is too large (max 5MB)`);
                return;
            }

            // Check file type
            const fileName = file.name.toLowerCase();
            const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
            const hasAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
            
            if (!hasAllowedExtension) {
                alert(`Invalid file type for ${file.name}. Only PDF and image files (JPG, PNG) are allowed.`);
                return;
            }
        }

        try {
            console.log('Starting upload for:', docField);
            setUploading(docField);
            const formData = new FormData();
            
            // Add all files
            for (const file of files) {
                formData.append('documents', file);
            }
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

            console.log('Upload response:', response.data);

            if (response.data?.success) {
                alert(`${response.data.data.filesCount} document(s) uploaded successfully!`);
                // Add a small delay to ensure backend has processed the files
                setTimeout(async () => {
                    await fetchApplicationData();
                    await fetchUploadedDocuments();
                }, 500);
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

    const handleDeleteDocument = async (applicationId, docId, fileName) => {
        if (!window.confirm(`Delete document: ${fileName}?`)) {
            return;
        }

        try {
            const response = await axios.delete(
                `${API_URL}/students/applications/${applicationId}/documents/${docId}`
            );

            if (response.data?.success) {
                alert('Document deleted successfully!');
                await fetchUploadedDocuments();
            } else {
                alert('Failed to delete document: ' + (response.data?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete document: ' + (error.response?.data?.message || error.message));
        }
    };

    const getFilenameFromPath = (filePath) => {
        if (!filePath) return '';
        // If it's already just a filename (original name), return it
        if (!filePath.includes('/')) {
            return filePath;
        }
        // Otherwise extract from path like /uploads/student-documents/1770439280850-64084237-Invoice-877.pdf
        const parts = filePath.split('/');
        return parts[parts.length - 1] || '';
    };

    const handleDownloadDocument = async (applicationId, documentType, originalFilename) => {
        try {
            // Get the application data to find the file path
            const response = await axios.get(`${API_URL}/students/applications`);
            
            if (response.data?.success) {
                const apps = response.data.data?.applications || [];
                const app = apps.find(a => a.id === applicationId);
                
                if (app && app[documentType]) {
                    const filePath = app[documentType];
                    // Remove /api from the URL for file downloads since files are served at root /uploads
                    const baseUrl = API_URL.replace('/api', '');
                    const downloadResponse = await axios.get(`${baseUrl}${filePath}`, {
                        responseType: 'blob'
                    });
                    
                    const blob = new Blob([downloadResponse.data]);
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', originalFilename || 'document');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                } else {
                    alert('Document file path not found');
                }
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download document: ' + error.message);
        }
    };

    const handleInductionCheckboxChange = (field) => {
        setInductionData(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSaveInduction = async () => {
        if (!applicationData?.id) {
            alert('Application ID not found');
            return;
        }

        // Check if all required checkboxes are checked
        const requiredFields = [
            'student_handbook', 'course_handbook', 'assessment_grading_policy',
            'code_of_conduct', 'health_safety_guidelines', 'academic_integrity',
            'attendance_punctuality', 'it_email_usage', 'data_protection',
            'complaints_appeals', 'library_resources', 'student_support_services',
            'equality_diversity_inclusion', 'safeguarding_prevent',
            'consent_personal_data', 'consent_awarding_bodies', 'consent_communications',
            'declaration_understood'
        ];

        const allChecked = requiredFields.every(field => inductionData[field]);
        if (!allChecked) {
            alert('Please confirm all mandatory items and sign the declaration');
            return;
        }

        if (!inductionData.digital_signature || inductionData.digital_signature.trim() === '') {
            alert('Please enter your name as digital signature');
            return;
        }

        if (!inductionData.declaration_date) {
            alert('Please select the date of declaration');
            return;
        }

        try {
            setSavingInduction(true);
            const response = await axios.post(
                `${API_URL}/students/applications/${applicationData.id}/induction`,
                {
                    application_id: applicationData.id,
                    student_id: applicationData.id,
                    student_name: `${applicationData.first_name} ${applicationData.last_name}`,
                    course_title: getProgrammeName(applicationData),
                    course_start_date: applicationData.intake_start_date,
                    ...inductionData
                }
            );

            if (response.data?.success) {
                alert('Induction completed successfully!');
                // Keep the induction data in state so the completion status is reflected in the sidebar
                // Don't clear it - it's needed to show step 6 as completed
                // Refresh application data and navigate to summary
                await fetchApplicationData();
                await fetchInductionData();
                setActiveTab('summary');
            } else {
                alert('Failed to save induction: ' + (response.data?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Induction error:', error);
            alert('Failed to save induction: ' + (error.response?.data?.message || error.message));
        } finally {
            setSavingInduction(false);
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

    const getProgrammeName = (app) => {
        return app?.programme_name || app?.course_title || app?.course_code || 'Not specified';
    };

    const getStartDate = (app) => {
        if (app?.intake_start_date) {
            return formatDate(app.intake_start_date);
        }
        if (app?.intake_month && app?.intake_year) {
            return `${app.intake_month} ${app.intake_year}`;
        }
        return 'Not specified';
    };

    const getStudyModeLabel = (app) => {
        return app?.study_mode || app?.mode_of_study || 'Not specified';
    };

    const documents = [
        { name: 'Passport/ID', field: 'passport_id_document', required: true },
        { name: 'Academic Certificates', field: 'academic_certificates', required: true },
        { name: 'Academic Transcripts', field: 'academic_transcripts', required: true },
        { name: 'English Certificate', field: 'english_certificate', required: true },
        { name: 'Student Contract', field: 'student_contract', required: true },
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
            // Check if required documents have been uploaded
            const requiredDocs = documents.filter(doc => doc.required);
            const uploadedRequiredDocs = requiredDocs.filter(doc => applicationData[doc.field]);
            const allRequiredDocsUploaded = uploadedRequiredDocs.length === requiredDocs.length;
            
            // Mark as completed when all required docs are uploaded
            let documentsStatus = 'pending';
            if (allRequiredDocsUploaded) {
                documentsStatus = 'completed';
            } else if (uploadedRequiredDocs.length > 0) {
                documentsStatus = 'in_progress';
            }

            // Determine induction status based on whether it's completed
            const inductionStatus = inductionData.declaration_understood && inductionData.digital_signature ? 'completed' : 'pending';
            
            // Final enrolment is pending until all previous steps are completed
            const allPreviousCompleted = 
                applicationData.offer_accepted && 
                documentsStatus === 'completed' && 
                inductionStatus === 'completed';
            const finalEnrolmentStatus = allPreviousCompleted ? 'completed' : 'pending';

            baseSteps.push(
                { id: 3, title: 'Receive Offer', status: 'completed' },
                { id: 4, title: 'Accept Offer', status: applicationData.offer_accepted ? 'completed' : 'in_progress' },
                { id: 5, title: 'Upload Required Documents', status: documentsStatus },
                { id: 6, title: 'Complete Induction', status: inductionStatus },
                { id: 7, title: 'Final Enrolment', status: finalEnrolmentStatus }
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
                    onClick={() => setActiveTab('documents')}
                    className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                        activeTab === 'documents'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Documents
                </button>
                <button
                    onClick={() => setActiveTab('induction')}
                    className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                        activeTab === 'induction'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Induction
                </button>
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                        activeTab === 'summary'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Summary
                </button>
            </div>

            {/* Main Content + Sidebar Layout */}
            <div className="flex gap-6">
                {/* Main Content Area */}
                <div className="flex-1">
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
                    
                    {/* Navigation Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setActiveTab('offer')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Next: Offer & Acceptance →
                        </button>
                    </div>
                </div>
            )}

            {/* OFFER & ACCEPTANCE TAB */}
            {activeTab === 'offer' && (
                <div className="bg-white rounded-b-lg shadow p-6">
                    {applicationData?.application_status === 'accepted' ? (
                        <div className="space-y-6">
                            {/* Offer Letter */}
                            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-slate-200 rounded-lg">
                                <div className="flex items-start gap-4">
                                    <Award className="w-8 h-8 text-slate-700 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Your Offer Letter</h3>
                                        <p className="text-slate-800 mb-4">Congratulations on receiving an offer to study with us! Please review and accept your offer below.</p>
                                        <button
                                            onClick={handleDownloadOffer}
                                            disabled={downloadingOffer}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                                        >
                                            <Download className="w-4 h-4" />
                                            {downloadingOffer ? 'Downloading...' : 'Download Offer Letter'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Offer Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Programme</p>
                                    <p className="font-bold text-gray-900">{getProgrammeName(applicationData)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Start Date</p>
                                    <p className="font-bold text-gray-900">{getStartDate(applicationData)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Mode of Study</p>
                                    <p className="font-bold text-gray-900">{getStudyModeLabel(applicationData)}</p>
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
                                <button
                                    onClick={handleAcceptOffer}
                                    disabled={applicationData.offer_accepted || acceptingOffer}
                                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                        applicationData.offer_accepted
                                            ? 'bg-green-600 text-white cursor-default'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    } ${acceptingOffer ? 'opacity-60' : ''}`}
                                >
                                    {applicationData.offer_accepted ? '✓ Offer Accepted' : (acceptingOffer ? 'Accepting...' : 'Accept Offer')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Your offer details will appear here once your application is accepted.</p>
                        </div>
                    )}
                    
                    {/* Navigation Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setActiveTab('documents')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Next: Upload Documents →
                        </button>
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
                                    {(uploadedDocuments[doc.field]?.length > 0) ? (
                                        <div className="flex flex-col gap-3 items-end w-full">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="text-sm text-green-600 font-medium">{uploadedDocuments[doc.field].length} file(s)</span>
                                            </div>
                                            {/* List all uploaded files */}
                                            <div className="w-full space-y-2">
                                                {uploadedDocuments[doc.field].map((file, idx) => (
                                                    <div key={file.id} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                                                        <span className="text-sm text-gray-700 truncate">{file.original_filename}</span>
                                                        <button 
                                                            onClick={() => handleDeleteDocument(applicationData.id, file.id, file.original_filename)}
                                                            className="text-red-600 hover:text-red-700 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Add more files button */}
                                            <button 
                                                onClick={() => triggerFileInput(doc.field)}
                                                disabled={uploading === doc.field}
                                                className="flex items-center gap-2 px-3 py-1 bg-amber-600 text-white rounded text-xs hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                <Upload className="w-3 h-3" />
                                                {uploading === doc.field ? 'Adding...' : 'Add More'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => triggerFileInput(doc.field)}
                                            disabled={uploading === doc.field}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                                        >
                                            <Upload className="w-4 h-4" />
                                            {uploading === doc.field ? 'Uploading...' : 'Upload'}
                                        </button>
                                    )}
                                    <input
                                        type="file"
                                        multiple
                                        ref={el => fileInputRefs.current[doc.field] = el}
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            console.log('Files selected:', files.length);
                                            if (files.length > 0) {
                                                handleFileUpload(doc.field, files);
                                            }
                                            // Reset input after handling
                                            setTimeout(() => {
                                                e.target.value = '';
                                            }, 100);
                                        }}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
                        <strong>Accepted formats:</strong> PDF, JPG, PNG | <strong>Max size:</strong> 5MB per file | <strong>Multiple uploads:</strong> You can upload multiple files per document type
                    </p>
                    
                    {/* Navigation Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setActiveTab('induction')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Next: Induction →
                        </button>
                    </div>
                </div>
            )}

            {/* INDUCTION TAB */}
            {activeTab === 'induction' && (
                <div className="bg-white rounded-b-lg shadow p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Student Induction & Onboarding</h3>
                    <p className="text-gray-600 mb-6">Please confirm that you have read and understood all the below documentation and policies.</p>

                    {/* Auto-filled fields */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Student ID</p>
                            <p className="font-bold text-gray-900">{applicationData?.application_reference || applicationData?.id}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Student Name</p>
                            <p className="font-bold text-gray-900">{applicationData?.first_name} {applicationData?.last_name}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Course Title</p>
                            <p className="font-bold text-gray-900">{getProgrammeName(applicationData)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Course Start Date</p>
                            <p className="font-bold text-gray-900">{getStartDate(applicationData)}</p>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h4 className="font-bold text-gray-900 mb-4">Policies & Documentation</h4>
                        <div className="space-y-3">
                            {[
                                { key: 'student_handbook', label: 'Student Handbook' },
                                { key: 'course_handbook', label: 'Course Handbook' },
                                { key: 'assessment_grading_policy', label: 'Assessment & Grading Policy Explained' },
                                { key: 'code_of_conduct', label: 'Code of Conduct & Disciplinary Policy Explained' },
                                { key: 'health_safety_guidelines', label: 'Health & Safety Guidelines Provided' },
                                { key: 'academic_integrity', label: 'Academic Integrity & Plagiarism Policy Explained' },
                                { key: 'attendance_punctuality', label: 'Attendance & Punctuality Policy Explained' },
                                { key: 'it_email_usage', label: 'IT & Email Usage Policy Explained' },
                                { key: 'data_protection', label: 'Data Protection & Privacy Notice Explained' },
                                { key: 'complaints_appeals', label: 'Complaints & Appeals Procedure Explained' },
                                { key: 'library_resources', label: 'Library & Learning Resource Access Information Provided' },
                                { key: 'student_support_services', label: 'Student Support Services Information Provided' },
                                { key: 'equality_diversity_inclusion', label: 'Equality, Diversity & Inclusion Policy Explained' },
                                { key: 'safeguarding_prevent', label: 'Safeguarding & Prevent Policy Explained' }
                            ].map((item) => (
                                <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={inductionData[item.key] || false}
                                        onChange={() => handleInductionCheckboxChange(item.key)}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-gray-700">{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Consents */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <h4 className="font-bold text-gray-900 mb-4">Consents</h4>
                        <div className="space-y-3">
                            {[
                                { key: 'consent_personal_data', label: 'Consent to Process Personal Data (UK GDPR)' },
                                { key: 'consent_awarding_bodies', label: 'Consent to Share Data with Awarding Bodies' },
                                { key: 'consent_communications', label: 'Consent to Receive Important College Communications' },
                                { key: 'consent_marketing_images', label: 'Consent for Use of Images/Videos in Marketing (Optional)' }
                            ].map((item) => (
                                <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={inductionData[item.key] || false}
                                        onChange={() => handleInductionCheckboxChange(item.key)}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-gray-700">{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Declaration */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                        <h4 className="font-bold text-gray-900 mb-4">Declaration</h4>
                        <label className="flex items-start gap-3 cursor-pointer mb-4">
                            <input
                                type="checkbox"
                                checked={inductionData.declaration_understood || false}
                                onChange={() => handleInductionCheckboxChange('declaration_understood')}
                                className="w-4 h-4 rounded mt-1"
                            />
                            <span className="text-gray-700">I have read and understood all the above documentation</span>
                        </label>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Digital Signature (Your Name)</label>
                                <input
                                    type="text"
                                    value={inductionData.digital_signature || ''}
                                    onChange={(e) => setInductionData(prev => ({ ...prev, digital_signature: e.target.value }))}
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Declaration</label>
                                <input
                                    type="date"
                                    value={inductionData.declaration_date || ''}
                                    onChange={(e) => setInductionData(prev => ({ ...prev, declaration_date: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSaveInduction}
                            disabled={savingInduction}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            {savingInduction ? 'Saving...' : 'Complete Induction'}
                        </button>
                    </div>
                </div>
            )}

            {/* SUMMARY TAB */}
            {activeTab === 'summary' && (
                <div className="bg-white rounded-b-lg shadow p-6">
                    <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Enrolment Complete!</h2>
                                <p className="text-gray-600">Congratulations! You have successfully completed all enrolment steps.</p>
                            </div>
                        </div>
                    </div>

                    {/* Student Information */}
                    <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Student Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Student Name</p>
                                <p className="font-medium text-gray-900">{applicationData?.first_name} {applicationData?.middle_names} {applicationData?.last_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium text-gray-900">{applicationData?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Contact Number</p>
                                <p className="font-medium text-gray-900">{applicationData?.contact_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Date of Birth</p>
                                <p className="font-medium text-gray-900">{formatDate(applicationData?.date_of_birth)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Nationality</p>
                                <p className="font-medium text-gray-900">{applicationData?.nationality}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Application Reference</p>
                                <p className="font-medium text-gray-900">{applicationData?.application_reference}</p>
                            </div>
                        </div>
                    </div>

                    {/* Programme Details */}
                    <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Programme Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Programme</p>
                                <p className="font-medium text-gray-900">{applicationData?.course_title}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Course Code</p>
                                <p className="font-medium text-gray-900">{applicationData?.course_code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Mode of Study</p>
                                <p className="font-medium text-gray-900">{applicationData?.mode_of_study}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Start Date</p>
                                <p className="font-medium text-gray-900">{formatDate(applicationData?.intake_start_date)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Uploaded Documents Summary */}
                    <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Uploaded Documents</h3>
                        <div className="space-y-2">
                            {documents.map((doc, index) => (
                                applicationData?.[doc.field] && (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="font-medium text-gray-900">{doc.name}</span>
                                        </div>
                                        <span className="text-sm text-gray-600">{applicationData[doc.field]}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Induction Completion */}
                    {inductionData.declaration_understood && inductionData.digital_signature && (
                        <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Induction Completed</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Digital Signature</p>
                                    <p className="font-medium text-gray-900">{inductionData.digital_signature}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Declaration Date</p>
                                    <p className="font-medium text-gray-900">{formatDate(inductionData.declaration_date)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Next Steps */}
                    <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">What's Next?</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <span>You will receive a welcome email with your student ID and login credentials</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <span>Access to the Moodle Learning Platform will be granted within 24 hours</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <span>Check your email for course orientation schedule and joining instructions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <span>Your programme starts on {formatDate(applicationData?.intake_start_date)}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Print Summary Button */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Print Summary
                        </button>
                        <button
                            onClick={() => setActiveTab('status')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
                </div>

                {/* Sidebar - Enrolment Progress */}
                <div className="w-72">
                    <div className="bg-white rounded-lg shadow p-5 sticky top-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Enrolment Progress</h3>
                        <div className="space-y-3">
                            {enrolmentSteps.map((step, index) => (
                                <div 
                                    key={step.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
                                        step.status === 'completed' ? 'border-green-500 bg-green-50' :
                                        step.status === 'in_progress' ? 'border-orange-500 bg-orange-50' :
                                        'border-gray-300 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {step.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                        {step.status === 'in_progress' && <Clock className="w-5 h-5 text-orange-600" />}
                                        {step.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-gray-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${
                                            step.status === 'completed' ? 'text-green-900' :
                                            step.status === 'in_progress' ? 'text-orange-900' :
                                            'text-gray-600'
                                        }`}>
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {step.status === 'completed' && 'Completed'}
                                            {step.status === 'in_progress' && 'In progress'}
                                            {step.status === 'pending' && 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Progress Summary */}
                        <div className="mt-6 pt-4 border-t">
                            <div className="text-sm">
                                <p className="text-gray-600">Overall Progress</p>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${(enrolmentSteps.filter(s => s.status === 'completed').length / enrolmentSteps.length) * 100}%`
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {enrolmentSteps.filter(s => s.status === 'completed').length} of {enrolmentSteps.length} steps completed
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentAdmissions;




