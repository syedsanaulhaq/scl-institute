import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Shield, Search, RefreshCw, ArrowLeft, Save, Check, X,
    ChevronDown, User, Lock, ToggleLeft, ToggleRight, Edit2
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ALL_ROLES = [
    { value: 'systemadmin', label: 'System Admin', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'collegeadmin', label: 'College Admin', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'manager', label: 'Manager', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'teacher', label: 'Teacher', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'editingteacher', label: 'Editing Teacher', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'student', label: 'Student', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'coursecreator', label: 'Course Creator', color: 'bg-orange-100 text-orange-800 border-orange-200' },
];

const PRIVILEGE_LABELS = {
    can_approve_applications: { label: 'Approve Applications', description: 'Review and approve/reject student applications' },
    can_manage_students: { label: 'Manage Students', description: 'View, edit and manage student records' },
    can_manage_teachers: { label: 'Manage Teachers', description: 'View, edit and manage teacher records' },
    can_view_reports: { label: 'View Reports', description: 'Access college reports and analytics dashboards' },
    can_manage_courses: { label: 'Manage Courses', description: 'Create and manage course lifecycle' },
    can_access_lms: { label: 'Access LMS', description: 'Single sign-on access to Moodle LMS' },
    can_manage_settings: { label: 'Manage Settings', description: 'Change system and account settings' },
    can_manage_roles: { label: 'Manage Roles & Users', description: 'Assign roles and edit privileges for users' },
};

function RoleBadge({ role }) {
    const found = ALL_ROLES.find(r => r.value === role);
    const label = found?.label || role || 'Unknown';
    const color = found?.color || 'bg-gray-100 text-gray-700 border-gray-200';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
            {label}
        </span>
    );
}

