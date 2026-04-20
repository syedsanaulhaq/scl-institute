import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, ArrowLeft, Search, RefreshCw, ExternalLink } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const MOODLE_URL = import.meta.env.VITE_MOODLE_URL || 'http://localhost:9090';

const STATUS_COLORS = {
    active: 'bg-green-100 text-green-800',
    withdrawn: 'bg-red-100 text-red-800',
    transferred_out: 'bg-amber-100 text-amber-800',
    completed: 'bg-blue-100 text-blue-800',
    suspended: 'bg-gray-100 text-gray-600',
};

const AdminStudentProgrammes = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/admin/student-programmes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data?.success) setRecords(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch student programmes', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const statuses = [...new Set(records.map(r => r.status))].filter(Boolean);

    const filtered = records.filter(r => {
        const q = search.toLowerCase();
        const matchesSearch = !q || `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) || r.student_email?.toLowerCase().includes(q) || r.programme_title?.toLowerCase().includes(q) || r.programme_code?.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Status summary
    const statusCounts = {};
    records.forEach(r => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });

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
                            <UserCheck className="w-6 h-6 text-green-600" /> Student Programmes
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">All student programme registrations</p>
                    </div>
                </div>
                <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Status summary cards */}
            <div className="flex flex-wrap gap-3">
                {Object.entries(statusCounts).map(([status, count]) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                            statusFilter === status ? 'ring-2 ring-purple-500' : ''
                        } ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}
                    >
                        {status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({count})
                    </button>
                ))}
                {statusFilter !== 'all' && (
                    <button onClick={() => setStatusFilter('all')} className="px-4 py-2 rounded-full text-sm font-medium text-gray-500 border border-gray-300 hover:bg-gray-100 transition">
                        Clear Filter
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, email or intake..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-6 h-6 text-green-600 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm">No records found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Programme</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Moodle</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Registered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r, i) => (
                                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                                        <td className="py-3 px-4 font-medium text-gray-900">{r.first_name || '—'} {r.last_name || ''}</td>
                                        <td className="py-3 px-4 text-gray-600">{r.student_email}</td>
                                        <td className="py-3 px-4 text-gray-700 max-w-xs truncate" title={r.programme_title}>{r.programme_title || '—'}</td>
                                        <td className="py-3 px-4 text-gray-600 font-mono text-xs">{r.programme_code || '—'}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {r.status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '—'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {r.moodle_user_id ? (
                                                <a
                                                    href={`${MOODLE_URL}/user/profile.php?id=${r.moodle_user_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 transition"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Moodle
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 text-xs">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
                    Showing {filtered.length} of {records.length} records
                </div>
            </div>
        </div>
    );
};

export default AdminStudentProgrammes;
