import { Search, Bell, User as UserIcon, LogOut } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
    return (
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-8 flex items-center justify-between">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-scl-purple transition-colors" />
                    <input
                        type="text"
                        placeholder="Search resources, students, or data..."
                        className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-scl-purple/20 transition-all placeholder:text-gray-400"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <button className="relative p-2 text-gray-400 hover:text-scl-purple hover:bg-purple-50 rounded-xl transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-100mx-2"></div>

                <div className="flex items-center space-x-4 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
                        <p className="text-[10px] text-scl-purple font-bold uppercase mt-1 tracking-wider">{user.role}</p>
                    </div>
                    <div className="relative group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-scl-purple text-white flex items-center justify-center font-bold shadow-lg shadow-scl-purple/20 group-hover:scale-105 transition-transform">
                            {user.name[0]}
                        </div>

                        {/* Dropdown Placeholder */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                            <button className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                                <UserIcon className="w-4 h-4" />
                                <span>Profile Settings</span>
                            </button>
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
