import { useState } from 'react';
import { Search, Bell, User as UserIcon, LogOut, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Notifications from './Notifications';
import { getRoleContext } from '../utils/roleAccess';
import { useTheme } from '../utils/ThemeContext';

const Navbar = ({ user, onLogout }) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const roleContext = getRoleContext(user);
    const profilePath = roleContext.canAccessManagementPortal || roleContext.hasTeaching
        ? '/settings'
        : '/student/profile';

    const handleMenuBlur = (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsUserMenuOpen(false);
        }
    };

    return (
        <header className="h-20 bg-white dark:bg-gray-900 border-b dark:border-gray-700 sticky top-0 z-40 px-8 flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex-1 max-w-xl flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3">
                    <span className="uppercase text-lg font-bold tracking-widest" style={{ color: '#1F2937' }}>Stratford College London</span>
                </div>
                <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search resources, students, or data..."
                        className="w-full bg-gray-50 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
                        style={{ borderColor: '#E5E7EB' }}
                    />
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <Link
                    to="/student/notifications"
                    className="relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                >
                    <Notifications />
                </Link>

                {/* Dark / Light toggle */}
                <button
                    onClick={toggleTheme}
                    aria-label="Toggle dark mode"
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {theme === 'dark'
                        ? <Sun className="w-5 h-5 text-yellow-400" />
                        : <Moon className="w-5 h-5" />
                    }
                </button>

                <div className="h-8 w-px bg-gray-100mx-2"></div>

                <div className="flex items-center space-x-4 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
                        <p className="text-[10px] font-bold uppercase mt-1 tracking-wider" style={{ color: '#2563EB' }}>{user.role}</p>
                    </div>
                    <div
                        className="relative"
                        onMouseEnter={() => setIsUserMenuOpen(true)}
                        onMouseLeave={() => setIsUserMenuOpen(false)}
                        onFocus={() => setIsUserMenuOpen(true)}
                        onBlur={handleMenuBlur}
                    >
                        <button
                            type="button"
                            aria-label="User menu"
                            aria-expanded={isUserMenuOpen}
                            className={`w-10 h-10 rounded-lg text-white flex items-center justify-center font-bold shadow-lg transition-transform ${isUserMenuOpen ? 'scale-105' : ''}`}
                            style={{ backgroundColor: '#2563EB', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}
                        >
                            {user.name[0]}
                        </button>

                        {/* Dropdown Placeholder */}
                        <div className={`absolute right-0 top-full pt-2 w-48 transition-all duration-200 z-50 ${isUserMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                            <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-2" style={{ borderColor: '#E5E7EB' }}>
                            <Link
                                to={profilePath}
                                onClick={() => setIsUserMenuOpen(false)}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <UserIcon className="w-4 h-4" />
                                <span>Profile Settings</span>
                            </Link>
                            <button
                                onClick={() => {
                                    setIsUserMenuOpen(false);
                                    onLogout();
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;

