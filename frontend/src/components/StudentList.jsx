import { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    Eye, 
    Edit, 
    Trash2, 
    Download,
    Plus,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    FileText,
    Mail,
    Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentList = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [studentsPerPage] = useState(10);

    // Mock data - replace with API call
    const mockStudents = [
        {
            id: 1,
            fullName: 'Ahmed Hassan',
            email: 'ahmed.hassan@email.com',
            phone: '+971-50-123-4567',
            course: 'Computer Science',
            applicationDate: '2026-01-15',
            status: 'approved',
            nationality: 'UAE',
            dateOfBirth: '1998-05-12',
            emergencyContact: 'Sarah Hassan - +971-50-987-6543'
        },
        {
            id: 2,
            fullName: 'Fatima Al-Zahra',
            email: 'fatima.alzahra@email.com',
            phone: '+971-55-234-5678',
            course: 'Business Administration',
            applicationDate: '2026-01-20',
            status: 'pending',
            nationality: 'Saudi Arabia',
            dateOfBirth: '1999-08-25',
            emergencyContact: 'Mohammed Al-Zahra - +971-55-876-5432'
        },
        {
            id: 3,
            fullName: 'Omar Khalil',
            email: 'omar.khalil@email.com',
            phone: '+971-52-345-6789',
            course: 'Engineering',
            applicationDate: '2026-01-18',
            status: 'approved',
            nationality: 'Egypt',
            dateOfBirth: '1997-12-03',
            emergencyContact: 'Layla Khalil - +971-52-765-4321'
        },
        {
            id: 4,
            fullName: 'Aisha Mohamed',
            email: 'aisha.mohamed@email.com',
            phone: '+971-56-456-7890',
            course: 'Medicine',
            applicationDate: '2026-01-22',
            status: 'under_review',
            nationality: 'Jordan',
            dateOfBirth: '2000-03-18',
            emergencyContact: 'Yasmin Mohamed - +971-56-654-3210'
        },
        {
            id: 5,
            fullName: 'Khalid Al-Mansoori',
            email: 'khalid.almansoori@email.com',
            phone: '+971-50-567-8901',
            course: 'Computer Science',
            applicationDate: '2026-01-25',
            status: 'rejected',
            nationality: 'UAE',
            dateOfBirth: '1998-09-14',
            emergencyContact: 'Mariam Al-Mansoori - +971-50-543-2109'
        },
        {
            id: 6,
            fullName: 'Nour Abdulla',
            email: 'nour.abdulla@email.com',
            phone: '+971-55-678-9012',
            course: 'Design',
            applicationDate: '2026-01-26',
            status: 'approved',
            nationality: 'Lebanon',
            dateOfBirth: '1999-11-07',
            emergencyContact: 'Rami Abdulla - +971-55-432-1098'
        }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setStudents(mockStudents);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter and search logic
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.course.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

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
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
                {statusLabels[status]}
            </span>
        );
    };

    const handleViewStudent = (studentId) => {
        navigate(`/student-detail/${studentId}`);
    };

    const handleEditStudent = (studentId) => {
        // Navigate to edit form
        console.log('Edit student:', studentId);
    };

    const handleDeleteStudent = (studentId) => {
        // Show confirmation dialog and delete
        if (window.confirm('Are you sure you want to delete this student application?')) {
            setStudents(students.filter(s => s.id !== studentId));
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Student Applications</h1>
                        <p className="text-gray-600 mt-1">Manage all student admission applications</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scl-purple"></div>
                        <span className="ml-3 text-gray-600">Loading students...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Student Applications</h1>
                    <p className="text-gray-600 mt-1 text-sm">Manage all student admission applications</p>
                </div>
                <button
                    onClick={() => navigate('/student-application')}
                    className="flex items-center px-4 py-2 bg-scl-purple text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Application
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or course..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="under_review">Under Review</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Export Button */}
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student Details
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Course
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Application Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentStudents.map((student) => (
                                <tr 
                                    key={student.id} 
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handleViewStudent(student.id)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-scl-purple/10 flex items-center justify-center">
                                                <span className="text-scl-purple font-semibold text-sm">
                                                    {student.fullName.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">{student.fullName}</div>
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <Mail className="w-3 h-3 mr-1" />
                                                    {student.email}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Phone className="w-3 h-3 mr-1" />
                                                    {student.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{student.course}</div>
                                        <div className="text-sm text-gray-500">{student.nationality}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {new Date(student.applicationDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(student.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewStudent(student.id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-scl-purple hover:bg-purple-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditStudent(student.id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteStudent(student.id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} students
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                            currentPage === page
                                                ? 'bg-scl-purple text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {filteredStudents.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
                    <p className="text-gray-600 mb-6">No student applications match your current filters.</p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentList;