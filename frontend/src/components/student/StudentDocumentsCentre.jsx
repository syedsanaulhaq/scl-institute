import { useEffect, useState } from 'react';
import { Download, FileText, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function StudentDocumentsCentre({ user }) {
    const [applicationData, setApplicationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloadingOffer, setDownloadingOffer] = useState(false);

    useEffect(() => {
        fetchApplicationData();
    }, [user]);

    const fetchApplicationData = async () => {
        try {
            const response = await axios.get(`${API_URL}/students/applications`);
            if (response.data?.success) {
                const apps = response.data.data?.applications || [];
                const studentApp = apps.find(app => app.email === user?.email);
                setApplicationData(studentApp || apps[0] || null);
            }
        } catch (error) {
            console.error('Error fetching application:', error);
        } finally {
            setLoading(false);
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
        } catch (error) {
            console.error('Offer download error:', error);
            alert('Failed to download offer letter');
        } finally {
            setDownloadingOffer(false);
        }
    };

    const officialDownloads = [
        {
            title: 'Student Handbook',
            file: 'student-handbook.txt',
            description: 'Guidance on academic expectations, attendance, and support services.'
        },
        {
            title: 'Course Handbook',
            file: 'course-handbook.txt',
            description: 'Programme structure, modules, and assessment details.'
        },
        {
            title: 'Assessment & Grading Policy',
            file: 'assessment-grading-policy.txt',
            description: 'Assessment methods, grading scale, and feedback timelines.'
        },
        {
            title: 'Student Code of Conduct',
            file: 'code-of-conduct.txt',
            description: 'Expected behaviour and disciplinary procedures.'
        },
        {
            title: 'Complaints & Appeals Policy',
            file: 'complaints-appeals-policy.txt',
            description: 'How to raise complaints or appeal academic decisions.'
        },
        {
            title: 'Withdrawal/Deferral/Transfer Policy',
            file: 'withdrawal-deferral-transfer-policy.txt',
            description: 'Eligibility and process for course change requests.'
        },
        {
            title: 'Student Contract & Terms',
            file: 'student-contract-terms.txt',
            description: 'Rights and responsibilities of students and the institution.'
        }
    ];

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents Centre</h1>
                <p className="text-gray-600">Letters and official downloads shared with students</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Letters Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Letters</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">
                        Enrolment and confirmation letters related to your application.
                    </p>

                    <div className="space-y-4">
                        <div className="p-4 border border-gray-200 rounded-lg flex items-start justify-between gap-4">
                            <div>
                                <p className="font-medium text-gray-900">Offer Letter</p>
                                <p className="text-sm text-gray-600">Issued after your application is accepted.</p>
                            </div>
                            <button
                                onClick={handleDownloadOffer}
                                disabled={downloadingOffer || !applicationData?.offer_accepted}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                                    applicationData?.offer_accepted
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <Download className="w-4 h-4" />
                                {downloadingOffer ? 'Downloading...' : 'Download'}
                            </button>
                        </div>

                        {!applicationData?.offer_accepted && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                <strong>Note:</strong> Offer letter becomes available once your offer is accepted.
                            </div>
                        )}
                    </div>
                </div>

                {/* Official Downloads Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-6 h-6 text-green-600" />
                        <h2 className="text-xl font-bold text-gray-900">Official Downloads</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">
                        Policies, handbooks, and official forms shared with students.
                    </p>

                    <div className="space-y-4">
                        {officialDownloads.map((doc) => (
                            <div key={doc.file} className="p-4 border border-gray-200 rounded-lg flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-medium text-gray-900">{doc.title}</p>
                                    <p className="text-sm text-gray-600">{doc.description}</p>
                                </div>
                                <a
                                    href={`${API_URL.replace('/api', '')}/documents/${doc.file}`}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
