import { useState } from 'react';
import axios from 'axios';
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    BookOpen,
    FileText,
    Upload,
    Save,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    GraduationCap,
    Loader2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://system.sclsandbox.xyz/api';

// Theme configurations
const themes = {
    modern: {
        name: 'Modern Blue',
        primary: 'blue-600',
        secondary: 'blue-700', 
        accent: 'yellow-500',
        gradient: 'from-blue-600 to-blue-800',
        bgPattern: 'bg-gradient-to-br from-blue-50 to-white'
    },
    elegant: {
        name: 'Elegant Purple',
        primary: 'purple-600',
        secondary: 'purple-800',
        accent: 'gold-400',
        gradient: 'from-purple-600 to-purple-900',
        bgPattern: 'bg-gradient-to-br from-purple-50 to-white'
    },
    green: {
        name: 'Nature Green',
        primary: 'emerald-600',
        secondary: 'emerald-800',
        accent: 'orange-500',
        gradient: 'from-emerald-600 to-teal-700',
        bgPattern: 'bg-gradient-to-br from-emerald-50 to-white'
    },
    corporate: {
        name: 'Corporate Dark',
        primary: 'slate-700',
        secondary: 'slate-900',
        accent: 'blue-500',
        gradient: 'from-slate-700 to-slate-900',
        bgPattern: 'bg-gradient-to-br from-slate-100 to-white'
    },
    warm: {
        name: 'Warm Orange',
        primary: 'orange-600',
        secondary: 'red-700',
        accent: 'yellow-400',
        gradient: 'from-orange-600 to-red-600',
        bgPattern: 'bg-gradient-to-br from-orange-50 to-white'
    }
};

