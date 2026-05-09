import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const EMPTY = {
    course_title: '',
    course_code: '',
    awarding_body: '',
    visit_type: '',
    visit_date: '',
    lead_contact_awarding_body: '',
    college_visit_coordinator: '',
    version: '1.0',
    last_updated_date: '',
    purpose_of_visit: '',
    scope_focus_areas: '',
    key_standards_regulations: '',
    visit_agenda: '',
    required_attendees: '',
    pre_visit_preparation: '',
    evidence_document_log: '',
    day_of_visit_management: '',
    post_visit_actions: '',
    risk_issue_log: '',
    signoff_details: '',
    overall_status: 'Draft',
    completion_percentage: 0
};

const STRUCTURED_SECTIONS = [
    {
        key: 'pre_visit_preparation',
        title: 'Section 2 - Pre-Visit Preparation Checklist',
        columns: [
            { key: 'task', label: 'Requirement / Task' },
            { key: 'description', label: 'Description' },
            { key: 'evidence_required', label: 'Evidence Required' },
            { key: 'source_reference', label: 'Source / Reference' },
            { key: 'responsible_person', label: 'Responsible Person' },
            { key: 'due_date', label: 'Due Date', type: 'date' },
            { key: 'status', label: 'Status' },
            { key: 'notes', label: 'Notes' }
        ]
    },
    {
        key: 'evidence_document_log',
        title: 'Section 3 - Evidence & Document Log',
        columns: [
            { key: 'evidence_item', label: 'Evidence Item' },
            { key: 'location', label: 'Location (Folder/Link)' },
            { key: 'hard_copy_required', label: 'Hard Copy Required (Y/N)' },
            { key: 'responsible_person', label: 'Responsible Person' },
            { key: 'status', label: 'Status' },
            { key: 'notes', label: 'Notes' }
        ]
    },
    {
        key: 'day_of_visit_management',
        title: 'Section 4 - Day of Visit Management',
        columns: [
            { key: 'time', label: 'Time' },
            { key: 'activity', label: 'Activity' },
            { key: 'location', label: 'Location' },
            { key: 'lead_person', label: 'Lead Person' },
            { key: 'notes', label: 'Notes' }
        ]
    },
    {
        key: 'post_visit_actions',
        title: 'Section 5 - Post-Visit Actions',
        columns: [
            { key: 'action_recommendation', label: 'Action / Recommendation' },
            { key: 'source', label: 'Source' },
            { key: 'priority', label: 'Priority' },
            { key: 'responsible_person', label: 'Responsible Person' },
            { key: 'due_date', label: 'Due Date', type: 'date' },
            { key: 'status', label: 'Status' },
            { key: 'evidence_completion', label: 'Evidence of Completion' }
        ]
    },
    {
        key: 'risk_issue_log',
        title: 'Section 6 - Risk & Issue Log',
        columns: [
            { key: 'risk_issue', label: 'Risk / Issue' },
            { key: 'impact', label: 'Impact' },
            { key: 'mitigation_action', label: 'Mitigation / Action' },
            { key: 'owner', label: 'Owner' },
            { key: 'status', label: 'Status' },
            { key: 'review_date', label: 'Review Date', type: 'date' }
        ]
    },
    {
        key: 'signoff_details',
        title: 'Section 7 - Sign-Off',
        columns: [
            { key: 'name', label: 'Name' },
            { key: 'role', label: 'Role' },
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'signature', label: 'Signature' }
        ]
    }
];

const createEmptyRow = (columns) => {
    const row = {};
    columns.forEach((col) => {
        row[col.key] = '';
    });
    return row;
};

const createInitialSectionState = (valueFactory) => {
    const state = {};
    STRUCTURED_SECTIONS.forEach((section) => {
        state[section.key] = valueFactory(section);
    });
    return state;
};

const parseStructuredValue = (value, columns) => {
    if (!value) return [];
    try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (Array.isArray(parsed)) return parsed;
    } catch (error) {
        // Backward compatibility: legacy text values become a single row.
        if (typeof value === 'string' && value.trim()) {
            const row = createEmptyRow(columns);
            row[columns[0].key] = value.trim();
            return [row];
        }
    }
    return [];
};

