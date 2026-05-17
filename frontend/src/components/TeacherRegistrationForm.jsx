import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, Briefcase, CheckCircle2, FileText, GraduationCap, Loader2, Upload, User, Wand2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const TeacherRegistrationForm = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        nationality: '',
        highest_qualification: '',
        years_of_experience: '',
        current_employer: '',
        teaching_statement: '',
        selected_course_code: '',
        selected_course_title: '',
        selected_course_type: '',
        teaching_role: 'editingteacher'
    });
    const [cvFile, setCvFile] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(`${API_URL}/students/courses?activeOnly=true`);
                if (response.data?.success) {
                    setCourses(response.data.data || []);
                }
            } catch (error) {
                console.error('Failed to load courses for teacher registration:', error);
                setStatus({ type: 'error', message: 'Failed to load course list.' });
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, []);

    const fillDummyData = () => {
        const dummyPeople = [
            { first_name: 'Dr. Michael', last_name: 'Carter', email: `michael.carter.${Date.now()}@example.com`, contact_number: '07700900123', nationality: 'British', current_employer: 'University of Westminster', highest_qualification: 'PhD in Business Management', years_of_experience: '12', teaching_statement: 'I am an experienced educator specialising in business strategy and management. I have taught at undergraduate and postgraduate level for over 12 years, with a focus on real-world application of business theory. My approach combines case study analysis with industry guest lectures.' },
            { first_name: 'Prof. Amelia', last_name: 'Hassan', email: `amelia.hassan.${Date.now()}@example.com`, contact_number: '07800900456', nationality: 'Pakistani', current_employer: 'London Metropolitan University', highest_qualification: 'PhD in Engineering', years_of_experience: '9', teaching_statement: 'With nearly a decade of teaching experience in engineering disciplines, I bring both academic rigour and industry experience to the classroom. I am passionate about project-based learning and have supervised over 50 final-year projects.' },
            { first_name: 'Dr. James', last_name: 'Okafor', email: `james.okafor.${Date.now()}@example.com`, contact_number: '07900100789', nationality: 'Nigerian', current_employer: 'Middlesex University', highest_qualification: 'MSc in Computer Science', years_of_experience: '7', teaching_statement: 'I specialise in software engineering and data analytics. I have a strong track record of preparing students for careers in tech through hands-on coding workshops and live project work with industry partners.' },
        ];
        const person = dummyPeople[Math.floor(Math.random() * dummyPeople.length)];
        const firstCourse = courses[0];
        setFormData(prev => ({
            ...prev,
            ...person,
            selected_course_code: firstCourse?.course_code || '',
            selected_course_title: firstCourse?.course_title || '',
            selected_course_type: firstCourse?.course_type || '',
            teaching_role: 'editingteacher'
        }));
    };

    const handleChange = (field, value) => {
        if (field === 'selected_course_code') {
            const selectedCourse = courses.find((course) => String(course.course_code) === String(value));
            setFormData((prev) => ({
                ...prev,
                selected_course_code: value,
                selected_course_title: selectedCourse?.course_title || '',
                selected_course_type: selectedCourse?.course_type || ''
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                payload.append(key, value ?? '');
            });
            if (cvFile) {
                payload.append('cv_resume', cvFile);
            }

            const response = await axios.post(`${API_URL}/students/teacher-registrations`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data?.success) {
                const reference = response.data?.data?.registration_reference;
                setStatus({ type: 'success', message: 'Teacher registration submitted successfully.' });
                setTimeout(() => {
                    navigate(`/teacher-registrations${reference ? `?highlight=${encodeURIComponent(reference)}` : ''}`);
                }, 800);
            } else {
                setStatus({ type: 'error', message: response.data?.message || 'Failed to submit teacher registration.' });
            }
        } catch (error) {
            console.error('Error submitting teacher registration:', error);
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to submit teacher registration.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">New Faculty Application</h1>
                    <p className="text-gray-600 mt-2">Submit a faculty application and assign the faculty member to a specific Moodle course after approval.</p>
                </div>
                <button
                    type="button"
                    onClick={fillDummyData}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
                >
                    <Wand2 className="w-4 h-4" />
                    Fill Demo Data
                </button>
            </div>

            {status.message && (
                <div className={`mb-6 rounded-lg border p-4 flex items-start gap-3 ${
                    status.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                    <span>{status.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <User className="w-5 h-5 text-gray-500" />
                        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={formData.first_name} onChange={(e) => handleChange('first_name', e.target.value)} placeholder="First name" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                        <input value={formData.last_name} onChange={(e) => handleChange('last_name', e.target.value)} placeholder="Last name" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                        <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="Email address" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                        <input value={formData.contact_number} onChange={(e) => handleChange('contact_number', e.target.value)} placeholder="Contact number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        <input value={formData.nationality} onChange={(e) => handleChange('nationality', e.target.value)} placeholder="Nationality" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        <input value={formData.current_employer} onChange={(e) => handleChange('current_employer', e.target.value)} placeholder="Current employer" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <GraduationCap className="w-5 h-5 text-gray-500" />
                        <h2 className="text-xl font-bold text-gray-900">Course Assignment</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select value={formData.selected_course_code} onChange={(e) => handleChange('selected_course_code', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                            <option value="">Select course</option>
                            {courses.map((course) => (
                                <option key={`${course.course_code}-${course.id || course.moodle_course_id || course.course_title}`} value={course.course_code}>
                                    {course.course_title} ({course.course_code})
                                </option>
                            ))}
                        </select>
                        <select value={formData.teaching_role} onChange={(e) => handleChange('teaching_role', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="editingteacher">Editing Faculty</option>
                            <option value="teacher">Faculty</option>
                        </select>
                        <input value={formData.selected_course_title} readOnly placeholder="Course title" className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg" />
                        <input value={formData.selected_course_type} readOnly placeholder="Course type" className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg" />
                    </div>
                    {loadingCourses && <p className="text-sm text-gray-500 mt-3">Loading courses...</p>}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Briefcase className="w-5 h-5 text-gray-500" />
                        <h2 className="text-xl font-bold text-gray-900">Professional Background</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input value={formData.highest_qualification} onChange={(e) => handleChange('highest_qualification', e.target.value)} placeholder="Highest qualification" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        <input type="number" min="0" value={formData.years_of_experience} onChange={(e) => handleChange('years_of_experience', e.target.value)} placeholder="Years of teaching experience" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <textarea value={formData.teaching_statement} onChange={(e) => handleChange('teaching_statement', e.target.value)} rows={5} placeholder="Teaching statement / summary of subject expertise" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Upload className="w-5 h-5 text-gray-500" />
                        <h2 className="text-xl font-bold text-gray-900">Supporting Document</h2>
                    </div>
                    <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{cvFile ? cvFile.name : 'Upload CV / Resume (PDF, JPG, PNG)'}</span>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                    </label>
                </div>

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/teacher-registrations')} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 inline-flex items-center gap-2">
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {submitting ? 'Submitting...' : 'Submit Faculty Application'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeacherRegistrationForm;
