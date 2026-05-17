import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Users, BookOpen, Plus, Trash2, Search, ChevronRight,
    GraduationCap, CheckCircle2, AlertCircle, RefreshCw, X, Wrench,
    Calendar, Layers, ChevronDown
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const RoleBadge = ({ role }) => {
    const isEditing = role?.includes('editing') || role === 'editingteacher';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
            isEditing ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
        }`}>
            {isEditing ? 'Editing Teacher' : role || 'Teacher'}
        </span>
    );
};

const Toast = ({ msg, type, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
            {type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {msg}
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
    );
};

const SemesterBadge = ({ semester }) => {
    if (!semester) return null;
    const isS1 = semester.includes('1');
    return (
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isS1 ? 'bg-violet-50 text-violet-700' : 'bg-orange-50 text-orange-700'}`}>
            {semester}
        </span>
    );
};

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [intakes, setIntakes] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [intakesLoading, setIntakesLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIntakeId, setSelectedIntakeId] = useState('');
    const [selectedMoodleCourseId, setSelectedMoodleCourseId] = useState('');
    const [toast, setToast] = useState(null);
    const [error, setError] = useState('');

    const showToast = (msg, type = 'success') => setToast({ msg, type });

    const fetchTeachers = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API_URL}/students/admin/teachers`);
            if (res.data?.success) {
                setTeachers(res.data.data);
                if (selected) {
                    const updated = res.data.data.find(t => t.id === selected.id);
                    if (updated) setSelected(updated);
                }
            }
        } catch {
            setError('Failed to load teachers. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [selected]);

    const fetchIntakes = useCallback(async () => {
        if (intakes.length > 0) return;
        setIntakesLoading(true);
        try {
            const res = await axios.get(`${API_URL}/students/admin/cohort-intakes`);
            if (res.data?.success) setIntakes(res.data.data);
        } catch {
            showToast('Failed to load course intakes', 'error');
        } finally {
            setIntakesLoading(false);
        }
    }, [intakes.length]);

    useEffect(() => { fetchTeachers(); }, []);

    const handleSelectTeacher = (teacher) => {
        setSelected(teacher);
        setSelectedIntakeId('');
        setSelectedMoodleCourseId('');
        fetchIntakes();
    };

    // Courses already assigned to this teacher (by moodleCourseId)
    const assignedMoodleIds = new Set((selected?.courses || []).map(c => c.courseId));

    // The selected intake's courses, filtered out already assigned ones
    const selectedIntake = intakes.find(i => String(i.id) === String(selectedIntakeId));
    const availableCoursesInIntake = (selectedIntake?.courses || []).filter(
        c => !assignedMoodleIds.has(c.moodleCourseId)
    );

    const handleEnroll = async (moodleCourseIdOverride = null) => {
        const courseId = moodleCourseIdOverride || selectedMoodleCourseId;
        if (!selected || !courseId) return;
        setActionLoading(true);
        try {
            const res = await axios.post(`${API_URL}/students/admin/teacher-enroll`, {
                teacherEmail: selected.email,
                courseId: parseInt(courseId, 10)
            });
            if (res.data?.success) {
                showToast('Teacher assigned to course successfully');
                setSelectedIntakeId('');
                setSelectedMoodleCourseId('');
                await fetchTeachers(true);
            } else {
                showToast(res.data?.message || 'Assignment failed', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Assignment failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnenroll = async (courseId, courseName) => {
        if (!selected) return;
        if (!window.confirm(`Remove "${selected.firstName} ${selected.lastName}" from "${courseName}"?`)) return;
        setActionLoading(true);
        try {
            const res = await axios.delete(`${API_URL}/students/admin/teacher-unenroll`, {
                data: { teacherEmail: selected.email, courseId }
            });
            if (res.data?.success) {
                showToast('Teacher removed from course');
                await fetchTeachers(true);
            } else {
                showToast(res.data?.message || 'Failed to remove', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to remove teacher from course', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(t => {
        const q = search.toLowerCase();
        return (
            `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
            t.email.toLowerCase().includes(q) ||
            (t.role || '').toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                    <p className="text-sm text-slate-500">Loading teachers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
                <div>
                    <h1 className="text-lg font-bold" style={{ color: '#1F2937' }}>Teacher Management</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Assign teachers to cohort subject units and manage their Moodle enrolments</p>
                </div>
                <button onClick={() => fetchTeachers()} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition" style={{ borderColor: '#E5E7EB', color: '#374151' }}>
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {error && (
                <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
            )}

            <div className="flex h-[calc(100vh-120px)]">
                {/* Left: Teacher List */}
                <div className="w-80 flex-shrink-0 bg-white border-r flex flex-col" style={{ borderColor: '#E5E7EB' }}>
                    <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                            <input
                                type="text"
                                placeholder="Search teachers..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderColor: '#E5E7EB' }}
                            />
                        </div>
                        <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>{filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredTeachers.length === 0 ? (
                            <div className="p-6 text-center text-sm" style={{ color: '#9CA3AF' }}>
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                No teachers found
                            </div>
                        ) : (
                            filteredTeachers.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleSelectTeacher(t)}
                                    className={`w-full text-left px-4 py-3 border-b transition-colors flex items-center justify-between group ${
                                        selected?.id === t.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                                    }`}
                                    style={{ borderBottomColor: '#F3F4F6' }}
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-blue-700">
                                                    {(t.firstName?.[0] || '').toUpperCase()}{(t.lastName?.[0] || '').toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold truncate" style={{ color: '#1F2937' }}>
                                                {t.firstName} {t.lastName}
                                            </p>
                                        </div>
                                        <p className="text-xs truncate ml-9" style={{ color: '#6B7280' }}>{t.email}</p>
                                        <div className="flex items-center gap-2 mt-1 ml-9">
                                            <RoleBadge role={t.role} />
                                            <span className="text-[10px]" style={{ color: '#9CA3AF' }}>
                                                {t.courses?.length || 0} subject{t.courses?.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition ${selected?.id === t.id ? 'text-blue-500' : 'text-gray-300 group-hover:text-gray-400'}`} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Teacher Detail */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!selected ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center" style={{ color: '#9CA3AF' }}>
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">Select a teacher</p>
                                <p className="text-sm mt-1">Choose a teacher from the list to manage their subject assignments</p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-3xl">
                            {/* Teacher header */}
                            <div className="bg-white rounded-xl border shadow-sm p-5 mb-5" style={{ borderColor: '#E5E7EB' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl font-bold text-white">
                                            {(selected.firstName?.[0] || '').toUpperCase()}{(selected.lastName?.[0] || '').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-base font-bold" style={{ color: '#1F2937' }}>
                                            {selected.firstName} {selected.lastName}
                                        </h2>
                                        <p className="text-sm" style={{ color: '#6B7280' }}>{selected.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <RoleBadge role={selected.role} />
                                            <span className="text-xs" style={{ color: '#9CA3AF' }}>
                                                {selected.courses?.length || 0} subject unit{selected.courses?.length !== 1 ? 's' : ''} assigned
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Current course assignments */}
                            <div className="bg-white rounded-xl border shadow-sm mb-5" style={{ borderColor: '#E5E7EB' }}>
                                <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: '#E5E7EB' }}>
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Current Subject Assignments</h3>
                                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                                        {selected.courses?.length || 0}
                                    </span>
                                </div>
                                {!selected.courses || selected.courses.length === 0 ? (
                                    <div className="p-8 text-center" style={{ color: '#9CA3AF' }}>
                                        <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p className="text-sm font-medium">No subjects assigned</p>
                                        <p className="text-xs mt-1">Use the form below to assign this teacher to a cohort subject unit</p>
                                    </div>
                                ) : (
                                    <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
                                        {selected.courses.map((course, idx) => (
                                            <div key={idx} className="px-5 py-3.5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold truncate" style={{ color: '#1F2937' }}>{course.courseName}</p>
                                                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                            <span className="text-xs font-mono" style={{ color: '#6B7280' }}>{course.courseCode}</span>
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">{course.role || 'editingteacher'}</span>
                                                            <SemesterBadge semester={course.semesterName} />
                                                            {course.enrollStatus === null || course.enrollStatus === undefined ? (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">Role only</span>
                                                            ) : (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">&#10003; Enrolled</span>
                                                            )}
                                                        </div>
                                                        {/* Cohort/intake info */}
                                                        {course.intakeLabel && (
                                                            <div className="flex items-center gap-3 mt-1.5">
                                                                <div className="flex items-center gap-1 text-[11px]" style={{ color: '#6B7280' }}>
                                                                    <Layers className="w-3 h-3" />
                                                                    <span className="font-medium">{course.intakeLabel} {course.programmeType || ''} Cohort</span>
                                                                </div>
                                                                {course.intakeStartDate && (
                                                                    <div className="flex items-center gap-1 text-[11px]" style={{ color: '#9CA3AF' }}>
                                                                        <Calendar className="w-3 h-3" />
                                                                        <span>Starts {new Date(course.intakeStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        {(course.enrollStatus === null || course.enrollStatus === undefined) && (
                                                            <button
                                                                onClick={() => handleEnroll(course.courseId)}
                                                                disabled={actionLoading}
                                                                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition disabled:opacity-40"
                                                                title="Fix missing Moodle enrolment record"
                                                            >
                                                                <Wrench className="w-3 h-3" /> Fix
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleUnenroll(course.courseId, course.courseName)}
                                                            disabled={actionLoading}
                                                            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                                                            title="Remove from subject"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Assign to cohort course */}
                            <div className="bg-white rounded-xl border shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                                <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: '#E5E7EB' }}>
                                    <Plus className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Assign to Course Subject</h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    {intakesLoading ? (
                                        <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                                            <RefreshCw className="w-4 h-4 animate-spin" /> Loading intakes...
                                        </div>
                                    ) : intakes.length === 0 ? (
                                        <p className="text-sm" style={{ color: '#9CA3AF' }}>No active course intakes found with Moodle subjects configured.</p>
                                    ) : (
                                        <>
                                            {/* Step 1: Intake */}
                                            <div>
                                                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#6B7280' }}>
                                                    Step 1 - Select Course Cohort
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={selectedIntakeId}
                                                        onChange={e => { setSelectedIntakeId(e.target.value); setSelectedMoodleCourseId(''); }}
                                                        className="w-full pl-3 pr-8 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                                        style={{ borderColor: '#E5E7EB', color: selectedIntakeId ? '#1F2937' : '#9CA3AF' }}
                                                    >
                                                        <option value=""> -  Select an intake / cohort  - </option>
                                                        {intakes.map(intake => (
                                                            <option key={intake.id} value={intake.id}>
                                                                {intake.label} - {intake.programName || intake.programmeType}
                                                                {intake.startDate ? ` (starts ${new Date(intake.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })})` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9CA3AF' }} />
                                                </div>
                                                {selectedIntake && (
                                                    <div className="mt-2 flex items-center gap-3 text-xs" style={{ color: '#6B7280' }}>
                                                        <span className="flex items-center gap-1">
                                                            <Layers className="w-3 h-3" /> {selectedIntake.courses.length} subject unit{selectedIntake.courses.length !== 1 ? 's' : ''} in this cohort
                                                        </span>
                                                        {selectedIntake.startDate && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                Starts {new Date(selectedIntake.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Step 2: Course within the intake */}
                                            {selectedIntakeId && (
                                                <div>
                                                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#6B7280' }}>
                                                        Step 2 - Select Subject Unit
                                                    </label>
                                                    {availableCoursesInIntake.length === 0 ? (
                                                        <p className="text-sm py-2" style={{ color: '#9CA3AF' }}>All subject units in this cohort are already assigned to this teacher.</p>
                                                    ) : (
                                                        <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
                                                            {availableCoursesInIntake.map((c, idx) => (
                                                                <label
                                                                    key={c.registrationId}
                                                                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                                                                        String(selectedMoodleCourseId) === String(c.moodleCourseId) ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                                    } ${idx > 0 ? 'border-t' : ''}`}
                                                                    style={{ borderColor: '#F3F4F6' }}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name="courseSelect"
                                                                        value={c.moodleCourseId}
                                                                        checked={String(selectedMoodleCourseId) === String(c.moodleCourseId)}
                                                                        onChange={e => setSelectedMoodleCourseId(e.target.value)}
                                                                        className="mt-0.5 accent-blue-600"
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{c.courseTitle}</p>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            <span className="text-[11px] font-mono" style={{ color: '#6B7280' }}>{c.courseCode}</span>
                                                                            <SemesterBadge semester={c.semesterName} />
                                                                            {c.courseStartDate && (
                                                                                <span className="text-[11px] flex items-center gap-0.5" style={{ color: '#9CA3AF' }}>
                                                                                    <Calendar className="w-3 h-3" />
                                                                                    {new Date(c.courseStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Assign button */}
                                            {selectedIntakeId && availableCoursesInIntake.length > 0 && (
                                                <button
                                                    onClick={handleEnroll}
                                                    disabled={!selectedMoodleCourseId || actionLoading}
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    style={{ background: selectedMoodleCourseId ? '#2563EB' : '#93C5FD' }}
                                                >
                                                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                    {actionLoading ? 'Assigning...' : 'Assign to Subject Unit'}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherManagement;
