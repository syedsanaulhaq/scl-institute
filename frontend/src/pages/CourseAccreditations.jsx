import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const CourseAccreditations = ({ user }) => {
    const navigate = useNavigate();
    const [accreditations, setAccreditations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);

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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`${API_URL}/accreditations/${id}`);
                fetchAccreditations();
            } catch (err) {
                console.error('Failed to delete:', err);
            }
        }
    };

    const filteredAccreditations = accreditations.filter(acc =>
        acc.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.course_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                📋 Course Accreditations
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">Track and manage course accreditations</p>
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
                            placeholder="Search by course title or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin">⏳</div>
                        <p className="text-gray-600 mt-2">Loading...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course Title</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Awarding Body</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAccreditations.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No accreditations found. <button onClick={handleAddNew} className="text-scl-purple hover:underline">Create one</button>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAccreditations.map(accreditation => (
                                        <tr key={accreditation.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{accreditation.course_title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{accreditation.course_code}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{accreditation.awarding_body || '-'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    accreditation.overall_status === 'Approved' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {accreditation.overall_status || 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleEdit(accreditation.id)}
                                                    className="inline-block text-scl-purple hover:text-scl-purple/70 mr-4"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(accreditation.id)}
                                                    className="inline-block text-red-500 hover:text-red-700"
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

            {/* Modal Form - Create New Only */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Form Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">New Accreditation</h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* General Info - Brief Version */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Course Title *</label>
                                <input
                                    type="text"
                                    placeholder="Enter course title"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Course Code</label>
                                <input
                                    type="text"
                                    placeholder="Enter course code"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Awarding Body</label>
                                <input
                                    type="text"
                                    placeholder="Enter awarding body"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scl-purple focus:border-transparent"
                                />
                            </div>
                            <p className="text-xs text-gray-500">You'll fill in all details on the next page</p>
                        </div>

                        {/* Form Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 bg-scl-purple text-white rounded-lg hover:bg-scl-purple/90 font-semibold"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseAccreditations;
