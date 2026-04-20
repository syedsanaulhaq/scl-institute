import React, { useState, useEffect } from 'react';
import { BookOpen, Award, Target } from 'lucide-react';
import axios from 'axios';
import { openMoodleSSO } from '../../utils/ssoService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ACCEPTED_APPLICATION_STATUSES = new Set(['accepted', 'conditional_accept']);
const APPLICATION_PROFILE_FIELDS = [
    'middle_names',
    'contact_number',
    'date_of_birth',
    'gender',
    'nationality',
    'address_line1',
    'address_line2',
    'town_city',
    'postcode',
    'country_of_residence',
    'entry_route',
    'highest_qualification',
    'institution_name',
    'year_completed',
    'relevant_work_experience',
    'english_proficiency',
    'english_score'
];

const extractProgrammeCode = (courseCode) => {
    const match = String(courseCode || '').trim().match(/^([A-Z]+-\d+)(?:-INFO)?$/i);
    return match ? match[1].toUpperCase() : '';
};

const belongsToProgramme = (course, programmeCode) => {
    if (!programmeCode) return true;

    const courseCode = String(course?.course_code || '').toUpperCase();
    if (!courseCode) return false;

    return courseCode === `${programmeCode}-INFO` || courseCode.startsWith(`${programmeCode}-`);
};

const extractProgrammeKey = (courseCode) => {
    const normalized = String(courseCode || '').trim().toUpperCase();
    if (!normalized) return '';

    const infoMatch = normalized.match(/^(.+)-INFO$/);
    if (infoMatch) return infoMatch[1];

    const yearMatch = normalized.match(/^(.+)-Y\d+(?:-S\d+.*)?$/);
    if (yearMatch) return yearMatch[1];

    const fallback = normalized.match(/^([A-Z]+-\d+)/);
    return fallback ? fallback[1] : normalized;
};

const applicationCompletenessScore = (app) =>
    APPLICATION_PROFILE_FIELDS.reduce((score, field) => {
        const value = app?.[field];
        if (value === null || value === undefined) return score;
        if (typeof value === 'string' && value.trim() === '') return score;
        return score + 1;
    }, 0);

const selectRelevantApplication = (applications) => {
    const apps = Array.isArray(applications) ? applications.filter(Boolean) : [];
    if (apps.length === 0) return null;

    return [...apps].sort((a, b) => {
        const aAccepted = ACCEPTED_APPLICATION_STATUSES.has(String(a?.application_status || '').toLowerCase());
        const bAccepted = ACCEPTED_APPLICATION_STATUSES.has(String(b?.application_status || '').toLowerCase());
        if (aAccepted !== bAccepted) {
            return Number(bAccepted) - Number(aAccepted);
        }

        const scoreDiff = applicationCompletenessScore(b) - applicationCompletenessScore(a);
        if (scoreDiff !== 0) return scoreDiff;

        return new Date(b?.updated_at || b?.created_at || 0) - new Date(a?.updated_at || a?.created_at || 0);
    })[0];
};

