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
    X,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Helper function to format date as dd/mm/yyyy
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Helper function to convert dd/mm/yyyy to database format
const parseDate = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    if (!day || !month || !year) return '';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Helper function to ensure date is in yyyy-mm-dd format for date input
const toInputDate = (dateString) => {
    if (!dateString) return '';
    // If already in yyyy-mm-dd format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
    }
    // If in ISO format (with time), extract date part
    if (dateString.includes('T')) {
        return dateString.split('T')[0];
    }
    // If in dd/mm/yyyy format, convert it
    if (dateString.includes('/')) {
        return parseDate(dateString);
    }
    return dateString;
};

const StudentProfile = ({ user }) => {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchStudentData();
    }, [user]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/students/applications`);
            if (response.data?.success) {
                const apps = response.data.data?.applications || [];
                const studentApp = apps.find(app => app.email === user?.email);
                setStudentData(studentApp || apps[0] || null);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        setEditData({ ...studentData });
        setIsEditing(true);
        setMessage(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData(null);
        setMessage(null);
    };

    const handleInputChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage(null);

            // Prepare data with proper date format (yyyy-mm-dd for database)
            // Helper to convert date if needed
            const convertDate = (dateValue) => {
                if (!dateValue) return null;
                
                // If it's an ISO string with time (from date picker sometimes), extract just the date
                if (dateValue.includes('T')) {
                    return dateValue.split('T')[0];
                }
                
                // If in dd/mm/yyyy format, convert it
                if (dateValue.includes('/')) {
                    return parseDate(dateValue);
                }
                
                // Otherwise return as-is (should be yyyy-mm-dd)
                return dateValue;
            };

            const dataToSend = {
                first_name: editData.first_name,
                last_name: editData.last_name,
                contact_number: editData.contact_number,
                date_of_birth: convertDate(editData.date_of_birth),
                address_line1: editData.address_line1,
                address_line2: editData.address_line2,
                town_city: editData.town_city,
                postcode: editData.postcode,
                country_of_residence: editData.country_of_residence,
                gender: editData.gender,
                nationality: editData.nationality,
                emergency_contact_name: editData.emergency_contact_name,
                emergency_contact_relationship: editData.emergency_contact_relationship,
                emergency_contact_phone: editData.emergency_contact_phone,
                emergency_contact_email: editData.emergency_contact_email,
                next_of_kin_name: editData.next_of_kin_name,
                next_of_kin_relationship: editData.next_of_kin_relationship,
                next_of_kin_phone: editData.next_of_kin_phone,
                next_of_kin_email: editData.next_of_kin_email,
                next_of_kin_address: editData.next_of_kin_address,
                passport_number: editData.passport_number,
                passport_expiry_date: convertDate(editData.passport_expiry_date),
                visa_status: editData.visa_status,
                visa_expiry_date: convertDate(editData.visa_expiry_date),
                brp_number: editData.brp_number,
                brp_expiry_date: convertDate(editData.brp_expiry_date)
            };

            const response = await axios.put(
                `${API_URL}/students/applications/${studentData.id}/update-profile`,
                dataToSend
            );

            if (response.data?.success) {
                setStudentData({ ...studentData, ...editData });
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: response.data?.message || 'Failed to update profile' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
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
            <div className="p-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="font-bold text-yellow-900 mb-2">No Profile Data Found</h3>
                    <p className="text-yellow-800 mb-4">
                        Your profile information is not yet available in the system. 
                        Please contact the admissions office if you believe this is an error.
                    </p>
                    <p className="text-sm text-yellow-700">
                        Looking for email: <strong>{user?.email}</strong>
                    </p>
                </div>
            </div>
        );
    }

    const displayData = isEditing ? editData : studentData;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Messages */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                    message.type === 'success' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                }`}>
                    <AlertCircle className={`w-5 h-5 ${
                        message.type === 'success' ? 'text-green-600' : 'text-red-600'
                    }`} />
                    <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                        {message.text}
                    </p>
                </div>
            )}

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600 mt-2">View and manage your personal information</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={handleEditClick}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </button>
                )}
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
                            <h2 className="text-2xl font-bold">
                                {displayData.first_name} {displayData.middle_names || ''} {displayData.last_name}
                            </h2>
                            <p className="text-blue-100">Student ID: {displayData.application_reference || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Information */}
                        <div className="space-y-4">
                            {/* First Name */}
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">First Name</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayData.first_name || ''}
                                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{displayData.first_name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Last Name */}
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Last Name</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayData.last_name || ''}
                                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{displayData.last_name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Email Address</p>
                                    <p className="font-medium text-gray-900">{displayData.email}</p>
                                    <p className="text-xs text-gray-500 mt-1">(Cannot be changed)</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Phone Number</p>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={displayData.contact_number || ''}
                                            onChange={(e) => handleInputChange('contact_number', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{displayData.contact_number || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Date of Birth</p>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={toInputDate(displayData.date_of_birth)}
                                            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">
                                            {formatDate(displayData.date_of_birth) || '-'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Gender */}
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Gender</p>
                                    {isEditing ? (
                                        <select
                                            value={displayData.gender || ''}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    ) : (
                                        <p className="font-medium text-gray-900">{displayData.gender || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Nationality */}
                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Nationality</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayData.nationality || ''}
                                            onChange={(e) => handleInputChange('nationality', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{displayData.nationality || '-'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                            {/* Address Line 1 */}
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Address Line 1</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayData.address_line1 || ''}
                                            onChange={(e) => handleInputChange('address_line1', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{displayData.address_line1 || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Address Line 2 */}
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Address Line 2</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayData.address_line2 || ''}
                                            onChange={(e) => handleInputChange('address_line2', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{displayData.address_line2 || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {/* City */}
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">City</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayData.town_city || ''}
                                            onChange={(e) => handleInputChange('town_city', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{displayData.town_city || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Postcode */}
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Postcode</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayData.postcode || ''}
                                            onChange={(e) => handleInputChange('postcode', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{displayData.postcode || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Country */}
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Country of Residence</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={displayData.country_of_residence || ''}
                                            onChange={(e) => handleInputChange('country_of_residence', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="font-medium text-gray-900">{displayData.country_of_residence || '-'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={displayData.emergency_contact_name || ''}
                                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{displayData.emergency_contact_name || '-'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Relationship</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={displayData.emergency_contact_relationship || ''}
                                onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{displayData.emergency_contact_relationship || '-'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={displayData.emergency_contact_phone || ''}
                                onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{displayData.emergency_contact_phone || '-'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        {isEditing ? (
                            <input
                                type="email"
                                value={displayData.emergency_contact_email || ''}
                                onChange={(e) => handleInputChange('emergency_contact_email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{displayData.emergency_contact_email || '-'}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Next of Kin */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Next of Kin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={displayData.next_of_kin_name || ''}
                                onChange={(e) => handleInputChange('next_of_kin_name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{displayData.next_of_kin_name || '-'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Relationship</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={displayData.next_of_kin_relationship || ''}
                                onChange={(e) => handleInputChange('next_of_kin_relationship', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{displayData.next_of_kin_relationship || '-'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={displayData.next_of_kin_phone || ''}
                                onChange={(e) => handleInputChange('next_of_kin_phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{displayData.next_of_kin_phone || '-'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        {isEditing ? (
                            <input
                                type="email"
                                value={displayData.next_of_kin_email || ''}
                                onChange={(e) => handleInputChange('next_of_kin_email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{displayData.next_of_kin_email || '-'}</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Address</p>
                        {isEditing ? (
                            <textarea
                                value={displayData.next_of_kin_address || ''}
                                onChange={(e) => handleInputChange('next_of_kin_address', e.target.value)}
                                rows="2"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{displayData.next_of_kin_address || '-'}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ID Documents Status */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">ID Documents Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-600">Passport Number</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={displayData.passport_number || ''}
                                onChange={(e) => handleInputChange('passport_number', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{displayData.passport_number || '-'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Passport Expiry Date</p>
                        {isEditing ? (
                            <input
                                type="date"
                                value={toInputDate(displayData.passport_expiry_date)}
                                onChange={(e) => handleInputChange('passport_expiry_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{formatDate(displayData.passport_expiry_date) || '-'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Visa Status</p>
                        {isEditing ? (
                            <select
                                value={displayData.visa_status || ''}
                                onChange={(e) => handleInputChange('visa_status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select status</option>
                                <option value="Not Required">Not Required</option>
                                <option value="Student Visa">Student Visa</option>
                                <option value="Work Visa">Work Visa</option>
                                <option value="Settled Status">Settled Status</option>
                                <option value="Pre-Settled Status">Pre-Settled Status</option>
                                <option value="Other">Other</option>
                            </select>
                        ) : (
                            <p className="font-medium text-gray-900">{displayData.visa_status || '-'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Visa Expiry Date</p>
                        {isEditing ? (
                            <input
                                type="date"
                                value={toInputDate(displayData.visa_expiry_date)}
                                onChange={(e) => handleInputChange('visa_expiry_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{formatDate(displayData.visa_expiry_date) || '-'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">BRP Number</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={displayData.brp_number || ''}
                                onChange={(e) => handleInputChange('brp_number', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{displayData.brp_number || '-'}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">BRP Expiry Date</p>
                        {isEditing ? (
                            <input
                                type="date"
                                value={toInputDate(displayData.brp_expiry_date)}
                                onChange={(e) => handleInputChange('brp_expiry_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="font-medium text-gray-900">{formatDate(displayData.brp_expiry_date) || '-'}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Programme Details */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Programme Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">`
                    <div>
                        <p className="text-sm text-gray-600">Programme Title</p>
                        <p className="font-medium text-gray-900">{displayData.course_title || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Programme Code</p>
                        <p className="font-medium text-gray-900">{displayData.course_code || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Course Type</p>
                        <p className="font-medium text-gray-900">{displayData.course_type || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Mode of Study</p>
                        <p className="font-medium text-gray-900">{displayData.mode_of_study || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Entry Route</p>
                        <p className="font-medium text-gray-900">{displayData.entry_route || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Intake Start Date</p>
                        <p className="font-medium text-gray-900">
                            {formatDate(displayData.intake_start_date) || '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit/Save buttons - at the end of the form */}
            {isEditing && (
                <div className="flex gap-3 mt-8 p-6 bg-white rounded-lg shadow">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:bg-gray-400"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentProfile;
