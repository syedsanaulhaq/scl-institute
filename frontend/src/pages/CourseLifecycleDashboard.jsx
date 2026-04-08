import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, RefreshCw, CheckCircle2, Clock3, CircleDashed, XCircle, X, Plus, Trash2, Lock, ChevronDown, ChevronRight } from 'lucide-react';

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

const groupCoursesHierarchical = (courses) => {
    const grouped = {};
    
    courses.forEach(course => {
        const programmeType = course.programme_type_name || 'Other';
        const program = course.program_name || 'Unassigned';
        const year = course.academic_year || 'Year 0';
        const semester = course.semester_name || 'Semester 0';
        
        if (!grouped[programmeType]) {
            grouped[programmeType] = {};
        }
        if (!grouped[programmeType][program]) {
            grouped[programmeType][program] = {};
        }
        if (!grouped[programmeType][program][year]) {
            grouped[programmeType][program][year] = {};
        }
        if (!grouped[programmeType][program][year][semester]) {
            grouped[programmeType][program][year][semester] = [];
        }
        
        grouped[programmeType][program][year][semester].push(course);
    });
    
    return grouped;
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
    const [expandedSections, setExpandedSections] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filterProgrammeType, setFilterProgrammeType] = useState('');
    const [filterProgram, setFilterProgram] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [filterCourse, setFilterCourse] = useState('');
    const [filterStatus, setFilterStatus] = useState(''); // 'accreditation', 'visit', 'induction', 'registration', 'fully_active'
    const [moodleHierarchy, setMoodleHierarchy] = useState([]);
    const [deletingCategoryId, setDeletingCategoryId] = useState(null);
    
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
            
            // Fetch Moodle category hierarchy for cascading filter dropdowns
            try {
                const hierResponse = await axios.get(`${API_URL}/students/moodle/category-hierarchy?include_inactive=false`);
                const types = hierResponse.data?.data?.programme_types;
                if (Array.isArray(types)) {
                    setMoodleHierarchy(types);
                }
            } catch (hierErr) {
                console.warn('Failed to fetch hierarchy:', hierErr.message);
            }

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

    const filteredCourses = useMemo(() => {
        let filtered = courses;
        
        // Apply program type filter
        if (filterProgrammeType) {
            filtered = filtered.filter(c => c.programme_type_name === filterProgrammeType);
        }
        
        // Apply program filter
        if (filterProgram) {
            filtered = filtered.filter(c => c.program_name === filterProgram);
        }
        
        // Apply year filter
        if (filterYear) {
            filtered = filtered.filter(c => c.academic_year === filterYear);
        }
        
        // Apply semester filter
        if (filterSemester) {
            filtered = filtered.filter(c => c.semester_name === filterSemester);
        }
        
        // Apply course filter
        if (filterCourse) {
            filtered = filtered.filter(c => 
                (c.course_code || '').toLowerCase().includes(filterCourse.toLowerCase()) ||
                (c.course_title || '').toLowerCase().includes(filterCourse.toLowerCase())
            );
        }
        
        // Apply status filter
        if (filterStatus) {
            if (filterStatus === 'accreditation') {
                filtered = filtered.filter(c => isDoneStatus(c.accreditation_status));
            } else if (filterStatus === 'visit') {
                filtered = filtered.filter(c => isDoneStatus(c.visit_status));
            } else if (filterStatus === 'induction') {
                filtered = filtered.filter(c => isDoneStatus(c.induction_status));
            } else if (filterStatus === 'registration') {
                filtered = filtered.filter(c => isDoneStatus(c.registration_status));
            } else if (filterStatus === 'fully_active') {
                filtered = filtered.filter(c => getOverallCourseStatus(c) === 'completed');
            }
        }
        
        return filtered;
    }, [courses, filterProgrammeType, filterProgram, filterYear, filterSemester, filterCourse, filterStatus]);

    // Cascading hierarchy filter options from Moodle categories
    const programmeTypes = useMemo(() => {
        return moodleHierarchy.map(t => t.name).filter(Boolean).sort();
    }, [moodleHierarchy]);

    const programs = useMemo(() => {
        if (!filterProgrammeType) return [];
        const typeNode = moodleHierarchy.find(t => t.name === filterProgrammeType);
        if (!typeNode?.programs) return [];
        return typeNode.programs.map(p => p.name).filter(Boolean).sort();
    }, [moodleHierarchy, filterProgrammeType]);

    const years = useMemo(() => {
        if (!filterProgrammeType || !filterProgram) return [];
        const typeNode = moodleHierarchy.find(t => t.name === filterProgrammeType);
        const progNode = typeNode?.programs?.find(p => p.name === filterProgram);
        if (!progNode?.years) return [];
        return progNode.years.map(y => y.name).filter(Boolean).sort();
    }, [moodleHierarchy, filterProgrammeType, filterProgram]);

    const semesters = useMemo(() => {
        if (!filterProgrammeType || !filterProgram || !filterYear) return [];
        const typeNode = moodleHierarchy.find(t => t.name === filterProgrammeType);
        const progNode = typeNode?.programs?.find(p => p.name === filterProgram);
        const yearNode = progNode?.years?.find(y => y.name === filterYear);
        if (!yearNode?.semesters) return [];
        return yearNode.semesters.map(s => s.name).filter(Boolean).sort();
    }, [moodleHierarchy, filterProgrammeType, filterProgram, filterYear]);

    const groupedCourses = useMemo(() => groupCoursesHierarchical(filteredCourses), [filteredCourses]);

    // Auto-expand sections when filters are applied
    useEffect(() => {
        const hasActiveFilters = filterProgrammeType || filterProgram || filterYear || filterSemester || filterCourse || filterStatus;
        
        if (hasActiveFilters && Object.keys(groupedCourses).length > 0) {
            // Build all section keys to expand
            const sectionsToExpand = {};
            
            Object.entries(groupedCourses).forEach(([programmeType, programs]) => {
                const typeKey = `type-${programmeType}`;
                sectionsToExpand[typeKey] = true;
                
                Object.entries(programs).forEach(([program, years]) => {
                    const progKey = `prog-${programmeType}-${program}`;
                    sectionsToExpand[progKey] = true;
                    
                    Object.entries(years).forEach(([year, semesters]) => {
                        const yearKey = `year-${programmeType}-${program}-${year}`;
                        sectionsToExpand[yearKey] = true;
                        
                        Object.keys(semesters).forEach(semester => {
                            const semKey = `sem-${programmeType}-${program}-${year}-${semester}`;
                            sectionsToExpand[semKey] = true;
                        });
                    });
                });
            });
            
            setExpandedSections(sectionsToExpand);
        }
    }, [filterProgrammeType, filterProgram, filterYear, filterSemester, filterCourse, filterStatus, groupedCourses]);

    const handleClearFilters = () => {
        setFilterProgrammeType('');
        setFilterProgram('');
        setFilterYear('');
        setFilterSemester('');
        setFilterCourse('');
        setFilterStatus('');
        setExpandedSections({}); // Collapse all sections when filters are cleared
    };

    // Resolve a category name path to its Moodle category ID using the hierarchy
    const findCategoryId = (programmeTypeName, programName, yearName, semesterName) => {
        const norm = (s) => String(s || '').trim().toLowerCase();
        const type = moodleHierarchy.find(t => norm(t.name) === norm(programmeTypeName));
        if (!type) return null;
        if (!programName) return type.id;
        const prog = (type.programs || []).find(p => norm(p.name) === norm(programName));
        if (!prog) return null;
        if (!yearName) return prog.id;
        const yr = (prog.years || []).find(y => norm(y.name) === norm(yearName));
        if (!yr) return null;
        if (!semesterName) return yr.id;
        const sem = (yr.semesters || []).find(s => norm(s.name) === norm(semesterName));
        return sem ? sem.id : null;
    };

    const handleDeleteCategory = async (e, categoryId, categoryName) => {
        e.stopPropagation();
        if (!categoryId) {
            alert('Could not resolve Moodle category ID for this entry.');
            return;
        }
        if (!window.confirm(`Delete category "${categoryName}"?\n\nThis will CASCADE delete:\n• All child categories\n• All courses inside them\n• Related accreditations, visits, inductions, registrations & enrollments\n\nThis action cannot be undone.`)) {
            return;
        }
        try {
            setDeletingCategoryId(categoryId);
            const res = await axios.delete(`${API_URL}/students/moodle/delete-category/${categoryId}`);
            if (res.data?.success) {
                alert(res.data.message || `Category "${categoryName}" deleted successfully.`);
                await fetchDashboard();
            } else {
                alert(res.data?.message || 'Failed to delete category');
            }
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setDeletingCategoryId(null);
        }
    };

    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

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
            <div className="flex flex-col gap-4">
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
                <div className="w-full">
                    <div className="space-y-3 bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                            {(filterProgrammeType || filterProgram || filterYear || filterSemester || filterCourse || filterStatus) && (
                                <button
                                    onClick={handleClearFilters}
                                    className="text-xs text-scl-purple hover:text-scl-purple/80 font-medium"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                            {/* Programme Type Filter */}
                            <select
                                value={filterProgrammeType}
                                onChange={(e) => {
                                    setFilterProgrammeType(e.target.value);
                                    setFilterProgram('');
                                    setFilterYear('');
                                    setFilterSemester('');
                                }}
                                className="px-3 py-2 rounded-lg border border-gray-300 focus:border-scl-purple focus:outline-none focus:ring-2 focus:ring-scl-purple/20 text-sm bg-white"
                            >
                                <option value="">All Programme Types</option>
                                {programmeTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>

                            {/* Program Filter */}
                            <select
                                value={filterProgram}
                                onChange={(e) => {
                                    setFilterProgram(e.target.value);
                                    setFilterYear('');
                                    setFilterSemester('');
                                }}
                                disabled={!filterProgrammeType}
                                className={`px-3 py-2 rounded-lg border border-gray-300 focus:border-scl-purple focus:outline-none focus:ring-2 focus:ring-scl-purple/20 text-sm bg-white ${!filterProgrammeType ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <option value="">{filterProgrammeType ? 'All Programmes' : 'Select Programme Type first'}</option>
                                {programs.map(prog => (
                                    <option key={prog} value={prog}>{prog}</option>
                                ))}
                            </select>

                            {/* Year Filter */}
                            <select
                                value={filterYear}
                                onChange={(e) => {
                                    setFilterYear(e.target.value);
                                    setFilterSemester('');
                                }}
                                disabled={!filterProgram}
                                className={`px-3 py-2 rounded-lg border border-gray-300 focus:border-scl-purple focus:outline-none focus:ring-2 focus:ring-scl-purple/20 text-sm bg-white ${!filterProgram ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <option value="">{filterProgram ? 'All Years' : 'Select Programme first'}</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>

                            {/* Semester Filter */}
                            <select
                                value={filterSemester}
                                onChange={(e) => setFilterSemester(e.target.value)}
                                disabled={!filterYear}
                                className={`px-3 py-2 rounded-lg border border-gray-300 focus:border-scl-purple focus:outline-none focus:ring-2 focus:ring-scl-purple/20 text-sm bg-white ${!filterYear ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <option value="">{filterYear ? 'All Semesters' : 'Select Year first'}</option>
                                {semesters.map(sem => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </select>

                            {/* Course Filter */}
                            <input
                                type="text"
                                placeholder="Search course code or title..."
                                value={filterCourse}
                                onChange={(e) => setFilterCourse(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-gray-300 focus:border-scl-purple focus:outline-none focus:ring-2 focus:ring-scl-purple/20 text-sm"
                            />
                        </div>
                        
                        <p className="text-xs text-gray-500">
                            Found <span className="font-semibold text-gray-900">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                <button
                    onClick={() => setFilterStatus('')}
                    className={`rounded-xl border p-4 transition-all cursor-pointer ${
                        filterStatus === '' ? 'border-scl-purple bg-scl-purple/5 ring-2 ring-scl-purple/20' : 'border-gray-200 bg-white hover:border-scl-purple/30'
                    }`}
                >
                    <p className="text-xs text-gray-500 uppercase">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.total_courses || 0}</p>
                </button>
                <button
                    onClick={() => setFilterStatus('accreditation')}
                    className={`rounded-xl border p-4 transition-all cursor-pointer ${
                        filterStatus === 'accreditation' ? 'border-scl-purple bg-scl-purple/5 ring-2 ring-scl-purple/20' : 'border-gray-200 bg-white hover:border-scl-purple/30'
                    }`}
                >
                    <p className="text-xs text-gray-500 uppercase">Accreditation Done</p>
                    <p className="text-2xl font-bold text-scl-purple">{summary.accreditation_completed || 0}</p>
                </button>
                <button
                    onClick={() => setFilterStatus('visit')}
                    className={`rounded-xl border p-4 transition-all cursor-pointer ${
                        filterStatus === 'visit' ? 'border-scl-purple bg-scl-purple/5 ring-2 ring-scl-purple/20' : 'border-gray-200 bg-white hover:border-scl-purple/30'
                    }`}
                >
                    <p className="text-xs text-gray-500 uppercase">Visit Done</p>
                    <p className="text-2xl font-bold text-scl-purple">{summary.visit_completed || 0}</p>
                </button>
                <button
                    onClick={() => setFilterStatus('induction')}
                    className={`rounded-xl border p-4 transition-all cursor-pointer ${
                        filterStatus === 'induction' ? 'border-scl-purple bg-scl-purple/5 ring-2 ring-scl-purple/20' : 'border-gray-200 bg-white hover:border-scl-purple/30'
                    }`}
                >
                    <p className="text-xs text-gray-500 uppercase">Induction Done</p>
                    <p className="text-2xl font-bold text-scl-purple">{summary.induction_completed || 0}</p>
                </button>
                <button
                    onClick={() => setFilterStatus('registration')}
                    className={`rounded-xl border p-4 transition-all cursor-pointer ${
                        filterStatus === 'registration' ? 'border-scl-purple bg-scl-purple/5 ring-2 ring-scl-purple/20' : 'border-gray-200 bg-white hover:border-scl-purple/30'
                    }`}
                >
                    <p className="text-xs text-gray-500 uppercase">Registration Done</p>
                    <p className="text-2xl font-bold text-scl-purple">{summary.registration_completed || 0}</p>
                </button>
                <button
                    onClick={() => setFilterStatus('fully_active')}
                    className={`rounded-xl border p-4 transition-all cursor-pointer ${
                        filterStatus === 'fully_active' ? 'border-green-600 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 bg-white hover:border-green-300'
                    }`}
                >
                    <p className="text-xs text-gray-500 uppercase">Fully Active</p>
                    <p className="text-2xl font-bold text-green-700">{summary.fully_active || 0}</p>
                </button>
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
                    {courses.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">No courses entered yet.</div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                            <p>No courses match your search.</p>
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="text-scl-purple hover:underline text-sm mt-2"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {Object.entries(groupedCourses).map(([programmeType, programs]) => {
                                const programmeTypeKey = `type-${programmeType}`;
                                const isExpanded = expandedSections[programmeTypeKey];
                                return (
                                    <div key={programmeTypeKey} className="border-b border-gray-200 last:border-b-0">
                                        <div className="flex items-center bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <button
                                                onClick={() => toggleSection(programmeTypeKey)}
                                                className="flex-1 px-6 py-4 flex items-center gap-3 font-semibold text-gray-900"
                                            >
                                                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                                <span>{programmeType}</span>
                                                <span className="ml-auto text-xs font-normal text-gray-500">
                                                    {Object.keys(programs).length} {Object.keys(programs).length === 1 ? 'Programme' : 'Programmes'}
                                                </span>
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteCategory(e, findCategoryId(programmeType), programmeType)}
                                                disabled={deletingCategoryId != null && deletingCategoryId === findCategoryId(programmeType)}
                                                className="px-3 py-2 mr-3 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-50"
                                                title={`Delete "${programmeType}"`}
                                            >
                                                {deletingCategoryId != null && deletingCategoryId === findCategoryId(programmeType) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {isExpanded && (
                                            <div className="space-y-0">
                                                {Object.entries(programs).map(([program, years]) => {
                                                    const programKey = `prog-${programmeType}-${program}`;
                                                    const isProgExpanded = expandedSections[programKey];
                                                    return (
                                                        <div key={programKey} className="border-b border-gray-100 last:border-b-0">
                                                            <div className="flex items-center hover:bg-gray-50 transition-colors">
                                                                <button
                                                                    onClick={() => toggleSection(programKey)}
                                                                    className="flex-1 px-10 py-3 flex items-center gap-3 font-medium text-gray-800 text-sm"
                                                                >
                                                                    {isProgExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                                    <span>{program}</span>
                                                                    <span className="ml-auto text-xs font-normal text-gray-500">
                                                                        {Object.keys(years).length} {Object.keys(years).length === 1 ? 'Year' : 'Years'}
                                                                    </span>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleDeleteCategory(e, findCategoryId(programmeType, program), program)}
                                                                    disabled={deletingCategoryId != null && deletingCategoryId === findCategoryId(programmeType, program)}
                                                                    className="px-3 py-2 mr-3 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-50"
                                                                    title={`Delete "${program}"`}
                                                                >
                                                                    {deletingCategoryId != null && deletingCategoryId === findCategoryId(programmeType, program) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                                </button>
                                                            </div>

                                                            {isProgExpanded && (
                                                                <div className="space-y-0">
                                                                    {Object.entries(years).map(([year, semesters]) => {
                                                                        const yearKey = `year-${programmeType}-${program}-${year}`;
                                                                        const isYearExpanded = expandedSections[yearKey];
                                                                        return (
                                                                            <div key={yearKey} className="border-b border-gray-100 last:border-b-0">
                                                                                <div className="flex items-center hover:bg-gray-50 transition-colors">
                                                                                    <button
                                                                                        onClick={() => toggleSection(yearKey)}
                                                                                        className="flex-1 px-14 py-2.5 flex items-center gap-3 font-medium text-gray-700 text-sm"
                                                                                    >
                                                                                        {isYearExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                                                        <span>{year}</span>
                                                                                        <span className="ml-auto text-xs font-normal text-gray-500">
                                                                                            {Object.keys(semesters).length} {Object.keys(semesters).length === 1 ? 'Semester' : 'Semesters'}
                                                                                        </span>
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={(e) => handleDeleteCategory(e, findCategoryId(programmeType, program, year), year)}
                                                                                        disabled={deletingCategoryId != null && deletingCategoryId === findCategoryId(programmeType, program, year)}
                                                                                        className="px-3 py-2 mr-3 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-50"
                                                                                        title={`Delete "${year}"`}
                                                                                    >
                                                                                        {deletingCategoryId != null && deletingCategoryId === findCategoryId(programmeType, program, year) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                                                    </button>
                                                                                </div>

                                                                                {isYearExpanded && (
                                                                                    <div className="space-y-0">
                                                                                        {Object.entries(semesters).map(([semester, semesterCourses]) => {
                                                                                            const semesterKey = `sem-${programmeType}-${program}-${year}-${semester}`;
                                                                                            const isSemExpanded = expandedSections[semesterKey];
                                                                                            return (
                                                                                                <div key={semesterKey}>
                                                                                                    <div className="flex items-center hover:bg-gray-50 transition-colors">
                                                                                                        <button
                                                                                                            onClick={() => toggleSection(semesterKey)}
                                                                                                            className="flex-1 px-16 py-2 flex items-center gap-3 font-medium text-gray-600 text-sm"
                                                                                                        >
                                                                                                            {isSemExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                                                                            <span>{semester}</span>
                                                                                                            <span className="ml-auto text-xs font-normal text-gray-500">
                                                                                                                {semesterCourses.length} {semesterCourses.length === 1 ? 'Course' : 'Courses'}
                                                                                                            </span>
                                                                                                        </button>
                                                                                                        <button
                                                                                                            onClick={(e) => handleDeleteCategory(e, findCategoryId(programmeType, program, year, semester), semester)}
                                                                                                            disabled={deletingCategoryId != null && deletingCategoryId === findCategoryId(programmeType, program, year, semester)}
                                                                                                            className="px-3 py-2 mr-3 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-50"
                                                                                                            title={`Delete "${semester}"`}
                                                                                                        >
                                                                                                            {deletingCategoryId != null && deletingCategoryId === findCategoryId(programmeType, program, year, semester) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                                                                        </button>
                                                                                                    </div>

                                                                                                    {isSemExpanded && (
                                                                                                        <div className="space-y-1 px-16 py-2 bg-gray-50">
                                                                                                            {semesterCourses.map((course) => (
                                                                                                                <div
                                                                                                                    key={course.lifecycle_key}
                                                                                                                    onClick={() => handleSelectCourse(course)}
                                                                                                                    className="p-3 rounded border border-gray-200 bg-white hover:border-scl-purple hover:bg-scl-purple/5 cursor-pointer transition-all"
                                                                                                                >
                                                                                                                    <div className="flex items-center justify-between gap-3">
                                                                                                                        <div className="flex-1 min-w-0">
                                                                                                                            <div className="font-medium text-gray-900 text-sm">{course.course_title || 'Untitled'}</div>
                                                                                                                            <div className="text-xs text-gray-500">{course.course_code || 'No Code'}</div>
                                                                                                                        </div>
                                                                                                                        <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                                                                                                                            <div className="text-center">
                                                                                                                                <div className="text-xs text-gray-500">Accred.</div>
                                                                                                                                <div className="flex justify-center mt-0.5">
                                                                                                                                    {statusIcon(getDisplayStepStatus(course, 'accreditation'))}
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                            <div className="text-center">
                                                                                                                                <div className="text-xs text-gray-500">Visit</div>
                                                                                                                                <div className="flex justify-center mt-0.5">
                                                                                                                                    {statusIcon(getDisplayStepStatus(course, 'visit'))}
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                            <div className="text-center">
                                                                                                                                <div className="text-xs text-gray-500">Induct.</div>
                                                                                                                                <div className="flex justify-center mt-0.5">
                                                                                                                                    {statusIcon(getDisplayStepStatus(course, 'induction'))}
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                            <div className="text-center">
                                                                                                                                <div className="text-xs text-gray-500">Reg.</div>
                                                                                                                                <div className="flex justify-center mt-0.5">
                                                                                                                                    {statusIcon(getDisplayStepStatus(course, 'registration'))}
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
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
                                                    onClick={() => navigate(`/course-registrations?auto_open=1&course_code=${selectedCourse.course_code}&course_title=${selectedCourse.course_title}`)}
                                                    disabled={!registrationUnlocked}
                                                    title={!registrationUnlocked ? 'Complete Induction first' : 'Open Registration'}
                                                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {!registrationUnlocked ? <Lock className="w-4 h-4 inline mr-1" /> : null}
                                                    Open Registration
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/programme-intakes`)}
                                                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                                                    title="View programme intakes"
                                                >
                                                    View Intakes
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

        </div>
    );
};

export default CourseLifecycleDashboard;
