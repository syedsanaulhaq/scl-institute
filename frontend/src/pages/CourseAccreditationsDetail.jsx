import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Utility function to format dates for HTML5 date input (yyyy-MM-dd)
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

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
            { area: 'Example: Staffing gap in specialist subject', impact: 'Delays in course delivery', mitigation: 'Recruit part-time lecturer', owner: 'HR Manager', status: 'Open' }
        ],
        fields: ['risk', 'impact', 'mitigation', 'owner', 'status']
    },
    8: {
        title: 'Sign-off',
        tasks: [
            { area: 'Lead Coordinator', role: '', date: '', signature: '' },
            { area: 'QA Manager', role: '', date: '', signature: '' },
            { area: 'Principal / CEO', role: '', date: '', signature: '' }
        ],
        fields: ['name', 'role', 'date', 'signature']
    }
};

const CourseAccreditationsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';
    
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [courseLoading, setCourseLoading] = useState(true);
    const [accreditationExists, setAccreditationExists] = useState(false);
    const [existingAccreditationId, setExistingAccreditationId] = useState(null);
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
        const initializeData = async () => {
            // First fetch courses and get the list
            const coursesList = await fetchCourses();
            console.log('Courses loaded in useEffect:', coursesList);
            
            // Then fetch accreditation if in edit mode, passing courses along
            if (id && id !== 'new') {
                // Reset form state before loading new data
                resetEditForm();
                fetchAccreditation(coursesList);
            } else {
                // Initialize new form
                initializeNewForm();
            }
        };
        
        initializeData();
    }, [id]);

    // Second useEffect to ensure course dropdown is selected after both courses and formData are loaded
    useEffect(() => {
        if (formData.course_title && courses.length > 0 && !loading) {
            console.log('Attempting to auto-select course in dropdown:', formData.course_title);
            const matchingCourse = courses.find(c => 
                (c.fullname || c.course_title) === formData.course_title
            );
            if (matchingCourse) {
                setSelectedCourseId(matchingCourse.id);
                console.log('Auto-selected course with ID:', matchingCourse.id);
            } else {
                console.log('No matching course found for:', formData.course_title);
            }
        }
    }, [formData.course_title, courses, loading]);

    const fetchCourses = async () => {
        try {
            setCourseLoading(true);
            console.log('Fetching courses from:', `${API_URL}/students/courses`);
            const response = await axios.get(`${API_URL}/students/courses`);
            console.log('Courses response:', response.data);
            const coursesList = Array.isArray(response.data?.data) ? response.data.data : response.data;
            console.log('Processed courses list:', coursesList);
            const coursesArray = Array.isArray(coursesList) ? coursesList : [];
            setCourses(coursesArray);
            return coursesArray; // Return the courses for use in async chain
        } catch (err) {
            console.error('Failed to fetch courses:', err);
            setCourses([]);
            return [];
        } finally {
            setCourseLoading(false);
        }
    };

    const handleCourseSelect = async (courseId) => {
        setSelectedCourseId(courseId);
        const course = courses.find(c => c.id === parseInt(courseId));
        
        if (course) {
            // Set the course info
            setFormData(prev => ({
                ...prev,
                course_title: course.fullname || course.course_title || '',
                course_code: course.shortname || course.course_code || ''
            }));

            // Check if accreditation already exists for this course
            try {
                const response = await axios.get(`${API_URL}/accreditations`, { 
                    params: { course_id: courseId } 
                });
                const existingAccreditation = response.data?.data?.find(acc => acc.course_id === courseId || acc.course_title === (course.fullname || course.course_title));
                
                if (existingAccreditation) {
                    // Load existing accreditation data
                    setAccreditationExists(true);
                    setExistingAccreditationId(existingAccreditation.id);
                    setLoading(true);
                    try {
                        const detailResponse = await axios.get(`${API_URL}/accreditations/${existingAccreditation.id}`);
                        const accreditation = detailResponse.data?.data;
                        
                        if (accreditation) {
                            const sectionsByNum = {};
                            for (let i = 1; i <= 8; i++) {
                                sectionsByNum[i] = [];
                            }
                            
                            // If accreditation has tasks, populate them with duplicate prevention
                            const taskKeys = new Set();
                            if (accreditation.tasks) {
                                accreditation.tasks.forEach(task => {
                                    const sectionNum = task.section_number || 1;
                                    // Skip section 8 - it uses signoffs table instead
                                    if (sectionNum === 8) return;
                                    
                                    if (sectionsByNum[sectionNum]) {
                                        // Create unique key to prevent duplicates
                                        const taskKey = `${task.id}|${task.task_name}|${task.description}`;
                                        if (!taskKeys.has(taskKey)) {
                                            taskKeys.add(taskKey);
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
                                    }
                                });
                            }
                            
                            // Load signoffs for section 8
                            if (accreditation.signoffs && accreditation.signoffs.length > 0) {
                                // Filter to only the 3 required roles and map from database
                                const requiredRoles = new Set(['Lead Coordinator', 'QA Manager', 'Principal / CEO']);
                                const validSignoffs = accreditation.signoffs.filter(s => requiredRoles.has(s.role));
                                
                                if (validSignoffs.length > 0) {
                                    sectionsByNum[8] = validSignoffs.map(signoff => ({
                                        id: signoff.id,
                                        area: signoff.role || '',
                                        description: signoff.name || '',
                                        source: signoff.sign_date || '',
                                        responsible: signoff.signature || '',
                                        tempId: `signoff-${signoff.id}`
                                    }));
                                } else {
                                    // Initialize with default roles if no valid signoffs
                                    sectionsByNum[8] = [
                                        { area: 'Lead Coordinator', description: '', source: '', responsible: '', tempId: 'signoff-1' },
                                        { area: 'QA Manager', description: '', source: '', responsible: '', tempId: 'signoff-2' },
                                        { area: 'Principal / CEO', description: '', source: '', responsible: '', tempId: 'signoff-3' }
                                    ];
                                }
                            } else {
                                // Initialize with default roles if no signoffs exist
                                sectionsByNum[8] = [
                                    { area: 'Lead Coordinator', description: '', source: '', responsible: '', tempId: 'signoff-1' },
                                    { area: 'QA Manager', description: '', source: '', responsible: '', tempId: 'signoff-2' },
                                    { area: 'Principal / CEO', description: '', source: '', responsible: '', tempId: 'signoff-3' }
                                ];
                            }
                            
                            setFormData({
                                course_title: accreditation.course_title || '',
                                course_code: accreditation.course_code || '',
                                awarding_body: accreditation.awarding_body || '',
                                application_type: accreditation.application_type || '',
                                date_started: formatDateForInput(accreditation.date_started),
                                expected_submission_date: formatDateForInput(accreditation.expected_submission_date),
                                lead_coordinator: accreditation.lead_coordinator || '',
                                version: accreditation.version || '1.0',
                                sections: sectionsByNum
                            });
                        }
                    } catch (err) {
                        console.error('Failed to fetch accreditation details:', err);
                    } finally {
                        setLoading(false);
                    }
                } else {
                    // New accreditation - initialize empty sections
                    setAccreditationExists(false);
                    initializeNewForm();
                }
            } catch (err) {
                console.error('Failed to check accreditation:', err);
                setAccreditationExists(false);
                initializeNewForm();
            }
        }
    };

    const initializeNewForm = () => {
        const sections = {};
        for (let i = 1; i <= 8; i++) {
            sections[i] = [];
        }
        // Pre-populate Section 8 (Sign-off) with the three required roles
        sections[8] = [
            { area: 'Lead Coordinator', description: '', source: '', responsible: '', tempId: 'signoff-1' },
            { area: 'QA Manager', description: '', source: '', responsible: '', tempId: 'signoff-2' },
            { area: 'Principal / CEO', description: '', source: '', responsible: '', tempId: 'signoff-3' }
        ];
        setFormData(prev => ({ ...prev, sections }));
    };

    const resetEditForm = () => {
        // Completely reset form state before loading new data
        setFormData({
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
        setCurrentForm({
            area: '',
            description: '',
            source: '',
            evidence: '',
            responsible: '',
            status: false,
            notes: ''
        });
        setEditingRowIdx(null);
        setEditingSection(null);
        setSelectedCourseId(null);
    };

    const fetchAccreditation = async (coursesList = []) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/accreditations/${id}`);
            console.log('Accreditation response:', response.data);
            
            // The backend returns { accreditation, tasks, risks, signoffs } inside data
            const { accreditation, tasks = [] } = response.data?.data || {};
            
            if (!accreditation) {
                throw new Error('Invalid data structure');
            }
            
            console.log('Loaded accreditation:', accreditation);
            console.log('Loaded tasks:', tasks);
            
            // Group tasks by section_number
            const sectionsByNum = {};
            for (let i = 1; i <= 8; i++) {
                sectionsByNum[i] = [];
            }
            
            // Populate tasks from the response - use Set to prevent duplicates
            const taskKeys = new Set();
            if (Array.isArray(tasks)) {
                tasks.forEach(task => {
                    const sectionNum = task.section_number || 1;
                    if (sectionsByNum[sectionNum]) {
                        // Create unique key to prevent duplicates
                        const taskKey = `${task.id}|${task.task_name}|${task.description}`;
                        if (!taskKeys.has(taskKey)) {
                            taskKeys.add(taskKey);
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
                    }
                });
            }
            
            // Ensure Section 8 (Sign-off) always has the three required roles
            if (!sectionsByNum[8] || sectionsByNum[8].length === 0) {
                sectionsByNum[8] = [
                    { area: 'Lead Coordinator', description: '', source: '', responsible: '' },
                    { area: 'QA Manager', description: '', source: '', responsible: '' },
                    { area: 'Principal / CEO', description: '', source: '', responsible: '' }
                ];
            }
            
            console.log('Setting formData with accreditation:', accreditation);
            console.log('Date started value:', accreditation.date_started);
            console.log('Formatted date:', formatDateForInput(accreditation.date_started));
            
            // Reset form completely before setting new data
            setFormData({
                course_title: accreditation.course_title || '',
                course_code: accreditation.course_code || '',
                awarding_body: accreditation.awarding_body || '',
                application_type: accreditation.application_type || '',
                date_started: accreditation.date_started ? formatDateForInput(accreditation.date_started) : '',
                expected_submission_date: accreditation.expected_submission_date ? formatDateForInput(accreditation.expected_submission_date) : '',
                lead_coordinator: accreditation.lead_coordinator || '',
                version: accreditation.version || '1.0',
                sections: sectionsByNum
            });

            // Reset the task form to prevent stale data from showing
            setCurrentForm({
                area: '',
                description: '',
                source: '',
                evidence: '',
                responsible: '',
                status: false,
                notes: ''
            });
            setEditingRowIdx(null);
            setEditingSection(null);

            // Find and set the matching course ID using the passed-in coursesList
            console.log('Available courses:', coursesList.map(c => ({ id: c.id, fullname: c.fullname || c.course_title })));
            console.log('Looking for course with title:', accreditation.course_title);
            if (coursesList.length > 0) {
                const matchingCourse = coursesList.find(c => 
                    (c.fullname || c.course_title) === accreditation.course_title
                );
                console.log('Found matching course?', !!matchingCourse, matchingCourse);
                if (matchingCourse) {
                    setSelectedCourseId(matchingCourse.id);
                    console.log('Set selectedCourseId to:', matchingCourse.id);
                }
            } else {
                console.log('No courses provided to fetchAccreditation');
            }
        } catch (err) {
            console.error('Failed to fetch accreditation:', err);
            alert('Error loading accreditation data');
        } finally {
            setLoading(false);
        }
    };

    const transformFormData = () => {
        // Transform frontend formData structure to match backend expectations
        const documentControl = {
            course_title: formData.course_title || '',
            course_code: formData.course_code || '',
            awarding_body: formData.awarding_body || '',
            application_type: formData.application_type || '',
            date_started: formData.date_started || null,
            expected_submission_date: formData.expected_submission_date || null,
            lead_coordinator: formData.lead_coordinator || '',
            version: formData.version || '1.0'
        };

        // Extract sections (no deduplication - let backend handle unique constraints)
        const cleanedSections = {};
        for (let i = 1; i <= 8; i++) {
            cleanedSections[i] = (formData.sections[i] || []).filter(task => task.area);
        }

        // Extract risks from section 7
        const risks = (cleanedSections[7] || []).map(task => ({
            impact: task.description || '',
            mitigation: task.responsible || '',
            owner: task.source || '',
            review_date: null,
            status: task.status ? 'Completed' : 'Open'
        }));

        // Extract signoffs from section 8
        const signoffs = (cleanedSections[8] || []).map(task => ({
            name: task.description || '',
            role: task.area || '',
            sign_date: null
        }));

        return {
            documentControl,
            sections: cleanedSections || {},
            risks,
            signoffs
        };
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Validation
            if (!formData.course_title) {
                alert('Please select a course');
                setSaving(false);
                return;
            }
            
            console.log('Saving accreditation with formData:', formData);
            console.log('SelectedCourseId:', selectedCourseId);
            console.log('IsNew:', isNew);
            
            const transformedData = transformFormData();
            console.log('Transformed data for backend:', transformedData);
            
            // If coming from course selection on new page
            if (isNew && selectedCourseId) {
                if (accreditationExists && existingAccreditationId) {
                    // Update existing accreditation for this course
                    console.log('Updating existing accreditation:', existingAccreditationId);
                    await axios.put(`${API_URL}/accreditations/${existingAccreditationId}`, transformedData);
                    
                    // Save all tasks (skip section 8)
                    for (let sectionNum = 1; sectionNum <= 7; sectionNum++) {
                        const tasks = (formData.sections[sectionNum] || []).filter(task => task.area);
                        
                        for (const task of tasks) {
                            const taskData = {
                                section_number: sectionNum,
                                area: task.area,
                                description: task.description,
                                responsible: task.responsible,
                                status: task.status ? 'Completed' : 'Not Started',
                                notes: task.notes,
                                source: task.source,
                                evidence: task.evidence
                            };

                            if (task.id) {
                                await axios.put(
                                    `${API_URL}/accreditations/${existingAccreditationId}/tasks/${task.id}`,
                                    taskData
                                );
                            } else {
                                await axios.post(
                                    `${API_URL}/accreditations/${existingAccreditationId}/tasks`,
                                    taskData
                                );
                            }
                        }
                    }
                    
                    // Save section 8 signoffs (only the 3 required roles)
                    // For updates: Delete all old signoffs and re-insert
                    const requiredRoles = new Set(['Lead Coordinator', 'QA Manager', 'Principal / CEO']);
                    const signoffs = (formData.sections[8] || []).filter(s => requiredRoles.has(s.area));
                    console.log(`[UPDATE] Saving ${signoffs.length} signoffs`, signoffs);
                    
                    // First, delete all existing signoffs for this accreditation
                    try {
                        console.log(`[UPDATE] Deleting all old signoffs for accreditation ${existingAccreditationId}`);
                        await axios.delete(
                            `${API_URL}/accreditations/${existingAccreditationId}/signoffs/all`
                        );
                    } catch (err) {
                        console.warn(`[UPDATE] Could not delete old signoffs (may not exist):`, err.message);
                    }
                    
                    // Then insert all non-empty signoffs
                    for (const signoff of signoffs) {
                        // Skip completely empty signoffs (no name, date, or signature)
                        const isEmpty = !signoff.description && !signoff.source && !signoff.responsible;
                        console.log(`[UPDATE] Signoff: ${signoff.area}, isEmpty=${isEmpty}, data:`, signoff);
                        if (isEmpty) {
                            console.log(`[UPDATE] Skipping empty signoff: ${signoff.area}`);
                            continue;
                        }
                        
                        const signoffData = {
                            role: signoff.area,
                            name: signoff.description || '',
                            sign_date: signoff.source || null,
                            signature: signoff.responsible || ''
                        };
                        console.log(`[UPDATE] Sending signoff data:`, signoffData);
                        console.log(`[UPDATE] POST: /accreditations/${existingAccreditationId}/signoffs`);
                        
                        await axios.post(
                            `${API_URL}/accreditations/${existingAccreditationId}/signoffs`,
                            signoffData
                        );
                        console.log(`[UPDATE] Signoff saved: ${signoff.area}`);
                    }
                    
                    alert('Accreditation updated successfully!');
                    navigate('/course-accreditations');
                } else {
                    // Create new accreditation
                    console.log('Creating new accreditation');
                    const response = await axios.post(`${API_URL}/accreditations`, transformedData);
                    console.log('Create response:', response.data);
                    
                    const accreditationId = response.data?.data?.id || response.data?.id;
                    if (!accreditationId) {
                        throw new Error(`Invalid response from server: ${JSON.stringify(response.data)}`);
                    }
                    console.log('Created accreditation with ID:', accreditationId);
                    
                    // Save all tasks (skip section 8)
                    for (let sectionNum = 1; sectionNum <= 7; sectionNum++) {
                        const tasks = (formData.sections[sectionNum] || []).filter(task => task.area);
                        console.log(`Saving ${tasks.length} tasks for section ${sectionNum}`);
                        for (const task of tasks) {
                            const taskData = {
                                section_number: sectionNum,
                                area: task.area,
                                description: task.description,
                                responsible: task.responsible,
                                status: task.status ? 'Completed' : 'Not Started',
                                notes: task.notes,
                                source: task.source,
                                evidence: task.evidence
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
                    
                    // Save section 8 signoffs (only the 3 required roles)
                    const requiredSignoffRoles = new Set(['Lead Coordinator', 'QA Manager', 'Principal / CEO']);
                    const newSignoffs = (formData.sections[8] || []).filter(s => requiredSignoffRoles.has(s.area));
                    console.log(`[NEW] Saving ${newSignoffs.length} signoffs`, newSignoffs);
                    for (const signoff of newSignoffs) {
                        // Skip completely empty new signoffs
                        const isEmpty = !signoff.description && !signoff.source && !signoff.responsible;
                        console.log(`[NEW] Signoff: ${signoff.area}, isEmpty=${isEmpty}, data:`, signoff);
                        if (isEmpty) {
                            console.log(`[NEW] Skipping empty signoff: ${signoff.area}`);
                            continue;
                        }
                        
                        const signoffData = {
                            role: signoff.area,
                            name: signoff.description || '',
                            sign_date: signoff.source || null,
                            signature: signoff.responsible || ''
                        };
                        console.log(`[NEW] Sending signoff data:`, signoffData);
                        console.log(`[NEW] POST: /accreditations/${accreditationId}/signoffs`);

                        await axios.post(
                            `${API_URL}/accreditations/${accreditationId}/signoffs`,
                            signoffData
                        );
                        console.log(`[NEW] Signoff saved: ${signoff.area}`);
                    }
                    
                    alert('Accreditation created successfully!');
                    navigate('/course-accreditations');
                }
            } else {
                // Old flow: URL-based id
                console.log('Using old flow, id:', id);
                let accreditationId = id;

                if (isNew) {
                    console.log('Creating new accreditation (old flow)');
                    const response = await axios.post(`${API_URL}/accreditations`, transformedData);
                    console.log('Create response:', response.data);
                    
                    accreditationId = response.data?.data?.id || response.data?.id;
                    if (!accreditationId) {
                        throw new Error(`Invalid response from server: ${JSON.stringify(response.data)}`);
                    }
                    console.log('Created accreditation with ID:', accreditationId);
                } else {
                    console.log('Updating accreditation:', accreditationId);
                    await axios.put(`${API_URL}/accreditations/${accreditationId}`, transformedData);
                }

                for (let sectionNum = 1; sectionNum <= 8; sectionNum++) {
                    // Skip section 8 - handle separately as signoffs
                    if (sectionNum === 8) continue;
                    
                    const tasks = (formData.sections[sectionNum] || []).filter(task => task.area);
                    console.log(`Saving ${tasks.length} tasks for section ${sectionNum}`);
                    for (const task of tasks) {
                        const taskData = {
                            section_number: sectionNum,
                            area: task.area,
                            description: task.description,
                            responsible: task.responsible,
                            status: task.status ? 'Completed' : 'Not Started',
                            notes: task.notes,
                            source: task.source,
                            evidence: task.evidence
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
                
                // Save section 8 signoffs (only the 3 required roles)
                const oldFlowRequiredRoles = new Set(['Lead Coordinator', 'QA Manager', 'Principal / CEO']);
                const oldFlowSignoffs = (formData.sections[8] || []).filter(s => oldFlowRequiredRoles.has(s.area));
                console.log(`[OLD] Saving ${oldFlowSignoffs.length} signoffs`, oldFlowSignoffs);
                
                // For updates: Delete all old signoffs first, then re-insert
                if (!isNew) {
                    try {
                        console.log(`[OLD] Deleting all old signoffs for accreditation ${accreditationId}`);
                        await axios.delete(
                            `${API_URL}/accreditations/${accreditationId}/signoffs/all`
                        );
                    } catch (err) {
                        console.warn(`[OLD] Could not delete old signoffs:`, err.message);
                    }
                }
                
                // Insert all non-empty signoffs
                for (const signoff of oldFlowSignoffs) {
                    // Skip completely empty signoffs
                    const isEmpty = !signoff.description && !signoff.source && !signoff.responsible;
                    console.log(`[OLD] Signoff: ${signoff.area}, isEmpty=${isEmpty}, data:`, signoff);
                    if (isEmpty) {
                        console.log(`[OLD] Skipping empty signoff: ${signoff.area}`);
                        continue;
                    }
                    
                    const signoffData = {
                        role: signoff.area,
                        name: signoff.description || '',
                        sign_date: signoff.source || null,
                        signature: signoff.responsible || ''
                    };
                    console.log(`[OLD] Sending signoff data:`, signoffData);
                    console.log(`[OLD] POST: /accreditations/${accreditationId}/signoffs`);
                    
                    await axios.post(
                        `${API_URL}/accreditations/${accreditationId}/signoffs`,
                        signoffData
                    );
                    console.log(`[OLD] Signoff saved: ${signoff.area}`);
                }
                
                alert('Accreditation saved successfully!');
                navigate('/course-accreditations');
            }
        } catch (err) {
            console.error('Failed to save:', err);
            console.error('Error details:', err.response?.data || err.message);
            alert(`Error saving accreditation: ${err.response?.data?.message || err.message}`);
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

    const updateTask = (sectionNum, rowIdx, field, value) => {
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

    const handleAddTask = (sectionNum) => {
        if (!currentForm.area) {
            alert('Please select a task area');
            return;
        }
        
        const taskId = `temp_${Date.now()}_${Math.random()}`;

        setFormData(prev => {
            const newData = { ...prev };
            if (!newData.sections[sectionNum]) {
                newData.sections[sectionNum] = [];
            }
            
            if (editingRowIdx !== null && editingSection === sectionNum) {
                // Update existing
                const existingId = newData.sections[sectionNum][editingRowIdx]?.id;
                newData.sections[sectionNum][editingRowIdx] = { 
                    ...currentForm,
                    id: existingId
                };
                alert('Record updated in the section');
            } else {
                // Check if this exact task was just added (prevent duplicates from double-rendering)
                const isDuplicate = newData.sections[sectionNum].some(
                    task => task.area === currentForm.area &&
                            task.description === currentForm.description &&
                            task.responsible === currentForm.responsible
                );
                
                if (!isDuplicate) {
                    // Add new
                    const newTask = { 
                        ...currentForm,
                        tempId: taskId
                    };
                    newData.sections[sectionNum].push(newTask);
                    alert('Record added to the section successfully');
                }
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
            
            // Safety check: ensure section and row exist
            if (!newData.sections[sectionNum] || !newData.sections[sectionNum][rowIdx]) {
                console.error(`Section ${sectionNum} or row ${rowIdx} does not exist`);
                return newData;
            }
            
            const deletedTask = newData.sections[sectionNum][rowIdx];
            
            // If task has an ID, delete it from the database
            if (deletedTask && deletedTask.id && !isNew) {
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
                            <select
                                value={formData.course_title}
                                onChange={(e) => {
                                    const course = courses.find(c => (c.fullname || c.course_title) === e.target.value);
                                    if (course) {
                                        setFormData(prev => ({
                                            ...prev,
                                            course_title: course.fullname || course.course_title || '',
                                            course_code: course.shortname || course.course_code || ''
                                        }));
                                        // Check if accreditation exists for this course
                                        handleCourseSelect(course.id);
                                    }
                                }}
                                disabled={courseLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                            >
                                <option value="">-- Select a Course --</option>
                                {courses.length > 0 ? (
                                    courses.map(course => (
                                        <option key={course.id} value={course.fullname || course.course_title}>
                                            {course.fullname || course.course_title}
                                        </option>
                                    ))
                                ) : (
                                    !courseLoading && <option value="">No courses available</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Code</label>
                            <input
                                type="text"
                                value={formData.course_code}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600"
                                placeholder="Auto-filled from course selection"
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
                                {/* Section 7: Risk & Issue Log */}
                                {sectionNum === 7 && (
                                    <div>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                                            <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                                                {editingRowIdx !== null && editingSection === sectionNum ? 'Edit Risk/Issue' : 'Add New Risk/Issue'}
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-0.5">Risk / Issue *</label>
                                                    <input
                                                        type="text"
                                                        value={currentForm.area}
                                                        onChange={(e) => setCurrentForm(prev => ({ ...prev, area: e.target.value }))}
                                                        placeholder="Describe the risk or issue"
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-0.5">Impact *</label>
                                                    <input
                                                        type="text"
                                                        value={currentForm.description}
                                                        onChange={(e) => setCurrentForm(prev => ({ ...prev, description: e.target.value }))}
                                                        placeholder="Impact"
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-0.5">Mitigation / Action *</label>
                                                    <textarea
                                                        value={currentForm.source}
                                                        onChange={(e) => setCurrentForm(prev => ({ ...prev, source: e.target.value }))}
                                                        placeholder="Mitigation or action plan"
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                        rows="2"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-0.5">Owner *</label>
                                                    <input
                                                        type="text"
                                                        value={currentForm.responsible}
                                                        onChange={(e) => setCurrentForm(prev => ({ ...prev, responsible: e.target.value }))}
                                                        placeholder="Owner name"
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentForm.status}
                                                        onChange={(e) => setCurrentForm(prev => ({ ...prev, status: e.target.checked }))}
                                                        className="w-4 h-4"
                                                    />
                                                    <label className="text-xs font-semibold text-gray-700">Closed</label>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddTask(sectionNum)}
                                                        className="px-3 py-1 bg-scl-purple text-white rounded text-xs font-semibold hover:bg-scl-purple/90"
                                                    >
                                                        {editingRowIdx !== null && editingSection === sectionNum ? 'Update' : 'Add'}
                                                    </button>
                                                    {(editingRowIdx !== null || currentForm.area) && (
                                                        <button
                                                            type="button"
                                                            onClick={handleFormReset}
                                                            className="px-3 py-1 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {(formData.sections[sectionNum] || []).length > 0 && (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Risk / Issue</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Impact</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Mitigation / Action</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Owner</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Status</th>
                                                            <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(formData.sections[sectionNum] || []).map((task, idx) => (
                                                            <tr key={task.id || task.tempId || idx} className="hover:bg-blue-50">
                                                                <td className="border border-gray-300 px-3 py-2 text-sm font-medium">{task.area}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{task.description.substring(0, 30)}...</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{task.source?.substring(0, 30)}...</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-sm">{task.responsible}</td>
                                                                <td className="border border-gray-300 px-3 py-2 text-center">
                                                                    <span className={task.status ? "text-green-600 font-semibold" : "text-orange-600 font-semibold"}>
                                                                        {task.status ? "Closed" : "Open"}
                                                                    </span>
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
                                                                            if (window.confirm('Delete this risk/issue?')) {
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

                                {/* Section 8: Sign-off */}
                                {sectionNum === 8 && (
                                    <div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Name</th>
                                                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Role</th>
                                                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Date</th>
                                                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Signature</th>
                                                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(formData.sections[sectionNum] || []).map((task, idx) => (
                                                        <tr key={task.id || task.tempId || idx} className="hover:bg-blue-50">
                                                            <td className="border border-gray-300 px-3 py-2 text-sm font-medium">{task.area}</td>
                                                            <td className="border border-gray-300 px-3 py-2 text-sm">
                                                                <input
                                                                    type="text"
                                                                    value={task.description || ''}
                                                                    onChange={(e) => {
                                                                        const sections = { ...formData.sections };
                                                                        sections[sectionNum][idx].description = e.target.value;
                                                                        setFormData(prev => ({ ...prev, sections }));
                                                                    }}
                                                                    placeholder="Role"
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            </td>
                                                            <td className="border border-gray-300 px-3 py-2 text-sm">
                                                                <input
                                                                    type="date"
                                                                    value={task.source || ''}
                                                                    onChange={(e) => {
                                                                        const sections = { ...formData.sections };
                                                                        sections[sectionNum][idx].source = e.target.value;
                                                                        setFormData(prev => ({ ...prev, sections }));
                                                                    }}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            </td>
                                                            <td className="border border-gray-300 px-3 py-2 text-sm">
                                                                <input
                                                                    type="text"
                                                                    value={task.responsible || ''}
                                                                    onChange={(e) => {
                                                                        const sections = { ...formData.sections };
                                                                        sections[sectionNum][idx].responsible = e.target.value;
                                                                        setFormData(prev => ({ ...prev, sections }));
                                                                    }}
                                                                    placeholder="Signature"
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            </td>
                                                            <td className="border border-gray-300 px-3 py-2 text-center">
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm('Reset this sign-off entry?')) {
                                                                            const sections = { ...formData.sections };
                                                                            sections[sectionNum][idx] = {
                                                                                area: task.area,
                                                                                description: '',
                                                                                source: '',
                                                                                responsible: ''
                                                                            };
                                                                            setFormData(prev => ({ ...prev, sections }));
                                                                        }
                                                                    }}
                                                                    className="text-red-500 hover:text-red-700 font-semibold text-sm"
                                                                >
                                                                    Clear
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Other Sections: Generic Form */}
                                {sectionNum !== 7 && sectionNum !== 8 && (
                                    <div>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                                            <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                                                {editingRowIdx !== null && editingSection === sectionNum ? 'Edit Task' : 'Add New Task'}
                                            </h4>
                                            
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
                                                        onClick={() => handleAddTask(sectionNum)}
                                                        className="px-3 py-1 bg-scl-purple text-white rounded text-xs font-semibold hover:bg-scl-purple/90"
                                                    >
                                                        {editingRowIdx !== null && editingSection === sectionNum ? 'Update' : 'Add'}
                                                    </button>
                                                    {(editingRowIdx !== null || currentForm.area) && (
                                                        <button
                                                            type="button"
                                                            onClick={handleFormReset}
                                                            className="px-3 py-1 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

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

export default CourseAccreditationsDetail;
