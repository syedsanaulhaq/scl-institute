import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock3, CircleDashed, Loader2, RefreshCw, Plus, ChevronDown, ChevronRight, Trash2, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const badge = (label, colorKey) => {
    const colors = {
        synced: 'bg-green-100 text-green-800',
        pending: 'bg-amber-100 text-amber-800',
        failed: 'bg-red-100 text-red-800',
        active: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-600',
        submitted: 'bg-blue-100 text-blue-800',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[colorKey] || 'bg-gray-100 text-gray-700'}`}>
            {label}
        </span>
    );
};

const syncIcon = (status) => {
    if (status === 'synced') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === 'failed') return <CircleDashed className="w-4 h-4 text-red-500" />;
    return <Clock3 className="w-4 h-4 text-amber-500" />;
};

const ProgrammeIntakes = () => {
    const [loading, setLoading] = useState(true);
    const [intakes, setIntakes] = useState([]);
    const [hierarchy, setHierarchy] = useState([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');

    // Add Intake form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [addingIntake, setAddingIntake] = useState(false);
    const [intakeForm, setIntakeForm] = useState({
        programme_type_name: '',
        program_name: '',
        intake_label: '',
        intake_start_date: '',
        intake_end_date: '',
    });

    // Expanded sections
    const [expandedIntakes, setExpandedIntakes] = useState({});

    // Sync state
    const [syncingIntakeId, setSyncingIntakeId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [intakeRes, hierRes] = await Promise.all([
                axios.get(`${API_URL}/students/programme-intakes`),
                axios.get(`${API_URL}/students/moodle/category-hierarchy?include_inactive=false`).catch(() => ({ data: { data: { programme_types: [] } } })),
            ]);
            setIntakes(intakeRes.data?.data || []);
            setHierarchy(Array.isArray(hierRes.data?.data?.programme_types) ? hierRes.data.data.programme_types : []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            showMessage('Failed to load data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const showMessage = (msg, type = 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 8000);
    };

    // Cascading dropdowns for the add form
    const programmeTypes = useMemo(() => hierarchy.map(t => t.name).filter(Boolean).sort(), [hierarchy]);

    const programs = useMemo(() => {
        if (!intakeForm.programme_type_name) return [];
        const typeNode = hierarchy.find(t => t.name === intakeForm.programme_type_name);
        return (typeNode?.programs || []).map(p => p.name).filter(Boolean).sort();
    }, [hierarchy, intakeForm.programme_type_name]);

    // Auto-generate intake label
    const generateIntakeLabel = () => {
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[now.getMonth()]}-${now.getFullYear()}`;
    };

    const handleOpenAddForm = () => {
        setIntakeForm({
            programme_type_name: '',
            program_name: '',
            intake_label: generateIntakeLabel(),
            intake_start_date: '',
            intake_end_date: '',
        });
        setShowAddForm(true);
    };

    const handleCreateIntake = async () => {
        if (!intakeForm.programme_type_name || !intakeForm.program_name || !intakeForm.intake_label) {
            showMessage('Please fill Programme Type, Programme, and Intake Label.', 'error');
            return;
        }

        try {
            setAddingIntake(true);

            // Resolve category IDs from hierarchy
            const typeNode = hierarchy.find(t => t.name === intakeForm.programme_type_name);
            const progNode = typeNode?.programs?.find(p => p.name === intakeForm.program_name);

            const res = await axios.post(`${API_URL}/students/programme-intakes`, {
                ...intakeForm,
                programme_type_category_id: typeNode?.id || null,
                program_category_id: progNode?.id || null,
            });

            if (res.data?.success) {
                showMessage(res.data.message, 'success');
                setShowAddForm(false);
                await fetchData();
                // Auto-expand the new intake
                const newIntakeId = res.data.data?.intake?.id;
                if (newIntakeId) {
                    setExpandedIntakes(prev => ({ ...prev, [newIntakeId]: true }));
                }
            } else {
                showMessage(res.data?.message || 'Failed to create intake.', 'error');
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message;
            showMessage(errMsg, 'error');
        } finally {
            setAddingIntake(false);
        }
    };

    const handleSyncIntake = async (intakeId) => {
        try {
            setSyncingIntakeId(intakeId);
            const res = await axios.post(`${API_URL}/students/programme-intakes/${intakeId}/sync`);
            if (res.data?.success) {
                showMessage(res.data.message, 'success');
                await fetchData();
            } else {
                showMessage(res.data?.message || 'Sync failed.', 'error');
            }
        } catch (err) {
            showMessage(err.response?.data?.message || err.message, 'error');
        } finally {
            setSyncingIntakeId(null);
        }
    };

    const handleDeleteIntake = async (intakeId, label) => {
        if (!window.confirm(`Delete intake "${label}" and all its course registrations? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API_URL}/students/programme-intakes/${intakeId}`);
            showMessage('Intake deleted.', 'success');
            await fetchData();
        } catch (err) {
            showMessage(err.response?.data?.message || err.message, 'error');
        }
    };

    const toggleIntake = (id) => {
        setExpandedIntakes(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Group intakes by programme_type → program
    const groupedIntakes = useMemo(() => {
        const map = {};
        for (const intake of intakes) {
            const type = intake.programme_type_name || 'Other';
            const prog = intake.program_name || 'Unassigned';
            if (!map[type]) map[type] = {};
            if (!map[type][prog]) map[type][prog] = [];
            map[type][prog].push(intake);
        }
        return map;
    }, [intakes]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Programme Intakes</h1>
                    <p className="text-sm text-gray-500">
                        Manage student intake batches. Each intake creates a Moodle cohort and registers all courses in the programme.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleOpenAddForm}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-scl-purple text-white hover:bg-scl-purple/90 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Intake
                    </button>
                    <button
                        onClick={fetchData}
                        className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800"
                    >
                        <RefreshCw className="w-4 h-4 inline mr-1" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between ${
                    messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                    messageType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                    'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                    <span>{message}</span>
                    <button onClick={() => setMessage('')}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Add Intake Form */}
            {showAddForm && (
                <div className="bg-white border-2 border-scl-purple/30 rounded-xl p-6 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">Create New Intake</h2>
                    <p className="text-sm text-gray-500">
                        Select the programme and intake period. All courses in this programme will be automatically registered and synced to Moodle.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Programme Type</label>
                            <select
                                value={intakeForm.programme_type_name}
                                onChange={(e) => setIntakeForm(prev => ({ ...prev, programme_type_name: e.target.value, program_name: '' }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-scl-purple focus:ring-2 focus:ring-scl-purple/20"
                            >
                                <option value="">Select Programme Type</option>
                                {programmeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Programme</label>
                            <select
                                value={intakeForm.program_name}
                                onChange={(e) => setIntakeForm(prev => ({ ...prev, program_name: e.target.value }))}
                                disabled={!intakeForm.programme_type_name}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-scl-purple focus:ring-2 focus:ring-scl-purple/20 ${!intakeForm.programme_type_name ? 'opacity-50' : ''}`}
                            >
                                <option value="">{intakeForm.programme_type_name ? 'Select Programme' : 'Select Type first'}</option>
                                {programs.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Intake Label</label>
                            <input
                                value={intakeForm.intake_label}
                                onChange={(e) => setIntakeForm(prev => ({ ...prev, intake_label: e.target.value }))}
                                placeholder="e.g. Sep-2025"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-scl-purple focus:ring-2 focus:ring-scl-purple/20"
                            />
                            <p className="text-xs text-gray-500 mt-1">The intake month and year, e.g. Sep-2025</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Start Date (optional)</label>
                            <input
                                type="date"
                                value={intakeForm.intake_start_date}
                                onChange={(e) => setIntakeForm(prev => ({ ...prev, intake_start_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">End Date (optional)</label>
                            <input
                                type="date"
                                value={intakeForm.intake_end_date}
                                onChange={(e) => setIntakeForm(prev => ({ ...prev, intake_end_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleCreateIntake}
                            disabled={addingIntake}
                            className="px-5 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {addingIntake ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Intake & Sync to Moodle'}
                        </button>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-scl-purple" />
                    <p className="text-sm text-gray-500 mt-2">Loading intakes...</p>
                </div>
            ) : intakes.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                    <CircleDashed className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 font-semibold">No intakes created yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Click "Add Intake" to create a student batch for a programme. All courses in that programme will be registered automatically.
                    </p>
                </div>
            ) : (
                /* Grouped intake cards */
                <div className="space-y-6">
                    {Object.entries(groupedIntakes).sort(([a], [b]) => a.localeCompare(b)).map(([typeName, programs]) => (
                        <div key={typeName} className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">{typeName}</h2>

                            {Object.entries(programs).sort(([a], [b]) => a.localeCompare(b)).map(([progName, progIntakes]) => (
                                <div key={`${typeName}-${progName}`} className="space-y-3 ml-2">
                                    <h3 className="text-sm font-semibold text-scl-purple uppercase tracking-wide">{progName}</h3>

                                    {progIntakes.map(intake => {
                                        const isExpanded = expandedIntakes[intake.id];
                                        const courses = intake.courses || [];
                                        const syncedCount = courses.filter(c => c.moodle_sync_status === 'synced').length;
                                        const isSyncing = syncingIntakeId === intake.id;

                                        // Group courses by Year → Semester
                                        const coursesByYearSem = {};
                                        for (const c of courses) {
                                            const yr = c.academic_year || 'Unknown Year';
                                            const sem = c.semester_name || 'Unknown Semester';
                                            if (!coursesByYearSem[yr]) coursesByYearSem[yr] = {};
                                            if (!coursesByYearSem[yr][sem]) coursesByYearSem[yr][sem] = [];
                                            coursesByYearSem[yr][sem].push(c);
                                        }

                                        return (
                                            <div key={intake.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                                {/* Intake header */}
                                                <div
                                                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={() => toggleIntake(intake.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-base font-bold text-gray-900">
                                                                    Intake: {intake.intake_label}
                                                                </span>
                                                                {badge(intake.status, intake.status)}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {courses.length} course{courses.length !== 1 ? 's' : ''} · {syncedCount}/{courses.length} synced to Moodle
                                                                {intake.moodle_cohort_idnumber && <> · Cohort: <code className="bg-gray-100 px-1 rounded">{intake.moodle_cohort_idnumber}</code></>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => handleSyncIntake(intake.id)}
                                                            disabled={isSyncing}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-scl-purple text-white hover:bg-scl-purple/90 disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                                            Sync All
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteIntake(intake.id, intake.intake_label)}
                                                            className="px-2 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50"
                                                            title="Delete intake"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Expanded: course list grouped by Year → Semester */}
                                                {isExpanded && (
                                                    <div className="border-t border-gray-200 px-5 py-4 space-y-4 bg-gray-50/50">
                                                        {courses.length === 0 ? (
                                                            <p className="text-sm text-gray-500 italic">
                                                                No courses found. Make sure courses exist in Course Master for this programme.
                                                            </p>
                                                        ) : (
                                                            Object.entries(coursesByYearSem).sort(([a], [b]) => a.localeCompare(b)).map(([yr, semesters]) => (
                                                                <div key={yr} className="space-y-2">
                                                                    <h4 className="text-sm font-bold text-gray-700">{yr}</h4>
                                                                    {Object.entries(semesters).sort(([a], [b]) => a.localeCompare(b)).map(([sem, semCourses]) => (
                                                                        <div key={`${yr}-${sem}`} className="ml-4 space-y-1">
                                                                            <p className="text-xs font-semibold text-gray-500 uppercase">{sem}</p>
                                                                            {semCourses.map(course => (
                                                                                <div key={course.id} className="flex items-center justify-between py-1.5 px-3 bg-white rounded-lg border border-gray-100">
                                                                                    <div className="flex items-center gap-2">
                                                                                        {syncIcon(course.moodle_sync_status)}
                                                                                        <span className="text-sm font-medium text-gray-900">{course.course_title}</span>
                                                                                        <span className="text-xs text-gray-400">{course.course_code}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        {badge(course.moodle_sync_status || 'pending', course.moodle_sync_status || 'pending')}
                                                                                        {course.moodle_course_id && (
                                                                                            <span className="text-xs text-gray-400">Moodle #{course.moodle_course_id}</span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProgrammeIntakes;
