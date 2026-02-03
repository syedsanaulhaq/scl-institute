import { useState, useEffect } from 'react';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar,
    FileText,
    Edit2,
    Save,
    X
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const StudentProfile = ({ user }) => {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchStudentData();
    }, [user]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/students/applications`);
            if (response.data?.success) {
                const apps = response.data.data?.applications || [];
                const studentApp = apps.find(app => app.email === user.email);
                setStudentData(studentApp);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading your profile...</p>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-600">No profile data found</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-2">View and manage your personal information</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow mb-6">
                {/* Header Section with Avatar */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-t-lg">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <User className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-2xl font-bold">{studentData.first_name} {studentData.middle_names} {studentData.last_name}</h2>
                            <p className="text-blue-100">Student ID: {studentData.application_reference}</p>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                        {/* <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            {isEditing ? (
                                <>
                                    <X className="w-4 h-4" />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <Edit2 className="w-4 h-4" />
                                    Edit Profile
                                </>
                            )}
                        </button> */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Information */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Email Address</p>
                                    <p className="font-medium text-gray-900">{studentData.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Phone Number</p>
                                    <p className="font-medium text-gray-900">{studentData.contact_number}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Date of Birth</p>
                                    <p className="font-medium text-gray-900">{studentData.date_of_birth}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Gender</p>
                                    <p className="font-medium text-gray-900">{studentData.gender}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Nationality</p>
                                    <p className="font-medium text-gray-900">{studentData.nationality}</p>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Address</p>
                                    <p className="font-medium text-gray-900">{studentData.address_line1}</p>
                                    {studentData.address_line2 && <p className="font-medium text-gray-900">{studentData.address_line2}</p>}
                                    <p className="font-medium text-gray-900">{studentData.town_city}, {studentData.postcode}</p>
                                    <p className="font-medium text-gray-900">{studentData.country_of_residence}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Programme Details */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Programme Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-600">Programme Title</p>
                        <p className="font-medium text-gray-900">{studentData.course_title}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Programme Code</p>
                        <p className="font-medium text-gray-900">{studentData.course_code}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Course Type</p>
                        <p className="font-medium text-gray-900">{studentData.course_type}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Mode of Study</p>
                        <p className="font-medium text-gray-900">{studentData.mode_of_study}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Entry Route</p>
                        <p className="font-medium text-gray-900">{studentData.entry_route}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Intake Start Date</p>
                        <p className="font-medium text-gray-900">{new Date(studentData.intake_start_date).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Academic Background */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Academic Background</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-600">Highest Qualification</p>
                        <p className="font-medium text-gray-900">{studentData.highest_qualification}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Institution</p>
                        <p className="font-medium text-gray-900">{studentData.institution_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Year Completed</p>
                        <p className="font-medium text-gray-900">{studentData.year_completed}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">English Proficiency</p>
                        <p className="font-medium text-gray-900">{studentData.english_proficiency} - Score: {studentData.english_score}</p>
                    </div>
                </div>
                {studentData.relevant_work_experience && (
                    <div className="mt-6">
                        <p className="text-sm text-gray-600 mb-2">Work Experience</p>
                        <p className="font-medium text-gray-900 whitespace-pre-line">{studentData.relevant_work_experience}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProfile;