const PublicApplicationForm = ({ selectedTheme = 'modern', onBack }) => {
    const theme = themes[selectedTheme];
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        // Personal Information
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        
        // Address Information
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        
        // Academic Information
        program: '',
        previousEducation: '',
        institution: '',
        graduationYear: '',
        percentage: '',
        
        // Additional Information
        experience: '',
        motivation: '',
        
        // Emergency Contact
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: ''
    });

    const programs = [
        'B.Tech Computer Science Engineering',
        'B.Tech Mechanical Engineering',
        'B.Tech Electrical Engineering',
        'MBA Business Administration',
        'M.Sc Data Science',
        'B.Com Commerce',
        'BCA Computer Applications',
        'MCA Computer Applications'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_URL}/applications`, {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                date_of_birth: formData.dateOfBirth,
                gender: formData.gender,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zipCode,
                country: formData.country,
                program_name: formData.program,
                previous_education: formData.previousEducation,
                institution: formData.institution,
                graduation_year: formData.graduationYear,
                percentage: formData.percentage,
                experience: formData.experience,
                motivation: formData.motivation,
                emergency_contact_name: formData.emergencyName,
                emergency_contact_phone: formData.emergencyPhone,
                emergency_contact_relation: formData.emergencyRelation
            });

            setSuccess(true);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                dateOfBirth: '',
                gender: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'India',
                program: '',
                previousEducation: '',
                institution: '',
                graduationYear: '',
                percentage: '',
                experience: '',
                motivation: '',
                emergencyName: '',
                emergencyPhone: '',
                emergencyRelation: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={`min-h-screen ${theme.bgPattern} flex items-center justify-center p-4`}>
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for your interest in SCL Institute! Your application has been successfully submitted. 
                        Our admissions team will review your application and contact you within 2-3 business days.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => setSuccess(false)}
                            className={`w-full bg-${theme.primary} text-white py-3 rounded-lg font-semibold hover:bg-${theme.secondary} transition-colors`}
                        >
                            Submit Another Application
                        </button>
                        <button
                            onClick={onBack}
                            className="w-full text-gray-600 py-3 rounded-lg font-semibold hover:text-gray-900 transition-colors"
                        >
                            Back to Homepage
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${theme.bgPattern}`}>
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center">
                        <button
                            onClick={onBack}
                            className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className={`bg-${theme.primary} p-2 rounded-xl`}>
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Apply to SCL Institute</h1>
                                <p className="text-sm text-gray-600">Join thousands of successful graduates</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Form Header */}
                    <div className={`bg-gradient-to-r ${theme.gradient} px-8 py-6 text-white`}>
                        <h2 className="text-2xl font-bold">Student Application Form</h2>
                        <p className="text-white/90 mt-2">Please fill out all required information carefully</p>
                    </div>

                    {error && (
                        <div className="mx-8 mt-6 bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Personal Information */}
                        <div>
                            <h3 className={`text-xl font-bold text-gray-900 mb-6 flex items-center`}>
                                <User className={`h-6 w-6 mr-2 text-${theme.primary}`} />
                                Personal Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                        placeholder="Enter your last name"
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
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                        placeholder="Enter your email address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Date of Birth *
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
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
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div>
                            <h3 className={`text-xl font-bold text-gray-900 mb-6 flex items-center`}>
                                <MapPin className={`h-6 w-6 mr-2 text-${theme.primary}`} />
                                Address Information
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Address *
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        rows="3"
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors resize-none`}
                                        placeholder="Enter your complete address"
                                    />
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                            placeholder="Enter city"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                            placeholder="Enter state"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            ZIP Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            required
                                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                            placeholder="Enter ZIP code"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div>
                            <h3 className={`text-xl font-bold text-gray-900 mb-6 flex items-center`}>
                                <BookOpen className={`h-6 w-6 mr-2 text-${theme.primary}`} />
                                Academic Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Program of Interest *
                                    </label>
                                    <select
                                        name="program"
                                        value={formData.program}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                    >
                                        <option value="">Select a program</option>
                                        {programs.map((program) => (
                                            <option key={program} value={program}>
                                                {program}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Previous Education Level *
                                    </label>
                                    <select
                                        name="previousEducation"
                                        value={formData.previousEducation}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                    >
                                        <option value="">Select education level</option>
                                        <option value="high_school">High School (12th)</option>
                                        <option value="bachelor">Bachelor's Degree</option>
                                        <option value="master">Master's Degree</option>
                                        <option value="diploma">Diploma</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Institution Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="institution"
                                        value={formData.institution}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                        placeholder="Enter institution name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Graduation Year *
                                    </label>
                                    <input
                                        type="number"
                                        name="graduationYear"
                                        value={formData.graduationYear}
                                        onChange={handleInputChange}
                                        required
                                        min="1990"
                                        max="2030"
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                        placeholder="Enter graduation year"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Percentage/CGPA *
                                    </label>
                                    <input
                                        type="text"
                                        name="percentage"
                                        value={formData.percentage}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                        placeholder="e.g., 85% or 8.5 CGPA"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div>
                            <h3 className={`text-xl font-bold text-gray-900 mb-6 flex items-center`}>
                                <FileText className={`h-6 w-6 mr-2 text-${theme.primary}`} />
                                Additional Information
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Work Experience (if any)
                                    </label>
                                    <textarea
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors resize-none`}
                                        placeholder="Describe your work experience (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Why do you want to join SCL Institute? *
                                    </label>
                                    <textarea
                                        name="motivation"
                                        value={formData.motivation}
                                        onChange={handleInputChange}
                                        required
                                        rows="4"
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors resize-none`}
                                        placeholder="Tell us about your motivation and career goals"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div>
                            <h3 className={`text-xl font-bold text-gray-900 mb-6 flex items-center`}>
                                <Phone className={`h-6 w-6 mr-2 text-${theme.primary}`} />
                                Emergency Contact
                            </h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Contact Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="emergencyName"
                                        value={formData.emergencyName}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                        placeholder="Enter contact name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="emergencyPhone"
                                        value={formData.emergencyPhone}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Relationship *
                                    </label>
                                    <select
                                        name="emergencyRelation"
                                        value={formData.emergencyRelation}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primary}/20 focus:border-${theme.primary} outline-none transition-colors`}
                                    >
                                        <option value="">Select relationship</option>
                                        <option value="parent">Parent</option>
                                        <option value="sibling">Sibling</option>
                                        <option value="spouse">Spouse</option>
                                        <option value="guardian">Guardian</option>
                                        <option value="friend">Friend</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-1 bg-${theme.primary} text-white py-4 px-8 rounded-lg font-semibold hover:bg-${theme.secondary} disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Submitting Application...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5 mr-2" />
                                            Submit Application
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="flex-1 sm:flex-none bg-gray-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PublicApplicationForm;