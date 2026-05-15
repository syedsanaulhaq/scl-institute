import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    BookOpen,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    GraduationCap,
    Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentApplication = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [intakes, setIntakes] = useState([]);
    const [intakesLoading, setIntakesLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        // Personal Information
        first_name: '',
        middle_names: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        nationality: '',
        email: '',
        contact_number: '',
        
        // Address Information
        address_line1: '',
        address_line2: '',
        town_city: '',
        postcode: '',
        country_of_residence: 'India',
        
        // Course Information
        course_code: '',
        course_title: '',
        course_type: '',
        mode_of_study: '',
        intake_start_date: '',
        entry_route: 'Standard',
        
        // Academic Information
        highest_qualification: '',
        institution_name: '',
        year_completed: '',
        relevant_work_experience: '',
        english_proficiency: '',
        english_score: '',
        
        // Support & Consents
        has_disabilities_support_needs: false,
        disability_support_details: '',
        consent_gdpr: false,
        consent_data_sharing: false,
        consent_marketing: false,
        declaration_truth: false,
        digital_signature: ''
    });

    // Fetch courses from Moodle
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setCoursesLoading(true);
                const response = await axios.get(`${API_URL}/students/courses?scope=admissions&activeOnly=true`);
                setCourses(response.data?.data || []);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setCourses([]);
            } finally {
                setCoursesLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCourseSelect = async (course) => {
        setFormData(prev => ({
            ...prev,
            course_code: course.course_code,
            course_title: course.course_title,
            course_type: course.course_type,
            intake_start_date: '',
            mode_of_study: course.full_time_available ? 'Full-time' : course.part_time_available ? 'Part-time' : ''
        }));
        // Fetch intakes for this course
        try {
            setIntakesLoading(true);
            setIntakes([]);
            const res = await axios.get(`${API_URL}/students/course-intakes/${encodeURIComponent(course.course_code)}`);
            setIntakes(res.data?.data || []);
        } catch (err) {
            console.error('Error fetching intakes:', err);
            setIntakes([]);
        } finally {
            setIntakesLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate required fields
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.course_code) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        if (!formData.consent_gdpr || !formData.declaration_truth) {
            setError('Please accept the required consents and declarations');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/students/applications`, {
                first_name: formData.first_name,
                middle_names: formData.middle_names,
                last_name: formData.last_name,
                email: formData.email,
                contact_number: formData.contact_number,
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                nationality: formData.nationality,
                address_line1: formData.address_line1,
                address_line2: formData.address_line2,
                town_city: formData.town_city,
                postcode: formData.postcode,
                country_of_residence: formData.country_of_residence,
                course_code: formData.course_code,
                course_title: formData.course_title,
                course_type: formData.course_type,
                mode_of_study: formData.mode_of_study,
                intake_start_date: formData.intake_start_date,
                entry_route: formData.entry_route,
                highest_qualification: formData.highest_qualification,
                institution_name: formData.institution_name,
                year_completed: formData.year_completed,
                relevant_work_experience: formData.relevant_work_experience,
                english_proficiency: formData.english_proficiency,
                english_score: formData.english_score,
                has_disabilities_support_needs: formData.has_disabilities_support_needs,
                disability_support_details: formData.disability_support_details,
                consent_gdpr: formData.consent_gdpr,
                consent_data_sharing: formData.consent_data_sharing,
                consent_marketing: formData.consent_marketing,
                declaration_truth: formData.declaration_truth,
                digital_signature: formData.digital_signature
            });

            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Your application has been successfully submitted and saved to our database. Our admissions team will review your application and contact you soon.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/')}
                            className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-600 p-2 rounded-xl">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Student Application Form</h1>
                                <p className="text-sm text-gray-600">SCL Institute - Register for courses</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
                        <h2 className="text-2xl font-bold">New Student Registration</h2>
                        <p className="text-blue-100 mt-2">Complete all required fields to apply</p>
                    </div>

                    {error && (
                        <div className="mx-8 mt-6 bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <User className="h-6 w-6 mr-2 text-blue-600" />
                                Personal Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Enter your last name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Middle Names
                                    </label>
                                    <input
                                        type="text"
                                        name="middle_names"
                                        value={formData.middle_names}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Enter your middle names (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Contact Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="contact_number"
                                        value={formData.contact_number}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Date of Birth *
                                    </label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Gender *
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nationality *
                                    </label>
                                    <input
                                        type="text"
                                        name="nationality"
                                        value={formData.nationality}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Enter your nationality"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <MapPin className="h-6 w-6 mr-2 text-blue-600" />
                                Address Information
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Address Line 1 *
                                    </label>
                                    <input
                                        type="text"
                                        name="address_line1"
                                        value={formData.address_line1}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Enter street address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Address Line 2
                                    </label>
                                    <input
                                        type="text"
                                        name="address_line2"
                                        value={formData.address_line2}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Enter additional address (optional)"
                                    />
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            City/Town *
                                        </label>
                                        <input
                                            type="text"
                                            name="town_city"
                                            value={formData.town_city}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Enter city"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Postcode *
                                        </label>
                                        <input
                                            type="text"
                                            name="postcode"
                                            value={formData.postcode}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Enter postcode"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Country *
                                        </label>
                                        <input
                                            type="text"
                                            name="country_of_residence"
                                            value={formData.country_of_residence}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder="Enter country"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Course Selection */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
                                Select Your Course
                            </h3>
                            
                            {coursesLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                                    <span className="text-gray-600">Loading available courses...</span>
                                </div>
                            ) : courses.length === 0 ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <p className="text-yellow-800">No courses available at the moment. Please try again later.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-4 mb-6">
                                        {courses.map((course, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleCourseSelect(course)}
                                                className={`p-4 border-2 rounded-lg text-left transition-all ${
                                                    formData.course_code === course.course_code
                                                        ? 'border-blue-600 bg-blue-50'
                                                        : 'border-gray-200 bg-white hover:border-blue-300'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{course.course_title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{course.course_code}</p>
                                                        <p className="text-xs text-gray-500 mt-2">{course.description}</p>
                                                    </div>
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{course.course_type}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {formData.course_code && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                            <p className="text-sm font-semibold text-gray-900">Selected Course:</p>
                                            <p className="text-gray-700 mt-1">{formData.course_title} <span className="text-xs text-blue-600">({formData.course_code})</span></p>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mode of Study *
                                    </label>
                                    <select
                                        name="mode_of_study"
                                        value={formData.mode_of_study}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    >
                                        <option value="">Select mode of study</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Online">Online</option>
                                        <option value="Blended">Blended</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Intake / Start Date *
                                    </label>
                                    {intakesLoading ? (
                                        <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                                            <Loader className="h-4 w-4 animate-spin" /> Loading intakes...
                                        </div>
                                    ) : intakes.length > 0 ? (
                                        <select
                                            name="intake_start_date"
                                            value={formData.intake_start_date}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        >
                                            <option value="">Select an intake</option>
                                            {intakes.map(intake => (
                                                <option key={intake.id} value={intake.intake_start_date || intake.intake_label}>
                                                    {intake.intake_label}{intake.intake_start_date ? ` — ${new Date(intake.intake_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="date"
                                            name="intake_start_date"
                                            value={formData.intake_start_date}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                            placeholder={formData.course_code ? 'No scheduled intakes — enter date manually' : 'Please select a course first'}
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Entry Route *
                                    </label>
                                    <select
                                        name="entry_route"
                                        value={formData.entry_route}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    >
                                        <option value="Standard">Standard</option>
                                        <option value="RPL">Recognition of Prior Learning</option>
                                        <option value="Mature Student">Mature Student</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                                Academic Background
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Highest Qualification *
                                    </label>
                                    <select
                                        name="highest_qualification"
                                        value={formData.highest_qualification}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    >
                                        <option value="">Select qualification</option>
                                        <option value="GCSE">GCSE</option>
                                        <option value="A-Level">A-Level</option>
                                        <option value="Level 3 Diploma">Level 3 Diploma</option>
                                        <option value="HND">HND</option>
                                        <option value="Degree">Degree</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Institution Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="institution_name"
                                        value={formData.institution_name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Enter institution name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Year Completed *
                                    </label>
                                    <input
                                        type="date"
                                        name="year_completed"
                                        value={formData.year_completed}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        English Proficiency *
                                    </label>
                                    <select
                                        name="english_proficiency"
                                        value={formData.english_proficiency}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    >
                                        <option value="">Select test type</option>
                                        <option value="IELTS">IELTS</option>
                                        <option value="TOEFL">TOEFL</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        English Score
                                    </label>
                                    <input
                                        type="text"
                                        name="english_score"
                                        value={formData.english_score}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="e.g., 6.5 IELTS"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Relevant Work Experience
                                    </label>
                                    <input
                                        type="text"
                                        name="relevant_work_experience"
                                        value={formData.relevant_work_experience}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="e.g., 3 years in IT"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Support Needs */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Support Requirements</h3>
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <label className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        name="has_disabilities_support_needs"
                                        checked={formData.has_disabilities_support_needs}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-700 font-medium">I require disability support or have additional needs</span>
                                </label>
                                {formData.has_disabilities_support_needs && (
                                    <textarea
                                        name="disability_support_details"
                                        value={formData.disability_support_details}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                                        placeholder="Please describe your support requirements"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Consents & Declaration */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Consents & Declaration</h3>
                            <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                                <label className="flex items-start">
                                    <input
                                        type="checkbox"
                                        name="consent_gdpr"
                                        checked={formData.consent_gdpr}
                                        onChange={handleInputChange}
                                        required
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1 flex-shrink-0"
                                    />
                                    <span className="ml-3 text-gray-700 text-sm">
                                        I consent to the processing of my personal data in accordance with GDPR regulations. *
                                    </span>
                                </label>
                                <label className="flex items-start">
                                    <input
                                        type="checkbox"
                                        name="consent_data_sharing"
                                        checked={formData.consent_data_sharing}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1 flex-shrink-0"
                                    />
                                    <span className="ml-3 text-gray-700 text-sm">
                                        I consent to my data being shared with relevant educational bodies
                                    </span>
                                </label>
                                <label className="flex items-start">
                                    <input
                                        type="checkbox"
                                        name="consent_marketing"
                                        checked={formData.consent_marketing}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1 flex-shrink-0"
                                    />
                                    <span className="ml-3 text-gray-700 text-sm">
                                        I would like to receive marketing communications from SCL Institute
                                    </span>
                                </label>
                                <label className="flex items-start">
                                    <input
                                        type="checkbox"
                                        name="declaration_truth"
                                        checked={formData.declaration_truth}
                                        onChange={handleInputChange}
                                        required
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1 flex-shrink-0"
                                    />
                                    <span className="ml-3 text-gray-700 text-sm">
                                        I declare that all information provided in this application is true and accurate. *
                                    </span>
                                </label>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
                                        Digital Signature (Type your full name) *
                                    </label>
                                    <input
                                        type="text"
                                        name="digital_signature"
                                        value={formData.digital_signature}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Type your full name as signature"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="h-5 w-5 animate-spin mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentApplication;
