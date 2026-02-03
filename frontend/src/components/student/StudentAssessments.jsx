import { useState } from 'react';
import { FileText, Upload, CheckCircle, Clock, AlertTriangle, Download } from 'lucide-react';

const StudentAssessments = () => {
    const [selectedTab, setSelectedTab] = useState('upcoming');

    const assessments = [
        {
            id: 1,
            module: 'Business Fundamentals',
            code: 'BUS101',
            title: 'Strategic Analysis Report',
            type: 'Coursework',
            dueDate: '2026-02-15',
            weight: '40%',
            status: 'pending',
            submitted: false,
            maxWords: 2500
        },
        {
            id: 2,
            module: 'Marketing Principles',
            code: 'BUS102',
            title: 'Marketing Campaign Presentation',
            type: 'Presentation',
            dueDate: '2026-02-20',
            weight: '30%',
            status: 'pending',
            submitted: false
        },
        {
            id: 3,
            module: 'Financial Accounting',
            code: 'BUS103',
            title: 'Final Examination',
            type: 'Exam',
            examDate: '2026-03-10',
            examTime: '09:00 - 12:00',
            weight: '60%',
            status: 'upcoming',
            room: 'Exam Hall A'
        }
    ];

    const submittedAssessments = [
        {
            id: 4,
            module: 'Business Fundamentals',
            code: 'BUS101',
            title: 'Literature Review',
            type: 'Coursework',
            submittedDate: '2026-01-15',
            grade: 'B+',
            feedback: 'Good analysis with strong research foundation'
        }
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    <Clock className="w-3 h-3" /> Pending
                </span>;
            case 'submitted':
                return <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> Submitted
                </span>;
            case 'graded':
                return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> Graded
                </span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {status}
                </span>;
        }
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Assessments & Grades</h1>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setSelectedTab('upcoming')}
                    className={`px-4 py-2 font-medium ${selectedTab === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                    Upcoming Assessments
                </button>
                <button
                    onClick={() => setSelectedTab('submitted')}
                    className={`px-4 py-2 font-medium ${selectedTab === 'submitted' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                    Submitted & Graded
                </button>
                <button
                    onClick={() => setSelectedTab('exams')}
                    className={`px-4 py-2 font-medium ${selectedTab === 'exams' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                >
                    Exam Timetable
                </button>
            </div>

            {/* Upcoming Assessments */}
            {selectedTab === 'upcoming' && (
                <div className="space-y-4">
                    {assessments.filter(a => a.type !== 'Exam').map((assessment) => {
                        const daysLeft = getDaysUntilDue(assessment.dueDate);
                        const isUrgent = daysLeft <= 3;
                        
                        return (
                            <div key={assessment.id} className={`bg-white rounded-lg shadow p-6 ${isUrgent ? 'border-l-4 border-red-500' : ''}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{assessment.title}</h3>
                                            {isUrgent && <AlertTriangle className="w-5 h-5 text-red-500" />}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{assessment.module} ({assessment.code})</p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-gray-600">Type: <span className="font-medium">{assessment.type}</span></span>
                                            <span className="text-gray-600">Weight: <span className="font-medium">{assessment.weight}</span></span>
                                            <span className="text-gray-600">Due: <span className="font-medium">{new Date(assessment.dueDate).toLocaleDateString()}</span></span>
                                        </div>
                                    </div>
                                    {getStatusBadge(assessment.status)}
                                </div>

                                {isUrgent && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-800 font-medium">⚠️ Due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
                                    </div>
                                )}

                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-2">Assessment Details</h4>
                                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                        <li>Word limit: {assessment.maxWords} words</li>
                                        <li>Submission format: PDF or Word document</li>
                                        <li>Late submission penalty applies</li>
                                    </ul>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        <Download className="w-4 h-4" />
                                        Download Brief
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                        <Upload className="w-4 h-4" />
                                        Submit Work
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Submitted & Graded */}
            {selectedTab === 'submitted' && (
                <div className="space-y-4">
                    {submittedAssessments.map((assessment) => (
                        <div key={assessment.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{assessment.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{assessment.module} ({assessment.code})</p>
                                    <p className="text-sm text-gray-600">Submitted: {new Date(assessment.submittedDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-green-600 mb-1">{assessment.grade}</div>
                                    {getStatusBadge('graded')}
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Feedback</h4>
                                <p className="text-sm text-gray-700">{assessment.feedback}</p>
                            </div>

                            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                                <Download className="w-4 h-4" />
                                Download Marked Work
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Exam Timetable */}
            {selectedTab === 'exams' && (
                <div className="space-y-4">
                    {assessments.filter(a => a.type === 'Exam').map((exam) => (
                        <div key={exam.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{exam.module} ({exam.code})</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Date</p>
                                            <p className="font-semibold">{new Date(exam.examDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Time</p>
                                            <p className="font-semibold">{exam.examTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Location</p>
                                            <p className="font-semibold">{exam.room}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Weight</p>
                                            <p className="font-semibold">{exam.weight}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                                <h4 className="font-semibold text-gray-900 mb-2">⚠️ Important Information</h4>
                                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                    <li>Arrive 30 minutes before the exam starts</li>
                                    <li>Bring your student ID card</li>
                                    <li>No electronic devices allowed</li>
                                    <li>Check permitted materials list</li>
                                </ul>
                            </div>

                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Download className="w-4 h-4" />
                                Download Exam Information
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Overall Progress */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Pending Assessments</p>
                        <p className="text-3xl font-bold text-blue-600">2</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Submitted</p>
                        <p className="text-3xl font-bold text-green-600">1</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Average Grade</p>
                        <p className="text-3xl font-bold text-purple-600">B+</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentAssessments;
