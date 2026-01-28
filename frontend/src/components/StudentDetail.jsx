import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    GraduationCap, 
    User, 
    FileText,
    Edit,
    Download,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Users,
    Building2
} from 'lucide-react';

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock detailed student data - replace with API call
    const mockStudentDetails = {
        1: {
            id: 1,
            // Personal Information
            fullName: 'Ahmed Hassan',
            firstName: 'Ahmed',
            lastName: 'Hassan',
            email: 'ahmed.hassan@email.com',
            phone: '+971-50-123-4567',
            dateOfBirth: '1998-05-12',
            nationality: 'UAE',
            gender: 'Male',
            maritalStatus: 'Single',
            
            // Address Information
            currentAddress: '123 Al Wasl Road, Dubai, UAE',
            permanentAddress: '456 Sheikh Zayed Road, Dubai, UAE',
            city: 'Dubai',
            state: 'Dubai',
            postalCode: '12345',
            country: 'UAE',
            
            // Emergency Contact
            emergencyContactName: 'Sarah Hassan',
            emergencyContactRelation: 'Mother',
            emergencyContactPhone: '+971-50-987-6543',
            emergencyContactEmail: 'sarah.hassan@email.com',
            
            // Academic Information
            course: 'Computer Science',
            courseType: 'Bachelor',
            studyMode: 'Full-time',
            intakeYear: '2026',
            intakeSemester: 'Fall',
            previousEducation: 'High School Diploma',
            previousInstitution: 'Dubai International School',
            previousGPA: '3.8/4.0',
            
            // Application Details
            applicationDate: '2026-01-15',
            applicationId: 'SCL-2026-001',
            status: 'approved',
            reviewedBy: 'Dr. Mohammed Al-Rashid',
            reviewDate: '2026-01-18',
            reviewNotes: 'Excellent academic background and strong motivation. Approved for admission.',
            
            // Documents
            documents: [
                { name: 'Academic Transcripts', status: 'verified', uploadDate: '2026-01-15' },
                { name: 'Passport Copy', status: 'verified', uploadDate: '2026-01-15' },
                { name: 'Personal Statement', status: 'verified', uploadDate: '2026-01-15' },
                { name: 'Recommendation Letters', status: 'pending', uploadDate: '2026-01-16' }
            ],
            
            // Additional Information
            englishProficiency: 'IELTS 7.5',
            computerSkills: 'Advanced',
            workExperience: 'Internship at Tech Solutions Dubai (6 months)',
            hobbies: 'Programming, Reading, Football',
            careerGoals: 'Software Engineer specializing in AI and Machine Learning',
            
            // Financial Information
            tuitionFeeStatus: 'Paid',
            scholarshipApplied: true,
            scholarshipStatus: 'Under Review',
            financialAidRequired: false
        }
    };

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            const studentData = mockStudentDetails[parseInt(id)];
            if (studentData) {
                setStudent(studentData);
            }
            setLoading(false);
        }, 500);
    }, [id]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'under_review':
                return <AlertCircle className="w-5 h-5 text-blue-600" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            approved: 'bg-green-100 text-green-800 border-green-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            under_review: 'bg-blue-100 text-blue-800 border-blue-200',
            rejected: 'bg-red-100 text-red-800 border-red-200'
        };
        
        const statusLabels = {
            approved: 'Approved',
            pending: 'Pending',
            under_review: 'Under Review',
            rejected: 'Rejected'
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}>
                {getStatusIcon(status)}
                <span className="ml-2">{statusLabels[status]}</span>
            </span>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/student-list')}
                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Students
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scl-purple"></div>
                        <span className="ml-3 text-gray-600">Loading student details...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/student-list')}
                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Students
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Not Found</h3>
                    <p className="text-gray-600">The requested student could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate('/student-list')}
                        className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Students
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Student Details</h1>
                        <p className="text-gray-600 mt-1 text-sm">Application ID: {student.applicationId}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </button>
                    <button className="flex items-center px-4 py-2 bg-scl-purple text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Details
                    </button>
                </div>
            </div>

            {/* Student Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start space-x-4">
                    <div className="h-16 w-16 rounded-full bg-scl-purple/10 flex items-center justify-center">
                        <span className="text-scl-purple font-bold text-xl">
                            {student.firstName[0]}{student.lastName[0]}
                        </span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{student.fullName}</h2>
                                <p className="text-base text-gray-600">{student.course} - {student.courseType}</p>
                            </div>
                            {getStatusBadge(student.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center text-gray-600">
                                <Mail className="w-4 h-4 mr-2" />
                                {student.email}
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Phone className="w-4 h-4 mr-2" />
                                {student.phone}
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                Applied on {new Date(student.applicationDate).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Information Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2 text-scl-purple" />
                        Personal Information
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Full Name:</span>
                            <span className="font-medium">{student.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Date of Birth:</span>
                            <span className="font-medium">{new Date(student.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Nationality:</span>
                            <span className="font-medium">{student.nationality}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Gender:</span>
                            <span className="font-medium">{student.gender}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Marital Status:</span>
                            <span className="font-medium">{student.maritalStatus}</span>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-scl-purple" />
                        Contact Information
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <span className="text-gray-600 block mb-1">Current Address:</span>
                            <span className="font-medium">{student.currentAddress}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">City:</span>
                            <span className="font-medium">{student.city}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Country:</span>
                            <span className="font-medium">{student.country}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{student.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{student.phone}</span>
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2 text-scl-purple" />
                        Academic Information
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Course:</span>
                            <span className="font-medium">{student.course}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Program Type:</span>
                            <span className="font-medium">{student.courseType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Study Mode:</span>
                            <span className="font-medium">{student.studyMode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Intake:</span>
                            <span className="font-medium">{student.intakeSemester} {student.intakeYear}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Previous GPA:</span>
                            <span className="font-medium">{student.previousGPA}</span>
                        </div>
                        <div>
                            <span className="text-gray-600 block mb-1">Previous Institution:</span>
                            <span className="font-medium">{student.previousInstitution}</span>
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-scl-purple" />
                        Emergency Contact
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{student.emergencyContactName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Relation:</span>
                            <span className="font-medium">{student.emergencyContactRelation}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{student.emergencyContactPhone}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{student.emergencyContactEmail}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-scl-purple" />
                    Submitted Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.documents.map((doc, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">{doc.name}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    doc.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {doc.status === 'verified' ? 'Verified' : 'Pending'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Application Review */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-scl-purple" />
                    Application Review
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Reviewed By:</span>
                        <span className="font-medium">{student.reviewedBy}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Review Date:</span>
                        <span className="font-medium">{new Date(student.reviewDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <span className="text-gray-600 block mb-2">Review Notes:</span>
                        <p className="bg-gray-50 p-4 rounded-lg text-gray-800">{student.reviewNotes}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;