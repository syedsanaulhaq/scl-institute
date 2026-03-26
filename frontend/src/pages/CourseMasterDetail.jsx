import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const normalizeValue = (value) => String(value || '').trim().toLowerCase();
const uniqueByName = (items = []) => {
    const seen = new Set();
    const output = [];
    for (const item of items) {
        const name = String(item?.name || '').trim();
        if (!name) continue;
        const key = normalizeValue(name);
        if (seen.has(key)) continue;
        seen.add(key);
        output.push({ id: Number(item?.id) || null, name });
    }
    return output.sort((a, b) => a.name.localeCompare(b.name));
};

// Abbreviate programme type to 3 uppercase alphabetic chars (e.g. "Degree" → "DEG")
const abbreviateProgrammeType = (name) => {
    const clean = String(name || '').replace(/[^a-zA-Z]/g, '');
    return clean.slice(0, 3).toUpperCase() || 'CRS';
};

// Extract first number from a string (e.g. "Year 1" → "1", "Semester-2" → "2")
const extractNumber = (str) => {
    const match = String(str || '').match(/\d+/);
    return match ? match[0] : '1';
};

const extractProgramCounterFromCode = (courseCode, programmeTypeAbbrev) => {
    const escaped = String(programmeTypeAbbrev || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^${escaped}-(\\d{3})-Y\\d+-S\\d+-C\\d+$`, 'i');
    const match = String(courseCode || '').trim().match(pattern);
    return match ? Number.parseInt(match[1], 10) : null;
};

const deriveHierarchyFromCourseCode = (courseCode) => {
    const raw = String(courseCode || '').trim().toUpperCase();
    const match = raw.match(/^([A-Z0-9]+)-(\d{3})-(Y\d+)-(S\d+)-C\d+$/i);
    if (!match) return null;

    const programmeType = String(match[1] || '').toUpperCase();
    const programName = `${programmeType}-${String(match[2] || '').toUpperCase()}`;
    const academicYear = `${programName}-${String(match[3] || '').toUpperCase()}`;
    const semesterName = `${academicYear}-${String(match[4] || '').toUpperCase()}`;

    return {
        programme_type_name: programmeType,
        program_name: programName,
        academic_year: academicYear,
        semester_name: semesterName
    };
};

const CourseMasterDetail = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        course_title: '',
        course_code: '',
        programme_type_name: '',
        program_name: '',
        academic_year: '',
        semester_name: '',
        awarding_body: '',
        version: '1.0'
    });
    const [saving, setSaving] = useState(false);
    const [moodleProgrammeTypes, setMoodleProgrammeTypes] = useState([]);
    const [masterCourses, setMasterCourses] = useState([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState({
        programme_type_category_id: null,
        program_category_id: null,
        year_category_id: null,
        semester_category_id: null
    });
    const [structureCourses, setStructureCourses] = useState([]);
    const [nextCourseCounter, setNextCourseCounter] = useState(1);
    const [structureDraft, setStructureDraft] = useState({
        programme_type_name: null,
        program_name: null,
        academic_year: null,
        semester_name: null,
        course_title: null,
        course_code: null
    });
    const [showCourseTitleSuggestions, setShowCourseTitleSuggestions] = useState(false);
    const [showCourseCodeSuggestions, setShowCourseCodeSuggestions] = useState(false);
    const [isCourseCodeManuallyEdited, setIsCourseCodeManuallyEdited] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'type', 'program', 'year', or 'semester'
    const [modalInput, setModalInput] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        const fetchHierarchy = async () => {
            try {
                const [hierarchyRes, masterRes] = await Promise.all([
                    axios.get(`${API_URL}/students/moodle/category-hierarchy?include_inactive=false`),
                    axios.get(`${API_URL}/accreditations/master-courses`).catch(() => ({ data: { data: [] } }))
                ]);
                setMoodleProgrammeTypes(Array.isArray(hierarchyRes.data?.data?.programme_types) ? hierarchyRes.data.data.programme_types : []);
                setMasterCourses(Array.isArray(masterRes.data?.data) ? masterRes.data.data : []);
            } catch (error) {
                console.error('Failed to load Moodle category hierarchy:', error);
                setMoodleProgrammeTypes([]);
                setMasterCourses([]);
            }
        };

        fetchHierarchy();
    }, []);

    const programmeTypeOptions = useMemo(() => uniqueByName(moodleProgrammeTypes), [moodleProgrammeTypes]);

    const selectedProgrammeType = useMemo(() => {
        const fromId = moodleProgrammeTypes.find((item) => Number(item.id) === Number(selectedCategoryIds.programme_type_category_id));
        if (fromId) return fromId;
        const byName = moodleProgrammeTypes.find((item) => normalizeValue(item.name) === normalizeValue(formData.programme_type_name));
        return byName || null;
    }, [moodleProgrammeTypes, selectedCategoryIds.programme_type_category_id, formData.programme_type_name]);

    const programOptions = useMemo(() => {
        // Only show programs belonging to the selected programme type.
        // If no type is selected/matched (e.g. brand-new type), show nothing.
        if (!formData.programme_type_name.trim()) return [];
        if (selectedProgrammeType?.programs?.length) {
            return uniqueByName(selectedProgrammeType.programs);
        }
        // Type name entered but not yet in Moodle hierarchy → no programs yet
        return [];
    }, [moodleProgrammeTypes, selectedProgrammeType, formData.programme_type_name]);

    const selectedProgram = useMemo(() => {
        const programPool = selectedProgrammeType?.programs || [];
        const fromId = programPool.find((program) => Number(program.id) === Number(selectedCategoryIds.program_category_id));
        if (fromId) return fromId;
        const byName = programPool.find((program) => normalizeValue(program.name) === normalizeValue(formData.program_name));
        return byName || null;
    }, [selectedProgrammeType, selectedCategoryIds.program_category_id, formData.program_name]);

    const yearOptions = useMemo(() => {
        // Only show years under the selected program. If program not matched, show nothing.
        if (!formData.program_name.trim()) return [];
        if (selectedProgram?.years?.length) {
            return uniqueByName(selectedProgram.years);
        }
        return [];
    }, [selectedProgram, formData.program_name]);

    const selectedYear = useMemo(() => {
        const years = selectedProgram?.years || [];
        const fromId = years.find((year) => Number(year.id) === Number(selectedCategoryIds.year_category_id));
        if (fromId) return fromId;
        const byName = years.find((year) => normalizeValue(year.name) === normalizeValue(formData.academic_year));
        return byName || null;
    }, [selectedProgram, selectedCategoryIds.year_category_id, formData.academic_year]);

    const semesterOptions = useMemo(() => {
        // Only show semesters under the selected year. If year not matched, show nothing.
        if (!formData.academic_year.trim()) return [];
        if (selectedYear?.semesters?.length) {
            return uniqueByName(selectedYear.semesters);
        }
        return [];
    }, [selectedYear, formData.academic_year]);

    // Program code segment (NNN):
    // - Use existing code for matched program under same programme type.
    // - Otherwise use max existing + 1 for that programme type.
    // - If none exists, start at 001.
    const programIndexStr = useMemo(() => {
        const typeAbbrev = abbreviateProgrammeType(formData.programme_type_name);
        const currentProgramName = normalizeValue(formData.program_name);

        const countersForType = masterCourses
            .map((course) => extractProgramCounterFromCode(course?.course_code, typeAbbrev))
            .filter((value) => Number.isInteger(value) && value > 0);

        const existingForProgram = masterCourses
            .filter((course) => normalizeValue(course?.program_name) === currentProgramName)
            .map((course) => extractProgramCounterFromCode(course?.course_code, typeAbbrev))
            .find((value) => Number.isInteger(value) && value > 0);

        if (existingForProgram) {
            return String(existingForProgram).padStart(3, '0');
        }

        const maxCounter = countersForType.length ? Math.max(...countersForType) : 0;
        const nextCounter = maxCounter + 1;
        return String(nextCounter > 0 ? nextCounter : 1).padStart(3, '0');
    }, [masterCourses, formData.programme_type_name, formData.program_name]);

    const buildGeneratedCourseCode = (counter = 1) => {
        const typeAbbrev = abbreviateProgrammeType(formData.programme_type_name);
        const yearNum = extractNumber(formData.academic_year);
        const semNum = extractNumber(formData.semester_name);
        return `${typeAbbrev}-${programIndexStr}-Y${yearNum}-S${semNum}-C${counter}`;
    };

    const getDisplayedStructureValue = (field, committedValue) => (
        structureDraft[field] !== null ? structureDraft[field] : committedValue
    );

    const suggestionCourses = useMemo(() => structureCourses, [structureCourses]);

    const courseTitleOptions = useMemo(() => uniqueByName(
        suggestionCourses.map((course) => ({ id: course.id, name: course.course_title }))
    ), [suggestionCourses]);

    const courseCodeOptions = useMemo(() => uniqueByName(
        suggestionCourses.map((course) => ({ id: course.id, name: course.course_code }))
    ), [suggestionCourses]);

    const filteredCourseTitleOptions = useMemo(() => {
        const query = normalizeValue(getDisplayedStructureValue('course_title', formData.course_title));
        if (!query) return courseTitleOptions;
        return courseTitleOptions.filter((option) => normalizeValue(option.name).includes(query));
    }, [courseTitleOptions, structureDraft.course_title, formData.course_title]);

    const filteredCourseCodeOptions = useMemo(() => {
        const query = normalizeValue(getDisplayedStructureValue('course_code', formData.course_code));
        if (!query) return courseCodeOptions;
        return courseCodeOptions.filter((option) => normalizeValue(option.name).includes(query));
    }, [courseCodeOptions, structureDraft.course_code, formData.course_code]);

    const selectedExistingCourse = useMemo(() => {
        const titleValue = String(formData.course_title || '').trim();
        if (titleValue) {
            // When title is typed, treat title as the source of truth so stale codes don't lock selection.
            return suggestionCourses.find((course) => normalizeValue(course.course_title) === normalizeValue(titleValue)) || null;
        }

        const codeValue = String(formData.course_code || '').trim();
        if (codeValue) {
            return suggestionCourses.find((course) => normalizeValue(course.course_code) === normalizeValue(codeValue)) || null;
        }

        return null;
    }, [suggestionCourses, formData.course_title, formData.course_code]);

    useEffect(() => {
        const { programme_type_name, program_name, academic_year, semester_name } = formData;
        if (!programme_type_name.trim() || !program_name.trim() || !academic_year.trim() || !semester_name.trim()) {
            setStructureCourses([]);
            setNextCourseCounter(1);
            setIsCourseCodeManuallyEdited(false);
            return;
        }

        const codePrefix = `${abbreviateProgrammeType(programme_type_name)}-${programIndexStr}-Y${extractNumber(academic_year)}-S${extractNumber(semester_name)}-C`;

        Promise.all([
            axios.get(`${API_URL}/students/moodle/courses-by-structure`, {
                params: {
                    programme_type_name,
                    program_name,
                    academic_year,
                    semester_name,
                    programme_type_category_id: selectedCategoryIds.programme_type_category_id,
                    program_category_id: selectedCategoryIds.program_category_id,
                    year_category_id: selectedCategoryIds.year_category_id,
                    semester_category_id: selectedCategoryIds.semester_category_id
                }
            }).catch(() => ({ data: { data: { courses: [] } } })),
            axios.get(`${API_URL}/accreditations/next-course-counter`, {
                params: { programme_type_name, program_name, academic_year, semester_name, code_prefix: codePrefix }
            }).catch(() => ({ data: { counter: 1 } }))
        ])
            .then(([coursesRes, counterRes]) => {
                const courses = Array.isArray(coursesRes.data?.data?.courses) ? coursesRes.data.data.courses : [];
                const prefixUpper = String(codePrefix || '').toUpperCase();
                const moodleMaxCounter = courses.reduce((max, course) => {
                    const code = String(course?.course_code || '').trim();
                    if (!code) return max;
                    if (prefixUpper && !code.toUpperCase().startsWith(prefixUpper)) return max;

                    const suffix = prefixUpper ? code.slice(prefixUpper.length) : '';
                    const parsed = Number.parseInt(suffix, 10);
                    if (!Number.isInteger(parsed) || parsed <= 0) return max;
                    return Math.max(max, parsed);
                }, 0);

                const apiNextCounter = Number(counterRes.data?.counter) || 1;
                const moodleNextCounter = moodleMaxCounter > 0 ? moodleMaxCounter + 1 : 1;
                const nextCounter = Math.max(apiNextCounter, moodleNextCounter);
                setStructureCourses(courses);
                setNextCourseCounter(nextCounter);
            })
            .catch(() => {
                setStructureCourses([]);
                setNextCourseCounter(1);
            });
    }, [
        formData.programme_type_name,
        formData.program_name,
        formData.academic_year,
        formData.semester_name,
        selectedCategoryIds.programme_type_category_id,
        selectedCategoryIds.program_category_id,
        selectedCategoryIds.year_category_id,
        selectedCategoryIds.semester_category_id,
        programIndexStr
    ]);

    // Auto-generate course code when all 4 structure levels are filled
    useEffect(() => {
        const { programme_type_name, program_name, academic_year, semester_name } = formData;
        if (!programme_type_name.trim() || !program_name.trim() || !academic_year.trim() || !semester_name.trim()) return;
        if (isCourseCodeManuallyEdited) return;

        if (selectedExistingCourse?.course_code) {
            setFormData((prev) => {
                if (prev.course_code === String(selectedExistingCourse.course_code)) return prev;
                return { ...prev, course_code: String(selectedExistingCourse.course_code) };
            });
            return;
        }

        const generated = buildGeneratedCourseCode(nextCourseCounter);
        setFormData((prev) => {
            if (prev.course_code === generated) return prev;
            return { ...prev, course_code: generated };
        });
    }, [formData.programme_type_name, formData.program_name, formData.academic_year, formData.semester_name, formData.course_title, nextCourseCounter, selectedExistingCourse, programIndexStr, isCourseCodeManuallyEdited]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const openFreshSearch = (field, options, committedValue) => {
        const current = String(committedValue || '').trim();
        if (!current) return;

        const exactMatch = (options || []).some((option) => normalizeValue(option?.name) === normalizeValue(current));
        if (!exactMatch) return;

        setStructureDraft((prev) => ({ ...prev, [field]: '' }));
    };

    const commitStructureInput = (field, value, commitHandler) => {
        setStructureDraft((prev) => ({ ...prev, [field]: null }));
        commitHandler(value);
    };

    const clearStructureDraft = (field) => {
        setStructureDraft((prev) => {
            if (prev[field] === null) return prev;
            return { ...prev, [field]: null };
        });
    };

    const handleCourseTitleInput = (value) => {
        const matchedCourse = suggestionCourses.find((course) => normalizeValue(course.course_title) === normalizeValue(value));
        setFormData((prev) => ({
            ...prev,
            course_title: value,
            course_code: matchedCourse?.course_code ? String(matchedCourse.course_code) : prev.course_code
        }));

        // Typing a new title should resume structure-based auto code generation.
        setIsCourseCodeManuallyEdited(false);

        if (matchedCourse?.course_code) {
            setIsCourseCodeManuallyEdited(false);
        }
    };

    const handleCourseCodeInput = (value) => {
        const matchedCourse = suggestionCourses.find((course) => normalizeValue(course.course_code) === normalizeValue(value));
        setFormData((prev) => ({
            ...prev,
            course_code: value,
            course_title: matchedCourse?.course_title ? String(matchedCourse.course_title) : prev.course_title
        }));
        setIsCourseCodeManuallyEdited(!matchedCourse);
    };

    const selectCourseTitleOption = (value) => {
        handleCourseTitleInput(value);
        setIsCourseCodeManuallyEdited(false);
        setShowCourseTitleSuggestions(false);
    };

    const selectCourseCodeOption = (value) => {
        handleCourseCodeInput(value);
        setIsCourseCodeManuallyEdited(false);
        setShowCourseCodeSuggestions(false);
    };

    const handleProgrammeTypeInput = (value) => {
        setIsCourseCodeManuallyEdited(false);
        const matchedType = moodleProgrammeTypes.find((item) => normalizeValue(item.name) === normalizeValue(value));
        setFormData((prev) => ({
            ...prev,
            programme_type_name: value,
            program_name: '',
            academic_year: '',
            semester_name: ''
        }));
        setSelectedCategoryIds((prev) => ({
            ...prev,
            programme_type_category_id: matchedType ? Number(matchedType.id) : null,
            program_category_id: null,
            year_category_id: null,
            semester_category_id: null
        }));
    };

    const handleProgramInput = (value) => {
        setIsCourseCodeManuallyEdited(false);
        const programPool = selectedProgrammeType?.programs?.length
            ? selectedProgrammeType.programs
            : moodleProgrammeTypes.flatMap((item) => item.programs || []);
        const matchedProgram = programPool.find((program) => normalizeValue(program.name) === normalizeValue(value));
        setFormData((prev) => ({
            ...prev,
            program_name: value,
            academic_year: '',
            semester_name: ''
        }));
        setSelectedCategoryIds((prev) => ({
            ...prev,
            program_category_id: matchedProgram ? Number(matchedProgram.id) : null,
            year_category_id: null,
            semester_category_id: null
        }));
    };

    const handleYearInput = (value) => {
        setIsCourseCodeManuallyEdited(false);
        const yearPool = selectedProgram?.years?.length
            ? selectedProgram.years
            : moodleProgrammeTypes.flatMap((item) => (item.programs || []).flatMap((program) => program.years || []));
        const matchedYear = yearPool.find((year) => normalizeValue(year.name) === normalizeValue(value));
        setFormData((prev) => ({
            ...prev,
            academic_year: value,
            semester_name: ''
        }));
        setSelectedCategoryIds((prev) => ({
            ...prev,
            year_category_id: matchedYear ? Number(matchedYear.id) : null,
            semester_category_id: null
        }));
    };

    const handleSemesterInput = (value) => {
        setIsCourseCodeManuallyEdited(false);
        const semesterPool = selectedYear?.semesters?.length
            ? selectedYear.semesters
            : moodleProgrammeTypes.flatMap((item) => (item.programs || []).flatMap((program) => (program.years || []).flatMap((year) => year.semesters || [])));
        const matchedSemester = semesterPool.find((semester) => normalizeValue(semester.name) === normalizeValue(value));
        setFormData((prev) => ({ ...prev, semester_name: value }));
        setSelectedCategoryIds((prev) => ({
            ...prev,
            semester_category_id: matchedSemester ? Number(matchedSemester.id) : null
        }));
    };

    const fillTestData = () => {
        setFormData({
            course_title: 'BSc Business Management',
            course_code: 'BSC-BM-101',
            programme_type_name: 'Degree',
            program_name: 'Business Management',
            academic_year: 'Year 1',
            semester_name: 'Semester 1',
            awarding_body: 'University of London',
            version: '1.0'
        });
        setSelectedCategoryIds({
            programme_type_category_id: null,
            program_category_id: null,
            year_category_id: null,
            semester_category_id: null
        });
    };

    const handleAddCategory = async () => {
        const trimmedInput = modalInput.trim();
        if (!trimmedInput) {
            alert('Please enter a category name');
            return;
        }

        setModalLoading(true);
        try {
            const levelMap = { type: 'programme_type', program: 'program', year: 'year', semester: 'semester' };

            // Determine parent IDs for local record
            let parentLocalId = null;
            let parentMoodleId = null;
            const resolveParent = (categoryId) => {
                if (!categoryId) return;
                if (categoryId < 0) parentLocalId = Math.abs(categoryId);
                else parentMoodleId = categoryId;
            };
            if (modalType === 'program') {
                if (!selectedCategoryIds.programme_type_category_id) throw new Error('Programme Type must be selected first');
                resolveParent(selectedCategoryIds.programme_type_category_id);
            } else if (modalType === 'year') {
                if (!selectedCategoryIds.program_category_id) throw new Error('Program must be selected first');
                resolveParent(selectedCategoryIds.program_category_id);
            } else if (modalType === 'semester') {
                if (!selectedCategoryIds.year_category_id) throw new Error('Year must be selected first');
                resolveParent(selectedCategoryIds.year_category_id);
            }

            // Step 1: Create in Moodle now (with full parent chain)
            let moodleIds = {};
            let moodleSuccess = false;
            try {
                // Compute the explicit hierarchy code for this category level so the
                // backend always stores the correct idnumber (e.g. ART, ART-001, ART-001-Y1).
                const typeAbbrev = abbreviateProgrammeType(
                    modalType === 'type' ? trimmedInput : formData.programme_type_name
                );
                let explicitCode = '';
                if (modalType === 'type') {
                    explicitCode = typeAbbrev;
                } else if (modalType === 'program') {
                    explicitCode = `${typeAbbrev}-${programIndexStr}`;
                } else if (modalType === 'year') {
                    explicitCode = `${typeAbbrev}-${programIndexStr}-Y${extractNumber(trimmedInput)}`;
                } else if (modalType === 'semester') {
                    explicitCode = `${typeAbbrev}-${programIndexStr}-Y${extractNumber(formData.academic_year)}-S${extractNumber(trimmedInput)}`;
                }

                const moodlePayload = { name: trimmedInput, level: levelMap[modalType], explicit_code: explicitCode };
                if (modalType === 'program' && Number(selectedCategoryIds.programme_type_category_id) > 0) {
                    moodlePayload.parent_category_id = Number(selectedCategoryIds.programme_type_category_id);
                }
                if (modalType === 'year' && Number(selectedCategoryIds.program_category_id) > 0) {
                    moodlePayload.parent_category_id = Number(selectedCategoryIds.program_category_id);
                }
                if (modalType === 'semester' && Number(selectedCategoryIds.year_category_id) > 0) {
                    moodlePayload.parent_category_id = Number(selectedCategoryIds.year_category_id);
                }
                moodlePayload.course_code = formData.course_code;
                if (modalType === 'program' || modalType === 'year' || modalType === 'semester') {
                    moodlePayload.programme_type_name = formData.programme_type_name;
                }
                if (modalType === 'year' || modalType === 'semester') {
                    moodlePayload.program_name = formData.program_name;
                }
                if (modalType === 'semester') {
                    moodlePayload.academic_year = formData.academic_year;
                }

                const moodleRes = await axios.post(`${API_URL}/students/moodle/create-level-category`, moodlePayload);
                if (moodleRes.data?.success) {
                    moodleIds = moodleRes.data.data || {};
                    moodleSuccess = true;
                    // If Moodle succeeded, parent IDs should be real Moodle IDs now
                    parentMoodleId = moodleIds[`${levelMap[modalType]}_category_id`] || moodleIds[Object.keys(moodleIds).find(k => k.includes(levelMap[modalType]))];
                    parentLocalId = null;
                }
            } catch (moodleErr) {
                console.warn('[handleAddCategory] Moodle not reachable, saving locally only:', moodleErr.message);
            }

            // Step 2: Save to SCL DB (with real Moodle ID if we got one)
            const newCategoryMoodleId = moodleSuccess ? (
                modalType === 'type' ? moodleIds.programme_type_category_id :
                modalType === 'program' ? moodleIds.program_category_id :
                modalType === 'year' ? moodleIds.year_category_id :
                moodleIds.semester_category_id
            ) : null;

            const response = await axios.post(`${API_URL}/accreditations/local-categories`, {
                name: trimmedInput,
                level: levelMap[modalType],
                parent_local_id: parentLocalId,
                parent_moodle_id: moodleSuccess ? (parentMoodleId || null) : parentMoodleId,
                moodle_category_id: newCategoryMoodleId
            });

            if (!response.data?.success) throw new Error(response.data?.message || 'Failed to save category');

            const localId = response.data.data?.id; // negative number

            // Step 3: Refresh hierarchy
            const hierarchyRes = await axios.get(`${API_URL}/students/moodle/category-hierarchy?include_inactive=false`);
            setMoodleProgrammeTypes(Array.isArray(hierarchyRes.data?.data?.programme_types) ? hierarchyRes.data.data.programme_types : []);

            // Step 4: Set selected IDs — use real Moodle IDs if available, else local negative ID
            if (moodleSuccess) {
                // Update ALL levels with real Moodle IDs
                switch (modalType) {
                    case 'type':
                        handleProgrammeTypeInput(trimmedInput);
                        setSelectedCategoryIds({
                            programme_type_category_id: moodleIds.programme_type_category_id,
                            program_category_id: null, year_category_id: null, semester_category_id: null
                        });
                        break;
                    case 'program':
                        handleProgramInput(trimmedInput);
                        setSelectedCategoryIds(prev => ({
                            ...prev,
                            programme_type_category_id: moodleIds.programme_type_category_id || prev.programme_type_category_id,
                            program_category_id: moodleIds.program_category_id,
                            year_category_id: null, semester_category_id: null
                        }));
                        break;
                    case 'year':
                        handleYearInput(trimmedInput);
                        setSelectedCategoryIds(prev => ({
                            ...prev,
                            programme_type_category_id: moodleIds.programme_type_category_id || prev.programme_type_category_id,
                            program_category_id: moodleIds.program_category_id || prev.program_category_id,
                            year_category_id: moodleIds.year_category_id,
                            semester_category_id: null
                        }));
                        break;
                    case 'semester':
                        handleSemesterInput(trimmedInput);
                        setSelectedCategoryIds(prev => ({
                            ...prev,
                            programme_type_category_id: moodleIds.programme_type_category_id || prev.programme_type_category_id,
                            program_category_id: moodleIds.program_category_id || prev.program_category_id,
                            year_category_id: moodleIds.year_category_id || prev.year_category_id,
                            semester_category_id: moodleIds.semester_category_id
                        }));
                        break;
                }
            } else {
                // Moodle offline — use local negative IDs
                switch (modalType) {
                    case 'type':
                        handleProgrammeTypeInput(trimmedInput);
                        setSelectedCategoryIds({ programme_type_category_id: localId, program_category_id: null, year_category_id: null, semester_category_id: null });
                        break;
                    case 'program':
                        handleProgramInput(trimmedInput);
                        setSelectedCategoryIds(prev => ({ ...prev, program_category_id: localId, year_category_id: null, semester_category_id: null }));
                        break;
                    case 'year':
                        handleYearInput(trimmedInput);
                        setSelectedCategoryIds(prev => ({ ...prev, year_category_id: localId, semester_category_id: null }));
                        break;
                    case 'semester':
                        handleSemesterInput(trimmedInput);
                        setSelectedCategoryIds(prev => ({ ...prev, semester_category_id: localId }));
                        break;
                }
            }

            setModalOpen(false);
            setModalInput('');
            setModalType(null);
        } catch (error) {
            console.error('Error creating category:', error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setModalLoading(false);
        }
    };

    const handleSave = async () => {
        const hierarchyFromCode = deriveHierarchyFromCourseCode(formData.course_code);
        const hasExplicitStructure = Boolean(
            formData.programme_type_name?.trim() &&
            formData.program_name?.trim() &&
            formData.academic_year?.trim() &&
            formData.semester_name?.trim()
        );

        const effectiveStructure = hasExplicitStructure
            ? {
                programme_type_name: formData.programme_type_name,
                program_name: formData.program_name,
                academic_year: formData.academic_year,
                semester_name: formData.semester_name
            }
            : (hierarchyFromCode || {
                programme_type_name: formData.programme_type_name,
                program_name: formData.program_name,
                academic_year: formData.academic_year,
                semester_name: formData.semester_name
            });

        if (!formData.course_title.trim()) {
            alert('Course title is required');
            return;
        }

        if (!effectiveStructure.programme_type_name.trim() || !effectiveStructure.program_name.trim() || !effectiveStructure.academic_year.trim() || !effectiveStructure.semester_name.trim()) {
            alert('Programme Type, Program, Year, and Semester are required');
            return;
        }

        const pathPreview = `${effectiveStructure.programme_type_name} > ${effectiveStructure.program_name} > ${effectiveStructure.academic_year} > ${effectiveStructure.semester_name}`;
        const confirmSave = window.confirm(
            `Moodle path:\n${pathPreview}\n\nCourse:\n${formData.course_title} (${formData.course_code})\n\nContinue save and sync?`
        );
        if (!confirmSave) {
            return;
        }

        try {
            setSaving(true);

            const syncPayload = {
                ...formData,
                ...effectiveStructure,
                ...selectedCategoryIds
            };

            const syncRes = await axios.post(`${API_URL}/students/moodle/sync-master-course`, syncPayload);
            if (!syncRes.data?.success) {
                throw new Error(syncRes.data?.message || 'Failed to sync course to Moodle');
            }

            const resolvedCategoryIds = {
                programme_type_category_id: syncRes.data?.data?.resolved_category_ids?.programme_type_category_id || null,
                program_category_id: syncRes.data?.data?.resolved_category_ids?.program_category_id || null,
                year_category_id: syncRes.data?.data?.resolved_category_ids?.year_category_id || null,
                semester_category_id: syncRes.data?.data?.resolved_category_ids?.semester_category_id || null
            };

            setSelectedCategoryIds(resolvedCategoryIds);

            const payload = {
                ...formData,
                ...effectiveStructure,
                ...resolvedCategoryIds
            };

            await axios.post(`${API_URL}/accreditations/master-courses`, payload);

            alert('Course and Moodle categories saved successfully');
            navigate('/course-lifecycle');
        } catch (error) {
            console.error('Failed to save course master:', error);
            const backendMessage = error.response?.data?.message;
            const backendDetail = error.response?.data?.error;
            const composed = [backendMessage, backendDetail].filter(Boolean).join(' - ');
            alert(`Failed to save: ${composed || error.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate('/course-lifecycle')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Lifecycle
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">New Course</h1>
                    <p className="text-sm text-gray-600">Use Moodle category hierarchy: Programme Type {'>'} Program {'>'} Year {'>'} Semester {'>'} Course. Type to search, or type a brand new value.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-4">
                        <p className="text-sm font-semibold text-gray-800">Structure: Programme Type {'>'} Program {'>'} Year {'>'} Semester</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-semibold text-gray-700">Programme Type</label>
                                <button
                                    type="button"
                                    onClick={() => { setModalOpen(true); setModalType('type'); setModalInput(formData.programme_type_name.trim()); }}
                                    className="w-6 h-6 bg-scl-purple text-white rounded-full hover:bg-scl-purple/80 flex items-center justify-center text-sm font-bold leading-none"
                                    title="Add new Programme Type"
                                >+</button>
                            </div>
                            <input
                                list="programme-type-options"
                                value={getDisplayedStructureValue('programme_type_name', formData.programme_type_name)}
                                onMouseDown={() => openFreshSearch('programme_type_name', programmeTypeOptions, formData.programme_type_name)}
                                onFocus={() => openFreshSearch('programme_type_name', programmeTypeOptions, formData.programme_type_name)}
                                onBlur={() => clearStructureDraft('programme_type_name')}
                                onChange={(e) => commitStructureInput('programme_type_name', e.target.value, handleProgrammeTypeInput)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                placeholder="Search type or type new"
                            />
                            <datalist id="programme-type-options">
                                {programmeTypeOptions.map((option) => (
                                    <option key={option.id || option.name} value={option.name} />
                                ))}
                            </datalist>
                            {formData.programme_type_name.trim() && !selectedProgrammeType && (
                                <p className="text-xs text-amber-600 mt-1">&#34;{formData.programme_type_name}&#34; not in Moodle yet — click <strong>+</strong> to create it.</p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-semibold text-gray-700">Program</label>
                                <button
                                    type="button"
                                    onClick={() => { setModalOpen(true); setModalType('program'); setModalInput(formData.program_name.trim()); }}
                                    disabled={!formData.programme_type_name.trim()}
                                    className="w-6 h-6 bg-scl-purple text-white rounded-full hover:bg-scl-purple/80 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold leading-none"
                                    title="Add new Program"
                                >+</button>
                            </div>
                            <input
                                list="program-options"
                                value={getDisplayedStructureValue('program_name', formData.program_name)}
                                onMouseDown={() => openFreshSearch('program_name', programOptions, formData.program_name)}
                                onFocus={() => openFreshSearch('program_name', programOptions, formData.program_name)}
                                onBlur={() => clearStructureDraft('program_name')}
                                onChange={(e) => commitStructureInput('program_name', e.target.value, handleProgramInput)}
                                disabled={!formData.programme_type_name.trim()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                placeholder={formData.programme_type_name.trim() ? 'Search program or type new' : 'Select or type Programme Type first'}
                            />
                            <datalist id="program-options">
                                {programOptions.map((option) => (
                                    <option key={option.id || option.name} value={option.name} />
                                ))}
                            </datalist>
                            {formData.programme_type_name.trim() && formData.program_name.trim() && !selectedProgram && (
                                <p className="text-xs text-amber-600 mt-1">&#34;{formData.program_name}&#34; not in Moodle yet — click <strong>+</strong> to create it.</p>
                            )}
                            {!formData.programme_type_name.trim() && (
                                <p className="text-xs text-gray-500 mt-1">Choose Programme Type first to unlock Program.</p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-semibold text-gray-700">Year</label>
                                <button
                                    type="button"
                                    onClick={() => { setModalOpen(true); setModalType('year'); setModalInput(formData.academic_year.trim()); }}
                                    disabled={!formData.program_name.trim()}
                                    className="w-6 h-6 bg-scl-purple text-white rounded-full hover:bg-scl-purple/80 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold leading-none"
                                    title="Add new Year"
                                >+</button>
                            </div>
                            <input
                                list="year-options"
                                value={getDisplayedStructureValue('academic_year', formData.academic_year)}
                                onMouseDown={() => openFreshSearch('academic_year', yearOptions, formData.academic_year)}
                                onFocus={() => openFreshSearch('academic_year', yearOptions, formData.academic_year)}
                                onBlur={() => clearStructureDraft('academic_year')}
                                onChange={(e) => commitStructureInput('academic_year', e.target.value, handleYearInput)}
                                disabled={!formData.program_name.trim()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                placeholder={formData.program_name.trim() ? 'Search year or type new' : 'Select or type Program first'}
                            />
                            <datalist id="year-options">
                                {yearOptions.map((option) => (
                                    <option key={option.id || option.name} value={option.name} />
                                ))}
                            </datalist>
                            {formData.program_name.trim() && formData.academic_year.trim() && !selectedYear && (
                                <p className="text-xs text-amber-600 mt-1">&#34;{formData.academic_year}&#34; not in Moodle yet — click <strong>+</strong> to create it.</p>
                            )}
                            {!formData.program_name.trim() && (
                                <p className="text-xs text-gray-500 mt-1">Choose Program first to unlock Year.</p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-semibold text-gray-700">Semester</label>
                                <button
                                    type="button"
                                    onClick={() => { setModalOpen(true); setModalType('semester'); setModalInput(formData.semester_name.trim()); }}
                                    disabled={!formData.academic_year.trim()}
                                    className="w-6 h-6 bg-scl-purple text-white rounded-full hover:bg-scl-purple/80 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold leading-none"
                                    title="Add new Semester"
                                >+</button>
                            </div>
                            <input
                                list="semester-options"
                                value={getDisplayedStructureValue('semester_name', formData.semester_name)}
                                onMouseDown={() => openFreshSearch('semester_name', semesterOptions, formData.semester_name)}
                                onFocus={() => openFreshSearch('semester_name', semesterOptions, formData.semester_name)}
                                onBlur={() => clearStructureDraft('semester_name')}
                                onChange={(e) => commitStructureInput('semester_name', e.target.value, handleSemesterInput)}
                                disabled={!formData.academic_year.trim()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                placeholder={formData.academic_year.trim() ? 'Search semester or type new' : 'Select or type Year first'}
                            />
                            <datalist id="semester-options">
                                {semesterOptions.map((option) => (
                                    <option key={option.id || option.name} value={option.name} />
                                ))}
                            </datalist>
                            {formData.academic_year.trim() && formData.semester_name.trim() && !semesterOptions.some(o => normalizeValue(o.name) === normalizeValue(formData.semester_name)) && (
                                <p className="text-xs text-amber-600 mt-1">&#34;{formData.semester_name}&#34; not in Moodle yet — click <strong>+</strong> to create it.</p>
                            )}
                            {!formData.academic_year.trim() && (
                                <p className="text-xs text-gray-500 mt-1">Choose Year first to unlock Semester.</p>
                            )}
                        </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Title *</label>
                            <div className="relative">
                            <input
                                type="text"
                                value={formData.course_title}
                                onChange={(e) => handleCourseTitleInput(e.target.value)}
                                onFocus={() => {
                                    setShowCourseTitleSuggestions(true);
                                }}
                                onBlur={() => {
                                    setTimeout(() => setShowCourseTitleSuggestions(false), 120);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                placeholder="Search existing course (any character) or type new"
                            />
                            {showCourseTitleSuggestions && filteredCourseTitleOptions.length > 0 && (
                                <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                    {filteredCourseTitleOptions.slice(0, 50).map((option) => (
                                        <button
                                            key={option.id || option.name}
                                            type="button"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                selectCourseTitleOption(option.name);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                        >
                                            {option.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Select an existing course title to load its code, or type a new one to auto-generate the next code (C1, C2, C3...).</p>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Code</label>
                            <div className="relative">
                            <input
                                type="text"
                                value={formData.course_code}
                                onChange={(e) => handleCourseCodeInput(e.target.value)}
                                onFocus={() => {
                                    setShowCourseCodeSuggestions(true);
                                }}
                                onBlur={() => {
                                    setTimeout(() => setShowCourseCodeSuggestions(false), 120);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                placeholder="Auto-generated from structure (e.g. DEG-001-Y1-S1-C1)"
                            />
                            {showCourseCodeSuggestions && filteredCourseCodeOptions.length > 0 && (
                                <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                    {filteredCourseCodeOptions.slice(0, 50).map((option) => (
                                        <button
                                            key={option.id || option.name}
                                            type="button"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                selectCourseCodeOption(option.name);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                        >
                                            {option.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Auto-filled from structure. You can override manually.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Awarding Body</label>
                        <input
                            type="text"
                            value={formData.awarding_body}
                            onChange={(e) => handleChange('awarding_body', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            placeholder="Enter awarding body"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Version</label>
                        <input
                            type="text"
                            value={formData.version}
                            onChange={(e) => handleChange('version', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            placeholder="e.g., 1.0"
                        />
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 mt-6 flex items-center justify-end gap-3">
                    <button onClick={fillTestData} type="button" className="px-4 py-2 border border-purple-200 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-semibold">
                        Fill Test Data
                    </button>
                    <button onClick={() => navigate('/course-lifecycle')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-scl-purple text-white rounded-lg hover:bg-scl-purple/90 font-semibold disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Common Data'}
                    </button>
                </div>
            </div>

            {/* Modal for adding new category */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">
                            Add New {modalType === 'type' ? 'Programme Type' : modalType === 'program' ? 'Program' : modalType === 'year' ? 'Year' : 'Semester'}
                        </h2>
                        <p className="text-xs text-gray-500 mb-4">Saved to SCL first — will be created in Moodle on next sync.</p>
                        <input
                            type="text"
                            value={modalInput}
                            onChange={(e) => setModalInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddCategory();
                            }}
                            autoFocus
                            placeholder={`Enter ${modalType === 'type' ? 'programme type' : modalType === 'program' ? 'program' : modalType === 'year' ? 'year' : 'semester'} name`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent mb-4"
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setModalOpen(false);
                                    setModalInput('');
                                    setModalType(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                disabled={modalLoading || !modalInput.trim()}
                                className="px-4 py-2 bg-scl-purple text-white rounded-lg hover:bg-scl-purple/90 disabled:opacity-50"
                            >
                                {modalLoading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseMasterDetail;
