import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock3, CircleDashed, Loader2, RefreshCw, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

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

const COURSE_TYPE_OPTIONS = ['HND', 'Degree', 'Vocational', 'Short Course', 'CPD', 'Professional Qualification'];
const AWARDING_BODY_OPTIONS = ['Pearson', 'City & Guilds', 'In-house', 'NCFE', 'Other'];
const REGULATION_LEVEL_OPTIONS = ['RQF Level 1', 'RQF Level 2', 'RQF Level 3', 'RQF Level 4', 'RQF Level 5', 'RQF Level 6', 'RQF Level 7', 'RQF Level 8', 'Non-accredited'];
const MODE_OF_DELIVERY_OPTIONS = ['Full-time', 'Part-time', 'Online', 'Blended', 'Evening/Weekend'];
const SUBJECT_AREA_OPTIONS = ['Business', 'Engineering', 'IT', 'Creative Arts', 'Health & Social Care', 'Hospitality & Tourism', 'Other'];
const ASSESSMENT_METHOD_OPTIONS = ['Exam', 'Coursework', 'Portfolio', 'Practical', 'Mixed'];
const FUNDING_OPTIONS = ['Self-funded', 'Employer-funded', 'Student Loan', 'Scholarship'];
const YES_NO_OPTIONS = ['Yes', 'No'];

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

function deriveProgrammeTypeName(course) {
    return String(course?.programme_type_name || '').trim() || 'Degree';
}

function deriveAcademicYear(course) {
    return String(course?.academic_year || '').trim() || 'Year 1';
}

function deriveSemesterName(course) {
    return String(course?.semester_name || '').trim() || 'Semester 1';
}

