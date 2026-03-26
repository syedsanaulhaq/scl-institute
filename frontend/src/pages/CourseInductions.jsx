import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    ClipboardList
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CourseInductions = ({ user }) => {
    const navigate = useNavigate();
    const [inductions, setInductions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInductions();
    }, []);

    const fetchInductions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/course-inductions`);
            setInductions(response.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch inductions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        navigate('/course-inductions/new');
    };

    const handleEdit = (id) => {
        navigate(`/course-inductions/${id}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this induction record?')) {
            try {
                await axios.delete(`${API_URL}/course-inductions/${id}`);
                fetchInductions();
            } catch (err) {
                console.error('Failed to delete:', err);
                alert('Failed to delete induction record.');
            }
        }
    };

    const filteredInductions = inductions.filter((ind) =>
        ind.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ind.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ind.awarding_body?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <ClipboardList className="w-8 h-8 text-scl-purple" />
                                Course Induction Compliance
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">Track course approval requirements, risks, conditions, and sign-offs.</p>
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-2 px-4 py-2 bg-scl-purple text-white rounded-lg hover:bg-scl-purple/90 font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Add New
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by course title, code, or awarding body..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin text-2xl">⏳</div>
                        <p className="text-gray-600 mt-2">Loading...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course Information</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Qualification</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Awarding Body</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Progress</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInductions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No induction records found.{' '}
                                            <button onClick={handleAddNew} className="text-scl-purple hover:underline font-semibold">
                                                Create one
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInductions.map((ind) => (
                                        <tr key={ind.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm">
                                                <div className="text-gray-900 font-medium">{ind.course_title || 'Untitled Course'}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Code: <span className="font-semibold">{ind.course_code || '-'}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Version: <span className="font-semibold">{ind.version || '1.0'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {ind.qualification_level || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {ind.awarding_body || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                                                        <div
                                                            className="bg-scl-purple h-2 rounded-full"
                                                            style={{ width: `${ind.completion_percentage || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-scl-purple whitespace-nowrap">
                                                        {ind.completion_percentage || 0}%
                                                    </span>
                                                </div>
                                                <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    ind.overall_status === 'Approved'
                                                        ? 'bg-green-100 text-green-800'
                                                        : ind.overall_status === 'In Progress'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {ind.overall_status || 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleEdit(ind.id)}
                                                    className="inline-block text-scl-purple hover:text-scl-purple/70 mr-4"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ind.id)}
                                                    className="inline-block text-red-500 hover:text-red-700"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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

export default CourseInductions;