export default function UserRoleManagement() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('users');

    // Users tab state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [editingUserId, setEditingUserId] = useState(null);
    const [editingRole, setEditingRole] = useState('');
    const [savingUserId, setSavingUserId] = useState(null);
    const [userSavedId, setUserSavedId] = useState(null);

    // Privileges tab state
    const [privileges, setPrivileges] = useState({});
    const [privLoading, setPrivLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState('systemadmin');
    const [localPrivileges, setLocalPrivileges] = useState({});
    const [privSaving, setPrivSaving] = useState(false);
    const [privSaved, setPrivSaved] = useState(false);

    const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('accessToken');

    const fetchUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            const res = await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${getToken()}` },
                params,
            });
            if (res.data?.success) setUsers(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setUsersLoading(false);
        }
    }, [search, roleFilter]);

    const fetchPrivileges = useCallback(async () => {
        setPrivLoading(true);
        try {
            const res = await axios.get(`${API_URL}/admin/role-privileges`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.data?.success) {
                setPrivileges(res.data.data || {});
                setLocalPrivileges(res.data.data?.[selectedRole] || {});
            }
        } catch (err) {
            console.error('Failed to fetch privileges', err);
        } finally {
            setPrivLoading(false);
        }
    }, [selectedRole]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { if (tab === 'privileges') fetchPrivileges(); }, [tab, fetchPrivileges]);
    useEffect(() => {
        if (privileges[selectedRole]) setLocalPrivileges({ ...privileges[selectedRole] });
    }, [selectedRole, privileges]);

    const handleSaveRole = async (userId) => {
        setSavingUserId(userId);
        try {
            await axios.put(`${API_URL}/admin/users/${userId}/role`, { role: editingRole }, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: editingRole } : u));
            setEditingUserId(null);
            setUserSavedId(userId);
            setTimeout(() => setUserSavedId(null), 2000);
        } catch (err) {
            alert('Failed to update role: ' + (err.response?.data?.error || err.message));
        } finally {
            setSavingUserId(null);
        }
    };

    const handleSavePrivileges = async () => {
        setPrivSaving(true);
        try {
            await axios.put(`${API_URL}/admin/role-privileges/${selectedRole}`, { privileges: localPrivileges }, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setPrivileges(prev => ({ ...prev, [selectedRole]: { ...localPrivileges } }));
            setPrivSaved(true);
            setTimeout(() => setPrivSaved(false), 2000);
        } catch (err) {
            alert('Failed to save privileges: ' + (err.response?.data?.error || err.message));
        } finally {
            setPrivSaving(false);
        }
    };

    const togglePrivilege = (key) => {
        setLocalPrivileges(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const privilegeKeys = Object.keys(PRIVILEGE_LABELS);

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
                            <Shield className="w-6 h-6 text-red-600" /> User & Role Management
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Assign roles to users and configure role privileges</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-200 rounded-xl p-1 w-fit">
                <button
                    onClick={() => setTab('users')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === 'users' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Users className="w-4 h-4" /> Users
                </button>
                <button
                    onClick={() => setTab('privileges')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === 'privileges' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Lock className="w-4 h-4" /> Roles & Privileges
                </button>
            </div>

            {/* ─── USERS TAB ─── */}
            {tab === 'users' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="">All Roles</option>
                            {ALL_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <button
                            onClick={fetchUsers}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {['systemadmin', 'collegeadmin', 'manager', 'teacher'].map(r => {
                            const count = users.filter(u => u.role === r).length;
                            const found = ALL_ROLES.find(x => x.value === r);
                            return (
                                <div key={r} className="bg-white rounded-xl border border-gray-200 p-4">
                                    <p className="text-xs text-gray-500">{found?.label}</p>
                                    <p className="text-2xl font-extrabold text-gray-900">{count}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                        {usersLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-6 h-6 text-red-600 animate-spin" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 text-sm">No users found</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Current Role</th>
                                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user, i) => (
                                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xs flex-shrink-0">
                                                            {(user.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-900">
                                                            {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-gray-500">{user.email}</td>
                                                <td className="py-3 px-4 text-center">
                                                    {editingUserId === user.id ? (
                                                        <select
                                                            value={editingRole}
                                                            onChange={e => setEditingRole(e.target.value)}
                                                            className="px-2 py-1 border border-blue-400 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                                                            autoFocus
                                                        >
                                                            {ALL_ROLES.map(r => (
                                                                <option key={r.value} value={r.value}>{r.label}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <RoleBadge role={user.role} />
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {userSavedId === user.id ? (
                                                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold">
                                                            <Check className="w-3.5 h-3.5" /> Saved
                                                        </span>
                                                    ) : editingUserId === user.id ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleSaveRole(user.id)}
                                                                disabled={savingUserId === user.id}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                                                            >
                                                                {savingUserId === user.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingUserId(null)}
                                                                className="p-1 rounded-lg hover:bg-gray-200 transition text-gray-500"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setEditingUserId(user.id); setEditingRole(user.role || 'student'); }}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
                                                        >
                                                            <Edit2 className="w-3 h-3" /> Change Role
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── PRIVILEGES TAB ─── */}
            {tab === 'privileges' && (
                <div className="space-y-4">
                    {privLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw className="w-6 h-6 text-red-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Role selector */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 h-fit">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-3">Select Role</p>
                                {ALL_ROLES.filter(r => ['systemadmin', 'collegeadmin', 'manager', 'teacher', 'student', 'coursecreator'].includes(r.value)).map(r => (
                                    <button
                                        key={r.value}
                                        onClick={() => setSelectedRole(r.value)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition ${selectedRole === r.value ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                                    >
                                        <span>{r.label}</span>
                                        {selectedRole === r.value && <ChevronDown className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>

                            {/* Privileges editor */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">
                                                {ALL_ROLES.find(r => r.value === selectedRole)?.label} Privileges
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">Toggle permissions for this role</p>
                                        </div>
                                        <button
                                            onClick={handleSavePrivileges}
                                            disabled={privSaving}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${privSaved ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-700'} disabled:opacity-50`}
                                        >
                                            {privSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : privSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                            {privSaved ? 'Saved!' : 'Save Changes'}
                                        </button>
                                    </div>

                                    <div className="divide-y divide-gray-100">
                                        {privilegeKeys.map(key => {
                                            const info = PRIVILEGE_LABELS[key];
                                            const isOn = Boolean(localPrivileges[key]);
                                            return (
                                                <div key={key} className="flex items-center justify-between py-4">
                                                    <div className="flex-1 pr-4">
                                                        <p className="text-sm font-semibold text-gray-900">{info.label}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{info.description}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => togglePrivilege(key)}
                                                        className="flex-shrink-0 focus:outline-none"
                                                        aria-label={`Toggle ${info.label}`}
                                                    >
                                                        {isOn ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs font-semibold text-green-600">ON</span>
                                                                <div className="w-11 h-6 bg-green-500 rounded-full relative transition-colors">
                                                                    <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs font-semibold text-gray-400">OFF</span>
                                                                <div className="w-11 h-6 bg-gray-300 rounded-full relative transition-colors">
                                                                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Overview of all roles */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4">All Roles — Privileges Overview</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="text-left py-2 pr-4 font-semibold text-gray-600">Privilege</th>
                                                    {ALL_ROLES.filter(r => ['systemadmin', 'collegeadmin', 'manager', 'teacher', 'student'].includes(r.value)).map(r => (
                                                        <th key={r.value} className="text-center py-2 px-2 font-semibold text-gray-600 whitespace-nowrap">{r.label}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {privilegeKeys.map(key => (
                                                    <tr key={key} className="border-b border-gray-50">
                                                        <td className="py-2 pr-4 text-gray-700 font-medium whitespace-nowrap">{PRIVILEGE_LABELS[key].label}</td>
                                                        {['systemadmin', 'collegeadmin', 'manager', 'teacher', 'student'].map(r => (
                                                            <td key={r} className="py-2 px-2 text-center">
                                                                {privileges[r]?.[key]
                                                                    ? <span className="text-green-500 font-bold">✓</span>
                                                                    : <span className="text-gray-300">—</span>
                                                                }
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
