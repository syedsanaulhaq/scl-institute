import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, ArrowLeft, Search, RefreshCw, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { openMoodleSSO } from '../utils/ssoService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ROLE_COLORS = {
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-indigo-100 text-indigo-800',
    coursecreator: 'bg-blue-100 text-blue-800',
    editingteacher: 'bg-cyan-100 text-cyan-800',
    teacher: 'bg-teal-100 text-teal-800',
    student: 'bg-green-100 text-green-800',
    user: 'bg-gray-100 text-gray-700',
};

const AdminUsersByRole = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'all');

    const adminEmail = JSON.parse(sessionStorage.getItem('user') || '{}')?.email;

    const handleOpenMoodleProfile = (moodleUserId) => {
        const redirectTo = `/user/profile.php?id=${moodleUserId}`;
        openMoodleSSO(adminEmail, {
            redirectTo,
            onError: (err) => alert('Failed to open Moodle: ' + err),
        });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/admin/users-by-role`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data?.success) setUsers(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const roles = [...new Set(users.map(u => u.role))].filter(Boolean).sort();

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        const matchesSearch = !q || `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Role counts
    const roleCounts = {};
    users.forEach(u => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1; });

    const handleRoleChange = (role) => {
        const newRole = roleFilter === role ? 'all' : role;
        setRoleFilter(newRole);
        if (newRole !== 'all') {
            setSearchParams({ role: newRole });
        } else {
            setSearchParams({});
        }
    };

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
                            <Users className="w-6 h-6 text-indigo-600" /> Users by Role
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">All system users grouped by role</p>
                    </div>
                </div>
                <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Role filter chips */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleRoleChange('all')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${roleFilter === 'all' ? 'ring-2 ring-purple-500 bg-purple-50 text-purple-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                    All ({users.length})
                </button>
                {roles.map(role => (
                    <button
                        key={role}
                        onClick={() => handleRoleChange(role)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                            roleFilter === role ? 'ring-2 ring-purple-500' : ''
                        } ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-700'}`}
                    >
                        {role.charAt(0).toUpperCase() + role.slice(1)} ({roleCounts[role] || 0})
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm">No users found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Role</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Moodle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u, i) => (
                                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                                        <td className="py-3 px-4 font-medium text-gray-900">{u.first_name} {u.last_name}</td>
                                        <td className="py-3 px-4 text-gray-600">{u.email}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'}`}>
                                                {u.role?.charAt(0).toUpperCase() + u.role?.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '-'}</td>
                                        <td className="py-3 px-4 text-center">
                                            {u.moodle_user_id ? (
                                                <button
                                                    onClick={() => handleOpenMoodleProfile(u.moodle_user_id)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 transition cursor-pointer"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Moodle
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
                    Showing {filtered.length} of {users.length} users
                </div>
            </div>
        </div>
    );
};

export default AdminUsersByRole;

