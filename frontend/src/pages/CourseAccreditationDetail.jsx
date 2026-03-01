import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const SECTION_CONFIG = {
    1: {
        title: 'Initial Planning & Approval',
        tasks: [
            { area: 'Strategic Fit Assessment', description: 'Confirm course/partnership aligns with college mission & market need' },
            { area: 'Governing Body Approval in Principle', description: 'Formal approval to proceed' },
            { area: 'Gap Analysis', description: 'Compare college capabilities vs. awarding body requirements' },
            { area: 'Resource Plan', description: 'Staffing, facilities, budget needs' }
        ]
    },
    2: {
        title: 'Application Preparation',
        tasks: [
            { area: 'Identify Target Institution', description: 'Research and confirm most suitable awarding body' },
            { area: 'Institutional Profile Document', description: 'History, governance, quality systems, financial stability' },
            { area: 'Programme Specification', description: 'Approved content, LOs, mapping to framework' },
            { area: 'Assessment Strategy', description: 'Weightings, moderation, external examiner' },
            { area: 'Staff CVs & Qualifications', description: 'To meet awarding body standards' }
        ]
    },
    3: {
        title: 'Submission & Engagement',
        tasks: [
            { area: 'Pre-Application Contact', description: 'Initial discussion with awarding body' },
            { area: 'Application Dossier Compilation', description: 'Assemble all documents in required format' },
            { area: 'Formal Submission', description: 'Submit application and confirm receipt' },
            { area: 'Partner Queries Response', description: 'Clarifications and additional requests' }
        ]
    },
    4: {
        title: 'Review, Visits & Validation',
        tasks: [
            { area: 'Institutional Approval Visit', description: 'Arrange and host awarding body visit' },
            { area: 'Course Validation Event', description: 'Attend and present course proposal' },
            { area: 'Response to Conditions', description: 'Implement and document required changes' }
        ]
    },
    5: {
        title: 'Agreement & Implementation',
        tasks: [
            { area: 'Contract Review', description: 'Legal review of agreement terms' },
            { area: 'Marketing & Recruitment Plan', description: 'Joint plan with partner' },
            { area: 'Staff Briefing & Training', description: 'Induction on partner processes' },
            { area: 'Launch Readiness Check', description: 'All requirements met before first intake' }
        ]
    },
    6: {
        title: 'Post-Approval Monitoring',
        tasks: [
            { area: 'Annual Monitoring Report Submission', description: 'Required by partner' },
            { area: 'Partnership Review Meetings', description: 'Periodic progress meetings' },
            { area: 'Policy Alignment Updates', description: 'Ensure ongoing compliance' }
        ]
    },
    7: {
        title: 'Risk & Issue Log',
        tasks: [
            { area: 'Risk / Issue', description: 'Describe the risk or issue' }
        ]
    },
    8: {
        title: 'Sign-off',
        tasks: [
            { area: 'Lead Coordinator', description: 'Approval by Lead Coordinator' },
            { area: 'QA Manager', description: 'Approval by QA Manager' },
            { area: 'Principal / CEO', description: 'Approval by Principal / CEO' }
        ]
    }
};

const CourseAccreditationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';
    
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [expandedSections, setExpandedSections] = useState({ 1: true });
    const [editingRowIdx, setEditingRowIdx] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const sourceInputRef = useRef(null);
    const evidenceInputRef = useRef(null);
    const [currentForm, setCurrentForm] = useState({
        area: '',
        description: '',
        source: '',
        evidence: '',
        responsible: '',
        status: false,
        notes: ''
    });
    const [formData, setFormData] = useState({
        course_title: '',
        course_code: '',
        awarding_body: '',
        application_type: '',
        date_started: '',
        expected_submission_date: '',
        lead_coordinator: '',
        version: '1.0',
        sections: {}
    });

    useEffect(() => {
        if (!isNew) {
            fetchAccreditation();
        } else {
            initializeNewForm();
        }
    }, [id]);

    const initializeNewForm = () => {
        const sections = {};
        for (let i = 1; i <= 8; i++) {
            sections[i] = [];
        }
        setFormData(prev => ({ ...prev, sections }));
    };

    const fetchAccreditation = async () => {
        try {
            const response = await axios.get(`${API_URL}/accreditations/${id}`);
            const bundle = response.data?.data;
            
            if (!bundle || !bundle.accreditation) {
                throw new Error('Invalid data structure');
            }
            
            const accreditation = bundle.accreditation;
            const tasks = bundle.tasks || [];
            
            // Group tasks by section_number
            const sectionsByNum = {};
            for (let i = 1; i <= 8; i++) {
                sectionsByNum[i] = [];
            }
            
            tasks.forEach(task => {
                const sectionNum = task.section_number || 1;
                if (sectionsByNum[sectionNum]) {
                    sectionsByNum[sectionNum].push({
                        id: task.id,
                        area: task.task_name || '',
                        description: task.description || '',
                        source: task.source_reference || '',
                        evidence: task.evidence_required || '',
                        responsible: task.responsible_person || '',
                        status: task.status === 'Completed',
                        notes: task.notes || ''
                    });
                }
            });
            
            setFormData({
                course_title: accreditation.course_title || '',
                course_code: accreditation.course_code || '',
                awarding_body: accreditation.awarding_body || '',
                application_type: accreditation.application_type || '',
                date_started: accreditation.date_started || '',
                expected_submission_date: accreditation.expected_submission_date || '',
                lead_coordinator: accreditation.lead_coordinator || '',
                version: accreditation.version || '1.0',
                sections: sectionsByNum
            });
        } catch (err) {
            console.error('Failed to fetch accreditation:', err);
            alert('Error loading accreditation data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            let accreditationId = id;

            // Step 1: Save/Update the accreditation header
            if (isNew) {
                const response = await axios.post(`${API_URL}/accreditations`, formData);
                accreditationId = response.data.data.id;
            } else {
                await axios.put(`${API_URL}/accreditations/${accreditationId}`, formData);
            }

            // Step 2: Save all tasks for each section
            for (let sectionNum = 1; sectionNum <= 8; sectionNum++) {
                let tasks = formData.sections[sectionNum] || [];
                
                // Deduplicate tasks before saving
                const seen = new Set();
                tasks = tasks.filter(task => {
                    if (!task.area) return false;
                    const key = `${task.area}|${task.responsible}|${task.description}`;
                    if (seen.has(key)) {
                        console.warn('Duplicate task detected and skipped:', key);
                        return false;
                    }
                    seen.add(key);
                    return true;
                });
                
                for (const task of tasks) {
                    const taskData = {
                        section_number: sectionNum,
                        section_title: SECTION_CONFIG[sectionNum].title,
                        task_name: task.area,
                        description: task.description,
                        evidence_required: task.evidence,
                        source_reference: task.source,
                        responsible_person: task.responsible,
                        status: task.status ? 'Completed' : 'Not Started',
                        notes: task.notes
                    };

                    if (task.id) {
                        await axios.put(
                            `${API_URL}/accreditations/${accreditationId}/tasks/${task.id}`,
                            taskData
                        );
                    } else {
                        await axios.post(
                            `${API_URL}/accreditations/${accreditationId}/tasks`,
                            taskData
                        );
                    }
                }
            }

            navigate('/course-accreditations');
        } catch (err) {
            console.error('Failed to save:', err);
            alert('Error saving accreditation');
        } finally {
            setSaving(false);
        }
    };

    const toggleSection = (num) => {
        setExpandedSections(prev => ({
            ...prev,
            [num]: !prev[num]
        }));
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddTask = (sectionNum) => {
        if (!currentForm.area) {
            alert('Please select a task area');
            return;
        }
        
        setFormData(prev => {
            const newData = { ...prev };
            if (!newData.sections[sectionNum]) {
                newData.sections[sectionNum] = [];
            }
            
            if (editingRowIdx !== null && editingSection === sectionNum) {
                const existingId = newData.sections[sectionNum][editingRowIdx]?.id;
                newData.sections[sectionNum][editingRowIdx] = { 
                    ...currentForm,
                    id: existingId
                };
            } else {
                const alreadyExists = newData.sections[sectionNum].some(
                    task => task.area === currentForm.area && task.responsible === currentForm.responsible
                );
                
                if (alreadyExists) {
                    alert('This task already exists in this section');
                    return newData;
                }
                
                const newTask = { 
                    ...currentForm,
                    tempId: `temp_${Date.now()}_${Math.random()}`
                };
                newData.sections[sectionNum].push(newTask);
            }
            return newData;
        });
        
        handleFormReset();
    };

    const handleEditTask = (sectionNum, rowIdx) => {
        setCurrentForm(formData.sections[sectionNum][rowIdx]);
        setEditingRowIdx(rowIdx);
        setEditingSection(sectionNum);
    };

    const handleDeleteTask = (sectionNum, rowIdx) => {
        setFormData(prev => {
            const newData = { ...prev };
            const deletedTask = newData.sections[sectionNum][rowIdx];
            
            if (deletedTask.id && !isNew) {
                axios.delete(`${API_URL}/accreditations/${id}/tasks/${deletedTask.id}`)
                    .catch(err => console.error('Failed to delete task from database:', err));
            }
            
            newData.sections[sectionNum].splice(rowIdx, 1);
            return newData;
        });
    };

    const handleFormReset = () => {
        setCurrentForm({
            area: '',
            description: '',
            source: '',
            evidence: '',
            responsible: '',
            status: false,
            notes: ''
        });
        if (sourceInputRef.current) sourceInputRef.current.value = '';
        if (evidenceInputRef.current) evidenceInputRef.current.value = '';
        setEditingRowIdx(null);
        setEditingSection(null);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/course-accreditations')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isNew ? 'New Accreditation' : 'Edit Accreditation'}
                            </h1>
                            <p className="text-sm text-gray-600">Fill in all the accreditation requirements</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* General Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Document Control - General Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Title *</label>
                            <input
                                type="text"
                                value={formData.course_title}
                                onChange={(e) => handleInputChange('course_title', e.target.value)}
                                disabled={!isNew}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent ${!isNew ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Code</label>
                            <input
                                type="text"
                                value={formData.course_code}
                                onChange={(e) => handleInputChange('course_code', e.target.value)}
                                disabled={!isNew}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent ${!isNew ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Awarding Body</label>
                            <input
                                type="text"
                                value={formData.awarding_body}
                                onChange={(e) => handleInputChange('awarding_body', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Application Type</label>
                            <select
                                value={formData.application_type}
                                onChange={(e) => handleInputChange('application_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            >
                                <option value="">Select...</option>
                                <option value="New Course Accreditation">New Course Accreditation</option>
                                <option value="Partnership Agreement">Partnership Agreement</option>
                                <option value="Revalidation">Revalidation</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Date Started</label>
                            <input
                                type="date"
                                value={formData.date_started}
                                onChange={(e) => handleInputChange('date_started', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Expected Submission Date</label>
                            <input
                                type="date"
                                value={formData.expected_submission_date}
                                onChange={(e) => handleInputChange('expected_submission_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Lead Coordinator</label>
                            <input
                                type="text"
                                value={formData.lead_coordinator}
                                onChange={(e) => handleInputChange('lead_coordinator', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Version</label>
                            <input
                                type="text"
                                value={formData.version}
                                onChange={(e) => handleInputChange('version', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Sections with Form and Table */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sectionNum => (
                    <div key={sectionNum} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => toggleSection(sectionNum)}
                            className="w-full px-6 py-4 bg-scl-purple/10 hover:bg-scl-purple/20 text-left font-semibold text-gray-900 flex items-center justify-between transition"
                        >
                            <span>Section {sectionNum}: {SECTION_CONFIG[sectionNum].title}</span>
                            {expandedSections[sectionNum] ? (
                                <ChevronUp className="w-5 h-5" />
                            ) : (
                                <ChevronDown className="w-5 h-5" />
                            )}
                        </button>

                        {expandedSections[sectionNum] && (
                            <div className="p-6 border-t border-gray-200">
                                {/* Form at Top */}
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                                        {editingRowIdx !== null && editingSection === sectionNum ? 'Edit Task' : 'Add New Task'}
                                    </h4>
                                    
                                    {/* Row 1: Task Area (full width) */}
                                    <div className="mb-2">
                                        <label className="block text-xs font-semibold text-gray-700 mb-0.5">Task Area *</label>
                                        <select
                                            value={currentForm.area}
                                            onChange={(e) => {
                                                const selectedTask = SECTION_CONFIG[sectionNum].tasks.find(t => t.area === e.target.value);
                                                setCurrentForm(prev => ({
                                                    ...prev,
                                                    area: e.target.value,
                                                    description: selectedTask?.description || ''
                                                }));
                                            }}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                        >
                                            <option value="">Select Area</option>
                                            {SECTION_CONFIG[sectionNum].tasks.map(task => (
                                                <option key={task.area} value={task.area}>{task.area}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Row 2: Description & Responsible Person */}
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold text-gray-700 mb-0.5">Description</label>
                                            <textarea
                                                value={currentForm.description}
                                                onChange={(e) => setCurrentForm(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder={SECTION_CONFIG[sectionNum].tasks.find(t => t.area === currentForm.area)?.description || 'Type description here...'}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                rows="2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-0.5">Responsible Person</label>
                                            <input
                                                type="text"
                                                value={currentForm.responsible}
                                                onChange={(e) => setCurrentForm(prev => ({ ...prev, responsible: e.target.value }))}
                                                placeholder="Name"
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Source & Evidence File Uploads */}
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-0.5">Source (File)</label>
                                            <input
                                                ref={sourceInputRef}
                                                type="file"
                                                onChange={(e) => setCurrentForm(prev => ({ ...prev, source: e.target.files ? e.target.files[0].name : '' }))}
                                                className="w-full text-xs"
                                            />
                                            {currentForm.source && <p className="text-xs text-gray-600 mt-0.5">✓ {currentForm.source.substring(0, 20)}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-0.5">Evidence (File)</label>
                                            <input
                                                ref={evidenceInputRef}
                                                type="file"
                                                onChange={(e) => setCurrentForm(prev => ({ ...prev, evidence: e.target.files ? e.target.files[0].name : '' }))}
                                                className="w-full text-xs"
                                            />
                                            {currentForm.evidence && <p className="text-xs text-gray-600 mt-0.5">✓ {currentForm.evidence.substring(0, 20)}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-0.5">Review Notes</label>
                                            <textarea
                                                value={currentForm.notes}
                                                onChange={(e) => setCurrentForm(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="Notes..."
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                rows="2"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 4: Status Checkbox & Buttons */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={currentForm.status}
                                                onChange={(e) => setCurrentForm(prev => ({ ...prev, status: e.target.checked }))}
                                                className="w-4 h-4"
                                            />
                                            <label className="text-xs font-semibold text-gray-700">Complete</label>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAddTask(sectionNum)}
                                                className="px-3 py-1 bg-scl-purple text-white rounded text-xs font-semibold hover:bg-scl-purple/90"
                                            >
                                                {editingRowIdx !== null && editingSection === sectionNum ? 'Update' : 'Add'}
                                            </button>
                                            {(editingRowIdx !== null || currentForm.area) && (
                                                <button
                                                    onClick={handleFormReset}
                                                    className="px-3 py-1 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Table at Bottom */}
                                {(formData.sections[sectionNum] || []).length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Task Area</th>
                                                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Description</th>
                                                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Responsible</th>
                                                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Status</th>
                                                    <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(formData.sections[sectionNum] || []).map((task, idx) => (
                                                    <tr key={task.id || task.tempId || idx} className="hover:bg-blue-50">
                                                        <td className="border border-gray-300 px-3 py-2 text-sm font-medium">{task.area}</td>
                                                        <td className="border border-gray-300 px-3 py-2 text-sm">{task.description.substring(0, 50)}...</td>
                                                        <td className="border border-gray-300 px-3 py-2 text-sm">{task.responsible}</td>
                                                        <td className="border border-gray-300 px-3 py-2 text-center">
                                                            {task.status ? <span className="text-green-600 font-semibold">✓</span> : <span className="text-gray-400">○</span>}
                                                        </td>
                                                        <td className="border border-gray-300 px-3 py-2 text-center">
                                                            <button
                                                                onClick={() => handleEditTask(sectionNum, idx)}
                                                                className="text-blue-500 hover:text-blue-700 font-semibold text-sm mr-2"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm('Delete this task?')) {
                                                                        handleDeleteTask(sectionNum, idx);
                                                                    }
                                                                }}
                                                                className="text-red-500 hover:text-red-700 font-semibold text-sm"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                    <button
                        onClick={() => navigate('/course-accreditations')}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-scl-purple text-white rounded-lg hover:bg-scl-purple/90 font-semibold disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : (isNew ? 'Create' : 'Save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseAccreditationDetail;
