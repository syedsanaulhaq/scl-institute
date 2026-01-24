import { useState } from 'react';
import axios from 'axios';
import {
    LayoutDashboard,
    GraduationCap,
    Users,
    Key,
    ArrowUpRight,
    Activity,
    LogOut,
    Loader2,
    CheckCircle2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Dashboard = ({ user, onLogout }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAccessLMS = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.post(`${API_URL}/sso/generate`, {
                email: user.email
            });

            if (response.data.success) {
                window.open(response.data.redirectUrl, '_blank');
            } else {
                setError('Failed to generate SSO token');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to access LMS');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Active Sessions', value: '12', icon: Activity, color: 'blue' },
        { label: 'Total Users', value: '1,284', icon: Users, color: 'purple' },
        { label: 'Moodle Status', value: 'Online', icon: CheckCircle2, color: 'green' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
                <p className="text-gray-500 mt-1 text-sm tracking-wide uppercase font-semibold">Administrator Dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+4.5%</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LMS Access Card */}
                <div className="lg:col-span-2 relative overflow-hidden bg-scl-purple rounded-3xl p-8 text-white shadow-xl shadow-scl-purple/30 group">
                    <div className="absolute top-0 right-0 p-8 transform translate-x-12 -translate-y-12 group-hover:translate-x-10 group-hover:-translate-y-10 transition-transform duration-500 opacity-20">
                        <GraduationCap className="w-64 h-64" />
                    </div>

                    <div className="relative z-10 space-y-6 max-w-lg">
                        <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase">
                            Education Ecosystem
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                            Access Learning Management System
                        </h2>
                        <p className="text-purple-100 text-lg">
                            Seamlessly access Moodle with professional administrator privileges already configured for your profile.
                        </p>

                        {error && (
                            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-white p-3 rounded-xl text-sm italic">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleAccessLMS}
                            disabled={loading}
                            className="inline-flex items-center space-x-2 bg-white text-scl-purple px-8 py-4 rounded-2xl font-bold hover:bg-purple-50 transition-colors shadow-lg disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Launch Moodle LMS</span>
                                    <ArrowUpRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Quick Info / User Card */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">System Profile</h3>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-12 h-12 rounded-xl bg-scl-purple text-white flex items-center justify-center font-bold text-xl">
                                {user.name[0]}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 leading-none">{user.name}</p>
                                <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium uppercase tracking-wider text-xs">Role</span>
                                <span className="px-3 py-1 bg-purple-50 text-scl-purple rounded-full font-bold text-xs uppercase">{user.role}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium uppercase tracking-wider text-xs">SSO Status</span>
                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full font-bold text-xs uppercase font-semibold">Active</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                onClick={onLogout}
                                className="w-full inline-flex items-center justify-center space-x-2 text-gray-500 hover:text-red-500 transition-colors py-2 font-semibold text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout from System</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
