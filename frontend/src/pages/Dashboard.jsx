import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
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

    const handleModuleClick = (module) => {
        if (module.isSSO) {
            handleAccessLMS();
        } else if (module.path) {
            navigate(module.path);
        } else {
            console.log(`Navigate to ${module.id} module`);
        }
    };

    // Module Definitions with Role-Based Visibility
    const modules = [
        {
            id: 'students',
            title: 'Student Management',
            description: 'Student applications, admissions, enrollment tracking and management dashboard.',
            icon: Users,
            roles: ['admin', 'admission_officer', 'student'],
            color: 'green',
            path: '/students'
        },
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

            {/* Modules Grid */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-800">Operational Modules</h2>
                    <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg text-xs font-bold">{visibleModules.length}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {visibleModules.map((module, index) => {
                        // Muted gradients for less brightness
                        const gradients = [
                            'from-blue-400 to-blue-500',
                            'from-indigo-400 to-indigo-500',
                            'from-purple-400 to-purple-500',
                            'from-emerald-400 to-emerald-500',
                            'from-orange-400 to-orange-500',
                            'from-scl-purple/80 to-scl-dark/90',
                            'from-slate-500 to-slate-600'
                        ];
                        const bgGradient = gradients[index % gradients.length];

                        return (
                            <div
                                key={module.id}
                                onClick={() => handleModuleClick(module)}
                                className={`relative overflow-hidden rounded-xl p-3 border border-white/10 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer bg-gradient-to-br ${bgGradient} text-white`}
                            >
                                <div className="relative z-10 flex flex-col h-full min-h-[85px]">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="p-1.5 rounded-lg bg-white/15 backdrop-blur-md text-white shadow-md border border-white/10 group-hover:scale-105 transition-transform duration-300">
                                            <module.icon className="w-4 h-4" />
                                        </div>
                                        <div className="p-0.5 rounded-full bg-white/10 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowUpRight className="w-2.5 h-2.5" />
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-semibold mb-0.5 leading-tight tracking-tight">
                                        {module.title}
                                    </h3>

                                    <p className="text-[9px] text-white/75 leading-snug flex-grow font-medium line-clamp-1">
                                        {module.description}
                                    </p>

                                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[8px] uppercase font-black tracking-widest text-white/60">
                                            {user.role === 'admin' ? 'Full' : 'Std'}
                                        </span>
                                        {module.isSSO ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAccessLMS(); }}
                                                disabled={loading}
                                                className="text-[10px] font-bold text-white hover:underline flex items-center space-x-1"
                                            >
                                                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Launch</span>}
                                            </button>
                                        ) : (
                                            <span className="text-[10px] font-bold text-white/90 group-hover:text-white transition-colors">Open</span>
                                        )}
                                    </div>
                                </div>

                                {/* Subtle large icon overlay */}
                                <div className="absolute -top-2 -right-2 opacity-5 group-hover:opacity-15 transition-all duration-500 scale-90">
                                    <module.icon className="w-20 h-20" />
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
