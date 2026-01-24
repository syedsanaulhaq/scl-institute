import {
    LayoutDashboard,
    GraduationCap,
    Users,
    Settings,
    ChevronLeft,
    Menu,
    ShieldCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, toggle, activePath = '/' }) => {
    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Access LMS', icon: GraduationCap, path: '/lms' },
        { name: 'Users', icon: Users, path: '/users' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 bg-scl-dark text-white transition-all duration-300 ease-in-out shadow-2xl ${isOpen ? 'w-64' : 'w-20'
                }`}
        >
            <div className="flex flex-col h-full">
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                    <div className={`flex items-center space-x-3 overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                        <div className="bg-white text-scl-purple p-1.5 rounded-lg">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight whitespace-nowrap">SCL INST</span>
                    </div>
                    <button
                        onClick={toggle}
                        className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${!isOpen ? 'mx-auto' : ''}`}
                    >
                        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-3 py-6 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = activePath === item.path;
                        return (
                            <button
                                key={item.name}
                                className={`w-full flex items-center h-12 rounded-xl transition-all duration-200 group relative ${isActive
                                        ? 'bg-scl-purple text-white shadow-lg shadow-scl-purple/20'
                                        : 'text-purple-100/70 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className={`flex items-center justify-center transition-all duration-300 ${isOpen ? 'pl-4 w-12' : 'w-full'}`}>
                                    <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} />
                                </div>
                                <span className={`font-medium whitespace-nowrap transition-all duration-300 text-sm overflow-hidden ${isOpen ? 'opacity-100 ml-3' : 'opacity-0 w-0'
                                    }`}>
                                    {item.name}
                                </span>

                                {!isOpen && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-scl-dark text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
                                        {item.name}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Info */}
                <div className={`p-6 border-t border-white/10 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                    <p className="text-[10px] text-purple-300 uppercase tracking-widest font-bold">Admin Portal v1.0</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
