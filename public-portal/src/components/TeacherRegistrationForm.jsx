import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    AlertCircle,
    ArrowLeft,
    Briefcase,
    CheckCircle2,
    FileText,
    GraduationCap,
    Loader2,
    Upload,
    User,
    UserCheck
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const TeacherRegistrationForm = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [reference, setReference] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [cvFile, setCvFile] = useState(null);
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

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(`${API_URL}/students/courses?activeOnly=true`);
                if (response.data?.success) {
                    setCourses(response.data.data || []);
                }
            } catch {
                setStatus({ type: 'error', message: 'Could not load course list. Please refresh and try again.' });
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    const handleChange = (field, value) => {
        if (field === 'selected_course_code') {
            const selectedCourse = courses.find((c) => String(c.course_code) === String(value));
            setFormData((prev) => ({
                ...prev,
                selected_course_code: value,
                selected_course_title: selectedCourse?.course_title || '',
                selected_course_type: selectedCourse?.course_type || ''
            }));
            return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => payload.append(key, value ?? ''));
            if (cvFile) payload.append('cv_resume', cvFile);

            const response = await axios.post(`${API_URL}/students/teacher-registrations`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data?.success) {
                setReference(response.data?.data?.registration_reference || '');
                setSubmitted(true);
            } else {
                setStatus({ type: 'error', message: response.data?.message || 'Submission failed. Please try again.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Submission failed. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    // Success screen
    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col">
                <header className="bg-[#0d2c57] shadow-sm">
                    <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                        <img src="/assets/scl_logo_collapsed_white.png" alt="Stratford College London" className="h-12 w-12 object-contain" />
                        <div>
                            <h1 className="text-xl font-bold text-white">Stratford College London</h1>
                            <p className="text-sm text-blue-100">Teacher Registration</p>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center px-6 py-16">
                    <div className="bg-white rounded-2xl shadow-lg p-12 max-w-lg w-full text-center">
                        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
                        <p className="text-gray-500 mb-6">
                            Thank you for applying to teach at Stratford College London. Our admissions team will review your application and contact you shortly.
                        </p>
                        {reference && (
                            <div className="bg-indigo-50 rounded-lg px-6 py-4 mb-6">
                                <p className="text-sm text-indigo-600 font-medium">Your reference number</p>
                                <p className="text-2xl font-bold text-indigo-800 mt-1">{reference}</p>
                                <p className="text-xs text-indigo-500 mt-1">Please keep this for your records</p>
                            </div>
                        )}
                        <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                            Back to Portal Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col">
            {/* Header */}
            <header className="bg-[#0d2c57] shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="text-blue-100 hover:text-white mr-2">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <img src="/assets/scl_logo_collapsed_white.png" alt="Stratford College London" className="h-12 w-12 object-contain" />
                    <div>
                        <h1 className="text-xl font-bold text-white">Stratford College London</h1>
                        <p className="text-sm text-blue-100">Teacher Registration</p>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-10 px-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <UserCheck className="w-8 h-8 text-indigo-200" />
                    <h2 className="text-3xl font-bold">Teacher Registration</h2>
                </div>
                <p className="text-indigo-100 max-w-xl mx-auto">
                    Complete your registration below. Select the course you wish to teach and upload your CV. Our team will be in touch once your application is reviewed.
                </p>
            </div>

            <div className="max-w-4xl mx-auto w-full px-6 py-10 flex-1">
                {status.message && (
                    <div className="mb-6 rounded-lg border p-4 flex items-start gap-3 bg-red-50 text-red-800 border-red-200">
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span>{status.message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl shadow p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <User className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                                <input value={formData.first_name} onChange={(e) => handleChange('first_name', e.target.value)} placeholder="First name" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                                <input value={formData.last_name} onChange={(e) => handleChange('last_name', e.target.value)} placeholder="Last name" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                                <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="Email address" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                <input value={formData.contact_number} onChange={(e) => handleChange('contact_number', e.target.value)} placeholder="Contact number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                                <input value={formData.nationality} onChange={(e) => handleChange('nationality', e.target.value)} placeholder="Nationality" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Employer</label>
                                <input value={formData.current_employer} onChange={(e) => handleChange('current_employer', e.target.value)} placeholder="Current employer" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Course Selection */}
                    <div className="bg-white rounded-2xl shadow p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Course & Teaching Role</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Course <span className="text-red-500">*</span></label>
                                {loadingCourses ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading courses...
                                    </div>
                                ) : (
                                    <select value={formData.selected_course_code} onChange={(e) => handleChange('selected_course_code', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                                        <option value="">Choose the course you wish to teach</option>
                                        {courses.map((course) => (
                                            <option key={`${course.course_code}-${course.id || course.course_title}`} value={course.course_code}>
                                                {course.course_title} ({course.course_code})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            {formData.selected_course_title && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Course Title</label>
                                    <input value={formData.selected_course_title} readOnly className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-600" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Role</label>
                                <select value={formData.teaching_role} onChange={(e) => handleChange('teaching_role', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="editingteacher">Editing Teacher (full course access)</option>
                                    <option value="teacher">Teacher (non-editing)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Professional Background */}
                    <div className="bg-white rounded-2xl shadow p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Professional Background</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                                <input value={formData.highest_qualification} onChange={(e) => handleChange('highest_qualification', e.target.value)} placeholder="e.g. PhD, MBA, BSc" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Teaching Experience</label>
                                <input type="number" min="0" value={formData.years_of_experience} onChange={(e) => handleChange('years_of_experience', e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Statement</label>
                            <textarea value={formData.teaching_statement} onChange={(e) => handleChange('teaching_statement', e.target.value)} rows={5} placeholder="Briefly describe your teaching philosophy and subject expertise" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>

                    {/* CV Upload */}
                    <div className="bg-white rounded-2xl shadow p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Supporting Document</h2>
                        </div>
                        <label className="flex items-center gap-4 px-5 py-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-colors">
                            <FileText className="w-8 h-8 text-gray-400 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-700">{cvFile ? cvFile.name : 'Upload CV / Resume'}</p>
                                <p className="text-sm text-gray-400 mt-0.5">PDF, JPG or PNG — max 10 MB</p>
                            </div>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                        </label>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <button type="button" onClick={() => navigate('/')} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                            ← Back to Portal Home
                        </button>
                        <button type="submit" disabled={submitting} className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-semibold inline-flex items-center gap-2">
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {submitting ? 'Submitting...' : 'Submit Teacher Application'}
                        </button>
                    </div>
                </form>
            </div>

            <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-400 mt-4">
                &copy; {new Date().getFullYear()} Stratford College London. All rights reserved.
            </footer>
        </div>
    );
};

export default TeacherRegistrationForm;
