import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown, ChevronUp, Save, X, Plus, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const sections = [
    { num: 1, title: 'Initial Planning & Approval' },
    { num: 2, title: 'Application Preparation' },
    { num: 3, title: 'Submission & Engagement' },
    { num: 4, title: 'Institutional Visit & Validation' },
    { num: 5, title: 'Agreement & Implementation' },
    { num: 6, title: 'Post-Approval Monitoring' },
    { num: 7, title: 'Risk & Issue Log' },
    { num: 8, title: 'Sign-off' }
];

const CourseAccreditationDetail = ({ user }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isNew = !id || id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});

    // Document Control
    const [documentControl, setDocumentControl] = useState({
        course_title: '',
        awarding_body: '',
        application_type: '',
        expected_submission_date: '',
        lead_coordinator: '',
        version: '1.0',
        last_updated: new Date().toISOString().split('T')[0]
    });

    // Form data for each section
    const [sectionData, setSectionData] = useState({});

    // Risk & Issue Log (Section 7)
    const [risks, setRisks] = useState([]);
    const [newRisk, setNewRisk] = useState({
        impact: '',
        mitigation: '',
        owner: '',
        review_date: '',
        status: 'Open'
    });

    // Sign-offs (Section 8)
    const [signoffs, setSignoffs] = useState([]);
    const [newSignoff, setNewSignoff] = useState({
        name: '',
        role: '',
        sign_date: ''
    });

    useEffect(() => {
        if (!isNew) {
            fetchAccreditationDetail();
        } else {
            // Initialize all sections as empty
            sections.forEach(section => {
                setSectionData(prev => ({
                    ...prev,
                    [section.num]: []
                }));
            });
        }
    }, [id]);

    const fetchAccreditationDetail = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/accreditations/${id}`);
            const data = response.data?.data;

            if (data) {
                setDocumentControl(data.documentControl || {});
                setSectionData(data.sections || {});
                setRisks(data.risks || []);
                setSignoffs(data.signoffs || []);
            }
        } catch (err) {
            console.error('Failed to fetch accreditation:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (sectionNum) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionNum]: !prev[sectionNum]
        }));
    };

    const handleDocumentControlChange = (field, value) => {
        setDocumentControl(prev => ({
            ...prev,
            [field]: value,
            last_updated: new Date().toISOString().split('T')[0]
        }));
    };

    const handleSectionTaskChange = (sectionNum, taskIndex, field, value) => {
        setSectionData(prev => {
            const updatedSection = [...(prev[sectionNum] || [])];
            if (!updatedSection[taskIndex]) {
                updatedSection[taskIndex] = {};
            }
            updatedSection[taskIndex][field] = value;
            return {
                ...prev,
                [sectionNum]: updatedSection
            };
        });
    };

    const addTaskToSection = (sectionNum) => {
        setSectionData(prev => ({
            ...prev,
            [sectionNum]: [
                ...(prev[sectionNum] || []),
                {
                    description: '',
                    evidence_required: '',
                    source_reference: '',
                    responsible_person: '',
                    due_date: '',
                    status: 'Not Started',
                    notes: ''
                }
            ]
        }));
    };

    const removeTaskFromSection = (sectionNum, taskIndex) => {
        setSectionData(prev => {
            const updatedSection = prev[sectionNum].filter((_, i) => i !== taskIndex);
            return {
                ...prev,
                [sectionNum]: updatedSection
            };
        });
    };

    const addRisk = () => {
        if (newRisk.impact && newRisk.mitigation && newRisk.owner) {
            setRisks([...risks, { ...newRisk, id: Date.now() }]);
            setNewRisk({ impact: '', mitigation: '', owner: '', review_date: '', status: 'Open' });
        }
    };

    const removeRisk = (riskId) => {
        setRisks(risks.filter(r => r.id !== riskId));
    };

    const addSignoff = () => {
        if (newSignoff.name && newSignoff.role) {
            setSignoffs([...signoffs, { ...newSignoff, id: Date.now() }]);
            setNewSignoff({ name: '', role: '', sign_date: '' });
        }
    };

    const removeSignoff = (signoffId) => {
        setSignoffs(signoffs.filter(s => s.id !== signoffId));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                documentControl,
                sections: sectionData,
                risks,
                signoffs
            };

            if (isNew) {
                await axios.post(`${API_URL}/accreditations`, payload);
            } else {
                await axios.put(`${API_URL}/accreditations/${id}`, payload);
            }

            navigate('/course-accreditations');
        } catch (err) {
            console.error('Failed to save:', err);
            alert('Failed to save accreditation: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="animate-spin">⏳</div></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isNew ? 'New Course Accreditation' : 'Edit Accreditation'}
                    </h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/course-accreditations')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                        >
                            <X className="w-4 h-4 inline mr-2" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-scl-purple text-white rounded-lg hover:bg-scl-purple/90 font-semibold disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 inline mr-2" />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Document Control Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">📄 Document Control</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Title *</label>
                            <input
                                type="text"
                                value={documentControl.course_title}
                                onChange={(e) => handleDocumentControlChange('course_title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                placeholder="Enter course title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Awarding Body / University</label>
                            <input
                                type="text"
                                value={documentControl.awarding_body}
                                onChange={(e) => handleDocumentControlChange('awarding_body', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                placeholder="e.g. University, Awarding Body"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Application Type</label>
                            <input
                                type="text"
                                value={documentControl.application_type}
                                onChange={(e) => handleDocumentControlChange('application_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                placeholder="e.g. New, Reaccreditation, Partnership"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Expected Submission Date</label>
                            <input
                                type="date"
                                value={documentControl.expected_submission_date}
                                onChange={(e) => handleDocumentControlChange('expected_submission_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Lead Coordinator</label>
                            <input
                                type="text"
                                value={documentControl.lead_coordinator}
                                onChange={(e) => handleDocumentControlChange('lead_coordinator', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                placeholder="Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Version</label>
                            <input
                                type="text"
                                value={documentControl.version}
                                onChange={(e) => handleDocumentControlChange('version', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                        Last Updated: {documentControl.last_updated}
                    </div>
                </div>

                {/* Numbered Sections 1-6 */}
                {sections.slice(0, 6).map(section => (
                    <div key={section.num} className="bg-white rounded-lg border border-gray-200 mb-4 shadow-sm">
                        <button
                            onClick={() => toggleSection(section.num)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                        >
                            <h3 className="text-lg font-bold text-gray-900">
                                Section {section.num} – {section.title}
                            </h3>
                            {expandedSections[section.num] ? (
                                <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                        </button>

                        {expandedSections[section.num] && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="space-y-4">
                                    {(sectionData[section.num] || []).map((task, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Task / Requirement</label>
                                                    <input
                                                        type="text"
                                                        value={task.description || ''}
                                                        onChange={(e) => handleSectionTaskChange(section.num, idx, 'description', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder="Describe the task"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                                                    <select
                                                        value={task.status || 'Not Started'}
                                                        onChange={(e) => handleSectionTaskChange(section.num, idx, 'status', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                    >
                                                        <option>Not Started</option>
                                                        <option>In Progress</option>
                                                        <option>Completed</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Evidence Required</label>
                                                    <input
                                                        type="text"
                                                        value={task.evidence_required || ''}
                                                        onChange={(e) => handleSectionTaskChange(section.num, idx, 'evidence_required', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder="What evidence"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Source / Reference</label>
                                                    <input
                                                        type="text"
                                                        value={task.source_reference || ''}
                                                        onChange={(e) => handleSectionTaskChange(section.num, idx, 'source_reference', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder="Source"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Responsible Person</label>
                                                    <input
                                                        type="text"
                                                        value={task.responsible_person || ''}
                                                        onChange={(e) => handleSectionTaskChange(section.num, idx, 'responsible_person', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder="Person"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date</label>
                                                    <input
                                                        type="date"
                                                        value={task.due_date || ''}
                                                        onChange={(e) => handleSectionTaskChange(section.num, idx, 'due_date', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes / Progress</label>
                                                <textarea
                                                    value={task.notes || ''}
                                                    onChange={(e) => handleSectionTaskChange(section.num, idx, 'notes', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                    rows="2"
                                                    placeholder="Notes"
                                                />
                                            </div>

                                            <button
                                                onClick={() => removeTaskFromSection(section.num, idx)}
                                                className="text-red-500 hover:text-red-700 text-sm font-semibold"
                                            >
                                                <Trash2 className="w-4 h-4 inline mr-1" />
                                                Remove
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => addTaskToSection(section.num)}
                                        className="w-full px-4 py-2 border-2 border-dashed border-scl-purple text-scl-purple rounded-lg hover:bg-scl-purple/5 font-semibold"
                                    >
                                        <Plus className="w-4 h-4 inline mr-2" />
                                        Add Task
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Section 7 - Risk & Issue Log */}
                <div className="bg-white rounded-lg border border-gray-200 mb-4 shadow-sm">
                    <button
                        onClick={() => toggleSection(7)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                        <h3 className="text-lg font-bold text-gray-900">Section 7 – Risk & Issue Log</h3>
                        {expandedSections[7] ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    {expandedSections[7] && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="space-y-4">
                                {risks.map((risk) => (
                                    <div key={risk.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Risk / Issue</label>
                                                <input type="text" value={risk.impact} readOnly className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                                                <select
                                                    value={risk.status}
                                                    onChange={(e) => {
                                                        const updated = risks.map(r => r.id === risk.id ? { ...r, status: e.target.value } : r);
                                                        setRisks(updated);
                                                    }}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                >
                                                    <option>Open</option>
                                                    <option>In Progress</option>
                                                    <option>Resolved</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Owner</label>
                                                <input type="text" value={risk.owner} readOnly className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Review Date</label>
                                                <input type="date" value={risk.review_date} readOnly className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100" />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Mitigation</label>
                                            <textarea value={risk.mitigation} readOnly className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100" rows="2" />
                                        </div>
                                        <button onClick={() => removeRisk(risk.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                                            <Trash2 className="w-4 h-4 inline mr-1" />
                                            Remove
                                        </button>
                                    </div>
                                ))}

                                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                                    <h4 className="font-semibold text-gray-900 mb-3">Add Risk</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <input
                                            type="text"
                                            value={newRisk.impact}
                                            onChange={(e) => setNewRisk({ ...newRisk, impact: e.target.value })}
                                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="Risk"
                                        />
                                        <input
                                            type="text"
                                            value={newRisk.owner}
                                            onChange={(e) => setNewRisk({ ...newRisk, owner: e.target.value })}
                                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="Owner"
                                        />
                                    </div>
                                    <textarea
                                        value={newRisk.mitigation}
                                        onChange={(e) => setNewRisk({ ...newRisk, mitigation: e.target.value })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-3"
                                        rows="2"
                                        placeholder="Mitigation"
                                    />
                                    <input
                                        type="date"
                                        value={newRisk.review_date}
                                        onChange={(e) => setNewRisk({ ...newRisk, review_date: e.target.value })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-3"
                                    />
                                    <button onClick={addRisk} className="px-4 py-2 bg-scl-purple text-white rounded text-sm font-semibold">
                                        <Plus className="w-4 h-4 inline mr-1" />
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 8 - Sign-offs */}
                <div className="bg-white rounded-lg border border-gray-200 mb-4 shadow-sm">
                    <button
                        onClick={() => toggleSection(8)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                        <h3 className="text-lg font-bold text-gray-900">Section 8 – Sign-off</h3>
                        {expandedSections[8] ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    {expandedSections[8] && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="space-y-4">
                                {signoffs.map((signoff) => (
                                    <div key={signoff.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                            <input type="text" value={signoff.name} readOnly className="px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100" />
                                            <input type="text" value={signoff.role} readOnly className="px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100" />
                                            <input type="date" value={signoff.sign_date} readOnly className="px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100" />
                                        </div>
                                        <button onClick={() => removeSignoff(signoff.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                                            <Trash2 className="w-4 h-4 inline mr-1" />
                                            Remove
                                        </button>
                                    </div>
                                ))}

                                <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                                    <h4 className="font-semibold text-gray-900 mb-3">Add Sign-off</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                        <input
                                            type="text"
                                            value={newSignoff.name}
                                            onChange={(e) => setNewSignoff({ ...newSignoff, name: e.target.value })}
                                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="Name"
                                        />
                                        <input
                                            type="text"
                                            value={newSignoff.role}
                                            onChange={(e) => setNewSignoff({ ...newSignoff, role: e.target.value })}
                                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                                            placeholder="Role"
                                        />
                                        <input
                                            type="date"
                                            value={newSignoff.sign_date}
                                            onChange={(e) => setNewSignoff({ ...newSignoff, sign_date: e.target.value })}
                                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                                        />
                                    </div>
                                    <button onClick={addSignoff} className="px-4 py-2 bg-scl-purple text-white rounded text-sm font-semibold">
                                        <Plus className="w-4 h-4 inline mr-1" />
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={() => navigate('/course-accreditations')}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-scl-purple text-white rounded-lg hover:bg-scl-purple/90 font-semibold disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 inline mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseAccreditationDetail;