function buildInitialFormData(acc, structure) {
    return {
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
        course_type: acc?.course_type || 'Degree',
        awarding_body_accreditation: acc?.awarding_body || '',
        regulation_level: acc?.qualification_level || 'RQF Level 6',
        mode_of_delivery: acc?.mode_of_delivery || 'Blended',
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
            const [accRes, regRes, hierarchyRes] = await Promise.all([
                axios.get(`${API_URL}/accreditations?active_only=true`),
                axios.get(`${API_URL}/students/course-registrations`).catch(() => ({ data: { data: [] } })),
                axios.get(`${API_URL}/students/moodle/category-hierarchy?include_inactive=false`).catch(() => ({ data: { data: { programme_types: [] } } }))
            ]);

            const allAcc = accRes.data?.data || [];
            const eligible = allAcc.filter((a) => !!(a.course_title || a.course_code));
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

        const master = matched.find((r) => Number(r.is_master) === 1);
        return master || matched[0];
    };

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

    const closeRegistrationForm = () => {
        setShowRegistrationForm(false);
        setSelectedAccreditation(null);
        setRegistrationForm(null);
        setEditingRegistrationId(null);
    };

    const dismissRegistrationForm = () => {
        closeRegistrationForm();
        if (isFormOnlyMode) {
            navigate('/course-lifecycle');
        }
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

        const structure = resolveStructureForCourse(registrationSeed);
        const initialData = buildInitialFormData(registrationSeed, structure);
        const prefixedData = existingRegistration
            ? { ...initialData, ...mapRegistrationToForm(existingRegistration) }
            : initialData;

        setEditingRegistrationId(existingRegistration?.id ? Number(existingRegistration.id) : null);
        setSelectedAccreditation(registrationSeed);
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
        if (isFormOnlyMode && loading && !showRegistrationForm) {
            const immediateFallback = {
                id: `auto-${requestedCode || requestedTitle || Date.now()}`,
                course_code: params.get('course_code') || '',
                course_title: params.get('course_title') || '',
                awarding_body: requestedAwardingBody,
                qualification_level: requestedQualificationLevel
            };

            if (immediateFallback.course_code || immediateFallback.course_title) {
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

        const existingRegistration = getRegistrationForAcc(courseToOpen);
        if (existingRegistration) {
            if (isFormOnlyMode) {
                openRegistrationForm(courseToOpen, existingRegistration);
            } else {
                setMessage(`This course is already registered in Moodle (status: ${existingRegistration.moodle_sync_status || 'pending'}).`);
            }
            setAutoOpenHandled(true);
            return;
        }

        openRegistrationForm(courseToOpen);
        setAutoOpenHandled(true);
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
        const success = await registerCourseToMoodle(selectedAccreditation, registrationForm, editingRegistrationId);
        if (success) {
            dismissRegistrationForm();
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
            ) : accreditations.length === 0 && !isFormOnlyMode ? (
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
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Master / Cohorts</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accreditations.map((acc) => {
                                const reg = getRegistrationForAcc(acc);
                                const allRegs = getRegistrationsForAcc(acc);
                                const masterReg = allRegs.find((item) => Number(item.is_master) === 1) || null;
                                const childCount = allRegs.filter((item) => Number(item.is_master) !== 1).length;
                                const latestReg = allRegs[0] || null;
                                const accStatus = (acc.overall_status || 'not_started').toLowerCase().replace(/\s+/g, '_');
                                const moodleStatus = reg?.moodle_sync_status || null;

                                return (
                                    <tr key={acc.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                                                    <div className="font-semibold text-gray-900">{masterReg ? 'Master linked' : 'Master pending'}</div>
                                                    <div className="text-xs text-gray-500">{childCount} cohort{childCount === 1 ? '' : 's'}</div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500">Will create master on first submit</span>
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
                                                    onClick={() => openRegistrationForm(acc)}
                                                    disabled={registeringCourseKey === buildCourseKey(acc)}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    Register to Moodle
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

            {showRegistrationForm && registrationForm && selectedAccreditation && (
                <div
                    className={isFormOnlyMode ? 'w-full' : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'}
                    onClick={(e) => {
                        if (!isFormOnlyMode && e.target === e.currentTarget) {
                            dismissRegistrationForm();
                        }
                    }}
                >
                    <div className={isFormOnlyMode ? 'w-full' : 'bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col'}>
                        <div className={isFormOnlyMode ? 'flex items-start justify-between pb-4 border-b border-gray-200' : 'flex items-start justify-between p-6 border-b border-gray-200'}>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Course Registration Form</h2>
                                <p className="text-sm text-gray-500 mt-1">Complete full registration fields to create and configure the Moodle course.</p>
                            </div>
                            {isFormOnlyMode ? (
                                <button
                                    onClick={dismissRegistrationForm}
                                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Back to Lifecycle
                                </button>
                            ) : (
                                <button onClick={dismissRegistrationForm} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className={isFormOnlyMode ? 'pt-4 space-y-4' : 'flex-1 overflow-y-auto p-6 space-y-4'}>
                            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
                                First registration for a course becomes <strong>Master</strong>. Each next submission with a new cohort label becomes a <strong>Child Cohort</strong> linked to that master.
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Course Title</label>
                                    <input value={selectedAccreditation.course_title || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Course Code / ID</label>
                                    <input value={selectedAccreditation.course_code || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Cohort Label</label>
                                    <input
                                        value={registrationForm.cohort_label}
                                        onChange={(e) => handleFormChange('cohort_label', e.target.value)}
                                        placeholder="e.g. 2026-Sep"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Course Type</label>
                                    <select value={registrationForm.course_type} onChange={(e) => handleFormChange('course_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="">Select</option>
                                        {COURSE_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Awarding Body / Accreditation</label>
                                    <select value={registrationForm.awarding_body_accreditation} onChange={(e) => handleFormChange('awarding_body_accreditation', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="">Select</option>
                                        {AWARDING_BODY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Regulation Level</label>
                                    <select value={registrationForm.regulation_level} onChange={(e) => handleFormChange('regulation_level', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="">Select</option>
                                        {REGULATION_LEVEL_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Mode of Delivery</label>
                                    <select value={registrationForm.mode_of_delivery} onChange={(e) => handleFormChange('mode_of_delivery', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="">Select</option>
                                        {MODE_OF_DELIVERY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Start Date</label>
                                    <input type="date" value={registrationForm.start_date} onChange={(e) => handleFormChange('start_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">End Date / Duration</label>
                                    <input value={registrationForm.end_date_or_duration} onChange={(e) => handleFormChange('end_date_or_duration', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Subject Area / Discipline</label>
                                    <select value={registrationForm.subject_area_discipline} onChange={(e) => handleFormChange('subject_area_discipline', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="">Select</option>
                                        {SUBJECT_AREA_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Assessment Methods</label>
                                    <select value={registrationForm.assessment_methods} onChange={(e) => handleFormChange('assessment_methods', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="">Select</option>
                                        {ASSESSMENT_METHOD_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tuition Fee (GBP)</label>
                                    <input type="number" value={registrationForm.tuition_fee_gbp} onChange={(e) => handleFormChange('tuition_fee_gbp', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Additional Costs</label>
                                    <input value={registrationForm.additional_costs} onChange={(e) => handleFormChange('additional_costs', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Funding Options</label>
                                    <select value={registrationForm.funding_options} onChange={(e) => handleFormChange('funding_options', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="">Select</option>
                                        {FUNDING_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Special Equipment Needed</label>
                                    <input value={registrationForm.special_equipment_needed} onChange={(e) => handleFormChange('special_equipment_needed', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Work Placement / Internship Included</label>
                                    <select value={registrationForm.work_placement_included} onChange={(e) => handleFormChange('work_placement_included', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="">Select</option>
                                        {YES_NO_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Course Leader / Programme Director</label>
                                    <input value={registrationForm.course_leader_programme_director} onChange={(e) => handleFormChange('course_leader_programme_director', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Internal Verification Contact</label>
                                    <input value={registrationForm.internal_verification_contact} onChange={(e) => handleFormChange('internal_verification_contact', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">UKVI Approved Course?</label>
                                    <select value={registrationForm.ukvi_approved_course} onChange={(e) => handleFormChange('ukvi_approved_course', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="">Select</option>
                                        {YES_NO_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Approval Date</label>
                                    <input type="date" value={registrationForm.approval_date} onChange={(e) => handleFormChange('approval_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Review Date</label>
                                    <input type="date" value={registrationForm.review_date} onChange={(e) => handleFormChange('review_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Course Description</label>
                                <textarea value={registrationForm.course_description} onChange={(e) => handleFormChange('course_description', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Learning Outcomes</label>
                                <textarea value={registrationForm.learning_outcomes} onChange={(e) => handleFormChange('learning_outcomes', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Units / Modules Covered</label>
                                <textarea value={registrationForm.units_modules_covered} onChange={(e) => handleFormChange('units_modules_covered', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Entry Requirements</label>
                                <textarea value={registrationForm.entry_requirements} onChange={(e) => handleFormChange('entry_requirements', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Learning Resources Provided</label>
                                <textarea value={registrationForm.learning_resources_provided} onChange={(e) => handleFormChange('learning_resources_provided', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Special Admission Considerations</label>
                                <textarea value={registrationForm.special_admission_considerations} onChange={(e) => handleFormChange('special_admission_considerations', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Progression Opportunities</label>
                                <textarea value={registrationForm.progression_opportunities} onChange={(e) => handleFormChange('progression_opportunities', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Industry Partnerships</label>
                                <textarea value={registrationForm.industry_partnerships} onChange={(e) => handleFormChange('industry_partnerships', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                        </div>

                        <div className={isFormOnlyMode ? 'py-6 border-t border-gray-200 flex justify-end gap-2' : 'p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-2'}>
                            <button
                                onClick={fillDemoRegistrationData}
                                type="button"
                                className="px-4 py-2 text-sm font-semibold rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                            >
                                Fill Test Data
                            </button>
                            <button onClick={dismissRegistrationForm} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitRegistration}
                                disabled={registeringCourseKey === buildCourseKey(selectedAccreditation)}
                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {registeringCourseKey === buildCourseKey(selectedAccreditation)
                                    ? (editingRegistrationId ? 'Updating...' : 'Registering...')
                                    : (editingRegistrationId ? 'Update Registration & Sync Moodle' : 'Submit Registration & Sync Moodle')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseRegistrations;
