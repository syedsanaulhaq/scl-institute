import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, RefreshCw, Plus, Edit2, Eye, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const statusClass = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'approved' || normalized === 'completed') return 'bg-green-100 text-green-700';
    if (normalized === 'in progress' || normalized === 'in_progress') return 'bg-amber-100 text-amber-700';
    if (normalized === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
};

const CourseVisits = () => {
    const navigate = useNavigate();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVisits = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/course-visits`);
            setVisits(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch course visits:', error);
            setVisits([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisits();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this visit record?')) return;
        try {
            await axios.delete(`${API_URL}/course-visits/${id}`);
            fetchVisits();
        } catch (error) {
            console.error('Failed to delete visit:', error);
            alert('Failed to delete visit');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Awarding Body Visits</h1>
                    <p className="text-sm text-gray-500">Manage visit and inspection records between accreditation and induction.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchVisits}
                        className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800"
                    >
                        <RefreshCw className="w-4 h-4 inline mr-2" />Refresh
                    </button>
                    <button
                        onClick={() => navigate('/course-visits/new')}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-scl-purple text-white hover:bg-scl-purple/90"
                    >
                        <Plus className="w-4 h-4 inline mr-2" />New Visit
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-scl-purple" />
                    <p className="text-sm text-gray-500 mt-2">Loading visits...</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Visit Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Visit Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Updated</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visits.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500">No visit records found.</td>
                                    </tr>
                                ) : visits.map((visit) => (
                                    <tr key={visit.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">
                                            <div className="font-semibold text-gray-900">{visit.course_title || 'Untitled Course'}</div>
                                            <div className="text-xs text-gray-500">{visit.course_code || 'No Code'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{visit.visit_type || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{visit.visit_date ? new Date(visit.visit_date).toLocaleDateString('en-GB') : '-'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClass(visit.overall_status)}`}>
                                                {visit.overall_status || 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{visit.updated_at ? new Date(visit.updated_at).toLocaleString() : '-'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex gap-2">
                                                <button onClick={() => navigate(`/course-visits/${visit.id}`)} className="text-blue-600 hover:text-blue-800" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => navigate(`/course-visits/${visit.id}`)} className="text-gray-600 hover:text-gray-800" title="Open">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(visit.id)} className="text-red-600 hover:text-red-800" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseVisits;

