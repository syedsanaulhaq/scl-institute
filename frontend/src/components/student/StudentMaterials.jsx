import { useState } from 'react';
import { BookOpen, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function StudentMaterials({ user }) {
    const [ssoLoading, setSsoLoading] = useState(false);
    const [ssoError, setSsoError] = useState('');

    const handleAccessLMS = async () => {
        try {
            setSsoLoading(true);
            setSsoError('');
            const response = await axios.post(`${API_URL}/sso/generate`, {
                email: user.email
            });

            if (response.data?.success && response.data?.redirectUrl) {
                window.open(response.data.redirectUrl, '_blank', 'noopener,noreferrer');
            } else {
                setSsoError('Failed to generate SSO link');
            }
        } catch (err) {
            setSsoError(err.response?.data?.message || 'Failed to access Moodle');
        } finally {
            setSsoLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Materials</h1>
                <p className="text-gray-600">Access your Moodle LMS and official student documents</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Moodle LMS */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-6 h-6 text-green-600" />
                        <h2 className="text-xl font-bold text-gray-900">Moodle LMS</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Access course materials, assignments, and your learning resources in Moodle.
                    </p>
                    {ssoError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5" />
                            <span>{ssoError}</span>
                        </div>
                    )}
                    <button
                        onClick={handleAccessLMS}
                        disabled={ssoLoading}
                        className={`px-5 py-2 rounded-lg font-medium flex items-center gap-2 ${
                            ssoLoading
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        <ExternalLink className="w-4 h-4" />
                        {ssoLoading ? 'Connecting...' : 'Open Moodle (SSO)'}
                    </button>
                </div>

                {/* Documents Centre */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Documents Centre</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Download official letters, policies, handbooks, and forms.
                    </p>
                    <Link
                        to="/student/documents"
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <FileText className="w-4 h-4" />
                        Open Documents Centre
                    </Link>
                </div>
            </div>
        </div>
    );
}
