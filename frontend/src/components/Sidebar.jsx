import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    ClipboardCheck,
    UserCheck,
    User,
    BookOpen,
    Calendar,
    ClipboardList,
    Bell,
    HelpCircle,
    DollarSign
} from 'lucide-react';
import { getRoleContext } from '../utils/roleAccess';
import { openMoodleSSO } from '../utils/ssoService';

// CSS to hide scrollbar across browsers
const scrollbarHideStyles = `
  nav[data-scrollbar-hide]::-webkit-scrollbar {
    display: none;
  }
`;

const Sidebar = ({ isOpen, toggle, onLogout, user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const roleContext = getRoleContext(user);
    const { canAccessStudentPortal, canAccessManagementPortal, hasTeaching, hasManagement, hasStudent } = roleContext;
    const isManagementUser = Boolean(canAccessManagementPortal || hasManagement);
    const [activeSectionTitle, setActiveSectionTitle] = useState(() => {
        if (canAccessManagementPortal) return 'Manager Menu';
        if (hasTeaching && !hasStudent) return 'Teacher Menu';
        if (canAccessStudentPortal) return 'Student Menu';
        if (hasTeaching) return 'Teacher Menu';
        return 'General Menu';
    });
    const [activeSubMenuKey, setActiveSubMenuKey] = useState(null);

    const handleAccessLMS = async () => {
        try {
            setLoading(true);
            await openMoodleSSO(user.email);
        } catch (err) {
            console.error('Failed to access LMS:', err);
        } finally {
            setLoading(false);
        }
    };

    const managerMenuItems = canAccessManagementPortal
        ? [
            { name: 'Overview & Reports', icon: BarChart3, path: '/' },
            { name: 'Module Launcher', icon: LayoutDashboard, path: '/modules' },
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
                    { name: 'Course Changes', icon: ClipboardList, path: '/course-change-requests' },
                    { name: 'Reports', icon: FileText, path: '/applications-report' }
                ]
            },
            {
                name: 'Teacher Admission',
                icon: Users,
                isParent: true,
                key: 'teacher-admission',
                subItems: [
                    { name: 'Teacher Registrations', icon: Users, path: '/teacher-registrations' },
                    { name: 'New Teacher Registration', icon: UserPlus, path: '/teacher-registration' }
                ]
            },
            { name: 'Course Lifecycle', icon: LayoutDashboard, path: '/course-lifecycle' },
            { name: 'Programme Intakes', icon: Users, path: '/programme-intakes' },
            { name: 'Access LMS', icon: GraduationCap, isSSO: true },
            { name: 'Settings', icon: Settings, path: '/settings' }
        ]
        : [];

    const studentMenuItems = (hasStudent || isManagementUser)
        ? [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
            { name: 'Portal Home', icon: BookOpen, path: '/student/portal' },
            { name: 'My Profile', icon: User, path: '/student/profile' },
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
                    { name: 'Documents Centre', icon: FileText, path: '/student/documents' }
                ]
            },
            {
                name: 'Learning (LMS)',
                icon: GraduationCap,
                isParent: true,
                key: 'learning-lms',
                subItems: [
                    { name: 'My Programme', icon: BookOpen, path: '/student/programme' },
                    { name: 'Timetable', icon: Calendar, path: '/student/timetable' },
                    { name: 'Access Moodle LMS', icon: GraduationCap, isSSO: true },
                    { name: 'Learning Materials', icon: BookOpen, path: '/student/materials' },
                    { name: 'Assessments & Exams', icon: ClipboardList, path: '/student/assessments' },
                    { name: 'Grades & Progress', icon: BarChart3, path: '/student/grades' },
                    { name: 'Attendance', icon: UserCheck, path: '/student/attendance' },
                    { name: 'Library Resources', icon: BookOpen, path: '/student/library' }
                ]
            },
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
                    { name: 'Safeguarding & Prevent', icon: ShieldCheck, path: '/student/support' }
                ]
            },
            {
                name: 'Finance',
                icon: DollarSign,
                isParent: true,
                key: 'finance',
                subItems: [
                    { name: 'Fees & Payments', icon: DollarSign, path: '/student/fees' }
                ]
            }
        ]
        : [];

    const teacherMenuItems = (hasTeaching || isManagementUser)
        ? [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' },
            { name: 'My Teaching Programme', icon: BookOpen, path: '/teacher/programme' },
            { name: 'Assessments', icon: ClipboardCheck, path: '/teacher/assessments' },
            { name: 'Reports', icon: BarChart3, path: '/teacher/reports' },
            {
                name: 'Teaching (LMS)',
                icon: BookOpen,
                isParent: true,
                key: 'teaching-lms',
                subItems: [
                    { name: 'Open Moodle Teaching', icon: GraduationCap, isSSO: true },
                    { name: 'My Timetable', icon: Calendar, path: '/teacher/timetable' }
                ]
            }
        ]
        : [];

    const generalMenuItems = (!canAccessStudentPortal && !hasTeaching && !canAccessManagementPortal && !isManagementUser)
        ? [{ name: 'Access Moodle LMS', icon: GraduationCap, isSSO: true }]
        : [];

    const menuSections = [
        { title: 'Manager Menu', items: managerMenuItems },
        { title: 'Student Menu', items: studentMenuItems },
        { title: 'Teacher Menu', items: teacherMenuItems },
        { title: 'General Menu', items: generalMenuItems }
    ].filter((section) => section.items.length > 0);

    useEffect(() => {
        // Allow empty string (collapsed state) - don't auto-expand
        if (activeSectionTitle === '') return;
        
        const sectionExists = menuSections.some((section) => section.title === activeSectionTitle);
        if (!sectionExists && menuSections.length > 0) {
            setActiveSectionTitle(menuSections[0].title);
        }
        
        // Inject scrollbar hide styles
        if (!document.getElementById('scrollbar-hide-styles')) {
            const style = document.createElement('style');
            style.id = 'scrollbar-hide-styles';
            style.textContent = scrollbarHideStyles;
            document.head.appendChild(style);
        }
    }, [activeSectionTitle, menuSections]);

    const toggleSection = (sectionTitle) => {
        setActiveSectionTitle((prev) => (prev === sectionTitle ? '' : sectionTitle));
        setActiveSubMenuKey(null);
    };

    const toggleSubMenu = (menuKey) => {
        setActiveSubMenuKey((prev) => (prev === menuKey ? null : menuKey));
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
            className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out shadow-lg ${isOpen ? 'w-56' : 'w-16'
                }`}
            style={{ backgroundColor: '#f3f4f6', borderRight: '1px solid #e5e7eb' }}
        >
            <div className="flex flex-col h-full relative">
                {/* Logo Area */}
                <div className={`h-[5.5rem] flex items-center px-3 border-b ${isOpen ? 'justify-between' : 'justify-center'}`} style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center space-x-2 rounded-lg px-2 py-1" style={{ backgroundColor: '#EBF0FF' }}>
                        <img src="/assets/scl_logo.png" alt="Stratford College Lond." className="h-9 w-9 object-contain flex-shrink-0" />
                        {isOpen && (
                            <span className="font-bold text-sm tracking-tight whitespace-nowrap" style={{ color: '#1F2937' }}>Stratford College Lond.</span>
                        )}
                    </div>
                </div>

                <button
                    onClick={toggle}
                    className="absolute top-3 -right-6 z-10 hover:opacity-70 transition-opacity rounded-lg"
                    style={{ color: '#2563EB' }}
                    aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    <Menu className="h-[3.5rem] w-[1.5em]" />
                </button>

                {/* Navigation Items */}
                <nav 
                    className="flex-1 px-2 py-4 space-y-3 overflow-y-auto overflow-x-hidden" 
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    data-scrollbar-hide
                >
                    {menuSections.map((section) => (
                        <div key={section.title} className="space-y-1">
                            {isOpen ? (
                                <button
                                    onClick={() => toggleSection(section.title)}
                                    className="w-full px-3 pt-1 pb-1 text-[10px] uppercase tracking-widest font-bold border-b flex items-center justify-between hover:text-blue-600 transition-colors"
                                    style={{ color: '#9CA3AF', borderColor: '#E5E7EB' }}
                                >
                                    <span>{section.title}</span>
                                    {activeSectionTitle === section.title
                                        ? <ChevronDown className="w-3 h-3" />
                                        : <ChevronRight className="w-3 h-3" />}
                                </button>
                            ) : (
                                <div className="mx-2 h-px" style={{ backgroundColor: '#E5E7EB' }} />
                            )}

                            {(activeSectionTitle === section.title || !isOpen) && section.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                const isExpanded = item.isParent && activeSubMenuKey === item.key;

                                return (
                                    <div key={`${section.title}-${item.name}`}>
                                        <button
                                            onClick={() => handleMenuClick(item)}
                                            disabled={item.isSSO && loading}
                                            className={`w-full flex items-center h-10 rounded-lg transition-all duration-200 group relative ${
                                                isActive
                                                    ? 'shadow-md'
                                                    : ''
                                            } ${item.isSSO && loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            style={{
                                                backgroundColor: isActive ? '#DBEAFE' : 'transparent',
                                                color: isActive ? '#2563EB' : '#6B7280'
                                            }}
                                            onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = '#F0F0F0')}
                                            onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                                        >
                                            <div className={`flex items-center justify-center transition-all duration-300 ${isOpen ? 'pl-3 w-10' : 'w-full'}`}>
                                                <item.icon className={`w-4 h-4 ${isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} />
                                            </div>
                                            <span className={`font-medium whitespace-nowrap transition-all duration-300 text-sm overflow-hidden ${
                                                isOpen ? 'opacity-100 ml-3 flex-1 text-left' : 'opacity-0 w-0'
                                            }`}>
                                                {item.name}
                                            </span>

                                            {item.isParent && isOpen && (
                                                <div className="pr-4">
                                                    {isExpanded
                                                        ? <ChevronDown className="w-4 h-4 transition-transform" />
                                                        : <ChevronRight className="w-4 h-4 transition-transform" />}
                                                </div>
                                            )}

                                            {!isOpen && (
                                                <div className="absolute left-full ml-4 px-2 py-1 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl" style={{ backgroundColor: '#374151' }}>
                                                    {item.name}
                                                </div>
                                            )}
                                        </button>

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
                                                                subItem.isSSO && loading ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                            style={{
                                                                backgroundColor: isSubActive ? '#DBEAFE' : 'transparent',
                                                                color: isSubActive ? '#2563EB' : '#6B7280'
                                                            }}
                                                            onMouseEnter={(e) => !isSubActive && (e.currentTarget.style.backgroundColor = '#F0F0F0')}
                                                            onMouseLeave={(e) => !isSubActive && (e.currentTarget.style.backgroundColor = 'transparent')}
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
                        </div>
                    ))}
                </nav>

                {/* Footer / Logout Area */}
                <div className="p-3" style={{ borderTop: '1px solid #E5E7EB' }}>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center h-12 rounded-xl hover:bg-red-50 transition-all duration-200 group relative"
                        style={{ color: '#EF4444' }}
                    >
                        <div className={`flex items-center justify-center transition-all duration-300 ${isOpen ? 'pl-4 w-12' : 'w-full'}`}>
                            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className={`font-bold whitespace-nowrap transition-all duration-300 text-sm overflow-hidden ${isOpen ? 'opacity-100 ml-3' : 'opacity-0 w-0'
                            }`}>
                            Logout
                        </span>

                        {!isOpen && (
                            <div className="absolute left-full ml-4 px-2 py-1 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl" style={{ backgroundColor: '#EF4444' }}>
                                Logout
                            </div>
                        )}
                    </button>

                    {isOpen && (
                        <div className="mt-4 px-4 pb-2">
                            <p className="text-[10px] text-purple-300/50 uppercase tracking-widest font-bold">SCL Portal v2.0</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
