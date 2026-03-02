import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CourseAccreditations = ({ user }) => {
    // Main state
    const [accreditations, setAccreditations] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [formLoading, setFormLoading] = useState(false);

    // Form state
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseInfo, setCourseInfo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Document control state
    const [documentControl, setDocumentControl] = useState({
        course_title: '',
        awarding_body: '',
        application_type: '',
        expected_submission_date: '',
        lead_coordinator: '',
        version: '1.0',
        overall_status: 'Draft'
    });

    // Sections state (1-6)
    const [sectionData, setSectionData] = useState({
        1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    });

    // Risks and signoffs state
    const [risks, setRisks] = useState([]);
    const [signoffs, setSignoffs] = useState([]);

    // Section names
    const sectionNames = {
        1: 'Initial Planning & Approval',
        2: 'Application Preparation',
        3: 'Submission & Engagement',
        4: 'Institutional Visit & Validation',
        5: 'Agreement & Implementation',
        6: 'Post-Approval Monitoring',
        7: 'Risk & Issue Log',
        8: 'Sign-off'
    };

    useEffect(() => {
        fetchAccreditations();
        fetchCourses();
    }, []);

    const fetchAccreditations = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/accreditations`);
            setAccreditations(response.data?.data || response.data || []);
        } catch (err) {
            console.error('Failed to fetch accreditations:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axios.get(`${API_URL}/students/courses`);
            // Handle different response structures
            const coursesData = Array.isArray(response.data) 
                ? response.data 
                : response.data?.data || response.data?.courses || [];
            setCourses(Array.isArray(coursesData) ? coursesData : []);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
            setCourses([]);
        }
    };

    const resetForm = () => {
        setSelectedCourse(null);
        setCourseInfo(null);
        setDocumentControl({
            course_title: '',
            awarding_body: '',
            application_type: '',
            expected_submission_date: '',
            lead_coordinator: '',
            version: '1.0',
            overall_status: 'Draft'
        });
        setSectionData({ 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });
        setRisks([]);
        setSignoffs([]);
        setExpandedSections({});
        setIsEditing(false);
        setEditingId(null);
    };

    const handleAddNew = () => {
        resetForm();
    };

    const handleCourseSelect = async (course) => {
        setSelectedCourse(course);
        
        // Check if this course already has an accreditation
        const existingAccreditation = accreditations.find(
            acc => acc.course_title === course.course_title
        );
        
        if (existingAccreditation) {
            // Load existing accreditation data
            handleEditAccreditation(existingAccreditation.id);
        } else {
            // Set up form for new accreditation with course info
            setCourseInfo(course);
            setDocumentControl({
                course_title: course.course_title || '',
                awarding_body: course.awarding_body || '',
                application_type: '',
                expected_submission_date: '',
                lead_coordinator: '',
                version: '1.0',
                overall_status: 'Draft'
            });
            setSectionData({ 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });
            setRisks([]);
            setSignoffs([]);
            setIsEditing(false);
            setEditingId(null);
        }
    };

    const handleEditAccreditation = async (id) => {
        try {
            setFormLoading(true);
            const response = await axios.get(`${API_URL}/accreditations/${id}`);
            const accreditation = response.data?.data || response.data;
            
            // Find matching course
            const matchedCourse = Array.isArray(courses) && courses.find(c => c.course_title === accreditation.course_title);
            setSelectedCourse(matchedCourse || null);
            setCourseInfo(matchedCourse || null);
            
            // Set document control
            setDocumentControl({
                course_title: accreditation.course_title || '',
                awarding_body: accreditation.awarding_body || '',
                application_type: accreditation.application_type || '',
                expected_submission_date: accreditation.expected_submission_date || '',
                lead_coordinator: accreditation.lead_coordinator || '',
                version: accreditation.version || '1.0',
                overall_status: accreditation.overall_status || 'Draft'
            });
            
            // Set section data
            const sectionsObject = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
            if (accreditation.tasks && Array.isArray(accreditation.tasks)) {
                accreditation.tasks.forEach(task => {
                    const sectionNum = task.section_number || 1;
                    if (!sectionsObject[sectionNum]) {
                        sectionsObject[sectionNum] = [];
                    }
                    sectionsObject[sectionNum].push({
                        id: task.id,
                        description: task.description,
                        status: task.status,
                        evidence_required: task.evidence_required,
                        source_reference: task.source_reference,
                        responsible_person: task.responsible_person,
                        due_date: task.due_date,
                        notes: task.notes
                    });
                });
            }
            setSectionData(sectionsObject);
            
            // Set risks
            setRisks(accreditation.risks || []);
            
            // Set signoffs
            setSignoffs(accreditation.signoffs || []);
            
            setIsEditing(true);
            setEditingId(id);
        } catch (error) {
            console.error('Error loading accreditation:', error);
            alert('Failed to load accreditation details');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDocumentControlChange = (field, value) => {
        setDocumentControl(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const toggleSection = (sectionNumber) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionNumber]: !prev[sectionNumber]
        }));
    };

    const addTaskToSection = (sectionNumber) => {
        setSectionData(prev => ({
            ...prev,
            [sectionNumber]: [...(prev[sectionNumber] || []), {
                description: '',
                status: 'Not Started',
                evidence_required: '',
                source_reference: '',
                responsible_person: '',
                due_date: '',
                notes: ''
            }]
        }));
    };

    const handleSectionTaskChange = (sectionNumber, taskIndex, field, value) => {
        setSectionData(prev => {
            const newSectionData = [...prev[sectionNumber]];
            newSectionData[taskIndex] = {
                ...newSectionData[taskIndex],
                [field]: value
            };
            return {
                ...prev,
                [sectionNumber]: newSectionData
            };
        });
    };

    const removeTaskFromSection = (sectionNumber, taskIndex) => {
        setSectionData(prev => ({
            ...prev,
            [sectionNumber]: prev[sectionNumber].filter((_, i) => i !== taskIndex)
        }));
    };

    const addRisk = () => {
        setRisks([...risks, {
            risk_issue: '',
            impact: '',
            mitigation: '',
            owner: '',
            review_date: '',
            status: 'Open'
        }]);
    };

    const handleRiskChange = (index, field, value) => {
        const newRisks = [...risks];
        newRisks[index] = {
            ...newRisks[index],
            [field]: value
        };
        setRisks(newRisks);
    };

    const removeRisk = (index) => {
        setRisks(risks.filter((_, i) => i !== index));
    };

    const addSignoff = () => {
        setSignoffs([...signoffs, {
            name: '',
            role: '',
            sign_date: '',
            signature: ''
        }]);
    };

    const handleSignoffChange = (index, field, value) => {
        const newSignoffs = [...signoffs];
        newSignoffs[index] = {
            ...newSignoffs[index],
            [field]: value
        };
        setSignoffs(newSignoffs);
    };

    const removeSignoff = (index) => {
        setSignoffs(signoffs.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!selectedCourse) {
            alert('Please select a course');
            return;
        }

        try {
            setFormLoading(true);
            const payload = {
                documentControl,
                sections: sectionData,
                risks,
                signoffs
            };

            if (isEditing && editingId) {
                // Update existing
                await axios.put(`${API_URL}/accreditations/${editingId}`, payload);
                alert('Accreditation updated successfully');
            } else {
                // Create new
                await axios.post(`${API_URL}/accreditations`, payload);
                alert('Accreditation created successfully');
            }

            resetForm();
            fetchAccreditations();
        } catch (error) {
            console.error('Error saving accreditation:', error);
            alert('Failed to save accreditation: ' + error.response?.data?.message || error.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleCancel = () => {
        resetForm();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this accreditation?')) {
            try {
                await axios.delete(`${API_URL}/accreditations/${id}`);
                fetchAccreditations();
                alert('Accreditation deleted successfully');
            } catch (err) {
                console.error('Failed to delete:', err);
                alert('Failed to delete accreditation');
            }
        }
    };

    const filteredAccreditations = accreditations.filter(acc => {
        const matchesSearch = 
            acc.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.awarding_body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.application_type?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || acc.overall_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const statusColors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Approved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Draft': 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                📋 Course Accreditations
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">Manage course accreditation applications and partnerships</p>
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-2 px-4 py-2 bg-scl-purple text-white rounded-lg hover:bg-scl-purple/90 font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            New Accreditation
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by course title, awarding body..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Form Section */}
                <div className="bg-white rounded-lg border border-gray-200 mb-8 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isEditing ? 'Edit Accreditation' : 'Create New Accreditation'}
                            </h2>
                        </div>

                        {/* Course Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Course *
                            </label>
                            <select
                                value={selectedCourse?.id || ''}
                                onChange={(e) => {
                                    const course = Array.isArray(courses) && courses.find(c => c.id === parseInt(e.target.value));
                                    if (course) {
                                        handleCourseSelect(course);
                                    }
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            >
                                <option value="">-- Select a Course --</option>
                                {Array.isArray(courses) && courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.course_title} ({course.course_code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedCourse && (
                            <>
                                {/* Course General Information */}
                                {courseInfo && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <h3 className="font-semibold text-blue-900 mb-2">Course Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-blue-600 font-medium">Course Code</p>
                                                <p className="text-blue-900">{courseInfo.course_code}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-600 font-medium">Course Type</p>
                                                <p className="text-blue-900">{courseInfo.course_type || 'General'}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-600 font-medium">Awarding Body</p>
                                                <p className="text-blue-900">{courseInfo.awarding_body || 'SCL Institute'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Document Control Section */}
                                <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Document Control</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                                            <input
                                                type="text"
                                                value={documentControl.course_title}
                                                onChange={(e) => handleDocumentControlChange('course_title', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Awarding Body</label>
                                            <input
                                                type="text"
                                                value={documentControl.awarding_body}
                                                onChange={(e) => handleDocumentControlChange('awarding_body', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Application Type</label>
                                            <input
                                                type="text"
                                                value={documentControl.application_type}
                                                onChange={(e) => handleDocumentControlChange('application_type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Submission Date</label>
                                            <input
                                                type="date"
                                                value={documentControl.expected_submission_date}
                                                onChange={(e) => handleDocumentControlChange('expected_submission_date', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Coordinator</label>
                                            <input
                                                type="text"
                                                value={documentControl.lead_coordinator}
                                                onChange={(e) => handleDocumentControlChange('lead_coordinator', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Overall Status</label>
                                            <select
                                                value={documentControl.overall_status}
                                                onChange={(e) => handleDocumentControlChange('overall_status', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                            >
                                                <option value="Draft">Draft</option>
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Collapsible Sections 1-6 */}
                                {[1, 2, 3, 4, 5, 6].map(sectionNum => (
                                    <div key={sectionNum} className="bg-white border border-gray-200 rounded-lg mb-4">
                                        <button
                                            onClick={() => toggleSection(sectionNum)}
                                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                                        >
                                            <div>
                                                <h3 className="font-bold text-gray-900">Section {sectionNum}: {sectionNames[sectionNum]}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {sectionData[sectionNum]?.length || 0} task(s)
                                                </p>
                                            </div>
                                            {expandedSections[sectionNum] ? (
                                                <ChevronUp className="w-5 h-5 text-gray-600" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-600" />
                                            )}
                                        </button>

                                        {expandedSections[sectionNum] && (
                                            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                                                {/* Tasks in this section */}
                                                {sectionData[sectionNum]?.map((task, idx) => (
                                                    <div key={idx} className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="font-semibold text-gray-900">Task {idx + 1}</h4>
                                                            <button
                                                                onClick={() => removeTaskFromSection(sectionNum, idx)}
                                                                className="text-red-500 hover:text-red-700 text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                                                <textarea
                                                                    value={task.description}
                                                                    onChange={(e) => handleSectionTaskChange(sectionNum, idx, 'description', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                                    rows="2"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                                                <select
                                                                    value={task.status}
                                                                    onChange={(e) => handleSectionTaskChange(sectionNum, idx, 'status', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                                >
                                                                    <option value="Not Started">Not Started</option>
                                                                    <option value="In Progress">In Progress</option>
                                                                    <option value="Completed">Completed</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                                                                <input
                                                                    type="date"
                                                                    value={task.due_date}
                                                                    onChange={(e) => handleSectionTaskChange(sectionNum, idx, 'due_date', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Evidence Required</label>
                                                                <input
                                                                    type="text"
                                                                    value={task.evidence_required}
                                                                    onChange={(e) => handleSectionTaskChange(sectionNum, idx, 'evidence_required', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Source/Reference</label>
                                                                <input
                                                                    type="text"
                                                                    value={task.source_reference}
                                                                    onChange={(e) => handleSectionTaskChange(sectionNum, idx, 'source_reference', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Responsible Person</label>
                                                                <input
                                                                    type="text"
                                                                    value={task.responsible_person}
                                                                    onChange={(e) => handleSectionTaskChange(sectionNum, idx, 'responsible_person', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                                                                <textarea
                                                                    value={task.notes}
                                                                    onChange={(e) => handleSectionTaskChange(sectionNum, idx, 'notes', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                                    rows="2"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Add Task Button */}
                                                <button
                                                    onClick={() => addTaskToSection(sectionNum)}
                                                    className="px-4 py-2 text-scl-purple border border-scl-purple rounded-lg hover:bg-purple-50 font-semibold text-sm"
                                                >
                                                    + Add Task
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Section 7: Risk & Issue Log */}
                                <div className="bg-white border border-gray-200 rounded-lg mb-4">
                                    <button
                                        onClick={() => toggleSection(7)}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                                    >
                                        <div>
                                            <h3 className="font-bold text-gray-900">Section 7: Risk & Issue Log</h3>
                                            <p className="text-sm text-gray-600">
                                                {risks?.length || 0} risk(s)
                                            </p>
                                        </div>
                                        {expandedSections[7] ? (
                                            <ChevronUp className="w-5 h-5 text-gray-600" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-600" />
                                        )}
                                    </button>

                                    {expandedSections[7] && (
                                        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                                            {risks?.map((risk, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold text-gray-900">Risk {idx + 1}</h4>
                                                        <button
                                                            onClick={() => removeRisk(idx)}
                                                            className="text-red-500 hover:text-red-700 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Risk/Issue</label>
                                                            <textarea
                                                                value={risk.risk_issue}
                                                                onChange={(e) => handleRiskChange(idx, 'risk_issue', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                                rows="2"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Impact</label>
                                                            <input
                                                                type="text"
                                                                value={risk.impact}
                                                                onChange={(e) => handleRiskChange(idx, 'impact', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                                            <select
                                                                value={risk.status}
                                                                onChange={(e) => handleRiskChange(idx, 'status', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                            >
                                                                <option value="Open">Open</option>
                                                                <option value="In Progress">In Progress</option>
                                                                <option value="Resolved">Resolved</option>
                                                            </select>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Mitigation</label>
                                                            <textarea
                                                                value={risk.mitigation}
                                                                onChange={(e) => handleRiskChange(idx, 'mitigation', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                                rows="2"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Owner</label>
                                                            <input
                                                                type="text"
                                                                value={risk.owner}
                                                                onChange={(e) => handleRiskChange(idx, 'owner', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Review Date</label>
                                                            <input
                                                                type="date"
                                                                value={risk.review_date}
                                                                onChange={(e) => handleRiskChange(idx, 'review_date', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={addRisk}
                                                className="px-4 py-2 text-scl-purple border border-scl-purple rounded-lg hover:bg-purple-50 font-semibold text-sm"
                                            >
                                                + Add Risk
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Section 8: Sign-off */}
                                <div className="bg-white border border-gray-200 rounded-lg mb-6">
                                    <button
                                        onClick={() => toggleSection(8)}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                                    >
                                        <div>
                                            <h3 className="font-bold text-gray-900">Section 8: Sign-off</h3>
                                            <p className="text-sm text-gray-600">
                                                {signoffs?.length || 0} sign-off(s)
                                            </p>
                                        </div>
                                        {expandedSections[8] ? (
                                            <ChevronUp className="w-5 h-5 text-gray-600" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-600" />
                                        )}
                                    </button>

                                    {expandedSections[8] && (
                                        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                                            {signoffs?.map((signoff, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold text-gray-900">Sign-off {idx + 1}</h4>
                                                        <button
                                                            onClick={() => removeSignoff(idx)}
                                                            className="text-red-500 hover:text-red-700 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                                            <input
                                                                type="text"
                                                                value={signoff.name}
                                                                onChange={(e) => handleSignoffChange(idx, 'name', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                                                            <input
                                                                type="text"
                                                                value={signoff.role}
                                                                onChange={(e) => handleSignoffChange(idx, 'role', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Sign Date</label>
                                                            <input
                                                                type="date"
                                                                value={signoff.sign_date}
                                                                onChange={(e) => handleSignoffChange(idx, 'sign_date', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={addSignoff}
                                                className="px-4 py-2 text-scl-purple border border-scl-purple rounded-lg hover:bg-purple-50 font-semibold text-sm"
                                            >
                                                + Add Sign-off
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Save and Cancel Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={formLoading}
                                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                                    >
                                        <Save className="w-5 h-5" />
                                        {formLoading ? 'Saving...' : 'Save Accreditation'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={formLoading}
                                        className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 font-semibold"
                                    >
                                        <X className="w-5 h-5" />
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Accreditations Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin">⏳</div>
                        <p className="text-gray-600 mt-2">Loading accreditations...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course Title</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Awarding Body</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Application Type</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Lead Coordinator</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredAccreditations.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No accreditations found. Fill the form above and click "Save Accreditation"
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAccreditations.map(acc => (
                                        <tr key={acc.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{acc.course_title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{acc.awarding_body || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{acc.application_type || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{acc.lead_coordinator || '-'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[acc.overall_status] || statusColors['Draft']}`}>
                                                    {acc.overall_status || 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => {
                                                            handleEditAccreditation(acc.id);
                                                        }}
                                                        className="text-scl-purple hover:text-scl-purple/70 transition"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(acc.id)}
                                                        className="text-red-500 hover:text-red-700 transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                </div>
        </div>
    );
};

export default CourseAccreditations;