const isCompletedStatus = (value) => ['completed', 'complete', 'approved', 'done'].includes(String(value || '').trim().toLowerCase());

const statusFromCompletedToggle = (checked) => (checked ? 'Completed' : 'In Progress');

const CourseVisitsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isNew = id === 'new';
    const searchParams = new URLSearchParams(location.search || '');
    const prefilledMasterId = String(searchParams.get('master_id') || '').trim();
    const prefilledCourseTitle = String(searchParams.get('course_title') || '').trim();
    const prefilledCourseCode = String(searchParams.get('course_code') || '').trim();
    const prefilledAwardingBody = String(searchParams.get('awarding_body') || '').trim();
    const prefilledVersion = String(searchParams.get('version') || '').trim();
    const isPrefilledCourseContext = isNew && Boolean(prefilledMasterId || prefilledCourseCode || prefilledCourseTitle);

    const [formData, setFormData] = useState(EMPTY);
    const [accreditedCourses, setAccreditedCourses] = useState([]);
    const [selectedAccreditationId, setSelectedAccreditationId] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState({ 2: true, 3: true, 4: false, 5: false, 6: false, 7: false });
    const [sectionRows, setSectionRows] = useState(() => createInitialSectionState(() => []));
    const [sectionDrafts, setSectionDrafts] = useState(() => createInitialSectionState((section) => createEmptyRow(section.columns)));
    const [editingSectionRows, setEditingSectionRows] = useState(() => createInitialSectionState(() => null));

    const handleInputChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const fetchAccreditedCourses = async () => {
        try {
            const res = await axios.get(`${API_URL}/accreditations`);
            setAccreditedCourses(res.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch accredited courses:', err);
        }
    };

    const fetchVisit = async () => {
        if (isNew) {
            setFormData((prev) => ({
                ...prev,
                course_title: prefilledCourseTitle || prev.course_title || '',
                course_code: prefilledCourseCode || prev.course_code || '',
                awarding_body: prefilledAwardingBody || prev.awarding_body || '',
                version: prefilledVersion || prev.version || '1.0'
            }));
            return;
        }
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/course-visits/${id}`);
            const visit = res.data?.data?.visit;
            if (visit) {
                const rowsState = {};
                STRUCTURED_SECTIONS.forEach((section) => {
                    rowsState[section.key] = parseStructuredValue(visit[section.key], section.columns);
                });

                setFormData({
                    ...EMPTY,
                    ...visit,
                    visit_date: visit.visit_date ? String(visit.visit_date).slice(0, 10) : '',
                    last_updated_date: visit.last_updated_date ? String(visit.last_updated_date).slice(0, 10) : ''
                });
                setSectionRows(rowsState);
            }
        } catch (err) {
            console.error('Failed to fetch visit:', err);
            alert('Failed to load visit record');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccreditedCourses();
        fetchVisit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, location.search]);

    useEffect(() => {
        if (!isNew || accreditedCourses.length === 0) {
            return;
        }

        const normalizedPrefilledCode = prefilledCourseCode.toLowerCase();
        const normalizedPrefilledTitle = prefilledCourseTitle.toLowerCase();

        const matched = accreditedCourses.find((acc) => {
            const code = String(acc.course_code || '').trim().toLowerCase();
            const title = String(acc.course_title || '').trim().toLowerCase();
            return (normalizedPrefilledCode && code === normalizedPrefilledCode) || (normalizedPrefilledTitle && title === normalizedPrefilledTitle);
        });

        if (!matched) {
            return;
        }

        const matchedId = String(matched.id || '');
        setSelectedAccreditationId(matchedId);
        setFormData((prev) => ({
            ...prev,
            course_title: matched.course_title || prev.course_title || '',
            course_code: matched.course_code || prev.course_code || '',
            awarding_body: matched.awarding_body || prev.awarding_body || '',
            version: prefilledVersion || prev.version || '1.0'
        }));
    }, [isNew, accreditedCourses, prefilledCourseCode, prefilledCourseTitle, prefilledVersion]);

    const handleSave = async () => {
        if (!formData.course_title) {
            alert('Course title is required');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                ...formData,
                pre_visit_preparation: JSON.stringify(sectionRows.pre_visit_preparation || []),
                evidence_document_log: JSON.stringify(sectionRows.evidence_document_log || []),
                day_of_visit_management: JSON.stringify(sectionRows.day_of_visit_management || []),
                post_visit_actions: JSON.stringify(sectionRows.post_visit_actions || []),
                risk_issue_log: JSON.stringify(sectionRows.risk_issue_log || []),
                signoff_details: JSON.stringify(sectionRows.signoff_details || [])
            };
            if (isNew) {
                await axios.post(`${API_URL}/course-visits`, payload);
                alert('Course visit created successfully');
            } else {
                await axios.put(`${API_URL}/course-visits/${id}`, payload);
                alert('Course visit updated successfully');
            }
            navigate('/course-lifecycle');
        } catch (err) {
            console.error('Failed to save visit:', err);
            alert(`Failed to save visit: ${err.response?.data?.message || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const fillTestData = () => {
        const today = new Date();
        const plus30 = new Date(today);
        plus30.setDate(today.getDate() + 30);
        const fmt = (d) => d.toISOString().slice(0, 10);

        setFormData((prev) => ({
            ...prev,
            course_title: prev.course_title || 'BSc Business Management',
            course_code: prev.course_code || 'BSC-BM-101',
            awarding_body: prev.awarding_body || 'University of London',
            visit_type: prev.visit_type || 'Annual Monitoring',
            visit_date: prev.visit_date || fmt(plus30),
            lead_contact_awarding_body: prev.lead_contact_awarding_body || 'Prof. Helen Woods',
            college_visit_coordinator: prev.college_visit_coordinator || 'QA Manager',
            version: prev.version || '1.0',
            last_updated_date: fmt(today),
            purpose_of_visit: prev.purpose_of_visit || 'Routine annual quality monitoring visit.',
            scope_focus_areas: prev.scope_focus_areas || 'Assessment quality, student progression, governance compliance.',
            key_standards_regulations: prev.key_standards_regulations || 'Partner QA framework, OfS baseline standards.',
            visit_agenda: prev.visit_agenda || '09:00 Welcome; 10:00 Document review; 12:00 Student panel; 14:00 Feedback.',
            required_attendees: prev.required_attendees || 'Principal, QA Manager, Programme Leader, Registry Officer.',
            overall_status: 'In Progress',
            completion_percentage: Number(prev.completion_percentage) > 0 ? prev.completion_percentage : 65
        }));

        setSectionRows({
            pre_visit_preparation: [
                {
                    task: 'Confirm Visit Date & Agenda',
                    description: 'Confirm with awarding body and circulate internally',
                    evidence_required: 'Email confirmation',
                    source_reference: 'Awarding body contact',
                    responsible_person: 'Visit Coordinator',
                    due_date: fmt(today),
                    status: 'Completed',
                    notes: 'Confirmed by partner.'
                },
                {
                    task: 'Update Institutional Profile',
                    description: 'Ensure most recent profile is available',
                    evidence_required: 'Profile document',
                    source_reference: 'QA folder',
                    responsible_person: 'QA Manager',
                    due_date: fmt(plus30),
                    status: 'In Progress',
                    notes: 'Final review pending.'
                }
            ],
            evidence_document_log: [
                {
                    evidence_item: 'Programme Specifications',
                    location: 'QA/Visits/Specs',
                    hard_copy_required: 'Y',
                    responsible_person: 'Programme Leader',
                    status: 'Ready',
                    notes: 'Latest approved versions attached.'
                }
            ],
            day_of_visit_management: [
                { time: '09:00', activity: 'Arrival & Welcome', location: 'Reception', lead_person: 'Visit Coordinator', notes: '' },
                { time: '10:00', activity: 'Document Review', location: 'QA Office', lead_person: 'QA Manager', notes: '' }
            ],
            post_visit_actions: [
                {
                    action_recommendation: 'Submit revised annual monitoring template',
                    source: 'Panel feedback',
                    priority: 'High',
                    responsible_person: 'QA Manager',
                    due_date: fmt(plus30),
                    status: 'Open',
                    evidence_completion: ''
                }
            ],
            risk_issue_log: [
                {
                    risk_issue: 'Evidence sign-off delay',
                    impact: 'Could delay partner approval',
                    mitigation_action: 'Pre-review evidence checklist weekly',
                    owner: 'Visit Coordinator',
                    status: 'Open',
                    review_date: fmt(plus30)
                }
            ],
            signoff_details: [
                { name: 'Visit Coordinator', role: 'Coordinator', date: fmt(today), signature: 'Signed' },
                { name: 'QA Manager', role: 'QA Manager', date: fmt(today), signature: 'Signed' },
                { name: 'Principal / CEO', role: 'Principal / CEO', date: '', signature: '' }
            ]
        });
    };

    const toggleSection = (sectionNumber) => {
        setExpandedSections((prev) => ({ ...prev, [sectionNumber]: !prev[sectionNumber] }));
    };

    const addRow = (sectionKey, columns) => {
        setSectionRows((prev) => {
            const draft = sectionDrafts[sectionKey] || createEmptyRow(columns);
            const nextRows = [...(prev[sectionKey] || [])];
            const editingIndex = editingSectionRows[sectionKey];

            if (editingIndex !== null && editingIndex !== undefined && editingIndex >= 0 && editingIndex < nextRows.length) {
                nextRows[editingIndex] = { ...draft };
            } else {
                nextRows.push({ ...draft });
            }

            return {
                ...prev,
                [sectionKey]: nextRows
            };
        });

        setSectionDrafts((prev) => ({
            ...prev,
            [sectionKey]: createEmptyRow(columns)
        }));

        setEditingSectionRows((prev) => ({
            ...prev,
            [sectionKey]: null
        }));
    };

    const updateRowValue = (sectionKey, field, value) => {
        setSectionDrafts((prev) => ({
            ...prev,
            [sectionKey]: {
                ...(prev[sectionKey] || {}),
                [field]: value
            }
        }));
    };

    const editRow = (sectionKey, rowIndex, columns) => {
        setSectionDrafts((prev) => ({
            ...prev,
            [sectionKey]: {
                ...createEmptyRow(columns),
                ...((sectionRows[sectionKey] || [])[rowIndex] || {})
            }
        }));
        setEditingSectionRows((prev) => ({
            ...prev,
            [sectionKey]: rowIndex
        }));
    };

    const cancelEditRow = (sectionKey, columns) => {
        setSectionDrafts((prev) => ({
            ...prev,
            [sectionKey]: createEmptyRow(columns)
        }));
        setEditingSectionRows((prev) => ({
            ...prev,
            [sectionKey]: null
        }));
    };

    const removeRow = (sectionKey, rowIndex) => {
        setSectionRows((prev) => {
            const rows = [...(prev[sectionKey] || [])];
            rows.splice(rowIndex, 1);
            return { ...prev, [sectionKey]: rows };
        });

        setEditingSectionRows((prev) => {
            const current = prev[sectionKey];
            if (current === rowIndex) {
                return { ...prev, [sectionKey]: null };
            }
            if (typeof current === 'number' && current > rowIndex) {
                return { ...prev, [sectionKey]: current - 1 };
            }
            return prev;
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate('/course-visits')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Visits
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'New Visit Record' : 'Edit Visit Record'}</h1>
                    <p className="text-sm text-gray-600">Awarding body visit and inspection management</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {loading && <div className="text-sm text-gray-500">Loading...</div>}

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Document Control</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {isNew && (
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Course</label>
                                <select
                                    value={selectedAccreditationId}
                                    onChange={(e) => {
                                        const nextId = e.target.value;
                                        setSelectedAccreditationId(nextId);
                                        const acc = accreditedCourses.find((a) => String(a.id) === e.target.value);
                                        if (acc) {
                                            handleInputChange('course_title', acc.course_title || '');
                                            handleInputChange('course_code', acc.course_code || '');
                                            handleInputChange('awarding_body', acc.awarding_body || '');
                                        }
                                    }}
                                    disabled={isPrefilledCourseContext}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                                >
                                    <option value="" disabled>-- Select a Course --</option>
                                    {accreditedCourses.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.course_title}{acc.course_code ? ` (${acc.course_code})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Title *</label>
                            <input type="text" value={formData.course_title} onChange={(e) => handleInputChange('course_title', e.target.value)} disabled={isPrefilledCourseContext} className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Code</label>
                            <input type="text" value={formData.course_code} onChange={(e) => handleInputChange('course_code', e.target.value)} disabled={isPrefilledCourseContext} className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Awarding Body / University</label>
                            <input type="text" value={formData.awarding_body} onChange={(e) => handleInputChange('awarding_body', e.target.value)} disabled={isPrefilledCourseContext} className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Visit / Inspection Type</label>
                            <input type="text" value={formData.visit_type} onChange={(e) => handleInputChange('visit_type', e.target.value)} placeholder="e.g. Annual Monitoring" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Visit</label>
                            <input type="date" value={formData.visit_date} onChange={(e) => handleInputChange('visit_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Lead Contact at Awarding Body</label>
                            <input type="text" value={formData.lead_contact_awarding_body} onChange={(e) => handleInputChange('lead_contact_awarding_body', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">College Visit Coordinator</label>
                            <input type="text" value={formData.college_visit_coordinator} onChange={(e) => handleInputChange('college_visit_coordinator', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Version</label>
                            <input type="text" value={formData.version} onChange={(e) => handleInputChange('version', e.target.value)} disabled={isPrefilledCourseContext} className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Last Updated</label>
                            <input type="date" value={formData.last_updated_date} onChange={(e) => handleInputChange('last_updated_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Overall Status</label>
                            <select value={formData.overall_status} onChange={(e) => handleInputChange('overall_status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option value="Draft">Draft</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Completion %</label>
                            <input type="number" min="0" max="100" value={formData.completion_percentage} onChange={(e) => handleInputChange('completion_percentage', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Section 1 - Visit Overview</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Purpose of Visit</label>
                            <textarea value={formData.purpose_of_visit} onChange={(e) => handleInputChange('purpose_of_visit', e.target.value)} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Scope / Focus Areas</label>
                            <textarea value={formData.scope_focus_areas} onChange={(e) => handleInputChange('scope_focus_areas', e.target.value)} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Key Standards / Regulations Under Review</label>
                            <textarea value={formData.key_standards_regulations} onChange={(e) => handleInputChange('key_standards_regulations', e.target.value)} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Visit Agenda (if provided)</label>
                            <textarea value={formData.visit_agenda} onChange={(e) => handleInputChange('visit_agenda', e.target.value)} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Required Attendees from College</label>
                            <textarea value={formData.required_attendees} onChange={(e) => handleInputChange('required_attendees', e.target.value)} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>
                </div>

                {STRUCTURED_SECTIONS.map((section, index) => {
                    const sectionNumber = index + 2;
                    const rows = sectionRows[section.key] || [];
                    const draft = sectionDrafts[section.key] || createEmptyRow(section.columns);
                    const editingRowIndex = editingSectionRows[section.key];
                    const isEditing = editingRowIndex !== null && editingRowIndex !== undefined;
                    return (
                        <div key={section.key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => toggleSection(sectionNumber)}
                                className="w-full px-6 py-4 bg-scl-purple/10 hover:bg-scl-purple/20 text-left font-semibold text-gray-900 flex items-center justify-between transition"
                            >
                                <span>{section.title}</span>
                                {expandedSections[sectionNumber] ? (
                                    <ChevronUp className="w-5 h-5" />
                                ) : (
                                    <ChevronDown className="w-5 h-5" />
                                )}
                            </button>

                            {expandedSections[sectionNumber] && (
                                <div className="p-6 border-t border-gray-200">
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-gray-800">{isEditing ? 'Edit Row' : 'Add New Row'}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                            {section.columns.map((column) => (
                                                <div key={`${section.key}-draft-${column.key}`}>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">{column.label}</label>

                                                    {(column.key === 'source_reference' || column.key === 'evidence_required') ? (
                                                        <div>
                                                            <input
                                                                type="file"
                                                                onChange={(e) => updateRowValue(section.key, column.key, e.target.files ? e.target.files[0]?.name || '' : '')}
                                                                className="w-full text-xs"
                                                            />
                                                            {draft[column.key] ? <p className="text-xs text-gray-600 mt-1">{draft[column.key]}</p> : null}
                                                        </div>
                                                    ) : column.key === 'status' ? (
                                                        <label className="inline-flex items-center gap-2 mt-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isCompletedStatus(draft[column.key])}
                                                                onChange={(e) => updateRowValue(section.key, column.key, statusFromCompletedToggle(e.target.checked))}
                                                                className="w-4 h-4"
                                                            />
                                                            <span className="text-xs font-semibold text-gray-700">Complete</span>
                                                        </label>
                                                    ) : column.key === 'notes' ? (
                                                        <textarea
                                                            value={draft[column.key] || ''}
                                                            onChange={(e) => updateRowValue(section.key, column.key, e.target.value)}
                                                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                            rows={2}
                                                        />
                                                    ) : (
                                                        <input
                                                            type={column.type === 'date' ? 'date' : 'text'}
                                                            value={draft[column.key] || ''}
                                                            onChange={(e) => updateRowValue(section.key, column.key, e.target.value)}
                                                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end gap-2 mt-3">
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => cancelEditRow(section.key, section.columns)}
                                                    className="px-3 py-1.5 rounded text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => addRow(section.key, section.columns)}
                                                className="px-3 py-1.5 rounded text-xs font-semibold bg-scl-purple text-white hover:bg-scl-purple/90 flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> {isEditing ? 'Update Row' : 'Add Row'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[980px] text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    {section.columns.map((column) => (
                                                        <th key={column.key} className="border border-gray-300 px-2 py-2 text-left font-semibold">
                                                            {column.label}
                                                        </th>
                                                    ))}
                                                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={section.columns.length + 1} className="border border-gray-300 px-3 py-3 text-center text-gray-500">
                                                            No rows added yet.
                                                        </td>
                                                    </tr>
                                                ) : rows.map((row, rowIndex) => (
                                                    <tr key={`${section.key}-${rowIndex}`} className="hover:bg-blue-50">
                                                        {section.columns.map((column) => (
                                                            <td key={column.key} className="border border-gray-300 px-2 py-1.5 text-xs text-gray-800">
                                                                {column.key === 'status'
                                                                    ? (isCompletedStatus(row[column.key])
                                                                        ? <span className="text-green-600 font-semibold">✓</span>
                                                                        : <span className="text-gray-500">In Progress</span>)
                                                                    : (row[column.key] || '-')}
                                                            </td>
                                                        ))}
                                                        <td className="border border-gray-300 px-2 py-1 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => editRow(section.key, rowIndex, section.columns)}
                                                                className="text-blue-600 hover:text-blue-800 text-xs font-semibold mr-2"
                                                                title="Edit row"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRow(section.key, rowIndex)}
                                                                className="text-red-500 hover:text-red-700"
                                                                title="Delete row"
                                                            >
                                                                <Trash2 className="w-4 h-4 inline" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                    <button onClick={fillTestData} type="button" className="px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold">
                        Fill Test Data
                    </button>
                    <button onClick={() => navigate('/course-visits')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-scl-purple text-white rounded-lg hover:bg-scl-purple/90 font-semibold disabled:opacity-50">
                        {saving ? 'Saving...' : isNew ? 'Create Visit' : 'Save Visit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseVisitsDetail;

