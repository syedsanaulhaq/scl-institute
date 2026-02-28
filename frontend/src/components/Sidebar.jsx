import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard,
    GraduationCap,
    Users,
    Settings,
    Menu,
    ShieldCheck,
    LogOut,
    ChevronDown,
    ChevronRight,
    FileText,
    UserPlus,
    BarChart3,
    UserCheck,
    User,
    BookOpen,
    Calendar,
    ClipboardList,
    Bell,
    HelpCircle,
    DollarSign
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
                window.open(response.data.redirectUrl, '_blank', 'noopener,noreferrer');
            } else {
                console.error('Failed to generate SSO token');
            }
        } catch (err) {
            console.error('Failed to access LMS:', err);
        } finally {
            setLoading(false);
        }
    };

    // Admin menu items
    const adminMenuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Admissions Hub', icon: BarChart3, path: '/admin/dashboard' },
        {
            name: 'Student Admission',
            icon: Users,
            isParent: true,
            key: 'student-admission',
            subItems: [
                { name: 'Applications', icon: BarChart3, path: '/applications' },
                { name: 'New Admission', icon: UserPlus, path: '/student-application' },
                { name: 'Applicants List', icon: UserCheck, path: '/applicants' },
                { name: 'Reports', icon: FileText, path: '/applications-report' }
            ]
        },
        { name: 'Course Inductions', icon: ClipboardList, path: '/course-inductions' },
        { name: 'Course Accreditations', icon: FileText, path: '/course-accreditations' },
        { name: 'Access LMS', icon: GraduationCap, isSSO: true },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    // Student menu items organized by linked modules
    const studentMenuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
        { name: 'My Profile', icon: User, path: '/student/profile' },
        
        // Admissions Module
        {
            name: 'Admissions',
            icon: FileText,
            isParent: true,
            key: 'admissions',
            subItems: [
                { name: 'Admissions & Enrolment', icon: UserCheck, path: '/student/admissions' },
                { name: 'Right to Study', icon: ShieldCheck, path: '/student/right-to-study' },
                { name: 'Student Contract', icon: FileText, path: '/student/contract' },
                { name: 'Induction & Orientation', icon: BookOpen, path: '/student/induction' },
                { name: 'Course Changes', icon: ClipboardList, path: '/student/course-changes' },
                { name: 'Documents Centre', icon: FileText, path: '/student/documents' },
            ]
        },

        // LMS Module
        {
            name: 'Learning (LMS)',
            icon: GraduationCap,
            isParent: true,
            key: 'lms',
            subItems: [
                { name: 'My Programme', icon: BookOpen, path: '/student/programme' },
                { name: 'Timetable', icon: Calendar, path: '/student/timetable' },
                { name: 'Access Moodle LMS', icon: GraduationCap, isSSO: true },
                { name: 'Learning Materials', icon: BookOpen, path: '/student/materials' },
                { name: 'Assessments & Exams', icon: ClipboardList, path: '/student/assessments' },
                { name: 'Grades & Progress', icon: BarChart3, path: '/student/grades' },
                { name: 'Attendance', icon: UserCheck, path: '/student/attendance' },
                { name: 'Library Resources', icon: BookOpen, path: '/student/library' },
            ]
        },

        // Support & Wellbeing Module
        {
            name: 'Support & Wellbeing',
            icon: HelpCircle,
            isParent: true,
            key: 'support',
            subItems: [
                { name: 'Messages & Announcements', icon: Bell, path: '/student/messages' },
                { name: 'Support Requests', icon: HelpCircle, path: '/student/support' },
                { name: 'Feedback & Evaluations', icon: ClipboardList, path: '/student/support' },
                { name: 'Complaints & Appeals', icon: FileText, path: '/student/support' },
                { name: 'Disability Support', icon: ShieldCheck, path: '/student/support' },
                { name: 'Safeguarding & Prevent', icon: ShieldCheck, path: '/student/support' },
            ]
        },

        // Finance Module
        {
            name: 'Finance',
            icon: DollarSign,
            isParent: true,
            key: 'finance',
            subItems: [
                { name: 'Fees & Payments', icon: DollarSign, path: '/student/fees' },
            ]
        },

        // Compliance Module
        {
            name: 'Compliance',
            icon: ShieldCheck,
            isParent: true,
            key: 'compliance',
            subItems: [
                { name: 'Data Protection', icon: ShieldCheck, path: '/student/data-protection' },
                { name: 'Health & Safety', icon: HelpCircle, path: '/student/health-safety' },
            ]
        },
    ];

    // Select menu based on user role (case-insensitive)
    const menuItems = user?.role?.toLowerCase() === 'student' ? studentMenuItems : adminMenuItems;

    const toggleSubMenu = (menuKey) => {
        setExpandedMenus(prev => ({
            // Close all other menus
            admissions: menuKey === 'admissions' ? !prev.admissions : false,
            lms: menuKey === 'lms' ? !prev.lms : false,
            support: menuKey === 'support' ? !prev.support : false,
            finance: menuKey === 'finance' ? !prev.finance : false,
            compliance: menuKey === 'compliance' ? !prev.compliance : false,
        }));
    };

    const handleMenuClick = (item) => {
        if (item.isParent) {
            toggleSubMenu(item.key);
        } else if (item.isSSO) {
            handleAccessLMS();
        } else if (item.isExternal) {
            window.open(item.path, '_blank');
        } else if (item.path) {
            navigate(item.path);
        }
    };

    const handleSubItemClick = (subItem) => {
        if (subItem.isSSO) {
            handleAccessLMS();
        } else if (subItem.path) {
            navigate(subItem.path);
        }
    };

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 bg-scl-dark text-white transition-all duration-300 ease-in-out shadow-2xl ${isOpen ? 'w-56' : 'w-16'
                }`}
        >
            <div className="flex flex-col h-full relative">
                {/* Logo Area */}
                <div className={`h-[5.5rem] flex items-center px-3 border-b border-white/10 ${isOpen ? 'justify-between' : 'justify-center'}`}>
                    <div className="flex items-center space-x-2 rounded-lg bg-white/15 px-2 py-1">
                        <img src="/assets/scl_logo.png" alt="Stratford College Lond." className="h-9 w-9 object-contain flex-shrink-0" />
                        {isOpen && (
                            <span className="font-bold text-sm tracking-tight whitespace-nowrap text-white">Stratford College Lond.</span>
                        )}
                    </div>
                </div>

                <button
                    onClick={toggle}
                    className="absolute top-3 -right-6 z-10 text-scl-purple hover:text-scl-purple transition-colors rounded-lg"
                    aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    <Menu className="h-[3.5rem] w-[1.5em]" />
                </button>

                {/* Navigation Items */}
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/40">
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
                                    <span className={`font-medium whitespace-nowrap transition-all duration-300 text-sm overflow-hidden ${
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
                                                    onClick={() => handleSubItemClick(subItem)}
                                                    disabled={subItem.isSSO && loading}
                                                    className={`w-full flex items-center justify-start h-10 rounded-lg transition-all duration-200 group relative pl-4 ${
                                                        isSubActive
                                                            ? 'bg-scl-purple/50 text-white shadow-md'
                                                            : 'text-purple-100/60 hover:bg-white/5 hover:text-white'
                                                    } ${subItem.isSSO && loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <subItem.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                                                    <span className="font-medium text-xs text-left">
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
