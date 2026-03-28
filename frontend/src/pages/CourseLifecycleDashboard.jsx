import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, RefreshCw, CheckCircle2, Clock3, CircleDashed, XCircle, X, Plus, Trash2, Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const STATUS_STYLES = {
    not_started: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-amber-100 text-amber-800',
    completed: 'bg-emerald-100 text-emerald-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    locked: 'bg-slate-100 text-slate-700'
};

const STATUS_LABELS = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    completed: 'Completed',
    approved: 'Approved',
    rejected: 'Rejected',
    locked: 'Locked'
};

const TAB_KEYS = ['accreditation', 'visit', 'induction', 'registration'];

const statusBadge = (status) => {
    const normalized = String(status || 'not_started').toLowerCase();
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[normalized] || STATUS_STYLES.not_started}`}>
            {STATUS_LABELS[normalized] || STATUS_LABELS.not_started}
        </span>
    );
};

const statusIcon = (status) => {
    switch (status) {
        case 'approved':
        case 'completed':
            return <CheckCircle2 className="w-4 h-4 text-green-600" />;
        case 'in_progress':
            return <Clock3 className="w-4 h-4 text-amber-600" />;
        case 'rejected':
            return <XCircle className="w-4 h-4 text-red-600" />;
        default:
            return <CircleDashed className="w-4 h-4 text-gray-500" />;
    }
};

const isDoneStatus = (status) => ['completed', 'approved'].includes(String(status || '').toLowerCase());

const isStepUnlocked = (course, stepKey) => {
    if (!course) return false;
    if (stepKey === 'accreditation') return true;
    if (stepKey === 'visit') return isDoneStatus(course.accreditation_status);
    if (stepKey === 'induction') return isDoneStatus(course.visit_status);
    if (stepKey === 'registration') return isDoneStatus(course.induction_status);
    return false;
};

const getDisplayStepStatus = (course, stepKey) => {
    const currentStatus = String(course?.[`${stepKey}_status`] || 'not_started').toLowerCase();
    if (currentStatus === 'not_started' && !isStepUnlocked(course, stepKey)) {
        return 'locked';
    }
    return currentStatus;
};

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB');
};

const formatFieldValue = (key, value) => {
    if (value === null || value === undefined || value === '') return '-';

    const normalizedKey = String(key || '').toLowerCase();
    const isDateField = normalizedKey.includes('date') || normalizedKey.endsWith('_at');

    if (isDateField) {
        return formatDate(value);
    }

    return String(value);
};

const buildAccreditationCreatePath = (course) => {
    const params = new URLSearchParams();
    if (course?.master_id) params.set('master_id', String(course.master_id));
    if (course?.course_title) params.set('course_title', course.course_title);
    if (course?.course_code) params.set('course_code', course.course_code);
    if (course?.awarding_body) params.set('awarding_body', course.awarding_body);
    if (course?.qualification_level) params.set('qualification_level', course.qualification_level);
    if (course?.application_type) params.set('application_type', course.application_type);
    if (course?.course_type) params.set('course_type', course.course_type);
    if (course?.document_owner) params.set('document_owner', course.document_owner);
    if (course?.lead_coordinator) params.set('lead_coordinator', course.lead_coordinator);
    if (course?.version) params.set('version', course.version);
    const query = params.toString();
    return query ? `/course-accreditations/new?${query}` : '/course-accreditations/new';
};

const buildVisitCreatePath = (course) => {
    const params = new URLSearchParams();
    if (course?.master_id) params.set('master_id', String(course.master_id));
    if (course?.course_title) params.set('course_title', course.course_title);
    if (course?.course_code) params.set('course_code', course.course_code);
    if (course?.awarding_body) params.set('awarding_body', course.awarding_body);
    if (course?.version) params.set('version', course.version);
    const query = params.toString();
    return query ? `/course-visits/new?${query}` : '/course-visits/new';
};

const buildInductionCreatePath = (course) => {
    const params = new URLSearchParams();
    if (course?.master_id) params.set('master_id', String(course.master_id));
    if (course?.course_title) params.set('course_title', course.course_title);
    if (course?.course_code) params.set('course_code', course.course_code);
    if (course?.awarding_body) params.set('awarding_body', course.awarding_body);
    if (course?.qualification_level) params.set('qualification_level', course.qualification_level);
    if (course?.document_owner) params.set('document_owner', course.document_owner);
    if (course?.version) params.set('version', course.version);
    const query = params.toString();
    return query ? `/course-inductions/new?${query}` : '/course-inductions/new';
};

const getOverallCourseStatus = (course) => {
    const stepStatuses = [
        course?.accreditation_status,
        course?.visit_status,
        course?.induction_status,
        course?.registration_status
    ];

    if (stepStatuses.some((status) => status === 'rejected')) {
        return 'rejected';
    }

    if (stepStatuses.every((status) => ['completed', 'approved'].includes(status))) {
        return 'completed';
    }

    if (stepStatuses.some((status) => ['completed', 'approved', 'in_progress'].includes(status))) {
        return 'in_progress';
    }

    return 'not_started';
};

const CourseLifecycleDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [courses, setCourses] = useState([]);
    const [summary, setSummary] = useState({
        total_courses: 0,
        accreditation_completed: 0,
        visit_completed: 0,
        induction_completed: 0,
        registration_completed: 0,
        fully_active: 0
    });
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [details, setDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('accreditation');
    const [deleting, setDeleting] = useState(false);
    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${API_URL}/students/course-lifecycle/dashboard`);
            const rows = response.data?.data?.courses || [];
            setCourses(rows);
            setSummary(response.data?.data?.summary || {
                total_courses: rows.length,
                accreditation_completed: 0,
                visit_completed: 0,
                induction_completed: 0,
                registration_completed: 0,
                fully_active: 0
            });

        } catch (err) {
            console.error('Failed to fetch lifecycle dashboard:', err);
            setError('Failed to load lifecycle dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCourse = async (course, shouldSetTab = true) => {
        if (!course) return;
        setSelectedCourse(course);
        if (shouldSetTab) {
            setActiveTab('accreditation');
        }

        try {
            setDetailsLoading(true);
            const response = await axios.get(`${API_URL}/students/course-lifecycle/details`, {
                params: {
                    course_code: course.course_code || '',
                    course_title: course.course_title || ''
                }
            });
            setDetails(response.data?.data || null);
        } catch (err) {
            console.error('Failed to fetch course lifecycle details:', err);
            setDetails(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tabSections = useMemo(() => ({
        accreditation: details?.accreditation || {},
        visit: details?.visit || {},
        induction: details?.induction || {},
        registration: details?.registration || {}
    }), [details]);

    const selectedDoc = tabSections[activeTab]?.document || null;
    const overallCourseStatus = selectedCourse ? getOverallCourseStatus(selectedCourse) : 'not_started';
    const visitUnlocked = isStepUnlocked(selectedCourse, 'visit');
    const inductionUnlocked = isStepUnlocked(selectedCourse, 'induction');
    const registrationUnlocked = isStepUnlocked(selectedCourse, 'registration');

    const closeModal = () => {
        setSelectedCourse(null);
        setDetails(null);
        setActiveTab('accreditation');
    };

    const handleDeleteCourse = async () => {
        if (!selectedCourse) return;

        const confirm = window.confirm(
            `Are you sure you want to delete "${selectedCourse.course_title}" (${selectedCourse.course_code})? This will also delete it from Moodle. This action cannot be undone.`
        );

        if (!confirm) return;

        try {
            setDeleting(true);
            const response = await axios.delete(`${API_URL}/students/course-lifecycle/delete`, {
                data: {
                    course_code: selectedCourse.course_code,
                    course_title: selectedCourse.course_title
                }
            });

            if (response.data?.success) {
                alert('Course deleted successfully from SCL and Moodle');
                closeModal();
                fetchDashboard();
            } else {
                alert(`Delete failed: ${response.data?.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to delete course:', error);
            const backendMessage = error.response?.data?.message;
            const backendDetail = error.response?.data?.error;
            const composed = [backendMessage, backendDetail].filter(Boolean).join(' - ');
            alert(`Failed to delete course: ${composed || error.message}`);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Lifecycle Dashboard</h1>
                    <p className="text-sm text-gray-500">One place to track accreditation, visit, induction, and registration status for every course.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/course-master/new')}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-scl-purple text-white hover:bg-scl-purple/90 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Course
                    </button>
                    <button
                        onClick={fetchDashboard}
                        className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800"
                    >
                        <RefreshCw className="w-4 h-4 inline mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500 uppercase">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.total_courses || 0}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500 uppercase">Accreditation Done</p>
                    <p className="text-2xl font-bold text-scl-purple">{summary.accreditation_completed || 0}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500 uppercase">Visit Done</p>
                    <p className="text-2xl font-bold text-scl-purple">{summary.visit_completed || 0}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500 uppercase">Induction Done</p>
                    <p className="text-2xl font-bold text-scl-purple">{summary.induction_completed || 0}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500 uppercase">Registration Done</p>
                    <p className="text-2xl font-bold text-scl-purple">{summary.registration_completed || 0}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500 uppercase">Fully Active</p>
                    <p className="text-2xl font-bold text-green-700">{summary.fully_active || 0}</p>
                </div>
            </div>

            {loading ? (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-scl-purple" />
                    <p className="text-sm text-gray-600 mt-2">Loading dashboard...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Accreditation</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Visit</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Induction</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Registration</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500">No courses entered yet.</td>
                                    </tr>
                                ) : courses.map((course) => (
                                    <tr
                                        key={course.lifecycle_key}
                                        onClick={() => handleSelectCourse(course)}
                                        className="border-b border-gray-100 cursor-pointer hover:bg-scl-purple/5 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm">
                                            <div className="font-semibold text-gray-900">{course.course_title || 'Untitled Course'}</div>
                                            <div className="text-xs text-gray-500">{course.course_code || 'No Code'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                {statusIcon(getDisplayStepStatus(course, 'accreditation'))}
                                                {statusBadge(getDisplayStepStatus(course, 'accreditation'))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                {statusIcon(getDisplayStepStatus(course, 'visit'))}
                                                {statusBadge(getDisplayStepStatus(course, 'visit'))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                {statusIcon(getDisplayStepStatus(course, 'induction'))}
                                                {statusBadge(getDisplayStepStatus(course, 'induction'))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                {statusIcon(getDisplayStepStatus(course, 'registration'))}
                                                {statusBadge(getDisplayStepStatus(course, 'registration'))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(course.last_updated_at)}</td>
                                    </tr>
                                ))}

                                {/* Detail Modal */}
                                {selectedCourse && (
                                    <div
                                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                                        onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                                    >
                                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                                            {/* Modal Header */}
                                            <div className="flex items-start justify-between p-6 border-b border-gray-200">
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-900">{selectedCourse.course_title || 'Untitled Course'}</h2>
                                                    <p className="text-sm text-gray-500 mt-0.5">{selectedCourse.course_code || 'No Code'}</p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <span>Overall Course:</span>
                                                            {statusBadge(overallCourseStatus)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <span>Accreditation:</span>
                                                            {statusBadge(selectedCourse.accreditation_status)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <span>Induction:</span>
                                                            {statusBadge(selectedCourse.induction_status)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <span>Visit:</span>
                                                            {statusBadge(selectedCourse.visit_status)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <span>Registration:</span>
                                                            {statusBadge(selectedCourse.registration_status)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleDeleteCourse}
                                                        disabled={deleting}
                                                        className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                        title="Delete this course"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={closeModal}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tabs */}
                                            <div className="flex gap-1 px-6 pt-4">
                                                {TAB_KEYS.map((key) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setActiveTab(key)}
                                                        className={`px-4 py-2 text-sm rounded-lg font-semibold capitalize transition-colors ${
                                                            activeTab === key
                                                                ? 'bg-scl-purple text-white'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {key}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Modal Body */}
                                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                                {detailsLoading ? (
                                                    <div className="text-center py-12">
                                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-scl-purple" />
                                                        <p className="text-sm text-gray-500 mt-2">Loading details...</p>
                                                    </div>
                                                ) : !selectedDoc ? (
                                                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 text-center">
                                                        No {activeTab} record exists for this course yet.
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2.5 text-sm">
                                                            {Object.entries(selectedDoc)
                                                                .filter(([key]) => key !== 'id')
                                                                .slice(0, 12)
                                                                .map(([key, value]) => (
                                                                    <div key={key} className="grid grid-cols-2 gap-4">
                                                                        <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                                                        <span className="text-gray-900 font-medium break-words">{formatFieldValue(key, value)}</span>
                                                                    </div>
                                                                ))}
                                                        </div>

                                                        {activeTab === 'accreditation' && (
                                                            <div className="grid grid-cols-3 gap-3 text-sm">
                                                                <div className="rounded-lg bg-gray-100 p-3 text-center">
                                                                    <p className="text-xs text-gray-500 mb-1">Tasks</p>
                                                                    <p className="text-xl font-bold text-gray-800">{tabSections.accreditation.tasks?.length || 0}</p>
                                                                </div>
                                                                <div className="rounded-lg bg-gray-100 p-3 text-center">
                                                                    <p className="text-xs text-gray-500 mb-1">Risks</p>
                                                                    <p className="text-xl font-bold text-gray-800">{tabSections.accreditation.risks?.length || 0}</p>
                                                                </div>
                                                                <div className="rounded-lg bg-gray-100 p-3 text-center">
                                                                    <p className="text-xs text-gray-500 mb-1">Sign-offs</p>
                                                                    <p className="text-xl font-bold text-gray-800">{tabSections.accreditation.signoffs?.length || 0}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {activeTab === 'induction' && (
                                                            <div className="grid grid-cols-4 gap-3 text-sm">
                                                                <div className="rounded-lg bg-gray-100 p-3 text-center">
                                                                    <p className="text-xs text-gray-500 mb-1">Requirements</p>
                                                                    <p className="text-xl font-bold text-gray-800">{tabSections.induction.requirements?.length || 0}</p>
                                                                </div>
                                                                <div className="rounded-lg bg-gray-100 p-3 text-center">
                                                                    <p className="text-xs text-gray-500 mb-1">Conditions</p>
                                                                    <p className="text-xl font-bold text-gray-800">{tabSections.induction.conditions?.length || 0}</p>
                                                                </div>
                                                                <div className="rounded-lg bg-gray-100 p-3 text-center">
                                                                    <p className="text-xs text-gray-500 mb-1">Risks</p>
                                                                    <p className="text-xl font-bold text-gray-800">{tabSections.induction.risks?.length || 0}</p>
                                                                </div>
                                                                <div className="rounded-lg bg-gray-100 p-3 text-center">
                                                                    <p className="text-xs text-gray-500 mb-1">Sign-offs</p>
                                                                    <p className="text-xl font-bold text-gray-800">{tabSections.induction.signoffs?.length || 0}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {/* Modal Footer */}
                                            <div className="flex flex-wrap gap-2 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                                                <button
                                                    onClick={() => navigate(selectedCourse.accreditation_id ? `/course-accreditations/${selectedCourse.accreditation_id}` : buildAccreditationCreatePath(selectedCourse))}
                                                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-scl-purple text-white hover:bg-scl-purple/90 transition-colors"
                                                >
                                                    Open Accreditation
                                                </button>
                                                <button
                                                    onClick={() => navigate(selectedCourse.visit_id ? `/course-visits/${selectedCourse.visit_id}` : buildVisitCreatePath(selectedCourse))}
                                                    disabled={!selectedCourse.visit_id && !visitUnlocked}
                                                    title={!selectedCourse.visit_id && !visitUnlocked ? 'Complete Accreditation first' : 'Open Visit'}
                                                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {!selectedCourse.visit_id && !visitUnlocked ? <Lock className="w-4 h-4 inline mr-1" /> : null}
                                                    Open Visit
                                                </button>
                                                <button
                                                    onClick={() => navigate(selectedCourse.induction_id ? `/course-inductions/${selectedCourse.induction_id}` : buildInductionCreatePath(selectedCourse))}
                                                    disabled={!selectedCourse.induction_id && !inductionUnlocked}
                                                    title={!selectedCourse.induction_id && !inductionUnlocked ? 'Complete Visit first' : 'Open Induction'}
                                                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {!selectedCourse.induction_id && !inductionUnlocked ? <Lock className="w-4 h-4 inline mr-1" /> : null}
                                                    Open Induction
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const params = new URLSearchParams({
                                                            auto_open: '1',
                                                            form_only: '1',
                                                            course_code: String(selectedCourse.course_code || ''),
                                                            course_title: String(selectedCourse.course_title || ''),
                                                            awarding_body: String(selectedCourse.awarding_body || ''),
                                                            qualification_level: String(selectedCourse.qualification_level || '')
                                                        });
                                                        navigate(`/course-registrations?${params.toString()}`);
                                                    }}
                                                    disabled={!selectedCourse.registration_id && !registrationUnlocked}
                                                    title={!selectedCourse.registration_id && !registrationUnlocked ? 'Complete Induction first' : 'Open Registration'}
                                                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {!selectedCourse.registration_id && !registrationUnlocked ? <Lock className="w-4 h-4 inline mr-1" /> : null}
                                                    Open Registration
                                                </button>
                                                <button
                                                    onClick={closeModal}
                                                    className="ml-auto px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CourseLifecycleDashboard;
