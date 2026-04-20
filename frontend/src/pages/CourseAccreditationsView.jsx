import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CourseAccreditationsView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [accreditation, setAccreditation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccreditation = async () => {
            try {
                const response = await axios.get(`${API_URL}/accreditations/${id}`);
                setAccreditation(response.data?.data);
            } catch (err) {
                console.error('Failed to fetch accreditation:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id && id !== 'new') {
            fetchAccreditation();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-600">Loading accreditation details...</div>
            </div>
        );
    }

    if (!accreditation) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-600">Accreditation not found</div>
            </div>
        );
    }

    const { accreditation: acc, tasks = [], signoffs = [] } = accreditation;

    // Group tasks by section
    const tasksBySection = {};
    for (let i = 1; i <= 8; i++) {
        tasksBySection[i] = [];
    }
    tasks.forEach(task => {
        const section = task.section_number || 1;
        if (section !== 8) {
            tasksBySection[section].push(task);
        }
    });

    const sectionTitles = {
        1: 'Initial Planning & Approval',
        2: 'Application Preparation',
        3: 'Submission & Engagement',
        4: 'Review, Visits & Validation',
        5: 'Agreement & Implementation',
        6: 'Post-Approval Monitoring',
        7: 'Risk & Issue Log',
        8: 'Sign-off'
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <button
                        onClick={() => navigate('/course-accreditations')}
                        className="flex items-center text-scl-purple hover:text-scl-purple/70 mb-4"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Accreditations
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{acc?.course_title}</h1>
                    <p className="text-gray-600 text-sm mt-2">Code: {acc?.course_code}</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Document Control Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Document Control</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Course Title</p>
                            <p className="text-sm text-gray-900 mt-1">{acc?.course_title}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Course Code</p>
                            <p className="text-sm text-gray-900 mt-1">{acc?.course_code || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Awarding Body</p>
                            <p className="text-sm text-gray-900 mt-1">{acc?.awarding_body || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Application Type</p>
                            <p className="text-sm text-gray-900 mt-1">{acc?.application_type || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Version</p>
                            <p className="text-sm text-gray-900 mt-1">{acc?.version || '1.0'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Status</p>
                            <p className={`text-sm font-semibold mt-1 inline-block px-2 py-1 rounded ${
                                acc?.overall_status === 'Approved' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {acc?.overall_status || 'Draft'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Date Started</p>
                            <p className="text-sm text-gray-900 mt-1">{formatDate(acc?.date_started)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Expected Submission</p>
                            <p className="text-sm text-gray-900 mt-1">{formatDate(acc?.expected_submission_date)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Lead Coordinator</p>
                            <p className="text-sm text-gray-900 mt-1">{acc?.lead_coordinator || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Sections 1-7 */}
                {[1, 2, 3, 4, 5, 6, 7].map(sectionNum => (
                    <div key={sectionNum} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Section {sectionNum}: {sectionTitles[sectionNum]}
                        </h2>

                        {tasksBySection[sectionNum].length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b border-gray-300">
                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Task</th>
                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Description</th>
                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Responsible</th>
                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Status</th>
                                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasksBySection[sectionNum].map(task => (
                                            <tr key={task.id} className="border-b border-gray-200">
                                                <td className="border border-gray-300 px-4 py-3 text-sm font-medium">{task.task_name}</td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm">{task.description || '-'}</td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm">{task.responsible_person || '-'}</td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                                        task.status === 'Completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {task.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm">{task.notes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No tasks recorded for this section</p>
                        )}
                    </div>
                ))}

                {/* Section 8: Sign-off */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Section 8: {sectionTitles[8]}</h2>

                    {signoffs && signoffs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-gray-300">
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Role</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Signer Name</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Date</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Signature</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {signoffs.map(signoff => (
                                        <tr key={signoff.id} className="border-b border-gray-200">
                                            <td className="border border-gray-300 px-4 py-3 text-sm font-medium">{signoff.role}</td>
                                            <td className="border border-gray-300 px-4 py-3 text-sm">{signoff.name || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-3 text-sm">{formatDate(signoff.sign_date)}</td>
                                            <td className="border border-gray-300 px-4 py-3 text-sm">{signoff.signature || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No sign-offs recorded</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseAccreditationsView;

