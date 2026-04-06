import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CourseMasterDetail = () => {
    const navigate = useNavigate();
    
    // Hierarchy state
    const [hierarchy, setHierarchy] = useState(null);
    const [selectedTypeId, setSelectedTypeId] = useState(null);
    const [selectedProgramId, setSelectedProgramId] = useState(null);
    const [selectedYearId, setSelectedYearId] = useState(null);
    const [selectedSemesterId, setSelectedSemesterId] = useState(null);

    // Form inputs
    const [courseTitle, setCourseTitle] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [awardingBody, setAwardingBody] = useState('');
    const [version, setVersion] = useState('1.0');

    // Modal state
    const [modal, setModal] = useState(null); // 'type', 'program', 'year', 'semester'
    const [modalInput, setModalInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch hierarchy on load
    useEffect(() => {
        fetchHierarchy();
    }, []);

    const fetchHierarchy = async () => {
        try {
            const res = await axios.get(`${API_URL}/students/moodle/category-hierarchy?include_inactive=false`);
            setHierarchy(res.data?.data?.programme_types || []);
        } catch (err) {
            console.error('Failed to fetch hierarchy:', err);
            setError('Failed to load category hierarchy');
        }
    };

    // Get available options at each level
    const types = useMemo(() => hierarchy || [], [hierarchy]);
    
    const programs = useMemo(() => {
        const type = types.find(t => t.id === selectedTypeId);
        return type?.programs || [];
    }, [types, selectedTypeId]);

    const years = useMemo(() => {
        const program = programs.find(p => p.id === selectedProgramId);
        return program?.years || [];
    }, [programs, selectedProgramId]);

    const semesters = useMemo(() => {
        const year = years.find(y => y.id === selectedYearId);
        return year?.semesters || [];
    }, [years, selectedYearId]);

    // Get selected names for display
    const selectedType = types.find(t => t.id === selectedTypeId);
    const selectedProgram = programs.find(p => p.id === selectedProgramId);
    const selectedYear = years.find(y => y.id === selectedYearId);
    const selectedSemester = semesters.find(s => s.id === selectedSemesterId);

    const handleCreateCategory = async () => {
        if (!modalInput.trim()) {
            setError('Please enter a name');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const getParentId = () => {
                if (modal === 'type') return 0; // Root
                if (modal === 'program') return selectedTypeId;
                if (modal === 'year') return selectedProgramId;
                if (modal === 'semester') return selectedYearId;
            };

            const parentId = getParentId();
            if (modal !== 'type' && !parentId) {
                setError(`Please select a ${modal === 'program' ? 'Type' : modal === 'year' ? 'Program' : 'Year'} first`);
                return;
            }

            const payload = {
                name: modalInput.trim(),
                level: modal,
                parent_category_id: modal === 'type' ? undefined : parentId
            };

            const res = await axios.post(`${API_URL}/students/moodle/create-level-category`, payload);
            
            if (res.data?.success) {
                const newId = res.data.data[`${modal}_category_id`];
                
                // Update selection based on what was created
                if (modal === 'type') {
                    setSelectedTypeId(newId);
                } else if (modal === 'program') {
                    setSelectedProgramId(newId);
                } else if (modal === 'year') {
                    setSelectedYearId(newId);
                } else if (modal === 'semester') {
                    setSelectedSemesterId(newId);
                }

                // Refresh hierarchy
                await fetchHierarchy();
                setModal(null);
                setModalInput('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create category');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCourse = async (e) => {
        e.preventDefault();
        
        if (!courseTitle.trim() || !courseCode.trim()) {
            setError('Course title and code are required');
            return;
        }

        if (!selectedTypeId || !selectedProgramId || !selectedYearId || !selectedSemesterId) {
            setError('Please select all hierarchy levels');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const payload = {
                course_title: courseTitle.trim(),
                course_code: courseCode.trim(),
                programme_type_name: selectedType?.name,
                program_name: selectedProgram?.name,
                academic_year: selectedYear?.name,
                semester_name: selectedSemester?.name,
                awarding_body: awardingBody.trim(),
                version: version.trim(),
                programme_type_category_id: selectedTypeId,
                program_category_id: selectedProgramId,
                year_category_id: selectedYearId,
                semester_category_id: selectedSemesterId
            };

            const res = await axios.post(`${API_URL}/accreditations/master-courses`, payload);
            
            if (res.data?.success) {
                navigate('/course-master');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <button
                onClick={() => navigate('/course-master')}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Course Master
            </button>

            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-2 text-slate-900">Create New Course</h1>
                <p className="text-slate-600 mb-8">Build the hierarchy and course details step by step</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* HIERARCHY SELECTION */}
                <div className="space-y-6 mb-8">
                    <div className="border-b border-slate-200 pb-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">1. Select or Create Programme Type</h2>
                        <div className="flex gap-2">
                            <select
                                value={selectedTypeId || ''}
                                onChange={(e) => {
                                    const id = e.target.value ? Number(e.target.value) : null;
                                    setSelectedTypeId(id);
                                    setSelectedProgramId(null);
                                    setSelectedYearId(null);
                                    setSelectedSemesterId(null);
                                }}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">-- Select Type --</option>
                                {types.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => { setModal('type'); setModalInput(''); }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> New
                            </button>
                        </div>
                        {selectedType && (
                            <p className="mt-2 text-sm text-green-600">✓ Selected: {selectedType.name}</p>
                        )}
                    </div>

                    {selectedTypeId && (
                        <div className="border-b border-slate-200 pb-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">2. Select or Create Program</h2>
                            <div className="flex gap-2">
                                <select
                                    value={selectedProgramId || ''}
                                    onChange={(e) => {
                                        const id = e.target.value ? Number(e.target.value) : null;
                                        setSelectedProgramId(id);
                                        setSelectedYearId(null);
                                        setSelectedSemesterId(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">-- Select Program --</option>
                                    {programs.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => { setModal('program'); setModalInput(''); }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> New
                                </button>
                            </div>
                            {selectedProgram && (
                                <p className="mt-2 text-sm text-green-600">✓ Selected: {selectedProgram.name}</p>
                            )}
                        </div>
                    )}

                    {selectedProgramId && (
                        <div className="border-b border-slate-200 pb-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">3. Select or Create Academic Year</h2>
                            <div className="flex gap-2">
                                <select
                                    value={selectedYearId || ''}
                                    onChange={(e) => {
                                        const id = e.target.value ? Number(e.target.value) : null;
                                        setSelectedYearId(id);
                                        setSelectedSemesterId(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">-- Select Year --</option>
                                    {years.map(y => (
                                        <option key={y.id} value={y.id}>{y.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => { setModal('year'); setModalInput(''); }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> New
                                </button>
                            </div>
                            {selectedYear && (
                                <p className="mt-2 text-sm text-green-600">✓ Selected: {selectedYear.name}</p>
                            )}
                        </div>
                    )}

                    {selectedYearId && (
                        <div className="border-b border-slate-200 pb-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">4. Select or Create Semester</h2>
                            <div className="flex gap-2">
                                <select
                                    value={selectedSemesterId || ''}
                                    onChange={(e) => setSelectedSemesterId(e.target.value ? Number(e.target.value) : null)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">-- Select Semester --</option>
                                    {semesters.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => { setModal('semester'); setModalInput(''); }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> New
                                </button>
                            </div>
                            {selectedSemester && (
                                <p className="mt-2 text-sm text-green-600">✓ Selected: {selectedSemester.name}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* COURSE DETAILS */}
                {selectedSemesterId && (
                    <form onSubmit={handleSaveCourse} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Course Title *</label>
                            <input
                                type="text"
                                value={courseTitle}
                                onChange={(e) => setCourseTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter course title"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Course Code *</label>
                            <input
                                type="text"
                                value={courseCode}
                                onChange={(e) => setCourseCode(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter course code"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Awarding Body</label>
                            <input
                                type="text"
                                value={awardingBody}
                                onChange={(e) => setAwardingBody(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter awarding body"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Version</label>
                            <input
                                type="text"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
                        >
                            {loading ? 'Saving...' : 'Create Course'}
                        </button>
                    </form>
                )}

                {/* MODAL FOR CREATING NEW CATEGORIES */}
                {modal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900">
                                Create New {modal === 'type' ? 'Programme Type' : modal === 'program' ? 'Program' : modal === 'year' ? 'Academic Year' : 'Semester'}
                            </h3>
                            <input
                                type="text"
                                value={modalInput}
                                onChange={(e) => setModalInput(e.target.value)}
                                placeholder={`Enter ${modal} name`}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setModal(null)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateCategory}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                    {loading ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseMasterDetail;
