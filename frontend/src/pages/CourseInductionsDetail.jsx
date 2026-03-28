import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

// Section configuration based on Course Inductions CSV
const SECTION_CONFIG = {
    1: {
        title: 'Course Approval Details',
        requirements: [
            { area: 'Programme Specification', description: 'Approved and finalised version' },
            { area: 'Learning Outcomes', description: 'As approved, mapped to framework' },
            { area: 'Curriculum Structure', description: 'Module titles, codes, credit values' },
            { area: 'Assessment Strategy', description: 'Weighting, method, moderation' }
        ]
    },
    2: {
        title: 'Staffing Requirements',
        requirements: [
            { area: 'Minimum Qualifications', description: 'E.g., teaching qualification + subject expertise' },
            { area: 'External Examiner', description: 'Appointed, trained, approved' },
            { area: 'CPD Requirements', description: 'Annual hours or activities' }
        ]
    },
    3: {
        title: 'Facilities & Resources',
        requirements: [
            { area: 'Classroom / Lab Standards', description: 'Min size, equipment, accessibility' },
            { area: 'Library & Learning Resources', description: 'Physical and digital access' },
            { area: 'Specialist Equipment', description: 'Software, instruments, safety equipment' }
        ]
    },
    4: {
        title: 'Admission & Enrolment',
        requirements: [
            { area: 'Entry Requirements', description: 'Academic and/or work experience criteria' },
            { area: 'English Language Requirements', description: 'Minimum IELTS/TOEFL or equivalent' },
            { area: 'Recognition of Prior Learning (RPL)', description: 'Process for credit transfer or exemption' },
            { area: 'Application Process', description: 'Forms, deadlines, documents required' },
            { area: 'Offer Letter Format', description: 'Partner-approved wording & conditions' },
            { area: 'Enrolment Documentation', description: 'Proof of ID, qualifications, visas' }
        ]
    },
    5: {
        title: 'Fees & Payment Frequencies',
        requirements: [
            { area: 'Partner Accreditation Fees', description: 'Annual/periodic validation or licence fees' },
            { area: 'Per-Student Registration Fees', description: 'Fee per student to awarding body' },
            { area: 'Exam / Assessment Fees', description: 'Fees for exam entries or moderation' },
            { area: 'Payment Schedule', description: 'Agreed payment dates & frequency' },
            { area: 'Student Tuition Fee Structure', description: 'Approved rates & instalment plan' }
        ]
    },
    6: {
        title: 'Student Support & Administration',
        requirements: [
            { area: 'Induction Programme', description: 'Schedule, content, materials' },
            { area: 'Academic Guidance', description: 'Tutor allocation, office hours' },
            { area: 'Accessibility & Inclusivity', description: 'Reasonable adjustments, resources' }
        ]
    },
    7: {
        title: 'Returns & Reports to Awarding Body',
        requirements: [
            { area: 'Student Registration Data', description: 'Enrolment list sent within 30 days' },
            { area: 'Assessment Results', description: 'Marks and grades reporting' },
            { area: 'Annual Monitoring Report', description: 'Quality review & performance data' },
            { area: 'External Examiner Reports', description: 'Submission to partner' },
            { area: 'Financial Returns', description: 'Student registration fee reconciliation' }
        ]
    },
    8: {
        title: 'Quality Assurance & Compliance',
        requirements: [
            { area: 'Annual Monitoring', description: 'Data submission deadlines' },
            { area: 'Assessment Board Attendance', description: 'Required staff presence' },
            { area: 'Policy Alignment', description: 'College policies mapped to partner' },
            { area: 'Revalidation Cycle', description: 'Timeline & requirements' }
        ]
    },
    9: {
        title: 'Conditions & Recommendations',
        type: 'conditions'
    },
    10: {
        title: 'Risk & Issue Log',
        type: 'risks'
    },
    11: {
        title: 'Sign-off',
        type: 'signoff',
        roles: ['Programme Leader', 'QA Manager', 'Senior Management']
    }
};

const CourseInductionsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isNew = id === 'new';
    const searchParams = new URLSearchParams(location.search || '');
    const prefilledMasterId = String(searchParams.get('master_id') || '').trim();
    const prefilledCourseTitle = String(searchParams.get('course_title') || '').trim();
    const prefilledCourseCode = String(searchParams.get('course_code') || '').trim();
    const prefilledAwardingBody = String(searchParams.get('awarding_body') || '').trim();
    const prefilledQualificationLevel = String(searchParams.get('qualification_level') || '').trim();
    const prefilledDocumentOwner = String(searchParams.get('document_owner') || '').trim();
    const prefilledVersion = String(searchParams.get('version') || '').trim();
    const isPrefilledCourseContext = isNew && Boolean(prefilledMasterId || prefilledCourseCode || prefilledCourseTitle);
    
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [accreditedCourses, setAccreditedCourses] = useState([]);
    const [selectedAccreditationId, setSelectedAccreditationId] = useState('');
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
        notes: '',
        deadline: '',
        impact: '',
        mitigation: ''
    });
    const [formData, setFormData] = useState({
        course_title: '',
        course_code: '',
        awarding_body: '',
        qualification_level: '',
        approval_date: '',
        review_date: '',
        document_owner: '',
        version: '1.0',
        sections: {}
    });

    useEffect(() => {
        if (id && id !== 'new') {
            fetchInduction();
        } else {
            initializeNewForm();
        }
        fetchAccreditedCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, location.search]);

    const fetchAccreditedCourses = async () => {
        try {
            const response = await axios.get(`${API_URL}/accreditations`);
            setAccreditedCourses(response.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch accredited courses:', err);
        }
    };

    const fetchInduction = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/course-inductions/${id}`);
            const data = response.data?.data || {};
            
            const { induction, requirements = [], risks = [], signoffs = [], conditions = [] } = data;
            
            if (induction) {
                // Organize requirements by section
                const sectionsByNum = {};
                for (let i = 1; i <= 11; i++) {
                    sectionsByNum[i] = [];
                }
                
                // Sections 1-8: requirements
                requirements.forEach(req => {
                    const sectionNum = req.section_number || 1;
                    if (sectionsByNum[sectionNum]) {
                        sectionsByNum[sectionNum].push({
                            id: req.id,
                            area: req.requirement_area || '',
                            description: req.description || '',
                            source: req.source_reference || '',
                            evidence: req.evidence_held || '',
                            responsible: req.responsible_person || '',
                            status: req.compliance_status === 'Completed',
                            notes: req.review_notes || ''
                        });
                    }
                });
                
                // Section 9: conditions
                if (Array.isArray(conditions)) {
                    sectionsByNum[9] = conditions.map(c => ({
                        id: c.id,
                        area: c.condition_recommendation || '',
                        description: c.action_required || '',
                        responsible: c.responsible_person || '',
                        deadline: formatDateForInput(c.deadline),
                        status: c.status || 'Open'
                    }));
                }
                
                // Section 10: risks
                if (Array.isArray(risks)) {
                    sectionsByNum[10] = risks.map(r => ({
                        id: r.id,
                        area: r.risk_issue || '',
                        impact: r.impact || '',
                        mitigation: r.mitigation || '',
                        responsible: r.owner || '',
                        status: r.status || 'Open'
                    }));
                }
                
                // Section 11: sign-offs
                if (Array.isArray(signoffs)) {
                    sectionsByNum[11] = signoffs.map(s => ({
                        id: s.id,
                        area: s.role || '',
                        description: s.name || '',
                        responsible: s.name || ''
                    }));
                } else {
                    // Default sign-off roles
                    sectionsByNum[11] = SECTION_CONFIG[11].roles.map(role => ({
                        area: role,
                        description: '',
                        responsible: ''
                    }));
                }
                
                setFormData({
                    course_title: induction.course_title || '',
                    course_code: induction.course_code || '',
                    awarding_body: induction.awarding_body || '',
                    qualification_level: induction.qualification_level || '',
                    approval_date: formatDateForInput(induction.approval_date),
                    review_date: formatDateForInput(induction.review_date),
                    document_owner: induction.document_owner || '',
                    version: induction.version || '1.0',
                    sections: sectionsByNum
                });
            }
        } catch (err) {
            console.error('Failed to fetch induction:', err);
        } finally {
            setLoading(false);
        }
    };

    const initializeNewForm = () => {
        const sections = {};
        for (let i = 1; i <= 11; i++) {
            sections[i] = [];
        }
        
        // Pre-populate Section 11 (Sign-off) with required roles
        sections[11] = SECTION_CONFIG[11].roles.map((role, idx) => ({
            area: role,
            description: '',
            responsible: '',
            tempId: `signoff-${idx}`
        }));
        
        setFormData(prev => ({
            ...prev,
            course_title: prefilledCourseTitle || prev.course_title || '',
            course_code: prefilledCourseCode || prev.course_code || '',
            awarding_body: prefilledAwardingBody || prev.awarding_body || '',
            qualification_level: prefilledQualificationLevel || prev.qualification_level || '',
            document_owner: prefilledDocumentOwner || prev.document_owner || '',
            version: prefilledVersion || prev.version || '1.0',
            sections
        }));
    };

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
            qualification_level: prefilledQualificationLevel || prev.qualification_level || '',
            document_owner: prefilledDocumentOwner || prev.document_owner || '',
            version: prefilledVersion || prev.version || '1.0'
        }));
    }, [isNew, accreditedCourses, prefilledCourseCode, prefilledCourseTitle, prefilledQualificationLevel, prefilledDocumentOwner, prefilledVersion]);


    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Validation
            if (!formData.course_title) {
                alert('Please enter a course title');
                setSaving(false);
                return;
            }
            
            const inductionPayload = {
                course_title: formData.course_title,
                course_code: formData.course_code,
                awarding_body: formData.awarding_body,
                qualification_level: formData.qualification_level,
                approval_date: formData.approval_date || null,
                review_date: formData.review_date || null,
                document_owner: formData.document_owner,
                version: formData.version
            };
            
            let inductionId;
            
            if (isNew) {
                // Create new induction
                const response = await axios.post(`${API_URL}/course-inductions`, inductionPayload);
                inductionId = response.data?.data?.id;
                if (!inductionId) throw new Error('Failed to create induction');
            } else {
                // Update existing induction
                await axios.put(`${API_URL}/course-inductions/${id}`, inductionPayload);
                inductionId = id;
            }
            
            // Save requirements (sections 1-8)
            for (let sectionNum = 1; sectionNum <= 8; sectionNum++) {
                const items = (formData.sections[sectionNum] || []).filter(item => item.area);
                
                for (const item of items) {
                    const reqData = {
                        section_number: sectionNum,
                        section_title: SECTION_CONFIG[sectionNum].title,
                        requirement_area: item.area,
                        description: item.description,
                        source_reference: item.source,
                        evidence_held: item.evidence,
                        responsible_person: item.responsible,
                        compliance_status: item.status ? 'Completed' : 'Not Started',
                        review_notes: item.notes
                    };
                    
                    if (item.id && !isNew) {
                        await axios.put(
                            `${API_URL}/course-inductions/${inductionId}/requirements/${item.id}`,
                            reqData
                        );
                    } else if (!item.id) {
                        // Create new row
                        await axios.post(
                            `${API_URL}/course-inductions/${inductionId}/requirements`,
                            reqData
                        );
                    }
                }
            }
            
            // Save conditions (section 9)
            const conditions = (formData.sections[9] || []).filter(c => c.area);
            for (const condition of conditions) {
                const condData = {
                    condition_recommendation: condition.area,
                    action_required: condition.description,
                    responsible_person: condition.responsible,
                    deadline: condition.deadline || null,
                    status: condition.status || 'Open'
                };
                
                if (condition.id && !isNew) {
                    await axios.put(
                        `${API_URL}/course-inductions/${inductionId}/conditions/${condition.id}`,
                        condData
                    );
                } else if (!condition.id) {
                    await axios.post(
                        `${API_URL}/course-inductions/${inductionId}/conditions`,
                        condData
                    );
                }
            }
            
            // Save risks (section 10)
            const risks = (formData.sections[10] || []).filter(r => r.area);
            for (const risk of risks) {
                const riskData = {
                    risk_issue: risk.area,
                    impact: risk.impact,
                    mitigation: risk.mitigation,
                    owner: risk.responsible,
                    status: risk.status || 'Open'
                };
                
                if (risk.id && !isNew) {
                    await axios.put(
                        `${API_URL}/course-inductions/${inductionId}/risks/${risk.id}`,
                        riskData
                    );
                } else if (!risk.id) {
                    await axios.post(
                        `${API_URL}/course-inductions/${inductionId}/risks`,
                        riskData
                    );
                }
            }
            
            // Save signoffs (section 11)
            const signoffs = (formData.sections[11] || []).filter(s => s.description);
            for (const signoff of signoffs) {
                const signoffData = {
                    role: signoff.area,
                    name: signoff.description
                };
                
                if (signoff.id && !isNew) {
                    await axios.put(
                        `${API_URL}/course-inductions/${inductionId}/signoffs/${signoff.id}`,
                        signoffData
                    );
                } else if (!signoff.id) {
                    await axios.post(
                        `${API_URL}/course-inductions/${inductionId}/signoffs`,
                        signoffData
                    );
                }
            }
            
            alert('Induction saved successfully');
            navigate('/course-inductions');
        } catch (err) {
            console.error('Failed to save:', err);
            alert('Error saving induction: ' + (err.response?.data?.message || err.message));
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

    const fillTestData = () => {
        const today = new Date();
        const plus90 = new Date(today);
        plus90.setDate(today.getDate() + 90);
        const fmt = (d) => d.toISOString().slice(0, 10);

        const generatedSections = {};

        for (let sectionNum = 1; sectionNum <= 8; sectionNum++) {
            const requirements = SECTION_CONFIG[sectionNum]?.requirements || [];
            generatedSections[sectionNum] = requirements.map((req, idx) => ({
                area: req.area,
                description: req.description,
                source: `Policy ref ${sectionNum}.${idx + 1}`,
                evidence: `Evidence file ${sectionNum}.${idx + 1}`,
                responsible: 'Programme Team',
                status: idx % 2 === 0,
                notes: 'Auto-filled test data'
            }));
        }

        generatedSections[9] = [
            {
                area: 'Update student handbook',
                description: 'Align handbook with approved curriculum and assessment policy.',
                responsible: 'Registry Manager',
                deadline: fmt(plus90),
                status: 'Open'
            }
        ];

        generatedSections[10] = [
            {
                area: 'Late timetabling risk',
                impact: 'Medium',
                mitigation: 'Reserve backup teaching slots and staff availability.',
                responsible: 'Timetable Officer',
                status: 'Open'
            }
        ];

        generatedSections[11] = [
            { area: 'Programme Leader', description: 'Dr Sarah Mitchell', responsible: 'Signed' },
            { area: 'QA Manager', description: 'Mr John Carter', responsible: 'Signed' },
            { area: 'Senior Management', description: 'Ms Anna Reid', responsible: 'Signed' }
        ];

        setFormData((prev) => ({
            ...prev,
            course_title: prev.course_title || 'BSc Business Management',
            course_code: prev.course_code || 'BSC-BM-101',
            awarding_body: prev.awarding_body || 'University of London',
            qualification_level: prev.qualification_level || 'Level 6 (Degree)',
            approval_date: prev.approval_date || fmt(today),
            review_date: prev.review_date || fmt(plus90),
            document_owner: prev.document_owner || 'QA Team',
            version: prev.version || '1.0',
            sections: generatedSections
        }));
    };

    const updateRequirement = (sectionNum, rowIdx, field, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            if (!newData.sections[sectionNum]) {
                newData.sections[sectionNum] = [];
            }
            newData.sections[sectionNum][rowIdx] = {
                ...newData.sections[sectionNum][rowIdx],
                [field]: value
            };
            return newData;
        });
    };

    const handleAddRequirement = (sectionNum) => {
        if (!currentForm.area) {
            alert('Please fill in the required field');
            return;
        }

        const isEditing = editingRowIdx !== null && editingSection === sectionNum;
        const reqId = `temp_${Date.now()}_${Math.random()}`;

        setFormData(prev => {
            const existingRows = prev.sections[sectionNum] || [];

            let updatedRows;
            if (isEditing) {
                // Replace the row at editingRowIdx, preserving its DB id
                updatedRows = existingRows.map((row, i) => {
                    if (i !== editingRowIdx) return row;
                    return { ...currentForm, id: row.id, tempId: row.tempId };
                });
            } else {
                updatedRows = [...existingRows, { ...currentForm, tempId: reqId }];
            }

            return {
                ...prev,
                sections: { ...prev.sections, [sectionNum]: updatedRows }
            };
        });

        handleFormReset();
    };

    const handleEditRequirement = (sectionNum, rowIdx) => {
        setCurrentForm(formData.sections[sectionNum][rowIdx]);
        setEditingRowIdx(rowIdx);
        setEditingSection(sectionNum);
    };

    const handleDeleteRequirement = async (sectionNum, rowIdx) => {
        const sectionRows = formData.sections[sectionNum] || [];
        const deletedItem = sectionRows[rowIdx];

        if (!deletedItem) {
            console.error(`Section ${sectionNum} or row ${rowIdx} does not exist`);
            return;
        }

        try {
            if (deletedItem.id && !isNew) {
                if (sectionNum >= 1 && sectionNum <= 8) {
                    await axios.delete(`${API_URL}/course-inductions/${id}/requirements/${deletedItem.id}`);
                } else if (sectionNum === 9) {
                    await axios.delete(`${API_URL}/course-inductions/${id}/conditions/${deletedItem.id}`);
                } else if (sectionNum === 10) {
                    await axios.delete(`${API_URL}/course-inductions/${id}/risks/${deletedItem.id}`);
                } else if (sectionNum === 11) {
                    await axios.delete(`${API_URL}/course-inductions/${id}/signoffs/${deletedItem.id}`);
                }
            }

            setFormData(prev => ({
                ...prev,
                sections: {
                    ...prev.sections,
                    [sectionNum]: (prev.sections[sectionNum] || []).filter((_, idx) => idx !== rowIdx)
                }
            }));

            if (editingRowIdx === rowIdx && editingSection === sectionNum) {
                handleFormReset();
            }
        } catch (err) {
            console.error('Failed to delete row:', err);
            alert('Failed to delete row. Please try again.');
        }
    };

    const handleFormReset = () => {
        setCurrentForm({
            area: '',
            description: '',
            source: '',
            evidence: '',
            responsible: '',
            status: false,
            notes: '',
            deadline: '',
            impact: '',
            mitigation: ''
        });
        // Clear file input elements
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
                            onClick={() => navigate('/course-inductions')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isNew ? 'New Course Induction' : 'Edit Course Induction'}
                            </h1>
                            <p className="text-sm text-gray-600">Plan and manage course induction requirements across 11 sections</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* General Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Document Control - General Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        
                        {isNew && (
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Accredited Course *</label>
                                <select
                                    value={selectedAccreditationId}
                                    onChange={(e) => {
                                        const nextId = e.target.value;
                                        setSelectedAccreditationId(nextId);
                                        const acc = accreditedCourses.find(a => String(a.id) === e.target.value);
                                        if (acc) {
                                            handleInputChange('course_title', acc.course_title || '');
                                            handleInputChange('course_code', acc.course_code || '');
                                            handleInputChange('awarding_body', acc.awarding_body || '');
                                        }
                                    }}
                                    disabled={isPrefilledCourseContext}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                                >
                                    <option value="" disabled>-- Pick a course from Accreditation --</option>
                                    {accreditedCourses.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.course_title}{acc.course_code ? ` (${acc.course_code})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">Selecting a course auto-fills the fields below.</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Title *</label>
                            <input
                                type="text"
                                value={formData.course_title}
                                onChange={(e) => handleInputChange('course_title', e.target.value)}
                                disabled={isPrefilledCourseContext}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                                placeholder="Enter course title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Code</label>
                            <input
                                type="text"
                                value={formData.course_code}
                                onChange={(e) => handleInputChange('course_code', e.target.value)}
                                disabled={isPrefilledCourseContext}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                                placeholder="e.g., BBA-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Awarding Body</label>
                            <input
                                type="text"
                                value={formData.awarding_body}
                                onChange={(e) => handleInputChange('awarding_body', e.target.value)}
                                disabled={isPrefilledCourseContext}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                                placeholder="e.g., University X"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Qualification Level</label>
                            <input
                                type="text"
                                value={formData.qualification_level}
                                onChange={(e) => handleInputChange('qualification_level', e.target.value)}
                                disabled={isPrefilledCourseContext}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                                placeholder="e.g., Level 6 (Degree)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Approval Date</label>
                            <input
                                type="date"
                                value={formData.approval_date}
                                onChange={(e) => handleInputChange('approval_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Review Date</label>
                            <input
                                type="date"
                                value={formData.review_date}
                                onChange={(e) => handleInputChange('review_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Document Owner</label>
                            <input
                                type="text"
                                value={formData.document_owner}
                                onChange={(e) => handleInputChange('document_owner', e.target.value)}
                                disabled={isPrefilledCourseContext}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                                placeholder="Name or role"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Version</label>
                            <input
                                type="text"
                                value={formData.version}
                                onChange={(e) => handleInputChange('version', e.target.value)}
                                disabled={isPrefilledCourseContext}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Sections with Form and Table */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(sectionNum => (
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
                                {/* Skip form for sections 9-11 for now, just show data table */}
                                {sectionNum <= 8 && (
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                                            {editingRowIdx !== null && editingSection === sectionNum ? 'Edit Requirement' : 'Add New Requirement'}
                                        </h4>
                                        
                                        {/* Row 1: Requirement Area (full width) */}
                                        <div className="mb-2">
                                            <label className="block text-xs font-semibold text-gray-700 mb-0.5">Requirement Area *</label>
                                            <select
                                                value={currentForm.area}
                                                onChange={(e) => {
                                                    const selectedReq = (SECTION_CONFIG[sectionNum].requirements || []).find(r => r.area === e.target.value);
                                                    setCurrentForm(prev => ({
                                                        ...prev,
                                                        area: e.target.value,
                                                        description: selectedReq?.description || ''
                                                    }));
                                                }}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                            >
                                                <option value="">Select Area</option>
                                                {(SECTION_CONFIG[sectionNum].requirements || []).map(req => (
                                                    <option key={req.area} value={req.area}>{req.area}</option>
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
                                                    placeholder="Type description here..."
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

                                        {/* Row 3: Source & Evidence References */}
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
                                                    type="button"
                                                    onClick={() => handleAddRequirement(sectionNum)}
                                                    className="px-3 py-1 bg-scl-purple text-white rounded text-xs font-semibold hover:bg-scl-purple/90"
                                                >
                                                    {editingRowIdx !== null && editingSection === sectionNum ? 'Update' : 'Add'}
                                                </button>
                                                {(editingRowIdx !== null || currentForm.area) && (
                                                    <button
                                                        type="button"
                                                        onClick={handleFormReset}
                                                        className="px-3 py-1 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                                    >Cancel</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Section 9: Conditions & Recommendations form */}
                                {sectionNum === 9 && (
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                                            {editingRowIdx !== null && editingSection === sectionNum ? 'Edit Condition' : 'Add New Condition'}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-0.5">Condition *</label>
                                                <input
                                                    type="text"
                                                    value={currentForm.area}
                                                    onChange={(e) => setCurrentForm(prev => ({ ...prev, area: e.target.value }))}
                                                    placeholder="Describe the condition"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-0.5">Action Required</label>
                                                <textarea
                                                    value={currentForm.description}
                                                    onChange={(e) => setCurrentForm(prev => ({ ...prev, description: e.target.value }))}
                                                    placeholder="Action required..."
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                    rows="2"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-0.5">Responsible</label>
                                                <input
                                                    type="text"
                                                    value={currentForm.responsible}
                                                    onChange={(e) => setCurrentForm(prev => ({ ...prev, responsible: e.target.value }))}
                                                    placeholder="Name or role"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-0.5">Deadline</label>
                                                <input
                                                    type="date"
                                                    value={currentForm.deadline}
                                                    onChange={(e) => setCurrentForm(prev => ({ ...prev, deadline: e.target.value }))}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleAddRequirement(sectionNum)}
                                                className="px-3 py-1 bg-scl-purple text-white rounded text-xs font-semibold hover:bg-scl-purple/90"
                                            >
                                                {editingRowIdx !== null && editingSection === sectionNum ? 'Update' : 'Add'}
                                            </button>
                                            {(editingRowIdx !== null || currentForm.area) && (
                                                <button
                                                    type="button"
                                                    onClick={handleFormReset}
                                                    className="px-3 py-1 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                                >Cancel</button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Section 10: Risk & Issue Log form */}
                                {sectionNum === 10 && (
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                                            {editingRowIdx !== null && editingSection === sectionNum ? 'Edit Risk' : 'Add New Risk'}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-0.5">Risk Issue *</label>
                                                <input
                                                    type="text"
                                                    value={currentForm.area}
                                                    onChange={(e) => setCurrentForm(prev => ({ ...prev, area: e.target.value }))}
                                                    placeholder="Describe the risk"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-0.5">Impact</label>
                                                <select
                                                    value={currentForm.impact}
                                                    onChange={(e) => setCurrentForm(prev => ({ ...prev, impact: e.target.value }))}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                >
                                                    <option value="">Select Impact</option>
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-0.5">Mitigation</label>
                                                <textarea
                                                    value={currentForm.mitigation}
                                                    onChange={(e) => setCurrentForm(prev => ({ ...prev, mitigation: e.target.value }))}
                                                    placeholder="Mitigation strategy..."
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                    rows="2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-0.5">Owner</label>
                                                <input
                                                    type="text"
                                                    value={currentForm.responsible}
                                                    onChange={(e) => setCurrentForm(prev => ({ ...prev, responsible: e.target.value }))}
                                                    placeholder="Risk owner"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-xs font-semibold text-gray-700 mb-0.5">Status</label>
                                            <select
                                                value={typeof currentForm.status === 'string' ? currentForm.status : 'Open'}
                                                onChange={(e) => setCurrentForm(prev => ({ ...prev, status: e.target.value }))}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                            >
                                                <option value="Open">Open</option>
                                                <option value="Monitoring">Monitoring</option>
                                                <option value="Closed">Closed</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleAddRequirement(sectionNum)}
                                                className="px-3 py-1 bg-scl-purple text-white rounded text-xs font-semibold hover:bg-scl-purple/90"
                                            >
                                                {editingRowIdx !== null && editingSection === sectionNum ? 'Update' : 'Add'}
                                            </button>
                                            {(editingRowIdx !== null || currentForm.area) && (
                                                <button
                                                    type="button"
                                                    onClick={handleFormReset}
                                                    className="px-3 py-1 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                                >Cancel</button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Section 11: Sign-offs form */}
                                {sectionNum === 11 && (
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                                            {editingRowIdx !== null && editingSection === sectionNum ? 'Edit Sign-off' : 'Add Sign-off'}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-0.5">Role *</label>
                                                <input
                                                    type="text"
                                                    value={currentForm.area}
                                                    onChange={(e) => setCurrentForm(prev => ({ ...prev, area: e.target.value }))}
                                                    placeholder="Role or title"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-0.5">Name</label>
                                                <input
                                                    type="text"
                                                    value={currentForm.description}
                                                    onChange={(e) => setCurrentForm(prev => ({ ...prev, description: e.target.value }))}
                                                    placeholder="Person name"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleAddRequirement(sectionNum)}
                                                className="px-3 py-1 bg-scl-purple text-white rounded text-xs font-semibold hover:bg-scl-purple/90"
                                            >
                                                {editingRowIdx !== null && editingSection === sectionNum ? 'Update' : 'Add'}
                                            </button>
                                            {(editingRowIdx !== null || currentForm.area) && (
                                                <button
                                                    type="button"
                                                    onClick={handleFormReset}
                                                    className="px-3 py-1 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                                >Cancel</button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Table at Bottom */}
                                {(formData.sections[sectionNum] || []).length > 0 && (
                                    <div className="overflow-x-auto mt-3">
                                    <table className="w-full border-collapse border border-gray-300 text-xs">
                                        <thead>
                                                <tr className="bg-gray-100">
                                                    {sectionNum <= 8 && (
                                                        <>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Area</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Description</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Responsible</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Status</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Actions</th>
                                                        </>
                                                    )}
                                                    {sectionNum === 9 && (
                                                        <>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Condition</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Action Required</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Responsible</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Deadline</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Actions</th>
                                                        </>
                                                    )}
                                                    {sectionNum === 10 && (
                                                        <>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Risk Issue</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Impact</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Mitigation</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Owner</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Status</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Actions</th>
                                                        </>
                                                    )}
                                                    {sectionNum === 11 && (
                                                        <>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Role</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Name</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Actions</th>
                                                        </>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(formData.sections[sectionNum] || []).map((item, idx) => (
                                                    <tr key={item.id || item.tempId || idx} className="hover:bg-blue-50">
                                                        {sectionNum <= 8 && (
                                                            <>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm font-medium">{item.area}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{item.description && item.description.substring(0, 50)}{item.description && item.description.length > 50 ? '...' : ''}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{item.responsible}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-center">
                                                                    {item.status ? <span className="text-green-600 font-semibold">✓</span> : <span className="text-gray-400">○</span>}
                                                                </td>
                                                                <td className="border border-gray-300 px-3 py-2 text-center">
                                                                    <button
                                                                        onClick={() => handleEditRequirement(sectionNum, idx)}
                                                                        className="text-blue-500 hover:text-blue-700 font-semibold text-sm mr-2"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (window.confirm('Delete this requirement?')) {
                                                                                handleDeleteRequirement(sectionNum, idx);
                                                                            }
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700 font-semibold text-sm"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </td>
                                                            </>
                                                        )}
                                                        {sectionNum === 9 && (
                                                            <>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{item.area}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{item.description && item.description.substring(0, 30)}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{item.responsible}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{item.deadline}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-center">
                                                                    <button
                                                                        onClick={() => handleEditRequirement(sectionNum, idx)}
                                                                        className="text-blue-500 hover:text-blue-700 font-semibold text-sm mr-2"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (window.confirm('Delete this condition?')) {
                                                                                handleDeleteRequirement(sectionNum, idx);
                                                                            }
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700 font-semibold text-sm"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </td>
                                                            </>
                                                        )}
                                                        {sectionNum === 10 && (
                                                            <>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{item.area}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{item.impact}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{item.mitigation && item.mitigation.substring(0, 30)}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{item.responsible}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm text-center">{item.status || 'Open'}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-center">
                                                                    <button
                                                                        onClick={() => handleEditRequirement(sectionNum, idx)}
                                                                        className="text-blue-500 hover:text-blue-700 font-semibold text-sm mr-2"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (window.confirm('Delete this risk?')) {
                                                                                handleDeleteRequirement(sectionNum, idx);
                                                                            }
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700 font-semibold text-sm"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </td>
                                                            </>
                                                        )}
                                                        {sectionNum === 11 && (
                                                            <>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{item.area}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{item.description}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-center">
                                                                    <button
                                                                        onClick={() => handleEditRequirement(sectionNum, idx)}
                                                                        className="text-blue-500 hover:text-blue-700 font-semibold text-sm mr-2"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (window.confirm('Delete this sign-off?')) {
                                                                                handleDeleteRequirement(sectionNum, idx);
                                                                            }
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700 font-semibold text-sm"
                                                                    >
                                                                        Delete
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
                        )}
                    </div>
                ))}

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                    <button
                        onClick={fillTestData}
                        type="button"
                        className="px-4 py-2 border border-purple-200 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-semibold"
                    >
                        Fill Test Data
                    </button>
                    <button
                        onClick={() => navigate('/course-inductions')}
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

export default CourseInductionsDetail;
