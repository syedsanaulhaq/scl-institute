import { useState, useEffect } from 'react';
import { AlertTriangle, MessageSquare, FileText, Scale, Accessibility, Shield, Plus, Send, Upload, Clock, CheckCircle, Megaphone } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentSupportHub = ({ user }) => {
    const [activeTab, setActiveTab] = useState('messages');
    const [studentId, setStudentId] = useState(null);

    // Messages State
    const [messages, setMessages] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [composeMode, setComposeMode] = useState(false);
    const [messageForm, setMessageForm] = useState({ recipient: '', subject: '', message: '' });

    // Support Requests State
    const [supportRequests, setSupportRequests] = useState([]);
    const [showSupportForm, setShowSupportForm] = useState(false);
    const [supportForm, setSupportForm] = useState({ type: '', subject: '', description: '' });

    // Feedback State
    const [feedback, setFeedback] = useState([]);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({ course_id: '', course_name: '', module_code: '', feedback_type: '', rating: 5, comments: '' });
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    // Complaints State
    const [complaints, setComplaints] = useState([]);
    const [showComplaintForm, setShowComplaintForm] = useState(false);
    const [complaintForm, setComplaintForm] = useState({ type: '', category: '', description: '', priority: 'medium' });
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    // Disability State
    const [disabilityRequests, setDisabilityRequests] = useState([]);
    const [showDisabilityForm, setShowDisabilityForm] = useState(false);
    const [disabilityForm, setDisabilityForm] = useState({ request_type: '', description: '' });

    // Safeguarding State
    const [safeguardingReports, setSafeguardingReports] = useState([]);
    const [showSafeguardingForm, setShowSafeguardingForm] = useState(false);
    const [safeguardingForm, setSafeguardingForm] = useState({ report_type: '', description: '', severity: 'medium' });
    const [reportFile, setReportFile] = useState(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getStudentId = async () => {
            try {
                const appsResponse = await axios.get(`${API_URL}/students/applications`);
                if (appsResponse.data?.success) {
                    const apps = appsResponse.data.data?.applications || [];
                    const studentApp = apps.find(app => app.email === user?.email);
                    if (studentApp) {
                        setStudentId(studentApp.id);
                        fetchAllData(studentApp.id);
                    }
                }
            } catch (err) {
                console.error('Error getting student ID:', err);
            }
        };

        const fetchAnnouncements = async () => {
            try {
                const dash = await axios.get(`${API_URL}/students/student-dashboard`, {
                    params: { email: user?.email }
                });
                if (dash.data?.success) {
                    setAnnouncements(dash.data?.data?.announcements || []);
                }
            } catch (e) {
                console.warn('Announcements fetch failed:', e?.message);
            }
        };

        if (user?.email) {
            getStudentId();
            fetchAnnouncements();
        }
    }, [user]);

    const fetchAllData = async (id) => {
        try {
            setLoading(true);
            // Fetch support requests
            const req = await axios.get(`${API_URL}/support/requests/${id}`);
            setSupportRequests(req.data?.requests || []);

            // Fetch feedback
            const fb = await axios.get(`${API_URL}/support/feedback/${id}`);
            setFeedback(fb.data?.feedback || []);

            // Fetch complaints
            const comp = await axios.get(`${API_URL}/support/complaints/${id}`);
            setComplaints(comp.data?.complaints || []);

            // Fetch disability
            const dis = await axios.get(`${API_URL}/support/disability/${id}`);
            setDisabilityRequests(dis.data?.requests || []);

            // Fetch safeguarding
            const safe = await axios.get(`${API_URL}/support/safeguarding/${id}`);
            setSafeguardingReports(safe.data?.reports || []);

            // Fetch announcements from student-dashboard endpoint (same source as dashboard)
            try {
                const dash = await axios.get(`${API_URL}/students/student-dashboard`, {
                    params: { email: user?.email }
                });
                if (dash.data?.success) {
                    setAnnouncements(dash.data?.data?.announcements || []);
                }
            } catch (e) {
                console.warn('Announcements fetch failed:', e?.message);
                setAnnouncements([]);
            }

            // Fetch enrolled courses list for feedback dropdown
            try {
                const ann = await axios.get(`${API_URL}/notifications/announcements`, {
                    params: { student_email: user?.email }
                });
                if (ann.data?.courses && ann.data.courses.length > 0) {
                    setEnrolledCourses(ann.data.courses);
                    console.log('Courses loaded from announcements:', ann.data.courses);
                } else {
                    // Fetch courses separately if not in announcements response
                    const coursesRes = await axios.get(`${API_URL}/notifications/courses/${user?.email}`);
                    if (coursesRes.data?.courses) {
                        setEnrolledCourses(coursesRes.data.courses);
                        console.log('Courses loaded separately:', coursesRes.data.courses);
                    }
                }
            } catch (e) {
                console.warn('Enrolled courses fetch failed:', e?.message);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Support Requests Handlers
    const handleSubmitSupportRequest = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/support/requests`, {
                student_id: studentId,
                type: supportForm.type,
                subject: supportForm.subject,
                description: supportForm.description
            });
            setSupportForm({ type: '', subject: '', description: '' });
            setShowSupportForm(false);
            fetchAllData(studentId);
        } catch (err) {
            console.error('Error submitting support request:', err);
        }
    };

    // Feedback Handlers
    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/support/feedback`, {
                student_id: studentId,
                course_id: feedbackForm.course_id,
                module_code: feedbackForm.course_name,
                feedback_type: feedbackForm.feedback_type,
                rating: feedbackForm.rating,
                comments: feedbackForm.comments
            });
            setFeedbackForm({ course_id: '', course_name: '', module_code: '', feedback_type: '', rating: 5, comments: '' });
            setShowFeedbackForm(false);
            fetchAllData(studentId);
        } catch (err) {
            console.error('Error submitting feedback:', err);
        }
    };

    // Complaints Handlers
    const handleSubmitComplaint = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/support/complaints`, {
                student_id: studentId,
                type: complaintForm.type,
                category: complaintForm.category,
                description: complaintForm.description,
                priority: complaintForm.priority
            });
            setComplaintForm({ type: '', category: '', description: '', priority: 'medium' });
            setShowComplaintForm(false);
            fetchAllData(studentId);
        } catch (err) {
            console.error('Error submitting complaint:', err);
        }
    };

    // Disability Handlers
    const handleSubmitDisability = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/support/disability`, {
                student_id: studentId,
                request_type: disabilityForm.request_type,
                description: disabilityForm.description
            });
            setDisabilityForm({ request_type: '', description: '' });
            setShowDisabilityForm(false);
            fetchAllData(studentId);
        } catch (err) {
            console.error('Error submitting disability request:', err);
        }
    };

    // Safeguarding Handlers
    const handleSubmitSafeguarding = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/support/safeguarding/report`, {
                student_id: studentId,
                report_type: safeguardingForm.report_type,
                description: safeguardingForm.description,
                severity: safeguardingForm.severity
            });
            setSafeguardingForm({ report_type: '', description: '', severity: 'medium' });
            setShowSafeguardingForm(false);
            fetchAllData(studentId);
        } catch (err) {
            console.error('Error submitting safeguarding report:', err);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'open': 'bg-yellow-100 text-yellow-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            'resolved': 'bg-green-100 text-green-800',
            'pending': 'bg-gray-100 text-gray-800',
            'approved': 'bg-green-100 text-green-800',
            'denied': 'bg-red-100 text-red-800',
            'reported': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'high': 'bg-red-100 text-red-800',
            'medium': 'bg-yellow-100 text-yellow-800',
            'low': 'bg-blue-100 text-blue-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    if (loading && !studentId) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Support & Messages Hub</h1>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto border-b border-gray-200 pb-4">
                {[
                    { id: 'messages', label: 'Announcements', icon: MessageSquare },
                    { id: 'support', label: 'Support', icon: Plus },
                    { id: 'feedback', label: 'Feedback', icon: FileText },
                    { id: 'complaints', label: 'Complaints', icon: Scale },
                    { id: 'disability', label: 'Disability', icon: Accessibility },
                    { id: 'safeguarding', label: 'Safeguarding', icon: Shield }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setSelectedComplaint(null); }}
                        className={`px-4 py-2 font-medium whitespace-nowrap transition ${
                            activeTab === tab.id
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* MESSAGES TAB */}
            {activeTab === 'messages' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                            <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1F2937' }}>
                                <Megaphone className="w-4 h-4" style={{ color: '#2563EB' }} />
                                Announcements from Your Courses
                            </h2>
                        </div>
                        <div className="p-4">
                            {announcements.length === 0 ? (
                                <div className="text-center py-8" style={{ color: '#6B7280' }}>
                                    <Megaphone className="w-8 h-8 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                                    <p className="text-sm font-medium">No announcements</p>
                                    <p className="text-xs mt-1">Announcements from your enrolled Moodle courses will appear here</p>
                                </div>
                            ) : (
                                <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
                                    {announcements.map(ann => (
                                        <div key={ann.id} className="py-3 px-1 rounded">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Megaphone className="w-3 h-3" style={{ color: '#D07020' }} />
                                                <p className="text-xs font-semibold" style={{ color: '#1F2937' }}>{ann.subject}</p>
                                            </div>
                                            {ann.message && <p className="text-[11px] line-clamp-2 ml-5" style={{ color: '#6B7280' }}>{ann.message}</p>}
                                            <div className="flex items-center gap-2 mt-1 ml-5">
                                                {ann.coursename && <span className="text-[10px]" style={{ color: '#6B7280' }}>{ann.coursename}</span>}
                                                {ann.userfullname && <span className="text-[10px]" style={{ color: '#6B7280' }}>· {ann.userfullname}</span>}
                                                {ann.timemodified && (
                                                    <span className="text-[10px] ml-auto" style={{ color: '#9CA3AF' }}>
                                                        {new Date(ann.timemodified).toLocaleDateString('en-GB')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SUPPORT REQUESTS TAB */}
            {activeTab === 'support' && (
                <div className="space-y-6">
                    <button
                        onClick={() => setShowSupportForm(!showSupportForm)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> New Support Request
                    </button>

                    {showSupportForm && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-xl font-bold mb-4">Submit Support Request</h3>
                            <form onSubmit={handleSubmitSupportRequest}>
                                <select
                                    value={supportForm.type}
                                    onChange={(e) => setSupportForm({...supportForm, type: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4"
                                    required
                                >
                                    <option value="">Select type...</option>
                                    <option value="academic">Academic Advising</option>
                                    <option value="wellbeing">Wellbeing</option>
                                    <option value="technical">Technical Support</option>
                                    <option value="general">General</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    value={supportForm.subject}
                                    onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4"
                                    required
                                />
                                <textarea
                                    placeholder="Describe your request..."
                                    value={supportForm.description}
                                    onChange={(e) => setSupportForm({...supportForm, description: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4 h-32"
                                    required
                                ></textarea>
                                <div className="flex gap-3">
                                    <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Submit</button>
                                    <button
                                        type="button"
                                        onClick={() => setShowSupportForm(false)}
                                        className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {supportRequests.map(req => (
                            <div key={req.id} className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{req.subject}</p>
                                        <p className="text-sm text-gray-600 mt-1">{req.description.substring(0, 100)}...</p>
                                        <div className="flex gap-2 mt-3">
                                            <span className={`px-3 py-1 rounded text-sm ${getStatusColor(req.status)}`}>{req.status}</span>
                                            <span className="text-xs text-gray-600">{new Date(req.created_at).toLocaleDateString('en-GB')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FEEDBACK TAB */}
            {activeTab === 'feedback' && (
                <div className="space-y-6">
                    <button
                        onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Submit Feedback
                    </button>

                    {showFeedbackForm && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-xl font-bold mb-4">Course Feedback & Evaluation</h3>
                            <form onSubmit={handleSubmitFeedback}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Select Course *</label>
                                    <select
                                        value={feedbackForm.course_id}
                                        onChange={(e) => {
                                            const selectedCourse = enrolledCourses.find(c => c.id == e.target.value);
                                            setFeedbackForm({
                                                ...feedbackForm, 
                                                course_id: e.target.value,
                                                course_name: selectedCourse?.name || '',
                                                module_code: selectedCourse?.code || ''
                                            });
                                        }}
                                        className="w-full px-4 py-2 border rounded"
                                        required
                                    >
                                        <option value="">-- Select a course --</option>
                                        {enrolledCourses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.code} - {course.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <select
                                    value={feedbackForm.feedback_type}
                                    onChange={(e) => setFeedbackForm({...feedbackForm, feedback_type: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4"
                                    required
                                >
                                    <option value="">Select feedback category...</option>
                                    <option value="course">Course Content</option>
                                    <option value="tutor">Tutor Quality</option>
                                    <option value="materials">Learning Materials</option>
                                    <option value="assessment">Assessment Methods</option>
                                    <option value="support">Support & Resources</option>
                                </select>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-3">Rating (Click to rate)</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setFeedbackForm({...feedbackForm, rating: star})}
                                                    className="text-4xl transition-all hover:scale-125 cursor-pointer"
                                                >
                                                    {star <= feedbackForm.rating ? (
                                                        <span className="text-yellow-400">â˜…</span>
                                                    ) : (
                                                        <span className="text-gray-300">â˜†</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-lg font-bold text-purple-600 min-w-fit">{feedbackForm.rating || 0} / 5</span>
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Additional comments (optional)..."
                                    value={feedbackForm.comments}
                                    onChange={(e) => setFeedbackForm({...feedbackForm, comments: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4 h-24"
                                ></textarea>
                                <div className="flex gap-3">
                                    <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Submit Feedback</button>
                                    <button
                                        type="button"
                                        onClick={() => setShowFeedbackForm(false)}
                                        className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <h3 className="text-lg font-bold p-4 bg-purple-50 border-b">My Feedback History</h3>
                        {feedback.length === 0 ? (
                            <p className="p-6 text-gray-600 text-center">No feedback submitted yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Course</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Rating</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Comments</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {feedback.map(fb => (
                                            <tr key={fb.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <span className="font-medium text-gray-900">{fb.module_code || 'N/A'}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {fb.feedback_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <span key={star} className={`${star <= fb.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                                {star <= fb.rating ? 'â—' : 'â—‹'}
                                                            </span>
                                                        ))}
                                                        <span className="ml-2 text-sm font-semibold text-gray-700">{fb.rating}/5</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                                    {fb.comments || 'No comments'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {fb.submitted_at ? new Date(fb.submitted_at).toLocaleDateString('en-GB') : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* COMPLAINTS & APPEALS TAB */}
            {activeTab === 'complaints' && (
                <div className="space-y-6">
                    <button
                        onClick={() => setShowComplaintForm(!showComplaintForm)}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> New Complaint/Appeal
                    </button>

                    {showComplaintForm && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-xl font-bold mb-4">Submit Complaint or Appeal</h3>
                            <form onSubmit={handleSubmitComplaint}>
                                <select
                                    value={complaintForm.type}
                                    onChange={(e) => setComplaintForm({...complaintForm, type: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4"
                                    required
                                >
                                    <option value="">Select type...</option>
                                    <option value="complaint">Complaint</option>
                                    <option value="appeal">Appeal</option>
                                </select>
                                <select
                                    value={complaintForm.category}
                                    onChange={(e) => setComplaintForm({...complaintForm, category: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4"
                                    required
                                >
                                    <option value="">Select category...</option>
                                    <option value="academic">Academic Dispute</option>
                                    <option value="grade">Grade Appeal</option>
                                    <option value="disciplinary">Disciplinary Appeal</option>
                                    <option value="policy">Policy Concern</option>
                                </select>
                                <textarea
                                    placeholder="Describe your complaint or appeal..."
                                    value={complaintForm.description}
                                    onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4 h-32"
                                    required
                                ></textarea>
                                <select
                                    value={complaintForm.priority}
                                    onChange={(e) => setComplaintForm({...complaintForm, priority: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4"
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>
                                <div className="flex gap-3">
                                    <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">Submit</button>
                                    <button
                                        type="button"
                                        onClick={() => setShowComplaintForm(false)}
                                        className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {complaints.map(comp => (
                            <div key={comp.id} className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
                                 onClick={() => setSelectedComplaint(comp.id)}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">Case: {comp.case_number}</p>
                                        <p className="text-sm text-gray-600 mt-1">{comp.description.substring(0, 100)}...</p>
                                        <div className="flex gap-2 mt-3">
                                            <span className={`px-3 py-1 rounded text-sm ${getStatusColor(comp.status)}`}>{comp.status}</span>
                                            <span className={`px-3 py-1 rounded text-sm ${getPriorityColor(comp.priority)}`}>{comp.priority}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DISABILITY SUPPORT TAB */}
            {activeTab === 'disability' && (
                <div className="space-y-6">
                    <button
                        onClick={() => setShowDisabilityForm(!showDisabilityForm)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Request Adjustment
                    </button>

                    {showDisabilityForm && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-xl font-bold mb-4">Request Reasonable Adjustment</h3>
                            <form onSubmit={handleSubmitDisability}>
                                <select
                                    value={disabilityForm.request_type}
                                    onChange={(e) => setDisabilityForm({...disabilityForm, request_type: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4"
                                    required
                                >
                                    <option value="">Select adjustment type...</option>
                                    <option value="extra_time">Extra Time in Exams</option>
                                    <option value="alternative_assessment">Alternative Assessment</option>
                                    <option value="materials">Learning Materials Adjustment</option>
                                    <option value="physical_access">Physical Access Needs</option>
                                </select>
                                <textarea
                                    placeholder="Describe your needs and supporting evidence..."
                                    value={disabilityForm.description}
                                    onChange={(e) => setDisabilityForm({...disabilityForm, description: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4 h-32"
                                    required
                                ></textarea>
                                <p className="text-sm text-gray-600 mb-4">You can upload supporting documents after submission</p>
                                <div className="flex gap-3">
                                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Submit</button>
                                    <button
                                        type="button"
                                        onClick={() => setShowDisabilityForm(false)}
                                        className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {disabilityRequests.map(req => (
                            <div key={req.id} className="bg-white rounded-lg shadow p-4">
                                <p className="font-bold text-gray-900">{req.request_type}</p>
                                <p className="text-sm text-gray-600 mt-1">{req.description.substring(0, 100)}...</p>
                                <div className="flex gap-2 mt-3">
                                    <span className={`px-3 py-1 rounded text-sm ${getStatusColor(req.status)}`}>{req.status}</span>
                                    {req.valid_until && <span className="text-xs text-gray-600">Valid until: {new Date(req.valid_until).toLocaleDateString('en-GB')}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SAFEGUARDING TAB */}
            {activeTab === 'safeguarding' && (
                <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-900 font-bold">Confidential Support</p>
                        <p className="text-red-800 text-sm mt-2">Reports are treated with the highest level of confidentiality. Only authorized safeguarding team members can access this information.</p>
                    </div>

                    <button
                        onClick={() => setShowSafeguardingForm(!showSafeguardingForm)}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Report Concern
                    </button>

                    {showSafeguardingForm && (
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
                            <h3 className="text-xl font-bold mb-4">Report Safeguarding Concern</h3>
                            <form onSubmit={handleSubmitSafeguarding}>
                                <select
                                    value={safeguardingForm.report_type}
                                    onChange={(e) => setSafeguardingForm({...safeguardingForm, report_type: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4"
                                    required
                                >
                                    <option value="">Select concern type...</option>
                                    <option value="concern">General Concern</option>
                                    <option value="disclosure">Disclosure</option>
                                    <option value="incident">Incident Report</option>
                                </select>
                                <textarea
                                    placeholder="Describe the concern (be as detailed as possible)..."
                                    value={safeguardingForm.description}
                                    onChange={(e) => setSafeguardingForm({...safeguardingForm, description: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4 h-32"
                                    required
                                ></textarea>
                                <select
                                    value={safeguardingForm.severity}
                                    onChange={(e) => setSafeguardingForm({...safeguardingForm, severity: e.target.value})}
                                    className="w-full px-4 py-2 border rounded mb-4"
                                >
                                    <option value="low">Moderate Concern</option>
                                    <option value="medium">Serious Concern</option>
                                    <option value="high">Critical - Immediate Action Needed</option>
                                </select>
                                <div className="flex gap-3">
                                    <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">Submit Report</button>
                                    <button
                                        type="button"
                                        onClick={() => setShowSafeguardingForm(false)}
                                        className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {safeguardingReports.map(report => (
                            <div key={report.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-600">
                                <p className="font-bold text-gray-900">Report #{report.id}</p>
                                <p className="text-sm text-gray-600 mt-1">{report.description.substring(0, 100)}...</p>
                                <div className="flex gap-2 mt-3">
                                    <span className={`px-3 py-1 rounded text-sm ${getStatusColor(report.status)}`}>{report.status}</span>
                                    <span className="text-xs text-gray-600">{new Date(report.created_at).toLocaleDateString('en-GB')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentSupportHub;

