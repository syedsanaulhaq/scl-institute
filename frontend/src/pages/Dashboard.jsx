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
    CheckCircle2,
    Users2,
    ShieldCheck,
    Library,
    UserCircle,
    UserSquare2,
    Settings2,
    Lock
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

    // Module Definitions with Role-Based Visibility
    const modules = [
        {
            id: 'partners',
            title: 'Partner & Associates Management',
            description: 'Manage institutional partnerships and external associate directories.',
            icon: Users2,
            roles: ['admin', 'partner_manager'],
            color: 'blue'
        },
        {
            id: 'compliance',
            title: 'Accreditation, QA & Compliance',
            description: 'Track accreditation status, quality assurance audits, and regulatory compliance.',
            icon: ShieldCheck,
            roles: ['admin', 'compliance_officer'],
            color: 'indigo'
        },
        {
            id: 'programs',
            title: 'Course Offerings & Program Catalog',
            description: 'Define and manage full program lifecycle, modules, and credit structures.',
            icon: Library,
            roles: ['admin', 'faculty', 'student', 'admission_officer'],
            color: 'purple'
        },
        {
            id: 'student-portal',
            title: 'Student Portal',
            description: 'Access induction resources, support requests, and formal appeals.',
            icon: UserCircle,
            roles: ['admin', 'student'],
            color: 'emerald'
        },
        {
            id: 'faculty-hr',
            title: 'Faculty Management & HR Directory',
            description: 'Staff directory, workload management, and HR essentials.',
            icon: UserSquare2,
            roles: ['admin', 'hr_admin', 'faculty'],
            color: 'orange'
        },
        {
            id: 'lms',
            title: 'Learning Management (Moodle)',
            description: 'Seamless Single Sign-On access to the Moodle education platform.',
            icon: GraduationCap,
            roles: ['admin', 'faculty', 'student'],
            color: 'scl-purple',
            isSSO: true
        },
        {
            id: 'governance',
            title: 'Governance & ERP Lite Essentials',
            description: 'Core institutional records, financial summaries, and governance tools.',
            icon: Settings2,
            roles: ['admin'],
            color: 'slate'
        }
    ];

    // Filter modules based on user role
    const visibleModules = modules.filter(mod => mod.roles.includes(user.role));

    const stats = [
        { label: 'Active Sessions', value: '12', icon: Activity, color: 'blue' },
        { label: 'Total Users', value: '1,284', icon: Users, color: 'purple' },
        { label: 'System Health', value: '99.9%', icon: CheckCircle2, color: 'green' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Institutional Dashboard</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">
                        Welcome back, <span className="text-scl-purple">{user.name}</span>. Managing SCL Institute.
                    </p>
                </div>
                <div className="hidden sm:flex space-x-2">
                    <span className="px-3 py-1 bg-scl-purple/10 text-scl-purple rounded-full text-xs font-bold uppercase tracking-wider border border-scl-purple/20">
                        {user.role} Access
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-2xl bg-gray-50 text-gray-600 group-hover:bg-scl-purple group-hover:text-white transition-all duration-300">
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">LIVE</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-1 tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modules Grid */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-800">Operational Modules</h2>
                    <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg text-xs font-bold">{visibleModules.length}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleModules.map((module, index) => {
                        // Vibrant gradients inspired by legacy SCL project
                        const gradients = [
                            'from-blue-600 to-blue-700',
                            'from-indigo-600 to-indigo-700',
                            'from-purple-600 to-purple-700',
                            'from-emerald-600 to-emerald-700',
                            'from-orange-600 to-orange-700',
                            'from-scl-purple to-scl-dark',
                            'from-slate-700 to-slate-800'
                        ];
                        const bgGradient = gradients[index % gradients.length];

                        return (
                            <div
                                key={module.id}
                                className={`relative overflow-hidden rounded-3xl p-7 border border-white/10 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer bg-gradient-to-br ${bgGradient} text-white`}
                            >
                                <div className="relative z-10 flex flex-col h-full min-h-[160px]">
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md text-white shadow-lg border border-white/10 group-hover:scale-110 transition-transform duration-300">
                                            <module.icon className="w-6 h-6" />
                                        </div>
                                        <div className="p-1 rounded-full bg-white/10 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 leading-tight tracking-tight">
                                        {module.title}
                                    </h3>

                                    <p className="text-sm text-white/80 leading-relaxed flex-grow font-medium">
                                        {module.description}
                                    </p>

                                    <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-white/60">
                                            Authority: {user.role === 'admin' ? 'Full' : 'Standard'}
                                        </span>
                                        {module.isSSO ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAccessLMS(); }}
                                                disabled={loading}
                                                className="text-xs font-bold text-white hover:underline flex items-center space-x-1"
                                            >
                                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Launch Portal</span>}
                                            </button>
                                        ) : (
                                            <span className="text-xs font-bold text-white/90 group-hover:text-white transition-colors">Open Module</span>
                                        )}
                                    </div>
                                </div>

                                {/* Subtle large icon overlay */}
                                <div className="absolute -top-6 -right-6 opacity-10 group-hover:opacity-20 transition-all duration-500 scale-125">
                                    <module.icon className="w-48 h-48" />
                                </div>

                                {/* Bottom shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>
                        );
                    })}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center space-x-4">
                    <ShieldCheck className="w-6 h-6 text-red-500" />
                    <div>
                        <p className="text-sm font-bold text-red-800">Security / Integration Error</p>
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
