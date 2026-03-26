import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock3, CircleDashed, Loader2, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

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

function deriveProgrammeTypeName(course) {
    return String(course?.programme_type_name || '').trim() || 'Degree';
}

function deriveAcademicYear(course) {
    return String(course?.academic_year || '').trim() || 'Year 1';
}

function deriveSemesterName(course) {
    return String(course?.semester_name || '').trim() || 'Semester 1';
}

const CourseRegistrations = () => {
    const location = useLocation();
    const [accreditations, setAccreditations] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [moodleProgrammeTypes, setMoodleProgrammeTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registeringCourseKey, setRegisteringCourseKey] = useState('');
    const [message, setMessage] = useState('');
    const [autoOpenHandled, setAutoOpenHandled] = useState(false);
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

    const getRegistrationForAcc = (acc) =>
        registrations.find((r) =>
            normalizeValue(r.course_code) === normalizeValue(acc.course_code) ||
            normalizeValue(r.course_title) === normalizeValue(acc.course_title)
        );

    useEffect(() => {
        if (loading || autoOpenHandled) {
            return;
        }

        const params = new URLSearchParams(location.search || '');
        const autoOpen = params.get('auto_open') === '1';
        if (!autoOpen) {
            return;
        }

        const requestedCode = normalizeValue(params.get('course_code'));
        const requestedTitle = normalizeValue(params.get('course_title'));
        const targetCourse = accreditations.find((acc) => {
            const accCode = normalizeValue(acc.course_code);
            const accTitle = normalizeValue(acc.course_title);
            return (requestedCode && accCode === requestedCode) || (requestedTitle && accTitle === requestedTitle);
        });

        if (!targetCourse) {
            setAutoOpenHandled(true);
            return;
        }

        const existingRegistration = getRegistrationForAcc(targetCourse);
        if (existingRegistration) {
            setMessage(`This course is already registered in Moodle (status: ${existingRegistration.moodle_sync_status || 'pending'}).`);
            setAutoOpenHandled(true);
            return;
        }

        registerCourseToMoodle(targetCourse);
        setAutoOpenHandled(true);
    }, [loading, autoOpenHandled, location.search, accreditations, registrations]);

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

    const registerCourseToMoodle = async (acc) => {
        const courseKey = buildCourseKey(acc);
        if (!courseKey || registeringCourseKey) return;

        try {
            setRegisteringCourseKey(courseKey);
            setMessage('Submitting course to Moodle...');

            const structure = resolveStructureForCourse(acc);
            const payload = {
                course_title: acc.course_title || '',
                course_code: acc.course_code || '',
                ...structure,
                awarding_body_accreditation: acc.awarding_body || '',
                course_type: acc.course_type || 'Postgraduate',
                regulation_level: acc.qualification_level || 'RQF Level 7',
                mode_of_delivery: acc.mode_of_delivery || 'Blended',
                subject_area_discipline: acc.subject_area_discipline || acc.course_title || 'General',
                course_description: acc.course_description || `${acc.course_title || 'Course'} registration synced from lifecycle dashboard.`,
                learning_outcomes: acc.learning_outcomes || 'Core learning outcomes aligned with accreditation standards.',
                units_modules_covered: acc.units_modules_covered || 'Core Module 1\nCore Module 2\nCore Module 3',
                application_status: 'submitted',
                sync_to_moodle: true
            };

            const res = await axios.post(`${API_URL}/students/course-registrations`, payload);
            const registration = res.data?.data?.registration || {};
            const moodleSync = res.data?.data?.moodle_sync || {};
            const syncStatus = registration.moodle_sync_status || 'pending';

            if (syncStatus === 'synced') {
                setMessage(`Course successfully registered and created in Moodle! (Course ID: ${registration.moodle_course_id || '—'})`);
            } else if (syncStatus === 'failed') {
                setMessage(`Registered, but Moodle sync failed: ${moodleSync.message || 'Unknown error'}`);
            } else {
                setMessage('Registered successfully! Moodle sync is pending.');
            }

            await fetchData();
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setRegisteringCourseKey('');
        }
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Registration (Moodle)</h1>
                    <p className="text-sm text-gray-500">Loaded from Moodle categories in Programme Type {'>'} Program {'>'} Year {'>'} Semester order. Search existing values or type new values.</p>
                </div>
                <button onClick={fetchData} className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800">
                    <RefreshCw className="w-4 h-4 inline mr-2" />Refresh
                </button>
            </div>

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
            ) : accreditations.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                    <CircleDashed className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 font-semibold">No approved courses yet</p>
                    <p className="text-sm text-gray-400 mt-1">Complete and approve a Course Accreditation to register it here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full min-w-[640px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Awarding Body</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Accreditation</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Moodle Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accreditations.map((acc) => {
                                const reg = getRegistrationForAcc(acc);
                                const accStatus = (acc.overall_status || 'not_started').toLowerCase().replace(/\s+/g, '_');
                                const moodleStatus = reg?.moodle_sync_status || null;

                                return (
                                    <tr key={acc.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">
                                            <div className="font-semibold text-gray-900">{acc.course_title || 'Untitled'}</div>
                                            <div className="text-xs text-gray-500">{acc.course_code || '—'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{acc.awarding_body || '—'}</td>
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
                                        <td className="px-4 py-3 text-sm">
                                            {reg ? (
                                                <button
                                                    onClick={() => resyncCourseRegistration(reg.id)}
                                                    disabled={registeringCourseKey === `resync-${reg.id}`}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                    title="Re-sync course to Moodle"
                                                >
                                                    {registeringCourseKey === `resync-${reg.id}` ? 'Syncing...' : 'Sync Again'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => registerCourseToMoodle(acc)}
                                                    disabled={registeringCourseKey === buildCourseKey(acc)}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {registeringCourseKey === buildCourseKey(acc) ? 'Registering...' : 'Register to Moodle'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CourseRegistrations;
