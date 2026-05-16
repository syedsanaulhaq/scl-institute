import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Users, BookOpen, Plus, Trash2, Search, ChevronRight,
    GraduationCap, CheckCircle2, AlertCircle, RefreshCw, X
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

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [courseSearch, setCourseSearch] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
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
                // Re-select to refresh courses shown
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

    const fetchCourses = useCallback(async () => {
        if (allCourses.length > 0) return;
        setCoursesLoading(true);
        try {
            const res = await axios.get(`${API_URL}/students/admin/moodle-courses`);
            if (res.data?.success) setAllCourses(res.data.data);
        } catch {
            showToast('Failed to load Moodle courses list', 'error');
        } finally {
            setCoursesLoading(false);
        }
    }, [allCourses.length]);

    useEffect(() => { fetchTeachers(); }, []);

    const handleSelectTeacher = (teacher) => {
        setSelected(teacher);
        setSelectedCourseId('');
        setCourseSearch('');
        fetchCourses();
    };

    const handleEnroll = async () => {
        if (!selected || !selectedCourseId) return;
        setActionLoading(true);
        try {
            const res = await axios.post(`${API_URL}/students/admin/teacher-enroll`, {
                teacherEmail: selected.email,
                courseId: parseInt(selectedCourseId, 10)
            });
            if (res.data?.success) {
                showToast('Teacher enrolled in course successfully');
                setSelectedCourseId('');
                await fetchTeachers(true);
            } else {
                showToast(res.data?.message || 'Enrollment failed', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Enrollment failed', 'error');
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

    // Courses available to assign (not already assigned)
    const assignedCourseIds = new Set((selected?.courses || []).map(c => c.courseId));
    const availableCourses = allCourses.filter(c =>
        !assignedCourseIds.has(c.id) &&
        (courseSearch === '' ||
            c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
            c.code.toLowerCase().includes(courseSearch.toLowerCase()))
    );

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
                    <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Manage teacher accounts and their Moodle course assignments</p>
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
                                                {t.courses?.length || 0} course{t.courses?.length !== 1 ? 's' : ''}
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
                                <p className="text-sm mt-1">Choose a teacher from the list to manage their course assignments</p>
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
                                                {selected.courses?.length || 0} Moodle course{selected.courses?.length !== 1 ? 's' : ''} assigned
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Current course assignments */}
                            <div className="bg-white rounded-xl border shadow-sm mb-5" style={{ borderColor: '#E5E7EB' }}>
                                <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: '#E5E7EB' }}>
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Current Course Assignments</h3>
                                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                                        {selected.courses?.length || 0}
                                    </span>
                                </div>
                                {!selected.courses || selected.courses.length === 0 ? (
                                    <div className="p-8 text-center" style={{ color: '#9CA3AF' }}>
                                        <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p className="text-sm font-medium">No courses assigned</p>
                                        <p className="text-xs mt-1">Use the form below to assign this teacher to a Moodle course</p>
                                    </div>
                                ) : (
                                    <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
                                        {selected.courses.map((course, idx) => (
                                            <div key={idx} className="px-5 py-3 flex items-center justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate" style={{ color: '#1F2937' }}>{course.courseName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs" style={{ color: '#6B7280' }}>{course.courseCode}</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 font-medium">{course.role || 'editingteacher'}</span>
                                                        {course.enrollStatus === null || course.enrollStatus === undefined ? (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">Role only (no enrollment)</span>
                                                        ) : (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">Enrolled</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUnenroll(course.courseId, course.courseName)}
                                                    disabled={actionLoading}
                                                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                                                    title="Remove from course"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Assign to course */}
                            <div className="bg-white rounded-xl border shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                                <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: '#E5E7EB' }}>
                                    <Plus className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Assign to a Course</h3>
                                </div>
                                <div className="p-5">
                                    {coursesLoading ? (
                                        <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                                            <RefreshCw className="w-4 h-4 animate-spin" /> Loading courses...
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                                                <input
                                                    type="text"
                                                    placeholder="Search courses..."
                                                    value={courseSearch}
                                                    onChange={e => { setCourseSearch(e.target.value); setSelectedCourseId(''); }}
                                                    className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    style={{ borderColor: '#E5E7EB' }}
                                                />
                                            </div>

                                            <select
                                                value={selectedCourseId}
                                                onChange={e => setSelectedCourseId(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                style={{ borderColor: '#E5E7EB', color: selectedCourseId ? '#1F2937' : '#9CA3AF' }}
                                                size={availableCourses.length > 8 ? 8 : Math.max(availableCourses.length, 3)}
                                            >
                                                {availableCourses.length === 0 ? (
                                                    <option disabled value="">
                                                        {courseSearch ? 'No matching courses' : 'All courses already assigned'}
                                                    </option>
                                                ) : (
                                                    availableCourses.map(c => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name} ({c.code})
                                                        </option>
                                                    ))
                                                )}
                                            </select>

                                            <button
                                                onClick={handleEnroll}
                                                disabled={!selectedCourseId || actionLoading}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ background: selectedCourseId ? '#2563EB' : '#93C5FD' }}
                                            >
                                                {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                {actionLoading ? 'Assigning...' : 'Assign to Course'}
                                            </button>
                                        </div>
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
