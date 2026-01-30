import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard,
    GraduationCap,
    Users,
    Settings,
    ChevronLeft,
    Menu,
    ShieldCheck,
    LogOut,
    ChevronDown,
    ChevronRight,
    FileText,
    UserPlus,
    BarChart3,
    UserCheck
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Sidebar = ({ isOpen, toggle, onLogout, user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({ 'student-admission': true });
    const [loading, setLoading] = useState(false);

    const handleAccessLMS = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/sso/generate`, {
                email: user.email
            });

            if (response.data.success) {
                window.open(response.data.redirectUrl, '_blank');
            } else {
                console.error('Failed to generate SSO token');
            }
        } catch (err) {
            console.error('Failed to access LMS:', err);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        {
            name: 'Student Admission',
            icon: Users,
            isParent: true,
            key: 'student-admission',
            subItems: [
                { name: 'Dashboard', icon: BarChart3, path: '/students' },
                { name: 'New Admission', icon: UserPlus, path: '/student-application' },
                { name: 'View Students', icon: UserCheck, path: '/student-list' },
                { name: 'Report', icon: FileText, path: '/students/report' }
            ]
        },
        { name: 'Access LMS', icon: GraduationCap, isSSO: true },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    const toggleSubMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const handleMenuClick = (item) => {
        if (item.isParent) {
            toggleSubMenu(item.key);
        } else if (item.isSSO) {
            handleAccessLMS();
        } else if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 bg-scl-dark text-white transition-all duration-300 ease-in-out shadow-2xl ${isOpen ? 'w-56' : 'w-16'
                }`}
        >
            <div className="flex flex-col h-full">
                {/* Logo Area */}
                <div className="h-14 flex items-center justify-between px-3 border-b border-white/10">
                    <div className={`flex items-center space-x-2 overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                        <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-lg border border-white/20">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-base tracking-tight whitespace-nowrap text-white">SCL Institute</span>
                    </div>
                    <button
                        onClick={toggle}
                        className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${!isOpen ? 'mx-auto' : ''}`}
                    >
                        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const isExpanded = item.isParent && expandedMenus[item.key];
                        
                        return (
                            <div key={item.name}>
                                {/* Main Menu Item */}
                                <button
                                    onClick={() => handleMenuClick(item)}
                                    disabled={item.isSSO && loading}
                                    className={`w-full flex items-center h-10 rounded-lg transition-all duration-200 group relative ${
                                        isActive
                                            ? 'bg-scl-purple text-white shadow-lg shadow-scl-purple/20'
                                            : 'text-purple-100/70 hover:bg-white/5 hover:text-white'
                                    } ${item.isSSO && loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className={`flex items-center justify-center transition-all duration-300 ${isOpen ? 'pl-3 w-10' : 'w-full'}`}>
                                        <item.icon className={`w-4 h-4 ${isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} />
                                    </div>
                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 text-xs overflow-hidden ${
                                        isOpen ? 'opacity-100 ml-3 flex-1 text-left' : 'opacity-0 w-0'
                                    }`}>
                                        {item.name}
                                    </span>
                                    
                                    {/* Chevron for parent items */}
                                    {item.isParent && isOpen && (
                                        <div className="pr-4">
                                            {isExpanded ? 
                                                <ChevronDown className="w-4 h-4 transition-transform" /> : 
                                                <ChevronRight className="w-4 h-4 transition-transform" />
                                            }
                                        </div>
                                    )}

                                    {!isOpen && (
                                        <div className="absolute left-full ml-4 px-2 py-1 bg-scl-dark text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
                                            {item.name}
                                        </div>
                                    )}
                                </button>

                                {/* Sub Menu Items */}
                                {item.isParent && isExpanded && isOpen && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {item.subItems.map((subItem) => {
                                            const isSubActive = location.pathname === subItem.path;
                                            return (
                                                <button
                                                    key={subItem.name}
                                                    onClick={() => navigate(subItem.path)}
                                                    className={`w-full flex items-center h-10 rounded-lg transition-all duration-200 group relative pl-4 ${
                                                        isSubActive
                                                            ? 'bg-scl-purple/50 text-white shadow-md'
                                                            : 'text-purple-100/60 hover:bg-white/5 hover:text-white'
                                                    }`}
                                                >
                                                    <subItem.icon className="w-4 h-4 mr-3" />
                                                    <span className="font-medium text-sm">
                                                        {subItem.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer / Logout Area */}
                <div className="p-3 border-t border-white/10">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center h-12 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all duration-200 group relative"
                    >
                        <div className={`flex items-center justify-center transition-all duration-300 ${isOpen ? 'pl-4 w-12' : 'w-full'}`}>
                            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className={`font-bold whitespace-nowrap transition-all duration-300 text-sm overflow-hidden ${isOpen ? 'opacity-100 ml-3' : 'opacity-0 w-0'
                            }`}>
                            Logout
                        </span>

                        {!isOpen && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                Logout
                            </div>
                        )}
                    </button>

                    {isOpen && (
                        <div className="mt-4 px-4 pb-2">
                            <p className="text-[10px] text-purple-300/50 uppercase tracking-widest font-bold">Admin Portal v1.0</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
