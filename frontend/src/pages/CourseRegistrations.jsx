import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock3, CircleDashed, Loader2, RefreshCw, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import CohortFormModal from './CohortFormModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const STATUS_COLORS = {
    approved: 'bg-green-100 text-green-800',
    completed: 'bg-emerald-100 text-emerald-800',
    in_progress: 'bg-amber-100 text-amber-800',
    not_started: 'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-800',
    pending: 'bg-amber-100 text-amber-800',
    synced: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
};

const badge = (label, colorKey) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[colorKey] || STATUS_COLORS.not_started}`}>
        {label}
    </span>
);

const normalizeValue = (value) => String(value || '').trim().toLowerCase();
const buildCourseKey = (course) => normalizeValue(course?.course_code) || normalizeValue(course?.course_title);

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

function deriveProgramName(course) {
    const explicit = String(course?.program_name || '').trim();
    if (explicit) return explicit;

    const courseCode = String(course?.course_code || '').trim();
    if (courseCode.includes('-')) {
        return courseCode.split('-')[0];
    }

    return String(course?.course_title || 'General Programme').trim() || 'General Programme';
}

function getFullProgramName(programCode, moodleProgrammeTypes) {
    if (!programCode || !moodleProgrammeTypes?.length) return programCode;
    
    // Search through the hierarchy to find the matching program
    for (const progType of moodleProgrammeTypes) {
        if (progType.programs?.length) {
            const foundProgram = progType.programs.find(p => 
                String(p.name || '').startsWith(programCode) || 
                String(p.idnumber || '').startsWith(programCode)
            );
            if (foundProgram) {
                return foundProgram.name;
            }
        }
    }
    
    return programCode;
}

function deriveProgrammeTypeName(course) {
    return String(course?.programme_type_name || '').trim() || '';
}

function deriveAcademicYear(course) {
    return String(course?.academic_year || '').trim() || '';
}

function deriveSemesterName(course) {
    return String(course?.semester_name || '').trim() || '';
}

function buildInitialFormData(acc, structure) {
    return {
        intake_id: '',
        course_title: acc?.course_title || '',
        course_code: acc?.course_code || '',
        programme_type_name: structure.programme_type_name || '',
        program_name: structure.program_name || '',
        academic_year: structure.academic_year || '',
        semester_name: structure.semester_name || '',
        cohort_label: '',
        programme_type_category_id: structure.programme_type_category_id,
        program_category_id: structure.program_category_id,
        year_category_id: structure.year_category_id,
        semester_category_id: structure.semester_category_id,
        course_type: acc?.course_type || acc?.programme_type_name || '',
        awarding_body_accreditation: acc?.awarding_body || '',
        regulation_level: acc?.qualification_level || '',
        mode_of_delivery: acc?.mode_of_delivery || '',
        start_date: '',
        end_date_or_duration: '',
        subject_area_discipline: acc?.subject_area_discipline || '',
        course_description: acc?.course_description || '',
        learning_outcomes: acc?.learning_outcomes || '',
        units_modules_covered: acc?.units_modules_covered || '',
        assessment_methods: '',
        entry_requirements: '',
        tuition_fee_gbp: '',
        additional_costs: '',
        funding_options: '',
        learning_resources_provided: '',
        special_equipment_needed: '',
        work_placement_included: '',
        course_leader_programme_director: '',
        internal_verification_contact: '',
        ukvi_approved_course: '',
        approval_date: '',
        review_date: '',
        special_admission_considerations: '',
        progression_opportunities: '',
        industry_partnerships: '',
        application_status: 'submitted'
    };
}

const REGISTRATION_FORM_FIELDS = [
    'course_title',
    'course_code',
    'programme_type_name',
    'program_name',
    'academic_year',
    'semester_name',
    'cohort_label',
    'programme_type_category_id',
    'program_category_id',
    'year_category_id',
    'semester_category_id',
    'course_type',
    'awarding_body_accreditation',
    'regulation_level',
    'mode_of_delivery',
    'start_date',
    'end_date_or_duration',
    'subject_area_discipline',
    'course_description',
    'learning_outcomes',
    'units_modules_covered',
    'assessment_methods',
    'entry_requirements',
    'tuition_fee_gbp',
    'additional_costs',
    'funding_options',
    'learning_resources_provided',
    'special_equipment_needed',
    'work_placement_included',
    'course_leader_programme_director',
    'internal_verification_contact',
    'ukvi_approved_course',
    'approval_date',
    'review_date',
    'special_admission_considerations',
    'progression_opportunities',
    'industry_partnerships',
    'application_status'
];

const normalizeDateForInput = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const datePart = raw.includes('T') ? raw.split('T')[0] : raw;
    return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : '';
};

const mapRegistrationToForm = (registration) => {
    const mapped = {};
    for (const field of REGISTRATION_FORM_FIELDS) {
        if (registration?.[field] === undefined || registration?.[field] === null) {
            mapped[field] = '';
            continue;
        }

        if (field === 'start_date' || field === 'approval_date' || field === 'review_date') {
            mapped[field] = normalizeDateForInput(registration[field]);
            continue;
        }

        mapped[field] = registration[field];
    }
    return mapped;
};

const CourseRegistrations = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = useMemo(() => new URLSearchParams(location.search || ''), [location.search]);
    const isFormOnlyMode = queryParams.get('form_only') === '1';
    const [accreditations, setAccreditations] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [moodleProgrammeTypes, setMoodleProgrammeTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registeringCourseKey, setRegisteringCourseKey] = useState('');
    const [message, setMessage] = useState('');
    const [autoOpenHandled, setAutoOpenHandled] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [selectedAccreditation, setSelectedAccreditation] = useState(null);
    const [registrationForm, setRegistrationForm] = useState(null);
    const [editingRegistrationId, setEditingRegistrationId] = useState(null);
    const [structureInput, setStructureInput] = useState({
        programme_type_name: '',
        program_name: '',
        academic_year: '',
        semester_name: ''
    });
    const [structureIds, setStructureIds] = useState({
        programme_type_category_id: null,
        program_category_id: null,
        year_category_id: null,
        semester_category_id: null
    });
    const [structureDraft, setStructureDraft] = useState({
        programme_type_name: null,
        program_name: null,
        academic_year: null,
        semester_name: null
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [accRes, regRes, hierarchyRes, masterRes] = await Promise.all([
                axios.get(`${API_URL}/accreditations?active_only=true`),
                axios.get(`${API_URL}/students/course-registrations`).catch(() => ({ data: { data: [] } })),
                axios.get(`${API_URL}/students/moodle/category-hierarchy?include_inactive=false`).catch(() => ({ data: { data: { programme_types: [] } } })),
                axios.get(`${API_URL}/accreditations/master-courses`).catch(() => ({ data: { data: [] } }))
            ]);

            const allAcc = accRes.data?.data || [];
            const masterCourses = masterRes.data?.data || [];

            // Merge master course hierarchy info into accreditations
            const masterByCode = new Map();
            for (const mc of masterCourses) {
                const code = normalizeValue(mc.course_code);
                if (code) masterByCode.set(code, mc);
            }

            const enriched = allAcc.map(acc => {
                const master = masterByCode.get(normalizeValue(acc.course_code));
                if (!master) return acc;
                return {
                    ...acc,
                    programme_type_name: acc.programme_type_name || master.programme_type_name,
                    program_name: acc.program_name || master.program_name,
                    academic_year: acc.academic_year || master.academic_year,
                    semester_name: acc.semester_name || master.semester_name,
                    programme_type_category_id: acc.programme_type_category_id || master.programme_type_category_id,
                    program_category_id: acc.program_category_id || master.program_category_id,
                    year_category_id: acc.year_category_id || master.year_category_id,
                    semester_category_id: acc.semester_category_id || master.semester_category_id,
                    course_type: acc.course_type || master.course_type,
                    mode_of_delivery: acc.mode_of_delivery || master.mode_of_delivery,
                    subject_area_discipline: acc.subject_area_discipline || master.subject_area_discipline,
                };
            });

            // Also add master courses not in accreditations (so they appear as registerable)
            const accCodes = new Set(enriched.map(a => normalizeValue(a.course_code)));
            for (const mc of masterCourses) {
                const code = normalizeValue(mc.course_code);
                if (code && !accCodes.has(code)) {
                    enriched.push({
                        id: `master-${mc.id}`,
                        course_code: mc.course_code,
                        course_title: mc.course_title,
                        programme_type_name: mc.programme_type_name,
                        program_name: mc.program_name,
                        academic_year: mc.academic_year,
                        semester_name: mc.semester_name,
                        programme_type_category_id: mc.programme_type_category_id,
                        program_category_id: mc.program_category_id,
                        year_category_id: mc.year_category_id,
                        semester_category_id: mc.semester_category_id,
                        awarding_body: mc.awarding_body,
                        qualification_level: mc.qualification_level,
                        course_type: mc.course_type,
                        mode_of_delivery: mc.mode_of_delivery,
                        subject_area_discipline: mc.subject_area_discipline,
                    });
                }
            }

            const eligible = enriched.filter((a) => !!(a.course_title || a.course_code));
            setAccreditations(eligible);
            setRegistrations(regRes.data?.data?.registrations || []);
            setMoodleProgrammeTypes(Array.isArray(hierarchyRes.data?.data?.programme_types) ? hierarchyRes.data.data.programme_types : []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // When auto_open=1 with a course_code, only show that specific course in the table
    const displayedAccreditations = useMemo(() => {
        const autoOpen = queryParams.get('auto_open') === '1';
        const targetCode = normalizeValue(queryParams.get('course_code'));
        const targetTitle = normalizeValue(queryParams.get('course_title'));
        if (!autoOpen || (!targetCode && !targetTitle)) return accreditations;
        const filtered = accreditations.filter(acc =>
            (targetCode && normalizeValue(acc.course_code) === targetCode) ||
            (targetTitle && normalizeValue(acc.course_title) === targetTitle)
        );
        return filtered.length > 0 ? filtered : accreditations;
    }, [accreditations, queryParams]);

    const getRegistrationsForAcc = (acc) => {
        const matched = registrations.filter((r) =>
            normalizeValue(r.course_code) === normalizeValue(acc.course_code) ||
            normalizeValue(r.course_title) === normalizeValue(acc.course_title)
        );

        return matched.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    };

    const getRegistrationForAcc = (acc) => {
        const matched = getRegistrationsForAcc(acc);
        if (!matched.length) return null;
        return matched[0];
    };

    const resolveStructureForCourse = (course) => {
        const programmeTypeName = String(structureInput.programme_type_name || '').trim() || deriveProgrammeTypeName(course);
        const programName = String(structureInput.program_name || '').trim() || deriveProgramName(course);
        const academicYear = String(structureInput.academic_year || '').trim() || deriveAcademicYear(course);
        const semesterName = String(structureInput.semester_name || '').trim() || deriveSemesterName(course);

        return {
            programme_type_name: programmeTypeName,
            program_name: programName,
            academic_year: academicYear,
            semester_name: semesterName,
            programme_type_category_id: structureIds.programme_type_category_id,
            program_category_id: structureIds.program_category_id,
            year_category_id: structureIds.year_category_id,
            semester_category_id: structureIds.semester_category_id
        };
    };

    const cohortRegistrationsForSelected = useMemo(() => {
        if (!selectedAccreditation) return [];
        return getRegistrationsForAcc(selectedAccreditation);
    }, [selectedAccreditation, registrations]);

    const selectedCourseStructure = useMemo(() => {
        if (!selectedAccreditation) return null;
        return resolveStructureForCourse(selectedAccreditation);
    }, [selectedAccreditation, structureInput, structureIds]);

    const programmeTypeOptions = useMemo(() => uniqueByName(moodleProgrammeTypes), [moodleProgrammeTypes]);

    const selectedProgrammeType = useMemo(() => {
        const fromId = moodleProgrammeTypes.find((item) => Number(item.id) === Number(structureIds.programme_type_category_id));
        if (fromId) return fromId;
        const byName = moodleProgrammeTypes.find((item) => normalizeValue(item.name) === normalizeValue(structureInput.programme_type_name));
        return byName || null;
    }, [moodleProgrammeTypes, structureIds.programme_type_category_id, structureInput.programme_type_name]);

    const programOptions = useMemo(() => {
        if (selectedProgrammeType?.programs?.length) {
            return uniqueByName(selectedProgrammeType.programs);
        }
        const allPrograms = moodleProgrammeTypes.flatMap((item) => item.programs || []);
        return uniqueByName(allPrograms);
    }, [moodleProgrammeTypes, selectedProgrammeType]);

    const selectedProgram = useMemo(() => {
        const programPool = selectedProgrammeType?.programs?.length
            ? selectedProgrammeType.programs
            : moodleProgrammeTypes.flatMap((item) => item.programs || []);
        const fromId = programPool.find((program) => Number(program.id) === Number(structureIds.program_category_id));
        if (fromId) return fromId;
        const byName = programPool.find((program) => normalizeValue(program.name) === normalizeValue(structureInput.program_name));
        return byName || null;
    }, [moodleProgrammeTypes, selectedProgrammeType, structureIds.program_category_id, structureInput.program_name]);

    const yearOptions = useMemo(() => {
        if (selectedProgram?.years?.length) {
            return uniqueByName(selectedProgram.years);
        }
        const allYears = moodleProgrammeTypes.flatMap((item) => (item.programs || []).flatMap((program) => program.years || []));
        return uniqueByName(allYears);
    }, [moodleProgrammeTypes, selectedProgram]);

    const selectedYear = useMemo(() => {
        const years = selectedProgram?.years?.length
            ? selectedProgram.years
            : moodleProgrammeTypes.flatMap((item) => (item.programs || []).flatMap((program) => program.years || []));
        const fromId = years.find((year) => Number(year.id) === Number(structureIds.year_category_id));
        if (fromId) return fromId;
        const byName = years.find((year) => normalizeValue(year.name) === normalizeValue(structureInput.academic_year));
        return byName || null;
    }, [moodleProgrammeTypes, selectedProgram, structureIds.year_category_id, structureInput.academic_year]);

    const semesterOptions = useMemo(() => {
        if (selectedYear?.semesters?.length) {
            return uniqueByName(selectedYear.semesters);
        }
        const allSemesters = moodleProgrammeTypes.flatMap((item) => (item.programs || []).flatMap((program) => (program.years || []).flatMap((year) => year.semesters || [])));
        return uniqueByName(allSemesters);
    }, [moodleProgrammeTypes, selectedYear]);

    const handleProgrammeTypeInput = (value) => {
        const matchedType = moodleProgrammeTypes.find((item) => normalizeValue(item.name) === normalizeValue(value));
        setStructureInput((prev) => ({
            ...prev,
            programme_type_name: value,
            program_name: matchedType ? '' : prev.program_name,
            academic_year: matchedType ? '' : prev.academic_year,
            semester_name: matchedType ? '' : prev.semester_name
        }));
        setStructureIds((prev) => ({
            ...prev,
            programme_type_category_id: matchedType ? Number(matchedType.id) : null,
            program_category_id: matchedType ? null : prev.program_category_id,
            year_category_id: matchedType ? null : prev.year_category_id,
            semester_category_id: matchedType ? null : prev.semester_category_id
        }));
    };

    const handleProgramInput = (value) => {
        const programPool = selectedProgrammeType?.programs?.length
            ? selectedProgrammeType.programs
            : moodleProgrammeTypes.flatMap((item) => item.programs || []);
        const matchedProgram = programPool.find((program) => normalizeValue(program.name) === normalizeValue(value));
        setStructureInput((prev) => ({
            ...prev,
            program_name: value,
            academic_year: matchedProgram ? '' : prev.academic_year,
            semester_name: matchedProgram ? '' : prev.semester_name
        }));
        setStructureIds((prev) => ({
            ...prev,
            program_category_id: matchedProgram ? Number(matchedProgram.id) : null,
            year_category_id: matchedProgram ? null : prev.year_category_id,
            semester_category_id: matchedProgram ? null : prev.semester_category_id
        }));
    };

    const handleYearInput = (value) => {
        const yearPool = selectedProgram?.years?.length
            ? selectedProgram.years
            : moodleProgrammeTypes.flatMap((item) => (item.programs || []).flatMap((program) => program.years || []));
        const matchedYear = yearPool.find((year) => normalizeValue(year.name) === normalizeValue(value));

        setStructureInput((prev) => ({
            ...prev,
            academic_year: value,
            semester_name: matchedYear ? '' : prev.semester_name
        }));
        setStructureIds((prev) => ({
            ...prev,
            year_category_id: matchedYear ? Number(matchedYear.id) : null,
            semester_category_id: matchedYear ? null : prev.semester_category_id
        }));
    };

    const handleSemesterInput = (value) => {
        const semesterPool = selectedYear?.semesters?.length
            ? selectedYear.semesters
            : moodleProgrammeTypes.flatMap((item) => (item.programs || []).flatMap((program) => (program.years || []).flatMap((year) => year.semesters || [])));
        const matchedSemester = semesterPool.find((semester) => normalizeValue(semester.name) === normalizeValue(value));

        setStructureInput((prev) => ({ ...prev, semester_name: value }));
        setStructureIds((prev) => ({
            ...prev,
            semester_category_id: matchedSemester ? Number(matchedSemester.id) : null
        }));
    };

    const getDisplayedStructureValue = (field, committedValue) => (
        structureDraft[field] !== null ? structureDraft[field] : committedValue
    );

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

    const clearRegistrationEditor = () => {
        setShowRegistrationForm(false);
        setRegistrationForm(null);
        setEditingRegistrationId(null);
    };

    const closeRegistrationDashboard = () => {
        clearRegistrationEditor();
        setSelectedAccreditation(null);
    };

    const dismissRegistrationForm = () => {
        if (isFormOnlyMode) {
            closeRegistrationDashboard();
            navigate('/course-lifecycle');
            return;
        }

        clearRegistrationEditor();
    };

    const openRegistrationForm = (acc, existingRegistration = null) => {
        const registrationSeed = existingRegistration
            ? {
                ...acc,
                ...existingRegistration,
                course_title: existingRegistration.course_title || acc.course_title || '',
                course_code: existingRegistration.course_code || acc.course_code || ''
            }
            : acc;

        // Auto-fill structure from course/accreditation/registration data
        const seedProgrammeType = String(registrationSeed.programme_type_name || '').trim();
        const seedProgramName = String(registrationSeed.program_name || '').trim();
        const seedYear = String(registrationSeed.academic_year || '').trim();
        const seedSemester = String(registrationSeed.semester_name || '').trim();

        if (seedProgrammeType || seedProgramName || seedYear || seedSemester) {
            setStructureInput({
                programme_type_name: seedProgrammeType || structureInput.programme_type_name,
                program_name: seedProgramName || structureInput.program_name,
                academic_year: seedYear || structureInput.academic_year,
                semester_name: seedSemester || structureInput.semester_name
            });

            // Resolve category IDs from hierarchy
            const matchedType = moodleProgrammeTypes.find(t => normalizeValue(t.name) === normalizeValue(seedProgrammeType));
            const matchedProgram = matchedType?.programs?.find(p => normalizeValue(p.name) === normalizeValue(seedProgramName));
            const matchedYear = matchedProgram?.years?.find(y => normalizeValue(y.name) === normalizeValue(seedYear));
            const matchedSemester = matchedYear?.semesters?.find(s => normalizeValue(s.name) === normalizeValue(seedSemester));

            setStructureIds({
                programme_type_category_id: registrationSeed.programme_type_category_id || (matchedType ? Number(matchedType.id) : null),
                program_category_id: registrationSeed.program_category_id || (matchedProgram ? Number(matchedProgram.id) : null),
                year_category_id: registrationSeed.year_category_id || (matchedYear ? Number(matchedYear.id) : null),
                semester_category_id: registrationSeed.semester_category_id || (matchedSemester ? Number(matchedSemester.id) : null)
            });
        }

        const structure = resolveStructureForCourse(registrationSeed);
        const initialData = buildInitialFormData(registrationSeed, structure);
        const prefixedData = existingRegistration
            ? { ...initialData, ...mapRegistrationToForm(existingRegistration) }
            : initialData;

        setEditingRegistrationId(existingRegistration?.id ? Number(existingRegistration.id) : null);
        setSelectedAccreditation(acc);
        setRegistrationForm(prefixedData);
        setShowRegistrationForm(true);
    };

    useEffect(() => {
        setAutoOpenHandled(false);
    }, [location.search]);

    useEffect(() => {
        if (autoOpenHandled) {
            return;
        }

        const params = queryParams;
        const autoOpen = params.get('auto_open') === '1';
        if (!autoOpen) {
            return;
        }

        const requestedCode = normalizeValue(params.get('course_code'));
        const requestedTitle = normalizeValue(params.get('course_title'));
        const requestedAwardingBody = String(params.get('awarding_body') || '').trim();
        const requestedQualificationLevel = String(params.get('qualification_level') || '').trim();

        // In form-only mode, open immediately from URL params while data is loading,
        // then replace with saved registration data once registrations are available.
        if (isFormOnlyMode && loading && !selectedAccreditation) {
            const immediateFallback = {
                id: `auto-${requestedCode || requestedTitle || Date.now()}`,
                course_code: params.get('course_code') || '',
                course_title: params.get('course_title') || '',
                awarding_body: requestedAwardingBody,
                qualification_level: requestedQualificationLevel
            };

            if (immediateFallback.course_code || immediateFallback.course_title) {
                setSelectedAccreditation(immediateFallback);
                openRegistrationForm(immediateFallback);
                return;
            }
        }

        if (loading) {
            return;
        }

        const targetCourse = accreditations.find((acc) => {
            const accCode = normalizeValue(acc.course_code);
            const accTitle = normalizeValue(acc.course_title);
            return (requestedCode && accCode === requestedCode) || (requestedTitle && accTitle === requestedTitle);
        });

        const fallbackCourse = {
            id: `auto-${requestedCode || requestedTitle || Date.now()}`,
            course_code: params.get('course_code') || '',
            course_title: params.get('course_title') || '',
            awarding_body: requestedAwardingBody,
            qualification_level: requestedQualificationLevel
        };

        const courseToOpen = targetCourse || fallbackCourse;

        if (!courseToOpen.course_code && !courseToOpen.course_title) {
            setAutoOpenHandled(true);
            return;
        }

        // Instead of opening the form, just select the course to show its dashboard.
        setSelectedAccreditation(courseToOpen);

        const existingRegistration = getRegistrationForAcc(courseToOpen);
        if (existingRegistration) {
            if (isFormOnlyMode) {
                // In form-only mode, we still need to open the form directly.
                openRegistrationForm(courseToOpen, existingRegistration);
            } else {
                setMessage(`This course is already registered in Moodle (status: ${existingRegistration.moodle_sync_status || 'pending'}).`);
            }
            setAutoOpenHandled(true);
            return;
        }

        if (isFormOnlyMode) {
            openRegistrationForm(courseToOpen);
        } else {
            // For the main dashboard, just select the course.
            // The user can then choose to add a cohort.
            setSelectedAccreditation(courseToOpen);
        }
    }, [loading, autoOpenHandled, queryParams, accreditations, registrations, isFormOnlyMode]);

    const handleFormChange = (field, value) => {
        setRegistrationForm((prev) => ({ ...prev, [field]: value }));
    };

    const registerCourseToMoodle = async (acc, formData = {}, existingRegistrationId = null) => {
        const courseKey = buildCourseKey(acc);
        if (!courseKey || registeringCourseKey) return false;

        try {
            setRegisteringCourseKey(courseKey);
            setMessage('Submitting course registration to Moodle...');

            const structure = resolveStructureForCourse(acc);
            const payload = {
                course_title: acc.course_title || '',
                course_code: acc.course_code || '',
                ...structure,
                ...formData,
                application_status: 'submitted',
                sync_to_moodle: true
            };

            const isEditMode = Number.isInteger(Number(existingRegistrationId)) && Number(existingRegistrationId) > 0;
            const endpoint = isEditMode
                ? `${API_URL}/students/course-registrations/${existingRegistrationId}`
                : `${API_URL}/students/course-registrations`;
            const res = isEditMode
                ? await axios.put(endpoint, payload)
                : await axios.post(endpoint, payload);
            const registration = res.data?.data?.registration || {};
            const moodleSync = res.data?.data?.moodle_sync || {};
            const syncStatus = registration.moodle_sync_status || 'pending';

            if (syncStatus === 'synced') {
                setMessage(`Course successfully registered and created in Moodle! (Course ID: ${registration.moodle_course_id || '-'})`);
            } else if (syncStatus === 'failed') {
                setMessage(`Registered, but Moodle sync failed: ${moodleSync.message || 'Unknown error'}`);
            } else {
                setMessage('Registered successfully! Moodle sync is pending.');
            }

            await fetchData();
            return true;
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.message || err.message}`);
            return false;
        } finally {
            setRegisteringCourseKey('');
        }
    };

    const handleSubmitRegistration = async () => {
        if (!selectedAccreditation || !registrationForm) return;

        // Frontend validation: check for duplicate cohort intake
        if (registrationForm.cohort_label && !editingRegistrationId) {
            const courseCode = selectedAccreditation.course_code || '';
            const cohortLabel = registrationForm.cohort_label.trim();
            
            // Check if any existing registration (that's not rejected) has the same course code and cohort label
            const duplicateReg = registrations.find(reg => 
                String(reg.course_code || '').trim() === courseCode &&
                String(reg.cohort_label || '').trim() === cohortLabel &&
                reg.application_status !== 'rejected'
            );

            if (duplicateReg) {
                setMessage(`⚠️ This intake period "${cohortLabel}" already exists for this course. Please select a different intake period or edit cohort #${duplicateReg.id}.`);
                return;
            }
        }

        const success = await registerCourseToMoodle(selectedAccreditation, registrationForm, editingRegistrationId);
        if (success) {
            if (isFormOnlyMode) {
                dismissRegistrationForm();
            } else {
                clearRegistrationEditor();
            }
        }
    };

    const fillDemoRegistrationData = () => {
        if (!selectedAccreditation) return;

        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const reviewDateObj = new Date(today);
        reviewDateObj.setMonth(reviewDateObj.getMonth() + 6);
        const reviewDate = reviewDateObj.toISOString().split('T')[0];

        setRegistrationForm((prev) => ({
            ...prev,
            course_type: prev.course_type || 'Degree',
            awarding_body_accreditation: prev.awarding_body_accreditation || selectedAccreditation.awarding_body || 'Pearson',
            regulation_level: prev.regulation_level || selectedAccreditation.qualification_level || 'RQF Level 6',
            mode_of_delivery: prev.mode_of_delivery || 'Blended',
            start_date: startDate,
            end_date_or_duration: '12 months',
            cohort_label: prev.cohort_label || `${new Date(startDate).getFullYear()}-Sep`,
            subject_area_discipline: prev.subject_area_discipline || 'Business',
            course_description: prev.course_description || `${selectedAccreditation.course_title || 'This course'} prepares learners with practical and academic skills for progression and employment.`,
            learning_outcomes: prev.learning_outcomes || 'Apply subject knowledge in practical scenarios; demonstrate critical thinking and communication skills.',
            units_modules_covered: prev.units_modules_covered || 'Module 1: Core Concepts\nModule 2: Applied Practice\nModule 3: Assessment & Reflection',
            assessment_methods: prev.assessment_methods || 'Mixed',
            entry_requirements: prev.entry_requirements || 'Level 3 qualification or equivalent experience.',
            tuition_fee_gbp: prev.tuition_fee_gbp || '9250',
            additional_costs: prev.additional_costs || 'Materials and certification fees may apply.',
            funding_options: prev.funding_options || 'Self-funded',
            learning_resources_provided: prev.learning_resources_provided || 'Lecture slides, recorded sessions, practical workshops, online quizzes.',
            special_equipment_needed: prev.special_equipment_needed || 'Laptop with stable internet.',
            work_placement_included: prev.work_placement_included || 'No',
            course_leader_programme_director: prev.course_leader_programme_director || 'Dr Sarah Mitchell',
            internal_verification_contact: prev.internal_verification_contact || 'QA Team',
            ukvi_approved_course: prev.ukvi_approved_course || 'Yes',
            approval_date: prev.approval_date || startDate,
            review_date: prev.review_date || reviewDate,
            special_admission_considerations: prev.special_admission_considerations || 'Reasonable adjustments available following assessment.',
            progression_opportunities: prev.progression_opportunities || 'Progression to advanced study or industry roles.',
            industry_partnerships: prev.industry_partnerships || 'Employer engagement and guest sessions included.'
        }));

        setMessage('Demo registration data filled. Review and submit when ready.');
    };

    const resyncCourseRegistration = async (registrationId) => {
        if (!registrationId || registeringCourseKey) return;

        try {
            setRegisteringCourseKey(`resync-${registrationId}`);
            setMessage('Re-syncing course to Moodle...');

            const res = await axios.post(`${API_URL}/students/course-registrations/${registrationId}/sync-moodle`);
            const syncSuccess = Boolean(res.data?.success);
            const moodleCourseId = res.data?.data?.moodle_course_id;

            if (syncSuccess) {
                const courseIdSuffix = moodleCourseId ? ` (Course ID: ${moodleCourseId})` : '';
                setMessage(`${res.data?.message || 'Course re-synced successfully'}${courseIdSuffix}`);
            } else {
                setMessage(`Re-sync failed: ${res.data?.message || 'Unknown error'}`);
            }

            await fetchData();
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setRegisteringCourseKey('');
        }
    };

    const deleteRegistration = async (registrationId) => {
        if (!registrationId || !window.confirm('Are you sure you want to delete this cohort? This will also remove it from Moodle. This action cannot be undone.')) return;

        try {
            setRegisteringCourseKey(`delete-${registrationId}`);
            setMessage('Deleting cohort...');

            const res = await axios.delete(`${API_URL}/students/course-registrations/${registrationId}`);
            const deleteSuccess = Boolean(res.data?.success);

            if (deleteSuccess) {
                setMessage(`${res.data?.message || 'Cohort deleted successfully'}`);
            } else {
                setMessage(`Delete failed: ${res.data?.message || 'Unknown error'}`);
            }

            await fetchData();
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setRegisteringCourseKey('');
        }
    };

    return (
        <div className="space-y-6">
            {!isFormOnlyMode && (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Course Registration (Moodle)</h1>
                        <p className="text-sm text-gray-500">Loaded from Moodle categories in Programme Type {'>'} Program {'>'} Year {'>'} Semester order. Search existing values or type new values.</p>
                    </div>
                    <button onClick={fetchData} className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800">
                        <RefreshCw className="w-4 h-4 inline mr-2" />Refresh
                    </button>
                </div>
            )}

            {!isFormOnlyMode && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                    <p className="text-sm font-semibold text-gray-800">Registration Structure (applies to one-click register)</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Programme Type</label>
                        <input
                            list="registration-programme-type-options"
                            value={getDisplayedStructureValue('programme_type_name', structureInput.programme_type_name)}
                            onMouseDown={() => openFreshSearch('programme_type_name', programmeTypeOptions, structureInput.programme_type_name)}
                            onFocus={() => openFreshSearch('programme_type_name', programmeTypeOptions, structureInput.programme_type_name)}
                            onBlur={() => clearStructureDraft('programme_type_name')}
                            onChange={(e) => commitStructureInput('programme_type_name', e.target.value, handleProgrammeTypeInput)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Search type or type new"
                        />
                        <datalist id="registration-programme-type-options">
                            {programmeTypeOptions.map((option) => (
                                <option key={option.id || option.name} value={option.name} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Program</label>
                        <input
                            list="registration-program-options"
                            value={getDisplayedStructureValue('program_name', structureInput.program_name)}
                            onMouseDown={() => openFreshSearch('program_name', programOptions, structureInput.program_name)}
                            onFocus={() => openFreshSearch('program_name', programOptions, structureInput.program_name)}
                            onBlur={() => clearStructureDraft('program_name')}
                            onChange={(e) => commitStructureInput('program_name', e.target.value, handleProgramInput)}
                            disabled={!structureInput.programme_type_name.trim()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            placeholder={structureInput.programme_type_name.trim() ? 'Search program or type new' : 'Select or type Programme Type first'}
                        />
                        <datalist id="registration-program-options">
                            {programOptions.map((option) => (
                                <option key={option.id || option.name} value={option.name} />
                            ))}
                        </datalist>
                        {!structureInput.programme_type_name.trim() && (
                            <p className="text-xs text-gray-500 mt-1">Choose Programme Type first to unlock Program.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Year</label>
                        <input
                            list="registration-year-options"
                            value={getDisplayedStructureValue('academic_year', structureInput.academic_year)}
                            onMouseDown={() => openFreshSearch('academic_year', yearOptions, structureInput.academic_year)}
                            onFocus={() => openFreshSearch('academic_year', yearOptions, structureInput.academic_year)}
                            onBlur={() => clearStructureDraft('academic_year')}
                            onChange={(e) => commitStructureInput('academic_year', e.target.value, handleYearInput)}
                            disabled={!structureInput.program_name.trim()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            placeholder={structureInput.program_name.trim() ? 'Search year or type new' : 'Select or type Program first'}
                        />
                        <datalist id="registration-year-options">
                            {yearOptions.map((option) => (
                                <option key={option.id || option.name} value={option.name} />
                            ))}
                        </datalist>
                        {!structureInput.program_name.trim() && (
                            <p className="text-xs text-gray-500 mt-1">Choose Program first to unlock Year.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Semester</label>
                        <input
                            list="registration-semester-options"
                            value={getDisplayedStructureValue('semester_name', structureInput.semester_name)}
                            onMouseDown={() => openFreshSearch('semester_name', semesterOptions, structureInput.semester_name)}
                            onFocus={() => openFreshSearch('semester_name', semesterOptions, structureInput.semester_name)}
                            onBlur={() => clearStructureDraft('semester_name')}
                            onChange={(e) => commitStructureInput('semester_name', e.target.value, handleSemesterInput)}
                            disabled={!structureInput.academic_year.trim()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            placeholder={structureInput.academic_year.trim() ? 'Search semester or type new' : 'Select or type Year first'}
                        />
                        <datalist id="registration-semester-options">
                            {semesterOptions.map((option) => (
                                <option key={option.id || option.name} value={option.name} />
                            ))}
                        </datalist>
                        {!structureInput.academic_year.trim() && (
                            <p className="text-xs text-gray-500 mt-1">Choose Year first to unlock Semester.</p>
                        )}
                    </div>
                </div>
                </div>
            )}

            {message && (
                <div className={`rounded-lg px-4 py-3 text-sm font-medium ${message.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {message}
                </div>
            )}

            {loading ? (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-scl-purple" />
                    <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
            ) : displayedAccreditations.length === 0 && !isFormOnlyMode ? (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                    <CircleDashed className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 font-semibold">No approved courses yet</p>
                    <p className="text-sm text-gray-400 mt-1">Complete and approve a Course Accreditation to register it here.</p>
                </div>
            ) : !isFormOnlyMode ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full min-w-[640px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Awarding Body</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Accreditation</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Moodle Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Registrations</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedAccreditations.map((acc) => {
                                const reg = getRegistrationForAcc(acc);
                                const allRegs = getRegistrationsForAcc(acc);
                                const cohortCount = allRegs.length;
                                const latestReg = allRegs[0] || null;
                                const accStatus = (acc.overall_status || 'not_started').toLowerCase().replace(/\s+/g, '_');
                                const moodleStatus = reg?.moodle_sync_status || null;
                                const isSelectedCourse = buildCourseKey(selectedAccreditation) === buildCourseKey(acc);

                                return (
                                    <tr key={acc.id} className={`border-b border-gray-100 hover:bg-gray-50 ${isSelectedCourse ? 'bg-blue-50' : ''}`}>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="font-semibold text-gray-900">{acc.course_title || 'Untitled'}</div>
                                            <div className="text-xs text-gray-500">{acc.course_code || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{acc.awarding_body || '-'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {badge(acc.overall_status || 'Not Started', accStatus)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {reg ? (
                                                <div className="flex items-center gap-2">
                                                    {moodleStatus === 'synced'
                                                        ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                        : <Clock3 className="w-4 h-4 text-amber-500" />}
                                                    {badge(moodleStatus || 'pending', moodleStatus || 'pending')}
                                                </div>
                                            ) : (
                                                badge('Not registered', 'not_started')
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {reg ? (
                                                <div>
                                                    <div className="font-semibold text-gray-900">{cohortCount} registration{cohortCount === 1 ? '' : 's'}</div>
                                                    <div className="text-xs text-gray-500">{reg.moodle_course_id ? 'Synced to Moodle' : 'Pending sync'}</div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500">No registrations yet</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {reg ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openRegistrationForm(acc)}
                                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                                                    >
                                                        Add Cohort
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAccreditation(acc);
                                                            clearRegistrationEditor();
                                                        }}
                                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
                                                    >
                                                        Open Dashboard
                                                    </button>
                                                    <button
                                                        onClick={() => latestReg && resyncCourseRegistration(latestReg.id)}
                                                        disabled={!latestReg || registeringCourseKey === `resync-${latestReg?.id}`}
                                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                        title="Re-sync latest cohort to Moodle"
                                                    >
                                                        {registeringCourseKey === `resync-${latestReg?.id}` ? 'Syncing...' : 'Sync Latest'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedAccreditation(acc);
                                                        clearRegistrationEditor();
                                                    }}
                                                    disabled={registeringCourseKey === buildCourseKey(acc)}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    Add Registration
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : null}

            {selectedAccreditation && (
                <div className={isFormOnlyMode ? 'w-full' : 'bg-white border border-gray-200 rounded-2xl overflow-hidden'}>
                    <div className={isFormOnlyMode ? 'flex items-start justify-between pb-4 border-b border-gray-200' : 'flex items-start justify-between p-6 border-b border-gray-200 bg-gray-50'}>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Course Registration Dashboard</h2>
                            <p className="text-sm text-gray-500 mt-1">Main course details stay read-only here. Add or update cohort records underneath.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isFormOnlyMode && !showRegistrationForm && (
                                <button
                                    onClick={() => openRegistrationForm(selectedAccreditation)}
                                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                                >
                                    Add Cohort
                                </button>
                            )}
                            {isFormOnlyMode ? (
                                <button
                                    onClick={dismissRegistrationForm}
                                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Back to Lifecycle
                                </button>
                            ) : (
                                <button
                                    onClick={closeRegistrationDashboard}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={isFormOnlyMode ? 'pt-4 space-y-4' : 'p-6 space-y-6'}>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
                            <strong>Year-Based Cohorts:</strong> Each cohort is created at the program + year level (e.g., "DEG-Y1-2026-Sep"). Students in a cohort see all courses for their year: year-long courses + current semester courses only.
                        </div>

                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-200 bg-white">
                                <h3 className="text-sm font-semibold text-gray-900">Course Main</h3>
                                <p className="text-xs text-gray-500 mt-0.5">These values are read-only and act as the parent course for all cohorts.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4 bg-gray-50">
                                {[
                                    ['Course Title', selectedAccreditation.course_title || '-'],
                                    ['Course Code / ID', selectedAccreditation.course_code || '-'],
                                    ['Awarding Body', selectedAccreditation.awarding_body || '-'],
                                    ['Qualification Level', selectedAccreditation.qualification_level || selectedAccreditation.course_type || '-'],
                                    ['Programme Type', selectedCourseStructure?.programme_type_name || '-'],
                                    ['Program', getFullProgramName(selectedCourseStructure?.program_name, moodleProgrammeTypes) || '-'],
                                    ['Academic Year', selectedCourseStructure?.academic_year || '-'],
                                    ['Semester', selectedCourseStructure?.semester_name || '-']
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">{label}</label>
                                        <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 min-h-[42px] flex items-center">
                                            {value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Course Cohorts</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {cohortRegistrationsForSelected.length} registration record{cohortRegistrationsForSelected.length === 1 ? '' : 's'} for this course
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!isFormOnlyMode && (
                                        <button
                                            type="button"
                                            onClick={() => openRegistrationForm(selectedAccreditation)}
                                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                                        >
                                            Add Cohort
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[680px]">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Registration ID</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Year</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Intake</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Linked</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Moodle</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cohortRegistrationsForSelected.length > 0 ? cohortRegistrationsForSelected.map((item) => {
                                            const isCurrent = Number(editingRegistrationId) === Number(item.id);
                                            return (
                                                <tr key={item.id} className={`border-b border-gray-100 ${isCurrent ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                                    <td className="px-3 py-2 text-sm">
                                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">Cohort</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-700">#{item.id}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-700">{item.academic_year || '-'}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-700">{item.cohort_label || '-'}</td>
                                                    <td className="px-3 py-2 text-sm">
                                                        {item.intake_id ? (
                                                            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold" title={`Linked to programme intake #${item.intake_id}`}>
                                                                Intake #{item.intake_id}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">standalone</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm">{badge(item.moodle_sync_status || 'pending', item.moodle_sync_status || 'pending')}</td>
                                                    <td className="px-3 py-2 text-sm flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openRegistrationForm(selectedAccreditation, item)}
                                                            disabled={registeringCourseKey === `delete-${item.id}`}
                                                            className="px-2 py-1 text-xs font-semibold rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isCurrent ? 'Editing' : 'Open'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteRegistration(item.id)}
                                                            disabled={registeringCourseKey.startsWith('delete-') || registeringCourseKey.startsWith('resync-')}
                                                            className="px-2 py-1 text-xs font-semibold rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {registeringCourseKey === `delete-${item.id}` ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                                                    No cohorts added yet. Use <strong>Add Cohort</strong> to create the first registration.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {showRegistrationForm && registrationForm && (
                           <CohortFormModal
                                isOpen={showRegistrationForm}
                                onClose={dismissRegistrationForm}
                                onSubmit={handleSubmitRegistration}
                                formData={registrationForm}
                                onFormChange={handleFormChange}
                                onFillTestData={fillDemoRegistrationData}
                                isSubmitting={registeringCourseKey === buildCourseKey(selectedAccreditation)}
                                isEditing={!!editingRegistrationId}
                                course={selectedAccreditation}
                                programmeTypes={moodleProgrammeTypes}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseRegistrations;
