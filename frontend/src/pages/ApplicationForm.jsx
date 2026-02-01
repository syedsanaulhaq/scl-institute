import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    GraduationCap,
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    FileText,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ApplicationForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const selectedProgramCode = searchParams.get('program');

    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [applicationRef, setApplicationRef] = useState('');
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        // Personal Information
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        nationality: '',
        gender: '',
        
        // Address
        address_line1: '',
        address_line2: '',
        city: '',
        postal_code: '',
        country: '',
        
        // Academic Background
        highest_qualification: '',
        institution_name: '',
        graduation_year: '',
        gpa_grade: '',
        
        // Application Details
        program_id: '',
        intake_year: new Date().getFullYear(),
        intake_month: '',
        how_did_you_hear: '',
        personal_statement: ''
    });

    useEffect(() => {
        fetchPrograms();
    }, []);

    useEffect(() => {
        if (selectedProgramCode && programs.length > 0) {
            const program = programs.find(p => p.code === selectedProgramCode);
            if (program) {
                setFormData(prev => ({ ...prev, program_id: program.id }));
            }
        }
    }, [selectedProgramCode, programs]);

    const fetchPrograms = async () => {
        try {
            const response = await axios.get(`${API_URL}/public/programs`);
            setPrograms(response.data);
        } catch (error) {
            console.error('Error fetching programs:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Required fields
        const requiredFields = [
            'first_name', 'last_name', 'email', 'phone', 'date_of_birth',
            'nationality', 'program_id', 'intake_month', 'personal_statement'
        ];
        
        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = 'This field is required';
            }
        });

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation
        if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // Personal statement length
        if (formData.personal_statement && formData.personal_statement.length < 100) {
            newErrors.personal_statement = 'Personal statement should be at least 100 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/public/applications`, formData);
            setApplicationRef(response.data.reference_number);
            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting application:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">Application Submitted Successfully!</h1>
                        <p className="text-lg text-gray-600 mb-6">
                            Thank you for your application. Your reference number is:
                        </p>
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-8">
                            <span className="text-2xl font-bold text-purple-600">{applicationRef}</span>
                        </div>
                        <div className="text-left bg-gray-50 rounded-lg p-6 mb-8">
                            <h3 className="font-bold text-gray-800 mb-3">What happens next?</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    You will receive a confirmation email within 24 hours
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    Our admissions team will review your application within 5-7 business days
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    We may contact you for additional information or an interview
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    You will be notified of the decision via email and post
                                </li>
                            </ul>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button 
                                onClick={() => navigate('/')}
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                            >
                                Return Home
                            </button>
                            <button 
                                onClick={() => window.print()}
                                className="border border-purple-600 text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50"
                            >
                                Print Confirmation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const selectedProgram = programs.find(p => p.id === parseInt(formData.program_id));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => navigate('/')}
                                className="flex items-center text-gray-600 hover:text-purple-600"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back to Home
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <GraduationCap className="h-8 w-8 text-purple-600" />
                            <span className="text-xl font-bold text-gray-800">SCL Institute</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Form */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Apply to SCL Institute</h1>
                    <p className="text-xl text-gray-600">
                        Take the first step towards your academic and professional future
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
                    {/* Personal Information */}
                    <div className="mb-8">
                        <div className="flex items-center mb-6">
                            <User className="h-6 w-6 text-purple-600 mr-2" />
                            <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 ${
                                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.first_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 ${
                                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.last_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 ${
                                        errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 ${
                                        errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.date_of_birth && (
                                    <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nationality *
                                </label>
                                <input
                                    type="text"
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 ${
                                        errors.nationality ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="e.g., British, American"
                                />
                                {errors.nationality && (
                                    <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="mb-8">
                        <div className="flex items-center mb-6">
                            <MapPin className="h-6 w-6 text-purple-600 mr-2" />
                            <h2 className="text-2xl font-bold text-gray-800">Address Information</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address Line 1
                                </label>
                                <input
                                    type="text"
                                    name="address_line1"
                                    value={formData.address_line1}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Street address, house number"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address Line 2
                                </label>
                                <input
                                    type="text"
                                    name="address_line2"
                                    value={formData.address_line2}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Apartment, suite, unit, building, floor, etc."
                                />
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        name="postal_code"
                                        value={formData.postal_code}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Academic Background */}
                    <div className="mb-8">
                        <div className="flex items-center mb-6">
                            <BookOpen className="h-6 w-6 text-purple-600 mr-2" />
                            <h2 className="text-2xl font-bold text-gray-800">Academic Background</h2>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Highest Qualification
                                </label>
                                <input
                                    type="text"
                                    name="highest_qualification"
                                    value={formData.highest_qualification}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="e.g., Bachelor's Degree, A-Levels, High School Diploma"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Institution Name
                                </label>
                                <input
                                    type="text"
                                    name="institution_name"
                                    value={formData.institution_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Name of your school/college/university"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Graduation Year
                                </label>
                                <input
                                    type="number"
                                    name="graduation_year"
                                    value={formData.graduation_year}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    min="1980"
                                    max="2030"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Grade/GPA
                                </label>
                                <input
                                    type="text"
                                    name="gpa_grade"
                                    value={formData.gpa_grade}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="e.g., First Class, 3.8/4.0, AAB"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Program Selection */}
                    <div className="mb-8">
                        <div className="flex items-center mb-6">
                            <GraduationCap className="h-6 w-6 text-purple-600 mr-2" />
                            <h2 className="text-2xl font-bold text-gray-800">Program Selection</h2>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Program *
                                </label>
                                <select
                                    name="program_id"
                                    value={formData.program_id}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 ${
                                        errors.program_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Select a program</option>
                                    {programs.map((program) => (
                                        <option key={program.id} value={program.id}>
                                            {program.name} ({program.duration}) - £{program.fee_amount?.toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                                {errors.program_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.program_id}</p>
                                )}
                                
                                {selectedProgram && (
                                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                        <h4 className="font-bold text-purple-800 mb-2">{selectedProgram.name}</h4>
                                        <p className="text-purple-700 text-sm mb-2">{selectedProgram.description}</p>
                                        <div className="flex flex-wrap gap-4 text-sm text-purple-600">
                                            <span>Duration: {selectedProgram.duration}</span>
                                            <span>Qualification: {selectedProgram.qualification}</span>
                                            <span>Fee: £{selectedProgram.fee_amount?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Intake Year
                                </label>
                                <select
                                    name="intake_year"
                                    value={formData.intake_year}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                    <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Intake Month *
                                </label>
                                <select
                                    name="intake_month"
                                    value={formData.intake_month}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 ${
                                        errors.intake_month ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Select intake month</option>
                                    <option value="January">January</option>
                                    <option value="March">March</option>
                                    <option value="May">May</option>
                                    <option value="September">September</option>
                                    <option value="November">November</option>
                                </select>
                                {errors.intake_month && (
                                    <p className="text-red-500 text-sm mt-1">{errors.intake_month}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    How did you hear about us?
                                </label>
                                <select
                                    name="how_did_you_hear"
                                    value={formData.how_did_you_hear}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">Please select</option>
                                    <option value="Search Engine">Search Engine (Google, etc.)</option>
                                    <option value="Social Media">Social Media</option>
                                    <option value="Friend/Family">Friend or Family</option>
                                    <option value="Education Fair">Education Fair</option>
                                    <option value="Advertisement">Advertisement</option>
                                    <option value="Agent">Education Agent</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Personal Statement */}
                    <div className="mb-8">
                        <div className="flex items-center mb-6">
                            <FileText className="h-6 w-6 text-purple-600 mr-2" />
                            <h2 className="text-2xl font-bold text-gray-800">Personal Statement</h2>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Personal Statement * (minimum 100 characters)
                            </label>
                            <textarea
                                name="personal_statement"
                                value={formData.personal_statement}
                                onChange={handleInputChange}
                                rows={6}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 ${
                                    errors.personal_statement ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Please tell us why you want to study this program and how it will help you achieve your career goals. Include any relevant experience, skills, or motivations."
                            />
                            <div className="flex justify-between mt-2">
                                {errors.personal_statement && (
                                    <p className="text-red-500 text-sm">{errors.personal_statement}</p>
                                )}
                                <p className="text-sm text-gray-500 ml-auto">
                                    {formData.personal_statement.length} characters
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Terms and Submit */}
                    <div className="pt-6 border-t border-gray-200">
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-gray-700">
                                    <p className="font-medium mb-2">Important Information:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>All information provided must be accurate and truthful</li>
                                        <li>You will receive a confirmation email within 24 hours</li>
                                        <li>Our admissions team will review your application within 5-7 business days</li>
                                        <li>Additional documents may be requested during the review process</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationForm;