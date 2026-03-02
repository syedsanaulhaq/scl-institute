import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CourseAccreditations = ({ user }) => {
    const navigate = useNavigate();
    const [accreditations, setAccreditations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchAccreditations();
    }, []);

    const fetchAccreditations = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/accreditations`);
            setAccreditations(response.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch accreditations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        navigate('/course-accreditations/new');
    };

    const handleEdit = (id) => {
        navigate(`/course-accreditations/${id}/edit`);
    };

    const handleView = (id) => {
        navigate(`/course-accreditations/${id}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this accreditation?')) {
            try {
                await axios.delete(`${API_URL}/accreditations/${id}`);
                fetchAccreditations();
            } catch (err) {
                console.error('Failed to delete:', err);
            }
        }
    };

    const filteredAccreditations = accreditations.filter(acc => {
        const matchesSearch = 
            acc.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.awarding_body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.application_type?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || acc.overall_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const statusColors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Approved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Draft': 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                📋 Course Accreditations
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">Manage course accreditation applications and partnerships</p>
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-2 px-4 py-2 bg-scl-purple text-white rounded-lg hover:bg-scl-purple/90 font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            New Accreditation
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by course title, awarding body..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin">⏳</div>
                        <p className="text-gray-600 mt-2">Loading accreditations...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course Title</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Awarding Body</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Application Type</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Lead Coordinator</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredAccreditations.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No accreditations found. <button onClick={handleAddNew} className="text-scl-purple hover:underline font-semibold">Create one</button>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAccreditations.map(acc => (
                                        <tr key={acc.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{acc.course_title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{acc.awarding_body || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{acc.application_type || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{acc.lead_coordinator || '-'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[acc.overall_status] || statusColors['Draft']}`}>
                                                    {acc.overall_status || 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleView(acc.id)}
                                                        className="text-gray-500 hover:text-scl-purple transition"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(acc.id)}
                                                        className="text-scl-purple hover:text-scl-purple/70 transition"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(acc.id)}
                                                        className="text-red-500 hover:text-red-700 transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseAccreditations;