const mapCatalogCoursesToProgramme = (categories, studentApp) => {
    const appTitle = String(studentApp?.course_title || '').trim().toLowerCase();
    const appType = String(studentApp?.course_type || '').trim().toLowerCase();

    const allEntries = [];

    (categories || []).forEach((category) => {
        const categoryName = String(category?.name || '');

        (category?.courses || []).forEach((course) => {
            allEntries.push({
                ...course,
                _categoryName: categoryName,
                _programName: categoryName
            });
        });

        (category?.subcategories || []).forEach((program) => {
            (program?.courses || []).forEach((course) => {
                allEntries.push({
                    ...course,
                    _categoryName: categoryName,
                    _programName: String(program?.name || categoryName)
                });
            });
        });
    });

    const byTitle = allEntries.filter((course) => {
        if (!appTitle) return false;
        const programName = String(course._programName || '').toLowerCase();
        const courseTitle = String(course.course_title || course.fullname || course.name || '').toLowerCase();
        return programName.includes(appTitle) || appTitle.includes(programName) || courseTitle.includes(appTitle);
    });

    const byType = allEntries.filter((course) => {
        if (!appType) return false;
        return String(course._categoryName || '').toLowerCase() === appType;
    });

    const picked = byTitle.length > 0 ? byTitle : (byType.length > 0 ? byType : allEntries);

    const deduped = new Map();
    picked.forEach((course) => {
        const id = Number(course.id);
        if (!Number.isFinite(id)) return;
        if (deduped.has(id)) return;
        deduped.set(id, {
            id,
            moodle_course_id: id,
            course_title: course.course_title || course.fullname || course.name || `Course ${id}`,
            course_code: course.course_code || course.idnumber || `COURSE-${id}`,
            course_type: course._categoryName || studentApp?.course_type || 'General',
            description: course.description || '',
            programme_name: course._programName || '',
            isStudentEnrolled: true,
            hasTeachingRole: false,
            fromCatalogueFallback: true
        });
    });

    return Array.from(deduped.values());
};

const StudentProgramme = ({ user }) => {
    const [programmeData, setProgrammeData] = useState(null);
    const [courseModules, setCourseModules] = useState([]);
    const [learningOutcomes, setLearningOutcomes] = useState([]);
    const [registeredCourses, setRegisteredCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [programmeWarning, setProgrammeWarning] = useState('');
    const [ssoLoading, setSsoLoading] = useState(false);
    const [ssoError, setSsoError] = useState('');
    const [expandedSections, setExpandedSections] = useState({});
    const [catalogCategories, setCatalogCategories] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [catalogError, setCatalogError] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterProgram, setFilterProgram] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const outcomesRef = React.useRef(null);

    // Extract year from course code (e.g., "Y1" from "DEG-001-Y1-S1-C1")
    const extractYear = (courseCode) => {
        const match = String(courseCode || '').match(/Y(\d+)/);
        return match ? `Year ${match[1]}` : null;
    };

    // Extract semester from course code (e.g., "S1" from "DEG-001-Y1-S1-C1")
    const extractSemester = (courseCode) => {
        const match = String(courseCode || '').match(/S(\d+)/);
        return match ? `Semester ${match[1]}` : null;
    };

    const formatProgrammeStage = (course, fallbackType) => {
        const yearNumber = Number(course?.year_number || 0);
        if (yearNumber > 0) {
            const labels = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];
            const label = labels[yearNumber - 1] || `Year ${yearNumber}`;
            return String(label).toUpperCase().includes('YEAR') ? String(label).toUpperCase() : `${label.toUpperCase()} YEAR`;
        }
        return fallbackType || 'Programme';
    };

    const formatProgrammeDuration = (course, fallbackDuration) => {
        const startDate = course?.start_date ? new Date(course.start_date) : null;
        const endDate = course?.end_date ? new Date(course.end_date) : null;

        if (startDate && endDate && !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && endDate > startDate) {
            const months = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30.44));
            if (months >= 11 && months <= 13) return '1 Year';
            if (months > 0) return `${months} Months`;
        }

        if (Number(course?.duration_months || 0) > 0) {
            const months = Number(course.duration_months);
            if (months === 12) return '1 Year';
            return `${months} Months`;
        }

        return fallbackDuration || '1 Year';
    };

    const toggleSection = (index) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    useEffect(() => {
        fetchProgrammeData();
        fetchCourseCatalog();
    }, [user]);

    useEffect(() => {
        if (registeredCourses.length > 0) {
            // Prefer the first course that is not locked and not progression-blocked (active semester)
            const firstActive = registeredCourses.find((course) => !course.isLocked && !isProgressionBlocked(course));
            const firstUnlocked = registeredCourses.find((course) => !course.isLocked);
            const preferredCourse = firstActive || firstUnlocked || registeredCourses[0];
            setSelectedCourseId(String(preferredCourse.moodle_course_id || preferredCourse.id));
        } else {
            setSelectedCourseId('');
        }
    }, [registeredCourses]);

    // Fetch Moodle sections/modules when selected course changes
    useEffect(() => {
        const selected = registeredCourses.find(
            (course) => String(course.moodle_course_id || course.id) === String(selectedCourseId)
        );

        if (selectedCourseId && selected && !selected.isLocked && !isProgressionBlocked(selected)) {
            fetchCourseSections();
        } else {
            setCourseModules([]);
        }
    }, [selectedCourseId, registeredCourses]);

    const fetchCourseSections = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/students/moodle-course/${selectedCourseId}/sections`
            );
            if (response.data?.success) {
                const { sections } = response.data.data;
                // Transform sections into module format matching expected structure
                const modulesData = sections.map(section => ({
                    id: section.id,
                    name: section.name,
                    summary: section.summary,
                    modules: section.modules.map(mod => ({
                        id: mod.id,
                        name: mod.name || mod.idnumber || `Module ${mod.id}`,
                        type: mod.type
                    }))
                }));
                setCourseModules(modulesData);
            }
        } catch (err) {
            console.error('Error fetching course sections:', err);
            setCourseModules([]);
        }
    };

    const fetchProgrammeData = async () => {
        try {
            setLoading(true);
            setError('');
            setProgrammeWarning('');

            // Get student's accepted application directly by email (more efficient)
            const appsResponse = await axios.get(`${API_URL}/students/my-applications`, {
                params: { email: user.email }
            });
            
            if (appsResponse.data?.success) {
                const apps = appsResponse.data.data?.applications || [];
                const studentApp = selectRelevantApplication(apps);
                const registeredCoursesResponse = await axios.get(`${API_URL}/students/my-moodle-courses`, {
                    params: { email: user.email }
                });
                const allRegisteredCourses = (registeredCoursesResponse.data?.data || []).filter(
                    (course) => course.isStudentEnrolled
                );
                
                if (studentApp) {
                    const currentProgrammeCode = extractProgrammeCode(studentApp.course_code);
                    const myStudentCourses = allRegisteredCourses.filter(
                        (course) => course.isStudentEnrolled && belongsToProgramme(course, currentProgrammeCode)
                    );

                    if (myStudentCourses.length > 0) {
                        setRegisteredCourses(myStudentCourses);
                    } else if (allRegisteredCourses.length > 0) {
                        setRegisteredCourses(allRegisteredCourses);
                        setProgrammeWarning('Showing your registered Moodle courses because the current programme code did not match the returned Moodle enrolments.');
                    } else {
                        // Fallback to synced catalogue to keep full programme filters visible.
                        const catalogResponse = await axios.get(`${API_URL}/students/course-catalog`);
                        const categories = catalogResponse.data?.data?.categories || [];
                        const fallbackCourses = mapCatalogCoursesToProgramme(categories, studentApp);
                        setRegisteredCourses(fallbackCourses);
                        setProgrammeWarning('Showing synced programme courses from catalogue because Moodle enrollment data is incomplete.');
                    }

                    try {
                        const progResponse = await axios.get(`${API_URL}/students/programme/${studentApp.id}`);
                        if (progResponse.data?.success) {
                            const { programme, modules, outcomes } = progResponse.data.data;
                            setError('');
                            setProgrammeData({
                                ...studentApp,
                                ...programme
                            });
                            setCourseModules(modules || []);
                            setLearningOutcomes(outcomes || []);
                        } else {
                            setProgrammeData(studentApp);
                            setCourseModules([]);
                            setLearningOutcomes([]);
                            setProgrammeWarning((currentWarning) => currentWarning || 'Programme overview could not be loaded, but your registered Moodle courses are shown below.');
                        }
                    } catch (programmeErr) {
                        console.error('Error fetching programme details:', programmeErr);
                        setProgrammeData(studentApp);
                        setCourseModules([]);
                        setLearningOutcomes([]);
                        setProgrammeWarning((currentWarning) => currentWarning || 'Programme overview could not be loaded, but your registered Moodle courses are shown below.');
                    }
                } else {
                    setProgrammeData(null);
                    setCourseModules([]);
                    setLearningOutcomes([]);
                    setRegisteredCourses(allRegisteredCourses);
                    setProgrammeWarning(
                        allRegisteredCourses.length > 0
                            ? 'No accepted application found. Showing your registered Moodle courses below.'
                            : 'No accepted application or Moodle course registrations were found.'
                    );
                }
            }
        } catch (err) {
            console.error('Error fetching programme:', err);
            setError('Failed to load programme details');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseCatalog = async () => {
        try {
            setCatalogLoading(true);
            setCatalogError('');
            const response = await axios.get(`${API_URL}/students/course-catalog`);
            const categories = response.data?.data?.categories || [];
            setCatalogCategories(categories);
        } catch (err) {
            console.error('Error fetching course catalog:', err);
            setCatalogError('Failed to load course catalog');
        } finally {
            setCatalogLoading(false);
        }
    };

    const handleAccessLMS = async (courseId = null) => {
        try {
            setSsoLoading(true);
            setSsoError('');
            const success = await openMoodleSSO(user.email, {
                redirectTo: courseId ? `/course/view.php?id=${courseId}` : null,
                onError: (message) => setSsoError(message)
            });
            if (!success) {
                setSsoError((prev) => prev || 'Failed to generate SSO link');
            }
        } catch (err) {
            setSsoError(err.response?.data?.message || 'Failed to access Moodle');
        } finally {
            setSsoLoading(false);
        }
    };

    const scrollToOutcomes = () => {
        outcomesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const selectedCourse = registeredCourses.find(
        (course) => String(course.moodle_course_id || course.id) === String(selectedCourseId)
    );

    const isProgressionBlocked = (course) => {
        if (!course) return false;

        if (course.isLocked) return true;
        if (course.hasActiveEnrollment === false) return true;

        const selectedYear = Number(course.year_number || extractYear(course.course_code)?.replace('Year ', '') || 0);
        const selectedSemester = Number(course.semester_number || extractSemester(course.course_code)?.replace('Semester ', '') || 0);
        const programmeKey = extractProgrammeKey(course.course_code);

        // Check year-level progression: all lower year courses must be completed
        if (selectedYear > 1) {
            const lowerYearCourses = registeredCourses.filter((candidate) => {
                const sameProgramme = extractProgrammeKey(candidate.course_code) === programmeKey;
                const candidateYear = Number(candidate.year_number || extractYear(candidate.course_code)?.replace('Year ', '') || 0);
                return sameProgramme && candidateYear > 0 && candidateYear < selectedYear;
            });
            if (lowerYearCourses.length > 0 && lowerYearCourses.some((c) => !c.isCompleted)) return true;
        }

        // Check semester-level progression within the same year
        if (selectedSemester > 1) {
            const lowerSemesterCourses = registeredCourses.filter((candidate) => {
                const sameProgramme = extractProgrammeKey(candidate.course_code) === programmeKey;
                const candidateYear = Number(candidate.year_number || extractYear(candidate.course_code)?.replace('Year ', '') || 0);
                const candidateSemester = Number(candidate.semester_number || extractSemester(candidate.course_code)?.replace('Semester ', '') || 0);
                return sameProgramme && candidateYear === selectedYear && candidateSemester > 0 && candidateSemester < selectedSemester;
            });
            if (lowerSemesterCourses.length > 0 && lowerSemesterCourses.some((c) => !c.isCompleted)) return true;
        }

        return false;
    };

    const selectedCourseBlocked = isProgressionBlocked(selectedCourse);
    const overviewTitle = selectedCourse?.course_title || programmeData?.title || programmeData?.course_title || 'Programme Title';
    const overviewCode = selectedCourse?.course_code || programmeData?.code || programmeData?.course_code || 'N/A';
    const overviewType = formatProgrammeStage(selectedCourse, selectedCourse?.course_type || programmeData?.type || programmeData?.course_type || 'Programme');
    const overviewStudyMode = programmeData?.studyMode || programmeData?.mode_of_study || programmeData?.study_mode || programmeData?.modeOfStudy || 'Full-time';
    const overviewStartDate = selectedCourse?.start_date || programmeData?.startDate || programmeData?.intake_start_date || null;
    const overviewDuration = formatProgrammeDuration(selectedCourse, programmeData?.duration || '1 Year');

    if (loading) {
        return <div className="p-8 text-center">Loading programme details...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Programme</h1>

            {programmeWarning && (
                <div className="mb-6 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-sm">
                    {programmeWarning}
                </div>
            )}

            {registeredCourses.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Registered Courses</h2>
                    
                    {catalogLoading ? (
                        <div className="text-sm text-gray-600">Loading course filters...</div>
                    ) : catalogError ? (
                        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                            {catalogError}
                        </div>
                    ) : (
                        <>
                            {/* Compute available categories (only those with registered courses) */}
                            {(() => {
                                const availableCategories = catalogCategories.filter((category) => {
                                    const hasRegisteredCourse = registeredCourses.some((rc) => 
                                        (category.courses || []).some((c) => String(c.id) === String(rc.moodle_course_id || rc.id)) ||
                                        (category.subcategories || []).some((sub) => 
                                            (sub.courses || []).some((c) => String(c.id) === String(rc.moodle_course_id || rc.id))
                                        )
                                    );
                                    return hasRegisteredCourse;
                                });

                                // Get available programs for selected category
                                const selectedCategoryObj = availableCategories.find((c) => String(c.id) === filterCategory);
                                const availablePrograms = selectedCategoryObj?.subcategories?.filter((prog) => {
                                    const hasRegisteredCourse = registeredCourses.some((rc) =>
                                        (prog.courses || []).some((c) => String(c.id) === String(rc.moodle_course_id || rc.id))
                                    );
                                    return hasRegisteredCourse;
                                }) || [];

                                // Get courses for selected program
                                const selectedProgram = availablePrograms.find((p) => String(p.id) === filterProgram);
                                const coursesInProgram = selectedProgram?.courses || [];

                                // Get unique years and semesters from filtered courses
                                const uniqueYears = [...new Set(
                                    coursesInProgram
                                        .filter((c) => registeredCourses.some((rc) => String(rc.moodle_course_id || rc.id) === String(c.id)))
                                        .map((c) => extractYear(c.course_code))
                                        .filter(Boolean)
                                )].sort();

                                const uniqueSemesters = [...new Set(
                                    coursesInProgram
                                        .filter((c) => {
                                            if (!filterYear) return false;
                                            const courseYear = extractYear(c.course_code);
                                            return registeredCourses.some((rc) => String(rc.moodle_course_id || rc.id) === String(c.id)) && courseYear === filterYear;
                                        })
                                        .map((c) => extractSemester(c.course_code))
                                        .filter(Boolean)
                                )].sort();

                                // Get courses matching all filters
                                const filteredCourses = registeredCourses.filter((course) => {
                                    const courseYear = extractYear(course.course_code);
                                    const courseSemester = extractSemester(course.course_code);

                                    if (filterCategory) {
                                        const inCategory = 
                                            (selectedCategoryObj?.courses || []).some((c) => String(c.id) === String(course.moodle_course_id || course.id)) ||
                                            (selectedCategoryObj?.subcategories || []).some((sub) => 
                                                (sub.courses || []).some((c) => String(c.id) === String(course.moodle_course_id || course.id))
                                            );
                                        if (!inCategory) return false;
                                    }

                                    if (filterProgram) {
                                        const inProgram = (selectedProgram?.courses || []).some((c) => String(c.id) === String(course.moodle_course_id || course.id));
                                        if (!inProgram) return false;
                                    }

                                    if (filterYear && courseYear !== filterYear) return false;
                                    if (filterSemester && courseSemester !== filterSemester) return false;

                                    return true;
                                });

                                return (
                                    <>
                                        {/* Cascading Filter Dropdowns */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                            {/* Category */}
                                            <div>
                                                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Category
                                                </label>
                                                <select
                                                    id="category-filter"
                                                    value={filterCategory}
                                                    onChange={(e) => {
                                                        setFilterCategory(e.target.value);
                                                        setFilterProgram('');
                                                        setFilterYear('');
                                                        setFilterSemester('');
                                                    }}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select Category</option>
                                                    {availableCategories.map((category) => (
                                                        <option key={category.id} value={String(category.id)}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Program */}
                                            <div>
                                                <label htmlFor="program-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Program
                                                </label>
                                                <select
                                                    id="program-filter"
                                                    value={filterProgram}
                                                    onChange={(e) => {
                                                        setFilterProgram(e.target.value);
                                                        setFilterYear('');
                                                        setFilterSemester('');
                                                    }}
                                                    disabled={!filterCategory}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">Select Program</option>
                                                    {availablePrograms.map((program) => (
                                                        <option key={program.id} value={String(program.id)}>
                                                            {program.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Year */}
                                            <div>
                                                <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Year
                                                </label>
                                                <select
                                                    id="year-filter"
                                                    value={filterYear}
                                                    onChange={(e) => {
                                                        setFilterYear(e.target.value);
                                                        setFilterSemester('');
                                                    }}
                                                    disabled={!filterProgram}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">Select Year</option>
                                                    {uniqueYears.map((year) => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Semester */}
                                            <div>
                                                <label htmlFor="semester-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Semester
                                                </label>
                                                <select
                                                    id="semester-filter"
                                                    value={filterSemester}
                                                    onChange={(e) => setFilterSemester(e.target.value)}
                                                    disabled={!filterYear}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">Select Semester</option>
                                                    {uniqueSemesters.map((semester) => (
                                                        <option key={semester} value={semester}>
                                                            {semester}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Courses Dropdown */}
                                        <div>
                                            <label htmlFor="courses-select" className="block text-sm font-medium text-gray-700 mb-2">
                                                Courses
                                            </label>
                                            <select
                                                id="courses-select"
                                                value={selectedCourseId}
                                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select a course...</option>
                                                {(() => {
                                                    // Group courses by Year â†’ Semester
                                                    const groups = {};
                                                    filteredCourses.forEach((course) => {
                                                        const yr = extractYear(course.course_code) || 'Other';
                                                        const sem = extractSemester(course.course_code) || 'Other';
                                                        const key = `${yr}|${sem}`;
                                                        if (!groups[key]) groups[key] = { year: yr, semester: sem, courses: [] };
                                                        groups[key].courses.push(course);
                                                    });
                                                    const sortedGroups = Object.values(groups).sort((a, b) => {
                                                        const ya = parseInt(a.year.replace(/\D/g, '')) || 99;
                                                        const yb = parseInt(b.year.replace(/\D/g, '')) || 99;
                                                        if (ya !== yb) return ya - yb;
                                                        const sa = parseInt(a.semester.replace(/\D/g, '')) || 99;
                                                        const sb = parseInt(b.semester.replace(/\D/g, '')) || 99;
                                                        return sa - sb;
                                                    });
                                                    return sortedGroups.map((group) => (
                                                        <optgroup key={`${group.year}-${group.semester}`} label={`${group.year} - ${group.semester}`}>
                                                            {group.courses.map((course) => {
                                                                const blocked = isProgressionBlocked(course);
                                                                return (
                                                                    <option
                                                                        key={course.id}
                                                                        value={String(course.moodle_course_id || course.id)}
                                                                    >
                                                                        {course.course_title} ({course.course_code || `COURSE-${course.id}`})
                                                                        {blocked ? ' ðŸ”’' : ''}
                                                                    </option>
                                                                );
                                                            })}
                                                        </optgroup>
                                                    ));
                                                })()}
                                            </select>
                                        </div>
                                    </>
                                );
                            })()}
                        </>
                    )}
                </div>
            )}

            {/* Programme Overview */}
            {(selectedCourse || programmeData) && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow p-6 mb-8 text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{overviewTitle}</h2>
                        <p className="text-blue-100 mb-4">Programme Code: {overviewCode}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-blue-200">Programme Type</p>
                                <p className="font-semibold">{overviewType}</p>
                            </div>
                            <div>
                                <p className="text-blue-200">Study Mode</p>
                                <p className="font-semibold">{overviewStudyMode}</p>
                            </div>
                            <div>
                                <p className="text-blue-200">Start Date</p>
                                <p className="font-semibold">
                                    {overviewStartDate ? new Date(overviewStartDate).toLocaleDateString('en-GB') : 'TBD'}
                                </p>
                            </div>
                            <div>
                                <p className="text-blue-200">Duration</p>
                                <p className="font-semibold">{overviewDuration}</p>
                            </div>
                        </div>
                    </div>
                    <Award className="w-16 h-16 text-blue-200" />
                </div>
            </div>
            )}

            {ssoError && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                    {ssoError}
                </div>
            )}

            {(selectedCourse?.isLocked || selectedCourseBlocked) && (
                <div className="mb-6 p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm">
                    {selectedCourse?.lockReason || 'This course is locked until previous year requirements are completed.'}
                </div>
            )}

            {/* Programme Summary from Moodle */}
            {programmeData?.summary && (
                <div ref={outcomesRef} className="bg-white rounded-lg shadow p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Programme Summary</h2>
                    <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: programmeData.summary }} />
                </div>
            )}

            {/* Learning Outcomes - Fallback if no summary */}
            {!programmeData?.summary && learningOutcomes.length > 0 && (
                <div ref={outcomesRef} className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Learning Outcomes</h2>
                    <div className="space-y-3">
                        {learningOutcomes.map((outcome, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <Target className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-900">{outcome}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Programme Modules - Moodle Style */}
            {courseModules.length > 0 && (
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900">Programme Content</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {courseModules.map((module, index) => (
                            <div key={index} className="border-b border-gray-100">
                                <button
                                    onClick={() => toggleSection(index)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-gray-600 transition-transform ${expandedSections[index] ? 'rotate-180' : ''}`}>
                                            â–¼
                                        </span>
                                        <h3 className="text-base font-medium text-gray-900">{module.name}</h3>
                                    </div>
                                </button>
                                {expandedSections[index] && module.modules?.length > 0 && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <ul className="space-y-3">
                                            {module.modules.map((activity, actIndex) => (
                                                <li key={actIndex} className="flex items-center gap-3 text-sm text-gray-700">
                                                    <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                    <span>{activity.title || activity.name || 'Activity'}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Simple Access LMS Button */}
            <div className="flex gap-3 mb-8">
                <button
                    onClick={() => handleAccessLMS(selectedCourse?.moodle_course_id || selectedCourse?.id || null)}
                    disabled={ssoLoading || Boolean(selectedCourseBlocked)}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                    {ssoLoading
                        ? 'Connecting...'
                        : selectedCourseBlocked
                            ? 'Course Locked Until Previous Year Completion'
                            : selectedCourse
                                ? 'Open Selected Course in Moodle'
                                : 'Open in Moodle'}
                </button>
            </div>
        </div>
    );
};

export default StudentProgramme;

