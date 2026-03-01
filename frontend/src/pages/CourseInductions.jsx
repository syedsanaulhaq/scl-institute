import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    ClipboardList,
    Plus,
    Trash2,
    Edit2,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CourseInductions = ({ user }) => {
    const [inductions, setInductions] = useState([]);
    const [selectedInductionId, setSelectedInductionId] = useState(null);
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const [editingRequirement, setEditingRequirement] = useState(null);
    const [edits, setEdits] = useState({});

    useEffect(() => {
        fetchInductions();
    }, []);

    useEffect(() => {
        if (selectedInductionId) {
            fetchRequirements(selectedInductionId);
        }
    }, [selectedInductionId]);

    const fetchInductions = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${API_URL}/inductions`);
            const data = response.data?.data || [];
            setInductions(data);
            if (data.length > 0) {
                setSelectedInductionId(data[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch inductions:', err);
            setError('Failed to load inductions');
        } finally {
            setLoading(false);
        }
    };

    const fetchRequirements = async (inductionId) => {
        try {
            setLoadingDetails(true);
            const response = await axios.get(`${API_URL}/inductions/requirements/${inductionId}`);
            const data = response.data?.data || [];
            setRequirements(data);
            
            // Expand first section by default
            if (data.length > 0) {
                setExpandedSections({ [data[0].section_number]: true });
            }
        } catch (err) {
            console.error('Failed to fetch requirements:', err);
            setError('Failed to load requirements');
        } finally {
            setLoadingDetails(false);
        }
    };

    const toggleSection = (sectionNumber) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionNumber]: !prev[sectionNumber]
        }));
    };

    const handleEditRequirement = (requirement) => {
        setEditingRequirement(requirement.id);
        setEdits({
            requirement_area: requirement.requirement_area,
            description: requirement.description,
            source_reference: requirement.source_reference,
            evidence_held: requirement.evidence_held,
            responsible_person: requirement.responsible_person,
            compliance_status: requirement.compliance_status,
            review_notes: requirement.review_notes
        });
    };

    const handleSaveRequirement = async () => {
        try {
            setSaving(true);
            await axios.put(`${API_URL}/inductions/requirements/${editingRequirement}`, edits);
            await fetchRequirements(selectedInductionId);
            setEditingRequirement(null);
            setEdits({});
        } catch (err) {
            console.error('Failed to save requirement:', err);
            setError('Failed to save requirement');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRequirement = async (requirementId) => {
        if (!confirm('Are you sure you want to delete this requirement?')) return;
        
        try {
            setSaving(true);
            await axios.delete(`${API_URL}/inductions/requirements/${requirementId}`);
            await fetchRequirements(selectedInductionId);
        } catch (err) {
            console.error('Failed to delete requirement:', err);
            setError('Failed to delete requirement');
        } finally {
            setSaving(false);
        }
    };

    const groupedRequirements = useMemo(() => {
        return requirements;
    }, [requirements]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-6 h-6 animate-spin text-scl-purple" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-scl-purple" />
                        Course Inductions - Compliance Requirements
                    </h1>
                    <p className="text-sm text-gray-500">Track induction compliance requirements with evidence tracking and sign-offs.</p>
                </div>
                <button
                    onClick={() => fetchInductions()}
                    className="px-3 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inductions List */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Inductions</h2>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                        {inductions.map((induction) => (
                            <button
                                key={induction.id}
                                onClick={() => setSelectedInductionId(induction.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                                    selectedInductionId === induction.id
                                        ? 'border-scl-purple bg-scl-purple/10'
                                        : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <div className="text-sm font-semibold text-gray-900">{induction.course_title || 'Untitled'}</div>
                                <div className="text-xs text-gray-500">{induction.course_code || 'No code'}</div>
                                <div className="mt-2 text-xs text-gray-600">
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100">{induction.overall_status || 'Draft'}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Requirements Tables */}
                <div className="lg:col-span-2 space-y-4">
                    {loadingDetails && (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-6 h-6 animate-spin text-scl-purple" />
                        </div>
                    )}

                    {!loadingDetails && selectedInductionId && groupedRequirements.length > 0 && (
                        <>
                            {groupedRequirements.map((section, idx) => (
                                <div key={idx} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    {/* Section Header */}
                                    <button
                                        onClick={() => toggleSection(section.section_number)}
                                        className="w-full px-4 py-3 bg-scl-purple/10 hover:bg-scl-purple/20 text-left font-semibold text-gray-900 flex items-center justify-between transition"
                                    >
                                        <span className="flex items-center gap-2">
                                            {expandedSections[section.section_number] ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                            Section {section.section_number}: {section.section_title}
                                        </span>
                                        <span className="text-xs bg-scl-purple text-white px-2 py-1 rounded-full">
                                            {section.requirements.length}
                                        </span>
                                    </button>

                                    {/* Requirements Table */}
                                    {expandedSections[section.section_number] && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 border-t border-gray-100">
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Requirement Area</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Description</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Source/Reference</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Evidence Held</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Responsible Person</th>
                                                        <th className="px-3 py-2 text-center font-semibold text-gray-700">Status</th>
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Review Notes</th>
                                                        <th className="px-3 py-2 text-center font-semibold text-gray-700">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {section.requirements.map((req) => (
                                                        <tr key={req.id} className="border-t border-gray-100 hover:bg-gray-50">
                                                            {editingRequirement === req.id ? (
                                                                <>
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={edits.requirement_area}
                                                                            onChange={(e) => setEdits(prev => ({ ...prev, requirement_area: e.target.value }))}
                                                                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <textarea
                                                                            value={edits.description}
                                                                            onChange={(e) => setEdits(prev => ({ ...prev, description: e.target.value }))}
                                                                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                                                                            rows="2"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={edits.source_reference}
                                                                            onChange={(e) => setEdits(prev => ({ ...prev, source_reference: e.target.value }))}
                                                                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={edits.evidence_held}
                                                                            onChange={(e) => setEdits(prev => ({ ...prev, evidence_held: e.target.value }))}
                                                                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={edits.responsible_person}
                                                                            onChange={(e) => setEdits(prev => ({ ...prev, responsible_person: e.target.value }))}
                                                                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2 text-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={edits.compliance_status}
                                                                            onChange={(e) => setEdits(prev => ({ ...prev, compliance_status: e.target.checked }))}
                                                                            className="w-4 h-4 rounded border-gray-300"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <textarea
                                                                            value={edits.review_notes}
                                                                            onChange={(e) => setEdits(prev => ({ ...prev, review_notes: e.target.value }))}
                                                                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs"
                                                                            rows="2"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2 text-center space-y-1">
                                                                        <button
                                                                            onClick={handleSaveRequirement}
                                                                            disabled={saving}
                                                                            className="w-full px-2 py-1 text-xs bg-scl-purple text-white rounded hover:bg-scl-purple/90"
                                                                        >
                                                                            {saving ? 'Saving...' : 'Save'}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEditingRequirement(null)}
                                                                            className="w-full px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td className="px-3 py-2 text-gray-900 font-medium">{req.requirement_area}</td>
                                                                    <td className="px-3 py-2 text-gray-600 text-xs">{req.description}</td>
                                                                    <td className="px-3 py-2 text-gray-600 text-xs">{req.source_reference}</td>
                                                                    <td className="px-3 py-2 text-gray-600 text-xs">{req.evidence_held}</td>
                                                                    <td className="px-3 py-2 text-gray-600 text-xs">{req.responsible_person}</td>
                                                                    <td className="px-3 py-2 text-center">
                                                                        {req.compliance_status ? (
                                                                            <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                                                                        ) : (
                                                                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full mx-auto" />
                                                                        )}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-gray-600 text-xs">{req.review_notes}</td>
                                                                    <td className="px-3 py-2 text-center space-y-1">
                                                                        <button
                                                                            onClick={() => handleEditRequirement(req)}
                                                                            className="w-full px-2 py-1 text-xs text-scl-purple hover:bg-scl-purple/10 rounded"
                                                                        >
                                                                            <Edit2 className="w-3 h-3 inline" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteRequirement(req.id)}
                                                                            className="w-full px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded"
                                                                        >
                                                                            <Trash2 className="w-3 h-3 inline" />
                                                                        </button>
                                                                    </td>
                                                                </>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}

                    {!loadingDetails && selectedInductionId && groupedRequirements.length === 0 && (
                        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center text-gray-500">
                            No compliance requirements found. Create requirements to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseInductions;
