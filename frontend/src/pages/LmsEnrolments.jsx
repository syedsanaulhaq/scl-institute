import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Search, RefreshCw, Eye, EyeOff, ExternalLink } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const MOODLE_URL = import.meta.env.VITE_MOODLE_URL || 'http://localhost:9090';

const LmsEnrolments = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [visibilityFilter, setVisibilityFilter] = useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/admin/lms-enrolments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data?.success) setCourses(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch LMS enrolments', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = courses.filter(c => {
        const q = search.toLowerCase();
        const matchesSearch = !q || c.fullname?.toLowerCase().includes(q) || c.shortname?.toLowerCase().includes(q);
        const matchesVisibility = visibilityFilter === 'all' || (visibilityFilter === 'active' && c.visible === 1) || (visibilityFilter === 'hidden' && c.visible !== 1);
        return matchesSearch && matchesVisibility;
    });

    const totalEnrolments = filtered.reduce((sum, c) => sum + Number(c.enrollments || 0), 0);

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-gray-200 transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-purple-600" /> LMS Course Enrolments
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">All Moodle courses and their enrolment counts</p>
                    </div>
                </div>
                <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Courses</p>
                    <p className="text-2xl font-extrabold text-gray-900">{filtered.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Total Enrolments</p>
                    <p className="text-2xl font-extrabold text-purple-700">{totalEnrolments.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Avg Enrolments/Course</p>
                    <p className="text-2xl font-extrabold text-blue-700">{filtered.length > 0 ? Math.round(totalEnrolments / filtered.length) : 0}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>
                <select
                    value={visibilityFilter}
                    onChange={e => setVisibilityFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                    <option value="all">All Courses</option>
                    <option value="active">Active Only</option>
                    <option value="hidden">Hidden Only</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-6 h-6 text-purple-600 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm">No courses found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Course Code</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Course Name</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Enrolments</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Moodle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((course, i) => (
                                    <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                                        <td className="py-3 px-4 font-medium text-gray-900">{course.shortname}</td>
                                        <td className="py-3 px-4 text-gray-700 max-w-xs truncate" title={course.fullname}>{course.fullname}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                {course.enrollments || 0}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                                course.visible === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {course.visible === 1 ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                {course.visible === 1 ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <a
                                                href={`${MOODLE_URL}/course/view.php?id=${course.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 transition"
                                            >
                                                <ExternalLink className="w-3 h-3" /> Open
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LmsEnrolments;
